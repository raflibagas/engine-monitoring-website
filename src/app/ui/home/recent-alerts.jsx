import React, { useState, useEffect } from "react";
import { RecentAlertSkeleton } from "../skeletons";

const RecentAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/dashboard/recent-alerts");
        if (!response.ok) {
          throw new Error("Failed to fetch alerts");
        }
        const data = await response.json();
        setAlerts(data);
      } catch (err) {
        console.error("Error fetching alerts:", err);
        setError("Failed to load recent alerts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getDescriptionColor = (description) => {
    switch (description) {
      case "Above Lower Threshold":
        return "text-red-600";
      case "Below Upper Threshold":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) return <RecentAlertSkeleton />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-gray-200 border">
      <h2 className="text-xl font-semibold items-center flex flex-col mb-4 pb-2 text-white bg-blue-900 -mx-6 -mt-6 p-2 rounded-tr-lg rounded-tl-lg">
        Recent Alerts
      </h2>
      <ul className="space-y-5">
        {alerts.map((alert) => (
          <li key={alert._id} className="flex justify-between items-center">
            <div>
              <span className="text-black">{alert.sensor} - </span>
              <span
                className={`${
                  alert.description.includes("Above")
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {alert.description}
              </span>
            </div>
            <span className="text-gray-500">{formatTime(alert.timestamp)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentAlerts;
