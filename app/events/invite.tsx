import { useState, type FormEvent} from "react";
import { QRCodeSVG } from "qrcode.react"
import { useParams } from "react-router";
import { addGuest } from "../../src/data/events"
import { FormField } from "~/components/FormField";
import { Input } from "~/components/Input";
import { Button } from "~/components/Button";

export default function Invite() {
    const{ eventId } = useParams();
    const[formData, setFormData] = useState({name: "", email: ""});
    const[statusMessage, setStatusMessage] = useState("");
    const[isError, setIsError] = useState(false);

    const [latestQrValue, setLatestQrValue] = useState<string | null>(null);


    async function handleNewGuest(event: FormEvent<HTMLFormElement>){
        event.preventDefault();
        const name = formData.name.trim();
        if (!name){
            setIsError(true);
            setStatusMessage("Please enter a guest name.");
            return;
        }
        const currentEventId = eventId ?? "";

        try {
            const payload = await addGuest(currentEventId, {
                name,
                email: formData.email.trim(),
            });

            const guestId = payload.guestId ?? payload.guest?.id ?? "";

            setIsError(false);
            setStatusMessage(`Added ${name}`);
            setFormData({name:"", email:""});
            setLatestQrValue(eventId + ":" + guestId)
        }
        catch (err){
            console.error(err);
            setIsError(true);
            setStatusMessage("Failed to add guest.");
        }
    }


    return(
        <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 px-4 py-10">
            <h1 className="text-2xl font-bold text-neutral-800">Invite a guest</h1>

            <form
                className="flex w-full flex-col gap-4 rounded-xl border border-neutral-200 bg-neutral-0 p-6 shadow-card"
                onSubmit={handleNewGuest}>
                <FormField label="Name" htmlFor="invite-page-name">
                    <Input
                    type="text"
                    id="invite-page-name"
                    name="fname"
                    value={formData.name}
                    onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                    />
                </FormField>

                <FormField label="Email" htmlFor="invite-page-email">
                    <Input
                    type="email"
                    id="invite-page-email"
                    name="email"
                    value={formData.email}
                    onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                    />
                </FormField>

                <Button type="submit" variant="primary" className="mt-2 w-full">
                    Add guest & generate QR
                </Button>
            </form>

            {statusMessage ? (
                <p className={`text-sm ${isError ? "text-danger-500" : "text-success-500"}`}>{statusMessage}</p>
            ) : null}

            {latestQrValue && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-0 p-6 shadow-card">
                    <p className="text-sm font-medium text-neutral-600">Guest QR code</p>
                    <QRCodeSVG value={latestQrValue} size={220}/>
                </div>
            )}
        </div>
    )
}