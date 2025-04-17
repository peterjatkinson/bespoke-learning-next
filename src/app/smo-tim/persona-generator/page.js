"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, Heart, ShoppingCart, BookOpen, AlertTriangle, Smile } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from "recharts";
import jsPDF from "jspdf";

/**
 * Writes text to the PDF, wrapping it at 'maxWidth'.
 * Automatically continues on a new page if 'y' goes past the page bottom.
 * Returns the updated 'y' position after the text.
 */
function addWrappedTextWithPagination(pdf, text, x, y, options) {
  const {
    maxWidth = 170,
    lineHeight = 6,
    bottomMargin = 20,
    pageHeight = pdf.internal.pageSize.getHeight(),
    leftMargin = 20,
    rightMargin = 20, // Added for consistency, though calculation uses maxWidth
  } = options;

  // Ensure maxWidth doesn't exceed page bounds based on margins
  const effectiveMaxWidth = Math.min(maxWidth, pdf.internal.pageSize.getWidth() - leftMargin - rightMargin);

  const lines = pdf.splitTextToSize(text, effectiveMaxWidth);
  let currentY = y;

  lines.forEach((line) => {
    if (currentY + lineHeight > pageHeight - bottomMargin) {
      pdf.addPage();
      currentY = 20; // Reset Y position for the new page
    }
    pdf.text(line, x, currentY);
    currentY += lineHeight;
  });

  return currentY;
}

// Radar chart component for personality traits
const PersonaRadarChart = ({ data }) => {
  // Added basic check for data validity
  if (!data || data.length === 0) return null;

  return (
    <div className="flex justify-center">
      {/* Responsive wrapper for smaller screens */}
      <div className="w-full max-w-[500px]">
        <RadarChart
          cx="50%" // Center horizontally
          cy="50%" // Center vertically
          outerRadius="80%" // Use percentage for responsiveness
          width={500} // Maintain aspect ratio with width/height
          height={400}
          data={data}
          className="w-full h-auto" // Tailwind classes for responsiveness
        >
          <PolarGrid />
          <PolarAngleAxis dataKey="trait" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Tooltip />
          <Radar
            name="Personality"
            dataKey="value"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
        </RadarChart>
      </div>
    </div>
  );
};

