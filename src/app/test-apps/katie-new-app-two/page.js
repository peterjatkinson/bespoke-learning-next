"use client";

import React, { useState } from 'react';
import jsPDF from 'jspdf';

const MarketIntelligenceScorecard = () => {
  // State for tracking active tab
  const [activeTab, setActiveTab] = useState('generation');
  
  // State for tracking current view (form or results)
  const [currentView, setCurrentView] = useState('form');
  
  // State for scores - using arrays to store the 8 scores for each category
  const [generationScores, setGenerationScores] = useState(Array(8).fill(0));
  const [disseminationScores, setDisseminationScores] = useState(Array(8).fill(0));
  const [responsivenessScores, setResponsivenessScores] = useState(Array(8).fill(0));

  // State for screen reader announcements
  const [liveMessage, setLiveMessage] = useState('');

  // Market intelligence generation statements
  const generationStatements = [
    'We have interdepartmental meetings at least once a quarter to discuss market trends and developments',
    'We are quick to detect fundamental shifts in our industry (e.g. competition, technology, regulation)',
    'We periodically review the likely effect of changes in our business environment (e.g. regulation) on customers',
    'We are fast to detect changes in our customers\' products and service preferences',
    'People here spend time discussing customers\' future needs with other functional departments/groups',
    'We do a lot of in-house market research',
    'We survey key customers at least once a year to assess the quality of our products and services',
    'In this business, we meet with key clients at least once a year to find out what products/services they will need in the future'
  ];

  // Market intelligence dissemination statements
  const disseminationStatements = [
    'When something important happens to a major customer or market, the whole business knows about it in a short period',
    'When one department finds out something important about competitors, it is quick to alert other departments',
    'We would never ignore changes in our customers\' product/service needs',
    'When we find that customers would like us to modify a product or service, the departments/groups involved make concerted efforts to do so',
    'We periodically review our product/service development efforts to ensure they are in line with what our key customers want',
    'We have effective communication systems in place that speed up the dissemination of important customer-related information',
    'All of our business functions and departments are responsive to each other\'s needs and requests',
    'When a customer complains or offers feedback, we are quick to share that information with anyone who can act on it'
  ];

  // Market intelligence responsiveness statements
  const responsivenessStatements = [
    'It takes very little time to decide how to respond to our competitors\' product and service changes',
    'We are able to implement new ideas (e.g. R&D efforts, marketing plans, product and service redesigns/enhancements) in a timely fashion',
    'Several departments/groups get together periodically to plan a response to changes taking place in our business environment',
    'If a major competitor were to start targeting one of our key customers aggressively, we would consider a response immediately',
    'We quickly act on customer complaints and feedback',
    'Our customer-facing employees have the latitude to solve customer problems quickly without much red tape and management involvement',
    'People here tend to talk more about opportunities rather than problems',
    'When we see a new opportunity to create value for our customers, we act on it quickly'
  ];

  // Handle score input change
  const handleScoreChange = (type, index, value) => {
    const numValue = parseInt(value) || 0;
    // Ensure value is between 0 and 5
    const clampedValue = Math.max(0, Math.min(5, numValue));
    
    if (type === 'generation') {
      const newScores = [...generationScores];
      newScores[index] = clampedValue;
      setGenerationScores(newScores);
    } else if (type === 'dissemination') {
      const newScores = [...disseminationScores];
      newScores[index] = clampedValue;
      setDisseminationScores(newScores);
    } else {
      const newScores = [...responsivenessScores];
      newScores[index] = clampedValue;
      setResponsivenessScores(newScores);
    }
  };

  // Calculate total scores
  const calculateTotalScores = () => {
    const generationTotal = generationScores.reduce((sum, score) => sum + score, 0);
    const disseminationTotal = disseminationScores.reduce((sum, score) => sum + score, 0);
    const responsivenessTotal = responsivenessScores.reduce((sum, score) => sum + score, 0);
    return { generationTotal, disseminationTotal, responsivenessTotal };
  };

  // Handle calculate score button
  const handleCalculateScore = () => {
    const { generationTotal, disseminationTotal, responsivenessTotal } = calculateTotalScores();
    setCurrentView('results');
    setLiveMessage(`Scores calculated. Market intelligence generation: ${generationTotal}, Market intelligence dissemination: ${disseminationTotal}, Responsiveness to market intelligence: ${responsivenessTotal}. Results are now displayed.`);
  };

  // Handle reset
  const handleReset = () => {
    setGenerationScores(Array(8).fill(0));
    setDisseminationScores(Array(8).fill(0));
    setResponsivenessScores(Array(8).fill(0));
    setCurrentView('form');
    setActiveTab('generation');
    setLiveMessage('All scores have been reset. You are now on the market intelligence generation scorecard.');
  };

  // Handle switch to answers
  const handleSwitchToAnswers = () => {
    setCurrentView('form');
    setLiveMessage('Switched back to answer view. You can now review and modify your scores.');
  };

  // Handle tab switching
  const handleTabSwitch = (tabName) => {
    setActiveTab(tabName);
    let tabDisplayName;
    switch(tabName) {
      case 'generation':
        tabDisplayName = 'Market intelligence generation scorecard';
        break;
      case 'dissemination':
        tabDisplayName = 'Market intelligence dissemination scorecard';
        break;
      case 'responsiveness':
        tabDisplayName = 'Responsiveness to market intelligence scorecard';
        break;
      default:
        tabDisplayName = 'scorecard';
    }
    setLiveMessage(`Switched to ${tabDisplayName} tab.`);
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    const { generationTotal, disseminationTotal, responsivenessTotal } = calculateTotalScores();
    
    // Create new jsPDF instance
    const doc = new jsPDF();
    let y = 30; // Starting Y position

    // Add title
    doc.setFontSize(20);
    doc.text('Market Intelligence Assessment Results', 20, y);
    y += 20;

    // Add overall scores
    doc.setFontSize(16);
    doc.text('Overall Results', 20, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Assessment of market intelligence generation: ${generationTotal}/40`, 20, y);
    y += 10;
    doc.text(`Assessment of market intelligence dissemination: ${disseminationTotal}/40`, 20, y);
    y += 10;
    doc.text(`Assessment of responsiveness to market intelligence: ${responsivenessTotal}/40`, 20, y);
    y += 20;

    // Helper function to add a new page if needed
    const checkPageBreak = (currentY, minSpaceRequired) => {
      // 280 is a safe lower margin for A4 size
      if (currentY + minSpaceRequired > 280) {
        doc.addPage();
        return 20; // New Y position on the next page
      }
      return currentY;
    };
    
    const lineHeight = 7;
    const spaceAfterScore = 12;

    // Add Market Intelligence Generation Breakdown
    y = checkPageBreak(y, 10);
    doc.setFontSize(16);
    doc.text('MARKET INTELLIGENCE GENERATION BREAKDOWN:', 20, y);
    y += 10;
    doc.setFontSize(12);
    generationStatements.forEach((statement, index) => {
      // Use splitTextToSize to get the number of lines
      const statementLines = doc.splitTextToSize(`${index + 1}. ${statement}`, 170);
      const statementHeight = statementLines.length * lineHeight;
      
      // Check for page break before printing the full block
      y = checkPageBreak(y, statementHeight + lineHeight + spaceAfterScore);

      doc.text(statementLines, 20, y);
      y += statementHeight;
      
      doc.text(`Score: ${generationScores[index]}/5`, 20, y);
      y += lineHeight + spaceAfterScore;
    });
    
    // Add Market Intelligence Dissemination Breakdown
    y = checkPageBreak(y, 10);
    doc.setFontSize(16);
    doc.text('MARKET INTELLIGENCE DISSEMINATION BREAKDOWN:', 20, y);
    y += 10;
    doc.setFontSize(12);
    disseminationStatements.forEach((statement, index) => {
      const statementLines = doc.splitTextToSize(`${index + 1}. ${statement}`, 170);
      const statementHeight = statementLines.length * lineHeight;
      
      y = checkPageBreak(y, statementHeight + lineHeight + spaceAfterScore);

      doc.text(statementLines, 20, y);
      y += statementHeight;

      doc.text(`Score: ${disseminationScores[index]}/5`, 20, y);
      y += lineHeight + spaceAfterScore;
    });
    
    // Add Responsiveness to Market Intelligence Breakdown
    y = checkPageBreak(y, 10);
    doc.setFontSize(16);
    doc.text('RESPONSIVENESS TO MARKET INTELLIGENCE BREAKDOWN:', 20, y);
    y += 10;
    doc.setFontSize(12);
    responsivenessStatements.forEach((statement, index) => {
      const statementLines = doc.splitTextToSize(`${index + 1}. ${statement}`, 170);
      const statementHeight = statementLines.length * lineHeight;
      
      y = checkPageBreak(y, statementHeight + lineHeight + spaceAfterScore);

      doc.text(statementLines, 20, y);
      y += statementHeight;

      doc.text(`Score: ${responsivenessScores[index]}/5`, 20, y);
      y += lineHeight + spaceAfterScore;
    });
    
    // Save the PDF
    doc.save('market-intelligence-assessment.pdf');
    
    setLiveMessage('PDF download would be generated here. In your Next.js project, install jsPDF library to enable this feature.');
  };

  // Get performance level based on score (adjusted for 8 statements max 40 points)
  const getPerformanceLevel = (score) => {
    if (score >= 34) return 'High';
    if (score >= 24) return 'Moderate';
    return 'Low';
  };

  // Results view
  if (currentView === 'results') {
    const { generationTotal, disseminationTotal, responsivenessTotal } = calculateTotalScores();
    
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white min-h-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Scorecards</h1>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            For each statement indicate to what extent you agree or disagree, using the scale:
          </p>
          <p className="text-gray-700 mb-4">
            1 = strongly disagree, 2 = disagree, 3 = neutral, 4 = agree, 5 = strongly agree.
          </p>
          <p className="text-gray-700 mb-6">
            The statements are split into three sections, with eight statements in each:
          </p>
          <ol className="text-gray-700 mb-6 ml-4">
            <li>1. Assessment of market intelligence <strong>generation</strong></li>
            <li>2. Assessment of market intelligence <strong>dissemination</strong></li>
            <li>3. Assessment of <strong>responsiveness</strong> to market intelligence.</li>
          </ol>
        </div>

        <h2 className="text-xl font-semibold mb-6">Results</h2>
        
        <div className="border border-gray-300 rounded-lg overflow-hidden mb-6">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-b border-gray-300 p-4 text-left" scope="col">
                  {/* Empty header for scorecard names */}
                </th>
                <th className="border-b border-gray-300 p-4 text-center" scope="col">
                  Total score
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b border-gray-300 p-4 text-right">
                  Assessment of market intelligence generation
                </td>
                <td className="border-b border-gray-300 p-4 text-center">
                  {generationTotal}
                </td>
              </tr>
              <tr>
                <td className="border-b border-gray-300 p-4 text-right">
                  Assessment of market intelligence dissemination
                </td>
                <td className="border-b border-gray-300 p-4 text-center">
                  {disseminationTotal}
                </td>
              </tr>
              <tr>
                <td className="border-b border-gray-300 p-4 text-right">
                  Assessment of responsiveness to market intelligence
                </td>
                <td className="border-b border-gray-300 p-4 text-center">
                  {responsivenessTotal}
                </td>
              </tr>
            </tbody>
          </table>
          
          <div className="bg-gray-50 p-4 text-right text-sm text-gray-600">
            <div className="italic">34–40 = High</div>
            <div className="italic">24–33 = Moderate</div>
            <div className="italic">8–23 = Low</div>
          </div>
        </div>

        {/* Screen reader live region for announcements */}
        <div 
          aria-live="assertive" 
          aria-atomic="true" 
          className="sr-only"
          role="status"
        >
          {liveMessage}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSwitchToAnswers}
            className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Switch to answers
          </button>
          <button
            onClick={handleDownloadPDF}
            className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Download PDF
          </button>
          <button
            onClick={handleReset}
            className="bg-white text-blue-900 px-6 py-2 rounded border border-blue-900 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Reset
          </button>
        </div>
      </div>
    );
  }

  // Form view
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white min-h-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Scorecards</h1>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          For each statement indicate to what extent you agree or disagree, using the scale:
        </p>
        <p className="text-gray-700 mb-4">
          1 = strongly disagree, 2 = disagree, 3 = neutral, 4 = agree, 5 = strongly agree.
        </p>
        <p className="text-gray-700 mb-6">
          The statements are split into three sections, with eight statements in each:
        </p>
        <ol className="text-gray-700 mb-6 ml-4">
          <li>1. Assessment of market intelligence <strong>generation</strong></li>
          <li>2. Assessment of market intelligence <strong>dissemination</strong></li>
          <li>3. Assessment of <strong>responsiveness</strong> to market intelligence.</li>
        </ol>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6" role="tablist" aria-label="Scorecard categories">
        <button
          role="tab"
          aria-selected={activeTab === 'generation'}
          aria-controls="generation-panel"
          id="generation-tab"
          onClick={() => handleTabSwitch('generation')}
          className={`flex-1 py-3 px-4 text-center font-medium border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            activeTab === 'generation'
              ? 'bg-blue-900 text-white border-blue-900'
              : 'bg-gray-100 text-blue-900 border-gray-300 hover:bg-gray-200'
          }`}
        >
          Assessment of market intelligence generation scorecard
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'dissemination'}
          aria-controls="dissemination-panel"
          id="dissemination-tab"
          onClick={() => handleTabSwitch('dissemination')}
          className={`flex-1 py-3 px-4 text-center font-medium border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            activeTab === 'dissemination'
              ? 'bg-blue-900 text-white border-blue-900'
              : 'bg-gray-100 text-blue-900 border-gray-300 hover:bg-gray-200'
          }`}
        >
          Assessment of market intelligence dissemination scorecard
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'responsiveness'}
          aria-controls="responsiveness-panel"
          id="responsiveness-tab"
          onClick={() => handleTabSwitch('responsiveness')}
          className={`flex-1 py-3 px-4 text-center font-medium border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            activeTab === 'responsiveness'
              ? 'bg-blue-900 text-white border-blue-900'
              : 'bg-gray-100 text-blue-900 border-gray-300 hover:bg-gray-200'
          }`}
        >
          Assessment of responsiveness to market intelligence scorecard
        </button>
      </div>

      {/* Market Intelligence Generation Tab */}
      <div
        role="tabpanel"
        id="generation-panel"
        aria-labelledby="generation-tab"
        className={activeTab === 'generation' ? 'block' : 'hidden'}
      >
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-b border-gray-300 p-4 text-left" scope="col">
                  My firm...
                </th>
                <th className="border-b border-gray-300 p-4 text-left w-20" scope="col">
                  Score (1–5)
                </th>
              </tr>
            </thead>
            <tbody>
              {generationStatements.map((statement, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border-b border-gray-300 p-4">
                    <label htmlFor={`generation-${index}`} className="block">
                      {statement}
                    </label>
                  </td>
                  <td className="border-b border-gray-300 p-4 text-center">
                    <input
                      id={`generation-${index}`}
                      type="number"
                      min="0"
                      max="5"
                      value={generationScores[index] || ''}
                      onChange={(e) => handleScoreChange('generation', index, e.target.value)}
                      className="w-16 px-2 py-1 border-2 border-gray-600 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-describedby="scale-description"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market Intelligence Dissemination Tab */}
      <div
        role="tabpanel"
        id="dissemination-panel"
        aria-labelledby="dissemination-tab"
        className={activeTab === 'dissemination' ? 'block' : 'hidden'}
      >
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-b border-gray-300 p-4 text-left" scope="col">
                  My firm...
                </th>
                <th className="border-b border-gray-300 p-4 text-left w-20" scope="col">
                  Score (1–5)
                </th>
              </tr>
            </thead>
            <tbody>
              {disseminationStatements.map((statement, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border-b border-gray-300 p-4">
                    <label htmlFor={`dissemination-${index}`} className="block">
                      {statement}
                    </label>
                  </td>
                  <td className="border-b border-gray-300 p-4 text-center">
                    <input
                      id={`dissemination-${index}`}
                      type="number"
                      min="0"
                      max="5"
                      value={disseminationScores[index] || ''}
                      onChange={(e) => handleScoreChange('dissemination', index, e.target.value)}
                      className="w-16 px-2 py-1 border-2 border-gray-600 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-describedby="scale-description"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Responsiveness to Market Intelligence Tab */}
      <div
        role="tabpanel"
        id="responsiveness-panel"
        aria-labelledby="responsiveness-tab"
        className={activeTab === 'responsiveness' ? 'block' : 'hidden'}
      >
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-b border-gray-300 p-4 text-left" scope="col">
                  My firm...
                </th>
                <th className="border-b border-gray-300 p-4 text-left w-20" scope="col">
                  Score (1–5)
                </th>
              </tr>
            </thead>
            <tbody>
              {responsivenessStatements.map((statement, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border-b border-gray-300 p-4">
                    <label htmlFor={`responsiveness-${index}`} className="block">
                      {statement}
                    </label>
                  </td>
                  <td className="border-b border-gray-300 p-4 text-center">
                    <input
                      id={`responsiveness-${index}`}
                      type="number"
                      min="0"
                      max="5"
                      value={responsivenessScores[index] || ''}
                      onChange={(e) => handleScoreChange('responsiveness', index, e.target.value)}
                      className="w-16 px-2 py-1 border-2 border-gray-600 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-describedby="scale-description"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screen reader live region for announcements */}
      <div 
        aria-live="assertive" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {liveMessage}
      </div>

      {/* Scale description for screen readers */}
      <div id="scale-description" className="sr-only">
        Scale: 1 equals strongly disagree, 2 equals disagree, 3 equals neutral, 4 equals agree, 5 equals strongly agree
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleCalculateScore}
          className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Calculate score
        </button>
        <button
          onClick={handleReset}
          className="bg-white text-blue-900 px-6 py-2 rounded border border-blue-900 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default MarketIntelligenceScorecard;