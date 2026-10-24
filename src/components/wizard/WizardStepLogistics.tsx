import React from 'react';
import { EventType } from '../../types';

interface WizardStepLogisticsProps {
  eventType: EventType;
  title: string;
  setTitle: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  targetGuests: number;
  setTargetGuests: (val: number) => void;
  location: string;
  setLocation: (val: string) => void;
  vibe: string;
  setVibe: (val: string) => void;
}

export const WizardStepLogistics: React.FC<WizardStepLogisticsProps> = ({
  eventType,
  title,
  setTitle,
  date,
  setDate,
  targetGuests,
  setTargetGuests,
  location,
  setLocation,
  vibe,
  setVibe
}) => {
  return (
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
  );
};
