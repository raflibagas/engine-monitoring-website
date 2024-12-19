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
import annotationPlugin from "chartjs-plugin-annotation";
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
  TimeScale,
  annotationPlugin
);

// components/sensor-chart.jsx
const sensorConfig = {
  "Revolution Per Minutes": {
    min: 0,
    max: 4000,
    stepSize: 1000,
    unit: "rpm",
    thresholds: {
      min: 1000, // Warning threshold for low RPM
      max: 2000, // Warning threshold for high RPM
    },
  },
  "Intake Air Temperature": {
    min: 10,
    max: 50,
    stepSize: 20,
    unit: "°C",
    thresholds: {
      min: 20,
      max: 40,
    },
  },
  "Coolant Temperature": {
    min: 20,
    max: 120,
    stepSize: 20,
    unit: "°C",
    thresholds: {
      min: 20,
      max: 40,
    },
  },
  "Air-Fuel Ratio": {
    min: 10,
    max: 20,
    stepSize: 1,
    unit: ": 1",
    thresholds: {
      min: 12,
      max: 16,
    },
  },
  "Manifold Absolute Pressure": {
    min: 0,
    max: 100,
    stepSize: 20,
    unit: "kPa",
    thresholds: {
      min: 60,
      max: 120,
    },
  },
  "Throttle Position Sensor": {
    min: 0,
    max: 100,
    stepSize: 20,
    unit: "%",
    thresholds: {
      min: 50,
      max: 90,
    },
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
  const [selectedRange, setSelectedRange] = useState("24h");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      let url = `/api/sensor-insights?sensor=${sensorName}&timeRange=${selectedRange}`;
      if (dateRange.startDate && dateRange.endDate) {
        url += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      console.log("Fetched data:", result);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [sensorName, dateRange, selectedRange]);

  // Add fetchData to the useEffect dependency array
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!sensorName || !sensorConfig[sensorName]) {
    console.error(`Invalid or missing sensor configuration for: ${sensorName}`);
    return <div>Error: Invalid sensor configuration</div>;
  }

  const handleFilterChange = (startDate, endDate) => {
    setDateRange({ startDate, endDate });
  };

  const getTimeConfig = (selectedRange) => {
    switch (selectedRange) {
      case "24h":
        return {
          unit: "hour",
          stepSize: 3,
          displayFormats: {
            hour: "HH:mm",
          },
          ticks: {
            maxTicksLimit: 6,
          },
        };
      case "7d":
        return {
          unit: "day",
          stepSize: 1,
          displayFormats: {
            day: "MMM dd",
          },
        };
      case "30d":
        return {
          unit: "day",
          stepSize: 1,
          displayFormats: {
            day: "MMM dd",
          },
          ticks: {
            maxTicksLimit: 10, // Show approximately one tick per week
          },
        };
      case "90d":
        return {
          unit: "day",
          stepSize: 9,
          displayFormats: {
            day: "MMM dd",
          },
          ticks: {
            maxTicksLimit: 10, // Show approximately one tick per week
          },
        };
      case "ytd":
        return {
          unit: "month",
          stepSize: 1,
          displayFormats: {
            month: "MMM yyyy",
          },
        };
      default:
        return {
          unit: "day",
          stepSize: 1,
          displayFormats: {
            day: "MMM dd",
          },
        };
    }
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
      annotation: {
        drawTime: "afterDatasetsDraw",
        annotations: {
          upperThreshold: {
            type: "line",
            yMin: sensorConfig[sensorName].thresholds.max,
            yMax: sensorConfig[sensorName].thresholds.max,
            borderColor: "rgb(255, 99, 132)",
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              enabled: true,
              content: `Upper Threshold: ${sensorConfig[sensorName].thresholds.max}${sensorConfig[sensorName].unit}`,
              position: "start",
              backgroundColor: "rgb(255, 99, 132)",
              color: "white",
              padding: 4,
              font: {
                size: 12,
              },
            },
          },
          lowerThreshold: {
            type: "line",
            yMin: sensorConfig[sensorName].thresholds.min,
            yMax: sensorConfig[sensorName].thresholds.min,
            borderColor: "rgb(255, 205, 86)",
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              enabled: true,
              content: `Lower Threshold: ${sensorConfig[sensorName].thresholds.min}${sensorConfig[sensorName].unit}`,
              position: "start",
              backgroundColor: "rgb(255, 205, 86)",
              color: "black",
              padding: 4,
              font: {
                size: 12,
              },
            },
          },
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: getTimeConfig(selectedRange),
        grid: {
          display: true,
          drawOnChartArea: true,
          drawTicks: true,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
        },
      },
      y: {
        beginAtZero: sensorConfig[sensorName].min === 0,
        min: sensorConfig[sensorName].min || 0,
        max: sensorConfig[sensorName].max || 100,
        ticks: {
          stepSize: sensorConfig[sensorName].stepSize,
          callback: function (value) {
            return value + sensorConfig[sensorName].unit || "";
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
