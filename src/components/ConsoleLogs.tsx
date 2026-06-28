"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MissionLog } from "../types";
import { Terminal, Shield, Sparkles, Filter, RefreshCw } from "lucide-react";

interface ConsoleLogsProps {
  logs: MissionLog[];
  loading: boolean;
  onRefresh: () => void;
}

export default function ConsoleLogs({ logs, loading, onRefresh }: ConsoleLogsProps) {
  const [filter, setFilter] = useState("ALL");

  const filteredLogs = logs.filter(log => {
    if (filter === "ALL") return true;
    return log.type.toUpperCase() === filter.toUpperCase();
  });

  const getLogTypeStyling = (type: string) => {
    switch (type.toUpperCase()) {
      case "ALERT":
      case "HAZARD_WARN":
        return "text-hazard-red border-hazard-red/20 bg-hazard-red/5";
      case "TELEMETRY":
        return "text-cyber-cyan border-cyber-cyan/25 bg-cyber-cyan/5";
      case "NAVIGATION":
      case "SYSTEM":
        return "text-nova-purple border-nova-purple/20 bg-nova-purple/5";
      case "SECURITY":
        return "text-hazard-gold border-hazard-gold/20 bg-hazard-gold/5";
      case "UPLINK":
        return "text-signal-green border-signal-green/20 bg-signal-green/5";
      default:
        return "text-slate-400 border-white/10 bg-white/5";
    }
  };

  return (
    <div className="border border-white/5 bg-black/60 backdrop-blur-3xl p-5.5 font-mono text-[11px] leading-relaxed relative overflow-hidden">
      {/* Visual cyber bracket highlights */}
      <div className="absolute top-0 right-0 w-4 h-[1px] bg-white/20" />
      <div className="absolute top-0 right-0 w-[1px] h-4 bg-white/20" />
      <div className="absolute bottom-0 left-0 w-4 h-[1px] bg-white/20" />
      <div className="absolute bottom-0 left-0 w-[1px] h-4 bg-white/20" />

      {/* Header section with asymmetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyber-cyan animate-pulse" />
          <span className="text-white font-bold tracking-[0.22em] uppercase">SYSTEMS REPORT LOG [ONLINE]</span>
        </div>

        {/* Console filtering options */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-slate-500 scale-90 uppercase tracking-widest flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-500" />
            FILTER:
          </span>
          <div className="flex bg-space p-0.5 border border-white/5 gap-1 text-[9px] overflow-x-auto max-w-full sm:max-w-none scrollbar-none">
            {["ALL", "SYSTEM", "TELEMETRY", "UPLINK", "SECURITY", "ALERT"].map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-2 py-1 transition-all uppercase tracking-widest shrink-0 ${filter === category ? 'bg-cyber-cyan text-black font-bold' : 'text-slate-500 hover:text-white'}`}
              >
                {category}
              </button>
            ))}
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1 border border-white/5 hover:border-white/15 text-slate-400 hover:text-white transition-all disabled:opacity-50"
            title="Reload Console Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Logs stream container */}
      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 text-center py-10 uppercase tracking-widest font-mono">
            NO CONPORT TRANSCRIPTS REGISTERED UNDER TARGET FILTER ({filter})
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -5, y: -2 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 border-b border-white/[0.02] pb-2 text-slate-400 group hover:bg-white/[0.01] p-1.5 transition-all"
              >
                {/* UTC system time */}
                <span className="text-slate-600 font-mono text-[10px] select-none uppercase pt-0.5 shrink-0">
                  [{new Date(log.timestamp).toISOString().substring(11, 19)}]
                </span>

                {/* Level tags */}
                <span className={`px-2 py-0.5 border text-[8px] font-bold tracking-widest shrink-0 uppercase rounded-[2px] ${getLogTypeStyling(log.type)}`}>
                  {log.type}
                </span>

                {/* Log instructions with high-contrast text on hover */}
                <span className="text-slate-350 tracking-wide font-mono leading-relaxed group-hover:text-white transition-colors break-all">
                  {log.text}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Cyber metric bottom ticker */}
      <div className="flex justify-between items-center text-[10px] text-slate-600 pt-3 border-t border-white/5 font-mono select-none mt-4">
        <span>RELAY SYNC STATUS: NOMINAL</span>
        <span>STREAM BANDWIDTH: 4096 KBPS</span>
      </div>
    </div>
  );
}
