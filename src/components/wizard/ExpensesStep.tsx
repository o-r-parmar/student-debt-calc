import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useFinanceStore } from '../../store/financeStore';
import type { Expense, ExpenseCategory, ExpensePriority } from '../../types';
import { EXPENSE_CATEGORY_LABELS } from '../../lib/utils/constants';

export function ExpensesStep() {
  const { expenses, addExpense, removeExpense } = useFinanceStore();

  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    category: 'food',
    name: '',
    amount: 400,
    frequency: 'monthly',
    isFixed: true,
    priority: 'essential',
  });

  // Initialize with default expenses if empty
  useEffect(() => {
    if (expenses.length === 0) {
      const defaultExpenses: Array<{
        category: ExpenseCategory;
        name: string;
        amount: number;
        frequency: 'monthly' | 'semester';
        priority: ExpensePriority;
      }> = [
        { category: 'housing', name: 'Rent', amount: 1200, frequency: 'monthly', priority: 'essential' },
        { category: 'food', name: 'Groceries & Dining', amount: 400, frequency: 'monthly', priority: 'essential' },
        { category: 'transportation', name: 'Transit Pass', amount: 150, frequency: 'monthly', priority: 'important' },
        { category: 'utilities', name: 'Utilities', amount: 100, frequency: 'monthly', priority: 'essential' },
        { category: 'entertainment', name: 'Entertainment', amount: 100, frequency: 'monthly', priority: 'discretionary' },
      ];

      defaultExpenses.forEach((exp) => {
        addExpense({
          id: `expense-${Date.now()}-${Math.random()}`,
          ...exp,
          isFixed: true,
        });
      });
    }
  }, []);

  const handleAddExpense = () => {
    if (newExpense.name && newExpense.amount) {
      addExpense({
        id: `expense-${Date.now()}`,
        category: newExpense.category!,
        name: newExpense.name,
        amount: newExpense.amount,
        frequency: newExpense.frequency!,
        isFixed: newExpense.isFixed!,
        priority: newExpense.priority!,
      });
      setNewExpense({
        category: 'food',
        name: '',
        amount: 0,
        frequency: 'monthly',
        isFixed: true,
        priority: 'essential',
      });
    }
  };

  const totalMonthly = expenses
    .filter((e) => e.frequency === 'monthly')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Monthly Expenses</h2>
        <p className="text-gray-600">
          Add and manage your expected monthly expenses
        </p>
      </div>

      {/* Expense List */}
      <div className="space-y-3">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{expense.name}</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {EXPENSE_CATEGORY_LABELS[expense.category]}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    expense.priority === 'essential'
                      ? 'bg-red-100 text-red-800'
                      : expense.priority === 'important'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {expense.priority}
                </span>
              </div>
              <span className="text-sm text-gray-500">{expense.frequency}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold">${expense.amount.toFixed(2)}</span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => removeExpense(expense.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Expense */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Add New Expense</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Expense Name"
            value={newExpense.name}
            onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
            placeholder="e.g., Phone Bill"
          />
          <Input
            type="number"
            label="Amount"
            value={newExpense.amount}
            onChange={(e) =>
              setNewExpense({ ...newExpense, amount: Number(e.target.value) })
            }
            leftIcon={<span className="text-gray-500">$</span>}
          />
          <Select
            label="Category"
            value={newExpense.category!}
            onChange={(e) =>
              setNewExpense({
                ...newExpense,
                category: e.target.value as ExpenseCategory,
              })
            }
            options={Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <Select
            label="Priority"
            value={newExpense.priority!}
            onChange={(e) =>
              setNewExpense({
                ...newExpense,
                priority: e.target.value as ExpensePriority,
              })
            }
            options={[
              { value: 'essential', label: 'Essential' },
              { value: 'important', label: 'Important' },
              { value: 'discretionary', label: 'Discretionary' },
            ]}
          />
        </div>
        <Button onClick={handleAddExpense} className="mt-4">
          Add Expense
        </Button>
      </div>

      {/* Total */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total Monthly Expenses:</span>
          <span className="text-2xl font-bold text-blue-600">
            ${totalMonthly.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
