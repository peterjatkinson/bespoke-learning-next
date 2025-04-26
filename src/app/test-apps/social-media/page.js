// === Artifact: page.js ===
"use client";

import React, { useState, useRef, useEffect } from 'react';
// Import the Image component from next/image
import Image from 'next/image';
import {
    Send, Mail, Facebook, Twitter, Instagram, Film, Loader2, AlertTriangle, Image as LucideImageIcon, // Renamed icon to avoid conflict
    Heart, MessageSquare, ThumbsUp, Share2, Repeat, Upload, Bookmark, MoreHorizontal,
    ChevronLeft, ChevronRight // Icons for carousel controls
} from 'lucide-react';

// Platform definitions - controlling order and display names
const PLATFORM_CONFIG = [
    { key: 'email', label: 'Email Message', icon: Mail },
    { key: 'facebook', label: 'Facebook Post', icon: Facebook },
    { key: 'x', label: 'X (Twitter) Post', icon: Twitter },
    { key: 'instagram', label: 'Instagram Post', icon: Instagram },
    { key: 'tiktok', label: 'TikTok Post', icon: Film },
];

// --- PlatformPostDisplay Component (Modified for next/image) ---
// Component to render the generated post based on the selected platform
const PlatformPostDisplay = ({ platform, text, imageUrl, productName, campaignIdea }) => {
    // Basic alt text for the generated image
    const imageAlt = `Generated image for ${productName} campaign about ${campaignIdea}`;
    let subjectLine = null;

    // Special handling for email subject line
     if (platform === 'email' && text && text.includes('Subject: ')) {
        const parts = text.split('Subject: ');
        subjectLine = parts.length > 1 ? parts[1].split('\n')[0].trim() : '[Generated Subject Line]';
        // Remove the subject line from the main body text for display
        // Find the first newline after the subject line
        const newlineAfterSubjectIndex = text.indexOf('\n', text.indexOf('Subject: ') + 'Subject: '.length);
        if (newlineAfterSubjectIndex !== -1) {
             text = text.substring(0, text.indexOf('Subject: ')) + text.substring(newlineAfterSubjectIndex + 1).trim();
        } else {
             // Handle case where subject is the last line (unlikely but safe)
             text = text.substring(0, text.indexOf('Subject: ')).trim();
        }
         text = text.trim(); // Final trim just in case
    }


    switch (platform) {
        case 'email':
            return (
                <div className="border border-gray-300 rounded-lg shadow-md max-w-2xl w-full mx-auto overflow-hidden bg-white">
                    <div className="p-3 bg-gray-100 border-b border-gray-300 text-sm text-gray-600">
                        <p><strong>Subject:</strong> {subjectLine || '[Generated Subject Line]'}</p>
                        <p><strong>From:</strong> Your Brand (hello@yourbrand.com)</p>
                        <p><strong>To:</strong> Valued Customer (customer@email.com)</p>
                    </div>
                    <div className="p-6 space-y-4">
                        {imageUrl && (
                            // Image Container - Added relative and defined height/max-height
                            <div className="relative w-full h-64 max-h-64 rounded mb-4 border border-gray-200 overflow-hidden">
                                <Image
                                    src={imageUrl}
                                    alt={imageAlt}
                                    layout="fill" // Use fill layout as dimensions are unknown
                                    objectFit="cover" // How the image should fit
                                    className="rounded" // Apply rounded corners to the image within the container
                                />
                            </div>
                        )}
                        <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
                            {text || 'Generated email content will appear here...'}
                        </div>
                    </div>
                    <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                        Email Footer | Unsubscribe | Your Brand Address
                    </div>
                </div>
            );
        case 'facebook':
             return (
                <div className="border border-gray-300 rounded-lg shadow-md max-w-md w-full mx-auto bg-white">
                    {/* Facebook Header */}
                    <div className="p-3 flex items-center space-x-2 border-b border-gray-200">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                            YB {/* Your Brand Initials */}
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-gray-900">Your Brand</p>
                            <p className="text-xs text-gray-500">Sponsored · Just now</p>
                        </div>
                        <div className="ml-auto text-gray-500">
                            <MoreHorizontal className="w-5 h-5" />
                        </div>
                    </div>
                    {/* Facebook Content */}
                    <div className="p-3 text-sm text-gray-800 whitespace-pre-wrap">
                        {text || 'Generated Facebook post content will appear here...'}
                    </div>
                    {/* Facebook Image - Added relative container */}
                    {imageUrl && (
                        <div className="relative bg-gray-200 border-t border-b border-gray-200 w-full h-72 max-h-96 overflow-hidden"> {/* Added height/max-height */}
                            <Image
                                src={imageUrl}
                                alt={imageAlt}
                                layout="fill"
                                objectFit="cover"
                            />
                        </div>
                    )}
                    {/* Facebook Actions */}
                    <div className="p-2 border-t border-gray-200 flex justify-around text-sm text-gray-600">
                        <button className="flex items-center space-x-1 hover:bg-gray-100 rounded px-2 py-1">
                            <ThumbsUp className="w-4 h-4" /> <span>Like</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:bg-gray-100 rounded px-2 py-1">
                            <MessageSquare className="w-4 h-4" /> <span>Comment</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:bg-gray-100 rounded px-2 py-1">
                            <Share2 className="w-4 h-4" /> <span>Share</span>
                        </button>
                    </div>
                </div>
            );
        case 'x': // Formerly Twitter
            return (
                <div className="border border-gray-200 rounded-lg shadow-sm max-w-md w-full mx-auto bg-white p-3">
                    <div className="flex items-start space-x-3">
                        {/* X Profile Icon */}
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                            YB
                        </div>
                        <div className="flex-1">
                            {/* X Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1 flex-wrap">
                                    <p className="font-bold text-sm text-gray-900">Your Brand</p>
                                    <p className="text-sm text-gray-500">@yourbrand</p>
                                    <span className="text-sm text-gray-500">·</span>
                                    <p className="text-sm text-gray-500">Now</p>
                                </div>
                                <div className="text-gray-500">
                                    <MoreHorizontal className="w-5 h-5" />
                                </div>
                            </div>
                            {/* X Content */}
                            <div className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">
                                {text || 'Generated X post content will appear here...'}
                            </div>
                            {/* X Image - Added relative container */}
                            {imageUrl && (
                                <div className="relative mt-2 border border-gray-200 rounded-lg overflow-hidden w-full h-64 max-h-80"> {/* Added height/max-height */}
                                    <Image
                                        src={imageUrl}
                                        alt={imageAlt}
                                        layout="fill"
                                        objectFit="cover"
                                        className="rounded-lg" // Apply rounded corners
                                    />
                                </div>
                            )}
                            {/* X Actions */}
                            <div className="mt-2 flex justify-between text-sm text-gray-500 max-w-xs">
                                <button className="flex items-center space-x-1 hover:text-blue-500">
                                    <MessageSquare className="w-4 h-4" /> <span className="text-xs"></span> {/* Count placeholder */}
                                </button>
                                <button className="flex items-center space-x-1 hover:text-green-500">
                                    <Repeat className="w-4 h-4" /> <span className="text-xs"></span>
                                </button>
                                <button className="flex items-center space-x-1 hover:text-red-500">
                                    <Heart className="w-4 h-4" /> <span className="text-xs"></span>
                                </button>
                                <button className="flex items-center space-x-1 hover:text-blue-500">
                                    <Upload className="w-4 h-4" /> {/* Upload icon often used for share */}
                                </button>
                                <button className="flex items-center space-x-1 hover:text-blue-500">
                                    <Bookmark className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'instagram':
            return (
                <div className="border border-gray-300 rounded-none sm:rounded-lg shadow-md max-w-sm w-full mx-auto bg-white overflow-hidden">
                    {/* Instagram Header */}
                    <div className="p-2 flex items-center justify-between border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-full p-0.5 shrink-0">
                                <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-xs">YB</div>
                            </div>
                            <p className="font-semibold text-xs text-gray-900">yourbrand</p>
                        </div>
                        {/* Three dots icon added here */}
                        <div className="text-gray-800">
                            <MoreHorizontal className="w-5 h-5" />
                        </div>
                    </div>
                    {/* Instagram Image - Added relative container with aspect ratio */}
                    {imageUrl ? (
                        <div className="relative bg-gray-200 aspect-square overflow-hidden"> {/* Added relative */}
                             <Image
                                src={imageUrl}
                                alt={imageAlt}
                                layout="fill"
                                objectFit="cover"
                            />
                        </div>
                    ) : (
                        // Placeholder - Ensure it has the same aspect ratio and relative positioning if it's a direct sibling possibility
                        <div className="relative bg-gray-200 aspect-square flex items-center justify-center text-gray-400">
                            <LucideImageIcon className="w-16 h-16" /> {/* Use renamed icon */}
                        </div>
                    )}
                    {/* Instagram Actions */}
                    <div className="p-3 space-y-2">
                        <div className="flex justify-between items-center">
                            <div className="flex space-x-4 items-center">
                                <button aria-label="Like">
                                    <Heart className="w-6 h-6 text-gray-700 hover:text-red-500" />
                                </button>
                                <button aria-label="Comment">
                                    <MessageSquare className="w-6 h-6 text-gray-700 hover:text-gray-900" />
                                </button>
                                <button aria-label="Share Post">
                                    <Send className="w-6 h-6 text-gray-700 hover:text-gray-900" />
                                </button>
                            </div>
                            <button aria-label="Save Post">
                                <Bookmark className="w-6 h-6 text-gray-700 hover:text-gray-900" />
                            </button>
                        </div>
                        {/* Likes Counter Placeholder */}
                        <p className="text-xs font-semibold">Liked by user and others</p>
                        {/* Caption */}
                        <p className="text-xs">
                            <span className="font-semibold">yourbrand</span>
                            <span className="ml-1 whitespace-pre-wrap">{text || 'Generated Instagram caption will appear here...'}</span>
                        </p>
                        {/* Comments/Timestamp */}
                        <p className="text-xs text-gray-400 hover:underline cursor-pointer">View all comments</p>
                        <p className="text-[10px] text-gray-400 uppercase">Just now</p>
                    </div>
                </div>
            );
       case 'tiktok':
             return (
                <div className="relative border border-gray-800 rounded-lg shadow-lg w-full max-w-[280px] aspect-[9/16] min-h-[498px] mx-auto bg-black overflow-hidden">
                    {/* TikTok Background Image/Video Placeholder */}
                    {imageUrl ? (
                        // Image - Already had absolute/inset, just need to add relative to parent
                        <Image
                            src={imageUrl}
                            alt={imageAlt}
                            layout="fill"
                            objectFit="cover"
                            className="opacity-80" // Apply opacity via className
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gray-700 flex items-center justify-center text-gray-400">
                            <Film className="w-16 h-16" />
                        </div>
                    )}
                    {/* TikTok Overlay Content */}
                    <div className="absolute bottom-0 left-0 right-12 p-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent text-white z-10">
                        <p className="text-sm font-semibold">@yourbrand</p>
                        <p className="text-xs mt-1 leading-tight whitespace-pre-wrap">{text || 'Generated TikTok caption will appear here...'}</p>
                        <p className="text-xs mt-1 flex items-center">
                            {/* Simple music note icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M9 13c0 .552-.448 1-1 1s-1-.448-1-1V4.146A3.001 3.001 0 0 0 5 7c-1.657 0-3-1.343-3-3s1.343-3 3-3a3.001 3.001 0 0 0 2.854 2H8c.552 0 1 .448 1 1v7zm-2-9.168A2 2 0 1 1 5 3a2 2 0 0 1 2 1.832V13a2 2 0 1 1-4 0V7a4 4 0 0 1 3.146-3.918z" />
                            </svg>
                            Original Sound - Your Brand
                        </p>
                    </div>
                    {/* TikTok Side Action Icons */}
                    <div className="absolute right-2 bottom-16 flex flex-col items-center space-y-4 text-white z-10">
                        {/* Profile Pic placeholder */}
                        <div className="w-10 h-10 bg-gray-400 rounded-full border-2 border-white mb-1"></div>
                        {/* Actions */}
                        <button className="flex flex-col items-center" aria-label="Like">
                            <Heart className="w-7 h-7" />
                            <span className="text-xs font-semibold mt-1">Like</span>
                        </button>
                        <button className="flex flex-col items-center" aria-label="Comment">
                            <MessageSquare className="w-7 h-7" />
                            <span className="text-xs font-semibold mt-1">Comm</span>
                        </button>
                        <button className="flex flex-col items-center" aria-label="Share">
                            <Share2 className="w-7 h-7" />
                            <span className="text-xs font-semibold mt-1">Share</span>
                        </button>
                         {/* Rotating sound icon placeholder */}
                         <div className="w-8 h-8 bg-gray-600/80 rounded-full border-2 border-gray-800 animate-spin-slow mt-2"></div>
                    </div>
                </div>
            );
        default:
            // Should not happen if PLATFORM_CONFIG is used correctly
            return <p className="text-center text-gray-500">Unknown platform preview.</p>;
    }
};
// --- End of PlatformPostDisplay Component ---


// Add a simple animation for TikTok's spinning disc if desired
const styles = `
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 5s linear infinite;
}
`;
// In Next.js App Router, you can often put global styles in global.css
// or use a styled-jsx like approach if needed for component-level styles.
// For simplicity, keeping the injector here for now, but consider global styles.
const StyleInjector = () => <style jsx global>{styles}</style>;


const SocialCampaignGenerator = () => {
    // State for form inputs
    const [campaignIdea, setCampaignIdea] = useState('');
    const [productName, setProductName] = useState('');
    // Removed platform state: const [platform, setPlatform] = useState('instagram');

    // State for API interaction
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Updated result state structure
    const [result, setResult] = useState({ imageUrl: null, texts: null });

    // State for carousel
    const [currentSlide, setCurrentSlide] = useState(0);

    // Ref for live region updates
    const liveRegionRef = useRef(null);
    // Ref for result section to scroll to
    const resultRef = useRef(null);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!campaignIdea.trim() || !productName.trim()) {
            setError('Please provide both a campaign idea and a product/service name.');
            if (liveRegionRef.current) {
                liveRegionRef.current.textContent = 'Error: Please fill in all required fields.';
            }
            return;
        }

        setLoading(true);
        setError(null);
        setResult({ imageUrl: null, texts: null }); // Clear previous results
        setCurrentSlide(0); // Reset carousel to first slide
        if (liveRegionRef.current) {
            // Updated loading message
            liveRegionRef.current.textContent = `Generating campaign content for all platforms for ${productName}. Please wait...`;
        }

        try {
            // Make API call to the backend route - removed platform from body
            // Ensure API endpoint is correct
            const response = await fetch('/test-apps/social-media/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignIdea, productName }), // Sending only idea and name
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            // Store results: { texts: { platform: text, ... }, imageUrl: '...' }
            setResult(data);
            if (liveRegionRef.current) {
                // Updated success message
                liveRegionRef.current.textContent = `Successfully generated campaign content for ${productName}.`;
            }

        } catch (err) {
            console.error('Generation failed:', err);
            setError(`An error occurred while generating the campaign content: ${err.message}. Please try again.`);
            if (liveRegionRef.current) {
                liveRegionRef.current.textContent = `Error generating campaign content: ${err.message}`;
            }
        } finally {
            setLoading(false);
        }
    };

    // Carousel navigation functions
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === PLATFORM_CONFIG.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? PLATFORM_CONFIG.length - 1 : prev + 1)); // Fixed prevSlide logic
    };

    // Effect to scroll to results when they appear
    useEffect(() => {
        if (result.texts && resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [result]);

    // Get the current platform config based on the slide index
    const currentPlatformConfig = PLATFORM_CONFIG[currentSlide];

    return (
        <div className="min-h-full bg-gradient-to-b from-indigo-50 to-purple-100 px-4 py-8">
             {/* Inject CSS animation - Use styled-jsx global for App Router */}
            <StyleInjector />
            <div className="max-w-4xl mx-auto"> {/* Increased max-width for better carousel view */}
                {/* Live region for screen reader announcements */}
                <div className="sr-only" aria-live="polite" ref={liveRegionRef}></div>

                {/* Header */}
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-indigo-900 mb-2">
                        Social Media Campaign Generator
                    </h1>
                    <p className="text-gray-600">
                        Enter your campaign idea and product to generate tailored content across different social platforms.
                    </p>
                </header>

                {/* Input Form - Removed Platform Select */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8 space-y-6 max-w-2xl mx-auto">
                    <div>
                        <label htmlFor="campaignIdea" className="block text-sm font-medium text-gray-700 mb-1">
                            Marketing Campaign Idea <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="campaignIdea"
                            value={campaignIdea}
                            onChange={(e) => setCampaignIdea(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="e.g., Launch campaign for our new eco-friendly water bottle, focusing on sustainability and hydration."
                            rows="3"
                            required
                            aria-required="true"
                        />
                    </div>

                    <div>
                        <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                            Product/Service Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="productName"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="e.g., AquaPure Bottle"
                            required
                            aria-required="true"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !campaignIdea.trim() || !productName.trim()}
                            className={`w-full py-3 px-6 flex items-center justify-center ${loading || !campaignIdea.trim() || !productName.trim()
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                                } text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors`}
                            aria-busy={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Generating Content...
                                </>
                            ) : (
                                <>
                                    <Send className="h-5 w-5 mr-2" />
                                    Generate Campaign Posts
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded mb-6 flex items-start shadow max-w-2xl mx-auto" role="alert">
                        <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-red-600" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Results Display Area - Carousel */}
                {result.texts && (
                    <div ref={resultRef} className="bg-white rounded-lg shadow-md p-6 mt-8" aria-labelledby="results-heading">
                        <h2 id="results-heading" className="text-xl font-semibold text-gray-800 mb-4 text-center">
                            Generated Campaign Content
                        </h2>

                        {/* Carousel Container */}
                        <div className="relative">
                            {/* Slide Content Area */}
                            <div className="overflow-hidden relative min-h-[550px] flex items-center justify-center mb-4 p-4 bg-gray-50 rounded"> {/* Added min-height */}
                                {PLATFORM_CONFIG.map((platformConf, index) => (
                                    <div
                                        key={platformConf.key}
                                        // Use flexbox to center the content horizontally
                                        className={`w-full h-full transition-opacity duration-500 ease-in-out flex justify-center ${index === currentSlide ? 'opacity-100 z-10 relative' : 'opacity-0 absolute top-0 left-0 z-0 pointer-events-none'}`}
                                        aria-hidden={index !== currentSlide}
                                    >
                                        {/* PlatformPostDisplay content will be centered within this flex item */}
                                        <PlatformPostDisplay
                                            platform={platformConf.key}
                                            text={result.texts[platformConf.key]}
                                            imageUrl={result.imageUrl}
                                            productName={productName}
                                            campaignIdea={campaignIdea}
                                        />
                                    </div>
                                ))}
                            </div>

                             {/* Carousel Controls & Indicator */}
                            <div className="flex items-center justify-between mt-4">
                                <button
                                    onClick={prevSlide}
                                    className="p-2 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Previous Platform"
                                    disabled={PLATFORM_CONFIG.length <= 1}
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>

                                {/* Platform Indicator */}
                                <div className="flex items-center space-x-2 text-center px-4">
                                    {currentPlatformConfig?.icon && React.createElement(currentPlatformConfig.icon, { className: "h-5 w-5 text-indigo-600 inline-block" })}
                                    <span className="font-medium text-gray-700">{currentPlatformConfig?.label} ({currentSlide + 1} / {PLATFORM_CONFIG.length})</span>
                                </div>

                                <button
                                    onClick={nextSlide}
                                    className="p-2 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Next Platform"
                                    disabled={PLATFORM_CONFIG.length <= 1}
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialCampaignGenerator;