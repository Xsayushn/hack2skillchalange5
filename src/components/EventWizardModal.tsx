import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  X,
  Bot
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EventPlan, EventType, AISettings } from '../types';
import { aiPlannerEngine, GenerateEventParams } from '../services/aiPlannerEngine';
import { useModalA11y } from '../hooks/useModalA11y';

interface EventWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (newEvent: EventPlan) => void;
  aiSettings?: AISettings;
}

const EVENT_ARCHETYPES: {
  type: EventType;
  icon: string;
  title: string;
  desc: string;
  defaultVibe: string;
  defaultBudget: number;
}[] = [
  {
    type: 'wedding',
    icon: '💍',
    title: 'Wedding & Reception',
    desc: 'Ceremony, cocktail hour, dinner, floral styling & guest hospitality',
    defaultVibe: 'Romantic, Timeless, Botanical & Candlelit Elegance',
    defaultBudget: 30000
  },
  {
    type: 'birthday',
    icon: '🎂',
    title: 'Milestone Birthday Party',
    desc: 'Fun activities, custom themed cake, energetic decor & memories',
    defaultVibe: 'High-Energy, Pop-Art, Lively & Unforgettable',
    defaultBudget: 2500
  },
  {
    type: 'community',
    icon: '🌳',
    title: 'Community Festival & Clean-Up',
    desc: 'Eco-drives, volunteer logistics, food trucks, street permits & music',
    defaultVibe: 'Neighborly, Vibrant, Green & Family-Friendly',
    defaultBudget: 5000
  },
  {
    type: 'corporate',
    icon: '🏛️',
    title: 'Gala, Fundraiser or Reunion',
    desc: 'Keynote speakers, banquet dinner, audio-visual stage & networking',
    defaultVibe: 'Sophisticated, Inspiring, Polished & Warm',
    defaultBudget: 15000
  }
];

const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' },
  { code: 'CAD', symbol: '$' },
  { code: 'AUD', symbol: '$' }
];

