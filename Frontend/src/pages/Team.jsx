import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

const BASE = 'https://anas-gana1-fandb-backend.hf.space/api';

export default function TeamDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [team, setTeam]           = useState(null);
  const [players, setPlayers]     = useState([]);
  const [news, setNews]           = useState([]);
  const [cultures, setCultures]   = useState([]);
  const [matches, setMatches]     = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading]     = useState(true);

  const [supporterId, setSupporterId] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading]   = useState(false);
  const [favToast, setFavToast]       = useState(null);

  useEffect(() => {
    const sid = localStorage.getItem('supporterId');
    if (sid) setSupporterId(parseInt(sid));
  }, []);

  useEffect(() => {
    if (!supporterId || !id) return;
    fetch(`${BASE}/favorites/${supporterId}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setIsFavorited(arr.some(f =>
          f.type === 'Team' &&
          (String(f.ownerId) === String(id) || String(f.ownerID) === String(id))
        ));
      }).catch(() => {});
  }, [supporterId, id]);

  const toggleFavorite = async () => {
    if (!supporterId) { router.push('/login'); return; }
    setFavLoading(true);
    try {
      if (isFavorited) {
        const res = await fetch(`${BASE}/favorites/remove?supporterId=${supporterId}&ownerId=${id}&type=Team`, { method: 'DELETE' });
        if (res.ok || res.status === 204 || res.status === 200) { setIsFavorited(false); showToast('removed'); }
      } else {
        let res = await fetch(`${BASE}/favorites/add?supporterId=${supporterId}&ownerId=${id}&type=Team`, { method: 'POST' });
        if (!res.ok && res.status !== 201) {
          res = await fetch(`${BASE}/favorites/add`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ supporterId, ownerId: parseInt(id), type: 'Team', supporterID: supporterId, ownerID: parseInt(id) }),
          });
        }
        if (res.ok || res.status === 201 || res.status === 200) { setIsFavorited(true); showToast('added'); }
        else showToast('error');
      }
    } catch (e) { console.error('[Fav]', e); } finally { setFavLoading(false); }
  };

  const showToast = (type) => { setFavToast(type); setTimeout(() => setFavToast(null), 2600); };

  useEffect(() => {
    if (!id) return;
    const get = url => fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
    Promise.all([
      get(`${BASE}/teams/teams/${id}`),
      get(`${BASE}/teams/teams/plyers/${id}`).catch(() => []),
      get(`${BASE}/teams/teams/news/${id}`).catch(() => []),
      get(`${BASE}/teams/teams/contenuCultirel/${id}`).catch(() => []),
    ]).then(([tD, pD, nD, cD]) => {
      setTeam(tD);
      setPlayers(Array.isArray(pD) ? pD : []);
      setNews(Array.isArray(nD) ? nD : []);
      setCultures(Array.isArray(cD) ? cD : []);
      return get(`${BASE}/matches/matches/byTeam/${encodeURIComponent(tD.name)}`).catch(() => []);
    }).then(mD => { setMatches(Array.isArray(mD) ? mD : []); setLoading(false); })
    .catch(() => setLoading(false));
  }, [id]);

  const isDone   = s => { const v=(s||'').toLowerCase().trim(); return v.includes('termin')||v.includes('finish')||v==='done'||v==='completed'||v==='ended'; };
  const isLiveS  = s => { const v=(s||'').toLowerCase().trim(); return v==='live'||v==='commence'||v==='started'||v==='en cours'||v==='direct'; };

  const teamId = parseInt(id);
  const teamStats = (() => {
    let wins=0,draws=0,losses=0,gf=0,ga=0;
    matches.forEach(m => {
      if (!isDone(m.statut)) return;
      const my = m.matchTeams?.find(mt => Number(mt.teamId)===teamId);
      const op = m.matchTeams?.find(mt => Number(mt.teamId)!==teamId);
      if (!my||!op) return;
      const mg=Number(my.goals)||0, og=Number(op.goals)||0;
      gf+=mg; ga+=og;
      if (mg>og) wins++; else if (mg===og) draws++; else losses++;
    });
    return {wins,draws,losses,gf,ga};
  })();

  const formatDate = d => d ? new Date(d).toLocaleDateString('en-US',{day:'numeric',month:'short',year:'numeric'}) : 'TBD';
  const formatTime = d => d ? new Date(d).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '';

  const tabs = [
    { id:'overview', label:'Overview', icon:'⚡' },
    { id:'players',  label:'Squad',    icon:'👤' },
    { id:'matches',  label:'Fixtures', icon:'📅' },
    { id:'news',     label:'News',     icon:'📰' },
    { id:'culture',  label:'Culture',  icon:'🏛️'  },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{background:'#0a0a0f'}}>
      <div style={{width:56,height:56,border:'3px solid #C1272D',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite'}} />
    </div>
  );

  if (!team) return (
    <><Navbar />
    <div className="flex flex-col items-center justify-center min-h-screen" style={{background:'#0a0a0f'}}>
      <p className="text-xl text-white/60 mb-6">Team not found</p>
      <button onClick={() => router.push('/teams')} className="px-6 py-3 text-white rounded-xl" style={{background:'#C1272D'}}>Back</button>
    </div></>
  );

  const isHost = ['Morocco','Portugal','Spain'].includes(team.country);
  const gd = teamStats.gf - teamStats.ga;
  const totalPlayed = teamStats.wins + teamStats.draws + teamStats.losses;
  const winPct = totalPlayed > 0 ? Math.round((teamStats.wins / totalPlayed) * 100) : 0;

  return (
    <>
      <Head>
        <title>{team.name} — MoroccoFan2030</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        /* ── Fonts ── */
        .td-syne{font-family:'Syne',sans-serif}

        /* ── Keyframes (global, but class-scoped usage) ── */
        @keyframes td-spin{to{transform:rotate(360deg)}}
        @keyframes td-fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes td-fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes td-scaleIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
        @keyframes td-blink{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes td-heartbeat{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
        @keyframes td-toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

        /* ── Animations helpers ── */
        .td-fu{animation:td-fadeUp .5s ease-out forwards;opacity:0}
        .td-fi{animation:td-fadeIn .5s ease-out forwards;opacity:0}
        .td-si{animation:td-scaleIn .4s ease-out forwards;opacity:0}
        .td-d1{animation-delay:.08s}
        .td-d2{animation-delay:.16s}
        .td-d3{animation-delay:.24s}
        .td-d4{animation-delay:.32s}

        /* ── PAGE WRAPPER — all dark styles scoped here ── */
        .td-page{background:linear-gradient(160deg,#3d0a10 0%,#2a0608 30%,#1a0405 60%,#0f0203 100%);color:#fff;font-family:'Inter',sans-serif;min-height:100vh}
        .td-page *{box-sizing:border-box}

        /* ── HERO ── */
        .td-page .td-hero{position:relative;width:100%;min-height:520px;display:flex;align-items:flex-end;overflow:hidden;padding-top:80px;}
        .td-page .td-hero-bg{position:absolute;inset:0;background-size:cover;background-position:center top;transform:scale(1.06)}
        .td-page .td-hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(45,6,8,.5) 0%,rgba(26,4,5,.8) 60%,#1a0405 100%)}
        .td-page .td-hero-noise{position:absolute;inset:0;opacity:.03;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
        .td-page .td-hero-inner{position:relative;z-index:2;width:100%;max-width:1200px;margin:0 auto;padding:0 32px 56px}

        /* ── BADGES ── */
        .td-page .td-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:100px;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;border:1px solid}
        .td-page .td-badge-host{background:rgba(193,39,45,.15);border-color:rgba(193,39,45,.4);color:#ff6b6b}
        .td-page .td-badge-neutral{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.1);color:rgba(255,255,255,.5)}
        .td-page .td-badge-gold{background:rgba(240,165,0,.12);border-color:rgba(240,165,0,.3);color:#f0a500}
        .td-page .td-badge-green{background:rgba(0,98,51,.18);border-color:rgba(0,98,51,.4);color:#3dba7a}

        /* ── TABS BAR ── */
        .td-page .td-tabs{position:sticky;top:64px;z-index:50;background:rgba(20,3,5,.95);backdrop-filter:blur(16px);border-bottom:1px solid rgba(193,39,45,.15)}
        .td-page .td-tab{position:relative;padding:16px 20px;font-size:13px;font-weight:500;color:rgba(255,255,255,.4);cursor:pointer;background:none;border:none;white-space:nowrap;transition:color .2s;font-family:'Inter',sans-serif}
        .td-page .td-tab.active{color:#fff}
        .td-page .td-tab.active::after{content:'';position:absolute;bottom:0;left:16px;right:16px;height:2px;background:#C1272D;border-radius:2px 2px 0 0}
        .td-page .td-tab:hover:not(.active){color:rgba(255,255,255,.7)}

        /* ── SECTION ── */
        .td-page .td-section{max-width:1200px;margin:0 auto;padding:48px 32px}

        /* ── STAT ROW ── */
        .td-page .td-stat-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:40px}
        .td-page .td-stat-card{background:#1f0508;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:20px;text-align:center;transition:border-color .2s}
        .td-page .td-stat-card:hover{border-color:rgba(255,255,255,.15)}
        .td-page .td-stat-val{font-size:36px;font-weight:800;line-height:1;font-family:'Syne',sans-serif}
        .td-page .td-stat-lbl{font-size:11px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.08em;margin-top:6px;font-weight:500}

        /* ── GRIDS ── */
        .td-page .td-grid-2{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
        .td-page .td-grid-3{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}

        /* ── PLAYER CARD ── */
        .td-page .td-player{background:#1f0508;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:20px;display:flex;align-items:center;gap:16px;transition:border-color .2s,transform .2s}
        .td-page .td-player:hover{border-color:rgba(193,39,45,.4);transform:translateY(-2px)}
        .td-page .td-player-name{font-weight:600;font-size:15px;margin-bottom:3px;color:#fff}
        .td-page .td-player-meta{font-size:12px;color:rgba(255,255,255,.4)}
        .td-page .td-goals{margin-left:auto;background:rgba(240,165,0,.15);border:1px solid rgba(240,165,0,.3);color:#f0a500;font-size:11px;font-weight:700;padding:4px 10px;border-radius:8px;white-space:nowrap}

        /* ── MATCH CARD ── */
        .td-page .td-match{background:#1f0508;border:1px solid rgba(255,255,255,.07);border-radius:16px;overflow:hidden;cursor:pointer;transition:border-color .2s,transform .2s}
        .td-page .td-match:hover{border-color:rgba(193,39,45,.4);transform:translateY(-3px)}
        .td-page .td-match-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,.07);font-size:11px;color:rgba(255,255,255,.4)}
        .td-page .td-match-body{padding:28px 20px;display:flex;align-items:center;gap:16px}
        .td-page .td-match-team{flex:1;display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}
        .td-page .td-match-img{width:48px;height:48px;border-radius:50%;object-fit:cover;background:#170304;border:2px solid rgba(255,255,255,.1)}
        .td-page .td-match-name{font-size:12px;font-weight:600;line-height:1.2;color:#fff}
        .td-page .td-match-score{display:flex;flex-direction:column;align-items:center;min-width:80px;gap:4px}
        .td-page .td-score-nums{display:flex;align-items:center;gap:10px;font-size:30px;font-weight:800;font-family:'Syne',sans-serif;line-height:1}
        .td-page .td-score-lbl{font-size:10px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.1em;font-weight:600}
        .td-page .td-match-foot{padding:14px 20px;border-top:1px solid rgba(255,255,255,.07);font-size:11px;color:rgba(255,255,255,.4);display:flex;align-items:center;justify-content:space-between}
        .td-page .td-live-dot{width:6px;height:6px;border-radius:50%;background:#ef4444;display:inline-block;animation:td-blink 1.2s ease-in-out infinite;margin-right:5px}
        .td-page .td-pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase}
        .td-page .td-pill-w{background:rgba(61,186,122,.12);color:#3dba7a;border:1px solid rgba(61,186,122,.25)}
        .td-page .td-pill-d{background:rgba(240,165,0,.12);color:#f0a500;border:1px solid rgba(240,165,0,.25)}
        .td-page .td-pill-l{background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.25)}
        .td-page .td-pill-u{background:rgba(255,255,255,.05);color:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.1)}

        /* ── ARTICLE CARD ── */
        .td-page .td-article{background:#1f0508;border:1px solid rgba(255,255,255,.07);border-radius:16px;overflow:hidden;cursor:pointer;transition:border-color .2s,transform .2s}
        .td-page .td-article:hover{border-color:rgba(193,39,45,.4);transform:translateY(-3px)}
        .td-page .td-article-img{width:100%;height:160px;object-fit:cover;display:block}
        .td-page .td-article-body{padding:18px}
        .td-page .td-article-tag{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#C1272D;margin-bottom:8px}
        .td-page .td-article-title{font-size:15px;font-weight:600;line-height:1.4;margin-bottom:6px;transition:color .2s;color:#fff}
        .td-page .td-article:hover .td-article-title{color:#ff6b6b}
        .td-page .td-article-desc{font-size:12px;color:rgba(255,255,255,.4);line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .td-page .td-article-meta{margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.07);font-size:11px;color:rgba(255,255,255,.3)}

        /* ── PROFILE CARD ── */
        .td-page .td-profile{background:#1f0508;border:1px solid rgba(255,255,255,.07);border-radius:20px;overflow:hidden;margin-bottom:40px}
        .td-page .td-profile-banner{height:200px;position:relative;overflow:hidden}
        .td-page .td-profile-banner-img{position:absolute;inset:0;background-size:cover;background-position:center;filter:blur(6px) brightness(.5);transform:scale(1.08)}
        .td-page .td-profile-banner-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 0%,#1f0508 100%)}
        .td-page .td-profile-content{padding:0 28px 28px;position:relative;margin-top:-56px}
        .td-page .td-profile-logo{width:80px;height:80px;border-radius:50%;border:4px solid #1f0508;object-fit:cover;background:#170304}
        .td-page .td-profile-name{font-size:32px;font-weight:800;font-family:'Syne',sans-serif;line-height:1.1;margin:12px 0 4px;color:#fff}
        .td-page .td-profile-country{font-size:14px;color:rgba(255,255,255,.4);display:flex;align-items:center;gap:6px}
        .td-page .td-profile-desc{font-size:14px;color:rgba(255,255,255,.55);line-height:1.7;margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,.07)}

        /* ── PERF BAR ── */
        .td-page .td-perf{background:#1f0508;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:24px;margin-bottom:40px}
        .td-page .td-perf-row{display:flex;align-items:center;gap:14px;margin-bottom:14px}
        .td-page .td-perf-row:last-child{margin-bottom:0}
        .td-page .td-perf-label{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;width:52px;flex-shrink:0}
        .td-page .td-perf-track{flex:1;height:8px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden}
        .td-page .td-perf-fill{height:100%;border-radius:99px;transition:width 1.2s cubic-bezier(.4,0,.2,1)}
        .td-page .td-perf-num{font-size:13px;font-weight:700;width:28px;text-align:right;flex-shrink:0}

        /* ── FAV BUTTON ── */
        .td-page .td-fav{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:100px;border:1px solid;font-size:12px;font-weight:600;letter-spacing:.04em;cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif}
        .td-page .td-fav-off{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);color:rgba(255,255,255,.5)}
        .td-page .td-fav-off:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2);color:#fff}
        .td-page .td-fav-on{background:#C1272D;border-color:#C1272D;color:#fff;animation:td-heartbeat 2s ease-in-out infinite}
        .td-page .td-fav:disabled{opacity:.5;cursor:wait}

        /* ── SECTION TITLE ── */
        .td-page .td-stitle{font-size:22px;font-weight:700;font-family:'Syne',sans-serif;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;color:#fff}
        .td-page .td-scount{font-size:13px;color:rgba(255,255,255,.4);font-weight:400;font-family:'Inter',sans-serif}

        /* ── EMPTY ── */
        .td-page .td-empty{text-align:center;padding:80px 24px}
        .td-page .td-empty-icon{width:64px;height:64px;border-radius:50%;background:#170304;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;border:1px solid rgba(255,255,255,.07)}

        /* ── TOAST ── */
        .td-toast-wrap{position:fixed;bottom:28px;right:28px;z-index:9999;animation:td-toastIn .3s ease-out forwards}
        .td-toast{display:flex;align-items:center;gap:12px;padding:14px 20px;border-radius:14px;background:#170304;border:1px solid rgba(255,255,255,.1);font-size:13px;font-weight:500;min-width:240px;box-shadow:0 16px 48px rgba(0,0,0,.7);color:rgba(255,255,255,.8)}

        /* ── SCROLLBAR ── */
        .td-page .td-nosb::-webkit-scrollbar{display:none}
        .td-page .td-nosb{-ms-overflow-style:none;scrollbar-width:none}

        @media(max-width:640px){
          .td-page .td-hero-inner{padding:0 20px 40px}
          .td-page .td-section{padding:36px 20px}
          .td-page .td-grid-2,.td-page .td-grid-3{grid-template-columns:1fr}
          .td-page .td-stat-row{grid-template-columns:repeat(2,1fr)}
          .td-page .td-profile-name{font-size:26px}
        }
      `}</style>

      <Navbar />

      {/* ── TOAST (outside td-page so it overlays navbar too) ── */}
      {favToast && (
        <div className="td-toast-wrap">
          <div className="td-toast">
            <div style={{width:32,height:32,borderRadius:'50%',background:favToast==='added'?'#C1272D':favToast==='removed'?'#18181f':'#f59e0b',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:'1px solid rgba(255,255,255,.1)'}}>
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                {favToast==='added'
                  ? <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  : <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                }
              </svg>
            </div>
            <span>
              {favToast==='added' ? <><strong style={{color:'#fff'}}>{team.name}</strong> added to favorites</> : favToast==='removed' ? <><strong style={{color:'#fff'}}>{team.name}</strong> removed</> : <>Something went wrong</>}
            </span>
          </div>
        </div>
      )}

      {/* ══ DARK PAGE WRAPPER — scopes all dark styles ══ */}
      <div className="td-page">

      {/* ══ HERO ══ */}
      <header className="td-hero">
        <div className="td-hero-bg" style={{backgroundImage:`url(${team.imageUrl})`}} />
        <div className="td-hero-overlay" />
        <div className="td-hero-noise" />

        <div className="td-hero-inner">
          {/* Back */}
          <button onClick={() => router.push('/Teams')} className="td-fi"
            style={{display:'inline-flex',alignItems:'center',gap:6,padding:'7px 16px 7px 12px',borderRadius:100,background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.12)',color:'rgba(255,255,255,.7)',fontSize:12,fontWeight:500,cursor:'pointer',marginBottom:95,transition:'all .2s',marginTop:30}}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            All Teams
          </button>

          {/* Bottom section */}
          <div style={{display:'flex',flexDirection:'column',gap:20}}>
            {/* Badges row */}
            <div className="td-fu" style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:70}}>
              <span className="td-badge td-badge-neutral">
                <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeWidth="2"/>
                </svg>
                {team.country}
              </span>
              {isHost && <span className="td-badge td-badge-host"> Host Nation</span>}
              {team.participation > 0 && <span className="td-badge td-badge-gold"> {team.participation}× World Cup</span>}
              {team.coach && <span className="td-badge td-badge-neutral">Coach: {team.coach}</span>}
            </div>

            {/* Name + logo */}
            <div className="td-fu td-d1" style={{display:'flex',alignItems:'center',gap:20}}>
              <img src={team.imageUrl} alt={team.name}
                style={{width:72,height:72,borderRadius:'50%',objectFit:'cover',border:'3px solid rgba(255,255,255,.2)',flexShrink:0,background:'#18181f'}}
                onError={e => { e.target.src=`https://via.placeholder.com/72/C1272D/FFF?text=${team.name?.substring(0,2)}`; }} />
              <h1 className="td-syne" style={{fontSize:'clamp(36px,6vw,72px)',fontWeight:800,lineHeight:1,letterSpacing:'-.02em'}}>
                {team.name}
              </h1>
            </div>

            {/* Description */}
            {team.description && (
              <p className="td-fu td-d2" style={{fontSize:15,color:'rgba(255,255,255,.55)',maxWidth:560,lineHeight:1.7}}>
                {team.description}
              </p>
            )}

            {/* Actions + quick stats */}
            <div className="td-fu td-d3" style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:20}}>
              <button onClick={toggleFavorite} disabled={favLoading}
                className={`td-fav ${isFavorited ? 'td-fav-on' : 'td-fav-off'}`}>
                {favLoading
                  ? <svg style={{animation:'td-spin .7s linear infinite'}} width="14" height="14" fill="none" viewBox="0 0 24 24"><circle opacity=".25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path fill="currentColor" opacity=".75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  : <svg width="14" height="14" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                }
                {isFavorited ? 'Saved' : 'Add to Favorites'}
              </button>

              {/* Quick stats inline */}
              <div style={{display:'flex',gap:24}}>
                {[
                  {v:teamStats.wins,   l:'Wins',    c:'#3dba7a'},
                  {v:teamStats.draws,  l:'Draws',   c:'#f0a500'},
                  {v:teamStats.losses, l:'Losses',  c:'#f87171'},
                ].map(s => (
                  <div key={s.l} style={{textAlign:'center'}}>
                    <div className="td-syne" style={{fontSize:24,fontWeight:800,color:s.c,lineHeight:1}}>{s.v}</div>
                    <div style={{fontSize:10,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.1em',marginTop:3,fontWeight:600}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ══ TABS ══ */}
      <div className="td-tabs">
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 32px',display:'flex',overflowX:'auto'}} className="td-nosb">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`td-tab ${activeTab===t.id ? 'active' : ''}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <main style={{minHeight:'60vh'}}>

        {/* ── OVERVIEW ── */}
        {activeTab==='overview' && (
          <div className="td-section">
            {/* Profile card */}
            <div className="td-profile td-fu td-si">
              <div className="td-profile-banner">
                <div className="td-profile-banner-img" style={{backgroundImage:`url(${team.imageUrl})`}} />
                <div className="td-profile-banner-overlay" />
              </div>
              <div className="td-profile-content">
                <img src={team.imageUrl} alt={team.name} className="td-profile-logo"
                  onError={e => { e.target.src=`https://via.placeholder.com/80/C1272D/FFF?text=${team.name?.substring(0,2)}`; }} />
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12,marginTop:4}}>
                  <div>
                    <h2 className="td-profile-name">{team.name}</h2>
                    <div className="td-profile-country">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="2"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeWidth="2"/>
                      </svg>
                      {team.country}
                      {isHost && <span className="td-badge td-badge-host" style={{marginLeft:8}}>Host Nation</span>}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    {team.participation > 0 && <span className="td-badge td-badge-gold">{team.participation}× World Cup</span>}
                    {team.coach && <span className="td-badge td-badge-neutral">Coach: {team.coach}</span>}
                  </div>
                </div>
                {team.description && <p className="td-profile-desc">{team.description}</p>}
              </div>
            </div>

            {/* Stats grid */}
            <div className="td-stat-row td-fu td-d1">
              {[
                {v:teamStats.gf,                                l:'Goals Scored',    c:'#C1272D'},
                {v:teamStats.ga,                                l:'Goals Conceded',  c:'rgba(255,255,255,.5)'},
                {v:`${gd>=0?'+':''}${gd}`,                     l:'Goal Diff',        c:gd>0?'#3dba7a':gd<0?'#f87171':'rgba(255,255,255,.5)'},
                {v:`${winPct}%`,                                l:'Win Rate',         c:'#f0a500'},
                {v:matches.length,                              l:'Matches',          c:'rgba(255,255,255,.9)'},
                {v:players.length,                              l:'Players',          c:'rgba(255,255,255,.9)'},
              ].map(s => (
                <div key={s.l} className="td-stat-card">
                  <div className="td-stat-val" style={{color:s.c}}>{s.v}</div>
                  <div className="td-stat-lbl">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Performance bars */}
            {totalPlayed > 0 && (
              <div className="td-perf td-fu td-d2">
                <div className="td-stitle" style={{marginBottom:20,fontSize:16}}>Performance</div>
                {[
                  {label:'Wins',   val:teamStats.wins,  total:totalPlayed, color:'#3dba7a'},
                  {label:'Draws',  val:teamStats.draws, total:totalPlayed, color:'#f0a500'},
                  {label:'Losses', val:teamStats.losses,total:totalPlayed, color:'#f87171'},
                ].map(p => (
                  <div key={p.label} className="td-perf-row">
                    <div className="td-perf-label" style={{color:p.color}}>{p.label}</div>
                    <div className="td-perf-track">
                      <div className="td-perf-fill" style={{width:`${totalPlayed>0?(p.val/totalPlayed)*100:0}%`,background:p.color}} />
                    </div>
                    <div className="td-perf-num" style={{color:p.color}}>{p.val}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Squad preview */}
            {players.length > 0 && (
              <>
                <div className="td-stitle td-fu td-d3">
                  <span className="td-syne">Squad Preview</span>
                  <button onClick={() => setActiveTab('players')} style={{fontSize:13,color:'#C1272D',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:4,fontFamily:'Inter,sans-serif'}}>
                    View All
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
                <div className="td-grid-2">
                  {players.slice(0,4).map((p,i) => <PlayerCard key={p.id} player={p} index={i} />)}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── PLAYERS ── */}
        {activeTab==='players' && (
          <div className="td-section">
            <div className="td-stitle td-fu">
              <span className="td-syne">Team Squad</span>
              <span className="td-scount">{players.length} players</span>
            </div>
            {players.length > 0
              ? <div className="td-grid-2">{players.map((p,i) => <PlayerCard key={p.id} player={p} index={i} />)}</div>
              : <EmptyState msg="No players found" />
            }
          </div>
        )}

        {/* ── MATCHES ── */}
        {activeTab==='matches' && (
          <div className="td-section">
            <div className="td-stitle td-fu">
              <span className="td-syne">Fixtures & Results</span>
              <span className="td-scount">{matches.length} matches</span>
            </div>
            {matches.length > 0 ? (
              <div className="td-grid-3">
                {matches.map((m,i) => {
                  const my   = m.matchTeams?.find(mt => Number(mt.teamId)===teamId);
                  const op   = m.matchTeams?.find(mt => Number(mt.teamId)!==teamId);
                  const done = isDone(m.statut);
                  const live = isLiveS(m.statut);
                  const mg   = Number(my?.goals)||0;
                  const og   = Number(op?.goals)||0;
                  const isWin  = done && mg>og;
                  const isDraw = done && mg===og;
                  const isLoss = done && mg<og;
                  return (
                    <div key={m.id} className="td-match td-fu" style={{animationDelay:`${i*.04}s`}} onClick={() => router.push(`/match/${m.id}`)}>
                      {/* Head */}
                      <div className="td-match-head">
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          {live && <span className="td-pill td-pill-l"><span className="td-live-dot"/>LIVE</span>}
                          {done && <span className={`td-pill ${isWin?'td-pill-w':isDraw?'td-pill-d':'td-pill-l'}`}>{isWin?'Win':isDraw?'Draw':'Loss'}</span>}
                          {!live && !done && <span className="td-pill td-pill-u">Upcoming</span>}
                          {m.type && <span style={{color:'rgba(255,255,255,.25)',marginLeft:4}}>{m.type}</span>}
                        </div>
                        <span>{formatDate(m.dateOfMatch)}</span>
                      </div>
                      {/* Body */}
                      <div className="td-match-body">
                        <div className="td-match-team">
                          <img src={team.imageUrl} alt={team.name} className="td-match-img"
                            onError={e => { e.target.src=`https://via.placeholder.com/48/C1272D/FFF?text=${team.name?.substring(0,2)}`; }} />
                          <span className="td-match-name">{team.name}</span>
                        </div>
                        <div className="td-match-score">
                          {(done||live) ? (
                            <>
                              <div className="td-score-nums">
                                <span style={{color:isWin?'#3dba7a':isLoss?'#f87171':'#fff'}}>{mg}</span>
                                <span style={{fontSize:20,color:'rgba(255,255,255,.1)'}}>:</span>
                                <span style={{color:isLoss?'#3dba7a':isWin?'#f87171':'#fff'}}>{og}</span>
                              </div>
                              <span className="td-score-lbl">{done?'FT':'Live'}</span>
                            </>
                          ) : (
                            <>
                              <span style={{fontSize:13,color:'rgba(255,255,255,.3)',fontWeight:300,letterSpacing:'.15em'}}>VS</span>
                              <span style={{fontSize:12,color:'rgba(255,255,255,.4)',marginTop:2}}>{formatTime(m.dateOfMatch)}</span>
                            </>
                          )}
                        </div>
                        <div className="td-match-team">
                          {op?.imageUrl
                            ? <img src={op.imageUrl} alt={op.teamName} className="td-match-img" />
                            : <div className="td-match-img" style={{display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'rgba(255,255,255,.5)'}}>{(op?.teamName||'TBD').substring(0,3).toUpperCase()}</div>
                          }
                          <span className="td-match-name">{op?.teamName||'TBD'}</span>
                        </div>
                      </div>
                      {/* Foot */}
                      {(m.stadeName||m.referee) && (
                        <div className="td-match-foot">
                          <span>{m.stadeName && <><svg style={{display:'inline',marginRight:4,verticalAlign:'middle'}} width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeWidth="2"/><circle cx="12" cy="10" r="3" strokeWidth="2"/></svg>{m.stadeName}</>}</span>
                          <span style={{color:'rgba(193,39,45,.7)',display:'flex',alignItems:'center',gap:4}}>
                            View Details
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : <EmptyState msg="No matches yet" />}
          </div>
        )}

        {/* ── NEWS ── */}
        {activeTab==='news' && (
          <div className="td-section">
            <div className="td-stitle td-fu">
              <span className="td-syne">Latest News</span>
              <span className="td-scount">{news.length} articles</span>
            </div>
            {news.length > 0 ? (
              <div className="td-grid-3">
                {news.map((a,i) => (
                  <div key={a.id} className="td-article td-fu" style={{animationDelay:`${i*.04}s`}} onClick={() => router.push(`/news/${a.id}`)}>
                    <img src={a.imageUrl} alt={a.title} className="td-article-img"
                      onError={e => { e.target.src='https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&q=70'; }} />
                    <div className="td-article-body">
                      <div className="td-article-tag">News</div>
                      <div className="td-article-title">{a.title}</div>
                      <div className="td-article-desc">{a.description}</div>
                      <div className="td-article-meta">{new Date(a.dateOfCreation).toLocaleDateString()}{a.author ? ` · ${a.author}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState msg="No news yet" />}
          </div>
        )}

        {/* ── CULTURE ── */}
        {activeTab==='culture' && (
          <div className="td-section">
            <div className="td-stitle td-fu">
              <span className="td-syne">Cultural Heritage</span>
              <span className="td-scount">{cultures.length} highlights</span>
            </div>
            {cultures.length > 0 ? (
              <div className="td-grid-3">
                {cultures.map((c,i) => (
                  <div key={c.id} className="td-article td-fu" style={{animationDelay:`${i*.04}s`}} onClick={() => router.push(`/culture/${c.id}`)}>
                    <img src={c.imageUrl} alt={c.title} className="td-article-img"
                      onError={e => { e.target.src='https://images.unsplash.com/photo-1535069502363-2207185df19f?w=400&q=70'; }} />
                    <div className="td-article-body">
                      <div className="td-article-tag" style={{color:'#3dba7a'}}>Culture</div>
                      <div className="td-article-title" style={{fontFamily:'Syne,sans-serif'}}>{c.title}</div>
                      <div className="td-article-desc">{c.description}</div>
                      <div className="td-article-meta">{new Date(c.dateOfCreation).toLocaleDateString()}{c.author ? ` · ${c.author}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState msg="No cultural content yet" />}
          </div>
        )}

      </main>
      </div>{/* end .td-page */}

      <Footer />
    </>
  );
}

function PlayerCard({ player, index }) {
  const initials = (player.name||'??').substring(0,2).toUpperCase();
  return (
    <div className="td-player td-fu" style={{animationDelay:`${index*.04}s`}}>
      <div style={{width:52,height:52,borderRadius:'50%',overflow:'hidden',flexShrink:0,background:'#18181f',border:'2px solid rgba(255,255,255,.08)'}}>
        <img src={player.urlImage||player.imgUrl} alt={player.name}
          style={{width:'100%',height:'100%',objectFit:'cover'}}
          onError={e => { e.target.style.display='none'; e.target.parentElement.innerHTML=`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1e1e28,#2a2a38);color:rgba(255,255,255,.6);font-weight:700;font-size:14px">${initials}</div>`; }} />
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div className="td-player-name">{player.name}</div>
        <div className="td-player-meta">
          {player.age ? `Age ${player.age}` : '—'}
          {player.height ? ` · ${player.height}m` : ''}
          {player.weight ? ` · ${player.weight}kg` : ''}
        </div>
      </div>
      {player.goals > 0 && (
        <div className="td-goals">⚽ {player.goals}</div>
      )}
    </div>
  );
}

function EmptyState({ msg = 'Nothing here yet' }) {
  return (
    <div className="td-empty td-fu">
      <div className="td-empty-icon">
        <svg width="28" height="28" fill="none" stroke="rgba(255,255,255,.3)" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" strokeWidth="2"/>
          <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{fontSize:18,fontWeight:600,fontFamily:'Syne,sans-serif',color:'rgba(255,255,255,.6)',marginBottom:8}}>{msg}</div>
      <div style={{fontSize:13,color:'rgba(255,255,255,.3)'}}>Check back later</div>
    </div>
  );
}