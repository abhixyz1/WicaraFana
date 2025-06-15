import React, { useState, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useUser } from '../contexts/UserContext';

const WelcomeScreen: React.FC = () => {
  const { joinRandomRoom } = useChat();
  const { user, setUserGender } = useUser();
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(user?.gender || null);
  const [animationClass, setAnimationClass] = useState('opacity-0');
  const [bubbles, setBubbles] = useState<Array<{id: number, size: number, left: string, animationDuration: string}>>([]);

  // Generate random bubbles for background animation
  useEffect(() => {
    const newBubbles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 100) + 50, // 50-150px
      left: `${Math.floor(Math.random() * 100)}%`,
      animationDuration: `${Math.floor(Math.random() * 20) + 10}s` // 10-30s
    }));
    setBubbles(newBubbles);
    
    // Fade in animation
    setTimeout(() => {
      setAnimationClass('opacity-100 transform-none');
    }, 100);
  }, []);

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
    setUserGender(gender);
  };

  const handleStartChat = () => {
    if (selectedGender) {
      joinRandomRoom();
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Animated background bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        {bubbles.map(bubble => (
          <div 
            key={bubble.id}
            className="absolute rounded-full bg-primary-200 bg-opacity-30 animate-float"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: bubble.left,
              bottom: '-100px',
              animationDuration: bubble.animationDuration,
              animationDelay: `${bubble.id * 0.3}s`
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-50 opacity-80 z-0"></div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 w-full">
        <div 
          className={`bg-white bg-opacity-95 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full border border-primary-100 transform transition-all duration-700 ${animationClass} translate-y-8`}
        >
          <div className="text-center mb-10">
            <div className="inline-block relative">
              <h1 className="text-5xl font-bold text-primary-800 mb-3 relative z-10">Wicara Fana</h1>
              <div className="absolute -bottom-3 left-0 right-0 h-3 bg-primary-300 opacity-50 rounded-full"></div>
            </div>
            <p className="text-gray-600 mt-4">
              Chat anonim dengan orang acak. Semua chat akan menghilang setelah 3 jam.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-lg font-medium text-gray-700 mb-6 text-center">Pilih Gender Anda</h2>
            
            <div className="flex gap-6 justify-center">
              <div 
                onClick={() => handleGenderSelect('male')}
                className={`flex flex-col items-center p-5 rounded-2xl cursor-pointer transition-all transform hover:scale-105 ${
                  selectedGender === 'male' 
                    ? 'bg-blue-100 border-2 border-blue-500 shadow-lg scale-105' 
                    : 'bg-white border border-gray-200 hover:bg-blue-50 hover:shadow-md'
                }`}
              >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 text-white text-3xl transition-all ${
                  selectedGender === 'male' 
                    ? 'bg-blue-500 shadow-lg shadow-blue-200' 
                    : 'bg-blue-400'
                }`}>
                  M
                </div>
                <span className="font-medium text-gray-800">Laki-laki</span>
              </div>

              <div 
                onClick={() => handleGenderSelect('female')}
                className={`flex flex-col items-center p-5 rounded-2xl cursor-pointer transition-all transform hover:scale-105 ${
                  selectedGender === 'female' 
                    ? 'bg-pink-100 border-2 border-pink-500 shadow-lg scale-105' 
                    : 'bg-white border border-gray-200 hover:bg-pink-50 hover:shadow-md'
                }`}
              >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 text-white text-3xl transition-all ${
                  selectedGender === 'female' 
                    ? 'bg-pink-500 shadow-lg shadow-pink-200' 
                    : 'bg-pink-400'
                }`}>
                  F
                </div>
                <span className="font-medium text-gray-800">Perempuan</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartChat}
            disabled={!selectedGender}
            className={`w-full py-4 px-6 rounded-xl transition-all text-white font-medium text-lg ${
              selectedGender 
                ? 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 shadow-lg hover:shadow-xl shadow-primary-200/50 transform hover:-translate-y-1' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Mulai Chat
          </button>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p className="mb-2">
              Dengan menggunakan layanan ini, Anda setuju untuk berkomunikasi secara bertanggung jawab.
              <br />
              Bersikaplah baik dan hormati orang lain.
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Created by <a href="https://github.com/abhixyz1" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">@abhixyz1</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen; 