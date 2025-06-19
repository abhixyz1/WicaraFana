import React, { useState } from 'react';
import { AVAILABLE_CHARACTERS } from '../utils/userUtils';
import { useTheme } from '../contexts/ThemeContext';

interface CharacterSelectionProps {
  onSelectCharacter: (characterId: number) => void;
}

const CharacterSelection: React.FC<CharacterSelectionProps> = ({ onSelectCharacter }) => {
  const { isDark } = useTheme();
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  const handleSelectCharacter = (characterId: number) => {
    setSelectedCharacterId(characterId);
  };

  const handleConfirmSelection = () => {
    if (selectedCharacterId === null) return;
    
    setIsSelecting(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      onSelectCharacter(selectedCharacterId);
      setIsSelecting(false);
    }, 500);
  };

  return (
    <div className="p-5 sm:p-7">
      <div className="text-center mb-5">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Pilih Karakter</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Pilih karakter yang akan mewakili kamu dalam chat
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {AVAILABLE_CHARACTERS.map(character => (
          <div
            key={character.id}
            className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform ${
              selectedCharacterId === character.id 
                ? 'ring-4 ring-primary-500 dark:ring-primary-600 scale-[1.05]' 
                : 'hover:scale-[1.02] hover:shadow-md'
            }`}
            onClick={() => handleSelectCharacter(character.id)}
          >
            <div className="aspect-square overflow-hidden">
              <img 
                src={character.avatar} 
                alt={character.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className={`absolute inset-0 flex items-end justify-center p-2 ${
              selectedCharacterId === character.id
                ? 'bg-gradient-to-t from-primary-900/80 to-transparent'
                : 'bg-gradient-to-t from-black/60 to-transparent'
            }`}>
              <span className={`text-white text-sm font-medium ${
                selectedCharacterId === character.id ? 'text-shadow' : ''
              }`}>
                {character.name}
              </span>
            </div>
            
            {selectedCharacterId === character.id && (
              <div className="absolute top-2 right-2 bg-primary-500 dark:bg-primary-600 rounded-full p-1 shadow-lg animate-scale-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <button
        onClick={handleConfirmSelection}
        disabled={selectedCharacterId === null || isSelecting}
        className={`btn-primary w-full ${
          selectedCharacterId === null ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isSelecting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Memilih Karakter...
          </span>
        ) : (
          selectedCharacterId === null 
            ? 'Pilih karakter terlebih dahulu' 
            : `Pilih ${AVAILABLE_CHARACTERS.find(c => c.id === selectedCharacterId)?.name}`
        )}
      </button>
      
      <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>Karakter hanya digunakan sebagai identitas visual dalam chat</p>
      </div>
    </div>
  );
};

export default CharacterSelection; 