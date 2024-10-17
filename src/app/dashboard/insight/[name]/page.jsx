"use client";

// insight/[name]/page.jsx
import { useParams } from "next/navigation";
import SensorChart from "@/app/ui/insight/sensor-charts";

export default function SensorPage() {
  const params = useParams();
  const name = params.name;

  if (!name) return <div>Loading...</div>;

  return <SensorChart sensorName={name.toUpperCase()} />;
}
