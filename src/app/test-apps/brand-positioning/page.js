"use client"; 
import React, { useState, useEffect, useRef } from "react";
import { Move, X, Info, AlertCircle } from "lucide-react";
import { supabase } from "lib/supabaseClient";

const BrandPositioningMap = () => {
  // State for brands
  const [brands, setBrands] = useState([
    { id: "tesla", name: "Tesla", x: 50, y: 50, color: "#e2504c" },
    { id: "bmw", name: "BMW", x: 50, y: 50, color: "#4c7fe2" },
    { id: "toyota", name: "Toyota", x: 50, y: 50, color: "#4ce25c" },
    { id: "rolls-royce", name: "Rolls-Royce", x: 50, y: 50, color: "#9c4ce2" },
    { id: "honda", name: "Honda", x: 50, y: 50, color: "#e2c04c" },
  ]);
  
  // State for average positions from all students
  const [averagePositions, setAveragePositions] = useState({});
  const [showAverages, setShowAverages] = useState(false);
  
  // Status and submission tracking
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // App ID for database storage
  const appId = "BrandPositioningMap";
  const storageKey = `submitted_${appId}`;
  const hasSubmitted = localStorage.getItem(storageKey);
  
  const mapContainerRef = useRef(null);
  
  // Function to handle brand movement
  const handleBrandMove = (brandId, newX, newY) => {
    // Ensure newX and newY are within bounds (0-100)
    const x = Math.max(0, Math.min(100, newX));
    const y = Math.max(0, Math.min(100, newY));
    
    setBrands(prevBrands =>
      prevBrands.map(brand => 
        brand.id === brandId ? { ...brand, x, y } : brand
      )
    );
  };
  
  // Function to handle brand dragging
  const handleDragEnd = (result) => {
    if (!result.destination || hasSubmitted) return;
    
    const brandId = result.draggableId;
    const mapRect = mapContainerRef.current.getBoundingClientRect();
    
    // Calculate position as percentage within the container
    const x = ((result.destination.x - mapRect.left) / mapRect.width) * 100;
    const y = ((result.destination.y - mapRect.top) / mapRect.height) * 100;
    
    handleBrandMove(brandId, x, y);
  };
  
  // Function to handle clicking on the map to position a brand
  const handleMapClick = (event, brandId) => {
    if (hasSubmitted) return;
    
    const mapRect = mapContainerRef.current.getBoundingClientRect();
    const x = ((event.clientX - mapRect.left) / mapRect.width) * 100;
    const y = ((event.clientY - mapRect.top) / mapRect.height) * 100;
    
    handleBrandMove(brandId, x, y);
  };
  
  // Function to generate a unique user ID
  const generateUserId = () => {
    const existingUserId = localStorage.getItem(storageKey);
    if (existingUserId) return existingUserId;
    
    const newUserId = `user_${Date.now()}`;
    return newUserId;
  };
  
  // Function to submit brand positions
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setStatus("Submitting your brand positions...");
    
    if (hasSubmitted) {
      setStatus("You have already submitted your positions.");
      setIsSubmitting(false);
      return;
    }
    
    // Create an object with brand positions
    const brandPositions = {};
    brands.forEach(brand => {
      brandPositions[brand.id] = { x: brand.x, y: brand.y };
    });
    
    const userId = generateUserId();
    
    // Save to Supabase
    const { error } = await supabase.from("app_data").insert([
      {
        app_id: appId,
        data: { brandPositions, userId },
      },
    ]);
    
    if (error) {
      console.error("Error saving positions:", error);
      setStatus("Error saving your brand positions.");
      setIsSubmitting(false);
      return;
    }
    
    setStatus("Your brand positions have been saved successfully!");
    localStorage.setItem(storageKey, userId);
    setIsSubmitting(false);
    fetchAveragePositions();
  };
  
  // Function to reset submission
  const resetSubmission = async () => {
    const userId = localStorage.getItem(storageKey);
    if (!userId) {
      setStatus("No submission to reset.");
      return;
    }
    
    setIsSubmitting(true);
    
    const { error } = await supabase
      .from("app_data")
      .delete()
      .eq("app_id", appId)
      .eq("data->>userId", userId);
    
    if (error) {
      console.error("Error resetting submission:", error);
      setStatus("Error resetting your submission.");
      setIsSubmitting(false);
      return;
    }
    
    setStatus("Your submission has been reset successfully.");
    localStorage.removeItem(storageKey);
    
    // Reset brand positions
    setBrands(prevBrands =>
      prevBrands.map(brand => ({ ...brand, x: 50, y: 50 }))
    );
    
    setIsSubmitting(false);
    fetchAveragePositions();
  };
  
  // Function to fetch average positions
  const fetchAveragePositions = async () => {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1).toISOString();
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59).toISOString();
    
    const { data, error } = await supabase
      .from("app_data")
      .select("*")
      .eq("app_id", appId)
      .gte("created_at", startOfYear)
      .lte("created_at", endOfYear);
    
    if (error) {
      console.error("Error fetching data:", error);
      return;
    }
    
    if (!data || data.length === 0) {
      setAveragePositions({});
      return;
    }
    
    // Calculate average positions for each brand
    const positions = {};
    const deviations = {};
    
    // Initialize positions and deviations
    brands.forEach(brand => {
      positions[brand.id] = { x: [], y: [], count: 0 };
      deviations[brand.id] = { x: 0, y: 0 };
    });
    
    // Collect all positions
    data.forEach(entry => {
      const brandPositions = entry.data.brandPositions;
      if (!brandPositions) return;
      
      Object.keys(brandPositions).forEach(brandId => {
        if (positions[brandId]) {
          positions[brandId].x.push(brandPositions[brandId].x);
          positions[brandId].y.push(brandPositions[brandId].y);
          positions[brandId].count++;
        }
      });
    });
    
    // Calculate averages and standard deviations
    const averages = {};
    
    Object.keys(positions).forEach(brandId => {
      if (positions[brandId].count > 0) {
        // Calculate average
        const avgX = positions[brandId].x.reduce((sum, val) => sum + val, 0) / positions[brandId].count;
        const avgY = positions[brandId].y.reduce((sum, val) => sum + val, 0) / positions[brandId].count;
        
        // Calculate standard deviation
        const devX = Math.sqrt(
          positions[brandId].x.reduce((sum, val) => sum + Math.pow(val - avgX, 2), 0) / positions[brandId].count
        );
        const devY = Math.sqrt(
          positions[brandId].y.reduce((sum, val) => sum + Math.pow(val - avgY, 2), 0) / positions[brandId].count
        );
        
        averages[brandId] = {
          x: avgX,
          y: avgY,
          deviation: { x: devX, y: devY },
          count: positions[brandId].count
        };
      }
    });
    
    setAveragePositions(averages);
  };
  
  // Initial fetch of average positions
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchAveragePositions();
  }, [/* eslint-disable-next-line react-hooks/exhaustive-deps */]);
  
  return (
    <div className="min-h-full bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-center text-gray-800" id="app-title">
            Brand Positioning Map
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Position brands on the map based on their perceived attributes
          </p>
        </header>
        
        {/* Instructions accordion */}
        <div className="mb-6 border rounded-lg overflow-hidden">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full p-3 bg-gray-100 flex justify-between items-center"
            aria-expanded={showInstructions}
            aria-controls="instructions-panel"
          >
            <span className="font-medium flex items-center">
              <Info className="w-5 h-5 mr-2" aria-hidden="true" />
              Instructions
            </span>
            <span className="text-gray-500">
              {showInstructions ? <X size={20} /> : "+"}
            </span>
          </button>
          
          <div
            id="instructions-panel"
            className={`p-4 bg-gray-50 ${showInstructions ? "block" : "hidden"}`}
          >
            <ul className="list-disc pl-5 space-y-2">
              <li>Click and drag each brand onto the positioning map</li>
              <li>Position brands based on where you think they fall on each axis</li>
              <li>Horizontal axis: <strong>Traditional (Left) to High-Tech (Right)</strong></li>
              <li>Vertical axis: <strong>Affordable (Bottom) to Luxury (Top)</strong></li>
              <li>Click &quot;Submit&quot; when you&apos;re done to save your positions</li>
              <li>Toggle &quot;Show Class Average&quot; to see where others have placed the brands</li>
            </ul>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand List */}
          <div className="md:col-span-1 order-2 md:order-1">
            <h2 className="text-lg font-semibold mb-3">Brands</h2>
            <ul className="space-y-3" aria-label="List of brands to position">
              {brands.map((brand) => (
                <li 
                  key={brand.id}
                  className={`p-3 flex items-center justify-between rounded-lg border ${
                    hasSubmitted ? "cursor-not-allowed opacity-70" : "cursor-move"
                  }`}
                  style={{ borderLeftWidth: "6px", borderLeftColor: brand.color }}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3" 
                      style={{ backgroundColor: brand.color }}
                      aria-hidden="true"
                    ></div>
                    <span>{brand.name}</span>
                  </div>
                  {!hasSubmitted && (
                    <Move className="w-5 h-5 text-gray-500" aria-hidden="true" />
                  )}
                </li>
              ))}
            </ul>
            
            <div className="mt-6">
              <button
                onClick={() => setShowAverages(!showAverages)}
                className={`w-full py-2 px-4 rounded-lg mb-3 ${
                  Object.keys(averagePositions).length === 0 
                    ? "bg-gray-300 cursor-not-allowed"
                    : showAverages 
                      ? "bg-purple-600 text-white" 
                      : "bg-purple-100 text-purple-700"
                }`}
                disabled={Object.keys(averagePositions).length === 0}
                aria-pressed={showAverages}
              >
                {showAverages ? "Hide Class Average" : "Show Class Average"}
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={hasSubmitted || isSubmitting}
                className={`w-full py-2 px-4 rounded-lg mb-3 ${
                  hasSubmitted || isSubmitting
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isSubmitting ? "Submitting..." : hasSubmitted ? "Submitted" : "Submit"}
              </button>
              
              <button
                onClick={resetSubmission}
                disabled={!hasSubmitted || isSubmitting}
                className={`w-full py-2 px-4 rounded-lg ${
                  !hasSubmitted || isSubmitting
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                Reset Submission
              </button>
            </div>
            
            {status && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p>{status}</p>
              </div>
            )}
          </div>
          
          {/* Positioning Map */}
          <div 
            className="md:col-span-2 order-1 md:order-2 bg-white border rounded-lg"
            style={{ height: "500px" }}
          >
            <div className="relative w-full h-full p-6">
              {/* Map container */}
              <div
                ref={mapContainerRef}
                className="relative w-full h-full border rounded-lg bg-gray-50"
                aria-label="Brand positioning map: Luxury vs Affordable and Traditional vs High-Tech"
                onClick={(e) => {
                  if (hasSubmitted) return;
                  // This allows clicking directly on the map to position a brand
                  // Would need additional UI to select which brand to position
                }}
              >
                {/* Axis labels */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 font-medium text-gray-600">
                  Luxury
                </div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 font-medium text-gray-600">
                  Affordable
                </div>
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 -rotate-90 font-medium text-gray-600">
                  Traditional
                </div>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 rotate-90 font-medium text-gray-600">
                  High-Tech
                </div>
                
                {/* Axis lines */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-300 transform -translate-x-1/2"></div>
                <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300 transform -translate-y-1/2"></div>
                
                {/* Quadrant labels */}
                <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  Luxury Traditional
                </div>
                <div className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  Luxury High-Tech
                </div>
                <div className="absolute bottom-1/4 left-1/4 transform -translate-x-1/2 translate-y-1/2 text-gray-400 text-sm">
                  Affordable Traditional
                </div>
                <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 text-gray-400 text-sm">
                  Affordable High-Tech
                </div>
                
                {/* Brands */}
                {brands.map((brand) => (
                  <div
                    key={brand.id}
                    className={`absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 ${
                      hasSubmitted ? "" : "cursor-move"
                    }`}
                    style={{
                      left: `${brand.x}%`,
                      top: `${brand.y}%`,
                      zIndex: 10
                    }}
                    aria-label={`${brand.name} positioned at ${Math.round((100-brand.y)/100*10)}/10 for Luxury and ${Math.round(brand.x/100*10)}/10 for High-Tech`}
                    draggable={!hasSubmitted}
                    onDragEnd={(e) => {
                      if (hasSubmitted) return;
                      const mapRect = mapContainerRef.current.getBoundingClientRect();
                      const x = ((e.clientX - mapRect.left) / mapRect.width) * 100;
                      const y = ((e.clientY - mapRect.top) / mapRect.height) * 100;
                      handleBrandMove(brand.id, x, y);
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                      style={{ backgroundColor: brand.color }}
                    >
                      {brand.name.charAt(0)}
                    </div>
                    <div className="mt-1 text-xs font-medium bg-white px-1 rounded shadow-sm">
                      {brand.name}
                    </div>
                  </div>
                ))}
                
                {/* Average positions */}
                {showAverages &&
                  Object.keys(averagePositions).map((brandId) => {
                    const avgPos = averagePositions[brandId];
                    const brand = brands.find((b) => b.id === brandId);
                    
                    if (!avgPos || !brand) return null;
                    
                    // Calculate the radius for the deviation circle (scaled for visibility)
                    const deviationRadius = Math.max(
                      Math.sqrt(avgPos.deviation.x * avgPos.deviation.y) * 2,
                      5
                    );
                    
                    return (
                      <div
                        key={`avg-${brandId}`}
                        className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${avgPos.x}%`,
                          top: `${avgPos.y}%`,
                          zIndex: 5
                        }}
                        aria-label={`Class average for ${brand.name}: ${Math.round((100-avgPos.y)/100*10)}/10 for Luxury and ${Math.round(avgPos.x/100*10)}/10 for High-Tech with ${avgPos.count} submissions`}
                      >
                        {/* Deviation circle */}
                        <div
                          className="rounded-full opacity-30"
                          style={{
                            width: `${deviationRadius * 2}px`,
                            height: `${deviationRadius * 2}px`,
                            backgroundColor: brand.color,
                            position: "absolute",
                            zIndex: 5
                          }}
                          aria-hidden="true"
                        ></div>
                        
                        {/* Average marker */}
                        <div
                          className="w-4 h-4 rounded-full border-2 z-10"
                          style={{ 
                            backgroundColor: "white",
                            borderColor: brand.color
                          }}
                          aria-hidden="true"
                        ></div>
                        
                        <div className="mt-1 text-xs bg-white px-1 rounded shadow-sm">
                          Avg ({avgPos.count})
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Statistics section */}
        {showAverages && Object.keys(averagePositions).length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold mb-3">Brand Positioning Insights</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="py-2 px-4 text-left border-b">Brand</th>
                    <th className="py-2 px-4 text-left border-b">Luxury Score (0-10)</th>
                    <th className="py-2 px-4 text-left border-b">Tech Score (0-10)</th>
                    <th className="py-2 px-4 text-left border-b">Deviation</th>
                    <th className="py-2 px-4 text-left border-b">Submissions</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => {
                    const avgPos = averagePositions[brand.id];
                    if (!avgPos) return null;
                    
                    // Converting to 0-10 scale for readability
                    const luxuryScore = ((100 - avgPos.y) / 100 * 10).toFixed(1);
                    const techScore = (avgPos.x / 100 * 10).toFixed(1);
                    
                    // Average deviation as percentage
                    const avgDeviation = (
                      (avgPos.deviation.x + avgPos.deviation.y) / 2 / 100 * 10
                    ).toFixed(1);
                    
                    return (
                      <tr key={`stat-${brand.id}`}>
                        <td className="py-2 px-4 border-b">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: brand.color }}
                            ></div>
                            {brand.name}
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b">{luxuryScore}</td>
                        <td className="py-2 px-4 border-b">{techScore}</td>
                        <td className="py-2 px-4 border-b">±{avgDeviation}</td>
                        <td className="py-2 px-4 border-b">{avgPos.count}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandPositioningMap;
