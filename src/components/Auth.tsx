import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

const Auth: React.FC = () => {
  const { generateToken, loginWithToken, loading, error, clearError } = useUser();
  const { isDark } = useTheme();
  const [token, setToken] = useState<string>('');
  const [generatedToken, setGeneratedToken] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<boolean>(false);
  const [showTokenOnly, setShowTokenOnly] = useState<boolean>(false);

  // Handle token generation
  const handleGenerateToken = async () => {
    clearError();
    const newToken = await generateToken();
    if (newToken) {
      setGeneratedToken(newToken);
      setShowTokenOnly(true); // Menampilkan token terlebih dahulu
    }
  };
  
  // Handle login with generated token
  const handleUseGeneratedToken = async () => {
    if (!generatedToken) return;
    
    try {
      await loginWithToken(generatedToken);
    } catch (error) {
      console.error('Error logging in with generated token:', error);
    }
  };

  // Handle login with token
  const handleLoginWithToken = async () => {
    clearError();
    if (token.trim() === '') return;
    await loginWithToken(token);
  };

  // Copy token to clipboard
  const handleCopyToken = () => {
    if (!generatedToken) return;
    
    navigator.clipboard.writeText(generatedToken)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy token:', err));
  };

  return (
    <div className="p-5 sm:p-7">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Selamat Datang!</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {showTokenOnly 
            ? 'Token berhasil dibuat! Simpan token ini untuk login di lain waktu.'
            : loginMode 
              ? 'Masukkan token untuk melanjutkan' 
              : 'Buat token baru untuk mulai ngobrol'}
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      {showTokenOnly ? (
        <div className="mb-6 animate-fade-in">
          <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 rounded-lg mb-3">
            <p className="text-green-700 dark:text-green-400 text-sm font-medium mb-2">Token berhasil dibuat!</p>
            <p className="text-green-600 dark:text-green-300 text-xs">Token ini dapat digunakan untuk login di lain waktu. Simpan baik-baik!</p>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={generatedToken}
                readOnly
                className="input pr-20 font-mono text-sm bg-gray-50 dark:bg-dark-800"
              />
              <button
                onClick={handleCopyToken}
                className="absolute right-1 top-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 text-primary-700 dark:text-primary-300 text-xs rounded transition-colors"
              >
                {copied ? 'Tersalin!' : 'Salin'}
              </button>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleUseGeneratedToken}
              className="btn-primary w-full"
            >
              Gunakan Token Ini Sekarang
            </button>
            
            <button
              onClick={() => {
                setShowTokenOnly(false);
                setGeneratedToken('');
              }}
              className="btn-outline w-full"
            >
              Kembali
            </button>
          </div>
        </div>
      ) : loginMode ? (
        <div className="mb-6 animate-fade-in">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Token</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Masukkan token kamu"
            className="input mb-4"
          />
          
          <button
            onClick={handleLoginWithToken}
            disabled={loading || token.trim() === ''}
            className="btn-primary w-full flex justify-center items-center"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Login...
              </span>
            ) : 'Login dengan Token'}
          </button>
        </div>
      ) : (
        <div className="mb-6 animate-fade-in">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg mb-4">
            <div className="flex items-start">
              <div className="text-blue-500 dark:text-blue-400 mr-3 mt-1">ℹ️</div>
              <div>
                <p className="text-blue-700 dark:text-blue-300 text-sm">Wicara Fana adalah aplikasi chat anonim yang tidak memerlukan pendaftaran.</p>
                <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">Cukup buat token dan mulai ngobrol!</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleGenerateToken}
            disabled={loading}
            className="btn-primary w-full flex justify-center items-center"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </span>
            ) : 'Buat Token Baru'}
          </button>
        </div>
      )}
      
      {!showTokenOnly && (
        <div className="text-center">
          <button
            onClick={() => {
              setLoginMode(!loginMode);
              clearError();
            }}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
          >
            {loginMode ? 'Buat token baru' : 'Sudah punya token?'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Auth; 