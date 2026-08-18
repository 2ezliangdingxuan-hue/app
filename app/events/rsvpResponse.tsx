import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getGuestRsvp, submitRsvp } from "../../src/data/events";
import { Button } from "~/components/Button";

type RsvpGuest = { name: string; rsvp: "Pending" | "Going" | "Declined"; rsvpAt: string | null };
type RsvpEvent = { title?: string; date?: string; location?: string };

export default function RsvpResponse() {
    const { eventId, guestId } = useParams();
    const [guest, setGuest] = useState<RsvpGuest | null>(null);
    const [event, setEvent] = useState<RsvpEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [submitting, setSubmitting] = useState<"Going" | "Declined" | null>(null);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!eventId || !guestId) return;
        (async () => {
            const payload = await getGuestRsvp(eventId, guestId);
            if (payload.ok && payload.guest) {
                setGuest(payload.guest);
                setEvent(payload.event ?? null);
            } else {
                setNotFound(true);
            }
            setLoading(false);
        })();
    }, [eventId, guestId]);

    async function handleRespond(response: "Going" | "Declined") {
        if (!eventId || !guestId) return;
        setSubmitting(response);
        const payload = await submitRsvp(eventId, guestId, response);
        if (payload.ok && payload.guest) {
            setGuest({ name: guest?.name ?? "", rsvp: payload.guest.rsvp, rsvpAt: payload.guest.rsvpAt });
        }
        setSubmitting(null);
        setSubmitted(true);
    }

    if (loading) {
        return (
            <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-8">
                <p className="text-neutral-500">Loading...</p>
            </div>
        );
    }

    if (notFound || !guest) {
        return (
            <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-8">
                <p className="text-neutral-500">This RSVP link is invalid or the event no longer exists.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-8">
            <h1 className="mb-2 text-2xl font-bold text-neutral-800">{event?.title || "Event"}</h1>
            <div className="mb-6 flex flex-col gap-1 text-neutral-600">
                {event?.date && <p>Date: <span className="font-medium text-neutral-800">{event.date}</span></p>}
                {event?.location && <p>Location: <span className="font-medium text-neutral-800">{event.location}</span></p>}
            </div>

            {submitted ? (
                <p className="text-lg text-neutral-700">
                    Thanks, {guest.name || "friend"}! You're marked as{" "}
                    <span className="font-semibold">{guest.rsvp}</span> for this event.
                </p>
            ) : (
                <>
                    <p className="mb-4 text-neutral-700">
                        Hi {guest.name || "there"}, will you be attending?
                        {guest.rsvp !== "Pending" && (
                            <span className="block text-sm text-neutral-500">
                                Current response: <span className="font-medium">{guest.rsvp}</span>
                            </span>
                        )}
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant={guest.rsvp === "Going" ? "primary" : "secondary"}
                            onClick={() => handleRespond("Going")}
                            disabled={submitting !== null}
                            className="flex-1"
                        >
                            {submitting === "Going" ? "Saving..." : "I'm Going"}
                        </Button>
                        <Button
                            variant={guest.rsvp === "Declined" ? "danger" : "secondary"}
                            onClick={() => handleRespond("Declined")}
                            disabled={submitting !== null}
                            className="flex-1"
                        >
                            {submitting === "Declined" ? "Saving..." : "Can't Make It"}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
