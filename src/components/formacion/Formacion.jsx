import React, { useState, useMemo } from 'react';
import { Box, Flex, Text, Button, Input, Select, Badge, VStack, HStack, SimpleGrid, Card, CardBody, Heading, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useToast, Tooltip, Progress, Tabs, TabList, TabPanels, Tab, TabPanel, Textarea, Checkbox, Divider, Tag, TagLeftIcon, Avatar, AvatarGroup, Stat, StatLabel, StatNumber, StatHelpText, useColorModeValue, FormControl, FormLabel, Collapse } from '@chakra-ui/react';
import { FiSearch, FiPlus, FiTrash2, FiEdit2, FiExternalLink, FiStar, FiCheck, FiClock, FiAward, FiBookOpen, FiFilter, FiChevronUp, FiChevronDown, FiTarget, FiDollarSign, FiCalendar, FiX, FiSave, FiPlay } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import useStore from '../../store/useStore';

const providerColors = {
  'AWS': 'orange',
  'Azure': 'blue',
  'Google Cloud': 'red',
  'Oracle': 'red',
  'Kubernetes': 'blue',
  'Docker': 'cyan',
  'HashiCorp': 'purple',
  'Cisco': 'blue',
  'CompTIA': 'green',
  'Red Hat': 'red',
  'MongoDB': 'green',
};

const levelColors = {
  'Fundamentals': 'green',
  'Associate': 'blue',
  'Professional': 'purple',
  'Specialty': 'orange',
};

const branchOptions = ['Todos', 'Cloud', 'DevOps', 'Bases de Datos', 'Programación', 'Ciberseguridad', 'Redes', 'IA/ML', 'Gestión de Proyectos'];
const levelOptions = ['Todos', 'Fundamentals', 'Associate', 'Professional', 'Specialty'];

