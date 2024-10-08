import React, { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import DOMPurify from 'dompurify';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom';

import { FaPaperPlane } from 'react-icons/fa';
import { IoIosArrowForward } from "react-icons/io";

import ChatRoomLink from '../components/ChatRoomLink'
import ChatLogo from '../assets/TheChatAppNoBg.png'
import ByTobias from '../assets/ByTobias.png'

const chatRooms = [
  { id: 'main', name: 'Main Stage', isPrivate: false },
  { id: 'bash', name: 'Bug Bash', isPrivate: false },
  { id: 'hangout', name: '404 Hangout', isPrivate: false },
  { id: 'club', name: 'Commit Club', isPrivate: false },
  { id: 'cafe', name: 'Infinite Loop Cafe', isPrivate: false },
  { id: 'vip', name: 'VIP Vault', isPrivate: true },
];

const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      duration: 2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.2,
      staggerDirection: -1,
      duration: 1.5,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.3 }
  }
};

const ChatRoom = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [connection, setConnection] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMenuInvisible, setIsMenuInvisible] = useState(false);

  const chatRef = useRef(null);
  const { id } = useParams();
  const room = chatRooms.find(room => room.id === id);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('jwtToken');
    if (token) {
      const decodedJwt = JSON.parse(atob(token.split('.')[1]));
      setUsername(decodedJwt.unique_name);
      setUserRole(decodedJwt.role);

      const connection = new signalR.HubConnectionBuilder()
        .withUrl('/chathub', { accessTokenFactory: () => token })
        .build();

      connection.start().then(() => {
        setMessages([]);

        connection.invoke('JoinRoom', id)
          .catch(err => toast.error(`Failed to join room: ${err.message}`));
      })
        .catch(err => {
          toast.error("Connection failed!");
        });

      connection.on('ReceiveMessage', (user, message) => {
        const sanitizedUser = DOMPurify.sanitize(user);
        const sanitizedMessage = DOMPurify.sanitize(message);

        setMessages((prevMessages) => [...prevMessages, { user: sanitizedUser, message: sanitizedMessage }]);
      });

      setConnection(connection);
    } else {
      toast.error("You are not authorized!");
    }

    return () => {
      if (connection) connection.stop();
    };
  }, [id]);

  useEffect(() => {
    ScrollToBottom();
  }, [messages]);

  const ScrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  const CheckAndEnter = (e) => {
    if (e.key === "Enter") SendMessage();
  }

  const SendMessage = () => {
    if (connection) {
      connection.send('SendMessage', username, message, id).then(() => {
        setMessage('');
      }).catch(err => toast.error("Message failed to send"));
    }
  };

  const toggleMenu = () => {
    setIsVisible((prev) => !prev);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('jwtToken');
    navigate('/login');
  };

  const handleSurpriseClick = () => {
    if (connection) {
      connection.send('SendMessage', username, "Ahhhhhh! I'm spinninggg!", id).then(() => {
        setMessage('');
      }).catch(err => toast.error("Message failed to send"));
    }

    setIsFlipped(true);
    setIsMenuInvisible(true);

    setTimeout(() => {
      setIsFlipped(false);
    }, 2000);
    setTimeout(() => {
      setIsMenuInvisible(false);
    }, 4500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gray-900 overflow-hidden">
      {/* Gick inte att CSSa, så fick göra nedan lösning med två olika divar */}
      {/* Logotyp för små skärmar */}
      <motion.img
        initial={{ opacity: 0, filter: "blur(10px)", y: -20 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 2, delay: 1 }}
        src={ChatLogo}
        className="block 2xl:hidden w-20 absolute top-5 left-5"
      />
      {/* Logotyp för stora skärmar (2xl och uppåt) */}
      <motion.img
        initial={{ opacity: 0, filter: "blur(10px)", y: -20 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 2, delay: 1 }}
        src={ChatLogo}
        className="hidden 2xl:block absolute w-40 top-5 left-5"
      />

      {/* Logotyp för små skärmar */}
      <motion.img
        initial={{ opacity: 0, filter: "blur(10px)", y: -20 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 2, delay: 1 }}
        src={ByTobias}
        className="block 2xl:hidden w-20 absolute top-2 right-2"
      />
      {/* Logotyp för stora skärmar (2xl och uppåt) */}
      <motion.img
        initial={{ opacity: 0, filter: "blur(10px)", y: -20 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 2, delay: 1 }}
        src={ByTobias}
        className="hidden 2xl:block absolute w-32 top-2 right-2"
      />

      <div className="text-white font-bold mb-5 text-2xl">{room.name}</div>

      <button
        onClick={handleLogout}
        className="absolute bottom-5 right-5 bg-red-500 hover:bg-red-400 duration-300 text-white px-4 py-2 rounded"
      >
        Log out
      </button>

      <motion.button
        className="fixed bottom-5 left-5 bg-orange-500 hover:bg-orange-400 transition-colors duration-300 text-white px-4 py-2 rounded"
        onClick={handleSurpriseClick}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 1.3, rotate: 360, x: 6 }}
      >
        Surprise!
      </motion.button>

      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: isFlipped ? 3000 : 0, y: isFlipped ? 1000 : 0 }}
        transition={{ duration: 2.5 }}
      >
        <motion.div
          initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 1 }}
          className="z-10 w-[512px] 2xl:w-[812px] relative bg-gray-800 shadow-lg rounded-lg p-6 w-[35rem]">
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isMenuInvisible ? 0 : 1 }}
            transition={{
              opacity: {
                duration: isMenuInvisible ? 0 : 1
              }
            }}
            className="flex flex-col p-4 space-y-4 absolute -top-5 -right-[10rem] text-white">
            <div className="flex justify-center items-center space-x-2" onClick={toggleMenu}>
              <h1 className="text-xl font-bold cursor-pointer">
                Chatrooms
              </h1>
              <motion.div
                animate={{ rotate: isVisible ? 90 : 0, y: isVisible ? 3 : 0, x: isVisible ? 3 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <IoIosArrowForward size="20" className="-mb-1 cursor-pointer" />
              </motion.div>
            </div>

            <AnimatePresence>
              {isVisible && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate={isVisible ? "visible" : "hidden"}
                  exit="exit"
                  className="space-y-2"
                >
                  {chatRooms.map((room) => (
                    <motion.div key={room.id} variants={itemVariants}>
                      <ChatRoomLink roomId={room.id} roomName={room.name} isPrivate={room.isPrivate} userRole={userRole} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div
            ref={chatRef} id="chat" className="text-white h-[400px] 2xl:h-[800px] overflow-y-auto overflow-x-hidden">
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
              onClick={SendMessage}
              onHoverStart={() => setHovered(true)}
              onHoverEnd={() => setHovered(false)}
              className="overflow-hidden bg-purple-500 hover:bg-purple-400 duration-300 text-white px-10 py-2 relative rounded flex items-center justify-center"
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
        </motion.div>
      </motion.div>
      <ToastContainer position="bottom-left" />
    </div>
  );
};

export default ChatRoom;
