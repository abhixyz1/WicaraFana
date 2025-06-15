import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User } from '../types';
import { generateRandomAvatar, generateUserId } from '../utils/userUtils';

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setUserGender: (gender: 'male' | 'female') => void;
  loginWithToken: (token: string) => Promise<void>;
  generateToken: () => Promise<string>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Token storage key
const TOKEN_STORAGE_KEY = 'wicaraFanaToken';
const USER_STORAGE_KEY = 'wicaraFanaUser';

// Token expiry in days
const TOKEN_EXPIRY_DAYS = 7;

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error message
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Memoize functions to prevent unnecessary re-renders
  const setUserGender = useCallback((gender: 'male' | 'female'): void => {
    if (user) {
      const newUser = {
        ...user,
        gender,
        avatar: generateRandomAvatar(gender),
      };
      setUser(newUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    }
  }, [user]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
    } catch (error: any) {
      setError(error.message);
    }
  }, []);

  // Generate a random token with expiry date
  const generateToken = useCallback(async (): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate a random string for the token - using more efficient method
      let tokenValue;
      try {
        tokenValue = crypto.randomUUID().replace(/-/g, '');
      } catch (e) {
        // Fallback for browsers that don't support randomUUID
        const randomBytes = new Uint8Array(16);
        window.crypto.getRandomValues(randomBytes);
        tokenValue = Array.from(randomBytes)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      }
      
      // Set expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + TOKEN_EXPIRY_DAYS);
      
      const userId = generateUserId();
      
      const tokenData = {
        value: tokenValue,
        expires: expiryDate.toISOString(),
        userId
      };
      
      // Store token in localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
      
      // Create user from token
      const newUser = {
        id: userId,
        gender: 'male' as 'male' | 'female', // Default to male, will be updated when user selects gender
        avatar: '',
        isOnline: true
      };
      
      setUser(newUser);
      
      return tokenValue;
    } catch (error: any) {
      setError(error.message);
      return '';
    } finally {
      setLoading(false);
    }
  }, []);

  // Login with token
  const loginWithToken = useCallback(async (token: string): Promise<void> => {
    if (!token || token.trim() === '') {
      setError('Token tidak boleh kosong.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Check if this is a stored token
      const storedTokenData = localStorage.getItem(TOKEN_STORAGE_KEY);
      let tokenData;
      
      if (storedTokenData) {
        tokenData = JSON.parse(storedTokenData);
        
        // If input token doesn't match stored token
        if (tokenData.value !== token) {
          // This is a new token, store it
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + TOKEN_EXPIRY_DAYS);
          
          tokenData = {
            value: token,
            expires: expiryDate.toISOString(),
            userId: generateUserId()
          };
          
          localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
        }
      } else {
        // No stored token, create new token data
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + TOKEN_EXPIRY_DAYS);
        
        tokenData = {
          value: token,
          expires: expiryDate.toISOString(),
          userId: generateUserId()
        };
        
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
      }
      
      // Check if token is expired
      const expiryDate = new Date(tokenData.expires);
      if (expiryDate < new Date()) {
        setError('Token sudah kedaluwarsa. Silakan generate token baru.');
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        return;
      }
      
      // Create user from token
      const userId = tokenData.userId;
      
      // Check if user profile exists in localStorage
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Create a basic user until gender is selected
        const newUser = {
          id: userId,
          gender: 'male' as 'male' | 'female',
          avatar: '',
          isOnline: true
        };
        setUser(newUser);
      }
      
    } catch (error: any) {
      setError('Token tidak valid. Pastikan Anda memasukkan token dengan benar.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check token on mount
  useEffect(() => {
    const checkToken = async () => {
      setLoading(true);
      
      try {
        const storedTokenData = localStorage.getItem(TOKEN_STORAGE_KEY);
        
        if (storedTokenData) {
          const tokenData = JSON.parse(storedTokenData);
          const expiryDate = new Date(tokenData.expires);
          
          // If token is expired, remove it
          if (expiryDate < new Date()) {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            setLoading(false);
            return;
          }
          
          // If token is valid, check for user data
          const userId = tokenData.userId;
          
          // Check if user profile exists in localStorage
          const storedUser = localStorage.getItem(USER_STORAGE_KEY);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            // Create a basic user until gender is selected
            const newUser = {
              id: userId,
              gender: 'male' as 'male' | 'female',
              avatar: '',
              isOnline: true
            };
            setUser(newUser);
          }
        }
      } catch (error) {
        // If there's an error parsing, remove the token
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({ 
    user, 
    setUser, 
    setUserGender, 
    loginWithToken,
    generateToken,
    logout,
    loading,
    error,
    clearError
  }), [user, setUserGender, loginWithToken, generateToken, logout, loading, error, clearError]);

  return (
    <UserContext.Provider value={contextValue}>
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