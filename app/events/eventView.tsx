import { useState } from "react";
import { useParams } from "react-router";
import { events, addGuest } from "../../server/events";
import { Button } from "~/components/Button";
import SignUpForm from "./signUpFloat";

export default function EventView() {
    const { eventId } = useParams();
    const curEvent = events.find((event) => String(event.id) === eventId);
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);

    if (!curEvent) {
        return (
            <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-8">
                <p className="text-neutral-500">Event not found.</p>
            </div>
        );
    }

    const handleSignUp = async (guest: { name: string; email: string; number: string }) => {
        await addGuest(String(curEvent.id), { ...guest, selfSignup: true });
    };

    return (
        <div className="mx-auto w-full max-w-4xl px-4 pb-10 pt-6 sm:px-8">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <h1 className="text-3xl font-bold capitalize text-neutral-800 sm:text-4xl">{curEvent.title}</h1>
                
            </div>

            <SignUpForm isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} onSubmit={handleSignUp} />

            <div className="mb-6 flex flex-wrap items-center gap-x-8 gap-y-3">
                <div>
                    <span className="text-lg font-medium text-neutral-600">Maximum Capacity: </span>
                    <span className="text-lg font-semibold text-neutral-800">{curEvent.maxGuests ?? 0} Guests</span>
                </div>
                <div className="flex items-center gap-2">
                    {/* <span className="text-lg font-medium text-neutral-600">Category:</span> */}
                    <span className="rounded-pill bg-brand-50 px-3 py-1 text-sm font-medium capitalize text-brand-600">
                        {curEvent.category}
                    </span>
                </div>
            </div>

            <div className="mb-6 overflow-hidden rounded-xl border border-neutral-200 shadow-card">
                <img
                    className="aspect-2/1 w-full object-cover"
                    src={curEvent.img}
                    alt={curEvent.title}
                />
            </div>

            <div className="flex flex-row justify-between items-center mb-6">
                <div className=" flex flex-col gap-2">
                    <p className="text-xl text-neutral-700">
                        Date: 
                        <span className="font-semibold text-neutral-800"> {curEvent.date}</span>
                    </p>
                    <p className="text-xl text-neutral-700">
                        Location: 
                        <span className="font-semibold text-neutral-800 capitalize"> {curEvent.location}</span>
                    </p>
                </div>
                <Button type="button" variant="primary" onClick={() => setIsSignUpOpen(true)} className="">
                        Sign Up
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-0 shadow-soft">
                <div className="border-b border-neutral-100 px-5 py-4 sm:px-6">
                    <h2 className="text-lg font-bold text-neutral-800 sm:text-xl">About this event</h2>
                </div>
                <div className="px-5 py-5 sm:px-6">
                    {curEvent.description ? (
                        <p className="max-w-prose text-base leading-7 text-neutral-600 sm:text-[17px]">
                            {curEvent.description}
                        </p>
                    ) : (
                        <p className="text-sm text-neutral-400">No description yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
