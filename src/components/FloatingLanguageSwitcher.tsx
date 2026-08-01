"use client";

import { useEffect, useState } from "react";

export default function FloatingLanguageSwitcher() {
    const [currentLang, setCurrentLang] = useState("EN");
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const languages = [
        { code: "සිං" },
        { code: "த" },
        { code: "EN" },
    ];
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsVisible(currentScrollY < 10);
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        /* Pins to the absolute top-right of the viewport with a clean 16px (right-4) spacing gap from the edge */
        <div className={`fixed top-0 right-4 md:right-8 z-50 flex flex-row gap-1 select-none items-start transition-transform duration-300 ease-in-out ${isVisible ? "translate-y-0" : "-translate-y-[150%]"}`}>
            {languages.map((lang) => {
                const isActive = currentLang === lang.code;
                return (
                    <button
                        key={lang.code}
                        onClick={() => setCurrentLang(lang.code)}
                        className={`
              /* Micro Dimensions */
              w-8 h-5 flex flex-row items-center justify-center transition-all duration-200 shadow-sm focus:outline-none
              /* Curved bottom corners so they hang downwards cleanly */
              rounded-b-md border-x border-b cursor-pointer
              /* Appearance Configurations */
              ${isActive
                                ? "bg-[#ffd700] text-black border-[#ffd700] font-black"
                                : "bg-[#1e293b] text-white border-slate-700/50 hover:bg-slate-800 hover:translate-y-[2px]"
                            }
            `}
                    >
                        {/* Primary Language text code */}
                        <span className="text-[11px] font-bold tracking-tight uppercase leading-none">
                            {lang.code}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}