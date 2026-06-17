import React, { useState, useMemo } from 'react';
import { Box, Grid, Text, Flex, VStack, HStack, Badge, Button, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, Input, Textarea, Select, Progress, Stat, StatLabel, StatNumber, SimpleGrid, useColorModeValue, Tabs, TabList, TabPanels, Tab, TabPanel, Wrap, WrapItem, Tag, Collapse } from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiEdit3, FiGrid, FiClock, FiChevronDown, FiChevronRight, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useStore from '../../store/useStore';
import { formatDate } from '../../utils/helpers';
import { useRechartStyles } from '../../utils/rechartStyles';
import { format, subDays, subWeeks, subMonths, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, startOfWeek, startOfMonth } from 'date-fns';

function ProjectManager() {
  const store = useStore();
  const { projects, addProject, updateProject, deleteProject, addProjectLog } = store;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', tasks: [] });
  const [taskForm, setTaskForm] = useState({ name: '', description: '' });
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const taskRowBg = useColorModeValue('gray.50', 'gray.700');

  const openNew = () => { setEditing(null); setForm({ name: '', description: '', tasks: [] }); onOpen(); };
  const openEdit = (p) => { setEditing(p); setForm({ ...p }); onOpen(); };

  const addTask = () => {
    if (taskForm.name) {
      setForm((f) => ({ ...f, tasks: [...f.tasks, { ...taskForm, id: Date.now().toString(), completed: false }] }));
      setTaskForm({ name: '', description: '' });
    }
  };

  const removeTask = (id) => setForm((f) => ({ ...f, tasks: f.tasks.filter((t) => t.id !== id) }));
  const toggleTask = (id) => setForm((f) => ({ ...f, tasks: f.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)) }));
  const save = () => { if (editing) updateProject(editing.id, form); else addProject(form); onClose(); };

  const getProjectHours = (projectId) => {
    return store.projectLogs.filter((l) => l.projectId === projectId).reduce((a, l) => a + (l.hours || 0), 0);
  };

  const getTaskHours = (projectId, taskId) => {
    return store.projectLogs.filter((l) => l.projectId === projectId && l.taskId === taskId).reduce((a, l) => a + (l.hours || 0), 0);
  };

  return (
    <Box>
      <Flex justify="space-between" mb={4}>
        <Text fontWeight="bold">Proyectos</Text>
        <Button leftIcon={<FiPlus />} size="sm" onClick={openNew}>Nuevo Proyecto</Button>
      </Flex>
      <VStack spacing={3} align="stretch">
        {projects.length === 0 && <Text color="gray.500" textAlign="center" py={4}>No hay proyectos creados</Text>}
        {projects.map((p) => {
          const hours = getProjectHours(p.id);
          const completedTasks = (p.tasks || []).filter((t) => t.completed).length;
          const totalTasks = (p.tasks || []).length;
          const isExpanded = expandedProject === p.id;
          return (
            <Box key={p.id} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
              <Flex p={4} justify="space-between" align="center" cursor="pointer" onClick={() => setExpandedProject(isExpanded ? null : p.id)}>
                <HStack flex={1}>
                  <IconButton icon={isExpanded ? <FiChevronDown /> : <FiChevronRight />} size="xs" variant="ghost" />
                  <Box>
                    <HStack><Text fontWeight="bold">{p.name}</Text><Badge colorScheme="green">{hours.toFixed(1)}h</Badge></HStack>
                    <Text fontSize="xs" color="gray.500">{completedTasks}/{totalTasks} tareas · {p.description || ''}</Text>
                  </Box>
                </HStack>
                <HStack>
                  <IconButton icon={<FiEdit3 />} size="xs" onClick={(e) => { e.stopPropagation(); openEdit(p); }} />
                  <IconButton icon={<FiTrash2 />} size="xs" colorScheme="red" onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }} />
                </HStack>
              </Flex>
              <Collapse in={isExpanded} animateOpacity>
                <Box px={4} pb={4} borderTop="1px solid" borderColor={borderColor} pt={3}>
                  {(p.tasks || []).length === 0 && <Text color="gray.500" fontSize="sm">Sin subtareas</Text>}
                  {(p.tasks || []).map((t) => {
                    const taskH = getTaskHours(p.id, t.id);
                    return (
                      <Flex key={t.id} p={2} bg={taskRowBg} borderRadius="md" justify="space-between" align="center" mb={1}>
                        <HStack>
                          <Box w="14px" h="14px" borderRadius="3px" border="2px solid" borderColor={t.completed ? 'green.500' : taskBorder} bg={t.completed ? 'green.500' : 'transparent'} cursor="pointer" onClick={() => {
                            const updatedTasks = p.tasks.map((tk) => tk.id === t.id ? { ...tk, completed: !tk.completed } : tk);
                            updateProject(p.id, { tasks: updatedTasks });
                          }} />
                          <Text fontSize="sm" textDecoration={t.completed ? 'line-through' : 'none'} opacity={t.completed ? 0.5 : 1}>{t.name}</Text>
                          {taskH > 0 && <Badge size="xs" colorScheme="blue">{taskH.toFixed(1)}h</Badge>}
                        </HStack>
                      </Flex>
                    );
                  })}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? 'Editar Proyecto' : 'Nuevo Proyecto'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl><FormLabel>Nombre</FormLabel><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></FormControl>
              <FormControl><FormLabel>Descripción</FormLabel><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></FormControl>
              <Box w="100%">
                <Text fontWeight="bold" mb={2}>Subtareas</Text>
                <HStack mb={2}><Input size="sm" placeholder="Nombre subtarea" value={taskForm.name} onChange={(e) => setTaskForm((t) => ({ ...t, name: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && addTask()} /><Button size="sm" onClick={addTask}>Agregar</Button></HStack>
                <VStack align="stretch" maxH="200px" overflowY="auto">
                  {form.tasks.map((t) => (
                    <Flex key={t.id} p={2} bg={taskRowBg} borderRadius="md" justify="space-between">
                      <Text fontSize="sm">{t.name}</Text>
                      <IconButton icon={<FiTrash2 />} size="xs" variant="ghost" colorScheme="red" onClick={() => removeTask(t.id)} />
                    </Flex>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button onClick={save} isDisabled={!form.name}>{editing ? 'Guardar' : 'Crear'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function LogHours() {
  const { projects, addProjectLog, addXP } = useStore();
  const [form, setForm] = useState({ projectId: '', taskId: '', hours: 1, description: '' });
  const modalBg = useColorModeValue('white', 'gray.800');
  const modalBorder = useColorModeValue('gray.200', 'gray.700');

  const selectedProject = projects.find((p) => p.id === form.projectId);

  const save = () => {
    addProjectLog({ ...form, date: format(new Date(), 'yyyy-MM-dd'), type: 'project' });
    addXP(5);
    setForm({ projectId: '', taskId: '', hours: 1, description: '' });
  };

  return (
    <Box p={5} bg={modalBg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={modalBorder}>
      <Text fontWeight="bold" mb={4}>Registrar Horas</Text>
      <VStack spacing={4}>
        <FormControl><FormLabel>Proyecto</FormLabel><Select placeholder="Seleccionar proyecto" value={form.projectId} onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value, taskId: '' }))}>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select></FormControl>
        {selectedProject && (selectedProject.tasks || []).length > 0 && (
          <FormControl><FormLabel>Subtarea</FormLabel><Select placeholder="Seleccionar subtarea (opcional)" value={form.taskId} onChange={(e) => setForm((f) => ({ ...f, taskId: e.target.value }))}>
            {(selectedProject.tasks || []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select></FormControl>
        )}
        <FormControl><FormLabel>Horas</FormLabel><Input type="number" value={form.hours} onChange={(e) => setForm((f) => ({ ...f, hours: parseFloat(e.target.value) || 0 }))} /></FormControl>
        <FormControl><FormLabel>Descripción del avance</FormLabel><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></FormControl>
        <Button w="100%" onClick={save} isDisabled={!form.projectId || form.hours <= 0}>Registrar</Button>
      </VStack>
    </Box>
  );
}

function ProjectStats() {
  const { projects, projectLogs } = useStore();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const logRowBg = useColorModeValue('gray.50', 'gray.700');
  const taskBorder = useColorModeValue('gray.300', 'gray.600');
  const [periodFilter, setPeriodFilter] = useState('daily');
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { textColor, gridColor, tooltipBg, tooltipBorder, tooltipColor } = useRechartStyles();

  const totalHours = useMemo(() => +(projectLogs.reduce((a, l) => a + (l.hours || 0), 0)).toFixed(1), [projectLogs]);

  const dailyData = useMemo(() => {
    const now = new Date();
    const days = eachDayOfInterval({ start: subDays(now, 13), end: now });
    return days.map((d) => {
      const dStr = format(d, 'yyyy-MM-dd');
      const hours = projectLogs.filter((l) => l.date === dStr).reduce((a, l) => a + (l.hours || 0), 0);
      return { day: format(d, 'dd/MM'), horas: +hours.toFixed(1) };
    });
  }, [projectLogs]);

  const weeklyData = useMemo(() => {
    const now = new Date();
    const weeks = eachWeekOfInterval({ start: subWeeks(now, 7), end: now }, { weekStartsOn: 1 });
    return weeks.map((w) => {
      const wEnd = new Date(w.getTime() + 7 * 86400000);
      const hours = projectLogs.filter((l) => { const d = new Date(l.date); return d >= w && d < wEnd; }).reduce((a, l) => a + (l.hours || 0), 0);
      return { week: format(w, 'dd/MM'), horas: +hours.toFixed(1) };
    });
  }, [projectLogs]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = eachMonthOfInterval({ start: subMonths(now, 5), end: now });
    return months.map((m) => {
      const mStr = format(m, 'yyyy-MM');
      const hours = projectLogs.filter((l) => l.date?.startsWith(mStr)).reduce((a, l) => a + (l.hours || 0), 0);
      return { month: format(m, 'MMM yy'), horas: +hours.toFixed(1) };
    });
  }, [projectLogs]);

  const filteredLogs = useMemo(() => {
    return projectLogs.filter((l) => l.date === filterDate);
  }, [projectLogs, filterDate]);

  const filteredHours = useMemo(() => +filteredLogs.reduce((a, l) => a + (l.hours || 0), 0).toFixed(1), [filteredLogs]);

  const chartData = periodFilter === 'daily' ? dailyData : periodFilter === 'weekly' ? weeklyData : monthlyData;
  const chartKey = periodFilter === 'daily' ? 'day' : periodFilter === 'weekly' ? 'week' : 'month';

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Horas Totales</StatLabel><StatNumber>{totalHours}h</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Proyectos</StatLabel><StatNumber>{projects.length}</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Horas {formatDate(filterDate)}</StatLabel><StatNumber color="blue.500">{filteredHours}h</StatNumber></Stat>
        </Box>
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={5} mb={5}>
        <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
          <Flex justify="space-between" align="center" mb={3}>
            <Text fontWeight="bold">Rendimiento</Text>
            <HStack>
              <Select size="sm" w="120px" value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </Select>
            </HStack>
          </Flex>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey={chartKey} fontSize={12} tick={{ fill: textColor }} />
              <YAxis tick={{ fill: textColor }} />
              <Tooltip contentStyle={{ bg: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipColor }} />
              <Bar dataKey="horas" fill="#9F7AEA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
          <Text fontWeight="bold" mb={3}>Filtrar por Día</Text>
          <Input type="date" size="sm" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} mb={3} />
          <VStack align="stretch" spacing={2} maxH="250px" overflowY="auto">
            {filteredLogs.length === 0 && <Text color="gray.500" fontSize="sm">Sin registros</Text>}
            {filteredLogs.map((l) => {
              const proj = projects.find((p) => p.id === l.projectId);
              const task = proj ? (proj.tasks || []).find((t) => t.id === l.taskId) : null;
              return (
                <Box key={l.id} p={2} bg={logRowBg} borderRadius="md">
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="bold">{proj?.name || 'Proyecto'}</Text>
                    <Badge colorScheme="purple">{l.hours}h</Badge>
                  </HStack>
                  {task && <Text fontSize="xs" color="gray.500">Tarea: {task.name}</Text>}
                  {l.description && <Text fontSize="xs" color="gray.400">{l.description}</Text>}
                </Box>
              );
            })}
          </VStack>
        </Box>
      </Grid>
    </Box>
  );
}

export default function Proyectos() {
  return (
    <Tabs variant="enclosed" colorScheme="purple">
      <TabList>
        <Tab><FiGrid style={{ marginRight: 8 }} />Proyectos</Tab>
        <Tab><FiClock style={{ marginRight: 8 }} />Registrar Horas</Tab>
        <Tab><FiTrendingUp style={{ marginRight: 8 }} />Estadísticas</Tab>
      </TabList>
      <TabPanels>
        <TabPanel px={0}><ProjectManager /></TabPanel>
        <TabPanel px={0}><LogHours /></TabPanel>
        <TabPanel px={0}><ProjectStats /></TabPanel>
      </TabPanels>
    </Tabs>
  );
}
