import React, { useMemo } from 'react';
import { Box, Grid, Text, Flex, Stat, StatLabel, StatNumber, Badge, HStack, VStack, Progress, useColorModeValue, Icon, SimpleGrid, Circle } from '@chakra-ui/react';
import { FiBook, FiBriefcase, FiActivity, FiGrid, FiClock, FiTarget } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import useStore from '../../store/useStore';
import { formatDate } from '../../utils/helpers';
import { useRechartStyles } from '../../utils/rechartStyles';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';

const StatCard = ({ icon, label, value, change, color, sub }) => {
  const bg = useColorModeValue('white', 'gray.800');
  return (
    <Box bg={bg} p={5} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={useColorModeValue('gray.200', 'gray.700')} _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }} transition="all 0.2s">
      <Flex justify="space-between" align="start">
        <Box>
          <Text fontSize="sm" color="gray.500">{label}</Text>
          <Text fontSize="2xl" fontWeight="bold">{value}</Text>
          {sub && <Text fontSize="xs" color="gray.400">{sub}</Text>}
        </Box>
        <Circle size="45px" bg={`${color}15`}>
          <Icon as={icon} color={color} boxSize={5} />
        </Circle>
      </Flex>
    </Box>
  );
};

export default function Dashboard() {
  const { agendaTasks, studySessions, jobOffers, gymSessions, projectLogs, temarios, level, xp } = useStore();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const rowBg = useColorModeValue('gray.50', 'gray.700');
  const { textColor, gridColor, tooltipBg, tooltipBorder, tooltipColor } = useRechartStyles();

  const todayTasks = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return agendaTasks.filter((t) => t.date === today);
  }, [agendaTasks]);

  const productivityData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const study = studySessions.filter((s) => s.date === dateStr).reduce((a, s) => a + (s.duration || 0), 0);
      const gym = gymSessions.filter((s) => s.date === dateStr).reduce((a, s) => a + (s.duration || 0), 0);
      const project = projectLogs.filter((l) => l.date === dateStr).reduce((a, l) => a + (l.hours || 0) * 60, 0);
      return { day: format(d, 'EEE'), estudio: +(study / 60).toFixed(1), gimnasio: +(gym / 60).toFixed(1), proyectos: +(project / 60).toFixed(1) };
    });
  }, [studySessions, gymSessions, projectLogs]);

  const totalStudyHours = useMemo(() => +(studySessions.reduce((a, s) => a + (s.duration || 0), 0) / 60).toFixed(1), [studySessions]);
  const totalGymSessions = gymSessions.length;
  const totalJobOffers = jobOffers.length;
  const totalProjectHours = useMemo(() => +(projectLogs.reduce((a, l) => a + (l.hours || 0), 0)).toFixed(1), [projectLogs]);

  const COLORS = ['#4299E1', '#48BB78', '#ED8936', '#E53E3E', '#9F7AEA'];

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={6}>
        <StatCard icon={FiClock} label="Horas de Estudio" value={`${totalStudyHours}h`} change={12} color="#4299E1" sub={`${studySessions.length} sesiones`} />
        <StatCard icon={FiActivity} label="Sesiones de Gym" value={totalGymSessions} change={8} color="#E53E3E" sub="esta semana" />
        <StatCard icon={FiBriefcase} label="Ofertas Enviadas" value={totalJobOffers} change={-3} color="#ED8936" sub="total" />
        <StatCard icon={FiGrid} label="Horas Proyectos" value={`${totalProjectHours}h`} change={20} color="#9F7AEA" sub="invertidas" />
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={5} mb={5}>
        <Box bg={bg} p={5} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
          <Text fontWeight="bold" mb={4}>Productividad Semanal</Text>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={productivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="day" fontSize={12} tick={{ fill: textColor }} />
              <YAxis fontSize={12} tick={{ fill: textColor }} />
              <Tooltip contentStyle={{ bg: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipColor }} />
              <Bar dataKey="estudio" fill="#4299E1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gimnasio" fill="#E53E3E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="proyectos" fill="#9F7AEA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <VStack spacing={5} align="stretch">
          <Box bg={bg} p={5} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
            <Text fontWeight="bold" mb={3}>Nivel y Progreso</Text>
            <Flex align="center" gap={3} mb={3}>
              <Circle size="50px" bg="brand.500" color="white" fontWeight="bold" fontSize="xl">{level}</Circle>
              <Box flex={1}>
                <Text fontSize="sm">Nivel {level}</Text>
                <Progress value={xp % 100} colorScheme="blue" size="sm" borderRadius="full" />
                <Text fontSize="xs" color="gray.500">{100 - (xp % 100)} XP para nivel {level + 1}</Text>
              </Box>
            </Flex>
          </Box>
        </VStack>
      </Grid>

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5}>
        <Box bg={bg} p={5} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
          <Text fontWeight="bold" mb={3}>Tareas de Hoy ({todayTasks.length})</Text>
          <VStack align="stretch" spacing={2} maxH="200px" overflowY="auto">
            {todayTasks.length === 0 && <Text color="gray.500" fontSize="sm">No hay tareas para hoy</Text>}
            {todayTasks.slice(0, 5).map((t) => (
              <Flex key={t.id} p={2} bg={rowBg} borderRadius="md" justify="space-between" align="center">
                <Text fontSize="sm" textDecoration={t.completed ? 'line-through' : 'none'} opacity={t.completed ? 0.5 : 1}>{t.title}</Text>
                <Badge colorScheme={t.completed ? 'green' : 'blue'} fontSize="xs">{t.hour || '--:--'}</Badge>
              </Flex>
            ))}
          </VStack>
        </Box>

        <Box bg={bg} p={5} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
          <Text fontWeight="bold" mb={3}>Actividad Reciente</Text>
          <VStack align="stretch" spacing={2} maxH="200px" overflowY="auto">
            {[...studySessions, ...gymSessions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map((s) => (
              <Flex key={s.id} p={2} bg={rowBg} borderRadius="md" gap={2} align="center">
                <Circle size="8px" bg={s.type === 'study' ? 'blue.400' : 'red.400'} />
                <Box flex={1}>
                  <Text fontSize="sm">{s.topicName || s.routineName || 'Actividad'}</Text>
                  <Text fontSize="xs" color="gray.500">{s.duration || 0} min - {formatDate(s.createdAt, 'dd/MM HH:mm')}</Text>
                </Box>
              </Flex>
            ))}
          </VStack>
        </Box>
      </Grid>
    </Box>
  );
}
