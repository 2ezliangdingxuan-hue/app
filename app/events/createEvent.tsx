import { useState } from "react";
import { useNavigate } from "react-router";
import { createEvent } from "../../src/data/events";
import { FormField } from "~/components/FormField";
import { Input } from "~/components/Input";
import { Textarea } from "~/components/Textarea";
import { Select } from "~/components/Select";
import { Button } from "~/components/Button";

const initialForm = {
    title:"",
    maxGuests:"",
    description:"",
    date:"",
    location:"",
    category:"",
}

const CATEGORY_OPTIONS = ["public", "private", "invite-only", "internal"];

export function CreateEvent(){
    const[form, setForm] = useState(initialForm);
    const[imageDataUrl, setImageDataUrl] = useState<string | null>(null);
    const[error, setError] = useState<string | null >(null);
    const[isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const {name, value} = event.target;
        setForm((current) => ({ ...current, [name]: value}));
    };

    const handleImageChange = (file: File | null) => {
        if (!file){
            setImageDataUrl(null);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setImageDataUrl(String(reader.result ?? ""));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try{
            const payload = await createEvent(
                imageDataUrl ? { ...form, img: imageDataUrl } : form
            );

            if(!payload.ok || !payload.event?.id){
                setError(payload.error || "unable to create event.");
                return;
            }

            navigate(`/events/${payload.event.id}`);
        } catch{
            setError("Something went wrong while creating the event.");
        } finally{
            setIsSubmitting(false);
        }
    };

    return (
        <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-8">
            <h1 className="mb-6 text-2xl font-bold text-neutral-800 sm:text-3xl">Create Event</h1>
            <form className="flex flex-col gap-5 rounded-xl border border-neutral-200 bg-neutral-0 p-6 shadow-card" onSubmit={handleSubmit}>
                <FormField label="Event title" htmlFor="title">
                    <Input
                    type="text"
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required/>
                </FormField>

                <FormField label="Event description" htmlFor="description">
                    <Textarea
                    rows={4}
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required/>
                </FormField>

                <FormField label="Maximum capacity" htmlFor="maxGuests">
                    <Input type="text"
                    id="maxGuests"
                    name="maxGuests"
                    value={form.maxGuests}
                    onChange={handleChange}
                    inputMode="numeric"
                    required/>
                </FormField>

                <FormField label="Event date" htmlFor="date">
                    <Input
                    type="date"
                    id="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required/>
                </FormField>

                <FormField label="Event location" htmlFor="location">
                    <Input
                    type="text"
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required/>
                </FormField>

                <FormField label="Event image (optional)" htmlFor="image">
                    {imageDataUrl && (
                        <img
                            src={imageDataUrl}
                            alt="Event preview"
                            className="mb-2 aspect-2/1 w-full rounded-md object-cover"
                        />
                    )}
                    <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                        className="text-sm text-neutral-600 file:mr-3 file:rounded-pill file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-600"
                    />
                    <p className="text-xs text-neutral-400">Leave empty to use a default image.</p>
                </FormField>

                <FormField label="Event category" htmlFor="category">
                    <Select
                    name="category"
                    id="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    >
                        <option value="" disabled>Select a category</option>
                        {CATEGORY_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </Select>
                </FormField>

                {error && <p className="text-sm text-danger-500">{error}</p>}

                <Button
                type="submit"
                variant="primary"
                className="mt-2 w-full"
                disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Event"}
                </Button>
            </form>
        </main>
    )
}