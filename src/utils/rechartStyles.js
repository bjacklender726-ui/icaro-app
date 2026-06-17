import { useColorModeValue } from '@chakra-ui/react';

export function useRechartStyles() {
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const gridColor = useColorModeValue('gray.200', 'gray.700');
  const tooltipBg = useColorModeValue('white', 'gray.800');
  const tooltipBorder = useColorModeValue('gray.200', 'gray.600');
  const tooltipColor = useColorModeValue('gray.800', 'white');
  
  return { textColor, gridColor, tooltipBg, tooltipBorder, tooltipColor };
}
