import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';

export default function Groups() {
  const router = useRouter();

  // États pour stocker les données
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('groups'); // groups, standings, knockout

  // Récupérer les groupes
  useEffect(() => {
    fetch('http://localhost:3309/api/groups/getAll')
      .then((res) => res.json())
      .then((data) => {
        setGroups(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Affichage du chargement
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
        <img
          src="/images/logo.png"
          alt="Loading"
          className="w-20 h-20 mb-4 animate-pulse"
        />
        <p className="text-stone-600 animate-pulse">Loading tournament groups...</p>
      </div>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
        <Navbar />
        <div className="text-center pt-32">
          <span className="material-icons text-6xl text-stone-300 mb-4">error_outline</span>
          <p className="text-xl text-stone-600 mb-4">Failed to load groups</p>
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
        <title>Tournament Groups | MoroccoFan2030</title>
        <meta name="description" content="World Cup 2030 Tournament Groups and Standings" />
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

        .bg-morocco-red { background: linear-gradient(135deg, #C1272D 0%, #a01e23 100%); }
        .bg-morocco-green { background: linear-gradient(135deg, #006233 0%, #004d28 100%); }

        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-left { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(193, 39, 45, 0.2); } 50% { box-shadow: 0 0 40px rgba(193, 39, 45, 0.4); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-slide-in-left { animation: slide-in-left 0.6s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.6s ease-out; }
        .animate-scale-in { animation: scale-in 0.6s ease-out; }
        .animate-pulse-glow { animation: pulse-glow 2s infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }

        .group-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .group-card:hover {
          transform: translateY(-8px);
        }

        .team-row {
          transition: all 0.2s ease;
        }

        .team-row:hover {
          background: linear-gradient(90deg, rgba(193, 39, 45, 0.05), transparent);
        }

        .qualification-badge {
          position: relative;
          overflow: hidden;
        }

        .qualification-badge::before {
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

        .knockout-bracket {
          position: relative;
        }

        .bracket-line {
          stroke: #e7e5e4;
          stroke-width: 2;
          fill: none;
        }

        .bracket-line.active {
          stroke: #C1272D;
          stroke-width: 3;
          animation: dash 1s linear forwards;
        }

        @keyframes dash {
          from { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
          to { stroke-dasharray: 1000; stroke-dashoffset: 0; }
        }

        .trophy-shine {
          animation: shine 2s ease-in-out infinite;
        }

        @keyframes shine {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>

      <Navbar />

      {/* Hero Section */}
      <header className="relative w-full pt-32 pb-16 overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 border-b-4 border-[#C1272D]">
        <div className="absolute inset-0 bg-moroccan-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center animate-slide-up">
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <span className="material-icons text-amber-400">emoji_events</span>
              <span className="text-white font-medium tracking-wider uppercase text-sm">World Cup 2030</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4 drop-shadow-2xl serif-font">
              Tournament <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C1272D] to-amber-400">Groups</span>
            </h1>
            
            <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Follow the journey from group stage to glory. {groups.length} groups battling for the ultimate prize.
            </p>

            {/* View Mode Selector */}
            <div className="inline-flex bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 gap-2">
              <button
                onClick={() => setViewMode('groups')}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  viewMode === 'groups' 
                    ? 'bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="material-icons text-sm">view_module</span>
                <span>Groups</span>
              </button>
              <button
                onClick={() => setViewMode('standings')}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  viewMode === 'standings' 
                    ? 'bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="material-icons text-sm">leaderboard</span>
                <span>Standings</span>
              </button>
              <button
                onClick={() => setViewMode('knockout')}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  viewMode === 'knockout' 
                    ? 'bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="material-icons text-sm">account_tree</span>
                <span>Knockout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Trophy Animation */}
        <div className="absolute bottom-4 right-8 opacity-10 animate-float hidden lg:block">
          <span className="material-icons text-white" style={{fontSize: '120px'}}>emoji_events</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-stone-50 min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Groups Grid View */}
          {viewMode === 'groups' && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {groups.map((group, groupIndex) => (
                  <div 
                    key={group.id} 
                    className="group-card bg-white rounded-3xl border-3 shadow-xl overflow-hidden hover:shadow-2xl"
                    style={{ 
                      animationDelay: `${groupIndex * 0.1}s`,
                      borderColor: groupIndex % 4 === 0 ? '#C1272D' : 
                                   groupIndex % 4 === 1 ? '#006233' : 
                                   groupIndex % 4 === 2 ? '#d97706' : '#1e40af'
                    }}
                  >
                    {/* Group Header */}
                    <div 
                      className="relative p-6 text-white overflow-hidden"
                      style={{
                        background: groupIndex % 4 === 0 ? 'linear-gradient(135deg, #C1272D 0%, #a01e23 100%)' :
                                   groupIndex % 4 === 1 ? 'linear-gradient(135deg, #006233 0%, #004d28 100%)' :
                                   groupIndex % 4 === 2 ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' :
                                   'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)'
                      }}
                    >
                      <div className="absolute inset-0 bg-moroccan-pattern opacity-10"></div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div>
                          <h2 className="text-3xl font-bold decorative-font mb-1">{group.name}</h2>
                          <p className="text-sm text-white/80">Group Stage</p>
                        </div>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                          <span className="text-2xl font-bold">{String.fromCharCode(65 + groupIndex)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Teams List */}
                    <div className="p-6">
                      <table className="w-full">
                        <thead>
                          <tr className="text-stone-400 text-xs border-b-2 border-stone-100">
                            <th className="font-semibold text-left pb-3 pr-2 w-8">#</th>
                            <th className="font-semibold text-left pb-3">Team</th>
                            <th className="font-semibold text-center pb-3 w-12">P</th>
                            <th className="font-semibold text-right pb-3 w-12">Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.groupTeams && group.groupTeams.map((team, index) => {
                            const points = (team.wins * 3) + team.draws;
                            const isQualified = index < 2;
                            
                            return (
                              <tr 
                                key={team.id} 
                                className={`team-row border-b border-stone-50 cursor-pointer ${
                                  isQualified ? 'bg-gradient-to-r from-green-50/50 to-transparent' : ''
                                }`}
                                onClick={() => router.push(`/teams/${team.teamId}`)}
                              >
                                <td className="py-4 pr-2">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                                    index === 1 ? 'bg-gradient-to-br from-stone-300 to-stone-400 text-white' :
                                    'bg-stone-100 text-stone-600'
                                  }`}>
                                    {index + 1}
                                  </div>
                                </td>
                                <td className="py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white border-2 border-stone-200 flex-shrink-0 shadow-sm">
                                      <img 
                                        src={team.teamImageUrl}
                                        alt={team.teamName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = `https://via.placeholder.com/32x32/C1272D/FFFFFF?text=${team.teamName.substring(0, 2)}`; }}
                                      />
                                    </div>
                                    <span className={`text-sm font-medium truncate ${
                                      index === 0 ? 'text-stone-900 font-bold' : 'text-stone-700'
                                    }`}>
                                      {team.teamName}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 text-center text-sm text-stone-600">
                                  {team.wins + team.draws + team.losses}
                                </td>
                                <td className="py-4 text-right">
                                  <div className={`inline-flex items-center justify-center px-2 py-1 rounded-lg font-bold text-sm ${
                                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                                    index === 1 ? 'bg-gradient-to-br from-[#006233] to-green-700 text-white' :
                                    'bg-stone-100 text-stone-700'
                                  }`}>
                                    {points}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Qualification Info */}
                      <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#006233] to-green-700"></div>
                          <span className="text-stone-500">Qualifies</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-12 bg-white rounded-2xl border-2 border-stone-200 p-8 shadow-lg">
                <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2 serif-font">
                  <span className="material-icons text-[#C1272D]">info</span>
                  Tournament Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                      <span className="material-icons text-white text-sm">emoji_events</span>
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 mb-1">Group Winners</div>
                      <p className="text-sm text-stone-600">Top team from each group advances to Round of 16</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#006233] to-green-700 flex items-center justify-center flex-shrink-0">
                      <span className="material-icons text-white text-sm">arrow_upward</span>
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 mb-1">Runners-Up</div>
                      <p className="text-sm text-stone-600">Second place teams also qualify for knockout stage</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-400 to-stone-500 flex items-center justify-center flex-shrink-0">
                      <span className="material-icons text-white text-sm">calculate</span>
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 mb-1">Points System</div>
                      <p className="text-sm text-stone-600">Win: 3 points • Draw: 1 point • Loss: 0 points</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Standings View */}
          {viewMode === 'standings' && (
            <div className="animate-fade-in">
              <div className="space-y-8">
                {groups.map((group, groupIndex) => (
                  <div 
                    key={group.id}
                    className="bg-white rounded-3xl border-2 border-stone-200 shadow-xl overflow-hidden"
                    style={{ animationDelay: `${groupIndex * 0.1}s` }}
                  >
                    {/* Group Header */}
                    <div className="bg-gradient-to-r from-stone-900 to-stone-800 p-6 border-b-4 border-[#C1272D]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/20">
                            <span className="text-3xl font-bold text-white decorative-font">{String.fromCharCode(65 + groupIndex)}</span>
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-white serif-font">{group.name}</h2>
                            <p className="text-stone-400 text-sm">Group Stage Standings</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-white">{group.groupTeams?.length || 0}</div>
                          <div className="text-stone-400 text-sm">Teams</div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Table */}
                    <div className="p-6 overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-stone-500 text-xs border-b-2 border-stone-200">
                            <th className="font-semibold text-left pb-4 pr-4 w-12">POS</th>
                            <th className="font-semibold text-left pb-4 pr-4">TEAM</th>
                            <th className="font-semibold text-center pb-4 px-3 w-16">MP</th>
                            <th className="font-semibold text-center pb-4 px-3 w-16">W</th>
                            <th className="font-semibold text-center pb-4 px-3 w-16">D</th>
                            <th className="font-semibold text-center pb-4 px-3 w-16">L</th>
                            <th className="font-semibold text-center pb-4 px-3 w-16">GF</th>
                            <th className="font-semibold text-center pb-4 px-3 w-16">GA</th>
                            <th className="font-semibold text-center pb-4 px-3 w-16">GD</th>
                            <th className="font-semibold text-right pb-4 pl-4 w-20">PTS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.groupTeams && group.groupTeams.map((team, index) => {
                            const matchesPlayed = team.wins + team.draws + team.losses;
                            const goalsFor = team.wins * 2 + team.draws; // Simplified
                            const goalsAgainst = team.losses * 2 + team.draws; // Simplified
                            const goalDifference = goalsFor - goalsAgainst;
                            const points = (team.wins * 3) + team.draws;
                            const isQualified = index < 2;

                            return (
                              <tr 
                                key={team.id}
                                className={`team-row border-b border-stone-100 cursor-pointer hover:bg-stone-50 ${
                                  isQualified ? 'bg-gradient-to-r from-green-50/30 to-transparent' : ''
                                }`}
                                onClick={() => router.push(`/teams/${team.teamId}`)}
                              >
                                <td className="py-5 pr-4">
                                  <div className="flex items-center gap-2">
                                    {isQualified && (
                                      <div className="w-1 h-8 bg-gradient-to-b from-[#006233] to-green-700 rounded-full mr-2"></div>
                                    )}
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                                      index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg' :
                                      index === 1 ? 'bg-gradient-to-br from-[#006233] to-green-700 text-white shadow-lg' :
                                      'bg-stone-100 text-stone-600'
                                    }`}>
                                      {index + 1}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-5 pr-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white border-2 border-stone-200 flex-shrink-0 shadow-md">
                                      <img 
                                        src={team.teamImageUrl}
                                        alt={team.teamName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = `https://via.placeholder.com/40x40/C1272D/FFFFFF?text=${team.teamName.substring(0, 2)}`; }}
                                      />
                                    </div>
                                    <div>
                                      <div className={`font-bold ${index === 0 ? 'text-stone-900' : 'text-stone-700'}`}>
                                        {team.teamName}
                                      </div>
                                      {isQualified && (
                                        <div className="text-xs text-[#006233] font-medium flex items-center gap-1 mt-0.5">
                                          <span className="material-icons" style={{fontSize: '12px'}}>check_circle</span>
                                          Qualified
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-5 px-3 text-center text-sm font-medium text-stone-700">{matchesPlayed}</td>
                                <td className="py-5 px-3 text-center text-sm font-bold text-[#006233]">{team.wins}</td>
                                <td className="py-5 px-3 text-center text-sm font-medium text-amber-600">{team.draws}</td>
                                <td className="py-5 px-3 text-center text-sm font-medium text-[#C1272D]">{team.losses}</td>
                                <td className="py-5 px-3 text-center text-sm font-medium text-stone-700">{goalsFor}</td>
                                <td className="py-5 px-3 text-center text-sm font-medium text-stone-700">{goalsAgainst}</td>
                                <td className="py-5 px-3 text-center">
                                  <span className={`text-sm font-bold ${
                                    goalDifference > 0 ? 'text-[#006233]' :
                                    goalDifference < 0 ? 'text-[#C1272D]' :
                                    'text-stone-500'
                                  }`}>
                                    {goalDifference > 0 ? '+' : ''}{goalDifference}
                                  </span>
                                </td>
                                <td className="py-5 pl-4 text-right">
                                  <div className={`inline-flex items-center justify-center px-4 py-2 rounded-xl font-bold text-base ${
                                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg animate-pulse-glow' :
                                    index === 1 ? 'bg-gradient-to-br from-[#006233] to-green-700 text-white shadow-lg' :
                                    'bg-stone-100 text-stone-700'
                                  }`}>
                                    {points}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Knockout Bracket View */}
          {viewMode === 'knockout' && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-3xl border-2 border-stone-200 shadow-2xl p-8 md:p-12 overflow-x-auto">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-gradient-to-r from-[#C1272D]/10 to-amber-400/10 rounded-full">
                    <span className="material-icons text-[#C1272D]">account_tree</span>
                    <span className="font-bold text-stone-900">Knockout Stage</span>
                  </div>
                  <h2 className="text-3xl font-bold text-stone-900 serif-font mb-2">Road to the Final</h2>
                  <p className="text-stone-600">From Round of 16 to Champions</p>
                </div>

                {/* Simplified Bracket Visualization */}
                <div className="knockout-bracket min-w-[1200px]">
                  <div className="grid grid-cols-7 gap-8">
                    {/* Round of 16 - Left Side */}
                    <div className="space-y-16">
                      <div className="text-center text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Round of 16</div>
                      {[1, 2, 3, 4].map((match) => (
                        <div key={`r16-l-${match}`} className="bg-gradient-to-r from-stone-50 to-white border-2 border-stone-200 rounded-xl p-4 hover:border-[#C1272D] transition-all cursor-pointer shadow-sm hover:shadow-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-6 h-6 bg-stone-200 rounded-full"></div>
                              <span className="text-sm font-medium text-stone-400">TBD</span>
                            </div>
                            <span className="text-xs text-stone-400 font-mono">-</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-6 h-6 bg-stone-200 rounded-full"></div>
                              <span className="text-sm font-medium text-stone-400">TBD</span>
                            </div>
                            <span className="text-xs text-stone-400 font-mono">-</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quarter Finals - Left */}
                    <div className="space-y-32 pt-20">
                      <div className="text-center text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Quarter Finals</div>
                      {[1, 2].map((match) => (
                        <div key={`qf-l-${match}`} className="bg-gradient-to-r from-amber-50 to-white border-2 border-amber-200 rounded-xl p-4 hover:border-amber-400 transition-all cursor-pointer shadow-sm hover:shadow-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-6 h-6 bg-amber-200 rounded-full"></div>
                              <span className="text-sm font-medium text-stone-400">Winner R{match * 2 - 1}</span>
                            </div>
                            <span className="text-xs text-stone-400 font-mono">-</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-6 h-6 bg-amber-200 rounded-full"></div>
                              <span className="text-sm font-medium text-stone-400">Winner R{match * 2}</span>
                            </div>
                            <span className="text-xs text-stone-400 font-mono">-</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Semi Finals - Left */}
                    <div className="space-y-64 pt-52">
                      <div className="text-center text-xs font-bold text-[#C1272D] uppercase tracking-wider mb-4">Semi Final</div>
                      <div className="bg-gradient-to-r from-red-50 to-white border-2 border-[#C1272D] rounded-xl p-4 hover:border-[#a01e23] transition-all cursor-pointer shadow-md hover:shadow-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-6 h-6 bg-red-200 rounded-full"></div>
                            <span className="text-sm font-medium text-stone-400">Winner QF1</span>
                          </div>
                          <span className="text-xs text-stone-400 font-mono">-</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-6 h-6 bg-red-200 rounded-full"></div>
                            <span className="text-sm font-medium text-stone-400">Winner QF2</span>
                          </div>
                          <span className="text-xs text-stone-400 font-mono">-</span>
                        </div>
                      </div>
                    </div>

                    {/* Final */}
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <div className="text-center text-xs font-bold text-amber-600 uppercase tracking-wider mb-4 decorative-font">Final</div>
                        <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 border-4 border-amber-400 rounded-2xl p-6 shadow-2xl hover:shadow-amber-400/50 transition-all cursor-pointer animate-pulse-glow">
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                            <div className="relative">
                              <span className="material-icons text-amber-400 trophy-shine" style={{fontSize: '48px'}}>emoji_events</span>
                            </div>
                          </div>
                          <div className="mt-6 flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-8 h-8 bg-amber-300 rounded-full"></div>
                              <span className="text-sm font-bold text-stone-700">Winner SF1</span>
                            </div>
                            <span className="text-xs text-stone-400 font-mono">-</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-8 h-8 bg-amber-300 rounded-full"></div>
                              <span className="text-sm font-bold text-stone-700">Winner SF2</span>
                            </div>
                            <span className="text-xs text-stone-400 font-mono">-</span>
                          </div>
                          <div className="mt-4 pt-4 border-t border-amber-200 text-center">
                            <span className="text-xs text-amber-700 font-bold uppercase tracking-wider">World Champions 2030</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Semi Finals - Right */}
                    <div className="space-y-64 pt-52">
                      <div className="text-center text-xs font-bold text-[#C1272D] uppercase tracking-wider mb-4">Semi Final</div>
                      <div className="bg-gradient-to-r from-white to-red-50 border-2 border-[#C1272D] rounded-xl p-4 hover:border-[#a01e23] transition-all cursor-pointer shadow-md hover:shadow-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-stone-400 font-mono">-</span>
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <span className="text-sm font-medium text-stone-400">Winner QF3</span>
                            <div className="w-6 h-6 bg-red-200 rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-stone-400 font-mono">-</span>
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <span className="text-sm font-medium text-stone-400">Winner QF4</span>
                            <div className="w-6 h-6 bg-red-200 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quarter Finals - Right */}
                    <div className="space-y-32 pt-20">
                      <div className="text-center text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Quarter Finals</div>
                      {[3, 4].map((match) => (
                        <div key={`qf-r-${match}`} className="bg-gradient-to-r from-white to-amber-50 border-2 border-amber-200 rounded-xl p-4 hover:border-amber-400 transition-all cursor-pointer shadow-sm hover:shadow-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-stone-400 font-mono">-</span>
                            <div className="flex items-center gap-2 flex-1 justify-end">
                              <span className="text-sm font-medium text-stone-400">Winner R{(match - 2) * 2 + 5}</span>
                              <div className="w-6 h-6 bg-amber-200 rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-stone-400 font-mono">-</span>
                            <div className="flex items-center gap-2 flex-1 justify-end">
                              <span className="text-sm font-medium text-stone-400">Winner R{(match - 2) * 2 + 6}</span>
                              <div className="w-6 h-6 bg-amber-200 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Round of 16 - Right Side */}
                    <div className="space-y-16">
                      <div className="text-center text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Round of 16</div>
                      {[5, 6, 7, 8].map((match) => (
                        <div key={`r16-r-${match}`} className="bg-gradient-to-r from-white to-stone-50 border-2 border-stone-200 rounded-xl p-4 hover:border-[#C1272D] transition-all cursor-pointer shadow-sm hover:shadow-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-stone-400 font-mono">-</span>
                            <div className="flex items-center gap-2 flex-1 justify-end">
                              <span className="text-sm font-medium text-stone-400">TBD</span>
                              <div className="w-6 h-6 bg-stone-200 rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-stone-400 font-mono">-</span>
                            <div className="flex items-center gap-2 flex-1 justify-end">
                              <span className="text-sm font-medium text-stone-400">TBD</span>
                              <div className="w-6 h-6 bg-stone-200 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Knockout Stage Info */}
                <div className="mt-12 pt-8 border-t-2 border-stone-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-stone-50 rounded-xl">
                      <div className="text-3xl font-bold text-stone-900 mb-1">16</div>
                      <div className="text-sm text-stone-600">Round of 16</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-xl">
                      <div className="text-3xl font-bold text-amber-700 mb-1">8</div>
                      <div className="text-sm text-amber-700">Quarter Finals</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-xl">
                      <div className="text-3xl font-bold text-[#C1272D] mb-1">4</div>
                      <div className="text-sm text-[#C1272D]">Semi Finals</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl border-2 border-amber-400">
                      <div className="text-3xl font-bold text-amber-700 mb-1 flex items-center justify-center gap-2">
                        <span className="material-icons">emoji_events</span>
                        1
                      </div>
                      <div className="text-sm text-amber-700 font-bold">Champion</div>
                    </div>
                  </div>
                </div>
              </div>
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
                <li><a href="/groups" className="text-stone-400 hover:text-[#006233] transition-colors">Groups</a></li>
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