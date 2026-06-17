import React, { useState } from 'react';
import { Box, VStack, Heading, Input, Button, Text, useColorModeValue, Alert, AlertIcon, Link, Select, Textarea, HStack } from '@chakra-ui/react';
import { FiUser, FiLock, FiMail, FiArrowLeft } from 'react-icons/fi';
import useStore from '../../store/useStore';

const SECURITY_QUESTIONS = [
  '¿Nombre de tu primera mascota?',
  '¿Ciudad donde naciste?',
  '¿Nombre de tu mejor amigo de la infancia?',
  '¿Tu película favorita?',
  '¿Comida favorita?',
];

export default function Register() {
  const { register, setView } = useStore();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '', securityQuestion: SECURITY_QUESTIONS[0], securityAnswer: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.name || !form.username || !form.email || !form.password || !form.securityAnswer) {
      setError('Todos los campos son obligatorios'); return;
    }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (form.password !== form.confirmPassword) { setError('Las contraseñas no coinciden'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Email no válido'); return; }
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (result.success) setSuccess(result.message);
    else setError(result.error);
  };

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  return (
    <Box minH="100vh" bg={bg} display="flex" alignItems="center" justifyContent="center" p={4}>
      <Box bg={cardBg} p={8} borderRadius="2xl" boxShadow="xl" border="1px solid" borderColor={borderColor} w="100%" maxW="450px">
        <VStack spacing={5}>
          <Box textAlign="center">
            <Heading size="lg" bgGradient="linear(to-r, brand.400, blue.400)" bgClip="text">ICARO</Heading>
            <Text color="gray.500" fontSize="sm">Crear nueva cuenta</Text>
          </Box>
          {error && <Alert status="error" borderRadius="md"><AlertIcon />{error}</Alert>}
          {success && <Alert status="success" borderRadius="md"><AlertIcon />{success}</Alert>}
          {!success && (
            <VStack spacing={3} w="100%" as="form" onSubmit={handleRegister}>
              <Input placeholder="Nombre completo" value={form.name} onChange={(e) => update('name', e.target.value)} leftIcon={<FiUser />} size="md" />
              <Input placeholder="Usuario" value={form.username} onChange={(e) => update('username', e.target.value)} leftIcon={<FiUser />} size="md" />
              <Input placeholder="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} leftIcon={<FiMail />} size="md" />
              <Input placeholder="Contraseña (mín. 6 caracteres)" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} leftIcon={<FiLock />} size="md" />
              <Input placeholder="Confirmar contraseña" type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} leftIcon={<FiLock />} size="md" />
              <Text fontSize="sm" color="gray.500" w="100%" mt={2}>Pregunta de seguridad (para recuperar contraseña)</Text>
              <Select value={form.securityQuestion} onChange={(e) => update('securityQuestion', e.target.value)} size="md">
                {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
              </Select>
              <Textarea placeholder="Tu respuesta" value={form.securityAnswer} onChange={(e) => update('securityAnswer', e.target.value)} size="md" rows={2} />
              <Button type="submit" size="lg" w="100%" mt={2} isLoading={loading}>Registrarse</Button>
            </VStack>
          )}
          <HStack spacing={1}>
            <Link fontSize="sm" color="blue.400" onClick={() => setView('login')} _hover={{ color: 'blue.300' }} display="flex" alignItems="center" gap={1}>
              <FiArrowLeft /> Volver al login
            </Link>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
