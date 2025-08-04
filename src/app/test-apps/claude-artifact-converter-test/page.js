'use client';

import React, { useState } from 'react';
import { Copy, Upload, Eye, FileImage, Zap } from 'lucide-react';

export default function AltTextGenerator() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [altText, setAltText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [context, setContext] = useState('');
  const [error, setError] = useState('');

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      // Clear previous alt text and errors when new image is uploaded
      setAltText('');
      setError('');
    }
  };

  const generateAltText = async () => {
    if (!imageFile) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Convert image to base64
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(imageFile);
      });

      // Determine media type
      const mediaType = imageFile.type || 'image/png';

      // Make request to our API route
      const response = await fetch('/test-apps/claude-artifact-converter-test/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64Data,
          mediaType: mediaType,
          context: context
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      if (data.success && data.altText) {
        setAltText(data.altText);
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error("Error generating alt text:", error);
      setError(error.message || "Error generating alt text. Please try again.");
      setAltText('');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(altText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setAltText('');
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
        setAltText('');
        setError('');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg mb-4">
            <Eye className="w-8 h-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-800">AI Alt Text Generator</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload any image and get professional alt text in British English, formatted as a single paragraph
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              Upload Image
            </h2>

            {/* Image Upload Area */}
            <div className="mb-4">
              {!imagePreview ? (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <FileImage className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg text-gray-600 mb-2">Drop an image here or click to upload</p>
                    <p className="text-sm text-gray-400">PNG, JPG, GIF, WebP and other image formats supported</p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Uploaded image for alt text generation" 
                    className="w-full max-h-80 object-contain rounded-lg border shadow-sm"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Context Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Context (Optional)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Provide any additional context about the image's purpose or important details to focus on..."
                className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={generateAltText}
              disabled={!imageFile || isLoading}
              className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analysing Image...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate Alt Text
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Eye className="w-5 h-5 text-teal-600" />
                Generated Alt Text
              </h2>
              {altText && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>

            <div className="min-h-[300px]">
              {error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="text-red-600 mt-1 text-sm">{error}</p>
                </div>
              ) : altText ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 leading-relaxed">
                      {altText}
                    </p>
                  </div>
                  
                  {/* Character count */}
                  <div className="text-sm text-gray-500 text-right">
                    {altText.length} characters
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <div className="text-center">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Upload an image to generate alt text</p>
                    <p className="text-sm mt-2">Professional alt text in British English</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              Alt Text Best Practices
            </h3>
            <p className="text-sm text-gray-600">
              Good alt text describes the essential visual information in a concise way. It should convey the purpose and meaning of the image, not just list what's visible. For decorative images, brief descriptions work best.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-teal-600" />
              British English Formatting
            </h3>
            <p className="text-sm text-gray-600">
              This tool uses British spellings and formatting conventions, avoids Oxford commas, and presents everything as a single readable paragraph perfect for screen readers and accessibility compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}