import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useUser } from '../contexts/UserContext';

const WelcomeScreen: React.FC = () => {
  const { joinRandomRoom } = useChat();
  const { user, setUserGender } = useUser();
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(user?.gender || null);

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
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-primary-100 to-primary-50 p-6 w-full">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-primary-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-800 mb-3">Wicara Fana</h1>
          <p className="text-gray-600">
            Chat anonim dengan orang acak. Semua chat akan menghilang setelah 3 jam.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-700 mb-4 text-center">Pilih Gender Anda</h2>
          
          <div className="flex gap-4 justify-center">
            <div 
              onClick={() => handleGenderSelect('male')}
              className={`flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all transform hover:scale-105 ${
                selectedGender === 'male' 
                  ? 'bg-blue-100 border-2 border-blue-500 shadow-md' 
                  : 'bg-gray-50 border border-gray-200 hover:bg-blue-50'
              }`}
            >
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-3 text-white text-3xl">
                M
              </div>
              <span className="font-medium text-gray-800">Laki-laki</span>
            </div>

            <div 
              onClick={() => handleGenderSelect('female')}
              className={`flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all transform hover:scale-105 ${
                selectedGender === 'female' 
                  ? 'bg-pink-100 border-2 border-pink-500 shadow-md' 
                  : 'bg-gray-50 border border-gray-200 hover:bg-pink-50'
              }`}
            >
              <div className="w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center mb-3 text-white text-3xl">
                F
              </div>
              <span className="font-medium text-gray-800">Perempuan</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleStartChat}
          disabled={!selectedGender}
          className={`w-full py-3 px-4 rounded-lg transition-colors shadow-lg text-white font-medium text-lg ${
            selectedGender 
              ? 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800' 
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
  );
};

export default WelcomeScreen; 