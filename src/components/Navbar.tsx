import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  PlusCircle, 
  Sun, 
  Moon, 
  Eye, 
  Settings, 
  Download, 
  FileText, 
  RotateCcw,
  Check
} from 'lucide-react';
import { EventPlan } from '../types';
import { exportService } from '../services/exportService';

interface NavbarProps {
  events: EventPlan[];
  activeEvent: EventPlan;
  onSelectEvent: (id: string) => void;
  onOpenWizard: () => void;
  onOpenSettings: () => void;
  theme: 'dark' | 'light' | 'contrast';
  onToggleTheme: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  events,
  activeEvent,
  onSelectEvent,
  onOpenWizard,
  onOpenSettings,
  theme,
  onToggleTheme,
  onResetData
}) => {
  const [exportOpen, setExportOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleExportIcs = () => {
    exportService.downloadIcs(activeEvent);
    setExportOpen(false);
  };

  const handleExportJson = () => {
    exportService.downloadJson(activeEvent);
    setExportOpen(false);
  };

  const handleExportMarkdown = () => {
    exportService.downloadMarkdown(activeEvent);
    setExportOpen(false);
  };

  const handlePrint = () => {
    exportService.printDossier();
    setExportOpen(false);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
    setExportOpen(false);
  };

  return (
    <header className="navbar-container no-print" role="banner">
      <div className="navbar-brand">
        <div className="logo-icon-wrapper" aria-hidden="true">
          <Sparkles className="logo-sparkle" size={22} />
        </div>
        <div className="logo-text-group">
          <span className="brand-name">CelebrAIte</span>
          <span className="brand-tagline">Autonomous GenAI Event Architect</span>
        </div>
      </div>

      {/* Center: Event Selector & Creation */}
      <div className="navbar-center">
        <div className="event-selector-wrapper">
          <Calendar size={16} className="text-muted" aria-hidden="true" />
          <select 
            className="event-dropdown" 
            value={activeEvent.id} 
            onChange={(e) => onSelectEvent(e.target.value)}
            aria-label="Select active event plan"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.type === 'wedding' ? '💍' : ev.type === 'birthday' ? '🎂' : '🌳'} {ev.title}
              </option>
            ))}
          </select>
        </div>

        <button 
          className="btn btn-primary btn-sm wizard-launch-btn"
          onClick={onOpenWizard}
          aria-label="Launch AI Event Wizard to create a new celebration"
        >
          <PlusCircle size={16} />
          <span>New AI Event</span>
        </button>
      </div>

      {/* Right: Actions, Theme, Export, Settings */}
      <div className="navbar-actions">
        {/* Export / Share Dropdown */}
        <div className="export-menu-container">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setExportOpen(!exportOpen)}
            aria-expanded={exportOpen}
            aria-haspopup="true"
            aria-label="Export and share options"
          >
            <Download size={15} />
            <span>Export & Share</span>
          </button>

          {exportOpen && (
            <div className="dropdown-popover glass-panel" role="menu">
              <button className="dropdown-item" onClick={handleExportIcs} role="menuitem">
                <Calendar size={16} className="text-brand" />
                <div>
                  <strong>Calendar Sync (.ics)</strong>
                  <small>Google, Apple & Outlook calendars</small>
                </div>
              </button>

              <button className="dropdown-item" onClick={handleExportMarkdown} role="menuitem">
                <FileText size={16} className="text-brand" />
                <div>
                  <strong>Markdown Dossier (.md)</strong>
                  <small>Vendor-ready master brief</small>
                </div>
              </button>

              <button className="dropdown-item" onClick={handleExportJson} role="menuitem">
                <Download size={16} className="text-brand" />
                <div>
                  <strong>Export JSON Data</strong>
                  <small>Complete backup file</small>
                </div>
              </button>

              <button className="dropdown-item" onClick={handlePrint} role="menuitem">
                <FileText size={16} className="text-brand" />
                <div>
                  <strong>Printable Event Dossier</strong>
                  <small>PDF / Printer-optimized sheet</small>
                </div>
              </button>

              <div className="dropdown-divider" />

              <button className="dropdown-item" onClick={handleCopyShareLink} role="menuitem">
                {copiedNotification ? <Check size={16} className="text-emerald" /> : <Sparkles size={16} />}
                <div>
                  <strong>{copiedNotification ? 'Link Copied!' : 'Copy App Link'}</strong>
                  <small>Share with co-planners</small>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Theme Mode Switcher */}
        <button 
          className="btn btn-ghost btn-sm icon-only" 
          onClick={onToggleTheme}
          title={`Switch Theme (Current: ${theme})`}
          aria-label={`Toggle theme mode. Current: ${theme}`}
        >
          {theme === 'dark' ? <Sun size={17} /> : theme === 'light' ? <Eye size={17} /> : <Moon size={17} />}
        </button>

        {/* Reset Demo Data */}
        <button 
          className="btn btn-ghost btn-sm icon-only" 
          onClick={onResetData}
          title="Reset to Starter Events"
          aria-label="Reset workspace to default demo events"
        >
          <RotateCcw size={16} />
        </button>

        {/* Settings */}
        <button 
          className="btn btn-ghost btn-sm icon-only" 
          onClick={onOpenSettings}
          title="AI Settings & API Keys"
          aria-label="Open AI Settings"
        >
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
};
