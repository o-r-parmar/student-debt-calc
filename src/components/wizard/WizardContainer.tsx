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

const WIZARD_CATEGORIES = [
  { id: 0, name: 'Current Assets', icon: '💰' },
  { id: 1, name: 'Program & Timeline', icon: '🎓' },
  { id: 2, name: 'Line of Credit', icon: '💳' },
  { id: 3, name: 'Expenses', icon: '💸' },
  { id: 4, name: 'Income Sources', icon: '💵' },
  { id: 5, name: 'Government Funding', icon: '🏛️' },
];

export function WizardContainer({ onComplete }: WizardContainerProps) {
  const { wizardStep, setWizardStep, profile, loc } = useFinanceStore();

  const handleCategoryClick = (categoryId: number) => {
    setWizardStep(categoryId);
  };

  const handleNext = () => {
    if (wizardStep < WIZARD_CATEGORIES.length - 1) {
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

  // Check if a step has basic data (for completion indicators)
  const isStepComplete = (stepId: number): boolean => {
    switch (stepId) {
      case 0: return true; // Assets is optional
      case 1: return profile !== null;
      case 2: return loc !== null;
      case 3: return true; // Expenses handled in step
      case 4: return true; // Income handled in step
      case 5: return true; // Funding is optional
      default: return false;
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Setup Categories</h3>
              <nav className="space-y-2">
                {WIZARD_CATEGORIES.map((category) => {
                  const isActive = wizardStep === category.id;
                  const isComplete = isStepComplete(category.id);

                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : isComplete
                          ? 'bg-green-50 text-green-900 hover:bg-green-100'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{category.icon}</span>
                          <div>
                            <div className="font-medium text-sm">{category.name}</div>
                          </div>
                        </div>
                        {isComplete && !isActive && (
                          <span className="text-green-600">✓</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>

              {/* Complete Setup Button */}
              <div className="mt-6 pt-6 border-t">
                <Button
                  onClick={onComplete}
                  fullWidth
                  disabled={!profile || !loc}
                >
                  Complete Setup
                </Button>
                {(!profile || !loc) && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Complete Program & LOC first
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Card className="mb-6">
            {renderStepContent()}
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={wizardStep === 0}
            >
              ← Previous
            </Button>
            <Button onClick={handleNext}>
              {wizardStep === WIZARD_CATEGORIES.length - 1 ? 'Complete Setup' : 'Next →'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
