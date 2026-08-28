import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { createEvent, CATEGORY_OPTIONS } from "../../server/events";
import { useAuth } from "~/auth/AuthContext";
import { FormField } from "~/components/FormField";
import { Input } from "~/components/Input";
import { Textarea } from "~/components/Textarea";
import { Select } from "~/components/Select";
import { Button } from "~/components/Button";
import { encryptId } from "~/utils/idCrypto";
import { useToast } from "~/components/Toast";

const initialForm = {
    title: "",
    maxGuests: "",
    description: "",
    date: "",
    location: "",
    category: "",
};

export function CreateEvent() {
    const [form, setForm] = useState(initialForm);
    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { token } = useAuth();
    const { showToast } = useToast();

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleImageChange = (file: File | null) => {
        if (!file) {
            setImageDataUrl(null);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setImageDataUrl(String(reader.result ?? ""));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const payload = await createEvent(
                imageDataUrl ? { ...form, img: imageDataUrl } : form,
                token
            );

            if (!payload.ok || !payload.event?.id) {
                setError(payload.error || "Unable to create event.");
                showToast(payload.error || "Unable to create event.", "error");
                return;
            }

            showToast(`Event "${payload.event.title}" created successfully!`);
            navigate(`/events/${encryptId(payload.event.id)}`);
        } catch {
            setError("Something went wrong while creating the event.");
            showToast("Failed to create event.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-8 sm:px-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">Create New Event</h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Fill in event details to publish and start inviting guests.
                    </p>
                </div>
                <Link to="/events" className="text-sm font-semibold text-neutral-500 hover:text-neutral-800">
                    Cancel
                </Link>
            </div>

            <form
                className="flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-neutral-0 p-6 sm:p-8 shadow-card"
                onSubmit={handleSubmit}
            >
                <FormField label="Event Title" htmlFor="title">
                    <Input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="e.g. Annual Tech Innovators Summit 2026"
                        value={form.title}
                        onChange={handleChange}
                        required
                        autoFocus
                    />
                </FormField>

                <FormField label="Event Description" htmlFor="description">
                    <Textarea
                        rows={4}
                        id="description"
                        name="description"
                        placeholder="Give attendees a detailed overview of what to expect..."
                        value={form.description}
                        onChange={handleChange}
                        required
                    />
                </FormField>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Event Date" htmlFor="date">
                        <Input
                            type="date"
                            id="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            required
                        />
                    </FormField>

                    <FormField label="Maximum Capacity" htmlFor="maxGuests">
                        <Input
                            type="number"
                            id="maxGuests"
                            name="maxGuests"
                            placeholder="e.g. 100"
                            value={form.maxGuests}
                            onChange={handleChange}
                            inputMode="numeric"
                            min="1"
                            required
                        />
                    </FormField>
                </div>

                <FormField label="Event Location / Venue" htmlFor="location">
                    <Input
                        type="text"
                        id="location"
                        name="location"
                        placeholder="e.g. Grand Ballroom, 100 Broadway, New York"
                        value={form.location}
                        onChange={handleChange}
                        required
                    />
                </FormField>

                <FormField label="Cover Image (Optional)" htmlFor="image">
                    {imageDataUrl ? (
                        <div className="relative mb-3 overflow-hidden rounded-xl border border-neutral-200">
                            <img src={imageDataUrl} alt="Event preview" className="aspect-2/1 w-full object-cover" />
                            <button
                                type="button"
                                onClick={() => setImageDataUrl(null)}
                                className="absolute right-2 top-2 rounded-full bg-neutral-900/70 p-1 text-white hover:bg-neutral-900"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    ) : null}
                    <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                        className="text-xs text-neutral-600 file:mr-3 file:rounded-pill file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                    />
                    <p className="mt-1 text-xs text-neutral-400">Leave blank to use a default event banner.</p>
                </FormField>

                <FormField label="Category" htmlFor="category">
                    <Select name="category" id="category" value={form.category} onChange={handleChange} required>
                        <option value="" disabled>
                            Select event category
                        </option>
                        {CATEGORY_OPTIONS.map((option) => (
                            <option key={option} value={option} className="capitalize">
                                {option}
                            </option>
                        ))}
                    </Select>
                </FormField>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                        {error}
                    </div>
                )}

                <Button type="submit" variant="primary" size="lg" className="mt-2 w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Creating Event..." : "Publish Event"}
                </Button>
            </form>
        </main>
    );
}