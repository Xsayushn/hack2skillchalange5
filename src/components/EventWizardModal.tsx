import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, X, Bot } from 'lucide-react';
import { EventPlan, EventType, AISettings } from '../types';
import {
  aiPlannerEngine,
  GenerateEventParams,
  DEFAULT_AI_MODEL
} from '../services/aiPlannerEngine';
import { useModalA11y } from '../hooks/useModalA11y';
import { CURRENCIES, ArchetypeConfig } from './wizard/wizardConstants';
import { WizardStepArchetype } from './wizard/WizardStepArchetype';
import { WizardStepLogistics } from './wizard/WizardStepLogistics';
import { WizardStepPriorities } from './wizard/WizardStepPriorities';
import { WizardFallbackScreen } from './wizard/WizardFallbackScreen';
import '../styles/modals.css';

interface EventWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (newEvent: EventPlan) => void;
  aiSettings?: AISettings;
}

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
  const [priorityFocus, setPriorityFocus] = useState<
    'balanced' | 'catering' | 'entertainment' | 'decor' | 'photo'
  >('balanced');
  const [pendingPlan, setPendingPlan] = useState<EventPlan | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  // Accessibility: Focus trap & Escape-to-close
  const modalRef = useModalA11y<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;

  const handleSelectArchetype = (arch: ArchetypeConfig) => {
    setEventType(arch.type);
    setVibe(arch.defaultVibe);
    setTotalBudget(arch.defaultBudget);
    if (!title) {
      setTitle(
        arch.type === 'wedding'
          ? 'Our Dream Wedding & Reception'
          : arch.type === 'birthday'
            ? 'Epic Milestone Birthday Bash'
            : 'Neighborhood Green Community Festival'
      );
    }
  };

  const handleCurrencySelect = (code: string) => {
    const match = CURRENCIES.find((c) => c.code === code);
    if (match) {
      setCurrency(match.code);
      setCurrencySymbol(match.symbol);
    }
  };

  const hasLiveKey = Boolean(aiSettings?.apiKey && aiSettings.apiKey.trim().length > 5);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setFallbackNotice(null);

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
      const result = await aiPlannerEngine.generateEventPlanWithMeta(params, aiSettings);

      // Trigger Confetti effect safely (only if canvas 2D context is available and no reduced-motion preference)
      const prefersReducedMotion =
        typeof window !== 'undefined' && typeof window.matchMedia === 'function'
          ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
          : false;

      const hasCanvasSupport = (() => {
        try {
          if (typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom')) {
            return false;
          }
          const testCanvas = document.createElement('canvas');
          return Boolean(testCanvas.getContext && testCanvas.getContext('2d'));
        } catch {
          return false;
        }
      })();

      if (!prefersReducedMotion && hasCanvasSupport) {
        try {
          const { default: confetti } = await import('canvas-confetti');
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // Safe fallback
        }
      }

      // If live Gemini failed and fell back, keep wizard open so notice is displayed
      if (hasLiveKey && result.source === 'autonomous-heuristics' && result.errorNotice) {
        setPendingPlan(result.plan);
        setFallbackNotice(result.errorNotice);
        return;
      }

      onEventCreated(result.plan);
      onClose();
      setStep(1);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('Plan generation failed', err);
      const fallbackPlan = aiPlannerEngine.generateEventPlan(params);
      if (hasLiveKey) {
        setPendingPlan(fallbackPlan);
        setFallbackNotice(
          `Live Gemini API call failed (${errMsg.slice(0, 80)}). Synthesized using Autonomous Heuristic Engine.`
        );
        return;
      }
      onEventCreated(fallbackPlan);
      onClose();
      setStep(1);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-modal-title"
    >
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
                  <span>
                    {hasLiveKey
                      ? `Live Gemini (${aiSettings?.model || DEFAULT_AI_MODEL})`
                      : 'Autonomous AI Heuristic (Offline Ready)'}
                  </span>
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

        {/* Wizard Body */}
        <div className="wizard-body">
          {pendingPlan && fallbackNotice ? (
            <WizardFallbackScreen
              fallbackNotice={fallbackNotice}
              pendingPlan={pendingPlan}
              onOpenPlan={() => {
                onEventCreated(pendingPlan);
                onClose();
                setPendingPlan(null);
                setFallbackNotice(null);
                setStep(1);
              }}
            />
          ) : (
            <>
              {step === 1 && (
                <WizardStepArchetype
                  eventType={eventType}
                  onSelectArchetype={handleSelectArchetype}
                />
              )}

              {step === 2 && (
                <WizardStepLogistics
                  eventType={eventType}
                  title={title}
                  setTitle={setTitle}
                  date={date}
                  setDate={setDate}
                  targetGuests={targetGuests}
                  setTargetGuests={setTargetGuests}
                  location={location}
                  setLocation={setLocation}
                  vibe={vibe}
                  setVibe={setVibe}
                />
              )}

              {step === 3 && (
                <WizardStepPriorities
                  currency={currency}
                  currencySymbol={currencySymbol}
                  onCurrencySelect={handleCurrencySelect}
                  totalBudget={totalBudget}
                  setTotalBudget={setTotalBudget}
                  priorityFocus={priorityFocus}
                  setPriorityFocus={setPriorityFocus}
                />
              )}
            </>
          )}
        </div>

        {/* Footer Navigation */}
        {!pendingPlan && (
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
              <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)}>
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
                <span>
                  {isGenerating
                    ? 'Synthesizing Event Plan...'
                    : hasLiveKey
                      ? 'Generate with Live Gemini'
                      : 'Generate AI Master Plan'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
