'use client';

import React, { useState } from 'react';
import { BookOpen, Activity, Info, RefreshCw, ArrowRight, Layers, Repeat, GitMerge } from 'lucide-react';

// --- Data & Content ---

const cycles = {
  TCC: {
    id: 'TCC',
    name: 'Teacher Communication Cycle',
    color: 'text-blue-600',
    bg: 'bg-blue-600',
    stroke: '#2563eb',
    description: 'The iterative exchange of concepts between Teacher and Learner.',
    steps: [
      { id: 1, text: '(1) Enables learner to modulate their concept by giving them access to the teacher\'s concept.' },
      { id: 2, text: '(2) Motivates learner to generate questions or articulations because the teacher is giving them extrinsic feedback.' }
    ],
    highlightNodes: ['TC', 'LC_L'],
    highlightPaths: ['path-1', 'path-2']
  },
  TPC: {
    id: 'TPC',
    name: 'Teacher Practice Cycle',
    color: 'text-indigo-600',
    bg: 'bg-indigo-600',
    stroke: '#4f46e5',
    description: 'The loop where the learner practices and receives feedback from the teacher.',
    steps: [
      { id: 3, text: '(3) Teacher provides a practice environment (Task goal, feedback).' },
      { id: 4, text: '(4) Motivates learner to modulate practice by generating actions that elicit extrinsic feedback from the teacher.' }
    ],
    highlightNodes: ['TPME', 'LP_L'],
    highlightPaths: ['path-3', 'path-4', 'path-vert-left-learner']
  },
  TMC: {
    id: 'TMC',
    name: 'Teacher Modeling Cycle',
    color: 'text-purple-600',
    bg: 'bg-purple-600',
    stroke: '#9333ea',
    description: 'Interaction with the model provided by the teacher environment.',
    steps: [
      { id: 4, text: '(4, 3) Motivates learner to modulate their practice by generating actions that elicit intrinsic feedback from the modeling environment.' }
    ],
    highlightNodes: ['TPME', 'LP_L'],
    highlightPaths: ['path-3', 'path-4']
  },
  PCC: {
    id: 'PCC',
    name: 'Peer Communication Cycle',
    color: 'text-green-600',
    bg: 'bg-green-600',
    stroke: '#16a34a',
    description: 'Exchange of ideas and concepts between peers.',
    steps: [
      { id: 6, text: '(6) Enables learner to modulate their concept by providing access to their peers\' concepts.' },
      { id: 5, text: '(5) Motivates learner to generate articulations because they are getting extrinsic feedback from their peers.' }
    ],
    highlightNodes: ['LC_R', 'PC'],
    highlightPaths: ['path-5', 'path-6']
  },
  PMC: {
    id: 'PMC',
    name: 'Peer Modeling Cycle',
    color: 'text-teal-600',
    bg: 'bg-teal-600',
    stroke: '#0d9488',
    description: 'Learning through observing and interacting with peer outputs.',
    steps: [
      { id: 7, text: '(4, 7) Motivates learner to generate actions in the practice environment because they are sharing the output of their practice.' },
      { id: 8, text: '(8) Enables learner to modulate their practice by using the model of their peer\'s output.' }
    ],
    highlightNodes: ['LP_R', 'PP'],
    highlightPaths: ['path-7', 'path-8']
  }
};

