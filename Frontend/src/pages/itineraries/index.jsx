import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const API = 'https://anas-gana1-fandb-backend.hf.space/api';

async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) { console.warn(`[safeFetch] HTTP ${res.status} — ${url}`); return null; }
    const text = await res.text();
    if (!text || text === 'null') return null;
    return JSON.parse(text);
  } catch (err) {
    console.error(`[safeFetch] Error — ${url}`, err);
    return null;
  }
}

export default function Itineraries() {
  const router = useRouter();

  const [itineraries, setItineraries]       = useState([]);
  const [loading, setLoading]               = useState(true);
  const [creating, setCreating]             = useState(false);
  const [notification, setNotification]     = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [supporterId, setSupporterId]       = useState(null);
  const [hoveredId, setHoveredId]           = useState(null);

  const [form, setForm] = useState({ title:'', description:'', dateToGo:'' });

  useEffect(() => {
    const storedId = localStorage.getItem('supporterId');
    if (!storedId) { router.push('/login'); return; }
    setSupporterId(parseInt(storedId));
  }, []);

  useEffect(() => { if (supporterId) fetchItineraries(); }, [supporterId]);

  const fetchItineraries = async () => {
    setLoading(true);
    const data = await safeFetch(`${API}/itineraries/supporter/${supporterId}`);
    setItineraries(Array.isArray(data) ? data : data?.content || []);
    setLoading(false);
  };

  const showNotif = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = async () => {
    if (!form.title.trim()) { showNotif('error', 'Please enter a title.'); return; }
    setCreating(true);
    try {
      const res = await fetch(`${API}/itineraries/add/${supporterId}`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form),
      });
      const responseText = await res.text();
      let result;
      try { result = JSON.parse(responseText); } catch { result = responseText; }
      if (res.ok && typeof result === 'object' && result.id) {
        showNotif('success', 'Itinerary created successfully!');
        setForm({ title:'', description:'', dateToGo:'' });
        setShowCreateForm(false);
        await fetchItineraries();
      } else {
        showNotif('error', typeof result === 'string' ? result : 'Could not create itinerary.');
      }
    } catch (err) {
      showNotif('error', 'Server error: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' }) : '';

  if (loading || !supporterId) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#fff' }}>
      <div style={{ width:44, height:44, border:'3px solid #C1272D', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
    </div>
  );

  return (
    <>
      <Head>
        <title>My Itineraries | MoroccoFan2030</title>
        <meta name="description" content="Plan your World Cup 2030 trip" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=Amiri:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #fff; color: #1c1917; -webkit-font-smoothing: antialiased; }
        .syne  { font-family: 'Syne', sans-serif; }
        .serif { font-family: 'Amiri', serif; }
        ::selection { background: #C1272D; color: #fff; }

        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:.3} }

        .fu { animation: fadeUp .5s ease-out both; }
        .d1 { animation-delay:.08s; } .d2 { animation-delay:.16s; }
        .d3 { animation-delay:.26s; } .d4 { animation-delay:.36s; }

        /* Pills */
        .pill       { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;border:1px solid; }
        .pill-red   { background:rgba(193,39,45,.08);  color:#C1272D; border-color:rgba(193,39,45,.25); }
        .pill-green { background:rgba(0,98,51,.10);    color:#006233; border-color:rgba(0,98,51,.3);   }
        .pill-gold  { background:rgba(240,165,0,.10);  color:#b45309; border-color:rgba(240,165,0,.3); }
        .pill-gray  { background:rgba(0,0,0,.04);      color:#78716c; border-color:rgba(0,0,0,.1);     }
        .pill-dark  { background:rgba(255,255,255,.12);color:#fff;    border-color:rgba(255,255,255,.2);}

        /* Stat cards */
        .stat-card { background:#fff; border:1px solid #e7e5e4; border-radius:16px; padding:20px 16px; text-align:center; transition:border-color .2s; }
        .stat-card:hover { border-color:#C1272D; }
        .stat-val { font-size:30px; font-weight:800; line-height:1; font-family:'Syne',sans-serif; }
        .stat-lbl { font-size:11px; color:#a8a29e; text-transform:uppercase; letter-spacing:.08em; margin-top:5px; font-weight:500; }

        /* Itinerary card */
        .itin-card { background:#fff; border:1px solid #e7e5e4; border-radius:20px; overflow:hidden; cursor:pointer; transition:transform .35s cubic-bezier(.16,1,.3,1),box-shadow .35s,border-color .2s; }
        .itin-card:hover { transform:translateY(-6px); box-shadow:0 24px 48px rgba(193,39,45,.10); border-color:#C1272D; }
        .itin-card:hover .card-arrow { background:#C1272D; border-color:#C1272D; color:#fff; }

        /* Section title */
        .sec-title { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; color:#1c1917; display:flex; align-items:center; gap:8px; }
        .sec-title::before { content:''; display:block; width:4px; height:20px; background:linear-gradient(to bottom,#C1272D,#006233); border-radius:2px; }

        /* Form field */
        .form-field { width:100%; padding:12px 14px; border:1px solid #e7e5e4; border-radius:12px; font-size:13px; color:#1c1917; font-family:'Inter',sans-serif; background:#fafaf9; transition:border-color .2s,box-shadow .2s; resize:none; }
        .form-field::placeholder { color:#a8a29e; }
        .form-field:focus { outline:none; border-color:#C1272D; box-shadow:0 0 0 3px rgba(193,39,45,.08); }

        .nosb::-webkit-scrollbar { display:none; }
        .nosb { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      <Navbar />

      {/* ── TOAST ──────────────────────────────────────────────────────── */}
      {notification && (
        <div style={{ position:'fixed', top:24, right:24, zIndex:60, display:'flex', alignItems:'center', gap:10,
                      padding:'12px 18px', borderRadius:14, fontSize:13, fontWeight:600, color:'#fff',
                      background:notification.type==='success'?'#1c1917':'#C1272D',
                      boxShadow:'0 8px 32px rgba(0,0,0,.18)', animation:'fadeUp .4s ease-out both' }}>
          <span className="material-icons" style={{ fontSize:17 }}>{notification.type==='success'?'check_circle':'error_outline'}</span>
          {notification.message}
        </div>
      )}

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <header style={{ position:'relative', background:'linear-gradient(135deg,#2d0a0e 0%,#1a0608 60%,rgba(0,98,51,.25) 100%)', overflow:'hidden', paddingTop:80 }}>
        {/* BG image */}
        <div style={{ position:'absolute', inset:0 }}>
          <img src="/images/itin.webp" alt="" onError={e => e.target.style.display='none'}
               style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.25, mixBlendMode:'luminosity' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(26,6,8,.7),rgba(26,6,8,.96))' }} />
          <div style={{ position:'absolute', inset:0, opacity:.05, backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'160px' }} />
        </div>
        {/* Glows */}
        <div style={{ position:'absolute', top:-40, left:-40, width:320, height:320, borderRadius:'50%', background:'rgba(193,39,45,.18)', filter:'blur(80px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:0, right:-40, width:280, height:280, borderRadius:'50%', background:'rgba(0,98,51,.15)', filter:'blur(80px)', pointerEvents:'none' }} />

        {/* Decorative "2030" */}
        <div style={{ position:'absolute', right:32, top:'50%', transform:'translateY(-50%)', display:'none', flexDirection:'column', alignItems:'center', gap:12, zIndex:5 }} className="hidden xl:flex">
          <div style={{ width:1, height:80, background:'rgba(255,255,255,.08)' }} />
          <span className="syne" style={{ fontSize:100, fontWeight:800, color:'rgba(255,255,255,.04)', writingMode:'vertical-rl', lineHeight:1 }}>2030</span>
          <div style={{ width:1, height:80, background:'rgba(255,255,255,.08)' }} />
        </div>

        <div style={{ position:'relative', zIndex:10, maxWidth:1100, margin:'0 auto', padding:'40px 24px 72px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:40, alignItems:'flex-end' }} className="hero-grid">

            {/* Left — title */}
            <div className="fu">
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                <div style={{ width:28, height:2, background:'#C1272D', borderRadius:2 }} />
                <span className="pill pill-red">World Cup 2030</span>
              </div>
              <h1 className="syne" style={{ fontSize:'clamp(40px,7vw,80px)', fontWeight:800, lineHeight:1.0, color:'#fff', letterSpacing:'-.02em', marginBottom:16 }}>
                My Travel{' '}
                <span className="serif" style={{ color:'rgba(240,210,160,.9)', fontStyle:'italic', fontWeight:400 }}>Itineraries</span>
              </h1>
              <p style={{ fontSize:15, color:'rgba(255,255,255,.45)', lineHeight:1.8, maxWidth:440 }}>
                Plan your perfect World Cup 2030 adventure across Morocco's stunning host cities.
              </p>
            </div>

            {/* Right — hero stat chips */}
            <div className="fu d2">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                {[
                  { val:itineraries.length, label:'Itineraries', color:'#C1272D' },
                  { val:'2030',             label:'World Cup',   color:'#f0a500' },
                  { val:'6',               label:'Host Cities', color:'#3dba7a' },
                ].map(({ val, label, color }) => (
                  <div key={label} style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:16, padding:'20px 12px', textAlign:'center', backdropFilter:'blur(8px)' }}>
                    <div className="syne" style={{ fontSize:36, fontWeight:800, color, lineHeight:1, marginBottom:4 }}>{val}</div>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:700 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fade to white */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:48, background:'linear-gradient(to bottom,transparent,#fff)', pointerEvents:'none' }} />
      </header>

      {/* ══ STAT CARDS ════════════════════════════════════════════════════ */}
      <section className="fu d2" style={{ maxWidth:1100, margin:'0 auto', padding:'8px 24px 0',marginTop:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:10 }}>
          {[
            { v:itineraries.length, l:'Itinéraires', c:'#C1272D' },
            { v:'2030',             l:'World Cup',   c:'#f0a500' },
            { v:'6',               l:'Villes hôtes', c:'#006233' },
            { v:'🇲🇦',             l:'Maroc',        c:'#1c1917' },
          ].map(({ v, l, c }) => (
            <div key={l} className="stat-card">
              <div className="stat-val" style={{ color:c }}>{v}</div>
              <div className="stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ MAIN ══════════════════════════════════════════════════════════ */}
      <main style={{ maxWidth:1100, margin:'0 auto', padding:'32px 24px 80px' }}>

        {itineraries.length === 0 ? (

          /* ── EMPTY STATE ──────────────────────────────────────────────── */
          <div className="fu d3">
            {!showCreateForm ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 24px', textAlign:'center' }}>
                <div style={{ width:72, height:72, borderRadius:'50%', background:'#f5f5f4', border:'1px solid #e7e5e4', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                  <span className="material-icons" style={{ fontSize:32, color:'#d6d3d1' }}>map</span>
                </div>
                <h3 className="syne" style={{ fontSize:28, fontWeight:800, color:'#1c1917', marginBottom:8 }}>
                  Créer votre premier itinéraire
                </h3>
                <p style={{ fontSize:14, color:'#a8a29e', lineHeight:1.8, maxWidth:380, marginBottom:28 }}>
                  Commencez à planifier votre aventure World Cup 2030 à travers les villes hôtes du Maroc.
                </p>
                <button onClick={() => setShowCreateForm(true)}
                        style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 24px', background:'#1c1917', color:'#fff',
                                 borderRadius:14, fontSize:13, fontWeight:700, fontFamily:'Syne,sans-serif', border:'none', cursor:'pointer', transition:'all .2s' }}
                        onMouseEnter={e => e.currentTarget.style.background='#2d2825'}
                        onMouseLeave={e => e.currentTarget.style.background='#1c1917'}>
                  <span className="material-icons" style={{ fontSize:17 }}>add_circle_outline</span>
                  Nouvel itinéraire
                </button>

                {/* Tips */}
                <div style={{ marginTop:48, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, width:'100%', maxWidth:580, textAlign:'left' }}>
                  {[
                    { icon:'verified', title:'Un par compte',    desc:'Concentrez-vous sur votre voyage parfait' },
                    { icon:'place',    title:'Ajoutez des sites', desc:'Construisez votre itinéraire de rêve'     },
                    { icon:'event',    title:'Dates de voyage',  desc:'Planifiez à l\'avance pour 2030'          },
                  ].map((tip, i) => (
                    <div key={i} style={{ display:'flex', gap:12, padding:'16px', background:'#fff', borderRadius:16, border:'1px solid #e7e5e4' }}>
                      <div style={{ width:36, height:36, borderRadius:10, background:'#f5f5f4', border:'1px solid #e7e5e4', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span className="material-icons" style={{ fontSize:18, color:'#a8a29e' }}>{tip.icon}</span>
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:'#1c1917', fontFamily:'Syne,sans-serif', marginBottom:2 }}>{tip.title}</div>
                        <div style={{ fontSize:11, color:'#a8a29e' }}>{tip.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            ) : (

              /* ── CREATE FORM ──────────────────────────────────────────── */
              <div style={{ maxWidth:520, margin:'0 auto' }} className="fu">
                <div style={{ background:'#fff', borderRadius:20, border:'1px solid #e7e5e4', overflow:'hidden', boxShadow:'0 16px 48px rgba(0,0,0,.08)' }}>

                  {/* Form dark header */}
                  <div style={{ position:'relative', background:'linear-gradient(135deg,#2d0a0e,#1a0608)', padding:'28px 28px 24px', overflow:'hidden' }}>
                    <div style={{ position:'absolute', inset:0, opacity:.05, backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'120px' }} />
                    <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                          <div style={{ width:20, height:2, background:'#C1272D', borderRadius:2 }} />
                          <span className="pill pill-red" style={{ fontSize:9 }}>Nouvel itinéraire</span>
                        </div>
                        <h2 className="syne" style={{ fontSize:26, fontWeight:800, color:'#fff', lineHeight:1.1, marginBottom:4 }}>
                          Planifiez votre{' '}
                          <span className="serif" style={{ color:'rgba(240,210,160,.8)', fontStyle:'italic', fontWeight:400 }}>aventure</span>
                        </h2>
                      </div>
                      <button onClick={() => setShowCreateForm(false)}
                              style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff', flexShrink:0 }}>
                        <span className="material-icons" style={{ fontSize:18 }}>close</span>
                      </button>
                    </div>
                  </div>

                  {/* Form body */}
                  <div style={{ padding:28, display:'flex', flexDirection:'column', gap:18 }}>
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8, fontFamily:'Syne,sans-serif' }}>Titre *</div>
                      <input type="text" className="form-field" placeholder="ex: Mon aventure Coupe du Monde 2030 au Maroc"
                             value={form.title} onChange={e => setForm({ ...form, title:e.target.value })} />
                    </div>
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8, fontFamily:'Syne,sans-serif' }}>Description</div>
                      <textarea className="form-field" rows={4} placeholder="Décrivez vos projets de voyage, vos objectifs et ce que vous souhaitez vivre..."
                                value={form.description} onChange={e => setForm({ ...form, description:e.target.value })} />
                    </div>
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8, fontFamily:'Syne,sans-serif' }}>Date de départ</div>
                      <input type="date" className="form-field" min="2030-01-01" max="2030-12-31"
                             value={form.dateToGo} onChange={e => setForm({ ...form, dateToGo:e.target.value })} />
                    </div>
                    <button onClick={handleCreate} disabled={creating}
                            style={{ width:'100%', padding:'13px', borderRadius:14, border:'none', fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:800,
                                     background:creating?'#f5f5f4':'#C1272D', color:creating?'#a8a29e':'#fff', cursor:creating?'not-allowed':'pointer',
                                     transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                                     boxShadow:creating?'none':'0 6px 20px rgba(193,39,45,.28)' }}>
                      {creating ? (
                        <><div style={{ width:16, height:16, border:'2px solid #a8a29e', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }} /> Création…</>
                      ) : (
                        <><span className="material-icons" style={{ fontSize:18 }}>add_circle_outline</span> Créer l'itinéraire</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        ) : (

          /* ── ITINERARIES LIST ────────────────────────────────────────── */
          <>
            {/* Section header */}
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:28 }} className="fu">
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                  <div style={{ width:20, height:2, background:'#C1272D', borderRadius:2 }} />
                  <span className="pill pill-red">Travel Planning</span>
                </div>
                <div className="sec-title" style={{ fontSize:26 }}>Vos itinéraires</div>
                <p style={{ fontSize:13, color:'#a8a29e', marginTop:4 }}>Gérez vos plans de voyage pour la Coupe du Monde 2030</p>
              </div>
              <span style={{ fontSize:12, color:'#a8a29e', fontWeight:600 }} className="hidden md:block">
                {itineraries.length} itinéraire{itineraries.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Cards grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
              {itineraries.map((it, i) => (
                <article key={it.id} className="itin-card fu"
                         style={{ animationDelay:`${i*.07}s` }}
                         onClick={() => router.push(`/itineraries/${it.id}`)}
                         onMouseEnter={() => setHoveredId(it.id)}
                         onMouseLeave={() => setHoveredId(null)}>

                  {/* Card visual header */}
                  <div style={{ position:'relative', height:180, background:'linear-gradient(135deg,#2d0a0e 0%,#1a0608 60%,rgba(0,98,51,.3) 100%)', overflow:'hidden' }}>
                    {/* Pattern */}
                    <div style={{ position:'absolute', inset:0, opacity:.06, backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'100px' }} />
                    {/* Top accent line */}
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(to right,#C1272D,#006233)' }} />
                    {/* Bottom gradient */}
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 60%)' }} />

                    {/* Top badge */}
                    <div style={{ position:'absolute', top:14, left:14 }}>
                      <span className="pill pill-dark" style={{ fontSize:9 }}>
                        <span className="material-icons" style={{ fontSize:10 }}>map</span>
                        Itinéraire
                      </span>
                    </div>

                    {/* Bottom row: date + arrow */}
                    <div style={{ position:'absolute', bottom:14, left:16, right:16, display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
                      {it.dateToGo ? (
                        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'rgba(255,255,255,.7)', fontWeight:500 }}>
                          <span className="material-icons" style={{ fontSize:13 }}>calendar_today</span>
                          {formatDate(it.dateToGo)}
                        </div>
                      ) : (
                        <div style={{ fontSize:11, color:'rgba(255,255,255,.3)', fontStyle:'italic' }}>Pas de date</div>
                      )}
                      <div className="card-arrow" style={{ width:34, height:34, borderRadius:'50%', border:'1px solid rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.7)', transition:'all .2s' }}>
                        <span className="material-icons" style={{ fontSize:16 }}>arrow_forward</span>
                      </div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding:'20px 20px 16px' }}>
                    <h2 className="syne" style={{ fontSize:18, fontWeight:800, color:'#1c1917', marginBottom:6, lineHeight:1.2 }}>{it.title}</h2>
                    {it.description && (
                      <p style={{ fontSize:12, color:'#78716c', lineHeight:1.7, marginBottom:14,
                                  overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                        {it.description}
                      </p>
                    )}

                    {/* Mini stat bar */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, paddingTop:14, borderTop:'1px solid #f5f5f4' }}>
                      {[
                        { icon:'place',         val:'—',   label:'Étapes',  color:'#C1272D' },
                        { icon:'calendar_today', val:it.dateToGo?new Date(it.dateToGo).getFullYear():'—', label:'Année', color:'#f0a500' },
                        { icon:'public',        val:'🇲🇦', label:'Maroc',   color:'#006233' },
                      ].map(s => (
                        <div key={s.label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 6px', background:'#fafaf9', borderRadius:10 }}>
                          <span className="material-icons" style={{ fontSize:16, color:s.color }}>{s.icon}</span>
                          <span className="syne" style={{ fontSize:14, fontWeight:800, color:'#1c1917' }}>{s.val}</span>
                          <span style={{ fontSize:9, color:'#a8a29e', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Info notice */}
            <div style={{ marginTop:32, padding:'16px 20px', background:'#fff', borderRadius:16, border:'1px solid #e7e5e4', display:'flex', alignItems:'flex-start', gap:14 }} className="fu d4">
              <div style={{ width:36, height:36, borderRadius:10, background:'rgba(240,165,0,.08)', border:'1px solid rgba(240,165,0,.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span className="material-icons" style={{ fontSize:18, color:'#f0a500' }}>lightbulb</span>
              </div>
              <div>
                <div className="syne" style={{ fontSize:13, fontWeight:700, color:'#1c1917', marginBottom:3 }}>Limite d'itinéraire</div>
                <div style={{ fontSize:12, color:'#a8a29e', lineHeight:1.7 }}>
                  Vous pouvez avoir un itinéraire par compte. Cliquez sur votre itinéraire ci-dessus pour ajouter des attractions,
                  mettre à jour les détails et planifier votre expérience World Cup 2030 parfaite à travers le Maroc.
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />

      {/* Responsive hero grid */}
      <style jsx>{`
        @media (min-width: 1024px) {
          .hero-grid { grid-template-columns: 7fr 5fr !important; }
        }
      `}</style>
    </>
  );
}