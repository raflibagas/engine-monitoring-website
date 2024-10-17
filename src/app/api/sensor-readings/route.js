// app/api/sensor-readings/route.js
import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const isLatest = searchParams.get("latest") === "true";

  try {
    const client = await clientPromise;
    const db = client.db("ICE");

    if (isLatest) {
      return getLatestReading(db);
    } else {
      return getPaginatedReadings(db, request);
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to connect to database" },
      { status: 500 }
    );
  }
}

async function getLatestReading(db) {
  try {
    const latestReading = await db
      .collection("sensor")
      .findOne({}, { sort: { timestamp: -1 } });

    if (!latestReading) {
      return NextResponse.json(
        { error: "No sensor readings found" },
        { status: 404 }
      );
    }

    const thresholds = await db
      .collection("sensorThresholds")
      .find({})
      .toArray();

    const sensors = ["RPM", "IAT", "CLT", "AFR", "MAP", "TPS"].map(
      (sensorName) => {
        const threshold = thresholds.find((t) => t.sensor === sensorName) || {};
        return {
          name: sensorName,
          value: latestReading[sensorName],
          threshold: threshold.threshold,
          unit: threshold.unit,
        };
      }
    );

    const determineStatus = (value, threshold) => {
      if (value > threshold) return "Critical";
      if (value > threshold * 0.9) return "Warning";
      return "Normal";
    };

    sensors.forEach((sensor) => {
      sensor.status = determineStatus(sensor.value, sensor.threshold);
    });

    const engineHealth = sensors.every((sensor) => sensor.status === "normal")
      ? "Good"
      : "Needs Attention";

    const alerts = sensors
      .filter((sensor) => sensor.status !== "normal")
      .map(
        (sensor) =>
          `${sensor.name} is ${sensor.status}: ${sensor.value}${sensor.unit}`
      );

    return NextResponse.json({ sensors, engineHealth, alerts });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch sensor readings" },
      { status: 500 }
    );
  }
}

async function getPaginatedReadings(db, request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const dateParam = searchParams.get("date");

  console.log("Incoming date parameter:", dateParam);

  let query = {};
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
    endOfDay.setUTCHours(16, 59, 59, 999); // 23:59:59 in Indonesia time

    query.timestamp = { $gte: startOfDay, $lt: endOfDay };

    console.log("Query date range:", {
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
    });
  }

  console.log("Final query:", JSON.stringify(query));

  const skip = (page - 1) * limit;

  try {
    const [readings, total] = await Promise.all([
      db
        .collection("sensor")
        .find(query)
        .sort({ timestamp: 1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("sensor").countDocuments(query),
    ]);

    console.log(`Found ${readings.length} readings out of ${total} total`);
    if (readings.length > 0) {
      console.log("Sample reading:", readings[0]);
    } else {
      console.log("No readings found");
    }

    if (readings.length === 0) {
      console.log("No readings found for the query");
      return NextResponse.json({
        readings: [],
        currentPage: 1,
        totalPages: 0,
        totalReadings: 0,
        message: dateParam
          ? "No data found for the selected date"
          : "No data found",
      });
    }

    // In the getPaginatedReadings function, when preparing the data to send:
    const adjustedReadings = readings.map((reading) => ({
      ...reading,
      timestamp: reading.timestamp.toISOString(), // Just convert to ISO string without adding hours
    }));

    console.log("Returning paginated data");
    return NextResponse.json({
      readings: adjustedReadings,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReadings: total,
    });
  } catch (e) {
    console.error("Error in getPaginatedReadings:", e);
    return NextResponse.json(
      { error: "Failed to fetch paginated sensor readings" },
      { status: 500 }
    );
  }
}
