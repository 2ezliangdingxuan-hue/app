import { useParams, Link } from "react-router";
import { events, getEventById, updateEvent } from "../../src/data/events";
import {useState, useEffect} from "react";

type EditField  = "title" |"date" | "location" | "capacity" | "description" | "image" | null;


export function EventHome() {
    let {eventId} = useParams();    
    const curEvent = events.find((event) => String(event.id) === eventId);

    const [editing, setEditing] = useState<EditField>(null);
    const [draft, setDraft] = useState({
        title: curEvent?.title ??"",
        date: curEvent?.date ?? "",
        capacity: curEvent?.maxGuests?? "",
        location: curEvent?.location ?? "",
        description: curEvent?.description ?? "",
        image: curEvent?.img ?? "",
    });

    const startEdit = (field: Exclude<EditField, null>) =>{
        setEditing(field);
        setDraft({
        title: curEvent?.title ??"",
        date: curEvent?.date ?? "",
        capacity: curEvent?.maxGuests?? "",
        location: curEvent?.location ?? "",
        description: curEvent?.description ?? "",
        image: curEvent?.img ?? "",
        });
    }

    const saveEdit = async () =>{
        if(!curEvent) return;

        const updatePayLoad: Record<string, string> = {};

        if(editing === "title") updatePayLoad.title=draft.title
        if(editing === "date") updatePayLoad.date=draft.date
        if(editing === "capacity") updatePayLoad.maxGuests=String(draft.capacity)
        if(editing === "location") updatePayLoad.location=draft.location
        if(editing === "description") updatePayLoad.description=draft.description
        if(editing === "image") updatePayLoad.img=draft.image

        await updateEvent(String(curEvent.id), updatePayLoad);

        const index = events.findIndex((event) => String(event.id) === eventId);
        if (index >= 0){
            events[index] = {
                ...events[index],
                ...updatePayLoad,
            }
        }
       
        setEditing(null);
    }
    
    const handleImageUpload = (file: File | null) =>{
        if(!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const result = String(reader.result ?? "");
            setDraft((current) => ({...current, image: result}));
        };
        reader.readAsDataURL(file);
    }

    //const {event} = useOutletContext<{event: any }>();
    return (
        <main className="flex w-full flex-col pt-16 pb-4 px-8">
            <div className="relative w-full h-auto">
                <div className="flex flex-row justify-between items-center mb-10">
                {/* Title */}
                {editing === "title" ? (
                    <>
                    <input
                    value={draft.title}
                    onChange={(e) => setDraft((current) => ({...current, title: e.target.value}))}
                    className="border p-1"
                    />
                    <button onClick = {saveEdit} className="rounded-xl bg-black px-4 py-2 text-white">
                        Save
                    </button>
                    <button onClick = {() => setEditing(null)} className="rounded-xl bg-gray-400 px-4 py-2 text-white">
                        Cancel
                    </button>
                    </>
                ):(
                    <>
                    <div className = "flex flex-row items-center space-x-2 mb-2">
                        <h1 className="text-4xl font-semibold">{curEvent?.title}</h1>
                        <button onClick={() => startEdit('title')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="#828282">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M4.80326 7.60249H12.2963C12.5511 7.60249 12.7955 7.50128 12.9756 7.32112C13.1558 7.14096 13.257 6.89662 13.257 6.64184C13.257 6.38706 13.1558 6.14271 12.9756 5.96255C12.7955 5.7824 12.5511 5.68118 12.2963 5.68118H4.48304C4.05841 5.68118 3.65117 5.84987 3.35091 6.15013C3.05064 6.45039 2.88196 6.85764 2.88196 7.28227V21.3718C2.88196 21.7965 3.05064 22.2037 3.35091 22.504C3.65117 22.8042 4.05841 22.9729 4.48304 22.9729H18.5726C18.9972 22.9729 19.4045 22.8042 19.7047 22.504C20.005 22.2037 20.1737 21.7965 20.1737 21.3718V13.5585C20.1737 13.3037 20.0725 13.0594 19.8923 12.8792C19.7122 12.6991 19.4678 12.5979 19.213 12.5979C18.9583 12.5979 18.7139 12.6991 18.5338 12.8792C18.3536 13.0594 18.2524 13.3037 18.2524 13.5585V21.0516H4.80326V7.60249ZM21.4398 7.35144C21.6498 7.14144 21.7677 6.85665 21.7677 6.5597C21.7677 6.26275 21.6498 5.97796 21.4398 5.76796L20.3075 4.63568C20.2034 4.53151 20.0797 4.44889 19.9436 4.39252C19.8075 4.33614 19.6617 4.30713 19.5144 4.30713C19.3671 4.30713 19.2212 4.33614 19.0851 4.39252C18.949 4.44889 18.8253 4.53151 18.7212 4.63568L9.83067 13.5265C9.02994 14.3272 8.51703 15.3706 8.37208 16.4936L8.23343 17.5689C8.22867 17.6057 8.23242 17.6431 8.24438 17.6783C8.25634 17.7134 8.27619 17.7453 8.30242 17.7716C8.32864 17.7978 8.36054 17.8177 8.39565 17.8297C8.43077 17.8417 8.46816 17.8455 8.50497 17.8408L9.58058 17.7021C10.7036 17.5572 11.747 17.0443 12.5477 16.2435L21.4398 7.35144ZM18.7343 10.0566L16.0189 7.34119L17.3772 5.98219L20.0927 8.69795L18.7343 10.0566Z" fill="black"/>
                            </svg>
                        </button>
                    </div>
                    </>
                )

                }
                    <button className="flex border-2 rounded-xl items-center px-3">
                        <p className="text-2xl pr-1">Edit</p>
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M4.80326 7.60249H12.2963C12.5511 7.60249 12.7955 7.50128 12.9756 7.32112C13.1558 7.14096 13.257 6.89662 13.257 6.64184C13.257 6.38706 13.1558 6.14271 12.9756 5.96255C12.7955 5.7824 12.5511 5.68118 12.2963 5.68118H4.48304C4.05841 5.68118 3.65117 5.84987 3.35091 6.15013C3.05064 6.45039 2.88196 6.85764 2.88196 7.28227V21.3718C2.88196 21.7965 3.05064 22.2037 3.35091 22.504C3.65117 22.8042 4.05841 22.9729 4.48304 22.9729H18.5726C18.9972 22.9729 19.4045 22.8042 19.7047 22.504C20.005 22.2037 20.1737 21.7965 20.1737 21.3718V13.5585C20.1737 13.3037 20.0725 13.0594 19.8923 12.8792C19.7122 12.6991 19.4678 12.5979 19.213 12.5979C18.9583 12.5979 18.7139 12.6991 18.5338 12.8792C18.3536 13.0594 18.2524 13.3037 18.2524 13.5585V21.0516H4.80326V7.60249ZM21.4398 7.35144C21.6498 7.14144 21.7677 6.85665 21.7677 6.5597C21.7677 6.26275 21.6498 5.97796 21.4398 5.76796L20.3075 4.63568C20.2034 4.53151 20.0797 4.44889 19.9436 4.39252C19.8075 4.33614 19.6617 4.30713 19.5144 4.30713C19.3671 4.30713 19.2212 4.33614 19.0851 4.39252C18.949 4.44889 18.8253 4.53151 18.7212 4.63568L9.83067 13.5265C9.02994 14.3272 8.51703 15.3706 8.37208 16.4936L8.23343 17.5689C8.22867 17.6057 8.23242 17.6431 8.24438 17.6783C8.25634 17.7134 8.27619 17.7453 8.30242 17.7716C8.32864 17.7978 8.36054 17.8177 8.39565 17.8297C8.43077 17.8417 8.46816 17.8455 8.50497 17.8408L9.58058 17.7021C10.7036 17.5572 11.747 17.0443 12.5477 16.2435L21.4398 7.35144ZM18.7343 10.0566L16.0189 7.34119L17.3772 5.98219L20.0927 8.69795L18.7343 10.0566Z" fill="black"/>
                        </svg>
                    </button>
                </div>



                <div className="mb-4">
                    <div className=" flex flex-row w-full justify-evenly space-x-4">
                        <div className="border flex-col p-2 rounded-xl w-full">
                            <p className="text-[18px] m-0"> Arrived </p>
                            <p className="text-[64px] -my-4">21</p>
                        </div>
                        <div className="border flex-col p-2 rounded-xl w-full">
                            <p className="text-[18px]"> Not Arrived </p>
                            <p className="text-[64px] -my-4">21</p>
                        </div>
                        <div className="border flex-col p-2 rounded-xl w-full">
                            <p className="text-[18px]"> Exited </p>
                            <p className="text-[64px] -my-4">21</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row mb-5 items-end space-x-2">
                    {/* capacity */}
                    {editing === "capacity" ? (
                        <>
                        <h1 className="text-2xl">Maximum Capacity :</h1>
                        <input
                        type="number"
                        min="0"
                        value={draft.capacity}
                        onChange={(e) => setDraft((current) => ({...current, capacity: e.target.value}))}
                        className="border p-1"
                        />
                        <button onClick = {saveEdit} className="rounded-xl bg-black px-4 py-2 text-white">
                            Save
                        </button>
                        <button onClick = {() => setEditing(null)} className="rounded-xl bg-gray-400 px-4 py-2 text-white">
                            Cancel
                        </button>
                        </>
                    ):(
                        <>
                        <h1 className="text-2xl">Maximum Capacity :</h1>
                        <p className="text-xl font-medium">{curEvent?.maxGuests ?? 0} Guests</p>
                        <button onClick={() => startEdit('capacity')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="#828282">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M4.80326 7.60249H12.2963C12.5511 7.60249 12.7955 7.50128 12.9756 7.32112C13.1558 7.14096 13.257 6.89662 13.257 6.64184C13.257 6.38706 13.1558 6.14271 12.9756 5.96255C12.7955 5.7824 12.5511 5.68118 12.2963 5.68118H4.48304C4.05841 5.68118 3.65117 5.84987 3.35091 6.15013C3.05064 6.45039 2.88196 6.85764 2.88196 7.28227V21.3718C2.88196 21.7965 3.05064 22.2037 3.35091 22.504C3.65117 22.8042 4.05841 22.9729 4.48304 22.9729H18.5726C18.9972 22.9729 19.4045 22.8042 19.7047 22.504C20.005 22.2037 20.1737 21.7965 20.1737 21.3718V13.5585C20.1737 13.3037 20.0725 13.0594 19.8923 12.8792C19.7122 12.6991 19.4678 12.5979 19.213 12.5979C18.9583 12.5979 18.7139 12.6991 18.5338 12.8792C18.3536 13.0594 18.2524 13.3037 18.2524 13.5585V21.0516H4.80326V7.60249ZM21.4398 7.35144C21.6498 7.14144 21.7677 6.85665 21.7677 6.5597C21.7677 6.26275 21.6498 5.97796 21.4398 5.76796L20.3075 4.63568C20.2034 4.53151 20.0797 4.44889 19.9436 4.39252C19.8075 4.33614 19.6617 4.30713 19.5144 4.30713C19.3671 4.30713 19.2212 4.33614 19.0851 4.39252C18.949 4.44889 18.8253 4.53151 18.7212 4.63568L9.83067 13.5265C9.02994 14.3272 8.51703 15.3706 8.37208 16.4936L8.23343 17.5689C8.22867 17.6057 8.23242 17.6431 8.24438 17.6783C8.25634 17.7134 8.27619 17.7453 8.30242 17.7716C8.32864 17.7978 8.36054 17.8177 8.39565 17.8297C8.43077 17.8417 8.46816 17.8455 8.50497 17.8408L9.58058 17.7021C10.7036 17.5572 11.747 17.0443 12.5477 16.2435L21.4398 7.35144ZM18.7343 10.0566L16.0189 7.34119L17.3772 5.98219L20.0927 8.69795L18.7343 10.0566Z" fill="black"/>
                            </svg>
                        </button>
                        </>
                    )}
                </div>

                {/* Image Upload */}
                {editing === "image" ? (
                    <>
                    {draft.image && <img src={draft.image} alt="Preview" className="w-full h-auto" />}

                    <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files?.[0] ?? null)}
                    className=" p-1 file:border"
                    />
                    <div className="flex flex-row space-x-2">
                    <button onClick = {saveEdit} className="rounded-xl bg-black px-4 py-2 text-white">
                        Save 
                    </button>
                    <button onClick = {() => setEditing(null)} className="rounded-xl bg-gray-400 px-4 py-2 text-white">
                        Cancel
                    </button>
                    </div>
                    
                    </>
                ) : (
                    <>
                    <img className="w-full aspect-2/1 object-cover" src={curEvent?.img} alt={curEvent?.title}/>
                    <button onClick={() => startEdit('image')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="#828282">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M4.80326 7.60249H12.2963C12.5511 7.60249 12.7955 7.50128 12.9756 7.32112C13.1558 7.14096 13.257 6.89662 13.257 6.64184C13.257 6.38706 13.1558 6.14271 12.9756 5.96255C12.7955 5.7824 12.5511 5.68118 12.2963 5.68118H4.48304C4.05841 5.68118 3.65117 5.84987 3.35091 6.15013C3.05064 6.45039 2.88196 6.85764 2.88196 7.28227V21.3718C2.88196 21.7965 3.05064 22.2037 3.35091 22.504C3.65117 22.8042 4.05841 22.9729 4.48304 22.9729H18.5726C18.9972 22.9729 19.4045 22.8042 19.7047 22.504C20.005 22.2037 20.1737 21.7965 20.1737 21.3718V13.5585C20.1737 13.3037 20.0725 13.0594 19.8923 12.8792C19.7122 12.6991 19.4678 12.5979 19.213 12.5979C18.9583 12.5979 18.7139 12.6991 18.5338 12.8792C18.3536 13.0594 18.2524 13.3037 18.2524 13.5585V21.0516H4.80326V7.60249ZM21.4398 7.35144C21.6498 7.14144 21.7677 6.85665 21.7677 6.5597C21.7677 6.26275 21.6498 5.97796 21.4398 5.76796L20.3075 4.63568C20.2034 4.53151 20.0797 4.44889 19.9436 4.39252C19.8075 4.33614 19.6617 4.30713 19.5144 4.30713C19.3671 4.30713 19.2212 4.33614 19.0851 4.39252C18.949 4.44889 18.8253 4.53151 18.7212 4.63568L9.83067 13.5265C9.02994 14.3272 8.51703 15.3706 8.37208 16.4936L8.23343 17.5689C8.22867 17.6057 8.23242 17.6431 8.24438 17.6783C8.25634 17.7134 8.27619 17.7453 8.30242 17.7716C8.32864 17.7978 8.36054 17.8177 8.39565 17.8297C8.43077 17.8417 8.46816 17.8455 8.50497 17.8408L9.58058 17.7021C10.7036 17.5572 11.747 17.0443 12.5477 16.2435L21.4398 7.35144ZM18.7343 10.0566L16.0189 7.34119L17.3772 5.98219L20.0927 8.69795L18.7343 10.0566Z" fill="black"/>
                    </svg>
                    </button>
                    </>
                )}

                <div className="my-8">
                    {/* Date Section */}
                    <div className="mb-2 flex flex-row items-center space-x-2">
                        {editing === "date" ?(
                            <>
                            <input
                                type="date"
                                value = {draft.date}
                                onChange = {(e) =>
                                    setDraft((current) => ({...current, date: e.target.value}))

                                }
                                className="border p-1"
                            />
                            <button onClick = {saveEdit} className="rounded-xl bg-black px-4 py-2 text-white">
                                Save
                            </button>
                            <button onClick = {() => setEditing(null)} className="rounded-xl bg-gray-400 px-4 py-2 text-white">
                                Cancel
                            </button>
                            </>
                        ) : (
                            <>
                            <div className="mb-2 flex flex-row items-center space-x-2">
                                <p className="text-2xl">Date : {curEvent?.date}</p>
                                <button onClick={() => startEdit('date')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="#828282">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.80326 7.60249H12.2963C12.5511 7.60249 12.7955 7.50128 12.9756 7.32112C13.1558 7.14096 13.257 6.89662 13.257 6.64184C13.257 6.38706 13.1558 6.14271 12.9756 5.96255C12.7955 5.7824 12.5511 5.68118 12.2963 5.68118H4.48304C4.05841 5.68118 3.65117 5.84987 3.35091 6.15013C3.05064 6.45039 2.88196 6.85764 2.88196 7.28227V21.3718C2.88196 21.7965 3.05064 22.2037 3.35091 22.504C3.65117 22.8042 4.05841 22.9729 4.48304 22.9729H18.5726C18.9972 22.9729 19.4045 22.8042 19.7047 22.504C20.005 22.2037 20.1737 21.7965 20.1737 21.3718V13.5585C20.1737 13.3037 20.0725 13.0594 19.8923 12.8792C19.7122 12.6991 19.4678 12.5979 19.213 12.5979C18.9583 12.5979 18.7139 12.6991 18.5338 12.8792C18.3536 13.0594 18.2524 13.3037 18.2524 13.5585V21.0516H4.80326V7.60249ZM21.4398 7.35144C21.6498 7.14144 21.7677 6.85665 21.7677 6.5597C21.7677 6.26275 21.6498 5.97796 21.4398 5.76796L20.3075 4.63568C20.2034 4.53151 20.0797 4.44889 19.9436 4.39252C19.8075 4.33614 19.6617 4.30713 19.5144 4.30713C19.3671 4.30713 19.2212 4.33614 19.0851 4.39252C18.949 4.44889 18.8253 4.53151 18.7212 4.63568L9.83067 13.5265C9.02994 14.3272 8.51703 15.3706 8.37208 16.4936L8.23343 17.5689C8.22867 17.6057 8.23242 17.6431 8.24438 17.6783C8.25634 17.7134 8.27619 17.7453 8.30242 17.7716C8.32864 17.7978 8.36054 17.8177 8.39565 17.8297C8.43077 17.8417 8.46816 17.8455 8.50497 17.8408L9.58058 17.7021C10.7036 17.5572 11.747 17.0443 12.5477 16.2435L21.4398 7.35144ZM18.7343 10.0566L16.0189 7.34119L17.3772 5.98219L20.0927 8.69795L18.7343 10.0566Z" fill="black"/>
                                </svg></button>
                            </div>
                            </>
                        )}
                    </div>

                    {/* Location section */}
                    <div className="mb-2 flex flex-row items-center space-x-2">
                        {editing === "location" ? (
                            <>
                                <input
                                type="text"
                                value = {draft.location}
                                onChange = {(e) => 
                                    setDraft((current) => ({...current, location: e.target.value}))
                                }
                                className="border p-1"
                                />
                                <button onClick={saveEdit} className="rounded-xl bg-black px-4 py-2 text-white">
                                    Save
                                </button>
                                <button onClick={() => setEditing(null)} className="rounded-xl bg-gray-400 px-4 py-2 text-white">
                                    Cancel
                                </button>
                            </>
                        ):(
                            <>
                                <div className="mb-2 flex flex-row items-center space-x-2">
                                    <p className="text-2xl">Location : {curEvent?.location}</p>
                                    <button onClick = {() => startEdit("location")} >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M4.80326 7.60249H12.2963C12.5511 7.60249 12.7955 7.50128 12.9756 7.32112C13.1558 7.14096 13.257 6.89662 13.257 6.64184C13.257 6.38706 13.1558 6.14271 12.9756 5.96255C12.7955 5.7824 12.5511 5.68118 12.2963 5.68118H4.48304C4.05841 5.68118 3.65117 5.84987 3.35091 6.15013C3.05064 6.45039 2.88196 6.85764 2.88196 7.28227V21.3718C2.88196 21.7965 3.05064 22.2037 3.35091 22.504C3.65117 22.8042 4.05841 22.9729 4.48304 22.9729H18.5726C18.9972 22.9729 19.4045 22.8042 19.7047 22.504C20.005 22.2037 20.1737 21.7965 20.1737 21.3718V13.5585C20.1737 13.3037 20.0725 13.0594 19.8923 12.8792C19.7122 12.6991 19.4678 12.5979 19.213 12.5979C18.9583 12.5979 18.7139 12.6991 18.5338 12.8792C18.3536 13.0594 18.2524 13.3037 18.2524 13.5585V21.0516H4.80326V7.60249ZM21.4398 7.35144C21.6498 7.14144 21.7677 6.85665 21.7677 6.5597C21.7677 6.26275 21.6498 5.97796 21.4398 5.76796L20.3075 4.63568C20.2034 4.53151 20.0797 4.44889 19.9436 4.39252C19.8075 4.33614 19.6617 4.30713 19.5144 4.30713C19.3671 4.30713 19.2212 4.33614 19.0851 4.39252C18.949 4.44889 18.8253 4.53151 18.7212 4.63568L9.83067 13.5265C9.02994 14.3272 8.51703 15.3706 8.37208 16.4936L8.23343 17.5689C8.22867 17.6057 8.23242 17.6431 8.24438 17.6783C8.25634 17.7134 8.27619 17.7453 8.30242 17.7716C8.32864 17.7978 8.36054 17.8177 8.39565 17.8297C8.43077 17.8417 8.46816 17.8455 8.50497 17.8408L9.58058 17.7021C10.7036 17.5572 11.747 17.0443 12.5477 16.2435L21.4398 7.35144ZM18.7343 10.0566L16.0189 7.34119L17.3772 5.98219L20.0927 8.69795L18.7343 10.0566Z" fill="black"/>
                                        </svg>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                
                {/* Description section*/}
                

                {editing === "description" ? (
                    <>
                        <textarea
                        rows={4}
                        value = {draft.description}
                        onChange = {(e) =>
                            setDraft((current) => ({ ...current, description: e.target.value}))
                        }
                        className="border p-1 w-full"
                        />
                        <div className="mt-2 flex gap-2">
                            <button onClick={saveEdit} className="rounded-xl bg-black px-4 py-2 text-white">
                                Save
                            </button>
                            <button onClick={() => setEditing(null)} className="rounded-xl bg-gray-400 px-4 py-2 text-white">
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mb-5 flex flex-row items-center space-x-2">
                            <h1 className="font-bold text-4xl mb-1">
                            Description :
                            </h1>
                            <button onClick={() => startEdit("description")} className="flex rounded-xl items-center px-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.80326 7.60249H12.2963C12.5511 7.60249 12.7955 7.50128 12.9756 7.32112C13.1558 7.14096 13.257 6.89662 13.257 6.64184C13.257 6.38706 13.1558 6.14271 12.9756 5.96255C12.7955 5.7824 12.5511 5.68118 12.2963 5.68118H4.48304C4.05841 5.68118 3.65117 5.84987 3.35091 6.15013C3.05064 6.45039 2.88196 6.85764 2.88196 7.28227V21.3718C2.88196 21.7965 3.05064 22.2037 3.35091 22.504C3.65117 22.8042 4.05841 22.9729 4.48304 22.9729H18.5726C18.9972 22.9729 19.4045 22.8042 19.7047 22.504C20.005 22.2037 20.1737 21.7965 20.1737 21.3718V13.5585C20.1737 13.3037 20.0725 13.0594 19.8923 12.8792C19.7122 12.6991 19.4678 12.5979 19.213 12.5979C18.9583 12.5979 18.7139 12.6991 18.5338 12.8792C18.3536 13.0594 18.2524 13.3037 18.2524 13.5585V21.0516H4.80326V7.60249ZM21.4398 7.35144C21.6498 7.14144 21.7677 6.85665 21.7677 6.5597C21.7677 6.26275 21.6498 5.97796 21.4398 5.76796L20.3075 4.63568C20.2034 4.53151 20.0797 4.44889 19.9436 4.39252C19.8075 4.33614 19.6617 4.30713 19.5144 4.30713C19.3671 4.30713 19.2212 4.33614 19.0851 4.39252C18.949 4.44889 18.8253 4.53151 18.7212 4.63568L9.83067 13.5265C9.02994 14.3272 8.51703 15.3706 8.37208 16.4936L8.23343 17.5689C8.22867 17.6057 8.23242 17.6431 8.24438 17.6783C8.25634 17.7134 8.27619 17.7453 8.30242 17.7716C8.32864 17.7978 8.36054 17.8177 8.39565 17.8297C8.43077 17.8417 8.46816 17.8455 8.50497 17.8408L9.58058 17.7021C10.7036 17.5572 11.747 17.0443 12.5477 16.2435L21.4398 7.35144ZM18.7343 10.0566L16.0189 7.34119L17.3772 5.98219L20.0927 8.69795L18.7343 10.0566Z" fill="black"/>
                                </svg>
                            </button>
                        </div>
                    </>
                )}
                <p className="text-2xl mb-8">{curEvent?.description}</p>
            </div>
            <div className="flex flex-row justify-evenly">
                <ul className="text-xl flex flex-row w-full justify-evenly capitalize">
                    <li><Link to="." relative="path">home</Link></li>
                    <li><Link to="invite">invite</Link></li>
                    <li><Link to="rsvp">rsvp</Link></li>
                    <li><Link to="guestList">Guestlist</Link></li>
                </ul>
            </div>
            <hr></hr>
        </main>
    )
}