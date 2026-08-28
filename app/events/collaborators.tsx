import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getCollaborators, inviteCollaborator, removeCollaborator, type CollaboratorAccount } from "../../server/events";
import { useAuth } from "~/auth/AuthContext";
import { PageHeader } from "~/components/PageHeader";
import { FormField } from "~/components/FormField";
import { Input } from "~/components/Input";
import { Button } from "~/components/Button";
import { decryptId } from "~/utils/idCrypto";
import { useToast } from "~/components/Toast";

export default function Collaborators() {
    const { eventId: rawEventId } = useParams();
    const eventId = decryptId(rawEventId);
    const { account, token } = useAuth();
    const { showToast } = useToast();

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
                showToast(result.error || "Failed to invite collaborator.", "error");
                return;
            }
            showToast(`Invited ${email} as collaborator!`);
            setEmail("");
            await loadCollaborators();
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemove = async (accountId: number, collabName: string) => {
        if (!eventId) return;
        setRemovingId(accountId);
        try {
            await removeCollaborator(eventId, accountId, token);
            showToast(`Removed ${collabName} from collaborators.`);
            await loadCollaborators();
        } catch {
            showToast("Failed to remove collaborator.", "error");
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <main className="mx-auto w-full max-w-2xl px-4 pb-12 pt-6 sm:px-8">
            <PageHeader title="Event Team & Collaborators" />

            {isLoading ? (
                <div className="flex items-center gap-3 py-8 text-neutral-500">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                    <p className="text-sm">Loading team members...</p>
                </div>
            ) : (
                <div className="mt-6 flex flex-col gap-6">
                    {/* Owner Card */}
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-0 shadow-card">
                        <div className="border-b border-neutral-100 px-6 py-3.5 flex items-center justify-between">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Primary Organizer</h2>
                            <span className="rounded-pill bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">Owner</span>
                        </div>
                        <div className="px-6 py-4">
                            {owner ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                                        {(owner.name || owner.email).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-neutral-900">{owner.name || owner.email}</p>
                                        <p className="text-xs text-neutral-500">{owner.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-neutral-400">No owner on record for this event.</p>
                            )}
                        </div>
                    </div>

                    {/* Collaborators List */}
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-0 shadow-card">
                        <div className="border-b border-neutral-100 px-6 py-3.5">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                                Collaborators ({collaborators.length})
                            </h2>
                        </div>
                        {collaborators.length === 0 ? (
                            <div className="p-8 text-center text-sm text-neutral-400">
                                <p>No collaborators assigned yet.</p>
                                <p className="mt-1 text-xs">Invite teammates below to give them co-management access.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-neutral-100">
                                {collaborators.map((collaborator) => (
                                    <li key={collaborator.id} className="flex items-center justify-between px-6 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-700">
                                                {(collaborator.name || collaborator.email).charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-neutral-900">{collaborator.name || collaborator.email}</p>
                                                <p className="text-xs text-neutral-500">{collaborator.email}</p>
                                            </div>
                                        </div>
                                        {(isManager || collaborator.id === account?.id) && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleRemove(collaborator.id, collaborator.name || collaborator.email)}
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

                    {/* Invite Form */}
                    {isManager ? (
                        <form
                            onSubmit={handleInvite}
                            className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-neutral-0 p-6 shadow-card"
                        >
                            <div>
                                <h2 className="text-base font-bold text-neutral-900">Invite a Collaborator</h2>
                                <p className="text-xs text-neutral-500">Collaborators can edit event details, manage guests, and scan QR tickets.</p>
                            </div>
                            <FormField label="Account Email Address" htmlFor="collaborator-email">
                                <Input
                                    type="email"
                                    id="collaborator-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="teammate@example.com"
                                    required
                                />
                            </FormField>
                            {inviteError && <p className="text-xs font-medium text-red-600">{inviteError}</p>}
                            <Button type="submit" variant="primary" disabled={isInviting} className="w-full">
                                {isInviting ? "Sending Invitation..." : "Send Invitation"}
                            </Button>
                        </form>
                    ) : (
                        <p className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-center text-xs text-neutral-500">
                            Only the event owner or an active collaborator can invite teammates.
                        </p>
                    )}
                </div>
            )}
        </main>
    );
}
