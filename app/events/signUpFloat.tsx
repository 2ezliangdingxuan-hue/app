import { useState, type ChangeEvent, type FormEvent } from "react";
import { Modal } from "~/components/Modal";
import { FormField } from "~/components/FormField";
import { Input } from "~/components/Input";
import { Button } from "~/components/Button";

type SignUpFormData = {
    name: string;
    email: string;
    number: string;
};

type SignUpFormProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (guest: SignUpFormData) => Promise<void> | void;
};

export default function SignUpForm({ isOpen, onClose, onSubmit }: SignUpFormProps) {
    const [formData, setFormData] = useState<SignUpFormData>({
        name: "",
        email: "",
        number: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await onSubmit?.(formData);
        setSubmitted(true);
    };

    const handleClose = () => {
        setSubmitted(false);
        setFormData({ name: "", email: "", number: "" });
        onClose();
    };

    return (
        <Modal open={isOpen} onClose={handleClose} title={submitted ? "You're signed up!" : "Sign Up for This Event"}>
            {submitted ? (
                <div className="flex flex-col gap-4">
                    <p className="text-neutral-600">
                        Thanks, {formData.name || "friend"}! A confirmation with your QR code will be emailed to you shortly.
                    </p>
                    <Button type="button" variant="primary" className="w-full" onClick={handleClose}>
                        Close
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <FormField label="Name" htmlFor="signup-name">
                        <Input
                            id="signup-name"
                            name="name"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </FormField>
                    <FormField label="Email" htmlFor="signup-email">
                        <Input
                            id="signup-email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </FormField>
                    <FormField label="Phone Number (optional)" htmlFor="signup-number">
                        <Input
                            id="signup-number"
                            name="number"
                            type="tel"
                            placeholder="Phone number"
                            value={formData.number}
                            onChange={handleChange}
                        />
                    </FormField>

                    <Button type="submit" variant="primary" className="mt-2 w-full">
                        Sign Up
                    </Button>
                </form>
            )}
        </Modal>
    );
}
