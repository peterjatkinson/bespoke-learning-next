"use client";

import React, { useState, useEffect } from "react";

const AverageCalculator = () => {
  const [inputNumber, setInputNumber] = useState("");
  const [average, setAverage] = useState(null);
  const [status, setStatus] = useState("");
  const [allInputs, setAllInputs] = useState([]);

  // Identifiers for this specific app:
  const appId = "AverageCalculator";
  const storageKey = `submitted_${appId}`;

  // Check localStorage to see if user has already submitted:
  // (This check should be done inside a useEffect or conditionally, since window is undefined on the server)
  const hasSubmitted =
    typeof window !== "undefined" && window.localStorage.getItem(storageKey);

  // Fetch the latest average on component mount:
  useEffect(() => {
    fetchAverage();
  }, []);

  // Helper to generate or reuse a user ID in localStorage:
  const generateUserId = () => {
    const existingUserId =
      typeof window !== "undefined" && window.localStorage.getItem(storageKey);
    if (existingUserId) return existingUserId;

    const newUserId = `user_${Date.now()}`;
    return newUserId;
  };

  // POST to API route to save the number
  const saveNumber = async () => {
    if (!inputNumber || isNaN(inputNumber)) {
      setStatus("Please enter a valid number.");
      return;
    }

    if (hasSubmitted) {
      setStatus("You have already submitted a number for this app.");
      return;
    }

    const userId = generateUserId();

    try {
      const res = await fetch("/test-apps/average-calculator/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: appId,
          data: {
            number: Number(inputNumber),
            userId,
          },
        }),
      });

      const response = await res.json();

      if (!res.ok) {
        setStatus("Error saving number.");
        console.error("API Error:", response.error);
        return;
      }

      // Success:
      setStatus("Number saved successfully!");
      setInputNumber("");
      window.localStorage.setItem(storageKey, userId); // Mark as submitted
      fetchAverage(); // Refresh the average
    } catch (error) {
      console.error("Save number request failed:", error);
      setStatus("Error saving number.");
    }
  };

  // GET from API route to fetch numbers and compute average
  const fetchAverage = async () => {
    try {
      const res = await fetch(`/test-apps/average-calculator/api?app_id=${appId}`);
      const response = await res.json();

      if (!res.ok) {
        setStatus("Error fetching numbers.");
        console.error("API Error:", response.error);
        return;
      }

      setAllInputs(response.numbers || []);
      setAverage(response.average || 0);
      setStatus("");
    } catch (error) {
      console.error("Fetch average request failed:", error);
      setStatus("Error fetching numbers.");
    }
  };

  // DELETE from API route to reset user's submission
  const resetSubmission = async () => {
    const userId =
      typeof window !== "undefined" &&
      window.localStorage.getItem(storageKey);

    if (!userId) {
      setStatus("No submission to reset.");
      return;
    }

    try {
      const res = await fetch("/test-apps/average-calculator/api", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: appId,
          userId,
        }),
      });

      const response = await res.json();

      if (!res.ok) {
        setStatus("Error resetting submission.");
        console.error("API Error:", response.error);
        return;
      }

      setStatus("Submission reset successfully.");
      window.localStorage.removeItem(storageKey);
      fetchAverage();
    } catch (error) {
      console.error("Reset submission request failed:", error);
      setStatus("Error resetting submission.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-700 mb-4">
          Average Calculator
        </h1>

        <p className="text-sm text-gray-500 mb-6 text-center">
          Enter a number below, and we&apos;ll calculate the average of all
          submissions for this app.
        </p>

        <div className="mb-4">
          <input
            type="number"
            value={inputNumber}
            onChange={(e) => setInputNumber(e.target.value)}
            placeholder="Enter a number"
            disabled={hasSubmitted}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
          />
        </div>

        <button
          onClick={saveNumber}
          disabled={hasSubmitted}
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Submit
        </button>

        <div className="mt-6 border-t pt-4">
          <h2 className="text-lg font-semibold text-gray-700 text-center">
            Results
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            <strong>All Inputs:</strong>{" "}
            {allInputs.length ? allInputs.join(", ") : "No data yet"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            <strong>Average:</strong>{" "}
            {average !== null ? average.toFixed(2) : "No data yet"}
          </p>
        </div>

        <button
          onClick={resetSubmission}
          className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Reset Submission
        </button>

        <p className="text-center text-sm text-red-500 mt-2">{status}</p>
      </div>
    </div>
  );
};

export default AverageCalculator;
