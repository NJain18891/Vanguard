import mongoose from "mongoose";
import { TelemetryState } from "../types";

const MONGODB_URI = process.env.MONGODB_URI || "";

// Maintain a cached connection for serverless performance
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("Telemetry Backplane: Connected to MongoDB Atlas successfully.");
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB connection error:", e);
    return null;
  }

  return cached.conn;
}

// Define Subscriber Schema
const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  joinedAt: { type: Date, default: Date.now }
});

export const SubscriberModel = mongoose.models.Subscriber || mongoose.model("Subscriber", subscriberSchema);

// Define custom Mission Logs Schema so logs can persist in DB across serverless restarts
const missionLogSchema = new mongoose.Schema({
  id: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, required: true },
  text: { type: String, required: true }
});

export const MissionLogModel = mongoose.models.MissionLog || mongoose.model("MissionLog", missionLogSchema);

// Define global states fallback for serverless warm starts
let defaultTelemetry: TelemetryState = {
  solDistance: 4.2441,
  activeFleet: 14,
  fleetInTransfer: 3,
  engineStability: 99.82,
  cryoIntegrity: 100.0,
  quantumLatency: 8.61,
  radiationLoad: 31.4,
  lastUplink: new Date().toISOString(),
  cruisingState: "NOMINAL",
};

let telemetryState: TelemetryState = { ...defaultTelemetry };

// Dynamic telemetry calculator to keep it drifting on Vercel stateless environment!
export function getTelemetryState() {
  const now = Date.now();
  // Anchor to a set date in June 2026 to make drift deterministic
  const anchorTime = 1782630000000; 
  const diffSecs = (now - anchorTime) / 1000;
  
  // Drift distance linearly based on duration
  const driftedDistance = 4.2441 + (diffSecs * 0.000004);
  
  // Oscillate engine stability between 99.65% and 99.95% using sine
  const engineStability = parseFloat((99.8 + Math.sin(diffSecs / 50) * 0.15).toFixed(2));
  
  // Oscillate latency slightly using cosine
  const quantumLatency = parseFloat((8.6 + Math.cos(diffSecs / 100) * 0.8).toFixed(2));
  
  // Oscillate radiation load
  let baseRadiation = 31.4;
  if (telemetryState.cruisingState === "WARP") {
    baseRadiation = 44.5;
  } else if (telemetryState.cruisingState === "HAZARD_WARN") {
    baseRadiation = 72.1;
  }
  const radiationLoad = parseFloat((baseRadiation + Math.sin(diffSecs / 10) * 2.5).toFixed(1));

  return {
    ...telemetryState,
    solDistance: parseFloat(driftedDistance.toFixed(6)),
    engineStability,
    quantumLatency,
    radiationLoad,
    lastUplink: new Date().toISOString()
  };
}

export function updateCruisingState(state: "NOMINAL" | "WARP" | "HAZARD_WARN" | "DEEP_DOCK", activeFleet?: number, fleetInTransfer?: number) {
  telemetryState.cruisingState = state;
  if (activeFleet !== undefined) telemetryState.activeFleet = activeFleet;
  if (fleetInTransfer !== undefined) telemetryState.fleetInTransfer = fleetInTransfer;
  return getTelemetryState();
}
