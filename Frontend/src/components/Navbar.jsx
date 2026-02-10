import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function Navbar() {
      {/* Navigation */}
      return(
      <nav className="fixed top-0 w-full z-50 glass transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="/Acceuil" className="flex items-center gap-3 group">
            <div className="relative">
              <img src="/images/logo.png" alt="MoroccoFan2030 Logo" className="w-10 h-10 object-cover transition-all" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-stone-900 text-sm">
                Morocco<span className="text-[#C1272D]">2030</span>
              </span>
              <span className="text-xs text-[#006233] decorative-font" style={{marginTop: '-2px'}}>المغرب</span>
            </div>
          </a>

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
            <a href="#culture" className="group px-4 py-2 hover:bg-green-50 rounded-lg transition-all">
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
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a href="#" className="relative overflow-hidden bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white px-5 py-2.5 rounded-lg font-bold tracking-wide hover:shadow-xl hover:shadow-red-500/40 transition-all flex items-center gap-2 group">
              <span className="relative z-10">Tickets</span>
              <span className="text-xs decorative-font opacity-90 relative z-10">التذاكر</span>
              <div className="absolute inset-0 bg-[#006233] transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </a>
          </div>
        </div>
      </nav>
      );}