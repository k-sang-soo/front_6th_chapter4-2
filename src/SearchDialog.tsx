import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Table,
  Tag,
  TagCloseButton,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Wrap,
} from '@chakra-ui/react';
import { useScheduleContext } from './ScheduleContext.tsx';
import { Lecture } from './types.ts';
import { parseSchedule } from './utils.ts';
import axios, { AxiosResponse } from 'axios';
import { DAY_LABELS } from './constants.ts';

interface Props {
  searchInfo: {
    tableId: string;
    day?: string;
    time?: number;
  } | null;
  onClose: () => void;
}

const TIME_SLOTS = [
  { id: 1, label: '09:00~09:30' },
  { id: 2, label: '09:30~10:00' },
  { id: 3, label: '10:00~10:30' },
  { id: 4, label: '10:30~11:00' },
  { id: 5, label: '11:00~11:30' },
  { id: 6, label: '11:30~12:00' },
  { id: 7, label: '12:00~12:30' },
  { id: 8, label: '12:30~13:00' },
  { id: 9, label: '13:00~13:30' },
  { id: 10, label: '13:30~14:00' },
  { id: 11, label: '14:00~14:30' },
  { id: 12, label: '14:30~15:00' },
  { id: 13, label: '15:00~15:30' },
  { id: 14, label: '15:30~16:00' },
  { id: 15, label: '16:00~16:30' },
  { id: 16, label: '16:30~17:00' },
  { id: 17, label: '17:00~17:30' },
  { id: 18, label: '17:30~18:00' },
  { id: 19, label: '18:00~18:50' },
  { id: 20, label: '18:55~19:45' },
  { id: 21, label: '19:50~20:40' },
  { id: 22, label: '20:45~21:35' },
  { id: 23, label: '21:40~22:30' },
  { id: 24, label: '22:35~23:25' },
];

const PAGE_SIZE = 100;

const fetchMajors = () => axios.get<Lecture[]>('./schedules-majors.json');
const fetchLiberalArts = () => axios.get<Lecture[]>('./schedules-liberal-arts.json');

const fetchAllLectures = (() => {
  let majorsCache: null | Promise<AxiosResponse<Lecture[]>> = null;
  let liberalArtsCache: null | Promise<AxiosResponse<Lecture[]>> = null;

  return async () => {
    if (!majorsCache) {
      majorsCache = fetchMajors();
    }

    if (!liberalArtsCache) {
      liberalArtsCache = fetchLiberalArts();
    }

    return await Promise.all([
      (console.log('API Call 1', performance.now()), majorsCache),
      (console.log('API Call 2', performance.now()), liberalArtsCache),
      (console.log('API Call 3', performance.now()), majorsCache),
      (console.log('API Call 4', performance.now()), liberalArtsCache),
      (console.log('API Call 5', performance.now()), majorsCache),
      (console.log('API Call 6', performance.now()), liberalArtsCache),
    ]);
  };
})();

const LectureRow = memo(
  ({ addSchedule, ...lecture }: Lecture & { addSchedule: (lecture: Lecture) => void }) => {
    const { id, grade, title, credits, major, schedule } = lecture;
    return (
      <Tr>
        <Td width="100px">{id}</Td>
        <Td width="50px">{grade}</Td>
        <Td width="200px">{title}</Td>
        <Td width="50px">{credits}</Td>
        <Td width="150px" dangerouslySetInnerHTML={{ __html: major }} />
        <Td width="150px" dangerouslySetInnerHTML={{ __html: schedule }} />
        <Td width="80px">
          <Button size="sm" colorScheme="green" onClick={() => addSchedule(lecture)}>
            추가
          </Button>
        </Td>
      </Tr>
    );
  },
);

LectureRow.displayName = 'LectureRow';

const QueryInput = memo(
  ({ value, onChange }: { value?: string; onChange: (value: string) => void }) => {
    return (
      <FormControl>
        <FormLabel>검색어</FormLabel>
        <Input
          placeholder="과목명 또는 과목코드"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </FormControl>
    );
  },
);
QueryInput.displayName = 'QueryInput';

const CreditsSelect = memo(
  ({ value, onChange }: { value?: number | string; onChange: (value: string) => void }) => {
    return (
      <FormControl>
        <FormLabel>학점</FormLabel>
        <Select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">전체</option>
          <option value="1">1학점</option>
          <option value="2">2학점</option>
          <option value="3">3학점</option>
        </Select>
      </FormControl>
    );
  },
);
CreditsSelect.displayName = 'CreditsSelect';

