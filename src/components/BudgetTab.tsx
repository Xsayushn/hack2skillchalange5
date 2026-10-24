import React, { useState, useMemo, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { EventPlan, BudgetItem } from '../types';
import { CURRENCIES } from './budget/budgetConstants';
import { BudgetDonutChart } from './budget/BudgetDonutChart';
import { ExpenseTable } from './budget/ExpenseTable';
import { AddExpenseModal } from './budget/AddExpenseModal';
import '../styles/budget.css';

interface BudgetTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
  onAskAI: (prompt: string) => void;
}

export const BudgetTab: React.FC<BudgetTabProps> = ({ event, onUpdateEvent, onAskAI }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Memoized Calculations
  const totalBudget = event.totalBudget || 1;
  const committedTotal = useMemo(
    () => event.budgetItems.reduce((acc, b) => acc + (b.actualCost || b.estimatedCost), 0),
    [event.budgetItems]
  );
  const paidTotal = useMemo(
    () => event.budgetItems.reduce((acc, b) => acc + b.paidCost, 0),
    [event.budgetItems]
  );
  const balance = totalBudget - committedTotal;
  const isOverBudget = balance < 0;

  // Memoized Category aggregations for SVG Donut
  const categoryEntries = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    event.budgetItems.forEach((b) => {
      const cost = b.actualCost || b.estimatedCost;
      categoryMap[b.category] = (categoryMap[b.category] || 0) + cost;
    });
    return Object.entries(categoryMap).filter(([_, val]) => val > 0);
  }, [event.budgetItems]);

  // Memoized handlers for line items
  const handleAddItem = useCallback(
    (item: Omit<BudgetItem, 'id'>) => {
      const newItem: BudgetItem = {
        ...item,
        id: `bi-${Date.now().toString(36)}`
      };

      const updated = {
        ...event,
        budgetItems: [...event.budgetItems, newItem],
        updatedAt: new Date().toISOString()
      };
      onUpdateEvent(updated);
    },
    [event, onUpdateEvent]
  );

  const handleDeleteItem = useCallback(
    (id: string) => {
      const updated = {
        ...event,
        budgetItems: event.budgetItems.filter((b) => b.id !== id),
        updatedAt: new Date().toISOString()
      };
      onUpdateEvent(updated);
    },
    [event, onUpdateEvent]
  );

  const handleUpdateItem = useCallback(
    (id: string, updates: Partial<BudgetItem>) => {
      const updated = {
        ...event,
        budgetItems: event.budgetItems.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        updatedAt: new Date().toISOString()
      };
      onUpdateEvent(updated);
    },
    [event, onUpdateEvent]
  );

  const handleTotalBudgetChange = useCallback(
    (newTotal: number) => {
      onUpdateEvent({
        ...event,
        totalBudget: Math.max(0, newTotal),
        updatedAt: new Date().toISOString()
      });
    },
    [event, onUpdateEvent]
  );

  const handleCurrencyChange = useCallback(
    (currCode: string) => {
      const match = CURRENCIES.find((c) => c.code === currCode);
      if (match) {
        onUpdateEvent({
          ...event,
          currency: match.code,
          currencySymbol: match.symbol,
          updatedAt: new Date().toISOString()
        });
      }
    },
    [event, onUpdateEvent]
  );

  // Memoized Filter items
  const filteredItems = useMemo(() => {
    return event.budgetItems.filter((b) => {
      if (filterCategory !== 'all' && b.category !== filterCategory) return false;
      if (filterStatus !== 'all' && b.status !== filterStatus) return false;
      return true;
    });
  }, [event.budgetItems, filterCategory, filterStatus]);

  return (
    <div className="budget-tab-container">
      {/* Financial Top Summary Cards */}
      <div className="budget-summary-grid">
        <div className="glass-card stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Target Budget</span>
            <div className="currency-selector-mini">
              <select
                value={event.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                aria-label="Currency selector"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="editable-budget-row">
            <span className="stat-symbol">{event.currencySymbol}</span>
            <input
              type="number"
              className="stat-input-number"
              value={event.totalBudget}
              onChange={(e) => handleTotalBudgetChange(Number(e.target.value))}
              aria-label="Total Event Budget"
              min="0"
              step="500"
            />
          </div>
          <span className="stat-card-hint">Edit to recalculate balances</span>
        </div>

        <div className="glass-card stat-card">
          <span className="stat-card-title">Committed / Actual</span>
          <div className="stat-value text-brand">
            {event.currencySymbol}
            {committedTotal.toLocaleString()}
          </div>
          <span className="stat-card-hint">
            {Math.round((committedTotal / totalBudget) * 100)}% of total target
          </span>
        </div>

        <div className="glass-card stat-card">
          <span className="stat-card-title">Paid Out</span>
          <div className="stat-value text-emerald">
            {event.currencySymbol}
            {paidTotal.toLocaleString()}
          </div>
          <span className="stat-card-hint">
            {committedTotal > 0
              ? `${Math.round((paidTotal / committedTotal) * 100)}% of committed cleared`
              : 'No expenses yet'}
          </span>
        </div>

        <div className="glass-card stat-card">
          <span className="stat-card-title">Remaining Buffer</span>
          <div className={`stat-value ${isOverBudget ? 'text-danger' : 'text-emerald'}`}>
            {isOverBudget ? '-' : ''}
            {event.currencySymbol}
            {Math.abs(balance).toLocaleString()}
          </div>
          <span className="stat-card-hint">
            {isOverBudget ? 'Exceeding budget target' : 'Safe reserve available'}
          </span>
        </div>
      </div>

      {/* Visual Chart & Category Distribution */}
      <div className="budget-visual-grid glass-card">
        <div className="chart-col">
          <h4>Spend Allocation by Category</h4>
          <p className="card-sub-text">
            Hover or review proportional investments across categories
          </p>

          <BudgetDonutChart
            categoryEntries={categoryEntries}
            committedTotal={committedTotal}
            currencySymbol={event.currencySymbol}
          />
        </div>

        {/* AI Action Box */}
        <div className="budget-ai-box">
          <div className="ai-box-badge">
            <Sparkles size={16} />
            <span>GenAI Financial Advisor</span>
          </div>
          <h5>Need to optimize allocations?</h5>
          <p>
            CelebrAIte continuously analyzes your numbers against benchmarks for a {event.type} with{' '}
            {event.targetGuests} guests.
          </p>
          <div className="ai-box-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() =>
                onAskAI(
                  `Analyze our current budget items for ${event.title} totaling ${event.currencySymbol}${committedTotal}. Give us 3 concrete places to trim costs without ruining guest experience.`
                )
              }
            >
              Analyze & Trim Budget
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() =>
                onAskAI(
                  `What are common hidden vendor charges or surprise expenses for a ${event.type} in ${event.location}?`
                )
              }
            >
              Expose Hidden Vendor Fees
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Expense Table */}
      <ExpenseTable
        items={filteredItems}
        currencySymbol={event.currencySymbol}
        filterCategory={filterCategory}
        onFilterCategoryChange={setFilterCategory}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        onOpenAddModal={() => setShowAddModal(true)}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
      />

      {/* Add Item Modal */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        currencySymbol={event.currencySymbol}
        onAddItem={handleAddItem}
      />
    </div>
  );
};
