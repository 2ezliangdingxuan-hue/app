import { useParams, useNavigate, Link } from "react-router";
import { events } from "../../server/events";
import { useState, type FormEvent } from "react";
import { addGuest } from "../../server/events";
import { FormField } from "~/components/FormField";
import { Input } from "~/components/Input";
import { Textarea } from "~/components/Textarea";
import { Button } from "~/components/Button";
import { decryptId } from "~/utils/idCrypto";
import { useToast } from "~/components/Toast";

export function Form() {
    const { eventId: rawEventId } = useParams();
    const eventId = decryptId(rawEventId);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({ name: "", email: "", number: "", remarks: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const curEvent = events.find((event) => String(event.id) === eventId);

    async function handleNewGuest(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const name = formData.name.trim();
        if (!name) {
            setErrorMessage("Please enter your name.");
            return;
        }
        const currentEventId = eventId ?? "";
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            await addGuest(currentEventId, {
                name,
                email: formData.email.trim(),
                number: formData.number.trim(),
                remarks: formData.remarks.trim(),
                selfSignup: true,
            });

            showToast(`You're registered for ${curEvent?.title || "the event"}!`);
            navigate(`/view/${rawEventId}`);
        } catch (err) {
            console.error(err);
            setErrorMessage("Failed to register. Please check your network and try again.");
            showToast("Registration failed.", "error");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!curEvent) {
        return (
            <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 py-12 text-center">
                <h2 className="text-xl font-bold text-neutral-800">Event Not Found</h2>
                <p className="mt-2 text-sm text-neutral-500">The event you are looking for does not exist.</p>
                <Link to="/" className="mt-4 text-sm font-semibold text-brand-600 hover:underline">
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-xl flex-col px-4 pb-16 pt-8 sm:px-6">
            <div className="mb-6 text-center">
                <span className="rounded-pill bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
                    Registration
                </span>
                <h1 className="mt-3 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
                    Register for {curEvent.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-neutral-600">
                    {curEvent.date && (
                        <div className="flex items-center gap-1.5 font-medium">
                            <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <rect width="18" height="18" x="3" y="4" rx="2" />
                                <path d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                            {curEvent.date}
                        </div>
                    )}
                    {curEvent.location && (
                        <div className="flex items-center gap-1.5 font-medium capitalize">
                            <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            {curEvent.location}
                        </div>
                    )}
                </div>
            </div>

            {curEvent.img && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-neutral-200 shadow-card">
                    <img className="aspect-2/1 w-full object-cover" src={curEvent.img} alt={curEvent.title} />
                </div>
            )}

            <form
                className="flex w-full flex-col gap-4.5 rounded-2xl border border-neutral-200 bg-neutral-0 p-6 sm:p-8 shadow-card"
                onSubmit={handleNewGuest}
            >
                {errorMessage && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                <FormField label="Full Name" htmlFor="signup-name">
                    <Input
                        type="text"
                        id="signup-name"
                        name="name"
                        placeholder="e.g. Morgan Reed"
                        value={formData.name}
                        onChange={(e) => setFormData((current) => ({ ...current, name: e.target.value }))}
                        required
                    />
                </FormField>

                <FormField label="Email Address" htmlFor="signup-email">
                    <Input
                        type="email"
                        id="signup-email"
                        name="email"
                        placeholder="morgan@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData((current) => ({ ...current, email: e.target.value }))}
                        required
                    />
                </FormField>

                <FormField label="Phone Number (Optional)" htmlFor="signup-number">
                    <Input
                        id="signup-number"
                        name="number"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.number}
                        onChange={(e) => setFormData((current) => ({ ...current, number: e.target.value }))}
                    />
                </FormField>

                <FormField label="Remarks / Special Requirements (Optional)" htmlFor="signup-remarks">
                    <Textarea
                        id="signup-remarks"
                        name="remarks"
                        rows={3}
                        placeholder="Dietary requests, accessibility requirements, etc."
                        value={formData.remarks}
                        onChange={(e) => setFormData((current) => ({ ...current, remarks: e.target.value }))}
                    />
                </FormField>

                <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} className="mt-3 w-full">
                    {isSubmitting ? "Completing Registration..." : "Complete Registration"}
                </Button>
            </form>
        </div>
    );
}