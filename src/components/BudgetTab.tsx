import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Filter,
  PieChart as PieIcon,
  HelpCircle
} from 'lucide-react';
import { EventPlan, BudgetItem, BudgetCategory, PaymentStatus } from '../types';

interface BudgetTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
  onAskAI: (prompt: string) => void;
}

const CATEGORIES: BudgetCategory[] = [
  'Venue & Rentals',
  'Catering & Bar',
  'Photography & Video',
  'Music & Entertainment',
  'Floral & Decor',
  'Attire & Styling',
  'Invitations & Marketing',
  'Logistics & Permits',
  'Favors & Gifts',
  'Contingency & Misc'
];

const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' },
  { code: 'CAD', symbol: '$' },
  { code: 'AUD', symbol: '$' }
];

const CATEGORY_COLORS: Record<string, string> = {
  'Venue & Rentals': '#6366f1',
  'Catering & Bar': '#ec4899',
  'Photography & Video': '#06b6d4',
  'Music & Entertainment': '#f59e0b',
  'Floral & Decor': '#10b981',
  'Attire & Styling': '#8b5cf6',
  'Invitations & Marketing': '#3b82f6',
  'Logistics & Permits': '#64748b',
  'Favors & Gifts': '#d946ef',
  'Contingency & Misc': '#f43f5e'
};

