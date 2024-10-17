"use client";

import React, { useState, useEffect } from "react";
import { RecentActivitySkeleton } from "../skeletons";

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch("/api/dashboard/recent-activities");
        await new Promise((resolve) => setTimeout(resolve, 2000)); // delsoon
        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }
        const data = await response.json();
        setActivities(data);
      } catch (err) {
        setError("Failed to load recent activities");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 14) return "1 week ago";
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) return <RecentActivitySkeleton />;
  if (error) return <div>{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-gray-200 border">
      <h2 className="text-xl font-semibold mb-4 pb-2 text-white bg-blue-900 -mx-6 -mt-6 p-2 rounded-tr-lg rounded-tl-lg flex flex-col items-center">
        Recent Activity
      </h2>
      <ul>
        {activities.map((activity) => (
          <li
            key={activity.id}
            className="flex justify-between items-center mb-2"
          >
            <span>{activity.activity}</span>
            <span className="text-gray-500">{formatDate(activity.date)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
