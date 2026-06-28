export interface TelemetryState {
  solDistance: number;
  activeFleet: number;
  fleetInTransfer: number;
  engineStability: number;
  cryoIntegrity: number;
  quantumLatency: number;
  radiationLoad: number;
  lastUplink: string;
  cruisingState: "NOMINAL" | "WARP" | "HAZARD_WARN" | "DEEP_DOCK";
}

export interface SpaceDestination {
  name: string;
  system: string;
  image: string;
  atmosphere: string;
  distance: string;
  hazard: "Low" | "Moderate" | "High" | "Severe";
  description: string;
  coordinates: string;
  planetaryClass: string;
}

export interface MissionLog {
  id: string;
  timestamp: string;
  type: string;
  text: string;
}

export interface Subscriber {
  email: string;
  joinedAt: string;
  source: string;
}
