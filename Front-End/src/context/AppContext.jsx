import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authAPI, projectsAPI, tasksAPI, notificationsAPI } from '../services/api';

const AppContext = createContext(null);

const initialState = {
  // Auth
  user: null,
  isAuthenticated: false,
  authLoading: true,

  // Data
  projects: [],
  tasks: [],
  notifications: [],
  selectedProjectId: null,

  // UI
  sidebarOpen: true,
  activeView: 'board',
  loadingTasks: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_AUTH':
      return { ...state, user: action.user, isAuthenticated: !!action.user, authLoading: false };

    case 'SET_PROJECTS':
      return { ...state, projects: action.projects };

    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.project] };

    case 'UPDATE_PROJECT':
      return { ...state, projects: state.projects.map(p => p.id === action.project.id ? action.project : p) };

    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.id),
        selectedProjectId: state.selectedProjectId === action.id ? (state.projects[0]?.id || null) : state.selectedProjectId,
      };

    case 'SELECT_PROJECT':
      return { ...state, selectedProjectId: action.id };

    case 'SET_TASKS':
      return { ...state, tasks: action.tasks, loadingTasks: false };

    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.task] };

    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.task.id ? action.task : t) };

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) };

    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.notifications };

    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.notification, ...state.notifications] };

    case 'MARK_NOTIF_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => n.id === action.id ? { ...n, read: true } : n),
      };

    case 'MARK_ALL_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'SET_VIEW':
      return { ...state, activeView: action.view };

    case 'SET_LOADING_TASKS':
      return { ...state, loadingTasks: action.value };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('tf_token');
    if (token) {
      authAPI.me()
        .then(res => dispatch({ type: 'SET_AUTH', user: res.data }))
        .catch(() => dispatch({ type: 'SET_AUTH', user: null }));
    } else {
      dispatch({ type: 'SET_AUTH', user: null });
    }
  }, []);

  // Load projects when authenticated
  useEffect(() => {
    if (!state.isAuthenticated) return;
    projectsAPI.list()
      .then(res => {
        dispatch({ type: 'SET_PROJECTS', projects: res.data });
        if (res.data.length > 0) dispatch({ type: 'SELECT_PROJECT', id: res.data[0].id });
      })
      .catch(console.error);

    notificationsAPI.list()
      .then(res => dispatch({ type: 'SET_NOTIFICATIONS', notifications: res.data }))
      .catch(console.error);
  }, [state.isAuthenticated]);

  // Load tasks when project changes
  useEffect(() => {
    if (!state.selectedProjectId) return;
    dispatch({ type: 'SET_LOADING_TASKS', value: true });
    tasksAPI.list(state.selectedProjectId)
      .then(res => dispatch({ type: 'SET_TASKS', tasks: res.data }))
      .catch(() => dispatch({ type: 'SET_LOADING_TASKS', value: false }));
  }, [state.selectedProjectId]);

  const login = useCallback(async (credentials) => {
    const res = await authAPI.login(credentials);
    localStorage.setItem('tf_token', res.data.access_token);
    dispatch({ type: 'SET_AUTH', user: res.data.user });
  }, []);

  const logout = useCallback(async () => {
    await authAPI.logout().catch(() => {});
    localStorage.removeItem('tf_token');
    dispatch({ type: 'SET_AUTH', user: null });
  }, []);

  const createProject = useCallback(async (data) => {
    const res = await projectsAPI.create(data);
    dispatch({ type: 'ADD_PROJECT', project: res.data });
    dispatch({ type: 'SELECT_PROJECT', id: res.data.id });
    return res.data;
  }, []);

  const createTask = useCallback(async (data) => {
    const res = await tasksAPI.create(state.selectedProjectId, data);
    dispatch({ type: 'ADD_TASK', task: res.data });
    dispatch({ type: 'ADD_NOTIFICATION', notification: {
      id: Date.now(), text: `Nova tarefa criada: "${res.data.title}"`, time: 'agora', read: false, color: '#6366f1',
    }});
    return res.data;
  }, [state.selectedProjectId]);

  const moveTask = useCallback(async (taskId, status) => {
    const task = state.tasks.find(t => t.id === taskId);
    dispatch({ type: 'UPDATE_TASK', task: { ...task, status } });
    dispatch({ type: 'ADD_NOTIFICATION', notification: {
      id: Date.now(), text: `"${task.title}" movida para ${status}`, time: 'agora', read: false, color: '#f59e0b',
    }});
    await tasksAPI.updateStatus(taskId, status).catch(() => {
      dispatch({ type: 'UPDATE_TASK', task }); // rollback
    });
  }, [state.tasks]);

  const updateTask = useCallback(async (taskId, data) => {
    const res = await tasksAPI.update(taskId, data);
    dispatch({ type: 'UPDATE_TASK', task: res.data });
    return res.data;
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    await tasksAPI.delete(taskId);
    dispatch({ type: 'DELETE_TASK', id: taskId });
  }, []);

  const unreadCount = state.notifications.filter(n => !n.read).length;

  const value = {
    ...state,
    unreadCount,
    dispatch,
    login,
    logout,
    createProject,
    createTask,
    moveTask,
    updateTask,
    deleteTask,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
