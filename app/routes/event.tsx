import {Header} from "../header/header";
import {Sidebar} from "../sidebar/sidebar";
import{Outlet, useLoaderData} from "react-router";
import {events} from "../../src/events.json";
import {EventHome} from "../events/eventHome"

export async function loader({params}: {params: {eventId: string}}) {
    const event = events.find((e) => String(e.id) === params.eventId);
    if(!event) {throw new Response("Event not found", {status: 404})}
    return {event};
}

export default function Event() {
    const {event} = useLoaderData() as {event: typeof events[number]};
    return(
        <>
        <Header/>
        <div className="flex flex-row h-screen">
            {/* <Sidebar/> */}
            <div className="flex flex-col w-full">
                <EventHome/>
                <Outlet context={{event}}/>
            </div>
        </div>
        </>
    )
}