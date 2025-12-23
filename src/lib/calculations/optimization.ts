import type {
  OptimizationConfig,
  OptimizationResult,
  MonthlySnapshot,
  LineOfCredit,
  GovernmentLoan,
  Scholarship,
  Income,
  Expense,
  UserProfile,
  Recommendation,
} from '../../types';
import { calculateLOCInterest, calculateMinimumPayment } from './interest';
import { calculateMonthlyIncome, calculateMonthlyExpenses, calculateAverageMonthlyExpenses } from './cashflow';
import { getMonthLabel, addMonthsToDate } from '../utils/dateUtils';

/**
 * Main optimization function
 * Calculates the optimal payment plan to minimize total interest paid
 */
export function optimizePaymentPlan(
  profile: UserProfile,
  loc: LineOfCredit,
  loans: GovernmentLoan[],
  scholarships: Scholarship[],
  incomes: Income[],
  expenses: Expense[],
  config: OptimizationConfig,
  startDate: Date = new Date()
): OptimizationResult {
  const monthlySnapshots: MonthlySnapshot[] = [];
  let currentLocBalance = loc.currentBalance;
  let cumulativeInterestPaid = 0;
  let cumulativePrincipalPaid = 0;

  // Calculate emergency buffer amount
  const avgMonthlyExpenses = calculateAverageMonthlyExpenses(expenses, profile);
  const emergencyBuffer = avgMonthlyExpenses * config.emergencyBufferMonths;

  // Track government loan balances
  const loanBalances: Record<string, number> = {};
  loans.forEach((loan) => {
    loanBalances[loan.id] = loan.principalAmount;
  });

  // Calculate for each month
  for (let monthIndex = 0; monthIndex < config.maxProjectionMonths; monthIndex++) {
    // 1. Calculate this month's income
    const incomeData = calculateMonthlyIncome(
      monthIndex,
      scholarships,
      incomes,
      loans,
      startDate
    );

    // 2. Calculate this month's expenses
    const expenseData = calculateMonthlyExpenses(monthIndex, expenses, profile);

    // 3. Calculate interest on current LOC balance
    const interestThisMonth = calculateLOCInterest(
      currentLocBalance,
      loc,
      monthIndex,
      startDate
    );

    // 4. Add interest to balance
    currentLocBalance += interestThisMonth;

    // 5. Determine net cash position
    const netCash = incomeData.total - expenseData.total;

    // 6. Apply optimization strategy
    let locPayment = 0;
    let locDrawdown = 0;
    let interestPaid = 0;
    let principalPaid = 0;

    if (netCash > 0) {
      // Surplus: pay down LOC based on strategy
      locPayment = calculateOptimalPayment(
        netCash,
        currentLocBalance,
        emergencyBuffer,
        config
      );

      // Split payment into interest and principal
      interestPaid = Math.min(locPayment, interestThisMonth);
      principalPaid = locPayment - interestPaid;

      currentLocBalance -= locPayment;
      cumulativeInterestPaid += interestPaid;
      cumulativePrincipalPaid += principalPaid;
    } else {
      // Deficit: need to draw from LOC
      locDrawdown = Math.abs(netCash);

      // Check if within credit limit
      if (currentLocBalance + locDrawdown > loc.creditLimit) {
        // Will exceed credit limit - this is a problem
        locDrawdown = Math.max(0, loc.creditLimit - currentLocBalance);
      }

      currentLocBalance += locDrawdown;
    }

    // 7. Store snapshot
    monthlySnapshots.push({
      monthIndex,
      monthLabel: getMonthLabel(monthIndex, startDate),
      locBalance: currentLocBalance,
      locInterestAccrued: interestThisMonth,
      governmentLoanBalances: { ...loanBalances },
      totalIncome: incomeData.total,
      totalExpenses: expenseData.total,
      netCashFlow: netCash,
      locDrawdown,
      locPayment,
      interestPaid,
      principalPaid,
      cumulativeInterestPaid,
      cumulativePrincipalPaid,
      totalDebt: currentLocBalance + Object.values(loanBalances).reduce((a, b) => a + b, 0),
      incomeBreakdown: incomeData.breakdown,
      expenseBreakdown: expenseData.breakdown,
    });

    // 8. Check if debt is paid off
    if (currentLocBalance <= 0 && Object.values(loanBalances).every((b) => b <= 0)) {
      break;
    }
  }

  // Calculate projected payoff date
  const lastMonth = monthlySnapshots[monthlySnapshots.length - 1];
  const projectedPayoffDate = addMonthsToDate(startDate, lastMonth.monthIndex);

  // Generate recommendations
  const recommendations = generateRecommendations(
    monthlySnapshots,
    config,
    loc,
    expenses
  );

  // Calculate interest savings vs minimum payment strategy
  const minimumResult = calculateMinimumPaymentScenario(
    profile,
    loc,
    loans,
    scholarships,
    incomes,
    expenses,
    startDate
  );

  return {
    strategy: config.strategy,
    monthlyPlan: monthlySnapshots,
    totalInterestPaid: cumulativeInterestPaid,
    totalPrincipalRepaid: cumulativePrincipalPaid,
    projectedPayoffDate,
    interestSavingsVsMinimum: minimumResult.totalInterestPaid - cumulativeInterestPaid,
    recommendations,
  };
}

/**
 * Calculate optimal payment amount based on strategy
 */
function calculateOptimalPayment(
  availableCash: number,
  currentBalance: number,
  emergencyBuffer: number,
  config: OptimizationConfig
): number {
  if (currentBalance <= 0) return 0;

  switch (config.strategy) {
    case 'aggressive':
      // Pay all available cash to LOC
      return Math.min(availableCash, currentBalance);

    case 'balanced':
      // Keep emergency buffer, pay the rest
      const availableAfterBuffer = Math.max(0, availableCash - emergencyBuffer);
      return Math.min(availableAfterBuffer, currentBalance);

    case 'minimum':
      // Pay minimum only (will be calculated elsewhere)
      return 0;

    default:
      return 0;
  }
}

