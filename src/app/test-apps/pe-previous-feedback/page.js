"use client";
import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

const StudentFeedbackAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [showQuotes, setShowQuotes] = useState([false, false, false]);
  const [wordProgress, setWordProgress] = useState([0, 0, 0]);

  const studentComments = [
    {
      text: "A more practical approach rather than just pure theory would be very useful",
      gradient: "from-emerald-300 to-teal-300",
      bgGradient: "from-emerald-500/25 to-teal-500/25"
    },
    {
      text: "The videos on the Hub were not very helpful in explaining the concepts in the module",
      gradient: "from-orange-300 to-red-300",
      bgGradient: "from-orange-500/25 to-red-500/25"
    },
    {
      text: "It covers interesting topics about PE, but to my taste it is quite theoretical",
      gradient: "from-violet-300 to-purple-300",
      bgGradient: "from-violet-500/25 to-purple-500/25"
    }
  ];

  useEffect(() => {
    // Start animation on component mount
    const timer = setTimeout(() => {
      handleReveal();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleReveal = () => {
    setIsAnimating(true);
    setShowQuotes([false, false, false]);
    setWordProgress([0, 0, 0]);

    // Stagger the quote reveals
    studentComments.forEach((_, index) => {
      setTimeout(() => {
        setShowQuotes(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });

        // Start word animation for this quote
        const words = studentComments[index].text.split(' ');
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
        }, 80);
      }, index * 400);
    });
  };

  const handleReset = () => {
    setIsAnimating(true);
    setShowQuotes([false, false, false]);
    setWordProgress([0, 0, 0]);

    // Restart animation after brief delay
    setTimeout(() => {
      handleReveal();
    }, 300);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Animated background layers */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 via-transparent to-violet-600/20 animate-gradient"></div>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Main content container */}
      <div className="relative max-w-5xl w-full">
        {/* Title */}
        <div className={`text-center mb-12 transition-all duration-700 ${isAnimating ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">
            Student comments on previous iterations of the module
          </h1>
        </div>

        {/* Grid of student comments */}
        <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {studentComments.map((comment, index) => {
            const words = comment.text.split(' ');
            const currentWordProgress = wordProgress[index];

            return (
              <div key={index} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${comment.bgGradient} rounded-2xl blur-xl transition-all duration-600 ${showQuotes[index] ? 'opacity-60 scale-100' : 'opacity-0 scale-95'}`}></div>

                <div className={`relative bg-black/50 backdrop-blur-md rounded-2xl p-8 border border-white/30 h-full transition-all duration-500 min-h-[280px] flex flex-col ${showQuotes[index] ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-6'}`}>
                  {/* Comment icon */}
                  <div className={`absolute -top-3 -left-3 transition-all duration-600 ${showQuotes[index] ? 'rotate-0 opacity-100' : '-rotate-12 opacity-0'}`}>
                    <div className={`bg-gradient-to-br ${comment.gradient} rounded-full p-3 shadow-2xl`}>
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Comment text with word animation */}
                  <div className="flex flex-col h-full pt-4">
                    <blockquote className="flex-1">
                      <p className="text-lg lg:text-xl font-medium leading-relaxed">
                        <span className="text-white">
                          {words.map((word, wordIndex) => (
                            <span
                              key={wordIndex}
                              className={`inline-block mr-2 transition-all duration-400 ${
                                wordIndex <= currentWordProgress
                                  ? 'opacity-100 translate-y-0 blur-0'
                                  : 'opacity-0 translate-y-4 blur-sm'
                              }`}
                              style={{
                                transitionDelay: `${wordIndex * 30}ms`,
                              }}
                            >
                              <span className={`${
                                wordIndex <= currentWordProgress
                                  ? `text-transparent bg-clip-text bg-gradient-to-r ${comment.gradient} animate-shimmer`
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
                    <div className={`mt-6 transition-all duration-500 delay-300 ${currentWordProgress >= words.length ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/40"></div>
                        <p className="text-sm text-white/70 italic">Student feedback</p>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/40"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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

        .animate-gradient {
          animation: gradient 8s ease infinite;
          background-size: 100% 200%;
        }

        .animate-shimmer {
          background-size: 200% 200%;
          animation: shimmer 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default StudentFeedbackAnimation;