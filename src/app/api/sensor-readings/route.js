// app/api/sensor-readings/route.js
import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const isLatest = searchParams.get("latest") === "true";
  const isLatestPaginated = searchParams.get("latestPaginated") === "true";

  try {
    const client = await clientPromise;
    const db = client.db("ICE");

    if (isLatest) {
      return getLatestReading(db);
    } else if (isLatestPaginated) {
      return getLatestPaginatedReadings(db, request);
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
          upperThreshold: threshold.upperThreshold,
          lowerThreshold: threshold.lowerThreshold,
          unit: threshold.unit,
        };
      }
    );

    const determineStatus = (value, thresholds) => {
      if (!thresholds.upperThreshold || !thresholds.lowerThreshold) {
        return "Unknown";
      }

      if (value > thresholds.upperThreshold) return "Critical";
      if (value < thresholds.lowerThreshold) return "Critical";

      // Warning zone: within 10% of either threshold
      const upperWarningThreshold = thresholds.upperThreshold * 0.9;
      const lowerWarningThreshold = thresholds.lowerThreshold * 1.1;

      if (value >= upperWarningThreshold || value <= lowerWarningThreshold) {
        return "Warning";
      }

      return "Normal";
    };

    sensors.forEach((sensor) => {
      sensor.status = determineStatus(sensor.value, {
        upperThreshold: sensor.upperThreshold,
        lowerThreshold: sensor.lowerThreshold,
      });
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

async function getLatestPaginatedReadings(db, request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  try {
    const readings = await db
      .collection("sensor")
      .aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$timestamp" },
              month: { $month: "$timestamp" },
              day: { $dayOfMonth: "$timestamp" },
              hour: { $hour: "$timestamp" },
            },
            avgRPM: { $avg: "$RPM" },
            avgIAT: { $avg: "$IAT" },
            avgCLT: { $avg: "$CLT" },
            avgAFR: { $avg: "$AFR" },
            avgMAP: { $avg: "$MAP" },
            avgTPS: { $avg: "$TPS" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 1,
            avgRPM: { $trunc: "$avgRPM" },
            avgIAT: 1,
            avgCLT: 1,
            avgAFR: 1,
            avgMAP: 1,
            avgTPS: 1,
            count: 1,
          },
        },
        {
          $sort: {
            "_id.year": -1,
            "_id.month": -1,
            "_id.day": -1,
            "_id.hour": -1,
          },
        }, // Sort by latest
        { $skip: skip },
        { $limit: limit },
      ])
      .toArray();

    const total = await db
      .collection("sensor")
      .aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$timestamp" },
              month: { $month: "$timestamp" },
              day: { $dayOfMonth: "$timestamp" },
              hour: { $hour: "$timestamp" },
            },
          },
        },
      ])
      .toArray();

    const totalPages = Math.ceil(total.length / limit);

    return NextResponse.json({
      readings: readings.map((reading) => ({
        timestamp: new Date(
          reading._id.year,
          reading._id.month - 1,
          reading._id.day,
          reading._id.hour + 7
        ).toISOString(),
        avgRPM: reading.avgRPM,
        avgIAT: reading.avgIAT,
        avgCLT: reading.avgCLT,
        avgAFR: reading.avgAFR,
        avgMAP: reading.avgMAP,
        avgTPS: reading.avgTPS,
        count: reading.count,
      })),
      currentPage: page,
      totalPages: totalPages,
      totalReadings: total.length,
    });
  } catch (e) {
    console.error("Error in getLatestPaginatedReadings:", e);
    return NextResponse.json(
      { error: "Failed to fetch latest paginated readings" },
      { status: 500 }
    );
  }
}

async function getPaginatedReadings(db, request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
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
    const readings = await db
      .collection("sensor")
      .aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              year: { $year: "$timestamp" },
              month: { $month: "$timestamp" },
              day: { $dayOfMonth: "$timestamp" },
              hour: { $hour: "$timestamp" },
            },
            avgRPM: { $avg: "$RPM" },
            avgIAT: { $avg: "$IAT" },
            avgCLT: { $avg: "$CLT" },
            avgAFR: { $avg: "$AFR" },
            avgMAP: { $avg: "$MAP" },
            avgTPS: { $avg: "$TPS" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 1,
            avgRPM: { $trunc: "$avgRPM" },
            avgIAT: 1,
            avgCLT: 1,
            avgAFR: 1,
            avgMAP: 1,
            avgTPS: 1,
            count: 1,
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 },
        },
        { $skip: skip },
        { $limit: limit },
      ])
      .toArray();

    const total = await db
      .collection("sensor")
      .aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              year: { $year: "$timestamp" },
              month: { $month: "$timestamp" },
              day: { $dayOfMonth: "$timestamp" },
              hour: { $hour: "$timestamp" },
            },
          },
        },
      ])
      .toArray();

    const totalPages = Math.ceil(total.length / limit);

    console.log(
      `Found ${readings.length} readings out of ${total.length} total`
    );
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

    console.log("Returning paginated data");
    console.log(`Total Pages: ${Math.ceil(total.length / limit)}`);

    return NextResponse.json({
      readings: readings.map((reading) => ({
        timestamp: new Date(
          reading._id.year,
          reading._id.month - 1,
          reading._id.day,
          reading._id.hour + 7
        ).toISOString(),
        avgRPM: reading.avgRPM,
        avgIAT: reading.avgIAT,
        avgCLT: reading.avgCLT,
        avgAFR: reading.avgAFR,
        avgMAP: reading.avgMAP,
        avgTPS: reading.avgTPS,
        count: reading.count, // Optional: Number of data points in the hour
      })),
      currentPage: page,
      totalPages: totalPages,
      totalReadings: total.length,
    });
  } catch (e) {
    console.error("Error in getPaginatedReadings:", e);
    return NextResponse.json(
      { error: "Failed to fetch paginated sensor readings" },
      { status: 500 }
    );
  }
}