const GradeFilter = memo(
  ({ value, onChange }: { value: number[]; onChange: (value: number[]) => void }) => {
    return (
      <FormControl>
        <FormLabel>학년</FormLabel>
        <CheckboxGroup value={value} onChange={(value) => onChange(value.map(Number))}>
          <HStack spacing={4}>
            {[1, 2, 3, 4].map((grade) => (
              <Checkbox key={grade} value={grade}>
                {grade}학년
              </Checkbox>
            ))}
          </HStack>
        </CheckboxGroup>
      </FormControl>
    );
  },
);
GradeFilter.displayName = 'GradeFilter';

const DayFilter = memo(
  ({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) => {
    return (
      <FormControl>
        <FormLabel>요일</FormLabel>
        <CheckboxGroup value={value} onChange={(value) => onChange(value as string[])}>
          <HStack spacing={4}>
            {DAY_LABELS.map((day) => (
              <Checkbox key={day} value={day}>
                {day}
              </Checkbox>
            ))}
          </HStack>
        </CheckboxGroup>
      </FormControl>
    );
  },
);
DayFilter.displayName = 'DayFilter';

const TimeFilter = memo(
  ({
    value,
    onChange,
    onRemove,
  }: {
    value: number[];
    onChange: (value: number[]) => void;
    onRemove: (time: number) => void;
  }) => {
    return (
      <FormControl>
        <FormLabel>시간</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={value}
          onChange={(values) => onChange(values.map(Number))}
        >
          <Wrap spacing={1} mb={2}>
            {value
              .sort((a, b) => a - b)
              .map((time) => (
                <Tag key={time} size="sm" variant="outline" colorScheme="blue">
                  <TagLabel>{time}교시</TagLabel>
                  <TagCloseButton onClick={() => onRemove(time)} />
                </Tag>
              ))}
          </Wrap>
          <Stack
            spacing={2}
            overflowY="auto"
            h="100px"
            border="1px solid"
            borderColor="gray.200"
            borderRadius={5}
            p={2}
          >
            {TIME_SLOTS.map(({ id, label }) => (
              <Box key={id}>
                <Checkbox key={id} size="sm" value={id}>
                  {id}교시({label})
                </Checkbox>
              </Box>
            ))}
          </Stack>
        </CheckboxGroup>
      </FormControl>
    );
  },
);
TimeFilter.displayName = 'TimeFilter';

const MajorFilter = memo(
  ({
    value,
    onChange,
    onRemove,
    allMajors,
  }: {
    value: string[];
    onChange: (value: string[]) => void;
    onRemove: (major: string) => void;
    allMajors: string[];
  }) => {
    return (
      <FormControl>
        <FormLabel>전공</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={value}
          onChange={(values) => onChange(values as string[])}
        >
          <Wrap spacing={1} mb={2}>
            {value.map((major) => (
              <Tag key={major} size="sm" variant="outline" colorScheme="blue">
                <TagLabel>{major.split('<p>').pop()}</TagLabel>
                <TagCloseButton onClick={() => onRemove(major)} />
              </Tag>
            ))}
          </Wrap>
          <Stack
            spacing={2}
            overflowY="auto"
            h="100px"
            border="1px solid"
            borderColor="gray.200"
            borderRadius={5}
            p={2}
          >
            {allMajors.map((major) => (
              <Box key={major}>
                <Checkbox key={major} size="sm" value={major}>
                  {major.replace(/<p>/gi, ' ')}
                </Checkbox>
              </Box>
            ))}
          </Stack>
        </CheckboxGroup>
      </FormControl>
    );
  },
);
MajorFilter.displayName = 'MajorFilter';

const TableHeader = memo(() => {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th width="100px">과목코드</Th>
          <Th width="50px">학년</Th>
          <Th width="200px">과목명</Th>
          <Th width="50px">학점</Th>
          <Th width="150px">전공</Th>
          <Th width="150px">시간</Th>
          <Th width="80px"></Th>
        </Tr>
      </Thead>
    </Table>
  );
});
TableHeader.displayName = 'TableHeader';

