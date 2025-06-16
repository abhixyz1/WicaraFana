import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';

const Auth: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [generatedToken, setGeneratedToken] = useState<string>('');
  const [hasStoredToken, setHasStoredToken] = useState<boolean>(false);
  const [showGeneratedToken, setShowGeneratedToken] = useState<boolean>(false);
  const { loginWithToken, generateToken, loading, error, clearError } = useUser();

  useEffect(() => {
    // Check if token exists in localStorage
    const storedToken = localStorage.getItem('wicaraFanaToken');
    if (storedToken) {
      try {
        const tokenData = JSON.parse(storedToken);
        const expiryDate = new Date(tokenData.expires);
        
        // If token is not expired, set hasStoredToken to true
        if (expiryDate > new Date()) {
          setHasStoredToken(true);
          setToken(tokenData.value);
        }
      } catch (error) {
        // Invalid token format, ignore
      }
    }
  }, []);

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginWithToken(token);
  };

  const handleGenerateToken = async () => {
    const newToken = await generateToken();
    if (newToken) {
      setGeneratedToken(newToken);
      setToken(newToken);
      setShowGeneratedToken(true);
    }
  };

  const handleUseGeneratedToken = async () => {
    if (generatedToken) {
      await loginWithToken(generatedToken);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        {showGeneratedToken ? 'Token Berhasil Dibuat!' : 'Masuk atau Buat Akun'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showGeneratedToken ? (
        // Tampilan setelah generate token
        <div>
          <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Token Anda:</p>
            <div className="p-2 bg-white rounded-lg flex items-center justify-between border border-green-100">
              <code className="text-sm font-mono text-primary-800 break-all">{generatedToken}</code>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(generatedToken)}
                className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                title="Salin ke clipboard"
              >
                📋
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Simpan token ini di tempat yang aman. Token akan kedaluwarsa dalam 7 hari.
            </p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleUseGeneratedToken}
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-medium transition-all bg-green-600 hover:bg-green-700"
            >
              Gunakan Token Ini Sekarang
            </button>
            
            <button
              onClick={() => setShowGeneratedToken(false)}
              className="w-full py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-all border border-gray-200"
            >
              Kembali
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Input Token Manual */}
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="mb-3">
              <label htmlFor="token-input" className="block text-gray-700 text-sm mb-1">Token Akses</label>
              <input
                type="text"
                id="token-input"
                value={token}
                onChange={handleTokenChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Masukkan token akses Anda"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !token}
              className={`w-full py-2 rounded-lg transition-all text-white font-medium ${
                loading || !token
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {loading ? 'Memproses...' : 'Masuk dengan Token'}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">atau</span>
            </div>
          </div>

          {/* Generate Token */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">
              Buat token baru untuk memulai. Token berlaku selama 7 hari dan dapat digunakan untuk masuk kembali.
            </p>
            <button
              onClick={handleGenerateToken}
              disabled={loading}
              className={`w-full py-3 rounded-lg transition-all text-white font-medium ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {loading ? 'Memproses...' : 'Buat Token Baru'}
            </button>
          </div>
          
          {/* Informasi Token */}
          {hasStoredToken && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Token tersimpan di perangkat ini:</p>
              <div className="p-2 bg-white rounded-lg flex items-center justify-between border border-blue-100">
                <code className="text-xs font-mono text-primary-800 break-all">{token.substring(0, 12)}...{token.substring(token.length - 8)}</code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(token)}
                  className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                  title="Salin ke clipboard"
                >
                  📋
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>
              Token digunakan untuk menyimpan sesi Anda. Tidak perlu email atau password.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth; 