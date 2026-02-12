import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MatchDetail() {
  const router = useRouter();
  const { id } = router.query;

  // États pour les données
  const [match, setMatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [lineup, setLineup] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'lineup', 'events', 'stats'

  // Récupérer les données du match
  useEffect(() => {
    if (!id) return;

    const fetchMatchData = async () => {
      try {
        // Récupérer le match
        const matchRes = await fetch(`http://localhost:3309/api/matches/matches/${id}`);
        const matchData = await matchRes.json();
        setMatch(matchData);

        // Récupérer les événements
        const eventsRes = await fetch(`http://localhost:3309/api/matches/matches/${id}/events`);
        const eventsData = await eventsRes.json();
        setEvents(eventsData);

        // Récupérer le lineup
        const lineupRes = await fetch(`http://localhost:3309/api/matches/matches/${id}/players/lineup`);
        const lineupData = await lineupRes.json();
        setLineup(lineupData);

        // Récupérer la météo (exemple avec des coordonnées fictives - à adapter selon le stade)
        if (matchData?.stadeId) {
          // Vous pouvez mapper les stades à leurs coordonnées
          fetchWeather(33.5731, -7.5898); // Coordonnées de Casablanca par exemple
        }

        setLoading(false);
      } catch (err) {
        console.error('Erreur:', err);
        setLoading(false);
      }
    };

    fetchMatchData();
  }, [id]);

  const fetchWeather = async (lat, lng) => {
    try {
      // Remplacez par votre API météo réelle
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=YOUR_API_KEY`
      );
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      console.error('Erreur météo:', err);
    }
  };

  // Fonction pour obtenir le statut du match avec style
  const getMatchStatus = (status) => {
    const statusMap = {
      'DIRECT': { label: 'LIVE', color: 'bg-red-500', textColor: 'text-white', pulse: true },
      'started': { label: 'LIVE', color: 'bg-red-500', textColor: 'text-white', pulse: true },
      'commence': { label: 'LIVE', color: 'bg-red-500', textColor: 'text-white', pulse: true },
      'termine': { label: 'FT', color: 'bg-stone-500', textColor: 'text-white', pulse: false },
      'Finished': { label: 'FT', color: 'bg-stone-500', textColor: 'text-white', pulse: false },
      'upcoming': { label: 'Upcoming', color: 'bg-green-500', textColor: 'text-white', pulse: false },
      'default': { label: 'Scheduled', color: 'bg-stone-200', textColor: 'text-stone-700', pulse: false }
    };
    return statusMap[status] || statusMap.default;
  };

  // Grouper les joueurs par équipe
  const getTeamLineup = (teamId) => {
    return lineup.filter(player => player.teamID === teamId);
  };

  // Séparer titulaires et remplaçants
  const getStarters = (teamPlayers) => {
    return teamPlayers.filter(player => player.starter);
  };

  const getSubstitutes = (teamPlayers) => {
    return teamPlayers.filter(player => !player.starter);
  };

  // Icône d'événement
  const getEventIcon = (info) => {
    if (info?.toLowerCase().includes('goal')) return '⚽';
    if (info?.toLowerCase().includes('yellow')) return '🟨';
    if (info?.toLowerCase().includes('red')) return '🟥';
    if (info?.toLowerCase().includes('substitution')) return '🔄';
    return '📌';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
        <img
          src="/images/logo.png"
          alt="Loading"
          className="w-20 h-20 mb-4 animate-pulse"
        />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
        <h2 className="text-2xl font-bold text-stone-700">Match non trouvé</h2>
      </div>
    );
  }

  const status = getMatchStatus(match.statut);
  const team1 = match.matchTeams?.[0];
  const team2 = match.matchTeams?.[1];

  return (
    <>
      <Head>
        <title>{`${team1?.teamName} vs ${team2?.teamName} | MoroccoFan2030`}</title>
        <meta name="description" content={`Match details for ${team1?.teamName} vs ${team2?.teamName}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        body { font-family: 'Cairo', sans-serif; }
        h1, h2, h3, h4, .serif-font { font-family: 'Amiri', serif; }
        .decorative-font { font-family: 'Aref Ruqaa', serif; }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
        }
        .animate-pulse-glow { animation: pulse-glow 2s infinite; }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>

      <Navbar />

      {/* Hero Section - Score principal */}
      <header className="relative pt-32 pb-12 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 overflow-hidden">
        {/* Pattern background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          {/* Badge de statut */}
          <div className="flex justify-center mb-6">
            <span className={`px-6 py-2 rounded-full text-sm font-bold uppercase ${status.color} ${status.textColor} ${status.pulse ? 'animate-pulse-glow' : ''}`}>
              {status.label}
            </span>
          </div>

          {/* Score principal */}
          <div className="flex items-center justify-center gap-8 md:gap-16 mb-8">
            {/* Team 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full border-4 border-[#C1272D] flex items-center justify-center mb-4 overflow-hidden">
                <img 
                  src={team1?.imageUrl}
                  alt={team1?.teamName}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{team1?.teamName}</h2>
              {(match.statut === 'termine' || match.statut === 'Finished' || match.statut === 'DIRECT' || match.statut === 'started') && (
                <div className="text-6xl md:text-7xl font-bold text-[#C1272D]">{team1?.goals || 0}</div>
              )}
            </div>

            {/* VS / Time */}
            <div className="text-center">
              {(match.statut === 'termine' || match.statut === 'Finished' || match.statut === 'DIRECT' || match.statut === 'started') ? (
                <div className="text-4xl font-light text-stone-400">-</div>
              ) : (
                <div>
                  <div className="text-5xl font-light text-white mb-2">VS</div>
                  <div className="text-sm text-stone-400">
                    {new Date(match.dateOfMatch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
            </div>

            {/* Team 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full border-4 border-[#006233] flex items-center justify-center mb-4 overflow-hidden">
                <img 
                  src={team2?.imageUrl}
                  alt={team2?.teamName}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{team2?.teamName}</h2>
              {(match.statut === 'termine' || match.statut === 'Finished' || match.statut === 'DIRECT' || match.statut === 'started') && (
                <div className="text-6xl md:text-7xl font-bold text-[#006233]">{team2?.goals || 0}</div>
              )}
            </div>
          </div>

          {/* Informations du match */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-stone-300">
            <div className="flex items-center gap-2">
              <span className="material-icons text-sm">calendar_today</span>
              <span className="text-sm">{new Date(match.dateOfMatch).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="w-1 h-1 bg-stone-500 rounded-full"></div>
            <div className="flex items-center gap-2">
              <span className="material-icons text-sm">stadium</span>
              <span className="text-sm font-medium">{match.stadeName}</span>
            </div>
            <div className="w-1 h-1 bg-stone-500 rounded-full"></div>
            <div className="flex items-center gap-2">
              <span className="material-icons text-sm">emoji_events</span>
              <span className="text-sm">{match.type}</span>
            </div>
            {match.referee && (
              <>
                <div className="w-1 h-1 bg-stone-500 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <span className="material-icons text-sm">sports</span>
                  <span className="text-sm">Arbitre: {match.referee}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Navigation tabs */}
      <section className="sticky top-20 bg-white border-b border-stone-200 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-[#C1272D] text-[#C1272D]'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-icons text-sm">info</span>
                <span>Vue d'ensemble</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('lineup')}
              className={`px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'lineup'
                  ? 'border-[#006233] text-[#006233]'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-icons text-sm">groups</span>
                <span>Compositions</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'events'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-icons text-sm">sports_soccer</span>
                <span>Événements</span>
                {events.length > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                    {events.length}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'border-stone-500 text-stone-500'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-icons text-sm">bar_chart</span>
                <span>Statistiques</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="py-12 bg-stone-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Météo */}
              <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-icons text-[#C1272D]">wb_sunny</span>
                  <h3 className="text-lg font-bold text-stone-900">Conditions Météo</h3>
                </div>
                
                {weather ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600">Température</span>
                      <span className="text-2xl font-bold text-[#C1272D]">
                        {Math.round(weather.main?.temp)}°C
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600">Conditions</span>
                      <span className="font-medium capitalize">{weather.weather?.[0]?.description}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600">Humidité</span>
                      <span className="font-medium">{weather.main?.humidity}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600">Vent</span>
                      <span className="font-medium">{Math.round(weather.wind?.speed * 3.6)} km/h</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-stone-500">
                    <span className="material-icons text-4xl mb-2">cloud_off</span>
                    <p className="text-sm">Données météo non disponibles</p>
                  </div>
                )}
              </div>

              {/* Résumé du match */}
              <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-stone-200 p-6 animate-fade-in-up delay-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-icons text-[#006233]">description</span>
                  <h3 className="text-lg font-bold text-stone-900">Résumé du Match</h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Équipe 1 */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <img 
                        src={team1?.imageUrl}
                        alt={team1?.teamName}
                        className="w-12 h-12 rounded-full border-2 border-stone-200"
                      />
                      <h4 className="font-bold text-lg">{team1?.teamName}</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-600">Buts marqués</span>
                        <span className="font-bold text-[#C1272D]">{team1?.goals || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-600">Événements</span>
                        <span className="font-bold">
                          {events.filter(e => e.teamID === team1?.teamId).length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Équipe 2 */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <img 
                        src={team2?.imageUrl}
                        alt={team2?.teamName}
                        className="w-12 h-12 rounded-full border-2 border-stone-200"
                      />
                      <h4 className="font-bold text-lg">{team2?.teamName}</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-600">Buts marqués</span>
                        <span className="font-bold text-[#006233]">{team2?.goals || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-600">Événements</span>
                        <span className="font-bold">
                          {events.filter(e => e.teamID === team2?.teamId).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline rapide des événements */}
              {events.length > 0 && (
                <div className="lg:col-span-3 bg-white rounded-2xl border-2 border-stone-200 p-6 animate-fade-in-up delay-200">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-icons text-amber-500">timeline</span>
                    <h3 className="text-lg font-bold text-stone-900">Timeline Rapide</h3>
                  </div>
                  
                  <div className="flex items-center gap-4 overflow-x-auto pb-2">
                    {events.slice(0, 10).map((event, index) => (
                      <div 
                        key={event.id} 
                        className="flex-shrink-0 bg-stone-50 rounded-lg px-4 py-3 border border-stone-200"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getEventIcon(event.additionalInfo)}</span>
                          <div>
                            <div className="text-xs text-stone-500">{event.minute}'</div>
                            <div className="text-sm font-medium text-stone-900">{event.playerName}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lineup Tab */}
          {activeTab === 'lineup' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Équipe 1 */}
              <div className="bg-white rounded-2xl border-2 border-[#C1272D] p-6 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <img 
                    src={team1?.imageUrl}
                    alt={team1?.teamName}
                    className="w-12 h-12 rounded-full border-2 border-stone-200"
                  />
                  <h3 className="text-xl font-bold text-stone-900">{team1?.teamName}</h3>
                </div>

                {/* Titulaires */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-stone-700 uppercase mb-3 flex items-center gap-2">
                    <span className="material-icons text-sm">person</span>
                    Titulaires
                  </h4>
                  <div className="space-y-2">
                    {getStarters(getTeamLineup(team1?.teamId)).map((player, index) => (
                      <div 
                        key={player.id} 
                        className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#C1272D] text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {player.jerseyNumber || index + 1}
                          </div>
                          {player.playerImgUrl && (
                            <img 
                              src={player.playerImgUrl}
                              alt={player.playerName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-stone-200"
                            />
                          )}
                          <div>
                            <div className="font-medium text-stone-900">{player.playerName}</div>
                            <div className="text-xs text-stone-500">{player.position || 'Position N/A'}</div>
                          </div>
                        </div>
                        {player.rating && (
                          <div className="px-3 py-1 bg-[#C1272D] text-white rounded-full text-sm font-bold">
                            {player.rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remplaçants */}
                {getSubstitutes(getTeamLineup(team1?.teamId)).length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-stone-700 uppercase mb-3 flex items-center gap-2">
                      <span className="material-icons text-sm">group_add</span>
                      Remplaçants
                    </h4>
                    <div className="space-y-2">
                      {getSubstitutes(getTeamLineup(team1?.teamId)).map((player, index) => (
                        <div 
                          key={player.id} 
                          className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg opacity-75"
                        >
                          <div className="w-8 h-8 bg-stone-300 text-stone-600 rounded-full flex items-center justify-center font-bold text-sm">
                            {player.jerseyNumber || index + 12}
                          </div>
                          <div>
                            <div className="font-medium text-stone-700">{player.playerName}</div>
                            <div className="text-xs text-stone-500">{player.position || 'Position N/A'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Équipe 2 */}
              <div className="bg-white rounded-2xl border-2 border-[#006233] p-6 animate-fade-in-up delay-100">
                <div className="flex items-center gap-3 mb-6">
                  <img 
                    src={team2?.imageUrl}
                    alt={team2?.teamName}
                    className="w-12 h-12 rounded-full border-2 border-stone-200"
                  />
                  <h3 className="text-xl font-bold text-stone-900">{team2?.teamName}</h3>
                </div>

                {/* Titulaires */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-stone-700 uppercase mb-3 flex items-center gap-2">
                    <span className="material-icons text-sm">person</span>
                    Titulaires
                  </h4>
                  <div className="space-y-2">
                    {getStarters(getTeamLineup(team2?.teamId)).map((player, index) => (
                      <div 
                        key={player.id} 
                        className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#006233] text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {player.jerseyNumber || index + 1}
                          </div>
                          {player.playerImgUrl && (
                            <img 
                              src={player.playerImgUrl}
                              alt={player.playerName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-stone-200"
                            />
                          )}
                          <div>
                            <div className="font-medium text-stone-900">{player.playerName}</div>
                            <div className="text-xs text-stone-500">{player.position || 'Position N/A'}</div>
                          </div>
                        </div>
                        {player.rating && (
                          <div className="px-3 py-1 bg-[#006233] text-white rounded-full text-sm font-bold">
                            {player.rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remplaçants */}
                {getSubstitutes(getTeamLineup(team2?.teamId)).length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-stone-700 uppercase mb-3 flex items-center gap-2">
                      <span className="material-icons text-sm">group_add</span>
                      Remplaçants
                    </h4>
                    <div className="space-y-2">
                      {getSubstitutes(getTeamLineup(team2?.teamId)).map((player, index) => (
                        <div 
                          key={player.id} 
                          className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg opacity-75"
                        >
                          <div className="w-8 h-8 bg-stone-300 text-stone-600 rounded-full flex items-center justify-center font-bold text-sm">
                            {player.jerseyNumber || index + 12}
                          </div>
                          <div>
                            <div className="font-medium text-stone-700">{player.playerName}</div>
                            <div className="text-xs text-stone-500">{player.position || 'Position N/A'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-icons text-amber-500">sports_soccer</span>
                <h3 className="text-xl font-bold text-stone-900">Événements du Match</h3>
                <span className="ml-auto px-3 py-1 bg-amber-500 text-white rounded-full text-sm font-bold">
                  {events.length}
                </span>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-icons text-6xl text-stone-300 mb-4">event_busy</span>
                  <p className="text-stone-500">Aucun événement pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.sort((a, b) => (b.minute || 0) - (a.minute || 0)).map((event, index) => (
                    <div 
                      key={event.id} 
                      className="flex items-start gap-4 p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors animate-fade-in-up"
                      style={{animationDelay: `${index * 0.05}s`}}
                    >
                      {/* Minute */}
                      <div className="flex-shrink-0 w-16 text-center">
                        <div className="text-2xl font-bold text-[#C1272D]">{event.minute}'</div>
                      </div>

                      {/* Icône */}
                      <div className="text-3xl">{getEventIcon(event.additionalInfo)}</div>

                      {/* Détails */}
                      <div className="flex-1">
                        <div className="font-bold text-stone-900 mb-1">{event.playerName}</div>
                        <div className="text-sm text-stone-600 mb-1">{event.teamName}</div>
                        <div className="text-sm text-stone-500 italic">{event.additionalInfo}</div>
                      </div>

                      {/* Badge équipe */}
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full ${
                          event.teamID === team1?.teamId ? 'bg-[#C1272D]' : 'bg-[#006233]'
                        } flex items-center justify-center`}>
                          <span className="material-icons text-white text-sm">sports</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-icons text-stone-500">bar_chart</span>
                <h3 className="text-xl font-bold text-stone-900">Statistiques Détaillées</h3>
              </div>

              <div className="space-y-6">
                {/* Possession simulée - vous pouvez ajouter de vraies stats depuis l'API */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-stone-600">Possession</span>
                    <span className="text-sm font-bold">50% - 50%</span>
                  </div>
                  <div className="h-4 bg-stone-200 rounded-full overflow-hidden flex">
                    <div className="bg-[#C1272D] w-1/2"></div>
                    <div className="bg-[#006233] w-1/2"></div>
                  </div>
                </div>

                {/* Buts */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-stone-600">Buts</span>
                    <span className="text-sm font-bold">{team1?.goals || 0} - {team2?.goals || 0}</span>
                  </div>
                  <div className="h-4 bg-stone-200 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-[#C1272D]" 
                      style={{width: `${((team1?.goals || 0) / Math.max((team1?.goals || 0) + (team2?.goals || 0), 1)) * 100}%`}}
                    ></div>
                    <div 
                      className="bg-[#006233]" 
                      style={{width: `${((team2?.goals || 0) / Math.max((team1?.goals || 0) + (team2?.goals || 0), 1)) * 100}%`}}
                    ></div>
                  </div>
                </div>

                {/* Événements par équipe */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-stone-600">Événements</span>
                    <span className="text-sm font-bold">
                      {events.filter(e => e.teamID === team1?.teamId).length} - {events.filter(e => e.teamID === team2?.teamId).length}
                    </span>
                  </div>
                  <div className="h-4 bg-stone-200 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-[#C1272D]" 
                      style={{width: `${(events.filter(e => e.teamID === team1?.teamId).length / Math.max(events.length, 1)) * 100}%`}}
                    ></div>
                    <div 
                      className="bg-[#006233]" 
                      style={{width: `${(events.filter(e => e.teamID === team2?.teamId).length / Math.max(events.length, 1)) * 100}%`}}
                    ></div>
                  </div>
                </div>

                {/* Note moyenne des joueurs */}
                {lineup.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-stone-600">Note Moyenne</span>
                      <span className="text-sm font-bold">
                        {(getTeamLineup(team1?.teamId).filter(p => p.rating).reduce((sum, p) => sum + p.rating, 0) / 
                          Math.max(getTeamLineup(team1?.teamId).filter(p => p.rating).length, 1)).toFixed(1)} - 
                        {(getTeamLineup(team2?.teamId).filter(p => p.rating).reduce((sum, p) => sum + p.rating, 0) / 
                          Math.max(getTeamLineup(team2?.teamId).filter(p => p.rating).length, 1)).toFixed(1)}
                      </span>
                    </div>
                    <div className="h-4 bg-stone-200 rounded-full overflow-hidden flex">
                      <div className="bg-[#C1272D] w-1/2"></div>
                      <div className="bg-[#006233] w-1/2"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Placeholder pour plus de stats */}
              <div className="mt-8 p-6 bg-stone-50 rounded-lg border-2 border-dashed border-stone-300 text-center">
                <span className="material-icons text-4xl text-stone-400 mb-2">analytics</span>
                <p className="text-stone-600 text-sm">Plus de statistiques seront disponibles bientôt</p>
              </div>
            </div>
          )}

        </div>
      </section>

      <Footer />
    </>
  );
}