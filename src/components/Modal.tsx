import { useEffect, type ReactNode } from "react";

type ModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
};

export function Modal({
    open,
    onClose,
    title,
    description,
    children,
}: ModalProps) {
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <button
                type="button"
                aria-label="Close dialog"
                className="absolute inset-0 bg-slate-900/40"
                onClick={onClose}
            />
            <div className="relative z-10 flex max-h-[min(90vh,48rem)] w-full max-w-2xl flex-col overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl">
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2
                            id="modal-title"
                            className="text-lg font-semibold text-slate-900"
                        >
                            {title}
                        </h2>
                        {description ? (
                            <p className="mt-1 text-sm text-slate-500">
                                {description}
                            </p>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Close
                    </button>
                </div>
                <div className="overflow-y-auto px-6 py-5">{children}</div>
            </div>
        </div>
    );
}
