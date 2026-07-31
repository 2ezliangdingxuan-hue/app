import { useState } from "react";
import { useNavigate } from "react-router";
import { createEvent } from "../../src/data/events";

const initialForm = {
    title:"",
    description:"",
    date:"",
    location:"",
    category:"",
}

export function CreateEvent(){
    const[form, setForm] = useState(initialForm);
    const[error, setError] = useState<string | null>(null);
    const[isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const {name, value} = event.target;
        setForm((current) => ({ ...current, [name]: value}));
    };

    const handleSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try{
            const payload = await createEvent(form);

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
        <main>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Create Event</h1>
                <form className="space-y-2 flex flex-col" onSubmit={handleSubmit}>
                    <label>Event title : </label>
                    <input 
                    type="text" 
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="border p-1"/><br/>

                    <div className="flex flex-col">
                        <label>Event Description : </label>
                        <textarea
                        rows={4}
                        id="description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="border p-1"/><br/>
                    </div>

                    <label>Event Date : </label>
                    <input 
                    type="date" 
                    id="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="border p-1"/><br/>
                    
                    <label>Event Location : </label>
                    <input 
                    type="text" 
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="border p-1"/><br/>

                    <label>Event Category : </label>
                    <input 
                    type="text" 
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="border p-1"/><br/>

                    {error && <p className="text-red-600">{error}</p>}

                    <button
                    type="submit"
                    className="mt-4 rounded-xl bg-black px-4 py-2 text-white disabled:opacity-60"
                    disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating..." : "Create Event"}
                    </button>

                </form>
            </div>
        </main>
    )
}