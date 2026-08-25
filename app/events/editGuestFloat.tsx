import { Button } from "~/components/Button"
import { FormField } from "~/components/FormField"
import { Input } from "~/components/Input"
import { Modal } from "~/components/Modal"
import { useParams } from "react-router"
import { events, editGuest } from "../../server/events"
import { useState, useEffect, type FormEvent, type ChangeEvent } from "react"


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
    event: typeof events[0];
    guestId:string
}

export default function EditGuestFloat({isOpen, onClose, event, guestId}: GuestFormProps){

    const {eventId} = useParams()
    const curEvent = events.find((event)=>eventId === String(event.id))
    const guest = curEvent?.guests?.[guestId]
    const [formData, setFormData] = useState<GuestFormData>({
        name: guest?.name ?? "",
        email: guest?.email ?? "",
        number: guest?.number ?? "",
        remark: guest?.remarks ?? "",
        rsvp: guest?.rsvp ?? ""
    })

    useEffect(() =>{
        setFormData({
            name: guest?.name ?? "",
            email: guest?.email ?? "",
            number: guest?.number ?? "",
            remark: guest?.remarks ?? "",
            rsvp: guest?.rsvp ?? ""
        })
    },[guestId, guest])

    const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!eventId) return;
        editGuest(eventId, guestId, formData);
        onClose();
    }

    const handleDeleteGuest = () =>{
        const confirmation = window.confirm(
            "Are you sure you want to delete this guest?"
        )
        if(!confirmation) return;
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) =>{
        const {name, value} = e.target;
        setFormData((prev) => ({...prev,[name]:value}))
    }
    
    
    return(
        <Modal open={isOpen} onClose={onClose} title="Edit Guest">
            <p>Editing: {guestId} {guest?.name}</p>
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
                        
                    />
                </FormField>

                <Button type="submit" variant="primary" className="mt-2 w-full">
                    Save Guest
                </Button>
            </form>
            <button onClick={handleDeleteGuest} className=" mt-4 w-full h-10 text-white font-medium rounded-full bg-red-700">
                    Delete Guest
            </button>
        </Modal>
    )
}