"use client";

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Calculator, TrendingUp, DollarSign, Package, AlertCircle } from 'lucide-react';

const BreakEvenCalculator = () => {
  // State for input values
  const [fixedCosts, setFixedCosts] = useState(10000);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState(15);
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState(25);
  
  // Calculate break-even values
  const calculations = useMemo(() => {
    const contributionMargin = sellingPricePerUnit - variableCostPerUnit;
    const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0;
    const breakEvenRevenue = breakEvenUnits * sellingPricePerUnit;
    const contributionMarginRatio = sellingPricePerUnit > 0 ? (contributionMargin / sellingPricePerUnit) * 100 : 0;
    
    return {
      contributionMargin,
      breakEvenUnits,
      breakEvenRevenue,
      contributionMarginRatio,
      isValid: contributionMargin > 0 && sellingPricePerUnit > variableCostPerUnit
    };
  }, [fixedCosts, variableCostPerUnit, sellingPricePerUnit]);

  // Generate data points for the chart
  const chartData = useMemo(() => {
    if (!calculations.isValid) return [];
    
    const maxUnits = Math.max(calculations.breakEvenUnits * 2.5, 100);
    const points = [];
    
    for (let units = 0; units <= maxUnits; units += Math.ceil(maxUnits / 25)) {
      const revenue = units * sellingPricePerUnit;
      const totalCosts = fixedCosts + (units * variableCostPerUnit);
      const profit = revenue - totalCosts;
      
      points.push({
        units,
        revenue,
        totalCosts,
        fixedCosts,
        profit,
        breakEven: units === calculations.breakEvenUnits ? revenue : null
      });
    }
    
    return points;
  }, [fixedCosts, variableCostPerUnit, sellingPricePerUnit, calculations.isValid, calculations.breakEvenUnits]);

  // Handle input changes with validation
  const handleInputChange = (setter, value) => {
    const numValue = parseFloat(value) || 0;
    if (numValue >= 0) {
      setter(numValue);
    }
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-800">{`Units: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: £${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-full">
      {/* Vorticist-inspired decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5" aria-hidden="true">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-blue-600 rotate-45 transform"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border-2 border-purple-600 rotate-12 transform"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 border-2 border-green-600 -rotate-30 transform"></div>
      </div>

      {/* Header with angular design */}
      <div className="text-center mb-8 relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-blue-600 text-white transform rotate-3 shadow-lg">
            <Calculator className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Break-even calculator
          </h1>
        </div>
        <div className="max-w-3xl mx-auto relative">
          <div className="absolute left-0 top-2 w-12 h-0.5 bg-blue-600 transform -rotate-12"></div>
          <div className="absolute right-0 top-2 w-12 h-0.5 bg-purple-600 transform rotate-12"></div>
          <p className="text-gray-700 text-lg leading-relaxed px-8">
            Calculate your break-even point by entering your fixed costs, variable costs per unit and selling price. 
            The calculator will show you how many units you need to sell to cover all costs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Input Section with angular styling */}
        <div className="bg-white rounded-lg shadow-lg border-l-4 border-blue-600 p-8 relative overflow-hidden">
          {/* Subtle geometric background */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5" aria-hidden="true">
            <div className="w-full h-full border-4 border-gray-400 transform rotate-45"></div>
          </div>
          
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-green-600 text-white transform -rotate-2 shadow-md">
              <DollarSign className="w-6 h-6" />
            </div>
            Input your business data
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Fixed Costs */}
            <div className="relative">
              <div className="absolute -top-1 -left-1 w-2 h-8 bg-blue-600 transform rotate-12"></div>
              <label htmlFor="fixed-costs" className="block text-sm font-bold text-gray-800 mb-3 pl-4">
                Fixed costs (£)
              </label>
              <input
                id="fixed-costs"
                type="number"
                min="0"
                step="1"
                value={fixedCosts}
                onChange={(e) => handleInputChange(setFixedCosts, e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all duration-200 text-lg font-medium"
                aria-describedby="fixed-costs-help"
              />
              <p id="fixed-costs-help" className="text-sm text-gray-600 mt-2 pl-4">
                Costs that don't change with production (e.g. rent, salaries)
              </p>
            </div>

            {/* Variable Cost Per Unit */}
            <div className="relative">
              <div className="absolute -top-1 -left-1 w-2 h-8 bg-purple-600 transform -rotate-12"></div>
              <label htmlFor="variable-costs" className="block text-sm font-bold text-gray-800 mb-3 pl-4">
                Variable cost per unit (£)
              </label>
              <input
                id="variable-costs"
                type="number"
                min="0"
                step="0.01"
                value={variableCostPerUnit}
                onChange={(e) => handleInputChange(setVariableCostPerUnit, e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-600 transition-all duration-200 text-lg font-medium"
                aria-describedby="variable-costs-help"
              />
              <p id="variable-costs-help" className="text-sm text-gray-600 mt-2 pl-4">
                Cost to produce each additional unit (e.g. materials, labour)
              </p>
            </div>

            {/* Selling Price Per Unit */}
            <div className="relative">
              <div className="absolute -top-1 -left-1 w-2 h-8 bg-green-600 transform rotate-12"></div>
              <label htmlFor="selling-price" className="block text-sm font-bold text-gray-800 mb-3 pl-4">
                Selling price per unit (£)
              </label>
              <input
                id="selling-price"
                type="number"
                min="0"
                step="0.01"
                value={sellingPricePerUnit}
                onChange={(e) => handleInputChange(setSellingPricePerUnit, e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-600 transition-all duration-200 text-lg font-medium"
                aria-describedby="selling-price-help"
              />
              <p id="selling-price-help" className="text-sm text-gray-600 mt-2 pl-4">
                Price you charge customers for each unit
              </p>
            </div>
          </div>
        </div>

        {/* Results Section with angular cards */}
        <div className="bg-white rounded-lg shadow-lg border-l-4 border-purple-600 p-8 relative overflow-hidden">
          {/* Geometric background element */}
          <div className="absolute bottom-0 left-0 w-24 h-24 opacity-5" aria-hidden="true">
            <div className="w-full h-full border-4 border-gray-400 transform -rotate-45"></div>
          </div>

          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-purple-600 text-white transform rotate-2 shadow-md">
              <TrendingUp className="w-6 h-6" />
            </div>
            Break-even analysis results
          </h2>

          {!calculations.isValid ? (
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6 flex items-center gap-4">
              <div className="p-2 bg-amber-500 text-white transform rotate-12">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-amber-900 font-bold text-lg">Invalid input values</p>
                <p className="text-amber-800">
                  Please ensure that the selling price per unit is greater than the variable cost per unit.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Break-even Units */}
              <div className="relative bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border-2 border-purple-200 transform hover:-rotate-1 transition-transform duration-200">
                <div className="absolute top-2 right-2 w-4 h-4 border-2 border-purple-400 transform rotate-45"></div>
                <div className="flex items-center gap-3 mb-3">
                  <Package className="w-6 h-6 text-purple-700" />
                  <h3 className="font-bold text-purple-900">Break-even units</h3>
                </div>
                <p className="text-3xl font-black text-purple-900 mb-1">
                  {calculations.breakEvenUnits.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-purple-800">Units to sell</p>
              </div>

              {/* Break-even Revenue */}
              <div className="relative bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-2 border-green-200 transform hover:rotate-1 transition-transform duration-200">
                <div className="absolute top-2 right-2 w-4 h-4 border-2 border-green-400 transform -rotate-45"></div>
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-6 h-6 text-green-700" />
                  <h3 className="font-bold text-green-900">Break-even revenue</h3>
                </div>
                <p className="text-3xl font-black text-green-900 mb-1">
                  £{calculations.breakEvenRevenue.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-green-800">Total revenue needed</p>
              </div>

              {/* Contribution Margin */}
              <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-200 transform hover:-rotate-1 transition-transform duration-200">
                <div className="absolute top-2 right-2 w-4 h-4 border-2 border-blue-400 transform rotate-45"></div>
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-700" />
                  <h3 className="font-bold text-blue-900">Contribution margin</h3>
                </div>
                <p className="text-3xl font-black text-blue-900 mb-1">
                  £{calculations.contributionMargin.toFixed(2)}
                </p>
                <p className="text-sm font-medium text-blue-800">Per unit</p>
              </div>

              {/* Contribution Margin Ratio */}
              <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border-2 border-orange-200 transform hover:rotate-1 transition-transform duration-200">
                <div className="absolute top-2 right-2 w-4 h-4 border-2 border-orange-400 transform -rotate-45"></div>
                <div className="flex items-center gap-3 mb-3">
                  <Calculator className="w-6 h-6 text-orange-700" />
                  <h3 className="font-bold text-orange-900">Margin ratio</h3>
                </div>
                <p className="text-3xl font-black text-orange-900 mb-1">
                  {calculations.contributionMarginRatio.toFixed(1)}%
                </p>
                <p className="text-sm font-medium text-orange-800">Of selling price</p>
              </div>
            </div>
          )}
        </div>

        {/* Chart Section using Recharts */}
        {calculations.isValid && (
          <div className="bg-white rounded-lg shadow-lg border-l-4 border-green-600 p-8 relative overflow-hidden">
            {/* Angular decoration */}
            <div className="absolute top-4 right-4 w-8 h-8 border-2 border-green-300 transform rotate-45 opacity-20"></div>
            
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-gray-900">
              <div className="p-2 bg-green-600 text-white transform -rotate-2 shadow-md">
                <TrendingUp className="w-6 h-6" />
              </div>
              Break-even analysis chart
            </h2>
            
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 80, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="units" 
                    tick={{ fontSize: 12, fill: '#4b5563' }}
                    label={{ value: 'Units sold', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#4b5563', fontWeight: 'bold' } }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#4b5563' }}
                    label={{ value: 'Value (£)', angle: -90, position: 'outside', offset: 40, style: { textAnchor: 'middle', fill: '#4b5563', fontWeight: 'bold' } }}
                    tickFormatter={(value) => `£${value.toLocaleString()}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }}
                  />
                  
                  {/* Fixed costs line */}
                  <ReferenceLine 
                    y={fixedCosts} 
                    stroke="#f59e0b" 
                    strokeDasharray="8 4" 
                    strokeWidth={3}
                    label={{ value: "Fixed costs", position: "insideTopRight", fill: "#f59e0b", fontWeight: "bold" }}
                  />
                  
                  {/* Break-even vertical line */}
                  <ReferenceLine 
                    x={calculations.breakEvenUnits} 
                    stroke="#8b5cf6" 
                    strokeDasharray="4 4" 
                    strokeWidth={2}
                    label={{ value: "Break-even", position: "topLeft", fill: "#8b5cf6", fontWeight: "bold" }}
                  />
                  
                  {/* Revenue line - AA compliant green */}
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#059669" 
                    strokeWidth={4}
                    name="Revenue"
                    dot={false}
                    activeDot={{ r: 6, fill: '#059669' }}
                  />
                  
                  {/* Total costs line - AA compliant red */}
                  <Line 
                    type="monotone" 
                    dataKey="totalCosts" 
                    stroke="#dc2626" 
                    strokeWidth={4}
                    name="Total costs"
                    dot={false}
                    activeDot={{ r: 6, fill: '#dc2626' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-green-600 rounded"></div>
                <span className="text-gray-700">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-red-600 rounded"></div>
                <span className="text-gray-700">Total costs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-amber-500 rounded border-dashed border-t-2 border-amber-500"></div>
                <span className="text-gray-700">Fixed costs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-purple-600 rounded border-dashed border-t-2 border-purple-600"></div>
                <span className="text-gray-700">Break-even point</span>
              </div>
            </div>
          </div>
        )}

        {/* Educational Information with angular styling */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-l-4 border-indigo-600 p-8 relative overflow-hidden shadow-lg">
          {/* Decorative geometric elements */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10" aria-hidden="true">
            <div className="w-full h-full border-4 border-indigo-400 transform rotate-12"></div>
            <div className="absolute top-4 left-4 w-8 h-8 border-2 border-indigo-600 transform -rotate-45"></div>
          </div>
          
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-indigo-900">
            <div className="p-2 bg-indigo-600 text-white transform rotate-1 shadow-md">
              <Calculator className="w-6 h-6" />
            </div>
            Understanding break-even analysis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-indigo-800">
            <div className="relative">
              <div className="absolute -left-2 top-0 w-1 h-full bg-indigo-300 transform rotate-2"></div>
              <div className="pl-6">
                <h3 className="font-bold mb-4 text-lg">Key concepts:</h3>
                <ul className="space-y-3">
                  <li><strong className="text-indigo-900">Fixed costs:</strong> Expenses that remain constant regardless of production volume</li>
                  <li><strong className="text-indigo-900">Variable costs:</strong> Costs that change in proportion to production volume</li>
                  <li><strong className="text-indigo-900">Contribution margin:</strong> The difference between selling price and variable cost per unit</li>
                  <li><strong className="text-indigo-900">Break-even point:</strong> The level of sales needed to cover all costs</li>
                </ul>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -left-2 top-0 w-1 h-full bg-indigo-300 transform -rotate-2"></div>
              <div className="pl-6">
                <h3 className="font-bold mb-4 text-lg">How to use this tool:</h3>
                <ul className="space-y-3">
                  <li><strong className="text-indigo-900">1.</strong> Enter your monthly or annual fixed costs</li>
                  <li><strong className="text-indigo-900">2.</strong> Input the variable cost to produce each unit</li>
                  <li><strong className="text-indigo-900">3.</strong> Set your selling price per unit</li>
                  <li><strong className="text-indigo-900">4.</strong> Review the calculated break-even point</li>
                  <li><strong className="text-indigo-900">5.</strong> Use the chart to visualise profit and loss scenarios</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakEvenCalculator;