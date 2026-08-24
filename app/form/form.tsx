import { useParams } from "react-router"
import {events} from "../../server/events"
import { useEffect } from "react";

export function Form (){
    const {eventId} = useParams();
    const curEvent = events.find((event) => String(event.id) === eventId);
    return(
        <>
        <div className="p-4 m-6">
            <h1 className="text-2xl font-bold">Sign up for {curEvent?.title}</h1>
        </div>
        </>
    )
}