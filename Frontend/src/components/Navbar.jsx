"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen]         = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading]   = useState(false);
  const router    = useRouter();
  const notifRef  = useRef(null);

  const [user, setUser] = useState({
    name: "", fullName: "", email: "",
    initials: "", type: "", imageUrl: "",
  });
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [supporterId, setSupporterId] = useState(0);

  /* ── scroll ── */
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  /* ── user data ── */
  useEffect(() => {
    const loadUserData = () => {
      const name  = localStorage.getItem("userName")    || "";
      const email = localStorage.getItem("userEmail")   || "";
      const type  = localStorage.getItem("userType")    || "";
      const sid   = parseInt(localStorage.getItem("supporterId") || "0");
      const img   = localStorage.getItem("userImageUrl")|| "";
      const ok    = !!(name && email && sid);
      setIsLoggedIn(ok);
      setSupporterId(sid);
      if (ok) {
        const parts    = name.trim().split(" ");
        const initials = parts.length >= 2
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : name.slice(0, 2).toUpperCase();
        setUser({ name: parts[0] || "User", fullName: name, email, initials, type, imageUrl: img });
      }
    };
    loadUserData();
    const onSt = (e) => { if (e.key === "userName" || e.key === "supporterId" || e.key === null) loadUserData(); };
    window.addEventListener("storage", onSt);
    window.addEventListener("userLoggedIn", loadUserData);
    return () => { window.removeEventListener("storage", onSt); window.removeEventListener("userLoggedIn", loadUserData); };
  }, []);

  /* ── fetch notifications ── */
  const fetchNotifs = async (sid) => {
    if (!sid) return;
    setNotifLoading(true);
    try {
      const res  = await fetch(`https://anas-gana1-fandb-backend.hf.space/api/notifications/supporter/${sid}`);
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (_) {}
    setNotifLoading(false);
  };

  useEffect(() => { if (supporterId) fetchNotifs(supporterId); }, [supporterId]);

  /* poll every 60s */
  useEffect(() => {
    if (!supporterId) return;
    const iv = setInterval(() => fetchNotifs(supporterId), 60000);
    return () => clearInterval(iv);
  }, [supporterId]);

  /* close notif on outside click */
  useEffect(() => {
    const h = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    if (notifOpen) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [notifOpen]);

  const unread = notifications.filter(n => !n.isRead).length;

  const markRead = async (id) => {
    try {
      await fetch(`https://anas-gana1-fandb-backend.hf.space/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications(p => p.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (_) {}
  };

  const markAllRead = async () => {
    const ids = notifications.filter(n => !n.isRead).map(n => n.id);
    await Promise.all(ids.map(id => fetch(`https://anas-gana1-fandb-backend.hf.space/api/notifications/${id}/read`, { method: "PUT" })));
    setNotifications(p => p.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotif = async (id) => {
    try {
      await fetch(`https://anas-gana1-fandb-backend.hf.space/api/notifications/${id}`, { method: "DELETE" });
      setNotifications(p => p.filter(n => n.id !== id));
    } catch (_) {}
  };

  const timeAgo = (d) => {
    if (!d) return "";
    const m = Math.floor((Date.now() - new Date(d)) / 60000);
    if (m < 1)  return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  /* ── logout ── */
  const handleLogout = async () => {
    try { await fetch("https://anas-gana1-fandb-backend.hf.space/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }); } catch (_) {}
    localStorage.clear(); setIsLoggedIn(false); router.push("/Login");
  };

  const isResponsable = user.type === "RESPONSABLE";
  const accentColor   = isResponsable ? "#006233" : "#C1272D";

  const NAV_LINKS = [
    { href: "/Matches", en: "Matches", ar: "المباريات", color: "#C1272D" },
    { href: "/Teams",   en: "Teams",   ar: "الفرق",     color: "#C1272D" },
    { href: "/Groups",  en: "Groups",  ar: "المجموعات", color: "#C1272D" },
    { href: "/Stades",  en: "Stades",  ar: "ملاعب",     color: "#7c3aed" },
    { href: "/cities",  en: "Cities",  ar: "المدن",     color: "#006233" },
    { href: "/News",    en: "News",    ar: "الأخبار",   color: "#b45309" },
    { href: "/Culture", en: "Culture", ar: "الثقافة",   color: "#047857" },
  ];

  const MENU_ITEMS = [
    { href: "/Profil",  label: "Profile",   sub: "View my profile",    icon: "person" },
    { href: "/Message", label: "Community", sub: "Discussions & posts", icon: "forum"  },
  ];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=Amiri:ital,wght@0,400;1,400&display=swap');
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

        @keyframes dropIn    { from{transform:translateY(-8px) scale(.98);opacity:0} to{transform:none;opacity:1} }
        @keyframes fadeInNav { from{opacity:0} to{opacity:1} }
        @keyframes bellRing  { 0%,100%{transform:rotate(0)} 15%{transform:rotate(18deg)} 35%{transform:rotate(-14deg)} 55%{transform:rotate(10deg)} 75%{transform:rotate(-6deg)} }
        @keyframes notifSlide{ from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:none} }

        .nav-drop { animation:dropIn   .18s cubic-bezier(.16,1,.3,1); }
        .nav-fade { animation:fadeInNav .15s ease-out; }

        .navbar-shell {
          background:rgba(45,10,14,.28);
          backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
          transition:background .3s, border-color .3s, box-shadow .3s;
        }
        .navbar-shell.scrolled {
          background:rgba(45,10,14,.27);
          border-bottom-color:rgba(193,39,45,.22);
          box-shadow:0 2px 24px rgba(45,10,14,.35);
        }
        .nav-dropdown {
          background:rgba(45,10,14,.98);
          border:1px solid rgba(193,39,45,.2);
          backdrop-filter:blur(24px);
        }
        .mobile-drawer {
          background:rgba(45,10,14,.99);
          border-left:1px solid rgba(193,39,45,.18);
        }

        /* ── bell button ── */
        .nb-bell {
          position:relative;
          width:38px; height:38px; border-radius:10px;
          background:transparent; border:1px solid transparent;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all .18s; flex-shrink:0;
        }
        .nb-bell:hover { background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.07); }
        .nb-bell.ring .material-icons { animation:bellRing .55s ease; }
        .nb-badge {
          position:absolute; top:3px; right:3px;
          min-width:16px; height:16px; border-radius:999px;
          background:linear-gradient(135deg,#C1272D,#a01e23);
          border:2px solid rgba(45,10,14,.9);
          display:flex; align-items:center; justify-content:center;
          font-family:'Syne',sans-serif; font-size:9px; font-weight:800; color:#fff;
          padding:0 3px; line-height:1; pointer-events:none;
        }

        /* ── notification panel ── */
        .notif-panel {
          position:fixed; top:72px; right:22px;
          width:340px; max-height:500px;
          z-index:10001;
          background:rgba(22,6,4,.98);
          border:1px solid rgba(193,39,45,.22);
          border-radius:18px;
          box-shadow:0 24px 64px rgba(0,0,0,.65);
          overflow:hidden; display:flex; flex-direction:column;
          backdrop-filter:blur(24px);
        }
        .notif-panel-head {
          padding:13px 16px 11px;
          border-bottom:1px solid rgba(255,255,255,.07);
          display:flex; align-items:center; justify-content:space-between;
          flex-shrink:0;
        }
        .notif-list { overflow-y:auto; flex:1; }
        .notif-list::-webkit-scrollbar { width:3px; }
        .notif-list::-webkit-scrollbar-thumb { background:rgba(193,39,45,.3); border-radius:99px; }

        .notif-row {
          display:flex; align-items:flex-start; gap:10px;
          padding:11px 14px;
          border-bottom:1px solid rgba(255,255,255,.04);
          transition:background .15s; cursor:pointer;
          animation:notifSlide .22s ease both;
        }
        .notif-row:last-child { border-bottom:none; }
        .notif-row:hover { background:rgba(255,255,255,.04); }
        .notif-row.unread { background:rgba(193,39,45,.06); }
        .notif-row.unread:hover { background:rgba(193,39,45,.1); }

        .notif-panel-foot {
          padding:9px 16px; border-top:1px solid rgba(255,255,255,.07);
          flex-shrink:0;
        }

        @media(max-width:400px){
          .notif-panel { right:10px; width:calc(100vw - 20px); }
        }
      `}</style>

      {/* ══ NAVBAR ══ */}
      <nav className={`navbar-shell fixed top-0 w-full z-50 ${scrolled ? "scrolled" : ""} backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* LOGO */}
          <Link href="/Acceuil" className="flex items-center gap-3 group">
            <img src="/images/logo.png" alt="MoroccoFan2030" className="w-10 h-10 object-cover" />
            <div className="flex flex-col leading-none">
              <span style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:14, color:"#fff", letterSpacing:"-.01em", lineHeight:1.2 }}>
                Morocco<span style={{ color:"#C1272D" }}>2030</span>
              </span>
              <span style={{ fontFamily:"Amiri,serif", fontStyle:"italic", fontSize:12, color:"rgba(0,98,51,.8)", lineHeight:1.4 }}>المغرب</span>
            </div>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, en, ar, color }) => (
              <Link key={en} href={href}
                className="group px-4 py-2 rounded-lg hover:bg-white/[0.08] transition-all duration-200"
                style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:1, textDecoration:"none" }}>
                <span style={{ fontFamily:"Syne,sans-serif", fontSize:12, fontWeight:700, color:"rgba(255,255,255,.75)", textTransform:"uppercase", letterSpacing:".05em", lineHeight:1.2 }}>{en}</span>
                <span style={{ fontFamily:"Amiri,serif", fontSize:11, opacity:.6, lineHeight:1.3, color }}>{ar}</span>
              </Link>
            ))}
          </div>

          {/* ── RIGHT SECTION ── */}
          <div className="hidden md:flex items-center gap-1.5">

            {/* ── NOTIFICATION BELL ── */}
            {isLoggedIn && (
              <div ref={notifRef} style={{ position:"relative" }}>
                
                {/* ── NOTIFICATION PANEL ── */}
                {notifOpen && (
                  <div className="notif-panel nav-drop">
                    {/* head */}
                    <div className="notif-panel-head">
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span className="material-icons" style={{ fontSize:16, color:"#C1272D" }}>notifications</span>
                        <span style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:13, color:"#fff" }}>Notifications</span>
                        {unread > 0 && (
                          <span style={{ padding:"2px 8px", background:"rgba(193,39,45,.2)", border:"1px solid rgba(193,39,45,.3)", borderRadius:999, fontSize:9, fontFamily:"Syne,sans-serif", fontWeight:700, color:"#e85d65" }}>
                            {unread} new
                          </span>
                        )}
                      </div>
                      {unread > 0 && (
                        <button onClick={markAllRead}
                          style={{ fontSize:10, fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(255,255,255,.35)", background:"transparent", border:"none", cursor:"pointer", textTransform:"uppercase", letterSpacing:".06em", transition:"color .15s", padding:0 }}
                          onMouseOver={e => e.currentTarget.style.color="#fff"}
                          onMouseOut={e  => e.currentTarget.style.color="rgba(255,255,255,.35)"}>
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* list */}
                    <div className="notif-list">
                      {notifLoading ? (
                        <div style={{ padding:"36px 0", textAlign:"center" }}>
                          <span className="material-icons" style={{ fontSize:28, color:"rgba(255,255,255,.1)", display:"block", margin:"0 auto 8px" }}>hourglass_empty</span>
                          <span style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:"rgba(255,255,255,.25)" }}>Loading…</span>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div style={{ padding:"44px 16px", textAlign:"center" }}>
                          <span className="material-icons" style={{ fontSize:38, color:"rgba(255,255,255,.08)", display:"block", margin:"0 auto 10px" }}>notifications_off</span>
                          <div style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:13, color:"rgba(255,255,255,.25)" }}>No notifications yet</div>
                          <div style={{ fontFamily:"Inter,sans-serif", fontSize:11, color:"rgba(255,255,255,.18)", marginTop:4 }}>We'll let you know when something happens</div>
                        </div>
                      ) : (
                        notifications.map((n, i) => (
                          <div key={n.id} className={`notif-row${!n.isRead ? " unread" : ""}`}
                            style={{ animationDelay:`${i * 0.04}s` }}
                            onClick={() => !n.isRead && markRead(n.id)}>

                            {/* dot */}
                            <div style={{ flexShrink:0, width:8, height:8, borderRadius:"50%", marginTop:5,
                              background: n.isRead ? "rgba(255,255,255,.1)" : "#C1272D",
                              boxShadow: n.isRead ? "none" : "0 0 6px rgba(193,39,45,.7)" }} />

                            {/* text */}
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, lineHeight:1.65, margin:0,
                                color: n.isRead ? "rgba(255,255,255,.45)" : "rgba(255,255,255,.88)" }}>
                                {n.content}
                              </p>
                              <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:4 }}>
                                <span className="material-icons" style={{ fontSize:10, color:"rgba(255,255,255,.2)" }}>schedule</span>
                                <span style={{ fontFamily:"Inter,sans-serif", fontSize:10, color:"rgba(255,255,255,.28)" }}>
                                  {timeAgo(n.dateOfSend)}
                                </span>
                                {!n.isRead && (
                                  <span style={{ marginLeft:4, fontSize:9, fontFamily:"Syne,sans-serif", fontWeight:700,
                                    color:"#C1272D", textTransform:"uppercase", letterSpacing:".06em" }}>• Unread</span>
                                )}
                              </div>
                            </div>

                            {/* delete */}
                            <button onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                              style={{ flexShrink:0, width:24, height:24, borderRadius:6, background:"transparent", border:"none",
                                display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
                                opacity:.3, transition:"opacity .15s", padding:0 }}
                              onMouseOver={e => e.currentTarget.style.opacity="1"}
                              onMouseOut={e  => e.currentTarget.style.opacity=".3"}>
                              <span className="material-icons" style={{ fontSize:14, color:"#e85d65" }}>close</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* foot */}
                    {notifications.length > 0 && (
                      <div className="notif-panel-foot">
                       
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* USER / LOGIN */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => { setUserMenuOpen(v => !v); setNotifOpen(false); }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
                  style={{ background: userMenuOpen ? "rgba(255,255,255,.08)" : "transparent" }}
                  onMouseOver={e => e.currentTarget.style.background="rgba(255,255,255,.08)"}
                  onMouseOut={e  => !userMenuOpen && (e.currentTarget.style.background="transparent")}>
                  <div style={{ width:34, height:34, borderRadius:"50%", background:accentColor, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:13, color:"#fff", border:"2px solid rgba(255,255,255,.15)", flexShrink:0 }}>
                    {user.imageUrl ? <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" /> : <span>{user.initials || "?"}</span>}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:12, color:"#fff", lineHeight:1.2 }}>{user.name}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:".06em", lineHeight:1.2 }}>{isResponsable ? "Staff" : "Fan"}</div>
                  </div>
                  <span className="material-icons hidden lg:block" style={{ fontSize:16, color:"rgba(255,255,255,.4)" }}>expand_more</span>
                </button>
              </div>
            ) : (
              <Link href="/Login"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all"
                style={{ background:"linear-gradient(to right,#C1272D,#a01f24)", fontFamily:"Syne,sans-serif", textTransform:"uppercase", letterSpacing:".05em", boxShadow:"0 4px 14px rgba(193,39,45,.3)" }}>
                <span className="material-icons" style={{ fontSize:15 }}>login</span>Login
              </Link>
            )}
          </div>

          {/* BURGER */}
          <button onClick={() => setMenuOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors flex flex-col gap-1.5">
            <div style={{ width:22, height:2, background:"rgba(255,255,255,.7)", borderRadius:99 }} />
            <div style={{ width:16, height:2, background:"rgba(255,255,255,.5)", borderRadius:99 }} />
            <div style={{ width:22, height:2, background:"rgba(255,255,255,.7)", borderRadius:99 }} />
          </button>
        </div>
      </nav>

      {/* ── OVERLAYS ── */}
      {(userMenuOpen || notifOpen) && (
        <div className="fixed inset-0 z-40 nav-fade" onClick={() => { setUserMenuOpen(false); setNotifOpen(false); }} />
      )}

      {/* ── USER DROPDOWN ── */}
      {isLoggedIn && userMenuOpen && (
        <div className="hidden md:block fixed top-[76px] right-6 z-50 nav-drop" style={{ width:260 }}>
          <div className="nav-dropdown rounded-2xl shadow-2xl overflow-hidden">

            {/* user header */}
            <div style={{ padding:"16px", borderBottom:"1px solid rgba(255,255,255,.07)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ position:"relative", flexShrink:0 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:accentColor, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:14, color:"#fff" }}>
                    {user.imageUrl ? <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" /> : user.initials || "?"}
                  </div>
                  <span style={{ position:"absolute", bottom:0, right:0, width:10, height:10, borderRadius:"50%", background:"#3dba7a", border:"2px solid rgba(45,10,14,.99)" }} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:13, color:"#fff", lineHeight:1.2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.fullName || "User"}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginTop:2 }}>{user.email}</div>
                </div>
                <span style={{ fontSize:9, fontFamily:"Syne,sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:".06em", padding:"3px 8px", borderRadius:99, background:accentColor, color:"#fff", flexShrink:0 }}>
                  {isResponsable ? "Staff" : "Fan"}
                </span>
              </div>
            </div>

            {/* menu items */}
            <div style={{ padding:"6px 0" }}>

              {/* ── NOTIFICATIONS row inside dropdown ── */}
              <div
                onClick={() => { setUserMenuOpen(false); setNotifOpen(true); }}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", transition:"background .15s", cursor:"pointer" }}
                onMouseOver={e => e.currentTarget.style.background="rgba(255,255,255,.06)"}
                onMouseOut={e  => e.currentTarget.style.background="transparent"}>
                <div style={{ width:32, height:32, borderRadius:10, background:"rgba(255,255,255,.06)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, position:"relative" }}>
                  <span className="material-icons" style={{ fontSize:16, color:"rgba(255,255,255,.5)" }}>
                    {unread > 0 ? "notifications_active" : "notifications"}
                  </span>
                  {unread > 0 && (
                    <span style={{ position:"absolute", top:-3, right:-3, minWidth:14, height:14, borderRadius:999, background:"#C1272D", border:"1.5px solid rgba(45,10,14,.99)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, fontFamily:"Syne,sans-serif", fontWeight:800, color:"#fff", padding:"0 2px" }}>
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:12, color:"rgba(255,255,255,.85)", lineHeight:1.2 }}>Notifications</div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,.3)", marginTop:1 }}>
                    {unread > 0 ? `${unread} unread message${unread > 1 ? "s" : ""}` : "All caught up"}
                  </div>
                </div>
              </div>

              {MENU_ITEMS.map(({ href, label, sub, icon }) => (
                <Link key={label} href={href} onClick={() => setUserMenuOpen(false)}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", transition:"background .15s", cursor:"pointer" }}
                    onMouseOver={e => e.currentTarget.style.background="rgba(255,255,255,.06)"}
                    onMouseOut={e  => e.currentTarget.style.background="transparent"}>
                    <div style={{ width:32, height:32, borderRadius:10, background:"rgba(255,255,255,.06)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span className="material-icons" style={{ fontSize:16, color:"rgba(255,255,255,.5)" }}>{icon}</span>
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:12, color:"rgba(255,255,255,.85)", lineHeight:1.2 }}>{label}</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,.3)", marginTop:1 }}>{sub}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ margin:"0 16px", height:1, background:"rgba(255,255,255,.07)" }} />
            <div style={{ padding:"6px 0 4px" }}>
              <button onClick={handleLogout}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 16px", background:"transparent", border:"none", cursor:"pointer", transition:"background .15s" }}
                onMouseOver={e => e.currentTarget.style.background="rgba(193,39,45,.1)"}
                onMouseOut={e  => e.currentTarget.style.background="transparent"}>
                <div style={{ width:32, height:32, borderRadius:10, background:"rgba(255,255,255,.06)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span className="material-icons" style={{ fontSize:16, color:"rgba(193,39,45,.7)" }}>logout</span>
                </div>
                <span style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:12, color:"rgba(193,39,45,.8)" }}>Sign out</span>
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

        {/* header */}
        <div style={{ padding:"20px 20px 16px", borderBottom:"1px solid rgba(255,255,255,.07)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <img src="/images/logo.png" alt="" style={{ width:36, height:36, objectFit:"cover" }} />
            <div>
              <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:14, color:"#fff" }}>Morocco<span style={{ color:"#C1272D" }}>2030</span></div>
              <div style={{ fontFamily:"Amiri,serif", fontStyle:"italic", fontSize:11, color:"rgba(0,98,51,.8)" }}>المغرب</div>
            </div>
          </div>
          <button onClick={() => setMenuOpen(false)}
            style={{ width:34, height:34, borderRadius:"50%", background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.1)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"rgba(255,255,255,.6)" }}>
            <span className="material-icons" style={{ fontSize:18 }}>close</span>
          </button>
        </div>

        {/* user info */}
        {isLoggedIn && (
          <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,.07)", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:42, height:42, borderRadius:"50%", background:accentColor, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:15, color:"#fff", flexShrink:0, position:"relative" }}>
              {user.imageUrl ? <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" /> : user.initials || "?"}
              <span style={{ position:"absolute", bottom:1, right:1, width:9, height:9, borderRadius:"50%", background:"#3dba7a", border:"2px solid rgba(45,10,14,.99)" }} />
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:13, color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.fullName}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.email}</div>
            </div>
          </div>
        )}

        {/* nav links */}
        <div style={{ padding:"10px 12px" }}>
          <div style={{ fontSize:9, fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(255,255,255,.3)", textTransform:"uppercase", letterSpacing:".1em", padding:"8px 10px 6px" }}>Navigation</div>
          {NAV_LINKS.map(({ href, en, color }) => {
            const icons = { Matches:"sports_soccer", Teams:"groups", Groups:"leaderboard", Stades:"stadium", Cities:"location_city", News:"article", Culture:"temple_buddhist" };
            return (
              <Link key={en} href={href} onClick={() => setMenuOpen(false)}>
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 10px", borderRadius:10, transition:"background .15s", cursor:"pointer" }}
                  onMouseOver={e => e.currentTarget.style.background="rgba(255,255,255,.06)"}
                  onMouseOut={e  => e.currentTarget.style.background="transparent"}>
                  <div style={{ width:36, height:36, borderRadius:10, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span className="material-icons" style={{ fontSize:18, color }}>{icons[en] || "link"}</span>
                  </div>
                  <span style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:13, color:"rgba(255,255,255,.8)" }}>{en}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* account */}
        {isLoggedIn ? (
          <div style={{ padding:"4px 12px", borderTop:"1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontSize:9, fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(255,255,255,.3)", textTransform:"uppercase", letterSpacing:".1em", padding:"12px 10px 6px" }}>Account</div>

            {/* ── NOTIFICATIONS in mobile drawer ── */}
            <Link href="/Notifications" onClick={() => setMenuOpen(false)}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 10px", borderRadius:10, transition:"background .15s", cursor:"pointer" }}
                onMouseOver={e => e.currentTarget.style.background="rgba(255,255,255,.06)"}
                onMouseOut={e  => e.currentTarget.style.background="transparent"}>
                <div style={{ width:36, height:36, borderRadius:10, background:"rgba(193,39,45,.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, position:"relative" }}>
                  <span className="material-icons" style={{ fontSize:18, color:"#C1272D" }}>
                    {unread > 0 ? "notifications_active" : "notifications"}
                  </span>
                  {unread > 0 && (
                    <span style={{ position:"absolute", top:-2, right:-2, minWidth:16, height:16, borderRadius:999, background:"#C1272D", border:"1.5px solid rgba(45,10,14,.99)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontFamily:"Syne,sans-serif", fontWeight:800, color:"#fff", padding:"0 3px" }}>
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
                <div>
                  <span style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:13, color:"rgba(255,255,255,.8)", display:"block" }}>Notifications</span>
                  {unread > 0 && <span style={{ fontSize:10, color:"#e85d65", fontFamily:"Inter,sans-serif" }}>{unread} unread</span>}
                </div>
              </div>
            </Link>

            {MENU_ITEMS.map(({ href, label, icon }) => (
              <Link key={label} href={href} onClick={() => setMenuOpen(false)}>
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 10px", borderRadius:10, transition:"background .15s", cursor:"pointer" }}
                  onMouseOver={e => e.currentTarget.style.background="rgba(255,255,255,.06)"}
                  onMouseOut={e  => e.currentTarget.style.background="transparent"}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,.06)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span className="material-icons" style={{ fontSize:18, color:"rgba(255,255,255,.5)" }}>{icon}</span>
                  </div>
                  <span style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:13, color:"rgba(255,255,255,.8)" }}>{label}</span>
                </div>
              </Link>
            ))}

            <div style={{ margin:"8px 0", height:1, background:"rgba(255,255,255,.07)" }} />
            <button onClick={handleLogout}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"11px 10px", borderRadius:10, background:"transparent", border:"none", cursor:"pointer", transition:"background .15s" }}
              onMouseOver={e => e.currentTarget.style.background="rgba(193,39,45,.1)"}
              onMouseOut={e  => e.currentTarget.style.background="transparent"}>
              <div style={{ width:36, height:36, borderRadius:10, background:"rgba(193,39,45,.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span className="material-icons" style={{ fontSize:18, color:"#C1272D" }}>logout</span>
              </div>
              <span style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:13, color:"#C1272D" }}>Sign Out</span>
            </button>
          </div>
        ) : (
          <div style={{ padding:"12px" }}>
            <Link href="/Login" onClick={() => setMenuOpen(false)}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"13px", borderRadius:12, background:"linear-gradient(to right,#C1272D,#a01f24)", cursor:"pointer" }}>
                <span className="material-icons" style={{ fontSize:16, color:"#fff" }}>login</span>
                <span style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:13, color:"#fff", textTransform:"uppercase", letterSpacing:".05em" }}>Login</span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}