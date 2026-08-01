"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Menu({ isOpen, onClose }: MenuProps) {
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [hasCloseHovered, setHasCloseHovered] = useState(false);

  const menuItems = [
    { title: "Analytics", subtitle: "Market analytics & insights", href: "/analyze" },
    { title: "Admin", subtitle: "Price management panel", href: "/admin" },
    { title: "Market", subtitle: "Today's market prices", href: "/market/dambulla" },
    { title: "Weather", subtitle: "Weather & climate data", href: "/weather" },
    { title: "Fuel Prices", subtitle: "Fuel & logistics costs", href: "/fuel-prices" },
    { title: "Predictions", subtitle: "AI-powered forecasts", href: "/predictions" },
    { title: "Demand", subtitle: "Demand analysis", href: "/demand" },
    { title: "Job", subtitle: "Learn about work" },
    { title: "Topics", subtitle: "Topics" },
    { title: "People", subtitle: "To know people" },
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
            className="fixed top-0 left-0 right-0 z-80 bg-[#2b2b2b] rounded-b-[50px] shadow-2xl overflow-hidden min-h-[85vh] lg:min-h-[80vh] flex items-center justify-center pt-28 pb-20"
          >
            {/* Top Left Logo — matches header */}
            <div className="absolute top-10 left-8 flex items-center space-x-3">
              <span className="text-3xl font-black text-white tracking-tighter">Agri</span>
              <span className="text-[10px] font-bold text-white/60 tracking-widest pt-0.5">RECRUIT</span>
            </div>

            {/* Close Button - Hover state logic remains exactly unchanged */}
            <div className="absolute top-10 right-8">
              <button
                onClick={onClose}
                onMouseEnter={() => { setIsCloseHovered(true); setHasCloseHovered(true); }}
                onMouseLeave={() => setIsCloseHovered(false)}
                className="group relative flex items-center justify-center w-[52px] h-[52px] rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 ml-2"
                aria-label="Close menu"
              >
                {/* Bouncing background box */}
                <div className="menu-box absolute inset-0 bg-[#2d2d2d] group-hover:bg-[#1a1a1a] rounded-2xl group-hover:shadow-lg transition-colors z-0"></div>
                {/* Static icon */}
                <div className={`text-white transition-none ${isCloseHovered ? 'animate-[closeIconGrow_0.4s_ease-in-out_forwards]' : (hasCloseHovered ? 'animate-[closeIconShrink_0.25s_ease-in_forwards]' : '')}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
            </div>

            <div className="container mx-auto px-6 lg:px-16 max-w-6xl flex flex-col lg:flex-row justify-center items-start gap-12 lg:gap-12 w-full">

              {/* Left Side - Links Grid with Refined Space Alignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 w-full lg:w-auto">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href || "#"}
                    onClick={item.href ? onClose : undefined}
                    className="group flex items-center cursor-pointer py-0 pl-12 pr-6 h-[100px] rounded-[1rem] hover:bg-[#383838] transition-colors duration-300 min-w-[300px] relative select-none"
                  >
                    {/* Fixed space layout indicator dot */}
                    <div className="absolute left-5 w-4 h-4 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-[#f65c72] rounded-full opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
                    </div>

                    {/* Text Container with tightly adjusted text leading pairs */}
                    <div className="flex flex-col justify-center">
                      <span className="text-[2.3rem] font-semibold text-white leading-none tracking-wide">
                        {item.title}
                      </span>
                      <span className="text-[11px] font-medium text-white/80 mt-1.5 tracking-wide">
                        {item.subtitle}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Right Side - Balanced Buttons */}
              <div className="flex flex-col gap-4 w-full max-w-[380px]">
                {/* Login Button */}
                <Link
                  href="/login"
                  onClick={onClose}
                  className="w-full bg-[#f65c72] hover:bg-[#e04f63] transition-colors rounded-[1rem] p-6 flex flex-col items-center justify-center relative group shadow-lg"
                >
                  <span className="text-lg font-bold text-white tracking-wider">LOGIN</span>
                  <span className="text-[10px] font-medium text-white/90 mt-0.5">Sign in to your account</span>
                  <div className="mt-3 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-[#f65c72] rounded-full group-hover:scale-150 transition-transform"></div>
                  </div>
                </Link>

                {/* Market Button */}
                <Link
                  href="/market/dambulla"
                  onClick={onClose}
                  className="w-full bg-[#f65c72] hover:bg-[#e04f63] transition-colors rounded-[1rem] p-6 flex flex-col items-center justify-center relative group shadow-lg"
                >
                  <span className="text-lg font-bold text-white tracking-wider">TODAY MARKET</span>
                  <span className="text-[10px] font-medium text-white/90 mt-0.5">Today's market prices</span>
                  <div className="mt-3 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-[#f65c72] rounded-full group-hover:scale-150 transition-transform"></div>
                  </div>
                </Link>

                {/* Requirements Button */}
                <button className="w-full bg-[#f65c72] hover:bg-[#e04f63] transition-colors rounded-[1rem] p-7 flex flex-col items-center justify-center relative group shadow-lg">
                  <span className="text-xl font-bold text-white tracking-widest">REQUIREMENTS</span>
                  <span className="text-[11px] font-medium text-white/90 mt-0.5">Application Guidelines</span>
                  <div className="mt-4 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-[#f65c72] rounded-full group-hover:scale-150 transition-transform"></div>
                  </div>
                </button>

                {/* My Page & Entry Buttons */}
                <div className="flex gap-4">
                  <button className="flex-1 bg-[#f65c72] hover:bg-[#e04f63] transition-colors rounded-[1rem] p-6 flex flex-col items-center justify-center group shadow-lg">
                    <span className="text-lg font-bold text-white tracking-wider">MY PAGE</span>
                    <span className="text-[10px] font-medium text-white/90 mt-0.5">My Page</span>
                    <div className="mt-3 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-[#f65c72] rounded-full group-hover:scale-150 transition-transform"></div>
                    </div>
                  </button>
                  <button className="flex-1 bg-[#f65c72] hover:bg-[#e04f63] transition-colors rounded-[1rem] p-6 flex flex-col items-center justify-center group shadow-lg">
                    <span className="text-lg font-bold text-white tracking-wider">ENTRY</span>
                    <span className="text-[10px] font-medium text-white/90 mt-0.5">Entry</span>
                    <div className="mt-3 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-[#f65c72] rounded-full group-hover:scale-150 transition-transform"></div>
                    </div>
                  </button>
                </div>

                {/* Social Buttons */}
                <div className="flex gap-4 mt-1">
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