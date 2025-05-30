"use client";

import React, { useEffect } from 'react';
import { initiateAutoResize } from './resizeHelper';

const ResizeWrapper = ({ children }) => {
  useEffect(() => {
    // Start observing for resize changes when the component mounts
    initiateAutoResize();
  }, []);

  return <div>{children}</div>;
};

export default ResizeWrapper;