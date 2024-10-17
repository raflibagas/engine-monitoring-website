import React, { useState, useCallback, memo } from "react";

const DatePicker = memo(({ onDateSubmit, selectedDate }) => {
  const currentDate = new Date();
  const [year, setYear] = useState(
    selectedDate ? selectedDate.getFullYear() : new Date().getFullYear()
  );
  const [month, setMonth] = useState(
    selectedDate ? selectedDate.getMonth() : new Date().getMonth()
  );
  const [day, setDay] = useState(
    selectedDate ? selectedDate.getDate() : new Date().getDate()
  );

  const handleSubmit = useCallback(() => {
    const date = new Date(year, month, day);
    onDateSubmit(date);
  }, [year, month, day, onDateSubmit]);

  const handleYearChange = useCallback(
    (e) => setYear(parseInt(e.target.value)),
    []
  );
  const handleMonthChange = useCallback(
    (e) => setMonth(parseInt(e.target.value)),
    []
  );
  const handleDayChange = useCallback(
    (e) => setDay(parseInt(e.target.value)),
    []
  );

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
    <div className="flex space-x-2 ">
      <select
        value={year}
        onChange={handleYearChange}
        className="border rounded p-2 bg-white"
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
        className="border rounded p-2 bg-white"
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
        className="border rounded p-2 bg-white"
      >
        {days.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <button
        onClick={handleSubmit}
        className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
      >
        Search
      </button>
    </div>
  );
});

DatePicker.displayName = "DatePicker";

export default DatePicker;
