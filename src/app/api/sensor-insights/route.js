import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sensorName = decodeURIComponent(searchParams.get("sensor"));
  console.log("Received sensor name:", sensorName);
  
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const timeRange = searchParams.get("timeRange"); // Add this to get the time range

  const sensorFieldMap = {
    "Revolution Per Minutes": "RPM",
    "Intake Air Temperature": "IAT",
    "Coolant Temperature": "CLT",
    "Air-Fuel Ratio": "AFR",
    "Manifold Absolute Pressure": "MAP",
    "Throttle Position Sensor": "TPS",
  };

  try {
    const client = await clientPromise;
    const db = client.db("ICE");

    let matchStage = {};
    let dateFormat = "%Y-%m-%d"; // Default format

    // Determine date format based on time range
    if (startDate && endDate) {
      // Create dates and adjust for WIB
      let start = new Date(startDate);
      let end = new Date(endDate);

      // Adjust start and end dates to WIB (UTC+7)
      start.setHours(start.getHours() + 7);
      end.setHours(end.getHours() + 7);

      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      if (timeRange === "24h") {
        dateFormat = "%Y-%m-%d %H:00:00"; // Group by hour
      } else if (timeRange === "90d") {
        dateFormat = "%Y-%m-%d"; // Group by week
      } else if (timeRange === "ytd") {
        dateFormat = "%Y-%m"; // Group by month
      }
      matchStage = {
        timestamp: {
          $gte: start,
          $lte: end,
        },
      };
    }

    let aggregationPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$timestamp" } },
          [sensorName]: { $avg: `$${sensorFieldMap[sensorName]}` },
        },
      },
      { $sort: { _id: 1 } },
    ];

    if (sensorName) {
      aggregationPipeline.push({
        $project: {
          _id: 0,
          date: "$_id",
          [sensorName]: 1,
        },
      });
    } else {
      aggregationPipeline.push({
        $project: {
          _id: 0,
          date: "$_id",
          "Revolution Per Minutes": "$Revolution Per Minutes",
          "Intake Air Temperature": "$Intake Air Temperature",
          "Coolant Temperature": "$Coolant Temperature",
          "Air-Fuel Ratio": "$Air-Fuel Ratio",
          "Manifold Absolute Pressure": "$Manifold Absolute Pressure",
          "Throttle Position Sensor": "$Throttle Position Sensor",
        },
      });
    }

    const result = await db
      .collection("sensor")
      .aggregate(aggregationPipeline)
      .toArray();

    const roundedResult = result.map((entry) => {
      let roundedEntry = { ...entry, date: entry.date };
      if (sensorName) {
        roundedEntry[sensorName] = Math.round(entry[sensorName] * 100) / 100;
      } else {
        roundedEntry["Revolution Per Minutes"] =
          Math.round(entry["Revolution Per Minutes"] * 100) / 100;
        roundedEntry["Intake Air Temperature"] =
          Math.round(entry["Intake Air Temperature"] * 100) / 100;
        roundedEntry["Coolant Temperature"] =
          Math.round(entry["Coolant Temperature"] * 100) / 100;
        roundedEntry["Air-Fuel Ratio"] =
          Math.round(entry["Air-Fuel Ratio"] * 100) / 100;
        roundedEntry["Manifold Absolute Pressure"] =
          Math.round(entry["Manifold Absolute Pressure"] * 100) / 100;
        roundedEntry["Throttle Position Sensor"] =
          Math.round(entry["Throttle Position Sensor"] * 100) / 100;
      }
      return roundedEntry;
    });

    console.log("API result:", roundedResult); // Add this to debug
    return NextResponse.json(roundedResult);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch sensor insights" },
      { status: 500 }
    );
  }
}
