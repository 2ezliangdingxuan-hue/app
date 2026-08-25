import { Button } from "~/components/Button"
import { FormField } from "~/components/FormField"
import { Input } from "~/components/Input"
import { Modal } from "~/components/Modal"
import { useParams } from "react-router"
import { events } from "../../server/events"
import { useState, type FormEvent, type ChangeEvent } from "react"


type GuestFormData = {
    name: string;
    email: string;
    number: string;
    remark: string;
    rsvp:string;
}

type GuestFormProps = {
    isOpen: boolean;
    onClose: () => void;
}

export default function editGuestFloat({isOpen, onClose}: GuestFormProps, event: typeof events[0], guestId:string){


    const [formData, setFormData] = useState<GuestFormData>({
        name: event.guests?.guestId.name || "",
        email: event.guests?.guestId.email || "",
        number: event.guests?.guestId.number || "",
        remark: event.guests?.guestId.remarks || "",
        rsvp: event.guests?.guestId.rsvp || ""
    })

    const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onClose();
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) =>{
        const {name, value} = e.target;
        setFormData((prev) => ({...prev,[name]:value}))
    }
    
    return(
        <Modal open={isOpen} onClose={onClose}>
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
                <FormField label="Number(Optional)" htmlFor="invite-number">
                    <Input
                        id="invite-number"
                        name="number"
                        type="tel"
                        placeholder="Number(Optional)"
                        value={formData.number}
                        onChange={handleChange}
                    />
                </FormField>
                <FormField label="Remarks(Optional)" htmlFor="invite-remarks">
                    <Input
                        id="invite-remarks"
                        name="remarks"
                        type="remarks"
                        placeholder="Remarks(Optional)"
                        value={formData.remark}
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