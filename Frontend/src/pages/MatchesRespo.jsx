"use client";
import { useState, useEffect } from "react";

const BASE = "https://anas-gana1-fandb-backend.hf.space/api";

const sf = async (url, opts) => {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(r.status);
  const t = await r.text();
  try { return JSON.parse(t); } catch { return t; }
};

/* ── helpers ── */
const initials = n => n ? n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
const hue = n => {
  const c = ["#C1272D","#006233","#b45309","#0369a1","#7c3aed","#0f766e"];
  let h = 0; for (const x of (n||"")) h = (h*31+x.charCodeAt(0))%c.length; return c[h];
};

/*
  BACKEND DTO FIELDS (from MatchesController.java):
  - match.statut       ← NOT status!
  - match.stadeName
  - match.stadeId
  - match.matchTeams   ← array of MatchTeamDTO
    - matchTeams[0].teamName
    - matchTeams[0].teamId
    - matchTeams[0].goals
    - matchTeams[0].imageUrl
  - match.matchEvents
  - match.matchPlayers
  - match.dateOfMatch
  - match.type
  - match.id
*/

/* statut can be: SCHEDULED, LIVE, STARTED, DIRECT, HALFTIME, FINISHED, termine, commence, etc. */
const normStatus = s => {
  const u = (s||"").toUpperCase();
  if (["LIVE","STARTED","DIRECT","COMMENCE"].includes(u)) return "LIVE";
  if (["FINISHED","TERMINE"].includes(u))                  return "FINISHED";
  if (u === "HALFTIME")                                    return "HALFTIME";
  return "SCHEDULED";
};

const STATUS_CONFIG = {
  SCHEDULED: { bg:"rgba(255,255,255,.06)", color:"rgba(255,255,255,.45)", border:"rgba(255,255,255,.12)", icon:"schedule",             label:"Programmé"  },
  LIVE:      { bg:"rgba(193,39,45,.18)",   color:"#f87171",               border:"rgba(193,39,45,.4)",    icon:"radio_button_checked",  label:"En Direct"  },
  HALFTIME:  { bg:"rgba(251,191,36,.15)",  color:"#fbbf24",               border:"rgba(251,191,36,.35)",  icon:"pause_circle",          label:"Mi-Temps"   },
  FINISHED:  { bg:"rgba(0,98,51,.15)",     color:"#4ade80",               border:"rgba(0,98,51,.35)",     icon:"check_circle",          label:"Terminé"    },
};
const ALL_STATUSES = ["SCHEDULED","LIVE","HALFTIME","FINISHED"];

const statusCfg = s => STATUS_CONFIG[normStatus(s)] || STATUS_CONFIG.SCHEDULED;
const isLive    = s => normStatus(s) === "LIVE";

/* extract team info from DTO */
const t1of = m => m.matchTeams?.[0] || {};
const t2of = m => m.matchTeams?.[1] || {};

