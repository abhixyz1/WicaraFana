import { v4 as uuidv4 } from 'uuid';
import image1 from '../assets/avatars/image1.png';
import image2 from '../assets/avatars/image2.png';
import image3 from '../assets/avatars/image3.png';
import image4 from '../assets/avatars/image4.png';
import image5 from '../assets/avatars/image5.png';

// Definisi karakter yang tersedia
export const AVAILABLE_CHARACTERS = [
  {
    id: 1,
    name: "Tung Tung Tung Sahur",
    avatar: image1,
    gender: 'male' as const
  },
  {
    id: 2,
    name: "Brr Brr Patapim",
    avatar: image2,
    gender: 'male' as const
  },
  {
    id: 3,
    name: "Chimpanzini Bananini",
    avatar: image3,
    gender: 'male' as const
  },
  {
    id: 4,
    name: "Ballerina Cappucina",
    avatar: image4,
    gender: 'female' as const
  },
  {
    id: 5,
    name: "Capuccino Assassino",
    avatar: image5,
    gender: 'female' as const
  }
];

const adjectives = [
  'Happy', 'Sleepy', 'Grumpy', 'Sneezy', 'Dopey', 'Bashful', 'Doc',
  'Brave', 'Clever', 'Gentle', 'Honest', 'Jolly', 'Kind', 'Lively',
  'Proud', 'Silly', 'Witty', 'Zealous', 'Calm', 'Eager'
];

const nouns = [
  'Panda', 'Tiger', 'Lion', 'Eagle', 'Dolphin', 'Penguin', 'Koala',
  'Fox', 'Wolf', 'Bear', 'Rabbit', 'Owl', 'Elephant', 'Giraffe',
  'Monkey', 'Zebra', 'Kangaroo', 'Raccoon', 'Turtle', 'Hedgehog'
];

// Warna untuk avatar laki-laki dan perempuan
const maleColors = ['blue', 'teal', 'indigo', 'cyan', 'sky', 'navy'];
const femaleColors = ['pink', 'rose', 'fuchsia', 'purple', 'violet', 'magenta'];

export const generateRandomNickname = (): string => {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  
  return `${randomAdjective}${randomNoun}${randomNumber}`;
};

/**
 * Menghasilkan avatar berdasarkan gender
 * @deprecated Gunakan karakter yang tersedia di AVAILABLE_CHARACTERS
 */
export const generateRandomAvatar = (gender: 'male' | 'female'): string => {
  const colors = gender === 'male' ? maleColors : femaleColors;
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const initial = gender === 'male' ? 'M' : 'F';
  
  return `https://ui-avatars.com/api/?name=${initial}&background=${randomColor}&color=fff&size=256&bold=true`;
};

/**
 * Mendapatkan karakter secara acak
 */
export const getRandomCharacter = () => {
  const randomIndex = Math.floor(Math.random() * AVAILABLE_CHARACTERS.length);
  return AVAILABLE_CHARACTERS[randomIndex];
};

/**
 * Menghasilkan ID pengguna unik
 */
export const generateUserId = (): string => {
  return uuidv4();
}; 