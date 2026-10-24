import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Sparkles,
  PieChart,
  ListTodo,
  Handshake,
  Lightbulb,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';
import { EventPlan } from '../types';

export type TabType = 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas' | 'guests' | 'dossier';

interface EventHeaderProps {
  event: EventPlan;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const EventHeader: React.FC<EventHeaderProps> = ({
  event,
  activeTab,
  onTabChange
}) => {
  // Financial metrics
  const totalSpent = event.budgetItems.reduce((acc, b) => acc + (b.actualCost || b.estimatedCost), 0);
  const remaining = event.totalBudget - totalSpent;
  const budgetPercent = Math.min(100, Math.round((totalSpent / (event.totalBudget || 1)) * 100));

  // Timeline metrics
  const completedTasks = event.timelineItems.filter(t => t.completed).length;
  const totalTasks = event.timelineItems.length;
  const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Guest metrics
  const confirmedGuests = event.guests.filter(g => g.rsvpStatus === 'confirmed').reduce((acc, g) => acc + 1 + g.plusOnes, 0);

  // Countdown Calculation
  const daysRemaining = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'wedding': return 'badge-wedding';
      case 'birthday': return 'badge-birthday';
      case 'community': case 'festival': return 'badge-community';
      default: return 'badge-neutral';
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'overview', label: 'Overview', icon: <PieChart size={17} /> },
    { id: 'budget', label: 'Budget Planner', icon: <DollarSign size={17} />, badge: `${event.currencySymbol}${totalSpent.toLocaleString()}` },
    { id: 'timeline', label: 'Timeline & Run-of-Show', icon: <ListTodo size={17} />, badge: `${completedTasks}/${totalTasks}` },
    { id: 'vendors', label: 'Vendor Directory', icon: <Handshake size={17} />, badge: event.vendors.length },
    { id: 'ideas', label: 'AI Ideas & Moodboard', icon: <Lightbulb size={17} /> },
    { id: 'guests', label: 'Guest & RSVP Hub', icon: <UserCheck size={17} />, badge: confirmedGuests },
    { id: 'dossier', label: 'Master Dossier', icon: <FileSpreadsheet size={17} /> }
  ];

  return (
    <section className="event-header-container glass-panel no-print" aria-labelledby="event-title">
      {/* Top Banner Details */}
      <div className="event-header-main">
        <div className="event-header-info">
          <div className="event-meta-top">
            <span className={`badge ${getBadgeClass(event.type)}`}>
              {event.type.toUpperCase()}
            </span>
            <span className="event-countdown-badge">
              <Clock size={13} />
              {daysRemaining > 0 
                ? `${daysRemaining} days remaining` 
                : daysRemaining === 0 
                  ? 'Celebration is Today! 🎉' 
                  : `${Math.abs(daysRemaining)} days ago`}
            </span>
          </div>

          <h1 id="event-title" className="event-title-text">
            {event.title}
          </h1>

          <div className="event-sub-details">
            <span className="meta-item">
              <Calendar size={15} className="meta-icon" />
              <time dateTime={event.date}>
                {new Date(event.date + 'T00:00:00').toLocaleDateString(undefined, { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </time>
            </span>

            <span className="meta-item">
              <MapPin size={15} className="meta-icon" />
              <span>{event.location}</span>
            </span>

            <span className="meta-item">
              <Users size={15} className="meta-icon" />
              <span>Target: {event.targetGuests} Guests</span>
            </span>

            <span className="meta-item vibe-item">
              <Sparkles size={15} className="meta-icon text-brand" />
              <span className="vibe-text">"{event.vibe}"</span>
            </span>
          </div>
        </div>

        {/* Quick KPI Stat Widgets */}
        <div className="header-kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Committed Spend</span>
            <div className="kpi-val-group">
              <span className="kpi-number">{event.currencySymbol}{totalSpent.toLocaleString()}</span>
              <span className="kpi-sub">of {event.currencySymbol}{event.totalBudget.toLocaleString()}</span>
            </div>
            <div className="progress-bar-track" title={`${budgetPercent}% allocated`}>
              <div 
                className={`progress-bar-fill ${remaining < 0 ? 'fill-danger' : 'fill-primary'}`} 
                style={{ width: `${Math.min(100, budgetPercent)}%` }} 
              />
            </div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Tasks Progress</span>
            <div className="kpi-val-group">
              <span className="kpi-number">{taskPercent}%</span>
              <span className="kpi-sub">{completedTasks} of {totalTasks} done</span>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill fill-emerald" 
                style={{ width: `${taskPercent}%` }} 
              />
            </div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">RSVP Attendees</span>
            <div className="kpi-val-group">
              <span className="kpi-number">{confirmedGuests}</span>
              <span className="kpi-sub">confirmed of {event.targetGuests}</span>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill fill-brand" 
                style={{ width: `${Math.min(100, Math.round((confirmedGuests / (event.targetGuests || 1)) * 100))}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <nav className="header-tabs-nav" aria-label="Event Sections">
        <ul className="tabs-list" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id} role="presentation">
                <button
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  className={`tab-btn ${isActive ? 'tab-active' : ''}`}
                  onClick={() => onTabChange(tab.id)}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="tab-badge">{tab.badge}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
};
