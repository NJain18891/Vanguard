"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TelemetryState } from "../types";
import { 
  Compass, 
  Activity, 
  Zap, 
  ShieldAlert, 
  Cpu, 
  Radar, 
  Clock, 
  Radio, 
  Database,
  Globe,
  Settings,
  Flame,
  Volume2,
  VolumeX,
  RefreshCw
} from "lucide-react";

interface TelemetryDeskProps {
  telemetry: TelemetryState | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function TelemetryDesk({ telemetry: initialTelemetry, loading, onRefresh }: TelemetryDeskProps) {
  const [telemetry, setTelemetry] = useState<TelemetryState | null>(initialTelemetry);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<"VECTORS" | "DIAGNOSTICS">("VECTORS");

  // Local effect to sync props
  useEffect(() => {
    if (initialTelemetry) {
      setTelemetry(initialTelemetry);
    }
  }, [initialTelemetry]);

  // Handle subtle telemetry sound pitch on warning
  useEffect(() => {
    if (!soundEnabled || !telemetry) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      if (telemetry.cruisingState === "WARP") {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
      } else if (telemetry.cruisingState === "HAZARD_WARN") {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
      }
      
      gain.gain.setValueAtTime(0.005, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // Ignored
    }
  }, [telemetry?.cruisingState, telemetry?.solDistance, soundEnabled]);

  // Render radar scanning sweeper
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let angle = 0;
    const targets = [
      { r: 0.35, a: 1.2, size: 3, label: "VA-09" },
      { r: 0.65, a: 3.8, size: 2.5, label: "SOL-RE-12" },
      { r: 0.82, a: 5.1, size: 2, label: "EX-PROX" }
    ];

    const resizeAndDraw = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      const size = Math.min(rect.width, 320);
      
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);

      const draw = () => {
        const cx = size / 2;
        const cy = size / 2;
        const maxR = cx - 15;

        ctx.clearRect(0, 0, size, size);

        // Radar background screen grid
        ctx.beginPath();
        ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(6, 10, 19, 0.75)";
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 242, 254, 0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Concentric rings
        [0.25, 0.5, 0.75, 1.0].forEach((ratio) => {
          ctx.beginPath();
          ctx.arc(cx, cy, maxR * ratio, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(0, 242, 254, 0.06)";
          ctx.stroke();
        });

        // Crosshairs lines
        ctx.beginPath();
        ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy);
        ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR);
        ctx.strokeStyle = "rgba(0, 242, 254, 0.05)";
        ctx.stroke();

        // Static degrees ticks
        for (let d = 0; d < 360; d += 30) {
          const rad = (d * Math.PI) / 180;
          const x1 = cx + (maxR - 5) * Math.cos(rad);
          const y1 = cy + (maxR - 5) * Math.sin(rad);
          const x2 = cx + maxR * Math.cos(rad);
          const y2 = cy + maxR * Math.sin(rad);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = "rgba(0, 242, 254, 0.25)";
          ctx.stroke();
        }

