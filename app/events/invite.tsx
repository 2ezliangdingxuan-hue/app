import { useState, type FormEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router";
import { addGuest } from "../../server/events";
import { FormField } from "~/components/FormField";
import { Input } from "~/components/Input";
import { Textarea } from "~/components/Textarea";
import { Button } from "~/components/Button";
import { Copy } from "~/components/CopyToClipboard";
import { decryptId } from "~/utils/idCrypto";
import { useToast } from "~/components/Toast";

export default function Invite() {
    const { eventId: rawEventId } = useParams();
    const eventId = decryptId(rawEventId);
    const { showToast } = useToast();
    const [formData, setFormData] = useState({ name: "", email: "", number: "", remarks: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [latestQrValue, setLatestQrValue] = useState<string | null>(null);
    const [lastAddedName, setLastAddedName] = useState<string | null>(null);

    async function handleNewGuest(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const name = formData.name.trim();
        if (!name) {
            showToast("Please enter a guest name.", "error");
            return;
        }
        const currentEventId = eventId ?? "";
        setIsSubmitting(true);

        try {
            const payload = await addGuest(currentEventId, {
                name,
                email: formData.email.trim(),
                number: formData.number.trim(),
                remarks: formData.remarks.trim(),
            });

            const guestId = payload.guestId ?? payload.guest?.id ?? "";

            showToast(`Added ${name} to guestlist!`);
            setLastAddedName(name);
            setFormData({ name: "", email: "", number: "", remarks: "" });
            setLatestQrValue(eventId + ":" + guestId);
        } catch (err) {
            console.error(err);
            showToast("Failed to add guest.", "error");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 px-4 pb-16 pt-6 sm:px-8">
            <div className="w-full text-center">
                <h1 className="text-2xl font-bold text-neutral-900">Direct Guest Invite</h1>
                <p className="mt-1 text-sm text-neutral-500">
                    Add a guest manually and instantly generate their check-in QR code.
                </p>
            </div>

            <form
                className="flex w-full flex-col gap-4 rounded-2xl border border-neutral-200 bg-neutral-0 p-6 shadow-card"
                onSubmit={handleNewGuest}
            >
                <FormField label="Full Name" htmlFor="invite-page-name">
                    <Input
                        type="text"
                        id="invite-page-name"
                        name="fname"
                        placeholder="e.g. Jordan Smith"
                        value={formData.name}
                        onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                        required
                    />
                </FormField>

                <FormField label="Email Address" htmlFor="invite-page-email">
                    <Input
                        type="email"
                        id="invite-page-email"
                        name="email"
                        placeholder="jordan@example.com"
                        value={formData.email}
                        onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                        required
                    />
                </FormField>

                <FormField label="Phone Number (Optional)" htmlFor="invite-number">
                    <Input
                        id="invite-number"
                        name="number"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.number}
                        onChange={(event) => setFormData((current) => ({ ...current, number: event.target.value }))}
                    />
                </FormField>

                <FormField label="Remarks / Notes (Optional)" htmlFor="invite-remarks">
                    <Textarea
                        id="invite-remarks"
                        name="remarks"
                        rows={2}
                        placeholder="Table number, special notes..."
                        value={formData.remarks}
                        onChange={(event) => setFormData((current) => ({ ...current, remarks: event.target.value }))}
                    />
                </FormField>

                <Button type="submit" variant="primary" disabled={isSubmitting} className="mt-2 w-full">
                    {isSubmitting ? "Generating QR Code..." : "Add Guest & Generate QR"}
                </Button>
            </form>

            <div className="w-full">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">Shareable Public Sign-Up Link</p>
                <Copy eventId={String(eventId) ?? ""} />
            </div>

            {latestQrValue && (
                <div className="flex w-full flex-col items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50/50 p-6 shadow-card animate-in zoom-in-95">
                    <div className="text-center">
                        <p className="text-base font-bold text-brand-900">QR Code for {lastAddedName || "Guest"}</p>
                        <p className="text-xs text-brand-700">Scan this code at the door for instant check-in.</p>
                    </div>
                    <div className="rounded-xl bg-white p-4 shadow-soft">
                        <QRCodeSVG value={latestQrValue} size={200} />
                    </div>
                </div>
            )}
        </div>
    );
}