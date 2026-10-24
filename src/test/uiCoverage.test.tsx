import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Navbar } from '../components/Navbar';
import { OverviewTab } from '../components/OverviewTab';
import { VendorsTab } from '../components/VendorsTab';
import { AssistantDrawer } from '../components/AssistantDrawer';
import { AddExpenseModal } from '../components/budget/AddExpenseModal';
import { EventWizardModal } from '../components/EventWizardModal';
import { SettingsModal } from '../components/SettingsModal';
import { MasterDossierTab } from '../components/MasterDossierTab';
import { INITIAL_EVENTS } from '../data/mockEvents';

describe('Additional UI Component Tests & Regression Suite', () => {
  const sampleEvent = INITIAL_EVENTS[0];

  it('Navbar renders brand logo, event picker, and dispatches modal toggles', () => {
    const handleSelectEvent = vi.fn();
    const handleOpenWizard = vi.fn();
    const handleOpenSettings = vi.fn();
    const handleToggleTheme = vi.fn();
    const handleResetData = vi.fn();

    render(
      <Navbar
        events={INITIAL_EVENTS}
        activeEvent={sampleEvent}
        onSelectEvent={handleSelectEvent}
        onOpenWizard={handleOpenWizard}
        onOpenSettings={handleOpenSettings}
        theme="dark"
        onToggleTheme={handleToggleTheme}
        onResetData={handleResetData}
      />
    );

    expect(screen.getByText('CelebrAIte')).toBeInTheDocument();
    expect(screen.getByText('Autonomous GenAI Event Architect')).toBeInTheDocument();

    // Test New Event button
    const wizardBtn = screen.getByRole('button', { name: /Launch AI Event Wizard/i });
    fireEvent.click(wizardBtn);
    expect(handleOpenWizard).toHaveBeenCalledTimes(1);

    // Test Settings button
    const settingsBtn = screen.getByRole('button', { name: /Open AI Settings/i });
    fireEvent.click(settingsBtn);
    expect(handleOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('OverviewTab renders quick stats, countdown, and navigates to tabs', () => {
    const handleNavigate = vi.fn();
    const handleAskAI = vi.fn();

    render(
      <OverviewTab
        event={sampleEvent}
        onNavigateTab={handleNavigate}
        onAskAI={handleAskAI}
        onToggleTimelineItem={vi.fn()}
      />
    );

    expect(screen.getByText('Financial Pulse')).toBeInTheDocument();
    expect(screen.getByText('Priority Checklist')).toBeInTheDocument();
    expect(screen.getByText('Total Target')).toBeInTheDocument();

    // Quick Action button to explore budget
    const budgetAction = screen.getByRole('button', { name: /Manage Budget/i });
    fireEvent.click(budgetAction);
    expect(handleNavigate).toHaveBeenCalledWith('budget');
  });

  it('VendorsTab filters directory by status and opens add vendor form', () => {
    const handleUpdate = vi.fn();
    const handleAskAI = vi.fn();

    render(<VendorsTab event={sampleEvent} onUpdateEvent={handleUpdate} onAskAI={handleAskAI} />);

    expect(screen.getByText('Vendor Directory & Contract Checklists')).toBeInTheDocument();
    expect(screen.getByText('Pinecrest Botanical Estate')).toBeInTheDocument();

    // Click Category Filter
    const floralFilter = screen.getByRole('button', { name: /Floral & Decor/i });
    fireEvent.click(floralFilter);

    // Click Add Vendor button
    const addVendorBtn = screen.getByRole('button', { name: /Add New Vendor/i });
    fireEvent.click(addVendorBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add Vendor or Service Partner')).toBeInTheDocument();
  });

  it('AssistantDrawer renders message history, preset prompt chips, and closes on Escape', () => {
    const handleClose = vi.fn();

    render(
      <AssistantDrawer
        isOpen={true}
        onClose={handleClose}
        event={sampleEvent}
        aiSettings={{ apiKey: '', model: 'gemini-3.8-flash', useOfflineFallback: true }}
        onOpenSettings={vi.fn()}
      />
    );

    expect(screen.getByText('CelebrAIte Assistant')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask anything about budgets/i)).toBeInTheDocument();

    // Trigger Escape
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('AddExpenseModal creates a new budget item and handles validation', () => {
    const handleAddItem = vi.fn();
    const handleClose = vi.fn();

    render(
      <AddExpenseModal
        isOpen={true}
        onClose={handleClose}
        currencySymbol="$"
        onAddItem={handleAddItem}
      />
    );

    const nameInput = screen.getByLabelText(/Item Name \/ Service/i);
    fireEvent.change(nameInput, { target: { value: 'Fireworks Show' } });

    const saveBtn = screen.getByRole('button', { name: /Save Line Item/i });
    fireEvent.click(saveBtn);

    expect(handleAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Fireworks Show',
        estimatedCost: 500
      })
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('EventWizardModal fallback flow: displays notice and Open My Event Plan button on API failure', async () => {
    // Mock fetch to simulate 500 failure from Gemini
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('500 Service Unavailable'));

    const handleCreated = vi.fn();
    const handleClose = vi.fn();

    render(
      <EventWizardModal
        isOpen={true}
        onClose={handleClose}
        onEventCreated={handleCreated}
        aiSettings={{
          apiKey: 'AIzaSyTestValidFakeKey999',
          model: 'gemini-3.8-flash',
          useOfflineFallback: true
        }}
      />
    );

    // Step 1: Select archetype -> Continue
    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueBtn);

    // Step 2: Logistics -> Continue
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 3: Priorities -> Click Generate with Live Gemini
    const generateBtn = screen.getByRole('button', { name: /Generate with Live Gemini/i });
    fireEvent.click(generateBtn);

    // Wait for the fallback notice to appear
    await waitFor(() => {
      expect(screen.getByText(/Live API Fallback Notice/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Autonomous Heuristic Engine/i)).toBeInTheDocument();

    // Verify "Open My Event Plan" button is rendered and functional
    const openPlanBtn = screen.getByRole('button', { name: /Open My Event Plan/i });
    expect(openPlanBtn).toBeInTheDocument();

    fireEvent.click(openPlanBtn);

    expect(handleCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'wedding',
        title: expect.any(String)
      })
    );
    expect(handleClose).toHaveBeenCalled();

    global.fetch = originalFetch;
  });

  it('Modal focus regression test: focus returns to opener element when modal is dismissed via Escape', () => {
    // Harness component simulating opening a modal via a button
    const Harness: React.FC = () => {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div>
          <button id="opener-btn" onClick={() => setIsOpen(true)}>
            Open Settings Modal
          </button>
          <SettingsModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            aiSettings={{ apiKey: '', model: 'gemini-3.8-flash', useOfflineFallback: true }}
            onSaveAISettings={vi.fn()}
            onResetData={vi.fn()}
            onImportData={vi.fn()}
          />
        </div>
      );
    };

    render(<Harness />);

    const opener = screen.getByRole('button', { name: /Open Settings Modal/i });
    opener.focus();
    expect(document.activeElement).toBe(opener);

    // Open modal
    fireEvent.click(opener);

    // Modal is open
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Focus input and type
    const input = screen.getByLabelText(/Gemini API Key/i);
    input.focus();
    fireEvent.change(input, { target: { value: 'AIzaSyTemporary' } });

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

    // Dialog should be gone
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Focus must return to opener element
    expect(document.activeElement).toBe(opener);
  });

  it('MasterDossierTab renders printable dossier header and export triggers', () => {
    render(<MasterDossierTab event={sampleEvent} />);

    expect(screen.getByText('Master Planning Dossier')).toBeInTheDocument();
    expect(screen.getByText('CelebrAIte Official Master Dossier')).toBeInTheDocument();
    expect(screen.getByText(sampleEvent.title)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download Markdown/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Print \/ Save as PDF/i })).toBeInTheDocument();
  });
});
