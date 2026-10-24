import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Download, 
  Sparkles, 
  Trash2, 
  AlertCircle,
  CalendarCheck,
  Flame,
  ArrowUpDown
} from 'lucide-react';
import { EventPlan, TimelineItem, TimelinePhase } from '../types';
import { exportService } from '../services/exportService';

interface TimelineTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
  onAskAI: (prompt: string) => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  event,
  onUpdateEvent,
  onAskAI
}) => {
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newPhase, setNewPhase] = useState<TimelinePhase>('day_of');
  const [newTimeOrDate, setNewTimeOrDate] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('high');

  const phases: { id: string; label: string; count: number }[] = [
    { id: 'all', label: 'All Items', count: event.timelineItems.length },
    { id: 'foundation', label: 'Phase 1: Foundation (Months Out)', count: event.timelineItems.filter(t => t.phase === 'foundation').length },
    { id: 'bookings', label: 'Phase 2: Bookings (Weeks Out)', count: event.timelineItems.filter(t => t.phase === 'bookings').length },
    { id: 'final_prep', label: 'Phase 3: Final Prep (Days Before)', count: event.timelineItems.filter(t => t.phase === 'final_prep').length },
    { id: 'day_of', label: 'Phase 4: Day-of Run of Show', count: event.timelineItems.filter(t => t.phase === 'day_of').length }
  ];

  const handleToggle = (id: string) => {
    const updated = {
      ...event,
      timelineItems: event.timelineItems.map(t => t.id === id ? { ...t, completed: !t.completed } : t),
      updatedAt: new Date().toISOString()
    };
    onUpdateEvent(updated);
  };

  const handleDelete = (id: string) => {
    const updated = {
      ...event,
      timelineItems: event.timelineItems.filter(t => t.id !== id),
      updatedAt: new Date().toISOString()
    };
    onUpdateEvent(updated);
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const item: TimelineItem = {
      id: `tl-${Date.now().toString(36)}`,
      title: newTitle.trim(),
      phase: newPhase,
      targetDateOrTime: newTimeOrDate.trim() || 'Scheduled',
      description: newDesc.trim(),
      completed: false,
      priority: newPriority
    };

    const updated = {
      ...event,
      timelineItems: [...event.timelineItems, item],
      updatedAt: new Date().toISOString()
    };
    onUpdateEvent(updated);

    setNewTitle('');
    setNewTimeOrDate('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const filteredItems = event.timelineItems.filter(t => {
    if (selectedPhase === 'all') return true;
    return t.phase === selectedPhase;
  });

  const completedCount = event.timelineItems.filter(t => t.completed).length;

  return (
    <div className="timeline-tab-container">
      {/* Header Bar with Quick Stats & Calendar Export */}
      <div className="timeline-header-bar glass-card">
        <div className="timeline-stats-meta">
          <CalendarCheck className="text-brand" size={24} />
          <div>
            <h3>Schedule of Milestones & Run-of-Show</h3>
            <p className="card-sub-text">
              {completedCount} of {event.timelineItems.length} items checked off ({Math.round((completedCount / (event.timelineItems.length || 1)) * 100)}% complete)
            </p>
          </div>
        </div>

        <div className="timeline-actions-group">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => exportService.downloadIcs(event)}
            title="Download .ics Calendar file to sync with Google Calendar or Apple Calendar"
          >
            <Download size={15} />
            <span>Sync to Calendar (.ics)</span>
          </button>

          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={15} />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Phase Pills Navigation */}
      <div className="phase-pills-row" role="tablist" aria-label="Timeline Phases">
        {phases.map(p => (
          <button
            key={p.id}
            role="tab"
            aria-selected={selectedPhase === p.id}
            className={`phase-pill-btn ${selectedPhase === p.id ? 'active' : ''}`}
            onClick={() => setSelectedPhase(p.id)}
          >
            <span>{p.label}</span>
            <span className="pill-count-badge">{p.count}</span>
          </button>
        ))}
      </div>

      {/* AI Run of Show Banner */}
      {selectedPhase === 'day_of' && (
        <div className="alert-banner alert-brand">
          <Sparkles className="alert-icon" size={20} />
          <div className="alert-content">
            <strong>Day-of Coordination Mode:</strong> Hour-by-hour run of show for execution on {event.date}.
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onAskAI(`Generate a minute-by-minute contingency timeline for ${event.title} in case our caterer or photographer is delayed by 45 minutes.`)}
          >
            Generate Delay Buffer Plan
          </button>
        </div>
      )}

      {/* Timeline Items Listing */}
      <div className="timeline-items-flow">
        {filteredItems.length === 0 ? (
          <div className="empty-state-card glass-card">
            <Clock size={36} className="text-muted" />
            <h4>No milestones in this phase yet</h4>
            <p>Click "Add Milestone" to schedule a task or let AI auto-generate it.</p>
          </div>
        ) : (
          filteredItems.map((item, idx) => (
            <div 
              key={item.id} 
              className={`timeline-card glass-card ${item.completed ? 'item-completed' : ''} ${item.phase === 'day_of' ? 'day-of-highlight' : ''}`}
            >
              <div className="timeline-node-marker">
                <button 
                  className="checkbox-toggle-btn"
                  onClick={() => handleToggle(item.id)}
                  aria-label={`Toggle completion for ${item.title}`}
                >
                  {item.completed ? (
                    <CheckCircle2 size={22} className="text-emerald" />
                  ) : (
                    <Circle size={22} className="text-muted" />
                  )}
                </button>
                {idx !== filteredItems.length - 1 && <span className="timeline-connector-line" />}
              </div>

              <div className="timeline-item-body">
                <div className="timeline-title-row">
                  <div className="timeline-title-group">
                    <span className="time-badge">
                      <Clock size={13} />
                      {item.targetDateOrTime}
                    </span>
                    <h4 className="timeline-item-title">{item.title}</h4>
                  </div>

                  <div className="timeline-meta-tags">
                    <span className={`priority-tag priority-${item.priority}`}>
                      {item.priority === 'high' && <Flame size={12} />}
                      {item.priority.toUpperCase()}
                    </span>

                    <button 
                      className="btn btn-ghost btn-sm icon-only text-danger"
                      onClick={() => handleDelete(item.id)}
                      title="Delete milestone"
                      aria-label={`Delete ${item.title}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {item.description && (
                  <p className="timeline-desc-text">{item.description}</p>
                )}

                <div className="timeline-footer-row">
                  <span className="timeline-phase-tag">
                    {item.phase.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Milestone Modal */}
      {showAddModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-milestone-title">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3 id="add-milestone-title">Schedule New Milestone</h3>
              <button 
                className="btn btn-ghost btn-sm icon-only" 
                onClick={() => setShowAddModal(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="modal-form">
              <div className="form-group">
                <label htmlFor="milestone-title">Milestone Title *</label>
                <input 
                  id="milestone-title"
                  type="text" 
                  required
                  placeholder="e.g. Officiant Vows Rehearsal or Cake Delivery"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="milestone-phase">Phase</label>
                  <select 
                    id="milestone-phase"
                    value={newPhase}
                    onChange={(e) => setNewPhase(e.target.value as TimelinePhase)}
                  >
                    <option value="foundation">Phase 1: Foundation (Months Out)</option>
                    <option value="bookings">Phase 2: Bookings (Weeks Out)</option>
                    <option value="final_prep">Phase 3: Final Prep (Days Before)</option>
                    <option value="day_of">Phase 4: Day-of Run of Show</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="milestone-time">Target Time / Date Slot *</label>
                  <input 
                    id="milestone-time"
                    type="text"
                    required
                    placeholder="e.g. 02:30 PM or 3 Weeks Before"
                    value={newTimeOrDate}
                    onChange={(e) => setNewTimeOrDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="milestone-priority">Priority</label>
                <select 
                  id="milestone-priority"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                >
                  <option value="high">🔥 High Priority (Critical Path)</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="milestone-desc">Description & Instructions</label>
                <textarea 
                  id="milestone-desc"
                  rows={3}
                  placeholder="Specific details, personnel responsible, or contact coordinates..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
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
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
