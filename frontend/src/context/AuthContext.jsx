import { createContext, useContext, useState } from 'react'

// Step 1 - Context banao
const AuthContext = createContext()

// Step 2 - Provider banao
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null)
    const storedUser = localStorage.getItem('user')

    const getStoredUser = () => {
    try {
        const user = localStorage.getItem("user");
        return user && user !== "undefined" ? JSON.parse(user) : null;
    } catch (err) {
        console.error("Invalid user in localStorage:", err);
        localStorage.removeItem("user");
        return null;
    }
};
const [user, setUser] = useState(getStoredUser);

    // Step 3 - Login function
    const login = (tokenData, userData) => {
        localStorage.setItem('token', tokenData)
        localStorage.setItem('user', JSON.stringify(userData))
        setToken(tokenData)
        setUser(userData)
    }

    // Step 4 - Logout function
    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

// Step 5 - Custom hook - easy access ke liye
export const useAuth = () => useContext(AuthContext)