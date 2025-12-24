import type {
  Income,
  Expense,
  Scholarship,
  GovernmentLoan,
  UserProfile,
  CashFlowItem,
  ExpenseCategory,
} from '../../types';
import { addMonthsToDate } from '../utils/dateUtils';
import { differenceInMonths } from 'date-fns';

/**
 * Calculate total income for a specific month
 */
export function calculateMonthlyIncome(
  monthIndex: number,
  scholarships: Scholarship[],
  incomes: Income[],
  loans: GovernmentLoan[],
  startDate: Date
): {
  total: number;
  breakdown: {
    scholarships: number;
    loans: number;
    work: number;
    other: number;
  };
} {
  let scholarshipIncome = 0;
  let loanIncome = 0;
  let workIncome = 0;

  const currentDate = addMonthsToDate(startDate, monthIndex);

  // Calculate scholarship income
  scholarships.forEach((scholarship) => {
    const monthsSinceStart = differenceInMonths(currentDate, scholarship.startDate);

    if (monthsSinceStart < 0) return; // Not started yet

    if (scholarship.endDate) {
      const monthsSinceEnd = differenceInMonths(currentDate, scholarship.endDate);
      if (monthsSinceEnd > 0) return; // Already ended
    }

    switch (scholarship.frequency) {
      case 'oneTime':
        if (monthsSinceStart === 0) {
          scholarshipIncome += scholarship.amount;
        }
        break;

      case 'monthly':
        scholarshipIncome += scholarship.amount;
        break;

      case 'perSemester':
        // Assuming semesters are 4 months apart (Fall, Winter, Summer)
        if (monthsSinceStart % 4 === 0) {
          scholarshipIncome += scholarship.amount;
        }
        break;

      case 'annual':
        if (monthsSinceStart % 12 === 0) {
          scholarshipIncome += scholarship.amount;
        }
        break;
    }
  });

  // Calculate loan disbursements
  loans.forEach((loan) => {
    const monthsSinceDisbursement = differenceInMonths(
      currentDate,
      loan.expectedDisbursementDate
    );

    if (monthsSinceDisbursement < 0) return;

    if (loan.disbursementSchedule === 'lumpSum') {
      if (monthsSinceDisbursement === 0) {
        loanIncome += loan.principalAmount;
      }
    } else if (loan.disbursementSchedule === 'perSemester') {
      // Assuming 2 semesters per year, disbursed every 4 months starting from disbursement date
      if (monthsSinceDisbursement % 4 === 0 && monthsSinceDisbursement < 12) {
        // Distribute over 3 disbursements (Fall, Winter, Summer)
        loanIncome += loan.principalAmount / 3;
      }
    }
  });

  // Calculate work income
  incomes.forEach((income) => {
    if (monthIndex >= income.startMonth && monthIndex <= income.endMonth) {
      const netAmount = income.taxRate
        ? income.monthlyAmount * (1 - income.taxRate / 100)
        : income.monthlyAmount;
      workIncome += netAmount;
    }
  });

  return {
    total: scholarshipIncome + loanIncome + workIncome,
    breakdown: {
      scholarships: scholarshipIncome,
      loans: loanIncome,
      work: workIncome,
      other: 0,
    },
  };
}

/**
 * Calculate total expenses for a specific month
 */
export function calculateMonthlyExpenses(
  monthIndex: number,
  expenses: Expense[],
  profile: UserProfile
): {
  total: number;
  breakdown: Record<ExpenseCategory, number>;
} {
  const breakdown: Partial<Record<ExpenseCategory, number>> = {};

  expenses.forEach((expense) => {
    // Check if expense applies to this month
    const startMonth = expense.startMonth ?? 0;
    const endMonth = expense.endMonth ?? profile.programLength;

    if (monthIndex < startMonth || monthIndex > endMonth) {
      return;
    }

    let monthlyAmount = 0;

    switch (expense.frequency) {
      case 'monthly':
        monthlyAmount = expense.amount;
        break;

      case 'semester':
        // Check if this is the first month of a semester
        const semester = profile.semesterStructure.find(
          (s) => s.startMonth === monthIndex
        );
        if (semester) {
          monthlyAmount = expense.amount;
        }
        break;

      case 'annual':
        // Charge in September (assuming month 0 or 12, 24, etc.)
        if (monthIndex % 12 === 0 || monthIndex === 0) {
          monthlyAmount = expense.amount;
        }
        break;

      case 'oneTime':
        // Charge in the start month
        if (monthIndex === startMonth) {
          monthlyAmount = expense.amount;
        }
        break;
    }

    breakdown[expense.category] = (breakdown[expense.category] || 0) + monthlyAmount;
  });

  const total = Object.values(breakdown).reduce((sum, val) => sum + (val || 0), 0);

  return { total, breakdown: breakdown as Record<ExpenseCategory, number> };
}

/**
 * Get all cash flow items for visualization
 */
export function getCashFlowItems(
  monthIndex: number,
  scholarships: Scholarship[],
  incomes: Income[],
  loans: GovernmentLoan[],
  expenses: Expense[],
  profile: UserProfile,
  startDate: Date
): CashFlowItem[] {
  const items: CashFlowItem[] = [];

  // Add income items
  const incomeData = calculateMonthlyIncome(monthIndex, scholarships, incomes, loans, startDate);

  if (incomeData.breakdown.scholarships > 0) {
    items.push({
      month: monthIndex,
      type: 'income',
      category: 'Scholarships',
      amount: incomeData.breakdown.scholarships,
      source: 'scholarships',
    });
  }

  if (incomeData.breakdown.loans > 0) {
    items.push({
      month: monthIndex,
      type: 'income',
      category: 'Loans',
      amount: incomeData.breakdown.loans,
      source: 'loans',
    });
  }

  if (incomeData.breakdown.work > 0) {
    items.push({
      month: monthIndex,
      type: 'income',
      category: 'Work Income',
      amount: incomeData.breakdown.work,
      source: 'work',
    });
  }

  // Add expense items
  const expenseData = calculateMonthlyExpenses(monthIndex, expenses, profile);

  Object.entries(expenseData.breakdown).forEach(([category, amount]) => {
    if (amount > 0) {
      items.push({
        month: monthIndex,
        type: 'expense',
        category,
        amount,
        source: 'expenses',
      });
    }
  });

  return items;
}

/**
 * Calculate net cash flow
 */
export function calculateNetCashFlow(income: number, expenses: number): number {
  return income - expenses;
}

/**
 * Calculate average monthly expenses
 */
export function calculateAverageMonthlyExpenses(
  expenses: Expense[],
  profile: UserProfile,
  months: number = 12
): number {
  let total = 0;

  for (let i = 0; i < months; i++) {
    const { total: monthlyTotal } = calculateMonthlyExpenses(i, expenses, profile);
    total += monthlyTotal;
  }

  return total / months;
}
