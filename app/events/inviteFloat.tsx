import { useState, type ChangeEvent, type FormEvent } from "react";
import { Modal } from "~/components/Modal";
import { FormField } from "~/components/FormField";
import { Input } from "~/components/Input";
import { Textarea } from "~/components/Textarea";
import { Button } from "~/components/Button";
import { Copy } from "~/components/CopyToClipboard";
import { useParams } from "react-router";
import { decryptId } from "~/utils/idCrypto";



type GuestFormData = {
    name: string;
    email: string;
    number: string;
    remarks: string;
};

type InviteFormProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (guest: GuestFormData) => Promise<void> | void;
};

export default function InviteForm({ isOpen, onClose, onSubmit }: InviteFormProps) {
    const { eventId: rawEventId } = useParams();
    const eventId = decryptId(rawEventId);
    const [formData, setFormData] = useState<GuestFormData>({
        name: "",
        email: "",
        number: "",
        remarks: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit?.(formData);
            setFormData({ name: "", email: "", number: "", remarks: "" });
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal open={isOpen} onClose={onClose} title="Invite New Guest">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <FormField label="Full Name" htmlFor="invite-modal-name">
                    <Input
                        id="invite-modal-name"
                        name="name"
                        placeholder="e.g. Alex Johnson"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        autoFocus
                    />
                </FormField>

                <FormField label="Email Address" htmlFor="invite-modal-email">
                    <Input
                        id="invite-modal-email"
                        name="email"
                        type="email"
                        placeholder="alex@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </FormField>

                <FormField label="Phone Number (Optional)" htmlFor="invite-modal-number">
                    <Input
                        id="invite-modal-number"
                        name="number"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.number}
                        onChange={handleChange}
                    />
                </FormField>

                <FormField label="Remarks / Notes (Optional)" htmlFor="invite-modal-remarks">
                    <Textarea
                        id="invite-modal-remarks"
                        name="remarks"
                        rows={2}
                        placeholder="Table assignment, VIP status, etc."
                        value={formData.remarks}
                        onChange={handleChange}
                    />
                </FormField>

                <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-neutral-100">
                    <Button type="submit" variant="primary" disabled={submitting} className="w-full">
                        {submitting ? "Sending Invite & Generating QR..." : "Send Invite & Save"}
                    </Button>
                </div>
            </form>

            <div className="w-full mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">Shareable Public Sign-Up Link</p>
                <Copy eventId={String(eventId) ?? ""} />
            </div>
        </Modal>
    );
}