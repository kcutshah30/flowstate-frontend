import { useEffect, useMemo, useRef, useState } from "react";
import { PageLayout } from "../components/PageLayout";
import { TagMultiSelect } from "../components/TagMultiSelect";
import {
    createTask,
    deleteTask,
    getCategories,
    getTasks,
    getTags,
    updateTask,
} from "../features/tasks/taskApi";
import {
    TASK_PRIORITY_META,
    getCategoryMeta,
    getPriorityMeta,
} from "../config/taskMeta";

type TaskStatus = "todo" | "in_progress" | "completed";

type TaskPriority = "critical" | "high" | "medium" | "low";

type Category = {
    id: number;
    name: string;
    slug: string;
    color?: string;
    icon?: string;
};

type Tag = {
    id: number;
    name: string;
    slug: string;
};

type Task = {
    id: number;
    title: string;
    description?: string;
    dueDate?: string;
    completed: boolean;
    status: TaskStatus;
    priority: TaskPriority;
    categoryId?: number;
    category?: Category | null;
    tags: Tag[];
};

const normalizeTagOption = (tag: any): Tag | null => {
    if (!tag || typeof tag !== "object") return null;
    const id = Number(tag.id);
    if (!Number.isFinite(id)) return null;
    return {
        id,
        name: tag.name || tag.slug || "",
        slug: tag.slug || tag.name || "",
    };
};

const normalizeTags = (backendTags: any): Tag[] => {
    if (!Array.isArray(backendTags)) return [];
    return backendTags
        .map(normalizeTagOption)
        .filter((tag): tag is Tag => tag !== null);
};

