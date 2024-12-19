// app/ui/insight/date-picker.jsx
import React, { useState, useCallback, memo, useEffect } from "react";

const InsightDatePicker = memo(({ label, onDateChange, selectedDate }) => {
  const currentDate = new Date();

  const parsedDate = selectedDate ? new Date(selectedDate) : currentDate;

  // Initialize with current date if no selectedDate
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      setYear(date.getFullYear());
      setMonth(date.getMonth());
      setDay(date.getDate());
    }
  }, [selectedDate]);

  const updateDate = useCallback(() => {
    if (year && month !== undefined && day) {
      const newDate = new Date(year, month, day);
      // Format date as YYYY-MM-DD
      const formattedDate = newDate.toISOString().split("T")[0];
      onDateChange(formattedDate);
    }
  }, [year, month, day, onDateChange]);

  const handleYearChange = useCallback(
    (e) => {
      const newYear = parseInt(e.target.value);
      setYear(newYear);
      // Create new date with selected values
      const newDate = new Date(newYear, month, day);
      onDateChange(newDate.toISOString().split("T")[0]);
    },
    [month, day, onDateChange]
  );

  const handleMonthChange = useCallback(
    (e) => {
      const newMonth = parseInt(e.target.value);
      setMonth(newMonth);
      // Create new date with selected values
      const newDate = new Date(year, newMonth, day);
      onDateChange(newDate.toISOString().split("T")[0]);
    },
    [year, day, onDateChange]
  );

  const handleDayChange = useCallback(
    (e) => {
      const newDay = parseInt(e.target.value);
      setDay(newDay);
      // Create new date with selected values
      const newDate = new Date(year, month, newDay + 1);
      onDateChange(newDate.toISOString().split("T")[0]);
    },
    [year, month, onDateChange]
  );

  // Generate arrays for dropdowns
  const years = Array.from(
    { length: 10 },
    (_, i) => currentDate.getFullYear() - i
  );
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const daysInMonth =
    month !== "" ? new Date(year, month + 1, 0).getDate() : 31;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const createAndUpdateDate = (newYear, newMonth, newDay) => {
    if (newYear && newMonth !== "" && newDay !== "") {
      // Add 1 to day when creating the date
      const newDate = new Date(
        parseInt(newYear),
        parseInt(newMonth),
        parseInt(newDay) + 1
      );
      onDateChange(newDate.toISOString().split("T")[0]);
    }
  };

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm text-gray-600">{label}</label>
      <div className="flex space-x-2 text-base">
        <select
          value={year}
          onChange={(e) => {
            const newYear = e.target.value;
            setYear(newYear);
            createAndUpdateDate(newYear, month, day);
          }}
          className="border rounded text-center bg-white w-20"
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => {
            const newMonth = e.target.value;
            setMonth(newMonth);
            createAndUpdateDate(year, newMonth, day);
          }}
          className="border rounded bg-white w-28 text-center"
        >
          <option value="">Month</option>
          {months.map((m, index) => (
            <option key={m} value={index}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={day}
          onChange={(e) => {
            const newDay = e.target.value;
            setDay(newDay);
            createAndUpdateDate(year, month, newDay);
          }}
          className="border rounded p-2 bg-white w-1/4 text-center"
        >
          <option value="">Day</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});

InsightDatePicker.displayName = "InsightDatePicker";

export default InsightDatePicker;
