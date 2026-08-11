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

type SignInResult =
    | { ok: true; token: string; account: Account }
    | { ok: false; error: string };

const signIn = async(email: string, password: string): Promise<SignInResult> => {
    const res = await fetch(`${API_BASE}/api/sign-in`,{
        method: "POST",
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const payload = await res.json();

    if (!res.ok){
        return { ok: false, error: payload?.error || "Unable to sign in." };
    }

    return payload as SignInResult;
};

type MeResult =
    | { ok: true; account: Account }
    | { ok: false; error: string };

const getMe = async(token: string): Promise<MeResult> => {
    const res = await fetch(`${API_BASE}/api/me`,{
        headers:{
            Authorization: `Bearer ${token}`,
        },
    });

    const payload = await res.json();

    if (!res.ok){
        return { ok: false, error: payload?.error || "Session expired." };
    }

    return payload as MeResult;
};

export{createAccount, signIn, getMe}
export type{Account}