/**
 * Calculate minimum payment scenario for comparison
 */
function calculateMinimumPaymentScenario(
  profile: UserProfile,
  loc: LineOfCredit,
  loans: GovernmentLoan[],
  scholarships: Scholarship[],
  incomes: Income[],
  expenses: Expense[],
  startDate: Date
): { totalInterestPaid: number } {
  let currentBalance = loc.currentBalance;
  let totalInterest = 0;

  const config: OptimizationConfig = {
    strategy: 'minimum',
    emergencyBufferMonths: 0,
    allowDiscretionaryCuts: false,
    prioritizeHighInterest: false,
    maxProjectionMonths: 120,
  };

  for (let monthIndex = 0; monthIndex < config.maxProjectionMonths; monthIndex++) {
    const incomeData = calculateMonthlyIncome(monthIndex, scholarships, incomes, loans, startDate);
    const expenseData = calculateMonthlyExpenses(monthIndex, expenses, profile);
    const interestThisMonth = calculateLOCInterest(currentBalance, loc, monthIndex, startDate);

    currentBalance += interestThisMonth;
    const netCash = incomeData.total - expenseData.total;

    if (netCash > 0) {
      // Pay minimum payment only
      const minimumPayment = calculateMinimumPayment(currentBalance, interestThisMonth, loc);
      const actualPayment = Math.min(minimumPayment, currentBalance);
      const interestPaid = Math.min(actualPayment, interestThisMonth);

      totalInterest += interestPaid;
      currentBalance -= actualPayment;
    } else {
      const drawdown = Math.abs(netCash);
      currentBalance += drawdown;
    }

    if (currentBalance <= 0) break;
  }

  return { totalInterestPaid: totalInterest };
}

/**
 * Generate smart recommendations based on analysis
 */
function generateRecommendations(
  snapshots: MonthlySnapshot[],
  config: OptimizationConfig,
  loc: LineOfCredit,
  expenses: Expense[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // 1. Identify months approaching credit limit
  snapshots.forEach((snapshot, index) => {
    const utilizationRate = (snapshot.locBalance / loc.creditLimit) * 100;

    if (utilizationRate > 90) {
      recommendations.push({
        id: `credit-limit-${index}`,
        priority: 'high',
        category: 'payment',
        title: `Credit limit warning in ${snapshot.monthLabel}`,
        description: `Your LOC balance will reach ${utilizationRate.toFixed(
          1
        )}% of your credit limit. Consider reducing expenses or increasing income.`,
        monthIndex: snapshot.monthIndex,
      });
    }
  });

  // 2. Identify high-impact payment months
  for (let i = 1; i < snapshots.length; i++) {
    const currentInterest = snapshots[i].locInterestAccrued;
    const previousInterest = snapshots[i - 1].locInterestAccrued;
    const interestSpike = currentInterest - previousInterest;

    if (interestSpike > 50 && snapshots[i - 1].netCashFlow > 100) {
      recommendations.push({
        id: `interest-spike-${i}`,
        priority: 'medium',
        category: 'payment',
        title: `Extra payment opportunity in ${snapshots[i - 1].monthLabel}`,
        description: `Paying an extra $${Math.ceil(
          interestSpike * 10
        )} this month could prevent a $${interestSpike.toFixed(
          2
        )} interest spike next month.`,
        potentialSavings: interestSpike,
        monthIndex: snapshots[i - 1].monthIndex,
      });
    }
  }

  // 3. Expense optimization suggestions
  const discretionaryExpenses = expenses.filter((e) => e.priority === 'discretionary');
  const totalDiscretionary = discretionaryExpenses.reduce((sum, e) => {
    if (e.frequency === 'monthly') return sum + e.amount;
    if (e.frequency === 'semester') return sum + e.amount / 4;
    return sum;
  }, 0);

  if (totalDiscretionary > 200 && config.allowDiscretionaryCuts) {
    const potentialSavings = totalDiscretionary * 0.3; // 30% reduction
    const interestSavings = potentialSavings * 0.072 * 12; // Rough estimate

    recommendations.push({
      id: 'expense-reduction',
      priority: 'medium',
      category: 'expense',
      title: 'Reduce discretionary spending',
      description: `Reducing discretionary expenses by 30% ($${potentialSavings.toFixed(
        2
      )}/month) could save approximately $${interestSavings.toFixed(2)} in interest over a year.`,
      potentialSavings: interestSavings,
    });
  }

  // 4. Income optimization
  const hasCoopTerms = snapshots.some((s) => s.incomeBreakdown.work > 2000);
  if (!hasCoopTerms) {
    recommendations.push({
      id: 'income-increase',
      priority: 'low',
      category: 'income',
      title: 'Consider co-op or summer work',
      description:
        'Adding a co-op term or summer job earning $3,000-$5,000 could significantly reduce your total interest paid.',
      potentialSavings: 1500,
    });
  }

  // 5. Timing recommendations for scholarships
  const hasLargeScholarships = snapshots.some((s) => s.incomeBreakdown.scholarships > 3000);
  if (hasLargeScholarships) {
    recommendations.push({
      id: 'scholarship-timing',
      priority: 'high',
      category: 'timing',
      title: 'Apply scholarship funds immediately to LOC',
      description:
        'When you receive scholarship funds, apply them to your LOC immediately rather than holding them to minimize interest accumulation.',
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations.slice(0, 10); // Return top 10 recommendations
}
