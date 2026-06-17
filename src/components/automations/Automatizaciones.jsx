import React, { useState } from 'react';
import { Box, Flex, Grid, Text, VStack, HStack, Badge, Button, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, Input, Select, Switch, Textarea, useColorModeValue, SimpleGrid, Stat, StatLabel, StatNumber } from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiZap, FiPlay, FiPause, FiSettings, FiGithub, FiLinkedin, FiCalendar } from 'react-icons/fi';
import useStore from '../../store/useStore';
import { formatDate } from '../../utils/helpers';

const AUTOMATION_TEMPLATES = [
  { id: 'study_break', name: 'Descanso post-estudio', description: 'Si estudio 2h → añade descanso', trigger: 'Estudiar 120 min', action: 'Crear tarea de descanso', icon: '📖' },
  { id: 'weekly_review', name: 'Revisión semanal', description: 'Si envío 5 ofertas → crea tarea de revisión', trigger: 'Enviar 5 ofertas', action: 'Crear tarea de revisión', icon: '💼' },
  { id: 'gym_goal', name: 'Objetivo semanal gym', description: 'Si entreno 3 días → marca objetivo semanal', trigger: 'Entrenar 3 días', action: 'Marcar objetivo completado', icon: '🏋️' },
  { id: 'focus_pomodoro', name: 'Pomodoro Focus', description: 'Temporizador de 25 min con descanso', trigger: 'Iniciar Pomodoro', action: 'Temporizador 25/5 min', icon: '🍅' },
  { id: 'github_sync', name: 'Sync GitHub', description: 'Sincronizar porfolio con GitHub', trigger: 'Cada 24h', action: 'Pull de repositorios', icon: '🔗' },
  { id: 'daily_report', name: 'Reporte diario', description: 'Generar resumen de productividad', trigger: '22:00 diario', action: 'Crear resumen del día', icon: '📊' },
];

function AutomationCard({ automation, onEdit, onDelete }) {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { updateAutomation } = useStore();

  return (
    <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} _hover={{ boxShadow: 'lg' }} transition="all 0.2s">
      <Flex justify="space-between" align="start">
        <HStack spacing={3}>
          <Text fontSize="2xl">{automation.icon || '⚡'}</Text>
          <Box>
            <HStack>
              <Text fontWeight="bold">{automation.name}</Text>
              <Badge colorScheme={automation.enabled ? 'green' : 'gray'}>{automation.enabled ? 'Activa' : 'Inactiva'}</Badge>
            </HStack>
            <Text fontSize="sm" color="gray.500">{automation.description}</Text>
            <HStack mt={2} fontSize="xs" color="gray.400">
              <Badge colorScheme="blue" variant="outline">SI: {automation.trigger}</Badge>
              <Badge colorScheme="green" variant="outline">ENTONCES: {automation.action}</Badge>
            </HStack>
          </Box>
        </HStack>
        <HStack>
          <Switch size="sm" isChecked={automation.enabled} onChange={(e) => updateAutomation(automation.id, { enabled: e.target.checked })} colorScheme="green" />
          <IconButton icon={<FiTrash2 />} size="xs" colorScheme="red" variant="ghost" onClick={() => onDelete(automation.id)} />
        </HStack>
      </Flex>
    </Box>
  );
}

