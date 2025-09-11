import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import { CellSize, DAY_LABELS, 분 } from './constants.ts';
import { Schedule } from './types.ts';
import { fill2, parseHnM } from './utils.ts';
import { useDndContext, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ComponentProps, Fragment, memo, useCallback, useMemo } from 'react';

interface Props {
  tableId: string;
  schedules: Schedule[];
  onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
  onDeleteButtonClick?: (timeInfo: { day: string; time: number }) => void;
}

const TIMES = [
  ...Array(18)
    .fill(0)
    .map((v, k) => v + k * 30 * 분)
    .map((v) => `${parseHnM(v)}~${parseHnM(v + 30 * 분)}`),

  ...Array(6)
    .fill(18 * 30 * 분)
    .map((v, k) => v + k * 55 * 분)
    .map((v) => `${parseHnM(v)}~${parseHnM(v + 50 * 분)}`),
] as const;

interface ScheduleTableHeaderProps {
  onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
}

const ScheduleTableHeader = memo(({ onScheduleTimeClick }: ScheduleTableHeaderProps) => {
  return (
    <>
      <GridItem key="교시" borderColor="gray.300" bg="gray.100">
        <Flex justifyContent="center" alignItems="center" h="full" w="full">
          <Text fontWeight="bold">교시</Text>
        </Flex>
      </GridItem>
      {DAY_LABELS.map((day) => (
        <GridItem key={day} borderLeft="1px" borderColor="gray.300" bg="gray.100">
          <Flex justifyContent="center" alignItems="center" h="full">
            <Text fontWeight="bold">{day}</Text>
          </Flex>
        </GridItem>
      ))}
      {TIMES.map((time, timeIndex) => (
        <Fragment key={`시간-${timeIndex + 1}`}>
          <GridItem
            borderTop="1px solid"
            borderColor="gray.300"
            bg={timeIndex > 17 ? 'gray.200' : 'gray.100'}
          >
            <Flex justifyContent="center" alignItems="center" h="full">
              <Text fontSize="xs">
                {fill2(timeIndex + 1)} ({time})
              </Text>
            </Flex>
          </GridItem>
          {DAY_LABELS.map((day) => (
            <GridItem
              key={`${day}-${timeIndex + 2}`}
              borderWidth="1px 0 0 1px"
              borderColor="gray.300"
              bg={timeIndex > 17 ? 'gray.100' : 'white'}
              cursor="pointer"
              _hover={{ bg: 'yellow.100' }}
              onClick={() => onScheduleTimeClick?.({ day, time: timeIndex + 1 })}
            />
          ))}
        </Fragment>
      ))}
    </>
  );
});

ScheduleTableHeader.displayName = 'ScheduleTableHeader';

const ScheduleTableInner = ({
  tableId,
  schedules,
  onScheduleTimeClick,
  onDeleteButtonClick,
}: Props) => {
  const colorMap = useMemo(() => {
    const lectures = [...new Set(schedules.map(({ lecture }) => lecture.id))];
    const colors = ['#fdd', '#ffd', '#dff', '#ddf', '#fdf', '#dfd'];
    const map: Record<string, string> = {};
    lectures.forEach((lectureId, index) => {
      map[lectureId] = colors[index % colors.length];
    });
    return map;
  }, [schedules]);

  const dndContext = useDndContext();

  const isActiveTable = useMemo(() => {
    const activeId = dndContext.active?.id;
    if (activeId) {
      const activeTableId = String(activeId).split(':')[0];
      return activeTableId === tableId;
    }
    return false;
  }, [dndContext.active?.id, tableId]);

  const handleDeleteButtonClick = useCallback(
    (schedule: Schedule) => {
      onDeleteButtonClick?.({
        day: schedule.day,
        time: schedule.range[0],
      });
    },
    [onDeleteButtonClick],
  );

  return (
    <Box
      position="relative"
      outline={isActiveTable ? '5px dashed' : undefined}
      outlineColor="blue.300"
    >
      <Grid
        templateColumns={`120px repeat(${DAY_LABELS.length}, ${CellSize.WIDTH}px)`}
        templateRows={`40px repeat(${TIMES.length}, ${CellSize.HEIGHT}px)`}
        bg="white"
        fontSize="sm"
        textAlign="center"
        outline="1px solid"
        outlineColor="gray.300"
      >
        <ScheduleTableHeader onScheduleTimeClick={onScheduleTimeClick} />
      </Grid>

      {schedules.map((schedule, index) => (
        <DraggableSchedule
          key={`${schedule.lecture.id}-${tableId}-${index}`}
          id={`${tableId}:${index}`}
          data={schedule}
          bg={colorMap[schedule.lecture.id]}
          onDeleteButtonClick={() => handleDeleteButtonClick(schedule)}
        />
      ))}
    </Box>
  );
};

const ScheduleTable = memo(ScheduleTableInner, (prevProps, nextProps) => {
  // 실제 props만 비교
  if (prevProps.tableId !== nextProps.tableId) return false;
  if (prevProps.schedules !== nextProps.schedules) return false;
  if (prevProps.onScheduleTimeClick !== nextProps.onScheduleTimeClick) return false;
  if (prevProps.onDeleteButtonClick !== nextProps.onDeleteButtonClick) return false;

  // 모든 props가 같으면 리렌더링 하지 않음
  return true;
});

ScheduleTable.displayName = 'ScheduleTable';

const DraggableSchedule = memo(
  ({
    id,
    data,
    bg,
    onDeleteButtonClick,
  }: { id: string; data: Schedule } & ComponentProps<typeof Box> & {
      onDeleteButtonClick: () => void;
    }) => {
    const { day, range, room, lecture } = data;
    const { attributes, setNodeRef, listeners, transform } = useDraggable({ id });
    const leftIndex = DAY_LABELS.indexOf(day as (typeof DAY_LABELS)[number]);
    const topIndex = range[0] - 1;
    const size = range.length;

    return (
      <Popover>
        <PopoverTrigger>
          <Box
            position="absolute"
            left={`${120 + CellSize.WIDTH * leftIndex + 1}px`}
            top={`${40 + (topIndex * CellSize.HEIGHT + 1)}px`}
            width={CellSize.WIDTH - 1 + 'px'}
            height={CellSize.HEIGHT * size - 1 + 'px'}
            bg={bg}
            p={1}
            boxSizing="border-box"
            cursor="pointer"
            ref={setNodeRef}
            transform={CSS.Translate.toString(transform)}
            {...listeners}
            {...attributes}
          >
            <Text fontSize="sm" fontWeight="bold">
              {lecture.title}
            </Text>
            <Text fontSize="xs">{room}</Text>
          </Box>
        </PopoverTrigger>
        <PopoverContent onClick={(event) => event.stopPropagation()}>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>
            <Text>강의를 삭제하시겠습니까?</Text>
            <Button colorScheme="red" size="xs" onClick={onDeleteButtonClick}>
              삭제
            </Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  },
  (prevProps, nextProps) => {
    // id가 다르면 다른 컴포넌트
    if (prevProps.id !== nextProps.id) return false;

    // data가 다르면 리렌더링 필요
    if (prevProps.data !== nextProps.data) return false;

    // bg가 다르면 리렌더링 필요
    if (prevProps.bg !== nextProps.bg) return false;

    // onDeleteButtonClick는 함수 참조 비교하지 않음 (매번 새로 생성되므로)
    // 실제로는 같은 동작을 하므로 무시

    return true;
  },
);

DraggableSchedule.displayName = 'DraggableSchedule';

export default ScheduleTable;
