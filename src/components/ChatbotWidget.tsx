'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Cpu,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Terminal,
  Zap,
  Navigation,
  CloudRain,
  Radio,
  LifeBuoy,
  ChevronRight,
  ChevronLeft,
  User,
  Mic,
  MicOff
} from 'lucide-react';

export interface UIResponseProvider {
  type: 'online' | 'offline' | 'faq';
  label: string;
  modelName?: string;
}

export interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  providerInfo?: UIResponseProvider;
  latencyMs?: number;
}

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

const getSpeechLangCode = (appLang: string): string => {
  switch (appLang) {
    case 'hi':
      return 'hi-IN';
    case 'mr':
      return 'mr-IN';
    case 'ta':
      return 'ta-IN';
    case 'te':
      return 'te-IN';
    default:
      return 'en-US';
  }
};

export const ChatbotWidget: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const { t, lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDocked, setIsDocked] = useState(false);
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

  // Automatic slide-in from right edge on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimatedIn(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [remainingQuota, setRemainingQuota] = useState<number>(5);
  const [rateLimitResetSec, setRateLimitResetSec] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const sessionKeyRef = useRef<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore error on stop
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognitionClass =
      typeof window !== 'undefined'
        ? (window as unknown as IWindow).SpeechRecognition || (window as unknown as IWindow).webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionClass) {
      setErrorMessage('Voice recognition (STT) is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = getSpeechLangCode(lang);

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInputQuery(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions in browser settings.');
        } else if (event.error !== 'no-speech') {
          setErrorMessage(`Voice input notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to initiate speech recognition:', err);
      setIsListening(false);
      setErrorMessage('Unable to start voice recording.');
    }
  };

  // Clean up STT recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const categorizedPrompts = [
    {
      category: t.chatbot.vehicleSafetyCat,
      icon: Navigation,
      query: t.chatbot.vehicleSafetyQuery,
    },
    {
      category: t.chatbot.radarCat,
      icon: CloudRain,
      query: t.chatbot.radarQuery,
    },
    {
      category: t.chatbot.evacuationCat,
      icon: LifeBuoy,
      query: t.chatbot.evacuationQuery,
    },
    {
      category: t.chatbot.scadaCat,
      icon: Radio,
      query: t.chatbot.scadaQuery,
    },
  ];

  const [messages, setMessages] = useState<UIMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        '👋 Welcome to **Surge AI**.\n\nI provide real-time guidance on urban flood risks, street inundation depths, vehicle clearance limits, Doppler radar nowcasts, and evacuation routes derived from AquaAlert live telemetry.\n\nHow can I assist your hydrological safety today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Session Initialization
  useEffect(() => {
    let key = localStorage.getItem('vrishti_chat_session_key');
    if (!key) {
      key = `session-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
      localStorage.setItem('vrishti_chat_session_key', key);
    }
    sessionKeyRef.current = key;
  }, []);

  // Fetch initial rate limit quota
  useEffect(() => {
    const fetchQuotaStatus = async () => {
      try {
        const res = await fetch('/api/chatbot');
        if (res.ok) {
          const data = await res.json();
          if (typeof data.remainingQuota === 'number') {
            setRemainingQuota(data.remainingQuota);
          }
        }
      } catch (e) {
        // Silently handle offline quota check
      }
    };
    fetchQuotaStatus();
    const interval2Min = setInterval(fetchQuotaStatus, 2 * 60 * 1000);
    return () => clearInterval(interval2Min);
  }, []);

  // Countdown timer for rate limiting
  useEffect(() => {
    if (rateLimitResetSec <= 0) return;
    const timer = setInterval(() => {
      setRateLimitResetSec((prev) => {
        if (prev <= 1) {
          setErrorMessage(null);
          setRemainingQuota(5);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [rateLimitResetSec]);

  // Keyboard shortcut listener (ESC to close, Ctrl/Cmd + K to toggle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-scroll to bottom of conversation thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore stop error
        }
      }
      setIsListening(false);
    }

    if (rateLimitResetSec > 0) {
      setErrorMessage(`Rate limit active. Please wait ${rateLimitResetSec}s before asking again.`);
      return;
    }

    const userMsg: UIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const historyForApi = messages
        .filter((m) => m.id !== 'welcome-1')
        .concat(userMsg)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyForApi,
          sessionKey: sessionKeyRef.current,
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setRemainingQuota(0);
        const resetSec = data.resetInSeconds || 120;
        setRateLimitResetSec(resetSec);
        setErrorMessage(data.error || `Message limit reached. Please try again in ${resetSec} seconds.`);
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status} server error`);
      }

      if (typeof data.remainingQuota === 'number') {
        setRemainingQuota(data.remainingQuota);
      }

      let providerType: 'online' | 'offline' | 'faq' = 'online';
      let labelStr = 'Online • DeepSeek R1';

      if (data.provider === 'faq') {
        providerType = 'faq';
        labelStr = 'Instant Telemetry Match';
      } else if (data.provider === 'offline') {
        providerType = 'offline';
        labelStr = 'Local Fallback Engine';
      } else {
        providerType = 'online';
        labelStr = 'NVIDIA NIM • Nemotron 3';
      }

      const botMsg: UIMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'No response returned from hydrological engine.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        providerInfo: {
          type: providerType,
          label: labelStr,
          modelName: data.modelName,
        },
        latencyMs: data.latencyMs,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      setErrorMessage(
        `Connection Notice: ${err instanceof Error ? err.message : 'Unable to connect to SURGE chatbot server.'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: '🔄 Conversation thread cleared. Ready to answer your next flood safety query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        providerInfo: {
          type: 'faq',
          label: 'Surge',
        },
      },
    ]);
    setErrorMessage(null);
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <>
      {/* ── CHATBOT MODAL PANEL ── */}
      {isOpen && (
        <div
          className={`fixed z-[9998] font-sans antialiased transition-all duration-300 ease-out transform
            ${/* Mobile: full screen with safe margins */''} 
            inset-0 sm:inset-auto sm:bottom-24 sm:right-4 md:right-6
            sm:rounded-3xl
            flex flex-col shadow-2xl border
            ${isExpanded
              ? 'sm:w-[620px] md:w-[680px] sm:h-[720px] sm:max-h-[88vh]'
              : 'sm:w-[420px] md:w-[460px] sm:h-[590px] sm:max-h-[82vh]'
            }
            ${isDark
              ? 'bg-slate-950/95 backdrop-blur-xl border-slate-800/90 text-slate-100 shadow-cyan-950/50'
              : 'bg-white/95 backdrop-blur-xl border-slate-200 text-slate-900 shadow-slate-400/40'
            }`}
        >
          {/* TOP EXECUTIVE HEADER BAR */}
          <div
            className={`px-4 py-3.5 sm:rounded-t-3xl flex items-center justify-between border-b shrink-0 ${
              isDark
                ? 'bg-slate-900/90 border-slate-800/80'
                : 'bg-slate-50/90 border-slate-200/80'
            }`}
          >
            {/* Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-500 p-0.5 shadow-md shadow-cyan-500/20 shrink-0 flex items-center justify-center">
                <img
                  src="/images/surge-ai.png"
                  alt="Surge AI"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-sm leading-tight tracking-tight bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 bg-clip-text text-transparent">
                    Surge AI
                  </h3>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? t.chatbot.minimizeModal : t.chatbot.expandModal}
                className={`hidden sm:block p-1.5 rounded-lg transition-colors ${
                  isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                }`}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleClearHistory}
                title={t.chatbot.clearHistory}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                title={t.chatbot.closeModal}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RATE LIMIT ACTIVE NOTIFICATION BANNER */}
          {rateLimitResetSec > 0 && (
            <div className={`border-b px-4 py-2.5 text-xs flex items-center justify-between font-mono shrink-0 animate-fade-in ${
              isDark
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 animate-bounce" />
                <span>{t.chatbot.rateLimitActive} {rateLimitResetSec}s</span>
              </div>
              <span className={`font-bold px-2 py-0.5 rounded border ${
                isDark
                  ? 'text-amber-200 bg-amber-950/60 border-amber-500/30'
                  : 'text-amber-900 bg-amber-100 border-amber-300'
              }`}>
                {rateLimitResetSec}s
              </span>
            </div>
          )}

          {/* ERROR ALERT */}
          {errorMessage && rateLimitResetSec === 0 && (
            <div className={`border-b px-4 py-2 text-xs flex items-center justify-between shrink-0 ${
              isDark
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="hover:opacity-75">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* CONVERSATION THREAD */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 text-xs sm:text-sm leading-relaxed custom-scrollbar">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Assistant Profile Avatar (Left) */}
                  {!isUser && (
                    <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-500 p-0.5 shadow-md shrink-0 mt-0.5 border border-sky-400/40">
                      <img
                        src="/images/surge-ai.png"
                        alt="Surge AI"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  )}

                  {/* Chat Bubble Card */}
                  <div
                    className={`group relative max-w-[82%] sm:max-w-[85%] rounded-2xl p-3 sm:p-3.5 shadow-sm transition-all ${
                      isUser
                        ? 'bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 text-white rounded-tr-xs shadow-blue-500/10'
                        : isDark
                        ? 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-xs shadow-slate-950/50'
                        : 'bg-slate-100 text-slate-900 border border-slate-200/90 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed">
                      {msg.content}
                    </div>

                    <div className={`mt-1.5 text-[9.5px] font-mono flex items-center justify-end ${
                      isUser
                        ? 'text-sky-100/90'
                        : isDark
                        ? 'text-slate-400'
                        : 'text-slate-500'
                    }`}>
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>

                  {/* User Profile Avatar (Right) */}
                  {isUser && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-md shrink-0 mt-0.5 border border-indigo-300/40">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-2 justify-start">
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-500 p-0.5 shadow-md shrink-0 mt-0.5 border border-sky-400/40">
                  <img
                    src="/images/surge-ai.png"
                    alt="Surge AI"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div
                  className={`p-3 rounded-2xl rounded-tl-xs flex items-center space-x-2.5 max-w-[82%] sm:max-w-[85%] ${
                    isDark
                      ? 'bg-slate-800/90 text-cyan-400 border border-slate-700/80'
                      : 'bg-slate-100 text-cyan-800 border border-slate-200'
                  }`}
                >
                  <Bot className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
                  <span className="text-xs font-mono animate-pulse">
                    Fusing live SCADA telemetry & executing DeepSeek R1 reasoning...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* CATEGORIZED SUGGESTED PROMPT CHIPS */}
          {messages.length < 4 && !isLoading && (
            <div className={`px-4 py-3 border-t shrink-0 ${
              isDark
                ? 'border-slate-800/80 bg-slate-900/60'
                : 'border-slate-200/80 bg-slate-50/80'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {t.chatbot.suggestedQueries}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {categorizedPrompts.map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.query)}
                      className={`text-[11px] p-2 rounded-xl border text-left font-medium flex items-start space-x-2 transition-all ${
                        isDark
                          ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border-slate-800 hover:border-cyan-500/40'
                          : 'bg-white hover:bg-cyan-50/80 text-slate-700 hover:text-cyan-900 border-slate-200 hover:border-cyan-300 shadow-xs'
                      }`}
                    >
                      <ItemIcon className="w-3.5 h-3.5 text-cyan-500 mt-0.5 shrink-0" />
                      <span className="line-clamp-2 leading-tight">{item.query}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTIVE VOICE LISTENING BADGE */}
          {isListening && (
            <div className={`px-4 py-2 text-xs flex items-center justify-between border-t border-b shrink-0 animate-fade-in ${
              isDark
                ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span className="font-semibold animate-pulse">Listening... Speak clearly into your microphone</span>
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500 text-white hover:bg-rose-600 transition-colors"
              >
                Stop
              </button>
            </div>
          )}

          {/* INPUT FORM CONTAINER */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className={`p-3.5 sm:rounded-b-3xl border-t flex items-center space-x-2 shrink-0 ${
              isDark
                ? 'bg-slate-900/90 border-slate-800/80'
                : 'bg-slate-50/90 border-slate-200/80'
            }`}
          >
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={isLoading || rateLimitResetSec > 0}
                placeholder={
                  isListening
                    ? 'Listening to voice input... speak now'
                    : rateLimitResetSec > 0
                    ? `${t.chatbot.rateLimitActive} (${rateLimitResetSec}s)...`
                    : t.chatbot.inputPlaceholder
                }
                className={`w-full pl-3.5 ${
                  inputQuery.length > 0 ? 'pr-16' : 'pr-10'
                } py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                  isListening
                    ? 'ring-2 ring-rose-500/80 border-rose-500/50'
                    : 'focus:ring-cyan-500'
                } transition-all ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
                } ${rateLimitResetSec > 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
              />

              {/* Mic Voice STT Button */}
              <button
                type="button"
                onClick={toggleListening}
                disabled={isLoading || rateLimitResetSec > 0}
                title={isListening ? 'Stop voice recording' : 'Voice input (Speech to Text)'}
                className={`absolute ${
                  inputQuery.length > 0 ? 'right-8' : 'right-2.5'
                } p-1 rounded-lg transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/40'
                    : isDark
                    ? 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'
                    : 'text-slate-500 hover:text-cyan-600 hover:bg-slate-100'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {inputQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => setInputQuery('')}
                  className={`absolute right-2.5 p-1 rounded-full ${
                    isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading || rateLimitResetSec > 0}
              className={`p-2.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center shrink-0 ${
                !inputQuery.trim() || isLoading || rateLimitResetSec > 0
                  ? isDark
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 shadow-none'
                  : 'bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 active:scale-95 shadow-cyan-500/25'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ── FLOATING TOGGLE BUTTON ── */}
      <div
        className={`fixed bottom-4 right-3 sm:bottom-6 sm:right-4 md:right-6 z-[9999] font-sans antialiased pointer-events-auto transition-all duration-500 ease-out flex items-center ${
          !hasAnimatedIn
            ? 'translate-x-[120%] opacity-0'
            : isDocked
            ? 'translate-x-[calc(100%-28px)] opacity-90 hover:opacity-100'
            : 'translate-x-0'
        }`}
      >
        {/* Sleek Slide-In / Slide-Out Arrow Toggle Handle */}
        <button
          onClick={() => setIsDocked(!isDocked)}
          title={isDocked ? "Expand Surge AI" : "Slide Out Surge AI"}
          className={`p-1.5 rounded-l-xl bg-slate-900/90 dark:bg-slate-800/90 text-cyan-400 hover:text-white border-l border-y border-cyan-500/30 shadow-lg backdrop-blur-md transition-all shrink-0 ${
            isDocked ? 'w-7 h-12 flex items-center justify-center' : 'mr-1.5'
          }`}
        >
          {isDocked ? <ChevronLeft className="w-4 h-4 animate-pulse text-cyan-300" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Floating Prominent Avatar Card */}
        <div className="relative group flex items-center">
          <button
            onClick={() => {
              if (isDocked) {
                setIsDocked(false);
              } else {
                setIsOpen(!isOpen);
              }
            }}
            aria-label="Toggle Surge AI Chatbot"
            className="relative flex items-center justify-center p-0.5 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-2 border-sky-400 dark:border-sky-500/50 hover:border-cyan-400 group"
          >
            {isOpen ? (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[14px] bg-slate-800 flex items-center justify-center text-cyan-400">
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            ) : (
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-[14px] overflow-hidden p-0.5 bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 shadow-lg shadow-sky-500/30">
                <img
                  src="/images/surge-ai.png"
                  alt="Surge AI Avatar"
                  className="w-full h-full object-cover rounded-[11px] transform group-hover:scale-110 transition-transform duration-300"
                />
                {/* Pulsing live online status indicator */}
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500 border border-slate-900"></span>
                </span>
              </div>
            )}
          </button>

          {/* Hover Label Pill */}
          {!isDocked && !isOpen && (
            <div className="absolute right-full mr-2 px-3 py-1.5 bg-slate-900/95 dark:bg-slate-950/95 text-white text-xs font-bold rounded-xl border border-sky-500/40 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 flex items-center space-x-1.5 hidden sm:flex">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Surge AI Assistant</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
