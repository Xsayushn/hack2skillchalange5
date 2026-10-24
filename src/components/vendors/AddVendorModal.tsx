import React, { useState } from 'react';
import { Vendor, BudgetCategory, VendorStatus } from '../../types';
import { useModalA11y } from '../../hooks/useModalA11y';

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
  categories: BudgetCategory[];
  onAddVendor: (vendor: Omit<Vendor, 'id'>) => void;
}

export const AddVendorModal: React.FC<AddVendorModalProps> = ({
  isOpen,
  onClose,
  currencySymbol,
  categories,
  onAddVendor
}) => {
  const modalRef = useModalA11y<HTMLDivElement>({ isOpen, onClose });

  const [name, setName] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('Catering & Bar');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<VendorStatus>('contacted');
  const [quotedCost, setQuotedCost] = useState(1500);
  const [agreedCost, setAgreedCost] = useState(1500);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddVendor({
      name: name.trim(),
      category,
      contactPerson: contactPerson.trim() || 'Lead Representative',
      email: email.trim(),
      phone: phone.trim(),
      status,
      quotedCost: Number(quotedCost) || 0,
      agreedCost: Number(agreedCost) || 0,
      notes: notes.trim(),
      keyQuestions: [
        'What is your cancellation and deposit refund policy?',
        'Are there any overtime fees or travel charges?',
        'Do you provide your own power and backup equipment?'
      ]
    });

    // Reset fields
    setName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setNotes('');
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-vendor-title"
    >
      <div className="modal-content glass-panel" ref={modalRef} tabIndex={-1}>
        <div className="modal-header">
          <h3 id="add-vendor-title">Add Vendor or Service Partner</h3>
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
            <label htmlFor="vendor-name-input">Company / Vendor Name *</label>
            <input
              id="vendor-name-input"
              type="text"
              required
              placeholder="e.g. Lumina Visuals or Cedar Grove Catering"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="vendor-cat-input">Category</label>
              <select
                id="vendor-cat-input"
                value={category}
                onChange={(e) => setCategory(e.target.value as BudgetCategory)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="vendor-status-input">Status</label>
              <select
                id="vendor-status-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as VendorStatus)}
              >
                <option value="researching">Researching</option>
                <option value="contacted">Contacted</option>
                <option value="quoted">Quoted</option>
                <option value="booked">Booked</option>
              </select>
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label htmlFor="vendor-contact-person">Contact Person</label>
              <input
                id="vendor-contact-person"
                type="text"
                placeholder="e.g. Sarah Connor"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="vendor-email">Email</label>
              <input
                id="vendor-email"
                type="email"
                placeholder="sarah@vendor.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="vendor-phone">Phone</label>
              <input
                id="vendor-phone"
                type="tel"
                placeholder="(555) 012-3456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="vendor-quoted">Quoted Cost ({currencySymbol})</label>
              <input
                id="vendor-quoted"
                type="number"
                min="0"
                value={quotedCost}
                onChange={(e) => setQuotedCost(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="vendor-agreed">Agreed Final Cost ({currencySymbol})</label>
              <input
                id="vendor-agreed"
                type="number"
                min="0"
                value={agreedCost}
                onChange={(e) => setAgreedCost(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="vendor-notes">Contract Notes & Inclusions</label>
            <textarea
              id="vendor-notes"
              rows={2}
              placeholder="Key package inclusions, payment terms, or setup arrival hours..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Vendor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
