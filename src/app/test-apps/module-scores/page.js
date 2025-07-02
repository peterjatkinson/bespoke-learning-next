"use client";
import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Play, RotateCcw, Sparkles } from 'lucide-react';

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
  
  // Calculate percentage improvements
  const maPercentIncrease = ((maEnd - maStart) / maStart * 100).toFixed(1);
  const pePercentIncrease = ((peEnd - peStart) / peStart * 100).toFixed(1);
  const imcPercentIncrease = ((imcEnd - imcStart) / imcStart * 100).toFixed(1);
  
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
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* 16:9 aspect ratio container with max height */}
      <div className="w-full mx-auto" style={{ maxWidth: '1200px' }}>
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl" style={{ paddingBottom: '56.25%' }}>
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-pink-600/20 animate-gradient"></div>
            {/* Mesh pattern overlay */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            />
          </div>
          
          <div className="absolute inset-0 p-8 flex flex-col">
            {/* Header with title */}
            <div className="text-center mb-6">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 tracking-wide animate-fade-in-down">
                Module Performance Metrics
              </h1>
              <button
                onClick={handleAnimationToggle}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-full hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all transform hover:scale-105 shadow-lg"
                aria-label={hasAnimated ? 'Reset animation' : 'Start animation'}
              >
                {hasAnimated ? (
                  <>
                    <RotateCcw className="w-6 h-6" aria-hidden="true" />
                    Reset animation
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" aria-hidden="true" />
                    Start animation
                  </>
                )}
              </button>
            </div>
            
            {/* Grid of glass morphism cards */}
            <div className="flex-1 grid grid-cols-3 gap-6 pb-20 mb-20">
              {/* Module 1 Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-75"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col h-full border border-white/20 hover:bg-white/15 transition-all">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-bold text-white">Mergers & Acquisitions</h2>
                    </div>
                    <p className="text-cyan-200 text-sm uppercase tracking-wider">NPS mean score</p>
                  </div>
                  
                  {/* Score display */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs text-white/60 mb-2 uppercase tracking-widest">
                        {maComplete ? 'New score' : 'Score'}
                      </p>
                      <div className="relative">
                        <p 
                          className={`text-6xl lg:text-7xl font-black ${maComplete ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300' : 'text-white'} transition-all duration-500`} 
                          aria-live="polite" 
                          aria-atomic="true"
                        >
                          {maCurrentValue}
                        </p>
                        <p className="text-lg text-white/80 mt-1">/10</p>
                      </div>
                      {maComplete && (
                        <div className="flex items-center justify-center gap-2 mt-4 animate-bounce-in">
                          <div className="bg-green-400/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 border border-green-400/30">
                            <TrendingUp className="w-5 h-5 text-green-300" aria-hidden="true" />
                            <p className="text-xl font-bold text-green-300">+{maPercentIncrease}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Module 2 Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-75"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col h-full border border-white/20 hover:bg-white/15 transition-all">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-bold text-white">Private Equity</h2>
                    </div>
                    <p className="text-purple-200 text-sm uppercase tracking-wider">Module survey: Content score</p>
                  </div>
                  
                  {/* Score display */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs text-white/60 mb-2 uppercase tracking-widest">
                        {peComplete ? 'New score' : 'Score'}
                      </p>
                      <div className="relative">
                        <p 
                          className={`text-6xl lg:text-7xl font-black ${peComplete ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300' : 'text-white'} transition-all duration-500`} 
                          aria-live="polite" 
                          aria-atomic="true"
                        >
                          {peCurrentValue}
                        </p>
                        <p className="text-lg text-white/80 mt-1">/5</p>
                      </div>
                      {peComplete && (
                        <div className="flex items-center justify-center gap-2 mt-4 animate-bounce-in">
                          <div className="bg-green-400/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 border border-green-400/30">
                            <TrendingUp className="w-5 h-5 text-green-300" aria-hidden="true" />
                            <p className="text-xl font-bold text-green-300">+{pePercentIncrease}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Module 3 Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-75"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col h-full border border-white/20 hover:bg-white/15 transition-all">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-bold text-white">Integrated Marketing Communications</h2>
                    </div>
                    <p className="text-orange-200 text-sm uppercase tracking-wider">NPS mean score</p>
                  </div>
                  
                  {/* Score display */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs text-white/60 mb-2 uppercase tracking-widest">
                        {imcComplete ? 'New score' : 'Score'}
                      </p>
                      <div className="relative">
                        <p 
                          className={`text-6xl lg:text-7xl font-black ${imcComplete ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-red-300' : 'text-white'} transition-all duration-500`} 
                          aria-live="polite" 
                          aria-atomic="true"
                        >
                          {imcCurrentValue}
                        </p>
                        <p className="text-lg text-white/80 mt-1">/10</p>
                      </div>
                      {imcComplete && (
                        <div className="flex items-center justify-center gap-2 mt-4 animate-bounce-in">
                          <div className="bg-green-400/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 border border-green-400/30">
                            <TrendingUp className="w-5 h-5 text-green-300" aria-hidden="true" />
                            <p className="text-xl font-bold text-green-300">+{imcPercentIncrease}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Summary information */}
    
          </div>
        </div>
      </div>
      
      {/* Add custom animations */}
      <style jsx>{`
        @keyframes gradient {
          0% { transform: translateY(0); }
          100% { transform: translateY(-100%); }
        }
        
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }
        
        .animate-gradient {
          animation: gradient 8s ease infinite;
          background-size: 100% 200%;
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  );
};

export default ModuleScoreCharts;