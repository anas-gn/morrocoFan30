import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Hotels() {
  const router = useRouter();

  const [hotels, setHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalHotels: 0, totalCities: 0 });

  // Récupérer tous les hôtels
  useEffect(() => {
    setLoading(true);
    Promise.all([
     fetch('http://localhost:3309/api/hotels/all').then(res => res.json()).then(data => Array.isArray(data) ? data : data.content || data.hotels || []),
      fetch('http://localhost:3309/api/cities/all').then(res => res.json())
    ])
      .then(([hotelsData, citiesData]) => {
        setHotels(hotelsData);
        setFilteredHotels(hotelsData);
        setCities(citiesData);
        setStats({ totalHotels: hotelsData.length, totalCities: citiesData.length });
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur:', err);
        setLoading(false);
      });
  }, []);

  // Filtres
  useEffect(() => {
    let filtered = [...hotels];

    if (selectedCity !== 'all') {
      filtered = filtered.filter(h => h.cityHostId === parseInt(selectedCity));
    }

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(h =>
        h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.cityName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredHotels(filtered);
  }, [selectedCity, searchQuery, hotels]);

  const navigateToDetail = (id) => {
    router.push(`/hotels/${id}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <img src="/images/logo.png" alt="Loading" className="w-20 h-20 mb-4" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Hotels | MoroccoFan2030</title>
        <meta name="description" content="Find the best hotels across Morocco's 2030 World Cup host cities" />
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
        .image-overlay { position: relative; overflow: hidden; }
        .image-overlay::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%);
        }
        .hover-scale { transition: transform 0.3s ease; }
        .hover-scale:hover { transform: scale(1.02); }
      `}</style>

      <Navbar />

      {/* Hero Section */}
      <header className="relative pt-32 pb-12 border-b border-stone-200 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/cities-bg.jpg" alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/65"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="px-4 py-1.5 bg-white border border-stone-200 rounded-full flex items-center gap-2 shadow-sm">
              <span className="material-icons text-[#C1272D] text-sm">hotel</span>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">Hotels 2030</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 serif-font">
                Where to Stay
              </h1>
              <p className="text-lg text-white/80 max-w-xl">
                Discover the best hotels across Morocco's 2030 World Cup host cities — comfort and hospitality at your fingertips.
              </p>
            </div>
            {/* Stats */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-center">
                <div className="text-3xl font-bold text-white">{stats.totalHotels}</div>
                <div className="text-xs text-white/70 uppercase tracking-wider mt-1">Hotels</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-center">
                <div className="text-3xl font-bold text-white">{stats.totalCities}</div>
                <div className="text-xs text-white/70 uppercase tracking-wider mt-1">Cities</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters Bar */}
      <section className="sticky top-0 z-30 glass border-b border-stone-200 bg-pattern">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">search</span>
              <input
                type="text"
                placeholder="Search hotels..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-[#C1272D] focus:ring-2 focus:ring-[#C1272D]/10 transition-all"
              />
            </div>

            {/* City Filter */}
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-[#C1272D] focus:ring-2 focus:ring-[#C1272D]/10 transition-all cursor-pointer"
            >
              <option value="all">All Cities</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>

            {/* Count */}
            <div className="text-sm text-stone-500 font-medium whitespace-nowrap">
              {filteredHotels.length} hotel{filteredHotels.length !== 1 ? 's' : ''}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'grid' ? 'bg-white text-[#C1272D] shadow-sm' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <span className="material-icons text-sm">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'list' ? 'bg-white text-[#C1272D] shadow-sm' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <span className="material-icons text-sm">view_list</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hotels Section */}
      <section className="py-12 bg-gradient-to-br from-stone-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          {filteredHotels.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-stone-400 text-4xl">search_off</span>
              </div>
              <h3 className="text-xl font-medium text-stone-700 mb-2">No hotels found</h3>
              <p className="text-stone-500">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      onClick={() => navigateToDetail(hotel.id)}
                      className="bg-white rounded-2xl border-2 border-stone-200 hover:border-[#C1272D] hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 overflow-hidden cursor-pointer hover-scale group"
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden image-overlay">
                        <img
                          src={hotel.imageUrl || '/images/hotel-placeholder.jpg'}
                          alt={hotel.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {hotel.cityName && (
                          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                            <div className="flex items-center gap-2 text-white">
                              <span className="material-icons text-sm">location_city</span>
                              <span className="text-xs font-medium">{hotel.cityName}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-stone-900 mb-2 serif-font line-clamp-1">
                          {hotel.name}
                        </h3>

                        {hotel.description && (
                          <p className="text-sm text-stone-600 mb-4 line-clamp-3">
                            {hotel.description}
                          </p>
                        )}

                        <div className="space-y-2 mb-4">
                          {hotel.address && (
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                              <span className="material-icons text-xs">place</span>
                              <span className="line-clamp-1">{hotel.address}</span>
                            </div>
                          )}
                          {hotel.phone && (
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                              <span className="material-icons text-xs">phone</span>
                              <span>{hotel.phone}</span>
                            </div>
                          )}
                          {hotel.email && (
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                              <span className="material-icons text-xs">email</span>
                              <span className="line-clamp-1">{hotel.email}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button className="flex-1 px-4 py-2 bg-gradient-to-r from-stone-50 to-white border-2 border-stone-200 rounded-xl font-medium text-stone-700 hover:border-[#C1272D] hover:text-[#C1272D] transition-all group-hover:border-[#C1272D] text-sm">
                            <span className="flex items-center justify-center gap-2">
                              View Hotel
                              <span className="material-icons text-sm">arrow_forward</span>
                            </span>
                          </button>
                          {hotel.urlReservation && (
                            <a
                              href={hotel.urlReservation}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="px-4 py-2 bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm flex items-center gap-1"
                            >
                              <span className="material-icons text-sm">open_in_new</span>
                              Book
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-4">
                  {filteredHotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      onClick={() => navigateToDetail(hotel.id)}
                      className="bg-white rounded-xl border border-stone-200 hover:border-[#C1272D] hover:shadow-lg transition-all p-6 cursor-pointer group"
                    >
                      <div className="flex items-center gap-6">
                        {/* Image */}
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={hotel.imageUrl || '/images/hotel-placeholder.jpg'}
                            alt={hotel.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-2xl font-bold text-stone-900 mb-1 serif-font">
                                {hotel.name}
                              </h3>
                              <div className="flex items-center gap-3">
                                {hotel.cityName && (
                                  <div className="flex items-center gap-1 text-sm text-stone-500">
                                    <span className="material-icons text-xs">location_city</span>
                                    <span>{hotel.cityName}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {hotel.description && (
                            <p className="text-sm text-stone-600 mb-3 line-clamp-2">
                              {hotel.description}
                            </p>
                          )}

                          <div className="flex items-center gap-6">
                            {hotel.address && (
                              <div className="flex items-center gap-2 text-sm text-stone-500">
                                <span className="material-icons text-xs">place</span>
                                <span className="line-clamp-1">{hotel.address}</span>
                              </div>
                            )}
                            {hotel.phone && (
                              <div className="flex items-center gap-2 text-sm text-stone-500">
                                <span className="material-icons text-xs">phone</span>
                                <span>{hotel.phone}</span>
                              </div>
                            )}
                            {hotel.urlReservation && (
                              <a
                                href={hotel.urlReservation}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="flex items-center gap-1 text-sm text-[#C1272D] font-medium hover:underline"
                              >
                                <span className="material-icons text-xs">open_in_new</span>
                                Book Now
                              </a>
                            )}
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
