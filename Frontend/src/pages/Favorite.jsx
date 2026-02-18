import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

const API = 'http://localhost:3309/api';

export default function Favorites() {
  const router = useRouter();

  const [favorites, setFavorites]     = useState([]);
  const [activeTab, setActiveTab]     = useState('all');
  const [loading, setLoading]         = useState(true);
  const [removingId, setRemovingId]   = useState(null);
  const [supporterId, setSupporterId] = useState(null);
  const [teamDetails, setTeamDetails] = useState({});
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
            fetch(`${API}/teams/teams/${fav.ownerId}`).then(r=>r.json())
              .then(d => setTeamDetails(p => ({ ...p, [fav.ownerId]: d }))).catch(()=>{});
          } else if (fav.type === 'Match') {
            fetch(`${API}/matches/matches/${fav.ownerId}`).then(r=>r.json())
              .then(d => setMatchDetails(p => ({ ...p, [fav.ownerId]: d }))).catch(()=>{});
          }
        });
      })
      .catch(() => { setFavorites([]); setLoading(false); });
  }, [supporterId]);

  const removeFavorite = (fav) => {
    setRemovingId(fav.id);
    fetch(`${API}/favorites/remove?supporterId=${supporterId}&ownerId=${fav.ownerId}&type=${fav.type}`, { method: 'DELETE' })
      .then(r => { if (r.ok || r.status === 204) setFavorites(p => p.filter(f => f.id !== fav.id)); })
      .catch(()=>{}).finally(() => setRemovingId(null));
  };

  const teamFavs  = favorites.filter(f => f.type === 'Team');
  const matchFavs = favorites.filter(f => f.type === 'Match');
  const shownFavs = activeTab === 'all' ? favorites : activeTab === 'Team' ? teamFavs : matchFavs;

  const formatDate = d => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'TBD';
  const formatTime = d => d ? new Date(d).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '';

  const isDone  = s => { const v=(s||'').toLowerCase(); return v.includes('termin')||v.includes('finish')||v==='done'||v==='ended'; };
  const isLiveS = s => { const v=(s||'').toLowerCase(); return v==='live'||v==='commence'||v==='started'||v==='direct'||v==='en cours'; };

  return (
    <>
      <Head>
        <title>My Favorites | MoroccoFan2030</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        body{font-family:'Cairo',sans-serif;background:#fafaf9}
        .serif{font-family:'Amiri',serif}
        .deco{font-family:'Aref Ruqaa',serif}
        .no-sb::-webkit-scrollbar{display:none}.no-sb{-ms-overflow-style:none;scrollbar-width:none}
        .bg-dots{background-color:#fafaf9;background-image:radial-gradient(#e7e5e4 1px,transparent 1px);background-size:24px 24px}

        @keyframes sL{from{opacity:0;transform:translateX(-50px)}to{opacity:1;transform:translateX(0)}}
        @keyframes sR{from{opacity:0;transform:translateX(50px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fU{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fl{0%,100%{transform:translateY(0) rotate(-14deg)}50%{transform:translateY(-20px) rotate(-14deg)}}
        @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        @keyframes cardOut{to{opacity:0;transform:scale(.9) translateY(10px)}}
        @keyframes pulse2{0%,100%{opacity:1}50%{opacity:.3}}

        .asl{animation:sL .65s ease-out forwards}
        .asr{animation:sR .65s ease-out forwards}
        .afu{animation:fU .5s ease-out forwards}
        .fl{animation:fl 9s ease-in-out infinite}
        .d1{animation-delay:.1s}.d2{animation-delay:.2s}.d3{animation-delay:.3s}

        .skeleton{background:linear-gradient(90deg,#e7e5e4 25%,#f5f5f4 50%,#e7e5e4 75%);background-size:600px 100%;animation:shimmer 1.4s infinite;border-radius:8px}
        .card-up{transition:transform .32s cubic-bezier(.4,0,.2,1),box-shadow .32s ease}
        .card-up:hover{transform:translateY(-5px) scale(1.012);box-shadow:0 18px 38px rgba(0,0,0,.09)}
        .removing{animation:cardOut .28s ease-out forwards}

        .tab-on{background:#C1272D;color:#fff;box-shadow:0 4px 14px rgba(193,39,45,.28)}

        .live-dot{width:7px;height:7px;border-radius:50%;background:#ef4444;display:inline-block;animation:pulse2 1.2s ease-in-out infinite}
        .match-dark{background:linear-gradient(135deg,#0d1117 0%,#161c24 55%,#0d1117 100%)}
        .match-pitch{background-image:url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='28' fill='none' stroke='%23fff' stroke-width='.8'/%3E%3Ccircle cx='40' cy='40' r='2.5' fill='%23fff'/%3E%3Cline x1='0' y1='40' x2='80' y2='40' stroke='%23fff' stroke-width='.4'/%3E%3C/svg%3E");background-size:160px 160px;background-position:center;opacity:.05}

        /* Team card dark */
        .team-dark{background:linear-gradient(150deg,#111418 0%,#1a2030 60%,#111418 100%)}
        .section-divider{display:flex;align-items:center;gap:16px;margin-bottom:24px}
        .section-divider::after{content:'';flex:1;height:1px;background:linear-gradient(to right,#e5e5e5,transparent)}
      `}</style>

      <Navbar />

      {/* ══ HERO ══ */}
      <header className="relative w-full pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/stade.jpg" alt="" className="absolute inset-0 w-full h-full object-cover"
            style={{filter:'brightness(0.25) saturate(0.6)',transform:'scale(1.06)'}}
            onError={e => { e.currentTarget.style.display='none'; }} />
          <div className="absolute inset-0 bg-gradient-to-br from-stone-950/92 via-[#1a0507]/65 to-stone-900/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/35" />
          <div className="fl absolute top-1/2 -left-20 w-[520px] h-px bg-gradient-to-r from-transparent via-[#C1272D]/35 to-transparent" />
          <div className="fl absolute top-1/3 right-10 w-[380px] h-px bg-gradient-to-l from-transparent via-amber-500/20 to-transparent" style={{animationDelay:'3s'}} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/75 text-xs font-bold uppercase tracking-widest mb-6 asl">
                <svg className="w-4 h-4 text-[#C1272D]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                My Collection
              </div>
              <h1 className="text-5xl md:text-7xl font-normal text-white mb-3 leading-tight asl d1">
                My <span className="serif italic text-[#C1272D]">Favorites</span>
              </h1>
              <p className="text-white/60 text-base asl d2">Your handpicked teams and matches — all in one place.</p>
            </div>
            <div className="flex gap-12 asr d3">
              {[
                { v: favorites.length, l: 'Total',   c: 'text-[#C1272D]'  },
                { v: teamFavs.length,  l: 'Teams',   c: 'text-amber-400'  },
                { v: matchFavs.length, l: 'Matches', c: 'text-emerald-400'},
              ].map(s => (
                <div key={s.l} className="text-center">
                  <div className={`text-5xl font-black tabular-nums ${s.c} mb-1`}>{s.v}</div>
                  <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ══ TABS ══ */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3.5">
          <div className="flex items-center gap-2.5 overflow-x-auto no-sb">
            {[
              { k:'all',   l:`All (${favorites.length})` },
              { k:'Team',  l:`Teams (${teamFavs.length})` },
              { k:'Match', l:`Matches (${matchFavs.length})` },
            ].map(t => (
              <button key={t.k} onClick={() => setActiveTab(t.k)}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all ${activeTab===t.k ? 'tab-on' : 'bg-stone-100 hover:bg-stone-200 text-stone-600'}`}>
                {t.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ MAIN ══ */}
      <main className="relative py-12 bg-dots min-h-screen overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="fl absolute top-40 -left-40 w-[500px] h-px bg-gradient-to-r from-transparent via-[#C1272D]/10 to-transparent" />
          <div className="fl absolute top-[600px] right-20 w-[400px] h-px bg-gradient-to-l from-transparent via-amber-400/10 to-transparent" style={{animationDelay:'4s'}} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(6)].map((_,i) => (
                <div key={i} className="bg-white rounded-2xl border border-stone-200 p-5 afu" style={{animationDelay:`${i*.05}s`}}>
                  <div className="skeleton w-full h-32 mb-4 rounded-xl" />
                  <div className="skeleton h-5 w-3/4 mb-2" /><div className="skeleton h-3 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && shownFavs.length === 0 && (
            <div className="text-center py-28 afu">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-stone-100">
                <svg className="w-12 h-12 text-stone-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>
              <h3 className="text-2xl font-bold text-stone-600 mb-2 serif">No favorites yet</h3>
              <p className="text-stone-400 mb-8 text-sm">Browse teams and matches, then tap the heart to save them here.</p>
              <button onClick={() => router.push('/Teams')}
                className="px-6 py-3 bg-[#C1272D] text-white rounded-xl text-sm font-semibold hover:bg-[#a01f24] transition-colors inline-flex items-center gap-2 shadow-lg shadow-red-500/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeWidth="2"/></svg>
                Browse Teams
              </button>
            </div>
          )}

          {/* Content */}
          {!loading && shownFavs.length > 0 && (
            <>
              {/* ─── TEAMS SECTION ─── */}
              {(activeTab === 'all' || activeTab === 'Team') && teamFavs.length > 0 && (
                <section className="mb-12">
                  {activeTab === 'all' && (
                    <div className="section-divider">
                      <h2 className="text-xl font-black text-stone-800 uppercase tracking-wider whitespace-nowrap flex items-center gap-2.5">
                       
                        Teams
                        <span className="text-sm font-bold text-stone-400">({teamFavs.length})</span>
                      </h2>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {teamFavs.map((fav, i) => {
                      const team = teamDetails[fav.ownerId];
                      const isRemoving = removingId === fav.id;
                      return (
                        <div key={fav.id}
                          className={`group relative rounded-2xl overflow-hidden card-up afu ${isRemoving ? 'removing' : ''}`}
                          style={{animationDelay:`${i*.05}s`}}>

                          {/* Dark bg with team image blur */}
                          <div className="absolute inset-0 team-dark" />
                          {team?.imageUrl && (
                            <div className="absolute inset-0 bg-cover bg-center opacity-[.12]"
                              style={{backgroundImage:`url(${team.imageUrl})`,filter:'blur(12px)',transform:'scale(1.1)'}} />
                          )}
                          {/* Moroccan flag stripe */}
                          <div className="absolute top-0 left-0 right-0 h-0.5 " />

                          {/* Remove */}
                          <button onClick={() => removeFavorite(fav)} disabled={isRemoving}
                            className="absolute top-3.5 right-3.5 z-20 w-7 h-7 rounded-full bg-white/10  flex items-center justify-center hover:bg-red-500/70 hover:border-red-400 transition-all disabled:opacity-50">
                            {isRemoving
                              ? <svg className="w-3.5 h-3.5 text-white/50 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                              : <svg className="w-3.5 h-3.5 text-white/50 hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                            }
                          </button>

                          <div className="relative z-10 cursor-pointer" onClick={() => router.push(`/Teams?id=${fav.ownerId}`)}>
                            {team ? (
                              <>
                                {/* Team logo + name */}
                                <div className="flex items-center gap-4 px-5 pt-6 pb-4">
                                  <div className="w-14 h-14 rounded-full bg-white/10 border-2  overflow-hidden flex items-center justify-center shadow-lg flex-shrink-0 group-hover:border-white/50 transition-all">
                                    {team.imageUrl
                                      ? <img src={team.imageUrl} alt={team.name} className="w-full h-full object-cover"
                                          onError={e => { e.target.style.display='none'; e.target.parentElement.innerHTML=`<span class="text-white font-black text-sm">${(team.name||'?').substring(0,2).toUpperCase()}</span>`; }} />
                                      : <span className="text-white font-black text-sm">{(team.name||'?').substring(0,2).toUpperCase()}</span>
                                    }
                                  </div>
                                  <div>
                                    <h3 className="text-white font-black text-base leading-tight group-hover:text-[#C1272D] transition-colors serif italic">{team.name}</h3>
                                    {team.country && <p className="text-white/40 text-[10px] uppercase tracking-widest mt-0.5">{team.country}</p>}
                                  </div>
                                </div>

                                {/* Coach */}
                                {team.coach && (
                                  <div className="px-5 pb-4">
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/8">
                                      <svg className="w-3.5 h-3.5 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeWidth="2"/><circle cx="12" cy="7" r="4" strokeWidth="2"/></svg>
                                      <span className="text-white/50 text-[10px]">Coach</span>
                                      <span className="text-white/80 text-xs font-semibold truncate">{team.coach}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between px-5 py-3 border-t border-white/[.07]">
                                  <span className="text-[10px] text-white/25 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeWidth="2"/></svg>
                                    {formatDate(fav.dateOfAdd)}
                                  </span>
                                  <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:bg-[#C1272D] group-hover:border-[#C1272D] group-hover:text-white transition-all">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="p-5">
                                <div className="flex items-center gap-4 mb-3">
                                  <div className="skeleton w-14 h-14 rounded-full opacity-20" />
                                  <div className="flex-1"><div className="skeleton h-5 w-3/4 opacity-20 mb-2" /><div className="skeleton h-3 w-1/2 opacity-20" /></div>
                                </div>
                                <div className="skeleton h-9 w-full opacity-10 rounded-xl" />
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
                    <div className="section-divider">
                      <h2 className="text-xl font-black text-stone-800 uppercase tracking-wider whitespace-nowrap flex items-center gap-2.5">
                        
                        Matches
                        <span className="text-sm font-bold text-stone-400">({matchFavs.length})</span>
                      </h2>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {matchFavs.map((fav, i) => {
                      const match = matchDetails[fav.ownerId];
                      const isRemoving = removingId === fav.id;
                      const done = match ? isDone(match.statut) : false;
                      const live = match ? isLiveS(match.statut) : false;
                      const home = match?.matchTeams?.[0];
                      const away = match?.matchTeams?.[1];

                      return (
                        <div key={fav.id}
                          className={`group relative rounded-2xl overflow-hidden card-up afu ${isRemoving ? 'removing' : ''}`}
                          style={{animationDelay:`${i*.05}s`}}>
                          <div className="absolute inset-0 match-dark" />
                          <div className="absolute inset-0 match-pitch" />
                          {live && <div className="absolute inset-0 bg-red-900/10 animate-pulse" />}

                          {/* Remove */}
                          <button onClick={() => removeFavorite(fav)} disabled={isRemoving}
                            className="absolute top-3.5 right-3.5 z-20 w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-red-500/70 hover:border-red-400 transition-all disabled:opacity-50">
                            {isRemoving
                              ? <svg className="w-3.5 h-3.5 text-white/50 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                              : <svg className="w-3.5 h-3.5 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                            }
                          </button>

                          <div className="relative z-10 cursor-pointer" onClick={() => router.push(`/match/${fav.ownerId}`)}>
                            {match ? (
                              <>
                                {/* Top */}
                                <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[.06]">
                                  <div className="flex items-center gap-2">
                                    {live && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-red-500 text-white"><span className="live-dot" />LIVE</span>}
                                    {done && <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-white/10 text-white/60 border border-white/10">FT</span>}
                                    {!live && !done && <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Upcoming</span>}
                                    <span className="text-[10px] text-white/30 font-medium uppercase">{match.type}</span>
                                  </div>
                                  <span className="text-[10px] text-white/25">{formatDate(match.dateOfMatch)}</span>
                                </div>

                                {/* Teams + Score */}
                                <div className="flex items-center justify-between px-5 py-6 gap-3">
                                  <div className="flex-1 flex flex-col items-center gap-2.5">
                                    <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 overflow-hidden flex items-center justify-center shadow-xl shadow-black/50 group-hover:border-white/40 transition-all">
                                      {home?.imageUrl
                                        ? <img src={home.imageUrl} alt={home.teamName} className="w-full h-full object-cover" />
                                        : <span className="text-white/70 font-black text-xs">{(home?.teamName||'TBD').substring(0,3).toUpperCase()}</span>
                                      }
                                    </div>
                                    <span className="text-white font-bold text-xs text-center leading-tight">{home?.teamName||'TBD'}</span>
                                  </div>

                                  <div className="flex flex-col items-center gap-1 min-w-[72px]">
                                    {(done||live) ? (
                                      <>
                                        <div className="flex items-center gap-2">
                                          <span className="text-3xl font-black text-white tabular-nums">{home?.goals??0}</span>
                                          <span className="text-white/20 text-lg font-thin">–</span>
                                          <span className="text-3xl font-black text-white tabular-nums">{away?.goals??0}</span>
                                        </div>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">{done ? 'Full Time' : 'Live'}</span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-xl font-thin text-white/15 tracking-[.2em]">VS</span>
                                        <span className="text-xs font-bold text-white/40">{formatTime(match.dateOfMatch)}</span>
                                      </>
                                    )}
                                  </div>

                                  <div className="flex-1 flex flex-col items-center gap-2.5">
                                    <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 overflow-hidden flex items-center justify-center shadow-xl shadow-black/50 group-hover:border-white/40 transition-all">
                                      {away?.imageUrl
                                        ? <img src={away.imageUrl} alt={away.teamName} className="w-full h-full object-cover" />
                                        : <span className="text-white/70 font-black text-xs">{(away?.teamName||'TBD').substring(0,3).toUpperCase()}</span>
                                      }
                                    </div>
                                    <span className="text-white font-bold text-xs text-center leading-tight">{away?.teamName||'TBD'}</span>
                                  </div>
                                </div>

                                {/* Bottom */}
                                <div className="flex items-center justify-between px-5 py-3 border-t border-white/[.06]">
                                  <div className="flex items-center gap-3 text-[10px] text-white/25">
                                    {match.stadeName && (
                                      <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeWidth="2"/><circle cx="12" cy="10" r="3" strokeWidth="2"/></svg>
                                        {match.stadeName}
                                      </span>
                                    )}
                                    {match.referee && <span>Ref: {match.referee}</span>}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-white/15">{formatDate(fav.dateOfAdd)}</span>
                                    <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:bg-white group-hover:border-white group-hover:text-stone-900 transition-all">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="p-5">
                                <div className="flex items-center justify-between gap-4 mb-4">
                                  <div className="skeleton w-14 h-14 rounded-full opacity-15" />
                                  <div className="flex flex-col gap-2 items-center flex-1"><div className="skeleton h-8 w-20 opacity-15 mx-auto" /><div className="skeleton h-3 w-14 opacity-15 mx-auto" /></div>
                                  <div className="skeleton w-14 h-14 rounded-full opacity-15" />
                                </div>
                                <div className="skeleton h-3 w-full opacity-10 rounded" />
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
      </main>
      <Footer />
    </>
  );
}