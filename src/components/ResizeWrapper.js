// ResizeWrapper.js
"use client";

import React, { useEffect } from 'react';
import { initiateAutoResize } from './resizeHelper'; // Ensure this path is correct

const ResizeWrapper = ({ children }) => {
  useEffect(() => {
    // This will be undefined/null in your non-LTI scenario, which is fine.
    const canvasToken = typeof window !== 'undefined' ? window.LTI_POST_MESSAGE_TOKEN || null : null;

    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      console.log("Canvas Resizer: Initializing for iframe environment.");
      initiateAutoResize(canvasToken); // canvasToken will be null
    } else if (typeof window !== 'undefined' && (!window.parent || window.parent === window)) {
      console.log("Canvas Resizer: Not in an iframe or parent is self. Skipping resize logic.");
    }
    // If window is undefined (SSR), do nothing.
  }, []);

  return <div>{children}</div>; // Or <>{children}</> if you prefer
};

export default ResizeWrapper;