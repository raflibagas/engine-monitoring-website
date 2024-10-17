import React from "react";

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

export function ActiveTimeHistorySkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden bg-gray-100 p-4 rounded-lg shadow`}
    >
      <div className="h-6 bg-gray-100 rounded mb-4 flex items-center justify-center">
        <div className="h-6 bg-gray-200 rounded w-2/4"></div>
      </div>
      <div className="h-40 bg-gray-200 rounded"></div>
      <div className="flex items-center justify-center">
        <div className="mt-4 h-4 w-1/4 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export function EngineStatusSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden bg-gray-100 p-6 rounded-lg shadow mb-`}
    >
      <div className="h-11 bg-gray-100 -mx-6 -mt-6 mb-4 flex items-center justify-center">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      </div>
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="flex justify-between">
          <div className="h-6 bg-gray-200 rounded w-3/5"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        <div className="h-5 bg-gray-200 rounded w-full mt-4"></div>
      </div>
    </div>
  );
}

export function RecentActivitySkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden bg-gray-100 p-6 rounded-lg shadow`}
    >
      <div className="h-11 bg-gray-100 -mx-6 -mt-6 mb-4 flex items-center justify-center">
        <div className="h-6 bg-gray-200 rounded w-2/5"></div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        </div>{" "}
        <div className="flex justify-between">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        </div>{" "}
        <div className="flex justify-between">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        </div>{" "}
      </div>
    </div>
  );
}

export function RecentAlertSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden bg-gray-100 p-6 rounded-lg shadow`}
    >
      <div className="h-11 bg-gray-100 -mx-6 -mt-6 mb-4 flex items-center justify-center">
        <div className="h-6 bg-gray-200 rounded w-2/5"></div>
      </div>
      <div className="space-y-5">
        <div className="flex justify-between">
          <div className="h-5 bg-gray-200 rounded w-2/4"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        </div>{" "}
        <div className="flex justify-between">
          <div className="h-5 bg-gray-200 rounded w-2/4"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-5 bg-gray-200 rounded w-2/4"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        </div>{" "}
        <div className="flex justify-between">
          <div className="h-5 bg-gray-200 rounded w-2/4"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        </div>{" "}
        <div className="flex justify-between">
          <div className="h-5 bg-gray-200 rounded w-2/4"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        </div>{" "}
      </div>
    </div>
  );
}

export function SensorInsightsSkeleton({ sensorName }) {
  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 -mt-4">{sensorName} Insights</h2>

      <div
        className={`${shimmer} relative overflow-hidden bg-white p-6 rounded-lg shadow-lg border-2 flex-grow flex flex-col`}
      >
        <div className="flex justify-between">
          {/* Time range buttons */}
          <div className="flex space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-20"></div>
            ))}
          </div>

          {/* Custom date range */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="h-8 bg-gray-200 rounded w-40"></div>
            <div className="h-8 bg-gray-200 rounded w-40"></div>
            <div className="h-8 bg-gray-200 rounded w-40"></div>
          </div>
        </div>

        {/* Chart area */}
        <div className="flex-grow bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 -mt-2">History</h2>
      <div
        className={`${shimmer} relative overflow-hidden p-6 bg-white rounded-lg shadow-lg border-2 flex flex-grow flex-col`}
      >
        {/* Date filter */}
        <div className="flex items-center space-x-2 mb-4 justify-between">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="flex space-x-2">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>

        {/* Table header */}
        <div className="bg-gray-200 text-white p-2 rounded-t-lg h-10"></div>

        <div className="flex-grow flex flex-col min-h-[510px]">
          <div className="flex-grow bg-gray-200 rounded w-full"></div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-2 mt-4">
          <div className="h-8 bg-gray-200 rounded w-20"></div>

          <div className="h-8 bg-gray-200 rounded w-40"></div>

          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="h-screen flex flex-col">
      <h2 className="text-2xl font-bold mb-4 -mt-2">Activity Log</h2>
      <div
        className={`${shimmer} relative overflow-hidden p-6 bg-white rounded-lg shadow-lg border-2 flex flex-grow flex-col`}
      >
        {/* Date filter */}
        <div className="flex items-center space-x-2 mb-4 justify-between">
          <div className="h-10 bg-gray-200 rounded w-10/12"></div>
          <div className="h-10 bg-gray-200 rounded w-36"></div>
        </div>

        <div className="flex-grow flex flex-col min-h-[510px]">
          <div className="flex-grow bg-gray-200 rounded w-full"></div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-2 mt-4">
          <div className="h-8 bg-gray-200 rounded w-20"></div>

          <div className="h-8 bg-gray-200 rounded w-40"></div>

          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}

export function StatusSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4 -mt-2">Engine Status</h1>
      <div
        className={`${shimmer} overflow-hidden relative flex flex-grow flex-col`}
      >
        {/* Overall Engine Health */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-lg border-2">
          <div className="h-7 bg-gray-200 rounded w-1/3 mb-4 mt-2"></div>
          <div className="h-7 bg-gray-200 rounded w-1/5 mb-2"></div>
        </div>

        {/* Sensor Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="p-4 bg-white rounded-lg shadow-lg border-2"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-32 bg-gray-200 rounded-full w-32 mx-auto mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto mb-2"></div>
            </div>
          ))}
        </div>

        {/* Active Alerts */}
        <div className="p-4 bg-white rounded-lg shadow-lg border-2 flex-grow flex flex-col min-h-[360px] mb-4">
          <div
            className={`${shimmer} h-8 bg-gray-200 rounded w-1/4 mb-4`}
          ></div>
          <div
            className={`${shimmer} flex-grow bg-gray-200 rounded w-full h-48 mb-2`}
          ></div>
        </div>
      </div>
    </div>
  );
}
