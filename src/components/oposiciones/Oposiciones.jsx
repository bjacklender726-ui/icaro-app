import React, { useState, useMemo } from 'react';
import { Box, Grid, Text, Flex, VStack, HStack, Badge, Button, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, Input, Textarea, Select, Progress, Stat, StatLabel, StatNumber, SimpleGrid, useColorModeValue, Tabs, TabList, TabPanels, Tab, TabPanel, Tooltip, Tag, Wrap, WrapItem, Switch, NumberInput, NumberInputField, Divider } from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiEdit3, FiPlay, FiPause, FiSquare, FiCheck, FiClock, FiBookOpen, FiTarget, FiAward, FiFileText, FiBook, FiCheckCircle, FiBarChart2, FiEdit } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import useStore from '../../store/useStore';
import { formatDate } from '../../utils/helpers';
import { useRechartStyles } from '../../utils/rechartStyles';

// ===== CRONOMETRO =====
function Cronometro({ onRegister }) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedTemario, setSelectedTemario] = useState('');
  const { temarios } = useStore();
  const selectedTemarioData = temarios.find((t) => t.id === selectedTemario);
  const topics = selectedTemarioData ? (selectedTemarioData.topics || []) : [];
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  React.useEffect(() => {
    let interval;
    if (running) { interval = setInterval(() => setSeconds((s) => s + 1), 1000); }
    return () => clearInterval(interval);
  }, [running]);

  const formatTime = (s) => `${Math.floor(s / 3600).toString().padStart(2, '0')}:${Math.floor((s % 3600) / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleStop = () => {
    setRunning(false);
    if (seconds > 0) {
      onRegister({ duration: Math.round(seconds / 60), seconds, topicId: selectedTopic, temarioId: selectedTemario, date: new Date().toISOString().split('T')[0] });
      setSeconds(0);
    }
  };

  return (
    <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
      <Text fontWeight="bold" mb={3}>Cronómetro de Estudio</Text>
      <VStack spacing={4}>
        <Text fontSize="5xl" fontFamily="monospace" fontWeight="bold" color={running ? 'red.500' : 'inherit'}>{formatTime(seconds)}</Text>
        <Select placeholder="Seleccionar temario" size="sm" value={selectedTemario} onChange={(e) => { setSelectedTemario(e.target.value); setSelectedTopic(''); }}>
          {temarios.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </Select>
        {topics.length > 0 && (
          <Select placeholder="Seleccionar tema (opcional)" size="sm" value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
            {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        )}
        <HStack>
          {!running ? (
            <Button leftIcon={<FiPlay />} colorScheme="green" size="lg" onClick={() => setRunning(true)}>Iniciar</Button>
          ) : (
            <>
              <Button leftIcon={<FiSquare />} colorScheme="red" size="lg" onClick={handleStop}>Detener y Registrar</Button>
              <Button variant="outline" size="lg" onClick={() => { setRunning(false); setSeconds(0); }}>Cancelar</Button>
            </>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}

// ===== CONVOCATORIA FORM =====
function ConvocatoriaForm() {
  const { convocatoria, updateConvocatoria } = useStore();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleChange = (field, value) => updateConvocatoria({ [field]: value });

  return (
    <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
      <Text fontWeight="bold" fontSize="lg" mb={4}>Convocatoria</Text>
      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
        <FormControl>
          <FormLabel>Nombre de la oposición</FormLabel>
          <Input value={convocatoria.nombre} onChange={(e) => handleChange('nombre', e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Organismo</FormLabel>
          <Input value={convocatoria.organismo} onChange={(e) => handleChange('organismo', e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Plazo inscripción inicio</FormLabel>
          <Input type="date" value={convocatoria.plazoInscripcionInicio} onChange={(e) => handleChange('plazoInscripcionInicio', e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Plazo inscripción fin</FormLabel>
          <Input type="date" value={convocatoria.plazoInscripcionFin} onChange={(e) => handleChange('plazoInscripcionFin', e.target.value)} />
        </FormControl>
        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">¿Estás inscrito?</FormLabel>
          <Switch colorScheme="green" isChecked={convocatoria.inscrito} onChange={(e) => handleChange('inscrito', e.target.checked)} />
        </FormControl>
        <FormControl>
          <FormLabel>Fecha de admitidos</FormLabel>
          <Input type="date" value={convocatoria.fechaAdmitidos} onChange={(e) => handleChange('fechaAdmitidos', e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Listas provisionales</FormLabel>
          <Input type="date" value={convocatoria.listasProvisionales} onChange={(e) => handleChange('listasProvisionales', e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Fecha de examen</FormLabel>
          <Input type="date" value={convocatoria.fechaExamen} onChange={(e) => handleChange('fechaExamen', e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Lugar del examen</FormLabel>
          <Input value={convocatoria.lugarExamen} onChange={(e) => handleChange('lugarExamen', e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Tasa a pagar (€)</FormLabel>
          <NumberInput value={convocatoria.tasa} onChange={(v) => handleChange('tasa', v)}>
            <NumberInputField />
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel>Nº de plazas</FormLabel>
          <NumberInput value={convocatoria.numeroPlazas} onChange={(v) => handleChange('numeroPlazas', v)}>
            <NumberInputField />
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel>Media mínima para aprobar</FormLabel>
          <NumberInput value={convocatoria.mediasAprobar} onChange={(v) => handleChange('mediasAprobar', v)}>
            <NumberInputField />
          </NumberInput>
        </FormControl>
      </Grid>
      <FormControl mt={4}>
        <FormLabel>Notas adicionales</FormLabel>
        <Textarea value={convocatoria.notas} onChange={(e) => handleChange('notas', e.target.value)} rows={3} />
      </FormControl>
    </Box>
  );
}

// ===== TEMARIO MANAGER =====
function TemarioManager() {
  const { temarios, addTemario, updateTemario, deleteTemario, studySessions } = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', topics: [] });
  const [topicForm, setTopicForm] = useState({ name: '' });
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const rowBg = useColorModeValue('gray.50', 'gray.700');

  const getTopicTime = (topicId) => {
    return studySessions.filter((s) => s.topicId === topicId).reduce((a, s) => a + (s.seconds || (s.duration || 0) * 60), 0);
  };

  const getTemarioTime = (temario) => {
    return (temario.topics || []).reduce((a, t) => a + getTopicTime(t.id), 0);
  };

  const openNew = () => { setEditing(null); setForm({ name: '', description: '', topics: [] }); onOpen(); };
  const openEdit = (t) => { setEditing(t); setForm({ ...t }); onOpen(); };
  const save = () => {
    if (editing) updateTemario(editing.id, form);
    else addTemario(form);
    onClose();
  };

  const addTopic = () => {
    if (topicForm.name) {
      setForm((f) => ({ ...f, topics: [...f.topics, { ...topicForm, id: Date.now().toString(), completed: false }] }));
      setTopicForm({ name: '' });
    }
  };

  const removeTopic = (id) => setForm((f) => ({ ...f, topics: f.topics.filter((t) => t.id !== id) }));
  const toggleTopic = (id) => setForm((f) => ({ ...f, topics: f.topics.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)) }));

  const formatSeconds = (s) => {
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}min`;
    return `${(s / 3600).toFixed(1)}h`;
  };

  return (
    <Box>
      <Flex justify="space-between" mb={4}>
        <Text fontWeight="bold">Temarios</Text>
        <Button leftIcon={<FiPlus />} size="sm" onClick={openNew}>Nuevo Temario</Button>
      </Flex>
      <VStack spacing={4} align="stretch">
        {temarios.length === 0 && <Text color="gray.500" textAlign="center" py={4}>No hay temarios creados</Text>}
        {temarios.map((t) => {
          const completed = (t.topics || []).filter((tp) => tp.completed).length;
          const total = (t.topics || []).length;
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
          const totalTime = getTemarioTime(t);
          return (
            <Box key={t.id} p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
              <Flex justify="space-between" align="start">
                <Box flex={1}>
                  <HStack mb={2} wrap="wrap">
                    <Text fontWeight="bold">{t.name}</Text>
                    <Badge colorScheme="blue">{completed}/{total} temas</Badge>
                    {totalTime > 0 && <Badge colorScheme="green"><FiClock size={10} style={{ display: 'inline', marginRight: 4 }} />{formatSeconds(totalTime)}</Badge>}
                  </HStack>
                  {t.description && <Text fontSize="sm" color="gray.500" mb={2}>{t.description}</Text>}
                  <Progress value={pct} colorScheme="blue" size="sm" borderRadius="full" mb={2} />
                  <Text fontSize="xs" color="gray.400">{pct}% completado</Text>
                  <Wrap mt={2}>
                    {(t.topics || []).slice(0, 8).map((tp) => {
                      const time = getTopicTime(tp.id);
                      return (
                        <WrapItem key={tp.id}>
                          <Tag size="sm" colorScheme={tp.completed ? 'green' : 'gray'} cursor="pointer"
                            onClick={() => toggleTopic(tp.id)}
                            textDecoration={tp.completed ? 'line-through' : 'none'}>
                            {tp.name} {time > 0 && <Badge ml={1} size="xs" colorScheme="blue">{formatSeconds(time)}</Badge>}
                          </Tag>
                        </WrapItem>
                      );
                    })}
                    {(t.topics || []).length > 8 && <WrapItem><Tag size="sm">+{(t.topics || []).length - 8} más</Tag></WrapItem>}
                  </Wrap>
                </Box>
                <HStack>
                  <IconButton icon={<FiEdit3 />} size="xs" onClick={() => openEdit(t)} />
                  <IconButton icon={<FiTrash2 />} size="xs" colorScheme="red" onClick={() => deleteTemario(t.id)} />
                </HStack>
              </Flex>
            </Box>
          );
        })}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? 'Editar Temario' : 'Nuevo Temario'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl><FormLabel>Nombre</FormLabel><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></FormControl>
              <FormControl><FormLabel>Descripción</FormLabel><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></FormControl>
              <Box w="100%">
                <Text fontWeight="bold" mb={2}>Temas</Text>
                <HStack mb={2}><Input size="sm" placeholder="Nombre del tema" value={topicForm.name} onChange={(e) => setTopicForm((t) => ({ ...t, name: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && addTopic()} /><Button size="sm" onClick={addTopic}>Agregar</Button></HStack>
                <VStack align="stretch" maxH="200px" overflowY="auto">
                  {form.topics.map((tp) => (
                    <Flex key={tp.id} p={2} bg={rowBg} borderRadius="md" justify="space-between">
                      <Text size="sm" textDecoration={tp.completed ? 'line-through' : 'none'} cursor="pointer" onClick={() => toggleTopic(tp.id)}>{tp.name}</Text>
                      <IconButton icon={<FiTrash2 />} size="xs" variant="ghost" colorScheme="red" onClick={() => removeTopic(tp.id)} />
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

// ===== TEST MANAGER =====
function TestManager() {
  const { tests, addTest, deleteTest, testResults, addTestResult, addXP } = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [form, setForm] = useState({ name: '', questions: [] });
  const [questionForm, setQuestionForm] = useState({ text: '', options: ['', '', '', ''], correct: 0 });
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const rowBg = useColorModeValue('gray.50', 'gray.700');

  const addQuestion = () => {
    if (questionForm.text && questionForm.options.filter((o) => o).length >= 2) {
      setForm((f) => ({ ...f, questions: [...f.questions, { ...questionForm, id: Date.now().toString() }] }));
      setQuestionForm({ text: '', options: ['', '', '', ''], correct: 0 });
    }
  };

  const saveTest = () => { addTest(form); setForm({ name: '', questions: [] }); onClose(); };

  const submitTest = () => {
    if (!activeTest) return;
    let correct = 0;
    activeTest.questions.forEach((q) => { if (answers[q.id] === q.correct) correct++; });
    const result = { testId: activeTest.id, testName: activeTest.name, total: activeTest.questions.length, correct, percentage: Math.round((correct / activeTest.questions.length) * 100), date: new Date().toISOString().split('T')[0] };
    addTestResult(result);
    addXP(Math.round(result.percentage / 10));
    setShowResults(true);
  };

  return (
    <Box>
      {activeTest && !showResults ? (
        <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
          <Flex justify="space-between" mb={4}>
            <Text fontWeight="bold">{activeTest.name}</Text>
            <Button size="sm" variant="ghost" onClick={() => { setActiveTest(null); setAnswers({}); }}>Volver</Button>
          </Flex>
          <VStack spacing={4} align="stretch">
            {activeTest.questions.map((q, qi) => (
              <Box key={q.id} p={4} bg={rowBg} borderRadius="md">
                <Text fontWeight="bold" mb={2}>{qi + 1}. {q.text}</Text>
                <VStack align="stretch">
                  {q.options.filter((o) => o).map((opt, oi) => (
                    <HStack key={oi} p={2} bg={answers[q.id] === oi ? 'blue.100' : 'transparent'} borderRadius="md" cursor="pointer" _hover={{ bg: 'blue.50' }} onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}>
                      <Box w="20px" h="20px" borderRadius="full" border="2px solid" borderColor={answers[q.id] === oi ? 'blue.500' : 'gray.300'} bg={answers[q.id] === oi ? 'blue.500' : 'transparent'} />
                      <Text fontSize="sm">{opt}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            ))}
          </VStack>
          <Button mt={4} w="100%" colorScheme="green" onClick={submitTest} isDisabled={Object.keys(answers).length < activeTest.questions.length}>Enviar Test</Button>
        </Box>
      ) : showResults && activeTest ? (
        <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Text fontSize="2xl" mb={2}>🏆</Text>
          <Text fontSize="2xl" fontWeight="bold" mt={3}>Test Completado</Text>
          <Text fontSize="4xl" fontWeight="bold" color={testResults[testResults.length - 1]?.percentage >= 70 ? 'green.500' : 'red.500'}>
            {testResults[testResults.length - 1]?.percentage}%
          </Text>
          <Text color="gray.500">{testResults[testResults.length - 1]?.correct} de {testResults[testResults.length - 1]?.total} correctas</Text>
          <Button mt={4} onClick={() => { setActiveTest(null); setShowResults(false); setAnswers({}); }}>Volver a tests</Button>
        </Box>
      ) : (
        <>
          <Flex justify="space-between" mb={4}>
            <Text fontWeight="bold">Tests</Text>
            <Button leftIcon={<FiPlus />} size="sm" onClick={() => { setForm({ name: '', questions: [] }); onOpen(); }}>Nuevo Test</Button>
          </Flex>
          {tests.length === 0 ? <Text color="gray.500" textAlign="center" py={4}>No hay tests creados</Text> : (
            <VStack spacing={3} align="stretch">
              {tests.map((t) => (
                <Flex key={t.id} p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold">{t.name}</Text>
                    <Text fontSize="sm" color="gray.500">{(t.questions || []).length} preguntas</Text>
                  </Box>
                  <HStack>
                    <Button size="sm" leftIcon={<FiPlay />} onClick={() => { setActiveTest(t); setAnswers({}); setShowResults(false); }}>Realizar</Button>
                    <IconButton icon={<FiTrash2 />} size="xs" colorScheme="red" onClick={() => deleteTest(t.id)} />
                  </HStack>
                </Flex>
              ))}
            </VStack>
          )}

          <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Nuevo Test</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl><FormLabel>Nombre del test</FormLabel><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></FormControl>
                  <Box w="100%">
                    <Text fontWeight="bold" mb={2}>Agregar Pregunta</Text>
                    <Input mb={2} placeholder="Pregunta" value={questionForm.text} onChange={(e) => setQuestionForm((q) => ({ ...q, text: e.target.value }))} />
                    {questionForm.options.map((opt, i) => (
                      <HStack key={i} mb={1}>
                        <Box w="20px" h="20px" borderRadius="full" bg={questionForm.correct === i ? 'green.500' : 'gray.300'} cursor="pointer" onClick={() => setQuestionForm((q) => ({ ...q, correct: i }))} />
                        <Input size="sm" placeholder={`Opción ${i + 1}`} value={opt} onChange={(e) => { const opts = [...questionForm.options]; opts[i] = e.target.value; setQuestionForm((q) => ({ ...q, options: opts })); }} />
                      </HStack>
                    ))}
                    <Text fontSize="xs" color="gray.500" mt={1}>Círculo verde = respuesta correcta</Text>
                    <Button size="sm" mt={2} onClick={addQuestion}>Agregar Pregunta</Button>
                  </Box>
                  <Text fontSize="sm" color="gray.500">{form.questions.length} preguntas agregadas</Text>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
                <Button onClick={saveTest} isDisabled={!form.name || form.questions.length === 0}>Crear Test</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )}
    </Box>
  );
}

// ===== SUPUESTOS PRACTICOS MANAGER =====
function SupuestosPracticosManager() {
  const { supuestosPracticos, addSupuestoPractico, updateSupuestoPractico, deleteSupuestoPractico } = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ titulo: '', materia: '', fecha: '', puntuacion: '', tiempoEmpleado: '', completado: false, notas: '' });
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  const stats = useMemo(() => {
    const total = supuestosPracticos.length;
    const completados = supuestosPracticos.filter((sp) => sp.completado).length;
    const puntuaciones = supuestosPracticos.filter((sp) => sp.puntuacion !== '' && sp.puntuacion !== undefined).map((sp) => Number(sp.puntuacion));
    const media = puntuaciones.length > 0 ? (puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length).toFixed(1) : 0;
    return { total, completados, media };
  }, [supuestosPracticos]);

  const openNew = () => { setEditing(null); setForm({ titulo: '', materia: '', fecha: '', puntuacion: '', tiempoEmpleado: '', completado: false, notas: '' }); onOpen(); };
  const openEdit = (sp) => { setEditing(sp); setForm({ ...sp }); onOpen(); };
  const save = () => {
    const data = { ...form, puntuacion: form.puntuacion !== '' ? Number(form.puntuacion) : '' };
    if (editing) updateSupuestoPractico(editing.id, data);
    else addSupuestoPractico(data);
    onClose();
  };

  return (
    <Box>
      <Flex justify="space-between" mb={4}>
        <Text fontWeight="bold">Supuestos Prácticos</Text>
        <Button leftIcon={<FiPlus />} size="sm" onClick={openNew}>Nuevo Supuesto</Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Total Supuestos</StatLabel><StatNumber>{stats.total}</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Media Puntuación</StatLabel><StatNumber color={Number(stats.media) >= 5 ? 'green.500' : 'red.500'}>{stats.media}</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Completados</StatLabel><StatNumber>{stats.completados}/{stats.total}</StatNumber></Stat>
        </Box>
      </SimpleGrid>

      <VStack spacing={3} align="stretch">
        {supuestosPracticos.length === 0 && <Text color="gray.500" textAlign="center" py={4}>No hay supuestos prácticos</Text>}
        {supuestosPracticos.map((sp) => (
          <Flex key={sp.id} p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} justify="space-between" align="start">
            <Box flex={1}>
              <HStack mb={1} wrap="wrap">
                <Text fontWeight="bold">{sp.titulo}</Text>
                {sp.materia && <Badge colorScheme="purple">{sp.materia}</Badge>}
                {sp.completado && <Badge colorScheme="green">Completado</Badge>}
              </HStack>
              <HStack spacing={4} fontSize="sm" color="gray.500" wrap="wrap">
                {sp.fecha && <Text>📅 {sp.fecha}</Text>}
                {sp.puntuacion !== '' && sp.puntuacion !== undefined && <Text>⭐ {sp.puntuacion}/10</Text>}
                {sp.tiempoEmpleado && <Text>⏱ {sp.tiempoEmpleado}</Text>}
              </HStack>
              {sp.notas && <Text fontSize="sm" mt={1} color="gray.400">{sp.notas}</Text>}
            </Box>
            <HStack>
              <IconButton icon={<FiEdit3 />} size="xs" onClick={() => openEdit(sp)} />
              <IconButton icon={<FiTrash2 />} size="xs" colorScheme="red" onClick={() => deleteSupuestoPractico(sp.id)} />
            </HStack>
          </Flex>
        ))}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? 'Editar Supuesto' : 'Nuevo Supuesto'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl><FormLabel>Título</FormLabel><Input value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} /></FormControl>
              <FormControl><FormLabel>Asignatura / Materia</FormLabel><Input value={form.materia} onChange={(e) => setForm((f) => ({ ...f, materia: e.target.value }))} /></FormControl>
              <Grid templateColumns="1fr 1fr" gap={4} w="100%">
                <FormControl><FormLabel>Fecha</FormLabel><Input type="date" value={form.fecha} onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))} /></FormControl>
                <FormControl><FormLabel>Puntuación (0-10)</FormLabel><NumberInput min={0} max={10} value={form.puntuacion} onChange={(v) => setForm((f) => ({ ...f, puntuacion: v }))}><NumberInputField /></NumberInput></FormControl>
              </Grid>
              <FormControl><FormLabel>Tiempo empleado</FormLabel><Input placeholder="ej. 2h 30min" value={form.tiempoEmpleado} onChange={(e) => setForm((f) => ({ ...f, tiempoEmpleado: e.target.value }))} /></FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">¿Completado?</FormLabel>
                <Switch colorScheme="green" isChecked={form.completado} onChange={(e) => setForm((f) => ({ ...f, completado: e.target.checked }))} />
              </FormControl>
              <FormControl><FormLabel>Notas</FormLabel><Textarea value={form.notas} onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))} rows={3} /></FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button onClick={save} isDisabled={!form.titulo}>{editing ? 'Guardar' : 'Crear'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

// ===== SIMULACROS MANAGER =====
function SimulacrosManager() {
  const { simulacros, addSimulacro, updateSimulacro, deleteSimulacro, convocatoria } = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ titulo: '', fecha: '', puntuacion: '', tiempoLimite: '', tiempoEmpleado: '', aprobado: false, numPreguntas: '', aciertos: '', errores: '', blancos: '', notas: '' });
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const mediaAprobar = Number(convocatoria.mediasAprobar) || 70;

  const stats = useMemo(() => {
    const total = simulacros.length;
    const puntuaciones = simulacros.filter((s) => s.puntuacion !== '' && s.puntuacion !== undefined).map((s) => Number(s.puntuacion));
    const media = puntuaciones.length > 0 ? (puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length).toFixed(1) : 0;
    const aprobados = simulacros.filter((s) => s.aprobado).length;
    const mejor = puntuaciones.length > 0 ? Math.max(...puntuaciones) : 0;
    return { total, media, aprobados, mejor };
  }, [simulacros]);

  const openNew = () => { setEditing(null); setForm({ titulo: '', fecha: '', puntuacion: '', tiempoLimite: '', tiempoEmpleado: '', aprobado: false, numPreguntas: '', aciertos: '', errores: '', blancos: '', notas: '' }); onOpen(); };
  const openEdit = (sm) => { setEditing(sm); setForm({ ...sm }); onOpen(); };
  const save = () => {
    const puntuacion = form.puntuacion !== '' ? Number(form.puntuacion) : '';
    const data = { ...form, puntuacion, aprobado: puntuacion >= mediaAprobar };
    if (editing) updateSimulacro(editing.id, data);
    else addSimulacro(data);
    onClose();
  };

  return (
    <Box>
      <Flex justify="space-between" mb={4}>
        <Text fontWeight="bold">Simulacros</Text>
        <Button leftIcon={<FiPlus />} size="sm" onClick={openNew}>Nuevo Simulacro</Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Total Simulacros</StatLabel><StatNumber>{stats.total}</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Media Puntuación</StatLabel><StatNumber color={Number(stats.media) >= mediaAprobar ? 'green.500' : 'red.500'}>{stats.media}%</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>% Aprobados</StatLabel><StatNumber>{stats.total > 0 ? Math.round((stats.aprobados / stats.total) * 100) : 0}%</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Mejor Puntuación</StatLabel><StatNumber color="green.500">{stats.mejor}%</StatNumber></Stat>
        </Box>
      </SimpleGrid>

      <VStack spacing={3} align="stretch">
        {simulacros.length === 0 && <Text color="gray.500" textAlign="center" py={4}>No hay simulacros</Text>}
        {simulacros.map((sm) => (
          <Flex key={sm.id} p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} justify="space-between" align="start">
            <Box flex={1}>
              <HStack mb={1} wrap="wrap">
                <Text fontWeight="bold">{sm.titulo}</Text>
                <Badge colorScheme={sm.aprobado ? 'green' : 'red'}>{sm.aprobado ? 'Aprobado' : 'No aprobado'}</Badge>
              </HStack>
              <HStack spacing={4} fontSize="sm" color="gray.500" wrap="wrap">
                {sm.fecha && <Text>📅 {sm.fecha}</Text>}
                {sm.puntuacion !== '' && sm.puntuacion !== undefined && <Text>⭐ {sm.puntuacion}%</Text>}
                {sm.numPreguntas && <Text>📝 {sm.numPreguntas} preguntas</Text>}
                {sm.tiempoEmpleado && <Text>⏱ {sm.tiempoEmpleado}min</Text>}
              </HStack>
              {(sm.aciertos || sm.errores || sm.blancos) && (
                <HStack spacing={3} mt={1} fontSize="xs" color="gray.400">
                  {sm.aciertos && <Badge colorScheme="green">✓ {sm.aciertos}</Badge>}
                  {sm.errores && <Badge colorScheme="red">✗ {sm.errores}</Badge>}
                  {sm.blancos && <Badge colorScheme="gray">○ {sm.blancos}</Badge>}
                </HStack>
              )}
              {sm.notas && <Text fontSize="sm" mt={1} color="gray.400">{sm.notas}</Text>}
            </Box>
            <HStack>
              <IconButton icon={<FiEdit3 />} size="xs" onClick={() => openEdit(sm)} />
              <IconButton icon={<FiTrash2 />} size="xs" colorScheme="red" onClick={() => deleteSimulacro(sm.id)} />
            </HStack>
          </Flex>
        ))}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? 'Editar Simulacro' : 'Nuevo Simulacro'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl><FormLabel>Título</FormLabel><Input value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} /></FormControl>
              <Grid templateColumns="1fr 1fr" gap={4} w="100%">
                <FormControl><FormLabel>Fecha</FormLabel><Input type="date" value={form.fecha} onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))} /></FormControl>
                <FormControl><FormLabel>Puntuación (%)</FormLabel><NumberInput min={0} max={100} value={form.puntuacion} onChange={(v) => setForm((f) => ({ ...f, puntuacion: v }))}><NumberInputField /></NumberInput></FormControl>
              </Grid>
              <Grid templateColumns="1fr 1fr" gap={4} w="100%">
                <FormControl><FormLabel>Tiempo límite (min)</FormLabel><NumberInput min={0} value={form.tiempoLimite} onChange={(v) => setForm((f) => ({ ...f, tiempoLimite: v }))}><NumberInputField /></NumberInput></FormControl>
                <FormControl><FormLabel>Tiempo empleado (min)</FormLabel><NumberInput min={0} value={form.tiempoEmpleado} onChange={(v) => setForm((f) => ({ ...f, tiempoEmpleado: v }))}><NumberInputField /></NumberInput></FormControl>
              </Grid>
              <Grid templateColumns="1fr 1fr 1fr" gap={4} w="100%">
                <FormControl><FormLabel>Aciertos</FormLabel><NumberInput min={0} value={form.aciertos} onChange={(v) => setForm((f) => ({ ...f, aciertos: v }))}><NumberInputField /></NumberInput></FormControl>
                <FormControl><FormLabel>Errores</FormLabel><NumberInput min={0} value={form.errores} onChange={(v) => setForm((f) => ({ ...f, errores: v }))}><NumberInputField /></NumberInput></FormControl>
                <FormControl><FormLabel>Blancos</FormLabel><NumberInput min={0} value={form.blancos} onChange={(v) => setForm((f) => ({ ...f, blancos: v }))}><NumberInputField /></NumberInput></FormControl>
              </Grid>
              <FormControl><FormLabel>Nº de preguntas</FormLabel><NumberInput min={0} value={form.numPreguntas} onChange={(v) => setForm((f) => ({ ...f, numPreguntas: v }))}><NumberInputField /></NumberInput></FormControl>
              <FormControl><FormLabel>Notas</FormLabel><Textarea value={form.notas} onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))} rows={3} /></FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button onClick={save} isDisabled={!form.titulo}>{editing ? 'Guardar' : 'Crear'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

// ===== ESTADISTICAS OPOSICIONES =====
function EstadisticasOposiciones() {
  const { studySessions, testResults, temarios, supuestosPracticos, simulacros } = useStore();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { textColor, gridColor, tooltipBg, tooltipBorder, tooltipColor } = useRechartStyles();

  const totalSeconds = studySessions.reduce((a, s) => a + (s.seconds || (s.duration || 0) * 60), 0);
  const totalHours = +(totalSeconds / 3600).toFixed(1);
  const avgTestScore = testResults.length > 0 ? Math.round(testResults.reduce((a, r) => a + r.percentage, 0) / testResults.length) : 0;
  const totalTopics = temarios.reduce((a, t) => a + (t.topics || []).length, 0);
  const completedTopics = temarios.reduce((a, t) => a + (t.topics || []).filter((tp) => tp.completed).length, 0);
  const pctCompleted = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const avgSupuestos = useMemo(() => {
    const puntuaciones = supuestosPracticos.filter((sp) => sp.puntuacion !== '' && sp.puntuacion !== undefined).map((sp) => Number(sp.puntuacion));
    return puntuaciones.length > 0 ? +(puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length).toFixed(1) : 0;
  }, [supuestosPracticos]);

  const avgSimulacros = useMemo(() => {
    const puntuaciones = simulacros.filter((s) => s.puntuacion !== '' && s.puntuacion !== undefined).map((s) => Number(s.puntuacion));
    return puntuaciones.length > 0 ? +(puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length).toFixed(1) : 0;
  }, [simulacros]);

  const combinedAvg = useMemo(() => {
    const allScores = [];
    if (avgTestScore > 0) allScores.push(avgTestScore);
    if (avgSupuestos > 0) allScores.push(avgSupuestos * 10);
    if (avgSimulacros > 0) allScores.push(avgSimulacros);
    return allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
  }, [avgTestScore, avgSupuestos, avgSimulacros]);

  const pieData = [
    { name: 'Aciertos Tests', value: testResults.reduce((a, r) => a + r.correct, 0) },
    { name: 'Fallos Tests', value: testResults.reduce((a, r) => a + (r.total - r.correct), 0) },
  ].filter((d) => d.value > 0);
  const COLORS = ['#48BB78', '#F56565'];

  return (
    <VStack spacing={6} align="stretch">
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Tiempo Total</StatLabel><StatNumber>{totalHours}h</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Sesiones</StatLabel><StatNumber>{studySessions.length}</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Media Tests</StatLabel><StatNumber color={avgTestScore >= 70 ? 'green.500' : 'red.500'}>{avgTestScore}%</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Temario</StatLabel><StatNumber>{pctCompleted}%</StatNumber></Stat>
          <Progress value={pctCompleted} size="sm" colorScheme="blue" mt={2} />
        </Box>
      </SimpleGrid>

      <Divider />

      <Text fontWeight="bold" fontSize="lg">Medias Combinadas</Text>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Media Tests</StatLabel><StatNumber color={avgTestScore >= 70 ? 'green.500' : 'red.500'}>{avgTestScore}%</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Media Supuestos</StatLabel><StatNumber color={avgSupuestos >= 5 ? 'green.500' : 'red.500'}>{avgSupuestos}/10</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Media Simulacros</StatLabel><StatNumber color={avgSimulacros >= 70 ? 'green.500' : 'red.500'}>{avgSimulacros}%</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Media General</StatLabel><StatNumber color={combinedAvg >= 70 ? 'green.500' : 'red.500'}>{combinedAvg}%</StatNumber></Stat>
        </Box>
      </SimpleGrid>

      <Divider />

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
        {studySessions.length > 0 && (
          <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
            <Text fontWeight="bold" mb={4}>Sesiones de Estudio</Text>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={studySessions.slice(-10)}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: textColor }} />
                <YAxis tick={{ fontSize: 11, fill: textColor }} />
                <RechartsTooltip contentStyle={{ bg: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, color: tooltipColor }} />
                <Bar dataKey="duration" fill="#4299E1" radius={[4, 4, 0, 0]} name="Minutos" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {pieData.length > 0 && (
          <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
            <Text fontWeight="bold" mb={4}>Tests - Resultados</Text>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Legend />
                <RechartsTooltip contentStyle={{ bg: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, color: tooltipColor }} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Grid>
    </VStack>
  );
}

// ===== MAIN OPOSICIONES COMPONENT =====
export default function Oposiciones() {
  const { addStudySession, addXP } = useStore();

  const handleStudyRegister = (data) => {
    const temario = useStore.getState().temarios.find((t) => t.id === data.temarioId);
    const topic = temario ? (temario.topics || []).find((t) => t.id === data.topicId) : null;
    addStudySession({ ...data, type: 'study', topicName: topic?.name || '', temarioName: temario?.name || '' });
    addXP(10);
  };

  return (
    <Tabs variant="enclosed" colorScheme="blue">
      <TabList>
        <Tab><FiFileText style={{ marginRight: 8 }} />Convocatoria</Tab>
        <Tab><FiBook style={{ marginRight: 8 }} />Temarios</Tab>
        <Tab><FiCheckCircle style={{ marginRight: 8 }} />Tests</Tab>
        <Tab><FiEdit style={{ marginRight: 8 }} />Supuestos Prácticos</Tab>
        <Tab><FiAward style={{ marginRight: 8 }} />Simulacros</Tab>
        <Tab><FiBarChart2 style={{ marginRight: 8 }} />Estadísticas</Tab>
      </TabList>
      <TabPanels>
        <TabPanel px={0}><ConvocatoriaForm /></TabPanel>
        <TabPanel px={0}>
          <VStack spacing={6} align="stretch">
            <Cronometro onRegister={handleStudyRegister} />
            <TemarioManager />
          </VStack>
        </TabPanel>
        <TabPanel px={0}><TestManager /></TabPanel>
        <TabPanel px={0}><SupuestosPracticosManager /></TabPanel>
        <TabPanel px={0}><SimulacrosManager /></TabPanel>
        <TabPanel px={0}><EstadisticasOposiciones /></TabPanel>
      </TabPanels>
    </Tabs>
  );
}
