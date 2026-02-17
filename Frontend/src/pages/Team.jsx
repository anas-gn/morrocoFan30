import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

const BASE = 'http://localhost:3309/api';

export default function TeamDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [team, setTeam]         = useState(null);
  const [players, setPlayers]   = useState([]);
  const [news, setNews]         = useState([]);
  const [cultures, setCultures] = useState([]);
  const [matches, setMatches]   = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading]   = useState(true);
  // debug: raw statuts to understand backend values
  const [rawStatuts, setRawStatuts] = useState([]);

  useEffect(() => {
    if (!id) return;
    const get = url => fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });

    Promise.all([
      get(`${BASE}/teams/teams/${id}`),
      get(`${BASE}/teams/teams/plyers/${id}`).catch(() => []),
      get(`${BASE}/teams/teams/news/${id}`).catch(() => []),
      get(`${BASE}/teams/teams/contenuCultirel/${id}`).catch(() => []),
    ])
      .then(([teamData, pData, nData, cData]) => {
        setTeam(teamData);
        setPlayers(Array.isArray(pData) ? pData : []);
        setNews(Array.isArray(nData) ? nData : []);
        setCultures(Array.isArray(cData) ? cData : []);
        return get(`${BASE}/matches/matches/byTeam/${encodeURIComponent(teamData.name)}`).catch(() => []);
      })
      .then(mData => {
        const arr = Array.isArray(mData) ? mData : [];
        setMatches(arr);
        // collect unique statuts for debugging
        setRawStatuts([...new Set(arr.map(m => m.statut))]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // ─── Helpers ────────────────────────────────────────────
  // Accepte TOUTES les valeurs possibles du backend
  const isDone = s => {
    const v = (s || '').toLowerCase().trim();
    return (
      v.includes('termin') ||   // "termine", "terminé", "Terminé"
      v.includes('finish') ||   // "Finished", "finished"
      v === 'done'           ||
      v === 'completed'      ||
      v === 'ended'
    );
  };

  const isLive = s => {
    const v = (s || '').toLowerCase().trim();
    return v === 'live' || v === 'commence' || v === 'started' || v === 'en cours';
  };

  // ─── Stats ──────────────────────────────────────────────
  const teamId = parseInt(id);

  const teamStats = (() => {
    let wins = 0, draws = 0, losses = 0, gf = 0, ga = 0;
    matches.forEach(m => {
      if (!isDone(m.statut)) return;
      // teamId comparison: backend sends integer, id from URL is string
      const my = m.matchTeams?.find(mt => Number(mt.teamId) === teamId);
      const op = m.matchTeams?.find(mt => Number(mt.teamId) !== teamId);
      if (!my || !op) return;
      const mg = Number(my.goals) || 0;
      const og = Number(op.goals) || 0;
      gf += mg; ga += og;
      if (mg > og)      wins++;
      else if (mg === og) draws++;
      else               losses++;
    });
    return { wins, draws, losses, gf, ga };
  })();

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'players',  label: 'Squad'    },
    { id: 'matches',  label: 'Fixtures' },
    { id: 'news',     label: 'News'     },
    { id: 'culture',  label: 'Culture'  },
  ];

  // ── Loading ─────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
      <img src="/images/logo.png" alt="Loading" className="w-20 h-20 mb-4 animate-pulse" />
    </div>
  );

  if (!team) return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
        <p className="text-xl text-stone-600 mb-6">Team not found</p>
        <button onClick={() => router.push('/teams')} className="px-6 py-3 bg-[#C1272D] text-white rounded-xl font-medium">
          Back to Teams
        </button>
      </div>
    </>
  );

  const isHost = ['Morocco', 'Portugal', 'Spain'].includes(team.country);

  return (
    <>
      <Head>
        <title>{team.name} | MoroccoFan2030</title>
        <meta name="description" content={team.description} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      {/* ── EXACT SAME STYLES AS Teams.jsx ─────────────────── */}
      <style jsx global>{`
        .bg-pattern { background-color:#fafaf9; background-image:radial-gradient(#e7e5e4 1px,transparent 1px); background-size:24px 24px; }
        .no-scrollbar::-webkit-scrollbar{display:none} .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        .glass{background:rgba(255,255,255,0.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,0,0,0.05)}
        body{font-family:'Cairo',sans-serif}
        h1,h2,h3,h4,.serif-font{font-family:'Amiri',serif}
        .decorative-font{font-family:'Aref Ruqaa',serif}
        @keyframes scaleIn{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}
        .group:hover .animate-scale{animation:scaleIn 0.6s ease-in-out}
        @keyframes floatLine1{0%,100%{transform:translateY(0) rotate(-15deg)}50%{transform:translateY(-30px) rotate(-15deg)}}
        @keyframes floatLine2{0%,100%{transform:translateY(0) rotate(25deg)}50%{transform:translateY(20px) rotate(25deg)}}
        @keyframes floatLine3{0%,100%{transform:translateY(0) rotate(-35deg)}50%{transform:translateY(-20px) rotate(-35deg)}}
        @keyframes slideInLeft{from{opacity:0;transform:translateX(-100px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(100px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        .animate-slide-in-left{animation:slideInLeft 0.8s ease-out forwards}
        .animate-slide-in-right{animation:slideInRight 0.8s ease-out forwards}
        .animate-fade-in-up{animation:fadeInUp 0.6s ease-out forwards}
        .delay-100{animation-delay:0.1s}.delay-200{animation-delay:0.2s}.delay-300{animation-delay:0.3s}.delay-400{animation-delay:0.4s}
        .decorative-line-red{animation:floatLine1 8s ease-in-out infinite}
        .decorative-line-yellow{animation:floatLine2 10s ease-in-out infinite}
        .decorative-line-green{animation:floatLine3 12s ease-in-out infinite}
        .card-hover{transition:all 0.4s cubic-bezier(0.4,0,0.2,1)}
        .card-hover:hover{transform:translateY(-8px) scale(1.02)}
      `}</style>

      <Navbar />

      {/* ══════════════════════════════════════════════════════
          HEADER — team.imageUrl en background floutée
      ══════════════════════════════════════════════════════ */}
      <header className="relative w-full pt-32 pb-16 overflow-hidden border-b border-stone-200">
        {/* Background = team.imageUrl floutée + overlay — identique à Teams.jsx */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${team.imageUrl})`,
              filter: 'blur(8px) brightness(0.45)',
              transform: 'scale(1.06)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/60" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Back */}
          <button onClick={() => router.push('/teams')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-6 shadow-lg animate-slide-in-left hover:bg-white/20 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            All Teams
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            {/* Left */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-stone-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-lg animate-slide-in-left">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeWidth="2"/>
                </svg>
                {team.country}
              </div>

              <div className="flex items-center gap-5 mb-4 animate-slide-in-left delay-100">
                {/* Logo — même cercle que Teams cards */}
                <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white flex-shrink-0">
                  <img src={team.imageUrl} alt={team.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = `https://via.placeholder.com/80/C1272D/FFFFFF?text=${team.name?.substring(0,2)}`; }} />
                </div>
                <h1 className="text-5xl md:text-7xl font-normal tracking-tight text-white leading-tight">
                  <span className="serif-font italic text-[#C1272D] font-medium">{team.name}</span>
                </h1>
              </div>

              <p className="text-white/90 text-base md:text-lg leading-relaxed animate-slide-in-left delay-200 mb-4">
                {team.description}
              </p>

              <div className="flex flex-wrap gap-2 animate-slide-in-left delay-300">
                {isHost && (
                  <span className="px-3 py-1 bg-[#C1272D]/20 border border-[#C1272D]/40 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                    Host Nation
                  </span>
                )}
                {team.participation > 0 && (
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-amber-200">
                    {team.participation}× World Cup
                  </span>
                )}
                {team.coach && (
                  <span className="px-3 py-1 bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                    Coach: {team.coach}
                  </span>
                )}
              </div>
            </div>

            {/* Right — même grands chiffres que Teams.jsx */}
            <div className="flex gap-12 animate-slide-in-right delay-300">
              <div className="text-center">
                <div className="text-5xl font-bold text-[#C1272D] mb-1">{teamStats.wins}</div>
                <div className="text-xs font-bold text-white uppercase tracking-widest">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-amber-500 mb-1">{teamStats.draws}</div>
                <div className="text-xs font-bold text-white uppercase tracking-widest">Draws</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-emerald-500 mb-1">{matches.length}</div>
                <div className="text-xs font-bold text-white uppercase tracking-widest">Matches</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          STICKY TAB BAR — même que filter bar de Teams.jsx
      ══════════════════════════════════════════════════════ */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-2 w-full overflow-x-auto no-scrollbar pb-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#C1272D] text-white shadow-md shadow-red-500/20 scale-105'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN — même bg + lignes décoratives que Teams.jsx
      ══════════════════════════════════════════════════════ */}
      <main className="relative py-12 bg-stone-50 min-h-screen overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="decorative-line-red    absolute top-40 -left-40 w-[500px] h-0.5 bg-gradient-to-r from-transparent via-[#C1272D]/20 to-transparent" />
          <div className="decorative-line-red    absolute top-[600px] right-20 w-[400px] h-0.5 bg-gradient-to-l from-transparent via-[#C1272D]/15 to-transparent" style={{animationDelay:'2s'}} />
          <div className="decorative-line-yellow absolute top-[300px] right-10 w-[450px] h-0.5 bg-gradient-to-r from-amber-400/20 to-transparent" />
          <div className="decorative-line-yellow absolute top-[800px] left-10 w-[380px] h-0.5 bg-gradient-to-r from-transparent via-amber-500/15 to-transparent" style={{animationDelay:'3s'}} />
          <div className="decorative-line-green  absolute top-[200px] left-32 w-[420px] h-0.5 bg-gradient-to-r from-[#006233]/20 via-transparent to-transparent" />
          <div className="decorative-line-green  absolute top-[900px] right-32 w-[480px] h-0.5 bg-gradient-to-l from-transparent via-[#006233]/15 to-transparent" style={{animationDelay:'1s'}} />
          <div className="decorative-line-red    absolute top-[1100px] left-20 w-[350px] h-0.5 bg-gradient-to-r from-[#C1272D]/15 to-transparent" style={{animationDelay:'4s'}} />
          <div className="decorative-line-yellow absolute top-[1300px] right-40 w-[400px] h-0.5 bg-gradient-to-l from-amber-400/15 to-transparent" style={{animationDelay:'5s'}} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">

          {/* ── OVERVIEW ──────────────────────────────────── */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-6 mb-8">
                {[
                  { label:'Goals Scored',    value: teamStats.gf,    accent:'border-[#C1272D]/20', color:'text-[#C1272D]'  },
                  { label:'Goals Conceded',  value: teamStats.ga,    accent:'border-stone-200',    color:'text-stone-600'  },
                  { label:'Goal Difference', value:`${teamStats.gf-teamStats.ga>=0?'+':''}${teamStats.gf-teamStats.ga}`, accent:'border-amber-200', color:'text-amber-600' },
                  { label:'Players',         value: players.length,  accent:'border-emerald-200',  color:'text-[#006233]'  },
                ].map((s,i) => (
                  <div key={s.label}
                    className={`group bg-white rounded-2xl border ${s.accent} p-6 relative overflow-hidden hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300 card-hover animate-fade-in-up`}
                    style={{animationDelay:`${i*0.05}s`}}>
                    <div className={`text-4xl font-bold ${s.color} mb-2`}>{s.value}</div>
                    <div className="text-xs font-medium text-stone-400 uppercase tracking-widest">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Squad preview */}
              {players.length > 0 && (
                <>
                  <div className="flex justify-between items-center mb-6 animate-fade-in-up delay-200">
                    <h2 className="text-2xl font-bold text-stone-900 serif-font">Squad Preview</h2>
                    <button onClick={() => setActiveTab('players')}
                      className="px-4 py-2 rounded-lg text-xs font-semibold tracking-wide bg-stone-100 hover:bg-stone-200 text-stone-600 transition-all flex items-center gap-2">
                      View Full Squad
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-6">
                    {players.slice(0, 4).map((p, i) => (
                      <PlayerCard key={p.id} player={p} index={i} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── PLAYERS ───────────────────────────────────── */}
          {activeTab === 'players' && (
            <>
              <div className="flex justify-between items-center mb-6 animate-fade-in-up">
                <h2 className="text-3xl font-bold text-stone-900 serif-font">Team Squad</h2>
                <span className="text-sm text-stone-400">{players.length} players</span>
              </div>
              {players.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-6">
                  {players.map((p, i) => <PlayerCard key={p.id} player={p} index={i} />)}
                </div>
              ) : <EmptyState />}
            </>
          )}

          {/* ── MATCHES ───────────────────────────────────── */}
          {activeTab === 'matches' && (
            <>
              <div className="flex justify-between items-center mb-6 animate-fade-in-up">
                <h2 className="text-3xl font-bold text-stone-900 serif-font">Fixtures & Results</h2>
                <span className="text-sm text-stone-400">{matches.length} matches</span>
              </div>
              {matches.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-6">
                  {matches.map((m, i) => {
                    const my = m.matchTeams?.find(mt => Number(mt.teamId) === teamId);
                    const op = m.matchTeams?.find(mt => Number(mt.teamId) !== teamId);
                    const done = isDone(m.statut);
                    const live = isLive(m.statut);
                    const mg = Number(my?.goals) || 0;
                    const og = Number(op?.goals) || 0;
                    const isWin  = done && mg > og;
                    const isDraw = done && mg === og;
                    const isLoss = done && mg < og;

                    return (
                      <div key={m.id}
                        onClick={() => router.push(`/matches/${m.id}`)}
                        className="group bg-white rounded-2xl border border-stone-200 p-6 relative overflow-hidden hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300 cursor-pointer card-hover animate-fade-in-up"
                        style={{animationDelay:`${i*0.05}s`}}>

                        {/* Badge résultat — même style top-4 right-4 que Teams */}
                        {done && (
                          <div className={`absolute top-4 right-4 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border
                            ${isWin  ? 'bg-[#006233]/10 text-[#006233] border-[#006233]/20'
                             : isDraw ? 'bg-amber-50 text-amber-700 border-amber-200'
                             : 'bg-[#C1272D]/10 text-[#C1272D] border-[#C1272D]/20'}`}>
                            {isWin ? 'Win' : isDraw ? 'Draw' : 'Loss'}
                          </div>
                        )}
                        {live && (
                          <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" /> Live
                          </div>
                        )}
                        {/* Badge type — left-4 */}
                        <div className="absolute top-4 left-4 px-2 py-1 bg-stone-50 text-stone-500 text-[10px] font-bold uppercase tracking-wider rounded border border-stone-200 max-w-[100px] truncate">
                          {m.type}
                        </div>

                        {/* Logos + score centré — même layout que Teams card */}
                        <div className="flex flex-col items-center text-center mt-10 mb-4">
                          <div className="flex items-center gap-3 mb-3">
                            {/* Mon équipe */}
                            <div className="w-12 h-12 rounded-full border-4 border-white shadow-lg overflow-hidden bg-stone-100 flex-shrink-0">
                              <img src={team.imageUrl} alt={team.name}
                                className="w-full h-full object-contain"
                                onError={e => { e.target.src=`https://via.placeholder.com/48/C1272D/FFF?text=${team.name?.substring(0,2)}`; }} />
                            </div>

                            {/* Score — affiché seulement si match terminé */}
                            <div className="flex items-center gap-1 min-w-[80px] justify-center">
                              {done ? (
                                <>
                                  <span className={`text-2xl font-black ${isWin ? 'text-[#006233]' : isLoss ? 'text-[#C1272D]' : 'text-stone-700'}`}>
                                    {mg}
                                  </span>
                                  <span className="text-stone-300 text-xl font-light mx-1">–</span>
                                  <span className={`text-2xl font-black ${isLoss ? 'text-[#006233]' : isWin ? 'text-[#C1272D]' : 'text-stone-700'}`}>
                                    {og}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm font-bold text-stone-300 uppercase tracking-widest">vs</span>
                              )}
                            </div>

                            {/* Adversaire */}
                            <div className="w-12 h-12 rounded-full border-4 border-white shadow-lg overflow-hidden bg-stone-100 flex-shrink-0 flex items-center justify-center">
                              {op?.imageUrl
                                ? <img src={op.imageUrl} alt={op.teamName} className="w-full h-full object-contain" />
                                : <span className="text-stone-400 text-xs font-bold">{op?.teamName?.substring(0,2) || '?'}</span>}
                            </div>
                          </div>

                          <h3 className="text-base font-serif text-stone-900 mb-1">{op?.teamName ?? 'TBD'}</h3>
                          <div className="text-xs font-medium text-stone-400 uppercase tracking-widest">
                            {new Date(m.dateOfMatch).toLocaleDateString()}
                            {m.stadeName ? ` • ${m.stadeName}` : ''}
                          </div>
                        </div>

                        {/* Footer — même chevron rouge que Teams */}
                        <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                          <div className="text-xs text-stone-500 flex-1 truncate">
                            <span className="text-stone-400">Referee:</span>{' '}
                            <span className="font-medium text-stone-700">{m.referee || '—'}</span>
                          </div>
                          <div className="ml-auto w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:bg-[#C1272D] group-hover:border-[#C1272D] group-hover:text-white transition-all flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <EmptyState />}
            </>
          )}

          {/* ── NEWS — navigation onClick vers /news/[id] ──── */}
          {activeTab === 'news' && (
            <>
              <div className="flex justify-between items-center mb-6 animate-fade-in-up">
                <h2 className="text-3xl font-bold text-stone-900 serif-font">Latest News</h2>
                <span className="text-sm text-stone-400">{news.length} articles</span>
              </div>
              {news.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-6">
                  {news.map((a, i) => (
                    <div key={a.id}
                      onClick={() => router.push(`/news/${a.id}`)}
                      className="group bg-white rounded-2xl border border-stone-200 p-6 relative overflow-hidden hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300 cursor-pointer card-hover animate-fade-in-up"
                      style={{animationDelay:`${i*0.05}s`}}>

                      <div className="absolute top-4 right-4 px-2 py-1 bg-[#C1272D]/10 text-[#C1272D] text-[10px] font-bold uppercase tracking-wider rounded border border-[#C1272D]/20">
                        News
                      </div>

                      <div className="relative h-36 -mx-6 -mt-6 mb-4 overflow-hidden bg-stone-100">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10" />
                        <img src={a.imageUrl} alt={a.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={e => { e.target.src='https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&q=70'; }} />
                      </div>

                      <div className="flex flex-col items-center text-center mb-4">
                        <h3 className="text-base font-serif text-stone-900 mb-1 group-hover:text-[#C1272D] transition-colors line-clamp-2">{a.title}</h3>
                        <div className="text-xs font-medium text-stone-400 uppercase tracking-widest">
                          {new Date(a.dateOfCreation).toLocaleDateString()}
                          {a.author ? ` • ${a.author}` : ''}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                        <div className="text-xs text-stone-500 flex-1 truncate line-clamp-1">{a.description}</div>
                        <div className="ml-auto w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:bg-[#C1272D] group-hover:border-[#C1272D] group-hover:text-white transition-all flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <EmptyState />}
            </>
          )}

          {/* ── CULTURE — navigation onClick vers /culture/[id] ── */}
          {activeTab === 'culture' && (
            <>
              <div className="flex justify-between items-center mb-6 animate-fade-in-up">
                <h2 className="text-3xl font-bold text-stone-900 serif-font">Cultural Heritage</h2>
                <span className="text-sm text-stone-400">{cultures.length} highlights</span>
              </div>
              {cultures.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-6">
                  {cultures.map((c, i) => (
                    <div key={c.id}
                      onClick={() => router.push(`/culture/${c.id}`)}
                      className="group bg-white rounded-2xl border border-stone-200 p-6 relative overflow-hidden hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300 cursor-pointer card-hover animate-fade-in-up"
                      style={{animationDelay:`${i*0.05}s`}}>

                      <div className="absolute top-4 right-4 px-2 py-1 bg-[#006233]/10 text-[#006233] text-[10px] font-bold uppercase tracking-wider rounded border border-[#006233]/20">
                        Culture
                      </div>

                      <div className="relative h-36 -mx-6 -mt-6 mb-4 overflow-hidden bg-stone-100">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10" />
                        <img src={c.imageUrl} alt={c.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={e => { e.target.src='https://images.unsplash.com/photo-1535069502363-2207185df19f?w=400&q=70'; }} />
                      </div>

                      <div className="flex flex-col items-center text-center mb-4">
                        <h3 className="text-base font-serif text-stone-900 mb-1 group-hover:text-[#006233] transition-colors decorative-font">{c.title}</h3>
                        <div className="text-xs font-medium text-stone-400 uppercase tracking-widest">
                          {new Date(c.dateOfCreation).toLocaleDateString()}
                          {c.author ? ` • ${c.author}` : ''}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                        <div className="text-xs text-stone-500 flex-1 truncate line-clamp-1">{c.description}</div>
                        <div className="ml-auto w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:bg-[#006233] group-hover:border-[#006233] group-hover:text-white transition-all flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <EmptyState />}
            </>
          )}

          {/* ── DEBUG PANEL (retirer en prod) ─────────────── */}
         
        </div>
      </main>

      <Footer />
    </>
  );
}

/* ── Player card — même structure que Teams card ─────────── */
function PlayerCard({ player, index }) {
  return (
    <div className="group bg-white rounded-2xl border border-stone-200 p-6 relative overflow-hidden hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300 cursor-default card-hover animate-fade-in-up"
      style={{animationDelay:`${index*0.05}s`}}>
      {player.goals > 0 && (
        <div className="absolute top-4 right-4 px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded border border-amber-200">
          {player.goals}G
        </div>
      )}
      <div className="flex flex-col items-center text-center mt-4 mb-6">
        <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg mb-4 overflow-hidden bg-stone-100 animate-scale transition-transform duration-500">
          <img src={player.urlImage || player.imgUrl} alt={player.name}
            className="w-full h-full object-cover"
            onError={e => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-200 to-stone-300 text-stone-600 text-xl font-bold">${player.name?.substring(0,2)}</div>`;
            }} />
        </div>
        <h3 className="text-xl font-serif text-stone-900 mb-1 group-hover:text-[#C1272D] transition-colors">{player.name}</h3>
        <div className="text-xs font-medium text-stone-400 uppercase tracking-widest">
          Age {player.age || '—'} • {player.height ? `${player.height}m` : '—'}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-stone-100 pt-4">
        <div className="text-xs text-stone-500 flex-1 truncate">
          <span className="text-stone-400">Weight:</span>{' '}
          <span className="font-medium text-stone-700">{player.weight ? `${player.weight}kg` : '—'}</span>
        </div>
        <div className="ml-auto w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:bg-[#C1272D] group-hover:border-[#C1272D] group-hover:text-white transition-all flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ── Empty state — même que Teams "no teams found" ─────── */
function EmptyState() {
  return (
    <div className="text-center py-20 animate-fade-in-up">
      <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" strokeWidth="2"/>
          <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
          <line x1="11" y1="8" x2="11" y2="14" strokeWidth="2" strokeLinecap="round"/>
          <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <h3 className="text-xl font-medium text-stone-700 mb-2">No content found</h3>
      <p className="text-stone-500">Try checking back later</p>
    </div>
  );
}