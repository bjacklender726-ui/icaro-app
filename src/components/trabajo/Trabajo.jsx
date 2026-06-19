import React, { useState, useMemo } from 'react';
import { Box, Grid, Text, Flex, VStack, HStack, Badge, Button, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, Input, Textarea, Select, Stat, StatLabel, StatNumber, SimpleGrid, useColorModeValue, Tabs, TabList, TabPanels, Tab, TabPanel, useBreakpointValue } from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiEdit3, FiBriefcase, FiBarChart2, FiDownload, FiUpload } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import useStore from '../../store/useStore';
import { formatDate, JOB_STATUSES } from '../../utils/helpers';
import { useRechartStyles } from '../../utils/rechartStyles';
import { format, subDays } from 'date-fns';

const PORTAL_OPTIONS = ['LinkedIn', 'InfoJobs', 'Indeed', 'Glassdoor', 'Tecnoempleo', 'InfoTjobs', 'JobandTalent', 'Welcome to the Jungle', 'StepStone', 'Otro'];
const CV_OPTIONS = ['CV Desarrollo Web', 'CV Consultor Tecnológico', 'CV Atención al Cliente', 'Personalizado'];

function OfertaForm({ isOpen, onClose, editing }) {
  const { addJobOffer, updateJobOffer } = useStore();
  const [form, setForm] = useState({ company: '', jobName: '', portal: '', date: format(new Date(), 'yyyy-MM-dd'), status: 'enviada', cv: '', modality: 'presencial', location: '', technologies: '', notes: '' });
  const [customPortal, setCustomPortal] = useState('');
  const [customCV, setCustomCV] = useState('');

  React.useEffect(() => {
    if (editing) {
      setForm({ ...editing });
      if (PORTAL_OPTIONS.includes(editing.portal)) {
        setCustomPortal('');
      } else {
        setCustomPortal(editing.portal || '');
      }
      if (CV_OPTIONS.includes(editing.cv)) {
        setCustomCV('');
      } else {
        setCustomCV(editing.cv || '');
      }
    } else {
      setForm({ company: '', jobName: '', portal: '', date: format(new Date(), 'yyyy-MM-dd'), status: 'enviada', cv: '', modality: 'presencial', location: '', technologies: '', notes: '' });
      setCustomPortal('');
      setCustomCV('');
    }
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
              <FormControl><FormLabel>Portal</FormLabel>
                <Select
                  value={PORTAL_OPTIONS.includes(form.portal) ? form.portal : 'Otro'}
                  onChange={(e) => {
                    if (e.target.value === 'Otro') {
                      setForm((f) => ({ ...f, portal: customPortal || '' }));
                    } else {
                      setCustomPortal('');
                      setForm((f) => ({ ...f, portal: e.target.value }));
                    }
                  }}
                >
                  <option value="" disabled>Seleccionar portal...</option>
                  {PORTAL_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
                {(!PORTAL_OPTIONS.includes(form.portal)) && (
                  <Input mt={2} value={customPortal} onChange={(e) => { setCustomPortal(e.target.value); setForm((f) => ({ ...f, portal: e.target.value })); }} placeholder="Nombre del portal..." />
                )}
              </FormControl>
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
              <FormControl><FormLabel>CV Usado</FormLabel>
                <Select
                  value={CV_OPTIONS.includes(form.cv) ? form.cv : 'Personalizado'}
                  onChange={(e) => {
                    if (e.target.value === 'Personalizado') {
                      setForm((f) => ({ ...f, cv: customCV || '' }));
                    } else {
                      setCustomCV('');
                      setForm((f) => ({ ...f, cv: e.target.value }));
                    }
                  }}
                >
                  <option value="" disabled>Seleccionar CV...</option>
                  {CV_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
                {(!CV_OPTIONS.includes(form.cv)) && (
                  <Input mt={2} value={customCV} onChange={(e) => { setCustomCV(e.target.value); setForm((f) => ({ ...f, cv: e.target.value })); }} placeholder="Nombre del CV..." />
                )}
              </FormControl>
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
  const { jobOffers, deleteJobOffer, addJobOffer } = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [filterPortal, setFilterPortal] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [selectedMetricDay, setSelectedMetricDay] = useState(format(new Date(), 'yyyy-MM-dd'));
  const getWeekStart = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    return format(date, 'yyyy-MM-dd');
  };
  const [selectedMetricWeek, setSelectedMetricWeek] = useState(getWeekStart(new Date()));
  const [selectedMetricMonth, setSelectedMetricMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [filterJobName, setFilterJobName] = useState('');
  const [filterModality, setFilterModality] = useState('');
  const [filterTech, setFilterTech] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const importRef = React.useRef(null);

  const chartHeight = useBreakpointValue({ base: 180, md: 200, lg: 220 });
  const detailColumns = useBreakpointValue({ base: 1, md: 1, lg: 2 });

  const exportData = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const items = JSON.parse(ev.target.result);
        if (Array.isArray(items)) {
          items.forEach((item) => {
            const { id, createdAt, ...rest } = item;
            addJobOffer(rest);
          });
        }
      } catch (err) { console.error('Error al importar ofertas:', err); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { textColor, gridColor, tooltipBg, tooltipBorder, tooltipColor } = useRechartStyles();

  const filteredOffers = useMemo(() => {
    let result = jobOffers.filter((o) => {
      if (filterPortal && !o.portal?.toLowerCase().includes(filterPortal.toLowerCase())) return false;
      if (filterStatus && o.status !== filterStatus) return false;
      if (filterCompany && !o.company?.toLowerCase().includes(filterCompany.toLowerCase())) return false;
      if (filterJobName && !o.jobName?.toLowerCase().includes(filterJobName.toLowerCase())) return false;
      if (filterModality && o.modality !== filterModality) return false;
      if (filterTech && !o.technologies?.toLowerCase().includes(filterTech.toLowerCase())) return false;
      if (filterDateFrom && o.date < filterDateFrom) return false;
      if (filterDateTo && o.date > filterDateTo) return false;
      return true;
    });
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return b.date?.localeCompare(a.date);
        case 'date-asc': return a.date?.localeCompare(b.date);
        case 'company-asc': return a.company?.localeCompare(b.company);
        case 'company-desc': return b.company?.localeCompare(a.company);
        case 'status': return (a.status || '').localeCompare(b.status || '');
        default: return 0;
      }
    });
    return result;
  }, [jobOffers, filterPortal, filterStatus, filterCompany, filterJobName, filterModality, filterTech, filterDateFrom, filterDateTo, sortBy]);

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

  const weekDetailStats = useMemo(() => {
    const weekStart = new Date(selectedMetricWeek + 'T00:00:00');
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const offers = jobOffers.filter((o) => {
      const d = new Date(o.date + 'T00:00:00');
      return d >= weekStart && d < weekEnd;
    });
    const byPortal = {};
    const byStatus = {};
    const byModality = {};
    offers.forEach((o) => {
      byPortal[o.portal || 'Otro'] = (byPortal[o.portal || 'Otro'] || 0) + 1;
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
      byModality[o.modality || 'No especificado'] = (byModality[o.modality || 'No especificado'] || 0) + 1;
    });
    return {
      offers,
      byPortal: Object.entries(byPortal).map(([name, value]) => ({ name, value })),
      byStatus: Object.entries(byStatus).map(([name, value]) => ({ name: JOB_STATUSES[name]?.label || name, value })),
      byModality: Object.entries(byModality).map(([name, value]) => ({ name, value })),
    };
  }, [jobOffers, selectedMetricWeek]);

  const monthDetailStats = useMemo(() => {
    const offers = jobOffers.filter((o) => o.date?.startsWith(selectedMetricMonth));
    const byPortal = {};
    const byStatus = {};
    const byModality = {};
    const byTech = {};
    offers.forEach((o) => {
      byPortal[o.portal || 'Otro'] = (byPortal[o.portal || 'Otro'] || 0) + 1;
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
      byModality[o.modality || 'No especificado'] = (byModality[o.modality || 'No especificado'] || 0) + 1;
      if (o.technologies) {
        o.technologies.split(',').map(t => t.trim()).filter(Boolean).forEach(t => {
          byTech[t] = (byTech[t] || 0) + 1;
        });
      }
    });
    return {
      offers,
      byPortal: Object.entries(byPortal).map(([name, value]) => ({ name, value })),
      byStatus: Object.entries(byStatus).map(([name, value]) => ({ name: JOB_STATUSES[name]?.label || name, value })),
      byModality: Object.entries(byModality).map(([name, value]) => ({ name, value })),
      byTech: Object.entries(byTech).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })),
    };
  }, [jobOffers, selectedMetricMonth]);

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
              <Input size="sm" w="150px" placeholder="Puesto..." value={filterJobName} onChange={(e) => setFilterJobName(e.target.value)} />
              <Select size="sm" w="130px" placeholder="Modalidad" value={filterModality} onChange={(e) => setFilterModality(e.target.value)}>
                <option value="remoto">Remoto</option>
                <option value="hibrido">Híbrido</option>
                <option value="presencial">Presencial</option>
              </Select>
              <Input size="sm" w="140px" placeholder="Tecnologías..." value={filterTech} onChange={(e) => setFilterTech(e.target.value)} />
              <Select size="sm" w="150px" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="date-desc">Más recientes</option>
                <option value="date-asc">Más antiguos</option>
                <option value="company-asc">Empresa A-Z</option>
                <option value="company-desc">Empresa Z-A</option>
                <option value="status">Por estado</option>
              </Select>
            </HStack>
            <HStack spacing={2}>
              <Button leftIcon={<FiDownload />} size="sm" variant="outline" onClick={() => exportData(filteredOffers, 'ofertas_trabajo.json')}>Exportar</Button>
              <input type="file" ref={importRef} accept=".json" style={{ display: 'none' }} onChange={handleImport} />
              <IconButton icon={<FiUpload />} size="sm" variant="outline" onClick={() => importRef.current?.click()} title="Importar ofertas" />
              <Button leftIcon={<FiPlus />} size="sm" onClick={openNew}>Nueva Oferta</Button>
            </HStack>
          </Flex>

          <Text fontSize="sm" color="gray.500" mb={3}>{filteredOffers.length} ofertas encontradas</Text>
          {(filterPortal || filterStatus || filterCompany || filterJobName || filterModality || filterTech || filterDateFrom || filterDateTo) && (
            <Button size="xs" variant="ghost" colorScheme="red" onClick={() => { setFilterPortal(''); setFilterStatus(''); setFilterCompany(''); setFilterJobName(''); setFilterModality(''); setFilterTech(''); setFilterDateFrom(''); setFilterDateTo(''); }} mb={2}>Limpiar filtros</Button>
          )}

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
          <SimpleGrid columns={{ base: 3, md: 3 }} spacing={3} mb={4}>
            <Box p={3} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
              <Stat><StatLabel fontSize="xs">Ofertas</StatLabel><StatNumber fontSize="xl">{totalSent}</StatNumber></Stat>
            </Box>
            <Box p={3} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
              <Stat><StatLabel fontSize="xs">Respuesta</StatLabel><StatNumber fontSize="xl" color={responseRate >= 30 ? 'green.500' : 'orange.500'}>{responseRate}%</StatNumber></Stat>
            </Box>
            <Box p={3} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
              <Stat><StatLabel fontSize="xs">Portales</StatLabel><StatNumber fontSize="xl">{portalStats.length}</StatNumber></Stat>
            </Box>
          </SimpleGrid>

          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4} mb={5}>
            <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
              <Text fontWeight="bold" mb={2} fontSize="sm">Diarias (14 días)</Text>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="day" fontSize={10} tick={{ fill: textColor }} />
                  <YAxis tick={{ fill: textColor }} />
                  <Tooltip contentStyle={{ bg: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipColor }} />
                  <Bar dataKey="ofertas" fill="#4299E1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
              <Text fontWeight="bold" mb={2} fontSize="sm">Semanales</Text>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="week" fontSize={10} tick={{ fill: textColor }} />
                  <YAxis tick={{ fill: textColor }} />
                  <Tooltip contentStyle={{ bg: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipColor }} />
                  <Bar dataKey="ofertas" fill="#ED8936" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
              <Text fontWeight="bold" mb={2} fontSize="sm">Mensuales</Text>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" fontSize={10} tick={{ fill: textColor }} />
                  <YAxis tick={{ fill: textColor }} />
                  <Tooltip contentStyle={{ bg: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipColor }} />
                  <Bar dataKey="ofertas" fill="#9F7AEA" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
              <Text fontWeight="bold" mb={2} fontSize="sm">Por Portal</Text>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <PieChart>
                  <Pie data={portalStats.length > 0 ? portalStats : [{ name: 'Sin datos', value: 1 }]} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {portalStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ bg: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipColor }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          <Grid templateColumns={{ base: '1fr', lg: `repeat(${detailColumns}, 1fr)` }} gap={4}>
            <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
              <Flex justify="space-between" align="center" mb={2} wrap="wrap" gap={2}>
                <Text fontWeight="bold" fontSize="sm">Detalle por Día</Text>
                <Input size="xs" w="140px" type="date" value={selectedMetricDay} onChange={(e) => setSelectedMetricDay(e.target.value)} />
              </Flex>
              <Badge colorScheme="blue" mb={2}>{dayDetailStats.offers.length} ofertas</Badge>
              {dayDetailStats.byPortal.length > 0 && (
                <HStack spacing={2} mb={2} wrap="wrap">
                  <Text fontSize="xs" fontWeight="bold">Portal:</Text>
                  {dayDetailStats.byPortal.map((p) => <Badge key={p.name} size="sm" colorScheme="orange">{p.name}: {p.value}</Badge>)}
                </HStack>
              )}
              {dayDetailStats.byStatus.length > 0 && (
                <HStack spacing={2} mb={2} wrap="wrap">
                  <Text fontSize="xs" fontWeight="bold">Estado:</Text>
                  {dayDetailStats.byStatus.map((s) => <Badge key={s.name} size="sm" colorScheme="green">{s.name}: {s.value}</Badge>)}
                </HStack>
              )}
              {dayDetailStats.offers.length > 0 ? (
                <VStack align="stretch" mt={2} spacing={1} maxH="200px" overflowY="auto">
                  {dayDetailStats.offers.map((o) => (
                    <HStack key={o.id} p={1.5} bg={rowBg} borderRadius="md" spacing={2} wrap="wrap">
                      <Badge size="xs" colorScheme={JOB_STATUSES[o.status]?.color}>{JOB_STATUSES[o.status]?.label}</Badge>
                      {o.jobName && <Text fontSize="xs" fontWeight="bold">{o.jobName}</Text>}
                      <Text fontSize="xs" fontWeight="semibold">{o.company}</Text>
                      {o.modality && <Badge size="xs" colorScheme={o.modality === 'remoto' ? 'green' : o.modality === 'hibrido' ? 'purple' : 'orange'}>{o.modality}</Badge>}
                      <Text fontSize="xs" color="gray.500">{o.portal}</Text>
                    </HStack>
                  ))}
                </VStack>
              ) : (
                <Text color="gray.500" fontSize="xs">Sin ofertas</Text>
              )}
            </Box>

            <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
              <Flex justify="space-between" align="center" mb={2} wrap="wrap" gap={2}>
                <Text fontWeight="bold" fontSize="sm">Detalle por Semana</Text>
                <Input size="xs" w="140px" type="date" value={selectedMetricWeek} onChange={(e) => setSelectedMetricWeek(e.target.value)} />
              </Flex>
              <Badge colorScheme="purple" mb={2}>{weekDetailStats.offers.length} ofertas</Badge>
              {weekDetailStats.byPortal.length > 0 && (
                <HStack spacing={2} mb={2} wrap="wrap">
                  <Text fontSize="xs" fontWeight="bold">Portal:</Text>
                  {weekDetailStats.byPortal.map((p) => <Badge key={p.name} size="sm" colorScheme="orange">{p.name}: {p.value}</Badge>)}
                </HStack>
              )}
              {weekDetailStats.byStatus.length > 0 && (
                <HStack spacing={2} mb={2} wrap="wrap">
                  <Text fontSize="xs" fontWeight="bold">Estado:</Text>
                  {weekDetailStats.byStatus.map((s) => <Badge key={s.name} size="sm" colorScheme="green">{s.name}: {s.value}</Badge>)}
                </HStack>
              )}
              {weekDetailStats.byModality.length > 0 && (
                <HStack spacing={2} mb={2} wrap="wrap">
                  <Text fontSize="xs" fontWeight="bold">Modalidad:</Text>
                  {weekDetailStats.byModality.map((m) => <Badge key={m.name} size="sm" colorScheme="blue">{m.name}: {m.value}</Badge>)}
                </HStack>
              )}
              {weekDetailStats.offers.length > 0 ? (
                <VStack align="stretch" mt={2} spacing={1} maxH="200px" overflowY="auto">
                  {weekDetailStats.offers.map((o) => (
                    <HStack key={o.id} p={1.5} bg={rowBg} borderRadius="md" spacing={2} wrap="wrap">
                      <Badge size="xs" colorScheme={JOB_STATUSES[o.status]?.color}>{JOB_STATUSES[o.status]?.label}</Badge>
                      {o.jobName && <Text fontSize="xs" fontWeight="bold">{o.jobName}</Text>}
                      <Text fontSize="xs" fontWeight="semibold">{o.company}</Text>
                      {o.modality && <Badge size="xs" colorScheme={o.modality === 'remoto' ? 'green' : o.modality === 'hibrido' ? 'purple' : 'orange'}>{o.modality}</Badge>}
                      <Text fontSize="xs" color="gray.500">{o.portal}</Text>
                    </HStack>
                  ))}
                </VStack>
              ) : (
                <Text color="gray.500" fontSize="xs">Sin ofertas</Text>
              )}
            </Box>

            <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
              <Flex justify="space-between" align="center" mb={2} wrap="wrap" gap={2}>
                <Text fontWeight="bold" fontSize="sm">Detalle por Mes</Text>
                <Input size="xs" w="140px" type="month" value={selectedMetricMonth} onChange={(e) => setSelectedMetricMonth(e.target.value)} />
              </Flex>
              <Badge colorScheme="teal" mb={2}>{monthDetailStats.offers.length} ofertas</Badge>
              {monthDetailStats.byPortal.length > 0 && (
                <HStack spacing={2} mb={2} wrap="wrap">
                  <Text fontSize="xs" fontWeight="bold">Portal:</Text>
                  {monthDetailStats.byPortal.map((p) => <Badge key={p.name} size="sm" colorScheme="orange">{p.name}: {p.value}</Badge>)}
                </HStack>
              )}
              {monthDetailStats.byStatus.length > 0 && (
                <HStack spacing={2} mb={2} wrap="wrap">
                  <Text fontSize="xs" fontWeight="bold">Estado:</Text>
                  {monthDetailStats.byStatus.map((s) => <Badge key={s.name} size="sm" colorScheme="green">{s.name}: {s.value}</Badge>)}
                </HStack>
              )}
              {monthDetailStats.byModality.length > 0 && (
                <HStack spacing={2} mb={2} wrap="wrap">
                  <Text fontSize="xs" fontWeight="bold">Modalidad:</Text>
                  {monthDetailStats.byModality.map((m) => <Badge key={m.name} size="sm" colorScheme="blue">{m.name}: {m.value}</Badge>)}
                </HStack>
              )}
              {monthDetailStats.byTech.length > 0 && (
                <HStack spacing={2} mb={2} wrap="wrap">
                  <Text fontSize="xs" fontWeight="bold">Tech:</Text>
                  {monthDetailStats.byTech.slice(0, 6).map((t) => <Badge key={t.name} size="xs" colorScheme="cyan">{t.name}: {t.value}</Badge>)}
                </HStack>
              )}
              {monthDetailStats.offers.length > 0 ? (
                <VStack align="stretch" mt={2} spacing={1} maxH="200px" overflowY="auto">
                  {monthDetailStats.offers.map((o) => (
                    <HStack key={o.id} p={1.5} bg={rowBg} borderRadius="md" spacing={2} wrap="wrap">
                      <Badge size="xs" colorScheme={JOB_STATUSES[o.status]?.color}>{JOB_STATUSES[o.status]?.label}</Badge>
                      {o.jobName && <Text fontSize="xs" fontWeight="bold">{o.jobName}</Text>}
                      <Text fontSize="xs" fontWeight="semibold">{o.company}</Text>
                      {o.modality && <Badge size="xs" colorScheme={o.modality === 'remoto' ? 'green' : o.modality === 'hibrido' ? 'purple' : 'orange'}>{o.modality}</Badge>}
                      <Text fontSize="xs" color="gray.500">{o.portal}</Text>
                    </HStack>
                  ))}
                </VStack>
              ) : (
                <Text color="gray.500" fontSize="xs">Sin ofertas</Text>
              )}
            </Box>
          </Grid>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
