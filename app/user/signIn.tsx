import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { FormField } from "~/components/FormField";
import { Input } from "~/components/Input";
import { Button } from "~/components/Button";
import { useAuth } from "~/auth/AuthContext";
import { useToast } from "~/components/Toast";

export function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const result = await signIn(email, password);
            if (!result.ok) {
                setError(result.error);
                showToast(result.error, "error");
                return;
            }
            showToast("Welcome back! Signed in successfully.");
            navigate("/");
        } catch {
            setError("Unable to sign in. Please try again.");
            showToast("Sign in failed.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-[75vh] w-full flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-neutral-0 p-8 shadow-card">
                <div className="mb-6 flex flex-col items-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-3">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 3" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-extrabold text-neutral-900">Welcome to GatherEase</h1>
                    <p className="mt-1 text-sm text-neutral-500">Sign in to manage your events and guestlists</p>
                </div>

                <form className="flex flex-col gap-4.5" onSubmit={handleSubmit}>
                    <FormField label="Email Address" htmlFor="email">
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </FormField>

                    <FormField label="Password" htmlFor="password">
                        <Input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </FormField>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                            {error}
                        </div>
                    )}

                    <Button type="submit" variant="primary" size="lg" className="mt-2 w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Signing in..." : "Sign In to GatherEase"}
                    </Button>
                </form>

                <div className="mt-6 border-t border-neutral-100 pt-5 text-center">
                    <p className="text-sm text-neutral-500">
                        Don't have an account?{" "}
                        <Link to="/sign-up" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}