export const COLUMNS = [
  { id: 'TODO',        label: 'To Do',       accent: '#6366f1', icon: '○' },
  { id: 'IN_PROGRESS', label: 'In Progress', accent: '#f59e0b', icon: '◐' },
  { id: 'DONE',        label: 'Done',        accent: '#10b981', icon: '●' },
];

export const TAG_COLORS = {
  bug:     '#f43f5e',
  feature: '#6366f1',
  devops:  '#06b6d4',
  design:  '#a855f7',
  task:    '#f59e0b',
  docs:    '#10b981',
};

export const PRIORITY_CONFIG = {
  high:   { label: 'Alta',   color: '#f87171', dot: '#ef4444' },
  medium: { label: 'Média',  color: '#fb923c', dot: '#f97316' },
  low:    { label: 'Baixa',  color: '#4ade80', dot: '#22c55e' },
};

export const PROJECT_COLORS = [
  '#6366f1','#ec4899','#06b6d4',
  '#10b981','#f59e0b','#f43f5e',
  '#a855f7','#14b8a6',
];

export const TEAM_MEMBERS = [
  { id: 'AV', name: 'Alexsander V.', role: 'Admin · Full Stack',  color: '#6366f1', skills: ['React','Python','Docker'] },
  { id: 'BM', name: 'Bruno M.',      role: 'Dev · Backend',       color: '#ec4899', skills: ['FastAPI','PostgreSQL','Docker'] },
  { id: 'CL', name: 'Carol L.',      role: 'Dev · Frontend',      color: '#06b6d4', skills: ['React','Tailwind','Design'] },
];
