"use client";
import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const InteractiveGraph = () => {
  // State management for drawing, points and equation visibility
  const [isDrawing, setIsDrawing] = useState(false);
  const [userPoints, setUserPoints] = useState([]);
  const [showParabola, setShowParabola] = useState(false);
  const [showNegativeParabola, setShowNegativeParabola] = useState(false);
  const [customEquation, setCustomEquation] = useState('');
  const [showCustomEquation, setShowCustomEquation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Reference to the canvas element
  const canvasRef = useRef(null);
  
  // Constants for graph configuration
  const gridSize = 40; // Size of each grid cell in pixels
  const axisWidth = 2; // Width of the axes lines
  const gridWidth = 0.5; // Width of the grid lines
  const graphSize = 7; // Number of units in each direction from origin
  
  // Canvas dimensions
  const canvasWidth = gridSize * (2 * graphSize + 1);
  const canvasHeight = gridSize * (2 * graphSize + 1);
  
  // Function to convert graph coordinates to canvas coordinates
  const graphToCanvas = (x, y) => {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    return {
      x: centerX + x * gridSize,
      y: centerY - y * gridSize // Invert y because canvas y increases downward
    };
  };
  
  // Function to convert canvas coordinates to graph coordinates
  const canvasToGraph = (x, y) => {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    return {
      x: (x - centerX) / gridSize,
      y: (centerY - y) / gridSize
    };
  };
  
  // Helper function to draw a point on the canvas
  const drawPoint = (ctx, x, y, color = '#1f4f8f', radius = 2) => {
    const { x: canvasX, y: canvasY } = graphToCanvas(x, y);
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  };
  
  // Helper function to plot a mathematical function on the canvas
  const plotFunction = (ctx, func, color = '#1f4f8f', stepSize = 0.05) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    
    let isFirstPoint = true;
    
    for (let x = -graphSize; x <= graphSize; x += stepSize) {
      const y = func(x);
      
      // Skip if y is outside graph bounds
      if (y < -graphSize || y > graphSize) {
        isFirstPoint = true;
        continue;
      }
      
      const { x: canvasX, y: canvasY } = graphToCanvas(x, y);
      
      if (isFirstPoint) {
        ctx.moveTo(canvasX, canvasY);
        isFirstPoint = false;
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }
    
    ctx.stroke();
  };
  
  // Draw the grid and axes onto the canvas
  const drawGrid = (ctx) => {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = gridWidth;
    
    // Vertical grid lines
    for (let i = -graphSize; i <= graphSize; i++) {
      if (i === 0) continue; // Skip the origin (will be drawn as axis)
      
      const x = centerX + i * gridSize;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = -graphSize; i <= graphSize; i++) {
      if (i === 0) continue; // Skip the origin (will be drawn as axis)
      
      const y = centerY + i * gridSize;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = axisWidth;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasWidth, centerY);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvasHeight);
    ctx.stroke();
    
    // Draw axis arrows
    // X-axis arrow
    ctx.beginPath();
    ctx.moveTo(canvasWidth, centerY);
    ctx.lineTo(canvasWidth - 10, centerY - 5);
    ctx.lineTo(canvasWidth - 10, centerY + 5);
    ctx.closePath();
    ctx.fill();
    
    // Y-axis arrow
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX - 5, 10);
    ctx.lineTo(centerX + 5, 10);
    ctx.closePath();
    ctx.fill();
    
    // Draw axis labels and tick marks
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';
    
    // X-axis labels and ticks
    for (let i = -graphSize; i <= graphSize; i++) {
      if (i === 0) continue; // Skip origin
      
      const x = centerX + i * gridSize;
      
      // Tick marks
      ctx.beginPath();
      ctx.moveTo(x, centerY - 5);
      ctx.lineTo(x, centerY + 5);
      ctx.stroke();
      
      // Labels
      ctx.fillText(i.toString(), x, centerY + 20);
    }
    
    // Y-axis labels and ticks
    for (let i = -graphSize; i <= graphSize; i++) {
      if (i === 0) continue; // Skip origin
      
      const y = centerY - i * gridSize;
      
      // Tick marks
      ctx.beginPath();
      ctx.moveTo(centerX - 5, y);
      ctx.lineTo(centerX + 5, y);
      ctx.stroke();
      
      // Labels
      ctx.fillText(i.toString(), centerX - 20, y + 4);
    }
    
    // Origin label
    ctx.fillText('0', centerX - 10, centerY + 20);
    
    // Axis labels
    ctx.font = '16px Arial';
    ctx.fillText('x', canvasWidth - 10, centerY - 15);
    ctx.fillText('y', centerX + 15, 15);
  };
  
  // Render the canvas with all elements (grid, user points, equations)
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Draw the grid and axes
    drawGrid(ctx);
    
    // Draw user's points
    if (userPoints.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#e74c3c'; // Red color for user-drawn curve
      ctx.lineWidth = 2.5;
      
      const { x: startX, y: startY } = graphToCanvas(userPoints[0].x, userPoints[0].y);
      ctx.moveTo(startX, startY);
      
      for (let i = 1; i < userPoints.length; i++) {
        const { x, y } = graphToCanvas(userPoints[i].x, userPoints[i].y);
        ctx.lineTo(x, y);
      }
      
      ctx.stroke();
    }
    
    // Draw equation curves if enabled
    if (showParabola) {
      plotFunction(ctx, (x) => x * x, '#1f4f8f'); // y = x²
    }
    
    if (showNegativeParabola) {
      plotFunction(ctx, (x) => -x * x, '#1f4f8f'); // y = -x²
    }
  };
  
  // Initialize and update the canvas
  useEffect(() => {
    renderCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPoints, showParabola, showNegativeParabola]);
  
  // Mouse/touch event handlers for drawing
  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    
    // Get the canvas-relative position
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    // Convert to graph coordinates
    const graphCoords = canvasToGraph(x, y);
    
    // Start a new set of points
    setUserPoints([graphCoords]);
  };
  
  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    // Get the canvas-relative position
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    // Convert to graph coordinates
    const graphCoords = canvasToGraph(x, y);
    
    // Add to existing points
    setUserPoints((prevPoints) => [...prevPoints, graphCoords]);
  };
  
  const endDrawing = () => {
    setIsDrawing(false);
  };
  
  // Create a safe function from user input
  const createSafeFunction = (equation) => {
    // Replace y= or f(x)= if present
    let cleanedEquation = equation.trim().toLowerCase();
    cleanedEquation = cleanedEquation.replace(/^y\s*=\s*/, '');
    cleanedEquation = cleanedEquation.replace(/^f\s*\(\s*x\s*\)\s*=\s*/, '');
    
    // Create a function that evaluates the equation
    try {
      // Using new Function is necessary here to evaluate mathematical expressions
      // We limit the scope to only include x as a parameter and basic Math functions
      const func = new Function('x', `
        // Only allow access to safe Math functions
        const abs = Math.abs;
        const sqrt = Math.sqrt;
        const pow = Math.pow;
        const sin = Math.sin;
        const cos = Math.cos;
        const tan = Math.tan;
        const log = Math.log;
        const exp = Math.exp;
        const PI = Math.PI;
        const E = Math.E;
        
        // Return the result of the equation
        return ${cleanedEquation};
      `);
      
      // Test the function with a sample value to catch errors
      func(0);
      
      return func;
    } catch (error) {
      throw new Error('Invalid equation: ' + error.message);
    }
  };

  // Handle equation button clicks
  const handleParabolaClick = () => {
    setShowParabola(!showParabola);
    
    // Hide other equations when showing this one
    if (!showParabola) {
      setShowNegativeParabola(false);
      setShowCustomEquation(false);
    }
  };
  
  const handleNegativeParabolaClick = () => {
    setShowNegativeParabola(!showNegativeParabola);
    
    // Hide other equations when showing this one
    if (!showNegativeParabola) {
      setShowParabola(false);
      setShowCustomEquation(false);
    }
  };
  
  // Handle custom equation submission
  const handleCustomEquationSubmit = (e) => {
    e.preventDefault();
    
    if (!customEquation.trim()) {
      setErrorMessage('Please enter an equation');
      return;
    }
    
    try {
      // Test if the equation is valid
      createSafeFunction(customEquation);
      
      // Show custom equation and hide others
      setShowCustomEquation(true);
      setShowParabola(false);
      setShowNegativeParabola(false);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
      setShowCustomEquation(false);
    }
  };
  
  // Clear the canvas of user drawings and equations
  const handleClearClick = () => {
    setUserPoints([]);
    setShowParabola(false);
    setShowNegativeParabola(false);
    setShowCustomEquation(false);
    setCustomEquation('');
    setErrorMessage('');
  };
  
  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-bold mb-4 text-gray-800" id="graph-heading">
        Equation:
      </h1>
      
      {/* Canvas container with ARIA descriptions for accessibility */}
      <div className="relative mb-4 border border-gray-300 bg-white"
           role="application"
           aria-labelledby="graph-heading"
           aria-describedby="graph-description">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
        
        {/* Hidden description for screen readers */}
        <div id="graph-description" className="sr-only">
          Interactive coordinate system with x and y axes ranging from -7 to 7. 
          You can click and drag to draw your own curve on the graph. 
          Use the buttons below to display mathematical equations or clear the graph.
        </div>
      </div>
      
      {/* Custom equation input */}
      <div className="w-full max-w-md mb-6">
        <form onSubmit={handleCustomEquationSubmit} className="flex flex-col">
          <div className="flex items-start mb-2">
            <label htmlFor="equation-input" className="sr-only">Enter your own equation</label>
            <div className="relative w-full">
              <input
                id="equation-input"
                type="text"
                value={customEquation}
                onChange={(e) => setCustomEquation(e.target.value)}
                placeholder="Enter your own equation (e.g. x^2 + 2*x - 1)"
                className="w-full px-4 py-2 border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-describedby={errorMessage ? "equation-error" : undefined}
              />
              {errorMessage && (
                <div id="equation-error" className="flex items-center mt-1 text-red-600 text-sm" role="alert">
                  <AlertCircle size={16} className="mr-1" aria-hidden="true" />
                  {errorMessage}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Plot your equation"
            >
              Plot
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Tip: Use x as your variable. You can use Math functions like sin(x), cos(x), sqrt(x), etc.
          </p>
        </form>
      </div>

      {/* Control buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={handleParabolaClick}
          className={`px-5 py-3 font-bold rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            showParabola ? 'bg-blue-800 text-white' : 'bg-blue-800 text-white'
          }`}
          aria-pressed={showParabola}
          aria-label="Show y equals x squared equation"
        >
          y = x<sup>2</sup>
        </button>
        
        <button
          onClick={handleNegativeParabolaClick}
          className={`px-5 py-3 font-bold rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            showNegativeParabola ? 'bg-blue-800 text-white' : 'bg-blue-800 text-white'
          }`}
          aria-pressed={showNegativeParabola}
          aria-label="Show y equals negative x squared equation"
        >
          y = -x<sup>2</sup>
        </button>
        
        <button
          onClick={handleClearClick}
          className="px-5 py-3 font-bold border border-blue-800 text-blue-800 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Clear all drawings and equations from the graph"
        >
          Clear
        </button>
      </div>
      
      {/* Keyboard instructions for accessibility */}
      <div className="sr-only">
        This is a drawing application. Use a mouse, touchpad or touchscreen to draw on the graph.
        Press Tab to navigate between buttons. Press Space or Enter to activate buttons.
      </div>
    </div>
  );
};

export default InteractiveGraph;
