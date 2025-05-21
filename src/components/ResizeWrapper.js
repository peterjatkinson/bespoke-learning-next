// ResizeWrapper.js
"use client";

import React, { useEffect } from 'react';
import { initiateLtiAutoResize } from './resizeHelper'; // Ensure this path is correct

const ResizeWrapper = ({ children }) => {
  useEffect(() => {
    let cleanupFunction = null;

    if (typeof window !== 'undefined') {
      if (window.parent && window.parent !== window) {
        console.log("LTI iFrame Resizer: Initializing for iframe environment.");
        cleanupFunction = initiateLtiAutoResize();
      } else {
        console.log("LTI iFrame Resizer: Not in an iframe or parent is self. Skipping resize logic.");
      }
    }

    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, []);

  return <div>{children}</div>;
};

export default ResizeWrapper;