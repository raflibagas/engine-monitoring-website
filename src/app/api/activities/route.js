// app/api/activities/route.js
import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";

  try {
    const client = await clientPromise;
    const db = client.db("ICE");

    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { activity: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { performedBy: { $regex: search, $options: "i" } },
        ],
      };
    }

    const [activities, total] = await Promise.all([
      db
        .collection("activities")
        .find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("activities").countDocuments(query),
    ]);

    console.log(`Total Pages: ${Math.ceil(total / limit)}`);

    return NextResponse.json({
      activities,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalActivities: total,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("ICE");
    const activity = await request.json();

    const result = await db.collection("activities").insertOne({
      ...activity,
      date: new Date(activity.date),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to add activity" },
      { status: 500 }
    );
  }
}
