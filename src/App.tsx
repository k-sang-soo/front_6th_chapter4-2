import { ChakraProvider } from '@chakra-ui/react';
import { ScheduleProvider } from './ScheduleContext.tsx';
import { ActiveTableProvider } from './ActiveTableContext.tsx';
import { ScheduleTables } from './ScheduleTables.tsx';

function App() {
  return (
    <ChakraProvider>
      <ScheduleProvider>
        <ActiveTableProvider>
          <ScheduleTables />
        </ActiveTableProvider>
      </ScheduleProvider>
    </ChakraProvider>
  );
}

export default App;
