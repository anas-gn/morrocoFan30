import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function Footer() {
        {/* Footer */}
        return(
      <footer className="bg-gradient-to-br from-[#1a1412] via-[#2d1e1a] to-[#1a1412] text-stone-300 pt-20 pb-10 relative overflow-hidden ">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize: '200px'}}></div>
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#C1272D]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-[#006233]/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <a href="#" className="flex items-center gap-2 mb-6 text-white group">
                <img 
                  src="/images/logo.png" 
                  alt="MoroccoFan2030 Logo" 
                  className="w-12 h-12 object-contain"
                />
                <span className="font-bold tracking-tight uppercase">MoroccoFan2030</span>
              </a>
              <p className="text-sm leading-relaxed mb-6 text-stone-400">
                Celebrating the spirit of football in the heart of the Maghreb. United by passion, defined by heritage.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-9 h-9 rounded-full border-2 border-stone-700 flex items-center justify-center hover:border-[#C1272D] hover:bg-[#C1272D]/10 hover:text-[#C1272D] transition-all">
                  <span className="material-icons text-sm">photo_camera</span>
                </a>
                <a href="#" className="w-9 h-9 rounded-full border-2 border-stone-700 flex items-center justify-center hover:border-[#006233] hover:bg-[#006233]/10 hover:text-[#006233] transition-all">
                  <span className="material-icons text-sm">chat</span>
                </a>
                <a href="#" className="w-9 h-9 rounded-full border-2 border-stone-700 flex items-center justify-center hover:border-amber-500 hover:bg-amber-500/10 hover:text-amber-500 transition-all">
                  <span className="material-icons text-sm">thumb_up</span>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#C1272D] rounded"></span>
                Tournament
              </h4>
              <ul className="space-y-3 text-sm">
                <li><a href="/Matches" className="text-stone-400 hover:text-[#C1272D] hover:translate-x-1 inline-block transition-all">Match Schedule</a></li>
                <li><a href="#" className="text-stone-400 hover:text-[#006233] hover:translate-x-1 inline-block transition-all">Venues</a></li>
                <li><a href="/Teams" className="text-stone-400 hover:text-[#C1272D] hover:translate-x-1 inline-block transition-all">Teams</a></li>
                <li><a href="#" className="text-stone-400 hover:text-[#006233] hover:translate-x-1 inline-block transition-all">Ticketing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#006233] rounded"></span>
                Explore Morocco
              </h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-stone-400 hover:text-[#006233] hover:translate-x-1 inline-block transition-all">Travel Guide</a></li>
                <li><a href="#" className="text-stone-400 hover:text-[#C1272D] hover:translate-x-1 inline-block transition-all">Culture & Heritage</a></li>
                <li><a href="#" className="text-stone-400 hover:text-[#006233] hover:translate-x-1 inline-block transition-all">Gastronomy</a></li>
                <li><a href="#" className="text-stone-400 hover:text-amber-500 hover:translate-x-1 inline-block transition-all">Accommodations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-amber-500 rounded"></span>
                Legal
              </h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-stone-400 hover:text-stone-200 hover:translate-x-1 inline-block transition-all">Privacy Policy</a></li>
                <li><a href="#" className="text-stone-400 hover:text-stone-200 hover:translate-x-1 inline-block transition-all">Terms of Service</a></li>
                <li><a href="#" className="text-stone-400 hover:text-stone-200 hover:translate-x-1 inline-block transition-all">Cookie Settings</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-700/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-400">
            <p className="flex items-center gap-2">
              <span>© 2024 MoroccoFan2030. Unofficial Fan Concept.</span>
              <span className="hidden md:inline">•</span>
              <span className="decorative-font text-[#006233]">المغرب 2030</span>
            </p>
            <div className="flex items-center gap-2">
              <span>Designed with</span>
              <span className="material-icons text-[#C1272D] animate-pulse" style={{fontSize: '14px'}}>favorite</span>
              <span>in</span>
              <span className="font-bold text-white">Morocco</span>
            </div>
          </div>
        </div>
      </footer>);
}