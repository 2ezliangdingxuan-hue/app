
import {Header} from "../header/header";
import {Sidebar} from "../sidebar/sidebar";
import{Outlet, useLoaderData, Link} from "react-router";
import {events} from "../../src/events.json";
import {EventHome} from "../events/eventHome"
import {decryptId} from "~/utils/idCrypto";
import {useAuth} from "~/auth/AuthContext";

export async function loader({params}: {params: {eventId: string}}) {
    const eventId = decryptId(params.eventId);
    const event = events.find((e) => String(e.id) === eventId);
    if(!event) {throw new Response("Event not found", {status: 404})}
    return {event};
}

export default function Event() {
    const {event} = useLoaderData() as {event: typeof events[number]};
    const {account, isLoading} = useAuth();

    const isManager =
        !!account &&
        ((account.eventIds || []).includes(event.id) ||
            ((event as any).collaboratorIds || []).includes(account.id));

    if (isLoading) {
        return (
            <>
                <Header/>
                <div className="flex items-center justify-center py-24 text-neutral-500">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                </div>
            </>
        );
    }

    if (!isManager) {
        return (
            <>
                <Header/>
                <main className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 px-4 py-24 text-center">
                    <h1 className="text-xl font-bold text-neutral-900">Access Denied</h1>
                    <p className="text-sm text-neutral-500">
                        {account
                            ? "You don't have permission to manage this event. Only the owner or invited collaborators can access it."
                            : "You need to sign in as the event owner or a collaborator to access this event."}
                    </p>
                    <Link to={account ? "/events" : "/sign-in"} className="mt-2 text-sm font-semibold text-brand-600 hover:text-brand-700">
                        {account ? "Back to Your Events" : "Sign in"}
                    </Link>
                </main>
            </>
        );
    }

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