import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, addDays, differenceInMinutes, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date, fmt = 'dd/MM/yyyy') => format(typeof date === 'string' ? parseISO(date) : date, fmt, { locale: es });
export const formatTime = (date) => format(typeof date === 'string' ? parseISO(date) : date, 'HH:mm');
export const getWeekDays = (date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};
export const getMonthDays = (date = new Date()) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};
export const isTodayCheck = isToday;
export const isSameDayCheck = isSameDay;
export const addDaysCalc = addDays;
export const diffMinutes = differenceInMinutes;

export const AGENDA_HOURS = Array.from({ length: 9 }, (_, i) => i + 8);

export const CATEGORIES = {
  estudio: { label: 'Estudio', color: '#4299E1' },
  trabajo: { label: 'Trabajo', color: '#ED8936' },
  gym: { label: 'Gimnasio', color: '#E53E3E' },
  portfolio: { label: 'Porfolio', color: '#9F7AEA' },
  personal: { label: 'Personal', color: '#48BB78' },
  otro: { label: 'Otro', color: '#718096' },
};

export const JOB_STATUSES = {
  enviada: { label: 'Enviada', color: 'blue' },
  vista: { label: 'Vista', color: 'yellow' },
  entrevista: { label: 'Entrevista', color: 'purple' },
  rechazada: { label: 'Rechazada', color: 'red' },
  aceptada: { label: 'Aceptada', color: 'green' },
};

export const calculateCalories = (exercise, weight = 70, durationMin = 30) => {
  const metValues = { cardio: 8, fuerza: 5, flexibilidad: 3, hiit: 10, descanso: 1 };
  const met = metValues[exercise?.type] || 5;
  return Math.round((met * weight * durationMin) / 60);
};

export const getLevelFromXP = (xp) => Math.floor(xp / 100) + 1;
export const getXPForNextLevel = (xp) => 100 - (xp % 100);
