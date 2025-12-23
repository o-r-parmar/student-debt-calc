import { addMonths, format, differenceInMonths, getDaysInMonth } from 'date-fns';

export function getMonthLabel(monthIndex: number, startDate: Date): string {
  const date = addMonths(startDate, monthIndex);
  return format(date, 'MMM yyyy');
}

export function getDaysInMonthForIndex(monthIndex: number, startDate: Date): number {
  const date = addMonths(startDate, monthIndex);
  return getDaysInMonth(date);
}

export function getMonthsDifference(start: Date, end: Date): number {
  return differenceInMonths(end, start);
}

export function addMonthsToDate(date: Date, months: number): Date {
  return addMonths(date, months);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatDate(date: Date): string {
  return format(date, 'MMM d, yyyy');
}
