// app/api/update-threshold/route.js
import { NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb';

export async function POST(request) {
  try {
    const { sensor, newThreshold } = await request.json();
    const client = await clientPromise;
    const db = client.db("ICE");

    const result = await db.collection("sensorThresholds").updateOne(
      { sensor: sensor },
      { 
        $set: { 
          threshold: newThreshold,
          updatedAt: new Date().toISOString()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Sensor threshold not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Threshold updated successfully' });
  } catch (error) {
    console.error('Failed to update threshold:', error);
    return NextResponse.json({ error: 'Failed to update threshold' }, { status: 500 });
  }
}