import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

const INACTIVE_THRESHOLD = 10.5 * 60 * 1000; // 10.5 minutes in milliseconds

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

      if (timeSinceLatestData <= INACTIVE_THRESHOLD) {
        if (
          !currentActivity ||
          !currentActivity.last_processed_timestamp ||
          new Date(latestSensorData.timestamp) >
            new Date(currentActivity.last_processed_timestamp)
        ) {
          // Only update if this is new data
          const result = await updateDailyActivity(
            db,
            latestSensorData,
            startOfDay,
            currentActivity
          );
          isActive = result.isActive;
          todayActiveTime = result.activeTime;
        } else {
          // Data has already been processed, just return current status
          isActive = true;
          todayActiveTime = currentActivity.activeTime;
        }
      } else {
        // Engine is inactive
        isActive = false;
        todayActiveTime = currentActivity ? currentActivity.activeTime : 0;
      }
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
  currentActivity
) {
  console.log("Updating daily activity");
  console.log("Latest data timestamp (UTC):", latestData.timestamp);
  console.log("UTC start of WIB day for update:", startOfDay.toISOString());

  const latestTime = new Date(latestData.timestamp);
  let timeToAdd = 10; // Default to 10 minutes as per your logic
  let isActive = true;
  let activeTime = currentActivity?.activeTime || 0;

  if (currentActivity && currentActivity.last_processed_timestamp) {
    const lastProcessed = new Date(currentActivity.last_processed_timestamp);
    console.log("Last processed timestamp:", lastProcessed.toISOString());

    // Check if last processed timestamp is from a previous day
    if (lastProcessed < startOfDay) {
      console.log("New day detected, starting new session");
      // For a new day, we start fresh with just the current 10 minutes
      activeTime = timeToAdd;
    } else {
      const timeSinceLastProcessed = latestTime - lastProcessed;
      if (timeSinceLastProcessed > INACTIVE_THRESHOLD) {
        console.log("New active session started after inactivity");
        // For a new session after inactivity, we add just the current 10 minutes
        activeTime += timeToAdd;
      } else {
        console.log("Continuous activity");
        // For continuous activity, we add the time since last processed
        // This handles cases where data might be slightly delayed
        // timeToAdd = Math.min(
        //   Math.round(timeSinceLastProcessed / (60 * 1000)),
        //   10
        // );
        activeTime += timeToAdd;
      }
    }
  } else {
    console.log("First activity of the day");
    // For the first activity, we just add the initial 10 minutes
    activeTime = timeToAdd;
  }

  console.log("Time added (minutes):", timeToAdd);
  console.log("Total active time:", activeTime);
  console.log("Is Active:", isActive);

  const updateResult = await db.collection("daily_engine_activity").updateOne(
    { date: startOfDay },
    {
      $set: {
        activeTime: activeTime,
        last_processed_timestamp: latestTime,
        isActive: isActive,
      },
      $setOnInsert: { date: startOfDay },
    },
    { upsert: true }
  );
  console.log("Update result:", updateResult);

  return {
    isActive,
    activeTime,
  };
}
