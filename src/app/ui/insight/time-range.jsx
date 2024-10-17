import React, { useState } from "react";
import { format, subDays, startOfYear } from "date-fns";

const TimeRangeFilter = ({
  onFilterChange,
  selectedRange,
  setSelectedRange,
}) => {
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const handlePresetChange = (preset) => {
    setSelectedRange(preset); // This line updates the selectedRange state
    let startDate, endDate;
    const today = new Date();

    switch (preset) {
      case "24h":
        startDate = subDays(today, 1);
        break;
      case "7d":
        startDate = subDays(today, 7);
        break;
      case "30d":
        startDate = subDays(today, 30);
        break;
      case "90d":
        startDate = subDays(today, 90);
        break;
      case "ytd":
        startDate = startOfYear(today);
        break;
      default:
        return;
    }

    onFilterChange(
      format(startDate, "yyyy-MM-dd"),
      format(today, "yyyy-MM-dd")
    );
  };

  const handleCustomRangeSubmit = (e) => {
    e.preventDefault();
    if (customStartDate && customEndDate) {
      setSelectedRange("custom"); // This line updates the selectedRange state for custom range
      onFilterChange(customStartDate, customEndDate);
    }
  };

  const getRangeButtonClass = (range) => {
    return `px-3 py-1 rounded ${
      selectedRange === range
        ? "bg-red-900 text-white"
        : "bg-gray-200 text-gray-700 hover:bg-red-100"
    }`;
  };

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex space-x-2 mb-2">
          <button
            onClick={() => handlePresetChange("24h")}
            className={getRangeButtonClass("24h")}
          >
            Last 24h
          </button>
          <button
            onClick={() => handlePresetChange("7d")}
            className={getRangeButtonClass("7d")}
          >
            Last 7d
          </button>
          <button
            onClick={() => handlePresetChange("30d")}
            className={getRangeButtonClass("30d")}
          >
            Last 30d
          </button>
          <button
            onClick={() => handlePresetChange("90d")}
            className={getRangeButtonClass("90d")}
          >
            Last 90d
          </button>
          <button
            onClick={() => handlePresetChange("ytd")}
            className={getRangeButtonClass("ytd")}
          >
            Year to Date
          </button>
        </div>
        <form
          onSubmit={handleCustomRangeSubmit}
          className="flex items-center space-x-2"
        >
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <span>to</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button
            type="submit"
            className={`px-3 py-1 rounded ${
              selectedRange === "custom"
                ? "bg-red-900 text-white"
                : "bg-blue-900 text-white hover:bg-red-900"
            }`}
          >
            Apply Custom Range
          </button>
        </form>
      </div>
    </div>
  );
};

export default TimeRangeFilter;
