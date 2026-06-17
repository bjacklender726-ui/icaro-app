import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const hashPassword = async (password, salt) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};

const generateSalt = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
};

const useStore = create(
  persist(
    (set, get) => {
      const ensureAdmin = async () => {
        const state = get();
        if (!state.users || state.users.length === 0) {
          const salt = generateSalt();
          const hashedPw = await hashPassword('icaro', salt);
          set({
            users: [{
              id: 'admin-001',
              username: 'admin',
              email: 'admin@icaro.app',
              password: hashedPw,
              salt,
              name: 'Administrador',
              role: 'admin',
              status: 'active',
              securityQuestion: '¿Nombre de tu primera mascota?',
              securityAnswer: '',
              createdAt: new Date().toISOString(),
            }],
            pendingUsers: [],
          });
        }
      };

      return {
        // ===== AUTH =====
        user: null,
        isAuthenticated: false,
        users: [],
        pendingUsers: [],
        currentView: 'login',

        initAuth: async () => {
          await ensureAdmin();
        },

        login: async (username, password) => {
          const state = get();
          const found = state.users.find(u => u.username === username && u.status === 'active');
          if (!found) return { success: false, error: 'Usuario no encontrado o inactivo' };
          const hashed = await hashPassword(password, found.salt);
          if (hashed !== found.password) return { success: false, error: 'Contraseña incorrecta' };
          set({ user: { id: found.id, username: found.username, name: found.name, email: found.email, role: found.role }, isAuthenticated: true });
          return { success: true };
        },

        logout: () => set({ user: null, isAuthenticated: false, currentView: 'login' }),

        register: async (data) => {
          const state = get();
          const exists = state.users.find(u => u.username === data.username);
          const pendingExists = state.pendingUsers.find(u => u.username === data.username);
          if (exists || pendingExists) return { success: false, error: 'El usuario ya existe' };
          const salt = generateSalt();
          const hashedPw = await hashPassword(data.password, salt);
          const pendingUser = {
            id: uuidv4(),
            username: data.username,
            email: data.email,
            password: hashedPw,
            salt,
            name: data.name,
            role: 'user',
            status: 'pending',
            securityQuestion: data.securityQuestion,
            securityAnswer: data.securityAnswer.toLowerCase().trim(),
            createdAt: new Date().toISOString(),
          };
          set({ pendingUsers: [...state.pendingUsers, pendingUser] });
          return { success: true, message: 'Registro enviado. Espera aprobación del administrador.' };
        },

        approveUser: (userId) => {
          const state = get();
          const user = state.pendingUsers.find(u => u.id === userId);
          if (!user) return;
          set({
            users: [...state.users, { ...user, status: 'active' }],
            pendingUsers: state.pendingUsers.filter(u => u.id !== userId),
          });
          return user;
        },

        rejectUser: (userId) => {
          set((s) => ({ pendingUsers: s.pendingUsers.filter(u => u.id !== userId) }));
        },

        deleteUser: (userId) => {
          if (userId === 'admin-001') return;
          set((s) => ({ users: s.users.filter(u => u.id !== userId) }));
        },

        recoverPassword: async (username, securityAnswer, newPassword) => {
          const state = get();
          const user = state.users.find(u => u.username === username && u.status === 'active');
          if (!user) return { success: false, error: 'Usuario no encontrado' };
          if (user.securityAnswer.toLowerCase().trim() !== securityAnswer.toLowerCase().trim()) {
            return { success: false, error: 'Respuesta de seguridad incorrecta' };
          }
          const salt = generateSalt();
          const hashedPw = await hashPassword(newPassword, salt);
          set({
            users: state.users.map(u => u.id === user.id ? { ...u, password: hashedPw, salt } : u),
          });
          return { success: true, message: 'Contraseña actualizada correctamente' };
        },

        setView: (view) => set({ currentView: view }),

      // ===== AGENDA =====
      agendaTasks: [],
      addAgendaTask: (task) => set((s) => ({ agendaTasks: [...s.agendaTasks, { ...task, id: uuidv4(), createdAt: new Date().toISOString() }] })),
      updateAgendaTask: (id, data) => set((s) => ({ agendaTasks: s.agendaTasks.map((t) => (t.id === id ? { ...t, ...data } : t)) })),
      deleteAgendaTask: (id) => set((s) => ({ agendaTasks: s.agendaTasks.filter((t) => t.id !== id) })),

      // ===== OPOSICIONES =====
      temarios: [],
      addTemario: (t) => set((s) => ({ temarios: [...s.temarios, { ...t, id: uuidv4(), topics: t.topics || [], createdAt: new Date().toISOString() }] })),
      updateTemario: (id, data) => set((s) => ({ temarios: s.temarios.map((t) => (t.id === id ? { ...t, ...data } : t)) })),
      deleteTemario: (id) => set((s) => ({ temarios: s.temarios.filter((t) => t.id !== id) })),

      studySessions: [],
      addStudySession: (session) => set((s) => ({ studySessions: [...s.studySessions, { ...session, id: uuidv4(), createdAt: new Date().toISOString() }] })),

      tests: [],
      addTest: (test) => set((s) => ({ tests: [...s.tests, { ...test, id: uuidv4(), questions: test.questions || [], createdAt: new Date().toISOString() }] })),
      updateTest: (id, data) => set((s) => ({ tests: s.tests.map((t) => (t.id === id ? { ...t, ...data } : t)) })),
      deleteTest: (id) => set((s) => ({ tests: s.tests.filter((t) => t.id !== id) })),

      testResults: [],
      addTestResult: (result) => set((s) => ({ testResults: [...s.testResults, { ...result, id: uuidv4(), createdAt: new Date().toISOString() }] })),

      // ===== OPOSICIONES - CONVOCATORIA =====
      convocatoria: {
        nombre: '',
        organismo: '',
        plazoInscripcionInicio: '',
        plazoInscripcionFin: '',
        inscrito: false,
        fechaAdmitidos: '',
        listasProvisionales: '',
        fechaExamen: '',
        lugarExamen: '',
        tasa: '',
        mediasAprobar: '',
        numeroPlazas: '',
        notas: '',
      },
      updateConvocatoria: (data) => set((s) => ({ convocatoria: { ...s.convocatoria, ...data } })),

      // ===== OPOSICIONES - SUPUESTOS PRÁCTICOS =====
      supuestosPracticos: [],
      addSupuestoPractico: (s) => set((state) => ({ supuestosPracticos: [...state.supuestosPracticos, { ...s, id: uuidv4(), createdAt: new Date().toISOString() }] })),
      updateSupuestoPractico: (id, data) => set((s) => ({ supuestosPracticos: s.supuestosPracticos.map((sp) => (sp.id === id ? { ...sp, ...data } : sp)) })),
      deleteSupuestoPractico: (id) => set((s) => ({ supuestosPracticos: s.supuestosPracticos.filter((sp) => sp.id !== id) })),

      // ===== OPOSICIONES - SIMULACROS =====
      simulacros: [],
      addSimulacro: (s) => set((state) => ({ simulacros: [...state.simulacros, { ...s, id: uuidv4(), createdAt: new Date().toISOString() }] })),
      updateSimulacro: (id, data) => set((s) => ({ simulacros: s.simulacros.map((sm) => (sm.id === id ? { ...sm, ...data } : sm)) })),
      deleteSimulacro: (id) => set((s) => ({ simulacros: s.simulacros.filter((sm) => sm.id !== id) })),

      // ===== TRABAJO =====
      jobOffers: [],
      addJobOffer: (offer) => set((s) => ({ jobOffers: [...s.jobOffers, { ...offer, id: uuidv4(), createdAt: new Date().toISOString() }] })),
      updateJobOffer: (id, data) => set((s) => ({ jobOffers: s.jobOffers.map((o) => (o.id === id ? { ...o, ...data } : o)) })),
      deleteJobOffer: (id) => set((s) => ({ jobOffers: s.jobOffers.filter((o) => o.id !== id) })),

      // ===== GYM =====
      gymRoutines: [],
      addGymRoutine: (r) => set((s) => ({ gymRoutines: [...s.gymRoutines, { ...r, id: uuidv4(), exercises: r.exercises || [], createdAt: new Date().toISOString() }] })),
      updateGymRoutine: (id, data) => set((s) => ({ gymRoutines: s.gymRoutines.map((r) => (r.id === id ? { ...r, ...data } : r)) })),
      deleteGymRoutine: (id) => set((s) => ({ gymRoutines: s.gymRoutines.filter((r) => r.id !== id) })),

      gymSessions: [],
      addGymSession: (session) => set((s) => ({ gymSessions: [...s.gymSessions, { ...session, id: uuidv4(), createdAt: new Date().toISOString() }] })),
      deleteGymSession: (id) => set((s) => ({ gymSessions: s.gymSessions.filter((se) => se.id !== id) })),

      gymGoals: [],
      addGymGoal: (g) => set((s) => ({ gymGoals: [...s.gymGoals, { ...g, id: uuidv4(), createdAt: new Date().toISOString() }] })),
      updateGymGoal: (id, data) => set((s) => ({ gymGoals: s.gymGoals.map((g) => (g.id === id ? { ...g, ...data } : g)) })),
      deleteGymGoal: (id) => set((s) => ({ gymGoals: s.gymGoals.filter((g) => g.id !== id) })),

      // ===== PROYECTOS (antes Portfolio) =====
      projects: [],
      addProject: (p) => set((s) => ({ projects: [...s.projects, { ...p, id: uuidv4(), tasks: p.tasks || [], createdAt: new Date().toISOString() }] })),
      updateProject: (id, data) => set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...data } : p)) })),
      deleteProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      projectLogs: [],
      addProjectLog: (log) => set((s) => ({ projectLogs: [...s.projectLogs, { ...log, id: uuidv4(), createdAt: new Date().toISOString() }] })),
      deleteProjectLog: (id) => set((s) => ({ projectLogs: s.projectLogs.filter((l) => l.id !== id) })),

      // ===== GAMIFICACIÓN =====
      xp: 0,
      level: 1,
      badges: [],
      dailyMissions: [],
      addXP: (amount) => set((s) => {
        const newXP = s.xp + amount;
        const newLevel = Math.floor(newXP / 100) + 1;
        return { xp: newXP, level: newLevel };
      }),
      addBadge: (badge) => set((s) => ({ badges: [...s.badges, { ...badge, id: uuidv4(), earnedAt: new Date().toISOString() }] })),
      completeMission: (id) => set((s) => ({ dailyMissions: s.dailyMissions.map((m) => (m.id === id ? { ...m, completed: true } : m)) })),

      // ===== AUTOMATIZACIONES =====
      automations: [],
      addAutomation: (a) => set((s) => ({ automations: [...s.automations, { ...a, id: uuidv4(), enabled: true, createdAt: new Date().toISOString() }] })),
      updateAutomation: (id, data) => set((s) => ({ automations: s.automations.map((a) => (a.id === id ? { ...a, ...data } : a)) })),
      deleteAutomation: (id) => set((s) => ({ automations: s.automations.filter((a) => a.id !== id) })),

      // ===== FOCUS MODE =====
      focusMode: false,
      pomodoroActive: false,
      pomodoroMinutes: 25,
      toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
      setPomodoro: (min) => set({ pomodoroMinutes: min }),
      togglePomodoro: () => set((s) => ({ pomodoroActive: !s.pomodoroActive })),

      // ===== NOTIFICACIONES =====
      notifications: [],
      addNotification: (n) => set((s) => ({ notifications: [{ ...n, id: uuidv4(), read: false, createdAt: new Date().toISOString() }, ...s.notifications] })),
      markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      clearNotifications: () => set({ notifications: [] }),

      // ===== RESET =====
      resetStats: () => set({
        studySessions: [],
        testResults: [],
        gymSessions: [],
        projectLogs: [],
        jobOffers: [],
        xp: 0,
        level: 1,
        badges: [],
      }),

      // ===== BACKUPS =====
      backups: [],
      createBackup: (name) => {
        const state = get();
        const backup = {
          id: uuidv4(),
          name: name || `Backup ${new Date().toLocaleString('es')}`,
          date: new Date().toISOString(),
          data: {
            agendaTasks: state.agendaTasks,
            temarios: state.temarios,
            studySessions: state.studySessions,
            tests: state.tests,
            testResults: state.testResults,
            supuestosPracticos: state.supuestosPracticos,
            simulacros: state.simulacros,
            convocatoria: state.convocatoria,
            jobOffers: state.jobOffers,
            gymRoutines: state.gymRoutines,
            gymSessions: state.gymSessions,
            gymGoals: state.gymGoals,
            projects: state.projects,
            projectLogs: state.projectLogs,
            automations: state.automations,
            xp: state.xp,
            level: state.level,
            badges: state.badges,
          },
        };
        set((s) => ({ backups: [backup, ...s.backups] }));
        return backup;
      },
      restoreBackup: (backupId) => {
        const state = get();
        const backup = state.backups.find((b) => b.id === backupId);
        if (backup && backup.data) {
          set({
            agendaTasks: backup.data.agendaTasks || [],
            temarios: backup.data.temarios || [],
            studySessions: backup.data.studySessions || [],
            tests: backup.data.tests || [],
            testResults: backup.data.testResults || [],
            supuestosPracticos: backup.data.supuestosPracticos || [],
            simulacros: backup.data.simulacros || [],
            convocatoria: backup.data.convocatoria || {},
            jobOffers: backup.data.jobOffers || [],
            gymRoutines: backup.data.gymRoutines || [],
            gymSessions: backup.data.gymSessions || [],
            gymGoals: backup.data.gymGoals || [],
            projects: backup.data.projects || [],
            projectLogs: backup.data.projectLogs || [],
            automations: backup.data.automations || [],
            xp: backup.data.xp || 0,
            level: backup.data.level || 1,
            badges: backup.data.badges || [],
          });
        }
      },
      deleteBackup: (backupId) => set((s) => ({ backups: s.backups.filter((b) => b.id !== backupId) })),

      // ===== CLEAR SECTIONS =====
      clearSection: (section) => {
        const resets = {
          agenda: { agendaTasks: [] },
          oposiciones: { temarios: [], studySessions: [], tests: [], testResults: [], supuestosPracticos: [], simulacros: [], convocatoria: { nombre: '', organismo: '', plazoInscripcionInicio: '', plazoInscripcionFin: '', inscrito: false, fechaAdmitidos: '', listasProvisionales: '', fechaExamen: '', lugarExamen: '', tasa: '', mediasAprobar: '', numeroPlazas: '', notas: '' } },
          trabajo: { jobOffers: [] },
          gym: { gymRoutines: [], gymSessions: [], gymGoals: [] },
          proyectos: { projects: [], projectLogs: [] },
          automatizaciones: { automations: [] },
        };
        if (resets[section]) set(resets[section]);
      },
      clearAll: () => set({
        agendaTasks: [],
        temarios: [],
        studySessions: [],
        tests: [],
        testResults: [],
        jobOffers: [],
        gymRoutines: [],
        gymSessions: [],
        gymGoals: [],
        projects: [],
        projectLogs: [],
        automations: [],
        notifications: [],
        xp: 0,
        level: 1,
        badges: [],
      }),
    };
  },
    { name: 'icaro-storage' }
  )
);

export default useStore;
