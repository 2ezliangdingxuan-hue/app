import { Link } from "react-router";
import{getEventById} from "../../server/events";
import{useState, useEffect} from "react";
import{useParams} from "react-router"

export function Sidebar(){
    let {eventId} = useParams();
    useEffect (() =>{
        
        if(!eventId){return};
        const id = eventId;

        async function loadEvent(){
            const res = await getEventById(id);
        }

        loadEvent();

    },[eventId]);
    return(
        <div className="sidebar h-full w-40 flex flex-col bg-white p-4 capitalize border-r">
            
            <ul className="text-xl space-y-2">
                <li><Link to="." relative="path">home</Link></li>
                <li><Link to="invite">invite</Link></li>
                <li><Link to="rsvp">rsvp</Link></li>
                <li><Link to="guestList">check-in</Link></li>
                <li><Link to="activities">activities</Link></li>
                <li><Link to="gifts">gifts</Link></li>
                <li><Link to="ratings">ratings</Link></li>
                <li><Link to="edit">edit</Link></li>
            </ul>
        </div>
    )
}