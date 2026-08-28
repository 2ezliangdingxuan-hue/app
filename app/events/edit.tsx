import { EmptyState } from "~/components/EmptyState";

export default function Edit() {
    return (
        <div className="px-2 py-4">
            <EmptyState
                title="Editing lives on the event home"
                description="Use the pencil icons on the event's home tab to update its details."
            />
        </div>
    )
}