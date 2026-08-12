import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const links = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "History", path: "/history" },
        { label: "🎙️ Mock Interview", path: "/mock-interview" },
    ];

    return (
        <nav className="w-full bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
            {/* Logo */}
            <div
                onClick={() => navigate("/dashboard")}
                className="text-blue-400 font-bold text-lg cursor-pointer"
            >
                AI Resume Checker
            </div>

            {/* Links */}
            <div className="flex items-center gap-2">
                {links.map((link) => (
                    <button
                        key={link.path}
                        onClick={() => navigate(link.path)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition
                            ${location.pathname === link.path
                                ? "bg-blue-600 text-white"
                                : "text-gray-400 hover:text-white hover:bg-gray-800"
                            }`}
                    >
                        {link.label}
                    </button>
                ))}

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="ml-4 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-white hover:bg-red-600 transition"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}
