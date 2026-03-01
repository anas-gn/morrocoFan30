"use client";
import { useState, useEffect, useCallback } from "react";

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
  for (const x of (n || "")) h = (h * 31 + x.charCodeAt(0)) % c.length;
  return c[h];
};

const STATUS_CONFIG = {
  SCHEDULED: { bg: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.45)", border: "rgba(255,255,255,.12)", icon: "schedule", label: "Programmé" },
  LIVE:      { bg: "rgba(193,39,45,.18)",   color: "#f87171",               border: "rgba(193,39,45,.4)",    icon: "radio_button_checked", label: "En Direct" },
  STARTED:   { bg: "rgba(193,39,45,.18)",   color: "#f87171",               border: "rgba(193,39,45,.4)",    icon: "play_circle",          label: "Commencé" },
  DIRECT:    { bg: "rgba(193,39,45,.18)",   color: "#f87171",               border: "rgba(193,39,45,.4)",    icon: "live_tv",              label: "Direct" },
  HALFTIME:  { bg: "rgba(251,191,36,.15)",  color: "#fbbf24",               border: "rgba(251,191,36,.35)",  icon: "pause_circle",         label: "Mi-Temps" },
  FINISHED:  { bg: "rgba(0,98,51,.15)",     color: "#4ade80",               border: "rgba(0,98,51,.35)",     icon: "check_circle",         label: "Terminé" },
};
const ALL_STATUSES = ["SCHEDULED","LIVE","STARTED","DIRECT","HALFTIME","FINISHED"];

const statusCfg = s => STATUS_CONFIG[(s||"").toUpperCase()] || STATUS_CONFIG.SCHEDULED;
const isLive = s => ["live","started","direct"].includes((s||"").toLowerCase());

