"use client";
import { useState } from "react";
import { useRouter } from "next/router";

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
  { label: "Vue d'ensemble", icon: "dashboard",      href: "/Dashboard"    },
  { label: "Matches",        icon: "sports_soccer",  href: "/MatchesRespo" },
  { label: "Équipes",        icon: "groups",         href: "/TeamsRespo"        },
  { label: "Joueurs",        icon: "person",         href: "/PlayersRespo"      },
  { label: "Supporters",     icon: "favorite",       href: "/SupportersRespo"   },
  { label: "Villes",         icon: "location_city",  href: "/CitiesRespo"       },
  { label: "Stades",         icon: "stadium",        href: "/StadesRespo"       },
  { label: "Attractions",    icon: "attractions",    href: "/AttractionsRespo"  },
  { label: "Prédictions",    icon: "psychology",     href: "/PredictionsRespo"  },
  { label: "News",           icon: "article",        href: "/NewsRespo"     },
  { label: "Culture",        icon: "event_busy",     href: "/CultureRespo"  },
];

export default function SidebarRespo() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const userName  = typeof window !== "undefined" ? localStorage.getItem("userName")  || "Admin" : "Admin";
  const userEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") || ""      : "";
  const logout    = () => { localStorage.clear(); router.push("/Login"); };

  return (
    <>
      <style jsx global>{`
        /* ── sidebar ── */
        .sidebar {
          position: fixed; left: 0; top: 0; bottom: 0;
          width: var(--sw, 240px);
          background: linear-gradient(180deg, #0f0413 0%, #08020c 100%);
          border-right: 1px solid rgba(193,39,45,.12);
          display: flex; flex-direction: column;
          z-index: 50; transition: width .28s cubic-bezier(.4,0,.2,1); overflow: hidden;
        }
        .sidebar.col { --sw: 66px }

        /* ── nav item ── */
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
          background: linear-gradient(135deg, rgba(193,39,45,.22), rgba(193,39,45,.08));
          color: #fff; border: 1px solid rgba(193,39,45,.2);
        }
        .nav-item .mi { font-size: 20px; flex-shrink: 0 }

        /* ── scrollbar ── */
        ::-webkit-scrollbar       { width: 4px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: rgba(193,39,45,.3); border-radius: 2px }

        @media(max-width:900px) { .sidebar { --sw: 66px } }
      `}</style>

      <div className={`sidebar${collapsed ? " col" : ""}`}>

        {/* ── Brand ── */}
        <div style={{ padding: "16px 14px 14px", borderBottom: "1px solid rgba(255,255,255,.05)", display: "flex", alignItems: "center", gap: 11, flexShrink: 0 }}>
          <img src="/images/logo.png" alt="" style={{ width: 36, height: 36, objectFit: "contain", flexShrink: 0 }} />
          {!collapsed && (
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color: "#fff", whiteSpace: "nowrap" }}>MoroccoFan2030</div>
              <div style={{ fontFamily: "'Amiri',serif", fontSize: 11, color: "rgba(255,255,255,.28)", marginTop: 1 }}>المغرب ٢٠٣٠</div>
            </div>
          )}
        </div>

        {/* ── Collapse toggle ── */}
        <button
          onClick={() => setCollapsed(p => !p)}
          style={{ margin: "10px 8px 4px", padding: "8px", borderRadius: 9, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.4)", transition: "all .18s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(193,39,45,.12)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.04)"}
        >
          <span className="material-icons" style={{ fontSize: 18 }}>{collapsed ? "chevron_right" : "chevron_left"}</span>
        </button>

        {/* ── Nav links ── */}
        <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "6px 0" }}>
          {NAV.map(({ label, icon, href }) => {
            const active = router.pathname === href;
            return (
              <a key={href} href={href} className={`nav-item${active ? " active" : ""}`} title={collapsed ? label : ""}>
                <span className="material-icons mi">{icon}</span>
                {!collapsed && <span>{label}</span>}
              </a>
            );
          })}
        </nav>

        {/* ── User footer ── */}
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