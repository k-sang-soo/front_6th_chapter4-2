import { Button, ButtonGroup, Flex, Heading, Stack } from '@chakra-ui/react';
import ScheduleTable from './ScheduleTable.tsx';
import { useScheduleContext } from './ScheduleContext.tsx';
import SearchDialog from './SearchDialog.tsx';
import { memo, useCallback, useState } from 'react';
import ScheduleDndProvider from './ScheduleDndProvider.tsx';
import { Schedule } from './types.ts';

interface TimeSlotInfo {
  day?: string;
  time?: number;
}

interface SearchInfo extends TimeSlotInfo {
  tableId: string;
}

interface ScheduleTableWrapperProps {
  tableId: string;
  schedules: Schedule[];
  index: number;
  disabledRemoveButton: boolean;
  onOpenSearchDialog: (tableId: string, timeInfo: TimeSlotInfo) => void;
  onScheduleDelete: (tableId: string, timeInfo: TimeSlotInfo) => void;
  onDuplicate: (tableId: string) => void;
  onRemove: (tableId: string) => void;
  onSetSearchInfo: (info: SearchInfo) => void;
}

const ScheduleTableWrapper = memo(
  ({
    tableId,
    schedules,
    index,
    disabledRemoveButton,
    onOpenSearchDialog,
    onScheduleDelete,
    onDuplicate,
    onRemove,
    onSetSearchInfo,
  }: ScheduleTableWrapperProps) => {
    const handleScheduleTimeClick = useCallback(
      (timeInfo: TimeSlotInfo) => {
        onOpenSearchDialog(tableId, timeInfo);
      },
      [tableId, onOpenSearchDialog],
    );

    const handleDeleteButtonClick = useCallback(
      (timeInfo: TimeSlotInfo) => {
        onScheduleDelete(tableId, timeInfo);
      },
      [tableId, onScheduleDelete],
    );

    return (
      <Stack width="600px">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h3" fontSize="lg">
            시간표 {index + 1}
          </Heading>
          <ButtonGroup size="sm" isAttached>
            <Button colorScheme="green" onClick={() => onSetSearchInfo({ tableId })}>
              시간표 추가
            </Button>
            <Button colorScheme="green" mx="1px" onClick={() => onDuplicate(tableId)}>
              복제
            </Button>
            <Button
              colorScheme="green"
              isDisabled={disabledRemoveButton}
              onClick={() => onRemove(tableId)}
            >
              삭제
            </Button>
          </ButtonGroup>
        </Flex>
        <ScheduleDndProvider>
          <ScheduleTable
            schedules={schedules}
            tableId={tableId}
            onScheduleTimeClick={handleScheduleTimeClick}
            onDeleteButtonClick={handleDeleteButtonClick}
          />
        </ScheduleDndProvider>
      </Stack>
    );
  },
);

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
        const newMap = { ...prev };
        delete newMap[targetId];
        return newMap;
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
          <ScheduleTableWrapper
            key={tableId}
            tableId={tableId}
            schedules={schedules}
            index={index}
            disabledRemoveButton={disabledRemoveButton}
            onOpenSearchDialog={openSearchDialog}
            onScheduleDelete={handleScheduleDelete}
            onDuplicate={duplicate}
            onRemove={remove}
            onSetSearchInfo={setSearchInfo}
          />
        ))}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={handleSearchDialogClose} />
    </>
  );
};
