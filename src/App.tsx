import { useState } from 'react';
import { WizardContainer } from './components/wizard/WizardContainer';
import { YearBasedDashboard } from './components/dashboard/YearBasedDashboard';
import { Button } from './components/ui/Button';
import { useFinanceStore } from './store/financeStore';

function App() {
  const [showWizard, setShowWizard] = useState(false);
  const { profile, loc, reset, setWizardStep } = useFinanceStore();

  const hasSetupData = profile !== null && loc !== null;

  const handleCompleteWizard = () => {
    setShowWizard(false);
  };

  const handleEditSetup = () => {
    setWizardStep(0); // Reset to first step when editing
    setShowWizard(!showWizard);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      reset();
      setWizardStep(0);
      setShowWizard(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Student Finance LOC Optimizer
              </h1>
              <p className="text-sm text-gray-600">
                Minimize interest and optimize your student loan payments
              </p>
            </div>
            <div className="flex gap-3">
              {hasSetupData && (
                <>
                  <Button variant="outline" onClick={handleEditSetup}>
                    {showWizard ? 'View Dashboard' : 'Edit Setup'}
                  </Button>
                  <Button variant="secondary" onClick={handleResetData}>
                    Reset All Data
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6">
        {!hasSetupData || showWizard ? (
          <WizardContainer onComplete={handleCompleteWizard} />
        ) : (
          <YearBasedDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-center text-sm text-gray-600">
            Student Finance LOC Optimizer - Built for Canadian Students
          </p>
          <p className="text-center text-xs text-gray-500 mt-2">
            This tool provides estimates only. Consult with a financial advisor for personalized advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
