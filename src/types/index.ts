// ============ INPUT MODELS ============

export interface LineOfCredit {
  creditLimit: number;
  currentBalance: number;
  annualInterestRate: number;
  primeRate: number;
  interestCalculation: 'daily' | 'monthly';
  minimumPayment: 'interestOnly' | 'percentage' | 'fixed';
  minimumPaymentValue?: number;
  gracePeriodMonths: number;
}

export interface GovernmentLoan {
  id: string;
  loanName: string;
  principalAmount: number;
  annualInterestRate: number;
  gracePeriodMonths: number;
  repaymentAssistanceEligible: boolean;
  expectedDisbursementDate: Date;
  disbursementSchedule: 'lumpSum' | 'perSemester';
}

export interface Scholarship {
  id: string;
  name: string;
  amount: number;
  frequency: 'oneTime' | 'perSemester' | 'monthly' | 'annual';
  startDate: Date;
  endDate?: Date;
  conditions?: string;
}

export interface Income {
  id: string;
  source: string;
  monthlyAmount: number;
  isVariable: boolean;
  startMonth: number;
  endMonth: number;
  taxRate?: number;
}

export type ExpenseCategory =
  | 'tuition'
  | 'housing'
  | 'utilities'
  | 'food'
  | 'groceries'
  | 'dining'
  | 'transportation'
  | 'car_payment'
  | 'car_insurance'
  | 'gas'
  | 'parking'
  | 'textbooks'
  | 'technology'
  | 'health'
  | 'health_insurance'
  | 'dental'
  | 'prescriptions'
  | 'personal'
  | 'entertainment'
  | 'phone'
  | 'internet'
  | 'streaming'
  | 'gym'
  | 'clothing'
  | 'laundry'
  | 'insurance'
  | 'renters_insurance'
  | 'student_fees'
  | 'other';

export type ExpensePriority = 'essential' | 'important' | 'discretionary';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  name: string;
  amount: number;
  frequency: 'monthly' | 'semester' | 'annual' | 'oneTime';
  isFixed: boolean;
  priority: ExpensePriority;
  startMonth?: number;
  endMonth?: number;
}

export interface SemesterInfo {
  id: string;
  name: string;
  startMonth: number;
  endMonth: number;
  tuitionAmount: number;
  isCoop: boolean;
}

export interface UserProfile {
  programLength: number;
  currentMonth: number;
  expectedGraduationDate: Date;
  semesterStructure: SemesterInfo[];
}

// ============ OUTPUT/CALCULATION MODELS ============

export interface MonthlySnapshot {
  monthIndex: number;
  monthLabel: string;

  // Balances
  locBalance: number;
  locInterestAccrued: number;
  governmentLoanBalances: Record<string, number>;

  // Cash flows
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;

  // LOC activity
  locDrawdown: number;
  locPayment: number;
  interestPaid: number;
  principalPaid: number;

  // Cumulative metrics
  cumulativeInterestPaid: number;
  cumulativePrincipalPaid: number;
  totalDebt: number;

  // Breakdown details
  incomeBreakdown: {
    scholarships: number;
    loans: number;
    work: number;
    other: number;
  };
  expenseBreakdown: Record<ExpenseCategory, number>;
}

export type OptimizationStrategy = 'aggressive' | 'balanced' | 'minimum';

export interface OptimizationConfig {
  strategy: OptimizationStrategy;
  emergencyBufferMonths: number;
  allowDiscretionaryCuts: boolean;
  prioritizeHighInterest: boolean;
  maxProjectionMonths: number;
}

export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationCategory = 'payment' | 'timing' | 'expense' | 'income';

export interface Recommendation {
  id: string;
  priority: RecommendationPriority;
  category: RecommendationCategory;
  title: string;
  description: string;
  potentialSavings?: number;
  monthIndex?: number;
}

export interface OptimizationResult {
  strategy: OptimizationStrategy;
  monthlyPlan: MonthlySnapshot[];
  totalInterestPaid: number;
  totalPrincipalRepaid: number;
  projectedPayoffDate: Date;
  interestSavingsVsMinimum: number;
  recommendations: Recommendation[];
}

export interface ScenarioVariation {
  name: string;
  type: 'interestRate' | 'extraPayment' | 'expenseReduction' | 'incomeIncrease';
  value: number;
  description: string;
}

export interface SensitivityReport {
  baseCase: OptimizationResult;
  scenarios: Array<{
    variation: ScenarioVariation;
    result: OptimizationResult;
    delta: {
      totalInterest: number;
      payoffMonths: number;
    };
  }>;
  highestImpactLever: ScenarioVariation;
}

// ============ APPLICATION STATE ============

export interface FinanceState {
  // Input data
  profile: UserProfile | null;
  loc: LineOfCredit | null;
  loans: GovernmentLoan[];
  scholarships: Scholarship[];
  incomes: Income[];
  expenses: Expense[];

  // Calculation results
  optimizationConfig: OptimizationConfig;
  currentResult: OptimizationResult | null;
  scenarios: Array<{
    id: string;
    name: string;
    config: OptimizationConfig;
    result: OptimizationResult;
  }>;

  // UI state
  wizardStep: number;
  isCalculating: boolean;
  lastSaved: Date | null;
}

// ============ WIZARD FORM STATE ============

export interface WizardFormData {
  step1_profile: Partial<UserProfile>;
  step2_loc: Partial<LineOfCredit>;
  step3_loans: GovernmentLoan[];
  step4_scholarships: Scholarship[];
  step5_incomes: Income[];
  step6_expenses: Expense[];
  step7_preferences: Partial<OptimizationConfig>;
}

// ============ UTILITY TYPES ============

export interface ValidationError {
  field: string;
  message: string;
}

export interface CashFlowItem {
  month: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  source: string;
}
