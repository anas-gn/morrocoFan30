import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';
import Link from 'next/link';

const API = 'https://anas-gana1-fandb-backend.hf.space/api';

export default function Favorites() {
  const router = useRouter();

  const [favorites, setFavorites]       = useState([]);
  const [activeTab, setActiveTab]       = useState('all');
  const [loading, setLoading]           = useState(true);
  const [removingId, setRemovingId]     = useState(null);
  const [supporterId, setSupporterId]   = useState(null);
  const [teamDetails, setTeamDetails]   = useState({});
  const [matchDetails, setMatchDetails] = useState({});

  useEffect(() => {
    const id = localStorage.getItem('supporterId') || 1;
    setSupporterId(parseInt(id));
  }, []);

  useEffect(() => {
    if (!supporterId) return;
    setLoading(true);
    fetch(`${API}/favorites/${supporterId}`)
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setFavorites(arr);
        setLoading(false);
        arr.forEach(fav => {
          if (fav.type === 'Team') {
            fetch(`${API}/teams/teams/${fav.ownerId}`).then(r => r.json())
              .then(d => setTeamDetails(p => ({ ...p, [fav.ownerId]: d }))).catch(() => {});
          } else if (fav.type === 'Match') {
            fetch(`${API}/matches/matches/${fav.ownerId}`).then(r => r.json())
              .then(d => setMatchDetails(p => ({ ...p, [fav.ownerId]: d }))).catch(() => {});
          }
        });
      })
      .catch(() => { setFavorites([]); setLoading(false); });
  }, [supporterId]);

  const removeFavorite = (fav) => {
    setRemovingId(fav.id);
    fetch(`${API}/favorites/remove?supporterId=${supporterId}&ownerId=${fav.ownerId}&type=${fav.type}`, { method: 'DELETE' })
      .then(r => { if (r.ok || r.status === 204) setFavorites(p => p.filter(f => f.id !== fav.id)); })
      .catch(() => {}).finally(() => setRemovingId(null));
  };

  const teamFavs  = favorites.filter(f => f.type === 'Team');
  const matchFavs = favorites.filter(f => f.type === 'Match');
  const shownFavs = activeTab === 'all' ? favorites : activeTab === 'Team' ? teamFavs : matchFavs;

  const formatDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';
  const formatTime = d => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  const isDone  = s => { const v = (s || '').toLowerCase(); return v.includes('termin') || v.includes('finish') || v === 'done' || v === 'ended'; };
  const isLiveS = s => { const v = (s || '').toLowerCase(); return v === 'live' || v === 'commence' || v === 'started' || v === 'direct' || v === 'en cours'; };

  const getStatus = (s) => {
    if (isLiveS(s))  return { label: 'LIVE',      cls: 'pill-live',     pulse: true  };
    if (isDone(s))   return { label: 'FT',        cls: 'pill-done',     pulse: false };
    return                  { label: 'Upcoming',  cls: 'pill-upcoming', pulse: false };
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#090204' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <img src="/images/logo.png" alt="" style={{ width:60, height:60, opacity:.7, animation:"s 1.2s linear infinite" }} />
        <style>{`@keyframes s{to{transform:rotate(360deg)}}`}</style>
        <span style={{ fontFamily:"Syne,sans-serif", fontSize:12, color:"rgba(255,255,255,.3)", letterSpacing:".1em", textTransform:"uppercase" }}>Loading…</span>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>My Favorites | MoroccoFan2030</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Inter:wght@300;400;500;600;700&family=Amiri:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style>{`
        .fp *, .fp *::before, .fp *::after { box-sizing:border-box; }
        .fp { font-family:'Inter',sans-serif; background:#090204; color:#fff; min-height:100vh; }

        @keyframes fp-up   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
        @keyframes fp-fade { from{opacity:0} to{opacity:1} }
        @keyframes fp-spin { to{transform:rotate(360deg)} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes pglow   { 0%,100%{box-shadow:0 0 0 0 rgba(193,39,45,.5)} 50%{box-shadow:0 0 0 8px rgba(193,39,45,0)} }
        @keyframes cardOut { to{opacity:0;transform:scale(.9) translateY(10px)} }

        .fp .au  { animation:fp-up  .55s cubic-bezier(.22,.68,0,1.2) both; }
        .fp .af  { animation:fp-fade .35s ease both; }
        .fp .d1{animation-delay:.04s} .fp .d2{animation-delay:.10s}
        .fp .d3{animation-delay:.16s} .fp .d4{animation-delay:.22s}
        .fp .d5{animation-delay:.28s} .fp .d6{animation-delay:.34s}

        /* Pills */
        .fp .pill { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;border:1px solid; }
        .fp .pill-live     { background:rgba(239,68,68,.1);   color:#dc2626; border-color:rgba(239,68,68,.3);   }
        .fp .pill-done     { background:rgba(255,255,255,.07); color:rgba(255,255,255,.45); border-color:rgba(255,255,255,.12); }
        .fp .pill-upcoming { background:rgba(0,98,51,.14);    color:#3dba7a; border-color:rgba(0,98,51,.28);   }
        .fp .pill-host     { background:rgba(193,39,45,.14);  color:#e85d65; border-color:rgba(193,39,45,.28); }
        .fp .live-dot      { width:6px;height:6px;border-radius:50%;background:#dc2626;display:inline-block;animation:blink 1.2s ease-in-out infinite; }
        .fp .pulse-glow    { animation:pglow 2s infinite; }

        .fp .nosb::-webkit-scrollbar { display:none; }
        .fp .nosb { -ms-overflow-style:none; scrollbar-width:none; }

        /* Fav card */
        .fp .fav-card {
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.07);
          border-radius:16px; overflow:hidden;
          transition:all .22s; cursor:pointer;
        }
        .fp .fav-card:hover {
          border-color:rgba(193,39,45,.4);
          box-shadow:0 12px 40px rgba(193,39,45,.12);
          transform:translateY(-2px);
        }
        .fp .fav-card.removing { animation:cardOut .28s ease-out forwards; }

        /* Team img zoom */
        .fp .fav-card .team-img { transition:transform .7s cubic-bezier(.16,1,.3,1); }
        .fp .fav-card:hover .team-img { transform:scale(1.06); }

        /* Skeleton */
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        .fp .skeleton {
          background:linear-gradient(90deg,rgba(255,255,255,.06) 25%,rgba(255,255,255,.1) 50%,rgba(255,255,255,.06) 75%);
          background-size:600px 100%; animation:shimmer 1.4s infinite; border-radius:8px;
        }

        /* Section header */
        .fp .sec-hdr { display:flex; align-items:center; gap:16px; margin-bottom:20px; }
        .fp .sec-hdr::after { content:''; flex:1; height:1px; background:linear-gradient(to right,rgba(193,39,45,.3),transparent); }

        @media(max-width:560px){
          .fp .stats-grid { grid-template-columns:1fr 1fr!important; }
        }
      `}</style>

      <Navbar />

      <div className="fp">

        {/* ══════════ HERO — Routes style ══════════ */}
        <div style={{ paddingTop:88, background:"linear-gradient(to bottom,rgba(40,8,12,.9),#090204)", borderBottom:"1px solid rgba(255,255,255,.05)", position:"relative", overflow:"hidden" }}>
          {/* bg glows */}
          <div style={{ position:"absolute", top:-100, right:-60, width:500, height:500, background:"radial-gradient(circle,rgba(193,39,45,.18),transparent 70%)", filter:"blur(90px)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-80, left:-80, width:400, height:400, background:"radial-gradient(circle,rgba(0,98,51,.12),transparent 70%)", filter:"blur(80px)", pointerEvents:"none" }} />
          {/* zellige pattern */}
          <div style={{ position:"absolute", inset:0, opacity:.025, backgroundImage:"repeating-linear-gradient(45deg,#C1272D 0,#C1272D 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,#006233 0,#006233 1px,transparent 0,transparent 50%)", backgroundSize:"20px 20px", pointerEvents:"none" }} />

          <div style={{ maxWidth:1200, margin:"0 auto", padding:"48px 24px 44px", position:"relative", zIndex:2 }}>

            {/* breadcrumb */}
            <div className="au" style={{ display:"flex", alignItems:"center", gap:6, marginBottom:20, fontSize:10, fontFamily:"Syne,sans-serif", color:"rgba(255,255,255,.3)", textTransform:"uppercase", letterSpacing:".1em" }}>
              <Link href="/Profil" style={{ color:"rgba(255,255,255,.3)", textDecoration:"none" }}>Profil</Link>
              <span className="material-icons" style={{ fontSize:12 }}>chevron_right</span>
              <span style={{ color:"#C1272D" }}>Favorites</span>
            </div>

            {/* title row */}
            <div className="au d1" style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:24, flexWrap:"wrap", marginTop:95 }}>
              <div>
                <h1 style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:"clamp(28px,4.5vw,52px)", color:"#fff", lineHeight:1.05, margin:0 }}>
                  My <span style={{ color:"#C1272D" }}>Favorites</span>
                </h1>
                <p className="au d2" style={{ fontFamily:"Inter,sans-serif", fontSize:14, color:"rgba(255,255,255,.45)", maxWidth:500, lineHeight:1.7, margin:"10px 0 0" }}>
                  Your handpicked teams and matches — all in one place.
                </p>
              </div>
              {/* decorative arabic */}
              <div className="au d3" style={{ fontFamily:"Amiri,serif", fontStyle:"italic", fontSize:28, color:"rgba(0,98,51,.35)", lineHeight:1.2, textAlign:"right" }}>
                المفضلة<br/>والاختيارات
              </div>
            </div>

            {/* ── STATS CHIPS ── */}
            <div className="au d3 stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginTop:32 }}>
              {[
                { label:"Total Saved", value:favorites.length,  icon:"favorite",             color:"rgba(255,255,255,.75)" },
                { label:"Teams",       value:teamFavs.length,   icon:"groups",               color:"#f0a500"               },
                { label:"Matches",     value:matchFavs.length,  icon:"sports_soccer",        color:"#3dba7a"               },
                { label:"Live Now",    value:matchFavs.filter(f => { const m = matchDetails[f.ownerId]; return m && isLiveS(m.statut); }).length,
                                                                icon:"radio_button_checked", color:"#C1272D"               },
              ].map(({ label, value, icon, color }) => (
                <div key={label} style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)", borderRadius:14, padding:"16px 20px", display:"flex", flexDirection:"column", gap:5, transition:"border-color .2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor="rgba(193,39,45,.25)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="rgba(255,255,255,.07)"}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span className="material-icons" style={{ fontSize:13, color, opacity:.8 }}>{icon}</span>
                    <span style={{ fontSize:9, fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(255,255,255,.3)", textTransform:"uppercase", letterSpacing:".08em" }}>{label}</span>
                  </div>
                  <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:22, color, lineHeight:1 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* ── FILTER TABS ── */}
            <div className="au d4" style={{ display:"flex", gap:8, marginTop:28, paddingTop:24, borderTop:"1px solid rgba(255,255,255,.06)", flexWrap:"wrap" }}>
              {[
                { k:"all",   l:"All Favorites", icon:"favorite",      count:favorites.length },
                { k:"Team",  l:"Teams",         icon:"groups",        count:teamFavs.length  },
                { k:"Match", l:"Matches",       icon:"sports_soccer", count:matchFavs.length },
              ].map(({ k, l, icon, count }) => (
                <button key={k} onClick={() => setActiveTab(k)}
                  style={{
                    display:"inline-flex", alignItems:"center", gap:7,
                    padding:"9px 18px", borderRadius:10, cursor:"pointer", transition:"all .18s",
                    fontFamily:"Syne,sans-serif", fontSize:11, fontWeight:700,
                    textTransform:"uppercase", letterSpacing:".05em",
                    ...(activeTab === k
                      ? { background:"linear-gradient(135deg,#C1272D,#a01e23)", color:"#fff", border:"none", boxShadow:"0 4px 16px rgba(193,39,45,.3)" }
                      : { background:"rgba(255,255,255,.06)", color:"rgba(255,255,255,.5)", border:"1px solid rgba(255,255,255,.08)" }
                    )
                  }}
                  onMouseEnter={e => { if(activeTab!==k){ e.currentTarget.style.background="rgba(255,255,255,.1)"; e.currentTarget.style.color="#fff"; }}}
                  onMouseLeave={e => { if(activeTab!==k){ e.currentTarget.style.background="rgba(255,255,255,.06)"; e.currentTarget.style.color="rgba(255,255,255,.5)"; }}}>
                  <span className="material-icons" style={{ fontSize:14 }}>{icon}</span>
                  {l}
                  <span style={{ fontSize:9, padding:"1px 7px", borderRadius:999, fontWeight:800, background:activeTab===k?"rgba(255,255,255,.2)":"rgba(255,255,255,.08)", color:activeTab===k?"#fff":"rgba(255,255,255,.4)" }}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════ CONTENT ══════════ */}
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"40px 24px 80px", minHeight:"60vh" }}>

          {/* Empty state */}
          {shownFavs.length === 0 && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 0", gap:16, textAlign:"center" }}>
              <div style={{ width:88, height:88, borderRadius:"50%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span className="material-icons" style={{ fontSize:40, color:"rgba(255,255,255,.13)" }}>favorite_border</span>
              </div>
              <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:18, color:"rgba(255,255,255,.35)" }}>No favorites yet</div>
              <div style={{ fontFamily:"Inter,sans-serif", fontSize:13, color:"rgba(255,255,255,.25)", maxWidth:320 }}>Browse teams and matches, then save them here.</div>
              <button onClick={() => router.push('/Teams')}
                style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 22px", background:"linear-gradient(135deg,#C1272D,#a01e23)", color:"#fff", border:"none", borderRadius:10, fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:12, cursor:"pointer", boxShadow:"0 4px 16px rgba(193,39,45,.3)" }}>
                <span className="material-icons" style={{ fontSize:16 }}>groups</span>
                Browse Teams
              </button>
            </div>
          )}

          {shownFavs.length > 0 && (
            <>
              {/* ─── TEAMS SECTION ─── */}
              {(activeTab === 'all' || activeTab === 'Team') && teamFavs.length > 0 && (
                <section style={{ marginBottom:48 }}>
                  {activeTab === 'all' && (
                    <div className="sec-hdr">
                      <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"7px 16px", borderRadius:10, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.09)", fontSize:11, fontWeight:700, color:"rgba(255,255,255,.6)", fontFamily:"Syne,sans-serif", textTransform:"uppercase", letterSpacing:".07em" }}>
                        <span className="material-icons" style={{ fontSize:14, color:"#f0a500" }}>groups</span>
                        Teams
                        <span style={{ fontSize:9, padding:"1px 7px", borderRadius:999, background:"rgba(240,165,0,.15)", color:"#f0a500", fontWeight:800 }}>{teamFavs.length}</span>
                      </div>
                    </div>
                  )}

                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
                    {teamFavs.map((fav, i) => {
                      const team       = teamDetails[fav.ownerId];
                      const isRemoving = removingId === fav.id;
                      return (
                        <div key={fav.id} className={`fav-card au${isRemoving ? ' removing' : ''}`} style={{ animationDelay:`${i*.05}s` }}>

                          {/* Dark top strip */}
                          <div style={{ background:"linear-gradient(to right,#2d0a0e,#1a0608)", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <span className="material-icons" style={{ fontSize:14, color:"#C1272D" }}>groups</span>
                              <span style={{ fontFamily:"Syne,sans-serif", fontSize:11, fontWeight:700, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:".06em" }}>
                                {team?.country || 'Team'}
                              </span>
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <span className="pill pill-host" style={{ fontSize:9 }}>Favorite</span>
                              <button onClick={() => removeFavorite(fav)} disabled={isRemoving}
                                style={{ width:26, height:26, borderRadius:"50%", background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.15)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"rgba(255,255,255,.4)", transition:"all .2s" }}
                                onMouseOver={e => { e.currentTarget.style.background="rgba(220,38,38,.5)"; e.currentTarget.style.color="#fff"; }}
                                onMouseOut={e  => { e.currentTarget.style.background="rgba(255,255,255,.07)"; e.currentTarget.style.color="rgba(255,255,255,.4)"; }}>
                                {isRemoving
                                  ? <span className="material-icons" style={{ fontSize:13, animation:"fp-spin .8s linear infinite" }}>refresh</span>
                                  : <span className="material-icons" style={{ fontSize:13 }}>favorite</span>
                                }
                              </button>
                            </div>
                          </div>

                          {/* Team image */}
                          <div style={{ height:150, overflow:"hidden", background:"rgba(255,255,255,.03)", position:"relative", cursor:"pointer" }}
                            onClick={() => router.push(`/Team?id=${fav.ownerId}`)}>
                            {team?.imageUrl
                              ? <img src={team.imageUrl} alt={team.name} className="team-img"
                                  style={{ width:"100%", height:"100%", objectFit:"cover" }}
                                  onError={e => e.target.style.display='none'} />
                              : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                  <span className="material-icons" style={{ fontSize:48, color:"rgba(255,255,255,.1)" }}>groups</span>
                                </div>
                            }
                            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,.6) 0%,transparent 55%)" }} />
                            {team && (
                              <div style={{ position:"absolute", bottom:12, left:14, fontFamily:"Syne,sans-serif", fontSize:18, fontWeight:800, color:"#fff", textShadow:"0 2px 8px rgba(0,0,0,.5)" }}>
                                {team.name}
                              </div>
                            )}
                          </div>

                          {/* Body */}
                          <div style={{ padding:"14px 16px", cursor:"pointer" }}
                            onClick={() => router.push(`/Teams?id=${fav.ownerId}`)}>
                            {team ? (
                              <>
                                {team.coach && (
                                  <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"rgba(255,255,255,.45)", marginBottom:10 }}>
                                    <span className="material-icons" style={{ fontSize:13, color:"#C1272D" }}>person</span>
                                    <span style={{ color:"rgba(255,255,255,.3)" }}>Coach</span>
                                    <span style={{ fontWeight:600, color:"rgba(255,255,255,.7)" }}>{team.coach}</span>
                                  </div>
                                )}
                                <div style={{ paddingTop:10, borderTop:"1px solid rgba(255,255,255,.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                                  <span style={{ fontSize:11, color:"rgba(255,255,255,.3)", display:"flex", alignItems:"center", gap:4 }}>
                                    <span className="material-icons" style={{ fontSize:12 }}>calendar_today</span>
                                    {formatDate(fav.dateOfAdd)}
                                  </span>
                                  <span className="material-icons" style={{ fontSize:16, color:"rgba(255,255,255,.15)" }}>arrow_forward_ios</span>
                                </div>
                              </>
                            ) : (
                              <div>
                                <div className="skeleton" style={{ height:14, width:"60%", marginBottom:8 }} />
                                <div className="skeleton" style={{ height:10, width:"40%" }} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ─── MATCHES SECTION ─── */}
              {(activeTab === 'all' || activeTab === 'Match') && matchFavs.length > 0 && (
                <section>
                  {activeTab === 'all' && (
                    <div className="sec-hdr">
                      <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"7px 16px", borderRadius:10, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.09)", fontSize:11, fontWeight:700, color:"rgba(255,255,255,.6)", fontFamily:"Syne,sans-serif", textTransform:"uppercase", letterSpacing:".07em" }}>
                        <span className="material-icons" style={{ fontSize:14, color:"#3dba7a" }}>sports_soccer</span>
                        Matches
                        <span style={{ fontSize:9, padding:"1px 7px", borderRadius:999, background:"rgba(61,186,122,.15)", color:"#3dba7a", fontWeight:800 }}>{matchFavs.length}</span>
                      </div>
                    </div>
                  )}

                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
                    {matchFavs.map((fav, i) => {
                      const match      = matchDetails[fav.ownerId];
                      const isRemoving = removingId === fav.id;
                      const live       = match ? isLiveS(match.statut) : false;
                      const done       = match ? isDone(match.statut)  : false;
                      const { label, cls, pulse } = match ? getStatus(match.statut) : { label:'—', cls:'pill-done', pulse:false };
                      const home = match?.matchTeams?.[0];
                      const away = match?.matchTeams?.[1];
                      const date = match ? new Date(match.dateOfMatch) : null;

                      return (
                        <div key={fav.id} className={`fav-card au${isRemoving ? ' removing' : ''}`} style={{ animationDelay:`${i*.05}s` }}>

                          {/* Dark top */}
                          <div style={{ background:"linear-gradient(to right,#2d0a0e,#1a0608)", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <span className={`pill ${cls}${pulse ? ' pulse-glow' : ''}`}>
                                {pulse && <span className="live-dot" />}
                                {label}
                              </span>
                              {match?.type && (
                                <span style={{ fontSize:10, color:"rgba(255,255,255,.35)", fontWeight:600, textTransform:"uppercase", letterSpacing:".06em" }}>
                                  {match.type}
                                </span>
                              )}
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              {date && (
                                <span style={{ fontSize:10, color:"rgba(255,255,255,.35)", display:"flex", alignItems:"center", gap:3 }}>
                                  <span className="material-icons" style={{ fontSize:11 }}>schedule</span>
                                  {date.toLocaleDateString('en-US',{month:'short',day:'numeric'})} · {date.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
                                </span>
                              )}
                              <button onClick={() => removeFavorite(fav)} disabled={isRemoving}
                                style={{ width:26, height:26, borderRadius:"50%", background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.15)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"rgba(255,255,255,.4)", transition:"all .2s" }}
                                onMouseOver={e => { e.currentTarget.style.background="rgba(220,38,38,.5)"; e.currentTarget.style.color="#fff"; }}
                                onMouseOut={e  => { e.currentTarget.style.background="rgba(255,255,255,.07)"; e.currentTarget.style.color="rgba(255,255,255,.4)"; }}>
                                {isRemoving
                                  ? <span className="material-icons" style={{ fontSize:13, animation:"fp-spin .8s linear infinite" }}>refresh</span>
                                  : <span className="material-icons" style={{ fontSize:13 }}>favorite</span>
                                }
                              </button>
                            </div>
                          </div>

                          {/* Teams body */}
                          <div style={{ padding:"20px 16px", cursor:"pointer" }}
                            onClick={() => router.push(`/match/${fav.ownerId}`)}>
                            {match ? (
                              <>
                                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                  {/* Team 1 */}
                                  <div style={{ flex:1, textAlign:"center" }}>
                                    <div style={{ width:52, height:52, borderRadius:"50%", overflow:"hidden", border:"2px solid rgba(255,255,255,.1)", margin:"0 auto 8px", background:"rgba(255,255,255,.06)" }}>
                                      <img src={home?.imageUrl} alt={home?.teamName}
                                        style={{ width:"100%", height:"100%", objectFit:"cover" }}
                                        onError={e => e.target.style.display='none'} />
                                    </div>
                                    <div style={{ fontFamily:"Syne,sans-serif", fontSize:12, fontWeight:600, color:"rgba(255,255,255,.8)", lineHeight:1.3 }}>{home?.teamName || 'TBD'}</div>
                                    {done && <div style={{ fontFamily:"Syne,sans-serif", fontSize:26, fontWeight:800, color:"#C1272D", lineHeight:1.1, marginTop:4 }}>{home?.goals ?? 0}</div>}
                                  </div>

                                  {/* Score center */}
                                  <div style={{ minWidth:60, textAlign:"center" }}>
                                    {(done || live)
                                      ? <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.4)", background:"rgba(255,255,255,.07)", padding:"4px 8px", borderRadius:8, border:"1px solid rgba(255,255,255,.1)" }}>
                                          {done ? 'FT' : <span style={{ color:"#dc2626" }}>LIVE</span>}
                                        </div>
                                      : <div style={{ fontSize:18, fontWeight:300, color:"rgba(255,255,255,.2)" }}>VS</div>
                                    }
                                    {!done && !live && (
                                      <div style={{ fontSize:11, color:"rgba(255,255,255,.3)", marginTop:4, fontWeight:600 }}>{formatTime(match.dateOfMatch)}</div>
                                    )}
                                  </div>

                                  {/* Team 2 */}
                                  <div style={{ flex:1, textAlign:"center" }}>
                                    <div style={{ width:52, height:52, borderRadius:"50%", overflow:"hidden", border:"2px solid rgba(255,255,255,.1)", margin:"0 auto 8px", background:"rgba(255,255,255,.06)" }}>
                                      <img src={away?.imageUrl} alt={away?.teamName}
                                        style={{ width:"100%", height:"100%", objectFit:"cover" }}
                                        onError={e => e.target.style.display='none'} />
                                    </div>
                                    <div style={{ fontFamily:"Syne,sans-serif", fontSize:12, fontWeight:600, color:"rgba(255,255,255,.8)", lineHeight:1.3 }}>{away?.teamName || 'TBD'}</div>
                                    {done && <div style={{ fontFamily:"Syne,sans-serif", fontSize:26, fontWeight:800, color:"#3dba7a", lineHeight:1.1, marginTop:4 }}>{away?.goals ?? 0}</div>}
                                  </div>
                                </div>

                                {/* Venue row */}
                                <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid rgba(255,255,255,.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                                  <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"rgba(255,255,255,.35)" }}>
                                    <span className="material-icons" style={{ fontSize:13, color:"#C1272D" }}>stadium</span>
                                    <span style={{ fontWeight:500 }}>{match.stadeName || 'TBD'}</span>
                                  </div>
                                  <span style={{ fontSize:10, color:"rgba(255,255,255,.25)", display:"flex", alignItems:"center", gap:3 }}>
                                    <span className="material-icons" style={{ fontSize:11 }}>calendar_today</span>
                                    {formatDate(fav.dateOfAdd)}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div>
                                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-around", marginBottom:14 }}>
                                  <div className="skeleton" style={{ width:52, height:52, borderRadius:"50%" }} />
                                  <div className="skeleton" style={{ width:40, height:20, borderRadius:8 }} />
                                  <div className="skeleton" style={{ width:52, height:52, borderRadius:"50%" }} />
                                </div>
                                <div className="skeleton" style={{ height:10, width:"70%", margin:"0 auto" }} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}