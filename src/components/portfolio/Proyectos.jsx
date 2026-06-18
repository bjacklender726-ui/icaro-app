import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Box, Grid, Text, Flex, VStack, HStack, Badge, Button, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, Input, Textarea, Select, Progress, Stat, StatLabel, StatNumber, SimpleGrid, useColorModeValue, Tabs, TabList, TabPanels, Tab, TabPanel, Wrap, WrapItem, Tag, Collapse, Switch, Checkbox, Tooltip } from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiEdit3, FiGrid, FiClock, FiChevronDown, FiChevronRight, FiTrendingUp, FiLink, FiImage, FiVideo, FiFileText, FiX } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import useStore from '../../store/useStore';
import { formatDate } from '../../utils/helpers';
import { useRechartStyles } from '../../utils/rechartStyles';
import { format, subDays, subWeeks, subMonths, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, startOfWeek, startOfMonth, addDays } from 'date-fns';

const PROJECT_SUGGESTIONS = [
  { id: 'web-react', name: 'Web App (React)', description: 'Aplicación web con React', technologies: ['JavaScript', 'React', 'CSS', 'Node.js'], defaultTasks: ['Configurar proyecto (Vite/Create React App)', 'Diseñar interfaz de usuario', 'Crear componentes base', 'Implementar routing', 'Crear componentes de negocio', 'Integrar API/Backend', 'Tests unitarios', 'Testing de integración', 'Optimización y rendimiento', 'Deploy a producción'] },
  { id: 'web-vue', name: 'Web App (Vue)', description: 'Aplicación web con Vue.js', technologies: ['JavaScript', 'Vue.js', 'CSS', 'Node.js'], defaultTasks: ['Configurar proyecto (Vite/Vue CLI)', 'Diseñar interfaz de usuario', 'Crear componentes base', 'Implementar routing (Vue Router)', 'Crear stores (Pinia/Vuex)', 'Integrar API/Backend', 'Tests unitarios', 'Testing E2E', 'Deploy a producción'] },
  { id: 'mobile-flutter', name: 'App Móvil (Flutter)', description: 'Aplicación móvil multiplataforma', technologies: ['Dart', 'Flutter', 'Firebase'], defaultTasks: ['Configurar entorno Flutter', 'Diseñar UI/UX', 'Crear pantallas base', 'Implementar navegación', 'Integrar estado global', 'Conectar backend/API', 'Tests de widget', 'Build y deploy a stores'] },
  { id: 'mobile-react-native', name: 'App Móvil (React Native)', description: 'App móvil con React Native', technologies: ['JavaScript', 'React Native', 'Expo'], defaultTasks: ['Configurar proyecto (Expo)', 'Diseñar pantallas', 'Crear componentes reutilizables', 'Implementar navegación', 'Estado global (Redux/Zustand)', 'Integrar APIs', 'Testing', 'Build y publicación'] },
  { id: 'api-node', name: 'API REST (Node.js)', description: 'API backend con Node.js', technologies: ['JavaScript', 'Node.js', 'Express', 'MongoDB'], defaultTasks: ['Configurar proyecto', 'Definir estructura de carpetas', 'Crear modelos de datos', 'Implementar rutas CRUD', 'Autenticación y autorización', 'Validación de datos', 'Tests de integración', 'Documentación (Swagger)', 'Deploy'] },
  { id: 'api-python', name: 'API REST (Python)', description: 'API backend con Python/FastAPI', technologies: ['Python', 'FastAPI', 'PostgreSQL'], defaultTasks: ['Configurar entorno virtual', 'Configurar FastAPI', 'Definir modelos (SQLAlchemy)', 'Crear endpoints CRUD', 'Autenticación', 'Tests unitarios', 'Documentación OpenAPI', 'Deploy'] },
  { id: 'fullstack', name: 'Fullstack Web', description: 'Proyecto fullstack completo', technologies: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'], defaultTasks: ['Configurar repositorio', 'Frontend: scaffolding', 'Backend: scaffolding', 'Diseñar base de datos', 'API REST endpoints', 'Integración frontend-backend', 'Autenticación', 'Tests', 'CI/CD', 'Deploy'] },
  { id: 'data-science', name: 'Proyecto de Datos', description: 'Análisis y visualización de datos', technologies: ['Python', 'Pandas', 'Jupyter'], defaultTasks: ['Configurar entorno', 'Recolectar datos', 'Limpieza de datos', 'Análisis exploratorio', 'Modelado/Visualización', 'Documentar hallazgos', 'Publicar resultados'] },
  { id: 'game-unity', name: 'Videojuego (Unity)', description: 'Juego con Unity', technologies: ['C#', 'Unity'], defaultTasks: ['Configurar Unity project', 'Diseñar Game Design Document', 'Crear prototipo', 'Implementar mecánicas principales', 'Arte y assets', 'Sonido y música', 'Testing y balancing', 'Build y publicación'] },
  { id: 'devops', name: 'Proyecto DevOps', description: 'Infraestructura y CI/CD', technologies: ['Docker', 'Kubernetes', 'Terraform'], defaultTasks: ['Definir arquitectura', 'Configurar Docker', 'Orquestación Kubernetes', 'Pipeline CI/CD', 'Monitoreo y logs', 'Documentación'] },
];

const TECH_OPTIONS = {
  languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'SQL'],
  frameworks: ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'Node.js', 'Express', 'FastAPI', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'Flutter', 'React Native', 'Unity', '.NET'],
  databases: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'Redis', 'Firebase', 'Supabase', 'DynamoDB', 'Elasticsearch'],
  libraries: ['Tailwind CSS', 'Material UI', 'Chakra UI', 'Ant Design', 'Bootstrap', 'Redux', 'Zustand', 'Jotai', 'TanStack Query', 'Axios', 'Socket.io', 'Prisma', 'TypeORM', 'Sequelize', 'Mongoose', 'Jest', 'Vitest', 'Cypress', 'Playwright', 'Storybook', 'Webpack', 'Vite', 'Babel', 'ESLint', 'Prettier'],
  tools: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Vercel', 'Netlify', 'Git', 'GitHub Actions', 'Jenkins', 'Terraform'],
};

const PROJECT_TYPES = [
  { id: 'web', name: 'Web App', tasks: ['Configurar entorno', 'Diseñar UI/UX', 'Crear componentes', 'Implementar lógica', 'Testing', 'Deploy'] },
  { id: 'mobile', name: 'App Móvil', tasks: ['Configurar proyecto', 'Diseñar pantallas', 'Implementar navegación', 'Integrar APIs', 'Testing', 'Build y publicación'] },
  { id: 'api', name: 'API/Backend', tasks: ['Configurar proyecto', 'Definir modelos', 'Crear endpoints', 'Autenticación', 'Tests', 'Documentación', 'Deploy'] },
  { id: 'fullstack', name: 'Fullstack', tasks: ['Configurar repositorio', 'Frontend scaffolding', 'Backend scaffolding', 'Base de datos', 'Integración', 'Tests', 'CI/CD', 'Deploy'] },
  { id: 'data', name: 'Data Science', tasks: ['Configurar entorno', 'Recolectar datos', 'Limpieza', 'Análisis exploratorio', 'Modelado', 'Documentar', 'Publicar'] },
  { id: 'game', name: 'Videojuego', tasks: ['Configurar motor', 'Game Design Doc', 'Prototipo', 'Mecánicas principales', 'Arte y assets', 'Sonido', 'Testing', 'Build'] },
  { id: 'devops', name: 'DevOps/Infra', tasks: ['Definir arquitectura', 'Docker', 'Orquestación', 'CI/CD', 'Monitoreo', 'Documentación'] },
  { id: 'desktop', name: 'App Desktop', tasks: ['Configurar framework', 'Diseñar UI', 'Implementar funcionalidad', 'Integración con SO', 'Testing', 'Empaquetado', 'Distribución'] },
  { id: 'cli', name: 'CLI Tool', tasks: ['Configurar proyecto', 'Definir comandos', 'Implementar lógica', 'Manejamiento de errores', 'Tests', 'Documentación', 'Publicar paquete'] },
  { id: 'library', name: 'Librería/Package', tasks: ['Definir API pública', 'Implementar funcionalidad', 'Tests unitarios', 'Documentación (JSDoc/typedoc)', 'Configurar build', 'Publicar en npm/PyPI'] },
];

const SUGGESTION_COLORS = ['blue', 'green', 'purple', 'orange', 'teal', 'pink', 'cyan', 'red', 'yellow', 'gray'];

