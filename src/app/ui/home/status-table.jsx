"use client";

import React, { useState, useEffect } from "react";
import { InfoIcon } from "lucide-react";
import { EngineStatusSkeleton } from "../skeletons";

const TRANSMISSION_INTERVAL = 10; // minutes
const BUFFER_TIME = 0.5; // 30 seconds buffer in minutes

const EngineStatus = () => {
  const [isActive, setIsActive] = useState(false);
  const [todayActiveTime, setTodayActiveTime] = useState(0);
  const [lastActiveTime, setLastActiveTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEngineStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/dashboard/activity");
        await new Promise((resolve) => setTimeout(resolve, 2000)); //delsoon
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const { isActive, todayActiveTime, latestDataTimestamp } =
          await response.json();

        setIsActive(isActive);
        setTodayActiveTime(
          typeof todayActiveTime === "number" ? todayActiveTime : 0
        );

        if (latestDataTimestamp) {
          const latestDataTime = new Date(latestDataTimestamp);
          if (!isActive) {
            setLastActiveTime(latestDataTime);
          }
        }
      } catch (err) {
        console.error("Error fetching engine status:", err);
        setError("Failed to fetch engine status. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEngineStatus();
    const interval = setInterval(fetchEngineStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const formatLastActiveTime = (date) => {
    if (!date) return "Unknown";
    return date.toLocaleString();
  };

  if (isLoading) return <EngineStatusSkeleton />; // This will be replaced by the Skeleton in the parent component

  if (error)
    return (
      <div className="bg-white p-6 rounded-lg shadow text-red-600">{error}</div>
    );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-gray-200 border">
      <h2 className="text-xl font-semibold mb-4 pb-2 text-white bg-blue-900 -mx-6 -mt-6 p-2 rounded-tr-lg rounded-tl-lg flex flex-col items-center">
        Engine Status and Active Time
      </h2>
      <div className="mb-2">
        Status:{" "}
        <span
          className={
            isActive ? "text-green-600 font-bold" : "text-red-600 font-bold"
          }
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="flex justify-between items-center mb-2">
        <div>Today's total active time: {formatTime(todayActiveTime)}</div>
        <span className="text-sm font-normal text-blue-600 flex items-center">
          <InfoIcon className="w-4 h-4 mr-1" />
          Estimated accuracy: ±5 minutes
        </span>
      </div>
      {!isActive && (
        <div>Last active: {formatLastActiveTime(lastActiveTime)}</div>
      )}
      <p className="text-xs text-gray-500 mt-2">
        *Status and times are estimated based on data transmission intervals
        with a small buffer for potential delays.
      </p>
    </div>
  );
};

export default EngineStatus;
