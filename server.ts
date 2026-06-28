import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";

// Setup types for database and subscribers
interface SubscriberRecord {
  email: string;
  joinedAt: string;
}

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");

// Define stateful in-memory telemetries that can slide or fluctuate
let telemetryState = {
  solDistance: 4.2441, // LY
  activeFleet: 14,
  fleetInTransfer: 3,
  engineStability: 99.82, // %
  cryoIntegrity: 100.0, // %
  quantumLatency: 8.61, // ms
  radiationLoad: 31.4, // %
  lastUplink: new Date().toISOString(),
  cruisingState: "NOMINAL", // NOMINAL, WARP, HAZARD_WARN, DEEP_DOCK
};

// Initial logs
let missionLogs = [
  { id: "1", timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), type: "SYSTEM", text: "Autonomous Fusion Core VA-09 pre-ignition series: Success." },
  { id: "2", timestamp: new Date(Date.now() - 3600000 * 3.2).toISOString(), type: "TELEMETRY", text: "Quantum Link Latency established at 8.6ms. Jitter: negligible." },
  { id: "3", timestamp: new Date(Date.now() - 3600000 * 2.8).toISOString(), type: "NAVIGATION", text: "Heliopause vectors matched with Voyager path. System cruise engaged." },
  { id: "4", timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(), type: "SECURITY", text: "Adaptive radiation shield localized at 31% load." }
];

// Lazy database setup to avoid breaking the start command if MongoDB is unconfigured
const getMongoDBURI = () => process.env.MONGODB_URI || "";

// Initialize subscriber schema if MONGODB_URI is configure
let SubscriberModel: mongoose.Model<any> | null = null;
const initMongoose = async () => {
  const uri = getMongoDBURI();
  if (!uri) return null;
  
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri, { bufferCommands: false });
      console.log("Telemetry Backplane: Connected to MongoDB successfully.");
    }
    
    // Define Subscriber Schema lazily
    if (!SubscriberModel) {
      const subscriberSchema = new mongoose.Schema({
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        joinedAt: { type: Date, default: Date.now }
      });
      SubscriberModel = mongoose.models.Subscriber || mongoose.model("Subscriber", subscriberSchema);
    }
    return SubscriberModel;
  } catch (err) {
    console.error("Mongoose initialization warning (continuing to local filesystem backup):", err);
    return null;
  }
};

