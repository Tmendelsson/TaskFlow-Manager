import { useEffect, useMemo, useState } from "react";
import api, { setAuthToken } from "./lib/api";

const PRIORITY_CONFIG = {
  high: { label: "Alta", color: "#f87171", dot: "#ef4444" },
  medium: { label: "Media", color: "#fb923c", dot: "#f97316" },
  low: { label: "Baixa", color: "#4ade80", dot: "#22c55e" },
};

const TAG_COLORS = {
  bug: "#f43f5e",
  feature: "#6366f1",
  devops: "#06b6d4",
  design: "#a855f7",
  task: "#f59e0b",
};

const PROJECT_COLORS = ["#6366f1", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#a855f7", "#14b8a6"];

const COLUMNS = [
  { id: "TODO", label: "To Do", accent: "#6366f1", icon: "O" },
  { id: "IN_PROGRESS", label: "In Progress", accent: "#f59e0b", icon: "~" },
  { id: "DONE", label: "Done", accent: "#10b981", icon: "*" },
];

function colorFromId(id) {
  return PROJECT_COLORS[id % PROJECT_COLORS.length];
}

function Avatar({ name, color, size = 28 }) {
  const initials = (name || "NA").slice(0, 2).toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color || "#6366f1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
        border: "2px solid #1e1e2e",
        fontFamily: "inherit",
      }}
    >
      {initials}
    </div>
  );
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.04em",
        color: cfg.color,
        textTransform: "uppercase",
        background: `${cfg.color}18`,
        padding: "2px 7px",
        borderRadius: 20,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

function TagBadge({ tag }) {
  const color = TAG_COLORS[tag] || "#6366f1";
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.06em",
        color,
        background: `${color}22`,
        padding: "2px 8px",
        borderRadius: 20,
        textTransform: "uppercase",
      }}
    >
      {tag}
    </span>
  );
}

