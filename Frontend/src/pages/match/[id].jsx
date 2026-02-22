import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MatchDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [match, setMatch]       = useState(null);
  const [events, setEvents]     = useState([]);
  const [lineup, setLineup]     = useState([]);
  const [weather, setWeather]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [prediction, setPrediction]         = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [predSubmitting, setPredSubmitting] = useState(false);
  const [predMessage, setPredMessage]       = useState(null);
  const [matchPredictions, setMatchPredictions] = useState([]);

  const [supporterId, setSupporterId]           = useState(null);
  const [supporterIdLoaded, setSupporterIdLoaded] = useState(false);

  const [reviews, setReviews]               = useState([]);
  const [reviewText, setReviewText]         = useState('');
  const [reviewRating, setReviewRating]     = useState(0);
  const [hoveredStar, setHoveredStar]       = useState(0);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage]   = useState(null);

  const matchRef           = useRef(null);
  const weatherFetchedRef  = useRef(false);
  const [chrono, setChrono] = useState(0);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sid = parseInt(localStorage.getItem('supporterId') || '0', 10);
      setSupporterId(sid > 0 ? sid : null);
      setSupporterIdLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!id || !supporterIdLoaded) return;
    const fetchAll = async () => {
      try {
        const [matchRes, eventsRes, lineupRes, predictionsRes, reviewsRes] = await Promise.all([
          fetch(`https://anas-gana1-fandb-backend.hf.space/api/matches/matches/${id}`),
          fetch(`https://anas-gana1-fandb-backend.hf.space/api/matches/matches/${id}/events`),
          fetch(`https://anas-gana1-fandb-backend.hf.space/api/matches/matches/${id}/players/lineup`),
          fetch(`https://anas-gana1-fandb-backend.hf.space/api/predictions/match/${id}`),
          fetch(`https://anas-gana1-fandb-backend.hf.space/api/reviews/match/${id}`),
        ]);
        const [matchData, eventsData, lineupData, predictionsData, reviewsData] = await Promise.all([
          matchRes.json(), eventsRes.json(), lineupRes.json(), predictionsRes.json(), reviewsRes.json(),
        ]);
        setMatch(matchData); matchRef.current = matchData;
        setEvents(eventsData); setLineup(lineupData);
        setMatchPredictions(predictionsData || []);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        if (matchData?.stadeName && !weatherFetchedRef.current) {
          weatherFetchedRef.current = true;
          fetchWeather(matchData.stadeName);
        }
        if (supporterId && supporterId > 0) {
          try {
            const predRes = await fetch(`http://localhost:3309/api/predictions/supporter/${supporterId}/match/${id}`);
            if (predRes.ok) {
              const predData = await predRes.json();
              setPrediction(predData);
              setSelectedTeamId(predData.predictedWinnerId);
            }
          } catch (_) {}
        }
        setLoading(false);
      } catch (err) { console.error(err); setLoading(false); }
    };
    fetchAll();
    const interval = setInterval(fetchAll, 15_000);
    return () => clearInterval(interval);
  }, [id, supporterId, supporterIdLoaded]);

  useEffect(() => {
    if (!supporterIdLoaded || !id || !supporterId) { setIsFavorite(false); return; }
    fetch(`http://localhost:3309/api/favorites/check?supporterId=${supporterId}&ownerId=${id}&type=Match`)
      .then(r => r.json()).then(setIsFavorite).catch(() => setIsFavorite(false));
  }, [id, supporterId, supporterIdLoaded]);

  const fetchWeather = async (cityName) => {
    try {
      const city = cityName.split(',')[0].trim() || 'Casablanca';
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},MA&units=metric&appid=YOUR_API_KEY`);
      if (res.ok) setWeather(await res.json());
    } catch (_) {}
  };

  useEffect(() => {
    if (!match || !id) return;
    const statut = match.statut;
    const keyT1 = `match_${id}_t1_start`, keyT1S = `match_${id}_t1_statut`;
    const keyT2 = `match_${id}_t2_start`, keyT2S = `match_${id}_t2_statut`;
    if (statut === 'fin meta 1') { setChrono(45*60); return; }
    if (statut === 'termine' || statut === 'Finished') {
      [keyT1,keyT1S,keyT2,keyT2S].forEach(k => localStorage.removeItem(k));
      setChrono(90*60); return;
    }
    if (!['commence','meta 2','started','LIVE'].includes(statut)) { setChrono(0); return; }
    if (['commence','started','LIVE'].includes(statut)) {
      let t1 = parseInt(localStorage.getItem(keyT1)||'0');
      if (!t1 || localStorage.getItem(keyT1S) !== statut) {
        t1 = Date.now(); localStorage.setItem(keyT1,String(t1)); localStorage.setItem(keyT1S,statut);
      }
      const tick = () => setChrono(Math.min(Math.floor((Date.now()-t1)/1000), 45*60));
      tick(); const iv = setInterval(tick,1000); return () => clearInterval(iv);
    }
    if (statut === 'meta 2') {
      let t2 = parseInt(localStorage.getItem(keyT2)||'0');
      if (!t2 || localStorage.getItem(keyT2S) !== 'meta 2') {
        t2 = Date.now(); localStorage.setItem(keyT2,String(t2)); localStorage.setItem(keyT2S,'meta 2');
      }
      const tick = () => setChrono(Math.min(45*60+Math.floor((Date.now()-t2)/1000), 90*60));
      tick(); const iv = setInterval(tick,1000); return () => clearInterval(iv);
    }
  }, [match?.statut, id]);

  const submitReview = async () => {
    if (!supporterId) { router.push('/Login'); return; }
    if (!reviewText.trim() || reviewRating === 0) return;
    setReviewSubmitting(true); setReviewMessage(null);
    try {
      const res = await fetch('http://localhost:3309/api/reviews', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ supporterId, matchId:parseInt(id), description:reviewText, rating:reviewRating }),
      });
      if (res.ok) {
        const nr = await res.json();
        setReviews(p => [nr,...p]); setReviewText(''); setReviewRating(0);
        setReviewMessage({ type:'success', text:'Avis publié avec succès !' });
        setTimeout(() => setReviewMessage(null), 3000);
      } else { setReviewMessage({ type:'error', text:"Erreur lors de l'envoi." }); }
    } catch (_) { setReviewMessage({ type:'error', text:'Erreur réseau.' }); }
    setReviewSubmitting(false);
  };

  const submitPrediction = async () => {
    if (!supporterId) { router.push('/Login'); return; }
    if (!selectedTeamId) return;
    setPredSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3309/api/predictions/add?matchId=${id}&supporterId=${supporterId}&predictedWinnerId=${selectedTeamId}`, { method:'POST' });
      if (res.ok) {
        const data = await res.json(); setPrediction(data);
        setPredMessage(' Pronostic enregistré !');
        const pr = await fetch(`http://localhost:3309/api/predictions/match/${id}`);
        setMatchPredictions(await pr.json() || []);
      } else { setPredMessage(" Erreur lors de l'enregistrement."); }
    } catch (_) { setPredMessage(' Erreur réseau.'); }
    setPredSubmitting(false);
  };

  const toggleFavorite = async () => {
    if (!supporterId) { router.push('/Login'); return; }
    setFavLoading(true);
    try {
      if (isFavorite) {
        const res = await fetch(`http://localhost:3309/api/favorites/${supporterId}/type/Match`);
        const favs = await res.json();
        const fav = favs.find(f => f.ownerId === parseInt(id));
        if (fav) { await fetch(`http://localhost:3309/api/favorites/${fav.id}`, { method:'DELETE' }); setIsFavorite(false); }
      } else {
        await fetch(`http://localhost:3309/api/favorites/add?supporterId=${supporterId}&ownerId=${id}&type=Match`, { method:'POST' });
        setIsFavorite(true);
      }
    } catch (e) { console.error(e); }
    setFavLoading(false);
  };

  const getStatus = (s) => {
    const map = {
      LIVE:{'label':'LIVE',live:true,half:'1ère mi-temps'}, started:{label:'LIVE',live:true,half:'1ère mi-temps'},
      commence:{label:'LIVE',live:true,half:'1ère mi-temps'}, 'fin meta 1':{label:'MI-TEMPS',live:false,half:'Mi-temps'},
      'meta 2':{label:'LIVE',live:true,half:'2ème mi-temps'}, termine:{label:'FT',live:false,half:'Terminé'},
      Finished:{label:'FT',live:false,half:'Terminé'}, upcoming:{label:'À VENIR',live:false,half:''},
    };
    return map[s] || { label:'PRÉVU', live:false, half:'' };
  };

  const formatChrono = (t) => { const s=Math.max(0,Math.floor(t)); return `${Math.floor(s/60)}'${(s%60).toString().padStart(2,'0')}`+'"'; };
  const isActive   = (s) => ['LIVE','started','commence','meta 2'].includes(s);
  const isFinished = (s) => ['termine','Finished'].includes(s);
  const isUpcoming = (s) => !isActive(s) && !isFinished(s) && s !== 'fin meta 1';

  const getEventIcon = (info='') => {
    const l = info.toLowerCase();
    if (l.includes('goal'))         return { icon:'⚽', color:'#C1272D', bg:'rgba(193,39,45,.1)' };
    if (l.includes('yellow'))       return { icon:'🟨', color:'#ca8a04', bg:'rgba(234,179,8,.1)' };
    if (l.includes('red'))          return { icon:'🟥', color:'#dc2626', bg:'rgba(220,38,38,.1)' };
    if (l.includes('substitution')) return { icon:'🔄', color:'#57534e', bg:'rgba(0,0,0,.05)' };
    return                                 { icon:'ℹ️', color:'#78716c', bg:'rgba(0,0,0,.04)' };
  };

  const getTeamLineup  = (tid) => lineup.filter(p => p.teamID === tid);
  const starters       = (arr) => arr.filter(p => p.starter);
  const substitutes    = (arr) => arr.filter(p => !p.starter);
  const getAvgRating   = () => reviews.length === 0 ? 0 : (reviews.reduce((s,r) => s+r.rating,0)/reviews.length).toFixed(1);
  const getRatingDist  = () => { const d={5:0,4:0,3:0,2:0,1:0}; reviews.forEach(r => { if(d[r.rating]!==undefined) d[r.rating]++; }); return d; };
  const getMotM        = () => { const p=lineup.filter(x=>x.rating>0); return p.length ? p.reduce((b,c)=>c.rating>(b?.rating||0)?c:b,null) : null; };

  const getPredStats = () => {
    const t1=match?.matchTeams?.[0], t2=match?.matchTeams?.[1];
    if (!t1||!t2||!matchPredictions.length) return {team1Percent:0,team2Percent:0,total:0,team1Count:0,team2Count:0};
    const t1c=matchPredictions.filter(p=>p.predictedWinnerId===t1.teamId).length;
    const t2c=matchPredictions.filter(p=>p.predictedWinnerId===t2.teamId).length;
    const tot=matchPredictions.length;
    return { team1Count:t1c, team2Count:t2c, total:tot,
      team1Percent:tot>0?Math.round(t1c/tot*100):0,
      team2Percent:tot>0?Math.round(t2c/tot*100):0 };
  };

  // ── Prediction Panel ───────────────────────────
  const PredictionPanel = () => {
    const t1=match?.matchTeams?.[0], t2=match?.matchTeams?.[1];
    const st=match?.statut, stats=getPredStats();

    const PredBar = () => stats.total > 0 ? (
      <div style={{ marginTop:12 }}>
        <div style={{ fontSize:11, color:'#a8a29e', textAlign:'center', marginBottom:8 }}>{stats.total} pronostic{stats.total>1?'s':''}</div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4 }}>
          <span style={{ color:'#57534e' }}>{t1?.teamName}</span>
          <span style={{ fontWeight:700, color:'#1c1917' }}>{stats.team1Percent}%</span>
        </div>
        <div style={{ height:6, background:'#f5f5f4', borderRadius:99, overflow:'hidden', display:'flex' }}>
          <div style={{ width:stats.team1Percent+'%', background:'#C1272D', transition:'width .7s' }} />
          <div style={{ width:stats.team2Percent+'%', background:'#1c1917', transition:'width .7s' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginTop:4 }}>
          <span style={{ fontWeight:700, color:'#1c1917' }}>{stats.team2Percent}%</span>
          <span style={{ color:'#57534e' }}>{t2?.teamName}</span>
        </div>
      </div>
    ) : null;

    if (prediction) {
      const winnerName = prediction.predictedWinnerName || 'Inconnue';
      const s = prediction.status?.toLowerCase();
      const cfg = {
        correct:   { bg:'rgba(61,186,122,.08)', border:'rgba(61,186,122,.25)', ic:'#006233', lbl:'Correct !' },
        incorrect: { bg:'rgba(193,39,45,.06)',  border:'rgba(193,39,45,.2)', ic:'#C1272D', lbl:'Incorrect' },
        pending:   { bg:'rgba(240,165,0,.08)',  border:'rgba(240,165,0,.25)', ic:'#b45309', lbl:'En attente' },
      };
      const c = cfg[s] || cfg.pending;
      return (
        <div style={{ borderRadius:16, padding:20, background:c.bg, border:'1px solid '+c.border }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <span style={{ fontSize:15 }}>{c.icon}</span>
            <span className="syne" style={{ fontSize:13, fontWeight:700, color:'#1c1917' }}>Mon Pronostic</span>
            <span style={{ marginLeft:'auto', fontSize:9, fontWeight:700, color:c.ic, background:c.bg, border:'1px solid '+c.border, padding:'2px 8px', borderRadius:99, textTransform:'uppercase', letterSpacing:'.07em' }}>{c.lbl}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12, background:'#fff', borderRadius:12, padding:'10px 14px', border:'1px solid #f5f5f4' }}>
            <img src={selectedTeamId===t1?.teamId?t1?.imageUrl:t2?.imageUrl} loading="lazy"
                 style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover', border:'2px solid #e7e5e4' }} alt={winnerName} />
            <div>
              <div style={{ fontSize:10, color:'#a8a29e', marginBottom:2 }}>Équipe pronostiquée</div>
              <div className="syne" style={{ fontSize:13, fontWeight:700, color:'#1c1917' }}>{winnerName}</div>
            </div>
          </div>
          <PredBar />
        </div>
      );
    }

    if (!isUpcoming(st) && !prediction) {
      return (
        <div style={{ borderRadius:16, padding:20, background:'#fafaf9', border:'1px solid #e7e5e4' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
    
            <span className="syne" style={{ fontSize:13, fontWeight:700, color:'#1c1917' }}>Pronostic fermé</span>
          </div>
          <p style={{ fontSize:12, color:'#a8a29e', textAlign:'center', padding:'8px 0' }}>
            Les pronostics ne sont plus acceptés.<br />Le match a {isFinished(st)?'terminé':'commencé'}.
          </p>
          <PredBar />
        </div>
      );
    }

    return (
      <div style={{ borderRadius:16, padding:20, background:'#fff', border:'1px solid #e7e5e4' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <span style={{ fontSize:16 }}>📊</span>
          <span className="syne" style={{ fontSize:13, fontWeight:700, color:'#1c1917' }}>Votre Pronostic</span>
          <span style={{ marginLeft:'auto', fontSize:9, fontWeight:700, color:'#006233', background:'rgba(0,98,51,.08)', border:'1px solid rgba(0,98,51,.2)', padding:'2px 8px', borderRadius:99, textTransform:'uppercase' }}>Ouvert</span>
        </div>
        <p style={{ fontSize:12, color:'#78716c', marginBottom:12 }}>Qui remportera ce match ?</p>
        <PredBar />
        <div style={{ display:'flex', flexDirection:'column', gap:8, margin:'12px 0' }}>
          {[t1,t2].map(team => (
            <button key={team?.teamId} onClick={() => setSelectedTeamId(team?.teamId)}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:12,
                             border:'1px solid '+(selectedTeamId===team?.teamId?'#C1272D':'#e7e5e4'),
                             background:selectedTeamId===team?.teamId?'rgba(193,39,45,.04)':'#fff',
                             cursor:'pointer', transition:'all .18s', textAlign:'left' }}>
              <div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid '+(selectedTeamId===team?.teamId?'#C1272D':'#d6d3d1'), display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {selectedTeamId===team?.teamId && <div style={{ width:8, height:8, borderRadius:'50%', background:'#C1272D' }} />}
              </div>
              <img src={team?.imageUrl} loading="lazy" style={{ width:30, height:30, borderRadius:'50%', objectFit:'cover', border:'1px solid #e7e5e4' }} alt={team?.teamName} />
              <span style={{ fontSize:13, fontWeight:600, color:'#1c1917' }}>{team?.teamName}</span>
            </button>
          ))}
        </div>
        {predMessage && (
          <p style={{ fontSize:12, textAlign:'center', marginBottom:10, color:predMessage.includes('✓')?'#006233':'#C1272D' }}>{predMessage}</p>
        )}
        <button onClick={submitPrediction} disabled={!selectedTeamId||predSubmitting}
                style={{ width:'100%', padding:'11px', borderRadius:12, fontWeight:700, fontSize:13, cursor:selectedTeamId&&!predSubmitting?'pointer':'not-allowed',
                         background:selectedTeamId&&!predSubmitting?'#C1272D':'#f5f5f4',
                         color:selectedTeamId&&!predSubmitting?'#fff':'#a8a29e', border:'none', transition:'all .2s' }}>
          {predSubmitting ? 'Envoi…' : 'Confirmer le pronostic'}
        </button>
      </div>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div style={{ width:48, height:48, border:'3px solid #C1272D', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
    </div>
  );

  if (!match) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div style={{ fontSize:48, marginBottom:16 }}>⚽</div>
      <h2 className="syne" style={{ fontSize:20, fontWeight:800, color:'#1c1917', marginBottom:8 }}>Match non trouvé</h2>
      <button onClick={() => router.push('/matches')}
              style={{ padding:'10px 24px', background:'#C1272D', color:'#fff', borderRadius:12, fontSize:13, fontWeight:700, border:'none', cursor:'pointer' }}>
        Retour aux matches
      </button>
    </div>
  );

  const status     = getStatus(match.statut);
  const team1      = match.matchTeams?.[0];
  const team2      = match.matchTeams?.[1];
  const showScore  = isActive(match.statut) || isFinished(match.statut) || match.statut === 'fin meta 1';
  const manOfMatch = getMotM();

  const TABS = [
    { key:'overview', label:'Aperçu',   icon:'info' },
    { key:'lineup',   label:'Lineups',  icon:'groups' },
    { key:'events',   label:'Events',   icon:'timeline', badge:events.length },
    { key:'stats',    label:'Stats',    icon:'bar_chart' },
    { key:'reviews',  label:'Avis',     icon:'star', badge:reviews.length },
  ];

  return (
    <>
      <Head>
        <title>{team1?.teamName||''} vs {team2?.teamName||''} | MoroccoFan2030</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=Amiri:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
        <link rel="icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
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
        @keyframes ping    { 0%{transform:scale(1);opacity:.75} 75%,100%{transform:scale(2);opacity:0} }

        .fu { animation: fadeUp .5s ease-out both; }
        .d1 { animation-delay:.08s; } .d2 { animation-delay:.16s; }
        .d3 { animation-delay:.26s; } .d4 { animation-delay:.36s; }

        /* Pills */
        .pill       { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;border:1px solid; }
        .pill-red   { background:rgba(193,39,45,.08);  color:#C1272D; border-color:rgba(193,39,45,.25); }
        .pill-green { background:rgba(0,98,51,.10);    color:#006233; border-color:rgba(0,98,51,.30);   }
        .pill-gold  { background:rgba(240,165,0,.10);  color:#b45309; border-color:rgba(240,165,0,.30); }
        .pill-gray  { background:rgba(0,0,0,.04);      color:#78716c; border-color:rgba(0,0,0,.10);     }
        .pill-live  { background:rgba(193,39,45,.10);  color:#C1272D; border-color:rgba(193,39,45,.3);  }

        /* Stat cards */
        .stat-card { background:#fff; border:1px solid #e7e5e4; border-radius:14px; padding:16px; text-align:center; transition:border-color .2s; }
        .stat-card:hover { border-color:#C1272D; }
        .stat-val { font-size:26px; font-weight:800; line-height:1; font-family:'Syne',sans-serif; }
        .stat-lbl { font-size:10px; color:#a8a29e; text-transform:uppercase; letter-spacing:.08em; margin-top:4px; font-weight:500; }

        /* Content cards */
        .content-card { background:#fff; border:1px solid #e7e5e4; border-radius:18px; padding:24px; }

        /* Timeline */
        .timeline-wrap { position:relative; padding-left:8px; }
        .timeline-wrap::before { content:''; position:absolute; top:24px; bottom:0; left:23px; width:2px; background:#f5f5f4; }

        /* Tab btn */
        .tab-btn { display:inline-flex;align-items:center;gap:6px;padding:10px 0;border-bottom:2px solid transparent;font-size:13px;font-weight:500;color:#a8a29e;background:none;border-top:none;border-left:none;border-right:none;cursor:pointer;transition:all .18s;white-space:nowrap; }
        .tab-btn.active { border-bottom-color:#1c1917; color:#1c1917; font-weight:700; }
        .tab-btn:hover:not(.active) { color:#57534e; }

        /* Section title */
        .sec-title { font-family:'Syne',sans-serif; font-size:17px; font-weight:800; color:#1c1917; display:flex; align-items:center; gap:8px; }
        .sec-title::before { content:''; display:block; width:4px; height:18px; background:linear-gradient(to bottom,#C1272D,#006233); border-radius:2px; }

        /* Event card */
        .event-card { background:#fafaf9; border:1px solid #f5f5f4; border-radius:14px; padding:14px; display:flex; align-items:center; justify-content:space-between; transition:all .2s; }
        .event-card:hover { background:#fff; border-color:#e7e5e4; box-shadow:0 4px 16px rgba(0,0,0,.05); }

        /* Player card */
        .player-row { display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#fafaf9;border-radius:12px;transition:background .18s; }
        .player-row:hover { background:#f5f5f4; }

        /* Star btn */
        .star-btn { background:none;border:none;cursor:pointer;padding:2px;transition:transform .1s; }
        .star-btn:hover { transform:scale(1.2); }

        .nosb::-webkit-scrollbar { display:none; }
        .nosb { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <header style={{ position:'relative', background:'linear-gradient(135deg,#2d0a0e 0%,#1a0608 60%,rgba(0,98,51,.3) 100%)', overflow:'hidden', paddingTop:80 }}>
        {/* BG image */}
        <div style={{ position:'absolute', inset:0 }}>
          <img src={match.imageUrl||'/images/default-stadium.jpg'} loading="lazy" alt={match.stadeName}
               style={{ width:'100%', height:'100%', objectFit:'cover', mixBlendMode:'overlay', opacity:.95 }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(26,6,8,.6),rgba(26,6,8,.95))' }} />
          <div style={{ position:'absolute', inset:0, opacity:85, backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'160px' }} />
        </div>
        {/* Glows */}
        <div style={{ position:'absolute', top:60, left:0, width:300, height:300, borderRadius:'50%', background:'rgba(193,39,45,.15)', filter:'blur(40px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:0, right:0, width:300, height:300, borderRadius:'50%', background:'rgba(0,98,51,.15)', filter:'blur(40px)', pointerEvents:'none' }} />

        <div style={{ position:'relative', maxWidth:1100, margin:'0 auto', padding:'24px 24px 48px' }}>

          {/* Top row: favorite btn */}
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
            <button onClick={toggleFavorite} disabled={favLoading}
                    style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:99,
                             border:'1px solid '+(isFavorite?'rgba(240,165,0,.4)':'rgba(255,255,255,.2)'),
                             background:isFavorite?'rgba(240,165,0,.15)':'rgba(255,255,255,.08)',
                             color:isFavorite?'#f0a500':'rgba(255,255,255,.7)', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .2s' }}>
              {favLoading
                ? <div style={{ width:16,height:16,border:'2px solid currentColor',borderTopColor:'transparent',borderRadius:'50%',animation:'spin .8s linear infinite' }} />
                : <svg width="16" height="16" fill={isFavorite?'currentColor':'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
              }
              {isFavorite ? 'Favori' : 'Ajouter'}
            </button>
          </div>

          {/* Status pill */}
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:99,
                          background:status.live?'rgba(193,39,45,.12)':isFinished(match.statut)?'rgba(255,255,255,.08)':'rgba(61,186,122,.1)',
                          border:'1px solid '+(status.live?'rgba(193,39,45,.3)':isFinished(match.statut)?'rgba(255,255,255,.1)':'rgba(61,186,122,.25)') }}>
              {status.live && (
                <div style={{ position:'relative', width:8, height:8 }}>
                  <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#C1272D', animation:'ping 1.5s infinite' }} />
                  <div style={{ position:'relative', width:8, height:8, borderRadius:'50%', background:'#C1272D' }} />
                </div>
              )}
              <span className="syne" style={{ fontSize:11, fontWeight:800, letterSpacing:'.1em', textTransform:'uppercase',
                                              color:status.live?'#C1272D':isFinished(match.statut)?'rgba(255,255,255,.5)':match.statut==='fin meta 1'?'#f0a500':'#3dba7a' }}>
                {status.label}
                {status.live && <span style={{ marginLeft:8, fontFamily:'monospace', fontSize:13 }}>{formatChrono(chrono)}</span>}
                {match.statut==='fin meta 1' && ' · Mi-temps'}
              </span>
            </div>
          </div>

          {/* Score board */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:32, marginBottom:32 }} className="fu">
            {/* Team 1 */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, flex:1, maxWidth:200 }}>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', inset:-12, borderRadius:'50%', background:'rgba(193,39,45,.2)', filter:'blur(20px)' }} />
                <div style={{ position:'relative', width:100, height:100, borderRadius:'50%', border:'4px solid rgba(255,255,255,.15)', overflow:'hidden', background:'rgba(255,255,255,.1)', boxShadow:'0 8px 32px rgba(0,0,0,.4)' }}>
                  <img src={team1?.imageUrl} alt={team1?.teamName} loading="lazy" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
              </div>
              <h2 className="syne" style={{ fontSize:16, fontWeight:700, color:'#fff', textAlign:'center', lineHeight:1.3 }}>{team1?.teamName}</h2>
            </div>

            {/* Score */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, flexShrink:0 }}>
              {showScore ? (
                <>
                  <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                    <span className="syne" style={{ fontSize:64, fontWeight:800, color:'#fff', lineHeight:1 }}>{team1?.goals??0}</span>
                    <span className="syne" style={{ fontSize:32, fontWeight:400, color:'rgba(255,255,255,.3)' }}>:</span>
                    <span className="syne" style={{ fontSize:64, fontWeight:800, color:'rgba(255,255,255,.45)', lineHeight:1 }}>{team2?.goals??0}</span>
                  </div>
                  {(status.live||match.statut==='fin meta 1') && (
                    <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', borderRadius:99,
                                  background:'rgba(28,25,23,.6)', border:'1px solid rgba(255,255,255,.1)', backdropFilter:'blur(8px)' }}>
                      <span style={{ fontSize:11, color:'rgba(255,255,255,.5)', textTransform:'uppercase', letterSpacing:'.06em' }}>
                        {match.statut==='fin meta 1'
                          ? <span style={{ color:'#f0a500', fontWeight:700 }}>MI-TEMPS · 45'</span>
                          : <><span style={{ color:'rgba(255,255,255,.6)' }}>{status.half}</span>
                             <span style={{ color:'#C1272D', fontFamily:'monospace', fontWeight:700, marginLeft:6 }}>{formatChrono(chrono)}</span></>
                        }
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <span className="serif" style={{ fontSize:52, color:'rgba(255,255,255,.8)', fontStyle:'italic' }}>VS</span>
                  <div style={{ padding:'5px 14px', borderRadius:99, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.1)', fontSize:12, color:'rgba(255,255,255,.6)', fontWeight:600 }}>
                    {new Date(match.dateOfMatch).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                  </div>
                </>
              )}
            </div>

            {/* Team 2 */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, flex:1, maxWidth:200 }}>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', inset:-12, borderRadius:'50%', background:'rgba(240,165,0,.15)', filter:'blur(20px)' }} />
                <div style={{ position:'relative', width:100, height:100, borderRadius:'50%', border:'4px solid rgba(255,255,255,.15)', overflow:'hidden', background:'rgba(255,255,255,.1)', boxShadow:'0 8px 32px rgba(0,0,0,.4)' }}>
                  <img src={team2?.imageUrl} alt={team2?.teamName} loading="lazy" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
              </div>
              <h2 className="syne" style={{ fontSize:16, fontWeight:700, color:'rgba(255,255,255,.7)', textAlign:'center', lineHeight:1.3 }}>{team2?.teamName}</h2>
            </div>
          </div>

          {/* Meta row */}
          <div className="fu d2" style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:20, borderTop:'1px solid rgba(255,255,255,.08)', paddingTop:20 }}>
            {[
              {  val: new Date(match.dateOfMatch).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'}) },
              {       val: match.stadeName },
              {  val: match.type },
            ].map(m => (
              <div key={m.val} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'rgba(255,255,255,.5)', fontWeight:500 }}>
                <span className="material-icons" style={{ fontSize:14, color:'rgba(255,255,255,.35)' }}>{m.icon}</span>
                {m.val}
              </div>
            ))}
          </div>
        </div>

        {/* Fade to white */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:48, background:'linear-gradient(to bottom,transparent,#fff)', pointerEvents:'none' }} />
      </header>

      {/* ══ STAT CARDS ════════════════════════════════════════════════════ */}
      <section className="fu d2" style={{ maxWidth:1100, margin:'0 auto', padding:'8px 24px 0',marginTop:30,marginBottom:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:10 }}>
          {[
            { v: showScore ? (team1?.goals??0)+'-'+(team2?.goals??0) : '—', l:'Score',     c:'#C1272D' },
            { v: events.length,  l:'Événements', c:'#f0a500' },
            { v: lineup.length,  l:'Joueurs',    c:'#006233' },
            { v: reviews.length, l:'Avis',       c:'#3b82f6' },
          ].map(({ v, l, c }) => (
            <div key={l} className="stat-card">
              <div className="stat-val" style={{ color:c }}>{v}</div>
              <div className="stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ STICKY TABS ═══════════════════════════════════════════════════ */}
      <div style={{ position:'sticky', top:80, zIndex:40, background:'rgba(255,255,255,.95)', borderBottom:'1px solid #e7e5e4', backdropFilter:'blur(8px)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px', overflowX:'auto' }} className="nosb">
          <div style={{ display:'flex', gap:24, minWidth:'max-content' }}>
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                      className={`tab-btn ${activeTab===tab.key?'active':''}`}>
                <span className="material-icons" style={{ fontSize:16 }}>{tab.icon}</span>
                {tab.label}
                {tab.badge > 0 && (
                  <span style={{ padding:'1px 7px', background:'#f0a500', color:'#fff', fontSize:9, fontWeight:700, borderRadius:99 }}>{tab.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ MAIN CONTENT ══════════════════════════════════════════════════ */}
      <main style={{ maxWidth:1100, margin:'0 auto', padding:'32px 24px 80px', display:'grid', gridTemplateColumns:'1fr', gap:24 }} className="main-grid">

        {/* LEFT */}
        <div className="left-col fu d2" style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* ── OVERVIEW ───────────────────────── */}
          {activeTab==='overview' && (<>
            {/* Quick stat row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10 }}>
              {[
                { label:'Possession', val: (match.matchTeams?.[0]?.position??50)+'%', pct: match.matchTeams?.[0]?.position??50, color:'#C1272D' },
                { label:'Buts',       val: (team1?.goals??0)+' — '+(team2?.goals??0), pct: null },
                { label:'Événements', val: String(events.length), pct: null },
                { label:'Joueurs',    val: String(lineup.length), pct: null },
              ].map(s => (
                <div key={s.label} style={{ background:'#fff', border:'1px solid #e7e5e4', borderRadius:14, padding:'14px 16px' }}>
                  <div style={{ fontSize:10, color:'#a8a29e', fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>{s.label}</div>
                  <div className="syne" style={{ fontSize:22, fontWeight:800, color:'#1c1917' }}>{s.val}</div>
                  {s.pct!=null && (
                    <div style={{ marginTop:6, height:3, background:'#f5f5f4', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ width:s.pct+'%', height:'100%', background:s.color }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Events timeline preview */}
            <div className="content-card">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <div className="sec-title">Match Events</div>
                <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:11, color:'#a8a29e' }}>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}><span style={{ width:8,height:8,borderRadius:'50%',background:'#C1272D',display:'inline-block' }} />{team1?.teamName}</span>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}><span style={{ width:8,height:8,borderRadius:'50%',background:'#1c1917',display:'inline-block' }} />{team2?.teamName}</span>
                </div>
              </div>
              {events.length===0 ? (
                <div style={{ textAlign:'center', padding:'40px 0' }}>
                  <div style={{ fontSize:40, marginBottom:12 }}></div>
                  <p style={{ fontSize:13, color:'#a8a29e' }}>Aucun événement pour le moment</p>
                </div>
              ) : (
                <div className="timeline-wrap">
                  {[...events].sort((a,b)=>(b.minute||0)-(a.minute||0)).slice(0,6).map(ev => {
                    const ei = getEventIcon(ev.additionalInfo);
                    return (
                      <div key={ev.id} style={{ position:'relative', paddingLeft:48, paddingBottom:20 }}>
                        <div style={{ position:'absolute', left:0, top:0, width:48, height:48, display:'flex', alignItems:'center', justifyContent:'center', background:'#fff', zIndex:1 }}>
                          <div style={{ width:34, height:34, borderRadius:'50%', border:'1px solid #e7e5e4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#78716c' }}>
                            {ev.minute}'
                          </div>
                        </div>
                        <div className="event-card">
                          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <div style={{ width:36, height:36, borderRadius:'50%', background:ei.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{ei.icon}</div>
                            <div>
                              <div style={{ fontSize:13, fontWeight:600, color:'#1c1917' }}>{ev.additionalInfo}</div>
                              <div style={{ fontSize:11, color:'#a8a29e' }}>{ev.playerName}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {events.length>6 && (
                <button onClick={() => setActiveTab('events')} style={{ marginTop:8, width:'100%', fontSize:12, fontWeight:600, color:'#C1272D', background:'none', border:'none', cursor:'pointer' }}>
                  Voir tous les événements ({events.length})
                </button>
              )}
            </div>

            {/* Lineups preview */}
            <div className="content-card">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <div className="sec-title">Lineups</div>
                <button onClick={() => setActiveTab('lineup')} style={{ fontSize:12, fontWeight:600, color:'#C1272D', background:'none', border:'none', cursor:'pointer' }}>Voir tout</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                {[team1,team2].map((team) => {
                  const players = starters(getTeamLineup(team?.teamId)).slice(0,5);
                  return (
                    <div key={team?.teamId}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, paddingBottom:10, borderBottom:'1px solid #f5f5f4' }}>
                        <img src={team?.imageUrl} loading="lazy" style={{ width:24, height:24, borderRadius:'50%', objectFit:'cover' }} alt={team?.teamName} />
                        <span style={{ fontSize:13, fontWeight:700, color:'#1c1917' }}>{team?.teamName}</span>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        {players.map((p,i) => (
                          <div key={p.id} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
                            <span style={{ width:20, textAlign:'center', color:'#a8a29e', fontWeight:700, fontSize:10 }}>{p.jerseyNumber||i+1}</span>
                            <span style={{ color:'#1c1917', fontWeight:500 }}>{p.playerName}</span>
                            {p.position==='GK' && <span style={{ marginLeft:'auto', fontSize:9, fontWeight:700, color:'#b45309', background:'rgba(240,165,0,.1)', border:'1px solid rgba(240,165,0,.25)', padding:'1px 6px', borderRadius:4 }}>GK</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>)}

          {/* ── LINEUP ─────────────────────────── */}
          {activeTab==='lineup' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {[team1,team2].map((team,idx) => {
                const players = getTeamLineup(team?.teamId);
                const acc = idx===0?'#C1272D':'#1c1917';
                return (
                  <div key={team?.teamId} style={{ background:'#fff', border:'2px solid '+acc, borderRadius:18, padding:24 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                      <img src={team?.imageUrl} loading="lazy" style={{ width:44, height:44, borderRadius:'50%', border:'2px solid #f5f5f4', objectFit:'cover' }} alt={team?.teamName} />
                      <span className="syne" style={{ fontSize:16, fontWeight:700, color:'#1c1917' }}>{team?.teamName}</span>
                    </div>

                    <div style={{ fontSize:10, fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 }}>Titulaires</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:20 }}>
                      {starters(players).map((p,i) => (
                        <div key={p.id} className="player-row">
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:28, height:28, borderRadius:'50%', background:acc, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, flexShrink:0 }}>
                              {p.jerseyNumber||i+1}
                            </div>
                            {p.playerImgUrl && <img src={p.playerImgUrl} loading="lazy" style={{ width:32,height:32,borderRadius:'50%',objectFit:'cover',border:'1px solid #e7e5e4' }} alt={p.playerName} />}
                            <div>
                              <div style={{ fontSize:13, fontWeight:600, color:'#1c1917' }}>{p.playerName}</div>
                              <div style={{ fontSize:10, color:'#a8a29e' }}>{p.position||'N/A'}</div>
                            </div>
                          </div>
                          {p.rating && (
                            <span style={{ fontSize:11, fontWeight:700, color:'#fff', background:acc, padding:'2px 8px', borderRadius:6 }}>{p.rating.toFixed(1)}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {substitutes(players).length>0 && (<>
                      <div style={{ fontSize:10, fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 }}>Remplaçants</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        {substitutes(players).map((p,i) => (
                          <div key={p.id} className="player-row" style={{ opacity:.55 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <div style={{ width:28, height:28, borderRadius:'50%', background:'#f5f5f4', color:'#78716c', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700 }}>
                                {p.jerseyNumber||i+12}
                              </div>
                              <div>
                                <div style={{ fontSize:13, fontWeight:500, color:'#57534e' }}>{p.playerName}</div>
                                <div style={{ fontSize:10, color:'#a8a29e' }}>{p.position||'N/A'}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>)}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── EVENTS ─────────────────────────── */}
          {activeTab==='events' && (
            <div className="content-card">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
                <div className="sec-title">Match Events</div>
                <span style={{ padding:'3px 12px', background:'#f0a500', color:'#fff', fontSize:11, fontWeight:700, borderRadius:99 }}>{events.length}</span>
              </div>
              {events.length===0 ? (
                <div style={{ textAlign:'center', padding:'60px 0' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}></div>
                  <p style={{ fontSize:13, color:'#a8a29e' }}>Aucun événement pour le moment</p>
                </div>
              ) : (
                <div className="timeline-wrap">
                  {[...events].sort((a,b)=>(b.minute||0)-(a.minute||0)).map(ev => {
                    const ei = getEventIcon(ev.additionalInfo);
                    return (
                      <div key={ev.id} style={{ position:'relative', paddingLeft:48, paddingBottom:16 }}>
                        <div style={{ position:'absolute', left:0, top:0, width:48, height:48, display:'flex', alignItems:'center', justifyContent:'center', background:'#fff', zIndex:1 }}>
                          <div style={{ width:34, height:34, borderRadius:'50%', border:'1px solid #e7e5e4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#78716c' }}>{ev.minute}'</div>
                        </div>
                        <div className="event-card">
                          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <div style={{ width:36, height:36, borderRadius:'50%', background:ei.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{ei.icon}</div>
                            <div>
                              <div style={{ fontSize:13, fontWeight:600, color:'#1c1917' }}>{ev.playerName}</div>
                              <div style={{ fontSize:11, color:'#a8a29e' }}>{ev.teamName}</div>
                              <div style={{ fontSize:11, color:'#a8a29e', fontStyle:'italic' }}>{ev.additionalInfo}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── STATS ──────────────────────────── */}
          {activeTab==='stats' && (
            <div className="content-card">
              <div className="sec-title" style={{ marginBottom:24 }}>Statistiques Détaillées</div>
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                {[
                  { label:'Possession', v1:match.matchTeams?.[0]?.position??50, v2:match.matchTeams?.[1]?.position??50, fmt:v=>v+'%', pct:match.matchTeams?.[0]?.position??50 },
                  { label:'Buts',       v1:team1?.goals??0, v2:team2?.goals??0, fmt:v=>v, pct:((team1?.goals??0)/Math.max((team1?.goals??0)+(team2?.goals??0),1))*100 },
                  { label:'Événements', v1:events.filter(e=>e.teamID===team1?.teamId).length, v2:events.filter(e=>e.teamID===team2?.teamId).length, fmt:v=>v, pct:(events.filter(e=>e.teamID===team1?.teamId).length/Math.max(events.length,1))*100 },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                      <span className="syne" style={{ fontSize:16, fontWeight:800, color:'#C1272D' }}>{s.fmt(s.v1)}</span>
                      <span style={{ fontSize:11, color:'#a8a29e', fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em' }}>{s.label}</span>
                      <span className="syne" style={{ fontSize:16, fontWeight:800, color:'#1c1917' }}>{s.fmt(s.v2)}</span>
                    </div>
                    <div style={{ height:8, background:'#f5f5f4', borderRadius:99, overflow:'hidden', display:'flex' }}>
                      <div style={{ width:s.pct+'%', background:'#C1272D', transition:'width .7s' }} />
                      <div style={{ flex:1, background:'#1c1917', transition:'width .7s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── REVIEWS ────────────────────────── */}
          {activeTab==='reviews' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Summary */}
              {reviews.length>0 && (
                <div className="content-card">
                  <div style={{ display:'flex', flexDirection:'column', gap:16 }} className="md:flex-row">
                    <div style={{ textAlign:'center', minWidth:100 }}>
                      <div className="syne" style={{ fontSize:52, fontWeight:800, color:'#1c1917', lineHeight:1 }}>{getAvgRating()}</div>
                      <div style={{ display:'flex', justifyContent:'center', gap:2, margin:'6px 0' }}>
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} width="18" height="18" fill={parseFloat(getAvgRating())>=s?'#f0a500':'#e7e5e4'} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                      <div style={{ fontSize:11, color:'#a8a29e' }}>{reviews.length} avis</div>
                    </div>
                    <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
                      {[5,4,3,2,1].map(star => {
                        const dist=getRatingDist(), count=dist[star], pct=reviews.length>0?Math.round(count/reviews.length*100):0;
                        return (
                          <div key={star} style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ fontSize:11, color:'#78716c', width:10, textAlign:'right' }}>{star}</span>
                            <svg width="12" height="12" fill="#f0a500" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                            <div style={{ flex:1, height:6, background:'#f5f5f4', borderRadius:99, overflow:'hidden' }}>
                              <div style={{ width:pct+'%', height:'100%', background:'#f0a500', transition:'width .7s' }} />
                            </div>
                            <span style={{ fontSize:11, color:'#a8a29e', width:16, textAlign:'right' }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Write review */}
              <div className="content-card">
                <div className="sec-title" style={{ marginBottom:20 }}>Donnez votre avis</div>
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>Note</div>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    {[1,2,3,4,5].map(star => (
                      <button key={star} type="button" className="star-btn"
                              onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)}
                              onClick={() => setReviewRating(star)}>
                        <svg width="32" height="32" fill={(hoveredStar||reviewRating)>=star?'#f0a500':'#e7e5e4'} viewBox="0 0 20 20" style={{ transition:'fill .1s' }}>
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      </button>
                    ))}
                    {reviewRating>0 && (
                      <span style={{ marginLeft:8, fontSize:13, fontWeight:600, color:'#f0a500' }}>
                        {['','Mauvais','Passable','Bon','Très bon','Excellent'][reviewRating]}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>Commentaire</div>
                  <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
                            placeholder="Partagez votre ressenti sur ce match..." rows={4}
                            style={{ width:'100%', padding:'12px 14px', fontSize:13, fontFamily:'Inter,sans-serif', color:'#1c1917', background:'#fafaf9', border:'1px solid #e7e5e4', borderRadius:12, resize:'none', outline:'none', transition:'border-color .2s,box-shadow .2s' }}
                            onFocus={e => { e.target.style.borderColor='#C1272D'; e.target.style.boxShadow='0 0 0 3px rgba(193,39,45,.08)'; }}
                            onBlur={e => { e.target.style.borderColor='#e7e5e4'; e.target.style.boxShadow='none'; }} />
                  <div style={{ textAlign:'right', fontSize:11, color:reviewText.length>400?'#C1272D':'#a8a29e', marginTop:4 }}>{reviewText.length}/500</div>
                </div>
                {reviewMessage && (
                  <div style={{ marginBottom:12, padding:'10px 14px', borderRadius:12, display:'flex', alignItems:'center', gap:8, fontSize:12, fontWeight:500,
                                background:reviewMessage.type==='success'?'rgba(61,186,122,.08)':'rgba(193,39,45,.06)',
                                border:'1px solid '+(reviewMessage.type==='success'?'rgba(61,186,122,.25)':'rgba(193,39,45,.2)'),
                                color:reviewMessage.type==='success'?'#006233':'#C1272D' }}>
                    {reviewMessage.type==='success'?'✓':'✗'} {reviewMessage.text}
                  </div>
                )}
                <button onClick={submitReview} disabled={reviewSubmitting||reviewRating===0||!reviewText.trim()}
                        style={{ width:'100%', padding:'12px', borderRadius:12, fontWeight:700, fontSize:13, border:'none', cursor:!reviewSubmitting&&reviewRating>0&&reviewText.trim()?'pointer':'not-allowed',
                                 background:!reviewSubmitting&&reviewRating>0&&reviewText.trim()?'#1c1917':'#f5f5f4',
                                 color:!reviewSubmitting&&reviewRating>0&&reviewText.trim()?'#fff':'#a8a29e', transition:'all .2s' }}>
                  {reviewSubmitting ? 'Publication…' : 'Publier l\'avis'}
                </button>
              </div>

              {/* Reviews list */}
              {reviews.length===0 ? (
                <div className="content-card" style={{ textAlign:'center', padding:48 }}>
                  <div style={{ fontSize:40, marginBottom:12 }}></div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#78716c', marginBottom:4 }}>Aucun avis pour ce match</div>
                  <div style={{ fontSize:12, color:'#a8a29e' }}>Soyez le premier à partager votre point de vue !</div>
                </div>
              ) : reviews.map((r,i) => (
                <div key={r.id||i} style={{ background:'#fff', border:'1px solid #e7e5e4', borderRadius:16, padding:'18px 20px', transition:'border-color .2s,box-shadow .2s' }}
                     onMouseEnter={e => { e.currentTarget.style.borderColor='#d6d3d1'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,.04)'; }}
                     onMouseLeave={e => { e.currentTarget.style.borderColor='#e7e5e4'; e.currentTarget.style.boxShadow='none'; }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:38, height:38, borderRadius:'50%', background:'#1c1917', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span className="syne" style={{ fontSize:14, fontWeight:800, color:'#fff' }}>{r.supporterName?r.supporterName.charAt(0).toUpperCase():'?'}</span>
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:'#1c1917' }}>{r.supporterName||'Fan anonyme'}</div>
                        <div style={{ fontSize:11, color:'#a8a29e' }}>
                          {r.dateOfCreation ? new Date(r.dateOfCreation).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'}) : ''}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:2, flexShrink:0 }}>
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} width="14" height="14" fill={r.rating>=s?'#f0a500':'#e7e5e4'} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize:13, color:'#57534e', lineHeight:1.7 }}>{r.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ─────────────────── */}
        <div className="right-col fu d3" style={{ display:'flex', flexDirection:'column', gap:16 }}>

          <PredictionPanel />

          {/* Man of the match */}
          {manOfMatch && (
            <div style={{ background:'#fff', border:'1px solid #e7e5e4', borderRadius:16, padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              
                <span className="syne" style={{ fontSize:13, fontWeight:700, color:'#1c1917' }}>Homme du Match</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                {manOfMatch.playerImgUrl && (
                  <img src={manOfMatch.playerImgUrl} loading="lazy" style={{ width:52, height:52, borderRadius:'50%', objectFit:'cover', border:'3px solid #C1272D' }} alt={manOfMatch.playerName} />
                )}
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#1c1917' }}>{manOfMatch.playerName}</div>
                  <div style={{ fontSize:11, color:'#a8a29e', marginBottom:6 }}>{manOfMatch.position||'N/A'}</div>
                  <span className="syne" style={{ fontSize:12, fontWeight:800, color:'#C1272D', background:'rgba(193,39,45,.08)', border:'1px solid rgba(193,39,45,.2)', padding:'2px 10px', borderRadius:6 }}>{manOfMatch.rating?.toFixed(1)} Rating</span>
                </div>
              </div>
            </div>
          )}

          {/* Weather */}
          <div style={{ borderRadius:16, overflow:'hidden', position:'relative' }}>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#3b82f6,#4f46e5)' }} />
            <div style={{ position:'absolute', top:0, right:0, padding:24, opacity:.15 }}>
              <span style={{ fontSize:80 }}>☁️</span>
            </div>
            <div style={{ position:'relative', padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:20, fontSize:12, color:'rgba(255,255,255,.7)', fontWeight:500 }}>
                <span className="material-icons" style={{ fontSize:14 }}>place</span>
                {match.stadeName?.split(',')[0]||'Casablanca'}
              </div>
              {weather ? (
                <>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:8, marginBottom:8 }}>
                    <span className="syne" style={{ fontSize:44, fontWeight:800, color:'#fff', lineHeight:1 }}>{Math.round(weather.main?.temp)}°</span>
                    <span style={{ fontSize:14, color:'rgba(255,255,255,.7)', marginBottom:4, textTransform:'capitalize' }}>{weather.weather?.[0]?.description}</span>
                  </div>
                  <div style={{ height:1, background:'rgba(255,255,255,.15)', margin:'12px 0' }} />
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,.5)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:2 }}>Humidité</div>
                      <div className="syne" style={{ fontSize:15, fontWeight:700, color:'#fff' }}>{weather.main?.humidity}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,.5)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:2 }}>Vent</div>
                      <div className="syne" style={{ fontSize:15, fontWeight:700, color:'#fff' }}>{Math.round((weather.wind?.speed||0)*3.6)} km/h</div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign:'center', padding:'20px 0', color:'rgba(255,255,255,.5)', fontSize:12 }}>Données météo non disponibles</div>
              )}
            </div>
          </div>

          {/* Match info */}
          <div style={{ background:'#fff', border:'1px solid #e7e5e4', borderRadius:16, padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <span className="material-icons" style={{ fontSize:16, color:'#a8a29e' }}>info</span>
              <span className="syne" style={{ fontSize:13, fontWeight:700, color:'#1c1917' }}>Informations</span>
            </div>
            {[
              { l:'Date',        v: new Date(match.dateOfMatch).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}) },
              { l:'Stade',       v: match.stadeName },
              { l:'Compétition', v: match.type },
              ...(match.referee ? [{ l:'Arbitre', v: match.referee }] : []),
            ].map((r,i,arr) => (
              <div key={r.l}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'10px 0', fontSize:13 }}>
                  <span style={{ color:'#a8a29e' }}>{r.l}</span>
                  <span style={{ fontWeight:600, color:'#1c1917', textAlign:'right', maxWidth:'60%' }}>{r.v}</span>
                </div>
                {i<arr.length-1 && <div style={{ height:1, background:'#f5f5f4' }} />}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 2-col layout */}
      <style jsx>{`
        @media (min-width: 1024px) {
          .main-grid { grid-template-columns: 1fr !important; }
          .main-grid { display: grid !important; grid-template-columns: 8fr 4fr !important; }
          .left-col, .right-col { display: flex !important; flex-direction: column !important; }
        }
        @media (max-width: 767px) {
          .content-card > div[style*="grid-cols-2"] { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Footer />
    </>
  );
}