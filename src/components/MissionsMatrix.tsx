"use client";

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
                    className="w-full py-3 border border-white/5 bg-space/60 hover:bg-cyber-cyan/10 hover:border-cyber-cyan/40 text-slate-300 hover:text-white font-mono text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Expand Coordinates
                  </button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* DETAILED DIALOG MODAL EXPANSION */}
      <AnimatePresence>
        {selectedDestination && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl border border-white/10 bg-space-card/95 p-6 md:p-8 backdrop-blur-2xl shadow-cyan-glow overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedDestination(null)}
                className="absolute top-4 right-4 p-2 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all cursor-pointer"
                aria-label="Close coordinate panel"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                <div className="relative h-64 md:h-full min-h-[220px] border border-white/5 overflow-hidden">
                  <img
                    src={selectedDestination.image}
                    alt={selectedDestination.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-space-card via-transparent to-transparent" />
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="font-mono text-[9px] text-cyber-cyan bg-cyber-cyan/5 border border-cyber-cyan/20 px-2.5 py-1 tracking-widest uppercase">
                      Pathfinder Record Log
                    </span>
                    <h3 className="font-display text-3xl font-bold uppercase tracking-tight text-white mt-3">
                      {selectedDestination.name}
                    </h3>
                    <p className="font-mono text-xs text-slate-500 uppercase mt-1">{selectedDestination.system}</p>
                  </div>

                  <p className="text-sm text-slate-350 leading-relaxed font-sans">
                    {selectedDestination.description}
                  </p>

                  <div className="border-t border-b border-white/5 py-4 space-y-3 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">COORDINATE MAPPING:</span>
                      <span className="text-white font-semibold">{selectedDestination.coordinates}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ATMOSPHERIC PROFILE:</span>
                      <span className="text-slate-300 font-semibold uppercase">{selectedDestination.atmosphere}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">PLANETARY CLASSIFICATION:</span>
                      <span className="text-slate-300 font-semibold uppercase">{selectedDestination.planetaryClass}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">DISTANCE TO BASE STATION:</span>
                      <span className="text-white font-semibold uppercase">{selectedDestination.distance}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500">HAZARD INDEX STATUS:</span>
                      <span className={`px-2 py-0.5 border text-[10px] font-bold ${hazardColors(selectedDestination.hazard)}`}>
                        {selectedDestination.hazard}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedDestination(null)}
                    className="w-full py-3.5 bg-cyber-cyan text-black font-mono text-xs font-bold uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    Close Log View
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
