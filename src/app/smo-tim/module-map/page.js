"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Brain, Glasses, Network, Lightbulb, ChevronDown, ChevronUp, Leaf,       // for Ethics & Sustainability
  BookOpen,   // for Storytelling & Emotion
  Sliders,    // for Personalization
  Users,      // for Community Building
  Merge,      // for Phygital Integration
  BarChart2,  // for Data & Analytics
  Wrench,
  ClipboardList
 } from 'lucide-react';

// Simple custom tooltip
// Accessible Tooltip Component
// Improved Accessible Tooltip Component
const Tooltip = ({ text, children }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const tooltipRef = useRef(null);
    const triggerRef = useRef(null);
    const [tooltipStyle, setTooltipStyle] = useState({});
    const [tooltipId] = useState(`tooltip-${Math.random().toString(36).substr(2, 9)}`);
  
    useEffect(() => {
      if (showTooltip && tooltipRef.current) {
        const margin = 10;
        const offsetY = 15;
        
        // Get the position of the trigger element if we don't have coords
        if (!coords.x && !coords.y && triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          setCoords({ 
            x: rect.x + (rect.width / 2),
            y: rect.y + rect.height
          });
          return; // We'll update on the next render
        }
        
        let newTop = coords.y + offsetY;
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        
        // Adjust vertically if overflowing
        if (newTop + tooltipRect.height > window.innerHeight) {
          newTop = window.innerHeight - tooltipRect.height - margin;
        }
        if (newTop < margin) {
          newTop = margin;
        }
  
        let style = { top: newTop, transform: 'none' };
  
        if (coords.x > window.innerWidth / 2) {
          style.right = window.innerWidth - coords.x + margin;
          style.left = 'auto';
          style.maxWidth = coords.x - margin * 2;
        } else {
          style.left = coords.x;
          style.right = 'auto';
          style.maxWidth = window.innerWidth - coords.x - margin;
        }
  
        setTooltipStyle(style);
      }
    }, [coords, showTooltip]);
  
    // Handle keyboard events
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showTooltip) {
        setShowTooltip(false);
      }
    };
  
    return (
      <div
        ref={triggerRef}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        onKeyDown={handleKeyDown}
        onMouseMove={e => {
          setCoords({ x: e.clientX, y: e.clientY });
        }}
        className="inline-block"
        tabIndex={0}
        // Only use aria-describedby when the tooltip is visible
        aria-describedby={showTooltip ? tooltipId : undefined}
      >
        {children}
  
        {showTooltip && (
          <div
            id={tooltipId}
            ref={tooltipRef}
            role="tooltip"
            className="fixed z-10 p-2 text-sm text-white bg-gray-800 rounded shadow-lg whitespace-pre-wrap pointer-events-none"
            style={tooltipStyle}
          >
            {text}
          </div>
        )}
      </div>
    );
  };
