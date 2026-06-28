"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Terminal, Send, Cpu, MessageSquare, Loader2, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function AIAssistantModule() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Vanguard Astro AI mainframes online. I am your on-board systems analyst. Send any flight vectors, exoplanet inquiries, or warp engine diagnostic logs for predictive analysis."
    }
  ]);
  const [loading, setLoading] = useState(false);
  const streamEndRef = useRef<HTMLDivElement | null>(null);

  const presets = [
    { label: "Warp Core Diagnostic", prompt: "Run a warp reactor core diagnostic and forecast Alcubierre field stability." },
    { label: "Atmosphere Assessment", prompt: "Compare the atmospheric hazard profiles of Kepler-186f and TRAPPIST-1e." },
    { label: "Titan Logistics Refuel", prompt: "Draft a fuel cells offloading flight plan and logistics trajectory for Titan Outpost." }
  ];

  const scrollToEnd = () => {
    streamEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToEnd();
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg = textToSend.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    // Add empty assistant response to stream into
    setMessages((prev) => [...prev, { role: "assistant", text: "" }]);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg,
          systemInstruction: "You are Vanguard Astro's on-board AI systems analyst. Respond in a highly professional, cold, technical spaceflight cockpit HUD style. Use clean markdown. Be concise."
        })
      });

      if (!response.ok) {
        throw new Error("Uplink failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (!reader) {
        throw new Error("No response body reader.");
      }

      let done = false;
      let accumulatedText = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          accumulatedText += chunk;
          
          // Stream text directly into the last assistant message
          setMessages((prev) => {
            const next = [...prev];
            if (next.length > 0) {
              next[next.length - 1] = {
                role: "assistant",
                text: accumulatedText
              };
            }
            return next;
          });
        }
      }
    } catch (err: any) {
      setMessages((prev) => {
        const next = [...prev];
        if (next.length > 0) {
          next[next.length - 1] = {
            role: "assistant",
            text: "CRITICAL ALERT: Communication link refracted. Core backup offline."
          };
        }
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-white/5 bg-space-card/85 backdrop-blur-3xl relative overflow-hidden shadow-purple-glow">
      {/* Structural Glass Grid Backplane */}
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />
      <div className="absolute top-0 left-0 w-8 h-[1px] bg-nova-purple" />
      <div className="absolute top-0 left-0 w-[1px] h-8 bg-nova-purple" />
      <div className="absolute bottom-0 right-0 w-8 h-[1px] bg-nova-purple" />
      <div className="absolute bottom-0 right-0 w-[1px] h-8 bg-nova-purple" />

      {/* Header Panel */}
      <div className="flex justify-between items-center border-b border-white/5 p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-4 h-4 text-nova-purple animate-pulse" />
          <div>
            <span className="font-mono text-[9px] tracking-[0.2em] text-slate-500 uppercase block">Predictive Co-Pilot</span>
            <h4 className="font-display text-sm font-bold uppercase tracking-wide text-white">AI COGNITION MAIN FRAME</h4>
          </div>
        </div>
        <span className="font-mono text-[9px] text-nova-purple bg-nova-purple/10 border border-nova-purple/30 px-2.5 py-1">
          EDGE HYPERTHREAD STREAM
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/5 min-h-[380px]">
        {/* Left Column: AI Cockpit Presets */}
        <div className="p-4 sm:p-5 flex flex-col gap-3.5 lg:col-span-1">
          <span className="font-mono text-[9px] tracking-[0.15em] text-slate-500 uppercase flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-nova-purple" />
            Cockpit Presets
          </span>
          <div className="flex flex-col gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleSend(preset.prompt)}
                disabled={loading}
                className="w-full text-left p-3 border border-white/5 bg-black/40 hover:bg-nova-purple/5 hover:border-nova-purple/35 text-slate-400 hover:text-white transition duration-200 font-mono text-[10px] uppercase tracking-wide leading-relaxed disabled:opacity-50"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="mt-auto hidden lg:block border border-white/5 bg-black/20 p-3 font-mono text-[9px] leading-relaxed text-slate-600">
            <div>APU TEMPLATE: GEMINI-2.5-FLASH</div>
            <div>STABILIZER: EDGE WEB STREAMS</div>
            <div>STATUS: LATENCY COMPENSATED</div>
          </div>
        </div>

        {/* Right Columns: Active AI terminal chat screen */}
        <div className="lg:col-span-3 flex flex-col h-[380px] lg:h-auto">
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 max-h-[300px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 items-start ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role !== "user" && (
                  <div className="w-7 h-7 shrink-0 grid place-items-center bg-nova-purple/10 border border-nova-purple/30 text-nova-purple">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3.5 font-mono text-[11px] leading-relaxed relative ${
                    msg.role === "user"
                      ? "bg-white/5 border border-white/10 text-slate-200 rounded-[2px]"
                      : "bg-black/30 border border-nova-purple/10 text-slate-300 rounded-[2px]"
                  }`}
                >
                  {msg.role === "user" && (
                    <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1 select-none text-right">
                      Commander Coordinate
                    </div>
                  )}
                  {msg.role === "assistant" && msg.text === "" ? (
                    <div className="flex items-center gap-2 text-nova-purple">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-[9px] tracking-widest uppercase">RECEIVING AI STREAM PACKETS...</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-line tracking-wide break-all">
                      {msg.text}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 shrink-0 grid place-items-center bg-white/5 border border-white/10 text-white">
                    <Terminal className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            <div ref={streamEndRef} />
          </div>

          {/* Chat entry form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="border-t border-white/5 p-3 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ASK CO-PILOT TERMINAL FOR FLIGHT ANALYSIS..."
              disabled={loading}
              className="flex-1 bg-black/60 border border-white/10 focus:border-nova-purple/40 text-white font-mono text-[10px] uppercase tracking-[0.1em] px-4 py-3 focus:outline-none transition-all placeholder:text-slate-600 rounded-[2px]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 bg-nova-purple hover:bg-nova-purple/90 text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-[10px] font-bold uppercase tracking-wider rounded-[2px]"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  <span className="hidden sm:inline">Stream</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
