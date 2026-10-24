import React from 'react';
import { 
  Printer, 
  Download, 
  FileText, 
  Calendar, 
  DollarSign, 
  Users, 
  MapPin, 
  Sparkles,
  CheckCircle2,
  Clock,
  Handshake,
  Heart
} from 'lucide-react';
import { EventPlan } from '../types';
import { exportService } from '../services/exportService';

interface MasterDossierTabProps {
  event: EventPlan;
}

export const MasterDossierTab: React.FC<MasterDossierTabProps> = ({ event }) => {
  const totalBudget = event.totalBudget || 1;
  const spent = event.budgetItems.reduce((acc, b) => acc + (b.actualCost || b.estimatedCost), 0);
  const paid = event.budgetItems.reduce((acc, b) => acc + b.paidCost, 0);
  const remaining = totalBudget - spent;
  const confirmedGuests = event.guests.filter(g => g.rsvpStatus === 'confirmed').reduce((acc, g) => acc + 1 + g.plusOnes, 0);

  return (
    <div className="dossier-tab-container">
      {/* Action Bar (Hidden when printed) */}
      <div className="dossier-action-bar glass-card no-print">
        <div className="dossier-meta">
          <FileText className="text-brand" size={24} />
          <div>
            <h3>Master Planning Dossier</h3>
            <p className="card-sub-text">
              Comprehensive executive blueprint. Click below to print or download.
            </p>
          </div>
        </div>

        <div className="dossier-btns">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => exportService.downloadMarkdown(event)}
          >
            <Download size={15} />
            <span>Download Markdown</span>
          </button>

          <button 
            className="btn btn-primary btn-sm"
            onClick={() => exportService.printDossier()}
          >
            <Printer size={15} />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* The Printable Document */}
      <article className="dossier-document glass-panel" aria-label="Master Planning Blueprint">
        <header className="dossier-header">
          <div className="dossier-badge-row">
            <span className="badge badge-brand">CelebrAIte Official Master Dossier</span>
            <span className="dossier-timestamp">Document Generated: {new Date().toLocaleDateString()}</span>
          </div>

          <h1 className="dossier-title">{event.title}</h1>
          <p className="dossier-vibe"><em>Theme & Atmosphere:</em> "{event.vibe}"</p>

          <div className="dossier-overview-grid">
            <div className="overview-item">
              <strong>Event Date:</strong>
              <span>{event.date}</span>
            </div>
            <div className="overview-item">
              <strong>Location:</strong>
              <span>{event.location}</span>
            </div>
            <div className="overview-item">
              <strong>Target / Confirmed Guests:</strong>
              <span>{event.targetGuests} Target ({confirmedGuests} Confirmed)</span>
            </div>
            <div className="overview-item">
              <strong>Total Financial Target:</strong>
              <span>{event.currencySymbol}{event.totalBudget.toLocaleString()} {event.currency}</span>
            </div>
          </div>
        </header>

        <hr className="dossier-divider" />

        {/* Financial Section */}
        <section className="dossier-section">
          <h2>1. Financial Allocation & Accounts</h2>
          <div className="dossier-financial-summary">
            <span><strong>Total Target:</strong> {event.currencySymbol}{totalBudget.toLocaleString()}</span>
            <span><strong>Committed Spend:</strong> {event.currencySymbol}{spent.toLocaleString()}</span>
            <span><strong>Paid to Date:</strong> {event.currencySymbol}{paid.toLocaleString()}</span>
            <span><strong>Buffer Remaining:</strong> {event.currencySymbol}{remaining.toLocaleString()}</span>
          </div>

          <table className="dossier-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Item Description</th>
                <th>Estimated</th>
                <th>Actual</th>
                <th>Paid</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {event.budgetItems.map(item => (
                <tr key={item.id}>
                  <td>{item.category}</td>
                  <td>
                    <strong>{item.name}</strong>
                    {item.notes && <div className="sub-note">{item.notes}</div>}
                  </td>
                  <td>{event.currencySymbol}{item.estimatedCost.toLocaleString()}</td>
                  <td>{event.currencySymbol}{item.actualCost.toLocaleString()}</td>
                  <td>{event.currencySymbol}{item.paidCost.toLocaleString()}</td>
                  <td>{item.status.replace('_', ' ').toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <hr className="dossier-divider" />

        {/* Schedule & Run of Show */}
        <section className="dossier-section">
          <h2>2. Master Timeline & Schedule of Events</h2>
          <div className="dossier-timeline-list">
            {event.timelineItems.map(item => (
              <div key={item.id} className="dossier-timeline-row">
                <span className="dossier-time-tag">[{item.phase.toUpperCase()}] {item.targetDateOrTime}</span>
                <div className="dossier-timeline-info">
                  <strong>{item.title} {item.completed && '✓ (Completed)'}</strong>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr className="dossier-divider" />

        {/* Key Vendors */}
        <section className="dossier-section">
          <h2>3. Contracted Vendors & Service Partners</h2>
          <div className="dossier-vendors-grid">
            {event.vendors.map(v => (
              <div key={v.id} className="dossier-vendor-box">
                <h4>{v.name} ({v.category})</h4>
                <p><strong>Contact:</strong> {v.contactPerson} | {v.phone} | {v.email}</p>
                <p><strong>Agreed Price:</strong> {event.currencySymbol}{v.agreedCost.toLocaleString()} ({v.status.toUpperCase()})</p>
                {v.notes && <p className="sub-note"><em>Notes:</em> {v.notes}</p>}
              </div>
            ))}
          </div>
        </section>

        <hr className="dossier-divider" />

        {/* Creative Blueprints & Speeches */}
        <section className="dossier-section">
          <h2>4. Creative Concept & Program Highlights</h2>
          <p><strong>Theme:</strong> {event.personalizedIdeas.themeName} - {event.personalizedIdeas.themeDescription}</p>
          
          <div className="dossier-palette-preview">
            <strong>Palette:</strong>
            {event.personalizedIdeas.colorPalette.map((c, i) => (
              <span key={i} className="palette-inline-tag" style={{ borderLeft: `8px solid ${c.hex}` }}>
                {c.name} ({c.hex})
              </span>
            ))}
          </div>

          <div className="dossier-speeches-block">
            <h3>Custom Speeches & Host Address:</h3>
            {event.personalizedIdeas.customSpeeches.map((sp, idx) => (
              <blockquote key={idx} className="dossier-quote">
                <strong>{sp.title} ({sp.role}):</strong><br />
                "{sp.text}"
              </blockquote>
            ))}
          </div>
        </section>

        <footer className="dossier-footer">
          <p>CelebrAIte Event Operating System • Prepared for flawless execution on {event.date}.</p>
        </footer>
      </article>
    </div>
  );
};
