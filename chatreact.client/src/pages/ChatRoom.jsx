import { useParams } from 'react-router-dom';

const ChatRoom = () => {
  const { id } = useParams(); // H�mta den dynamiska parametern fr�n URL:en

  return (
    <div className="chat-room">
      <h1>Welcome to {id}!</h1>
      {/* H�r kan du inkludera logik f�r att visa meddelanden f�r specifikt rum */}
    </div>
  );
};

export default ChatRoom;
