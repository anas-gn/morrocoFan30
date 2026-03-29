"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

/* ── helpers ── */
const initials = n => n ? n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
const hue = n => {
  const c = ["#C1272D", "#006233", "#b45309", "#0369a1", "#7c3aed", "#0f766e"];
  let h = 0;
  for (const x of (n || "")) h = (h * 31 + x.charCodeAt(0)) % c.length;
  return c[h];
};

/* ── sidebar nav ── */
const NAV = [
  { label: "Vue d'ensemble", icon: "dashboard",      href: "/Admin/Dashboard"   },
  { label: "Matches",        icon: "sports_soccer",  href: "/Admin/Matches"     },
  { label: "Équipes",        icon: "groups",         href: "/Admin/Teams"       },
  { label: "Groupes",        icon: "diversity_3",    href: "/Admin/Groups"      },
  { label: "Joueurs",        icon: "person",         href: "/Admin/Players"     },
  { label: "Supporters",     icon: "favorite",       href: "/Admin/Supporters"  },
  { label: "Villes",         icon: "location_city",  href: "/Admin/Cities"      },
  { label: "Stades",         icon: "stadium",        href: "/Admin/Stades"      },
  { label: "Attractions",    icon: "attractions",    href: "/Admin/Attractions" },
  { label: "Prédictions",    icon: "psychology",     href: "/Admin/Predictions" },
];

/* ── Bottom nav items (subset, most used) ── */
const BOTTOM_NAV = [
  { label: "Accueil",    icon: "dashboard",     href: "/Admin/Dashboard"  },
  { label: "Matches",    icon: "sports_soccer", href: "/Admin/Matches"    },
  { label: "Équipes",    icon: "groups",        href: "/Admin/Teams"      },
  { label: "Joueurs",    icon: "person",        href: "/Admin/Players"    },
];

