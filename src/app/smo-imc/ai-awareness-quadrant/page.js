"use client";

import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, List, Eye, Save, XCircle, Trash2, Bot, Sunrise, ShoppingCart, Sparkles } from 'lucide-react';

// --- Helper function to determine the quadrant ---
const getQuadrant = (x, y) => {
  if (x >= 50 && y >= 50) return "Cyborgs";
  if (x < 50 && y >= 50) return "High-street heroes";
  if (x < 50 && y < 50) return "Emergent";
  if (x >= 50 && y < 50) return "AI pioneers";
  return "Unknown";
};

const SUBMITTED_COMPANY_ID_STORAGE_KEY = 'quadrantAppSubmittedCompanyId';

// --- Reusable Quadrant Information Component ---
const QuadrantInfo = ({ viewType = "visual" }) => {
  const description = viewType === "visual"
    ? `The quadrant positions brands by AI discoverability versus traditional consumer recognition, helping to identify strategic marketing gaps and opportunities. Hover over each of the dots that you and other students have added to the quadrant to see the company name and score for consumer and AI brand awareness.`
    : `The quadrant positions brands by AI discoverability versus traditional consumer recognition, helping to identify strategic marketing gaps and opportunities. Refer to the company lists to see where various brands are positioned.`;

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 text-sm">
      <div className="text-gray-700 flex items-start gap-2">
        <HelpCircle size={28} className="flex-shrink-0 text-gray-500" />
        <span>{description}</span>
      </div>
      <div className="mt-4 text-gray-700 flex items-start gap-2">
        <Bot size={28} className="flex-shrink-0 text-gray-500" />
        <span>Cyborg companies have strong brand awareness both with consumers and with LLMs.</span>
      </div>
      <div className="mt-4 text-gray-700 flex items-start gap-2">
        <Sparkles size={28} className="flex-shrink-0 text-gray-500" />
        <span>AI pioneers aren't that well-known among consumers but score highly with LLMs.</span>
      </div>
      <div className="mt-4 text-gray-700 flex items-start gap-2">
        <ShoppingCart size={28} className="flex-shrink-0 text-gray-500" />
        <span>High-street heroes are very well-known brands with consumers but aren't often surfaced by LLMs.</span>
      </div>
      <div className="mt-4 text-gray-700 flex items-start gap-2">
        <Sunrise size={28} className="flex-shrink-0 text-gray-500" />
        <span>Emergent brands have little brand awareness both with consumers and with LLMs.</span>
      </div>
    </div>
  );
};