const learningTypes = {
  Acquisition: {
    id: 'Acquisition',
    cycleName: 'Teacher Communication Cycle (Part A)',
    color: 'text-blue-600',
    bg: 'bg-blue-600',
    stroke: '#2563eb',
    description: 'The learner reads, hears, or watches an explanation of the teacher\'s concept.',
    details: 'This enables the learner to modulate their own concept (LC) and see a demonstration of the teacher\'s practice, but does not require them to generate any action or articulation. Typical methods: Lectures, books, videos.',
    highlightNodes: ['TC', 'LC_L'],
    highlightPaths: ['path-1'], // Only TC -> LC
    relatedCycle: 'TCC'
  },
  Production: {
    id: 'Production',
    cycleName: 'Teacher Communication Cycle (Part B)',
    color: 'text-cyan-600',
    bg: 'bg-cyan-600',
    stroke: '#0891b2',
    description: 'The learner consolidates learning by articulating their current conceptual understanding.',
    details: 'Motivates the learner to pull together and organize their exploration. Producing an output (essay, design, report) generates a representation of the learning that enables the teacher to respond with extrinsic feedback.',
    highlightNodes: ['LC_L', 'TC'],
    highlightPaths: ['path-2'], // Only LC -> TC
    relatedCycle: 'TCC'
  },
  Inquiry: {
    id: 'Inquiry',
    cycleName: 'Teacher Practice Cycle (TPC)',
    color: 'text-indigo-600',
    bg: 'bg-indigo-600',
    stroke: '#4f46e5',
    description: 'The learner investigates texts, documents, and resources that reflect the concepts being taught.',
    details: 'The learner is prompted to investigate and compare concepts. They modulate their conceptual organization by generating investigations. The teacher provides a practice environment that elicits extrinsic feedback.',
    highlightNodes: ['TPME', 'LP_L'],
    highlightPaths: ['path-3', 'path-4', 'path-vert-left-learner'],
    relatedCycle: 'TPC'
  },
  Practice: {
    id: 'Practice',
    cycleName: 'Teacher Modeling Cycle (TMC)',
    color: 'text-purple-600',
    bg: 'bg-purple-600',
    stroke: '#9333ea',
    description: 'Learners use their developing concepts to improve their actions toward a goal.',
    details: 'The teacher provides a modeling environment that requires action and provides intrinsic feedback (e.g., simulations, games). The learner modulates practice by generating actions that elicit this intrinsic feedback.',
    highlightNodes: ['TPME', 'LP_L'],
    highlightPaths: ['path-3', 'path-4'],
    relatedCycle: 'TMC'
  },
  Discussion: {
    id: 'Discussion',
    cycleName: 'Peer Communication Cycle (PCC)',
    color: 'text-green-600',
    bg: 'bg-green-600',
    stroke: '#16a34a',
    description: 'Social learning where learners generate ideas and questions for each other.',
    details: 'Teacher provides stimulus; learners generate articulations. This creates a demand for each learner to modulate their ideas. Methods: Seminars, online forums, synchronous chat.',
    highlightNodes: ['LC_R', 'PC'],
    highlightPaths: ['path-5', 'path-6'],
    relatedCycle: 'PCC'
  },
  Collaboration: {
    id: 'Collaboration',
    cycleName: 'Peer Modeling Cycle (PMC)',
    color: 'text-teal-600',
    bg: 'bg-teal-600',
    stroke: '#0d9488',
    description: 'Learners exchange the products or outputs from their practice.',
    details: 'Incorporates discussion, practice, and production. Motivates learners to modulate actions and generate discussion about the shared output. Teacher provides means to create shareable joint products.',
    highlightNodes: ['LP_R', 'PP'],
    highlightPaths: ['path-7', 'path-8'],
    relatedCycle: 'PMC'
  }
};

const nodes = {
  TC: { x: 100, y: 100, label: 'TC', full: "Teacher's Concept", desc: "The teacher's conceptual understanding of the topic." },
  LC_L: { x: 280, y: 100, label: 'LC', full: "Learner's Concept (Teacher Side)", desc: "The learner's conceptual understanding engaged with the teacher." },
  LC_R: { x: 420, y: 100, label: 'LC', full: "Learner's Concept (Peer Side)", desc: "The learner's conceptual understanding engaged with peers." },
  PC: { x: 600, y: 100, label: 'PC', full: "Peer's Concept", desc: "The conceptual understanding held by other learners." },
  
  TPME: { x: 100, y: 400, label: 'TPME', full: "Teacher's Practice Env", desc: "The learning environment, tools, or tasks designed by the teacher." },
  LP_L: { x: 280, y: 400, label: 'LP', full: "Learner's Practice (Teacher Side)", desc: "The learner's actions/practice engaged with the teacher's environment." },
  LP_R: { x: 420, y: 400, label: 'LP', full: "Learner's Practice (Peer Side)", desc: "The learner's actions/practice engaged with peer outputs." },
  PP: { x: 600, y: 400, label: 'PP', full: "Peer's Practice", desc: "The outputs or actions produced by other learners." },
};

