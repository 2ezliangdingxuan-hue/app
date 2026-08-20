import { useParams } from "react-router";
import { events, updateEvent } from "../../src/data/events";
import { useState } from "react";
import { EditableField } from "~/components/EditableField";
import { Input } from "~/components/Input";
import { NavLinkItem } from "~/components/NavList";

type TabItem = {
    to: string;
    label: string;
    end?: boolean;
    relative?: "route" | "path";
};

const TABS: TabItem[] = [
    { to: ".", label: "Home", end: true, relative: "path" },
    { to: "invite", label: "Invite" },
    // { to: "rsvp", label: "RSVP" },
    { to: "guestList", label: "Guestlist" },
    { to: "collaborators", label: "Collaborators" },
];

export function EventHome() {
    let {eventId} = useParams();
    const curEvent = events.find((event) => String(event.id) === eventId);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [saving, setSaving] = useState(false);
    const [titleDraft, setTitleDraft] = useState(curEvent?.title ?? "");

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
        } finally {
            setSaving(false);
            setIsEditingTitle(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-4xl px-4 pt-8 sm:px-8">
            <div className="mb-6">
                <EditableField
                    editing={isEditingTitle}
                    onEdit={startEditTitle}
                    onSave={saveTitle}
                    onCancel={() => setIsEditingTitle(false)}
                    saving={saving}
                    view={<h1 className="text-3xl font-bold capitalize text-neutral-800 sm:text-4xl">{curEvent?.title}</h1>}
                    edit={
                        <Input
                        value={titleDraft}
                        onChange={(e) => setTitleDraft(e.target.value)}
                        className="max-w-sm"/>
                    }
                />
            </div>

            <nav className="flex flex-row border-b justify-center border-neutral-200 pb-4">
                <ul className="flex flex-row flex-wrap items-center justify-between gap-x-8">
                    {TABS.map((item) => (
                        <li key={item.to}>
                            <NavLinkItem to={item.to} end={item.end} relative={item.relative}>
                                {item.label}
                            </NavLinkItem>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    )
}
