"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen]         = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const router = useRouter();

  const [user, setUser] = useState({
    name: "", fullName: "", email: "",
    initials: "", type: "", imageUrl: "",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    window.addEventListener("storage", handleStorage);
    window.addEventListener("userLoggedIn", loadUserData);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("userLoggedIn", loadUserData);
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
    { href: "/Groups",  en: "Groups",  ar: "المجموعات", color: "#C1272D" },
    { href: "/News",    en: "News",    ar: "الأخبار",   color: "#b45309" },
    { href: "/Stades",  en: "Stades",  ar: "ملاعب",     color: "#7c3aed" },
  ];

  const MENU_ITEMS = [
    { href: "/Profil",   label: "Profile",   sub: "View my profile",     icon: "person"  },
    { href: "/Message",  label: "Community", sub: "Discussions & posts",  icon: "forum"   }
  ];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=Amiri:ital,wght@0,400;1,400&display=swap');

        @keyframes dropIn {
          from { transform: translateY(-8px) scale(0.98); opacity: 0; }
          to   { transform: translateY(0)    scale(1);    opacity: 1; }
        }
        @keyframes fadeInNav { from { opacity: 0; } to { opacity: 1; } }

        .nav-drop  { animation: dropIn  0.18s cubic-bezier(0.16,1,0.3,1); }
        .nav-fade  { animation: fadeInNav 0.15s ease-out; }

        /* ── Navbar shell ── */
        .navbar-shell {
          background: rgba(45, 10, 14, 0.28);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
         
          transition: background .3s, border-color .3s, box-shadow .3s;
        }
        .navbar-shell.scrolled {
          background: rgba(45, 10, 14, 0.27);
          border-bottom-color: rgba(193, 39, 45, 0.22);
          box-shadow: 0 2px 24px rgba(45, 10, 14, 0.35);
        }

        /* ── Dropdown ── */
        .nav-dropdown {
          background: rgba(45, 10, 14, 0.98);
          border: 1px solid rgba(193, 39, 45, 0.2);
          backdrop-filter: blur(24px);
        }

        /* ── Mobile drawer ── */
        .mobile-drawer {
          background: rgba(45, 10, 14, 0.99);
          border-left: 1px solid rgba(193, 39, 45, 0.18);
        }

        /* ── Nav link pill ── */
        .nav-link-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 13px;
          border-radius: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: rgba(255,255,255,.65);
          text-transform: uppercase;
          letter-spacing: .04em;
          transition: background .18s, color .18s;
          border: 1px solid transparent;
        }
        .nav-link-pill:hover {
          background: rgba(255,255,255,.07);
          color: #fff;
          border-color: rgba(193,39,45,.18);
        }
        .nav-link-pill .material-icons { font-size: 14px; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className={`navbar-shell fixed top-0 w-full z-50 ${scrolled ? "scrolled" : ""} backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* LOGO */}
          <Link href="/Acceuil" className="flex items-center gap-3 group">
            <img src="/images/logo.png" alt="MoroccoFan2030" className="w-10 h-10 object-cover" />
            <div className="flex flex-col leading-none">
              <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:14, color:'#fff', letterSpacing:'-.01em', lineHeight:1.2 }}>
                Morocco<span style={{ color:'#C1272D' }}>2030</span>
              </span>
              <span style={{ fontFamily:'Amiri,serif', fontStyle:'italic', fontSize:12, color:'rgba(0,98,51,.8)', lineHeight:1.4 }}>المغرب</span>
            </div>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, en, ar, color }) => (
              <Link key={en} href={href}
                className="group px-4 py-2 rounded-lg hover:bg-white/[0.08] transition-all duration-200"
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:1, textDecoration:'none' }}>
                <span style={{ fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, color:'rgba(255,255,255,.75)', textTransform:'uppercase', letterSpacing:'.05em', lineHeight:1.2 }}>
                  {en}
                </span>
                <span style={{ fontFamily:'Amiri,serif', fontSize:11, opacity:.6, lineHeight:1.3, color }}>
                  {ar}
                </span>
              </Link>
            ))}
          </div>

          {/* USER / LOGIN — DESKTOP */}
          {isLoggedIn ? (
            <div className="hidden md:block relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
                style={{ background: userMenuOpen ? 'rgba(255,255,255,.08)' : 'transparent' }}
                onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,.08)'}
                onMouseOut={e  => !userMenuOpen && (e.currentTarget.style.background='transparent')}>
                {/* Avatar */}
                <div style={{ width:34, height:34, borderRadius:'50%', background:accentColor, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:13, color:'#fff', border:'2px solid rgba(255,255,255,.15)', flexShrink:0 }}>
                  {user.imageUrl
                    ? <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                    : <span>{user.initials || "?"}</span>
                  }
                </div>
                <div className="hidden lg:block text-left">
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:12, color:'#fff', lineHeight:1.2 }}>{user.name}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.06em', lineHeight:1.2 }}>
                    {isResponsable ? 'Staff' : 'Fan'}
                  </div>
                </div>
                <span className="material-icons hidden lg:block" style={{ fontSize:16, color:'rgba(255,255,255,.4)' }}>expand_more</span>
              </button>
            </div>
          ) : (
            <Link href="/Login"
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all"
              style={{ background:'linear-gradient(to right,#C1272D,#a01f24)', fontFamily:'Syne,sans-serif', textTransform:'uppercase', letterSpacing:'.05em', boxShadow:'0 4px 14px rgba(193,39,45,.3)' }}>
              <span className="material-icons" style={{ fontSize:15 }}>login</span>
              Login
            </Link>
          )}

          {/* BURGER */}
          <button onClick={() => setMenuOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors flex flex-col gap-1.5">
            <div style={{ width:22, height:2, background:'rgba(255,255,255,.7)', borderRadius:99 }} />
            <div style={{ width:16, height:2, background:'rgba(255,255,255,.5)', borderRadius:99 }} />
            <div style={{ width:22, height:2, background:'rgba(255,255,255,.7)', borderRadius:99 }} />
          </button>
        </div>
      </nav>

      {/* ── CLICK OVERLAY ── */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40 nav-fade" onClick={() => setUserMenuOpen(false)} />
      )}

      {/* ── USER DROPDOWN (DESKTOP) ── */}
      {isLoggedIn && userMenuOpen && (
        <div className="hidden md:block fixed top-[76px] right-6 z-50 nav-drop" style={{ width:260 }}>
          <div className="nav-dropdown rounded-2xl shadow-2xl overflow-hidden">

            {/* User header */}
            <div style={{ padding:'16px', borderBottom:'1px solid rgba(255,255,255,.07)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:accentColor, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:14, color:'#fff' }}>
                    {user.imageUrl
                      ? <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                      : user.initials || "?"
                    }
                  </div>
                  <span style={{ position:'absolute', bottom:0, right:0, width:10, height:10, borderRadius:'50%', background:'#3dba7a', border:'2px solid rgba(45,10,14,.99)' }} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'#fff', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {user.fullName || "User"}
                  </div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:2 }}>
                    {user.email}
                  </div>
                </div>
                <span style={{ fontSize:9, fontFamily:'Syne,sans-serif', fontWeight:800, textTransform:'uppercase', letterSpacing:'.06em', padding:'3px 8px', borderRadius:99, background:accentColor, color:'#fff', flexShrink:0 }}>
                  {isResponsable ? 'Staff' : 'Fan'}
                </span>
              </div>
            </div>

            {/* Menu items */}
            <div style={{ padding:'6px 0' }}>
              {MENU_ITEMS.map(({ href, label, sub, icon }) => (
                <Link key={label} href={href} onClick={() => setUserMenuOpen(false)}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', transition:'background .15s', cursor:'pointer' }}
                    onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,.06)'}
                    onMouseOut={e  => e.currentTarget.style.background='transparent'}>
                    <div style={{ width:32, height:32, borderRadius:10, background:'rgba(255,255,255,.06)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span className="material-icons" style={{ fontSize:16, color:'rgba(255,255,255,.5)' }}>{icon}</span>
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:12, color:'rgba(255,255,255,.85)', lineHeight:1.2 }}>{label}</div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,.3)', marginTop:1 }}>{sub}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div style={{ margin:'0 16px', height:1, background:'rgba(255,255,255,.07)' }} />

            {/* Logout */}
            <div style={{ padding:'6px 0 4px' }}>
              <button onClick={handleLogout}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 16px', background:'transparent', border:'none', cursor:'pointer', transition:'background .15s' }}
                onMouseOver={e => e.currentTarget.style.background='rgba(193,39,45,.1)'}
                onMouseOut={e  => e.currentTarget.style.background='transparent'}>
                <div style={{ width:32, height:32, borderRadius:10, background:'rgba(255,255,255,.06)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span className="material-icons" style={{ fontSize:16, color:'rgba(193,39,45,.7)' }}>logout</span>
                </div>
                <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:12, color:'rgba(193,39,45,.8)' }}>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE OVERLAY ── */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden nav-fade" onClick={() => setMenuOpen(false)} />
      )}

      {/* ── MOBILE DRAWER ── */}
      <div className={`mobile-drawer fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 md:hidden overflow-y-auto ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <img src="/images/logo.png" alt="" style={{ width:36, height:36, objectFit:'cover' }} />
            <div>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:14, color:'#fff' }}>
                Morocco<span style={{ color:'#C1272D' }}>2030</span>
              </div>
              <div style={{ fontFamily:'Amiri,serif', fontStyle:'italic', fontSize:11, color:'rgba(0,98,51,.8)' }}>المغرب</div>
            </div>
          </div>
          <button onClick={() => setMenuOpen(false)}
            style={{ width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,.6)' }}>
            <span className="material-icons" style={{ fontSize:18 }}>close</span>
          </button>
        </div>

        {/* User info (if logged in) */}
        {isLoggedIn && (
          <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:42, height:42, borderRadius:'50%', background:accentColor, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:15, color:'#fff', flexShrink:0, position:'relative' }}>
              {user.imageUrl
                ? <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                : user.initials || "?"
              }
              <span style={{ position:'absolute', bottom:1, right:1, width:9, height:9, borderRadius:'50%', background:'#3dba7a', border:'2px solid rgba(45,10,14,.99)' }} />
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.fullName}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <div style={{ padding:'10px 12px' }}>
          <div style={{ fontSize:9, fontFamily:'Syne,sans-serif', fontWeight:700, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.1em', padding:'8px 10px 6px' }}>Navigation</div>
          {NAV_LINKS.map(({ href, en, icon, color }) => (
            <Link key={en} href={href} onClick={() => setMenuOpen(false)}>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 10px', borderRadius:10, transition:'background .15s', cursor:'pointer' }}
                onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,.06)'}
                onMouseOut={e  => e.currentTarget.style.background='transparent'}>
                <span className="material-icons" style={{ fontSize:18, color }}>{icon}</span>
                <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'rgba(255,255,255,.8)' }}>{en}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Account links */}
        {isLoggedIn ? (
          <div style={{ padding:'4px 12px', borderTop:'1px solid rgba(255,255,255,.07)' }}>
            <div style={{ fontSize:9, fontFamily:'Syne,sans-serif', fontWeight:700, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.1em', padding:'12px 10px 6px' }}>Account</div>
            {MENU_ITEMS.map(({ href, label, icon }) => (
              <Link key={label} href={href} onClick={() => setMenuOpen(false)}>
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 10px', borderRadius:10, transition:'background .15s', cursor:'pointer' }}
                  onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,.06)'}
                  onMouseOut={e  => e.currentTarget.style.background='transparent'}>
                  <span className="material-icons" style={{ fontSize:18, color:'rgba(255,255,255,.5)' }}>{icon}</span>
                  <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'rgba(255,255,255,.8)' }}>{label}</span>
                </div>
              </Link>
            ))}
            <div style={{ margin:'8px 0', height:1, background:'rgba(255,255,255,.07)' }} />
            <button onClick={handleLogout}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 10px', borderRadius:10, background:'transparent', border:'none', cursor:'pointer', transition:'background .15s' }}
              onMouseOver={e => e.currentTarget.style.background='rgba(193,39,45,.1)'}
              onMouseOut={e  => e.currentTarget.style.background='transparent'}>
              <span className="material-icons" style={{ fontSize:18, color:'#C1272D' }}>logout</span>
              <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'#C1272D' }}>Sign Out</span>
            </button>
          </div>
        ) : (
          <div style={{ padding:'12px' }}>
            <Link href="/Login" onClick={() => setMenuOpen(false)}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', borderRadius:12, background:'linear-gradient(to right,#C1272D,#a01f24)', cursor:'pointer' }}>
                <span className="material-icons" style={{ fontSize:16, color:'#fff' }}>login</span>
                <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'#fff', textTransform:'uppercase', letterSpacing:'.05em' }}>Login</span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}