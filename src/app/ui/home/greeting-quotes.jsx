import React from "react";

const quotes = [
  "Everything You Can Imagine is Real",
  "The Only Way To Do Great Work Is To Love What You Do",
  "Believe You Can And You're Halfway There",
];

const GreetingQuote = ({ currentTime }) => {
  const hours = currentTime.getHours();
  let greeting;
  if (hours < 12) greeting = "Good Morning";
  else if (hours < 18) greeting = "Good Afternoon";
  else greeting = "Good Evening";

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="relative p-6 rounded-lg shadow border-2 border-blue-900 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('/back.png')",
          filter: "brightness(0.6)", // Adjust this value to make the image darker or lighter
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="text-4xl font-bold text-gray-200">
          {currentTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div className="text-2xl font-semibold text-gray-200 mt-2">
          {greeting}, Hakim
        </div>
        <div className="text-white mt-2 italic">&quot;{randomQuote}&quot;</div>
      </div>
    </div>
  );
};

export default GreetingQuote;
