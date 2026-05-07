import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
} from "../features/tasks/taskApi";

interface Task {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
}

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const tasksData = await getTasks();
                if (tasksData.success) {
                    setTasks(tasksData.data || []);
                } else {
                    console.error("Failed to fetch tasks:", tasksData);
                }
            } catch (error) {
                console.error("Failed to load tasks:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    const handleCreateTask = async () => {
        if (!newTaskTitle.trim()) return;
        try {
            const response = await createTask({
                title: newTaskTitle,
                description: newTaskDescription || undefined,
            });
            if (response.success) {
                setTasks([...tasks, response.task]);
                setNewTaskTitle("");
                setNewTaskDescription("");
                alert("Task created successfully!");
            } else {
                alert("Failed to create task");
            }
        } catch (error) {
            console.error("Failed to create task:", error);
            alert("Failed to create task");
        }
    };

    const handleUpdateTask = async (id: number, updates: Partial<Task>) => {
        try {
            const response = await updateTask(id, updates);
            if (response.success) {
                setTasks(
                    tasks.map((task) =>
                        task.id === id ? response.task : task,
                    ),
                );
                setEditingTask(null);
                alert("Task updated successfully!");
            } else {
                alert("Failed to update task");
            }
        } catch (error) {
            console.error("Failed to update task:", error);
            alert("Failed to update task");
        }
    };

    const handleDeleteTask = async (id: number) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            const response = await deleteTask(id);
            if (response.success) {
                setTasks(tasks.filter((task) => task.id !== id));
                alert("Task deleted successfully!");
            } else {
                alert("Failed to delete task");
            }
        } catch (error) {
            console.error("Failed to delete task:", error);
            alert("Failed to delete task");
        }
    };

    const startEditing = (task: Task) => {
        setEditingTask(task);
    };

    const cancelEditing = () => {
        setEditingTask(null);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ padding: "20px" }}>
            <h1>Dashboard</h1>
            {user && <p>Welcome, {user.name || user.email}</p>}
            <button onClick={handleLogout}>Logout</button>

            <h2>Tasks</h2>

            {/* Tasks List */}
            <div>
                {!tasks || tasks.length === 0 ? (
                    <p>No tasks yet.</p>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            style={{
                                marginBottom: "10px",
                                padding: "10px",
                                border: "1px solid #ddd",
                            }}
                        >
                            {editingTask && editingTask.id === task.id ? (
                                <div>
                                    <input
                                        type="text"
                                        value={editingTask.title}
                                        onChange={(e) =>
                                            setEditingTask({
                                                ...editingTask,
                                                title: e.target.value,
                                            })
                                        }
                                        style={{
                                            display: "block",
                                            marginBottom: "5px",
                                            width: "300px",
                                        }}
                                    />
                                    <textarea
                                        value={editingTask.description || ""}
                                        onChange={(e) =>
                                            setEditingTask({
                                                ...editingTask,
                                                description: e.target.value,
                                            })
                                        }
                                        style={{
                                            display: "block",
                                            marginBottom: "5px",
                                            width: "300px",
                                            height: "60px",
                                        }}
                                    />
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={editingTask.completed}
                                            onChange={(e) =>
                                                setEditingTask({
                                                    ...editingTask,
                                                    completed: e.target.checked,
                                                })
                                            }
                                        />
                                        Completed
                                    </label>
                                    <div style={{ marginTop: "10px" }}>
                                        <button
                                            onClick={() => {
                                                const originalTask = tasks.find(
                                                    (t) => t.id === task.id,
                                                );
                                                if (
                                                    !originalTask ||
                                                    !editingTask
                                                )
                                                    return;

                                                const updates: Partial<Task> =
                                                    {};
                                                if (
                                                    editingTask.title !==
                                                    originalTask.title
                                                ) {
                                                    updates.title =
                                                        editingTask.title;
                                                }
                                                if (
                                                    editingTask.description !==
                                                    originalTask.description
                                                ) {
                                                    updates.description =
                                                        editingTask.description;
                                                }
                                                if (
                                                    editingTask.completed !==
                                                    originalTask.completed
                                                ) {
                                                    updates.completed =
                                                        editingTask.completed;
                                                }

                                                handleUpdateTask(
                                                    task.id,
                                                    updates,
                                                );
                                            }}
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            style={{ marginLeft: "10px" }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h4
                                        style={{
                                            textDecoration: task.completed
                                                ? "line-through"
                                                : "none",
                                        }}
                                    >
                                        {task.title}
                                    </h4>
                                    {task.description && (
                                        <p>{task.description}</p>
                                    )}
                                    <p>
                                        Status:{" "}
                                        {task.completed
                                            ? "Completed"
                                            : "Pending"}
                                    </p>
                                    <div>
                                        <button
                                            onClick={() => startEditing(task)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleUpdateTask(task.id, {
                                                    completed: !task.completed,
                                                })
                                            }
                                            style={{ marginLeft: "10px" }}
                                        >
                                            {task.completed
                                                ? "Mark Incomplete"
                                                : "Mark Complete"}
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteTask(task.id)
                                            }
                                            style={{
                                                marginLeft: "10px",
                                                color: "red",
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Create Task Form */}
            <div
                style={{
                    marginTop: "20px",
                    padding: "10px",
                    border: "1px solid #ccc",
                }}
            >
                <h3>Create New Task</h3>
                <input
                    type="text"
                    placeholder="Task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    style={{
                        display: "block",
                        marginBottom: "10px",
                        width: "300px",
                    }}
                />
                <textarea
                    placeholder="Task description (optional)"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    style={{
                        display: "block",
                        marginBottom: "10px",
                        width: "300px",
                        height: "60px",
                    }}
                />
                <button onClick={handleCreateTask}>Create Task</button>
            </div>
        </div>
    );
}
