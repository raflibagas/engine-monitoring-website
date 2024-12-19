// utils/alertProcessor.js
import clientPromise from "../lib/mongodb";

export async function processAlerts() {
  console.log("Starting alert processing...");
  try {
    const client = await clientPromise;
    const db = client.db("ICE");

    // Get the last processed timestamp
    const lastProcessingLog = await db
      .collection("alertProcessingLog")
      .findOne({}, { sort: { processedTimestamp: -1 } });

    const lastProcessedTime =
      lastProcessingLog?.processedTimestamp || new Date(0);
    console.log("Last processed time:", lastProcessedTime);

    // Get only new sensor readings
    const newReadings = await db
      .collection("sensor")
      .find({
        timestamp: { $gt: lastProcessedTime },
      })
      .sort({ timestamp: 1 })
      .toArray();

    console.log(`Found ${newReadings.length} new readings to process`);

    if (newReadings.length === 0) {
      console.log("No new readings to process");
      return;
    }

    // Get thresholds with upper and lower bounds
    const thresholds = await db
      .collection("sensorThresholds")
      .find({})
      .toArray()
      .then((results) =>
        results.reduce((acc, curr) => {
          acc[curr.sensor] = {
            upperThreshold: curr.upperThreshold,
            lowerThreshold: curr.lowerThreshold,
            unit: curr.unit,
          };
          return acc;
        }, {})
      );

    // Process new readings
    const alerts = newReadings.flatMap((reading) => {
      const sensorAlerts = [];
      const timestamp = new Date(reading.timestamp);

      // Check each sensor against both thresholds
      Object.entries(thresholds).forEach(
        ([sensor, { upperThreshold, lowerThreshold, unit }]) => {
          const value = reading[sensor];

          if (value > upperThreshold) {
            sensorAlerts.push({
              sensor,
              value,
              upperThreshold,
              lowerThreshold,
              unit,
              description: "Above Upper Threshold",
              timestamp,
              createdAt: new Date(),
            });
          } else if (value < lowerThreshold) {
            sensorAlerts.push({
              sensor,
              value,
              upperThreshold,
              lowerThreshold,
              unit,
              description: "Below Lower Threshold",
              timestamp,
              createdAt: new Date(),
            });
          }
        }
      );

      return sensorAlerts;
    });

    // Save new alerts
    if (alerts.length > 0) {
      await db.collection("alerts").insertMany(alerts);
    }

    // Log processing
    await db.collection("alertProcessingLog").insertOne({
      processedTimestamp: new Date(),
      lastReadingTime: newReadings[newReadings.length - 1].timestamp,
      readingsProcessed: newReadings.length,
      alertsGenerated: alerts.length,
      success: true,
    });

    console.log(
      `Successfully processed ${newReadings.length} readings and generated ${alerts.length} alerts`
    );
  } catch (error) {
    console.error("Alert processing error:", error);

    const client = await clientPromise;
    const db = client.db("ICE");
    await db.collection("alertProcessingLog").insertOne({
      processedTimestamp: new Date(),
      error: error.message,
      success: false,
    });
  }
}

// Initialize processor
if (typeof window === "undefined") {
  console.log("Initializing alert processor...");
  setInterval(processAlerts,  60 * 1000); // Every 10 minutes
  processAlerts().catch(console.error);
}
