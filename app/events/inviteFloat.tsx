import React from "react";
import { useState, type ChangeEvent, type FormEvent } from "react";

type GuestFormData ={
    name: string;
    email: string;
    number: string;
}
type InviteFormProps={
    isOpen: boolean;
    onClose: () => void;
    onSubmit?:(guest: GuestFormData) => Promise<void> | void;
}

export default function InviteForm({isOpen, onClose, onSubmit}:InviteFormProps){
    const [formData, setFormData] = useState<GuestFormData>({
        name:"", 
        email:"", 
        number:""
    });

    if (!isOpen) return null;

    const handleChange = (e :ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    }

    const handleSubmit = async (e : FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        await onSubmit?.(formData);
        console.log('Form Submitted: ', formData);
        onClose();
    };

    return(
        <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}>
            <div 
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Invite Guest</h2>
                    <button onClick={onClose} className="text-2xl"> x </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="border p-2"
                        required
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="border p-2"
                        required
                    />
                    <input
                        name="number"
                        type="tel"
                        placeholder="Phone number"
                        value={formData.number}
                        onChange={handleChange}
                        className="border p-2"
                    />

                    <button type="submit" className="rounded bg-black px-4 py-2 text-white">
                        Save Guest
                    </button>
                </form>
            </div>
        </div>
    )
}