import React, { useState, useEffect } from "react";
import { StatisticsSkeleton } from "../skeletons";

const ActivitySummary = ({ timeRange, activityStats }) => {
  if (!activityStats) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg border-gray-200 border">
      <h2 className="text-lg font-semibold text-white bg-blue-900 p-2 rounded-t-lg text-center">
        Engine Activity Summary
      </h2>
      <div className="p-2">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-2 rounded">
            <div className="text-gray-600 mb-2">Daily Average</div>
            <div className="text-lg font-medium">
              {activityStats.averageDaily} hrs
            </div>
          </div>
          <div className="text-center p-2 rounded">
            <div className="text-gray-600 mb-2">Total Hours</div>
            <div className="text-lg font-medium">
              {activityStats.totalHours} hrs
            </div>
          </div>
          <div className="text-center p-2 rounded">
            <div className="text-gray-600 mb-2">Days Active</div>
            <div className="text-lg font-medium">
              {activityStats.daysActive} days
            </div>
          </div>
          <div className="text-center p-2 rounded">
            <div className="text-gray-600 mb-2">Longest Session</div>
            <div className="text-lg font-medium">
              {activityStats.longestSession} hrs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SensorCard = ({ sensor }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border-gray-200 border">
      <h2 className="text-lg font-semibold text-white bg-blue-900 p-2 rounded-t-lg text-center">
        {sensor.name}
      </h2>
      <div className="p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Average</span>
            <span className="font-medium">
              {sensor.average} {sensor.unit}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Min/Max</span>
            <span className="font-medium">
              {sensor.min} {sensor.unit} / {sensor.max} {sensor.unit}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Warnings</span>
            <span
              className={`font-medium ${
                sensor.warnings > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {sensor.warnings}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SensorStats = () => {
  const [timeRange, setTimeRange] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/stats?timeRange=${timeRange}`);
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  // In your SensorStats component, replace the loading state with:

  if (loading) {
    return <StatisticsSkeleton />;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-5 mt-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Statistics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border rounded bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <ActivitySummary timeRange={timeRange} activityStats={stats?.activity} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats?.sensors.map((sensor) => (
          <SensorCard key={sensor.name} sensor={sensor} />
        ))}
      </div>
    </div>
  );
};

export default SensorStats;
