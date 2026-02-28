"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BASE = "https://anas-gana1-fandb-backend.hf.space/api";

export default function AdminDashboard() {

  const [tab, setTab] = useState("overview");

  // data
  const [responsables, setResponsables] = useState([]);
  const [matches,      setMatches]      = useState([]);
  const [predictions,  setPredictions]  = useState([]);
  const [leaderboard,  setLeaderboard]  = useState([]);
  const [teams,        setTeams]        = useState([]);
  const [topScorers,   setTopScorers]   = useState([]);
  const [playerStats,  setPlayerStats]  = useState(null);
  const [loading,      setLoading]      = useState(true);

  // responsable side panel
  const [panel,        setPanel]        = useState(null);
  const [panelStades,  setPanelStades]  = useState([]);
  const [loadingPanel, setLoadingPanel] = useState(false);

  // match detail modal
  const [matchModal,   setMatchModal]   = useState(null);
  const [matchPlayers, setMatchPlayers] = useState([]);
  const [matchTeams,   setMatchTeams]   = useState([]);
  const [matchEvents,  setMatchEvents]  = useState([]);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [goalForm,     setGoalForm]     = useState({ teamId:"", playerId:"", minute:"" });
  const [savingGoal,   setSavingGoal]   = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  // filters
  const [searchR,       setSearchR]    = useState("");
  const [filterCountry, setFCountry]   = useState("");
  const [searchM,       setSearchM]    = useState("");
  const [filterStatus,  setFStatus]    = useState("");

  // CRUD modal
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState({});
  const [pwdForm, setPwdForm] = useState({ newPassword:"", confirm:"" });
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(null);

  /* ── load all ── */
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
    ]).then(([res,mat,pred,lb,tm,sc,ps])=>{
      setResponsables(Array.isArray(res)?res:[]);
      setMatches(Array.isArray(mat)?mat:[]);
      setPredictions(Array.isArray(pred)?pred:[]);
      setLeaderboard(Array.isArray(lb)?lb:[]);
      setTeams(Array.isArray(tm)?tm:[]);
      setTopScorers(Array.isArray(sc)?sc:[]);
      setPlayerStats(ps&&typeof ps==="object"?ps:null);
      setLoading(false);
    });
  };
  useEffect(()=>{ loadAll(); },[]);

  /* ── open match modal ── */
  const openMatchModal = async (m) => {
    setMatchModal(m);
    setMatchPlayers([]); setMatchTeams([]); setMatchEvents([]);
    setGoalForm({ teamId:"", playerId:"", minute:"" });
    setLoadingMatch(true);
    try {
      const [players, events] = await Promise.all([
        fetch(`${BASE}/matches/matches/players/${m.id}`).then(r=>r.json()).catch(()=>[]),
        fetch(`${BASE}/matches/matches/${m.id}/events`).then(r=>r.json()).catch(()=>[]),
      ]);
      const pList = Array.isArray(players)?players:[];
      setMatchPlayers(pList);
      setMatchEvents(Array.isArray(events)?events:[]);
      // build unique teams from player list
      const tMap = {};
      pList.forEach(p=>{ if(p.teamId&&p.team&&!tMap[p.teamId]) tMap[p.teamId]={id:p.teamId,name:p.team}; });
      setMatchTeams(Object.values(tMap));
    } catch(_){}
    setLoadingMatch(false);
  };

  /* ── change match status ── */
  const changeMatchStatus = async (s) => {
    if(!matchModal) return;
    setSavingStatus(true);
    try {
      await fetch(`${BASE}/matches/etat/${matchModal.id}/${s}`);
      setMatchModal(p=>({...p,status:s}));
      setMatches(p=>p.map(m=>m.id===matchModal.id?{...m,status:s}:m));
      showToast("success","Statut → "+s);
    } catch(_){ showToast("error","Erreur statut."); }
    setSavingStatus(false);
  };

  /* ── add goal ── */
  const addGoal = async () => {
    const {teamId,playerId,minute}=goalForm;
    if(!teamId||!playerId){ showToast("error","Équipe et joueur requis."); return; }
    setSavingGoal(true);
    try {
      const min=minute?`?minute=${minute}`:"";
      const res=await fetch(`${BASE}/matches/matches/${matchModal.id}/team/${teamId}/player/${playerId}${min}`);
      if(res.ok){
        showToast("success","⚽ But enregistré !");
        const ev=await fetch(`${BASE}/matches/matches/${matchModal.id}/events`).then(r=>r.json()).catch(()=>[]);
        setMatchEvents(Array.isArray(ev)?ev:[]);
        setGoalForm({teamId:"",playerId:"",minute:""});
        const mat=await fetch(`${BASE}/matches/matches/all`).then(r=>r.json()).catch(()=>[]);
        setMatches(Array.isArray(mat)?mat:[]);
        setMatchModal(p=>({ ...p, ...((Array.isArray(mat)?mat:[]).find(m=>m.id===matchModal.id)||{}) }));
      } else showToast("error","Échec enregistrement but.");
    } catch(_){ showToast("error","Erreur réseau."); }
    setSavingGoal(false);
  };

  /* ── responsable panel ── */
  const openPanel = async (r) => {
    setPanel(r); setPanelStades([]); setLoadingPanel(true);
    try {
      const d=await fetch(`${BASE}/responsables/${r.id}/stades`).then(x=>x.json());
      setPanelStades(Array.isArray(d)?d:[]);
    } catch(_){}
    setLoadingPanel(false);
  };

  /* ── toast ── */
  const showToast=(type,msg)=>{ setToast({type,msg}); setTimeout(()=>setToast(null),3500); };

  /* ── CRUD ── */
  const openAdd  = ()    => { setForm({name:"",age:"",email:"",phone:"",country:"",imageUrl:""}); setModal("add"); };
  const openEdit = (r,e) => { e?.stopPropagation(); setForm({...r}); setModal("edit"); };
  const openDel  = (r,e) => { e?.stopPropagation(); setForm({...r}); setModal("del"); };
  const openPwd  = (r,e) => { e?.stopPropagation(); setForm({...r}); setPwdForm({newPassword:"",confirm:""}); setModal("pwd"); };

  const handleSave = async () => {
    if(!form.name||!form.email){ showToast("error","Nom et email requis."); return; }
    setSaving(true);
    try {
      const isEdit=modal==="edit";
      const res=await fetch(isEdit?`${BASE}/responsables/update/${form.id}`:`${BASE}/responsables/add`,{
        method:isEdit?"PUT":"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form)
      });
      if(res.ok){ showToast("success",isEdit?"Mis à jour !":"Ajouté !"); setModal(null); loadAll(); }
      else showToast("error","Opération échouée.");
    } catch(_){ showToast("error","Erreur réseau."); }
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res=await fetch(`${BASE}/responsables/delete/${form.id}`,{method:"DELETE"});
      if(res.ok||res.status===204){ showToast("success","Supprimé !"); setModal(null); setPanel(null); loadAll(); }
      else showToast("error","Suppression échouée.");
    } catch(_){ showToast("error","Erreur réseau."); }
    setSaving(false);
  };

  const handlePwd = async () => {
    if(!pwdForm.newPassword){ showToast("error","Nouveau mot de passe requis."); return; }
    if(pwdForm.newPassword!==pwdForm.confirm){ showToast("error","Mots de passe différents."); return; }
    if(pwdForm.newPassword.length<6){ showToast("error","Min. 6 caractères."); return; }
    setSaving(true);
    try {
      const res=await fetch(`${BASE}/responsables/miseaj/${form.id}`,{
        method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({password:pwdForm.newPassword})
      });
      if(res.ok){ showToast("success","Mot de passe modifié !"); setModal(null); }
      else showToast("error","Modification échouée.");
    } catch(_){ showToast("error","Erreur réseau."); }
    setSaving(false);
  };

  /* ── computed ── */
  const countries = [...new Set(responsables.map(r=>r.country).filter(Boolean))].sort();
  const statuses  = [...new Set(matches.map(m=>m.status).filter(Boolean))];
  const ALL_STATUSES = ["SCHEDULED","LIVE","STARTED","DIRECT","HALFTIME","FINISHED"];

  const filteredR = responsables.filter(r=>{
    const q=searchR.toLowerCase();
    return (!q||r.name?.toLowerCase().includes(q)||r.email?.toLowerCase().includes(q))
        && (!filterCountry||r.country===filterCountry);
  });
  const filteredM = matches.filter(m=>{
    const q=searchM.toLowerCase();
    return (!q||m.team1Name?.toLowerCase().includes(q)||m.team2Name?.toLowerCase().includes(q)||m.stadeName?.toLowerCase().includes(q))
        && (!filterStatus||m.status===filterStatus);
  });

  const liveCount     = matches.filter(m=>["live","started","direct"].includes(m.status?.toLowerCase())).length;
  const finishedCount = matches.filter(m=>m.status?.toLowerCase()==="finished").length;
  const pendingCount  = matches.filter(m=>["scheduled","pending"].includes(m.status?.toLowerCase())).length;
  const correctPreds  = predictions.filter(p=>p.status?.toLowerCase()==="correct").length;

  const initials = n => n ? n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() : "?";
  const aColor   = n => {
    const c=["#C1272D","#006233","#b45309","#0369a1","#7c3aed","#0f766e"];
    let h=0; for(const x of(n||"")) h=(h*31+x.charCodeAt(0))%c.length; return c[h];
  };
  const statusColor = s => {
    const sl=(s||"").toLowerCase();
    if(["live","started","direct"].includes(sl)) return{bg:"rgba(193,39,45,.18)",color:"#f87171",border:"rgba(193,39,45,.4)"};
    if(sl==="finished")  return{bg:"rgba(0,98,51,.15)",   color:"#4ade80",border:"rgba(0,98,51,.35)"};
    if(sl==="halftime")  return{bg:"rgba(251,191,36,.15)",color:"#fbbf24",border:"rgba(251,191,36,.35)"};
    return{bg:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.45)",border:"rgba(255,255,255,.12)"};
  };
  const predColor = s => {
    const sl=(s||"").toLowerCase();
    if(sl==="correct")   return{bg:"rgba(0,98,51,.12)",  color:"#4ade80"};
    if(sl==="incorrect") return{bg:"rgba(193,39,45,.12)",color:"#f87171"};
    return{bg:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.4)"};
  };
  const teamPlayersForGoal = matchPlayers.filter(p=>String(p.teamId)===String(goalForm.teamId));

  /* ═══════════════════════════════ RENDER ═══════════════════════════════ */
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
        @keyframes ad-pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .ad .au{animation:ad-up .55s cubic-bezier(.22,.68,0,1.2) both}
        .ad .d1{animation-delay:.05s}.ad .d2{animation-delay:.11s}.ad .d3{animation-delay:.17s}.ad .d4{animation-delay:.23s}
        .ad .spin{animation:ad-spin 1s linear infinite}
        .ad .pulse{animation:ad-pulse 1.4s ease infinite}

        .ad .sc{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:18px 22px;display:flex;flex-direction:column;gap:4px;transition:border-color .2s}
        .ad .sc:hover{border-color:rgba(193,39,45,.3)}

        .ad .tb{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:10px;font-family:'Syne',sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;border:none;cursor:pointer;transition:all .18s;white-space:nowrap}
        .ad .tb-on{background:linear-gradient(135deg,#C1272D,#a01e23);color:#fff;box-shadow:0 4px 16px rgba(193,39,45,.3)}
        .ad .tb-off{background:rgba(255,255,255,.06);color:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.08)}
        .ad .tb-off:hover{background:rgba(255,255,255,.1);color:#fff}

        .ad .card{background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06);border-radius:16px;transition:all .2s}
        .ad .card-hover:hover{border-color:rgba(193,39,45,.3);background:rgba(193,39,45,.04);transform:translateY(-2px);box-shadow:0 12px 36px rgba(193,39,45,.1);cursor:pointer}

        .ad .fbar{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:18px 22px;margin-bottom:24px}
        .ad .fbar input,.ad .fbar select{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-family:'Syne',sans-serif;font-size:12px;font-weight:600;padding:10px 14px;outline:none;transition:border-color .18s;appearance:none;-webkit-appearance:none}
        .ad .fbar input::placeholder{color:rgba(255,255,255,.3)}
        .ad .fbar input:focus,.ad .fbar select:focus{border-color:rgba(193,39,45,.5)}
        .ad .fbar select option{background:#1c0a0b;color:#fff}

        .ad .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;border:1px solid;font-family:'Syne',sans-serif}

        .ad .ibtn{width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;color:rgba(255,255,255,.5)}
        .ad .ibtn:hover{border-color:#C1272D;color:#C1272D;background:rgba(193,39,45,.1)}
        .ad .ibtn-del:hover{border-color:#ef4444;color:#ef4444;background:rgba(239,68,68,.1)}
        .ad .ibtn-grn:hover{border-color:#4ade80;color:#4ade80;background:rgba(74,222,128,.1)}

        .ad .btn-p{display:inline-flex;align-items:center;gap:8px;padding:11px 20px;background:#C1272D;color:#fff;border:none;border-radius:12px;font-family:'Syne',sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all .18s}
        .ad .btn-p:hover{background:#a01f24;transform:translateY(-1px)}
        .ad .btn-p:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .ad .btn-s{display:inline-flex;align-items:center;gap:8px;padding:11px 20px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.75);border:1px solid rgba(255,255,255,.1);border-radius:12px;font-family:'Syne',sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all .18s}
        .ad .btn-s:hover{background:rgba(255,255,255,.1)}
        .ad .btn-d{display:inline-flex;align-items:center;gap:8px;padding:11px 20px;background:rgba(239,68,68,.15);color:#ef4444;border:1px solid rgba(239,68,68,.3);border-radius:12px;font-family:'Syne',sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all .18s}
        .ad .btn-d:hover{background:rgba(239,68,68,.25)}
        .ad .btn-g{display:inline-flex;align-items:center;gap:8px;padding:11px 20px;background:rgba(74,222,128,.1);color:#4ade80;border:1px solid rgba(74,222,128,.25);border-radius:12px;font-family:'Syne',sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all .18s}
        .ad .btn-g:hover{background:rgba(74,222,128,.2)}
        .ad .btn-g:disabled{opacity:.5;cursor:not-allowed}

        .ad .overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);backdrop-filter:blur(5px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px}
        .ad .modal{background:#160a0b;border:1px solid rgba(255,255,255,.1);border-radius:22px;padding:28px;width:100%;max-width:520px;animation:ad-sc .25s ease both;max-height:92vh;overflow-y:auto}
        .ad .modal-sm{max-width:390px}
        .ad .modal-lg{max-width:780px}

        .ad .field{margin-bottom:14px}
        .ad .field label{display:block;font-size:11px;font-weight:700;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;font-family:'Syne',sans-serif}
        .ad .field input,.ad .field select{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-family:'Inter',sans-serif;font-size:14px;padding:11px 14px;outline:none;transition:border-color .18s;appearance:none;-webkit-appearance:none}
        .ad .field input:focus,.ad .field select:focus{border-color:rgba(193,39,45,.5)}
        .ad .field input::placeholder{color:rgba(255,255,255,.25)}
        .ad .field select option{background:#1c0a0b;color:#fff}

        .ad .spanel{position:fixed;right:0;top:0;bottom:0;width:430px;max-width:100vw;background:#120608;border-left:1px solid rgba(255,255,255,.08);z-index:90;overflow-y:auto;animation:ad-fade .25s ease both;display:flex;flex-direction:column}

        .ad .trow{display:grid;align-items:center;gap:12px;padding:13px 18px;border-bottom:1px solid rgba(255,255,255,.04);transition:background .15s}
        .ad .trow:hover{background:rgba(255,255,255,.03)}
        .ad .trow:last-child{border-bottom:none}

        .ad .lrow{display:grid;grid-template-columns:44px 1fr 80px;align-items:center;gap:10px;padding:12px 18px;border-bottom:1px solid rgba(255,255,255,.04);transition:background .15s}
        .ad .lrow:hover{background:rgba(255,255,255,.03)}
        .ad .lrow:last-child{border-bottom:none}

        .ad .spill{padding:7px 16px;border-radius:9px;font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;border:1px solid;cursor:pointer;transition:all .18s;display:inline-flex;align-items:center;gap:5px}
        .ad .spill:hover{transform:translateY(-1px)}
        .ad .spill:disabled{opacity:.5;cursor:not-allowed;transform:none}

        .ad .erow{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.05)}
        .ad .erow:last-child{border-bottom:none}

        @media(max-width:900px){
          .ad .stats-grid{grid-template-columns:repeat(3,1fr)!important}
          .ad .cards-grid{grid-template-columns:1fr!important}
          .ad .spanel{width:100vw}
          .ad .tab-bar{overflow-x:auto;-webkit-overflow-scrolling:touch}
          .ad .modal-lg{max-width:100%}
          .ad .pred-grid{grid-template-columns:1fr!important}
          .ad .match-inner{grid-template-columns:1fr!important}
        }
        @media(max-width:540px){
          .ad .stats-grid{grid-template-columns:1fr 1fr!important}
        }
      `}</style>

      <Navbar />
      <div className="ad">

        {/* ══ HERO ══ */}
        <header style={{position:"relative",overflow:"hidden",background:"#09020a",borderBottom:"1px solid rgba(255,255,255,.06)",paddingTop:90}}>
          <div style={{position:"absolute",top:-80,right:-40,width:500,height:500,background:"radial-gradient(circle,rgba(193,39,45,.18),transparent 70%)",filter:"blur(90px)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",bottom:-60,left:-80,width:400,height:400,background:"radial-gradient(circle,rgba(0,98,51,.12),transparent 70%)",filter:"blur(80px)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",inset:0,opacity:.025,backgroundImage:"repeating-linear-gradient(45deg,#C1272D 0,#C1272D 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,#006233 0,#006233 1px,transparent 0,transparent 50%)",backgroundSize:"20px 20px",pointerEvents:"none"}}/>

          <div style={{maxWidth:1260,margin:"0 auto",padding:"44px 24px 48px",position:"relative",zIndex:2}}>
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:24,flexWrap:"wrap"}}>
              <div>
                <div className="au" style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,fontSize:10,fontFamily:"Syne,sans-serif",color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".1em"}}>
                  <span className="material-icons" style={{fontSize:14}}>admin_panel_settings</span>Admin
                  <span className="material-icons" style={{fontSize:14}}>chevron_right</span>
                  <span style={{color:"#C1272D"}}>Dashboard</span>
                </div>
                <h1 className="au d1" style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"clamp(28px,4.5vw,52px)",color:"#fff",lineHeight:1.05,margin:0}}>
                  Admin <span style={{color:"#C1272D"}}>Dashboard</span>
                </h1>
                <p className="au d2" style={{fontFamily:"Inter,sans-serif",fontSize:14,color:"rgba(255,255,255,.45)",maxWidth:480,lineHeight:1.7,margin:"10px 0 0"}}>
                  Gestion — Responsables · Matches · Prédictions · Équipes · Joueurs
                </p>
              </div>
              <div className="au d3" style={{fontFamily:"Amiri,serif",fontStyle:"italic",fontSize:28,color:"rgba(0,98,51,.35)",lineHeight:1.2,textAlign:"right"}}>لوحة<br/>التحكم</div>
            </div>

            {/* KPI chips */}
            <div className="au d3 stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginTop:32}}>
              {[
                {label:"Responsables",value:loading?"…":responsables.length, icon:"manage_accounts",    color:"rgba(255,255,255,.85)"},
                {label:"Matches",     value:loading?"…":matches.length,       icon:"sports_soccer",      color:"#fbbf24"},
                {label:"En Direct",   value:loading?"…":liveCount,            icon:"fiber_manual_record",color:"#f87171"},
                {label:"Équipes",     value:loading?"…":teams.length,         icon:"groups",             color:"#4ade80"},
                {label:"Prédictions", value:loading?"…":predictions.length,   icon:"psychology",         color:"#a78bfa"},
                {label:"Correctes",   value:loading?"…":correctPreds,         icon:"check_circle",       color:"#C1272D"},
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

          {/* Tab bar */}
          <div className="au d4 tab-bar" style={{maxWidth:1260,margin:"0 auto",padding:"0 24px",display:"flex",gap:8,overflowX:"auto"}}>
            {[
              {id:"overview",    icon:"dashboard",       label:"Vue d'ensemble"},
              {id:"responsables",icon:"manage_accounts", label:"Responsables"},
              {id:"matches",     icon:"sports_soccer",   label:"Matches"},
              {id:"predictions", icon:"psychology",      label:"Prédictions"},
              {id:"teams",       icon:"groups",          label:"Équipes"},
              {id:"players",     icon:"person",          label:"Joueurs"},
            ].map(({id,icon,label})=>(
              <button key={id} className={`tb ${tab===id?"tb-on":"tb-off"}`} onClick={()=>setTab(id)}>
                <span className="material-icons" style={{fontSize:16}}>{icon}</span>{label}
              </button>
            ))}
          </div>
          <div style={{height:1,background:"rgba(255,255,255,.06)",marginTop:16}}/>
        </header>

        {/* ══ MAIN ══ */}
        <main style={{maxWidth:1260,margin:"0 auto",padding:"32px 24px 80px"}}>

          {loading&&(
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:260,gap:14}}>
              <div className="spin" style={{width:36,height:36,border:"3px solid #C1272D",borderTopColor:"transparent",borderRadius:"50%"}}/>
              <span style={{fontFamily:"Syne,sans-serif",color:"rgba(255,255,255,.4)",fontSize:14}}>Chargement…</span>
            </div>
          )}

          {/* ═══ OVERVIEW ═══ */}
          {!loading&&tab==="overview"&&(
            <div className="au" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>

              {/* derniers matches */}
              <div className="card" style={{padding:0,gridColumn:"span 2"}}>
                <div style={{padding:"18px 22px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:"#fff",display:"flex",alignItems:"center",gap:10}}>
                    <span className="material-icons" style={{fontSize:18,color:"#C1272D"}}>sports_soccer</span>Derniers Matches
                  </div>
                  <button className="tb tb-off" style={{padding:"6px 14px",fontSize:10}} onClick={()=>setTab("matches")}>
                    Voir tout <span className="material-icons" style={{fontSize:13}}>arrow_forward</span>
                  </button>
                </div>
                {matches.slice(0,6).map((m,i)=>{
                  const sc=statusColor(m.status);
                  return(
                    <div key={m.id||i} className="trow" style={{gridTemplateColumns:"1fr 64px 1fr 110px 100px 40px",cursor:"pointer"}} onClick={()=>openMatchModal(m)}>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:"#fff",textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.team1Name||"—"}</div>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:900,fontSize:14,color:"#C1272D",textAlign:"center"}}>{m.goalsTeam1??"-"}&nbsp;:&nbsp;{m.goalsTeam2??"-"}</div>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:13,color:"rgba(255,255,255,.65)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.team2Name||"—"}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.4)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.stadeName||"—"}</div>
                      <div>
                        <span style={{padding:"3px 8px",borderRadius:99,fontSize:10,fontWeight:700,fontFamily:"Syne,sans-serif",background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`,textTransform:"uppercase",display:"inline-flex",alignItems:"center",gap:4}}>
                          {["live","started","direct"].includes(m.status?.toLowerCase())&&<span className="pulse" style={{width:5,height:5,borderRadius:"50%",background:"#f87171",display:"inline-block"}}/>}
                          {m.status}
                        </span>
                      </div>
                      <button className="ibtn ibtn-grn" onClick={e=>{e.stopPropagation();openMatchModal(m);}} title="Gérer">
                        <span className="material-icons" style={{fontSize:14}}>settings</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* top supporters */}
              <div className="card" style={{padding:0}}>
                <div style={{padding:"18px 22px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:"#fff",display:"flex",alignItems:"center",gap:10}}>
                    <span className="material-icons" style={{fontSize:18,color:"#fbbf24"}}>emoji_events</span>Top Supporters
                  </div>
                  <button className="tb tb-off" style={{padding:"6px 14px",fontSize:10}} onClick={()=>setTab("predictions")}>
                    Voir tout <span className="material-icons" style={{fontSize:13}}>arrow_forward</span>
                  </button>
                </div>
                {leaderboard.slice(0,5).map((s,i)=>(
                  <div key={s.id||i} className="lrow">
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:16,textAlign:"center"}}>
                      {i===0?"🥇":i===1?"🥈":i===2?"🥉":<span style={{color:"rgba(255,255,255,.3)"}}>#{i+1}</span>}
                    </div>
                    <div>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:"#fff"}}>{s.name}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:1}}>{s.email}</div>
                    </div>
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:14,color:"#C1272D",textAlign:"right"}}>{s.totalPoints} pts</div>
                  </div>
                ))}
              </div>

              {/* top buteurs */}
              <div className="card" style={{padding:0}}>
                <div style={{padding:"18px 22px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:"#fff",display:"flex",alignItems:"center",gap:10}}>
                    <span className="material-icons" style={{fontSize:18,color:"#4ade80"}}>sports_soccer</span>Top Buteurs
                  </div>
                  <button className="tb tb-off" style={{padding:"6px 14px",fontSize:10}} onClick={()=>setTab("players")}>
                    Voir tout <span className="material-icons" style={{fontSize:13}}>arrow_forward</span>
                  </button>
                </div>
                {topScorers.slice(0,5).map((p,i)=>(
                  <div key={p.id||i} className="lrow">
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:14,textAlign:"center"}}>
                      {i===0?"🥇":i===1?"🥈":i===2?"🥉":<span style={{color:"rgba(255,255,255,.3)"}}>#{i+1}</span>}
                    </div>
                    <div>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:"#fff"}}>{p.name}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:1}}>{p.team}</div>
                    </div>
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:14,color:"#4ade80",textAlign:"right",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:4}}>
                      <span className="material-icons" style={{fontSize:13}}>sports_soccer</span>{p.goals}
                    </div>
                  </div>
                ))}
              </div>

              {/* répartition */}
              <div className="card" style={{padding:"20px 22px",gridColumn:"span 2"}}>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:"#fff",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
                  <span className="material-icons" style={{fontSize:18,color:"#a78bfa"}}>bar_chart</span>Répartition des Matches
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                  {[
                    {label:"En Direct",value:liveCount,    color:"#f87171",icon:"fiber_manual_record"},
                    {label:"Terminés", value:finishedCount,color:"#4ade80",icon:"check_circle"},
                    {label:"À Venir",  value:pendingCount, color:"#fbbf24",icon:"schedule"},
                    {label:"Total",    value:matches.length,color:"#a78bfa",icon:"sports_soccer"},
                  ].map(({label,value,color,icon})=>(
                    <div key={label} style={{background:"rgba(255,255,255,.04)",border:`1px solid ${color}22`,borderRadius:14,padding:"18px 20px",display:"flex",flexDirection:"column",gap:6}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span className="material-icons" style={{fontSize:18,color,opacity:.85}}>{icon}</span>
                        <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:28,color}}>{value}</span>
                      </div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".08em"}}>{label}</div>
                      <div style={{height:4,borderRadius:99,background:"rgba(255,255,255,.06)",marginTop:4}}>
                        <div style={{height:"100%",borderRadius:99,background:color,width:`${matches.length?Math.round((value/matches.length)*100):0}%`,transition:"width .6s ease"}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ RESPONSABLES ═══ */}
          {!loading&&tab==="responsables"&&(
            <div className="au">
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
              <div className="cards-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(265px,1fr))",gap:16}}>
                {filteredR.length===0
                  ? <div style={{gridColumn:"1/-1",display:"flex",flexDirection:"column",alignItems:"center",height:200,justifyContent:"center",gap:12}}>
                      <span className="material-icons" style={{fontSize:48,color:"rgba(255,255,255,.1)"}}>manage_accounts</span>
                      <div style={{fontFamily:"Syne,sans-serif",color:"rgba(255,255,255,.3)",fontSize:14}}>Aucun responsable</div>
                    </div>
                  : filteredR.map((r,i)=>(
                    <div key={r.id} className="card card-hover" style={{padding:18,display:"flex",flexDirection:"column",gap:13}} onClick={()=>openPanel(r)}>
                      <div style={{display:"flex",alignItems:"center",gap:13}}>
                        {r.imageUrl
                          ? <img src={r.imageUrl} alt={r.name} style={{width:48,height:48,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,.1)",flexShrink:0}}/>
                          : <div style={{width:48,height:48,borderRadius:"50%",background:aColor(r.name),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:16,color:"#fff",flexShrink:0}}>{initials(r.name)}</div>
                        }
                        <div style={{flex:1,overflow:"hidden"}}>
                          <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.name}</div>
                          <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.email}</div>
                        </div>
                        <div style={{display:"flex",gap:4,flexShrink:0}}>
                          <button className="ibtn" onClick={e=>openEdit(r,e)} title="Modifier"><span className="material-icons" style={{fontSize:14}}>edit</span></button>
                          <button className="ibtn ibtn-grn" onClick={e=>openPwd(r,e)} title="Mot de passe"><span className="material-icons" style={{fontSize:14}}>lock</span></button>
                          <button className="ibtn ibtn-del" onClick={e=>openDel(r,e)} title="Supprimer"><span className="material-icons" style={{fontSize:14}}>delete</span></button>
                        </div>
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                        {r.country&&<span className="badge" style={{background:"rgba(0,98,51,.12)",color:"#4ade80",borderColor:"rgba(0,98,51,.3)"}}><span className="material-icons" style={{fontSize:11}}>public</span>{r.country}</span>}
                        {r.age&&<span className="badge" style={{background:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.5)",borderColor:"rgba(255,255,255,.12)"}}><span className="material-icons" style={{fontSize:11}}>cake</span>{r.age} ans</span>}
                      </div>
                      {r.phone&&<div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"rgba(255,255,255,.4)"}}><span className="material-icons" style={{fontSize:14}}>phone</span>{r.phone}</div>}
                      <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"rgba(193,39,45,.7)",marginTop:"auto"}}>
                        <span className="material-icons" style={{fontSize:14}}>stadium</span>Voir les stades
                        <span className="material-icons" style={{fontSize:14,marginLeft:"auto"}}>arrow_forward</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* ═══ MATCHES ═══ */}
          {!loading&&tab==="matches"&&(
            <div className="au">
              <div className="fbar" style={{display:"grid",gridTemplateColumns:"1fr 160px",gap:12,alignItems:"end"}}>
                <div>
                  <div style={{fontSize:10,fontFamily:"Syne,sans-serif",fontWeight:700,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Rechercher</div>
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
                <div style={{padding:"13px 18px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"grid",gridTemplateColumns:"1fr 64px 1fr 110px 100px 40px",gap:12,fontSize:10,fontFamily:"Syne,sans-serif",fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".08em"}}>
                  <div>Équipe 1</div><div style={{textAlign:"center"}}>Score</div><div>Équipe 2</div><div>Stade</div><div>Statut</div><div/>
                </div>
                {filteredM.length===0
                  ? <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 0",gap:10}}>
                      <span className="material-icons" style={{fontSize:40,color:"rgba(255,255,255,.1)"}}>sports_soccer</span>
                      <div style={{fontFamily:"Syne,sans-serif",color:"rgba(255,255,255,.3)",fontSize:14}}>Aucun match</div>
                    </div>
                  : filteredM.map((m,i)=>{
                    const sc=statusColor(m.status);
                    return(
                      <div key={m.id||i} className="trow" style={{gridTemplateColumns:"1fr 64px 1fr 110px 100px 40px"}}>
                        <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.team1Name||"—"}</div>
                        <div style={{fontFamily:"Syne,sans-serif",fontWeight:900,fontSize:13,color:"#C1272D",textAlign:"center"}}>{m.goalsTeam1??"-"}:{m.goalsTeam2??"-"}</div>
                        <div style={{fontFamily:"Syne,sans-serif",fontWeight:600,fontSize:13,color:"rgba(255,255,255,.7)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.team2Name||"—"}</div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,.4)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.stadeName||"—"}</div>
                        <div>
                          <span style={{padding:"3px 8px",borderRadius:99,fontSize:10,fontWeight:700,fontFamily:"Syne,sans-serif",background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`,textTransform:"uppercase",display:"inline-flex",alignItems:"center",gap:4}}>
                            {["live","started","direct"].includes(m.status?.toLowerCase())&&<span className="pulse" style={{width:5,height:5,borderRadius:"50%",background:"#f87171",display:"inline-block"}}/>}
                            {m.status}
                          </span>
                        </div>
                        <button className="ibtn ibtn-grn" onClick={()=>openMatchModal(m)} title="Gérer">
                          <span className="material-icons" style={{fontSize:14}}>settings</span>
                        </button>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          )}

          {/* ═══ PREDICTIONS ═══ */}
          {!loading&&tab==="predictions"&&(
            <div className="au pred-grid" style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:20,alignItems:"start"}}>
              <div>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:"#fff",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                  <span className="material-icons" style={{fontSize:18,color:"#a78bfa"}}>psychology</span>
                  Toutes les Prédictions ({predictions.length})
                </div>
                <div className="card" style={{padding:0}}>
                  <div style={{padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"grid",gridTemplateColumns:"60px 1fr 1fr 80px 50px",gap:10,fontSize:10,fontFamily:"Syne,sans-serif",fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".08em"}}>
                    <div>ID</div><div>Match</div><div>Pronostic</div><div>Statut</div><div>Pts</div>
                  </div>
                  {predictions.slice(0,25).map((p,i)=>{
                    const pc=predColor(p.status);
                    return(
                      <div key={p.id||i} className="trow" style={{gridTemplateColumns:"60px 1fr 1fr 80px 50px"}}>
                        <div style={{fontSize:11,color:"rgba(255,255,255,.3)",fontFamily:"Syne,sans-serif"}}>#{p.id}</div>
                        <div>
                          <div style={{fontSize:12,fontFamily:"Syne,sans-serif",fontWeight:700,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.team1Name||"?"} vs {p.team2Name||"?"}</div>
                          <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:1}}>match #{p.matchId}</div>
                        </div>
                        <div style={{fontSize:12,fontFamily:"Syne,sans-serif",fontWeight:600,color:"rgba(255,255,255,.7)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.predictedWinnerName||"—"}</div>
                        <div><span style={{padding:"3px 8px",borderRadius:99,fontSize:10,fontWeight:700,fontFamily:"Syne,sans-serif",background:pc.bg,color:pc.color,border:`1px solid ${pc.color}33`,textTransform:"uppercase"}}>{p.status||"—"}</span></div>
                        <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:13,color:"#C1272D"}}>{p.points??0}</div>
                      </div>
                    );
                  })}
                  {predictions.length>25&&<div style={{padding:"12px 18px",fontSize:12,color:"rgba(255,255,255,.3)",textAlign:"center"}}>… et {predictions.length-25} autres</div>}
                </div>
              </div>
              <div>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:"#fff",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                  <span className="material-icons" style={{fontSize:18,color:"#fbbf24"}}>emoji_events</span>Classement Top 10
                </div>
                <div className="card" style={{padding:0}}>
                  {leaderboard.map((s,i)=>(
                    <div key={s.id||i} className="lrow">
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,textAlign:"center"}}>
                        {i===0?"🥇":i===1?"🥈":i===2?"🥉":<span style={{color:"rgba(255,255,255,.3)"}}>#{i+1}</span>}
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

          {/* ═══ TEAMS ═══ */}
          {!loading&&tab==="teams"&&(
            <div className="au">
              <div className="cards-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
                {teams.map((t,i)=>(
                  <div key={t.id||i} className="card" style={{padding:20,display:"flex",flexDirection:"column",gap:12}}>
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
                    {t.coach&&<div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"rgba(255,255,255,.45)"}}><span className="material-icons" style={{fontSize:14}}>person</span>Coach: <span style={{color:"rgba(255,255,255,.7)"}}>{t.coach}</span></div>}
                    {t.participation!==undefined&&<div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"rgba(255,255,255,.45)"}}><span className="material-icons" style={{fontSize:14}}>emoji_events</span><span style={{color:"rgba(255,255,255,.7)"}}>{t.participation} participations</span></div>}
                    {t.description&&<div style={{fontSize:12,color:"rgba(255,255,255,.35)",lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{t.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ PLAYERS ═══ */}
          {!loading&&tab==="players"&&(
            <div className="au">
              {playerStats&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:24}}>
                  {[
                    {label:"Total Joueurs",value:playerStats.totalPlayers,                   color:"rgba(255,255,255,.85)",icon:"person"},
                    {label:"Total Buts",   value:playerStats.totalGoals,                     color:"#C1272D",             icon:"sports_soccer"},
                    {label:"Âge moyen",   value:playerStats.averageAge?.toFixed(1),          color:"#fbbf24",             icon:"cake"},
                    {label:"Taille moy.", value:(playerStats.averageHeight?.toFixed(0)||"—")+"cm", color:"#4ade80",      icon:"height"},
                    {label:"Poids moy.",  value:(playerStats.averageWeight?.toFixed(0)||"—")+"kg", color:"#a78bfa",      icon:"monitor_weight"},
                  ].map(({label,value,color,icon})=>(
                    <div key={label} className="sc">
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span className="material-icons" style={{fontSize:17,color,opacity:.85}}>{icon}</span>
                        <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:22,color}}>{value}</span>
                      </div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".08em"}}>{label}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="card" style={{padding:0}}>
                <div style={{padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"grid",gridTemplateColumns:"50px 1fr 130px 70px 60px 50px",gap:12,fontSize:10,fontFamily:"Syne,sans-serif",fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".08em"}}>
                  <div>Rang</div><div>Joueur</div><div>Équipe</div><div>Buts</div><div>Taille</div><div>Âge</div>
                </div>
                {topScorers.map((p,i)=>(
                  <div key={p.id||i} className="trow" style={{gridTemplateColumns:"50px 1fr 130px 70px 60px 50px"}}>
                    <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:14,textAlign:"center"}}>
                      {i===0?"🥇":i===1?"🥈":i===2?"🥉":<span style={{color:"rgba(255,255,255,.3)"}}>#{i+1}</span>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      {p.urlImage
                        ? <img src={p.urlImage} alt={p.name} style={{width:32,height:32,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                        : <div style={{width:32,height:32,borderRadius:"50%",background:aColor(p.name),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:11,color:"#fff",flexShrink:0}}>{initials(p.name)}</div>
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

      {/* ══ SIDE PANEL ══ */}
      {panel&&(
        <>
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:89}} onClick={()=>setPanel(null)}/>
          <div className="ad spanel">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 22px 14px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:"#fff"}}>Profil Responsable</div>
              <button className="ibtn" onClick={()=>setPanel(null)}><span className="material-icons" style={{fontSize:18}}>close</span></button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:22}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,marginBottom:26}}>
                {panel.imageUrl
                  ? <img src={panel.imageUrl} alt={panel.name} style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",border:"3px solid rgba(193,39,45,.4)"}}/>
                  : <div style={{width:80,height:80,borderRadius:"50%",background:aColor(panel.name),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:26,color:"#fff"}}>{initials(panel.name)}</div>
                }
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:18,color:"#fff"}}>{panel.name}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:4}}>{panel.email}</div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
                  <button className="btn-p"  style={{padding:"8px 12px",fontSize:12}} onClick={e=>openEdit(panel,e)}><span className="material-icons" style={{fontSize:14}}>edit</span>Modifier</button>
                  <button className="btn-g"  style={{padding:"8px 12px",fontSize:12}} onClick={e=>openPwd(panel,e)}><span className="material-icons" style={{fontSize:14}}>lock</span>Mot de passe</button>
                  <button className="btn-d"  style={{padding:"8px 12px",fontSize:12}} onClick={e=>openDel(panel,e)}><span className="material-icons" style={{fontSize:14}}>delete</span>Supprimer</button>
                </div>
              </div>
              <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,padding:"14px 18px",marginBottom:20}}>
                {[
                  {icon:"public",label:"Pays",      value:panel.country||"—"},
                  {icon:"cake",  label:"Âge",       value:panel.age||"—"},
                  {icon:"phone", label:"Téléphone", value:panel.phone||"—"},
                  {icon:"badge", label:"ID",        value:`#${panel.id}`},
                ].map(({icon,label,value})=>(
                  <div key={label} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                    <span className="material-icons" style={{fontSize:14,color:"rgba(255,255,255,.3)",width:20}}>{icon}</span>
                    <span style={{fontSize:11,color:"rgba(255,255,255,.35)",width:72}}>{label}</span>
                    <span style={{fontSize:13,color:"rgba(255,255,255,.8)",fontWeight:500}}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>Stades assignés</div>
              {loadingPanel
                ? <div style={{display:"flex",alignItems:"center",gap:10,color:"rgba(255,255,255,.3)",fontSize:13,padding:"14px 0"}}>
                    <div className="ad spin" style={{width:18,height:18,border:"2px solid #C1272D",borderTopColor:"transparent",borderRadius:"50%"}}/>Chargement…
                  </div>
                : panelStades.length===0
                  ? <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"22px 0",gap:8}}>
                      <span className="material-icons" style={{fontSize:34,color:"rgba(255,255,255,.1)"}}>stadium</span>
                      <span style={{fontSize:12,color:"rgba(255,255,255,.3)"}}>Aucun stade assigné</span>
                    </div>
                  : panelStades.map(s=>(
                    <div key={s.id} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                      {s.imageUrl
                        ? <img src={s.imageUrl} alt={s.name} style={{width:42,height:42,borderRadius:10,objectFit:"cover",flexShrink:0}}/>
                        : <div style={{width:42,height:42,borderRadius:10,background:"rgba(193,39,45,.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span className="material-icons" style={{fontSize:20,color:"#C1272D"}}>stadium</span></div>
                      }
                      <div style={{flex:1,overflow:"hidden"}}>
                        <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:2}}>{s.cityName||s.country||"—"} · {s.capacity?.toLocaleString()||"—"} places</div>
                      </div>
                      <span className="badge" style={{background:"rgba(0,98,51,.12)",color:"#4ade80",borderColor:"rgba(0,98,51,.3)",flexShrink:0}}>Actif</span>
                    </div>
                  ))
              }
            </div>
          </div>
        </>
      )}

      {/* ══ MATCH DETAIL MODAL ══ */}
      {matchModal&&(
        <div className="ad overlay" onClick={e=>{ if(e.target===e.currentTarget) setMatchModal(null); }}>
          <div className="modal modal-lg">
            {/* header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
              <div>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:18,color:"#fff"}}>
                  {matchModal.team1Name||"Équipe 1"} <span style={{color:"#C1272D"}}>vs</span> {matchModal.team2Name||"Équipe 2"}
                </div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:3}}>{matchModal.stadeName||"—"} · Match #{matchModal.id}</div>
              </div>
              <button className="ibtn" onClick={()=>setMatchModal(null)}><span className="material-icons" style={{fontSize:18}}>close</span></button>
            </div>

            {/* scoreboard */}
            <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:28,marginBottom:22,padding:"20px 24px",background:"rgba(255,255,255,.04)",borderRadius:16,border:"1px solid rgba(255,255,255,.07)"}}>
              <div style={{textAlign:"right",flex:1}}>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:18,color:"#fff"}}>{matchModal.team1Name}</div>
              </div>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:900,fontSize:40,color:"#C1272D",letterSpacing:2}}>
                {matchModal.goalsTeam1??0} — {matchModal.goalsTeam2??0}
              </div>
              <div style={{textAlign:"left",flex:1}}>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:18,color:"#fff"}}>{matchModal.team2Name}</div>
              </div>
            </div>

            {/* change status */}
            <div style={{marginBottom:22,padding:"16px 18px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:14}}>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:11,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                <span className="material-icons" style={{fontSize:14}}>swap_horiz</span>Changer le statut
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {ALL_STATUSES.map(s=>{
                  const sc=statusColor(s);
                  const isActive=matchModal.status?.toUpperCase()===s;
                  return(
                    <button key={s} className="spill" disabled={savingStatus} onClick={()=>changeMatchStatus(s)}
                      style={{background:isActive?sc.bg:"rgba(255,255,255,.05)",color:isActive?sc.color:"rgba(255,255,255,.45)",borderColor:isActive?sc.border:"rgba(255,255,255,.1)",opacity:savingStatus?.6:1}}>
                      {["LIVE","STARTED","DIRECT"].includes(s)&&isActive&&<span className="pulse" style={{width:6,height:6,borderRadius:"50%",background:"#f87171",display:"inline-block"}}/>}
                      {s}
                      {isActive&&<span className="material-icons" style={{fontSize:12}}>check</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2-col: add goal + events */}
            <div className="match-inner" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              {/* add goal */}
              <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,padding:"18px 20px"}}>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:"#fff",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
                  <span className="material-icons" style={{fontSize:16,color:"#4ade80"}}>sports_soccer</span>Enregistrer un but
                </div>
                {loadingMatch
                  ? <div style={{display:"flex",alignItems:"center",gap:8,color:"rgba(255,255,255,.3)",fontSize:12}}>
                      <div className="ad spin" style={{width:16,height:16,border:"2px solid #C1272D",borderTopColor:"transparent",borderRadius:"50%"}}/>Chargement des joueurs…
                    </div>
                  : <>
                    <div className="field">
                      <label>Équipe</label>
                      <select value={goalForm.teamId} onChange={e=>setGoalForm(f=>({...f,teamId:e.target.value,playerId:""}))}>
                        <option value="">-- Choisir une équipe --</option>
                        {matchTeams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Joueur buteur</label>
                      <select value={goalForm.playerId} onChange={e=>setGoalForm(f=>({...f,playerId:e.target.value}))} disabled={!goalForm.teamId}>
                        <option value="">-- Choisir un joueur --</option>
                        {teamPlayersForGoal.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Minute (optionnel)</label>
                      <input type="number" min="1" max="120" value={goalForm.minute} onChange={e=>setGoalForm(f=>({...f,minute:e.target.value}))} placeholder="Ex: 45"/>
                    </div>
                    <button className="btn-g" style={{width:"100%",justifyContent:"center"}} onClick={addGoal} disabled={savingGoal||!goalForm.teamId||!goalForm.playerId}>
                      {savingGoal
                        ? <><div className="ad spin" style={{width:14,height:14,border:"2px solid rgba(74,222,128,.4)",borderTopColor:"#4ade80",borderRadius:"50%"}}/>Enregistrement…</>
                        : <><span className="material-icons" style={{fontSize:16}}>sports_soccer</span>Confirmer le but</>
                      }
                    </button>
                  </>
                }
              </div>

              {/* events */}
              <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,padding:"18px 20px",maxHeight:300,overflowY:"auto"}}>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:"#fff",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
                  <span className="material-icons" style={{fontSize:16,color:"#fbbf24"}}>timeline</span>
                  Événements ({matchEvents.length})
                </div>
                {matchEvents.length===0
                  ? <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"20px 0",gap:8}}>
                      <span className="material-icons" style={{fontSize:32,color:"rgba(255,255,255,.1)"}}>timeline</span>
                      <span style={{fontSize:12,color:"rgba(255,255,255,.3)"}}>Aucun événement</span>
                    </div>
                  : [...matchEvents].sort((a,b)=>(a.minute||0)-(b.minute||0)).map((ev,i)=>(
                    <div key={ev.id||i} className="erow">
                      <div style={{width:34,height:34,borderRadius:"50%",background:"rgba(74,222,128,.1)",border:"1px solid rgba(74,222,128,.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span className="material-icons" style={{fontSize:15,color:"#4ade80"}}>sports_soccer</span>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:"#fff"}}>{ev.playerName||`Joueur #${ev.playerID}`}</div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:1}}>{ev.teamName||"—"}</div>
                      </div>
                      {ev.minute!=null&&<div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:13,color:"#fbbf24",flexShrink:0}}>{ev.minute}'</div>}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL ADD / EDIT ══ */}
      {(modal==="add"||modal==="edit")&&(
        <div className="ad overlay">
          <div className="modal">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:17,color:"#fff"}}>{modal==="add"?"Ajouter un Responsable":"Modifier"}</div>
              <button className="ibtn" onClick={()=>setModal(null)}><span className="material-icons" style={{fontSize:18}}>close</span></button>
            </div>
            {[
              {key:"name",    label:"Nom complet",  placeholder:"Mohamed Alaoui",       req:true},
              {key:"email",   label:"Email",         placeholder:"m.alaoui@example.com", req:true},
              {key:"phone",   label:"Téléphone",     placeholder:"+212 6XX XXX XXX"},
              {key:"country", label:"Pays",          placeholder:"Maroc"},
              {key:"age",     label:"Âge",           placeholder:"35"},
              {key:"imageUrl",label:"URL Image",     placeholder:"https://…"},
            ].map(({key,label,placeholder,req})=>(
              <div className="field" key={key}>
                <label>{label}{req&&<span style={{color:"#C1272D"}}> *</span>}</label>
                <input value={form[key]||""} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder}/>
              </div>
            ))}
            <div style={{display:"flex",gap:12,justifyContent:"flex-end",marginTop:8}}>
              <button className="btn-s" onClick={()=>setModal(null)}>Annuler</button>
              <button className="btn-p" onClick={handleSave} disabled={saving}>
                {saving?<><div className="ad spin" style={{width:15,height:15,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%"}}/>Sauvegarde…</>:<><span className="material-icons" style={{fontSize:16}}>save</span>{modal==="add"?"Ajouter":"Sauvegarder"}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL MOT DE PASSE ══ */}
      {modal==="pwd"&&(
        <div className="ad overlay">
          <div className="modal modal-sm">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:17,color:"#fff"}}>Modifier le mot de passe</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:4}}>{form.name}</div>
              </div>
              <button className="ibtn" onClick={()=>setModal(null)}><span className="material-icons" style={{fontSize:18}}>close</span></button>
            </div>
            <div style={{width:54,height:54,borderRadius:"50%",background:"rgba(74,222,128,.1)",border:"1px solid rgba(74,222,128,.25)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>
              <span className="material-icons" style={{fontSize:24,color:"#4ade80"}}>lock</span>
            </div>
            {[
              {key:"newPassword",label:"Nouveau mot de passe",type:"password",placeholder:"Min. 6 caractères"},
              {key:"confirm",    label:"Confirmer",           type:"password",placeholder:"Répéter le mot de passe"},
            ].map(({key,label,type,placeholder})=>(
              <div className="field" key={key}>
                <label>{label}</label>
                <input type={type} value={pwdForm[key]||""} onChange={e=>setPwdForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder}/>
              </div>
            ))}
            {pwdForm.newPassword&&pwdForm.confirm&&pwdForm.newPassword!==pwdForm.confirm&&(
              <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#f87171",marginBottom:12,padding:"8px 12px",background:"rgba(239,68,68,.1)",borderRadius:8,border:"1px solid rgba(239,68,68,.2)"}}>
                <span className="material-icons" style={{fontSize:14}}>error</span>Les mots de passe ne correspondent pas
              </div>
            )}
            <div style={{display:"flex",gap:12,justifyContent:"flex-end",marginTop:8}}>
              <button className="btn-s" onClick={()=>setModal(null)}>Annuler</button>
              <button className="btn-g" onClick={handlePwd} disabled={saving}>
                {saving?<><div className="ad spin" style={{width:15,height:15,border:"2px solid rgba(74,222,128,.4)",borderTopColor:"#4ade80",borderRadius:"50%"}}/>Modification…</>:<><span className="material-icons" style={{fontSize:16}}>lock</span>Changer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL DELETE ══ */}
      {modal==="del"&&(
        <div className="ad overlay">
          <div className="modal modal-sm">
            <div style={{textAlign:"center",padding:"4px 0 18px"}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.25)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
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
                {saving?<><div className="ad spin" style={{width:15,height:15,border:"2px solid rgba(239,68,68,.4)",borderTopColor:"#ef4444",borderRadius:"50%"}}/>Suppression…</>:<><span className="material-icons" style={{fontSize:16}}>delete</span>Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST ══ */}
      {toast&&(
        <div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:toast.type==="success"?"rgba(22,163,74,.95)":"rgba(193,39,45,.95)",color:"#fff",padding:"12px 22px",borderRadius:12,fontSize:13,fontFamily:"Syne,sans-serif",fontWeight:700,display:"flex",alignItems:"center",gap:10,zIndex:200,boxShadow:"0 8px 32px rgba(0,0,0,.4)",animation:"ad-up .3s ease both",backdropFilter:"blur(8px)",whiteSpace:"nowrap"}}>
          <span className="material-icons" style={{fontSize:18}}>{toast.type==="success"?"check_circle":"cancel"}</span>
          {toast.msg}
        </div>
      )}

      <Footer />
    </>
  );
}