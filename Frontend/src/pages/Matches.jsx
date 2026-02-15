import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Matches() {
  // États pour les données
  const [matches, setMatches] = useState([]);
  const [venues, setVenues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [groups, setGroups] = useState([]);
  
  // États pour les filtres
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'calendar'
  
  // États pour les statistiques
  const [stats, setStats] = useState({
    totalMatches: 104,
    totalTeams: 48,
    totalVenues: 6
  });
  
  const [loading, setLoading] = useState(true);
  const [filteredMatches, setFilteredMatches] = useState([]);

  // Récupérer tous les matchs
  useEffect(() => {
    fetch('http://localhost:3309/api/matches/matches/allTriee')
      .then(res => res.json())
      .then(data => {
        setMatches(data);
        setFilteredMatches(data);
        setLoading(false);
      })
      .catch(err => console.error('Erreur:', err));
  }, []);

  // Récupérer les stades
  useEffect(() => {
    fetch('http://localhost:3309/api/acceuil/stade/all')
      .then(res => res.json())
      .then(data => setVenues(data))
      .catch(err => console.error('Erreur:', err));
  }, []);

  // Récupérer les équipes
  useEffect(() => {
    fetch('http://localhost:3309/api/acceuil/teams/some')
      .then(res => res.json())
      .then(data => setTeams(data))
      .catch(err => console.error('Erreur:', err));
  }, []);

  // Récupérer les groupes
  useEffect(() => {
    fetch('http://localhost:3309/api/acceuil/accueil/groupes')
      .then(res => res.json())
      .then(data => setGroups(data))
      .catch(err => console.error('Erreur:', err));
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...matches];

    if (selectedVenue !== 'all') {
      filtered = filtered.filter(match => match.stadeId === parseInt(selectedVenue));
    }

    if (selectedTeam !== 'all') {
      filtered = filtered.filter(match => 
        match.matchTeams?.some(mt => mt.teamId === parseInt(selectedTeam))
      );
    }

    if (selectedStage !== 'all') {
      filtered = filtered.filter(match => match.type === selectedStage);
    }

    if (selectedDate) {
      filtered = filtered.filter(match => {
        const matchDate = new Date(match.dateOfMatch).toLocaleDateString();
        return matchDate === selectedDate;
      });
    }

    setFilteredMatches(filtered);
  }, [selectedVenue, selectedTeam, selectedStage, selectedDate, matches]);

  // Générer les dates des 7 prochains jours
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = generateDates();

  // Grouper les matchs par date
  const matchesByDate = filteredMatches.reduce((acc, match) => {
    const date = new Date(match.dateOfMatch).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {});

  // Fonction pour obtenir le statut du match avec style
  const getMatchStatus = (status) => {
    const statusMap = {
      'DIRECT': { label: 'LIVE', color: 'bg-red-500', textColor: 'text-white', pulse: true },
      'meta 2': { label: 'LIVE', color: 'bg-red-500', textColor: 'text-white', pulse: true },
      'fin meta 1': { label: 'LIVE', color: 'bg-red-500', textColor: 'text-white', pulse: true },
      'started': { label: 'LIVE', color: 'bg-red-500', textColor: 'text-white', pulse: true },
      'commence': { label: 'LIVE', color: 'bg-red-500', textColor: 'text-white', pulse: true },
      'termine': { label: 'FT', color: 'bg-stone-500', textColor: 'text-white', pulse: false },
      'Finished': { label: 'FT', color: 'bg-stone-500', textColor: 'text-white', pulse: false },
      'upcoming': { label: 'Upcoming', color: 'bg-green-500', textColor: 'text-white', pulse: false },
      'default': { label: 'Scheduled', color: 'bg-stone-200', textColor: 'text-stone-700', pulse: false }
    };
    return statusMap[status] || statusMap.default;
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

  return (
    <>
      <Head>
        <title>Tournament Fixtures | MoroccoFan2030</title>
        <meta name="description" content="Explore the match schedule across 6 host cities" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
        <link rel="icon" href="/images/logo.png" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        body { font-family: 'Cairo', sans-serif; }
        h1, h2, h3, h4, .serif-font { font-family: 'Amiri', serif; }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
        }
        .animate-pulse-glow { animation: pulse-glow 2s infinite; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-4px);
        }
      `}</style>

      <Navbar />

      {/* Hero Section */}
      <header className="relative pt-32 pb-12 border-b border-stone-200 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/matches.jpg" alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/65"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="px-4 py-1.5 bg-white border border-stone-200 rounded-full flex items-center gap-2 shadow-sm">
              <span className="material-icons text-[#C1272D] text-sm">event</span>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">Official Schedule</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-medium text-white tracking-tight mb-3">
                Tournament <span className="text-[#C1272D] italic serif-font">Fixtures</span>
              </h1>
              <p className="text-lg text-white/90">Explore the match schedule across 6 host cities.</p>
            </div>

            <div className="flex gap-8 md:gap-12">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#C1272D] mb-1">{filteredMatches.length}</div>
                <div className="text-xs font-bold text-white/70 uppercase tracking-widest">Matches</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-amber-500 mb-1">{stats.totalTeams}</div>
                <div className="text-xs font-bold text-white/70 uppercase tracking-widest">Teams</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-emerald-500 mb-1">{stats.totalVenues}</div>
                <div className="text-xs font-bold text-white/70 uppercase tracking-widest">Venues</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters Section */}
      <section className="sticky top-20 bg-white border-b border-stone-200 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            {/* Venue Filter */}
            <div className="relative">
              <button className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border-2 border-stone-200 rounded-xl hover:border-[#C1272D] transition-all group">
                <span className="material-icons text-stone-500 group-hover:text-[#C1272D] text-sm">location_on</span>
                <span className="text-xs md:text-sm font-medium text-stone-700 hidden sm:inline">
                  {selectedVenue === 'all' ? 'All Venues' : venues.find(v => v.id === parseInt(selectedVenue))?.name}
                </span>
                <span className="text-xs md:text-sm font-medium text-stone-700 sm:hidden">Venues</span>
                <span className="material-icons text-stone-400 text-sm">expand_more</span>
              </button>
              <select 
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              >
                <option value="all">All Venues</option>
                {venues.map(venue => (
                  <option key={venue.id} value={venue.id}>{venue.name}</option>
                ))}
              </select>
            </div>

            {/* Team Filter */}
            <div className="relative">
              <button className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border-2 border-stone-200 rounded-xl hover:border-[#006233] transition-all group">
                <span className="material-icons text-stone-500 group-hover:text-[#006233] text-sm">groups</span>
                <span className="text-xs md:text-sm font-medium text-stone-700 hidden sm:inline">
                  {selectedTeam === 'all' ? 'All Teams' : teams.find(t => t.id === parseInt(selectedTeam))?.name}
                </span>
                <span className="text-xs md:text-sm font-medium text-stone-700 sm:hidden">Teams</span>
                <span className="material-icons text-stone-400 text-sm">expand_more</span>
              </button>
              <select 
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              >
                <option value="all">All Teams</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            {/* Stage Filter */}
            <div className="relative">
              <button className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border-2 border-stone-200 rounded-xl hover:border-amber-500 transition-all group">
                <span className="material-icons text-stone-500 group-hover:text-amber-500 text-sm">emoji_events</span>
                <span className="text-xs md:text-sm font-medium text-stone-700 hidden sm:inline">
                  {selectedStage === 'all' ? 'All Stages' : selectedStage}
                </span>
                <span className="text-xs md:text-sm font-medium text-stone-700 sm:hidden">Stage</span>
                <span className="material-icons text-stone-400 text-sm">expand_more</span>
              </button>
              <select 
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              >
                <option value="all">All Stages</option>
                <option value="Group Stage">Group Stage</option>
                <option value="Round of 16">Round of 16</option>
                <option value="Quarter Final">Quarter-finals</option>
                <option value="Semi Final">Semi-finals</option>
                <option value="Final">Final</option>
              </select>
            </div>

            <div className="flex-1"></div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-white text-[#C1272D] shadow-sm' : 'text-stone-500'}`}
              >
                <span className="material-icons text-base">view_module</span>
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-white text-[#006233] shadow-sm' : 'text-stone-500'}`}
              >
                <span className="material-icons text-base">view_agenda</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Date Selector */}
      <section className="bg-white border-b border-stone-100 py-3 md:py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedDate(null)}
              className={`flex-shrink-0 px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium transition-all ${
                selectedDate === null
                  ? 'bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white shadow-lg'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <div className="text-center">
                <div className="text-xs md:text-sm">All</div>
                <div className="text-[10px] md:text-xs opacity-70">Dates</div>
              </div>
            </button>

            {dates.map((date, index) => {
              const dateString = date.toLocaleDateString();
              const isSelected = selectedDate === dateString;
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
              const dayNumber = date.getDate();
              const monthName = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(dateString)}
                  className={`flex-shrink-0 px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#006233] to-[#004d28] text-white shadow-lg'
                      : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-[10px] md:text-xs opacity-70">{monthName}</div>
                    <div className="text-xl md:text-2xl font-bold">{dayNumber}</div>
                    <div className="text-[10px] md:text-xs opacity-70">{dayName}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Matches Grid */}
      <section className="relative py-8 md:py-12 bg-stone-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-stone-400 text-4xl">search_off</span>
              </div>
              <h3 className="text-xl font-medium text-stone-700 mb-2">No matches found</h3>
              <p className="text-stone-500">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredMatches.map((match, index) => {
                    const status = getMatchStatus(match.statut);
                    const team1 = match.matchTeams?.[0];
                    const team2 = match.matchTeams?.[1];
                    const date = new Date(match.dateOfMatch);

                    return (
                      <Link href={`/match/${match.id}`} key={match.id}>
                        <div className="bg-white rounded-2xl border border-stone-200 hover:border-[#C1272D] hover:shadow-xl transition-all overflow-hidden cursor-pointer card-hover">
                          {/* Header - Mobile Optimized */}
                          <div className="bg-stone-50 px-4 py-3 border-b border-stone-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase ${status.color} ${status.textColor} ${status.pulse ? 'animate-pulse-glow' : ''}`}>
                                {status.label}
                              </span>
                              <span className="text-[10px] md:text-xs text-stone-400 font-medium truncate ml-2">{match.type}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-stone-500">
                              <span className="material-icons text-stone-400" style={{fontSize: '12px'}}>schedule</span>
                              <span className="truncate">
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>

                          {/* Teams - Mobile Layout */}
                          <div className="p-4 md:p-6">
                            {/* Desktop Layout */}
                            <div className="hidden md:flex items-center justify-between mb-6">
                              <div className="flex-1 text-center">
                                <div className="w-14 h-14 bg-white rounded-full border-2 border-stone-200 flex items-center justify-center mx-auto mb-3 overflow-hidden group-hover:border-[#C1272D] transition-all">
                                  <img src={team1?.imageUrl} alt={team1?.teamName} className="w-full h-full object-cover" />
                                </div>
                                <div className="font-semibold text-stone-900 text-sm mb-1 truncate px-2">{team1?.teamName}</div>
                                {(match.statut === 'termine' || match.statut === 'Finished') && (
                                  <div className="text-2xl font-bold text-[#C1272D]">{team1?.goals || 0}</div>
                                )}
                              </div>

                              <div className="px-4 text-center">
                                {match.statut === 'termine' || match.statut === 'Finished' ? (
                                  <div className="text-sm font-medium text-stone-400">FT</div>
                                ) : (
                                  <div className="text-2xl font-light text-stone-300">VS</div>
                                )}
                              </div>

                              <div className="flex-1 text-center">
                                <div className="w-14 h-14 bg-white rounded-full border-2 border-stone-200 flex items-center justify-center mx-auto mb-3 overflow-hidden group-hover:border-[#006233] transition-all">
                                  <img src={team2?.imageUrl} alt={team2?.teamName} className="w-full h-full object-cover" />
                                </div>
                                <div className="font-semibold text-stone-900 text-sm mb-1 truncate px-2">{team2?.teamName}</div>
                                {(match.statut === 'termine' || match.statut === 'Finished') && (
                                  <div className="text-2xl font-bold text-[#006233]">{team2?.goals || 0}</div>
                                )}
                              </div>
                            </div>

                            {/* Mobile Layout */}
                            <div className="md:hidden">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <img src={team1?.imageUrl} alt={team1?.teamName} 
                                    className="w-10 h-10 rounded-full border-2 border-stone-200 object-cover flex-shrink-0" />
                                  <span className="font-semibold text-stone-900 text-xs truncate">{team1?.teamName}</span>
                                </div>

                                <div className="px-3 flex-shrink-0">
                                  {match.statut === 'termine' || match.statut === 'Finished' ? (
                                    <div className="text-lg font-bold text-stone-900">
                                      {team1?.goals || 0} – {team2?.goals || 0}
                                    </div>
                                  ) : (
                                    <div className="text-lg font-light text-stone-300">VS</div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 flex-1 min-w-0 flex-row-reverse">
                                  <img src={team2?.imageUrl} alt={team2?.teamName} 
                                    className="w-10 h-10 rounded-full border-2 border-stone-200 object-cover flex-shrink-0" />
                                  <span className="font-semibold text-stone-900 text-xs truncate text-right">{team2?.teamName}</span>
                                </div>
                              </div>
                            </div>

                            {/* Venue */}
                            <div className="pt-3 md:pt-4 border-t border-stone-100">
                              <div className="flex items-center gap-2 text-[10px] md:text-xs text-stone-500">
                                <span className="material-icons text-stone-400" style={{fontSize: '14px'}}>stadium</span>
                                <span className="font-medium truncate">{match.stadeName || 'Stadium TBD'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                // Calendar View - Mobile Optimized
                <div className="space-y-6 md:space-y-8">
                  {Object.entries(matchesByDate).map(([date, dayMatches]) => (
                    <div key={date}>
                      <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg">
                          <span className="material-icons text-xs md:text-sm">calendar_today</span>
                          <span className="font-bold text-xs md:text-sm">{date}</span>
                        </div>
                        <div className="h-px flex-1 bg-stone-300"></div>
                        <span className="text-xs md:text-sm font-medium text-stone-500">{dayMatches.length}</span>
                      </div>

                      <div className="space-y-3 md:space-y-4">
                        {dayMatches.map((match) => {
                          const status = getMatchStatus(match.statut);
                          const team1 = match.matchTeams?.[0];
                          const team2 = match.matchTeams?.[1];
                          const date = new Date(match.dateOfMatch);

                          return (
                            <Link href={`/match/${match.id}`} key={match.id}>
                              <div className="bg-white rounded-xl border border-stone-200 hover:border-[#C1272D] hover:shadow-lg transition-all p-4 md:p-6 cursor-pointer card-hover">
                                {/* Desktop Layout */}
                                <div className="hidden md:flex items-center gap-6">
                                  <div className="text-center min-w-[80px]">
                                    <div className="text-2xl font-bold text-stone-900">
                                      {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold mt-1 ${status.color} ${status.textColor}`}>
                                      {status.label}
                                    </span>
                                  </div>

                                  <div className="h-16 w-px bg-stone-200"></div>

                                  <div className="flex-1 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                      <img src={team1?.imageUrl} alt={team1?.teamName}
                                        className="w-12 h-12 rounded-full border-2 border-stone-200 object-cover" />
                                      <span className="font-semibold text-stone-900">{team1?.teamName}</span>
                                      {(match.statut === 'termine' || match.statut === 'Finished') && (
                                        <span className="text-xl font-bold text-[#C1272D] ml-auto">{team1?.goals || 0}</span>
                                      )}
                                    </div>

                                    <div className="text-stone-300 font-light px-4">vs</div>

                                    <div className="flex items-center gap-3 flex-1 flex-row-reverse">
                                      <img src={team2?.imageUrl} alt={team2?.teamName}
                                        className="w-12 h-12 rounded-full border-2 border-stone-200 object-cover" />
                                      <span className="font-semibold text-stone-900">{team2?.teamName}</span>
                                      {(match.statut === 'termine' || match.statut === 'Finished') && (
                                        <span className="text-xl font-bold text-[#006233] mr-auto">{team2?.goals || 0}</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="h-16 w-px bg-stone-200"></div>

                                  <div className="min-w-[180px] text-right">
                                    <div className="flex items-center gap-2 justify-end text-sm text-stone-600 mb-1">
                                      <span className="material-icons text-stone-400" style={{fontSize: '16px'}}>stadium</span>
                                      <span className="font-medium">{match.stadeName}</span>
                                    </div>
                                    <div className="text-xs text-stone-400">{match.type}</div>
                                  </div>
                                </div>

                                {/* Mobile Layout */}
                                <div className="md:hidden space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="material-icons text-stone-400 text-sm">schedule</span>
                                      <span className="text-sm font-bold text-stone-900">
                                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${status.color} ${status.textColor}`}>
                                      {status.label}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <img src={team1?.imageUrl} alt={team1?.teamName}
                                        className="w-10 h-10 rounded-full border-2 border-stone-200 object-cover flex-shrink-0" />
                                      <span className="font-semibold text-stone-900 text-sm truncate">{team1?.teamName}</span>
                                    </div>

                                    <div className="px-3 flex-shrink-0">
                                      {match.statut === 'termine' || match.statut === 'Finished' ? (
                                        <div className="text-lg font-bold text-stone-900">
                                          {team1?.goals || 0} – {team2?.goals || 0}
                                        </div>
                                      ) : (
                                        <div className="text-base font-light text-stone-300">VS</div>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2 flex-1 min-w-0 flex-row-reverse">
                                      <img src={team2?.imageUrl} alt={team2?.teamName}
                                        className="w-10 h-10 rounded-full border-2 border-stone-200 object-cover flex-shrink-0" />
                                      <span className="font-semibold text-stone-900 text-sm truncate text-right">{team2?.teamName}</span>
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 text-stone-600 min-w-0">
                                      <span className="material-icons text-stone-400" style={{fontSize: '14px'}}>stadium</span>
                                      <span className="truncate">{match.stadeName}</span>
                                    </div>
                                    <span className="text-stone-400 text-[10px] ml-2 flex-shrink-0">{match.type}</span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}