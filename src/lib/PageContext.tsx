"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";

interface PageContextValue {
  currentPage: number;
  totalPages: number;
  setPageInfo: (currentPage: number, totalPages: number) => void;
}

const PageContext = createContext<PageContextValue>({
  currentPage: 0,
  totalPages: 1,
  setPageInfo: () => {},
});

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({ currentPage: 0, totalPages: 1 });

  const setPageInfo = useCallback((currentPage: number, totalPages: number) => {
    setState((prev) => {
      if (prev.currentPage === currentPage && prev.totalPages === totalPages) return prev;
      return { currentPage, totalPages };
    });
  }, []);

  const value = useMemo(
    () => ({ ...state, setPageInfo }),
    [state, setPageInfo]
  );

  return <PageContext value={value}>{children}</PageContext>;
}

export const usePageContext = () => useContext(PageContext);
