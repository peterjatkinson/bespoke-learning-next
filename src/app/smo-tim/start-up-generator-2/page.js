"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Rocket,
  Briefcase,
  Target,
  BarChart,
  ShieldAlert,
  DollarSign,
  AlertTriangle,
  LoaderCircle,
} from "lucide-react";

// This is the refactored StartupIdeaGenerator component.
// Functionality is identical, but the UI is enhanced for a more
// dynamic and engaging user experience.

const StartupIdeaGenerator = () => {
  // State management remains the same
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState(null);
  const [error, setError] = useState(null);
  const [industryInput, setIndustryInput] = useState("");

  const charLimit = 50;
  const initialSubmissionCount =
    typeof window !== "undefined"
      ? parseInt(localStorage.getItem("startupIdeaSubmissionCount") || "0", 10)
      : 0;
  const [submissionCount, setSubmissionCount] = useState(initialSubmissionCount);
  const submissionLimit = 10;

  // Refs remain the same
  const generatedContentRef = useRef(null);
  const liveRegionRef = useRef(null);

  // Input handler logic is unchanged
  const handleIndustryChange = (e) => {
    const { value } = e.target;
    setIndustryInput(value.slice(0, charLimit));
  };

  // Submission logic is unchanged
  const handleSubmit = async () => {
    setLoading(true);
    setIdeas(null);
    setError(null);
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = "Generating startup ideas. Please wait.";
    }
    try {
      const response = await fetch("/smo-tim/start-up-generator-2/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry: industryInput.trim() }),
      });
      if (!response.ok) throw new Error("Failed to generate startup ideas.");
      const data = await response.json();
      setIdeas(data.ideas);
      const newCount = submissionCount + 1;
      setSubmissionCount(newCount);
      localStorage.setItem("startupIdeaSubmissionCount", newCount.toString());
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = "Startup ideas generated.";
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while generating ideas. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Focus management effect is unchanged
  useEffect(() => {
    if (ideas && generatedContentRef.current) {
      generatedContentRef.current.querySelector("h2")?.focus();
    }
  }, [ideas]);
  
  // Animation variants for Framer Motion
  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };


  return (
    <div className="min-h-full bg-slate-900 text-white font-sans antialiased overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16 z-10">
        {/* Main Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="flex justify-center items-center gap-3">
            <Lightbulb className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
              Startup idea generator
            </h1>
          </div>
          <p className="mt-4 text-lg text-slate-300">
            Click the button below to generate innovative start-up ideas.
          </p>
        </motion.div>

        {/* Generator Control Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/20"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="w-full max-w-md text-center">
              <label htmlFor="industry-input" className="font-semibold mb-2 block text-slate-200">
                Enter an industry (optional)
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  id="industry-input"
                  type="text"
                  maxLength={charLimit}
                  value={industryInput}
                  onChange={handleIndustryChange}
                  placeholder="e.g., Sustainable Tech, AI, Health & Wellness"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  aria-label="Enter an industry (optional)"
                />
              </div>
              <p className="text-slate-400 text-sm mt-2">
                {industryInput.length}/{charLimit}
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col items-center gap-3">
               <motion.button
                onClick={handleSubmit}
                disabled={loading || submissionCount >= submissionLimit}
                className="group relative inline-flex items-center justify-center px-8 py-3 rounded-full font-bold text-white bg-gradient-to-r from-cyan-500 to-fuchsia-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed disabled:text-slate-400 transition-all duration-300 overflow-hidden"
                whileHover={{ scale: loading || submissionCount >= submissionLimit ? 1 : 1.05 }}
                whileTap={{ scale: loading || submissionCount >= submissionLimit ? 1 : 0.95 }}
                aria-busy={loading}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-fuchsia-600 opacity-0 group-hover:opacity-100 group-disabled:opacity-0 transition-opacity duration-300 blur-md"></span>
                <span className="relative flex items-center gap-2">
                  {loading ? (
                    <>
                      <LoaderCircle className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : submissionCount >= submissionLimit ? (
                    "Limit Reached"
                  ) : (
                    <>
                      <Rocket className="w-5 h-5" />
                      Generate ideas
                    </>
                  )}
                </span>
              </motion.button>
              {submissionCount < submissionLimit && (
                 <p className="text-sm text-slate-400">
                    You have <span className="font-bold text-cyan-400">{submissionLimit - submissionCount}</span> submission{submissionLimit - submissionCount !== 1 ? "s" : ""} left.
                 </p>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Live region for accessibility, visually hidden */}
        <div className="sr-only" aria-live="polite" ref={liveRegionRef} />
        
        {/* Error Message */}
        <AnimatePresence>
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center justify-center gap-2 mt-6 p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg"
                    role="alert"
                >
                    <AlertTriangle className="w-5 h-5"/>
                    <span>{error}</span>
                </motion.div>
            )}
        </AnimatePresence>


        {/* Generated Ideas Section */}
        <AnimatePresence>
          {ideas && (
            <motion.div
              className="mt-12"
              ref={generatedContentRef}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardContainerVariants}
            >
              <h2 className="text-3xl font-bold text-center mb-8 text-slate-100" tabIndex={-1}>
                AI-generated start-up ideas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ideas.map((idea, index) => (
                  <motion.div
                    key={index}
                    className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-6 shadow-lg hover:border-cyan-500/50 transition-colors duration-300"
                    variants={cardVariants}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <BarChart className="w-7 h-7 text-cyan-400" />
                      <h3 className="text-xl font-bold text-slate-100">{idea.title}</h3>
                    </div>

                    <div className="space-y-4 text-slate-300">
                      <p className="border-b border-slate-700 pb-3">{idea.description}</p>
                      
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 mt-1 text-fuchsia-400 flex-shrink-0" />
                        <div><span className="font-semibold text-slate-100">Market:</span> {idea.targetMarket}</div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 mt-1 text-fuchsia-400 flex-shrink-0" />
                        <div><span className="font-semibold text-slate-100">Challenges:</span> {idea.potentialChallenges.join("; ")}</div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 mt-1 text-fuchsia-400 flex-shrink-0" />
                        <div><span className="font-semibold text-slate-100">Revenue:</span> {idea.revenueStreams.join("; ")}</div>
                      </div>

                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StartupIdeaGenerator;