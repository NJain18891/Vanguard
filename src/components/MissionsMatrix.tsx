import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SpaceDestination } from "../types";
import { destinations } from "../data";
import { Compass, Globe, Shield, Terminal, MessageSquare, AlertTriangle, Eye, ArrowRight, X } from "lucide-react";

export default function MissionsMatrix() {
  const [filter, setFilter] = useState<string>("All");
  const [selectedDestination, setSelectedDestination] = useState<SpaceDestination | null>(null);

  const filteredDestinations = useMemo(() => {
    if (filter === "All") return destinations;
    return destinations.filter((dest) => dest.hazard === filter);
  }, [filter]);

  const hazardColors = (hazard: string) => {
    switch (hazard) {
      case "Low":
        return "text-signal-green border-signal-green/20 bg-signal-green/5";
      case "Moderate":
        return "text-cyber-cyan border-cyber-cyan/20 bg-cyber-cyan/5";
      case "High":
        return "text-hazard-gold border-hazard-gold/20 bg-hazard-gold/5";
      case "Severe":
        return "text-hazard-red border-hazard-red/20 bg-hazard-red/5";
      default:
        return "text-slate-400 border-white/10 bg-white/5";
    }
  };

  return (
    <section id="missions" className="relative space-y-12 bg-black py-28 px-5 sm:px-8 overflow-hidden">
      {/* Background Star elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(127,0,255,0.08),transparent_40%)]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Dynamic header with asymmetry and rhythm */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-8">
          <div className="space-y-4 max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-[0.32em] text-cyber-cyan block">Celestials Interface</span>
            <h2 className="font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl lg:text-6xl">
              SYSTEM MATRIX MAPS
            </h2>
            <p className="text-sm text-slate-400 leading-7">
              Browse through orbital targets mapped by the Vanguard Astro Pathfinder fleet. Select specific nodes to decode full tactical terrain details, planetary alignment classes, and stellar hazard indicators.
            </p>
          </div>

          {/* Symmetrical / Elegant Hazard Selector tabs */}
          <div className="flex flex-wrap gap-2 bg-space/65 p-1.5 border border-white/5">
            {["All", "Low", "Moderate", "High", "Severe"].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`relative px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-all ${
                  filter === level
                    ? "bg-cyber-cyan text-black font-bold shadow-cyan-glow"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {filter === level && (
                  <motion.span 
                    layoutId="matrix-filter-pill"
                    className="absolute inset-0 bg-cyber-cyan -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Asymmetrical and varied layout grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <AnimatePresence mode="popLayout">
            {filteredDestinations.map((dest, idx) => (
              <motion.article
                key={dest.name}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1], delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
                className="group relative border border-white/5 bg-space-card/40 backdrop-blur-2xl overflow-hidden hover:border-cyber-cyan/30 hover:shadow-cyan-glow transition-all duration-300"
              >
                {/* Thin top cyan wireframe highlight on card hover */}
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan to-transparent translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-300" />

                {/* Glass photo wrapper with slide animation */}
                <div className="relative h-52 overflow-hidden bg-black">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                  />
                  {/* Vector scanline overlays inside photo */}
                  <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-void/80 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-space/90 to-transparent pointer-events-none" />

                  {/* Corner brackets simulating spacecraft HUD targeting */}
                  <div className="absolute top-3 left-3 w-3 h-[1px] bg-white/20" />
                  <div className="absolute top-3 left-3 w-[1px] h-3 bg-white/20" />
                  <div className="absolute bottom-3 right-3 w-3 h-[1px] bg-white/20" />
                  <div className="absolute bottom-3 right-3 w-[1px] h-3 bg-white/20" />

                  {/* Top-right System identifier tag */}
                  <div className="absolute top-3 right-3 bg-black/70 border border-white/10 px-2 py-1 font-mono text-[8px] tracking-[0.16em] text-cyan backdrop-blur-md uppercase">
                    {dest.system}
                  </div>
                </div>

                {/* Planetary parameters card description */}
                <div className="p-5.5 space-y-4">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-display text-xl font-bold uppercase tracking-tight text-white group-hover:text-cyber-cyan transition-colors">
                      {dest.name}
                    </h3>
                    <span className="font-mono text-[9px] text-slate-500 uppercase">{dest.planetaryClass}</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-5 line-clamp-2">{dest.description}</p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    <div className="space-y-1">
                      <span className="font-mono text-[8px] text-slate-500 uppercase block">Distance Sol</span>
                      <span className="font-mono text-[10px] text-white font-semibold">{dest.distance}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="font-mono text-[8px] text-slate-500 uppercase block">Hazard Index</span>
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 border inline-block ${hazardColors(dest.hazard)}`}>
                        {dest.hazard}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedDestination(dest)}
                    className="w-full mt-4 bg-white/[0.03] border border-white/10 group-hover:border-cyber-cyan/35 p-3 font-mono text-[9px] uppercase tracking-[0.2em] hover:bg-cyber-cyan/5 transition-all duration-200 text-slate-300 hover:text-cyber-cyan flex items-center justify-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Decode Telemetry Logs
                  </button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* IMMERSIVE ADVANCED TELEMETRY MODAL DRAWER */}
      <AnimatePresence>
        {selectedDestination && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-0 sm:p-4 bg-black/75 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDestination(null)}
              className="absolute inset-0"
            />

            <motion.article
              initial={{ transform: "translateX(100%)" }}
              animate={{ transform: "translateX(0%)" }}
              exit={{ transform: "translateX(100%)" }}
              transition={{ type: "spring", damping: 30, stiffness: 220 }}
              className="relative w-full max-w-lg h-full sm:h-[90vh] bg-space-card/95 border-l border-white/10 sm:border border-white/10 shadow-2xl overflow-y-auto flex flex-col p-6 sm:p-8"
            >
              {/* Corner Cockpit Highlights */}
              <div className="absolute top-0 left-0 w-6 h-[1px] bg-cyber-cyan" />
              <div className="absolute top-0 left-0 w-[1px] h-6 bg-cyber-cyan" />
              <div className="absolute bottom-0 right-0 w-6 h-[1px] bg-cyber-cyan" />
              <div className="absolute bottom-0 right-0 w-[1px] h-6 bg-cyber-cyan" />

              {/* Header drawer controls */}
              <div className="flex justify-between items-center pb-4 border-b border-white/8 mb-6">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyber-cyan animate-spin-slow" />
                  <span className="font-mono text-[10px] tracking-[0.24em] text-slate-400 uppercase">CELESTIAL MAP LAYER</span>
                </div>
                <button
                  onClick={() => setSelectedDestination(null)}
                  className="p-1 border border-white/10 text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Render Image */}
              <div className="relative h-64 overflow-hidden border border-white/5 bg-black">
                <img
                  src={selectedDestination.image}
                  alt={selectedDestination.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-space-card via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="font-mono text-[8px] text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 px-2 py-0.5 uppercase tracking-wider block w-max mb-1.5">
                    {selectedDestination.planetaryClass}
                  </span>
                  <h3 className="font-display text-2xl font-extrabold uppercase text-white tracking-widest leading-none">
                    {selectedDestination.name}
                  </h3>
                </div>
              </div>

              {/* Data specifications */}
              <div className="mt-6 space-y-6 flex-1">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500 block mb-2">GEOPHYSICAL MATRIX OVERVIEW</span>
                  <p className="text-xs text-slate-300 leading-6">{selectedDestination.description}</p>
                </div>

                <div className="bg-black/40 border border-white/5 p-4 space-y-3.5 font-mono text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-500">MAPPED SYSTEM ARC:</span>
                    <span className="text-white font-bold">{selectedDestination.system}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-500">RADIAL DISTANCE RANGE:</span>
                    <span className="text-cyber-cyan font-bold">{selectedDestination.distance}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-500">HOLOGRAPHIC COORD PLOTS:</span>
                    <span className="text-slate-300 font-bold text-[10px]">{selectedDestination.coordinates}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-500">ATMOSPHERIC REACTION DECK:</span>
                    <span className="text-slate-200 font-bold">{selectedDestination.atmosphere}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">TACTICAL HARVEST HAZARDS:</span>
                    <span className={`font-bold px-2 py-0.5 border ${hazardColors(selectedDestination.hazard)}`}>
                      {selectedDestination.hazard}
                    </span>
                  </div>
                </div>

                <div className="border border-white/5 bg-slate-500/5 p-4 relative">
                  <span className="font-mono text-[9px] text-hazard-gold tracking-widest uppercase block mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    AUTONMEOUS LANDING INSTRUCTION
                  </span>
                  <p className="font-mono text-[9px] text-slate-400 leading-relaxed uppercase">
                    FLIGHT DECK SYSTEM WARNINGS MUST BE SECURELY OVERRULED MANUALLY IN ADMIN DECK BEFORE PLOTTING AN ENTRY TRAJECTORY TOWARDS {selectedDestination.name}. ALL SHIELDS AT MAXIMUM.
                  </p>
                </div>
              </div>

              {/* Bottom footer button */}
              <div className="pt-6 border-t border-white/8 mt-6">
                <button
                  onClick={() => setSelectedDestination(null)}
                  className="w-full py-3.5 bg-cyber-cyan text-black text-xs font-bold uppercase tracking-[0.25em] transition hover:brightness-110 active:scale-98 flex items-center justify-center gap-2"
                >
                  <span>Lock Ship Vector</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.article>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
