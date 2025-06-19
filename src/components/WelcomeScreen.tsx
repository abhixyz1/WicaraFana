import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useChat } from '../contexts/ChatContext';
import { useTheme } from '../contexts/ThemeContext';
import Auth from './Auth';
import CharacterSelection from './CharacterSelection';
import { useNavigate } from 'react-router-dom';

// Token storage key
const TOKEN_STORAGE_KEY = 'wicaraFanaToken';

// Fun taglines for the app
const TAGLINES = [
  "Ngobrol seru bareng semua orang!",
  "Chat global, tanpa jejak!",
  "Spill the tea bareng-bareng!",
  "Satu ruang, banyak cerita!",
  "Cerita hari ini, hilang besok!",
  "Curhat bebas, tanpa bekas!",
  "Obrolan fana, keseruan nyata!",
  "Rahasia aman, chat menghilang!",
  "Ngobrol santai bareng semua orang!",
  "Bebas ngomong, tanpa khawatir!"
];

// Reduced number of bubbles for better performance
const BUBBLES = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  size: Math.random() * 40 + 20, // Smaller bubbles
  left: Math.random() * 100,
  animationDuration: Math.random() * 15 + 10,
  delay: Math.random() * 5,
}));

const WelcomeScreen: React.FC = () => {
  const { user, loginWithToken, logout, needsCharacterSelection, setUserCharacter } = useUser();
  const { joinRandomRoom } = useChat();
  const { isDark } = useTheme();
  const [tagline, setTagline] = useState<string>(TAGLINES[0]);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [hasStoredToken, setHasStoredToken] = useState<boolean>(false);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // Change tagline every 5 seconds
  useEffect(() => {
    const taglineInterval = setInterval(() => {
      setTagline(TAGLINES[Math.floor(Math.random() * TAGLINES.length)]);
    }, 5000);
    
    return () => clearInterval(taglineInterval);
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (savedToken) {
      setHasStoredToken(true);
    }
    
    // Trigger entrance animation
    setTimeout(() => {
      setShowAnimation(true);
    }, 100);
  }, []);

  // Login with stored token
  const handleLoginWithToken = () => {
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (savedToken) {
      try {
        const tokenData = JSON.parse(savedToken);
        loginWithToken(tokenData.value);
      } catch (error) {
        console.error('Invalid token format:', error);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setHasStoredToken(false);
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setHasStoredToken(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Handle character selection
  const handleSelectCharacter = (characterId: number) => {
    setUserCharacter(characterId);
  };

  // Join chat room when user is authenticated
  const handleJoinChat = () => {
    if (!user) return;
    
    setIsJoining(true);
    
    try {
      // Mencoba join room dan navigasi ke halaman chat
      joinRandomRoom();
      
      // Delay navigasi sedikit untuk memastikan room sudah dibuat
      setTimeout(() => {
        navigate('/chat');
        setIsJoining(false);
      }, 500);
    } catch (error) {
      console.error('Failed to join chat:', error);
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {BUBBLES.map(bubble => (
          <div
            key={bubble.id}
            className={`absolute rounded-full bg-primary-500 bg-opacity-5 dark:bg-primary-400 dark:bg-opacity-5 animate-float`}
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              bottom: '-20px',
              animationDuration: `${bubble.animationDuration}s`,
              animationDelay: `${bubble.delay}s`,
            }}
          />
        ))}
      </div>
      
      {/* Main content container with animation */}
      <div 
        className={`w-full max-w-lg z-10 px-4 sm:px-6 md:px-0 transition-all duration-700 transform ${
          showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <div className="text-center mb-6">
          <div className="inline-block relative">
            <h1 className="text-4xl sm:text-5xl font-bold text-primary-800 dark:text-primary-300 mb-2 relative z-10">
              Wicara Fana
            </h1>
            <div className="absolute -bottom-2 -right-2 w-full h-full bg-secondary-400 dark:bg-secondary-700 rounded-lg opacity-20 z-0"></div>
          </div>
          <p className="text-primary-700 dark:text-primary-400 text-base sm:text-lg mt-2">{tagline}</p>
        </div>
        
        {/* Main card with glass effect */}
        <div className={`${isDark ? 'glass-effect-dark' : 'glass-effect'} rounded-xl shadow-glass overflow-hidden backdrop-blur-md`}>
          {user ? (
            needsCharacterSelection ? (
              <CharacterSelection onSelectCharacter={handleSelectCharacter} />
            ) : (
              <div className="p-5 sm:p-7">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Mulai Ngobrol</h2>
                
                <div className="flex items-center mb-5 p-4 bg-primary-50 dark:bg-dark-700 rounded-lg transition-colors">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden mr-4 border-2 border-primary-200 dark:border-primary-700 flex-shrink-0 shadow-md">
                    <img 
                      src={user.avatar} 
                      alt={user.characterName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-gray-800 dark:text-gray-100 font-medium text-lg">Hai, <span className="font-bold text-primary-700 dark:text-primary-400">{user.characterName}</span>! 👋</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Siap untuk ngobrol di ruang chat global?</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <div className="text-blue-500 dark:text-blue-300 mr-3 mt-1 text-lg">ℹ️</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <ul className="space-y-1.5">
                      <li className="flex items-center">
                        <span className="mr-2">•</span>
                        <span>Semua user bisa saling chat dalam 1 ruangan</span>
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">•</span>
                        <span>Pesan akan hilang setelah 3 jam</span>
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">•</span>
                        <span>Chat bersifat anonim, hanya karakter yang ditampilkan</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleJoinChat}
                    disabled={isJoining}
                    className={`btn-primary ${
                      isJoining ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isJoining ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menghubungkan...
                      </span>
                    ) : 'Gabung Chat Global!'}
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="btn-outline text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )
          ) : hasStoredToken ? (
            <div className="p-5 sm:p-7">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center">Selamat Datang Kembali!</h2>
              
              <div className="flex items-center mb-6 p-4 bg-primary-50 dark:bg-dark-700 rounded-lg">
                <div className="text-primary-500 dark:text-primary-400 mr-3 text-2xl">🔑</div>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Kami mendeteksi sesi sebelumnya. Pilih opsi di bawah:</p>
              </div>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleLoginWithToken}
                  className="btn-primary"
                >
                  Gunakan Sesi Sebelumnya
                </button>
                
                <button
                  onClick={handleLogout}
                  className="btn-outline"
                >
                  Buat Sesi Baru
                </button>
              </div>
            </div>
          ) : (
            <Auth />
          )}
        </div>
        
        <div className="text-center text-xs text-primary-700 dark:text-primary-400 opacity-80 mt-4">
          <p>Semua chat akan hilang setelah 3 jam.</p>
          <p className="mt-1">
            Created by <a href="https://github.com/abhixyz1" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-800 dark:hover:text-primary-300">@abhixyz1</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen; 