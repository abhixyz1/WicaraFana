import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { useUser } from '../contexts/UserContext';
import ChatWindow from '../components/ChatWindow';

const ChatPage: React.FC = () => {
  const { user } = useUser();
  const { currentRoom, joinRandomRoom, leaveCurrentRoom } = useChat();
  const navigate = useNavigate();

  // Jika tidak ada user, redirect ke home
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Jika tidak ada room, coba join room
  useEffect(() => {
    if (user && !currentRoom) {
      joinRandomRoom();
    }
  }, [user, currentRoom, joinRandomRoom]);

  // Handle exit chat
  const handleExitChat = () => {
    leaveCurrentRoom();
    navigate('/');
  };

  // Loading state jika user ada tapi room belum ada
  if (user && !currentRoom) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full animate-fade-in">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-primary-700 mb-4">Menghubungkan ke Chat...</h2>
          <p className="text-gray-600 mb-6">Mohon tunggu sebentar, kami sedang mencari teman ngobrol untuk kamu.</p>
          <div className="flex justify-center">
            <div className="animate-pulse flex space-x-2">
              <div className="w-3 h-3 bg-primary-400 rounded-full"></div>
              <div className="w-3 h-3 bg-primary-500 rounded-full animation-delay-200"></div>
              <div className="w-3 h-3 bg-primary-600 rounded-full animation-delay-400"></div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="mt-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  // Jika tidak ada user, tampilkan null (akan di-redirect oleh useEffect)
  if (!user) {
    return null;
  }

  return <ChatWindow onExitChat={handleExitChat} />;
};

export default ChatPage; 