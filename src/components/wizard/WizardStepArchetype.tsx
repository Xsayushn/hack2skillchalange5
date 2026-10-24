import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { EventType } from '../../types';
import { EVENT_ARCHETYPES, ArchetypeConfig } from './wizardConstants';

interface WizardStepArchetypeProps {
  eventType: EventType;
  onSelectArchetype: (arch: ArchetypeConfig) => void;
}

export const WizardStepArchetype: React.FC<WizardStepArchetypeProps> = ({
  eventType,
  onSelectArchetype
}) => {
  return (
    <div className="wizard-step-container">
      <h3 className="step-heading">Select Celebration Archetype</h3>
      <p className="step-sub">
        Choose your vertical to load domain-specific budgeting heuristics and milestones:
      </p>

      <div className="archetype-grid">
        {EVENT_ARCHETYPES.map((arch) => {
          const isSelected = eventType === arch.type;
          return (
            <button
              key={arch.type}
              type="button"
              className={`archetype-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectArchetype(arch)}
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
  );
};
