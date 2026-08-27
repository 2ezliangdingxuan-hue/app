import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getCollaborators, inviteCollaborator, removeCollaborator, type CollaboratorAccount } from "../../server/events";
import { useAuth } from "~/auth/AuthContext";
import { PageHeader } from "~/components/PageHeader";
import { FormField } from "~/components/FormField";
import { Input } from "~/components/Input";
import { Button } from "~/components/Button";
import { decryptId } from "~/utils/idCrypto";

export default function Collaborators() {
    const { eventId: rawEventId } = useParams();
    const eventId = decryptId(rawEventId);
    const { account, token } = useAuth();

    const [owner, setOwner] = useState<CollaboratorAccount | null>(null);
    const [collaborators, setCollaborators] = useState<CollaboratorAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [email, setEmail] = useState("");
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [isInviting, setIsInviting] = useState(false);
    const [removingId, setRemovingId] = useState<number | null>(null);

    async function loadCollaborators() {
        if (!eventId) return;
        setIsLoading(true);
        const result = await getCollaborators(eventId);
        if (result.ok) {
            setOwner(result.owner);
            setCollaborators(result.collaborators);
        }
        setIsLoading(false);
    }

    useEffect(() => {
        loadCollaborators();
    }, [eventId]);

    const isManager =
        !!account &&
        (owner?.id === account.id || collaborators.some((c) => c.id === account.id));

    const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!eventId) return;
        setInviteError(null);
        setIsInviting(true);
        try {
            const result = await inviteCollaborator(eventId, email, token);
            if (!result.ok) {
                setInviteError(result.error || "Unable to invite that account.");
                return;
            }
            setEmail("");
            await loadCollaborators();
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemove = async (accountId: number) => {
        if (!eventId) return;
        setRemovingId(accountId);
        try {
            await removeCollaborator(eventId, accountId, token);
            await loadCollaborators();
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <main className="mx-auto w-full max-w-2xl px-4 pb-10 pt-6 sm:px-8">
            <PageHeader title="Collaborators" />

            {isLoading ? (
                <p className="py-6 text-sm text-neutral-500">Loading collaborators...</p>
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="rounded-xl border border-neutral-200 bg-neutral-0 shadow-card">
                        <div className="border-b border-neutral-100 px-5 py-3">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Owner</h2>
                        </div>
                        <div className="px-5 py-4">
                            {owner ? (
                                <div>
                                    <p className="font-medium text-neutral-800">{owner.name || owner.email}</p>
                                    <p className="text-sm text-neutral-500">{owner.email}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-neutral-400">No owner on record for this event.</p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-neutral-0 shadow-card">
                        <div className="border-b border-neutral-100 px-5 py-3">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                                Collaborators ({collaborators.length})
                            </h2>
                        </div>
                        {collaborators.length === 0 ? (
                            <p className="px-5 py-4 text-sm text-neutral-400">
                                No collaborators yet. Invite someone below to help manage this event.
                            </p>
                        ) : (
                            <ul className="divide-y divide-neutral-100">
                                {collaborators.map((collaborator) => (
                                    <li key={collaborator.id} className="flex items-center justify-between px-5 py-3">
                                        <div>
                                            <p className="font-medium text-neutral-800">{collaborator.name || collaborator.email}</p>
                                            <p className="text-sm text-neutral-500">{collaborator.email}</p>
                                        </div>
                                        {(isManager || collaborator.id === account?.id) && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleRemove(collaborator.id)}
                                                disabled={removingId === collaborator.id}
                                            >
                                                {removingId === collaborator.id
                                                    ? "Removing..."
                                                    : collaborator.id === account?.id
                                                    ? "Leave"
                                                    : "Remove"}
                                            </Button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {isManager ? (
                        <form
                            onSubmit={handleInvite}
                            className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-neutral-0 p-5 shadow-card"
                        >
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                                Invite a collaborator
                            </h2>
                            <FormField label="Account email" htmlFor="collaborator-email">
                                <Input
                                    type="email"
                                    id="collaborator-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="teammate@example.com"
                                    required
                                />
                            </FormField>
                            {inviteError && <p className="text-sm text-danger-500">{inviteError}</p>}
                            <Button type="submit" variant="primary" disabled={isInviting}>
                                {isInviting ? "Inviting..." : "Invite"}
                            </Button>
                        </form>
                    ) : (
                        <p className="text-sm text-neutral-500">
                            Only the owner or a collaborator can invite others to manage this event.
                        </p>
                    )}
                </div>
            )}
        </main>
    );
}
