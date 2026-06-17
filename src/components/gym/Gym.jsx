import React, { useState, useMemo } from 'react';
import { Box, Grid, Text, Flex, VStack, HStack, Badge, Button, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, Input, Textarea, Select, Progress, Stat, StatLabel, StatNumber, SimpleGrid, useColorModeValue, Tabs, TabList, TabPanels, Tab, TabPanel, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiEdit3, FiActivity, FiTarget, FiTrendingUp, FiClock, FiZap } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useStore from '../../store/useStore';
import { formatDate, calculateCalories } from '../../utils/helpers';
import { useRechartStyles } from '../../utils/rechartStyles';
import { format, subWeeks, eachWeekOfInterval } from 'date-fns';

function RutinaManager() {
  const { gymRoutines, addGymRoutine, updateGymRoutine, deleteGymRoutine } = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', exercises: [] });
  const [exerciseForm, setExerciseForm] = useState({ name: '', type: 'fuerza', sets: 3, reps: 12, weight: 0 });
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const rowBg = useColorModeValue('gray.50', 'gray.700');

  const openNew = () => { setEditing(null); setForm({ name: '', description: '', exercises: [] }); onOpen(); };
  const openEdit = (r) => { setEditing(r); setForm({ ...r }); onOpen(); };

  const addExercise = () => {
    if (exerciseForm.name) {
      setForm((f) => ({ ...f, exercises: [...f.exercises, { ...exerciseForm, id: Date.now().toString() }] }));
      setExerciseForm({ name: '', type: 'fuerza', sets: 3, reps: 12, weight: 0 });
    }
  };

  const removeExercise = (id) => setForm((f) => ({ ...f, exercises: f.exercises.filter((e) => e.id !== id) }));
  const save = () => { if (editing) updateGymRoutine(editing.id, form); else addGymRoutine(form); onClose(); };

  return (
    <Box>
      <Flex justify="space-between" mb={4}>
        <Text fontWeight="bold">Rutinas</Text>
        <Button leftIcon={<FiPlus />} size="sm" onClick={openNew}>Nueva Rutina</Button>
      </Flex>
      <VStack spacing={3} align="stretch">
        {gymRoutines.length === 0 && <Text color="gray.500" textAlign="center" py={4}>No hay rutinas creadas</Text>}
        {gymRoutines.map((r) => (
          <Box key={r.id} p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
            <Flex justify="space-between" align="start">
              <Box flex={1}>
                <HStack mb={2}><Text fontWeight="bold">{r.name}</Text><Badge colorScheme="red">{(r.exercises || []).length} ejercicios</Badge></HStack>
                {r.description && <Text fontSize="sm" color="gray.500" mb={2}>{r.description}</Text>}
                <VStack align="stretch" spacing={1}>
                  {(r.exercises || []).map((e) => (
                    <HStack key={e.id} fontSize="xs" color="gray.400">
                      <Badge size="sm" colorScheme={e.type === 'cardio' ? 'red' : e.type === 'hiit' ? 'orange' : 'blue'}>{e.type}</Badge>
                      <Text>{e.name}</Text>
                      <Text>{e.sets}x{e.reps}</Text>
                      {e.weight > 0 && <Text>{e.weight}kg</Text>}
                    </HStack>
                  ))}
                </VStack>
              </Box>
              <HStack>
                <IconButton icon={<FiEdit3 />} size="xs" onClick={() => openEdit(r)} />
                <IconButton icon={<FiTrash2 />} size="xs" colorScheme="red" onClick={() => deleteGymRoutine(r.id)} />
              </HStack>
            </Flex>
          </Box>
        ))}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? 'Editar Rutina' : 'Nueva Rutina'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl><FormLabel>Nombre</FormLabel><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></FormControl>
              <FormControl><FormLabel>Descripción</FormLabel><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></FormControl>
              <Box w="100%">
                <Text fontWeight="bold" mb={2}>Ejercicios</Text>
                <Grid templateColumns="2fr 1fr 1fr 1fr 1fr auto" gap={2} mb={2}>
                  <Input size="sm" placeholder="Nombre" value={exerciseForm.name} onChange={(e) => setExerciseForm((ef) => ({ ...ef, name: e.target.value }))} />
                  <Select size="sm" value={exerciseForm.type} onChange={(e) => setExerciseForm((ef) => ({ ...ef, type: e.target.value }))}>
                    <option value="fuerza">Fuerza</option><option value="cardio">Cardio</option><option value="hiit">HIIT</option><option value="flexibilidad">Flexibilidad</option>
                  </Select>
                  <NumberInput size="sm" value={exerciseForm.sets} onChange={(_, v) => setExerciseForm((ef) => ({ ...ef, sets: v }))}><NumberInputField /><NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper></NumberInput>
                  <NumberInput size="sm" value={exerciseForm.reps} onChange={(_, v) => setExerciseForm((ef) => ({ ...ef, reps: v }))}><NumberInputField /><NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper></NumberInput>
                  <NumberInput size="sm" value={exerciseForm.weight} onChange={(_, v) => setExerciseForm((ef) => ({ ...ef, weight: v }))}><NumberInputField /><NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper></NumberInput>
                  <IconButton icon={<FiPlus />} size="sm" onClick={addExercise} />
                </Grid>
                <VStack align="stretch" maxH="150px" overflowY="auto">
                  {form.exercises.map((e) => (
                    <Flex key={e.id} p={2} bg={rowBg} borderRadius="md" justify="space-between">
                      <Text fontSize="sm">{e.name} - {e.sets}x{e.reps} {e.weight > 0 ? `${e.weight}kg` : ''}</Text>
                      <IconButton icon={<FiTrash2 />} size="xs" variant="ghost" colorScheme="red" onClick={() => removeExercise(e.id)} />
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

function SessionRegistrar() {
  const { gymRoutines, gymSessions, addGymSession, deleteGymSession, addXP } = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [form, setForm] = useState({ routineId: '', duration: 30, calories: 0, notes: '' });
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const save = () => {
    const routine = gymRoutines.find((r) => r.id === form.routineId);
    const cal = calculateCalories({ type: 'fuerza' }, 70, form.duration);
    addGymSession({ ...form, calories: cal, routineName: routine?.name || '', date: format(new Date(), 'yyyy-MM-dd'), type: 'gym' });
    addXP(15);
    setForm({ routineId: '', duration: 30, calories: 0, notes: '' });
    onClose();
  };

  const sortedSessions = useMemo(() => [...gymSessions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [gymSessions]);

  return (
    <Box>
      <Flex justify="space-between" mb={4}>
        <Text fontWeight="bold">Sesiones de Gimnasio</Text>
        <Button leftIcon={<FiActivity />} colorScheme="red" size="sm" onClick={onOpen}>Registrar Sesión</Button>
      </Flex>

      <VStack spacing={3} align="stretch">
        {sortedSessions.length === 0 && <Text color="gray.500" textAlign="center" py={4}>No hay sesiones registradas</Text>}
        {sortedSessions.map((s) => (
          <Flex key={s.id} p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} justify="space-between" align="center">
            <Box>
              <HStack mb={1}>
                <Text fontWeight="bold">{s.routineName || 'Sesión'}</Text>
                <Badge colorScheme="red">{s.duration} min</Badge>
                <Badge colorScheme="orange">{s.calories || 0} kcal</Badge>
              </HStack>
              <HStack fontSize="sm" color="gray.500" spacing={3}>
                <Text>{formatDate(s.date)}</Text>
                <Text>{formatDate(s.createdAt, 'HH:mm')}</Text>
              </HStack>
              {s.notes && <Text fontSize="xs" color="gray.400" mt={1}>{s.notes}</Text>}
            </Box>
            <IconButton icon={<FiTrash2 />} size="xs" colorScheme="red" variant="ghost" onClick={() => deleteGymSession(s.id)} />
          </Flex>
        ))}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Registrar Sesión de Gimnasio</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl><FormLabel>Rutina</FormLabel><Select placeholder="Seleccionar rutina" value={form.routineId} onChange={(e) => setForm((f) => ({ ...f, routineId: e.target.value }))}>
                {gymRoutines.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </Select></FormControl>
              <FormControl><FormLabel>Duración (min)</FormLabel><Input type="number" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: parseInt(e.target.value) || 0 }))} /></FormControl>
              <Text fontSize="sm" color="gray.500">Calorías estimadas: ~{calculateCalories({ type: 'fuerza' }, 70, form.duration)} kcal</Text>
              <FormControl><FormLabel>Notas</FormLabel><Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button onClick={save} colorScheme="red">Registrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function GymStats() {
  const { gymSessions, gymGoals, addGymGoal, deleteGymGoal } = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [goalForm, setGoalForm] = useState({ name: '', target: 0, current: 0, unit: 'sesiones' });
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const rowBg = useColorModeValue('gray.50', 'gray.700');
  const { textColor, gridColor, tooltipBg, tooltipBorder, tooltipColor } = useRechartStyles();

  const weeklyData = useMemo(() => {
    const now = new Date();
    const weeks = eachWeekOfInterval({ start: subWeeks(now, 7), end: now }, { weekStartsOn: 1 });
    return weeks.map((w) => {
      const sessions = gymSessions.filter((s) => { const d = new Date(s.date); return d >= w && d < new Date(w.getTime() + 7 * 86400000); });
      return { week: format(w, 'dd/MM'), sesiones: sessions.length, calorias: sessions.reduce((a, s) => a + (s.calories || 0), 0) };
    });
  }, [gymSessions]);

  const totalDuration = gymSessions.reduce((a, s) => a + (s.duration || 0), 0);
  const totalCalories = gymSessions.reduce((a, s) => a + (s.calories || 0), 0);

  const saveGoal = () => { addGymGoal(goalForm); setGoalForm({ name: '', target: 0, current: 0, unit: 'sesiones' }); onClose(); };

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Tiempo Total</StatLabel><StatNumber>{(totalDuration / 60).toFixed(1)}h</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Calorías Totales</StatLabel><StatNumber>{totalCalories.toLocaleString()}</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Sesiones</StatLabel><StatNumber>{gymSessions.length}</StatNumber></Stat>
        </Box>
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={5} mb={5}>
        <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
          <Text fontWeight="bold" mb={3}>Progreso Semanal</Text>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="week" fontSize={12} tick={{ fill: textColor }} /><YAxis tick={{ fill: textColor }} /><Tooltip contentStyle={{ bg: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipColor }} />
              <Bar dataKey="sesiones" fill="#E53E3E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
        <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
          <Flex justify="space-between" mb={3}>
            <Text fontWeight="bold">Objetivos</Text>
            <Button size="xs" leftIcon={<FiPlus />} onClick={onOpen}>Nuevo</Button>
          </Flex>
          <VStack align="stretch" spacing={2}>
            {gymGoals.length === 0 && <Text color="gray.500" fontSize="sm">Sin objetivos</Text>}
            {gymGoals.map((g) => (
              <Box key={g.id} p={2} bg={rowBg} borderRadius="md">
                <Flex justify="space-between">
                  <Text fontSize="sm" fontWeight="bold">{g.name}</Text>
                  <IconButton icon={<FiTrash2 />} size="xs" variant="ghost" colorScheme="red" onClick={() => deleteGymGoal(g.id)} />
                </Flex>
                <Progress value={g.target > 0 ? (g.current / g.target) * 100 : 0} size="sm" colorScheme="red" mt={1} />
                <Text fontSize="xs" color="gray.500">{g.current}/{g.target} {g.unit}</Text>
              </Box>
            ))}
          </VStack>
        </Box>
      </Grid>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuevo Objetivo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl><FormLabel>Nombre</FormLabel><Input value={goalForm.name} onChange={(e) => setGoalForm((f) => ({ ...f, name: e.target.value }))} /></FormControl>
              <HStack w="100%">
                <FormControl><FormLabel>Objetivo</FormLabel><Input type="number" value={goalForm.target} onChange={(e) => setGoalForm((f) => ({ ...f, target: parseInt(e.target.value) || 0 }))} /></FormControl>
                <FormControl><FormLabel>Unidad</FormLabel><Select value={goalForm.unit} onChange={(e) => setGoalForm((f) => ({ ...f, unit: e.target.value }))}>
                  <option value="sesiones">Sesiones</option><option value="minutos">Minutos</option><option value="calorias">Calorías</option>
                </Select></FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button onClick={saveGoal} isDisabled={!goalForm.name}>Crear</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default function Gym() {
  return (
    <Tabs variant="enclosed" colorScheme="red">
      <TabList>
        <Tab><FiActivity style={{ marginRight: 8 }} />Rutinas</Tab>
        <Tab><FiTarget style={{ marginRight: 8 }} />Sesiones</Tab>
        <Tab><FiTrendingUp style={{ marginRight: 8 }} />Estadísticas</Tab>
      </TabList>
      <TabPanels>
        <TabPanel px={0}><RutinaManager /></TabPanel>
        <TabPanel px={0}><SessionRegistrar /></TabPanel>
        <TabPanel px={0}><GymStats /></TabPanel>
      </TabPanels>
    </Tabs>
  );
}
