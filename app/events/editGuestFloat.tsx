import { Button } from "~/components/Button";
import { FormField } from "~/components/FormField";
import { Input } from "~/components/Input";
import { Textarea } from "~/components/Textarea";
import { Select } from "~/components/Select";
import { Modal } from "~/components/Modal";
import { useParams } from "react-router";
import { events, editGuest, deleteGuest } from "../../server/events";
import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { decryptId } from "~/utils/idCrypto";
import { useToast } from "~/components/Toast";

type GuestFormData = {
    name: string;
    email: string;
    number: string;
    remarks: string;
    rsvp: string;
};

type GuestFormProps = {
    isOpen: boolean;
    onClose: () => void;
    event: typeof events[0];
    guestId: string;
};

export default function EditGuestFloat({ isOpen, onClose, event, guestId }: GuestFormProps) {
    const { eventId: rawEventId } = useParams();
    const eventId = decryptId(rawEventId);
    const curEvent = events.find((e) => eventId === String(e.id));
    const guest = curEvent?.guests?.[guestId];
    const { showToast } = useToast();

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formData, setFormData] = useState<GuestFormData>({
        name: guest?.name ?? "",
        email: guest?.email ?? "",
        number: guest?.number ?? "",
        remarks: guest?.remarks ?? "",
        rsvp: guest?.rsvp ?? "Pending",
    });

    useEffect(() => {
        setFormData({
            name: guest?.name ?? "",
            email: guest?.email ?? "",
            number: guest?.number ?? "",
            remarks: guest?.remarks ?? "",
            rsvp: guest?.rsvp ?? "Pending",
        });
    }, [guestId, guest]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!eventId) return;
        setIsSaving(true);
        try {
            await editGuest(eventId, guestId, {
                name: formData.name,
                email: formData.email,
                number: formData.number,
                remarks: formData.remarks,
                rsvp: formData.rsvp,
            });
            showToast("Guest details updated!");
            onClose();
        } catch {
            showToast("Failed to update guest.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteGuest = async () => {
        const confirmation = window.confirm(`Are you sure you want to remove ${guest?.name || "this guest"}?`);
        if (!confirmation || !eventId) return;
        setIsDeleting(true);
        try {
            await deleteGuest(eventId, guestId);
            showToast("Guest removed from event.", "info");
            onClose();
        } catch {
            showToast("Failed to delete guest.", "error");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <Modal open={isOpen} onClose={onClose} title="Edit Guest Details">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <FormField label="Full Name" htmlFor="edit-guest-name">
                    <Input
                        id="edit-guest-name"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </FormField>

                <FormField label="Email Address" htmlFor="edit-guest-email">
                    <Input
                        id="edit-guest-email"
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                    <FormField label="Phone (Optional)" htmlFor="edit-guest-number">
                        <Input
                            id="edit-guest-number"
                            name="number"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={formData.number}
                            onChange={handleChange}
                        />
                    </FormField>

                    <FormField label="RSVP Status" htmlFor="edit-guest-rsvp">
                        <Select
                            id="edit-guest-rsvp"
                            name="rsvp"
                            value={formData.rsvp}
                            onChange={handleChange}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Going">Going</option>
                            <option value="Declined">Declined</option>
                        </Select>
                    </FormField>
                </div>

                <FormField label="Remarks / Notes (Optional)" htmlFor="edit-guest-remarks">
                    <Textarea
                        id="edit-guest-remarks"
                        name="remarks"
                        rows={2}
                        placeholder="Special requests, dietary preferences..."
                        value={formData.remarks}
                        onChange={handleChange}
                    />
                </FormField>

                <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-neutral-100">
                    <Button type="submit" variant="primary" disabled={isSaving} className="w-full">
                        {isSaving ? "Saving Changes..." : "Save Guest Details"}
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        onClick={handleDeleteGuest}
                        disabled={isDeleting}
                        className="w-full bg-red text-black"
                    >
                        {isDeleting ? "Removing..." : "Remove Guest"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}