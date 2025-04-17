"use client";

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WageGapVisualization = () => {
  const [genderCoefficient, setGenderCoefficient] = useState('');
  
  // Constants for our model
  const baseWage = 30; // β₀
  const educationCoefficient = 60; // β₁
  
  // Generate data points for the chart
  const generateData = () => {
    const educationLevels = [0, 1]; // Normalized education levels
    const numericCoefficient = genderCoefficient === '' ? 0 : Number(genderCoefficient);
    return educationLevels.map(edu => ({
      education: edu,
      maleWage: baseWage + (educationCoefficient * edu),
      femaleWage: baseWage + numericCoefficient + (educationCoefficient * edu),
    }));
  };

  const data = generateData();

  const handleCoefficientChange = (e) => {
    setGenderCoefficient(e.target.value);
  };

  return (
    <div className="w-full bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="p-6">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="education" 
                  label={{ value: 'Education', position: 'insideBottomRight', offset: -10 }}
                  domain={[0, 1]}
                  ticks={[0]}
                />
                <YAxis 
                  domain={[0, 120]}
                  label={{ value: 'Wage', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                <Line 
                  type="linear" 
                  dataKey="maleWage" 
                  stroke="#0052A3" 
                  name="Male Wages"
                  strokeWidth={2}
                />
                <Line 
                  type="linear" 
                  dataKey="femaleWage" 
                  stroke="#007A8C" 
                  name="Female Wages"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 flex items-center justify-center text-lg">
            <span className="font-serif italic">E(wage|female, educ)</span>
            <span className="mx-2">=</span>
            <span className="font-serif italic">β<sub>0</sub> + (</span>
            <input
              type="number"
              value={genderCoefficient}
              onChange={handleCoefficientChange}
              className="mx-2 w-16 text-center border rounded p-1"
            />
            <span className="font-serif italic">) female + β<sub>1</sub>educ</span>
          </div>

          <div className="mt-4 flex justify-center space-x-4 text-sm">
            <div className="px-4 py-2 text-white rounded" style={{ backgroundColor: '#0052A3' }}>
              Male Wages: {baseWage} to {baseWage + educationCoefficient}
            </div>
            <div className="px-4 py-2 text-white rounded" style={{ backgroundColor: '#007A8C' }}>
              Female Wages: {baseWage + (genderCoefficient === '' ? 0 : Number(genderCoefficient))} to {baseWage + (genderCoefficient === '' ? 0 : Number(genderCoefficient)) + educationCoefficient}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WageGapVisualization;