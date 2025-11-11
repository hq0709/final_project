'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getAuthToken, removeAuthToken } from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getAuthToken());
  }, [pathname]);

  const handleLogout = () => {
    removeAuthToken();
    setIsLoggedIn(false);
    setShowUserMenu(false);
    router.push('/games');
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/games', label: 'Games', icon: '🎮' },
    { href: '/library', label: 'My Collection', icon: '📚', requiresAuth: true },
  ];

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-purple-500/30 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-3xl group-hover:scale-110 transition-transform">🎮</span>
            <span className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
              GameHub
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              if (link.requiresAuth && !isLoggedIn) return null;
              
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'text-gray-300 hover:bg-purple-800/50 hover:text-white'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                >
                  <span className="text-xl">👤</span>
                  <span className="hidden sm:inline">My Account</span>
                  <span className="text-xs">▼</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-purple-500/30 py-2">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-gray-300 hover:bg-purple-600 hover:text-white transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      👤 Profile
                    </Link>
                    <Link
                      href="/library"
                      className="block px-4 py-2 text-gray-300 hover:bg-purple-600 hover:text-white transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      📚 My Collection
                    </Link>
                    <div className="border-t border-gray-700 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg shadow-purple-500/50 transition-all hover:scale-105"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-purple-500/30">
        <div className="flex justify-around py-2">
          {navLinks.map((link) => {
            if (link.requiresAuth && !isLoggedIn) return null;
            
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'text-purple-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-2xl">{link.icon}</span>
                <span className="text-xs mt-1">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

