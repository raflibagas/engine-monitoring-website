"use client";

import React, { useState, useEffect, useCallback } from "react";
import DatePicker from "./date-picker";
import { HistorySkeleton } from "../skeletons";

const SensorDataTable = () => {
  console.log("SensorDataTable rendered");

  const [sensorData, setSensorData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [noDataMessage, setNoDataMessage] = useState("");

  const fetchData = useCallback(async (page, date) => {
    console.log("fetchData called with:", { page, date });
    setIsLoading(true);
    setError(null);
    setNoDataMessage("");
    try {
      let url = `/api/sensor-readings?page=${page}&limit=10`;
      if (date) {
        // Ensure the time is set to the start of the day in UTC
        const utcDate = new Date(
          Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
        );
        url += `&date=${utcDate.toISOString()}`;
      }
      console.log("Fetching URL:", url);

      const response = await fetch(url);
      console.log("Fetch response:", response.status, response.statusText);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // delsoon
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Received data:", data);
      if (data.readings.length === 0) {
        setNoDataMessage("No data available for the selected date.");
        setSensorData([]);
        setTotalPages(0);
      } else {
        setSensorData(data.readings);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(`Failed to fetch sensor data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("useEffect triggered", { currentPage, selectedDate });
    fetchData(currentPage, selectedDate);
  }, [currentPage, selectedDate, fetchData]);

  const handleDateSubmit = useCallback((date) => {
    console.log("Date submitted:", date);
    // Convert the local date to UTC
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    setSelectedDate(utcDate);
    setCurrentPage(1);
  }, []);

  const handleResetDate = useCallback(() => {
    console.log("Resetting date to today");
    const today = new Date();
    const utcToday = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    );
    setSelectedDate(utcToday);
    setCurrentPage(1);
    fetchData(1, utcToday);
  }, [fetchData]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Create a formatter that assumes the input is in UTC
    const formatter = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Use 24-hour format
    });
    return formatter.format(date);
  };

  const renderPaginationButtons = useCallback(() => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-red-100"
      >
        Previous
      </button>
    );

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-lg  ${
            currentPage === i
              ? "bg-red-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-red-100"
          } `}
        >
          {i}
        </button>
      );
    }

    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-red-100"
      >
        Next
      </button>
    );

    return buttons;
  }, [currentPage, totalPages, handlePageChange]);

  if (isLoading) return <HistorySkeleton/>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4 -mt-2">
      {" "}
      {/* Added container with vertical spacing */}
      {/* Main title outside the table container */}
      <h1 className="text-2xl font-bold text-gray-800">History</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden border-gray-200 border-2">
        <div className="px-6 py-4 bg-white border-gray-200 flex justify-between items-center">
          <h2 className="text-md font-semibold text-blue-800">By Date</h2>
          <DatePicker
            onDateSubmit={handleDateSubmit}
            selectedDate={selectedDate}
          />{" "}
          <button
            onClick={handleResetDate}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Reset
          </button>
        </div>
        <div className="px-6">
          {" "}
          {/* This div adds padding around the table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-4">Loaaaading...</div>
            ) : noDataMessage ? (
              <div className="text-center py-4">{noDataMessage}</div>
            ) : (
              <>
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-red-900 text-white ">
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tl-lg">
                        NO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        RPM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        IAT (°C)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        CLT (°C)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        AFR
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        MAP (kPa)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        TPS (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tr-lg">
                        TIMESTAMP
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {sensorData.map((reading, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reading.RPM}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reading.IAT}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reading.CLT}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reading.AFR}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reading.MAP}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reading.TPS}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(reading.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalPages > 0 && (
                  <div className="px-6 py-4 bg-white flex justify-center items-center">
                    <div className="flex space-x-1">
                      {renderPaginationButtons()}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorDataTable;
