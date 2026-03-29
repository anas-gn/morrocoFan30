"use client";
import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import SidebarRespo from "@/components/Sidebarrespo";

const BASE = "https://anas-gana1-fandb-backend.hf.space/api";

const sf = async url => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(r.status);
  const t = await r.text();
  try { return JSON.parse(t); } catch { return t; }
};

/* ── helpers ── */
const normStatus = s => {
  const u = (s || "").toUpperCase();
  if (["LIVE","STARTED","DIRECT","COMMENCE"].includes(u)) return "LIVE";
  if (["FINISHED","TERMINE"].includes(u))                  return "FINISHED";
  if (u === "HALFTIME")                                    return "HALFTIME";
  return "SCHEDULED";
};
const statusStyle = s => {
  const n = normStatus(s);
  if (n === "LIVE")     return { bg:"rgba(193,39,45,.18)",  color:"#f87171", border:"rgba(193,39,45,.4)",  dot:true  };
  if (n === "FINISHED") return { bg:"rgba(0,98,51,.15)",    color:"#4ade80", border:"rgba(0,98,51,.35)",   dot:false };
  if (n === "HALFTIME") return { bg:"rgba(251,191,36,.15)", color:"#fbbf24", border:"rgba(251,191,36,.35)",dot:false };
  return { bg:"rgba(255,255,255,.05)", color:"rgba(255,255,255,.4)", border:"rgba(255,255,255,.1)", dot:false };
};
const initials = n => n ? n.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "?";
const hue = n => {
  const c = ["#C1272D","#006233","#b45309","#0369a1","#7c3aed","#0f766e"];
  let h = 0; for (const x of (n||"")) h = (h*31+x.charCodeAt(0))%c.length; return c[h];
};

