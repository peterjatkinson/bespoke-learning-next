"use client";
import React, { useState } from 'react';
    import jsPDF from 'jspdf';


const CustomerProfitScorecard = () => {
  // State for tracking active tab
  const [activeTab, setActiveTab] = useState('customer');
  
  // State for tracking current view (form or results)
  const [currentView, setCurrentView] = useState('form');
  
  // State for scores - using arrays to store the 10 scores for each category
  const [customerScores, setCustomerScores] = useState(Array(10).fill(0));
  const [profitScores, setProfitScores] = useState(Array(10).fill(0));

  // State for screen reader announcements
  const [liveMessage, setLiveMessage] = useState('');

  // Customer selection audit statements
  const customerStatements = [
    'Knows exactly who our most profitable customers are',
    'Knows exactly how much the most profitable customers are worth compared with our average customers',
    'Understands exactly what factors make our most profitable customers so profitable',
    'Regularly monitors the key factors driving profitability',
    'Knows what the three most important expectations of our most profitable customers are',
    'Outperforms the competition with respect to understanding the needs of our most profitable customers',
    'Knows what proportion of customers generates adequate profits',
    'Knows what proportion of customers generates inadequate profits and is too costly to serve',
    'Has implemented processes specifically designed to attract highly profitable customers',
    'Has implemented processes specifically designed to identify costly customers'
  ];

  // Profit scorecard statements
  const profitStatements = [
    'Can clearly tell the difference between "good" profits and "bad" profits',
    'Sets daily priorities and makes decisions based on sources of good profits',
    'Always strives to build trust with the customer',
    'Has a lot of customers that would go out of their way to recommend the firm to others',
    'Encourages its salespeople to close a sale "no matter what"',
    'Employs a lot of fine print, with disclaimers, exclusion terms, etc.',
    'Tends to charge customers many extra fees for whatever reason',
    'Regularly uses marketing tactics such as heavy discounts, rebates, free financing, etc.',
    'Uses strategies to lock customers into long term contracts',
    'Tries to save money by limiting customer contact'
  ];

  // Handle score input change
  const handleScoreChange = (type, index, value) => {
    const numValue = parseInt(value) || 0;
    // Ensure value is between 0 and 5
    const clampedValue = Math.max(0, Math.min(5, numValue));
    
    if (type === 'customer') {
      const newScores = [...customerScores];
      newScores[index] = clampedValue;
      setCustomerScores(newScores);
    } else {
      const newScores = [...profitScores];
      newScores[index] = clampedValue;
      setProfitScores(newScores);
    }
    };
  // Handle tab switching
  const handleTabSwitch = (tabName) => {
    setActiveTab(tabName);
    const tabDisplayName = tabName === 'customer' ? 'Customer selection audit scorecard' : 'Profit scorecard';
    setLiveMessage(`Switched to ${tabDisplayName} tab.`);
  };

  // Calculate total scores
  const calculateTotalScores = () => {
    const customerTotal = customerScores.reduce((sum, score) => sum + score, 0);
    const profitTotal = profitScores.reduce((sum, score) => sum + score, 0);
    return { customerTotal, profitTotal };
  };

  // Handle calculate score button
  const handleCalculateScore = () => {
    const { customerTotal, profitTotal } = calculateTotalScores();
    setCurrentView('results');
    setLiveMessage(`Scores calculated. Customer selection audit: ${customerTotal}, Profit scorecard: ${profitTotal}. Results are now displayed.`);
  };

  // Handle reset
  const handleReset = () => {
    setCustomerScores(Array(10).fill(0));
    setProfitScores(Array(10).fill(0));
    setCurrentView('form');
    setActiveTab('customer');
    setLiveMessage('All scores have been reset. You are now on the customer selection audit scorecard.');
  };

  // Handle switch to answers
  const handleSwitchToAnswers = () => {
    setCurrentView('form');
    setLiveMessage('Switched back to answer view. You can now review and modify your scores.');
  };

  // Handle PDF download (requires jsPDF library in actual Next.js project)
  const handleDownloadPDF = () => {
   
    
    const doc = new jsPDF();
    const { customerTotal, profitTotal } = calculateTotalScores();
    
    // Set up the PDF
    doc.setFontSize(20);
    doc.text('Scorecard Results', 20, 30);
    
    // Overall results
    doc.setFontSize(16);
    doc.text('Overall Results', 20, 50);
    doc.setFontSize(12);
    doc.text(`Customer Selection Audit: ${customerTotal}/50`, 20, 65);
    doc.text(`Profit Scorecard: ${profitTotal}/50`, 20, 75);
    
    // Performance levels
    const customerLevel = getPerformanceLevel(customerTotal);
    const profitLevel = getPerformanceLevel(profitTotal);
    doc.text(`Customer Selection Performance: ${customerLevel}`, 20, 90);
    doc.text(`Profit Performance: ${profitLevel}`, 20, 100);
    
    // Customer selection audit breakdown
    doc.setFontSize(14);
    doc.text('Customer Selection Audit Breakdown', 20, 120);
    doc.setFontSize(10);
    let yPos = 135;
    customerStatements.forEach((statement, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${index + 1}. ${statement}`, 20, yPos);
      doc.text(`Score: ${customerScores[index]}/5`, 20, yPos + 8);
      yPos += 20;
    });
    
    // Profit scorecard breakdown
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Profit Scorecard Breakdown', 20, 30);
    doc.setFontSize(10);
    yPos = 45;
    profitStatements.forEach((statement, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${index + 1}. ${statement}`, 20, yPos);
      doc.text(`Score: ${profitScores[index]}/5`, 20, yPos + 8);
      yPos += 20;
    });
    
    // Save the PDF
    doc.save('scorecard-results.pdf');
   
    
    // Placeholder for Claude environment
  };

  // Get performance level based on score
  const getPerformanceLevel = (score) => {
    if (score >= 43) return 'High';
    if (score >= 30) return 'Moderate';
    return 'Low';
  };

  // Results view
  if (currentView === 'results') {
    const { customerTotal, profitTotal } = calculateTotalScores();
    
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white min-h-full">
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            For each statement indicate to what extent you agree or disagree, using the scale:
          </p>
          <p className="text-gray-700 mb-4">
            1 = strongly disagree, 2 = disagree, 3 = neutral, 4 = agree, 5 = strongly agree.
          </p>
          <p className="text-gray-700 mb-6">
            The statements are split into two scorecards, with ten statements in each:
          </p>
          <ol className="text-gray-700 mb-6 ml-4">
            <li>1. Customer selection audit</li>
            <li>2. Profit</li>
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
                  Customer selection audit
                </td>
                <td className="border-b border-gray-300 p-4 text-center">
                  {customerTotal}
                </td>
              </tr>
              <tr>
                <td className="border-b border-gray-300 p-4 text-right">
                  Profit
                </td>
                <td className="border-b border-gray-300 p-4 text-center">
                  {profitTotal}
                </td>
              </tr>
            </tbody>
          </table>
          
          <div className="bg-gray-50 p-4 text-right text-sm text-gray-600">
            <div className="italic">43–50 = High</div>
            <div className="italic">30–40 = Moderate</div>
            <div className="italic">10–29 = Low</div>
          </div>
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
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Scorecards</h1>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          For each statement indicate to what extent you agree or disagree, using the scale:
        </p>
        <p className="text-gray-700 mb-4">
          1 = strongly disagree, 2 = disagree, 3 = neutral, 4 = agree, 5 = strongly agree.
        </p>
        <p className="text-gray-700 mb-6">
          The statements are split into two scorecards, with ten statements in each:
        </p>
        <ol className="text-gray-700 mb-6 ml-4">
          <li>1. Customer selection audit</li>
          <li>2. Profit</li>
        </ol>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6" role="tablist" aria-label="Scorecard categories">
        <button
          role="tab"
          aria-selected={activeTab === 'customer'}
          aria-controls="customer-panel"
          id="customer-tab"
          onClick={() => handleTabSwitch('customer')}
          className={`flex-1 py-3 px-4 text-center font-medium border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            activeTab === 'customer'
              ? 'bg-blue-900 text-white border-blue-900'
              : 'bg-gray-100 text-blue-900 border-gray-300 hover:bg-gray-200'
          }`}
        >
          Customer selection audit scorecard
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'profit'}
          aria-controls="profit-panel"
          id="profit-tab"
          onClick={() => handleTabSwitch('profit')}
          className={`flex-1 py-3 px-4 text-center font-medium border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            activeTab === 'profit'
              ? 'bg-blue-900 text-white border-blue-900'
              : 'bg-gray-100 text-blue-900 border-gray-300 hover:bg-gray-200'
          }`}
        >
          Profit scorecard
        </button>
      </div>

      {/* Customer Selection Audit Tab */}
      <div
        role="tabpanel"
        id="customer-panel"
        aria-labelledby="customer-tab"
        className={activeTab === 'customer' ? 'block' : 'hidden'}
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
              {customerStatements.map((statement, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border-b border-gray-300 p-4">
                    <label htmlFor={`customer-${index}`} className="block">
                      {statement}
                    </label>
                  </td>
                  <td className="border-b border-gray-300 p-4 text-center">
                    <input
                      id={`customer-${index}`}
                      type="number"
                      min="0"
                      max="5"
                      value={customerScores[index] || ''}
                      onChange={(e) => handleScoreChange('customer', index, e.target.value)}
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

      {/* Profit Scorecard Tab */}
      <div
        role="tabpanel"
        id="profit-panel"
        aria-labelledby="profit-tab"
        className={activeTab === 'profit' ? 'block' : 'hidden'}
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
              {profitStatements.map((statement, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border-b border-gray-300 p-4">
                    <label htmlFor={`profit-${index}`} className="block">
                      {statement}
                    </label>
                  </td>
                  <td className="border-b border-gray-300 p-4 text-center">
                    <input
                      id={`profit-${index}`}
                      type="number"
                      min="0"
                      max="5"
                      value={profitScores[index] || ''}
                      onChange={(e) => handleScoreChange('profit', index, e.target.value)}
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
      {/* Screen reader live region for announcements */}
      <div 
        aria-live="assertive" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {liveMessage}
      </div>

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

export default CustomerProfitScorecard;