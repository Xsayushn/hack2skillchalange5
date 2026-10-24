import React, { useState } from 'react';
import { Handshake, Plus, Phone, Mail, Trash2, Sparkles, ShieldCheck } from 'lucide-react';
import { EventPlan, Vendor, BudgetCategory, VendorStatus } from '../types';
import { AddVendorModal } from './vendors/AddVendorModal';
import '../styles/vendors.css';

interface VendorsTabProps {
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

export const VendorsTab: React.FC<VendorsTabProps> = ({ event, onUpdateEvent, onAskAI }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  const handleAddVendor = (vendorData: Omit<Vendor, 'id'>) => {
    const newVendor: Vendor = {
      ...vendorData,
      id: `v-${Date.now().toString(36)}`
    };

    onUpdateEvent({
      ...event,
      vendors: [...event.vendors, newVendor],
      updatedAt: new Date().toISOString()
    });
  };

  const handleDeleteVendor = (id: string) => {
    onUpdateEvent({
      ...event,
      vendors: event.vendors.filter((v) => v.id !== id),
      updatedAt: new Date().toISOString()
    });
  };

  const handleUpdateStatus = (id: string, newStatus: VendorStatus) => {
    onUpdateEvent({
      ...event,
      vendors: event.vendors.map((v) => (v.id === id ? { ...v, status: newStatus } : v)),
      updatedAt: new Date().toISOString()
    });
  };

  const filteredVendors = event.vendors.filter((v) => {
    if (activeCategoryFilter === 'all') return true;
    return v.category === activeCategoryFilter;
  });

  const getStatusBadge = (st: VendorStatus) => {
    switch (st) {
      case 'booked':
        return <span className="vendor-status-pill status-booked">✅ Booked & Contracted</span>;
      case 'quoted':
        return <span className="vendor-status-pill status-quoted">📄 Quote Received</span>;
      case 'contacted':
        return <span className="vendor-status-pill status-contacted">💬 In Discussion</span>;
      case 'completed':
        return <span className="vendor-status-pill status-completed">🏆 Service Completed</span>;
      default:
        return <span className="vendor-status-pill status-researching">🔍 Researching</span>;
    }
  };

  return (
    <div className="vendors-tab-container">
      {/* Top Banner & Control */}
      <div className="vendors-top-bar glass-card">
        <div className="vendors-meta-title">
          <Handshake className="text-brand" size={24} />
          <div>
            <h3>Vendor Directory & Contract Checklists</h3>
            <p className="card-sub-text">
              Track contact details, pricing quotes, and must-ask negotiation questions.
            </p>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={15} />
          <span>Add New Vendor</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="vendor-filter-bar">
        <button
          className={`filter-chip ${activeCategoryFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategoryFilter('all')}
        >
          All Vendors ({event.vendors.length})
        </button>
        {CATEGORIES.map((c) => {
          const count = event.vendors.filter((v) => v.category === c).length;
          if (count === 0) return null;
          return (
            <button
              key={c}
              className={`filter-chip ${activeCategoryFilter === c ? 'active' : ''}`}
              onClick={() => setActiveCategoryFilter(c)}
            >
              {c} ({count})
            </button>
          );
        })}
      </div>

      {/* Vendors Grid */}
      <div className="vendors-grid">
        {filteredVendors.length === 0 ? (
          <div className="empty-state-card glass-card">
            <Handshake size={36} className="text-muted" />
            <h4>No vendors listed in this category</h4>
            <p>Click "Add New Vendor" to log contact info and track contract quotes.</p>
          </div>
        ) : (
          filteredVendors.map((vendor) => (
            <div key={vendor.id} className="vendor-card glass-card">
              <div className="vendor-card-header">
                <div>
                  <span className="vendor-category-tag">{vendor.category}</span>
                  <h4 className="vendor-name-title">{vendor.name}</h4>
                  <span className="vendor-contact-person">Contact: {vendor.contactPerson}</span>
                </div>

                <div className="vendor-card-actions">
                  <select
                    value={vendor.status}
                    onChange={(e) => handleUpdateStatus(vendor.id, e.target.value as VendorStatus)}
                    className="vendor-status-select"
                    aria-label={`Update status for ${vendor.name}`}
                  >
                    <option value="researching">Researching</option>
                    <option value="contacted">Contacted</option>
                    <option value="quoted">Quoted</option>
                    <option value="booked">Booked</option>
                    <option value="completed">Completed</option>
                  </select>

                  <button
                    className="btn btn-ghost btn-sm icon-only text-danger"
                    onClick={() => handleDeleteVendor(vendor.id)}
                    title={`Delete ${vendor.name}`}
                    aria-label={`Delete ${vendor.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Status Badge & Pricing Row */}
              <div className="vendor-pricing-row">
                {getStatusBadge(vendor.status)}

                <div className="vendor-numbers-box">
                  <span className="price-item">
                    <small>Quoted:</small> {event.currencySymbol}
                    {vendor.quotedCost.toLocaleString()}
                  </span>
                  <span className="price-item text-brand">
                    <small>Agreed:</small> {event.currencySymbol}
                    {vendor.agreedCost.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Contact coordinates */}
              <div className="vendor-contact-details">
                {vendor.email && (
                  <a href={`mailto:${vendor.email}`} className="contact-link">
                    <Mail size={14} />
                    <span>{vendor.email}</span>
                  </a>
                )}
                {vendor.phone && (
                  <a href={`tel:${vendor.phone}`} className="contact-link">
                    <Phone size={14} />
                    <span>{vendor.phone}</span>
                  </a>
                )}
              </div>

              {vendor.notes && (
                <div className="vendor-notes-box">
                  <p>{vendor.notes}</p>
                </div>
              )}

              {/* Questions Checklist */}
              {vendor.keyQuestions && vendor.keyQuestions.length > 0 && (
                <div className="vendor-questions-container">
                  <div className="questions-title-row">
                    <ShieldCheck size={14} className="text-brand" />
                    <span>Key Due Diligence Questions:</span>
                  </div>
                  <ul className="questions-list">
                    {vendor.keyQuestions.map((q, qIdx) => (
                      <li key={qIdx} className="question-list-item">
                        <span className="bullet-dot">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Negotiator helper */}
              <div className="vendor-card-footer">
                <button
                  className="btn btn-ghost btn-sm text-brand"
                  onClick={() =>
                    onAskAI(
                      `I am negotiating with ${vendor.name} (${vendor.category}) for ${event.title}. Their quoted cost is ${event.currencySymbol}${vendor.quotedCost}. What are 3 proven tips to negotiate this quote down or get complimentary upgrades?`
                    )
                  }
                >
                  <Sparkles size={14} />
                  <span>AI Negotiation Advice</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Vendor Modal */}
      <AddVendorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        currencySymbol={event.currencySymbol}
        categories={CATEGORIES}
        onAddVendor={handleAddVendor}
      />
    </div>
  );
};
