import React, { useState } from 'react';
import { Box, Flex, Text, HStack, IconButton, Badge, Input, InputGroup, InputLeftElement, Menu, MenuButton, MenuList, MenuItem, Avatar, useColorModeValue, Tooltip, Kbd } from '@chakra-ui/react';
import { FiSearch, FiBell, FiMoon, FiSun, FiMaximize2 } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';
import { formatDate } from '../../utils/helpers';

const pageTitles = {
  '/': 'Dashboard',
  '/agenda': 'Agenda Diaria',
  '/oposiciones': 'Oposiciones',
  '/trabajo': 'Búsqueda de Trabajo',
  '/gym': 'Gimnasio',
  '/portfolio': 'Porfolio',
  '/estadisticas': 'Estadísticas',
  '/automatizaciones': 'Automatizaciones',
  '/gamificacion': 'Gamificación',
  '/configuracion': 'Configuración',
};

export default function Header() {
  const location = useLocation();
  const { notifications, markNotificationRead, clearNotifications, focusMode } = useStore();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const unreadBg = useColorModeValue('blue.50', 'blue.900');
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Flex
      h="60px"
      bg={focusMode ? 'yellow.900' : bg}
      borderBottom="1px solid"
      borderColor={borderColor}
      px={6}
      align="center"
      justify="space-between"
      position="sticky"
      top={0}
      zIndex={90}
      transition="all 0.3s"
    >
      <Flex align="center" gap={3}>
        <Text fontSize="xl" fontWeight="bold">{pageTitles[location.pathname] || 'Icaro'}</Text>
        {focusMode && <Badge colorScheme="yellow" variant="solid">FOCUS MODE</Badge>}
      </Flex>

      <HStack spacing={4}>
        <Text fontSize="sm" color="gray.500">{formatDate(new Date(), "EEEE d 'de' MMMM")}</Text>

        <InputGroup size="sm" w="200px">
          <InputLeftElement><FiSearch /></InputLeftElement>
          <Input placeholder="Buscar..." borderRadius="full" />
        </InputGroup>

        <Menu>
          <MenuButton as={Box} position="relative" cursor="pointer">
            <IconButton icon={<FiBell />} size="sm" variant="ghost" />
            {unreadCount > 0 && (
              <Badge position="absolute" top="-2" right="-2" colorScheme="red" borderRadius="full" fontSize="xs">{unreadCount}</Badge>
            )}
          </MenuButton>
          <MenuList maxH="300px" overflowY="auto">
            {notifications.length === 0 && <MenuItem disabled>No hay notificaciones</MenuItem>}
            {notifications.slice(0, 10).map((n) => (
              <MenuItem key={n.id} onClick={() => markNotificationRead(n.id)} bg={n.read ? 'transparent' : unreadBg}>
                <Box>
                  <Text fontSize="sm" fontWeight={n.read ? 'normal' : 'bold'}>{n.title}</Text>
                  <Text fontSize="xs" color="gray.500">{n.message}</Text>
                </Box>
              </MenuItem>
            ))}
            {notifications.length > 0 && (
              <MenuItem onClick={clearNotifications} color="red.500">Limpiar todas</MenuItem>
            )}
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
}
