import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Radio, Terminal, Compass, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

interface MissionTransmissionsProps {
  onSubscriptionSuccess?: () => void;
}

export default function MissionTransmissions({ onSubscriptionSuccess }: MissionTransmissionsProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ status: "idle" | "success" | "error"; text: string }>({
    status: "idle",
    text: ""
  });

  const handleTransmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setFeedback({ status: "idle", text: "" });

    try {
      const resp = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await resp.json();
      if (resp.ok) {
        setFeedback({ status: "success", text: data.message || "Uplink verified. Commander." });
        setEmail("");
        if (onSubscriptionSuccess) {
          onSubscriptionSuccess();
        }
      } else {
        setFeedback({ status: "error", text: data.message || "Uplink signal refracted. Verify coordinates." });
      }
    } catch (err) {
      setFeedback({ status: "error", text: "Backplane offline. Fallback telemetry active." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-void py-32 px-5 sm:px-8">
      {/* Structural Glass Grid Backplane */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-void via-space/40 to-void pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-2/3 bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent" />
      
      {/* Dynamic Laser Line Scanning Overlay */}
      <div className="absolute inset-x-0 h-[1px] bg-cyber-cyan/25 top-12 animate-scanline pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="border border-white/5 bg-space-card/80 p-8 md:p-12 backdrop-blur-3xl relative overflow-hidden shadow-cyan-glow">
          
          {/* Subtle cockpit corner ticks */}
          <div className="absolute top-0 left-0 w-8 h-[1px] bg-cyber-cyan" />
          <div className="absolute top-0 left-0 w-[1px] h-8 bg-cyber-cyan" />
          <div className="absolute top-0 right-0 w-8 h-[1px] bg-cyber-cyan" />
          <div className="absolute top-0 right-0 w-[1px] h-8 bg-cyber-cyan" />
          <div className="absolute bottom-0 left-0 w-8 h-[1px] bg-cyber-cyan" />
          <div className="absolute bottom-0 left-0 w-[1px] h-8 bg-cyber-cyan" />
          <div className="absolute bottom-0 right-0 w-8 h-[1px] bg-cyber-cyan" />
          <div className="absolute bottom-0 right-0 w-[1px] h-8 bg-cyber-cyan" />

          {/* Glowing purple halo behind */}
          <div className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full bg-nova-purple/10 blur-[120px] pointer-events-none" />

          <div className="text-center">
            <div className="mx-auto inline-flex items-center gap-2 border border-cyber-cyan/30 bg-cyber-cyan/5 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-cyber-cyan mb-6">
              <span className="h-1.5 w-1.5 animate-pulse bg-cyber-cyan rounded-full" />
              <span>Telemetry Transceiver Linked</span>
            </div>
            
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl md:text-5xl">
              LOCK DEEP-SPACE STEWARDSHIP
            </h2>
            
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400">
              Uplink your coordinate stream to securely receive physical flight manifests, automated drift velocity updates, and exoplanet atmospheric survey logs.
            </p>
          </div>

          <form onSubmit={handleTransmit} className="mt-10 max-w-2xl mx-auto relative group">
            <div className="flex flex-col sm:flex-row gap-3 relative z-10 bg-black/60 p-2.5 border border-white/10 group-focus-within:border-cyber-cyan/40 transition-all duration-300">
              <div className="flex-1 flex items-center px-3 gap-3.5">
                <Radio className="text-slate-500 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="TRANSMISSION@COORDINATE.SECURE"
                  required
                  disabled={loading}
                  className="w-full bg-transparent text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none uppercase tracking-[0.1em]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative overflow-hidden bg-cyber-cyan text-black px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-all hover:brightness-110 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 min-min-w-[180px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Uplink Vector</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Status Feedback Ticker */}
          <AnimatePresence mode="wait">
            {feedback.status !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="mt-6 max-w-2xl mx-auto"
              >
                <div className={`flex items-center gap-3.5 p-4 border font-mono text-xs uppercase tracking-[0.1em] ${
                  feedback.status === "success" 
                    ? "bg-signal-green/10 border-signal-green/30 text-signal-green" 
                    : "bg-hazard-red/10 border-hazard-red/30 text-hazard-red"
                }`}>
                  {feedback.status === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Secure Backplane Hardware Specifications */}
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono tracking-widest text-slate-500">
            <span className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-cyber-cyan" />
              SECURE SHA-256 TELEMETRY WRAP
            </span>
            <span className="flex items-center gap-2">
              <Compass className="w-3 h-3 text-nova-purple" />
              ECC ADAPTIVE SYMMETRIC CELLULAR 8.0
            </span>
            <span>LAUNCH CORE STATE: STANDBY</span>
          </div>

        </div>
      </div>
    </section>
  );
}
