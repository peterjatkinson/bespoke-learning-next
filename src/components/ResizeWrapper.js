"use client";

import React, { useEffect } from 'react';
import { initiateAutoResize } from './resizeHelper';

const ResizeWrapper = ({ children }) => {
  useEffect(() => {
    // Start observing for resize changes when the component mounts
    // This works for both Insendi and Canvas LMS automatically
    const cleanup = initiateAutoResize();

    // Cleanup when component unmounts
    return cleanup;
  }, []);

  return <div>{children}</div>;
};

export default ResizeWrapper;