export default function QuadrantApp() {
  // --- State Management ---
  const [companies, setCompanies] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [pendingCompany, setPendingCompany] = useState(null);
  const [isAccessibleView, setIsAccessibleView] = useState(false);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedCompanyDbId, setSubmittedCompanyDbId] = useState(null);

  const quadrantRef = useRef(null);
  const API_ENDPOINT = '/smo-imc/ai-awareness-quadrant/api';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCompanyId = localStorage.getItem(SUBMITTED_COMPANY_ID_STORAGE_KEY);
      if (storedCompanyId) {
        setHasSubmitted(true);
        setSubmittedCompanyDbId(storedCompanyId);
        setStatus({ message: "You have already submitted a company. You can delete it to add a new one.", type: "info" });
      }
    }
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_ENDPOINT);
      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Failed to fetch data: ${res.status}. Response: ${errorBody}`);
      }
      const { data } = await res.json();
      setCompanies(data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      setStatus({
        message: "Could not load company data. Displaying mock data. (This is expected in preview)",
        type: "error"
      });
      setCompanies([
        { id: 'mock1', data: { name: 'Tesla', x: 85, y: 90 } },
        { id: 'mock2', data: { name: 'Cadillac', x: 60, y: 80 } },
        { id: 'mock3', data: { name: 'Jaguar', x: 45, y: 65 } },
        { id: 'mock4', data: { name: 'Rivian', x: 65, y: 35 } },
        { id: 'mock5', data: { name: 'Polestar', x: 20, y: 15 } },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuadrantClick = (e) => {
    if (hasSubmitted) {
      setStatus({ message: "You have already submitted a company. Delete it to add another.", type: "error" });
      return;
    }
    if (!companyName.trim()) {
      setStatus({ message: "Please enter a company name first.", type: "error" });
      return;
    }
    const rect = quadrantRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = 100 - (((e.clientY - rect.top) / rect.height) * 100);
    setPendingCompany({ name: companyName, x: Math.round(x), y: Math.round(y) });
    setStatus({ message: "", type: "" });
  };

  const cancelPending = () => {
    setPendingCompany(null);
    setCompanyName("");
  };

  const saveCompany = async (companyToSave) => {
    if (!companyToSave) return;
    if (hasSubmitted) {
      setStatus({ message: "You have already submitted a company. Delete it to add another.", type: "error" });
      setPendingCompany(null);
      setCompanyName("");
      return;
    }
    setStatus({ message: "Saving...", type: "info" });
    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_id: "QuadrantApp", data: companyToSave }),
      });
      
      const saveData = await res.json(); 

      if (!res.ok) {
        let errorMsg = "Failed to save data.";
        errorMsg = saveData.error || (await res.text()) || errorMsg; 
        throw new Error(errorMsg);
      }
      
      const newCompanyId = saveData.id; 
      setStatus({ message: "Company saved successfully! You can delete it to submit another.", type: "success" });
      setPendingCompany(null);
      setCompanyName("");
      
      if (typeof window !== 'undefined' && newCompanyId) {
        localStorage.setItem(SUBMITTED_COMPANY_ID_STORAGE_KEY, newCompanyId);
      }
      setSubmittedCompanyDbId(newCompanyId);
      setHasSubmitted(true);
      fetchCompanies(); 

    } catch (error) {
      console.error("Save error:", error);
      setStatus({ message: `Save failed: ${error.message} (This is expected in preview). You can try again.`, type: "error" });
      setCompanies(prev => [...prev, { id: `mock_${Date.now()}`, data: companyToSave }]); 
      setPendingCompany(null);
      setCompanyName("");
    }
  };

  const handleDeleteCompany = async () => {
    if (!submittedCompanyDbId) {
      setStatus({ message: "No submission found to delete.", type: "error" });
      return;
    }

    setStatus({ message: "Deleting your submission...", type: "info" });
    try {
      const res = await fetch(API_ENDPOINT, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: submittedCompanyDbId }),
      });

      if (!res.ok) {
        let errorMsg = "Failed to delete submission.";
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorMsg;
        } catch {
          errorMsg = `Failed to delete: ${res.statusText || res.status}`;
        }
        throw new Error(errorMsg);
      }

      setStatus({ message: "Submission deleted. You can now add a new company.", type: "success" });
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SUBMITTED_COMPANY_ID_STORAGE_KEY);
      }
      setSubmittedCompanyDbId(null);
      setHasSubmitted(false);
      setCompanyName("");
      setPendingCompany(null);
      fetchCompanies();
    } catch (error) {
      console.error("Delete error:", error);
      setStatus({ message: `Delete failed: ${error.message}. Please try again.`, type: "error" });
    }
  };

  return (
    <div className="bg-gray-50 min-h-full font-sans text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Human versus AI brand awareness quadrant
            </h1>
            <p className="text-gray-600 mt-1">
              Map companies based on consumer versus AI brand awareness
            </p>
          </div>
          <button
            onClick={() => setIsAccessibleView(!isAccessibleView)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-600 rounded-lg shadow-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isAccessibleView ? <Eye size={18} /> : <List size={18} />}
            <span>
              {isAccessibleView ? "Quadrant view" : "Accessible text view"}
            </span>
          </button>
        </div>

        {status.message && (
          <div
            className={`p-4 mb-4 rounded-lg text-center ${
              status.type === "error"
                ? "bg-red-100 text-red-800"
                : status.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
            role="alert"
          >
            {status.message}
          </div>
        )}

        {hasSubmitted && (
          <div className="my-4 text-center">
            <button
              onClick={handleDeleteCompany}
              className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-red-800 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <Trash2 size={18} /> Delete my submission
            </button>
          </div>
        )}

        {isAccessibleView ? (
          <AccessibleView
            companies={companies}
            onSave={saveCompany}
            isLoading={isLoading}
            hasSubmitted={hasSubmitted}
          />
        ) : (
          <VisualView
            companies={companies}
            companyName={companyName}
            setCompanyName={setCompanyName}
            pendingCompany={pendingCompany}
            quadrantRef={quadrantRef}
            handleQuadrantClick={handleQuadrantClick}
            saveCompany={saveCompany}
            cancelPending={cancelPending}
            isLoading={isLoading}
            hasSubmitted={hasSubmitted}
          />
        )}
      </div>
    </div>
  );
}

