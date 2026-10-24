import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { EventPlan } from '../../types';

interface WizardFallbackScreenProps {
  fallbackNotice: string;
  pendingPlan: EventPlan;
  onOpenPlan: () => void;
}

export const WizardFallbackScreen: React.FC<WizardFallbackScreenProps> = ({
  fallbackNotice,
  onOpenPlan
}) => {
  return (
    <div className="wizard-step-container" style={{ textAlign: 'center', padding: '16px 0' }}>
      <div
        style={{
          background: 'rgba(234, 179, 8, 0.12)',
          border: '1px solid rgba(234, 179, 8, 0.4)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}
      >
        <AlertCircle
          size={22}
          className="text-yellow"
          style={{ flexShrink: 0, marginTop: '2px' }}
        />
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            Live API Fallback Notice
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}
          >
            {fallbackNotice}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Your Blueprint is Generated!</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          A complete, domain-weighted celebration plan with budgets, milestone timelines, and vendor
          checklists has been prepared.
        </p>
      </div>

      <button
        type="button"
        className="btn btn-primary btn-lg"
        onClick={onOpenPlan}
        style={{
          minWidth: '220px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        Open My Event Plan <ArrowRight size={18} />
      </button>
    </div>
  );
};
