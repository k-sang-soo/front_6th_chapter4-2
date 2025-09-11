import { Button, ButtonGroup, Flex, Heading, Stack } from '@chakra-ui/react';
import ScheduleTable from './ScheduleTable.tsx';
import { useScheduleContext } from './ScheduleContext.tsx';
import SearchDialog from './SearchDialog.tsx';
import { useCallback, useState } from 'react';
import ScheduleDndProvider from './ScheduleDndProvider.tsx';

interface TimeSlotInfo {
  day?: string;
  time?: number;
}

interface SearchInfo extends TimeSlotInfo {
  tableId: string;
}

export const ScheduleTables = () => {
  const { schedulesMap, setSchedulesMap } = useScheduleContext();
  const [searchInfo, setSearchInfo] = useState<SearchInfo | null>(null);

  const disabledRemoveButton = Object.keys(schedulesMap).length === 1;

  const openSearchDialog = useCallback((tableId: string, timeInfo: TimeSlotInfo) => {
    setSearchInfo({ tableId, ...timeInfo });
  }, []);

  const handleScheduleDelete = useCallback(
    (tableId: string, { day, time }: TimeSlotInfo) => {
      setSchedulesMap((prev) => ({
        ...prev,
        [tableId]: prev[tableId].filter(
          (schedule) => schedule.day !== day || !schedule.range.includes(time!),
        ),
      }));
    },
    [setSchedulesMap],
  );

  const duplicate = useCallback(
    (targetId: string) => {
      setSchedulesMap((prev) => ({
        ...prev,
        [`schedule-${Date.now()}`]: [...prev[targetId]],
      }));
    },
    [setSchedulesMap],
  );

  const remove = useCallback(
    (targetId: string) => {
      setSchedulesMap((prev) => {
        delete prev[targetId];
        return { ...prev };
      });
    },
    [setSchedulesMap],
  );

  const handleSearchDialogClose = useCallback(() => {
    setSearchInfo(null);
  }, []);

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {Object.entries(schedulesMap).map(([tableId, schedules], index) => (
          <Stack key={tableId} width="600px">
            <Flex justifyContent="space-between" alignItems="center">
              <Heading as="h3" fontSize="lg">
                시간표 {index + 1}
              </Heading>
              <ButtonGroup size="sm" isAttached>
                <Button colorScheme="green" onClick={() => setSearchInfo({ tableId })}>
                  시간표 추가
                </Button>
                <Button colorScheme="green" mx="1px" onClick={() => duplicate(tableId)}>
                  복제
                </Button>
                <Button
                  colorScheme="green"
                  isDisabled={disabledRemoveButton}
                  onClick={() => remove(tableId)}
                >
                  삭제
                </Button>
              </ButtonGroup>
            </Flex>
            <ScheduleDndProvider>
              <ScheduleTable
                key={`schedule-table-${tableId}`}
                schedules={schedules}
                tableId={tableId}
                onScheduleTimeClick={(timeInfo) => openSearchDialog(tableId, timeInfo)}
                onDeleteButtonClick={(timeInfo) => handleScheduleDelete(tableId, timeInfo)}
              />
            </ScheduleDndProvider>
          </Stack>
        ))}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={handleSearchDialogClose} />
    </>
  );
};
