import type { ValidationError, LineOfCredit, Expense, Income } from '../../types';

export function validateLOC(loc: Partial<LineOfCredit>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!loc.creditLimit || loc.creditLimit < 1000 || loc.creditLimit > 200000) {
    errors.push({
      field: 'creditLimit',
      message: 'Credit limit must be between $1,000 and $200,000',
    });
  }

  if (loc.currentBalance !== undefined && loc.currentBalance < 0) {
    errors.push({
      field: 'currentBalance',
      message: 'Current balance cannot be negative',
    });
  }

  if (
    loc.currentBalance !== undefined &&
    loc.creditLimit !== undefined &&
    loc.currentBalance > loc.creditLimit
  ) {
    errors.push({
      field: 'currentBalance',
      message: 'Current balance cannot exceed credit limit',
    });
  }

  if (
    !loc.annualInterestRate ||
    loc.annualInterestRate < 0 ||
    loc.annualInterestRate > 30
  ) {
    errors.push({
      field: 'annualInterestRate',
      message: 'Interest rate must be between 0% and 30%',
    });
  }

  if (!loc.primeRate || loc.primeRate < 0 || loc.primeRate > 20) {
    errors.push({
      field: 'primeRate',
      message: 'Prime rate must be between 0% and 20%',
    });
  }

  return errors;
}

export function validateExpense(expense: Partial<Expense>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!expense.name || expense.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Expense name is required',
    });
  }

  if (!expense.amount || expense.amount < 0 || expense.amount > 50000) {
    errors.push({
      field: 'amount',
      message: 'Expense amount must be between $0 and $50,000',
    });
  }

  if (!expense.category) {
    errors.push({
      field: 'category',
      message: 'Expense category is required',
    });
  }

  return errors;
}

export function validateIncome(income: Partial<Income>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!income.source || income.source.trim() === '') {
    errors.push({
      field: 'source',
      message: 'Income source is required',
    });
  }

  if (!income.monthlyAmount || income.monthlyAmount < 0 || income.monthlyAmount > 50000) {
    errors.push({
      field: 'monthlyAmount',
      message: 'Monthly amount must be between $0 and $50,000',
    });
  }

  if (
    income.startMonth !== undefined &&
    income.endMonth !== undefined &&
    income.startMonth > income.endMonth
  ) {
    errors.push({
      field: 'startMonth',
      message: 'Start month must be before end month',
    });
  }

  if (income.taxRate !== undefined && (income.taxRate < 0 || income.taxRate > 100)) {
    errors.push({
      field: 'taxRate',
      message: 'Tax rate must be between 0% and 100%',
    });
  }

  return errors;
}

export function validateDate(date: Date | undefined, fieldName: string): ValidationError | null {
  if (!date) {
    return {
      field: fieldName,
      message: 'Date is required',
    };
  }

  if (isNaN(date.getTime())) {
    return {
      field: fieldName,
      message: 'Invalid date',
    };
  }

  return null;
}
