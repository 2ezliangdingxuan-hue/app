import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { signIn as signInRequest, getMe, type Account } from "../../src/data/accounts";

const TOKEN_KEY = "authToken";

type SignInOutcome = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
    account: Account | null;
    token: string | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<SignInOutcome>;
    signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [account, setAccount] = useState<Account | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (!storedToken) {
            setIsLoading(false);
            return;
        }

        getMe(storedToken).then((result) => {
            if (result.ok) {
                setAccount(result.account);
                setToken(storedToken);
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
        setToken(result.token);
        return { ok: true };
    };

    const signOut = () => {
        localStorage.removeItem(TOKEN_KEY);
        setAccount(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ account, token, isLoading, signIn, signOut }}>
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
