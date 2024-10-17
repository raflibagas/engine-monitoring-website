import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sensorName = searchParams.get("sensor");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    const client = await clientPromise;
    const db = client.db("ICE");

    let matchStage = {};
    if (startDate && endDate) {
      matchStage = {
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    let aggregationPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          RPM: { $avg: "$RPM" },
          IAT: { $avg: "$IAT" },
          CLT: { $avg: "$CLT" },
          AFR: { $avg: "$AFR" },
          MAP: { $avg: "$MAP" },
          TPS: { $avg: "$TPS" },
        },
      },
      { $sort: { _id: 1 } },
    ];

    if (sensorName) {
      aggregationPipeline.push({
        $project: {
          _id: 0,
          date: "$_id",
          [sensorName]: { $round: [`$${sensorName}`, 2] },
        },
      });
    } else {
      aggregationPipeline.push({
        $project: {
          _id: 0,
          date: "$_id",
          RPM: { $round: ["$RPM", 2] },
          IAT: { $round: ["$IAT", 2] },
          CLT: { $round: ["$CLT", 2] },
          AFR: { $round: ["$AFR", 2] },
          MAP: { $round: ["$MAP", 2] },
          TPS: { $round: ["$TPS", 2] },
        },
      });
    }

    const result = await db
      .collection("sensor")
      .aggregate(aggregationPipeline)
      .toArray();

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch sensor insights" },
      { status: 500 }
    );
  }
}
