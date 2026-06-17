import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

const AUTH_KEY = 'icaro-auth';
const SESSION_KEY = 'icaro-session';
const DATA_PREFIX = 'icaro-data-';

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

const loadJSON = (key) => {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
};

const saveJSON = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.error('Storage error:', e); }
};

const getDataKey = (userId) => `${DATA_PREFIX}${userId}`;

const DATA_FIELDS = [
  'agendaTasks', 'temarios', 'studySessions', 'tests', 'testResults',
  'convocatoria', 'supuestosPracticos', 'simulacros',
  'jobOffers', 'gymRoutines', 'gymSessions', 'gymGoals',
  'projects', 'projectLogs', 'automations',
  'notifications', 'xp', 'level', 'badges', 'dailyMissions',
  'backups', 'focusMode', 'pomodoroActive', 'pomodoroMinutes',
];

const getDefaultData = () => ({
  agendaTasks: [], temarios: [], studySessions: [], tests: [], testResults: [],
  convocatoria: { nombre: '', organismo: '', plazoInscripcionInicio: '', plazoInscripcionFin: '', inscrito: false, fechaAdmitidos: '', listasProvisionales: '', fechaExamen: '', lugarExamen: '', tasa: '', mediasAprobar: '', numeroPlazas: '', notas: '' },
  supuestosPracticos: [], simulacros: [],
  jobOffers: [], gymRoutines: [], gymSessions: [], gymGoals: [],
  projects: [], projectLogs: [], automations: [],
  notifications: [], xp: 0, level: 1, badges: [], dailyMissions: [],
  backups: [], focusMode: false, pomodoroActive: false, pomodoroMinutes: 25,
});

