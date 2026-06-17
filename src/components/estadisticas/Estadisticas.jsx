import React, { useMemo } from 'react';
import { Box, Flex, Grid, Text, VStack, HStack, Badge, SimpleGrid, Stat, StatLabel, StatNumber, useColorModeValue, Progress, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { FiBook, FiActivity, FiBriefcase, FiGrid, FiTrendingUp, FiClock } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import useStore from '../../store/useStore';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import { useRechartStyles } from '../../utils/rechartStyles';

export default function Estadisticas() {
  const store = useStore();
  const { studySessions, gymSessions, jobOffers, projectLogs, resetStats } = store;
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { textColor, gridColor, tooltipBg, tooltipBorder, tooltipColor } = useRechartStyles();

  const last30Days = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = subDays(new Date(), 29 - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const study = studySessions.filter((s) => s.date === dateStr).reduce((a, s) => a + (s.duration || 0), 0);
      const gym = gymSessions.filter((s) => s.date === dateStr).reduce((a, s) => a + (s.duration || 0), 0);
      const project = projectLogs.filter((l) => l.date === dateStr).reduce((a, l) => a + (l.hours || 0) * 60, 0);
      return { date: format(d, 'dd/MM'), estudio: +(study / 60).toFixed(1), gimnasio: +(gym / 60).toFixed(1), proyectos: +(project / 60).toFixed(1), total: +((study + gym + project) / 60).toFixed(1) };
    });
  }, [studySessions, gymSessions, projectLogs]);

  const weeklyDistribution = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return days.map((day, i) => {
      const sessions = [...studySessions, ...gymSessions].filter((s) => (new Date(s.date || s.createdAt).getDay() + 6) % 7 === i);
      return { day, horas: +(sessions.reduce((a, s) => a + (s.duration || 0), 0) / 60).toFixed(1) };
    });
  }, [studySessions, gymSessions]);

  const totalStudyH = +(studySessions.reduce((a, s) => a + (s.duration || 0), 0) / 60).toFixed(1);
  const totalGymH = +(gymSessions.reduce((a, s) => a + (s.duration || 0), 0) / 60).toFixed(1);
  const totalProjectH = +(projectLogs.reduce((a, l) => a + (l.hours || 0), 0)).toFixed(1);
  const totalAllH = totalStudyH + totalGymH + totalProjectH;

  const moduleDistribution = [
    { module: 'Estudio', hours: totalStudyH },
    { module: 'Gimnasio', hours: totalGymH },
    { module: 'Proyectos', hours: totalProjectH },
    { module: 'Trabajo', hours: +(jobOffers.length * 0.5).toFixed(1) },
  ];

  const COLORS = ['#4299E1', '#E53E3E', '#9F7AEA', '#ED8936'];

  const bestDays = useMemo(() => {
    const dayData = {};
    last30Days.forEach((d) => { if (d.total > 0) dayData[d.date] = d.total; });
    return Object.entries(dayData).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [last30Days]);

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontWeight="bold" fontSize="xl">Estadísticas Globales</Text>
        <Button colorScheme="red" variant="outline" size="sm" onClick={onOpen}>Resetear Estadísticas</Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Tiempo Total</StatLabel><StatNumber>{totalAllH}h</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel><FiBook style={{ display: 'inline', marginRight: 4 }} />Estudio</StatLabel><StatNumber color="blue.500">{totalStudyH}h</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel><FiActivity style={{ display: 'inline', marginRight: 4 }} />Gimnasio</StatLabel><StatNumber color="red.500">{totalGymH}h</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel><FiGrid style={{ display: 'inline', marginRight: 4 }} />Proyectos</StatLabel><StatNumber color="purple.500">{totalProjectH}h</StatNumber></Stat>
        </Box>
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={5} mb={5}>
        <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
          <Text fontWeight="bold" mb={3}>Actividad - Últimos 30 días</Text>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={last30Days}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4299E1" stopOpacity={0.3} /><stop offset="95%" stopColor="#4299E1" stopOpacity={0} /></linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#E53E3E" stopOpacity={0.3} /><stop offset="95%" stopColor="#E53E3E" stopOpacity={0} /></linearGradient>
                <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#9F7AEA" stopOpacity={0.3} /><stop offset="95%" stopColor="#9F7AEA" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" fontSize={10} interval={4} tick={{ fill: textColor }} />
              <YAxis fontSize={12} tick={{ fill: textColor }} />
              <Tooltip contentStyle={{ bg: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipColor }} />
              <Area type="monotone" dataKey="estudio" stroke="#4299E1" fill="url(#g1)" />
              <Area type="monotone" dataKey="gimnasio" stroke="#E53E3E" fill="url(#g2)" />
              <Area type="monotone" dataKey="proyectos" stroke="#9F7AEA" fill="url(#g3)" />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        <VStack spacing={5} align="stretch">
          <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
            <Text fontWeight="bold" mb={3}>Distribución por Módulo</Text>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={moduleDistribution.filter((m) => m.hours > 0)} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="hours">
                  {moduleDistribution.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ bg: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipColor }} />
              </PieChart>
            </ResponsiveContainer>
            <VStack align="stretch" mt={2}>
              {moduleDistribution.map((m, i) => (
                <HStack key={m.module} justify="space-between">
                  <HStack><Box w="10px" h="10px" borderRadius="2px" bg={COLORS[i]} /><Text fontSize="xs">{m.module}</Text></HStack>
                  <Text fontSize="xs" fontWeight="bold">{m.hours}h</Text>
                </HStack>
              ))}
            </VStack>
          </Box>

          <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
            <Text fontWeight="bold" mb={3}>Días Más Productivos</Text>
            <VStack align="stretch" spacing={2}>
              {bestDays.map(([date, hours], i) => (
                <HStack key={date} justify="space-between">
                  <HStack><Badge colorScheme="green" fontSize="xs">#{i + 1}</Badge><Text fontSize="sm">{date}</Text></HStack>
                  <Text fontSize="sm" fontWeight="bold">{hours}h</Text>
                </HStack>
              ))}
              {bestDays.length === 0 && <Text color="gray.500" fontSize="sm">Sin datos</Text>}
            </VStack>
          </Box>
        </VStack>
      </Grid>

      <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
        <Text fontWeight="bold" mb={3}>Distribución Semanal</Text>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="day" fontSize={12} tick={{ fill: textColor }} />
            <YAxis tick={{ fill: textColor }} />
            <Tooltip contentStyle={{ bg: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipColor }} />
            <Bar dataKey="horas" fill="#48BB78" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>⚠️ Resetear Estadísticas</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Esta acción eliminará todos los datos de sesiones, ofertas, logs de proyectos y gamificación. No se puede deshacer.</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="red" onClick={() => { resetStats(); onClose(); }}>Resetear Todo</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}


