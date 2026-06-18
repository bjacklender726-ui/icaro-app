import React, { useState, useMemo } from 'react';
import { Box, Grid, Text, Flex, VStack, HStack, Badge, Button, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, Input, Textarea, Select, Progress, Stat, StatLabel, StatNumber, SimpleGrid, useColorModeValue, Tabs, TabList, TabPanels, Tab, TabPanel, Tooltip, Tag, Wrap, WrapItem, Switch, NumberInput, NumberInputField, Divider } from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiEdit3, FiPlay, FiPause, FiSquare, FiCheck, FiClock, FiBookOpen, FiTarget, FiAward, FiFileText, FiBook, FiCheckCircle, FiBarChart2, FiEdit, FiLink, FiExternalLink, FiImage, FiVideo, FiGrid, FiDownload, FiUpload } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import useStore from '../../store/useStore';
import { formatDate } from '../../utils/helpers';
import { useRechartStyles } from '../../utils/rechartStyles';

const exportSectionData = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

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

// ===== CONVOCATORIA MANAGER =====
function ConvocatoriaManager() {
  const { convocatoria, addConvocatoria, updateConvocatoria, deleteConvocatoria } = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nombre: '', organismo: '', plazoInscripcionInicio: '', plazoInscripcionFin: '',
    inscrito: false, fechaAdmitidos: '', listasProvisionales: '', fechaExamen: '',
    lugarExamen: '', tasa: '', numeroPlazas: '', mediasAprobar: '', notas: '',
  });
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const emptyForm = {
    nombre: '', organismo: '', plazoInscripcionInicio: '', plazoInscripcionFin: '',
    inscrito: false, fechaAdmitidos: '', listasProvisionales: '', fechaExamen: '',
    lugarExamen: '', tasa: '', numeroPlazas: '', mediasAprobar: '', notas: '',
  };

  const openNew = () => { setEditing(null); setForm(emptyForm); onOpen(); };
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); onOpen(); };
  const save = () => {
    if (editing) updateConvocatoria(editing.id, form);
    else addConvocatoria(form);
    onClose();
  };

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <Box>
      <Flex justify="space-between" mb={4}>
        <Text fontWeight="bold">Convocatorias</Text>
        <Button leftIcon={<FiPlus />} size="sm" onClick={openNew}>Nueva Convocatoria</Button>
      </Flex>
      <VStack spacing={4} align="stretch">
        {convocatoria.length === 0 && <Text color="gray.500" textAlign="center" py={4}>No hay convocatorias creadas</Text>}
        {convocatoria.map((c) => (
          <Box key={c.id} p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
            <Flex justify="space-between" align="start">
              <Box flex={1}>
                <HStack mb={2} wrap="wrap">
                  <Text fontWeight="bold">{c.nombre || 'Sin nombre'}</Text>
                  {c.organismo && <Badge colorScheme="blue">{c.organismo}</Badge>}
                  {c.inscrito && <Badge colorScheme="green">Inscrito</Badge>}
                </HStack>
                <HStack spacing={4} fontSize="sm" color="gray.500" wrap="wrap">
                  {c.fechaExamen && <Text>Examen: {c.fechaExamen}</Text>}
                  {c.plazoInscripcionInicio && c.plazoInscripcionFin && <Text>Inscripción: {c.plazoInscripcionInicio} → {c.plazoInscripcionFin}</Text>}
                  {c.lugarExamen && <Text>Lugar: {c.lugarExamen}</Text>}
                </HStack>
                <HStack spacing={3} mt={1} fontSize="sm" color="gray.400" wrap="wrap">
                  {c.tasa && <Text>Tasa: {c.tasa}€</Text>}
                  {c.numeroPlazas && <Text>Plazas: {c.numeroPlazas}</Text>}
                  {c.mediasAprobar && <Text>Media mín: {c.mediasAprobar}</Text>}
                </HStack>
                {c.notas && <Text fontSize="sm" mt={1} color="gray.400">{c.notas}</Text>}
              </Box>
              <HStack>
                <IconButton icon={<FiEdit3 />} size="xs" onClick={() => openEdit(c)} />
                <IconButton icon={<FiTrash2 />} size="xs" colorScheme="red" onClick={() => deleteConvocatoria(c.id)} />
              </HStack>
            </Flex>
          </Box>
        ))}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? 'Editar Convocatoria' : 'Nueva Convocatoria'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4} w="100%">
                <FormControl><FormLabel>Nombre de la oposición</FormLabel><Input value={form.nombre} onChange={(e) => handleChange('nombre', e.target.value)} /></FormControl>
                <FormControl><FormLabel>Organismo</FormLabel><Input value={form.organismo} onChange={(e) => handleChange('organismo', e.target.value)} /></FormControl>
                <FormControl><FormLabel>Plazo inscripción inicio</FormLabel><Input type="date" value={form.plazoInscripcionInicio} onChange={(e) => handleChange('plazoInscripcionInicio', e.target.value)} /></FormControl>
                <FormControl><FormLabel>Plazo inscripción fin</FormLabel><Input type="date" value={form.plazoInscripcionFin} onChange={(e) => handleChange('plazoInscripcionFin', e.target.value)} /></FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">¿Estás inscrito?</FormLabel>
                  <Switch colorScheme="green" isChecked={form.inscrito} onChange={(e) => handleChange('inscrito', e.target.checked)} />
                </FormControl>
                <FormControl><FormLabel>Fecha de admitidos</FormLabel><Input type="date" value={form.fechaAdmitidos} onChange={(e) => handleChange('fechaAdmitidos', e.target.value)} /></FormControl>
                <FormControl><FormLabel>Listas provisionales</FormLabel><Input type="date" value={form.listasProvisionales} onChange={(e) => handleChange('listasProvisionales', e.target.value)} /></FormControl>
                <FormControl><FormLabel>Fecha de examen</FormLabel><Input type="date" value={form.fechaExamen} onChange={(e) => handleChange('fechaExamen', e.target.value)} /></FormControl>
                <FormControl><FormLabel>Lugar del examen</FormLabel><Input value={form.lugarExamen} onChange={(e) => handleChange('lugarExamen', e.target.value)} /></FormControl>
                <FormControl><FormLabel>Tasa a pagar (€)</FormLabel><NumberInput value={form.tasa} onChange={(v) => handleChange('tasa', v)}><NumberInputField /></NumberInput></FormControl>
                <FormControl><FormLabel>Nº de plazas</FormLabel><NumberInput value={form.numeroPlazas} onChange={(v) => handleChange('numeroPlazas', v)}><NumberInputField /></NumberInput></FormControl>
                <FormControl><FormLabel>Media mínima para aprobar</FormLabel><NumberInput value={form.mediasAprobar} onChange={(v) => handleChange('mediasAprobar', v)}><NumberInputField /></NumberInput></FormControl>
              </Grid>
              <FormControl w="100%"><FormLabel>Notas adicionales</FormLabel><Textarea value={form.notas} onChange={(e) => handleChange('notas', e.target.value)} rows={3} /></FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button onClick={save} isDisabled={!form.nombre}>{editing ? 'Guardar' : 'Crear'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

// ===== TEMARIO MANAGER =====
function TemarioManager({ selectedConvId }) {
  const { temarios, addTemario, updateTemario, deleteTemario, studySessions } = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', topics: [] });
  const [topicForm, setTopicForm] = useState({ name: '' });
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const rowBg = useColorModeValue('gray.50', 'gray.700');
  const importRef = React.useRef(null);

  const filteredTemarios = useMemo(() =>
    temarios.filter((t) => !selectedConvId || t.convocatoriaId === selectedConvId),
    [temarios, selectedConvId]
  );

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
    else addTemario({ ...form, convocatoriaId: selectedConvId || '' });
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

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const items = Array.isArray(data) ? data : [data];
        items.forEach((item) => {
          const { id, createdAt, ...rest } = item;
          addTemario({ ...rest, convocatoriaId: selectedConvId || '' });
        });
      } catch (err) { console.error('Error importing temarios:', err); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Box>
      <Flex justify="space-between" mb={4}>
        <Text fontWeight="bold">Temarios</Text>
        <HStack>
          <Button leftIcon={<FiDownload />} size="sm" variant="outline" onClick={() => exportSectionData(filteredTemarios, 'temarios.json')}>Exportar</Button>
          <Button leftIcon={<FiUpload />} size="sm" variant="outline" onClick={() => importRef.current?.click()}>Importar</Button>
          <input type="file" ref={importRef} accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          <Button leftIcon={<FiPlus />} size="sm" onClick={openNew}>Nuevo Temario</Button>
        </HStack>
      </Flex>
      <VStack spacing={4} align="stretch">
        {filteredTemarios.length === 0 && <Text color="gray.500" textAlign="center" py={4}>No hay temarios creados</Text>}
        {filteredTemarios.map((t) => {
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
function TestManager({ selectedConvId }) {
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
  const importRef = React.useRef(null);

  const filteredTests = useMemo(() =>
    tests.filter((t) => !selectedConvId || t.convocatoriaId === selectedConvId),
    [tests, selectedConvId]
  );

  const addQuestion = () => {
    if (questionForm.text && questionForm.options.filter((o) => o).length >= 2) {
      setForm((f) => ({ ...f, questions: [...f.questions, { ...questionForm, id: Date.now().toString() }] }));
      setQuestionForm({ text: '', options: ['', '', '', ''], correct: 0 });
    }
  };

  const saveTest = () => { addTest({ ...form, convocatoriaId: selectedConvId || '' }); setForm({ name: '', questions: [] }); onClose(); };

  const submitTest = () => {
    if (!activeTest) return;
    let correct = 0;
    activeTest.questions.forEach((q) => { if (answers[q.id] === q.correct) correct++; });
    const result = { testId: activeTest.id, testName: activeTest.name, total: activeTest.questions.length, correct, percentage: Math.round((correct / activeTest.questions.length) * 100), date: new Date().toISOString().split('T')[0] };
    addTestResult(result);
    addXP(Math.round(result.percentage / 10));
    setShowResults(true);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const items = Array.isArray(data) ? data : [data];
        items.forEach((item) => {
          const { id, createdAt, ...rest } = item;
          addTest({ ...rest, convocatoriaId: selectedConvId || '' });
        });
      } catch (err) { console.error('Error importing tests:', err); }
    };
    reader.readAsText(file);
    e.target.value = '';
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
            <HStack>
              <Button leftIcon={<FiDownload />} size="sm" variant="outline" onClick={() => exportSectionData(filteredTests, 'tests.json')}>Exportar</Button>
              <Button leftIcon={<FiUpload />} size="sm" variant="outline" onClick={() => importRef.current?.click()}>Importar</Button>
              <input type="file" ref={importRef} accept=".json" style={{ display: 'none' }} onChange={handleImport} />
              <Button leftIcon={<FiPlus />} size="sm" onClick={() => { setForm({ name: '', questions: [] }); onOpen(); }}>Nuevo Test</Button>
            </HStack>
          </Flex>
          {filteredTests.length === 0 ? <Text color="gray.500" textAlign="center" py={4}>No hay tests creados</Text> : (
            <VStack spacing={3} align="stretch">
              {filteredTests.map((t) => (
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
function SupuestosPracticosManager({ selectedConvId }) {
  const { supuestosPracticos, addSupuestoPractico, updateSupuestoPractico, deleteSupuestoPractico } = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ titulo: '', materia: '', fecha: '', puntuacion: '', tiempoEmpleado: '', completado: false, notas: '' });
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const importRef = React.useRef(null);

  const filteredSupuestos = useMemo(() =>
    supuestosPracticos.filter((sp) => !selectedConvId || sp.convocatoriaId === selectedConvId),
    [supuestosPracticos, selectedConvId]
  );

  const stats = useMemo(() => {
    const total = filteredSupuestos.length;
    const completados = filteredSupuestos.filter((sp) => sp.completado).length;
    const puntuaciones = filteredSupuestos.filter((sp) => sp.puntuacion !== '' && sp.puntuacion !== undefined).map((sp) => Number(sp.puntuacion));
    const media = puntuaciones.length > 0 ? (puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length).toFixed(1) : 0;
    return { total, completados, media };
  }, [filteredSupuestos]);

  const openNew = () => { setEditing(null); setForm({ titulo: '', materia: '', fecha: '', puntuacion: '', tiempoEmpleado: '', completado: false, notas: '' }); onOpen(); };
  const openEdit = (sp) => { setEditing(sp); setForm({ ...sp }); onOpen(); };
  const save = () => {
    const data = { ...form, puntuacion: form.puntuacion !== '' ? Number(form.puntuacion) : '' };
    if (editing) updateSupuestoPractico(editing.id, data);
    else addSupuestoPractico({ ...data, convocatoriaId: selectedConvId || '' });
    onClose();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const items = Array.isArray(data) ? data : [data];
        items.forEach((item) => {
          const { id, createdAt, ...rest } = item;
          addSupuestoPractico({ ...rest, convocatoriaId: selectedConvId || '' });
        });
      } catch (err) { console.error('Error importing supuestos:', err); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Box>
      <Flex justify="space-between" mb={4}>
        <Text fontWeight="bold">Supuestos Prácticos</Text>
        <HStack>
          <Button leftIcon={<FiDownload />} size="sm" variant="outline" onClick={() => exportSectionData(filteredSupuestos, 'supuestos_practicos.json')}>Exportar</Button>
          <Button leftIcon={<FiUpload />} size="sm" variant="outline" onClick={() => importRef.current?.click()}>Importar</Button>
          <input type="file" ref={importRef} accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          <Button leftIcon={<FiPlus />} size="sm" onClick={openNew}>Nuevo Supuesto</Button>
        </HStack>
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
        {filteredSupuestos.length === 0 && <Text color="gray.500" textAlign="center" py={4}>No hay supuestos prácticos</Text>}
        {filteredSupuestos.map((sp) => (
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
function SimulacrosManager({ selectedConvId }) {
  const { simulacros, addSimulacro, updateSimulacro, deleteSimulacro } = useStore();
  const convocatoria = useStore((s) => s.convocatoria);
  const mediaAprobar = Number(convocatoria[0]?.mediasAprobar) || 70;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ titulo: '', fecha: '', puntuacion: '', tiempoLimite: '', tiempoEmpleado: '', aprobado: false, numPreguntas: '', aciertos: '', errores: '', blancos: '', notas: '' });
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const importRef = React.useRef(null);

  const filteredSimulacros = useMemo(() =>
    simulacros.filter((s) => !selectedConvId || s.convocatoriaId === selectedConvId),
    [simulacros, selectedConvId]
  );

  const stats = useMemo(() => {
    const total = filteredSimulacros.length;
    const puntuaciones = filteredSimulacros.filter((s) => s.puntuacion !== '' && s.puntuacion !== undefined).map((s) => Number(s.puntuacion));
    const media = puntuaciones.length > 0 ? (puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length).toFixed(1) : 0;
    const aprobados = filteredSimulacros.filter((s) => s.aprobado).length;
    const mejor = puntuaciones.length > 0 ? Math.max(...puntuaciones) : 0;
    return { total, media, aprobados, mejor };
  }, [filteredSimulacros]);

  const openNew = () => { setEditing(null); setForm({ titulo: '', fecha: '', puntuacion: '', tiempoLimite: '', tiempoEmpleado: '', aprobado: false, numPreguntas: '', aciertos: '', errores: '', blancos: '', notas: '' }); onOpen(); };
  const openEdit = (sm) => { setEditing(sm); setForm({ ...sm }); onOpen(); };
  const save = () => {
    const puntuacion = form.puntuacion !== '' ? Number(form.puntuacion) : '';
    const data = { ...form, puntuacion, aprobado: puntuacion >= mediaAprobar };
    if (editing) updateSimulacro(editing.id, data);
    else addSimulacro({ ...data, convocatoriaId: selectedConvId || '' });
    onClose();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const items = Array.isArray(data) ? data : [data];
        items.forEach((item) => {
          const { id, createdAt, ...rest } = item;
          addSimulacro({ ...rest, convocatoriaId: selectedConvId || '' });
        });
      } catch (err) { console.error('Error importing simulacros:', err); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Box>
      <Flex justify="space-between" mb={4}>
        <Text fontWeight="bold">Simulacros</Text>
        <HStack>
          <Button leftIcon={<FiDownload />} size="sm" variant="outline" onClick={() => exportSectionData(filteredSimulacros, 'simulacros.json')}>Exportar</Button>
          <Button leftIcon={<FiUpload />} size="sm" variant="outline" onClick={() => importRef.current?.click()}>Importar</Button>
          <input type="file" ref={importRef} accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          <Button leftIcon={<FiPlus />} size="sm" onClick={openNew}>Nuevo Simulacro</Button>
        </HStack>
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
        {filteredSimulacros.length === 0 && <Text color="gray.500" textAlign="center" py={4}>No hay simulacros</Text>}
        {filteredSimulacros.map((sm) => (
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

// ===== PIZARRA MANAGER (multi-board) =====
function PizarraManager({ selectedConvId }) {
  const { oposicionesPizarra, addOposicionesBoard, deleteOposicionesBoard, renameOposicionesBoard, addOposicionesPizarraItem, updateOposicionesPizarraItem, deleteOposicionesPizarraItem, addAgendaTask, temarios } = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isTaskOpen, onOpen: onTaskOpen, onClose: onTaskClose } = useDisclosure();
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ type: 'text', title: '', content: '', linkedTo: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', date: '' });
  const [taskItem, setTaskItem] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [newBoardName, setNewBoardName] = useState('');
  const [renameBoardName, setRenameBoardName] = useState('');
  const [renamingBoard, setRenamingBoard] = useState(null);
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const boardBg = useColorModeValue('gray.50', 'gray.900');
  const rowBg = useColorModeValue('gray.50', 'gray.700');
  const importRef = React.useRef(null);

  const convBoards = useMemo(() => {
    if (!selectedConvId) {
      const all = {};
      Object.values(oposicionesPizarra).forEach((boards) => {
        Object.entries(boards).forEach(([bid, b]) => { all[bid] = b; });
      });
      return all;
    }
    return oposicionesPizarra[selectedConvId] || {};
  }, [oposicionesPizarra, selectedConvId]);

  const boardIds = Object.keys(convBoards);

  React.useEffect(() => {
    if (boardIds.length > 0 && !boardIds.includes(selectedBoardId)) {
      setSelectedBoardId(boardIds[0]);
    } else if (boardIds.length === 0) {
      setSelectedBoardId('');
    }
  }, [boardIds.join(','), selectedBoardId]);

  const currentBoard = selectedBoardId ? convBoards[selectedBoardId] : null;
  const items = currentBoard ? (currentBoard.items || []) : [];

  const linkedItems = useMemo(() => {
    if (!selectedBoardId || !selectedConvId) return [];
    return items;
  }, [items, selectedBoardId, selectedConvId]);

  const extractYouTubeId = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([^&?#]+)/);
    return match ? match[1] : null;
  };

  const handleCreateBoard = () => {
    if (!newBoardName.trim() || !selectedConvId) return;
    const bid = addOposicionesBoard(selectedConvId, newBoardName.trim());
    setSelectedBoardId(bid);
    setNewBoardName('');
  };

  const handleDeleteBoard = (bid) => {
    deleteOposicionesBoard(selectedConvId, bid);
    if (selectedBoardId === bid) setSelectedBoardId('');
  };

  const handleRenameBoard = (bid) => {
    if (!renameBoardName.trim()) return;
    renameOposicionesBoard(selectedConvId, bid, renameBoardName.trim());
    setRenamingBoard(null);
    setRenameBoardName('');
  };

  const openNew = () => { setEditing(null); setForm({ type: 'text', title: '', content: '', linkedTo: '' }); onOpen(); };
  const openEdit = (item) => { setEditing(item); setForm({ type: item.type, title: item.title, content: item.content, linkedTo: item.linkedTo || '' }); onOpen(); };
  const save = () => {
    if (!selectedBoardId) return;
    if (editing) updateOposicionesPizarraItem(selectedConvId, selectedBoardId, editing.id, form);
    else addOposicionesPizarraItem(selectedConvId, selectedBoardId, { ...form, position: { x: 50 + Math.random() * 200, y: 50 + Math.random() * 200 } });
    onClose();
  };

  const openTaskModal = (item) => {
    setTaskItem(item);
    setTaskForm({ title: item.title, description: '', date: new Date().toISOString().split('T')[0] });
    onTaskOpen();
  };

  const createTask = () => {
    addAgendaTask({ title: taskForm.title, description: taskForm.description, date: taskForm.date, completed: false });
    onTaskClose();
  };

  const handleCardMouseDown = (e, itemId) => {
    e.preventDefault();
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    setDragging(itemId);
    setDragOffset({ x: e.clientX - rect.left - (item.position?.x || 0), y: e.clientY - rect.top - (item.position?.y || 0) });
  };

  const handleBoardMouseMove = (e) => {
    if (!dragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - dragOffset.x);
    const y = Math.max(0, e.clientY - rect.top - dragOffset.y);
    updateOposicionesPizarraItem(selectedConvId, selectedBoardId, dragging, { position: { x, y } });
  };

  const handleBoardMouseUp = () => setDragging(null);

  const handleLimpiarPizarra = () => {
    if (!selectedBoardId) return;
    items.forEach((item) => {
      deleteOposicionesPizarraItem(selectedConvId, selectedBoardId, item.id);
    });
  };

  const handleActualizarDesdeTemarios = () => {
    if (!selectedBoardId || !selectedConvId) return;
    const filteredTemarios = temarios.filter((t) => t.convocatoriaId === selectedConvId);
    filteredTemarios.forEach((temario) => {
      (temario.topics || []).forEach((topic) => {
        const exists = items.some((i) => i.title === topic.name && i.type === 'text');
        if (!exists) {
          addOposicionesPizarraItem(selectedConvId, selectedBoardId, {
            type: 'text',
            title: topic.name,
            content: `Temario: ${temario.name}\n${topic.completed ? '✓ Completado' : 'Pendiente'}`,
            linkedTo: temario.name,
            position: { x: 50 + Math.random() * 400, y: 50 + Math.random() * 400 },
          });
        }
      });
    });
  };

  const renderContent = (item) => {
    if (item.type === 'youtube') {
      const videoId = extractYouTubeId(item.content);
      return videoId ? (
        <Box borderRadius="md" overflow="hidden" w="100%" maxW="220px">
          <Box as="iframe" src={`https://www.youtube.com/embed/${videoId}`} w="100%" h="125px" frameBorder="0" allowFullScreen title={item.title} />
        </Box>
      ) : <Text fontSize="sm" color="red.400">URL de YouTube no válida</Text>;
    }
    if (item.type === 'image') {
      return <Box as="img" src={item.content} alt={item.title} maxW="100%" maxH="160px" borderRadius="md" objectFit="contain" fallback={<Text fontSize="sm" color="red.400">No se pudo cargar la imagen</Text>} />;
    }
    if (item.type === 'link') {
      return <HStack><FiExternalLink /><Text as="a" href={item.content} target="_blank" rel="noopener noreferrer" color="blue.400" fontSize="sm" wordBreak="break-all">{item.content}</Text></HStack>;
    }
    return <Text fontSize="sm" whiteSpace="pre-wrap">{item.content}</Text>;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'youtube': return <FiVideo size={14} />;
      case 'link': return <FiLink size={14} />;
      case 'image': return <FiImage size={14} />;
      default: return <FiFileText size={14} />;
    }
  };

  const getTypeBadge = (type) => {
    const colors = { text: 'gray', link: 'blue', youtube: 'red', image: 'purple' };
    const labels = { text: 'Nota', link: 'Enlace', youtube: 'YouTube', image: 'Imagen' };
    return <Badge colorScheme={colors[type] || 'gray'}>{labels[type] || type}</Badge>;
  };

  const renderSVGLinks = () => {
    if (!currentBoard) return null;
    const linked = items.filter((i) => i.linkedTo);
    if (linked.length === 0) return null;
    return (
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        {linked.map((item) => {
          const target = items.find((i) => i.title === item.linkedTo && i.id !== item.id);
          if (!target) return null;
          const x1 = (item.position?.x || 0) + 120;
          const y1 = (item.position?.y || 0) + 20;
          const x2 = (target.position?.x || 0) + 120;
          const y2 = (target.position?.y || 0) + 20;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2 - 30;
          return (
            <path key={`${item.id}-${target.id}`} d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} stroke="#3182CE" strokeWidth="2" fill="none" strokeDasharray="5,5" opacity="0.6" />
          );
        })}
      </svg>
    );
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedBoardId) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const importItems = Array.isArray(data) ? data : [data];
        importItems.forEach((item) => {
          const { id, createdAt, ...rest } = item;
          addOposicionesPizarraItem(selectedConvId, selectedBoardId, { ...rest, position: rest.position || { x: 50 + Math.random() * 200, y: 50 + Math.random() * 200 } });
        });
      } catch (err) { console.error('Error importing pizarra:', err); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Box>
      <Flex justify="space-between" mb={4} align="center" wrap="wrap" gap={2}>
        <Text fontWeight="bold">Pizarra de Oposiciones</Text>
        <HStack>
          <Button leftIcon={<FiDownload />} size="sm" variant="outline" onClick={() => exportSectionData(items, 'pizarra.json')}>Exportar</Button>
          <Button leftIcon={<FiUpload />} size="sm" variant="outline" onClick={() => importRef.current?.click()}>Importar</Button>
          <input type="file" ref={importRef} accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        </HStack>
      </Flex>

      <Flex mb={4} align="center" gap={2} wrap="wrap">
        {selectedConvId ? (
          <>
            <Select size="sm" maxW="250px" value={selectedBoardId} onChange={(e) => setSelectedBoardId(e.target.value)}>
              <option value="">Seleccionar pizarra...</option>
              {boardIds.map((bid) => <option key={bid} value={bid}>{convBoards[bid].name}</option>)}
            </Select>
            <HStack>
              <Input size="sm" maxW="200px" placeholder="Nueva pizarra" value={newBoardName} onChange={(e) => setNewBoardName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()} />
              <Button size="sm" leftIcon={<FiPlus />} onClick={handleCreateBoard} isDisabled={!newBoardName.trim()}>Crear</Button>
            </HStack>
            {selectedBoardId && (
              <>
                {renamingBoard === selectedBoardId ? (
                  <HStack>
                    <Input size="sm" maxW="200px" value={renameBoardName} onChange={(e) => setRenameBoardName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRenameBoard(selectedBoardId)} />
                    <Button size="sm" onClick={() => handleRenameBoard(selectedBoardId)}>OK</Button>
                    <Button size="sm" variant="ghost" onClick={() => setRenamingBoard(null)}>Cancelar</Button>
                  </HStack>
                ) : (
                  <Button size="sm" variant="ghost" leftIcon={<FiEdit3 />} onClick={() => { setRenamingBoard(selectedBoardId); setRenameBoardName(currentBoard?.name || ''); }}>Renombrar</Button>
                )}
                <Button size="sm" variant="ghost" colorScheme="red" leftIcon={<FiTrash2 />} onClick={() => handleDeleteBoard(selectedBoardId)}>Eliminar pizarra</Button>
                <Button size="sm" leftIcon={<FiPlus />} onClick={openNew}>Nuevo Elemento</Button>
                <Button size="sm" variant="outline" colorScheme="orange" onClick={handleLimpiarPizarra}>Limpiar pizarra</Button>
                <Button size="sm" variant="outline" colorScheme="blue" onClick={handleActualizarDesdeTemarios}>Actualizar desde temarios</Button>
              </>
            )}
          </>
        ) : (
          <Text fontSize="sm" color="gray.500">Selecciona una convocatoria para usar la pizarra</Text>
        )}
      </Flex>

      {!selectedConvId ? (
        <Box p={8} bg={boardBg} borderRadius="xl" border="1px solid" borderColor={borderColor} textAlign="center">
          <Text color="gray.500">Selecciona una convocatoria para ver las pizarras</Text>
        </Box>
      ) : !selectedBoardId ? (
        <Box p={8} bg={boardBg} borderRadius="xl" border="1px solid" borderColor={borderColor} textAlign="center">
          <Text color="gray.500">{boardIds.length === 0 ? 'Crea una pizarra para empezar' : 'Selecciona una pizarra'}</Text>
        </Box>
      ) : (
        <Box position="relative" w="100%" minH="500px" bg={boardBg} borderRadius="xl" border="1px solid" borderColor={borderColor} overflow="auto"
          onMouseMove={handleBoardMouseMove} onMouseUp={handleBoardMouseUp} onMouseLeave={handleBoardMouseUp}>
          {renderSVGLinks()}
          {items.length === 0 && <Text color="gray.500" textAlign="center" py={4} position="absolute" w="100%" top="50%" transform="translateY(-50%)">No hay elementos en la pizarra</Text>}
          {items.map((item) => (
            <Box key={item.id} position="absolute" left={`${item.position?.x || 0}px`} top={`${item.position?.y || 0}px`}
              w="240px" p={3} bg={bg} borderRadius="lg" boxShadow="md" border="1px solid" borderColor={borderColor}
              zIndex={dragging === item.id ? 10 : 1} cursor="grab" onMouseDown={(e) => handleCardMouseDown(e, item.id)}>
              <Flex justify="space-between" align="start" mb={2}>
                <HStack spacing={1}>{getTypeIcon(item.type)}<Text fontWeight="bold" fontSize="sm">{item.title}</Text></HStack>
                {getTypeBadge(item.type)}
              </Flex>
              <Box mb={2}>{renderContent(item)}</Box>
              {item.linkedTo && <Badge colorScheme="cyan" mb={2} fontSize="xs"><FiLink size={10} style={{ display: 'inline', marginRight: 4 }} />{item.linkedTo}</Badge>}
              <HStack spacing={1} justify="flex-end">
                <Button size="xs" leftIcon={<FiPlus />} variant="outline" colorScheme="green" onClick={(e) => { e.stopPropagation(); openTaskModal(item); }}>Crear tarea</Button>
                <IconButton icon={<FiEdit3 />} size="xs" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(item); }} />
                <IconButton icon={<FiTrash2 />} size="xs" variant="ghost" colorScheme="red" onClick={(e) => { e.stopPropagation(); deleteOposicionesPizarraItem(selectedConvId, selectedBoardId, item.id); }} />
              </HStack>
            </Box>
          ))}
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? 'Editar Elemento' : 'Nuevo Elemento'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl><FormLabel>Tipo</FormLabel><Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="text">Nota / Texto</option>
                <option value="link">Enlace</option>
                <option value="youtube">YouTube</option>
                <option value="image">Imagen</option>
              </Select></FormControl>
              <FormControl><FormLabel>Título</FormLabel><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></FormControl>
              <FormControl><FormLabel>{form.type === 'text' ? 'Contenido' : 'URL'}</FormLabel>{form.type === 'text' ? <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={5} /> : <Input value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder={form.type === 'youtube' ? 'https://www.youtube.com/watch?v=...' : form.type === 'image' ? 'https://example.com/image.jpg' : 'https://example.com'} />}</FormControl>
              <FormControl><FormLabel>Enlazado a (opcional)</FormLabel><Select placeholder="Seleccionar elemento..." value={form.linkedTo} onChange={(e) => setForm((f) => ({ ...f, linkedTo: e.target.value }))}>
                <option value="">Ninguno</option>
                {items.filter((i) => i.id !== editing?.id).map((i) => <option key={i.id} value={i.title}>{i.title}</option>)}
              </Select></FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button onClick={save} isDisabled={!form.title || !form.content}>{editing ? 'Guardar' : 'Crear'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isTaskOpen} onClose={onTaskClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crear Tarea en Agenda</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl><FormLabel>Título</FormLabel><Input value={taskForm.title} onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))} /></FormControl>
              <FormControl><FormLabel>Descripción</FormLabel><Textarea value={taskForm.description} onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))} rows={3} /></FormControl>
              <FormControl><FormLabel>Fecha</FormLabel><Input type="date" value={taskForm.date} onChange={(e) => setTaskForm((f) => ({ ...f, date: e.target.value }))} /></FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onTaskClose}>Cancelar</Button>
            <Button onClick={createTask} isDisabled={!taskForm.title} colorScheme="green">Crear Tarea</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

// ===== KANBAN BOARD (oposiciones) =====
const KANBAN_COLUMNS = [
  { key: 'pendiente', label: 'Pendiente', color: 'gray' },
  { key: 'progreso', label: 'En Progreso', color: 'blue' },
  { key: 'revision', label: 'En Revisión', color: 'yellow' },
  { key: 'completado', label: 'Completado', color: 'green' },
];

function OposicionesKanbanBoard({ selectedConvId }) {
  const { oposicionesKanbans, addOposicionesKanbanBoard, deleteOposicionesKanbanBoard, renameOposicionesKanbanBoard, temarios } = useStore();
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [newBoardName, setNewBoardName] = useState('');
  const [renamingBoard, setRenamingBoard] = useState(null);
  const [renameBoardName, setRenameBoardName] = useState('');
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const colBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const convBoards = useMemo(() => oposicionesKanbans[selectedConvId] || {}, [oposicionesKanbans, selectedConvId]);
  const boardIds = Object.keys(convBoards);

  React.useEffect(() => {
    if (boardIds.length > 0 && !boardIds.includes(selectedBoardId)) {
      setSelectedBoardId(boardIds[0]);
    } else if (boardIds.length === 0) {
      setSelectedBoardId('');
    }
  }, [boardIds.join(','), selectedBoardId]);

  const currentBoard = selectedBoardId ? convBoards[selectedBoardId] : null;
  const assignments = currentBoard?.assignments || {};

  const filteredTemarios = useMemo(() =>
    temarios.filter((t) => !selectedConvId || t.convocatoriaId === selectedConvId),
    [temarios, selectedConvId]
  );

  const allTopics = useMemo(() => {
    const topics = [];
    filteredTemarios.forEach((temario) => {
      (temario.topics || []).forEach((topic) => {
        topics.push({ ...topic, temarioName: temario.name, temarioId: temario.id });
      });
    });
    return topics;
  }, [filteredTemarios]);

  const handleCreateBoard = () => {
    if (!newBoardName.trim() || !selectedConvId) return;
    const bid = addOposicionesKanbanBoard(selectedConvId, newBoardName.trim());
    setSelectedBoardId(bid);
    setNewBoardName('');
  };

  const handleDeleteBoard = (bid) => {
    deleteOposicionesKanbanBoard(selectedConvId, bid);
    if (selectedBoardId === bid) setSelectedBoardId('');
  };

  const handleRenameBoard = (bid) => {
    if (!renameBoardName.trim()) return;
    renameOposicionesKanbanBoard(selectedConvId, bid, renameBoardName.trim());
    setRenamingBoard(null);
    setRenameBoardName('');
  };

  const handleSyncFromTemarios = () => {
    if (!selectedBoardId || !selectedConvId) return;
    const updated = { ...(assignments) };
    allTopics.forEach((topic) => {
      if (!updated[topic.id]) {
        updated[topic.id] = 'pendiente';
      }
    });
    renameOposicionesKanbanBoard(selectedConvId, selectedBoardId, currentBoard.name);
    useStore.setState((s) => ({
      oposicionesKanbans: {
        ...s.oposicionesKanbans,
        [selectedConvId]: {
          ...(s.oposicionesKanbans[selectedConvId] || {}),
          [selectedBoardId]: { ...currentBoard, assignments: updated },
        },
      },
    }));
  };

  const handleClearBoard = () => {
    if (!selectedBoardId || !selectedConvId) return;
    useStore.setState((s) => ({
      oposicionesKanbans: {
        ...s.oposicionesKanbans,
        [selectedConvId]: {
          ...(s.oposicionesKanbans[selectedConvId] || {}),
          [selectedBoardId]: { ...currentBoard, assignments: {} },
        },
      },
    }));
  };

  const moveCard = (topicId, newStatus) => {
    if (!selectedBoardId || !selectedConvId) return;
    const updated = { ...assignments, [topicId]: newStatus };
    useStore.setState((s) => ({
      oposicionesKanbans: {
        ...s.oposicionesKanbans,
        [selectedConvId]: {
          ...(s.oposicionesKanbans[selectedConvId] || {}),
          [selectedBoardId]: { ...currentBoard, assignments: updated },
        },
      },
    }));
  };

  const handleDragStart = (e, topicId) => {
    e.dataTransfer.setData('text/plain', topicId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const topicId = e.dataTransfer.getData('text/plain');
    if (topicId) moveCard(topicId, targetStatus);
  };

  const getColumnTopics = (status) => {
    return allTopics.filter((t) => (assignments[t.id] || 'pendiente') === status);
  };

  const completedCount = allTopics.filter((t) => assignments[t.id] === 'completado').length;
  const totalCount = allTopics.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (!selectedConvId) {
    return (
      <Box p={8} bg={colBg} borderRadius="xl" border="1px solid" borderColor={borderColor} textAlign="center">
        <Text color="gray.500">Selecciona una convocatoria para ver el tablero kanban</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Flex mb={4} align="center" gap={2} wrap="wrap">
        <Select size="sm" maxW="250px" value={selectedBoardId} onChange={(e) => setSelectedBoardId(e.target.value)}>
          <option value="">Seleccionar tablero...</option>
          {boardIds.map((bid) => <option key={bid} value={bid}>{convBoards[bid].name}</option>)}
        </Select>
        <HStack>
          <Input size="sm" maxW="200px" placeholder="Nuevo tablero" value={newBoardName} onChange={(e) => setNewBoardName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()} />
          <Button size="sm" leftIcon={<FiPlus />} onClick={handleCreateBoard} isDisabled={!newBoardName.trim()}>Crear</Button>
        </HStack>
        {selectedBoardId && (
          <>
            {renamingBoard === selectedBoardId ? (
              <HStack>
                <Input size="sm" maxW="200px" value={renameBoardName} onChange={(e) => setRenameBoardName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRenameBoard(selectedBoardId)} />
                <Button size="sm" onClick={() => handleRenameBoard(selectedBoardId)}>OK</Button>
                <Button size="sm" variant="ghost" onClick={() => setRenamingBoard(null)}>Cancelar</Button>
              </HStack>
            ) : (
              <Button size="sm" variant="ghost" leftIcon={<FiEdit3 />} onClick={() => { setRenamingBoard(selectedBoardId); setRenameBoardName(currentBoard?.name || ''); }}>Renombrar</Button>
            )}
            <Button size="sm" variant="ghost" colorScheme="red" leftIcon={<FiTrash2 />} onClick={() => handleDeleteBoard(selectedBoardId)}>Eliminar</Button>
            <Button size="sm" variant="outline" colorScheme="blue" onClick={handleSyncFromTemarios}>Sincronizar desde temarios</Button>
            <Button size="sm" variant="outline" colorScheme="orange" onClick={handleClearBoard}>Limpiar tablero</Button>
          </>
        )}
      </Flex>

      {selectedBoardId && (
        <Box mb={4}>
          <Flex justify="space-between" mb={1}>
            <Text fontSize="sm" color="gray.500">Progreso: {completedCount}/{totalCount} temas completados</Text>
            <Text fontSize="sm" fontWeight="bold">{progressPct}%</Text>
          </Flex>
          <Progress value={progressPct} colorScheme="green" size="sm" borderRadius="full" />
        </Box>
      )}

      {!selectedBoardId ? (
        <Box p={8} bg={colBg} borderRadius="xl" border="1px solid" borderColor={borderColor} textAlign="center">
          <Text color="gray.500">{boardIds.length === 0 ? 'Crea un tablero para empezar' : 'Selecciona un tablero'}</Text>
        </Box>
      ) : (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          {KANBAN_COLUMNS.map((col) => {
            const colTopics = getColumnTopics(col.key);
            return (
              <Box key={col.key} p={3} bg={colBg} borderRadius="xl" border="1px solid" borderColor={borderColor} minH="300px"
                onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.key)}>
                <Flex justify="space-between" align="center" mb={3}>
                  <HStack>
                    <Badge colorScheme={col.color} fontSize="sm">{col.label}</Badge>
                    <Text fontSize="xs" color="gray.400">{colTopics.length}</Text>
                  </HStack>
                </Flex>
                <VStack spacing={2} align="stretch">
                  {colTopics.map((topic) => (
                    <Box key={topic.id} p={3} bg={cardBg} borderRadius="md" boxShadow="sm" border="1px solid" borderColor={borderColor}
                      cursor="grab" draggable onDragStart={(e) => handleDragStart(e, topic.id)}>
                      <Text fontWeight="bold" fontSize="sm" mb={1}>{topic.name}</Text>
                      <Text fontSize="xs" color="gray.400" mb={1}>{topic.temarioName}</Text>
                      {topic.completed && <Badge size="xs" colorScheme="green">Estudiado</Badge>}
                    </Box>
                  ))}
                  {colTopics.length === 0 && <Text fontSize="xs" color="gray.400" textAlign="center" py={2}>Sin temas</Text>}
                </VStack>
              </Box>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}

// ===== ESTADISTICAS OPOSICIONES =====
function EstadisticasOposiciones({ selectedConvId }) {
  const { studySessions, testResults, temarios, supuestosPracticos, simulacros } = useStore();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { textColor, gridColor, tooltipBg, tooltipBorder, tooltipColor } = useRechartStyles();

  const filteredStudySessions = useMemo(() =>
    studySessions.filter((s) => !selectedConvId || s.convocatoriaId === selectedConvId),
    [studySessions, selectedConvId]
  );

  const filteredTestResults = useMemo(() =>
    testResults.filter((r) => !selectedConvId || r.convocatoriaId === selectedConvId),
    [testResults, selectedConvId]
  );

  const filteredTemarios = useMemo(() =>
    temarios.filter((t) => !selectedConvId || t.convocatoriaId === selectedConvId),
    [temarios, selectedConvId]
  );

  const filteredSupuestosPracticos = useMemo(() =>
    supuestosPracticos.filter((sp) => !selectedConvId || sp.convocatoriaId === selectedConvId),
    [supuestosPracticos, selectedConvId]
  );

  const filteredSimulacros = useMemo(() =>
    simulacros.filter((s) => !selectedConvId || s.convocatoriaId === selectedConvId),
    [simulacros, selectedConvId]
  );

  const totalSeconds = filteredStudySessions.reduce((a, s) => a + (s.seconds || (s.duration || 0) * 60), 0);
  const totalHours = +(totalSeconds / 3600).toFixed(1);
  const avgTestScore = filteredTestResults.length > 0 ? Math.round(filteredTestResults.reduce((a, r) => a + r.percentage, 0) / filteredTestResults.length) : 0;
  const totalTopics = filteredTemarios.reduce((a, t) => a + (t.topics || []).length, 0);
  const completedTopics = filteredTemarios.reduce((a, t) => a + (t.topics || []).filter((tp) => tp.completed).length, 0);
  const pctCompleted = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const avgSupuestos = useMemo(() => {
    const puntuaciones = filteredSupuestosPracticos.filter((sp) => sp.puntuacion !== '' && sp.puntuacion !== undefined).map((sp) => Number(sp.puntuacion));
    return puntuaciones.length > 0 ? +(puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length).toFixed(1) : 0;
  }, [filteredSupuestosPracticos]);

  const avgSimulacros = useMemo(() => {
    const puntuaciones = filteredSimulacros.filter((s) => s.puntuacion !== '' && s.puntuacion !== undefined).map((s) => Number(s.puntuacion));
    return puntuaciones.length > 0 ? +(puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length).toFixed(1) : 0;
  }, [filteredSimulacros]);

  const combinedAvg = useMemo(() => {
    const allScores = [];
    if (avgTestScore > 0) allScores.push(avgTestScore);
    if (avgSupuestos > 0) allScores.push(avgSupuestos * 10);
    if (avgSimulacros > 0) allScores.push(avgSimulacros);
    return allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
  }, [avgTestScore, avgSupuestos, avgSimulacros]);

  const pieData = [
    { name: 'Aciertos Tests', value: filteredTestResults.reduce((a, r) => a + r.correct, 0) },
    { name: 'Fallos Tests', value: filteredTestResults.reduce((a, r) => a + (r.total - r.correct), 0) },
  ].filter((d) => d.value > 0);
  const COLORS = ['#48BB78', '#F56565'];

  return (
    <VStack spacing={6} align="stretch">
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Tiempo Total</StatLabel><StatNumber>{totalHours}h</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Sesiones</StatLabel><StatNumber>{filteredStudySessions.length}</StatNumber></Stat>
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
        {filteredStudySessions.length > 0 && (
          <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
            <Text fontWeight="bold" mb={4}>Sesiones de Estudio</Text>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={filteredStudySessions.slice(-10)}>
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
  const { addStudySession, addXP, convocatoria } = useStore();
  const [selectedConvId, setSelectedConvId] = useState('');

  const handleStudyRegister = (data) => {
    const temario = useStore.getState().temarios.find((t) => t.id === data.temarioId);
    const topic = temario ? (temario.topics || []).find((t) => t.id === data.topicId) : null;
    addStudySession({ ...data, type: 'study', topicName: topic?.name || '', temarioName: temario?.name || '', convocatoriaId: selectedConvId || '' });
    addXP(10);
  };

  return (
    <Box>
      <Box mb={4}>
        <FormControl maxW="300px">
          <FormLabel fontWeight="bold">Convocatoria activa</FormLabel>
          <Select value={selectedConvId} onChange={(e) => setSelectedConvId(e.target.value)}>
            <option value="">Todas</option>
            {convocatoria.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre || 'Sin nombre'}</option>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab><FiFileText style={{ marginRight: 8 }} />Convocatoria</Tab>
          <Tab><FiBook style={{ marginRight: 8 }} />Temarios</Tab>
          <Tab><FiCheckCircle style={{ marginRight: 8 }} />Tests</Tab>
          <Tab><FiEdit style={{ marginRight: 8 }} />Supuestos Prácticos</Tab>
          <Tab><FiAward style={{ marginRight: 8 }} />Simulacros</Tab>
          <Tab><FiGrid style={{ marginRight: 8 }} />Pizarra</Tab>
          <Tab><FiGrid style={{ marginRight: 8 }} />Tablero</Tab>
          <Tab><FiBarChart2 style={{ marginRight: 8 }} />Estadísticas</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}><ConvocatoriaManager /></TabPanel>
          <TabPanel px={0}>
            <VStack spacing={6} align="stretch">
              <Cronometro onRegister={handleStudyRegister} />
              <TemarioManager selectedConvId={selectedConvId} />
            </VStack>
          </TabPanel>
          <TabPanel px={0}><TestManager selectedConvId={selectedConvId} /></TabPanel>
          <TabPanel px={0}><SupuestosPracticosManager selectedConvId={selectedConvId} /></TabPanel>
          <TabPanel px={0}><SimulacrosManager selectedConvId={selectedConvId} /></TabPanel>
          <TabPanel px={0}><PizarraManager selectedConvId={selectedConvId} /></TabPanel>
          <TabPanel px={0}><OposicionesKanbanBoard selectedConvId={selectedConvId} /></TabPanel>
          <TabPanel px={0}><EstadisticasOposiciones selectedConvId={selectedConvId} /></TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
