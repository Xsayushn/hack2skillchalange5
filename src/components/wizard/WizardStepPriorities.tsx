import React from 'react';
import { CURRENCIES, PRIORITY_OPTIONS } from './wizardConstants';

interface WizardStepPrioritiesProps {
  currency: string;
  currencySymbol: string;
  onCurrencySelect: (code: string) => void;
  totalBudget: number;
  setTotalBudget: (val: number) => void;
  priorityFocus: 'balanced' | 'catering' | 'entertainment' | 'decor' | 'photo';
  setPriorityFocus: (val: 'balanced' | 'catering' | 'entertainment' | 'decor' | 'photo') => void;
}

export const WizardStepPriorities: React.FC<WizardStepPrioritiesProps> = ({
  currency,
  currencySymbol,
  onCurrencySelect,
  totalBudget,
  setTotalBudget,
  priorityFocus,
  setPriorityFocus
}) => {
  return (
    <div className="wizard-step-container">
      <h3 className="step-heading">Financial Targets & Priority Weighting</h3>
      <p className="step-sub">
        CelebrAIte will dynamically calculate category percentages based on your priorities:
      </p>

      <div className="wizard-form-grid">
        <div className="form-group">
          <label htmlFor="wizard-currency">Currency</label>
          <select
            id="wizard-currency"
            value={currency}
            onChange={(e) => onCurrencySelect(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
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
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`priority-chip-btn ${priorityFocus === opt.id ? 'active' : ''}`}
                onClick={() => setPriorityFocus(opt.id)}
              >
                <strong>{opt.label}</strong>
                <small>{opt.sub}</small>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
