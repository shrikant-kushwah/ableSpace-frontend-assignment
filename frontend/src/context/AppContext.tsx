'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
  email?: string;
  username?: string;
}

export interface Subtask {
  _id?: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  _id?: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Resource {
  _id?: string;
  title: string;
  url: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignees: User[];
  labels: string[];
  subtasks: Subtask[];
  comments: Comment[];
  resources: Resource[];
  createdAt: string;
  updatedAt: string;
}

type Theme = 'light' | 'dark';
type AccentColor = 'amber' | 'blue' | 'pink' | 'rose' | 'emerald' | 'black';
type ViewMode = 'list' | 'board';

interface AppContextType {
  user: User | null;
  token: string | null;
  theme: Theme;
  accentColor: AccentColor;
  viewMode: ViewMode;
  tasks: Task[];
  users: User[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedPriority: string;
  selectedLabel: string;
  visibleFields: string[];
  setSearchQuery: (query: string) => void;
  setSelectedPriority: (priority: string) => void;
  setSelectedLabel: (label: string) => void;
  setVisibleFields: (fields: string[]) => void;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
  setViewMode: (mode: ViewMode) => void;
  loginAsGuest: (name: string) => Promise<boolean>;
  loginWithGoogleMock: (name: string, email: string, avatarUrl: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  logout: () => void;
  fetchTasks: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<Task | null>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  addComment: (taskId: string, content: string) => Promise<Task | null>;
  addResource: (taskId: string, title: string, url: string) => Promise<Task | null>;
  reseedDatabase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [theme, setThemeState] = useState<Theme>('light');
  const [accentColor, setAccentColorState] = useState<AccentColor>('emerald');
  const [viewMode, setViewModeState] = useState<ViewMode>('board');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [visibleFields, setVisibleFields] = useState<string[]>(['priority', 'assignees', 'dueDate', 'labels']);

  // Load persisted states on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('tms_token');
      const savedUser = localStorage.getItem('tms_user');
      const savedTheme = localStorage.getItem('tms_theme') as Theme;
      const savedAccent = localStorage.getItem('tms_accent') as AccentColor;
      const savedView = localStorage.getItem('tms_view') as ViewMode;

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
      if (savedTheme) {
        setThemeState(savedTheme);
      }
      if (savedAccent) {
        setAccentColorState(savedAccent);
      }
      if (savedView) {
        setViewModeState(savedView);
      }
      setIsLoading(false);
    }
  }, []);

