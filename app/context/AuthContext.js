// AuthContext — global state for authentication
// Stores the JWT token and user object, provides login/logout functions
// Wraps the entire app so any component can access auth state

'use client';
import { createContext, useContext, useState, useEffect } from 'react';

// Create context with default values
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);   // { id, name, email, role, classGrade }
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // checking localStorage on mount

    // On app load — restore user from localStorage if previously logged in
    useEffect(() => {
        const savedToken = localStorage.getItem('school_token');
        const savedUser = localStorage.getItem('school_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    // Called after a successful /api/auth/login response
    const login = (tokenValue, userData) => {
        localStorage.setItem('school_token', tokenValue);
        localStorage.setItem('school_user', JSON.stringify(userData));
        setToken(tokenValue);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('school_token');
        localStorage.removeItem('school_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook — use this in any component: const { user, login, logout } = useAuth()
export const useAuth = () => useContext(AuthContext);
