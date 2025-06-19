import React, { useEffect } from 'react';
import { UserProvider } from './contexts/UserContext';
import { ChatProvider } from './contexts/ChatContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useChat } from './contexts/ChatContext';
import WelcomeScreen from './components/WelcomeScreen';
import { connectSocket, disconnectSocket } from './services/socket';
import { Routes, Route, Navigate } from 'react-router-dom';
import Chat from './pages/Chat';
import ThemeToggle from './components/ThemeToggle';

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
    <div className="h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 dark:from-dark-900 dark:via-dark-800 dark:to-dark-950 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden relative transition-colors duration-300">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white dark:from-dark-950 to-transparent opacity-30 z-0"></div>
      <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-primary-300 dark:from-dark-800 to-transparent opacity-20 z-0"></div>
      
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="fixed bottom-2 right-2 text-xs text-white bg-black bg-opacity-20 dark:bg-white dark:bg-opacity-10 px-2 py-1 rounded-full backdrop-blur-sm z-50">
        v1.0.0
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <ChatProvider>
          <ChatApp />
        </ChatProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
