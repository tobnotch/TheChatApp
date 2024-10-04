import React, { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import DOMPurify from 'dompurify';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChatLogo from '../assets/TheChatAppNoBg.png'

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
                scrollToBottom();
            });

            setConnection(newConnection);
        } else {
            toast.error("You are not authorized!");
        }

        return () => {
            if (connection) connection.stop();
        };
    }, []);

    const scrollToBottom = () => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    };

    const sendMessage = () => {
        if (connection) {
            connection.send('SendMessage', username, message).then(() => {
                setMessage('');
            }).catch(err => toast.error("Message failed to send"));
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900">
            <img className="mb-8" src={ChatLogo} alt="Chat Header" />
            <div className="bg-gray-800 shadow-lg rounded-lg p-8 w-80">
                <div ref={chatRef} id="chat" className="mb-2 p-4 text-white h-[500px] overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className="message">
                            <span className="font-bold">{msg.user}:</span> {msg.message}
                        </div>
                    ))}
                </div>
                <div className="flex gap-4">
                    <input
                        type="text"
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={sendMessage}
                        className="bg-purple-700 hover:bg-purple-500 text-white p-2 rounded"
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
