"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen]       = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

  // ── Données utilisateur depuis localStorage ──────────────────────────────
  const [user, setUser] = useState({
    name:     "",
    fullName: "",
    email:    "",
    initials: "",
    type:     "",
    imageUrl: "", // Ajout de l'image
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Fonction pour charger les données utilisateur
    const loadUserData = () => {
      const name  = localStorage.getItem("userName")  || "";
      const email = localStorage.getItem("userEmail") || "";
      const type  = localStorage.getItem("userType")  || "";
      const supporterId = localStorage.getItem("supporterId") || "0";
      const imageUrl = localStorage.getItem("userImageUrl") || ""; // Récupérer l'image

      // Vérifier si l'utilisateur est connecté
      const loggedIn = name && email && supporterId !== "0";
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        // Initiales : 2 premières lettres du nom
        const parts    = name.trim().split(" ");
        const initials = parts.length >= 2
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : name.slice(0, 2).toUpperCase();

        setUser({ name: parts[0] || "User", fullName: name, email, initials, type, imageUrl });
      }
    };

    // Charger au montage
    loadUserData();

    // Écouter les changements de storage (pour détecter la connexion)
    const handleStorageChange = (e) => {
      if (e.key === 'userName' || e.key === 'supporterId' || e.key === null) {
        loadUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Écouter un événement personnalisé pour la connexion dans le même onglet
    const handleLoginEvent = () => {
      loadUserData();
    };

    window.addEventListener('userLoggedIn', handleLoginEvent);

    // Nettoyer les écouteurs
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleLoginEvent);
    };
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    try {
      await fetch("http://localhost:3309/api/auth/logout", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (_) { /* ignore */ }

    localStorage.clear();
    setIsLoggedIn(false);
    router.push("/Login");
  };

  return (
    <>
      <style jsx global>{`
        @keyframes slideInDown {
          from { transform: translateY(-10px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-slide-down { animation: slideInDown 0.2s ease-out; }
        .animate-fade-in    { animation: fadeIn 0.2s ease-out; }
        .glass {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        body              { font-family: 'Cairo', sans-serif; }
        .decorative-font  { font-family: 'Aref Ruqaa', serif; }
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
            {[
              { href: "/Cities",  en: "Cities",  ar: "المدن",       color: "#006233", bg: "green"  },
              { href: "/Matches", en: "Matches", ar: "المباريات",   color: "#C1272D", bg: "red"    },
              { href: "/Teams",   en: "Teams",   ar: "الفرق",       color: "#C1272D", bg: "red"    },
              { href: "/Stades",  en: "Culture", ar: "الثقافة",     color: "#006233", bg: "green"  },
              { href: "/Groups",  en: "Groups",  ar: "المجموعات",   color: "#C1272D", bg: "red"    },
              { href: "/News",    en: "News",    ar: "الأخبار",     color: "#d97706", bg: "amber"  },
              { href: "/Stades",  en: "Stades",  ar: "ملاعب",       color: "#7c3aed", bg: "purple" },
            ].map(({ href, en, ar, color, bg }) => (
              <Link key={en} href={href}
                className={`group px-4 py-2 hover:bg-${bg}-50 rounded-lg transition-all`}>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-semibold text-stone-700 group-hover:transition-colors"
                        style={{ "--hover-color": color }}
                        onMouseEnter={e => e.target.style.color = color}
                        onMouseLeave={e => e.target.style.color = ""}>
                    {en}
                  </span>
                  <span className="text-xs decorative-font opacity-70" style={{ color }}>{ar}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* USER BUTTON (DESKTOP) ou LOGIN BUTTON */}
          {isLoggedIn ? (
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full hover:bg-stone-50 transition-all"
            >
              {/* Badge role */}
              <div className="relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden"
                     style={{ background: user.type === "RESPONSABLE" ? "#006233" : "#C1272D" }}>
                  {user.imageUrl ? (
                    <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.initials || "?"
                  )}
                </div>
              
              </div>
            
            </button>
          ) : (
            <Link href="/Login"
               className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C1272D] hover:bg-[#A01F24] text-white font-medium text-sm transition-all shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login
            </Link>
          )}

          {/* BURGER (MOBILE) */}
          <button onClick={() => setMenuOpen(true)}
                  className="md:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors">
            <div className="w-6 h-0.5 bg-stone-800 mb-1.5 rounded-full"></div>
            <div className="w-6 h-0.5 bg-stone-800 mb-1.5 rounded-full"></div>
            <div className="w-6 h-0.5 bg-stone-800 rounded-full"></div>
          </button>
        </div>
      </nav>

      {/* OVERLAY dropdown */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40 animate-fade-in" onClick={() => setUserMenuOpen(false)} />
      )}

      {/* USER DROPDOWN (DESKTOP) - Seulement si connecté */}
      {isLoggedIn && userMenuOpen && (
        <div className="hidden md:block fixed top-[72px] right-6 w-72 bg-white rounded-2xl shadow-xl z-50 overflow-hidden border border-stone-100 animate-slide-down">

          {/* Header avec vraies infos */}
          <div className="px-5 py-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden"
                   style={{ background: user.type === "RESPONSABLE" ? "#006233" : "#C1272D" }}>
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.initials || "?"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-stone-900 truncate">{user.fullName || "Utilisateur"}</h3>
                <p className="text-xs text-stone-500 truncate">{user.email || ""}</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full text-white font-medium"
                      style={{ background: user.type === "RESPONSABLE" ? "#006233" : "#C1272D" }}>
                  {user.type === "RESPONSABLE" ? "Responsable" : "Supporter"}
                </span>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-2">
            {[
              { href: "/Profil",        label: "Profile",        icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
              { href: "/Message",      label: "Community",      icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
            ].map(({ href, label, icon }) => (
              <Link key={label} href={href}
                 className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 transition-all group">
                <svg className="w-5 h-5 text-stone-400 group-hover:text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
                <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">{label}</span>
              </Link>
            ))}

            <div className="my-2 border-t border-stone-100"></div>

            <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-all group">
              <svg className="w-5 h-5 text-stone-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium text-red-600">Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY MOBILE */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
             onClick={() => setMenuOpen(false)} />
      )}

      {/* MOBILE MENU */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 md:hidden overflow-y-auto
        ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>

        {isLoggedIn ? (
          // Header utilisateur connecté
          <div className="p-6 border-b border-stone-100">
            <button onClick={() => setMenuOpen(false)}
                    className="absolute top-6 right-6 w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden"
                   style={{ background: user.type === "RESPONSABLE" ? "#006233" : "#C1272D" }}>
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.initials || "?"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-stone-900 truncate">{user.fullName || "Utilisateur"}</h3>
                <p className="text-xs text-stone-500 truncate">{user.email || ""}</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full text-white font-medium"
                      style={{ background: user.type === "RESPONSABLE" ? "#006233" : "#C1272D" }}>
                  {user.type === "RESPONSABLE" ? "Responsable" : "Supporter"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Header utilisateur non connecté
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
          <div className="mb-6">
            {[
              { href: "/Cities",  en: "Cities",  ar: "المدن"      },
              { href: "/Matches", en: "Matches", ar: "المباريات"  },
              { href: "/Teams",   en: "Teams",   ar: "الفرق"      },
              { href: "/Culture", en: "Culture", ar: "الثقافة"    },
              { href: "/Groups",  en: "Groups",  ar: "المجموعات"  },
              { href: "/News",    en: "News",    ar: "الأخبار"    },
              { href: "/Stades",  en: "Stades",  ar: "ملاعب"      },
            ].map(({ href, en, ar }) => (
              <Link key={en} href={href}
                 className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-stone-50 transition-all">
                <span className="text-sm font-medium text-stone-700">{en}</span>
                <span className="text-xs text-stone-400 ml-auto decorative-font">{ar}</span>
              </Link>
            ))}
          </div>

          {isLoggedIn && (
            <>
              <div className="border-t border-stone-100 pt-4">
                <Link href="/Profil"        className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-stone-50">
                  <span className="text-sm font-medium text-stone-700">Profile</span>
                </Link>
                <Link href="/Message"      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-stone-50">
                  <span className="text-sm font-medium text-stone-700">Community</span>
                </Link>
                
                <div className="my-3 border-t border-stone-100"></div>

                <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-50 transition-all">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm font-medium text-red-600">Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}