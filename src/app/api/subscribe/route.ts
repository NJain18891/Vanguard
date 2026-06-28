import { NextResponse } from "next/server";
import { connectToDatabase, SubscriberModel, MissionLogModel } from "@/lib/db";

// In-memory fallback if Mongo Atlas is not configured
let inMemorySubscribers: Array<{ email: string; joinedAt: string }> = [];

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "Enter a valid transmission address before launch." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(cleanEmail)) {
      return NextResponse.json({ message: "That transmission address does not look valid." }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      try {
        // Look for existing subscriber
        const existing = await SubscriberModel.findOne({ email: cleanEmail } as any);
        if (existing) {
          return NextResponse.json({ message: "This coordinate is already registered to our network." }, { status: 409 });
        }

        await SubscriberModel.create({ email: cleanEmail });
        
        // Add log entry
        await MissionLogModel.create({
          id: Math.random().toString(),
          timestamp: new Date(),
          type: "UPLINK",
          text: `Telemetry subscription linked correctly for: ${cleanEmail} (MongoDB)`
        });

        return NextResponse.json({ message: "Telemetry Link Established. Welcome aboard, Commander." });
      } catch (err: any) {
        if (err.code === 11000) {
          return NextResponse.json({ message: "This coordinate is already registered to our network." }, { status: 409 });
        }
      }
    }

    // Fallback to transient memory if DB is down or unconfigured
    if (inMemorySubscribers.some(s => s.email === cleanEmail)) {
      return NextResponse.json({ message: "This coordinate is already registered to our network." }, { status: 409 });
    }

    inMemorySubscribers.push({
      email: cleanEmail,
      joinedAt: new Date().toISOString()
    });

    return NextResponse.json({ message: "Telemetry Link Established. Welcome aboard, Commander." });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Support getting the subscriber list as well
export async function GET() {
  const conn = await connectToDatabase();
  if (conn) {
    try {
      const subs = await SubscriberModel.find().sort({ joinedAt: -1 });
      return NextResponse.json(subs.map(s => ({
        email: s.email,
        joinedAt: s.joinedAt.toISOString(),
        source: "MODERN_MONGO"
      })));
    } catch (e) {
      console.error("MongoDB subscribers fetch error:", e);
    }
  }

  return NextResponse.json(inMemorySubscribers.map(s => ({
    ...s,
    source: "MEMORY_FALLBACK"
  })));
}