export default function MatchesRespo() {
  const [matches,        setMatches]        = useState([]);
  const [filteredMatches,setFilteredMatches]= useState([]);
  const [venues,         setVenues]         = useState([]);
  const [teams,          setTeams]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [filterStatus,   setFilterStatus]   = useState("ALL");
  const [toast,          setToast]          = useState(null);

  /* match detail modal */
  const [selected,       setSelected]       = useState(null);
  const [matchPlayers,   setMatchPlayers]   = useState([]);
  const [matchTeams,     setMatchTeams]     = useState([]);
  const [matchEvents,    setMatchEvents]    = useState([]);
  const [loadingDetail,  setLoadingDetail]  = useState(false);
  const [savingStatus,   setSavingStatus]   = useState(false);

  /* goal form */
  const [goalForm,       setGoalForm]       = useState({ teamId: "", playerId: "", minute: "" });
  const [savingGoal,     setSavingGoal]     = useState(false);

  /* event form */
  const [showAddEvent,   setShowAddEvent]   = useState(false);
  const [eventForm,      setEventForm]      = useState({ teamId: "", playerId: "", minute: "", additionalInfo: "" });
  const [savingEvent,    setSavingEvent]    = useState(false);

  /* active tab in modal */
  const [modalTab,       setModalTab]       = useState("status"); // status | goal | events | lineup

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── fetch matches ── */
  useEffect(() => {
    fetch(`${BASE}/matches/matches/allTriee`)
      .then(r => r.json())
      .then(d => { setMatches(d); setFilteredMatches(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${BASE}/acceuil/stade/all`).then(r => r.json()).then(setVenues).catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${BASE}/acceuil/teams/some`).then(r => r.json()).then(setTeams).catch(() => {});
  }, []);

  /* ── filter ── */
  useEffect(() => {
    let f = [...matches];
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(m =>
        m.team1Name?.toLowerCase().includes(q) ||
        m.team2Name?.toLowerCase().includes(q) ||
        m.stadeName?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "ALL") {
      f = f.filter(m => (m.status||"").toUpperCase() === filterStatus);
    }
    setFilteredMatches(f);
  }, [search, filterStatus, matches]);

  /* ── open detail ── */
  const openMatch = async m => {
    setSelected(m);
    setMatchPlayers([]);
    setMatchTeams([]);
    setMatchEvents([]);
    setGoalForm({ teamId: "", playerId: "", minute: "" });
    setEventForm({ teamId: "", playerId: "", minute: "", additionalInfo: "" });
    setModalTab("status");
    setShowAddEvent(false);
    setLoadingDetail(true);
    try {
      const [players, events] = await Promise.all([
        sf(`${BASE}/matches/matches/players/${m.id}`).catch(() => []),
        sf(`${BASE}/matches/matches/${m.id}/events`).catch(() => []),
      ]);
      const pList = Array.isArray(players) ? players : [];
      setMatchPlayers(pList);
      setMatchEvents(Array.isArray(events) ? events : []);
      const tMap = {};
      pList.forEach(p => {
        if (p.teamId && p.team && !tMap[p.teamId])
          tMap[p.teamId] = { id: p.teamId, name: p.team };
      });
      setMatchTeams(Object.values(tMap));
    } catch (_) {}
    setLoadingDetail(false);
  };

  /* ── change status ── */
  const changeStatus = async s => {
    if (!selected) return;
    setSavingStatus(true);
    try {
      await fetch(`${BASE}/matches/etat/${selected.id}/${s}`);
      const updated = { ...selected, status: s };
      setSelected(updated);
      setMatches(p => p.map(m => m.id === selected.id ? { ...m, status: s } : m));
      showToast("success", `Statut → ${s}`);
    } catch { showToast("error", "Erreur changement statut."); }
    setSavingStatus(false);
  };

  /* ── add goal ── */
  const addGoal = async () => {
    const { teamId, playerId, minute } = goalForm;
    if (!teamId || !playerId) { showToast("error", "Équipe et joueur requis."); return; }
    setSavingGoal(true);
    try {
      const min = minute ? `?minute=${minute}` : "";
      const res = await fetch(`${BASE}/matches/matches/${selected.id}/team/${teamId}/player/${playerId}${min}`);
      if (res.ok) {
        showToast("success", "⚽ But enregistré !");
        const ev = await sf(`${BASE}/matches/matches/${selected.id}/events`).catch(() => []);
        setMatchEvents(Array.isArray(ev) ? ev : []);
        setGoalForm({ teamId: "", playerId: "", minute: "" });
        const mat = await sf(`${BASE}/matches/matches/allTriee`).catch(() => []);
        if (Array.isArray(mat)) {
          setMatches(mat);
          const fresh = mat.find(m => m.id === selected.id);
          if (fresh) setSelected(fresh);
        }
      } else showToast("error", "Échec enregistrement but.");
    } catch { showToast("error", "Erreur réseau."); }
    setSavingGoal(false);
  };

  /* ── add event ── */
  const addEvent = async () => {
    const { teamId, playerId, minute, additionalInfo } = eventForm;
    if (!teamId || !playerId) { showToast("error", "Équipe et joueur requis."); return; }
    setSavingEvent(true);
    try {
      const payload = {
        matchID: selected.id,
        teamID: parseInt(teamId),
        playerID: parseInt(playerId),
        minute: minute ? parseInt(minute) : 0,
        additionalInfo: additionalInfo || "Événement"
      };
      const res = await fetch(`${BASE}/matches/matches/events/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast("success", "Événement ajouté !");
        const ev = await sf(`${BASE}/matches/matches/${selected.id}/events`).catch(() => []);
        setMatchEvents(Array.isArray(ev) ? ev : []);
        setEventForm({ teamId: "", playerId: "", minute: "", additionalInfo: "" });
        setShowAddEvent(false);
      } else showToast("error", "Échec ajout événement.");
    } catch { showToast("error", "Erreur réseau."); }
    setSavingEvent(false);
  };

  /* ── delete event ── */
  const deleteEvent = async id => {
    try {
      await fetch(`${BASE}/matches/matches/events/delete/${id}`, { method: "DELETE" });
      setMatchEvents(p => p.filter(e => e.id !== id));
      showToast("success", "Événement supprimé.");
    } catch { showToast("error", "Erreur suppression."); }
  };

  const teamPlayersForGoal  = matchPlayers.filter(p => String(p.teamId) === String(goalForm.teamId));
  const teamPlayersForEvent = matchPlayers.filter(p => String(p.teamId) === String(eventForm.teamId));

  /* ── counts ── */
  const liveCount     = matches.filter(m => isLive(m.status)).length;
  const finishedCount = matches.filter(m => (m.status||"").toLowerCase() === "finished").length;
  const scheduledCount= matches.filter(m => !m.status || (m.status||"").toLowerCase() === "scheduled").length;

  return (
    <>
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #07030a; color: #fff; -webkit-font-smoothing: antialiased; }
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100%{opacity:1}50%{opacity:.25} }
        @keyframes scaleIn { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:none} }

        .mr-wrap { min-height:100vh; background:#07030a; padding:0; }
        .mr-spin  { animation: spin .9s linear infinite; }
        .mr-pulse { animation: pulse 1.3s ease infinite; }
        .mr-up    { animation: fadeUp .4s cubic-bezier(.22,.68,0,1.2) both; }
        .mr-scale { animation: scaleIn .22s ease both; }

        /* ── header ── */
        .mr-header {
          background: linear-gradient(135deg, #100510 0%, #0a020d 100%);
          border-bottom: 1px solid rgba(193,39,45,.2);
          padding: 20px 28px;
          display: flex; align-items: center; gap: 18px;
        }
        .mr-logo { width: 36px; height: 36px; object-fit: contain; }
        .mr-title { font-family: 'Syne',sans-serif; font-weight: 800; font-size: 18px; color: #fff; flex:1; }
        .mr-title span { color: #C1272D; }

        /* ── stat pills ── */
        .mr-stats { display: flex; gap: 10px; flex-wrap: wrap; padding: 16px 28px 0; }
        .mr-stat {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px; border-radius: 99px;
          border: 1px solid rgba(255,255,255,.07);
          background: rgba(255,255,255,.04);
          font-family: 'Syne',sans-serif; font-size: 12px; font-weight: 700;
        }
        .mr-stat-dot { width:8px;height:8px;border-radius:50%; }

        /* ── toolbar ── */
        .mr-toolbar {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
          padding: 16px 28px;
        }
        .mr-search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 340px; }
        .mr-search-wrap .mi { position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:16px;color:rgba(255,255,255,.28); }
        .mr-search {
          width:100%; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.09);
          border-radius:10px; color:#fff; font-family:'Inter',sans-serif; font-size:13px;
          padding:9px 13px 9px 36px; outline:none; transition:border-color .2s;
        }
        .mr-search:focus { border-color:rgba(193,39,45,.4); }
        .mr-search::placeholder { color:rgba(255,255,255,.22); }

        .mr-filter-btn {
          padding: 8px 14px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.04);
          color: rgba(255,255,255,.5); font-family:'Syne',sans-serif;
          font-size:11px; font-weight:700; cursor:pointer; transition:all .18s;
          white-space:nowrap;
        }
        .mr-filter-btn:hover { border-color:rgba(193,39,45,.3); color:rgba(255,255,255,.8); }
        .mr-filter-btn.active { background:rgba(193,39,45,.18); border-color:rgba(193,39,45,.4); color:#f87171; }

        /* ── grid ── */
        .mr-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 14px;
          padding: 0 28px 28px;
        }

        /* ── match card ── */
        .mr-card {
          background: rgba(255,255,255,.035);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; overflow:hidden;
          cursor: pointer; transition: all .22s;
          position: relative;
        }
        .mr-card:hover { border-color:rgba(193,39,45,.3); transform:translateY(-2px); background:rgba(255,255,255,.05); }
        .mr-card.live { border-color:rgba(193,39,45,.4); box-shadow:0 0 0 1px rgba(193,39,45,.15); }

        .mr-card-top {
          padding: 14px 16px 10px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .mr-card-body { padding: 0 16px 14px; }
        .mr-card-score {
          display: flex; align-items: center; gap: 12px; justify-content: center;
          padding: 14px 0 12px;
        }
        .mr-team-name { font-family:'Syne',sans-serif; font-weight:700; font-size:13px; color:#fff; flex:1; }
        .mr-team-name.right { text-align:right; }
        .mr-score { font-family:'Syne',sans-serif; font-weight:900; font-size:28px; color:#C1272D; letter-spacing:2px; min-width:60px; text-align:center; }
        .mr-card-footer { padding:0 16px 12px; display:flex; align-items:center; gap:8px; }
        .mr-venue { font-size:11px; color:rgba(255,255,255,.35); flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .mr-date { font-size:10px; color:rgba(255,255,255,.25); }

        /* badge */
        .badge {
          display:inline-flex;align-items:center;gap:4px;
          padding:3px 9px;border-radius:99px;
          font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
          border:1px solid;font-family:'Syne',sans-serif;
        }

        /* settings btn */
        .mr-settings-btn {
          width:28px;height:28px;border-radius:8px;
          background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
          display:flex;align-items:center;justify-content:center;
          color:rgba(255,255,255,.45); cursor:pointer; transition:all .18s;
          font-family:'Material Icons';font-size:14px;
        }
        .mr-settings-btn:hover { background:rgba(193,39,45,.15); border-color:#C1272D; color:#C1272D; }

        /* ── overlay ── */
        .mr-overlay {
          position:fixed;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(8px);
          z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;
        }
        .mr-modal {
          background: linear-gradient(160deg, #170818 0%, #0c030f 100%);
          border:1px solid rgba(255,255,255,.1);border-radius:22px;
          width:100%;max-width:720px;max-height:90vh;overflow-y:auto;
          animation: scaleIn .22s ease both;
        }
        .mr-modal::-webkit-scrollbar{width:4px}
        .mr-modal::-webkit-scrollbar-track{background:transparent}
        .mr-modal::-webkit-scrollbar-thumb{background:rgba(193,39,45,.3);border-radius:2px}

        .mr-modal-head {
          padding:22px 24px 0;
          position:sticky;top:0;z-index:10;
          background:linear-gradient(160deg,#170818,#0c030f);
          border-bottom:1px solid rgba(255,255,255,.06);padding-bottom:0;
        }
        .mr-modal-body { padding:20px 24px 24px; }

        /* score hero */
        .mr-score-hero {
          background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);
          border-radius:14px;padding:18px 24px;
          display:flex;align-items:center;justify-content:space-between;gap:16px;
          margin-bottom:18px;
        }
        .mr-hero-team { font-family:'Syne',sans-serif;font-weight:800;font-size:15px;color:#fff;flex:1; }
        .mr-hero-team.r { text-align:right; }
        .mr-hero-score { font-family:'Syne',sans-serif;font-weight:900;font-size:40px;color:#C1272D;letter-spacing:4px; }

        /* tabs */
        .mr-tabs { display:flex;gap:0;border-bottom:1px solid rgba(255,255,255,.07);margin-bottom:18px; }
        .mr-tab {
          padding:10px 16px;font-family:'Syne',sans-serif;font-weight:700;font-size:11px;
          color:rgba(255,255,255,.4);cursor:pointer;text-transform:uppercase;letter-spacing:.07em;
          border-bottom:2px solid transparent;transition:all .18s;display:flex;align-items:center;gap:6px;
        }
        .mr-tab:hover { color:rgba(255,255,255,.7); }
        .mr-tab.active { color:#C1272D;border-bottom-color:#C1272D; }
        .mr-tab .mi { font-size:14px; }

        /* status pills */
        .spill {
          padding:8px 14px;border-radius:9px;border:1px solid;
          font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;
          cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;
        }
        .spill:hover{transform:translateY(-1px);}
        .spill:disabled{opacity:.45;cursor:not-allowed;transform:none;}

        /* form fields */
        .db-field { margin-bottom:13px; }
        .db-field label { display:block;font-size:10px;font-weight:700;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;font-family:'Syne',sans-serif; }
        .db-field input,.db-field select,.db-field textarea {
          width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
          border-radius:9px;color:#fff;font-family:'Inter',sans-serif;font-size:13px;
          padding:10px 13px;outline:none;transition:border-color .18s;
          appearance:none;-webkit-appearance:none;resize:vertical;
        }
        .db-field input:focus,.db-field select:focus,.db-field textarea:focus{border-color:rgba(193,39,45,.5);}
        .db-field input::placeholder,.db-field textarea::placeholder{color:rgba(255,255,255,.22);}
        .db-field select option{background:#1c0a1e;color:#fff;}

        /* buttons */
        .btn-p{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:#C1272D;color:#fff;border:none;border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s;}
        .btn-p:hover{background:#a01f24;transform:translateY(-1px);}
        .btn-p:disabled{opacity:.5;cursor:not-allowed;transform:none;}
        .btn-s{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.1);border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s;}
        .btn-s:hover{background:rgba(255,255,255,.1);}
        .btn-g{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:rgba(74,222,128,.1);color:#4ade80;border:1px solid rgba(74,222,128,.22);border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s;}
        .btn-g:hover{background:rgba(74,222,128,.2);}
        .btn-g:disabled{opacity:.5;cursor:not-allowed;}
        .ibtn{width:28px;height:28px;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;color:rgba(255,255,255,.4);}
        .ibtn:hover{border-color:#C1272D;color:#C1272D;background:rgba(193,39,45,.1);}
        .ibtn.del:hover{border-color:#ef4444;color:#ef4444;background:rgba(239,68,68,.1);}

        /* events list */
        .ev-item {
          display:flex;align-items:center;gap:10px;
          padding:9px 0;border-bottom:1px solid rgba(255,255,255,.04);
        }
        .ev-item:last-child{border-bottom:none;}
        .ev-icon {
          width:30px;height:30px;border-radius:50%;
          background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.2);
          display:flex;align-items:center;justify-content:center;flex-shrink:0;
        }

        /* lineup grid */
        .lineup-player {
          display:flex;align-items:center;gap:10px;
          padding:8px 12px;border-radius:9px;
          background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);
          transition:background .15s;
        }
        .lineup-player:hover{background:rgba(255,255,255,.055);}

        /* toast */
        .mr-toast {
          position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
          padding:11px 20px;border-radius:10px;
          font-family:'Syne',sans-serif;font-size:13px;font-weight:700;
          display:flex;align-items:center;gap:9px;
          z-index:200;animation:fadeUp .3s ease both;white-space:nowrap;
          box-shadow:0 8px 28px rgba(0,0,0,.4);
        }

        /* section divider */
        .sect-title {
          font-family:'Syne',sans-serif;font-weight:700;font-size:11px;
          color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.1em;
          margin-bottom:12px;display:flex;align-items:center;gap:8px;
        }
        .sect-title::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.06);}

        /* empty state */
        .empty { display:flex;flex-direction:column;align-items:center;gap:10px;padding:32px 0; }
        .empty .mi{font-size:34px;color:rgba(255,255,255,.08);}
        .empty span{font-family:'Syne',sans-serif;font-size:13px;color:rgba(255,255,255,.2);}

        @media(max-width:640px){
          .mr-grid{grid-template-columns:1fr;padding:0 14px 20px;}
          .mr-toolbar{padding:12px 14px;}
          .mr-stats{padding:12px 14px 0;}
          .mr-header{padding:14px 16px;}
          .mr-modal{max-height:95vh;border-radius:16px;}
          .mr-modal-head,.mr-modal-body{padding-left:16px;padding-right:16px;}
        }
      `}</style>

      <div className="mr-wrap">

        {/* ── Header ── */}
        <div className="mr-header">
          <img src="/images/logo.png" alt="logo" className="mr-logo" onError={e=>e.target.style.display="none"}/>
          <div className="mr-title">Morocco<span>Fan</span>2030 · <span>Matches</span></div>
          <button
            className="btn-s"
            style={{padding:"7px 14px",fontSize:11}}
            onClick={() => {
              setLoading(true);
              fetch(`${BASE}/matches/matches/allTriee`).then(r=>r.json()).then(d=>{setMatches(d);setFilteredMatches(d);}).finally(()=>setLoading(false));
            }}
          >
            <span className="material-icons" style={{fontSize:14}}>refresh</span>
            Actualiser
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="mr-stats">
          {[
            {label:`${matches.length} Matches`,dot:"rgba(255,255,255,.4)"},
            {label:`${liveCount} En Direct`, dot:"#f87171"},
            {label:`${scheduledCount} Programmés`, dot:"rgba(255,255,255,.3)"},
            {label:`${finishedCount} Terminés`, dot:"#4ade80"},
          ].map(({label,dot})=>(
            <div key={label} className="mr-stat">
              <div className="mr-stat-dot" style={{background:dot}}/>
              <span style={{fontFamily:"Syne,sans-serif",fontSize:12,fontWeight:700,color:"rgba(255,255,255,.7)"}}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="mr-toolbar">
          <div className="mr-search-wrap">
            <span className="material-icons mi">search</span>
            <input className="mr-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher match, stade…"/>
          </div>
          {["ALL","SCHEDULED","LIVE","HALFTIME","FINISHED"].map(s=>(
            <button key={s} className={`mr-filter-btn${filterStatus===s?" active":""}`} onClick={()=>setFilterStatus(s)}>
              {s==="ALL"?"Tous":STATUS_CONFIG[s]?.label||s}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:320,gap:14}}>
            <div className="mr-spin" style={{width:36,height:36,border:"3px solid #C1272D",borderTopColor:"transparent",borderRadius:"50%"}}/>
            <span style={{fontFamily:"Syne,sans-serif",color:"rgba(255,255,255,.4)",fontSize:14}}>Chargement des matches…</span>
          </div>
        ) : (
          <div className="mr-grid">
            {filteredMatches.length === 0 && (
              <div style={{gridColumn:"1/-1"}}>
                <div className="empty">
                  <span className="material-icons">sports_soccer</span>
                  <span>Aucun match trouvé</span>
                </div>
              </div>
            )}
            {filteredMatches.map((m, i) => {
              const cfg = statusCfg(m.status);
              const live = isLive(m.status);
              const t1 = m.matchTeams?.[0] || {};
              const t2 = m.matchTeams?.[1] || {};
              const g1 = t1.goals ?? m.goalsTeam1 ?? 0;
              const g2 = t2.goals ?? m.goalsTeam2 ?? 0;

              return (
                <div
                  key={m.id || i}
                  className={`mr-card mr-up${live?" live":""}`}
                  style={{animationDelay:`${i*0.04}s`}}
                  onClick={() => openMatch(m)}
                >
                  {/* live glow line */}
                  {live && (
                    <div style={{height:2,background:"linear-gradient(90deg,transparent,#C1272D,transparent)"}}/>
                  )}

                  <div className="mr-card-top">
                    <span className="badge" style={{background:cfg.bg,color:cfg.color,borderColor:cfg.border}}>
                      {live && <span className="mr-pulse" style={{width:5,height:5,borderRadius:"50%",background:"#f87171",display:"inline-block"}}/>}
                      <span className="material-icons" style={{fontSize:11}}>{cfg.icon}</span>
                      {cfg.label}
                    </span>
                    <button className="mr-settings-btn" onClick={e=>{e.stopPropagation();openMatch(m);}}>
                      <span className="material-icons" style={{fontSize:14}}>settings</span>
                    </button>
                  </div>

                  <div className="mr-card-body">
                    <div className="mr-card-score">
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flex:1}}>
                        {t1.imageUrl
                          ? <img src={t1.imageUrl} alt="" style={{width:36,height:36,borderRadius:8,objectFit:"cover"}}/>
                          : <div style={{width:36,height:36,borderRadius:8,background:hue(m.team1Name||t1.teamName),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:12,color:"#fff"}}>{initials(m.team1Name||t1.teamName)}</div>
                        }
                        <span className="mr-team-name" style={{textAlign:"center",fontSize:12}}>{m.team1Name||t1.teamName||"—"}</span>
                      </div>
                      <div className="mr-score">{g1} — {g2}</div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flex:1}}>
                        {t2.imageUrl
                          ? <img src={t2.imageUrl} alt="" style={{width:36,height:36,borderRadius:8,objectFit:"cover"}}/>
                          : <div style={{width:36,height:36,borderRadius:8,background:hue(m.team2Name||t2.teamName),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:12,color:"#fff"}}>{initials(m.team2Name||t2.teamName)}</div>
                        }
                        <span className="mr-team-name" style={{textAlign:"center",fontSize:12}}>{m.team2Name||t2.teamName||"—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mr-card-footer">
                    <span className="material-icons" style={{fontSize:12,color:"rgba(255,255,255,.25)"}}>stadium</span>
                    <span className="mr-venue">{m.stadeName||"—"}</span>
                    {m.type && <span className="badge" style={{background:"rgba(255,255,255,.04)",color:"rgba(255,255,255,.3)",borderColor:"rgba(255,255,255,.07)",fontSize:9}}>{m.type}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════ MATCH DETAIL MODAL ══════════════════════ */}
      {selected && (
        <div className="mr-overlay" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="mr-modal mr-scale">

            {/* ── Modal Header ── */}
            <div className="mr-modal-head">
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",paddingBottom:16}}>
                <div>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:17,color:"#fff",marginBottom:4}}>
                    {selected.team1Name||"Équipe 1"} <span style={{color:"#C1272D"}}>vs</span> {selected.team2Name||"Équipe 2"}
                  </div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.38)",display:"flex",alignItems:"center",gap:8}}>
                    <span className="material-icons" style={{fontSize:12}}>stadium</span>
                    {selected.stadeName||"—"} · Match #{selected.id}
                    {selected.type && <span>· {selected.type}</span>}
                  </div>
                </div>
                <button
                  style={{background:"none",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,color:"rgba(255,255,255,.5)",cursor:"pointer",padding:"5px 8px",display:"flex",alignItems:"center"}}
                  onClick={() => setSelected(null)}
                >
                  <span className="material-icons" style={{fontSize:17}}>close</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="mr-tabs">
                {[
                  {id:"status",  icon:"toggle_on",    label:"Statut"},
                  {id:"goal",    icon:"sports_soccer", label:"But"},
                  {id:"events",  icon:"timeline",      label:`Événements (${matchEvents.length})`},
                  {id:"lineup",  icon:"groups",        label:`Joueurs (${matchPlayers.length})`},
                ].map(t=>(
                  <div key={t.id} className={`mr-tab${modalTab===t.id?" active":""}`} onClick={()=>setModalTab(t.id)}>
                    <span className="material-icons mi">{t.icon}</span>{t.label}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Modal Body ── */}
            <div className="mr-modal-body">

              {/* Score Hero */}
              <div className="mr-score-hero">
                <div className="mr-hero-team">{selected.team1Name||"—"}</div>
                <div>
                  <div className="mr-hero-score">
                    {(selected.matchTeams?.[0]?.goals ?? selected.goalsTeam1 ?? 0)} — {(selected.matchTeams?.[1]?.goals ?? selected.goalsTeam2 ?? 0)}
                  </div>
                  <div style={{textAlign:"center",marginTop:4}}>
                    {(() => {
                      const cfg = statusCfg(selected.status);
                      const live = isLive(selected.status);
                      return (
                        <span className="badge" style={{background:cfg.bg,color:cfg.color,borderColor:cfg.border}}>
                          {live && <span className="mr-pulse" style={{width:5,height:5,borderRadius:"50%",background:"#f87171",display:"inline-block"}}/>}
                          {cfg.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div className="mr-hero-team r">{selected.team2Name||"—"}</div>
              </div>

              {/* ── TAB: STATUS ── */}
              {modalTab==="status" && (
                <div>
                  <div className="sect-title">Changer le statut du match</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {ALL_STATUSES.map(s => {
                      const cfg = STATUS_CONFIG[s];
                      const isActive = (selected.status||"").toUpperCase() === s;
                      return (
                        <button
                          key={s}
                          className="spill"
                          disabled={savingStatus}
                          onClick={() => changeStatus(s)}
                          style={{
                            background: isActive ? cfg.bg : "rgba(255,255,255,.04)",
                            color: isActive ? cfg.color : "rgba(255,255,255,.4)",
                            borderColor: isActive ? cfg.border : "rgba(255,255,255,.08)",
                          }}
                        >
                          {isActive && <span className="material-icons" style={{fontSize:12}}>check</span>}
                          <span className="material-icons" style={{fontSize:13}}>{cfg.icon}</span>
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                  {savingStatus && (
                    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:14,color:"rgba(255,255,255,.4)",fontSize:12}}>
                      <div className="mr-spin" style={{width:14,height:14,border:"2px solid rgba(193,39,45,.3)",borderTopColor:"#C1272D",borderRadius:"50%"}}/>
                      Sauvegarde…
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: GOAL ── */}
              {modalTab==="goal" && (
                <div>
                  <div className="sect-title">Enregistrer un but</div>
                  {loadingDetail ? (
                    <div style={{fontSize:12,color:"rgba(255,255,255,.3)",padding:"16px 0"}}>Chargement des joueurs…</div>
                  ) : matchPlayers.length === 0 ? (
                    <div className="empty">
                      <span className="material-icons">groups</span>
                      <span>Aucun joueur disponible pour ce match</span>
                    </div>
                  ) : (
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                      <div>
                        <div className="db-field">
                          <label>Équipe</label>
                          <select value={goalForm.teamId} onChange={e=>setGoalForm(f=>({...f,teamId:e.target.value,playerId:""}))}>
                            <option value="">-- Sélectionner --</option>
                            {matchTeams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                        </div>
                        <div className="db-field">
                          <label>Buteur</label>
                          <select value={goalForm.playerId} onChange={e=>setGoalForm(f=>({...f,playerId:e.target.value}))} disabled={!goalForm.teamId}>
                            <option value="">-- Sélectionner --</option>
                            {teamPlayersForGoal.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                        <div className="db-field">
                          <label>Minute (optionnel)</label>
                          <input type="number" min="1" max="120" value={goalForm.minute} onChange={e=>setGoalForm(f=>({...f,minute:e.target.value}))} placeholder="Ex: 45"/>
                        </div>
                        <button
                          className="btn-g"
                          style={{width:"100%",justifyContent:"center"}}
                          onClick={addGoal}
                          disabled={savingGoal || !goalForm.teamId || !goalForm.playerId}
                        >
                          {savingGoal
                            ? <><div className="mr-spin" style={{width:13,height:13,border:"2px solid rgba(74,222,128,.3)",borderTopColor:"#4ade80",borderRadius:"50%"}}/>Enregistrement…</>
                            : <><span className="material-icons" style={{fontSize:14}}>sports_soccer</span>Confirmer le but</>
                          }
                        </button>
                      </div>

                      {/* recent goals */}
                      <div>
                        <div className="sect-title" style={{marginBottom:10}}>Buts récents</div>
                        <div style={{maxHeight:220,overflowY:"auto"}}>
                          {matchEvents.length === 0
                            ? <div className="empty" style={{padding:"16px 0"}}><span className="material-icons">sports_soccer</span><span>Aucun but</span></div>
                            : [...matchEvents].sort((a,b)=>(b.minute||0)-(a.minute||0)).map((ev,i)=>(
                              <div key={ev.id||i} className="ev-item">
                                <div className="ev-icon"><span className="material-icons" style={{fontSize:14,color:"#4ade80"}}>sports_soccer</span></div>
                                <div style={{flex:1}}>
                                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:"#fff"}}>{ev.playerName||`Joueur #${ev.playerID}`}</div>
                                  <div style={{fontSize:10,color:"rgba(255,255,255,.38)"}}>{ev.teamName||"—"}</div>
                                </div>
                                {ev.minute!=null && <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:12,color:"#fbbf24"}}>{ev.minute}'</div>}
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: EVENTS ── */}
              {modalTab==="events" && (
                <div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                    <div className="sect-title" style={{marginBottom:0}}>Événements du match</div>
                    <button className="btn-p" style={{padding:"7px 14px",fontSize:11}} onClick={()=>setShowAddEvent(p=>!p)}>
                      <span className="material-icons" style={{fontSize:13}}>{showAddEvent?"close":"add"}</span>
                      {showAddEvent?"Annuler":"Ajouter"}
                    </button>
                  </div>

                  {showAddEvent && (
                    <div style={{background:"rgba(193,39,45,.07)",border:"1px solid rgba(193,39,45,.2)",borderRadius:12,padding:16,marginBottom:16}}>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:"rgba(255,255,255,.7)",marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
                        <span className="material-icons" style={{fontSize:14,color:"#C1272D"}}>add_circle</span>
                        Nouvel événement
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                        <div className="db-field">
                          <label>Équipe</label>
                          <select value={eventForm.teamId} onChange={e=>setEventForm(f=>({...f,teamId:e.target.value,playerId:""}))}>
                            <option value="">-- Équipe --</option>
                            {matchTeams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                        </div>
                        <div className="db-field">
                          <label>Joueur</label>
                          <select value={eventForm.playerId} onChange={e=>setEventForm(f=>({...f,playerId:e.target.value}))} disabled={!eventForm.teamId}>
                            <option value="">-- Joueur --</option>
                            {teamPlayersForEvent.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                        <div className="db-field">
                          <label>Minute</label>
                          <input type="number" min="1" max="120" value={eventForm.minute} onChange={e=>setEventForm(f=>({...f,minute:e.target.value}))} placeholder="Ex: 67"/>
                        </div>
                        <div className="db-field">
                          <label>Description</label>
                          <input type="text" value={eventForm.additionalInfo} onChange={e=>setEventForm(f=>({...f,additionalInfo:e.target.value}))} placeholder="But, Carton, Remplacement…"/>
                        </div>
                      </div>
                      <button
                        className="btn-p"
                        style={{width:"100%",justifyContent:"center",marginTop:2}}
                        onClick={addEvent}
                        disabled={savingEvent||!eventForm.teamId||!eventForm.playerId}
                      >
                        {savingEvent
                          ? <><div className="mr-spin" style={{width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%"}}/>Ajout…</>
                          : <><span className="material-icons" style={{fontSize:13}}>add</span>Ajouter l'événement</>
                        }
                      </button>
                    </div>
                  )}

                  <div style={{maxHeight:320,overflowY:"auto"}}>
                    {matchEvents.length===0
                      ? <div className="empty"><span className="material-icons">timeline</span><span>Aucun événement enregistré</span></div>
                      : [...matchEvents].sort((a,b)=>(a.minute||0)-(b.minute||0)).map((ev,i)=>(
                        <div key={ev.id||i} className="ev-item" style={{animation:`fadeUp .3s ease ${i*.04}s both`}}>
                          <div className="ev-icon"><span className="material-icons" style={{fontSize:14,color:"#4ade80"}}>sports_soccer</span></div>
                          <div style={{flex:1}}>
                            <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:"#fff"}}>{ev.playerName||`Joueur #${ev.playerID}`}</div>
                            <div style={{fontSize:10,color:"rgba(255,255,255,.38)",marginTop:2}}>{ev.teamName||"—"} {ev.additionalInfo?`· ${ev.additionalInfo}`:""}</div>
                          </div>
                          {ev.minute!=null && <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:13,color:"#fbbf24",minWidth:32,textAlign:"right"}}>{ev.minute}'</div>}
                          <button className="ibtn del" onClick={()=>deleteEvent(ev.id)} title="Supprimer">
                            <span className="material-icons" style={{fontSize:13}}>delete</span>
                          </button>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* ── TAB: LINEUP ── */}
              {modalTab==="lineup" && (
                <div>
                  {loadingDetail ? (
                    <div style={{display:"flex",alignItems:"center",gap:10,padding:"20px 0",color:"rgba(255,255,255,.4)",fontSize:12}}>
                      <div className="mr-spin" style={{width:16,height:16,border:"2px solid rgba(255,255,255,.1)",borderTopColor:"#C1272D",borderRadius:"50%"}}/>
                      Chargement des joueurs…
                    </div>
                  ) : matchTeams.length === 0 ? (
                    <div className="empty"><span className="material-icons">groups</span><span>Aucun joueur disponible</span></div>
                  ) : (
                    matchTeams.map(t => {
                      const tPlayers = matchPlayers.filter(p => String(p.teamId) === String(t.id));
                      return (
                        <div key={t.id} style={{marginBottom:20}}>
                          <div className="sect-title">
                            <div style={{width:20,height:20,borderRadius:5,background:hue(t.name),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:9,color:"#fff",flexShrink:0}}>{initials(t.name)}</div>
                            {t.name} ({tPlayers.length})
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
                            {tPlayers.map((p,i)=>(
                              <div key={p.id||i} className="lineup-player">
                                {p.urlImage
                                  ? <img src={p.urlImage} alt={p.name} style={{width:28,height:28,borderRadius:"50%",objectFit:"cover"}}/>
                                  : <div style={{width:28,height:28,borderRadius:"50%",background:hue(p.name),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:9,color:"#fff",flexShrink:0}}>{initials(p.name)}</div>
                                }
                                <div style={{flex:1,overflow:"hidden"}}>
                                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:11,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                                  {p.position && <div style={{fontSize:9,color:"rgba(255,255,255,.35)"}}>{p.position}</div>}
                                </div>
                                {p.goals > 0 && (
                                  <span style={{fontSize:10,color:"#4ade80",fontFamily:"Syne,sans-serif",fontWeight:800}}>⚽ {p.goals}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="mr-toast" style={{
          background: toast.type==="success" ? "rgba(22,163,74,.95)" : "rgba(193,39,45,.95)",
          color:"#fff"
        }}>
          <span className="material-icons" style={{fontSize:17}}>{toast.type==="success"?"check_circle":"cancel"}</span>
          {toast.msg}
        </div>
      )}

      {/* Load fonts & icons */}
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
    </>
  );
}