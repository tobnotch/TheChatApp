import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

const ChatRoomLink = ({ roomId, roomName, isPrivate, userRole }) => {
  const [icon, setIcon] = useState(false);
  const isDisabled = isPrivate && userRole !== "VIP";

  return (
    <motion.div initial={{ x: 0 }} whileHover={{ x: isDisabled ? 0 : 8 }}>
      {isDisabled ? (
        <span className="text-gray-500 cursor-not-allowed flex items-center">
          {roomName} <FaLock className="ml-1" />
        </span>
      ) : (
        <Link to={`/chatroom/${roomId}`} className="text-white">
          {roomName}
        </Link>
      )}
    </motion.div>
  )
};

export default ChatRoomLink;
