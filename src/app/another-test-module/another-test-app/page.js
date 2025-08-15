"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Info, Calculator, ChevronRight, ChevronDown } from 'lucide-react';

const InteractiveNPVDemo = () => {
  // State for the main NPV calculator
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [discountRate, setDiscountRate] = useState(10);
  const [cashFlows, setCashFlows] = useState([
    { year: 1, amount: 30000 },
    { year: 2, amount: 35000 },
    { year: 3, amount: 40000 },
    { year: 4, amount: 45000 },
    { year: 5, amount: 50000 }
  ]);
  
  // State for animations and UI
  const [npv, setNpv] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [activeTab, setActiveTab] = useState('calculator');
  const [animateValue, setAnimateValue] = useState(false);

  // Calculate NPV whenever inputs change
  useEffect(() => {
    calculateNPV();
    // Trigger animation when value changes
    setAnimateValue(true);
    const timer = setTimeout(() => setAnimateValue(false), 600);
    return () => clearTimeout(timer);
  }, [initialInvestment, discountRate, cashFlows]);

  // NPV calculation function
  const calculateNPV = () => {
    let presentValue = 0;
    cashFlows.forEach(flow => {
      presentValue += flow.amount / Math.pow(1 + discountRate / 100, flow.year);
    });
    const netPresentValue = presentValue - initialInvestment;
    setNpv(netPresentValue);
  };

  // Calculate present value for a specific cash flow
  const getPresentValue = (amount, year) => {
    return amount / Math.pow(1 + discountRate / 100, year);
  };

  // Update a specific cash flow
  const updateCashFlow = (index, newAmount) => {
    const updated = [...cashFlows];
    updated[index].amount = parseFloat(newAmount) || 0;
    setCashFlows(updated);
  };

  // Add a new year
  const addYear = () => {
    if (cashFlows.length < 10) {
      setCashFlows([...cashFlows, { 
        year: cashFlows.length + 1, 
        amount: cashFlows[cashFlows.length - 1]?.amount || 30000 
      }]);
    }
  };

  // Remove last year
  const removeYear = () => {
    if (cashFlows.length > 1) {
      setCashFlows(cashFlows.slice(0, -1));
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value}%`;
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            NPV principles demonstrator
          </h1>
          <p className="text-blue-100 text-lg">
            Explore how net present value helps evaluate investment decisions
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex flex-wrap gap-2 bg-white rounded-lg shadow-md p-2">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'calculator'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calculator className="w-4 h-4 inline mr-2" />
            Calculator
          </button>
          <button
            onClick={() => setActiveTab('principles')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'principles'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Info className="w-4 h-4 inline mr-2" />
            Key principles
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        
        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            
            {/* NPV Result Card - Always visible at top */}
            <div className={`bg-white rounded-xl shadow-xl p-6 border-2 ${
              npv >= 0 ? 'border-green-400' : 'border-red-400'
            } transition-all duration-300 ${animateValue ? 'scale-105' : 'scale-100'}`}>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-600 mb-2">Net present value</h2>
                <div className={`text-4xl md:text-5xl font-bold ${
                  npv >= 0 ? 'text-green-600' : 'text-red-600'
                } transition-all duration-300`}>
                  {formatCurrency(npv)}
                </div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  {npv >= 0 ? (
                    <>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-medium">Project is profitable</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-5 h-5 text-red-600" />
                      <span className="text-red-600 font-medium">Project would lose money</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Input Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Investment parameters</h3>
              
              {/* Initial Investment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial investment
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">The upfront cost of the investment</p>
              </div>

              {/* Discount Rate */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount rate: {formatPercentage(discountRate)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #93c5fd 0%, #c084fc ${(discountRate - 1) / 29 * 100}%, #e5e7eb ${(discountRate - 1) / 29 * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1%</span>
                  <span>15%</span>
                  <span>30%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">The required rate of return or cost of capital</p>
              </div>
            </div>

            {/* Cash Flows */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Projected cash flows</h3>
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  {showBreakdown ? 'Hide' : 'Show'} present values
                  {showBreakdown ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>

              <div className="space-y-3">
                {cashFlows.map((flow, index) => (
                  <div key={flow.year} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-16 text-sm font-medium text-gray-600">
                      Year {flow.year}
                    </div>
                    <div className="flex-1 relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={flow.amount}
                        onChange={(e) => updateCashFlow(index, e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                    {showBreakdown && (
                      <div className="flex-shrink-0 w-32 text-right">
                        <div className="text-sm font-medium text-gray-700">
                          {formatCurrency(getPresentValue(flow.amount, flow.year))}
                        </div>
                        <div className="text-xs text-gray-500">Present value</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add/Remove Year Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={addYear}
                  disabled={cashFlows.length >= 10}
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add year
                </button>
                <button
                  onClick={removeYear}
                  disabled={cashFlows.length <= 1}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Remove year
                </button>
              </div>
            </div>

            {/* Detailed Breakdown */}
            {showBreakdown && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <h4 className="font-bold text-gray-800 mb-3">Calculation breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total present value of cash flows:</span>
                    <span className="font-medium">{formatCurrency(cashFlows.reduce((sum, flow) => sum + getPresentValue(flow.amount, flow.year), 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Less initial investment:</span>
                    <span className="font-medium text-red-600">-{formatCurrency(initialInvestment)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Net present value:</span>
                    <span className={npv >= 0 ? 'text-green-600' : 'text-red-600'}>{formatCurrency(npv)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Principles Tab */}
        {activeTab === 'principles' && (
          <div className="space-y-6">
            {/* Time Value of Money */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Time value of money</h3>
              <p className="text-gray-600 mb-4">
                The fundamental principle behind NPV is that money today is worth more than the same amount in the future. This is because:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Money can be invested to earn returns over time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Inflation reduces purchasing power over time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Future cash flows carry uncertainty and risk</span>
                </li>
              </ul>
            </div>

            {/* Discounting */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Discounting future cash flows</h3>
              <p className="text-gray-600 mb-4">
                NPV converts all future cash flows to their present value using the discount rate. The formula for each cash flow is:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-center font-mono text-sm">
                PV = CF / (1 + r)^n
              </div>
              <p className="text-gray-600 mt-4">
                Where CF is the cash flow, r is the discount rate, and n is the number of periods.
              </p>
            </div>

            {/* Decision Rule */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <h3 className="text-xl font-bold text-gray-800 mb-3">The NPV decision rule</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">NPV &gt; 0: Accept the project</p>
                    <p className="text-sm text-gray-600">The investment will add value</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">NPV &lt; 0: Reject the project</p>
                    <p className="text-sm text-gray-600">The investment will destroy value</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">NPV = 0: Indifferent</p>
                    <p className="text-sm text-gray-600">The investment breaks even</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Advantages */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Why use NPV?</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="font-medium text-gray-800">Considers all cash flows</p>
                  <p className="text-sm text-gray-600">Unlike payback period, NPV looks at the entire project life</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="font-medium text-gray-800">Accounts for time value</p>
                  <p className="text-sm text-gray-600">Properly weights cash flows based on when they occur</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="font-medium text-gray-800">Provides absolute value</p>
                  <p className="text-sm text-gray-600">Shows exactly how much value is created or destroyed</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="font-medium text-gray-800">Comparable across projects</p>
                  <p className="text-sm text-gray-600">Can rank multiple investment opportunities objectively</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 bg-gray-100 py-6 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-600">
          <p>NPV is a cornerstone of financial decision-making, helping businesses evaluate investments objectively.</p>
          <p className="mt-2">Experiment with different values to see how changes affect project viability!!</p>
        </div>
      </div>
    </div>
  );
};

export default InteractiveNPVDemo;