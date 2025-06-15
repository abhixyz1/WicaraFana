import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types';
import { generateRandomAvatar, generateUserId } from '../utils/userUtils';

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setUserGender: (gender: 'male' | 'female') => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const setUserGender = (gender: 'male' | 'female'): void => {
    const newUser = {
      id: generateUserId(),
      gender,
      avatar: generateRandomAvatar(gender),
      isOnline: true,
    };
    setUser(newUser);
    localStorage.setItem('wicaraFanaUser', JSON.stringify(newUser));
  };

  useEffect(() => {
    // Check if user exists in local storage
    const storedUser = localStorage.getItem('wicaraFanaUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('wicaraFanaUser', JSON.stringify(user));
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, setUserGender }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 