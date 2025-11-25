"use client";

import React, { useEffect } from 'react';
import { initiateInsendiResize, initiateCanvasResize } from './resizeHelper';
import { useLMSConfig } from './LMSConfig';

const ResizeWrapper = ({ children }) => {
  const { lmsType } = useLMSConfig();

  useEffect(() => {
    // Only run in browser context and when in an iframe
    if (typeof window === 'undefined') return;

    if (lmsType === 'canvas') {
      // Canvas LMS
      if (window.parent && window.parent !== window) {
        console.log("Canvas Resizer: Initializing for iframe environment.");
        const canvasToken = window.LTI_POST_MESSAGE_TOKEN || null;
        initiateCanvasResize(canvasToken);
      } else {
        console.log("Canvas Resizer: Not in an iframe. Skipping resize logic.");
      }
    } else {
      // Insendi LMS (default)
      console.log("Insendi Resizer: Initializing auto-resize.");
      initiateInsendiResize();
    }
  }, [lmsType]);

  return <div>{children}</div>;
};

export default ResizeWrapper;