import { NextResponse } from "next/server";
import { connectToDatabase, SubscriberModel, MissionLogModel } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params;
    if (!email) {
      return NextResponse.json({ error: "No telemetry email specified." }, { status: 400 });
    }

    const decodedEmail = decodeURIComponent(email).toLowerCase().trim();
    const conn = await connectToDatabase();
    
    if (conn) {
      const deleted = await SubscriberModel.findOneAndDelete({ email: decodedEmail } as any);
      if (deleted) {
        // Create log
        await MissionLogModel.create({
          id: Math.random().toString(),
          timestamp: new Date(),
          type: "SECURITY",
          text: `Revoked subscription coordinate: ${decodedEmail}`
        });

        return NextResponse.json({ success: true, removed: decodedEmail });
      }
    }

    return NextResponse.json({ error: "Telemetry link not found." }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
