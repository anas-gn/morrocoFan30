import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

const API = 'https://anas-gana1-fandb-backend.hf.space/api';

async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) { console.warn(`[safeFetch] HTTP ${res.status} — ${url}`); return null; }
    const text = await res.text();
    if (!text || text === 'null') return null;
    return JSON.parse(text);
  } catch (err) { console.error(`[safeFetch] Erreur — ${url}`, err); return null; }
}

export default function Cities() {
  const router = useRouter();

  const [cities, setCities]           = useState([]);
  const [filteredCities, setFiltered] = useState([]);
  const [counts, setCounts]           = useState({});
  const [selectedRegion, setRegion]   = useState('all');
  const [searchQuery, setSearch]      = useState('');
  const [viewMode, setViewMode]       = useState('grid');
  const [loading, setLoading]         = useState(true);
  const [globalStats, setGlobalStats] = useState({ cities:0, hotels:0, stades:0 });
  const [hoveredCity, setHovered]     = useState(null);

  /* ── Fetch ── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const cityList = await safeFetch(`${API}/acceuil/CityHosts/all`);
      if (!Array.isArray(cityList)) { setLoading(false); return; }
      setCities(cityList); setFiltered(cityList);

      const allHotels = await safeFetch(`${API}/hotels/all`) ?? [];
      const allStades = await safeFetch(`${API}/acceuil/stade/all`) ?? [];
      const attrResults = await Promise.all(cityList.map(c => safeFetch(`${API}/attractions/city/${c.id}`)));

      const countsMap = {};
      cityList.forEach((c,i) => {
        countsMap[c.id] = {
          hotels:      allHotels.filter(h=>h.cityHostId===c.id).length,
          stades:      allStades.filter(s=>s.cityId===c.id).length,
          attractions: Array.isArray(attrResults[i]) ? attrResults[i].length : 0,
        };
      });
      setCounts(countsMap);
      setGlobalStats({ cities: cityList.length, hotels: allHotels.length, stades: allStades.length });
      setLoading(false);
    })();
  }, []);

  /* ── Filters ── */
  useEffect(() => {
    let f = [...cities];
    if (selectedRegion !== 'all') f = f.filter(c => c.region === selectedRegion);
    if (searchQuery.trim()) f = f.filter(c => [c.name,c.country,c.description].some(v=>v?.toLowerCase().includes(searchQuery.toLowerCase())));
    setFiltered(f);
  }, [selectedRegion, searchQuery, cities]);

  const regions = ['all', ...new Set(cities.map(c=>c.region).filter(Boolean))];

  /* ── Loading ── */
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#fff' }}>
      <div style={{ width:40, height:40, border:'3px solid #C1272D', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ── Render ── */
  return (
    <>
      <Head>
        <title>Villes Hôtes | MoroccoFan2030</title>
        <meta name="description" content="Explorez les 6 villes hôtes de la Coupe du Monde 2030" />
        <link rel="icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        ::selection { background:#C1272D; color:#fff; }
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation:fadeUp .55s cubic-bezier(.16,1,.3,1) both; }

        .no-scroll::-webkit-scrollbar { display:none; }
        .no-scroll { -ms-overflow-style:none; scrollbar-width:none; }

        /* Pills */
        .pill { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;border:1px solid;font-family:'Syne',sans-serif; }
        .pill-red  { background:rgba(193,39,45,.08);color:#C1272D;border-color:rgba(193,39,45,.25); }
        .pill-dark { background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.2); }

        /* Stat card hover */
        
        .stat-card:hover { transform:translateY(-4px); }

        /* City card */
        .city-card {  background:#fff; border:1px solid #e7e5e4; border-radius:20px; overflow:hidden; cursor:pointer; }
        .city-card:hover { transform:translateY(-6px);  border-color:#d6d3d1; }
        .city-card .c-img { transition:transform .75s cubic-bezier(.16,1,.3,1); width:100%;height:100%;object-fit:cover; }
        .city-card:hover .c-img { transform:scale(1.07); }

        /* List card */
        .list-card { background:#fff; border:1px solid #e7e5e4; border-radius:16px; padding:18px 20px; display:flex; align-items:center; gap:16px; cursor:pointer; transition:border-color .2s,box-shadow .2s; }
        .list-card:hover { border-color:#C1272D; box-shadow:0 8px 28px rgba(193,39,45,.06); }
        .list-card .l-img { transition:transform .6s cubic-bezier(.16,1,.3,1); }
        .list-card:hover .l-img { transform:scale(1.06); }
      `}</style>

      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <header style={{ position:'relative', minHeight:'78vh', display:'flex', flexDirection:'column', justifyContent:'flex-end', background:'#1c1917', overflow:'hidden', paddingTop:64 }}>
        {/* Background */}
        <div style={{ position:'absolute', inset:0 }}>
          <img src="/images/cities.png" alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.28 }} onError={e=>e.target.style.display='none'} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(10,10,10,.92) 0%,rgba(28,25,23,.65) 50%,rgba(10,10,10,.82) 100%)' }} />
          {/* Pattern */}
          <div style={{ position:'absolute', inset:0, opacity:.05, backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'160px', pointerEvents:'none' }} />
          {/* Glows */}
          <div style={{ position:'absolute', bottom:-80, left:-80, width:400, height:400, borderRadius:'50%', background:'rgba(193,39,45,.14)', filter:'blur(100px)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:-60, right:-60, width:320, height:320, borderRadius:'50%', background:'rgba(0,98,51,.1)', filter:'blur(90px)', pointerEvents:'none' }} />
        </div>

        {/* Decorative 2030 */}
        <div style={{ position:'absolute', right:32, top:'50%', transform:'translateY(-50%)', display:'none', flexDirection:'column', alignItems:'center', gap:12, zIndex:5, pointerEvents:'none' }} className="dec-2030">
          <div style={{ width:1, height:96, background:'rgba(255,255,255,.08)' }} />
          <div style={{ fontFamily:'Amiri,serif', fontSize:120, lineHeight:1, color:'rgba(255,255,255,.05)', writingMode:'vertical-rl', fontWeight:400 }}>2030</div>
          <div style={{ width:1, height:96, background:'rgba(255,255,255,.08)' }} />
        </div>

        <div style={{ position:'relative', zIndex:10, maxWidth:1100, margin:'0 auto', padding:'0 24px 80px', width:'100%' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:48, alignItems:'flex-end' }}>

            {/* Left: title */}
            <div>
              <div className="fu" style={{ display:'flex', alignItems:'center', gap:12, marginTop:48 , marginBottom:52, animationDelay:'0s' }}>
                <div style={{ width:28, height:2, background:'#C1272D', borderRadius:2 }} />
                <span className="pill pill-red">Coupe du Monde 2030</span>
              </div>

              <h1 className="fu" style={{ animationDelay:'.08s', fontFamily:'Amiri,serif', fontSize:'clamp(52px,8vw,96px)', fontWeight:400, color:'#fff', lineHeight:1.0, marginBottom:20 }}>
                Les Villes<br />
                <em style={{ fontStyle:'normal', color:'#e8d5b0' }}>Hôtes du Maroc</em>
              </h1>

              <p className="fu" style={{ animationDelay:'.16s', color:'rgba(255,255,255,.48)', fontSize:17, lineHeight:1.82, maxWidth:500 }}>
                Six métropoles d'exception accueilleront les meilleures équipes du monde. Stades monumentaux, culture riche, hospitalité légendaire.
              </p>
            </div>

            {/* Stats */}
            <div className="fu" style={{ animationDelay:'.26s' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                {[
                  { val:globalStats.cities, label:'Villes',  accent:'#e05555' },
                  { val:globalStats.hotels, label:'Hôtels',  accent:'#f0a500' },
                  { val:globalStats.stades, label:'Stades',  accent:'#3dba7a' },
                ].map((s,i) => (
                  <div key={i} style={{ padding:'20px 16px', textAlign:'center', borderRadius:16, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)' }}>
                    <div style={{ fontFamily:'Syne,sans-serif', fontSize:48, fontWeight:800, lineHeight:1, color:s.accent, marginBottom:4 }}>{s.val}</div>
                    <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'rgba(255,255,255,.38)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fade bottom */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:80, background:'linear-gradient(to bottom,transparent,#fff)', zIndex:6 }} />
      </header>

      {/* ══ FILTERS ═══════════════════════════════════════════════════════ */}
      <div style={{ position:'sticky', top:64, zIndex:40, background:'rgba(255,255,255,.92)', backdropFilter:'blur(16px)', borderBottom:'1px solid #e7e5e4' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'12px 24px', display:'flex', flexWrap:'wrap', alignItems:'center', gap:10 }}>

          {/* Search */}
          <div style={{ position:'relative', flex:1, minWidth:220 }}>
            <span className="material-icons" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:18, color:'#a8a29e' }}>search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une ville…"
              style={{ width:'100%', paddingLeft:40, paddingRight:16, paddingTop:10, paddingBottom:10, background:'#fafaf9', border:'1px solid #e7e5e4', borderRadius:12, outline:'none', fontFamily:'Inter,sans-serif', fontSize:14, color:'#1c1917', transition:'border-color .2s' }}
              onFocus={e=>e.target.style.borderColor='#C1272D'}
              onBlur={e=>e.target.style.borderColor='#e7e5e4'}
            />
          </div>

          {/* Region pills */}
          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
            {regions.map(r => (
              <button key={r} onClick={() => setRegion(r)}
                      className="syne"
                      style={{ padding:'7px 16px', borderRadius:999, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', fontFamily:'Syne,sans-serif', cursor:'pointer', transition:'all .2s', border:'1px solid', background:selectedRegion===r?'#1c1917':'#fff', color:selectedRegion===r?'#fff':'#78716c', borderColor:selectedRegion===r?'#1c1917':'#e7e5e4' }}>
                {r==='all'?'Toutes':r}
              </button>
            ))}
          </div>

          <div style={{ flex:1 }} />

          {/* Count */}
          <span style={{ fontSize:12, color:'#a8a29e', fontWeight:500, display:'none' }} className="md-show">
            {filteredCities.length} ville{filteredCities.length!==1?'s':''}
          </span>

          {/* View toggle */}
          <div style={{ display:'flex', background:'#fafaf9', border:'1px solid #e7e5e4', borderRadius:12, padding:3, gap:3 }}>
            {[{mode:'grid',icon:'grid_view'},{mode:'list',icon:'view_list'}].map(({mode,icon}) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                      style={{ width:36, height:36, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', border:'none', cursor:'pointer', transition:'all .2s', background:viewMode===mode?'#fff':'transparent', color:viewMode===mode?'#1c1917':'#a8a29e', boxShadow:viewMode===mode?'0 1px 4px rgba(0,0,0,.08)':undefined }}>
                <span className="material-icons" style={{ fontSize:18 }}>{icon}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CITIES GRID / LIST ════════════════════════════════════════════ */}
      <main style={{ maxWidth:1100, margin:'0 auto', padding:'48px 24px 96px' }}>

        {filteredCities.length === 0 ? (
          /* Empty */
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'96px 0', textAlign:'center' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'#fafaf9', border:'1px solid #e7e5e4', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
              <span className="material-icons" style={{ fontSize:32, color:'#d6d3d1' }}>location_city</span>
            </div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:'#1c1917', marginBottom:8 }}>Aucune ville trouvée</div>
            <p style={{ fontSize:14, color:'#a8a29e' }}>Essayez de modifier votre recherche ou vos filtres</p>
          </div>

        ) : viewMode === 'grid' ? (

          /* ── GRID VIEW — immersive dark cards ── */
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16 }}>
            {filteredCities.map((city,i) => {
              const c   = counts[city.id] ?? { hotels:0, stades:0, attractions:0 };
              const hot = hoveredCity === city.id;
              return (
                <article
                  key={city.id}
                  className="fu"
                  onClick={() => router.push(`/cities/${city.id}`)}
                  onMouseEnter={() => setHovered(city.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    animationDelay:`${i*.07}s`,
                    position:'relative', borderRadius:22, overflow:'hidden',
                    minHeight:420, cursor:'pointer',
                    transition:'transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s',
                    transform: hot ? 'translateY(-6px)' : 'translateY(0)',
                    boxShadow: hot ? '0 32px 72px rgba(0,0,0,.28)' : '0 4px 20px rgba(0,0,0,.12)',
                  }}>

                  {/* Background image */}
                  <div style={{ position:'absolute', inset:0, overflow:'hidden' }}>
                    {city.imageUrl ? (
                      <img
                        src={city.imageUrl} alt={city.name}
                        style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .75s cubic-bezier(.16,1,.3,1)', transform: hot ? 'scale(1.07)' : 'scale(1)', filter:'brightness(.3)' }}
                        onError={e=>e.target.style.display='none'}
                      />
                    ) : (
                      <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#2d0a0e,#1a0608)' }} />
                    )}
                  </div>

                  {/* Gradient overlay */}
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(0,0,0,.88) 0%,rgba(0,0,0,.6) 55%,rgba(0,0,0,.35) 100%)', transition:'opacity .4s', opacity: hot ? .82 : 1 }} />

                  {/* Moroccan pattern */}
                  <div style={{ position:'absolute', inset:0, opacity:.05, backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'80px', pointerEvents:'none' }} />

                  {/* Top accent bar */}

                  {/* Glow orb on hover */}
                  <div style={{ position:'absolute', bottom:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'rgba(193,39,45,.12)', filter:'blur(60px)', transition:'opacity .4s', opacity: hot ? 1 : 0, pointerEvents:'none' }} />

                  {/* Content */}
                  <div style={{ position:'relative', zIndex:2, height:'100%', minHeight:420, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'20px 24px 24px' }}>

                    {/* Top row */}
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {city.region && (
                          <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:99, fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', fontFamily:'Syne,sans-serif', background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.7)', border:'1px solid rgba(255,255,255,.15)' }}>
                            {city.region}
                          </span>
                        )}
                        <div style={{ display:'flex', alignItems:'center', gap:6, color:'rgba(255,255,255,.45)', fontSize:12 }}>
                          <span className="material-icons" style={{ fontSize:13 }}>place</span>
                          {city.country}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div style={{ width:38, height:38, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .3s', background: hot ? '#fff' : 'rgba(255,255,255,.12)', color: hot ? '#1c1917' : '#fff', transform: hot ? 'scale(1.1) rotate(-5deg)' : 'scale(1)' }}>
                        <span className="material-icons" style={{ fontSize:18 }}>north_east</span>
                      </div>
                    </div>

                    {/* Bottom: city name + stats */}
                    <div>
                      {/* Description */}
                      {city.description && (
                        <p style={{ fontSize:12, color:'rgba(255,255,255,.45)', lineHeight:1.7, marginBottom:14, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', transition:'color .3s', ...(hot ? {color:'rgba(255,255,255,.6)'} : {}) }}>
                          {city.description}
                        </p>
                      )}

                      {/* City name */}
                      <div style={{ fontFamily:'Amiri,serif', fontSize:'clamp(32px,4vw,46px)', fontWeight:700, color:'#fff', lineHeight:.95, marginBottom:20, letterSpacing:'-.01em' }}>
                        {city.name}
                      </div>

                      {/* Stats row */}
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, borderTop:'1px solid rgba(255,255,255,.1)', paddingTop:16 }}>
                        {[
                          { icon:'hotel',   val:c.hotels,      label:'Hôtels',      color:'#f0a500' },
                          { icon:'place',   val:c.attractions, label:'Attractions', color:'#3dba7a' },
                          { icon:'stadium', val:c.stades,      label:'Stades',      color:'#e05555' },
                        ].map((s,j) => (
                          <div key={j} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'10px 6px', borderRadius:12, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.08)' }}>
                            <span className="material-icons" style={{ fontSize:16, color:s.color }}>{s.icon}</span>
                            <span style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, color:'#fff', lineHeight:1 }}>{s.val}</span>
                            <span style={{ fontSize:9, color:'rgba(255,255,255,.4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>{s.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

        ) : (

          /* ── LIST VIEW ── */
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filteredCities.map((city,i) => {
              const c = counts[city.id] ?? { hotels:0, stades:0, attractions:0 };
              return (
                <div key={city.id} className="list-card fu" style={{ animationDelay:`${i*.05}s` }}
                     onClick={() => router.push(`/cities/${city.id}`)}>

                  {/* Thumbnail */}
                  <div style={{ width:88, height:88, borderRadius:14, overflow:'hidden', flexShrink:0, background:'#f5f5f4' }}>
                    {city.imageUrl ? (
                      <img src={city.imageUrl} alt={city.name} className="l-img" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
                    ) : (
                      <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#e7e5e4' }}>
                        <span className="material-icons" style={{ fontSize:28, color:'#a8a29e' }}>location_city</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4, flexWrap:'wrap' }}>
                      <span style={{ fontFamily:'Amiri,serif', fontSize:24, fontWeight:400, color:'#1c1917', lineHeight:1.1 }}>{city.name}</span>
                      {city.region && <span className="pill" style={{ background:'#fafaf9', color:'#78716c', borderColor:'#e7e5e4', fontSize:9 }}>{city.region}</span>}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#a8a29e', marginBottom:6 }}>
                      <span className="material-icons" style={{ fontSize:13 }}>place</span>
                      {city.country}
                    </div>
                    {city.description && (
                      <p style={{ fontSize:13, color:'#78716c', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical' }}>{city.description}</p>
                    )}
                  </div>

                  {/* Counts */}
                  <div style={{ display:'flex', alignItems:'center', gap:24, flexShrink:0 }}>
                    {[
                      { icon:'hotel',   val:c.hotels,      label:'Hôtels',  color:'#f0a500' },
                      { icon:'place',   val:c.attractions, label:'Sites',   color:'#006233' },
                      { icon:'stadium', val:c.stades,      label:'Stades',  color:'#C1272D' },
                    ].map((s,j) => (
                      <div key={j} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                        <span className="material-icons" style={{ fontSize:20, color:s.color }}>{s.icon}</span>
                        <span style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:800, color:'#1c1917', lineHeight:1 }}>{s.val}</span>
                        <span style={{ fontSize:9, color:'#a8a29e', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>{s.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Arrow */}
                  <span className="material-icons" style={{ fontSize:22, color:'#d6d3d1', transition:'all .2s', flexShrink:0 }}>arrow_forward</span>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      <style jsx>{`
        @media (min-width: 1024px) { .dec-2030 { display:flex !important; } }
        @media (min-width: 768px)  { .md-show { display:block !important; } }
      `}</style>
    </>
  );
}