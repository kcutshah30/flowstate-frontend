import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
} from "../features/tasks/taskApi";

interface Task {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    dueDate?: string;
}

// Helper function to transform backend task data to frontend format
const transformTask = (backendTask: any): Task => {
    return {
        id: backendTask.id,
        title: backendTask.title,
        description: backendTask.description,
        completed: backendTask.completed,
        dueDate: backendTask.due_date || backendTask.dueDate,
    };
};

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [newTaskDueDate, setNewTaskDueDate] = useState("");
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const tasksData = await getTasks();
                if (tasksData.success && Array.isArray(tasksData.data)) {
                    const transformedTasks = tasksData.data
                        .map(transformTask)
                        .filter((task: any) => task && task.id);
                    setTasks(transformedTasks);
                } else {
                    console.error("Failed to fetch tasks:", tasksData);
                    setTasks([]);
                }
            } catch (error) {
                console.error("Failed to load tasks:", error);
                setTasks([]);
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
                dueDate: newTaskDueDate || undefined,
            });
            if (response.success && (response.data || response.task)) {
                const task = transformTask(response.data || response.task);
                setTasks([...tasks, task]);
                setNewTaskTitle("");
                setNewTaskDescription("");
                setNewTaskDueDate("");
                alert("Task created successfully!");
            } else {
                console.error("Create failed - response:", response);
                alert(
                    "Failed to create task: " +
                        (response.message || JSON.stringify(response.errors)),
                );
            }
        } catch (error) {
            console.error("Failed to create task:", error);
            const errorMsg =
                error instanceof Error ? error.message : "Unknown error";
            alert("Failed to create task: " + errorMsg);
        }
    };

    const handleUpdateTask = async (id: number, updates: Partial<Task>) => {
        try {
            const response = await updateTask(id, updates);
            if (response.success && (response.data || response.task)) {
                const task = transformTask(response.data || response.task);
                setTasks(tasks.map((t) => (t.id === id ? task : t)));
                setEditingTask(null);
                alert("Task updated successfully!");
            } else {
                console.error("Update failed - response:", response);
                alert(
                    "Failed to update task: " +
                        (response.message || "Unknown error"),
                );
            }
        } catch (error) {
            console.error("Failed to update task:", error);
            const errorMsg =
                error instanceof Error ? error.message : "Unknown error";
            alert("Failed to update task: " + errorMsg);
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
                console.error("Delete failed - response:", response);
                alert(
                    "Failed to delete task: " +
                        (response.message || JSON.stringify(response.errors)),
                );
            }
        } catch (error) {
            console.error("Failed to delete task:", error);
            const errorMsg =
                error instanceof Error ? error.message : "Unknown error";
            alert("Failed to delete task: " + errorMsg);
        }
    };

    const handleCompleteTask = async (id: number) => {
        try {
            const response = await completeTask(id);
            if (response.success && (response.data || response.task)) {
                const task = transformTask(response.data || response.task);
                setTasks(tasks.map((t) => (t.id === id ? task : t)));
                alert("Task completed successfully!");
            } else {
                console.error("Complete failed - response:", response);
                alert(
                    "Failed to complete task: " +
                        (response.message || JSON.stringify(response.errors)),
                );
            }
        } catch (error) {
            console.error("Failed to complete task:", error);
            const errorMsg =
                error instanceof Error ? error.message : "Unknown error";
            alert("Failed to complete task: " + errorMsg);
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
                    tasks
                        .filter((task) => task && task.id)
                        .map((task) => (
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
                                            value={
                                                editingTask.description || ""
                                            }
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
                                        <input
                                            type="date"
                                            value={
                                                editingTask.dueDate
                                                    ? editingTask.dueDate.split(
                                                          "T",
                                                      )[0]
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                setEditingTask({
                                                    ...editingTask,
                                                    dueDate: e.target.value,
                                                })
                                            }
                                            style={{
                                                display: "block",
                                                marginBottom: "5px",
                                                width: "300px",
                                            }}
                                        />
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={editingTask.completed}
                                                onChange={(e) =>
                                                    setEditingTask({
                                                        ...editingTask,
                                                        completed:
                                                            e.target.checked,
                                                    })
                                                }
                                            />
                                            Completed
                                        </label>
                                        <div style={{ marginTop: "10px" }}>
                                            <button
                                                onClick={() => {
                                                    const originalTask =
                                                        tasks.find(
                                                            (t) =>
                                                                t.id ===
                                                                task.id,
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
                                                        editingTask.dueDate !==
                                                        originalTask.dueDate
                                                    ) {
                                                        updates.dueDate =
                                                            editingTask.dueDate;
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
                                        {task.dueDate && (
                                            <p>
                                                Due Date:{" "}
                                                {new Date(
                                                    task.dueDate,
                                                ).toLocaleDateString()}
                                            </p>
                                        )}
                                        <div>
                                            <button
                                                onClick={() =>
                                                    startEditing(task)
                                                }
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (task.completed) {
                                                        handleUpdateTask(
                                                            task.id,
                                                            {
                                                                completed: false,
                                                            },
                                                        );
                                                    } else {
                                                        handleCompleteTask(
                                                            task.id,
                                                        );
                                                    }
                                                }}
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
                <input
                    type="date"
                    placeholder="Due date (optional)"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    style={{
                        display: "block",
                        marginBottom: "10px",
                        width: "300px",
                    }}
                />
                <button onClick={handleCreateTask}>Create Task</button>
            </div>
        </div>
    );
}
