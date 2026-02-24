"use client";

import React, { useState, useEffect } from 'react';

const API_ENDPOINT = '/test-apps/claude-project-test/api';

export default function MedianCalculator() {
  const [numbers, setNumbers] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [median, setMedian] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchNumbers();
  }, []);

  useEffect(() => {
    calculateMedian();
  }, [numbers]);

  const fetchNumbers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_ENDPOINT);
      const { data } = await res.json();
      const numberEntries = data || [];
      setNumbers(numberEntries);
    } catch (error) {
      console.error("Fetch error:", error);
      // Mock data for preview
      setNumbers([
        { id: 1, data: { value: 10 }, created_at: new Date().toISOString() },
        { id: 2, data: { value: 20 }, created_at: new Date().toISOString() },
        { id: 3, data: { value: 30 }, created_at: new Date().toISOString() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMedian = () => {
    if (numbers.length === 0) {
      setMedian(null);
      return;
    }

    const values = numbers.map(n => n.data.value).sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);

    if (values.length % 2 === 0) {
      setMedian((values[mid - 1] + values[mid]) / 2);
    } else {
      setMedian(values[mid]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const numValue = parseFloat(inputValue);
    
    if (isNaN(numValue)) {
      showMessage('Please enter a valid number', 'error');
      return;
    }

    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          app_id: "MedianCalculator", 
          data: { value: numValue } 
        }),
      });
      
      const result = await res.json();
      
      if (result.success) {
        showMessage('Number added successfully!', 'success');
        setInputValue('');
        fetchNumbers();
      } else {
        showMessage('Failed to add number', 'error');
      }
    } catch (error) {
      console.error("Save error:", error);
      showMessage('Error adding number', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(API_ENDPOINT, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      
      const result = await res.json();
      
      if (result.success) {
        showMessage('Number removed', 'success');
        fetchNumbers();
      } else {
        showMessage('Failed to remove number', 'error');
      }
    } catch (error) {
      console.error("Delete error:", error);
      showMessage('Error removing number', 'error');
    }
  };

  const showMessage = (message, type) => {
    setStatusMessage(message);
    setMessageType(type);
    setTimeout(() => {
      setStatusMessage('');
      setMessageType('');
    }, 3000);
  };

  const getStats = () => {
    if (numbers.length === 0) return null;
    
    const values = numbers.map(n => n.data.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    
    return { min, max, mean, count: values.length };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Median Calculator
          </h1>
          <p className="text-gray-600">
            Add numbers and watch the median update in real-time
          </p>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              messageType === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : messageType === 'error'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}
            role="alert"
          >
            {statusMessage}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Add a Number
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="number-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Number
                </label>
                <input
                  id="number-input"
                  type="number"
                  step="any"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g., 42"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  required
                  aria-label="Number input"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
              >
                Add Number
              </button>
            </form>
          </div>

          {/* Median Display */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <h2 className="text-2xl font-semibold mb-4">Current Median</h2>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
              </div>
            ) : median !== null ? (
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">
                  {median.toFixed(2)}
                </div>
                <p className="text-indigo-100">
                  Based on {numbers.length} number{numbers.length !== 1 ? 's' : ''}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-xl text-indigo-100">
                  No numbers yet. Add one to get started!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Panel */}
        {stats && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Count</p>
                <p className="text-2xl font-bold text-blue-600">{stats.count}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Mean</p>
                <p className="text-2xl font-bold text-green-600">{stats.mean.toFixed(2)}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Min</p>
                <p className="text-2xl font-bold text-orange-600">{stats.min}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Max</p>
                <p className="text-2xl font-bold text-purple-600">{stats.max}</p>
              </div>
            </div>
          </div>
        )}

        {/* Numbers List */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            All Numbers ({numbers.length})
          </h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : numbers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No numbers added yet. Start by adding your first number above.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {numbers.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-indigo-600">
                        {entry.data.value}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Added: {new Date(entry.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 font-medium"
                    aria-label={`Delete number ${entry.data.value}`}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}