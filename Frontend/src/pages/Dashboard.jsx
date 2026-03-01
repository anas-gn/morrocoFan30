"use client";
import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import MatchesRespo from "./matchesRespo";

const BASE = "https://anas-gana1-fandb-backend.hf.space/api";

const sf = async (url, opts) => {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(r.status);
  const t = await r.text();
  try { return JSON.parse(t); } catch { return t; }
};

const initials = n => n ? n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
const hue = n => {
  const c = ["#C1272D","#006233","#b45309","#0369a1","#7c3aed","#0f766e"];
  let h = 0;
  for (const x of (n||"")) h = (h*31+x.charCodeAt(0))%c.length;
  return c[h];
};
const statusCol = s => {
  const sl = (s||"").toLowerCase();
  if (["live","started","direct"].includes(sl)) return { bg:"rgba(193,39,45,.18)", color:"#f87171", border:"rgba(193,39,45,.4)" };
  if (sl==="finished") return { bg:"rgba(0,98,51,.15)", color:"#4ade80", border:"rgba(0,98,51,.35)" };
  if (sl==="halftime") return { bg:"rgba(251,191,36,.15)", color:"#fbbf24", border:"rgba(251,191,36,.35)" };
  return { bg:"rgba(255,255,255,.06)", color:"rgba(255,255,255,.45)", border:"rgba(255,255,255,.12)" };
};

const NAV = [
  { id:"overview",    icon:"dashboard",     label:"Vue d'ensemble" },
  { id:"matches",     icon:"sports_soccer", label:"Matches"        },
  { id:"teams",       icon:"groups",        label:"Équipes"        },
  { id:"players",     icon:"person",        label:"Joueurs"        },
  { id:"supporters",  icon:"favorite",      label:"Supporters"     },
  { id:"cities",      icon:"location_city", label:"Villes"         },
  { id:"stades",      icon:"stadium",       label:"Stades"         },
  { id:"attractions", icon:"attractions",   label:"Attractions"    },
  { id:"predictions", icon:"psychology",    label:"Prédictions"    },
];

/* ── placeholder until each tab is built ── */
function ComingSoon({ label, icon }) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:360,gap:16}}>
      <div style={{width:72,height:72,borderRadius:"50%",background:"rgba(193,39,45,.07)",border:"1px solid rgba(193,39,45,.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span className="material-icons" style={{fontSize:32,color:"rgba(193,39,45,.35)"}}>{icon||"construction"}</span>
      </div>
      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:"rgba(255,255,255,.18)"}}>{label}</div>
      <div style={{fontSize:12,color:"rgba(255,255,255,.15)",fontFamily:"'Inter',sans-serif"}}>Cette section sera disponible prochainement.</div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [tab,           setTab]        = useState("overview");
  const [sideCollapsed, setSide]       = useState(false);
  const [loading,       setLoading]    = useState(true);

  /* overview-only data */
  const [matches,     setMatches]     = useState([]);
  const [teams,       setTeams]       = useState([]);
  const [supporters,  setSupporters]  = useState([]);
  const [cities,      setCities]      = useState([]);
  const [stades,      setStades]      = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [topScorers,  setTopScorers]  = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  /* auth guard */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("userType");
    if (!t) { router.push("/Login"); return; }
    if (t === "SUPPORTER") { router.push("/Acceuil"); return; }
    loadAll();
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [mat, tm, sup, cit, st, pred, lb, sc] = await Promise.all([
      sf(`${BASE}/matches/matches/all`).catch(()=>[]),
      sf(`${BASE}/teams/teams/all`).catch(()=>[]),
      sf(`${BASE}/supporters/all`).catch(()=>[]),
      sf(`${BASE}/acceuil/CityHosts/all`).catch(()=>[]),
      sf(`${BASE}/acceuil/stade/all`).catch(()=>[]),
      sf(`${BASE}/predictions/all`).catch(()=>[]),
      sf(`${BASE}/predictions/leaderboard/top10`).catch(()=>[]),
      sf(`${BASE}/players/top/scorers?limit=5`).catch(()=>[]),
    ]);
    setMatches(Array.isArray(mat) ? mat : []);
    setTeams(Array.isArray(tm) ? tm : []);
    setSupporters(Array.isArray(sup) ? sup : []);
    setCities(Array.isArray(cit) ? cit : []);
    setStades(Array.isArray(st) ? st : []);
    setPredictions(Array.isArray(pred) ? pred : []);
    setLeaderboard(Array.isArray(lb) ? lb : []);
    setTopScorers(Array.isArray(sc) ? sc : []);
    setLoading(false);
  }, []);

  /* backend uses "statut" not "status" */
  const normS = s => (s||"").toLowerCase();
  const liveCount     = matches.filter(m => ["live","started","direct","commence"].includes(normS(m.statut))).length;
  const finishedCount = matches.filter(m => ["finished","termine"].includes(normS(m.statut))).length;

  const logout   = () => { localStorage.clear(); router.push("/Login"); };
  const userName  = typeof window !== "undefined" ? localStorage.getItem("userName")  || "Admin" : "Admin";
  const userEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") || ""      : "";

  return (
    <>
      <Head>
        <title>Dashboard · MoroccoFan2030</title>
        <link rel="icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&family=Amiri:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family:'Inter',sans-serif; background:#07030a; color:#fff; -webkit-font-smoothing:antialiased; margin:0; overflow:hidden; }

        @keyframes db-up   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes db-spin  { to{transform:rotate(360deg)} }
        @keyframes db-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes db-sc    { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }

        .db-spin  { animation:db-spin  1s   linear   infinite }
        .db-pulse { animation:db-pulse 1.4s ease     infinite }
        .db-up    { animation:db-up    .45s cubic-bezier(.22,.68,0,1.2) both }

        /* sidebar */
        .db-side {
          position:fixed; left:0; top:0; bottom:0;
          width:var(--sw,240px);
          background:linear-gradient(180deg,#100510 0%,#0a020d 100%);
          border-right:1px solid rgba(193,39,45,.15);
          display:flex; flex-direction:column;
          z-index:50; transition:width .25s ease; overflow:hidden;
        }
        .db-side.collapsed { --sw:64px }
        .db-main {
          margin-left:var(--sw,240px);
          height:100vh; overflow-y:auto;
          transition:margin-left .25s ease;
          display:flex; flex-direction:column;
        }
        .db-side.collapsed ~ .db-main { margin-left:64px }

        /* nav */
        .nav-item {
          display:flex; align-items:center; gap:12px;
          padding:10px 16px; margin:2px 8px; border-radius:10px;
          cursor:pointer; transition:all .18s;
          color:rgba(255,255,255,.45); font-family:'Syne',sans-serif;
          font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden;
        }
        .nav-item:hover  { background:rgba(193,39,45,.12); color:rgba(255,255,255,.8) }
        .nav-item.active { background:linear-gradient(135deg,rgba(193,39,45,.25),rgba(193,39,45,.1)); color:#fff; border:1px solid rgba(193,39,45,.2) }
        .nav-item .mi   { font-size:19px; flex-shrink:0 }

        /* shared */
        .db-card { background:rgba(255,255,255,.035); border:1px solid rgba(255,255,255,.07); border-radius:14px }
        .db-trow { display:grid; align-items:center; gap:12px; padding:12px 18px; border-bottom:1px solid rgba(255,255,255,.04); transition:background .15s }
        .db-trow:hover { background:rgba(255,255,255,.025) }
        .db-trow:last-child { border-bottom:none }

        /* buttons */
        .btn-p { display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:#C1272D;color:#fff;border:none;border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s }
        .btn-p:hover { background:#a01f24;transform:translateY(-1px) }
        .btn-p:disabled { opacity:.5;cursor:not-allowed;transform:none }
        .btn-s { display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.1);border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s }
        .btn-s:hover { background:rgba(255,255,255,.1) }
        .ibtn { width:28px;height:28px;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;color:rgba(255,255,255,.45) }
        .ibtn:hover { border-color:#C1272D;color:#C1272D;background:rgba(193,39,45,.1) }

        /* kpi */
        .kpi { background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:16px 20px;display:flex;flex-direction:column;gap:4px;transition:border-color .2s }
        .kpi:hover { border-color:rgba(193,39,45,.3) }

        /* badge */
        .badge { display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border:1px solid;font-family:'Syne',sans-serif }

        @media(max-width:768px){
          .db-side { --sw:64px }
          .db-side.collapsed { --sw:0px; display:none }
        }
      `}</style>

      {/* ══════════ SIDEBAR ══════════ */}
      <div className={`db-side${sideCollapsed?" collapsed":""}`}>

        {/* brand */}
        <div style={{padding:"18px 16px 14px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
          <img src="/images/logo.png" alt="logo" style={{width:34,height:34,objectFit:"contain",flexShrink:0}}/>
          {!sideCollapsed&&(
            <div style={{overflow:"hidden"}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color:"#fff",whiteSpace:"nowrap"}}>MoroccoFan2030</div>
              <div style={{fontFamily:"'Amiri',serif",fontSize:11,color:"rgba(255,255,255,.3)",marginTop:1}}>المغرب ٢٠٣٠</div>
            </div>
          )}
        </div>

        {/* nav */}
        <nav style={{flex:1,overflowY:"auto",padding:"10px 0",overflowX:"hidden"}}>
          {NAV.map(({id,icon,label})=>(
            <div key={id} className={`nav-item${tab===id?" active":""}`} onClick={()=>setTab(id)} title={sideCollapsed?label:""}>
              <span className="material-icons mi">{icon}</span>
              {!sideCollapsed&&<span>{label}</span>}
            </div>
          ))}
        </nav>

        {/* user + logout */}
        <div style={{padding:"12px 8px",borderTop:"1px solid rgba(255,255,255,.06)",flexShrink:0}}>
          {!sideCollapsed&&(
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:10,background:"rgba(255,255,255,.04)",marginBottom:8}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:hue(userName),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:11,color:"#fff",flexShrink:0}}>
                {initials(userName)}
              </div>
              <div style={{overflow:"hidden",flex:1}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{userName}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,.35)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{userEmail}</div>
              </div>
            </div>
          )}
          <div className="nav-item" onClick={logout} style={{color:"#ef4444"}} title="Déconnexion">
            <span className="material-icons mi">logout</span>
            {!sideCollapsed&&<span>Déconnexion</span>}
          </div>
        </div>
      </div>

      {/* ══════════ MAIN ══════════ */}
      <div className="db-main">

        {/* topbar */}
        <div style={{position:"sticky",top:0,zIndex:40,background:"rgba(7,3,10,.92)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",padding:"0 24px",height:56,gap:16,flexShrink:0}}>
          <button onClick={()=>setSide(p=>!p)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,.5)",display:"flex",padding:4}}>
            <span className="material-icons" style={{fontSize:20}}>{sideCollapsed?"menu_open":"menu"}</span>
          </button>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14,color:"#fff",flex:1}}>
            {NAV.find(n=>n.id===tab)?.label||"Dashboard"}
          </div>
          {/* refresh only on overview — each tab manages its own */}
          {tab==="overview"&&(
            <button className="btn-p" style={{padding:"7px 14px",fontSize:11}} onClick={loadAll}>
              <span className="material-icons" style={{fontSize:14}}>refresh</span>
            </button>
          )}
        </div>

        {/* ── CONTENT ── */}
        {/* matches tab gets zero padding so its own header fits flush */}
        <div style={{flex:1,padding:tab==="matches"?"0":"24px",minHeight:0,overflowY:tab==="matches"?"hidden":"auto"}}>

          {/* loading (overview) */}
          {loading&&tab==="overview"&&(
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,gap:14}}>
              <div className="db-spin" style={{width:34,height:34,border:"3px solid #C1272D",borderTopColor:"transparent",borderRadius:"50%"}}/>
              <span style={{fontFamily:"'Syne',sans-serif",color:"rgba(255,255,255,.4)",fontSize:14}}>Chargement…</span>
            </div>
          )}

          {/* ════ OVERVIEW ════ */}
          {!loading&&tab==="overview"&&(
            <div className="db-up">

              {/* KPI */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:12,marginBottom:24}}>
                {[
                  {label:"Matches",    val:matches.length,    icon:"sports_soccer",        color:"#fbbf24"},
                  {label:"En Direct",  val:liveCount,          icon:"radio_button_checked", color:"#f87171"},
                  {label:"Terminés",   val:finishedCount,      icon:"check_circle",         color:"#4ade80"},
                  {label:"Équipes",    val:teams.length,       icon:"groups",               color:"#a78bfa"},
                  {label:"Supporters", val:supporters.length,  icon:"favorite",             color:"#C1272D"},
                  {label:"Stades",     val:stades.length,      icon:"stadium",              color:"#0ea5e9"},
                  {label:"Villes",     val:cities.length,      icon:"location_city",        color:"#10b981"},
                  {label:"Prédictions",val:predictions.length, icon:"psychology",           color:"#f59e0b"},
                ].map(({label,val,icon,color})=>(
                  <div key={label} className="kpi">
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span className="material-icons" style={{fontSize:16,color,opacity:.85}}>{icon}</span>
                      <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color}}>{val}</span>
                    </div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".07em"}}>{label}</div>
                  </div>
                ))}
              </div>

              {/* derniers matches */}
              <div className="db-card" style={{marginBottom:20}}>
                <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14,color:"#fff"}}>Derniers Matches</span>
                  <button className="btn-s" style={{padding:"5px 12px",fontSize:11}} onClick={()=>setTab("matches")}>Voir tout →</button>
                </div>
                {matches.slice(0,6).map((m, i) => {
                  const t1 = m.matchTeams?.[0] || {};
                  const t2 = m.matchTeams?.[1] || {};
                  const sc = statusCol(m.statut);
                  return (
                    <div key={m.id||i} className="db-trow" style={{gridTemplateColumns:"1fr 70px 1fr 120px 100px",cursor:"pointer"}} onClick={()=>setTab("matches")}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"#fff",textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t1.teamName||"—"}</div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:13,color:"#C1272D",textAlign:"center"}}>{t1.goals ?? "-"} : {t2.goals ?? "-"}</div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:12,color:"rgba(255,255,255,.6)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t2.teamName||"—"}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.38)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.stadeName||"—"}</div>
                      <div><span className="badge" style={{background:sc.bg,color:sc.color,borderColor:sc.border}}>{m.statut||"—"}</span></div>
                    </div>
                  );
                })}
              </div>

              {/* top scorers + leaderboard */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div className="db-card">
                  <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",gap:8}}>
                    <span className="material-icons" style={{fontSize:15,color:"#4ade80"}}>sports_soccer</span>
                    <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color:"#fff"}}>Top Buteurs</span>
                  </div>
                  {topScorers.slice(0,5).map((p,i)=>(
                    <div key={p.id||i} style={{display:"grid",gridTemplateColumns:"36px 1fr 60px",alignItems:"center",gap:10,padding:"10px 18px",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,textAlign:"center"}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":<span style={{color:"rgba(255,255,255,.3)"}}>#{i+1}</span>}</div>
                      <div>
                        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"#fff"}}>{p.name}</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{p.team}</div>
                      </div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color:"#4ade80",textAlign:"right"}}>{p.goals} ⚽</div>
                    </div>
                  ))}
                </div>
                <div className="db-card">
                  <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",gap:8}}>
                    <span className="material-icons" style={{fontSize:15,color:"#fbbf24"}}>emoji_events</span>
                    <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color:"#fff"}}>Leaderboard</span>
                  </div>
                  {leaderboard.slice(0,5).map((s,i)=>(
                    <div key={s.id||i} style={{display:"grid",gridTemplateColumns:"36px 1fr 64px",alignItems:"center",gap:10,padding:"10px 18px",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,textAlign:"center"}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":<span style={{color:"rgba(255,255,255,.3)"}}>#{i+1}</span>}</div>
                      <div>
                        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,.35)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.email}</div>
                      </div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color:"#C1272D",textAlign:"right"}}>{s.totalPoints} pts</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ MATCHES ← composant dédié ════ */}
          {tab==="matches" && <MatchesRespo />}

          {/* ════ PROCHAINES PAGES (à construire étape par étape) ════ */}
          {tab==="teams"       && <ComingSoon label="Équipes"     icon="groups"        />}
          {tab==="players"     && <ComingSoon label="Joueurs"     icon="person"        />}
          {tab==="supporters"  && <ComingSoon label="Supporters"  icon="favorite"      />}
          {tab==="cities"      && <ComingSoon label="Villes"      icon="location_city" />}
          {tab==="stades"      && <ComingSoon label="Stades"      icon="stadium"       />}
          {tab==="attractions" && <ComingSoon label="Attractions" icon="attractions"   />}
          {tab==="predictions" && <ComingSoon label="Prédictions" icon="psychology"    />}

        </div>
      </div>
    </>
  );
}