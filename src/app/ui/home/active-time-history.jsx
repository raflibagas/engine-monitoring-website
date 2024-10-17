"use client";

import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { ActiveTimeHistorySkeleton } from '../skeletons';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ActiveTimeHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const response = await fetch("/api/dashboard/active-time-history");
        await new Promise((resolve) => setTimeout(resolve, 2000)); // delsoon
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setHistoryData(data);
      } catch (err) {
        setError("Failed to load active time history");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoryData();
  }, []);

  const chartData = {
    labels: historyData.map((item) => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: "Active Time (minutes)",
        data: historyData.map((item) => item.activeTime),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const getYAxisConfig = () => {
    const activeTimes = historyData.map((item) => item.activeTime);
    const maxActiveTime = Math.max(...activeTimes);
    const minActiveTime = Math.min(...activeTimes);

    // Calculate a nice step size
    const range = maxActiveTime - minActiveTime;
    const stepSize = Math.pow(10, Math.floor(Math.log10(range))) / 2;

    return {
      min: Math.max(0, Math.floor(minActiveTime / stepSize) * stepSize),
      max: Math.ceil(maxActiveTime / stepSize) * stepSize,
      stepSize: stepSize,
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: isExpanded,
        position: "top",
      },
      title: {
        display: isExpanded,
        text: "Active Time History",
      },
    },
    scales: {
      y: {
        // ...getYAxisConfig(), // Tentative
        title: {
          display: true,
          text: "Minutes",
        },
        ticks: {
          stepSize: 10, // Tentative
          maxTicksLimit: 5,
          callback: function (value) {
            return value;
          },
        },
      },
      x: {
        ticks: {
          maxRotation: isExpanded ? 45 : 0,
          autoSkip: true,
          maxTicksLimit: isExpanded ? 10 : 5,
        },
      },
    },
  };

  if (isLoading) {
    return <ActiveTimeHistorySkeleton />; // This will be replaced by the Skeleton in the parent component
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-300 ease-in-out cursor-pointer ${
        isExpanded ? "fixed inset-0 z-50 p-8" : "p-4"
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {" "}
      <h2 className="text-xl font-semibold mb-4 pb-2 text-white bg-blue-900 -mx-4 -mt-4 p-2 rounded-tr-lg rounded-tl-lg flex flex-col items-center">
        Active Time History
      </h2>
      <div className={isExpanded ? "h-[calc(100vh-200px)]" : "h-48"}>
        <Line data={chartData} options={options} />
      </div>
      {!isExpanded && (
        <div className="mt-2 text-center">
          <span className="text-sm text-blue-600 hover:underline cursor-pointer">
            Click to expand
          </span>
        </div>
      )}
      {isExpanded && (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(false);
          }}
        >
          Close
        </button>
      )}
    </div>
  );
};

export default ActiveTimeHistory;
