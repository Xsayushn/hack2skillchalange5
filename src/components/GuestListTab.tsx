import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, Utensils, Filter } from 'lucide-react';
import { EventPlan, Guest, RsvpStatus } from '../types';
import { useModalA11y } from '../hooks/useModalA11y';
import '../styles/guestList.css';

interface GuestListTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
  onAskAI: (prompt: string) => void;
}

export const GuestListTab: React.FC<GuestListTabProps> = ({ event, onUpdateEvent, onAskAI }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterRsvp, setFilterRsvp] = useState<string>('all');
  const addModalRef = useModalA11y<HTMLDivElement>({
    isOpen: showAddModal,
    onClose: () => setShowAddModal(false)
  });

  // Form State
  const [name, setName] = useState('');
  const [group, setGroup] = useState('Friends');
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>('confirmed');
  const [plusOnes, setPlusOnes] = useState(0);
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [tableOrZone, setTableOrZone] = useState('Table 1');

  // Metrics
  const guests = event.guests;
  const confirmedCount = guests
    .filter((g) => g.rsvpStatus === 'confirmed')
    .reduce((acc, g) => acc + 1 + g.plusOnes, 0);
  const declinedCount = guests.filter((g) => g.rsvpStatus === 'declined').length;
  const pendingCount = guests
    .filter((g) => g.rsvpStatus === 'pending')
    .reduce((acc, g) => acc + 1 + g.plusOnes, 0);

  // Dietary Restrictions Aggregation
  const dietaryItems = guests
    .filter(
      (g) =>
        g.dietaryNotes &&
        g.dietaryNotes.trim() !== '' &&
        g.dietaryNotes.toLowerCase() !== 'none' &&
        g.rsvpStatus === 'confirmed'
    )
    .map((g) => ({ guest: g.name, note: g.dietaryNotes }));

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newGuest: Guest = {
      id: `g-${Date.now().toString(36)}`,
      name: name.trim(),
      group: group.trim() || 'General',
      rsvpStatus,
      plusOnes: Number(plusOnes) || 0,
      dietaryNotes: dietaryNotes.trim() || 'None',
      tableOrZone: tableOrZone.trim() || 'Unassigned'
    };

    onUpdateEvent({
      ...event,
      guests: [...event.guests, newGuest],
      updatedAt: new Date().toISOString()
    });

    setName('');
    setDietaryNotes('');
    setPlusOnes(0);
    setShowAddModal(false);
  };

  const handleDeleteGuest = (id: string) => {
    onUpdateEvent({
      ...event,
      guests: event.guests.filter((g) => g.id !== id),
      updatedAt: new Date().toISOString()
    });
  };

  const handleUpdateStatus = (id: string, status: RsvpStatus) => {
    onUpdateEvent({
      ...event,
      guests: event.guests.map((g) => (g.id === id ? { ...g, rsvpStatus: status } : g)),
      updatedAt: new Date().toISOString()
    });
  };

  const filteredGuests = guests.filter((g) => {
    if (filterRsvp === 'all') return true;
    return g.rsvpStatus === filterRsvp;
  });

  return (
    <div className="guests-tab-container">
      {/* RSVP Stats Top Cards */}
      <div className="rsvp-stats-grid">
        <div className="glass-card stat-card">
          <span className="stat-card-title">Confirmed Attendees</span>
          <div className="stat-value text-emerald">{confirmedCount}</div>
          <span className="stat-card-hint">
            {Math.round((confirmedCount / (event.targetGuests || 1)) * 100)}% of target (
            {event.targetGuests})
          </span>
        </div>

        <div className="glass-card stat-card">
          <span className="stat-card-title">Pending Responses</span>
          <div className="stat-value text-brand">{pendingCount}</div>
          <span className="stat-card-hint">Awaiting confirmation</span>
        </div>

        <div className="glass-card stat-card">
          <span className="stat-card-title">Declined Invites</span>
          <div className="stat-value text-muted">{declinedCount}</div>
          <span className="stat-card-hint">Cannot attend</span>
        </div>

        <div className="glass-card stat-card">
          <span className="stat-card-title">Dietary Accommodations</span>
          <div className="stat-value text-brand">{dietaryItems.length}</div>
          <span className="stat-card-hint">Special kitchen plates</span>
        </div>
      </div>

      {/* Dietary Summary Banner */}
      {dietaryItems.length > 0 && (
        <div className="alert-banner alert-brand">
          <Utensils className="alert-icon" size={20} />
          <div className="alert-content">
            <strong>Dietary Inclusivity Alert:</strong> You have {dietaryItems.length} guests with
            special dietary needs: {dietaryItems.map((d) => `${d.guest} (${d.note})`).join('; ')}.
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() =>
              onAskAI(
                `How should our catering team organize plating for ${dietaryItems.length} guests with special dietary requests (${dietaryItems.map((d) => d.note).join(', ')}) without delays?`
              )
            }
          >
            Catering Plating Advice
          </button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="guests-controls-bar">
        <div className="filter-group">
          <Filter size={15} className="text-muted" />
          <select
            value={filterRsvp}
            onChange={(e) => setFilterRsvp(e.target.value)}
            className="select-input"
            aria-label="Filter guests by RSVP status"
          >
            <option value="all">All Guests ({guests.length})</option>
            <option value="confirmed">Confirmed Only</option>
            <option value="pending">Pending Only</option>
            <option value="declined">Declined Only</option>
          </select>
        </div>

        <div className="guests-btn-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() =>
              onAskAI(
                `Write a polite, warm RSVP follow-up text and email template for guests who have not responded to ${event.title}.`
              )
            }
          >
            <Sparkles size={14} />
            <span>AI RSVP Reminder Draft</span>
          </button>

          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <Plus size={15} />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* Guests Table */}
      <div className="glass-card table-card">
        <div className="table-responsive">
          <table className="app-table" aria-label="Guest List">
            <thead>
              <tr>
                <th scope="col">Guest Name</th>
                <th scope="col">Group / Circle</th>
                <th scope="col">RSVP Status</th>
                <th scope="col">Plus Ones</th>
                <th scope="col">Table / Zone</th>
                <th scope="col">Dietary Needs</th>
                <th scope="col" className="text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center empty-table-td">
                    No guests match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => (
                  <tr key={guest.id}>
                    <td>
                      <strong>{guest.name}</strong>
                    </td>
                    <td>
                      <span className="guest-group-badge">{guest.group}</span>
                    </td>
                    <td>
                      <select
                        value={guest.rsvpStatus}
                        onChange={(e) => handleUpdateStatus(guest.id, e.target.value as RsvpStatus)}
                        className={`status-select status-${guest.rsvpStatus}`}
                        aria-label={`RSVP status for ${guest.name}`}
                      >
                        <option value="confirmed">✅ Confirmed</option>
                        <option value="pending">⏳ Pending</option>
                        <option value="declined">❌ Declined</option>
                      </select>
                    </td>
                    <td>
                      <span>{guest.plusOnes > 0 ? `+${guest.plusOnes}` : '0'}</span>
                    </td>
                    <td>
                      <span className="table-zone-tag">{guest.tableOrZone || 'Unassigned'}</span>
                    </td>
                    <td>
                      <span
                        className={
                          guest.dietaryNotes && guest.dietaryNotes.toLowerCase() !== 'none'
                            ? 'text-brand font-semibold'
                            : 'text-muted'
                        }
                      >
                        {guest.dietaryNotes || 'None'}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        className="btn btn-ghost btn-sm icon-only text-danger"
                        onClick={() => handleDeleteGuest(guest.id)}
                        title={`Delete ${guest.name}`}
                        aria-label={`Delete ${guest.name}`}
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

      {/* Add Guest Modal */}
      {showAddModal && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-guest-title"
        >
          <div className="modal-content glass-panel" ref={addModalRef} tabIndex={-1}>
            <div className="modal-header">
              <h3 id="add-guest-title">Add Guest to Invitation List</h3>
              <button
                className="btn btn-ghost btn-sm icon-only"
                onClick={() => setShowAddModal(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGuest} className="modal-form">
              <div className="form-group">
                <label htmlFor="guest-name">Guest Full Name *</label>
                <input
                  id="guest-name"
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="guest-group">Group / Circle</label>
                  <input
                    id="guest-group"
                    type="text"
                    placeholder="e.g. College Friends, Family, Neighbors"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="guest-rsvp">RSVP Status</label>
                  <select
                    id="guest-rsvp"
                    value={rsvpStatus}
                    onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)}
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="guest-plus-ones">Plus Ones Allowed</label>
                  <input
                    id="guest-plus-ones"
                    type="number"
                    min="0"
                    max="10"
                    value={plusOnes}
                    onChange={(e) => setPlusOnes(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="guest-table">Table / Assigned Zone</label>
                  <input
                    id="guest-table"
                    type="text"
                    placeholder="e.g. Table 4 - Redwood"
                    value={tableOrZone}
                    onChange={(e) => setTableOrZone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="guest-dietary">Dietary Restrictions & Allergies</label>
                <input
                  id="guest-dietary"
                  type="text"
                  placeholder="e.g. Vegan, Gluten-Free, Severe Nut Allergy"
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
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
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
