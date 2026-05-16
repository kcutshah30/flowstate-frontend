export type TagOption = {
    id: number;
    name: string;
};

type TagMultiSelectProps = {
    options: TagOption[];
    value: number[];
    onChange: (ids: number[]) => void;
    emptyMessage?: string;
};

export function TagMultiSelect({
    options,
    value,
    onChange,
    emptyMessage = "No tags available yet.",
}: TagMultiSelectProps) {
    const toggleTag = (tagId: number) => {
        if (value.includes(tagId)) {
            onChange(value.filter((id) => id !== tagId));
            return;
        }
        onChange([...value, tagId]);
    };

    if (options.length === 0) {
        return <p className="text-sm text-slate-500">{emptyMessage}</p>;
    }

    return (
        <div
            className="flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-3"
            role="group"
            aria-label="Tags"
        >
            {options.map((tag) => {
                const selected = value.includes(tag.id);
                return (
                    <button
                        key={tag.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleTag(tag.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                            selected
                                ? "bg-slate-900 text-white shadow-sm"
                                : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                        }`}
                    >
                        {selected ? (
                            <svg
                                aria-hidden="true"
                                className="h-3.5 w-3.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-3.25-3.25a1 1 0 1 1 1.414-1.414L9 11.586l6.543-6.543a1 1 0 0 1 1.414 0Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ) : null}
                        {tag.name}
                    </button>
                );
            })}
        </div>
    );
}
