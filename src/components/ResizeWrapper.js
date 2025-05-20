// ResizeWrapper.js
"use client";

import React, { useEffect } from 'react';
import { initiateBrightspaceAutoResize } from './resizeHelper'; // Ensure this path is correct

const ResizeWrapper = ({ children }) => {
  useEffect(() => {
    let cleanupFunction = null;

    if (typeof window !== 'undefined') {
      if (window.parent && window.parent !== window) {
        console.log("Brightspace iFrame Resizer: Initializing for iframe environment.");
        cleanupFunction = initiateBrightspaceAutoResize();
      } else {
        console.log("Brightspace iFrame Resizer: Not in an iframe or parent is self. Skipping resize logic.");
      }
    }
    // If window is undefined (SSR), do nothing.

    // Cleanup function for when the component unmounts
    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  return <div>{children}</div>; // Or <>{children}</>
};

export default ResizeWrapper;
