import type { LineOfCredit } from '../../types';
import { getDaysInMonthForIndex } from '../utils/dateUtils';

/**
 * Calculate daily compound interest for a given balance
 */
export function calculateDailyInterest(
  balance: number,
  annualRate: number,
  daysInMonth: number
): number {
  if (balance <= 0 || annualRate <= 0) return 0;

  const dailyRate = annualRate / 100 / 365;
  // Using average daily balance method
  return balance * dailyRate * daysInMonth;
}

/**
 * Calculate monthly compound interest for a given balance
 */
export function calculateMonthlyInterest(
  balance: number,
  annualRate: number
): number {
  if (balance <= 0 || annualRate <= 0) return 0;

  const monthlyRate = annualRate / 100 / 12;
  return balance * monthlyRate;
}

/**
 * Calculate interest for LOC based on its configuration
 */
export function calculateLOCInterest(
  balance: number,
  loc: LineOfCredit,
  monthIndex: number,
  startDate: Date
): number {
  if (loc.interestCalculation === 'daily') {
    const daysInMonth = getDaysInMonthForIndex(monthIndex, startDate);
    return calculateDailyInterest(balance, loc.annualInterestRate, daysInMonth);
  } else {
    return calculateMonthlyInterest(balance, loc.annualInterestRate);
  }
}

/**
 * Calculate minimum payment required for LOC
 */
export function calculateMinimumPayment(
  balance: number,
  interestAccrued: number,
  loc: LineOfCredit
): number {
  if (balance <= 0) return 0;

  switch (loc.minimumPayment) {
    case 'interestOnly':
      return interestAccrued;

    case 'percentage':
      const percentageAmount = (balance * (loc.minimumPaymentValue || 0)) / 100;
      return Math.max(percentageAmount, interestAccrued);

    case 'fixed':
      return Math.min(loc.minimumPaymentValue || 0, balance + interestAccrued);

    default:
      return interestAccrued;
  }
}

/**
 * Calculate total interest over a period
 */
export function calculateTotalInterest(
  principal: number,
  annualRate: number,
  months: number,
  monthlyPayment: number = 0
): number {
  let balance = principal;
  let totalInterest = 0;

  for (let i = 0; i < months; i++) {
    const monthlyInterest = calculateMonthlyInterest(balance, annualRate);
    totalInterest += monthlyInterest;
    balance = balance + monthlyInterest - monthlyPayment;

    if (balance <= 0) break;
  }

  return totalInterest;
}

/**
 * Calculate effective annual rate (EAR) from nominal rate
 */
export function calculateEffectiveAnnualRate(
  nominalRate: number,
  compoundingPeriodsPerYear: number
): number {
  return (Math.pow(1 + nominalRate / 100 / compoundingPeriodsPerYear, compoundingPeriodsPerYear) - 1) * 100;
}

/**
 * Calculate APR including fees
 */
export function calculateAPR(
  principal: number,
  totalInterest: number,
  fees: number,
  months: number
): number {
  const totalCost = totalInterest + fees;
  const annualCost = (totalCost / months) * 12;
  return (annualCost / principal) * 100;
}
