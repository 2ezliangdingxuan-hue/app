const API_BASE = typeof window !== "undefined"
    ? `http://${window.location.hostname}:3001`
    : "http://localhost:3001";

type Account = {
    id: number;
    name: string;
    email: string;
    number: string;
};

type CreateAccountResult =
    | { ok: true; account: Account }
    | { ok: false; error: string };

const createAccount = async(account:{
    name : string;
    email : string;
    number : string;
    password : string;
}): Promise<CreateAccountResult> => {
    const res = await fetch(`${API_BASE}/api/accounts`,{
        method: "POST",
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify(account),
    });

    const payload = await res.json();

    if (!res.ok){
        return { ok: false, error: payload?.error || "Unable to create account." };
    }

    return payload as CreateAccountResult;
};

export{createAccount}
