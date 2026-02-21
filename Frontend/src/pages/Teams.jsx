import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

export default function Teams() {
  const router = useRouter();

  const [teams, setTeams]           = useState([]);
  const [groups, setGroups]         = useState([]);
  const [selectedContinent, setSelectedContinent] = useState('all');
  const [selectedGroup, setSelectedGroup]         = useState('all');
  const [searchQuery, setSearchQuery]             = useState('');
  const [sortBy, setSortBy]                       = useState('name');
  const [stats, setStats]           = useState({ totalTeams: 48, totalContinents: 6, totalGroups: 12 });
  const [loading, setLoading]       = useState(true);
  const [filteredTeams, setFilteredTeams] = useState([]);

  useEffect(() => {
    fetch('https://anas-gana1-fandb-backend.hf.space/api/teams/teams/all')
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setTeams(arr); setFilteredTeams(arr);
        setStats(p => ({ ...p, totalTeams: arr.length }));
        setLoading(false);
      })
      .catch(() => { setTeams([]); setFilteredTeams([]); setLoading(false); });
  }, []);

  useEffect(() => {
    fetch('https://anas-gana1-fandb-backend.hf.space/api/acceuil/accueil/groupes')
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setGroups(arr);
        setStats(p => ({ ...p, totalGroups: arr.length }));
      })
      .catch(() => setGroups([]));
  }, []);

  const getContinent = (country) => {
    const map = {
      'Africa':        ['Morocco','Algeria','Tunisia','Egypt','Nigeria','Senegal','Cameroon','Ghana','Ivory Coast','South Africa'],
      'Europe':        ['France','Germany','Spain','Italy','England','Portugal','Netherlands','Belgium','Croatia','Poland','Switzerland','Denmark','Sweden','Austria','Ukraine','Wales','Serbia'],
      'South America': ['Brazil','Argentina','Uruguay','Colombia','Chile','Peru','Ecuador','Paraguay','Venezuela'],
      'North America': ['United States','Mexico','Canada','Costa Rica','Jamaica','Honduras'],
      'Asia':          ['Japan','South Korea','Iran','Saudi Arabia','Qatar','Australia','China','Iraq'],
      'Oceania':       ['New Zealand'],
    };
    for (const [c, countries] of Object.entries(map)) {
      if (countries.includes(country)) return c;
    }
    return 'Other';
  };

  const getConfederation = (c) => ({ Africa:'CAF', Europe:'UEFA', 'South America':'CONMEBOL', 'North America':'CONCACAF', Asia:'AFC', Oceania:'OFC' }[c] || '');

  const getCountryCode = (name) => {
    const codes = { 'Morocco':'MAR','Algeria':'ALG','Tunisia':'TNS','Egypt':'EGY','France':'FRA','Germany':'GER','Spain':'ESP','Italy':'ITL','Brazil':'BRA','Argentina':'ARG','Uruguay':'URY','Colombia':'COL','United States':'USA','Mexico':'MEX','Canada':'CAN','Japan':'JPN','South Korea':'KOR','Iran':'IRN','Saudi Arabia':'KSA','Portugal':'PRT','England':'ENG','Netherlands':'NLD','Belgium':'BEL','Senegal':'SEN','Nigeria':'NGA','Cameroon':'CMR','Ghana':'GHA' };
    return codes[name] || name.substring(0,3).toUpperCase();
  };

  useEffect(() => {
    if (!teams?.length) { setFilteredTeams([]); return; }
    let f = [...teams];
    if (selectedContinent !== 'all') f = f.filter(t => getContinent(t.country) === selectedContinent);
    if (selectedGroup !== 'all') {
      const grp = groups.find(g => g.id === parseInt(selectedGroup));
      if (grp?.groupTeams) {
        const ids = grp.groupTeams.map(gt => gt.teamId);
        f = f.filter(t => ids.includes(t.id));
      }
    }
    if (searchQuery) f = f.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.country.toLowerCase().includes(searchQuery.toLowerCase()));
    f.sort((a,b) => sortBy === 'name' ? a.name.localeCompare(b.name) : (b[sortBy]||0)-(a[sortBy]||0));
    setFilteredTeams(f);
  }, [selectedContinent, selectedGroup, searchQuery, sortBy, teams, groups]);

  const continents = [...new Set((teams||[]).map(t => getContinent(t.country)))].filter(c => c !== 'Other');
  const hasFilters = selectedContinent !== 'all' || selectedGroup !== 'all' || !!searchQuery;
  const resetFilters = () => { setSelectedContinent('all'); setSelectedGroup('all'); setSearchQuery(''); };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div style={{ width:48, height:48, border:'3px solid #C1272D', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
    </div>
  );

  return (
    <>
      <Head>
        <title>Teams | MoroccoFan2030</title>
        <meta name="description" content="48 qualified nations for the 2030 World Cup" />
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
        .syne  { font-family: 'Syne', sans-serif; }
        .serif { font-family: 'Amiri', serif; }

        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes floatLine1 { 0%,100%{transform:translateY(0) rotate(-15deg)} 50%{transform:translateY(-28px) rotate(-15deg)} }
        @keyframes floatLine2 { 0%,100%{transform:translateY(0) rotate(25deg)}  50%{transform:translateY(20px) rotate(25deg)} }
        @keyframes floatLine3 { 0%,100%{transform:translateY(0) rotate(-35deg)} 50%{transform:translateY(-18px) rotate(-35deg)} }

        .fu  { animation: fadeUp .5s ease-out forwards; opacity:0; }
        .fi  { animation: fadeIn .4s ease-out forwards; opacity:0; }
        .d1  { animation-delay: .08s; }
        .d2  { animation-delay: .16s; }
        .d3  { animation-delay: .24s; }
        .d4  { animation-delay: .32s; }

        .deco-l1 { animation: floatLine1  8s ease-in-out infinite; }
        .deco-l2 { animation: floatLine2 10s ease-in-out infinite; }
        .deco-l3 { animation: floatLine3 12s ease-in-out infinite; }

        /* Pills */
        .pill { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;border:1px solid; }
        .pill-host  { background:rgba(193,39,45,.08);  color:#C1272D; border-color:rgba(193,39,45,.25); }
        .pill-gold  { background:rgba(240,165,0,.10);  color:#b45309; border-color:rgba(240,165,0,.30); }
        .pill-green { background:rgba(0,98,51,.10);    color:#006233; border-color:rgba(0,98,51,.30);   }
        .pill-gray  { background:rgba(0,0,0,.04);      color:#78716c; border-color:rgba(0,0,0,.10);     }

        /* Stat cards */
        .stat-card { background:#fff; border:1px solid #e7e5e4; border-radius:16px; padding:20px 16px; text-align:center; transition:border-color .2s,box-shadow .2s; }
        .stat-card:hover { border-color:#C1272D; box-shadow:0 4px 20px rgba(193,39,45,.08); }
        .stat-val { font-size:34px; font-weight:800; line-height:1; font-family:'Syne',sans-serif; }
        .stat-lbl { font-size:11px; color:#a8a29e; text-transform:uppercase; letter-spacing:.08em; margin-top:6px; font-weight:500; }

        /* Team card */
        .team-card { background:#fff; border:1px solid #e7e5e4; border-radius:18px; overflow:hidden; cursor:pointer; border-bottom:3px solid transparent; transition:border-color .22s, border-bottom-color .22s, transform .22s, box-shadow .22s; }
        .team-card:hover { border-color:#e7e5e4; border-bottom-color:#C1272D; transform:translateY(-5px); box-shadow:0 16px 36px rgba(193,39,45,.10); }
        .team-card:hover .arrow-circle { background:#C1272D; border-color:#C1272D; color:#fff; }

        /* Continent filter */
        .cf-btn { padding:6px 14px; border-radius:99px; font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; border:1px solid #e7e5e4; background:#fff; color:#78716c; transition:all .18s; white-space:nowrap; cursor:pointer; }
        .cf-btn:hover { border-color:#C1272D; color:#C1272D; }
        .cf-btn.active { background:linear-gradient(to right,#2d0a0e,#1a0608); color:#fff; border-color:transparent; }

        /* Search */
        .search-box { width:100%; padding:10px 14px 10px 38px; border:1px solid #e7e5e4; border-radius:12px; font-size:13px; font-family:'Inter',sans-serif; outline:none; transition:border-color .2s,box-shadow .2s; background:#fafaf9; }
        .search-box:focus { border-color:#C1272D; box-shadow:0 0 0 3px rgba(193,39,45,.08); background:#fff; }

        .nosb::-webkit-scrollbar { display:none; }
        .nosb { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <header className="relative overflow-hidden" style={{ paddingTop:80, minHeight:460 }}>
        <div className="absolute inset-0">
          <img src="/images/moroccoteam.avif" alt="Teams Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background:'linear-gradient(135deg,rgba(45,10,14,.92) 0%,rgba(26,6,8,.85) 55%,rgba(0,98,51,.22) 100%)' }} />
          <div className="absolute inset-0 opacity-[.07] pointer-events-none"
               style={{ backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'180px' }} />
        </div>
        <div className="absolute top-16 left-8 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background:'rgba(193,39,45,.14)' }} />
        <div className="absolute bottom-0 right-8 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background:'rgba(0,98,51,.14)' }} />

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="fu mb-8">
            <span className="pill pill-host" style={{ fontSize:11, padding:'5px 14px' }}>
              <span className="material-icons" style={{ fontSize:12 }}>public</span>
              Qualified Nations
            </span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div className="fu d1">
              <h1 className="syne" style={{ fontSize:'clamp(40px,7vw,76px)', fontWeight:800, lineHeight:1, letterSpacing:'-.02em', color:'#fff', marginBottom:12 }}>
                Participating<br />
                <span style={{ color:'#C1272D' }} className="serif italic">Teams</span>
              </h1>
              <p style={{ fontSize:15, color:'rgba(255,255,255,.6)', maxWidth:440, lineHeight:1.7 }}>
                Discover the {stats.totalTeams} nations competing for glory in Morocco, Portugal &amp; Spain.
              </p>
            </div>

            <div className="fu d2 flex gap-10 md:gap-14">
              {[
                { v: stats.totalTeams,      l:'Teams',      c:'#C1272D' },
                { v: stats.totalContinents, l:'Continents', c:'#f0a500' },
                { v: stats.totalGroups,     l:'Groups',     c:'#3dba7a' },
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

      {/* ══ STAT CARDS ════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 -mt-2 mb-6">
        <div className="fu d2" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12 , marginTop:50 }}>
          {[
            { v: filteredTeams.filter(t => ['Morocco','Portugal','Spain'].includes(t.country)).length, l:'Host Nations', c:'#C1272D' },
            { v: filteredTeams.filter(t => getContinent(t.country) === 'Europe').length,               l:'UEFA',         c:'#3b82f6' },
            { v: filteredTeams.filter(t => getContinent(t.country) === 'Africa').length,               l:'CAF',          c:'#f0a500' },
            { v: filteredTeams.filter(t => getContinent(t.country) === 'South America').length,        l:'CONMEBOL',     c:'#3dba7a' },
          ].map(({ v, l, c }) => (
            <div key={l} className="stat-card fu d3">
              <div className="stat-val" style={{ color:c }}>{v}</div>
              <div className="stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FILTERS ═══════════════════════════════════════════════════════ */}
      <div className="sticky z-40 bg-white border-b border-stone-100 shadow-sm" style={{ top:80 }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex flex-col md:flex-row items-center gap-3">

            {/* Search */}
            <div style={{ position:'relative', width:'100%', maxWidth:300, flexShrink:0 }}>
              <span className="material-icons" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', fontSize:17, color:'#a8a29e', pointerEvents:'none' }}>search</span>
              <input
                type="text" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search team or country…"
                className="search-box"
              />
            </div>

            {/* Continent pills */}
            <div className="flex items-center gap-2 overflow-x-auto nosb pb-0.5 flex-1">
              <button onClick={() => setSelectedContinent('all')} className={`cf-btn ${selectedContinent === 'all' ? 'active' : ''}`}>All Teams</button>
              {continents.map(c => (
                <button key={c} onClick={() => setSelectedContinent(c)} className={`cf-btn ${selectedContinent === c ? 'active' : ''}`}>
                  {c} <span style={{ opacity:.5, fontSize:9 }}>{getConfederation(c)}</span>
                </button>
              ))}
            </div>

            {/* Sort */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <button className="cf-btn" style={{ display:'flex', alignItems:'center', gap:4 }}>
                <span className="material-icons" style={{ fontSize:14 }}>sort</span>
                {sortBy === 'name' ? 'Name' : sortBy === 'participation' ? 'Experience' : 'News'}
                <span className="material-icons" style={{ fontSize:13 }}>expand_more</span>
              </button>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                      style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%' }}>
                <option value="name">Name</option>
                <option value="participation">World Cup Experience</option>
                <option value="newsCount">Most News</option>
              </select>
            </div>

            {/* Groups */}
            {groups.length > 0 && (
              <div style={{ position:'relative', flexShrink:0 }}>
                <button className={`cf-btn ${selectedGroup !== 'all' ? 'active' : ''}`} style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <span className="material-icons" style={{ fontSize:14 }}>group_work</span>
                  {selectedGroup === 'all' ? 'All Groups' : `Group ${selectedGroup}`}
                  <span className="material-icons" style={{ fontSize:13 }}>expand_more</span>
                </button>
                <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}
                        style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%' }}>
                  <option value="all">All Groups</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            )}

            {/* Reset */}
            {hasFilters && (
              <button onClick={resetFilters} className="cf-btn" style={{ color:'#C1272D', borderColor:'rgba(193,39,45,.3)', display:'flex', alignItems:'center', gap:4 }}>
                <span className="material-icons" style={{ fontSize:13 }}>close</span>Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══ TEAMS GRID ════════════════════════════════════════════════════ */}
      <main style={{ background:'#fff', minHeight:'60vh', padding:'48px 0 80px', position:'relative', overflow:'hidden' }}>

        {/* Decorative animated lines */}
        <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
          <div className="deco-l1" style={{ position:'absolute', top:'12%',  left:'-8%',  width:500, height:1, background:'linear-gradient(to right,transparent,rgba(193,39,45,.15),transparent)' }} />
          <div className="deco-l2" style={{ position:'absolute', top:'38%',  right:'5%',  width:420, height:1, background:'linear-gradient(to right,rgba(240,165,0,.15),transparent)', animationDelay:'2s' }} />
          <div className="deco-l3" style={{ position:'absolute', top:'62%',  left:'8%',   width:380, height:1, background:'linear-gradient(to right,transparent,rgba(0,98,51,.15),transparent)', animationDelay:'1s' }} />
          <div className="deco-l1" style={{ position:'absolute', top:'82%',  right:'15%', width:460, height:1, background:'linear-gradient(to left,transparent,rgba(193,39,45,.12),transparent)', animationDelay:'3s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6" style={{ position:'relative', zIndex:1 }}>

          {filteredTeams.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 24px' }} className="fu">
              <div style={{ width:64, height:64, borderRadius:'50%', background:'#f5f5f4', border:'1px solid #e7e5e4', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                <span className="material-icons" style={{ fontSize:28, color:'#a8a29e' }}>search_off</span>
              </div>
              <div className="syne" style={{ fontSize:18, fontWeight:700, color:'#57534e', marginBottom:8 }}>No teams found</div>
              <div style={{ fontSize:13, color:'#a8a29e' }}>Try adjusting your filters or search</div>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:16 }}>
              {filteredTeams.map((team, i) => {
                const continent     = getContinent(team.country);
                const confederation = getConfederation(continent);
                const countryCode   = getCountryCode(team.country);
                const isHost        = ['Morocco','Portugal','Spain'].includes(team.country);

                return (
                  <div
                    key={team.id}
                    className="team-card fu"
                    style={{ animationDelay:`${i * .03}s` }}
                    onClick={() => router.push(`/Team?id=${team.id}`)}
                  >
                    {/* Top stripe */}
                    <div style={{ height:4, background: isHost
                      ? 'linear-gradient(to right,#C1272D,#006233)'
                      : 'linear-gradient(to right,#2d0a0e,#1a0608)' }} />

                    <div style={{ padding:'18px 16px 14px' }}>
                      {/* Badges */}
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:14, minHeight:22 }}>
                        {isHost && <span className="pill pill-host">Host</span>}
                        {team.participation > 0 && <span className="pill pill-gold">{team.participation}× WC</span>}
                        <span className="pill pill-gray" style={{ marginLeft:'auto' }}>{confederation}</span>
                      </div>

                      {/* Logo */}
                      <div style={{ width:68, height:68, borderRadius:'50%', overflow:'hidden', border:'3px solid #f5f5f4', background:'#fafaf9', margin:'0 auto 14px', boxShadow:'0 4px 12px rgba(0,0,0,.08)' }}>
                        <img
                          src={team.imageUrl} alt={team.name}
                          style={{ width:'100%', height:'100%', objectFit:'cover' }}
                          onError={e => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f5f5f4,#e7e5e4);color:#78716c;font-weight:800;font-size:13px;font-family:Syne,sans-serif">${countryCode}</div>`;
                          }}
                        />
                      </div>

                      {/* Name */}
                      <div style={{ textAlign:'center', marginBottom:14 }}>
                        <div className="syne" style={{ fontSize:14, fontWeight:700, color:'#1c1917', marginBottom:3, lineHeight:1.3 }}>{team.name}</div>
                        <div style={{ fontSize:11, color:'#a8a29e', fontWeight:500 }}>{continent}</div>
                      </div>

                      {/* Footer */}
                      <div style={{ borderTop:'1px solid #f5f5f4', paddingTop:12, display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                        {team.coach
                          ? <div style={{ fontSize:11, color:'#78716c', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              <span style={{ color:'#a8a29e' }}>Coach </span>
                              <span style={{ fontWeight:600, color:'#57534e' }}>{team.coach}</span>
                            </div>
                          : <div />
                        }
                        <div className="arrow-circle" style={{ width:28, height:28, borderRadius:'50%', border:'1px solid #e7e5e4', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s', color:'#a8a29e' }}>
                          <span className="material-icons" style={{ fontSize:14 }}>chevron_right</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* View all */}
          {filteredTeams.length > 0 && filteredTeams.length < teams.length && (
            <div style={{ textAlign:'center', marginTop:48 }} className="fu d4">
              <button
                onClick={resetFilters}
                style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 28px', border:'1px solid #e7e5e4', borderRadius:12, background:'#fff', fontSize:13, fontWeight:600, color:'#57534e', cursor:'pointer', transition:'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#C1272D'; e.currentTarget.style.color='#C1272D'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#e7e5e4'; e.currentTarget.style.color='#57534e'; }}>
                View all {teams.length} teams
                <span className="material-icons" style={{ fontSize:16 }}>expand_more</span>
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}