function TaskCard({ task, onStatusChange, projects }) {
  const project = projects.find((p) => p.id === task.projectId);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#1e1e35" : "#181828",
        border: `1px solid ${hovered ? "#6366f133" : "#2a2a40"}`,
        borderRadius: 14,
        padding: "14px 14px 12px",
        marginBottom: 10,
        transition: "all 0.18s ease",
        boxShadow: hovered ? "0 8px 24px #0008" : "0 2px 8px #0004",
        transform: hovered ? "translateY(-2px)" : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: project?.color || "#6366f1",
          borderRadius: "14px 0 0 14px",
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, paddingLeft: 6 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <TagBadge tag={task.tag} />
          <PriorityBadge priority={task.priority} />
        </div>
        <Avatar name={task.assignee} color={project?.color} size={24} />
      </div>

      <div style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0", marginBottom: 4, paddingLeft: 6, lineHeight: 1.4 }}>{task.title}</div>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12, paddingLeft: 6, lineHeight: 1.5 }}>{task.description || "Sem descricao"}</div>

      <div style={{ display: "flex", gap: 5, paddingLeft: 6, flexWrap: "wrap" }}>
        {COLUMNS.map((col) => (
          <button
            key={col.id}
            type="button"
            onClick={() => onStatusChange(task.id, col.id)}
            style={{
              padding: "3px 10px",
              borderRadius: 20,
              border: "none",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.04em",
              cursor: "pointer",
              background: task.status === col.id ? col.accent : "#2a2a40",
              color: task.status === col.id ? "#fff" : "#64748b",
              textTransform: "uppercase",
            }}
          >
            {col.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function KanbanColumn({ column, tasks, onStatusChange, projects }) {
  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 260,
        background: "#13131f",
        borderRadius: 18,
        border: "1px solid #2a2a40",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: "1px solid #2a2a40",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#16162a",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18, color: column.accent }}>{column.icon}</span>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#c7d2fe", letterSpacing: "0.05em", textTransform: "uppercase" }}>{column.label}</span>
        </div>
        <span style={{ background: `${column.accent}22`, color: column.accent, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 800 }}>
          {tasks.length}
        </span>
      </div>

      <div style={{ padding: "12px 10px", flex: 1, overflowY: "auto", minHeight: 120 }}>
        {tasks.length === 0 ? (
          <div style={{ textAlign: "center", color: "#2a2a50", fontSize: 12, paddingTop: 32, fontStyle: "italic" }}>Nenhuma tarefa aqui</div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} projects={projects} />)
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div
      style={{
        background: "#13131f",
        border: `1px solid ${accent}33`,
        borderRadius: 14,
        padding: "14px 16px",
        minWidth: 110,
      }}
    >
      <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("taskflow_token") || "");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskMeta, setTaskMeta] = useState({});

  const [selectedProject, setSelectedProject] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("board");
  const [showProjForm, setShowProjForm] = useState(false);

  const [projForm, setProjForm] = useState({ name: "", description: "" });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", status: "TODO", priority: "medium", tag: "task" });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    loadProjects();
  }, [token]);

  useEffect(() => {
    if (!selectedProject) {
      return;
    }
    loadTasks(selectedProject);
  }, [selectedProject]);

  const filteredTasks = useMemo(() => tasks.filter((t) => t.projectId === selectedProject), [tasks, selectedProject]);
  const currentProject = projects.find((p) => p.id === selectedProject);

  const todoCount = filteredTasks.filter((t) => t.status === "TODO").length;
  const inProgressCount = filteredTasks.filter((t) => t.status === "IN_PROGRESS").length;
  const doneCount = filteredTasks.filter((t) => t.status === "DONE").length;

  async function loadProjects() {
    try {
      const { data } = await api.get("/projects");
      const shaped = data.map((p) => ({ ...p, color: colorFromId(p.id) }));
      setProjects(shaped);
      if (shaped.length && !selectedProject) {
        setSelectedProject(shaped[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Nao foi possivel carregar projetos.");
    }
  }

  async function loadTasks(projectId) {
    try {
      const { data } = await api.get(`/projects/${projectId}/tasks`);
      const shaped = data.map((t) => ({
        id: t.id,
        projectId: t.project_id,
        title: t.title,
        description: t.description || "",
        status: t.status,
        priority: taskMeta[t.id]?.priority || "medium",
        assignee: taskMeta[t.id]?.assignee || "EU",
        tag: taskMeta[t.id]?.tag || "task",
      }));
      setTasks((prev) => [...prev.filter((t) => t.projectId !== projectId), ...shaped]);
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao carregar tarefas.");
    }
  }

  async function submitAuth(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (authMode === "register") {
        await api.post("/auth/register", authForm);
      }
      const { data } = await api.post("/auth/login", {
        email: authForm.email,
        password: authForm.password,
      });
      localStorage.setItem("taskflow_token", data.access_token);
      setToken(data.access_token);
    } catch (err) {
      setError(err.response?.data?.detail || "Falha de autenticacao.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(event) {
    event.preventDefault();
    if (!projForm.name.trim()) {
      return;
    }
    try {
      const { data } = await api.post("/projects", projForm);
      const newProj = { ...data, color: colorFromId(data.id) };
      setProjects((prev) => [...prev, newProj]);
      setSelectedProject(newProj.id);
      setProjForm({ name: "", description: "" });
      setShowProjForm(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao criar projeto.");
    }
  }

  async function handleCreateTask(event) {
    event.preventDefault();
    if (!taskForm.title.trim() || !selectedProject) {
      return;
    }

    try {
      const payload = {
        title: taskForm.title,
        description: taskForm.description,
        status: taskForm.status,
      };
      const { data } = await api.post(`/projects/${selectedProject}/tasks`, payload);

      setTaskMeta((prev) => ({
        ...prev,
        [data.id]: {
          priority: taskForm.priority,
          tag: taskForm.tag,
          assignee: "EU",
        },
      }));

      setTasks((prev) => [
        ...prev,
        {
          id: data.id,
          projectId: data.project_id,
          title: data.title,
          description: data.description || "",
          status: data.status,
          priority: taskForm.priority,
          tag: taskForm.tag,
          assignee: "EU",
        },
      ]);

      setTaskForm({ title: "", description: "", status: "TODO", priority: "medium", tag: "task" });
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao criar tarefa.");
    }
  }

  async function handleStatusChange(taskId, newStatus) {
    if (!selectedProject) {
      return;
    }
    try {
      await api.patch(`/projects/${selectedProject}/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao atualizar status.");
    }
  }

  function logout() {
    localStorage.removeItem("taskflow_token");
    setToken("");
    setProjects([]);
    setTasks([]);
    setSelectedProject(null);
  }

  const inputStyle = {
    background: "#0f0f1e",
    border: "1px solid #2a2a40",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#e2e8f0",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  };

  const selectStyle = { ...inputStyle, cursor: "pointer" };

  if (!token) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <h1>TaskFlow Manager</h1>
          <p>Board com UX moderna para projetos e tarefas.</p>
          <form onSubmit={submitAuth}>
            {authMode === "register" && (
              <input
                placeholder="Nome"
                value={authForm.name}
                onChange={(e) => setAuthForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            )}
            <input
              placeholder="Email"
              type="email"
              value={authForm.email}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
            <input
              placeholder="Senha"
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Carregando..." : authMode === "register" ? "Criar conta" : "Entrar"}
            </button>
          </form>
          <button className="auth-link" type="button" onClick={() => setAuthMode((prev) => (prev === "register" ? "login" : "register"))}>
            {authMode === "register" ? "Ja tenho conta" : "Criar conta nova"}
          </button>
          {error && <div className="auth-error">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0d0d1a",
        fontFamily: "'Manrope', 'Segoe UI', sans-serif",
        color: "#e2e8f0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: sidebarOpen ? 240 : 0,
          minWidth: sidebarOpen ? 240 : 0,
          background: "#0f0f1e",
          borderRight: "1px solid #1e1e35",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.25s ease",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #1e1e35" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 900,
                color: "#fff",
              }}
            >
              T
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#e2e8f0", letterSpacing: "-0.01em" }}>TaskFlow</div>
              <div style={{ fontSize: 10, color: "#475569", fontWeight: 500 }}>Manager</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "12px 10px" }}>
          {[
            { id: "board", icon: "#", label: "Board" },
            { id: "list", icon: "=", label: "Lista" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 9,
                border: "none",
                background: activeView === item.id ? "#6366f122" : "transparent",
                color: activeView === item.id ? "#a5b4fc" : "#64748b",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                marginBottom: 2,
                fontFamily: "inherit",
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "0 10px", flex: 1, overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 4px 6px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>Projetos</span>
            <button
              type="button"
              onClick={() => setShowProjForm((prev) => !prev)}
              style={{
                background: "#6366f122",
                border: "none",
                color: "#a5b4fc",
                width: 20,
                height: 20,
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              +
            </button>
          </div>

          {showProjForm && (
            <form onSubmit={handleCreateProject} style={{ marginBottom: 10 }}>
              <input value={projForm.name} onChange={(e) => setProjForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nome do projeto" style={{ ...inputStyle, marginBottom: 6, fontSize: 12 }} />
              <input value={projForm.description} onChange={(e) => setProjForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descricao" style={{ ...inputStyle, marginBottom: 6, fontSize: 12 }} />
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: 9,
                  border: "none",
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Criar Projeto
              </button>
            </form>
          )}

          {projects.map((proj) => (
            <button
              key={proj.id}
              type="button"
              onClick={() => setSelectedProject(proj.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 10,
                border: "none",
                background: selectedProject === proj.id ? `${proj.color}18` : "transparent",
                color: selectedProject === proj.id ? "#e2e8f0" : "#94a3b8",
                fontWeight: selectedProject === proj.id ? 700 : 500,
                fontSize: 13,
                cursor: "pointer",
                marginBottom: 2,
                fontFamily: "inherit",
                textAlign: "left",
                outline: selectedProject === proj.id ? `1px solid ${proj.color}44` : "none",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: proj.color, flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{proj.name}</span>
              <span style={{ marginLeft: "auto", fontSize: 10, color: "#475569" }}>{tasks.filter((t) => t.projectId === proj.id).length}</span>
            </button>
          ))}
        </div>

        <div style={{ padding: "14px 16px", borderTop: "1px solid #1e1e35", display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name="EU" color="#6366f1" size={30} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#c7d2fe" }}>Meu Workspace</div>
            <div style={{ fontSize: 10, color: "#475569" }}>Admin</div>
          </div>
          <button
            type="button"
            onClick={logout}
            style={{
              marginLeft: "auto",
              background: "#1e1e35",
              border: "none",
              color: "#64748b",
              borderRadius: 7,
              padding: "5px 8px",
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Sair
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e1e35", background: "#0f0f1e", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            style={{
              background: "#1e1e35",
              border: "none",
              color: "#94a3b8",
              width: 34,
              height: 34,
              borderRadius: 9,
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            =
          </button>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: currentProject?.color || "#6366f1", display: "inline-block" }} />
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#e2e8f0", letterSpacing: "-0.02em" }}>{currentProject?.name || "Projeto"}</h1>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "#475569" }}>{currentProject?.description || "Crie um projeto para iniciar."}</p>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
            <StatCard label="Total" value={filteredTasks.length} accent="#a5b4fc" />
            <StatCard label="A Fazer" value={todoCount} accent="#6366f1" />
            <StatCard label="Em Progresso" value={inProgressCount} accent="#f59e0b" />
            <StatCard label="Concluidas" value={doneCount} accent="#10b981" />
          </div>
        </div>

        <div style={{ padding: "14px 24px", background: "#0d0d1a", borderBottom: "1px solid #1e1e35" }}>
          <form onSubmit={handleCreateTask} style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
            <input value={taskForm.title} onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))} placeholder="Titulo da tarefa" style={{ ...inputStyle, flex: "2 1 160px" }} />
            <input value={taskForm.description} onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descricao" style={{ ...inputStyle, flex: "3 1 200px" }} />
            <select value={taskForm.priority} onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value }))} style={{ ...selectStyle, flex: "0 0 110px" }}>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baixa</option>
            </select>
            <select value={taskForm.tag} onChange={(e) => setTaskForm((f) => ({ ...f, tag: e.target.value }))} style={{ ...selectStyle, flex: "0 0 110px" }}>
              <option value="task">Task</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
              <option value="design">Design</option>
              <option value="devops">DevOps</option>
            </select>
            <select value={taskForm.status} onChange={(e) => setTaskForm((f) => ({ ...f, status: e.target.value }))} style={{ ...selectStyle, flex: "0 0 130px" }}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            <button
              type="submit"
              style={{
                padding: "10px 22px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Criar Tarefa
            </button>
          </form>
          {error && <div style={{ color: "#fca5a5", marginTop: 8, fontSize: 12 }}>{error}</div>}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {activeView === "board" ? (
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", minHeight: "100%", flexWrap: "wrap" }}>
              {COLUMNS.map((col) => (
                <KanbanColumn key={col.id} column={col} tasks={filteredTasks.filter((t) => t.status === col.id)} onStatusChange={handleStatusChange} projects={projects} />
              ))}
            </div>
          ) : (
            <div style={{ maxWidth: 900 }}>
              {filteredTasks.length === 0 && <div style={{ textAlign: "center", color: "#2a2a50", padding: 60, fontSize: 15 }}>Nenhuma tarefa neste projeto.</div>}
              {COLUMNS.map((col) => {
                const colTasks = filteredTasks.filter((t) => t.status === col.id);
                if (!colTasks.length) {
                  return null;
                }
                return (
                  <div key={col.id} style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 18, color: col.accent }}>{col.icon}</span>
                      <span style={{ fontWeight: 800, fontSize: 13, color: col.accent, textTransform: "uppercase", letterSpacing: "0.07em" }}>{col.label}</span>
                      <span style={{ background: `${col.accent}22`, color: col.accent, borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{colTasks.length}</span>
                    </div>
                    {colTasks.map((task) => {
                      const project = projects.find((p) => p.id === task.projectId);
                      return (
                        <div
                          key={task.id}
                          style={{
                            background: "#13131f",
                            border: "1px solid #2a2a40",
                            borderRadius: 12,
                            padding: "12px 16px",
                            marginBottom: 8,
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            borderLeft: `3px solid ${project?.color || "#6366f1"}`,
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 180 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0" }}>{task.title}</div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>{task.description || "Sem descricao"}</div>
                          </div>
                          <TagBadge tag={task.tag} />
                          <PriorityBadge priority={task.priority} />
                          <Avatar name={task.assignee} color={project?.color} size={26} />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
