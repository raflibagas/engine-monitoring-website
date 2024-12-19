"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ActivitySkeleton } from "../skeletons";

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const SearchInput = React.memo(({ value, onChange, inputRef }) => (
  <div className="relative flex-grow mr-4">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <SearchIcon />
    </div>
    <input
      ref={inputRef}
      type="text"
      placeholder="Search activities..."
      value={value}
      onChange={onChange}
      className="px-3 py-2 border rounded-lg w-full pl-10"
    />
  </div>
));
SearchInput.displayName = "SearchInput"; // Cause failed deployment

const MemoizedTableContent = React.memo(
  ({ activities, currentPage, itemsPerPage }) => (
    <tbody className="bg-white">
      {activities.length === 0 ? (
        <tr>
          <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
            No activities found
          </td>
        </tr>
      ) : (
        activities.map((activity, index) => {
          const startNumber = (currentPage - 1) * itemsPerPage + 1;
          return (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {startNumber + index}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {activity.activity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {activity.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(activity.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {activity.performedBy}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Rp {activity.cost}
              </td>
            </tr>
          );
        })
      )}
    </tbody>
  )
);
MemoizedTableContent.displayName = "MemoizedTableContent"; // Cause failed deployment

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalActivities, setTotalActivities] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const searchInputRef = useRef(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [newActivity, setNewActivity] = useState({
    activity: "",
    description: "",
    date: new Date().toISOString(),
    performedBy: "",
    cost: "",
  });
  const [itemsPerPage] = useState(10);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchActivities = useCallback(
    async (page, query) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/activities?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(
            query
          )}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setActivities(data.activities);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
        setTotalActivities(data.totalActivities);
      } catch (err) {
        setError(`Failed to fetch activities: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [itemsPerPage]
  );

  useEffect(() => {
    console.log("Effect triggered. Query:", debouncedSearchQuery);
    fetchActivities(currentPage, debouncedSearchQuery);
  }, [debouncedSearchQuery, currentPage, fetchActivities]);

  useEffect(() => {
    if (searchInputRef.current) {
      const inputElement = searchInputRef.current;
      const selectionStart = inputElement.selectionStart;
      const selectionEnd = inputElement.selectionEnd;

      // Use a microtask to ensure this runs after React's updates
      queueMicrotask(() => {
        inputElement.focus();
        inputElement.setSelectionRange(selectionStart, selectionEnd);
      });
    }
  }, [activities]); // This will run after activities are updated

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "date") {
      const selectedDate = new Date(value);
      const now = new Date();
      selectedDate.setHours(
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds()
      );
      setNewActivity((prev) => ({
        ...prev,
        [name]: selectedDate.toISOString(),
      }));
    } else {
      setNewActivity((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = { ...newActivity };
      if (formData.date) {
        formData.date = new Date(formData.date).toISOString();
      }

      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newActivity),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setSuccessMessage("Activity added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setIsDialogOpen(false);
      fetchActivities(1, debouncedSearchQuery);
      resetForm();
    } catch (err) {
      setError(`Failed to add activity: ${err.message}`);
    }
  };

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handlePageChange = useCallback(
    (page) => {
      setCurrentPage(page);
      fetchActivities(page, debouncedSearchQuery);
    },
    [fetchActivities, debouncedSearchQuery]
  );

  const resetForm = () => {
    setNewActivity({
      activity: "",
      description: "",
      date: new Date().toISOString(),
      performedBy: "",
      cost: "",
    });
  };

  const renderPaginationButtons = () => {
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
        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-red-100 disabled:opacity-50"
      >
        Previous
      </button>
    );

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-lg ${
            currentPage === i
              ? "bg-red-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-red-100"
          }`}
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
        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-red-100 disabled:opacity-50"
      >
        Next
      </button>
    );

    return buttons;
  };

  if (isLoading) return <ActivitySkeleton />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4 -mt-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Activity Log</h1>
        <div className="flex-grow flex justify-center -ml-24">
          {successMessage && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded animate-fade-out"
              role="alert"
            >
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col h-full bg-white shadow-md rounded-lg overflow-hidden border-gray-200 border-2">
        <div className="p-6 bg-white">
          <div className="flex-grow relative flex justify-between items-center">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <SearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              inputRef={searchInputRef}
            />
            <button
              onClick={() => {
                setIsDialogOpen(true);
                resetForm(); // Add this line
              }}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded whitespace-nowrap"
            >
              Add Activity +
            </button>
          </div>
        </div>
        {isDialogOpen && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
            id="my-modal"
          >
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold mb-4">Add New Activity</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="activity"
                  value={newActivity.activity}
                  onChange={handleInputChange}
                  placeholder="Activity Type"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  name="description"
                  value={newActivity.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="date"
                  name="date"
                  value={newActivity.date ? newActivity.date.split("T")[0] : ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  name="performedBy"
                  value={newActivity.performedBy}
                  onChange={handleInputChange}
                  placeholder="Performed By"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="number"
                  name="cost"
                  value={newActivity.cost}
                  onChange={handleInputChange}
                  placeholder="Cost"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add Activity
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="px-6">
          <div className="overflow-x-auto flex-grow">
            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">{error}</div>
            ) : (
              <table className="min-w-full mb-2">
                <thead>
                  <tr className="bg-red-900 text-white">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tl-lg">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Performed By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tr-lg">
                      Cost
                    </th>
                  </tr>
                </thead>
                <MemoizedTableContent
                  activities={activities}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                />
              </table>
            )}
          </div>
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-white flex justify-center items-center">
              <div className="flex space-x-1">{renderPaginationButtons()}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
