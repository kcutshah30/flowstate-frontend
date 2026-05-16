import { useEffect, useMemo, useRef, useState } from "react";
import { PageLayout } from "../components/PageLayout";
import {
    createTask,
    deleteTask,
    getTasks,
    updateTask,
} from "../features/tasks/taskApi";

type TaskStatus = "todo" | "in_progress" | "completed";

type TaskPriority = "critical" | "high" | "medium" | "low";

type Task = {
    id: number;
    title: string;
    description?: string;
    dueDate?: string;
    completed: boolean;
    status: TaskStatus;
    priority: TaskPriority;
};

const normalizeTask = (backendTask: any): Task => {
    const completed = !!backendTask.completed;
    const rawPriority =
        backendTask.priority || backendTask.priority_level || "medium";
    const priority = ["critical", "high", "medium", "low"].includes(rawPriority)
        ? rawPriority
        : "medium";

    return {
        id: backendTask.id,
        title: backendTask.title || "Untitled task",
        description: backendTask.description,
        dueDate: backendTask.due_date || backendTask.dueDate || "",
        completed,
        status: backendTask.status || (completed ? "completed" : "todo"),
        priority: priority as TaskPriority,
    };
};

const resolvePayload = (payload: any) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.tasks)) return payload.tasks;
    return [];
};

const resolveTask = (payload: any): Task | null => {
    const record = payload?.data || payload?.task || payload;
    if (!record || typeof record !== "object") return null;
    return normalizeTask(record);
};

const priorityStyleMap: Record<
    TaskPriority,
    { label: string; classes: string }
