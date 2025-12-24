import { useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useFinanceStore } from '../../store/financeStore';
import { optimizePaymentPlan } from '../../lib/calculations/optimization';
import { formatCurrency, formatDate } from '../../lib/utils/dateUtils';
import { getMonthsForYear } from '../../lib/utils/termUtils';

export function YearBasedDashboard() {
  const {
    profile,
    loc,
    loans,
    scholarships,
    incomes,
    expenses,
    currentAssets,
    fundingSources,
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

  // Calculate year-based breakdown
  const totalYears = Math.ceil((profile?.programLength || 48) / 12);
  const yearlyData = Array.from({ length: totalYears }, (_, yearIndex) => {
    const year = yearIndex + 1;
    const monthsInYear = getMonthsForYear(year, profile?.programLength || 48);

    const yearData = monthsInYear.map(month =>
      currentResult.monthlyPlan.find(m => m.monthIndex === month)
    ).filter(Boolean);

    const totalIncome = yearData.reduce((sum, m) => sum + (m?.totalIncome || 0), 0);
    const totalExpenses = yearData.reduce((sum, m) => sum + (m?.totalExpenses || 0), 0);
    const gap = totalExpenses - totalIncome;
    const locNeeded = Math.max(0, Math.min(gap, 20000)); // Cap at $20k per year
    const interestPaid = yearData.reduce((sum, m) => sum + (m?.interestPaid || 0), 0);
    const endingBalance = yearData[yearData.length - 1]?.locBalance || 0;

    return {
      year,
      totalIncome,
      totalExpenses,
      gap,
      locNeeded,
      interestPaid,
      endingBalance,
      months: yearData.length,
    };
  });

  const lastMonth = currentResult.monthlyPlan[currentResult.monthlyPlan.length - 1];
  const currentLocBalance = currentResult.monthlyPlan[0]?.locBalance || 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Student Finance Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Year-by-year financial breakdown</p>
        </div>
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

      {/* Current Assets Summary */}
      {currentAssets && (
        <Card>
          <CardHeader>
            <CardTitle>Current Assets</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-600">Checking</p>
              <p className="text-lg font-semibold">{formatCurrency(currentAssets.checking)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Savings</p>
              <p className="text-lg font-semibold">{formatCurrency(currentAssets.savings)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">TFSA</p>
              <p className="text-lg font-semibold">{formatCurrency(currentAssets.tfsa)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">RRSP</p>
              <p className="text-lg font-semibold">{formatCurrency(currentAssets.rrsp)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Other</p>
              <p className="text-lg font-semibold">{formatCurrency(currentAssets.other)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Assets</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(
                  currentAssets.checking +
                    currentAssets.savings +
                    currentAssets.tfsa +
                    currentAssets.rrsp +
                    currentAssets.other
                )}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Government Funding Summary */}
      {fundingSources && fundingSources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Government Funding Sources</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {fundingSources.map((funding) => (
              <div
                key={funding.id}
                className={`p-3 rounded-lg ${
                  funding.type === 'grant'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-orange-50 border border-orange-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{funding.name}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          funding.type === 'grant'
                            ? 'bg-green-600 text-white'
                            : 'bg-orange-600 text-white'
                        }`}
                      >
                        {funding.type === 'grant' ? 'GRANT' : 'LOAN'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatCurrency(funding.amount)} per term × {funding.termsApplied.length} terms
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {formatCurrency(funding.amount * funding.termsApplied.length)}
                    </p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-gray-700">Total Grants: </span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(
                    fundingSources
                      .filter((f) => f.type === 'grant')
                      .reduce((sum, f) => sum + f.amount * f.termsApplied.length, 0)
                  )}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Total Loans: </span>
                <span className="text-lg font-bold text-orange-600">
                  {formatCurrency(
                    fundingSources
                      .filter((f) => f.type === 'loan')
                      .reduce((sum, f) => sum + f.amount * f.termsApplied.length, 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Year-by-Year Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Year-by-Year Breakdown with Gap Analysis</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Year</th>
                <th className="text-right py-3 px-4 font-semibold">Income</th>
                <th className="text-right py-3 px-4 font-semibold">Expenses</th>
                <th className="text-right py-3 px-4 font-semibold">Gap</th>
                <th className="text-right py-3 px-4 font-semibold">LOC Needed</th>
                <th className="text-right py-3 px-4 font-semibold">Interest Paid</th>
                <th className="text-right py-3 px-4 font-semibold">Year-End Balance</th>
              </tr>
            </thead>
            <tbody>
              {yearlyData.map((year) => (
                <tr key={year.year} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-semibold">Year {year.year}</span>
                    <span className="text-xs text-gray-500 block">
                      ({year.months} months)
                    </span>
                  </td>
                  <td className="text-right py-3 px-4 text-green-600 font-medium">
                    {formatCurrency(year.totalIncome)}
                  </td>
                  <td className="text-right py-3 px-4 text-red-600 font-medium">
                    {formatCurrency(year.totalExpenses)}
                  </td>
                  <td className={`text-right py-3 px-4 font-semibold ${
                    year.gap > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {year.gap > 0 ? '-' : '+'}{formatCurrency(Math.abs(year.gap))}
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className={`font-semibold ${
                      year.locNeeded >= 20000 ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {formatCurrency(year.locNeeded)}
                    </span>
                    {year.locNeeded >= 20000 && (
                      <span className="block text-xs text-red-600">⚠️ At cap</span>
                    )}
                  </td>
                  <td className="text-right py-3 px-4 text-orange-600">
                    {formatCurrency(year.interestPaid)}
                  </td>
                  <td className="text-right py-3 px-4 font-semibold">
                    {formatCurrency(year.endingBalance)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="py-3 px-4">TOTAL</td>
                <td className="text-right py-3 px-4 text-green-600">
                  {formatCurrency(yearlyData.reduce((s, y) => s + y.totalIncome, 0))}
                </td>
                <td className="text-right py-3 px-4 text-red-600">
                  {formatCurrency(yearlyData.reduce((s, y) => s + y.totalExpenses, 0))}
                </td>
                <td className="text-right py-3 px-4">
                  {formatCurrency(yearlyData.reduce((s, y) => s + y.gap, 0))}
                </td>
                <td className="text-right py-3 px-4 text-orange-600">
                  {formatCurrency(yearlyData.reduce((s, y) => s + y.locNeeded, 0))}
                </td>
                <td className="text-right py-3 px-4 text-orange-600">
                  {formatCurrency(yearlyData.reduce((s, y) => s + y.interestPaid, 0))}
                </td>
                <td className="text-right py-3 px-4">
                  {formatCurrency(yearlyData[yearlyData.length - 1]?.endingBalance || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Gap Analysis Warning */}
      {yearlyData.some(y => y.locNeeded >= 20000) && (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-red-900 mb-2">
                LOC Cap Reached
              </h3>
              <p className="text-sm text-red-800">
                One or more years require the maximum $20,000 LOC amount. Consider:
              </p>
              <ul className="text-sm text-red-800 mt-2 space-y-1">
                <li>• Increasing part-time or co-op income</li>
                <li>• Reducing discretionary expenses</li>
                <li>• Applying for additional scholarships or grants</li>
                <li>• Using current assets to cover some costs</li>
              </ul>
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
    </div>
  );
}
