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
  groceries: 300,
  dining: 100,
  transportation: 150,
  car_payment: 0,
  car_insurance: 150,
  gas: 100,
  parking: 50,
  textbooks: 0, // Per semester
  technology: 50,
  health: 80,
  health_insurance: 100,
  dental: 30,
  prescriptions: 20,
  personal: 100,
  entertainment: 100,
  phone: 60,
  internet: 50,
  streaming: 15,
  gym: 40,
  clothing: 50,
  laundry: 20,
  insurance: 100,
  renters_insurance: 25,
  student_fees: 0, // Per semester
  other: 50,
};

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  tuition: 'Tuition & Fees',
  housing: 'Rent & Housing',
  utilities: 'Utilities (Heat/Water/Electric)',
  food: 'Food (Total)',
  groceries: 'Groceries',
  dining: 'Dining Out / Restaurants',
  transportation: 'Transportation (General)',
  car_payment: 'Car Payment/Lease',
  car_insurance: 'Car Insurance',
  gas: 'Gas & Fuel',
  parking: 'Parking',
  textbooks: 'Textbooks & Course Materials',
  technology: 'Technology & Software',
  health: 'Health & Wellness',
  health_insurance: 'Health Insurance',
  dental: 'Dental Care',
  prescriptions: 'Prescriptions & Medications',
  personal: 'Personal Care',
  entertainment: 'Entertainment & Social',
  phone: 'Cell Phone',
  internet: 'Internet',
  streaming: 'Streaming Services',
  gym: 'Gym Membership',
  clothing: 'Clothing',
  laundry: 'Laundry',
  renters_insurance: 'Renters Insurance',
  student_fees: 'Student Fees & Activities',
  insurance: 'Insurance (Other)',
  other: 'Other Expenses',
};
