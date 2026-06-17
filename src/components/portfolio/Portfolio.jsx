import React, { useState, useMemo } from 'react';
import { Box, Grid, Text, Flex, VStack, HStack, Badge, Button, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, Input, Textarea, Select, Progress, Stat, StatLabel, StatNumber, SimpleGrid, useColorModeValue, Tabs, TabList, TabPanels, Tab, TabPanel, Wrap, WrapItem, Tag } from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiEdit3, FiLayout, FiClock, FiCode, FiLink, FiTarget } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import useStore from '../../store/useStore';

function SectionManager() {
  const { portfolioSections, addPortfolioSection, updatePortfolioSection, deletePortfolioSection } = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'pendiente', technologies: [], repoUrl: '' });
  const [techInput, setTechInput] = useState('');
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const openNew = () => { setEditing(null); setForm({ name: '', description: '', status: 'pendiente', technologies: [], repoUrl: '' }); onOpen(); };
  const openEdit = (s) => { setEditing(s); setForm({ ...s }); onOpen(); };

  const addTech = () => {
    if (techInput && !form.technologies.includes(techInput)) {
      setForm((f) => ({ ...f, technologies: [...f.technologies, techInput] }));
      setTechInput('');
    }
  };

  const removeTech = (tech) => setForm((f) => ({ ...f, technologies: f.technologies.filter((t) => t !== tech) }));

  const save = () => {
    if (editing) updatePortfolioSection(editing.id, form);
    else addPortfolioSection(form);
    onClose();
  };

  const statusColors = { pendiente: 'gray', en_progreso: 'blue', completado: 'green' };
  const statusLabels = { pendiente: 'Pendiente', en_progreso: 'En Progreso', completado: 'Completado' };

  return (
    <Box>
      <Flex justify="space-between" mb={4}>
        <Text fontWeight="bold">Secciones del Porfolio</Text>
        <Button leftIcon={<FiPlus />} size="sm" onClick={openNew}>Nueva Sección</Button>
      </Flex>
      <VStack spacing={3} align="stretch">
        {portfolioSections.length === 0 && <Text color="gray.500" textAlign="center" py={4}>No hay secciones creadas</Text>}
        {portfolioSections.map((s) => (
          <Box key={s.id} p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
            <Flex justify="space-between" align="start">
              <Box flex={1}>
                <HStack mb={2}>
                  <Text fontWeight="bold">{s.name}</Text>
                  <Badge colorScheme={statusColors[s.status]}>{statusLabels[s.status]}</Badge>
                </HStack>
                {s.description && <Text fontSize="sm" color="gray.500" mb={2}>{s.description}</Text>}
                {s.repoUrl && <HStack mb={2}><FiLink size={12} /><Text fontSize="xs" color="blue.400" as="a" href={s.repoUrl} target="_blank">{s.repoUrl}</Text></HStack>}
                <Wrap>
                  {(s.technologies || []).map((t) => <WrapItem key={t}><Tag size="sm" colorScheme="purple">{t}</Tag></WrapItem>)}
                </Wrap>
              </Box>
              <HStack>
                <IconButton icon={<FiEdit3 />} size="xs" onClick={() => openEdit(s)} />
                <IconButton icon={<FiTrash2 />} size="xs" colorScheme="red" onClick={() => deletePortfolioSection(s.id)} />
              </HStack>
            </Flex>
          </Box>
        ))}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? 'Editar Sección' : 'Nueva Sección'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl><FormLabel>Nombre</FormLabel><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></FormControl>
              <FormControl><FormLabel>Descripción</FormLabel><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></FormControl>
              <FormControl><FormLabel>Estado</FormLabel><Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="pendiente">Pendiente</option><option value="en_progreso">En Progreso</option><option value="completado">Completado</option>
              </Select></FormControl>
              <FormControl><FormLabel>URL Repositorio</FormLabel><Input value={form.repoUrl} onChange={(e) => setForm((f) => ({ ...f, repoUrl: e.target.value }))} placeholder="https://github.com/..." /></FormControl>
              <Box w="100%">
                <FormLabel>Tecnologías</FormLabel>
                <HStack mb={2}><Input size="sm" placeholder="Tecnología" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTech()} /><Button size="sm" onClick={addTech}>Agregar</Button></HStack>
                <Wrap>{form.technologies.map((t) => <WrapItem key={t}><Tag size="sm" colorScheme="purple" onClose={() => removeTech(t)} closable>{t}</Tag></WrapItem>)}</Wrap>
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
  const { portfolioSections, addPortfolioLog, addXP } = useStore();
  const [form, setForm] = useState({ sectionId: '', hours: 1, description: '', technologies: [] });

  const save = () => {
    addPortfolioLog({ ...form, date: format(new Date(), 'yyyy-MM-dd'), type: 'portfolio' });
    addXP(5);
    setForm({ sectionId: '', hours: 1, description: '', technologies: [] });
  };

  return (
    <Box p={5} bg={useColorModeValue('white', 'gray.800')} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={useColorModeValue('gray.200', 'gray.700')}>
      <Text fontWeight="bold" mb={4}>Registrar Horas</Text>
      <VStack spacing={4}>
        <FormControl><FormLabel>Sección</FormLabel><Select placeholder="Seleccionar sección" value={form.sectionId} onChange={(e) => setForm((f) => ({ ...f, sectionId: e.target.value }))}>
          {portfolioSections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select></FormControl>
        <FormControl><FormLabel>Horas</FormLabel><Input type="number" value={form.hours} onChange={(e) => setForm((f) => ({ ...f, hours: parseFloat(e.target.value) || 0 }))} /></FormControl>
        <FormControl><FormLabel>Descripción del avance</FormLabel><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></FormControl>
        <Button w="100%" onClick={save} isDisabled={!form.sectionId || form.hours <= 0}>Registrar</Button>
      </VStack>
    </Box>
  );
}

