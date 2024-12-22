import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

const INACTIVE_THRESHOLD = 2.5 * 60 * 1000; // 2.5 minutes in milliseconds

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("ICE");

    // Calculate WIB day range
    const now = new Date();
    now.setUTCHours(now.getUTCHours() + 7); // Convert to WIB time

    const startOfDay = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        17,
        0,
        0,
        0
      )
    );

    startOfDay.setUTCDate(startOfDay.getUTCDate() - 1);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
    endOfDay.setUTCHours(16, 59, 59, 999);

    console.log("Current UTC time:", new Date().toISOString());
    console.log("Current WIB time:", now.toISOString());
    console.log("UTC start of WIB day:", startOfDay.toISOString());
    console.log("UTC end of WIB day:", endOfDay.toISOString());

    // Fetch the most recent sensor data
    const latestSensorData = await db
      .collection("sensor")
      .findOne(
        { timestamp: { $gte: startOfDay, $lt: endOfDay } },
        { sort: { timestamp: -1 } }
      );

    console.log("Latest sensor data:", latestSensorData);

    let isActive = false;
    let todayActiveTime = 0;

    if (latestSensorData) {
      const currentTime = new Date();
      const timeSinceLatestData =
        currentTime - new Date(latestSensorData.timestamp);

      // Fetch the current daily activity document
      const currentActivity = await db
        .collection("daily_engine_activity")
        .findOne({ date: startOfDay });

      // Check if this is new data that needs processing
      if (
        !currentActivity ||
        !currentActivity.last_processed_timestamp ||
        new Date(latestSensorData.timestamp) >
          new Date(currentActivity.last_processed_timestamp)
      ) {
        // Process data regardless of threshold
        const result = await updateDailyActivity(
          db,
          latestSensorData,
          startOfDay,
          currentActivity,
          timeSinceLatestData
        );
        isActive = timeSinceLatestData <= INACTIVE_THRESHOLD;
        todayActiveTime = result.activeTime;
      } else {
        // Data already processed, just update active status
        isActive = timeSinceLatestData <= INACTIVE_THRESHOLD;
        todayActiveTime = currentActivity.activeTime;
      }
    } else {
      isActive = false;
      todayActiveTime = 0;
    }

    return NextResponse.json({
      isActive,
      todayActiveTime,
      latestDataTimestamp: latestSensorData ? latestSensorData.timestamp : null,
      wibDayStart: startOfDay.toISOString(),
      wibDayEnd: endOfDay.toISOString(),
    });
  } catch (e) {
    console.error("Error in GET request:", e);
    return NextResponse.json(
      { error: "Failed to fetch engine activity data" },
      { status: 500 }
    );
  }
}

async function updateDailyActivity(
  db,
  latestData,
  startOfDay,
  currentActivity,
  timeSinceLastData
) {
  const latestTime = new Date(latestData.timestamp);
  let timeToAdd = 2; // 2 minutes per update
  let activeTime = currentActivity?.activeTime || 0;

  if (currentActivity && currentActivity.last_processed_timestamp) {
    const lastProcessed = new Date(currentActivity.last_processed_timestamp);

    if (lastProcessed < startOfDay) {
      // New day
      console.log("New day detected, starting new session");
      activeTime = timeToAdd;
    } else {
      // Same day, check for session gap
      const timeSinceLastProcessed = latestTime - lastProcessed;

      if (timeSinceLastProcessed > INACTIVE_THRESHOLD) {
        // New session after inactivity
        console.log("New session after inactivity gap");
        activeTime += timeToAdd;
      } else {
        // Continuous activity
        console.log("Continuous activity in current session");
        activeTime += timeToAdd;
      }
    }
  } else {
    // First activity of the day
    console.log("First activity of the day");
    activeTime = timeToAdd;
  }

  // Update the database
  await db.collection("daily_engine_activity").updateOne(
    { date: startOfDay },
    {
      $set: {
        activeTime: activeTime,
        last_processed_timestamp: latestTime,
        last_session_start:
          timeSinceLastData > INACTIVE_THRESHOLD
            ? latestTime
            : currentActivity?.last_session_start || latestTime,
      },
      $setOnInsert: { date: startOfDay },
    },
    { upsert: true }
  );

  return {
    activeTime,
  };
}
