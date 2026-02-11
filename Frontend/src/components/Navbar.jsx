"use client";

import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Données utilisateur
  const user = {
    name: "Ahmed",
    fullName: "Ahmed El Fassi",
    email: "ahmed@morocco2030.com",
    initials: "AE"
  };

  return (
    <>
      <style jsx global>{`
        @keyframes slideInDown {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-slide-down {
          animation: slideInDown 0.2s ease-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }

        .glass {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        body { 
          font-family: 'Cairo', sans-serif; 
        }
        
        .decorative-font { 
          font-family: 'Aref Ruqaa', serif; 
        }
      `}</style>

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

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-1">
            <a href="/Cities" className="group px-4 py-2 hover:bg-green-50 rounded-lg transition-all">
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
            <a href="/Teams" className="group px-4 py-2 hover:bg-red-50 rounded-lg transition-all">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-stone-700 group-hover:text-[#C1272D] transition-colors">Teams</span>
                <span className="text-xs text-[#C1272D] decorative-font opacity-70">الفرق</span>
              </div>
            </a>
            <a href="/Stades" className="group px-4 py-2 hover:bg-green-50 rounded-lg transition-all">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-stone-700 group-hover:text-[#006233] transition-colors">Culture</span>
                <span className="text-xs text-[#006233] decorative-font opacity-70">الثقافة</span>
              </div>
            </a>
            <a href="/Groups" className="group px-4 py-2 hover:bg-red-50 rounded-lg transition-all">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-stone-700 group-hover:text-[#C1272D] transition-colors">Groups</span>
                <span className="text-xs text-[#C1272D] decorative-font opacity-70">المجموعات</span>
              </div>
            </a>
            <a href="/News" className="group px-4 py-2 hover:bg-amber-50 rounded-lg transition-all">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-stone-700 group-hover:text-amber-600 transition-colors">News</span>
                <span className="text-xs text-amber-600 decorative-font opacity-70">الأخبار</span>
              </div>
            </a>
            <a href="/Stades" className="group px-4 py-2 hover:bg-purple-50 rounded-lg transition-all">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-stone-700 group-hover:text-purple-600 transition-colors">Stades</span>
                <span className="text-xs text-purple-600 decorative-font opacity-70">ملاعب</span>
              </div>
            </a>
          </div>

          {/* ICÔNE USER (DESKTOP) - DESIGN MINIMALISTE */}
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full hover:bg-stone-50 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-semibold text-sm">
              {user.initials}
            </div>
            <span className="text-sm font-medium text-stone-700">{user.name}</span>
            <svg 
              className={`w-4 h-4 text-stone-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* BURGER (MOBILE) */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <div className="w-6 h-0.5 bg-stone-800 mb-1.5 rounded-full"></div>
            <div className="w-6 h-0.5 bg-stone-800 mb-1.5 rounded-full"></div>
            <div className="w-6 h-0.5 bg-stone-800 rounded-full"></div>
          </button>

        </div>
      </nav>

      {/* OVERLAY POUR USER MENU (DESKTOP) */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40 animate-fade-in"
          onClick={() => setUserMenuOpen(false)}
        />
      )}

      {/* USER MENU DROPDOWN (DESKTOP) - DESIGN SIMPLE ET ÉPURÉ */}
      {userMenuOpen && (
        <div className="hidden md:block fixed top-[72px] right-6 w-72 bg-white rounded-2xl shadow-xl z-50 overflow-hidden border border-stone-100 animate-slide-down">
          
          {/* Header Simple */}
          <div className="px-5 py-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-semibold">
                {user.initials}
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">{user.fullName}</h3>
                <p className="text-xs text-stone-500">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items - Design Minimaliste */}
          <div className="py-2">
            <a 
              href="/profile" 
              className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 transition-all group"
            >
              <svg className="w-5 h-5 text-stone-400 group-hover:text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">Profile</span>
            </a>

            <a 
              href="/favorites" 
              className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 transition-all group"
            >
              <svg className="w-5 h-5 text-stone-400 group-hover:text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">Favorites</span>
            </a>

            <a 
              href="/community" 
              className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 transition-all group relative"
            >
              <svg className="w-5 h-5 text-stone-400 group-hover:text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">Community</span>
              <span className="ml-auto w-5 h-5 rounded-full bg-[#006233] text-white text-xs flex items-center justify-center font-medium">
                2
              </span>
            </a>

            <a 
              href="/my-predictions" 
              className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 transition-all group"
            >
              <svg className="w-5 h-5 text-stone-400 group-hover:text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">My Predictions</span>
            </a>

            <a 
              href="/settings" 
              className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 transition-all group"
            >
              <svg className="w-5 h-5 text-stone-400 group-hover:text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">Settings</span>
            </a>

            <div className="my-2 border-t border-stone-100"></div>

            <button 
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-all group"
              onClick={() => {/* Logique de déconnexion */}}
            >
              <svg className="w-5 h-5 text-stone-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium text-red-600">Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY MOBILE */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* MOBILE MENU - DESIGN SIMPLE */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 md:hidden overflow-y-auto
        ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header Simple */}
        <div className="p-6 border-b border-stone-100">
          <button 
            onClick={() => setMenuOpen(false)}
            className="absolute top-6 right-6 w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3 mt-2">
            <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-semibold">
              {user.initials}
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">{user.fullName}</h3>
              <p className="text-xs text-stone-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Mobile */}
        <div className="p-4">
          <div className="mb-6">
            <a href="/Cities" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-stone-50 transition-all">
              <span className="text-sm font-medium text-stone-700">Cities</span>
              <span className="text-xs text-stone-400 ml-auto decorative-font">المدن</span>
            </a>
            <a href="/Matches" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-stone-50 transition-all">
              <span className="text-sm font-medium text-stone-700">Matches</span>
              <span className="text-xs text-stone-400 ml-auto decorative-font">المباريات</span>
            </a>
            <a href="/Teams" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-stone-50 transition-all">
              <span className="text-sm font-medium text-stone-700">Teams</span>
              <span className="text-xs text-stone-400 ml-auto decorative-font">الفرق</span>
            </a>
            <a href="/Culture" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-stone-50 transition-all">
              <span className="text-sm font-medium text-stone-700">Culture</span>
              <span className="text-xs text-stone-400 ml-auto decorative-font">الثقافة</span>
            </a>
            <a href="/Groups" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-stone-50 transition-all">
              <span className="text-sm font-medium text-stone-700">Groups</span>
              <span className="text-xs text-stone-400 ml-auto decorative-font">المجموعات</span>
            </a>
            <a href="/News" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-stone-50 transition-all">
              <span className="text-sm font-medium text-stone-700">News</span>
              <span className="text-xs text-stone-400 ml-auto decorative-font">الأخبار</span>
            </a>
            <a href="/Prediction" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-stone-50 transition-all">
              <span className="text-sm font-medium text-stone-700">Stades</span>
              <span className="text-xs text-stone-400 ml-auto decorative-font">ملاعب</span>
            </a>
          </div>

          <div className="border-t border-stone-100 pt-4">
            <a href="/profile" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-stone-50 transition-all">
              <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm font-medium text-stone-700">Profile</span>
            </a>

            <a href="/favorites" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-stone-50 transition-all">
              <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm font-medium text-stone-700">Favorites</span>
            </a>

            <a href="/community" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-stone-50 transition-all">
              <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-medium text-stone-700">Community</span>
              <span className="ml-auto w-5 h-5 rounded-full bg-[#006233] text-white text-xs flex items-center justify-center font-medium">2</span>
            </a>

            <a href="/Prediction" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-stone-50 transition-all">
              <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-stone-700">My Predictions</span>
            </a>

            <a href="/settings" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-stone-50 transition-all">
              <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-stone-700">Settings</span>
            </a>

            <div className="my-3 border-t border-stone-100"></div>

            <button 
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-50 transition-all"
              onClick={() => {/* Logique de déconnexion */}}
            >
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium text-red-600">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}