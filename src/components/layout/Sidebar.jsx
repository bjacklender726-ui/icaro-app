import React from 'react';
import { Box, Flex, Text, Icon, VStack, HStack, Badge, Avatar, useColorMode, useColorModeValue, Tooltip, IconButton } from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiCalendar, FiBook, FiBriefcase, FiActivity, FiGrid, FiBarChart2, FiZap, FiSettings, FiMoon, FiSun, FiBell, FiLogOut, FiUsers, FiAward } from 'react-icons/fi';
import useStore from '../../store/useStore';

const navItems = [
  { id: 'dashboard', path: '/', label: 'Dashboard', icon: FiHome, color: 'brand.500' },
  { id: 'agenda', path: '/agenda', label: 'Agenda', icon: FiCalendar, color: 'agenda.500' },
  { id: 'oposiciones', path: '/oposiciones', label: 'Oposiciones', icon: FiBook, color: 'oposiciones.500' },
  { id: 'trabajo', path: '/trabajo', label: 'Trabajo', icon: FiBriefcase, color: 'trabajo.500' },
  { id: 'gym', path: '/gym', label: 'Gimnasio', icon: FiActivity, color: 'gym.500' },
  { id: 'proyectos', path: '/proyectos', label: 'Proyectos', icon: FiGrid, color: 'portfolio.500' },
  { id: 'formacion', path: '/formacion', label: 'Formación', icon: FiAward, color: 'teal.500' },
  { id: 'estadisticas', path: '/estadisticas', label: 'Estadísticas', icon: FiBarChart2, color: 'cyan.500' },
  { id: 'automatizaciones', path: '/automatizaciones', label: 'Automatizaciones', icon: FiZap, color: 'yellow.500' },
  { id: 'gamificacion', path: '/gamificacion', label: 'Gamificación', icon: FiSettings, color: 'pink.500' },
  { id: 'configuracion', path: '/configuracion', label: 'Configuración', icon: FiSettings, color: 'gray.500' },
];

export default function Sidebar({ onShowAdmin }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();
  const { level, xp, focusMode, notifications, user, hiddenModules } = useStore();
  const isAdmin = user?.role === 'admin';
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const unreadCount = notifications.filter((n) => !n.read).length;

  const visibleNavItems = navItems.filter(item => !(hiddenModules || []).includes(item.id));

  return (
    <Box
      as="nav"
      w="240px"
      h="100vh"
      bg={bg}
      borderRight="1px solid"
      borderColor={borderColor}
      position="fixed"
      left={0}
      top={0}
      zIndex={100}
      display="flex"
      flexDirection="column"
    >
      <Flex p={4} align="center" gap={3} borderBottom="1px solid" borderColor={borderColor}>
        <Avatar size="sm" name="Icaro" bg="brand.500" />
        <Box>
          <Text fontWeight="bold" fontSize="lg">ICARO</Text>
          <HStack spacing={1}>
            <Badge colorScheme="green" fontSize="xs">Nv.{level}</Badge>
            <Text fontSize="xs" color="gray.500">{xp} XP</Text>
          </HStack>
        </Box>
      </Flex>

      <VStack spacing={1} p={2} flex={1} overflowY="auto" align="stretch">
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Tooltip key={item.path} label={item.label} placement="right" hasArrow>
              <NavLink to={item.path} style={{ textDecoration: 'none' }}>
                <HStack
                  px={3}
                  py={2.5}
                  borderRadius="lg"
                  bg={isActive ? `${item.color}15` : 'transparent'}
                  color={isActive ? item.color : 'gray.500'}
                  _hover={{ bg: `${item.color}10`, color: item.color }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  <Icon as={item.icon} boxSize={5} />
                  <Text fontSize="sm" fontWeight={isActive ? '600' : '400'}>{item.label}</Text>
                </HStack>
              </NavLink>
            </Tooltip>
          );
        })}
        {isAdmin && (
          <Tooltip label="Admin Usuarios" placement="right" hasArrow>
            <Box
              px={3}
              py={2.5}
              borderRadius="lg"
              bg="transparent"
              color="gray.500"
              _hover={{ bg: 'purple.50010', color: 'purple.500' }}
              transition="all 0.2s"
              cursor="pointer"
              onClick={onShowAdmin}
            >
              <HStack>
                <Icon as={FiUsers} boxSize={5} />
                <Text fontSize="sm" fontWeight="400">Admin Usuarios</Text>
              </HStack>
            </Box>
          </Tooltip>
        )}
      </VStack>

      <Flex p={3} borderTop="1px solid" borderColor={borderColor} justify="space-between" align="center">
        <Tooltip label={focusMode ? 'Salir Focus' : 'Modo Focus'} hasArrow>
          <IconButton
            icon={<Icon as={FiMoon} />}
            size="sm"
            variant="ghost"
            colorScheme={focusMode ? 'yellow' : 'gray'}
            onClick={() => useStore.getState().toggleFocusMode()}
          />
        </Tooltip>
        <Tooltip label="Notificaciones" hasArrow>
          <Box position="relative">
            <IconButton icon={<Icon as={FiBell} />} size="sm" variant="ghost" />
            {unreadCount > 0 && (
              <Badge position="absolute" top="-1" right="-1" colorScheme="red" borderRadius="full" fontSize="xs">{unreadCount}</Badge>
            )}
          </Box>
        </Tooltip>
        <Tooltip label={colorMode === 'dark' ? 'Modo claro' : 'Modo oscuro'} hasArrow>
          <IconButton
            icon={<Icon as={colorMode === 'dark' ? FiSun : FiMoon} />}
            size="sm"
            variant="ghost"
            onClick={toggleColorMode}
          />
        </Tooltip>
        <Tooltip label="Cerrar sesión" hasArrow>
          <IconButton
            icon={<Icon as={FiLogOut} />}
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={() => useStore.getState().logout()}
          />
        </Tooltip>
      </Flex>
    </Box>
  );
}
