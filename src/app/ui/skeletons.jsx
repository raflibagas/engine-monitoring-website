import React from "react";

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

export function ActiveTimeHistorySkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden bg-white p-4 rounded-lg shadow border`}
    >
      <div className="h-6 bg-white rounded mb-4 flex items-center justify-center">
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
      className={`${shimmer} relative overflow-hidden bg-white p-6 rounded-lg shadow border`}
    >
      <div className="h-11 bg-white -mx-6 -mt-6 mb-4 flex items-center justify-center">
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
      className={`${shimmer} relative overflow-hidden bg-white p-6 rounded-lg shadow border`}
    >
      <div className="h-11 bg-white -mx-6 -mt-6 mb-4 flex items-center justify-center">
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
      className={`${shimmer} relative overflow-hidden bg-white p-6 rounded-lg shadow border`}
    >
      <div className="h-11 bg-white -mx-6 -mt-6 mb-4 flex items-center justify-center">
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
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 -mt-2">{sensorName} Insights</h2>

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
      <h2 className="text-2xl font-bold mb-4-mt-2">Activity Log</h2>
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

export function StatisticsSkeleton() {
  return (
    <div className="space-y-5 ">
      <div className="flex justify-between items-center mt-4">
        <h1 className="text-2xl font-bold">Statistics</h1>
        <div className="h-10 bg-gray-200 rounded w-28"></div>
      </div>

      <div
        className={`${shimmer} relative overflow-hidden bg-white border border-gray-200 p-6 rounded-lg shadow h-36`}
      >
        <div className="h-11 bg-white -mx-6 -mt-6 mb-4 flex items-center justify-center">
          <div className="h-6 bg-gray-200 rounded w-1/5"></div>
        </div>
        <div className="space-y-4">
          <div className="flex space-x-64 items-center justify-center">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="flex space-x-72 items-center justify-center">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between space-x-6">
        <div
          className={`${shimmer} relative overflow-hidden bg-white p-4 rounded-lg shadow w-1/3 border border-gray-200`}
        >
          <div className="h-11 bg-white -mx-4 -mt-4 mb-4 flex items-center justify-center text-white rounded-t-lg">
            <div className="h-6 bg-gray-200 rounded w-2/4"></div>
          </div>
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>

        <div
          className={`${shimmer} relative overflow-hidden bg-white p-4 rounded-lg shadow w-1/3 border border-gray-200`}
        >
          <div className="h-11 bg-white -mx-4 -mt-4 mb-4 flex items-center justify-center text-white rounded-t-lg">
            <div className="h-6 bg-gray-200 rounded w-2/4"></div>
          </div>
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>

        <div
          className={`${shimmer} relative overflow-hidden bg-white p-4 rounded-lg shadow w-1/3 border border-gray-200`}
        >
          <div className="h-11 bg-white -mx-4 -mt-4 mb-4 flex items-center justify-center text-white rounded-t-lg">
            <div className="h-6 bg-gray-200 rounded w-2/4"></div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between space-x-6">
        <div
          className={`${shimmer} relative overflow-hidden bg-white p-4 rounded-lg shadow w-1/3 border border-gray-200`}
        >
          <div className="h-11 bg-white -mx-4 -mt-4 mb-4 flex items-center justify-center text-white rounded-t-lg">
            <div className="h-6 bg-gray-200 rounded w-2/4"></div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>

        <div
          className={`${shimmer} relative overflow-hidden bg-white p-4 rounded-lg shadow w-1/3 border border-gray-200`}
        >
          <div className="h-11 bg-white -mx-4 -mt-4 mb-4 flex items-center justify-center text-white rounded-t-lg">
            <div className="h-6 bg-gray-200 rounded w-2/4"></div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>

        <div
          className={`${shimmer} relative overflow-hidden bg-white p-4 rounded-lg shadow w-1/3 border border-gray-200`}
        >
          <div className="h-11 bg-white -mx-4 -mt-4 mb-4 flex items-center justify-center text-white rounded-t-lg">
            <div className="h-6 bg-gray-200 rounded w-2/4"></div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatusSkeleton() {
  return (
    <div className="space-y-5 mb-6">
      <div className="flex justify-between items-center -mt-2">
        <h1 className="text-2xl font-bold">Engine Status</h1>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className={`${shimmer} relative overflow-hidden bg-white p-4 rounded-lg shadow border border-gray-200`}
          >
            {/* Header with sensor name and status */}
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>

            {/* Gauge placeholder */}
            <div className="h-24 flex items-center justify-center">
              <div className="h-16 bg-gray-200 rounded-full w-32"></div>
            </div>

            {/* Value and range */}
            <div className="space-y-4 mt-4">
              <div className="flex justify-center">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="flex justify-center">
                <div className="h-5 bg-gray-200 rounded w-40"></div>
              </div>
            </div>

            {/* Set Thresholds button */}
            <div className="mt-4">
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AlertsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex">
        <h1 className="text-2xl font-bold">Recent Alerts</h1>
      </div>
      <div
        className={`${shimmer} relative overflow-hidden bg-white p-6 rounded-lg shadow border border-gray-200`}
      >
        {/* Header */}
        <div className="bg-white grid grid-cols-3 items-center mb-4">
          <div className="flex items-center">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="flex justify-center gap-2">
            <div className="h-8 bg-gray-200 rounded w-72"></div>
          </div>
          <div className="flex justify-end">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
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