// --- Visual View ---
const VisualView = ({
  companies,
  companyName,
  setCompanyName,
  pendingCompany,
  quadrantRef,
  handleQuadrantClick,
  saveCompany,
  cancelPending,
  isLoading,
  hasSubmitted,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Add a company</h2>
        {hasSubmitted ? (
          <div className="p-3 bg-blue-100 text-blue-800 rounded-md text-sm border border-blue-200">
            You have already submitted a company. To add a new one, please delete your existing submission first (button above the chart/list area).
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="companyNameVisual"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  1. Add company name
                </label>
                <input
                  id="companyNameVisual"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apple"
                  className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 "
                  disabled={!!pendingCompany || hasSubmitted}
                />
              </div>
              <p className="text-sm ">
                2. Click on the chart to place the company.
              </p>
            </div>

            {pendingCompany && !hasSubmitted && (
              <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <h3 className="font-semibold text-indigo-800">
                  Confirm Placement
                </h3>
                <p className="text-sm text-indigo-700 mt-1">
                  Placing <span className="font-bold">{pendingCompany.name}</span> at:
                </p>
                <p className="text-sm text-indigo-700">
                  AI Awareness (X): {pendingCompany.x}, Consumer Awareness (Y):{" "}
                  {pendingCompany.y}
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => saveCompany(pendingCompany)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Save size={16} /> Save
                  </button>
                  <button
                    onClick={cancelPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <XCircle size={16} /> Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        <QuadrantInfo viewType="visual" />
      </div>
      
      <div className="lg:col-span-2 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto p-8 sm:p-10 relative flex justify-center">
          <span className="absolute top-1/2 -left-24 -translate-y-1/2 -rotate-90 text-sm font-medium text-gray-600 whitespace-nowrap">
            Consumer brand awareness →
          </span>
          <div className="relative w-full aspect-square bg-white rounded-xl shadow-md border border-gray-200">
            <div
              ref={quadrantRef}
              className={`relative w-full h-full p-4 sm:p-6 ${
                !pendingCompany && !hasSubmitted ? 'cursor-crosshair' : (hasSubmitted ? 'cursor-not-allowed' : 'cursor-default')
              }`}
              onClick={!pendingCompany && !hasSubmitted ? handleQuadrantClick : undefined}
            >
              <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-yellow-500/10 rounded-tl-lg flex items-center justify-center p-2"><span className="font-bold   text-center">High-street heroes</span></div>
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/10 rounded-tr-lg flex items-center justify-center p-2"><span className="font-bold  text-center">Cyborgs</span></div>
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-green-500/10 rounded-bl-lg flex items-center justify-center p-2"><span className="font-bold  text-center">Emergent</span></div>
              <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-500/10 rounded-br-lg flex items-center justify-center p-2"><span className="font-bold text-center">AI pioneers</span></div>
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-400"></div>
              <div className="absolute left-1/2 top-0 h-full w-[1px] bg-gray-400"></div>

              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-lg">
                  <p className="text-gray-600">Loading companies...</p>
                </div>
              ) : (
                <>
                  {companies.map((c) => (
                    <div
                      key={c.id}
                      className="absolute group"
                      style={{
                        left: `${c.data.x}%`,
                        bottom: `${c.data.y}%`,
                        transform: 'translate(-50%, 50%)',
                      }}
                    >
                      <div className="w-3 h-3 bg-red-800 rounded-full border-2 border-white shadow-lg"></div>
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {c.data.name} ({c.data.x}, {c.data.y})
                      </span>
                    </div>
                  ))}
                  {pendingCompany && !hasSubmitted && (
                    <div
                      className="absolute"
                      style={{
                        left: `${pendingCompany.x}%`,
                        bottom: `${pendingCompany.y}%`,
                        transform: 'translate(-50%, 50%)',
                      }}
                    >
                      <div className="w-4 h-4 bg-indigo-500 rounded-full ring-2 ring-offset-2 ring-indigo-500 animate-pulse"></div>
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-indigo-600 text-white text-xs rounded-md">
                        {pendingCompany.name}
                      </span>
                    </div>
                  )}
                </>
              )}

              <span className="absolute -bottom-5 left-0 -translate-x-1/2 text-xs text-gray-500">0</span>
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-500">50</span>
              <span className="absolute -bottom-5 right-0 translate-x-1/2 text-xs text-gray-500">100</span>
              <span className="absolute -left-4 bottom-0 translate-y-1/2 text-xs text-gray-500">0</span>
              <span className="absolute -left-4 bottom-1/2 translate-y-1/2 text-xs text-gray-500">50</span>
              <span className="absolute -left-4 top-0 -translate-y-1/2 text-xs text-gray-500">100</span>
            </div>
          </div>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm font-medium text-gray-600 pt-4">
            AI brand awareness →
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Accessible View ---
const AccessibleView = ({ companies, onSave, isLoading, hasSubmitted }) => {
  const [name, setName] = useState("");
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);

  useEffect(() => {
    if (!hasSubmitted) {
        setName("");
        setX(50);
        setY(50);
    }
  }, [hasSubmitted]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (hasSubmitted) return;
    if (!name.trim()) return; 
    onSave({ name, x: parseInt(x, 10), y: parseInt(y, 10) });
    if(!hasSubmitted) { 
        setName("");
        setX(50);
        setY(50);
    }
  };

  const quadrants = {
    "Cyborgs": companies.filter(c => getQuadrant(c.data.x, c.data.y) === "Cyborgs"),
    "High-street heroes": companies.filter(c => getQuadrant(c.data.x, c.data.y) === "High-street heroes"),
    "Emergent": companies.filter(c => getQuadrant(c.data.x, c.data.y) === "Emergent"),
    "AI pioneers": companies.filter(c => getQuadrant(c.data.x, c.data.y) === "AI pioneers"),
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Add a company</h2>
        {hasSubmitted ? (
          <div className="p-3 bg-blue-100 text-blue-800 rounded-md text-sm border border-blue-200">
            You have already submitted a company. To add a new one, please delete your existing submission first (button above the chart/list area).
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="companyNameAccess" className="block text-sm font-medium text-gray-700">
                Add company name
              </label>
              <input
                id="companyNameAccess"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apple"
                className="mt-1 w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={hasSubmitted}
              />
            </div>
            <div>
              <label htmlFor="xAxis" className="block text-sm font-medium text-gray-700">
                AI brand awareness (X-axis): {x}
              </label>
              <input
                id="xAxis"
                type="range"
                min="0"
                max="100"
                value={x}
                onChange={(e) => setX(e.target.value)}
                className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={hasSubmitted}
              />
            </div>
            <div>
              <label htmlFor="yAxis" className="block text-sm font-medium text-gray-700">
                Consumer brand awareness (Y-axis): {y}
              </label>
              <input
                id="yAxis"
                type="range"
                min="0"
                max="100"
                value={y}
                onChange={(e) => setY(e.target.value)}
                className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={hasSubmitted}
              />
            </div>
            {/* Conditional Button: Only show if name is entered and not submitted */}
            {!hasSubmitted && name.trim() !== "" && (
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
              >
                <Save size={16} /> Add company
              </button>
            )}
          </form>
        )}
        {/* Quadrant Information for Accessible View */}
        <QuadrantInfo viewType="accessible" />
      </div>

      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Company lists by quadrant</h2>
        {isLoading ? (
          <p className="text-gray-600">Loading lists...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(quadrants).map(([qName, comps]) => (
              <div key={qName} className="p-4 rounded-lg bg-gray-50 border">
                <h3 className="font-bold text-lg text-gray-800">{qName}</h3>
                {comps.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {comps.map(c => (
                      <li key={c.id} className="text-sm text-gray-700">
                        <span className="font-medium">{c.data.name}</span>
                        <span className="text-gray-500">
                          {` (AI awareness: ${c.data.x}, Consumer awareness: ${c.data.y})`}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">
                    No companies in this quadrant yet.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};