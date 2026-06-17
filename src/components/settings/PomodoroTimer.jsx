import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, Button, HStack, VStack, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, FormControl, FormLabel, Input, IconButton, useColorModeValue, Tooltip, Circle } from '@chakra-ui/react';
import { FiPlay, FiPause, FiRefreshCw, FiSettings, FiMaximize2 } from 'react-icons/fi';
import useStore from '../../store/useStore';

export default function PomodoroTimer() {
  const { pomodoroActive, pomodoroMinutes, togglePomodoro, setPomodoro, focusMode, addNotification } = useStore();
  const [timeLeft, setTimeLeft] = useState(pomodoroMinutes * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [customMin, setCustomMin] = useState(pomodoroMinutes);
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    setTimeLeft(pomodoroMinutes * 60);
  }, [pomodoroMinutes]);

  useEffect(() => {
    if (pomodoroActive && !isPaused) {
      const interval = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(interval);
            if (!isBreak) {
              addNotification({ title: 'Pomodoro completado', message: '¡Toma un descanso de 5 minutos!' });
              setIsBreak(true);
              setTimeLeft(5 * 60);
              setIsPaused(false);
            } else {
              addNotification({ title: 'Descanso terminado', message: '¡Listo para otro pomodoro!' });
              setIsBreak(false);
              setTimeLeft(pomodoroMinutes * 60);
              setIsPaused(true);
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [pomodoroActive, isPaused, isBreak]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const progress = isBreak ? ((5 * 60 - timeLeft) / (5 * 60)) * 100 : ((pomodoroMinutes * 60 - timeLeft) / (pomodoroMinutes * 60)) * 100;

  const handleSave = () => {
    setPomodoro(customMin);
    setTimeLeft(customMin * 60);
    onClose();
  };

  if (!pomodoroActive) return null;

  return (
    <>
      <Box
        position="fixed"
        bottom={5}
        right={5}
        bg={isBreak ? 'green.800' : 'red.800'}
        color="white"
        p={4}
        borderRadius="xl"
        boxShadow="2xl"
        zIndex={200}
        minW="200px"
      >
        <VStack spacing={2}>
          <Text fontSize="xs" fontWeight="bold">{isBreak ? 'DESCANSO' : 'POMODORO'}</Text>
          <Circle size="80px" position="relative">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
              <circle cx="40" cy="40" r="35" fill="none" stroke="white" strokeWidth="4" strokeDasharray={`${2 * Math.PI * 35}`} strokeDashoffset={`${2 * Math.PI * 35 * (1 - progress / 100)}`} transform="rotate(-90 40 40)" strokeLinecap="round" />
            </svg>
            <Text position="absolute" fontSize="lg" fontWeight="bold">{formatTime(timeLeft)}</Text>
          </Circle>
          <HStack>
            <IconButton icon={isPaused ? <FiPlay /> : <FiPause />} size="xs" onClick={() => setIsPaused(!isPaused)} />
            <IconButton icon={<FiRefreshCw />} size="xs" onClick={() => { setTimeLeft(isBreak ? 5 * 60 : pomodoroMinutes * 60); setIsPaused(true); }} />
            <IconButton icon={<FiSettings />} size="xs" onClick={onOpen} />
          </HStack>
        </VStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pomodoro Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Duración (minutos)</FormLabel>
              <Input type="number" value={customMin} onChange={(e) => setCustomMin(parseInt(e.target.value) || 25)} />
            </FormControl>
          </ModalBody>
          <ModalCloseButton />
          <Button m={4} onClick={handleSave}>Guardar</Button>
        </ModalContent>
      </Modal>
    </>
  );
}
