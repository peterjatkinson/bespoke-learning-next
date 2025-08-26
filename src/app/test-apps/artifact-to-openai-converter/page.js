'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Target, 
  Zap, 
  Link2, 
  Lightbulb, 
  Activity, 
  MessageCircle, 
  RefreshCw,
  Download,
  Copy,
  Plus,
  Minus,
  CheckCircle,
  ArrowRight,
  Timer,
  User,
  UserCheck,
  Brain
} from 'lucide-react';

const CLEARRDesigner = () => {
  const [moduleInput, setModuleInput] = useState({
    moduleTitle: '',
    learningOutcomes: '',
    targetAudience: '',
    currentContent: '',
    assessmentDetails: '',
    resourcesAvailable: '',
    constraints: ''
  });

  const [generatedStructure, setGeneratedStructure] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState(new Set());

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const generateCLEARRStructure = async () => {
    if (!moduleInput.moduleTitle || !moduleInput.learningOutcomes || !moduleInput.currentContent) {
      alert('Please fill in at least Module Title, Learning Outcomes, and Current Content to generate the structure.');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      // Call our Next.js API route instead of directly calling OpenAI
      const response = await fetch('/test-apps/artifact-to-openai-converter/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moduleInput)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const parsedStructure = await response.json();
      setGeneratedStructure(parsedStructure);
      
    } catch (error) {
      console.error('Error generating structure:', error);
      setError(error.message || 'Error generating learning structure. Please try again.');
      alert(`Error: ${error.message || 'Failed to generate learning structure. Please try again.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getCLEARRIcon = (phase) => {
    switch(phase) {
      case 'Catalyse': return <Zap className="w-5 h-5 text-orange-500" />;
      case 'Link': return <Link2 className="w-5 h-5 text-blue-500" />;
      case 'Explain': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'Act': return <Activity className="w-5 h-5 text-green-500" />;
      case 'Respond': return <MessageCircle className="w-5 h-5 text-purple-500" />;
      case 'Reflect': return <RefreshCw className="w-5 h-5 text-teal-500" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getCLEARRColor = (phase) => {
    switch(phase) {
      case 'Catalyse': return 'bg-orange-50 border-orange-200';
      case 'Link': return 'bg-blue-50 border-blue-200';
      case 'Explain': return 'bg-yellow-50 border-yellow-200';
      case 'Act': return 'bg-green-50 border-green-200';
      case 'Respond': return 'bg-purple-50 border-purple-200';
      case 'Reflect': return 'bg-teal-50 border-teal-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getActivityTypeIcon = (type) => {
    switch(type) {
      case 'Video': return <Zap className="w-4 h-4" />;
      case 'Reading': return <BookOpen className="w-4 h-4" />;
      case 'Interactive': return <Activity className="w-4 h-4" />;
      case 'Discussion': return <MessageCircle className="w-4 h-4" />;
      case 'Quiz': return <CheckCircle className="w-4 h-4" />;
      case 'Reflection': return <Brain className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const copyStructureToClipboard = async () => {
    if (!generatedStructure) return;
    
    const structureText = `
**${generatedStructure.moduleOverview.title}**
Total Duration: ${generatedStructure.moduleOverview.totalDuration}

**Learning Outcomes:**
${generatedStructure.moduleOverview.learningOutcomes.map(outcome => `• ${outcome}`).join('\n')}

**Week Structure:**
${generatedStructure.weekStructure.map(day => `
**${day.day}: ${day.theme}** (${day.duration})
${day.clearrSections.map(section => `
${section.clearrPhase}: ${section.pageTitle} (${section.duration})
${section.activities.map(activity => `  • ${activity.title} - ${activity.description} (${activity.duration})`).join('\n')}
`).join('')}
`).join('')}

**Assessment Integration:**
Formative: ${generatedStructure.assessmentIntegration.formativeAssessments.join(', ')}
Summative: ${generatedStructure.assessmentIntegration.summativeAssessment}
Feedback Strategy: ${generatedStructure.assessmentIntegration.feedbackStrategy}

**Implementation Tips:**
${generatedStructure.implementationTips.map(tip => `• ${tip}`).join('\n')}
    `.trim();

    try {
      await navigator.clipboard.writeText(structureText);
      alert('Learning structure copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard. Please try selecting and copying manually.');
    }
  };

  const calculateTotalTime = (weekStructure) => {
    if (!weekStructure) return 0;
    
    return weekStructure.reduce((total, day) => {
      const dayMinutes = day.clearrSections.reduce((dayTotal, section) => {
        const sectionMinutes = parseInt(section.duration.match(/\d+/) || [0])[0];
        return dayTotal + sectionMinutes;
      }, 0);
      return total + dayMinutes;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10 text-indigo-600" />
            CLEARR Learning Design Generator
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Transform your online module content into a structured week of learning using the CLEARR framework: 
            <span className="font-medium"> Catalyse • Link • Explain • Act • Respond • Reflect</span>
          </p>
        </div>

        {/* CLEARR Framework Explanation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600" />
            CLEARR Framework Overview
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { phase: 'Catalyse', description: 'Hook learners, create curiosity, present engaging challenges' },
              { phase: 'Link', description: 'Connect new learning to prior knowledge and experience' },
              { phase: 'Explain', description: 'Provide clear explanations and deliver new information' },
              { phase: 'Act', description: 'Active learning through application and practice activities' },
              { phase: 'Respond', description: 'Feedback from automated systems, tutors, or peers' },
              { phase: 'Reflect', description: 'Reflection and transfer to real-world contexts' }
            ].map((item, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${getCLEARRColor(item.phase)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getCLEARRIcon(item.phase)}
                  <h3 className="font-semibold text-gray-800">{item.phase}</h3>
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-600" />
            Module Information
          </h2>
          
          <div className="space-y-6">
            {/* Module Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module Title *
              </label>
              <input
                type="text"
                value={moduleInput.moduleTitle}
                onChange={(e) => setModuleInput({...moduleInput, moduleTitle: e.target.value})}
                placeholder="e.g., Introduction to Digital Marketing"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Learning Outcomes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Outcomes *
              </label>
              <textarea
                value={moduleInput.learningOutcomes}
                onChange={(e) => setModuleInput({...moduleInput, learningOutcomes: e.target.value})}
                placeholder="List the key learning outcomes students should achieve by the end of this module..."
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <input
                type="text"
                value={moduleInput.targetAudience}
                onChange={(e) => setModuleInput({...moduleInput, targetAudience: e.target.value})}
                placeholder="e.g., First-year business students, working professionals, etc."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Current Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Module Content *
              </label>
              <textarea
                value={moduleInput.currentContent}
                onChange={(e) => setModuleInput({...moduleInput, currentContent: e.target.value})}
                placeholder="Describe your current module content, topics covered, existing materials, etc..."
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Assessment Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment Details
                </label>
                <textarea
                  value={moduleInput.assessmentDetails}
                  onChange={(e) => setModuleInput({...moduleInput, assessmentDetails: e.target.value})}
                  placeholder="Describe current or planned assessments..."
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Resources Available */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Resources
                </label>
                <textarea
                  value={moduleInput.resourcesAvailable}
                  onChange={(e) => setModuleInput({...moduleInput, resourcesAvailable: e.target.value})}
                  placeholder="Videos, readings, tools, platforms available..."
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Constraints */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Constraints & Considerations
              </label>
              <textarea
                value={moduleInput.constraints}
                onChange={(e) => setModuleInput({...moduleInput, constraints: e.target.value})}
                placeholder="Time limitations, technology constraints, student needs, etc..."
                rows="2"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <div className="mt-8 text-center">
            <button
              onClick={generateCLEARRStructure}
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mx-auto"
            >
              <BookOpen className="w-5 h-5" />
              {isGenerating ? 'Generating CLEARR Structure...' : 'Generate Learning Structure'}
            </button>
          </div>
        </div>

        {/* Generated Structure */}
        {generatedStructure && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Generated CLEARR Structure
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={copyStructureToClipboard}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy All
                </button>
                <button
                  onClick={generateCLEARRStructure}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
              </div>
            </div>

            {/* Module Overview */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{generatedStructure.moduleOverview.title}</h3>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  Total Duration: {generatedStructure.moduleOverview.totalDuration}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Timer className="w-4 h-4" />
                  {calculateTotalTime(generatedStructure.weekStructure)} minutes total
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Learning Outcomes:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {generatedStructure.moduleOverview.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="text-gray-600">{outcome}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Week Structure */}
            <div className="space-y-6">
              {generatedStructure.weekStructure.map((day, dayIndex) => (
                <div key={dayIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => toggleSection(`day-${dayIndex}`)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{day.day}: {day.theme}</h3>
                        <p className="text-sm text-gray-600">Duration: {day.duration}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {day.clearrSections.length} CLEARR sections
                        </span>
                        {expandedSections.has(`day-${dayIndex}`) ? 
                          <Minus className="w-5 h-5 text-gray-500" /> : 
                          <Plus className="w-5 h-5 text-gray-500" />
                        }
                      </div>
                    </div>
                  </div>

                  {expandedSections.has(`day-${dayIndex}`) && (
                    <div className="p-4 space-y-4">
                      {day.clearrSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className={`p-4 rounded-lg border-2 ${getCLEARRColor(section.clearrPhase)}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              {getCLEARRIcon(section.clearrPhase)}
                              <div>
                                <h4 className="font-semibold text-gray-800">{section.clearrPhase}: {section.pageTitle}</h4>
                                <p className="text-sm text-gray-600">Duration: {section.duration}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {section.activities.map((activity, actIndex) => (
                              <div key={actIndex} className="bg-white bg-opacity-50 rounded p-3 border border-white border-opacity-50">
                                <div className="flex items-start gap-3">
                                  {getActivityTypeIcon(activity.type)}
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                      <h5 className="font-medium text-gray-800">{activity.title}</h5>
                                      <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        {activity.duration}
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                    <span className="inline-block bg-white bg-opacity-70 px-2 py-1 rounded text-xs font-medium text-gray-700">
                                      {activity.type}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Assessment Integration */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-blue-600" />
                Assessment Integration
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Formative Assessments:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {generatedStructure.assessmentIntegration.formativeAssessments.map((assessment, index) => (
                      <li key={index} className="text-gray-600">{assessment}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Summative Assessment:</h4>
                  <p className="text-gray-600">{generatedStructure.assessmentIntegration.summativeAssessment}</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Feedback Strategy:</h4>
                <p className="text-gray-600">{generatedStructure.assessmentIntegration.feedbackStrategy}</p>
              </div>
            </div>

            {/* Implementation Tips */}
            <div className="mt-6 bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-green-600" />
                Implementation Tips
              </h3>
              <ul className="list-disc list-inside space-y-2">
                {generatedStructure.implementationTips.map((tip, index) => (
                  <li key={index} className="text-gray-600">{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedStructure && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">Ready to Generate Your CLEARR Structure</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Fill in your module details above to transform your content into an engaging, structured week of learning using the CLEARR framework.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CLEARRDesigner;