export const EventWizardModal: React.FC<EventWizardModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
  aiSettings
}) => {
  const [step, setStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Form Parameters
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 4);
    return d.toISOString().split('T')[0];
  });
  const [targetGuests, setTargetGuests] = useState<number>(100);
  const [location, setLocation] = useState('Sunset Botanical Gardens');
  const [vibe, setVibe] = useState('Romantic, Timeless & Candlelit Elegance');
  const [totalBudget, setTotalBudget] = useState<number>(30000);
  const [currency, setCurrency] = useState<string>('USD');
  const [currencySymbol, setCurrencySymbol] = useState<string>('$');
  const [priorityFocus, setPriorityFocus] = useState<'balanced' | 'catering' | 'entertainment' | 'decor' | 'photo'>('balanced');

  // Accessibility: Focus trap & Escape-to-close
  const modalRef = useModalA11y<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;

  const handleSelectArchetype = (arch: typeof EVENT_ARCHETYPES[0]) => {
    setEventType(arch.type);
    setVibe(arch.defaultVibe);
    setTotalBudget(arch.defaultBudget);
    if (!title) {
      setTitle(arch.type === 'wedding' ? 'Our Dream Wedding & Reception' : arch.type === 'birthday' ? 'Epic Milestone Birthday Bash' : 'Neighborhood Green Community Festival');
    }
  };

  const handleCurrencySelect = (code: string) => {
    const match = CURRENCIES.find(c => c.code === code);
    if (match) {
      setCurrency(match.code);
      setCurrencySymbol(match.symbol);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    const params: GenerateEventParams = {
      title: title || `${eventType.toUpperCase()} Celebration`,
      type: eventType,
      date,
      targetGuests,
      location,
      vibe,
      totalBudget,
      currency,
      currencySymbol,
      priorityFocus
    };

    try {
      const newPlan = await aiPlannerEngine.generateEventPlanAsync(params, aiSettings);

      // Trigger Confetti effect (safely handles prefers-reduced-motion)
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // Safe fallback
        }
      }

      onEventCreated(newPlan);
      onClose();
      setStep(1);
    } catch (err) {
      console.error('Plan generation failed', err);
      // Fallback to offline heuristic
      const fallbackPlan = aiPlannerEngine.generateEventPlan(params);
      onEventCreated(fallbackPlan);
      onClose();
      setStep(1);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasLiveKey = Boolean(aiSettings?.apiKey && aiSettings.apiKey.trim().length > 5);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="wizard-modal-title">
      <div className="wizard-modal-content glass-panel" ref={modalRef} tabIndex={-1}>
        {/* Header */}
        <div className="wizard-header">
          <div className="wizard-title-group">
            <div className="wizard-icon-box">
              <Sparkles size={22} className="text-brand" />
            </div>
            <div>
              <h2 id="wizard-modal-title">Autonomous GenAI Event Architect</h2>
              <div className="wizard-sub-row">
                <span className="wizard-sub">Step {step} of 3</span>
                <span className="wizard-engine-badge">
                  <Bot size={13} className={hasLiveKey ? 'text-brand' : 'text-emerald'} />
                  <span>{hasLiveKey ? `Live Gemini (${aiSettings?.model})` : 'Autonomous AI Heuristic (Offline Ready)'}</span>
                </span>
              </div>
            </div>
          </div>
          <button 
            className="btn btn-ghost btn-sm icon-only"
            onClick={onClose}
            aria-label="Close Event Wizard"
          >
            <X size={18} />
          </button>
        </div>

        {/* Wizard Steps */}
        <div className="wizard-body">
          {/* STEP 1: Select Archetype */}
          {step === 1 && (
            <div className="wizard-step-container">
              <h3 className="step-heading">Select Celebration Archetype</h3>
              <p className="step-sub">Choose your vertical to load domain-specific budgeting heuristics and milestones:</p>

              <div className="archetype-grid">
                {EVENT_ARCHETYPES.map(arch => {
                  const isSelected = eventType === arch.type;
                  return (
                    <button
                      key={arch.type}
                      type="button"
                      className={`archetype-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectArchetype(arch)}
                    >
                      <span className="archetype-icon">{arch.icon}</span>
                      <h4>{arch.title}</h4>
                      <p>{arch.desc}</p>
                      {isSelected && (
                        <span className="archetype-checked">
                          <CheckCircle2 size={18} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Event Details */}
          {step === 2 && (
            <div className="wizard-step-container">
              <h3 className="step-heading">Event Context & Details</h3>
              <p className="step-sub">Define the foundational logistics for your {eventType}:</p>

              <div className="wizard-form-grid">
                <div className="form-group full-width">
                  <label htmlFor="wizard-title">Event Title *</label>
                  <input 
                    id="wizard-title"
                    type="text"
                    required
                    placeholder="e.g. Maya & Lucas's Golden Garden Wedding"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="wizard-date">Event Date *</label>
                  <input 
                    id="wizard-date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="wizard-guests">Expected Guests (Headcount) *</label>
                  <input 
                    id="wizard-guests"
                    type="number"
                    min="5"
                    max="5000"
                    value={targetGuests}
                    onChange={(e) => setTargetGuests(Number(e.target.value))}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="wizard-location">Venue / Location *</label>
                  <input 
                    id="wizard-location"
                    type="text"
                    required
                    placeholder="e.g. Pinecrest Botanical Hall, Austin TX"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="wizard-vibe">Desired Vibe & Aesthetic Vision</label>
                  <input 
                    id="wizard-vibe"
                    type="text"
                    placeholder="e.g. Rustic Romantic, Whimsical Twilight, High-Energy Neon"
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Budget & Priorities */}
          {step === 3 && (
            <div className="wizard-step-container">
              <h3 className="step-heading">Financial Targets & Priority Weighting</h3>
              <p className="step-sub">CelebrAIte will dynamically calculate category percentages based on your priorities:</p>

              <div className="wizard-form-grid">
                <div className="form-group">
                  <label htmlFor="wizard-currency">Currency</label>
                  <select 
                    id="wizard-currency"
                    value={currency} 
                    onChange={(e) => handleCurrencySelect(e.target.value)}
                  >
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="wizard-budget">Total Target Budget ({currencySymbol}) *</label>
                  <input 
                    id="wizard-budget"
                    type="number"
                    min="100"
                    step="500"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Number(e.target.value))}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Priority Investment Focus</label>
                  <div className="priority-options-grid">
                    {[
                      { id: 'balanced', label: 'Balanced Standard', sub: 'Optimal industry benchmark split' },
                      { id: 'catering', label: 'Gourmet Food & Drinks First', sub: 'Elevate culinary & open bar budget' },
                      { id: 'entertainment', label: 'Live Entertainment First', sub: 'Premium live band & experiences' },
                      { id: 'decor', label: 'Lush Decor & Aesthetics', sub: 'Max floral & atmospheric lighting' },
                      { id: 'photo', label: 'Visual Memories First', sub: 'Full day drone & 2 shooters' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`priority-chip-btn ${priorityFocus === opt.id ? 'active' : ''}`}
                        onClick={() => setPriorityFocus(opt.id as any)}
                      >
                        <strong>{opt.label}</strong>
                        <small>{opt.sub}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="wizard-footer">
          {step > 1 ? (
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setStep(step - 1)}
              disabled={isGenerating}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => setStep(step + 1)}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button 
              type="button" 
              className="btn btn-primary btn-lg wizard-generate-btn"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <Sparkles size={18} className={isGenerating ? 'spin-icon' : ''} />
              <span>{isGenerating ? 'Synthesizing Event Plan...' : hasLiveKey ? 'Generate with Live Gemini' : 'Generate AI Master Plan'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
