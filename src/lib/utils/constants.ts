// Canadian-specific constants

export const CURRENT_PRIME_RATE = 5.95; // Bank of Canada prime rate (as of spec)

export const OSAP_GRACE_PERIOD_MONTHS = 6;
export const OSAP_FEDERAL_INTEREST_RATE = 0; // Interest-free during grace
export const OSAP_PROVINCIAL_INTEREST_RATE = CURRENT_PRIME_RATE;

// Tax credits
export const FEDERAL_TUITION_TAX_CREDIT = 0.15; // 15%
export const ONTARIO_TUITION_TAX_CREDIT = 0.0505; // 5.05%
export const STUDENT_LOAN_INTEREST_TAX_CREDIT = 0.15; // 15%

// Repayment assistance
export const REPAYMENT_ASSISTANCE_INCOME_THRESHOLD = 40000; // Annual

// Default values
export const DEFAULT_EMERGENCY_BUFFER_MONTHS = 2;
export const DEFAULT_LOC_PRIME_PLUS = 1.25; // Prime + 1.25%
export const DEFAULT_MAX_PROJECTION_MONTHS = 120; // 10 years

// Expense categories and typical amounts (monthly)
export const DEFAULT_EXPENSE_AMOUNTS: Record<string, number> = {
  tuition: 0, // Per semester, not monthly
  housing: 1200,
  utilities: 100,
  food: 400,
  transportation: 150,
  textbooks: 0, // Per semester
  technology: 50,
  health: 80,
  personal: 100,
  entertainment: 100,
  insurance: 100,
  other: 50,
};

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  tuition: 'Tuition & Fees',
  housing: 'Rent & Housing',
  utilities: 'Utilities',
  food: 'Groceries & Dining',
  transportation: 'Transportation',
  textbooks: 'Textbooks & Materials',
  technology: 'Technology & Software',
  health: 'Health & Wellness',
  personal: 'Personal Care',
  entertainment: 'Entertainment',
  insurance: 'Insurance',
  other: 'Other Expenses',
};
