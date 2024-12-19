// app/lib/data.js
import clientPromise from "@/app/lib/mongodb";

export async function fetchDataCount() {
  try {
    const client = await clientPromise;
    const db = client.db("ICE");
    return await db.collection("sensor").countDocuments();
  } catch (error) {
    console.error("Error fetching data count:", error);
    return 0;
  }
}

// Helper to format bytes for display
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
