import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useChat } from '../contexts/ChatContext';
import Auth from './Auth';
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

// Bubble animations
const BUBBLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  size: Math.random() * 60 + 20,
  left: Math.random() * 100,
  animationDuration: Math.random() * 15 + 10,
  delay: Math.random() * 5,
}));

const WelcomeScreen: React.FC = () => {
  const { user, loginWithToken } = useUser();
  const { joinRandomRoom } = useChat();
  const [tagline, setTagline] = useState<string>(TAGLINES[0]);
  const [isJoining, setIsJoining] = useState<boolean>(false);
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
      try {
        const tokenData = JSON.parse(savedToken);
        loginWithToken(tokenData.value);
      } catch (error) {
        console.error('Invalid token format:', error);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
  }, [loginWithToken]);

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4 overflow-hidden relative">
      {/* Decorative bubbles */}
      {BUBBLES.map(bubble => (
        <div
          key={bubble.id}
          className="absolute rounded-full bg-primary-500 bg-opacity-10 animate-float"
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
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-primary-800 mb-2">Wicara Fana</h1>
          <p className="text-primary-600 text-lg animate-pulse">{tagline}</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 animate-scale-in">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            {user ? 'Mulai Ngobrol' : 'Masuk dulu yuk!'}
          </h2>
          
          {user ? (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
                <p className="text-gray-700 mb-1">Hai, <span className="font-medium">{user.gender === 'male' ? 'Bro' : 'Sis'}</span>! 👋</p>
                <p className="text-sm text-gray-500">Kamu siap untuk ngobrol di ruang chat global?</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-sm">
                <p className="font-medium text-blue-700 mb-1">Info Chat Global:</p>
                <ul className="list-disc list-inside text-blue-600 space-y-1">
                  <li>Semua user bisa saling chat dalam 1 ruangan</li>
                  <li>Pesan akan hilang setelah 3 jam</li>
                  <li>Chat bersifat anonim, hanya gender yang ditampilkan</li>
                </ul>
              </div>
              
              <button
                onClick={handleJoinChat}
                disabled={isJoining}
                className={`w-full py-3 rounded-lg text-white font-medium transition-all ${
                  isJoining 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary-600 hover:bg-primary-700 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isJoining ? 'Menghubungkan...' : 'Gabung Chat Global!'}
              </button>
            </div>
          ) : (
            <Auth />
          )}
        </div>
        
        <div className="text-center text-xs text-primary-700 opacity-80 animate-fade-in">
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