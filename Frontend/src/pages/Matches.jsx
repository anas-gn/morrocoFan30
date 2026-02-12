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

    // Filtre par stade
    if (selectedVenue !== 'all') {
      filtered = filtered.filter(match => match.stadeId === parseInt(selectedVenue));
    }

    // Filtre par équipe
    if (selectedTeam !== 'all') {
      filtered = filtered.filter(match => 
        match.matchTeams?.some(mt => mt.teamId === parseInt(selectedTeam))
      );
    }

    // Filtre par stage
    if (selectedStage !== 'all') {
      filtered = filtered.filter(match => match.type === selectedStage);
    }

    // Filtre par date
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

        /* Hide scrollbar for sliders but allow scrolling */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        body { font-family: 'Cairo', sans-serif; }
        h1, h2, h3, h4, .serif-font { font-family: 'Amiri', serif; }
        .decorative-font { font-family: 'Aref Ruqaa', serif; }

        .glass {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .bg-morocco-red { background: linear-gradient(135deg, #C1272D 0%, #a01e23 100%); }
        .bg-morocco-green { background: linear-gradient(135deg, #006233 0%, #004d28 100%); }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
        }
        .animate-pulse-glow { animation: pulse-glow 2s infinite; }

        /* Animations pour les lignes décoratives */
        @keyframes floatLine1 {
          0%, 100% { transform: translateY(0) rotate(-15deg); }
          50% { transform: translateY(-30px) rotate(-15deg); }
        }
        
        @keyframes floatLine2 {
          0%, 100% { transform: translateY(0) rotate(25deg); }
          50% { transform: translateY(20px) rotate(25deg); }
        }
        
        @keyframes floatLine3 {
          0%, 100% { transform: translateY(0) rotate(-35deg); }
          50% { transform: translateY(-20px) rotate(-35deg); }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

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

        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }

        /* Lignes décoratives */
        .decorative-line-red {
          animation: floatLine1 8s ease-in-out infinite;
        }

        .decorative-line-yellow {
          animation: floatLine2 10s ease-in-out infinite;
        }

        .decorative-line-green {
          animation: floatLine3 12s ease-in-out infinite;
        }
       
        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
        }
      `}</style>
      <Navbar />
      {/* Hero Section */}
     <header className="relative pt-32 pb-12 border-b border-stone-200 overflow-hidden">

  {/* Background Image */}
  <div className="absolute inset-0">
    <img
      src="/images/matches.jpg"
      alt="Background"
      className="w-full h-full object-cover"
    />
    {/* Overlay blanc léger pour lisibilité */}
    <div className="absolute inset-0 bg-black/65"></div>
  </div>

  {/* Content */}
  <div className="relative max-w-7xl mx-auto px-6">
    
    {/* Badge */}
    <div className="flex items-center gap-3 mb-6 animate-slide-in-left">
      <div className="px-4 py-1.5 bg-white border border-stone-200 rounded-full flex items-center gap-2 shadow-sm">
        <span className="material-icons text-[#C1272D] text-sm">event</span>
        <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
          Official Schedule
        </span>
      </div>
    </div>

    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
      
      {/* Titre + description */}
      <div>
        <h1 className="text-5xl md:text-6xl font-medium text-white text-stone-900 tracking-tight mb-3 animate-slide-in-left delay-100">
          Tournament{" "}
          <span className="text-[#C1272D] italic serif-font">
            Fixtures
          </span>
        </h1>
        <p className="text-lg text-stone-600 text-white animate-slide-in-left delay-200">
          Explore the match schedule across 6 host cities.
        </p>
      </div>

      {/* Statistics */}
      <div className="flex gap-12 animate-slide-in-right delay-300">

        {/* Matches - RED */}
        <div className="text-center">
          <div className="text-5xl font-bold text-[#C1272D] mb-1">
            {filteredMatches.length}
          </div>
          <div className="text-xs font-bold text-stone-500 uppercase tracking-widest text-white">
            Matches
          </div>
        </div>

        {/* Teams - YELLOW */}
        <div className="text-center">
          <div className="text-5xl font-bold text-amber-500 mb-1">
            {stats.totalTeams}
          </div>
          <div className="text-xs font-bold text-stone-500 uppercase tracking-widest text-white">
            Teams
          </div>
        </div>

        {/* Venues - GREEN */}
        <div className="text-center">
          <div className="text-5xl font-bold text-emerald-500 mb-1">
            {stats.totalVenues}
          </div>
          <div className="text-xs font-bold text-stone-500 uppercase tracking-widest text-white">
            Venues
          </div>
        </div>

      </div>

    </div>
  </div>
</header>

      {/* Filters Section */}
      <section className="sticky top-20 bg-white border-b border-stone-200 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Venue Filter */}
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-stone-200 rounded-xl hover:border-[#C1272D] transition-all group">
                <span className="material-icons text-stone-500 group-hover:text-[#C1272D] text-sm">location_on</span>
                <span className="text-sm font-medium text-stone-700">
                  {selectedVenue === 'all' ? 'All Venues' : venues.find(v => v.id === parseInt(selectedVenue))?.name}
                </span>
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
              <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-stone-200 rounded-xl hover:border-[#006233] transition-all group">
                <span className="material-icons text-stone-500 group-hover:text-[#006233] text-sm">groups</span>
                <span className="text-sm font-medium text-stone-700">
                  {selectedTeam === 'all' ? 'All Teams' : teams.find(t => t.id === parseInt(selectedTeam))?.name}
                </span>
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
              <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-stone-200 rounded-xl hover:border-amber-500 transition-all group">
                <span className="material-icons text-stone-500 group-hover:text-amber-500 text-sm">emoji_events</span>
                <span className="text-sm font-medium text-stone-700">
                  {selectedStage === 'all' ? 'Group Stage' : selectedStage}
                </span>
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
            <div className="flex items-center gap-2 bg-stone-100 rounded-xl p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-white text-[#C1272D] shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                <span className="material-icons text-sm">view_module</span>
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-white text-[#006233] shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                <span className="material-icons text-sm">view_agenda</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Date Selector */}
      <section className="bg-white border-b border-stone-100 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedDate(null)}
              className={`flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all ${
                selectedDate === null
                  ? 'bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white shadow-lg shadow-red-500/30'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <div className="text-center">
                <div className="text-sm">All</div>
                <div className="text-xs opacity-70">Dates</div>
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
                  className={`flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#006233] to-[#004d28] text-white shadow-lg shadow-green-500/30'
                      : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-xs opacity-70">{monthName}</div>
                    <div className="text-2xl font-bold">{dayNumber}</div>
                    <div className="text-xs opacity-70">{dayName}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Matches Grid */}
      <section className="relative py-12 bg-stone-50 min-h-screen overflow-hidden">
        {/* Lignes décoratives dans le contenu principal */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Ligne Rouge */}
          <div className="decorative-line-red absolute top-40 -left-40 w-[500px] h-0.5 bg-gradient-to-r from-transparent via-[#C1272D]/20 to-transparent"></div>
          <div className="decorative-line-red absolute top-[600px] right-20 w-[400px] h-0.5 bg-gradient-to-l from-transparent via-[#C1272D]/15 to-transparent" style={{animationDelay: '2s'}}></div>
          
          {/* Ligne Jaune */}
          <div className="decorative-line-yellow absolute top-[300px] right-10 w-[450px] h-0.5 bg-gradient-to-r from-amber-400/20 to-transparent"></div>
          <div className="decorative-line-yellow absolute top-[800px] left-10 w-[380px] h-0.5 bg-gradient-to-r from-transparent via-amber-500/15 to-transparent" style={{animationDelay: '3s'}}></div>
          
          {/* Ligne Verte */}
          <div className="decorative-line-green absolute top-[200px] left-32 w-[420px] h-0.5 bg-gradient-to-r from-[#006233]/20 via-transparent to-transparent"></div>
          <div className="decorative-line-green absolute top-[900px] right-32 w-[480px] h-0.5 bg-gradient-to-l from-transparent via-[#006233]/15 to-transparent" style={{animationDelay: '1s'}}></div>
          
          {/* Lignes supplémentaires pour plus de dynamisme */}
          <div className="decorative-line-red absolute top-[1100px] left-20 w-[350px] h-0.5 bg-gradient-to-r from-[#C1272D]/15 to-transparent" style={{animationDelay: '4s'}}></div>
          <div className="decorative-line-yellow absolute top-[1300px] right-40 w-[400px] h-0.5 bg-gradient-to-l from-amber-400/15 to-transparent" style={{animationDelay: '5s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-20 animate-fade-in-up">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-stone-400 text-4xl">search_off</span>
              </div>
              <h3 className="text-xl font-medium text-stone-700 mb-2">No matches found</h3>
              <p className="text-stone-500">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMatches.map((match, index) => {
                    const status = getMatchStatus(match.statut);
                    return (
                      <Link href={`/match/${match.id}`} key={match.id}>
                        <div 
                          className="bg-white rounded-2xl border-2 border-stone-200 hover:border-[#C1272D] hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 overflow-hidden group cursor-pointer card-hover animate-fade-in-up"
                          style={{animationDelay: `${index * 0.1}s`}}
                        >
                          {/* Match Header */}
                          <div className="bg-gradient-to-r from-stone-50 to-white px-6 py-4 border-b border-stone-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${status.color} ${status.textColor} ${status.pulse ? 'animate-pulse-glow' : ''}`}>
                                {status.label}
                              </span>
                              <span className="text-xs text-stone-400 font-medium">{match.type}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                              <span className="material-icons text-stone-400" style={{fontSize: '14px'}}>schedule</span>
                              <span>{new Date(match.dateOfMatch).toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Teams */}
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                              {/* Team 1 */}
                              <div className="flex-1 text-center">
                                <div className="w-16 h-16 bg-white rounded-full border-2 border-stone-200 flex items-center justify-center mx-auto mb-3 overflow-hidden group-hover:border-[#C1272D] transition-all">
                                  <img 
                                    src={ match.matchTeams[0].imageUrl}
                                    alt={match.matchTeams?.[0]?.teamName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="font-semibold text-stone-900 text-sm mb-1">{match.matchTeams?.[0]?.teamName}</div>
                                {match.statut === 'termine' || match.statut === 'Finished' ? (
                                  <div className="text-2xl font-bold text-[#C1272D]">{match.matchTeams?.[0]?.goals || 0}</div>
                                ) : null}
                              </div>

                              {/* VS / Score */}
                              <div className="px-6 text-center">
                                {match.statut === 'termine' || match.statut === 'Finished' ? (
                                  <div className="text-sm font-medium text-stone-400">FT</div>
                                ) : (
                                  <div className="text-2xl font-light text-stone-300">VS</div>
                                )}
                              </div>

                              {/* Team 2 */}
                              <div className="flex-1 text-center">
                                <div className="w-16 h-16 bg-white rounded-full border-2 border-stone-200 flex items-center justify-center mx-auto mb-3 overflow-hidden group-hover:border-[#006233] transition-all">
                                  <img 
                                    src={ match.matchTeams[1].imageUrl}
                                    alt={match.matchTeams?.[1]?.teamName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="font-semibold text-stone-900 text-sm mb-1">{match.matchTeams?.[1]?.teamName}</div>
                                {match.statut === 'termine' || match.statut === 'Finished' ? (
                                  <div className="text-2xl font-bold text-[#006233]">{match.matchTeams?.[1]?.goals || 0}</div>
                                ) : null}
                              </div>
                            </div>

                            {/* Venue */}
                            <div className="pt-4 border-t border-stone-100">
                              <div className="flex items-center gap-2 text-xs text-stone-500">
                                <span className="material-icons text-stone-400" style={{fontSize: '14px'}}>stadium</span>
                                <span className="font-medium">{match.stadeName || 'Stadium TBD'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                // Calendar View
                <div className="space-y-8">
                  {Object.entries(matchesByDate).map(([date, dayMatches], dateIndex) => (
                    <div key={date} className="animate-fade-in-up" style={{animationDelay: `${dateIndex * 0.1}s`}}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white px-4 py-2 rounded-lg">
                          <span className="material-icons text-sm">calendar_today</span>
                          <span className="font-bold">{date}</span>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-stone-300 to-transparent"></div>
                        <span className="text-sm font-medium text-stone-500">{dayMatches.length} matches</span>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {dayMatches.map((match, matchIndex) => {
                          const status = getMatchStatus(match.statut);
                          return (
                            <Link href={`/matches/${match.id}`} key={match.id}>
                              <div 
                                className="bg-white rounded-xl border border-stone-200 hover:border-[#C1272D] hover:shadow-lg transition-all p-6 cursor-pointer group card-hover animate-fade-in-up"
                                style={{animationDelay: `${(dateIndex * 0.1) + (matchIndex * 0.05)}s`}}
                              >
                                <div className="flex items-center gap-6">
                                  {/* Time */}
                                  <div className="text-center min-w-[80px]">
                                    <div className="text-2xl font-bold text-stone-900">
                                      {new Date(match.dateOfMatch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold mt-1 ${status.color} ${status.textColor}`}>
                                      {status.label}
                                    </span>
                                  </div>

                                  <div className="h-16 w-px bg-stone-200"></div>

                                  {/* Teams */}
                                  <div className="flex-1 flex items-center justify-between gap-4">
                                    {/* Team 1 */}
                                    <div className="flex items-center gap-3 flex-1">
                                      <div className="w-12 h-12 rounded-full border-2 border-stone-200 overflow-hidden flex-shrink-0">
                                        <img 
                                          src={match.matchTeams?.[0]?.imageUrl}
                                          alt={match.matchTeams?.[0]?.teamName}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <span className="font-semibold text-stone-900">{match.matchTeams?.[0]?.teamName}</span>
                                      {match.statut === 'termine' || match.statut === 'Finished' ? (
                                        <span className="text-xl font-bold text-[#C1272D] ml-auto">{match.matchTeams?.[0]?.goals || 0}</span>
                                      ) : null}
                                    </div>

                                    {/* VS */}
                                    <div className="text-stone-300 font-light px-4">vs</div>

                                    {/* Team 2 */}
                                    <div className="flex items-center gap-3 flex-1 flex-row-reverse">
                                      <div className="w-12 h-12 rounded-full border-2 border-stone-200 overflow-hidden flex-shrink-0">
                                        <img 
                                          src={match.matchTeams?.[1]?.imageUrl}
                                          alt={match.matchTeams?.[1]?.teamName}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <span className="font-semibold text-stone-900">{match.matchTeams?.[1]?.teamName}</span>
                                      {match.statut === 'termine' || match.statut === 'Finished' ? (
                                        <span className="text-xl font-bold text-[#006233] mr-auto">{match.matchTeams?.[1]?.goals || 0}</span>
                                      ) : null}
                                    </div>
                                  </div>

                                  <div className="h-16 w-px bg-stone-200"></div>

                                  {/* Venue Info */}
                                  <div className="min-w-[180px] text-right">
                                    <div className="flex items-center gap-2 justify-end text-sm text-stone-600 mb-1">
                                      <span className="material-icons text-stone-400" style={{fontSize: '16px'}}>stadium</span>
                                      <span className="font-medium">{match.stadeName}</span>
                                    </div>
                                    <div className="text-xs text-stone-400">{match.type}</div>
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