function PortfolioStats() {
  const { portfolioSections, portfolioLogs } = useStore();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const totalHours = useMemo(() => +(portfolioLogs.reduce((a, l) => a + (l.hours || 0), 0)).toFixed(1), [portfolioLogs]);
  const completedSections = portfolioSections.filter((s) => s.status === 'completado').length;
  const inProgress = portfolioSections.filter((s) => s.status === 'en_progreso').length;

  const hoursPerSection = useMemo(() => {
    const data = {};
    portfolioLogs.forEach((l) => {
      const sec = portfolioSections.find((s) => s.id === l.sectionId);
      const name = sec?.name || 'Sin sección';
      data[name] = (data[name] || 0) + (l.hours || 0);
    });
    return Object.entries(data).map(([name, hours]) => ({ name, hours: +hours.toFixed(1) }));
  }, [portfolioLogs, portfolioSections]);

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel><FiClock style={{ display: 'inline' }} /> Horas Totales</StatLabel><StatNumber>{totalHours}h</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel><FiTarget style={{ display: 'inline' }} /> Completadas</StatLabel><StatNumber color="green.500">{completedSections}/{portfolioSections.length}</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel><FiCode style={{ display: 'inline' }} /> En Progreso</StatLabel><StatNumber color="blue.500">{inProgress}</StatNumber></Stat>
        </Box>
      </SimpleGrid>

      <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
        <Text fontWeight="bold" mb={3}>Horas por Sección</Text>
        {hoursPerSection.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hoursPerSection}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#9F7AEA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Text color="gray.500" textAlign="center" py={4}>Sin datos de horas registradas</Text>
        )}
      </Box>
    </Box>
  );
}

export default function Portfolio() {
  return (
    <Tabs variant="enclosed" colorScheme="purple">
      <TabList>
        <Tab><FiLayout style={{ marginRight: 8 }} />Secciones</Tab>
        <Tab><FiClock style={{ marginRight: 8 }} />Registrar Horas</Tab>
        <Tab><FiTarget style={{ marginRight: 8 }} />Estadísticas</Tab>
      </TabList>
      <TabPanels>
        <TabPanel px={0}><SectionManager /></TabPanel>
        <TabPanel px={0}><LogHours /></TabPanel>
        <TabPanel px={0}><PortfolioStats /></TabPanel>
      </TabPanels>
    </Tabs>
  );
}


