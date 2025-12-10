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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getAuthToken());

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? 'glass-premium border-b border-white/5 py-2'
          : 'bg-transparent py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <span className="text-4xl transform group-hover:scale-110 transition-transform duration-300 inline-block filter drop-shadow-lg">🎮</span>
              <div className="absolute inset-0 bg-purple-500 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-full"></div>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight group-hover:text-purple-300 transition-colors text-glow">
              GameHub
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              if (link.requiresAuth && !isLoggedIn) return null;

              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-300 ${isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105'
                    }`}
                >
                  <span className="text-lg">{link.icon}</span>
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
                  className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all duration-300 shadow-lg shadow-purple-900/30 hover:shadow-purple-600/40 border border-white/10"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <span className="hidden sm:inline font-medium">My Account</span>
                  <span className={`text-xs transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-3 w-56 glass rounded-xl shadow-2xl border border-white/10 py-2 z-20 animate-fade-in origin-top-right">
                      <div className="px-4 py-2 border-b border-white/10 mb-1">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Menu</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-200 hover:bg-purple-600/30 hover:text-white transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span>👤</span>
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/library"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-200 hover:bg-purple-600/30 hover:text-white transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span>📚</span>
                        <span>My Collection</span>
                      </Link>
                      <div className="border-t border-white/10 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        <span>🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-purple-600/30 transition-all duration-300 hover:scale-105 hover:shadow-purple-600/50 border border-white/10"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden glass border-t border-white/5 fixed bottom-0 left-0 right-0 pb-safe">
        <div className="flex justify-around py-3">
          {navLinks.map((link) => {
            if (link.requiresAuth && !isLoggedIn) return null;

            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center px-4 py-1 rounded-lg transition-all duration-300 ${isActive
                    ? 'text-purple-400 scale-110'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                <span className="text-2xl mb-1">{link.icon}</span>
                <span className="text-[10px] font-medium tracking-wide">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
