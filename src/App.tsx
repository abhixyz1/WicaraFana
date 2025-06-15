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
    <div className="h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4 sm:p-6 md:p-8">
      {currentRoom ? <ChatWindow /> : <WelcomeScreen />}
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
