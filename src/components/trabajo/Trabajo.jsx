import React, { useState, useMemo } from 'react';
import { Box, Grid, Text, Flex, VStack, HStack, Badge, Button, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, Input, Textarea, Select, Stat, StatLabel, StatNumber, SimpleGrid, useColorModeValue, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiEdit3, FiBriefcase, FiBarChart2 } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import useStore from '../../store/useStore';
import { formatDate, JOB_STATUSES } from '../../utils/helpers';
import { useRechartStyles } from '../../utils/rechartStyles';
import { format, subDays } from 'date-fns';

function OfertaForm({ isOpen, onClose, editing }) {
  const { addJobOffer, updateJobOffer } = useStore();
  const [form, setForm] = useState({ company: '', jobName: '', portal: '', date: format(new Date(), 'yyyy-MM-dd'), status: 'enviada', cv: '', modality: 'presencial', location: '', technologies: '', notes: '' });

  React.useEffect(() => {
    if (editing) setForm({ ...editing });
    else setForm({ company: '', jobName: '', portal: '', date: format(new Date(), 'yyyy-MM-dd'), status: 'enviada', cv: '', modality: 'presencial', location: '', technologies: '', notes: '' });
  }, [editing, isOpen]);

  const save = () => {
    if (editing) updateJobOffer(editing.id, form);
    else addJobOffer(form);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{editing ? 'Editar Oferta' : 'Nueva Oferta'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl><FormLabel>Nombre de la Oferta</FormLabel><Input value={form.jobName} onChange={(e) => setForm((f) => ({ ...f, jobName: e.target.value }))} placeholder="Ej: Frontend Developer Senior" /></FormControl>
            <FormControl><FormLabel>Empresa</FormLabel><Input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} /></FormControl>
            <HStack w="100%">
              <FormControl><FormLabel>Portal</FormLabel><Input value={form.portal} onChange={(e) => setForm((f) => ({ ...f, portal: e.target.value }))} placeholder="LinkedIn, InfoJobs..." /></FormControl>
              <FormControl><FormLabel>Fecha</FormLabel><Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></FormControl>
            </HStack>
            <HStack w="100%">
              <FormControl><FormLabel>Modalidad</FormLabel><Select value={form.modality} onChange={(e) => setForm((f) => ({ ...f, modality: e.target.value }))}>
                <option value="presencial">Presencial</option>
                <option value="remoto">Remoto</option>
                <option value="hibrido">Híbrido</option>
              </Select></FormControl>
              <FormControl><FormLabel>Ubicación</FormLabel><Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Madrid, Barcelona..." /></FormControl>
            </HStack>
            <HStack w="100%">
              <FormControl><FormLabel>Estado</FormLabel><Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                {Object.entries(JOB_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select></FormControl>
              <FormControl><FormLabel>CV Usado</FormLabel><Input value={form.cv} onChange={(e) => setForm((f) => ({ ...f, cv: e.target.value }))} /></FormControl>
            </HStack>
            <FormControl><FormLabel>Tecnologías / Requisitos</FormLabel><Textarea value={form.technologies} onChange={(e) => setForm((f) => ({ ...f, technologies: e.target.value }))} placeholder="React, Node.js, TypeScript, SQL..." /></FormControl>
            <FormControl><FormLabel>Notas</FormLabel><Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
          <Button onClick={save} isDisabled={!form.company}>{editing ? 'Guardar' : 'Crear'}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function Trabajo() {
  const { jobOffers, deleteJobOffer } = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [filterPortal, setFilterPortal] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [selectedMetricDay, setSelectedMetricDay] = useState(format(new Date(), 'yyyy-MM-dd'));
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { textColor, gridColor, tooltipBg, tooltipBorder, tooltipColor } = useRechartStyles();

  const filteredOffers = useMemo(() => {
    return jobOffers.filter((o) => {
      if (filterPortal && !o.portal?.toLowerCase().includes(filterPortal.toLowerCase())) return false;
      if (filterStatus && o.status !== filterStatus) return false;
      if (filterCompany && !o.company?.toLowerCase().includes(filterCompany.toLowerCase())) return false;
      if (filterDateFrom && o.date < filterDateFrom) return false;
      if (filterDateTo && o.date > filterDateTo) return false;
      return true;
    });
  }, [jobOffers, filterPortal, filterStatus, filterCompany, filterDateFrom, filterDateTo]);

  const weeklyStats = useMemo(() => {
    const now = new Date();
    const result = [];
    for (let i = 8; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      const count = jobOffers.filter((o) => {
        const d = new Date(o.date + 'T00:00:00');
        return d >= weekStart && d < weekEnd;
      }).length;
      result.push({ week: format(weekStart, 'dd/MM'), ofertas: count });
    }
    return result;
  }, [jobOffers]);

  const dailyStats = useMemo(() => {
    const now = new Date();
    const result = [];
    for (let i = 13; i >= 0; i--) {
      const d = subDays(now, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const count = jobOffers.filter((o) => o.date === dateStr).length;
      result.push({ day: format(d, 'dd/MM'), ofertas: count });
    }
    return result;
  }, [jobOffers]);

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = format(m, 'yyyy-MM');
      const count = jobOffers.filter((o) => o.date?.startsWith(mStr)).length;
      result.push({ month: format(m, 'MMM yy'), ofertas: count });
    }
    return result;
  }, [jobOffers]);

  const dayDetailStats = useMemo(() => {
    const offers = jobOffers.filter((o) => o.date === selectedMetricDay);
    const byPortal = {};
    const byStatus = {};
    offers.forEach((o) => {
      byPortal[o.portal || 'Otro'] = (byPortal[o.portal || 'Otro'] || 0) + 1;
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    });
    return { offers, byPortal: Object.entries(byPortal).map(([name, value]) => ({ name, value })), byStatus: Object.entries(byStatus).map(([name, value]) => ({ name: JOB_STATUSES[name]?.label || name, value })) };
  }, [jobOffers, selectedMetricDay]);

  const portalStats = useMemo(() => {
    const portals = {};
    jobOffers.forEach((o) => { portals[o.portal || 'Otro'] = (portals[o.portal || 'Otro'] || 0) + 1; });
    return Object.entries(portals).map(([name, value]) => ({ name, value }));
  }, [jobOffers]);

  const totalSent = jobOffers.length;
  const responses = jobOffers.filter((o) => o.status !== 'enviada').length;
  const responseRate = totalSent > 0 ? Math.round((responses / totalSent) * 100) : 0;

  const COLORS = ['#4299E1', '#48BB78', '#ED8936', '#E53E3E', '#9F7AEA', '#38B2AC'];
  const rowBg = useColorModeValue('gray.50', 'gray.700');

  const openNew = () => { setEditing(null); onOpen(); };
  const openEdit = (offer) => { setEditing(offer); onOpen(); };

  return (
    <Tabs variant="enclosed" colorScheme="orange">
      <TabList>
        <Tab><FiBriefcase style={{ marginRight: 8 }} />Ofertas</Tab>
        <Tab><FiBarChart2 style={{ marginRight: 8 }} />Métricas</Tab>
      </TabList>
      <TabPanels>
        <TabPanel px={0}>
          <Flex justify="space-between" mb={4} wrap="wrap" gap={3}>
            <HStack spacing={2} wrap="wrap">
              <Input size="sm" w="130px" placeholder="Portal..." value={filterPortal} onChange={(e) => setFilterPortal(e.target.value)} />
              <Input size="sm" w="130px" placeholder="Empresa..." value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)} />
              <Select size="sm" w="120px" placeholder="Estado" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                {Object.entries(JOB_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
              <Input size="sm" w="140px" type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} placeholder="Desde" />
              <Input size="sm" w="140px" type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} placeholder="Hasta" />
            </HStack>
            <Button leftIcon={<FiPlus />} size="sm" onClick={openNew}>Nueva Oferta</Button>
          </Flex>

          <Text fontSize="sm" color="gray.500" mb={3}>{filteredOffers.length} ofertas encontradas</Text>

          <VStack spacing={3} align="stretch">
            {filteredOffers.length === 0 && <Text color="gray.500" textAlign="center" py={4}>No hay ofertas</Text>}
            {filteredOffers.map((o) => (
              <Flex key={o.id} p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} justify="space-between" align="flex-start" _hover={{ boxShadow: 'lg' }} transition="all 0.2s">
                <Box flex={1}>
                  <HStack mb={1} spacing={2}>
                    {o.jobName && <Text fontWeight="bold" fontSize="md">{o.jobName}</Text>}
                    <Badge colorScheme={JOB_STATUSES[o.status]?.color || 'gray'}>{JOB_STATUSES[o.status]?.label || o.status}</Badge>
                    {o.modality && <Badge colorScheme={o.modality === 'remoto' ? 'green' : o.modality === 'hibrido' ? 'purple' : 'orange'}>{o.modality === 'presencial' ? 'Presencial' : o.modality === 'remoto' ? 'Remoto' : 'Híbrido'}</Badge>}
                  </HStack>
                  <HStack fontSize="sm" color="gray.500" spacing={3} mb={1}>
                    <Text fontWeight="semibold">{o.company}</Text>
                    {o.portal && <Text>• {o.portal}</Text>}
                    {o.location && <Text>• {o.location}</Text>}
                    <Text>• {formatDate(o.date)}</Text>
                    {o.cv && <Text>• CV: {o.cv}</Text>}
                  </HStack>
                  {o.technologies && <Text fontSize="xs" color="blue.400" mt={1}>{o.technologies}</Text>}
                  {o.notes && <Text fontSize="xs" color="gray.400" mt={1}>{o.notes}</Text>}
                </Box>
                <HStack>
                  <IconButton icon={<FiEdit3 />} size="xs" onClick={() => openEdit(o)} />
                  <IconButton icon={<FiTrash2 />} size="xs" colorScheme="red" onClick={() => deleteJobOffer(o.id)} />
                </HStack>
              </Flex>
            ))}
          </VStack>

          <OfertaForm isOpen={isOpen} onClose={onClose} editing={editing} />
        </TabPanel>

        <TabPanel px={0}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
            <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
              <Stat><StatLabel>Ofertas Enviadas</StatLabel><StatNumber>{totalSent}</StatNumber></Stat>
            </Box>
            <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
              <Stat><StatLabel>Tasa de Respuesta</StatLabel><StatNumber color={responseRate >= 30 ? 'green.500' : 'orange.500'}>{responseRate}%</StatNumber></Stat>
            </Box>
            <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
              <Stat><StatLabel>Portales Usados</StatLabel><StatNumber>{portalStats.length}</StatNumber></Stat>
            </Box>
          </SimpleGrid>

          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5} mb={5}>
            <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
              <Text fontWeight="bold" mb={3}>Diarias (14 días)</Text>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="day" fontSize={10} tick={{ fill: textColor }} />
                  <YAxis tick={{ fill: textColor }} />
                  <Tooltip contentStyle={{ bg: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipColor }} />
                  <Bar dataKey="ofertas" fill="#4299E1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
              <Text fontWeight="bold" mb={3}>Semanales</Text>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="week" fontSize={12} tick={{ fill: textColor }} />
                  <YAxis tick={{ fill: textColor }} />
                  <Tooltip contentStyle={{ bg: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipColor }} />
                  <Bar dataKey="ofertas" fill="#ED8936" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5} mb={5}>
            <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
              <Text fontWeight="bold" mb={3}>Mensuales</Text>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" fontSize={12} tick={{ fill: textColor }} />
                  <YAxis tick={{ fill: textColor }} />
                  <Tooltip contentStyle={{ bg: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipColor }} />
                  <Bar dataKey="ofertas" fill="#9F7AEA" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
              <Text fontWeight="bold" mb={3}>Por Portal</Text>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={portalStats.length > 0 ? portalStats : [{ name: 'Sin datos', value: 1 }]} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {portalStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ bg: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipColor }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
            <Flex justify="space-between" align="center" mb={3}>
              <Text fontWeight="bold">Detalle por Día</Text>
              <Input size="sm" w="180px" type="date" value={selectedMetricDay} onChange={(e) => setSelectedMetricDay(e.target.value)} />
            </Flex>
            <HStack spacing={4} mb={3}>
              <Badge colorScheme="blue">{dayDetailStats.offers.length} ofertas en {formatDate(selectedMetricDay)}</Badge>
            </HStack>
            {dayDetailStats.byPortal.length > 0 && (
              <HStack spacing={3} mb={3}>
                <Text fontSize="sm" fontWeight="bold">Por portal:</Text>
                {dayDetailStats.byPortal.map((p) => <Badge key={p.name} colorScheme="orange">{p.name}: {p.value}</Badge>)}
              </HStack>
            )}
            {dayDetailStats.byStatus.length > 0 && (
              <HStack spacing={3}>
                <Text fontSize="sm" fontWeight="bold">Por estado:</Text>
                {dayDetailStats.byStatus.map((s) => <Badge key={s.name} colorScheme="green">{s.name}: {s.value}</Badge>)}
              </HStack>
            )}
            {dayDetailStats.offers.length > 0 ? (
              <VStack align="stretch" mt={3} spacing={2}>
                {dayDetailStats.offers.map((o) => (
                  <HStack key={o.id} p={2} bg={rowBg} borderRadius="md" spacing={3}>
                    <Badge colorScheme={JOB_STATUSES[o.status]?.color}>{JOB_STATUSES[o.status]?.label}</Badge>
                    {o.jobName && <Text fontSize="sm" fontWeight="bold">{o.jobName}</Text>}
                    <Text fontSize="sm" fontWeight="semibold">{o.company}</Text>
                    {o.modality && <Badge size="sm" colorScheme={o.modality === 'remoto' ? 'green' : o.modality === 'hibrido' ? 'purple' : 'orange'}>{o.modality}</Badge>}
                    <Text fontSize="sm" color="gray.500">{o.portal}</Text>
                  </HStack>
                ))}
              </VStack>
            ) : (
              <Text color="gray.500" fontSize="sm">Sin ofertas este día</Text>
            )}
          </Box>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
