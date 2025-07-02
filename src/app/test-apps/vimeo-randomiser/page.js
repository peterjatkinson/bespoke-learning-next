"use client";

import React, { useMemo } from 'react';

const VimeoVideoEmbed = () => {
  // Array of video URLs to randomly select from
  const videoUrls = [
    'https://player.vimeo.com/video/863538892?badge=0&autopause=0&player_id=0&app_id=58479',
    'https://player.vimeo.com/video/863538766?badge=0&autopause=0&player_id=0&app_id=58479'
  ];

  // Randomly select a video URL when component mounts
  const selectedVideoUrl = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * videoUrls.length);
    return videoUrls[randomIndex];
  }, []);

  // Extract video ID from URL for accessibility labelling
  const getVideoId = (url) => {
    const match = url.match(/video\/(\d+)/);
    return match ? match[1] : 'video';
  };

  const videoId = getVideoId(selectedVideoUrl);

  return (
    <div className="min-h-full bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Responsive iframe container with 16:9 aspect ratio */}
        <div 
          className="relative w-full bg-white rounded-lg shadow-lg overflow-hidden"
          style={{ paddingBottom: '56.25%' }}
        >
          <iframe
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