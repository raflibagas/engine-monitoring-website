// app/api/stats/route.js
import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get("timeRange"); // 'weekly' or 'monthly'

  try {
    const client = await clientPromise;
    const db = client.db("ICE");

    // Calculate date range based on timeRange
    const endDate = new Date();
    const startDate = new Date();
    if (timeRange === "weekly") {
      startDate.setDate(endDate.getDate() - 7);
    } else {
      startDate.setDate(endDate.getDate() - 30);
    }

    // Adjust dates to match your WIB time format
    startDate.setUTCHours(17, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 1);
    endDate.setUTCHours(16, 59, 59, 999);

    // Get activity statistics
    const activityPipeline = [
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          averageDaily: { $avg: { $divide: ["$activeTime", 60] } },
          totalHours: { $sum: { $divide: ["$activeTime", 60] } },
          daysActive: { $sum: 1 },
          longestSession: { $max: { $divide: ["$activeTime", 60] } },
        },
      },
    ];

    // Get sensor statistics
    const sensorsPipeline = [
      {
        $match: {
          timestamp: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          RPM_avg: { $avg: "$RPM" },
          RPM_min: { $min: "$RPM" },
          RPM_max: { $max: "$RPM" },
          IAT_avg: { $avg: "$IAT" },
          IAT_min: { $min: "$IAT" },
          IAT_max: { $max: "$IAT" },
          CLT_avg: { $avg: "$CLT" },
          CLT_min: { $min: "$CLT" },
          CLT_max: { $max: "$CLT" },
          AFR_avg: { $avg: "$AFR" },
          AFR_min: { $min: "$AFR" },
          AFR_max: { $max: "$AFR" },
          MAP_avg: { $avg: "$MAP" },
          MAP_min: { $min: "$MAP" },
          MAP_max: { $max: "$MAP" },
          TPS_avg: { $avg: "$TPS" },
          TPS_min: { $min: "$TPS" },
          TPS_max: { $max: "$TPS" },
        },
      },
    ];

    // Get warning counts
    const warningsPipeline = [
      {
        $match: {
          timestamp: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$sensor",
          count: { $sum: 1 },
        },
      },
    ];

    const [activityStats] = await db
      .collection("daily_engine_activity")
      .aggregate(activityPipeline)
      .toArray();
    const [sensorStats] = await db
      .collection("sensor")
      .aggregate(sensorsPipeline)
      .toArray();
    const warningStats = await db
      .collection("alerts")
      .aggregate(warningsPipeline)
      .toArray();

    const warningCounts = warningStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Format the response
    const formattedStats = {
      activity: {
        averageDaily: Math.round(activityStats?.averageDaily * 10) / 10 || 0,
        totalHours: Math.round(activityStats?.totalHours * 10) / 10 || 0,
        daysActive: activityStats?.daysActive || 0,
        longestSession:
          Math.round(activityStats?.longestSession * 10) / 10 || 0,
      },
      sensors: [
        {
          name: "Revolution Per Minutes",
          icon: "🔄",
          average: Math.round(sensorStats?.RPM_avg || 0),
          min: Math.round(sensorStats?.RPM_min || 0),
          max: Math.round(sensorStats?.RPM_max || 0),
          warnings: warningCounts["RPM"] || 0,
          unit: "rpm",
        },
        {
          name: "Intake Air Temperature",
          icon: "🌡️",
          average: Math.round(sensorStats?.IAT_avg * 10) / 10 || 0,
          min: Math.round(sensorStats?.IAT_min * 10) / 10 || 0,
          max: Math.round(sensorStats?.IAT_max * 10) / 10 || 0,
          warnings: warningCounts["IAT"] || 0,
          unit: "°C",
        },
        {
          name: "Coolant Temperature",
          icon: "🧊",
          average: Math.round(sensorStats?.CLT_avg * 10) / 10 || 0,
          min: Math.round(sensorStats?.CLT_min * 10) / 10 || 0,
          max: Math.round(sensorStats?.CLT_max * 10) / 10 || 0,
          warnings: warningCounts["CLT"] || 0,
          unit: "°C",
        },
        {
          name: "Air-Fuel Ratio",
          icon: "💨",
          average: Math.round(sensorStats?.AFR_avg * 100) / 100 || 0,
          min: Math.round(sensorStats?.AFR_min * 100) / 100 || 0,
          max: Math.round(sensorStats?.AFR_max * 100) / 100 || 0,
          warnings: warningCounts["AFR"] || 0,
          unit: ": 1",
        },
        {
          name: "Manifold Absolute Pressure",
          icon: "📊",
          average: Math.round(sensorStats?.MAP_avg * 10) / 10 || 0,
          min: Math.round(sensorStats?.MAP_min * 10) / 10 || 0,
          max: Math.round(sensorStats?.MAP_max * 10) / 10 || 0,
          warnings: warningCounts["MAP"] || 0,
          unit: "kPa",
        },
        {
          name: "Throttle Position Sensor",
          icon: "🎚️",
          average: Math.round(sensorStats?.TPS_avg * 10) / 10 || 0,
          min: Math.round(sensorStats?.TPS_min * 10) / 10 || 0,
          max: Math.round(sensorStats?.TPS_max * 10) / 10 || 0,
          warnings: warningCounts["TPS"] || 0,
          unit: "%",
        },
      ],
    };

    console.log("API result:", startDate); // Add this to debug
    console.log("API result:", endDate); // Add this to debug

    return NextResponse.json(formattedStats);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch sensor statistics" },
      { status: 500 }
    );
  }
}
