import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text === 'null') return null;
    return JSON.parse(text);
  } catch { return null; }
}

export default function AttractionDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [attraction, setAttraction]     = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [itineraries, setItineraries]   = useState([]);
  const [loadingItins, setLoadingItins] = useState(false);
  const [toast, setToast]               = useState(null);

  const supporterId = 1;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`https://anas-gana1-fandb-backend.hf.space/api/attractions/${id}`)
      .then(r => r.json())
      .then(d => { setAttraction(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const openModal = async () => {
    setShowModal(true);
    setLoadingItins(true);
    const data = await safeFetch(`https://anas-gana1-fandb-backend.hf.space/api/itineraries/supporter/${supporterId}`);
    setItineraries(Array.isArray(data) ? data : data?.content || []);
    setLoadingItins(false);
  };

  const addToItinerary = (itId, itTitle) => {
    fetch(`https://anas-gana1-fandb-backend.hf.space/api/itineraries/${itId}/add-attraction/${id}`, { method: 'POST' })
      .then(r => r.json())
      .then(ok => {
        setShowModal(false);
        showToastMsg(ok ? 'success' : 'error', ok ? `Added to "${itTitle}"` : 'Already in this itinerary.');
      })
      .catch(() => showToastMsg('error', 'Server error.'));
  };

  const showToastMsg = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fmt  = t => t ? t.substring(0, 5) : '';
  const maps = () => attraction?.latitude && attraction?.longitude &&
    window.open(`https://www.google.com/maps?q=${attraction.latitude},${attraction.longitude}`, '_blank');

  const isOpenNow = (() => {
    if (!attraction?.houreOfOpening || !attraction?.houreOfClosing) return null;
    const now = new Date();
    const [oh, om] = attraction.houreOfOpening.split(':').map(Number);
    const [ch, cm] = attraction.houreOfClosing.split(':').map(Number);
    const mins = now.getHours() * 60 + now.getMinutes();
    return mins >= oh * 60 + om && mins <= ch * 60 + cm;
  })();

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ width:40, height:40, border:'3px solid #C1272D', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!attraction) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#fafaf9' }}>
      <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:'#1c1917', marginBottom:16 }}>Attraction not found</div>
      <button onClick={() => router.back()} style={{ padding:'10px 24px', background:'#1c1917', color:'#fff', border:'none', borderRadius:12, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, cursor:'pointer' }}>Go back</button>
    </div>
  );

  return (
    <>
      <Head>
        <title>{attraction.name} | MoroccoFan2030</title>
        <meta name="description" content={attraction.description || `Visit ${attraction.name}`} />
        <link rel="icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing:border-box;  }
        body { font-family:'Inter',sans-serif; background:#fff; color:#1c1917; -webkit-font-smoothing:antialiased; }
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes pulseDot{ 0%,100%{opacity:1} 50%{opacity:.35} }
        .fu { animation:fadeUp .55s cubic-bezier(.16,1,.3,1) both; }
        .d1{animation-delay:.08s} .d2{animation-delay:.16s} .d3{animation-delay:.24s} .d4{animation-delay:.32s}
        .slide-up { animation:slideUp .3s cubic-bezier(.16,1,.3,1) both; }
        .fade-in  { animation:fadeIn .2s ease both; }
        .no-scroll::-webkit-scrollbar { display:none; }
        .no-scroll { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      <Navbar />

      {/* Toast */}
      {toast && (
        <div className="slide-up" style={{ position:'fixed', bottom:24, right:24, zIndex:110, display:'flex', alignItems:'center', gap:12, padding:'12px 18px', background:'#fff', border:'1px solid #e7e5e4', borderRadius:14, boxShadow:'0 8px 30px rgba(0,0,0,.1)', fontSize:14, fontWeight:500, fontFamily:'Inter,sans-serif' }}>
          <span className="material-icons" style={{ fontSize:20, color:toast.type==='success'?'#16a34a':'#C1272D' }}>
            {toast.type==='success' ? 'check_circle' : 'cancel'}
          </span>
          {toast.msg}
        </div>
      )}

      {/* HERO */}
      <header style={{ position:'relative', minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'flex-end', overflow:'hidden', background:'#1c1917' }}>
        <div style={{ position:'absolute', inset:0 }}>
          {attraction.imageUrl
            ? <img src={attraction.imageUrl} alt={attraction.name} style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.42 }} />
            : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#2d2926,#1c1917)' }} />}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(28,25,23,.98) 0%,rgba(28,25,23,.5) 55%,rgba(28,25,23,.15) 100%)' }} />
          <div style={{ position:'absolute', inset:0, opacity:.04, backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'160px', pointerEvents:'none' }} />
        </div>

        <div style={{ position:'relative', zIndex:5, maxWidth:1100, margin:'0 auto', width:'100%', padding:'0 24px 52px', marginBottom:-12,paddingTop:80 }}>
          <button onClick={() => router.back()} className="fu"
            style={{ display:'inline-flex', alignItems:'center', gap:8, color:'rgba(255,255,255,.55)', background:'none', border:'none', cursor:'pointer', marginBottom:32, fontFamily:'Inter,sans-serif', fontSize:14, fontWeight:500, transition:'color .2s' }}
            onMouseEnter={e=>e.currentTarget.style.color='#fff'}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.55)'}>
            <div style={{ width:36, height:36, borderRadius:'50%', border:'1px solid rgba(255,255,255,.18)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span className="material-icons" style={{ fontSize:18 }}>arrow_back</span>
            </div>
            Back
          </button>

          <div className="fu d1" style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:10, marginBottom:18,marginTop:92 }}>
            {attraction.type && (
              <span style={{ padding:'4px 12px', borderRadius:999, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'rgba(255,255,255,.85)', fontFamily:'Syne,sans-serif' }}>
                {attraction.type}
              </span>
            )}
            {isOpenNow !== null && (
              <span style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:999, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', border:'1px solid', fontFamily:'Syne,sans-serif', background:isOpenNow?'rgba(22,163,74,.15)':'rgba(193,39,45,.15)', borderColor:isOpenNow?'rgba(22,163,74,.3)':'rgba(193,39,45,.3)', color:isOpenNow?'#4ade80':'#f87171' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:isOpenNow?'#4ade80':'#f87171', animation:isOpenNow?'pulseDot 1.4s ease-in-out infinite':undefined }} />
                {isOpenNow ? 'Open Now' : 'Closed'}
              </span>
            )}
          </div>

          <h1 className="fu d2" style={{ fontFamily:'Amiri,serif', fontSize:'clamp(52px,9vw,100px)', fontWeight:700, color:'#fff', lineHeight:.95, marginBottom:14 }}>
            {attraction.name}
          </h1>

          {attraction.address && (
            <div className="fu d3" style={{ display:'flex', alignItems:'center', gap:8, color:'rgba(255,255,255,.5)', fontSize:16, marginBottom:28 }}>
              <span className="material-icons" style={{ fontSize:18 }}>place</span>
              {attraction.address}
            </div>
          )}

          <div className="fu d4" style={{ display:'flex', alignItems:'flex-end', gap:32 }}>
            {attraction.priceProxim !== undefined && (
              <div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(40px,7vw,68px)', fontWeight:800, color:'#f0a500', lineHeight:1, marginBottom:4 }}>
                  {attraction.priceProxim === 0 ? 'FREE' : attraction.priceProxim}
                </div>
                <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.12em', color:'rgba(255,255,255,.4)', fontFamily:'Syne,sans-serif' }}>
                  {attraction.priceProxim > 0 ? 'MAD' : 'ENTRY'}
                </div>
              </div>
            )}
            {attraction.houreOfOpening && attraction.houreOfClosing && (
              <div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:'#3dba7a', lineHeight:1, marginBottom:2 }}>{fmt(attraction.houreOfOpening)}</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:4, fontFamily:'Syne,sans-serif' }}>to</div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:'#3dba7a', lineHeight:1 }}>{fmt(attraction.houreOfClosing)}</div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* STICKY ACTION BAR */}
      <div style={{ position:'sticky', top:0, zIndex:40, background:'rgba(255,255,255,.92)', backdropFilter:'blur(16px)', borderBottom:'1px solid #e7e5e4', boxShadow:'0 1px 12px rgba(0,0,0,.05)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'10px 24px', display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={openModal}
            style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'9px 20px', borderRadius:999, background:'#1c1917', color:'#fff', border:'none', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, cursor:'pointer', transition:'background .2s' }}
            onMouseEnter={e=>e.currentTarget.style.background='#C1272D'}
            onMouseLeave={e=>e.currentTarget.style.background='#1c1917'}>
            <span className="material-icons" style={{ fontSize:17 }}>add_circle</span>
            Add to Itinerary
          </button>
          {attraction.latitude && attraction.longitude && (
            <button onClick={maps}
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'9px 20px', borderRadius:999, background:'#fff', color:'#57534e', border:'1px solid #e7e5e4', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, cursor:'pointer', transition:'all .2s' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='#1c1917'; e.currentTarget.style.color='#1c1917'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e7e5e4'; e.currentTarget.style.color='#57534e'; }}>
              <span className="material-icons" style={{ fontSize:17 }}>near_me</span>
              Get Directions
            </button>
          )}
          <div style={{ flex:1 }} />
          <button style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:999, background:'#fafaf9', color:'#78716c', border:'1px solid #e7e5e4', fontFamily:'Inter,sans-serif', fontSize:13, cursor:'pointer' }}>
            <span className="material-icons" style={{ fontSize:16 }}>share</span>
            Share
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <main style={{ maxWidth:1100, margin:'0 auto', padding:'44px 24px 96px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:32, alignItems:'start' }}>

          {/* Left */}
          <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
            {/* About */}
            <section className="fu">
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <div style={{ width:3, height:22, background:'linear-gradient(to bottom,#C1272D,#006233)', borderRadius:2 }} />
                <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'#1c1917' }}>About</h2>
              </div>
              <p style={{ color:'#78716c', lineHeight:1.88, fontSize:16 }}>
                {attraction.description || `Discover ${attraction.name}, a remarkable attraction offering unique cultural experiences and lasting memories.`}
              </p>
            </section>

            {/* Info grid */}
            <section className="fu d1" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
              {attraction.priceProxim !== undefined && (
                <div style={{ background:'#fafaf9', border:'1px solid #e7e5e4', borderRadius:18, padding:'20px 18px' }}>
                  <div style={{ width:38, height:38, borderRadius:12, background:'rgba(240,165,0,.1)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
                    <span className="material-icons" style={{ fontSize:20, color:'#f0a500' }}>payments</span>
                  </div>
                  <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'#a8a29e', fontFamily:'Syne,sans-serif', marginBottom:6 }}>Entry Fee</div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:800, color:'#1c1917' }}>
                    {attraction.priceProxim === 0 ? 'Free' : `${attraction.priceProxim} MAD`}
                  </div>
                </div>
              )}
              {attraction.houreOfOpening && attraction.houreOfClosing && (
                <div style={{ background:'#fafaf9', border:'1px solid #e7e5e4', borderRadius:18, padding:'20px 18px' }}>
                  <div style={{ width:38, height:38, borderRadius:12, background:'rgba(0,98,51,.1)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
                    <span className="material-icons" style={{ fontSize:20, color:'#006233' }}>schedule</span>
                  </div>
                  <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'#a8a29e', fontFamily:'Syne,sans-serif', marginBottom:6 }}>Hours</div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, color:'#1c1917' }}>{fmt(attraction.houreOfOpening)} – {fmt(attraction.houreOfClosing)}</div>
                  {isOpenNow !== null && (
                    <div style={{ fontSize:11, fontWeight:700, color:isOpenNow?'#16a34a':'#C1272D', marginTop:4 }}>● {isOpenNow ? 'Open Now' : 'Closed'}</div>
                  )}
                </div>
              )}
              {attraction.type && (
                <div style={{ background:'#fafaf9', border:'1px solid #e7e5e4', borderRadius:18, padding:'20px 18px' }}>
                  <div style={{ width:38, height:38, borderRadius:12, background:'rgba(59,130,246,.1)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
                    <span className="material-icons" style={{ fontSize:20, color:'#3b82f6' }}>sell</span>
                  </div>
                  <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'#a8a29e', fontFamily:'Syne,sans-serif', marginBottom:6 }}>Category</div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:800, color:'#1c1917' }}>{attraction.type}</div>
                </div>
              )}
            </section>

            {/* Map */}
            {attraction.latitude && attraction.longitude && (
              <section className="fu d2" style={{ paddingTop:24, borderTop:'1px solid #f0efed' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:3, height:22, background:'linear-gradient(to bottom,#C1272D,#006233)', borderRadius:2 }} />
                    <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'#1c1917' }}>Location</h2>
                  </div>
                  <button onClick={maps}
                    style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:700, color:'#78716c', background:'none', border:'none', cursor:'pointer', fontFamily:'Syne,sans-serif', transition:'color .2s' }}
                    onMouseEnter={e=>e.currentTarget.style.color='#1c1917'}
                    onMouseLeave={e=>e.currentTarget.style.color='#78716c'}>
                    Open in Maps <span className="material-icons" style={{ fontSize:15 }}>north_east</span>
                  </button>
                </div>
                <div style={{ borderRadius:18, overflow:'hidden', border:'1px solid #e7e5e4', height:360 }}>
                  <iframe width="100%" height="100%" frameBorder="0" scrolling="no"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${attraction.longitude-0.01}%2C${attraction.latitude-0.01}%2C${attraction.longitude+0.01}%2C${attraction.latitude+0.01}&layer=mapnik&marker=${attraction.latitude}%2C${attraction.longitude}`}
                    style={{ border:0, display:'block' }} allowFullScreen />
                </div>
                <div style={{ marginTop:10, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 16px', background:'#fafaf9', border:'1px solid #e7e5e4', borderRadius:10, fontSize:11, color:'#a8a29e', fontFamily:'monospace' }}>
                  <span>LAT: {attraction.latitude}</span>
                  <span>LNG: {attraction.longitude}</span>
                </div>
              </section>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ position:'sticky', top:80, display:'flex', flexDirection:'column', gap:14 }}>
            {/* Info card */}
            <div className="fu d2" style={{ background:'#fff', border:'1px solid #e7e5e4', borderRadius:22, overflow:'hidden', boxShadow:'0 2px 16px rgba(0,0,0,.04)' }}>
              <div style={{ height:3, background:'linear-gradient(to right,#C1272D,#006233)' }} />
              <div style={{ padding:'22px 22px 0' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
                  <span className="material-icons" style={{ fontSize:18, color:'#a8a29e' }}>info</span>
                  <span style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#1c1917' }}>Visitor Information</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column' }}>
                  {[
                    attraction.priceProxim !== undefined && { icon:'payments', label:'Entry Fee', val:attraction.priceProxim===0?'Free':`${attraction.priceProxim} MAD` },
                    attraction.houreOfOpening && attraction.houreOfClosing && { icon:'schedule', label:'Hours', val:`${fmt(attraction.houreOfOpening)} – ${fmt(attraction.houreOfClosing)}`, sub:isOpenNow!==null?(isOpenNow?'Open Now':'Closed'):null, subColor:isOpenNow?'#16a34a':'#C1272D' },
                    attraction.type && { icon:'sell', label:'Category', val:attraction.type },
                    attraction.address && { icon:'place', label:'Address', val:attraction.address },
                  ].filter(Boolean).map((row,i,arr) => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'13px 0', borderBottom:i<arr.length-1?'1px dashed #f0efed':'none', gap:12 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                        <div style={{ width:32, height:32, borderRadius:'50%', background:'#fafaf9', border:'1px solid #f0efed', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <span className="material-icons" style={{ fontSize:16, color:'#a8a29e' }}>{row.icon}</span>
                        </div>
                        <span style={{ fontSize:13, color:'#78716c', fontWeight:500 }}>{row.label}</span>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <span style={{ fontSize:13, fontWeight:700, color:'#1c1917' }}>{row.val}</span>
                        {row.sub && <div style={{ fontSize:11, fontWeight:700, color:row.subColor, marginTop:2 }}>{row.sub}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding:'16px 22px 22px', display:'flex', flexDirection:'column', gap:8, borderTop:'1px solid #f0efed', marginTop:6 }}>
                <button onClick={openModal}
                  style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, height:44, background:'#1c1917', color:'#fff', border:'none', borderRadius:12, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, cursor:'pointer', transition:'background .2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#C1272D'}
                  onMouseLeave={e=>e.currentTarget.style.background='#1c1917'}>
                  <span className="material-icons" style={{ fontSize:17 }}>add_circle</span>
                  Add to Itinerary
                </button>
                {attraction.latitude && attraction.longitude && (
                  <button onClick={maps}
                    style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, height:44, background:'#fafaf9', color:'#57534e', border:'1px solid #e7e5e4', borderRadius:12, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, cursor:'pointer', transition:'all .2s' }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor='#1c1917'; e.currentTarget.style.color='#1c1917'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e7e5e4'; e.currentTarget.style.color='#57534e'; }}>
                    <span className="material-icons" style={{ fontSize:17 }}>near_me</span>
                    Get Directions
                  </button>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="fu d3" style={{ background:'#fafaf9', border:'1px solid #e7e5e4', borderRadius:20, padding:'20px 22px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                <span className="material-icons" style={{ fontSize:20, color:'#f0a500' }}>lightbulb</span>
                <span style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#1c1917' }}>Visitor Tips</span>
              </div>
              {[
                { icon:'schedule',        text:'Arrive early to avoid crowds'       },
                { icon:'directions_walk', text:'Wear comfortable walking shoes'     },
                { icon:'photo_camera',    text:"Don't forget your camera"           },
                { icon:'favorite',        text:'Respect local customs & traditions' },
              ].map((t,i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, fontSize:13, color:'#78716c', marginBottom:i<3?11:0 }}>
                  <span className="material-icons" style={{ fontSize:15, color:'#a8a29e', marginTop:1, flexShrink:0 }}>{t.icon}</span>
                  {t.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* MODAL */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div className="fade-in" onClick={() => setShowModal(false)} style={{ position:'absolute', inset:0, background:'rgba(28,25,23,.55)', backdropFilter:'blur(4px)', cursor:'pointer' }} />
          <div className="slide-up" style={{ position:'relative', background:'#fff', width:'100%', maxWidth:440, borderRadius:24, boxShadow:'0 24px 64px rgba(0,0,0,.14)', border:'1px solid #e7e5e4', overflow:'hidden' }}>
            <div style={{ height:3, background:'linear-gradient(to right,#C1272D,#006233)' }} />
            <div style={{ padding:'20px 22px 16px', borderBottom:'1px solid #f0efed', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, color:'#1c1917', marginBottom:3 }}>Add to Itinerary</div>
                <div style={{ fontSize:12, color:'#a8a29e' }}>Select a plan to save this attraction</div>
              </div>
              <button onClick={() => setShowModal(false)}
                style={{ width:32, height:32, borderRadius:'50%', background:'#fafaf9', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <span className="material-icons" style={{ fontSize:18, color:'#78716c' }}>close</span>
              </button>
            </div>
            <div className="no-scroll" style={{ padding:8, maxHeight:340, overflowY:'auto', background:'#fafaf9' }}>
              {loadingItins ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 0', gap:12 }}>
                  <div style={{ width:36, height:36, border:'3px solid #1c1917', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
                  <span style={{ fontSize:12, color:'#a8a29e' }}>Loading itineraries…</span>
                </div>
              ) : itineraries.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 24px' }}>
                  <div style={{ width:56, height:56, borderRadius:'50%', background:'#f0efed', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                    <span className="material-icons" style={{ fontSize:28, color:'#d6d3d1' }}>map</span>
                  </div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:800, color:'#1c1917', marginBottom:6 }}>No itineraries yet</div>
                  <div style={{ fontSize:12, color:'#a8a29e', marginBottom:20 }}>Create your first plan to start organising your trip.</div>
                  <button onClick={() => { setShowModal(false); router.push('/itineraries'); }}
                    style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'9px 20px', background:'#1c1917', color:'#fff', border:'none', borderRadius:12, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                    <span className="material-icons" style={{ fontSize:16 }}>add_circle</span>
                    Create Itinerary
                  </button>
                </div>
              ) : (
                itineraries.map(it => (
                  <button key={it.id} onClick={() => addToItinerary(it.id, it.title)}
                    style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px', borderRadius:14, background:'transparent', border:'1px solid transparent', cursor:'pointer', textAlign:'left', transition:'all .2s', marginBottom:4 }}
                    onMouseEnter={e=>{ e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor='#e7e5e4'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent'; }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:'#f0efed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span className="material-icons" style={{ fontSize:20, color:'#78716c' }}>calendar_today</span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#1c1917', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{it.title}</div>
                      {it.dateToGo && (
                        <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#a8a29e', marginTop:2 }}>
                          <span className="material-icons" style={{ fontSize:11 }}>calendar_today</span>
                          {it.dateToGo}
                        </div>
                      )}
                    </div>
                    <span className="material-icons" style={{ fontSize:20, color:'#d6d3d1', flexShrink:0 }}>add_circle</span>
                  </button>
                ))
              )}
            </div>
            <div style={{ padding:'12px 16px', borderTop:'1px solid #f0efed', background:'#fff', display:'flex', justifyContent:'flex-end' }}>
              <button onClick={() => setShowModal(false)}
                style={{ padding:'8px 18px', background:'#fafaf9', color:'#57534e', border:'1px solid #e7e5e4', borderRadius:10, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}