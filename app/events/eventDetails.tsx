import { Link, useParams } from "react-router";
import { events, updateEvent, CATEGORY_OPTIONS } from "../../server/events";
import { useState } from "react";
import { EditableField } from "~/components/EditableField";
import { Input } from "~/components/Input";
import { Textarea } from "~/components/Textarea";
import { Select } from "~/components/Select";
import { IconButton } from "~/components/IconButton";
import { EditIcon } from "~/components/EditIcon";
import { SaveCancelBar } from "~/components/SaveCancelBar";
import { Button } from "~/components/Button";
import { decryptId, encryptId } from "~/utils/idCrypto";
import { useToast } from "~/components/Toast";
import { formatDateRange, toDateTimeLocalInput, validateDateTimeRange } from "~/utils/dateUtils";

type EditField = "date" | "location" | "capacity" | "category" | "description" | "image" | null;

export default function EventDetails() {
    const { eventId: rawEventId } = useParams();
    const eventId = decryptId(rawEventId);
    const curEvent = events.find((event) => String(event.id) === eventId);
    const { showToast } = useToast();

    const [editing, setEditing] = useState<EditField>(null);
    const [saving, setSaving] = useState(false);
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const [dateError, setDateError] = useState<string | null>(null);
    const [draft, setDraft] = useState({
        date: curEvent?.date ?? "",
        startDate: curEvent?.startDate || (curEvent?.date ? toDateTimeLocalInput(curEvent.date, "09:00") : ""),
        endDate: curEvent?.endDate || (curEvent?.date ? toDateTimeLocalInput(curEvent.date, "17:00") : ""),
        capacity: curEvent?.maxGuests ?? "",
        category: curEvent?.category ?? "",
        location: curEvent?.location ?? "",
        description: curEvent?.description ?? "",
        image: curEvent?.img ?? "",
    });

    const startEdit = (field: Exclude<EditField, null>) => {
        setEditing(field);
        setDateError(null);
        const curStart = curEvent?.startDate || (curEvent?.date ? toDateTimeLocalInput(curEvent.date, "09:00") : "");
        const curEnd = curEvent?.endDate || (curEvent?.date ? toDateTimeLocalInput(curEvent.date, "17:00") : "");
        setDraft({
            date: curEvent?.date ?? "",
            startDate: curStart,
            endDate: curEnd,
            capacity: curEvent?.maxGuests ?? "",
            category: curEvent?.category ?? "",
            location: curEvent?.location ?? "",
            description: curEvent?.description ?? "",
            image: curEvent?.img ?? "",
        });
    };

    const saveEdit = async () => {
        if (!curEvent) return;
        setSaving(true);

        const updatePayLoad: Record<string, string> = {};

        if (editing === "date") {
            const validation = validateDateTimeRange(draft.startDate, draft.endDate);
            if (!validation.valid) {
                setDateError(validation.error || "Invalid date-time range.");
                showToast(validation.error || "Invalid date-time range.", "error");
                setSaving(false);
                return;
            }
            const formattedDate = formatDateRange(
                { startDate: draft.startDate, endDate: draft.endDate },
                { includeWeekday: true }
            );
            updatePayLoad.startDate = draft.startDate;
            updatePayLoad.endDate = draft.endDate;
            updatePayLoad.date = formattedDate;
        }
        if (editing === "capacity") updatePayLoad.maxGuests = String(draft.capacity);
        if (editing === "category") updatePayLoad.category = draft.category;
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
            showToast("Changes saved successfully!");
        } catch {
            showToast("Failed to save changes.", "error");
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

    const handleCopyPublicLink = async () => {
        if (!curEvent) return;
        const link = `${window.location.origin}/view/${encryptId(curEvent.id)}`;
        try {
            await navigator.clipboard.writeText(link);
            showToast("Public event link copied to clipboard!");
        } catch {
            showToast("Failed to copy link.", "error");
        }
    };

    if (!curEvent) return null;

    return (
        <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6 sm:px-8">
            {/* Quick Action Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50/70 p-3.5 sm:p-4">
                <div className="flex items-center gap-2 text-sm text-brand-900">
                    <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                    <span className="font-semibold">Quick Actions:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={handleCopyPublicLink}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                        Copy Public Link
                    </Button>
                    <Link
                        to={`/view/${encryptId(curEvent.id)}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 rounded-pill bg-neutral-0 px-3 py-1.5 text-sm font-medium text-neutral-800 shadow-xs hover:bg-neutral-100 transition-colors"
                    >
                        <svg className="h-4 w-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        View Public Page
                    </Link>
                    <Link
                        to="/scanner"
                        className="inline-flex items-center gap-1.5 rounded-pill bg-brand-500 px-3 py-1.5 text-sm font-medium text-white shadow-soft hover:bg-brand-600 transition-colors"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                            <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01" />
                        </svg>
                        Open QR Scanner
                    </Link>
                </div>
            </div>

            {/* Capacity & Category */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
                <EditableField
                    editing={editing === "capacity"}
                    onEdit={() => startEdit("capacity")}
                    onSave={saveEdit}
                    onCancel={() => setEditing(null)}
                    saving={saving}
                    view={
                        <div className="flex items-center gap-2 rounded-lg p-1.5">
                            <span className="text-base font-medium text-neutral-600">Maximum Capacity:</span>
                            <span className="text-base font-bold text-neutral-800">{curEvent.maxGuests ?? 0} Guests</span>
                        </div>
                    }
                    edit={
                        <div className="flex items-center gap-2">
                            <span className="text-base font-medium text-neutral-600">Maximum Capacity:</span>
                            <Input
                                type="number"
                                min="0"
                                value={draft.capacity}
                                onChange={(e) => setDraft((current) => ({ ...current, capacity: e.target.value }))}
                                className="max-w-32"
                                autoFocus
                            />
                        </div>
                    }
                />

                <EditableField
                    editing={editing === "category"}
                    onEdit={() => startEdit("category")}
                    onSave={saveEdit}
                    onCancel={() => setEditing(null)}
                    saving={saving}
                    view={
                        <div className="flex items-center gap-2 rounded-lg p-1.5">
                            <span className="text-base font-medium text-neutral-600">Category:</span>
                            <span className="rounded-pill bg-brand-50 px-3 py-1 text-sm font-semibold capitalize text-brand-700">
                                {curEvent.category}
                            </span>
                        </div>
                    }
                    edit={
                        <div className="flex items-center gap-2">
                            <span className="text-base font-medium text-neutral-600">Category:</span>
                            <Select
                                value={draft.category}
                                onChange={(e) => setDraft((current) => ({ ...current, category: e.target.value }))}
                                className="max-w-40"
                                autoFocus
                            >
                                <option value="" disabled>Select a category</option>
                                {CATEGORY_OPTIONS.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </Select>
                        </div>
                    }
                />
            </div>

            {/* Image Banner */}
            <div className="relative mb-6 overflow-hidden rounded-2xl border border-neutral-200 shadow-card">
                <img
                    className="aspect-2/1 w-full object-cover"
                    src={editing === "image" && draft.image ? draft.image : curEvent.img}
                    alt={curEvent.title}
                />
                {editing !== "image" && (
                    <IconButton
                        size="sm"
                        onClick={() => startEdit("image")}
                        aria-label="Edit image"
                        className="absolute right-3.5 top-3.5 bg-neutral-0/95 shadow-card hover:bg-neutral-0"
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
                            <Button type="button" variant="primary" size="sm" onClick={saveEdit} disabled={saving}>
                                {saving ? "Saving..." : "Save Image"}
                            </Button>
                            <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(null)} disabled={saving}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Date */}
                <div className="rounded-xl border border-neutral-200 bg-neutral-0 p-5 shadow-soft">
                    <EditableField
                        editing={editing === "date"}
                        onEdit={() => startEdit("date")}
                        onSave={saveEdit}
                        onCancel={() => {
                            setEditing(null);
                            setDateError(null);
                        }}
                        saving={saving}
                        stacked={true}
                        view={
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Date & Time</p>
                                    <p className="mt-1 text-lg font-bold text-neutral-800">
                                        {formatDateRange(curEvent, { includeWeekday: true })}
                                    </p>
                                </div>
                            </div>
                        }
                        edit={
                            <div className="flex flex-col gap-3 w-full">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="text-xs font-semibold uppercase text-neutral-500 mb-1 block">
                                            Start Date & Time
                                        </label>
                                        <Input
                                            type="datetime-local"
                                            value={draft.startDate}
                                            onChange={(e) => {
                                                const newStart = e.target.value;
                                                setDateError(null);
                                                setDraft((current) => {
                                                    const shouldAdvanceEnd = !current.endDate || current.endDate < newStart;
                                                    return {
                                                        ...current,
                                                        startDate: newStart,
                                                        ...(shouldAdvanceEnd ? { endDate: newStart } : {}),
                                                    };
                                                });
                                            }}
                                            autoFocus
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold uppercase text-neutral-500 mb-1 block">
                                            End Date & Time
                                        </label>
                                        <Input
                                            type="datetime-local"
                                            value={draft.endDate}
                                            min={draft.startDate}
                                            onChange={(e) => {
                                                setDateError(null);
                                                setDraft((current) => ({ ...current, endDate: e.target.value }));
                                            }}
                                            required
                                        />
                                    </div>
                                </div>
                                {dateError && (
                                    <p className="text-xs font-medium text-danger-500">{dateError}</p>
                                )}
                            </div>
                        }
                    />
                </div>

                {/* Location */}
                <div className="rounded-xl border border-neutral-200 bg-neutral-0 p-5 shadow-soft">
                    <EditableField
                        editing={editing === "location"}
                        onEdit={() => startEdit("location")}
                        onSave={saveEdit}
                        onCancel={() => setEditing(null)}
                        saving={saving}
                        view={
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Location</p>
                                    <p className="mt-1 text-lg font-bold capitalize text-neutral-800">{curEvent.location || "Not set"}</p>
                                </div>
                            </div>
                        }
                        edit={
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold uppercase text-neutral-500">Edit Location</label>
                                <Input
                                    type="text"
                                    placeholder="Location or venue name"
                                    value={draft.location}
                                    onChange={(e) => setDraft((current) => ({ ...current, location: e.target.value }))}
                                    autoFocus
                                />
                            </div>
                        }
                    />
                </div>
            </div>

            {/* Description Card */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-0 shadow-soft">
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
                                onChange={(e) => setDraft((current) => ({ ...current, description: e.target.value }))}
                                placeholder="Write a detailed description for your attendees..."
                                autoFocus
                            />
                            <SaveCancelBar onSave={saveEdit} onCancel={() => setEditing(null)} saving={saving} />
                        </div>
                    ) : curEvent.description ? (
                        <>
                            <p
                                className={`max-w-prose whitespace-pre-line text-base leading-7 text-neutral-600 sm:text-[17px] ${
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
                        <p className="text-sm text-neutral-400">No description yet. Click the edit icon to add one.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