  // Update DOM classes for Theme and Accent
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Theme class
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Accent classes
      const accentClasses = ['accent-amber', 'accent-blue', 'accent-pink', 'accent-rose', 'accent-emerald', 'accent-black'];
      root.classList.remove(...accentClasses);
      root.classList.add(`accent-${accentColor}`);
    }
  }, [theme, accentColor]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('tms_theme', newTheme);
  };

  const setAccentColor = (newAccent: AccentColor) => {
    setAccentColorState(newAccent);
    localStorage.setItem('tms_accent', newAccent);
  };

  const setViewMode = (newMode: ViewMode) => {
    setViewModeState(newMode);
    localStorage.setItem('tms_view', newMode);
  };

  // Helper fetch wrapper
  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      logout();
      throw new Error('Session expired');
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'API request failed');
    }

    return res.json();
  };

  const loginAsGuest = async (name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiFetch('/auth/guest', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });

      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('tms_token', data.access_token);
      localStorage.setItem('tms_user', JSON.stringify(data.user));
      return true;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogleMock = async (name: string, email: string, avatarUrl: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiFetch('/auth/google-mock', {
        method: 'POST',
        body: JSON.stringify({ name, email, avatarUrl }),
      });

      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('tms_token', data.access_token);
      localStorage.setItem('tms_user', JSON.stringify(data.user));
      return true;
    } catch (err: any) {
      setError(err.message || 'Google Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setTasks([]);
    setUsers([]);
    localStorage.removeItem('tms_token');
    localStorage.removeItem('tms_user');
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      const data = await apiFetch('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      const updatedUser = { ...user, ...data } as User;
      setUser(updatedUser);
      localStorage.setItem('tms_user', JSON.stringify(updatedUser));

      // Update local users list
      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      return true;
    } catch (err: any) {
      setError(err.message || 'Profile update failed');
      return false;
    }
  };

  const normalizeTask = (task: any): Task => {
    if (!task) return task;
    return {
      ...task,
      assignees: task.assignees?.map((a: any) => ({
        ...a,
        id: a.id || a._id,
      })) || [],
    };
  };

  const normalizeTasks = (taskList: any[]): Task[] => {
    if (!taskList) return [];
    return taskList.map(normalizeTask);
  };

  const fetchTasks = async () => {
    if (!token) return;
    try {
      setError(null);
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (selectedPriority) queryParams.append('priority', selectedPriority);
      if (selectedLabel) queryParams.append('label', selectedLabel);

      const data = await apiFetch(`/tasks?${queryParams.toString()}`);
      setTasks(normalizeTasks(data));
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.message || 'Failed to fetch tasks');
    }
  };

  const fetchUsers = async () => {
    if (!token) return;
    try {
      await apiFetch('/auth/guest', {
        method: 'POST',
        body: JSON.stringify({ name: 'Guest User' }),
      });
      // Just fetch users list if possible, otherwise mock or load default members
      // The backend seeds admin, designer, qaTeam, security, cn.
      // Since we don't have a direct users list endpoint, let's load tasks first,
      // extract members from task assignees, or query a task to get populated assignees.
      // But let's build a users list based on seeded data if we want.
      // We can also fetch the default users by querying all tasks and collecting unique assignees.
      // Let's do that dynamically as it is very clean!
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, searchQuery, selectedPriority, selectedLabel]);

  // Extract unique users dynamically from the tasks list to build user list
  useEffect(() => {
    if (tasks.length > 0) {
      const uniqueUsersMap = new Map<string, User>();
      
      // Add current user if exists
      if (user) {
        uniqueUsersMap.set(user.id, user);
      }
      
      tasks.forEach(task => {
        task.assignees?.forEach(assignee => {
          const key = assignee.id || (assignee as any)._id;
          if (assignee && key) {
            uniqueUsersMap.set(key, { ...assignee, id: key });
          }
        });
      });
      
      setUsers(Array.from(uniqueUsersMap.values()));
    }
  }, [tasks, user]);

  const createTask = async (data: Partial<Task>): Promise<Task | null> => {
    try {
      const created = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      await fetchTasks();
      return created;
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      return null;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<Task | null> => {
    try {
      const updated = await apiFetch(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      const normalized = normalizeTask(updated);
      // Update tasks state locally to trigger instant updates in components
      setTasks(prev => prev.map(t => (t._id === id ? normalized : t)));
      return normalized;
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
      return null;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      await apiFetch(`/tasks/${id}`, {
        method: 'DELETE',
      });
      setTasks(prev => prev.filter(t => t._id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
      return false;
    }
  };

  const addComment = async (taskId: string, content: string): Promise<Task | null> => {
    try {
      const updated = await apiFetch(`/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      const normalized = normalizeTask(updated);
      setTasks(prev => prev.map(t => (t._id === taskId ? normalized : t)));
      return normalized;
    } catch (err: any) {
      setError(err.message || 'Failed to add comment');
      return null;
    }
  };

  const addResource = async (taskId: string, title: string, url: string): Promise<Task | null> => {
    try {
      const updated = await apiFetch(`/tasks/${taskId}/resources`, {
        method: 'POST',
        body: JSON.stringify({ title, url }),
      });
      const normalized = normalizeTask(updated);
      setTasks(prev => prev.map(t => (t._id === taskId ? normalized : t)));
      return normalized;
    } catch (err: any) {
      setError(err.message || 'Failed to add resource');
      return null;
    }
  };

  const reseedDatabase = async () => {
    try {
      setIsLoading(true);
      await apiFetch('/tasks/reseed', { method: 'POST' });
      await fetchTasks();
    } catch (err: any) {
      setError(err.message || 'Failed to reseed database');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        theme,
        accentColor,
        viewMode,
        tasks,
        users,
        isLoading,
        error,
        searchQuery,
        selectedPriority,
        selectedLabel,
        visibleFields,
        setSearchQuery,
        setSelectedPriority,
        setSelectedLabel,
        setVisibleFields,
        setTheme,
        setAccentColor,
        setViewMode,
        loginAsGuest,
        loginWithGoogleMock,
        updateProfile,
        logout,
        fetchTasks,
        fetchUsers,
        createTask,
        updateTask,
        deleteTask,
        addComment,
        addResource,
        reseedDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
