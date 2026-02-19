import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

export default function Stades() {
  const router = useRouter();

  const [stades, setStades]             = useState([]);
  const [cities, setCities]             = useState([]);
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery]   = useState('');
  const [sortBy, setSortBy]             = useState('name');
  const [stats, setStats]               = useState({ totalStadiums: 0, totalCapacity: 0, totalCities: 6 });
  const [loading, setLoading]           = useState(true);
  const [filteredStades, setFilteredStades] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3309/api/acceuil/stade/all')
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setStades(arr); setFilteredStades(arr);
        const cap = arr.reduce((s, st) => s + (st.capacity || 0), 0);
        setStats(p => ({ ...p, totalStadiums: arr.length, totalCapacity: cap }));
        setLoading(false);
      })
      .catch(() => { setStades([]); setFilteredStades([]); setLoading(false); });
  }, []);

  useEffect(() => {
    fetch('http://localhost:3309/api/acceuil/CityHosts/all')
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setCities(arr);
        setStats(p => ({ ...p, totalCities: arr.length }));
      })
      .catch(() => setCities([]));
  }, []);

  useEffect(() => {
    if (!stades?.length) { setFilteredStades([]); return; }
    let f = [...stades];
    if (selectedCity !== 'all') f = f.filter(s => (s.cityName || s.city) === selectedCity);
    if (searchQuery) f = f.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.cityName || s.city || '').toLowerCase().includes(searchQuery.toLowerCase()));
    f.sort((a, b) => sortBy === 'name' ? a.name.localeCompare(b.name) : sortBy === 'capacity' ? (b.capacity || 0) - (a.capacity || 0) : (a.cityName || a.city || '').localeCompare(b.cityName || b.city || ''));
    setFilteredStades(f);
  }, [selectedCity, searchQuery, sortBy, stades]);

  const uniqueCities = [...new Set((stades || []).map(s => s.cityName || s.city).filter(Boolean))];
  const hasFilters = selectedCity !== 'all' || !!searchQuery;
  const resetFilters = () => { setSelectedCity('all'); setSearchQuery(''); };

  const getCapacityPill = (cap) => {
    if (cap >= 80000) return 'pill-red';
    if (cap >= 60000) return 'pill-green';
    if (cap >= 40000) return 'pill-gold';
    return 'pill-gray';
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div style={{ width:48, height:48, border:'3px solid #C1272D', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
    </div>
  );

  return (
    <>
      <Head>
        <title>Stadiums | MoroccoFan2030</title>
        <meta name="description" content="Explore the iconic stadiums hosting the World Cup 2030" />
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
        .d1  { animation-delay:.08s; } .d2 { animation-delay:.16s; }
        .d3  { animation-delay:.24s; } .d4 { animation-delay:.32s; }
        .deco-l1 { animation: floatLine1  8s ease-in-out infinite; }
        .deco-l2 { animation: floatLine2 10s ease-in-out infinite; }
        .deco-l3 { animation: floatLine3 12s ease-in-out infinite; }

        /* Pills */
        .pill       { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;border:1px solid; }
        .pill-red   { background:rgba(193,39,45,.08);  color:#C1272D; border-color:rgba(193,39,45,.25); }
        .pill-green { background:rgba(0,98,51,.10);    color:#006233; border-color:rgba(0,98,51,.30);   }
        .pill-gold  { background:rgba(240,165,0,.10);  color:#b45309; border-color:rgba(240,165,0,.30); }
        .pill-gray  { background:rgba(0,0,0,.04);      color:#78716c; border-color:rgba(0,0,0,.10);     }
        .pill-venue { background:rgba(193,39,45,.08);  color:#C1272D; border-color:rgba(193,39,45,.25); }

        /* Stat cards */
        .stat-card { background:#fff; border:1px solid #e7e5e4; border-radius:16px; padding:20px 16px; text-align:center; transition:border-color .2s,box-shadow .2s; }
        .stat-card:hover { border-color:#C1272D; box-shadow:0 4px 20px rgba(193,39,45,.08); }
        .stat-val { font-size:34px; font-weight:800; line-height:1; font-family:'Syne',sans-serif; }
        .stat-lbl { font-size:11px; color:#a8a29e; text-transform:uppercase; letter-spacing:.08em; margin-top:6px; font-weight:500; }

        /* Stadium card */
        .stade-card { background:#fff; border:1px solid #e7e5e4; border-radius:20px; overflow:hidden; cursor:pointer; transition:border-color .22s,transform .22s,box-shadow .22s; }
        .stade-card:hover { border-color:#C1272D; transform:translateY(-5px); box-shadow:0 20px 48px rgba(193,39,45,.12); }
        .stade-card:hover .stade-img { transform:scale(1.07); }
        .stade-card:hover .stade-title { color:#C1272D; }
        .stade-card:hover .view-overlay { opacity:1; }
        .stade-img { width:100%; height:100%; object-fit:cover; transition:transform .6s cubic-bezier(.4,0,.2,1); }
        .view-overlay { position:absolute; inset:0; z-index:3; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .25s; background:rgba(0,0,0,.15); }

        /* Filter btn */
        .cf-btn { padding:6px 14px; border-radius:99px; font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; border:1px solid #e7e5e4; background:#fff; color:#78716c; transition:all .18s; white-space:nowrap; cursor:pointer; display:inline-flex; align-items:center; gap:4px; }
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
          <img src="/images/terrain1.webp" alt="Stadiums" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background:'linear-gradient(135deg,rgba(45,10,14,.92) 0%,rgba(26,6,8,.85) 55%,rgba(0,98,51,.22) 100%)' }} />
          <div className="absolute inset-0 opacity-[.07] pointer-events-none"
               style={{ backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'180px' }} />
        </div>
        <div className="absolute top-16 left-8 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background:'rgba(193,39,45,.14)' }} />
        <div className="absolute bottom-0 right-8 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background:'rgba(0,98,51,.14)' }} />

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="fu mb-8">
            <span className="pill pill-venue" style={{ fontSize:11, padding:'5px 14px' }}>
              <span className="material-icons" style={{ fontSize:12 }}>stadium</span>
              World Cup Venues
            </span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div className="fu d1">
              <h1 className="syne" style={{ fontSize:'clamp(40px,7vw,76px)', fontWeight:800, lineHeight:1, letterSpacing:'-.02em', color:'#fff', marginBottom:12 }}>
                Iconic<br />
                <span style={{ color:'#C1272D' }} className="serif italic">Stadiums</span>
              </h1>
              <p style={{ fontSize:15, color:'rgba(255,255,255,.6)', maxWidth:440, lineHeight:1.7 }}>
                Discover the magnificent venues hosting the world's greatest football tournament.
              </p>
            </div>

            <div className="fu d2 flex gap-10 md:gap-14">
              {[
                { v: stats.totalStadiums,                        l:'Stadiums', c:'#C1272D' },
                { v: `${(stats.totalCapacity/1000).toFixed(0)}K`, l:'Capacity', c:'#f0a500' },
                { v: stats.totalCities,                           l:'Cities',   c:'#3dba7a' },
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
        <div className="fu d2" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12 ,marginTop:50 }}>
          {[
            { v: filteredStades.filter(s => (s.capacity||0) >= 80000).length,                                   l:'Premier (+80K)', c:'#C1272D' },
            { v: filteredStades.filter(s => (s.capacity||0) >= 60000 && (s.capacity||0) < 80000).length,        l:'Large (60-80K)',  c:'#006233' },
            { v: filteredStades.filter(s => (s.capacity||0) >= 40000 && (s.capacity||0) < 60000).length,        l:'Medium (40-60K)', c:'#b45309' },
            { v: filteredStades.filter(s => (s.capacity||0) > 0 && (s.capacity||0) < 40000).length,             l:'Compact (<40K)',  c:'#78716c' },
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
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                     placeholder="Search stadium or city…" className="search-box" />
            </div>

            {/* City pills */}
            <div className="flex items-center gap-2 overflow-x-auto nosb pb-0.5 flex-1">
              <button onClick={() => setSelectedCity('all')} className={`cf-btn ${selectedCity === 'all' ? 'active' : ''}`}>
                All Stadiums
              </button>
              {uniqueCities.map(city => (
                <button key={city} onClick={() => setSelectedCity(city)} className={`cf-btn ${selectedCity === city ? 'active' : ''}`}>
                  <span className="material-icons" style={{ fontSize:12 }}>location_on</span>
                  {city}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <button className="cf-btn">
                <span className="material-icons" style={{ fontSize:14 }}>sort</span>
                {sortBy === 'name' ? 'Name' : sortBy === 'capacity' ? 'Capacity' : 'City'}
                <span className="material-icons" style={{ fontSize:13 }}>expand_more</span>
              </button>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                      style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%' }}>
                <option value="name">Sort by Name</option>
                <option value="capacity">Sort by Capacity</option>
                <option value="city">Sort by City</option>
              </select>
            </div>

            {/* Reset */}
            {hasFilters && (
              <button onClick={resetFilters} className="cf-btn" style={{ color:'#C1272D', borderColor:'rgba(193,39,45,.3)', display:'flex', alignItems:'center', gap:4 }}>
                <span className="material-icons" style={{ fontSize:13 }}>close</span>Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══ STADIUMS GRID ═════════════════════════════════════════════════ */}
      <main style={{ background:'#fff', minHeight:'60vh', padding:'48px 0 80px', position:'relative', overflow:'hidden' }}>

        {/* Decorative lines */}
        <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
          <div className="deco-l1" style={{ position:'absolute', top:'12%',  left:'-8%',  width:500, height:1, background:'linear-gradient(to right,transparent,rgba(193,39,45,.15),transparent)' }} />
          <div className="deco-l2" style={{ position:'absolute', top:'38%',  right:'5%',  width:420, height:1, background:'linear-gradient(to right,rgba(240,165,0,.15),transparent)', animationDelay:'2s' }} />
          <div className="deco-l3" style={{ position:'absolute', top:'65%',  left:'8%',   width:380, height:1, background:'linear-gradient(to right,transparent,rgba(0,98,51,.15),transparent)', animationDelay:'1s' }} />
          <div className="deco-l1" style={{ position:'absolute', top:'85%',  right:'15%', width:460, height:1, background:'linear-gradient(to left,transparent,rgba(193,39,45,.12),transparent)', animationDelay:'3s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6" style={{ position:'relative', zIndex:1 }}>

          {filteredStades.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 24px' }} className="fu">
              <div style={{ width:64, height:64, borderRadius:'50%', background:'#f5f5f4', border:'1px solid #e7e5e4', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                <span className="material-icons" style={{ fontSize:28, color:'#a8a29e' }}>stadium</span>
              </div>
              <div className="syne" style={{ fontSize:18, fontWeight:700, color:'#57534e', marginBottom:8 }}>No stadiums found</div>
              <div style={{ fontSize:13, color:'#a8a29e' }}>Try adjusting your filters or search</div>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:20 }}>
              {filteredStades.map((stade, i) => {
                const isPremier = (stade.capacity || 0) >= 80000;
                const capCls    = getCapacityPill(stade.capacity || 0);
                const city      = stade.cityName || stade.city;

                return (
                  <div
                    key={stade.id}
                    className="stade-card fu"
                    style={{ animationDelay:`${i * .05}s` }}
                    onClick={() => router.push(`/stade/${stade.id}`)}
                  >
                    {/* Image */}
                    <div style={{ position:'relative', height:200, overflow:'hidden', background:'#f5f5f4' }}>
                      {/* Gradient over image */}
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(45,10,14,.25) 0%,rgba(0,0,0,.55) 100%)', zIndex:2 }} />

                      <img
                        src={stade.imageUrl} alt={stade.name}
                        className="stade-img"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=70'; }}
                      />

                      {/* Capacity badge */}
                      <div style={{ position:'absolute', top:12, right:12, zIndex:4, padding:'4px 10px', borderRadius:99, background:'rgba(0,0,0,.5)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,.15)', fontSize:11, fontWeight:700, color:'#fff', fontFamily:'Syne,sans-serif' }}>
                        {stade.capacity ? stade.capacity.toLocaleString() : 'N/A'} seats
                      </div>

                      {/* Premier badge */}
                      {isPremier && (
                        <div style={{ position:'absolute', top:12, left:12, zIndex:4, display:'flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:99, background:'#C1272D', fontSize:10, fontWeight:700, color:'#fff', textTransform:'uppercase', letterSpacing:'.07em' }}>
                          <span className="material-icons" style={{ fontSize:12 }}>star</span>
                          Premier
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="view-overlay">
                        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:99, background:'rgba(255,255,255,.15)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,.4)', fontSize:13, fontWeight:600, color:'#fff' }}>
                          View Details
                          <span className="material-icons" style={{ fontSize:16 }}>arrow_forward</span>
                        </div>
                      </div>

                      {/* City tag bottom-left */}
                      <div style={{ position:'absolute', bottom:12, left:14, zIndex:4, display:'flex', alignItems:'center', gap:4, fontSize:11, fontWeight:600, color:'rgba(255,255,255,.85)', textTransform:'uppercase', letterSpacing:'.06em' }}>
                        <span className="material-icons" style={{ fontSize:13, color:'#3dba7a' }}>location_on</span>
                        {city}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding:'18px 18px 16px' }}>
                      {/* Capacity pill row */}
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
                        <span className={`pill ${capCls}`}>
                          {stade.capacity ? `${(stade.capacity/1000).toFixed(0)}K seats` : 'Capacity N/A'}
                        </span>
                        {stade.yearBuilt && (
                          <span className="pill pill-gray" style={{ marginLeft:'auto' }}>
                            Built {stade.yearBuilt}
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <div className="syne stade-title" style={{ fontSize:17, fontWeight:700, color:'#1c1917', marginBottom:6, lineHeight:1.3, transition:'color .2s' }}>
                        {stade.name}
                      </div>

                      {/* Description */}
                      {stade.description && (
                        <p style={{ fontSize:12, color:'#a8a29e', lineHeight:1.65, marginBottom:14, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                          {stade.description}
                        </p>
                      )}

                      {/* Details row */}
                      <div style={{ borderTop:'1px solid #f5f5f4', paddingTop:12, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <div style={{ width:28, height:28, borderRadius:'50%', background:'#f5f5f4', display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <span className="material-icons" style={{ fontSize:13, color:'#78716c' }}>event_seat</span>
                            </div>
                            <div>
                              <div style={{ fontSize:9, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'.07em', fontWeight:600 }}>Capacity</div>
                              <div className="syne" style={{ fontSize:13, fontWeight:700, color:'#1c1917' }}>
                                {stade.capacity ? `${(stade.capacity/1000).toFixed(1)}K` : 'N/A'}
                              </div>
                            </div>
                          </div>

                          {stade.yearBuilt && (
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <div style={{ width:28, height:28, borderRadius:'50%', background:'#f5f5f4', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <span className="material-icons" style={{ fontSize:13, color:'#78716c' }}>calendar_today</span>
                              </div>
                              <div>
                                <div style={{ fontSize:9, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'.07em', fontWeight:600 }}>Built</div>
                                <div className="syne" style={{ fontSize:13, fontWeight:700, color:'#1c1917' }}>{stade.yearBuilt}</div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{ width:30, height:30, borderRadius:'50%', border:'1px solid #e7e5e4', display:'flex', alignItems:'center', justifyContent:'center', color:'#a8a29e', transition:'all .2s', flexShrink:0 }}>
                          <span className="material-icons" style={{ fontSize:15 }}>chevron_right</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* View all */}
          {filteredStades.length > 0 && filteredStades.length < stades.length && (
            <div style={{ textAlign:'center', marginTop:48 }} className="fu d4">
              <button
                onClick={resetFilters}
                style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 28px', border:'1px solid #e7e5e4', borderRadius:12, background:'#fff', fontSize:13, fontWeight:600, color:'#57534e', cursor:'pointer', transition:'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#C1272D'; e.currentTarget.style.color='#C1272D'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#e7e5e4'; e.currentTarget.style.color='#57534e'; }}>
                View all {stades.length} stadiums
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