> = {
    critical: { label: "Critical", classes: "bg-red-100 text-red-700" },
    high: { label: "High", classes: "bg-amber-100 text-amber-700" },
    medium: { label: "Medium", classes: "bg-sky-100 text-sky-700" },
    low: { label: "Low", classes: "bg-emerald-100 text-emerald-700" },
};

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("medium");
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [saving, setSaving] = useState(false);
    const editTitleRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                const payload = await getTasks();
                const items = resolvePayload(payload);
                setTasks(items.map(normalizeTask));
            } catch (err) {
                console.error("Failed to load tasks:", err);
                setError("Unable to load task board.");
            }
        };

        loadTasks();
    }, []);

    const columns = useMemo(
        () => ({
            todo: tasks.filter((task) => task.status === "todo"),
            in_progress: tasks.filter((task) => task.status === "in_progress"),
            completed: tasks.filter((task) => task.status === "completed"),
        }),
        [tasks],
    );

    const handleCreateTask = async () => {
        if (!title.trim()) return;
        setSaving(true);
        try {
            const payload = await createTask({
                title: title.trim(),
                description: description.trim() || undefined,
                dueDate: dueDate || undefined,
                priority,
            });
            const newTask = resolveTask(payload);
            if (newTask) {
                setTasks((current) => [newTask, ...current]);
                setTitle("");
                setDescription("");
                setDueDate("");
                setPriority("medium");
            }
        } catch (err) {
            console.error("Failed to create task:", err);
            setError("Could not create new task.");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveTask = async () => {
        if (!editingTask) return;
        setSaving(true);
        try {
            const payload = await updateTask(editingTask.id, {
                title: editingTask.title,
                description: editingTask.description,
                dueDate: editingTask.dueDate,
                completed: editingTask.completed,
                priority: editingTask.priority,
            });
            const updatedTask = resolveTask(payload);
            if (updatedTask) {
                setTasks((current) =>
                    current.map((task) =>
                        task.id === updatedTask.id ? updatedTask : task,
                    ),
                );
                setEditingTask(null);
            }
        } catch (err) {
            console.error("Failed to update task:", err);
            setError("Could not save task changes.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTask = async (id: number) => {
        if (!confirm("Delete this task?")) return;
        try {
            await deleteTask(id);
            setTasks((current) => current.filter((task) => task.id !== id));
        } catch (err) {
            console.error("Failed to delete task:", err);
            setError("Could not delete task.");
        }
    };

    const handleChangeStatus = async (task: Task, status: TaskStatus) => {
        if (status === "in_progress") {
            setTasks((current) =>
                current.map((item) =>
                    item.id === task.id
                        ? { ...item, status: "in_progress" }
                        : item,
                ),
            );
            return;
        }

        try {
            const payload = await updateTask(task.id, {
                completed: status === "completed",
            });
            const updatedTask = resolveTask(payload);
            if (updatedTask) {
                setTasks((current) =>
                    current.map((item) =>
                        item.id === updatedTask.id ? updatedTask : item,
                    ),
                );
            }
        } catch (err) {
            console.error("Failed to update status:", err);
            setError("Could not move task.");
        }
    };

    const activeTask = editingTask ?? null;

    useEffect(() => {
        if (!editingTask || !editTitleRef.current) return;
        editTitleRef.current.scrollIntoView({
            block: "center",
            behavior: "smooth",
        });
        editTitleRef.current.focus({ preventScroll: true });
    }, [editingTask]);

    return (
        <PageLayout title="Tasks">
            <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">
                                Task board
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Create, edit, delete, and move tasks across
                                columns.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        {error ? (
                            <div className="rounded-[1.75rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        ) : null}

                        <div className="grid gap-3 sm:grid-cols-2">
                            <input
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                                placeholder="Task title"
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                            />
                            <input
                                value={dueDate}
                                onChange={(event) =>
                                    setDueDate(event.target.value)
                                }
                                type="date"
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                            />
                        </div>
                        <div className="mt-3">
                            <select
                                value={priority}
                                onChange={(event) =>
                                    setPriority(
                                        event.target.value as TaskPriority,
                                    )
                                }
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                            >
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        <textarea
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            placeholder="Description (optional)"
                            className="min-h-[96px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        />
                        <button
                            type="button"
                            onClick={handleCreateTask}
                            disabled={saving}
                            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Add task"}
                        </button>
                    </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-900">
                        Board status
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Drag and drop is not enabled yet; use the buttons to
                        move tasks.
                    </p>
                    <div className="mt-6 space-y-4">
                        <div className="rounded-3xl bg-slate-100 p-4">
                            <p className="text-sm font-semibold text-slate-900">
                                Todo
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                                Tasks that need to start.
                            </p>
                        </div>
                        <div className="rounded-3xl bg-slate-100 p-4">
                            <p className="text-sm font-semibold text-slate-900">
                                In Progress
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                                Tasks you are actively working on.
                            </p>
                        </div>
                        <div className="rounded-3xl bg-slate-100 p-4">
                            <p className="text-sm font-semibold text-slate-900">
                                Completed
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                                Tasks finished and synced with your API.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <section className="mt-8 grid gap-4 xl:grid-cols-3">
                {(["todo", "in_progress", "completed"] as TaskStatus[]).map(
                    (columnKey) => {
                        const columnTasks = columns[columnKey];
                        const title =
                            columnKey === "todo"
                                ? "Todo"
                                : columnKey === "in_progress"
                                  ? "In Progress"
                                  : "Completed";

                        return (
                            <div
                                key={columnKey}
                                className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <h3 className="text-lg font-semibold text-slate-900">
                                    {title}
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    {columnTasks.length} task
                                    {columnTasks.length === 1 ? "" : "s"}
                                </p>
                                <div className="mt-5 space-y-4">
                                    {columnTasks.length === 0 ? (
                                        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                                            No tasks here yet.
                                        </div>
                                    ) : (
                                        columnTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-slate-900">
                                                            {task.title}
                                                        </h4>
                                                        {task.dueDate ? (
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                Due{" "}
                                                                {task.dueDate}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyleMap[task.priority].classes}`}
                                                        >
                                                            {
                                                                priorityStyleMap[
                                                                    task
                                                                        .priority
                                                                ].label
                                                            }
                                                        </span>
                                                        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                                                            {task.status.replace(
                                                                "_",
                                                                " ",
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                {task.description ? (
                                                    <p className="mt-3 text-sm text-slate-600">
                                                        {task.description}
                                                    </p>
                                                ) : null}
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {columnKey !==
                                                    "completed" ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleChangeStatus(
                                                                    task,
                                                                    "completed",
                                                                )
                                                            }
                                                            className="rounded-full bg-emerald-900 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                                                        >
                                                            {columnKey ===
                                                            "todo"
                                                                ? "Mark Complete"
                                                                : "Finish"}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleChangeStatus(
                                                                    task,
                                                                    "todo",
                                                                )
                                                            }
                                                            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                                                        >
                                                            Move to Todo
                                                        </button>
                                                    )}
                                                    {columnKey === "todo" ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleChangeStatus(
                                                                    task,
                                                                    "in_progress",
                                                                )
                                                            }
                                                            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                                                        >
                                                            Start
                                                        </button>
                                                    ) : null}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditingTask(task)
                                                        }
                                                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteTask(
                                                                task.id,
                                                            )
                                                        }
                                                        className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    },
                )}
            </section>

            {activeTask ? (
                <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                                Edit task
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Update the selected task and save changes.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setEditingTask(null)}
                            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <input
                            ref={editTitleRef}
                            value={activeTask.title}
                            onChange={(event) =>
                                setEditingTask({
                                    ...activeTask,
                                    title: event.target.value,
                                })
                            }
                            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        />
                        <input
                            type="date"
                            value={activeTask.dueDate}
                            onChange={(event) =>
                                setEditingTask({
                                    ...activeTask,
                                    dueDate: event.target.value,
                                })
                            }
                            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        />
                    </div>
                    <div className="mt-4">
                        <select
                            value={activeTask.priority}
                            onChange={(event) =>
                                setEditingTask({
                                    ...activeTask,
                                    priority: event.target
                                        .value as TaskPriority,
                                })
                            }
                            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        >
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                    <textarea
                        value={activeTask.description || ""}
                        onChange={(event) =>
                            setEditingTask({
                                ...activeTask,
                                description: event.target.value,
                            })
                        }
                        className="mt-4 min-h-[96px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        placeholder="Description"
                    />
                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleSaveTask}
                            disabled={saving}
                            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save changes"}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setEditingTask({
                                    ...activeTask,
                                    status: "in_progress",
                                })
                            }
                            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Set in progress
                        </button>
                    </div>
                </div>
            ) : null}
        </PageLayout>
    );
}
