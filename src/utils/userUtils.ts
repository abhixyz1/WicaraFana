import { v4 as uuidv4 } from 'uuid';

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
 */
export const generateRandomAvatar = (gender: 'male' | 'female'): string => {
  const colors = gender === 'male' ? maleColors : femaleColors;
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const initial = gender === 'male' ? 'M' : 'F';
  
  return `https://ui-avatars.com/api/?name=${initial}&background=${randomColor}&color=fff&size=256&bold=true`;
};

/**
 * Menghasilkan ID pengguna unik
 */
export const generateUserId = (): string => {
  return uuidv4();
}; 