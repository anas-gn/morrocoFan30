import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

export default function StadeDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [stade, setStade]               = useState(null);
  const [images, setImages]             = useState([]);
  const [matches, setMatches]           = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab]       = useState('upcoming');
  const [showGallery, setShowGallery]   = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      try {
        const [sR, iR, mR, uR] = await Promise.all([
          fetch(`https://anas-gana1-fandb-backend.hf.space/api/stade/stade/${id}`),
          fetch(`https://anas-gana1-fandb-backend.hf.space/api/stade/images/stade/${id}`),
          fetch(`https://anas-gana1-fandb-backend.hf.space/api/stade/stade/matches/${id}`),
          fetch(`https://anas-gana1-fandb-backend.hf.space/api/stade/stade/${id}/upcomingMatches`),
        ]);
        setStade(await sR.json());
        const iData = await iR.json(); setImages(Array.isArray(iData) ? iData : []);
        const mData = await mR.json(); setMatches(Array.isArray(mData) ? mData : []);
        const uData = await uR.json(); setUpcomingMatches(Array.isArray(uData) ? uData : []);
        setLoading(false);
      } catch (e) { console.error(e); setLoading(false); }
    };
    fetchAll();
  }, [id]);

  const STATUS = {
    scheduled: { label:'Programmé', pill:'pill-gray', dot:'#a8a29e', border:'#e7e5e4' },
    live:      { label:'En direct', pill:'pill-live', dot:'#C1272D', border:'rgba(193,39,45,.3)' },
    finished:  { label:'Terminé',   pill:'pill-gray', dot:'#d6d3d1', border:'#e7e5e4' },
    postponed: { label:'Reporté',   pill:'pill-gold', dot:'#f0a500', border:'rgba(240,165,0,.3)' },
  };
  const getStatus = (s) => STATUS[s] || STATUS.scheduled;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div style={{ width:48, height:48, border:'3px solid #C1272D', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
    </div>
  );

  if (!stade) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div style={{ width:64, height:64, borderRadius:'50%', background:'#f5f5f4', border:'1px solid #e7e5e4', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
        <span className="material-icons" style={{ fontSize:28, color:'#a8a29e' }}>stadium</span>
      </div>
      <p style={{ color:'#78716c', marginBottom:16 }}>Stade introuvable</p>
      <button onClick={() => router.push('/Stades')}
              style={{ padding:'10px 24px', background:'#1c1917', color:'#fff', borderRadius:12, fontSize:13, fontWeight:600, border:'none', cursor:'pointer' }}>
        Retour aux stades
      </button>
    </div>
  );

  const displayMatches = activeTab === 'upcoming' ? upcomingMatches : matches;
  const mapQ = encodeURIComponent(`${stade.adresse || stade.name}, ${stade.cityName || ''}, Maroc`);

  return (
    <>
      <Head>
        <title>{stade.name} | MoroccoFan2030</title>
        <meta name="description" content={`${stade.name} - ${stade.description}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=Amiri:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #fff; color: #1c1917; -webkit-font-smoothing: antialiased; }
        .syne  { font-family: 'Syne', sans-serif; }
        .serif { font-family: 'Amiri', serif; }
        ::selection { background: #C1272D; color: #fff; }

        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes pulse   { 0%,100%{box-shadow:0 0 0 0 rgba(193,39,45,.4)} 60%{box-shadow:0 0 0 6px rgba(193,39,45,0)} }

        .fu  { animation: fadeUp .5s ease-out both; }
        .d1  { animation-delay:.08s; } .d2 { animation-delay:.16s; }
        .d3  { animation-delay:.26s; } .d4 { animation-delay:.36s; }

        /* Pills */
        .pill       { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;border:1px solid; }
        .pill-red   { background:rgba(193,39,45,.08);  color:#C1272D; border-color:rgba(193,39,45,.25); }
        .pill-green { background:rgba(0,98,51,.10);    color:#006233; border-color:rgba(0,98,51,.30);   }
        .pill-gold  { background:rgba(240,165,0,.10);  color:#b45309; border-color:rgba(240,165,0,.30); }
        .pill-gray  { background:rgba(0,0,0,.04);      color:#78716c; border-color:rgba(0,0,0,.10);     }
        .pill-live  { background:rgba(193,39,45,.10);  color:#C1272D; border-color:rgba(193,39,45,.3);  animation:pulse 1.5s infinite; }

        /* Stat cards */
        .stat-card { background:#fff; border:1px solid #e7e5e4; border-radius:16px; padding:18px 16px; text-align:center; transition:border-color .2s,box-shadow .2s; }
        .stat-card:hover { border-color:#C1272D; box-shadow:0 4px 20px rgba(193,39,45,.08); }
        .stat-val { font-size:30px; font-weight:800; line-height:1; font-family:'Syne',sans-serif; }
        .stat-lbl { font-size:11px; color:#a8a29e; text-transform:uppercase; letter-spacing:.08em; margin-top:6px; font-weight:500; }

        /* Glass overlay (for floating stats on hero) */
        .glass-dark { background:rgba(28,25,23,.72); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,.08); }

        /* Scroll tab btn */
        .tab-btn { padding:8px 18px; border-radius:12px; font-size:12px; font-weight:700; letter-spacing:.04em; cursor:pointer; border:none; transition:all .18s; }
        .tab-btn.active { background:linear-gradient(to right,#2d0a0e,#1a0608); color:#fff; }
        .tab-btn.inactive { background:transparent; color:#78716c; }
        .tab-btn.inactive:hover { background:#f5f5f4; color:#1c1917; }

        /* Match card */
        .match-card { background:#fff; border-radius:16px; border:1px solid; overflow:hidden; cursor:pointer; transition:border-color .2s,transform .2s,box-shadow .2s; }
        .match-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(193,39,45,.10); border-color:#C1272D !important; }
        .match-card:hover .mc-arrow { background:#C1272D; border-color:#C1272D; color:#fff; }

        /* Section title */
        .sec-title { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; color:#1c1917; margin-bottom:20px; display:flex; align-items:center; gap:10px; }
        .sec-title::before { content:''; display:block; width:4px; height:20px; background:linear-gradient(to bottom,#C1272D,#006233); border-radius:2px; }

        /* Nav anchor tab */
        .anc-tab { display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:12px;font-size:12px;font-weight:700;letter-spacing:.04em;transition:all .18s;color:#78716c;text-decoration:none; }
        .anc-tab:hover { background:#f5f5f4; color:#1c1917; }
        .anc-tab.active { background:linear-gradient(to right,#2d0a0e,#1a0608); color:#fff; }

        /* Spec row */
        .spec-row { display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f5f5f4;font-size:13px; }
        .spec-row:last-child { border-bottom:none; }

        .nosb::-webkit-scrollbar { display:none; }
        .nosb { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      <Navbar />

      <main style={{ paddingTop:88, paddingBottom:80 }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          {/* ══ HERO HEADER ═══════════════════════════════════════════════ */}
          <header className="fu mb-10">

            {/* Top row: breadcrumb + actions */}
            <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:16, marginBottom:44,marginTop:30 }}>
              <div>
                {/* Pills row */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
                  <span className="pill pill-gray">
                    <span className="material-icons" style={{ fontSize:11 }}>location_on</span>
                    {stade.cityName}
                  </span>
                  {(stade.capacity || 0) >= 80000 && (
                    <span className="pill pill-green">
                      <span className="material-icons" style={{ fontSize:11 }}>verified</span>
                      FIFA Premier
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="syne" style={{ fontSize:'clamp(36px,6vw,68px)', fontWeight:800, lineHeight:1.0, letterSpacing:'-.02em', color:'#1c1917' }}>
                  {stade.name.includes(' ')
                    ? <>{stade.name.split(' ').slice(0,-1).join(' ')}{' '}
                        <span style={{ color:'#C1272D' }} className="serif italic">{stade.name.split(' ').slice(-1)[0]}</span>
                      </>
                    : stade.name
                  }
                </h1>
              </div>

              {/* Action buttons */}
              <div style={{ display:'flex', gap:10, flexShrink:0 }}>
                <button style={{ height:40, padding:'0 18px', borderRadius:99, border:'1px solid #e7e5e4', background:'#fff', color:'#57534e', fontSize:13, fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6, transition:'all .2s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor='#1c1917'; e.currentTarget.style.color='#1c1917'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor='#e7e5e4'; e.currentTarget.style.color='#57534e'; }}>
                  <span className="material-icons" style={{ fontSize:16 }}>share</span>
                  Partager
                </button>
                <a href={`https://www.google.com/maps/search/?api=1&query=${mapQ}`}
                   target="_blank" rel="noopener noreferrer"
                   style={{ height:40, padding:'0 20px', borderRadius:99, background:'#C1272D', color:'#fff', fontSize:13, fontWeight:700, display:'inline-flex', alignItems:'center', gap:6, textDecoration:'none', boxShadow:'0 4px 16px rgba(193,39,45,.3)', transition:'background .2s' }}
                   onMouseEnter={e => e.currentTarget.style.background='#a01f25'}
                   onMouseLeave={e => e.currentTarget.style.background='#C1272D'}>
                  <span className="material-icons" style={{ fontSize:16 }}>directions</span>
                  Itinéraire
                </a>
              </div>
            </div>

            {/* Hero image / video */}
            <div style={{ position:'relative', height:480, borderRadius:24, overflow:'hidden', border:'1px solid #e7e5e4', boxShadow:'0 20px 48px rgba(0,0,0,.10)' }} className="group">
              {stade.videoUrl ? (
                <video src={stade.videoUrl} autoPlay muted loop playsInline
                       style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', transition:'transform .8s' }}
                       className="group-hover:scale-105" />
              ) : (
                <img src="/images/terrain1.webp" alt={stade.name}
                     style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', transition:'transform .8s' }}
                     className="group-hover:scale-105" />
              )}
              {/* Dark gradient */}
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.7) 0%,rgba(0,0,0,.1) 50%,rgba(45,10,14,.15) 100%)' }} />

              {/* Floating stat chips */}
              <div style={{ position:'absolute', bottom:20, left:20, right:20, display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:12 }}>
                <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:2 }} className="nosb">
                  {[
                    { icon:'event_seat',    val: stade.capacity ? stade.capacity.toLocaleString() : '—', lbl:'Capacité' },
                    ...(stade.dateOfConstruction ? [{ icon:'construction', val: String(new Date(stade.dateOfConstruction).getFullYear()), lbl:'Construit' }] : []),
                    { icon:'sports_soccer', val: String(matches.length), lbl:'Matches' },
                  ].map(s => (
                    <div key={s.lbl} className="glass-dark" style={{ padding:'12px 18px', borderRadius:16, display:'flex', alignItems:'center', gap:14, minWidth:140, flexShrink:0 }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span className="material-icons" style={{ fontSize:18, color:'#fff' }}>{s.icon}</span>
                      </div>
                      <div>
                        <div className="syne" style={{ fontSize:17, fontWeight:800, color:'#fff', lineHeight:1, marginBottom:2 }}>{s.val}</div>
                        <div style={{ fontSize:9, color:'rgba(255,255,255,.5)', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:600 }}>{s.lbl}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {images.length > 0 && (
                  <button onClick={() => setShowGallery(true)} className="glass-dark"
                          style={{ padding:'10px 18px', borderRadius:99, color:'#fff', fontSize:12, fontWeight:700, display:'inline-flex', alignItems:'center', gap:6, flexShrink:0, border:'1px solid rgba(255,255,255,.15)', cursor:'pointer', transition:'background .2s' }}>
                    <span className="material-icons" style={{ fontSize:15 }}>photo_library</span>
                    Galerie ({images.length})
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* ══ STAT CARDS ════════════════════════════════════════════════ */}
          <section className="fu d1 mb-8">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:12 }}>
              {[
                { v: stade.capacity ? (stade.capacity/1000).toFixed(0)+'K' : '—',  l:'Capacité',  c:'#C1272D' },
                { v: matches.length,                                             l:'Matches',   c:'#006233' },
                { v: upcomingMatches.length,                                     l:'À venir',   c:'#f0a500' },
                { v: stade.dateOfConstruction ? new Date(stade.dateOfConstruction).getFullYear() : '—', l:'Année', c:'#78716c' },
              ].map(({ v, l, c }) => (
                <div key={l} className="stat-card">
                  <div className="stat-val" style={{ color:c }}>{v}</div>
                  <div className="stat-lbl">{l}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ══ ANCHOR TABS ═══════════════════════════════════════════════ */}
          <div className="fu d2 mb-10" style={{ position:'sticky', top:80, zIndex:40, background:'#fff', borderBottom:'1px solid #e7e5e4', paddingBottom:0, paddingTop:10 }}>
            <div style={{ display:'inline-flex', padding:6, borderRadius:16, background:'#f5f5f4', border:'1px solid #e7e5e4', marginBottom:-1 }}>
              {[
                { href:'#overview', icon:'info',          label:'Aperçu' },
                { href:'#matches',  icon:'sports_soccer', label:`Matches (${matches.length})` },
                { href:'#location', icon:'map',           label:'Localisation' },
              ].map((t, i) => (
                <a key={t.href} href={t.href} className={`anc-tab ${i === 0 ? 'active' : ''}`}>
                  <span className="material-icons" style={{ fontSize:15 }}>{t.icon}</span>
                  {t.label}
                </a>
              ))}
            </div>
          </div>

          {/* ══ 8 + 4 GRID ════════════════════════════════════════════════ */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:32 }} className="lg:grid-2col">

            {/* ── LEFT COLUMN ───────────────────────────────────────────── */}
            <div style={{ display:'contents' }}>
              <div className="left-col fu d2" style={{ gridColumn:'span 8' }}>

                {/* Overview */}
                <section id="overview" style={{ scrollMarginTop:120, marginBottom:48 }}>
                  <div className="sec-title">À propos du stade</div>
                  <p style={{ fontSize:15, color:'#78716c', lineHeight:1.8, marginBottom:24 }}>
                    {stade.description || 'Aucune description disponible pour ce stade.'}
                  </p>

                  {/* Amenities */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12 }}>
                    {[
                      { icon:'ac_unit',     label:'Climatisation' },
                      { icon:'wifi',        label:'WiFi 5G' },
                      { icon:'accessible',  label:'Accessibilité' },
                      { icon:'star_border', label:'Loges VIP' },
                    ].map(a => (
                      <div key={a.label} style={{ padding:'16px 12px', borderRadius:14, background:'#fff', border:'1px solid #e7e5e4', display:'flex', flexDirection:'column', alignItems:'center', gap:8, textAlign:'center', transition:'border-color .2s,box-shadow .2s' }}
                           onMouseEnter={e => { e.currentTarget.style.borderColor='#C1272D'; e.currentTarget.style.boxShadow='0 4px 16px rgba(193,39,45,.08)'; }}
                           onMouseLeave={e => { e.currentTarget.style.borderColor='#e7e5e4'; e.currentTarget.style.boxShadow='none'; }}>
                        <span className="material-icons" style={{ fontSize:24, color:'#a8a29e' }}>{a.icon}</span>
                        <span style={{ fontSize:12, fontWeight:600, color:'#57534e' }}>{a.label}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Matches */}
                <section id="matches" style={{ scrollMarginTop:120, marginBottom:48 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                    <div className="sec-title" style={{ marginBottom:0 }}>Matches</div>
                    <div style={{ display:'flex', gap:4, padding:6, background:'#f5f5f4', borderRadius:14, border:'1px solid #e7e5e4' }}>
                      {[
                        { key:'upcoming', label:`À venir (${upcomingMatches.length})` },
                        { key:'all',      label:`Tous (${matches.length})` },
                      ].map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)}
                                className={`tab-btn ${activeTab === t.key ? 'active' : 'inactive'}`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {displayMatches.length === 0 ? (
                      <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e7e5e4', padding:'48px 24px', textAlign:'center' }}>
                        <span className="material-icons" style={{ fontSize:36, color:'#d6d3d1', display:'block', marginBottom:12 }}>sports_soccer</span>
                        <p style={{ fontSize:13, color:'#a8a29e' }}>
                          {activeTab === 'upcoming' ? 'Aucun match à venir' : 'Aucun match trouvé'}
                        </p>
                      </div>
                    ) : displayMatches.map((match) => {
                      const st    = getStatus(match.statut);
                      const live  = match.statut === 'live';
                      const team1 = match.matchTeams?.[0];
                      const team2 = match.matchTeams?.[1];

                      return (
                        <div key={match.id} className="match-card" style={{ borderColor: st.border }}
                             onClick={() => router.push(`/match/${match.id}`)}>

                          {/* Card header stripe */}
                          <div style={{ background:'linear-gradient(to right,#2d0a0e,#1a0608)', padding:'8px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              {live && (
                                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                                  <div style={{ width:7, height:7, borderRadius:'50%', background:'#C1272D', animation:'blink 1.2s infinite' }} />
                                  <span style={{ fontSize:9, fontWeight:700, color:'#C1272D', textTransform:'uppercase', letterSpacing:'.08em' }}>En direct</span>
                                </div>
                              )}
                              {match.type && <span style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,.45)', textTransform:'uppercase', letterSpacing:'.06em' }}>{match.type}</span>}
                            </div>
                            <span style={{ fontSize:10, color:'rgba(255,255,255,.4)', fontWeight:500 }}>
                              {new Date(match.dateOfMatch).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})}
                              {' · '}
                              {new Date(match.dateOfMatch).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
                            </span>
                          </div>

                          {/* Card body */}
                          <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:16 }}>
                            {/* Time */}
                            <div style={{ minWidth:60, textAlign:'center', flexShrink:0 }}>
                              <div className="syne" style={{ fontSize:18, fontWeight:800, color:'#1c1917', lineHeight:1 }}>
                                {new Date(match.dateOfMatch).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
                              </div>
                              <div style={{ fontSize:9, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'.07em', marginTop:3, fontWeight:600 }}>
                                {live ? "Aujourd'hui" : 'Heure'}
                              </div>
                            </div>

                            {/* Divider */}
                            <div style={{ width:1, height:36, background:'#f5f5f4', flexShrink:0 }} />

                            {/* Teams */}
                            <div style={{ flex:1 }}>
                              {team1 ? (
                                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                                  {/* Team 1 */}
                                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                    <div style={{ width:36, height:36, borderRadius:'50%', overflow:'hidden', border:'2px solid #f5f5f4', background:'#fafaf9', flexShrink:0 }}>
                                      {team1.imageUrl
                                        ? <img src={team1.imageUrl} alt={team1.teamName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                                        : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#78716c' }}>{team1.teamName?.slice(0,3).toUpperCase()}</div>
                                      }
                                    </div>
                                    <span className="syne" style={{ fontSize:13, fontWeight:700, color:'#1c1917' }}>{team1.teamName}</span>
                                  </div>

                                  {/* Score / VS */}
                                  <div style={{ padding:'6px 12px', borderRadius:8, background:'#f5f5f4', flexShrink:0 }}>
                                    {team1.goals != null
                                      ? <span className="syne" style={{ fontSize:14, fontWeight:800, color:'#1c1917' }}>{team1.goals} – {team2?.goals ?? 0}</span>
                                      : <span style={{ fontSize:11, fontWeight:700, color:'#a8a29e' }}>VS</span>
                                    }
                                  </div>

                                  {/* Team 2 */}
                                  <div style={{ display:'flex', alignItems:'center', gap:8, flexDirection:'row-reverse' }}>
                                    <div style={{ width:36, height:36, borderRadius:'50%', overflow:'hidden', border:'2px solid #f5f5f4', background:'#fafaf9', flexShrink:0 }}>
                                      {team2?.imageUrl
                                        ? <img src={team2.imageUrl} alt={team2.teamName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                                        : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#78716c' }}>{team2?.teamName?.slice(0,3).toUpperCase()}</div>
                                      }
                                    </div>
                                    <span className="syne" style={{ fontSize:13, fontWeight:700, color:'#1c1917', textAlign:'right' }}>{team2?.teamName || 'TBD'}</span>
                                  </div>
                                </div>
                              ) : (
                                <p style={{ fontSize:13, color:'#a8a29e', textAlign:'center' }}>Équipes à confirmer</p>
                              )}
                              {match.referee && (
                                <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:8 }}>
                                  <span className="material-icons" style={{ fontSize:12, color:'#a8a29e' }}>sports</span>
                                  <span style={{ fontSize:10, color:'#a8a29e', fontWeight:500 }}>{match.referee}</span>
                                </div>
                              )}
                            </div>

                            {/* Arrow */}
                            <div className="mc-arrow" style={{ width:32, height:32, borderRadius:'50%', border:'1px solid #e7e5e4', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#a8a29e', transition:'all .2s' }}>
                              <span className="material-icons" style={{ fontSize:16 }}>chevron_right</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {activeTab === 'upcoming' && matches.length > upcomingMatches.length && (
                    <div style={{ textAlign:'center', marginTop:16 }}>
                      <button onClick={() => setActiveTab('all')}
                              style={{ fontSize:13, fontWeight:600, color:'#C1272D', background:'none', border:'none', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:4 }}>
                        Voir tous les {matches.length} matches
                        <span className="material-icons" style={{ fontSize:16 }}>arrow_forward</span>
                      </button>
                    </div>
                  )}
                </section>

                {/* Gallery grid */}
                {images.length > 0 && (
                  <section className="fu d4" style={{ marginBottom:48 }}>
                    <div className="sec-title">Visuels</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gridTemplateRows:'repeat(2,1fr)', gap:12, height:380 }}>
                      <div style={{ gridColumn:'span 2', gridRow:'span 2', position:'relative', borderRadius:16, overflow:'hidden', border:'1px solid #e7e5e4', cursor:'pointer' }}
                           onClick={() => setSelectedImage(images[0]?.imageUrl)} className="gallery-thumb">
                        <img src={images[0]?.imageUrl} alt="g1" style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .7s' }} className="gimg"
                             onError={e => { e.target.src='https://images.unsplash.com/photo-1522778119026-d647f0565c6a?w=800&q=70'; }} />
                        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.2)', opacity:0, transition:'opacity .25s', display:'flex', alignItems:'center', justifyContent:'center' }} className="goverlay">
                          <span className="material-icons" style={{ fontSize:36, color:'#fff', filter:'drop-shadow(0 2px 4px rgba(0,0,0,.5))' }}>zoom_out_map</span>
                        </div>
                      </div>
                      {images.slice(1,3).map((img,i) => (
                        <div key={i} style={{ position:'relative', borderRadius:16, overflow:'hidden', border:'1px solid #e7e5e4', cursor:'pointer' }}
                             onClick={() => setSelectedImage(img.imageUrl)} className="gallery-thumb">
                          <img src={img.imageUrl} alt={`g${i+2}`} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .7s' }} className="gimg"
                               onError={e => { e.target.src='https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&q=70'; }} />
                        </div>
                      ))}
                      {images[3] && (
                        <div style={{ gridColumn:'span 2', position:'relative', borderRadius:16, overflow:'hidden', border:'1px solid #e7e5e4', cursor:'pointer' }}
                             onClick={() => setSelectedImage(images[3].imageUrl)} className="gallery-thumb">
                          <img src={images[3].imageUrl} alt="g4" style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .7s' }} className="gimg"
                               onError={e => { e.target.src='https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=70'; }} />
                          {images.length > 4 && (
                            <div onClick={e => { e.stopPropagation(); setShowGallery(true); }}
                                 style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.55)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                              <span className="syne" style={{ fontSize:24, fontWeight:800, color:'#fff' }}>+{images.length - 4}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>

              {/* ── RIGHT SIDEBAR ──────────────────────────────────────── */}
              <div className="right-col fu d3" style={{ gridColumn:'span 4' }}>

                {/* Spec card */}
                <div style={{ background:'#fff', border:'1px solid #e7e5e4', borderRadius:20, padding:24, boxShadow:'0 2px 16px -4px rgba(0,0,0,.06)', position:'sticky', top:120, marginBottom:20 }}>
                  <div className="sec-title" style={{ fontSize:15 }}>Spécifications</div>

                  {[
                    { icon:'location_on',   label:'Adresse',     value: stade.adresse || 'N/A' },
                    { icon:'location_city', label:'Ville',       value: stade.cityName || 'N/A' },
                    { icon:'public',        label:'Pays',        value: stade.country || 'Maroc' },
                    { icon:'event_seat',    label:'Capacité',    value: stade.capacity ? stade.capacity.toLocaleString()+' places' : 'N/A' },
                    ...(stade.responsable ? [{ icon:'person', label:'Responsable', value: stade.responsable }] : []),
                  ].map(row => (
                    <div key={row.label} className="spec-row">
                      <div style={{ display:'flex', alignItems:'center', gap:10, color:'#a8a29e' }}>
                        <span className="material-icons" style={{ fontSize:16 }}>{row.icon}</span>
                        <span style={{ fontSize:13 }}>{row.label}</span>
                      </div>
                      <span style={{ fontSize:13, fontWeight:600, color:'#1c1917', maxWidth:'55%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'right' }}>{row.value}</span>
                    </div>
                  ))}

                  {/* Map */}
                  <div id="location" style={{ marginTop:20, borderRadius:14, overflow:'hidden', border:'1px solid #e7e5e4', scrollMarginTop:120 }}>
                    <iframe
                      title={`Carte ${stade.name}`}
                      src={`https://maps.google.com/maps?q=${mapQ}&output=embed&z=15`}
                      style={{ width:'100%', height:176, border:'none', display:'block' }}
                      loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                    />
                    <a href={`https://www.google.com/maps/search/?api=1&query=${mapQ}`}
                       target="_blank" rel="noopener noreferrer"
                       style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', background:'#fafaf9', borderTop:'1px solid #e7e5e4', fontSize:11, fontWeight:700, color:'#57534e', textDecoration:'none', transition:'background .18s' }}
                       onMouseEnter={e => e.currentTarget.style.background='#f5f5f4'}
                       onMouseLeave={e => e.currentTarget.style.background='#fafaf9'}>
                      <span className="material-icons" style={{ fontSize:13, color:'#C1272D' }}>open_in_new</span>
                      Ouvrir dans Google Maps
                    </a>
                  </div>
                </div>

                {/* City card */}
                <div style={{ background:'linear-gradient(135deg,#2d0a0e,#1a0608)', borderRadius:20, padding:24 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    Ville hôte
                    <span className="material-icons" style={{ fontSize:16, color:'rgba(255,255,255,.3)' }}>place</span>
                  </div>
                  <div className="syne" style={{ fontSize:28, fontWeight:800, color:'#fff', marginBottom:4, lineHeight:1.1 }}>{stade.cityName}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,.5)', marginBottom:14 }}>{stade.country || 'Maroc'} · Coupe du Monde 2030</div>
                  {/* Gradient stripe */}
                  <div style={{ height:3, borderRadius:2, background:'linear-gradient(to right,#C1272D,#006233)', marginBottom:14 }} />
                  {stade.dateOfConstruction && (
                    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'rgba(255,255,255,.4)', fontWeight:600 }}>
                      <span className="material-icons" style={{ fontSize:14 }}>construction</span>
                      Construit en {new Date(stade.dateOfConstruction).getFullYear()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Desktop 2-col layout fix */}
      <style jsx>{`
        @media (min-width: 1024px) {
          .lg\\:grid-2col { grid-template-columns: repeat(12, 1fr) !important; }
          .left-col  { grid-column: span 8; }
          .right-col { grid-column: span 4; }
        }
        .gallery-thumb:hover .gimg { transform: scale(1.06); }
        .gallery-thumb:hover .goverlay { opacity: 1 !important; }
      `}</style>

      <Footer />

      {/* ── LIGHTBOX ──────────────────────────────────────────────────── */}
      {selectedImage && (
        <div style={{ position:'fixed', inset:0, zIndex:60, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,.9)', backdropFilter:'blur(12px)', padding:16 }}
             onClick={() => setSelectedImage(null)}>
          <button onClick={() => setSelectedImage(null)}
                  style={{ position:'absolute', top:20, right:20, width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff' }}>
            <span className="material-icons">close</span>
          </button>
          <img src={selectedImage} alt=""
               style={{ maxWidth:'100%', maxHeight:'90vh', objectFit:'contain', borderRadius:16, boxShadow:'0 32px 64px rgba(0,0,0,.8)' }}
               onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* ── GALLERY MODAL ──────────────────────────────────────────────── */}
      {showGallery && (
        <div style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(0,0,0,.88)', display:'flex', flexDirection:'column', backdropFilter:'blur(8px)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', borderBottom:'1px solid rgba(255,255,255,.1)' }}>
            <div className="syne" style={{ fontSize:14, fontWeight:700, color:'#fff' }}>Galerie — {stade.name}</div>
            <button onClick={() => setShowGallery(false)}
                    style={{ width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,.1)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff' }}>
              <span className="material-icons">close</span>
            </button>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:24 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12, maxWidth:960, margin:'0 auto' }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => { setShowGallery(false); setSelectedImage(img.imageUrl); }}
                     style={{ aspectRatio:'16/9', borderRadius:12, overflow:'hidden', cursor:'pointer' }}>
                  <img src={img.imageUrl} alt={`${stade.name} ${i+1}`}
                       style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .4s' }}
                       onMouseEnter={e => e.target.style.transform='scale(1.08)'}
                       onMouseLeave={e => e.target.style.transform='scale(1)'}
                       onError={e => { e.target.src='https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&q=70'; }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}