const SearchDialog = memo(({ searchInfo, onClose }: Props) => {
  const { setSchedulesMap } = useScheduleContext();

  const loaderWrapperRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [page, setPage] = useState(1);

  // 개별 상태로 분리하여 독립적인 리렌더링 구현
  const [query, setQuery] = useState('');
  const [credits, setCredits] = useState<number | undefined>();
  const [grades, setGrades] = useState<number[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [times, setTimes] = useState<number[]>([]);
  const [majors, setMajors] = useState<string[]>([]);

  const filteredLectures = useMemo(() => {
    return lectures
      .filter(
        (lecture) =>
          lecture.title.toLowerCase().includes(query.toLowerCase()) ||
          lecture.id.toLowerCase().includes(query.toLowerCase()),
      )
      .filter((lecture) => grades.length === 0 || grades.includes(lecture.grade))
      .filter((lecture) => majors.length === 0 || majors.includes(lecture.major))
      .filter((lecture) => !credits || lecture.credits.startsWith(String(credits)))
      .filter((lecture) => {
        if (days.length === 0) {
          return true;
        }
        const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];
        return schedules.some((s) => days.includes(s.day));
      })
      .filter((lecture) => {
        if (times.length === 0) {
          return true;
        }
        const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];
        return schedules.some((s) => s.range.some((time) => times.includes(time)));
      });
  }, [lectures, query, credits, grades, days, times, majors]);

  const lastPage = useMemo(
    () => Math.ceil(filteredLectures.length / PAGE_SIZE),
    [filteredLectures],
  );
  const visibleLectures = useMemo(
    () => filteredLectures.slice(0, page * PAGE_SIZE),
    [filteredLectures, page],
  );
  const allMajors = useMemo(
    () => [...new Set(lectures.map((lecture) => lecture.major))],
    [lectures],
  );

  const handleQueryChange = useCallback((query: string) => {
    setQuery(query);
    setPage(1);
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, []);

  const handleCreditsChange = useCallback((value: string) => {
    setCredits(value ? parseInt(value) : undefined);
    setPage(1);
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, []);

  const handleGradeChange = useCallback((grades: number[]) => {
    setGrades(grades);
    setPage(1);
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, []);

  const handleDayChange = useCallback((days: string[]) => {
    setDays(days);
    setPage(1);
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, []);

  const handleTimeChange = useCallback((times: number[]) => {
    setTimes(times);
    setPage(1);
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, []);

  const handleMajorChange = useCallback((majors: string[]) => {
    setMajors(majors);
    setPage(1);
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, []);

  const removeTimeOption = useCallback((timeToRemove: number) => {
    setPage(1);
    setTimes((prev) => prev.filter((v) => v !== timeToRemove));
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, []);

  const removeMajorOption = useCallback((majorToRemove: string) => {
    setPage(1);
    setMajors((prev) => prev.filter((v) => v !== majorToRemove));
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, []);

  const addSchedule = useCallback(
    (lecture: Lecture) => {
      if (!searchInfo) return;

      const { tableId } = searchInfo;

      const schedules = parseSchedule(lecture.schedule).map((schedule) => ({
        ...schedule,
        lecture,
      }));

      setSchedulesMap((prev) => ({
        ...prev,
        [tableId]: [...prev[tableId], ...schedules],
      }));

      onClose();
    },
    [onClose, searchInfo, setSchedulesMap],
  );

  useEffect(() => {
    const start = performance.now();
    console.log('API 호출 시작: ', start);
    fetchAllLectures().then((results) => {
      const end = performance.now();
      console.log('모든 API 호출 완료 ', end);
      console.log('API 호출에 걸린 시간(ms): ', end - start);
      setLectures(results.flatMap((result) => result.data));
    });
  }, []);

  useEffect(() => {
    const $loader = loaderRef.current;
    const $loaderWrapper = loaderWrapperRef.current;

    if (!$loader || !$loaderWrapper) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => Math.min(lastPage, prevPage + 1));
        }
      },
      { threshold: 0, root: $loaderWrapper },
    );

    observer.observe($loader);

    return () => observer.unobserve($loader);
  }, [lastPage]);

  useEffect(() => {
    setDays(searchInfo?.day ? [searchInfo.day] : []);
    setTimes(searchInfo?.time ? [searchInfo.time] : []);
    setPage(1);
  }, [searchInfo]);

  return (
    <Modal isOpen={Boolean(searchInfo)} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="90vw" w="1000px">
        <ModalHeader>수업 검색</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <HStack spacing={4}>
              <QueryInput value={query} onChange={handleQueryChange} />
              <CreditsSelect value={credits} onChange={handleCreditsChange} />
            </HStack>

            <HStack spacing={4}>
              <GradeFilter value={grades} onChange={handleGradeChange} />
              <DayFilter value={days} onChange={handleDayChange} />
            </HStack>

            <HStack spacing={4}>
              <TimeFilter value={times} onChange={handleTimeChange} onRemove={removeTimeOption} />
              <MajorFilter
                value={majors}
                onChange={handleMajorChange}
                onRemove={removeMajorOption}
                allMajors={allMajors}
              />
            </HStack>
            <Text align="right">검색결과: {filteredLectures.length}개</Text>
            <Box>
              <TableHeader />

              <Box overflowY="auto" maxH="500px" ref={loaderWrapperRef}>
                <Table size="sm" variant="striped">
                  <Tbody>
                    {visibleLectures.map((lecture, index) => (
                      <LectureRow
                        key={`${lecture.id}-${index}`}
                        {...lecture}
                        addSchedule={addSchedule}
                      />
                    ))}
                  </Tbody>
                </Table>
                <Box ref={loaderRef} h="20px" />
              </Box>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

SearchDialog.displayName = 'SearchDialog';

export default SearchDialog;
