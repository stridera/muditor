'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Environment = 'dev' | 'test' | 'prod';

export interface EnvironmentContextType {
  currentEnvironment: Environment;
  setEnvironment: (env: Environment) => void;
  environments: { value: Environment; label: string; color: string }[];
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(
  undefined
);

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error(
      'useEnvironment must be used within an EnvironmentProvider'
    );
  }
  return context;
};

interface EnvironmentProviderProps {
  children: React.ReactNode;
}

export const EnvironmentProvider: React.FC<EnvironmentProviderProps> = ({
  children,
}) => {
  const [currentEnvironment, setCurrentEnvironment] =
    useState<Environment>('dev');

  const environments = [
    {
      value: 'dev' as Environment,
      label: 'Development',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      value: 'test' as Environment,
      label: 'Testing',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    {
      value: 'prod' as Environment,
      label: 'Production',
      color: 'bg-red-100 text-red-800 border-red-200',
    },
  ];

  useEffect(() => {
    // Load environment from localStorage on component mount
    const stored = localStorage.getItem('muditor-environment') as Environment;
    if (stored && environments.some(env => env.value === stored)) {
      setCurrentEnvironment(stored);
    }
  }, []);

  const setEnvironment = (env: Environment) => {
    setCurrentEnvironment(env);
    localStorage.setItem('muditor-environment', env);
  };

  return (
    <EnvironmentContext.Provider
      value={{
        currentEnvironment,
        setEnvironment,
        environments,
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
};
