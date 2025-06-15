import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';

const Auth: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [generatedToken, setGeneratedToken] = useState<string>('');
  const [hasStoredToken, setHasStoredToken] = useState<boolean>(false);
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
    setGeneratedToken(newToken);
    setToken(newToken);
    setHasStoredToken(true);
  };

  return (
    <div className="bg-white bg-opacity-95 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full border border-primary-100">
      <div className="text-center mb-8">
        <div className="inline-block relative">
          <h1 className="text-5xl font-bold text-primary-800 mb-3 relative z-10">Wicara Fana</h1>
          <div className="absolute -bottom-3 left-0 right-0 h-3 bg-primary-300 opacity-50 rounded-full"></div>
        </div>
        <p className="text-gray-600 mt-4">
          {hasStoredToken ? 'Masuk dengan token yang tersimpan' : 'Dapatkan token untuk memulai chat'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Input Token Manual */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="token-input" className="block text-gray-700 mb-2">Masukkan Token</label>
          <input
            type="text"
            id="token-input"
            value={token}
            onChange={handleTokenChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Masukkan token akses Anda"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !token}
          className={`w-full py-4 px-6 rounded-xl transition-all text-white font-medium text-lg ${
            loading || !token
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 shadow-lg hover:shadow-xl shadow-primary-200/50 transform hover:-translate-y-1'
          }`}
        >
          {loading ? 'Memproses...' : 'Masuk dengan Token'}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">atau</span>
        </div>
      </div>

      {/* Generate Token */}
      <div className="p-4 border border-gray-200 rounded-lg mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Dapatkan Token Baru</h3>
        <p className="text-sm text-gray-600 mb-3">
          Token berlaku selama 7 hari dan dapat digunakan untuk masuk tanpa perlu login ulang.
        </p>
        <button
          onClick={handleGenerateToken}
          disabled={loading}
          className={`w-full py-4 px-6 rounded-xl transition-all text-white font-medium text-lg ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 shadow-lg hover:shadow-xl shadow-primary-200/50 transform hover:-translate-y-1'
          }`}
        >
          {loading ? 'Memproses...' : 'Generate Token Baru'}
        </button>
      </div>
      
      {/* Tampilkan Token yang Digenerate */}
      {generatedToken && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Token Berhasil Dibuat!</h4>
          <p className="text-sm text-gray-600 mb-2">Token Anda:</p>
          <div className="p-3 bg-white rounded-lg flex items-center justify-between border border-green-200">
            <code className="text-sm font-mono text-primary-800 break-all">{generatedToken}</code>
            <button
              onClick={() => navigator.clipboard.writeText(generatedToken)}
              className="ml-2 p-2 text-gray-500 hover:text-gray-700"
              title="Salin ke clipboard"
            >
              📋
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Simpan token ini di tempat yang aman. Token akan kedaluwarsa dalam 7 hari.
          </p>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-4 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
          >
            Gunakan Token Ini Sekarang
          </button>
        </div>
      )}

      {/* Informasi Token */}
      {hasStoredToken && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Token Tersimpan</h4>
          <p className="text-sm text-gray-600 mb-2">Token Anda saat ini:</p>
          <div className="p-3 bg-white rounded-lg flex items-center justify-between border border-blue-200">
            <code className="text-sm font-mono text-primary-800 break-all">{token}</code>
            <button
              onClick={() => navigator.clipboard.writeText(token)}
              className="ml-2 p-2 text-gray-500 hover:text-gray-700"
              title="Salin ke clipboard"
            >
              📋
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 text-center text-xs text-gray-500">
        <p>
          Token digunakan untuk menyimpan sesi Anda. Tidak perlu email atau password.
        </p>
      </div>
    </div>
  );
};

export default Auth; 