import React, { useState } from 'react';
import { Box, VStack, Heading, Text, Button, Badge, HStack, useColorModeValue, Alert, AlertIcon, Tabs, TabList, TabPanels, Tab, TabPanel, SimpleGrid, Stat, StatLabel, StatNumber, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { FiCheck, FiX, FiTrash2, FiUsers, FiClock, FiMail, FiArrowLeft } from 'react-icons/fi';
import useStore from '../../store/useStore';
import { sendCredentialsEmail, initEmailJS } from '../../utils/emailService';

initEmailJS();

export default function AdminUsers({ onBack }) {
  const { users, pendingUsers, approveUser, rejectUser, deleteUser, user } = useStore();
  const [alert, setAlert] = useState({ type: '', message: '' });
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleApprove = async (userId) => {
    const approved = approveUser(userId);
    if (approved) {
      const emailResult = await sendCredentialsEmail(approved.email, approved.name, approved.username, 'Tu contraseña');
      const emailMsg = emailResult.mocked ? ' (EmailJS no configurado — credentials logueadas en consola)' : '';
      setAlert({ type: 'success', message: `${approved.name} aprobado correctamente${emailMsg}` });
      setTimeout(() => setAlert({ type: '', message: '' }), 8000);
    }
  };

  const handleReject = (userId) => {
    rejectUser(userId);
    setAlert({ type: 'info', message: 'Solicitud rechazada' });
    setTimeout(() => setAlert({ type: '', message: '' }), 3000);
  };

  const confirmDelete = (u) => {
    setDeleteTarget(u);
    onOpen();
  };

  const doDelete = () => {
    if (deleteTarget) {
      deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      onClose();
    }
  };

  const activeUsers = users.filter(u => u.status === 'active');
  const activeCount = activeUsers.length;
  const pendingCount = pendingUsers.length;

  return (
    <Box maxW="900px" mx="auto">
      <Button leftIcon={<FiArrowLeft />} variant="ghost" mb={4} onClick={onBack}>Volver</Button>
      <Heading size="md" mb={4}>Gestión de Usuarios</Heading>
      {alert.message && <Alert status={alert.type} borderRadius="md" mb={4}><AlertIcon />{alert.message}</Alert>}

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat>
            <StatLabel><HStack justify="center" spacing={1}><FiUsers /> <Text>Usuarios Activos</Text></HStack></StatLabel>
            <StatNumber color="green.500">{activeCount}</StatNumber>
          </Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat>
            <StatLabel><HStack justify="center" spacing={1}><FiClock /> <Text>Pendientes</Text></HStack></StatLabel>
            <StatNumber color="orange.500">{pendingCount}</StatNumber>
          </Stat>
        </Box>
      </SimpleGrid>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab><FiCheck style={{ marginRight: 6 }} /> Activos ({activeCount})</Tab>
          <Tab><FiClock style={{ marginRight: 6 }} /> Pendientes ({pendingCount})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <VStack spacing={3} align="stretch">
              {activeUsers.map(u => (
                <HStack key={u.id} p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} justify="space-between">
                  <Box>
                    <HStack spacing={2}>
                      <Text fontWeight="bold">{u.name}</Text>
                      <Badge colorScheme={u.role === 'admin' ? 'purple' : 'blue'}>{u.role}</Badge>
                    </HStack>
                    <HStack spacing={3} mt={1} fontSize="sm" color="gray.500">
                      <Text>@{u.username}</Text>
                      <HStack spacing={1}><FiMail /><Text>{u.email}</Text></HStack>
                    </HStack>
                  </Box>
                  {u.id !== 'admin-001' && (
                    <IconButton icon={<FiTrash2 />} size="sm" colorScheme="red" variant="ghost" onClick={() => confirmDelete(u)} />
                  )}
                </HStack>
              ))}
            </VStack>
          </TabPanel>
          <TabPanel px={0}>
            {pendingUsers.length === 0 && <Text color="gray.500" textAlign="center" py={4}>No hay solicitudes pendientes</Text>}
            <VStack spacing={3} align="stretch">
              {pendingUsers.map(u => (
                <HStack key={u.id} p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} justify="space-between">
                  <Box>
                    <Text fontWeight="bold">{u.name}</Text>
                    <HStack spacing={3} mt={1} fontSize="sm" color="gray.500">
                      <Text>@{u.username}</Text>
                      <HStack spacing={1}><FiMail /><Text>{u.email}</Text></HStack>
                    </HStack>
                  </Box>
                  <HStack spacing={2}>
                    <Button size="sm" colorScheme="green" leftIcon={<FiCheck />} onClick={() => handleApprove(u.id)}>Aprobar</Button>
                    <Button size="sm" colorScheme="red" leftIcon={<FiX />} onClick={() => handleReject(u.id)}>Rechazar</Button>
                  </HStack>
                </HStack>
              ))}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar Eliminación</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>¿Eliminar al usuario <strong>{deleteTarget?.name}</strong> ({deleteTarget?.username})?</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="red" onClick={doDelete}>Eliminar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
