import { useEffect, useMemo, useState } from "react";
import api, { setAuthToken } from "./lib/api";

const COLUMNS = [
  { key: "TODO", label: "TODO", tint: "bg-amber-100 border-amber-300" },
  { key: "IN_PROGRESS", label: "IN PROGRESS", tint: "bg-sky-100 border-sky-300" },
  { key: "DONE", label: "DONE", tint: "bg-emerald-100 border-emerald-300" },
];

function App() {
  const [token, setToken] = useState(localStorage.getItem("taskflow_token") || "");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });

  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", status: "TODO" });
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [metrics, setMetrics] = useState({ total_projects: 0, total_tasks: 0, by_status: { TODO: 0, IN_PROGRESS: 0, DONE: 0 } });
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
    loadMetrics();
  }, [token]);

  useEffect(() => {
    if (selectedProjectId) {
      loadTasks(selectedProjectId);
    }
  }, [selectedProjectId]);

  const tasksByStatus = useMemo(() => {
    return COLUMNS.reduce((acc, column) => {
      acc[column.key] = tasks.filter((task) => task.status === column.key);
      return acc;
    }, {});
  }, [tasks]);

  const loadProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data);
      if (!selectedProjectId && data.length > 0) {
        setSelectedProjectId(data[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Nao foi possivel carregar projetos.");
    }
  };

  const loadTasks = async (projectId) => {
    try {
      const { data } = await api.get(`/projects/${projectId}/tasks`);
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao carregar tarefas.");
    }
  };

  const loadMetrics = async () => {
    try {
      const { data } = await api.get("/dashboard/metrics");
      setMetrics(data);
    } catch {
      // Dashboard is optional and should not block app flow.
    }
  };

  const submitAuth = async (event) => {
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
  };

  const submitProject = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await api.post("/projects", projectForm);
      setProjectForm({ name: "", description: "" });
      await loadProjects();
      await loadMetrics();
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao criar projeto.");
    }
  };

  const submitTask = async (event) => {
    event.preventDefault();
    if (!selectedProjectId) {
      setError("Crie e selecione um projeto antes de adicionar tarefas.");
      return;
    }

    try {
      if (editingTaskId) {
        await api.patch(`/projects/${selectedProjectId}/tasks/${editingTaskId}`, taskForm);
      } else {
        await api.post(`/projects/${selectedProjectId}/tasks`, taskForm);
      }
      setTaskForm({ title: "", description: "", status: "TODO" });
      setEditingTaskId(null);
      await loadTasks(selectedProjectId);
      await loadMetrics();
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao salvar tarefa.");
    }
  };

  const startEditTask = (task) => {
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
    });
  };

  const updateTaskStatus = async (taskId, status) => {
    if (!selectedProjectId) {
      return;
    }
    try {
      await api.patch(`/projects/${selectedProjectId}/tasks/${taskId}`, { status });
      await loadTasks(selectedProjectId);
      await loadMetrics();
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao atualizar status.");
    }
  };

  const logout = () => {
    localStorage.removeItem("taskflow_token");
    setToken("");
    setProjects([]);
    setTasks([]);
    setSelectedProjectId(null);
  };

  if (!token) {
    return (
      <main className="min-h-screen p-6 sm:p-10 grid place-items-center">
        <section className="panel w-full max-w-md p-8 card-enter">
          <h1 className="font-display text-3xl">TaskFlow Manager</h1>
          <p className="mt-2 text-sm text-ink/70">Gestao de projetos estilo Jira/Trello com FastAPI + React.</p>

          <form className="mt-6 space-y-3" onSubmit={submitAuth}>
            {authMode === "register" && (
              <input
                className="w-full rounded-xl border border-ink/20 bg-white px-4 py-2"
                placeholder="Nome"
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                required
              />
            )}
            <input
              className="w-full rounded-xl border border-ink/20 bg-white px-4 py-2"
              placeholder="Email"
              type="email"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              required
            />
            <input
              className="w-full rounded-xl border border-ink/20 bg-white px-4 py-2"
              placeholder="Senha"
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              required
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-ocean px-4 py-2 font-semibold text-white transition hover:brightness-110"
              disabled={loading}
            >
              {loading ? "Carregando..." : authMode === "register" ? "Criar conta" : "Entrar"}
            </button>
          </form>

          <button
            className="mt-4 text-sm text-ocean underline"
            onClick={() => setAuthMode(authMode === "register" ? "login" : "register")}
          >
            {authMode === "register" ? "Ja tenho conta" : "Criar conta nova"}
          </button>

          {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <header className="panel p-5 card-enter flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl">TaskFlow Manager</h1>
          <p className="text-sm text-ink/70">Kanban para organizar TODO, IN PROGRESS e DONE.</p>
        </div>
        <button className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white" onClick={logout}>
          Sair
        </button>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <article className="panel p-4">
          <h2 className="font-display text-lg">Projetos</h2>
          <p className="text-sm text-ink/60">{metrics.total_projects} projetos</p>
        </article>
        <article className="panel p-4">
          <h2 className="font-display text-lg">Tarefas</h2>
          <p className="text-sm text-ink/60">{metrics.total_tasks} tarefas</p>
        </article>
        <article className="panel p-4">
          <h2 className="font-display text-lg">Concluidas</h2>
          <p className="text-sm text-ink/60">{metrics.by_status?.DONE || 0} tarefas em DONE</p>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="panel p-4 space-y-4 h-fit">
          <form className="space-y-2" onSubmit={submitProject}>
            <input
              className="w-full rounded-xl border border-ink/20 bg-white px-3 py-2"
              placeholder="Nome do projeto"
              value={projectForm.name}
              onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
              required
            />
            <textarea
              className="w-full rounded-xl border border-ink/20 bg-white px-3 py-2"
              placeholder="Descricao"
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              rows={3}
            />
            <button className="w-full rounded-xl bg-copper px-3 py-2 text-sm font-semibold text-white">Criar projeto</button>
          </form>

          <div className="space-y-2">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                  selectedProjectId === project.id ? "border-ocean bg-sky-50" : "border-ink/20 bg-white"
                }`}
              >
                <p className="font-semibold">{project.name}</p>
                <p className="text-xs text-ink/60 line-clamp-2">{project.description || "Sem descricao"}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-5">
          <form className="panel p-4 grid gap-2 sm:grid-cols-4" onSubmit={submitTask}>
            <input
              className="rounded-xl border border-ink/20 bg-white px-3 py-2 sm:col-span-1"
              placeholder="Titulo"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              required
            />
            <input
              className="rounded-xl border border-ink/20 bg-white px-3 py-2 sm:col-span-2"
              placeholder="Descricao"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            />
            <select
              className="rounded-xl border border-ink/20 bg-white px-3 py-2"
              value={taskForm.status}
              onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
            >
              {COLUMNS.map((col) => (
                <option key={col.key} value={col.key}>
                  {col.label}
                </option>
              ))}
            </select>
            <button className="rounded-xl bg-mint px-3 py-2 text-sm font-semibold text-white sm:col-span-4">
              {editingTaskId ? "Salvar edicao" : "Criar tarefa"}
            </button>
          </form>

          <div className="grid gap-4 xl:grid-cols-3">
            {COLUMNS.map((column) => (
              <article key={column.key} className={`panel p-3 border ${column.tint}`}>
                <h3 className="font-display text-lg">{column.label}</h3>
                <div className="mt-3 space-y-3">
                  {tasksByStatus[column.key]?.map((task) => (
                    <div key={task.id} className="rounded-xl border border-ink/20 bg-white p-3 card-enter">
                      <p className="font-semibold">{task.title}</p>
                      <p className="mt-1 text-sm text-ink/70">{task.description || "Sem descricao"}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {COLUMNS.map((next) => (
                          <button
                            key={next.key}
                            className="rounded-lg border border-ink/15 px-2 py-1 text-xs"
                            onClick={() => updateTaskStatus(task.id, next.key)}
                          >
                            {next.label}
                          </button>
                        ))}
                        <button
                          className="rounded-lg bg-ink px-2 py-1 text-xs text-white"
                          onClick={() => startEditTask(task)}
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
    </main>
  );
}

export default App;
