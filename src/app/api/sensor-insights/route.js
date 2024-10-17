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
          [sensorName]: `$${sensorName}`, // Hapus $round
        },
      });
    } else {
      aggregationPipeline.push({
        $project: {
          _id: 0,
          date: "$_id",
          RPM: "$RPM",
          IAT: "$IAT",
          CLT: "$CLT",
          AFR: "$AFR",
          MAP: "$MAP",
          TPS: "$TPS",
        },
      });
    }

    const result = await db
      .collection("sensor")
      .aggregate(aggregationPipeline)
      .toArray();

    // Lakukan pembulatan di sini menggunakan JavaScript
    const roundedResult = result.map((entry) => {
      let roundedEntry = { ...entry, date: entry.date };
      if (sensorName) {
        roundedEntry[sensorName] = Math.round(entry[sensorName] * 100) / 100;
      } else {
        roundedEntry.RPM = Math.round(entry.RPM * 100) / 100;
        roundedEntry.IAT = Math.round(entry.IAT * 100) / 100;
        roundedEntry.CLT = Math.round(entry.CLT * 100) / 100;
        roundedEntry.AFR = Math.round(entry.AFR * 100) / 100;
        roundedEntry.MAP = Math.round(entry.MAP * 100) / 100;
        roundedEntry.TPS = Math.round(entry.TPS * 100) / 100;
      }
      return roundedEntry;
    });

    return NextResponse.json(roundedResult);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch sensor insights" },
      { status: 500 }
    );
  }
}
