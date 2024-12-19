"use client";

import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, Settings, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { StatusSkeleton } from "../skeletons";

const GaugeChart = ({ sensor }) => {
  const { name, value, upperThreshold, lowerThreshold, unit } = sensor;

  switch (name) {
    case "RPM":
      return (
        <RPMGauge
          value={value}
          upperThreshold={upperThreshold}
          lowerThreshold={lowerThreshold}
          unit={unit}
        />
      );
    case "IAT":
    case "CLT":
      return (
        <TemperatureGauge
          value={value}
          upperThreshold={upperThreshold}
          lowerThreshold={lowerThreshold}
          unit={unit}
          status={sensor.status}
        />
      );
    case "AFR":
      return (
        <AFRGauge
          value={value}
          upperThreshold={upperThreshold}
          lowerThreshold={lowerThreshold}
          unit={unit}
        />
      );
    case "MAP":
      return (
        <PressureGauge
          value={value}
          upperThreshold={upperThreshold}
          lowerThreshold={lowerThreshold}
          unit={unit}
        />
      );
    case "TPS":
      return (
        <PercentageGauge
          value={value}
          upperThreshold={upperThreshold}
          lowerThreshold={lowerThreshold}
          unit={unit}
        />
      );
    default:
      return (
        <DefaultGauge
          value={value}
          upperThreshold={upperThreshold}
          lowerThreshold={lowerThreshold}
          unit={unit}
        />
      );
  }
};

const RPMGauge = ({ value, upperThreshold, lowerThreshold, unit }) => {
  // Calculate total range and position
  const range = upperThreshold - lowerThreshold;
  const normalizedValue = Math.min(Math.max(value - lowerThreshold, 0), range);

  const data = [
    { name: "value", value: normalizedValue },
    { name: "remaining", value: range - normalizedValue },
  ];

  // Determine color based on both thresholds
  const getColor = () => {
    if (value > upperThreshold) return "#FF4136"; // Red for above upper
    if (value < lowerThreshold) return "#FF4136"; // Red for below lower
    if (value > upperThreshold * 0.9 || value < lowerThreshold * 1.1)
      return "#FFD700"; // Yellow for warning
    return "#0088FE"; // Blue for normal
  };

  const COLORS = [getColor(), "#EEEEEE"];

  return (
    <ResponsiveContainer width="100%" height={100}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="100%"
          startAngle={180}
          endAngle={0}
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

const TemperatureGauge = ({
  value,
  upperThreshold,
  lowerThreshold,
  unit,
  status,
}) => {
  // Calculate percentage within the range
  const range = upperThreshold - lowerThreshold;
  const normalizedValue = ((value - lowerThreshold) / range) * 100;
  const percentage = Math.min(Math.max(normalizedValue, 0), 100);

  const getBarColor = (status) => {
    switch (status) {
      case "Normal":
        return "bg-green-500";
      case "Warning":
        return "bg-yellow-500";
      case "Critical":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <ResponsiveContainer width="100%" height={56}>
      <div className="relative pt-2 mt-11">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          <div
            style={{ width: `${percentage}%` }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getBarColor(
              status
            )}`}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>
            {lowerThreshold}
            {unit}
          </span>
          <span>
            {upperThreshold}
            {unit}
          </span>
        </div>
      </div>
    </ResponsiveContainer>
  );
};

const AFRGauge = ({ value, upperThreshold, lowerThreshold, unit }) => {
  const optimalValue = (upperThreshold + lowerThreshold) / 2;
  const range = upperThreshold - lowerThreshold;
  const normalizedValue = ((value - lowerThreshold) / range) * 180; // 180 degrees total

  const data = [
    { name: "value", value: 1 },
    { name: "remaining", value: 1 },
  ];

  const getColor = () => {
    if (value > upperThreshold || value < lowerThreshold) return "#FF4136";
    const deviation = Math.abs(value - optimalValue);
    const maxDeviation = range / 2;
    return deviation > maxDeviation * 0.8 ? "#FFD700" : "#2ECC40";
  };

  const COLORS = [getColor(), "#EEEEEE"];

  return (
    <ResponsiveContainer width="100%" height={100}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="100%"
          startAngle={180}
          endAngle={0}
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={0}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

const PressureGauge = ({ value, upperThreshold, lowerThreshold, unit }) => {
  return (
    <RPMGauge
      value={value}
      upperThreshold={upperThreshold}
      lowerThreshold={lowerThreshold}
      unit={unit}
    />
  );
};

const PercentageGauge = ({ value, upperThreshold, lowerThreshold, unit }) => {
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  const data = [
    { name: "value", value: normalizedValue },
    { name: "remaining", value: 100 - normalizedValue },
  ];

  const getColor = () => {
    if (value > upperThreshold || value < lowerThreshold) return "#FF4136";
    if (value > upperThreshold * 0.9 || value < lowerThreshold * 1.1)
      return "#FFD700";
    return "#0088FE";
  };

  const COLORS = [getColor(), "#EEEEEE"];

  return (
    <ResponsiveContainer width="100%" height={100}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="100%"
          startAngle={180}
          endAngle={0}
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

const DefaultGauge = ({ value, upperThreshold, lowerThreshold, unit }) => {
  return (
    <RPMGauge
      value={value}
      upperThreshold={upperThreshold}
      lowerThreshold={lowerThreshold}
      unit={unit}
    />
  );
};

const SensorCard = ({ sensor, onEditThreshold }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [upperThreshold, setUpperThreshold] = useState(
    sensor.upperThreshold?.toString() || ""
  );
  const [lowerThreshold, setLowerThreshold] = useState(
    sensor.lowerThreshold?.toString() || ""
  );

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/update-thresholds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sensor: sensor.name,
          upperThreshold,
          lowerThreshold,
        }),
      });

      if (!response.ok) throw new Error("Failed to update thresholds");

      setIsEditing(false);
      onEditThreshold(); // Refresh data
    } catch (err) {
      console.error("Update threshold error:", err);
      // Handle error (show message to user)
    } finally {
      setIsSaving(false); // End loading state
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-gray-200 border-2">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{sensor.name}</h3>
        <div
          className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
            sensor.status === "Critical"
              ? "bg-red-500"
              : sensor.status === "Warning"
              ? "bg-yellow-500"
              : "bg-green-500"
          }`}
        >
          {sensor.status}
        </div>
      </div>

      <GaugeChart sensor={sensor} />

      <div className="flex-grow flex flex-col justify-center items-center">
        <div className="text-2xl font-bold mb-2 mt-2">
          {sensor.value}
          {sensor.unit}
        </div>
        <div className="text-sm text-gray-600 mb-4">
          Range: {sensor.lowerThreshold}
          {sensor.unit} - {sensor.upperThreshold}
          {sensor.unit}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <label className="text-sm text-gray-600">Lower Threshold</label>
              <input
                type="number"
                value={lowerThreshold}
                onChange={(e) => setLowerThreshold(e.target.value)}
                className="w-full border rounded px-2 py-1"
                step="0.01"
                disabled={isSaving}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-600">Upper Threshold</label>
              <input
                type="number"
                value={upperThreshold}
                onChange={(e) => setUpperThreshold(e.target.value)}
                className="w-full border rounded px-2 py-1"
                step="0.01"
                disabled={isSaving}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          <Settings size={16} className="inline mr-2" /> Set Thresholds
        </button>
      )}
    </div>
  );
};