export default function Automatizaciones() {
  const { automations, addAutomation, deleteAutomation } = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customForm, setCustomForm] = useState({ name: '', trigger: '', action: '', description: '', icon: '⚡' });
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const rowBg = useColorModeValue('gray.50', 'gray.700');

  const useTemplate = (template) => {
    addAutomation({
      ...template,
      enabled: true,
      isTemplate: true,
    });
  };

  const saveCustom = () => {
    addAutomation({ ...customForm, enabled: true });
    setCustomForm({ name: '', trigger: '', action: '', description: '', icon: '⚡' });
    onClose();
  };

  const activeCount = automations.filter((a) => a.enabled).length;

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel><FiZap style={{ display: 'inline' }} /> Automatizaciones</StatLabel><StatNumber>{automations.length}</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel><FiPlay style={{ display: 'inline' }} /> Activas</StatLabel><StatNumber color="green.500">{activeCount}</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel><FiPause style={{ display: 'inline' }} /> Inactivas</StatLabel><StatNumber color="gray.500">{automations.length - activeCount}</StatNumber></Stat>
        </Box>
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={5} mb={6}>
        <Box>
          <Flex justify="space-between" mb={4}>
            <Text fontWeight="bold">Plantillas</Text>
          </Flex>
          <VStack spacing={3} align="stretch">
            {AUTOMATION_TEMPLATES.map((t) => (
              <Box key={t.id} p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
                <Flex justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Text fontSize="xl">{t.icon}</Text>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm">{t.name}</Text>
                      <Text fontSize="xs" color="gray.500">{t.description}</Text>
                    </Box>
                  </HStack>
                  <Button size="xs" leftIcon={<FiPlus />} onClick={() => useTemplate(t)}>Usar</Button>
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>

        <Box>
          <Flex justify="space-between" mb={4}>
            <Text fontWeight="bold">Mis Automatizaciones</Text>
            <Button leftIcon={<FiPlus />} size="sm" onClick={onOpen}>Nueva</Button>
          </Flex>
          <VStack spacing={3} align="stretch">
            {automations.length === 0 && <Text color="gray.500" textAlign="center" py={4}>No hay automatizaciones creadas</Text>}
            {automations.map((a) => (
              <AutomationCard key={a.id} automation={a} onDelete={deleteAutomation} />
            ))}
          </VStack>
        </Box>
      </Grid>

      <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
        <Text fontWeight="bold" mb={4}>Sincronizaciones Externas</Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <HStack p={4} bg={rowBg} borderRadius="xl" justify="space-between">
            <HStack><FiGithub /><Box><Text fontWeight="bold" fontSize="sm">GitHub</Text><Text fontSize="xs" color="gray.500">Porfolio sync</Text></Box></HStack>
            <Badge colorScheme="green">Conectado</Badge>
          </HStack>
          <HStack p={4} bg={rowBg} borderRadius="xl" justify="space-between">
            <HStack><FiLinkedin /><Box><Text fontWeight="bold" fontSize="sm">LinkedIn</Text><Text fontSize="xs" color="gray.500">Ofertas sync</Text></Box></HStack>
            <Badge colorScheme="yellow">Pendiente</Badge>
          </HStack>
          <HStack p={4} bg={rowBg} borderRadius="xl" justify="space-between">
            <HStack><FiCalendar /><Box><Text fontWeight="bold" fontSize="sm">Google Calendar</Text><Text fontSize="xs" color="gray.500">Agenda sync</Text></Box></HStack>
            <Badge colorScheme="yellow">Pendiente</Badge>
          </HStack>
        </SimpleGrid>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nueva Automatización</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl><FormLabel>Nombre</FormLabel><Input value={customForm.name} onChange={(e) => setCustomForm((f) => ({ ...f, name: e.target.value }))} /></FormControl>
              <FormControl><FormLabel>Descripción</FormLabel><Input value={customForm.description} onChange={(e) => setCustomForm((f) => ({ ...f, description: e.target.value }))} /></FormControl>
              <FormControl><FormLabel>Condición (SI...)</FormLabel><Textarea value={customForm.trigger} onChange={(e) => setCustomForm((f) => ({ ...f, trigger: e.target.value }))} placeholder="Ej: Si estudio más de 2 horas..." /></FormControl>
              <FormControl><FormLabel>Acción (ENTONCES...)</FormLabel><Textarea value={customForm.action} onChange={(e) => setCustomForm((f) => ({ ...f, action: e.target.value }))} placeholder="Ej: Crear tarea de descanso" /></FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button onClick={saveCustom} isDisabled={!customForm.name || !customForm.trigger || !customForm.action}>Crear</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}


