'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, setAuthToken, RegisterRequest, LoginRequest } from '@/lib/api';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerDisplayName, setRegisterDisplayName] = useState('');
  const [registerCountry, setRegisterCountry] = useState('USA');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data: LoginRequest = {
        email: loginEmail,
        password: loginPassword,
      };

      const response = await authAPI.login(data);
      setAuthToken(response.token);
      router.push('/games');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  /* Validation Logic */
  const validations = {
    length: registerPassword.length >= 8,
    upper: /[A-Z]/.test(registerPassword),
    lower: /[a-z]/.test(registerPassword),
    number: /\d/.test(registerPassword),
    special: /[@$!%*?&]/.test(registerPassword),
  };

  const allValid = Object.values(validations).every(Boolean);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!allValid) {
      setError("Please fulfill all password requirements.");
      return;
    }

    setLoading(true);

    try {
      const data: RegisterRequest = {
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
        displayName: registerDisplayName,
        country: registerCountry,
      };

      const response = await authAPI.register(data);
      setAuthToken(response.token);
      router.push('/games');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🎮</h1>
          <h2 className="text-3xl font-bold text-white mb-2">GameHub</h2>
          <p className="text-gray-400">Your gaming community platform</p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-800 rounded-lg p-8 shadow-2xl">
          {/* Toggle Buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${isLogin
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-gray-400 hover:text-white'
                }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${!isLogin
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-gray-400 hover:text-white'
                }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500"
                  placeholder="gamer123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={registerDisplayName}
                  onChange={(e) => setRegisterDisplayName(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500"
                  placeholder="Pro Gamer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500"
                  placeholder="••••••••"
                />

                {/* Password Requirements Checklist */}
                <div className="mt-2 p-3 bg-slate-900/50 rounded-lg space-y-1">
                  <p className="text-xs font-semibold text-gray-400 mb-2">Password must contain:</p>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <ValidationItem valid={validations.length} text="8+ characters" />
                    <ValidationItem valid={validations.upper} text="Uppercase char" />
                    <ValidationItem valid={validations.lower} text="Lowercase char" />
                    <ValidationItem valid={validations.number} text="Number" />
                    <ValidationItem valid={validations.special} text="Special (@$!%*?&)" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={registerCountry}
                  onChange={(e) => setRegisterCountry(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500"
                  placeholder="USA"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-slate-900 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">Demo credentials:</p>
            <p className="text-xs text-gray-300">Email: demo@gamehub.com</p>
            <p className="text-xs text-gray-300">Password: demo123 (Update me!)</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <a
            href="/games"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Browse games without logging in →
          </a>
        </div>
      </div>
    </div>
  );
}

function ValidationItem({ valid, text }: { valid: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${valid ? 'bg-green-500 text-white' : 'bg-slate-700 text-gray-400'
        }`}>
        {valid ? '✓' : ''}
      </div>
      <span className={`text-xs ${valid ? 'text-green-400' : 'text-gray-500'}`}>
        {text}
      </span>
    </div>
  );
}

