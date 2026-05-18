import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getTasks } from "../features/tasks/taskApi";
import {
    resolveTaskStatus,
    type TaskStatus,
} from "../features/tasks/taskTypes";
import { PageLayout } from "../components/PageLayout";
import { formatDueDateDisplay } from "../utils/dueDate";

type Task = {
    id: number;
    title: string;
    description?: string;
    dueDate?: string;
    status: TaskStatus;
};

const normalizeTask = (backendTask: any): Task => {
    return {
        id: backendTask.id,
        title: backendTask.title || "Untitled task",
        description: backendTask.description,
        dueDate: backendTask.due_date || backendTask.dueDate || "",
        status: resolveTaskStatus(backendTask),
    };
};

const resolvePayload = (payload: any) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.tasks)) return payload.tasks;
    return [];
};

export default function Dashboard() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                const payload = await getTasks();
                const items = resolvePayload(payload);
                setTasks(items.map(normalizeTask));
            } catch (err) {
                console.error("Failed to load tasks:", err);
                setError("Unable to load recent tasks.");
            } finally {
                setLoading(false);
            }
        };

        loadTasks();
    }, []);

    const completedCount = tasks.filter(
        (task) => task.status === "completed",
    ).length;
    const pendingCount = tasks.length - completedCount;
    const recentTasks = tasks.slice(0, 4);

    return (
        <PageLayout title="Dashboard">
            <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm uppercase tracking-[0.16em] text-slate-500">
                            Total tasks
                        </p>
                        <h3 className="mt-4 text-3xl font-semibold text-slate-900">
                            {tasks.length}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Tasks pulled from your backend API.
                        </p>
                    </div>
                    <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm uppercase tracking-[0.16em] text-slate-500">
                            Completed
                        </p>
                        <h3 className="mt-4 text-3xl font-semibold text-slate-900">
                            {completedCount}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Completed tasks from the current session.
                        </p>
                    </div>
                    <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm uppercase tracking-[0.16em] text-slate-500">
                            Pending
                        </p>
                        <h3 className="mt-4 text-3xl font-semibold text-slate-900">
                            {pendingCount}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Tasks still waiting for updates.
                        </p>
                    </div>
                    <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm uppercase tracking-[0.16em] text-slate-500">
                            Quick view
                        </p>
                        <h3 className="mt-4 text-3xl font-semibold text-slate-900">
                            API-powered
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Existing authentication and CSRF logic stays intact.
                        </p>
                    </div>
                </div>

                <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">
                                Placeholder charts
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Charts remain static for now until a chart
                                library is added.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 space-y-4">
                        <div className="h-24 rounded-3xl bg-slate-100" />
                        <div className="h-24 rounded-3xl bg-slate-100" />
                    </div>
                </div>
            </section>

            <section className="mt-10">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                            Recent tasks
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            A quick look at tasks from your task API.
                        </p>
                    </div>
                    <Link
                        to="/tasks"
                        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                        Open task board
                    </Link>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="rounded-4xl border border-slate-200 bg-white p-6 text-slate-500">
                            Loading tasks...
                        </div>
                    ) : error ? (
                        <div className="rounded-4xl border border-red-200 bg-red-50 p-6 text-red-700">
                            {error}
                        </div>
                    ) : recentTasks.length === 0 ? (
                        <div className="rounded-4xl border border-slate-200 bg-white p-6 text-slate-600">
                            No recent tasks found.
                        </div>
                    ) : (
                        recentTasks.map((task) => (
                            <div
                                key={task.id}
                                className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">
                                            {task.dueDate
                                                ? `Due ${formatDueDateDisplay(task.dueDate)}`
                                                : "No due date"}
                                        </p>
                                        <h3 className="mt-2 text-lg font-semibold text-slate-900">
                                            {task.title}
                                        </h3>
                                    </div>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${task.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}
                                    >
                                        {task.status === "completed"
                                            ? "Completed"
                                            : "Open"}
                                    </span>
                                </div>
                                {task.description ? (
                                    <p className="mt-4 text-sm leading-6 text-slate-600">
                                        {task.description}
                                    </p>
                                ) : null}
                            </div>
                        ))
                    )}
                </div>
            </section>
        </PageLayout>
    );
}
