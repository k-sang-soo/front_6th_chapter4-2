import React, { createContext, PropsWithChildren, useContext, useState, useMemo } from 'react';
import { Schedule } from './types.ts';
import dummyScheduleMap from './dummyScheduleMap.ts';

interface ScheduleContextType {
  schedulesMap: Record<string, Schedule[]>;
  setSchedulesMap: React.Dispatch<React.SetStateAction<Record<string, Schedule[]>>>;
  activeTableId: string | null;
  setActiveTableId: (id: string | null) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const useScheduleContext = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};

export const ScheduleProvider = ({ children }: PropsWithChildren) => {
  const [schedulesMap, setSchedulesMap] = useState<Record<string, Schedule[]>>(dummyScheduleMap);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);

  const contextValue = useMemo(
    () => ({
      schedulesMap,
      setSchedulesMap,
      activeTableId,
      setActiveTableId,
    }),
    [schedulesMap, activeTableId],
  );

  return <ScheduleContext.Provider value={contextValue}>{children}</ScheduleContext.Provider>;
};
