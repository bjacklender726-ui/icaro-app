import React, { useMemo } from 'react';
import { Box, Grid, Text, VStack, HStack, Badge, Button, Progress, Stat, StatLabel, StatNumber, SimpleGrid, useColorModeValue, Circle, Icon, Flex, Tooltip, Wrap, WrapItem } from '@chakra-ui/react';
import { FiStar, FiAward, FiTarget, FiTrendingUp, FiZap, FiCheck } from 'react-icons/fi';
import useStore from '../../store/useStore';
import { getLevelFromXP, getXPForNextLevel } from '../../utils/helpers';

const BADGES = [
  { id: 'first_task', name: 'Primera Tarea', icon: '🎯', description: 'Completó su primera tarea', requirement: (s) => s.agendaTasks.filter((t) => t.completed).length >= 1 },
  { id: 'study_10h', name: 'Estudiante Dedicado', icon: '📚', description: '10 horas de estudio', requirement: (s) => s.studySessions.reduce((a, ses) => a + (ses.duration || 0), 0) >= 600 },
  { id: 'gym_5', name: 'Gym Warrior', icon: '💪', description: '5 sesiones de gym', requirement: (s) => s.gymSessions.length >= 5 },
  { id: 'offers_10', name: 'Buscador Activo', icon: '💼', description: '10 ofertas enviadas', requirement: (s) => s.jobOffers.length >= 10 },
  { id: 'portfolio_20h', name: 'Constructor', icon: '🏗️', description: '20 horas de proyectos', requirement: (s) => (s.projectLogs || []).reduce((a, l) => a + (l.hours || 0), 0) >= 20 },
  { id: 'level_5', name: 'Nivel 5', icon: '⭐', description: 'Alcanzar nivel 5', requirement: (s) => getLevelFromXP(s.xp) >= 5 },
  { id: 'level_10', name: 'Nivel 10', icon: '🌟', description: 'Alcanzar nivel 10', requirement: (s) => getLevelFromXP(s.xp) >= 10 },
  { id: 'week_streak', name: 'Racha Semanal', icon: '🔥', description: '7 días consecutivos activo', requirement: () => false },
];

const DAILY_MISSIONS = [
  { id: 'm1', name: 'Completar 3 tareas', target: 3, icon: '✅', xp: 20 },
  { id: 'm2', name: 'Estudiar 1 hora', target: 60, icon: '📖', xp: 15 },
  { id: 'm3', name: 'Entrenar hoy', target: 1, icon: '🏋️', xp: 15 },
  { id: 'm4', name: 'Registrar 1h de porfolio', target: 60, icon: '💻', xp: 10 },
  { id: 'm5', name: 'Enviar 1 oferta', target: 1, icon: '💼', xp: 10 },
];

