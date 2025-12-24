import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  FinanceState,
  UserProfile,
  LineOfCredit,
  GovernmentLoan,
  Scholarship,
  Income,
  Expense,
  OptimizationConfig,
  OptimizationResult,
  CurrentAssets,
  FundingSource,
} from '../types';

interface FinanceStore extends FinanceState {
  // Actions
  setProfile: (profile: UserProfile) => void;
  setLOC: (loc: LineOfCredit) => void;
  addLoan: (loan: GovernmentLoan) => void;
  removeLoan: (loanId: string) => void;
  updateLoan: (loanId: string, loan: GovernmentLoan) => void;
  addScholarship: (scholarship: Scholarship) => void;
  removeScholarship: (scholarshipId: string) => void;
  updateScholarship: (scholarshipId: string, scholarship: Scholarship) => void;
  addIncome: (income: Income) => void;
  removeIncome: (incomeId: string) => void;
  updateIncome: (incomeId: string, income: Income) => void;
  addExpense: (expense: Expense) => void;
  removeExpense: (expenseId: string) => void;
  updateExpense: (expenseId: string, expense: Expense) => void;
  setCurrentAssets: (assets: CurrentAssets) => void;
  addFundingSource: (source: FundingSource) => void;
  removeFundingSource: (sourceId: string) => void;
  setOptimizationConfig: (config: OptimizationConfig) => void;
  setCurrentResult: (result: OptimizationResult) => void;
  setWizardStep: (step: number) => void;
  setIsCalculating: (isCalculating: boolean) => void;
  addScenario: (name: string, config: OptimizationConfig, result: OptimizationResult) => void;
  removeScenario: (scenarioId: string) => void;
  reset: () => void;
}

const STORAGE_VERSION = 2; // Increment when making breaking changes

const initialState: FinanceState = {
  profile: null,
  loc: null,
  loans: [],
  scholarships: [],
  incomes: [],
  expenses: [],
  currentAssets: null,
  fundingSources: [],
  optimizationConfig: {
    strategy: 'balanced',
    emergencyBufferMonths: 2,
    allowDiscretionaryCuts: true,
    prioritizeHighInterest: true,
    maxProjectionMonths: 120,
  },
  currentResult: null,
  scenarios: [],
  wizardStep: 0,
  isCalculating: false,
  lastSaved: null,
};

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      ...initialState,

      setProfile: (profile) => set({ profile, lastSaved: new Date() }),

      setLOC: (loc) => set({ loc, lastSaved: new Date() }),

      addLoan: (loan) =>
        set((state) => ({
          loans: [...state.loans, loan],
          lastSaved: new Date(),
        })),

      removeLoan: (loanId) =>
        set((state) => ({
          loans: state.loans.filter((l) => l.id !== loanId),
          lastSaved: new Date(),
        })),

      updateLoan: (loanId, loan) =>
        set((state) => ({
          loans: state.loans.map((l) => (l.id === loanId ? loan : l)),
          lastSaved: new Date(),
        })),

      addScholarship: (scholarship) =>
        set((state) => ({
          scholarships: [...state.scholarships, scholarship],
          lastSaved: new Date(),
        })),

      removeScholarship: (scholarshipId) =>
        set((state) => ({
          scholarships: state.scholarships.filter((s) => s.id !== scholarshipId),
          lastSaved: new Date(),
        })),

      updateScholarship: (scholarshipId, scholarship) =>
        set((state) => ({
          scholarships: state.scholarships.map((s) =>
            s.id === scholarshipId ? scholarship : s
          ),
          lastSaved: new Date(),
        })),

      addIncome: (income) =>
        set((state) => ({
          incomes: [...state.incomes, income],
          lastSaved: new Date(),
        })),

      removeIncome: (incomeId) =>
        set((state) => ({
          incomes: state.incomes.filter((i) => i.id !== incomeId),
          lastSaved: new Date(),
        })),

      updateIncome: (incomeId, income) =>
        set((state) => ({
          incomes: state.incomes.map((i) => (i.id === incomeId ? income : i)),
          lastSaved: new Date(),
        })),

      addExpense: (expense) =>
        set((state) => ({
          expenses: [...state.expenses, expense],
          lastSaved: new Date(),
        })),

      removeExpense: (expenseId) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== expenseId),
          lastSaved: new Date(),
        })),

      updateExpense: (expenseId, expense) =>
        set((state) => ({
          expenses: state.expenses.map((e) => (e.id === expenseId ? expense : e)),
          lastSaved: new Date(),
        })),

      setCurrentAssets: (assets) =>
        set({ currentAssets: assets, lastSaved: new Date() }),

      addFundingSource: (source) =>
        set((state) => ({
          fundingSources: [...state.fundingSources, source],
          lastSaved: new Date(),
        })),

      removeFundingSource: (sourceId) =>
        set((state) => ({
          fundingSources: state.fundingSources.filter((f) => f.id !== sourceId),
          lastSaved: new Date(),
        })),

      setOptimizationConfig: (config) =>
        set({ optimizationConfig: config, lastSaved: new Date() }),

      setCurrentResult: (result) =>
        set({ currentResult: result, lastSaved: new Date() }),

      setWizardStep: (step) => set({ wizardStep: step }),

      setIsCalculating: (isCalculating) => set({ isCalculating }),

      addScenario: (name, config, result) =>
        set((state) => ({
          scenarios: [
            ...state.scenarios,
            {
              id: `scenario-${Date.now()}`,
              name,
              config,
              result,
            },
          ],
          lastSaved: new Date(),
        })),

      removeScenario: (scenarioId) =>
        set((state) => ({
          scenarios: state.scenarios.filter((s) => s.id !== scenarioId),
          lastSaved: new Date(),
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'finance-storage',
      version: STORAGE_VERSION,
      migrate: (persistedState: any, version: number) => {
        // If the version doesn't match, reset to initial state
        if (version !== STORAGE_VERSION) {
          console.log('Storage version mismatch. Resetting to initial state.');
          return initialState;
        }
        return persistedState as FinanceState;
      },
    }
  )
);
