import React, { useState } from 'react';
import { Box, VStack, Heading, Input, Button, Text, useColorModeValue, Alert, AlertIcon, Link } from '@chakra-ui/react';
import { FiLock, FiUser, FiArrowLeft } from 'react-icons/fi';
import useStore from '../../store/useStore';

export default function ForgotPassword() {
  const { recoverPassword, users, setView } = useStore();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const findUser = () => {
    setError('');
    const user = users.find(u => u.username === username && u.status === 'active');
    if (!user) { setError('Usuario no encontrado'); return; }
    setSecurityQuestion(user.securityQuestion);
    setStep(2);
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!securityAnswer) { setError('Responde la pregunta de seguridad'); return; }
    if (newPassword.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (newPassword !== confirmPassword) { setError('Las contraseñas no coinciden'); return; }
    setLoading(true);
    const result = await recoverPassword(username, securityAnswer, newPassword);
    setLoading(false);
    if (result.success) { setSuccess(result.message); setTimeout(() => setView('login'), 3000); }
    else setError(result.error);
  };

  return (
    <Box minH="100vh" bg={bg} display="flex" alignItems="center" justifyContent="center" p={4}>
      <Box bg={cardBg} p={8} borderRadius="2xl" boxShadow="xl" border="1px solid" borderColor={borderColor} w="100%" maxW="420px">
        <VStack spacing={5}>
          <Box textAlign="center">
            <Heading size="lg" bgGradient="linear(to-r, brand.400, blue.400)" bgClip="text">ICARO</Heading>
            <Text color="gray.500" fontSize="sm">Recuperar contraseña</Text>
          </Box>
          {error && <Alert status="error" borderRadius="md"><AlertIcon />{error}</Alert>}
          {success && <Alert status="success" borderRadius="md"><AlertIcon />{success}</Alert>}

          {step === 1 && (
            <VStack spacing={4} w="100%">
              <Input placeholder="Tu usuario" value={username} onChange={(e) => setUsername(e.target.value)} leftIcon={<FiUser />} size="lg" />
              <Button onClick={findUser} size="lg" w="100%">Buscar</Button>
            </VStack>
          )}

          {step === 2 && !success && (
            <VStack spacing={4} w="100%" as="form" onSubmit={resetPassword}>
              <Box w="100%" p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                <Text fontSize="sm" fontWeight="bold" mb={1}>Tu pregunta de seguridad:</Text>
                <Text fontSize="sm" color="gray.500">{securityQuestion}</Text>
              </Box>
              <Input placeholder="Tu respuesta" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} size="md" />
              <Input placeholder="Nueva contraseña (mín. 6 caracteres)" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} leftIcon={<FiLock />} size="md" />
              <Input placeholder="Confirmar nueva contraseña" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} leftIcon={<FiLock />} size="md" />
              <Button type="submit" size="lg" w="100%" isLoading={loading}>Restablecer Contraseña</Button>
            </VStack>
          )}

          <Link fontSize="sm" color="blue.400" onClick={() => setView('login')} _hover={{ color: 'blue.300' }} display="flex" alignItems="center" gap={1}>
            <FiArrowLeft /> Volver al login
          </Link>
        </VStack>
      </Box>
    </Box>
  );
}
