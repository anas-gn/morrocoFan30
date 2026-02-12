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
  const [prediction, setPrediction] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [predSubmitting, setPredSubmitting] = useState(false);
  const [predMessage, setPredMessage] = useState(null);
  const [matchPredictions, setMatchPredictions] = useState([]);

  const supporterId =
    typeof window !== 'undefined'
      ? parseInt(localStorage.getItem('supporterId') || '0', 10)
      : 0;

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      try {
        const [matchRes, eventsRes, lineupRes, predictionsRes] = await Promise.all([
          fetch(`http://localhost:3309/api/matches/matches/${id}`),
          fetch(`http://localhost:3309/api/matches/matches/${id}/events`),
          fetch(`http://localhost:3309/api/matches/matches/${id}/players/lineup`),
          fetch(`http://localhost:3309/api/predictions/match/${id}`),
        ]);
        const [matchData, eventsData, lineupData, predictionsData] = await Promise.all([
          matchRes.json(), eventsRes.json(), lineupRes.json(), predictionsRes.json(),
        ]);
        setMatch(matchData);
        setEvents(eventsData);
        setLineup(lineupData);
        setMatchPredictions(predictionsData || []);

        // Fetch weather based on stadium location
        if (matchData?.stadeName) {
          fetchWeather(matchData.stadeName);
        }

        // fetch existing prediction
        if (supporterId) {
          try {
            const predRes = await fetch(
              `http://localhost:3309/api/predictions/supporter/${supporterId}/match/${id}`
            );
            if (predRes.ok) {
              const predData = await predRes.json();
              setPrediction(predData);
              setSelectedTeamId(predData.predictedWinnerId);
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
  }, [id, supporterId]);

  const fetchWeather = async (cityName) => {
    try {
      const city = cityName.split(',')[0].trim() || 'Casablanca';
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city},MA&units=metric&appid=YOUR_API_KEY`
      );
      if (res.ok) {
        setWeather(await res.json());
      }
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
        setPredMessage('✓ Pronostic enregistré avec succès !');
        const predictionsRes = await fetch(`http://localhost:3309/api/predictions/match/${id}`);
        const predictionsData = await predictionsRes.json();
        setMatchPredictions(predictionsData || []);
      } else {
        setPredMessage('✗ Erreur lors de l\'enregistrement.');
      }
    } catch (_) {
      setPredMessage('✗ Erreur réseau.');
    }
    setPredSubmitting(false);
  };

  const getStatus = (s) => {
    const map = {
      DIRECT:   { label: 'LIVE',      live: true,  minute: '74\'' },
      started:  { label: 'LIVE',      live: true,  minute: '74\'' },
      commence: { label: 'LIVE',      live: true,  minute: '74\'' },
      termine:  { label: 'FT',        live: false, minute: 'FT' },
      Finished: { label: 'FT',        live: false, minute: 'FT' },
      upcoming: { label: 'À VENIR',   live: false, minute: '' },
    };
    return map[s] || { label: 'PRÉVU', live: false, minute: '' };
  };

  const isMatchActive = (s) => ['DIRECT','started','commence'].includes(s);
  const isMatchFinished = (s) => ['termine','Finished'].includes(s);
  const isMatchUpcoming = (s) => !isMatchActive(s) && !isMatchFinished(s);

  const getEventIcon = (info = '') => {
    const l = info.toLowerCase();
    if (l.includes('goal'))         return { icon: 'solar:football-linear', color: 'text-[#C1272D]', bg: 'bg-[#C1272D]/10' };
    if (l.includes('yellow'))       return { icon: 'solar:card-linear', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (l.includes('red'))          return { icon: 'solar:card-linear', color: 'text-red-600', bg: 'bg-red-100' };
    if (l.includes('substitution')) return { icon: 'solar:refresh-circle-linear', color: 'text-stone-600', bg: 'bg-stone-200' };
    return                                 { icon: 'solar:info-circle-linear', color: 'text-stone-600', bg: 'bg-stone-100' };
  };

  const getTeamLineup = (teamId) => lineup.filter(p => p.teamID === teamId);
  const starters      = (arr)    => arr.filter(p =>  p.starter);
  const substitutes   = (arr)    => arr.filter(p => !p.starter);

  const getPredictionStats = () => {
    const team1 = match?.matchTeams?.[0];
    const team2 = match?.matchTeams?.[1];
    
    if (!team1 || !team2 || matchPredictions.length === 0) {
      return { team1Percent: 0, team2Percent: 0, total: 0 };
    }

    const team1Count = matchPredictions.filter(p => p.predictedWinnerId === team1.teamId).length;
    const team2Count = matchPredictions.filter(p => p.predictedWinnerId === team2.teamId).length;
    const total = matchPredictions.length;

    return {
      team1Count,
      team2Count,
      team1Percent: total > 0 ? Math.round((team1Count / total) * 100) : 0,
      team2Percent: total > 0 ? Math.round((team2Count / total) * 100) : 0,
      total
    };
  };

  const getManOfTheMatch = () => {
    if (lineup.length === 0) return null;
    const playersWithRatings = lineup.filter(p => p.rating && p.rating > 0);
    if (playersWithRatings.length === 0) return null;
    return playersWithRatings.reduce((best, current) => 
      current.rating > (best?.rating || 0) ? current : best
    , null);
  };

  const PredictionPanel = () => {
    const team1 = match?.matchTeams?.[0];
    const team2 = match?.matchTeams?.[1];
    const status = match?.statut;
    const stats = getPredictionStats();

    if (prediction) {
      const winnerName = prediction.predictedWinnerName || 'Inconnue';
      const st = prediction.status?.toLowerCase();
      const resultConfig = {
        correct:   { bg: 'bg-emerald-50 border-emerald-200', icon: 'solar:check-circle-bold', iconColor: 'text-emerald-600', label: 'Correct !' },
        incorrect: { bg: 'bg-red-50 border-red-200', icon: 'solar:close-circle-bold', iconColor: 'text-red-600', label: 'Incorrect' },
        pending:   { bg: 'bg-amber-50 border-amber-200', icon: 'solar:clock-circle-linear', iconColor: 'text-amber-600', label: 'En attente' },
      };
      const r = resultConfig[st] || resultConfig.pending;

      return (
        <div className={`rounded-2xl p-5 border ${r.bg}`}>
          <div className="flex items-center gap-2 mb-4">
            <iconify-icon icon={r.icon} class={`${r.iconColor} text-lg`}></iconify-icon>
            <h3 className="font-semibold text-stone-900 text-sm">Mon Pronostic</h3>
            <span className={`ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded ${r.iconColor}`}>
              {r.label}
            </span>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-stone-100">
            <img
              src={selectedTeamId === team1?.teamId ? team1?.imageUrl : team2?.imageUrl}
              className="w-10 h-10 rounded-full object-cover border border-stone-200"
              alt={winnerName}
            />
            <div>
              <p className="text-xs text-stone-500 mb-0.5">Équipe pronostiquée</p>
              <p className="font-bold text-stone-900 text-sm">{winnerName}</p>
            </div>
          </div>

          {stats.total > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-xs text-stone-500 text-center mb-2">
                {stats.total} pronostic{stats.total > 1 ? 's' : ''} au total
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">{team1?.teamName}</span>
                  <span className="text-stone-900 font-bold">{stats.team1Percent}%</span>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden flex">
                  <div className="bg-[#C1272D] h-full transition-all duration-700" style={{ width: `${stats.team1Percent}%` }} />
                  <div className="bg-stone-800 h-full transition-all duration-700" style={{ width: `${stats.team2Percent}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-900 font-bold">{stats.team2Percent}%</span>
                  <span className="text-stone-600">{team2?.teamName}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (!isMatchUpcoming(status) && !prediction) {
      return (
        <div className="rounded-2xl p-5 bg-stone-50 border border-stone-200">
          <div className="flex items-center gap-2 mb-3">
            <iconify-icon icon="solar:lock-linear" class="text-stone-500"></iconify-icon>
            <h3 className="font-semibold text-stone-900 text-sm">Pronostic</h3>
          </div>
          <p className="text-stone-600 text-sm text-center py-3">
            Les pronostics ne sont plus acceptés.<br />
            Le match a {isMatchFinished(status) ? 'terminé' : 'commencé'}.
          </p>
          
          {stats.total > 0 && (
            <div className="mt-4 pt-4 border-t border-stone-200 space-y-2">
              <div className="text-xs text-stone-500 text-center mb-2">
                {stats.total} pronostic{stats.total > 1 ? 's' : ''}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">{team1?.teamName}</span>
                  <span className="text-stone-900 font-bold">{stats.team1Percent}%</span>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden flex">
                  <div className="bg-[#C1272D] h-full transition-all duration-700" style={{ width: `${stats.team1Percent}%` }} />
                  <div className="bg-stone-800 h-full transition-all duration-700" style={{ width: `${stats.team2Percent}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-900 font-bold">{stats.team2Percent}%</span>
                  <span className="text-stone-600">{team2?.teamName}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="rounded-2xl p-5 bg-white border border-stone-200">
        <div className="flex items-center gap-2 mb-4">
          <iconify-icon icon="solar:chart-2-linear" class="text-stone-700"></iconify-icon>
          <h3 className="font-semibold text-stone-900 text-sm">Votre Pronostic</h3>
          <span className="ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
            Ouvert
          </span>
        </div>
        <p className="text-stone-600 text-xs mb-3">Qui remportera ce match ?</p>
        
        {stats.total > 0 && (
          <div className="mb-3 p-3 bg-stone-50 rounded-xl">
            <div className="text-xs text-stone-500 mb-2">
              {stats.total} pronostic{stats.total > 1 ? 's' : ''}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">{team1?.teamName}</span>
                <span className="text-stone-900 font-bold">{stats.team1Percent}%</span>
              </div>
              <div className="h-1 bg-stone-200 rounded-full overflow-hidden flex">
                <div className="bg-[#C1272D] h-full transition-all duration-700" style={{ width: `${stats.team1Percent}%` }} />
                <div className="bg-stone-800 h-full transition-all duration-700" style={{ width: `${stats.team2Percent}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-900 font-bold">{stats.team2Percent}%</span>
                <span className="text-stone-600">{team2?.teamName}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 mb-4">
          {[team1, team2].map(team => (
            <button
              key={team?.teamId}
              onClick={() => setSelectedTeamId(team?.teamId)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                selectedTeamId === team?.teamId
                  ? 'bg-[#C1272D]/5 border-[#C1272D] shadow-sm'
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                selectedTeamId === team?.teamId ? 'border-[#C1272D]' : 'border-stone-300'
              }`}>
                {selectedTeamId === team?.teamId && (
                  <div className="w-2 h-2 rounded-full bg-[#C1272D]" />
                )}
              </div>
              <img src={team?.imageUrl} className="w-8 h-8 rounded-full object-cover border border-stone-200" alt={team?.teamName} />
              <span className="font-medium text-stone-900 text-sm">{team?.teamName}</span>
            </button>
          ))}
        </div>
        
        {predMessage && (
          <p className={`text-xs text-center mb-3 ${predMessage.includes('✓') ? 'text-emerald-600' : 'text-red-600'}`}>
            {predMessage}
          </p>
        )}
        
        <button
          onClick={submitPrediction}
          disabled={!selectedTeamId || predSubmitting}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
            selectedTeamId && !predSubmitting
              ? 'bg-[#C1272D] hover:bg-[#A01F24] text-white shadow-sm active:scale-[0.98]'
              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
          }`}
        >
          {predSubmitting ? 'Envoi…' : 'Confirmer le pronostic'}
        </button>
      </div>
    );
  };
if (loading) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <img
        src="/images/logo.png"
        alt="Loading"
        className="w-20 h-20 mb-4"
      />
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
  const manOfMatch = getManOfTheMatch();

  const TABS = [
    { key: 'overview', label: 'Overview',     icon: 'solar:info-circle-linear' },
    { key: 'lineup',   label: 'Lineups',      icon: 'solar:users-group-rounded-linear' },
    { key: 'events',   label: 'Events',       icon: 'solar:list-linear', badge: events.length },
    { key: 'stats',    label: 'Stats',        icon: 'solar:chart-square-linear' },
  ];

  return (
    <>
      <Head>
        <title>{`${team1?.teamName || ''} vs ${team2?.teamName || ''} | Match Detail`}</title>
        <meta name="description" content="MoroccoFan2030 - Football World Cup 2030 in Morocco" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
        <link rel="icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        body { 
          font-family: 'Outfit', sans-serif; 
          background-color: #FAFAF9; 
          color: #1C1917; 
        }
        
        .serif-font { 
          font-family: 'Playfair Display', serif; 
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(231, 229, 228, 0.8);
        }

        .glass-dark {
          background: rgba(28, 25, 23, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

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

        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <Navbar />

      {/* Hero Section */}
      <header className="relative pt-32 pb-16 bg-[#1C1917] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={match.imageUrl || "/images/default-stadium.jpg"}
            className="w-full h-full object-cover   mix-blend-overlay"
            alt={match.stadeName}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          {/* Match Status Pill */}
          <div className="flex justify-center mb-10">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-sm ${
              status.live
                ? 'bg-[#C1272D]/10 border border-[#C1272D]/20'
                : isMatchFinished(match.statut)
                  ? 'bg-stone-700/40 border border-stone-600/30'
                  : 'bg-emerald-500/10 border border-emerald-500/20'
            }`}>
              {status.live && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C1272D]" />
                </span>
              )}
              <span className={`text-xs font-bold uppercase tracking-widest ${
                status.live ? 'text-[#C1272D]' : isMatchFinished(match.statut) ? 'text-stone-400' : 'text-emerald-400'
              }`}>
                {status.label} {status.live && `• ${status.minute}`}
              </span>
            </div>
          </div>

          {/* Score Board */}
          <div className="flex items-center justify-between md:justify-center gap-4 md:gap-24">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-4 w-1/3 md:w-auto">
              <div className="relative group">
                <div className="absolute -inset-4 bg-[#C1272D] opacity-20 blur-xl rounded-full group-hover:opacity-30 transition-opacity" />
                <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-full bg-stone-100 border-4 border-[#1C1917] shadow-2xl flex items-center justify-center p-2">
                  <img src={team1?.imageUrl} alt={team1?.teamName} className="w-full h-full object-cover rounded-full shadow-inner" />
                </div>
              </div>
              <h2 className="text-white text-lg md:text-2xl serif-font text-center">{team1?.teamName}</h2>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center justify-center">
              {showScore ? (
                <>
                  <div className="flex items-center gap-4 md:gap-8 font-light text-6xl md:text-8xl text-white tracking-tighter leading-none">
                    <span>{team1?.goals ?? 0}</span>
                    <span className="text-stone-600 text-4xl md:text-6xl">:</span>
                    <span className="text-stone-500">{team2?.goals ?? 0}</span>
                  </div>
                  {status.live && (
                    <div className="mt-4 px-4 py-1.5 rounded-lg glass-dark text-stone-400 text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                      <iconify-icon icon="solar:whistle-linear"></iconify-icon>
                      {match.statut === 'DIRECT' ? '2nd Half' : 'Live'}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="serif-font text-5xl md:text-6xl font-light text-white mb-3">VS</div>
                  <div className="px-4 py-1.5 rounded-lg glass-dark text-stone-400 text-xs font-medium uppercase tracking-wider">
                    {new Date(match.dateOfMatch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-4 w-1/3 md:w-auto">
              <div className="relative group">
                <div className="absolute -inset-4 bg-yellow-500 opacity-10 blur-xl rounded-full group-hover:opacity-20 transition-opacity" />
                <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-full bg-stone-100 border-4 border-[#1C1917] shadow-2xl flex items-center justify-center p-2">
                  <img src={team2?.imageUrl} alt={team2?.teamName} className="w-full h-full object-cover rounded-full shadow-inner" />
                </div>
              </div>
              <h2 className="text-white text-lg md:text-2xl serif-font text-center">{team2?.teamName}</h2>
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-12 flex flex-wrap justify-center gap-4 md:gap-8 text-stone-400 text-sm font-medium border-t border-white/5 pt-8">
            <div className="flex items-center gap-2">
              <iconify-icon icon="solar:calendar-date-linear" class="text-stone-500"></iconify-icon>
              <span>{new Date(match.dateOfMatch).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-stone-700" />
            <div className="flex items-center gap-2">
              <iconify-icon icon="solar:map-point-linear" class="text-stone-500"></iconify-icon>
              <span>{match.stadeName}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-stone-700" />
            <div className="flex items-center gap-2">
             
              <span>{match.type}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Tabs */}
      <div className="sticky top-16 z-40 bg-[#FAFAF9]/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto hide-scroll">
          <div className="flex items-center gap-8 min-w-max">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 border-b-2 transition-colors text-sm font-medium flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-[#1C1917] text-[#1C1917] font-semibold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <iconify-icon icon={tab.icon} width="18"></iconify-icon>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col gap-1">
                  <span className="text-xs text-stone-500 font-medium uppercase tracking-wider">Possession</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-[#1C1917]">{match.matchTeams?.[0]?.position ?? 50}%</span>
                    <div className="h-1 flex-1 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#C1272D]" style={{ width: `${match.matchTeams?.[0]?.position ?? 50}%` }} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col gap-1">
                  <span className="text-xs text-stone-500 font-medium uppercase tracking-wider">Buts</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-[#1C1917]">{team1?.goals ?? 0}</span>
                    <span className="text-sm text-stone-400">vs {team2?.goals ?? 0}</span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col gap-1">
                  <span className="text-xs text-stone-500 font-medium uppercase tracking-wider">Événements</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-[#1C1917]">{events.length}</span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col gap-1">
                  <span className="text-xs text-stone-500 font-medium uppercase tracking-wider">Joueurs</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-[#1C1917]">{lineup.length}</span>
                  </div>
                </div>
              </div>

              {/* Match Events Timeline */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="serif-font text-xl text-stone-900">Match Events</h3>
                  <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
                    <span className="w-2 h-2 rounded-full bg-[#C1272D]" /> {team1?.teamName}
                    <span className="w-2 h-2 rounded-full bg-stone-800 ml-2" /> {team2?.teamName}
                  </div>
                </div>

                {events.length === 0 ? (
                  <div className="text-center py-16">
                    <iconify-icon icon="solar:football-linear" class="text-stone-300 text-5xl mb-4"></iconify-icon>
                    <p className="text-stone-400 text-sm">Aucun événement pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-0 relative timeline-line pl-2">
                    {events.sort((a, b) => (b.minute || 0) - (a.minute || 0)).slice(0, 6).map((ev) => {
                      const ei = getEventIcon(ev.additionalInfo);
                      const isTeam1 = ev.teamID === team1?.teamId;
                      return (
                        <div key={ev.id} className="relative pl-12 pb-8 group">
                          <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center bg-white z-10">
                            <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-500 group-hover:border-[#C1272D] group-hover:text-[#C1272D] transition-colors">
                              {ev.minute}'
                            </div>
                          </div>
                          <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 flex items-center justify-between hover:bg-white hover:shadow-md hover:border-stone-200 transition-all cursor-default">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full ${ei.bg} ${ei.color} flex items-center justify-center`}>
                                <iconify-icon icon={ei.icon} width="20"></iconify-icon>
                              </div>
                              <div>
                                <div className="font-semibold text-stone-900">{ev.additionalInfo}</div>
                                <div className="text-xs text-stone-500">{ev.playerName}</div>
                              </div>
                            </div>
                            {ev.additionalInfo?.toLowerCase().includes('goal') && (
                              <span className="text-2xl serif-font text-stone-900">
                                {isTeam1 ? `${team1.goals}-${team2.goals}` : `${team1.goals}-${team2.goals}`}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {events.length > 6 && (
                  <button
                    onClick={() => setActiveTab('events')}
                    className="mt-2 w-full text-sm text-[#C1272D] hover:underline font-medium text-center"
                  >
                    Voir tous les événements ({events.length})
                  </button>
                )}
              </div>

              {/* Lineups Preview */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="serif-font text-xl text-stone-900">Lineups</h3>
                  <button onClick={() => setActiveTab('lineup')} className="text-sm font-medium text-[#C1272D] hover:underline">
                    View Pitch
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {[team1, team2].map((team, idx) => {
                    const players = starters(getTeamLineup(team?.teamId)).slice(0, 5);
                    return (
                      <div key={team?.teamId}>
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-stone-100">
                          <img src={team?.imageUrl} className="w-6 h-6 rounded-full object-cover" alt={team?.teamName} />
                          <span className="font-semibold text-stone-900">{team?.teamName}</span>
                          <span className="text-xs text-stone-400 ml-auto font-mono">4-3-3</span>
                        </div>
                        <ul className="space-y-3">
                          {players.map((player, i) => (
                            <li key={player.id} className="flex items-center gap-3 text-sm">
                              <span className="w-6 text-center text-xs font-bold text-stone-400">
                                {player.jerseyNumber || i + 1}
                              </span>
                              <span className="text-stone-800 font-medium">{player.playerName}</span>
                              {player.position === 'GK' && (
                                <span className="ml-auto text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">GK</span>
                              )}
                              {player.rating && player.rating > 8 && (
                                <iconify-icon icon="solar:star-bold" class="text-[#C1272D] text-xs ml-auto"></iconify-icon>
                              )}
                            </li>
                          ))}
                          {starters(getTeamLineup(team?.teamId)).length > 5 && (
                            <li className="flex items-center gap-3 text-sm opacity-50">
                              <span className="w-6 text-center text-xs font-bold text-stone-400">...</span>
                              <span>See full list</span>
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

          {/* Lineup Tab */}
          {activeTab === 'lineup' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[team1, team2].map((team, idx) => {
                const teamPlayers = getTeamLineup(team?.teamId);
                const accent = idx === 0 ? '#C1272D' : '#1C1917';
                return (
                  <div key={team?.teamId} className="bg-white rounded-3xl p-6 border-2 shadow-sm" style={{ borderColor: accent }}>
                    <div className="flex items-center gap-3 mb-6">
                      <img src={team?.imageUrl} className="w-12 h-12 rounded-full border-2 border-stone-100 object-cover" alt={team?.teamName} />
                      <h3 className="font-bold text-lg text-stone-900">{team?.teamName}</h3>
                    </div>

                    <div className="mb-6">
                      <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Titulaires</p>
                      <div className="space-y-2">
                        {starters(teamPlayers).map((player, i) => (
                          <div key={player.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs" style={{ backgroundColor: accent }}>
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
                              <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center font-bold text-xs">
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

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="serif-font text-xl text-stone-900">Match Events</h3>
                <span className="text-sm font-bold text-white bg-amber-500 px-3 py-1 rounded-full">{events.length}</span>
              </div>
              {events.length === 0 ? (
                <div className="text-center py-16">
                  <iconify-icon icon="solar:football-linear" class="text-stone-300 text-5xl mb-4"></iconify-icon>
                  <p className="text-stone-400 text-sm">Aucun événement pour le moment</p>
                </div>
              ) : (
                <div className="relative timeline-line pl-2 space-y-0">
                  {events.sort((a, b) => (b.minute || 0) - (a.minute || 0)).map((ev) => {
                    const ei = getEventIcon(ev.additionalInfo);
                    return (
                      <div key={ev.id} className="relative pl-12 pb-6 group">
                        <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center bg-white z-10">
                          <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-500 group-hover:border-[#C1272D] group-hover:text-[#C1272D] transition-colors">
                            {ev.minute}'
                          </div>
                        </div>
                        <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 flex items-center justify-between hover:bg-white hover:shadow-md hover:border-stone-200 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full ${ei.bg} ${ei.color} flex items-center justify-center`}>
                              <iconify-icon icon={ei.icon} width="20"></iconify-icon>
                            </div>
                            <div>
                              <p className="font-semibold text-stone-900">{ev.playerName}</p>
                              <p className="text-xs text-stone-500">{ev.teamName}</p>
                              <p className="text-xs text-stone-500 italic">{ev.additionalInfo}</p>
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

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-sm">
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
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Prediction Panel */}
          <PredictionPanel />

          {/* Man of the Match */}
          {manOfMatch && (
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
              <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2 text-sm">
                <iconify-icon icon="solar:star-fall-linear" class="text-yellow-500"></iconify-icon>
                Homme du Match
              </h3>
              <div className="flex items-center gap-4">
                {manOfMatch.playerImgUrl && (
                  <img 
                    src={manOfMatch.playerImgUrl} 
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#C1272D] p-0.5" 
                    alt={manOfMatch.playerName}
                  />
                )}
                <div>
                  <div className="font-bold text-stone-900">{manOfMatch.playerName}</div>
                  <div className="text-xs text-stone-500">{manOfMatch.position || 'N/A'}</div>
                  <div className="mt-1">
                    <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600 font-bold">
                      {manOfMatch.rating?.toFixed(1)} Rating
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Weather */}
          <div className="rounded-2xl p-6 text-white relative overflow-hidden shadow-lg group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600" />
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <iconify-icon icon="solar:cloud-sun-bold" width="120"></iconify-icon>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <iconify-icon icon="solar:map-point-bold"></iconify-icon>
                <span className="text-sm font-medium opacity-90">{match.stadeName?.split(',')[0] || 'Casablanca'}</span>
              </div>
              
              {weather ? (
                <>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-bold">{Math.round(weather.main?.temp)}°</span>
                    <span className="text-lg mb-1 opacity-80 capitalize">{weather.weather?.[0]?.description}</span>
                  </div>
                  
                  <div className="h-px bg-white/20 my-4" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block opacity-60 text-xs">Humidité</span>
                      <span className="font-medium">{weather.main?.humidity}%</span>
                    </div>
                    <div>
                      <span className="block opacity-60 text-xs">Vent</span>
                      <span className="font-medium">{Math.round((weather.wind?.speed || 0) * 3.6)} km/h</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 opacity-60">
                  <p className="text-sm">Données météo non disponibles</p>
                </div>
              )}
            </div>
          </div>

          {/* Match Info */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
            <h3 className="font-semibold text-stone-900 text-sm mb-4 flex items-center gap-2">
              <iconify-icon icon="solar:info-circle-linear"></iconify-icon>
              Informations du Match
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-start">
                <span className="text-stone-500">Date</span>
                <span className="font-medium text-stone-800 text-right">
                  {new Date(match.dateOfMatch).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="h-px bg-stone-100" />
              <div className="flex justify-between items-start">
                <span className="text-stone-500">Stade</span>
                <span className="font-medium text-stone-800 text-right">{match.stadeName}</span>
              </div>
              <div className="h-px bg-stone-100" />
              <div className="flex justify-between items-start">
                <span className="text-stone-500">Compétition</span>
                <span className="font-medium text-stone-800 text-right">{match.type}</span>
              </div>
              {match.referee && (
                <>
                  <div className="h-px bg-stone-100" />
                  <div className="flex justify-between items-start">
                    <span className="text-stone-500">Arbitre</span>
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