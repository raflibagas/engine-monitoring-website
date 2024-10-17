"use client";

import React, { useState, useEffect, Suspense } from "react";
import GreetingQuote from "./greeting-quotes";
import EngineStatus from "./status-table";
import RecentActivity from "./recent-activity";
import ActiveTimeHistory from "./active-time-history";
import RecentAlerts from "./recent-alerts";
import { ActiveTimeHistorySkeleton, EngineStatusSkeleton } from "../skeletons";

const HomeDash = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full">
      <h1 className="text-2xl font-bold text-black mb-4 -mt-2">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6">
        <GreetingQuote currentTime={currentTime} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EngineStatus />
          <RecentActivity />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* <Suspense fallback={<ActiveTimeHistorySkeleton />}>
            <ActiveTimeHistory />
          </Suspense> */}
          <ActiveTimeHistory />
          <RecentAlerts />
        </div>
      </div>
    </div>
  );
};

export default HomeDash;
