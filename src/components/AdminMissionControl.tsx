"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TelemetryState, MissionLog, Subscriber } from "../types";
import { 
  ShieldCheck, 
  Trash2, 
  Radio, 
  Terminal, 
  Send, 
  Activity, 
  Database, 
  ArrowRight, 
  Compass, 
  Zap, 
  ShieldAlert, 
  RefreshCw 
} from "lucide-react";

interface AdminMissionControlProps {
  telemetry: TelemetryState | null;
  onTelemetryUpdate: (updated: TelemetryState) => void;
  logs: MissionLog[];
  onRefreshLogs: () => void;
}

export default function AdminMissionControl({ telemetry, onTelemetryUpdate, logs, onRefreshLogs }: AdminMissionControlProps) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  
  const [manualLog, setManualLog] = useState("");
  const [manualLogType, setManualLogType] = useState("INFO");
  const [submittingLog, setSubmittingLog] = useState(false);

  // Load registered recipients coordinates
  const fetchSubscribers = async () => {
    setLoadingSubs(true);
    try {
      const resp = await fetch("/api/subscribe"); // In next.js, GET /api/subscribe returns the list
      if (resp.ok) {
        const data = await resp.json();
        setSubscribers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSubs(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [logs]);

  // Push cruising state adjustment
  const handleCruiseChange = async (state: string) => {
    try {
      const resp = await fetch("/api/telemetry/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cruisingState: state })
      });
      if (resp.ok) {
        const data = await resp.json();
        onTelemetryUpdate(data.telemetry);
        onRefreshLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Adjust active fleet transponders
  const handleFleetAdjustment = async (delta: number, field: "activeFleet" | "fleetInTransfer") => {
    if (!telemetry) return;
    const currentVal = telemetry[field];
    const newVal = Math.max(0, currentVal + delta);
    try {
      const resp = await fetch("/api/telemetry/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newVal })
      });
      if (resp.ok) {
        const data = await resp.json();
        onTelemetryUpdate(data.telemetry);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete registered node coordinates
  const handleDeleteSubscriber = async (email: string) => {
    if (!confirm(`Confirm revocation of telemetry uplink for coordinate: ${email}`)) return;
    try {
      const resp = await fetch(`/api/subscribers/${encodeURIComponent(email)}`, {
        method: "DELETE"
      });
      if (resp.ok) {
        setSubscribers(prev => prev.filter(s => s.email !== email));
        onRefreshLogs();
      } else {
        alert("Failed to revoke coordinate.");
      }
    } catch (err) {
      alert("Error contacting backplane server.");
    }
  };

  // Submit handcrafted system log to raw cockpit stream
  const handleSubmitLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLog.trim()) return;

    setSubmittingLog(true);
    try {
      const resp = await fetch("/api/mission-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: manualLog, type: manualLogType })
      });
      if (resp.ok) {
        setManualLog("");
        onRefreshLogs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingLog(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-space py-24 px-5 sm:px-8 border-t border-white/5">
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex items-center gap-3.5 border-b border-white/5 pb-8 mb-12">
          <div className="grid h-12 w-12 place-items-center border border-nova-purple/40 bg-nova-purple/10 shadow-purple-glow">
            <ShieldCheck className="w-5 h-5 text-nova-purple" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-nova-purple bg-nova-purple/15 border border-nova-purple/35 px-1.5 py-0.5 uppercase tracking-widest animate-pulse">ADMIN PRIVILEGES</span>
              <span className="h-1.5 w-1.5 rounded-full bg-signal-green" />
              <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">AUTHENTICATED SECURE</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-white mt-1">
              COMMAND CONTROL BRIDGE
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COMMAND MODULE: REALTIME PROPULSION & ALERTS */}
          <div className="lg:col-span-1 space-y-6">
            <div className="border border-white/5 bg-void p-5 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 left-0 w-6 h-[1px] bg-nova-purple" />
              <div className="absolute top-0 left-0 w-[1px] h-6 bg-nova-purple" />
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.22em] block mb-4 flex items-center gap-2">
                <Compass className="w-4 h-4 text-nova-purple" />
                CRUISING CONTROLLERS
              </span>

              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Manually shift Core propulsion vectors. This triggers deep Alcubierre warp grids or alert diagnostics across the entire fleet network immediately.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "NOMINAL", label: "STANDARD NOMINAL", style: "border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/5" },
                  { id: "WARP", label: "COMMIT ALCUBIERRE WARP", style: "border-nova-purple/40 text-nova-purple hover:bg-nova-purple/5" },
                  { id: "HAZARD_WARN", label: "LOCK HAZARD WARNINGS", style: "border-hazard-red/40 text-hazard-red hover:bg-hazard-red/5" },
                  { id: "DEEP_DOCK", label: "ALIGN OMEGA PORT", style: "border-hazard-gold/40 text-hazard-gold hover:bg-hazard-gold/5" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleCruiseChange(item.id)}
                    className={`border p-3.5 font-mono text-[9px] uppercase tracking-wider text-center transition-all cursor-pointer ${
                      telemetry?.cruisingState === item.id 
                        ? "bg-slate-200 text-black font-bold border-white" 
                        : item.style
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-white/5 bg-void p-5">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.22em] block mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyber-cyan" />
                Vessels Calibration
              </span>
              
              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between bg-space-card p-3 border border-white/5">
                  <span className="text-slate-400">ACTIVE FLEET UNITS:</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleFleetAdjustment(-1, "activeFleet")} 
                      className="w-7 h-7 bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center active:bg-white/20 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-bold text-white w-6 text-center">{telemetry?.activeFleet ?? 14}</span>
                    <button 
                      onClick={() => handleFleetAdjustment(1, "activeFleet")} 
                      className="w-7 h-7 bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center active:bg-white/20 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-space-card p-3 border border-white/5">
                  <span className="text-slate-400">UNITS IN TRANSFER:</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleFleetAdjustment(-1, "fleetInTransfer")} 
                      className="w-7 h-7 bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center active:bg-white/20 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-bold text-white w-6 text-center">{telemetry?.fleetInTransfer ?? 3}</span>
                    <button 
                      onClick={() => handleFleetAdjustment(1, "fleetInTransfer")} 
                      className="w-7 h-7 bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center active:bg-white/20 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER COMMAND MODULE: DIRECT LOG INJECTION TERMINAL */}
          <div className="lg:col-span-1 border border-white/5 bg-void p-5 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.22em] block mb-4 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyber-cyan animate-pulse" />
                INJECT CORE TERMINAL COMMANDS
              </span>
              
              <form onSubmit={handleSubmitLog} className="space-y-4 font-mono text-[11px] uppercase">
                <div>
                  <label className="text-slate-500 block mb-1.5">LOG CATEGORY FIELD</label>
                  <select
                    value={manualLogType}
                    onChange={(e) => setManualLogType(e.target.value)}
                    className="w-full bg-space-card text-white border border-white/10 p-3 focus:border-cyber-cyan/40 focus:outline-none"
                  >
                    <option value="INFO">INFORMATION LAYER</option>
                    <option value="TELEMETRY">COCKPIT SENSORS</option>
                    <option value="SYSTEM">PROPULSION FUSION</option>
                    <option value="SECURITY">TETHER PROTECTION</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1.5">HANDCRAFTED COMMAND MESSAGE</label>
                  <textarea
                    value={manualLog}
                    onChange={(e) => setManualLog(e.target.value)}
                    placeholder="ENTER BRIDGE LOG TEXT HERE..."
                    rows={3}
                    required
                    className="w-full bg-space-card text-white placeholder:text-slate-600 border border-white/10 p-3 focus:border-cyber-cyan/40 focus:outline-none transition-all duration-300 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingLog || !manualLog.trim()}
                  className="w-full bg-cyber-cyan text-black py-3.5 font-bold uppercase tracking-widest text-xs transition hover:brightness-110 disabled:opacity-55 active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Log Entry</span>
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 bg-black/30 p-3.5 font-mono text-[9px] leading-relaxed uppercase text-slate-500">
              <span className="text-cyber-cyan font-bold block mb-1">BRIDGE PROTOCOLS VALID:</span>
              ALL SYSTEM TERMINALS RECORD SECURE ORIGIN STAMPS. MANUAL LOGS ARE COMMITTED INSTANTLY FOR THE DEPLOYED CABIN DECK.
            </div>
          </div>

          {/* RIGHT COMMAND MODULE: SUBSCRIBER RECIPIENT REGISTRY DATA */}
          <div className="lg:col-span-1 border border-white/5 bg-void p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-3">
              <button 
                onClick={fetchSubscribers} 
                disabled={loadingSubs}
                className="p-1.5 border border-white/10 text-slate-400 hover:text-white transition disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSubs ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.22em] block mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-nova-purple" />
                UPLINK DIRECTORY RECIPIENTS ({subscribers.length})
              </span>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Active telemetry transceivers synchronized with the deep backplane networks. If empty, coordinate an uplink via the transceiver card.
              </p>

              <div className="max-h-[300px] overflow-y-auto border border-white/5 space-y-1 bg-black/30 p-2">
                {loadingSubs && subscribers.length === 0 ? (
                  <div className="font-mono text-[9px] text-slate-500 py-8 text-center">SYNCHRONIZING RECIPIENT CORE METADATA...</div>
                ) : subscribers.length === 0 ? (
                  <div className="p-8 text-center">
                    <span className="font-mono text-[9px] text-slate-600 block mb-1">NO DEEP RECIPIENTS FOUND</span>
                    <p className="text-[10px] text-slate-500 uppercase leading-relaxed font-mono">LINK AN ADDR COORD VESTIBULE CARD DOWN BELOW</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {subscribers.map((sub) => (
                      <motion.div
                        key={sub.email}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex justify-between items-center bg-space-card/85 p-2.5 border border-white/5 hover:border-cyber-cyan/30 transition-all duration-200"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="font-mono text-[10px] text-slate-100 font-medium truncate uppercase tracking-tight">{sub.email}</p>
                          <div className="flex items-center gap-2 mt-1 font-mono text-[8px] text-slate-500">
                            <span>{new Date(sub.joinedAt).toLocaleTimeString()}</span>
                            <span className="px-1 border border-white/10 bg-white/5 text-cyber-cyan rounded-[2px]">{sub.source}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteSubscriber(sub.email)}
                          className="p-2 border border-white/5 hover:border-hazard-red text-slate-500 hover:text-hazard-red hover:bg-hazard-red/5 transition-all cursor-pointer"
                          title="Revoke Telemetry Uplink"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

            <div className="mt-4 text-[10px] font-mono tracking-widest text-slate-500 flex justify-between items-center pt-3 border-t border-white/5">
              <span>BACKPLANE: LIVE</span>
              <span className="text-cyber-cyan">INTEGRITY 100%</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
