"use client";

import React, { useState } from "react";
import Link from "next/link";
import SensorStats from "./sensor-stats";

const sensors = [
  {
    name: "Revolution Per Minutes",
    icon: "🔄",
    description: "Revolutions Per Minute - Measures engine speed",
  },
  {
    name: "Intake Air Temperature",
    icon: "🌡️",
    description:
      "Intake Air Temperature - Measures the temperature of the air entering the engine",
  },
  {
    name: "Coolant Temperature",
    icon: "🧊",
    description:
      "Coolant Temperature - Measures the temperature of the engine coolant",
  },
  {
    name: "Air-Fuel Ratio",
    icon: "💨",
    description:
      "Air-Fuel Ratio - Measures the ratio of air to fuel in the engine",
  },
  {
    name: "Manifold Absolute Pressure",
    icon: "📊",
    description:
      "Manifold Absolute Pressure - Measures the pressure in the intake manifold",
  },
  {
    name: "Throttle Position Sensor",
    icon: "🎚️",
    description:
      "Throttle Position Sensor - Measures the position of the throttle valve",
  },
];

const SensorCard = ({ sensor }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Link href={`/dashboard/insight/${sensor.name}`}>
      <div
        className="relative bg-white p-4 rounded shadow-lg hover:shadow-lg transition-shadow cursor-pointer w-full h-full border border-blue-900"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="text-2xl mr-2">{sensor.icon}</span>
        <span className="text-lg font-semibold">{sensor.name}</span>
        {showTooltip && (
          <div className="absolute z-10 p-2 bg-gray-800 text-white text-sm rounded shadow-lg -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full">
            {sensor.description}
          </div>
        )}
      </div>
    </Link>
  );
};

const SensorList = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 -mt-2">Sensors Trend</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map((sensor) => (
          <SensorCard key={sensor.name} sensor={sensor} />
        ))}
      </div>
      <SensorStats />
    </div>
  );
};

export default SensorList;