export const BudgetTab: React.FC<BudgetTabProps> = ({
  event,
  onUpdateEvent,
  onAskAI
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<BudgetCategory>('Catering & Bar');
  const [newItemEstimated, setNewItemEstimated] = useState<number>(500);
  const [newItemActual, setNewItemActual] = useState<number>(0);
  const [newItemPaid, setNewItemPaid] = useState<number>(0);
  const [newItemStatus, setNewItemStatus] = useState<PaymentStatus>('planned');
  const [newItemNotes, setNewItemNotes] = useState('');

  // Calculations
  const totalBudget = event.totalBudget || 1;
  const estimatedTotal = event.budgetItems.reduce((acc, b) => acc + b.estimatedCost, 0);
  const committedTotal = event.budgetItems.reduce((acc, b) => acc + (b.actualCost || b.estimatedCost), 0);
  const paidTotal = event.budgetItems.reduce((acc, b) => acc + b.paidCost, 0);
  const balance = totalBudget - committedTotal;
  const isOverBudget = balance < 0;

  // Category aggregations for SVG Donut
  const categoryMap: Record<string, number> = {};
  event.budgetItems.forEach(b => {
    const cost = b.actualCost || b.estimatedCost;
    categoryMap[b.category] = (categoryMap[b.category] || 0) + cost;
  });

  const categoryEntries = Object.entries(categoryMap).filter(([_, val]) => val > 0);

  // Handler for adding line item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: BudgetItem = {
      id: `bi-${Date.now().toString(36)}`,
      category: newItemCategory,
      name: newItemName.trim(),
      estimatedCost: Number(newItemEstimated) || 0,
      actualCost: Number(newItemActual) || 0,
      paidCost: Number(newItemPaid) || 0,
      status: newItemStatus,
      notes: newItemNotes.trim()
    };

    const updated = {
      ...event,
      budgetItems: [...event.budgetItems, newItem],
      updatedAt: new Date().toISOString()
    };
    onUpdateEvent(updated);

    // Reset & close
    setNewItemName('');
    setNewItemNotes('');
    setShowAddModal(false);
  };

  // Handler for deleting line item
  const handleDeleteItem = (id: string) => {
    const updated = {
      ...event,
      budgetItems: event.budgetItems.filter(b => b.id !== id),
      updatedAt: new Date().toISOString()
    };
    onUpdateEvent(updated);
  };

  // Handler for quick updating line item fields
  const handleUpdateItem = (id: string, updates: Partial<BudgetItem>) => {
    const updated = {
      ...event,
      budgetItems: event.budgetItems.map(b => b.id === id ? { ...b, ...updates } : b),
      updatedAt: new Date().toISOString()
    };
    onUpdateEvent(updated);
  };

  // Handler for updating target budget or currency
  const handleTotalBudgetChange = (newTotal: number) => {
    onUpdateEvent({
      ...event,
      totalBudget: Math.max(0, newTotal),
      updatedAt: new Date().toISOString()
    });
  };

  const handleCurrencyChange = (currCode: string) => {
    const match = CURRENCIES.find(c => c.code === currCode);
    if (match) {
      onUpdateEvent({
        ...event,
        currency: match.code,
        currencySymbol: match.symbol,
        updatedAt: new Date().toISOString()
      });
    }
  };

  // Filter items
  const filteredItems = event.budgetItems.filter(b => {
    if (filterCategory !== 'all' && b.category !== filterCategory) return false;
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    return true;
  });

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
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
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
            {event.currencySymbol}{committedTotal.toLocaleString()}
          </div>
          <span className="stat-card-hint">
            {Math.round((committedTotal / totalBudget) * 100)}% of total target
          </span>
        </div>

        <div className="glass-card stat-card">
          <span className="stat-card-title">Paid Out</span>
          <div className="stat-value text-emerald">
            {event.currencySymbol}{paidTotal.toLocaleString()}
          </div>
          <span className="stat-card-hint">
            {committedTotal > 0 ? `${Math.round((paidTotal / committedTotal) * 100)}% of committed cleared` : 'No expenses yet'}
          </span>
        </div>

        <div className="glass-card stat-card">
          <span className="stat-card-title">Remaining Buffer</span>
          <div className={`stat-value ${isOverBudget ? 'text-danger' : 'text-emerald'}`}>
            {isOverBudget ? '-' : ''}{event.currencySymbol}{Math.abs(balance).toLocaleString()}
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
          <p className="card-sub-text">Hover or review proportional investments across categories</p>

          <div className="donut-and-legend">
            {/* SVG Donut Chart */}
            <div className="donut-chart-wrapper">
              <svg viewBox="0 0 100 100" className="donut-svg">
                {(() => {
                  let accumulatedPercent = 0;
                  return categoryEntries.map(([cat, amount]) => {
                    const pct = amount / (committedTotal || 1);
                    const strokeDasharray = `${pct * 100} ${100 - pct * 100}`;
                    const strokeDashoffset = -accumulatedPercent * 100;
                    accumulatedPercent += pct;
                    const color = CATEGORY_COLORS[cat] || '#8b5cf6';

                    return (
                      <circle
                        key={cat}
                        cx="50"
                        cy="50"
                        r="35"
                        fill="transparent"
                        stroke={color}
                        strokeWidth="15"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        pathLength="100"
                        className="donut-segment"
                      >
                        <title>{`${cat}: ${event.currencySymbol}${amount.toLocaleString()} (${Math.round(pct * 100)}%)`}</title>
                      </circle>
                    );
                  });
                })()}
              </svg>
              <div className="donut-center-text">
                <span className="donut-total">{event.currencySymbol}{committedTotal.toLocaleString()}</span>
                <span className="donut-label">Allocated</span>
              </div>
            </div>

            {/* Category Legends */}
            <div className="donut-legend-grid">
              {categoryEntries.map(([cat, amount]) => {
                const pct = Math.round((amount / (committedTotal || 1)) * 100);
                const color = CATEGORY_COLORS[cat] || '#8b5cf6';
                return (
                  <div key={cat} className="legend-item">
                    <span className="legend-indicator" style={{ backgroundColor: color }} />
                    <span className="legend-name">{cat}</span>
                    <span className="legend-val">{event.currencySymbol}{amount.toLocaleString()} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Action Box */}
        <div className="budget-ai-box">
          <div className="ai-box-badge">
            <Sparkles size={16} />
            <span>GenAI Financial Advisor</span>
          </div>
          <h5>Need to optimize allocations?</h5>
          <p>
            CelebrAIte continuously analyzes your numbers against benchmarks for a {event.type} with {event.targetGuests} guests.
          </p>
          <div className="ai-box-actions">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onAskAI(`Analyze our current budget items for ${event.title} totaling ${event.currencySymbol}${committedTotal}. Give us 3 concrete places to trim costs without ruining guest experience.`)}
            >
              Analyze & Trim Budget
            </button>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => onAskAI(`What are common hidden vendor charges or surprise expenses for a ${event.type} in ${event.location}?`)}
            >
              Expose Hidden Vendor Fees
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Action Header */}
      <div className="budget-table-controls">
        <div className="controls-filters">
          <div className="filter-group">
            <Filter size={15} className="text-muted" />
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="select-input"
              aria-label="Filter expenses by category"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select-input"
              aria-label="Filter expenses by payment status"
            >
              <option value="all">All Payment Statuses</option>
              <option value="planned">Planned (Unpaid)</option>
              <option value="deposit_paid">Deposit Paid</option>
              <option value="paid_in_full">Paid in Full</option>
            </select>
          </div>
        </div>

        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setShowAddModal(true)}
          aria-label="Add new budget line item"
        >
          <Plus size={16} />
          <span>Add Expense Item</span>
        </button>
      </div>

      {/* Interactive Expense Table */}
      <div className="glass-card table-card">
        <div className="table-responsive">
          <table className="app-table" aria-label="Budget Line Items">
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Item Description</th>
                <th scope="col">Estimated</th>
                <th scope="col">Actual / Final</th>
                <th scope="col">Paid</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center empty-table-td">
                    No budget items match the current filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="budget-table-row">
                    <td>
                      <span className="category-tag" style={{ borderLeftColor: CATEGORY_COLORS[item.category] || '#6366f1' }}>
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <div className="item-name-cell">
                        <strong>{item.name}</strong>
                        {item.notes && <span className="item-notes-text">{item.notes}</span>}
                      </div>
                    </td>
                    <td>
                      <span className="cost-num">{event.currencySymbol}{item.estimatedCost.toLocaleString()}</span>
                    </td>
                    <td>
                      <input 
                        type="number"
                        className="inline-cost-input"
                        value={item.actualCost}
                        onChange={(e) => handleUpdateItem(item.id, { actualCost: Number(e.target.value) })}
                        aria-label={`Actual cost for ${item.name}`}
                        min="0"
                      />
                    </td>
                    <td>
                      <input 
                        type="number"
                        className="inline-cost-input"
                        value={item.paidCost}
                        onChange={(e) => handleUpdateItem(item.id, { paidCost: Number(e.target.value) })}
                        aria-label={`Paid amount for ${item.name}`}
                        min="0"
                      />
                    </td>
                    <td>
                      <select
                        className={`status-select status-${item.status}`}
                        value={item.status}
                        onChange={(e) => handleUpdateItem(item.id, { status: e.target.value as PaymentStatus })}
                        aria-label={`Payment status for ${item.name}`}
                      >
                        <option value="planned">⏳ Planned</option>
                        <option value="deposit_paid">💳 Deposit Paid</option>
                        <option value="paid_in_full">✅ Paid in Full</option>
                      </select>
                    </td>
                    <td className="text-right">
                      <button 
                        className="btn btn-ghost btn-sm icon-only text-danger"
                        onClick={() => handleDeleteItem(item.id)}
                        title={`Delete ${item.name}`}
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-expense-title">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3 id="add-expense-title">Add Budget Expense</h3>
              <button 
                className="btn btn-ghost btn-sm icon-only" 
                onClick={() => setShowAddModal(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItem} className="modal-form">
              <div className="form-group">
                <label htmlFor="item-name-input">Item Name / Service *</label>
                <input 
                  id="item-name-input"
                  type="text" 
                  required
                  placeholder="e.g. Wedding Cake & Dessert Station"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="item-cat-input">Category</label>
                  <select 
                    id="item-cat-input"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as BudgetCategory)}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="item-status-input">Payment Status</label>
                  <select 
                    id="item-status-input"
                    value={newItemStatus}
                    onChange={(e) => setNewItemStatus(e.target.value as PaymentStatus)}
                  >
                    <option value="planned">Planned</option>
                    <option value="deposit_paid">Deposit Paid</option>
                    <option value="paid_in_full">Paid in Full</option>
                  </select>
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label htmlFor="item-est-input">Estimated ({event.currencySymbol})</label>
                  <input 
                    id="item-est-input"
                    type="number"
                    min="0"
                    value={newItemEstimated}
                    onChange={(e) => setNewItemEstimated(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="item-act-input">Actual Cost ({event.currencySymbol})</label>
                  <input 
                    id="item-act-input"
                    type="number"
                    min="0"
                    value={newItemActual}
                    onChange={(e) => setNewItemActual(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="item-paid-input">Amount Paid ({event.currencySymbol})</label>
                  <input 
                    id="item-paid-input"
                    type="number"
                    min="0"
                    value={newItemPaid}
                    onChange={(e) => setNewItemPaid(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="item-notes-input">Contract Notes / Inclusions</label>
                <textarea 
                  id="item-notes-input"
                  rows={2}
                  placeholder="e.g. 50% deposit paid; remaining balance due 14 days before event."
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Line Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
