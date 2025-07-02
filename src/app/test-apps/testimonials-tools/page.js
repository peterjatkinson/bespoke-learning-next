"use client";
import React, { useState, useEffect } from 'react';
import { Quote, Sparkles, Star } from 'lucide-react';

const AnimatedQuotesGrid = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showQuotes, setShowQuotes] = useState([false, false, false, false]);
  const [wordProgress, setWordProgress] = useState([0, 0, 0, 0]);
  const [particlesVisible, setParticlesVisible] = useState(false);
  
  const quotes = [
    {
      text: "It sparked unexpected angles I wouldn't have otherwise considered",
      author: "Student",
      gradient: "from-cyan-300 to-blue-300",
      bgGradient: "from-cyan-500/25 to-blue-500/25"
    },
    {
      text: "Very helpful in jumpstarting my thinking, especially when I felt stuck",
      author: "Student",
      gradient: "from-purple-300 to-pink-300",
      bgGradient: "from-purple-500/25 to-pink-500/25"
    },
    {
      text: "[The persona generator tool] produced accurate and actionable consumer personas, demonstrating its practical marketing value",
      author: "Student",
      gradient: "from-amber-300 to-orange-300",
      bgGradient: "from-amber-500/25 to-orange-500/25"
    },
    {
      text: "I definitely see myself using similar tools in my marketing career",
      author: "Student",
      gradient: "from-emerald-300 to-teal-300",
      bgGradient: "from-emerald-500/25 to-teal-500/25"
    }
  ];
  
  const handleReveal = () => {
    setIsAnimating(true);
    setShowQuotes([false, false, false, false]);
    setWordProgress([0, 0, 0, 0]);
    setParticlesVisible(false);
    
    // Stagger the quote reveals
    quotes.forEach((_, index) => {
      setTimeout(() => {
        setShowQuotes(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
        
        // Start word animation for this quote
        const words = quotes[index].text.split(' ');
        let currentWord = 0;
        
        const wordInterval = setInterval(() => {
          setWordProgress(prev => {
            const newProgress = [...prev];
            newProgress[index] = currentWord;
            return newProgress;
          });
          
          currentWord++;
          if (currentWord > words.length) {
            clearInterval(wordInterval);
          }
        }, 60);
      }, index * 300);
    });
    
    // Show particles after all quotes are revealed
    setTimeout(() => {
      setParticlesVisible(true);
    }, quotes.length * 300 + 2000);
  };
  
  const handleReset = () => {
    setIsAnimating(false);
    setShowQuotes([false, false, false, false]);
    setWordProgress([0, 0, 0, 0]);
    setParticlesVisible(false);
  };
  
  // Generate random positions for floating particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    size: Math.random() * 4 + 2,
  }));
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background layers */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-pink-600/20 animate-gradient"></div>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>
      
      {/* Main content container */}
      <div className="relative max-w-6xl w-full">
        {/* Floating particles */}
        {particlesVisible && particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute animate-float opacity-0"
            style={{
              left: particle.left,
              top: '-20px',
              animationDelay: particle.animationDelay,
            }}
          >
            <Star 
              className="text-yellow-300/60" 
              style={{ width: `${particle.size * 8}px`, height: `${particle.size * 8}px` }}
              fill="currentColor"
            />
          </div>
        ))}
        
        {/* Title */}
        <div className={`text-center mb-10 transition-all duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-4xl lg:text-5xl font-bold text-white">
            AI-generated learning tools feedback
          </h1>
        </div>
        
        {/* 2x2 Grid of quotes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {quotes.map((quote, index) => {
            const words = quote.text.split(' ');
            const currentWordProgress = wordProgress[index];
            
            return (
              <div key={index} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${quote.bgGradient} rounded-2xl blur-xl transition-all duration-500 ${showQuotes[index] ? 'opacity-60 scale-100' : 'opacity-0 scale-95'}`}></div>
                
                <div className={`relative bg-black/50 backdrop-blur-md rounded-2xl p-8 border border-white/30 h-full transition-all duration-400 min-h-[250px] ${showQuotes[index] ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>
                  {/* Quote icon */}
                  <div className={`absolute -top-3 -left-3 transition-all duration-500 ${showQuotes[index] ? 'rotate-0 opacity-100' : '-rotate-12 opacity-0'}`}>
                    <div className={`bg-gradient-to-br ${quote.gradient} rounded-full p-3 shadow-2xl`}>
                      <Quote className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  {/* Quote text with word animation */}
                  <div className="flex flex-col h-full">
                    <blockquote className="flex-1 pt-4">
                      <p className="text-xl lg:text-2xl font-medium leading-relaxed mb-6">
                        <span className="text-white">
                          {words.map((word, wordIndex) => (
                            <span
                              key={wordIndex}
                              className={`inline-block mr-2 transition-all duration-300 ${
                                wordIndex <= currentWordProgress
                                  ? 'opacity-100 translate-y-0 blur-0'
                                  : 'opacity-0 translate-y-4 blur-sm'
                              }`}
                              style={{
                                transitionDelay: `${wordIndex * 25}ms`,
                              }}
                            >
                              <span className={`${
                                wordIndex <= currentWordProgress
                                  ? `text-transparent bg-clip-text bg-gradient-to-r ${quote.gradient} animate-shimmer`
                                  : 'text-white'
                              }`}>
                                {word}
                              </span>
                            </span>
                          ))}
                        </span>
                      </p>
                    </blockquote>
                    
                    {/* Attribution */}
                    <div className={`transition-all duration-500 delay-200 ${currentWordProgress >= words.length ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/40"></div>
                        <p className="text-sm text-white/80 italic">— {quote.author}</p>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/40"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sparkle decoration */}
                  {particlesVisible && (
                    <Sparkles 
                      className={`absolute bottom-4 right-4 w-5 h-5 text-white/50 animate-pulse`}
                      style={{ animationDelay: `${index * 0.2}s` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Control button */}
        <div className="text-center mt-12">
          {!isAnimating ? (
            <button
              onClick={handleReveal}
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-semibold rounded-full hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all transform hover:scale-105 shadow-2xl"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
              <Sparkles className="relative w-6 h-6" />
              <span className="relative">Reveal Testimonials</span>
            </button>
          ) : (
            <button
              onClick={handleReset}
              className={`inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-medium rounded-full hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all border border-white/30 ${particlesVisible ? 'opacity-100' : 'opacity-0'}`}
            >
              Reset Animation
            </button>
          )}
        </div>
      </div>
      
      {/* Custom animations */}
      <style jsx>{`
        @keyframes gradient {
          0% { transform: translateY(0); }
          100% { transform: translateY(-100%); }
        }
        
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0% { 
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% { 
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        .animate-gradient {
          animation: gradient 8s ease infinite;
          background-size: 100% 200%;
        }
        
        .animate-shimmer {
          background-size: 200% 200%;
          animation: shimmer 2s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AnimatedQuotesGrid;