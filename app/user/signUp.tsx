import { createAccount } from "../../server/accounts";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { FormField } from "~/components/FormField";
import { Input } from "~/components/Input";
import { Button } from "~/components/Button";
import { useToast } from "~/components/Toast";

const initialForm = {
    name: "",
    email: "",
    number: "",
    password: "",
};

export function Signup() {
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const payload = await createAccount(form);

            if (!payload.ok) {
                setError(payload.error);
                showToast(payload.error, "error");
                return;
            }

            setForm(initialForm);
            showToast("Account created successfully! Please sign in.");
            navigate("/sign-in");
        } catch {
            setError("Something went wrong while creating your account.");
            showToast("Account creation failed.", "error");
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
                            <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM3 20a6 6 0 0 1 12 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-extrabold text-neutral-900">Join GatherEase</h1>
                    <p className="mt-1 text-sm text-neutral-500">Create a host account to start creating and managing events</p>
                </div>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <FormField label="Full Name" htmlFor="name">
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Alex Smith"
                            value={form.name}
                            onChange={handleChange}
                            required
                            autoFocus
                        />
                    </FormField>

                    <FormField label="Email Address" htmlFor="email">
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="alex@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </FormField>

                    <FormField label="Phone Number (Optional)" htmlFor="number">
                        <Input
                            type="tel"
                            id="number"
                            name="number"
                            placeholder="+1 (555) 000-0000"
                            value={form.number}
                            onChange={handleChange}
                        />
                    </FormField>

                    <FormField label="Password" htmlFor="password">
                        <Input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="At least 6 characters"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </FormField>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                            {error}
                        </div>
                    )}

                    <Button type="submit" variant="primary" size="lg" className="mt-2 w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Creating Account..." : "Create GatherEase Account"}
                    </Button>
                </form>

                <div className="mt-6 border-t border-neutral-100 pt-5 text-center">
                    <p className="text-sm text-neutral-500">
                        Already have an account?{" "}
                        <Link to="/sign-in" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}