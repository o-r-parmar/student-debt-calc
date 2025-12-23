import { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useFinanceStore } from '../../store/financeStore';
import { CURRENT_PRIME_RATE, DEFAULT_LOC_PRIME_PLUS } from '../../lib/utils/constants';

export function LOCStep() {
  const { loc, setLOC } = useFinanceStore();

  const [creditLimit, setCreditLimit] = useState(loc?.creditLimit || 80000);
  const [currentBalance, setCurrentBalance] = useState(loc?.currentBalance || 0);
  const [primeRate, setPrimeRate] = useState(loc?.primeRate || CURRENT_PRIME_RATE);
  const [primePlus, setPrimePlus] = useState(
    loc?.annualInterestRate
      ? loc.annualInterestRate - loc.primeRate
      : DEFAULT_LOC_PRIME_PLUS
  );
  const [interestCalculation, setInterestCalculation] = useState<'daily' | 'monthly'>(
    loc?.interestCalculation || 'daily'
  );
  const [minimumPayment, setMinimumPayment] = useState<
    'interestOnly' | 'percentage' | 'fixed'
  >(loc?.minimumPayment || 'interestOnly');
  const [minimumPaymentValue, setMinimumPaymentValue] = useState(
    loc?.minimumPaymentValue || 0
  );
  const [gracePeriodMonths, setGracePeriodMonths] = useState(
    loc?.gracePeriodMonths || 12
  );

  const totalInterestRate = primeRate + primePlus;

  const handleSave = () => {
    setLOC({
      creditLimit,
      currentBalance,
      annualInterestRate: totalInterestRate,
      primeRate,
      interestCalculation,
      minimumPayment,
      minimumPaymentValue,
      gracePeriodMonths,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Line of Credit Details
        </h2>
        <p className="text-gray-600">
          Enter your student line of credit information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="number"
          label="Credit Limit"
          value={creditLimit}
          onChange={(e) => setCreditLimit(Number(e.target.value))}
          helperText="Maximum amount you can borrow"
          leftIcon={<span className="text-gray-500">$</span>}
        />
        <Input
          type="number"
          label="Current Balance"
          value={currentBalance}
          onChange={(e) => setCurrentBalance(Number(e.target.value))}
          helperText="Amount currently owed"
          leftIcon={<span className="text-gray-500">$</span>}
        />
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Interest Rate</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="number"
            step="0.01"
            label="Prime Rate"
            value={primeRate}
            onChange={(e) => setPrimeRate(Number(e.target.value))}
            rightIcon={<span className="text-gray-500">%</span>}
          />
          <Input
            type="number"
            step="0.01"
            label="Prime Plus"
            value={primePlus}
            onChange={(e) => setPrimePlus(Number(e.target.value))}
            helperText="Additional rate above prime"
            rightIcon={<span className="text-gray-500">%</span>}
          />
        </div>
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-600">Total Interest Rate: </span>
          <span className="text-lg font-bold text-blue-600">
            {totalInterestRate.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Interest Calculation Method"
          value={interestCalculation}
          onChange={(e) =>
            setInterestCalculation(e.target.value as 'daily' | 'monthly')
          }
          options={[
            { value: 'daily', label: 'Daily Compound' },
            { value: 'monthly', label: 'Monthly Compound' },
          ]}
        />
        <Select
          label="Minimum Payment Type"
          value={minimumPayment}
          onChange={(e) =>
            setMinimumPayment(
              e.target.value as 'interestOnly' | 'percentage' | 'fixed'
            )
          }
          options={[
            { value: 'interestOnly', label: 'Interest Only' },
            { value: 'percentage', label: 'Percentage of Balance' },
            { value: 'fixed', label: 'Fixed Amount' },
          ]}
        />
      </div>

      {(minimumPayment === 'percentage' || minimumPayment === 'fixed') && (
        <Input
          type="number"
          label={
            minimumPayment === 'percentage'
              ? 'Minimum Payment Percentage'
              : 'Fixed Payment Amount'
          }
          value={minimumPaymentValue}
          onChange={(e) => setMinimumPaymentValue(Number(e.target.value))}
          rightIcon={
            <span className="text-gray-500">
              {minimumPayment === 'percentage' ? '%' : '$'}
            </span>
          }
        />
      )}

      <Input
        type="number"
        label="Grace Period (Months)"
        value={gracePeriodMonths}
        onChange={(e) => setGracePeriodMonths(Number(e.target.value))}
        helperText="Months after graduation before repayment starts"
      />

      <Button onClick={handleSave} fullWidth>
        Save & Continue
      </Button>
    </div>
  );
}
