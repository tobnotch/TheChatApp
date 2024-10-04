import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ChatRoomLink = ({ roomId, roomName }) => (
    <motion.div initial={{ x: 0 }} whileHover={{ x: 8 }}>
        <Link to={`/chatroom/${roomId}`}>{roomName}</Link>
    </motion.div>
);

export default ChatRoomLink;
