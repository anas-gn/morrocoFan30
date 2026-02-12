import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

export default function Teams() {
  const router = useRouter();
  
  // États pour les données
  const [teams, setTeams] = useState([]);
  const [groups, setGroups] = useState([]);
  
  // États pour les filtres
  const [selectedContinent, setSelectedContinent] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  
  // États pour les statistiques
  const [stats, setStats] = useState({
    totalTeams: 48,
    totalContinents: 6,
    totalGroups: 12
  });
  
  const [loading, setLoading] = useState(true);
  const [filteredTeams, setFilteredTeams] = useState([]);

  // Récupérer toutes les équipes
  useEffect(() => {
    fetch('http://localhost:3309/api/teams/teams/all')
      .then(res => res.json())
      .then(data => {
        const teamsArray = Array.isArray(data) ? data : [];
        setTeams(teamsArray);
        setFilteredTeams(teamsArray);
        setStats(prev => ({ ...prev, totalTeams: teamsArray.length }));
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur:', err);
        setTeams([]);
        setFilteredTeams([]);
        setLoading(false);
      });
  }, []);

  // Récupérer les groupes
  useEffect(() => {
    fetch('http://localhost:3309/api/acceuil/accueil/groupes')
      .then(res => res.json())
      .then(data => {
        const groupsArray = Array.isArray(data) ? data : [];
        setGroups(groupsArray);
        setStats(prev => ({ ...prev, totalGroups: groupsArray.length }));
      })
      .catch(err => {
        console.error('Erreur:', err);
        setGroups([]);
      });
  }, []);

  // Fonction pour déterminer le continent basé sur le pays
  const getContinent = (country) => {
    const continents = {
      'Africa': ['Morocco', 'Algeria', 'Tunisia', 'Egypt', 'Nigeria', 'Senegal', 'Cameroon', 'Ghana', 'Ivory Coast', 'South Africa'],
      'Europe': ['France', 'Germany', 'Spain', 'Italy', 'England', 'Portugal', 'Netherlands', 'Belgium', 'Croatia', 'Poland', 'Switzerland', 'Denmark', 'Sweden', 'Austria', 'Ukraine', 'Wales', 'Serbia'],
      'South America': ['Brazil', 'Argentina', 'Uruguay', 'Colombia', 'Chile', 'Peru', 'Ecuador', 'Paraguay', 'Venezuela'],
      'North America': ['United States', 'Mexico', 'Canada', 'Costa Rica', 'Jamaica', 'Honduras'],
      'Asia': ['Japan', 'South Korea', 'Iran', 'Saudi Arabia', 'Qatar', 'Australia', 'China', 'Iraq'],
      'Oceania': ['New Zealand']
    };

    for (const [continent, countries] of Object.entries(continents)) {
      if (countries.includes(country)) return continent;
    }
    return 'Other';
  };

  // Fonction pour obtenir le code de confédération
  const getConfederation = (continent) => {
    const confederations = {
      'Africa': 'CAF',
      'Europe': 'UEFA',
      'South America': 'CONMEBOL',
      'North America': 'CONCACAF',
      'Asia': 'AFC',
      'Oceania': 'OFC'
    };
    return confederations[continent] || '';
  };

  // Appliquer les filtres et le tri
  useEffect(() => {
    if (!teams || !Array.isArray(teams) || teams.length === 0) {
      setFilteredTeams([]);
      return;
    }

    let filtered = Array.isArray(teams) ? [...teams] : [];

    // Filtre par continent
    if (selectedContinent !== 'all') {
      filtered = filtered.filter(team => getContinent(team.country) === selectedContinent);
    }

    // Filtre par groupe
    if (selectedGroup !== 'all') {
      const group = groups.find(g => g.id === parseInt(selectedGroup));
      if (group && group.groupTeams) {
        const teamIds = group.groupTeams.map(gt => gt.teamId);
        filtered = filtered.filter(team => teamIds.includes(team.id));
      }
    }

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(team => 
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tri
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'participation') {
        return (b.participation || 0) - (a.participation || 0);
      } else if (sortBy === 'newsCount') {
        return (b.newsCount || 0) - (a.newsCount || 0);
      }
      return 0;
    });

    setFilteredTeams(filtered);
  }, [selectedContinent, selectedGroup, searchQuery, sortBy, teams, groups]);

  // Obtenir les continents uniques
  const continents = teams && Array.isArray(teams) && teams.length > 0 
    ? [...new Set(teams.map(team => getContinent(team.country)))].filter(c => c !== 'Other')
    : [];

  // Fonction pour obtenir les initiales du pays
  const getCountryCode = (countryName) => {
    const codes = {
      'Morocco': 'MAR', 'Algeria': 'ALG', 'Tunisia': 'TNS', 'Egypt': 'EGY',
      'France': 'FRA', 'Germany': 'GER', 'Spain': 'ESP', 'Italy': 'ITL',
      'Brazil': 'BRA', 'Argentina': 'ARG', 'Uruguay': 'UGY', 'Colombia': 'COL',
      'United States': 'USA', 'Mexico': 'MEX', 'Canada': 'CAN',
      'Japan': 'JPA', 'South Korea': 'KRA', 'Iran': 'IRA', 'Saudi Arabia': 'KSA',
      'Portugal': 'PRT', 'England': 'ENG', 'Netherlands': 'NLD', 'Belgium': 'BEL',
      'Senegal': 'SNG', 'Nigeria': 'NIG', 'Cameroon': 'CMA', 'Ghana': 'GHA'
    };
    return codes[countryName] || countryName.substring(0, 2).toUpperCase();
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
        <title>Teams | MoroccoFan2030</title>
        <meta name="description" content="Explore the match schedule across 6 host cities" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
         <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        /* Zellige Pattern - Subtle */
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

        /* Glass Utility */
        .glass {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        body {
          font-family: 'Outfit', sans-serif;
        }
        h1, h2, h3, h4, .serif-font {
          font-family: 'Playfair Display', serif;
        }
body { font-family: 'Cairo', sans-serif; }
        h1, h2, h3, h4, .serif-font { font-family: 'Amiri', serif; }
        .decorative-font { font-family: 'Aref Ruqaa', serif; }

        @keyframes scaleIn {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .group:hover .animate-scale {
          animation: scaleIn 0.5s ease-in-out;
        }
      `}</style>
      
      <Navbar />

     <header className="relative w-full pt-32 pb-12 overflow-hidden border-b border-stone-200">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/moroccoteam.avif"
            alt="Teams Background"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/50"></div>
          {/* Pattern Overlay */}
          <div className="absolute inset-0 bg-pattern opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-white/20 text-stone-700 text-xs font-medium uppercase tracking-widest mb-4 shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeWidth="2"/>
                </svg>
                Qualified Nations
              </div>
              <h1 className="text-4xl md:text-6xl font-medium tracking-tighter text-white mb-2 drop-shadow-lg">
                Participating <span className="serif-font italic text-[#C1272D]">Teams</span>
              </h1>
              <p className="text-white/90 max-w-xl text-lg drop-shadow">
                Discover the 48 nations competing for glory in Morocco, Portugal, and Spain.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Filter & Search Bar */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-400 group-focus-within:text-[#C1272D] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                  <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C1272D]/20 focus:border-[#C1272D] transition-all placeholder:text-stone-400" 
                placeholder="Search team or country..."
              />
            </div>

            {/* Continent Filters (Scrollable) */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1">
              <button 
                onClick={() => setSelectedContinent('all')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide whitespace-nowrap transition-all ${
                  selectedContinent === 'all' 
                    ? 'bg-[#C1272D] text-white shadow-md shadow-red-500/20 scale-105' 
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                All Teams
              </button>
              
              {continents.map(continent => (
                <button 
                  key={continent}
                  onClick={() => setSelectedContinent(continent)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium tracking-wide whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedContinent === continent
                      ? 'bg-[#C1272D] text-white shadow-md shadow-red-500/20'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  }`}
                >
                  {continent} <span className="opacity-50 text-[10px]">{getConfederation(continent)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-12 bg-stone-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Teams Grid */}
          {!Array.isArray(filteredTeams) || filteredTeams.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                  <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="11" y1="8" x2="11" y2="14" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-stone-700 mb-2">No teams found</h3>
              <p className="text-stone-500">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-6">
              {filteredTeams.map((team) => {
                const continent = getContinent(team.country);
                const confederation = getConfederation(continent);
                const countryCode = getCountryCode(team.country);
                const isHost = ['Morocco', 'Portugal', 'Spain'].includes(team.country);
                
                return (
                  <div 
                    key={team.id}
                    onClick={() => router.push(`/Team/${team.id}`)}
                    className="group bg-white rounded-2xl border border-stone-200 p-6 relative overflow-hidden hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  >
                    {/* Host Badge */}
                    {isHost && (
                      <div className="absolute top-4 right-4 px-2 py-1 bg-[#C1272D]/10 text-[#C1272D] text-[10px] font-bold uppercase tracking-wider rounded border border-[#C1272D]/20">
                        Host
                      </div>
                    )}
                    
                    {/* Participation Badge */}
                    {team.participation > 0 && (
                      <div className="absolute top-4 left-4 px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded border border-amber-200">
                        {team.participation}x
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center text-center mt-4 mb-6">
                      {/* Flag Image */}
                      <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg mb-4 overflow-hidden bg-stone-100 animate-scale transition-transform duration-500">
                        <img 
                          src={team.imageUrl}
                          alt={team.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { 
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-200 to-stone-300 text-stone-600 text-xl font-bold">${countryCode}</div>`;
                          }}
                        />
                      </div>
                      
                      <h3 className="text-xl font-serif text-stone-900 mb-1">{team.name}</h3>
                      <div className="text-xs font-medium text-stone-400 uppercase tracking-widest">
                        {confederation} • {continent}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                      {team.coach && (
                        <div className="text-xs text-stone-500 flex-1 truncate">
                          <span className="text-stone-400">Coach:</span> <span className="font-medium text-stone-700">{team.coach}</span>
                        </div>
                      )}
                      <div className="ml-auto w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:bg-[#C1272D] group-hover:border-[#C1272D] group-hover:text-white transition-all flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredTeams.length > 0 && filteredTeams.length < teams.length && (
            <div className="mt-12 text-center">
              <button 
                onClick={() => {
                  setSelectedContinent('all');
                  setSearchQuery('');
                }}
                className="px-6 py-3 bg-white border border-stone-200 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-50 hover:border-stone-300 transition-all inline-flex items-center gap-2"
              >
                View All {teams.length} Teams
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}