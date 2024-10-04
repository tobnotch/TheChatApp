import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import DOMPurify from 'dompurify';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion'

import { FaPaperPlane } from 'react-icons/fa';

import ChatRoomLink from '../components/ChatRoomLink'
import ChatLogo from '../assets/TheChatAppNoBg.png'
import ByTobias from '../assets/ByTobias.png'

const chatRooms = [
    { id: 'uno', name: 'Room Uno' },
    { id: 'dos', name: 'Room Dos' },
    { id: 'tres', name: 'Room Tres' },
    { id: 'cuatro', name: 'Room Cuatro' },
    { id: 'cinco', name: 'Room Cinco' }
];

const containerVariants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.25,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
        opacity: 1, y: 0,
        transition: { duration: 1 }
    },
};

const MainChat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [username, setUsername] = useState('');
    const chatRef = useRef(null);
    const [connection, setConnection] = useState(null);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        const token = sessionStorage.getItem('jwtToken');
        if (token) {
            const decodedJwt = JSON.parse(atob(token.split('.')[1]));
            setUsername(decodedJwt.unique_name);

            const newConnection = new signalR.HubConnectionBuilder()
                .withUrl('/chathub', { accessTokenFactory: () => token })
                .build();

            newConnection.start().then(() => {
                toast.success("Connected to chat!");
            }).catch(err => {
                toast.error("Connection failed!");
            });

            newConnection.on('ReceiveMessage', (user, message) => {
                const sanitizedUser = DOMPurify.sanitize(user);
                const sanitizedMessage = DOMPurify.sanitize(message);

                setMessages((prevMessages) => [...prevMessages, { user: sanitizedUser, message: sanitizedMessage }]);
                ScrollToBottom();
            });

            setConnection(newConnection);
        } else {
            toast.error("You are not authorized!");
        }

        return () => {
            if (connection) connection.stop();
        };
    }, []);

    const ScrollToBottom = () => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    };

    const CheckAndEnter = (e) => {
        if (e.key === "Enter") SendMessage();
    }

    const SendMessage = () => {
        if (connection) {
            connection.send('SendMessage', username, message).then(() => {
                setMessage('');
            }).catch(err => toast.error("Message failed to send"));
        }
    };

    return (
        <div className="min-h-screen w-full flex justify-center items-center bg-gray-900">
            <img className="absolute top-10 left-10 w-20" src={ChatLogo} alt="Chat Header" />
            <img src={ByTobias} className="w-20 absolute top-5 right-10" />

            <div className="z-10 relative bg-gray-800 shadow-lg rounded-lg p-6 w-[35rem]">
                <div className="flex flex-col p-4 space-y-4 absolute top-36 -left-[20rem] text-white">
                    <h1 className="text-xl font-bold cursor-default">Chatrooms</h1>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-3"
                    >
                        {chatRooms.map((room) => (
                            <motion.div key={room.id} variants={itemVariants}>
                                <ChatRoomLink roomId={room.id} roomName={room.name} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                <div ref={chatRef} id="chat" className="text-white h-[500px] overflow-y-auto overflow-x-hidden">
                    {messages.map((msg, index) => (
                        <div key={index} className="message">
                            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}><span className="font-bold">{msg.user}:</span> {msg.message}</motion.div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-4 pt-4">
                    <input
                        type="text"
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={CheckAndEnter}
                        placeholder="Type a message..."
                        className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <motion.button
                        onHoverStart={() => setHovered(true)}
                        onHoverEnd={() => setHovered(false)}
                        className="overflow-hidden bg-purple-500 text-white px-10 py-2 relative rounded flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ opacity: 1 }}
                            animate={{ opacity: hovered ? 0 : 1, y: hovered ? -20 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute"
                        >
                            Send
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 20 }}
                            transition={{ duration: 0.3 }}
                            className="absolute"
                        >
                            <FaPaperPlane size={20} />
                        </motion.div>
                    </motion.button>
                </div>
            </div>
            <ToastContainer position="top-center" />
        </div>
    );
};

export default MainChat;
