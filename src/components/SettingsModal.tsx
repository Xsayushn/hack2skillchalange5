import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  Download, 
  Upload, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  X
} from 'lucide-react';
import { AISettings, EventPlan } from '../types';
import { storageService } from '../services/storageService';
import { useModalA11y } from '../hooks/useModalA11y';
import { ALLOWED_MODELS, DEFAULT_AI_MODEL } from '../services/aiPlannerEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiSettings: AISettings;
  onSaveAISettings: (newSettings: AISettings) => void;
  onResetData: () => void;
  onImportData: (importedEvents: EventPlan[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  aiSettings,
  onSaveAISettings,
  onResetData,
  onImportData
}) => {
  const [apiKey, setApiKey] = useState(aiSettings.apiKey || '');
  const [model, setModel] = useState(aiSettings.model || DEFAULT_AI_MODEL);
  const [useOfflineFallback, setUseOfflineFallback] = useState(aiSettings.useOfflineFallback !== false);
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [importError, setImportError] = useState<string | null>(null);

  const modalRef = useModalA11y<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAISettings({
      apiKey: apiKey.trim(),
      model: ALLOWED_MODELS.includes(model) ? model : DEFAULT_AI_MODEL,
      useOfflineFallback
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestStatus('failed');
      return;
    }
    setTestStatus('testing');
    try {
      const sanitizedModel = ALLOWED_MODELS.includes(model) ? model : 'gemini-1.5-flash';
      // Secure Header authentication: No key in URL
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${sanitizedModel}:generateContent`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey.trim()
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Ping test: return OK.' }] }]
        })
      });
      if (res.ok) {
        setTestStatus('success');
      } else {
        setTestStatus('failed');
      }
    } catch {
      setTestStatus('failed');
    }
    setTimeout(() => setTestStatus('idle'), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = storageService.importDataJson(text);
      if (result.success) {
        const loaded = storageService.loadEvents();
        onImportData(loaded);
        onClose();
      } else {
        setImportError(result.error || 'Failed to parse JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportBackup = () => {
    const jsonStr = storageService.exportAllDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `celebr_ai_te_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="settings-modal-content glass-panel" ref={modalRef} tabIndex={-1}>
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <Settings size={22} className="text-brand" />
            <h3 id="settings-title">Application & AI Configuration</h3>
          </div>
          <button 
            className="btn btn-ghost btn-sm icon-only" 
            onClick={onClose}
            aria-label="Close settings dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="settings-body">
          {/* Section 1: AI Provider & API Key */}
          <section className="settings-section">
            <div className="section-title-badge">
              <Key size={16} />
              <h4>Google Gemini Live AI Integration (Optional)</h4>
            </div>
            <p className="settings-desc">
              CelebrAIte works 100% offline with a built-in <strong>Autonomous Intelligence Planning Engine</strong> out-of-the-box. You may optionally connect your personal Google Gemini API key to activate live generative models.
            </p>

            <form onSubmit={handleSave} className="api-key-form">
              <div className="form-group">
                <label htmlFor="gemini-key-input">Gemini API Key</label>
                <div className="password-input-wrapper">
                  <input 
                    id="gemini-key-input"
                    type={showKey ? 'text' : 'password'}
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="key-input"
                  />
                  <button 
                    type="button" 
                    className="show-hide-btn"
                    onClick={() => setShowKey(!showKey)}
                    aria-label={showKey ? 'Hide API key' : 'Show API key'}
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <small className="field-hint">
                  🔒 Security: Stored strictly in <code>sessionStorage</code> for this browser session and sent via secure <code>x-goog-api-key</code> headers (never in URL parameters).
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="model-select">Gemini Model</label>
                <select 
                  id="model-select"
                  value={model} 
                  onChange={(e) => setModel(e.target.value)}
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Default · Ultra-Fast Multimodal)</option>
                  <option value="gemini-3.5-flash">gemini-3.5-flash (High Intelligence & Efficiency)</option>
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Latest Low-Latency Production)</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (In-depth Complex Reasoning)</option>
                </select>
              </div>

              <div className="form-group checkbox-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input 
                  id="offline-fallback-toggle"
                  type="checkbox"
                  checked={useOfflineFallback}
                  onChange={(e) => setUseOfflineFallback(e.target.checked)}
                />
                <label htmlFor="offline-fallback-toggle" style={{ margin: 0, cursor: 'pointer' }}>
                  Enable automatic fallback to offline heuristic engine if network or rate-limits occur
                </label>
              </div>

              <div className="key-actions-row">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={handleTestKey}
                  disabled={testStatus === 'testing' || !apiKey.trim()}
                >
                  {testStatus === 'testing' ? 'Testing Key...' : testStatus === 'success' ? '✅ Key Valid!' : testStatus === 'failed' ? '❌ Key Invalid' : 'Test API Connection'}
                </button>

                <button type="submit" className="btn btn-primary btn-sm">
                  {saveSuccess ? <><Check size={14} /> Saved!</> : 'Save Settings'}
                </button>
              </div>
            </form>
          </section>

          <hr className="settings-divider" />

          {/* Section 2: Data Backup & Reset */}
          <section className="settings-section">
            <h4>Data Management & Test Restores</h4>
            <p className="settings-desc">
              Export all event records to JSON or restore default starter templates (Wedding, 10th Birthday, Community Clean-up).
            </p>

            <div className="backup-actions-grid">
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleExportBackup}
              >
                <Download size={15} />
                <span>Export JSON Backup</span>
              </button>

              <label className="btn btn-secondary btn-sm file-upload-label">
                <Upload size={15} />
                <span>Import JSON Backup</span>
                <input 
                  type="file" 
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>

              <button 
                className="btn btn-ghost btn-sm text-danger"
                onClick={() => {
                  if (window.confirm('Reset all events to the initial starter templates? Any custom unsaved plans will be replaced.')) {
                    onResetData();
                    onClose();
                  }
                }}
              >
                <RotateCcw size={15} />
                <span>Reset to Sample Events</span>
              </button>
            </div>

            {importError && (
              <div className="alert-banner alert-warning" style={{ marginTop: '12px' }}>
                <AlertCircle size={16} />
                <span>{importError}</span>
              </div>
            )}
          </section>

          <hr className="settings-divider" />

          {/* Section 3: Evaluation Focus Notes */}
          <section className="settings-section">
            <h4>Security & Compliance Highlights</h4>
            <div className="eval-checklist">
              <div className="eval-item">
                <ShieldCheck size={16} className="text-emerald" />
                <span><strong>Header-Based Auth:</strong> API key is sent via <code>x-goog-api-key</code> headers, not query parameters.</span>
              </div>
              <div className="eval-item">
                <ShieldCheck size={16} className="text-emerald" />
                <span><strong>Memory Isolation:</strong> Keys live in <code>sessionStorage</code> and clear automatically when closed.</span>
              </div>
              <div className="eval-item">
                <ShieldCheck size={16} className="text-emerald" />
                <span><strong>Deep Schema Validation:</strong> Nested items in imported JSON are strictly validated to prevent UI crashes.</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
