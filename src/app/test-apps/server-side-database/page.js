// Example: app/test-app/page.js (client component)
"use client";

import React, { useState } from "react";

const TestApp = () => {
  const [inputData, setInputData] = useState("");
  const [status, setStatus] = useState("");

  const saveData = async () => {
    const res = await fetch("/test-apps/server-side-database/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: "TestApp", data: { input: inputData } }),
    });

    const response = await res.json();
    if (response.error) {
      setStatus("Error saving data.");
      console.error(response.error);
    } else {
      setStatus("Data saved successfully!");
    }
  };

  return (
    <div>
      <h1>Test App</h1>
      <input
        type="text"
        value={inputData}
        onChange={(e) => setInputData(e.target.value)}
        placeholder="Enter some data"
      />
      <button onClick={saveData}>Save!</button>
      <p>{status}</p>
    </div>
  );
};

export default TestApp;
