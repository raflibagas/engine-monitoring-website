// app/ui/export/export-date-picker.jsx
import React, { useState, useCallback, memo, useEffect } from "react";

const ExportDatePicker = memo(({ onDateSubmit, selectedDate }) => {
  const currentDate = new Date();

  const parsedDate = selectedDate ? new Date(selectedDate) : currentDate;

  const [year, setYear] = useState(parsedDate.getFullYear());
  const [month, setMonth] = useState(parsedDate.getMonth());
  const [day, setDay] = useState(parsedDate.getDate());

  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      setYear(date.getFullYear());
      setMonth(date.getMonth());
      setDay(date.getDate());
    }
  }, [selectedDate]);

  const handleYearChange = useCallback(
    (e) => {
      const newYear = parseInt(e.target.value);
      setYear(newYear);
      const newDate = new Date(newYear, month, day);
      onDateSubmit(newDate.toISOString().slice(0, 16));
    },
    [month, day, onDateSubmit]
  );

  const handleMonthChange = useCallback(
    (e) => {
      const newMonth = parseInt(e.target.value);
      setMonth(newMonth);
      const newDate = new Date(year, newMonth, day);
      onDateSubmit(newDate.toISOString().slice(0, 16));
    },
    [year, day, onDateSubmit]
  );

  const handleDayChange = useCallback(
    (e) => {
      const newDay = parseInt(e.target.value);
      setDay(newDay);
      const newDate = new Date(year, month, newDay + 1);
      onDateSubmit(newDate.toISOString().slice(0, 16));
    },
    [year, month, onDateSubmit]
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
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="flex space-x-2 w-full">
      <select
        value={year}
        onChange={handleYearChange}
        className="border rounded p-2 bg-white w-1/4"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <select
        value={month}
        onChange={handleMonthChange}
        className="border rounded p-2 bg-white w-2/4"
      >
        {months.map((m, index) => (
          <option key={m} value={index}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={day}
        onChange={handleDayChange}
        className="border rounded p-2 bg-white w-1/4"
      >
        {days.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
});

ExportDatePicker.displayName = "ExportDatePicker";

export default ExportDatePicker;
