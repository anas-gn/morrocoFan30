"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen]         = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

  const [user, setUser] = useState({
    name: "", fullName: "", email: "",
    initials: "", type: "", imageUrl: "",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadUserData = () => {
      const name        = localStorage.getItem("userName")     || "";
      const email       = localStorage.getItem("userEmail")    || "";
      const type        = localStorage.getItem("userType")     || "";
      const supporterId = localStorage.getItem("supporterId")  || "0";
      const imageUrl    = localStorage.getItem("userImageUrl") || "";
      const loggedIn    = name && email && supporterId !== "0";
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        const parts    = name.trim().split(" ");
        const initials = parts.length >= 2
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : name.slice(0, 2).toUpperCase();
        setUser({ name: parts[0] || "User", fullName: name, email, initials, type, imageUrl });
      }
    };
    loadUserData();
    const handleStorage = (e) => {
      if (e.key === "userName" || e.key === "supporterId" || e.key === null) loadUserData();
    };
    const handleLogin = () => loadUserData();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("userLoggedIn", handleLogin);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("userLoggedIn", handleLogin);
    };
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch("http://localhost:3309/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (_) {}
    localStorage.clear();
    setIsLoggedIn(false);
    router.push("/Login");
  };

  const isResponsable = user.type === "RESPONSABLE";
  const accentColor   = isResponsable ? "#006233" : "#C1272D";

  const NAV_LINKS = [
    { href: "/cities",  en: "Cities",  ar: "المدن",     color: "#006233" },
    { href: "/Matches", en: "Matches", ar: "المباريات", color: "#C1272D" },
    { href: "/Teams",   en: "Teams",   ar: "الفرق",     color: "#C1272D" },
    { href: "/Stades",  en: "Culture", ar: "الثقافة",   color: "#006233" },
    { href: "/Groups",  en: "Groups",  ar: "المجموعات", color: "#C1272D" },
    { href: "/News",    en: "News",    ar: "الأخبار",   color: "#d97706" },
    { href: "/Stades",  en: "Stades",  ar: "ملاعب",     color: "#7c3aed" },
  ];

  const MENU_ITEMS = [
    {
      href: "/Profil", label: "Profile", sub: "Voir mon profil",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      ),
    },
    {
      href: "/Message", label: "Community", sub: "Discussions & posts",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      ),
    },
  ];

  return (
    <>
      <style jsx global>{`
        @keyframes dropIn {
          from { transform: translateY(-8px) scale(0.98); opacity: 0; }
          to   { transform: translateY(0)    scale(1);    opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-drop-in  { animation: dropIn 0.18s cubic-bezier(0.16,1,0.3,1); }
        .animate-fade-in  { animation: fadeIn 0.15s ease-out; }
        .glass {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .glass-dropdown {
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0,0,0,0.07);
        }
        body             { font-family: 'Cairo', sans-serif; }
        .decorative-font { font-family: 'Aref Ruqaa', serif; }
      `}</style>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 glass transition-all duration-300 font-[Cairo]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* LOGO */}
          <Link href="/Acceuil" className="flex items-center gap-3 group">
            <img src="/images/logo.png" alt="MoroccoFan2030 Logo" className="w-10 h-10 object-cover" />
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-stone-900 text-sm">
                Morocco<span className="text-[#C1272D]">2030</span>
              </span>
              <span className="text-xs text-[#006233] decorative-font -mt-1">المغرب</span>
            </div>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, en, ar, color }) => (
              <Link key={en} href={href} className="group px-4 py-2 hover:bg-stone-50 rounded-lg transition-all">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-sm font-semibold text-stone-700 transition-colors group-hover:text-stone-900"
                        onMouseEnter={e => e.target.style.color = color}
                        onMouseLeave={e => e.target.style.color = ""}>
                    {en}
                  </span>
                  <span className="text-[11px] decorative-font opacity-60 transition-opacity group-hover:opacity-90"
                        style={{ color }}>
                    {ar}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* USER / LOGIN — DESKTOP */}
          {isLoggedIn ? (
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="hidden md:flex items-center gap-2.5 px-3 py-2 rounded-full hover:bg-stone-50 transition-all duration-200 group"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden ring-2 ring-offset-1 transition-all duration-200 group-hover:ring-offset-2"
                     style={{ background: accentColor, ringColor: accentColor }}>
                  {user.imageUrl
                    ? <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                    : <span>{user.initials || "?"}</span>}
                </div>
                {/* Online dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              {/* Chevron */}
             
            </button>
          ) : (
            <Link href="/Login"
                  className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C1272D] hover:bg-[#A01F24] text-white font-medium text-sm transition-all shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login
            </Link>
          )}

          {/* BURGER (MOBILE) */}
          <button onClick={() => setMenuOpen(true)}
                  className="md:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors">
            <div className="w-6 h-0.5 bg-stone-800 mb-1.5 rounded-full" />
            <div className="w-6 h-0.5 bg-stone-800 mb-1.5 rounded-full" />
            <div className="w-6 h-0.5 bg-stone-800 rounded-full" />
          </button>
        </div>
      </nav>

      {/* ── CLICK OVERLAY ─────────────────────────────────────────────────── */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40 animate-fade-in" onClick={() => setUserMenuOpen(false)} />
      )}

      {/* ── USER DROPDOWN (DESKTOP) ────────────────────────────────────────── */}
      {isLoggedIn && userMenuOpen && (
        <div className="hidden md:block fixed top-[76px] right-6 w-68 z-50 animate-drop-in"
             style={{ width: "260px" }}>
          {/* Same glass as navbar */}
          <div className="glass-dropdown rounded-2xl shadow-xl shadow-black/[0.08] overflow-hidden">

            {/* ── User header — matches navbar height/padding rhythm */}
            <div className="px-4 py-4 border-b border-stone-100/80">
              <div className="flex items-center gap-3">
                {/* Avatar — same ring style as navbar button */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden"
                       style={{ background: accentColor }}>
                    {user.imageUrl
                      ? <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                      : <span>{user.initials || "?"}</span>}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900 text-sm truncate leading-tight">
                    {user.fullName || "Utilisateur"}
                  </p>
                  <p className="text-xs text-stone-400 truncate mt-0.5">{user.email}</p>
                </div>

                {/* Role badge — same pill style as navbar login button */}
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full text-white"
                      style={{ background: accentColor }}>
                  {isResponsable ? "Staff" : "Fan"}
                </span>
              </div>
            </div>

            {/* ── Menu items — same padding/hover as navbar links */}
            <div className="py-1.5">
              {MENU_ITEMS.map(({ href, label, sub, icon }) => (
                <Link key={label} href={href}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 transition-all duration-150 group">
                  <div className="w-8 h-8 rounded-xl bg-stone-100 group-hover:bg-white flex items-center justify-center transition-all shrink-0 group-hover:shadow-sm">
                    <svg className="w-4 h-4 text-stone-500 group-hover:text-stone-800 transition-colors"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {icon}
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-700 group-hover:text-stone-900 transition-colors leading-tight">
                      {label}
                    </p>
                    <p className="text-[11px] text-stone-400 leading-tight mt-0.5">{sub}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* ── Divider — same as navbar bottom border */}
            <div className="mx-4 border-t border-stone-100" />

            {/* ── Logout — same text-sm weight as nav links */}
            <div className="py-1.5">
              <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-all duration-150 group">
                <div className="w-8 h-8 rounded-xl bg-stone-100 group-hover:bg-red-100 flex items-center justify-center transition-all shrink-0">
                  <svg className="w-4 h-4 text-stone-400 group-hover:text-[#C1272D] transition-colors"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-stone-500 group-hover:text-[#C1272D] transition-colors">
                  Sign out
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── OVERLAY MOBILE ────────────────────────────────────────────────── */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
             onClick={() => setMenuOpen(false)} />
      )}

      {/* ── MOBILE MENU ───────────────────────────────────────────────────── */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 md:hidden overflow-y-auto
        ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>

        {isLoggedIn ? (
          <div className="p-6 border-b border-stone-100">
            <button onClick={() => setMenuOpen(false)}
                    className="absolute top-6 right-6 w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center gap-3 mt-2">
              <div className="relative">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden"
                     style={{ background: accentColor }}>
                  {user.imageUrl
                    ? <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                    : user.initials || "?"}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-stone-900 truncate">{user.fullName || "Utilisateur"}</h3>
                <p className="text-xs text-stone-500 truncate">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full text-white font-medium"
                      style={{ background: accentColor }}>
                  {isResponsable ? "Responsable" : "Supporter"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 border-b border-stone-100">
            <button onClick={() => setMenuOpen(false)}
                    className="absolute top-6 right-6 w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Link href="/Login"
                  className="flex items-center justify-center gap-2 mt-2 px-5 py-3 rounded-full bg-[#C1272D] hover:bg-[#A01F24] text-white font-medium text-sm transition-all shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login
            </Link>
          </div>
        )}

        <div className="p-4">
          <div className="mb-4">
            {NAV_LINKS.map(({ href, en, ar, color }) => (
              <Link key={en} href={href}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-stone-50 transition-all">
                <span className="text-sm font-semibold text-stone-700">{en}</span>
                <span className="text-xs ml-auto decorative-font opacity-60" style={{ color }}>{ar}</span>
              </Link>
            ))}
          </div>

          {isLoggedIn && (
            <div className="border-t border-stone-100 pt-3">
              {MENU_ITEMS.map(({ href, label }) => (
                <Link key={label} href={href}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-stone-50 transition-all">
                  <span className="text-sm font-semibold text-stone-700">{label}</span>
                </Link>
              ))}
              <div className="my-2 border-t border-stone-100" />
              <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-50 transition-all">
                <svg className="w-5 h-5 text-[#C1272D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-semibold text-[#C1272D]">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}