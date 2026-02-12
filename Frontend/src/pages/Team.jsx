import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';

export default function TeamDetails() {
  const router = useRouter();
  const { id } = router.query;

  // État pour stocker les données de l'équipe
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, players, news, matches, culture

  // Récupérer les détails de l'équipe
  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:3309/api/teams/getOne/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Team not found');
        return res.json();
      })
      .then((data) => {
        setTeam(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // Calculer les statistiques de l'équipe
  const getTeamStats = () => {
    if (!team || !team.matches) return { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };

    let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;

    team.matches.forEach(match => {
      if (match.status === 'completed') {
        goalsFor += match.goals;
        goalsAgainst += match.opponentGoals;

        if (match.goals > match.opponentGoals) wins++;
        else if (match.goals === match.opponentGoals) draws++;
        else losses++;
      }
    });

    return { wins, draws, losses, goalsFor, goalsAgainst };
  };

  const stats = getTeamStats();

  // Affichage du chargement
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
        <img
          src="/images/logo.png"
          alt="Loading"
          className="w-20 h-20 mb-4 animate-pulse"
        />
        <p className="text-stone-600 animate-pulse">Loading team details...</p>
      </div>
    );
  }

  // Affichage des erreurs
  if (error || !team) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
        <Navbar />
        <div className="text-center pt-32">
          <span className="material-icons text-6xl text-stone-300 mb-4">error_outline</span>
          <p className="text-xl text-stone-600 mb-4">Team not found</p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{team.name} | MoroccoFan2030</title>
        <meta name="description" content={`${team.name} - ${team.description}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        .bg-pattern {
          background-color: #fafaf9;
          background-image: radial-gradient(#e7e5e4 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .glass {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        body { font-family: 'Cairo', sans-serif; letter-spacing: 0.01em; }
        h1, h2, h3, h4, .serif-font { font-family: 'Amiri', serif; letter-spacing: 0.02em; }
        .decorative-font { font-family: 'Aref Ruqaa', serif; }

        .bg-morocco-red { background: linear-gradient(135deg, #C1272D 0%, #a01e23 100%); }
        .bg-morocco-green { background: linear-gradient(135deg, #006233 0%, #004d28 100%); }

        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-left { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-slide-in-left { animation: slide-in-left 0.6s ease-out; }
        .animate-scale-in { animation: scale-in 0.6s ease-out; }
        .animate-shimmer { animation: shimmer 2s infinite linear; }

        .tab-indicator {
          position: absolute;
          bottom: 0;
          height: 3px;
          background: linear-gradient(90deg, #C1272D, #006233);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .player-card:hover .player-overlay {
          opacity: 1;
        }

        .match-card {
          transition: all 0.3s ease;
        }

        .match-card:hover {
          transform: translateY(-4px);
        }
      `}</style>

      <Navbar />

      {/* Hero Section with Team Banner */}
      <header className="relative w-full pt-32 pb-20 overflow-hidden border-b-2 border-[#C1272D]">
        <div className="absolute inset-0 w-full h-full z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900"></div>
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url(${team.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(8px) brightness(0.5)'
          }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 animate-slide-up">
            {/* Team Logo */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C1272D] to-[#006233] rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-40 h-40 md:w-48 md:h-48 bg-white rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden ring-4 ring-white/20">
                <img 
                  src={team.imageUrl}
                  alt={team.name}
                  className="w-32 h-32 md:w-40 md:h-40 object-contain"
                  onError={(e) => { e.target.src = `https://via.placeholder.com/160x160/C1272D/FFFFFF?text=${team.name.substring(0, 2)}`; }}
                />
              </div>
            </div>

            {/* Team Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                <span className="px-4 py-1.5 bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                  {team.country}
                </span>
                <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-xs font-medium">
                  {team.participation} World Cup Participations
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4 drop-shadow-2xl serif-font">
                {team.name}
              </h1>
              
              <p className="text-lg md:text-xl text-stone-300 max-w-3xl mb-6 leading-relaxed">
                {team.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start">
                <div className="flex items-center gap-2 text-white">
                  <span className="material-icons text-amber-400">sports_soccer</span>
                  <span className="text-sm">Coach: <span className="font-semibold">{team.coach}</span></span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span className="material-icons text-[#006233]">groups</span>
                  <span className="text-sm">{team.players?.length || 0} Players</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span className="material-icons text-[#C1272D]">article</span>
                  <span className="text-sm">{team.news?.length || 0} News Articles</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              <div className="text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6">
                <div className="text-3xl md:text-4xl font-bold text-[#006233] mb-1">{stats.wins}</div>
                <div className="text-xs text-stone-300 uppercase tracking-wider">Wins</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6">
                <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-1">{stats.draws}</div>
                <div className="text-xs text-stone-300 uppercase tracking-wider">Draws</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6">
                <div className="text-3xl md:text-4xl font-bold text-[#C1272D] mb-1">{stats.losses}</div>
                <div className="text-xs text-stone-300 uppercase tracking-wider">Losses</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <section className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative flex items-center gap-8 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview', icon: 'dashboard' },
              { id: 'players', label: 'Squad', icon: 'groups' },
              { id: 'matches', label: 'Fixtures', icon: 'calendar_today' },
              { id: 'news', label: 'News', icon: 'article' },
              { id: 'culture', label: 'Culture', icon: 'public' }
            ].map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 px-2 flex items-center gap-2 font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'text-[#C1272D]' 
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="material-icons text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
            <div 
              className="tab-indicator"
              style={{
                width: '80px',
                left: activeTab === 'overview' ? '0px' : 
                      activeTab === 'players' ? '120px' :
                      activeTab === 'matches' ? '240px' :
                      activeTab === 'news' ? '360px' : '480px'
              }}
            ></div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="bg-stone-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Performance Stats */}
              <section className="bg-white rounded-2xl border-2 border-stone-200 p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-3 serif-font">
                  <span className="w-1.5 h-8 bg-gradient-to-b from-[#C1272D] to-[#006233] rounded-full"></span>
                  Performance Overview
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100">
                    <div className="text-4xl font-bold text-[#006233] mb-2">{stats.goalsFor}</div>
                    <div className="text-sm text-stone-600">Goals For</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-100">
                    <div className="text-4xl font-bold text-[#C1272D] mb-2">{stats.goalsAgainst}</div>
                    <div className="text-sm text-stone-600">Goals Against</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-100">
                    <div className="text-4xl font-bold text-amber-600 mb-2">
                      {stats.goalsFor - stats.goalsAgainst > 0 ? '+' : ''}{stats.goalsFor - stats.goalsAgainst}
                    </div>
                    <div className="text-sm text-stone-600">Goal Difference</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {team.matches?.length || 0}
                    </div>
                    <div className="text-sm text-stone-600">Matches Played</div>
                  </div>
                </div>
              </section>

              {/* Recent Form */}
              {team.matches && team.matches.length > 0 && (
                <section className="bg-white rounded-2xl border-2 border-stone-200 p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-3 serif-font">
                    <span className="w-1.5 h-8 bg-gradient-to-b from-[#C1272D] to-[#006233] rounded-full"></span>
                    Recent Form
                  </h2>
                  <div className="flex gap-3 items-center">
                    <span className="text-sm text-stone-600 font-medium">Last 5:</span>
                    {team.matches
                      .filter(m => m.status === 'completed')
                      .slice(-5)
                      .reverse()
                      .map((match, index) => {
                        const result = match.goals > match.opponentGoals ? 'W' : match.goals === match.opponentGoals ? 'D' : 'L';
                        const color = result === 'W' ? 'from-[#006233] to-green-600' : result === 'D' ? 'from-amber-500 to-amber-600' : 'from-[#C1272D] to-red-600';
                        return (
                          <div
                            key={index}
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} text-white flex items-center justify-center font-bold text-sm shadow-lg`}
                            title={`${match.opponentName} ${match.goals}-${match.opponentGoals}`}
                          >
                            {result}
                          </div>
                        );
                      })}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Players Tab */}
          {activeTab === 'players' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-stone-900 serif-font">Team Squad</h2>
                <span className="text-sm text-stone-500">{team.players?.length || 0} players</span>
              </div>

              {team.players && team.players.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {team.players.map((player, index) => (
                    <div 
                      key={player.id} 
                      className="player-card group bg-white rounded-2xl border-2 border-stone-200 overflow-hidden hover:border-[#C1272D] hover:shadow-2xl transition-all duration-300 cursor-pointer"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-stone-100 to-stone-50">
                        <img 
                          src={player.imgUrl}
                          alt={player.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => { e.target.src = `https://via.placeholder.com/300x400/C1272D/FFFFFF?text=${player.name.substring(0, 2)}`; }}
                        />
                        <div className="player-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-300 flex items-end p-6">
                          <div className="text-white">
                            <div className="text-sm uppercase tracking-wider mb-1">Stats</div>
                            <div className="flex gap-4 text-sm">
                              <span>⚽ {player.goals} goals</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-[#C1272D] transition-colors">
                          {player.name}
                        </h3>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="text-center p-3 bg-stone-50 rounded-lg">
                            <div className="font-bold text-stone-900">{player.age}</div>
                            <div className="text-xs text-stone-500">Age</div>
                          </div>
                          <div className="text-center p-3 bg-stone-50 rounded-lg">
                            <div className="font-bold text-stone-900">{player.height}m</div>
                            <div className="text-xs text-stone-500">Height</div>
                          </div>
                          <div className="text-center p-3 bg-stone-50 rounded-lg">
                            <div className="font-bold text-stone-900">{player.weight}kg</div>
                            <div className="text-xs text-stone-500">Weight</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-stone-200">
                  <span className="material-icons text-6xl text-stone-300 mb-4">groups</span>
                  <p className="text-stone-500">No players available</p>
                </div>
              )}
            </div>
          )}

          {/* Matches Tab */}
          {activeTab === 'matches' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-stone-900 serif-font">Match Fixtures</h2>
              </div>

              {team.matches && team.matches.length > 0 ? (
                <div className="space-y-4">
                  {team.matches.map((match, index) => {
                    const isCompleted = match.status === 'completed';
                    const isWin = isCompleted && match.goals > match.opponentGoals;
                    const isDraw = isCompleted && match.goals === match.opponentGoals;
                    const isLoss = isCompleted && match.goals < match.opponentGoals;

                    return (
                      <div 
                        key={match.id}
                        className={`match-card bg-white rounded-2xl border-2 p-6 shadow-sm ${
                          isWin ? 'border-[#006233] bg-gradient-to-r from-green-50/50 to-white' :
                          isDraw ? 'border-amber-400 bg-gradient-to-r from-amber-50/50 to-white' :
                          isLoss ? 'border-[#C1272D] bg-gradient-to-r from-red-50/50 to-white' :
                          'border-stone-200'
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6 flex-1">
                            {/* Team Info */}
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center overflow-hidden border-2 border-stone-200">
                                <img 
                                  src={team.imageUrl}
                                  alt={team.name}
                                  className="w-12 h-12 object-contain"
                                />
                              </div>
                              <div>
                                <div className="font-bold text-stone-900">{team.name}</div>
                                <div className="text-sm text-stone-500">{match.type}</div>
                              </div>
                            </div>

                            {/* Score */}
                            <div className="text-center px-8">
                              {isCompleted ? (
                                <div className="flex items-center gap-4">
                                  <div className="text-3xl font-bold text-stone-900">{match.goals}</div>
                                  <div className="text-2xl text-stone-400">-</div>
                                  <div className="text-3xl font-bold text-stone-900">{match.opponentGoals}</div>
                                </div>
                              ) : (
                                <div className="text-sm font-medium text-stone-500 uppercase tracking-wider">
                                  {new Date(match.dateOfMatch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              )}
                            </div>

                            {/* Opponent Info */}
                            <div className="flex items-center gap-4 flex-1 justify-end">
                              <div className="text-right">
                                <div className="font-bold text-stone-900">{match.opponentName}</div>
                                <div className="text-sm text-stone-500">Away</div>
                              </div>
                              <div className="w-14 h-14 bg-stone-100 rounded-full shadow-md flex items-center justify-center text-2xl">
                                🏴
                              </div>
                            </div>
                          </div>

                          {/* Match Details */}
                          <div className="ml-8 text-right">
                            <div className="flex items-center gap-2 text-sm text-stone-500 justify-end">
                              <span className="material-icons text-xs">calendar_today</span>
                              <span>{new Date(match.dateOfMatch).toLocaleDateString()}</span>
                            </div>
                            {match.referee && (
                              <div className="flex items-center gap-2 text-sm text-stone-500 mt-1 justify-end">
                                <span className="material-icons text-xs">sports</span>
                                <span>{match.referee}</span>
                              </div>
                            )}
                            {isCompleted && (
                              <div className="mt-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  isWin ? 'bg-[#006233] text-white' :
                                  isDraw ? 'bg-amber-500 text-white' :
                                  'bg-[#C1272D] text-white'
                                }`}>
                                  {isWin ? 'WIN' : isDraw ? 'DRAW' : 'LOSS'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-stone-200">
                  <span className="material-icons text-6xl text-stone-300 mb-4">event</span>
                  <p className="text-stone-500">No matches scheduled</p>
                </div>
              )}
            </div>
          )}

          {/* News Tab */}
          {activeTab === 'news' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-stone-900 serif-font">Latest News</h2>
                <span className="text-sm text-stone-500">{team.news?.length || 0} articles</span>
              </div>

              {team.news && team.news.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {team.news.map((article, index) => (
                    <article 
                      key={article.id}
                      className="group bg-white rounded-2xl border-2 border-stone-200 overflow-hidden hover:border-[#C1272D] hover:shadow-2xl transition-all duration-300 cursor-pointer"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="relative h-56 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                        <img 
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2070&auto=format&fit=crop'; }}
                        />
                        <div className="absolute top-4 left-4 z-20">
                          <span className="px-3 py-1 bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                            News
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 text-xs text-stone-400 mb-3">
                          <span>{new Date(article.dateOfCreation).toLocaleDateString()}</span>
                          <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                          <span>4 min read</span>
                        </div>
                        <h3 className="text-xl font-bold text-stone-900 mb-3 group-hover:text-[#C1272D] transition-colors leading-tight">
                          {article.title}
                        </h3>
                        <p className="text-stone-600 mb-4 line-clamp-2">
                          {article.description}
                        </p>
                        <button className="text-[#C1272D] text-sm font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                          Read More
                          <span className="material-icons text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-stone-200">
                  <span className="material-icons text-6xl text-stone-300 mb-4">article</span>
                  <p className="text-stone-500">No news available</p>
                </div>
              )}
            </div>
          )}

          {/* Culture Tab */}
          {activeTab === 'culture' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-stone-900 serif-font">Cultural Heritage</h2>
                <span className="text-sm text-stone-500">{team.cultures?.length || 0} highlights</span>
              </div>

              {team.cultures && team.cultures.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {team.cultures.map((culture, index) => (
                    <div 
                      key={culture.id}
                      className="group bg-white rounded-2xl border-2 border-stone-200 overflow-hidden hover:border-[#006233] hover:shadow-2xl transition-all duration-300 cursor-pointer"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="relative h-64 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                        <img 
                          src={culture.imageUrl}
                          alt={culture.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535069502363-2207185df19f?q=80&w=2070&auto=format&fit=crop'; }}
                        />
                        <div className="absolute bottom-4 left-4 z-20">
                          <h3 className="text-2xl font-bold text-white decorative-font">
                            {culture.title}
                          </h3>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-stone-600 leading-relaxed">
                          {culture.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-stone-200">
                  <span className="material-icons text-6xl text-stone-300 mb-4">public</span>
                  <p className="text-stone-500">No cultural content available</p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#1a1412] via-[#2d1e1a] to-[#1a1412] text-stone-300 pt-16 pb-8 border-t-4 border-[#C1272D]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div>
              <a href="/" className="flex items-center gap-2 mb-4 text-white group">
                <img 
                  src="/images/logo.png" 
                  alt="MoroccoFan2030 Logo" 
                  className="w-10 h-10 object-contain"
                />
                <span className="font-bold tracking-tight uppercase">MoroccoFan2030</span>
              </a>
              <p className="text-sm leading-relaxed text-stone-400">
                Celebrating the spirit of football in the heart of the Maghreb.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="text-stone-400 hover:text-[#C1272D] transition-colors">Home</a></li>
                <li><a href="#" className="text-stone-400 hover:text-[#006233] transition-colors">Teams</a></li>
                <li><a href="#" className="text-stone-400 hover:text-[#C1272D] transition-colors">Matches</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-full border-2 border-stone-700 flex items-center justify-center hover:border-[#C1272D] hover:bg-[#C1272D]/10 hover:text-[#C1272D] transition-all">
                  <span className="material-icons text-sm">photo_camera</span>
                </a>
                <a href="#" className="w-9 h-9 rounded-full border-2 border-stone-700 flex items-center justify-center hover:border-[#006233] hover:bg-[#006233]/10 hover:text-[#006233] transition-all">
                  <span className="material-icons text-sm">chat</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-700/50 pt-6 text-center text-xs text-stone-400">
            <p>© 2024 MoroccoFan2030. Unofficial Fan Concept.</p>
          </div>
        </div>
      </footer>
    </>
  );
}