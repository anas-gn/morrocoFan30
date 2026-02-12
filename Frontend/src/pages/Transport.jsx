

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TransportPage = () => {
  const [transports, setTransports] = useState([]);
  const [cities, setCities] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [error, setError] = useState(null);
  const [selectedTransport, setSelectedTransport] = useState(null);

  const API_BASE = 'http://localhost:3309/api';

  // Récupérer tous les transports
  const fetchTransports = async (url = `${API_BASE}/transports`) => {
    setLoading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch transports');
      const data = await res.json();
      setTransports(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setTransports([]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer filtres : villes + routes
  const fetchFilters = async () => {
    try {
      // Cities from your API
      const cityRes = await fetch(`${API_BASE}/acceuil/CityHosts/all`);
      if (cityRes.ok) {
        const cityData = await cityRes.json();
        setCities(cityData);
      }

      // Routes static (car tu n’as pas de route API dédiée)
      setRoutes([
        { id: 1, name: 'Tanger - Casablanca (Al Boraq)' },
        { id: 2, name: 'Marrakech - Agadir Express' },
        { id: 3, name: 'Rabat Urban Hub' }
      ]);
    } catch (err) {
      console.error('Filter fetch error:', err);
    }
  };

  useEffect(() => {
    fetchTransports();
    fetchFilters();
  }, []);

  // Filtrer transports selon recherche ou select
  const handleSearch = () => {
    let url = `${API_BASE}/transports`;
    if (searchName) {
      url = `${API_BASE}/transports/search?name=${encodeURIComponent(searchName)}`;
    } else if (selectedCity !== 'all') {
      url = `${API_BASE}/transports/city/${selectedCity}`;
    } else if (selectedRoute !== 'all') {
      url = `${API_BASE}/transports/route/${selectedRoute}`;
    }
    fetchTransports(url);
  };

  // Reset filtres
  const resetFilters = () => {
    setSearchName('');
    setSelectedCity('all');
    setSelectedRoute('all');
    fetchTransports();
  };

  return (
    <>
    <Navbar/>
    
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Page Header */}
      <div className="relative pt-32 pb-16 bg-white overflow-hidden border-b border-stone-200">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-50 to-transparent pointer-events-none opacity-50" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                <a href="/" className="hover:text-[#C1272D] transition-colors">Home</a>
                <span className="material-icons text-[10px]">chevron_right</span>
                <span className="text-[#C1272D]">Transport</span>
              </nav>
              <h1 className="text-4xl md:text-6xl font-extrabold text-stone-900 tracking-tight leading-tight">
                Move with the <br />
                <span className="text-[#C1272D] italic serif-font">Rhythm of Morocco.</span>
              </h1>
              <p className="text-stone-600 text-lg leading-relaxed">
                Premium shuttles, high-speed rail, and local fan routes. 
                Experience seamless mobility between World Cup 2030 venues.
              </p>
            </div>
            
            <div className="hidden lg:flex items-center gap-6 pb-2">
              <div className="p-4 bg-white border border-stone-100 rounded-2xl shadow-sm text-center min-w-[120px]">
                <div className="text-2xl font-bold text-[#C1272D]">{transports.length}</div>
                <div className="text-[10px] font-bold text-stone-400 uppercase">Available Units</div>
              </div>
              <div className="p-4 bg-white border border-stone-100 rounded-2xl shadow-sm text-center min-w-[120px]">
                <div className="text-2xl font-bold text-[#006233]">{cities.length || 6}</div>
                <div className="text-[10px] font-bold text-stone-400 uppercase">Host Cities</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <section className="sticky top-20 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[260px] relative group">
              <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#C1272D] transition-colors">search</span>
              <input 
                type="text"
                placeholder="Search transport name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C1272D] focus:ring-4 focus:ring-red-500/5 outline-none transition-all text-sm font-medium"
              />
            </div>

            <div className="relative min-w-[160px]">
              <select 
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedRoute('all');
                }}
                className="w-full pl-4 pr-10 py-3 bg-white border border-stone-200 rounded-xl appearance-none text-sm font-bold text-stone-700 focus:border-[#006233] outline-none cursor-pointer"
              >
                <option value="all">All Host Cities</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
              <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">expand_more</span>
            </div>

            <div className="relative min-w-[160px]">
              <select 
                value={selectedRoute}
                onChange={(e) => {
                  setSelectedRoute(e.target.value);
                  setSelectedCity('all');
                }}
                className="w-full pl-4 pr-10 py-3 bg-white border border-stone-200 rounded-xl appearance-none text-sm font-bold text-stone-700 focus:border-amber-500 outline-none cursor-pointer"
              >
                <option value="all">All Transit Routes</option>
                {routes.map(route => (
                  <option key={route.id} value={route.id}>{route.name}</option>
                ))}
              </select>
              <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">expand_more</span>
            </div>

            <button 
              onClick={handleSearch}
              className="px-6 py-3 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-[#C1272D] transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-black/5"
            >
              Apply Filters
            </button>

            <button 
              onClick={resetFilters}
              className="p-3 text-stone-400 hover:text-[#C1272D] transition-colors"
              title="Reset Filters"
            >
              <span className="material-icons">restart_alt</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main List */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-3xl h-[450px] animate-pulse border border-stone-100" />
            ))}
          </div>
        ) : transports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
              <span className="material-icons text-4xl text-stone-300">commute</span>
            </div>
            <h3 className="text-xl font-bold text-stone-800">No Transport Matches Found</h3>
            <p className="text-stone-500 mt-2 max-w-sm mx-auto">
              We couldn't find any transport units for this selection. Try different filters.
            </p>
            <button onClick={resetFilters} className="mt-8 px-6 py-2 border-2 border-stone-200 rounded-full text-sm font-bold text-stone-600 hover:border-[#C1272D] hover:text-[#C1272D] transition-all">
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {transports.map((transport) => (
              <div 
                key={transport.id} 
                className="group relative bg-white rounded-[2rem] border border-stone-100 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col cursor-pointer"
                onClick={() => setSelectedTransport(transport)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={transport.imageUrl || `https://picsum.photos/seed/${transport.id}/600/400`} 
                    alt={transport.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-[#C1272D] rounded-full shadow-lg">
                      {transport.cityName}
                    </span>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-[#C1272D] transition-colors">{transport.name}</h3>
                    <div className="flex items-center gap-4 text-white/70 text-xs font-bold tracking-wide">
                      <div className="flex items-center gap-1">
                        <span className="material-icons text-[14px]">groups</span>
                        {transport.capacity} Seats
                      </div>
                      {transport.trajetName && (
                        <div className="flex items-center gap-1">
                          <span className="material-icons text-[14px]">route</span>
                          {transport.trajetName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <p className="text-stone-500 text-sm leading-relaxed mb-8 line-clamp-3">
                    {transport.description || "Official fan shuttle service operating with high-frequency between Fan Zones and Stadium entrances."}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Single Fare</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-[#006233]">{transport.priceProxim}</span>
                        <span className="text-xs font-bold text-stone-500">MAD</span>
                      </div>
                    </div>
                    <button className="h-12 w-12 rounded-full bg-stone-50 flex items-center justify-center text-[#C1272D] group-hover:bg-[#C1272D] group-hover:text-white transition-all shadow-inner border border-stone-100">
                      <span className="material-icons">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedTransport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" onClick={() => setSelectedTransport(null)} />
          <div className="relative bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            <button 
              className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-[#C1272D] transition-colors"
              onClick={() => setSelectedTransport(null)}
            >
              <span className="material-icons">close</span>
            </button>

            <div className="md:w-3/5 bg-stone-100 overflow-y-auto no-scrollbar h-[400px] md:h-auto">
              <div className="grid grid-cols-1 gap-2">
                <img src={selectedTransport.imageUrl || `https://picsum.photos/seed/${selectedTransport.id}/600/400`} className="w-full aspect-video object-cover" alt="Main" />
                {selectedTransport.images && selectedTransport.images.map((img, i) => (
                  <img key={i} src={img} className="w-full aspect-video object-cover" alt={`Gallery ${i}`} />
                ))}
              </div>
            </div>

            <div className="md:w-2/5 p-8 md:p-12 overflow-y-auto">
              <div className="mb-8">
                <span className="px-3 py-1 bg-[#006233]/10 text-[#006233] text-[10px] font-black uppercase rounded-full tracking-widest">Available Service</span>
                <h2 className="text-4xl font-bold text-stone-900 mt-4 leading-tight serif-font">{selectedTransport.name}</h2>
                <div className="flex items-center gap-2 text-[#C1272D] mt-2 font-bold">
                  <span className="material-icons text-sm">location_on</span>
                  {selectedTransport.cityName}
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-stone-50 rounded-2xl">
                    <div className="text-[10px] font-black text-stone-400 uppercase mb-1">Capacity</div>
                    <div className="text-lg font-bold text-stone-800">{selectedTransport.capacity} Fans</div>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-2xl">
                    <div className="text-[10px] font-black text-stone-400 uppercase mb-1">Pricing</div>
                    <div className="text-lg font-bold text-[#006233]">{selectedTransport.priceProxim} MAD</div>
                  </div>
                </div>

                <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-icons text-amber-600">route</span>
                    <span className="text-sm font-bold text-amber-900 uppercase tracking-wider">Assigned Route</span>
                  </div>
                  <p className="text-amber-800 font-medium">{selectedTransport.trajetName || "Local City Shuttle Hub"}</p>
                </div>

                <div>
                  <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3">Description</h4>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {selectedTransport.description || "Official premium fleet unit for Morocco 2030 World Cup."}
                  </p>
                </div>

                <button className="w-full py-4 bg-[#C1272D] text-white rounded-2xl font-bold text-lg shadow-xl shadow-red-500/20 hover:scale-[1.02] transition-transform">
                  RESERVE SPOT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    <Footer/>
    </>
  );
};

export default TransportPage;