export default function SidebarRespo() {
  const router = useRouter();
  const [collapsed, setCollapsed]   = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);

  const [userName,  setUserName]  = useState("Admin");
  const [userEmail, setUserEmail] = useState("");

  const drawerRef = useRef(null);

  /* detect mobile */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* close drawer on route change */
  useEffect(() => { setDrawerOpen(false); }, [router.pathname]);

  /* close drawer on outside click */
  useEffect(() => {
    if (!drawerOpen) return;
    const handle = e => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) setDrawerOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [drawerOpen]);

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Admin");
    setUserEmail(localStorage.getItem("userEmail") || "");
  }, []);

  const logout = () => { localStorage.clear(); router.push("/Login"); };

  /* ─────────────────────────────────────────────
     MOBILE LAYOUT
  ───────────────────────────────────────────── */
  if (isMobile) {
    return (
      <>
        <style jsx global>{`
          /* prevent body scroll when drawer open */
          body.drawer-lock { overflow: hidden }

          /* ── drawer overlay ── */
          .mob-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,.6);
            backdrop-filter: blur(3px);
            z-index: 200;
            animation: fadeIn .2s ease;
          }
          @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }

          /* ── drawer panel ── */
          .mob-drawer {
            position: fixed; top: 0; left: 0; bottom: 0;
            width: 360px;
            background: linear-gradient(180deg,#0f0413 0%,#08020c 100%);
            border-right: 1px solid rgba(193,39,45,.18);
            z-index: 201;
            display: flex; flex-direction: column;
            transform: translateX(-100%);
            transition: transform .28s cubic-bezier(.4,0,.2,1);
            overflow: hidden;
          }
          .mob-drawer.open { transform: translateX(0) }

          /* ── bottom nav ── */
          .bottom-nav {
            position: fixed; bottom: 0; left: 0; right: 0;
            height: 62px;
            background: rgba(8,2,12,.92);
            backdrop-filter: blur(16px);
            border-top: 1px solid rgba(193,39,45,.15);
            display: flex; align-items: stretch;
            z-index: 100;
          }
          .bn-item {
            flex: 1; display: flex; flex-direction: column;
            align-items: center; justify-content: center; gap: 3px;
            color: rgba(255,255,255,.35);
            font-size: 9.5px; font-family: 'Syne', sans-serif; font-weight: 600;
            cursor: pointer; border: none; background: none;
            transition: color .18s;
            text-decoration: none;
          }
          .bn-item.active { color: #C1272D }
          .bn-item:not(.active):hover { color: rgba(255,255,255,.65) }
          .bn-item .mi { font-size: 22px }

          /* more button */
          .bn-more {
            flex: 1; display: flex; flex-direction: column;
            align-items: center; justify-content: center; gap: 3px;
            color: rgba(255,255,255,.35);
            font-size: 9.5px; font-family: 'Syne', sans-serif; font-weight: 600;
            cursor: pointer; border: none; background: none;
            transition: color .18s;
          }
          .bn-more.open, .bn-more:hover { color: rgba(255,255,255,.75) }

          /* active pip */
          .pip {
            width: 4px; height: 4px; border-radius: 50%;
            background: #C1272D;
            margin-top: 2px;
          }

          /* ── nav item inside drawer ── */
          .d-nav-item {
            display: flex; align-items: center; gap: 12px;
            padding: 10px 16px; margin: 2px 8px; border-radius: 11px;
            cursor: pointer; transition: all .18s;
            color: rgba(255,255,255,.38); font-family: 'Syne', sans-serif;
            font-size: 13px; font-weight: 600; white-space: nowrap;
            text-decoration: none;
          }
          .d-nav-item:hover  { background: rgba(193,39,45,.1); color: rgba(255,255,255,.75) }
          .d-nav-item.active {
            background: linear-gradient(135deg,rgba(193,39,45,.22),rgba(193,39,45,.08));
            color: #fff; border: 1px solid rgba(193,39,45,.2);
          }
          .d-nav-item .mi { font-size: 20px; flex-shrink: 0 }

          /* space for fixed bottom nav */
          .mob-page-pad { padding-bottom: 62px }

          ::-webkit-scrollbar       { width: 4px }
          ::-webkit-scrollbar-track { background: transparent }
          ::-webkit-scrollbar-thumb { background: rgba(193,39,45,.3); border-radius: 2px }
        `}</style>

        {/* ── Overlay ── */}
        {drawerOpen && (
          <div className="mob-overlay" onClick={() => setDrawerOpen(false)} />
        )}

        {/* ── Drawer ── */}
        <div ref={drawerRef} className={`mob-drawer${drawerOpen ? " open" : ""}`}>
          {/* Brand */}
          <div style={{ padding: "16px 14px 14px", borderBottom: "1px solid rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <img src="/images/logo.png" alt="" style={{ width: 34, height: 34, objectFit: "contain" }} />
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color: "#fff" }}>MoroccoFan2030</div>
                <div style={{ fontFamily: "'Amiri',serif", fontSize: 11, color: "rgba(255,255,255,.28)", marginTop: 1 }}>المغرب ٢٠٣٠</div>
              </div>
            </div>
            {/* close button */}
            <button onClick={() => setDrawerOpen(false)} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, color: "rgba(255,255,255,.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 5 }}>
              <span className="material-icons" style={{ fontSize: 18 }}>close</span>
            </button>
          </div>

          {/* Nav links */}
          <nav style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
            {NAV.map(({ label, icon, href }) => {
              const active = router.pathname === href;
              return (
                <Link key={href} href={href} className={`d-nav-item${active ? " active" : ""}`}>
                  <span className="material-icons mi">{icon}</span>
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User footer */}
          <div style={{ padding: "10px 8px", borderTop: "1px solid rgba(255,255,255,.05)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,.035)", marginBottom: 6 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: hue(userName), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 10, color: "#fff", flexShrink: 0 }}>
                {initials(userName)}
              </div>
              <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</div>
              </div>
            </div>
            <div className="d-nav-item" onClick={logout} style={{ color: "#ef4444" }}>
              <span className="material-icons mi">logout</span>
              <span>Déconnexion</span>
            </div>
          </div>
        </div>

        {/* ── Bottom navigation bar ── */}
        <nav className="bottom-nav">
          {BOTTOM_NAV.map(({ label, icon, href }) => {
            const active = router.pathname === href;
            return (
              <Link key={href} href={href} className={`bn-item${active ? " active" : ""}`}>
                <span className="material-icons mi">{icon}</span>
                <span>{label}</span>
                {active && <div className="pip" />}
              </Link>
            );
          })}

          {/* "More" button opens drawer */}
          <button className={`bn-more${drawerOpen ? " open" : ""}`} onClick={() => setDrawerOpen(p => !p)}>
            <span className="material-icons mi" style={{ fontSize: 22 }}>menu</span>
            <span>Plus</span>
          </button>
        </nav>
      </>
    );
  }

  /* ─────────────────────────────────────────────
     DESKTOP LAYOUT  (original behaviour)
  ───────────────────────────────────────────── */
  return (
    <>
      <style jsx global>{`
        .sidebar {
          width: var(--sw, 240px);
          background: linear-gradient(180deg,#0f0413 0%,#08020c 100%);
          border-right: 1px solid rgba(193,39,45,.12);
          display: flex; flex-direction: column;
          z-index: 50; transition: width .28s cubic-bezier(.4,0,.2,1); overflow: hidden;
        }
        .sidebar.col { --sw: 66px }

        .nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 16px; margin: 2px 8px; border-radius: 11px;
          cursor: pointer; transition: all .18s;
          color: rgba(255,255,255,.38); font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden;
          text-decoration: none;
        }
        .nav-item:hover  { background: rgba(193,39,45,.1); color: rgba(255,255,255,.75) }
        .nav-item.active {
          background: linear-gradient(135deg,rgba(193,39,45,.22),rgba(193,39,45,.08));
          color: #fff; border: 1px solid rgba(193,39,45,.2);
        }
        .nav-item .mi { font-size: 20px; flex-shrink: 0 }

        ::-webkit-scrollbar       { width: 4px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: rgba(193,39,45,.3); border-radius: 2px }
      `}</style>

      <div className={`sidebar${collapsed ? " col" : ""}`}>

        {/* Brand */}
        <div style={{ padding: "16px 14px 14px", borderBottom: "1px solid rgba(255,255,255,.05)", display: "flex", alignItems: "center", gap: 11, flexShrink: 0 }}>
          <img src="/images/logo.png" alt="" style={{ width: 36, height: 36, objectFit: "contain", flexShrink: 0 }} />
          {!collapsed && (
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color: "#fff", whiteSpace: "nowrap" }}>MoroccoFan2030</div>
              <div style={{ fontFamily: "'Amiri',serif", fontSize: 11, color: "rgba(255,255,255,.28)", marginTop: 1 }}>المغرب ٢٠٣٠</div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(p => !p)}
          style={{ margin: "10px 8px 4px", padding: "8px", borderRadius: 9, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.4)", transition: "all .18s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(193,39,45,.12)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.04)"}
        >
          <span className="material-icons" style={{ fontSize: 18 }}>{collapsed ? "chevron_right" : "chevron_left"}</span>
        </button>

        {/* Nav links */}
        <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "6px 0" }}>
          {NAV.map(({ label, icon, href }) => {
            const active = router.pathname === href;
            return (
              <Link key={href} href={href} className={`nav-item${active ? " active" : ""}`} title={collapsed ? label : ""}>
                <span className="material-icons mi">{icon}</span>
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div style={{ padding: "10px 8px", borderTop: "1px solid rgba(255,255,255,.05)", flexShrink: 0 }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,.035)", marginBottom: 6 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: hue(userName), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 10, color: "#fff", flexShrink: 0 }}>
                {initials(userName)}
              </div>
              <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</div>
              </div>
            </div>
          )}
          <div className="nav-item" onClick={logout} style={{ color: "#ef4444" }} title={collapsed ? "Déconnexion" : ""}>
            <span className="material-icons mi">logout</span>
            {!collapsed && <span>Déconnexion</span>}
          </div>
        </div>

      </div>
    </>
  );
}
