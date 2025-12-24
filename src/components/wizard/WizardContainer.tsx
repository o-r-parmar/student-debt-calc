import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useFinanceStore } from '../../store/financeStore';
import { AssetsStep } from './AssetsStep';
import { ProgramStep } from './ProgramStep';
import { LOCStep } from './LOCStep';
import { ExpensesStep } from './ExpensesStep';
import { IncomeStep } from './IncomeStep';
import { FundingStep } from './FundingStep';

interface WizardContainerProps {
  onComplete: () => void;
}

const WIZARD_STEPS = [
  'Current Assets',
  'Program & Timeline',
  'Line of Credit',
  'Expenses',
  'Income Sources',
  'Government Funding',
];

export function WizardContainer({ onComplete }: WizardContainerProps) {
  const { wizardStep, setWizardStep } = useFinanceStore();

  const handleNext = () => {
    if (wizardStep < WIZARD_STEPS.length - 1) {
      setWizardStep(wizardStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (wizardStep > 0) {
      setWizardStep(wizardStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (wizardStep) {
      case 0:
        return <AssetsStep onContinue={() => handleNext()} />;
      case 1:
        return <ProgramStep />;
      case 2:
        return <LOCStep />;
      case 3:
        return <ExpensesStep />;
      case 4:
        return <IncomeStep />;
      case 5:
        return <FundingStep />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {wizardStep + 1} of {WIZARD_STEPS.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((wizardStep + 1) / WIZARD_STEPS.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((wizardStep + 1) / WIZARD_STEPS.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {WIZARD_STEPS.map((step, index) => (
            <span
              key={step}
              className={`text-xs ${
                index <= wizardStep ? 'text-blue-600 font-medium' : 'text-gray-400'
              }`}
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      {/* Step content */}
      <Card className="mb-6">{renderStepContent()}</Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={wizardStep === 0}
        >
          Previous
        </Button>
        <Button onClick={handleNext}>
          {wizardStep === WIZARD_STEPS.length - 1 ? 'Complete Setup' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
