// pages/api/recent-alerts.js or app/api/recent-alerts/route.js (depending on your Next.js version)
import { NextResponse } from 'next/server';
import clientPromise from "../../../lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ICE");

    const alerts = await db.collection("alerts")
      .find()
      .sort({ timestamp: -1 })
      .limit(5)  // Fetch the 5 most recent alerts
      .toArray();

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}