const CERTIFICATIONS = [
  {
    id: 'aws-ccp',
    name: 'AWS Certified Cloud Practitioner',
    provider: 'AWS',
    branch: 'Cloud',
    level: 'Fundamentals',
    price: 100,
    isFree: false,
    questions: '65',
    duration: '90 min',
    passingScore: '700/1000',
    validity: '3 años',
    difficulty: 2,
    description: 'Certificación de nivel de entrada que valida una comprensión general de AWS Cloud. Ideal para profesionales no técnicos que necesitan comprender los conceptos fundamentales de la nube.',
    prerequisites: 'No se requieren prerrequisitos técnicos. Se recomienda 6 meses de experiencia con AWS Cloud.',
    examFormat: 'Examen de opción múltiple y múltiple respuesta, 65 preguntas, 90 minutos.',
    languages: 'Inglés, Japonés, Coreano, Chino simplificado, Indonesio, Español',
    studyTimeEstimate: '40-60 horas',
    officialLink: 'https://aws.amazon.com/certification/',
  },
  {
    id: 'aws-saa',
    name: 'AWS Certified Solutions Architect Associate',
    provider: 'AWS',
    branch: 'Cloud',
    level: 'Associate',
    price: 150,
    isFree: false,
    questions: '65',
    duration: '130 min',
    passingScore: '720/1000',
    validity: '3 años',
    difficulty: 3,
    description: 'Valida la capacidad de diseñar sistemas distribuidos en AWS. Cubre arquitectura de soluciones, migración de workloads y optimización de costes.',
    prerequisites: 'Experiencia práctica con AWS Cloud de 1 año o más. Conocimiento de servicios AWS y arquitectura de soluciones.',
    examFormat: 'Examen de opción múltiple y múltiple respuesta, 65 preguntas, 130 minutos.',
    languages: 'Inglés, Japonés, Coreano, Chino simplificado, Indonesio',
    studyTimeEstimate: '80-120 horas',
    officialLink: 'https://aws.amazon.com/certification/',
  },
  {
    id: 'aws-developer',
    name: 'AWS Certified Developer Associate',
    provider: 'AWS',
    branch: 'Cloud',
    level: 'Associate',
    price: 150,
    isFree: false,
    questions: '65',
    duration: '130 min',
    passingScore: '720/1000',
    validity: '3 años',
    difficulty: 3,
    description: 'Valida la habilidad para desarrollar, desplegar y depurar aplicaciones en la nube AWS. Cubre servicios core de AWS y herramientas de desarrollo.',
    prerequisites: 'Experiencia de 1 o más años desarrollando y manteniendo aplicaciones en AWS.',
    examFormat: 'Examen de opción múltiple y múltiple respuesta, 65 preguntas, 130 minutos.',
    languages: 'Inglés, Japonés',
    studyTimeEstimate: '80-100 horas',
    officialLink: 'https://aws.amazon.com/certification/',
  },
  {
    id: 'aws-cloudops',
    name: 'AWS Certified CloudOps Engineer Associate',
    provider: 'AWS',
    branch: 'DevOps',
    level: 'Associate',
    price: 150,
    isFree: false,
    questions: '65',
    duration: '130 min',
    passingScore: '720/1000',
    validity: '3 años',
    difficulty: 3,
    description: 'Valida competencias técnicas en operaciones en la nube. Cubre implementación, gestión, monitoreo y mantenimiento de sistemas en AWS.',
    prerequisites: '1 año de experiencia con sistemas operativos y administración de infraestructura en AWS.',
    examFormat: 'Examen de opción múltiple y múltiple respuesta, 65 preguntas, 130 minutos.',
    languages: 'Inglés, Japonés',
    studyTimeEstimate: '80-100 horas',
    officialLink: 'https://aws.amazon.com/certification/',
  },
  {
    id: 'aws-data-engineer',
    name: 'AWS Certified Data Engineer Associate',
    provider: 'AWS',
    branch: 'Cloud',
    level: 'Associate',
    price: 150,
    isFree: false,
    questions: '65',
    duration: '130 min',
    passingScore: '720/1000',
    validity: '3 años',
    difficulty: 3,
    description: 'Valida competencias en ingeniería de datos en AWS. Cubre ETL, Data Lakes, Glue, Redshift, Kinesis y otras herramientas de datos de AWS.',
    prerequisites: 'Experiencia en ingeniería de datos y conocimiento de servicios de datos de AWS.',
    examFormat: 'Examen de opción múltiple y múltiple respuesta, 65 preguntas, 130 minutos.',
    languages: 'Inglés',
    studyTimeEstimate: '60-80 horas',
    officialLink: 'https://aws.amazon.com/certification/',
  },
  {
    id: 'aws-sap',
    name: 'AWS Certified Solutions Architect Professional',
    provider: 'AWS',
    branch: 'Cloud',
    level: 'Professional',
    price: 300,
    isFree: false,
    questions: '75',
    duration: '180 min',
    passingScore: '750/1000',
    validity: '3 años',
    difficulty: 5,
    description: 'Certificación avanzada para arquitectos de soluciones experimentados. Cubre diseño de arquitecturas complejas, migraciones y estrategias de costes a nivel enterprise.',
    prerequisites: 'Certificación Solutions Architect Associate y 2+ años de experiencia en diseño de arquitecturas en AWS.',
    examFormat: 'Examen de opción múltiple y múltiple respuesta, 75 preguntas, 180 minutos.',
    languages: 'Inglés, Japonés',
    studyTimeEstimate: '150-200 horas',
    officialLink: 'https://aws.amazon.com/certification/',
  },
  {
    id: 'aws-devops-pro',
    name: 'AWS Certified DevOps Engineer Professional',
    provider: 'AWS',
    branch: 'DevOps',
    level: 'Professional',
    price: 300,
    isFree: false,
    questions: '75',
    duration: '180 min',
    passingScore: '750/1000',
    validity: '3 años',
    difficulty: 5,
    description: 'Certificación avanzada para profesionales DevOps. Cubre CI/CD, automatización de infraestructura, monitoreo y prácticas de operaciones en la nube.',
    prerequisites: 'Certificación Developer o SysOps Associate y 2+ años de experiencia en operaciones en la nube.',
    examFormat: 'Examen de opción múltiple y múltiple respuesta, 75 preguntas, 180 minutos.',
    languages: 'Inglés',
    studyTimeEstimate: '120-160 horas',
    officialLink: 'https://aws.amazon.com/certification/',
  },
  {
    id: 'aws-security',
    name: 'AWS Certified Security Specialty',
    provider: 'AWS',
    branch: 'Ciberseguridad',
    level: 'Specialty',
    price: 300,
    isFree: false,
    questions: '65',
    duration: '170 min',
    passingScore: '750/1000',
    validity: '3 años',
    difficulty: 5,
    description: 'Valida experiencia en seguridad en AWS. Cubre identidades, detección de incidentes, protección de infraestructura y datos.',
    prerequisites: '5+ años de experiencia en seguridad IT, 2+ años de experiencia en seguridad en AWS.',
    examFormat: 'Examen de opción múltiple y múltiple respuesta, 65 preguntas, 170 minutos.',
    languages: 'Inglés, Japonés',
    studyTimeEstimate: '100-140 horas',
    officialLink: 'https://aws.amazon.com/certification/',
  },
  {
    id: 'aws-ai',
    name: 'AWS Certified AI Practitioner',
    provider: 'AWS',
    branch: 'IA/ML',
    level: 'Fundamentals',
    price: 100,
    isFree: false,
    questions: '65',
    duration: '90 min',
    passingScore: '700/1000',
    validity: '3 años',
    difficulty: 2,
    description: 'Valida conocimientos fundamentales de IA y ML en la nube AWS. Cubre casos de uso, soluciones y mejores prácticas de IA generativa.',
    prerequisites: 'No se requieren prerrequisitos técnicos. Conocimiento básico de concepts de IA/ML.',
    examFormat: 'Examen de opción múltiple y múltiple respuesta, 65 preguntas, 90 minutos.',
    languages: 'Inglés',
    studyTimeEstimate: '30-40 horas',
    officialLink: 'https://aws.amazon.com/certification/',
  },
  {
    id: 'az-900',
    name: 'AZ-900 Azure Fundamentals',
    provider: 'Azure',
    branch: 'Cloud',
    level: 'Fundamentals',
    price: 99,
    isFree: false,
    questions: '40-60',
    duration: '45 min',
    passingScore: '700/1000',
    validity: '1 año',
    difficulty: 1,
    description: 'Certificación de entrada que valida conceptos fundamentales de computación en la nube y servicios de Microsoft Azure.',
    prerequisites: 'No se requieren prerrequisitos técnicos.',
    examFormat: 'Examen de opción múltiple, 40-60 preguntas, 45 minutos.',
    languages: 'Español, Inglés, y muchos más',
    studyTimeEstimate: '15-25 horas',
    officialLink: 'https://learn.microsoft.com/en-us/credentials/browse/?credential_type=certification',
  },
  {
    id: 'az-ai-900',
    name: 'AI-900 Azure AI Fundamentals',
    provider: 'Azure',
    branch: 'IA/ML',
    level: 'Fundamentals',
    price: 99,
    isFree: false,
    questions: '40-60',
    duration: '45 min',
    passingScore: '700/1000',
    validity: '1 año',
    difficulty: 1,
    description: 'Valida conocimientos básicos de servicios de IA en Microsoft Azure, incluyendo-machine learning, visión por computadora, procesamiento de lenguaje natural.',
    prerequisites: 'No se requieren prerrequisitos técnicos.',
    examFormat: 'Examen de opción múltiple, 40-60 preguntas, 45 minutos.',
    languages: 'Español, Inglés, y muchos más',
    studyTimeEstimate: '15-20 horas',
    officialLink: 'https://learn.microsoft.com/en-us/credentials/browse/?credential_type=certification',
  },
  {
    id: 'az-dp-900',
    name: 'DP-900 Azure Data Fundamentals',
    provider: 'Azure',
    branch: 'Bases de Datos',
    level: 'Fundamentals',
    price: 99,
    isFree: false,
    questions: '40-60',
    duration: '45 min',
    passingScore: '700/1000',
    validity: '1 año',
    difficulty: 1,
    description: 'Valida conceptos fundamentales de datos en la nube. Cubre tipos de datos, trabajo con datos relacionales y no relacionales en Azure.',
    prerequisites: 'No se requieren prerrequisitos técnicos.',
    examFormat: 'Examen de opción múltiple, 40-60 preguntas, 45 minutos.',
    languages: 'Español, Inglés, y muchos más',
    studyTimeEstimate: '15-20 horas',
    officialLink: 'https://learn.microsoft.com/en-us/credentials/browse/?credential_type=certification',
  },
  {
    id: 'az-sc-900',
    name: 'SC-900 Security Fundamentals',
    provider: 'Azure',
    branch: 'Ciberseguridad',
    level: 'Fundamentals',
    price: 99,
    isFree: false,
    questions: '40-60',
    duration: '45 min',
    passingScore: '700/1000',
    validity: '1 año',
    difficulty: 1,
    description: 'Valida conceptos fundamentales de seguridad, cumplimiento e identidad en Microsoft Azure.',
    prerequisites: 'No se requieren prerrequisitos técnicos.',
    examFormat: 'Examen de opción múltiple, 40-60 preguntas, 45 minutos.',
    languages: 'Español, Inglés, y muchos más',
    studyTimeEstimate: '15-20 horas',
    officialLink: 'https://learn.microsoft.com/en-us/credentials/browse/?credential_type=certification',
  },
  {
    id: 'az-104',
    name: 'AZ-104 Azure Administrator',
    provider: 'Azure',
    branch: 'Cloud',
    level: 'Associate',
    price: 165,
    isFree: false,
    questions: '40-60',
    duration: '100 min',
    passingScore: '700/1000',
    validity: '1 año',
    difficulty: 3,
    description: 'Valida habilidades para administrar servicios de Azure. Cubre identidades, gobernanza, infraestructura, bases de datos y más.',
    prerequisites: 'Experiencia práctica administrando Azure. Conocimiento de PowerShell, Azure CLI, Portal de Azure.',
    examFormat: 'Examen de opción múltiple y múltiple respuesta, 40-60 preguntas, 100 minutos.',
    languages: 'Español, Inglés, y muchos más',
    studyTimeEstimate: '60-80 horas',
    officialLink: 'https://learn.microsoft.com/en-us/credentials/browse/?credential_type=certification',
  },
  {
    id: 'az-204',
    name: 'AZ-204 Azure Developer',
    provider: 'Azure',
    branch: 'Programación',
    level: 'Associate',
    price: 165,
    isFree: false,
    questions: '40-60',
    duration: '100 min',
    passingScore: '700/1000',
    validity: '1 año',
    difficulty: 3,
    description: 'Valida habilidades para desarrollar soluciones en la nube. Cubre Azure SDK, API, almacenamiento, computación y seguridad.',
    prerequisites: 'Experiencia en programación con al menos un lenguaje soportado por Azure. 1+ años de experiencia de desarrollo.',
    examFormat: 'Examen de opción múltiple y múltiple respuesta, 40-60 preguntas, 100 minutos.',
    languages: 'Español, Inglés, y muchos más',
    studyTimeEstimate: '60-80 horas',
    officialLink: 'https://learn.microsoft.com/en-us/credentials/browse/?credential_type=certification',
  },
  {
    id: 'az-500',
    name: 'AZ-500 Azure Security Engineer',
    provider: 'Azure',
    branch: 'Ciberseguridad',
    level: 'Associate',
    price: 165,
    isFree: false,
    questions: '40-60',
    duration: '100 min',
    passingScore: '700/1000',
    validity: '1 año',
    difficulty: 3,
    description: 'Valida habilidades para implementar soluciones de seguridad en Azure. Cubre identidad, operaciones de seguridad, protección de datos y redes.',
    prerequisites: 'Experiencia en seguridad IT. Conocimiento de servicios de seguridad de Azure.',
    examFormat: 'Examen de opción múltiple y múltiple respuesta, 40-60 preguntas, 100 minutos.',
    languages: 'Español, Inglés, y muchos más',
    studyTimeEstimate: '60-80 horas',
    officialLink: 'https://learn.microsoft.com/en-us/credentials/browse/?credential_type=certification',
  },
  {
    id: 'az-dp-203',
    name: 'DP-203 Azure Data Engineer',
    provider: 'Azure',
    branch: 'Cloud',
    level: 'Associate',
    price: 165,
    isFree: false,
    questions: '40-60',
    duration: '100 min',
    passingScore: '700/1000',
    validity: '1 año',
    difficulty: 3,
    description: 'Valida habilidades para integrar, transformar y consolidar datos de diversas fuentes usando Azure Data Factory, Synapse Analytics y más.',
    prerequisites: 'Experiencia con servicios de datos de Azure y lenguajes de programación como SQL, Python, Scala.',
    examFormat: 'Examen de opción múltiple y múltiple respuesta, 40-60 preguntas, 100 minutos.',
    languages: 'Español, Inglés, y muchos más',
    studyTimeEstimate: '60-80 horas',
    officialLink: 'https://learn.microsoft.com/en-us/credentials/browse/?credential_type=certification',
  },
  {
    id: 'az-ai-102',
    name: 'AI-102 Azure AI Engineer',
    provider: 'Azure',
    branch: 'IA/ML',
    level: 'Associate',
    price: 165,
    isFree: false,
    questions: '40-60',
    duration: '100 min',
    passingScore: '700/1000',
    validity: '1 año',
    difficulty: 3,
    description: 'Valida habilidades para crear, implementar y monitorear soluciones de IA en Azure. Cubre Cognitive Services, Azure OpenAI, Bots y más.',
    prerequisites: 'Experiencia con servicios de IA/ML y desarrollo de software.',
    examFormat: 'Examen de opción múltiple y múltiple respuesta, 40-60 preguntas, 100 minutos.',
    languages: 'Español, Inglés, y muchos más',
    studyTimeEstimate: '60-80 horas',
    officialLink: 'https://learn.microsoft.com/en-us/credentials/browse/?credential_type=certification',
  },
  {
    id: 'az-305',
    name: 'AZ-305 Solutions Architect Expert',
    provider: 'Azure',
    branch: 'Cloud',
    level: 'Professional',
    price: 165,
    isFree: false,
    questions: '40-60',
    duration: '100 min',
    passingScore: '700/1000',
    validity: '1 año',
    difficulty: 5,
    description: 'Certificación Expert para arquitectos de soluciones. Cubre diseño de soluciones de identidad, gobernanza, infraestructura y más en Azure.',
    prerequisites: 'Requiere haber aprobado AZ-104 o tener experiencia equivalente.',
    examFormat: 'Examen de opción múltiple y múltiple respuesta, 40-60 preguntas, 100 minutos.',
    languages: 'Español, Inglés, y muchos más',
    studyTimeEstimate: '100-140 horas',
    officialLink: 'https://learn.microsoft.com/en-us/credentials/browse/?credential_type=certification',
  },
  {
    id: 'az-400',
    name: 'AZ-400 DevOps Engineer Expert',
    provider: 'Azure',
    branch: 'DevOps',
    level: 'Professional',
    price: 165,
    isFree: false,
    questions: '40-60',
    duration: '100 min',
    passingScore: '700/1000',
    validity: '1 año',
    difficulty: 5,
    description: 'Certificación Expert para ingenieros DevOps. Cubre estrategias de desarrollo, CI/CD, gestión de infraestructura como código y monitoreo.',
    prerequisites: 'Requiere haber aprobado AZ-104 o AZ-204 o tener experiencia equivalente.',
    examFormat: 'Examen de opción múltiple y múltiple respuesta, 40-60 preguntas, 100 minutos.',
    languages: 'Español, Inglés, y muchos más',
    studyTimeEstimate: '100-140 horas',
    officialLink: 'https://learn.microsoft.com/en-us/credentials/browse/?credential_type=certification',
  },
  {
    id: 'az-pl-300',
    name: 'PL-300 Power BI Analyst',
    provider: 'Azure',
    branch: 'Bases de Datos',
    level: 'Associate',
    price: 165,
    isFree: false,
    questions: '40-60',
    duration: '100 min',
    passingScore: '700/1000',
    validity: '1 año',
    difficulty: 2,
    description: 'Valida habilidades para diseñar y construir modelos de datos, crear visualizaciones y analizar datos usando Power BI.',
    prerequisites: 'Experiencia con Power BI y análisis de datos.',
    examFormat: 'Examen de opción múltiple y múltiple respuesta, 40-60 preguntas, 100 minutos.',
    languages: 'Español, Inglés, y muchos más',
    studyTimeEstimate: '40-60 horas',
    officialLink: 'https://learn.microsoft.com/en-us/credentials/browse/?credential_type=certification',
  },
  {
    id: 'gcp-cdl',
    name: 'Cloud Digital Leader',
    provider: 'Google Cloud',
    branch: 'Cloud',
    level: 'Fundamentals',
    price: 99,
    isFree: false,
    questions: '50-60',
    duration: '90 min',
    passingScore: '70%',
    validity: '3 años',
    difficulty: 2,
    description: 'Certificación de entrada que valida conocimientos fundamentales sobre Google Cloud y su impacto en los negocios.',
    prerequisites: 'No se requieren prerrequisitos técnicos.',
    examFormat: 'Examen de opción múltiple, 50-60 preguntas, 90 minutos.',
    languages: 'Inglés, Español, y muchos más',
    studyTimeEstimate: '25-35 horas',
    officialLink: 'https://cloud.google.com/learn/certification',
  },
  {
    id: 'gcp-ace',
    name: 'Associate Cloud Engineer',
    provider: 'Google Cloud',
    branch: 'Cloud',
    level: 'Associate',
    price: 125,
    isFree: false,
    questions: '50-60',
    duration: '120 min',
    passingScore: '70%',
    validity: '3 años',
    difficulty: 3,
    description: 'Valida habilidades para deployar aplicaciones, monitorear operaciones y gestionar soluciones en Google Cloud.',
    prerequisites: 'Experiencia práctica con Google Cloud de 6+ meses. Conocimiento de GCP Core Services.',
    examFormat: 'Examen de opción múltiple, 50-60 preguntas, 120 minutos.',
    languages: 'Inglés, Español, y muchos más',
    studyTimeEstimate: '60-80 horas',
    officialLink: 'https://cloud.google.com/learn/certification',
  },
  {
    id: 'gcp-pca',
    name: 'Professional Cloud Architect',
    provider: 'Google Cloud',
    branch: 'Cloud',
    level: 'Professional',
    price: 200,
    isFree: false,
    questions: '50-60',
    duration: '120 min',
    passingScore: '70%',
    validity: '3 años',
    difficulty: 5,
    description: 'Certificación avanzada que valida la capacidad de diseñar, desarrollar y gestionar soluciones robustas, de alta disponibilidad y rentables en Google Cloud.',
    prerequisites: '3+ años de experiencia en la industria, 1+ años diseñando y gestionando soluciones en GCP.',
    examFormat: 'Examen de opción múltiple y casos de estudio, 50-60 preguntas, 120 minutos.',
    languages: 'Inglés, Español, y muchos más',
    studyTimeEstimate: '120-160 horas',
    officialLink: 'https://cloud.google.com/learn/certification',
  },
  {
    id: 'gcp-pde',
    name: 'Professional Data Engineer',
    provider: 'Google Cloud',
    branch: 'Cloud',
    level: 'Professional',
    price: 200,
    isFree: false,
    questions: '50-60',
    duration: '120 min',
    passingScore: '70%',
    validity: '3 años',
    difficulty: 5,
    description: 'Valida habilidades para diseñar, construir, operar y monitorear sistemas de procesamiento de datos en Google Cloud.',
    prerequisites: '3+ años de experiencia en la industria, 1+ años con BigQuery y servicios de datos de GCP.',
    examFormat: 'Examen de opción múltiple y casos de estudio, 50-60 preguntas, 120 minutos.',
    languages: 'Inglés, Español, y muchos más',
    studyTimeEstimate: '120-160 horas',
    officialLink: 'https://cloud.google.com/learn/certification',
  },
  {
    id: 'gcp-pcd',
    name: 'Professional Cloud Developer',
    provider: 'Google Cloud',
    branch: 'Programación',
    level: 'Professional',
    price: 200,
    isFree: false,
    questions: '50-60',
    duration: '120 min',
    passingScore: '70%',
    validity: '3 años',
    difficulty: 5,
    description: 'Valida habilidades para desarrollar, depurar, implementar y escalar aplicaciones de alta calidad en Google Cloud.',
    prerequisites: '3+ años de experiencia en la industria, incluyendo 1+ años con GCP.',
    examFormat: 'Examen de opción múltiple y casos de estudio, 50-60 preguntas, 120 minutos.',
    languages: 'Inglés, Español',
    studyTimeEstimate: '100-140 horas',
    officialLink: 'https://cloud.google.com/learn/certification',
  },
  {
    id: 'gcp-pcde',
    name: 'Professional Cloud DevOps Engineer',
    provider: 'Google Cloud',
    branch: 'DevOps',
    level: 'Professional',
    price: 200,
    isFree: false,
    questions: '50-60',
    duration: '120 min',
    passingScore: '70%',
    validity: '3 años',
    difficulty: 5,
    description: 'Valida habilidades para desarrollar soluciones de entrega continua, monitoreo y gestión de infraestructura en Google Cloud.',
    prerequisites: '3+ años de experiencia en la industria, 1+ años gestionando sistemas en GCP.',
    examFormat: 'Examen de opción múltiple y casos de estudio, 50-60 preguntas, 120 minutos.',
    languages: 'Inglés, Español',
    studyTimeEstimate: '100-140 horas',
    officialLink: 'https://cloud.google.com/learn/certification',
  },
  {
    id: 'gcp-pcse',
    name: 'Professional Cloud Security Engineer',
    provider: 'Google Cloud',
    branch: 'Ciberseguridad',
    level: 'Professional',
    price: 200,
    isFree: false,
    questions: '50-60',
    duration: '120 min',
    passingScore: '70%',
    validity: '3 años',
    difficulty: 5,
    description: 'Valida habilidades para diseñar e implementar soluciones de seguridad en Google Cloud. Cubre identidad, redes, datos y cumplimiento.',
    prerequisites: '3+ años de experiencia en la industria, 1+ años con seguridad en GCP.',
    examFormat: 'Examen de opción múltiple y casos de estudio, 50-60 preguntas, 120 minutos.',
    languages: 'Inglés, Español',
    studyTimeEstimate: '100-140 horas',
    officialLink: 'https://cloud.google.com/learn/certification',
  },
  {
    id: 'gcp-pmle',
    name: 'Professional Machine Learning Engineer',
    provider: 'Google Cloud',
    branch: 'IA/ML',
    level: 'Professional',
    price: 200,
    isFree: false,
    questions: '50-60',
    duration: '120 min',
    passingScore: '70%',
    validity: '3 años',
    difficulty: 5,
    description: 'Valida habilidades para diseñar, construir y producir soluciones de ML en Google Cloud. Cubre TensorFlow, Vertex AI, AutoML y más.',
    prerequisites: '3+ años de experiencia en la industria, incluyendo 1+ años con ML en GCP.',
    examFormat: 'Examen de opción múltiple y casos de estudio, 50-60 preguntas, 120 minutos.',
    languages: 'Inglés, Español',
    studyTimeEstimate: '120-160 horas',
    officialLink: 'https://cloud.google.com/learn/certification',
  },
  {
    id: 'oci-foundations',
    name: 'OCI Foundations Associate',
    provider: 'Oracle',
    branch: 'Cloud',
    level: 'Fundamentals',
    price: 0,
    isFree: true,
    questions: '50',
    duration: '60 min',
    passingScore: '65%',
    validity: '18 meses',
    difficulty: 1,
    description: 'Certificación gratuita que valida conocimientos básicos de Oracle Cloud Infrastructure. Cubre conceptos de nube y servicios principales de OCI.',
    prerequisites: 'No se requieren prerrequisitos.',
    examFormat: 'Examen de opción múltiple, 50 preguntas, 60 minutos.',
    languages: 'Inglés, Español, y muchos más',
    studyTimeEstimate: '15-25 horas',
    officialLink: 'https://www.oracle.com/education/certification/',
  },
  {
    id: 'oci-ai-foundations',
    name: 'OCI AI Foundations Associate',
    provider: 'Oracle',
    branch: 'IA/ML',
    level: 'Fundamentals',
    price: 0,
    isFree: true,
    questions: '50',
    duration: '60 min',
    passingScore: '65%',
    validity: '18 meses',
    difficulty: 1,
    description: 'Certificación gratuita que valida conceptos fundamentales de IA aplicados a Oracle Cloud Infrastructure.',
    prerequisites: 'No se requieren prerrequisitos.',
    examFormat: 'Examen de opción múltiple, 50 preguntas, 60 minutos.',
    languages: 'Inglés, Español, y muchos más',
    studyTimeEstimate: '15-20 horas',
    officialLink: 'https://www.oracle.com/education/certification/',
  },
  {
    id: 'oci-architect-associate',
    name: 'OCI Architect Associate',
    provider: 'Oracle',
    branch: 'Cloud',
    level: 'Associate',
    price: 245,
    isFree: false,
    questions: '50',
    duration: '60 min',
    passingScore: '65%',
    validity: '18 meses',
    difficulty: 3,
    description: 'Valida habilidades para diseñar soluciones en Oracle Cloud Infrastructure. Cubre redes, computación, almacenamiento, seguridad y más.',
    prerequisites: 'Conocimiento de OCI y experiencia con servicios de cloud computing.',
    examFormat: 'Examen de opción múltiple, 50 preguntas, 60 minutos.',
    languages: 'Inglés, Español, y muchos más',
    studyTimeEstimate: '60-80 horas',
    officialLink: 'https://www.oracle.com/education/certification/',
  },
  {
    id: 'oci-architect-professional',
    name: 'OCI Architect Professional',
    provider: 'Oracle',
    branch: 'Cloud',
    level: 'Professional',
    price: 245,
    isFree: false,
    questions: '50',
    duration: '90 min',
    passingScore: '65%',
    validity: '18 meses',
    difficulty: 5,
    description: 'Certificación avanzada para arquitectos de soluciones Oracle Cloud. Cubre diseños complejos, migración y optimización enterprise.',
    prerequisites: 'Certificación OCI Architect Associate y 2+ años de experiencia con OCI.',
    examFormat: 'Examen de opción múltiple, 50 preguntas, 90 minutos.',
    languages: 'Inglés, Español, y muchos más',
    studyTimeEstimate: '100-140 horas',
    officialLink: 'https://www.oracle.com/education/certification/',
  },
  {
    id: 'oci-networking',
    name: 'OCI Networking Professional',
    provider: 'Oracle',
    branch: 'Redes',
    level: 'Professional',
    price: 245,
    isFree: false,
    questions: '50',
    duration: '90 min',
    passingScore: '65%',
    validity: '18 meses',
    difficulty: 5,
    description: 'Valida habilidades avanzadas de diseño e implementación de redes en OCI. Cubre VCN, interconexión, balanceo de carga y más.',
    prerequisites: 'Experiencia avanzada con redes y servicios de OCI.',
    examFormat: 'Examen de opción múltiple, 50 preguntas, 90 minutos.',
    languages: 'Inglés, Español',
    studyTimeEstimate: '80-120 horas',
    officialLink: 'https://www.oracle.com/education/certification/',
  },
  {
    id: 'oci-security',
    name: 'OCI Security Professional',
    provider: 'Oracle',
    branch: 'Ciberseguridad',
    level: 'Professional',
    price: 245,
    isFree: false,
    questions: '50',
    duration: '90 min',
    passingScore: '65%',
    validity: '18 meses',
    difficulty: 5,
    description: 'Valida habilidades avanzadas de seguridad en OCI. Cubre identidad, acceso, encriptación, seguridad de redes y cumplimiento.',
    prerequisites: 'Experiencia avanzada en seguridad con servicios de OCI.',
    examFormat: 'Examen de opción múltiple, 50 preguntas, 90 minutos.',
    languages: 'Inglés, Español',
    studyTimeEstimate: '80-120 horas',
    officialLink: 'https://www.oracle.com/education/certification/',
  },
  {
    id: 'oci-genai',
    name: 'OCI Generative AI Professional',
    provider: 'Oracle',
    branch: 'IA/ML',
    level: 'Professional',
    price: 245,
    isFree: false,
    questions: '50',
    duration: '90 min',
    passingScore: '65%',
    validity: '18 meses',
    difficulty: 4,
    description: 'Valida habilidades para implementar soluciones de IA Generativa en OCI. Cubre LLMs, RAG, fine-tuning y OCI Generative AI Service.',
    prerequisites: 'Conocimiento de OCI y conceptos de IA/ML.',
    examFormat: 'Examen de opción múltiple, 50 preguntas, 90 minutos.',
    languages: 'Inglés, Español',
    studyTimeEstimate: '60-80 horas',
    officialLink: 'https://www.oracle.com/education/certification/',
  },
  {
    id: 'cka',
    name: 'CKA Certified Kubernetes Administrator',
    provider: 'Kubernetes',
    branch: 'DevOps',
    level: 'Associate',
    price: 445,
    isFree: false,
    questions: 'performance-based',
    duration: '2 hr',
    passingScore: '66%',
    validity: '2 años',
    difficulty: 4,
    description: 'Certificación que valida habilidades prácticas para administrar clústeres Kubernetes. Examen performance-based en terminal real.',
    prerequisites: 'Experiencia con Kubernetes en producción. Conocimiento de CNCF landscape.',
    examFormat: 'Examen hands-on en terminal de Kubernetes, 15-20 problemas prácticos, 2 horas.',
    languages: 'Inglés',
    studyTimeEstimate: '80-120 horas',
    officialLink: 'https://training.linuxfoundation.org/certification/',
  },
  {
    id: 'ckad',
    name: 'CKAD Certified Kubernetes Application Developer',
    provider: 'Kubernetes',
    branch: 'DevOps',
    level: 'Associate',
    price: 445,
    isFree: false,
    questions: 'performance-based',
    duration: '2 hr',
    passingScore: '66%',
    validity: '2 años',
    difficulty: 4,
    description: 'Certificación que valida habilidades prácticas para diseñar, construir y desplegar aplicaciones en Kubernetes.',
    prerequisites: 'Experiencia desarrollando y desplegando aplicaciones en Kubernetes.',
    examFormat: 'Examen hands-on en terminal de Kubernetes, 15-20 problemas prácticos, 2 horas.',
    languages: 'Inglés',
    studyTimeEstimate: '60-80 horas',
    officialLink: 'https://training.linuxfoundation.org/certification/',
  },
  {
    id: 'cks',
    name: 'CKS Certified Kubernetes Security Specialist',
    provider: 'Kubernetes',
    branch: 'Ciberseguridad',
    level: 'Specialty',
    price: 445,
    isFree: false,
    questions: 'performance-based',
    duration: '2 hr',
    passingScore: '67%',
    validity: '2 años',
    difficulty: 5,
    description: 'Certificación que valida habilidades avanzadas de seguridad en Kubernetes. Cubre cluster hardening, políticas de red, y más.',
    prerequisites: 'Certificación CKA y experiencia con seguridad en Kubernetes.',
    examFormat: 'Examen hands-on en terminal de Kubernetes, problemas de seguridad, 2 horas.',
    languages: 'Inglés',
    studyTimeEstimate: '80-120 horas',
    officialLink: 'https://training.linuxfoundation.org/certification/',
  },
  {
    id: 'dca',
    name: 'DCA Docker Certified Associate',
    provider: 'Docker',
    branch: 'DevOps',
    level: 'Associate',
    price: 195,
    isFree: false,
    questions: '55',
    duration: '90 min',
    passingScore: '55%',
    validity: '2 años',
    difficulty: 3,
    description: 'Certificación que valida habilidades en orquestación de contenedores Docker, imágenes, networking, seguridad y más.',
    prerequisites: 'Experiencia práctica con Docker en producción.',
    examFormat: 'Examen de opción múltiple y opción múltiple avanzada, 55 preguntas, 90 minutos.',
    languages: 'Inglés',
    studyTimeEstimate: '40-60 horas',
    officialLink: 'https://training.mirantis.com/certification/dca-certification-exam/',
  },
  {
    id: 'terraform',
    name: 'Terraform Associate',
    provider: 'HashiCorp',
    branch: 'DevOps',
    level: 'Associate',
    price: 70.50,
    isFree: false,
    questions: '57',
    duration: '60 min',
    passingScore: '70%',
    validity: '18 meses',
    difficulty: 3,
    description: 'Certificación que valida conocimientos fundamentales de HashiCorp Terraform para infraestructura como código.',
    prerequisites: 'Conocimiento básico de Terraform y administración de infraestructura.',
    examFormat: 'Examen de opción múltiple, 57 preguntas, 60 minutos.',
    languages: 'Inglés, Español, y muchos más',
    studyTimeEstimate: '30-50 horas',
    officialLink: 'https://www.hashicorp.com/en/certification',
  },
  {
    id: 'ccna',
    name: 'CCNA 200-301',
    provider: 'Cisco',
    branch: 'Redes',
    level: 'Associate',
    price: 330,
    isFree: false,
    questions: '100-120',
    duration: '120 min',
    passingScore: '825/1000',
    validity: '3 años',
    difficulty: 3,
    description: 'Certificación de redes de Cisco que valida habilidades de instalación, configuración y administración de redes.',
    prerequisites: 'Conocimiento básico de redes. Se recomienda CCNA prep course o experiencia equivalente.',
    examFormat: 'Examen de opción múltiple, drag-and-drop, simulación, 100-120 preguntas, 120 minutos.',
    languages: 'Inglés, Español, y muchos más',
    studyTimeEstimate: '100-200 horas',
    officialLink: 'https://www.cisco.com/site/us/en/learn/training-certifications/index.html',
  },
  {
    id: 'comptia-a-plus-core1',
    name: 'CompTIA A+ Core 1 (220-1101)',
    provider: 'CompTIA',
    branch: 'Redes',
    level: 'Fundamentals',
    price: 349,
    isFree: false,
    questions: '90',
    duration: '90 min',
    passingScore: '675/900',
    validity: '3 años',
    difficulty: 2,
    description: 'Primera parte de la certificación A+. Cubre hardware, redes móviles, dispositivos IoT, hardware y redes.',
    prerequisites: 'No se requieren prerrequisitos formales, aunque se recomienda experiencia práctica.',
    examFormat: 'Examen de opción múltiple y preguntas de desempeño, 90 preguntas, 90 minutos.',
    languages: 'Inglés, Español, y muchos más',
    studyTimeEstimate: '80-120 horas',
    officialLink: 'https://www.comptia.org/certifications',
  },
  {
    id: 'comptia-a-plus-core2',
    name: 'CompTIA A+ Core 2 (220-1102)',
    provider: 'CompTIA',
    branch: 'Redes',
    level: 'Fundamentals',
    price: 349,
    isFree: false,
    questions: '90',
    duration: '90 min',
    passingScore: '700/900',
    validity: '3 años',
    difficulty: 2,
    description: 'Segunda parte de la certificación A+. Cubre sistemas operativos, seguridad, software operativo y procedimientos de soporte.',
    prerequisites: 'Se recomienda haber completado A+ Core 1.',
    examFormat: 'Examen de opción múltiple y preguntas de desempeño, 90 preguntas, 90 minutos.',
    languages: 'Inglés, Español, y muchos más',
    studyTimeEstimate: '80-120 horas',
    officialLink: 'https://www.comptia.org/certifications',
  },
  {
    id: 'comptia-network-plus',
    name: 'CompTIA Network+ (N10-009)',
    provider: 'CompTIA',
    branch: 'Redes',
    level: 'Associate',
    price: 370,
    isFree: false,
    questions: '90',
    duration: '90 min',
    passingScore: '720/900',
    validity: '3 años',
    difficulty: 3,
    description: 'Certificación de redes que valida habilidades de configuración, gestión y solución de problemas de redes.',
    prerequisites: 'CompTIA A+ y 9-12 meses de experiencia en redes.',
    examFormat: 'Examen de opción múltiple y preguntas de desempeño, 90 preguntas, 90 minutos.',
    languages: 'Inglés, Español, y muchos más',
    studyTimeEstimate: '80-120 horas',
    officialLink: 'https://www.comptia.org/certifications',
  },
  {
    id: 'comptia-security-plus',
    name: 'CompTIA Security+ (SY0-701)',
    provider: 'CompTIA',
    branch: 'Ciberseguridad',
    level: 'Associate',
    price: 404,
    isFree: false,
    questions: '90',
    duration: '90 min',
    passingScore: '750/900',
    validity: '3 años',
    difficulty: 3,
    description: 'Certificación de seguridad que valida habilidades de seguridad en operaciones de TI. Cubre amenazas, arquitectura, gestión de riesgos y más.',
    prerequisites: 'CompTIA Network+ y 2+ años de experiencia en seguridad IT.',
    examFormat: 'Examen de opción múltiple y preguntas de desempeño, 90 preguntas, 90 minutos.',
    languages: 'Inglés, Español, y muchos más',
    studyTimeEstimate: '80-120 horas',
    officialLink: 'https://www.comptia.org/certifications',
  },
  {
    id: 'rhcsa',
    name: 'RHCSA EX200',
    provider: 'Red Hat',
    branch: 'DevOps',
    level: 'Associate',
    price: 400,
    isFree: false,
    questions: 'performance-based',
    duration: '2.5 hr',
    passingScore: '210/300',
    validity: '3 años',
    difficulty: 4,
    description: 'Certificación de administración de sistemas Linux Red Hat. Examen hands-on que valida habilidades prácticas de administración.',
    prerequisites: 'Experiencia administrando sistemas Linux. Conocimiento de administración de usuario, permisos, servicios y más.',
    examFormat: 'Examen hands-on en laboratorio virtual, tareas prácticas de administración, 2.5 horas.',
    languages: 'Inglés',
    studyTimeEstimate: '80-120 horas',
    officialLink: 'https://www.redhat.com/en/services/training-and-certification',
  },
  {
    id: 'mongodb-associate',
    name: 'MongoDB Associate Developer',
    provider: 'MongoDB',
    branch: 'Bases de Datos',
    level: 'Associate',
    price: 0,
    isFree: true,
    questions: '60',
    duration: '90 min',
    passingScore: '65%',
    validity: '2 años',
    difficulty: 3,
    description: 'Certificación gratuita que valida habilidades de desarrollo con MongoDB. Cubre consultas, agregaciones, modelos de datos y más.',
    prerequisites: 'Experiencia con MongoDB y desarrollo de aplicaciones.',
    examFormat: 'Examen de opción múltiple, 60 preguntas, 90 minutos.',
    languages: 'Inglés',
    studyTimeEstimate: '30-50 horas',
    officialLink: 'https://www.mongodb.com/developer/products/atlas/certifications/',
  },
];

