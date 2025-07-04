"use client";

import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Play, RotateCcw } from 'lucide-react';

const ModuleScoreCharts = () => {
  // State for animation progress, using an object to hold all values
  const [progress, setProgress] = useState({ ma: 0, pe: 0, imc: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // useRef to hold the animation frame ID for cancellation
  const animationFrameId = useRef();

  // Data for each module, now including calculation values and updated subtitles
  const modules = [
    {
      key: 'ma',
      title: 'Mergers & Acquisitions',
      subtitle: 'Student survey mean score increase',
      increase: ((8.71 - 8.0) / 8.0 * 100),
      gradient: 'from-cyan-300 to-blue-300',
      glow: 'from-cyan-500 to-blue-500',
    },
    {
      key: 'pe',
      title: 'Private Equity',
      subtitle: 'Student survey mean score increase',
      increase: ((4.5 - 3.98) / 3.98 * 100),
      gradient: 'from-purple-300 to-pink-300',
      glow: 'from-purple-500 to-pink-500',
    },
    {
      key: 'imc',
      title: 'Integrated Marketing Communications',
      subtitle: 'Student survey mean score increase',
      increase: ((8.75 - 4.8) / 4.8 * 100),
      gradient: 'from-orange-300 to-red-300',
      glow: 'from-orange-500 to-red-500',
    },
  ];

  // Handle button click to start or reset animation
  const handleAnimationToggle = () => {
    if (hasAnimated) {
      // Reset animation
      setProgress({ ma: 0, pe: 0, imc: 0 });
      setHasAnimated(false);
      setIsAnimating(false);
    } else if (!isAnimating) {
      // Start animation
      setIsAnimating(true);
    }
  };

  // Animate the progress when triggered using requestAnimationFrame for smoothness
  useEffect(() => {
    if (!isAnimating) {
      if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    let startTime = null;
    const animationDuration = 1500; // ms

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      
      // Update progress for each module with a slight stagger
      setProgress({
        ma: Math.min(elapsedTime / animationDuration, 1) * 100,
        pe: Math.min(Math.max(0, (elapsedTime - 200) / animationDuration), 1) * 100,
        imc: Math.min(Math.max(0, (elapsedTime - 400) / animationDuration), 1) * 100,
      });

      if (elapsedTime < animationDuration + 400) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        // Ensure final values are set perfectly
        setProgress({ ma: 100, pe: 100, imc: 100 });
        setIsAnimating(false);
        setHasAnimated(true);
      }
    };

    animationFrameId.current = requestAnimationFrame(animate);

    // Cleanup function to cancel animation if component unmounts
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isAnimating]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 font-sans">
      <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-slate-900" style={{ paddingBottom: '56.25%' }}>
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        <div className="absolute inset-0 p-4 sm:p-8 flex flex-col">
          {/* Header with title and animation button */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 tracking-wide">
              Module Performance Increase
            </h1>
            <button
              onClick={handleAnimationToggle}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all transform hover:scale-105 shadow-lg"
              aria-label={hasAnimated ? 'Reset animation' : 'Start animation'}
            >
              {hasAnimated ? <RotateCcw className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{hasAnimated ? 'Reset' : 'Start'} animation</span>
            </button>
          </div>

          {/* Grid of cards */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {modules.map((module) => {
              // Calculate the current animated value
              const currentAnimatedValue = (module.increase * progress[module.key] / 100).toFixed(1);

              return (
                <div key={module.key} className="relative group">
                  <div className={`absolute -inset-1 bg-gradient-to-r ${module.glow} rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-60 group-hover:opacity-80`}></div>
                  
                  {/* Card layout using flexbox to ensure alignment */}
                  <div className="relative bg-black/40 backdrop-blur-lg rounded-2xl p-6 flex flex-col h-full border border-white/20 hover:border-white/30 transition-all duration-300">
                    {/* Top section: Title and subtitle. Added a fixed height to ensure alignment */}
                    <div className="mb-4 h-28">
                      <h2 className="text-xl lg:text-2xl font-bold text-white">{module.title}</h2>
                      <p className="text-white/60 text-sm mt-1">{module.subtitle}</p>
                    </div>

                    {/* Bottom section: This takes up the remaining space, centering its content. */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <p className="text-xs text-white/70 mb-2 uppercase tracking-widest">
                        Performance Increase
                      </p>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-green-400" aria-hidden="true" />
                        <p className={`text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${module.gradient}`}>
                          +{currentAnimatedValue}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleScoreCharts;
