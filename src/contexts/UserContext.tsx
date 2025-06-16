import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User } from '../types';
import { generateUserId, AVAILABLE_CHARACTERS } from '../utils/userUtils';

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setUserCharacter: (characterId: number) => void;
  loginWithToken: (token: string) => Promise<void>;
  generateToken: () => Promise<string>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  needsCharacterSelection: boolean;
}

interface TokenData {
  value: string;
  expires: string;
  userId: string;
  characterId?: number;
  avatar?: string;
  characterName?: string;
  roomId?: string;
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
  const [needsCharacterSelection, setNeedsCharacterSelection] = useState<boolean>(false);

  // Clear error message
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update token data with character information
  const updateTokenWithCharacter = useCallback((characterId: number) => {
    try {
      const storedTokenData = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedTokenData) {
        const tokenData: TokenData = JSON.parse(storedTokenData);
        const character = AVAILABLE_CHARACTERS.find(c => c.id === characterId);
        
        if (character) {
          tokenData.characterId = characterId;
          tokenData.avatar = character.avatar;
          tokenData.characterName = character.name;
          localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
        }
      }
    } catch (error) {
      console.error("Failed to update token with character", error);
    }
  }, []);

  // Update token data with room information
  const updateTokenWithRoom = useCallback((roomId: string) => {
    try {
      const storedTokenData = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedTokenData) {
        const tokenData: TokenData = JSON.parse(storedTokenData);
        tokenData.roomId = roomId;
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
      }
    } catch (error) {
      console.error("Failed to update token with room", error);
    }
  }, []);

  // Set user character
  const setUserCharacter = useCallback((characterId: number) => {
    if (user) {
      const character = AVAILABLE_CHARACTERS.find(c => c.id === characterId);
      
      if (character) {
        const newUser: User = {
          ...user,
          avatar: character.avatar,
          characterName: character.name
        };
        
        setUser(newUser);
        updateTokenWithCharacter(characterId);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        setNeedsCharacterSelection(false);
      }
    }
  }, [user, updateTokenWithCharacter]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
      setNeedsCharacterSelection(false);
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
      
      const tokenData: TokenData = {
        value: tokenValue,
        expires: expiryDate.toISOString(),
        userId
      };
      
      // Store token in localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
      
      // Simpan token dalam daftar token yang dihasilkan
      const storedTokens = localStorage.getItem('generatedTokens');
      let tokens: string[] = [];
      
      if (storedTokens) {
        tokens = JSON.parse(storedTokens);
      }
      
      tokens.push(tokenValue);
      localStorage.setItem('generatedTokens', JSON.stringify(tokens));
      
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
      
      // Validasi format token
      // Token harus berupa string hexadecimal dengan panjang 32 karakter
      const tokenRegex = /^[0-9a-f]{32}$/i;
      if (!tokenRegex.test(token)) {
        setError('Format token tidak valid. Token harus berupa 32 karakter hexadecimal.');
        setLoading(false);
        return;
      }
      
      // Check if this is a stored token
      const storedTokenData = localStorage.getItem(TOKEN_STORAGE_KEY);
      let tokenData: TokenData;
      
      if (storedTokenData) {
        tokenData = JSON.parse(storedTokenData);
        
        // If input token doesn't match stored token
        if (tokenData.value !== token) {
          // Verifikasi token dengan server (simulasi)
          // Dalam implementasi nyata, ini akan melakukan request ke server
          const isValidToken = await verifyTokenWithServer(token);
          
          if (!isValidToken) {
            setError('Token tidak terdaftar. Silakan generate token baru.');
            setLoading(false);
            return;
          }
          
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
        // Verifikasi token dengan server (simulasi)
        // Dalam implementasi nyata, ini akan melakukan request ke server
        const isValidToken = await verifyTokenWithServer(token);
        
        if (!isValidToken) {
          setError('Token tidak terdaftar. Silakan generate token baru.');
          setLoading(false);
          return;
        }
        
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
      
      // Check if character is already selected
      if (!tokenData.characterId) {
        // Create basic user without character
        const newUser: User = {
          id: tokenData.userId,
          avatar: '',
          characterName: '',
          isOnline: true
        };
        
        setUser(newUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        setNeedsCharacterSelection(true);
      } else {
        // Create user with existing character
        const newUser: User = {
          id: tokenData.userId,
          avatar: tokenData.avatar || '',
          characterName: tokenData.characterName || '',
          isOnline: true
        };
        
        setUser(newUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        setNeedsCharacterSelection(false);
      }
      
    } catch (error: any) {
      setError('Token tidak valid. Pastikan Anda memasukkan token dengan benar.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Simulasi verifikasi token dengan server
  // Dalam implementasi nyata, ini akan melakukan request ke server
  const verifyTokenWithServer = async (token: string): Promise<boolean> => {
    // Hanya token yang dihasilkan oleh aplikasi yang valid
    // Ini hanya simulasi, dalam implementasi nyata akan melakukan request ke server
    
    // Cek apakah token ada di localStorage (token yang pernah di-generate)
    const storedTokens = localStorage.getItem('generatedTokens');
    if (storedTokens) {
      const tokens = JSON.parse(storedTokens);
      return tokens.includes(token);
    }
    
    return false;
  };

  // Check token on mount
  useEffect(() => {
    const checkToken = async () => {
      setLoading(true);
      
      try {
        const storedTokenData = localStorage.getItem(TOKEN_STORAGE_KEY);
        
        if (storedTokenData) {
          const tokenData: TokenData = JSON.parse(storedTokenData);
          const expiryDate = new Date(tokenData.expires);
          
          // If token is expired, remove it
          if (expiryDate < new Date()) {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            setLoading(false);
            return;
          }
          
          // If token is valid, check if character is selected
          if (!tokenData.characterId) {
            // Create basic user without character
            const newUser: User = {
              id: tokenData.userId,
              avatar: '',
              characterName: '',
              isOnline: true
            };
            
            setUser(newUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
            setNeedsCharacterSelection(true);
          } else {
            // Create user with existing character
            const newUser: User = {
              id: tokenData.userId,
              avatar: tokenData.avatar || '',
              characterName: tokenData.characterName || '',
              isOnline: true
            };
            
            setUser(newUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
            setNeedsCharacterSelection(false);
          }
        }
      } catch (error) {
        console.error("Error checking token:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkToken();
  }, []);

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      setUserCharacter,
      loginWithToken, 
      generateToken, 
      logout, 
      loading, 
      error, 
      clearError,
      needsCharacterSelection
    }}>
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