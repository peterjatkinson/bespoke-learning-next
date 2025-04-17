"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/**
 * Move this outside the component so it's a constant
 * and not re-created on every render.
 */
const ROI_MULTIPLIERS = {
  social_media: 2.8,
  email: 4.2,
  search_ads: 3.1,
  content: 2.5,
  influencer: 3.4,
};

const MarketingROISimulator = () => {
  const [budgetAllocations, setBudgetAllocations] = useState({
    social_media: "",
    email: "",
    search_ads: "",
    content: "",
    influencer: "",
  });
  const [averageAllocations, setAverageAllocations] = useState(null);
  const [predictedROI, setPredictedROI] = useState(null);
  const [status, setStatus] = useState("");

  /**
   * Instead of reading localStorage directly at render time,
   * we'll track it in state so Next.js doesn't cause SSR mismatch.
   */
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const appId = "MarketingROISimulator";
  const storageKey = `submitted_${appId}`;

  // On the client, once mounted, check localStorage to see if user has submitted:
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasSubmitted(!!window.localStorage.getItem(storageKey));
    }
  }, [storageKey]);

  // Validate that total allocations sum to 100%
  const validateInput = () => {
    const total = Object.values(budgetAllocations).reduce(
      (sum, val) => sum + Number(val || 0),
      0
    );
    if (total !== 100) {
      setStatus("Total allocation must equal 100%");
      return false;
    }
    return true;
  };

  // Calculate the user’s ROI from current allocations
  const calculateROI = (allocations) => {
    return Object.entries(allocations).reduce((total, [channel, percentage]) => {
      return total + (Number(percentage) * ROI_MULTIPLIERS[channel]) / 100;
    }, 0);
  };

  // If no userId in local storage, generate one and store it
  const generateUserId = () => {
    if (typeof window === "undefined") return null;

    const existingUserId = window.localStorage.getItem(storageKey);
    if (existingUserId) return existingUserId;

    const newUserId = `user_${Date.now()}`;
    window.localStorage.setItem(storageKey, newUserId);
    return newUserId;
  };

  // POST: Submit allocations & ROI to the server
  const handleSubmit = async () => {
    if (!validateInput()) return;

    // If user already submitted, short-circuit
    if (hasSubmitted) {
      setStatus("You have already submitted your allocations.");
      return;
    }

    const roi = calculateROI(budgetAllocations);
    setPredictedROI(roi);

    try {
      const userId = generateUserId();
      if (!userId) {
        setStatus("Could not generate user ID.");
        return;
      }

      const res = await fetch("/test-apps/marketing-dashboard/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: appId,
          data: {
            budgetAllocations,
            predictedROI: roi,
            userId,
          },
        }),
      });

      const response = await res.json();
      if (!res.ok) {
        console.error("Error saving data:", response.error);
        setStatus("Error saving data");
        return;
      }

      setStatus("Submission saved successfully!");
      // Mark as submitted in local storage & state
      window.localStorage.setItem(storageKey, userId);
      setHasSubmitted(true);

      // Fetch & recalc class average
      await fetchResults();
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("Error saving data");
    }
  };

  // DELETE: Reset this user’s submission
  const resetSubmission = async () => {
    if (typeof window === "undefined") return;

    const userId = window.localStorage.getItem(storageKey);
    if (!userId) {
      setStatus("No submission to reset.");
      return;
    }

    try {
      const res = await fetch("/test-apps/marketing-dashboard/api", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_id: appId, userId }),
      });

      const response = await res.json();
      if (!res.ok) {
        console.error("Error resetting submission:", response.error);
        setStatus("Error resetting submission.");
        return;
      }

      setStatus("Submission reset successfully.");
      window.localStorage.removeItem(storageKey);
      setHasSubmitted(false);

      setBudgetAllocations({
        social_media: "",
        email: "",
        search_ads: "",
        content: "",
        influencer: "",
      });
      setPredictedROI(null);

      // Refresh results
      await fetchResults();
    } catch (error) {
      console.error("Reset submission error:", error);
      setStatus("Error resetting submission.");
    }
  };

  /**
   * GET: Fetch data for this app & current year, then compute average.
   * We define this with useCallback so it doesn't change every render.
   * Dependencies: just appId (ROI_MULTIPLIERS is outside as a constant).
   */
  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch(`/test-apps/marketing-dashboard/api?app_id=${appId}`);
      const response = await res.json();

      if (!res.ok) {
        console.error("Error fetching data:", response.error);
        setStatus("Error fetching data");
        return;
      }

      if (response.data && response.data.length > 0) {
        const submissions = response.data;
        const totals = {};
        const channels = Object.keys(ROI_MULTIPLIERS);
        const count = submissions.length;

        channels.forEach((channel) => {
          totals[channel] =
            submissions.reduce((sum, sub) => {
              // sub = { id, created_at, data: {...} }
              return sum + Number(sub.data.budgetAllocations[channel] || 0);
            }, 0) / count;
        });

        setAverageAllocations(totals);
      } else {
        // no data returned
        setAverageAllocations(null);
      }
    } catch (error) {
      console.error("Fetch results error:", error);
      setStatus("Error fetching data");
    }
  }, [appId]);

  // Run fetchResults once on mount (or if appId changes)
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Build chart data for Recharts
  const prepareChartData = () => {
    if (!averageAllocations) return [];

    return Object.entries(averageAllocations).map(([channel, value]) => ({
      channel: channel
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      allocation: value,
      roi: Number(((value * ROI_MULTIPLIERS[channel]) / 100).toFixed(2)),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-center text-gray-700 mb-4">
          Marketing Channel ROI Simulator
        </h1>

        <p className="text-sm text-gray-500 mb-6 text-center">
          Allocate your marketing budgets across different channels
          (total must equal 100%). See how your strategy compares to
          the class average and predicted ROI.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {Object.entries(budgetAllocations).map(([channel, value]) => (
            <div key={channel}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {channel
                  .split("_")
                  .map(
                    (word) => word.charAt(0).toUpperCase() + word.slice(1)
                  )
                  .join(" ")}{" "}
                (%)
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) =>
                  setBudgetAllocations((prev) => ({
                    ...prev,
                    [channel]: e.target.value,
                  }))
                }
                disabled={hasSubmitted}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-200"
                min="0"
                max="100"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={hasSubmitted}
          className={`w-full py-2 px-4 rounded transition duration-200 ${
            hasSubmitted
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Calculate ROI
        </button>

        {status && (
          <p className="text-center mt-4 text-sm text-gray-600">
            {status}
          </p>
        )}

        {predictedROI !== null && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">
              Your Predicted ROI: {predictedROI.toFixed(2)}
            </h2>
          </div>
        )}

        <button
          onClick={resetSubmission}
          className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
        >
          Reset Submission
        </button>

        {averageAllocations && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              Class Average Allocations & ROI
            </h2>
            <div className="overflow-x-auto">
              <BarChart
                width={600}
                height={300}
                data={prepareChartData()}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="channel"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="allocation" name="Allocation (%)" fill="#8884d8" />
                <Bar dataKey="roi" name="ROI Impact" fill="#82ca9d" />
              </BarChart>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingROISimulator;
