export const TASK_PRIORITY_META = {
    critical: {
        key: "critical",
        label: "Critical",
        color: "#F87171",
        emoji: "🔥",
        classes: "bg-red-100 text-red-700",
    },
    high: {
        key: "high",
        label: "High",
        color: "#FBBF24",
        emoji: "⚠️",
        classes: "bg-amber-100 text-amber-700",
    },
    medium: {
        key: "medium",
        label: "Medium",
        color: "#38BDF8",
        emoji: "⭐️",
        classes: "bg-sky-100 text-sky-700",
    },
    low: {
        key: "low",
        label: "Low",
        color: "#34D399",
        emoji: "🟢",
        classes: "bg-emerald-100 text-emerald-700",
    },
};

export const TASK_CATEGORY_META = {
    work: { label: "Work", color: "#2563EB", emoji: "💼" },
    study: { label: "Study", color: "#6366F1", emoji: "📚" },
    personal: { label: "Personal", color: "#EC4899", emoji: "🫶" },
    health: { label: "Health", color: "#16A34A", emoji: "💚" },
    finance: { label: "Finance", color: "#0EA5E9", emoji: "💰" },
    project: { label: "Project", color: "#8B5CF6", emoji: "🧩" },
    admin: { label: "Admin", color: "#64748B", emoji: "🛠️" },
};

const DEFAULT_PRIORITY_META = TASK_PRIORITY_META.medium;
const DEFAULT_CATEGORY_META = {
    label: "Uncategorized",
    color: "#94A3B8",
    emoji: "📦",
};

export const getPriorityMeta = (priority) => {
    return TASK_PRIORITY_META[priority] ?? DEFAULT_PRIORITY_META;
};

export const getCategoryMeta = (slug) => {
    return TASK_CATEGORY_META[slug] ?? DEFAULT_CATEGORY_META;
};