/* ── tiny donut svg ── */
function Donut({ value, max, color, size=56 }) {
  const pct = max > 0 ? value/max : 0;
  const r=20, c=2*Math.PI*r;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="5"/>
      <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${pct*c} ${c}`} strokeLinecap="round"
        transform="rotate(-90 24 24)" style={{transition:"stroke-dasharray 1s ease"}}/>
      <text x="24" y="28" textAnchor="middle" fontSize="11" fontWeight="800"
        fill="#fff" fontFamily="Syne,sans-serif">{Math.round(pct*100)}%</text>
    </svg>
  );
}

/* ── mini bar chart ── */
function MiniBar({ values, color }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:3,height:32}}>
      {values.map((v,i)=>(
        <div key={i} style={{flex:1,background:i===values.length-1?color:"rgba(255,255,255,.12)",
          borderRadius:"2px 2px 0 0",height:`${(v/max)*100}%`,minHeight:3,transition:"height .8s ease"}}/>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  /* data */
  const [matches,     setMatches]     = useState([]);
  const [teams,       setTeams]       = useState([]);
  const [supporters,  setSupporters]  = useState([]);
  const [cities,      setCities]      = useState([]);
  const [stades,      setStades]      = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [topScorers,  setTopScorers]  = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  /* auth */
  useEffect(()=>{
    if (typeof window==="undefined") return;
    const t = localStorage.getItem("userType");
    if (!t) { router.push("/Login"); return; }
    if (t === "SUPPORTER") { router.push("/Acceuil"); return; }
    load();
  },[]);

  const load = useCallback(async()=>{
    setLoading(true);
    const [mat,tm,sup,cit,st,pred,lb,sc] = await Promise.all([
      sf(`${BASE}/matches/matches/allTriee`).catch(()=>[]),
      sf(`${BASE}/teams/teams/all`).catch(()=>[]),
      sf(`${BASE}/supporters/all`).catch(()=>[]),
      sf(`${BASE}/acceuil/CityHosts/all`).catch(()=>[]),
      sf(`${BASE}/acceuil/stade/all`).catch(()=>[]),
      sf(`${BASE}/predictions/all`).catch(()=>[]),
      sf(`${BASE}/predictions/leaderboard/top10`).catch(()=>[]),
      sf(`${BASE}/players/top/scorers?limit=8`).catch(()=>[]),
    ]);
    setMatches(Array.isArray(mat)?mat:[]);
    setTeams(Array.isArray(tm)?tm:[]);
    setSupporters(Array.isArray(sup)?sup:[]);
    setCities(Array.isArray(cit)?cit:[]);
    setStades(Array.isArray(st)?st:[]);
    setPredictions(Array.isArray(pred)?pred:[]);
    setLeaderboard(Array.isArray(lb)?lb:[]);
    setTopScorers(Array.isArray(sc)?sc:[]);
    setLoading(false);
  },[]);

  /* computed */
  const live      = matches.filter(m=>normStatus(m.statut)==="LIVE").length;
  const finished  = matches.filter(m=>normStatus(m.statut)==="FINISHED").length;
  const scheduled = matches.filter(m=>normStatus(m.statut)==="SCHEDULED").length;
  const halftime  = matches.filter(m=>normStatus(m.statut)==="HALFTIME").length;
  const correct   = predictions.filter(p=>p.status?.toLowerCase()==="correct").length;
  const incorrect = predictions.filter(p=>p.status?.toLowerCase()==="incorrect").length;
  const pending   = predictions.filter(p=>p.status?.toLowerCase()==="pending").length;
  const totalGoals= topScorers.reduce((a,p)=>a+(p.goals||0),0);
  const last7     = matches.slice(0,7).map(m=>(m.matchTeams?.[0]?.goals||0)+(m.matchTeams?.[1]?.goals||0));

  return (
    <>
      <Head>
        <title>Dashboard · MoroccoFan2030</title>
        <link rel="icon" href="/images/logo.png"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&family=Amiri:ital,wght@0,400;1,400&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
      </Head>

      <style jsx global>{`
        *,*::before,*::after{box-sizing:border-box}
        html,body{margin:0;padding:0;height:100%}
        body{font-family:'Inter',sans-serif;background:#07030a;color:#fff;-webkit-font-smoothing:antialiased;overflow:hidden}

        @keyframes up   {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        @keyframes spin  {to{transform:rotate(360deg)}}
        @keyframes pulse {0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes glow  {0%,100%{box-shadow:0 0 0 0 rgba(193,39,45,.4)}50%{box-shadow:0 0 0 6px rgba(193,39,45,0)}}

        .anim-up{animation:up .5s cubic-bezier(.22,.68,0,1.2) both}
        .spin   {animation:spin 1s linear infinite}
        .pulse  {animation:pulse 1.4s ease infinite}
        .glow   {animation:glow 2s ease infinite}

        ::-webkit-scrollbar      {width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(193,39,45,.3);border-radius:2px}

        /* ── main wrapper shifts right by sidebar width ── */
        .main-wrap{
          width:100%;height:100vh;overflow-y:auto;
          transition:margin-left .28s cubic-bezier(.4,0,.2,1);
          display:flex;flex-direction:column;
        }
        /* when sidebar collapses it adds class .col which sets --sw:66px */
        /* We listen to sidebar width changes via CSS var on :root */
        @media(max-width:900px){.main-wrap{margin-left:66px}}

        /* ── KPI card ── */
        .kpi{
          background:rgba(255,255,255,.032);
          border:1px solid rgba(255,255,255,.065);
          border-radius:16px;padding:18px 20px;
          display:flex;flex-direction:column;gap:6px;
          transition:border-color .2s,transform .2s;
          position:relative;overflow:hidden;
        }
        .kpi::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--kc,#C1272D);opacity:.6}
        .kpi:hover{border-color:rgba(255,255,255,.12);transform:translateY(-2px)}

        /* ── section card ── */
        .sc{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.055);border-radius:18px;overflow:hidden}
        .sc-head{padding:16px 20px;border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;justify-content:space-between}
        .sc-title{font-family:'Syne',sans-serif;font-weight:800;font-size:14px;color:#fff;display:flex;align-items:center;gap:8px}

        /* ── match row ── */
        .mrow{display:grid;align-items:center;gap:10px;padding:12px 20px;border-bottom:1px solid rgba(255,255,255,.035);transition:background .15s;cursor:pointer}
        .mrow:hover{background:rgba(255,255,255,.02)}
        .mrow:last-child{border-bottom:none}

        /* ── badge ── */
        .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:99px;font-size:9px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;border:1px solid;font-family:'Syne',sans-serif}

        /* ── team cell ── */
        .team-chip{display:flex;align-items:center;gap:8px;overflow:hidden}
        .team-flag{width:28px;height:28px;border-radius:7px;object-fit:cover;flex-shrink:0}
        .team-flag-ph{width:28px;height:28px;border-radius:7px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:9px;color:#fff}
        .team-name-txt{font-family:'Syne',sans-serif;font-weight:700;font-size:12px;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

        /* ── score box ── */
        .score-box{font-family:'Syne',sans-serif;font-weight:900;font-size:15px;color:#C1272D;text-align:center;background:rgba(193,39,45,.1);border-radius:8px;padding:4px 10px;letter-spacing:1px}

        /* ── progress bar ── */
        .pbar{height:5px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;margin-top:4px}
        .pbar-fill{height:100%;border-radius:99px;transition:width 1.2s cubic-bezier(.4,0,.2,1)}

        /* ── btn ── */
        .btn-sm{display:inline-flex;align-items:center;gap:6px;padding:6px 13px;border-radius:8px;font-family:'Syne',sans-serif;font-weight:700;font-size:11px;cursor:pointer;transition:all .18s;border:none}
        .btn-red{background:rgba(193,39,45,.15);color:#f87171;border:1px solid rgba(193,39,45,.25)}
        .btn-red:hover{background:rgba(193,39,45,.28)}
        .btn-ghost{background:rgba(255,255,255,.05);color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.1)}
        .btn-ghost:hover{background:rgba(255,255,255,.1)}
      `}</style>

      {/* ══ MAIN ══ */}
      <div className="main-wrap">

        {/* topbar */}
        <div style={{position:"sticky",top:0,zIndex:40,background:"rgba(7,3,10,.94)",backdropFilter:"blur(14px)",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",padding:"0 24px",height:56,gap:16,flexShrink:0}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,color:"#fff",flex:1}}>Vue d'ensemble</div>
          <button className="btn-sm btn-ghost" onClick={load}>
            <span className="material-icons" style={{fontSize:14}}>refresh</span>
            {!loading ? "Actualiser" : "Chargement…"}
          </button>
        </div>

        {/* content */}
        <div style={{flex:1,padding:"24px",overflowY:"auto"}}>
          {loading ? (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:400,gap:14}}>
              <div className="spin" style={{width:36,height:36,border:"3px solid #C1272D",borderTopColor:"transparent",borderRadius:"50%"}}/>
              <span style={{fontFamily:"'Syne',sans-serif",color:"rgba(255,255,255,.35)",fontSize:13}}>Chargement des données…</span>
            </div>
          ) : (
            <>
              {/* ══ ROW 1 — KPI CARDS ══ */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:22}} className="anim-up">
                {[
                  {label:"Matches Total", val:matches.length,    icon:"sports_soccer",        color:"#fbbf24", pct:matches.length,    max:matches.length||1},
                  {label:"En Direct 🔴",  val:live,              icon:"radio_button_checked",  color:"#f87171", pct:live,              max:matches.length||1},
                  {label:"Terminés",      val:finished,          icon:"check_circle",          color:"#4ade80", pct:finished,          max:matches.length||1},
                  {label:"Programmés",    val:scheduled,         icon:"schedule",              color:"#60a5fa", pct:scheduled,         max:matches.length||1},
                  {label:"Équipes",       val:teams.length,      icon:"groups",                color:"#a78bfa", pct:teams.length,      max:64},
                  {label:"Supporters",    val:supporters.length, icon:"favorite",              color:"#C1272D", pct:supporters.length, max:supporters.length||1},
                  {label:"Stades",        val:stades.length,     icon:"stadium",               color:"#0ea5e9", pct:stades.length,     max:12},
                  {label:"Prédictions",   val:predictions.length,icon:"psychology",            color:"#f59e0b", pct:predictions.length,max:predictions.length||1},
                ].map(({label,val,icon,color,pct,max},i)=>(
                  <div key={label} className="kpi anim-up" style={{"--kc":color,animationDelay:`${i*.04}s`}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span className="material-icons" style={{fontSize:16,color,opacity:.8}}>{icon}</span>
                      <span style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:26,color}}>{val}</span>
                    </div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".07em",fontFamily:"'Syne',sans-serif"}}>{label}</div>
                    <div className="pbar"><div className="pbar-fill" style={{width:`${Math.min(pct/max*100,100)}%`,background:color}}/></div>
                  </div>
                ))}
              </div>

              {/* ══ ROW 2 — MATCH STATUS + PREDICTIONS + GOALS ══ */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:22}} className="anim-up">
                {/* Match status */}
                <div className="sc">
                  <div className="sc-head">
                    <div className="sc-title"><span className="material-icons" style={{fontSize:15,color:"#fbbf24"}}>bar_chart</span>Statuts Matches</div>
                  </div>
                  <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:12}}>
                    {[
                      {label:"En Direct",  val:live,      color:"#f87171"},
                      {label:"Mi-Temps",   val:halftime,  color:"#fbbf24"},
                      {label:"Terminés",   val:finished,  color:"#4ade80"},
                      {label:"Programmés", val:scheduled, color:"#60a5fa"},
                    ].map(({label,val,color})=>(
                      <div key={label}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                          <span style={{fontSize:11,color:"rgba(255,255,255,.5)",fontFamily:"'Syne',sans-serif",fontWeight:600}}>{label}</span>
                          <span style={{fontSize:13,color,fontFamily:"'Syne',sans-serif",fontWeight:800}}>{val}</span>
                        </div>
                        <div className="pbar"><div className="pbar-fill" style={{width:`${(val/(matches.length||1))*100}%`,background:color}}/></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Predictions donut */}
                <div className="sc" style={{display:"flex",flexDirection:"column"}}>
                  <div className="sc-head">
                    <div className="sc-title"><span className="material-icons" style={{fontSize:15,color:"#a78bfa"}}>psychology</span>Prédictions</div>
                  </div>
                  <div style={{flex:1,padding:"16px 20px",display:"flex",alignItems:"center",gap:20}}>
                    <Donut value={correct} max={predictions.length||1} color="#4ade80" size={72}/>
                    <div style={{flex:1,display:"flex",flexDirection:"column",gap:9}}>
                      {[
                        {label:"Correctes",   val:correct,   color:"#4ade80"},
                        {label:"Incorrectes", val:incorrect, color:"#f87171"},
                        {label:"En attente",  val:pending,   color:"#fbbf24"},
                      ].map(({label,val,color})=>(
                        <div key={label} style={{display:"flex",alignItems:"center",gap:7}}>
                          <div style={{width:7,height:7,borderRadius:"50%",background:color,flexShrink:0}}/>
                          <span style={{fontSize:11,color:"rgba(255,255,255,.45)",flex:1,fontFamily:"'Syne',sans-serif"}}>{label}</span>
                          <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color}}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Goals mini chart */}
                <div className="sc">
                  <div className="sc-head">
                    <div className="sc-title"><span className="material-icons" style={{fontSize:15,color:"#4ade80"}}>trending_up</span>Buts (derniers matches)</div>
                  </div>
                  <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:14}}>
                    <MiniBar values={last7.length?last7:[0]} color="#C1272D"/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <div style={{background:"rgba(193,39,45,.08)",border:"1px solid rgba(193,39,45,.18)",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
                        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:22,color:"#C1272D"}}>{totalGoals}</div>
                        <div style={{fontSize:9,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".07em"}}>Total Buts</div>
                      </div>
                      <div style={{background:"rgba(74,222,128,.06)",border:"1px solid rgba(74,222,128,.15)",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
                        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:22,color:"#4ade80"}}>{topScorers.length}</div>
                        <div style={{fontSize:9,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".07em"}}>Buteurs</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ══ ROW 3 — LAST MATCHES + TOP SCORERS ══ */}
              <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:14,marginBottom:22}} className="anim-up">
                {/* Last matches */}
                <div className="sc">
                  <div className="sc-head">
                    <div className="sc-title"><span className="material-icons" style={{fontSize:15,color:"#C1272D"}}>sports_soccer</span>Derniers Matches</div>
                    <a href="/matchesRespo" className="btn-sm btn-ghost" style={{textDecoration:"none"}}>
                      Voir tout <span className="material-icons" style={{fontSize:12}}>arrow_forward</span>
                    </a>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 90px 1fr 80px 88px",gap:10,padding:"8px 20px 6px",fontSize:9,fontFamily:"'Syne',sans-serif",fontWeight:700,color:"rgba(255,255,255,.22)",textTransform:"uppercase",letterSpacing:".08em",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                    <div>Équipe 1</div><div style={{textAlign:"center"}}>Score</div><div>Équipe 2</div><div>Stade</div><div>Statut</div>
                  </div>
                  {matches.slice(0,10).map((m,i)=>{
                    const t1=m.matchTeams?.[0]||{};
                    const t2=m.matchTeams?.[1]||{};
                    const ss=statusStyle(m.statut);
                    const isLive=normStatus(m.statut)==="LIVE";
                    return(
                      <div key={m.id||i} className="mrow" style={{gridTemplateColumns:"1fr 90px 1fr 80px 88px"}}>
                        <div className="team-chip">
                          {t1.imageUrl?<img src={t1.imageUrl} alt={t1.teamName} className="team-flag"/>:<div className="team-flag-ph" style={{background:hue(t1.teamName)}}>{initials(t1.teamName)}</div>}
                          <span className="team-name-txt">{t1.teamName||"—"}</span>
                        </div>
                        <div style={{display:"flex",justifyContent:"center"}}>
                          <div className="score-box">{t1.goals??0} — {t2.goals??0}</div>
                        </div>
                        <div className="team-chip">
                          {t2.imageUrl?<img src={t2.imageUrl} alt={t2.teamName} className="team-flag"/>:<div className="team-flag-ph" style={{background:hue(t2.teamName)}}>{initials(t2.teamName)}</div>}
                          <span className="team-name-txt">{t2.teamName||"—"}</span>
                        </div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,.3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.stadeName||"—"}</div>
                        <div>
                          <span className="badge" style={{background:ss.bg,color:ss.color,borderColor:ss.border}}>
                            {isLive&&<span className="pulse" style={{width:5,height:5,borderRadius:"50%",background:"#f87171",display:"inline-block"}}/>}
                            {m.statut||"—"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {matches.length===0&&<div style={{padding:"32px",textAlign:"center",color:"rgba(255,255,255,.2)",fontFamily:"'Syne',sans-serif",fontSize:12}}>Aucun match</div>}
                </div>

                {/* Top scorers */}
                <div className="sc">
                  <div className="sc-head">
                    <div className="sc-title"><span className="material-icons" style={{fontSize:15,color:"#fbbf24"}}>emoji_events</span>Top Buteurs</div>
                  </div>
                  {topScorers.slice(0,8).map((p,i)=>(
                    <div key={p.id||i} style={{display:"grid",gridTemplateColumns:"28px 1fr 42px",alignItems:"center",gap:10,padding:"10px 20px",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,textAlign:"center"}}>
                        {i===0?"🥇":i===1?"🥈":i===2?"🥉":<span style={{fontSize:11,color:"rgba(255,255,255,.25)"}}>#{i+1}</span>}
                      </div>
                      <div style={{overflow:"hidden"}}>
                        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,.3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.team}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <span style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:14,color:"#4ade80"}}>{p.goals}</span>
                        <span style={{fontSize:9,color:"rgba(255,255,255,.25)",marginLeft:2}}>⚽</span>
                      </div>
                    </div>
                  ))}
                  {topScorers.length===0&&<div style={{padding:"32px",textAlign:"center",color:"rgba(255,255,255,.2)",fontFamily:"'Syne',sans-serif",fontSize:12}}>Aucun buteur</div>}
                </div>
              </div>

              {/* ══ ROW 4 — LEADERBOARD + QUICK LINKS ══ */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="anim-up">
                {/* Leaderboard */}
                <div className="sc">
                  <div className="sc-head">
                    <div className="sc-title"><span className="material-icons" style={{fontSize:15,color:"#C1272D"}}>leaderboard</span>Classement Supporters</div>
                    <a href="/Predictions" className="btn-sm btn-ghost" style={{textDecoration:"none"}}>
                      Voir tout <span className="material-icons" style={{fontSize:12}}>arrow_forward</span>
                    </a>
                  </div>
                  {leaderboard.slice(0,7).map((s,i)=>(
                    <div key={s.id||i} style={{display:"grid",gridTemplateColumns:"32px 1fr 60px",alignItems:"center",gap:10,padding:"10px 20px",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,textAlign:"center"}}>
                        {i===0?"🥇":i===1?"🥈":i===2?"🥉":<span style={{fontSize:11,color:"rgba(255,255,255,.25)"}}>#{i+1}</span>}
                      </div>
                      <div>
                        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,.28)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.email}</div>
                      </div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:14,color:"#C1272D",textAlign:"right"}}>{s.totalPoints}<span style={{fontSize:9,color:"rgba(255,255,255,.3)",marginLeft:2}}>pts</span></div>
                    </div>
                  ))}
                </div>

                {/* Quick nav links */}
                <div className="sc">
                  <div className="sc-head">
                    <div className="sc-title"><span className="material-icons" style={{fontSize:15,color:"#60a5fa"}}>apps</span>Accès Rapide</div>
                  </div>
                  <div style={{padding:"16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {[
                      {label:"Matches",    icon:"sports_soccer", href:"/MatchesRespo",color:"#C1272D", val:matches.length},
                      {label:"Équipes",    icon:"groups",        href:"/Teams",       color:"#a78bfa", val:teams.length},
                      {label:"Supporters", icon:"favorite",      href:"/Supporters",  color:"#f87171", val:supporters.length},
                      {label:"Stades",     icon:"stadium",       href:"/Stades",      color:"#0ea5e9", val:stades.length},
                      {label:"Villes",     icon:"location_city", href:"/Cities",      color:"#10b981", val:cities.length},
                      {label:"Attractions",icon:"attractions",   href:"/Attractions", color:"#f59e0b", val:"→"},
                      {label:"Joueurs",    icon:"person",        href:"/Players",     color:"#60a5fa", val:"→"},
                      {label:"Prédictions",icon:"psychology",    href:"/Predictions", color:"#fbbf24", val:predictions.length},
                    ].map(({label,icon,href,color,val})=>(
                      <a key={href} href={href} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",textDecoration:"none",transition:"all .18s"}}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.06)";e.currentTarget.style.borderColor=color+"44"}}
                        onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.03)";e.currentTarget.style.borderColor="rgba(255,255,255,.06)"}}>
                        <div style={{width:30,height:30,borderRadius:9,background:`${color}18`,border:`1px solid ${color}28`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <span className="material-icons" style={{fontSize:15,color}}>{icon}</span>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,color:"rgba(255,255,255,.8)"}}>{label}</div>
                          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:12,color}}>{val}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}