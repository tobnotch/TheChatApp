import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import DOMPurify from 'dompurify';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion'

import ChatRoomLink from '../components/ChatRoomLink'
import ChatLogo from '../assets/TheChatAppNoBg.png'

const chatRooms = [
    { id: 'uno', name: 'Room Uno' },
    { id: 'dos', name: 'Room Dos' },
    { id: 'tres', name: 'Room Tres' },
    { id: 'cuatro', name: 'Room Cuatro' },
    { id: 'cinco', name: 'Room Cinco' }
];

const MainChat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [username, setUsername] = useState('');
    const chatRef = useRef(null);
    const [connection, setConnection] = useState(null);

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
            <img className="absolute top-10" src={ChatLogo} alt="Chat Header" />

            <div className="z-10 relative bg-gray-800 shadow-lg rounded-lg p-4 w-80">
                <div className="flex flex-col p-4 space-y-4 absolute top-0 -left-80 text-white">
                    <h1 className="text-xl font-bold cursor-default">Chatrooms</h1>
                    {chatRooms.map((room) => (
                        <ChatRoomLink key={room.id} roomId={room.id} roomName={room.name} />
                    ))}
                </div>

                <div ref={chatRef} id="chat" className="px-4 text-white h-[500px] overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className="message">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}><span className="font-bold">{msg.user}:</span> {msg.message}</motion.div>
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
                    <button
                        onClick={SendMessage}
                        className="bg-purple-700 hover:bg-purple-500 duration-300 text-white p-2 rounded"
                    >
                        Send
                    </button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default MainChat;
