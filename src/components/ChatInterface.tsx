import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { ChatMessage, WeatherData } from '../types';
import {
  Send,
  Sparkles,
  Bot,
  User,
  AlertTriangle,
  RotateCcw,
  CloudSun,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Droplets,
  Wind
} from 'lucide-react';
import { formatTemp } from '../utils/weatherCodes';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onClearHistory: () => void;
  tempUnit: 'C' | 'F';
  currentCity: string;
}

const STARTER_PROMPTS = [
  'Will it rain this week and do I need an umbrella?',
  'Are there any severe weather or storm alerts active?',
  'How will climate change affect local rainfall and heat patterns?',
  'What should I pack for an outdoor trip this weekend?',
  'Compare current weather with historical seasonal averages',
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onClearHistory,
  tempUnit,
  currentCity,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handlePromptClick = (prompt: string) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  const lastAssistantMessage = [...messages].reverse().find(m => m.sender === 'assistant');

  return (
    <div className="flex flex-col h-[650px] lg:h-[720px] rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400">
            AI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-wide">
                AtmosphereAI
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                Gemini Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Forecasting, severe warning advisories & climate analysis
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClearHistory}
          className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors text-xs flex items-center gap-1.5"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs">Reset</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] sm:max-w-[78%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                {isUser ? (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-slate-950 shrink-0 mt-0.5">
                    U
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0 mt-0.5">
                    AI
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`p-4 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none shadow-lg shadow-blue-900/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Text Content with Markdown */}
                  <div className="prose prose-invert prose-sm max-w-none break-words [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>li]:mb-1 text-inherit">
                    <Markdown>{msg.text}</Markdown>
                  </div>

                  {/* Embedded Weather Mini-Card if message contains newly loaded location */}
                  {msg.weatherData && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2">
                        <CloudSun className="w-4 h-4 text-amber-400" />
                        <span className="font-semibold text-white">
                          {msg.weatherData.city}: {formatTemp(msg.weatherData.current.temperature, tempUnit)}
                        </span>
                        <span className="text-slate-400">
                          • {msg.weatherData.current.weatherDescription}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-blue-400" />
                          {msg.weatherData.current.humidity}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Wind className="w-3 h-3 text-teal-400" />
                          {Math.round(msg.weatherData.current.windSpeed)} km/h
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Embedded Severe Alert preview if active */}
                  {msg.alerts && msg.alerts.length > 0 && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-rose-900/20 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>
                        Active: <strong>{msg.alerts[0].title}</strong> — {msg.alerts[0].instruction}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamp label */}
              <span className={`text-[10px] text-slate-600 mt-1 px-11 ${isUser ? 'text-right' : 'text-left'}`}>
                {isUser ? `You • ${timeStr}` : `AtmosphereAI • ${timeStr}`}
              </span>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
              AI
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-sm text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-150" />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-300" />
              <span className="text-xs text-slate-400 ml-1">Analyzing meteorological models & radar...</span>
            </div>
          </div>
        )}

        {/* Dynamic Suggested Follow-ups */}
        {!isLoading && lastAssistantMessage?.suggestedFollowUps && lastAssistantMessage.suggestedFollowUps.length > 0 && (
          <div className="pt-2">
            <span className="text-xs text-slate-500 font-semibold block mb-2 uppercase tracking-wider">
              Suggested queries:
            </span>
            <div className="flex flex-wrap gap-2">
              {lastAssistantMessage.suggestedFollowUps.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePromptClick(prompt)}
                  className="px-3 py-1.5 rounded-full text-xs bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-left"
                >
                  <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts (if chat is short or empty) */}
      {messages.length <= 2 && (
        <div className="px-6 py-2.5 border-t border-slate-800 bg-slate-950">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
            Quick Questions for {currentCity}:
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePromptClick(prompt)}
                disabled={isLoading}
                className="shrink-0 px-3 py-1 rounded-full text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sleek Input Box & Action Bar */}
      <div className="p-5 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask AtmosphereAI about ${currentCity}'s weather, alerts, or climate...`}
            disabled={isLoading}
            className="w-full py-3.5 px-5 pr-28 bg-slate-900 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-white placeholder:text-slate-500 transition-all shadow-inner disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="absolute right-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Sleek Bottom Action Triggers */}
        <div className="flex justify-center space-x-6 mt-3">
          <button
            type="button"
            onClick={() => handlePromptClick(`Generate a comprehensive 7-day weather forecast report for ${currentCity}`)}
            disabled={isLoading}
            className="text-[10px] text-slate-500 hover:text-slate-300 font-medium uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            Generate Report
          </button>
          <button
            type="button"
            onClick={() => handlePromptClick(`Compare ${currentCity}'s current weather with historical seasonal climate baselines`)}
            disabled={isLoading}
            className="text-[10px] text-slate-500 hover:text-slate-300 font-medium uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            Compare Norms
          </button>
          <button
            type="button"
            onClick={() => handlePromptClick(`Summarize current severe storm alerts and air quality conditions in ${currentCity}`)}
            disabled={isLoading}
            className="text-[10px] text-slate-500 hover:text-slate-300 font-medium uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            Export Summary
          </button>
        </div>
      </div>
    </div>
  );
};
