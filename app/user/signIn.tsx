import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { FormField } from "~/components/FormField";
import { Input } from "~/components/Input";
import { Button } from "~/components/Button";
import { useAuth } from "~/auth/AuthContext";

export function Signin(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const result = await signIn(email, password);
            if (!result.ok) {
                setError(result.error);
                return;
            }
            navigate("/");
        } finally {
            setIsSubmitting(false);
        }
    };

    return(
        <div className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-6 px-4 py-12">
            <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-neutral-0 p-8 shadow-card">
                <h1 className="mb-6 text-center text-3xl font-bold text-neutral-800">Sign In</h1>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <FormField label="Email" htmlFor="email">
                        <Input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        />
                    </FormField>
                    <FormField label="Password" htmlFor="password">
                        <Input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        />
                    </FormField>

                    {error && <p className="text-sm text-danger-500">{error}</p>}

                    <Button type="submit" variant="primary" className="mt-2 w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Signing in..." : "Sign In"}
                    </Button>
                </form>
            </div>
            <Link to="/sign-up" className="text-sm text-brand-600 underline underline-offset-2 hover:text-brand-700">
                No account? Sign up
            </Link>
        </div>
    )
}