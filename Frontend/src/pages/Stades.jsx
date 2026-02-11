import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

export default function Stades() {
  const router = useRouter();
  
  // États pour les données
  const [stades, setStades] = useState([]);
  const [cities, setCities] = useState([]);
  
  // États pour les filtres
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  
  // États pour les statistiques
  const [stats, setStats] = useState({
    totalStadiums: 0,
    totalCapacity: 0,
    totalCities: 6
  });
  
  const [loading, setLoading] = useState(true);
  const [filteredStades, setFilteredStades] = useState([]);

  // Récupérer tous les stades
  useEffect(() => {
    fetch('http://localhost:3309/api/acceuil/stade/all')
      .then(res => res.json())
      .then(data => {
        const stadesArray = Array.isArray(data) ? data : [];
        setStades(stadesArray);
        setFilteredStades(stadesArray);
        
        // Calculer les statistiques
        const totalCap = stadesArray.reduce((sum, stade) => sum + (stade.capacity || 0), 0);
        setStats(prev => ({ 
          ...prev, 
          totalStadiums: stadesArray.length,
          totalCapacity: totalCap
        }));
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur:', err);
        setStades([]);
        setFilteredStades([]);
        setLoading(false);
      });
  }, []);

  // Récupérer les villes
  useEffect(() => {
    fetch('http://localhost:3309/api/acceuil/CityHosts/all')
      .then(res => res.json())
      .then(data => {
        const citiesArray = Array.isArray(data) ? data : [];
        setCities(citiesArray);
        setStats(prev => ({ ...prev, totalCities: citiesArray.length }));
      })
      .catch(err => {
        console.error('Erreur:', err);
        setCities([]);
      });
  }, []);

  // Appliquer les filtres et le tri
  useEffect(() => {
    if (!stades || !Array.isArray(stades) || stades.length === 0) {
      setFilteredStades([]);
      return;
    }

    let filtered = Array.isArray(stades) ? [...stades] : [];

    // Filtre par ville
    if (selectedCity !== 'all') {
      filtered = filtered.filter(stade => 
        (stade.cityName || stade.city) === selectedCity
      );
    }

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(stade => 
        stade.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (stade.cityName || stade.city || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tri
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'capacity') {
        return (b.capacity || 0) - (a.capacity || 0);
      } else if (sortBy === 'city') {
        return (a.cityName || a.city || '').localeCompare(b.cityName || b.city || '');
      }
      return 0;
    });

    setFilteredStades(filtered);
  }, [selectedCity, searchQuery, sortBy, stades]);

  // Obtenir les villes uniques à partir des stades
  const uniqueCities = stades && Array.isArray(stades) && stades.length > 0 
    ? [...new Set(stades.map(stade => stade.cityName || stade.city).filter(Boolean))]
    : [];

  // Fonction pour obtenir la couleur du badge selon la capacité
  const getCapacityBadgeColor = (capacity) => {
    if (capacity >= 80000) return 'bg-[#C1272D]/10 text-[#C1272D] border-[#C1272D]/20';
    if (capacity >= 60000) return 'bg-[#006233]/10 text-[#006233] border-[#006233]/20';
    if (capacity >= 40000) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-stone-100 text-stone-600 border-stone-200';
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
        <title>Stadiums | MoroccoFan2030</title>
        <meta name="description" content="Explore the iconic stadiums hosting the World Cup 2030" />
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

        body { font-family: 'Cairo', sans-serif; }
        h1, h2, h3, h4, .serif-font { font-family: 'Amiri', serif; }
        .decorative-font { font-family: 'Aref Ruqaa', serif; }

        @keyframes scaleIn {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .group:hover .animate-scale {
          animation: scaleIn 0.6s ease-in-out;
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }

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
       
        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
        }
      `}</style>
      
      <Navbar />

      <header className="relative w-full pt-32 pb-16 overflow-hidden border-b border-stone-200">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/terrain1.webp"
            alt="Stadiums Background"
            className="w-full h-full object-cover"
          />
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-stone-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-lg animate-slide-in-left">
                <span className="material-icons text-base">stadium</span>
                World Cup Venues
              </div>
              <h1 className="text-5xl md:text-7xl font-normal tracking-tight text-white mb-4 leading-tight animate-slide-in-left delay-100">
                Iconic <span className="serif-font italic text-[#C1272D] font-medium">Stadiums</span>
              </h1>
              <p className="text-white/90 text-base md:text-lg leading-relaxed animate-slide-in-left delay-200">
                Discover the magnificent venues hosting the world's greatest football tournament.
              </p>
            </div>

            {/* Stats Cards - Horizontal on desktop, vertical on mobile */}
            
            <div className="flex gap-12 animate-slide-in-right delay-300">

        {/* Matches - RED */}
        <div className="text-center">
          <div className="text-5xl font-bold text-[#C1272D] mb-1">
            {stats.totalStadiums}
          </div>
          <div className="text-xs font-bold text-stone-500 uppercase tracking-widest text-white">
            Stadiums
          </div>
        </div>

        {/* Teams - YELLOW */}
        <div className="text-center">
          <div className="text-5xl font-bold text-amber-500 mb-1">
            {(stats.totalCapacity / 1000).toFixed(0)} K
          </div>
          <div className="text-xs font-bold text-stone-500 uppercase tracking-widest text-white">
            Capacity
          </div>
        </div>

        {/* Venues - GREEN */}
        <div className="text-center">
          <div className="text-5xl font-bold text-emerald-500 mb-1">
           {stats.totalCities}
          </div>
          <div className="text-xs font-bold text-stone-500 uppercase tracking-widest text-white">
            Cities
          </div>
        </div>

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
                placeholder="Search stadium or city..."
              />
            </div>

            {/* City Filters + Sort */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1">
              <button 
                onClick={() => setSelectedCity('all')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide whitespace-nowrap transition-all ${
                  selectedCity === 'all' 
                    ? 'bg-[#C1272D] text-white shadow-md shadow-red-500/20 scale-105' 
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                All Stadiums
              </button>
              
              {uniqueCities.map(city => (
                <button 
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium tracking-wide whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedCity === city
                      ? 'bg-[#C1272D] text-white shadow-md shadow-red-500/20'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  }`}
                >
                  <span className="material-icons text-sm">location_on</span>
                  {city}
                </button>
              ))}

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#C1272D]/20 cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                <option value="capacity">Sort by Capacity</option>
                <option value="city">Sort by City</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative py-12 bg-stone-50 min-h-screen overflow-hidden">
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
          
          {/* Stadiums Grid */}
          {!Array.isArray(filteredStades) || filteredStades.length === 0 ? (
            <div className="text-center py-20 animate-fade-in-up">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-4xl text-stone-400">stadium</span>
              </div>
              <h3 className="text-xl font-medium text-stone-700 mb-2">No stadiums found</h3>
              <p className="text-stone-500">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStades.map((stade, index) => {
                const isLargeStadium = stade.capacity >= 80000;
                
                return (
                  <div 
                    key={stade.id}
                    onClick={() => router.push(`/stade/${stade.id}`)}
                    className="group bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-stone-100 card-hover animate-fade-in-up"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    {/* Stadium Image */}
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
                      <img 
                        src={stade.imageUrl}
                        alt={stade.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => { 
                          e.target.src = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop";
                        }}
                      />
                      
                      {/* Capacity Badge */}
                      <div className="absolute top-4 right-4 z-20 px-4 py-2 rounded-xl text-xs font-bold text-white backdrop-blur-md bg-black/40 border border-white/20">
                        {stade.capacity ? stade.capacity.toLocaleString() : 'N/A'} seats
                      </div>

                      {/* Large Stadium Badge */}
                      {isLargeStadium && (
                        <div className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-[#C1272D] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-1.5">
                          <span className="material-icons text-sm">star</span>
                          Premier
                        </div>
                      )}

                      {/* View Details on Hover */}
                      <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-sm border-2 border-white/60 rounded-full px-6 py-3 text-white font-semibold text-sm flex items-center gap-2">
                          <span>View Details</span>
                          <span className="material-icons text-base">arrow_forward</span>
                        </div>
                      </div>
                    </div>

                    {/* Stadium Info */}
                    <div className="p-6">
                      {/* City Tag */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-icons text-sm text-[#006233]">location_on</span>
                        <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
                          {stade.cityName || stade.city}
                        </span>
                      </div>

                      <h3 className="text-xl font-serif text-stone-900 mb-3 group-hover:text-[#C1272D] transition-colors leading-tight">
                        {stade.name}
                      </h3>
                      
                      {stade.description && (
                        <p className="text-sm text-stone-500 line-clamp-2 mb-4 leading-relaxed">
                          {stade.description}
                        </p>
                      )}

                      {/* Stadium Details */}
                      <div className="flex items-center gap-4 pt-4 border-t border-stone-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                            <span className="material-icons text-sm text-stone-600">event_seat</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-stone-400 uppercase tracking-wider">Capacity</span>
                            <span className="text-sm font-bold text-stone-700">
                              {stade.capacity ? (stade.capacity / 1000).toFixed(1) + 'K' : 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        {stade.yearBuilt && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                              <span className="material-icons text-sm text-stone-600">calendar_today</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-stone-400 uppercase tracking-wider">Built</span>
                              <span className="text-sm font-bold text-stone-700">{stade.yearBuilt}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* View All Button */}
          {filteredStades.length > 0 && filteredStades.length < stades.length && (
            <div className="mt-12 text-center animate-fade-in-up delay-400">
              <button 
                onClick={() => {
                  setSelectedCity('all');
                  setSearchQuery('');
                }}
                className="px-6 py-3 bg-white border border-stone-200 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-50 hover:border-stone-300 transition-all inline-flex items-center gap-2"
              >
                View All {stades.length} Stadiums
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