function ProjectManager() {
  const store = useStore();
  const { projects, addProject, updateProject, deleteProject, addProjectLog, addAgendaTask, addNotification } = store;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isTaskModalOpen, onOpen: onTaskModalOpen, onClose: onTaskModalClose } = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', tasks: [], technologies: [], onlineLink: '', estimatedHours: 0 });
  const [creationMode, setCreationMode] = useState('suggested');
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [customTechs, setCustomTechs] = useState([]);
  const [generateSubtasks, setGenerateSubtasks] = useState(false);
  const [taskForm, setTaskForm] = useState({ name: '', description: '', estimatedHours: 1, startDate: format(new Date(), 'yyyy-MM-dd'), endDate: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [taskEditForm, setTaskEditForm] = useState({ name: '', description: '', estimatedHours: 1, startDate: '', endDate: '', completed: false });
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const taskRowBg = useColorModeValue('gray.50', 'gray.700');
  const taskBorder = useColorModeValue('gray.300', 'gray.600');
  const suggestionBg = useColorModeValue('gray.50', 'gray.700');
  const suggestionActiveBg = useColorModeValue('blue.50', 'blue.900');
  const techCategoryBg = useColorModeValue('gray.100', 'gray.600');

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', description: '', tasks: [], technologies: [], onlineLink: '', estimatedHours: 0 });
    setCreationMode('suggested');
    setSelectedSuggestion(null);
    setCustomTechs([]);
    setGenerateSubtasks(false);
    onOpen();
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...p });
    setCreationMode('custom');
    setSelectedSuggestion(null);
    setCustomTechs(p.technologies || []);
    setGenerateSubtasks(false);
    onOpen();
  };

  const addTask = () => {
    if (taskForm.name) {
      const newTask = {
        id: Date.now().toString(),
        name: taskForm.name,
        description: taskForm.description,
        completed: false,
        estimatedHours: parseFloat(taskForm.estimatedHours) || 1,
        startDate: taskForm.startDate || format(new Date(), 'yyyy-MM-dd'),
        endDate: taskForm.endDate || '',
      };
      setForm((f) => ({ ...f, tasks: [...f.tasks, newTask] }));
      setTaskForm({ name: '', description: '', estimatedHours: 1, startDate: format(new Date(), 'yyyy-MM-dd'), endDate: '' });
    }
  };

  const removeTask = (id) => setForm((f) => ({ ...f, tasks: f.tasks.filter((t) => t.id !== id) }));

  const save = () => {
    let projectData = { ...form, technologies: creationMode === 'suggested' && selectedSuggestion ? selectedSuggestion.technologies : customTechs };
    if (editing) {
      updateProject(editing.id, projectData);
    } else {
      addProject(projectData);
    }
    onClose();
  };

  const getProjectHours = (projectId) => {
    return store.projectLogs.filter((l) => l.projectId === projectId).reduce((a, l) => a + (l.hours || 0), 0);
  };

  const getTaskHours = (projectId, taskId) => {
    return store.projectLogs.filter((l) => l.projectId === projectId && l.taskId === taskId).reduce((a, l) => a + (l.hours || 0), 0);
  };

  const selectSuggestion = (suggestion) => {
    setSelectedSuggestion(suggestion);
    const tasks = suggestion.defaultTasks.map((name, i) => ({ id: `gen-${i}`, name, description: '', completed: false, estimatedHours: 1, startDate: format(new Date(), 'yyyy-MM-dd'), endDate: '' }));
    const totalEst = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    setForm((f) => ({
      ...f,
      name: suggestion.name,
      description: suggestion.description,
      technologies: suggestion.technologies,
      tasks,
      estimatedHours: totalEst,
    }));
  };

  const regenerateSuggestionTasks = () => {
    if (!selectedSuggestion) return;
    const tasks = selectedSuggestion.defaultTasks.map((name, i) => ({ id: `gen-${i}`, name, description: '', completed: false, estimatedHours: 1, startDate: format(new Date(), 'yyyy-MM-dd'), endDate: '' }));
    const totalEst = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    setForm((f) => ({
      ...f,
      tasks,
      estimatedHours: totalEst,
    }));
  };

  const [selectedProjectType, setSelectedProjectType] = useState('');

  const selectProjectType = (typeId) => {
    setSelectedProjectType(typeId);
    const projectType = PROJECT_TYPES.find((t) => t.id === typeId);
    if (projectType && generateSubtasks) {
      setForm((f) => ({
        ...f,
        tasks: projectType.tasks.map((name, i) => ({ id: `type-${i}`, name, description: '', completed: false })),
      }));
    }
  };

  const toggleTech = (tech) => {
    setCustomTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const removeTech = (tech) => {
    setCustomTechs((prev) => prev.filter((t) => t !== tech));
  };

  const removeSelectedTech = (tech) => {
    setForm((f) => ({
      ...f,
      technologies: f.technologies.filter((t) => t !== tech),
    }));
  };

  const openEditTask = (project, task) => {
    setEditingTask({ projectId: project.id, taskId: task.id });
    setTaskEditForm({
      name: task.name || '',
      description: task.description || '',
      estimatedHours: task.estimatedHours || 1,
      startDate: task.startDate || '',
      endDate: task.endDate || '',
      completed: task.completed || false,
    });
    onTaskModalOpen();
  };

  const saveTaskEdit = () => {
    if (!editingTask) return;
    const { projectId, taskId } = editingTask;
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    const updatedTasks = (project.tasks || []).map((t) =>
      t.id === taskId
        ? {
            ...t,
            name: taskEditForm.name,
            description: taskEditForm.description,
            estimatedHours: parseFloat(taskEditForm.estimatedHours) || 0,
            startDate: taskEditForm.startDate,
            endDate: taskEditForm.endDate,
            completed: taskEditForm.completed,
          }
        : t
    );
    updateProject(projectId, { tasks: updatedTasks });
    onTaskModalClose();
    setEditingTask(null);
  };

  const handleTaskEditFieldChange = (field, value) => {
    setTaskEditForm((prev) => {
      const next = { ...prev, [field]: value };
      if ((field === 'startDate' || field === 'estimatedHours') && next.startDate && next.estimatedHours > 0) {
        const days = Math.ceil(next.estimatedHours / 8);
        const start = new Date(next.startDate);
        const end = addDays(start, days);
        next.endDate = format(end, 'yyyy-MM-dd');
      }
      return next;
    });
  };

  return (
    <Box>
      <Flex justify="space-between" mb={4}>
        <Text fontWeight="bold">Proyectos</Text>
        <Button leftIcon={<FiPlus />} size="sm" onClick={openNew}>Nuevo Proyecto</Button>
      </Flex>
      <VStack spacing={3} align="stretch">
        {projects.length === 0 && <Text color="gray.500" textAlign="center" py={4}>No hay proyectos creados</Text>}
        {projects.map((p) => {
          const hours = getProjectHours(p.id);
          const completedTasks = (p.tasks || []).filter((t) => t.completed).length;
          const totalTasks = (p.tasks || []).length;
          const totalEstimated = (p.tasks || []).reduce((a, t) => a + (parseFloat(t.estimatedHours) || 0), 0);
          const isExpanded = expandedProject === p.id;
          return (
            <Box key={p.id} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
              <Flex p={4} justify="space-between" align="center" cursor="pointer" onClick={() => setExpandedProject(isExpanded ? null : p.id)}>
                <HStack flex={1}>
                  <IconButton icon={isExpanded ? <FiChevronDown /> : <FiChevronRight />} size="xs" variant="ghost" />
                  <Box flex={1}>
                    <HStack><Text fontWeight="bold">{p.name}</Text><Badge colorScheme="green">{hours.toFixed(1)}h</Badge>{totalEstimated > 0 && <Badge colorScheme="purple">{totalEstimated}h est.</Badge>}</HStack>
                    <Text fontSize="xs" color="gray.500">{completedTasks}/{totalTasks} tareas · {p.description || ''}</Text>
                    {totalTasks > 0 && <Progress value={(completedTasks / totalTasks) * 100} size="sm" colorScheme="green" mt={2} borderRadius="full" />}
                  </Box>
                </HStack>
                <HStack>
                  <IconButton icon={<FiEdit3 />} size="xs" onClick={(e) => { e.stopPropagation(); openEdit(p); }} />
                  <IconButton icon={<FiTrash2 />} size="xs" colorScheme="red" onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }} />
                </HStack>
              </Flex>
              <Collapse in={isExpanded} animateOpacity>
                <Box px={4} pb={4} borderTop="1px solid" borderColor={borderColor} pt={3}>
                  {p.onlineLink && (
                    <Button as="a" href={p.onlineLink} target="_blank" size="xs" variant="link" colorScheme="blue" leftIcon={<FiLink />} mb={2}>
                      Ver enlace del proyecto
                    </Button>
                  )}
                  {(p.technologies || []).length > 0 && (
                    <Wrap mb={3}>
                      {p.technologies.map((tech) => (
                        <WrapItem key={tech}><Badge colorScheme="purple" fontSize="xs">{tech}</Badge></WrapItem>
                      ))}
                    </Wrap>
                  )}
                  <HStack mb={3} spacing={3}>
                    <Badge colorScheme="green" fontSize="sm">{hours.toFixed(1)}h registradas</Badge>
                    {totalEstimated > 0 && <Badge colorScheme="purple" fontSize="sm">{totalEstimated}h estimadas</Badge>}
                  </HStack>
                  {(p.tasks || []).length === 0 && <Text color="gray.500" fontSize="sm">Sin subtareas</Text>}
                  {(p.tasks || []).map((t) => {
                    const taskH = getTaskHours(p.id, t.id);
                    const est = parseFloat(t.estimatedHours) || 0;
                    return (
                      <Flex key={t.id} p={2} bg={taskRowBg} borderRadius="md" justify="space-between" align="center" mb={1}>
                        <HStack flex={1}>
                          <Box w="14px" h="14px" borderRadius="3px" border="2px solid" borderColor={t.completed ? 'green.500' : taskBorder} bg={t.completed ? 'green.500' : 'transparent'} cursor="pointer" onClick={() => {
                            const updatedTasks = p.tasks.map((tk) => tk.id === t.id ? { ...tk, completed: !tk.completed } : tk);
                            updateProject(p.id, { tasks: updatedTasks });
                            if (!t.completed) {
                              addNotification({ title: 'Subtarea completada', message: `"${t.name}" completada en proyecto "${p.name}"`, type: 'success', section: 'proyectos' });
                            }
                          }} />
                          <Box>
                            <Text fontSize="sm" textDecoration={t.completed ? 'line-through' : 'none'} opacity={t.completed ? 0.5 : 1}>{t.name}</Text>
                            <HStack spacing={1} mt={0.5}>
                              {est > 0 && <Badge size="xs" colorScheme="blue">{est}h est.</Badge>}
                              {taskH > 0 && <Badge size="xs" colorScheme="green">{taskH}h registradas</Badge>}
                              {t.startDate && <Badge size="xs" colorScheme="gray">Inicio: {t.startDate}</Badge>}
                              {t.endDate && <Badge size="xs" colorScheme="orange">Fin: {t.endDate}</Badge>}
                            </HStack>
                          </Box>
                        </HStack>
                        <HStack spacing={0}>
                          <Tooltip label="Editar subtarea">
                            <IconButton icon={<FiEdit3 />} size="xs" variant="ghost" colorScheme="blue" onClick={(e) => { e.stopPropagation(); openEditTask(p, t); }} />
                          </Tooltip>
                          <Tooltip label="Activar en Agenda">
                            <IconButton icon={<FiClock />} size="xs" variant="ghost" colorScheme="purple" onClick={() => {
                              addAgendaTask({ title: t.name, description: t.description || `Subtarea de ${p.name}`, date: t.startDate || format(new Date(), 'yyyy-MM-dd'), completed: false, section: 'proyectos', type: 'task' });
                              addNotification({ title: 'Tarea enviada a Agenda', message: `"${t.name}" agregada a la agenda`, type: 'info', section: 'proyectos' });
                            }} />
                          </Tooltip>
                        </HStack>
                      </Flex>
                    );
                  })}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? 'Editar Proyecto' : 'Nuevo Proyecto'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!editing && (
              <HStack mb={4} p={1} bg={useColorModeValue('gray.100', 'gray.600')} borderRadius="lg">
                <Button
                  flex={1}
                  size="sm"
                  variant={creationMode === 'suggested' ? 'solid' : 'ghost'}
                  colorScheme={creationMode === 'suggested' ? 'blue' : 'gray'}
                  onClick={() => setCreationMode('suggested')}
                >
                  Proyectos sugeridos
                </Button>
                <Button
                  flex={1}
                  size="sm"
                  variant={creationMode === 'custom' ? 'solid' : 'ghost'}
                  colorScheme={creationMode === 'custom' ? 'blue' : 'gray'}
                  onClick={() => setCreationMode('custom')}
                >
                  Proyecto personalizado
                </Button>
              </HStack>
            )}

            {!editing && creationMode === 'suggested' && (
              <VStack spacing={3} align="stretch" maxH="350px" overflowY="auto" mb={4}>
                {PROJECT_SUGGESTIONS.map((s, i) => (
                  <Box
                    key={s.id}
                    p={3}
                    bg={selectedSuggestion?.id === s.id ? suggestionActiveBg : suggestionBg}
                    borderRadius="lg"
                    border="2px solid"
                    borderColor={selectedSuggestion?.id === s.id ? 'blue.500' : 'transparent'}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ borderColor: 'blue.300', transform: 'translateY(-1px)' }}
                    onClick={() => selectSuggestion(s)}
                  >
                    <HStack justify="space-between">
                      <HStack>
                        <Badge colorScheme={SUGGESTION_COLORS[i % SUGGESTION_COLORS.length]} fontSize="xs">{s.id}</Badge>
                        <Text fontWeight="bold" fontSize="sm">{s.name}</Text>
                      </HStack>
                    </HStack>
                    <Text fontSize="xs" color="gray.500" mt={1}>{s.description}</Text>
                    <Wrap mt={2} spacing={1}>
                      {s.technologies.map((tech) => (
                        <WrapItem key={tech}><Badge size="xs" colorScheme="purple">{tech}</Badge></WrapItem>
                      ))}
                    </Wrap>
                    <Text fontSize="xs" color="gray.400" mt={1}>{s.defaultTasks.length} subtareas predefinidas · ~{s.defaultTasks.length}h estimadas</Text>
                  </Box>
                ))}
              </VStack>
            )}

            {!editing && creationMode === 'custom' && (
              <VStack spacing={4} align="stretch">
                <FormControl><FormLabel>Nombre</FormLabel><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></FormControl>
                <FormControl><FormLabel>Descripción</FormLabel><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} /></FormControl>

                <FormControl>
                  <FormLabel>Tipo de proyecto</FormLabel>
                  <Select placeholder="Seleccionar tipo (opcional)" value={selectedProjectType} onChange={(e) => selectProjectType(e.target.value)}>
                    {PROJECT_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </Select>
                </FormControl>

                <Box>
                  <Text fontWeight="bold" fontSize="sm" mb={2}>Tecnologías</Text>
                  {Object.entries(TECH_OPTIONS).map(([category, techs]) => (
                    <Box key={category} mb={3}>
                      <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={1}>
                        {category === 'languages' ? 'Lenguajes' : category === 'frameworks' ? 'Frameworks' : category === 'databases' ? 'Bases de datos' : category === 'libraries' ? 'Librerías' : 'Herramientas'}
                      </Text>
                      <Wrap spacing={1}>
                        {techs.map((tech) => (
                          <WrapItem key={tech}>
                            <Checkbox
                              size="sm"
                              isChecked={customTechs.includes(tech)}
                              onChange={() => toggleTech(tech)}
                              colorScheme="purple"
                            >
                              {tech}
                            </Checkbox>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </Box>
                  ))}
                </Box>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="gen-subtasks" mb="0" fontSize="sm">Generar subtareas automáticamente</FormLabel>
                  <Switch id="gen-subtasks" isChecked={generateSubtasks} onChange={(e) => {
                    const checked = e.target.checked;
                    setGenerateSubtasks(checked);
                    if (checked && selectedProjectType) {
                      const projectType = PROJECT_TYPES.find((t) => t.id === selectedProjectType);
                      if (projectType) {
                        setForm((f) => ({
                          ...f,
                          tasks: projectType.tasks.map((name, i) => ({ id: `type-${i}`, name, description: '', completed: false })),
                        }));
                      }
                    }
                  }} colorScheme="green" />
                </FormControl>
              </VStack>
            )}

            {(editing || creationMode === 'suggested' || creationMode === 'custom') && (
              <VStack spacing={4} align="stretch" mt={editing ? 0 : 2}>
                {editing && (
                  <>
                    <FormControl><FormLabel>Nombre</FormLabel><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></FormControl>
                    <FormControl><FormLabel>Descripción</FormLabel><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} /></FormControl>
                    <FormControl><FormLabel>Enlace online</FormLabel><Input type="url" placeholder="https://..." value={form.onlineLink || ''} onChange={(e) => setForm((f) => ({ ...f, onlineLink: e.target.value }))} /></FormControl>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" mb={2}>Tecnologías</Text>
                      <Wrap>
                        {(form.technologies || []).map((tech) => (
                          <WrapItem key={tech}>
                            <Tag size="sm" colorScheme="purple" pr={1}>
                              {tech}
                              <IconButton icon={<FiX />} size="xs" variant="ghost" ml={1} onClick={() => removeSelectedTech(tech)} />
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </Box>
                  </>
                )}

                {!editing && creationMode === 'suggested' && selectedSuggestion && (
                  <>
                    <HStack>
                      <FormControl flex={1}><FormLabel>Nombre</FormLabel><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></FormControl>
                      <Button mt={6} size="sm" colorScheme="blue" variant="outline" onClick={regenerateSuggestionTasks}>Regenerar subtareas</Button>
                    </HStack>
                    <FormControl><FormLabel>Descripción</FormLabel><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} /></FormControl>
                    <FormControl><FormLabel>Enlace online</FormLabel><Input type="url" placeholder="https://..." value={form.onlineLink || ''} onChange={(e) => setForm((f) => ({ ...f, onlineLink: e.target.value }))} /></FormControl>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" mb={2}>Tecnologías</Text>
                      <Wrap>
                        {selectedSuggestion.technologies.map((tech) => (
                          <WrapItem key={tech}><Badge colorScheme="purple">{tech}</Badge></WrapItem>
                        ))}
                      </Wrap>
                    </Box>
                  </>
                )}

                {!editing && creationMode === 'custom' && (
                  <FormControl><FormLabel>Enlace online</FormLabel><Input type="url" placeholder="https://..." value={form.onlineLink || ''} onChange={(e) => setForm((f) => ({ ...f, onlineLink: e.target.value }))} /></FormControl>
                )}

                <Box w="100%">
                  <Text fontWeight="bold" mb={2}>Subtareas</Text>
                  <HStack mb={2}>
                    <Input size="sm" placeholder="Nombre subtarea" value={taskForm.name} onChange={(e) => setTaskForm((t) => ({ ...t, name: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && addTask()} />
                    <Button size="sm" onClick={addTask}>Agregar</Button>
                  </HStack>
                  <HStack mb={2} spacing={2}>
                    <FormControl flex={1}><FormLabel fontSize="xs">Horas est.</FormLabel><Input size="sm" type="number" min={0.5} step={0.5} value={taskForm.estimatedHours} onChange={(e) => setTaskForm((t) => ({ ...t, estimatedHours: e.target.value }))} /></FormControl>
                    <FormControl flex={1}><FormLabel fontSize="xs">Inicio</FormLabel><Input size="sm" type="date" value={taskForm.startDate} onChange={(e) => setTaskForm((t) => ({ ...t, startDate: e.target.value }))} /></FormControl>
                    <FormControl flex={1}><FormLabel fontSize="xs">Fin</FormLabel><Input size="sm" type="date" value={taskForm.endDate} onChange={(e) => setTaskForm((t) => ({ ...t, endDate: e.target.value }))} /></FormControl>
                  </HStack>
                  <VStack align="stretch" maxH="200px" overflowY="auto">
                    {form.tasks.map((t) => (
                      <Flex key={t.id} p={2} bg={taskRowBg} borderRadius="md" justify="space-between" align="center">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm">{t.name}</Text>
                          <HStack spacing={2} mt={0.5}>
                            {t.estimatedHours > 0 && <Badge size="xs" colorScheme="blue">{t.estimatedHours}h</Badge>}
                            {t.startDate && <Badge size="xs" colorScheme="green">Inicio: {t.startDate}</Badge>}
                            {t.endDate && <Badge size="xs" colorScheme="orange">Fin: {t.endDate}</Badge>}
                          </HStack>
                        </VStack>
                        <IconButton icon={<FiTrash2 />} size="xs" variant="ghost" colorScheme="red" onClick={() => removeTask(t.id)} />
                      </Flex>
                    ))}
                  </VStack>
                </Box>

                <Box p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="lg">
                  <HStack justify="space-between">
                    <Text fontWeight="bold" fontSize="sm">Horas estimadas totales:</Text>
                    <Badge colorScheme="purple" fontSize="md">{form.tasks.reduce((sum, t) => sum + (parseFloat(t.estimatedHours) || 0), 0)}h</Badge>
                  </HStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button onClick={save} isDisabled={!form.name}>{editing ? 'Guardar' : 'Crear'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isTaskModalOpen} onClose={onTaskModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Subtarea</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Nombre</FormLabel>
                <Input value={taskEditForm.name} onChange={(e) => setTaskEditForm((f) => ({ ...f, name: e.target.value }))} />
              </FormControl>
              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea value={taskEditForm.description} onChange={(e) => setTaskEditForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
              </FormControl>
              <FormControl>
                <FormLabel>Horas estimadas</FormLabel>
                <Input type="number" min={0.5} step={0.5} value={taskEditForm.estimatedHours} onChange={(e) => handleTaskEditFieldChange('estimatedHours', e.target.value)} />
              </FormControl>
              <HStack spacing={3} w="100%">
                <FormControl flex={1}>
                  <FormLabel>Fecha inicio</FormLabel>
                  <Input type="date" value={taskEditForm.startDate} onChange={(e) => handleTaskEditFieldChange('startDate', e.target.value)} />
                </FormControl>
                <FormControl flex={1}>
                  <FormLabel>Fecha fin (auto)</FormLabel>
                  <Input type="date" value={taskEditForm.endDate} onChange={(e) => setTaskEditForm((f) => ({ ...f, endDate: e.target.value }))} />
                </FormControl>
              </HStack>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="task-completed" mb="0">Completada</FormLabel>
                <Switch id="task-completed" isChecked={taskEditForm.completed} onChange={(e) => setTaskEditForm((f) => ({ ...f, completed: e.target.checked }))} colorScheme="green" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onTaskModalClose}>Cancelar</Button>
            <Button onClick={saveTaskEdit} isDisabled={!taskEditForm.name} colorScheme="purple">Guardar cambios</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function LogHours() {
  const { projects, addProjectLog, addXP } = useStore();
  const [form, setForm] = useState({ projectId: '', taskId: '', hours: 1, description: '' });
  const modalBg = useColorModeValue('white', 'gray.800');
  const modalBorder = useColorModeValue('gray.200', 'gray.700');

  const selectedProject = projects.find((p) => p.id === form.projectId);

  const save = () => {
    addProjectLog({ ...form, date: format(new Date(), 'yyyy-MM-dd'), type: 'project' });
    addXP(5);
    setForm({ projectId: '', taskId: '', hours: 1, description: '' });
  };

  return (
    <Box p={5} bg={modalBg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={modalBorder}>
      <Text fontWeight="bold" mb={4}>Registrar Horas</Text>
      <VStack spacing={4}>
        <FormControl><FormLabel>Proyecto</FormLabel><Select placeholder="Seleccionar proyecto" value={form.projectId} onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value, taskId: '' }))}>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select></FormControl>
        {selectedProject && (selectedProject.tasks || []).length > 0 && (
          <FormControl><FormLabel>Subtarea</FormLabel><Select placeholder="Seleccionar subtarea (opcional)" value={form.taskId} onChange={(e) => setForm((f) => ({ ...f, taskId: e.target.value }))}>
            {(selectedProject.tasks || []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select></FormControl>
        )}
        <FormControl><FormLabel>Horas</FormLabel><Input type="number" value={form.hours} onChange={(e) => setForm((f) => ({ ...f, hours: parseFloat(e.target.value) || 0 }))} /></FormControl>
        <FormControl><FormLabel>Descripción del avance</FormLabel><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></FormControl>
        <Button w="100%" onClick={save} isDisabled={!form.projectId || form.hours <= 0}>Registrar</Button>
      </VStack>
    </Box>
  );
}

function ProjectStats() {
  const { projects, projectLogs } = useStore();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const logRowBg = useColorModeValue('gray.50', 'gray.700');
  const cardBg = useColorModeValue('gray.50', 'gray.750');
  const progressTrackBg = useColorModeValue('gray.100', 'gray.600');
  const [periodFilter, setPeriodFilter] = useState('daily');
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { textColor, gridColor, tooltipBg, tooltipBorder, tooltipColor } = useRechartStyles();

  const PIE_COLORS = ['#9F7AEA', '#4FD1C5', '#F6AD55', '#FC8181', '#63B3ED', '#B794F4', '#F687B3', '#68D391', '#FBD38D', '#A0AEC0'];

  const totalHours = useMemo(() => +(projectLogs.reduce((a, l) => a + (l.hours || 0), 0)).toFixed(1), [projectLogs]);

  const totalEstimatedHours = useMemo(() => {
    return projects.reduce((sum, p) => {
      const projectEst = (p.tasks || []).reduce((a, t) => a + (parseFloat(t.estimatedHours) || 0), 0);
      return sum + projectEst;
    }, 0);
  }, [projects]);

  const avgCompletion = useMemo(() => {
    if (projects.length === 0) return 0;
    const total = projects.reduce((sum, p) => {
      const totalTasks = (p.tasks || []).length;
      if (totalTasks === 0) return sum;
      const completedTasks = (p.tasks || []).filter((t) => t.completed).length;
      return sum + (completedTasks / totalTasks) * 100;
    }, 0);
    return +(total / projects.length).toFixed(1);
  }, [projects]);

  const projectsWithStats = useMemo(() => {
    return projects.map((p) => {
      const totalTasks = (p.tasks || []).length;
      const completedTasks = (p.tasks || []).filter((t) => t.completed).length;
      const estimated = (p.tasks || []).reduce((a, t) => a + (parseFloat(t.estimatedHours) || 0), 0);
      const logged = projectLogs.filter((l) => l.projectId === p.id).reduce((a, l) => a + (l.hours || 0), 0);
      let status = 'Sin empezar';
      if (totalTasks > 0 && completedTasks === totalTasks) status = 'Completado';
      else if (completedTasks > 0) status = 'En progreso';
      return { ...p, totalTasks, completedTasks, estimated, logged, status };
    });
  }, [projects, projectLogs]);

  const techDistribution = useMemo(() => {
    const techCount = {};
    projects.forEach((p) => {
      (p.technologies || []).forEach((tech) => {
        techCount[tech] = (techCount[tech] || 0) + 1;
      });
    });
    return Object.entries(techCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [projects]);

  const totalLogged = totalHours;

  const estimationAccuracy = useMemo(() => {
    const diff = totalLogged - totalEstimatedHours;
    const accuracy = totalEstimatedHours > 0 ? Math.min(100, +((totalLogged / totalEstimatedHours) * 100).toFixed(1)) : 0;
    return { diff: +diff.toFixed(1), accuracy };
  }, [totalEstimatedHours, totalLogged]);

  const taskTimeline = useMemo(() => {
    const now = new Date();
    const days = eachDayOfInterval({ start: subDays(now, 29), end: now });
    let cumulative = 0;
    return days.map((d) => {
      const dStr = format(d, 'yyyy-MM-dd');
      const dayCompletions = projectLogs.filter((l) => l.date === dStr).reduce((a, l) => {
        const proj = projects.find((p) => p.id === l.projectId);
        if (!proj) return a;
        const task = (proj.tasks || []).find((t) => t.id === l.taskId);
        if (task && task.completed) return a + 1;
        return a;
      }, 0);
      cumulative += dayCompletions;
      return { day: format(d, 'dd/MM'), tareas: cumulative };
    });
  }, [projectLogs, projects]);

  const dailyData = useMemo(() => {
    const now = new Date();
    const days = eachDayOfInterval({ start: subDays(now, 13), end: now });
    return days.map((d) => {
      const dStr = format(d, 'yyyy-MM-dd');
      const hours = projectLogs.filter((l) => l.date === dStr).reduce((a, l) => a + (l.hours || 0), 0);
      return { day: format(d, 'dd/MM'), horas: +hours.toFixed(1) };
    });
  }, [projectLogs]);

  const weeklyData = useMemo(() => {
    const now = new Date();
    const weeks = eachWeekOfInterval({ start: subWeeks(now, 7), end: now }, { weekStartsOn: 1 });
    return weeks.map((w) => {
      const wEnd = new Date(w.getTime() + 7 * 86400000);
      const hours = projectLogs.filter((l) => { const d = new Date(l.date); return d >= w && d < wEnd; }).reduce((a, l) => a + (l.hours || 0), 0);
      return { week: format(w, 'dd/MM'), horas: +hours.toFixed(1) };
    });
  }, [projectLogs]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = eachMonthOfInterval({ start: subMonths(now, 5), end: now });
    return months.map((m) => {
      const mStr = format(m, 'yyyy-MM');
      const hours = projectLogs.filter((l) => l.date?.startsWith(mStr)).reduce((a, l) => a + (l.hours || 0), 0);
      return { month: format(m, 'MMM yy'), horas: +hours.toFixed(1) };
    });
  }, [projectLogs]);

  const filteredLogs = useMemo(() => {
    return projectLogs.filter((l) => l.date === filterDate);
  }, [projectLogs, filterDate]);

  const filteredHours = useMemo(() => +filteredLogs.reduce((a, l) => a + (l.hours || 0), 0).toFixed(1), [filteredLogs]);

  const chartData = periodFilter === 'daily' ? dailyData : periodFilter === 'weekly' ? weeklyData : monthlyData;
  const chartKey = periodFilter === 'daily' ? 'day' : periodFilter === 'weekly' ? 'week' : 'month';

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Proyectos</StatLabel><StatNumber>{projects.length}</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Horas Estimadas</StatLabel><StatNumber color="purple.500">{totalEstimatedHours}h</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Horas Registradas</StatLabel><StatNumber color="green.500">{totalHours}h</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Completado Prom.</StatLabel><StatNumber color="blue.500">{avgCompletion}%</StatNumber></Stat>
        </Box>
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={5} mb={5}>
        <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
          <Flex justify="space-between" align="center" mb={3}>
            <Text fontWeight="bold">Rendimiento</Text>
            <HStack>
              <Select size="sm" w="120px" value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </Select>
            </HStack>
          </Flex>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey={chartKey} fontSize={12} tick={{ fill: textColor }} />
              <YAxis tick={{ fill: textColor }} />
              <RechartsTooltip contentStyle={{ bg: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipColor }} />
              <Bar dataKey="horas" fill="#9F7AEA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
          <Text fontWeight="bold" mb={3}>Filtrar por Día</Text>
          <Input type="date" size="sm" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} mb={2} />
          <HStack justify="space-between" mb={3}>
            <Text fontSize="xs" color="gray.500">Registros: {filteredLogs.length}</Text>
            <Badge colorScheme="blue" fontSize="xs">{filteredHours}h</Badge>
          </HStack>
          <VStack align="stretch" spacing={2} maxH="250px" overflowY="auto">
            {filteredLogs.length === 0 && <Text color="gray.500" fontSize="sm">Sin registros</Text>}
            {filteredLogs.map((l) => {
              const proj = projects.find((p) => p.id === l.projectId);
              const task = proj ? (proj.tasks || []).find((t) => t.id === l.taskId) : null;
              return (
                <Box key={l.id} p={2} bg={logRowBg} borderRadius="md">
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="bold">{proj?.name || 'Proyecto'}</Text>
                    <Badge colorScheme="purple">{l.hours}h</Badge>
                  </HStack>
                  {task && <Text fontSize="xs" color="gray.500">Tarea: {task.name}</Text>}
                  {l.description && <Text fontSize="xs" color="gray.400">{l.description}</Text>}
                </Box>
              );
            })}
          </VStack>
        </Box>
      </Grid>

      <Text fontWeight="bold" fontSize="lg" mb={3}>Progreso por Proyecto</Text>
      <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} mb={5}>
        {projectsWithStats.length === 0 ? (
          <Text color="gray.500" textAlign="center" py={4}>No hay proyectos registrados</Text>
        ) : (
          <Box overflowX="auto">
            <Box as="table" w="100%" borderCollapse="collapse">
              <Box as="thead">
                <Box as="tr" borderBottom="2px solid" borderColor={borderColor}>
                  <Box as="th" textAlign="left" pb={3} fontSize="xs" color="gray.500" textTransform="uppercase">Proyecto</Box>
                  <Box as="th" textAlign="center" pb={3} fontSize="xs" color="gray.500" textTransform="uppercase">Tareas</Box>
                  <Box as="th" textAlign="center" pb={3} fontSize="xs" color="gray.500" textTransform="uppercase" minW="120px">Progreso</Box>
                  <Box as="th" textAlign="right" pb={3} fontSize="xs" color="gray.500" textTransform="uppercase">Estimado</Box>
                  <Box as="th" textAlign="right" pb={3} fontSize="xs" color="gray.500" textTransform="uppercase">Registrado</Box>
                  <Box as="th" textAlign="center" pb={3} fontSize="xs" color="gray.500" textTransform="uppercase">Estado</Box>
                </Box>
              </Box>
              <Box as="tbody">
                {projectsWithStats.map((p) => {
                  const pct = p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0;
                  const statusColor = p.status === 'Completado' ? 'green' : p.status === 'En progreso' ? 'blue' : 'gray';
                  return (
                    <Box as="tr" key={p.id} borderBottom="1px solid" borderColor={borderColor}>
                      <Box as="td" py={3} fontWeight="bold" fontSize="sm">{p.name}</Box>
                      <Box as="td" py={3} textAlign="center" fontSize="sm">{p.completedTasks}/{p.totalTasks}</Box>
                      <Box as="td" py={3}>
                        <Flex align="center" gap={2}>
                          <Progress flex={1} value={pct} size="sm" colorScheme={pct === 100 ? 'green' : 'blue'} borderRadius="full" bg={progressTrackBg} />
                          <Text fontSize="xs" color="gray.500" minW="36px" textAlign="right">{pct}%</Text>
                        </Flex>
                      </Box>
                      <Box as="td" py={3} textAlign="right" fontSize="sm">
                        <Badge colorScheme="purple" variant="subtle">{p.estimated}h</Badge>
                      </Box>
                      <Box as="td" py={3} textAlign="right" fontSize="sm">
                        <Badge colorScheme="green" variant="subtle">{p.logged.toFixed(1)}h</Badge>
                      </Box>
                      <Box as="td" py={3} textAlign="center">
                        <Badge colorScheme={statusColor}>{p.status}</Badge>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5} mb={5}>
        <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
          <Text fontWeight="bold" mb={4}>Precisión de Estimaciones</Text>
          <SimpleGrid columns={2} spacing={4} mb={4}>
            <Box p={3} bg={cardBg} borderRadius="lg" textAlign="center">
              <Text fontSize="xs" color="gray.500" mb={1}>Estimado</Text>
              <Text fontWeight="bold" fontSize="xl" color="purple.500">{totalEstimatedHours}h</Text>
            </Box>
            <Box p={3} bg={cardBg} borderRadius="lg" textAlign="center">
              <Text fontSize="xs" color="gray.500" mb={1}>Registrado</Text>
              <Text fontWeight="bold" fontSize="xl" color="green.500">{totalLogged}h</Text>
            </Box>
          </SimpleGrid>
          <Box p={3} bg={cardBg} borderRadius="lg" textAlign="center" mb={3}>
            <Text fontSize="xs" color="gray.500" mb={1}>Diferencia</Text>
            <Text fontWeight="bold" fontSize="xl" color={estimationAccuracy.diff > 0 ? 'red.500' : 'green.500'}>
              {estimationAccuracy.diff > 0 ? '+' : ''}{estimationAccuracy.diff}h
            </Text>
            <Text fontSize="xs" color="gray.400">{estimationAccuracy.diff > 0 ? 'Sobreestimado' : estimationAccuracy.diff < 0 ? 'Subestimado' : 'Exacto'}</Text>
          </Box>
          <Box>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="xs" color="gray.500">Precisión</Text>
              <Text fontSize="xs" fontWeight="bold">{estimationAccuracy.accuracy}%</Text>
            </Flex>
            <Progress value={estimationAccuracy.accuracy} size="sm" colorScheme={estimationAccuracy.accuracy >= 90 ? 'green' : estimationAccuracy.accuracy >= 70 ? 'yellow' : 'red'} borderRadius="full" bg={progressTrackBg} />
          </Box>
        </Box>

        <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor}>
          <Text fontWeight="bold" mb={3}>Distribución de Tecnologías</Text>
          {techDistribution.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={8}>No hay tecnologías registradas</Text>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={techDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={11}
                  fill={textColor}
                >
                  {techDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ bg: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipColor }}
                  formatter={(value, name) => [`${value} proyectos`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Box>
      </Grid>

      <Box p={5} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} mb={5}>
        <Text fontWeight="bold" mb={3}>Línea de Tiempo - Tareas Completadas (30 días)</Text>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={taskTimeline}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="day" fontSize={10} tick={{ fill: textColor }} interval={4} />
            <YAxis tick={{ fill: textColor }} allowDecimals={false} />
            <RechartsTooltip contentStyle={{ bg: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipColor }} />
            <Bar dataKey="tareas" fill="#4FD1C5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

function PizarraProyectos({ projectId }) {
  const store = useStore();
  const projectPizarras = store.projectPizarras[projectId] || {};
  const boardIds = Object.keys(projectPizarras);
  const [selectedBoardId, setSelectedBoardId] = useState(boardIds[0] || '');
  const currentBoard = projectPizarras[selectedBoardId];
  const board = currentBoard?.items || [];
  const project = store.projects.find((p) => p.id === projectId);
  const { addProyectosPizarraItem, updateProyectosPizarraItem, deleteProyectosPizarraItem, addProjectBoard, deleteProjectBoard, renameProjectBoard, updateProject, addAgendaTask } = store;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isTaskOpen, onOpen: onTaskOpen, onClose: onTaskClose } = useDisclosure();
  const { isOpen: isBoardOpen, onOpen: onBoardOpen, onClose: onBoardClose } = useDisclosure();
  const [boardName, setBoardName] = useState('');
  const [renamingBoard, setRenamingBoard] = useState(null);
  const [renameVal, setRenameVal] = useState('');
  const [form, setForm] = useState({ type: 'text', title: '', content: '', position: { x: 20, y: 20 }, linkedTo: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', date: format(new Date(), 'yyyy-MM-dd') });
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const boardBg = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    if (boardIds.length > 0 && !boardIds.includes(selectedBoardId)) {
      setSelectedBoardId(boardIds[0]);
    }
  }, [boardIds, selectedBoardId]);

  const completedTasks = (project?.tasks || []).filter((t) => t.completed).length;
  const totalTasks = (project?.tasks || []).length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'link': return <FiLink />;
      case 'youtube': return <FiVideo />;
      case 'image': return <FiImage />;
      default: return <FiFileText />;
    }
  };
  const getTypeColor = (type) => {
    switch (type) {
      case 'link': return 'blue';
      case 'youtube': return 'red';
      case 'image': return 'green';
      default: return 'gray';
    }
  };
  const extractYouTubeId = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/);
    return match ? match[1] : null;
  };

  const saveItem = () => {
    const itemData = { ...form, linkedTo: form.linkedTo || '' };
    if (form.id) updateProyectosPizarraItem(projectId, selectedBoardId, form.id, itemData);
    else addProyectosPizarraItem(projectId, selectedBoardId, { ...itemData, position: form.position || { x: 20 + board.length * 20, y: 20 + board.length * 20 } });
    setForm({ type: 'text', title: '', content: '', position: { x: 20, y: 20 }, linkedTo: '' });
    onClose();
  };

  const openNew = () => {
    const maxX = board.reduce((max, item) => Math.max(max, (item.position?.x || 0) + 270), 0);
    setForm({ type: 'text', title: '', content: '', position: { x: maxX > 0 ? maxX + 20 : 20, y: 20 }, linkedTo: '' });
    onOpen();
  };

  const openEdit = (item) => { setForm({ ...item }); onOpen(); };

  const openCreateTask = (item) => {
    setTaskForm({ title: item.title || '', description: '', date: format(new Date(), 'yyyy-MM-dd') });
    onTaskOpen();
  };

  const createTask = () => {
    addAgendaTask({ title: taskForm.title, description: taskForm.description, date: taskForm.date, completed: false, section: 'proyectos', type: 'task' });
    onTaskClose();
  };

  const generateSubtasks = () => {
    if (!project || !project.tasks || project.tasks.length === 0 || !selectedBoardId) return;
    const existingIds = new Set(board.map(b => b.sourceTaskId));
    const newItems = project.tasks
      .filter(t => !existingIds.has(t.id))
      .map((t, i) => ({
        type: 'text',
        title: t.name,
        content: t.description || '',
        position: { x: 20 + (board.length + i) * 260, y: 20 },
        linkedTo: '',
        sourceTaskId: t.id,
      }));
    if (newItems.length > 0) {
      newItems.forEach(item => addProyectosPizarraItem(projectId, selectedBoardId, item));
    }
  };

  const clearBoard = () => {
    if (!selectedBoardId) return;
    board.forEach(item => deleteProyectosPizarraItem(projectId, selectedBoardId, item.id));
  };

  const handleCreateBoard = () => {
    if (!boardName.trim()) return;
    const newId = addProjectBoard(projectId, boardName.trim());
    setSelectedBoardId(newId);
    setBoardName('');
    onBoardClose();
  };

  const handleDeleteBoard = (bid) => {
    deleteProjectBoard(projectId, bid);
  };

  const startRenameBoard = (bid, currentName) => {
    setRenamingBoard(bid);
    setRenameVal(currentName);
  };

  const confirmRenameBoard = () => {
    if (renamingBoard && renameVal.trim()) {
      renameProjectBoard(projectId, renamingBoard, renameVal.trim());
    }
    setRenamingBoard(null);
    setRenameVal('');
  };

  const handleMouseDown = (e, itemId) => {
    e.preventDefault();
    const item = board.find((i) => i.id === itemId);
    if (!item) return;
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    setDragging(itemId);
    setDragOffset({ x: e.clientX - rect.left - (item.position?.x || 0), y: e.clientY - rect.top - (item.position?.y || 0) });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const boardEl = e.currentTarget;
    const rect = boardEl.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - dragOffset.x);
    const y = Math.max(0, e.clientY - rect.top - dragOffset.y);
    updateProyectosPizarraItem(projectId, selectedBoardId, dragging, { position: { x, y } });
  };

  const handleMouseUp = () => { setDragging(null); };

  const renderContent = (item) => {
    if (item.type === 'youtube') {
      const videoId = extractYouTubeId(item.content);
      return videoId ? (
        <Box borderRadius="md" overflow="hidden" mt={2}>
          <iframe width="100%" height="140" src={`https://www.youtube.com/embed/${videoId}`} title={item.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </Box>
      ) : <Text fontSize="xs" color="red.400">URL no válida</Text>;
    }
    if (item.type === 'image') {
      return <Box mt={2}><img src={item.content} alt={item.title} style={{ width: '100%', borderRadius: 6, maxHeight: 150, objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} /></Box>;
    }
    if (item.type === 'link') {
      return <Button as="a" href={item.content} target="_blank" size="xs" variant="link" colorScheme="blue" mt={1} leftIcon={<FiLink />} isTruncated>{item.content}</Button>;
    }
    return <Text fontSize="xs" mt={1} whiteSpace="pre-wrap" noOfLines={4}>{item.content}</Text>;
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={2}>
        <HStack>
          <Text fontWeight="bold">Pizarra</Text>
          {project && <Badge colorScheme="purple">{completedTasks}/{totalTasks} subtareas</Badge>}
        </HStack>
        <HStack>
          <Button size="sm" colorScheme="green" onClick={generateSubtasks} isDisabled={!project || !project.tasks || project.tasks.length === 0 || !selectedBoardId} fontWeight="bold" px={4}>Actualizar desde subtareas</Button>
          <Button size="sm" colorScheme="red" variant="outline" onClick={clearBoard} isDisabled={!selectedBoardId || board.length === 0}>Limpiar pizarra</Button>
          <Button leftIcon={<FiPlus />} size="sm" onClick={openNew} isDisabled={!selectedBoardId}>Nuevo elemento</Button>
        </HStack>
      </Flex>

      <Flex mb={3} align="center" gap={2} wrap="wrap">
        <Text fontSize="sm" fontWeight="bold">Tablero:</Text>
        <Select size="sm" w="200px" value={selectedBoardId} onChange={(e) => setSelectedBoardId(e.target.value)}>
          {boardIds.length === 0 && <option value="">Sin tableros</option>}
          {boardIds.map((bid) => <option key={bid} value={bid}>{projectPizarras[bid]?.name || 'Tablero'}</option>)}
        </Select>
        <Button size="xs" colorScheme="blue" onClick={onBoardOpen}>+ Tablero</Button>
        {selectedBoardId && (
          <>
            <Button size="xs" variant="ghost" onClick={() => startRenameBoard(selectedBoardId, currentBoard?.name || '')}>Renombrar</Button>
            <Button size="xs" variant="ghost" colorScheme="red" onClick={() => handleDeleteBoard(selectedBoardId)} isDisabled={boardIds.length <= 1}>Eliminar</Button>
          </>
        )}
      </Flex>

      {renamingBoard && (
        <HStack mb={2}>
          <Input size="sm" w="200px" value={renameVal} onChange={(e) => setRenameVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirmRenameBoard()} />
          <Button size="xs" colorScheme="green" onClick={confirmRenameBoard}>OK</Button>
          <Button size="xs" variant="ghost" onClick={() => setRenamingBoard(null)}>Cancelar</Button>
        </HStack>
      )}

      {project && (
        <Box mb={3}>
          <Progress value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} size="sm" colorScheme="green" borderRadius="full" />
        </Box>
      )}
      {!project && <Text color="gray.500" textAlign="center" py={8}>Selecciona un proyecto primero</Text>}
      {project && boardIds.length === 0 && <Text color="gray.500" textAlign="center" py={8}>Crea un tablero para empezar.</Text>}
      {project && selectedBoardId && board.length === 0 && <Text color="gray.500" textAlign="center" py={8}>Pizarra vacía. Añade elementos y arrástralos libremente.</Text>}
      {project && selectedBoardId && (
        <Box position="relative" w="100%" h="600px" bg={boardBg} borderRadius="xl" border="1px solid" borderColor={borderColor} overflow="auto" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          {board.map((item) => {
            const linkedItem = item.linkedTo ? board.find((b) => b.id === item.linkedTo) : null;
            return (
              <Box key={item.id} position="absolute" left={`${item.position?.x || 0}px`} top={`${item.position?.y || 0}px`} w="240px" p={3} bg={bg} borderRadius="lg" boxShadow="md" border="1px solid" borderColor={borderColor} cursor="grab" zIndex={dragging === item.id ? 10 : 2} opacity={dragging === item.id ? 0.85 : 1} onMouseDown={(e) => handleMouseDown(e, item.id)}>
                <HStack justify="space-between" mb={1}>
                  <Badge colorScheme={getTypeColor(item.type)} leftIcon={getTypeIcon(item.type)} fontSize="xs">{item.type}</Badge>
                  <HStack spacing={0}>
                    <IconButton icon={<FiEdit3 />} size="xs" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(item); }} />
                    <IconButton icon={<FiTrash2 />} size="xs" variant="ghost" colorScheme="red" onClick={(e) => { e.stopPropagation(); deleteProyectosPizarraItem(projectId, selectedBoardId, item.id); }} />
                  </HStack>
                </HStack>
                <Text fontWeight="bold" fontSize="sm" noOfLines={1}>{item.title}</Text>
                {renderContent(item)}
                {linkedItem && <Badge size="xs" colorScheme="orange" mt={1}>Vinculada a: {linkedItem.title}</Badge>}
                <Button size="xs" colorScheme="purple" mt={2} leftIcon={<FiPlus />} onClick={(e) => { e.stopPropagation(); openCreateTask(item); }} w="100%">Tarea</Button>
              </Box>
            );
          })}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
            {board.map((item) => {
              if (!item.linkedTo) return null;
              const target = board.find(b => b.id === item.linkedTo);
              if (!target) return null;
              const x1 = (item.position?.x || 0) + 120;
              const y1 = (item.position?.y || 0) + 20;
              const x2 = (target.position?.x || 0) + 120;
              const y2 = (target.position?.y || 0) + 20;
              return (
                <g key={`link-${item.id}`}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#E53E3E" strokeWidth="2" strokeDasharray="6,3" />
                  <circle cx={x2} cy={y2} r="5" fill="#E53E3E" />
                </g>
              );
            })}
          </svg>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{form.id ? 'Editar elemento' : 'Nuevo elemento'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl><FormLabel>Tipo</FormLabel><Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="text">Nota de texto</option>
                <option value="link">Enlace web</option>
                <option value="youtube">YouTube</option>
                <option value="image">Imagen</option>
              </Select></FormControl>
              <FormControl><FormLabel>Título</FormLabel><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></FormControl>
              <FormControl><FormLabel>{form.type === 'youtube' ? 'URL del vídeo' : form.type === 'image' ? 'URL de la imagen' : form.type === 'link' ? 'URL del enlace' : 'Contenido'}</FormLabel>
                {form.type === 'text' ? <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={4} /> : <Input value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />}
              </FormControl>
              {board.length > 1 && (
                <FormControl><FormLabel>Vincular a</FormLabel><Select value={form.linkedTo || ''} onChange={(e) => setForm((f) => ({ ...f, linkedTo: e.target.value }))}>
                  <option value="">Sin vinculación</option>
                  {board.filter((b) => b.id !== form.id).map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
                </Select></FormControl>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button onClick={saveItem} isDisabled={!form.title}>{form.id ? 'Guardar' : 'Crear'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isTaskOpen} onClose={onTaskClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crear tarea en Agenda</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl><FormLabel>Título</FormLabel><Input value={taskForm.title} onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))} /></FormControl>
              <FormControl><FormLabel>Descripción</FormLabel><Textarea value={taskForm.description} onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))} rows={3} /></FormControl>
              <FormControl><FormLabel>Fecha</FormLabel><Input type="date" value={taskForm.date} onChange={(e) => setTaskForm((f) => ({ ...f, date: e.target.value }))} /></FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onTaskClose}>Cancelar</Button>
            <Button onClick={createTask} isDisabled={!taskForm.title} colorScheme="purple">Crear tarea</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isBoardOpen} onClose={onBoardClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuevo tablero</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Nombre del tablero</FormLabel>
              <Input value={boardName} onChange={(e) => setBoardName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()} placeholder="Ej: Frontend, Backend, Ideas..." />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onBoardClose}>Cancelar</Button>
            <Button onClick={handleCreateBoard} isDisabled={!boardName.trim()} colorScheme="purple">Crear</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function KanbanBoard({ projectId }) {
  const store = useStore();
  const project = store.projects.find((p) => p.id === projectId);
  const { updateProject, addAgendaTask, addNotification, addKanbanBoard, deleteKanbanBoard, renameKanbanBoard } = store;

  const kanbanBoards = project?.kanbanBoards || {};
  const kanbanBoardIds = Object.keys(kanbanBoards);
  const [selectedKbBoardId, setSelectedKbBoardId] = useState(kanbanBoardIds[0] || '');
  const [kbBoardName, setKbBoardName] = useState('');
  const { isOpen: isKbBoardOpen, onOpen: onKbBoardOpen, onClose: onKbBoardClose } = useDisclosure();

  useEffect(() => {
    if (kanbanBoardIds.length > 0 && !kanbanBoardIds.includes(selectedKbBoardId)) {
      setSelectedKbBoardId(kanbanBoardIds[0]);
    }
  }, [kanbanBoardIds, selectedKbBoardId]);

  const columns = [
    { id: 'pendiente', label: 'Pendiente', color: 'gray' },
    { id: 'progreso', label: 'En Progreso', color: 'blue' },
    { id: 'revision', label: 'En Revisión', color: 'orange' },
    { id: 'completado', label: 'Completado', color: 'green' },
  ];

  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({ name: '', description: '', estimatedHours: 1, startDate: format(new Date(), 'yyyy-MM-dd'), endDate: '' });

  const { isOpen: isTaskModalOpen, onOpen: onTaskModalOpen, onClose: onTaskModalClose } = useDisclosure();
  const [editingTask, setEditingTask] = useState(null);
  const [taskEditForm, setTaskEditForm] = useState({ name: '', description: '', estimatedHours: 1, startDate: '', endDate: '' });

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const columnBg = useColorModeValue('gray.50', 'gray.750');
  const cardBg = useColorModeValue('white', 'gray.800');

  const getColumnTasks = (status) => {
    return (project?.tasks || []).filter(t => (t.status || 'pendiente') === status);
  };

  const handleDragStart = (e, taskId) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDrop = useCallback((e, columnId) => {
    e.preventDefault();
    const currentProject = useStore.getState().projects.find(p => p.id === projectId);
    if (!draggedTask || !currentProject) return;
    const updatedTasks = currentProject.tasks.map(t =>
      t.id === draggedTask ? { ...t, status: columnId } : t
    );
    updateProject(projectId, { tasks: updatedTasks });

    if (columnId === 'completado') {
      const task = currentProject.tasks.find(t => t.id === draggedTask);
      if (task) {
        addNotification({ title: 'Subtarea completada', message: `"${task.name}" completada en "${currentProject.name}"`, type: 'success', section: 'proyectos' });
      }
    }

    setDraggedTask(null);
    setDragOverColumn(null);
  }, [draggedTask, projectId, updateProject, addNotification]);

  const completedCount = getColumnTasks('completado').length;
  const totalTasks = (project?.tasks || []).length;

  const addTaskFromBoard = () => {
    if (!newTaskForm.name || !project) return;
    const newTask = {
      id: Date.now().toString(),
      name: newTaskForm.name,
      description: newTaskForm.description,
      completed: false,
      status: 'pendiente',
      estimatedHours: parseFloat(newTaskForm.estimatedHours) || 1,
      startDate: newTaskForm.startDate || format(new Date(), 'yyyy-MM-dd'),
      endDate: newTaskForm.endDate || '',
    };
    updateProject(projectId, { tasks: [...(project.tasks || []), newTask] });
    setNewTaskForm({ name: '', description: '', estimatedHours: 1, startDate: format(new Date(), 'yyyy-MM-dd'), endDate: '' });
    setIsAddOpen(false);
  };

  const syncFromSubtasks = () => {
    if (!project || !project.tasks || project.tasks.length === 0) return;
    const updatedTasks = project.tasks.map(t => ({
      ...t,
      status: t.completed ? 'completado' : (t.status || 'pendiente'),
    }));
    updateProject(projectId, { tasks: updatedTasks });
  };

  const clearBoard = () => {
    if (!project) return;
    updateProject(projectId, { tasks: [] });
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskEditForm({
      name: task.name || '',
      description: task.description || '',
      estimatedHours: task.estimatedHours || 1,
      startDate: task.startDate || '',
      endDate: task.endDate || '',
    });
    onTaskModalOpen();
  };

  const saveTaskEdit = () => {
    if (!editingTask || !project) return;
    const updatedTasks = project.tasks.map(t =>
      t.id === editingTask.id
        ? {
            ...t,
            name: taskEditForm.name,
            description: taskEditForm.description,
            estimatedHours: parseFloat(taskEditForm.estimatedHours) || 0,
            startDate: taskEditForm.startDate,
            endDate: taskEditForm.endDate,
          }
        : t
    );
    updateProject(projectId, { tasks: updatedTasks });
    onTaskModalClose();
    setEditingTask(null);
  };

  const handleTaskEditFieldChange = (field, value) => {
    setTaskEditForm((prev) => {
      const next = { ...prev, [field]: value };
      if ((field === 'startDate' || field === 'estimatedHours') && next.startDate && next.estimatedHours > 0) {
        const days = Math.ceil(next.estimatedHours / 8);
        const start = new Date(next.startDate);
        const end = addDays(start, days);
        next.endDate = format(end, 'yyyy-MM-dd');
      }
      return next;
    });
  };

  const handleCreateKbBoard = () => {
    if (!kbBoardName.trim()) return;
    const newId = addKanbanBoard(projectId, kbBoardName.trim());
    setSelectedKbBoardId(newId);
    setKbBoardName('');
    onKbBoardClose();
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={2}>
        <HStack>
          <Text fontWeight="bold">Tablero Kanban</Text>
          {project && <Badge colorScheme="purple">{completedCount}/{totalTasks} completadas</Badge>}
        </HStack>
        <HStack>
          <Button size="sm" colorScheme="blue" onClick={syncFromSubtasks} isDisabled={!project || !project.tasks || project.tasks.length === 0}>Sincronizar desde subtareas</Button>
          <Button size="sm" colorScheme="red" variant="outline" onClick={clearBoard} isDisabled={!project || totalTasks === 0}>Limpiar tablero</Button>
          <Button leftIcon={<FiPlus />} size="sm" onClick={() => setIsAddOpen(true)} isDisabled={!project}>Nueva tarea</Button>
        </HStack>
      </Flex>

      <Flex mb={3} align="center" gap={2} wrap="wrap">
        <Text fontSize="sm" fontWeight="bold">Tablero:</Text>
        <Select size="sm" w="200px" value={selectedKbBoardId} onChange={(e) => setSelectedKbBoardId(e.target.value)}>
          {kanbanBoardIds.length === 0 && <option value="">Sin tableros</option>}
          {kanbanBoardIds.map((bid) => <option key={bid} value={bid}>{kanbanBoards[bid]?.name || 'Tablero'}</option>)}
        </Select>
        <Button size="xs" colorScheme="blue" onClick={onKbBoardOpen}>+ Tablero</Button>
        {selectedKbBoardId && (
          <Button size="xs" variant="ghost" colorScheme="red" onClick={() => { deleteKanbanBoard(projectId, selectedKbBoardId); setSelectedKbBoardId(kanbanBoardIds.find(b => b !== selectedKbBoardId) || ''); }} isDisabled={kanbanBoardIds.length <= 1}>Eliminar</Button>
        )}
      </Flex>

      {project && (
        <Box mb={4}>
          <Flex justify="space-between" mb={1}>
            <Text fontSize="xs" color="gray.500">Progreso general</Text>
            <Text fontSize="xs" fontWeight="bold">{totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0}%</Text>
          </Flex>
          <Progress value={totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0} size="sm" colorScheme="green" borderRadius="full" />
        </Box>
      )}
      {!project && <Text color="gray.500" textAlign="center" py={8}>Selecciona un proyecto primero</Text>}
      {project && kanbanBoardIds.length === 0 && <Text color="gray.500" textAlign="center" py={8}>Crea un tablero kanban para empezar.</Text>}
      {project && selectedKbBoardId && (
        <Flex gap={4} align="flex-start" overflowX="auto" pb={4}>
          {columns.map((col) => (
            <Box
              key={col.id}
              flex={1}
              minW="260px"
              minH="400px"
              bg={columnBg}
              borderRadius="xl"
              border="2px solid"
              borderColor={dragOverColumn === col.id ? `${col.color}.400` : 'transparent'}
              p={3}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              onDragLeave={() => setDragOverColumn(null)}
              transition="border-color 0.2s"
            >
              <HStack mb={3} justify="space-between">
                <HStack>
                  <Badge colorScheme={col.color} fontSize="xs">{col.label}</Badge>
                  <Text fontSize="xs" color="gray.500">{getColumnTasks(col.id).length}</Text>
                </HStack>
              </HStack>
              <VStack spacing={2} align="stretch">
                {getColumnTasks(col.id).map((task) => (
                  <Box
                    key={task.id}
                    p={3}
                    bg={cardBg}
                    borderRadius="lg"
                    boxShadow="sm"
                    border="1px solid"
                    borderColor={borderColor}
                    cursor="grab"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    opacity={draggedTask === task.id ? 0.5 : 1}
                    _hover={{ boxShadow: 'md' }}
                  >
                    <HStack justify="space-between" mb={1}>
                      <Text fontWeight="bold" fontSize="sm" noOfLines={1} flex={1}>{task.name}</Text>
                      <IconButton icon={<FiEdit3 />} size="xs" variant="ghost" onClick={() => openEditTask(task)} />
                    </HStack>
                    <Wrap spacing={1} mb={1}>
                      {task.estimatedHours > 0 && <Badge size="xs" colorScheme="blue">{task.estimatedHours}h est.</Badge>}
                      {task.startDate && <Badge size="xs" colorScheme="gray">Inicio: {task.startDate}</Badge>}
                      {task.endDate && <Badge size="xs" colorScheme="orange">Fin: {task.endDate}</Badge>}
                    </Wrap>
                    {task.description && <Text fontSize="xs" color="gray.500" noOfLines={2}>{task.description.slice(0, 50)}{task.description.length > 50 ? '...' : ''}</Text>}
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="purple"
                      leftIcon={<FiClock />}
                      mt={1}
                      onClick={() => {
                        addAgendaTask({ title: task.name, description: task.description || `Subtarea de ${project.name}`, date: task.startDate || format(new Date(), 'yyyy-MM-dd'), completed: false, section: 'proyectos', type: 'task' });
                        addNotification({ title: 'Tarea enviada a Agenda', message: `"${task.name}" agregada a la agenda`, type: 'info', section: 'proyectos' });
                      }}
                    >
                      Activar en Agenda
                    </Button>
                  </Box>
                ))}
                {getColumnTasks(col.id).length === 0 && (
                  <Text fontSize="xs" color="gray.400" textAlign="center" py={4}>Sin tareas</Text>
                )}
              </VStack>
            </Box>
          ))}
        </Flex>
      )}

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nueva tarea</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl><FormLabel>Nombre</FormLabel><Input value={newTaskForm.name} onChange={(e) => setNewTaskForm(f => ({ ...f, name: e.target.value }))} /></FormControl>
              <FormControl><FormLabel>Descripción</FormLabel><Textarea value={newTaskForm.description} onChange={(e) => setNewTaskForm(f => ({ ...f, description: e.target.value }))} rows={3} /></FormControl>
              <HStack spacing={3} w="100%">
                <FormControl flex={1}><FormLabel>Horas est.</FormLabel><Input type="number" min={0.5} step={0.5} value={newTaskForm.estimatedHours} onChange={(e) => setNewTaskForm(f => ({ ...f, estimatedHours: e.target.value }))} /></FormControl>
                <FormControl flex={1}><FormLabel>Inicio</FormLabel><Input type="date" value={newTaskForm.startDate} onChange={(e) => setNewTaskForm(f => ({ ...f, startDate: e.target.value }))} /></FormControl>
                <FormControl flex={1}><FormLabel>Fin</FormLabel><Input type="date" value={newTaskForm.endDate} onChange={(e) => setNewTaskForm(f => ({ ...f, endDate: e.target.value }))} /></FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsAddOpen(false)}>Cancelar</Button>
            <Button onClick={addTaskFromBoard} isDisabled={!newTaskForm.name} colorScheme="purple">Crear tarea</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isTaskModalOpen} onClose={onTaskModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Subtarea</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl><FormLabel>Nombre</FormLabel><Input value={taskEditForm.name} onChange={(e) => setTaskEditForm(f => ({ ...f, name: e.target.value }))} /></FormControl>
              <FormControl><FormLabel>Descripción</FormLabel><Textarea value={taskEditForm.description} onChange={(e) => setTaskEditForm(f => ({ ...f, description: e.target.value }))} rows={3} /></FormControl>
              <FormControl><FormLabel>Horas estimadas</FormLabel><Input type="number" min={0.5} step={0.5} value={taskEditForm.estimatedHours} onChange={(e) => handleTaskEditFieldChange('estimatedHours', e.target.value)} /></FormControl>
              <HStack spacing={3} w="100%">
                <FormControl flex={1}><FormLabel>Fecha inicio</FormLabel><Input type="date" value={taskEditForm.startDate} onChange={(e) => handleTaskEditFieldChange('startDate', e.target.value)} /></FormControl>
                <FormControl flex={1}><FormLabel>Fecha fin (auto)</FormLabel><Input type="date" value={taskEditForm.endDate} onChange={(e) => setTaskEditForm(f => ({ ...f, endDate: e.target.value }))} /></FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onTaskModalClose}>Cancelar</Button>
            <Button onClick={saveTaskEdit} isDisabled={!taskEditForm.name} colorScheme="purple">Guardar cambios</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isKbBoardOpen} onClose={onKbBoardClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuevo tablero Kanban</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Nombre del tablero</FormLabel>
              <Input value={kbBoardName} onChange={(e) => setKbBoardName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateKbBoard()} placeholder="Ej: Sprint 1, Backlog..." />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onKbBoardClose}>Cancelar</Button>
            <Button onClick={handleCreateKbBoard} isDisabled={!kbBoardName.trim()} colorScheme="purple">Crear</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default function Proyectos() {
  const { projects, projectPizarras, addProjectBoard } = useStore();
  const [pizarraProjectId, setPizarraProjectId] = useState('');
  const [pizarraBoardId, setPizarraBoardId] = useState('');
  const [kanbanProjectId, setKanbanProjectId] = useState('');
  const [kanbanBoardId, setKanbanBoardId] = useState('');
  const tabBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (projects.length > 0 && !pizarraProjectId) setPizarraProjectId(projects[0].id);
  }, [projects, pizarraProjectId]);

  useEffect(() => {
    if (projects.length > 0 && !kanbanProjectId) setKanbanProjectId(projects[0].id);
  }, [projects, kanbanProjectId]);

  const pizarraBoards = pizarraProjectId ? (projectPizarras[pizarraProjectId] || {}) : {};
  const pizarraBoardIds = Object.keys(pizarraBoards);

  useEffect(() => {
    if (pizarraBoardIds.length > 0 && !pizarraBoardIds.includes(pizarraBoardId)) {
      setPizarraBoardId(pizarraBoardIds[0]);
    }
  }, [pizarraBoardIds, pizarraBoardId]);

  const kanbanProject = projects.find(p => p.id === kanbanProjectId);
  const kanbanBoards = kanbanProject?.kanbanBoards || {};
  const kanbanBoardIds = Object.keys(kanbanBoards);

  useEffect(() => {
    if (kanbanBoardIds.length > 0 && !kanbanBoardIds.includes(kanbanBoardId)) {
      setKanbanBoardId(kanbanBoardIds[0]);
    }
  }, [kanbanBoardIds, kanbanBoardId]);

  const handlePizarraProjectChange = (val) => {
    setPizarraProjectId(val);
    setPizarraBoardId('');
  };

  const handleKanbanProjectChange = (val) => {
    setKanbanProjectId(val);
    setKanbanBoardId('');
  };

  return (
    <Tabs variant="enclosed" colorScheme="purple">
      <TabList>
        <Tab><FiGrid style={{ marginRight: 8 }} />Proyectos</Tab>
        <Tab><FiClock style={{ marginRight: 8 }} />Registrar Horas</Tab>
        <Tab><FiTrendingUp style={{ marginRight: 8 }} />Estadísticas</Tab>
        <Tab><FiFileText style={{ marginRight: 8 }} />Pizarra</Tab>
        <Tab><FiGrid style={{ marginRight: 8 }} />Tablero</Tab>
      </TabList>
      <TabPanels>
        <TabPanel px={0}><ProjectManager /></TabPanel>
        <TabPanel px={0}><LogHours /></TabPanel>
        <TabPanel px={0}><ProjectStats /></TabPanel>
        <TabPanel px={0}>
          {projects.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={8}>Crea un proyecto primero para usar la pizarra</Text>
          ) : (
            <Box>
              <HStack mb={4} p={3} bg={tabBg} borderRadius="xl" border="1px solid" borderColor={useColorModeValue('gray.200', 'gray.700')} wrap="wrap" gap={2}>
                <Text fontSize="sm" fontWeight="bold">Proyecto:</Text>
                <Select size="sm" w="250px" value={pizarraProjectId} onChange={(e) => handlePizarraProjectChange(e.target.value)}>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
                {pizarraBoardIds.length > 0 && (
                  <>
                    <Text fontSize="sm" fontWeight="bold">Tablero:</Text>
                    <Select size="sm" w="200px" value={pizarraBoardId} onChange={(e) => setPizarraBoardId(e.target.value)}>
                      {pizarraBoardIds.map((bid) => <option key={bid} value={bid}>{pizarraBoards[bid]?.name || 'Tablero'}</option>)}
                    </Select>
                  </>
                )}
              </HStack>
              {pizarraProjectId && <PizarraProyectos projectId={pizarraProjectId} />}
            </Box>
          )}
        </TabPanel>
        <TabPanel px={0}>
          {projects.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={8}>Crea un proyecto primero para usar el tablero</Text>
          ) : (
            <Box>
              <HStack mb={4} p={3} bg={tabBg} borderRadius="xl" border="1px solid" borderColor={useColorModeValue('gray.200', 'gray.700')} wrap="wrap" gap={2}>
                <Text fontSize="sm" fontWeight="bold">Proyecto:</Text>
                <Select size="sm" w="250px" value={kanbanProjectId} onChange={(e) => handleKanbanProjectChange(e.target.value)}>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
                {kanbanBoardIds.length > 0 && (
                  <>
                    <Text fontSize="sm" fontWeight="bold">Tablero:</Text>
                    <Select size="sm" w="200px" value={kanbanBoardId} onChange={(e) => setKanbanBoardId(e.target.value)}>
                      {kanbanBoardIds.map((bid) => <option key={bid} value={bid}>{kanbanBoards[bid]?.name || 'Tablero'}</option>)}
                    </Select>
                  </>
                )}
              </HStack>
              {kanbanProjectId && <KanbanBoard projectId={kanbanProjectId} />}
            </Box>
          )}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
