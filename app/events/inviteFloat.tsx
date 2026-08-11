import { useState, type ChangeEvent, type FormEvent } from "react";
import { Modal } from "~/components/Modal";
import { FormField } from "~/components/FormField";
import { Input } from "~/components/Input";
import { Button } from "~/components/Button";

type GuestFormData ={
    name: string;
    email: string;
}
type InviteFormProps={
    isOpen: boolean;
    onClose: () => void;
    onSubmit?:(guest: GuestFormData) => Promise<void> | void;
}

export default function InviteForm({isOpen, onClose, onSubmit}:InviteFormProps){
    const [formData, setFormData] = useState<GuestFormData>({
        name:"",
        email:"",
    });

    const handleChange = (e :ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    }

    const handleSubmit = async (e : FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        await onSubmit?.(formData);
        onClose();
    };

    return(
        <Modal open={isOpen} onClose={onClose} title="Invite Guest">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <FormField label="Name" htmlFor="invite-name">
                    <Input
                        id="invite-name"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </FormField>
                <FormField label="Email" htmlFor="invite-email">
                    <Input
                        id="invite-email"
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </FormField>

                <Button type="submit" variant="primary" className="mt-2 w-full">
                    Save Guest
                </Button>
            </form>
        </Modal>
    )
}