function DifficultyStars({ level }) {
  return (
    <HStack spacing={0}>
      {[1, 2, 3, 4, 5].map((i) => (
        <FiStar key={i} size={12} color={i <= level ? '#ECC94B' : '#CBD5E0'} fill={i <= level ? '#ECC94B' : 'transparent'} />
      ))}
    </HStack>
  );
}

function InputGroup({ leftElement, placeholder, value, onChange, ...props }) {
  return (
    <Box position="relative" {...props}>
      <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400" zIndex={1}>
        {leftElement}
      </Box>
      <Input pl={10} placeholder={placeholder} value={value} onChange={onChange} />
    </Box>
  );
}

function CatalogoTab() {
  const store = useStore();
  const { formacionCerts, addFormacionCert } = store;
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('Todos');
  const [levelFilter, setLevelFilter] = useState('Todos');
  const [providerFilter, setProviderFilter] = useState('Todos');
  const [expandedCert, setExpandedCert] = useState(null);
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const rowBg = useColorModeValue('gray.50', 'gray.700');

  const providers = useMemo(() => {
    const p = new Set(CERTIFICATIONS.map((c) => c.provider));
    return ['Todos', ...Array.from(p).sort()];
  }, []);

  const filteredCerts = useMemo(() => {
    return CERTIFICATIONS.filter((c) => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.provider.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
      const matchBranch = branchFilter === 'Todos' || c.branch === branchFilter;
      const matchLevel = levelFilter === 'Todos' || c.level === levelFilter;
      const matchProvider = providerFilter === 'Todos' || c.provider === providerFilter;
      return matchSearch && matchBranch && matchLevel && matchProvider;
    });
  }, [search, branchFilter, levelFilter, providerFilter]);

  const groupedByProvider = useMemo(() => {
    const groups = {};
    filteredCerts.forEach((c) => {
      if (!groups[c.provider]) groups[c.provider] = [];
      groups[c.provider].push(c);
    });
    return groups;
  }, [filteredCerts]);

  const addCert = (cert) => {
    const exists = formacionCerts.find((uc) => uc.certId === cert.id);
    if (exists) {
      toast({ title: 'Ya está en tus certificaciones', status: 'warning', duration: 2000 });
      return;
    }
    addFormacionCert({
      certId: cert.id,
      status: 'planeada',
      targetDate: '',
      hoursStudied: 0,
      notes: '',
      examPassed: false,
      examScore: '',
    });
    toast({ title: 'Certificación agregada', description: cert.name, status: 'success', duration: 2000 });
  };

  return (
    <VStack spacing={4} align="stretch">
      <Flex gap={3} wrap="wrap">
        <InputGroup leftElement={<FiSearch />} placeholder="Buscar certificación..." value={search} onChange={(e) => setSearch(e.target.value)} flex={1} minW="200px" />
        <Select w="180px" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
          {branchOptions.map((b) => <option key={b} value={b}>{b}</option>)}
        </Select>
        <Select w="180px" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
          {levelOptions.map((l) => <option key={l} value={l}>{l}</option>)}
        </Select>
        <Select w="180px" value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)}>
          {providers.map((p) => <option key={p} value={p}>{p}</option>)}
        </Select>
      </Flex>

      <Text fontSize="sm" color="gray.500">{filteredCerts.length} certificaciones encontradas</Text>

      {Object.entries(groupedByProvider).map(([provider, certs]) => (
        <Box key={provider}>
          <HStack mb={3}>
            <Badge colorScheme={providerColors[provider] || 'gray'} fontSize="md" px={3} py={1} borderRadius="full">
              <FiAward style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              {provider}
            </Badge>
            <Text fontSize="sm" color="gray.500">({certs.length})</Text>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {certs.map((cert) => {
              const isExpanded = expandedCert === cert.id;
              const alreadyAdded = formacionCerts.some((uc) => uc.certId === cert.id);
              return (
                <Card key={cert.id} bg={bg} border="1px solid" borderColor={borderColor} borderRadius="xl" overflow="hidden">
                  <CardBody p={4}>
                    <VStack align="stretch" spacing={3}>
                      <Flex justify="space-between" align="start">
                        <Badge colorScheme={providerColors[cert.provider] || 'gray'} fontSize="xs">{cert.provider}</Badge>
                        <Badge colorScheme={levelColors[cert.level] || 'gray'} fontSize="xs">{cert.level}</Badge>
                      </Flex>

                      <Heading size="sm" lineHeight="short">{cert.name}</Heading>

                      <HStack>
                        <Badge colorScheme="gray" fontSize="xs">{cert.branch}</Badge>
                        <Badge colorScheme={cert.isFree ? 'green' : 'yellow'} fontSize="xs">
                          {cert.isFree ? 'Gratis' : `$${cert.price}`}
                        </Badge>
                      </HStack>

                      <SimpleGrid columns={2} spacing={2} fontSize="xs" color="gray.500">
                        <HStack><FiClock size={12} /><Text>{cert.duration}</Text></HStack>
                        <HStack><FiBookOpen size={12} /><Text>{cert.questions} preguntas</Text></HStack>
                        <HStack><FiTarget size={12} /><Text>{cert.validity}</Text></HStack>
                        <HStack><FiAward size={12} /><DifficultyStars level={cert.difficulty} /></HStack>
                      </SimpleGrid>

                      <Button size="xs" variant="ghost" rightIcon={<FiChevronDown style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />} onClick={() => setExpandedCert(isExpanded ? null : cert.id)}>
                        Ver detalles
                      </Button>

                      <Collapse in={isExpanded} animateOpacity>
                        <VStack align="stretch" spacing={2} pt={2} borderTop="1px solid" borderColor={borderColor}>
                          <Text fontSize="xs"><Text as="span" fontWeight="bold">Descripción:</Text> {cert.description}</Text>
                          <Text fontSize="xs"><Text as="span" fontWeight="bold">Prerrequisitos:</Text> {cert.prerequisites}</Text>
                          <Text fontSize="xs"><Text as="span" fontWeight="bold">Formato:</Text> {cert.examFormat}</Text>
                          <Text fontSize="xs"><Text as="span" fontWeight="bold">Puntuación mínima:</Text> {cert.passingScore}</Text>
                          <Text fontSize="xs"><Text as="span" fontWeight="bold">Idiomas:</Text> {cert.languages}</Text>
                          <Text fontSize="xs"><Text as="span" fontWeight="bold">Tiempo de estudio estimado:</Text> {cert.studyTimeEstimate}</Text>
                          <Button as="a" href={cert.officialLink} target="_blank" size="xs" variant="link" color="blue.400" rightIcon={<FiExternalLink />} w="fit-content">
                            Sitio oficial
                          </Button>
                        </VStack>
                      </Collapse>

                      <Button size="sm" colorScheme={alreadyAdded ? 'gray' : 'teal'} leftIcon={alreadyAdded ? <FiCheck /> : <FiPlus />} onClick={() => addCert(cert)} isDisabled={alreadyAdded}>
                        {alreadyAdded ? 'Agregada' : 'Agregar a mis certificaciones'}
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>
        </Box>
      ))}
    </VStack>
  );
}

function MisRutasTab() {
  const store = useStore();
  const { formacionPlans, addFormacionPlan, updateFormacionPlan, removeFormacionPlan } = store;
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({ name: '', description: '', certIds: [] });
  const [certSearch, setCertSearch] = useState('');
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const rowBg = useColorModeValue('gray.50', 'gray.700');

  const openNew = () => { setEditingPlan(null); setPlanForm({ name: '', description: '', certIds: [] }); onOpen(); };
  const openEdit = (plan) => { setEditingPlan(plan); setPlanForm({ name: plan.name, description: plan.description, certIds: [...plan.certIds] }); onOpen(); };

  const savePlan = () => {
    if (!planForm.name) return;
    if (editingPlan) {
      updateFormacionPlan(editingPlan.id, planForm);
      toast({ title: 'Plan actualizado', status: 'success', duration: 2000 });
    } else {
      addFormacionPlan(planForm);
      toast({ title: 'Plan creado', status: 'success', duration: 2000 });
    }
    onClose();
  };

  const addCertToPlan = (certId) => {
    if (!planForm.certIds.includes(certId)) {
      setPlanForm((f) => ({ ...f, certIds: [...f.certIds, certId] }));
    }
  };

  const removeCertFromPlan = (certId) => {
    setPlanForm((f) => ({ ...f, certIds: f.certIds.filter((id) => id !== certId) }));
  };

  const moveCertInPlan = (index, direction) => {
    const newIds = [...planForm.certIds];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newIds.length) return;
    [newIds[index], newIds[newIndex]] = [newIds[newIndex], newIds[index]];
    setPlanForm((f) => ({ ...f, certIds: newIds }));
  };

  const filteredCertsForSearch = useMemo(() => {
    if (!certSearch) return [];
    return CERTIFICATIONS.filter((c) => c.name.toLowerCase().includes(certSearch.toLowerCase()) || c.provider.toLowerCase().includes(certSearch.toLowerCase())).slice(0, 10);
  }, [certSearch]);

  const getPlanStats = (certIds) => {
    let totalCost = 0;
    let totalHoursMin = 0;
    let totalHoursMax = 0;
    certIds.forEach((cid) => {
      const cert = CERTIFICATIONS.find((c) => c.id === cid);
      if (cert) {
        totalCost += cert.price;
        const match = cert.studyTimeEstimate.match(/(\d+)-?(\d+)?/);
        if (match) {
          totalHoursMin += parseInt(match[1]) || 0;
          totalHoursMax += parseInt(match[2] || match[1]) || 0;
        }
      }
    });
    return { totalCost, totalHoursMin, totalHoursMax };
  };

  return (
    <VStack spacing={4} align="stretch">
      <Flex justify="space-between" align="center">
        <Text fontWeight="bold" fontSize="lg"><FiTarget style={{ display: 'inline', marginRight: 8 }} />Mis Rutas de Aprendizaje</Text>
        <Button leftIcon={<FiPlus />} colorScheme="teal" size="sm" onClick={openNew}>Nuevo Plan</Button>
      </Flex>

      {formacionPlans.length === 0 && (
        <Box p={6} bg={bg} borderRadius="xl" border="1px solid" borderColor={borderColor} textAlign="center">
          <Text color="gray.500">No tienes planes de aprendizaje creados. Crea uno para organizar tus certificaciones.</Text>
        </Box>
      )}

      {formacionPlans.map((plan) => {
        const stats = getPlanStats(plan.certIds);
        return (
          <Card key={plan.id} bg={bg} border="1px solid" borderColor={borderColor} borderRadius="xl">
            <CardBody p={5}>
              <Flex justify="space-between" align="start" mb={3}>
                <Box flex={1}>
                  <Heading size="md">{plan.name}</Heading>
                  {plan.description && <Text fontSize="sm" color="gray.500" mt={1}>{plan.description}</Text>}
                </Box>
                <HStack>
                  <IconButton icon={<FiEdit2 />} size="sm" onClick={() => openEdit(plan)} />
                  <IconButton icon={<FiTrash2 />} size="sm" colorScheme="red" onClick={() => { removeFormacionPlan(plan.id); toast({ title: 'Plan eliminado', status: 'info', duration: 2000 }); }} />
                </HStack>
              </Flex>

              <HStack spacing={4} mb={3} wrap="wrap">
                <Badge colorScheme="green"><FiDollarSign style={{ display: 'inline' }} /> ${stats.totalCost}</Badge>
                <Badge colorScheme="blue"><FiClock style={{ display: 'inline' }} /> {stats.totalHoursMin}-{stats.totalHoursMax}h estimadas</Badge>
                <Badge colorScheme="purple">{plan.certIds.length} certificaciones</Badge>
              </HStack>

              <VStack align="stretch" spacing={2}>
                {plan.certIds.map((certId, index) => {
                  const cert = CERTIFICATIONS.find((c) => c.id === certId);
                  if (!cert) return null;
                  return (
                    <Flex key={certId} p={3} bg={rowBg} borderRadius="md" align="center" gap={3}>
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" w="20px">{index + 1}</Text>
                      <Badge colorScheme={providerColors[cert.provider] || 'gray'} fontSize="xs">{cert.provider}</Badge>
                      <Text fontSize="sm" fontWeight="bold" flex={1}>{cert.name}</Text>
                      <HStack>
                        <IconButton icon={<FiChevronUp />} size="xs" variant="ghost" onClick={() => moveCertInPlan(index, -1)} isDisabled={index === 0} />
                        <IconButton icon={<FiChevronDown />} size="xs" variant="ghost" onClick={() => moveCertInPlan(index, 1)} isDisabled={index === plan.certIds.length - 1} />
                        <IconButton icon={<FiX />} size="xs" variant="ghost" colorScheme="red" onClick={() => {
                          const newIds = plan.certIds.filter((id) => id !== certId);
                          updateFormacionPlan(plan.id, { certIds: newIds });
                        }} />
                      </HStack>
                    </Flex>
                  );
                })}
                {plan.certIds.length === 0 && <Text fontSize="sm" color="gray.400" textAlign="center" py={2}>Sin certificaciones agregadas</Text>}
              </VStack>
            </CardBody>
          </Card>
        );
      })}

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingPlan ? 'Editar Plan' : 'Nuevo Plan de Aprendizaje'}</ModalHeader>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Nombre del plan</FormLabel>
                <Input value={planForm.name} onChange={(e) => setPlanForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: Ruta Cloud AWS" />
              </FormControl>
              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea value={planForm.description} onChange={(e) => setPlanForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe el objetivo de esta ruta..." />
              </FormControl>

              <Box>
                <Text fontWeight="bold" mb={2}>Agregar certificaciones</Text>
                <Input value={certSearch} onChange={(e) => setCertSearch(e.target.value)} placeholder="Buscar certificación..." mb={2} />
                {filteredCertsForSearch.length > 0 && (
                  <VStack align="stretch" spacing={1} maxH="150px" overflowY="auto" mb={3}>
                    {filteredCertsForSearch.map((cert) => (
                      <Flex key={cert.id} p={2} bg={rowBg} borderRadius="md" justify="space-between" align="center">
                        <HStack>
                          <Badge colorScheme={providerColors[cert.provider] || 'gray'} fontSize="xs">{cert.provider}</Badge>
                          <Text fontSize="sm">{cert.name}</Text>
                        </HStack>
                        <Button size="xs" leftIcon={<FiPlus />} onClick={() => { addCertToPlan(cert.id); setCertSearch(''); }} isDisabled={planForm.certIds.includes(cert.id)}>
                          Agregar
                        </Button>
                      </Flex>
                    ))}
                  </VStack>
                )}
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>Certificaciones en el plan ({planForm.certIds.length})</Text>
                <VStack align="stretch" spacing={1} maxH="200px" overflowY="auto">
                  {planForm.certIds.map((certId, index) => {
                    const cert = CERTIFICATIONS.find((c) => c.id === certId);
                    if (!cert) return null;
                    return (
                      <Flex key={certId} p={2} bg={rowBg} borderRadius="md" justify="space-between" align="center">
                        <HStack>
                          <Text fontSize="xs" fontWeight="bold" w="20px">{index + 1}.</Text>
                          <Badge colorScheme={providerColors[cert.provider] || 'gray'} fontSize="xs">{cert.provider}</Badge>
                          <Text fontSize="sm">{cert.name}</Text>
                        </HStack>
                        <HStack>
                          <IconButton icon={<FiChevronUp />} size="xs" variant="ghost" onClick={() => moveCertInPlan(index, -1)} isDisabled={index === 0} />
                          <IconButton icon={<FiChevronDown />} size="xs" variant="ghost" onClick={() => moveCertInPlan(index, 1)} isDisabled={index === planForm.certIds.length - 1} />
                          <IconButton icon={<FiTrash2 />} size="xs" variant="ghost" colorScheme="red" onClick={() => removeCertFromPlan(certId)} />
                        </HStack>
                      </Flex>
                    );
                  })}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="teal" leftIcon={<FiSave />} onClick={savePlan} isDisabled={!planForm.name}>{editingPlan ? 'Guardar' : 'Crear'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}

function MisCertificacionesTab() {
  const store = useStore();
  const { formacionCerts, updateFormacionCert, removeFormacionCert } = store;
  const toast = useToast();
  const [filterStatus, setFilterStatus] = useState('todos');
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const rowBg = useColorModeValue('gray.50', 'gray.700');

  const statusLabels = {
    planeada: 'Planeada',
    en_progreso: 'En Progreso',
    completada: 'Completada',
    vencida: 'Vencida',
  };

  const statusColors = {
    planeada: 'gray',
    en_progreso: 'blue',
    completada: 'green',
    vencida: 'red',
  };

  const stats = useMemo(() => {
    const counts = { planeada: 0, en_progreso: 0, completada: 0, vencida: 0 };
    let totalCost = 0;
    formacionCerts.forEach((uc) => {
      counts[uc.status] = (counts[uc.status] || 0) + 1;
      const cert = CERTIFICATIONS.find((c) => c.id === uc.certId);
      if (cert && uc.status === 'completada') totalCost += cert.price;
    });
    return { counts, totalCost };
  }, [formacionCerts]);

  const filteredCerts = useMemo(() => {
    return formacionCerts.filter((uc) => filterStatus === 'todos' || uc.status === filterStatus);
  }, [formacionCerts, filterStatus]);

  return (
    <VStack spacing={4} align="stretch">
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
        <Box p={4} bg={bg} borderRadius="xl" border="1px solid" borderColor={borderColor}>
          <Stat>
            <StatLabel>Planeadas</StatLabel>
            <StatNumber color="gray.500">{stats.counts.planeada}</StatNumber>
          </Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" border="1px solid" borderColor={borderColor}>
          <Stat>
            <StatLabel>En Progreso</StatLabel>
            <StatNumber color="blue.500">{stats.counts.en_progreso}</StatNumber>
          </Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" border="1px solid" borderColor={borderColor}>
          <Stat>
            <StatLabel>Completadas</StatLabel>
            <StatNumber color="green.500">{stats.counts.completada}</StatNumber>
          </Stat>
        </Box>
        <Box p={4} bg={bg} borderRadius="xl" border="1px solid" borderColor={borderColor}>
          <Stat>
            <StatLabel>Inversión Total</StatLabel>
            <StatNumber color="teal.500">${stats.totalCost}</StatNumber>
            <StatHelpText>certs completadas</StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      <HStack spacing={2}>
        {['todos', 'planeada', 'en_progreso', 'completada', 'vencida'].map((s) => (
          <Button key={s} size="xs" variant={filterStatus === s ? 'solid' : 'ghost'} colorScheme={statusColors[s] || 'gray'} onClick={() => setFilterStatus(s)}>
            {s === 'todos' ? 'Todas' : statusLabels[s]}
          </Button>
        ))}
      </HStack>

      <VStack spacing={3} align="stretch">
        {filteredCerts.length === 0 && <Text color="gray.500" textAlign="center" py={4}>No hay certificaciones {filterStatus !== 'todos' ? `con estado "${statusLabels[filterStatus]}"` : 'agregadas'}</Text>}

        {filteredCerts.map((uc) => {
          const cert = CERTIFICATIONS.find((c) => c.id === uc.certId);
          if (!cert) return null;
          const estimatedHours = (() => {
            const match = cert.studyTimeEstimate.match(/(\d+)-?(\d+)?/);
            if (match) return parseInt(match[2] || match[1]) || 0;
            return 0;
          })();
          const progressPct = estimatedHours > 0 ? Math.min((uc.hoursStudied / estimatedHours) * 100, 100) : 0;

          return (
            <Card key={uc.id} bg={bg} border="1px solid" borderColor={borderColor} borderRadius="xl">
              <CardBody p={4}>
                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between" align="start">
                    <Box flex={1}>
                      <HStack mb={1}>
                        <Badge colorScheme={providerColors[cert.provider] || 'gray'} fontSize="xs">{cert.provider}</Badge>
                        <Badge colorScheme={statusColors[uc.status]} fontSize="xs">{statusLabels[uc.status]}</Badge>
                        <Badge colorScheme={levelColors[cert.level] || 'gray'} fontSize="xs">{cert.level}</Badge>
                      </HStack>
                      <Heading size="sm">{cert.name}</Heading>
                    </Box>
                    <IconButton icon={<FiTrash2 />} size="xs" colorScheme="red" variant="ghost" onClick={() => { removeFormacionCert(uc.id); toast({ title: 'Certificación eliminada', status: 'info', duration: 2000 }); }} />
                  </Flex>

                  <Flex gap={3} wrap="wrap">
                    <FormControl flex={1} minW="150px">
                      <FormLabel fontSize="xs">Fecha objetivo</FormLabel>
                      <Input type="date" size="sm" value={uc.targetDate} onChange={(e) => updateFormacionCert(uc.id, { targetDate: e.target.value })} />
                    </FormControl>

                    <FormControl flex={1} minW="150px">
                      <FormLabel fontSize="xs">Horas estudiadas</FormLabel>
                      <Input type="number" size="sm" value={uc.hoursStudied} onChange={(e) => updateFormacionCert(uc.id, { hoursStudied: parseFloat(e.target.value) || 0 })} />
                    </FormControl>
                  </Flex>

                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="xs" color="gray.500">Progreso de estudio</Text>
                      <Text fontSize="xs" color="gray.500">{uc.hoursStudied}h / {estimatedHours}h ({Math.round(progressPct)}%)</Text>
                    </Flex>
                    <Progress value={progressPct} size="sm" colorScheme="teal" borderRadius="full" />
                  </Box>

                  <FormControl>
                    <FormLabel fontSize="xs">Notas</FormLabel>
                    <Textarea size="sm" value={uc.notes} onChange={(e) => updateFormacionCert(uc.id, { notes: e.target.value })} placeholder="Añade notas de estudio..." rows={2} />
                  </FormControl>

                  {uc.status === 'completada' && (
                    <Flex gap={3} wrap="wrap" p={3} bg={rowBg} borderRadius="md">
                      <Checkbox isChecked={uc.examPassed} onChange={(e) => updateFormacionCert(uc.id, { examPassed: e.target.checked })}>
                        <Text fontSize="sm">Examen aprobado</Text>
                      </Checkbox>
                      <FormControl flex={1} minW="120px">
                        <Input size="sm" placeholder="Puntuación" value={uc.examScore} onChange={(e) => updateFormacionCert(uc.id, { examScore: e.target.value })} />
                      </FormControl>
                    </Flex>
                  )}

                  <HStack spacing={2} wrap="wrap">
                    {uc.status === 'planeada' && (
                      <Button size="xs" colorScheme="blue" leftIcon={<FiPlay />} onClick={() => updateFormacionCert(uc.id, { status: 'en_progreso' })}>
                        Comenzar
                      </Button>
                    )}
                    {uc.status === 'en_progreso' && (
                      <>
                        <Button size="xs" colorScheme="green" leftIcon={<FiCheck />} onClick={() => updateFormacionCert(uc.id, { status: 'completada' })}>
                          Completar
                        </Button>
                        <Button size="xs" variant="ghost" leftIcon={<FiX />} onClick={() => updateFormacionCert(uc.id, { status: 'planeada' })}>
                          Pausar
                        </Button>
                      </>
                    )}
                    {uc.status === 'completada' && (
                      <Button size="xs" variant="ghost" leftIcon={<FiClock />} onClick={() => updateFormacionCert(uc.id, { status: 'en_progreso' })}>
                        Reabrir
                      </Button>
                    )}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          );
        })}
      </VStack>
    </VStack>
  );
}

export default function Formacion() {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box>
      <Tabs variant="enclosed" colorScheme="teal">
        <TabList mb={4}>
          <Tab><FiBookOpen style={{ display: 'inline', marginRight: 8 }} />Catálogo</Tab>
          <Tab><FiTarget style={{ display: 'inline', marginRight: 8 }} />Mis Rutas</Tab>
          <Tab><FiAward style={{ display: 'inline', marginRight: 8 }} />Mis Certificaciones</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <CatalogoTab />
          </TabPanel>
          <TabPanel p={0}>
            <MisRutasTab />
          </TabPanel>
          <TabPanel p={0}>
            <MisCertificacionesTab />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
