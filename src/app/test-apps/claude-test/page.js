"use client";
import React, { useState } from 'react';
import { Search, BookOpen } from 'lucide-react';

// Simple Marketing Concept Finder App
const MarketingConceptFinder = () => {
  // Marketing concepts database
  const concepts = [
    {
      term: "Marketing Mix (4Ps)",
      definition: "Product, Price, Place, Promotion. The four key elements that make up a company's marketing strategy.",
      example: "A smartphone company designs a new phone (Product), sets a premium price (Price), sells it through retail stores and online (Place), and creates TV ads and social media campaigns (Promotion)."
    },
    {
      term: "STP Marketing",
      definition: "Segmentation, Targeting, Positioning. A three-step strategic approach to effective market communication.",
      example: "A clothing retailer divides customers by age and style preference (Segmentation), focuses on young professionals (Targeting), and positions itself as affordable luxury fashion (Positioning)."
    },
    {
      term: "SWOT Analysis",
      definition: "Strengths, Weaknesses, Opportunities, Threats. A framework used to evaluate competitive position and develop strategic planning.",
      example: "A coffee chain might identify their quality beans as a Strength, high prices as a Weakness, international expansion as an Opportunity, and increasing competition as a Threat."
    },
    {
      term: "Market Segmentation",
      definition: "The process of dividing a market of potential customers into groups based on different characteristics.",
      example: "A car manufacturer segments the market by income level, family size, and lifestyle to create vehicles for specific consumer groups."
    },
    {
      term: "Brand Equity",
      definition: "The value premium a company generates from a product with a recognizable name compared to a generic equivalent.",
      example: "Consumers willingly pay more for Nike shoes compared to unbranded alternatives because of the perceived quality and status associated with the Nike brand."
    },
    {
      term: "Customer Lifetime Value (CLV)",
      definition: "The total worth of a customer to a business over the entire period of their relationship.",
      example: "A subscription service calculates that the average customer stays for 3 years and spends $50 monthly, making their CLV $1,800."
    },
    {
      term: "Conversion Rate",
      definition: "The percentage of visitors who take a desired action, such as making a purchase or signing up for a newsletter.",
      example: "An online store had 10,000 visitors last month and 300 made purchases, giving a conversion rate of 3%."
    },
    {
      term: "Value Proposition",
      definition: "A statement that clearly communicates the benefits a customer will receive by purchasing a product or service.",
      example: "Spotify's value proposition focuses on offering unlimited access to millions of songs on demand for a low monthly fee."
    },
    {
      term: "Blue Ocean Strategy",
      definition: "Creating uncontested market space (blue oceans) rather than competing in existing markets (red oceans).",
      example: "Cirque du Soleil created a new market space by reimagining circus entertainment with theatrical elements and eliminating the use of animals."
    },
    {
      term: "Porter's Five Forces",
      definition: "A framework for analyzing competition of a business based on five key factors: supplier power, buyer power, competitive rivalry, threat of substitution, and threat of new entry.",
      example: "A restaurant owner assesses the local market by examining supplier relationships, customer loyalty, nearby competing restaurants, alternative dining options, and the ease of opening a new restaurant in the area."
    },
    {
      term: "Content Marketing",
      definition: "Strategic marketing approach focused on creating and distributing valuable content to attract and engage a target audience.",
      example: "HubSpot publishes free marketing guides, templates, and blog posts to attract potential customers to their marketing software services."
    },
    {
      term: "Customer Persona",
      definition: "A semi-fictional representation of your ideal customer based on market research and real data about existing customers.",
      example: "A fitness app creates detailed personas including 'Busy Professional Paula' who wants quick workouts and 'Fitness Enthusiast Fred' who tracks detailed metrics about his training."
    },
    {
      term: "Net Promoter Score (NPS)",
      definition: "A metric for assessing customer loyalty, calculated by asking customers how likely they are to recommend your product/service on a scale of 0-10.",
      example: "A hotel surveys guests after their stay, finding that 70% are Promoters (9-10), 15% are Passives (7-8), and 15% are Detractors (0-6), resulting in an NPS of 55."
    },
    {
      term: "Omnichannel Marketing",
      definition: "A sales approach that provides customers with an integrated shopping experience across multiple channels.",
      example: "A retailer allows customers to browse products online, check in-store availability, purchase via mobile app, and pick up in-store or have items delivered."
    },
    {
      term: "Price Elasticity of Demand",
      definition: "A measure of how responsive quantity demanded is to a change in price.",
      example: "When a streaming service increases its subscription price by 20% and loses only 5% of subscribers, it demonstrates that its service has inelastic demand."
    }
  ];

  // State for search input and selected concept
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConcept, setSelectedConcept] = useState(null);

  // Filter concepts based on search term
  const filteredConcepts = concepts.filter(concept => 
    concept.term.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedConcept(null); // Clear selected concept when search changes
  };

  // Handle concept selection
  const handleConceptSelect = (concept) => {
    setSelectedConcept(concept);
    // When using a screen reader, announce the selection
    document.getElementById('selected-concept-announcement').textContent = 
      `${concept.term} selected. Definition shown below.`;
  };

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-6">
      {/* Announcement for screen readers */}
      <div id="selected-concept-announcement" className="sr-only" aria-live="polite"></div>
      
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Marketing Concept Finder</h1>
        <p className="text-gray-600">
          Find and understand key marketing concepts and theories
        </p>
      </header>

      {/* Search box */}
      <div className="relative max-w-md mx-auto mb-6">
        <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
          <div className="pl-3 text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search marketing concepts..."
            className="w-full p-3 outline-none text-gray-700"
            aria-label="Search marketing concepts"
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-6">
        {/* Concepts list */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <h2 className="font-bold text-lg p-3 bg-indigo-50 text-indigo-800 border-b border-gray-200">
            Marketing Concepts
          </h2>
          
          <ul 
            className="divide-y divide-gray-200 max-h-96 overflow-y-auto" 
            role="listbox"
            aria-label="List of marketing concepts"
          >
            {filteredConcepts.length > 0 ? (
              filteredConcepts.map((concept, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleConceptSelect(concept)}
                    className={`w-full text-left p-3 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors ${
                      selectedConcept && selectedConcept.term === concept.term 
                        ? 'bg-indigo-50 font-medium' 
                        : ''
                    }`}
                    role="option"
                    aria-selected={selectedConcept && selectedConcept.term === concept.term}
                  >
                    {concept.term}
                  </button>
                </li>
              ))
            ) : (
              <li className="p-4 text-gray-500 text-center">
                No matching concepts found
              </li>
            )}
          </ul>
        </div>

        {/* Concept details */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          {selectedConcept ? (
            <div>
              <h2 className="font-bold text-lg p-3 bg-indigo-50 text-indigo-800 border-b border-gray-200">
                {selectedConcept.term}
              </h2>
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">Definition</h3>
                  <p className="text-gray-600">{selectedConcept.definition}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Example</h3>
                  <p className="text-gray-600">{selectedConcept.example}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
              <BookOpen size={40} className="mb-3 text-gray-300" />
              <h2 className="text-lg font-medium mb-2">No Concept Selected</h2>
              <p>Select a marketing concept from the list to view its definition and example.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick tips */}
      <div className="max-w-3xl mx-auto mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
        <h3 className="font-medium mb-2">Study Tip:</h3>
        <p>
          Understanding these key marketing concepts will help you analyze case studies and develop comprehensive marketing strategies in your MSc program.
        </p>
      </div>
    </div>
  );
};

export default MarketingConceptFinder;