import { useParams } from 'react-router-dom';

const ChatRoom = () => {
  const { id } = useParams(); // Hämta den dynamiska parametern från URL:en

  return (
    <div className="chat-room">
      <h1>Welcome to {id}!</h1>
      {/* Här kan du inkludera logik för att visa meddelanden för specifikt rum */}
    </div>
  );
};

export default ChatRoom;
