import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { useFinanceStore } from '../../store/financeStore';
import type { FundingSource } from '../../types';

export function FundingStep() {
  const { profile, fundingSources, addFundingSource, removeFundingSource } = useFinanceStore();

  const [newFunding, setNewFunding] = useState({
    name: '',
    type: 'grant' as 'grant' | 'loan',
    amount: 0,
    termsApplied: [] as number[],
  });

  const totalTerms = profile?.semesterStructure?.length || 8;
  const terms = profile?.semesterStructure || [];

  // Ensure fundingSources is always an array
  const sources = fundingSources || [];

  const handleAddFunding = () => {
    if (!newFunding.name || newFunding.amount <= 0 || newFunding.termsApplied.length === 0) {
      alert('Please fill in all fields and select at least one term');
      return;
    }

    const funding: FundingSource = {
      id: `funding-${Date.now()}`,
      ...newFunding,
    };

    addFundingSource(funding);
    setNewFunding({
      name: '',
      type: 'grant',
      amount: 0,
      termsApplied: [],
    });
  };

  const handleRemoveFunding = (id: string) => {
    removeFundingSource(id);
  };

  const handleTermToggle = (termIndex: number) => {
    const currentTerms = newFunding.termsApplied;
    if (currentTerms.includes(termIndex)) {
      setNewFunding({
        ...newFunding,
        termsApplied: currentTerms.filter((t) => t !== termIndex),
      });
    } else {
      setNewFunding({
        ...newFunding,
        termsApplied: [...currentTerms, termIndex].sort((a, b) => a - b),
      });
    }
  };

  const totalGrants = sources
    .filter((f) => f.type === 'grant')
    .reduce((sum, f) => sum + f.amount * f.termsApplied.length, 0);

  const totalLoans = sources
    .filter((f) => f.type === 'loan')
    .reduce((sum, f) => sum + f.amount * f.termsApplied.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Government Funding
        </h2>
        <p className="text-gray-600">
          Add OSAP, provincial loans, and grants. Specify which terms each funding source applies to.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-gray-600">Total Grants (Kept Money)</div>
          <div className="text-2xl font-bold text-green-600">
            ${totalGrants.toLocaleString('en-CA')}
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-sm text-gray-600">Total Loans (Must Repay)</div>
          <div className="text-2xl font-bold text-orange-600">
            ${totalLoans.toLocaleString('en-CA')}
          </div>
        </div>
      </div>

      {/* Existing Funding Sources */}
      {sources.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Your Funding Sources</h3>
          {sources.map((funding) => (
            <div
              key={funding.id}
              className={`p-4 rounded-lg border-2 ${
                funding.type === 'grant'
                  ? 'bg-green-50 border-green-300'
                  : 'bg-orange-50 border-orange-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
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
                  <div className="mt-2 text-sm">
                    <div className="font-medium">
                      ${funding.amount.toLocaleString('en-CA')} per term
                    </div>
                    <div className="text-gray-600">
                      Applies to {funding.termsApplied.length} term(s):{' '}
                      {funding.termsApplied.map((t) => terms[t]?.name || `Term ${t + 1}`).join(', ')}
                    </div>
                    <div className="font-semibold text-gray-900 mt-1">
                      Total: ${(funding.amount * funding.termsApplied.length).toLocaleString('en-CA')}
                    </div>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveFunding(funding.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Funding */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Add Funding Source</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Funding Name"
              value={newFunding.name}
              onChange={(e) =>
                setNewFunding({ ...newFunding, name: e.target.value })
              }
              placeholder="e.g., OSAP Grant, Canada Student Grant"
            />
            <Select
              label="Type"
              value={newFunding.type}
              onChange={(e) =>
                setNewFunding({
                  ...newFunding,
                  type: e.target.value as 'grant' | 'loan',
                })
              }
              options={[
                { value: 'grant', label: 'Grant (Kept Money - No Repayment)' },
                { value: 'loan', label: 'Loan (Must Repay with Interest)' },
              ]}
            />
          </div>

          <Input
            type="number"
            label="Amount Per Term"
            value={newFunding.amount}
            onChange={(e) =>
              setNewFunding({ ...newFunding, amount: Number(e.target.value) })
            }
            tooltip="Enter the amount you receive each term this funding applies to"
            leftIcon={<span className="text-gray-500">$</span>}
          />

          {/* Term Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Terms This Funding Applies To
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Array.from({ length: totalTerms }).map((_, index) => {
                const term = terms[index];
                const isSelected = newFunding.termsApplied.includes(index);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleTermToggle(index)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {term?.name || `Term ${index + 1}`}
                    {isSelected && ' ✓'}
                  </button>
                );
              })}
            </div>
            {newFunding.termsApplied.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                Selected {newFunding.termsApplied.length} term(s) = $
                {(newFunding.amount * newFunding.termsApplied.length).toLocaleString('en-CA')} total
              </p>
            )}
          </div>

          <Button onClick={handleAddFunding} fullWidth>
            Add Funding Source
          </Button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">Understanding Grants vs Loans</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Grants:</strong> Free money you don't have to pay back (e.g., Canada Student Grant, OSAP Grant portion)</li>
          <li><strong>Loans:</strong> Money you must repay after graduation, usually with interest (e.g., OSAP Loan, Canada Student Loan)</li>
          <li><strong>OSAP:</strong> Usually includes both grant and loan portions - add them separately here</li>
        </ul>
      </div>
    </div>
  );
}
