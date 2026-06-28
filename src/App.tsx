import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TelemetryState, MissionLog } from "./types";
import { destinations } from "./data";

// Custom modular component imports
import TelemetryDesk from "./components/TelemetryDesk";
import ConsoleLogs from "./components/ConsoleLogs";
import MissionsMatrix from "./components/MissionsMatrix";
import AdminMissionControl from "./components/AdminMissionControl";
import MissionTransmissions from "./components/MissionTransmissions";

// Icon layout imports
import { 
  Compass, 
  Terminal, 
  ShieldAlert, 
  Cpu, 
  Radio, 
  Database,
  Globe,
  Flame,
  Wrench,
  Activity,
  UserCheck,
  Zap,
  ChevronRight,
  MonitorCheck,
  ChevronUp,
  Menu,
  X
} from "lucide-react";

// Slide options with high-res spacer asset photography
const heroSlides = [
  {
    kicker: "Mission VA-09 / Deep Transit Corridor",
    title: "TRAVERSING THE VOID",
    body: "Vanguard Astro opens commercial corridors beyond the heliopause with autogenous fusion propulsion and automated planetary slingshot telemetry.",
    image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2400&q=85"
  },
  {
    kicker: "Fleet Status / Subspace Combustion",
    title: "ENGINEERED FOR STARS",
    body: "Every vessel is a reinforced titanium aerospace frame, engineered for long-duration deep voids, dense gas atmospheres, and close thermal telemetry.",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=2400&q=85"
  },
  {
    kicker: "Colony Vector / Exoplanet Slingshot",
    title: "BEYOND EARTHLINE",
    body: "From Saturn logistics nets to Proxima Survey windows, our navigation matrix turns impossible stellar coordinates into routine launches.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2400&q=85"
  }
];

