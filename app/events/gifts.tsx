import { EmptyState } from "~/components/EmptyState";

export default function Gifts() {
    return (
        <div className="px-2 py-4">
            <EmptyState
                title="Gift registry coming soon"
                description="Guests will be able to browse and reserve gifts here."
            />
        </div>
    )
}