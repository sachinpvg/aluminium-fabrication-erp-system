    import React, { createContext, useContext, useState, useEffect } from 'react';

    const AuthContext = createContext(null);

    export function AuthProvider({ children }) {
        const [user, setUser] = useState(null);
        const [token, setToken] = useState(null);
        const [loading, setLoading] = useState(true);

        // Restore session from localStorage on mount
        useEffect(() => {
            const storedToken = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('authUser');
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
            setLoading(false);
        }, []);

        const login = (newToken, newUser) => {
            localStorage.setItem('authToken', newToken);
            localStorage.setItem('authUser', JSON.stringify(newUser));
            setToken(newToken);
            setUser(newUser);
        };

        const logout = () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            setToken(null);
            setUser(null);
        };

        return (
            <AuthContext.Provider value={{ user, token, login, logout, loading }}>
                {children}
            </AuthContext.Provider>
        );
    }

    export function useAuth() {
        return useContext(AuthContext);
    }

    export default AuthContext;
