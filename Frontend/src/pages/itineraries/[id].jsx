import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const API = 'https://anas-gana1-fandb-backend.hf.space/api';

async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text === 'null') return null;
    return JSON.parse(text);
  } catch { return null; }
}

export default function ItineraryDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [itinerary, setItinerary]                       = useState(null);
  const [itineraryAttractions, setItineraryAttractions] = useState([]);
  const [allAttractions, setAllAttractions]             = useState([]);
  const [loading, setLoading]                           = useState(true);
  const [showAddModal, setShowAddModal]                 = useState(false);
  const [searchAdd, setSearchAdd]                       = useState('');
  const [filterType, setFilterType]                     = useState('all');
  const [notification, setNotification]                 = useState(null);
  const [editingDate, setEditingDate]                   = useState(false);
  const [newDate, setNewDate]                           = useState('');

  const fetchItinerary = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [itData, attData] = await Promise.all([
        safeFetch(`${API}/itineraries/${id}`),
        safeFetch(`${API}/itineraries/${id}/attractions`)
      ]);
      setItinerary(itData);
      setItineraryAttractions(Array.isArray(attData) ? attData : attData?.content || attData?.attractions || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchAllAttractions = async () => {
    try {
      const citiesData = await safeFetch(`${API}/acceuil/CityHosts/all`);
      if (!Array.isArray(citiesData)) return;
      const all = [];
      for (const city of citiesData) {
        const cityAttractions = await safeFetch(`${API}/attractions/city/${city.id}`);
        if (Array.isArray(cityAttractions))
          cityAttractions.forEach(attr => all.push({ ...attr, cityName: city.name }));
      }
      setAllAttractions(all);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchItinerary(); }, [id]);
  useEffect(() => { if (showAddModal && allAttractions.length === 0) fetchAllAttractions(); }, [showAddModal]);

  const updateDate = async () => {
    if (!newDate) return;
    try {
      const res = await fetch(`${API}/itineraries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...itinerary, dateToGo: newDate })
      });
      if (res.ok) { setItinerary({ ...itinerary, dateToGo: newDate }); setEditingDate(false); showNotif('success', 'Date updated!'); }
      else showNotif('error', 'Could not update date.');
    } catch { showNotif('error', 'Could not update date.'); }
  };

  const addAttraction = async (attractionId) => {
    try {
      const res = await fetch(`${API}/itineraries/${id}/add-attraction/${attractionId}`, { method: 'POST' });
      const success = await res.json();
      if (success === true) { showNotif('success', 'Attraction added!'); await fetchItinerary(); }
      else showNotif('error', 'Already in itinerary.');
    } catch { showNotif('error', 'Server error.'); }
  };

  const removeAttraction = async (attractionId) => {
    try {
      const res = await fetch(`${API}/itineraries/${id}/remove-attraction/${attractionId}`, { method: 'DELETE' });
      const success = await res.json();
      if (success === true) { showNotif('success', 'Removed.'); await fetchItinerary(); }
      else showNotif('error', 'Could not remove attraction.');
    } catch { showNotif('error', 'Server error.'); }
  };

  const showNotif = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not set';
  const formatTime = t => t ? t.substring(0, 5) : '';

  const attractionIds = itineraryAttractions.map(a => a.id);
  const filteredForAdd = allAttractions.filter(a => {
    const notIn = !attractionIds.includes(a.id);
    const matchSearch = !searchAdd.trim() || a.name?.toLowerCase().includes(searchAdd.toLowerCase()) || a.cityName?.toLowerCase().includes(searchAdd.toLowerCase());
    const matchType = filterType === 'all' || a.type === filterType;
    return notIn && matchSearch && matchType;
  });
  const uniqueTypes = ['all', ...new Set(allAttractions.map(a => a.type).filter(Boolean))];

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div style={{ width:48, height:48, border:'3px solid #C1272D', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!itinerary) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div style={{ width:64, height:64, borderRadius:'50%', background:'#f5f5f4', border:'1px solid #e7e5e4', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
        <span className="material-icons" style={{ fontSize:28, color:'#a8a29e' }}>map</span>
      </div>
      <div style={{ fontSize:20, fontWeight:700, color:'#57534e', marginBottom:8, fontFamily:'Syne,sans-serif' }}>Itinerary not found</div>
      <button onClick={() => router.push('/itineraries')}
        style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 24px', background:'linear-gradient(to right,#2d0a0e,#1a0608)', color:'#fff', border:'none', borderRadius:12, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, cursor:'pointer' }}>
        <span className="material-icons" style={{ fontSize:16 }}>arrow_back</span>
        Back to Itineraries
      </button>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .syne{font-family:'Syne',sans-serif}
      `}</style>
    </div>
  );

  return (
    <>
      <Head>
        <title>{itinerary.title} | MoroccoFan2030</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=Amiri:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
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
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }

        .fu { animation: fadeUp .5s ease-out forwards; opacity: 0; }
        .fi { animation: fadeIn .4s ease-out forwards; opacity: 0; }
        .d1 { animation-delay:.08s } .d2 { animation-delay:.16s }
        .d3 { animation-delay:.24s } .d4 { animation-delay:.32s }

        /* ── Pills — identical to Matches page ── */
        .pill { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:99px; font-size:10px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; border:1px solid; }
        .pill-host    { background:rgba(193,39,45,.08);  color:#C1272D; border-color:rgba(193,39,45,.25);  }
        .pill-gold    { background:rgba(240,165,0,.1);   color:#b45309; border-color:rgba(240,165,0,.3);   }
        .pill-green   { background:rgba(0,98,51,.1);     color:#006233; border-color:rgba(0,98,51,.3);     }
        .pill-default { background:rgba(0,0,0,.04);      color:#a8a29e; border-color:rgba(0,0,0,.08);      }

        .nosb::-webkit-scrollbar { display:none; }
        .nosb { -ms-overflow-style:none; scrollbar-width:none; }

        /* ── Filter active — Matches style ── */
        .filter-active { background:linear-gradient(to right,#2d0a0e,#1a0608)!important; color:#fff!important; border-color:transparent!important; }

        /* ── Stat cards — same as Matches ── */
        .stat-card { background:#fff; border:1px solid #e7e5e4; border-radius:16px; padding:20px 16px; text-align:center; transition:border-color .2s,box-shadow .2s; }
        .stat-card:hover { border-color:#C1272D; box-shadow:0 4px 20px rgba(193,39,45,.08); }
        .stat-val { font-size:36px; font-weight:800; line-height:1; font-family:'Syne',sans-serif; }
        .stat-lbl { font-size:11px; color:#a8a29e; text-transform:uppercase; letter-spacing:.08em; margin-top:6px; font-weight:500; }

        /* ── Attraction card — match-card pattern ── */
        .attr-card {
          background:#fff; border:1px solid #e7e5e4; border-radius:16px;
          overflow:hidden; transition:border-color .2s,transform .2s,box-shadow .2s;
          border-left:3px solid transparent;
        }
        .attr-card:hover {
          border-color:#C1272D; border-left-color:#C1272D;
          transform:translateY(-2px); box-shadow:0 8px 24px rgba(193,39,45,.09);
        }
        .attr-card .img-zoom img { transition:transform .7s cubic-bezier(.16,1,.3,1); }
        .attr-card:hover .img-zoom img { transform:scale(1.07); }

        /* ── Sidebar card ── */
        .side-card { background:#fff; border:1px solid #e7e5e4; border-radius:16px; overflow:hidden; }

        /* ── Toast ── */
        .toast { animation: slideIn .3s ease-out; }

        /* ── Skeleton ── */
        .skeleton { background:linear-gradient(90deg,#e7e5e4 25%,#f5f5f4 50%,#e7e5e4 75%); background-size:600px 100%; animation:shimmer 1.4s infinite; border-radius:8px; }

        /* ── Modal backdrop ── */
        .modal-backdrop { animation: fadeIn .2s ease-out; }

        input:focus { outline:none; }

        @media(max-width:640px){ .stat-val{font-size:28px;} }
      `}</style>

      <Navbar />

      {/* ── TOAST ── */}
      {notification && (
        <div className="toast fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold"
          style={{ background: notification.type === 'success' ? 'linear-gradient(to right,#2d0a0e,#1a0608)' : '#C1272D', fontFamily:'Syne,sans-serif' }}>
          <span className="material-icons" style={{ fontSize:18 }}>
            {notification.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {notification.message}
        </div>
      )}

      {/* ══ HERO — same structure as Matches ══ */}
      <header className="relative overflow-hidden" style={{ paddingTop:80, minHeight:440 }}>
        <div className="absolute inset-0">
          <img src="/images/itin.webp" alt="" className="w-full h-full object-cover"
            onError={e => e.target.style.display = 'none'} />
          <div className="absolute inset-0"
            style={{ background:'linear-gradient(135deg,rgba(45,10,14,.93) 0%,rgba(26,6,8,.86) 55%,rgba(0,98,51,.22) 100%)' }} />
          <div className="absolute inset-0 opacity-[.07] pointer-events-none"
            style={{ backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'180px' }} />
        </div>

        {/* Glows */}
        <div className="absolute top-16 left-8 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background:'rgba(193,39,45,.14)' }} />
        <div className="absolute bottom-0 right-8 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background:'rgba(0,98,51,.14)' }} />

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          {/* Back + Badge */}
          <div className="fu mb-8 flex items-center gap-4">
            <button onClick={() => router.push('/itineraries')}
              style={{ display:'inline-flex', alignItems:'center', gap:6, color:'rgba(255,255,255,.55)', background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:600, transition:'color .2s' }}
              onMouseOver={e => e.currentTarget.style.color = '#fff'}
              onMouseOut={e  => e.currentTarget.style.color = 'rgba(255,255,255,.55)'}>
              <span className="material-icons" style={{ fontSize:16 }}>arrow_back</span>
              Itineraries
            </button>
            <span style={{ color:'rgba(255,255,255,.2)', fontSize:14 }}>/</span>
            <span className="pill pill-host" style={{ fontSize:11, padding:'5px 14px' }}>
              <span className="material-icons" style={{ fontSize:12 }}>map</span>
              Travel Itinerary
            </span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            {/* Title */}
            <div className="fu d1">
              <h1 className="syne" style={{ fontSize:'clamp(36px,6vw,76px)', fontWeight:800, lineHeight:1, letterSpacing:'-.02em', color:'#fff', marginBottom:12 }}>
                {itinerary.title?.split(' ').slice(0, -1).join(' ') || itinerary.title}<br />
                <span className="serif italic" style={{ color:'#C1272D' }}>
                  {itinerary.title?.split(' ').slice(-1)[0] || ''}
                </span>
              </h1>
              {itinerary.dateToGo && (
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:14, color:'rgba(255,255,255,.5)', fontWeight:400 }}>
                  <span className="material-icons" style={{ fontSize:14 }}>calendar_today</span>
                  {formatDate(itinerary.dateToGo)}
                </div>
              )}
            </div>

            {/* Hero stat numbers */}
            <div className="fu d2 flex gap-8 md:gap-12">
              {[
                { v: itineraryAttractions.length, l:'Attractions', c:'#C1272D' },
                { v: '🇲🇦',                       l:'Morocco',     c:'#f0a500' },
                { v: new Date(itinerary.dateToGo || Date.now()).getFullYear(), l:'Year', c:'#3dba7a' },
              ].map(({ v, l, c }) => (
                <div key={l} style={{ textAlign:'center' }}>
                  <div className="syne" style={{ fontSize: typeof v === 'string' ? 36 : 44, fontWeight:800, color:c, lineHeight:1 }}>{v}</div>
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
            { v: itineraryAttractions.length,                                                            l:'Stops',       c:'#C1272D' },
            { v: itineraryAttractions.filter(a => a.priceProxim === 0).length,                          l:'Free Entry',  c:'#006233' },
            { v: itineraryAttractions.filter(a => a.priceProxim > 0).reduce((s,a)=>s+a.priceProxim,0), l:'Total MAD',   c:'#b45309' },
            { v: new Set(itineraryAttractions.map(a=>a.type).filter(Boolean)).size,                      l:'Categories',  c:'#7c3aed' },
          ].map(({ v, l, c }) => (
            <div key={l} className="stat-card fu d3">
              <div className="stat-val" style={{ color:c }}>{v}</div>
              <div className="stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ MAIN ══ */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6" style={{ minHeight:'50vh' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:24, alignItems:'start' }}
          className="grid-cols-1 lg:grid-cols-[1fr_320px]">

          {/* ── LEFT: Attractions ── */}
          <div>
            {/* Section header — calendar date-hdr style */}
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }} className="fu">
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 16px', borderRadius:10, background:'linear-gradient(to right,#2d0a0e,#1a0608)', fontSize:13, fontWeight:700, color:'#fff', fontFamily:'Syne,sans-serif', textTransform:'uppercase', letterSpacing:'.05em' }}>
                <span className="material-icons" style={{ fontSize:14, color:'#C1272D' }}>place</span>
                My Attractions
              </div>
              <span style={{ fontSize:11, fontWeight:600, color:'#a8a29e', background:'#f5f5f4', padding:'3px 10px', borderRadius:99 }}>
                {itineraryAttractions.length}
              </span>
              <div style={{ flex:1, height:1, background:'linear-gradient(to right,rgba(193,39,45,.2),transparent)' }} />
              <button
                onClick={() => setShowAddModal(true)}
                style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', background:'linear-gradient(to right,#2d0a0e,#1a0608)', color:'#fff', border:'none', borderRadius:10, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:12, cursor:'pointer', textTransform:'uppercase', letterSpacing:'.04em' }}>
                <span className="material-icons" style={{ fontSize:14 }}>add</span>
                Add
              </button>
            </div>

            {/* Empty state */}
            {itineraryAttractions.length === 0 && (
              <div style={{ textAlign:'center', padding:'80px 24px', background:'#fff', borderRadius:16, border:'1px solid #e7e5e4' }} className="fu">
                <div style={{ width:64, height:64, borderRadius:'50%', background:'#f5f5f4', border:'1px solid #e7e5e4', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                  <span className="material-icons" style={{ fontSize:28, color:'#a8a29e' }}>add_location_alt</span>
                </div>
                <div className="syne" style={{ fontSize:18, fontWeight:700, color:'#57534e', marginBottom:8 }}>No attractions yet</div>
                <div style={{ fontSize:13, color:'#a8a29e', marginBottom:24 }}>Start building your itinerary by adding amazing places to visit.</div>
                <button onClick={() => setShowAddModal(true)}
                  style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 24px', background:'linear-gradient(to right,#2d0a0e,#1a0608)', color:'#fff', border:'none', borderRadius:12, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                  <span className="material-icons" style={{ fontSize:16 }}>add</span>
                  Browse Attractions
                </button>
              </div>
            )}

            {/* Attractions list — match-card structure */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {itineraryAttractions.map((attraction, index) => (
                <div key={attraction.id} className="attr-card fu" style={{ animationDelay:`${index * .05}s` }}>

                  {/* Dark top strip — identical to match-card */}
                  <div style={{ background:'linear-gradient(to right,#2d0a0e,#1a0608)', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      {/* Step number badge */}
                      <div style={{ width:22, height:22, borderRadius:'50%', background:'#C1272D', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'#fff', fontFamily:'Syne,sans-serif', flexShrink:0 }}>
                        {index + 1}
                      </div>
                      <span className="material-icons" style={{ fontSize:13, color:'#C1272D' }}>place</span>
                      <span className="syne" style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.7)', textTransform:'uppercase', letterSpacing:'.06em' }}>
                        {attraction.type || 'Attraction'}
                      </span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      {attraction.priceProxim === 0
                        ? <span className="pill pill-green" style={{ fontSize:9 }}>Free</span>
                        : attraction.priceProxim > 0
                          ? <span className="pill pill-gold" style={{ fontSize:9 }}>{attraction.priceProxim} MAD</span>
                          : null
                      }
                      {/* Remove btn */}
                      <button onClick={() => removeAttraction(attraction.id)}
                        style={{ width:26, height:26, borderRadius:'50%', background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,.4)', transition:'all .2s' }}
                        onMouseOver={e => { e.currentTarget.style.background='rgba(220,38,38,.55)'; e.currentTarget.style.color='#fff'; }}
                        onMouseOut={e  => { e.currentTarget.style.background='rgba(255,255,255,.07)'; e.currentTarget.style.color='rgba(255,255,255,.4)'; }}>
                        <span className="material-icons" style={{ fontSize:13 }}>delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding:'16px', display:'flex', alignItems:'center', gap:14 }}>
                    {/* Image */}
                    <div className="img-zoom" style={{ width:90, height:90, borderRadius:12, overflow:'hidden', background:'#f5f5f4', flexShrink:0 }}>
                      <img src={attraction.imageUrl || '/images/attraction-placeholder.jpg'}
                        alt={attraction.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                        onError={e => e.target.src = '/images/attraction-placeholder.jpg'} />
                    </div>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div className="syne" style={{ fontSize:16, fontWeight:800, color:'#1c1917', marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {attraction.name}
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:8, marginBottom:8 }}>
                        {attraction.address && (
                          <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#78716c' }}>
                            <span className="material-icons" style={{ fontSize:13, color:'#C1272D' }}>location_on</span>
                            <span style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:200 }}>{attraction.address}</span>
                          </div>
                        )}
                      </div>
                      {/* Bottom — same venue row pattern */}
                      <div style={{ paddingTop:8, borderTop:'1px solid #f5f5f4', display:'flex', alignItems:'center', gap:16 }}>
                        {attraction.houreOfOpening && attraction.houreOfClosing && (
                          <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#78716c' }}>
                            <span className="material-icons" style={{ fontSize:12, color:'#C1272D' }}>schedule</span>
                            {formatTime(attraction.houreOfOpening)} – {formatTime(attraction.houreOfClosing)}
                          </div>
                        )}
                        <button onClick={() => router.push(`/attractions/${attraction.id}`)}
                          style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:700, color:'#C1272D', background:'none', border:'none', cursor:'pointer', marginLeft:'auto' }}>
                          View details
                          <span className="material-icons" style={{ fontSize:12 }}>arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <div style={{ position:'sticky', top:100, display:'flex', flexDirection:'column', gap:16 }} className="fu d2 hidden lg:flex">

            {/* Trip Details card — match-card style */}
            <div className="side-card">
              {/* Dark top strip */}
              <div style={{ background:'linear-gradient(to right,#2d0a0e,#1a0608)', padding:'12px 16px', display:'flex', alignItems:'center', gap:8 }}>
                <span className="material-icons" style={{ fontSize:14, color:'#C1272D' }}>luggage</span>
                <span className="syne" style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.7)', textTransform:'uppercase', letterSpacing:'.06em' }}>Trip Details</span>
              </div>
              {/* Red→green accent stripe */}
              <div style={{ height:3, background:'linear-gradient(to right,#C1272D,#006233)' }} />

              <div style={{ padding:'20px 18px' }}>
                <div className="syne" style={{ fontSize:18, fontWeight:800, color:'#1c1917', marginBottom:16 }}>{itinerary.title}</div>

                {/* Attractions count */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom:12, borderBottom:'1px solid #f5f5f4', marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#78716c' }}>
                    <span className="material-icons" style={{ fontSize:13, color:'#C1272D' }}>place</span>
                    Attractions
                  </div>
                  <div className="syne" style={{ fontSize:20, fontWeight:800, color:'#C1272D' }}>{itineraryAttractions.length}</div>
                </div>

                {/* Date — editable */}
                <div style={{ paddingBottom:12, borderBottom:'1px solid #f5f5f4', marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#78716c' }}>
                      <span className="material-icons" style={{ fontSize:13, color:'#C1272D' }}>calendar_today</span>
                      Travel Date
                    </div>
                    <button
                      onClick={() => { setEditingDate(!editingDate); setNewDate(itinerary.dateToGo || ''); }}
                      style={{ display:'flex', alignItems:'center', gap:3, fontSize:11, fontWeight:700, color:'#a8a29e', background:'none', border:'none', cursor:'pointer' }}>
                      <span className="material-icons" style={{ fontSize:12 }}>{editingDate ? 'close' : 'edit'}</span>
                      {editingDate ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  {editingDate ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                        style={{ width:'100%', padding:'8px 12px', border:'2px solid #e7e5e4', borderRadius:10, fontSize:13, color:'#1c1917', background:'#fafaf9', transition:'border-color .2s' }}
                        onFocus={e => e.target.style.borderColor='#C1272D'}
                        onBlur={e  => e.target.style.borderColor='#e7e5e4'} />
                      <button onClick={updateDate}
                        style={{ width:'100%', padding:'9px', background:'linear-gradient(to right,#2d0a0e,#1a0608)', color:'#fff', border:'none', borderRadius:10, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:12, cursor:'pointer', textTransform:'uppercase', letterSpacing:'.04em' }}>
                        Save Date
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize:13, fontWeight:600, color:'#1c1917' }}>
                      {itinerary.dateToGo ? formatDate(itinerary.dateToGo) : <span style={{ color:'#a8a29e', fontStyle:'italic', fontWeight:400 }}>Not set</span>}
                    </div>
                  )}
                </div>

                {/* Description */}
                {itinerary.description && (
                  <p style={{ fontSize:12, color:'#78716c', lineHeight:1.6, marginBottom:14, paddingBottom:14, borderBottom:'1px solid #f5f5f4' }}>
                    {itinerary.description}
                  </p>
                )}

                {/* CTA */}
                <button onClick={() => setShowAddModal(true)}
                  style={{ width:'100%', padding:'11px', background:'linear-gradient(to right,#2d0a0e,#1a0608)', color:'#fff', border:'none', borderRadius:12, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:12, cursor:'pointer', textTransform:'uppercase', letterSpacing:'.05em', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  <span className="material-icons" style={{ fontSize:15 }}>add</span>
                  Add Attraction
                </button>
              </div>
            </div>

            {/* Info notice — stat-card style */}
            <div className="stat-card" style={{ textAlign:'left', padding:'16px 18px', display:'flex', gap:12, alignItems:'flex-start' }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'rgba(240,165,0,.1)', border:'1px solid rgba(240,165,0,.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span className="material-icons" style={{ fontSize:18, color:'#b45309' }}>lightbulb</span>
              </div>
              <div>
                <div className="syne" style={{ fontSize:12, fontWeight:700, color:'#1c1917', marginBottom:4 }}>One Itinerary Rule</div>
                <div style={{ fontSize:11, color:'#a8a29e', lineHeight:1.6 }}>Only one itinerary per account. Add as many attractions as you want to plan the perfect trip.</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ══ ADD ATTRACTION MODAL ══ */}
      {showAddModal && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:640, maxHeight:'90vh', display:'flex', flexDirection:'column', overflow:'hidden', border:'1px solid #e7e5e4', boxShadow:'0 24px 64px rgba(0,0,0,.18)' }}>

            {/* Modal header — same dark gradient as card tops */}
            <div style={{ background:'linear-gradient(to right,#2d0a0e,#1a0608)', padding:'20px 24px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexShrink:0 }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <span className="material-icons" style={{ fontSize:13, color:'#C1272D' }}>place</span>
                  <span className="pill pill-host" style={{ fontSize:9 }}>Browse</span>
                </div>
                <div className="syne" style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:4 }}>Add Attractions</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>Select places to add to your itinerary</div>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setSearchAdd(''); setFilterType('all'); }}
                style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,.6)', transition:'all .2s', flexShrink:0 }}
                onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,.18)'}
                onMouseOut={e  => e.currentTarget.style.background='rgba(255,255,255,.08)'}>
                <span className="material-icons" style={{ fontSize:18 }}>close</span>
              </button>
            </div>

            {/* Red→green accent stripe */}
            <div style={{ height:3, background:'linear-gradient(to right,#C1272D,#006233)', flexShrink:0 }} />

            {/* Filters */}
            <div style={{ padding:'16px 24px', borderBottom:'1px solid #f5f5f4', flexShrink:0, display:'flex', flexDirection:'column', gap:10 }}>
              {/* Search */}
              <div style={{ position:'relative' }}>
                <span className="material-icons" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:16, color:'#a8a29e' }}>search</span>
                <input type="text" value={searchAdd} onChange={e => setSearchAdd(e.target.value)}
                  placeholder="Search by name or city…"
                  style={{ width:'100%', paddingLeft:38, paddingRight:14, paddingTop:9, paddingBottom:9, border:'2px solid #e7e5e4', borderRadius:12, fontSize:13, color:'#1c1917', background:'#fafaf9', transition:'border-color .2s' }}
                  onFocus={e => e.target.style.borderColor='#C1272D'}
                  onBlur={e  => e.target.style.borderColor='#e7e5e4'} />
              </div>

              {/* Type filter — same as Matches filter pills */}
              <div className="nosb" style={{ display:'flex', gap:6, overflowX:'auto' }}>
                {uniqueTypes.map(type => (
                  <button key={type} onClick={() => setFilterType(type)}
                    className={`flex items-center gap-1 px-3 py-1.5 border-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap capitalize ${filterType === type ? 'filter-active' : 'bg-white border-stone-200 text-stone-600 hover:border-[#C1272D]'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="nosb" style={{ flex:1, overflowY:'auto', padding:'14px 24px', display:'flex', flexDirection:'column', gap:10 }}>
              {filteredForAdd.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 0' }}>
                  <div style={{ width:52, height:52, borderRadius:'50%', background:'#f5f5f4', border:'1px solid #e7e5e4', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                    <span className="material-icons" style={{ fontSize:24, color:'#a8a29e' }}>search_off</span>
                  </div>
                  <div style={{ fontSize:14, color:'#57534e', fontWeight:600, marginBottom:4 }}>No results</div>
                  <div style={{ fontSize:12, color:'#a8a29e' }}>{allAttractions.length === 0 ? 'Loading…' : 'Try adjusting your search'}</div>
                </div>
              ) : filteredForAdd.map(attraction => (
                <div key={attraction.id}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:14, border:'1px solid #e7e5e4', transition:'border-color .2s,background .2s', cursor:'default' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor='#C1272D'; e.currentTarget.style.background='#fafaf9'; }}
                  onMouseOut={e  => { e.currentTarget.style.borderColor='#e7e5e4'; e.currentTarget.style.background='#fff'; }}>
                  {/* Image */}
                  <div style={{ width:60, height:60, borderRadius:10, overflow:'hidden', background:'#f5f5f4', flexShrink:0 }}>
                    <img src={attraction.imageUrl || '/images/attraction-placeholder.jpg'} alt={attraction.name}
                      style={{ width:'100%', height:'100%', objectFit:'cover' }}
                      onError={e => e.target.src = '/images/attraction-placeholder.jpg'} />
                  </div>
                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="syne" style={{ fontSize:14, fontWeight:700, color:'#1c1917', marginBottom:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{attraction.name}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      {attraction.type && <span className="pill pill-default" style={{ fontSize:9 }}>{attraction.type}</span>}
                      {attraction.cityName && (
                        <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:11, color:'#a8a29e' }}>
                          <span className="material-icons" style={{ fontSize:12, color:'#C1272D' }}>location_on</span>
                          {attraction.cityName}
                        </span>
                      )}
                      {attraction.priceProxim !== undefined && (
                        <span style={{ fontSize:11, fontWeight:700, color:attraction.priceProxim===0?'#006233':'#b45309' }}>
                          {attraction.priceProxim === 0 ? 'FREE' : `${attraction.priceProxim} MAD`}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Add btn */}
                  <button onClick={() => addAttraction(attraction.id)}
                    style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'7px 14px', background:'linear-gradient(to right,#2d0a0e,#1a0608)', color:'#fff', border:'none', borderRadius:9, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:11, cursor:'pointer', flexShrink:0, textTransform:'uppercase', letterSpacing:'.04em' }}>
                    <span className="material-icons" style={{ fontSize:13 }}>add</span>
                    Add
                  </button>
                </div>
              ))}
            </div>

            {/* Modal footer */}
            <div style={{ padding:'14px 24px', borderTop:'1px solid #f5f5f4', background:'#fafaf9', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
              <span style={{ fontSize:12, color:'#a8a29e' }}>
                <strong style={{ color:'#1c1917', fontFamily:'Syne,sans-serif' }}>{itineraryAttractions.length}</strong> attractions in itinerary
              </span>
              <button
                onClick={() => { setShowAddModal(false); setSearchAdd(''); setFilterType('all'); }}
                style={{ padding:'8px 20px', background:'#f5f5f4', border:'1px solid #e7e5e4', borderRadius:10, fontSize:12, fontWeight:700, color:'#57534e', cursor:'pointer', fontFamily:'Syne,sans-serif' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}