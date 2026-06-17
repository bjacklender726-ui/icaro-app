import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Header from './Header';
import PomodoroTimer from '../settings/PomodoroTimer';

export default function Layout({ children }) {
  return (
    <Flex minH="100vh">
      <Sidebar />
      <Box ml="240px" flex={1} display="flex" flexDirection="column">
        <Header />
        <Box flex={1} p={6} overflowY="auto">
          {children}
        </Box>
      </Box>
      <PomodoroTimer />
    </Flex>
  );
}
