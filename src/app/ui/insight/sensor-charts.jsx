import React, { useState, useEffect, useCallback } from "react";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import TimeRangeFilter from "./time-range";
import { SensorInsightsSkeleton } from "../skeletons";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const sensorConfig = {
  RPM: {
    min: 0,
    max: 4000,
    stepSize: 1000,
    unit: "RPM",
  },
  IAT: {
    min: 20,
    max: 120,
    stepSize: 20,
    unit: "°C",
  },
  CLT: {
    min: 20,
    max: 120,
    stepSize: 20,
    unit: "°C",
  },
  AFR: {
    min: 10,
    max: 20,
    stepSize: 1,
    unit: "",
  },
  MAP: {
    min: 0,
    max: 100,
    stepSize: 20,
    unit: "kPa",
  },
  TPS: {
    min: 0,
    max: 100,
    stepSize: 20,
    unit: "%",
  },
};

const SensorChart = ({ sensorName }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [selectedRange, setSelectedRange] = useState("ytd");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      let url = `/api/sensor-insights?sensor=${sensorName}`;
      if (dateRange.startDate && dateRange.endDate) {
        url += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }
      const response = await fetch(url);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // delsoon
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [sensorName, dateRange]);

  // Add fetchData to the useEffect dependency array
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (startDate, endDate) => {
    setDateRange({ startDate, endDate });
  };

  const chartData = {
    labels: data.map((item) => item.date),
    datasets: [
      {
        label: sensorName,
        data: data.map((item) => item[sensorName]),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        position: "top",
      },
      title: {
        display: false,
        text: `${sensorName} Over Time`,
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          stepSize: 3,
          displayFormats: {
            day: "MMM dd",
          },
        },
        ticks: {
          maxTicksLimit: 10,
        },
      },
      y: {
        beginAtZero: sensorConfig[sensorName].min === 0,
        min: sensorConfig[sensorName].min,
        max: sensorConfig[sensorName].max,
        ticks: {
          stepSize: sensorConfig[sensorName].stepSize,
          callback: function (value) {
            return value + sensorConfig[sensorName].unit;
          },
        },
      },
    },
  };

  if (isLoading) return <SensorInsightsSkeleton sensorName={sensorName} />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="h-screen">
      <h1 className="text-2xl font-bold mb-4 -mt-2">{sensorName} Insights</h1>
      <div className="bg-white p-4 rounded-lg shadow-lg border-2 ">
        <TimeRangeFilter
          onFilterChange={handleFilterChange}
          selectedRange={selectedRange}
          setSelectedRange={setSelectedRange}
        />
        <div className="h-[500px]">
          <Line options={options} data={chartData} />
        </div>
      </div>
    </div>
  );
};

export default SensorChart;
