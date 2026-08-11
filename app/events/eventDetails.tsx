import { useParams } from "react-router";
import { events, updateEvent } from "../../src/data/events";
import { useState } from "react";
import { EditableField } from "~/components/EditableField";
import { Input } from "~/components/Input";
import { Textarea } from "~/components/Textarea";
import { IconButton } from "~/components/IconButton";
import { EditIcon } from "~/components/EditIcon";
import { SaveCancelBar } from "~/components/SaveCancelBar";

type EditField = "date" | "location" | "capacity" | "description" | "image" | null;

export default function EventDetails() {
    let { eventId } = useParams();
    const curEvent = events.find((event) => String(event.id) === eventId);

    const [editing, setEditing] = useState<EditField>(null);
    const [saving, setSaving] = useState(false);
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const [draft, setDraft] = useState({
        date: curEvent?.date ?? "",
        capacity: curEvent?.maxGuests ?? "",
        location: curEvent?.location ?? "",
        description: curEvent?.description ?? "",
        image: curEvent?.img ?? "",
    });

    const startEdit = (field: Exclude<EditField, null>) => {
        setEditing(field);
        setDraft({
            date: curEvent?.date ?? "",
            capacity: curEvent?.maxGuests ?? "",
            location: curEvent?.location ?? "",
            description: curEvent?.description ?? "",
            image: curEvent?.img ?? "",
        });
    };

    const saveEdit = async () => {
        if (!curEvent) return;
        setSaving(true);

        const updatePayLoad: Record<string, string> = {};

        if (editing === "date") updatePayLoad.date = draft.date;
        if (editing === "capacity") updatePayLoad.maxGuests = String(draft.capacity);
        if (editing === "location") updatePayLoad.location = draft.location;
        if (editing === "description") updatePayLoad.description = draft.description;
        if (editing === "image") updatePayLoad.img = draft.image;

        try {
            await updateEvent(String(curEvent.id), updatePayLoad);

            const index = events.findIndex((event) => String(event.id) === eventId);
            if (index >= 0) {
                events[index] = {
                    ...events[index],
                    ...updatePayLoad,
                };
            }
        } finally {
            setSaving(false);
            setEditing(null);
        }
    };

    const handleImageUpload = (file: File | null) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const result = String(reader.result ?? "");
            setDraft((current) => ({ ...current, image: result }));
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="mx-auto w-full max-w-4xl px-4 pb-10 pt-6 sm:px-8">
            {/* Capacity */}
            <div className="mb-6">
                <EditableField
                    editing={editing === "capacity"}
                    onEdit={() => startEdit("capacity")}
                    onSave={saveEdit}
                    onCancel={() => setEditing(null)}
                    saving={saving}
                    view={
                        <>
                        <span className="text-lg font-medium text-neutral-600">Maximum Capacity:</span>
                        <span className="text-lg font-semibold text-neutral-800">{curEvent?.maxGuests ?? 0} Guests</span>
                        </>
                    }
                    edit={
                        <>
                        <span className="text-lg font-medium text-neutral-600">Maximum Capacity:</span>
                        <Input
                        type="number"
                        min="0"
                        value={draft.capacity}
                        onChange={(e) => setDraft((current) => ({...current, capacity: e.target.value}))}
                        className="max-w-32"
                        />
                        </>
                    }
                />
            </div>

            {/* Image */}
            <div className="relative mb-6 overflow-hidden rounded-xl border border-neutral-200 shadow-card">
                <img
                    className="aspect-2/1 w-full object-cover"
                    src={editing === "image" && draft.image ? draft.image : curEvent?.img}
                    alt={curEvent?.title}
                />
                {editing !== "image" && (
                    <IconButton
                        size="sm"
                        onClick={() => startEdit("image")}
                        aria-label="Edit image"
                        className="absolute right-3 top-3 bg-neutral-0/90 shadow-soft hover:bg-neutral-0"
                    >
                        <EditIcon size={18} />
                    </IconButton>
                )}
                {editing === "image" && (
                    <div className="flex flex-col gap-3 border-t border-neutral-200 bg-neutral-0 p-4">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e.target.files?.[0] ?? null)}
                            className="text-sm text-neutral-600 file:mr-3 file:rounded-pill file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-600"
                        />
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={saveEdit}
                                disabled={saving}
                                className="rounded-pill bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                disabled={saving}
                                className="rounded-pill bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-300 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mb-6 flex flex-col gap-4">
                {/* Date */}
                <EditableField
                    editing={editing === "date"}
                    onEdit={() => startEdit("date")}
                    onSave={saveEdit}
                    onCancel={() => setEditing(null)}
                    saving={saving}
                    view={<p className="text-xl text-neutral-700">Date: <span className="font-semibold text-neutral-800">{curEvent?.date}</span></p>}
                    edit={
                        <Input
                            type="date"
                            value={draft.date}
                            onChange={(e) => setDraft((current) => ({...current, date: e.target.value}))}
                            className="max-w-xs"
                        />
                    }
                />

                {/* Location */}
                <EditableField
                    editing={editing === "location"}
                    onEdit={() => startEdit("location")}
                    onSave={saveEdit}
                    onCancel={() => setEditing(null)}
                    saving={saving}
                    view={<p className="text-xl text-neutral-700">Location: <span className="font-semibold text-neutral-800">{curEvent?.location}</span></p>}
                    edit={
                        <Input
                            type="text"
                            value={draft.location}
                            onChange={(e) => setDraft((current) => ({...current, location: e.target.value}))}
                            className="max-w-xs"
                        />
                    }
                />
            </div>

            {/* Description */}
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-0 shadow-soft">
                <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-6">
                    <h2 className="text-lg font-bold text-neutral-800 sm:text-xl">About this event</h2>
                    {editing !== "description" && (
                        <IconButton size="sm" onClick={() => startEdit("description")} aria-label="Edit description">
                            <EditIcon size={18} />
                        </IconButton>
                    )}
                </div>
                <div className="px-5 py-5 sm:px-6">
                    {editing === "description" ? (
                        <div className="flex flex-col gap-3">
                            <Textarea
                            rows={6}
                            value={draft.description}
                            onChange={(e) => setDraft((current) => ({ ...current, description: e.target.value}))}
                            />
                            <SaveCancelBar onSave={saveEdit} onCancel={() => setEditing(null)} saving={saving} />
                        </div>
                    ) : curEvent?.description ? (
                        <>
                            <p
                                className={`max-w-prose text-base leading-7 text-neutral-600 sm:text-[17px] ${
                                    isDescExpanded ? "" : "line-clamp-6"
                                }`}
                            >
                                {curEvent.description}
                            </p>
                            {curEvent.description.length > 320 && (
                                <button
                                    type="button"
                                    onClick={() => setIsDescExpanded((current) => !current)}
                                    className="mt-3 text-sm font-semibold text-brand-600 hover:text-brand-700"
                                >
                                    {isDescExpanded ? "Show less" : "Read more"}
                                </button>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-neutral-400">No description yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
