"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign } from 'lucide-react';

const PrivateEquityWaterfall = () => {
  // Default values
  const [investmentAmount, setInvestmentAmount] = useState(10000000);
  const [exitMultiple, setExitMultiple] = useState(2.5);
  const [preferredReturn, setPreferredReturn] = useState(8);
  const [catchup, setCatchup] = useState(100);
  const [carryPercentage, setCarryPercentage] = useState(20);
  // Removed tooltip state
  // Initialize waterfallData with default values to prevent undefined properties
  const [waterfallData, setWaterfallData] = useState({
    investment: investmentAmount,
    exitValue: investmentAmount * exitMultiple,
    totalProfit: investmentAmount * exitMultiple - investmentAmount,
    returnOfCapital: investmentAmount,
    preferredReturn: 0,
    catchup: 0,
    lpCarriedInterest: 0,
    gpCarriedInterest: 0,
    totalLPDistribution: investmentAmount,
    totalGPDistribution: 0,
    lpROI: 0,
    gpROIMultiple: 0
  });
  const [chartData, setChartData] = useState([]);
  
  // Calculate waterfall distributions
  useEffect(() => {
    calculateWaterfall();
  }, [investmentAmount, exitMultiple, preferredReturn, catchup, carryPercentage]);
  
  const calculateWaterfall = () => {
    // Calculate exit value
    const exitValue = investmentAmount * exitMultiple;
    const totalProfit = exitValue - investmentAmount;
    
    // Step 1: Return of Capital to LPs
    const returnOfCapital = investmentAmount;
    let remainingProfit = totalProfit;
    
    // Step 2: Preferred Return to LPs
    const preferredReturnAmount = (investmentAmount * preferredReturn / 100);
    const actualPreferredReturn = Math.min(preferredReturnAmount, remainingProfit);
    remainingProfit -= actualPreferredReturn;
    
    // Step 3: GP Catch-up (if applicable and if there's profit left)
    const totalPreferred = returnOfCapital + actualPreferredReturn;
    const gpTargetAmount = (totalPreferred * carryPercentage / (100 - carryPercentage));
    const catchupAmount = Math.min(remainingProfit, gpTargetAmount * catchup / 100);
    remainingProfit -= catchupAmount;
    
    // Step 4: Carried Interest Split
    const lpCarriedInterest = remainingProfit * (100 - carryPercentage) / 100;
    const gpCarriedInterest = remainingProfit * carryPercentage / 100;
    
    // Total distributions
    const totalLPDistribution = returnOfCapital + actualPreferredReturn + lpCarriedInterest;
    const totalGPDistribution = catchupAmount + gpCarriedInterest;
    
    // ROI calculations
    const lpROI = ((totalLPDistribution / investmentAmount) - 1) * 100;
    const gpROIMultiple = totalGPDistribution > 0 ? totalGPDistribution / (investmentAmount * 0.02) : 0; // Assuming 2% GP commitment
    
    // Set the waterfall data for display
    setWaterfallData({
      investment: investmentAmount,
      exitValue,
      totalProfit,
      returnOfCapital,
      preferredReturn: actualPreferredReturn,
      catchup: catchupAmount,
      lpCarriedInterest,
      gpCarriedInterest,
      totalLPDistribution,
      totalGPDistribution,
      lpROI,
      gpROIMultiple
    });
    
    // Prepare chart data
    setChartData([
      { name: 'Return of Capital', LP: returnOfCapital, GP: 0 },
      { name: 'Preferred Return', LP: actualPreferredReturn, GP: 0 },
      { name: 'GP Catch-up', LP: 0, GP: catchupAmount },
      { name: 'Carried Interest', LP: lpCarriedInterest, GP: gpCarriedInterest }
    ]);
  };
  
  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Tooltip component removed
  
  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow">
          <p className="font-bold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-full bg-gray-50 p-4 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Private Equity Waterfall Model</h1>
        
        {/* Explanation block */}
        <div className="mb-6 bg-blue-50 p-4 rounded text-sm text-gray-700">
          <h2 className="text-lg font-semibold mb-2">What is a PE Waterfall?</h2>
          <p className="mb-2">
            A private equity waterfall refers to the method by which capital is distributed to limited partners (LPs) and 
            general partners (GPs) as investments are realized. The structure typically follows four stages:
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li><strong>Return of Capital:</strong> 100% to LPs until they receive their initial investment back</li>
            <li><strong>Preferred Return:</strong> 100% to LPs until they receive their preferred return (hurdle rate)</li>
            <li><strong>GP Catch-up:</strong> 100% (or a percentage) to GPs until they receive their target carry percentage of profits</li>
            <li><strong>Carried Interest:</strong> Remaining profits split according to the carried interest percentage (typically 80/20)</li>
          </ol>
        </div>
        
        {/* Input controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="p-3 bg-gray-50 rounded">
            <label htmlFor="investmentAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Investment ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <DollarSign size={16} />
              </span>
              <input
                id="investmentAmount"
                type="number"
                min="1000000"
                max="1000000000"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                className="pl-10 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Investment amount in dollars"
              />
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded">
            <label htmlFor="exitMultiple" className="block text-sm font-medium text-gray-700 mb-1">
              Exit Multiple (x)
            </label>
            <input
              id="exitMultiple"
              type="number"
              min="1"
              max="10"
              step="0.1"
              value={exitMultiple}
              onChange={(e) => setExitMultiple(Number(e.target.value))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Exit multiple value"
            />
          </div>
          
          <div className="p-3 bg-gray-50 rounded">
            <label htmlFor="preferredReturn" className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Return (%)
            </label>
            <input
              id="preferredReturn"
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={preferredReturn}
              onChange={(e) => setPreferredReturn(Number(e.target.value))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Preferred return percentage"
            />
          </div>
          
          <div className="p-3 bg-gray-50 rounded">
            <label htmlFor="catchup" className="block text-sm font-medium text-gray-700 mb-1">
              GP Catch-up (%)
            </label>
            <input
              id="catchup"
              type="number"
              min="0"
              max="100"
              step="5"
              value={catchup}
              onChange={(e) => setCatchup(Number(e.target.value))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="GP Catch-up percentage"
            />
          </div>
          
          <div className="p-3 bg-gray-50 rounded">
            <label htmlFor="carryPercentage" className="block text-sm font-medium text-gray-700 mb-1">
              Carried Interest (%)
            </label>
            <input
              id="carryPercentage"
              type="number"
              min="10"
              max="30"
              step="1"
              value={carryPercentage}
              onChange={(e) => setCarryPercentage(Number(e.target.value))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Carried interest percentage"
            />
          </div>
        </div>
        
        {/* Visualization */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Distribution Visualization</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis type="category" dataKey="name" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="LP" name="Limited Partners" fill="#3b82f6" barSize={30} />
                <Bar dataKey="GP" name="General Partner" fill="#10b981" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Results table */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Waterfall Results</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    LP Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GP Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Investment Summary */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">Investment</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Initial investment amount
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(waterfallData.investment)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">-</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">Exit Value</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Value at exit ({exitMultiple}x multiple)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(waterfallData.exitValue)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">-</td>
                </tr>
                
                {/* Stage 1 */}
                <tr className="bg-blue-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">Stage 1</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Return of Capital (100% to LPs)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(waterfallData.returnOfCapital)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">$0</td>
                </tr>
                
                {/* Stage 2 */}
                <tr className="bg-blue-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">Stage 2</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Preferred Return ({preferredReturn}% to LPs)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(waterfallData.preferredReturn)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">$0</td>
                </tr>
                
                {/* Stage 3 */}
                <tr className="bg-green-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">Stage 3</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    GP Catch-up ({catchup}%)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">$0</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(waterfallData.catchup)}</td>
                </tr>
                
                {/* Stage 4 */}
                <tr className="bg-green-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">Stage 4</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Carried Interest ({100-carryPercentage}/{carryPercentage} Split)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(waterfallData.lpCarriedInterest)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(waterfallData.gpCarriedInterest)}</td>
                </tr>
                
                {/* Totals */}
                <tr className="bg-gray-100 font-medium">
                  <td className="px-6 py-4 whitespace-nowrap">Totals</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">Total distributions</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(waterfallData.totalLPDistribution)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(waterfallData.totalGPDistribution)}</td>
                </tr>
                
                {/* ROI */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">Return Metrics</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">Return on Investment</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{(waterfallData.lpROI || 0).toFixed(2)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{(waterfallData.gpROIMultiple || 0).toFixed(2)}x</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Footer with attribution */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>This is a simplified model for educational purposes. Actual PE waterfalls may have different structures.</p>
      </div>
    </div>
  );
};

export default PrivateEquityWaterfall;