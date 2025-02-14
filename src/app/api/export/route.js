// app/api/export/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startParam = new Date(searchParams.get("start"));
    const endParam = new Date(searchParams.get("end"));

    const getIndonesiaTimeRangeStart = (dateParam) => {
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
        return { start: startOfDay };
      }
      return null;
    };

    const getIndonesiaTimeRangeEnd = (dateParam) => {
      if (dateParam) {
        const date = new Date(dateParam);
        date.setUTCDate(date.getUTCDate());

        // Adjust for Indonesia time (UTC+7)
        const endOfDay = new Date(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            17,
            0,
            0
          )
        );

        return { end: endOfDay };
      }
      return null;
    };

    const startRange = getIndonesiaTimeRangeStart(startParam);
    const endRange = getIndonesiaTimeRangeEnd(endParam);

    if (!startRange || !endRange) {
      return new NextResponse("Invalid date parameters", { status: 400 });
    }

    const start = startRange.start;
    const end = endRange.end;

    console.log(end);

    // Validate date range
    const diffDays = (end - start) / (1000 * 60 * 60 * 24);
    if (diffDays > 30) {
      return new NextResponse("Date range cannot exceed 30 Days", {
        status: 400,
      });
    }

    if (diffDays < 0) {
      return new NextResponse("End date must be after start date", {
        status: 400,
      });
    }

    const client = await clientPromise;
    const db = client.db("ICE");

    // Create a cursor to fetch data incrementally
    const cursor = db
      .collection("sensor")
      .find({
        timestamp: { $gte: start, $lt: end },
      })
      .sort({ timestamp: 1 });

    // Count total documents
    const totalDocuments = await cursor.count();

    // Reset the cursor after counting
    cursor.rewind();

    // Create a ReadableStream with batching
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Enqueue CSV headers
        const headers = "timestamp,rpm,iat,clt,afr,map,tps\n";
        controller.enqueue(encoder.encode(headers));

        const batchSize = 50; // Number of rows per batch
        let batch = [];

        while (await cursor.hasNext()) {
          const doc = await cursor.next();

          // Convert UTC timestamp to UTC+7 (Jakarta time)
          const utcTimestamp = new Date(doc.timestamp);
          // Add 7 hours (7 * 60 * 60 * 1000 milliseconds)
          const jakartaTimestamp = new Date(
            utcTimestamp.getTime() + 7 * 60 * 60 * 1000
          );

          // Create CSV row with adjusted timestamp
          const row = `${jakartaTimestamp.toISOString()},${doc.RPM},${
            doc.IAT
          },${doc.CLT},${doc.AFR},${doc.MAP},${doc.TPS}\n`;
          batch.push(row);

          if (batch.length === batchSize) {
            controller.enqueue(encoder.encode(batch.join("")));
            batch = [];
          }
        }

        // Enqueue any remaining rows
        if (batch.length > 0) {
          controller.enqueue(encoder.encode(batch.join("")));
        }

        controller.close();
      },
    });

    // Format dates for filename
    const formatDate = (date) =>
      date.toISOString().split("T")[0].replace(/-/g, "");

    const filename = `sensor-data-${formatDate(start)}-to-${formatDate(
      end
    )}.csv`;

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
        "X-Total-Count": totalDocuments.toString(), // Custom header
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Error generating export", { status: 500 });
  }
}