export default function MatchesRespo() {
  const [matches,         setMatches]         = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [search,          setSearch]          = useState("");
  const [filterStatus,    setFilterStatus]    = useState("ALL");
  const [toast,           setToast]           = useState(null);

  /* modal */
  const [selected,        setSelected]        = useState(null);
  const [matchPlayers,    setMatchPlayers]    = useState([]);
  const [matchTeams,      setMatchTeams]      = useState([]);
  const [matchEvents,     setMatchEvents]     = useState([]);
  const [loadingDetail,   setLoadingDetail]   = useState(false);
  const [savingStatus,    setSavingStatus]    = useState(false);
  const [modalTab,        setModalTab]        = useState("status");

  /* goal form */
  const [goalForm,        setGoalForm]        = useState({ teamId:"", playerId:"", minute:"" });
  const [savingGoal,      setSavingGoal]      = useState(false);

  /* event form */
  const [showAddEvent,    setShowAddEvent]    = useState(false);
  const [eventForm,       setEventForm]       = useState({ teamId:"", playerId:"", minute:"", additionalInfo:"" });
  const [savingEvent,     setSavingEvent]     = useState(false);

  const showToast = (type, msg) => { setToast({type,msg}); setTimeout(()=>setToast(null),3500); };

  /* ── load matches ── */
  const loadMatches = () => {
    setLoading(true);
    fetch(`${BASE}/matches/matches/allTriee`)
      .then(r => r.json())
      .then(d => { setMatches(Array.isArray(d)?d:[]); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(loadMatches, []);

  /* ── filter ── */
  useEffect(() => {
    let f = [...matches];
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(m =>
        t1of(m).teamName?.toLowerCase().includes(q) ||
        t2of(m).teamName?.toLowerCase().includes(q) ||
        m.stadeName?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "ALL") {
      f = f.filter(m => normStatus(m.statut) === filterStatus);
    }
    setFilteredMatches(f);
  }, [search, filterStatus, matches]);

  /* ── open match modal ── */
  const openMatch = async m => {
    setSelected(m);
    setModalTab("status");
    setGoalForm({teamId:"",playerId:"",minute:""});
    setEventForm({teamId:"",playerId:"",minute:"",additionalInfo:""});
    setShowAddEvent(false);
    setLoadingDetail(true);
    try {
      const [players, events] = await Promise.all([
        sf(`${BASE}/matches/matches/players/${m.id}`).catch(()=>[]),
        sf(`${BASE}/matches/matches/${m.id}/events`).catch(()=>[]),
      ]);
      const pList = Array.isArray(players) ? players : [];
      setMatchPlayers(pList);
      setMatchEvents(Array.isArray(events) ? events : []);
      /* build teams from matchTeams already in the DTO */
      const tMap = {};
      (m.matchTeams||[]).forEach(mt => {
        if (mt.teamId && mt.teamName && !tMap[mt.teamId])
          tMap[mt.teamId] = { id: mt.teamId, name: mt.teamName };
      });
      /* also from players fallback */
      pList.forEach(p => {
        if (p.teamId && p.team && !tMap[p.teamId])
          tMap[p.teamId] = { id: p.teamId, name: p.team };
      });
      setMatchTeams(Object.values(tMap));
    } catch(_) {}
    setLoadingDetail(false);
  };

  /* ── change status ── */
  const changeStatus = async s => {
    if (!selected) return;
    setSavingStatus(true);
    try {
      await fetch(`${BASE}/matches/etat/${selected.id}/${s}`);
      const updated = {...selected, statut: s};
      setSelected(updated);
      setMatches(p => p.map(m => m.id===selected.id ? updated : m));
      showToast("success","Statut → " + s);
    } catch { showToast("error","Erreur statut."); }
    setSavingStatus(false);
  };

  /* ── add goal ── */
  const addGoal = async () => {
    const {teamId, playerId, minute} = goalForm;
    if (!teamId||!playerId) { showToast("error","Équipe et joueur requis."); return; }
    setSavingGoal(true);
    try {
      const min = minute ? `?minute=${minute}` : "";
      const res = await fetch(`${BASE}/matches/matches/${selected.id}/team/${teamId}/player/${playerId}${min}`);
      if (res.ok) {
        showToast("success","⚽ But enregistré !");
        const ev = await sf(`${BASE}/matches/matches/${selected.id}/events`).catch(()=>[]);
        setMatchEvents(Array.isArray(ev)?ev:[]);
        setGoalForm({teamId:"",playerId:"",minute:""});
        loadMatches();
      } else showToast("error","Échec enregistrement but.");
    } catch { showToast("error","Erreur réseau."); }
    setSavingGoal(false);
  };

  /* ── add event ── */
  const addEvent = async () => {
    const {teamId,playerId,minute,additionalInfo} = eventForm;
    if (!teamId||!playerId) { showToast("error","Équipe et joueur requis."); return; }
    setSavingEvent(true);
    try {
      const res = await fetch(`${BASE}/matches/matches/events/add`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          matchID: selected.id, teamID: parseInt(teamId),
          playerID: parseInt(playerId), minute: minute?parseInt(minute):0,
          additionalInfo: additionalInfo||"Événement"
        })
      });
      if (res.ok) {
        showToast("success","Événement ajouté !");
        const ev = await sf(`${BASE}/matches/matches/${selected.id}/events`).catch(()=>[]);
        setMatchEvents(Array.isArray(ev)?ev:[]);
        setEventForm({teamId:"",playerId:"",minute:"",additionalInfo:""});
        setShowAddEvent(false);
      } else showToast("error","Échec ajout événement.");
    } catch { showToast("error","Erreur réseau."); }
    setSavingEvent(false);
  };

  /* ── delete event ── */
  const deleteEvent = async id => {
    try {
      await fetch(`${BASE}/matches/matches/events/delete/${id}`, {method:"DELETE"});
      setMatchEvents(p => p.filter(e=>e.id!==id));
      showToast("success","Événement supprimé.");
    } catch { showToast("error","Erreur suppression."); }
  };

  const teamPlayersForGoal  = matchPlayers.filter(p => String(p.teamId)===String(goalForm.teamId));
  const teamPlayersForEvent = matchPlayers.filter(p => String(p.teamId)===String(eventForm.teamId));

  /* counts */
  const liveCount      = matches.filter(m=>normStatus(m.statut)==="LIVE").length;
  const scheduledCount = matches.filter(m=>normStatus(m.statut)==="SCHEDULED").length;
  const finishedCount  = matches.filter(m=>normStatus(m.statut)==="FINISHED").length;

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:"#07030a"}}>

      <style jsx global>{`
        @keyframes fadeUp  {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes spin    {to{transform:rotate(360deg)}}
        @keyframes pulse   {0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes scaleIn {from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}

        .mr-spin  {animation:spin  1s linear infinite}
        .mr-pulse {animation:pulse 1.4s ease infinite}
        .mr-up    {animation:fadeUp .4s cubic-bezier(.22,.68,0,1.2) both}

        /* header */
        .mr-header {
          padding:18px 24px 0;
          background:#07030a;
          border-bottom:1px solid rgba(255,255,255,.06);
          flex-shrink:0;
        }
        .mr-title-row {
          display:flex;align-items:center;justify-content:space-between;
          margin-bottom:14px;
        }
        .mr-stats {display:flex;gap:16px;margin-bottom:14px;flex-wrap:wrap;}
        .mr-stat  {display:flex;align-items:center;gap:6px;}
        .mr-stat-dot {width:6px;height:6px;border-radius:50%;flex-shrink:0;}

        .mr-toolbar {
          display:flex;align-items:center;gap:8px;
          padding-bottom:14px;flex-wrap:wrap;
        }
        .mr-search-wrap {position:relative;flex:1;min-width:180px;}
        .mr-search-wrap .mi {
          position:absolute;left:10px;top:50%;transform:translateY(-50%);
          font-size:15px;color:rgba(255,255,255,.28);pointer-events:none;
        }
        .mr-search {
          width:100%;background:rgba(255,255,255,.05);
          border:1px solid rgba(255,255,255,.09);border-radius:9px;
          color:#fff;font-family:'Inter',sans-serif;font-size:13px;
          padding:8px 12px 8px 34px;outline:none;transition:border-color .2s;
        }
        .mr-search:focus {border-color:rgba(193,39,45,.4);}
        .mr-search::placeholder {color:rgba(255,255,255,.22);}

        .mr-filter-btn {
          padding:7px 13px;border-radius:8px;border:1px solid rgba(255,255,255,.1);
          background:rgba(255,255,255,.04);color:rgba(255,255,255,.5);
          font-family:'Syne',sans-serif;font-size:11px;font-weight:700;
          cursor:pointer;transition:all .18s;white-space:nowrap;
        }
        .mr-filter-btn:hover {background:rgba(255,255,255,.08);color:#fff;}
        .mr-filter-btn.active {background:rgba(193,39,45,.2);border-color:rgba(193,39,45,.4);color:#f87171;}

        /* content */
        .mr-content {flex:1;overflow-y:auto;padding:20px 24px;}
        .mr-content::-webkit-scrollbar {width:4px;}
        .mr-content::-webkit-scrollbar-track {background:transparent;}
        .mr-content::-webkit-scrollbar-thumb {background:rgba(193,39,45,.3);border-radius:2px;}

        /* table */
        .mr-table {
          width:100%;background:rgba(255,255,255,.025);
          border:1px solid rgba(255,255,255,.07);border-radius:14px;
          overflow:hidden;
        }
        .mr-thead {
          display:grid;
          grid-template-columns:1fr 80px 1fr 160px 120px 40px;
          gap:8px;padding:10px 18px;
          border-bottom:1px solid rgba(255,255,255,.06);
          font-family:'Syne',sans-serif;font-size:10px;font-weight:700;
          color:rgba(255,255,255,.28);text-transform:uppercase;letter-spacing:.08em;
        }
        .mr-row {
          display:grid;
          grid-template-columns:1fr 80px 1fr 160px 120px 40px;
          gap:8px;padding:13px 18px;
          border-bottom:1px solid rgba(255,255,255,.04);
          align-items:center;cursor:pointer;transition:background .15s;
        }
        .mr-row:hover {background:rgba(255,255,255,.03);}
        .mr-row:last-child {border-bottom:none;}
        .mr-row.live {border-left:2px solid #C1272D;}

        .team-cell {display:flex;align-items:center;gap:9px;}
        .team-logo {
          width:28px;height:28px;border-radius:6px;
          object-fit:cover;flex-shrink:0;
        }
        .team-logo-placeholder {
          width:28px;height:28px;border-radius:6px;
          display:flex;align-items:center;justify-content:center;
          font-family:'Syne',sans-serif;font-weight:800;font-size:10px;color:#fff;
          flex-shrink:0;
        }
        .team-name {
          font-family:'Syne',sans-serif;font-weight:700;font-size:12px;color:#fff;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
        }
        .score-cell {
          font-family:'Syne',sans-serif;font-weight:900;font-size:15px;
          color:#C1272D;text-align:center;letter-spacing:1px;
        }
        .badge {
          display:inline-flex;align-items:center;gap:4px;
          padding:3px 9px;border-radius:99px;font-size:10px;
          font-weight:700;letter-spacing:.06em;text-transform:uppercase;
          border:1px solid;font-family:'Syne',sans-serif;
        }
        .settings-btn {
          width:28px;height:28px;border-radius:7px;border:1px solid rgba(255,255,255,.1);
          background:rgba(255,255,255,.04);display:flex;align-items:center;
          justify-content:center;cursor:pointer;transition:all .18s;
          color:rgba(255,255,255,.4);
        }
        .settings-btn:hover {border-color:#C1272D;color:#C1272D;background:rgba(193,39,45,.1);}

        .empty {
          display:flex;flex-direction:column;align-items:center;
          padding:60px 0;gap:12px;
        }
        .empty .material-icons {font-size:44px;color:rgba(255,255,255,.08);}
        .empty span:last-child {font-family:'Syne',sans-serif;color:rgba(255,255,255,.22);font-size:13px;}

        /* modal */
        .mr-overlay {
          position:fixed;inset:0;background:rgba(0,0,0,.78);
          backdrop-filter:blur(6px);z-index:200;
          display:flex;align-items:center;justify-content:center;padding:20px;
        }
        .mr-modal {
          background:linear-gradient(160deg,#170818 0%,#0c030f 100%);
          border:1px solid rgba(255,255,255,.1);border-radius:20px;
          width:100%;max-width:680px;max-height:90vh;overflow-y:auto;
          animation:scaleIn .22s ease both;
        }
        .mr-modal::-webkit-scrollbar {width:4px;}
        .mr-modal::-webkit-scrollbar-thumb {background:rgba(193,39,45,.3);border-radius:2px;}

        .mr-modal-head {
          padding:22px 24px 0;position:sticky;top:0;z-index:10;
          background:linear-gradient(160deg,#170818,#0c030f);
          border-bottom:1px solid rgba(255,255,255,.06);
        }
        .mr-modal-body {padding:20px 24px 24px;}

        .mr-score-hero {
          background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);
          border-radius:14px;padding:18px 24px;
          display:flex;align-items:center;justify-content:space-between;gap:16px;
          margin-bottom:18px;
        }
        .mr-hero-score {
          font-family:'Syne',sans-serif;font-weight:900;font-size:38px;
          color:#C1272D;letter-spacing:4px;
        }

        .mr-tabs {display:flex;gap:0;border-bottom:1px solid rgba(255,255,255,.07);margin-bottom:18px;}
        .mr-tab {
          padding:10px 16px;font-family:'Syne',sans-serif;font-weight:700;font-size:11px;
          color:rgba(255,255,255,.4);cursor:pointer;text-transform:uppercase;letter-spacing:.07em;
          border-bottom:2px solid transparent;transition:all .18s;display:flex;align-items:center;gap:6px;
        }
        .mr-tab:hover {color:rgba(255,255,255,.7);}
        .mr-tab.active {color:#C1272D;border-bottom-color:#C1272D;}
        .mr-tab .mi {font-size:14px;}

        .spill {
          padding:8px 14px;border-radius:9px;border:1px solid;
          font-family:'Syne',sans-serif;font-size:11px;font-weight:700;
          letter-spacing:.05em;text-transform:uppercase;
          cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;
        }
        .spill:hover {transform:translateY(-1px);}
        .spill:disabled {opacity:.45;cursor:not-allowed;transform:none;}

        .db-field {margin-bottom:13px;}
        .db-field label {
          display:block;font-size:10px;font-weight:700;color:rgba(255,255,255,.35);
          text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;
          font-family:'Syne',sans-serif;
        }
        .db-field input,.db-field select,.db-field textarea {
          width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
          border-radius:9px;color:#fff;font-family:'Inter',sans-serif;font-size:13px;
          padding:10px 13px;outline:none;transition:border-color .18s;
          appearance:none;-webkit-appearance:none;
        }
        .db-field input:focus,.db-field select:focus,.db-field textarea:focus {border-color:rgba(193,39,45,.5);}
        .db-field input::placeholder,.db-field textarea::placeholder {color:rgba(255,255,255,.22);}
        .db-field select option {background:#1c0a1e;color:#fff;}

        .btn-p {display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:#C1272D;color:#fff;border:none;border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s;}
        .btn-p:hover {background:#a01f24;transform:translateY(-1px);}
        .btn-p:disabled {opacity:.5;cursor:not-allowed;transform:none;}
        .btn-s {display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.1);border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s;}
        .btn-s:hover {background:rgba(255,255,255,.1);}
        .btn-g {display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:rgba(74,222,128,.1);color:#4ade80;border:1px solid rgba(74,222,128,.22);border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s;}
        .btn-g:hover {background:rgba(74,222,128,.2);}
        .btn-g:disabled {opacity:.5;cursor:not-allowed;}
        .ibtn {width:28px;height:28px;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;color:rgba(255,255,255,.4);}
        .ibtn:hover {border-color:#C1272D;color:#C1272D;background:rgba(193,39,45,.1);}
        .ibtn.del:hover {border-color:#ef4444;color:#ef4444;background:rgba(239,68,68,.1);}

        .ev-item {
          display:flex;align-items:center;gap:10px;
          padding:9px 0;border-bottom:1px solid rgba(255,255,255,.04);
        }
        .ev-item:last-child {border-bottom:none;}

        @media(max-width:640px){
          .mr-thead,.mr-row {grid-template-columns:1fr 60px 1fr 100px 36px;}
          .mr-thead div:nth-child(4),.mr-row div:nth-child(4) {display:none;}
        }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div className="mr-header">
        <div className="mr-title-row">
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:36,height:36,borderRadius:10,background:"rgba(193,39,45,.15)",border:"1px solid rgba(193,39,45,.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span className="material-icons" style={{fontSize:18,color:"#C1272D"}}>sports_soccer</span>
            </div>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#fff"}}>Gestion des Matches</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:1}}>{matches.length} matches chargés</div>
            </div>
          </div>
          <button className="btn-p" style={{padding:"7px 14px",fontSize:11}} onClick={loadMatches}>
            <span className="material-icons" style={{fontSize:14}}>refresh</span>Actualiser
          </button>
        </div>

        {/* stats */}
        <div className="mr-stats">
          {[
            {label:`${matches.length} Total`,  dot:"rgba(255,255,255,.4)"},
            {label:`${liveCount} En Direct`,    dot:"#f87171"},
            {label:`${scheduledCount} Programmés`, dot:"rgba(255,255,255,.25)"},
            {label:`${finishedCount} Terminés`, dot:"#4ade80"},
          ].map(({label,dot})=>(
            <div key={label} className="mr-stat">
              <div className="mr-stat-dot" style={{background:dot}}/>
              <span style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:"rgba(255,255,255,.6)"}}>{label}</span>
            </div>
          ))}
        </div>

        {/* toolbar */}
        <div className="mr-toolbar">
          <div className="mr-search-wrap">
            <span className="material-icons mi">search</span>
            <input className="mr-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher équipe, stade…"/>
          </div>
          {["ALL",...ALL_STATUSES].map(s=>(
            <button key={s} className={`mr-filter-btn${filterStatus===s?" active":""}`} onClick={()=>setFilterStatus(s)}>
              {s==="ALL"?"Tous":STATUS_CONFIG[s]?.label||s}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ TABLE ═══ */}
      <div className="mr-content">
        {loading ? (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:320,gap:14}}>
            <div className="mr-spin" style={{width:34,height:34,border:"3px solid #C1272D",borderTopColor:"transparent",borderRadius:"50%"}}/>
            <span style={{fontFamily:"'Syne',sans-serif",color:"rgba(255,255,255,.4)",fontSize:14}}>Chargement des matches…</span>
          </div>
        ) : (
          <div className="mr-table">
            {/* thead */}
            <div className="mr-thead">
              <div>Équipe 1</div>
              <div style={{textAlign:"center"}}>Score</div>
              <div>Équipe 2</div>
              <div>Stade</div>
              <div>Statut</div>
              <div/>
            </div>

            {filteredMatches.length === 0 && (
              <div className="empty">
                <span className="material-icons">sports_soccer</span>
                <span>Aucun match trouvé</span>
              </div>
            )}

            {filteredMatches.map((m, i) => {
              /* ── use matchTeams array from DTO ── */
              const t1   = m.matchTeams?.[0] || {};
              const t2   = m.matchTeams?.[1] || {};
              const name1 = t1.teamName || "—";
              const name2 = t2.teamName || "—";
              const img1  = t1.imageUrl  || null;
              const img2  = t2.imageUrl  || null;
              const g1    = t1.goals ?? 0;
              const g2    = t2.goals ?? 0;
              const cfg   = statusCfg(m.statut);   /* ← statut NOT status */
              const live  = isLive(m.statut);

              return (
                <div key={m.id||i} className={`mr-row mr-up${live?" live":""}`}
                     style={{animationDelay:`${i*.03}s`}}
                     onClick={()=>openMatch(m)}>

                  {/* équipe 1 */}
                  <div className="team-cell">
                    {img1
                      ? <img src={img1} alt={name1} className="team-logo"/>
                      : <div className="team-logo-placeholder" style={{background:hue(name1)}}>{initials(name1)}</div>}
                    <span className="team-name">{name1}</span>
                  </div>

                  {/* score */}
                  <div className="score-cell">{g1} — {g2}</div>

                  {/* équipe 2 */}
                  <div className="team-cell">
                    {img2
                      ? <img src={img2} alt={name2} className="team-logo"/>
                      : <div className="team-logo-placeholder" style={{background:hue(name2)}}>{initials(name2)}</div>}
                    <span className="team-name">{name2}</span>
                  </div>

                  {/* stade */}
                  <div style={{fontSize:11,color:"rgba(255,255,255,.4)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {m.stadeName||"—"}
                  </div>

                  {/* statut */}
                  <div>
                    <span className="badge" style={{background:cfg.bg,color:cfg.color,borderColor:cfg.border}}>
                      {live && <span className="mr-pulse" style={{width:5,height:5,borderRadius:"50%",background:"#f87171",display:"inline-block"}}/>}
                      <span className="material-icons" style={{fontSize:10}}>{cfg.icon}</span>
                      {cfg.label}
                    </span>
                  </div>

                  {/* settings */}
                  <div className="settings-btn" onClick={e=>{e.stopPropagation();openMatch(m);}}>
                    <span className="material-icons" style={{fontSize:14}}>settings</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ MODAL ═══ */}
      {selected && (
        <div className="mr-overlay" onClick={e=>{if(e.target===e.currentTarget)setSelected(null);}}>
          <div className="mr-modal">

            {/* ── Modal Header ── */}
            <div className="mr-modal-head">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingBottom:14}}>
                <div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#fff"}}>
                    {(selected.matchTeams?.[0]?.teamName)||"Équipe 1"}
                    <span style={{color:"#C1272D"}}> vs </span>
                    {(selected.matchTeams?.[1]?.teamName)||"Équipe 2"}
                  </div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:3}}>
                    {selected.stadeName||"—"} · Match #{selected.id}
                    {selected.dateOfMatch && <> · {new Date(selected.dateOfMatch).toLocaleDateString("fr-FR")}</>}
                  </div>
                </div>
                <button className="ibtn" onClick={()=>setSelected(null)}>
                  <span className="material-icons" style={{fontSize:17}}>close</span>
                </button>
              </div>

              {/* Score hero */}
              <div className="mr-score-hero">
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14,color:"#fff",flex:1,textAlign:"right"}}>
                  {selected.matchTeams?.[0]?.teamName||"—"}
                </div>
                <div className="mr-hero-score">
                  {selected.matchTeams?.[0]?.goals??0} — {selected.matchTeams?.[1]?.goals??0}
                </div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14,color:"#fff",flex:1}}>
                  {selected.matchTeams?.[1]?.teamName||"—"}
                </div>
              </div>

              {/* Tabs */}
              <div className="mr-tabs">
                {[
                  {id:"status", icon:"tune",         label:"Statut"},
                  {id:"goal",   icon:"sports_soccer", label:"But"},
                  {id:"events", icon:"timeline",      label:"Événements"},
                  {id:"lineup", icon:"people",        label:"Joueurs"},
                ].map(({id,icon,label})=>(
                  <div key={id} className={`mr-tab${modalTab===id?" active":""}`} onClick={()=>setModalTab(id)}>
                    <span className="material-icons mi">{icon}</span>{label}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Modal Body ── */}
            <div className="mr-modal-body">

              {/* ── TAB: STATUS ── */}
              {modalTab==="status" && (
                <div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>
                    Statut actuel : <span style={{color:"#fff"}}>{selected.statut||"—"}</span>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {ALL_STATUSES.map(s => {
                      const sc = STATUS_CONFIG[s];
                      const isA = normStatus(selected.statut)===s;
                      return (
                        <button key={s} className="spill" disabled={savingStatus} onClick={()=>changeStatus(s)}
                          style={{background:isA?sc.bg:"rgba(255,255,255,.04)",color:isA?sc.color:"rgba(255,255,255,.4)",borderColor:isA?sc.border:"rgba(255,255,255,.08)"}}>
                          {isA && <span className="material-icons" style={{fontSize:12}}>check</span>}
                          <span className="material-icons" style={{fontSize:12}}>{sc.icon}</span>
                          {sc.label}
                        </button>
                      );
                    })}
                  </div>
                  {savingStatus && (
                    <div style={{marginTop:12,fontSize:12,color:"rgba(255,255,255,.4)",display:"flex",alignItems:"center",gap:8}}>
                      <div className="mr-spin" style={{width:12,height:12,border:"2px solid rgba(193,39,45,.4)",borderTopColor:"#C1272D",borderRadius:"50%"}}/>
                      Mise à jour…
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: GOAL ── */}
              {modalTab==="goal" && (
                <div>
                  {loadingDetail ? (
                    <div style={{fontSize:12,color:"rgba(255,255,255,.3)",padding:"20px 0"}}>Chargement joueurs…</div>
                  ) : (
                    <>
                      <div className="db-field">
                        <label>Équipe</label>
                        <select value={goalForm.teamId} onChange={e=>setGoalForm(f=>({...f,teamId:e.target.value,playerId:""}))}>
                          <option value="">— Sélectionner l'équipe —</option>
                          {matchTeams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                      <div className="db-field">
                        <label>Buteur</label>
                        <select value={goalForm.playerId} onChange={e=>setGoalForm(f=>({...f,playerId:e.target.value}))} disabled={!goalForm.teamId}>
                          <option value="">— Sélectionner le joueur —</option>
                          {teamPlayersForGoal.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="db-field">
                        <label>Minute (optionnel)</label>
                        <input type="number" min="1" max="120" value={goalForm.minute}
                          onChange={e=>setGoalForm(f=>({...f,minute:e.target.value}))} placeholder="Ex: 45"/>
                      </div>
                      <button className="btn-g" style={{width:"100%",justifyContent:"center",marginTop:4}}
                        onClick={addGoal} disabled={savingGoal||!goalForm.teamId||!goalForm.playerId}>
                        {savingGoal
                          ? <><div className="mr-spin" style={{width:13,height:13,border:"2px solid rgba(74,222,128,.4)",borderTopColor:"#4ade80",borderRadius:"50%"}}/>Enregistrement…</>
                          : <><span className="material-icons" style={{fontSize:14}}>sports_soccer</span>Confirmer le but</>}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* ── TAB: EVENTS ── */}
              {modalTab==="events" && (
                <div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                    <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,color:"#fff"}}>
                      Événements ({matchEvents.length})
                    </span>
                    <button className="btn-p" style={{padding:"6px 12px",fontSize:11}} onClick={()=>setShowAddEvent(p=>!p)}>
                      <span className="material-icons" style={{fontSize:13}}>{showAddEvent?"close":"add"}</span>
                      {showAddEvent?"Annuler":"Ajouter"}
                    </button>
                  </div>

                  {showAddEvent && (
                    <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:12,padding:16,marginBottom:16}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                        <div className="db-field">
                          <label>Équipe</label>
                          <select value={eventForm.teamId} onChange={e=>setEventForm(f=>({...f,teamId:e.target.value,playerId:""}))}>
                            <option value="">— Équipe —</option>
                            {matchTeams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                        </div>
                        <div className="db-field">
                          <label>Joueur</label>
                          <select value={eventForm.playerId} onChange={e=>setEventForm(f=>({...f,playerId:e.target.value}))} disabled={!eventForm.teamId}>
                            <option value="">— Joueur —</option>
                            {teamPlayersForEvent.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                        <div className="db-field">
                          <label>Minute</label>
                          <input type="number" min="1" max="120" value={eventForm.minute}
                            onChange={e=>setEventForm(f=>({...f,minute:e.target.value}))} placeholder="Ex: 67"/>
                        </div>
                        <div className="db-field">
                          <label>Description</label>
                          <input type="text" value={eventForm.additionalInfo}
                            onChange={e=>setEventForm(f=>({...f,additionalInfo:e.target.value}))} placeholder="But, Carton…"/>
                        </div>
                      </div>
                      <button className="btn-g" style={{width:"100%",justifyContent:"center"}}
                        onClick={addEvent} disabled={savingEvent||!eventForm.teamId||!eventForm.playerId}>
                        {savingEvent
                          ? <><div className="mr-spin" style={{width:13,height:13,border:"2px solid rgba(74,222,128,.4)",borderTopColor:"#4ade80",borderRadius:"50%"}}/>…</>
                          : <><span className="material-icons" style={{fontSize:13}}>add</span>Ajouter l'événement</>}
                      </button>
                    </div>
                  )}

                  {matchEvents.length===0 ? (
                    <div className="empty"><span className="material-icons">timeline</span><span>Aucun événement</span></div>
                  ) : (
                    <div>
                      {[...matchEvents].sort((a,b)=>(a.minute||0)-(b.minute||0)).map((ev,i)=>(
                        <div key={ev.id||i} className="ev-item">
                          <div style={{width:30,height:30,borderRadius:"50%",background:"rgba(74,222,128,.08)",border:"1px solid rgba(74,222,128,.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            <span className="material-icons" style={{fontSize:14,color:"#4ade80"}}>sports_soccer</span>
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"#fff"}}>{ev.playerName||`#${ev.playerID}`}</div>
                            <div style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{ev.teamName||"—"} · {ev.additionalInfo||""}</div>
                          </div>
                          {ev.minute!=null && (
                            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:12,color:"#fbbf24",marginRight:8}}>{ev.minute}'</div>
                          )}
                          <button className="ibtn del" onClick={()=>deleteEvent(ev.id)}>
                            <span className="material-icons" style={{fontSize:13}}>delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: LINEUP ── */}
              {modalTab==="lineup" && (
                <div>
                  {loadingDetail ? (
                    <div style={{fontSize:12,color:"rgba(255,255,255,.3)",padding:"20px 0"}}>Chargement…</div>
                  ) : matchPlayers.length===0 ? (
                    <div className="empty"><span className="material-icons">people</span><span>Aucun joueur enregistré</span></div>
                  ) : (
                    matchTeams.map(team=>(
                      <div key={team.id} style={{marginBottom:20}}>
                        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color:"#fff",marginBottom:10,padding:"8px 12px",background:"rgba(255,255,255,.04)",borderRadius:8,borderLeft:"3px solid #C1272D"}}>
                          {team.name}
                        </div>
                        {matchPlayers.filter(p=>String(p.teamId)===String(team.id)).map((p,i)=>(
                          <div key={p.id||i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 4px",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                            <div style={{width:28,height:28,borderRadius:"50%",background:hue(p.name),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:10,color:"#fff",flexShrink:0}}>
                              {initials(p.name)}
                            </div>
                            <div style={{flex:1}}>
                              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"#fff"}}>{p.name}</div>
                              {p.goals>0 && <div style={{fontSize:10,color:"#4ade80"}}>⚽ {p.goals} but{p.goals>1?"s":""}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ═══ TOAST ═══ */}
      {toast && (
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:toast.type==="success"?"rgba(22,163,74,.95)":"rgba(193,39,45,.95)",color:"#fff",padding:"11px 20px",borderRadius:10,fontSize:13,fontFamily:"'Syne',sans-serif",fontWeight:700,display:"flex",alignItems:"center",gap:9,zIndex:300,boxShadow:"0 8px 28px rgba(0,0,0,.5)",whiteSpace:"nowrap"}}>
          <span className="material-icons" style={{fontSize:17}}>{toast.type==="success"?"check_circle":"cancel"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}