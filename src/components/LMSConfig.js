"use client";

import React, { createContext, useContext, useState } from 'react';

const LMSContext = createContext();

export function LMSConfigProvider({ children }) {
  const [lmsType, setLmsType] = useState('insendi');

  return (
    <LMSContext.Provider value={{ lmsType, setLmsType }}>
      {children}
    </LMSContext.Provider>
  );
}

export function useLMSConfig() {
  const context = useContext(LMSContext);
  if (!context) {
    throw new Error('useLMSConfig must be used within LMSConfigProvider');
  }
  return context;
}

// Simple component that pages can use to set their LMS type
export function LMSConfig({ lmsType }) {
  const { setLmsType } = useLMSConfig();

  React.useEffect(() => {
    setLmsType(lmsType);
    // Cleanup: reset to default when component unmounts
    return () => setLmsType('insendi');
  }, [lmsType, setLmsType]);

  return null; // This component doesn't render anything
}
