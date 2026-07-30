import {useParams, useOutletContext} from "react-router";
//import{events} from "../../src/events.json";
import { events, getEventById } from "../../src/data/events";
import {Link} from "react-router";


export function EventHome() {
    let {eventId} = useParams();    
    const curEvent = events.find((event) => String(event.id) === eventId);
    
    //const {event} = useOutletContext<{event: any }>();
    return (
        <main className="flex w-full flex-col pt-16 pb-4 px-8">
            <div className="relative w-full h-auto">
                <div className="flex flex-row justify-between items-center mb-10">
                    <h1 className="text-4xl">{curEvent?.title}</h1>
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
                        {/* <div className="border flex-col p-2 rounded-xl w-full">
                            <p className="text-[18px]"> Rating </p>
                            <p className="text-[64px] -my-4">21</p>
                        </div> */}
                    </div>
                </div>
                <div className="flex flex-row mb-5 items-end space-x-2">
                    <h1 className="text-2xl">Maximum Capacity :</h1>
                    <p className="text-xl font-medium">67/200 Guests</p>
                </div>

                <img className="w-full h-auto" src={curEvent?.img} alt={curEvent?.title}/>
                
                <div className="my-8">
                    <div className="mb-2">
                        <p className="text-2xl">Date : {curEvent?.date}</p>
                    </div>
                    <div>
                        <p className="text-2xl">Location : {curEvent?.location}</p>
                    </div>
                </div>
                <h1 className="font-bold text-4xl mb-3">
                    Description :
                </h1>
                <p className="text-2xl mb-8">{curEvent?.description}</p>
                {/* <p>{curEvent?.category}</p> */}
            </div>
            <div className="flex flex-row justify-evenly">
                <ul className="text-xl flex flex-row w-full justify-evenly capitalize">
                <li><Link to="." relative="path">home</Link></li>
                <li><Link to="invite">invite</Link></li>
                <li><Link to="rsvp">rsvp</Link></li>
                <li><Link to="guestList">Guestlist</Link></li>
                {/* <li><Link to="activities">activities</Link></li>
                <li><Link to="gifts">gifts</Link></li>
                <li><Link to="ratings">ratings</Link></li>
                <li><Link to="edit">edit</Link></li> */}
            </ul>
            </div>
            <hr></hr>

        </main>
    )
}