export default function App() {
  const [slide, setSlide] = useState(0);
  const [activeDeckTab, setActiveDeckTab] = useState<"VISION" | "DECK" | "MATRIX" | "ADMIN">("DECK");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // High fidelity synchronization states with server backplane
  const [telemetry, setTelemetry] = useState<TelemetryState | null>(null);
  const [logs, setLogs] = useState<MissionLog[]>([]);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Monitor scroll height to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Synchronize telemetry records from backend API
  const syncTelemetry = useCallback(async () => {
    setLoadingTelemetry(true);
    try {
      const resp = await fetch("/api/telemetry");
      if (resp.ok) {
        const data = await resp.json();
        setTelemetry(data);
      }
    } catch (e) {
      console.warn("Backplane telemetry query warning. Initializing fallback simulated loop.", e);
    } finally {
      setLoadingTelemetry(false);
    }
  }, []);

  // Synchronize real-time command reports console feed
  const syncLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const resp = await fetch("/api/mission-logs");
      if (resp.ok) {
        const data = await resp.json();
        setLogs(data);
      }
    } catch (e) {
      console.warn("Could not synchronize historical logs.", e);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  // Periodic polling hooks ensuring high frequency dashboard data stream
  useEffect(() => {
    syncTelemetry();
    syncLogs();

    const telemetryTimer = setInterval(syncTelemetry, 5000);
    const logsTimer = setInterval(syncLogs, 6000);

    return () => {
      clearInterval(telemetryTimer);
      clearInterval(logsTimer);
    };
  }, [syncTelemetry, syncLogs]);

  // Rotates hero slides on schedule
  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((current) => (current + 1) % heroSlides.length);
    }, 8500);
    return () => clearInterval(timer);
  }, []);

  // Quick action: triggers warp core change to alert view and switches to Admin to verify
  const handleTriggerDemoWarp = () => {
    setActiveDeckTab("ADMIN");
    // Standard prompt scrolling
    const element = document.getElementById("instruments-panel");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-void text-slate-100 font-sans tracking-tight leading-relaxed overflow-x-hidden scanlines">
      
      {/* GLOBAL COCKPIT WARNING ALERTS HUD BAND */}
      <AnimatePresence>
        {telemetry?.cruisingState === "HAZARD_WARN" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-hazard-red text-black relative z-50 text-[10px] font-mono font-black uppercase text-center py-2 relative flex items-center justify-center gap-2 tracking-[0.2em]"
          >
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>ALERT STATE: INTERCEPTING COSMIC DEBRIS EMISSION CLOUD. ENGINES SECURED FOR COLLISION RESPONSE.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIXED GLASSMOPRHIC INSTRUMENTATION HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-black/60 backdrop-blur-3xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          
          {/* Logo element with dynamic status node */}
          <a href="#home" className="flex items-center gap-3.5 group" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="relative h-9 w-9 grid place-items-center border border-cyber-cyan/35 bg-cyber-cyan/5 p-1 transition group-hover:border-cyber-cyan/80">
              <span className="h-2 w-2 rotate-45 border border-white bg-cyber-cyan group-hover:scale-115 transition-transform" />
              {/* Spinning subtle outer compass */}
              <span className="absolute inset-0.5 border border-dashed border-cyber-cyan/15 rounded-full animate-spin-slow pointer-events-none" />
            </span>
            <div className="flex flex-col">
              <span className="font-display text-xs font-bold uppercase tracking-[0.3em] text-white">
                Vanguard Astro
              </span>
              <span className="font-mono text-[8px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <span className={`w-1 h-1 rounded-full ${telemetry ? 'bg-signal-green' : 'bg-hazard-gold'} animate-ping`} />
                SYSTEM VECTOR: ACTIVE
              </span>
            </div>
          </a>

          {/* Core UI Section Tab controls */}
          <div className="hidden items-center gap-8 text-[11px] font-mono uppercase tracking-[0.25em] md:flex">
            <a 
              href="#vision" 
              className={`transition-all ${activeDeckTab === "VISION" ? "text-hazard-gold font-bold" : "text-slate-400 hover:text-hazard-gold"}`}
              onClick={() => setActiveDeckTab("VISION")}
            >
              Vision
            </a>
            <a 
              href="#instruments-panel" 
              className={`transition-all ${activeDeckTab === "DECK" ? "text-cyber-cyan font-bold" : "text-slate-400 hover:text-cyber-cyan"}`}
              onClick={() => setActiveDeckTab("DECK")}
            >
              Telemetry Deck
            </a>
            <a 
              href="#instruments-panel" 
              className={`transition-all ${activeDeckTab === "MATRIX" ? "text-signal-green font-bold" : "text-slate-400 hover:text-signal-green"}`}
              onClick={() => setActiveDeckTab("MATRIX")}
            >
              Destinations
            </a>
            <a 
              href="#instruments-panel" 
              className={`transition-all ${activeDeckTab === "ADMIN" ? "text-nova-purple font-bold animate-pulse" : "text-slate-400 hover:text-nova-purple"}`}
              onClick={() => setActiveDeckTab("ADMIN")}
            >
              Admin Bridge
            </a>
          </div>

          {/* Quick HUD command state widget */}
          <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-2 border border-white/5 bg-space-light/50 px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider text-slate-400">
              <Cpu className="w-3 h-3 text-slate-500" />
              <span>CORES: {telemetry?.activeFleet ?? 14}</span>
            </div>
            
            <a
              href="#instruments-panel"
              className="px-4 py-2 bg-transparent hover:bg-cyber-cyan/5 border border-cyber-cyan/40 text-cyber-cyan font-mono text-[10px] font-bold uppercase tracking-widest transition-all duration-300 hidden sm:inline-block"
              onClick={() => setActiveDeckTab("DECK")}
            >
              Launcher Engine
            </a>

            {/* Mobile menu Systems Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 border border-white/10 hover:border-cyber-cyan/40 text-slate-400 hover:text-white transition-all md:hidden cursor-pointer"
              aria-label="Toggle Systems Controls Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 text-cyber-cyan" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>

        </nav>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-3xl overflow-hidden"
            >
              <div className="flex flex-col px-5 py-6 gap-5 font-mono text-xs uppercase tracking-[0.2em]">
                <a 
                  href="#vision" 
                  className={`py-2 border-b border-white/5 transition-all ${activeDeckTab === "VISION" ? "text-hazard-gold font-bold pl-2 border-l border-hazard-gold" : "text-slate-400 hover:text-hazard-gold"}`}
                  onClick={() => {
                    setActiveDeckTab("VISION");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Vision
                </a>
                <a 
                  href="#instruments-panel" 
                  className={`py-2 border-b border-white/5 transition-all ${activeDeckTab === "DECK" ? "text-cyber-cyan font-bold pl-2 border-l border-cyber-cyan" : "text-slate-400 hover:text-cyber-cyan"}`}
                  onClick={() => {
                    setActiveDeckTab("DECK");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Telemetry Deck
                </a>
                <a 
                  href="#instruments-panel" 
                  className={`py-2 border-b border-white/5 transition-all ${activeDeckTab === "MATRIX" ? "text-signal-green font-bold pl-2 border-l border-signal-green" : "text-slate-400 hover:text-signal-green"}`}
                  onClick={() => {
                    setActiveDeckTab("MATRIX");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Destinations
                </a>
                <a 
                  href="#instruments-panel" 
                  className={`py-2 border-b border-white/5 transition-all ${activeDeckTab === "ADMIN" ? "text-nova-purple font-bold pl-2 border-l border-nova-purple" : "text-slate-400 hover:text-nova-purple"}`}
                  onClick={() => {
                    setActiveDeckTab("ADMIN");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Admin Bridge
                </a>

                {/* Mobile exclusive dashboard speed stats */}
                <div className="mt-4 p-4 border border-white/5 bg-space/60 space-y-2.5 text-[10px] text-slate-500">
                  <div className="flex justify-between">
                    <span>ACTIVE CORES:</span>
                    <span className="text-white font-bold">{telemetry?.activeFleet ?? 14}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PROPULSION STATE:</span>
                    <span className="text-cyber-cyan font-bold uppercase">{telemetry?.cruisingState ?? "NOMINAL"}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* IMPACTFUL CINEMATIC STRAW HOVER SLIDER HERO */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-void">
        
        {/* Animated background stars mesh */}
        <div className="absolute inset-0 cyber-grid opacity-35 z-0 pointer-events-none" />
        
        {/* Parallax photo stream behind translucent gradient void */}
        <AnimatePresence mode="wait">
          <motion.div
            key={heroSlides[slide].image}
            className="absolute inset-0 w-full h-full z-0 opacity-45"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.45, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.25, ease: "easeInOut" }}
          >
            <img
              src={heroSlides[slide].image}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Dense Cinematic Gradient masks simulating deep space backdrop */}
        <div className="absolute inset-0 bg-gradient-to-r from-void via-void/85 to-transparent z-1 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-void to-transparent z-1 pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-[radial-gradient(circle_at_70%_30%,rgba(0,242,254,0.12),transparent_45%)] z-1 pointer-events-none" />

        {/* Content body layout with asymmetric grid alignment */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 pt-32 pb-24 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main flight introduction text */}
          <div className="lg:col-span-8 space-y-7">
            
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-9 bg-cyber-cyan inline-block" />
              <motion.span
                key={heroSlides[slide].kicker}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="font-mono text-xs uppercase text-cyber-cyan tracking-[0.35em]"
              >
                {heroSlides[slide].kicker}
              </motion.span>
            </div>

            <motion.h1 
              key={heroSlides[slide].title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="font-display text-5xl font-extrabold uppercase tracking-tight text-white sm:text-7xl lg:text-8xl leading-none"
            >
              {heroSlides[slide].title}
            </motion.h1>

            <motion.p
              key={heroSlides[slide].body}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="max-w-2xl text-slate-300 text-base leading-8 sm:text-lg text-slate-450"
            >
              {heroSlides[slide].body}
            </motion.p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href="#instruments-panel"
                onClick={() => setActiveDeckTab("DECK")}
                className="px-7 py-4 bg-cyber-cyan hover:brightness-110 text-black text-xs font-bold uppercase tracking-[0.25em] transition-all duration-300 text-center shadow-cyan-glow flex items-center justify-center gap-1.5"
              >
                <span>Initialize Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </a>

              <button
                onClick={handleTriggerDemoWarp}
                className="px-7 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs font-bold uppercase tracking-[0.25em] transition-all duration-300 text-center backdrop-blur-md flex items-center justify-center gap-1.5"
              >
                <span>Propulsion Engine Controls</span>
                <Zap className="text-nova-purple w-4 h-4 animate-pulse" />
              </button>
            </div>

          </div>

          {/* Right cockpit metadata widget (Asymmetric layouts) */}
          <div className="hidden lg:col-span-4 lg:flex flex-col gap-6">
            <div className="border border-white/5 bg-black/65 backdrop-blur-md p-5 font-mono text-[10px] space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-2 text-slate-500">
                <span>SYSTEM ORIGIN</span>
                <span className="text-white">SOL-DECK-Z8</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2 text-slate-500">
                <span>ORBIT VELOCITY</span>
                <span className="text-cyber-cyan font-bold">29,410 KM/S</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2 text-slate-500">
                <span>PROPULSION STATUS</span>
                <span className={`font-bold ${telemetry?.cruisingState === 'WARP' ? 'text-nova-purple' : 'text-slate-300'}`}>{telemetry?.cruisingState || "NOMINAL"}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>COGNITIVE CORE</span>
                <span className="text-white">VERIFIED AI LEVEL-0</span>
              </div>
            </div>

            {/* Simulated hardware warning card */}
            <div className="border border-white/5 bg-gradient-to-r from-space-card/70 to-space-card/20 p-5 font-mono text-[9px] uppercase tracking-widest text-slate-500 relative overflow-hidden">
              <span className="text-white font-bold block mb-1">ALCUBIERRE FUSION ADVICE:</span>
              COURSES ARE CONSTANTLY VERIFIED BY SUB-LIGHT RELAYS. HARVESTING OUTBOUND FLIGHT WINDOWS IS CLASSIFIED AS SECURE FOR DECK COMMANDERS.
              <div className="absolute bottom-[-15px] right-[-15px] p-4 text-[40px] text-white/5 pointer-events-none font-bold">VA-09</div>
            </div>
          </div>

        </div>

        {/* Dynamic bottom scrolling marquee tape */}
        <div className="absolute bottom-0 inset-x-0 border-t border-b border-white/5 bg-black/45 py-3">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 flex justify-between items-center font-mono text-[9px] uppercase tracking-[0.22em] text-slate-600">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyber-cyan animate-pulse" />
              HELIOPAUSE CORE COMM VECTOR: SECURE
            </span>
            <span className="hidden sm:inline">WARP FIELD FREQUENCY: 284.72 GHZ // LOCK STATUS NOMINAL</span>
            <span>SYSTEM YEAR: 2026 // FLIGHT SENSORS READY</span>
          </div>
        </div>

      </section>

      {/* COMPACT INTUITIVE COMPANY BRANDING VISION */}
      <section id="vision" className="relative bg-space py-28 px-5 sm:px-8 border-t border-white/5 overflow-hidden">
        {/* Glowing atmospheric circles */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_30%,rgba(0,242,254,0.06),transparent_35%)] pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 relative">
            <div className="border border-white/5 bg-black/45 p-6 backdrop-blur-3xl relative overflow-hidden shadow-2xl min-h-[380px] flex flex-col justify-between">
              {/* Complex blueprint styling overlay */}
              <div className="absolute inset-0 cyber-grid opacity-25" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-cyber-cyan/15 rounded-full animate-pulse z-0" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 border border-dashed border-nova-purple/20 rounded-full animate-tick-slow z-0" />

              <div className="relative z-10 flex justify-between font-mono text-[9px] text-cyber-cyan tracking-[0.2em] font-bold">
                <span>VANGUARD COGNITIVE COMPASS</span>
                <span>SYSTEM: COMP-LOCK_97</span>
              </div>

              <div className="relative z-10 grid grid-cols-3 gap-2.5 font-mono text-[9px] text-slate-500 uppercase text-center mt-48">
                <div className="border border-white/5 bg-void/80 p-3">
                  <span className="text-white font-bold block mb-1">ARC-B2</span>
                  Slingshot Core
                </div>
                <div className="border border-white/5 bg-void/80 p-3">
                  <span className="text-cyber-cyan font-bold block mb-1">APU-88</span>
                  Symmetric Relay
                </div>
                <div className="border border-white/5 bg-void/80 p-3">
                  <span className="text-nova-purple font-bold block mb-1">LOCK-O</span>
                  Flares Defense
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <span className="font-mono text-xs uppercase tracking-[0.32em] text-cyber-cyan">Company Philosophy</span>
            <h2 className="font-display text-4xl font-extrabold uppercase leading-tight text-white sm:text-5xl">
              INTERSTELLAR MOBILITY FOR FIRST GENERATION CITIZENS.
            </h2>
            <p className="text-slate-400 text-sm leading-8">
              Vanguard Astro engineers robust Alcubierre gravity propulsion loops, deep-space transponder grids, and artificial flight cores capable of guiding crews across hostile and unpredictable gas giants and exoplanets.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {[
                { val: "2.8 AU/h", sub: "Deep space speed" },
                { val: "42 CORES", sub: "Survey stations" },
                { val: "0.002%", sub: "Traversed Drift Jitter" }
              ].map((spec) => (
                <div key={spec.sub} className="bg-black/45 border border-white/5 p-4.5">
                  <div className="font-display text-lg font-bold text-cyber-cyan">{spec.val}</div>
                  <div className="font-mono text-[9px] uppercase text-slate-500 tracking-wider mt-1">{spec.sub}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* MULTI DECK SENSORS & COMMAND CENTRAL CONTROLS TABS */}
      <section id="instruments-panel" className="relative py-28 px-5 sm:px-8 bg-void border-t border-white/5 leading-relaxed">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(127,0,255,0.05),transparent_48%)] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl space-y-8">
          
          {/* Deck tab controls with high rhythmic alignment */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-white/5 pb-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-cyber-cyan block">Command Interface</span>
              <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-white mt-2">
                MISSION INSTRUMENTS CENTER
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:flex bg-space p-1 border border-white/5 gap-1 text-[11px] font-mono tracking-widest leading-none w-full sm:w-auto">
              {[
                { id: "DECK", label: "TACTICAL FEED DECK" },
                { id: "MATRIX", label: "DESTINATIONS ATLAS" },
                { id: "ADMIN", label: "ADMIN BRIDCE MODULE" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDeckTab(tab.id as any)}
                  className={`px-4 py-3 border transition-all uppercase text-center w-full sm:w-auto ${
                    activeDeckTab === tab.id 
                      ? "bg-white text-black font-bold border-white" 
                      : "text-slate-500 border-transparent hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive display render area */}
          <div className="relative mt-8 min-h-[450px]">
            <AnimatePresence mode="wait">
              {activeDeckTab === "DECK" && (
                <motion.div
                  key="deck-suite"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45 }}
                  className="space-y-8 animate-fade-in"
                >
                  {/* Dynamic cockpit telemetry desk sensors */}
                  <TelemetryDesk 
                    telemetry={telemetry} 
                    loading={loadingTelemetry} 
                    onRefresh={syncTelemetry} 
                  />

                  {/* Systems Logs database report stream */}
                  <ConsoleLogs 
                    logs={logs} 
                    loading={loadingLogs} 
                    onRefresh={syncLogs} 
                  />
                </motion.div>
              )}

              {activeDeckTab === "MATRIX" && (
                <motion.div
                  key="matrix-suite"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45 }}
                >
                  <MissionsMatrix />
                </motion.div>
              )}

              {activeDeckTab === "ADMIN" && (
                <motion.div
                  key="admin-suite"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45 }}
                >
                  <AdminMissionControl 
                    telemetry={telemetry} 
                    onTelemetryUpdate={(updated) => setTelemetry(updated)} 
                    logs={logs} 
                    onRefreshLogs={syncLogs} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* IMMERSIVE PHYSICAL COMPONENT TRANSMISSION UPLINK CARD */}
      <MissionTransmissions onSubscriptionSuccess={syncLogs} />

      {/* GLOBAL SCROLL TO TOP ARROW COMPONENT */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            id="scroll-to-top"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 h-10 w-10 bg-black/80 hover:bg-cyber-cyan/15 border border-cyber-cyan/30 text-cyber-cyan flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(0,242,254,0.15)] hover:shadow-[0_0_25px_rgba(0,242,254,0.35)] hover:border-cyber-cyan cursor-pointer"
            title="Back to Flight Deck"
          >
            <ChevronUp className="w-5 h-5 font-bold" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* SECURE COMMANDER RECON COCKPIT WRAPS IN OUTLINE BOX */}
      <footer className="border-t border-white/5 bg-void py-16 px-5 sm:px-8 relative overflow-hidden text-[11px] font-mono select-none tracking-widest text-slate-600">
        <div className="absolute inset-0 bg-gradient-to-t from-space/20 to-transparent pointer-events-none" />
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-xs text-white uppercase tracking-widest">Vanguard Astro</span>
            <span className="text-slate-500 font-normal">| DEEP-SPACE TELEMETRY DECK v9.8.1-RELEASE</span>
          </div>

          <div className="flex flex-wrap gap-6 text-center sm:text-right uppercase">
            <span>COURSES PLOT SECURED</span>
            <span>SYSTEM ENCRYPTION SHA-256</span>
            <span>TIME CONTEXT: UTC 2026</span>
          </div>
        </div>
      </footer>

    </main>
  );
}
