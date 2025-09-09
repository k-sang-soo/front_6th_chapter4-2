import { createContext, PropsWithChildren, useContext, useState, useMemo } from 'react';

interface ActiveTableContextType {
  activeTableId: string | null;
  setActiveTableId: (id: string | null) => void;
}

const ActiveTableContext = createContext<ActiveTableContextType | undefined>(undefined);

export const useActiveTable = () => {
  const context = useContext(ActiveTableContext);
  if (context === undefined) {
    throw new Error('useActiveTable must be used within a ActiveTableProvider');
  }
  return context;
};

export const ActiveTableProvider = ({ children }: PropsWithChildren) => {
  const [activeTableId, setActiveTableId] = useState<string | null>(null);

  const contextValue = useMemo(
    () => ({
      activeTableId,
      setActiveTableId,
    }),
    [activeTableId],
  );

  return <ActiveTableContext.Provider value={contextValue}>{children}</ActiveTableContext.Provider>;
};
