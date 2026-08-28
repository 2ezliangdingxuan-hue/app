import { EmptyState } from "~/components/EmptyState";

export default function Activities() {
    return (
        <div className="px-2 py-4">
            <EmptyState
                title="Activities coming soon"
                description="Plan and share activities for this event once this feature ships."
            />
        </div>
    )
}