"use client";

import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";

const CampaignIdeas = () => {
  const [formData, setFormData] = useState({
    startupIdea: "",
    targetAudience: "",
  });
  const [wordCounts, setWordCounts] = useState({
    startupIdea: 0,
    targetAudience: 0,
  });
  const [fieldErrors, setFieldErrors] = useState({
    startupIdea: "",
    targetAudience: "",
    global: null,
  });
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState(null);

  // Initialize submission count from localStorage or default to 0
  const initialSubmissionCount =
    typeof window !== "undefined"
      ? parseInt(localStorage.getItem("campaignSubmissionCount") || "0", 10)
      : 0;
  const [submissionCount, setSubmissionCount] = useState(initialSubmissionCount);
  const submissionLimit = 5;

  const charLimit = 200;
  const generatedContentRef = useRef(null);
  const liveRegionRef = useRef(null);
  const errorRegionRef = useRef(null);
  const submitButtonRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (campaigns && generatedContentRef.current) {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = "Campaign ideas generated.";
      }
      generatedContentRef.current.querySelector("h2").focus();
    }
  }, [campaigns]);

  // Update the count function to count characters instead of words.
  const countWords = (text) => {
    return text.length;
  };

  // Updated handleChange to slice pasted text if it exceeds the character limit.
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = value.length > charLimit ? value.slice(0, charLimit) : value;
    setFormData({ ...formData, [name]: newValue });
    setWordCounts({ ...wordCounts, [name]: newValue.length });
    setFieldErrors({ ...fieldErrors, [name]: "", global: null });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.startupIdea.trim()) {
      errors.startupIdea = "Organisation is required.";
    } else if (wordCounts.startupIdea > charLimit) {
      errors.startupIdea = `Organisation must be ${charLimit} characters or fewer.`;
    }
    if (!formData.targetAudience.trim()) {
      errors.targetAudience = "Target audience is required.";
    } else if (wordCounts.targetAudience > charLimit) {
      errors.targetAudience = `Target audience must be ${charLimit} characters or fewer.`;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setFieldErrors((prev) => ({ ...prev, global: null }));
    if (!validateForm()) {
      const globalErrorMessage =
        "One or more required fields have not been filled in. Please fill in the empty fields and try again.";
      if (errorRegionRef.current) {
        errorRegionRef.current.textContent = "";
        errorRegionRef.current.textContent = globalErrorMessage;
      }
      setFieldErrors((prev) => ({ ...prev, global: globalErrorMessage }));
      return;
    }

    setLoading(true);
    setFieldErrors({});
    setCampaigns(null);
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = "Generating campaign ideas. Please wait.";
    }
    try {
      // Retrieve previously generated campaigns from localStorage.
      const storedCampaigns = JSON.parse(localStorage.getItem("previousCampaigns") || "[]");

      // Include the previous campaigns in the request payload.
      const payload = {
        startupIdea: formData.startupIdea,
        targetAudience: formData.targetAudience,
        previousCampaigns: storedCampaigns,
      };

      const response = await fetch("/api/generate-campaigns3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Failed to generate campaign ideas.");
      }
      const data = await response.json();
      setCampaigns(data.campaigns);

      // Append the new campaigns to the stored list and update localStorage.
      storedCampaigns.push(data.campaigns);
      localStorage.setItem("previousCampaigns", JSON.stringify(storedCampaigns));

      // Increment the submission count and update localStorage.
      const newCount = submissionCount + 1;
      setSubmissionCount(newCount);
      localStorage.setItem("campaignSubmissionCount", newCount);

      if (generatedContentRef.current && liveRegionRef.current) {
        liveRegionRef.current.textContent = "Campaign ideas generated.";
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        "An error occurred while generating campaign ideas. Please try again.";
      if (errorRegionRef.current) {
        errorRegionRef.current.textContent = "";
        errorRegionRef.current.textContent = errorMessage;
      }
      setFieldErrors({ global: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const getErrorSummary = () => {
    const errorKeys = Object.keys(fieldErrors).filter(
      (key) => key !== "global" && fieldErrors[key]
    );
    if (errorKeys.length === 0) {
      return null;
    }
    return (
      <ul className="text-red-500 text-center mt-4">
        {errorKeys.map((key) => (
          <li key={key}>{fieldErrors[key]}</li>
        ))}
      </ul>
    );
  };

  // PDF Download Functionality 
  const handleDownloadPDF = () => {
    if (!campaigns) return;
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let y = 20;
    const leftMargin = 20;
    const lineHeight = 7;
    const bottomMargin = 20;

    // Title
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Campaign Ideas", pageWidth / 2, y, { align: "center" });
    y += 12;

    // Loop through each campaign and add its details to the PDF.
    campaigns.forEach((campaign, index) => {
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Campaign ${index + 1}: ${campaign.name}`, leftMargin, y);
      y += 8;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");

      // Helper function to add wrapped text with pagination.
      const addWrappedText = (text) => {
        const lines = pdf.splitTextToSize(text, pageWidth - leftMargin * 2);
        lines.forEach((line) => {
          if (y + lineHeight > pageHeight - bottomMargin) {
            pdf.addPage();
            y = 20;
          }
          pdf.text(line, leftMargin, y);
          y += lineHeight;
        });
      };

      addWrappedText(`Approach: ${campaign.approach}`);
      addWrappedText(`Campaign goals: ${campaign.campaignGoals}`);
      addWrappedText(
        `Recommended technologies: ${campaign.recommendedTechnologies.join(", ")}`
      );
      y += 10; // Extra spacing between campaigns
    });

    pdf.save("campaign-ideas.pdf");
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-900">
          Campaign ideas generator
        </h1>

        <div className="sr-only" aria-live="polite" ref={liveRegionRef} />
        <div className="sr-only" aria-live="assertive" ref={errorRegionRef} />
        <div
          ref={formRef}
          role="form"
          aria-describedby="globalErrorContainer"
          className="space-y-6 mb-8"
        >
          <div className="bg-white p-6 shadow-lg border border-green-100">
            <label
              htmlFor="startupIdea"
              className="block text-lg font-semibold mb-2 text-blue-900"
            >
              Organisation
            </label>
            <textarea
              id="startupIdea"
              name="startupIdea"
              value={formData.startupIdea}
              onChange={handleChange}
              className={`w-full border-2 rounded-lg p-3 focus:ring-2 focus:ring-green-500 transition-all ${
                fieldErrors.startupIdea ? "border-red-500" : "border-green-100"
              }`}
              aria-invalid={!!fieldErrors.startupIdea}
              aria-describedby={`startupIdeaError_${
                fieldErrors.startupIdea ? "error" : ""
              }`}
              placeholder="Describe your organisation ..."
              rows="3"
            />
            {fieldErrors.startupIdea && (
              <p
                id={`startupIdeaError_${
                  fieldErrors.startupIdea ? "error" : ""
                }`}
                className="text-red-500 text-sm mt-1"
              >
                {fieldErrors.startupIdea}
              </p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              {wordCounts.startupIdea}/{charLimit} characters
            </p>
          </div>

          <div className="bg-white p-6 shadow-lg border border-green-100">
            <label
              htmlFor="targetAudience"
              className="block text-lg font-semibold mb-2 text-blue-900"
            >
              Target audience
            </label>
            <textarea
              id="targetAudience"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
              className={`w-full border-2 rounded-lg p-3 focus:ring-2 focus:ring-green-500 transition-all ${
                fieldErrors.targetAudience ? "border-red-500" : "border-green-100"
              }`}
              aria-invalid={!!fieldErrors.targetAudience}
              aria-describedby={`targetAudienceError_${
                fieldErrors.targetAudience ? "error" : ""
              }`}
              placeholder="Describe your target audience..."
              rows="3"
            />
            {fieldErrors.targetAudience && (
              <p
                id={`targetAudienceError_${
                  fieldErrors.targetAudience ? "error" : ""
                }`}
                className="text-red-500 text-sm mt-1"
              >
                {fieldErrors.targetAudience}
              </p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              {wordCounts.targetAudience}/{charLimit} characters
            </p>
          </div>
        </div>
        {getErrorSummary()}
        {fieldErrors.global && (
          <div
            id="globalErrorContainer"
            aria-live="assertive"
            className="text-red-500 text-center mt-4"
          >
            {fieldErrors.global}
          </div>
        )}

        <button
          ref={submitButtonRef}
          onClick={handleSubmit}
          disabled={loading || submissionCount >= submissionLimit}
          className={`w-full p-3 rounded-lg transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 relative ${
            loading || submissionCount >= submissionLimit
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-900 text-white hover:from-green-700 hover:to-blue-700"
          }`}
          aria-busy={loading}
          aria-disabled={submissionCount >= submissionLimit}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
              Generating...
            </div>
          ) : submissionCount >= submissionLimit ? (
            "Submission limit reached"
          ) : (
            "Generate campaign ideas"
          )}
        </button>

        {submissionCount < submissionLimit && (
          <p className="text-center mt-2 text-sm text-gray-600">
            You have {submissionLimit - submissionCount} submission
            {submissionLimit - submissionCount !== 1 ? "s" : ""} remaining.
          </p>
        )}

        {campaigns && (
          <>
            <div
              className="mt-8 space-y-6"
              aria-live="polite"
              ref={generatedContentRef}
            >
              <h2
                className="text-2xl font-bold text-center text-green-900"
                tabIndex="-1"
              >
                Generated campaign ideas
              </h2>
              {campaigns.map((campaign, index) => (
                <div
                  key={index}
                  className="bg-white p-6 shadow-lg border border-green-100 transition-all"
                >
                  <h3 className="text-xl font-bold mb-4 text-green-900">
                    {campaign.name}
                  </h3>
                  <div className="space-y-3 text-gray-700">
                    <p className="pb-2 border-b border-gray-100">
                      <span className="font-semibold text-blue-900">
                        Approach:
                      </span>{" "}
                      {campaign.approach}
                    </p>
                    <p className="pb-2 border-b border-gray-100">
                      <span className="font-semibold text-blue-900">
                        Campaign goals:
                      </span>{" "}
                      {campaign.campaignGoals}
                    </p>
                    <p>
                      <span className="font-semibold text-blue-900">
                        Recommended technologies:
                      </span>{" "}
                      {campaign.recommendedTechnologies.join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <button
                onClick={handleDownloadPDF}
                className="bg-green-900 text-white py-2 px-4 rounded"
              >
                Download as PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CampaignIdeas;