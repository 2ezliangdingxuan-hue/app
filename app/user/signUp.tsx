import {createAccount} from "../../src/data/accounts"
import { useState } from "react"

const initialForm = {
    name:"",
    email:"",
    number:"",
    password:"",
}

export function Signup(){
    const [form,setForm] = useState(initialForm)
    const handleChange = (
        account:React.ChangeEvent<HTMLInputElement>
    ) =>{
        const {name,value} = account.target;
        setForm((current) => ({ ...current, [name]:value}))
    }
    const handleSubmit = (
        account : React.FormEvent<HTMLFormElement>
    ) => {
        account.preventDefault();
        try{
            const payload = createAccount(form)
        } catch(e){
            console.log(e)
        }
        
    }
    return(
        <div className="flex flex-col text-center mt-6">
            <h1 className="text-3xl font-bold">Sign up</h1>
            <div className="flex mx-auto p-6 shrink">
                <form 
                className="flex flex-col items-center text-start shrink border p-4"
                onSubmit={handleSubmit}>
                    <label htmlFor="name">Name:</label>
                    <input type="text" placeholder="Name" className="border mb-4 px-1" onChange={handleChange}/>
                    <label htmlFor="email" className="text-start">Email:</label>
                    <input type="email" placeholder="Email" className="border mb-4 px-1" onChange={handleChange}/>
                    <label htmlFor="number">Phone Number:</label>
                    <input type="tel" placeholder="Number" className="border mb-4 px-1" onChange={handleChange}/>
                    <label htmlFor="password">Password:</label>
                    <input type="password" placeholder="Password" className="border px-1" onChange={handleChange}/>
                    <button type="submit" className="mt-4 border rounded-full text-white bg-black py-2 px-4 text-center">Sign Up</button>
                </form>
            </div>
            <a href="/sign-in" className="underline">Already have an account? sign in</a>
        </div>
    )
}