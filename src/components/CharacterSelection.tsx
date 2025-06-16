import React, { useState } from 'react';
import { AVAILABLE_CHARACTERS } from '../utils/userUtils';

interface CharacterSelectionProps {
  onSelectCharacter: (characterId: number) => void;
}

const CharacterSelection: React.FC<CharacterSelectionProps> = ({ onSelectCharacter }) => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);

  const handleSelectCharacter = (characterId: number) => {
    setSelectedCharacterId(characterId);
  };

  const handleConfirm = () => {
    if (selectedCharacterId !== null) {
      onSelectCharacter(selectedCharacterId);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 text-center">
        Pilih Karakter Anda
      </h2>
      
      <div className="mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
          Pilih karakter yang akan mewakili Anda dalam chat. Karakter ini akan terlihat oleh pengguna lain.
        </p>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
          {AVAILABLE_CHARACTERS.map(character => (
            <div
              key={character.id}
              className={`border rounded-lg p-2 sm:p-3 cursor-pointer transition-all ${
                selectedCharacterId === character.id
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
              onClick={() => handleSelectCharacter(character.id)}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 sm:w-24 sm:h-24 mb-1 sm:mb-2 overflow-hidden rounded-full border-2 border-gray-200">
                  <img 
                    src={character.avatar} 
                    alt={character.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-xs sm:text-sm text-center">{character.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button
        onClick={handleConfirm}
        disabled={selectedCharacterId === null}
        className={`w-full py-2 sm:py-3 rounded-lg transition-all text-white font-medium ${
          selectedCharacterId === null
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-primary-600 hover:bg-primary-700'
        }`}
      >
        Pilih Karakter Ini
      </button>
    </div>
  );
};

export default CharacterSelection; 