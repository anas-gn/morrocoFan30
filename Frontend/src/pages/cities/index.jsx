import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

export default function Cities() {
  const router = useRouter();
  
  // États pour les données
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  
  // États pour les filtres
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  
  // États pour les statistiques
  const [stats, setStats] = useState({
    totalCities: 6,
    totalHotels: 0,
    totalAttractions: 0,
    totalStadiums: 0
  });
  
  const [loading, setLoading] = useState(true);

  // Liste des régions (à adapter selon vos données)
  const regions = [
    { value: 'all', label: 'All Regions' },
    { value: 'North', label: 'North' },
    { value: 'Center', label: 'Center' },
    { value: 'South', label: 'South' },
    { value: 'East', label: 'East' },
    { value: 'West', label: 'West' }
  ];

  // Récupérer toutes les villes
  useEffect(() => {
    fetch('http://localhost:3309/api/cities/all')
      .then(res => res.json())
      .then(data => {
        setCities(data);
        setFilteredCities(data);
        
        // Calculer les statistiques
        const totalHotels = data.reduce((acc, city) => acc + (city.hotelsCount || 0), 0);
        const totalAttractions = data.reduce((acc, city) => acc + (city.attractionsCount || 0), 0);
        const totalStadiums = data.reduce((acc, city) => acc + (city.stadesCount || 0), 0);
        
        setStats({
          totalCities: data.length,
          totalHotels,
          totalAttractions,
          totalStadiums
        });
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur:', err);
        setLoading(false);
      });
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...cities];

    // Filtre par région
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(city => city.region === selectedRegion);
    }

    // Filtre par recherche
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(city =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (city.description && city.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredCities(filtered);
  }, [selectedRegion, searchQuery, cities]);

  // Navigation vers le détail d'une ville
  const navigateToCityDetail = (cityId) => {
    router.push(`/cities/${cityId}`);
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

  return (
    <>
      <Head>
        <title>Host Cities | MoroccoFan2030</title>
        <meta name="description" content="Discover the 6 host cities for the 2030 World Cup" />
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

        .hover-scale {
          transition: transform 0.3s ease;
        }
        .hover-scale:hover {
          transform: scale(1.02);
        }

        .image-overlay {
          position: relative;
          overflow: hidden;
        }
        .image-overlay::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%);
        }
      `}</style>

      <Navbar />

      {/* Hero Section */}
      <header className="relative pt-32 pb-12 border-b border-stone-200 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/cities-bg.jpg"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/65"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6">
          {/* Badge */}
          <div className="flex items-center gap-3 mb-6">
            <div className="px-4 py-1.5 bg-white border border-stone-200 rounded-full flex items-center gap-2 shadow-sm">
              <span className="material-icons text-[#C1272D] text-sm">location_city</span>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Host Cities 2030
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            {/* Titre + description */}
            <div>
              <h1 className="text-5xl md:text-6xl font-medium text-white tracking-tight mb-3">
                Discover the{" "}
                <span className="text-[#C1272D] italic serif-font">
                  Host Cities
                </span>
              </h1>
              <p className="text-lg text-white">
                Explore the 6 magnificent cities hosting the 2030 World Cup.
              </p>
            </div>

            {/* Statistics */}
            <div className="flex gap-12">
              {/* Cities - RED */}
              <div className="text-center">
                <div className="text-5xl font-bold text-[#C1272D] mb-1">
                  {stats.totalCities}
                </div>
                <div className="text-xs font-bold text-white uppercase tracking-widest">
                  Cities
                </div>
              </div>

              {/* Hotels - YELLOW */}
              <div className="text-center">
                <div className="text-5xl font-bold text-amber-500 mb-1">
                  {stats.totalHotels}
                </div>
                <div className="text-xs font-bold text-white uppercase tracking-widest">
                  Hotels
                </div>
              </div>

              {/* Attractions - GREEN */}
              <div className="text-center">
                <div className="text-5xl font-bold text-emerald-500 mb-1">
                  {stats.totalAttractions}
                </div>
                <div className="text-xs font-bold text-white uppercase tracking-widest">
                  Attractions
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
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[300px]">
              <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cities, country, or description..."
                className="w-full pl-12 pr-4 py-2 bg-white border-2 border-stone-200 rounded-xl focus:border-[#C1272D] focus:outline-none text-sm"
              />
            </div>

            {/* Region Filter */}
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-stone-200 rounded-xl hover:border-[#006233] transition-all group">
                <span className="material-icons text-stone-500 group-hover:text-[#006233] text-sm">
                  public
                </span>
                <span className="text-sm font-medium text-stone-700">
                  {regions.find(r => r.value === selectedRegion)?.label || 'All Regions'}
                </span>
                <span className="material-icons text-stone-400 text-sm">expand_more</span>
              </button>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              >
                {regions.map(region => (
                  <option key={region.value} value={region.value}>{region.label}</option>
                ))}
              </select>
            </div>

            <div className="flex-1"></div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-stone-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#C1272D] shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <span className="material-icons text-sm">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-[#006233] shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <span className="material-icons text-sm">view_list</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-12 bg-gradient-to-br from-stone-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          {filteredCities.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-stone-400 text-4xl">search_off</span>
              </div>
              <h3 className="text-xl font-medium text-stone-700 mb-2">No cities found</h3>
              <p className="text-stone-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCities.map((city) => (
                    <div
                      key={city.id}
                      onClick={() => navigateToCityDetail(city.id)}
                      className="bg-white rounded-2xl border-2 border-stone-200 hover:border-[#C1272D] hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 overflow-hidden cursor-pointer hover-scale group"
                    >
                      {/* City Image */}
                      <div className="relative h-48 overflow-hidden image-overlay">
                        <img
                          src={city.imageUrl || '/images/city-placeholder.jpg'}
                          alt={city.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                          <div className="flex items-center gap-2 text-white">
                            <span className="material-icons text-sm">location_on</span>
                            <span className="text-xs font-medium">{city.country}</span>
                          </div>
                        </div>
                      </div>

                      {/* City Info */}
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-stone-900 mb-2 serif-font">
                          {city.name}
                        </h3>
                        
                        {city.region && (
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white text-xs font-bold rounded-full">
                              {city.region}
                            </span>
                          </div>
                        )}

                        <p className="text-sm text-stone-600 mb-4 line-clamp-3">
                          {city.description || 'Discover this amazing host city...'}
                        </p>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-4 pt-4 border-t border-stone-100">
                          <div className="flex items-center gap-1 text-xs text-stone-500">
                            <span className="material-icons text-amber-500" style={{fontSize: '16px'}}>hotel</span>
                            <span>{city.hotelsCount || 0} Hotels</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-stone-500">
                            <span className="material-icons text-emerald-500" style={{fontSize: '16px'}}>place</span>
                            <span>{city.attractionsCount || 0} Sites</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-stone-500">
                            <span className="material-icons text-[#C1272D]" style={{fontSize: '16px'}}>stadium</span>
                            <span>{city.stadesCount || 0} Stadiums</span>
                          </div>
                        </div>

                        {/* Explore Button */}
                        <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-stone-50 to-white border-2 border-stone-200 rounded-xl font-medium text-stone-700 hover:border-[#C1272D] hover:text-[#C1272D] transition-all group-hover:border-[#C1272D]">
                          <span className="flex items-center justify-center gap-2">
                            Explore City
                            <span className="material-icons text-sm">arrow_forward</span>
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-4">
                  {filteredCities.map((city) => (
                    <div
                      key={city.id}
                      onClick={() => navigateToCityDetail(city.id)}
                      className="bg-white rounded-xl border border-stone-200 hover:border-[#C1272D] hover:shadow-lg transition-all p-6 cursor-pointer group"
                    >
                      <div className="flex items-center gap-6">
                        {/* City Image */}
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={city.imageUrl || '/images/city-placeholder.jpg'}
                            alt={city.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        {/* City Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-2xl font-bold text-stone-900 mb-1 serif-font">
                                {city.name}
                              </h3>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-sm text-stone-500">
                                  <span className="material-icons text-xs">location_on</span>
                                  <span>{city.country}</span>
                                </div>
                                {city.region && (
                                  <span className="px-2 py-0.5 bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white text-xs font-bold rounded-full">
                                    {city.region}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-stone-600 mb-3 line-clamp-2">
                            {city.description || 'Discover this amazing host city...'}
                          </p>

                          {/* Stats Row */}
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="material-icons text-amber-500" style={{fontSize: '18px'}}>hotel</span>
                              <span className="text-stone-700 font-medium">{city.hotelsCount || 0}</span>
                              <span className="text-stone-500">Hotels</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="material-icons text-emerald-500" style={{fontSize: '18px'}}>place</span>
                              <span className="text-stone-700 font-medium">{city.attractionsCount || 0}</span>
                              <span className="text-stone-500">Attractions</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="material-icons text-[#C1272D]" style={{fontSize: '18px'}}>stadium</span>
                              <span className="text-stone-700 font-medium">{city.stadesCount || 0}</span>
                              <span className="text-stone-500">Stadiums</span>
                            </div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0">
                          <span className="material-icons text-stone-400 group-hover:text-[#C1272D] group-hover:translate-x-1 transition-all">
                            arrow_forward
                          </span>
                        </div>
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
