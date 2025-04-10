// Example: app/test-app/page.js or a component within your app
"use client";  // Ensure this is a client component if you need useState, useEffect, etc.

import React, { useState } from "react";
import { supabase } from "lib/supabaseClient";

const TestApp = () => {
  const [inputData, setInputData] = useState("");
  const [fetchedData, setFetchedData] = useState([]);
  const [status, setStatus] = useState("");

  // Save data to Supabase
  const saveData = async () => {
    const { error } = await supabase
      .from("app_data") // Table name in your database
      .insert([{ app_id: "TestApp", data: { input: inputData } }]);

    if (error) {
      console.error("Error saving data:", error);
      setStatus("Error saving data.");
    } else {
      setStatus("Data saved successfully!!");
    }
  };

  // Fetch data from Supabase
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("app_data")
      .select("*")
      .eq("app_id", "TestApp");

    if (error) {
      console.error("Error fetching data:", error);
      setStatus("Error fetching data.");
    } else {
      setFetchedData(data);
      setStatus("Data fetched successfully!");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Test App</h1>
      <input
        type="text"
        value={inputData}
        onChange={(e) => setInputData(e.target.value)}
        placeholder="Enter some data"
        className="border p-2"
      />
      <button onClick={saveData} className="bg-blue-600 text-white px-4 py-2 rounded ml-2">
        Save!
      </button>
      <button onClick={fetchData} className="bg-green-600 text-white px-4 py-2 rounded ml-2">
        Fetch!
      </button>
      <p>{status}</p>
      <h3 className="mt-4 font-semibold">Fetched Data:</h3>
      <ul>
        {fetchedData.map((item) => (
          <li key={item.id}>
            {JSON.stringify(item.data)} (Created: {new Date(item.created_at).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TestApp;
