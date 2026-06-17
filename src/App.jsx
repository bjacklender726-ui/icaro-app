import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import theme from './theme/theme';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import Agenda from './components/agenda/Agenda';
import Oposiciones from './components/oposiciones/Oposiciones';
import Trabajo from './components/trabajo/Trabajo';
import Gym from './components/gym/Gym';
import Proyectos from './components/portfolio/Proyectos';
import Estadisticas from './components/estadisticas/Estadisticas';
import Gamificacion from './components/gamificacion/Gamificacion';
import Automatizaciones from './components/automations/Automatizaciones';
import Configuracion from './components/settings/Configuracion';
import Login from './components/login/Login';
import Register from './components/login/Register';
import ForgotPassword from './components/login/ForgotPassword';
import AdminUsers from './components/login/AdminUsers';
import useStore from './store/useStore';

function AppContent() {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const currentView = useStore((s) => s.currentView);

  if (!isAuthenticated) {
    if (currentView === 'register') return <Register />;
    if (currentView === 'forgot') return <ForgotPassword />;
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/oposiciones" element={<Oposiciones />} />
          <Route path="/trabajo" element={<Trabajo />} />
          <Route path="/gym" element={<Gym />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
          <Route path="/gamificacion" element={<Gamificacion />} />
          <Route path="/automatizaciones" element={<Automatizaciones />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/admin-users" element={<AdminUsers />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

function App() {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <AppContent />
      </ChakraProvider>
    </>
  );
}

export default App;
