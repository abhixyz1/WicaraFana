import React, { useEffect } from 'react';
import { UserProvider } from './contexts/UserContext';
import { ChatProvider } from './contexts/ChatContext';
import { useChat } from './contexts/ChatContext';
import WelcomeScreen from './components/WelcomeScreen';
import ChatWindow from './components/ChatWindow';
import { connectSocket, disconnectSocket } from './services/socket';

function ChatApp() {
  const { currentRoom } = useChat();

  useEffect(() => {
    // Connect to socket when the app loads
    connectSocket();

    // Disconnect when the app unmounts
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent opacity-30 z-0"></div>
      <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-primary-300 to-transparent opacity-20 z-0"></div>
      
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        {currentRoom ? <ChatWindow /> : <WelcomeScreen />}
      </div>
      
      <div className="fixed bottom-2 right-2 text-xs text-white bg-black bg-opacity-20 px-2 py-1 rounded-full backdrop-blur-sm z-50">
        v1.0.0
      </div>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <ChatProvider>
        <ChatApp />
      </ChatProvider>
    </UserProvider>
  );
}

export default App;
