export function Signup(){
    return(
        <div className="flex flex-col text-center mt-6">
            <h1 className="text-3xl font-bold">Sign up</h1>
            <div className="flex mx-auto p-6 shrink">
                <form className="flex flex-col items-center text-start shrink border p-4">
                <label htmlFor="email" className="text-start">Email:</label>
                <input type="email" placeholder="Email" className="border mb-4"/>
                <label htmlFor="password">Password:</label>
                <input type="password" placeholder="Password" className="border"/>
                <button type="submit" className="mt-4 border rounded-full text-white bg-black py-2 px-4 text-center">Sign Up</button>
                </form>
            </div>
            <a href="/sign-in">already have an account? sign in</a>

        </div>
    )
}