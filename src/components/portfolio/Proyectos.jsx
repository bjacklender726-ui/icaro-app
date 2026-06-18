import React, { useState, useMemo, useEffect } from 'react';
import { Box, Grid, Text, Flex, VStack, HStack, Badge, Button, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, Input, Textarea, Select, Progress, Stat, StatLabel, StatNumber, SimpleGrid, useColorModeValue, Tabs, TabList, TabPanels, Tab, TabPanel, Wrap, WrapItem, Tag, Collapse, Switch, Checkbox, Tooltip } from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiEdit3, FiGrid, FiClock, FiChevronDown, FiChevronRight, FiTrendingUp, FiLink, FiImage, FiVideo, FiFileText, FiX } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import useStore from '../../store/useStore';
import { formatDate } from '../../utils/helpers';
import { useRechartStyles } from '../../utils/rechartStyles';
import { format, subDays, subWeeks, subMonths, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, startOfWeek, startOfMonth } from 'date-fns';

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
  const [editing, setEditing] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', tasks: [], technologies: [], onlineLink: '' });
  const [creationMode, setCreationMode] = useState('suggested');
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [customTechs, setCustomTechs] = useState([]);
  const [generateSubtasks, setGenerateSubtasks] = useState(false);
  const [taskForm, setTaskForm] = useState({ name: '', description: '', estimatedHours: 1, startDate: format(new Date(), 'yyyy-MM-dd'), endDate: '' });
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const taskRowBg = useColorModeValue('gray.50', 'gray.700');
  const taskBorder = useColorModeValue('gray.300', 'gray.600');
  const suggestionBg = useColorModeValue('gray.50', 'gray.700');
  const suggestionActiveBg = useColorModeValue('blue.50', 'blue.900');
  const techCategoryBg = useColorModeValue('gray.100', 'gray.600');

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', description: '', tasks: [], technologies: [], onlineLink: '' });
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
    setForm((f) => ({
      ...f,
      name: suggestion.name,
      description: suggestion.description,
      technologies: suggestion.technologies,
      tasks: suggestion.defaultTasks.map((name, i) => ({ id: `gen-${i}`, name, description: '', completed: false })),
    }));
  };

  const regenerateSuggestionTasks = () => {
    if (!selectedSuggestion) return;
    setForm((f) => ({
      ...f,
      tasks: selectedSuggestion.defaultTasks.map((name, i) => ({ id: `gen-${i}`, name, description: '', completed: false })),
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
                        <Tooltip label="Activar en Agenda">
                          <IconButton icon={<FiClock />} size="xs" variant="ghost" colorScheme="purple" onClick={() => {
                            addAgendaTask({ title: t.name, description: t.description || `Subtarea de ${p.name}`, date: t.startDate || format(new Date(), 'yyyy-MM-dd'), completed: false, section: 'proyectos', type: 'task' });
                            addNotification({ title: 'Tarea enviada a Agenda', message: `"${t.name}" agregada a la agenda`, type: 'info', section: 'proyectos' });
                          }} />
                        </Tooltip>
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
                    <Text fontSize="xs" color="gray.400" mt={1}>{s.defaultTasks.length} subtareas predefinidas</Text>
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
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button onClick={save} isDisabled={!form.name}>{editing ? 'Guardar' : 'Crear'}</Button>
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
  const taskBorder = useColorModeValue('gray.300', 'gray.600');
  const [periodFilter, setPeriodFilter] = useState('daily');
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { textColor, gridColor, tooltipBg, tooltipBorder, tooltipColor } = useRechartStyles();

  const totalHours = useMemo(() => +(projectLogs.reduce((a, l) => a + (l.hours || 0), 0)).toFixed(1), [projectLogs]);

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
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Horas Totales</StatLabel><StatNumber>{totalHours}h</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Proyectos</StatLabel><StatNumber>{projects.length}</StatNumber></Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={borderColor} textAlign="center">
          <Stat><StatLabel>Horas {formatDate(filterDate)}</StatLabel><StatNumber color="blue.500">{filteredHours}h</StatNumber></Stat>
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
          <Input type="date" size="sm" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} mb={3} />
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
    </Box>
  );
}

function PizarraProyectos({ projectId }) {
  const store = useStore();
  const board = store.projectPizarras[projectId] || [];
  const project = store.projects.find((p) => p.id === projectId);
  const { addProyectosPizarraItem, updateProyectosPizarraItem, deleteProyectosPizarraItem, updateProject, addAgendaTask } = store;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isTaskOpen, onOpen: onTaskOpen, onClose: onTaskClose } = useDisclosure();
  const [form, setForm] = useState({ type: 'text', title: '', content: '', position: { x: 20, y: 20 }, linkedTo: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', date: format(new Date(), 'yyyy-MM-dd') });
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const boardBg = useColorModeValue('gray.50', 'gray.900');

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
    if (form.id) updateProyectosPizarraItem(projectId, form.id, itemData);
    else addProyectosPizarraItem(projectId, { ...itemData, position: form.position || { x: 20 + board.length * 20, y: 20 + board.length * 20 } });
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
    console.log('generateSubtasks called', { project, board });
    if (!project || !board || board.length === 0) return;
    const existingTasks = project.tasks || [];
    const newTasks = board.map((item) => ({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      name: item.title || 'Sin título',
      description: item.content || '',
      completed: false,
      estimatedHours: 1,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
    }));
    updateProject(projectId, { tasks: [...existingTasks, ...newTasks] });
    console.log('Subtasks generated:', newTasks.length);
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
    updateProyectosPizarraItem(projectId, dragging, { position: { x, y } });
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
      <Flex justify="space-between" align="center" mb={4}>
        <HStack>
          <Text fontWeight="bold">Pizarra</Text>
          {project && <Badge colorScheme="purple">{completedTasks}/{totalTasks} subtareas</Badge>}
        </HStack>
        <HStack>
          <Button size="sm" colorScheme="green" onClick={generateSubtasks} isDisabled={!project} fontWeight="bold" px={4}>Generar subtareas</Button>
          <Button leftIcon={<FiPlus />} size="sm" onClick={openNew}>Nuevo elemento</Button>
        </HStack>
      </Flex>
      {project && (
        <Box mb={3}>
          <Progress value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} size="sm" colorScheme="green" borderRadius="full" />
        </Box>
      )}
      {!project && <Text color="gray.500" textAlign="center" py={8}>Selecciona un proyecto primero</Text>}
      {project && board.length === 0 && <Text color="gray.500" textAlign="center" py={8}>Pizarra vacía. Añade elementos y arrástralos libremente.</Text>}
      {project && (
        <Box position="relative" w="100%" h="600px" bg={boardBg} borderRadius="xl" border="1px solid" borderColor={borderColor} overflow="auto" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          {board.map((item) => {
            const linkedItem = item.linkedTo ? board.find((b) => b.id === item.linkedTo) : null;
            return (
              <Box key={item.id} position="absolute" left={`${item.position?.x || 0}px`} top={`${item.position?.y || 0}px`} w="240px" p={3} bg={bg} borderRadius="lg" boxShadow="md" border="1px solid" borderColor={borderColor} cursor="grab" zIndex={dragging === item.id ? 10 : 1} opacity={dragging === item.id ? 0.85 : 1} onMouseDown={(e) => handleMouseDown(e, item.id)}>
                <HStack justify="space-between" mb={1}>
                  <Badge colorScheme={getTypeColor(item.type)} leftIcon={getTypeIcon(item.type)} fontSize="xs">{item.type}</Badge>
                  <HStack spacing={0}>
                    <IconButton icon={<FiEdit3 />} size="xs" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(item); }} />
                    <IconButton icon={<FiTrash2 />} size="xs" variant="ghost" colorScheme="red" onClick={(e) => { e.stopPropagation(); deleteProyectosPizarraItem(projectId, item.id); }} />
                  </HStack>
                </HStack>
                <Text fontWeight="bold" fontSize="sm" noOfLines={1}>{item.title}</Text>
                {renderContent(item)}
                {linkedItem && <Badge size="xs" colorScheme="orange" mt={1}>Vinculada a: {linkedItem.title}</Badge>}
                <Button size="xs" colorScheme="purple" mt={2} leftIcon={<FiPlus />} onClick={(e) => { e.stopPropagation(); openCreateTask(item); }} w="100%">Tarea</Button>
              </Box>
            );
          })}
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
    </Box>
  );
}

export default function Proyectos() {
  const { projects } = useStore();
  const [pizarraProjectId, setPizarraProjectId] = useState('');
  const tabBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (projects.length > 0 && !pizarraProjectId) setPizarraProjectId(projects[0].id);
  }, [projects, pizarraProjectId]);

  return (
    <Tabs variant="enclosed" colorScheme="purple">
      <TabList>
        <Tab><FiGrid style={{ marginRight: 8 }} />Proyectos</Tab>
        <Tab><FiClock style={{ marginRight: 8 }} />Registrar Horas</Tab>
        <Tab><FiTrendingUp style={{ marginRight: 8 }} />Estadísticas</Tab>
        <Tab><FiFileText style={{ marginRight: 8 }} />Pizarra</Tab>
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
              <HStack mb={4} p={3} bg={tabBg} borderRadius="xl" border="1px solid" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                <Text fontSize="sm" fontWeight="bold">Proyecto:</Text>
                <Select size="sm" w="250px" value={pizarraProjectId} onChange={(e) => setPizarraProjectId(e.target.value)}>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </HStack>
              {pizarraProjectId && <PizarraProyectos projectId={pizarraProjectId} />}
            </Box>
          )}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
