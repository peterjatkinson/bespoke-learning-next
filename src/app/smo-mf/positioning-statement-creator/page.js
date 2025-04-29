"use client";
import React, { useState, useRef } from 'react'; // Import useRef
import { Clipboard, RotateCcw } from 'lucide-react';

const PositioningStatementCreator = () => {
  // State for form inputs
  const [formData, setFormData] = useState({
    targetAudience: '',
    brand: '',
    categoryProduct: '',
    keyBenefit: '',
    competitor: '',
    usp: ''
  });

  // State for copy success message
  const [copySuccess, setCopySuccess] = useState(false);
  
  // State for feedback messages
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Ref for the copy button
  const copyButtonRef = useRef(null); // Create a ref

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      targetAudience: '',
      brand: '',
      categoryProduct: '',
      keyBenefit: '',
      competitor: '',
      usp: ''
    });
    setCopySuccess(false);
    setFeedbackMessage('Form has been reset');
    // Note: Focus is typically moved to the first input field after reset,
    // which is generally a good pattern. Not forcing focus back to reset button.
    setTimeout(() => setFeedbackMessage(''), 2000);
  };

  // Generate positioning statement
  const getPositioningStatement = () => {
    return `For ${formData.targetAudience || '[target audience]'}, ${formData.brand || '[brand]'} offers ${formData.categoryProduct || '[category/product]'} that delivers ${formData.keyBenefit || '[key benefit]'}. Unlike ${formData.competitor || '[competitor]'}, ${formData.brand || '[brand]'} emphasizes ${formData.usp || '[USP]'}.`;
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    try {
      const statement = getPositioningStatement(); // Get the statement first

      // Create a fallback mechanism for environments where clipboard API is not available
      // First try the modern API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(statement)
          .then(() => {
            setCopySuccess(true);
            setFeedbackMessage('Positioning statement copied to clipboard');
            // *** Add focus call here after setting message ***
            copyButtonRef.current?.focus(); 
            // Reset success message after 2 seconds
            setTimeout(() => {
              setCopySuccess(false);
              setFeedbackMessage(''); // Clear message
            }, 2000);
          })
          .catch(err => {
            console.error('Modern clipboard API failed: ', err);
            fallbackCopyToClipboard(statement); // Pass statement to fallback
          });
      } else {
        // Fall back to older method if modern API is not available
        fallbackCopyToClipboard(statement); // Pass statement to fallback
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };
  
  // Fallback clipboard function for browsers without proper clipboard API
  // Accept statement as an argument
  const fallbackCopyToClipboard = (statement) => {
    try {
      // Create a temporary textarea element
      const textArea = document.createElement('textarea');
      textArea.value = statement; // Use the passed statement
      
      // Make the textarea out of viewport
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      // Select and copy the text
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopySuccess(true);
        setFeedbackMessage('Positioning statement copied to clipboard');
         // *** Add focus call here after setting message ***
        copyButtonRef.current?.focus();
        // Reset success message after 2 seconds
        setTimeout(() => {
          setCopySuccess(false);
          setFeedbackMessage(''); // Clear message
        }, 2000);
      } else {
        console.error('Fallback clipboard copy failed');
      }
    } catch (err) {
      console.error('Fallback clipboard error: ', err);
    }
  };

  return (
    <div className="bg-blue-50 p-6 rounded-lg shadow-sm min-h-full">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-6 flex justify-center items-center gap-2">
        Positioning statement creator 
      </h1>

      {/* Screen reader only instructions */}
      <div className="sr-only" aria-live="polite">
        This tool helps you create a positioning statement. Fill in each field below: target audience, brand, category or product, key benefit, competitor, and unique selling proposition. As you complete the form, your positioning statement will be generated automatically and is available in full after the input fields.
      </div>

      {/* Form section */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left column */}
            <div className="flex-1">
              <div className="relative">
                <input
                  id="targetAudience"
                  name="targetAudience"
                  type="text"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors placeholder-black"
                  placeholder="Target audience"
                  aria-label="Target audience"
                />
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-yellow-400" aria-hidden="true"></span>
              </div>
            </div>
            
            {/* Right column */}
            <div className="flex-1">
              <div className="relative">
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors placeholder-black"
                  placeholder="Brand"
                  aria-label="Brand"
                />
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-yellow-400" aria-hidden="true"></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Left column */}
            <div className="flex-1">
              <div className="relative">
                <input
                  id="categoryProduct"
                  name="categoryProduct"
                  type="text"
                  value={formData.categoryProduct}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors placeholder-black"
                  placeholder="Category/product"
                  aria-label="Category or product"
                />
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-yellow-400" aria-hidden="true"></span>
              </div>
            </div>
            
            {/* Right column */}
            <div className="flex-1">
              <div className="relative">
                <input
                  id="keyBenefit"
                  name="keyBenefit"
                  type="text"
                  value={formData.keyBenefit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors placeholder-black"
                  placeholder="Key benefit"
                  aria-label="Key benefit"
                />
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-yellow-400" aria-hidden="true"></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Left column */}
            <div className="flex-1">
              <div className="relative">
                <input
                  id="competitor"
                  name="competitor"
                  type="text"
                  value={formData.competitor}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors placeholder-black"
                  placeholder="Competitor"
                  aria-label="Competitor"
                />
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-yellow-400" aria-hidden="true"></span>
              </div>
            </div>
            
            {/* Right column */}
            <div className="flex-1">
              <div className="relative">
                <input
                  id="usp"
                  name="usp"
                  type="text"
                  value={formData.usp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors placeholder-black"
                  placeholder="USP"
                  aria-label="USP or unique selling proposition"
                />
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-yellow-400" aria-hidden="true"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Output section */}
      <div className="bg-white p-6 rounded-lg shadow-inner mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Your positioning statement:</h2>
        <div 
          className="p-4 border border-blue-100 rounded-lg min-h-16 text-gray-800"
        >
          {getPositioningStatement()}
        </div>
        
        {/* Screen reader only feedback message */}
        <div 
          className="sr-only" 
          aria-live="assertive"
        >
          {feedbackMessage}
        </div>
      </div>

      {/* Buttons section */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          ref={copyButtonRef} // Attach the ref to the button
          onClick={copyToClipboard}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
            copySuccess 
              ? 'bg-green-500 text-white' 
              : 'bg-yellow-400 hover:bg-yellow-500 text-gray-800 hover:text-gray-900'
          }`}
          aria-label={copySuccess ? 'Copied to clipboard' : 'Copy to clipboard'}
        >
          <Clipboard className="h-5 w-5" aria-hidden="true" />
          {copySuccess ? 'Copied!' : 'Copy to clipboard'}
        </button>
        
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-black hover:bg-gray-700 text-white rounded-full font-medium transition-colors"
          aria-label="Reset form"
        >
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default PositioningStatementCreator;