"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { HambergerMenu, User, Logout, Settings, User as UserIcon } from "iconsax-react";
import Menu from "./Menu";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  // Hide header on admin and dashboard pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard")) {
    return <></>;
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);

  // Hide login button on auth pages
  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/signup") || pathname?.startsWith("/forgot-password");

  // Hide Today Market button on market page
  const isMarketPage = pathname?.startsWith("/market");

  // Login Hover States
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  const [hasLoginHovered, setHasLoginHovered] = useState(false);

  // My Page Hover States
  const [isMyPageHovered, setIsMyPageHovered] = useState(false);
  const [hasMyPageHovered, setHasMyPageHovered] = useState(false);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isAuthPage) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < 10);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isAuthPage]);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    router.push('/');
  };

  return (
    <>
      <header
        className={`${isAuthPage ? 'static pt-0 ' : 'sticky md:top-0 top-0'} z-50 w-full ${isAuthPage ? '' : 'transition-transform duration-300 ease-in-out'} ${isAuthPage || isVisible ? "translate-y-0" : "-translate-y-[150%]"}`}
      >
        <div className="pt-0 md:pt-0 max-w-8xl mx-auto px-2 sm:px-2 lg:px-4">
          <div className="flex items-center justify-between h-22 sm:h-24">

            {/* Logo */}
            <div className="px-4 flex items-center space-x-4 flex-shrink-0 cursor-pointer">
              <span className="text-3xl font-black text-[#1a1a1a] tracking-tighter">Agri</span>
              <span className="text-xs font-bold text-gray-500 tracking-widest pt-1">RECRUIT</span>
            </div>

            <div className="px-2 flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-3">

                {/* MY PAGE BUTTON */}
                {!isMarketPage && (
                  <div className="relative">
                    {/* Confetti Top Left */}
                    <svg className={`absolute -top-6 -left-6 w-14 h-14 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 ${isMyPageHovered ? 'opacity-100 scale-100 translate-x-0 translate-y-0' : 'opacity-0 scale-50 translate-x-4 translate-y-4'}`} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="14" cy="14" r="3.5" fill="#f65c72" />
                      <rect x="30" y="12" width="2.5" height="2.5" transform="rotate(45 30 12)" fill="#4facfe" />
                      <path d="M40 17 l3 -3 l3 3 l-3 3 z" fill="#4facfe" />
                      <path d="M17 30 l3.5 -3.5 l3.5 3.5 l-3.5 3.5 z" fill="#f65c72" />
                      <rect x="10" y="38" width="4.5" height="4.5" transform="rotate(15 10 38)" fill="#84cc16" />
                      <circle cx="22" cy="44" r="2" fill="#84cc16" />
                    </svg>

                    {/* Confetti Bottom Right */}
                    <svg className={`absolute -bottom-6 -right-6 w-14 h-14 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 ${isMyPageHovered ? 'opacity-100 scale-100 translate-x-0 translate-y-0' : 'opacity-0 scale-50 -translate-x-4 -translate-y-4'}`} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="36" cy="36" r="3.5" fill="#f65c72" />
                      <rect x="20" y="38" width="2.5" height="2.5" transform="rotate(45 20 38)" fill="#4facfe" />
                      <path d="M10 33 l3 -3 l3 3 l-3 3 z" fill="#4facfe" />
                      <path d="M33 20 l3.5 -3.5 l3.5 3.5 l-3.5 3.5 z" fill="#f65c72" />
                      <rect x="40" y="12" width="4.5" height="4.5" transform="rotate(15 40 12)" fill="#84cc16" />
                      <circle cx="28" cy="6" r="2" fill="#84cc16" />
                    </svg>
                    <Link
                      href="/markets/dambulla"
                      onMouseEnter={() => { setIsMyPageHovered(true); setHasMyPageHovered(true); }}
                      onMouseLeave={() => setIsMyPageHovered(false)}
                      className="relative flex items-center bg-white px-6 py-3.5 rounded-full transition-colors duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 overflow-hidden z-10 select-none"
                    >
                      {/* BASE TEXT (Always True Black, Hidden dynamically by the expanding layer) */}
                      <span className={`text-[13px] font-black tracking-wider relative z-10 transition-opacity duration-300 ${isMyPageHovered ? 'opacity-0' : 'opacity-100'}`} style={{ color: '#1a1a1a' }}>
                        TODAY MARKET
                      </span>

                      {/* ANIMATION & WHITE TEXT CONTAINER */}
                      <div className="absolute inset-0 pointer-events-none flex items-center px-6 z-20 overflow-hidden rounded-full">
                        {/* Expanding background bubble */}
                        <div
                          className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full origin-center left-[calc(100%-2rem)]"
                          style={{
                            animation: isMyPageHovered
                              ? "bubblePop 0.6s ease-in-out forwards"
                              : hasMyPageHovered
                                ? "bubbleUnpop 0.6s ease-in-out forwards"
                                : "none"
                          }}
                        />

                        {/* PURE WHITE TEXT (Fades in exactly over the red bubble) */}
                        <span className={`text-[13px] font-black tracking-wider absolute left-6 z-30 text-white transition-opacity duration-300 ${isMyPageHovered ? 'opacity-100 delay-75' : 'opacity-0'}`}>
                          TODAY MARKET
                        </span>
                      </div>

                      {/* Hover Arrow Wrapper */}
                      <div className="relative z-30 flex items-center justify-center w-4 h-4 ml-3">
                        <svg className={`absolute w-3.5 h-3.5 text-white transition-opacity duration-300 ${isMyPageHovered ? 'opacity-100 delay-100' : 'opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 15c0-2.5 1.5-4 4-4h4.5m0 0l-2.5-2.5M16.5 11l-2.5 2.5" />
                        </svg>
                      </div>
                    </Link>
                  </div>
                )}

                {/* LOGIN OR USER PROFILE CONDITIONAL */}
                {isLoggedIn ? (
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center justify-center w-[52px] h-[52px] bg-white rounded-full shadow-sm text-[#1a1a1a] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-black/20"
                      aria-label="User Profile"
                    >
                      <User size="24" color="currentColor" variant="Bold" />
                    </button>

                    {/* Profile Dropdown */}
                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                        >
                          {/* User Info Header */}
                          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <h3 className="font-semibold text-[#1a1a1a]">{user?.name || 'User'}</h3>
                                <p className="text-sm text-gray-500">{user?.email || ''}</p>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="p-2">
                            <Link
                              href="/dashboard"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 hover:text-emerald-600"
                            >
                              <UserIcon size={20} variant="Bold" />
                              <span className="font-medium">Dashboard</span>
                            </Link>

                            <Link
                              href="/dashboard"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 hover:text-emerald-600"
                            >
                              <Settings size={20} variant="Bold" />
                              <span className="font-medium">Settings</span>
                            </Link>

                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-gray-700 hover:text-red-600 mt-1"
                            >
                              <Logout size={20} variant="Bold" />
                              <span className="font-medium">Sign Out</span>
                            </button>
                          </div>

                          {/* Footer */}
                          <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500 text-center">
                              Agri Recruit v1.0
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : !isAuthPage && (
                  <div className="relative">
                    {/* Confetti Top Left */}
                    <svg className={`absolute -top-6 -left-6 w-14 h-14 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 ${isLoginHovered ? 'opacity-100 scale-100 translate-x-0 translate-y-0' : 'opacity-0 scale-50 translate-x-4 translate-y-4'}`} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="14" cy="14" r="3.5" fill="#f65c72" />
                      <rect x="30" y="12" width="2.5" height="2.5" transform="rotate(45 30 12)" fill="#4facfe" />
                      <path d="M40 17 l3 -3 l3 3 l-3 3 z" fill="#4facfe" />
                      <path d="M17 30 l3.5 -3.5 l3.5 3.5 l-3.5 3.5 z" fill="#f65c72" />
                      <rect x="10" y="38" width="4.5" height="4.5" transform="rotate(15 10 38)" fill="#84cc16" />
                      <circle cx="22" cy="44" r="2" fill="#84cc16" />
                    </svg>

                    {/* Confetti Bottom Right */}
                    <svg className={`absolute -bottom-6 -right-6 w-14 h-14 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 ${isLoginHovered ? 'opacity-100 scale-100 translate-x-0 translate-y-0' : 'opacity-0 scale-50 -translate-x-4 -translate-y-4'}`} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="36" cy="36" r="3.5" fill="#f65c72" />
                      <rect x="20" y="38" width="2.5" height="2.5" transform="rotate(45 20 38)" fill="#4facfe" />
                      <path d="M10 33 l3 -3 l3 3 l-3 3 z" fill="#4facfe" />
                      <path d="M33 20 l3.5 -3.5 l3.5 3.5 l-3.5 3.5 z" fill="#f65c72" />
                      <rect x="40" y="12" width="4.5" height="4.5" transform="rotate(15 40 12)" fill="#84cc16" />
                      <circle cx="28" cy="6" r="2" fill="#84cc16" />
                    </svg>

                    <Link
                      href="/login"
                      onMouseEnter={() => { setIsLoginHovered(true); setHasLoginHovered(true); }}
                      onMouseLeave={() => setIsLoginHovered(false)}
                      className="relative flex items-center bg-white px-6 py-3.5 rounded-full transition-colors duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 overflow-hidden z-10 select-none"
                    >
                      {/* BASE TEXT (Always True Black) */}
                      <span className={`text-[13px] font-black tracking-wider relative z-10 transition-opacity duration-300 ${isLoginHovered ? 'opacity-0' : 'opacity-100'}`} style={{ color: '#1a1a1a' }}>
                        LOGIN
                      </span>

                      {/* ANIMATION & WHITE TEXT CONTAINER */}
                      <div className="absolute inset-0 pointer-events-none flex items-center px-6 z-20 overflow-hidden rounded-full">
                        {/* Expanding background bubble */}
                        <div
                          className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full origin-center left-[calc(100%-2rem)]"
                          style={{
                            animation: isLoginHovered
                              ? "bubblePop 0.6s ease-in-out forwards"
                              : hasLoginHovered
                                ? "bubbleUnpop 0.6s ease-in-out forwards"
                                : "none"
                          }}
                        />

                        {/* PURE WHITE TEXT (Fades in exactly over the red bubble) */}
                        <span className={`text-[13px] font-black tracking-wider absolute left-6 z-30 text-white transition-opacity duration-300 ${isLoginHovered ? 'opacity-100 delay-75' : 'opacity-0'}`}>
                          LOGIN
                        </span>
                      </div>

                      {/* Hover Arrow Wrapper */}
                      <div className="relative z-30 flex items-center justify-center w-4 h-4 ml-3">
                        <svg className={`absolute w-3.5 h-3.5 text-white transition-opacity duration-300 ${isLoginHovered ? 'opacity-100 delay-100' : 'opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 15c0-2.5 1.5-4 4-4h4.5m0 0l-2.5-2.5M16.5 11l-2.5 2.5" />
                        </svg>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Hamburger Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="group relative flex items-center justify-center w-[52px] h-[52px] rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 ml-2"
                aria-label="Open menu"
              >
                <div className="menu-box absolute inset-0 bg-[#2d2d2d] group-hover:bg-[#1a1a1a] rounded-2xl group-hover:shadow-lg transition-colors z-0"></div>
                <div className="relative z-10">
                  <HambergerMenu size="28" color="white" />
                </div>
              </button>

            </div>
          </div>
        </div>
      </header>

      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}