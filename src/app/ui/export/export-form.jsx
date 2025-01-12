// ExportForm Component
"use client";

import { useState } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import ExportDatePicker from "./export-date-picker";

function getDateLimits() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30); // Updated to 30 days

  return {
    minDate: start.toISOString().split("T")[0], // Only get the date part
    maxDate: end.toISOString().split("T")[0], // Only get the date part
  };
}

// Add these helper functions
const calculateDateDifference = (start, end) => {
  const diffTime = new Date(end) - new Date(start);
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return {
    days: Math.floor(diffDays),
    hours: Math.floor((diffDays % 1) * 24),
  };
};

export default function ExportForm() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const { minDate, maxDate } = getDateLimits();

  const validateDateRange = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = (end - start) / (1000 * 60 * 60 * 24);

    if (diffDays > 30) {
      // Updated to 30 days
      setError("Date range cannot exceed 30 days");
      return false;
    }

    if (diffDays < 0) {
      setError("End date must be after start date");
      return false;
    }

    return true;
  };

  const formatDateForFilename = (dateStr) => {
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0].replace(/-/g, "");
  };

  const handleDateRangeSelect = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
    setError("");
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateDateRange()) {
      return;
    }

    setDownloading(true);
    setProgress(0);

    try {
      // Start the download
      const response = await fetch(
        `/api/export?start=${encodeURIComponent(
          startDate
        )}&end=${encodeURIComponent(endDate)}`
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Read the total count from headers
      const totalCount = parseInt(response.headers.get("X-Total-Count"), 10);
      if (isNaN(totalCount) || totalCount === 0) {
        throw new Error("No data available for the selected date range.");
      }

      // Get the reader for streaming
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let receivedRows = 0;
      let buffer = "";

      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Decode the chunk and accumulate in buffer
        buffer += decoder.decode(value, { stream: true });

        // Split buffer into lines
        const lines = buffer.split("\n");
        buffer = lines.pop(); // Keep the last partial line in the buffer

        for (const line of lines) {
          if (line.trim() === "" || line.startsWith("timestamp")) continue; // Skip empty lines and headers
          receivedRows++;

          // Update progress
          const percentComplete = (receivedRows / totalCount) * 100;
          setProgress(Math.min(percentComplete, 100));

          // Collect the chunk for download
          chunks.push(new TextEncoder().encode(line + "\n"));
        }
      }

      // Handle any remaining data in the buffer
      if (buffer.trim() !== "") {
        receivedRows++;
        const percentComplete = (receivedRows / totalCount) * 100;
        setProgress(Math.min(percentComplete, 100));
        chunks.push(new TextEncoder().encode(buffer + "\n"));
      }

      // Combine chunks and download
      const blob = new Blob(chunks, { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sensor-data-${formatDateForFilename(
        startDate
      )}-to-${formatDateForFilename(endDate)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setError(error.message);
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => handleDateRangeSelect(1)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-blue-200 rounded-md"
        >
          Last 24 hours
        </button>
        <button
          type="button"
          onClick={() => handleDateRangeSelect(7)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-blue-200 rounded-md"
        >
          Last 7 days
        </button>
        <button
          type="button"
          onClick={() => handleDateRangeSelect(14)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-blue-200 rounded-md"
        >
          Last 14 days
        </button>
        <button
          type="button"
          onClick={() => handleDateRangeSelect(30)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-blue-200 rounded-md"
        >
          Last 30 days
        </button>
      </div>
      <div className="w-full">
        <div className="flex justify-between w-full">
          <div className="w-[49%]">
            {" "}
            {/* Use percentage width */}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date & Time
            </label>
            <ExportDatePicker
              selectedDate={startDate}
              onDateSubmit={setStartDate}
            />
          </div>
          <div className="w-[49%]">
            {" "}
            {/* Use percentage width */}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date & Time
            </label>
            <ExportDatePicker
              selectedDate={endDate}
              onDateSubmit={setEndDate}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded flex flex-col items-center w-full">
          {error}
        </div>
      )}

      {downloading && (
        <div className="mt-4 w-full">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {Math.round(progress)}% downloaded
          </p>
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={downloading}
        className={`
            flex items-center justify-center gap-2 px-4 py-2 
            rounded-md text-white w-full
            ${
              downloading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }
            `}
      >
        <ArrowDownTrayIcon className="w-5 h-5" />
        {downloading ? "Downloading..." : "Download CSV"}
      </button>
    </div>
  );
}
