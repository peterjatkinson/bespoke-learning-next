"use client";
import React, { useState, useEffect, useRef } from 'react';
import { PoundSterling, Info } from 'lucide-react';

/**
 * CafePricingExercise - An interactive tool for students to explore 
 * the relationship between price points and total revenue
 */
const CafePricingExercise = () => {
  // Price points and corresponding revenue data
  const pricePoints = [2, 3, 4, 6, 8];
  const revenueData = [500, 600, 480, 360, 240];
  
  // State for the currently selected price index
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0); // Default to £2 (index 0)
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipRef = useRef(null);
  // Track which prices have been selected to build up the chart
  const [selectedPrices, setSelectedPrices] = useState([0]); // Start with £2 selected
  
  // Fixed maximum revenue for y-axis scaling
  const maxRevenue = 600;
  
  // Function to handle the slider change
  const handleSliderChange = (e) => {
    const newIndex = parseInt(e.target.value, 10);
    setSelectedPriceIndex(newIndex);
    
    // Add this price to our selectedPrices array if it's not already there
    if (!selectedPrices.includes(newIndex)) {
      setSelectedPrices([...selectedPrices, newIndex]);
    }
  };

  // Toggle tooltip visibility
  const toggleTooltip = () => {
    setTooltipVisible(!tooltipVisible);
  };

  // Handle click outside to close tooltip
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target) && 
          !event.target.classList.contains('info-icon')) {
        setTooltipVisible(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calculate unit sales based on price and revenue
  const calculateUnitSales = (price, revenue) => {
    return Math.round(revenue / price);
  };

  return (
    <div className="min-h-full bg-blue-50 p-4 md:p-8 rounded-lg">
      <div className="max-w-4xl mx-auto bg-white p-4 md:p-6 rounded-lg shadow-md"
        role="region" aria-label="Cafe pricing and revenue interactive exercise">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-800">
            Campus Café Pricing Exercise
          </h1>
          
          {/* Info button with tooltip */}
          <div className="relative">
            <button 
              onClick={toggleTooltip}
              className="info-icon p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Information about exercise"
              aria-expanded={tooltipVisible}
              aria-controls="info-tooltip"
            >
              <Info className="w-5 h-5 text-blue-600" />
            </button>
            
            {tooltipVisible && (
              <div 
                id="info-tooltip"
                ref={tooltipRef}
                className="absolute right-0 w-64 md:w-80 bg-blue-800 text-white p-3 rounded shadow-lg z-10"
                role="tooltip"
              >
                <p className="text-sm">
                  This exercise demonstrates how pricing affects total revenue. 
                  Adjust the price slider to see how different prices impact your café's revenue.
                </p>
                <div className="text-xs mt-2 border-t border-blue-600 pt-2">
                  The formula for revenue is: <strong>Price × Quantity Sold</strong>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-8">
          <p className="text-lg mb-4">
            Imagine you're opening a new café on campus. You need to decide on the price for your signature coffee drink.
          </p>
          <p className="text-base mb-2">
            As you adjust the price, watch how it affects your total daily revenue based on customer demand.
          </p>
        </div>
        
        {/* Pricing slider section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-700" id="slider-label">
            Set Your Coffee Price
          </h2>
          
          <div className="mb-6">
            <div className="flex items-center justify-center mb-2">
              <div className="flex items-center justify-center bg-blue-800 text-white w-24 h-24 rounded-full shadow-md">
                <PoundSterling className="w-6 h-6 mr-1" aria-hidden="true" />
                <span className="text-3xl font-bold">{pricePoints[selectedPriceIndex]}</span>
              </div>
            </div>
            
            <p className="text-center text-gray-600 mb-4">
              Current price: <span className="font-semibold">£{pricePoints[selectedPriceIndex]}</span>
            </p>
            
            {/* Price slider with accessible labels */}
            <div className="relative px-2">
              <input
                type="range"
                min="0"
                max={pricePoints.length - 1}
                step="1"
                value={selectedPriceIndex}
                onChange={handleSliderChange}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
                aria-labelledby="slider-label"
                aria-valuemin={pricePoints[0]}
                aria-valuemax={pricePoints[pricePoints.length - 1]}
                aria-valuenow={pricePoints[selectedPriceIndex]}
                aria-valuetext={`£${pricePoints[selectedPriceIndex]}`}
              />
              
              {/* Price points markers */}
              <div className="flex justify-between mt-2 px-1">
                {pricePoints.map((price, index) => (
                  <div key={index} className="text-center">
                    <div 
                      className={`w-1 h-3 mx-auto mb-1 ${selectedPriceIndex === index ? 'bg-blue-700' : 'bg-blue-300'}`}
                      aria-hidden="true"
                    ></div>
                    <span className="text-sm text-gray-600">£{price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Results display section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">
            Revenue Analysis
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Summary statistics */}
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-medium mb-3 text-gray-800">Daily Results</h3>
              
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Coffee Price:</dt>
                  <dd className="font-semibold">£{pricePoints[selectedPriceIndex]}</dd>
                </div>
                
                <div className="flex justify-between">
                  <dt className="text-gray-600">Cups Sold:</dt>
                  <dd className="font-semibold">
                    {calculateUnitSales(pricePoints[selectedPriceIndex], revenueData[selectedPriceIndex])}
                  </dd>
                </div>
                
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <dt className="text-gray-800 font-medium">Total Revenue:</dt>
                  <dd className="text-blue-800 font-bold">£{revenueData[selectedPriceIndex]}</dd>
                </div>
              </dl>
            </div>
            
            {/* Revenue bar chart */}
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-medium mb-6 text-gray-800">
                Daily Revenue Chart
              </h3>
              
              <div className="relative h-64 mb-16" aria-hidden="true">
                {/* Y-axis and gridlines - 0 at bottom, 600 at top */}
                <div className="absolute inset-y-0 left-10 flex flex-col justify-between">
                  {Array.from({length: 7}, (_, i) => i).map((i) => (
                    <div key={i} className="flex items-center h-0" 
                         style={{position: 'absolute', bottom: `${(i/6) * 100}%`, left: 0}}>
                      <span className="text-xs text-gray-500 w-8 text-right pr-1">
                        {i === 0 ? '' : i * 100}
                      </span>
                      <div className="w-[calc(100vw-8rem)] md:w-80 h-px bg-gray-100"></div>
                    </div>
                  ))}
                </div>
                
                {/* Y-axis label */}
                <div className="absolute -left-6 top-1/2 -rotate-90 text-sm text-gray-600">
                  Revenue (£)
                </div>
                
                {/* Bars container - positioned at bottom */}
                <div className="absolute left-10 right-4 bottom-0 top-0 flex justify-around">
                  {pricePoints.map((price, index) => (
                    <div 
                      key={index} 
                      className="relative flex flex-col items-center justify-end h-full"
                      style={{ width: `${100 / pricePoints.length}%` }}
                    >
                      {/* Bar - only show if this price has been selected */}
                      {selectedPrices.includes(index) && (
                        <div className="relative w-10 md:w-14 h-full flex flex-col justify-end">
                          {/* The actual bar - growing upward from the bottom */}
                          <div 
                            className={`w-full rounded-t transition-all duration-500 ${
                              selectedPriceIndex === index ? 'bg-blue-700' : 'bg-blue-500'
                            }`}
                            style={{ 
                              height: `${(revenueData[index] / maxRevenue) * 100}%` 
                            }}
                          >
                            {/* Revenue value label above bar */}
                            <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-800 text-white px-2 py-0.5 rounded text-xs font-medium ${
                              selectedPriceIndex === index ? 'animate-pulse' : ''
                            }`}>
                              £{revenueData[index]}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* X-axis label (price) - positioned below x-axis */}
                      <div className="absolute -bottom-6 text-xs text-center text-gray-600 w-full">
                        £{price}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* X-axis line */}
                <div className="absolute left-10 right-4 bottom-0 h-px bg-gray-400"></div>
                
                {/* X-axis label - positioned right below the price values but above the legend */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-sm text-gray-600">
                  Price (£)
                </div>
              </div>
              
              {/* Legend showing which colors represent what - now positioned with margin-top */}
              <div className="flex items-center justify-center">
                <div className="flex items-center mr-4">
                  <div className="w-3 h-3 bg-blue-700 mr-1"></div>
                  <span className="text-xs text-gray-600">Current selection</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 mr-1"></div>
                  <span className="text-xs text-gray-600">Previously selected</span>
                </div>
              </div>
              
              {/* Instructions for building the complete chart */}
              <div className="mt-2 text-center text-xs text-gray-500">
                Try selecting different prices on the slider to build the complete chart
              </div>
              
              {/* Accessible table for screen readers */}
              <table className="sr-only">
                <caption>Revenue data for different price points</caption>
                <thead>
                  <tr>
                    <th scope="col">Price (£)</th>
                    <th scope="col">Revenue (£)</th>
                    <th scope="col">Units Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {pricePoints.map((price, index) => (
                    <tr key={index}>
                      <td>{price}</td>
                      <td>{revenueData[index]}</td>
                      <td>{calculateUnitSales(price, revenueData[index])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Learning insights */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 text-blue-700">
            What You're Learning
          </h2>
          
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="inline-block w-4 h-4 bg-blue-700 rounded-full mt-1 mr-2"></span>
              <span>The relationship between price and revenue isn't always linear</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-4 h-4 bg-blue-700 rounded-full mt-1 mr-2"></span>
              <span>Price elasticity affects the quantity of products sold</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-4 h-4 bg-blue-700 rounded-full mt-1 mr-2"></span>
              <span>Finding the optimal price point maximises revenue</span>
            </li>
          </ul>
          
          <div className="mt-4 p-3 bg-white rounded border-l-4 border-blue-700">
            <p className="text-sm">
              <strong>Observation:</strong> In this scenario, a price of £3 generates the highest revenue (£600).
              Higher or lower prices result in reduced total revenue, demonstrating price elasticity of demand.
            </p>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded border-l-4 border-blue-700">
            <p className="text-sm">
              <strong>Learning tip:</strong> Build the complete bar chart by selecting each price point. 
              When you've seen all price points, you'll have a clear visual of what economists call a 
              'revenue curve', showing how revenue changes at different price points.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafePricingExercise;
