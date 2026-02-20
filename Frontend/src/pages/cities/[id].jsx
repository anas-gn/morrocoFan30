import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const API = 'http://localhost:3309/api';

async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) { console.warn(`[safeFetch] HTTP ${res.status} — ${url}`); return null; }
    const text = await res.text();
    if (!text || text === 'null') return null;
    return JSON.parse(text);
  } catch (err) { console.error(`[safeFetch] Error — ${url}`, err); return null; }
}

export default function CityDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [city, setCity]               = useState(null);
  const [hotels, setHotels]           = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [stadiums, setStadiums]       = useState([]);
  const [matches, setMatches]         = useState([]);
  const [images, setImages]           = useState([]);
  const [activeTab, setActiveTab]     = useState('overview');
  const [loading, setLoading]         = useState(true);
  const [lightbox, setLightbox]       = useState(null);

  useEffect(() => {
    if (!id) return;
    const cityId = parseInt(id);
    (async () => {
      setLoading(true);
      try {
        const allCities = await safeFetch(`${API}/acceuil/CityHosts/all`);
        const cityData  = Array.isArray(allCities) ? allCities.find(c=>c.id===cityId) ?? null : null;
        setCity(cityData);

        const attrData = await safeFetch(`${API}/attractions/city/${id}`);
        setAttractions(Array.isArray(attrData) ? attrData : []);

        const allHotels  = await safeFetch(`${API}/hotels/all`);
        setHotels(Array.isArray(allHotels) ? allHotels.filter(h=>h.cityHostId===cityId) : []);

        const allStades  = await safeFetch(`${API}/acceuil/stade/all`);
        const cityStades = Array.isArray(allStades) ? allStades.filter(s=>s.cityId===cityId) : [];
        setStadiums(cityStades);

        if (cityStades.length > 0) {
          const mResults = await Promise.all(cityStades.map(st => safeFetch(`${API}/matches/matches/stade/${st.id}`)));
          setMatches(mResults.flat().filter(Boolean));
        }

        const imgs = await safeFetch(`${API}/cities/images/city/${id}`);
        setImages(Array.isArray(imgs) ? imgs : []);
      } catch (err) {
        console.error('Error loading city:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const getStatus = (s) => ({
    'LIVE':     { label:'Live',      cls:'live'   },
    'started':  { label:'Live',      cls:'live'   },
    'commence': { label:'Live',      cls:'live'   },
    'termine':  { label:'Finished',  cls:'done'   },
    'Finished': { label:'Finished',  cls:'done'   },
    'upcoming': { label:'Upcoming',  cls:'soon'   },
  }[s] || { label:'Scheduled', cls:'soon' });

  const isLive = (s) => ['LIVE','started','commence'].includes(s);

  const TABS = [
    { key:'overview',    label:'Overview',  icon:'widgets',           badge:null              },
    { key:'hotels',      label:'Stay',      icon:'hotel',             badge:hotels.length     },
    { key:'attractions', label:'Discover',  icon:'place',             badge:attractions.length},
    { key:'stadiums',    label:'Stadiums',  icon:'stadium',           badge:stadiums.length   },
    { key:'matches',     label:'Matches',   icon:'calendar_today',    badge:matches.length    },
    { key:'gallery',     label:'Gallery',   icon:'photo_library',     badge:images.length     },
  ];

  /* ── Loading ── */
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#fff' }}>
      <div style={{ width:40, height:40, border:'3px solid #C1272D', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!city) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#fafaf9' }}>
      <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:'#1c1917', marginBottom:16 }}>City not found</div>
      <button onClick={() => router.push('/cities')}
              style={{ padding:'10px 24px', background:'#1c1917', color:'#fff', border:'none', borderRadius:12, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, cursor:'pointer' }}>
        Back to cities
      </button>
    </div>
  );

  return (
    <>
      <Head>
        <title>{city.name} — Host City | MoroccoFan2030</title>
        <meta name="description" content={city.description||`Discover ${city.name}`} />
        <link rel="icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        body { font-family:'Inter',sans-serif; background:#fff; color:#1c1917; -webkit-font-smoothing:antialiased; }
        ::selection { background:#C1272D; color:#fff; }

        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseDot{ 0%,100%{opacity:1} 50%{opacity:.35} }

        .fu  { animation:fadeUp .55s cubic-bezier(.16,1,.3,1) both; }
        .d1  { animation-delay:.08s } .d2 { animation-delay:.16s }
        .d3  { animation-delay:.24s } .d4 { animation-delay:.32s }
        .live-dot { animation:pulseDot 1.4s ease-in-out infinite; }

        .no-scroll::-webkit-scrollbar { display:none; }
        .no-scroll { -ms-overflow-style:none; scrollbar-width:none; }

        /* Pills */
        .pill { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;border:1px solid;font-family:'Syne',sans-serif; }
        .pill-dark  { background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.2); }

        /* Card lift */
        .card-lift { transition:transform .28s ease,box-shadow .28s ease; }
        .card-lift:hover { transform:translateY(-4px); box-shadow:0 20px 40px rgba(0,0,0,.08); }

        /* Image zoom */
        .img-z img { transition:transform .7s cubic-bezier(.16,1,.3,1); }
        .img-z:hover img { transform:scale(1.06); }

        /* Match status */
        .badge-live { background:rgba(193,39,45,.08);color:#C1272D;border:1px solid rgba(193,39,45,.25); }
        .badge-done { background:#fafaf9;color:#78716c;border:1px solid #e7e5e4; }
        .badge-soon { background:rgba(0,98,51,.07);color:#006233;border:1px solid rgba(0,98,51,.2); }

        /* Stat mini cards in overview */
        .ov-stat { background:#fff;border:1px solid #e7e5e4;border-radius:16px;padding:18px;cursor:pointer;transition:all .2s; }
        .ov-stat:hover { border-color:#C1272D;box-shadow:0 8px 28px rgba(193,39,45,.06); }

        /* Hotel / attraction / gallery cards */
        .item-card { background:#fff;border:1px solid #e7e5e4;border-radius:18px;overflow:hidden;transition:border-color .2s,transform .3s,box-shadow .3s;cursor:pointer; }
        .item-card:hover { border-color:#C1272D;transform:translateY(-4px);box-shadow:0 16px 40px rgba(193,39,45,.08); }
        .item-card img { transition:transform .7s cubic-bezier(.16,1,.3,1); }
        .item-card:hover img { transform:scale(1.06); }

        /* Stadium card */
        .stad-card { border-radius:24px;overflow:hidden;position:relative;min-height:380px;cursor:pointer;transition:transform .35s,box-shadow .35s; }
        .stad-card:hover { transform:translateY(-5px);box-shadow:0 28px 64px rgba(0,0,0,.22); }

        /* Match card */
        .match-card { background:#fff;border:1px solid #e7e5e4;border-radius:18px;overflow:hidden;cursor:pointer;transition:border-color .2s,box-shadow .2s; }
        .match-card:hover { border-color:#d6d3d1;box-shadow:0 8px 24px rgba(0,0,0,.06); }

        /* Gallery item */
        .gal-item { position:relative;aspect-ratio:1;border-radius:14px;overflow:hidden;cursor:pointer; }
        .gal-item img { width:100%;height:100%;object-fit:cover;transition:transform .7s cubic-bezier(.16,1,.3,1); }
        .gal-item:hover img { transform:scale(1.1); }
        .gal-item .gal-over { position:absolute;inset:0;background:rgba(0,0,0,0);transition:background .25s;display:flex;align-items:center;justify-content:center; }
        .gal-item:hover .gal-over { background:rgba(0,0,0,.32); }
        .gal-item .gal-eye { opacity:0;transition:opacity .25s;color:#fff;font-size:32px; }
        .gal-item:hover .gal-eye { opacity:1; }
      `}</style>

      <Navbar />

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <header style={{ position:'relative', minHeight:'80vh', display:'flex', flexDirection:'column', justifyContent:'flex-end', overflow:'hidden', background:'#1c1917', paddingTop:96 }}>
        <div style={{ position:'absolute', inset:0 }}>
          {city.imageUrl
            ? <img src={city.imageUrl} alt={city.name} style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.42 }} />
            : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#2d2926,#1c1917)' }} />}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(28,25,23,.98) 0%,rgba(28,25,23,.55) 55%,rgba(28,25,23,.18) 100%)' }} />
          {/* Pattern */}
          <div style={{ position:'absolute', inset:0, opacity:.04, backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'160px', pointerEvents:'none' }} />
        </div>

        <div style={{ position:'relative', zIndex:5, maxWidth:1100, margin:'0 auto', width:'100%', padding:'0 24px 56px' }}>
          {/* Back button */}
          <button onClick={() => router.push('/cities')}
                  className="fu"
                  style={{ display:'inline-flex', alignItems:'center', gap:8, color:'rgba(255,255,255,.6)', background:'none', border:'none', cursor:'pointer', marginBottom:36, fontFamily:'Inter,sans-serif', fontSize:14, fontWeight:500, transition:'color .2s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#fff'}
                  onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.6)'}>
            <div style={{ width:36, height:36, borderRadius:'50%', border:'1px solid rgba(255,255,255,.18)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span className="material-icons" style={{ fontSize:18 }}>arrow_back</span>
            </div>
            Back to cities
          </button>

          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:32, alignItems:'flex-end' }}>
            <div>
              {/* Badges */}
              <div className="fu d1" style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18, flexWrap:'wrap' }}>
                <span className="pill pill-dark">Host City</span>
                {city.region && (
                  <span style={{ display:'flex', alignItems:'center', gap:6, color:'rgba(255,255,255,.5)', fontSize:13 }}>
                    <span className="material-icons" style={{ fontSize:14 }}>place</span>
                    {city.region}
                  </span>
                )}
              </div>

              {/* City name */}
              <h1 className="fu d2" style={{ fontFamily:'Amiri,serif', fontSize:'clamp(60px,10vw,110px)', fontWeight:400, color:'#fff', lineHeight:.95, marginBottom:14 }}>
                {city.name}
              </h1>

              <div className="fu d3" style={{ display:'flex', alignItems:'center', gap:8, color:'rgba(255,255,255,.5)', fontSize:16 }}>
                <span className="material-icons" style={{ fontSize:18 }}>public</span>
                {city.country}
              </div>
            </div>

            {/* Stats right */}
            <div className="fu d4" style={{ display:'flex', gap:32, justifyContent:'flex-start' }}>
              {[
                { val:hotels.length,      label:'HOTELS',      color:'#C1272D' },
                { val:attractions.length, label:'ATTRACTIONS', color:'#f0a500' },
                { val:stadiums.length,    label:'STADIUMS',    color:'#3dba7a' },
              ].map((s,i) => (
                <div key={i}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(40px,7vw,70px)', fontWeight:800, color:s.color, lineHeight:1, marginBottom:4 }}>{s.val}</div>
                  <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.12em', color:'rgba(255,255,255,.4)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ══ STICKY TABS ═════════════════════════════════════════════════════ */}
      <div style={{ position:'sticky', top:0, zIndex:40, background:'rgba(255,255,255,.92)', backdropFilter:'blur(16px)', borderBottom:'1px solid #e7e5e4', boxShadow:'0 1px 12px rgba(0,0,0,.05)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px' }}>
          <nav style={{ display:'flex', gap:4, overflowX:'auto', padding:'10px 0' }} className="no-scroll">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                      style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:999, fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all .2s', border:'none', whiteSpace:'nowrap', background:activeTab===tab.key?'#1c1917':'transparent', color:activeTab===tab.key?'#fff':'#78716c' }}
                      onMouseEnter={e=>{ if(activeTab!==tab.key) e.currentTarget.style.background='#fafaf9'; }}
                      onMouseLeave={e=>{ if(activeTab!==tab.key) e.currentTarget.style.background='transparent'; }}>
                <span className="material-icons" style={{ fontSize:17 }}>{tab.icon}</span>
                {tab.label}
                {tab.badge!==null && tab.badge>0 && (
                  <span style={{ fontSize:10, padding:'1px 7px', borderRadius:999, fontWeight:800, background:activeTab===tab.key?'#fff':'#f0efed', color:activeTab===tab.key?'#1c1917':'#78716c' }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ══ CONTENT ══════════════════════════════════════════════════════════ */}
      <main style={{ maxWidth:1100, margin:'0 auto', padding:'44px 24px 96px', minHeight:'60vh' }}>

        {/* ── OVERVIEW ── */}
        {activeTab==='overview' && (
          <div className="fu">
            <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:16 }}>

              {/* About block */}
              <div style={{ background:'#fafaf9', border:'1px solid #e7e5e4', borderRadius:24, padding:'36px 40px' }}>
                {/* Accent */}
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                  <div style={{ width:3, height:24, background:'linear-gradient(to bottom,#C1272D,#006233)', borderRadius:2 }} />
                  <span style={{ fontFamily:'Syne,sans-serif', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.12em', color:'#a8a29e' }}>About</span>
                </div>
                <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'#1c1917', marginBottom:14 }}>About {city.name}</h2>
                <p style={{ color:'#78716c', fontSize:16, lineHeight:1.82, marginBottom:28 }}>
                  {city.description||`${city.name} is one of the magnificent host cities for the 2030 World Cup. Discover its culture, infrastructure, and warm hospitality.`}
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, paddingTop:24, borderTop:'1px solid #e7e5e4' }}>
                  {[
                    { l:'Region',  v:city.region||'—'            },
                    { l:'Country', v:city.country||'—'           },
                    { l:'Matches', v:`${matches.length} scheduled` },
                  ].map((s,i) => (
                    <div key={i}>
                      <div style={{ fontFamily:'Syne,sans-serif', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'#a8a29e', marginBottom:5 }}>{s.l}</div>
                      <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, color:'#1c1917' }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stat grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
                {[
                  { icon:'hotel',          val:hotels.length,      label:'Hotels',      color:'#f0a500', bg:'rgba(240,165,0,.08)',   tab:'hotels'      },
                  { icon:'place',          val:attractions.length, label:'Attractions', color:'#006233', bg:'rgba(0,98,51,.08)',     tab:'attractions' },
                  { icon:'stadium',        val:stadiums.length,    label:'Stadiums',    color:'#C1272D', bg:'rgba(193,39,45,.08)',   tab:'stadiums'    },
                  { icon:'calendar_today', val:matches.length,     label:'Matches',     color:'#3b82f6', bg:'rgba(59,130,246,.08)', tab:'matches'     },
                ].map((s,i) => (
                  <div key={i} className="ov-stat" onClick={() => setActiveTab(s.tab)}>
                    <div style={{ width:40, height:40, borderRadius:12, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                      <span className="material-icons" style={{ fontSize:22, color:s.color }}>{s.icon}</span>
                    </div>
                    <div style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:800, color:'#1c1917', lineHeight:1, marginBottom:4 }}>{s.val}</div>
                    <div style={{ fontSize:12, color:'#a8a29e', fontWeight:500 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Dark explore card */}
              <div onClick={() => setActiveTab('stadiums')} style={{ background:'linear-gradient(135deg,#2d0a0e,#1a0608)', borderRadius:24, padding:'32px 36px', cursor:'pointer', position:'relative', overflow:'hidden', minHeight:180, display:'flex', flexDirection:'column', justifyContent:'space-between', transition:'transform .3s,box-shadow .3s' }}
                   onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 20px 48px rgba(193,39,45,.2)'; }}
                   onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
                {stadiums[0]?.imageUrl && (
                  <div style={{ position:'absolute', inset:0, backgroundImage:`url(${stadiums[0].imageUrl})`, backgroundSize:'cover', backgroundPosition:'center', opacity:.15 }} />
                )}
                <div style={{ position:'absolute', inset:0, opacity:.06, backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'80px' }} />
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(to right,#C1272D,#006233)' }} />
                <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', zIndex:2 }}>
                  <span className="material-icons" style={{ fontSize:20, color:'#fff' }}>north_east</span>
                </div>
                <div style={{ position:'relative', zIndex:2 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:'#fff', marginBottom:6 }}>Explore stadiums</div>
                  <p style={{ fontSize:13, color:'rgba(255,255,255,.55)' }}>World-class infrastructure for the 2030 World Cup</p>
                </div>
              </div>

              {/* Match schedule card */}
              <div onClick={() => setActiveTab('matches')} style={{ background:'#fafaf9', border:'1px solid #e7e5e4', borderRadius:24, padding:'32px 36px', cursor:'pointer', minHeight:160, display:'flex', flexDirection:'column', justifyContent:'space-between', transition:'all .2s' }}
                   onMouseEnter={e=>{ e.currentTarget.style.borderColor='#C1272D'; e.currentTarget.style.boxShadow='0 8px 28px rgba(193,39,45,.06)'; }}
                   onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e7e5e4'; e.currentTarget.style.boxShadow='none'; }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'#fff', border:'1px solid #e7e5e4', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span className="material-icons" style={{ fontSize:22, color:'#1c1917' }}>calendar_month</span>
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', padding:'4px 12px', background:'#f0efed', color:'#78716c', borderRadius:999, fontFamily:'Syne,sans-serif' }}>Schedule</span>
                </div>
                <div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:'#1c1917', marginBottom:4 }}>Match schedule</div>
                  <p style={{ fontSize:13, color:'#a8a29e' }}>Complete calendar of matches in {city.name}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── HOTELS ── */}
        {activeTab==='hotels' && (
          <div className="fu">
            <SectionHeader title={`Stay in ${city.name}`} sub="Selected accommodations for your comfort" />
            {hotels.length===0 ? <EmptyState icon="hotel" msg="No accommodations available" /> : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
                {hotels.map((h,i) => (
                  <div key={h.id} className="item-card fu" style={{ animationDelay:`${i*.07}s` }} onClick={() => router.push(`/hotels/${h.id}`)}>
                    <div className="img-z" style={{ position:'relative', height:200, background:'#f5f5f4', overflow:'hidden' }}>
                      <img src={h.imageUrl||'/images/hotel-placeholder.jpg'} alt={h.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.4),transparent)' }} />
                    </div>
                    <div style={{ padding:'18px 20px' }}>
                      <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:800, color:'#1c1917', marginBottom:8 }}>{h.name}</div>
                      {h.address && (
                        <div style={{ display:'flex', alignItems:'flex-start', gap:6, fontSize:12, color:'#78716c', marginBottom:8 }}>
                          <span className="material-icons" style={{ fontSize:14, marginTop:1, flexShrink:0 }}>place</span>
                          <span style={{ overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{h.address}</span>
                        </div>
                      )}
                      {h.description && <p style={{ fontSize:12, color:'#a8a29e', lineHeight:1.7, marginBottom:12, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{h.description}</p>}
                      <div style={{ paddingTop:12, borderTop:'1px solid #f5f5f4', display:'flex', flexDirection:'column', gap:6 }}>
                        {h.phone && <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#57534e' }}><span className="material-icons" style={{ fontSize:14 }}>phone</span>{h.phone}</div>}
                        {h.email && <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#57534e' }}><span className="material-icons" style={{ fontSize:14 }}>mail</span><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.email}</span></div>}
                        {h.urlReservation && (
                          <a href={h.urlReservation} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
                             style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, color:'#1c1917', textDecoration:'none', fontFamily:'Syne,sans-serif', marginTop:4 }}>
                            <span className="material-icons" style={{ fontSize:14 }}>link</span>Book now
                            <span className="material-icons" style={{ fontSize:14 }}>north_east</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ATTRACTIONS ── */}
        {activeTab==='attractions' && (
          <div className="fu">
            <SectionHeader title={`Discover ${city.name}`} sub="Cultural, natural, and tourist sites" />
            {attractions.length===0 ? <EmptyState icon="place" msg="No attractions available" /> : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16 }}>
                {attractions.map((a,i) => (
                  <div key={a.id} className="item-card fu" style={{ animationDelay:`${i*.07}s`, display:'flex' }} onClick={() => router.push(`/attractions/${a.id}`)}>
                    <div className="img-z" style={{ width:140, flexShrink:0, position:'relative', background:'#f5f5f4', overflow:'hidden' }}>
                      <img src={a.imageUrl||'/images/attraction-placeholder.jpg'} alt={a.name} style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }} onError={e=>e.target.style.display='none'} />
                      {a.type && (
                        <span style={{ position:'absolute', top:10, left:10, padding:'3px 10px', background:'rgba(255,255,255,.9)', backdropFilter:'blur(6px)', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', fontFamily:'Syne,sans-serif', color:'#1c1917', borderRadius:999 }}>
                          {a.type}
                        </span>
                      )}
                    </div>
                    <div style={{ flex:1, padding:'16px 18px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                      <div>
                        <div style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:800, color:'#1c1917', marginBottom:6 }}>{a.name}</div>
                        {a.description && <p style={{ fontSize:12, color:'#78716c', lineHeight:1.7, marginBottom:10, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical' }}>{a.description}</p>}
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:5, fontSize:12, color:'#78716c' }}>
                        {a.address && <div style={{ display:'flex', gap:6 }}><span className="material-icons" style={{ fontSize:13, flexShrink:0 }}>place</span>{a.address}</div>}
                        {a.houreOfOpening && a.houreOfClosing && <div style={{ display:'flex', gap:6 }}><span className="material-icons" style={{ fontSize:13 }}>schedule</span>{a.houreOfOpening} — {a.houreOfClosing}</div>}
                        {a.priceProxim>0 && <div style={{ display:'flex', gap:6 }}><span className="material-icons" style={{ fontSize:13 }}>payments</span><strong style={{ color:'#1c1917' }}>{Number(a.priceProxim).toFixed(0)} MAD</strong></div>}
                        {a.latitude && a.longitude && (
                          <a href={`https://www.google.com/maps?q=${a.latitude},${a.longitude}`} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
                             style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, color:'#1c1917', textDecoration:'none', fontFamily:'Syne,sans-serif', marginTop:4 }}>
                            <span className="material-icons" style={{ fontSize:13 }}>map</span>View on map
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STADIUMS ── */}
        {activeTab==='stadiums' && (
          <div className="fu">
            <SectionHeader title={`${city.name} Stadiums`} sub="World-class sports infrastructure" />
            {stadiums.length===0 ? <EmptyState icon="stadium" msg="No stadiums available" /> : (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {stadiums.map((st,i) => (
                  <div key={st.id} className="stad-card fu" style={{ animationDelay:`${i*.1}s` }} onClick={() => router.push(`/stade/${st.id}`)}>
                    {/* BG */}
                    <div style={{ position:'absolute', inset:0, backgroundImage:`url(${st.imageUrl||'/images/stadium-placeholder.jpg'})`, backgroundSize:'cover', backgroundPosition:'center', transition:'transform .7s', filter:'brightness(.32)' }} className="stad-bg" />
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(0,0,0,.88) 0%,rgba(0,0,0,.6) 55%,rgba(0,0,0,.38) 100%)' }} />
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(to right,#C1272D,#006233)' }} />
                    {/* Pattern */}
                    <div style={{ position:'absolute', inset:0, opacity:.05, backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'80px' }} />

                    <div style={{ position:'relative', zIndex:2, display:'grid', gridTemplateColumns:'1fr', minHeight:380, padding:'36px 40px' }}>
                      <div style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.12em', color:'rgba(255,255,255,.55)', marginBottom:16, fontFamily:'Syne,sans-serif' }}>
                          <span className="material-icons" style={{ fontSize:14 }}>stadium</span>
                          Infrastructure — {city.name}
                        </div>
                        <div style={{ fontFamily:'Amiri,serif', fontSize:'clamp(28px,4vw,48px)', fontWeight:700, color:'#fff', lineHeight:1.1, marginBottom:12 }}>{st.name}</div>
                        {st.description && <p style={{ color:'rgba(255,255,255,.65)', fontSize:15, lineHeight:1.8, marginBottom:24, maxWidth:520 }}>{st.description}</p>}
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,max-content)', gap:'0 40px', borderTop:'1px solid rgba(255,255,255,.15)', paddingTop:20, marginBottom:24 }}>
                          {st.capacity && (
                            <div>
                              <div style={{ fontFamily:'Syne,sans-serif', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.12em', color:'rgba(255,255,255,.45)', marginBottom:4 }}>Capacity</div>
                              <div style={{ fontFamily:'Syne,sans-serif', fontSize:36, fontWeight:800, color:'#fff' }}>{Number(st.capacity).toLocaleString()}</div>
                            </div>
                          )}
                          {st.dateOfConstruction && (
                            <div>
                              <div style={{ fontFamily:'Syne,sans-serif', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.12em', color:'rgba(255,255,255,.45)', marginBottom:4 }}>Built</div>
                              <div style={{ fontFamily:'Syne,sans-serif', fontSize:36, fontWeight:800, color:'#fff' }}>{new Date(st.dateOfConstruction).getFullYear()}</div>
                            </div>
                          )}
                        </div>
                        {st.adresse && (
                          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'rgba(255,255,255,.55)', marginBottom:20 }}>
                            <span className="material-icons" style={{ fontSize:15 }}>place</span>{st.adresse}
                          </div>
                        )}
                        <button onClick={e=>{ e.stopPropagation(); router.push(`/stade/${st.id}`); }}
                                style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 22px', background:'#fff', color:'#1c1917', borderRadius:12, border:'none', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:13, cursor:'pointer', width:'max-content', transition:'all .2s' }}
                                onMouseEnter={e=>e.currentTarget.style.background='#f5f5f4'}
                                onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                          <span className="material-icons" style={{ fontSize:16 }}>north_east</span>View stadium
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MATCHES ── */}
        {activeTab==='matches' && (
          <div className="fu">
            <SectionHeader title={`Matches in ${city.name}`} sub="Complete schedule of matches in this city" />
            {matches.length===0 ? <EmptyState icon="calendar_today" msg="No matches scheduled" /> : (
              <div style={{ maxWidth:760, margin:'0 auto', display:'flex', flexDirection:'column', gap:10 }}>
                {[...matches].sort((a,b)=>new Date(a.dateOfMatch)-new Date(b.dateOfMatch)).map((m,i) => {
                  const status = getStatus(m.statut);
                  const live   = isLive(m.statut);
                  const t1     = m.matchTeams?.[0], t2 = m.matchTeams?.[1];
                  const date   = new Date(m.dateOfMatch);
                  return (
                    <div key={m.id} className="match-card fu" style={{ animationDelay:`${i*.05}s` }} onClick={() => router.push(`/match/${m.id}`)}>
                      {/* Match header */}
                      <div style={{ background:'#fafaf9', borderBottom:'1px solid #f0efed', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
                          <span style={{ fontWeight:600, color:'#57534e' }}>{date.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
                          <span style={{ color:'#d6d3d1' }}>•</span>
                          <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, color:'#1c1917' }}>{date.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:999, fontSize:9, fontWeight:700, fontFamily:'Syne,sans-serif', textTransform:'uppercase', letterSpacing:'.07em' }} className={`badge-${status.cls}`}>
                          {live && <span className="live-dot" style={{ width:5, height:5, borderRadius:'50%', background:'#C1272D', display:'inline-block' }} />}
                          {status.label}
                        </div>
                      </div>

                      {/* Teams */}
                      <div style={{ padding:'16px 20px' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                          {/* T1 */}
                          <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
                            <img src={t1?.imageUrl||''} alt={t1?.teamName} style={{ width:48, height:48, borderRadius:'50%', objectFit:'cover', border:'2px solid #f0efed', flexShrink:0 }} onError={e=>e.target.style.display='none'} />
                            <div style={{ minWidth:0 }}>
                              <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:800, color:'#1c1917', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t1?.teamName||'TBD'}</div>
                              {t1?.country && <div style={{ fontSize:11, color:'#a8a29e' }}>{t1.country}</div>}
                            </div>
                          </div>
                          {/* Score / VS */}
                          <div style={{ textAlign:'center', flexShrink:0, padding:'0 12px' }}>
                            {m.statut!=='upcoming' ? (
                              <div style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:live?'#C1272D':'#1c1917', lineHeight:1 }}>
                                {t1?.goals??0} – {t2?.goals??0}
                              </div>
                            ) : (
                              <div style={{ fontFamily:'Amiri,serif', fontSize:22, color:'#d6d3d1', fontStyle:'italic' }}>vs</div>
                            )}
                            {m.type && <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#a8a29e', marginTop:3 }}>{m.type}</div>}
                          </div>
                          {/* T2 */}
                          <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0, flexDirection:'row-reverse' }}>
                            <img src={t2?.imageUrl||''} alt={t2?.teamName} style={{ width:48, height:48, borderRadius:'50%', objectFit:'cover', border:'2px solid #f0efed', flexShrink:0 }} onError={e=>e.target.style.display='none'} />
                            <div style={{ minWidth:0, textAlign:'right' }}>
                              <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:800, color:'#1c1917', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t2?.teamName||'TBD'}</div>
                              {t2?.country && <div style={{ fontSize:11, color:'#a8a29e' }}>{t2.country}</div>}
                            </div>
                          </div>
                        </div>
                        {/* Stadium */}
                        {m.stadeName && (
                          <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid #f5f5f4', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#78716c' }}>
                              <span className="material-icons" style={{ fontSize:14, color:'#a8a29e' }}>stadium</span>
                              {m.stadeName}
                            </div>
                            <span className="material-icons" style={{ fontSize:18, color:'#d6d3d1' }}>arrow_forward</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── GALLERY ── */}
        {activeTab==='gallery' && (
          <div className="fu">
            <SectionHeader title={`${city.name} Gallery`} sub="Discover the city in images" />
            {images.length===0 ? <EmptyState icon="photo_library" msg="No images available" /> : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
                  {images.map((img,i) => (
                    <div key={img.id} className="gal-item fu" style={{ animationDelay:`${i*.04}s` }} onClick={() => setLightbox(img.imageUrl)}>
                      <img src={img.imageUrl} alt={`${city.name} ${i+1}`} />
                      <div className="gal-over"><span className="material-icons gal-eye">visibility</span></div>
                    </div>
                  ))}
                </div>

                {lightbox && (
                  <div style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,.92)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
                       onClick={() => setLightbox(null)}>
                    <button onClick={() => setLightbox(null)}
                            style={{ position:'absolute', top:20, right:20, width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,.1)', border:'none', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'background .2s' }}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.2)'}
                            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.1)'}>
                      <span className="material-icons" style={{ fontSize:22 }}>close</span>
                    </button>
                    <img src={lightbox} alt="Full view" style={{ maxWidth:'100%', maxHeight:'90vh', borderRadius:12, boxShadow:'0 40px 100px rgba(0,0,0,.6)' }} onClick={e=>e.stopPropagation()} />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

/* ── Sub-components ── */
function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
        <div style={{ width:3, height:20, background:'linear-gradient(to bottom,#C1272D,#006233)', borderRadius:2 }} />
        <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(22px,3vw,30px)', fontWeight:800, color:'#1c1917', lineHeight:1.1 }}>{title}</h2>
      </div>
      <p style={{ fontSize:14, color:'#a8a29e', marginLeft:13 }}>{sub}</p>
    </div>
  );
}

function EmptyState({ icon, msg }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'72px 0', background:'#fafaf9', border:'1px solid #e7e5e4', borderRadius:20 }}>
      <div style={{ width:72, height:72, borderRadius:'50%', background:'#fff', border:'1px solid #e7e5e4', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
        <span className="material-icons" style={{ fontSize:32, color:'#d6d3d1' }}>{icon}</span>
      </div>
      <p style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'.1em' }}>{msg}</p>
    </div>
  );
}