// app/waterfall-demo/page.js
'use client'; // This directive is necessary for components using hooks like useState, useEffect

import React, { useState, useCallback } from 'react';

// Helper to format numbers as currency
const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '$0.00';
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// InputField component for cleaner form
const InputField = ({ label, id, value, onChange, type = 'number', placeholder, helpText }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
    {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
  </div>
);

export default function WaterfallDemoPage() { // Renamed to follow Next.js page conventions
  const [inputs, setInputs] = useState({
    lpCapital: '10000000',
    gpCapital: '100000',
    totalDistributions: '15000000',
    preferredReturnRate: '8',
    carriedInterestRate: '20',
    gpCatchUpPercentage: '100',
  });

  const [waterfall, setWaterfall] = useState(null);
  const [scenarioAnalysis, setScenarioAnalysis] = useState('');
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  const handleInputChange = useCallback((e) => {
    const { id, value } = e.target;
    setInputs((prevInputs) => ({
      ...prevInputs,
      [id]: value,
    }));
    setWaterfall(null);
    setScenarioAnalysis('');
    setAnalysisError('');
  }, []);

  const calculateWaterfall = useCallback(() => {
    setScenarioAnalysis('');
    setAnalysisError('');

    const lpCap = parseFloat(inputs.lpCapital) || 0;
    const gpCap = parseFloat(inputs.gpCapital) || 0;
    let remainingDistributions = parseFloat(inputs.totalDistributions) || 0;
    const prefRate = parseFloat(inputs.preferredReturnRate) / 100 || 0;
    const carryRate = parseFloat(inputs.carriedInterestRate) / 100 || 0;
    const gpCatchUpSplit = parseFloat(inputs.gpCatchUpPercentage) / 100 || 0;

    let lpDist = { roc: 0, pref: 0, catchUp: 0, finalSplit: 0, total: 0 };
    let gpDist = { roc: 0, pref: 0, catchUp: 0, finalSplit: 0, total: 0 };
    let tierSummary = [];

    // 1. Return of LP Capital
    let amountToDistributeTier = Math.min(remainingDistributions, lpCap);
    if (amountToDistributeTier > 0) {
      lpDist.roc += amountToDistributeTier;
      remainingDistributions -= amountToDistributeTier;
      tierSummary.push({ name: 'Return of Capital to LP', lp: amountToDistributeTier, gp: 0, total: amountToDistributeTier });
    }

    // 2. Return of GP Capital
    amountToDistributeTier = Math.min(remainingDistributions, gpCap);
     if (amountToDistributeTier > 0) {
      gpDist.roc += amountToDistributeTier;
      remainingDistributions -= amountToDistributeTier;
      tierSummary.push({ name: 'Return of Capital to GP', lp: 0, gp: amountToDistributeTier, total: amountToDistributeTier });
    }

    // 3. LP Preferred Return
    const lpPrefAmountTarget = lpCap * prefRate;
    amountToDistributeTier = Math.min(remainingDistributions, lpPrefAmountTarget - lpDist.pref); // Ensure not to overpay pref
    if (amountToDistributeTier > 0) {
      lpDist.pref += amountToDistributeTier;
      remainingDistributions -= amountToDistributeTier;
      tierSummary.push({ name: 'Preferred Return to LP', lp: amountToDistributeTier, gp: 0, total: amountToDistributeTier });
    }
    
    // 4. GP Preferred Return
    const gpPrefAmountTarget = gpCap * prefRate;
    amountToDistributeTier = Math.min(remainingDistributions, gpPrefAmountTarget - gpDist.pref); // Ensure not to overpay pref
    if (amountToDistributeTier > 0) {
      gpDist.pref += amountToDistributeTier;
      remainingDistributions -= amountToDistributeTier;
      tierSummary.push({ name: 'Preferred Return to GP', lp: 0, gp: amountToDistributeTier, total: amountToDistributeTier });
    }

    // 5. GP Catch-up
    let gpGetsInCatchUp = 0;
    let lpGetsInCatchUp = 0;
    
    if (remainingDistributions > 0 && lpDist.pref > 0 && gpCatchUpSplit > 0 && carryRate > 0) {
        let D_catchup_total_potential = 0;
        if (gpCatchUpSplit > carryRate) { // Standard catch-up condition
            D_catchup_total_potential = (carryRate * lpDist.pref) / (gpCatchUpSplit - carryRate);
        } else if (gpCatchUpSplit > 0 && gpCatchUpSplit <= carryRate) {
            // If GP catch-up split is less than or equal to carry rate but still positive,
            // the formula above doesn't apply for "true" catch-up to target.
            // It simply means GP gets gpCatchUpSplit of profits until exhausted or next tier.
            // This tier might not fully "catch up" the GP to carryRate if gpCatchUpSplit <= carryRate.
            // For simplicity, if this scenario occurs, this tier will distribute according to gpCatchUpSplit
            // for all remaining distributions OR until some other cap (if defined, not in this simple model).
            // If no specific limit for D_catchup_total_potential is defined for this case,
            // effectively this tier might merge with the final split or just distribute all remainingDistributions
            // according to gpCatchUpSplit / (1-gpCatchUpSplit) if no distinct carry tier exists.
            // Given the structure with a distinct final carry tier, let's assume
            // if gpCatchUpSplit <= carryRate, this specific "catch-up to target X" logic doesn't apply.
            // The funds would then flow to the final split tier.
            // So, we only calculate D_catchup_total_potential if gpCatchUpSplit > carryRate.
        }


        amountToDistributeTier = Math.max(0, D_catchup_total_potential > 0 ? Math.min(remainingDistributions, D_catchup_total_potential) : 0);

        if (amountToDistributeTier > 0) {
            gpGetsInCatchUp = amountToDistributeTier * gpCatchUpSplit;
            lpGetsInCatchUp = amountToDistributeTier * (1 - gpCatchUpSplit);

            if (gpCatchUpSplit === 1) { // Ensure LP gets 0 if GP catch-up is 100%
                lpGetsInCatchUp = 0;
                gpGetsInCatchUp = amountToDistributeTier; 
            }

            gpDist.catchUp += gpGetsInCatchUp;
            lpDist.catchUp += lpGetsInCatchUp;
            remainingDistributions -= amountToDistributeTier;
            tierSummary.push({ name: 'GP Catch-up', lp: lpGetsInCatchUp, gp: gpGetsInCatchUp, total: amountToDistributeTier });
        }
    }

    // 6. Final Split (Carried Interest)
    if (remainingDistributions > 0) {
      const gpGetsInFinalSplit = remainingDistributions * carryRate;
      const lpGetsInFinalSplit = remainingDistributions * (1 - carryRate);

      gpDist.finalSplit += gpGetsInFinalSplit;
      lpDist.finalSplit += lpGetsInFinalSplit;
      // remainingDistributions -= (gpGetsInFinalSplit + lpGetsInFinalSplit); // Should be 0
      remainingDistributions = 0;
      tierSummary.push({ name: 'Final Split (Carry)', lp: lpGetsInFinalSplit, gp: gpGetsInFinalSplit, total: gpGetsInFinalSplit + lpGetsInFinalSplit });
    }

    lpDist.total = lpDist.roc + lpDist.pref + lpDist.catchUp + lpDist.finalSplit;
    gpDist.total = gpDist.roc + gpDist.pref + gpDist.catchUp + gpDist.finalSplit;

    setWaterfall({ lp: lpDist, gp: gpDist, tiers: tierSummary });
  }, [inputs]);

  const generateScenarioAnalysis = async () => {
    if (!waterfall) return;
    setIsGeneratingAnalysis(true);
    setScenarioAnalysis('');
    setAnalysisError('');

    const lpCap = parseFloat(inputs.lpCapital) || 0;
    const gpCap = parseFloat(inputs.gpCapital) || 0;
    
    const prompt = `You are a financial analyst. Based on the following private equity fund waterfall distribution, provide a concise (2-4 sentences) qualitative summary of the outcome.
Fund Inputs:
- LP Capital Committed: ${formatCurrency(lpCap)}
- GP Capital Committed: ${formatCurrency(gpCap)}
- Total Distributions by Fund: ${formatCurrency(parseFloat(inputs.totalDistributions))}
- Preferred Return Rate: ${inputs.preferredReturnRate}% (Calculated Target LP Pref: ${formatCurrency(lpCap * (parseFloat(inputs.preferredReturnRate)/100))})
- Carried Interest Rate for GP: ${inputs.carriedInterestRate}%
- GP Catch-up Split: ${inputs.gpCatchUpPercentage}%

Distribution Summary:
- Return of Capital to LP: ${formatCurrency(waterfall.lp.roc)}
- Actual Preferred Return to LP: ${formatCurrency(waterfall.lp.pref)}
- Total to LP: ${formatCurrency(waterfall.lp.total)}

- Return of Capital to GP: ${formatCurrency(waterfall.gp.roc)}
- Actual Preferred Return to GP: ${formatCurrency(waterfall.gp.pref)}
- GP Catch-up Amount: ${formatCurrency(waterfall.gp.catchUp)}
- GP Carried Interest (Final Split): ${formatCurrency(waterfall.gp.finalSplit)}
- Total to GP: ${formatCurrency(waterfall.gp.total)}

Analyze these results. Specifically comment on:
1. Did LPs receive their full capital back?
2. Did LPs receive their full calculated preferred return?
3. Did the GP receive carried interest? If so, was it substantial relative to the overall profit (profit being Total Distributions minus Total Capital Committed)?
4. Conclude with a general sentiment (e.g., excellent for all, good for LPs but limited/no carry for GP, challenging for LPs, etc.).
Keep the language professional and suitable for an investor. Focus on the key outcomes for both LP and GP based on these numbers.`;

    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const localApiUrl = '/test-apps/gemini-test/api'; // Calls your Next.js API route

    try {
      const response = await fetch(localApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatHistory: chatHistory }),
      });

      const result = await response.json(); // Always try to parse JSON

      if (!response.ok) {
        // Use error message from your API route if available, otherwise default
        const errorMessage = result?.error || `API Route Error: ${response.status} ${response.statusText}`;
        console.error("API Route Error Response:", result);
        throw new Error(errorMessage);
      }
      
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setScenarioAnalysis(text);
      } else if (result.error) { 
        // This case might be redundant if !response.ok already caught it,
        // but good for direct Gemini error structure if proxied as such.
        console.error("Gemini API returned an error object via proxy:", result.error);
        throw new Error(`Gemini Error: ${result.error.message || 'Unknown error from Gemini API'}`);
      }
       else {
        console.error("Unexpected API response structure from proxy:", result);
        throw new Error("Failed to extract text from API response via proxy. The response structure might be unexpected or an error not caught above.");
      }
    } catch (error) {
      console.error("Error in generateScenarioAnalysis:", error);
      setAnalysisError(`Failed to generate analysis: ${error.message}`);
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-indigo-700">Private Equity Waterfall Demo</h1>
          <p className="mt-2 text-md text-gray-600">
            Enter the fund parameters below to see how distributions are allocated.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            <strong>Note:</strong> This is a simplified model. Preferred Return is calculated as a flat percentage of committed capital. GP Catch-up logic can vary.
          </p>
        </header>

        <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
            <InputField label="LP Capital Committed" id="lpCapital" value={inputs.lpCapital} onChange={handleInputChange} placeholder="e.g., 10000000" />
            <InputField label="GP Capital Committed" id="gpCapital" value={inputs.gpCapital} onChange={handleInputChange} placeholder="e.g., 100000" helpText="Can be 0 if GP contributes no capital."/>
            <InputField label="Total Distributions by Fund" id="totalDistributions" value={inputs.totalDistributions} onChange={handleInputChange} placeholder="e.g., 15000000" />
            <InputField label="Preferred Return Rate (%)" id="preferredReturnRate" value={inputs.preferredReturnRate} onChange={handleInputChange} placeholder="e.g., 8" helpText="Applied simply to committed capital here."/>
            <InputField label="Carried Interest Rate (%) for GP" id="carriedInterestRate" value={inputs.carriedInterestRate} onChange={handleInputChange} placeholder="e.g., 20" helpText="GP's share of profits after hurdles."/>
            <InputField label="GP Catch-up Split (%)" id="gpCatchUpPercentage" value={inputs.gpCatchUpPercentage} onChange={handleInputChange} placeholder="e.g., 100" helpText="GP's share of distributions during catch-up tier (e.g., 100% or 80%)."/>
          </div>

          <div className="text-center mb-8">
            <button
              onClick={calculateWaterfall}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              Calculate Waterfall
            </button>
          </div>

          {waterfall && (
            <div className="mt-6 text-center">
              <button
                onClick={generateScenarioAnalysis}
                disabled={isGeneratingAnalysis}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
              >
                {isGeneratingAnalysis ? '✨ Generating Analysis...' : '✨ Generate Scenario Analysis'}
              </button>
            </div>
          )}

          {isGeneratingAnalysis && <p className="text-center text-gray-600 mt-4">Loading analysis from Gemini API...</p>}
          {analysisError && <p className="text-center text-red-600 mt-4 p-3 bg-red-100 rounded-md">{analysisError}</p>}
          {scenarioAnalysis && (
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg shadow animate-fadeIn">
              <h3 className="text-xl font-semibold text-blue-700 mb-3">AI Generated Scenario Analysis:</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{scenarioAnalysis}</p>
            </div>
          )}


          {waterfall && (
            <div className="mt-10 animate-fadeIn">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Waterfall Distribution Summary</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg shadow">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribution Tier</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">To Limited Partner (LP)</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">To General Partner (GP)</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total for Tier</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {waterfall.tiers.map((tier, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tier.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(tier.lp)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(tier.gp)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(tier.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100">
                    <tr className="font-semibold text-gray-800">
                      <td className="px-6 py-4 text-left text-sm uppercase">Total Distributions</td>
                      <td className="px-6 py-4 text-right text-sm">{formatCurrency(waterfall.lp.total)}</td>
                      <td className="px-6 py-4 text-right text-sm">{formatCurrency(waterfall.gp.total)}</td>
                      <td className="px-6 py-4 text-right text-sm">{formatCurrency(waterfall.lp.total + waterfall.gp.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-indigo-50 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-indigo-700 mb-2">LP Summary</h3>
                    <p>Return of Capital: <span className="font-mono float-right">{formatCurrency(waterfall.lp.roc)}</span></p>
                    <p>Preferred Return: <span className="font-mono float-right">{formatCurrency(waterfall.lp.pref)}</span></p>
                    <p>Share during Catch-up: <span className="font-mono float-right">{formatCurrency(waterfall.lp.catchUp)}</span></p>
                    <p>Share from Final Split: <span className="font-mono float-right">{formatCurrency(waterfall.lp.finalSplit)}</span></p>
                    <p className="font-bold mt-1 border-t pt-1">Total to LP: <span className="font-mono float-right">{formatCurrency(waterfall.lp.total)}</span></p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-green-700 mb-2">GP Summary</h3>
                    <p>Return of Capital: <span className="font-mono float-right">{formatCurrency(waterfall.gp.roc)}</span></p>
                    <p>Preferred Return: <span className="font-mono float-right">{formatCurrency(waterfall.gp.pref)}</span></p>
                    <p>Catch-up Amount: <span className="font-mono float-right">{formatCurrency(waterfall.gp.catchUp)}</span></p>
                    <p>Carried Interest: <span className="font-mono float-right">{formatCurrency(waterfall.gp.finalSplit)}</span></p>
                    <p className="font-bold mt-1 border-t pt-1">Total to GP: <span className="font-mono float-right">{formatCurrency(waterfall.gp.total)}</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Waterfall Demo. For illustrative purposes only.</p>
        </footer>
      </div>
      {/* You would typically include Tailwind CSS via a global CSS file in a Next.js project */}
      {/* For this self-contained example, style jsx global is used, but ensure Tailwind is set up in your project. */}
      <style jsx global>{`
        body {
          font-family: 'Inter', sans-serif; /* Example: Using Inter font */
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        /* Ensure Tailwind base, components, and utilities are imported in your global CSS */
      `}</style>
    </div>
  );
}