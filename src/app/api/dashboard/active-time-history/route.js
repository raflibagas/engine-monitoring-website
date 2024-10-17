// app/api/active-time-history/route.js
import { NextResponse } from 'next/server';
import clientPromise from "../../../lib/mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("ICE");

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const activityData = await db.collection("daily_engine_activity")
      .find({ date: { $gte: fiveDaysAgo } })
      .sort({ date: 1 })
      .toArray();

    const formattedData = activityData.map(item => ({
      date: item.date,
      activeTime: item.activeTime
    }));

    return NextResponse.json(formattedData);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Failed to fetch active time history' },
      { status: 500 }
    );
  }
}