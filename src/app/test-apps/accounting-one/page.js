"use client";

import React, { useState, useId, useMemo } from "react";
import { Factory, Info } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";

// Main component for the cost behaviour learning tool
const CostBehaviourTool = () => {
  // State for the number of tables produced
  const [tablesProduced, setTablesProduced] = useState(10);
  
  // Generate unique IDs for accessibility
  const sliderId = useId();
  const inputId = useId();

  // Cost constants based on Laura's business
  const MATERIAL_COST_PER_TABLE = 30; // £30 per table
  const FIXED_RENT_COST = 10000; // £10,000 per year
  const MAX_TABLES = 200;

  // Calculate costs based on current production level
  const variableCost = tablesProduced * MATERIAL_COST_PER_TABLE;
  const fixedCost = FIXED_RENT_COST;
  const totalCost = variableCost + fixedCost;
  
  // Calculate cost per unit (avoiding division by zero)
  const costPerUnit = tablesProduced > 0 ? totalCost / tablesProduced : 0;
  const fixedCostPerUnit = tablesProduced > 0 ? fixedCost / tablesProduced : 0;
  const variableCostPerUnit = MATERIAL_COST_PER_TABLE; // Always £30

  // Format currency values for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Generate chart data with finer granularity for smoother reference line
  const chartData = useMemo(() => {
    const data = [];
    for (let tables = 0; tables <= MAX_TABLES; tables += 5) {
      data.push({
        tables,
        variableCost: tables * MATERIAL_COST_PER_TABLE,
        fixedCost: FIXED_RENT_COST,
        totalCost: FIXED_RENT_COST + (tables * MATERIAL_COST_PER_TABLE),
      });
    }
    return data;
  }, []);

  // Handle slider change
  const handleSliderChange = (e) => {
    setTablesProduced(parseInt(e.target.value, 10));
  };

  // Handle direct input change with validation
  const handleInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= MAX_TABLES) {
      setTablesProduced(value);
    } else if (e.target.value === "") {
      setTablesProduced(1);
    }
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-slate-200 rounded shadow-lg text-xs">
          <p className="font-semibold text-slate-800 mb-1">{label} tables</p>
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

  // Format Y-axis tick values
  const formatYAxis = (value) => `£${(value / 1000).toFixed(0)}k`;

  return (
    <div className="min-h-full bg-slate-50 p-3 md:p-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <header className="text-center mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">
            Understanding cost behaviour
          </h1>
        </header>

        {/* Scenario introduction - compact */}
        <div 
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 mb-4"
          aria-labelledby="scenario-heading"
        >
          <div className="flex items-start gap-2">
            <Factory className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-slate-600 text-sm" id="scenario-heading">
              <strong>Laura's table business:</strong> Material cost of <strong>£30 per table</strong> (variable) 
              and <strong>£10,000/year</strong> workshop rent (fixed). Adjust production to see how costs behave.
            </p>
          </div>
        </div>

        {/* Main content grid */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 md:p-4 mb-4">
          
          {/* Production slider */}
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-grow">
                <label htmlFor={sliderId} className="text-sm font-medium text-slate-700 mb-1 block">
                  Production level
                </label>
                <input
                  id={sliderId}
                  type="range"
                  min="1"
                  max={MAX_TABLES}
                  value={tablesProduced}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  aria-valuemin={1}
                  aria-valuemax={MAX_TABLES}
                  aria-valuenow={tablesProduced}
                  aria-valuetext={`${tablesProduced} tables`}
                />
                <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                  <span>1</span>
                  <span>200 tables</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <label htmlFor={inputId} className="text-sm text-slate-600">Tables:</label>
                <input
                  id={inputId}
                  type="number"
                  min="1"
                  max={MAX_TABLES}
                  value={tablesProduced}
                  onChange={handleInputChange}
                  className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-semibold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Chart */}
          <div 
            className="w-full mb-4"
            role="img"
            aria-label={`Cost graph: variable ${formatCurrency(variableCost)}, fixed ${formatCurrency(fixedCost)}, total ${formatCurrency(totalCost)}`}
          >
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="tables" 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={{ stroke: '#94a3b8' }}
                  axisLine={{ stroke: '#94a3b8' }}
                  label={{ value: 'Tables', position: 'insideBottom', offset: -3, fill: '#475569', fontSize: 11 }}
                />
                <YAxis 
                  tickFormatter={formatYAxis}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={{ stroke: '#94a3b8' }}
                  axisLine={{ stroke: '#94a3b8' }}
                  domain={[0, 16000]}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: '12px' }} />
                
                {/* Vertical marker using ReferenceArea for consistent visibility */}
                <ReferenceArea
                  x1={tablesProduced - 1}
                  x2={tablesProduced + 1}
                  y1={0}
                  y2={16000}
                  fill="#f59e0b"
                  fillOpacity={0.3}
                  stroke="#f59e0b"
                  strokeWidth={1}
                />
                
                <Line type="linear" dataKey="variableCost" name="Variable" stroke="#059669" strokeWidth={2} dot={false} />
                <Line type="linear" dataKey="fixedCost" name="Fixed" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="linear" dataKey="totalCost" name="Total" stroke="#334155" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cost summary - compact horizontal layout */}
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
              <p className="text-xs text-emerald-700">Variable</p>
              <p className="font-bold text-emerald-800 text-sm">{formatCurrency(variableCost)}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-2">
              <p className="text-xs text-blue-700">Fixed</p>
              <p className="font-bold text-blue-800 text-sm">{formatCurrency(fixedCost)}</p>
            </div>
            <div className="bg-slate-100 border border-slate-300 rounded p-2">
              <p className="text-xs text-slate-600">Total</p>
              <p className="font-bold text-slate-800 text-sm">{formatCurrency(totalCost)}</p>
            </div>
          </div>

          {/* Cost per unit - compact table */}
          <div className="border-t border-slate-200 pt-3">
            <h2 className="text-sm font-semibold text-slate-700 mb-2">Cost per table</h2>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-emerald-700">Variable (per unit)</p>
                <p className="font-semibold text-emerald-800">{formatCurrency(variableCostPerUnit)}</p>
              </div>
              <div>
                <p className="text-blue-700">Fixed (per unit)</p>
                <p className="font-semibold text-blue-800">{formatCurrency(fixedCostPerUnit)}</p>
              </div>
              <div>
                <p className="text-slate-600">Total (per unit)</p>
                <p className="font-semibold text-slate-800">{formatCurrency(costPerUnit)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Insight box */}
        <div 
          className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800"
          role="status"
          aria-live="polite"
        >
          {tablesProduced <= 10 && (
            <p><strong>Low production:</strong> Fixed costs spread across few units = high cost per table ({formatCurrency(fixedCostPerUnit)} fixed cost each).</p>
          )}
          {tablesProduced > 10 && tablesProduced <= 50 && (
            <p><strong>Moderate production:</strong> Fixed cost per table dropped to {formatCurrency(fixedCostPerUnit)}. Variable cost stays constant at £30/table.</p>
          )}
          {tablesProduced > 50 && tablesProduced <= 100 && (
            <p><strong>Higher production:</strong> Fixed cost now only {formatCurrency(fixedCostPerUnit)}/table, reducing overall unit costs.</p>
          )}
          {tablesProduced > 100 && (
            <p><strong>High production:</strong> Fixed cost per unit is just {formatCurrency(fixedCostPerUnit)}. Total cost ({formatCurrency(costPerUnit)}/table) approaches the £30 variable cost.</p>
          )}
        </div>

        {/* Key definitions - compact */}
        <details className="bg-white rounded-lg shadow-sm border border-slate-200">
          <summary className="p-3 cursor-pointer text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500" aria-hidden="true" />
            Key definitions
          </summary>
          <div className="px-3 pb-3 space-y-2 text-sm">
            <div className="p-2 bg-emerald-50 border-l-3 border-emerald-500 rounded-r">
              <dt className="font-semibold text-emerald-800">Variable costs</dt>
              <dd className="text-emerald-700 text-xs mt-0.5">Change in proportion to production. If output doubles, variable costs double.</dd>
            </div>
            <div className="p-2 bg-blue-50 border-l-3 border-blue-500 rounded-r">
              <dt className="font-semibold text-blue-800">Fixed costs</dt>
              <dd className="text-blue-700 text-xs mt-0.5">Stay constant regardless of production level.</dd>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default CostBehaviourTool;