import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { signIn as signInRequest, getMe, type Account } from "../../src/data/accounts";

const TOKEN_KEY = "authToken";

type SignInOutcome = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
    account: Account | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<SignInOutcome>;
    signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [account, setAccount] = useState<Account | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            setIsLoading(false);
            return;
        }

        getMe(token).then((result) => {
            if (result.ok) {
                setAccount(result.account);
            } else {
                localStorage.removeItem(TOKEN_KEY);
            }
            setIsLoading(false);
        });
    }, []);

    const signIn = async (email: string, password: string): Promise<SignInOutcome> => {
        const result = await signInRequest(email, password);
        if (!result.ok) {
            return { ok: false, error: result.error };
        }
        localStorage.setItem(TOKEN_KEY, result.token);
        setAccount(result.account);
        return { ok: true };
    };

    const signOut = () => {
        localStorage.removeItem(TOKEN_KEY);
        setAccount(null);
    };

    return (
        <AuthContext.Provider value={{ account, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
