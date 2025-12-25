import { useState } from 'react';
import { WizardContainer } from './components/wizard/WizardContainer';
import { YearBasedDashboard } from './components/dashboard/YearBasedDashboard';
import { Button } from './components/ui/Button';
import { useFinanceStore } from './store/financeStore';

function App() {
  const [showWizard, setShowWizard] = useState(false);
  const store = useFinanceStore();
  const { profile, loc, reset, setWizardStep } = store;

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

  const handleExportData = () => {
    const data = {
      profile: store.profile,
      loc: store.loc,
      loans: store.loans,
      scholarships: store.scholarships,
      incomes: store.incomes,
      expenses: store.expenses,
      currentAssets: store.currentAssets,
      fundingSources: store.fundingSources,
      universityProfiles: store.universityProfiles,
      optimizationConfig: store.optimizationConfig,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-finance-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          // Restore all data
          if (data.profile) store.setProfile(data.profile);
          if (data.loc) store.setLOC(data.loc);
          if (data.currentAssets) store.setCurrentAssets(data.currentAssets);
          if (data.optimizationConfig) store.setOptimizationConfig(data.optimizationConfig);

          // Restore arrays
          if (data.incomes) {
            data.incomes.forEach((income: any) => store.addIncome(income));
          }
          if (data.expenses) {
            data.expenses.forEach((expense: any) => store.addExpense(expense));
          }
          if (data.fundingSources) {
            data.fundingSources.forEach((source: any) => store.addFundingSource(source));
          }
          if (data.loans) {
            data.loans.forEach((loan: any) => store.addLoan(loan));
          }
          if (data.scholarships) {
            data.scholarships.forEach((scholarship: any) => store.addScholarship(scholarship));
          }

          alert('Data imported successfully!');
          setShowWizard(false);
        } catch (error) {
          alert('Error importing data. Please check the file format.');
          console.error('Import error:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
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
            <div className="flex gap-2">
              {hasSetupData && (
                <>
                  <Button variant="outline" size="sm" onClick={handleEditSetup}>
                    {showWizard ? 'View Dashboard' : 'Edit Setup'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportData}>
                    💾 Export Data
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleImportData}>
                    📂 Import Data
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleResetData}>
                    Reset All
                  </Button>
                </>
              )}
              {!hasSetupData && (
                <Button variant="outline" size="sm" onClick={handleImportData}>
                  📂 Import Saved Data
                </Button>
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
