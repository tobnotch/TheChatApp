import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChatLogo from '../../assets/TheChatAppNoBg.png'
import LogoLeft from '../../assets/TheChatAppAddsNoBg-1.png'
import LogoRight from '../../assets/TheChatAppAddsNoBg-2.png'
import LogoBottom from '../../assets/TheChatAppAddsNoBg-3.png'

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (username && password) {
            setLoading(true);
            await login();
            setLoading(false);
        } else {
            toast.error("Please fill in both fields.");
        }
    };

    const login = async () => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('jwtToken', data.token);
                toast.success(data.message);
                setTimeout(() => {
                    navigate('/mainchat');
                }, 2000);
            } else {
                toast.error("Username or password is incorrect, try again.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900">
            <img className="absolute top-20" src={ChatLogo} alt="Chat Logo" />
            <div className="z-10 relative bg-gray-800 shadow-lg rounded-lg p-8 w-80">
                <img className="absolute -left-44 bottom-32" src={LogoLeft} alt="Logo Add" />
                <img className="absolute -right-36 bottom-32" src={LogoRight} alt="Logo Add" />
                <img className="absolute -bottom-28 left-1/2 transform -translate-x-1/2" src={LogoBottom} alt="Logo Add" />

                <h1 className="text-2xl text-white text-center mb-6">Login</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        id="username"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password"
                        id="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-purple-700 hover:bg-purple-500 text-white p-2 rounded transition"
                    >
                        Login
                    </button>
                    <div className="text-white text-center mt-4">No account?</div>
                    <Link to="/" className="text-purple-500 text-center">Register here</Link>
                </form>
            </div>

            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="w-16 h-16 border-8 border-t-gray-500 border-gray-300 rounded-full animate-spin"></div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default Login;
