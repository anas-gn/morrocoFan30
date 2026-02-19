import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

const API = 'http://localhost:3309/api';

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
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div style={{ width: 48, height: 48, border: '3px solid #C1272D', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <Head>
        <title>My Favorites | MoroccoFan2030</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=Amiri:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
         <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #fff; color: #1c1917; }
        .syne  { font-family: 'Syne',  sans-serif; }
        .serif { font-family: 'Amiri', serif; }

        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes pglow   { 0%,100%{box-shadow:0 0 0 0 rgba(193,39,45,.5)} 50%{box-shadow:0 0 0 8px rgba(193,39,45,0)} }
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        @keyframes cardOut { to { opacity:0; transform:scale(.9) translateY(10px); } }

        .fu  { animation: fadeUp .5s ease-out forwards; opacity: 0; }
        .fi  { animation: fadeIn .4s ease-out forwards; opacity: 0; }
        .d1  { animation-delay:.08s } .d2 { animation-delay:.16s }
        .d3  { animation-delay:.24s } .d4 { animation-delay:.32s }

        /* ── Pills — identical to Matches page ── */
        .pill { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;border:1px solid; }
        .pill-live     { background:rgba(239,68,68,.1);   color:#dc2626; border-color:rgba(239,68,68,.3);   }
        .pill-done     { background:rgba(120,113,108,.1); color:#78716c; border-color:rgba(120,113,108,.3); }
        .pill-upcoming { background:rgba(0,98,51,.1);     color:#006233; border-color:rgba(0,98,51,.3);     }
        .pill-host     { background:rgba(193,39,45,.08);  color:#C1272D; border-color:rgba(193,39,45,.25);  }
        .pill-gold     { background:rgba(240,165,0,.1);   color:#b45309; border-color:rgba(240,165,0,.3);   }
        .live-dot      { width:6px;height:6px;border-radius:50%;background:#dc2626;display:inline-block;animation:blink 1.2s ease-in-out infinite; }
        .pulse-glow    { animation: pglow 2s infinite; }

        .nosb::-webkit-scrollbar { display:none; }
        .nosb { -ms-overflow-style:none; scrollbar-width:none; }

        /* ── Filter active ── */
        .filter-active { background:linear-gradient(to right,#2d0a0e,#1a0608)!important; color:#fff!important; border-color:transparent!important; }

        /* ── Stat cards ── */
        .stat-card { background:#fff; border:1px solid #e7e5e4; border-radius:16px; padding:20px 16px; text-align:center; transition:border-color .2s,box-shadow .2s; }
        .stat-card:hover { border-color:#C1272D; box-shadow:0 4px 20px rgba(193,39,45,.08); }
        .stat-val { font-size:36px; font-weight:800; line-height:1; font-family:'Syne',sans-serif; }
        .stat-lbl { font-size:11px; color:#a8a29e; text-transform:uppercase; letter-spacing:.08em; margin-top:6px; font-weight:500; }

        /* ── Fav card — match-card structure ── */
        .fav-card {
          background:#fff; border:1px solid #e7e5e4; border-radius:16px;
          overflow:hidden; transition:border-color .2s,transform .2s,box-shadow .2s;
          border-left:3px solid transparent;
        }
        .fav-card:hover {
          border-color:#C1272D; border-left-color:#C1272D;
          transform:translateY(-3px); box-shadow:0 12px 32px rgba(193,39,45,.1);
        }
        .fav-card.removing { animation: cardOut .28s ease-out forwards; }

        /* ── Team image zoom ── */
        .fav-card .team-img { transition:transform .7s cubic-bezier(.16,1,.3,1); }
        .fav-card:hover .team-img { transform:scale(1.06); }

        /* ── Skeleton ── */
        .skeleton {
          background:linear-gradient(90deg,#e7e5e4 25%,#f5f5f4 50%,#e7e5e4 75%);
          background-size:600px 100%; animation:shimmer 1.4s infinite; border-radius:8px;
        }

        /* ── Section header divider ── */
        .sec-hdr { display:flex; align-items:center; gap:16px; margin-bottom:20px; }
        .sec-hdr::after { content:''; flex:1; height:1px; background:linear-gradient(to right,rgba(193,39,45,.2),transparent); }

        @media(max-width:640px) { .stat-val{font-size:28px;} }
      `}</style>

      <Navbar />

      {/* ══ HERO — same structure as Matches ══ */}
      <header className="relative overflow-hidden" style={{ paddingTop: 80, minHeight: 420 }}>
        <div className="absolute inset-0">
          <img src="/images/stade.jpg" alt="" className="w-full h-full object-cover"
            onError={e => e.target.style.display = 'none'} />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg,rgba(45,10,14,.93) 0%,rgba(26,6,8,.86) 55%,rgba(0,98,51,.22) 100%)' }} />
          <div className="absolute inset-0 opacity-[.07] pointer-events-none"
            style={{ backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'180px' }} />
        </div>

        {/* Glows */}
        <div className="absolute top-16 left-8 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background:'rgba(193,39,45,.14)' }} />
        <div className="absolute bottom-0 right-8 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background:'rgba(0,98,51,.14)' }} />

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          {/* Badge */}
          <div className="fu mb-8">
            <span className="pill pill-host" style={{ fontSize:11, padding:'5px 14px' }}>
              <span className="material-icons" style={{ fontSize:12 }}>favorite</span>
              My Collection
            </span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            {/* Title */}
            <div className="fu d1">
              <h1 className="syne" style={{ fontSize:'clamp(40px,7vw,76px)', fontWeight:800, lineHeight:1, letterSpacing:'-.02em', color:'#fff', marginBottom:12 }}>
                My<br />
                <span style={{ color:'#C1272D' }} className="serif italic">Favorites</span>
              </h1>
              <p style={{ fontSize:15, color:'rgba(255,255,255,.6)', maxWidth:420, lineHeight:1.7 }}>
                Your handpicked teams and matches — all in one place.
              </p>
            </div>

            {/* Hero stats — same style as Matches */}
            <div className="fu d2 flex gap-8 md:gap-12">
              {[
                { v: favorites.length, l:'Total',   c:'#C1272D' },
                { v: teamFavs.length,  l:'Teams',   c:'#f0a500' },
                { v: matchFavs.length, l:'Matches', c:'#3dba7a' },
              ].map(({ v, l, c }) => (
                <div key={l} style={{ textAlign:'center' }}>
                  <div className="syne" style={{ fontSize:44, fontWeight:800, color:c, lineHeight:1 }}>{v}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.45)', textTransform:'uppercase', letterSpacing:'.1em', marginTop:4, fontWeight:600 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{ background:'linear-gradient(to bottom,transparent,#fff)' }} />
      </header>

      {/* ══ STAT CARDS ══ */}
      <section className="max-w-7xl mx-auto px-6" style={{ marginTop:50, marginBottom:24 }}>
        <div className="fu d2" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12 }}>
          {[
            { v: favorites.length, l:'Total Saved', c:'#C1272D' },
            { v: teamFavs.length,  l:'Teams',       c:'#b45309' },
            { v: matchFavs.length, l:'Matches',     c:'#006233' },
            { v: matchFavs.filter(f => { const m = matchDetails[f.ownerId]; return m && isLiveS(m.statut); }).length, l:'Live Now', c:'#dc2626' },
          ].map(({ v, l, c }) => (
            <div key={l} className="stat-card fu d3">
              <div className="stat-val" style={{ color:c }}>{v}</div>
              <div className="stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FILTER TABS — sticky bar like Matches ══ */}
      <div className="sticky z-40 bg-white border-b border-stone-100 shadow-sm" style={{ top:80 }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto nosb">
            {[
              { k:'all',   l:`All`,     count: favorites.length },
              { k:'Team',  l:`Teams`,   count: teamFavs.length  },
              { k:'Match', l:`Matches`, count: matchFavs.length },
            ].map(t => (
              <button key={t.k} onClick={() => setActiveTab(t.k)}
                className={`flex items-center gap-2 px-3 py-2 border-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${activeTab === t.k ? 'filter-active' : 'bg-white border-stone-200 text-stone-700 hover:border-[#C1272D]'}`}>
                <span className="material-icons" style={{ fontSize:13 }}>
                  {t.k === 'all' ? 'favorite' : t.k === 'Team' ? 'groups' : 'sports_soccer'}
                </span>
                {t.l}
                <span style={{
                  fontSize:9, padding:'1px 6px', borderRadius:99, fontWeight:700,
                  background: activeTab === t.k ? 'rgba(255,255,255,.2)' : '#f5f5f4',
                  color:      activeTab === t.k ? '#fff' : '#78716c',
                }}>{t.count}</span>
              </button>
            ))}

            <div style={{ flex:1 }} />
            <span style={{ fontSize:12, color:'#a8a29e', fontWeight:500 }} className="hidden sm:block">
              {shownFavs.length} saved
            </span>
          </div>
        </div>
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10" style={{ minHeight:'60vh' }}>

        {/* Empty state */}
        {shownFavs.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 24px' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'#f5f5f4', border:'1px solid #e7e5e4', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <span className="material-icons" style={{ fontSize:28, color:'#a8a29e' }}>favorite_border</span>
            </div>
            <div className="syne" style={{ fontSize:18, fontWeight:700, color:'#57534e', marginBottom:8 }}>No favorites yet</div>
            <div style={{ fontSize:13, color:'#a8a29e', marginBottom:24 }}>Browse teams and matches, then save them here.</div>
            <button onClick={() => router.push('/Team?id={favorite.ownerId}')}
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 24px', background:'linear-gradient(to right,#2d0a0e,#1a0608)', color:'#fff', border:'none', borderRadius:12, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, cursor:'pointer', boxShadow:'0 4px 16px rgba(193,39,45,.25)' }}>
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
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      {/* Section label — same date-hdr style from Matches calendar */}
                      <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 16px', borderRadius:10, background:'linear-gradient(to right,#2d0a0e,#1a0608)', fontSize:13, fontWeight:700, color:'#fff', fontFamily:'Syne,sans-serif', textTransform:'uppercase', letterSpacing:'.05em' }}>
                        <span className="material-icons" style={{ fontSize:14, color:'#C1272D' }}>groups</span>
                        Teams
                      </div>
                      <span style={{ fontSize:11, fontWeight:600, color:'#a8a29e', background:'#f5f5f4', padding:'3px 10px', borderRadius:99 }}>
                        {teamFavs.length}
                      </span>
                    </div>
                  </div>
                )}

                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:16 }}>
                  {teamFavs.map((fav, i) => {
                    const team       = teamDetails[fav.ownerId];
                    const isRemoving = removingId === fav.id;
                    return (
                      <div key={fav.id}
                        className={`fav-card fu${isRemoving ? ' removing' : ''}`}
                        style={{ animationDelay:`${i * .05}s` }}>

                        {/* Dark top strip — same as match-card */}
                        <div style={{ background:'linear-gradient(to right,#2d0a0e,#1a0608)', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span className="material-icons" style={{ fontSize:14, color:'#C1272D' }}>groups</span>
                            <span className="syne" style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.7)', textTransform:'uppercase', letterSpacing:'.06em' }}>
                              {team?.country || 'Team'}
                            </span>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span className="pill pill-host" style={{ fontSize:9 }}>Favorite</span>
                            {/* Remove btn */}
                            <button onClick={() => removeFavorite(fav)} disabled={isRemoving}
                              style={{ width:26, height:26, borderRadius:'50%', background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,.4)', transition:'all .2s' }}
                              onMouseOver={e => { e.currentTarget.style.background='rgba(220,38,38,.5)'; e.currentTarget.style.color='#fff'; }}
                              onMouseOut={e  => { e.currentTarget.style.background='rgba(255,255,255,.07)'; e.currentTarget.style.color='rgba(255,255,255,.4)'; }}>
                              {isRemoving
                                ? <span className="material-icons" style={{ fontSize:13, animation:'spin .8s linear infinite' }}>refresh</span>
                                : <span className="material-icons" style={{ fontSize:13 }}>favorite</span>
                              }
                            </button>
                          </div>
                        </div>

                        {/* Team image */}
                        <div style={{ height:150, overflow:'hidden', background:'#f5f5f4', position:'relative', cursor:'pointer' }}
                          onClick={() => router.push(`/Team?id=${fav.ownerId}`)}>
                          {team?.imageUrl
                            ? <img src={team.imageUrl} alt={team.name} className="team-img"
                                style={{ width:'100%', height:'100%', objectFit:'cover' }}
                                onError={e => e.target.style.display = 'none'} />
                            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <span className="material-icons" style={{ fontSize:48, color:'#d6d3d1' }}>groups</span>
                              </div>
                          }
                          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.45) 0%,transparent 55%)' }} />
                          {team && (
                            <div className="syne" style={{ position:'absolute', bottom:12, left:14, fontSize:18, fontWeight:800, color:'#fff', textShadow:'0 2px 8px rgba(0,0,0,.5)' }}>
                              {team.name}
                            </div>
                          )}
                        </div>

                        {/* Body */}
                        <div style={{ padding:'14px 16px', cursor:'pointer' }}
                          onClick={() => router.push(`/Teams?id=${fav.ownerId}`)}>
                          {team ? (
                            <>
                              {team.coach && (
                                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#57534e', marginBottom:10 }}>
                                  <span className="material-icons" style={{ fontSize:13, color:'#C1272D' }}>person</span>
                                  <span style={{ color:'#a8a29e' }}>Coach</span>
                                  <span style={{ fontWeight:600 }}>{team.coach}</span>
                                </div>
                              )}
                              {/* Bottom row — same as match-card venue row */}
                              <div style={{ paddingTop:10, borderTop:'1px solid #f5f5f4', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                <span style={{ fontSize:11, color:'#a8a29e', display:'flex', alignItems:'center', gap:4 }}>
                                  <span className="material-icons" style={{ fontSize:12 }}>calendar_today</span>
                                  {formatDate(fav.dateOfAdd)}
                                </span>
                                <span className="material-icons" style={{ fontSize:16, color:'#d6d3d1' }}>arrow_forward_ios</span>
                              </div>
                            </>
                          ) : (
                            <div>
                              <div className="skeleton" style={{ height:14, width:'60%', marginBottom:8 }} />
                              <div className="skeleton" style={{ height:10, width:'40%' }} />
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
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 16px', borderRadius:10, background:'linear-gradient(to right,#2d0a0e,#1a0608)', fontSize:13, fontWeight:700, color:'#fff', fontFamily:'Syne,sans-serif', textTransform:'uppercase', letterSpacing:'.05em' }}>
                        <span className="material-icons" style={{ fontSize:14, color:'#C1272D' }}>sports_soccer</span>
                        Matches
                      </div>
                      <span style={{ fontSize:11, fontWeight:600, color:'#a8a29e', background:'#f5f5f4', padding:'3px 10px', borderRadius:99 }}>
                        {matchFavs.length}
                      </span>
                    </div>
                  </div>
                )}

                {/* Match cards — identical structure to Matches page match-card */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
                  {matchFavs.map((fav, i) => {
                    const match      = matchDetails[fav.ownerId];
                    const isRemoving = removingId === fav.id;
                    const live       = match ? isLiveS(match.statut) : false;
                    const done       = match ? isDone(match.statut)  : false;
                    const { label, cls, pulse } = match ? getStatus(match.statut) : { label:'—', cls:'pill-default', pulse:false };
                    const home = match?.matchTeams?.[0];
                    const away = match?.matchTeams?.[1];
                    const date = match ? new Date(match.dateOfMatch) : null;

                    return (
                      <div key={fav.id}
                        className={`fav-card fu${isRemoving ? ' removing' : ''}`}
                        style={{ animationDelay:`${i * .05}s` }}>

                        {/* Dark top — identical to match-card */}
                        <div style={{ background:'linear-gradient(to right,#2d0a0e,#1a0608)', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span className={`pill ${cls}${pulse ? ' pulse-glow' : ''}`}>
                              {pulse && <span className="live-dot" />}
                              {label}
                            </span>
                            {match?.type && (
                              <span style={{ fontSize:10, color:'rgba(255,255,255,.35)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em' }}>
                                {match.type}
                              </span>
                            )}
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            {date && (
                              <span style={{ fontSize:10, color:'rgba(255,255,255,.35)', display:'flex', alignItems:'center', gap:3 }}>
                                <span className="material-icons" style={{ fontSize:11 }}>schedule</span>
                                {date.toLocaleDateString('en-US',{month:'short',day:'numeric'})} · {date.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
                              </span>
                            )}
                            {/* Remove btn */}
                            <button onClick={() => removeFavorite(fav)} disabled={isRemoving}
                              style={{ width:26, height:26, borderRadius:'50%', background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,.4)', transition:'all .2s' }}
                              onMouseOver={e => { e.currentTarget.style.background='rgba(220,38,38,.5)'; e.currentTarget.style.color='#fff'; }}
                              onMouseOut={e  => { e.currentTarget.style.background='rgba(255,255,255,.07)'; e.currentTarget.style.color='rgba(255,255,255,.4)'; }}>
                              {isRemoving
                                ? <span className="material-icons" style={{ fontSize:13, animation:'spin .8s linear infinite' }}>refresh</span>
                                : <span className="material-icons" style={{ fontSize:13 }}>favorite</span>
                              }
                            </button>
                          </div>
                        </div>

                        {/* Teams body — identical layout to match-card */}
                        <div style={{ padding:'20px 16px', cursor:'pointer' }}
                          onClick={() => router.push(`/match/${fav.ownerId}`)}>
                          {match ? (
                            <>
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                {/* Team 1 */}
                                <div style={{ flex:1, textAlign:'center' }}>
                                  <div style={{ width:52, height:52, borderRadius:'50%', overflow:'hidden', border:'2px solid #f5f5f4', margin:'0 auto 8px', background:'#fafaf9' }}>
                                    <img src={home?.imageUrl} alt={home?.teamName}
                                      style={{ width:'100%', height:'100%', objectFit:'cover' }}
                                      onError={e => e.target.style.display = 'none'} />
                                  </div>
                                  <div className="syne" style={{ fontSize:12, fontWeight:600, color:'#1c1917', lineHeight:1.3 }}>{home?.teamName || 'TBD'}</div>
                                  {done && <div className="syne" style={{ fontSize:26, fontWeight:800, color:'#C1272D', lineHeight:1.1, marginTop:4 }}>{home?.goals ?? 0}</div>}
                                </div>

                                {/* Score center */}
                                <div style={{ minWidth:60, textAlign:'center' }}>
                                  {(done || live)
                                    ? <div style={{ fontSize:11, fontWeight:700, color:'#a8a29e', background:'#f5f5f4', padding:'4px 8px', borderRadius:8 }}>
                                        {done ? 'FT' : <span style={{ color:'#dc2626' }}>LIVE</span>}
                                      </div>
                                    : <div style={{ fontSize:18, fontWeight:300, color:'#d6d3d1' }}>VS</div>
                                  }
                                  {!done && !live && (
                                    <div style={{ fontSize:11, color:'#a8a29e', marginTop:4, fontWeight:600 }}>{formatTime(match.dateOfMatch)}</div>
                                  )}
                                </div>

                                {/* Team 2 */}
                                <div style={{ flex:1, textAlign:'center' }}>
                                  <div style={{ width:52, height:52, borderRadius:'50%', overflow:'hidden', border:'2px solid #f5f5f4', margin:'0 auto 8px', background:'#fafaf9' }}>
                                    <img src={away?.imageUrl} alt={away?.teamName}
                                      style={{ width:'100%', height:'100%', objectFit:'cover' }}
                                      onError={e => e.target.style.display = 'none'} />
                                  </div>
                                  <div className="syne" style={{ fontSize:12, fontWeight:600, color:'#1c1917', lineHeight:1.3 }}>{away?.teamName || 'TBD'}</div>
                                  {done && <div className="syne" style={{ fontSize:26, fontWeight:800, color:'#006233', lineHeight:1.1, marginTop:4 }}>{away?.goals ?? 0}</div>}
                                </div>
                              </div>

                              {/* Venue row — same bottom row as match-card */}
                              <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid #f5f5f4', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#78716c' }}>
                                  <span className="material-icons" style={{ fontSize:13, color:'#C1272D' }}>stadium</span>
                                  <span style={{ fontWeight:500 }}>{match.stadeName || 'TBD'}</span>
                                </div>
                                <span style={{ fontSize:10, color:'#a8a29e', display:'flex', alignItems:'center', gap:3 }}>
                                  <span className="material-icons" style={{ fontSize:11 }}>calendar_today</span>
                                  {formatDate(fav.dateOfAdd)}
                                </span>
                              </div>
                            </>
                          ) : (
                            /* Skeleton */
                            <div>
                              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-around', marginBottom:14 }}>
                                <div className="skeleton" style={{ width:52, height:52, borderRadius:'50%' }} />
                                <div className="skeleton" style={{ width:40, height:20, borderRadius:8 }} />
                                <div className="skeleton" style={{ width:52, height:52, borderRadius:'50%' }} />
                              </div>
                              <div className="skeleton" style={{ height:10, width:'70%', margin:'0 auto' }} />
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
      </main>

      <Footer />
    </>
  );
}