import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Attractions() {
  const router = useRouter();
  
  // États pour les données
  const [attractions, setAttractions] = useState([]);
  const [cities, setCities] = useState([]);
  
  // États pour les filtres
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState('all'); // 'all', 'free', 'low', 'medium', 'high'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  
  // États pour les statistiques
  const [stats, setStats] = useState({
    totalAttractions: 0,
    totalCities: 6,
    totalTypes: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [filteredAttractions, setFilteredAttractions] = useState([]);

  // Types d'attractions
  const attractionTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'Museum', label: 'Museums' },
    { value: 'Monument', label: 'Monuments' },
    { value: 'Park', label: 'Parks' },
    { value: 'Beach', label: 'Beaches' },
    { value: 'Market', label: 'Markets' },
    { value: 'Religious', label: 'Religious Sites' },
    { value: 'Historical', label: 'Historical' },
    { value: 'Nature', label: 'Nature' },
    { value: 'Entertainment', label: 'Entertainment' }
  ];

  // Récupérer toutes les attractions via les villes
  useEffect(() => {
    setLoading(true);
    
    // Récupérer toutes les villes
    fetch('http://localhost:3309/api/cities/all')
      .then(res => res.json())
      .then(async (citiesData) => {
        setCities(citiesData);
        
        // Récupérer les attractions de chaque ville
        const allAttractions = [];
        
        for (const city of citiesData) {
          try {
            const response = await fetch(`http://localhost:3309/api/cities/${city.id}/attractions`);
            const cityAttractions = await response.json();
            
            // Ajouter l'info de la ville à chaque attraction
            const attractionsWithCity = cityAttractions.map(attr => ({
              ...attr,
              cityName: city.name,
              cityId: city.id
            }));
            
            allAttractions.push(...attractionsWithCity);
          } catch (err) {
            console.error(`Erreur pour la ville ${city.name}:`, err);
          }
        }
        
        setAttractions(allAttractions);
        setFilteredAttractions(allAttractions);
        
        // Calculer les statistiques
        const uniqueTypes = [...new Set(allAttractions.map(a => a.type).filter(Boolean))];
        setStats({
          totalAttractions: allAttractions.length,
          totalCities: citiesData.length,
          totalTypes: uniqueTypes.length
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
    let filtered = [...attractions];

    // Filtre par ville
    if (selectedCity !== 'all') {
      filtered = filtered.filter(attr => attr.cityId === parseInt(selectedCity));
    }

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(attr => attr.type === selectedType);
    }

    // Filtre par recherche
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(attr =>
        attr.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attr.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attr.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par prix
    if (priceRange !== 'all') {
      filtered = filtered.filter(attr => {
        const price = attr.priceProxim || 0;
        switch (priceRange) {
          case 'free': return price === 0;
          case 'low': return price > 0 && price <= 50;
          case 'medium': return price > 50 && price <= 150;
          case 'high': return price > 150;
          default: return true;
        }
      });
    }

    setFilteredAttractions(filtered);
  }, [selectedCity, selectedType, searchQuery, priceRange, attractions]);

  // Navigation vers le détail
  const navigateToDetail = (attractionId) => {
    router.push(`/attractions/${attractionId}`);
  };

  // Fonction pour formater les horaires
  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5); // "HH:mm"
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
        <title>Tourist Attractions | MoroccoFan2030</title>
        <meta name="description" content="Discover amazing attractions across Morocco's host cities" />
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
      `}</style>

      <Navbar />

      {/* Hero Section */}
      <header className="relative pt-32 pb-12 border-b border-stone-200 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/attractions-bg.jpg"
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
              <span className="material-icons text-emerald-500 text-sm">place</span>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Discover Morocco
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            {/* Titre + description */}
            <div>
              <h1 className="text-5xl md:text-6xl font-medium text-white tracking-tight mb-3">
                Tourist{" "}
                <span className="text-emerald-500 italic serif-font">
                  Attractions
                </span>
              </h1>
              <p className="text-lg text-white">
                Explore Morocco's rich culture and heritage across {stats.totalCities} host cities.
              </p>
            </div>

            {/* Statistics */}
            <div className="flex gap-12">
              {/* Attractions - EMERALD */}
              <div className="text-center">
                <div className="text-5xl font-bold text-emerald-500 mb-1">
                  {filteredAttractions.length}
                </div>
                <div className="text-xs font-bold text-white uppercase tracking-widest">
                  Attractions
                </div>
              </div>

              {/* Cities - YELLOW */}
              <div className="text-center">
                <div className="text-5xl font-bold text-amber-500 mb-1">
                  {stats.totalCities}
                </div>
                <div className="text-xs font-bold text-white uppercase tracking-widest">
                  Cities
                </div>
              </div>

              {/* Types - RED */}
              <div className="text-center">
                <div className="text-5xl font-bold text-[#C1272D] mb-1">
                  {stats.totalTypes}
                </div>
                <div className="text-xs font-bold text-white uppercase tracking-widest">
                  Types
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
                placeholder="Search attractions, address, or description..."
                className="w-full pl-12 pr-4 py-2 bg-white border-2 border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-none text-sm"
              />
            </div>

            {/* City Filter */}
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-stone-200 rounded-xl hover:border-emerald-500 transition-all group">
                <span className="material-icons text-stone-500 group-hover:text-emerald-500 text-sm">location_city</span>
                <span className="text-sm font-medium text-stone-700">
                  {selectedCity === 'all' ? 'All Cities' : cities.find(c => c.id === parseInt(selectedCity))?.name}
                </span>
                <span className="material-icons text-stone-400 text-sm">expand_more</span>
              </button>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              >
                <option value="all">All Cities</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-stone-200 rounded-xl hover:border-[#C1272D] transition-all group">
                <span className="material-icons text-stone-500 group-hover:text-[#C1272D] text-sm">category</span>
                <span className="text-sm font-medium text-stone-700">
                  {attractionTypes.find(t => t.value === selectedType)?.label || 'All Types'}
                </span>
                <span className="material-icons text-stone-400 text-sm">expand_more</span>
              </button>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              >
                {attractionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-stone-200 rounded-xl hover:border-amber-500 transition-all group">
                <span className="material-icons text-stone-500 group-hover:text-amber-500 text-sm">attach_money</span>
                <span className="text-sm font-medium text-stone-700">
                  {priceRange === 'all' ? 'All Prices' : 
                   priceRange === 'free' ? 'Free' :
                   priceRange === 'low' ? '$ (Low)' :
                   priceRange === 'medium' ? '$$ (Medium)' : '$$$ (High)'}
                </span>
                <span className="material-icons text-stone-400 text-sm">expand_more</span>
              </button>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              >
                <option value="all">All Prices</option>
                <option value="free">Free</option>
                <option value="low">$ (0-50 MAD)</option>
                <option value="medium">$$ (50-150 MAD)</option>
                <option value="high">$$$ (150+ MAD)</option>
              </select>
            </div>

            <div className="flex-1"></div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-stone-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'grid' ? 'bg-white text-emerald-500 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <span className="material-icons text-sm">view_module</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'list' ? 'bg-white text-emerald-500 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <span className="material-icons text-sm">view_agenda</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Attractions Grid/List */}
      <section className="py-12 bg-gradient-to-br from-stone-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          {filteredAttractions.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-stone-400 text-4xl">search_off</span>
              </div>
              <h3 className="text-xl font-medium text-stone-700 mb-2">No attractions found</h3>
              <p className="text-stone-500">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAttractions.map((attraction) => (
                    <div
                      key={attraction.id}
                      onClick={() => navigateToDetail(attraction.id)}
                      className="bg-white rounded-2xl border-2 border-stone-200 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden group cursor-pointer"
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={attraction.imageUrl || '/images/attraction-placeholder.jpg'}
                          alt={attraction.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        
                        {/* Price Badge */}
                        {attraction.priceProxim !== undefined && (
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <span className="text-sm font-bold text-emerald-600">
                              {attraction.priceProxim === 0 ? 'FREE' : `${attraction.priceProxim} MAD`}
                            </span>
                          </div>
                        )}

                        {/* Type Badge */}
                        {attraction.type && (
                          <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-xs font-bold text-white uppercase">{attraction.type}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-stone-900 mb-2 serif-font line-clamp-1">
                          {attraction.name}
                        </h3>

                        {attraction.description && (
                          <p className="text-sm text-stone-600 mb-4 line-clamp-2">
                            {attraction.description}
                          </p>
                        )}

                        {/* Details */}
                        <div className="space-y-2 mb-4">
                          {attraction.cityName && (
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                              <span className="material-icons text-xs">location_on</span>
                              <span>{attraction.cityName}</span>
                            </div>
                          )}

                          {attraction.houreOfOpening && attraction.houreOfClosing && (
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                              <span className="material-icons text-xs">schedule</span>
                              <span>{formatTime(attraction.houreOfOpening)} - {formatTime(attraction.houreOfClosing)}</span>
                            </div>
                          )}
                        </div>

                        {/* Explore Button */}
                        <button className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all group-hover:shadow-lg">
                          <span className="flex items-center justify-center gap-2">
                            Explore
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
                  {filteredAttractions.map((attraction) => (
                    <div
                      key={attraction.id}
                      onClick={() => navigateToDetail(attraction.id)}
                      className="bg-white rounded-xl border border-stone-200 hover:border-emerald-500 hover:shadow-lg transition-all p-6 cursor-pointer group"
                    >
                      <div className="flex items-center gap-6">
                        {/* Image */}
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={attraction.imageUrl || '/images/attraction-placeholder.jpg'}
                            alt={attraction.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-2xl font-bold text-stone-900 mb-1 serif-font">
                                {attraction.name}
                              </h3>
                              <div className="flex items-center gap-3">
                                {attraction.type && (
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                                    {attraction.type}
                                  </span>
                                )}
                                {attraction.cityName && (
                                  <div className="flex items-center gap-1 text-sm text-stone-500">
                                    <span className="material-icons text-xs">location_on</span>
                                    <span>{attraction.cityName}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {attraction.priceProxim !== undefined && (
                              <div className="text-right">
                                <div className="text-2xl font-bold text-emerald-600">
                                  {attraction.priceProxim === 0 ? 'FREE' : `${attraction.priceProxim}`}
                                </div>
                                {attraction.priceProxim > 0 && (
                                  <div className="text-xs text-stone-500">MAD</div>
                                )}
                              </div>
                            )}
                          </div>

                          {attraction.description && (
                            <p className="text-sm text-stone-600 mb-3 line-clamp-2">
                              {attraction.description}
                            </p>
                          )}

                          {/* Details Row */}
                          <div className="flex items-center gap-6">
                            {attraction.houreOfOpening && attraction.houreOfClosing && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="material-icons text-emerald-500" style={{fontSize: '18px'}}>schedule</span>
                                <span className="text-stone-700 font-medium">
                                  {formatTime(attraction.houreOfOpening)} - {formatTime(attraction.houreOfClosing)}
                                </span>
                              </div>
                            )}

                            {attraction.address && (
                              <div className="flex items-center gap-2 text-sm text-stone-500">
                                <span className="material-icons text-xs">place</span>
                                <span className="line-clamp-1">{attraction.address}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0">
                          <span className="material-icons text-stone-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
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
