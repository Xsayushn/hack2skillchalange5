import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import 'vitest-axe/extend-expect';
import { axe } from 'vitest-axe';
import { App } from '../App';
import { SettingsModal } from '../components/SettingsModal';
import { WizardStepLogistics } from '../components/wizard/WizardStepLogistics';
import { storageService } from '../services/storageService';

// Pre-import lazy components to ensure instant chunk resolution in test runner
import '../components/OverviewTab';
import '../components/BudgetTab';
import '../components/TimelineTab';
import '../components/VendorsTab';
import '../components/IdeasMoodboardTab';
import '../components/GuestListTab';
import '../components/MasterDossierTab';
import '../components/AssistantDrawer';

describe('App & Accessibility Integration Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    storageService.resetToDefaults();
  });

  it('App renders main workspace and navigates across lazy tabs', async () => {
    render(<App />);

    // Initial Overview tab
    expect(screen.getByText('CelebrAIte')).toBeInTheDocument();
    expect(screen.getAllByText('Autonomous GenAI Event Architect').length).toBeGreaterThan(0);

    // Verify initial event title is in document
    const initialEvents = storageService.loadEvents();
    expect(screen.getByText(initialEvents[0].title)).toBeInTheDocument();

    // Switch to Budget Planner tab (lazy loaded)
    const budgetTab = screen.getByRole('tab', { name: /Budget Planner/i });
    fireEvent.click(budgetTab);
    await waitFor(
      () => {
        expect(screen.getByText('Target Budget')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Switch to Timeline & Run-of-Show tab
    const timelineTab = screen.getByRole('tab', { name: /Timeline/i });
    fireEvent.click(timelineTab);
    await waitFor(
      () => {
        expect(screen.getByText('Schedule of Milestones & Run-of-Show')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Switch to Vendor Directory tab
    const vendorsTab = screen.getByRole('tab', { name: /Vendor Directory/i });
    fireEvent.click(vendorsTab);
    await waitFor(
      () => {
        expect(screen.getByText('Vendor Directory & Contract Checklists')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Switch to AI Ideas & Moodboard tab
    const moodboardTab = screen.getByRole('tab', { name: /Ideas & Moodboard/i });
    fireEvent.click(moodboardTab);
    await waitFor(
      () => {
        expect(screen.getByText('Harmonious Color Palette')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Switch to Guest & RSVP Hub tab
    const guestsTab = screen.getByRole('tab', { name: /Guest/i });
    fireEvent.click(guestsTab);
    await waitFor(
      () => {
        expect(screen.getByText('Confirmed Attendees')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Switch to Master Dossier tab
    const dossierTab = screen.getByRole('tab', { name: /Master Dossier/i });
    fireEvent.click(dossierTab);
    await waitFor(
      () => {
        expect(screen.getByText('Master Planning Dossier')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  }, 15000);

  it('App handles theme toggling and modal launches', async () => {
    render(<App />);

    // Toggle theme button
    const themeBtn = screen.getByLabelText(/Toggle theme mode/i);
    fireEvent.click(themeBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    fireEvent.click(themeBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('contrast');

    fireEvent.click(themeBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    // Launch Wizard
    const wizardBtn = screen.getByRole('button', { name: /Launch AI Event Wizard/i });
    fireEvent.click(wizardBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Autonomous GenAI Event Architect/i })
    ).toBeInTheDocument();

    // Close Wizard via close button
    const closeWizardBtn = screen.getByLabelText(/Close Event Wizard/i);
    fireEvent.click(closeWizardBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Open Copilot Drawer
    const copilotBtn = screen.getByLabelText(/Open CelebrAIte AI Assistant/i);
    fireEvent.click(copilotBtn);
    await waitFor(() => {
      expect(screen.getByText('CelebrAIte Co-Pilot')).toBeInTheDocument();
    });

    // Close Copilot Drawer via close button
    const closeCopilotBtn = screen.getByLabelText(/Close Assistant Drawer/i);
    fireEvent.click(closeCopilotBtn);
  });

  it('SettingsModal handles connection testing, password visibility, and data import/export', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ models: [{ name: 'models/gemini-3.8-flash' }] })
    });

    const handleSave = vi.fn();
    const handleReset = vi.fn();
    const handleImport = vi.fn();
    const handleClose = vi.fn();

    render(
      <SettingsModal
        isOpen={true}
        onClose={handleClose}
        aiSettings={{ apiKey: '', model: 'gemini-3.8-flash', useOfflineFallback: true }}
        onSaveAISettings={handleSave}
        onResetData={handleReset}
        onImportData={handleImport}
      />
    );

    // Toggle password visibility
    const visibilityBtn = screen.getByLabelText(/Show API key/i);
    fireEvent.click(visibilityBtn);
    expect(screen.getByLabelText(/Hide API key/i)).toBeInTheDocument();

    // Enter API key
    const keyInput = screen.getByLabelText(/Gemini API Key/i);
    fireEvent.change(keyInput, { target: { value: 'AIzaSyTestValid123456789' } });

    // Test API Connection
    const testBtn = screen.getByRole('button', { name: /Test API Connection/i });
    fireEvent.click(testBtn);

    await waitFor(() => {
      expect(screen.getByText(/Key Valid!/i)).toBeInTheDocument();
    });

    // Select different model
    const modelSelect = screen.getByLabelText(/Gemini Model/i);
    fireEvent.change(modelSelect, { target: { value: 'gemini-3.6-flash' } });

    // Toggle offline fallback
    const fallbackToggle = screen.getByLabelText(/Enable automatic fallback/i);
    fireEvent.click(fallbackToggle);

    // Save Settings
    const saveBtn = screen.getByRole('button', { name: /Save Settings/i });
    fireEvent.click(saveBtn);
    expect(handleSave).toHaveBeenCalledWith({
      apiKey: 'AIzaSyTestValid123456789',
      model: 'gemini-3.6-flash',
      useOfflineFallback: false
    });

    // Export JSON Backup
    const exportBtn = screen.getByRole('button', { name: /Export JSON Backup/i });
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    fireEvent.click(exportBtn);
    expect(createObjectURLSpy).toHaveBeenCalled();
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();

    // Reset Data button
    const resetBtn = screen.getByRole('button', { name: /Reset to Sample Events/i });
    window.confirm = vi.fn().mockReturnValue(true);
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalled();

    global.fetch = originalFetch;
  });

  it('WizardStepLogistics updates all input form controls', () => {
    const setTitle = vi.fn();
    const setDate = vi.fn();
    const setGuests = vi.fn();
    const setLocation = vi.fn();
    const setVibe = vi.fn();

    render(
      <WizardStepLogistics
        eventType="wedding"
        title="Spring Gala"
        setTitle={setTitle}
        date="2026-06-15"
        setDate={setDate}
        targetGuests={120}
        setTargetGuests={setGuests}
        location="Rose Gardens"
        setLocation={setLocation}
        vibe="Lush & Botanical"
        setVibe={setVibe}
      />
    );

    fireEvent.change(screen.getByLabelText(/Event Title \*/i), { target: { value: 'New Gala' } });
    expect(setTitle).toHaveBeenCalledWith('New Gala');

    fireEvent.change(screen.getByLabelText(/Event Date \*/i), { target: { value: '2026-07-20' } });
    expect(setDate).toHaveBeenCalledWith('2026-07-20');

    fireEvent.change(screen.getByLabelText(/Expected Guests/i), { target: { value: '200' } });
    expect(setGuests).toHaveBeenCalledWith(200);

    fireEvent.change(screen.getByLabelText(/Venue \/ Location \*/i), {
      target: { value: 'Sky Lounge' }
    });
    expect(setLocation).toHaveBeenCalledWith('Sky Lounge');

    fireEvent.change(screen.getByLabelText(/Desired Vibe/i), { target: { value: 'Modern Chic' } });
    expect(setVibe).toHaveBeenCalledWith('Modern Chic');
  });

  it('Automated Axe accessibility check on SettingsModal passes with no WCAG violations', async () => {
    const { container } = render(
      <SettingsModal
        isOpen={true}
        onClose={vi.fn()}
        aiSettings={{ apiKey: '', model: 'gemini-3.8-flash', useOfflineFallback: true }}
        onSaveAISettings={vi.fn()}
        onResetData={vi.fn()}
        onImportData={vi.fn()}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
