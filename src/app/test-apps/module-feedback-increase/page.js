"use client";
import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Play, RotateCcw } from 'lucide-react';

const ModuleScoreCharts = () => {
  // State for animation progress
  const [maProgress, setMaProgress] = useState(0);
  const [peProgress, setPeProgress] = useState(0);
  const [imcProgress, setImcProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Values for the animations
  const maStart = 8.0;
  const maEnd = 8.71;
  const peStart = 3.98;
  const peEnd = 4.5;
  const imcStart = 4.8;
  const imcEnd = 8.75;
  
  // Calculate current values based on progress
  const maCurrentValue = (maStart + (maEnd - maStart) * maProgress / 100).toFixed(2);
  const peCurrentValue = (peStart + (peEnd - peStart) * peProgress / 100).toFixed(2);
  const imcCurrentValue = (imcStart + (imcEnd - imcStart) * imcProgress / 100).toFixed(2);
  
  // Determine if each animation is complete
  const maComplete = maProgress >= 100;
  const peComplete = peProgress >= 100;
  const imcComplete = imcProgress >= 100;
  
  // Handle button click to start or reset animation
  const handleAnimationToggle = () => {
    if (hasAnimated) {
      // Reset animation
      setMaProgress(0);
      setPeProgress(0);
      setImcProgress(0);
      setHasAnimated(false);
      setIsAnimating(false);
    } else {
      // Start animation
      setIsAnimating(true);
    }
  };
  
  // Animate the progress when triggered
  useEffect(() => {
    if (!isAnimating) return;
    
    // Animate M&A score
    const maInterval = setInterval(() => {
      setMaProgress((prev) => {
        if (prev >= 100) {
          clearInterval(maInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
    
    // Animate PE score with slight delay
    const peTimeout = setTimeout(() => {
      const peInterval = setInterval(() => {
        setPeProgress((prev) => {
          if (prev >= 100) {
            clearInterval(peInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      
      return () => clearInterval(peInterval);
    }, 200);
    
    // Animate IMC score with more delay
    const imcTimeout = setTimeout(() => {
      const imcInterval = setInterval(() => {
        setImcProgress((prev) => {
          if (prev >= 100) {
            clearInterval(imcInterval);
            setHasAnimated(true);
            setIsAnimating(false);
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      
      return () => clearInterval(imcInterval);
    }, 400);
    
    return () => {
      clearInterval(maInterval);
      clearTimeout(peTimeout);
      clearTimeout(imcTimeout);
    };
  }, [isAnimating]);
  
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Control button */}
      <div className="text-center mb-6">
        <button
          onClick={handleAnimationToggle}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          aria-label={hasAnimated ? 'Reset animation' : 'Start animation'}
        >
          {hasAnimated ? (
            <>
              <RotateCcw className="w-5 h-5" aria-hidden="true" />
              Reset animation
            </>
          ) : (
            <>
              <Play className="w-5 h-5" aria-hidden="true" />
              Start animation
            </>
          )}
        </button>
      </div>
      
      <div className="space-y-6">
        {/* M&A Module Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Module 1</h2>
            <p className="text-gray-600 mt-1">NPS mean score</p>
          </div>
          
          {/* Score display */}
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                {maComplete ? 'New score' : 'Score'}
              </p>
              <div className="flex items-center justify-center gap-4">
                <p 
                  className={`text-6xl font-bold ${maComplete ? 'text-green-600' : 'text-gray-700'}`} 
                  aria-live="polite" 
                  aria-atomic="true"
                >
                  {maCurrentValue}
                </p>
                {maComplete && (
                  <div className="flex items-center gap-2 animate-fade-in">
                    <TrendingUp className="w-8 h-8 text-green-600" aria-hidden="true" />
                    <p className="text-2xl font-bold text-green-600">+{(maEnd - maStart).toFixed(2)}</p>
                  </div>
                )}
              </div>
              <p className="text-lg text-gray-600 mt-1">/10</p>
            </div>
          </div>
        </div>
        
        {/* PE Module Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Module 2</h2>
            <p className="text-gray-600 mt-1">Module evaluation survey, content score improvement</p>
          </div>
          
          {/* Score display */}
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                {peComplete ? 'New score' : 'Score'}
              </p>
              <div className="flex items-center justify-center gap-4">
                <p 
                  className={`text-6xl font-bold ${peComplete ? 'text-green-600' : 'text-gray-700'}`} 
                  aria-live="polite" 
                  aria-atomic="true"
                >
                  {peCurrentValue}
                </p>
                {peComplete && (
                  <div className="flex items-center gap-2 animate-fade-in">
                    <TrendingUp className="w-8 h-8 text-green-600" aria-hidden="true" />
                    <p className="text-2xl font-bold text-green-600">+{(peEnd - peStart).toFixed(2)}</p>
                  </div>
                )}
              </div>
              <p className="text-lg text-gray-600 mt-1">/5</p>
            </div>
          </div>
        </div>
        
        {/* IMC Module Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Module 3</h2>
            <p className="text-gray-600 mt-1">NPS mean score</p>
          </div>
          
          {/* Score display */}
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                {imcComplete ? 'New score' : 'Score'}
              </p>
              <div className="flex items-center justify-center gap-4">
                <p 
                  className={`text-6xl font-bold ${imcComplete ? 'text-green-600' : 'text-gray-700'}`} 
                  aria-live="polite" 
                  aria-atomic="true"
                >
                  {imcCurrentValue}
                </p>
                {imcComplete && (
                  <div className="flex items-center gap-2 animate-fade-in">
                    <TrendingUp className="w-8 h-8 text-green-600" aria-hidden="true" />
                    <p className="text-2xl font-bold text-green-600">+{(imcEnd - imcStart).toFixed(2)}</p>
                  </div>
                )}
              </div>
              <p className="text-lg text-gray-600 mt-1">/10</p>
            </div>
          </div>
        </div>
        
        {/* Summary information */}
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-800">
            All three modules have shown significant improvement in their evaluation metrics, 
            demonstrating enhanced student satisfaction and programme quality.
          </p>
        </div>
      </div>
      
      {/* Add fade-in animation style */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ModuleScoreCharts;