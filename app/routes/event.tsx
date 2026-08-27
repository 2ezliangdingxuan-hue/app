import {Header} from "../header/header";
import {Sidebar} from "../sidebar/sidebar";
import{Outlet, useLoaderData} from "react-router";
import {events} from "../../src/events.json";
import {EventHome} from "../events/eventHome"
import {decryptId} from "~/utils/idCrypto";

export async function loader({params}: {params: {eventId: string}}) {
    const eventId = decryptId(params.eventId);
    const event = events.find((e) => String(e.id) === eventId);
    if(!event) {throw new Response("Event not found", {status: 404})}
    return {event};
}

export default function Event() {
    const {event} = useLoaderData() as {event: typeof events[number]};
    return(
        <>
        <Header/>
        <div className="flex flex-col w-full">
            {/* <Sidebar/> */}
            <EventHome/>
            <Outlet context={{event}}/>
        </div>
        </>
    )
}