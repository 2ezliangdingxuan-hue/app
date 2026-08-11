import {createAccount} from "../../src/data/accounts"
import { useState } from "react"
import { Link, useNavigate } from "react-router";
import { FormField } from "~/components/FormField";
import { Input } from "~/components/Input";
import { Button } from "~/components/Button";

const initialForm = {
    name:"",
    email:"",
    number:"",
    password:"",
}

export function Signup(){
    const [form,setForm] = useState(initialForm)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate();

    const handleChange = (
        account:React.ChangeEvent<HTMLInputElement>
    ) =>{
        const {name,value} = account.target;
        setForm((current) => ({ ...current, [name]:value}))
    }
    const handleSubmit = async (
        account : React.FormEvent<HTMLFormElement>
    ) => {
        account.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try{
            const payload = await createAccount(form);

            if (!payload.ok){
                setError(payload.error);
                return;
            }

            setForm(initialForm);
            navigate("/sign-in");
        } catch{
            setError("Something went wrong while creating your account.");
        } finally {
            setIsSubmitting(false);
        }
    }
    return(
        <div className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-6 px-4 py-12">
            <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-neutral-0 p-8 shadow-card">
                <h1 className="mb-6 text-center text-3xl font-bold text-neutral-800">Sign Up</h1>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <FormField label="Name" htmlFor="name">
                        <Input type="text" id="name" name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
                    </FormField>
                    <FormField label="Email" htmlFor="email">
                        <Input type="email" id="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                    </FormField>
                    <FormField label="Phone Number" htmlFor="number">
                        <Input type="tel" id="number" name="number" placeholder="Phone number" value={form.number} onChange={handleChange} required />
                    </FormField>
                    <FormField label="Password" htmlFor="password">
                        <Input type="password" id="password" name="password" placeholder="********" value={form.password} onChange={handleChange} required />
                    </FormField>

                    {error && <p className="text-sm text-danger-500">{error}</p>}

                    <Button type="submit" variant="primary" className="mt-2 w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Creating account..." : "Sign Up"}
                    </Button>
                </form>
            </div>
            <Link to="/sign-in" className="text-sm text-brand-600 underline underline-offset-2 hover:text-brand-700">
                Already have an account? Sign in
            </Link>
        </div>
    )
}