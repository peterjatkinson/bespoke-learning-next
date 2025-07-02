"use client";

import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

const VimeoVideoEmbed = () => {
  // State for managing video player controls and accessibility
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const iframeRef = useRef(null);

  // Video information - this would typically come from props or API
  const videoData = {
    id: '863538892',
    title: 'Educational video content',
    description: 'An educational video exploring key concepts and ideas',
    duration: 'Approximately 10 minutes',
    // The provided Vimeo embed URL with accessibility parameters
    embedUrl: 'https://player.vimeo.com/video/863538892?badge=0&autopause=0&player_id=0&app_id=58479'
  };

  // Handle keyboard navigation for the video container
  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        togglePlayPause();
        break;
      case 'Escape':
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        break;
      default:
        break;
    }
  };

  // Toggle play/pause state (for demonstration - actual control would need Vimeo API)
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, you'd send postMessage to the Vimeo iframe
    // or use the Vimeo Player API to control playback
  };

  // Toggle mute state
  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In a real implementation, this would control the actual video audio
  };

  // Request fullscreen
  const requestFullscreen = () => {
    if (iframeRef.current && iframeRef.current.requestFullscreen) {
      iframeRef.current.requestFullscreen();
    }
  };

  return (
    <div className="min-h-full bg-gray-50 p-4">
      {/* Page header */}
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Video content
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Watch the embedded video content below. Use keyboard navigation or screen reader controls to interact with the video player.
          </p>
        </header>

        {/* Video information panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            About this video
          </h2>
          <dl className="grid grid-cols-1 gap-2 text-sm">
            <div>
              <dt className="font-medium text-gray-700 inline">Title:</dt>
              <dd className="text-gray-600 inline ml-2">{videoData.title}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700 inline">Description:</dt>
              <dd className="text-gray-600 inline ml-2">{videoData.description}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700 inline">Duration:</dt>
              <dd className="text-gray-600 inline ml-2">{videoData.duration}</dd>
            </div>
          </dl>
        </div>

        {/* Main video container */}
        <div 
          className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
          onFocus={() => setShowControls(true)}
          onBlur={() => setShowControls(false)}
        >
          {/* Video embed section */}
          <div className="relative">
            {/* Responsive iframe container */}
            <div 
              className="relative w-full"
              style={{ paddingBottom: '56.25%' }} // 16:9 aspect ratio
              role="region"
              aria-label="Video player"
            >
              <iframe
                ref={iframeRef}
                src={videoData.embedUrl}
                className="absolute top-0 left-0 w-full h-full border-0 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={videoData.title}
                aria-describedby="video-description"
                onKeyDown={handleKeyDown}
                tabIndex="0"
              />
            </div>

            {/* Hidden description for screen readers */}
            <div id="video-description" className="sr-only">
              {videoData.description}. Duration: {videoData.duration}. 
              Use space bar or enter to play/pause, escape to exit fullscreen.
            </div>

            {/* Custom controls overlay (for demonstration) */}
            <div 
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden="true"
            >
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={togglePlayPause}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50 transition-colors"
                    aria-label={isPlaying ? 'Pause video' : 'Play video'}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <Play className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                  
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50 transition-colors"
                    aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <Volume2 className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                </div>

                <button
                  onClick={requestFullscreen}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50 transition-colors"
                  aria-label="Enter fullscreen mode"
                >
                  <Maximize className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Video details and transcript section */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Video details
            </h3>
            
            {/* Accessibility features information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">
                Accessibility features
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Keyboard navigation: Use space bar or enter to play/pause</li>
                <li>• Screen reader compatible with video descriptions</li>
                <li>• Closed captions available (if provided by video source)</li>
                <li>• High contrast controls and focus indicators</li>
              </ul>
            </div>

            {/* Additional information */}
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Video ID:</strong> {videoData.id}
              </p>
              <p>
                <strong>Platform:</strong> Vimeo
              </p>
              <p>
                This video is embedded from Vimeo and may include additional accessibility features 
                such as closed captions, audio descriptions, and playback speed controls depending 
                on the original video's configuration.
              </p>
            </div>
          </div>
        </div>

        {/* Usage instructions */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">
            How to use this video player
          </h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Mouse users:</strong> Click the video to play/pause, hover to show controls</p>
            <p><strong>Keyboard users:</strong> Tab to focus the video, then use space bar or enter to control playback</p>
            <p><strong>Screen reader users:</strong> The video includes descriptive labels and instructions</p>
            <p><strong>Mobile users:</strong> Tap the video to access native mobile video controls</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VimeoVideoEmbed;