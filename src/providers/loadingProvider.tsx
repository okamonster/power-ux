"use client";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useState } from "react";

const LoadingContext = createContext<{
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

const LoadingProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const startLoading = useCallback(() => setIsLoading(true), []);

  const stopLoading = useCallback(() => setIsLoading(false), []);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export { LoadingContext, LoadingProvider };

export const useLoadingContext = () => useContext(LoadingContext);
