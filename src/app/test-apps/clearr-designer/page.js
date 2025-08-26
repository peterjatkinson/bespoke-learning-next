'use client';

import React, { useState } from 'react';
import { BookOpen, Lightbulb, Link, FileText, Activity, MessageCircle, RefreshCw, Loader2 } from 'lucide-react';

const ClearrGenerator = () => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('');
  const [duration, setDuration] = useState('');
  const [learningObjective, setLearningObjective] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedActivity, setGeneratedActivity] = useState(null);
  const [error, setError] = useState('');

  const generateActivity = async () => {
    if (!topic || !level || !duration || !learningObjective) {
      setError('Please fill in all fields before generating an activity.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/test-apps/clearr-designer/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          level,
          duration,
          learningObjective
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.activity) {
        throw new Error('Invalid response from server');
      }

      setGeneratedActivity(data.activity);
    } catch (error) {
      console.error('Error generating activity:', error);
      setError(error.message || 'Failed to generate activity. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearForm = () => {
    setTopic('');
    setLevel('');
    setDuration('');
    setLearningObjective('');
    setGeneratedActivity(null);
    setError('');
  };

  const clearrIcons = {
    catalyse: <Lightbulb className="w-6 h-6 text-yellow-600" />,
    link: <Link className="w-6 h-6 text-blue-600" />,
    explain: <FileText className="w-6 h-6 text-green-600" />,
    act: <Activity className="w-6 h-6 text-purple-600" />,
    respond: <MessageCircle className="w-6 h-6 text-orange-600" />,
    reflect: <RefreshCw className="w-6 h-6 text-teal-600" />
  };

  const clearrTitles = {
    catalyse: 'Catalyse/Challenge',
    link: 'Link',
    explain: 'Explain',
    act: 'Act/Apply',
    respond: 'Respond',
    reflect: 'Reflect/Relate'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-10 h-10 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">CLEARR Learning Generator</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create engaging online learning activities following the CLEARR pedagogical model: 
            Catalyse, Link, Explain, Act, Respond, and Reflect.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Design Your Learning Activity</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic/Subject
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Climate Change, Python Programming, World War II"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="High School">High School</option>
                <option value="University">University</option>
                <option value="Professional Development">Professional Development</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select duration</option>
                <option value="30 minutes">30 minutes</option>
                <option value="1 hour">1 hour</option>
                <option value="90 minutes">90 minutes</option>
                <option value="2 hours">2 hours</option>
                <option value="Half day">Half day</option>
                <option value="Full day">Full day</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Objective
              </label>
              <input
                type="text"
                value={learningObjective}
                onChange={(e) => setLearningObjective(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Students will be able to analyze the causes of..."
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              onClick={generateActivity}
              disabled={isGenerating}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Activity...
                </>
              ) : (
                'Generate CLEARR Activity'
              )}
            </button>
            <button
              onClick={clearForm}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Generated Activity */}
        {generatedActivity && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{generatedActivity.title}</h2>
              <p className="text-lg text-gray-600">{generatedActivity.overview}</p>
            </div>

            {/* CLEARR Components */}
            <div className="grid gap-8">
              {Object.entries(generatedActivity.clearr_components).map(([key, component]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-6 border-l-4 border-indigo-500">
                  <div className="flex items-center mb-4">
                    {clearrIcons[key]}
                    <h3 className="text-2xl font-semibold text-gray-800 ml-3">
                      {clearrTitles[key]}
                    </h3>
                    <span className="ml-auto text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full">
                      {component.time}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-700 text-lg leading-relaxed">{component.description}</p>
                  </div>

                  <div className="grid gap-4">
                    <div className="bg-white p-5 rounded-md border">
                      <h4 className="font-semibold text-gray-800 mb-3 text-lg">Step-by-Step Activity:</h4>
                      <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {component.step_by_step_activity}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                        <h5 className="font-medium text-gray-800 mb-2">Materials Needed:</h5>
                        <p className="text-sm text-gray-700">{component.materials_needed}</p>
                      </div>

                      <div className="bg-green-50 p-4 rounded-md border border-green-200">
                        <h5 className="font-medium text-gray-800 mb-2">Facilitator Notes:</h5>
                        <p className="text-sm text-gray-700">{component.facilitator_notes}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Information */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Tools Needed</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {generatedActivity.tools_needed.map((tool, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Assessment</h4>
                <p className="text-sm text-gray-700">{generatedActivity.assessment_method}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Adaptations</h4>
                <p className="text-sm text-gray-700">{generatedActivity.adaptations}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClearrGenerator;