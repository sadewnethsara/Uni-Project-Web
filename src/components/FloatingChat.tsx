"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ANALYZE_THEME } from "@/lib/chartTheme";

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Hello! How can I assist with market trends or pricing today?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { id: Date.now(), sender: "user", text: input }]);
    setInput("");

    // Simulated AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "bot", text: "Thanks for reaching out! Analyzing market data..." }
      ]);
    }, 800);
  };

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[40] pointer-events-none">
      <AnimatePresence mode="wait">
        {/* FLOATING CHAT PANEL (HERO ANIMATION) */}
        {isOpen ? (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, scale: 0.3, y: 40, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.3, y: 40, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="pointer-events-auto flex flex-col w-[calc(100vw-2rem)] md:w-96 h-[calc(100vh-120px)] max-h-[480px] rounded-2xl shadow-2xl border overflow-hidden"
            style={{
              background: ANALYZE_THEME.ink,
              borderColor: "rgba(255,255,255,0.12)",
              color: ANALYZE_THEME.surface
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3.5 border-b"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs"
                  style={{ background: ANALYZE_THEME.surfaceRaised, color: ANALYZE_THEME.ink }}
                >
                  AI
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide" style={{ color: ANALYZE_THEME.surface }}>
                    Market Assistant
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] opacity-60">Online</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-colors focus:outline-none"
                style={{ background: "rgba(255,255,255,0.06)", color: ANALYZE_THEME.surface }}
                aria-label="Close chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-none">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed font-medium ${msg.sender === "user" ? "rounded-br-none" : "rounded-bl-none"
                      }`}
                    style={{
                      background: msg.sender === "user" ? ANALYZE_THEME.surfaceRaised : "rgba(255,255,255,0.08)",
                      color: msg.sender === "user" ? ANALYZE_THEME.ink : ANALYZE_THEME.surface
                    }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSend} className="p-3 border-t flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-white/20 transition-colors"
                style={{ color: ANALYZE_THEME.surface }}
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold cursor-pointer border"
                style={{
                  background: ANALYZE_THEME.surfaceRaised,
                  color: ANALYZE_THEME.ink,
                  borderColor: "transparent"
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L32 12M12 6l6 6-6 6" />
                </svg>
              </motion.button>
            </form>
          </motion.div>
        ) : (
          /* TRIGGER BUTTON (Matching Back-To-Top Button radii & theme) */
          <motion.button
            key="chat-trigger"
            onClick={() => setIsOpen(true)}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="pointer-events-auto flex items-center justify-center w-12 h-12 rounded-xl shadow-2xl cursor-pointer border focus:outline-none"
            style={{
              background: ANALYZE_THEME.ink,
              color: ANALYZE_THEME.surface,
              borderColor: "rgba(255,255,255,0.12)"
            }}
            aria-label="Open chat assistant"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.816-.957 6.13 6.13 0 00.741-2.316A7.957 7.957 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}