// --- Components ---
const DiagramArrow = ({ d, id, active, label, labelPos, markerEnd = true, markerStart = false, strokeDasharray }) => {
  return (
    <g className="transition-all duration-500">
      {/* Base Path (Ghost) */}
      <path d={d} fill="none" stroke="#e5e7eb" strokeWidth="4" strokeDasharray={strokeDasharray} />
      
      {/* Active Path */}
      <path 
        d={d} 
        fill="none" 
        stroke={active ? "currentColor" : "#94a3b8"} 
        strokeWidth={active ? "4" : "2"} 
        markerEnd={markerEnd ? (active ? `url(#arrowhead-${id})` : "url(#arrowhead-gray)") : undefined}
        markerStart={markerStart ? (active ? `url(#arrowhead-${id})` : "url(#arrowhead-gray)") : undefined}
        strokeDasharray={strokeDasharray}
        className={`transition-all duration-500 ${active ? 'opacity-100' : 'opacity-40'}`}
      />
      
      {/* Number Label */}
      {label && (
        <circle cx={labelPos.x} cy={labelPos.y} r="12" fill={active ? "white" : "#f3f4f6"} stroke={active ? "currentColor" : "#9ca3af"} strokeWidth="2" />
      )}
      {label && (
        <text x={labelPos.x} y={labelPos.y} dy="4" textAnchor="middle" fontSize="12" fontWeight="bold" fill={active ? "black" : "#6b7280"}>
          {label}
        </text>
      )}
      
      {/* Definition for Active Marker (Specific Color) */}
      <defs>
        <marker id={`arrowhead-${id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto-start-reverse">
          <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
        </marker>
      </defs>
    </g>
  );
};

const NodeBox = ({ id, data, isActive, onClick }) => {
  return (
    <g 
      onClick={() => onClick(id)} 
      className="cursor-pointer hover:opacity-80 transition-opacity"
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
    >
      <rect 
        x={data.x - 30} 
        y={data.y - 20} 
        width="60" 
        height="40" 
        rx="6" 
        fill={isActive ? "#dbeafe" : "white"} 
        stroke={isActive ? "#2563eb" : "#4b5563"} 
        strokeWidth={isActive ? 3 : 2}
        className="transition-all duration-300 shadow-sm"
      />
      <text 
        x={data.x} 
        y={data.y} 
        dy="4" 
        textAnchor="middle" 
        fontWeight="bold" 
        fontSize="14"
        fill="#1f2937"
        className="pointer-events-none select-none"
      >
        {data.label}
      </text>
    </g>
  );
};

export default function App() {
  const [viewMode, setViewMode] = useState('activities'); // 'activities' | 'cycles'
  const [activeSelectionId, setActiveSelectionId] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Get current active data object based on mode
  const currentDataMap = viewMode === 'activities' ? learningTypes : cycles;
  const activeItem = activeSelectionId ? currentDataMap[activeSelectionId] : null;

  const handleTabChange = (mode) => {
    setViewMode(mode);
    setActiveSelectionId(null);
    setSelectedNodeId(null);
  };

  const handleSelectionClick = (id) => {
    if (activeSelectionId === id) {
      setActiveSelectionId(null);
    } else {
      setActiveSelectionId(id);
      setSelectedNodeId(null); 
    }
  };

  const handleNodeClick = (id) => {
    setSelectedNodeId(id);
    setActiveSelectionId(null); 
  };

  const isPathActive = (pathId) => {
    if (!activeSelectionId || !activeItem) return false;
    return activeItem.highlightPaths.includes(pathId);
  };

  const isNodeActive = (nodeId) => {
    if (selectedNodeId === nodeId) return true;
    if (activeSelectionId && activeItem) return activeItem.highlightNodes.includes(nodeId);
    return false;
  };

  // SVG Paths logic
  // Left Side: Teacher <-> Learner Left
  // Adjusted start/end points to be at the edge of the 60px wide boxes (30px offset from center)
  // TC (100,100) -> LC_L (280,100)
  const path1 = "M 130 90 Q 207 50 250 90"; // TC -> LC_L
  const path2 = "M 250 110 Q 207 150 130 110"; // LC_L -> TC
  
  // TPME (100,400) -> LP_L (280,400)
  const path3 = "M 130 390 Q 207 350 250 390"; // TPME -> LP_L
  const path4 = "M 250 410 Q 207 450 130 410"; // LP_L -> TPME

  // Right Side: Learner Right <-> Peer
  // LC_R (420,100) -> PC (600,100)
  const path5 = "M 450 90 Q 510 50 570 90"; // LC_R -> PC
  const path6 = "M 570 110 Q 510 150 450 110"; // PC -> LC_R
  
  // LP_R (420,400) -> PP (600,400)
  const path7 = "M 450 390 Q 510 350 570 390"; // LP_R -> PP
  const path8 = "M 570 410 Q 510 450 450 410"; // PP -> LP_R

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Conversational Framework</h1>
              <p className="text-xs text-gray-500">Interactive Model</p>
            </div>
          </div>
          <button 
            onClick={() => { setActiveSelectionId(null); setSelectedNodeId(null); }}
            className="text-sm text-gray-500 hover:text-gray-900 flex items-center space-x-1"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset View</span>
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row max-w-6xl mx-auto w-full p-4 gap-6">
        
        {/* Left Column: Interactive Diagram */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative order-2 lg:order-1">
          <div className="absolute top-4 left-4 z-0 bg-gray-100/80 px-3 py-1 rounded-full text-xs font-medium text-gray-500 pointer-events-none">
            Select items from the menu to visualize
          </div>
          
          <div className="flex-grow flex items-center justify-center p-4 overflow-auto">
             <svg viewBox="0 0 700 500" className="w-full h-auto max-w-2xl select-none">
                
                {/* Global Definitions for Markers */}
                <defs>
                  <marker id="arrowhead-gray" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto-start-reverse">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                  </marker>
                  <marker id="arrow-bi" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                      <path d="M0,5 L5,0 L10,5 L5,10 Z" fill="#cbd5e1" />
                  </marker>
                </defs>

                {/* Background Regions */}
                <rect x="235" y="40" width="230" height="420" rx="20" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2" />
                <text x="350" y="30" textAnchor="middle" fontSize="12" fill="#9ca3af" fontWeight="bold">LEARNER</text>
                <text x="100" y="30" textAnchor="middle" fontSize="12" fill="#9ca3af" fontWeight="bold">TEACHER</text>
                <text x="600" y="30" textAnchor="middle" fontSize="12" fill="#9ca3af" fontWeight="bold">PEERS</text>

                {/* Structural Lines */}
                <line x1="100" y1="145" x2="100" y2="375" stroke="#cbd5e1" strokeWidth="4" markerEnd="url(#arrowhead-gray)" markerStart="url(#arrowhead-gray)" />
                <line x1="280" y1="145" x2="280" y2="375" stroke="#cbd5e1" strokeWidth="4" markerEnd="url(#arrowhead-gray)" markerStart="url(#arrowhead-gray)" />
                <line x1="420" y1="145" x2="420" y2="375" stroke="#cbd5e1" strokeWidth="4" markerEnd="url(#arrowhead-gray)" markerStart="url(#arrowhead-gray)" />
                <line x1="315" y1="100" x2="385" y2="100" stroke="#9ca3af" strokeWidth="3" markerEnd="url(#arrowhead-gray)" markerStart="url(#arrowhead-gray)" />
                <line x1="315" y1="400" x2="385" y2="400" stroke="#9ca3af" strokeWidth="3" markerEnd="url(#arrowhead-gray)" markerStart="url(#arrowhead-gray)" />

                {/* Labels */}
                <text x="85" y="250" textAnchor="end" className="text-[10px] fill-gray-400" style={{fontSize: '10px'}}>Generate</text>
                <text x="115" y="250" textAnchor="start" className="text-[10px] fill-gray-400" style={{fontSize: '10px'}}>Modulate</text>
                <text x="265" y="250" textAnchor="end" className="text-[10px] fill-gray-400" style={{fontSize: '10px'}}>Generate</text>
                <text x="295" y="250" textAnchor="start" className="text-[10px] fill-gray-400" style={{fontSize: '10px'}}>Modulate</text>
                <text x="405" y="250" textAnchor="end" className="text-[10px] fill-gray-400" style={{fontSize: '10px'}}>Generate</text>
                <text x="435" y="250" textAnchor="start" className="text-[10px] fill-gray-400" style={{fontSize: '10px'}}>Modulate</text>

                {/* Activity Paths */}
                <g className={activeSelectionId ? activeItem.color : 'text-gray-400'}>
                  {/* Path 1: Solid (Intrinsic - from Teacher) */}
                  <DiagramArrow id="Path1" d={path1} active={isPathActive('path-1')} label="1" labelPos={{x: 207, y: 65}} />
                  {/* Path 2: Dashed (Extrinsic - to Teacher) */}
                  <DiagramArrow id="Path2" d={path2} active={isPathActive('path-2')} label="2" labelPos={{x: 207, y: 135}} strokeDasharray="5,5" />
                  
                  {/* Path 5: Dashed (Extrinsic - to Peer) */}
                  <DiagramArrow id="Path5" d={path5} active={isPathActive('path-5')} label="5" labelPos={{x: 510, y: 65}} strokeDasharray="5,5" />
                  {/* Path 6: Solid (Intrinsic - from Peer) */}
                  <DiagramArrow id="Path6" d={path6} active={isPathActive('path-6')} label="6" labelPos={{x: 510, y: 135}} />
                  
                  {/* Path 3: Solid (Intrinsic - from Teacher Env) */}
                  <DiagramArrow id="Path3" d={path3} active={isPathActive('path-3')} label="3" labelPos={{x: 207, y: 365}} />
                  {/* Path 4: Dashed (Extrinsic - to Teacher Env) */}
                  <DiagramArrow id="Path4" d={path4} active={isPathActive('path-4')} label="4" labelPos={{x: 207, y: 435}} strokeDasharray="5,5" />
                  
                  {/* Path 7: Dashed (Extrinsic - to Peer) */}
                  <DiagramArrow id="Path7" d={path7} active={isPathActive('path-7')} label="7" labelPos={{x: 510, y: 365}} strokeDasharray="5,5" />
                  {/* Path 8: Solid (Intrinsic - from Peer) */}
                  <DiagramArrow id="Path8" d={path8} active={isPathActive('path-8')} label="8" labelPos={{x: 510, y: 435}} />
                </g>

                {/* Nodes */}
                {Object.keys(nodes).map(key => (
                  <NodeBox 
                    key={key} 
                    id={key} 
                    data={nodes[key]} 
                    isActive={isNodeActive(key)} 
                    onClick={handleNodeClick} 
                  />
                ))}

             </svg>
          </div>
          
          {/* Legend Section */}
          <div className="bg-gray-50 border-t border-gray-100 p-4">
             <div className="flex flex-col gap-4">
                {/* Arrow Types */}
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-medium text-gray-600">
                   <div className="flex items-center gap-2">
                      <div className="w-10 h-0.5 bg-gray-400 relative">
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 border-t-[3px] border-b-[3px] border-l-[4px] border-t-transparent border-b-transparent border-l-gray-400"></div>
                      </div>
                      <span>Modulate (Input/Resource)</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-10 h-0.5 border-t-2 border-dashed border-gray-400 relative">
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 border-t-[3px] border-b-[3px] border-l-[4px] border-t-transparent border-b-transparent border-l-gray-400"></div>
                      </div>
                      <span>Generate (Action/Output)</span>
                   </div>
                </div>

                {/* Acronyms */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-[11px] text-gray-500 border-t border-gray-200 pt-3">
                   <div><strong className="text-gray-700">TC</strong> = Teacher's Concept</div>
                   <div><strong className="text-gray-700">LC</strong> = Learner's Concept</div>
                   <div><strong className="text-gray-700">PC</strong> = Peer's Concept</div>
                   
                   <div><strong className="text-gray-700">TPME</strong> = Teacher's Practice Env</div>
                   <div><strong className="text-gray-700">LP</strong> = Learner's Practice</div>
                   <div><strong className="text-gray-700">PP</strong> = Peer's Practice</div>
                </div>
             </div>
          </div>

        </div>

        {/* Right Column: Controls & Info */}
        <div className="w-full lg:w-96 flex flex-col space-y-4 order-1 lg:order-2 h-auto">
          
          {/* Controls Container */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
               <button 
                 onClick={() => handleTabChange('activities')}
                 className={`flex-1 py-3 text-sm font-medium flex items-center justify-center space-x-2 transition-colors
                  ${viewMode === 'activities' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
               >
                 <Layers className="w-4 h-4" />
                 <span>Learning Activities</span>
               </button>
               <button 
                 onClick={() => handleTabChange('cycles')}
                 className={`flex-1 py-3 text-sm font-medium flex items-center justify-center space-x-2 transition-colors
                  ${viewMode === 'cycles' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
               >
                 <Repeat className="w-4 h-4" />
                 <span>Formal Cycles</span>
               </button>
            </div>

            {/* List Selection */}
            <div className="p-4 max-h-[300px] overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {Object.values(currentDataMap).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectionClick(item.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 group text-left
                      ${activeSelectionId === item.id 
                        ? `${item.bg.replace('bg-', 'bg-').replace('600', '600')} text-white border-transparent shadow-md` // Fallback if bg class fails is handled by specific colors below
                        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'}`}
                     style={activeSelectionId === item.id ? { backgroundColor: item.stroke } : {}}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`p-1 rounded ${activeSelectionId === item.id ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>
                        {viewMode === 'activities' ? <Layers className="w-4 h-4" /> : <GitMerge className="w-4 h-4" />}
                      </span>
                      <div>
                         <span className="font-bold text-sm block">{item.id}</span>
                         {viewMode === 'cycles' && <span className="text-[10px] opacity-80 font-normal">{item.name}</span>}
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 transition-transform ${activeSelectionId === item.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-50'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Context Panel (Info Display) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-grow min-h-[300px]">
            {!activeSelectionId && !selectedNodeId && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Explore the Framework</h3>
                  <p className="text-gray-500 mt-2 text-sm">
                    Select a <strong>{viewMode === 'activities' ? 'Learning Activity' : 'Cycle'}</strong> from the menu above, or click diagram nodes to see details.
                  </p>
                </div>
              </div>
            )}

            {/* Node Detail View */}
            {selectedNodeId && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Info className="w-6 h-6 text-gray-700" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{nodes[selectedNodeId].full}</h2>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {nodes[selectedNodeId].desc}
                </p>
              </div>
            )}

            {/* Selection Detail View */}
            {activeSelectionId && activeItem && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className={`text-xl font-bold ${activeItem.color}`}>
                    {activeItem.name || activeItem.id}
                  </h2>
                </div>
                
                {viewMode === 'activities' && (
                  <div className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">
                    Mapped to: {activeItem.cycleName}
                  </div>
                )}

                <p className="text-gray-900 font-medium mb-4 text-lg">
                  {activeItem.description}
                </p>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm text-gray-600 leading-relaxed space-y-2">
                   {viewMode === 'activities' ? (
                      <p>{activeItem.details}</p>
                   ) : (
                      <ul className="space-y-3">
                         {activeItem.steps.map(step => (
                            <li key={step.id} className="flex gap-3">
                               <span className={`font-bold ${activeItem.color}`}>{step.id}</span>
                               <span>{step.text}</span>
                            </li>
                         ))}
                      </ul>
                   )}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}