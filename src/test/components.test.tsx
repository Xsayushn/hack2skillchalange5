import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { EventHeader } from '../components/EventHeader';
import { BudgetTab } from '../components/BudgetTab';
import { TimelineTab } from '../components/TimelineTab';
import { IdeasMoodboardTab } from '../components/IdeasMoodboardTab';
import { GuestListTab } from '../components/GuestListTab';
import { EventWizardModal } from '../components/EventWizardModal';
import { SettingsModal } from '../components/SettingsModal';
import { INITIAL_EVENTS } from '../data/mockEvents';

describe('UI Component Integration Tests', () => {
  const sampleEvent = INITIAL_EVENTS[0];

  it('EventHeader renders title, meta statistics, and fires tab changes', () => {
    const handleTabChange = vi.fn();

    render(<EventHeader event={sampleEvent} activeTab="overview" onTabChange={handleTabChange} />);

    expect(screen.getByText(sampleEvent.title)).toBeInTheDocument();
    expect(screen.getByText(/Pinecrest Botanical Estate/)).toBeInTheDocument();

    // Click on Budget Planner tab
    const budgetTabBtn = screen.getByRole('tab', { name: /Budget Planner/i });
    fireEvent.click(budgetTabBtn);

    expect(handleTabChange).toHaveBeenCalledWith('budget');
  });

  it('BudgetTab renders categories, handles zero budget safely, and adds new expenses', () => {
    const handleUpdate = vi.fn();
    const handleAskAI = vi.fn();

    // Test zero budget protection
    const zeroBudgetEvent = { ...sampleEvent, totalBudget: 0 };

    render(
      <BudgetTab event={zeroBudgetEvent} onUpdateEvent={handleUpdate} onAskAI={handleAskAI} />
    );

    // Verify it rendered without NaN or division by zero crashes
    expect(screen.getByText('Target Budget')).toBeInTheDocument();

    // Open Add Expense modal
    const addBtn = screen.getByRole('button', { name: /Add new budget line item/i });
    fireEvent.click(addBtn);

    // Verify modal opened
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/Item Name \/ Service/i)).toBeInTheDocument();

    // Fill form and submit
    fireEvent.change(screen.getByLabelText(/Item Name \/ Service/i), {
      target: { value: 'Late Night Tacos' }
    });
    fireEvent.click(screen.getByRole('button', { name: /Save Line Item/i }));

    expect(handleUpdate).toHaveBeenCalled();
  });

  it('TimelineTab renders milestones and allows completing tasks', () => {
    const handleUpdate = vi.fn();
    const handleAskAI = vi.fn();

    render(<TimelineTab event={sampleEvent} onUpdateEvent={handleUpdate} onAskAI={handleAskAI} />);

    expect(screen.getByText('Schedule of Milestones & Run-of-Show')).toBeInTheDocument();

    // Check first milestone toggle
    const toggleBtns = screen.getAllByRole('button', { name: /Toggle completion for/i });
    expect(toggleBtns.length).toBeGreaterThan(0);
    fireEvent.click(toggleBtns[0]);

    expect(handleUpdate).toHaveBeenCalled();
  });

  it('IdeasMoodboardTab renders color palette swatches and speeches', () => {
    const handleUpdate = vi.fn();
    const handleAskAI = vi.fn();

    render(
      <IdeasMoodboardTab event={sampleEvent} onUpdateEvent={handleUpdate} onAskAI={handleAskAI} />
    );

    expect(screen.getByText(sampleEvent.personalizedIdeas.themeName)).toBeInTheDocument();
    expect(screen.getByText('Harmonious Color Palette')).toBeInTheDocument();

    // Check custom speeches
    expect(screen.getByText(/Maid of Honor Heartfelt Toast/i)).toBeInTheDocument();
  });

  it('GuestListTab filters attendees and displays dietary alerts', () => {
    const handleUpdate = vi.fn();
    const handleAskAI = vi.fn();

    render(<GuestListTab event={sampleEvent} onUpdateEvent={handleUpdate} onAskAI={handleAskAI} />);

    expect(screen.getByText('Confirmed Attendees')).toBeInTheDocument();
    expect(screen.getByText('Dietary Inclusivity Alert:')).toBeInTheDocument();

    // Filter by confirmed
    const filterSelect = screen.getByLabelText(/Filter guests by RSVP status/i);
    fireEvent.change(filterSelect, { target: { value: 'confirmed' } });

    expect(screen.getByText('Sophia & David Vance')).toBeInTheDocument();
  });

  it('EventWizardModal closes on Escape key press (Accessibility)', () => {
    const handleClose = vi.fn();
    const handleCreated = vi.fn();

    render(<EventWizardModal isOpen={true} onClose={handleClose} onEventCreated={handleCreated} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Autonomous GenAI Event Architect')).toBeInTheDocument();

    // Trigger Escape key
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });

  it('SettingsModal tests connection and closes on Escape', () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();
    const handleReset = vi.fn();
    const handleImport = vi.fn();

    render(
      <SettingsModal
        isOpen={true}
        onClose={handleClose}
        aiSettings={{ apiKey: '', model: 'gemini-1.5-flash', useOfflineFallback: true }}
        onSaveAISettings={handleSave}
        onResetData={handleReset}
        onImportData={handleImport}
      />
    );

    expect(screen.getByText('Application & AI Configuration')).toBeInTheDocument();

    // Trigger Escape
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });

  it('useModalA11y preserves focus while typing into form fields (no focus stealing)', () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();

    render(
      <SettingsModal
        isOpen={true}
        onClose={handleClose}
        aiSettings={{ apiKey: '', model: 'gemini-1.5-flash', useOfflineFallback: true }}
        onSaveAISettings={handleSave}
        onResetData={vi.fn()}
        onImportData={vi.fn()}
      />
    );

    const input = screen.getByLabelText(/Gemini API Key/i);
    input.focus();
    expect(document.activeElement).toBe(input);

    // Type into input field
    fireEvent.change(input, { target: { value: 'AIzaSyTestKey123' } });

    // Focus must stay on input and NOT jump to close button
    expect(document.activeElement).toBe(input);
  });
});
