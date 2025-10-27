'use client';

import { useState } from 'react';
import { Calculator, HelpCircle, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

// Component for displaying equations with detailed breakdowns
const EquationDisplay = ({ title, equation, legend, children }) => {
  return (
    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
      <h3 className="font-bold text-lg mb-2 text-blue-900">{title}</h3>
      <div className="bg-white p-4 rounded border border-blue-200 mb-3">
        <div className="text-center text-xl font-mono">{equation}</div>
      </div>
      {legend && (
        <div className="text-sm space-y-1 mb-2">
          <p className="font-semibold text-blue-800">Legend:</p>
          {legend.map((item, idx) => (
            <div key={idx} className="pl-4">
              <span className="font-mono font-bold">{item.symbol}</span> = {item.meaning}
            </div>
          ))}
        </div>
      )}
      {children}
    </div>
  );
};

// Component for AI chat interface
const AIHelper = ({ isOpen, onClose, currentStep }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/test-apps/effect-size-calculator/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: `User is currently working on: ${currentStep}`
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Error:', error);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <h3 className="font-bold text-lg">AI Assistant</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatHistory.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <p>Ask me anything about effect sizes!</p>
              <p className="text-sm mt-2">I can help explain concepts, formulas, or steps in the calculation.</p>
            </div>
          )}
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-100 ml-8'
                  : 'bg-gray-100 mr-8'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
          {isLoading && (
            <div className="bg-gray-100 mr-8 p-3 rounded-lg">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a question..."
              className="flex-1 p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main calculator component
export default function EffectSizeCalculator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAIHelper, setShowAIHelper] = useState(false);

  // Initial inputs
  const [experimentalMean, setExperimentalMean] = useState('');
  const [controlMean, setControlMean] = useState('');
  const [experimentalSD, setExperimentalSD] = useState('');
  const [controlSD, setControlSD] = useState('');
  const [experimentalN, setExperimentalN] = useState('');
  const [controlN, setControlN] = useState('');

  // User answers for validation
  const [userPooledSD, setUserPooledSD] = useState('');
  const [userCohenD, setUserCohenD] = useState('');

  // Validation states
  const [pooledSDValidation, setPooledSDValidation] = useState(null);
  const [cohenDValidation, setCohenDValidation] = useState(null);

  // Calculate correct answers based on inputs
  const calculatePooledSD = () => {
    const n1 = parseFloat(experimentalN);
    const n2 = parseFloat(controlN);
    const sd1 = parseFloat(experimentalSD);
    const sd2 = parseFloat(controlSD);

    if (isNaN(n1) || isNaN(n2) || isNaN(sd1) || isNaN(sd2)) return null;

    const numerator = (n1 - 1) * sd1 * sd1 + (n2 - 1) * sd2 * sd2;
    const denominator = n1 + n2 - 2;
    return Math.sqrt(numerator / denominator);
  };

  const calculateCohenD = () => {
    const m1 = parseFloat(experimentalMean);
    const m2 = parseFloat(controlMean);
    const pooledSD = calculatePooledSD();

    if (isNaN(m1) || isNaN(m2) || !pooledSD) return null;

    return (m1 - m2) / pooledSD;
  };

  const validatePooledSD = () => {
    const correct = calculatePooledSD();
    const userAnswer = parseFloat(userPooledSD);

    if (!correct || isNaN(userAnswer)) {
      setPooledSDValidation({ isCorrect: false, message: 'Please enter a valid number' });
      return;
    }

    const tolerance = 0.01; // Allow small rounding differences
    const isCorrect = Math.abs(userAnswer - correct) < tolerance;

    setPooledSDValidation({
      isCorrect,
      message: isCorrect
        ? `Correct! The pooled SD is ${correct.toFixed(3)}`
        : `Not quite. The correct answer is ${correct.toFixed(3)}. Try again!`,
      correctAnswer: correct
    });
  };

  const validateCohenD = () => {
    const correct = calculateCohenD();
    const userAnswer = parseFloat(userCohenD);

    if (!correct || isNaN(userAnswer)) {
      setCohenDValidation({ isCorrect: false, message: 'Please enter a valid number' });
      return;
    }

    const tolerance = 0.01;
    const isCorrect = Math.abs(userAnswer - correct) < tolerance;

    // Interpret effect size
    const absD = Math.abs(correct);
    let interpretation = '';
    if (absD < 0.2) interpretation = 'very small';
    else if (absD < 0.5) interpretation = 'small';
    else if (absD < 0.8) interpretation = 'medium';
    else interpretation = 'large';

    setCohenDValidation({
      isCorrect,
      message: isCorrect
        ? `Correct! Cohen's d = ${correct.toFixed(3)}, which is a ${interpretation} effect size.`
        : `Not quite. The correct answer is ${correct.toFixed(3)}. Try again!`,
      correctAnswer: correct,
      interpretation
    });
  };

  const canProceedToStep2 = () => {
    return experimentalMean && controlMean && experimentalSD &&
           controlSD && experimentalN && controlN;
  };

  const canProceedToStep3 = () => {
    return pooledSDValidation?.isCorrect;
  };

  const getStepDescription = () => {
    switch(currentStep) {
      case 0: return 'Entering study data';
      case 1: return 'Calculating pooled standard deviation';
      case 2: return 'Calculating Cohen\'s d';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="w-10 h-10 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Effect Size Calculator</h1>
                <p className="text-gray-600">Learn to calculate Cohen's d step-by-step</p>
              </div>
            </div>
            <button
              onClick={() => setShowAIHelper(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              Ask AI
            </button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6 border-2 border-gray-300">
          <div className="flex justify-between mb-2">
            {['Data Entry', 'Pooled SD', 'Cohen\'s d'].map((label, idx) => (
              <div
                key={idx}
                className={`flex-1 text-center ${
                  idx === currentStep ? 'font-bold text-blue-600' : 'text-gray-500'
                }`}
              >
                <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${
                  idx === currentStep ? 'bg-blue-600 text-white' :
                  idx < currentStep ? 'bg-green-500 text-white' : 'bg-gray-300'
                }`}>
                  {idx < currentStep ? '✓' : idx + 1}
                </div>
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Introduction */}
        {currentStep === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-gray-300">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">What is Effect Size?</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Effect size</strong> measures the magnitude of a difference between two groups.
                Unlike p-values, which only tell us if a difference is statistically significant,
                effect sizes tell us <em>how large</em> that difference actually is.
              </p>
              <p>
                <strong>Cohen's d</strong> is one of the most common effect size measures. It expresses
                the difference between two means in terms of standard deviation units.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                <p className="font-semibold">Interpreting Cohen's d:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>d = 0.2: Small effect</li>
                  <li>d = 0.5: Medium effect</li>
                  <li>d = 0.8: Large effect</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Data Entry */}
        {currentStep === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-gray-300">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Step 1: Enter Your Study Data</h2>
            <p className="text-gray-600 mb-4">
              Enter the descriptive statistics from your two groups (e.g., experimental vs. control).
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Experimental Group */}
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                <h3 className="font-bold text-lg mb-3 text-blue-900">Experimental Group</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Mean (M₁)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={experimentalMean}
                      onChange={(e) => setExperimentalMean(e.target.value)}
                      className="w-full p-2 border-2 border-blue-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="e.g., 85.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Standard Deviation (SD₁)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={experimentalSD}
                      onChange={(e) => setExperimentalSD(e.target.value)}
                      className="w-full p-2 border-2 border-blue-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="e.g., 12.3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Sample Size (n₁)
                    </label>
                    <input
                      type="number"
                      value={experimentalN}
                      onChange={(e) => setExperimentalN(e.target.value)}
                      className="w-full p-2 border-2 border-blue-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="e.g., 30"
                    />
                  </div>
                </div>
              </div>

              {/* Control Group */}
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                <h3 className="font-bold text-lg mb-3 text-green-900">Control Group</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Mean (M₂)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={controlMean}
                      onChange={(e) => setControlMean(e.target.value)}
                      className="w-full p-2 border-2 border-green-300 rounded focus:outline-none focus:border-green-500"
                      placeholder="e.g., 78.2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Standard Deviation (SD₂)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={controlSD}
                      onChange={(e) => setControlSD(e.target.value)}
                      className="w-full p-2 border-2 border-green-300 rounded focus:outline-none focus:border-green-500"
                      placeholder="e.g., 10.8"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Sample Size (n₂)
                    </label>
                    <input
                      type="number"
                      value={controlN}
                      onChange={(e) => setControlN(e.target.value)}
                      className="w-full p-2 border-2 border-green-300 rounded focus:outline-none focus:border-green-500"
                      placeholder="e.g., 30"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep(1)}
              disabled={!canProceedToStep2()}
              className="mt-6 w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {canProceedToStep2() ? 'Continue to Step 2: Calculate Pooled SD' : 'Please fill in all fields'}
            </button>
          </div>
        )}

        {/* Step 2: Pooled SD */}
        {currentStep === 1 && (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-gray-300">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Step 2: Calculate Pooled Standard Deviation</h2>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold mb-2">Why do we need pooled SD?</h3>
                <p className="text-gray-700">
                  When comparing two groups, we need a single measure of variability that represents both groups.
                  The <strong>pooled standard deviation</strong> combines the variability from both groups into one value,
                  weighted by their sample sizes.
                </p>
              </div>

              <EquationDisplay
                title="Pooled Standard Deviation Formula"
                equation={
                  <div>
                    SD<sub>pooled</sub> = √[((n₁ - 1) × SD₁² + (n₂ - 1) × SD₂²) / (n₁ + n₂ - 2)]
                  </div>
                }
                legend={[
                  { symbol: 'n₁', meaning: 'Sample size of experimental group' },
                  { symbol: 'n₂', meaning: 'Sample size of control group' },
                  { symbol: 'SD₁', meaning: 'Standard deviation of experimental group' },
                  { symbol: 'SD₂', meaning: 'Standard deviation of control group' },
                  { symbol: '√', meaning: 'Square root' },
                ]}
              >
                <div className="mt-4 p-4 bg-white border-2 border-blue-300 rounded">
                  <h4 className="font-semibold mb-2">Step-by-step breakdown:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li><strong>Square each SD:</strong> SD₁² = {experimentalSD}² = {(parseFloat(experimentalSD)**2).toFixed(2)} and SD₂² = {controlSD}² = {(parseFloat(controlSD)**2).toFixed(2)}</li>
                    <li><strong>Weight by (n-1):</strong> ({experimentalN} - 1) × {(parseFloat(experimentalSD)**2).toFixed(2)} = {((parseFloat(experimentalN)-1) * parseFloat(experimentalSD)**2).toFixed(2)}</li>
                    <li><strong>Same for group 2:</strong> ({controlN} - 1) × {(parseFloat(controlSD)**2).toFixed(2)} = {((parseFloat(controlN)-1) * parseFloat(controlSD)**2).toFixed(2)}</li>
                    <li><strong>Add them:</strong> {((parseFloat(experimentalN)-1) * parseFloat(experimentalSD)**2).toFixed(2)} + {((parseFloat(controlN)-1) * parseFloat(controlSD)**2).toFixed(2)} = {(((parseFloat(experimentalN)-1) * parseFloat(experimentalSD)**2) + ((parseFloat(controlN)-1) * parseFloat(controlSD)**2)).toFixed(2)}</li>
                    <li><strong>Divide by total df:</strong> {(((parseFloat(experimentalN)-1) * parseFloat(experimentalSD)**2) + ((parseFloat(controlN)-1) * parseFloat(controlSD)**2)).toFixed(2)} / ({experimentalN} + {controlN} - 2) = {((((parseFloat(experimentalN)-1) * parseFloat(experimentalSD)**2) + ((parseFloat(controlN)-1) * parseFloat(controlSD)**2)) / (parseFloat(experimentalN) + parseFloat(controlN) - 2)).toFixed(2)}</li>
                    <li><strong>Take square root:</strong> √{((((parseFloat(experimentalN)-1) * parseFloat(experimentalSD)**2) + ((parseFloat(controlN)-1) * parseFloat(controlSD)**2)) / (parseFloat(experimentalN) + parseFloat(controlN) - 2)).toFixed(2)} = {calculatePooledSD()?.toFixed(3)}</li>
                  </ol>
                </div>
              </EquationDisplay>

              <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                <h3 className="font-bold mb-3">Now you try!</h3>
                <p className="mb-3">Calculate the pooled standard deviation using the formula above:</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.001"
                    value={userPooledSD}
                    onChange={(e) => setUserPooledSD(e.target.value)}
                    className="flex-1 p-2 border-2 border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Enter your answer (round to 3 decimal places)"
                  />
                  <button
                    onClick={validatePooledSD}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors"
                  >
                    Check Answer
                  </button>
                </div>

                {pooledSDValidation && (
                  <div className={`mt-3 p-3 rounded flex items-center gap-2 ${
                    pooledSDValidation.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {pooledSDValidation.isCorrect ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <span>{pooledSDValidation.message}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setCurrentStep(0)}
                  className="flex-1 py-3 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Back to Step 1
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!canProceedToStep3()}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {canProceedToStep3() ? 'Continue to Step 3: Calculate Cohen\'s d' : 'Complete this step first'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Cohen's d */}
        {currentStep === 2 && (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-gray-300">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Step 3: Calculate Cohen's d</h2>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold mb-2">What does Cohen's d tell us?</h3>
                <p className="text-gray-700">
                  Cohen's d expresses the difference between two group means in <strong>standard deviation units</strong>.
                  This makes it easy to understand the magnitude of the difference regardless of the measurement scale used.
                </p>
              </div>

              <EquationDisplay
                title="Cohen's d Formula"
                equation={
                  <div>
                    d = (M₁ - M₂) / SD<sub>pooled</sub>
                  </div>
                }
                legend={[
                  { symbol: 'M₁', meaning: 'Mean of experimental group' },
                  { symbol: 'M₂', meaning: 'Mean of control group' },
                  { symbol: 'SDpooled', meaning: 'Pooled standard deviation (from Step 2)' },
                ]}
              >
                <div className="mt-4 p-4 bg-white border-2 border-blue-300 rounded">
                  <h4 className="font-semibold mb-2">Step-by-step breakdown:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li><strong>Find the difference in means:</strong> M₁ - M₂ = {experimentalMean} - {controlMean} = {(parseFloat(experimentalMean) - parseFloat(controlMean)).toFixed(2)}</li>
                    <li><strong>Use the pooled SD from Step 2:</strong> SD<sub>pooled</sub> = {calculatePooledSD()?.toFixed(3)}</li>
                    <li><strong>Divide the difference by pooled SD:</strong> {(parseFloat(experimentalMean) - parseFloat(controlMean)).toFixed(2)} / {calculatePooledSD()?.toFixed(3)} = {calculateCohenD()?.toFixed(3)}</li>
                  </ol>
                </div>
              </EquationDisplay>

              <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                <h3 className="font-bold mb-3">Now you try!</h3>
                <p className="mb-3">Calculate Cohen's d using the formula above:</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.001"
                    value={userCohenD}
                    onChange={(e) => setUserCohenD(e.target.value)}
                    className="flex-1 p-2 border-2 border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Enter your answer (round to 3 decimal places)"
                  />
                  <button
                    onClick={validateCohenD}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors"
                  >
                    Check Answer
                  </button>
                </div>

                {cohenDValidation && (
                  <div className={`mt-3 p-3 rounded ${
                    cohenDValidation.isCorrect ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <div className={`flex items-center gap-2 mb-2 ${
                      cohenDValidation.isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {cohenDValidation.isCorrect ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                      <span className="font-semibold">{cohenDValidation.message}</span>
                    </div>
                    {cohenDValidation.isCorrect && (
                      <div className="mt-3 p-3 bg-white rounded border-2 border-green-300">
                        <h4 className="font-bold mb-2">Interpretation:</h4>
                        <p className="text-gray-700">
                          An effect size of {cohenDValidation.correctAnswer?.toFixed(3)} means the experimental group's mean
                          is {Math.abs(cohenDValidation.correctAnswer).toFixed(2)} standard deviations {cohenDValidation.correctAnswer > 0 ? 'above' : 'below'} the
                          control group's mean. This is considered a <strong>{cohenDValidation.interpretation}</strong> effect size.
                        </p>
                        <div className="mt-3 text-sm text-gray-600">
                          <p><strong>Practical significance:</strong></p>
                          <p className="mt-1">
                            {cohenDValidation.interpretation === 'large' &&
                              'This large effect suggests the intervention had a substantial impact and is likely to be noticeable in real-world settings.'}
                            {cohenDValidation.interpretation === 'medium' &&
                              'This medium effect suggests a moderate impact that is likely to be visible to careful observers.'}
                            {cohenDValidation.interpretation === 'small' &&
                              'This small effect suggests a subtle difference that might require careful measurement to detect.'}
                            {cohenDValidation.interpretation === 'very small' &&
                              'This very small effect suggests minimal practical difference between groups, despite any statistical significance.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-3 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Back to Step 2
                </button>
                <button
                  onClick={() => {
                    setCurrentStep(0);
                    setExperimentalMean('');
                    setControlMean('');
                    setExperimentalSD('');
                    setControlSD('');
                    setExperimentalN('');
                    setControlN('');
                    setUserPooledSD('');
                    setUserCohenD('');
                    setPooledSDValidation(null);
                    setCohenDValidation(null);
                  }}
                  className="flex-1 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Over with New Data
                </button>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="bg-white rounded-lg shadow-lg p-4 text-center text-sm text-gray-600 border-2 border-gray-300">
          <p>
            <strong>Pro tip:</strong> Click the "Ask AI" button in the top right corner at any time to get help with concepts,
            formulas, or calculations!
          </p>
        </div>
      </div>

      {/* AI Helper Modal */}
      <AIHelper
        isOpen={showAIHelper}
        onClose={() => setShowAIHelper(false)}
        currentStep={getStepDescription()}
      />
    </div>
  );
}
