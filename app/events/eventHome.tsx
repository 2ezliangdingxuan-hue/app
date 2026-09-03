import { Link, useParams } from "react-router";
import { events, updateEvent } from "../../server/events";
import { useState } from "react";
import { EditableField } from "~/components/EditableField";
import { Input } from "~/components/Input";
import { NavLinkItem } from "~/components/NavList";
import { decryptId } from "~/utils/idCrypto";
import { useToast } from "~/components/Toast";

type TabItem = {
    to: string;
    label: string;
    badge?: number | string;
    end?: boolean;
    relative?: "route" | "path";
};

export function EventHome() {
    const { eventId: rawEventId } = useParams();
    const eventId = decryptId(rawEventId);
    const curEvent = events.find((event) => String(event.id) === eventId);
    const { showToast } = useToast();

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [saving, setSaving] = useState(false);
    const [titleDraft, setTitleDraft] = useState(curEvent?.title ?? "");

    const guestCount = curEvent?.guests ? Object.keys(curEvent.guests).length : 0;
    const rsvpCount = curEvent?.guests
        ? Object.values(curEvent.guests).filter((g: any) => g.rsvp && g.rsvp !== "Pending").length
        : 0;
    const collaboratorCount = (curEvent?.collaboratorIds?.length ?? 0) + 1;

    const tabs: TabItem[] = [
        { to: ".", label: "Overview", end: true, relative: "path" },
        { to: "guestList", label: "Guestlist", badge: guestCount > 0 ? guestCount : undefined },
        //{ to: "rsvp", label: "RSVP", badge: rsvpCount > 0 ? rsvpCount : undefined },
        //{ to: "invite", label: "Invite" },
        { to: "collaborators", label: "Collaborators", badge: collaboratorCount > 1 ? collaboratorCount : undefined },
    ];

    const startEditTitle = () => {
        setTitleDraft(curEvent?.title ?? "");
        setIsEditingTitle(true);
    };

    const saveTitle = async () => { 
        if (!curEvent) return;
        setSaving(true);
        try {
            await updateEvent(String(curEvent.id), { title: titleDraft });
            const index = events.findIndex((event) => String(event.id) === eventId);
            if (index >= 0) {
                events[index] = { ...events[index], title: titleDraft };
            }
            showToast("Event title updated!");
        } catch {
            showToast("Failed to update title.", "error");
        } finally {
            setSaving(false);
            setIsEditingTitle(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-8">
            {/* Breadcrumb Navigation */}
            <nav className="mb-4 flex items-center gap-2 text-sm text-neutral-500" aria-label="Breadcrumb">
                <Link to="/events" className="font-medium hover:text-brand-600 transition-colors">
                    Events
                </Link>
                <span>/</span>
                <span className="truncate font-semibold text-neutral-800">{curEvent?.title || "Event"}</span>
            </nav>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <EditableField
                    editing={isEditingTitle}
                    onEdit={startEditTitle}
                    onSave={saveTitle}
                    onCancel={() => setIsEditingTitle(false)}
                    saving={saving}
                    view={
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-extrabold capitalize tracking-tight text-neutral-900 sm:text-4xl">
                                {curEvent?.title}
                            </h1>
                            
                        </div>
                    }
                    edit={
                        <Input
                            value={titleDraft}
                            onChange={(e) => setTitleDraft(e.target.value)}
                            className="max-w-sm"
                            autoFocus
                        />
                    }
                />
                <span className="rounded-pill bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
                                {curEvent?.category || "Event"}
                            </span>
            </div>

            {/* Segmented Sub-Nav */}
            <nav className="border-b border-neutral-200">
                <ul className="flex flex-wrap items-center gap-1 sm:gap-2 -mb-px">
                    {tabs.map((item) => (
                        <li key={item.to}>
                            <NavLinkItem
                                to={item.to}
                                end={item.end}
                                relative={item.relative}
                                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all"
                            >
                                <span>{item.label}</span>
                                {item.badge !== undefined && (
                                    <span className="rounded-full bg-neutral-200/80 px-2 py-0.5 text-xs font-semibold text-neutral-700 group-hover:bg-brand-100">
                                        {item.badge}
                                    </span>
                                )}
                            </NavLinkItem>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}
