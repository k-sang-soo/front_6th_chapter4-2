import { ChakraProvider } from '@chakra-ui/react';
import { ScheduleProvider } from './ScheduleContext.tsx';
import { ActiveTableProvider } from './ActiveTableContext.tsx';
import { ScheduleTables } from './ScheduleTables.tsx';
import ScheduleDndProvider from './ScheduleDndProvider.tsx';

function App() {
  return (
    <ChakraProvider>
      <ScheduleProvider>
        <ActiveTableProvider>
          <ScheduleDndProvider>
            <ScheduleTables />
          </ScheduleDndProvider>
        </ActiveTableProvider>
      </ScheduleProvider>
    </ChakraProvider>
  );
}

export default App;
