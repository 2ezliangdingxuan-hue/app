import { useState, type FormEvent} from "react";
import { QRCodeSVG } from "qrcode.react"
import { useParams } from "react-router";
import { addGuest } from "../../src/data/events"

export default function Invite() { 
    const{ eventId } = useParams();
    const[text, setText] = useState("");
    const[formData, setFormData] = useState({name: "", email: "", number: ""});
    const[statusMessage, setStatusMessage] = useState("");

    const [latestQrValue, setLatestQrValue] = useState<string | null>(null);


    async function handleNewGuest(event: FormEvent<HTMLFormElement>){
        event.preventDefault();
        const name = formData.name.trim();
        if (!name){
            setStatusMessage("Please enter a guest name.");
            return;
        }
        const currentEventId = eventId ?? "";

        try {
            const payload = await addGuest(currentEventId, {
                name,
                email: formData.email.trim(),
                number: formData.number.trim(),
            });

            const guestId = payload.guestId ?? payload.guest?.id ?? "";

            setStatusMessage(`Added ${name}`);
            setFormData({name:"", email:"", number:""});
            setLatestQrValue(eventId + ":" + guestId)
            setText(name);
        }
        catch (err){
            console.error(err);
            setStatusMessage("Failed to add guest.");
        }
    }

             
    return(
        <div className="p-8 flex flex-col justify-center items-center">
            <h1 className="mb-4"> QR code generator</h1>
            {/* <h1 className="mb-4">Invite</h1>  */}

            <form className="mb-4 border border-r border-slate-500 p-6 flex flex-col"
                onSubmit={handleNewGuest}>
                <label >Name:</label><br/>
                <input 
                className="border border-r" 
                type="text" 
                id="name" 
                name="fname"
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                /><br/>

                <label >Email:</label><br/>
                <input 
                className="border border-r" 
                type="text" 
                id="email" 
                name="email"
                value={formData.email}
                onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                /><br/>

                <label >Number:</label><br/>
                <input 
                className="border border-r" 
                type="tel" 
                id="number" 
                name="number"
                value={formData.number}
                onChange={(event) => setFormData((current) => ({ ...current, number: event.target.value }))}
                /><br/>

                <input 
                className="border border-r text-white bg-black rounded-full" 
                type="submit" 
                id="submit" 
                name="submit"/><br/>

            </form>

            {statusMessage ? <p className="mb-8 text-sm text-red-600">{statusMessage}</p> : null}

            <input 
            className="border border-r mb-4 p-x-2" 
            type="text" 
            placeholder=" Enter text" 
            onChange={(e) => setText(e.target.value)}></input>

            <QRCodeSVG value={latestQrValue || text || " "} size={256}/>
        </div>
    )
}