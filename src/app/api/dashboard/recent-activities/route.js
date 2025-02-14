// app/api/recent-activities/route.js
import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("ICE");

    const activities = await db
      .collection("activities")
      .find({})
      .sort({ date: -1 })
      .limit(4)
      .toArray();

    const formattedActivities = activities.map((activity) => ({
      id: activity._id.toString(),
      activity: activity.activity,
      date: activity.date,
    }));

    // Add Cache-Control headers to disable caching
    const response = NextResponse.json(formattedActivities);
    response.headers.set("Cache-Control", "no-store, max-age=0");

    console.log("Time Result:", formattedActivities); // Add this to debug


    return NextResponse.json(formattedActivities);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch recent activities" },
      { status: 500 }
    );
  }
}
