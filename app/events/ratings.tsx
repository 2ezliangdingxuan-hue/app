import { EmptyState } from "~/components/EmptyState";

export default function Ratings() {
    return (
        <div className="px-2 py-4">
            <EmptyState
                title="Ratings coming soon"
                description="Guest feedback and ratings for this event will show up here."
            />
        </div>
    )
}