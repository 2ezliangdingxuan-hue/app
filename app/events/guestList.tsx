import { useOutletContext, useParams } from "react-router";
import {useState} from "react";
//import { events } from "../../src/events.json";
import { events, getEvents, getEventById, checkInGuest, addGuest } from "../../src/data/events";
import InviteForm from "./inviteFloat";

export default function GuestList() {
    const {event} = useOutletContext<{event: any }>();
    const{eventId} = useParams();
    const curEvent = events.find((event) => String(event.id) === eventId);
    const guestList = curEvent?.guests;
    const [checkedInGuestIds, setCheckedInGuestIds] = useState<string[]>([]);

    const[isInviteOpen, setIsInviteOpen] = useState(false)

    function checkIn(eventId: string, guestId: string){
        if (!eventId) return;
        const success = checkInGuest(eventId, guestId);
        console.log(success);
    }

    async function handleInviteSubmit(guest:{name:string; email:string; number: string}){
        if (!eventId) return;
        await addGuest(eventId, guest);
    }
   
    return(
        <main className="flex w-full flex-col pt-8 pb-4 px-6">
            
            <div className="flex flex-row justify-between items-center mb-8">
                <h1 className="text-4xl ">Guestlist</h1>
                <button 
                className="border rounded-2xl p-2 capitalize text-center"
                onClick={() => setIsInviteOpen(true)}> 
                Invite guest +
                </button>
            </div>
            <InviteForm
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                onSubmit={handleInviteSubmit}
            />
            <ul className="justify-between">
                <li className="grid text-white grid-cols-[180px_1fr_1fr_100px] items-center border-b py-2 bg-black">
                    <span className="mx-2"> Guest</span>
                    <span>Time</span>
                    <span className="justify-self-end">
                    <span></span>
                    </span>
                    <span className="text-right mx-2"> Status </span>
                </li>
                {guestList && Object.entries(guestList).map(([id,guest]) => (
                    <li key={id} className="grid grid-cols-[180px_1fr_1fr_100px] items-center border-b border-x py-2">
                        <span className="mx-2">{guest.name}</span>
                        <span>{
                            guest.arrivalTime
                        }</span>
                        <span className="justify-self-end">
                            <button onClick={() => checkIn(String(eventId),id)}
                            id="checkin"className="m-0.1 px-2 py-1 border rounded-2xl">
                                Check-In
                            </button>
                        </span>
                        <span className="text-right mx-2">{guest.status}</span>
                    </li>
                ))}
            </ul>
        </main>
    )
}