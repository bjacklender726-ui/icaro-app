import React, { useState, useMemo } from 'react';
import { Box, Grid, Text, Flex, VStack, HStack, Badge, Button, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, Input, Select, Textarea, Switch, useColorModeValue, Tabs, TabList, TabPanels, Tab, TabPanel, Tooltip } from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiEdit3, FiCheck, FiClock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import useStore from '../../store/useStore';
import { CATEGORIES, formatDate } from '../../utils/helpers';
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

const HOUR_HEIGHT = 50;

export default function Agenda() {
  const store = useStore();
  const { agendaTasks, addAgendaTask, updateAgendaTask, deleteAgendaTask, studySessions, gymSessions, jobOffers, projectLogs } = store;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day');
  const [filterModule, setFilterModule] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const rowBg = useColorModeValue('gray.50', 'gray.700');
  const rowHoverBg = useColorModeValue('gray.100', 'gray.600');
  const hasDataBg = useColorModeValue('green.50', 'green.900');
  const todayBg = useColorModeValue('blue.50', 'blue.900');
  const todayHoverBg = useColorModeValue('blue.100', 'blue.800');
  const cellHoverBg = useColorModeValue('gray.100', 'gray.700');

  const [form, setForm] = useState({
    title: '', description: '', hour: '08:00', hourEnd: '09:00',
    category: 'personal', customCategory: '',
    date: format(new Date(), 'yyyy-MM-dd'), completed: false,
    reminder: false, reminderMinutes: 15,
    repeatType: 'none', repeatDays: [],
  });

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const dayTasks = useMemo(() => {
    return agendaTasks.filter((t) => {
      if (t.date !== dateStr) return false;
      if (filterModule !== 'all' && t.category !== filterModule) return false;
      return true;
    }).sort((a, b) => (a.hour || '').localeCompare(b.hour || ''));
  }, [agendaTasks, dateStr, filterModule]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  const monthWeeks = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const allDays = eachDayOfInterval({ start: calStart, end: calEnd });
    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }
    return weeks;
  }, [selectedDate]);

  const getDaySummary = (date) => {
    const d = format(date, 'yyyy-MM-dd');
    const study = studySessions.filter((s) => s.date === d);
    const gym = gymSessions.filter((s) => s.date === d);
    const offers = jobOffers.filter((o) => o.date === d);
    const projects = projectLogs.filter((l) => l.date === d);
    const tasks = agendaTasks.filter((t) => t.date === d);
    return {
      studyMin: study.reduce((a, s) => a + (s.duration || 0), 0),
      gymCount: gym.length,
      gymMin: gym.reduce((a, s) => a + (s.duration || 0), 0),
      offerCount: offers.length,
      projectHours: projects.reduce((a, l) => a + (l.hours || 0), 0),
      taskCount: tasks.length,
      taskCompleted: tasks.filter((t) => t.completed).length,
    };
  };

  const moduleAdvances = useMemo(() => {
    const advances = [];
    studySessions.filter((s) => s.date === dateStr).forEach((s) => {
      advances.push({ type: 'oposiciones', title: `Estudio: ${s.topicName || s.temarioName || 'Sesión'}`, duration: s.duration, icon: '📚' });
    });
    gymSessions.filter((s) => s.date === dateStr).forEach((s) => {
      advances.push({ type: 'gym', title: `Gym: ${s.routineName || 'Sesión'}`, duration: s.duration, icon: '🏋️' });
    });
    jobOffers.filter((o) => o.date === dateStr).forEach((o) => {
      advances.push({ type: 'trabajo', title: `Oferta: ${o.company}`, duration: 0, icon: '💼' });
    });
    projectLogs.filter((l) => l.date === dateStr).forEach((l) => {
      const proj = store.projects.find((p) => p.id === l.projectId);
      advances.push({ type: 'proyectos', title: `Proyecto: ${proj?.name || 'Proyecto'}`, duration: l.hours * 60, icon: '💻' });
    });
    return advances;
  }, [studySessions, gymSessions, jobOffers, projectLogs, dateStr, store.projects]);

  const openNewFromAdvance = (type) => {
    const categoryMap = { oposiciones: 'estudio', gym: 'gym', trabajo: 'trabajo', proyectos: 'portfolio' };
    setEditingTask(null);
    setForm({
      title: '', description: '', hour: '08:00', hourEnd: '09:00',
      category: categoryMap[type] || 'personal', customCategory: '',
      date: dateStr, completed: false,
      reminder: false, reminderMinutes: 15,
      repeatType: 'none', repeatDays: [],
    });
    onOpen();
  };

  const openNew = (hour) => {
    setEditingTask(null);
    const h = hour || '08:00';
    const hNum = parseInt(h.split(':')[0]);
    setForm({
      title: '', description: '', hour: h, hourEnd: `${Math.min(hNum + 1, 23).toString().padStart(2, '0')}:00`,
      category: 'personal', customCategory: '',
      date: dateStr, completed: false,
      reminder: false, reminderMinutes: 15,
      repeatType: 'none', repeatDays: [],
    });
    onOpen();
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({ ...task, customCategory: task.customCategory || '' });
    onOpen();
  };

  const saveTask = () => {
    const taskData = { ...form };
    if (form.repeatType !== 'none' && form.repeatDays.length > 0) {
      form.repeatDays.forEach((dayNum) => {
        const baseDate = new Date(form.date);
        const dayDiff = (dayNum - baseDate.getDay() + 7) % 7;
        const taskDate = format(addDays(baseDate, dayDiff), 'yyyy-MM-dd');
        addAgendaTask({ ...taskData, date: taskDate });
      });
      onClose();
      return;
    }
    if (editingTask) updateAgendaTask(editingTask.id, taskData);
    else addAgendaTask(taskData);
    onClose();
  };

  const getTaskPosition = (hour) => {
    const [h, m] = (hour || '08:00').split(':').map(Number);
    return h * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT;
  };

  const getTaskHeight = (hour, hourEnd) => {
    const [h1, m1] = (hour || '08:00').split(':').map(Number);
    const [h2, m2] = (hourEnd || '09:00').split(':').map(Number);
    return Math.max(((h2 * 60 + m2) - (h1 * 60 + m1)) / 60 * HOUR_HEIGHT, 25);
  };

  const HOURS = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
        <HStack spacing={2}>
          <IconButton icon={<FiChevronLeft />} size="sm" onClick={() => {
            if (viewMode === 'day') setSelectedDate((d) => subDays(d, 1));
            else if (viewMode === 'week') setSelectedDate((d) => subMonths(d, 1));
            else setSelectedDate((d) => subMonths(d, 1));
          }} />
          <Box textAlign="center" minW="200px">
            <Text fontWeight="bold" fontSize="lg" textTransform="capitalize">
              {viewMode === 'day' && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
              {viewMode === 'week' && format(selectedDate, "MMMM yyyy", { locale: es })}
              {viewMode === 'month' && format(selectedDate, "MMMM yyyy", { locale: es })}
            </Text>
            {isToday(selectedDate) && viewMode === 'day' && <Badge colorScheme="green" fontSize="xs">Hoy</Badge>}
          </Box>
          <IconButton icon={<FiChevronRight />} size="sm" onClick={() => {
            if (viewMode === 'day') setSelectedDate((d) => addDays(d, 1));
            else if (viewMode === 'week') setSelectedDate((d) => addMonths(d, 1));
            else setSelectedDate((d) => addMonths(d, 1));
          }} />
        </HStack>

        <HStack spacing={2}>
          <Select size="sm" w="120px" value={filterModule} onChange={(e) => setFilterModule(e.target.value)}>
            <option value="all">Todos</option>
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
          <Button leftIcon={<FiPlus />} size="sm" onClick={() => openNew()}>Nueva Tarea</Button>
        </HStack>
      </Flex>

      <Tabs size="sm" variant="enclosed" colorScheme="green" mb={4}>
        <TabList>
          <Tab onClick={() => setViewMode('day')}>Día</Tab>
          <Tab onClick={() => setViewMode('week')}>Semana</Tab>
          <Tab onClick={() => setViewMode('month')}>Mes</Tab>
        </TabList>
      </Tabs>

      {viewMode === 'day' && (
        <Box bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} overflow="hidden" maxH="calc(100vh - 220px)">
          <Flex h="100%">
            <Box flex={1} overflowY="auto" display="flex">
              <Box borderRight="1px solid" borderColor={borderColor} flexShrink={0}>
                {HOURS.map((h) => (
                  <Box key={h} h={`${HOUR_HEIGHT}px`} px={2} py={1} borderBottom="1px solid" borderColor={borderColor}>
                    <Text fontSize="xs" color="gray.500" fontWeight="500">{`${h.toString().padStart(2, '0')}:00`}</Text>
                  </Box>
                ))}
              </Box>

              <Box position="relative" flex={1}>
                {HOURS.map((h) => (
                  <Box key={h} h={`${HOUR_HEIGHT}px`} borderBottom="1px solid" borderColor={borderColor} _hover={{ bg: hoverBg }} cursor="pointer"
                    onClick={() => openNew(`${h.toString().padStart(2, '0')}:00`)} />
                ))}
                {dayTasks.map((task) => {
                  const pos = getTaskPosition(task.hour);
                  const height = getTaskHeight(task.hour, task.hourEnd);
                  const cat = CATEGORIES[task.category] || CATEGORIES.otro;
                  return (
                    <Tooltip key={task.id} label={`${task.title} - ${task.description || ''}`} hasArrow>
                      <Box position="absolute" top={`${pos}px`} left="4px" right="4px" height={`${height}px`}
                        bg={`${cat.color}20`} borderLeft={`3px solid ${cat.color}`} borderRadius="md"
                        px={2} py={1} cursor="pointer" overflow="hidden"
                        _hover={{ bg: `${cat.color}30`, boxShadow: 'md' }}
                        onClick={() => openEdit(task)} transition="all 0.2s">
                        <Flex justify="space-between" align="start">
                          <Box flex={1}>
                            <Text fontSize="xs" fontWeight="bold" noOfLines={1}
                              textDecoration={task.completed ? 'line-through' : 'none'}>
                              {task.title} {task.category === 'otro' && task.customCategory ? `(${task.customCategory})` : ''}
                            </Text>
                            <Text fontSize="xs" color="gray.500">{task.hour}-{task.hourEnd || ''}</Text>
                          </Box>
                          <HStack spacing={1}>
                            {task.completed && <FiCheck size={10} color="green" />}
                            <IconButton icon={<FiTrash2 />} size="xs" variant="ghost" colorScheme="red"
                              onClick={(e) => { e.stopPropagation(); deleteAgendaTask(task.id); }} />
                          </HStack>
                        </Flex>
                      </Box>
                    </Tooltip>
                  );
                })}
                {isToday(selectedDate) && (() => {
                  const now = new Date();
                  const h = now.getHours();
                  const m = now.getMinutes();
                  const top = h * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT;
                  return (
                    <Box position="absolute" top={`${top}px`} left={0} right={0} h="2px" bg="red.500" zIndex={10}>
                      <Box position="absolute" left="-5px" top="-4px" w="10px" h="10px" bg="red.500" borderRadius="full" />
                    </Box>
                  );
                })()}
              </Box>
            </Box>

            <Box borderLeft="1px solid" borderColor={borderColor} p={3} overflowY="auto" w="240px" flexShrink={0}>
              <Text fontWeight="bold" fontSize="sm" mb={3}>Avances del Día</Text>
              {moduleAdvances.length === 0 && <Text color="gray.500" fontSize="xs">Sin avances hoy</Text>}
              <VStack align="stretch" spacing={2}>
                {moduleAdvances.map((a, i) => (
                  <Flex key={i} p={2} bg={hoverBg} borderRadius="md" cursor="pointer"
                    _hover={{ bg: rowHoverBg }}
                    onClick={() => openNewFromAdvance(a.type)}>
                    <Text fontSize="sm" mr={2}>{a.icon}</Text>
                    <Box flex={1}>
                      <Text fontSize="xs" fontWeight="bold">{a.title}</Text>
                      {a.duration > 0 && <Text fontSize="xs" color="gray.500">{a.duration} min</Text>}
                    </Box>
                    <Badge size="xs" colorScheme={a.type === 'oposiciones' ? 'blue' : a.type === 'gym' ? 'red' : a.type === 'trabajo' ? 'orange' : 'purple'}>
                      + Tarea
                    </Badge>
                  </Flex>
                ))}
              </VStack>

              <Text fontWeight="bold" fontSize="sm" mt={4} mb={2}>Tareas ({dayTasks.length})</Text>
              <VStack align="stretch" spacing={1}>
                {dayTasks.map((t) => (
                  <Flex key={t.id} p={1.5} bg={hoverBg} borderRadius="md"
                    justify="space-between" align="center" cursor="pointer" onClick={() => openEdit(t)}>
                    <Text fontSize="xs" textDecoration={t.completed ? 'line-through' : 'none'} opacity={t.completed ? 0.5 : 1} noOfLines={1}>{t.title}</Text>
                    <Badge size="xs" colorScheme={t.completed ? 'green' : 'blue'}>{t.hour}</Badge>
                  </Flex>
                ))}
              </VStack>
            </Box>
          </Flex>
        </Box>
      )}

      {viewMode === 'week' && (
        <Box bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} p={3}>
          <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={2}>
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
              <Text key={d} textAlign="center" fontSize="xs" fontWeight="bold" color="gray.500" py={1}>{d}</Text>
            ))}
          </Grid>
          <VStack spacing={1} align="stretch">
            {monthWeeks.map((week, wi) => {
              const currentWeek = week.some(d => isToday(d));
              return (
                <Grid key={wi} templateColumns="repeat(7, 1fr)" gap={1}
                  bg={currentWeek ? todayBg : 'transparent'}
                  borderRadius="md" p={currentWeek ? 1 : 0}>
                  {week.map((d) => {
                    const inMonth = d.getMonth() === selectedDate.getMonth();
                    const tasks = agendaTasks.filter((t) => t.date === format(d, 'yyyy-MM-dd'));
                    const summary = getDaySummary(d);
                    const today = isToday(d);
                    return (
                      <Box key={d.toISOString()} minH="100px" p={1.5}
                        bg={today ? todayBg : 'transparent'}
                        borderRadius="lg" cursor="pointer"
                        border={today ? '2px solid' : '1px solid'}
                        borderColor={today ? 'blue.400' : borderColor}
                        opacity={inMonth ? 1 : 0.35}
                        _hover={{ bg: today ? todayHoverBg : cellHoverBg }}
                        onClick={() => { setSelectedDate(d); setViewMode('day'); }}>
                        <Text fontSize="xs" fontWeight={today ? 'bold' : 'normal'}
                          textTransform="capitalize" mb={1}
                          color={today ? 'blue.500' : 'inherit'}>
                          {format(d, 'EEE d', { locale: es })}
                        </Text>
                        {tasks.slice(0, 3).map((t) => {
                          const cat = CATEGORIES[t.category] || CATEGORIES.otro;
                          return (
                            <Box key={t.id} p={1} mb={1} bg={`${cat.color}15`} borderLeft={`2px solid ${cat.color}`} borderRadius="sm">
                              <Text fontSize="xs" noOfLines={1} fontWeight="500">{t.title}</Text>
                              <Text fontSize="xs" color="gray.500">{t.hour}</Text>
                            </Box>
                          );
                        })}
                        {tasks.length > 3 && <Text fontSize="xs" color="gray.500">+{tasks.length - 3} más</Text>}
                        <VStack align="stretch" spacing={0} mt={1}>
                          {summary.studyMin > 0 && <Text fontSize="xs" color="blue.500">📚 {summary.studyMin}min</Text>}
                          {summary.gymCount > 0 && <Text fontSize="xs" color="red.500">🏋️ {summary.gymCount} sesiones</Text>}
                          {summary.offerCount > 0 && <Text fontSize="xs" color="orange.500">💼 {summary.offerCount} ofertas</Text>}
                          {summary.projectHours > 0 && <Text fontSize="xs" color="purple.500">💻 {summary.projectHours.toFixed(1)}h</Text>}
                          {summary.taskCount > 0 && <Text fontSize="xs" color="green.500">✅ {summary.taskCompleted}/{summary.taskCount}</Text>}
                        </VStack>
                      </Box>
                    );
                  })}
                </Grid>
              );
            })}
          </VStack>
        </Box>
      )}

      {viewMode === 'month' && (
        <Box bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} p={3}>
          <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={2}>
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
              <Text key={d} textAlign="center" fontSize="xs" fontWeight="bold" color="gray.500" py={1}>{d}</Text>
            ))}
          </Grid>
          <VStack spacing={1} align="stretch">
            {monthWeeks.map((week, wi) => {
              const currentWeek = week.some(d => isToday(d));
              return (
                <Grid key={wi} templateColumns="repeat(7, 1fr)" gap={1}
                  bg={currentWeek ? todayBg : 'transparent'}
                  borderRadius="md" p={currentWeek ? 1 : 0}>
                  {week.map((d) => {
                    const inMonth = d.getMonth() === selectedDate.getMonth();
                    const summary = getDaySummary(d);
                    const today = isToday(d);
                    const hasData = summary.studyMin > 0 || summary.gymCount > 0 || summary.offerCount > 0 || summary.projectHours > 0;
                    return (
                      <Box key={d.toISOString()} p={1.5}
                        bg={today ? todayBg : hasData ? hasDataBg : 'transparent'}
                        borderRadius="lg" cursor="pointer"
                        border={today ? '2px solid' : '1px solid'}
                        borderColor={today ? 'blue.400' : 'transparent'}
                        opacity={inMonth ? 1 : 0.35}
                        _hover={{ bg: cellHoverBg }}
                        onClick={() => { setSelectedDate(d); setViewMode('day'); }}
                        minH="60px">
                        <Text fontSize="xs" fontWeight={today ? 'bold' : 'normal'} color={today ? 'blue.500' : 'inherit'}>
                          {format(d, 'd')}
                        </Text>
                        {summary.studyMin > 0 && <Text fontSize="xs" color="blue.500">📚</Text>}
                        {summary.gymCount > 0 && <Text fontSize="xs" color="red.500">🏋️</Text>}
                        {summary.offerCount > 0 && <Text fontSize="xs" color="orange.500">💼</Text>}
                        {summary.projectHours > 0 && <Text fontSize="xs" color="purple.500">💻</Text>}
                        {summary.taskCount > 0 && <Badge colorScheme="green" fontSize="xs" mt={1}>{summary.taskCompleted}/{summary.taskCount}</Badge>}
                      </Box>
                    );
                  })}
                </Grid>
              );
            })}
          </VStack>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Título</FormLabel>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título de la tarea" />
              </FormControl>
              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción (opcional)" size="sm" />
              </FormControl>
              <HStack w="100%">
                <FormControl><FormLabel>Hora inicio</FormLabel><Input type="time" value={form.hour} onChange={(e) => setForm((f) => ({ ...f, hour: e.target.value }))} /></FormControl>
                <FormControl><FormLabel>Hora fin</FormLabel><Input type="time" value={form.hourEnd} onChange={(e) => setForm((f) => ({ ...f, hourEnd: e.target.value }))} /></FormControl>
              </HStack>
              <HStack w="100%">
                <FormControl><FormLabel>Categoría</FormLabel><Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </Select></FormControl>
                <FormControl><FormLabel>Fecha</FormLabel><Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></FormControl>
              </HStack>
              {form.category === 'otro' && (
                <FormControl><FormLabel>Especificar</FormLabel><Input value={form.customCategory} onChange={(e) => setForm((f) => ({ ...f, customCategory: e.target.value }))} placeholder="Escribe la categoría..." /></FormControl>
              )}
              <FormControl>
                <FormLabel>Repetir</FormLabel>
                <Select value={form.repeatType} onChange={(e) => setForm((f) => ({ ...f, repeatType: e.target.value }))}>
                  <option value="none">No repetir</option>
                  <option value="custom">Días personalizados</option>
                </Select>
              </FormControl>
              {form.repeatType === 'custom' && (
                <FormControl>
                  <FormLabel>Días</FormLabel>
                  <HStack wrap="wrap">
                    {[{ n: 1, l: 'L' }, { n: 2, l: 'M' }, { n: 3, l: 'X' }, { n: 4, l: 'J' }, { n: 5, l: 'V' }, { n: 6, l: 'S' }, { n: 0, l: 'D' }].map((d) => (
                      <Button key={d.n} size="xs" variant={form.repeatDays.includes(d.n) ? 'solid' : 'outline'}
                        colorScheme={form.repeatDays.includes(d.n) ? 'green' : 'gray'}
                        onClick={() => setForm((f) => ({
                          ...f, repeatDays: f.repeatDays.includes(d.n) ? f.repeatDays.filter((x) => x !== d.n) : [...f.repeatDays, d.n]
                        }))}>{d.l}</Button>
                    ))}
                  </HStack>
                </FormControl>
              )}
              <HStack w="100%" justify="space-between">
                <FormControl display="flex" alignItems="center"><FormLabel mb={0}>Recordatorio</FormLabel><Switch isChecked={form.reminder} onChange={(e) => setForm((f) => ({ ...f, reminder: e.target.checked }))} /></FormControl>
                <FormControl display="flex" alignItems="center"><FormLabel mb={0}>Completada</FormLabel><Switch isChecked={form.completed} onChange={(e) => setForm((f) => ({ ...f, completed: e.target.checked }))} colorScheme="green" /></FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button onClick={saveTask} isDisabled={!form.title}>{editingTask ? 'Guardar' : 'Crear'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
