import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Acceuil() {
  const [cities, setCities]                     = useState([]);
  const [stades, setStades]                     = useState([]);
  const [groups, setGroups]                     = useState([]);
  const [upcomingEvents, setUpcomingEvents]     = useState([]);
  const [latestNews, setLatestNews]             = useState([]);
  const [cultures, setCultures]                 = useState([]);
  const [teams, setTeams]                       = useState([]);
  const [upcomingMatches, setUpcomingMatches]   = useState([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [hoveredCulture, setHoveredCulture]     = useState(null);
  const [cultureVisible, setCultureVisible]     = useState(false);
  const [newsVisible, setNewsVisible]           = useState(false);

  const citiesScrollRef   = useRef(null);
  const stadesScrollRef   = useRef(null);
  const newsScrollRef     = useRef(null);
  const newsSectionRef    = useRef(null);
  const cultureSectionRef = useRef(null);

  // ── Data fetching ────────────────────────────────────────
  useEffect(() => {
    fetch('http://localhost:3309/api/acceuil/CityHosts/all')
      .then(r => r.json()).then(d => { setCities(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);
  useEffect(() => { fetch('http://localhost:3309/api/acceuil/stade/all').then(r=>r.json()).then(setStades).catch(console.error); }, []);
  useEffect(() => { fetch('http://localhost:3309/api/acceuil/accueil/groupes').then(r=>r.json()).then(setGroups).catch(console.error); }, []);
  useEffect(() => { fetch('http://localhost:3309/api/acceuil/evants/upcaming').then(r=>r.json()).then(setUpcomingEvents).catch(console.error); }, []);
  useEffect(() => { fetch('http://localhost:3309/api/acceuil/news/lastest').then(r=>r.json()).then(setLatestNews).catch(console.error); }, []);
  useEffect(() => { fetch('http://localhost:3309/api/acceuil/culture/foryou').then(r=>r.json()).then(setCultures).catch(console.error); }, []);
  useEffect(() => { fetch('http://localhost:3309/api/acceuil/teams/some').then(r=>r.json()).then(setTeams).catch(console.error); }, []);
  useEffect(() => {
    fetch('http://localhost:3309/api/acceuil/matches/upcoming')
      .then(r=>r.json())
      .then(data => { const now=new Date(); setUpcomingMatches(data.filter(m=>new Date(m.dateOfMatch)>now)); })
      .catch(console.error);
  }, []);

  // ── News auto-rotation ───────────────────────────────────
  useEffect(() => {
    if (!latestNews.length) return;
    const iv = setInterval(() => setCurrentNewsIndex(p => (p+1) % latestNews.length), 5000);
    return () => clearInterval(iv);
  }, [latestNews]);

  // ── Countdown ────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      const dist = new Date('2030-06-11T18:00:00Z').getTime() - Date.now();
      if (dist < 0) { const el=document.getElementById('countdown'); if(el) el.innerHTML='<span style="font-weight:800;color:#fff;font-family:Syne,sans-serif;font-size:22px">The Match Has Begun!</span>'; return; }
      const pad=(n,l=2)=>String(n).padStart(l,'0');
      const s=(id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
      s('days',   pad(Math.floor(dist/86400000),3));
      s('hours',  pad(Math.floor((dist%86400000)/3600000)));
      s('minutes',pad(Math.floor((dist%3600000)/60000)));
      s('seconds',pad(Math.floor((dist%60000)/1000)));
    };
    update(); const iv=setInterval(update,1000); return ()=>clearInterval(iv);
  }, []);

  // ── Intersection observers ───────────────────────────────
  useEffect(() => {
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting) setNewsVisible(true); },{threshold:.12});
    if(newsSectionRef.current) obs.observe(newsSectionRef.current);
    return ()=>obs.disconnect();
  }, []);
  useEffect(() => {
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting) setCultureVisible(true); },{threshold:.08});
    if(cultureSectionRef.current) obs.observe(cultureSectionRef.current);
    return ()=>obs.disconnect();
  }, []);

  // ── Slider helpers ───────────────────────────────────────
  const scroll = (ref,dir,amt=360) => { if(!ref.current) return; ref.current.scrollTo({left:ref.current.scrollLeft+(dir==='left'?-amt:amt),behavior:'smooth'}); };

  const getSideNews = () => {
    if (!latestNews.length) return [];
    return latestNews.filter((_,i)=>i!==currentNewsIndex).slice(0,3);
  };

  // ── Loading / error ──────────────────────────────────────
  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
      <img src="/images/logo.png" alt="Loading" style={{width:80,height:80}} />
    </div>
  );
  if (error) return <p style={{textAlign:'center',padding:'40px',color:'#C1272D'}}>Erreur: {error}</p>;

  return (
    <>
      <Head>
        <title>MoroccoFan2030 | The Kingdom Roars</title>
        <meta name="description" content="MoroccoFan2030 - Football World Cup 2030 in Morocco" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Inter:wght@300;400;500;600;700&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
         <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Inter',sans-serif; background:#fff; color:#1c1917; }
        .no-scrollbar::-webkit-scrollbar { display:none; }
        .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }

        /* Pills */
        .pill-red   { display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(193,39,45,.1);border:1px solid rgba(193,39,45,.25);border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#C1272D;font-family:'Syne',sans-serif; }
        .pill-green { display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(0,98,51,.1);border:1px solid rgba(0,98,51,.25);border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#006233;font-family:'Syne',sans-serif; }
        .pill-gold  { display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(240,165,0,.1);border:1px solid rgba(240,165,0,.25);border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#b07d00;font-family:'Syne',sans-serif; }
        .pill-dark  { display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#fff;font-family:'Syne',sans-serif; }

        /* Section helpers */
        .accent-bar        { width:3px;height:24px;background:linear-gradient(to bottom,#C1272D,#006233);border-radius:2px;flex-shrink:0; }
        .section-title     { font-family:'Syne',sans-serif;font-weight:800;font-size:26px;color:#1c1917; }
        .section-title-lg  { font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(24px,3vw,36px);color:#fff; }

        /* Animations */
        @keyframes fadeUp    { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeLeft  { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeRight { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes scaleIn   { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} }
        @keyframes glowPulse { 0%,100%{text-shadow:0 0 30px rgba(193,39,45,.5),0 0 60px rgba(193,39,45,.3)} 50%{text-shadow:0 0 50px rgba(193,39,45,.9),0 0 100px rgba(193,39,45,.5)} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes marquee   { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        .anim-fadeUp   { animation:fadeUp   .7s cubic-bezier(.22,.68,0,1.2) both; }
        .anim-fadeLeft { animation:fadeLeft .7s cubic-bezier(.22,.68,0,1.2) both; }
        .anim-fadeRight{ animation:fadeRight .65s cubic-bezier(.22,.68,0,1.2) both; }
        .anim-scaleIn  { animation:scaleIn .65s cubic-bezier(.22,.68,0,1.2) both; }
        .anim-glow     { animation:glowPulse 3s ease-in-out infinite; }
        .anim-float    { animation:float 5s ease-in-out infinite; }
        .d1{animation-delay:.05s}.d2{animation-delay:.12s}.d3{animation-delay:.2s}.d4{animation-delay:.28s}.d5{animation-delay:.36s}.d6{animation-delay:.44s}

        /* Marquee */
        .marquee-track { display:flex; animation:marquee 32s linear infinite; }
        .marquee-track:hover { animation-play-state:paused; }

        /* News card hover */
        .news-card-img { transition:transform .8s cubic-bezier(.25,.46,.45,.94); }
        .news-card:hover .news-card-img { transform:scale(1.05); }

        /* Culture card */
        .culture-card { cursor:pointer; border-radius:18px; overflow:hidden; position:relative; }
        .culture-img  { width:100%; height:100%; object-fit:cover; display:block; transition:transform .7s cubic-bezier(.25,.46,.45,.94); }
        .culture-card:hover .culture-img { transform:scale(1.07); }
        .culture-ovl  { position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.85) 0%,rgba(0,0,0,.25) 50%,transparent 100%);transition:opacity .4s; }
        .culture-card:hover .culture-ovl { opacity:.92; }
        .culture-body { position:absolute;bottom:0;left:0;right:0;padding:22px; }
        .culture-desc-reveal { font-size:11px;line-height:1.65;color:rgba(255,255,255,.7);max-height:0;overflow:hidden;opacity:0;transition:max-height .45s ease,opacity .4s ease,margin-top .3s; }
        .culture-card:hover .culture-desc-reveal { max-height:72px;opacity:1;margin-top:8px; }
        .culture-tag  { display:inline-block;padding:3px 10px;background:linear-gradient(135deg,#f0a500,#c88400);color:#fff;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border-radius:999px;font-family:'Syne',sans-serif;margin-bottom:8px; }
        .culture-title{ font-family:'Syne',sans-serif;font-weight:800;color:#fff;line-height:1.2; }
        .culture-cta  { display:flex;align-items:center;gap:6px;margin-top:10px;opacity:0;transition:opacity .3s; }
        .culture-card:hover .culture-cta { opacity:1; }
      `}</style>

      <Navbar />

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <header style={{position:'relative',width:'100%',paddingTop:160,paddingBottom:96,overflow:'hidden',borderBottom:'1px solid #e7e5e4'}}>
        {/* Video */}
        <div style={{position:'absolute',inset:0,zIndex:0}}>
          <video autoPlay muted loop playsInline style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}>
            <source src="/videos/maroc.mp4" type="video/mp4" />
          </video>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.62),rgba(0,0,0,.42),rgba(0,0,0,.72))'}} />
          <div className="anim-float" style={{position:'absolute',top:-60,left:-60,width:480,height:480,background:'radial-gradient(circle,rgba(193,39,45,.32),transparent 70%)',filter:'blur(60px)',pointerEvents:'none'}} />
          <div className="anim-float" style={{position:'absolute',bottom:-60,right:-60,width:400,height:400,background:'radial-gradient(circle,rgba(0,98,51,.28),transparent 70%)',filter:'blur(60px)',pointerEvents:'none',animationDelay:'2.5s'}} />
        </div>

        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px',position:'relative',zIndex:10}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',maxWidth:900,margin:'0 auto'}}>

            {/* Countdown */}
            <div className="anim-fadeUp" style={{marginBottom:40,background:'rgba(255,255,255,.07)',backdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,.14)',borderRadius:20,padding:'18px 32px'}}>
              <div style={{fontSize:9,fontWeight:700,color:'rgba(187,247,208,.9)',letterSpacing:'.12em',textTransform:'uppercase',fontFamily:'Syne,sans-serif',marginBottom:14}}>First Match Begins In · حتى المباراة الأولى</div>
              <div id="countdown" style={{display:'flex',alignItems:'center',gap:20}}>
                {[['days','Days',3],['hours','Hrs',2],['minutes','Min',2],['seconds','Sec',2]].map(([id,label],i)=>(
                  <div key={id} style={{display:'flex',alignItems:'center',gap:20}}>
                    <div style={{textAlign:'center'}}>
                      <div id={id} style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:38,color:'#fff',lineHeight:1,display:'block',minWidth:id==='days'?66:46}}>{id==='days'?'000':'00'}</div>
                      <div style={{fontSize:9,color:'rgba(187,247,208,.7)',letterSpacing:'.1em',textTransform:'uppercase',marginTop:4,fontFamily:'Syne,sans-serif'}}>{label}</div>
                    </div>
                    {i<3&&<span style={{color:'rgba(255,255,255,.25)',fontSize:30,fontWeight:200,marginTop:-14}}>:</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Headline */}
            <h1 className="anim-fadeUp d1" style={{fontFamily:'Inter,sans-serif',fontWeight:300,fontSize:'clamp(38px,7vw,78px)',color:'#fff',letterSpacing:'-.03em',lineHeight:1.05,marginBottom:22}}>
              Football returns to the<br />
              <span className="anim-glow" style={{fontFamily:'Amiri,serif',fontStyle:'italic',fontWeight:700,color:'#C1272D'}}>Kingdom of Light.</span>
            </h1>

            <p className="anim-fadeUp d2" style={{fontFamily:'Inter,sans-serif',fontSize:17,color:'rgba(255,255,255,.7)',maxWidth:560,lineHeight:1.7,marginBottom:36}}>
              Six cities, one heartbeat. A historic World Cup across two continents, uniting civilizations through the beautiful game.
            </p>

            <div className="anim-fadeUp d3" style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
              <button style={{display:'flex',alignItems:'center',gap:8,padding:'13px 28px',background:'linear-gradient(135deg,#C1272D,#a01e23)',color:'#fff',borderRadius:12,border:'none',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:14,cursor:'pointer',boxShadow:'0 8px 24px rgba(193,39,45,.35)',transition:'all .25s'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 14px 32px rgba(193,39,45,.5)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 8px 24px rgba(193,39,45,.35)';}}>
                <span className="material-icons" style={{fontSize:18}}>calendar_today</span>View Schedule
              </button>
              <button style={{display:'flex',alignItems:'center',gap:8,padding:'13px 28px',background:'rgba(255,255,255,.1)',color:'#fff',borderRadius:12,border:'1.5px solid rgba(255,255,255,.3)',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:14,cursor:'pointer',backdropFilter:'blur(12px)',transition:'all .25s'}}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.18)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.1)';}}>
                Discover Cities<span className="material-icons" style={{fontSize:18}}>arrow_forward</span>
              </button>
            </div>

            {/* Hero stat chips */}
           
          </div>
        </div>
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:80,background:'linear-gradient(to bottom,transparent,rgba(255,255,255,.12))',zIndex:5}} />
      </header>

      {/* ══════════════════════════════════════════
          TEAMS MARQUEE
      ══════════════════════════════════════════ */}
      <section style={{padding:'24px 0',background:'#fafaf9',borderBottom:'1px solid #e7e5e4',overflow:'hidden',position:'relative'}}>
        <div style={{position:'absolute',left:0,top:0,width:100,height:'100%',background:'linear-gradient(to right,#fafaf9,transparent)',zIndex:2,pointerEvents:'none'}} />
        <div style={{position:'absolute',right:0,top:0,width:100,height:'100%',background:'linear-gradient(to left,#fafaf9,transparent)',zIndex:2,pointerEvents:'none'}} />
        <div className="marquee-track">
          {[...teams,...teams].map((team,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,flexShrink:0,marginRight:40,opacity:.5,transition:'opacity .2s',cursor:'default'}}
              onMouseEnter={e=>e.currentTarget.style.opacity='1'}
              onMouseLeave={e=>e.currentTarget.style.opacity='.5'}>
              <div style={{width:34,height:34,borderRadius:'50%',background:'#fff',border:'2px solid #e7e5e4',overflow:'hidden'}}>
                <img src={team.imageUrl} alt={team.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
              </div>
              <span style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:12,color:'#1c1917',whiteSpace:'nowrap'}}>{team.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          UPCOMING MATCHES
      ══════════════════════════════════════════ */}
      <section id="matches" style={{padding:'80px 0',background:'#fff',borderBottom:'1px solid #e7e5e4'}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:36,flexWrap:'wrap',gap:16}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div className="accent-bar" />
              <div>
                <h2 className="section-title">Upcoming Matches</h2>
              </div>
            </div>
            <a href="#" style={{display:'flex',alignItems:'center',gap:6,fontSize:13,fontWeight:700,color:'#C1272D',fontFamily:'Syne,sans-serif',textDecoration:'none'}}>
              Full Calendar<span className="material-icons" style={{fontSize:16}}>arrow_forward</span>
            </a>
          </div>

          {upcomingMatches.length===0 ? (
            <p style={{textAlign:'center',padding:'48px 0',color:'#a8a29e',fontFamily:'Inter,sans-serif'}}>No upcoming matches at the moment. Check back soon!</p>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:20}}>
              {upcomingMatches.slice(0,3).map((match,idx)=>(
                <div key={match.id} className={`anim-fadeUp d${idx+1}`} style={{background:'linear-gradient(135deg,#2d0a0e,#1a0608)',borderRadius:16,padding:24,position:'relative',overflow:'hidden',border:'1px solid rgba(193,39,45,.2)',cursor:'pointer',transition:'transform .25s,box-shadow .25s'}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 20px 48px rgba(193,39,45,.2)';}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
                  <div style={{position:'absolute',top:-40,right:-40,width:140,height:140,background:'radial-gradient(circle,rgba(193,39,45,.25),transparent 70%)',filter:'blur(20px)'}} />
                  <div style={{position:'relative',zIndex:1}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                      <span className="pill-dark">Next Match</span>
                      <span className="material-icons" style={{fontSize:18,color:'rgba(255,255,255,.25)'}}>notifications</span>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                      {[0,1].map(ti=>(
                        <div key={ti} style={{textAlign:'center',flex:1}}>
                          <div style={{width:50,height:50,background:'rgba(255,255,255,.1)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 8px',overflow:'hidden',border:'1.5px solid rgba(255,255,255,.15)'}}>
                            <img src={match.matchTeams?.[ti]?.imageUrl||''} alt={match.matchTeams?.[ti]?.teamName||`Team ${ti+1}`} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>e.target.style.display='none'} />
                          </div>
                          <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:11,color:'rgba(255,255,255,.8)'}}>{match.matchTeams?.[ti]?.teamName||`Team ${ti+1}`}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{textAlign:'center',marginBottom:16}}>
                      <span style={{fontFamily:'Amiri,serif',fontStyle:'italic',fontSize:22,color:'rgba(255,255,255,.35)'}}>vs</span>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.4)',letterSpacing:'.08em',textTransform:'uppercase',fontFamily:'Syne,sans-serif',marginTop:2}}>{new Date(match.dateOfMatch).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                    </div>
                    <div style={{borderTop:'1px solid rgba(255,255,255,.08)',paddingTop:12,display:'flex',flexDirection:'column',gap:5}}>
                      {[['location_on',match.stadeName||'Stadium TBD'],['calendar_today',`${new Date(match.dateOfMatch).toLocaleDateString()} · ${match.type}`]].map(([ic,tx])=>(
                        <div key={ic} style={{display:'flex',alignItems:'center',gap:7}}>
                          <span className="material-icons" style={{fontSize:13,color:'rgba(255,255,255,.25)'}}>{ic}</span>
                          <span style={{fontSize:11,color:'rgba(255,255,255,.55)',fontFamily:'Inter,sans-serif'}}>{tx}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          GROUPS
      ══════════════════════════════════════════ */}
      <section id="groups" style={{padding:'80px 0',background:'#fafaf9',borderBottom:'1px solid #e7e5e4'}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px'}}>
          <div style={{textAlign:'center',marginBottom:40}}>
            <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:32,color:'#1c1917',letterSpacing:'-.02em'}}>Tournament Groups</h2>
            <p style={{fontFamily:'Inter,sans-serif',fontSize:14,color:'#a8a29e',marginTop:6}}>Projected standings and live updates</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16}}>
            {groups.map((group,gi)=>{
              const isRed=gi%2===0; const accent=isRed?'#C1272D':'#006233';
              return (
                <div key={group.id} style={{background:'#fff',border:`1px solid ${isRed?'rgba(193,39,45,.1)':'rgba(0,98,51,.1)'}`,borderRadius:14,padding:20,transition:'box-shadow .2s,transform .2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 8px 32px ${isRed?'rgba(193,39,45,.08)':'rgba(0,98,51,.08)'}`;e.currentTarget.style.transform='translateY(-2px)';}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow='';e.currentTarget.style.transform='';}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
                    <div style={{width:4,height:20,background:accent,borderRadius:2}} />
                    <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:16,color:accent}}>{group.name}</h3>
                  </div>
                  <table style={{width:'100%',borderCollapse:'collapse'}}>
                    <thead>
                      <tr style={{borderBottom:`1px solid ${isRed?'rgba(193,39,45,.08)':'rgba(0,98,51,.08)'}`}}>
                        {['#','Team','Pts'].map((h,hi)=>(
                          <th key={h} style={{fontFamily:'Syne,sans-serif',fontSize:9,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'#a8a29e',padding:'0 0 8px',textAlign:hi===2?'right':'left',width:hi===0?24:'auto'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(group.groupTeams||[]).map((team,ti)=>(
                        <tr key={team.id} style={{borderBottom:'1px solid #f5f5f4'}}>
                          <td style={{padding:'10px 0',fontFamily:'Syne,sans-serif',fontWeight:ti===0?800:400,fontSize:12,color:ti===0?accent:'#a8a29e'}}>{ti+1}</td>
                          <td style={{padding:'10px 4px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <div style={{width:28,height:28,borderRadius:'50%',overflow:'hidden',border:'1px solid #e7e5e4',flexShrink:0}}>
                                <img src={team.teamImageUrl} alt={team.teamName} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                              </div>
                              <span style={{fontFamily:'Inter,sans-serif',fontSize:12,fontWeight:ti===0?600:400,color:ti===0?'#1c1917':'#57534e'}}>{team.teamName}</span>
                            </div>
                          </td>
                          <td style={{padding:'10px 0',textAlign:'right',fontFamily:'Syne,sans-serif',fontWeight:ti===0?800:400,fontSize:13,color:ti===0?accent:'#57534e'}}>{team.wins*3+team.draws}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOST CITIES
      ══════════════════════════════════════════ */}
      <section id="cities" style={{padding:'64px 0',background:'linear-gradient(135deg,#2d0a0e,#1a0608,rgba(0,98,51,.3))',position:'relative',overflow:'hidden',borderBottom:'1px solid rgba(255,255,255,.05)'}}>
        <div style={{position:'absolute',top:-100,left:-100,width:500,height:500,background:'radial-gradient(circle,rgba(193,39,45,.2),transparent 70%)',filter:'blur(60px)',pointerEvents:'none'}} />
        <div style={{position:'absolute',bottom:-80,right:-80,width:400,height:400,background:'radial-gradient(circle,rgba(0,98,51,.2),transparent 70%)',filter:'blur(60px)',pointerEvents:'none'}} />
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px',display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:28,position:'relative',zIndex:2}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:3,height:24,background:'linear-gradient(to bottom,#C1272D,#006233)',borderRadius:2}} />
            <div>
              <h2 className="section-title-lg">Host Cities</h2>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            {['arrow_back','arrow_forward'].map((icon,i)=>(
              <button key={icon} onClick={()=>scroll(citiesScrollRef,i===0?'left':'right')} style={{width:40,height:40,borderRadius:'50%',border:'1.5px solid rgba(255,255,255,.2)',background:'rgba(255,255,255,.05)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'background .2s'}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.15)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'}>
                <span className="material-icons" style={{fontSize:20}}>{icon}</span>
              </button>
            ))}
          </div>
        </div>
        <div ref={citiesScrollRef} className="no-scrollbar" style={{display:'flex',overflowX:'auto',gap:16,paddingBottom:4,paddingLeft:24,paddingRight:24,position:'relative',zIndex:2}}>
          {cities.map(city=>(
            <div key={city.id} onClick={()=>window.location.href=`/cities/${city.id}`} style={{minWidth:300,flexShrink:0,cursor:'pointer',borderRadius:16,overflow:'hidden',position:'relative',height:400,border:'1.5px solid rgba(255,255,255,.08)',transition:'border-color .3s,transform .3s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,.3)';e.currentTarget.style.transform='translateY(-4px)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,.08)';e.currentTarget.style.transform='';}}>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.82),rgba(0,0,0,.2) 55%,transparent)',zIndex:1}} />
              <img src={city.imageUrl} alt={city.name} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .7s'}}
                onMouseEnter={e=>e.target.style.transform='scale(1.06)'}
                onMouseLeave={e=>e.target.style.transform=''} />
              <div style={{position:'absolute',bottom:24,left:24,zIndex:2}}>
                <div className="pill-dark" style={{marginBottom:8}}>Host City</div>
                <h3 style={{fontFamily:'Amiri,serif',fontWeight:700,fontSize:30,color:'#fff',lineHeight:1.1}}>{city.name}</h3>
                <p style={{fontFamily:'Inter,sans-serif',fontSize:12,color:'rgba(255,255,255,.6)',marginTop:6,display:'flex',alignItems:'center',gap:4}}>
                  <span className="material-icons" style={{fontSize:14}}>location_on</span>{city.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STADIUMS
      ══════════════════════════════════════════ */}
      <section id="stades" style={{padding:'64px 0',background:'#fff',borderBottom:'1px solid #e7e5e4',overflow:'hidden',position:'relative'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:`url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='1' fill='%23e7e5e4'/%3E%3C/svg%3E")`,backgroundSize:'24px',opacity:.6,pointerEvents:'none'}} />
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px',display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:28,position:'relative',zIndex:2}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div className="accent-bar" />
            <div>
              <h2 className="section-title">Stadiums</h2>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            {['arrow_back','arrow_forward'].map((icon,i)=>(
              <button key={icon} onClick={()=>scroll(stadesScrollRef,i===0?'left':'right')} style={{width:40,height:40,borderRadius:'50%',border:'1.5px solid #e7e5e4',background:'#fff',color:'#57534e',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .2s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#C1272D';e.currentTarget.style.color='#C1272D';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#e7e5e4';e.currentTarget.style.color='#57534e';}}>
                <span className="material-icons" style={{fontSize:20}}>{icon}</span>
              </button>
            ))}
          </div>
        </div>
        <div ref={stadesScrollRef} className="no-scrollbar" style={{display:'flex',overflowX:'auto',gap:16,paddingBottom:4,paddingLeft:24,paddingRight:24,position:'relative',zIndex:2}}>
          {stades.map(stade=>(
            <div key={stade.id} onClick={()=>window.location.href=`/stade/${stade.id}`} style={{minWidth:300,flexShrink:0,cursor:'pointer',borderRadius:16,overflow:'hidden',position:'relative',height:400,border:'1.5px solid #e7e5e4',transition:'border-color .3s,transform .3s,box-shadow .3s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#C1272D';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 20px 48px rgba(193,39,45,.14)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#e7e5e4';e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.85),rgba(0,0,0,.3) 50%,transparent)',zIndex:1}} />
              <img src={stade.imageUrl} alt={stade.name} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .7s'}}
                onMouseEnter={e=>e.target.style.transform='scale(1.06)'}
                onMouseLeave={e=>e.target.style.transform=''} />
              <div style={{position:'absolute',top:14,right:14,zIndex:2,background:'rgba(0,0,0,.5)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,.18)',borderRadius:999,padding:'4px 12px'}}>
                <span style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:10,color:'#fff',letterSpacing:'.06em'}}>{stade.capacity?stade.capacity.toLocaleString():'N/A'} cap.</span>
              </div>
              <div style={{position:'absolute',bottom:24,left:24,zIndex:2}}>
                <div className="pill-red" style={{marginBottom:8,background:'rgba(193,39,45,.85)',color:'#fff',border:'none'}}>Stadium</div>
                <h3 style={{fontFamily:'Amiri,serif',fontWeight:700,fontSize:28,color:'#fff',lineHeight:1.2}}>{stade.name}</h3>
                <p style={{fontFamily:'Inter,sans-serif',fontSize:12,color:'rgba(255,255,255,.65)',marginTop:6,display:'flex',alignItems:'center',gap:4}}>
                  <span className="material-icons" style={{fontSize:14}}>location_on</span>{stade.cityName||stade.city}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          NEWS — Modern animated section
      ══════════════════════════════════════════ */}
      <section id="news" ref={newsSectionRef} style={{padding:'80px 0',background:'#fff',borderBottom:'1px solid #e7e5e4',overflow:'hidden'}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px'}}>

          {/* Header */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:40,flexWrap:'wrap',gap:16}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div className="accent-bar" />
              <div>
                <h2 className="section-title">News & Updates</h2>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              {/* Pill dot indicators */}
              <div style={{display:'flex',gap:5,alignItems:'center'}}>
                {latestNews.map((_,idx)=>(
                  <button key={idx} onClick={()=>setCurrentNewsIndex(idx)} style={{width:idx===currentNewsIndex?24:8,height:8,borderRadius:999,background:idx===currentNewsIndex?'#C1272D':'#e7e5e4',border:'none',cursor:'pointer',transition:'all .35s cubic-bezier(.25,.46,.45,.94)',padding:0}} />
                ))}
              </div>
              {/* Arrows */}
              <div style={{display:'flex',gap:6}}>
                {['arrow_back','arrow_forward'].map((icon,i)=>(
                  <button key={icon} onClick={()=>scroll(newsScrollRef,i===0?'left':'right',400)} style={{width:38,height:38,borderRadius:'50%',border:'1.5px solid #e7e5e4',background:i===1?'linear-gradient(135deg,#C1272D,#a01e23)':'#fff',color:i===1?'#fff':'#57534e',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .2s'}}
                    onMouseEnter={e=>{if(i===0){e.currentTarget.style.borderColor='#C1272D';e.currentTarget.style.color='#C1272D';}}}
                    onMouseLeave={e=>{if(i===0){e.currentTarget.style.borderColor='#e7e5e4';e.currentTarget.style.color='#57534e';}}}>
                    <span className="material-icons" style={{fontSize:18}}>{icon}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Two-column grid */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 310px',gap:28,alignItems:'start'}}>

            {/* ── Featured article ── */}
            {latestNews.length>0 && latestNews[currentNewsIndex] && (
              <article key={`f-${currentNewsIndex}`} className="news-card" style={{cursor:'pointer',animation:newsVisible?'fadeLeft .65s cubic-bezier(.22,.68,0,1.2) both':'none'}}>
                <div style={{position:'relative',height:420,borderRadius:16,overflow:'hidden',marginBottom:20}}>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.78) 0%,rgba(0,0,0,.2) 55%,transparent)',zIndex:1}} />
                  <img className="news-card-img" src={latestNews[currentNewsIndex].imageUrl||'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2070'} alt={latestNews[currentNewsIndex].title} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  {/* Category */}
                  <div style={{position:'absolute',top:20,left:20,zIndex:2}}>
                    <span style={{display:'inline-flex',alignItems:'center',padding:'5px 12px',background:'linear-gradient(135deg,#C1272D,#a01e23)',color:'#fff',borderRadius:999,fontSize:10,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',fontFamily:'Syne,sans-serif',boxShadow:'0 4px 14px rgba(193,39,45,.35)'}}>
                      {latestNews[currentNewsIndex].category||'NEWS'}
                    </span>
                  </div>
                  {/* Dot indicators on image */}
                  <div style={{position:'absolute',top:20,right:20,zIndex:2,display:'flex',gap:5}}>
                    {latestNews.map((_,idx)=>(
                      <div key={idx} onClick={e=>{e.stopPropagation();setCurrentNewsIndex(idx);}} style={{width:idx===currentNewsIndex?24:8,height:8,borderRadius:999,background:idx===currentNewsIndex?'#fff':'rgba(255,255,255,.35)',cursor:'pointer',transition:'all .35s cubic-bezier(.25,.46,.45,.94)'}} />
                    ))}
                  </div>
                  {/* Overlay headline */}
                  <div style={{position:'absolute',bottom:24,left:24,right:24,zIndex:2}}>
                    <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(18px,2.4vw,26px)',color:'#fff',lineHeight:1.25,marginBottom:8}}>
                      {latestNews[currentNewsIndex].title||'Latest News Update'}
                    </h3>
                    <div style={{display:'flex',alignItems:'center',gap:8,fontSize:11,color:'rgba(255,255,255,.5)',fontFamily:'Inter,sans-serif'}}>
                      <span className="material-icons" style={{fontSize:12}}>calendar_today</span>
                      {new Date(latestNews[currentNewsIndex].dateOfCreation).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}
                      <span style={{width:3,height:3,borderRadius:'50%',background:'rgba(255,255,255,.35)'}} />
                      <span>4 min read</span>
                    </div>
                  </div>
                </div>
                <p style={{fontFamily:'Inter,sans-serif',fontSize:14,color:'#78716c',lineHeight:1.75}}>
                  {latestNews[currentNewsIndex].description||'Read the latest updates about Morocco 2030'}
                </p>
              </article>
            )}

            {/* ── Sidebar ── */}
            <div style={{display:'flex',flexDirection:'column',gap:0,animation:newsVisible?'fadeRight .65s cubic-bezier(.22,.68,0,1.2) .1s both':'none'}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#a8a29e',fontFamily:'Syne,sans-serif',marginBottom:14}}>More Stories</div>

              {getSideNews().map((news,i)=>(
                <article key={news.id||i} style={{display:'flex',gap:12,alignItems:'flex-start',padding:'14px 0',borderBottom:i<2?'1px solid #f5f5f4':'none',cursor:'pointer',borderRadius:8,transition:'background .2s',paddingLeft:4,paddingRight:4}}
                  onMouseEnter={e=>e.currentTarget.style.background='#fafaf9'}
                  onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <div style={{width:68,height:58,borderRadius:10,overflow:'hidden',flexShrink:0,border:'1px solid #e7e5e4'}}>
                    <img style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .5s'}} src={news.imageUrl||'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=800'} alt={news.title}
                      onMouseEnter={e=>e.target.style.transform='scale(1.08)'}
                      onMouseLeave={e=>e.target.style.transform=''} />
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:9,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',fontFamily:'Syne,sans-serif',color:i===0?'#006233':i===1?'#b07d00':'#C1272D',marginBottom:5}}>
                      {news.category||(i===0?'TEAM NEWS':i===1?'TOURISM':'FIFA')}
                    </div>
                    <h4 style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:12,color:'#1c1917',lineHeight:1.45,marginBottom:5}}>{news.title||'News Update'}</h4>
                    <div style={{fontSize:10,color:'#a8a29e',fontFamily:'Inter,sans-serif',display:'flex',alignItems:'center',gap:3}}>
                      <span className="material-icons" style={{fontSize:10}}>calendar_today</span>
                      {new Date(news.dateOfCreation).toLocaleDateString()}
                    </div>
                  </div>
                </article>
              ))}

              {/* Newsletter CTA */}
              <div style={{marginTop:18,padding:18,background:'linear-gradient(135deg,#2d0a0e,#1a0608)',borderRadius:14,position:'relative',overflow:'hidden',border:'1px solid rgba(193,39,45,.18)'}}>
                <div style={{position:'absolute',top:-30,right:-30,width:100,height:100,background:'radial-gradient(circle,rgba(193,39,45,.3),transparent 70%)',filter:'blur(16px)'}} />
                <div style={{position:'relative',zIndex:1}}>
                  <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:15,color:'#fff',marginBottom:5}}>Stay Updated</div>
                  <p style={{fontFamily:'Inter,sans-serif',fontSize:11,color:'rgba(255,255,255,.5)',marginBottom:12,lineHeight:1.55}}>Get the latest Morocco 2030 news in your inbox.</p>
                  <button style={{width:'100%',padding:'9px 0',background:'linear-gradient(135deg,#C1272D,#a01e23)',color:'#fff',border:'none',borderRadius:8,fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:12,cursor:'pointer',letterSpacing:'.04em',transition:'opacity .2s'}}
                    onMouseEnter={e=>e.currentTarget.style.opacity='.85'}
                    onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                    Subscribe Free →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CULTURE — Modern animated section
      ══════════════════════════════════════════ */}
      <section id="culture" ref={cultureSectionRef} style={{padding:'80px 0',background:'linear-gradient(135deg,#2d0a0e,#1a0608,rgba(0,55,28,.5))',position:'relative',overflow:'hidden',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
        <div style={{position:'absolute',top:-100,left:-80,width:600,height:600,background:'radial-gradient(circle,rgba(193,39,45,.18),transparent 70%)',filter:'blur(80px)',pointerEvents:'none'}} />
        <div style={{position:'absolute',bottom:-80,right:-80,width:500,height:500,background:'radial-gradient(circle,rgba(0,98,51,.18),transparent 70%)',filter:'blur(80px)',pointerEvents:'none'}} />

        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px',position:'relative',zIndex:2}}>
          {/* Header */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:36,flexWrap:'wrap',gap:16}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:3,height:24,background:'linear-gradient(to bottom,#C1272D,#006233)',borderRadius:2}} />
              <div>
                <h2 className="section-title-lg">Cultural Pulse</h2>
              </div>
            </div>
            <button style={{display:'flex',alignItems:'center',gap:8,padding:'9px 18px',background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.14)',borderRadius:10,color:'rgba(255,255,255,.7)',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:12,cursor:'pointer',letterSpacing:'.04em',transition:'all .2s'}}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.14)';e.currentTarget.style.color='#fff';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.07)';e.currentTarget.style.color='rgba(255,255,255,.7)';}}>
              Discover More<span className="material-icons" style={{fontSize:16}}>arrow_forward</span>
            </button>
          </div>

          {/* Culture grid — CSS grid with hover expand */}
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gridTemplateRows:'260px 260px',gap:12,height:532}}>

            {/* Large card (row span 2) */}
            {cultures[0] && (
              <div className="culture-card" style={{gridRow:'1/3',border:'1.5px solid rgba(255,255,255,.07)',animation:cultureVisible?'scaleIn .7s cubic-bezier(.22,.68,0,1.2) .05s both':'none'}}
                onMouseEnter={()=>setHoveredCulture(0)} onMouseLeave={()=>setHoveredCulture(null)}>
                <div className="culture-ovl" />
                <img className="culture-img" src={cultures[0].imageUrl||'https://images.unsplash.com/photo-1535069502363-2207185df19f?q=80&w=2070'} alt={cultures[0].title} />
                <div className="culture-body">
                  <div className="culture-tag">{cultures[0].category||'CULTURE'}</div>
                  <h3 className="culture-title" style={{fontSize:'clamp(20px,2.4vw,30px)'}}>{cultures[0].title||'Discover Moroccan Culture'}</h3>
                  <p className="culture-desc">{cultures[0].description||'Experience the rich cultural heritage of Morocco.'}</p>
                  <div className="culture-cta">
                    <span style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:10,color:'rgba(255,255,255,.6)',letterSpacing:'.08em'}}>EXPLORE</span>
                    <span className="material-icons" style={{fontSize:15,color:'#f0a500'}}>arrow_forward</span>
                  </div>
                </div>
              </div>
            )}

            {/* Small card 1 */}
            {cultures[1] && (
              <div className="culture-card" style={{border:'1.5px solid rgba(255,255,255,.07)',animation:cultureVisible?'scaleIn .7s cubic-bezier(.22,.68,0,1.2) .15s both':'none'}}
                onMouseEnter={()=>setHoveredCulture(1)} onMouseLeave={()=>setHoveredCulture(null)}>
                <div className="culture-ovl" />
                <img className="culture-img" src={cultures[1].imageUrl||'https://images.unsplash.com/photo-1590418606746-0188b23364f9?q=80&w=800'} alt={cultures[1].title} />
                <div className="culture-body">
                  <div className="culture-tag">{cultures[1].category||'HERITAGE'}</div>
                  <h4 className="culture-title" style={{fontSize:16}}>{cultures[1].title||'Moroccan Heritage'}</h4>
                  <p className="culture-desc" style={{fontSize:11}}>{cultures[1].description||''}</p>
                </div>
              </div>
            )}

            {/* Small card 2 */}
            {cultures[2] && (
              <div className="culture-card" style={{border:'1.5px solid rgba(255,255,255,.07)',animation:cultureVisible?'scaleIn .7s cubic-bezier(.22,.68,0,1.2) .25s both':'none'}}
                onMouseEnter={()=>setHoveredCulture(2)} onMouseLeave={()=>setHoveredCulture(null)}>
                <div className="culture-ovl" />
                <img className="culture-img" src={cultures[2].imageUrl||'https://images.unsplash.com/photo-1512553353614-82a737009659?q=80&w=800'} alt={cultures[2].title} />
                <div className="culture-body">
                  <div className="culture-tag">{cultures[2].category||'ARCHITECTURE'}</div>
                  <h4 className="culture-title" style={{fontSize:16}}>{cultures[2].title||'Moroccan Architecture'}</h4>
                  <p className="culture-desc" style={{fontSize:11}}>{cultures[2].description||''}</p>
                </div>
              </div>
            )}
          </div>

          {/* Culture info strip */}
          
        </div>
      </section>

      {/* ══════════════════════════════════════════
          EVENTS
      ══════════════════════════════════════════ */}
      <section id="events" style={{padding:'80px 0',background:'#fafaf9',borderBottom:'1px solid #e7e5e4',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:`url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='1' fill='%23e7e5e4'/%3E%3C/svg%3E")`,backgroundSize:'24px',opacity:.5,pointerEvents:'none'}} />
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px',position:'relative',zIndex:2}}>
          {/* Header */}
          <div style={{textAlign:'center',marginBottom:48}}>
            
            <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(26px,4vw,42px)',color:'#1c1917',letterSpacing:'-.02em',lineHeight:1.1}}>
              Beyond the <span style={{fontFamily:'Amiri,serif',fontStyle:'italic',fontWeight:700,color:'#C1272D'}}>Stadiums</span>
            </h2>
            <p style={{fontFamily:'Inter,sans-serif',fontSize:14,color:'#78716c',marginTop:10,maxWidth:500,margin:'10px auto 0'}}>Fanzones, festivals, and celebrations across the Kingdom</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:18}}>
            {upcomingEvents.slice(0,5).map((event,ei)=>(
              <div key={event.id} className={`anim-fadeUp d${(ei%4)+1}`} style={{background:'#fff',borderRadius:14,overflow:'hidden',border:'1px solid #e7e5e4',cursor:'pointer',transition:'all .3s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#C1272D';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 20px 48px rgba(193,39,45,.1)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#e7e5e4';e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
                <div style={{position:'relative',height:196,overflow:'hidden'}}>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.72),transparent)',zIndex:1}} />
                  <img src={event.imageUrl||'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800'} alt={event.name} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .6s'}}
                    onMouseEnter={e=>e.target.style.transform='scale(1.08)'}
                    onMouseLeave={e=>e.target.style.transform=''} />
                  <div style={{position:'absolute',top:12,left:12,zIndex:2}}><span className="pill-dark">Event</span></div>
                  <div style={{position:'absolute',bottom:12,left:14,zIndex:2}}>
                    <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:17,color:'#fff',lineHeight:1.2}}>{event.name||'Event'}</h3>
                  </div>
                </div>
                <div style={{padding:'14px 16px'}}>
                  {[['calendar_today',new Date(event.dateOfEvent).toLocaleDateString()],['location_on',event.cityName||'Location TBD']].map(([ic,tx])=>(
                    <div key={ic} style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                      <span className="material-icons" style={{fontSize:13,color:'#a8a29e'}}>{ic}</span>
                      <span style={{fontFamily:'Inter,sans-serif',fontSize:11,color:'#78716c'}}>{tx}</span>
                    </div>
                  ))}
                  <p style={{fontFamily:'Inter,sans-serif',fontSize:11,color:'#a8a29e',lineHeight:1.6,marginTop:6}}>{event.description||'Join us for this exciting event.'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}