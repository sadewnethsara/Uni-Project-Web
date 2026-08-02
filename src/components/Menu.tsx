"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Menu({ isOpen, onClose }: MenuProps) {
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [hasCloseHovered, setHasCloseHovered] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const menuItems = [
    { title: "Dashboard", subtitle: "Market Analytics", href: "/dashboard" },
    { title: "Analytics", subtitle: "Market analytics & insights", href: "/analytics" },
    { title: "Admin", subtitle: "Price management panel", href: "/admin" },
    { title: "Market", subtitle: "Today's market prices", href: "/markets/dambulla" },
    { title: "FAQ", subtitle: "Help Center", href: "/faq" },
    { title: "Contact", subtitle: "Get in touch", href: "/contact" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-black"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: ["-100%", "0%", "-4%", "0%"] }}
            exit={{ y: "-100%" }}
            transition={{
              duration: 0.4,
              times: [0, 0.6, 0.8, 1],
              ease: ["easeIn", "easeOut", "easeInOut"]
            }}
            className="fixed top-0 left-0 right-0 z-80 bg-[#2b2b2b] md:rounded-b-[50px] rounded-b-[20px] shadow-2xl overflow-hidden sm:overflow-y-auto h-[90dvh] sm:h-auto sm:max-h-[100vh] sm:min-h-[85vh] lg:min-h-[80vh] flex items-start lg:items-center justify-center pt-20 sm:pt-28 pb-8 sm:pb-20"
          >
            {/* Top Left Logo — matches header */}
            <div className="absolute top-5 left-6 sm:top-10 sm:left-8 flex items-center space-x-4">
              <span className="text-3xl font-black text-white tracking-tighter">Agri</span>
              <span className="text-xs font-bold text-white/60 tracking-widest pt-1">RECRUIT</span>
            </div>

            {/* Close Button - matches hamburger button style */}
            <div className="absolute top-5 right-4 sm:top-10 sm:right-8">
              <button
                onClick={onClose}
                className="group relative flex items-center justify-center w-[52px] h-[52px] rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                aria-label="Close menu"
              >
                <div className="absolute inset-0 bg-[#fdf6e3] group-hover:bg-[#f0e8d5] rounded-2xl transition-colors z-0"></div>
                <div className="text-[#1a1a1a] relative z-10">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-6xl flex flex-col lg:flex-row justify-center items-start gap-8 lg:gap-12 w-full">

              {/* Left Side - Links Grid with Refined Space Alignment */}
              <div className="grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-2 w-full lg:w-auto">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href || "#"}
                    onClick={item.href ? onClose : undefined}
                    className="group flex items-center cursor-pointer py-0 pl-4 sm:pl-12 pr-2 sm:pr-6 h-[70px] sm:h-[100px] rounded-[1rem] hover:bg-[#383838] transition-colors duration-300 w-full sm:min-w-[300px] relative select-none"
                  >
                    {/* Fixed space layout indicator dot */}
                    <div className="hidden sm:flex absolute left-5 w-4 h-4 items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-[#f65c72] rounded-full opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
                    </div>

                    {/* Text Container with tightly adjusted text leading pairs */}
                    <div className="flex flex-col justify-center">
                      <span className="text-[1.1rem] sm:text-[2.3rem] font-semibold text-white leading-none tracking-wide">
                        {item.title}
                      </span>
                      <span className="text-[9px] sm:text-[11px] font-medium text-white/80 mt-1 sm:mt-1.5 tracking-wide">
                        {item.subtitle}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Right Side - Balanced Buttons */}
              <div className="flex flex-col gap-4 w-full max-w-[380px]">
                {/* Market Button */}
                <Link
                  href="/markets/dambulla"
                  onClick={onClose}
                  className="w-full bg-[#f65c72] hover:bg-[#e04f63] transition-colors rounded-[1rem] py-3 sm:p-6 flex flex-col items-center justify-center relative group shadow-lg"
                >
                  <span className="text-sm sm:text-lg font-bold text-white tracking-wider">TODAY MARKET</span>
                  <span className="hidden sm:block text-[10px] font-medium text-white/90 mt-0.5">Today's market prices</span>
                  <div className="mt-3 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="#f65c72" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </Link>



                {/* Login & Signup Buttons */}
                <div className="flex gap-2 sm:gap-4">
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="flex-1 bg-[#f65c72] hover:bg-[#e04f63] transition-colors rounded-[1rem] py-3 sm:p-6 flex flex-col items-center justify-center group shadow-lg"
                  >
                    <span className="text-sm sm:text-lg font-bold text-white tracking-wider">LOGIN</span>
                    <span className="hidden sm:block text-[10px] font-medium text-white/90 mt-0.5">Sign In</span>
                    <div className="mt-3 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="#f65c72" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </Link>
                  <Link
                    href="/signup"
                    onClick={onClose}
                    className="flex-1 bg-[#f65c72] hover:bg-[#e04f63] transition-colors rounded-[1rem] py-3 sm:p-6 flex flex-col items-center justify-center group shadow-lg"
                  >
                    <span className="text-sm sm:text-lg font-bold text-white tracking-wider">SIGNUP</span>
                    <span className="hidden sm:block text-[10px] font-medium text-white/90 mt-0.5">Create Account</span>
                    <div className="mt-3 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="#f65c72" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </Link>
                </div>

                {/* Social Buttons */}
                <div className="flex flex-row gap-2 sm:gap-4 mt-1">
                  <button className="flex-1 bg-[#3a3a3a] hover:bg-[#444] transition-colors rounded-2xl py-3.5 px-6 flex items-center justify-between text-white group">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-md">𝕏</span>
                      <span className="text-[14px] font-bold text-gray-200">(Twitter)</span>
                    </div>
                    <div className="w-1 h-1 bg-[#f65c72] rounded-full"></div>
                  </button>
                  <button className="flex-1 bg-[#3a3a3a] hover:bg-[#444] transition-colors rounded-2xl py-3.5 px-6 flex items-center justify-between text-white group">
                    <div className="flex items-center gap-2">
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.6826 1.54714C13.5218 0.947239 13.0531 0.478443 12.4532 0.317424C11.3703 0 6.99981 0 6.99981 0C6.99981 0 2.62933 0 1.54641 0.317424C0.946513 0.478443 0.477717 0.947239 0.316697 1.54714C0 2.63007 0 4.9189 0 4.9189C0 4.9189 0 7.20774 0.316697 8.29066C0.477717 8.89056 0.946513 9.35936 1.54641 9.52038C2.62933 9.8378 6.99981 9.8378 6.99981 9.8378C6.99981 9.8378 11.3703 9.8378 12.4532 9.52038C13.0531 9.35936 13.5218 8.89056 13.6826 8.29066C13.9994 7.20774 13.9994 4.9189 13.9994 4.9189C13.9994 4.9189 13.9994 2.63007 13.6826 1.54714ZM5.59985 7.02641V2.81139L9.23976 4.9189L5.59985 7.02641Z" />
                      </svg>
                      <span className="text-[14px] font-bold text-gray-200">YouTube</span>
                    </div>
                    <div className="w-1 h-1 bg-[#f65c72] rounded-full"></div>
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}