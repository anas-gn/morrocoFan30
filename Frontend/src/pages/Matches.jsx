import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Matches() {
  const [matches, setMatches]               = useState([]);
  const [venues, setVenues]                 = useState([]);
  const [teams, setTeams]                   = useState([]);
  const [selectedVenue, setSelectedVenue]   = useState('all');
  const [selectedTeam, setSelectedTeam]     = useState('all');
  const [selectedStage, setSelectedStage]   = useState('all');
  const [selectedDate, setSelectedDate]     = useState(null);
  const [viewMode, setViewMode]             = useState('grid');
  const [loading, setLoading]               = useState(true);
  const [filteredMatches, setFilteredMatches] = useState([]);

  const stats = { totalTeams: 48, totalVenues: 6 };

  useEffect(() => {
    fetch('https://anas-gana1-fandb-backend.hf.space/api/matches/matches/allTriee')
      .then(r => r.json())
      .then(d => { setMatches(d); setFilteredMatches(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch('https://anas-gana1-fandb-backend.hf.space/api/acceuil/stade/all').then(r => r.json()).then(setVenues).catch(() => {});
  }, []);

  useEffect(() => {
    fetch('https://anas-gana1-fandb-backend.hf.space/api/acceuil/teams/some').then(r => r.json()).then(setTeams).catch(() => {});
  }, []);

  useEffect(() => {
    let f = [...matches];
    if (selectedVenue !== 'all') f = f.filter(m => m.stadeId === parseInt(selectedVenue));
    if (selectedTeam  !== 'all') f = f.filter(m => m.matchTeams?.some(mt => mt.teamId === parseInt(selectedTeam)));
    if (selectedStage !== 'all') f = f.filter(m => m.type === selectedStage);
    if (selectedDate)             f = f.filter(m => new Date(m.dateOfMatch).toLocaleDateString() === selectedDate);
    setFilteredMatches(f);
  }, [selectedVenue, selectedTeam, selectedStage, selectedDate, matches]);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); return d;
  });

  const matchesByDate = filteredMatches.reduce((acc, m) => {
    const k = new Date(m.dateOfMatch).toLocaleDateString();
    if (!acc[k]) acc[k] = [];
    acc[k].push(m);
    return acc;
  }, {});

  const getStatus = (s) => {
    const live = ['DIRECT','meta 2','fin meta 1','started','commence'];
    const done = ['termine','Finished'];
    if (live.includes(s)) return { label: 'LIVE',      cls: 'pill-live',     pulse: true  };
    if (done.includes(s)) return { label: 'FT',        cls: 'pill-done',     pulse: false };
    if (s === 'upcoming') return { label: 'Upcoming',  cls: 'pill-upcoming', pulse: false };
    return                       { label: 'Scheduled', cls: 'pill-default',  pulse: false };
  };

  const hasFilters = selectedVenue !== 'all' || selectedTeam !== 'all' || selectedStage !== 'all' || selectedDate;
  const resetFilters = () => { setSelectedVenue('all'); setSelectedTeam('all'); setSelectedStage('all'); setSelectedDate(null); };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div style={{ width: 48, height: 48, border: '3px solid #C1272D', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
    </div>
  );

  return (
    <>
      <Head>
        <title>Tournament Fixtures | MoroccoFan2030</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=Cairo:wght@400;600;700&family=Amiri:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
         <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        /* ── Reset & Fonts ── */
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #fff; color: #1c1917; }
        .syne { font-family: 'Syne', sans-serif; }
        .serif { font-family: 'Amiri', serif; }

        /* ── Keyframes ── */
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes pglow    { 0%,100%{box-shadow:0 0 0 0 rgba(193,39,45,.5)} 50%{box-shadow:0 0 0 8px rgba(193,39,45,0)} }

        /* ── Animation helpers ── */
        .fu  { animation: fadeUp .5s ease-out forwards; opacity: 0; }
        .fi  { animation: fadeIn .4s ease-out forwards; opacity: 0; }
        .d1  { animation-delay: .08s; }
        .d2  { animation-delay: .16s; }
        .d3  { animation-delay: .24s; }
        .d4  { animation-delay: .32s; }

        /* ── Pills (inspired by td-pill) ── */
        .pill { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;border:1px solid; }
        .pill-live    { background:rgba(239,68,68,.1);   color:#dc2626; border-color:rgba(239,68,68,.3);   }
        .pill-done    { background:rgba(120,113,108,.1); color:#78716c; border-color:rgba(120,113,108,.3); }
        .pill-upcoming{ background:rgba(0,98,51,.1);     color:#006233; border-color:rgba(0,98,51,.3);     }
        .pill-default { background:rgba(0,0,0,.04);      color:#a8a29e; border-color:rgba(0,0,0,.08);      }
        .pill-host    { background:rgba(193,39,45,.08);  color:#C1272D; border-color:rgba(193,39,45,.25);  }
        .pill-gold    { background:rgba(240,165,0,.1);   color:#b45309; border-color:rgba(240,165,0,.3);   }
        .live-dot     { width:6px;height:6px;border-radius:50%;background:#dc2626;display:inline-block;animation:blink 1.2s ease-in-out infinite; }
        .pulse-glow   { animation: pglow 2s infinite; }

        /* ── No scrollbar ── */
        .nosb::-webkit-scrollbar { display:none; }
        .nosb { -ms-overflow-style:none; scrollbar-width:none; }

        /* ── Filter btn active ── */
        .filter-active { background:linear-gradient(to right,#2d0a0e,#1a0608)!important; color:#fff!important; border-color:transparent!important; }

        /* ── Stat card ── */
        .stat-card { background:#fff; border:1px solid #e7e5e4; border-radius:16px; padding:20px 16px; text-align:center; transition:border-color .2s, box-shadow .2s; }
        .stat-card:hover { border-color:#C1272D; box-shadow:0 4px 20px rgba(193,39,45,.08); }
        .stat-val { font-size:36px; font-weight:800; line-height:1; font-family:'Syne',sans-serif; }
        .stat-lbl { font-size:11px; color:#a8a29e; text-transform:uppercase; letter-spacing:.08em; margin-top:6px; font-weight:500; }

        /* ── Match card ── */
        .match-card { background:#fff; border:1px solid #e7e5e4; border-radius:16px; overflow:hidden; transition:border-color .2s, transform .2s, box-shadow .2s; border-left:3px solid transparent; }
        .match-card:hover { border-color:#C1272D; border-left-color:#C1272D; transform:translateY(-3px); box-shadow:0 12px 32px rgba(193,39,45,.1); }

        /* ── Calendar card ── */
        .cal-card { background:#fff; border:1px solid #e7e5e4; border-radius:14px; overflow:hidden; transition:border-color .2s, transform .2s, box-shadow .2s; }
        .cal-card:hover { border-color:#C1272D; transform:translateY(-2px); box-shadow:0 8px 24px rgba(193,39,45,.08); }

        /* ── Perf bar (inspired by td-perf) ── */
        .perf-track { flex:1; height:7px; background:#f5f5f4; border-radius:99px; overflow:hidden; }
        .perf-fill  { height:100%; border-radius:99px; transition:width 1.2s cubic-bezier(.4,0,.2,1); }

        /* ── Section title ── */
        .sec-title { font-size:20px; font-weight:700; font-family:'Syne',sans-serif; color:#1c1917; display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
        .sec-count { font-size:13px; color:#a8a29e; font-weight:400; font-family:'Inter',sans-serif; }

        /* ── Date badge ── */
        .date-hdr { display:inline-flex; align-items:center; gap:8px; padding:8px 16px; border-radius:10px; font-size:13px; font-weight:700; font-family:'Syne',sans-serif; color:#fff; }

        @media(max-width:640px){
          .match-grid { grid-template-columns:1fr!important; }
          .stat-val { font-size:28px; }
        }
      `}</style>

      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <header className="relative overflow-hidden" style={{ paddingTop: 80, minHeight: 460 }}>
        {/* BG image */}
        <div className="absolute inset-0">
          <img src="/images/matches.jpg" alt="" loading="lazy" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(45,10,14,.92) 0%,rgba(26,6,8,.85) 55%,rgba(0,98,51,.25) 100%)' }} />
          {/* Moroccan pattern */}
          <div className="absolute inset-0 opacity-[.07] pointer-events-none"
               style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize: '180px' }} />
        </div>

        {/* Glows */}
        <div className="absolute top-16 left-8 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(193,39,45,.14)' }} />
        <div className="absolute bottom-0 right-8 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(0,98,51,.14)' }} />

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          {/* Badge */}
          <div className="fu mb-8">
            <span className="pill pill-host" style={{ fontSize: 11, padding: '5px 14px' }}>
              <span className="material-icons" style={{ fontSize: 12 }}>event</span>
              Official Schedule
            </span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            {/* Title */}
            <div className="fu d1">
              <h1 className="syne" style={{ fontSize: 'clamp(40px,7vw,76px)', fontWeight: 800, lineHeight: 1, letterSpacing: '-.02em', color: '#fff', marginBottom: 12 }}>
                Tournament<br />
                <span style={{ color: '#C1272D' }} className="serif italic">Fixtures</span>
              </h1>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,.6)', maxWidth: 440, lineHeight: 1.7 }}>
                Explore the full match schedule across 6 host cities in Morocco, Spain &amp; Portugal.
              </p>
            </div>

            {/* Stats — like td-stat-row but inline */}
            <div className="fu d2 flex gap-8 md:gap-12">
              {[
                { v: filteredMatches.length, l: 'Matches', c: '#C1272D' },
                { v: stats.totalTeams,       l: 'Teams',   c: '#f0a500' },
                { v: stats.totalVenues,      l: 'Venues',  c: '#3dba7a' },
              ].map(({ v, l, c }) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div className="syne" style={{ fontSize: 44, fontWeight: 800, color: c, lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '.1em', marginTop: 4, fontWeight: 600 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fade to white */}
        <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
             style={{ background: 'linear-gradient(to bottom, transparent, #fff)' }} />
      </header>

      {/* ══ STAT CARDS ════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 -mt-2 mb-6 ">
        <div className="fu d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12,marginTop:50 }}>
          {[
            { v: filteredMatches.filter(m => ['DIRECT','started','commence','meta 2','fin meta 1'].includes(m.statut)).length, l: 'Live Now',  c: '#C1272D' },
            { v: filteredMatches.filter(m => ['termine','Finished'].includes(m.statut)).length,                                 l: 'Finished', c: '#78716c' },
            { v: filteredMatches.filter(m => !['DIRECT','started','commence','meta 2','fin meta 1','termine','Finished'].includes(m.statut)).length, l: 'Upcoming', c: '#006233' },
            { v: venues.length,  l: 'Stadiums', c: '#b45309' },
          ].map(({ v, l, c }) => (
            <div key={l} className="stat-card fu d3">
              <div className="stat-val" style={{ color: c }}>{v}</div>
              <div className="stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FILTERS ═══════════════════════════════════════════════════════ */}
      <div className="sticky z-40 bg-white border-b border-stone-100 shadow-sm" style={{ top: 80 }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">

            {/* Venue */}
            <div className="relative">
              <button className={`flex items-center gap-2 px-3 py-2 border-2 rounded-xl text-xs font-semibold transition-all ${selectedVenue !== 'all' ? 'filter-active' : 'bg-white border-stone-200 text-stone-700 hover:border-[#C1272D]'}`}>
                <span className="material-icons" style={{ fontSize: 14 }}>stadium</span>
                <span className="hidden sm:inline">{selectedVenue === 'all' ? 'All Venues' : venues.find(v => v.id === parseInt(selectedVenue))?.name}</span>
                <span className="sm:hidden">Venues</span>
                <span className="material-icons" style={{ fontSize: 13 }}>expand_more</span>
              </button>
              <select value={selectedVenue} onChange={e => setSelectedVenue(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full">
                <option value="all">All Venues</option>
                {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>

            {/* Team */}
            <div className="relative">
              <button className={`flex items-center gap-2 px-3 py-2 border-2 rounded-xl text-xs font-semibold transition-all ${selectedTeam !== 'all' ? 'filter-active' : 'bg-white border-stone-200 text-stone-700 hover:border-[#006233]'}`}>
                <span className="material-icons" style={{ fontSize: 14 }}>groups</span>
                <span className="hidden sm:inline">{selectedTeam === 'all' ? 'All Teams' : teams.find(t => t.id === parseInt(selectedTeam))?.name}</span>
                <span className="sm:hidden">Teams</span>
                <span className="material-icons" style={{ fontSize: 13 }}>expand_more</span>
              </button>
              <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full">
                <option value="all">All Teams</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            {/* Stage */}
            <div className="relative">
              <button className={`flex items-center gap-2 px-3 py-2 border-2 rounded-xl text-xs font-semibold transition-all ${selectedStage !== 'all' ? 'filter-active' : 'bg-white border-stone-200 text-stone-700 hover:border-amber-500'}`}>
                <span className="material-icons" style={{ fontSize: 14 }}>emoji_events</span>
                <span className="hidden sm:inline">{selectedStage === 'all' ? 'All Stages' : selectedStage}</span>
                <span className="sm:hidden">Stage</span>
                <span className="material-icons" style={{ fontSize: 13 }}>expand_more</span>
              </button>
              <select value={selectedStage} onChange={e => setSelectedStage(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full">
                <option value="all">All Stages</option>
                <option value="Group Stage">Group Stage</option>
                <option value="Round of 16">Round of 16</option>
                <option value="Quarter Final">Quarter-finals</option>
                <option value="Semi Final">Semi-finals</option>
                <option value="Final">Final</option>
              </select>
            </div>

            {hasFilters && (
              <button onClick={resetFilters} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all"
                      style={{ color: '#C1272D', borderColor: 'rgba(193,39,45,.3)' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(193,39,45,.05)'}
                      onMouseLeave={e => e.currentTarget.style.background=''}>
                <span className="material-icons" style={{ fontSize: 13 }}>close</span>Reset
              </button>
            )}

            <div style={{ flex: 1 }} />

            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl border border-stone-200">
              {[['grid','view_module'],['calendar','view_agenda']].map(([mode, icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                        className="p-2 rounded-lg transition-all"
                        style={viewMode === mode ? { background: 'linear-gradient(to right,#2d0a0e,#1a0608)', color: '#fff' } : { color: '#a8a29e' }}>
                  <span className="material-icons" style={{ fontSize: 18 }}>{icon}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ DATE SELECTOR ═════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 nosb">
            {/* All */}
            <button onClick={() => setSelectedDate(null)}
                    className="flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold transition-all text-center"
                    style={selectedDate === null
                      ? { background: 'linear-gradient(to right,#2d0a0e,#1a0608)', color: '#fff' }
                      : { background: '#f5f5f4', color: '#78716c', border: '1px solid #e7e5e4' }}>
              <div style={{ fontSize: 12 }}>All</div>
              <div style={{ fontSize: 10, opacity: .65 }}>Dates</div>
            </button>

            {dates.map((d, i) => {
              const ds = d.toLocaleDateString();
              const sel = selectedDate === ds;
              return (
                <button key={i} onClick={() => setSelectedDate(ds)}
                        className="flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold transition-all text-center"
                        style={sel
                          ? { background: 'linear-gradient(to right,#006233,#004d28)', color: '#fff' }
                          : { background: '#fff', color: '#57534e', border: '1px solid #e7e5e4' }}>
                  <div style={{ fontSize: 10, opacity: .65 }}>{d.toLocaleDateString('en-US',{month:'short'}).toUpperCase()}</div>
                  <div className="syne" style={{ fontSize: 22, fontWeight: 800 }}>{d.getDate()}</div>
                  <div style={{ fontSize: 10, opacity: .65 }}>{d.toLocaleDateString('en-US',{weekday:'short'}).toUpperCase()}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══ MATCHES ═══════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10" style={{ minHeight: '60vh' }}>

        {filteredMatches.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f5f5f4', border: '1px solid #e7e5e4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span className="material-icons" style={{ fontSize: 28, color: '#a8a29e' }}>search_off</span>
            </div>
            <div className="syne" style={{ fontSize: 18, fontWeight: 700, color: '#57534e', marginBottom: 8 }}>No matches found</div>
            <div style={{ fontSize: 13, color: '#a8a29e' }}>Try adjusting your filters</div>
          </div>
        )}

        {/* ── GRID VIEW ── */}
        {filteredMatches.length > 0 && viewMode === 'grid' && (
          <div className="match-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
            {filteredMatches.map((match, i) => {
              const { label, cls, pulse } = getStatus(match.statut);
              const t1   = match.matchTeams?.[0];
              const t2   = match.matchTeams?.[1];
              const date = new Date(match.dateOfMatch);
              const done = ['termine','Finished'].includes(match.statut);
              return (
                <Link href={`/match/${match.id}`} key={match.id}>
                  <div className={`match-card fu`} style={{ animationDelay: `${i * .035}s`, cursor: 'pointer' }}>

                    {/* Card top — dark like navbar */}
                    <div style={{ background: 'linear-gradient(to right,#2d0a0e,#1a0608)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`pill ${cls} ${pulse ? 'pulse-glow' : ''}`}>
                          {pulse && <span className="live-dot" />}
                          {label}
                        </span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{match.type}</span>
                      </div>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="material-icons" style={{ fontSize: 11 }}>schedule</span>
                        {date.toLocaleDateString('en-US',{month:'short',day:'numeric'})} · {date.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
                      </span>
                    </div>

                    {/* Teams body */}
                    <div style={{ padding: '20px 16px' }}>
                      {/* Desktop team row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Team 1 */}
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', border: '2px solid #f5f5f4', margin: '0 auto 8px', background: '#fafaf9' }}>
                            <img src={t1?.imageUrl} alt={t1?.teamName} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#1c1917', lineHeight: 1.3 }} className="syne">{t1?.teamName}</div>
                          {done && <div style={{ fontSize: 26, fontWeight: 800, color: '#C1272D', lineHeight: 1.1, marginTop: 4 }} className="syne">{t1?.goals ?? 0}</div>}
                        </div>

                        {/* Score center */}
                        <div style={{ minWidth: 60, textAlign: 'center' }}>
                          {done
                            ? <div style={{ fontSize: 11, fontWeight: 700, color: '#a8a29e', background: '#f5f5f4', padding: '4px 8px', borderRadius: 8 }}>FT</div>
                            : <div style={{ fontSize: 18, fontWeight: 300, color: '#d6d3d1' }}>VS</div>}
                        </div>

                        {/* Team 2 */}
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', border: '2px solid #f5f5f4', margin: '0 auto 8px', background: '#fafaf9' }}>
                            <img src={t2?.imageUrl} alt={t2?.teamName} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#1c1917', lineHeight: 1.3 }} className="syne">{t2?.teamName}</div>
                          {done && <div style={{ fontSize: 26, fontWeight: 800, color: '#006233', lineHeight: 1.1, marginTop: 4 }} className="syne">{t2?.goals ?? 0}</div>}
                        </div>
                      </div>

                      {/* Venue */}
                      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f5f5f4', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#78716c' }}>
                        <span className="material-icons" style={{ fontSize: 13, color: '#C1272D' }}>stadium</span>
                        <span style={{ fontWeight: 500 }}>{match.stadeName || 'TBD'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── CALENDAR VIEW ── */}
        {filteredMatches.length > 0 && viewMode === 'calendar' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {Object.entries(matchesByDate).map(([dateKey, dayMatches]) => (
              <div key={dateKey} className="fu">
                {/* Date header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div className="date-hdr syne" style={{ background: 'linear-gradient(to right,#2d0a0e,#1a0608)' }}>
                    <span className="material-icons" style={{ fontSize: 14, color: '#C1272D' }}>calendar_today</span>
                    {dateKey}
                  </div>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right,rgba(193,39,45,.2),transparent)' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#a8a29e', background: '#f5f5f4', padding: '3px 10px', borderRadius: 99 }}>
                    {dayMatches.length} match{dayMatches.length > 1 ? 'es' : ''}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {dayMatches.map((match, i) => {
                    const { label, cls, pulse } = getStatus(match.statut);
                    const t1   = match.matchTeams?.[0];
                    const t2   = match.matchTeams?.[1];
                    const date = new Date(match.dateOfMatch);
                    const done = ['termine','Finished'].includes(match.statut);
                    return (
                      <Link href={`/match/${match.id}`} key={match.id}>
                        <div className="cal-card" style={{ animationDelay: `${i*.04}s`, cursor: 'pointer' }}>
                          {/* Top accent stripe — footer gradient */}
                          <div style={{ height: 3, background: 'linear-gradient(to right,#C1272D,#006233)' }} />

                          <div style={{ padding: '14px 20px' }}>
                            {/* Desktop row */}
                            <div className="hidden md:flex items-center gap-6">
                              {/* Time + status */}
                              <div style={{ minWidth: 80, textAlign: 'center' }}>
                                <div className="syne" style={{ fontSize: 20, fontWeight: 800, color: '#1c1917' }}>
                                  {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <span className={`pill ${cls}`} style={{ marginTop: 4 }}>
                                  {pulse && <span className="live-dot" />}
                                  {label}
                                </span>
                              </div>

                              <div style={{ width: 1, height: 48, background: '#f5f5f4' }} />

                              {/* Teams */}
                              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <img src={t1?.imageUrl} alt={t1?.teamName} loading="lazy" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #f5f5f4' }} />
                                <span className="syne" style={{ fontWeight: 700, fontSize: 14, color: '#1c1917' }}>{t1?.teamName}</span>
                                {done && <span className="syne" style={{ fontSize: 20, fontWeight: 800, color: '#C1272D', marginLeft: 'auto' }}>{t1?.goals ?? 0}</span>}
                              </div>

                              <div style={{ fontSize: 12, color: '#d6d3d1', fontWeight: 300, padding: '0 8px' }}>vs</div>

                              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, flexDirection: 'row-reverse' }}>
                                <img src={t2?.imageUrl} alt={t2?.teamName} loading="lazy" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #f5f5f4' }} />
                                <span className="syne" style={{ fontWeight: 700, fontSize: 14, color: '#1c1917' }}>{t2?.teamName}</span>
                                {done && <span className="syne" style={{ fontSize: 20, fontWeight: 800, color: '#006233', marginRight: 'auto' }}>{t2?.goals ?? 0}</span>}
                              </div>

                              <div style={{ width: 1, height: 48, background: '#f5f5f4' }} />

                              {/* Venue + type */}
                              <div style={{ minWidth: 160, textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', fontSize: 12, color: '#57534e', fontWeight: 500 }}>
                                  <span className="material-icons" style={{ fontSize: 13, color: '#C1272D' }}>stadium</span>
                                  {match.stadeName}
                                </div>
                                <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 4 }}>{match.type}</div>
                              </div>
                            </div>

                            {/* Mobile row */}
                            <div className="md:hidden flex flex-col gap-3">
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#1c1917' }}>
                                  <span className="material-icons" style={{ fontSize: 13, color: '#a8a29e' }}>schedule</span>
                                  {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <span className={`pill ${cls}`}>{label}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <img src={t1?.imageUrl} alt={t1?.teamName} loading="lazy" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #f5f5f4', flexShrink: 0 }} />
                                <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{t1?.teamName}</span>
                                <div style={{ fontSize: 15, fontWeight: 800, color: done ? '#1c1917' : '#d6d3d1', padding: '0 8px' }}>
                                  {done ? `${t1?.goals ?? 0} – ${t2?.goals ?? 0}` : 'VS'}
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 600, flex: 1, textAlign: 'right' }}>{t2?.teamName}</span>
                                <img src={t2?.imageUrl} alt={t2?.teamName} loading="lazy" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #f5f5f4', flexShrink: 0 }} />
                              </div>
                              <div style={{ paddingTop: 8, borderTop: '1px solid #f5f5f4', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#78716c' }}>
                                <span className="material-icons" style={{ fontSize: 12, color: '#C1272D' }}>stadium</span>
                                <span>{match.stadeName}</span>
                                <span style={{ marginLeft: 'auto', color: '#a8a29e' }}>{match.type}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}