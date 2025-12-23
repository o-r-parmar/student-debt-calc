import { useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useFinanceStore } from '../../store/financeStore';
import { optimizePaymentPlan } from '../../lib/calculations/optimization';
import { formatCurrency, formatDate } from '../../lib/utils/dateUtils';

export function Dashboard() {
  const {
    profile,
    loc,
    loans,
    scholarships,
    incomes,
    expenses,
    optimizationConfig,
    currentResult,
    setCurrentResult,
    setIsCalculating,
  } = useFinanceStore();

  const handleCalculate = () => {
    if (!profile || !loc) {
      alert('Please complete the setup wizard first');
      return;
    }

    setIsCalculating(true);

    setTimeout(() => {
      const result = optimizePaymentPlan(
        profile,
        loc,
        loans,
        scholarships,
        incomes,
        expenses,
        optimizationConfig
      );

      setCurrentResult(result);
      setIsCalculating(false);
    }, 100);
  };

  // Auto-calculate on mount if data exists
  useEffect(() => {
    if (profile && loc && !currentResult) {
      handleCalculate();
    }
  }, []);

  if (!currentResult) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No Results Yet</h2>
            <p className="text-gray-600 mb-6">
              Complete the setup wizard or click calculate to see your optimized payment plan
            </p>
            <Button onClick={handleCalculate}>Calculate Plan</Button>
          </div>
        </Card>
      </div>
    );
  }

  const lastMonth = currentResult.monthlyPlan[currentResult.monthlyPlan.length - 1];
  const currentLocBalance = currentResult.monthlyPlan[0]?.locBalance || 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Student Finance Dashboard
        </h1>
        <Button onClick={handleCalculate}>Recalculate</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Debt</CardTitle>
          </CardHeader>
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(lastMonth?.totalDebt || 0)}
          </div>
          <p className="text-sm text-gray-500 mt-2">Current total debt</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LOC Balance</CardTitle>
          </CardHeader>
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(currentLocBalance)}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Limit: {formatCurrency(loc?.creditLimit || 0)}
          </p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Interest</CardTitle>
          </CardHeader>
          <div className="text-3xl font-bold text-red-600">
            {formatCurrency(currentResult.totalInterestPaid)}
          </div>
          <p className="text-sm text-gray-500 mt-2">Projected total</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payoff Date</CardTitle>
          </CardHeader>
          <div className="text-2xl font-bold text-green-600">
            {formatDate(currentResult.projectedPayoffDate)}
          </div>
          <p className="text-sm text-gray-500 mt-2">Estimated completion</p>
        </Card>
      </div>

      {/* Savings vs Minimum */}
      {currentResult.interestSavingsVsMinimum > 0 && (
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                Interest Savings
              </h3>
              <p className="text-sm text-green-700">
                Compared to minimum payment strategy
              </p>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(currentResult.interestSavingsVsMinimum)}
            </div>
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {currentResult.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {currentResult.recommendations.slice(0, 5).map((rec) => (
              <div
                key={rec.id}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.priority === 'high'
                    ? 'bg-red-50 border-red-500'
                    : rec.priority === 'medium'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                <p className="text-sm text-gray-700 mt-1">{rec.description}</p>
                {rec.potentialSavings && (
                  <p className="text-sm font-medium text-green-600 mt-2">
                    Potential savings: {formatCurrency(rec.potentialSavings)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Monthly Plan Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Payment Plan</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Month</th>
                <th className="text-right py-2 px-4">Income</th>
                <th className="text-right py-2 px-4">Expenses</th>
                <th className="text-right py-2 px-4">Net Cash</th>
                <th className="text-right py-2 px-4">LOC Payment</th>
                <th className="text-right py-2 px-4">LOC Balance</th>
                <th className="text-right py-2 px-4">Interest</th>
              </tr>
            </thead>
            <tbody>
              {currentResult.monthlyPlan.slice(0, 24).map((month) => (
                <tr key={month.monthIndex} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{month.monthLabel}</td>
                  <td className="text-right py-2 px-4 text-green-600">
                    {formatCurrency(month.totalIncome)}
                  </td>
                  <td className="text-right py-2 px-4 text-red-600">
                    {formatCurrency(month.totalExpenses)}
                  </td>
                  <td
                    className={`text-right py-2 px-4 ${
                      month.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(month.netCashFlow)}
                  </td>
                  <td className="text-right py-2 px-4">
                    {formatCurrency(month.locPayment)}
                  </td>
                  <td className="text-right py-2 px-4 font-semibold">
                    {formatCurrency(month.locBalance)}
                  </td>
                  <td className="text-right py-2 px-4 text-orange-600">
                    {formatCurrency(month.locInterestAccrued)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {currentResult.monthlyPlan.length > 24 && (
          <p className="text-sm text-gray-500 mt-4 text-center">
            Showing first 24 months of {currentResult.monthlyPlan.length} total months
          </p>
        )}
      </Card>
    </div>
  );
}