        // Radar scanning light sweeping arc line
        angle += 0.015;
        const sweepGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
        sweepGradient.addColorStop(0, "rgba(0, 242, 254, 0.05)");
        sweepGradient.addColorStop(1, "rgba(0, 242, 254, 0.00)");

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxR, angle - 0.4, angle);
        ctx.lineTo(cx, cy);
        ctx.fillStyle = "rgba(0, 242, 254, 0.08)";
        ctx.fill();

        // Active scan sweep line
        const sx = cx + maxR * Math.cos(angle);
        const sy = cy + maxR * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Plot telemetry target nodes
        targets.forEach((tgt) => {
          const tx = cx + maxR * tgt.r * Math.cos(tgt.a);
          const ty = cy + maxR * tgt.r * Math.sin(tgt.a);

          // Calculate current angular distance to scan line to fade targets
          let targetAngle = tgt.a % (Math.PI * 2);
          let rawSweepAngle = angle % (Math.PI * 2);
          let diff = rawSweepAngle - targetAngle;
          if (diff < 0) diff += Math.PI * 2;
          
          let intensity = 0;
          if (diff < 1.2) {
            intensity = 1.0 - (diff / 1.2);
          } else {
            intensity = 0.15;
          }

          if (telemetry?.cruisingState === "HAZARD_WARN") {
            ctx.beginPath();
            ctx.arc(tx, ty, tgt.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(239, 68, 68, ${intensity * 0.45})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(tx, ty, tgt.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(239, 68, 68, ${intensity})`;
            ctx.fill();
            
            ctx.fillStyle = `rgba(239, 68, 68, ${Math.max(0.3, intensity)})`;
          } else {
            ctx.beginPath();
            ctx.arc(tx, ty, tgt.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 242, 254, ${intensity * 0.35})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(tx, ty, tgt.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 242, 254, ${intensity})`;
            ctx.fill();
            
            ctx.fillStyle = `rgba(0, 242, 254, ${Math.max(0.3, intensity)})`;
          }

          ctx.font = "8px 'JetBrains Mono'";
          ctx.fillText(tgt.label, tx + 6, ty + 2);
        });

        animId = requestAnimationFrame(draw);
      };

      draw();
    };

    resizeAndDraw();
    window.addEventListener("resize", resizeAndDraw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resizeAndDraw);
    };
  }, [telemetry]);

  // Derive cruising state parameters
  const getCruiseInfo = (state: string) => {
    switch (state) {
      case "WARP":
        return {
          title: "WARP DRIVE COMMITTED",
          color: "text-nova-purple border-nova-purple bg-nova-purple/10",
          ring: "border-nova-purple/40",
          glow: "shadow-purple-glow",
          desc: "Alcubierre subspace fields consolidated. Fleet experiencing gravity acceleration stream."
        };
      case "HAZARD_WARN":
        return {
          title: "TACTICAL SHIELDS COMPASS-LOCKED",
          color: "text-hazard-red border-hazard-red bg-hazard-red/10",
          ring: "border-hazard-red/40",
          glow: "shadow-purple-glow bg-amber-500/5",
          desc: "Space-dust debris storm encountered. Inertial impact filters set to maximum adaptive protection."
        };
      case "DEEP_DOCK":
        return {
          title: "DEEP PORT DOCKING SEQUENCE",
          color: "text-hazard-gold border-hazard-gold bg-hazard-gold/10",
          ring: "border-hazard-gold/40",
          glow: "shadow-gold-glow",
          desc: "Aligning with gravity anchors. Thruster valves locked at standby. Fuel cells offloading telemetry."
        };
      default:
        return {
          title: "NOMINAL SYSTEM DEPLOYED",
          color: "text-cyber-cyan border-cyber-cyan bg-cyber-cyan/10",
          ring: "border-cyber-cyan/30",
          glow: "shadow-cyan-glow",
          desc: "System maintaining autonomous fusion. All micro-relays and telemetry grids perfectly matched."
        };
    }
  };

  const cruise = getCruiseInfo(telemetry?.cruisingState || "NOMINAL");

  return (
    <article className="border border-white/5 bg-space/80 backdrop-blur-3xl relative overflow-hidden shadow-2xl p-6 sm:p-8">
      {/* Visual cyber panels backgrounds */}
      <div className="absolute inset-0 cyber-grid-fine opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 p-3 flex gap-2 z-20">
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? "Mute Flight Chimes" : "Enable Flight Chimes"}
          className={`p-2 border transition ${soundEnabled ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10' : 'border-white/10 text-slate-500 hover:text-white'}`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="p-2 border border-white/10 text-slate-400 hover:text-white transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
        
        {/* LEFT COLUMN: ACTIVE STATUS RADAR & ALIGNMENTS */}
        <div className="w-full lg:w-1/3 flex flex-col items-center">
          <div className="w-full flex justify-between items-center border-b border-white/5 pb-3 mb-4">
            <span className="font-mono text-[10px] tracking-[0.22em] text-slate-500 uppercase flex items-center gap-1.5">
              <Radar className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
              FLIGHT VECTOR MAP (AZIMUTH-X)
            </span>
            <span className="font-mono text-[9px] text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 px-1.5 py-0.5 animate-pulse">LOCKED</span>
          </div>

          <div className="relative p-2.5 rounded-full border border-white/10 bg-black/60 shadow-xl">
            <div className="absolute top-2 left-2 font-mono text-[8px] text-slate-600">SCAN: V-9.1</div>
            <canvas ref={radarCanvasRef} />
            <div className="absolute bottom-2 right-2 font-mono text-[8px] text-slate-600">RANGE: 1.5M KM</div>
          </div>

          <div className="w-full mt-4 bg-black/40 border border-white/5 p-3.5 font-mono text-[10px] leading-relaxed">
            <div className="flex justify-between text-slate-500 mb-1">
              <span>SCANNER ACCELERATION:</span>
              <span className="text-white">AUTO-ADAPTIVE</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>ACTIVE TRANSPONDERS:</span>
              <span className="text-cyber-cyan">3 INTEGRATED</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TACTICAL METERS & CORE CRITICAL DATA */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
            <div>
              <span className="font-mono text-[10px] tracking-[0.3em] text-slate-500 uppercase">COCKPIT FLIGHT STREAM</span>
              <h3 className="font-display text-xl font-bold uppercase tracking-tight text-white mt-1">TELEMETRY DECK INSTRUMENTS</h3>
            </div>
            <div className="flex bg-black/60 p-1 border border-white/10 gap-1 text-[9px] font-mono font-bold tracking-widest text-slate-500">
              {(["VECTORS", "DIAGNOSTICS"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-1.5 transition ${activeTab === tab ? "bg-cyber-cyan text-black" : "hover:text-white"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC FLIGHT MODE CARD */}
          <motion.div 
            layout 
            className={`border p-4.5 mb-6 relative overflow-hidden backdrop-blur-xl transition-all duration-300 ${cruise.color} ${cruise.glow}`}
          >
            <div className="absolute top-0 right-0 border-l border-b border-white/10 px-2 py-1 font-mono text-[8px] tracking-wide text-slate-400">
              CRUISE CONTROL SIGNAL
            </div>
            <div className="flex items-center gap-2.5 font-mono text-xs font-bold tracking-widest text-white mb-2">
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span>{cruise.title}</span>
            </div>
            <p className="font-mono text-[11px] leading-5 text-slate-300 max-w-2xl">{cruise.desc}</p>
          </motion.div>

          {/* SENSORS METRIC BENTO-GRID */}
          <AnimatePresence mode="wait">
            {activeTab === "VECTORS" ? (
              <motion.div
                key="vectors-grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {/* Distance Indicator */}
                <div className="bg-black/40 border border-white/5 p-4 relative group">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-cyber-cyan rounded-full animate-pulse" />
                  </div>
                  <span className="font-mono text-[10px] uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyber-cyan" />
                    Distance from Sol Orbit
                  </span>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-mono text-xl font-bold text-white uppercase sm:text-2xl">
                      {telemetry ? `${telemetry.solDistance.toFixed(4)} LY` : "4.2441 LY"}
                    </span>
                    <span className="font-mono text-[9px] text-green-400">+0.003 AU/s</span>
                  </div>
                  <div className="mt-3.5 h-[2px] bg-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 bg-cyber-cyan w-3/4 animate-telemetry-ping" />
                  </div>
                </div>

                {/* Engine Stability Core */}
                <div className="bg-black/40 border border-white/5 p-4 relative">
                  <span className="font-mono text-[10px] uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-nova-purple animate-pulse" />
                    Warp Vector Core Stability
                  </span>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-mono text-xl font-bold text-white sm:text-2xl">
                      {telemetry ? `${telemetry.engineStability}%` : "99.8%"}
                    </span>
                    <span className="font-mono text-[9px] text-amber-300 uppercase">NOMINAL</span>
                  </div>
                  <div className="mt-3.5 h-[2px] bg-white/5 relative overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 bottom-0 bg-nova-purple transition-all duration-500"
                      style={{ width: telemetry ? `${telemetry.engineStability}%` : "99.8%" }}
                    />
                  </div>
                </div>

                {/* Adaptive Shield Load */}
                <div className="bg-black/40 border border-white/5 p-4 relative">
                  <span className="font-mono text-[10px] uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                    Radiation Shield load
                  </span>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-mono text-xl font-bold text-slate-150 sm:text-2xl">
                      {telemetry ? `${telemetry.radiationLoad}%` : "31%"}
                    </span>
                    <span className={`font-mono text-[9px] uppercase ${telemetry && telemetry.radiationLoad > 50 ? 'text-red-400' : 'text-slate-500'}`}>
                      {telemetry && telemetry.radiationLoad > 55 ? 'HIGH STRESS' : 'ADAPTIVE'}
                    </span>
                  </div>
                  <div className="mt-3.5 h-[2px] bg-white/5 relative overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 bottom-0 transition-all duration-500 ${telemetry && telemetry.radiationLoad > 55 ? 'bg-red-500' : 'bg-slate-400'}`}
                      style={{ width: telemetry ? `${telemetry.radiationLoad}%` : "31%" }}
                    />
                  </div>
                </div>

                {/* Q-Link Latency */}
                <div className="bg-black/40 border border-white/5 p-4 relative">
                  <span className="font-mono text-[10px] uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-amber-500" />
                    Quantum Link Jitter
                  </span>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-mono text-xl font-bold text-white sm:text-2xl">
                      {telemetry ? `${telemetry.quantumLatency.toFixed(2)} ms` : "8.6 ms"}
                    </span>
                    <span className="font-mono text-[9px] text-green-400">-12% drift</span>
                  </div>
                  <div className="mt-3.5 h-[2px] bg-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 bg-amber-500 w-[42%] animate-pulse" />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="diagnostics-grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-black/50 border border-white/5 p-5 font-mono text-xs uppercase text-slate-400 space-y-3"
              >
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500">CYRO HABITAT INTEGRITY:</span>
                  <span className="font-bold text-white">{telemetry ? `${telemetry.cryoIntegrity}%` : "100%"} LOCKED</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500">ACTIVE SPACE FLEET VESSEL UNITS:</span>
                  <span className="font-bold text-cyber-cyan">{telemetry?.activeFleet || 14} CORES ACTIVE</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500">FLEET UNITS CURRENTLY IN STELLAR TRANSFER:</span>
                  <span className="font-bold text-white">{telemetry?.fleetInTransfer || 3} TRANSITING</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500">COCKPIT RELAY DEEP-SPACE APU VOLTAGE:</span>
                  <span className="font-bold text-green-400">12,410V STATE-O1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">LAST RECONNECTION PACKET TIMESTAMP:</span>
                  <span className="text-slate-400 font-bold">{telemetry ? new Date(telemetry.lastUplink).toLocaleTimeString() : "READY"}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </article>
  );
}
