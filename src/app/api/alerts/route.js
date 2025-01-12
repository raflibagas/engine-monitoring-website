import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    const client = await clientPromise;
    const db = client.db("ICE");

    let query = {};
    let sortDirection = -1; // Default descending (latest first)

    if (dateParam) {
      const date = new Date(dateParam);
      date.setUTCDate(date.getUTCDate() - 1);

      // Adjust for Indonesia time (UTC+7)
      const startOfDay = new Date(
        Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
          17,
          0,
          0
        )
      );
      const endOfDay = new Date(startOfDay);
      endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
      endOfDay.setUTCHours(16, 59, 59, 999);

      query.timestamp = { $gte: startOfDay, $lt: endOfDay };
      sortDirection = 1; // Ascending for specific date
    }

    // Get worker status
    const workerStatus = await db
      .collection("workerStatus")
      .findOne({ name: "alertProcessor" });

    // Get total count
    const totalAlerts = await db.collection("alerts").countDocuments(query);
    const totalPages = Math.ceil(totalAlerts / limit);

    // Get paginated alerts with dynamic sort direction
    const alerts = await db
      .collection("alerts")
      .find(query)
      .sort({ timestamp: sortDirection })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Add row numbers
    const alertsWithNumbers = alerts.map((alert, index) => ({
      ...alert,
      no: (page - 1) * limit + index + 1,
    }));

    if (alerts.length === 0) {
      return NextResponse.json({
        alerts: [],
        currentPage: 1,
        totalPages: 0,
        totalAlerts: 0,
        message: dateParam
          ? "No alerts found for the selected date"
          : "No alerts found",
        workerStatus: {
          status: workerStatus?.status || "unknown",
          lastHeartbeat: workerStatus?.lastHeartbeat,
          lastProcessedCount: workerStatus?.lastProcessedCount,
          lastError: workerStatus?.lastError,
        },
      });
    }

    return NextResponse.json({
      alerts: alertsWithNumbers,
      currentPage: page,
      totalPages,
      totalAlerts,
      workerStatus: {
        status: workerStatus?.status || "unknown",
        lastHeartbeat: workerStatus?.lastHeartbeat,
        lastProcessedCount: workerStatus?.lastProcessedCount,
        lastError: workerStatus?.lastError,
      },
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