const normalizeTask = (backendTask: any): Task => {
    const completed = !!backendTask.completed;
    const rawPriority =
        backendTask.priority || backendTask.priority_level || "medium";
    const category =
        backendTask.category || backendTask.category_object || null;
    const categoryId = backendTask.category_id || category?.id || undefined;
    const priority = getPriorityMeta(rawPriority).key as TaskPriority;
    const tags = normalizeTags(
        backendTask.tags || backendTask.tag_objects || [],
    );

    return {
        id: backendTask.id,
        title: backendTask.title || "Untitled task",
        description: backendTask.description,
        dueDate: backendTask.due_date || backendTask.dueDate || "",
        completed,
        status: backendTask.status || (completed ? "completed" : "todo"),
        priority,
        categoryId,
        category,
        tags,
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

const priorityOptions = Object.keys(TASK_PRIORITY_META) as TaskPriority[];

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<
        number | "all"
    >("all");
    const [selectedTagId, setSelectedTagId] = useState<number | "all">("all");
    const [createCategoryId, setCreateCategoryId] = useState<
        number | undefined
    >(undefined);
    const [createTagIds, setCreateTagIds] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    const getCategoryById = (categoryId?: number) => {
        return (
            categories.find((category) => category.id === categoryId) ?? null
        );
    };

    const normalizeResolvedTask = (task: Task, categoryId?: number) => {
        const resolvedCategory = task.category?.slug
            ? task.category
            : categoryId
              ? getCategoryById(categoryId)
              : null;

        return {
            ...task,
            category: resolvedCategory,
        };
    };
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("medium");
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [saving, setSaving] = useState(false);
    const editTitleRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const loadTasksAndCategories = async () => {
            try {
                const [tasksPayload, categoriesPayload, tagsPayload] =
                    await Promise.all([getTasks(), getCategories(), getTags()]);
                const items = resolvePayload(tasksPayload);
                const categoryItems = Array.isArray(categoriesPayload)
                    ? categoriesPayload
                    : Array.isArray(categoriesPayload.data)
                      ? categoriesPayload.data
                      : Array.isArray(categoriesPayload.categories)
                        ? categoriesPayload.categories
                        : [];
                const tagItems = Array.isArray(tagsPayload)
                    ? tagsPayload
                    : Array.isArray(tagsPayload.data)
                      ? tagsPayload.data
                      : Array.isArray(tagsPayload.tags)
                        ? tagsPayload.tags
                        : [];

                setTasks(items.map(normalizeTask));
                setCategories(categoryItems);
                setTags(
                    tagItems
                        .map(normalizeTagOption)
                        .filter((tag): tag is Tag => tag !== null),
                );
            } catch (err) {
                console.error("Failed to load tasks or categories:", err);
                setError("Unable to load task board.");
            }
        };

        loadTasksAndCategories();
    }, []);

    const filteredTasks = tasks.filter((task) => {
        const categoryMatches =
            selectedCategoryId === "all" ||
            task.categoryId === selectedCategoryId;
        const tagMatches =
            selectedTagId === "all" ||
            task.tags.some((tag) => tag.id === selectedTagId);
        return categoryMatches && tagMatches;
    });

    const columns = useMemo(
        () => ({
            todo: filteredTasks.filter((task) => task.status === "todo"),
            in_progress: filteredTasks.filter(
                (task) => task.status === "in_progress",
            ),
            completed: filteredTasks.filter(
                (task) => task.status === "completed",
            ),
        }),
        [filteredTasks],
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
                category_id:
                    createCategoryId !== undefined ? createCategoryId : null,
                tags: createTagIds,
            });
            const newTask = resolveTask(payload);
            if (newTask) {
                const taskWithCategory = normalizeResolvedTask(
                    newTask,
                    createCategoryId,
                );
                setTasks((current) => [taskWithCategory, ...current]);
                setTitle("");
                setDescription("");
                setDueDate("");
                setPriority("medium");
                setCreateCategoryId(undefined);
                setCreateTagIds([]);
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
                category_id:
                    editingTask.categoryId !== undefined
                        ? editingTask.categoryId
                        : null,
                tags: editingTask.tags.map((tag) => tag.id),
            });
            const updatedTask = resolveTask(payload);
            if (updatedTask) {
                const taskWithCategory = normalizeResolvedTask(
                    updatedTask,
                    editingTask.categoryId,
                );
                setTasks((current) =>
                    current.map((task) =>
                        task.id === taskWithCategory.id
                            ? taskWithCategory
                            : task,
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
                        <div className="grid gap-3 min-w-[220px]">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-600">
                                    Filter by category
                                </label>
                                <select
                                    value={selectedCategoryId}
                                    onChange={(event) =>
                                        setSelectedCategoryId(
                                            event.target.value === "all"
                                                ? "all"
                                                : Number(event.target.value),
                                        )
                                    }
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                >
                                    <option value="all">All categories</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-600">
                                    Filter by tag
                                </label>
                                <select
                                    value={selectedTagId}
                                    onChange={(event) =>
                                        setSelectedTagId(
                                            event.target.value === "all"
                                                ? "all"
                                                : Number(event.target.value),
                                        )
                                    }
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                >
                                    <option value="all">All tags</option>
                                    {tags.map((tag) => (
                                        <option key={tag.id} value={tag.id}>
                                            {tag.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
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
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <select
                                    value={priority}
                                    onChange={(event) =>
                                        setPriority(
                                            event.target.value as TaskPriority,
                                        )
                                    }
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                >
                                    {priorityOptions.map((priorityKey) => {
                                        const meta =
                                            getPriorityMeta(priorityKey);
                                        return (
                                            <option
                                                key={priorityKey}
                                                value={priorityKey}
                                            >
                                                {meta.emoji} {meta.label}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div>
                                <select
                                    value={createCategoryId ?? ""}
                                    onChange={(event) =>
                                        setCreateCategoryId(
                                            event.target.value
                                                ? Number(event.target.value)
                                                : undefined,
                                        )
                                    }
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                >
                                    <option value="">No category</option>
                                    {categories.map((category) => {
                                        const categoryMeta =
                                            category.slug &&
                                            getCategoryMeta(category.slug);
                                        return (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {categoryMeta
                                                    ? `${categoryMeta.emoji} ${category.name}`
                                                    : category.name}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="mb-2 block text-sm font-medium text-slate-600">
                                Tags
                            </label>
                            <TagMultiSelect
                                options={tags}
                                value={createTagIds}
                                onChange={setCreateTagIds}
                            />
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
                                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                                            <span
                                                                className="rounded-full px-3 py-1 text-[11px] font-semibold text-white"
                                                                style={{
                                                                    backgroundColor:
                                                                        getCategoryMeta(
                                                                            task
                                                                                .category
                                                                                ?.slug,
                                                                        ).color,
                                                                }}
                                                            >
                                                                {
                                                                    getCategoryMeta(
                                                                        task
                                                                            .category
                                                                            ?.slug,
                                                                    ).emoji
                                                                }{" "}
                                                                {
                                                                    getCategoryMeta(
                                                                        task
                                                                            .category
                                                                            ?.slug,
                                                                    ).label
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                                            {task.tags.map(
                                                                (tag) => (
                                                                    <span
                                                                        key={
                                                                            tag.id
                                                                        }
                                                                        className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700"
                                                                    >
                                                                        {
                                                                            tag.name
                                                                        }
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityMeta(task.priority).classes}`}
                                                        >
                                                            {
                                                                getPriorityMeta(
                                                                    task.priority,
                                                                ).emoji
                                                            }{" "}
                                                            {
                                                                getPriorityMeta(
                                                                    task.priority,
                                                                ).label
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
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                            {priorityOptions.map((priorityKey) => {
                                const meta = getPriorityMeta(priorityKey);
                                return (
                                    <option
                                        key={priorityKey}
                                        value={priorityKey}
                                    >
                                        {meta.emoji} {meta.label}
                                    </option>
                                );
                            })}
                        </select>
                        <select
                            value={activeTask.categoryId ?? ""}
                            onChange={(event) => {
                                const categoryId = event.target.value
                                    ? Number(event.target.value)
                                    : undefined;
                                setEditingTask({
                                    ...activeTask,
                                    categoryId,
                                    category: categoryId
                                        ? getCategoryById(categoryId)
                                        : null,
                                });
                            }}
                            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        >
                            <option value="">No category</option>
                            {categories.map((category) => {
                                const categoryMeta =
                                    category.slug &&
                                    getCategoryMeta(category.slug);
                                return (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {categoryMeta
                                            ? `${categoryMeta.emoji} ${category.name}`
                                            : category.name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div className="mt-4">
                        <label className="mb-2 block text-sm font-medium text-slate-600">
                            Tags
                        </label>
                        <TagMultiSelect
                            options={tags}
                            value={activeTask.tags.map((tag) => tag.id)}
                            onChange={(selectedIds) =>
                                setEditingTask({
                                    ...activeTask,
                                    tags: tags.filter((tag) =>
                                        selectedIds.includes(tag.id),
                                    ),
                                })
                            }
                        />
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
