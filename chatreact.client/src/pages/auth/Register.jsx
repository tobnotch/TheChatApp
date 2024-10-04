import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChatLogo from '../../assets/TheChatAppNoBg.png'
import LogoLeft from '../../assets/TheChatAppAddsNoBg-1.png'
import LogoRight from '../../assets/TheChatAppAddsNoBg-2.png'
import LogoBottom from '../../assets/TheChatAppAddsNoBg-3.png'

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password === confirmPassword) {
            await signup();
        } else {
            toast.error("Passwords do not match!");
        }
    };

    const signup = async () => {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                    confirmPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                toast.error(data.message || "Signup failed. Please try again.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900">
            <img className="absolute top-20" src={ChatLogo} alt="Logo" />
            <div className="z-10 relative bg-gray-800 shadow-lg rounded-lg p-8 w-80">
                <img className="absolute -left-44 bottom-40" src={LogoLeft} alt="Logo Add" />
                <img className="absolute -right-36 bottom-40" src={LogoRight} alt="Logo Add" />
                <img className="absolute -bottom-28 left-1/2 transform -translate-x-1/2" src={LogoBottom} alt="Logo Add" />

                <h1 className="text-2xl text-white text-center mb-6">Register</h1>
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
                    <input
                        type="password"
                        id="confirmPassword"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-purple-700 hover:bg-purple-500 text-white p-2 rounded transition"
                    >
                        Register
                    </button>
                    <div className="text-white text-center mt-4">Already registered?</div>
                    <Link to="/login" className="text-purple-500 text-center">Login here</Link>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Register;
