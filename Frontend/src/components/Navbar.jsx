"use client";

import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* LOGO */}
          <a href="/Acceuil" className="flex items-center gap-3 group">
            <img
              src="/images/logo.png"
              alt="MoroccoFan2030 Logo"
              className="w-10 h-10 object-cover"
            />
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-stone-900 text-sm">
                Morocco<span className="text-[#C1272D]">2030</span>
              </span>
              <span className="text-xs text-[#006233] decorative-font -mt-1">
                المغرب
              </span>
            </div>
          </a>

          {/* DESKTOP MENU (INCHANGÉ) */}
          <div className="hidden md:flex items-center gap-1">
            <a href="#cities" className="group px-4 py-2 hover:bg-green-50 rounded-lg transition-all">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-stone-700 group-hover:text-[#006233] transition-colors">Cities</span>
                <span className="text-xs text-[#006233] decorative-font opacity-70">المدن</span>
              </div>
            </a>
            <a href="/Matches" className="group px-4 py-2 hover:bg-red-50 rounded-lg transition-all">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-stone-700 group-hover:text-[#C1272D] transition-colors">Matches</span>
                <span className="text-xs text-[#C1272D] decorative-font opacity-70">المباريات</span>
              </div>
            </a>
            <a href="/Teams" className="group px-4 py-2 hover:bg-green-50 rounded-lg transition-all">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-stone-700 group-hover:text-[#006233] transition-colors">Culture</span>
                <span className="text-xs text-[#006233] decorative-font opacity-70">الثقافة</span>
              </div>
            </a>
            <a href="#groups" className="group px-4 py-2 hover:bg-red-50 rounded-lg transition-all">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-stone-700 group-hover:text-[#C1272D] transition-colors">Groups</span>
                <span className="text-xs text-[#C1272D] decorative-font opacity-70">المجموعات</span>
              </div>
            </a>
             <a href="#news" onClick={(e) => handleNavClick(e, 'news')} className="group px-4 py-2 hover:bg-amber-50 rounded-lg transition-all">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-stone-700 group-hover:text-amber-600 transition-colors">News</span>
                <span className="text-xs text-amber-600 decorative-font opacity-70">الأخبار</span>
              </div>
            </a>
            <a href="#" className="group px-4 py-2 hover:bg-purple-50 rounded-lg transition-all">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-stone-700 group-hover:text-purple-600 transition-colors">Prediction</span>
                <span className="text-xs text-purple-600 decorative-font opacity-70">التوقعات</span>
              </div>
            </a></div>

          {/* BURGER (MOBILE SEULEMENT) */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden p-2 rounded bg-white-600"
          >
            <div className="w-6 h-0.5 bg-black mb-1"></div>
            <div className="w-6 h-0.5 bg-black mb-1"></div>
            <div className="w-6 h-0.5 bg-black"></div>
          </button>

        </div>
      </nav>

      {/* OVERLAY */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* MOBILE MENU */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 transform transition-transform duration-300
        ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <span className="font-bold text-lg">Menu</span>
          <button onClick={() => setMenuOpen(false)}>✕</button>
        </div>

        <div className="flex flex-col p-6 gap-5 font-semibold text-stone-700">
          <a href="#cities">Cities</a>
          <a href="/Matches">Matches</a>
          <a href="#culture">Culture</a>
          <a href="#groups">Groups</a>
          <a href="#news">News</a>
          <a href="#prediction">Prediction</a>

          <a className="mt-4 bg-red-600 text-white py-3 rounded-lg text-center font-bold">
            Tickets
          </a>
        </div>
      </div>
    </>
  );
}
