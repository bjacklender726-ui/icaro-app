import React, { useState, useEffect } from 'react';
import { Box, VStack, Heading, Input, Button, Text, useColorModeValue, Alert, AlertIcon, Link, HStack } from '@chakra-ui/react';
import { FiLock, FiUser } from 'react-icons/fi';
import useStore from '../../store/useStore';

export default function Login() {
  const { login, initAuth, setView } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => { initAuth(); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (!result.success) setError(result.error);
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
            <Input placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} leftIcon={<FiUser />} size="lg" />
            <Input placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} leftIcon={<FiLock />} size="lg" />
            <Button type="submit" size="lg" w="100%" mt={2} isLoading={loading}>Iniciar Sesión</Button>
          </VStack>
          <HStack spacing={1} w="100%" justify="center">
            <Text fontSize="sm" color="gray.500">¿No tienes cuenta?</Text>
            <Link fontSize="sm" color="blue.400" onClick={() => setView('register')} _hover={{ color: 'blue.300' }}>Regístrate</Link>
          </HStack>
          <Link fontSize="xs" color="gray.500" onClick={() => setView('forgot')} _hover={{ color: 'gray.400' }}>¿Olvidaste tu contraseña?</Link>
        </VStack>
      </Box>
    </Box>
  );
}
