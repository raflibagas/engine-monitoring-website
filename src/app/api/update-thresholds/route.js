// app/api/update-thresholds/route.js
import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

export async function POST(request) {
  try {
    const { sensor, upperThreshold, lowerThreshold } = await request.json();
    const client = await clientPromise;
    const db = client.db("ICE");

    const result = await db.collection("sensorThresholds").updateOne(
      { sensor: sensor },
      {
        $set: {
          upperThreshold: parseFloat(upperThreshold),
          lowerThreshold: parseFloat(lowerThreshold),
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      message: "Thresholds updated successfully",
      updated: result.modifiedCount > 0,
      inserted: result.upsertedCount > 0,
    });
  } catch (error) {
    console.error("Failed to update thresholds:", error);
    return NextResponse.json(
      { error: "Failed to update thresholds" },
      { status: 500 }
    );
  }
}
