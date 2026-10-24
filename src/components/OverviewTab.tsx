import React from 'react';
import { 
  DollarSign, 
  Clock, 
  Handshake, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  TrendingUp,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { EventPlan, TimelineItem } from '../types';
import { TabType } from './EventHeader';

interface OverviewTabProps {
  event: EventPlan;
  onNavigateTab: (tab: TabType) => void;
  onToggleTimelineItem: (itemId: string) => void;
  onAskAI: (prompt: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  event,
  onNavigateTab,
  onToggleTimelineItem,
  onAskAI
}) => {
  const totalBudget = event.totalBudget || 1;
  const spent = event.budgetItems.reduce((acc, b) => acc + (b.actualCost || b.estimatedCost), 0);
  const paid = event.budgetItems.reduce((acc, b) => acc + b.paidCost, 0);
  const remaining = totalBudget - spent;
  const isOverBudget = remaining < 0;

  // Next 5 pending timeline items
  const upcomingTasks = event.timelineItems.filter(t => !t.completed).slice(0, 5);

  // Group budget by categories for quick visualization
  const categoryTotals: Record<string, number> = {};
  event.budgetItems.forEach(item => {
    const cost = item.actualCost || item.estimatedCost;
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + cost;
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="overview-tab-container">
      {/* Top Banner Alert / Insights */}
      {isOverBudget ? (
        <div className="alert-banner alert-warning">
          <AlertTriangle className="alert-icon" size={20} />
          <div className="alert-content">
            <strong>Budget Allocation Exceeded:</strong> You are currently {event.currencySymbol}{Math.abs(remaining).toLocaleString()} over your initial target budget.
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onAskAI("Analyze our budget allocations and suggest 4 high-impact areas to trim expenses.")}
          >
            <Sparkles size={14} />
            Ask AI to Trim Budget
          </button>
        </div>
      ) : (
        <div className="alert-banner alert-success">
          <TrendingUp className="alert-icon" size={20} />
          <div className="alert-content">
            <strong>Budget On Track:</strong> You have {event.currencySymbol}{remaining.toLocaleString()} {event.currency} uncommitted buffer remaining.
          </div>
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => onAskAI("How should we allocate our remaining budget buffer for maximum guest delight?")}
          >
            <Lightbulb size={14} />
            AI Buffer Suggestions
          </button>
        </div>
      )}

      {/* Grid Layout: Budget Highlight & Timeline Milestones */}
      <div className="overview-grid">
        {/* Left Column: Financial & Category Split */}
        <div className="overview-col glass-card">
          <div className="card-header-flex">
            <div>
              <h3>Financial Pulse</h3>
              <p className="card-sub-text">Real-time expense commitments vs target budget</p>
            </div>
            <button 
              className="btn btn-ghost btn-sm text-brand"
              onClick={() => onNavigateTab('budget')}
            >
              <span>Manage Budget</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="financial-stats-box">
            <div className="stat-pill">
              <span className="pill-title">Total Target</span>
              <span className="pill-val">{event.currencySymbol}{totalBudget.toLocaleString()}</span>
            </div>
            <div className="stat-pill">
              <span className="pill-title">Committed</span>
              <span className="pill-val text-brand">{event.currencySymbol}{spent.toLocaleString()}</span>
            </div>
            <div className="stat-pill">
              <span className="pill-title">Paid Out</span>
              <span className="pill-val text-emerald">{event.currencySymbol}{paid.toLocaleString()}</span>
            </div>
            <div className="stat-pill">
              <span className="pill-title">Remaining Buffer</span>
              <span className={`pill-val ${isOverBudget ? 'text-danger' : 'text-emerald'}`}>
                {event.currencySymbol}{remaining.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Top Spending Categories */}
          <div className="top-categories-section">
            <h4>Top Investment Categories</h4>
            <div className="categories-meter-list">
              {sortedCategories.map(([catName, amount]) => {
                const pct = Math.round((amount / totalBudget) * 100);
                return (
                  <div key={catName} className="category-meter-item">
                    <div className="category-meta-row">
                      <span className="cat-name">{catName}</span>
                      <span className="cat-cost">
                        {event.currencySymbol}{amount.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div className="meter-track">
                      <div className="meter-fill" style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Priority Milestones */}
        <div className="overview-col glass-card">
          <div className="card-header-flex">
            <div>
              <h3>Priority Checklist</h3>
              <p className="card-sub-text">Upcoming critical milestones & countdown</p>
            </div>
            <button 
              className="btn btn-ghost btn-sm text-brand"
              onClick={() => onNavigateTab('timeline')}
            >
              <span>Full Timeline</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="upcoming-tasks-list">
            {upcomingTasks.length === 0 ? (
              <div className="empty-state-notice">
                <CheckCircle2 size={32} className="text-emerald" />
                <p>All priority milestones are checked off! You are in peak preparation.</p>
              </div>
            ) : (
              upcomingTasks.map((task: TimelineItem) => (
                <div key={task.id} className="overview-task-item">
                  <button 
                    className="task-checkbox-btn"
                    onClick={() => onToggleTimelineItem(task.id)}
                    aria-label={`Mark task "${task.title}" as complete`}
                  >
                    {task.completed ? <CheckCircle2 className="text-emerald" size={20} /> : <Circle className="text-muted" size={20} />}
                  </button>
                  <div className="task-content-group">
                    <div className="task-title-row">
                      <span className="task-title-text">{task.title}</span>
                      <span className="task-time-pill">{task.targetDateOrTime}</span>
                    </div>
                    <p className="task-desc-text">{task.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Creative Concept Preview & Quick Assistant Prompts */}
      <div className="overview-bottom-grid">
        {/* Creative Theme Spotlight */}
        <div className="glass-card theme-spotlight-card">
          <div className="card-header-flex">
            <div>
              <span className="badge badge-neutral">GenAI Aesthetic Blueprint</span>
              <h3>{event.personalizedIdeas.themeName}</h3>
            </div>
            <button 
              className="btn btn-ghost btn-sm text-brand"
              onClick={() => onNavigateTab('ideas')}
            >
              <span>Explore Moodboard</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <p className="theme-concept-desc">{event.personalizedIdeas.themeDescription}</p>

          <div className="color-palette-bar">
            {event.personalizedIdeas.colorPalette.map((swatch, idx) => (
              <div key={idx} className="palette-chip" title={`${swatch.name} (${swatch.hex})`}>
                <span className="chip-circle" style={{ backgroundColor: swatch.hex }} />
                <span className="chip-label">{swatch.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Assistant Launchpad */}
        <div className="glass-card ai-launchpad-card">
          <div className="launchpad-header">
            <Sparkles className="text-brand" size={20} />
            <h4>CelebrAIte Co-Pilot Quick Prompts</h4>
          </div>
          <p className="launchpad-sub">Context-aware instant recommendations for your {event.type}:</p>

          <div className="prompt-pills-grid">
            <button 
              className="quick-prompt-btn"
              onClick={() => onAskAI(`What are 5 essential questions to ask our catering vendor for ${event.title}?`)}
            >
              🤝 Catering Contract Questions
            </button>
            <button 
              className="quick-prompt-btn"
              onClick={() => onAskAI(`Draft a 3-minute warm and funny welcome toast for our ${event.targetGuests} guests.`)}
            >
              🎙️ Draft Welcome Speech
            </button>
            <button 
              className="quick-prompt-btn"
              onClick={() => onAskAI(`Create an emergency bad weather & delay contingency plan for ${event.location}.`)}
            >
              ☔ Rain & Weather Contingency
            </button>
            <button 
              className="quick-prompt-btn"
              onClick={() => onAskAI(`Suggest 3 interactive crowd icebreakers for ${event.type} at ${event.location}.`)}
            >
              🎉 Interactive Guest Games
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
