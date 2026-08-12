import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        setMenuOpen(false);
        logout();
        navigate("/login");
    };

    const handleNavigate = (path) => {
        setMenuOpen(false);
        navigate(path);
    };

    const links = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "History", path: "/history" },
        { label: "🎙️ Mock Interview", path: "/mock-interview" },
    ];

    return (
        <nav className="w-full bg-gray-900 border-b border-gray-800 px-4 sm:px-6 py-3 relative z-50">
            <div className="flex items-center justify-between">
                {/* Logo */}
                <div
                    onClick={() => handleNavigate("/dashboard")}
                    className="text-blue-400 font-bold text-base sm:text-lg cursor-pointer shrink-0"
                >
                    AI Resume Checker
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-2">
                    {links.map((link) => (
                        <button
                            key={link.path}
                            onClick={() => handleNavigate(link.path)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap
                                ${location.pathname === link.path
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                                }`}
                        >
                            {link.label}
                        </button>
                    ))}

                    <button
                        onClick={handleLogout}
                        className="ml-4 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-white hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
                    aria-label="Toggle menu"
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu Panel */}
            {menuOpen && (
                <div className="md:hidden mt-3 pb-2 flex flex-col gap-1 border-t border-gray-800 pt-3">
                    {links.map((link) => (
                        <button
                            key={link.path}
                            onClick={() => handleNavigate(link.path)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition
                                ${location.pathname === link.path
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                                }`}
                        >
                            {link.label}
                        </button>
                    ))}

                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-white hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
}
