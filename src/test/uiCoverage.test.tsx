import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Navbar } from '../components/Navbar';
import { OverviewTab } from '../components/OverviewTab';
import { VendorsTab } from '../components/VendorsTab';
import { AssistantDrawer } from '../components/AssistantDrawer';
import { AddExpenseModal } from '../components/budget/AddExpenseModal';
import { ExpenseTable } from '../components/budget/ExpenseTable';
import { AddVendorModal } from '../components/vendors/AddVendorModal';
import { WizardStepPriorities } from '../components/wizard/WizardStepPriorities';
import { EventWizardModal } from '../components/EventWizardModal';
import { SettingsModal } from '../components/SettingsModal';
import { MasterDossierTab } from '../components/MasterDossierTab';
import { GuestListTab } from '../components/GuestListTab';
import { TimelineTab } from '../components/TimelineTab';
import { IdeasMoodboardTab } from '../components/IdeasMoodboardTab';
import { exportService } from '../services/exportService';
import { INITIAL_EVENTS } from '../data/mockEvents';

describe('Additional UI Component Tests & Regression Suite', () => {
  const sampleEvent = INITIAL_EVENTS[0];

  it('Navbar renders brand logo, event picker, and dispatches modal toggles and exports', () => {
    vi.spyOn(exportService, 'downloadIcs').mockImplementation(() => {});
    vi.spyOn(exportService, 'downloadJson').mockImplementation(() => {});
    vi.spyOn(exportService, 'downloadMarkdown').mockImplementation(() => {});
    vi.spyOn(exportService, 'printDossier').mockImplementation(() => {});
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });

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

    // Event selector change
    const select = screen.getByRole('combobox', { name: /Select active event plan/i });
    fireEvent.change(select, { target: { value: INITIAL_EVENTS[1].id } });
    expect(handleSelectEvent).toHaveBeenCalledWith(INITIAL_EVENTS[1].id);

    // Toggle theme
    const themeBtn = screen.getByRole('button', { name: /Toggle theme mode/i });
    fireEvent.click(themeBtn);
    expect(handleToggleTheme).toHaveBeenCalledTimes(1);

    // Reset data
    const resetBtn = screen.getByRole('button', { name: /Reset workspace/i });
    fireEvent.click(resetBtn);
    expect(handleResetData).toHaveBeenCalledTimes(1);

    // Open Export dropdown and trigger options
    const exportBtn = screen.getByRole('button', { name: /Export and share options/i });
    fireEvent.click(exportBtn);

    const icsItem = screen.getByText(/Calendar Sync/i);
    fireEvent.click(icsItem);
    expect(exportService.downloadIcs).toHaveBeenCalledWith(sampleEvent);

    fireEvent.click(exportBtn);
    const mdItem = screen.getByText(/Markdown Dossier/i);
    fireEvent.click(mdItem);
    expect(exportService.downloadMarkdown).toHaveBeenCalledWith(sampleEvent);

    fireEvent.click(exportBtn);
    const jsonItem = screen.getByText(/Export JSON Data/i);
    fireEvent.click(jsonItem);
    expect(exportService.downloadJson).toHaveBeenCalledWith(sampleEvent);

    fireEvent.click(exportBtn);
    const printItem = screen.getByText(/Printable Event Dossier/i);
    fireEvent.click(printItem);
    expect(exportService.printDossier).toHaveBeenCalled();

    fireEvent.click(exportBtn);
    const shareItem = screen.getByText(/Copy App Link/i);
    fireEvent.click(shareItem);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
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

  it('AssistantDrawer renders message history, preset prompt chips, and closes on Escape', async () => {
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

    // Type a message and send
    const input = screen.getByPlaceholderText(/Ask anything about budgets/i);
    fireEvent.change(input, { target: { value: 'How can I save money on flowers?' } });
    const sendBtn = screen.getByRole('button', { name: /Send query/i });
    fireEvent.click(sendBtn);
    await waitFor(() => {
      expect(screen.getByText('How can I save money on flowers?')).toBeInTheDocument();
    });
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

  it('WizardStepPriorities updates currency, budget, and priority chips', () => {
    const handleCurrencySelect = vi.fn();
    const handleBudgetChange = vi.fn();
    const handlePriorityFocus = vi.fn();

    render(
      <WizardStepPriorities
        currency="USD"
        currencySymbol="$"
        onCurrencySelect={handleCurrencySelect}
        totalBudget={35000}
        setTotalBudget={handleBudgetChange}
        priorityFocus="balanced"
        setPriorityFocus={handlePriorityFocus}
      />
    );

    expect(screen.getByText('Financial Targets & Priority Weighting')).toBeInTheDocument();

    // Change currency
    const currSelect = screen.getByLabelText(/Currency/i);
    fireEvent.change(currSelect, { target: { value: 'EUR' } });
    expect(handleCurrencySelect).toHaveBeenCalledWith('EUR');

    // Change budget
    const budgetInput = screen.getByLabelText(/Total Target Budget/i);
    fireEvent.change(budgetInput, { target: { value: '45000' } });
    expect(handleBudgetChange).toHaveBeenCalledWith(45000);

    // Click priority chip
    const decorChip = screen.getByRole('button', { name: /Lush Decor & Aesthetics/i });
    fireEvent.click(decorChip);
    expect(handlePriorityFocus).toHaveBeenCalledWith('decor');
  });

  it('ExpenseTable handles filtering, editing costs, payment status change, and item deletion', () => {
    const handleUpdateItem = vi.fn();
    const handleDeleteItem = vi.fn();
    const handleFilterCategory = vi.fn();
    const handleFilterStatus = vi.fn();
    const handleOpenAddModal = vi.fn();

    render(
      <ExpenseTable
        currencySymbol="$"
        items={sampleEvent.budgetItems}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        filterCategory="all"
        onFilterCategoryChange={handleFilterCategory}
        filterStatus="all"
        onFilterStatusChange={handleFilterStatus}
        onOpenAddModal={handleOpenAddModal}
      />
    );

    // Open add expense
    const addBtn = screen.getByRole('button', { name: /Add new budget line item/i });
    fireEvent.click(addBtn);
    expect(handleOpenAddModal).toHaveBeenCalledTimes(1);

    // Change category filter
    const catSelect = screen.getByLabelText(/Filter expenses by category/i);
    fireEvent.change(catSelect, { target: { value: 'Venue & Rentals' } });
    expect(handleFilterCategory).toHaveBeenCalledWith('Venue & Rentals');

    // Change status filter
    const statusSelect = screen.getByLabelText(/Filter expenses by payment status/i);
    fireEvent.change(statusSelect, { target: { value: 'paid_in_full' } });
    expect(handleFilterStatus).toHaveBeenCalledWith('paid_in_full');

    // Edit actual cost
    const firstItem = sampleEvent.budgetItems[0];
    const actualInput = screen.getByLabelText(new RegExp(`Actual cost for ${firstItem.name}`, 'i'));
    fireEvent.change(actualInput, { target: { value: '9500' } });
    expect(handleUpdateItem).toHaveBeenCalledWith(firstItem.id, { actualCost: 9500 });

    // Edit paid amount
    const paidInput = screen.getByLabelText(new RegExp(`Paid amount for ${firstItem.name}`, 'i'));
    fireEvent.change(paidInput, { target: { value: '5000' } });
    expect(handleUpdateItem).toHaveBeenCalledWith(firstItem.id, { paidCost: 5000 });

    // Change status
    const itemStatusSelect = screen.getByLabelText(
      new RegExp(`Payment status for ${firstItem.name}`, 'i')
    );
    fireEvent.change(itemStatusSelect, { target: { value: 'deposit_paid' } });
    expect(handleUpdateItem).toHaveBeenCalledWith(firstItem.id, { status: 'deposit_paid' });

    // Delete item
    const deleteBtn = screen.getByRole('button', {
      name: new RegExp(`Delete ${firstItem.name}`, 'i')
    });
    fireEvent.click(deleteBtn);
    expect(handleDeleteItem).toHaveBeenCalledWith(firstItem.id);
  });

  it('AddVendorModal handles vendor creation, validation, and cancel', () => {
    const handleAdd = vi.fn();
    const handleClose = vi.fn();

    const { rerender } = render(
      <AddVendorModal
        isOpen={false}
        onClose={handleClose}
        currencySymbol="$"
        categories={['Catering & Bar', 'Venue & Rentals', 'Music & Entertainment']}
        onAddVendor={handleAdd}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <AddVendorModal
        isOpen={true}
        onClose={handleClose}
        currencySymbol="$"
        categories={['Catering & Bar', 'Venue & Rentals', 'Music & Entertainment']}
        onAddVendor={handleAdd}
      />
    );

    expect(
      screen.getByRole('dialog', { name: /Add Vendor or Service Partner/i })
    ).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByLabelText(/Company \/ Vendor Name/i), {
      target: { value: 'Grand Symphony Orchestra' }
    });
    fireEvent.change(screen.getByLabelText(/Contact Person/i), {
      target: { value: 'Maestro Evans' }
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'evans@symphony.org' }
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: '(555) 888-9999' }
    });
    fireEvent.change(screen.getByLabelText(/Quoted Cost/i), {
      target: { value: '3500' }
    });
    fireEvent.change(screen.getByLabelText(/Agreed Final Cost/i), {
      target: { value: '3200' }
    });
    fireEvent.change(screen.getByLabelText(/Contract Notes & Inclusions/i), {
      target: { value: 'String quartet for 3 hours' }
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Save Vendor/i }));

    expect(handleAdd).toHaveBeenCalledTimes(1);
    expect(handleAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Grand Symphony Orchestra',
        contactPerson: 'Maestro Evans',
        email: 'evans@symphony.org',
        phone: '(555) 888-9999',
        quotedCost: 3500,
        agreedCost: 3200,
        notes: 'String quartet for 3 hours'
      })
    );

    // Cancel closes modal
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('GuestListTab handles guest creation, RSVP filter, dietary advisory, and deletion', () => {
    const handleUpdate = vi.fn();
    const handleAskAI = vi.fn();

    const eventWithGuests = {
      ...sampleEvent,
      guests: [
        {
          id: 'g-1',
          name: 'Sarah Jenkins',
          group: 'VIP Family',
          rsvpStatus: 'confirmed' as const,
          dietaryNotes: 'Severe Peanut Allergy',
          plusOnes: 1,
          tableOrZone: 'Table 1'
        },
        {
          id: 'g-2',
          name: 'Michael Chang',
          group: 'Friends',
          rsvpStatus: 'pending' as const,
          dietaryNotes: 'None',
          plusOnes: 0,
          tableOrZone: 'Table 2'
        }
      ]
    };

    render(
      <GuestListTab event={eventWithGuests} onUpdateEvent={handleUpdate} onAskAI={handleAskAI} />
    );

    // Verify stats
    expect(screen.getByText('Confirmed Attendees')).toBeInTheDocument();
    expect(screen.getByText('Dietary Accommodations')).toBeInTheDocument();
    expect(screen.getByText(/Dietary Inclusivity Alert:/i)).toBeInTheDocument();

    // Trigger AI catering advice
    const aiAdviceBtn = screen.getByRole('button', { name: /Catering Plating Advice/i });
    fireEvent.click(aiAdviceBtn);
    expect(handleAskAI).toHaveBeenCalledWith(expect.stringContaining('Peanut Allergy'));

    // Open Add Guest Modal
    fireEvent.click(screen.getByRole('button', { name: /Add Guest/i }));
    expect(
      screen.getByRole('dialog', { name: /Add Guest to Invitation List/i })
    ).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByLabelText(/Guest Full Name/i), {
      target: { value: 'David Miller' }
    });
    fireEvent.change(screen.getByLabelText(/Group \/ Circle/i), {
      target: { value: 'Work Colleagues' }
    });
    fireEvent.change(screen.getByLabelText(/^RSVP Status$/i), { target: { value: 'confirmed' } });
    fireEvent.change(screen.getByLabelText(/Plus Ones Allowed/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Dietary Restrictions & Allergies/i), {
      target: { value: 'Vegan' }
    });
    fireEvent.change(screen.getByLabelText(/Table \/ Assigned Zone/i), {
      target: { value: 'Table 5' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Save Guest/i }));
    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        guests: expect.arrayContaining([
          expect.objectContaining({
            name: 'David Miller',
            group: 'Work Colleagues',
            rsvpStatus: 'confirmed',
            dietaryNotes: 'Vegan',
            plusOnes: 2
          })
        ])
      })
    );

    // Test Delete Guest
    const deleteBtn = screen.getByLabelText(/Delete Sarah Jenkins/i);
    fireEvent.click(deleteBtn);
    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        guests: [expect.objectContaining({ id: 'g-2' })]
      })
    );
  });

  it('TimelineTab handles phase filtering, milestone toggling, custom task addition, and iCal download', () => {
    const handleUpdate = vi.fn();
    const handleAskAI = vi.fn();
    const icsSpy = vi.spyOn(exportService, 'downloadIcs').mockImplementation(() => {});

    render(<TimelineTab event={sampleEvent} onUpdateEvent={handleUpdate} onAskAI={handleAskAI} />);

    // Verify filter tabs exist
    const phaseTabs = screen.getAllByRole('tab');
    expect(phaseTabs.length).toBeGreaterThan(0);

    // Click "Phase 4: Day-of" tab
    const dayOfBtn = screen.getByRole('tab', { name: /Phase 4: Day-of/i });
    fireEvent.click(dayOfBtn);

    // Toggle milestone completion
    const toggleButtons = screen.getAllByRole('button', { name: /Toggle completion for/i });
    fireEvent.click(toggleButtons[0]);
    expect(handleUpdate).toHaveBeenCalled();

    // Trigger iCal download
    const exportIcsBtn = screen.getByRole('button', { name: /Sync to Calendar/i });
    fireEvent.click(exportIcsBtn);
    expect(icsSpy).toHaveBeenCalledWith(sampleEvent);

    // Open Add Milestone modal
    const addMilestoneBtn = screen.getByRole('button', { name: /Add Milestone/i });
    fireEvent.click(addMilestoneBtn);
    expect(screen.getByRole('dialog', { name: /Schedule New Milestone/i })).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByLabelText(/Milestone Title/i), {
      target: { value: 'Sound Check' }
    });
    fireEvent.change(screen.getByLabelText(/^Phase$/i), { target: { value: 'day_of' } });
    fireEvent.change(screen.getByLabelText(/Target Time \/ Date Slot/i), {
      target: { value: '11:00 AM' }
    });
    fireEvent.change(screen.getByLabelText(/Description & Instructions/i), {
      target: { value: 'Test mics and speakers' }
    });
    fireEvent.change(screen.getByLabelText(/Priority/i), { target: { value: 'high' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Save Milestone/i }));
    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        timelineItems: expect.arrayContaining([
          expect.objectContaining({
            title: 'Sound Check',
            phase: 'day_of',
            targetDateOrTime: '11:00 AM'
          })
        ])
      })
    );
  });

  it('IdeasMoodboardTab renders creative concept, copies colors and speeches, and triggers AI assistant', () => {
    const handleAskAI = vi.fn();
    const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    render(<IdeasMoodboardTab event={sampleEvent} onAskAI={handleAskAI} />);

    // Banner and theme
    expect(screen.getByText(sampleEvent.personalizedIdeas.themeName)).toBeInTheDocument();
    expect(screen.getByText(sampleEvent.personalizedIdeas.themeDescription)).toBeInTheDocument();

    // Click color swatch to copy
    const firstColor = sampleEvent.personalizedIdeas.colorPalette[0];
    const swatch = screen.getByLabelText(new RegExp(`Copy color ${firstColor.name}`, 'i'));
    fireEvent.click(swatch);
    expect(clipboardSpy).toHaveBeenCalledWith(firstColor.hex);

    // Copy custom speech
    const copySpeechBtn = screen.getAllByRole('button', { name: /Copy speech text/i })[0];
    fireEvent.click(copySpeechBtn);
    expect(clipboardSpy).toHaveBeenCalled();

    // Click brainstorm ideas
    const brainstormBtn = screen.getByRole('button', { name: /Regenerate Theme Concepts/i });
    fireEvent.click(brainstormBtn);
    expect(handleAskAI).toHaveBeenCalledWith(
      expect.stringContaining('theme concepts and color palettes')
    );
  });
});
