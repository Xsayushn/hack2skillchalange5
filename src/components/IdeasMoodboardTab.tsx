import React, { useState } from 'react';
import {
  Sparkles,
  Palette,
  Copy,
  Check,
  Music,
  UtensilsCrossed,
  MessageSquare,
  Lightbulb,
  Smile
} from 'lucide-react';
import { EventPlan } from '../types';
import '../styles/moodboard.css';

interface IdeasMoodboardTabProps {
  event: EventPlan;
  onUpdateEvent?: (updated: EventPlan) => void;
  onAskAI: (prompt: string) => void;
}

export const IdeasMoodboardTab: React.FC<IdeasMoodboardTabProps> = ({
  event,
  onUpdateEvent: _onUpdateEvent,
  onAskAI
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedSpeech, setCopiedSpeech] = useState<number | null>(null);

  const ideas = event.personalizedIdeas;

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleCopySpeech = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSpeech(index);
    setTimeout(() => setCopiedSpeech(null), 2500);
  };

  return (
    <div className="ideas-tab-container">
      {/* Top Banner */}
      <div className="ideas-banner glass-card">
        <div className="ideas-banner-title-group">
          <Sparkles className="text-brand" size={28} />
          <div>
            <span className="badge badge-neutral">Autonomous GenAI Creative Studio</span>
            <h2>{ideas.themeName}</h2>
            <p className="ideas-banner-desc">{ideas.themeDescription}</p>
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() =>
            onAskAI(
              `Suggest 3 fresh, alternative theme concepts and color palettes for ${event.title} (${event.type}) with a "${event.vibe}" atmosphere.`
            )
          }
        >
          <Palette size={16} />
          <span>Regenerate Theme Concepts</span>
        </button>
      </div>

      {/* Aesthetic Color Palette Grid */}
      <div className="glass-card section-card">
        <div className="section-header-flex">
          <div>
            <h3>Harmonious Color Palette</h3>
            <p className="card-sub-text">
              Click any swatch to copy the hex code for invitations, florals, and lighting
            </p>
          </div>
        </div>

        <div className="palette-grid">
          {ideas.colorPalette.map((swatch, idx) => {
            const isCopied = copiedHex === swatch.hex;
            return (
              <button
                key={idx}
                className="palette-swatch-card"
                onClick={() => handleCopyHex(swatch.hex)}
                title={`Click to copy ${swatch.hex}`}
                aria-label={`Copy color ${swatch.name} hex code ${swatch.hex}`}
              >
                <div className="swatch-color-box" style={{ backgroundColor: swatch.hex }}>
                  <span className="copy-indicator">
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                  </span>
                </div>
                <div className="swatch-meta">
                  <span className="swatch-name">{swatch.name}</span>
                  <span className="swatch-hex">{swatch.hex.toUpperCase()}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Activities & Speeches */}
      <div className="ideas-two-col-grid">
        {/* Curated Activities */}
        <div className="glass-card section-card">
          <div className="section-header-flex">
            <div className="icon-title-group">
              <Smile className="text-brand" size={20} />
              <h4>Curated Interactive Highlights & Games</h4>
            </div>
            <button
              className="btn btn-ghost btn-sm text-brand"
              onClick={() =>
                onAskAI(
                  `Generate 3 more engaging, interactive crowd activities for ${event.type} tailored for ${event.targetGuests} guests.`
                )
              }
            >
              <Sparkles size={14} />
              <span>More Activities</span>
            </button>
          </div>

          <div className="activities-list">
            {ideas.activities.map((act, idx) => (
              <div key={idx} className="activity-card">
                <div className="activity-header">
                  <h5>{act.name}</h5>
                  <div className="activity-badges">
                    <span className="activity-pill">{act.duration}</span>
                    <span className="activity-pill audience-pill">{act.targetAudience}</span>
                  </div>
                </div>
                <p className="activity-desc">{act.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Speeches & Toasts */}
        <div className="glass-card section-card">
          <div className="section-header-flex">
            <div className="icon-title-group">
              <MessageSquare className="text-brand" size={20} />
              <h4>AI-Crafted Speeches & Toasts</h4>
            </div>
            <button
              className="btn btn-ghost btn-sm text-brand"
              onClick={() =>
                onAskAI(
                  `Draft a new humorous and heartwarming toast for ${event.title} celebrating our guests and host.`
                )
              }
            >
              <Sparkles size={14} />
              <span>New Speech</span>
            </button>
          </div>

          <div className="speeches-list">
            {ideas.customSpeeches.map((sp, idx) => {
              const isCopied = copiedSpeech === idx;
              return (
                <div key={idx} className="speech-card">
                  <div className="speech-header">
                    <div>
                      <h5>{sp.title}</h5>
                      <span className="speech-role">Speaker Role: {sp.role}</span>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleCopySpeech(sp.text, idx)}
                      aria-label="Copy speech text"
                    >
                      {isCopied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                      <span>{isCopied ? 'Copied!' : 'Copy Toast'}</span>
                    </button>
                  </div>
                  <blockquote className="speech-quote">"{sp.text}"</blockquote>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Catering & Music */}
      <div className="ideas-two-col-grid">
        {/* Catering & Signature Drinks */}
        <div className="glass-card section-card">
          <div className="section-header-flex">
            <div className="icon-title-group">
              <UtensilsCrossed className="text-brand" size={20} />
              <h4>Catering & Beverage Signature Concepts</h4>
            </div>
          </div>

          <ul className="catering-items-list">
            {ideas.cateringHighlights.map((item, idx) => (
              <li key={idx} className="catering-item">
                <span className="catering-bullet">✦</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Music Playlist Vibe */}
        <div className="glass-card section-card">
          <div className="section-header-flex">
            <div className="icon-title-group">
              <Music className="text-brand" size={20} />
              <h4>Musical Vibe & Playlist Blueprint</h4>
            </div>
          </div>

          <p className="playlist-mood-desc">
            <strong>Mood Arc:</strong> {ideas.playlistVibe.mood}
          </p>

          <div className="sample-tracks-container">
            <span className="tracks-label">Recommended Anchor Tracks:</span>
            <ul className="tracks-list">
              {ideas.playlistVibe.sampleTracks.map((trk, idx) => (
                <li key={idx} className="track-item">
                  <span className="track-icon">🎵</span>
                  <span>{trk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Cost Saving Insights & Decor */}
      <div className="glass-card section-card">
        <div className="section-header-flex">
          <div className="icon-title-group">
            <Lightbulb className="text-brand" size={20} />
            <h4>High-Impact Cost Saving Secrets & Decor Hacks</h4>
          </div>
        </div>

        <div className="decor-tips-grid">
          {ideas.costSavingTips.map((tip, idx) => (
            <div key={idx} className="tip-card">
              <span className="tip-badge">Hack #{idx + 1}</span>
              <p>{tip}</p>
            </div>
          ))}
          {ideas.decorSuggestions.map((dec, idx) => (
            <div key={`dec-${idx}`} className="tip-card decor-card">
              <span className="tip-badge decor-badge">Decor Tip</span>
              <p>{dec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
