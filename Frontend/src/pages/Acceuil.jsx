import React, { useState, useEffect } from 'react';

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
  
  // ✅ Correction: Utiliser le bon port du backend Spring Boot
  const API_BASE = 'http://localhost:8080/api';

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

  // ✅ Récupérer villes et routes depuis la base de données
  const fetchFilters = async () => {
    try {
      // Récupérer les villes
      const cityRes = await fetch(`${API_BASE}/acceuil/CityHosts/all`);
      if (cityRes.ok) {
        const cityData = await cityRes.json();
        setCities(cityData);
      }

      // ✅ Récupérer les routes depuis votre API
      // Supposons que vous avez un endpoint pour les routes
      const routeRes = await fetch(`${API_BASE}/routes`);
      if (routeRes.ok) {
        const routeData = await routeRes.json();
        setRoutes(routeData);
      }
    } catch (err) {
      console.error('Filter fetch error:', err);
      setError('Failed to load filters');
    }
  };

  useEffect(() => {
    fetchTransports();
    fetchFilters();
  }, []);

  // Filtrer transports selon recherche ou select
  const handleSearch = () => {
    let url = `${API_BASE}/transports`;
    
    if (searchName.trim()) {
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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#C1272D] via-[#006233] to-amber-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 text-sm font-medium mb-4 opacity-90">
            <span>Home</span>
            <span className="material-icons text-base">chevron_right</span>
            <span>Transport</span>
          </div>
          
          <h1 className="text-5xl font-black mb-4 tracking-tight">
            Move with the Rhythm of Morocco.
          </h1>
          
          <p className="text-lg opacity-95 max-w-2xl mb-8">
            Premium shuttles, high-speed rail, and local fan routes. 
            Experience seamless mobility between World Cup 2030 venues.
          </p>

          <div className="flex gap-6">
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20">
              <div className="text-3xl font-black">{transports.length}</div>
              <div className="text-sm opacity-90">Available Units</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20">
              <div className="text-3xl font-black">{cities.length || 6}</div>
              <div className="text-sm opacity-90">Host Cities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-xl">
                search
              </span>
              <input
                type="text"
                placeholder="Search transport by name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl 
                         focus:bg-white focus:border-[#C1272D] focus:ring-4 focus:ring-red-500/5 
                         outline-none transition-all text-sm font-medium"
              />
            </div>

            {/* City Filter */}
            <div className="md:col-span-3 relative">
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedRoute('all');
                }}
                className="w-full pl-4 pr-10 py-3 bg-white border border-stone-200 rounded-xl 
                         appearance-none text-sm font-bold text-stone-700 focus:border-[#006233] 
                         outline-none cursor-pointer"
              >
                <option value="all">All Host Cities</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
              <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Route Filter */}
            <div className="md:col-span-3 relative">
              <select
                value={selectedRoute}
                onChange={(e) => {
                  setSelectedRoute(e.target.value);
                  setSelectedCity('all');
                }}
                className="w-full pl-4 pr-10 py-3 bg-white border border-stone-200 rounded-xl 
                         appearance-none text-sm font-bold text-stone-700 focus:border-amber-500 
                         outline-none cursor-pointer"
              >
                <option value="all">All Transit Routes</option>
                {routes.map(route => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
              <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-1 flex gap-2">
              <button
                onClick={handleSearch}
                className="flex-1 bg-gradient-to-r from-[#C1272D] to-red-600 text-white px-4 py-3 
                         rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all text-sm"
              >
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="px-3 py-3 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                title="Reset filters"
              >
                <span className="material-icons text-stone-600">restart_alt</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>

      {/* Main List */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-stone-200 animate-pulse">
                <div className="h-48 bg-stone-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-stone-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-stone-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : transports.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-icons text-9xl text-stone-300 mb-6">commute</span>
            <h3 className="text-2xl font-bold text-stone-700 mb-3">No Transport Matches Found</h3>
            <p className="text-stone-500 mb-6 max-w-md mx-auto">
              We couldn't find any transport units for this selection. Try different filters.
            </p>
            <button
              onClick={resetFilters}
              className="bg-gradient-to-r from-[#C1272D] to-red-600 text-white px-6 py-3 rounded-xl 
                       font-bold hover:shadow-lg transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {transports.map((transport) => (
              <div
                key={transport.id}
                onClick={() => setSelectedTransport(transport)}
                className="group bg-white rounded-2xl overflow-hidden border border-stone-200 
                         hover:border-[#C1272D] hover:shadow-2xl transition-all cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200">
                  {transport.imageUrl ? (
                    <img
                      src={transport.imageUrl}
                      alt={transport.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-icons text-6xl text-stone-400">directions_bus</span>
                    </div>
                  )}
                  
                  {/* City Badge */}
                  <div className="absolute top-4 left-4 bg-[#006233] text-white px-3 py-1 rounded-full text-xs font-bold">
                    {transport.cityName}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-black text-stone-800 mb-3 group-hover:text-[#C1272D] transition-colors">
                    {transport.name}
                  </h3>

                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <div className="flex items-center gap-1 text-stone-600">
                      <span className="material-icons text-base">groups</span>
                      <span className="font-bold">{transport.capacity} Seats</span>
                    </div>

                    {transport.trajetName && (
                      <div className="flex items-center gap-1 text-amber-600">
                        <span className="material-icons text-base">route</span>
                        <span className="font-bold text-xs">{transport.trajetName}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-stone-600 text-sm leading-relaxed mb-4 line-clamp-2">
                    {transport.description || "Official fan shuttle service operating with high-frequency between Fan Zones and Stadium entrances."}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                    <div>
                      <div className="text-xs text-stone-500 font-medium">Single Fare</div>
                      <div className="text-2xl font-black text-[#C1272D]">{transport.priceProxim} MAD</div>
                    </div>
                    <span className="material-icons text-3xl text-stone-300 group-hover:text-[#C1272D] group-hover:translate-x-2 transition-all">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTransport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedTransport(null)}
          />
          
          <div className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedTransport(null)}
              className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full 
                       hover:bg-red-500 hover:text-white transition-all shadow-lg"
            >
              <span className="material-icons">close</span>
            </button>

            {/* Image Gallery */}
            <div className="relative h-80 bg-gradient-to-br from-stone-800 to-stone-900">
              {selectedTransport.images && selectedTransport.images.length > 0 ? (
                <div className="grid grid-cols-1 h-full">
                  {selectedTransport.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${selectedTransport.name} - Image ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ))}
                </div>
              ) : selectedTransport.imageUrl ? (
                <img
                  src={selectedTransport.imageUrl}
                  alt={selectedTransport.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-icons text-9xl text-white/20">directions_bus</span>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute bottom-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full 
                            font-bold text-sm flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                Available Service
              </div>
            </div>

            {/* Details */}
            <div className="p-8">
              <h2 className="text-3xl font-black text-stone-800 mb-6">
                {selectedTransport.name}
              </h2>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-stone-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-[#006233] mb-2">
                    <span className="material-icons">location_on</span>
                    <span className="text-xs font-bold uppercase tracking-wide">Location</span>
                  </div>
                  <div className="text-lg font-black text-stone-800">{selectedTransport.cityName}</div>
                </div>

                <div className="bg-stone-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <span className="material-icons">groups</span>
                    <span className="text-xs font-bold uppercase tracking-wide">Capacity</span>
                  </div>
                  <div className="text-lg font-black text-stone-800">{selectedTransport.capacity} Fans</div>
                </div>

                <div className="bg-stone-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-[#C1272D] mb-2">
                    <span className="material-icons">payments</span>
                    <span className="text-xs font-bold uppercase tracking-wide">Pricing</span>
                  </div>
                  <div className="text-lg font-black text-stone-800">{selectedTransport.priceProxim} MAD</div>
                </div>

                <div className="bg-stone-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <span className="material-icons">route</span>
                    <span className="text-xs font-bold uppercase tracking-wide">Assigned Route</span>
                  </div>
                  <div className="text-sm font-black text-stone-800">
                    {selectedTransport.trajetName || "Local City Shuttle Hub"}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wide mb-3">
                  Description
                </h3>
                <p className="text-stone-700 leading-relaxed">
                  {selectedTransport.description || "Official premium fleet unit for Morocco 2030 World Cup."}
                </p>
              </div>

              <button className="w-full bg-gradient-to-r from-[#C1272D] to-red-600 text-white py-4 rounded-xl 
                               font-black text-lg hover:shadow-2xl hover:scale-105 transition-all">
                RESERVE SPOT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportPage;