import { createContext, useContext, useState, useCallback } from 'react';

const AUTH_STORAGE_KEY = 'mazyconnect_user';

function readStoredUser() {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.id || !parsed?.username) return null;
        return {
            id: parsed.id,
            username: parsed.username,
            email: parsed.email ?? '',
        };
    } catch {
        return null;
    }
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(readStoredUser);

    const login = useCallback((userData) => {
        const next = {
            id: userData.id,
            username: userData.username,
            email: userData.email ?? '',
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
        setUser(next);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
