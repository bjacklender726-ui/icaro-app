import React, { useState } from 'react';
import { Box, VStack, Heading, Input, Button, Text, useColorModeValue, Alert, AlertIcon } from '@chakra-ui/react';
import { FiLock, FiUser } from 'react-icons/fi';
import useStore from '../../store/useStore';

export default function Login() {
  const { login } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!login(username, password)) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <Box minH="100vh" bg={bg} display="flex" alignItems="center" justifyContent="center" p={4}>
      <Box bg={cardBg} p={8} borderRadius="2xl" boxShadow="xl" border="1px solid" borderColor={borderColor} w="100%" maxW="400px">
        <VStack spacing={6}>
          <Box textAlign="center">
            <Heading size="lg" bgGradient="linear(to-r, brand.400, blue.400)" bgClip="text">ICARO</Heading>
            <Text color="gray.500" fontSize="sm">Sistema de Productividad Personal</Text>
          </Box>
          {error && <Alert status="error" borderRadius="md"><AlertIcon />{error}</Alert>}
          <VStack spacing={4} w="100%" as="form" onSubmit={handleLogin}>
            <Input
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<FiUser />}
              size="lg"
            />
            <Input
              placeholder="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<FiLock />}
              size="lg"
            />
            <Button type="submit" size="lg" w="100%" mt={2}>Iniciar Sesión</Button>
          </VStack>
          <Text fontSize="xs" color="gray.500">Credenciales: admin / icaro</Text>
        </VStack>
      </Box>
    </Box>
  );
}
