import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';

export default function GroupDetails() {
  const router = useRouter();
  const { id } = router.query;

  // États pour stocker les données
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('standings'); // standings, fixtures, stats

  // Récupérer les détails du groupe
  useEffect(() => {
    if (!id) return;

    // Simuler la récupération d'un groupe spécifique
    fetch('http://localhost:3309/api/groups/getOne/' + id)
      .then((res) => res.json())
      .then((data) => {
        const foundGroup = data;
        if (foundGroup) {
          setGroup(foundGroup);
        } else {
          setError('Group not found');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // Générer des matchs simulés pour le groupe
  const generateGroupMatches = () => {
    if (!group || !group.groupTeams) return [];
    
    const teams = group.groupTeams;
    const matches = [];
    let matchId = 1;

    // Générer tous les matchs du groupe (round-robin)
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          id: matchId++,
          homeTeam: teams[i],
          awayTeam: teams[j],
          homeScore: Math.floor(Math.random() * 4),
          awayScore: Math.floor(Math.random() * 4),
          status: 'completed',
          date: new Date(2030, 5, 11 + matchId),
          venue: 'Stadium ' + matchId
        });
      }
    }

    return matches.sort((a, b) => a.date - b.date);
  };

  const matches = group ? generateGroupMatches() : [];

  // Calculer les statistiques détaillées
  const calculateDetailedStats = () => {
    if (!group || !group.groupTeams) return null;

    const stats = {
      totalGoals: 0,
      totalMatches: matches.filter(m => m.status === 'completed').length,
      avgGoalsPerMatch: 0,
      biggestWin: null,
      topScorer: null,
      cleanSheets: 0
    };

    matches.forEach(match => {
      if (match.status === 'completed') {
        stats.totalGoals += match.homeScore + match.awayScore;
        
        const margin = Math.abs(match.homeScore - match.awayScore);
        if (!stats.biggestWin || margin > stats.biggestWin.margin) {
          stats.biggestWin = {
            margin,
            winner: match.homeScore > match.awayScore ? match.homeTeam.teamName : match.awayTeam.teamName,
            score: `${match.homeScore}-${match.awayScore}`
          };
        }

        if (match.homeScore === 0 || match.awayScore === 0) {
          stats.cleanSheets++;
        }
      }
    });

    stats.avgGoalsPerMatch = stats.totalMatches > 0 ? (stats.totalGoals / stats.totalMatches).toFixed(2) : 0;

    return stats;
  };

  const stats = calculateDetailedStats();

  // Affichage du chargement
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
        <img
          src="/images/logo.png"
          alt="Loading"
          className="w-20 h-20 mb-4 animate-pulse"
        />
        <p className="text-stone-600 animate-pulse">Loading group details...</p>
      </div>
    );
  }

  // Affichage des erreurs
  if (error || !group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
        <Navbar />
        <div className="text-center pt-32">
          <span className="material-icons text-6xl text-stone-300 mb-4">error_outline</span>
          <p className="text-xl text-stone-600 mb-4">Group not found</p>
          <button 
            onClick={() => router.push('/groups')}
            className="px-6 py-3 bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  // Déterminer la couleur du groupe
  const groupIndex = parseInt(id) - 1;
  const groupColor = groupIndex % 4 === 0 ? '#C1272D' : 
                     groupIndex % 4 === 1 ? '#006233' : 
                     groupIndex % 4 === 2 ? '#d97706' : '#1e40af';
  
  const groupGradient = groupIndex % 4 === 0 ? 'from-[#C1272D] to-[#a01e23]' :
                        groupIndex % 4 === 1 ? 'from-[#006233] to-[#004d28]' :
                        groupIndex % 4 === 2 ? 'from-[#d97706] to-[#b45309]' :
                        'from-[#1e40af] to-[#1e3a8a]';

  return (
    <>
      <Head>
        <title>{group.name} | MoroccoFan2030</title>
        <meta name="description" content={`${group.name} - World Cup 2030 Group Stage`} />
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

        .bg-moroccan-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C1272D' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        body { font-family: 'Cairo', sans-serif; letter-spacing: 0.01em; }
        h1, h2, h3, h4, .serif-font { font-family: 'Amiri', serif; letter-spacing: 0.02em; }
        .decorative-font { font-family: 'Aref Ruqaa', serif; }

        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-scale { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-pulse-scale { animation: pulse-scale 2s ease-in-out infinite; }

        .tab-indicator {
          position: absolute;
          bottom: 0;
          height: 3px;
          background: ${groupColor};
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 3px 3px 0 0;
        }

        .team-row {
          transition: all 0.2s ease;
        }

        .team-row:hover {
          background: linear-gradient(90deg, rgba(193, 39, 45, 0.05), transparent);
          transform: translateX(4px);
        }

        .match-card {
          transition: all 0.3s ease;
        }

        .match-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .stat-card {
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .vs-badge {
          position: relative;
          z-index: 10;
        }

        .progress-bar {
          transition: width 1s ease-out;
        }
      `}</style>

      <Navbar />

      {/* Hero Section */}
      <header className="relative w-full pt-32 pb-16 overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 border-b-4" style={{borderColor: groupColor}}>
        <div className="absolute inset-0 bg-moroccan-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 animate-slide-up">
            {/* Group Info */}
            <div className="flex items-center gap-6">
              <div 
                className={`w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br ${groupGradient} rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/20`}
              >
                <span className="text-5xl md:text-6xl font-bold text-white decorative-font">
                  {String.fromCharCode(65 + groupIndex)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-xs font-medium uppercase tracking-wider">
                    Group Stage
                  </span>
                  <button 
                    onClick={() => router.push('/Groups')}
                    className="text-white/70 hover:text-white flex items-center gap-1 text-sm"
                  >
                    <span className="material-icons text-sm">arrow_back</span>
                    All Groups
                  </button>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-2 drop-shadow-2xl serif-font">
                  {group.name}
                </h1>
                <p className="text-lg text-stone-300">
                  {group.groupTeams?.length || 0} Teams • {matches.length} Matches
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                <div className="text-3xl font-bold text-white mb-1">{stats?.totalGoals || 0}</div>
                <div className="text-xs text-stone-300 uppercase tracking-wider">Total Goals</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                <div className="text-3xl font-bold text-white mb-1">{stats?.avgGoalsPerMatch || 0}</div>
                <div className="text-xs text-stone-300 uppercase tracking-wider">Avg/Match</div>
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
              { id: 'standings', label: 'Standings', icon: 'leaderboard' },
              { id: 'fixtures', label: 'Fixtures', icon: 'calendar_today' },
              { id: 'stats', label: 'Statistics', icon: 'query_stats' }
            ].map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 px-2 flex items-center gap-2 font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'text-stone-900' 
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  color: activeTab === tab.id ? groupColor : undefined
                }}
              >
                <span className="material-icons text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
            <div 
              className="tab-indicator"
              style={{
                width: '120px',
                left: activeTab === 'standings' ? '0px' : 
                      activeTab === 'fixtures' ? '136px' : '272px',
                backgroundColor: groupColor
              }}
            ></div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="bg-stone-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Standings Tab */}
          {activeTab === 'standings' && (
            <div className="space-y-8 animate-fade-in">
              {/* Main Standings Table */}
              <div className="bg-white rounded-3xl border-2 border-stone-200 shadow-xl overflow-hidden">
                <div className={`bg-gradient-to-r ${groupGradient} p-6 border-b-4 border-white/20`}>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3 serif-font">
                    <span className="material-icons">leaderboard</span>
                    Group Standings
                  </h2>
                </div>

                <div className="p-8 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-stone-500 text-xs border-b-2 border-stone-200">
                        <th className="font-semibold text-left pb-4 pr-4 w-16">POS</th>
                        <th className="font-semibold text-left pb-4 pr-4">TEAM</th>
                        <th className="font-semibold text-center pb-4 px-3 w-16">MP</th>
                        <th className="font-semibold text-center pb-4 px-3 w-16">W</th>
                        <th className="font-semibold text-center pb-4 px-3 w-16">D</th>
                        <th className="font-semibold text-center pb-4 px-3 w-16">L</th>
                        <th className="font-semibold text-center pb-4 px-3 w-16">GF</th>
                        <th className="font-semibold text-center pb-4 px-3 w-16">GA</th>
                        <th className="font-semibold text-center pb-4 px-3 w-16">GD</th>
                        <th className="font-semibold text-right pb-4 pl-4 w-24">PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.groupTeams && group.groupTeams.map((team, index) => {
                        const matchesPlayed = team.wins + team.draws + team.losses;
                        const goalsFor = team.wins * 2 + team.draws;
                        const goalsAgainst = team.losses * 2 + team.draws;
                        const goalDifference = goalsFor - goalsAgainst;
                        const points = (team.wins * 3) + team.draws;
                        const isQualified = index < 2;

                        return (
                          <tr 
                            key={team.id}
                            className={`team-row border-b border-stone-100 cursor-pointer ${
                              isQualified ? 'bg-gradient-to-r from-green-50/30 to-transparent' : ''
                            }`}
                            onClick={() => router.push(`/teams/${team.teamId}`)}
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <td className="py-6 pr-4">
                              <div className="flex items-center gap-3">
                                {isQualified && (
                                  <div className="w-1 h-10 bg-gradient-to-b from-[#006233] to-green-700 rounded-full"></div>
                                )}
                                <div 
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg' :
                                    index === 1 ? 'bg-gradient-to-br from-[#006233] to-green-700 text-white shadow-lg' :
                                    'bg-stone-100 text-stone-600'
                                  }`}
                                >
                                  {index + 1}
                                </div>
                              </div>
                            </td>
                            <td className="py-6 pr-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-stone-200 flex-shrink-0 shadow-md">
                                  <img 
                                    src={team.teamImageUrl}
                                    alt={team.teamName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = `https://via.placeholder.com/48x48/C1272D/FFFFFF?text=${team.teamName.substring(0, 2)}`; }}
                                  />
                                </div>
                                <div>
                                  <div className={`font-bold text-lg ${index === 0 ? 'text-stone-900' : 'text-stone-700'}`}>
                                    {team.teamName}
                                  </div>
                                  {isQualified && (
                                    <div className="text-xs text-[#006233] font-medium flex items-center gap-1 mt-1">
                                      <span className="material-icons" style={{fontSize: '12px'}}>check_circle</span>
                                      {index === 0 ? 'Group Winner' : 'Qualified'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-6 px-3 text-center text-base font-medium text-stone-700">{matchesPlayed}</td>
                            <td className="py-6 px-3 text-center text-base font-bold text-[#006233]">{team.wins}</td>
                            <td className="py-6 px-3 text-center text-base font-medium text-amber-600">{team.draws}</td>
                            <td className="py-6 px-3 text-center text-base font-medium text-[#C1272D]">{team.losses}</td>
                            <td className="py-6 px-3 text-center text-base font-medium text-stone-700">{goalsFor}</td>
                            <td className="py-6 px-3 text-center text-base font-medium text-stone-700">{goalsAgainst}</td>
                            <td className="py-6 px-3 text-center">
                              <span className={`text-base font-bold ${
                                goalDifference > 0 ? 'text-[#006233]' :
                                goalDifference < 0 ? 'text-[#C1272D]' :
                                'text-stone-500'
                              }`}>
                                {goalDifference > 0 ? '+' : ''}{goalDifference}
                              </span>
                            </td>
                            <td className="py-6 pl-4 text-right">
                              <div 
                                className={`inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-bold text-lg ${
                                  index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xl' :
                                  index === 1 ? 'bg-gradient-to-br from-[#006233] to-green-700 text-white shadow-xl' :
                                  'bg-stone-100 text-stone-700'
                                }`}
                              >
                                {points}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div className="border-t-2 border-stone-200 p-6 bg-stone-50">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-400 to-amber-600"></div>
                      <span className="text-stone-600">Group Winner</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-[#006233] to-green-700"></div>
                      <span className="text-stone-600">Runner-up (Qualified)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Comparison Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border-2 border-stone-200 shadow-lg p-6">
                  <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                    <span className="material-icons" style={{color: groupColor}}>sports_soccer</span>
                    Goals Scored
                  </h3>
                  <div className="space-y-4">
                    {group.groupTeams?.map((team, index) => {
                      const goalsFor = team.wins * 2 + team.draws;
                      const maxGoals = Math.max(...group.groupTeams.map(t => t.wins * 2 + t.draws));
                      const percentage = (goalsFor / maxGoals) * 100;

                      return (
                        <div key={team.id}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-stone-200">
                                <img 
                                  src={team.teamImageUrl}
                                  alt={team.teamName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="font-medium text-stone-700">{team.teamName}</span>
                            </div>
                            <span className="font-bold text-lg" style={{color: groupColor}}>{goalsFor}</span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
                            <div 
                              className="progress-bar h-full rounded-full"
                              style={{
                                width: `${percentage}%`,
                                background: `linear-gradient(90deg, ${groupColor}, ${groupColor}dd)`
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-stone-200 shadow-lg p-6">
                  <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                    <span className="material-icons text-[#C1272D]">block</span>
                    Goals Conceded
                  </h3>
                  <div className="space-y-4">
                    {group.groupTeams?.map((team, index) => {
                      const goalsAgainst = team.losses * 2 + team.draws;
                      const maxGoals = Math.max(...group.groupTeams.map(t => t.losses * 2 + t.draws));
                      const percentage = maxGoals > 0 ? (goalsAgainst / maxGoals) * 100 : 0;

                      return (
                        <div key={team.id}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-stone-200">
                                <img 
                                  src={team.teamImageUrl}
                                  alt={team.teamName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="font-medium text-stone-700">{team.teamName}</span>
                            </div>
                            <span className="font-bold text-lg text-[#C1272D]">{goalsAgainst}</span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
                            <div 
                              className="progress-bar h-full rounded-full bg-gradient-to-r from-[#C1272D] to-red-700"
                              style={{width: `${percentage}%`}}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fixtures Tab */}
          {activeTab === 'fixtures' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-stone-900 serif-font">Group Fixtures</h2>
                <div className="text-sm text-stone-500">
                  {matches.filter(m => m.status === 'completed').length} / {matches.length} completed
                </div>
              </div>

              {matches.map((match, index) => (
                <div 
                  key={match.id}
                  className="match-card bg-white rounded-2xl border-2 border-stone-200 shadow-lg overflow-hidden"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          match.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {match.status === 'completed' ? 'Full Time' : 'Upcoming'}
                        </span>
                        <span className="text-sm text-stone-500">
                          {match.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-sm text-stone-500 flex items-center gap-2">
                        <span className="material-icons text-xs">stadium</span>
                        {match.venue}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Home Team */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-stone-200 shadow-md flex-shrink-0">
                          <img 
                            src={match.homeTeam.teamImageUrl}
                            alt={match.homeTeam.teamName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-right flex-1">
                          <div className="font-bold text-xl text-stone-900">{match.homeTeam.teamName}</div>
                          <div className="text-sm text-stone-500">Home</div>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="mx-8 text-center">
                        {match.status === 'completed' ? (
                          <div className="flex items-center gap-6">
                            <div 
                              className={`text-5xl font-bold ${
                                match.homeScore > match.awayScore ? 'text-[#006233]' : 
                                match.homeScore === match.awayScore ? 'text-amber-600' : 
                                'text-stone-400'
                              }`}
                            >
                              {match.homeScore}
                            </div>
                            <div className="vs-badge px-4 py-2 bg-stone-100 rounded-xl">
                              <span className="text-sm font-bold text-stone-500">VS</span>
                            </div>
                            <div 
                              className={`text-5xl font-bold ${
                                match.awayScore > match.homeScore ? 'text-[#006233]' : 
                                match.homeScore === match.awayScore ? 'text-amber-600' : 
                                'text-stone-400'
                              }`}
                            >
                              {match.awayScore}
                            </div>
                          </div>
                        ) : (
                          <div className="vs-badge px-6 py-3 bg-gradient-to-r from-stone-100 to-stone-50 rounded-xl border-2 border-stone-200">
                            <div className="text-2xl font-bold text-stone-700">VS</div>
                            <div className="text-xs text-stone-500 mt-1">
                              {match.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-left flex-1">
                          <div className="font-bold text-xl text-stone-900">{match.awayTeam.teamName}</div>
                          <div className="text-sm text-stone-500">Away</div>
                        </div>
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-stone-200 shadow-md flex-shrink-0">
                          <img 
                            src={match.awayTeam.teamImageUrl}
                            alt={match.awayTeam.teamName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Match Result Badge */}
                    {match.status === 'completed' && (
                      <div className="mt-6 pt-6 border-t border-stone-100 text-center">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                          match.homeScore > match.awayScore ? 'bg-gradient-to-r from-[#006233] to-green-700 text-white' :
                          match.awayScore > match.homeScore ? 'bg-gradient-to-r from-[#006233] to-green-700 text-white' :
                          'bg-gradient-to-r from-amber-400 to-amber-600 text-white'
                        }`}>
                          {match.homeScore > match.awayScore ? `${match.homeTeam.teamName} Wins` :
                           match.awayScore > match.homeScore ? `${match.awayTeam.teamName} Wins` :
                           'Draw'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-8 animate-fade-in">
              {/* Group Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="stat-card bg-gradient-to-br from-[#006233] to-green-700 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="material-icons text-white/70 text-3xl">sports_soccer</span>
                  </div>
                  <div className="text-4xl font-bold mb-1">{stats?.totalGoals || 0}</div>
                  <div className="text-sm text-white/80 uppercase tracking-wider">Total Goals</div>
                </div>

                <div className="stat-card bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="material-icons text-white/70 text-3xl">calculate</span>
                  </div>
                  <div className="text-4xl font-bold mb-1">{stats?.avgGoalsPerMatch || 0}</div>
                  <div className="text-sm text-white/80 uppercase tracking-wider">Avg Goals/Match</div>
                </div>

                <div className="stat-card bg-gradient-to-br from-[#C1272D] to-red-700 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="material-icons text-white/70 text-3xl">block</span>
                  </div>
                  <div className="text-4xl font-bold mb-1">{stats?.cleanSheets || 0}</div>
                  <div className="text-sm text-white/80 uppercase tracking-wider">Clean Sheets</div>
                </div>

                <div className="stat-card bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="material-icons text-white/70 text-3xl">event</span>
                  </div>
                  <div className="text-4xl font-bold mb-1">{matches.length}</div>
                  <div className="text-sm text-white/80 uppercase tracking-wider">Total Matches</div>
                </div>
              </div>

              {/* Biggest Win */}
              {stats?.biggestWin && (
                <div className="bg-white rounded-2xl border-2 border-stone-200 shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-3 serif-font">
                    <span className="material-icons text-amber-500">emoji_events</span>
                    Biggest Win
                  </h3>
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                        <span className="material-icons text-white text-3xl">military_tech</span>
                      </div>
                      <div className="font-bold text-xl text-stone-900">{stats.biggestWin.winner}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-6xl font-bold text-[#006233]">{stats.biggestWin.score}</div>
                      <div className="text-sm text-stone-500 mt-2">Victory Margin: {stats.biggestWin.margin} goals</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Team Form */}
              <div className="bg-white rounded-2xl border-2 border-stone-200 shadow-lg p-8">
                <h3 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-3 serif-font">
                  <span className="material-icons" style={{color: groupColor}}>trending_up</span>
                  Team Performance
                </h3>
                <div className="space-y-6">
                  {group.groupTeams?.map((team, index) => {
                    const totalMatches = team.wins + team.draws + team.losses;
                    const winRate = totalMatches > 0 ? ((team.wins / totalMatches) * 100).toFixed(0) : 0;

                    return (
                      <div key={team.id} className="flex items-center gap-6">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-stone-200">
                            <img 
                              src={team.teamImageUrl}
                              alt={team.teamName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-stone-900 mb-1">{team.teamName}</div>
                            <div className="flex gap-2">
                              {[...Array(team.wins)].map((_, i) => (
                                <div key={`w-${i}`} className="w-6 h-6 rounded bg-[#006233] flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">W</span>
                                </div>
                              ))}
                              {[...Array(team.draws)].map((_, i) => (
                                <div key={`d-${i}`} className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">D</span>
                                </div>
                              ))}
                              {[...Array(team.losses)].map((_, i) => (
                                <div key={`l-${i}`} className="w-6 h-6 rounded bg-[#C1272D] flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">L</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold" style={{color: groupColor}}>{winRate}%</div>
                          <div className="text-xs text-stone-500">Win Rate</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#1a1412] via-[#2d1e1a] to-[#1a1412] text-stone-300 pt-16 pb-8 border-t-4" style={{borderColor: groupColor}}>
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
                <li><a href="/groups" className="text-stone-400 hover:text-[#006233] transition-colors">All Groups</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-full border-2 border-stone-700 flex items-center justify-center hover:border-[#C1272D] hover:bg-[#C1272D]/10 hover:text-[#C1272D] transition-all">
                  <span className="material-icons text-sm">photo_camera</span>
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