import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion'
import { GoPersonAdd } from "react-icons/go";

import ChatLogo from '../../assets/TheChatAppNoBg.png'
import LogoLeft from '../../assets/TheChatAppAddsNoBg-1.png'
import LogoRight from '../../assets/TheChatAppAddsNoBg-2.png'
import LogoBottom from '../../assets/TheChatAppAddsNoBg-3.png'
import ByTobias from '../../assets/ByTobias.png'

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
            {/* Gick inte att CSSa, så fick göra nedan lösning med två olika divar */}
            {/* Logotyp för små skärmar */}
            <motion.img
                initial={{ opacity: 0, filter: "blur(10px)", y: -20 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 2 }}
                src={ChatLogo}
                className="block 2xl:hidden w-20 absolute top-5 left-5"
            />
            {/* Logotyp för stora skärmar (2xl och uppåt) */}
            <motion.img
                initial={{ opacity: 0, filter: "blur(10px)", y: -20 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 2 }}
                src={ChatLogo}
                className="hidden 2xl:block absolute top-20"
            />

            {/* Logotyp för små skärmar */}
            <motion.img
                initial={{ opacity: 0, filter: "blur(10px)", y: -20 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 2 }}
                src={ByTobias}
                className="block 2xl:hidden w-20 absolute top-2 right-2"
            />
            {/* Logotyp för stora skärmar (2xl och uppåt) */}
            <motion.img
                initial={{ opacity: 0, filter: "blur(10px)", y: -20 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 2 }}
                src={ByTobias}
                className="hidden 2xl:block absolute w-32 bottom-10"
            />

            <div className="z-10 relative bg-gray-800 shadow-lg rounded-lg p-8 w-80">
                <motion.img initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.75, duration: 1.5 }} className="absolute -left-44 bottom-40" src={LogoLeft} alt="Logo Add" />
                <motion.img initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.75, duration: 1.5 }} className="absolute -right-36 bottom-40" src={LogoRight} alt="Logo Add" />
                <motion.img initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 1.5 }} className="hidden 2xl:block absolute -bottom-28 left-28" src={LogoBottom} alt="Logo Add" />

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
                        className="flex justify-center gap-2 bg-purple-700 hover:bg-purple-500 text-white p-2 rounded transition"
                    >
                        <div className="text-lg">Register</div>
                        <GoPersonAdd size="25" />
                    </button>
                    <div className="text-white text-center mt-4">Already registered?</div>
                    <Link to="/login" className="text-purple-500 text-center">Login here</Link>
                </form>
            </div>
            <ToastContainer position="top-center" />
        </div>
    );
};

export default Register;
