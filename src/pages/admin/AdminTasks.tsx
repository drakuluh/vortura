import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Plus, Search, Play } from "lucide-react";
import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const API_BASE = "https://vortura-production.up.railway.app";

type TaskStatus = "pending" | "running" | "done" | "error" | string;

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  completedAt?: string | null;
  prompt?: string;
}

const mapTask = (raw: any): Task => ({
  id: String(raw.id ?? raw._id ?? crypto.randomUUID()),
  title: raw.title ?? raw.prompt ?? raw.name ?? "Untitled task",
  status: raw.status ?? "pending",
  completedAt: raw.completedAt ?? raw.completed_at ?? null,
  prompt: raw.prompt,
});

const statusBadgeClasses = (status: TaskStatus) => {
  switch (status) {
    case "done":
      return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
    case "error":
      return "text-destructive border-destructive/40 bg-destructive/10";
    case "running":
      return "text-primary border-primary/30 bg-primary/10";
    case "pending":
    default:
      return "text-muted-foreground border-white/10 bg-white/[0.04]";
  }
};

const StatusBadge = ({ status }: { status: TaskStatus }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border font-mono text-[11px] uppercase tracking-widest whitespace-nowrap",
      statusBadgeClasses(status)
    )}
  >
    {status}
  </span>
);

const formatCompletedAt = (d?: string | null) => {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleString();
};

const KpiCard = ({ label, value }: { label: string; value: string }) => (
  <div className="glass rounded-2xl p-4">
    <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">{label}</p>
    <p className="text-xl font-bold tracking-tight">{value}</p>
  </div>
);

export default function AdminTasks() {
  const [taskHistorySearch, setTaskHistorySearch] = useState("");
  const [activeTasksSearch, setActiveTasksSearch] = useState("");
  const [pipelinesSearch, setPipelinesSearch] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [creating, setCreating] = useState(false);
  const pollersRef = useRef<Map<string, number>>(new Map());

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks`);
      if (!res.ok) throw new Error(`Failed to load tasks (${res.status})`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.tasks ?? [];
      setTasks(arr.map(mapTask));
    } catch (e: any) {
      toast.error(e?.message || "Failed to load tasks.");
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const stopPolling = useCallback((id: string) => {
    const handle = pollersRef.current.get(id);
    if (handle) {
      window.clearInterval(handle);
      pollersRef.current.delete(id);
    }
  }, []);

  const startPolling = useCallback((id: string) => {
    if (pollersRef.current.has(id)) return;
    const handle = window.setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tasks/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        const updated = mapTask(data);
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
        if (updated.status === "done" || updated.status === "error") {
          stopPolling(id);
        }
      } catch {
        /* swallow */
      }
    }, 3000);
    pollersRef.current.set(id, handle);
  }, [stopPolling]);

  useEffect(() => {
    return () => {
      pollersRef.current.forEach((h) => window.clearInterval(h));
      pollersRef.current.clear();
    };
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "done").length;
    const overdue = tasks.filter((t) => t.status === "error").length;
    const rate = total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%";
    return {
      total: String(total),
      completed: String(completed),
      overdue: String(overdue),
      rate,
    };
  }, [tasks]);

  const activeTasks = useMemo(() => {
    const q = activeTasksSearch.trim().toLowerCase();
    return tasks
      .filter((t) => t.status === "pending" || t.status === "running")
      .filter((t) => (q ? t.title.toLowerCase().includes(q) : true));
  }, [tasks, activeTasksSearch]);

  const historyTasks = useMemo(() => {
    const q = taskHistorySearch.trim().toLowerCase();
    return tasks
      .filter((t) => t.status === "done" || t.status === "error")
      .filter((t) => (q ? t.title.toLowerCase().includes(q) : true));
  }, [tasks, taskHistorySearch]);

  const handleCreate = async () => {
    if (!newPrompt.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: newPrompt }),
      });
      if (!res.ok) throw new Error(`Create failed (${res.status})`);
      toast.success("Task created.");
      setNewPrompt("");
      setNewTaskOpen(false);
      await fetchTasks();
    } catch (e: any) {
      toast.error(e?.message || "Failed to create task.");
    } finally {
      setCreating(false);
    }
  };

  const handleRun = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${id}/run`, { method: "POST" });
      if (!res.ok) throw new Error(`Run failed (${res.status})`);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "running" } : t)));
      startPolling(id);
    } catch (e: any) {
      toast.error(e?.message || "Failed to run task.");
    }
  };

  return (
    <AdminPage
      eyebrow="Tasks"
      title="Tasks"
      description="Manage team tasks, track progress, and monitor pipelines."
    >
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
        <KpiCard label="Total Tasks" value={stats.total} />
        <KpiCard label="Completed" value={stats.completed} />
        <KpiCard label="Overdue" value={stats.overdue} />
        <KpiCard label="Completion Rate" value={stats.rate} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 items-stretch">
        {/* Left column: Active Tasks + Pipelines */}
        <div className="lg:col-span-2 flex flex-col gap-4 md:gap-5">
          {/* Active Tasks */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="font-mono text-[11px] uppercase tracking-widest text-primary whitespace-nowrap">// Active Tasks</p>
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  value={activeTasksSearch}
                  onChange={(e) => setActiveTasksSearch(e.target.value)}
                  placeholder="Search active tasks…"
                  className="pl-9 h-8"
                />
              </div>
              <Button variant="hero" size="sm" onClick={() => setNewTaskOpen(true)}>
                <Plus className="w-3.5 h-3.5" />
                New Task
              </Button>
            </div>
            {activeTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active tasks yet.</p>
            ) : (
              <ul className="divide-y divide-white/[0.05]">
                {activeTasks.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                    <p className="text-[13px] truncate">{t.title}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={t.status} />
                      {t.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Run task"
                          onClick={() => handleRun(t.id)}
                        >
                          <Play className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pipelines */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="font-mono text-[11px] uppercase tracking-widest text-primary whitespace-nowrap">// Pipelines</p>
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  value={pipelinesSearch}
                  onChange={(e) => setPipelinesSearch(e.target.value)}
                  placeholder="Search pipelines…"
                  className="pl-9 h-8"
                />
              </div>
              <Button variant="hero" size="sm">
                <Plus className="w-3.5 h-3.5" />
                Create Pipeline
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">No pipelines configured yet.</p>
          </div>
        </div>

        {/* Right column: Task History */}
        <div className="glass rounded-2xl p-5 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-primary">// Task History</p>
          </div>
          <div className="relative mb-4">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={taskHistorySearch}
              onChange={(e) => setTaskHistorySearch(e.target.value)}
              placeholder="Search task history…"
              className="pl-9"
            />
          </div>
          {historyTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No task history yet.</p>
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {historyTasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[13px] truncate">{t.title}</p>
                    {t.completedAt && (
                      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mt-0.5">
                        {formatCompletedAt(t.completedAt)}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={t.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Dialog open={newTaskOpen} onOpenChange={(o) => { if (!creating) setNewTaskOpen(o); }}>
        <DialogContent hideClose className="sm:max-w-lg border-2 border-white/15 bg-card text-foreground">
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
          </DialogHeader>
          <Textarea
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            placeholder="Describe the task…"
            rows={5}
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setNewTaskOpen(false)}
              disabled={creating}
              className="hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button variant="hero" onClick={handleCreate} disabled={creating || !newPrompt.trim()}>
              {creating ? "Creating…" : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
