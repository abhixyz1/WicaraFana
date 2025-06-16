import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useChat } from '../contexts/ChatContext';
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
  const [tagline, setTagline] = useState<string>(TAGLINES[0]);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [hasStoredToken, setHasStoredToken] = useState<boolean>(false);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 p-4 overflow-hidden relative">
      {/* Simplified decorative bubbles */}
      {BUBBLES.map(bubble => (
        <div
          key={bubble.id}
          className="absolute rounded-full bg-primary-500 bg-opacity-5 animate-float"
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
      
      {/* Main content container */}
      <div className="w-full max-w-lg z-10 px-4">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-primary-800 mb-2">Wicara Fana</h1>
          <p className="text-primary-600 text-lg">{tagline}</p>
        </div>
        
        {/* Main card with clean design */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {user ? (
            needsCharacterSelection ? (
              <CharacterSelection onSelectCharacter={handleSelectCharacter} />
            ) : (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Mulai Ngobrol</h2>
                
                <div className="flex items-center mb-4 p-3 bg-primary-50 rounded-lg">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3 border border-primary-200">
                    <img 
                      src={user.avatar} 
                      alt={user.characterName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-gray-700">Hai, <span className="font-medium">{user.characterName}</span>! 👋</p>
                    <p className="text-sm text-gray-500">Siap untuk ngobrol di ruang chat global?</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-6 p-3 bg-blue-50 rounded-lg">
                  <div className="text-blue-500 mr-3 mt-1">ℹ️</div>
                  <div className="text-sm text-blue-700">
                    <ul className="space-y-1">
                      <li>• Semua user bisa saling chat dalam 1 ruangan</li>
                      <li>• Pesan akan hilang setelah 3 jam</li>
                      <li>• Chat bersifat anonim, hanya karakter yang ditampilkan</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleJoinChat}
                    disabled={isJoining}
                    className={`w-full py-3 rounded-lg text-white font-medium transition-all ${
                      isJoining 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-primary-600 hover:bg-primary-700 hover:scale-[1.01] active:scale-[0.99]'
                    }`}
                  >
                    {isJoining ? 'Menghubungkan...' : 'Gabung Chat Global!'}
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full py-2 rounded-lg text-red-600 border border-red-200 hover:bg-red-50 font-medium transition-all"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )
          ) : hasStoredToken ? (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Selamat Datang Kembali!</h2>
              
              <div className="flex items-center mb-6 p-3 bg-primary-50 rounded-lg">
                <div className="text-primary-500 mr-3 text-xl">🔑</div>
                <p className="text-gray-700">Kami mendeteksi sesi sebelumnya. Pilih opsi di bawah:</p>
              </div>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleLoginWithToken}
                  className="w-full py-3 rounded-lg text-white font-medium transition-all bg-primary-600 hover:bg-primary-700"
                >
                  Gunakan Sesi Sebelumnya
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-all border border-gray-200"
                >
                  Buat Sesi Baru
                </button>
              </div>
            </div>
          ) : (
            <Auth />
          )}
        </div>
        
        <div className="text-center text-xs text-primary-700 opacity-80 mt-4">
          <p>Semua chat akan hilang setelah 3 jam.</p>
          <p className="mt-1">
            Created by <a href="https://github.com/abhixyz1" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-800">@abhixyz1</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen; 