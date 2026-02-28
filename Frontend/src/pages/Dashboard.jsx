"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BASE = "https://anas-gana1-fandb-backend.hf.space/api";

/* ─────────────────────────────────────────────────────────────────────────── */
export default function AdminDashboard() {

  /* ── tab ── */
  const [tab, setTab] = useState("overview");

  /* ── data ── */
  const [responsables, setResponsables] = useState([]);
  const [matches,      setMatches]      = useState([]);
  const [predictions,  setPredictions]  = useState([]);
  const [leaderboard,  setLeaderboard]  = useState([]);
  const [teams,        setTeams]        = useState([]);
  const [topScorers,   setTopScorers]   = useState([]);
  const [playerStats,  setPlayerStats]  = useState(null);
  const [loading,      setLoading]      = useState(true);

  /* ── side panel ── */
  const [panel,        setPanel]        = useState(null); // responsable object
  const [panelStades,  setPanelStades]  = useState([]);
  const [loadingPanel, setLoadingPanel] = useState(false);

  /* ── filters ── */
  const [searchR,       setSearchR]      = useState("");
  const [filterCountry, setFCountry]     = useState("");
  const [searchM,       setSearchM]      = useState("");
  const [filterStatus,  setFStatus]      = useState("");

  /* ── CRUD modal ── */
  const [modal,  setModal]  = useState(null); // "add"|"edit"|"del"
  const [form,   setForm]   = useState({});
  const [saving, setSaving] = useState(false);
  const [toast,  setToast]  = useState(null);

  /* ══════════════ LOAD ══════════════ */
  const loadAll = () => {
    setLoading(true);
    Promise.all([
      fetch(`${BASE}/responsables`).then(r=>r.json()).catch(()=>[]),
      fetch(`${BASE}/matches/matches/all`).then(r=>r.json()).catch(()=>[]),
      fetch(`${BASE}/predictions/all`).then(r=>r.json()).catch(()=>[]),
      fetch(`${BASE}/predictions/leaderboard/top10`).then(r=>r.json()).catch(()=>[]),
      fetch(`${BASE}/teams/teams/all`).then(r=>r.json()).catch(()=>[]),
      fetch(`${BASE}/players/top/scorers?limit=10`).then(r=>r.json()).catch(()=>[]),
      fetch(`${BASE}/players/stats`).then(r=>r.json()).catch(()=>null),
    ]).then(([res,mat,pred,lb,tm,sc,ps]) => {
      setResponsables(Array.isArray(res)?res:[]);
      setMatches(Array.isArray(mat)?mat:[]);
      setPredictions(Array.isArray(pred)?pred:[]);
      setLeaderboard(Array.isArray(lb)?lb:[]);
      setTeams(Array.isArray(tm)?tm:[]);
      setTopScorers(Array.isArray(sc)?sc:[]);
      setPlayerStats(ps && typeof ps==="object"?ps:null);
      setLoading(false);
    });
  };
  useEffect(()=>{ loadAll(); },[]);

  /* ── open panel ── */
  const openPanel = async (r) => {
    setPanel(r); setPanelStades([]); setLoadingPanel(true);
    try {
      const d = await fetch(`${BASE}/responsables/${r.id}/stades`).then(x=>x.json());
      setPanelStades(Array.isArray(d)?d:[]);
    } catch(_){}
    setLoadingPanel(false);
  };

  /* ── toast ── */
  const showToast = (type, msg) => { setToast({type,msg}); setTimeout(()=>setToast(null),3200); };

  /* ── CRUD ── */
  const openAdd  = ()    => { setForm({name:"",age:"",email:"",phone:"",country:"",imageUrl:""}); setModal("add"); };
  const openEdit = (r,e) => { e?.stopPropagation(); setForm({...r}); setModal("edit"); };
  const openDel  = (r,e) => { e?.stopPropagation(); setForm({...r}); setModal("del"); };

  const handleSave = async () => {
    if(!form.name||!form.email){showToast("error","Nom et email obligatoires.");return;}
    setSaving(true);
    try {
      const isEdit = modal==="edit";
      const res = await fetch(isEdit?`${BASE}/responsables/update/${form.id}`:`${BASE}/responsables/add`,{
        method: isEdit?"PUT":"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form),
      });
      if(res.ok){showToast("success",isEdit?"Mis à jour !":"Ajouté !");setModal(null);loadAll();}
      else showToast("error","Échec de l'opération.");
    }catch(_){showToast("error","Erreur réseau.");}
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/responsables/delete/${form.id}`,{method:"DELETE"});
      if(res.ok||res.status===204){
        showToast("success","Supprimé !");setModal(null);setPanel(null);loadAll();
      }else showToast("error","Suppression échouée.");
    }catch(_){showToast("error","Erreur réseau.");}
    setSaving(false);
  };

  /* ── helpers ── */
  const countries = [...new Set(responsables.map(r=>r.country).filter(Boolean))].sort();
  const statuses  = [...new Set(matches.map(m=>m.status).filter(Boolean))];

  const filteredR = responsables.filter(r => {
    const q = searchR.toLowerCase();
    return (!q||r.name?.toLowerCase().includes(q)||r.email?.toLowerCase().includes(q))
        && (!filterCountry||r.country===filterCountry);
  });
  const filteredM = matches.filter(m => {
    const q = searchM.toLowerCase();
    return (!q||m.team1Name?.toLowerCase().includes(q)||m.team2Name?.toLowerCase().includes(q)||m.stadeName?.toLowerCase().includes(q))
        && (!filterStatus||m.status===filterStatus);
  });

  const liveCount     = matches.filter(m=>m.status?.toLowerCase()==="live"||m.status?.toLowerCase()==="started").length;
  const finishedCount = matches.filter(m=>m.status?.toLowerCase()==="finished").length;
  const pendingCount  = matches.filter(m=>m.status?.toLowerCase()==="pending"||m.status?.toLowerCase()==="scheduled").length;
  const correctPreds  = predictions.filter(p=>p.status?.toLowerCase()==="correct").length;

  const initials = n => n?n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase():"?";
  const aColor   = n => {
    const c=["#C1272D","#006233","#b45309","#0369a1","#7c3aed","#0f766e"];
    let h=0; for(const x of(n||"")) h=(h*31+x.charCodeAt(0))%c.length; return c[h];
  };
  const statusColor = s => {
    const sl=(s||"").toLowerCase();
    if(sl==="live"||sl==="started")   return{bg:"rgba(193,39,45,.15)",color:"#f87171",border:"rgba(193,39,45,.35)"};
    if(sl==="finished")               return{bg:"rgba(0,98,51,.12)",color:"#4ade80",border:"rgba(0,98,51,.3)"};
    if(sl==="direct")                 return{bg:"rgba(251,191,36,.12)",color:"#fbbf24",border:"rgba(251,191,36,.3)"};
    return{bg:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.5)",border:"rgba(255,255,255,.12)"};
  };
  const predColor = s => {
    const sl=(s||"").toLowerCase();
    if(sl==="correct")   return{bg:"rgba(0,98,51,.12)",  color:"#4ade80"};
    if(sl==="incorrect") return{bg:"rgba(193,39,45,.12)",color:"#f87171"};
    return{bg:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.4)"};
  };

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <>
      <Head>
        <title>Admin Dashboard | MoroccoFan2030</title>
        <link rel="icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&family=Amiri:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        *,*::before,*::after{box-sizing:border-box}
        body{font-family:'Inter',sans-serif;background:#09020a;color:#fff;-webkit-font-smoothing:antialiased;margin:0}

        @keyframes ad-up  {from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
        @keyframes ad-fade{from{opacity:0}to{opacity:1}}
        @keyframes ad-spin{to{transform:rotate(360deg)}}
        @keyframes ad-sc  {from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
        .ad .au{animation:ad-up .55s cubic-bezier(.22,.68,0,1.2) both}
        .ad .af{animation:ad-fade .35s ease both}
        .ad .d1{animation-delay:.05s}.ad .d2{animation-delay:.11s}
        .ad .d3{animation-delay:.17s}.ad .d4{animation-delay:.23s}.ad .d5{animation-delay:.29s}
        .ad .spin{animation:ad-spin 1s linear infinite}

        /* ── stat chip ── */
        .ad .sc{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:18px 22px;display:flex;flex-direction:column;gap:4px;transition:border-color .2s}
        .ad .sc:hover{border-color:rgba(193,39,45,.3)}

        /* ── tab ── */
        .ad .tb{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:10px;font-family:'Syne',sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;border:none;cursor:pointer;transition:all .18s;white-space:nowrap}
        .ad .tb-on{background:linear-gradient(135deg,#C1272D,#a01e23);color:#fff;box-shadow:0 4px 16px rgba(193,39,45,.3)}
        .ad .tb-off{background:rgba(255,255,255,.06);color:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.08)}
        .ad .tb-off:hover{background:rgba(255,255,255,.1);color:#fff}

        /* ── card ── */
        .ad .card{background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06);border-radius:16px;transition:all .2s}
        .ad .card-hover:hover{border-color:rgba(193,39,45,.3);background:rgba(193,39,45,.04);transform:translateY(-2px);box-shadow:0 12px 36px rgba(193,39,45,.1);cursor:pointer}

        /* ── filter bar ── */
        .ad .fbar{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:18px 22px;margin-bottom:24px}
        .ad .fbar input,.ad .fbar select{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-family:'Syne',sans-serif;font-size:12px;font-weight:600;padding:10px 14px;outline:none;transition:border-color .18s;appearance:none;-webkit-appearance:none}
        .ad .fbar input::placeholder{color:rgba(255,255,255,.3)}
        .ad .fbar input:focus,.ad .fbar select:focus{border-color:rgba(193,39,45,.5)}
        .ad .fbar select option{background:#1c0a0b;color:#fff}

        /* ── badge ── */
        .ad .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;border:1px solid;font-family:'Syne',sans-serif}

        /* ── icon btn ── */
        .ad .ibtn{width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;color:rgba(255,255,255,.5)}
        .ad .ibtn:hover{border-color:#C1272D;color:#C1272D;background:rgba(193,39,45,.1)}
        .ad .ibtn-del:hover{border-color:#ef4444;color:#ef4444;background:rgba(239,68,68,.1)}

        /* ── buttons ── */
        .ad .btn-p{display:inline-flex;align-items:center;gap:8px;padding:11px 20px;background:#C1272D;color:#fff;border:none;border-radius:12px;font-family:'Syne',sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all .18s}
        .ad .btn-p:hover{background:#a01f24;transform:translateY(-1px)}
        .ad .btn-s{display:inline-flex;align-items:center;gap:8px;padding:11px 20px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.75);border:1px solid rgba(255,255,255,.1);border-radius:12px;font-family:'Syne',sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all .18s}
        .ad .btn-s:hover{background:rgba(255,255,255,.1)}
        .ad .btn-d{display:inline-flex;align-items:center;gap:8px;padding:11px 20px;background:rgba(239,68,68,.15);color:#ef4444;border:1px solid rgba(239,68,68,.3);border-radius:12px;font-family:'Syne',sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all .18s}
        .ad .btn-d:hover{background:rgba(239,68,68,.25)}

        /* ── overlay + modal ── */
        .ad .overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px}
        .ad .modal{background:#160a0b;border:1px solid rgba(255,255,255,.1);border-radius:22px;padding:28px;width:100%;max-width:500px;animation:ad-sc .25s ease both;max-height:90vh;overflow-y:auto}
        .ad .modal-sm{max-width:380px}

        /* ── form field ── */
        .ad .field{margin-bottom:14px}
        .ad .field label{display:block;font-size:11px;font-weight:700;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;font-family:'Syne',sans-serif}
        .ad .field input{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-family:'Inter',sans-serif;font-size:14px;padding:11px 14px;outline:none;transition:border-color .18s}
        .ad .field input:focus{border-color:rgba(193,39,45,.5)}
        .ad .field input::placeholder{color:rgba(255,255,255,.25)}

        /* ── side panel ── */
        .ad .spanel{position:fixed;right:0;top:0;bottom:0;width:420px;max-width:100vw;background:#120608;border-left:1px solid rgba(255,255,255,.08);z-index:90;overflow-y:auto;animation:ad-fade .25s ease both;display:flex;flex-direction:column}

        /* ── table row ── */
        .ad .trow{display:grid;align-items:center;gap:12px;padding:13px 18px;border-bottom:1px solid rgba(255,255,255,.04);transition:background .15s}
        .ad .trow:hover{background:rgba(255,255,255,.03)}
        .ad .trow:last-child{border-bottom:none}

        /* ── leaderboard row ── */
        .ad .lrow{display:grid;grid-template-columns:44px 1fr 80px 80px;align-items:center;gap:10px;padding:12px 18px;border-bottom:1px solid rgba(255,255,255,.04);transition:background .15s}
        .ad .lrow:hover{background:rgba(255,255,255,.03)}
        .ad .lrow:last-child{border-bottom:none}

        .ad .gold{color:#f0a500}.ad .silver{color:#a8b2bf}.ad .bronze{color:#cd7f32}

        @media(max-width:768px){
          .ad .stats-grid{grid-template-columns:1fr 1fr!important}
          .ad .cards-grid{grid-template-columns:1fr!important}
          .ad .spanel{width:100vw}
          .ad .tab-bar{overflow-x:auto}
        }
        @media(max-width:480px){
          .ad .stats-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      <Navbar />

      <div className="ad">

        {/* ══════════ HERO HEADER ══════════ */}
        <header style={{position:"relative",overflow:"hidden",background:"#09020a",borderBottom:"1px solid rgba(255,255,255,.06)",paddingTop:90}}>
          {/* glows */}
          <div style={{position:"absolute",top:-80,right:-40,width:500,height:500,background:"radial-gradient(circle,rgba(193,39,45,.18),transparent 70%)",filter:"blur(90px)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",bottom:-60,left:-80,width:400,height:400,background:"radial-gradient(circle,rgba(0,98,51,.12),transparent 70%)",filter:"blur(80px)",pointerEvents:"none"}}/>
          {/* zellige */}
          <div style={{position:"absolute",inset:0,opacity:.025,backgroundImage:"repeating-linear-gradient(45deg,#C1272D 0,#C1272D 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,#006233 0,#006233 1px,transparent 0,transparent 50%)",backgroundSize:"20px 20px",pointerEvents:"none"}}/>

          <div style={{maxWidth:1260,margin:"0 auto",padding:"44px 24px 48px",position:"relative",zIndex:2}}>
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:24,flexWrap:"wrap"}}>
              <div>
                <div className="au" style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,fontSize:10,fontFamily:"Syne,sans-serif",color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".1em"}}>
                  <span className="material-icons" style={{fontSize:14}}>admin_panel_settings</span>
                  Admin
                  <span className="material-icons" style={{fontSize:14}}>chevron_right</span>
                  <span style={{color:"#C1272D"}}>Dashboard</span>
                </div>
                <h1 className="au d1" style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"clamp(28px,4.5vw,52px)",color:"#fff",lineHeight:1.05,margin:0}}>
                  Admin <span style={{color:"#C1272D"}}>Dashboard</span>
                </h1>
                <p className="au d2" style={{fontFamily:"Inter,sans-serif",fontSize:14,color:"rgba(255,255,255,.45)",maxWidth:480,lineHeight:1.7,margin:"10px 0 0"}}>
                  Gestion complète — Responsables, Matches, Prédictions, Équipes &amp; Joueurs.
                </p>
              </div>
              <div className="au d3" style={{fontFamily:"Amiri,serif",fontStyle:"italic",fontSize:28,color:"rgba(0,98,51,.35)",lineHeight:1.2,textAlign:"right"}}>
                لوحة<br/>التحكم
              </div>
            </div>

            {/* ── KPI chips ── */}
            <div className="au d3 stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginTop:32}}>
              {[
                {label:"Responsables", value:loading?"…":responsables.length, icon:"manage_accounts", color:"rgba(255,255,255,.85)"},
                {label:"Matches",      value:loading?"…":matches.length,       icon:"sports_soccer",   color:"#fbbf24"},
                {label:"Live",         value:loading?"…":liveCount,            icon:"fiber_manual_record", color:"#f87171"},
                {label:"Équipes",      value:loading?"…":teams.length,         icon:"groups",          color:"#4ade80"},
                {label:"Prédictions",  value:loading?"…":predictions.length,   icon:"psychology",      color:"#a78bfa"},
                {label:"Correctes",    value:loading?"…":correctPreds,         icon:"check_circle",    color:"#C1272D"},
              ].map(({label,value,icon,color})=>(
                <div key={label} className="sc">
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span className="material-icons" style={{fontSize:17,color,opacity:.85}}>{icon}</span>
                    <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:24,color}}>{value}</span>
                  </div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".08em",fontWeight:500}}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tab bar ── */}
          <div className="au d4 tab-bar" style={{maxWidth:1260,margin:"0 auto",padding:"0 24px 0",display:"flex",gap:8,overflowX:"auto",paddingBottom:0}}>
            {[
              {id:"overview",     icon:"dashboard",          label:"Vue d'ensemble"},
              {id:"responsables", icon:"manage_accounts",    label:"Responsables"},
              {id:"matches",      icon:"sports_soccer",      label:"Matches"},
              {id:"predictions",  icon:"psychology",         label:"Prédictions"},
              {id:"teams",        icon:"groups",             label:"Équipes"},
              {id:"players",      icon:"person",             label:"Joueurs"},
            ].map(({id,icon,label})=>(
              <button key={id} className={`tb ${tab===id?"tb-on":"tb-off"}`} onClick={()=>setTab(id)}>
                <span className="material-icons" style={{fontSize:16}}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
          <div style={{height:1,background:"rgba(255,255,255,.06)",marginTop:16}}/>
        </header>

        {/* ══════════ CONTENT ══════════ */}
        <main style={{maxWidth:1260,margin:"0 auto",padding:"32px 24px 80px"}}>

          {loading && (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:260,gap:14}}>
              <div className="spin" style={{width:36,height:36,border:"3px solid #C1272D",borderTopColor:"transparent",borderRadius:"50%"}}/>
              <span style={{fontFamily:"Syne,sans-serif",color:"rgba(255,255,255,.4)",fontSize:14}}>Chargement…</span>
            </div>
          )}

          {/* ════════ OVERVIEW ════════ */}
          {!loading && tab==="overview" && (
            <div className="au" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>

              {/* ── Matches récents ── */}
              <div className="card" style={{padding:0,gridColumn:"span 2"}}>
                <div style={{padding:"18px 22px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:"#fff",display:"flex",alignItems:"center",gap:10}}>
                    <span className="material-icons" style={{fontSize:18,color:"#C1272D"}}>sports_soccer</span>
                    Derniers Matches
                  </div>
                  <button className="tb tb-off" style={{padding:"6px 14px",fontSize:10}} onClick={()=>setTab("matches")}>
                    Voir tout <span className="material-icons" style={{fontSize:13}}>arrow_forward</span>
                  </button>
                </div>
                {matches.slice(0,5).map((m,i)=>{
                  const sc = statusColor(m.status);
                  return (
                    <div key={m.id||i} className="trow" style={{gridTemplateColumns:"1fr 1fr 100px 80px"}}>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:"#fff"}}>{m.team1Name||"—"}</div>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:"rgba(255,255,255,.6)"}}>{m.team2Name||"—"}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>{m.stadeName||"—"}</div>
                      <div>
                        <span style={{padding:"3px 10px",borderRadius:99,fontSize:10,fontWeight:700,fontFamily:"Syne,sans-serif",background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`,textTransform:"uppercase",letterSpacing:".06em"}}>
                          {m.status||"—"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Top 5 leaderboard ── */}
              <div className="card" style={{padding:0}}>
                <div style={{padding:"18px 22px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:"#fff",display:"flex",alignItems:"center",gap:10}}>
                    <span className="material-icons" style={{fontSize:18,color:"#fbbf24"}}>emoji_events</span>
                    Top Supporters
                  </div>
                  <button className="tb tb-off" style={{padding:"6px 14px",fontSize:10}} onClick={()=>setTab("predictions")}>
                    Voir tout <span className="material-icons" style={{fontSize:13}}>arrow_forward</span>
                  </button>
                </div>
                {leaderboard.slice(0,5).map((s,i)=>(
                  <div key={s.id||i} className="lrow">
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:16,textAlign:"center",color:i===0?"#f0a500":i===1?"#a8b2bf":i===2?"#cd7f32":"rgba(255,255,255,.35)"}}>
                      {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                    </div>
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,.4)",textAlign:"right"}}>{s.email?.split("@")[0]||"—"}</div>
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:14,color:"#C1272D",textAlign:"right"}}>{s.totalPoints} pts</div>
                  </div>
                ))}
              </div>

              {/* ── Top scorers ── */}
              <div className="card" style={{padding:0}}>
                <div style={{padding:"18px 22px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:"#fff",display:"flex",alignItems:"center",gap:10}}>
                    <span className="material-icons" style={{fontSize:18,color:"#4ade80"}}>person</span>
                    Top Buteurs
                  </div>
                  <button className="tb tb-off" style={{padding:"6px 14px",fontSize:10}} onClick={()=>setTab("players")}>
                    Voir tout <span className="material-icons" style={{fontSize:13}}>arrow_forward</span>
                  </button>
                </div>
                {topScorers.slice(0,5).map((p,i)=>(
                  <div key={p.id||i} className="lrow">
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:14,textAlign:"center",color:i===0?"#f0a500":i===1?"#a8b2bf":i===2?"#cd7f32":"rgba(255,255,255,.35)"}}>#{i+1}</div>
                    <div>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:"#fff"}}>{p.name}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:2}}>{p.team}</div>
                    </div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.4)",textAlign:"right"}}>{p.team}</div>
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:14,color:"#4ade80",textAlign:"right",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:4}}>
                      <span className="material-icons" style={{fontSize:14,color:"#4ade80"}}>sports_soccer</span>{p.goals}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Match status distribution ── */}
              <div className="card" style={{padding:"20px 22px",gridColumn:"span 2"}}>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:"#fff",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
                  <span className="material-icons" style={{fontSize:18,color:"#a78bfa"}}>bar_chart</span>
                  Répartition des Matches
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                  {[
                    {label:"En direct", value:liveCount,     color:"#f87171", icon:"fiber_manual_record"},
                    {label:"Terminés",  value:finishedCount, color:"#4ade80", icon:"check_circle"},
                    {label:"À venir",   value:pendingCount,  color:"#fbbf24", icon:"schedule"},
                    {label:"Total",     value:matches.length,color:"#a78bfa", icon:"sports_soccer"},
                  ].map(({label,value,color,icon})=>(
                    <div key={label} style={{background:"rgba(255,255,255,.04)",border:`1px solid ${color}22`,borderRadius:14,padding:"18px 20px",display:"flex",flexDirection:"column",gap:6}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span className="material-icons" style={{fontSize:18,color,opacity:.85}}>{icon}</span>
                        <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:28,color}}>{value}</span>
                      </div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".08em",fontWeight:500}}>{label}</div>
                      {/* bar */}
                      <div style={{height:4,borderRadius:99,background:"rgba(255,255,255,.06)",marginTop:4}}>
                        <div style={{height:"100%",borderRadius:99,background:color,width:`${matches.length?Math.round((value/matches.length)*100):0}%`,transition:"width .6s ease"}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════ RESPONSABLES ════════ */}
          {!loading && tab==="responsables" && (
            <div className="au">
              {/* filter */}
              <div className="fbar" style={{display:"grid",gridTemplateColumns:"1fr 180px auto",gap:12,alignItems:"end"}}>
                <div>
                  <div style={{fontSize:10,fontFamily:"Syne,sans-serif",fontWeight:700,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Rechercher</div>
                  <div style={{position:"relative"}}>
                    <span className="material-icons" style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:16,color:"rgba(255,255,255,.3)"}}>search</span>
                    <input value={searchR} onChange={e=>setSearchR(e.target.value)} placeholder="Nom ou email…" style={{paddingLeft:34}}/>
                  </div>
                </div>
                <div>
                  <div style={{fontSize:10,fontFamily:"Syne,sans-serif",fontWeight:700,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Pays</div>
                  <select value={filterCountry} onChange={e=>setFCountry(e.target.value)}>
                    <option value="">Tous les pays</option>
                    {countries.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button className="btn-p" onClick={openAdd}>
                  <span className="material-icons" style={{fontSize:17}}>add</span>Ajouter
                </button>
              </div>

              {/* grid */}
              <div className="cards-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
                {filteredR.length===0 ? (
                  <div style={{gridColumn:"1/-1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:200,gap:12}}>
                    <span className="material-icons" style={{fontSize:48,color:"rgba(255,255,255,.1)"}}>manage_accounts</span>
                    <div style={{fontFamily:"Syne,sans-serif",color:"rgba(255,255,255,.3)",fontSize:14}}>Aucun responsable trouvé</div>
                  </div>
                ) : filteredR.map((r,i)=>(
                  <div key={r.id} className="card card-hover" style={{padding:20,display:"flex",flexDirection:"column",gap:14,animationDelay:`${i*.04}s`}} onClick={()=>openPanel(r)}>
                    <div style={{display:"flex",alignItems:"center",gap:14}}>
                      {r.imageUrl
                        ? <img src={r.imageUrl} alt={r.name} style={{width:50,height:50,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,.1)",flexShrink:0}}/>
                        : <div style={{width:50,height:50,borderRadius:"50%",background:aColor(r.name),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:17,color:"#fff",flexShrink:0}}>{initials(r.name)}</div>
                      }
                      <div style={{flex:1,overflow:"hidden"}}>
                        <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.name}</div>
                        <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.email}</div>
                      </div>
                      <div style={{display:"flex",gap:5,flexShrink:0}}>
                        <button className="ibtn" onClick={e=>openEdit(r,e)} title="Modifier"><span className="material-icons" style={{fontSize:14}}>edit</span></button>
                        <button className="ibtn ibtn-del" onClick={e=>openDel(r,e)} title="Supprimer"><span className="material-icons" style={{fontSize:14}}>delete</span></button>
                      </div>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {r.country && <span className="badge" style={{background:"rgba(0,98,51,.12)",color:"#4ade80",borderColor:"rgba(0,98,51,.3)"}}><span className="material-icons" style={{fontSize:11}}>public</span>{r.country}</span>}
                      {r.age     && <span className="badge" style={{background:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.5)",borderColor:"rgba(255,255,255,.12)"}}><span className="material-icons" style={{fontSize:11}}>cake</span>{r.age} ans</span>}
                    </div>
                    {r.phone && <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"rgba(255,255,255,.4)"}}><span className="material-icons" style={{fontSize:14}}>phone</span>{r.phone}</div>}
                    <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"rgba(193,39,45,.7)",marginTop:"auto"}}>
                      <span className="material-icons" style={{fontSize:14}}>stadium</span>Voir les stades
                      <span className="material-icons" style={{fontSize:14,marginLeft:"auto"}}>arrow_forward</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ MATCHES ════════ */}
          {!loading && tab==="matches" && (
            <div className="au">
              <div className="fbar" style={{display:"grid",gridTemplateColumns:"1fr 160px",gap:12,alignItems:"end"}}>
                <div>
                  <div style={{fontSize:10,fontFamily:"Syne,sans-serif",fontWeight:700,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Rechercher un match</div>
                  <div style={{position:"relative"}}>
                    <span className="material-icons" style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:16,color:"rgba(255,255,255,.3)"}}>search</span>
                    <input value={searchM} onChange={e=>setSearchM(e.target.value)} placeholder="Équipe ou stade…" style={{paddingLeft:34}}/>
                  </div>
                </div>
                <div>
                  <div style={{fontSize:10,fontFamily:"Syne,sans-serif",fontWeight:700,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Statut</div>
                  <select value={filterStatus} onChange={e=>setFStatus(e.target.value)}>
                    <option value="">Tous</option>
                    {statuses.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="card" style={{padding:0}}>
                <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"grid",gridTemplateColumns:"1fr 1fr 100px 80px 80px",gap:12,fontSize:10,fontFamily:"Syne,sans-serif",fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".08em"}}>
                  <div>Équipe 1</div><div>Équipe 2</div><div>Stade</div><div>Date</div><div>Statut</div>
                </div>
                {filteredM.length===0 ? (
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 0",gap:10}}>
                    <span className="material-icons" style={{fontSize:40,color:"rgba(255,255,255,.1)"}}>sports_soccer</span>
                    <div style={{fontFamily:"Syne,sans-serif",color:"rgba(255,255,255,.3)",fontSize:14}}>Aucun match trouvé</div>
                  </div>
                ) : filteredM.map((m,i)=>{
                  const sc=statusColor(m.status);
                  const d=m.dateOfMatch?new Date(m.dateOfMatch).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"}):"—";
                  return(
                    <div key={m.id||i} className="trow" style={{gridTemplateColumns:"1fr 1fr 100px 80px 80px"}}>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.team1Name||"—"}</div>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:13,color:"rgba(255,255,255,.65)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.team2Name||"—"}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.4)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.stadeName||"—"}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>{d}</div>
                      <div>
                        <span style={{padding:"3px 8px",borderRadius:99,fontSize:10,fontWeight:700,fontFamily:"Syne,sans-serif",background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`,textTransform:"uppercase",letterSpacing:".06em",whiteSpace:"nowrap"}}>
                          {m.status||"—"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════ PREDICTIONS ════════ */}
          {!loading && tab==="predictions" && (
            <div className="au" style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:20,alignItems:"start"}}>

              {/* predictions list */}
              <div>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:"#fff",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                  <span className="material-icons" style={{fontSize:18,color:"#a78bfa"}}>psychology</span>
                  Toutes les Prédictions ({predictions.length})
                </div>
                <div className="card" style={{padding:0}}>
                  <div style={{padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"grid",gridTemplateColumns:"60px 1fr 1fr 70px 60px",gap:10,fontSize:10,fontFamily:"Syne,sans-serif",fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".08em"}}>
                    <div>ID</div><div>Match</div><div>Pronostic</div><div>Statut</div><div>Pts</div>
                  </div>
                  {predictions.slice(0,20).map((p,i)=>{
                    const pc=predColor(p.status);
                    return(
                      <div key={p.id||i} className="trow" style={{gridTemplateColumns:"60px 1fr 1fr 70px 60px"}}>
                        <div style={{fontSize:11,color:"rgba(255,255,255,.3)",fontFamily:"Syne,sans-serif"}}>#{p.id}</div>
                        <div>
                          <div style={{fontSize:12,fontFamily:"Syne,sans-serif",fontWeight:700,color:"#fff"}}>{p.team1Name||"—"} vs {p.team2Name||"—"}</div>
                          <div style={{fontSize:10,color:"rgba(255,255,255,.35)",marginTop:2}}>#{p.matchId}</div>
                        </div>
                        <div style={{fontSize:12,fontFamily:"Syne,sans-serif",fontWeight:600,color:"rgba(255,255,255,.7)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.predictedWinnerName||"—"}</div>
                        <div>
                          <span style={{padding:"3px 8px",borderRadius:99,fontSize:10,fontWeight:700,fontFamily:"Syne,sans-serif",background:pc.bg,color:pc.color,border:`1px solid ${pc.color}33`,textTransform:"uppercase",letterSpacing:".05em"}}>
                            {p.status||"—"}
                          </span>
                        </div>
                        <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:13,color:"#C1272D"}}>{p.points??0}</div>
                      </div>
                    );
                  })}
                  {predictions.length>20 && (
                    <div style={{padding:"12px 18px",fontSize:12,color:"rgba(255,255,255,.3)",textAlign:"center",fontFamily:"Syne,sans-serif"}}>
                      … et {predictions.length-20} autres prédictions
                    </div>
                  )}
                </div>
              </div>

              {/* leaderboard */}
              <div>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:"#fff",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                  <span className="material-icons" style={{fontSize:18,color:"#fbbf24"}}>emoji_events</span>
                  Classement Top 10
                </div>
                <div className="card" style={{padding:0}}>
                  {leaderboard.map((s,i)=>(
                    <div key={s.id||i} className="lrow" style={{gridTemplateColumns:"40px 1fr 80px"}}>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,textAlign:"center",color:i===0?"#f0a500":i===1?"#a8b2bf":i===2?"#cd7f32":"rgba(255,255,255,.3)"}}>
                        {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                      </div>
                      <div>
                        <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>{s.email}</div>
                      </div>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:14,color:"#C1272D",textAlign:"right"}}>{s.totalPoints} pts</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════ TEAMS ════════ */}
          {!loading && tab==="teams" && (
            <div className="au">
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:"#fff",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
                <span className="material-icons" style={{fontSize:18,color:"#4ade80"}}>groups</span>
                Équipes en compétition ({teams.length})
              </div>
              <div className="cards-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
                {teams.map((t,i)=>(
                  <div key={t.id||i} className="card card-hover" style={{padding:20,display:"flex",flexDirection:"column",gap:12,animationDelay:`${i*.03}s`}}>
                    <div style={{display:"flex",alignItems:"center",gap:14}}>
                      {t.imageUrl
                        ? <img src={t.imageUrl} alt={t.name} style={{width:48,height:48,borderRadius:10,objectFit:"cover",flexShrink:0}}/>
                        : <div style={{width:48,height:48,borderRadius:10,background:aColor(t.name),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:16,color:"#fff",flexShrink:0}}>{initials(t.name)}</div>
                      }
                      <div style={{flex:1,overflow:"hidden"}}>
                        <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.name}</div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:2}}>{t.country||"—"}</div>
                      </div>
                    </div>
                    {t.coach && (
                      <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"rgba(255,255,255,.45)"}}>
                        <span className="material-icons" style={{fontSize:14}}>person</span>Coach: <span style={{color:"rgba(255,255,255,.7)"}}>{t.coach}</span>
                      </div>
                    )}
                    {t.participation!==undefined && (
                      <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"rgba(255,255,255,.45)"}}>
                        <span className="material-icons" style={{fontSize:14}}>emoji_events</span>
                        <span style={{color:"rgba(255,255,255,.7)"}}>{t.participation} participations</span>
                      </div>
                    )}
                    {t.description && (
                      <div style={{fontSize:12,color:"rgba(255,255,255,.35)",lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{t.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ PLAYERS ════════ */}
          {!loading && tab==="players" && (
            <div className="au">
              {/* player stats */}
              {playerStats && (
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:24}}>
                  {[
                    {label:"Total Joueurs", value:playerStats.totalPlayers,  color:"rgba(255,255,255,.85)", icon:"person"},
                    {label:"Total Buts",    value:playerStats.totalGoals,    color:"#C1272D",               icon:"sports_soccer"},
                    {label:"Âge moyen",    value:playerStats.averageAge?.toFixed(1), color:"#fbbf24", icon:"cake"},
                    {label:"Taille moy.",  value:playerStats.averageHeight?.toFixed(0)+"cm", color:"#4ade80", icon:"height"},
                    {label:"Poids moy.",   value:playerStats.averageWeight?.toFixed(0)+"kg", color:"#a78bfa", icon:"monitor_weight"},
                  ].map(({label,value,color,icon})=>(
                    <div key={label} className="sc">
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span className="material-icons" style={{fontSize:17,color,opacity:.85}}>{icon}</span>
                        <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:22,color}}>{value}</span>
                      </div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".08em",fontWeight:500}}>{label}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:"#fff",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                <span className="material-icons" style={{fontSize:18,color:"#fbbf24"}}>emoji_events</span>
                Top 10 Buteurs
              </div>
              <div className="card" style={{padding:0}}>
                <div style={{padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"grid",gridTemplateColumns:"50px 1fr 120px 60px 60px 60px",gap:12,fontSize:10,fontFamily:"Syne,sans-serif",fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".08em"}}>
                  <div>Rang</div><div>Joueur</div><div>Équipe</div><div>Buts</div><div>Taille</div><div>Âge</div>
                </div>
                {topScorers.map((p,i)=>(
                  <div key={p.id||i} className="trow" style={{gridTemplateColumns:"50px 1fr 120px 60px 60px 60px"}}>
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:14,textAlign:"center",color:i===0?"#f0a500":i===1?"#a8b2bf":i===2?"#cd7f32":"rgba(255,255,255,.3)"}}>
                      {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      {p.urlImage
                        ? <img src={p.urlImage} alt={p.name} style={{width:34,height:34,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                        : <div style={{width:34,height:34,borderRadius:"50%",background:aColor(p.name),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:"#fff",flexShrink:0}}>{initials(p.name)}</div>
                      }
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                    </div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,.55)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.team}</div>
                    <div style={{display:"flex",alignItems:"center",gap:4,fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:14,color:"#4ade80"}}>
                      <span className="material-icons" style={{fontSize:13}}>sports_soccer</span>{p.goals}
                    </div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>{p.height?`${p.height}cm`:"—"}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>{p.age||"—"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ══════════ SIDE PANEL (responsable detail) ══════════ */}
      {panel && (
        <>
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:89}} onClick={()=>setPanel(null)}/>
          <div className="ad spanel">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 22px 14px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:"#fff"}}>Profil Responsable</div>
              <button className="ibtn" onClick={()=>setPanel(null)}><span className="material-icons" style={{fontSize:18}}>close</span></button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:22}}>
              {/* avatar */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,marginBottom:26}}>
                {panel.imageUrl
                  ? <img src={panel.imageUrl} alt={panel.name} style={{width:84,height:84,borderRadius:"50%",objectFit:"cover",border:"3px solid rgba(193,39,45,.4)"}}/>
                  : <div style={{width:84,height:84,borderRadius:"50%",background:aColor(panel.name),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:28,color:"#fff",border:"3px solid rgba(255,255,255,.1)"}}>{initials(panel.name)}</div>
                }
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:19,color:"#fff"}}>{panel.name}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:4}}>{panel.email}</div>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button className="btn-p" style={{padding:"8px 14px",fontSize:12}} onClick={e=>openEdit(panel,e)}>
                    <span className="material-icons" style={{fontSize:15}}>edit</span>Modifier
                  </button>
                  <button className="btn-d" style={{padding:"8px 14px",fontSize:12}} onClick={e=>openDel(panel,e)}>
                    <span className="material-icons" style={{fontSize:15}}>delete</span>Supprimer
                  </button>
                </div>
              </div>

              {/* info */}
              <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,padding:"14px 18px",marginBottom:20}}>
                {[
                  {icon:"public", label:"Pays",     value:panel.country||"—"},
                  {icon:"cake",   label:"Âge",      value:panel.age||"—"},
                  {icon:"phone",  label:"Téléphone", value:panel.phone||"—"},
                  {icon:"badge",  label:"ID",        value:`#${panel.id}`},
                ].map(({icon,label,value})=>(
                  <div key={label} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                    <span className="material-icons" style={{fontSize:15,color:"rgba(255,255,255,.3)",width:20}}>{icon}</span>
                    <span style={{fontSize:11,color:"rgba(255,255,255,.35)",width:72,fontWeight:500}}>{label}</span>
                    <span style={{fontSize:13,color:"rgba(255,255,255,.8)",fontWeight:500}}>{value}</span>
                  </div>
                ))}
              </div>

              {/* stades */}
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>Stades assignés</div>
              {loadingPanel ? (
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"16px 0",color:"rgba(255,255,255,.3)",fontSize:13}}>
                  <div className="ad spin" style={{width:18,height:18,border:"2px solid #C1272D",borderTopColor:"transparent",borderRadius:"50%"}}/>Chargement…
                </div>
              ) : panelStades.length===0 ? (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 0",gap:8}}>
                  <span className="material-icons" style={{fontSize:34,color:"rgba(255,255,255,.1)"}}>stadium</span>
                  <span style={{fontSize:12,color:"rgba(255,255,255,.3)"}}>Aucun stade assigné</span>
                </div>
              ) : panelStades.map(s=>(
                <div key={s.id} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"13px 15px",display:"flex",alignItems:"center",gap:12,marginBottom:8,transition:"border-color .18s"}}>
                  {s.imageUrl
                    ? <img src={s.imageUrl} alt={s.name} style={{width:44,height:44,borderRadius:10,objectFit:"cover",flexShrink:0}}/>
                    : <div style={{width:44,height:44,borderRadius:10,background:"rgba(193,39,45,.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span className="material-icons" style={{fontSize:20,color:"#C1272D"}}>stadium</span></div>
                  }
                  <div style={{flex:1,overflow:"hidden"}}>
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:2}}>{s.cityName||s.country||"—"} · {s.capacity?.toLocaleString()||"—"} places</div>
                  </div>
                  <span className="badge" style={{background:"rgba(0,98,51,.12)",color:"#4ade80",borderColor:"rgba(0,98,51,.3)",flexShrink:0}}>Actif</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ══════════ MODAL ADD / EDIT ══════════ */}
      {(modal==="add"||modal==="edit") && (
        <div className="ad overlay">
          <div className="modal">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:17,color:"#fff"}}>
                {modal==="add"?"Ajouter un Responsable":"Modifier le Responsable"}
              </div>
              <button className="ibtn" onClick={()=>setModal(null)}><span className="material-icons" style={{fontSize:18}}>close</span></button>
            </div>
            {[
              {key:"name",     label:"Nom complet",  placeholder:"Mohamed Alaoui",         required:true},
              {key:"email",    label:"Email",         placeholder:"m.alaoui@example.com",   required:true},
              {key:"phone",    label:"Téléphone",     placeholder:"+212 6XX XXX XXX"},
              {key:"country",  label:"Pays",          placeholder:"Maroc"},
              {key:"age",      label:"Âge",           placeholder:"35"},
              {key:"imageUrl", label:"URL Image",     placeholder:"https://…"},
            ].map(({key,label,placeholder,required})=>(
              <div className="field" key={key}>
                <label>{label}{required&&<span style={{color:"#C1272D"}}> *</span>}</label>
                <input value={form[key]||""} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder}/>
              </div>
            ))}
            <div style={{display:"flex",gap:12,justifyContent:"flex-end",marginTop:8}}>
              <button className="btn-s" onClick={()=>setModal(null)}>Annuler</button>
              <button className="btn-p" onClick={handleSave} disabled={saving}>
                {saving
                  ? <><div className="ad spin" style={{width:15,height:15,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%"}}/>Sauvegarde…</>
                  : <><span className="material-icons" style={{fontSize:16}}>save</span>{modal==="add"?"Ajouter":"Sauvegarder"}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MODAL DELETE ══════════ */}
      {modal==="del" && (
        <div className="ad overlay">
          <div className="modal modal-sm">
            <div style={{textAlign:"center",padding:"6px 0 18px"}}>
              <div style={{width:58,height:58,borderRadius:"50%",background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.25)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
                <span className="material-icons" style={{fontSize:26,color:"#ef4444"}}>delete_forever</span>
              </div>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:17,color:"#fff",marginBottom:8}}>Supprimer le Responsable</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,.45)",lineHeight:1.6}}>
                Supprimer <strong style={{color:"#fff"}}>{form.name}</strong> ? Cette action est irréversible.
              </div>
            </div>
            <div style={{display:"flex",gap:12,justifyContent:"center"}}>
              <button className="btn-s" onClick={()=>setModal(null)}>Annuler</button>
              <button className="btn-d" onClick={handleDelete} disabled={saving}>
                {saving
                  ? <><div className="ad spin" style={{width:15,height:15,border:"2px solid rgba(239,68,68,.4)",borderTopColor:"#ef4444",borderRadius:"50%"}}/>Suppression…</>
                  : <><span className="material-icons" style={{fontSize:16}}>delete</span>Supprimer</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TOAST ══════════ */}
      {toast && (
        <div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:toast.type==="success"?"rgba(22,163,74,.95)":"rgba(193,39,45,.95)",color:"#fff",padding:"12px 22px",borderRadius:12,fontSize:13,fontFamily:"Syne,sans-serif",fontWeight:700,display:"flex",alignItems:"center",gap:10,zIndex:200,boxShadow:"0 8px 32px rgba(0,0,0,.4)",animation:"ad-up .3s ease both",backdropFilter:"blur(8px)"}}>
          <span className="material-icons" style={{fontSize:18}}>{toast.type==="success"?"check_circle":"cancel"}</span>
          {toast.msg}
        </div>
      )}

      <Footer />
    </>
  );
}