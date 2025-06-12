"use client";
import React, { useState, useEffect } from 'react';
import { Presentation, BookOpen, ClipboardList, NotebookPen, ChevronDown } from 'lucide-react';
 
const CourseOverview = () => {
  const [activeTag, setActiveTag] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeType, setActiveType] = useState(null);
 
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedSession) {
          setSelectedSession(null);
        } else if (activeTag) {
          setActiveTag(null);
        } else if (activeType) {
          setActiveType(null);
        }
      }
      
      if (e.key >= '1' && e.key <= '8') {
        const sessionId = parseInt(e.key);
        handleSessionClick(sessionId);
      }
      
      if (e.key === 'Tab') {
        // Let default tab behavior handle focus management
        return;
      }
    };
 
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSession, activeTag, activeType]);
 
  const tags = [
    { id: 'study', label: 'Study pages', icon: BookOpen },
    { id: 'summary', label: 'Summary', icon: ClipboardList },
    { id: 'assessment', label: 'Assessment', icon: NotebookPen }
  ];
 
  const sessionTypes = [
    { type: 'calculus', label: 'Calculus', color: 'bg-blue-100' },
    { type: 'algebra', label: 'Linear Algebra', color: 'bg-green-100' },
    { type: 'differential-equations', label: 'Differential Equations', color: 'bg-purple-100' }
  ];
 
  const sessionPages = {
    1: [
        "1.1 Background: Calculus",
        "1.2 The first derivative",
        "1.3 The nth derivative",
        "1.4 The sum difference rule",
        "1.5 The product rule",
        "1.6 The quotient rule",
        "1.7 Logarithmic functions",
        "1.8 Exponential functions",
        "1.9 Partial derivatives (part one)",
        "1.10 Partial derivatives(part two)"
    ],
    2: [
        "2.1 Introduction to integration",
        "2.2 Calculating the constant 'c'",
        "2.3 Sum difference rule",
        "2.4 Basic integrals",
        "2.5 Integration by parts",
        "2.6 Definite integrals",
        "2.7 Multiple integrals"   
    ],
    3: [
        "3.1 Taylor expansion",
        "3.2 Taylor expansion further generalised",
        "3.3 Quiz: calculus"
    ],
    4: [
        "4.1 Background: Linear algebra",
        "4.2 Matrices: Basic definitions",
        "4.3 Matrices: Basic operations",
        "4.4 Determinants",
        "4.5 The determinant of a 3×3 matrix",
        "4.6 The inverse of a matrix",
        "4.7 Linear equations",
        "4.8 Cramer's rule",
        "4.9 Characteristic roots and vectors",
        "4.10 Quiz: Linear algebra"
    ],
    5: [
        "5.1 Background: Differential equations",
        "5.2 Ordinary differential equations",
        "5.3 Solutions to linear homogeneous ordinary differential equations",
        "5.4 First order linear homogeneous ordinary differential equation",
        "5.5 Second order linear homogeneous ODE with constant coefficients",
        "5.6 Linear homogeneous ODE of nth order",
        "5.7 Partial differential equations",
        "5.8 Quiz: Differential equations"
    ],
    6: [
        "6.1 Calculus review",
        "6.2 Linear algebra review",
        "6.3 Differential equations review",
        "6.4 Module quiz",
        "6.5 Your feedback"
    ]
  };
 
  const sessions = [
    {
      id: 1,
      title: 'Calculus: differentiation',
      tags: ['study', 'calculus']
    },
    {
      id: 2,
      title: 'Calculus: integration',
      tags: ['study', 'calculus']
    },
    {
      id: 3,
      title: 'Calculus: Taylor expansion',
      tags: ['study', 'calculus', 'assessment']
    },
    {
      id: 4,
      title: 'Linear algebra',
      tags: ['study', 'algebra', 'assessment']
    },
    {
      id: 5,
      title: 'Differential equations',
      tags: ['study', 'differential-equations', 'assessment']
    },
    {
      id: 6,
      title: 'Module summary',
      tags: ['summary', 'assessment']
    }
  ];
 
  const getTypeColor = (session) => {
    if ([7, 8].includes(session.id)) {
      return 'bg-gray-100';
    }
    if (session.tags.includes('calculus')) {
      return 'bg-blue-100';
    }
    if (session.tags.includes('algebra')) {
      return 'bg-green-100';
    }
    if (session.tags.includes('differential-equations')) {
      return 'bg-purple-100';
    }
    return 'bg-gray-100';
  };
 
  const isHighlighted = (session) => {
    if (activeTag && !session.tags.includes(activeTag)) return false;
    if (activeType && !session.tags.includes(activeType)) return false;
    return activeTag || activeType;
  };
 
  const handleSessionClick = (sessionId) => {
    if (activeTag === 'assessment' && [4, 5, 6, 8].includes(sessionId)) {
      setSelectedSession(selectedSession === sessionId ? null : sessionId);
    } else {
      setSelectedSession(selectedSession === sessionId ? null : sessionId);
    }
  };
 
  const isQuizPage = (page) => {
    return page.toLowerCase().includes('quiz');
  };
 
  // Helper function to render dropdown content
  const renderDropdownContent = (sessionId) => {
    return (
      <div className="col-span-full mt-2 mb-4 p-3 sm:p-4 md:p-6 bg-white rounded-lg shadow-md transition-all duration-200 relative w-full">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSession(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              setSelectedSession(null);
            }
          }}
          tabIndex={0}
          aria-label="Close session details"
          className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 p-1.5 sm:p-2 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation z-10"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="mb-3 sm:mb-4 pr-6 sm:pr-8 w-full">
          <span className="text-xs sm:text-sm text-gray-700">Session {sessionId}</span>
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium break-words">
            {sessions.find(s => s.id === sessionId)?.title}
          </h3>
        </div>
        <div className="w-full">
          <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 md:gap-3 w-full">
            <ul className="flex-1 space-y-1.5 sm:space-y-2">
              {sessionPages[sessionId]
                .slice(0, Math.ceil(sessionPages[sessionId].length / 2))
                .map((page, index) => (
                <li
                  key={index}
                  className={`text-xs sm:text-sm md:text-base text-gray-700 ${isQuizPage(page) ? 'font-bold' : ''} p-1 rounded hover:bg-gray-50 transition-colors w-full break-words`}
                >
                  {page}
                </li>
              ))}
            </ul>
            
            {sessionPages[sessionId].length > Math.ceil(sessionPages[sessionId].length / 2) && (
              <ul className="flex-1 space-y-1.5 sm:space-y-2">
                {sessionPages[sessionId]
                  .slice(Math.ceil(sessionPages[sessionId].length / 2))
                  .map((page, index) => (
                  <li
                    key={index + Math.ceil(sessionPages[sessionId].length / 2)}
                    className={`text-xs sm:text-sm md:text-base text-gray-700 ${isQuizPage(page) ? 'font-bold' : ''} p-1 rounded hover:bg-gray-50 transition-colors w-full break-words`}
                  >
                    {page}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };
 
  return (
    <div className="min-h-full bg-gray-50 w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 w-full">
        <div className="mb-4 sm:mb-6 md:mb-8 text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Introduction to Maths</h1>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600">Module structure</h2>
        </div>
 
        <div className="mb-3 sm:mb-4 md:mb-6 flex flex-wrap justify-center gap-2 sm:gap-3 px-2 sm:px-0">
          {tags.map((tag) => {
            const Icon = tag.icon;
            return (
              <button
                key={tag.id}
                onClick={() => {
                  setActiveTag(activeTag === tag.id ? null : tag.id);
                  setActiveType(null); // Clear type filter when tag is selected
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveTag(activeTag === tag.id ? null : tag.id);
                    setActiveType(null);
                  }
                }}
                tabIndex={0}
                aria-pressed={activeTag === tag.id}
                aria-label={`Filter by ${tag.label}`}
                className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm md:text-base font-medium transition-colors flex items-center gap-1 sm:gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 flex-shrink-0 touch-manipulation
                  ${activeTag === tag.id
                    ? 'bg-yellow-400 text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'}`}
              >
                <Icon size={12} className="sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span className="whitespace-nowrap text-xs sm:text-sm md:text-base">{tag.label}</span>
              </button>
            );
          })}
        </div>
 
        <div className="mb-3 sm:mb-4 md:mb-6 flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {sessionTypes.map((type) => (
            <button
              key={type.type}
              onClick={() => {
                setActiveType(activeType === type.type ? null : type.type);
                setActiveTag(null); // Clear tag filter when type is selected
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveType(activeType === type.type ? null : type.type);
                  setActiveTag(null);
                }
              }}
              tabIndex={0}
              aria-pressed={activeType === type.type}
              aria-label={`Filter by ${type.label} sessions`}
              className={`flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer touch-manipulation
                ${activeType === type.type
                  ? 'bg-yellow-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'}`}
            >
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded ${type.color} flex-shrink-0 shadow-sm`}></div>
              <span className={`text-xs sm:text-sm md:text-base font-medium whitespace-nowrap transition-colors duration-200 ${
                activeType === type.type ? 'text-gray-900' : 'text-gray-700'
              }`}>{type.label}</span>
            </button>
          ))}
        </div>
 
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 w-full">
          {sessions.map((session) => (
            <React.Fragment key={session.id}>
              <div
                onClick={() => handleSessionClick(session.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSessionClick(session.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Session ${session.id}: ${session.title}. ${selectedSession === session.id ? 'Currently selected' : 'Click to view details'}`}
                aria-pressed={selectedSession === session.id}
                className={`p-2.5 sm:p-3 md:p-4 rounded-lg transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 min-h-fit w-full touch-manipulation
                  ${getTypeColor(session)}
                  ${isHighlighted(session)
                    ? 'outline outline-2 sm:outline-3 outline-yellow-400 scale-[1.02] sm:scale-102'
                    : (activeTag || activeType)
                      ? 'opacity-40'
                      : ''}`}
              >
                <div className="flex flex-col justify-between h-full min-h-[4rem] sm:min-h-[5rem] md:min-h-[6rem] w-full">
                  <div className="flex items-start justify-between mb-1 sm:mb-2 w-full">
                    <span className="text-xs sm:text-sm text-gray-700 font-medium">Session {session.id}</span>
                    <ChevronDown
                      className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ml-1 ${
                        selectedSession === session.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-medium leading-tight flex-grow pr-1 w-full break-words">{session.title}</h3>
                </div>
              </div>
              
              {/* Render dropdown directly below the clicked card */}
              {selectedSession === session.id && renderDropdownContent(session.id)}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
 
export default CourseOverview;