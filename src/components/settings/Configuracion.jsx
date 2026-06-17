import React, { useState } from 'react';
import { Box, Grid, Text, VStack, HStack, Badge, Button, IconButton, Switch, FormControl, FormLabel, Input, Select, useColorMode, useColorModeValue, Divider, SimpleGrid, Stat, StatLabel, StatNumber, Alert, AlertIcon, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Flex } from '@chakra-ui/react';
import { FiSettings, FiShield, FiDatabase, FiDownload, FiUpload, FiTrash2, FiSave, FiClock } from 'react-icons/fi';
import useStore from '../../store/useStore';

export default function Configuracion() {
  const { colorMode, toggleColorMode } = useColorMode();
  const store = useStore();
  const { backups, createBackup, restoreBackup, deleteBackup, clearSection, clearAll } = store;
  const { isOpen: isClearAllOpen, onOpen: onClearAllOpen, onClose: onClearAllClose } = useDisclosure();
  const { isOpen: isClearSectionOpen, onOpen: onClearSectionOpen, onClose: onClearSectionClose } = useDisclosure();
  const { isOpen: isRestoreOpen, onOpen: onRestoreOpen, onClose: onRestoreClose } = useDisclosure();
  const [backupName, setBackupName] = useState('');
  const [selectedSection, setSelectedSection] = useState('agenda');
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [exported, setExported] = useState(false);
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const rowBg = useColorModeValue('gray.50', 'gray.700');

  const sectionLabels = {
    agenda: 'Agenda',
    oposiciones: 'Oposiciones',
    trabajo: 'Trabajo',
    gym: 'Gimnasio',
    proyectos: 'Proyectos',
    automatizaciones: 'Automatizaciones',
  };

  const handleCreateBackup = () => {
    createBackup(backupName);
    setBackupName('');
  };

  const handleExport = () => {
    const data = JSON.stringify({ ...store, backups: undefined }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icaro-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        Object.keys(data).forEach((key) => {
          if (typeof store[key] !== 'function') {
            useStore.setState({ [key]: data[key] });
          }
        });
      } catch (err) {
        console.error('Error importing data');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Box>
      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
        <VStack spacing={5} align="stretch">
          <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
            <HStack mb={4}><FiSettings /><Text fontWeight="bold">Apariencia</Text></HStack>
            <VStack align="stretch" spacing={4}>
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb={0}>Modo Oscuro</FormLabel>
                <Switch isChecked={colorMode === 'dark'} onChange={toggleColorMode} />
              </FormControl>
            </VStack>
          </Box>

          <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
            <HStack mb={4}><FiSave /><Text fontWeight="bold">Copias de Seguridad</Text></HStack>
            <VStack align="stretch" spacing={4}>
              <HStack>
                <Input size="sm" placeholder="Nombre del backup" value={backupName} onChange={(e) => setBackupName(e.target.value)} />
                <Button size="sm" colorScheme="green" onClick={handleCreateBackup}>Crear Backup</Button>
              </HStack>
              <Text fontSize="xs" color="gray.500">{backups.length} backups guardados</Text>
              <VStack align="stretch" spacing={2} maxH="200px" overflowY="auto">
                {backups.length === 0 && <Text color="gray.500" fontSize="sm">No hay backups</Text>}
                {backups.map((b) => (
                  <Flex key={b.id} p={2} bg={rowBg} borderRadius="md" justify="space-between" align="center">
                    <Box>
                      <Text fontSize="sm" fontWeight="bold">{b.name}</Text>
                      <Text fontSize="xs" color="gray.500">{new Date(b.date).toLocaleString('es')}</Text>
                    </Box>
                    <HStack>
                      <Button size="xs" colorScheme="blue" onClick={() => { setSelectedBackup(b); onRestoreOpen(); }}>Restaurar</Button>
                      <IconButton icon={<FiTrash2 />} size="xs" colorScheme="red" onClick={() => deleteBackup(b.id)} />
                    </HStack>
                  </Flex>
                ))}
              </VStack>
            </VStack>
          </Box>

          <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
            <HStack mb={4}><FiDatabase /><Text fontWeight="bold">Importar / Exportar</Text></HStack>
            <VStack align="stretch" spacing={3}>
              <HStack>
                <Button leftIcon={<FiDownload />} onClick={handleExport} flex={1}>Exportar JSON</Button>
                <Button leftIcon={<FiUpload />} as="label" flex={1} cursor="pointer">
                  Importar JSON
                  <input type="file" accept=".json" hidden onChange={handleImport} />
                </Button>
              </HStack>
              {exported && <Alert status="success" borderRadius="md" size="sm"><AlertIcon />Exportado correctamente</Alert>}
            </VStack>
          </Box>
        </VStack>

        <VStack spacing={5} align="stretch">
          <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
            <HStack mb={4}><FiTrash2 /><Text fontWeight="bold">Limpiar Datos</Text></HStack>
            <VStack align="stretch" spacing={4}>
              <FormControl>
                <FormLabel>Limpiar sección</FormLabel>
                <HStack>
                  <Select size="sm" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                    {Object.entries(sectionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </Select>
                  <Button size="sm" colorScheme="red" variant="outline" onClick={onClearSectionOpen}>Limpiar</Button>
                </HStack>
              </FormControl>
              <Divider />
              <Button colorScheme="red" leftIcon={<FiTrash2 />} onClick={onClearAllOpen}>Borrar Todo (excepto backups)</Button>
            </VStack>
          </Box>

          <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
            <Text fontWeight="bold" mb={4}>Estadísticas de la App</Text>
            <SimpleGrid columns={2} spacing={3}>
              <Box p={3} bg={rowBg} borderRadius="md" textAlign="center">
                <Stat><StatLabel fontSize="xs">Tareas</StatLabel><StatNumber fontSize="lg">{store.agendaTasks?.length || 0}</StatNumber></Stat>
              </Box>
              <Box p={3} bg={rowBg} borderRadius="md" textAlign="center">
                <Stat><StatLabel fontSize="xs">Sesiones</StatLabel><StatNumber fontSize="lg">{(store.studySessions?.length || 0) + (store.gymSessions?.length || 0)}</StatNumber></Stat>
              </Box>
              <Box p={3} bg={rowBg} borderRadius="md" textAlign="center">
                <Stat><StatLabel fontSize="xs">Ofertas</StatLabel><StatNumber fontSize="lg">{store.jobOffers?.length || 0}</StatNumber></Stat>
              </Box>
              <Box p={3} bg={rowBg} borderRadius="md" textAlign="center">
                <Stat><StatLabel fontSize="xs">Nivel</StatLabel><StatNumber fontSize="lg">{store.level || 1}</StatNumber></Stat>
              </Box>
            </SimpleGrid>
          </Box>

          <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
            <Text fontWeight="bold" mb={2}>Acerca de ICARO</Text>
            <Text fontSize="sm" color="gray.500">Versión 1.0.0</Text>
            <Text fontSize="xs" color="gray.400" mt={2}>Sistema de productividad personal con microservicios, gamificación y automatizaciones.</Text>
          </Box>
        </VStack>
      </Grid>

      <Modal isOpen={isClearAllOpen} onClose={onClearAllClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>⚠️ Borrar Todo</ModalHeader>
          <ModalCloseButton />
          <ModalBody><Text>Se borrarán todos los datos de todas las secciones. Los backups NO se eliminarán. ¿Continuar?</Text></ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClearAllClose}>Cancelar</Button>
            <Button colorScheme="red" onClick={() => { clearAll(); onClearAllClose(); }}>Borrar Todo</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isClearSectionOpen} onClose={onClearSectionClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>⚠️ Limpiar {sectionLabels[selectedSection]}</ModalHeader>
          <ModalCloseButton />
          <ModalBody><Text>Se borrarán todos los datos de <strong>{sectionLabels[selectedSection]}</strong>. ¿Continuar?</Text></ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClearSectionClose}>Cancelar</Button>
            <Button colorScheme="red" onClick={() => { clearSection(selectedSection); onClearSectionClose(); }}>Limpiar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isRestoreOpen} onClose={onRestoreClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>⚠️ Restaurar Backup</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Se reemplazarán TODOS los datos actuales con los del backup <strong>"{selectedBackup?.name}"</strong>. Los backups actuales NO se eliminarán.</Text>
            <Alert status="warning" mt={3} borderRadius="md" size="sm"><AlertIcon />Esta acción se puede revertir creando un backup antes de restaurar.</Alert>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRestoreClose}>Cancelar</Button>
            <Button colorScheme="blue" onClick={() => { if (selectedBackup) restoreBackup(selectedBackup.id); onRestoreClose(); }}>Restaurar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

