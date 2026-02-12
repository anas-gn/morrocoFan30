import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MatchDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [match, setMatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [lineup, setLineup] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Prediction states
  const [prediction, setPrediction] = useState(null);       // existing prediction from API
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [predSubmitting, setPredSubmitting] = useState(false);
  const [predMessage, setPredMessage] = useState(null);

  const supporterId =
    typeof window !== 'undefined'
      ? parseInt(localStorage.getItem('supporterId') || '0', 10)
      : 0;

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      try {
        const [matchRes, eventsRes, lineupRes] = await Promise.all([
          fetch(`http://localhost:3309/api/matches/matches/${id}`),
          fetch(`http://localhost:3309/api/matches/matches/${id}/events`),
          fetch(`http://localhost:3309/api/matches/matches/${id}/players/lineup`),
        ]);
        const [matchData, eventsData, lineupData] = await Promise.all([
          matchRes.json(), eventsRes.json(), lineupRes.json(),
        ]);
        setMatch(matchData);
        setEvents(eventsData);
        setLineup(lineupData);
        if (matchData?.stadeId) fetchWeather(33.5731, -7.5898);

        // fetch existing prediction
        if (supporterId) {
          try {
            const predRes = await fetch(
              `http://localhost:3309/api/predictions/supporter/${supporterId}/match/${id}`
            );
            if (predRes.ok) {
              const predData = await predRes.json();
              setPrediction(predData);
            }
          } catch (_) {}
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const fetchWeather = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=YOUR_API_KEY`
      );
      setWeather(await res.json());
    } catch (_) {}
  };

  const submitPrediction = async () => {
    if (!selectedTeamId) return;
    setPredSubmitting(true);
    try {
      const res = await fetch(
        `http://localhost:3309/api/predictions/add?matchId=${id}&supporterId=${supporterId}&predictedWinnerId=${selectedTeamId}`,
        { method: 'POST' }
      );
      if (res.ok) {
        const data = await res.json();
        setPrediction(data);
        setPredMessage(' Pronostic enregistré avec succès !');
      } else {
        setPredMessage(' Erreur lors de l\'enregistrement.');
      }
    } catch (_) {
      setPredMessage('Erreur réseau.');
    }
    setPredSubmitting(false);
  };

  const getStatus = (s) => {
    const map = {
      DIRECT:   { label: 'LIVE',      live: true,  color: 'red' },
      started:  { label: 'LIVE',      live: true,  color: 'red' },
      commence: { label: 'LIVE',      live: true,  color: 'red' },
      termine:  { label: 'FT',        live: false, color: 'stone' },
      Finished: { label: 'FT',        live: false, color: 'stone' },
      upcoming: { label: 'À venir',   live: false, color: 'green' },
    };
    return map[s] || { label: 'Prévu', live: false, color: 'stone' };
  };

  const isMatchActive = (s) => ['DIRECT','started','commence'].includes(s);
  const isMatchFinished = (s) => ['termine','Finished'].includes(s);
  const isMatchUpcoming = (s) => !isMatchActive(s) && !isMatchFinished(s);

  const getEventIcon = (info = '') => {
    const l = info.toLowerCase();
    if (l.includes('goal'))         return { icon: '⚽', bg: 'bg-emerald-50', ring: 'ring-emerald-200', text: 'text-emerald-700' };
    if (l.includes('yellow'))       return { icon: '🟨', bg: 'bg-yellow-50',  ring: 'ring-yellow-200',  text: 'text-yellow-700' };
    if (l.includes('red'))          return { icon: '🟥', bg: 'bg-red-50',     ring: 'ring-red-200',     text: 'text-red-700'    };
    if (l.includes('substitution')) return { icon: '🔄', bg: 'bg-stone-100',  ring: 'ring-stone-200',   text: 'text-stone-600'  };
    return                                 { icon: '📌', bg: 'bg-stone-100',  ring: 'ring-stone-200',   text: 'text-stone-600'  };
  };

  const getTeamLineup = (teamId) => lineup.filter(p => p.teamID === teamId);
  const starters      = (arr)    => arr.filter(p =>  p.starter);
  const substitutes   = (arr)    => arr.filter(p => !p.starter);

  const PredictionPanel = () => {
    const team1 = match?.matchTeams?.[0];
    const team2 = match?.matchTeams?.[1];
    const status = match?.statut;

    /* ── Already predicted ── */
    if (prediction) {
      const winnerName = prediction.predictedWinnerName || 'Inconnue';
      const st = prediction.status?.toLowerCase();
      const resultConfig = {
        correct:   { bg: 'bg-emerald-500/10 border-emerald-500/30', badge: 'bg-emerald-500', icon: '✅', label: 'Correct !', text: 'text-emerald-400' },
        incorrect: { bg: 'bg-red-500/10 border-red-500/30',         badge: 'bg-red-500',     icon: '❌', label: 'Incorrect', text: 'text-red-400'     },
        pending:   { bg: 'bg-amber-500/10 border-amber-500/30',      badge: 'bg-amber-500',   icon: '⏳', label: 'En attente', text: 'text-amber-400'  },
      };
      const r = resultConfig[st] || resultConfig.pending;

      return (
        <div className={`rounded-3xl p-6 border ${r.bg} backdrop-blur-sm`}>
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xl">{r.icon}</span>
            <h3 className="font-semibold text-white text-sm tracking-wide">Mon Pronostic</h3>
            <span className={`ml-auto text-[11px] font-bold uppercase px-2.5 py-1 rounded-full text-white ${r.badge}`}>
              {r.icon} {r.label}
            </span>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-4">
            <img
              src={selectedTeamId === team1?.teamId ? team1?.imageUrl : team2?.imageUrl}
              className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
              alt={winnerName}
            />
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Équipe pronostiquée</p>
              <p className="font-bold text-white">{winnerName}</p>
            </div>
          </div>
          {st === 'pending' && isMatchActive(status) && (
            <p className="mt-4 text-xs text-stone-400 text-center">
              Le match est en cours — résultat en attente…
            </p>
          )}
        </div>
      );
    }

    /* ── Match started / finished → too late ── */
    if (!isMatchUpcoming(status) && !prediction) {
      return (
        <div className="rounded-3xl p-6 bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            
            <h3 className="font-semibold text-white text-sm">Pronostic</h3>
          </div>
          <p className="text-stone-500 text-sm text-center py-4">
            Les pronostics ne sont plus acceptés.<br />Le match a {isMatchFinished(status) ? 'terminé' : 'commencé'}.
          </p>
        </div>
      );
    }

    /* ── Upcoming → prediction form ── */
    return (
      <div className="rounded-3xl p-6 bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 mb-5">
         
          <h3 className="font-semibold text-white text-sm tracking-wide">Votre Pronostic</h3>
          <span className="ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Ouvert
          </span>
        </div>
        <p className="text-stone-400 text-xs mb-4">Qui remportera ce match ?</p>
        <div className="flex flex-col gap-3 mb-5">
          {[team1, team2].map(team => (
            <button
              key={team?.teamId}
              onClick={() => setSelectedTeamId(team?.teamId)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200 text-left ${
                selectedTeamId === team?.teamId
                  ? 'bg-[#C1272D]/20 border-[#C1272D]/60 shadow-lg shadow-[#C1272D]/10'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                selectedTeamId === team?.teamId ? 'border-[#C1272D] bg-[#C1272D]' : 'border-stone-600'
              }`}>
                {selectedTeamId === team?.teamId && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
              </div>
              <img src={team?.imageUrl} className="w-9 h-9 rounded-full object-cover border border-white/20" alt={team?.teamName} />
              <span className="font-medium text-white text-sm">{team?.teamName}</span>
            </button>
          ))}
        </div>
        {predMessage && (
          <p className="text-xs text-center text-stone-400 mb-3">{predMessage}</p>
        )}
        <button
          onClick={submitPrediction}
          disabled={!selectedTeamId || predSubmitting}
          className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all duration-200 ${
            selectedTeamId && !predSubmitting
              ? 'bg-[#C1272D] hover:bg-[#A01F24] text-white shadow-lg shadow-[#C1272D]/30 active:scale-[0.98]'
              : 'bg-white/10 text-stone-500 cursor-not-allowed'
          }`}
        >
          {predSubmitting ? 'Envoi…' : 'Confirmer le pronostic'}
        </button>
      </div>
    );
  };

  /* ─────────────── RENDER ─────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1C1917]">
        <img src="/images/logo.png" alt="Loading" className="w-16 h-16 animate-pulse opacity-60" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1C1917] text-white">
        <h2 className="text-2xl font-bold">Match non trouvé</h2>
      </div>
    );
  }

  const status = getStatus(match.statut);
  const team1  = match.matchTeams?.[0];
  const team2  = match.matchTeams?.[1];
  const showScore = isMatchActive(match.statut) || isMatchFinished(match.statut);

  const TABS = [
    { key: 'overview', label: 'Overview',     icon: '' },
    { key: 'lineup',   label: 'Compositions', icon: '' },
    { key: 'events',   label: 'Événements',   icon: '', badge: events.length },
    { key: 'stats',    label: 'Statistiques', icon: '' },
  ];

  return (
    <>
       <Head>
        <title>MoroccoFan2030 | The Kingdom Roars</title>
        <meta name="description" content="MoroccoFan2030 - Football World Cup 2030 in Morocco" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        body { font-family: 'Outfit', sans-serif; background-color: #FAFAF9; color: #1C1917; }
        .serif-font { font-family: 'Playfair Display', serif; }

        @keyframes ping-dot {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .animate-ping-dot { animation: ping-dot 1.2s cubic-bezier(0,0,0.2,1) infinite; }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fade-up 0.55s ease-out forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.2s; opacity: 0; }
        .delay-3 { animation-delay: 0.3s; opacity: 0; }

        .timeline-line::before {
          content: '';
          position: absolute;
          top: 24px;
          bottom: 0;
          left: 23px;
          width: 2px;
          background: #E7E5E4;
          z-index: 0;
        }
        .hide-scroll::-webkit-scrollbar { display: none; }
        .glass-panel {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(231,229,228,0.8);
        }
      `}</style>

      <Navbar />

      {/* ══════════════ HERO ══════════════ */}
      <header className="relative pt-32 pb-16 bg-[#1C1917] overflow-hidden">
        {/* Background stadium image */}
        <div className="absolute inset-0 z-0">
          <img
            src=""
            className="w-full h-full object-cover opacity-15 grayscale"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          {/* Status pill */}
          <div className="flex justify-center mb-10 animate-fade-up">
            <div className={`flex items-center gap-2 px-5 py-1.5 rounded-full border backdrop-blur-sm ${
              status.live
                ? 'bg-[#C1272D]/10 border-[#C1272D]/30'
                : isMatchFinished(match.statut)
                  ? 'bg-stone-700/40 border-stone-600/30'
                  : 'bg-emerald-500/10 border-emerald-500/30'
            }`}>
              {status.live && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping-dot absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C1272D]" />
                </span>
              )}
              <span className={`text-xs font-bold uppercase tracking-widest ${
                status.live ? 'text-[#C1272D]' : isMatchFinished(match.statut) ? 'text-stone-400' : 'text-emerald-400'
              }`}>
                {status.label}
              </span>
            </div>
          </div>

          {/* Score board */}
          <div className="flex items-center justify-between md:justify-center gap-6 md:gap-20 animate-fade-up delay-1">
            {/* Team 1 */}
            <div className="flex flex-col items-center gap-4 w-1/3 md:w-auto">
              <div className="relative group">
                <div className="absolute -inset-4 bg-[#C1272D] opacity-20 blur-xl rounded-full group-hover:opacity-30 transition-opacity" />
                <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-full bg-stone-100 border-4 border-[#1C1917] shadow-2xl flex items-center justify-center overflow-hidden">
                  <img src={team1?.imageUrl} alt={team1?.teamName} className="w-full h-full object-cover" />
                </div>
              </div>
              <h2 className="serif-font text-white text-xl md:text-2xl text-center">{team1?.teamName}</h2>
              {showScore && (
                <div className="text-5xl md:text-7xl font-light text-white">{team1?.goals ?? 0}</div>
              )}
            </div>

            {/* Centre */}
            <div className="flex flex-col items-center">
              {showScore ? (
                <div className="text-4xl font-light text-stone-600">:</div>
              ) : (
                <>
                  <div className="serif-font text-4xl font-light text-white mb-3">VS</div>
                  <div className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-stone-400 text-xs font-medium uppercase tracking-wider">
                    {new Date(match.dateOfMatch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </>
              )}
            </div>

            {/* Team 2 */}
            <div className="flex flex-col items-center gap-4 w-1/3 md:w-auto">
              <div className="relative group">
                <div className="absolute -inset-4 bg-emerald-500 opacity-10 blur-xl rounded-full group-hover:opacity-20 transition-opacity" />
                <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-full bg-stone-100 border-4 border-[#1C1917] shadow-2xl flex items-center justify-center overflow-hidden">
                  <img src={team2?.imageUrl} alt={team2?.teamName} className="w-full h-full object-cover" />
                </div>
              </div>
              <h2 className="serif-font text-white text-xl md:text-2xl text-center">{team2?.teamName}</h2>
              {showScore && (
                <div className="text-5xl md:text-7xl font-light text-stone-400">{team2?.goals ?? 0}</div>
              )}
            </div>
          </div>

          {/* Meta info */}
          <div className="mt-12 flex flex-wrap justify-center gap-4 md:gap-8 text-stone-400 text-sm font-medium border-t border-white/5 pt-8 animate-fade-up delay-2">
            <div className="flex items-center gap-2">
             
              <span>{new Date(match.dateOfMatch).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-stone-700" />
            <div className="flex items-center gap-2">
             
              <span>{match.stadeName}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-stone-700" />
            <div className="flex items-center gap-2">
             
              <span>{match.type}</span>
            </div>
            {match.referee && (
              <>
                <div className="w-1 h-1 rounded-full bg-stone-700" />
                <div className="flex items-center gap-2">
                
                  <span>Arbitre: {match.referee}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════ STICKY TABS ══════════════ */}
      <div className="sticky top-16 z-40 bg-[#FAFAF9]/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto hide-scroll">
          <div className="flex items-center gap-6 min-w-max">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 border-b-2 transition-all text-sm font-medium flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-[#1C1917] text-[#1C1917] font-semibold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {tab.badge > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-8 space-y-10">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <>
              {/* Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up">
                <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex flex-col gap-1">
                  <span className="text-xs text-stone-500 font-medium uppercase tracking-wider">Buts</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-[#C1272D]">{team1?.goals ?? 0}</span>
                    <span className="text-stone-400 text-sm">vs</span>
                    <span className="text-2xl font-semibold text-stone-600">{team2?.goals ?? 0}</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex flex-col gap-1">
                  <span className="text-xs text-stone-500 font-medium uppercase tracking-wider">Possession</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold">{match.matchTeams?.[0]?.position ?? 50}%</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex flex-col gap-1">
                  <span className="text-xs text-stone-500 font-medium uppercase tracking-wider">Événements</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold">{events.length}</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex flex-col gap-1">
                  <span className="text-xs text-stone-500 font-medium uppercase tracking-wider">Joueurs</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold">{lineup.length}</span>
                  </div>
                </div>
              </div>

              {/* Event timeline preview */}
              {events.length > 0 && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-sm animate-fade-up delay-1">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="serif-font text-xl text-stone-900">Timeline du Match</h3>
                    <div className="flex items-center gap-3 text-xs font-medium text-stone-500">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#C1272D] inline-block" />{team1?.teamName}</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-stone-700 inline-block" />{team2?.teamName}</span>
                    </div>
                  </div>
                  <div className="space-y-0 relative timeline-line pl-2">
                    {events.slice(0, 6).sort((a, b) => (b.minute || 0) - (a.minute || 0)).map((ev) => {
                      const ei = getEventIcon(ev.additionalInfo);
                      const isTeam1 = ev.teamID === team1?.teamId;
                      return (
                        <div key={ev.id} className="relative pl-12 pb-6 group">
                          <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center bg-white z-10">
                            <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-[11px] font-bold text-stone-500 group-hover:border-[#C1272D] group-hover:text-[#C1272D] transition-colors">
                              {ev.minute}'
                            </div>
                          </div>
                          <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 flex items-center justify-between hover:bg-white hover:shadow-md hover:border-stone-200 transition-all">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full ${ei.bg} ring-1 ${ei.ring} flex items-center justify-center text-lg`}>
                                {ei.icon}
                              </div>
                              <div>
                                <div className="font-semibold text-stone-900">{ev.playerName}</div>
                                <div className={`text-xs ${ei.text}`}>{ev.additionalInfo}</div>
                                <div className="text-xs text-stone-400">{ev.teamName}</div>
                              </div>
                            </div>
                            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isTeam1 ? 'bg-[#C1272D]' : 'bg-stone-700'}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {events.length > 6 && (
                    <button
                      onClick={() => setActiveTab('events')}
                      className="mt-2 w-full text-sm text-[#C1272D] hover:underline font-medium text-center"
                    >
                      Voir tous les événements ({events.length}) →
                    </button>
                  )}
                </div>
              )}

              {/* Lineup preview */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-sm animate-fade-up delay-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="serif-font text-xl text-stone-900">Compositions</h3>
                  <button onClick={() => setActiveTab('lineup')} className="text-sm font-medium text-[#C1272D] hover:underline">
                    Voir tout →
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {[team1, team2].map((team, idx) => {
                    const players = starters(getTeamLineup(team?.teamId)).slice(0, 4);
                    const accent = idx === 0 ? '#C1272D' : '#1C1917';
                    return (
                      <div key={team?.teamId}>
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-stone-100">
                          <img src={team?.imageUrl} className="w-6 h-6 rounded-full object-cover border border-stone-200" alt={team?.teamName} />
                          <span className="font-semibold text-stone-900 text-sm">{team?.teamName}</span>
                        </div>
                        <ul className="space-y-3">
                          {players.map((player, i) => (
                            <li key={player.id} className="flex items-center gap-3 text-sm">
                              <span style={{ color: accent }} className="w-6 text-center text-xs font-bold">{player.jerseyNumber || i + 1}</span>
                              <span className="text-stone-800 font-medium">{player.playerName}</span>
                              {player.position === 'GK' && (
                                <span className="ml-auto text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">GK</span>
                              )}
                              {player.rating && (
                                <span className="ml-auto text-xs font-bold px-1.5 py-0.5 bg-stone-100 text-stone-700 rounded">{player.rating.toFixed(1)}</span>
                              )}
                            </li>
                          ))}
                          {starters(getTeamLineup(team?.teamId)).length > 4 && (
                            <li className="flex items-center gap-3 text-sm opacity-40">
                              <span className="w-6 text-center text-xs font-bold text-stone-400">···</span>
                              <span>+{starters(getTeamLineup(team?.teamId)).length - 4} joueurs</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── LINEUP TAB ── */}
          {activeTab === 'lineup' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[team1, team2].map((team, idx) => {
                const accent = idx === 0 ? '#C1272D' : '#006233';
                const teamPlayers = getTeamLineup(team?.teamId);
                return (
                  <div key={team?.teamId} className="bg-white rounded-3xl p-6 border-2 shadow-sm animate-fade-up" style={{ borderColor: accent }}>
                    <div className="flex items-center gap-3 mb-6">
                      <img src={team?.imageUrl} className="w-12 h-12 rounded-full border-2 border-stone-100 object-cover" alt={team?.teamName} />
                      <h3 className="font-bold text-lg text-stone-900">{team?.teamName}</h3>
                    </div>

                    <div className="mb-6">
                      <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Titulaires</p>
                      <div className="space-y-2">
                        {starters(teamPlayers).map((player, i) => (
                          <div key={player.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors group">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs flex-shrink-0" style={{ backgroundColor: accent }}>
                                {player.jerseyNumber || i + 1}
                              </div>
                              {player.playerImgUrl && (
                                <img src={player.playerImgUrl} className="w-9 h-9 rounded-full object-cover border border-stone-200" alt={player.playerName} />
                              )}
                              <div>
                                <p className="font-medium text-stone-900 text-sm">{player.playerName}</p>
                                <p className="text-xs text-stone-400">{player.position || 'N/A'}</p>
                              </div>
                            </div>
                            {player.rating && (
                              <span className="text-xs font-bold px-2 py-1 rounded-lg text-white" style={{ backgroundColor: accent }}>
                                {player.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {substitutes(teamPlayers).length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Remplaçants</p>
                        <div className="space-y-2">
                          {substitutes(teamPlayers).map((player, i) => (
                            <div key={player.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl opacity-60">
                              <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                {player.jerseyNumber || i + 12}
                              </div>
                              <div>
                                <p className="font-medium text-stone-700 text-sm">{player.playerName}</p>
                                <p className="text-xs text-stone-400">{player.position || 'N/A'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── EVENTS TAB ── */}
          {activeTab === 'events' && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-sm animate-fade-up">
              <div className="flex items-center justify-between mb-8">
                <h3 className="serif-font text-xl text-stone-900">Événements du Match</h3>
                <span className="text-sm font-bold text-white bg-amber-500 px-3 py-1 rounded-full">{events.length}</span>
              </div>
              {events.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4 opacity-20">⚽</div>
                  <p className="text-stone-400 text-sm">Aucun événement pour le moment</p>
                </div>
              ) : (
                <div className="relative timeline-line pl-2 space-y-0">
                  {events.sort((a, b) => (b.minute || 0) - (a.minute || 0)).map((ev) => {
                    const ei = getEventIcon(ev.additionalInfo);
                    const isTeam1 = ev.teamID === team1?.teamId;
                    return (
                      <div key={ev.id} className="relative pl-12 pb-6 group">
                        <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center bg-white z-10">
                          <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-[11px] font-bold text-stone-500 group-hover:border-[#C1272D] group-hover:text-[#C1272D] transition-colors">
                            {ev.minute}'
                          </div>
                        </div>
                        <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 flex items-center justify-between hover:bg-white hover:shadow-md hover:border-stone-200 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full ${ei.bg} ring-1 ${ei.ring} flex items-center justify-center text-xl`}>
                              {ei.icon}
                            </div>
                            <div>
                              <p className="font-semibold text-stone-900">{ev.playerName}</p>
                              <p className="text-xs text-stone-500">{ev.teamName}</p>
                              <p className={`text-xs ${ei.text} italic`}>{ev.additionalInfo}</p>
                            </div>
                          </div>
                          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${isTeam1 ? 'bg-[#C1272D]' : 'bg-stone-700'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── STATS TAB ── */}
          {activeTab === 'stats' && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-sm animate-fade-up">
              <h3 className="serif-font text-xl text-stone-900 mb-8">Statistiques Détaillées</h3>
              <div className="space-y-6">
                {[
                  {
                    label: 'Possession',
                    v1: match.matchTeams?.[0]?.position ?? 50,
                    v2: match.matchTeams?.[1]?.position ?? 50,
                    fmt: v => `${v}%`,
                    pct1: match.matchTeams?.[0]?.position ?? 50,
                  },
                  {
                    label: 'Buts',
                    v1: team1?.goals ?? 0,
                    v2: team2?.goals ?? 0,
                    fmt: v => v,
                    pct1: ((team1?.goals ?? 0) / Math.max((team1?.goals ?? 0) + (team2?.goals ?? 0), 1)) * 100,
                  },
                  {
                    label: 'Événements',
                    v1: events.filter(e => e.teamID === team1?.teamId).length,
                    v2: events.filter(e => e.teamID === team2?.teamId).length,
                    fmt: v => v,
                    pct1: (events.filter(e => e.teamID === team1?.teamId).length / Math.max(events.length, 1)) * 100,
                  },
                ].map(stat => (
                  <div key={stat.label}>
                    <div className="flex items-center justify-between mb-2.5 text-sm">
                      <span className="font-semibold text-[#C1272D]">{stat.fmt(stat.v1)}</span>
                      <span className="text-stone-500 text-xs font-medium uppercase tracking-wider">{stat.label}</span>
                      <span className="font-semibold text-stone-700">{stat.fmt(stat.v2)}</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden flex">
                      <div className="bg-[#C1272D] h-full rounded-full transition-all duration-700" style={{ width: `${stat.pct1}%` }} />
                      <div className="bg-stone-700 h-full rounded-full transition-all duration-700" style={{ width: `${100 - stat.pct1}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 p-6 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 text-center">
                <div className="text-3xl mb-2 opacity-30"></div>
              
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* ── PREDICTION PANEL ── */}
          <div className="rounded-3xl overflow-hidden bg-[#1C1917] border border-white/10 shadow-2xl animate-fade-up">
            <div className="p-6">
              <PredictionPanel />
            </div>
          </div>

          {/* ── WEATHER ── */}
          <div className="rounded-3xl p-6 text-white relative overflow-hidden shadow-lg animate-fade-up delay-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-700" />
            <div className="absolute top-0 right-0 p-8 opacity-10 text-[120px] leading-none select-none">☁️</div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
             
                <span className="text-sm font-medium opacity-90">{match.stadeName || 'Casablanca, MA'}</span>
              </div>
              {weather ? (
                <>
                  <div className="flex items-end gap-3 mb-2">
                    <span className="text-5xl font-bold">{Math.round(weather.main?.temp)}°</span>
                    <span className="text-base mb-1 opacity-80 capitalize">{weather.weather?.[0]?.description}</span>
                  </div>
                  <div className="h-px bg-white/20 my-4" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="block opacity-60 text-xs mb-1">Humidité</span><span className="font-medium">{weather.main?.humidity}%</span></div>
                    <div><span className="block opacity-60 text-xs mb-1">Vent</span><span className="font-medium">{Math.round((weather.wind?.speed || 0) * 3.6)} km/h</span></div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 opacity-60">
                  <p className="text-sm">Données météo non disponibles</p>
                </div>
              )}
            </div>
          </div>

          {/* ── MATCH INFO CARD ── */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm animate-fade-up delay-2">
            <h3 className="font-semibold text-stone-900 text-sm mb-5 flex items-center gap-2">
              <span>ℹ️</span> Informations du Match
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-start">
                <span className="text-stone-400">Date</span>
                <span className="font-medium text-stone-800 text-right">
                  {new Date(match.dateOfMatch).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="h-px bg-stone-100" />
              <div className="flex justify-between items-start">
                <span className="text-stone-400">Stade</span>
                <span className="font-medium text-stone-800 text-right">{match.stadeName}</span>
              </div>
              <div className="h-px bg-stone-100" />
              <div className="flex justify-between items-start">
                <span className="text-stone-400">Compétition</span>
                <span className="font-medium text-stone-800 text-right">{match.type}</span>
              </div>
              {match.referee && (
                <>
                  <div className="h-px bg-stone-100" />
                  <div className="flex justify-between items-start">
                    <span className="text-stone-400">Arbitre</span>
                    <span className="font-medium text-stone-800 text-right">{match.referee}</span>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}