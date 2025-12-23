import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useFinanceStore } from '../../store/financeStore';
import type { Income } from '../../types';

export function IncomeStep() {
  const { incomes, addIncome, removeIncome, profile } = useFinanceStore();

  const [newIncome, setNewIncome] = useState<Partial<Income>>({
    source: '',
    monthlyAmount: 0,
    isVariable: false,
    startMonth: 0,
    endMonth: 12,
    taxRate: 15,
  });

  // Form state for hourly calculation
  const [useHourlyCalc, setUseHourlyCalc] = useState(true);
  const [hourlyWage, setHourlyWage] = useState(20);
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [weeksPerMonth, setWeeksPerMonth] = useState(4);

  const programLengthMonths = profile?.programLength || 48;

  const calculateMonthlyFromHourly = () => {
    return hourlyWage * hoursPerWeek * weeksPerMonth;
  };

  const handleAddIncome = () => {
    if (!newIncome.source) {
      alert('Please enter an income source name');
      return;
    }

    const monthlyAmount = useHourlyCalc
      ? calculateMonthlyFromHourly()
      : newIncome.monthlyAmount || 0;

    addIncome({
      id: `income-${Date.now()}`,
      source: newIncome.source,
      monthlyAmount,
      isVariable: newIncome.isVariable || false,
      startMonth: newIncome.startMonth || 0,
      endMonth: newIncome.endMonth || 12,
      taxRate: newIncome.taxRate,
    });

    // Reset form
    setNewIncome({
      source: '',
      monthlyAmount: 0,
      isVariable: false,
      startMonth: 0,
      endMonth: 12,
      taxRate: 15,
    });
    setHourlyWage(20);
    setHoursPerWeek(20);
  };

  const handleQuickAdd = (type: 'part-time' | 'coop') => {
    if (type === 'part-time') {
      setNewIncome({
        ...newIncome,
        source: 'Part-time Job (During School)',
      });
      setHourlyWage(17);
      setHoursPerWeek(15);
      setUseHourlyCalc(true);
    } else {
      setNewIncome({
        ...newIncome,
        source: 'Co-op Term',
      });
      setHourlyWage(25);
      setHoursPerWeek(40);
      setUseHourlyCalc(true);
    }
  };

  const calculateNetMonthly = (gross: number, taxRate?: number) => {
    if (!taxRate) return gross;
    return gross * (1 - taxRate / 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Income Sources</h2>
        <p className="text-gray-600">
          Add your income sources including part-time work and co-op terms
        </p>
      </div>

      {/* Quick Add Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickAdd('part-time')}
        >
          + Part-Time Job
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickAdd('coop')}
        >
          + Co-op Term
        </Button>
      </div>

      {/* Income List */}
      {incomes.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Your Income Sources</h3>
          {incomes.map((income) => {
            const grossMonthly = income.monthlyAmount;
            const netMonthly = calculateNetMonthly(grossMonthly, income.taxRate);

            return (
              <div
                key={income.id}
                className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {income.source}
                    </span>
                    <span className="text-xs px-2 py-1 bg-green-600 text-white rounded">
                      Months {income.startMonth} - {income.endMonth}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    <span className="font-semibold text-green-700">
                      ${netMonthly.toFixed(2)}/month
                    </span>
                    {' '}(after {income.taxRate || 0}% tax)
                    {income.taxRate && (
                      <span className="text-xs ml-2">
                        • Gross: ${grossMonthly.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeIncome(income.id)}
                >
                  Remove
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Income Form */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Add New Income Source</h3>

        <div className="space-y-4">
          {/* Income Source Name */}
          <Input
            label="Income Source Name"
            value={newIncome.source}
            onChange={(e) =>
              setNewIncome({ ...newIncome, source: e.target.value })
            }
            placeholder="e.g., Part-time Retail, Co-op at Tech Company"
          />

          {/* Calculation Method Toggle */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={useHourlyCalc}
                onChange={() => setUseHourlyCalc(true)}
                className="text-blue-600"
              />
              <span className="text-sm font-medium">Calculate from hourly wage</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!useHourlyCalc}
                onChange={() => setUseHourlyCalc(false)}
                className="text-blue-600"
              />
              <span className="text-sm font-medium">Enter monthly amount</span>
            </label>
          </div>

          {/* Hourly Calculation */}
          {useHourlyCalc ? (
            <div className="p-4 bg-blue-50 rounded-lg space-y-4">
              <h4 className="font-semibold text-blue-900">
                Hourly Wage Calculator
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="number"
                  step="0.01"
                  label="Hourly Wage"
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(Number(e.target.value))}
                  leftIcon={<span className="text-gray-500">$</span>}
                />
                <Input
                  type="number"
                  label="Hours per Week"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  helperText="15-20 for part-time, 40 for full-time"
                />
                <Input
                  type="number"
                  step="0.1"
                  label="Weeks per Month"
                  value={weeksPerMonth}
                  onChange={(e) => setWeeksPerMonth(Number(e.target.value))}
                  helperText="Usually 4 or 4.33"
                />
              </div>
              <div className="text-center p-3 bg-white rounded border border-blue-200">
                <span className="text-sm text-gray-600">
                  Calculated Monthly (Gross):{' '}
                </span>
                <span className="text-lg font-bold text-blue-600">
                  ${calculateMonthlyFromHourly().toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <Input
              type="number"
              label="Monthly Amount (Gross)"
              value={newIncome.monthlyAmount}
              onChange={(e) =>
                setNewIncome({
                  ...newIncome,
                  monthlyAmount: Number(e.target.value),
                })
              }
              leftIcon={<span className="text-gray-500">$</span>}
            />
          )}

          {/* Time Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              label="Start Month"
              value={newIncome.startMonth}
              onChange={(e) =>
                setNewIncome({ ...newIncome, startMonth: Number(e.target.value) })
              }
              helperText="0 = first month of program"
              min={0}
              max={programLengthMonths}
            />
            <Input
              type="number"
              label="End Month"
              value={newIncome.endMonth}
              onChange={(e) =>
                setNewIncome({ ...newIncome, endMonth: Number(e.target.value) })
              }
              helperText={`Max: ${programLengthMonths} months`}
              min={0}
              max={programLengthMonths}
            />
          </div>

          {/* Tax Rate */}
          <Input
            type="number"
            step="0.1"
            label="Tax Rate (%)"
            value={newIncome.taxRate}
            onChange={(e) =>
              setNewIncome({ ...newIncome, taxRate: Number(e.target.value) })
            }
            helperText="Estimated tax deduction (15-25% typical for students)"
            rightIcon={<span className="text-gray-500">%</span>}
          />

          {/* Variable Income Toggle */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newIncome.isVariable}
              onChange={(e) =>
                setNewIncome({ ...newIncome, isVariable: e.target.checked })
              }
              className="rounded text-blue-600"
            />
            <span className="text-sm">Variable income (hours may fluctuate)</span>
          </label>

          <Button onClick={handleAddIncome} fullWidth>
            Add Income Source
          </Button>
        </div>
      </div>

      {/* Total Income Summary */}
      {incomes.length > 0 && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-center">
            <span className="text-sm text-gray-600 block mb-1">
              Total Monthly Income (when all sources active)
            </span>
            <span className="text-2xl font-bold text-green-600">
              $
              {incomes
                .reduce(
                  (sum, inc) =>
                    sum + calculateNetMonthly(inc.monthlyAmount, inc.taxRate),
                  0
                )
                .toFixed(2)}
            </span>
            <span className="text-xs text-gray-500 block mt-1">
              (after tax, varies by month based on active periods)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
