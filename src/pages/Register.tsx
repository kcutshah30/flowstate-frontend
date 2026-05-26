import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getAuthErrorMessages } from "../features/auth/authApi";

const inputClassName =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

const inputErrorClassName =
    "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100";

function validateRegisterForm(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
): Record<string, string> {
    const errors: Record<string, string> = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
        errors.name = "Name is required.";
    } else if (trimmedName.length > 255) {
        errors.name = "Name must be 255 characters or fewer.";
    }

    if (!trimmedEmail) {
        errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        errors.email = "Enter a valid email address.";
    }

    if (!password) {
        errors.password = "Password is required.";
    } else if (password.length < 6) {
        errors.password = "Password must be at least 6 characters.";
    }

    if (!passwordConfirmation) {
        errors.password_confirmation = "Please confirm your password.";
    } else if (password !== passwordConfirmation) {
        errors.password_confirmation = "Passwords do not match.";
    }

    return errors;
}

export default function Register() {
    const { register, user, loading } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            navigate("/");
        }
    }, [user, loading, navigate]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        const clientErrors = validateRegisterForm(
            name,
            email,
            password,
            passwordConfirmation,
        );
        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            return;
        }

        setFieldErrors({});
        setSubmitting(true);

        try {
            await register({
                name: name.trim(),
                email: email.trim(),
                password,
                password_confirmation: passwordConfirmation,
            });
            navigate("/");
        } catch (err) {
            console.error(err);
            const { form, fields } = getAuthErrorMessages(err);
            setFieldErrors(fields);
            setFormError(form);
        } finally {
            setSubmitting(false);
        }
    };

    const fieldError = (key: string) => fieldErrors[key];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h1 className="text-3xl font-semibold text-slate-900">Create account</h1>
                <p className="mt-2 text-sm text-slate-500">Sign up to start tracking your flow.</p>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Name</label>
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            type="text"
                            autoComplete="name"
                            className={`${inputClassName} ${fieldError("name") ? inputErrorClassName : ""}`}
                        />
                        {fieldError("name") ? (
                            <p className="text-sm text-red-600">{fieldError("name")}</p>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Email</label>
                        <input
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            type="email"
                            autoComplete="email"
                            className={`${inputClassName} ${fieldError("email") ? inputErrorClassName : ""}`}
                        />
                        {fieldError("email") ? (
                            <p className="text-sm text-red-600">{fieldError("email")}</p>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Password</label>
                        <input
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            type="password"
                            autoComplete="new-password"
                            minLength={6}
                            className={`${inputClassName} ${fieldError("password") ? inputErrorClassName : ""}`}
                        />
                        {fieldError("password") ? (
                            <p className="text-sm text-red-600">{fieldError("password")}</p>
                        ) : (
                            <p className="text-xs text-slate-500">At least 6 characters.</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Confirm password
                        </label>
                        <input
                            value={passwordConfirmation}
                            onChange={(event) => setPasswordConfirmation(event.target.value)}
                            type="password"
                            autoComplete="new-password"
                            minLength={6}
                            className={`${inputClassName} ${fieldError("password_confirmation") ? inputErrorClassName : ""}`}
                        />
                        {fieldError("password_confirmation") ? (
                            <p className="text-sm text-red-600">{fieldError("password_confirmation")}</p>
                        ) : null}
                    </div>

                    {formError ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {formError}
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {submitting ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link to="/login" className="font-medium text-slate-900 hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
