import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  Lightbulb, 
  ShieldCheck, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { EventPlan, ChatMessage, AISettings } from '../types';
import { aiPlannerEngine } from '../services/aiPlannerEngine';

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventPlan;
  aiSettings: AISettings;
  onOpenSettings: () => void;
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  isOpen,
  onClose,
  event,
  aiSettings,
  onOpenSettings
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello! I am **CelebrAIte**, your AI Event Co-Pilot. I am synchronized with **"${event.title}"** (${event.type} on ${event.date}).\n\nI can help you negotiate with vendors, optimize your budget buffer, generate minute-by-minute schedules, or craft custom speeches. What's on your mind?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'How can I save 15% on my overall budget?',
        'What questions should I ask our caterer?',
        'Draft a 3-minute warm welcome speech'
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiPlannerEngine.askAssistant(prompt, event, aiSettings);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `I encountered an unexpected hitch: ${err?.message || 'Network delay'}. You can check your API key in Settings or continue using built-in offline intelligence.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['How can I save budget?', 'Draft a run of show']
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  const isUsingLiveGemini = !!(aiSettings.apiKey && aiSettings.apiKey.trim().length > 5);

  return (
    <div className="assistant-drawer-overlay no-print" role="dialog" aria-modal="true" aria-label="CelebrAIte AI Co-Pilot">
      <aside className="assistant-drawer glass-panel">
        {/* Drawer Header */}
        <header className="assistant-header">
          <div className="assistant-header-left">
            <div className="bot-avatar-pulse">
              <Bot size={20} className="text-brand" />
            </div>
            <div>
              <h3>CelebrAIte Co-Pilot</h3>
              <div className="co-pilot-status-badge">
                <span className={`status-indicator ${isUsingLiveGemini ? 'live-gemini' : 'autonomous-mode'}`} />
                <span>{isUsingLiveGemini ? `Live Gemini (${aiSettings.model})` : 'Autonomous AI Engine (Offline Ready)'}</span>
              </div>
            </div>
          </div>

          <div className="assistant-header-actions">
            <button 
              className="btn btn-ghost btn-sm icon-only"
              onClick={onOpenSettings}
              title="Configure API Key"
              aria-label="Open AI configuration settings"
            >
              <ShieldCheck size={17} />
            </button>
            <button 
              className="btn btn-ghost btn-sm icon-only"
              onClick={onClose}
              aria-label="Close Assistant Drawer"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Synchronized Context Pill */}
        <div className="event-sync-banner">
          <Sparkles size={13} className="text-brand" />
          <span>Synced with: <strong>{event.title}</strong> ({event.currencySymbol}{event.totalBudget.toLocaleString()} budget)</span>
        </div>

        {/* Message Thread */}
        <div className="assistant-messages-stream" aria-live="polite">
          {messages.map(msg => {
            const isBot = msg.sender === 'assistant';
            const isCopied = copiedId === msg.id;

            return (
              <div key={msg.id} className={`chat-message-row ${isBot ? 'row-bot' : 'row-user'}`}>
                <div className={`message-bubble ${isBot ? 'bubble-bot' : 'bubble-user'}`}>
                  <div className="message-header-row">
                    <span className="sender-tag">
                      {isBot ? 'CelebrAIte Assistant' : 'You'}
                    </span>
                    <span className="timestamp-tag">{msg.timestamp}</span>

                    {isBot && (
                      <button 
                        className="btn btn-ghost btn-sm icon-only copy-msg-btn"
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        title="Copy answer"
                        aria-label="Copy message text"
                      >
                        {isCopied ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
                      </button>
                    )}
                  </div>

                  <div className="message-body-text">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('### ')) {
                        return <h4 key={pIdx} className="msg-h4">{paragraph.replace('### ', '')}</h4>;
                      }
                      if (paragraph.startsWith('> ')) {
                        return (
                          <blockquote key={pIdx} className="msg-quote">
                            {paragraph.replace('> ', '')}
                          </blockquote>
                        );
                      }
                      return <p key={pIdx}>{paragraph}</p>;
                    })}
                  </div>

                  {/* Suggestion Quick Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="msg-suggestions-box">
                      <span className="suggestions-label">💡 Suggested Next Prompts:</span>
                      <div className="suggestions-chips-grid">
                        {msg.suggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            className="suggestion-chip-btn"
                            onClick={() => handleSendMessage(sug)}
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="chat-message-row row-bot">
              <div className="message-bubble bubble-bot loading-bubble">
                <div className="typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="thinking-text">Synthesizing personalized event logic...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <footer className="assistant-footer">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="assistant-input-form"
          >
            <input 
              type="text"
              placeholder="Ask anything about budgets, schedules, speeches, or venues..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="chat-text-input"
              disabled={isLoading}
              aria-label="Ask CelebrAIte assistant"
            />
            <button 
              type="submit" 
              className="btn btn-primary send-btn"
              disabled={isLoading || !input.trim()}
              aria-label="Send query"
            >
              <Send size={16} />
            </button>
          </form>
        </footer>
      </aside>
    </div>
  );
};