// File-based backup fallback operations
const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const getLocalSubscribers = (): SubscriberRecord[] => {
  ensureDataDir();
  if (!fs.existsSync(SUBSCRIBERS_FILE)) {
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const data = fs.readFileSync(SUBSCRIBERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const saveLocalSubscriber = (email: string): boolean => {
  const current = getLocalSubscribers();
  const lower = email.trim().toLowerCase();
  if (current.some(s => s.email.toLowerCase() === lower)) {
    return false; // Duplicate
  }
  current.push({
    email: lower,
    joinedAt: new Date().toISOString()
  });
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(current, null, 2));
  return true;
};

const deleteLocalSubscriber = (email: string): boolean => {
  const current = getLocalSubscribers();
  const lower = email.trim().toLowerCase();
  const filtered = current.filter(s => s.email.toLowerCase() !== lower);
  if (current.length === filtered.length) return false;
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(filtered, null, 2));
  return true;
};

async function startServer() {
  const app = express();
  app.use(express.json());

  // Setup periodic subtle fluctuations in telemetry data to simulate active cosmic tracking
  setInterval(() => {
    const driftSign = Math.random() > 0.5 ? 1 : -1;
    // Drift distance slightly
    telemetryState.solDistance += 0.000015; 
    // Randomize stability slightly between 99.6% and 99.95%
    telemetryState.engineStability = parseFloat((99.7 + Math.random() * 0.25).toFixed(2));
    // Latency fluctuation with drift
    const latentDrift = (Math.random() - 0.5) * 0.15;
    telemetryState.quantumLatency = parseFloat(Math.max(7.2, Math.min(12.5, telemetryState.quantumLatency + latentDrift)).toFixed(2));
    // Radiation shield load adjusts based on cruising state
    if (telemetryState.cruisingState === "WARP") {
      telemetryState.radiationLoad = parseFloat((42.0 + Math.random() * 5).toFixed(1));
    } else if (telemetryState.cruisingState === "HAZARD_WARN") {
      telemetryState.radiationLoad = parseFloat((68.0 + Math.random() * 12).toFixed(1));
    } else {
      telemetryState.radiationLoad = parseFloat((30.0 + Math.random() * 3).toFixed(1));
    }
    telemetryState.lastUplink = new Date().toISOString();
  }, 3500);

  // --- API ROUTING INTERFACE ---

  // GET ACTIVE SYSTEM STATUS
  app.get("/api/telemetry", (req, res) => {
    res.json(telemetryState);
  });

  // REDIRECT / UDPATE TELEMETRY MODE VIA ADMIN PANEL
  app.post("/api/telemetry/update", (req, res) => {
    const { cruisingState, activeFleet, fleetInTransfer } = req.body;
    
    if (cruisingState && ["NOMINAL", "WARP", "HAZARD_WARN", "DEEP_DOCK"].includes(cruisingState)) {
      telemetryState.cruisingState = cruisingState;
      
      // Inject alert log
      const alertTexts: Record<string, string> = {
        NOMINAL: "Cruise configurations returned to standard. Inertial compensators normal.",
        WARP: "Warp Core field geometry activated. Velocity approaching heliocentric speed limit.",
        HAZARD_WARN: "CRITICAL: Charged cosmic particle storm intercepted. Tactical shields boosted.",
        DEEP_DOCK: "Vessel matrix approaching Deep Space Port Omega. Decelerating engines to inert."
      };
      
      missionLogs.unshift({
        id: Math.random().toString(),
        timestamp: new Date().toISOString(),
        type: cruisingState === "HAZARD_WARN" ? "ALERT" : "SYSTEM",
        text: alertTexts[cruisingState]
      });
    }

    if (activeFleet !== undefined) telemetryState.activeFleet = Number(activeFleet);
    if (fleetInTransfer !== undefined) telemetryState.fleetInTransfer = Number(fleetInTransfer);

    res.json({ success: true, telemetry: telemetryState });
  });

  // FETCH CHRONOLOGICAL COMMAND LOGS
  app.get("/api/mission-logs", (req, res) => {
    res.json(missionLogs);
  });

  // DIRECT INSERTION OF CONSOLE COMMAND FROM CORE DESK
  app.post("/api/mission-logs", (req, res) => {
    const { text, type } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Log instruction required." });
    }
    const newLog = {
      id: Math.random().toString(),
      timestamp: new Date().toISOString(),
      type: type || "INFO",
      text: String(text).trim()
    };
    missionLogs.unshift(newLog);
    
    // limit array to last 50
    if (missionLogs.length > 50) {
      missionLogs = missionLogs.slice(0, 50);
    }
    res.status(201).json(newLog);
  });

  // GET REGISTERED COMMAND RECIPIENTS (SUBSCRIBERS)
  app.get("/api/subscribers", async (req, res) => {
    const db = await initMongoose();
    if (db) {
      try {
        const list = await db.find().sort({ joinedAt: -1 });
        return res.json(list.map((item: any) => ({
          email: item.email,
          joinedAt: item.joinedAt,
          source: "MODERN_MONGO"
        })));
      } catch (err) {
        // fall back on error
      }
    }
    
    // Fallback to local files
    const local = getLocalSubscribers();
    // Sort local newly added first
    const sorted = [...local].sort((a,b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
    res.json(sorted.map(s => ({ ...s, source: "TACTICAL_JSON" })));
  });

  // REGISTER ADDR FOR DEEP TRANSMISSIONS
  app.post("/api/subscribe", async (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Enter a valid transmission address before launch." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({ message: "That transmission address does not look valid." });
    }

    // Attempt Mongo
    const db = await initMongoose();
    if (db) {
      try {
        await db.create({ email: cleanEmail });
        // Add to our running logs
        missionLogs.unshift({
          id: Math.random().toString(),
          timestamp: new Date().toISOString(),
          type: "UPLINK",
          text: `Telemetry subscription linked correctly for: ${cleanEmail} (MDB)`
        });
        return res.json({ message: "Telemetry Link Established. Welcome aboard, Commander." });
      } catch (error: any) {
        if (error.code === 11000) {
          return res.status(409).json({ message: "This coordinate is already registered to our network." });
        }
        // If it failed but database URI is set, return specific details or failover to file
      }
    }

    // Failover silently to JSON database to provide incredible UX reliability
    const ok = saveLocalSubscriber(cleanEmail);
    if (!ok) {
      return res.status(409).json({ message: "This coordinate is already registered to our network." });
    }

    missionLogs.unshift({
      id: Math.random().toString(),
      timestamp: new Date().toISOString(),
      type: "UPLINK",
      text: `Telemetry subscription linked correctly for: ${cleanEmail} (Local Backup)`
    });

    return res.json({ message: "Telemetry Link Established. Welcome aboard, Commander." });
  });

  // DELETE SUBSCRIBER
  app.delete("/api/subscribers/:email", async (req, res) => {
    const targetEmail = req.params.email;
    if (!targetEmail) {
      return res.status(400).json({ error: "No telemetry email specified." });
    }

    // Try Mongo removal
    const db = await initMongoose();
    if (db) {
      try {
        const deleted = await db.findOneAndDelete({ email: targetEmail.toLowerCase().trim() });
        if (deleted) {
          missionLogs.unshift({
            id: Math.random().toString(),
            timestamp: new Date().toISOString(),
            type: "SECURITY",
            text: `Revoked subscription coordinate: ${targetEmail}`
          });
          return res.json({ success: true, removed: targetEmail });
        }
      } catch (err) {}
    }

    // Local JSON removal
    const deleted = deleteLocalSubscriber(targetEmail);
    if (deleted) {
      missionLogs.unshift({
        id: Math.random().toString(),
        timestamp: new Date().toISOString(),
        type: "SECURITY",
        text: `Revoked subscription coordinate from database: ${targetEmail}`
      });
      return res.json({ success: true, removed: targetEmail });
    }

    res.status(404).json({ error: "Telemetry link not found." });
  });

  // --- INTEGRATION OF VITE DOCKING MIDDLEWARE ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite compiler interface mounted correctly in dev mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production assets bound onto static routing engine.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Command Backstage server launched at: http://localhost:${PORT}`);
    console.log(`Port 3000 exposed via AI Studio proxy.`);
  });
}

startServer();