const useStore = create((set, get) => {
  const loadUserData = (userId) => {
    const saved = loadJSON(getDataKey(userId));
    return saved || getDefaultData();
  };

  const saveUserData = (userId, data) => {
    const toSave = {};
    DATA_FIELDS.forEach(f => { toSave[f] = data[f]; });
    saveJSON(getDataKey(userId), toSave);
  };

  const saveAuth = (authData) => {
    saveJSON(AUTH_KEY, authData);
  };

  const initAuth = () => {
    const auth = loadJSON(AUTH_KEY);
    if (!auth || !auth.users || auth.users.length === 0) {
      hashPassword('icaro', 'admin-salt-icaro-2024').then(hashedPw => {
        const adminUser = {
          id: 'admin-001', username: 'admin', email: 'admin@icaro.app',
          password: hashedPw, salt: 'admin-salt-icaro-2024',
          name: 'Administrador', role: 'admin', status: 'active',
          securityQuestion: '¿Nombre de tu primera mascota?', securityAnswer: '',
          createdAt: new Date().toISOString(),
        };
        saveAuth({ users: [adminUser], pendingUsers: [] });
        set({ users: [adminUser], pendingUsers: [] });
      });
    } else {
      set({ users: auth.users, pendingUsers: auth.pendingUsers || [] });
    }

    const session = loadJSON(SESSION_KEY);
    if (session && session.userId) {
      const authData = loadJSON(AUTH_KEY);
      const found = authData?.users?.find(u => u.id === session.userId && u.status === 'active');
      if (found) {
        const userData = loadUserData(found.id);
        set({
          ...userData,
          user: { id: found.id, username: found.username, name: found.name, email: found.email, role: found.role },
          isAuthenticated: true,
          users: authData.users,
          pendingUsers: authData.pendingUsers || [],
        });
        return;
      }
    }
    set({ ...getDefaultData(), user: null, isAuthenticated: false });
  };

  const login = async (username, password) => {
    const auth = loadJSON(AUTH_KEY);
    if (!auth || !auth.users) return { success: false, error: 'Sistema no inicializado' };
    const found = auth.users.find(u => u.username === username && u.status === 'active');
    if (!found) return { success: false, error: 'Usuario no encontrado o inactivo' };
    const hashed = await hashPassword(password, found.salt);
    if (hashed !== found.password) return { success: false, error: 'Contraseña incorrecta' };
    const userData = loadUserData(found.id);
    saveJSON(SESSION_KEY, { userId: found.id });
    set({
      ...userData,
      user: { id: found.id, username: found.username, name: found.name, email: found.email, role: found.role },
      isAuthenticated: true,
      users: auth.users,
      pendingUsers: auth.pendingUsers || [],
    });
    return { success: true };
  };

  const logout = () => {
    const state = get();
    if (state.user) {
      saveUserData(state.user.id, state);
    }
    localStorage.removeItem(SESSION_KEY);
    set({
      ...getDefaultData(),
      user: null, isAuthenticated: false, currentView: 'login',
      users: loadJSON(AUTH_KEY)?.users || [],
      pendingUsers: loadJSON(AUTH_KEY)?.pendingUsers || [],
    });
  };

  const saveCurrentUserData = () => {
    const state = get();
    if (state.user) saveUserData(state.user.id, state);
  };

  return {
    user: null,
    isAuthenticated: false,
    users: [],
    pendingUsers: [],
    currentView: 'login',
    ...getDefaultData(),

    initAuth,
    login,
    logout,
    setView: (view) => set({ currentView: view }),

    register: async (data) => {
      const auth = loadJSON(AUTH_KEY) || { users: [], pendingUsers: [] };
      const allUsers = [...(auth.users || []), ...(auth.pendingUsers || [])];
      const exists = allUsers.find(u => u.username === data.username || u.email === data.email);
      if (exists) return { success: false, error: 'El usuario o email ya existe' };
      const salt = generateSalt();
      const hashedPw = await hashPassword(data.password, salt);
      const pendingUser = {
        id: uuidv4(), username: data.username, email: data.email,
        password: hashedPw, salt, name: data.name, role: 'user', status: 'pending',
        securityQuestion: data.securityQuestion,
        securityAnswer: data.securityAnswer.toLowerCase().trim(),
        createdAt: new Date().toISOString(),
      };
      const newPending = [...(auth.pendingUsers || []), pendingUser];
      saveAuth({ users: auth.users, pendingUsers: newPending });
      set({ pendingUsers: newPending });
      return { success: true, message: 'Registro enviado. Espera aprobación del administrador.' };
    },

    approveUser: (userId) => {
      const auth = loadJSON(AUTH_KEY) || { users: [], pendingUsers: [] };
      const pending = auth.pendingUsers.find(u => u.id === userId);
      if (!pending) return null;
      const newUsers = [...auth.users, { ...pending, status: 'active' }];
      const newPending = auth.pendingUsers.filter(u => u.id !== userId);
      saveAuth({ users: newUsers, pendingUsers: newPending });
      saveUserData(pending.id, getDefaultData());
      set({ users: newUsers, pendingUsers: newPending });
      return pending;
    },

    rejectUser: (userId) => {
      const auth = loadJSON(AUTH_KEY) || { users: [], pendingUsers: [] };
      const newPending = auth.pendingUsers.filter(u => u.id !== userId);
      saveAuth({ users: auth.users, pendingUsers: newPending });
      set({ pendingUsers: newPending });
    },

    deleteUser: (userId) => {
      if (userId === 'admin-001') return;
      const auth = loadJSON(AUTH_KEY) || { users: [], pendingUsers: [] };
      const newUsers = auth.users.filter(u => u.id !== userId);
      saveAuth({ users: newUsers, pendingUsers: auth.pendingUsers });
      localStorage.removeItem(getDataKey(userId));
      set({ users: newUsers });
    },

    recoverPassword: async (username, securityAnswer, newPassword) => {
      const auth = loadJSON(AUTH_KEY) || { users: [], pendingUsers: [] };
      const user = auth.users.find(u => u.username === username && u.status === 'active');
      if (!user) return { success: false, error: 'Usuario no encontrado' };
      if (user.securityAnswer.toLowerCase().trim() !== securityAnswer.toLowerCase().trim()) {
        return { success: false, error: 'Respuesta de seguridad incorrecta' };
      }
      const salt = generateSalt();
      const hashedPw = await hashPassword(newPassword, salt);
      const newUsers = auth.users.map(u => u.id === user.id ? { ...u, password: hashedPw, salt } : u);
      saveAuth({ users: newUsers, pendingUsers: auth.pendingUsers });
      set({ users: newUsers });
      return { success: true, message: 'Contraseña actualizada correctamente' };
    },

    addAgendaTask: (task) => { set((s) => ({ agendaTasks: [...s.agendaTasks, { ...task, id: uuidv4(), createdAt: new Date().toISOString() }] })); setTimeout(saveCurrentUserData, 0); },
    updateAgendaTask: (id, data) => { set((s) => ({ agendaTasks: s.agendaTasks.map((t) => (t.id === id ? { ...t, ...data } : t)) })); setTimeout(saveCurrentUserData, 0); },
    deleteAgendaTask: (id) => { set((s) => ({ agendaTasks: s.agendaTasks.filter((t) => t.id !== id) })); setTimeout(saveCurrentUserData, 0); },

    addTemario: (t) => { set((s) => ({ temarios: [...s.temarios, { ...t, id: uuidv4(), topics: t.topics || [], createdAt: new Date().toISOString() }] })); setTimeout(saveCurrentUserData, 0); },
    updateTemario: (id, data) => { set((s) => ({ temarios: s.temarios.map((t) => (t.id === id ? { ...t, ...data } : t)) })); setTimeout(saveCurrentUserData, 0); },
    deleteTemario: (id) => { set((s) => ({ temarios: s.temarios.filter((t) => t.id !== id) })); setTimeout(saveCurrentUserData, 0); },

    addStudySession: (session) => { set((s) => ({ studySessions: [...s.studySessions, { ...session, id: uuidv4(), createdAt: new Date().toISOString() }] })); setTimeout(saveCurrentUserData, 0); },

    addTest: (test) => { set((s) => ({ tests: [...s.tests, { ...test, id: uuidv4(), questions: test.questions || [], createdAt: new Date().toISOString() }] })); setTimeout(saveCurrentUserData, 0); },
    updateTest: (id, data) => { set((s) => ({ tests: s.tests.map((t) => (t.id === id ? { ...t, ...data } : t)) })); setTimeout(saveCurrentUserData, 0); },
    deleteTest: (id) => { set((s) => ({ tests: s.tests.filter((t) => t.id !== id) })); setTimeout(saveCurrentUserData, 0); },

    addTestResult: (result) => { set((s) => ({ testResults: [...s.testResults, { ...result, id: uuidv4(), createdAt: new Date().toISOString() }] })); setTimeout(saveCurrentUserData, 0); },

    updateConvocatoria: (data) => { set((s) => ({ convocatoria: { ...s.convocatoria, ...data } })); setTimeout(saveCurrentUserData, 0); },

    addSupuestoPractico: (s) => { set((state) => ({ supuestosPracticos: [...state.supuestosPracticos, { ...s, id: uuidv4(), createdAt: new Date().toISOString() }] })); setTimeout(saveCurrentUserData, 0); },
    updateSupuestoPractico: (id, data) => { set((s) => ({ supuestosPracticos: s.supuestosPracticos.map((sp) => (sp.id === id ? { ...sp, ...data } : sp)) })); setTimeout(saveCurrentUserData, 0); },
    deleteSupuestoPractico: (id) => { set((s) => ({ supuestosPracticos: s.supuestosPracticos.filter((sp) => sp.id !== id) })); setTimeout(saveCurrentUserData, 0); },

    addSimulacro: (s) => { set((state) => ({ simulacros: [...state.simulacros, { ...s, id: uuidv4(), createdAt: new Date().toISOString() }] })); setTimeout(saveCurrentUserData, 0); },
    updateSimulacro: (id, data) => { set((s) => ({ simulacros: s.simulacros.map((sm) => (sm.id === id ? { ...sm, ...data } : sm)) })); setTimeout(saveCurrentUserData, 0); },
    deleteSimulacro: (id) => { set((s) => ({ simulacros: s.simulacros.filter((sm) => sm.id !== id) })); setTimeout(saveCurrentUserData, 0); },

    addJobOffer: (offer) => { set((s) => ({ jobOffers: [...s.jobOffers, { ...offer, id: uuidv4(), createdAt: new Date().toISOString() }] })); setTimeout(saveCurrentUserData, 0); },
    updateJobOffer: (id, data) => { set((s) => ({ jobOffers: s.jobOffers.map((o) => (o.id === id ? { ...o, ...data } : o)) })); setTimeout(saveCurrentUserData, 0); },
    deleteJobOffer: (id) => { set((s) => ({ jobOffers: s.jobOffers.filter((o) => o.id !== id) })); setTimeout(saveCurrentUserData, 0); },

    addGymRoutine: (r) => { set((s) => ({ gymRoutines: [...s.gymRoutines, { ...r, id: uuidv4(), exercises: r.exercises || [], createdAt: new Date().toISOString() }] })); setTimeout(saveCurrentUserData, 0); },
    updateGymRoutine: (id, data) => { set((s) => ({ gymRoutines: s.gymRoutines.map((r) => (r.id === id ? { ...r, ...data } : r)) })); setTimeout(saveCurrentUserData, 0); },
    deleteGymRoutine: (id) => { set((s) => ({ gymRoutines: s.gymRoutines.filter((r) => r.id !== id) })); setTimeout(saveCurrentUserData, 0); },

    addGymSession: (session) => { set((s) => ({ gymSessions: [...s.gymSessions, { ...session, id: uuidv4(), createdAt: new Date().toISOString() }] })); setTimeout(saveCurrentUserData, 0); },
    deleteGymSession: (id) => { set((s) => ({ gymSessions: s.gymSessions.filter((se) => se.id !== id) })); setTimeout(saveCurrentUserData, 0); },

    addGymGoal: (g) => { set((s) => ({ gymGoals: [...s.gymGoals, { ...g, id: uuidv4(), createdAt: new Date().toISOString() }] })); setTimeout(saveCurrentUserData, 0); },
    updateGymGoal: (id, data) => { set((s) => ({ gymGoals: s.gymGoals.map((g) => (g.id === id ? { ...g, ...data } : g)) })); setTimeout(saveCurrentUserData, 0); },
    deleteGymGoal: (id) => { set((s) => ({ gymGoals: s.gymGoals.filter((g) => g.id !== id) })); setTimeout(saveCurrentUserData, 0); },

    addProject: (p) => { set((s) => ({ projects: [...s.projects, { ...p, id: uuidv4(), tasks: p.tasks || [], createdAt: new Date().toISOString() }] })); setTimeout(saveCurrentUserData, 0); },
    updateProject: (id, data) => { set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...data } : p)) })); setTimeout(saveCurrentUserData, 0); },
    deleteProject: (id) => { set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })); setTimeout(saveCurrentUserData, 0); },

    addProjectLog: (log) => { set((s) => ({ projectLogs: [...s.projectLogs, { ...log, id: uuidv4(), createdAt: new Date().toISOString() }] })); setTimeout(saveCurrentUserData, 0); },
    deleteProjectLog: (id) => { set((s) => ({ projectLogs: s.projectLogs.filter((l) => l.id !== id) })); setTimeout(saveCurrentUserData, 0); },

    addXP: (amount) => { set((s) => { const newXP = s.xp + amount; const newLevel = Math.floor(newXP / 100) + 1; return { xp: newXP, level: newLevel }; }); setTimeout(saveCurrentUserData, 0); },
    addBadge: (badge) => { set((s) => ({ badges: [...s.badges, { ...badge, id: uuidv4(), earnedAt: new Date().toISOString() }] })); setTimeout(saveCurrentUserData, 0); },
    completeMission: (id) => { set((s) => ({ dailyMissions: s.dailyMissions.map((m) => (m.id === id ? { ...m, completed: true } : m)) })); setTimeout(saveCurrentUserData, 0); },

    addAutomation: (a) => { set((s) => ({ automations: [...s.automations, { ...a, id: uuidv4(), enabled: true, createdAt: new Date().toISOString() }] })); setTimeout(saveCurrentUserData, 0); },
    updateAutomation: (id, data) => { set((s) => ({ automations: s.automations.map((a) => (a.id === id ? { ...a, ...data } : a)) })); setTimeout(saveCurrentUserData, 0); },
    deleteAutomation: (id) => { set((s) => ({ automations: s.automations.filter((a) => a.id !== id) })); setTimeout(saveCurrentUserData, 0); },

    toggleFocusMode: () => { set((s) => ({ focusMode: !s.focusMode })); setTimeout(saveCurrentUserData, 0); },
    setPomodoro: (min) => { set({ pomodoroMinutes: min }); setTimeout(saveCurrentUserData, 0); },
    togglePomodoro: () => { set((s) => ({ pomodoroActive: !s.pomodoroActive })); setTimeout(saveCurrentUserData, 0); },

    addNotification: (n) => { set((s) => ({ notifications: [{ ...n, id: uuidv4(), read: false, createdAt: new Date().toISOString() }, ...s.notifications] })); setTimeout(saveCurrentUserData, 0); },
    markNotificationRead: (id) => { set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })); setTimeout(saveCurrentUserData, 0); },
    clearNotifications: () => { set({ notifications: [] }); setTimeout(saveCurrentUserData, 0); },

    resetStats: () => { set({ studySessions: [], testResults: [], gymSessions: [], projectLogs: [], jobOffers: [], xp: 0, level: 1, badges: [] }); setTimeout(saveCurrentUserData, 0); },

    createBackup: (name) => {
      const state = get();
      const backup = {
        id: uuidv4(), name: name || `Backup ${new Date().toLocaleString('es')}`, date: new Date().toISOString(),
        data: { agendaTasks: state.agendaTasks, temarios: state.temarios, studySessions: state.studySessions, tests: state.tests, testResults: state.testResults, supuestosPracticos: state.supuestosPracticos, simulacros: state.simulacros, convocatoria: state.convocatoria, jobOffers: state.jobOffers, gymRoutines: state.gymRoutines, gymSessions: state.gymSessions, gymGoals: state.gymGoals, projects: state.projects, projectLogs: state.projectLogs, automations: state.automations, xp: state.xp, level: state.level, badges: state.badges },
      };
      set((s) => ({ backups: [backup, ...s.backups] }));
      setTimeout(saveCurrentUserData, 0);
      return backup;
    },
    restoreBackup: (backupId) => {
      const state = get();
      const backup = state.backups.find((b) => b.id === backupId);
      if (backup && backup.data) {
        set({
          agendaTasks: backup.data.agendaTasks || [], temarios: backup.data.temarios || [], studySessions: backup.data.studySessions || [], tests: backup.data.tests || [], testResults: backup.data.testResults || [], supuestosPracticos: backup.data.supuestosPracticos || [], simulacros: backup.data.simulacros || [], convocatoria: backup.data.convocatoria || {}, jobOffers: backup.data.jobOffers || [], gymRoutines: backup.data.gymRoutines || [], gymSessions: backup.data.gymSessions || [], gymGoals: backup.data.gymGoals || [], projects: backup.data.projects || [], projectLogs: backup.data.projectLogs || [], automations: backup.data.automations || [], xp: backup.data.xp || 0, level: backup.data.level || 1, badges: backup.data.badges || [],
        });
        setTimeout(saveCurrentUserData, 0);
      }
    },
    deleteBackup: (backupId) => { set((s) => ({ backups: s.backups.filter((b) => b.id !== backupId) })); setTimeout(saveCurrentUserData, 0); },

    clearSection: (section) => {
      const resets = {
        agenda: { agendaTasks: [] },
        oposiciones: { temarios: [], studySessions: [], tests: [], testResults: [], supuestosPracticos: [], simulacros: [], convocatoria: { nombre: '', organismo: '', plazoInscripcionInicio: '', plazoInscripcionFin: '', inscrito: false, fechaAdmitidos: '', listasProvisionales: '', fechaExamen: '', lugarExamen: '', tasa: '', mediasAprobar: '', numeroPlazas: '', notas: '' } },
        trabajo: { jobOffers: [] },
        gym: { gymRoutines: [], gymSessions: [], gymGoals: [] },
        proyectos: { projects: [], projectLogs: [] },
        automatizaciones: { automations: [] },
      };
      if (resets[section]) { set(resets[section]); setTimeout(saveCurrentUserData, 0); }
    },
    clearAll: () => { set({ ...getDefaultData() }); setTimeout(saveCurrentUserData, 0); },
  };
});

export default useStore;
