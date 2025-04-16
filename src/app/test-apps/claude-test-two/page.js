"use client";
import React, { useState } from 'react';
import { 
  ArrowDown, 
  Brain, 
  Star, 
  Zap, 
  MessageCircle, 
  CheckSquare
} from 'lucide-react';

const SimpleELM = () => {
  // State to track which route is being viewed
  const [activeRoute, setActiveRoute] = useState(null);
  
  // State to track which component is being viewed
  const [activeComponent, setActiveComponent] = useState(null);
  
  // Content for information panels
  const infoContent = {
    message: {
      title: 'Persuasive Message',
      description: 'The starting point - an advertisement, speech, article, or any communication designed to influence attitudes or behaviour.'
    },
    motivation: {
      title: 'Motivation to Process',
      description: 'Whether someone is motivated depends on personal relevance, need for cognition, and responsibility.'
    },
    ability: {
      title: 'Ability to Process',
      description: 'Factors affecting ability include distraction, message complexity, prior knowledge, and time.'
    },
    central: {
      title: 'Central Route Processing',
      description: 'Careful evaluation of arguments and evidence quality. Leads to enduring attitude change that predicts behaviour and resists counter-persuasion.'
    },
    peripheral: {
      title: 'Peripheral Route Processing',
      description: 'Reliance on simple cues like source attractiveness, credibility, or number of arguments rather than quality. Leads to temporary attitude change.'
    }
  };
  
  // Handle card click to show information
  const handleCardClick = (component) => {
    setActiveComponent(activeComponent === component ? null : component);
  };
  
  return (
    <div className="min-h-full bg-gray-50 p-4 font-sans">
      <header className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
          Elaboration Likelihood Model
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600">
          The ELM explains how people process persuasive messages through two routes: central (thoughtful analysis) 
          and peripheral (simple cues).
        </p>
        
        {/* Route selection buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeRoute === 'central' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
            }`}
            onClick={() => setActiveRoute('central')}
            aria-pressed={activeRoute === 'central'}
          >
            <Brain className="w-5 h-5" />
            <span>Central Route</span>
          </button>
          
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeRoute === 'peripheral' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-green-600 border border-green-300 hover:bg-green-50'
            }`}
            onClick={() => setActiveRoute('peripheral')}
            aria-pressed={activeRoute === 'peripheral'}
          >
            <Star className="w-5 h-5" />
            <span>Peripheral Route</span>
          </button>
          
          {activeRoute && (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={() => setActiveRoute(null)}
              aria-label="Clear route selection"
            >
              <span>Clear</span>
            </button>
          )}
        </div>
      </header>
      
      {/* Main ELM diagram */}
      <div className="max-w-3xl mx-auto">
        {/* Persuasive Message */}
        <div className="mb-6">
          <div 
            className={`relative p-4 border-2 rounded-lg max-w-md mx-auto text-center cursor-pointer transition-colors ${
              activeComponent === 'message' 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-300 hover:border-purple-200 hover:bg-purple-50'
            }`}
            onClick={() => handleCardClick('message')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick('message');
              }
            }}
            tabIndex="0"
            role="button"
            aria-expanded={activeComponent === 'message'}
            aria-controls="message-info"
          >
            <div className="flex justify-center mb-2">
              <MessageCircle className="w-6 h-6 text-purple-500" aria-hidden="true" />
            </div>
            <h2 className="font-bold text-gray-900">Persuasive Message</h2>
          </div>
          
          {/* Expanded information panel */}
          {activeComponent === 'message' && (
            <div 
              id="message-info" 
              className="mt-2 p-4 bg-white rounded-lg shadow-md max-w-md mx-auto"
            >
              <h3 className="font-bold text-purple-800">{infoContent.message.title}</h3>
              <p className="mt-1 text-gray-700">{infoContent.message.description}</p>
            </div>
          )}
        </div>
        
        {/* Arrow down */}
        <div className="flex justify-center mb-6">
          <ArrowDown className="w-6 h-6 text-gray-400" aria-hidden="true" />
        </div>
        
        {/* Motivation to Process */}
        <div className="mb-6">
          <div 
            className={`relative p-4 border-2 rounded-lg max-w-md mx-auto text-center cursor-pointer transition-colors ${
              activeComponent === 'motivation' 
                ? 'border-yellow-500 bg-yellow-50' 
                : 'border-gray-300 hover:border-yellow-200 hover:bg-yellow-50'
            }`}
            onClick={() => handleCardClick('motivation')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick('motivation');
              }
            }}
            tabIndex="0"
            role="button"
            aria-expanded={activeComponent === 'motivation'}
            aria-controls="motivation-info"
          >
            <div className="flex justify-center mb-2">
              <Zap className="w-6 h-6 text-yellow-500" aria-hidden="true" />
            </div>
            <h2 className="font-bold text-gray-900">Motivated to Process?</h2>
            
            <div className="flex justify-between mt-3">
              <div className={`px-3 py-1 rounded-full text-sm ${
                activeRoute === 'central' 
                  ? 'bg-blue-100 text-blue-800 font-medium' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                YES
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                activeRoute === 'peripheral' 
                  ? 'bg-green-100 text-green-800 font-medium' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                NO
              </div>
            </div>
          </div>
          
          {/* Expanded information panel */}
          {activeComponent === 'motivation' && (
            <div 
              id="motivation-info" 
              className="mt-2 p-4 bg-white rounded-lg shadow-md max-w-md mx-auto"
            >
              <h3 className="font-bold text-yellow-800">{infoContent.motivation.title}</h3>
              <p className="mt-1 text-gray-700">{infoContent.motivation.description}</p>
              <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-100">
                <p className="text-sm text-gray-700"><strong>High motivation example:</strong> A person researching cars before making an expensive purchase</p>
              </div>
              <div className="mt-2 p-2 bg-green-50 rounded border border-green-100">
                <p className="text-sm text-gray-700"><strong>Low motivation example:</strong> A casual viewer watching TV advertisements for products they don't need</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Arrow or split path based on route */}
        <div className="flex justify-center mb-6">
          {activeRoute === 'peripheral' ? (
            <div className="w-full max-w-md flex justify-end">
              <div className="w-1/2 relative">
                <div className="absolute top-0 right-0 h-6 w-6 border-r-2 border-b-2 border-green-400" aria-hidden="true"></div>
              </div>
            </div>
          ) : (
            <ArrowDown className="w-6 h-6 text-gray-400" aria-hidden="true" />
          )}
        </div>
        
        {/* Ability to Process (only visible in central route or when no route selected) */}
        {(activeRoute !== 'peripheral' || !activeRoute) && (
          <div className="mb-6">
            <div 
              className={`relative p-4 border-2 rounded-lg max-w-md mx-auto text-center cursor-pointer transition-colors ${
                activeComponent === 'ability' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-200 hover:bg-blue-50'
              } ${activeRoute === 'central' ? 'border-blue-300' : ''}`}
              onClick={() => handleCardClick('ability')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick('ability');
                }
              }}
              tabIndex="0"
              role="button"
              aria-expanded={activeComponent === 'ability'}
              aria-controls="ability-info"
            >
              <div className="flex justify-center mb-2">
                <Brain className="w-6 h-6 text-blue-500" aria-hidden="true" />
              </div>
              <h2 className="font-bold text-gray-900">Ability to Process?</h2>
              
              <div className="flex justify-between mt-3">
                <div className={`px-3 py-1 rounded-full text-sm ${
                  activeRoute === 'central' 
                    ? 'bg-blue-100 text-blue-800 font-medium' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  YES
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  'bg-gray-100 text-gray-600'
                }`}>
                  NO
                </div>
              </div>
            </div>
            
            {/* Expanded information panel */}
            {activeComponent === 'ability' && (
              <div 
                id="ability-info" 
                className="mt-2 p-4 bg-white rounded-lg shadow-md max-w-md mx-auto"
              >
                <h3 className="font-bold text-blue-800">{infoContent.ability.title}</h3>
                <p className="mt-1 text-gray-700">{infoContent.ability.description}</p>
                <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-100">
                  <p className="text-sm text-gray-700"><strong>High ability example:</strong> A doctor reading a medical journal article in a quiet office</p>
                </div>
                <div className="mt-2 p-2 bg-green-50 rounded border border-green-100">
                  <p className="text-sm text-gray-700"><strong>Low ability example:</strong> A parent trying to read complex information while supervising young children</p>
                </div>
              </div>
            )}
            
            {/* Arrow to central processing */}
            {(activeRoute === 'central' || !activeRoute) && (
              <div className="flex justify-center my-6">
                <ArrowDown className={`w-6 h-6 ${activeRoute === 'central' ? 'text-blue-400' : 'text-gray-400'}`} aria-hidden="true" />
              </div>
            )}
          </div>
        )}
        
        {/* Route Processing and Outcomes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Central Route (only visible when central route is selected or no route is selected) */}
          {(activeRoute === 'central' || !activeRoute) && (
            <div className={`${!activeRoute ? 'md:col-span-1' : 'md:col-span-2'}`}>
              <div 
                className={`relative p-4 border-2 rounded-lg mx-auto text-center cursor-pointer transition-colors ${
                  activeComponent === 'central' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-200 hover:bg-blue-50'
                } ${activeRoute === 'central' ? 'border-blue-300' : ''}`}
                onClick={() => handleCardClick('central')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick('central');
                  }
                }}
                tabIndex="0"
                role="button"
                aria-expanded={activeComponent === 'central'}
                aria-controls="central-info"
              >
                <div className="flex justify-center mb-2">
                  <CheckSquare className="w-6 h-6 text-blue-500" aria-hidden="true" />
                </div>
                <h2 className="font-bold text-gray-900">Central Route Processing</h2>
                <p className="text-sm mt-1">Thoughtful consideration of arguments</p>
                
                <div className="mt-3 p-3 bg-blue-100 text-blue-800 rounded-lg">
                  <p className="font-medium">Enduring Attitude Change</p>
                  <p className="text-xs mt-1">Long-lasting, resistant to counter-persuasion</p>
                </div>
              </div>
              
              {/* Expanded information panel */}
              {activeComponent === 'central' && (
                <div 
                  id="central-info" 
                  className="mt-2 p-4 bg-white rounded-lg shadow-md mx-auto"
                >
                  <h3 className="font-bold text-blue-800">{infoContent.central.title}</h3>
                  <p className="mt-1 text-gray-700">{infoContent.central.description}</p>
                  <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-100">
                    <h4 className="font-medium text-blue-800">Marketing Strategies:</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• Provide detailed product information and specifications</li>
                      <li>• Present strong, logical arguments with evidence</li>
                      <li>• Use comparative advertising with objective benefits</li>
                      <li>• Include customer testimonials with specific details</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Peripheral Route (only visible when peripheral route is selected or no route is selected) */}
          {(activeRoute === 'peripheral' || !activeRoute) && (
            <div className={`${!activeRoute ? 'md:col-span-1' : 'md:col-span-2'}`}>
              <div 
                className={`relative p-4 border-2 rounded-lg mx-auto text-center cursor-pointer transition-colors ${
                  activeComponent === 'peripheral' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-green-200 hover:bg-green-50'
                } ${activeRoute === 'peripheral' ? 'border-green-300' : ''}`}
                onClick={() => handleCardClick('peripheral')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick('peripheral');
                  }
                }}
                tabIndex="0"
                role="button"
                aria-expanded={activeComponent === 'peripheral'}
                aria-controls="peripheral-info"
              >
                <div className="flex justify-center mb-2">
                  <Star className="w-6 h-6 text-green-500" aria-hidden="true" />
                </div>
                <h2 className="font-bold text-gray-900">Peripheral Route Processing</h2>
                <p className="text-sm mt-1">Focus on simple cues rather than message content</p>
                
                <div className="mt-3 p-3 bg-green-100 text-green-800 rounded-lg">
                  <p className="font-medium">Temporary Attitude Change</p>
                  <p className="text-xs mt-1">Short-term, easily changed by new information</p>
                </div>
              </div>
              
              {/* Expanded information panel */}
              {activeComponent === 'peripheral' && (
                <div 
                  id="peripheral-info" 
                  className="mt-2 p-4 bg-white rounded-lg shadow-md mx-auto"
                >
                  <h3 className="font-bold text-green-800">{infoContent.peripheral.title}</h3>
                  <p className="mt-1 text-gray-700">{infoContent.peripheral.description}</p>
                  <div className="mt-3 p-3 bg-green-50 rounded border border-green-100">
                    <h4 className="font-medium text-green-800">Marketing Strategies:</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• Use attractive visuals, music, and aesthetics</li>
                      <li>• Feature celebrity endorsements and influencers</li>
                      <li>• Emphasize limited-time offers and scarcity</li>
                      <li>• Display social proof (e.g., "10,000+ happy customers")</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Simple instructions */}
      <div className="text-center mt-6 text-gray-500 text-sm">
        <p>Click on any stage to learn more about the ELM model</p>
      </div>
    </div>
  );
};

export default SimpleELM;