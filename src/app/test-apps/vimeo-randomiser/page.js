"use client";

import React, { useState, useEffect } from 'react';

const VimeoVideoEmbed = () => {
  // Array of video URLs
  const videoUrls = [
    'https://player.vimeo.com/video/863538892?badge=0&autopause=0&player_id=0&app_id=58479',
    'https://player.vimeo.com/video/863538766?badge=0&autopause=0&player_id=0&app_id=58479'
  ];

  // State to hold the selected video URL
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');

  // This effect runs only once when the component mounts, thanks to the empty dependency array []
  useEffect(() => {
    // Select video using true random 50/50 chance
    const randomChoice = Math.random() < 0.5;
    const url = randomChoice ? videoUrls[0] : videoUrls[1];
    setSelectedVideoUrl(url);
  }, []); // <-- Empty array means this effect runs only on mount

  // Extract video ID from URL for accessibility labelling
  const getVideoId = (url) => {
    if (!url) return 'video'; // Handle initial empty state
    const match = url.match(/video\/(\d+)/);
    return match ? match[1] : 'video';
  };

  const videoId = getVideoId(selectedVideoUrl);

  // Don't render anything until the video URL has been selected
  if (!selectedVideoUrl) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-full bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div 
          className="relative w-full bg-white rounded-lg shadow-lg overflow-hidden"
          style={{ paddingBottom: '56.25%' }}
        >
          <iframe
            // By setting a key that is unique to the content (the URL itself),
            // you force React to create a brand new iframe element if the src ever changes,
            // rather than just updating the src prop on the old one. This guarantees a reload.
            key={selectedVideoUrl} 
            src={selectedVideoUrl}
            className="absolute top-0 left-0 w-full h-full border-0 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={`Educational video content (ID: ${videoId})`}
            aria-label="Embedded video player"
          />
        </div>
      </div>
    </div>
  );
};

export default VimeoVideoEmbed;