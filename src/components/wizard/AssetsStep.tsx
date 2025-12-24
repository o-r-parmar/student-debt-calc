import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface CurrentAssets {
  checking: number;
  savings: number;
  tfsa: number;
  rrsp: number;
  other: number;
}

interface AssetsStepProps {
  onContinue: (assets: CurrentAssets) => void;
  initialAssets?: CurrentAssets;
}

export function AssetsStep({ onContinue, initialAssets }: AssetsStepProps) {
  const [assets, setAssets] = useState<CurrentAssets>(
    initialAssets || {
      checking: 0,
      savings: 0,
      tfsa: 0,
      rrsp: 0,
      other: 0,
    }
  );

  const totalAssets =
    assets.checking + assets.savings + assets.tfsa + assets.rrsp + assets.other;

  const handleContinue = () => {
    onContinue(assets);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Current Assets
        </h2>
        <p className="text-gray-600">
          Enter your current savings and investments. These funds can help reduce how much you need to borrow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="number"
          step="0.01"
          label="Checking Account"
          value={assets.checking}
          onChange={(e) =>
            setAssets({ ...assets, checking: Number(e.target.value) })
          }
          tooltip="Money in your everyday checking account that's available immediately"
          leftIcon={<span className="text-gray-500">$</span>}
        />
        <Input
          type="number"
          step="0.01"
          label="Savings Account"
          value={assets.savings}
          onChange={(e) =>
            setAssets({ ...assets, savings: Number(e.target.value) })
          }
          tooltip="Money in your savings account. This should be kept as an emergency fund."
          leftIcon={<span className="text-gray-500">$</span>}
        />
        <Input
          type="number"
          step="0.01"
          label="TFSA (Tax-Free Savings Account)"
          value={assets.tfsa}
          onChange={(e) =>
            setAssets({ ...assets, tfsa: Number(e.target.value) })
          }
          tooltip="Tax-Free Savings Account balance. Consider keeping this invested for long-term growth rather than using it for school."
          leftIcon={<span className="text-gray-500">$</span>}
        />
        <Input
          type="number"
          step="0.01"
          label="RRSP (Registered Retirement Savings)"
          value={assets.rrsp}
          onChange={(e) =>
            setAssets({ ...assets, rrsp: Number(e.target.value) })
          }
          tooltip="RRSP balance. Generally not recommended to withdraw for school due to tax implications and withdrawal penalties."
          leftIcon={<span className="text-gray-500">$</span>}
        />
        <Input
          type="number"
          step="0.01"
          label="Other Assets"
          value={assets.other}
          onChange={(e) =>
            setAssets({ ...assets, other: Number(e.target.value) })
          }
          helperText="GICs, investments, cash, etc."
          leftIcon={<span className="text-gray-500">$</span>}
        />
      </div>

      {/* Total Assets Summary */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <div className="text-center">
          <span className="text-sm text-gray-600 block mb-1">
            Total Current Assets
          </span>
          <span className="text-3xl font-bold text-green-600">
            ${totalAssets.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <p className="text-xs text-gray-600 mt-2">
            These funds can reduce your borrowing needs
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Recommendations</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Keep 3-6 months of expenses in your checking/savings as an emergency fund</li>
          <li>• TFSA can be used tax-free but consider keeping it invested</li>
          <li>• RRSP withdrawals are taxable and may have penalties - avoid if possible</li>
          <li>• Using savings can reduce LOC interest, but don't deplete your safety net</li>
        </ul>
      </div>

      <Button onClick={handleContinue} fullWidth>
        Continue to Program Details
      </Button>
    </div>
  );
}
