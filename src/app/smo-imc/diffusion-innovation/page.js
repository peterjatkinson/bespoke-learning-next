"use client";
import React, { useState } from 'react';
import { Users } from 'lucide-react';

const DiffusionOfInnovations = () => {
  const [selectedCategory, setSelectedCategory] = useState('innovators');

  // Define the categories with their properties
  const categories = [
    {
      id: 'innovators',
      name: 'Innovators',
      percentage: 2.5,
      iconCount: 2.5,
      colour: 'text-purple-600',
      bgColour: 'bg-purple-600',
      lightBgColour: 'bg-purple-50',
      borderColour: 'border-purple-600',
      focusColour: 'focus:ring-purple-500',
      description: 'Risk-takers who are first to try new things. They\'re willing to take chances and have the resources to absorb potential failures.',
      characteristics: ['Adventurous', 'Well-connected', 'Financial resources', 'Tolerant of uncertainty']
    },
    {
      id: 'early-adopters',
      name: 'Early adopters',
      percentage: 13.5,
      iconCount: 13.5,
      colour: 'text-blue-600',
      bgColour: 'bg-blue-600',
      lightBgColour: 'bg-blue-50',
      borderColour: 'border-blue-600',
      focusColour: 'focus:ring-blue-500',
      description: 'Opinion leaders who carefully evaluate innovations but are quick to adopt those they see as valuable. Others look to them for advice.',
      characteristics: ['Opinion leaders', 'Social status', 'Financial resources', 'Advanced education']
    },
    {
      id: 'early-majority',
      name: 'Early majority',
      percentage: 34,
      iconCount: 34,
      colour: 'text-green-600',
      bgColour: 'bg-green-600',
      lightBgColour: 'bg-green-50',
      borderColour: 'border-green-600',
      focusColour: 'focus:ring-green-500',
      description: 'Pragmatists who adopt innovations once they\'ve been proven successful by early adopters. They want to see evidence before committing.',
      characteristics: ['Deliberate', 'Many informal social contacts', 'Rarely opinion leaders', 'Above average social status']
    },
    {
      id: 'late-majority',
      name: 'Late majority',
      percentage: 34,
      iconCount: 34,
      colour: 'text-yellow-600',
      bgColour: 'bg-yellow-600',
      lightBgColour: 'bg-yellow-50',
      borderColour: 'border-yellow-600',
      focusColour: 'focus:ring-yellow-500',
      description: 'Sceptics who adopt innovations only after the majority has already done so, often due to peer pressure or necessity.',
      characteristics: ['Sceptical', 'Traditional', 'Lower social status', 'Little financial flexibility']
    },
    {
      id: 'laggards',
      name: 'Laggards',
      percentage: 16,
      iconCount: 16,
      colour: 'text-red-600',
      bgColour: 'bg-red-600',
      lightBgColour: 'bg-red-50',
      borderColour: 'border-red-600',
      focusColour: 'focus:ring-red-500',
      description: 'The most resistant to change, preferring traditional methods. They adopt innovations only when they have no other choice or when the innovation has become mainstream.',
      characteristics: ['Traditional', 'Lowest social status', 'Oldest', 'Isolated in social networks']
    }
  ];

  // Get the selected category object
  const activeCategory = categories.find(cat => cat.id === selectedCategory);

  // Render people icons for a category
  const renderPeopleIcons = (category) => {
    const fullIcons = Math.floor(category.iconCount);
    const hasHalfIcon = category.iconCount % 1 !== 0;
    const icons = [];
    const isActive = selectedCategory === category.id;

    // Add full icons
    for (let i = 0; i < fullIcons; i++) {
      icons.push(
        <Users 
          key={`${category.id}-full-${i}`} 
          className={`w-5 h-5 transition-all duration-300 ${
            isActive ? 'text-white' : category.colour
          }`}
          aria-hidden="true"
        />
      );
    }

    // Add half icon if needed - using opacity to represent 0.5
    if (hasHalfIcon) {
      icons.push(
        <Users 
          key={`${category.id}-half`} 
          className={`w-5 h-5 transition-all duration-300 opacity-50 ${
            isActive ? 'text-white' : category.colour
          }`}
          aria-hidden="true"
        />
      );
    }

    return icons;
  };

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Diffusion of Innovations
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Click on each category to see how innovations spread through a population according to Everett Rogers' theory.
          </p>
        </div>

        {/* Top section - People icons visualisation */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Population breakdown</h2>
            <p className="text-sm text-gray-600">Each icon represents 1% of the population</p>
          </div>
          
          {/* Category buttons with icons */}
          <div className="space-y-4">
            {categories.map((category) => {
              const isActive = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    w-full p-4 rounded-lg border-2 transition-all duration-300
                    ${isActive 
                      ? `${category.bgColour} ${category.borderColour} text-white shadow-lg` 
                      : `bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow`
                    }
                    focus:outline-none focus:ring-2 focus:ring-offset-2 ${category.focusColour}
                  `}
                  aria-pressed={isActive}
                  aria-label={`${category.name}: ${category.percentage}% of population. ${isActive ? 'Currently selected' : 'Click to view details'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold text-left ${isActive ? 'text-white' : 'text-gray-800'}`}>
                      {category.name}
                    </h3>
                    <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-600'}`}>
                      {category.percentage}%
                    </span>
                  </div>
                  
                  {/* People icons */}
                  <div className="flex flex-wrap gap-1 justify-start">
                    {renderPeopleIcons(category)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom section - Detailed explanation */}
        {activeCategory && (
          <div 
            className={`rounded-lg shadow-lg p-6 border-2 ${activeCategory.lightBgColour} ${activeCategory.borderColour}`}
            role="region"
            aria-live="polite"
            aria-label={`Details for ${activeCategory.name}`}
          >
            <h2 className={`text-2xl font-bold mb-4 ${activeCategory.colour}`}>
              {activeCategory.name}
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Description */}
              <div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {activeCategory.description}
                </p>
              </div>
              
              {/* Key characteristics */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Key characteristics:</h3>
                <ul className="space-y-2">
                  {activeCategory.characteristics.map((char, index) => (
                    <li key={index} className="flex items-start">
                      <span className={`mr-2 ${activeCategory.colour}`} aria-hidden="true">•</span>
                      <span className="text-gray-700">{char}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Statistics */}
              <div className={`border-t pt-4 ${activeCategory.borderColour}`}>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Percentage of population:</span>
                  <span className={`font-bold text-lg ${activeCategory.colour}`}>
                    {activeCategory.percentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiffusionOfInnovations;