"use client";
import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const BASE = "https://anas-gana1-fandb-backend.hf.space/api";

/* ─────────── tiny helpers ─────────── */
const sf = async (url, opts) => {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(r.status);
  const t = await r.text();
  try { return JSON.parse(t); } catch { return t; }
};
const initials = n => n ? n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
const hue = n => { const c = ["#C1272D","#006233","#b45309","#0369a1","#7c3aed","#0f766e"]; let h = 0; for (const x of (n||"")) h = (h*31+x.charCodeAt(0))%c.length; return c[h]; };
const statusCol = s => {
  const sl = (s||"").toLowerCase();
  if (["live","started","direct"].includes(sl)) return { bg:"rgba(193,39,45,.18)", color:"#f87171", border:"rgba(193,39,45,.4)" };
  if (sl==="finished") return { bg:"rgba(0,98,51,.15)", color:"#4ade80", border:"rgba(0,98,51,.35)" };
  if (sl==="halftime") return { bg:"rgba(251,191,36,.15)", color:"#fbbf24", border:"rgba(251,191,36,.35)" };
  return { bg:"rgba(255,255,255,.06)", color:"rgba(255,255,255,.45)", border:"rgba(255,255,255,.12)" };
};

const NAV = [
  { id:"overview",     icon:"dashboard",      label:"Vue d'ensemble" },
  { id:"matches",      icon:"sports_soccer",  label:"Matches" },
  { id:"teams",        icon:"groups",         label:"Équipes" },
  { id:"players",      icon:"person",         label:"Joueurs" },
  { id:"supporters",   icon:"favorite",       label:"Supporters" },
  { id:"cities",       icon:"location_city",  label:"Villes" },
  { id:"stades",       icon:"stadium",        label:"Stades" },
  { id:"attractions",  icon:"attractions",    label:"Attractions" },
  { id:"predictions",  icon:"psychology",     label:"Prédictions" },
];

const ALL_STATUSES = ["SCHEDULED","LIVE","STARTED","DIRECT","HALFTIME","FINISHED"];

export default function Dashboard() {
  const router = useRouter();
  const [tab,         setTab]         = useState("overview");
  const [sideCollapsed, setSide]      = useState(false);
  const [toast,       setToast]       = useState(null);
  const [loading,     setLoading]     = useState(true);

  /* data */
  const [matches,     setMatches]     = useState([]);
  const [teams,       setTeams]       = useState([]);
  const [topScorers,  setTopScorers]  = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [supporters,  setSupporters]  = useState([]);
  const [cities,      setCities]      = useState([]);
  const [stades,      setStades]      = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  /* match modal */
  const [matchModal,  setMatchModal]  = useState(null);
  const [matchPlayers,setMatchPlayers]= useState([]);
  const [matchTeams,  setMatchTeams]  = useState([]);
  const [matchEvents, setMatchEvents] = useState([]);
  const [goalForm,    setGoalForm]    = useState({ teamId:"", playerId:"", minute:"" });
  const [savingGoal,  setSavingGoal]  = useState(false);
  const [savingStatus,setSavingStatus]= useState(false);
  const [loadingMatch,setLoadingMatch]= useState(false);

  /* generic CRUD modal */
  const [modal,       setModal]       = useState(null); // {type, data, entity}
  const [form,        setForm]        = useState({});
  const [saving,      setSaving]      = useState(false);

  /* search / filter */
  const [search,      setSearch]      = useState("");

  /* auth guard */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("userType");
    if (!t) { router.push("/Login"); return; }
    if (t === "SUPPORTER") { router.push("/Acceuil"); return; }
    loadAll();
  }, []);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [mat, tm, sc, ps, sup, cit, st, pred, lb] = await Promise.all([
      sf(`${BASE}/matches/matches/all`).catch(()=>[]),
      sf(`${BASE}/teams/teams/all`).catch(()=>[]),
      sf(`${BASE}/players/top/scorers?limit=20`).catch(()=>[]),
      sf(`${BASE}/players/stats`).catch(()=>null),
      sf(`${BASE}/supporters/all`).catch(()=>[]),
      sf(`${BASE}/acceuil/CityHosts/all`).catch(()=>[]),
      sf(`${BASE}/acceuil/stade/all`).catch(()=>[]),
      sf(`${BASE}/predictions/all`).catch(()=>[]),
      sf(`${BASE}/predictions/leaderboard/top10`).catch(()=>[]),
    ]);
    setMatches(Array.isArray(mat) ? mat : []);
    setTeams(Array.isArray(tm) ? tm : []);
    setTopScorers(Array.isArray(sc) ? sc : []);
    setPlayerStats(ps && typeof ps==="object" ? ps : null);
    setSupporters(Array.isArray(sup) ? sup : []);
    setCities(Array.isArray(cit) ? cit : []);
    setStades(Array.isArray(st) ? st : []);
    setPredictions(Array.isArray(pred) ? pred : []);
    setLeaderboard(Array.isArray(lb) ? lb : []);

    // load attractions for all cities
    if (Array.isArray(cit) && cit.length) {
      const attrAll = await Promise.all(cit.map(c => sf(`${BASE}/attractions/city/${c.id}`).catch(()=>[])));
      setAttractions(attrAll.flat().filter(Boolean));
    }
    setLoading(false);
  }, []);

  /* ── open match modal ── */
  const openMatchModal = async m => {
    setMatchModal(m); setMatchPlayers([]); setMatchTeams([]); setMatchEvents([]);
    setGoalForm({ teamId:"", playerId:"", minute:"" }); setLoadingMatch(true);
    try {
      const [players, events] = await Promise.all([
        sf(`${BASE}/matches/matches/players/${m.id}`).catch(()=>[]),
        sf(`${BASE}/matches/matches/${m.id}/events`).catch(()=>[]),
      ]);
      const pList = Array.isArray(players) ? players : [];
      setMatchPlayers(pList);
      setMatchEvents(Array.isArray(events) ? events : []);
      const tMap = {};
      pList.forEach(p => { if (p.teamId && p.team && !tMap[p.teamId]) tMap[p.teamId] = { id: p.teamId, name: p.team }; });
      setMatchTeams(Object.values(tMap));
    } catch (_) {}
    setLoadingMatch(false);
  };

  const changeMatchStatus = async s => {
    if (!matchModal) return;
    setSavingStatus(true);
    try {
      await fetch(`${BASE}/matches/etat/${matchModal.id}/${s}`);
      setMatchModal(p => ({ ...p, status: s }));
      setMatches(p => p.map(m => m.id===matchModal.id ? { ...m, status: s } : m));
      showToast("success", "Statut → " + s);
    } catch { showToast("error", "Erreur statut."); }
    setSavingStatus(false);
  };

  const addGoal = async () => {
    const { teamId, playerId, minute } = goalForm;
    if (!teamId || !playerId) { showToast("error", "Équipe et joueur requis."); return; }
    setSavingGoal(true);
    try {
      const min = minute ? `?minute=${minute}` : "";
      const res = await fetch(`${BASE}/matches/matches/${matchModal.id}/team/${teamId}/player/${playerId}${min}`);
      if (res.ok) {
        showToast("success", "⚽ But enregistré !");
        const ev = await sf(`${BASE}/matches/matches/${matchModal.id}/events`).catch(()=>[]);
        setMatchEvents(Array.isArray(ev) ? ev : []);
        setGoalForm({ teamId:"", playerId:"", minute:"" });
        const mat = await sf(`${BASE}/matches/matches/all`).catch(()=>[]);
        setMatches(Array.isArray(mat) ? mat : []);
        setMatchModal(p => ({ ...p, ...((Array.isArray(mat)?mat:[]).find(m=>m.id===matchModal.id)||{}) }));
      } else showToast("error", "Échec enregistrement but.");
    } catch { showToast("error", "Erreur réseau."); }
    setSavingGoal(false);
  };

  /* ── generic delete ── */
  const handleDelete = async () => {
    const { entity, data } = modal;
    setSaving(true);
    const endpoints = {
      supporter: `${BASE}/supporters/${data.id}`,
      team:      `${BASE}/teams/delete/${data.id}`,
      stade:     `${BASE}/stades/delete/${data.id}`,
      attraction:`${BASE}/attractions/${data.id}`,
    };
    try {
      const url = endpoints[entity];
      if (!url) { showToast("error","Suppression non supportée pour cet élément."); setSaving(false); return; }
      await fetch(url, { method:"DELETE" });
      showToast("success", "Supprimé !");
      setModal(null);
      loadAll();
    } catch { showToast("error", "Erreur suppression."); }
    setSaving(false);
  };

  /* ── supporter pwd change ── */
  const [pwdForm, setPwdForm] = useState({ newPassword:"", confirm:"" });
  const handlePwd = async () => {
    if (!pwdForm.newPassword) { showToast("error", "Nouveau mot de passe requis."); return; }
    if (pwdForm.newPassword !== pwdForm.confirm) { showToast("error", "Mots de passe différents."); return; }
    if (pwdForm.newPassword.length < 6) { showToast("error", "Min. 6 caractères."); return; }
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/supporters/password/${modal.data.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwdForm.newPassword }),
      });
      if (res.ok) { showToast("success", "Mot de passe modifié !"); setModal(null); }
      else showToast("error", "Modification échouée.");
    } catch { showToast("error", "Erreur réseau."); }
    setSaving(false);
  };

  /* computed */
  const liveCount     = matches.filter(m => ["live","started","direct"].includes(m.status?.toLowerCase())).length;
  const finishedCount = matches.filter(m => m.status?.toLowerCase()==="finished").length;
  const q = search.toLowerCase();
  const teamPlayers4Goal = matchPlayers.filter(p => String(p.teamId)===String(goalForm.teamId));

  const fMatches    = matches.filter(m => !q || m.team1Name?.toLowerCase().includes(q) || m.team2Name?.toLowerCase().includes(q) || m.stadeName?.toLowerCase().includes(q));
  const fTeams      = teams.filter(t => !q || t.name?.toLowerCase().includes(q) || t.country?.toLowerCase().includes(q));
  const fScorers    = topScorers.filter(p => !q || p.name?.toLowerCase().includes(q) || p.team?.toLowerCase().includes(q));
  const fSupporters = supporters.filter(s => !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q));
  const fCities     = cities.filter(c => !q || c.name?.toLowerCase().includes(q));
  const fStades     = stades.filter(s => !q || s.name?.toLowerCase().includes(q) || s.cityName?.toLowerCase().includes(q));
  const fAttr       = attractions.filter(a => !q || a.name?.toLowerCase().includes(q));
  const fPred       = predictions.filter(p => !q || p.team1Name?.toLowerCase().includes(q) || p.team2Name?.toLowerCase().includes(q));

  /* ── logout ── */
  const logout = () => { localStorage.clear(); router.push("/Login"); };

  const userName  = typeof window !== "undefined" ? localStorage.getItem("userName") || "Admin" : "Admin";
  const userEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") || "" : "";

  /* ══════════════════════ RENDER ══════════════════════ */
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
        *,*::before,*::after{box-sizing:border-box}
        body{font-family:'Inter',sans-serif;background:#07030a;color:#fff;-webkit-font-smoothing:antialiased;margin:0;overflow:hidden}
        @keyframes db-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes db-spin{to{transform:rotate(360deg)}}
        @keyframes db-pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes db-sc{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
        .db-spin{animation:db-spin 1s linear infinite}
        .db-pulse{animation:db-pulse 1.4s ease infinite}
        .db-up{animation:db-up .45s cubic-bezier(.22,.68,0,1.2) both}

        /* sidebar */
        .db-side{
          position:fixed;left:0;top:0;bottom:0;
          width:var(--sw,240px);
          background:linear-gradient(180deg,#100510 0%,#0a020d 100%);
          border-right:1px solid rgba(193,39,45,.15);
          display:flex;flex-direction:column;
          z-index:50;transition:width .25s ease;overflow:hidden;
        }
        .db-side.collapsed{--sw:64px}
        .db-main{
          margin-left:var(--sw,240px);
          height:100vh;overflow-y:auto;
          transition:margin-left .25s ease;
          display:flex;flex-direction:column;
        }
        .db-side.collapsed~.db-main{margin-left:64px}

        /* nav items */
        .nav-item{
          display:flex;align-items:center;gap:12px;
          padding:10px 16px;margin:2px 8px;border-radius:10px;
          cursor:pointer;transition:all .18s;
          color:rgba(255,255,255,.45);font-family:'Syne',sans-serif;
          font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;
        }
        .nav-item:hover{background:rgba(193,39,45,.12);color:rgba(255,255,255,.8)}
        .nav-item.active{background:linear-gradient(135deg,rgba(193,39,45,.25),rgba(193,39,45,.1));color:#fff;border:1px solid rgba(193,39,45,.2)}
        .nav-item .mi{font-size:19px;flex-shrink:0}

        /* cards / table rows */
        .db-card{background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);border-radius:14px}
        .db-trow{display:grid;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid rgba(255,255,255,.04);transition:background .15s}
        .db-trow:hover{background:rgba(255,255,255,.025)}
        .db-trow:last-child{border-bottom:none}

        /* buttons */
        .btn-p{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:#C1272D;color:#fff;border:none;border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s}
        .btn-p:hover{background:#a01f24;transform:translateY(-1px)}
        .btn-p:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .btn-s{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.1);border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s}
        .btn-s:hover{background:rgba(255,255,255,.1)}
        .btn-d{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:rgba(239,68,68,.12);color:#ef4444;border:1px solid rgba(239,68,68,.28);border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s}
        .btn-d:hover{background:rgba(239,68,68,.22)}
        .btn-g{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:rgba(74,222,128,.1);color:#4ade80;border:1px solid rgba(74,222,128,.22);border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s}
        .btn-g:hover{background:rgba(74,222,128,.2)}
        .btn-g:disabled{opacity:.5;cursor:not-allowed}
        .ibtn{width:28px;height:28px;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;color:rgba(255,255,255,.45)}
        .ibtn:hover{border-color:#C1272D;color:#C1272D;background:rgba(193,39,45,.1)}
        .ibtn.del:hover{border-color:#ef4444;color:#ef4444;background:rgba(239,68,68,.1)}

        /* KPI stat card */
        .kpi{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:16px 20px;display:flex;flex-direction:column;gap:4px;transition:border-color .2s}
        .kpi:hover{border-color:rgba(193,39,45,.3)}

        /* search bar */
        .db-search{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:10px;color:#fff;font-family:'Inter',sans-serif;font-size:13px;padding:9px 14px 9px 36px;outline:none;transition:border-color .2s;width:260px}
        .db-search:focus{border-color:rgba(193,39,45,.4)}
        .db-search::placeholder{color:rgba(255,255,255,.25)}

        /* modal */
        .db-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(6px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px}
        .db-modal{background:#140510;border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:26px;width:100%;max-width:500px;animation:db-sc .22s ease both;max-height:90vh;overflow-y:auto}
        .db-modal-lg{max-width:760px}
        .db-modal-sm{max-width:380px}
        .db-field{margin-bottom:14px}
        .db-field label{display:block;font-size:10px;font-weight:700;color:rgba(255,255,255,.38);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;font-family:'Syne',sans-serif}
        .db-field input,.db-field select{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:9px;color:#fff;font-family:'Inter',sans-serif;font-size:13px;padding:10px 13px;outline:none;transition:border-color .18s;appearance:none;-webkit-appearance:none}
        .db-field input:focus,.db-field select:focus{border-color:rgba(193,39,45,.5)}
        .db-field input::placeholder{color:rgba(255,255,255,.22)}
        .db-field select option{background:#1c0a1e;color:#fff}

        .badge{display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border:1px solid;font-family:'Syne',sans-serif}

        /* status pills in match modal */
        .spill{padding:6px 14px;border-radius:8px;font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;border:1px solid;cursor:pointer;transition:all .18s;display:inline-flex;align-items:center;gap:5px}
        .spill:hover{transform:translateY(-1px)}
        .spill:disabled{opacity:.5;cursor:not-allowed;transform:none}

        @media(max-width:768px){
          .db-side{--sw:64px}
          .db-side.collapsed{--sw:0px;display:none}
        }
      `}</style>

      {/* ═══════════════ SIDEBAR ═══════════════ */}
      <div className={`db-side${sideCollapsed?" collapsed":""}`}>
        {/* brand */}
        <div style={{padding:"18px 16px 14px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
          <img src="/images/logo.png" alt="logo" style={{width:34,height:34,objectFit:"contain",flexShrink:0}}/>
          {!sideCollapsed&&(
            <div style={{overflow:"hidden"}}>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:13,color:"#fff",whiteSpace:"nowrap"}}>MoroccoFan2030</div>
              <div style={{fontFamily:"Amiri,serif",fontSize:11,color:"rgba(255,255,255,.3)",marginTop:1}}>المغرب ٢٠٣٠</div>
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
              <div style={{width:32,height:32,borderRadius:"50%",background:hue(userName),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:11,color:"#fff",flexShrink:0}}>{initials(userName)}</div>
              <div style={{overflow:"hidden",flex:1}}>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{userName}</div>
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

      {/* ═══════════════ MAIN ═══════════════ */}
      <div className="db-main">

        {/* topbar */}
        <div style={{position:"sticky",top:0,zIndex:40,background:"rgba(7,3,10,.92)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",padding:"0 24px",height:56,gap:16,flexShrink:0}}>
          <button onClick={()=>setSide(p=>!p)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,.5)",display:"flex",padding:4}}>
            <span className="material-icons" style={{fontSize:20}}>{sideCollapsed?"menu_open":"menu"}</span>
          </button>
          <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:14,color:"#fff",flex:1}}>
            {NAV.find(n=>n.id===tab)?.label||"Dashboard"}
          </div>
          {/* search */}
          <div style={{position:"relative"}}>
            <span className="material-icons" style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:15,color:"rgba(255,255,255,.28)"}}>search</span>
            <input className="db-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher…"/>
          </div>
          <button className="btn-p" style={{padding:"7px 14px",fontSize:11}} onClick={loadAll}>
            <span className="material-icons" style={{fontSize:14}}>refresh</span>
          </button>
        </div>

        {/* content */}
        <div style={{flex:1,padding:"24px",minHeight:0}}>

          {loading&&(
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,gap:14}}>
              <div className="db-spin" style={{width:34,height:34,border:"3px solid #C1272D",borderTopColor:"transparent",borderRadius:"50%"}}/>
              <span style={{fontFamily:"Syne,sans-serif",color:"rgba(255,255,255,.4)",fontSize:14}}>Chargement…</span>
            </div>
          )}

          {/* ════ OVERVIEW ════ */}
          {!loading&&tab==="overview"&&(
            <div className="db-up">
              {/* KPI grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:24}}>
                {[
                  {label:"Matches",     val:matches.length,       icon:"sports_soccer", color:"#fbbf24"},
                  {label:"En Direct",   val:liveCount,             icon:"radio_button_checked",color:"#f87171"},
                  {label:"Terminés",    val:finishedCount,         icon:"check_circle",  color:"#4ade80"},
                  {label:"Équipes",     val:teams.length,          icon:"groups",        color:"#a78bfa"},
                  {label:"Supporters",  val:supporters.length,     icon:"favorite",      color:"#C1272D"},
                  {label:"Stades",      val:stades.length,         icon:"stadium",       color:"#0ea5e9"},
                  {label:"Villes",      val:cities.length,         icon:"location_city", color:"#10b981"},
                  {label:"Prédictions", val:predictions.length,    icon:"psychology",    color:"#f59e0b"},
                ].map(({label,val,icon,color})=>(
                  <div key={label} className="kpi">
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span className="material-icons" style={{fontSize:16,color,opacity:.85}}>{icon}</span>
                      <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:22,color}}>{val}</span>
                    </div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".07em"}}>{label}</div>
                  </div>
                ))}
              </div>

              {/* latest matches */}
              <div className="db-card" style={{marginBottom:20}}>
                <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:14,color:"#fff"}}>Derniers Matches</span>
                  <button className="btn-s" style={{padding:"5px 12px",fontSize:11}} onClick={()=>setTab("matches")}>Voir tout</button>
                </div>
                {matches.slice(0,6).map((m,i)=>{
                  const sc=statusCol(m.status);
                  return(
                    <div key={m.id||i} className="db-trow" style={{gridTemplateColumns:"1fr 60px 1fr 110px 100px 36px",cursor:"pointer"}} onClick={()=>openMatchModal(m)}>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:"#fff",textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.team1Name||"—"}</div>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:900,fontSize:13,color:"#C1272D",textAlign:"center"}}>{m.goalsTeam1??"-"} : {m.goalsTeam2??"-"}</div>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:12,color:"rgba(255,255,255,.6)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.team2Name||"—"}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.38)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.stadeName||"—"}</div>
                      <div><span className="badge" style={{background:sc.bg,color:sc.color,borderColor:sc.border}}>{m.status||"—"}</span></div>
                      <button className="ibtn" onClick={e=>{e.stopPropagation();openMatchModal(m);}} title="Gérer"><span className="material-icons" style={{fontSize:13}}>settings</span></button>
                    </div>
                  );
                })}
              </div>

              {/* top scorers preview */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div className="db-card">
                  <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                    <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:13,color:"#fff",display:"flex",alignItems:"center",gap:8}}>
                      <span className="material-icons" style={{fontSize:15,color:"#4ade80"}}>sports_soccer</span>Top Buteurs
                    </span>
                  </div>
                  {topScorers.slice(0,5).map((p,i)=>(
                    <div key={p.id||i} style={{display:"grid",gridTemplateColumns:"36px 1fr 60px",alignItems:"center",gap:10,padding:"10px 18px",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:13,textAlign:"center"}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":<span style={{color:"rgba(255,255,255,.3)"}}>#{i+1}</span>}</div>
                      <div>
                        <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:"#fff"}}>{p.name}</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{p.team}</div>
                      </div>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:13,color:"#4ade80",textAlign:"right"}}>{p.goals} ⚽</div>
                    </div>
                  ))}
                </div>
                <div className="db-card">
                  <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                    <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:13,color:"#fff",display:"flex",alignItems:"center",gap:8}}>
                      <span className="material-icons" style={{fontSize:15,color:"#fbbf24"}}>emoji_events</span>Leaderboard
                    </span>
                  </div>
                  {leaderboard.slice(0,5).map((s,i)=>(
                    <div key={s.id||i} style={{display:"grid",gridTemplateColumns:"36px 1fr 64px",alignItems:"center",gap:10,padding:"10px 18px",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:13,textAlign:"center"}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":<span style={{color:"rgba(255,255,255,.3)"}}>#{i+1}</span>}</div>
                      <div>
                        <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,.35)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.email}</div>
                      </div>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:13,color:"#C1272D",textAlign:"right"}}>{s.totalPoints} pts</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ MATCHES ════ */}
          {!loading&&tab==="matches"&&(
            <div className="db-up">
              <div className="db-card">
                <div style={{padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"grid",gridTemplateColumns:"1fr 60px 1fr 110px 100px 36px",gap:12,fontSize:10,fontFamily:"Syne,sans-serif",fontWeight:700,color:"rgba(255,255,255,.28)",textTransform:"uppercase",letterSpacing:".07em"}}>
                  <div>Équipe 1</div><div style={{textAlign:"center"}}>Score</div><div>Équipe 2</div><div>Stade</div><div>Statut</div><div/>
                </div>
                {fMatches.length===0&&<EmptyState icon="sports_soccer" text="Aucun match"/>}
                {fMatches.map((m,i)=>{
                  const sc=statusCol(m.status);
                  return(
                    <div key={m.id||i} className="db-trow" style={{gridTemplateColumns:"1fr 60px 1fr 110px 100px 36px"}}>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.team1Name||"—"}</div>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:900,fontSize:13,color:"#C1272D",textAlign:"center"}}>{m.goalsTeam1??"-"}:{m.goalsTeam2??"-"}</div>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:12,color:"rgba(255,255,255,.65)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.team2Name||"—"}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.38)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.stadeName||"—"}</div>
                      <div><span className="badge" style={{background:sc.bg,color:sc.color,borderColor:sc.border}}>
                        {["live","started","direct"].includes(m.status?.toLowerCase())&&<span className="db-pulse" style={{width:5,height:5,borderRadius:"50%",background:"#f87171",display:"inline-block"}}/>}
                        {m.status||"—"}</span></div>
                      <button className="ibtn" onClick={()=>openMatchModal(m)} title="Gérer"><span className="material-icons" style={{fontSize:13}}>settings</span></button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════ TEAMS ════ */}
          {!loading&&tab==="teams"&&(
            <div className="db-up">
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
                <button className="btn-p" onClick={()=>setModal({type:"add",entity:"team",data:{}})}>
                  <span className="material-icons" style={{fontSize:14}}>add</span>Ajouter
                </button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14}}>
                {fTeams.map((t,i)=>(
                  <div key={t.id||i} className="db-card" style={{padding:16,display:"flex",flexDirection:"column",gap:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      {t.imageUrl?<img src={t.imageUrl} alt={t.name} style={{width:44,height:44,borderRadius:10,objectFit:"cover"}}/>
                        :<div style={{width:44,height:44,borderRadius:10,background:hue(t.name),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:"#fff"}}>{initials(t.name)}</div>}
                      <div style={{flex:1,overflow:"hidden"}}>
                        <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,.38)",marginTop:2}}>{t.country||"—"}</div>
                      </div>
                    </div>
                    {t.coach&&<div style={{fontSize:11,color:"rgba(255,255,255,.45)",display:"flex",alignItems:"center",gap:6}}><span className="material-icons" style={{fontSize:13}}>person</span>{t.coach}</div>}
                    <div style={{display:"flex",gap:6,marginTop:"auto"}}>
                      <button className="ibtn" onClick={()=>setModal({type:"edit",entity:"team",data:{...t}})} title="Modifier"><span className="material-icons" style={{fontSize:13}}>edit</span></button>
                      <button className="ibtn del" onClick={()=>setModal({type:"del",entity:"team",data:t})} title="Supprimer"><span className="material-icons" style={{fontSize:13}}>delete</span></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ PLAYERS ════ */}
          {!loading&&tab==="players"&&(
            <div className="db-up">
              {playerStats&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:18}}>
                  {[
                    {l:"Total",  v:playerStats.totalPlayers,               c:"rgba(255,255,255,.8)"},
                    {l:"Buts",   v:playerStats.totalGoals,                  c:"#C1272D"},
                    {l:"Âge moy",v:playerStats.averageAge?.toFixed(1),     c:"#fbbf24"},
                    {l:"Taille", v:(playerStats.averageHeight?.toFixed(0)||"—")+"cm",c:"#4ade80"},
                    {l:"Poids",  v:(playerStats.averageWeight?.toFixed(0)||"—")+"kg",c:"#a78bfa"},
                  ].map(({l,v,c})=>(
                    <div key={l} className="kpi">
                      <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:20,color:c}}>{v}</span>
                      <span style={{fontSize:10,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".07em"}}>{l}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="db-card">
                <div style={{padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"grid",gridTemplateColumns:"40px 1fr 120px 60px 55px 45px",gap:12,fontSize:10,fontFamily:"Syne,sans-serif",fontWeight:700,color:"rgba(255,255,255,.28)",textTransform:"uppercase",letterSpacing:".07em"}}>
                  <div>#</div><div>Joueur</div><div>Équipe</div><div>Buts</div><div>Taille</div><div>Âge</div>
                </div>
                {fScorers.map((p,i)=>(
                  <div key={p.id||i} className="db-trow" style={{gridTemplateColumns:"40px 1fr 120px 60px 55px 45px"}}>
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:13,textAlign:"center"}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":<span style={{color:"rgba(255,255,255,.3)"}}>#{i+1}</span>}</div>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      {p.urlImage?<img src={p.urlImage} alt={p.name} style={{width:28,height:28,borderRadius:"50%",objectFit:"cover"}}/>
                        :<div style={{width:28,height:28,borderRadius:"50%",background:hue(p.name),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:10,color:"#fff"}}>{initials(p.name)}</div>}
                      <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
                    </div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.5)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.team}</div>
                    <div style={{display:"flex",alignItems:"center",gap:4,fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:13,color:"#4ade80"}}><span className="material-icons" style={{fontSize:12}}>sports_soccer</span>{p.goals}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.38)"}}>{p.height?`${p.height}cm`:"—"}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.38)"}}>{p.age||"—"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ SUPPORTERS ════ */}
          {!loading&&tab==="supporters"&&(
            <div className="db-up">
              <div className="db-card">
                <div style={{padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"grid",gridTemplateColumns:"1fr 1fr 80px 80px 80px",gap:12,fontSize:10,fontFamily:"Syne,sans-serif",fontWeight:700,color:"rgba(255,255,255,.28)",textTransform:"uppercase",letterSpacing:".07em"}}>
                  <div>Nom</div><div>Email</div><div>Pays</div><div>Points</div><div/>
                </div>
                {fSupporters.length===0&&<EmptyState icon="favorite" text="Aucun supporter"/>}
                {fSupporters.map((s,i)=>(
                  <div key={s.id||i} className="db-trow" style={{gridTemplateColumns:"1fr 1fr 80px 80px 80px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:hue(s.name),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:10,color:"#fff",flexShrink:0}}>{initials(s.name)}</div>
                      <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name||"—"}</span>
                    </div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.5)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.email||"—"}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.45)"}}>{s.country||"—"}</div>
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:12,color:"#C1272D"}}>{s.totalPoints??0} pts</div>
                    <div style={{display:"flex",gap:5}}>
                      <button className="ibtn" onClick={()=>{setPwdForm({newPassword:"",confirm:""});setModal({type:"pwd",entity:"supporter",data:s});}} title="Mot de passe"><span className="material-icons" style={{fontSize:13}}>lock</span></button>
                      <button className="ibtn del" onClick={()=>setModal({type:"del",entity:"supporter",data:s})} title="Supprimer"><span className="material-icons" style={{fontSize:13}}>delete</span></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ CITIES ════ */}
          {!loading&&tab==="cities"&&(
            <div className="db-up">
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14}}>
                {fCities.map((c,i)=>(
                  <div key={c.id||i} className="db-card" style={{overflow:"hidden"}}>
                    {c.imageUrl&&<div style={{height:110,overflow:"hidden",borderRadius:"14px 14px 0 0"}}>
                      <img src={c.imageUrl} alt={c.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>
                    </div>}
                    <div style={{padding:14}}>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:14,color:"#fff"}}>{c.name}</div>
                      {c.region&&<div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:2}}>{c.region}</div>}
                      {c.description&&<div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:6,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{c.description}</div>}
                      <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                        {c.population&&<span className="badge" style={{background:"rgba(14,165,233,.1)",color:"#38bdf8",borderColor:"rgba(14,165,233,.2)"}}>{c.population?.toLocaleString()} hab.</span>}
                      </div>
                    </div>
                  </div>
                ))}
                {fCities.length===0&&<EmptyState icon="location_city" text="Aucune ville"/>}
              </div>
            </div>
          )}

          {/* ════ STADES ════ */}
          {!loading&&tab==="stades"&&(
            <div className="db-up">
              <div className="db-card">
                <div style={{padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"grid",gridTemplateColumns:"1fr 130px 90px 80px 36px",gap:12,fontSize:10,fontFamily:"Syne,sans-serif",fontWeight:700,color:"rgba(255,255,255,.28)",textTransform:"uppercase",letterSpacing:".07em"}}>
                  <div>Stade</div><div>Ville</div><div>Capacité</div><div>Pays</div><div/>
                </div>
                {fStades.length===0&&<EmptyState icon="stadium" text="Aucun stade"/>}
                {fStades.map((s,i)=>(
                  <div key={s.id||i} className="db-trow" style={{gridTemplateColumns:"1fr 130px 90px 80px 36px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      {s.imageUrl?<img src={s.imageUrl} alt={s.name} style={{width:32,height:32,borderRadius:8,objectFit:"cover"}}/>
                        :<div style={{width:32,height:32,borderRadius:8,background:"rgba(193,39,45,.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span className="material-icons" style={{fontSize:15,color:"#C1272D"}}>stadium</span></div>}
                      <div>
                        <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:"#fff"}}>{s.name}</div>
                        {s.adresse&&<div style={{fontSize:10,color:"rgba(255,255,255,.35)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200}}>{s.adresse}</div>}
                      </div>
                    </div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.5)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.cityName||"—"}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.45)"}}>{s.capacity?.toLocaleString()||"—"}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.45)"}}>{s.country||"—"}</div>
                    <button className="ibtn del" onClick={()=>setModal({type:"del",entity:"stade",data:s})} title="Supprimer"><span className="material-icons" style={{fontSize:13}}>delete</span></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ ATTRACTIONS ════ */}
          {!loading&&tab==="attractions"&&(
            <div className="db-up">
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:14}}>
                {fAttr.map((a,i)=>(
                  <div key={a.id||i} className="db-card" style={{overflow:"hidden"}}>
                    {a.imageUrl&&<div style={{height:100,overflow:"hidden",borderRadius:"14px 14px 0 0"}}>
                      <img src={a.imageUrl} alt={a.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>
                    </div>}
                    <div style={{padding:13}}>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:"#fff"}}>{a.name}</div>
                      {a.cityName&&<div style={{fontSize:10,color:"rgba(255,255,255,.4)",marginTop:2}}>{a.cityName}</div>}
                      {a.description&&<div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:5,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{a.description}</div>}
                      <div style={{marginTop:10,display:"flex",gap:6}}>
                        <button className="ibtn del" onClick={()=>setModal({type:"del",entity:"attraction",data:a})} title="Supprimer"><span className="material-icons" style={{fontSize:13}}>delete</span></button>
                      </div>
                    </div>
                  </div>
                ))}
                {fAttr.length===0&&<EmptyState icon="attractions" text="Aucune attraction"/>}
              </div>
            </div>
          )}

          {/* ════ PREDICTIONS ════ */}
          {!loading&&tab==="predictions"&&(
            <div className="db-up" style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:18,alignItems:"start"}}>
              <div>
                <div className="db-card">
                  <div style={{padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"grid",gridTemplateColumns:"50px 1fr 1fr 80px 50px",gap:10,fontSize:10,fontFamily:"Syne,sans-serif",fontWeight:700,color:"rgba(255,255,255,.28)",textTransform:"uppercase",letterSpacing:".07em"}}>
                    <div>ID</div><div>Match</div><div>Pronostic</div><div>Statut</div><div>Pts</div>
                  </div>
                  {fPred.slice(0,30).map((p,i)=>{
                    const col=(p.status?.toLowerCase()==="correct")?{bg:"rgba(0,98,51,.12)",c:"#4ade80"}:(p.status?.toLowerCase()==="incorrect")?{bg:"rgba(193,39,45,.12)",c:"#f87171"}:{bg:"rgba(255,255,255,.05)",c:"rgba(255,255,255,.4)"};
                    return(
                      <div key={p.id||i} className="db-trow" style={{gridTemplateColumns:"50px 1fr 1fr 80px 50px"}}>
                        <div style={{fontSize:11,color:"rgba(255,255,255,.3)"}}>#{p.id}</div>
                        <div>
                          <div style={{fontSize:12,fontFamily:"Syne,sans-serif",fontWeight:700,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.team1Name||"?"} vs {p.team2Name||"?"}</div>
                          <div style={{fontSize:10,color:"rgba(255,255,255,.28)"}}>Match #{p.matchId}</div>
                        </div>
                        <div style={{fontSize:11,fontFamily:"Syne,sans-serif",fontWeight:600,color:"rgba(255,255,255,.6)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.predictedWinnerName||"—"}</div>
                        <div><span className="badge" style={{background:col.bg,color:col.c,borderColor:col.c+"33"}}>{p.status||"—"}</span></div>
                        <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:12,color:"#C1272D"}}>{p.points??0}</div>
                      </div>
                    );
                  })}
                  {predictions.length===0&&<EmptyState icon="psychology" text="Aucune prédiction"/>}
                </div>
              </div>
              <div className="db-card">
                <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                  <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:13,color:"#fff"}}>🏆 Classement</span>
                </div>
                {leaderboard.map((s,i)=>(
                  <div key={s.id||i} style={{display:"grid",gridTemplateColumns:"36px 1fr 64px",alignItems:"center",gap:10,padding:"10px 18px",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:13,textAlign:"center"}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":<span style={{color:"rgba(255,255,255,.3)"}}>#{i+1}</span>}</div>
                    <div>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{s.email}</div>
                    </div>
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:12,color:"#C1272D",textAlign:"right"}}>{s.totalPoints} pts</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>{/* /content */}
      </div>{/* /main */}

      {/* ════ MATCH DETAIL MODAL ════ */}
      {matchModal&&(
        <div className="db-overlay" onClick={e=>{if(e.target===e.currentTarget)setMatchModal(null);}}>
          <div className="db-modal db-modal-lg">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
              <div>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:16,color:"#fff"}}>{matchModal.team1Name||"Équipe 1"} <span style={{color:"#C1272D"}}>vs</span> {matchModal.team2Name||"Équipe 2"}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.38)",marginTop:2}}>{matchModal.stadeName||"—"} · Match #{matchModal.id}</div>
              </div>
              <button className="ibtn" onClick={()=>setMatchModal(null)}><span className="material-icons" style={{fontSize:17}}>close</span></button>
            </div>

            {/* score */}
            <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:24,marginBottom:18,padding:"16px 20px",background:"rgba(255,255,255,.04)",borderRadius:14,border:"1px solid rgba(255,255,255,.06)"}}>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:"#fff",flex:1,textAlign:"right"}}>{matchModal.team1Name}</div>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:900,fontSize:36,color:"#C1272D",letterSpacing:2}}>{matchModal.goalsTeam1??0} — {matchModal.goalsTeam2??0}</div>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:"#fff",flex:1}}>{matchModal.team2Name}</div>
            </div>

            {/* status */}
            <div style={{marginBottom:18,padding:"14px 16px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)",borderRadius:12}}>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:10,color:"rgba(255,255,255,.38)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Changer le statut</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {ALL_STATUSES.map(s=>{
                  const sc=statusCol(s);
                  const isA=matchModal.status?.toUpperCase()===s;
                  return(
                    <button key={s} className="spill" disabled={savingStatus} onClick={()=>changeMatchStatus(s)}
                      style={{background:isA?sc.bg:"rgba(255,255,255,.04)",color:isA?sc.color:"rgba(255,255,255,.4)",borderColor:isA?sc.border:"rgba(255,255,255,.08)"}}>
                      {isA&&<span className="material-icons" style={{fontSize:11}}>check</span>}{s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* goal + events */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)",borderRadius:12,padding:"16px"}}>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:"#fff",marginBottom:12,display:"flex",alignItems:"center",gap:7}}>
                  <span className="material-icons" style={{fontSize:14,color:"#4ade80"}}>sports_soccer</span>Enregistrer un but
                </div>
                {loadingMatch?<div style={{fontSize:12,color:"rgba(255,255,255,.3)"}}>Chargement…</div>:<>
                  <div className="db-field"><label>Équipe</label>
                    <select value={goalForm.teamId} onChange={e=>setGoalForm(f=>({...f,teamId:e.target.value,playerId:""}))}>
                      <option value="">-- Équipe --</option>
                      {matchTeams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="db-field"><label>Buteur</label>
                    <select value={goalForm.playerId} onChange={e=>setGoalForm(f=>({...f,playerId:e.target.value}))} disabled={!goalForm.teamId}>
                      <option value="">-- Joueur --</option>
                      {teamPlayers4Goal.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="db-field"><label>Minute (optionnel)</label>
                    <input type="number" min="1" max="120" value={goalForm.minute} onChange={e=>setGoalForm(f=>({...f,minute:e.target.value}))} placeholder="Ex: 45"/>
                  </div>
                  <button className="btn-g" style={{width:"100%",justifyContent:"center"}} onClick={addGoal} disabled={savingGoal||!goalForm.teamId||!goalForm.playerId}>
                    {savingGoal?<><div className="db-spin" style={{width:13,height:13,border:"2px solid rgba(74,222,128,.4)",borderTopColor:"#4ade80",borderRadius:"50%"}}/>Enregistrement…</>
                    :<><span className="material-icons" style={{fontSize:14}}>sports_soccer</span>Confirmer le but</>}
                  </button>
                </>}
              </div>
              <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)",borderRadius:12,padding:"16px",maxHeight:260,overflowY:"auto"}}>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:"#fff",marginBottom:10,display:"flex",alignItems:"center",gap:7}}>
                  <span className="material-icons" style={{fontSize:14,color:"#fbbf24"}}>timeline</span>Événements ({matchEvents.length})
                </div>
                {matchEvents.length===0?<div style={{fontSize:12,color:"rgba(255,255,255,.3)",textAlign:"center",padding:"16px 0"}}>Aucun événement</div>
                :[...matchEvents].sort((a,b)=>(a.minute||0)-(b.minute||0)).map((ev,i)=>(
                  <div key={ev.id||i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(74,222,128,.1)",border:"1px solid rgba(74,222,128,.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span className="material-icons" style={{fontSize:13,color:"#4ade80"}}>sports_soccer</span>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:"#fff"}}>{ev.playerName||`Joueur #${ev.playerID}`}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.38)"}}>{ev.teamName||"—"}</div>
                    </div>
                    {ev.minute!=null&&<div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:12,color:"#fbbf24"}}>{ev.minute}'</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════ DELETE CONFIRM MODAL ════ */}
      {modal?.type==="del"&&(
        <div className="db-overlay">
          <div className="db-modal db-modal-sm">
            <div style={{textAlign:"center",padding:"4px 0 16px"}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
                <span className="material-icons" style={{fontSize:24,color:"#ef4444"}}>delete_forever</span>
              </div>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:16,color:"#fff",marginBottom:8}}>Supprimer ?</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,.4)",lineHeight:1.6}}>
                Supprimer <strong style={{color:"#fff"}}>{modal.data.name||`#${modal.data.id}`}</strong> ? Action irréversible.
              </div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button className="btn-s" onClick={()=>setModal(null)}>Annuler</button>
              <button className="btn-d" onClick={handleDelete} disabled={saving}>
                {saving?<><div className="db-spin" style={{width:13,height:13,border:"2px solid rgba(239,68,68,.4)",borderTopColor:"#ef4444",borderRadius:"50%"}}/>…</>:<><span className="material-icons" style={{fontSize:13}}>delete</span>Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ PASSWORD MODAL ════ */}
      {modal?.type==="pwd"&&(
        <div className="db-overlay">
          <div className="db-modal db-modal-sm">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
              <div>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:16,color:"#fff"}}>Modifier le mot de passe</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.38)",marginTop:3}}>{modal.data.name}</div>
              </div>
              <button className="ibtn" onClick={()=>setModal(null)}><span className="material-icons" style={{fontSize:17}}>close</span></button>
            </div>
            {[{k:"newPassword",l:"Nouveau mot de passe",t:"password"},{k:"confirm",l:"Confirmer",t:"password"}].map(({k,l,t})=>(
              <div className="db-field" key={k}>
                <label>{l}</label>
                <input type={t} value={pwdForm[k]||""} onChange={e=>setPwdForm(f=>({...f,[k]:e.target.value}))} placeholder="••••••••"/>
              </div>
            ))}
            {pwdForm.newPassword&&pwdForm.confirm&&pwdForm.newPassword!==pwdForm.confirm&&(
              <div style={{fontSize:12,color:"#f87171",marginBottom:10,padding:"7px 10px",background:"rgba(239,68,68,.1)",borderRadius:8}}>Les mots de passe ne correspondent pas</div>
            )}
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button className="btn-s" onClick={()=>setModal(null)}>Annuler</button>
              <button className="btn-g" onClick={handlePwd} disabled={saving}>
                {saving?<><div className="db-spin" style={{width:13,height:13,border:"2px solid rgba(74,222,128,.4)",borderTopColor:"#4ade80",borderRadius:"50%"}}/>…</>:<><span className="material-icons" style={{fontSize:13}}>lock</span>Changer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ TOAST ════ */}
      {toast&&(
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:toast.type==="success"?"rgba(22,163,74,.95)":"rgba(193,39,45,.95)",color:"#fff",padding:"11px 20px",borderRadius:10,fontSize:13,fontFamily:"Syne,sans-serif",fontWeight:700,display:"flex",alignItems:"center",gap:9,zIndex:200,boxShadow:"0 8px 28px rgba(0,0,0,.4)",animation:"db-up .3s ease both",whiteSpace:"nowrap"}}>
          <span className="material-icons" style={{fontSize:17}}>{toast.type==="success"?"check_circle":"cancel"}</span>
          {toast.msg}
        </div>
      )}
    </>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"36px 0",gap:10}}>
      <span className="material-icons" style={{fontSize:38,color:"rgba(255,255,255,.08)"}}>{icon}</span>
      <span style={{fontFamily:"Syne,sans-serif",color:"rgba(255,255,255,.25)",fontSize:13}}>{text}</span>
    </div>
  );
}