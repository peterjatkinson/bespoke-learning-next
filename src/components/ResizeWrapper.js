"use client";

import React, { useEffect } from 'react';
import { initiateInsendiResize, initiateCanvasResize } from './resizeHelper';
import { useLMSConfig } from './LMSConfig';

const ResizeWrapper = ({ children }) => {
  const { lmsType } = useLMSConfig();

  useEffect(() => {
    // Only run in browser context
    if (typeof window === 'undefined') return;

    let cleanup;

    if (lmsType === 'canvas') {
      // Canvas LMS
      if (window.parent && window.parent !== window) {
        console.log("Canvas Resizer: Initializing for iframe environment.");
        const canvasToken = window.LTI_POST_MESSAGE_TOKEN || null;
        cleanup = initiateCanvasResize(canvasToken);
      } else {
        console.log("Canvas Resizer: Not in an iframe. Skipping resize logic.");
      }
    } else {
      // Insendi LMS (default)
      console.log("Insendi Resizer: Initializing auto-resize.");
      cleanup = initiateInsendiResize();
    }

    // Return cleanup function to disconnect observer when effect re-runs or component unmounts
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [lmsType]);

  return <div>{children}</div>;
};

export default ResizeWrapper;