# Student Finance LOC Optimizer

A comprehensive web application that helps Canadian students optimize their Line of Credit (LOC) payments and minimize total interest paid during their education.

## Features

### Current Implementation (Phase 1)
- ✅ Multi-step wizard for data collection
  - Program & timeline setup
  - Line of Credit details
  - Expense management
- ✅ Advanced optimization algorithm
  - Three strategies: Aggressive, Balanced, Minimum payment
  - Daily/monthly interest calculation
  - Grace period support
- ✅ Interactive dashboard
  - Summary cards showing total debt, LOC balance, interest projections
  - Monthly payment plan table
  - Smart recommendations based on user's financial situation
- ✅ Data persistence using local storage
- ✅ Responsive design with Tailwind CSS

### Planned Features (Phase 2)
- [ ] Additional wizard steps (Government loans, Scholarships, Income sources)
- [ ] Interactive charts (Balance trajectory, Cash flow, Interest comparison)
- [ ] Scenario comparison tool
- [ ] What-if calculator
- [ ] Export functionality (JSON, CSV, PDF)

## Technical Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3
- **State Management**: Zustand with persistence
- **Date Handling**: date-fns
- **Charts**: Recharts (ready to integrate)

## Installation

```bash
npm install
npm run dev        # Development server
npm run build      # Production build
```

## Project Structure

```
src/
├── components/    # UI components (wizard, dashboard, base components)
├── lib/           # Calculations, validation, utilities
├── store/         # Zustand state management
├── types/         # TypeScript definitions
└── App.tsx        # Main component
```

## Usage

1. Complete the setup wizard with your financial information
2. View the optimized payment plan on the dashboard
3. Review recommendations and month-by-month breakdown
4. Adjust settings anytime to update projections

## Disclaimer

This tool provides estimates only. Consult a financial advisor for personalized advice.
