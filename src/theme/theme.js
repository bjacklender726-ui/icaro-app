import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: '#e6f7ff',
    100: '#b3e0ff',
    200: '#80c9ff',
    300: '#4db2ff',
    400: '#1a9bff',
    500: '#0080e6',
    600: '#0066b3',
    700: '#004d80',
    800: '#00334d',
    900: '#001a1a',
  },
  agenda: { 500: '#48BB78', 600: '#38A169' },
  oposiciones: { 500: '#4299E1', 600: '#3182CE' },
  trabajo: { 500: '#ED8936', 600: '#DD6B20' },
  gym: { 500: '#E53E3E', 600: '#C53030' },
  portfolio: { 500: '#9F7AEA', 600: '#805AD5' },
};

const fonts = {
  heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
};

const styles = {
  global: (props) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
      color: props.colorMode === 'dark' ? 'white' : 'gray.800',
    },
  }),
};

const components = {
  Button: {
    defaultProps: { colorScheme: 'brand' },
    variants: {
      solid: (props) => ({
        bg: props.colorMode === 'dark' ? 'brand.600' : 'brand.500',
        color: 'white',
        _hover: { bg: props.colorMode === 'dark' ? 'brand.600' : 'brand.600', transform: 'translateY(-1px)', boxShadow: 'lg' },
        transition: 'all 0.2s',
      }),
    },
  },
  Card: {
    baseStyle: (props) => ({
      bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
      borderRadius: 'xl',
      boxShadow: 'md',
      border: '1px solid',
      borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
      _hover: { boxShadow: 'lg', transform: 'translateY(-2px)' },
      transition: 'all 0.2s',
    }),
  },
};

const theme = extendTheme({ config, colors, fonts, styles, components });
export default theme;
