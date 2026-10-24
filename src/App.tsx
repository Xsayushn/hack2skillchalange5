import React, { useState, useEffect } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  EventHeader, 
  TabType 
} from './components/EventHeader';
import { 
  OverviewTab 
} from './components/OverviewTab';
import { 
  BudgetTab 
} from './components/BudgetTab';
import { 
  TimelineTab 
} from './components/TimelineTab';
import { 
  VendorsTab 
} from './components/VendorsTab';
import { 
  IdeasMoodboardTab 
} from './components/IdeasMoodboardTab';
import { 
  GuestListTab 
} from './components/GuestListTab';
import { 
  MasterDossierTab 
} from './components/MasterDossierTab';
import { 
  EventWizardModal 
} from './components/EventWizardModal';
import { 
  AssistantDrawer 
} from './components/AssistantDrawer';
import { 
  SettingsModal 
} from './components/SettingsModal';
import { 
  EventPlan, 
  AISettings 
} from './types';
import { 
  storageService 
} from './services/storageService';
import { 
  Sparkles, 
  Bot 
} from 'lucide-react';

export const App: React.FC = () => {
  // Core state
  const [events, setEvents] = useState<EventPlan[]>(() => storageService.loadEvents());
  const [activeEventId, setActiveEventId] = useState<string>(() => storageService.getActiveEventId());
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Theme & Preferences
  const [theme, setTheme] = useState<'dark' | 'light' | 'contrast'>(() => storageService.loadTheme());
  const [aiSettings, setAISettings] = useState<AISettings>(() => storageService.loadAISettings());

  // Modal dialog states
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [initialAssistantPrompt, setInitialAssistantPrompt] = useState<string | null>(null);

  // Sync theme changes to html data-theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    storageService.saveTheme(theme);
  }, [theme]);

  // Sync active event ID
  useEffect(() => {
    storageService.saveActiveEventId(activeEventId);
  }, [activeEventId]);

  // Sync events array changes to local storage
  const handleUpdateEvents = (updatedEvents: EventPlan[]) => {
    setEvents(updatedEvents);
    storageService.saveEvents(updatedEvents);
  };

  // Find active event with safe fallback
  const activeEvent = events.find(e => e.id === activeEventId) || events[0];

  // Update single active event
  const handleUpdateActiveEvent = (updated: EventPlan) => {
    const updatedEvents = events.map(e => e.id === updated.id ? updated : e);
    handleUpdateEvents(updatedEvents);
  };

  // Handle Event created from Wizard
  const handleEventCreated = (newEvent: EventPlan) => {
    const updatedEvents = [newEvent, ...events];
    handleUpdateEvents(updatedEvents);
    setActiveEventId(newEvent.id);
    setActiveTab('overview');
  };

  // Theme Toggler: cycles dark -> light -> contrast -> dark
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'contrast' : 'dark';
    setTheme(nextTheme);
  };

  // Reset to starter data
  const handleResetData = () => {
    const defaultEvents = storageService.resetToDefaults();
    setEvents(defaultEvents);
    setActiveEventId(defaultEvents[0].id);
    setActiveTab('overview');
  };

  // Save AI Settings
  const handleSaveAISettings = (newSettings: AISettings) => {
    setAISettings(newSettings);
    storageService.saveAISettings(newSettings);
  };

  // Handle Ask AI from any tab
  const handleAskAI = (prompt: string) => {
    setInitialAssistantPrompt(prompt);
    setIsAssistantOpen(true);
  };

  return (
    <div className="app-shell">
      {/* WCAG Skip to Main Content Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Top Navigation Bar */}
      <Navbar 
        events={events}
        activeEvent={activeEvent}
        onSelectEvent={setActiveEventId}
        onOpenWizard={() => setIsWizardOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onResetData={handleResetData}
      />

      {/* Main Workspace Container */}
      <main id="main-content" className="main-content-layout">
        {/* Header & Section Navigation */}
        <EventHeader 
          event={activeEvent}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Dynamic Tab Panes */}
        <section className="tab-pane-container" role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === 'overview' && (
            <OverviewTab 
              event={activeEvent}
              onNavigateTab={setActiveTab}
              onToggleTimelineItem={(itemId) => {
                const updated = {
                  ...activeEvent,
                  timelineItems: activeEvent.timelineItems.map(t => t.id === itemId ? { ...t, completed: !t.completed } : t),
                  updatedAt: new Date().toISOString()
                };
                handleUpdateActiveEvent(updated);
              }}
              onAskAI={handleAskAI}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetTab 
              event={activeEvent}
              onUpdateEvent={handleUpdateActiveEvent}
              onAskAI={handleAskAI}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineTab 
              event={activeEvent}
              onUpdateEvent={handleUpdateActiveEvent}
              onAskAI={handleAskAI}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorsTab 
              event={activeEvent}
              onUpdateEvent={handleUpdateActiveEvent}
              onAskAI={handleAskAI}
            />
          )}

          {activeTab === 'ideas' && (
            <IdeasMoodboardTab 
              event={activeEvent}
              onUpdateEvent={handleUpdateActiveEvent}
              onAskAI={handleAskAI}
            />
          )}

          {activeTab === 'guests' && (
            <GuestListTab 
              event={activeEvent}
              onUpdateEvent={handleUpdateActiveEvent}
              onAskAI={handleAskAI}
            />
          )}

          {activeTab === 'dossier' && (
            <MasterDossierTab 
              event={activeEvent}
            />
          )}
        </section>
      </main>

      {/* Floating AI Co-Pilot Launcher */}
      <aside className="floating-assistant-launcher no-print" aria-label="AI Co-Pilot Trigger">
        <button 
          className="assistant-fab-btn"
          onClick={() => setIsAssistantOpen(true)}
          aria-label="Open CelebrAIte AI Assistant"
        >
          <div className="fab-glow" />
          <Bot size={22} className="fab-icon" />
          <span className="fab-text">AI Co-Pilot</span>
          <span className="fab-dot-pulse" />
        </button>
      </aside>

      {/* Modals & Drawers */}
      <EventWizardModal 
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onEventCreated={handleEventCreated}
      />

      <AssistantDrawer 
        isOpen={isAssistantOpen}
        onClose={() => {
          setIsAssistantOpen(false);
          setInitialAssistantPrompt(null);
        }}
        event={activeEvent}
        aiSettings={aiSettings}
        onOpenSettings={() => {
          setIsAssistantOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        aiSettings={aiSettings}
        onSaveAISettings={handleSaveAISettings}
        onResetData={handleResetData}
        onImportData={(imported) => {
          setEvents(imported);
          if (imported[0]) setActiveEventId(imported[0].id);
        }}
      />
    </div>
  );
};
