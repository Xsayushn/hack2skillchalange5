import React, { memo } from 'react';
import { Plus, Trash2, Filter } from 'lucide-react';
import { BudgetItem, PaymentStatus } from '../../types';
import { CATEGORIES, CATEGORY_COLORS } from './budgetConstants';

interface ExpenseTableProps {
  items: BudgetItem[];
  currencySymbol: string;
  filterCategory: string;
  onFilterCategoryChange: (cat: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  onOpenAddModal: () => void;
  onUpdateItem: (id: string, updates: Partial<BudgetItem>) => void;
  onDeleteItem: (id: string) => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = memo(
  ({
    items,
    currencySymbol,
    filterCategory,
    onFilterCategoryChange,
    filterStatus,
    onFilterStatusChange,
    onOpenAddModal,
    onUpdateItem,
    onDeleteItem
  }) => {
    return (
      <>
        {/* Filter and Action Header */}
        <div className="budget-table-controls">
          <div className="controls-filters">
            <div className="filter-group">
              <Filter size={15} className="text-muted" />
              <select
                value={filterCategory}
                onChange={(e) => onFilterCategoryChange(e.target.value)}
                className="select-input"
                aria-label="Filter expenses by category"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filterStatus}
                onChange={(e) => onFilterStatusChange(e.target.value)}
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
            onClick={onOpenAddModal}
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
                  <th scope="col" className="text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center empty-table-td">
                      No budget items match the current filter.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="budget-table-row">
                      <td>
                        <span
                          className="category-tag"
                          style={{ borderLeftColor: CATEGORY_COLORS[item.category] || '#6366f1' }}
                        >
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
                        <span className="cost-num">
                          {currencySymbol}
                          {item.estimatedCost.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="inline-cost-input"
                          value={item.actualCost}
                          onChange={(e) =>
                            onUpdateItem(item.id, { actualCost: Number(e.target.value) })
                          }
                          aria-label={`Actual cost for ${item.name}`}
                          min="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="inline-cost-input"
                          value={item.paidCost}
                          onChange={(e) =>
                            onUpdateItem(item.id, { paidCost: Number(e.target.value) })
                          }
                          aria-label={`Paid amount for ${item.name}`}
                          min="0"
                        />
                      </td>
                      <td>
                        <select
                          className={`status-select status-${item.status}`}
                          value={item.status}
                          onChange={(e) =>
                            onUpdateItem(item.id, { status: e.target.value as PaymentStatus })
                          }
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
                          onClick={() => onDeleteItem(item.id)}
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
      </>
    );
  }
);

ExpenseTable.displayName = 'ExpenseTable';