const ConsumerPersona = () => {
  // Define character limits for each field
  const charLimits = {
    brandName: 50,
    brandDescription: 300,
    personName: 50,
    personAge: 50,
    personOccupation: 50,
    personLocation: 50,
  };

  const [formData, setFormData] = useState({
    brandName: "",
    brandDescription: "",
    personName: "",
    personAge: "",
    personOccupation: "",
    personLocation: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    brandName: "",
    brandDescription: "",
    personName: "",
    personAge: "",
    personOccupation: "",
    personLocation: "",
    global: null,
  });
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState(null);

  // Initialize submissionCount as null for SSR safety, useEffect updates it
  const [submissionCount, setSubmissionCount] = useState(null);
  const submissionLimit = 3;

  // References for accessibility
  const generatedContentRef = useRef(null);
  const liveRegionRef = useRef(null);
  const errorRegionRef = useRef(null);
  const submitButtonRef = useRef(null);
  const formRef = useRef(null);

  // Load submission count from local storage on client mount
  useEffect(() => {
    const storedCount = parseInt(localStorage.getItem("consumerPersonaSubmissionCount") || "0", 10);
    setSubmissionCount(storedCount);
  }, []);

  useEffect(() => {
    if (persona && generatedContentRef.current) {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = "Consumer persona generated.";
      }
      // Focus the heading of the generated content
      const heading = generatedContentRef.current.querySelector("h2");
      if (heading) {
        heading.focus();
      }
    }
  }, [persona]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const limit = charLimits[name] || 300; // Default limit if not specified

    // Enforce character limit
    const truncatedValue = value.slice(0, limit);

    setFormData((prev) => ({ ...prev, [name]: truncatedValue }));

    // Clear specific field error and global error on change
    setFieldErrors((prev) => ({ ...prev, [name]: "", global: null }));
  };

  const validateForm = () => {
    const errors = {};
    let firstErrorId = null; // To focus the first invalid field

    // Check each field against its requirements and limits
    if (!formData.brandName.trim()) {
      errors.brandName = "Brand name is required.";
      if (!firstErrorId) firstErrorId = "brandName";
    } else if (formData.brandName.length > charLimits.brandName) {
      errors.brandName = `Brand name must be ${charLimits.brandName} characters or fewer.`;
       if (!firstErrorId) firstErrorId = "brandName";
    }

    if (!formData.brandDescription.trim()) {
      errors.brandDescription = "Brand description is required.";
       if (!firstErrorId) firstErrorId = "brandDescription";
    } else if (formData.brandDescription.length > charLimits.brandDescription) {
      errors.brandDescription = `Brand description must be ${charLimits.brandDescription} characters or fewer.`;
       if (!firstErrorId) firstErrorId = "brandDescription";
    }

    if (!formData.personName.trim()) {
      errors.personName = "Person's name is required.";
       if (!firstErrorId) firstErrorId = "personName";
    } else if (formData.personName.length > charLimits.personName) {
      errors.personName = `Person's name must be ${charLimits.personName} characters or fewer.`;
       if (!firstErrorId) firstErrorId = "personName";
    }

    if (!formData.personAge.trim()) {
      errors.personAge = "Person's age is required.";
       if (!firstErrorId) firstErrorId = "personAge";
    } else if (formData.personAge.length > charLimits.personAge) {
       errors.personAge = `Person's age must be ${charLimits.personAge} characters or fewer.`;
        if (!firstErrorId) firstErrorId = "personAge";
    }

    if (!formData.personOccupation.trim()) {
      errors.personOccupation = "Person's occupation is required.";
      if (!firstErrorId) firstErrorId = "personOccupation";
    } else if (formData.personOccupation.length > charLimits.personOccupation) {
      errors.personOccupation = `Person's occupation must be ${charLimits.personOccupation} characters or fewer.`;
      if (!firstErrorId) firstErrorId = "personOccupation";
    }

    if (!formData.personLocation.trim()) {
      errors.personLocation = "Person's location is required.";
       if (!firstErrorId) firstErrorId = "personLocation";
    } else if (formData.personLocation.length > charLimits.personLocation) {
      errors.personLocation = `Person's location must be ${charLimits.personLocation} characters or fewer.`;
       if (!firstErrorId) firstErrorId = "personLocation";
    }

    setFieldErrors(errors);

    // Focus the first field with an error
    if (firstErrorId && formRef.current) {
      const errorInput = formRef.current.querySelector(`#${firstErrorId}`);
      if (errorInput) {
        errorInput.focus();
      }
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setFieldErrors((prevErrors) => ({ ...prevErrors, global: null })); // Clear previous global error
    if (!validateForm()) {
      const globalErrorMessage =
        "Please correct the errors in the form before submitting.";
      if (errorRegionRef.current) {
        // Clear previous message before setting new one for screen readers
        errorRegionRef.current.textContent = "";
        errorRegionRef.current.textContent = globalErrorMessage;
      }
      setFieldErrors((prevErrors) => ({
        ...prevErrors,
        global: globalErrorMessage,
      }));
      return;
    }

    // Prevent submission if limit reached (check against state)
    if (submissionCount !== null && submissionCount >= submissionLimit) {
        console.log("Submission limit reached.");
        return;
    }

    setLoading(true);
    setPersona(null); // Clear previous persona
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = "Generating consumer persona. Please wait.";
    }

    try {
      const response = await fetch("/smo-tim/persona-generator/api", { // Updated API endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to parse error details
        console.error("API Error Response:", errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPersona(data);

      // Increment submission count and update local storage
      const newCount = (submissionCount !== null ? submissionCount : 0) + 1;
      setSubmissionCount(newCount);
      localStorage.setItem("consumerPersonaSubmissionCount", newCount.toString()); // Store as string

      if (liveRegionRef.current) { // Announce success after state update
        liveRegionRef.current.textContent = "Consumer persona generated.";
      }

    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = `An error occurred: ${error.message}. Please try again.`;
      if (errorRegionRef.current) {
        errorRegionRef.current.textContent = ""; // Clear previous
        errorRegionRef.current.textContent = errorMessage;
      }
      setFieldErrors((prev) => ({ ...prev, global: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  // Generates a list of error messages for the summary
  const getErrorSummary = () => {
    const errorKeys = Object.keys(fieldErrors).filter((key) => key !== "global" && fieldErrors[key]);
    if (errorKeys.length === 0) {
      return null;
    }
    return (
       // Use role="alert" for immediate announcement of errors
      <div role="alert" className="border border-red-400 bg-red-50 p-4 rounded-md mb-6">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Please fix the following errors:</h2>
        <ul className="list-disc list-inside text-red-700 space-y-1">
          {errorKeys.map((key) => (
             // Link errors to the corresponding input fields
            <li key={key}>
                <a href={`#${key}`} className="hover:underline" onClick={(e) => {
                    e.preventDefault();
                    const input = formRef.current?.querySelector(`#${key}`);
                    input?.focus();
                }}>
                    {/* Map field key to a more user-friendly name if needed */}
                    {`${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}: ${fieldErrors[key]}`}
                </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const radarData =
    persona?.personalityRadar // Optional chaining
      ? [
          { trait: "Openness", value: persona.personalityRadar.openness ?? 0 }, // Default to 0 if null/undefined
          { trait: "Conscientious", value: persona.personalityRadar.conscientiousness ?? 0 },
          { trait: "Extraversion", value: persona.personalityRadar.extraversion ?? 0 },
          { trait: "Agreeableness", value: persona.personalityRadar.agreeableness ?? 0 },
          { trait: "Neuroticism", value: persona.personalityRadar.neuroticism ?? 0 },
        ]
      : [];

  const handleDownloadPDF = () => {
    if (!persona) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let y = 20; // Initial Y position
    const leftMargin = 20;
    const maxLineWidth = pageWidth - leftMargin * 2; // Max width for text wrapping
    const lineHeight = 6; // Line height for text
    const sectionSpacing = 8; // Space after a section heading
    const itemSpacing = 4; // Space after a list item/paragraph before next heading
    const bottomMargin = 20; // Bottom margin

    // Helper to check for page break BEFORE adding content
    const checkPageBreak = (neededHeight) => {
      if (y + neededHeight > pageHeight - bottomMargin) {
        pdf.addPage();
        y = 20; // Reset Y for new page
      }
    };

    // Helper to add a heading
    const addHeading = (heading) => {
      checkPageBreak(sectionSpacing + lineHeight); // Check space needed for heading + first line
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(heading, leftMargin, y);
      y += sectionSpacing; // Move Y down after heading
      pdf.setFontSize(12); // Reset font size for content
      pdf.setFont("helvetica", "normal");
    };

    // Helper to add wrapped text (uses the global function)
    const addWrapped = (text, prefix = "") => {
      if (!text) return; // Don't add empty text
       const fullText = prefix ? `${prefix}: ${text}` : text;
       // Estimate height needed before calling the wrapping function
       const lines = pdf.splitTextToSize(fullText, maxLineWidth);
       checkPageBreak(lines.length * lineHeight + 2); // Check space for all lines + small buffer
       y = addWrappedTextWithPagination(pdf, fullText, leftMargin, y, {
           maxWidth: maxLineWidth,
           lineHeight,
           bottomMargin,
           pageHeight,
           leftMargin,
       });
       y += 2; // Small gap after wrapped text block
    };


    // --- PDF Content ---

    // Title
    checkPageBreak(12 + lineHeight);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Consumer Persona", pageWidth / 2, y, { align: "center" });
    y += 12;

    // Demographics
    if (persona.demographics) {
        addHeading("Demographics");
        addWrapped(persona.demographics.name, "Name");
        addWrapped(persona.demographics.age, "Age");
        addWrapped(persona.demographics.occupation, "Occupation");
        if (persona.demographics.incomeLevel !== undefined && persona.demographics.incomeLevel !== null) {
             const formattedIncome = `£${persona.demographics.incomeLevel.toLocaleString("en-GB")}`;
             addWrapped(formattedIncome, "Income level");
        }
        addWrapped(persona.demographics.educationLevel, "Education level");
        addWrapped(persona.demographics.location, "Location");
        y += itemSpacing; // Add space before next section
    }


    // Psychographics
    if (persona.psychographics) {
        addHeading("Psychographics");
        addWrapped(persona.psychographics.valuesAndBeliefs, "Values & beliefs");
        addWrapped(persona.psychographics.lifestyle, "Lifestyle");
        addWrapped(persona.psychographics.personalityTraits, "Personality traits");
        addWrapped(persona.psychographics.goalsAndAspirations, "Goals & aspirations");
        y += itemSpacing;
    }

    // Pain Points & Challenges
    if (persona.painPointsAndChallenges) {
        addHeading("Pain points & challenges");
        addWrapped(persona.painPointsAndChallenges.primaryFrustrations, "Primary frustrations");
        addWrapped(persona.painPointsAndChallenges.underlyingCauses, "Underlying causes");
        addWrapped(persona.painPointsAndChallenges.impactOnBehavior, "Impact on behaviour");
        addWrapped(persona.painPointsAndChallenges.opportunitiesForSolutions, "Opportunities for solutions");
        y += itemSpacing;
    }


    // Purchasing Behavior
    if (persona.purchasingBehavior) {
        addHeading("Purchasing behaviour");
        addWrapped(persona.purchasingBehavior.buyingHabits, "Buying habits");
        addWrapped(persona.purchasingBehavior.purchasingMotivations, "Purchasing motivations");
        addWrapped(persona.purchasingBehavior.preferredCommunicationChannels, "Preferred communication channels");
        addWrapped(persona.purchasingBehavior.preferredPurchasingChannels, "Preferred purchasing channels");
        addWrapped(persona.purchasingBehavior.roleInBuyingProcess, "Role in buying process");
        y += itemSpacing;
    }

    // Context & Story
     if (persona.quote || persona.scenario) {
        addHeading("Context & story");
        if (persona.quote) addWrapped(persona.quote, "Quote");
        if (persona.scenario) addWrapped(persona.scenario, "Scenario");
        y += itemSpacing;
    }


    // Personality Traits (Radar) - List format for PDF
    if (persona.personalityRadar) {
        addHeading("Personality traits (Scores 0–100)");
        const radar = persona.personalityRadar;
        if (radar.openness !== undefined) addWrapped(radar.openness.toString(), "Openness");
        if (radar.conscientiousness !== undefined) addWrapped(radar.conscientiousness.toString(), "Conscientiousness");
        if (radar.extraversion !== undefined) addWrapped(radar.extraversion.toString(), "Extraversion");
        if (radar.agreeableness !== undefined) addWrapped(radar.agreeableness.toString(), "Agreeableness");
        if (radar.neuroticism !== undefined) addWrapped(radar.neuroticism.toString(), "Neuroticism");
        y += itemSpacing;
    }

    // --- Save PDF ---
    pdf.save("consumer-persona.pdf");
  };

  // Determine if button should be disabled
  const isSubmitDisabled = loading || (submissionCount !== null && submissionCount >= submissionLimit);

  return (
    <div className="min-h-full bg-gradient-to-br from-green-50 to-blue-50 p-4 pb-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">
          Consumer persona generator
        </h1>

        {/* Live regions for screen reader announcements */}
        <div className="sr-only" aria-live="polite" ref={liveRegionRef} />
        <div className="sr-only" aria-live="assertive" ref={errorRegionRef} />

        {/* Display error summary above the form */}
        {getErrorSummary()}
        {/* Display global API error messages distinctly */}
        {fieldErrors.global && !getErrorSummary() && (
          <div id="globalErrorContainer" role="alert" className="text-red-600 bg-red-100 border border-red-400 p-3 rounded-md text-center mb-4">
            {fieldErrors.global}
          </div>
        )}

        {/* More compact form layout */}
        <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="space-y-4 mb-6">
          <div className="bg-white p-4 shadow-lg rounded-lg border border-green-100">
            {/* Grid layout for form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Brand Information - Left Column */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-1">Brand Information</h3>
                
                {/* Brand Name */}
                <div className="space-y-1">
                  <label htmlFor="brandName" className="block text-sm font-medium text-gray-700">
                    Brand name
                  </label>
                  <input
                    type="text"
                    id="brandName"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleChange}
                    className={`w-full border rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 ${
                      fieldErrors.brandName ? "border-red-500" : "border-gray-300"
                    }`}
                    aria-invalid={!!fieldErrors.brandName}
                    aria-describedby={fieldErrors.brandName ? "brandName-error" : undefined}
                    placeholder="Enter brand name..."
                    maxLength={charLimits.brandName}
                  />
                  <div className="flex justify-between items-center h-5">
                    {fieldErrors.brandName && (
                      <p id="brandName-error" className="text-red-500 text-xs">
                        {fieldErrors.brandName}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs ml-auto">
                      {formData.brandName.length}/{charLimits.brandName}
                    </p>
                  </div>
                </div>
                
                {/* Brand Description */}
                <div className="space-y-1">
                  <label htmlFor="brandDescription" className="block text-sm font-medium text-gray-700">
                    Brand description
                  </label>
                  <textarea
                    id="brandDescription"
                    name="brandDescription"
                    value={formData.brandDescription}
                    onChange={handleChange}
                    className={`w-full border rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 ${
                      fieldErrors.brandDescription ? "border-red-500" : "border-gray-300"
                    }`}
                    aria-invalid={!!fieldErrors.brandDescription}
                    aria-describedby={fieldErrors.brandDescription ? "brandDescription-error" : undefined}
                    placeholder="Enter brand description..."
                    rows="3"
                    maxLength={charLimits.brandDescription}
                  />
                  <div className="flex justify-between items-center h-5">
                    {fieldErrors.brandDescription && (
                      <p id="brandDescription-error" className="text-red-500 text-xs">
                        {fieldErrors.brandDescription}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs ml-auto">
                      {formData.brandDescription.length}/{charLimits.brandDescription}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Persona Information - Right Column */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-1">Persona Information</h3>
                
                {/* Two columns for name and age */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Person's Name */}
                  <div className="space-y-1">
                    <label htmlFor="personName" className="block text-sm font-medium text-gray-700">
                      Person's name
                    </label>
                    <input
                      type="text"
                      id="personName"
                      name="personName"
                      value={formData.personName}
                      onChange={handleChange}
                      className={`w-full border rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 ${
                        fieldErrors.personName ? "border-red-500" : "border-gray-300"
                      }`}
                      aria-invalid={!!fieldErrors.personName}
                      aria-describedby={fieldErrors.personName ? "personName-error" : undefined}
                      placeholder="Enter name..."
                      maxLength={charLimits.personName}
                    />
                    <div className="h-5">
                      {fieldErrors.personName && (
                        <p id="personName-error" className="text-red-500 text-xs">
                          {fieldErrors.personName}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs ml-auto">
                      {formData.personName.length}/{charLimits.personName}
                    </p>
                    </div>
                  </div>
                  
                  {/* Person's Age */}
                  <div className="space-y-1">
                    <label htmlFor="personAge" className="block text-sm font-medium text-gray-700">
                      Person's age
                    </label>
                    <input
                      type="text"
                      id="personAge"
                      name="personAge"
                      value={formData.personAge}
                      onChange={handleChange}
                      className={`w-full border rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 ${
                        fieldErrors.personAge ? "border-red-500" : "border-gray-300"
                      }`}
                      aria-invalid={!!fieldErrors.personAge}
                      aria-describedby={fieldErrors.personAge ? "personAge-error" : undefined}
                      placeholder="e.g., 35..."
                      maxLength={charLimits.personAge}
                    />
                    <div className="h-5">
                      {fieldErrors.personAge && (
                        <p id="personAge-error" className="text-red-500 text-xs">
                          {fieldErrors.personAge}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs ml-auto">
                      {formData.personAge.length}/{charLimits.personAge}
                    </p>
                    </div>
                  </div>
                </div>
                
                {/* Two columns for occupation and location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Person's Occupation */}
                  <div className="space-y-1">
                    <label htmlFor="personOccupation" className="block text-sm font-medium text-gray-700">
                      Person's occupation
                    </label>
                    <input
                      type="text"
                      id="personOccupation"
                      name="personOccupation"
                      value={formData.personOccupation}
                      onChange={handleChange}
                      className={`w-full border rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 ${
                        fieldErrors.personOccupation ? "border-red-500" : "border-gray-300"
                      }`}
                      aria-invalid={!!fieldErrors.personOccupation}
                      aria-describedby={fieldErrors.personOccupation ? "personOccupation-error" : undefined}
                      placeholder="Enter occupation..."
                      maxLength={charLimits.personOccupation}
                    />
                    <div className="h-5">
                      {fieldErrors.personOccupation && (
                        <p id="personOccupation-error" className="text-red-500 text-xs">
                          {fieldErrors.personOccupation}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs ml-auto">
                      {formData.personOccupation.length}/{charLimits.personOccupation}
                    </p>
                    </div>
                  </div>
                  
                  {/* Person's Location */}
                  <div className="space-y-1">
                    <label htmlFor="personLocation" className="block text-sm font-medium text-gray-700">
                      Person's location
                    </label>
                    <input
                      type="text"
                      id="personLocation"
                      name="personLocation"
                      value={formData.personLocation}
                      onChange={handleChange}
                      className={`w-full border rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 ${
                        fieldErrors.personLocation ? "border-red-500" : "border-gray-300"
                      }`}
                      aria-invalid={!!fieldErrors.personLocation}
                      aria-describedby={fieldErrors.personLocation ? "personLocation-error" : undefined}
                      placeholder="e.g., London, UK..."
                      maxLength={charLimits.personLocation}
                    />
                    <div className="h-5">
                      {fieldErrors.personLocation && (
                        <p id="personLocation-error" className="text-red-500 text-xs">
                          {fieldErrors.personLocation}
                        </p>
                      )}<p className="text-gray-500 text-xs ml-auto">
                      {formData.personLocation.length}/{charLimits.personLocation}
                    </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <button
          ref={submitButtonRef}
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className={`w-full p-3 rounded-lg transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isSubmitDisabled
              ? "bg-gray-400 text-gray-700 cursor-not-allowed" 
              : "bg-blue-900 text-white hover:bg-blue-800 focus:ring-blue-500"
          }`}
          aria-busy={loading}
          aria-disabled={isSubmitDisabled}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
              Generating...
            </div>
          ) : (submissionCount !== null && submissionCount >= submissionLimit) ? (
            "Submission limit reached"
          ) : (
            "Generate consumer persona"
          )}
        </button>

        {/* Display remaining submissions */}
        {submissionCount !== null && submissionCount < submissionLimit && (
          <p className="text-center mt-2 text-sm text-gray-600">
            You have {submissionLimit - submissionCount} submission{submissionLimit - submissionCount !== 1 ? "s" : ""} remaining.
          </p>
        )}

        {/* Generated Persona Display */}
        {persona && (
          <>
            <section
              className="mt-12"
              aria-labelledby="generated-persona-heading"
              ref={generatedContentRef}
              id="personaContainer"
            >
              <h2 id="generated-persona-heading" className="text-3xl font-bold text-center text-blue-900 mb-8 outline-none" tabIndex="-1">
                Consumer persona
              </h2>

              {/* Persona Image */}
              {persona.imageUrl && (
                <div className="flex justify-center mb-8">
                  <img
                    src={persona.imageUrl}
                    alt={persona.demographics?.name ? `Portrait of ${persona.demographics.name}` : 'Generated persona portrait'}
                    className="rounded-full h-48 w-48 object-cover border-2 border-green-200 shadow-lg"
                  />
                </div>
              )}

              {/* Grid Layout for Persona Details - All headings and icons are black */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Demographics Card */}
                <div className="bg-blue-50 p-6 shadow-lg rounded-lg border border-blue-100">
                  <div className="flex items-center mb-4 border-b border-blue-200 pb-2">
                    <User className="h-6 w-6 mr-3 text-black" aria-hidden="true" />
                    <h3 className="text-2xl font-semibold text-black">Demographics</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Name:</strong> {persona.demographics?.name || 'N/A'}</li>
                    <li><strong>Age:</strong> {persona.demographics?.age || 'N/A'}</li>
                    <li><strong>Occupation:</strong> {persona.demographics?.occupation || 'N/A'}</li>
                    <li>
                      <strong>Income:</strong> {persona.demographics?.incomeLevel ? `£${persona.demographics.incomeLevel.toLocaleString('en-GB')}` : 'N/A'}
                    </li>
                    <li><strong>Education level:</strong> {persona.demographics?.educationLevel || 'N/A'}</li>
                    <li><strong>Location:</strong> {persona.demographics?.location || 'N/A'}</li>
                  </ul>
                </div>

                {/* Psychographics Card */}
                <div className="bg-blue-50 p-6 shadow-lg rounded-lg border border-blue-100">
                  <div className="flex items-center mb-4 border-b border-blue-200 pb-2">
                    <Heart className="h-6 w-6 mr-3 text-black" aria-hidden="true" />
                    <h3 className="text-2xl font-semibold text-black">Psychographics</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Values & beliefs:</strong> {persona.psychographics?.valuesAndBeliefs || 'N/A'}</li>
                    <li><strong>Lifestyle:</strong> {persona.psychographics?.lifestyle || 'N/A'}</li>
                    <li><strong>Personality:</strong> {persona.psychographics?.personalityTraits || 'N/A'}</li>
                    <li><strong>Goals & aspirations:</strong> {persona.psychographics?.goalsAndAspirations || 'N/A'}</li>
                  </ul>
                </div>

                {/* Pain Points & Challenges Card */}
                <div className="bg-purple-50 p-6 shadow-lg rounded-lg border border-purple-100">
                  <div className="flex items-center mb-4 border-b border-purple-200 pb-2">
                    <AlertTriangle className="h-6 w-6 mr-3 text-black" aria-hidden="true" />
                    <h3 className="text-2xl font-semibold text-black">Pain points & challenges</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Primary frustrations:</strong> {persona.painPointsAndChallenges?.primaryFrustrations || 'N/A'}</li>
                    <li><strong>Underlying causes:</strong> {persona.painPointsAndChallenges?.underlyingCauses || 'N/A'}</li>
                    <li><strong>Impact on behaviour:</strong> {persona.painPointsAndChallenges?.impactOnBehavior || 'N/A'}</li>
                    <li><strong>Opportunities for solutions:</strong> {persona.painPointsAndChallenges?.opportunitiesForSolutions || 'N/A'}</li>
                  </ul>
                </div>

                {/* Purchasing Behavior Card */}
                <div className="bg-purple-50 p-6 shadow-lg rounded-lg border border-purple-100">
                  <div className="flex items-center mb-4 border-b border-purple-200 pb-2">
                    <ShoppingCart className="h-6 w-6 mr-3 text-black" aria-hidden="true" />
                    <h3 className="text-2xl font-semibold text-black">Purchasing behaviour</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Buying habits:</strong> {persona.purchasingBehavior?.buyingHabits || 'N/A'}</li>
                    <li><strong>Purchasing motivations:</strong> {persona.purchasingBehavior?.purchasingMotivations || 'N/A'}</li>
                    <li><strong>Preferred communication channels:</strong> {persona.purchasingBehavior?.preferredCommunicationChannels || 'N/A'}</li>
                    <li><strong>Preferred purchasing channels:</strong> {persona.purchasingBehavior?.preferredPurchasingChannels || 'N/A'}</li>
                    <li><strong>Role in buying process:</strong> {persona.purchasingBehavior?.roleInBuyingProcess || 'N/A'}</li>
                  </ul>
                </div>
              </div>

              {/* Context & Story Card */}
              {(persona.quote || persona.scenario) && (
                <div className="bg-red-50 p-6 shadow-lg rounded-lg border border-red-100 mt-10">
                  <div className="flex items-center mb-4 border-b border-red-200 pb-2">
                    <BookOpen className="h-6 w-6 mr-3 text-black" aria-hidden="true" />
                    <h3 className="text-2xl font-semibold text-black">Context & story</h3>
                  </div>
                  {persona.quote && (
                    <div className="mb-4">
                      <p className="font-bold mb-2">Quote:</p>
                      <p className="text-gray-800 italic">{persona.quote}</p>
                    </div>
                  )}
                  {persona.scenario && (
                    <div>
                      <p className="font-bold mb-2">Scenario:</p>
                      <p className="text-gray-800">{persona.scenario}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Personality Radar Chart Card */}
              {radarData.length > 0 && (
                <div className="mt-10 bg-white p-6 shadow-lg rounded-lg border border-gray-200">
                  <div className="flex items-center mb-4 border-b border-gray-300 pb-2">
                    <Smile className="h-6 w-6 mr-3 text-black" aria-hidden="true" />
                    <h3 className="text-2xl font-semibold text-black">Personality traits</h3>
                  </div>
                  <PersonaRadarChart data={radarData} />
                </div>
              )}
            </section>

            {/* PDF Download Button */}
            <div className="text-center mt-10">
              <button
                onClick={handleDownloadPDF}
                className="bg-green-700 text-white py-2 px-6 rounded-lg hover:bg-green-800 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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

export default ConsumerPersona;