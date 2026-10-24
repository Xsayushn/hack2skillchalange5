import React, { useState } from 'react';
import { BudgetItem, BudgetCategory, PaymentStatus } from '../../types';
import { useModalA11y } from '../../hooks/useModalA11y';
import { CATEGORIES } from './budgetConstants';
import '../../styles/modals.css';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
  onAddItem: (item: Omit<BudgetItem, 'id'>) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  currencySymbol,
  onAddItem
}) => {
  const modalRef = useModalA11y<HTMLDivElement>({ isOpen, onClose });

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<BudgetCategory>('Catering & Bar');
  const [newItemEstimated, setNewItemEstimated] = useState<number>(500);
  const [newItemActual, setNewItemActual] = useState<number>(0);
  const [newItemPaid, setNewItemPaid] = useState<number>(0);
  const [newItemStatus, setNewItemStatus] = useState<PaymentStatus>('planned');
  const [newItemNotes, setNewItemNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    onAddItem({
      category: newItemCategory,
      name: newItemName.trim(),
      estimatedCost: Number(newItemEstimated) || 0,
      actualCost: Number(newItemActual) || 0,
      paidCost: Number(newItemPaid) || 0,
      status: newItemStatus,
      notes: newItemNotes.trim()
    });

    setNewItemName('');
    setNewItemNotes('');
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-expense-title"
    >
      <div className="modal-content glass-panel" ref={modalRef} tabIndex={-1}>
        <div className="modal-header">
          <h3 id="add-expense-title">Add Budget Expense</h3>
          <button
            className="btn btn-ghost btn-sm icon-only"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
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
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
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
              <label htmlFor="item-est-input">Estimated ({currencySymbol})</label>
              <input
                id="item-est-input"
                type="number"
                min="0"
                value={newItemEstimated}
                onChange={(e) => setNewItemEstimated(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="item-act-input">Actual Cost ({currencySymbol})</label>
              <input
                id="item-act-input"
                type="number"
                min="0"
                value={newItemActual}
                onChange={(e) => setNewItemActual(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="item-paid-input">Amount Paid ({currencySymbol})</label>
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
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Line Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
