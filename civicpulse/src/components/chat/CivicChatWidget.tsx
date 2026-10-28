'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Ticket, 
  Star, 
  Check, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Minimize2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  ticketId?: string;
}

export function CivicChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I am **CivicPulse AI**, your municipal assistant. I can answer questions from our official city FAQs, explain error codes (like 400, 401, 403, 404, 422, 429, 500, 503), or file an official support ticket for you. How can I help today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`sess-${Date.now()}`);

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Listen to custom event from 404, 500, or other pages
  useEffect(() => {
    const handleOpenChat = (e: any) => {
      setIsOpen(true);
      if (e.detail?.query) {
        setTimeout(() => {
          handleSendMessage(e.detail.query);
        }, 300);
      }
    };

    window.addEventListener('open-civic-chat', handleOpenChat as EventListener);
    return () => {
      window.removeEventListener('open-civic-chat', handleOpenChat as EventListener);
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText.trim(),
          history: messages.slice(-6),
          sessionId,
          userEmail: user?.email || 'citizen@civicpulse.org',
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toISOString(),
            ticketId: data.createdTicket?.id,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `I encountered an unexpected issue retrieving that answer. I can file a support ticket for you—would you like me to?`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Connection error: Unable to reach municipal assistant endpoint. Please try again.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = async (rating: number) => {
    setFeedbackRating(rating);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user?.email || 'citizen@civicpulse.org',
          rating,
          category: 'ai_assistant',
          comment: `Citizen rated chat session ${rating}/5 stars`,
          pageUrl: typeof window !== 'undefined' ? window.location.pathname : '/',
        }),
      });
      setFeedbackSent(true);
      setTimeout(() => setFeedbackSent(false), 4000);
    } catch (e) {
      console.warn('Feedback submit failed:', e);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="Open CivicPulse AI Assistant"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-teal-400 shadow-xl border-2 border-teal-500/30 hover:scale-105 active:scale-95 transition-all duration-200 group"
          aria-label="Open Municipal Assistant Chat"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-600 text-[9px] font-bold text-white items-center justify-center">
              AI
            </span>
          </span>
          <MessageSquare className="h-6 w-6 text-teal-400 group-hover:rotate-6 transition" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col w-[calc(100vw-32px)] sm:w-[420px] h-[580px] max-h-[85vh] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">CivicPulse AI Assistant</h3>
                <span className="text-[11px] text-teal-400 flex items-center gap-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Grounded in City FAQs & SQL Tickets
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              aria-label="Close Assistant"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 text-xs sm:text-sm">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isUser
                        ? 'bg-slate-900 text-white'
                        : 'bg-teal-100 text-teal-800 border border-teal-200'
                    }`}
                  >
                    {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>

                  <div
                    className={`rounded-2xl px-3.5 py-2.5 max-w-[85%] leading-relaxed shadow-2xs whitespace-pre-wrap ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                    }`}
                  >
                    {m.content}

                    {/* Support Ticket Badge if Created */}
                    {m.ticketId && (
                      <div className="mt-2.5 rounded-lg bg-teal-50 border border-teal-200 p-2 text-teal-900 font-medium flex items-center gap-1.5 text-xs">
                        <Ticket className="h-3.5 w-3.5 text-teal-700" />
                        <span>Ticket Reference: <strong>#{m.ticketId}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl rounded-tl-none bg-white p-3 border border-slate-200 shadow-2xs">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-teal-600 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-medium whitespace-nowrap">Suggestions:</span>
            <button
              onClick={() => handleSendMessage('How do I report a pothole?')}
              className="rounded-full bg-white px-2.5 py-1 text-slate-700 border border-slate-200 whitespace-nowrap hover:bg-teal-50 hover:text-teal-800 transition"
            >
              Report Pothole
            </button>
            <button
              onClick={() => handleSendMessage('What does Error 403 mean?')}
              className="rounded-full bg-white px-2.5 py-1 text-slate-700 border border-slate-200 whitespace-nowrap hover:bg-teal-50 hover:text-teal-800 transition"
            >
              Explain 403
            </button>
            <button
              onClick={() => handleSendMessage('What is site-specific Error 422?')}
              className="rounded-full bg-white px-2.5 py-1 text-slate-700 border border-slate-200 whitespace-nowrap hover:bg-teal-50 hover:text-teal-800 transition"
            >
              Site Error 422
            </button>
            <button
              onClick={() => handleSendMessage('Create a support ticket')}
              className="rounded-full bg-white px-2.5 py-1 text-teal-700 border border-teal-200 font-semibold whitespace-nowrap hover:bg-teal-50 transition"
            >
              + Support Ticket
            </button>
          </div>

          {/* Feedback Star Bar */}
          <div className="px-3 py-1 bg-white border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Was this answer helpful?</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => submitFeedback(star)}
                  className={`p-0.5 hover:text-amber-500 transition ${
                    feedbackRating && feedbackRating >= star ? 'text-amber-500' : 'text-slate-300'
                  }`}
                  title={`Rate ${star} stars`}
                >
                  <Star className="h-3 w-3 fill-current" />
                </button>
              ))}
              {feedbackSent && <span className="text-emerald-600 font-bold ml-1">Saved!</span>}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about FAQs, error codes, or ask to create a ticket..."
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="rounded-xl bg-teal-600 p-2 text-white shadow-2xs hover:bg-teal-700 disabled:opacity-40 transition"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
