import React, { useState } from "react";
import { format, subDays, startOfYear } from "date-fns";
import InsightDatePicker from "./insight-date-picker";

const TimeRangeFilter = ({
  onFilterChange,
  selectedRange,
  setSelectedRange,
}) => {
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [dateError, setDateError] = useState("");

  const validateDateRange = (start, end) => {
    if (!start || !end) return true;

    // Convert strings to Date objects
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Check if end date is before start date
    if (endDate < startDate) {
      setDateError("End date must be after start date");
      return false;
    }

    // Calculate difference in years
    const yearDiff = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365);
    if (yearDiff > 1) {
      setDateError("Date range cannot exceed 1 year");
      return false;
    }

    setDateError(""); // Clear any previous errors
    return true;
  };

  const handlePresetChange = (preset) => {
    setSelectedRange(preset); // This line updates the selectedRange state
    let startDate, endDate;
    const today = new Date();
    endDate = today;

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
        startDate = subDays(today, 365);
        break;
      default:
        return;
    }

    onFilterChange(
      format(startDate, "yyyy-MM-dd"),
      format(endDate, "yyyy-MM-dd")
    );
  };

  const handleCustomRangeSubmit = (e) => {
    e.preventDefault();
    if (customStartDate && customEndDate) {
      if (validateDateRange(customStartDate, customEndDate)) {
        setSelectedRange("custom");
        onFilterChange(customStartDate, customEndDate);

        // Clear the date pickers after applying
        setCustomStartDate("");
        setCustomEndDate("");
      }
    } else {
      // Clear any existing custom range
      setSelectedRange("");
      onFilterChange(null, null);
    }
  };

  const handleCustomStartDateChange = (date) => {
    setCustomStartDate(date);
    if (customEndDate) {
      validateDateRange(date, customEndDate);
    }
  };

  const handleCustomEndDateChange = (date) => {
    setCustomEndDate(date);
    if (customStartDate) {
      validateDateRange(customStartDate, date);
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
        <div className="flex space-x-2 mb-2 mt-2">
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
          {/* <button
            onClick={() => handlePresetChange("90d")}
            className={getRangeButtonClass("90d")}
          >
            Last 90d
          </button> */}
          <button
            onClick={() => handlePresetChange("ytd")}
            className={getRangeButtonClass("ytd")}
          >
            Last Year
          </button>
        </div>
        <form
          onSubmit={handleCustomRangeSubmit}
          className="flex items-center space-x-2"
        >
          <div>
            <div className="flex space-x-2">
              <InsightDatePicker
                label="Start Date"
                selectedDate={customStartDate}
                onDateChange={handleCustomStartDateChange}
              />
              <span className="mt-8">to</span>
              <InsightDatePicker
                label="End Date"
                selectedDate={customEndDate}
                onDateChange={handleCustomEndDateChange}
              />
              <button
                type="submit"
                className={`mt-6 px-3 py-2 rounded ${
                  selectedRange === "custom"
                    ? "bg-red-900 text-white"
                    : "bg-blue-900 text-white hover:bg-red-900"
                }`}
              >
                Apply
              </button>
            </div>
            {dateError && (
              <span className="text-red-500 text-sm mt-4 ml-44">
                {dateError}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeRangeFilter;