const StatusAlert = () => {
  const [sensors, setSensors] = useState([]);
  const [engineHealth, setEngineHealth] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const prevSensorsRef = useRef();

  useEffect(() => {
    prevSensorsRef.current = sensors;
  });

  const prevSensors = prevSensorsRef.current;

  const fetchSensorData = async () => {
    try {
      const response = await fetch("/api/sensor-readings?latest=true", {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sensor data");
      }
      const data = await response.json();
      setSensors(data.sensors);
      setEngineHealth(data.engineHealth);
      setAlerts(data.alerts);
      setIsLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const intervalId = setInterval(fetchSensorData, 50000);
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return <StatusSkeleton />;
  }
  if (error)
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-grow flex-col">
      <h1 className="text-2xl font-bold mb-4 -mt-2">Engine Status</h1>

      {/* Engine Health */}
      {/* <div className="mb-8 p-6 bg-white rounded-lg shadow-lg border-gray-200 border-2">
        <h2 className="text-xl font-semibold mb-4">Overall Engine Health</h2>
        <div className="flex items-center">
          <Activity
            size={24}
            className={
              engineHealth === "Good" ? "text-green-500" : "text-red-500"
            }
          />
          <span
            className={`ml-4 text-xl font-bold ${
              engineHealth === "Good" ? "text-green-500" : "text-red-500"
            }`}
          >
            {engineHealth}
          </span>
        </div>
      </div> */}

      {/* Sensor Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {sensors.map((sensor) => (
          <SensorCard
            key={sensor.name}
            sensor={sensor}
            onEditThreshold={fetchSensorData}
          />
        ))}
      </div>
    </div>
  );
};

export default StatusAlert;
