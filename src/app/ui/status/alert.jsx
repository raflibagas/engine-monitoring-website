"use client";

import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, Settings, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { StatusSkeleton } from "../skeletons";

const GaugeChart = ({ sensor }) => {
  const { name, value, threshold, unit } = sensor;

  switch (name) {
    case "RPM":
      return <RPMGauge value={value} threshold={threshold} unit={unit} />;
    case "IAT":
    case "CLT":
      return (
        <TemperatureGauge
          value={value}
          threshold={threshold}
          unit={unit}
          status={sensor.status}
        />
      );
    case "AFR":
      return <PressureGauge value={value} threshold={threshold} unit={unit} />;
    case "MAP":
      return <PressureGauge value={value} threshold={threshold} unit={unit} />;
    case "TPS":
      return <PercentageGauge value={value} unit={unit} />;
    default:
      return <DefaultGauge value={value} threshold={threshold} unit={unit} />;
  }
};

const RPMGauge = ({ value, threshold, unit }) => {
  const data = [
    { name: "value", value: Math.min(value, threshold) },
    { name: "remaining", value: Math.max(threshold - value, 0) },
  ];
  const COLORS =
    value > threshold ? ["#FF4136", "#EEEEEE"] : ["#0088FE", "#EEEEEE"];

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

const TemperatureGauge = ({ value, threshold, unit, status }) => {
  const percentage = (value / threshold) * 100;

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
    <ResponsiveContainer width="100%" height={100}>
      <div className="flex justify-between items-center mb-8"></div>
      <div className="relative pt-2">
        <div className="flex mb-2 items-center justify-between"></div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          <div
            style={{ width: `${percentage}%` }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getBarColor(
              status
            )}`}
          ></div>
        </div>
      </div>
    </ResponsiveContainer>
  );
};

const AFRGauge = ({ value }) => {
  const minAFR = 12;
  const maxAFR = 18;
  const optimalLow = 14.7;
  const optimalHigh = 14.9;

  const data = [
    { name: "min", value: minAFR },
    { name: "optimal", value: optimalHigh - optimalLow },
    { name: "max", value: maxAFR - optimalHigh },
  ];

  const COLORS = ["#FFDC00", "#2ECC40", "#FFDC00"];

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

const PressureGauge = ({ value, threshold, unit }) => {
  // Similar to RPMGauge, adjust colors as needed
  return <RPMGauge value={value} threshold={threshold} unit={unit} />;
};

const PercentageGauge = ({ value, unit }) => {
  const data = [
    { name: "value", value: value },
    { name: "remaining", value: 100 - value },
  ];
  const COLORS = ["#0088FE", "#EEEEEE"];

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

const DefaultGauge = ({ value, threshold, unit }) => {
  // Fallback to RPMGauge style for any unhandled sensor types
  return <RPMGauge value={value} threshold={threshold} unit={unit} />;
};

const StatusAlert = () => {
  const [sensors, setSensors] = useState([]);
  const [engineHealth, setEngineHealth] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSensor, setEditingSensor] = useState(null);
  const [newThreshold, setNewThreshold] = useState("");

  const prevSensorsRef = useRef();

  useEffect(() => {
    prevSensorsRef.current = sensors;
  });

  const prevSensors = prevSensorsRef.current;

  const fetchSensorData = async () => {
    try {
      const response = await fetch("/api/sensor-readings?latest=true");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // delsoon
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

  const handleEditThreshold = (sensor) => {
    setEditingSensor(sensor);
    setNewThreshold(sensor.threshold.toString());
  };

  const handleSaveThreshold = async () => {
    if (!editingSensor) return;

    try {
      const response = await fetch("/api/update-thresholds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sensor: editingSensor.name,
          newThreshold: parseFloat(newThreshold),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update threshold");
      }

      // Refresh sensor data after updating threshold
      await fetchSensorData();
      setEditingSensor(null);
    } catch (err) {
      console.error("Update threshold error:", err);
      setError("Failed to update threshold");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Normal":
        return "bg-green-500";
      case "Warning":
        return "bg-yellow-500";
      case "Critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) return <StatusSkeleton/>;
  if (error)
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-grow flex-col">
      <h1 className="text-2xl font-bold mb-4 -mt-2">Engine Status</h1>

      {/* Engine Health */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-lg border-gray-200 border-2">
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
      </div>

      {/* Sensor Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {sensors.map((sensor) => {
          const prevSensor = prevSensors
            ? prevSensors.find((s) => s.name === sensor.name)
            : null;
          const isValueChanged =
            prevSensor && prevSensor.value !== sensor.value;

          return (
            <div
              key={sensor.name}
              className="bg-white p-6 rounded-lg shadow-lg border-gray-200 border-2"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">{sensor.name}</h3>
                <div
                  className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(
                    sensor.status
                  )}`}
                >
                  {sensor.status}
                </div>
              </div>
              <GaugeChart sensor={sensor} />
              <div className="flex-grow flex flex-col justify-center items-center">
                <div
                  className={`text-2xl font-bold mb-2 flex-grow flex flex-col justify-center items-center ${
                    isValueChanged
                      ? "transition-all duration-300 transform scale-110"
                      : ""
                  }`}
                >
                  {sensor.value}
                  {sensor.unit}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Threshold: {sensor.threshold}
                  {sensor.unit}
                </div>
              </div>
              {editingSensor?.name === sensor.name ? (
                <div className="flex items-center">
                  <input
                    type="number"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(e.target.value)}
                    className="border rounded px-2 py-1 w-full mr-2"
                  />
                  <button
                    onClick={handleSaveThreshold}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEditThreshold(sensor)}
                  className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  <Settings size={16} className="inline mr-2" /> Set Threshold
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      <div className="bg-white p-6 rounded-lg shadow-lg border-gray-200 border-2">
        <h2 className="text-2xl font-semibold mb-4">Active Alerts</h2>
        {alerts.length > 0 ? (
          <ul className="space-y-2">
            {alerts.map((alert, index) => (
              <li
                key={index}
                className="flex items-center text-yellow-700 bg-yellow-100 p-3 rounded"
              >
                <AlertCircle size={24} className="mr-3" /> {alert}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-green-500 flex items-center">
            <Activity size={24} className="mr-3" /> No active alerts. All
            systems operating normally.
          </p>
        )}
      </div>
    </div>
  );
};

export default StatusAlert;
