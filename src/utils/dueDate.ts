const ISO_NAIVE_PATTERN =
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/;

/** Parse API due dates as wall-clock time (backend stores naive timestamps). */
export function parseDueDate(value?: string | null): Date | null {
    if (!value) return null;
    const trimmed = value.trim().replace(/\.\d+Z?$/i, "").replace(/Z$/i, "");
    if (!trimmed) return null;

    const match = trimmed.match(ISO_NAIVE_PATTERN);
    if (!match) return null;

    const [, year, month, day, hour = "0", minute = "0", second = "0"] = match;
    return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second),
    );
}

export function formatDueDateDisplay(value?: string | null): string {
    const date = parseDueDate(value);
    if (!date) return "";

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

/** Value for `<input type="datetime-local" />`. */
export function toDateTimeLocalValue(value?: string | null): string {
    const date = parseDueDate(value);
    if (!date) return "";

    const pad = (part: number) => String(part).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Convert datetime-local input back to the API format. */
export function fromDateTimeLocalValue(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "";

    const match = trimmed.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
    );
    if (!match) return trimmed;

    const [, year, month, day, hour, minute] = match;
    return `${year}-${month}-${day}T${hour}:${minute}:00.000000Z`;
}
