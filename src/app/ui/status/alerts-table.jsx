"use client";

import React, { useState, useCallback, useEffect } from "react";
import DatePicker from "../history/date-picker";
import { Activity } from "lucide-react";
import { AlertsTableSkeleton } from "../skeletons";

const WorkerStatus = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "processing":
        return "text-blue-500";
      case "idle":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="flex items-center space-x-2">
      <Activity className={`h-4 w-4 ${getStatusColor(status?.status)}`} />
      <span className="text-base">
        Worker: {getStatusText(status?.status)}
        {status?.lastProcessedCount !== undefined &&
          ` (Last processed: ${status.lastProcessedCount} alerts)`}
      </span>
    </div>
  );
};

const AlertsTable = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [workerStatus, setWorkerStatus] = useState(null);

  const fetchAlerts = useCallback(async (page = 1, date = null) => {
    setIsLoading(true);
    setError(null);

    try {
      let url = `/api/alerts?page=${page}&limit=10`;
      if (date) {
        const utcDate = new Date(
          Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
        );
        url += `&date=${utcDate.toISOString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch alerts");

      const data = await response.json();
      setAlerts(data.alerts);
      setTotalPages(data.totalPages);
      setWorkerStatus(data.workerStatus);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts(currentPage, selectedDate);
  }, [fetchAlerts, currentPage, selectedDate]);

  const handleDateSubmit = useCallback((date) => {
    setSelectedDate(date);
    setCurrentPage(1);
  }, []);

  const handleResetDate = useCallback(() => {
    setSelectedDate(null);
    setCurrentPage(1);
  }, []);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    buttons.push(
      <button
        key="prev"
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-lg ${
          currentPage === 1
            ? "text-gray-700 bg-gray-100 cursor-not-allowed disabled:opacity-50"
            : "bg-gray-100 text-gray-700 hover:bg-red-100"
        }`}
      >
        Previous
      </button>
    );

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-lg ${
            currentPage === i
              ? "bg-red-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-red-100"
          }`}
        >
          {i}
        </button>
      );
    }

    buttons.push(
      <button
        key="next"
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-lg disabled:opacity-50 ${
          currentPage === totalPages
            ? "text-gray-700 bg-gray-100 cursor-not-allowed disabled:opacity-50"
            : "bg-gray-100 text-gray-700 hover:bg-red-100"
        }`}
      >
        Next
      </button>
    );

    return buttons;
  };

  if (isLoading) return <AlertsTableSkeleton />;
  if (error)
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recent Alerts</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden border-gray-200 border-2 ">
        <div className="px-6 py-4 bg-white grid grid-cols-3 items-center">
          <div className="flex items-center">
            <WorkerStatus status={workerStatus} />
          </div>
          <div className="flex justify-center">
            <DatePicker
              onDateSubmit={handleDateSubmit}
              selectedDate={selectedDate}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleResetDate}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="px-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-red-900 text-white">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tl-lg">
                    NO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Sensor Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Lower Threshold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Upper Threshold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tr-lg">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {alerts.map((alert, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(currentPage - 1) * 10 + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {alert.sensor}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        alert.description.includes("Above")
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {alert.value.toFixed(2)} {alert.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {alert.lowerThreshold} {alert.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {alert.upperThreshold} {alert.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {alert.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatTimestamp(alert.timestamp)} WIB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-white flex justify-center gap-2">
                {renderPaginationButtons()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsTable;