const SimplifiedCourseInterface = () => {
  const [expandedTheme, setExpandedTheme] = useState(null);
  const [activeThemeFilter, setActiveThemeFilter] = useState(null);

  // Cross-cutting themes with color information to ensure contrast
  const crossCuttingThemes = [
    {
      name: "Ethics",
      icon: <Leaf className="w-5 h-5" aria-hidden="true" focusable="false" />,
      color: "bg-emerald-800 text-white",
      description: "Ethics, sustainability, privacy, trust & transparency in technology"
    },
    {
      name: "Storytelling",
      icon: <BookOpen className="w-5 h-5" aria-hidden="true" focusable="false" />,
      color: "bg-amber-800 text-white",
      description: "Creating emotional connections through narrative and storytelling"
    },
    {
      name: "Personalisation",
      icon: <Sliders className="w-5 h-5" aria-hidden="true" focusable="false" />,
      color: "bg-indigo-800 text-white",
      description: "Customising experiences for individual users and preferences"
    },
    {
      name: "Community building",
      icon: <Users className="w-5 h-5" aria-hidden="true" focusable="false" />,
      color: "bg-rose-800 text-white",
      description: "Creating and nurturing digital and physical communities"
    },
    {
      name: "Phygital integration",
      icon: <Merge className="w-5 h-5" aria-hidden="true" focusable="false" />,
      color: "bg-purple-800 text-white",
      description: "The coming together of physical and digital worlds"
    },
    {
      name: "Data & analytics",
      icon: <BarChart2 className="w-5 h-5" aria-hidden="true" focusable="false" />,
      color: "bg-blue-800 text-white",
      description: "Collection, analysis and interpretation of data across technologies"
    },
    {
      name: "Using tools",
      icon: <Wrench className="w-5 h-5" aria-hidden="true" focusable="false" />,
      color: "bg-orange-800 text-white",
      description: "Pages where you will try out using some tools yourself"
    },
    {
      name: "Assessment prep",
      icon: <ClipboardList className="w-5 h-5" aria-hidden="true" focusable="false" />,
      color: "bg-lime-800 text-white",
      description: "Exercises that may help in preparing for assignments"
    }
  ];
  
  // Main course themes with high-contrast colors
  const mainThemes = [
    {
      id: "landscape",
      title: "The landscape",
      color: "bg-blue-100 text-blue-900 border-blue-900",
      sessions: [1]
    },
    {
      id: "immersive",
      title: "Immersive technologies and experiences",
      color: "bg-green-100 text-green-900 border-green-900",
      sessions: [2, 3, 4]
    },
    {
      id: "intelligent",
      title: "Intelligent technologies",
      color: "bg-amber-100 text-amber-900 border-amber-900",
      sessions: [5, 6, 7]
    },
    {
      id: "decentralised",
      title: "Decentralised technologies and IoT",
      color: "bg-purple-100 text-purple-900 border-purple-900",
      sessions: [8, 9]
    },
    {
      id: "implementation",
      title: "The future",
      color: "bg-pink-100 text-pink-800 border-pink-800",
      sessions: [10]
    }
  ];

  // Sessions data
  const sessions = {
    1: {
      title: "Introduction: The current technology landscape",
      theme: "landscape",
      topics: ["Overview of the module", "4IR basics"],
      crossCutting: [],
      pages: [
        { title: "1.1: Introduction", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/IjoDHyC_VH/screens/LbViO9Qblu", crossCutting: [] },
        { title: "1.2: Mapping the module", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/IjoDHyC_VH/screens/02au9CY8F", crossCutting: [] },
        { title: "1.3: Module assessment", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/IjoDHyC_VH/screens/UCWgS7gYH", crossCutting: [7] },
        { title: "1.4: The Fourth Industrial Revolution", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/IjoDHyC_VH/screens/KM205JT4-", crossCutting: [4] },
        { title: "1.5: The Martech landscape", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/IjoDHyC_VH/screens/NXyDTKBIR", crossCutting: [0, 6] },
        { title: "1.6: The Gartner hype cycle", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/IjoDHyC_VH/screens/JA6A0z37t", crossCutting: [] },
        { title: "1.7: The digital landscape", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/IjoDHyC_VH/screens/PlNkndx75", crossCutting: [5, 6] },
        { title: "1.8: Personas and target audience", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/IjoDHyC_VH/screens/12sGRnJbR", crossCutting: [6, 7] },
        { title: "1.9: Live class: Introduction to the module and assessment", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/IjoDHyC_VH/screens/3kcfCRmi7", crossCutting: [] },
        { title: "1.10: Session review", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/IjoDHyC_VH/screens/EhC2aNcJ8x", crossCutting: [] }
      ]
    },
    2: {
      title: "What are immersive experiences?",
      theme: "immersive",
      topics: ["VR/AR hardware", "Metaverse overview"],
      crossCutting: [],
      pages: [
        { title: "2.1: Introduction", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/7XemL9prDO/screens/vxitBJ_HZ", crossCutting: [] },
        { title: "2.2: Immersive experiences and the metaverse", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/7XemL9prDO/screens/ueP4S1Fy8", crossCutting: [4] },
        { title: "2.3: Immersive content and marketing", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/7XemL9prDO/screens/1iLoTXE1h", crossCutting: [1, 5, 2] },
        { title: "2.4: Defining VR, AR, MR and XR", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/7XemL9prDO/screens/oDYoYjiq9", crossCutting: [4] },
        { title: "2.5: Equipment: From headsets to haptics", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/7XemL9prDO/screens/4GzAPIKij", crossCutting: [4, 0, 2] },
        { title: "2.6: Virtual stores: Immersed on the web and mobile", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/7XemL9prDO/screens/iM6mf6S0l", crossCutting: [4, 5, 1, 2] },
        { title: "2.7: Creating your own virtual showroom", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/7XemL9prDO/screens/DIObXHo4O", crossCutting: [6, 7] },
        { title: "2.8: Session review", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/7XemL9prDO/screens/aLlK7bRsT", crossCutting: [] }
      ]
    },
    3: {
      title: "Virtual and augmented reality in practice",
      theme: "immersive",
      topics: ["Case studies", "Marketing applications"],
      crossCutting: [],
      pages: [
        { title: "3.1: Introduction", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/e9Hyowbzg/screens/Q3Ar8wRu8K", crossCutting: [] },
        { title: "3.2: From 'push' to 'pull' using immersive experiences", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/e9Hyowbzg/screens/ByXAq2qad", crossCutting: [1, 4] },
        { title: "3.3: Immersive case study 1: GSK", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/e9Hyowbzg/screens/fVquIPP_b", crossCutting: [1, 4, 3] },
        { title: "3.4: Immersive case study 2: Thomas Cook", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/e9Hyowbzg/screens/4MVa0Agxp", crossCutting: [4] },
        { title: "3.5: Immersive case study 3: M&M's and Maltesers", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/e9Hyowbzg/screens/ZG3cM2G2d", crossCutting: [4, 7] },
        { title: "3.6: Immersive case study 4: Snapchat", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/e9Hyowbzg/screens/ppIs-fAFR", crossCutting: [4] },
        { title: "3.7: Virtual influencers", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/e9Hyowbzg/screens/kRm1vxinr", crossCutting: [1, 3, 0] },
        { title: "3.8: Creating your own virtual influencer", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/e9Hyowbzg/screens/AW3-pa5db", crossCutting: [6, 7, 3] },
        { title: "3.9: Assignment: Start-up brand presentation", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/e9Hyowbzg/screens/X-9LTKkqG", crossCutting: [] },
        { title: "3.10: Live class: Masterclass on immersive technologies", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/e9Hyowbzg/screens/f7Krn05kb", crossCutting: [] },
        { title: "3.11: Session review", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/e9Hyowbzg/screens/HVW_OUnLPY", crossCutting: [] }
      ]
    },
    4: {
      title: "Creating immersive content",
      theme: "immersive",
      topics: ["Building Blocks", "Storytelling"],
      crossCutting: [],
      pages: [
        { title: "4.1: Introduction", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/VG4M18TPCp/screens/VcgZRmaKmO", crossCutting: [] },
        { title: "4.2: From goals to creation", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/VG4M18TPCp/screens/T9dUh2TLW", crossCutting: [1, 7] },
        { title: "4.3: Storytelling", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/VG4M18TPCp/screens/bC7RNv_q-", crossCutting: [1, 2, 7] },
        { title: "4.4: Key elements of immersive content", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/VG4M18TPCp/screens/_zdclSwz3", crossCutting: [1, 2, 0] },
        { title: "4.5: Evaluating immersive content", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/VG4M18TPCp/screens/IOqPFoE5T", crossCutting: [1, 0] },
        { title: "4.6: Creating an immersive media asset", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/VG4M18TPCp/screens/TlwGvzdlD", crossCutting: [6, 1] },
        { title: "4.7: Creating a 3D object", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/VG4M18TPCp/screens/wCR4km9D-", crossCutting: [6] },
        { title: "4.8: Developing your virtual showroom", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/VG4M18TPCp/screens/XIrBtnkgR", crossCutting: [6, 7] },
        { title: "4.9: Session review", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/VG4M18TPCp/screens/Dr4gFFUMMv", crossCutting: [] }
      ]
    },
    5: {
      title: "What are intelligent technologies?",
      theme: "intelligent",
      topics: ["AI Origins", "Machine Learning basics"],
      crossCutting: [],
      pages: [
        { title: "5.1: Introduction", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/bZiW47JF31/screens/1znvglwHS3", crossCutting: [] },
        { title: "5.2: The origins of AI", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/bZiW47JF31/screens/b54FB_vnY", crossCutting: [] },
        { title: "5.3: What is AI?", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/bZiW47JF31/screens/w1i8w434d", crossCutting: [5, 0] },
        { title: "5.4: The Turing test", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/bZiW47JF31/screens/jvba_Pgo5", crossCutting: [0] },
        { title: "5.5: What is machine learning (ML)?", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/bZiW47JF31/screens/Vl6Zf-pdy", crossCutting: [5] },
        { title: "5.6: Applications of ML, and bias", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/bZiW47JF31/screens/rzxzLLjSO", crossCutting: [5, 2, 0] },
        { title: "5.7: What is deep learning?", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/bZiW47JF31/screens/K3vXGr6Hl", crossCutting: [5] },
        { title: "5.8: Live class: Masterclass on intelligent technologies", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/bZiW47JF31/screens/ncxUe-QtQ", crossCutting: [] },
        { title: "5.9: Session review", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/bZiW47JF31/screens/h4BtRQ-F1f", crossCutting: [] }
      ]
    },
    6: {
      title: "AI in practice: Part 1",
      theme: "intelligent",
      topics: ["AI Applications", "Chatbots", "Virtual Assistants"],
      crossCutting: [],
      pages: [
        { title: "6.1: Introduction", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/A9S0WxGtOa/screens/1sGgfurfpH", crossCutting: [] },
        { title: "6.2: Where and how is AI used in practice?", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/A9S0WxGtOa/screens/-Re9omSZt", crossCutting: [2, 5] },
        { title: "6.3: Chatbots", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/A9S0WxGtOa/screens/fCoB5smdx", crossCutting: [2, 5] },
        { title: "6.4: Virtual assistants and AI agents", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/A9S0WxGtOa/screens/ktL2Iqr45", crossCutting: [2] },
        { title: "6.5: Building your own chatbot", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/A9S0WxGtOa/screens/yZIh2_iPK", crossCutting: [6, 0] },
        { title: "6.6: Generative AI", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/A9S0WxGtOa/screens/Kx_PB1wLT", crossCutting: [6, 0, 2, 1, 7] },
        { title: "6.7: GenAI for marketing content creation", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/A9S0WxGtOa/screens/uJbXQ8HeR", crossCutting: [6, 1, 7] },
        { title: "6.8: Ethical AI", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/A9S0WxGtOa/screens/5dG3DKrDU", crossCutting: [0, 2, 5] },
        { title: "6.9: Session review", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/A9S0WxGtOa/screens/wBr6VB23Dw", crossCutting: [] }
      ]
    },
    7: {
      title: "AI in practice: Part 2",
      theme: "intelligent",
      topics: ["Predictive Analytics", "Personalization", "Sentiment Analysis"],
      crossCutting: [],
      pages: [
        { title: "7.1: Introduction", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/ZAik3VaOjl/screens/8UOnodIA_", crossCutting: [] },
        { title: "7.2: AI and marketing analytics", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/ZAik3VaOjl/screens/5a_h9VE1w", crossCutting: [5, 6] },
        { title: "7.3: AI and predictive analytics", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/ZAik3VaOjl/screens/GC3uXbSKN", crossCutting: [5, 2] },
        { title: "7.4: AI-driven personalisation and targeting", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/ZAik3VaOjl/screens/Jc_4iUcaJ", crossCutting: [7, 2, 4] },
        { title: "7.5: Visual search", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/ZAik3VaOjl/screens/lQgJ331Gz", crossCutting: [4, 2] },
        { title: "7.6: Sentiment analysis in social media", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/ZAik3VaOjl/screens/CGD6dTx0d", crossCutting: [1, 5, 2, 6] },
        { title: "7.7: Live tutorial: Group assignment Q&A", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/ZAik3VaOjl/screens/gLln6ZxMl", crossCutting: [] },
        { title: "7.8: Session review", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/ZAik3VaOjl/screens/X1XU_656SI", crossCutting: [] }
      ]
    },
    8: {
      title: "What are decentralised technologies?",
      theme: "decentralised",
      topics: ["Blockchain", "Smart Contracts", "NFTs"],
      crossCutting: [],
      pages: [
        { title: "8.1: Introduction", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/LGXVC7BYNK/screens/-M4IGJ0Ayo", crossCutting: [] },
        { title: "8.2: What is blockchain?", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/LGXVC7BYNK/screens/05AH3G-na", crossCutting: [5] },
        { title: "8.3: Blockchain in the supply chain", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/LGXVC7BYNK/screens/PCZL4PaB_", crossCutting: [0, 4, 5] },
        { title: "8.4: Smart contracts", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/LGXVC7BYNK/screens/M02OCW_I2", crossCutting: [] },
        { title: "8.5: NFTs and digital ownership", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/LGXVC7BYNK/screens/U5iuWyBrO", crossCutting: [3, 4, 1, 2] },
        { title: "8.6: Cryptocurrencies as Decentralised Finance (DeFi)", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/LGXVC7BYNK/screens/2RVG8USuw", crossCutting: [0, 3] },
        { title: "8.7: Further applications of blockchain in marketing", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/LGXVC7BYNK/screens/5kNc2I7ZZ", crossCutting: [7, 1, 2, 5, 0, 4, 3] },
        { title: "8.8: Live class: Masterclass on decentralised technologies", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/LGXVC7BYNK/screens/WtNN4FTkK", crossCutting: [] },
        { title: "8.9: Session review", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/LGXVC7BYNK/screens/lLHLX2Bctu", crossCutting: [] }
      ]
    },
    9: {
      title: "IoT, Web 3.0 and the metaverse",
      theme: "decentralised",
      topics: ["Internet of Things", "Web 3.0", "Metaverse Integration"],
      crossCutting: [],
      pages: [
        { title: "9.1: Introduction", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/KhyfcsNjIp/screens/_NypQha6YP", crossCutting: [] },
        { title: "9.2: What is the Internet of Things (IoT)?", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/KhyfcsNjIp/screens/5ILGwMQ-8", crossCutting: [4, 5, 0] },
        { title: "9.3: IoT in action: From smart homes to smart cities", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/KhyfcsNjIp/screens/GH6nrs2cZ", crossCutting: [4, 5, 2, 0] },
        { title: "9.4: IoT for marketers", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/KhyfcsNjIp/screens/PbFcgWjkS", crossCutting: [4, 5, 2] },
        { title: "9.5: Web3 and Web 3.0", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/KhyfcsNjIp/screens/bmyDM5rxX", crossCutting: [3, 5, 0] },
        { title: "9.6: Building communities on Web 3.0", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/KhyfcsNjIp/screens/wJ_RzfLOr", crossCutting: [3, 5, 0, 2] },
        { title: "9.7: The development of the metaverse in Web 3.0", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/KhyfcsNjIp/screens/4KkS6bqV2", crossCutting: [4, 3, 2] },
        { title: "9.8: Assignment: Marketing campaign proposal", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/KhyfcsNjIp/screens/NJBUlz_qZ", crossCutting: [] },
        { title: "9.9: Live tutorial: Individual assignment Q&A", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/KhyfcsNjIp/screens/63t95HIKM", crossCutting: [] },
        { title: "9.10: Session review", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/KhyfcsNjIp/screens/fqjX40gJOt", crossCutting: [] }
      ]
    },
    10: {
      title: "The future of technologies in marketing",
      theme: "implementation",
      topics: ["Industry 5.0", "Future Skills", "Career Paths"],
      crossCutting: [],
      pages: [
        { title: "10.1: Introduction", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/PNutEhovZf/screens/_ObjHGZgGT", crossCutting: [] },
        { title: "10.2: Liquid society", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/PNutEhovZf/screens/ZnGOnxyTT", crossCutting: [4, 0, 3, 5] },
        { title: "10.3: Marketing in Industry 5.0", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/PNutEhovZf/screens/ss43KKFhs", crossCutting: [4, 0, 3] },
        { title: "10.4: Jobs for future marketers", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/PNutEhovZf/screens/4k0jtDSKS", crossCutting: [] },
        { title: "10.5: Skills for future marketers", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/PNutEhovZf/screens/sXJhw7i5W", crossCutting: [] },
        { title: "10.6: Your feedback on this module", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/PNutEhovZf/screens/RVPbgXuqE", crossCutting: [] },
        { title: "10.7: Session review", url: "https://imperial.insendi.com/programmes/QzMa1GfyK/courses/UhvsPgT_ML/weeks/PNutEhovZf/screens/7iqApN8iQK", crossCutting: [] }
      ]
    }
  };
  

  // Handle theme expansion/collapse
  const toggleTheme = (themeId) => {
    setExpandedTheme(expandedTheme === themeId ? null : themeId);
  };

  // Handle filter change
  const toggleThemeFilter = (themeIdx) => {
    setActiveThemeFilter(activeThemeFilter === themeIdx ? null : themeIdx);
  };

  // Check if a session has the selected cross-cutting theme
  const sessionHasTheme = (sessionId, themeId) => {
    if (themeId === null) return false;
    const session = sessions[sessionId];
    
    // Check at session level
    if (session.crossCutting.includes(themeId)) {
      return true;
    }
    
    // Check at page level
    return session.pages.some(page => page.crossCutting.includes(themeId));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-full">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
        Technologies in Marketing – Module map
      </h1>

{/* Cross-cutting theme filters */}
<div className="mb-8" role="region" aria-label="Cross-cutting theme filters">
  <h2 className="text-lg font-medium mb-3 text-center" id="cross-cutting-themes-heading">Cross-cutting themes</h2>
  <div 
    className="flex flex-wrap justify-center gap-2"
    role="group" 
    aria-labelledby="cross-cutting-themes-heading"
  >
    {crossCuttingThemes.map((theme, idx) => (
      <button
        key={idx}
        onClick={() => toggleThemeFilter(idx)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg 
          transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${
            activeThemeFilter === idx
              ? `${theme.color} shadow-md border-2 border-current`
              : 'bg-white text-gray-800 border hover:bg-gray-100'
          }
        `}
        aria-pressed={activeThemeFilter === idx}
        aria-label={`Filter by ${theme.name}: ${theme.description}`}
      >
        <span aria-hidden="true">
          {theme.icon}
        </span>
        <span>{theme.name}</span>
      </button>
    ))}
  </div>
</div>

{/* Focus management element */}
<div tabIndex="-1" aria-hidden="true" className="sr-only">Main content sections</div>

      {/* Main themes sections */}
      <div className="space-y-6">
        {mainThemes.map((theme) => {
          // Filter sessions in this theme that match the selected cross-cutting theme
          const themeSessions = theme.sessions
            .filter(sessionId => 
              activeThemeFilter === null || 
              sessionHasTheme(sessionId, activeThemeFilter)
            )
            .map(sessionId => ({ id: sessionId, ...sessions[sessionId] }));

          // Skip rendering if no sessions match the filter
          if (activeThemeFilter !== null && themeSessions.length === 0) {
            return null;
          }

          const isExpanded = expandedTheme === theme.id;

          return (
            <div
  key={theme.id}
  /*role="region" */
  aria-labelledby={`theme-heading-${theme.id}`}
  className={`border rounded-lg shadow-sm overflow-hidden ${
    isExpanded ? 'shadow-md' : ''
  }`}
>
              {/* Theme header */}
{/* Theme header */}
{/* Theme header with proper heading hierarchy */}
<div className="border-0 p-0 m-0">
<h2 id={`theme-heading-${theme.id}`} className="m-0 p-0">
<button
    id={`theme-button-${theme.id}`}
    onClick={() => toggleTheme(theme.id)}
    onFocus={(e) => {
      // Force focus to this button when SR navigates to it
      e.currentTarget.focus();
    }}
    className={`w-full p-4 flex items-center justify-between ${theme.color} border-2 border-current text-xl font-bold text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
    aria-expanded={isExpanded}
    aria-controls={`theme-content-${theme.id}`}
  >

    {theme.title}
    <div className="flex items-center">
      <span className="mr-2 text-sm font-medium">
        {themeSessions.length}{' '}
        {themeSessions.length === 1 ? 'Session' : 'Sessions'}
      </span>
      <span aria-hidden="true">
        {isExpanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </span>
    </div>
  </button>
</h2>
</div>

              {/* Expanded content showing sessions */}
              {isExpanded && (
                <div id={`theme-content-${theme.id}`} className="divide-y">
                  {themeSessions.map((session) => {
                    const sessionHasActiveTheme =
                      activeThemeFilter !== null &&
                      session.crossCutting.includes(activeThemeFilter);

                    // Filter pages that match the active cross-cutting theme
                    const highlightedPages = activeThemeFilter !== null
                      ? session.pages.filter(page => page.crossCutting.includes(activeThemeFilter))
                      : [];

                    return (
                      <div className="p-4 bg-white" key={session.id}>
<div className="flex items-start justify-between mb-3">
  <div className="text-base font-bold">
    Session {session.id}: {session.title}
    {sessionHasActiveTheme && activeThemeFilter !== null && (
      <span className="ml-2 text-sm font-medium text-indigo-800">
        (Includes {crossCuttingThemes[activeThemeFilter].name} theme)
      </span>
    )}
  </div>
  
  {/* Theme icons */}
  {session.crossCutting.length > 0 && (
    <div className="flex flex-wrap gap-1 ml-2">
      {session.crossCutting.map(themeIdx => {
        const t = crossCuttingThemes[themeIdx];
        return (
          <Tooltip key={themeIdx} text={`${t.name}: ${t.description}`}>
            <span
              className={`
                w-5 h-5 flex items-center justify-center rounded-full
                ${activeThemeFilter === themeIdx ? t.color : 'bg-gray-200 text-gray-800'}
              `}
            >
              {React.cloneElement(t.icon, {
                'aria-hidden': 'true',
                focusable: 'false'
              })}
              <span className="sr-only">{t.name}</span>
            </span>
          </Tooltip>
        );
      })}
    </div>
  )}
</div>
                        {/* Pages listed in columns (top-to-bottom, then next column) */}
                        <div className="columns-1 md:columns-2 gap-4">
                          {session.pages.map((page, pageIdx) => {
                            const pageHasActiveTheme =
                              activeThemeFilter !== null &&
                              page.crossCutting.includes(activeThemeFilter);

                            return (
                              <div
                                key={pageIdx}
                                className={`
                                  mb-2 p-2 break-inside-avoid rounded flex items-center
                                  ${ pageHasActiveTheme ? '' : 'border border-transparent' }
                                `}
                                style={ pageHasActiveTheme ? { backgroundColor: '#FFF7CC', border: '1px solid #E6DFA6' } : {} }
                                aria-label={`${page.title}${
                                  pageHasActiveTheme && activeThemeFilter !== null
                                    ? `, contains ${crossCuttingThemes[activeThemeFilter].name} theme`
                                    : ''
                                }`}
                              >
                                {/* Updated the title container to allow wrapping */}
                                <div className="flex-1 whitespace-normal break-words">
                                <a 
  href={page.url} 
  target="_blank" 
  rel="noopener noreferrer" 
  className="text-blue-600 hover:underline focus:ring-2 focus:ring-blue-500 focus:outline-none rounded px-1"
  aria-label={pageHasActiveTheme && activeThemeFilter !== null
    ? `${page.title}, contains ${crossCuttingThemes[activeThemeFilter].name} theme`
    : undefined}
>
  {page.title}
</a>
                                </div>


{/* Icons for cross-cutting themes at the page level */}
{page.crossCutting.length > 0 && (
  <div className="flex ml-2">
    {page.crossCutting.map(themeIdx => {
      const t = crossCuttingThemes[themeIdx];
      return (
        <Tooltip
          key={themeIdx}
          text={`${t.name}:\n${t.description}`}
        >
          <span
            className={`
              w-4 h-4 ml-1 flex items-center justify-center rounded-full
              ${
                activeThemeFilter === themeIdx
                  ? t.color
                  : 'bg-gray-200 text-gray-800'
              }
            `}
          >
            {React.cloneElement(t.icon, {
              'aria-hidden': 'true',
              focusable: 'false',
              className: 'w-3 h-3'
            })}
            <span className="sr-only">{t.name}</span>
          </span>
        </Tooltip>
      );
    })}
  </div>
)}                          </div>
                            );
                          })}
                        </div>

                        {/* If filtering is active, show a summary of matched pages */}
                        {activeThemeFilter !== null && (
                          <div className="mt-3 pt-2 border-t text-sm text-gray-800 bg-gray-50 p-2 rounded" aria-hidden="true">
                            {highlightedPages.length > 0 ? (
                              <p>
                                <span className="font-medium">{highlightedPages.length}</span>{' '}
                                {highlightedPages.length === 1 ? 'page' : 'pages'} include the{' '}
                                {crossCuttingThemes[activeThemeFilter].name} theme
                                <span className="ml-2 font-medium text-xs text-indigo-800">
                                  (Highlighted pages)
                                </span>
                              </p>
                            ) : sessionHasActiveTheme ? (
                              <p>
                                This session includes the {crossCuttingThemes[activeThemeFilter].name} theme at
                                the session level.
                              </p>
                            ) : (
                              <p>
                                No pages in this session include the {crossCuttingThemes[activeThemeFilter].name} theme.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimplifiedCourseInterface;
