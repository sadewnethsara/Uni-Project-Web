"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ANALYZE_THEME } from "@/lib/chartTheme";

interface ChatMessage {
  id: number;
  sender: "user" | "bot";
  text: string;
}

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "bot",
      text: "👋 Welcome to **NAMIS Market Intelligence AI**.\n\nAsk me about today's market prices, future commodity trends, or where to sell your crops (like Beans) for maximum profit!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const sendQuery = useCallback(async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now(), sender: "user", text: queryText };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });

      const data = await res.json();
      const botReply = data.reply || data.error || "Sorry, I couldn't process that market request right now.";

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "bot", text: botReply }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "⚠️ Network connection error. Please check your connection and try again."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(input);
  };

  // Helper to format basic markdown (bold **text**, bullet points •, newlines)
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-bold text-[#0f766e]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      return (
        <span key={lineIdx} className="block min-h-[1.15em] my-0.5">
          {formattedParts}
        </span>
      );
    });
  };

  const quickPrompts = [
    "What about today's market & future trends for Beans? Where to sell for high profit?",
    "Where is the highest market price for Grade A Beans today?",
    "What are today's top market prices across Economic Centers?"
  ];

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[40] pointer-events-none">
      <AnimatePresence mode="wait">
        {/* FLOATING CHAT PANEL */}
        {isOpen ? (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, scale: 0.3, y: 40, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.3, y: 40, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="pointer-events-auto flex flex-col w-[calc(100vw-2rem)] md:w-96 h-[calc(100vh-120px)] max-h-[480px] rounded-2xl shadow-2xl border overflow-hidden backdrop-blur-xl"
            style={{
              background: ANALYZE_THEME.surfaceRaised,
              borderColor: ANALYZE_THEME.borderStrong,
              color: ANALYZE_THEME.ink
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3.5 border-b select-none"
              style={{
                borderColor: ANALYZE_THEME.border,
                background: ANALYZE_THEME.surface
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-md border"
                  style={{
                    background: ANALYZE_THEME.accent,
                    color: "#ffffff",
                    borderColor: "rgba(15, 118, 110, 0.3)"
                  }}
                >
                  AI
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold tracking-wide" style={{ color: ANALYZE_THEME.ink }}>
                      NAMIS Market Advisor
                    </h3>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold"
                      style={{
                        background: ANALYZE_THEME.accentSoft,
                        color: ANALYZE_THEME.accentInk
                      }}
                    >
                      Gemini 2.0
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-medium" style={{ color: ANALYZE_THEME.inkMuted }}>
                      Real-time Market Intelligence
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-colors focus:outline-none"
                style={{ background: ANALYZE_THEME.surfaceMuted, color: ANALYZE_THEME.ink }}
                aria-label="Close chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "rounded-br-none font-medium shadow-md"
                        : "rounded-bl-none border"
                    }`}
                    style={{
                      background: msg.sender === "user" ? ANALYZE_THEME.accent : ANALYZE_THEME.surfaceMuted,
                      color: msg.sender === "user" ? "#ffffff" : ANALYZE_THEME.ink,
                      borderColor: msg.sender === "user" ? "transparent" : ANALYZE_THEME.border
                    }}
                  >
                    {msg.sender === "user" ? msg.text : renderFormattedText(msg.text)}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div
                    className="px-4 py-3 rounded-2xl rounded-bl-none border text-xs flex items-center gap-2"
                    style={{
                      background: ANALYZE_THEME.surfaceMuted,
                      color: ANALYZE_THEME.inkMuted,
                      borderColor: ANALYZE_THEME.border
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Analyzing market data & profit locations with Gemini AI...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Suggestions */}
            {messages.length < 3 && !isLoading && (
              <div
                className="px-3 py-2 border-t flex flex-wrap gap-1.5"
                style={{
                  borderColor: ANALYZE_THEME.border,
                  background: ANALYZE_THEME.surface
                }}
              >
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendQuery(prompt)}
                    className="text-[11px] text-left px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer truncate max-w-full font-medium"
                    style={{
                      background: ANALYZE_THEME.surfaceMuted,
                      borderColor: ANALYZE_THEME.border,
                      color: ANALYZE_THEME.inkMuted
                    }}
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Footer */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t flex items-center gap-2"
              style={{
                borderColor: ANALYZE_THEME.border,
                background: ANALYZE_THEME.surface
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about market prices, bean trends, high profits..."
                disabled={isLoading}
                className="flex-1 border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-colors disabled:opacity-50 font-medium"
                style={{
                  background: ANALYZE_THEME.surfaceMuted,
                  borderColor: ANALYZE_THEME.border,
                  color: ANALYZE_THEME.ink
                }}
              />
              <motion.button
                type="submit"
                disabled={isLoading || !input.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold cursor-pointer border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: input.trim() ? ANALYZE_THEME.accent : ANALYZE_THEME.surfaceMuted,
                  color: input.trim() ? "#ffffff" : ANALYZE_THEME.inkMuted,
                  borderColor: "transparent"
                }}
                aria-label="Send message"
              >
                <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
              </motion.button>
            </form>
          </motion.div>
        ) : (
          /* TRIGGER BUTTON */
          <motion.button
            key="chat-trigger"
            onClick={() => setIsOpen(true)}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="pointer-events-auto relative flex items-center justify-center w-13 h-13 rounded-2xl shadow-2xl cursor-pointer border focus:outline-none"
            style={{
              background: ANALYZE_THEME.ink,
              color: ANALYZE_THEME.surface,
              borderColor: ANALYZE_THEME.borderStrong
            }}
            aria-label="Open chat assistant"
          >
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.816-.957 6.13 6.13 0 00.741-2.316A7.957 7.957 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}