export default function Gamificacion() {
  const store = useStore();
  const { xp, level, badges, addBadge, studySessions, gymSessions, jobOffers, projectLogs, agendaTasks } = store;
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const rowBg = useColorModeValue('gray.50', 'gray.700');

  const nextLevelXP = getXPForNextLevel(xp);
  const progressPct = xp % 100;

  const earnedBadges = useMemo(() => {
    const earned = [];
    BADGES.forEach((b) => {
      if (b.requirement(store)) {
        if (!badges.find((eb) => eb.id === b.id)) {
          addBadge(b);
        }
        earned.push(b);
      } else {
        if (badges.find((eb) => eb.id === b.id)) earned.push(b);
      }
    });
    return earned;
  }, [store, badges]);

  const completedTasksToday = agendaTasks.filter((t) => {
    const today = new Date().toISOString().split('T')[0];
    return t.date === today && t.completed;
  }).length;

  const studyMinToday = studySessions.filter((s) => s.date === new Date().toISOString().split('T')[0]).reduce((a, s) => a + (s.duration || 0), 0);
  const gymSessionsToday = gymSessions.filter((s) => s.date === new Date().toISOString().split('T')[0]).length;
  const portfolioMinToday = projectLogs.filter((l) => l.date === new Date().toISOString().split('T')[0]).reduce((a, l) => a + (l.hours || 0) * 60, 0);

  const missionProgress = [
    { ...DAILY_MISSIONS[0], current: completedTasksToday },
    { ...DAILY_MISSIONS[1], current: studyMinToday },
    { ...DAILY_MISSIONS[2], current: gymSessionsToday },
    { ...DAILY_MISSIONS[3], current: portfolioMinToday },
    { ...DAILY_MISSIONS[4], current: jobOffers.filter((o) => o.date === new Date().toISOString().split('T')[0]).length },
  ];

  const weeklyComparison = useMemo(() => {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      const weekStart = new Date(d);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const total = [...studySessions, ...gymSessions].filter((s) => {
        const sd = new Date(s.date);
        return sd >= weekStart && sd <= weekEnd;
      }).reduce((a, s) => a + (s.duration || 0), 0);
      weeks.push({ week: `Sem ${4 - i}`, horas: +(total / 60).toFixed(1) });
    }
    return weeks;
  }, [studySessions, gymSessions]);

  return (
    <Box>
      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={5} mb={6}>
        <Box p={6} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
          <Flex align="center" gap={6}>
            <Circle size="100px" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" color="white">
              <VStack spacing={0}>
                <Text fontSize="3xl" fontWeight="bold">{level}</Text>
                <Text fontSize="xs">NIVEL</Text>
              </VStack>
            </Circle>
            <Box flex={1}>
              <Text fontWeight="bold" fontSize="xl">¡Sigue así!</Text>
              <Text color="gray.500" mb={2}>{xp} XP total · {nextLevelXP} XP para nivel {level + 1}</Text>
              <Progress value={progressPct} size="lg" colorScheme="purple" borderRadius="full" />
              <HStack mt={2} justify="space-between">
                <Text fontSize="xs" color="gray.400">Nivel {level}</Text>
                <Text fontSize="xs" color="gray.400">Nivel {level + 1}</Text>
              </HStack>
            </Box>
          </Flex>
        </Box>

        <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
          <Text fontWeight="bold" mb={3}>Resumen Hoy</Text>
          <VStack align="stretch" spacing={2}>
            <HStack justify="space-between"><Text fontSize="sm">Tareas completadas</Text><Badge colorScheme="green">{completedTasksToday}</Badge></HStack>
            <HStack justify="space-between"><Text fontSize="sm">Tiempo estudiado</Text><Badge colorScheme="blue">{studyMinToday}min</Badge></HStack>
            <HStack justify="space-between"><Text fontSize="sm">Sesiones gym</Text><Badge colorScheme="red">{gymSessionsToday}</Badge></HStack>
            <HStack justify="space-between"><Text fontSize="sm">Horas porfolio</Text><Badge colorScheme="purple">{(portfolioMinToday / 60).toFixed(1)}h</Badge></HStack>
          </VStack>
        </Box>
      </Grid>

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5} mb={5}>
        <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
          <Text fontWeight="bold" mb={4}><FiTarget style={{ display: 'inline', marginRight: 8 }} />Misiones Diarias</Text>
          <VStack align="stretch" spacing={3}>
            {missionProgress.map((m) => {
              const pct = Math.min((m.current / m.target) * 100, 100);
              const completed = m.current >= m.target;
              return (
                <Box key={m.id} p={3} bg={rowBg} borderRadius="md" opacity={completed ? 0.7 : 1}>
                  <Flex justify="space-between" align="center" mb={1}>
                    <HStack>
                      <Text>{m.icon}</Text>
                      <Text fontSize="sm" fontWeight="bold" textDecoration={completed ? 'line-through' : 'none'}>{m.name}</Text>
                    </HStack>
                    {completed ? <Badge colorScheme="green"><FiCheck size={10} /> Completada</Badge> : <Badge>+{m.xp} XP</Badge>}
                  </Flex>
                  <Progress value={pct} size="sm" colorScheme={completed ? 'green' : 'blue'} borderRadius="full" />
                  <Text fontSize="xs" color="gray.500" mt={1}>{m.current}/{m.target}</Text>
                </Box>
              );
            })}
          </VStack>
        </Box>

        <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
          <Text fontWeight="bold" mb={4}><FiAward style={{ display: 'inline', marginRight: 8 }} />Logros</Text>
          <Wrap spacing={3}>
            {BADGES.map((b) => {
              const earned = earnedBadges.find((eb) => eb.id === b.id);
              return (
                <Tooltip key={b.id} label={`${b.name}: ${b.description}`} hasArrow>
                  <WrapItem>
                    <VStack p={3} bg={rowBg} borderRadius="xl" w="90px" opacity={earned ? 1 : 0.4} cursor="pointer" _hover={{ transform: 'scale(1.05)' }} transition="all 0.2s">
                      <Text fontSize="2xl">{b.icon}</Text>
                      <Text fontSize="xs" textAlign="center" fontWeight="bold">{b.name}</Text>
                    </VStack>
                  </WrapItem>
                </Tooltip>
              );
            })}
          </Wrap>
        </Box>
      </Grid>

      <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
        <Text fontWeight="bold" mb={3}>Comparativa Semanal</Text>
        <HStack spacing={3} align="end">
          {weeklyComparison.map((w) => (
            <VStack key={w.week} flex={1}>
              <Text fontSize="sm" fontWeight="bold">{w.horas}h</Text>
              <Box w="100%" bg="purple.500" borderRadius="md" h={`${Math.max(w.horas * 5, 10)}px`} transition="all 0.3s" />
              <Text fontSize="xs" color="gray.500">{w.week}</Text>
            </VStack>
          ))}
        </HStack>
      </Box>
    </Box>
  );
}
