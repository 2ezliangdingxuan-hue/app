import { EmptyState } from "~/components/EmptyState";

export default function rsvp() {
    return (
        <div className="px-2 py-4">
            <EmptyState
                title="RSVP tracking coming soon"
                description="See who's confirmed, declined, or still pending for this event."
            />
        </div>
    )
}