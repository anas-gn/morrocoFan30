import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Bus,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  MapPin,
  Users,
  Route,
  RotateCcw,
} from 'lucide-react';

const API_BASE = 'https://anas-gana1-fandb-backend.hf.space/api';

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection({ transports, onSelect }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const featured = transports.slice(0, 3);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev === featured.length - 1 ? 0 : prev + 1));
  }, [featured.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? featured.length - 1 : prev - 1));
  }, [featured.length]);

  useEffect(() => {
    if (featured.length === 0) return;
    const interval = setInterval(goNext, 6000);
    return () => clearInterval(interval);
  }, [featured.length, goNext]);

  if (featured.length === 0) return null;

  return (
    <section className="relative w-full h-[65vh] min-h-[480px] overflow-hidden bg-stone-900 mt-16">
      {featured.map((item, idx) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            idx === activeIndex ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
          }`}
        >
          <img
            src={item.imageUrl || `https://picsum.photos/seed/${item.id}/1400/700`}
            className="w-full h-full object-cover brightness-[0.3]"
            alt={item.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute inset-0 flex items-end">
            <div className="w-full max-w-7xl mx-auto px-6 pb-20 lg:pb-24">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest">
                    {item.cityName}
                  </span>
                  {item.trajetName && (
                    <span className="text-white/50 text-xs font-medium tracking-wide flex items-center gap-1.5">
                      <Route className="w-3 h-3" />
                      {item.trajetName}
                    </span>
                  )}
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight tracking-tight mb-4">
                  {item.name}
                </h2>
                <p className="text-white/60 text-base md:text-lg max-w-2xl line-clamp-2 leading-relaxed mb-6">
                  {item.description || 'Official fan shuttle service operating with high-frequency between Fan Zones and Stadium entrances.'}
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onSelect(item)}
                    className="group inline-flex items-center gap-3 px-7 py-3.5 bg-white text-stone-900 font-semibold text-sm hover:bg-red-600 hover:text-white transition-all duration-300"
                  >
                    View details
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                  <span className="text-white/80 text-2xl font-serif font-bold">
                    {item.priceProxim} <span className="text-base text-white/50">MAD</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-8 z-20">
        <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-end gap-8">
          <div className="flex gap-2">
            {featured.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-0.5 rounded-full transition-all duration-500 ${
                  i === activeIndex ? 'bg-red-600 w-10' : 'bg-white/25 w-4 hover:bg-white/40'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={goPrev}
              className="w-11 h-11 border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goNext}
              className="w-11 h-11 border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Filters ──────────────────────────────────────────────────────────────────

const STATIC_ROUTES = [
  { id: 1, name: 'Tanger - Casablanca (Al Boraq)' },
  { id: 2, name: 'Marrakech - Agadir Express' },
  { id: 3, name: 'Rabat Urban Hub' },
];

function TransportFilters({
  search, onSearchChange,
  cityId, onCityChange,
  routeId, onRouteChange,
  cities, onReset,
  isFiltering, total,
}) {
  return (
    <div className="sticky top-16 z-40 w-full px-6 py-4">
      <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl p-3 rounded-[2.5rem] border border-stone-200 shadow-sm flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search a transport, route..."
            className="w-full pl-14 pr-6 py-4 bg-stone-50 rounded-3xl outline-none focus:ring-2 focus:ring-red-600/20 transition-all font-medium text-stone-700"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* City filter */}
        <select
          className="px-6 py-4 bg-stone-50 rounded-3xl outline-none min-w-[180px] font-bold text-stone-700 cursor-pointer"
          value={cityId}
          onChange={(e) => { onCityChange(e.target.value); onRouteChange(''); }}
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Route filter */}
        <select
          className="px-6 py-4 bg-stone-50 rounded-3xl outline-none min-w-[200px] font-bold text-stone-700 cursor-pointer"
          value={routeId}
          onChange={(e) => { onRouteChange(e.target.value); onCityChange(''); }}
        >
          <option value="">All Routes</option>
          {STATIC_ROUTES.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        {/* Reset */}
        {isFiltering && (
          <>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-2">
              {total} result{total !== 1 ? 's' : ''}
            </span>
            <button
              onClick={onReset}
              className="w-11 h-11 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all"
              title="Reset filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Transport Card ────────────────────────────────────────────────────────────

function TransportCard({ transport, onSelect }) {
  return (
    <article
      className="group cursor-pointer flex flex-col"
      onClick={() => onSelect(transport)}
    >
      <div className="relative aspect-[4/3] overflow-hidden mb-5 bg-stone-100">
        <img
          src={transport.imageUrl || `https://picsum.photos/seed/${transport.id}/600/400`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt={transport.name}
        />
        <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-300" />

        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-stone-800 text-[10px] font-bold uppercase tracking-widest">
            {transport.cityName}
          </span>
        </div>

        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold">
            {transport.priceProxim} MAD
          </span>
        </div>

        {transport.capacity && (
          <div className="absolute bottom-4 left-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold">
              <Users className="w-3 h-3" />
              {transport.capacity} seats
            </span>
          </div>
        )}

        <div className="absolute bottom-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <ArrowUpRight className="w-4 h-4 text-stone-900" />
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <MapPin className="w-3 h-3 text-red-600" />
          {transport.cityName || 'Morocco'}
          {transport.trajetName && (
            <>
              <span className="w-1 h-1 bg-stone-300 rounded-full" />
              <Route className="w-3 h-3 text-stone-400" />
              {transport.trajetName}
            </>
          )}
        </div>
        <h3 className="text-lg font-serif font-bold text-stone-900 leading-snug mb-3 group-hover:text-red-600 transition-colors duration-200">
          {transport.name}
        </h3>
        <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed mb-4">
          {transport.description || 'Official fan shuttle service operating with high-frequency between Fan Zones and Stadium entrances.'}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-stone-700 group-hover:text-red-600 transition-colors duration-200">
            View details
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-red-600">
            {transport.priceProxim} MAD
          </span>
        </div>
      </div>
    </article>
  );
}

// ─── Transport Modal ───────────────────────────────────────────────────────────

function TransportModal({ transport, onClose, onPrev, onNext, hasPrev, hasNext }) {
  const [currentImage, setCurrentImage] = useState(0);
  const allImages = [
    transport.imageUrl || `https://picsum.photos/seed/${transport.id}/800/500`,
    ...(transport.images || []),
  ];

  useEffect(() => {
    setCurrentImage(0);
  }, [transport.id]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev?.();
      if (e.key === 'ArrowRight') onNext?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-sm" onClick={onClose} />

      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 md:left-8 z-[110] w-12 h-12 bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all backdrop-blur-sm"
          aria-label="Previous transport"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 md:right-8 z-[110] w-12 h-12 bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all backdrop-blur-sm"
          aria-label="Next transport"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <div className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Close */}
        <button
          className="absolute top-5 right-5 z-[110] w-10 h-10 bg-stone-100 text-stone-700 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image panel */}
        <div className="md:w-5/12 h-72 md:h-auto bg-stone-100 relative flex-shrink-0">
          <img
            src={allImages[currentImage]}
            className="w-full h-full object-cover transition-opacity duration-300"
            alt={transport.name}
          />
          <div className="absolute top-5 left-5">
            <span className="px-4 py-2 bg-red-600 text-white text-lg font-bold">
              {transport.priceProxim} MAD
            </span>
          </div>

          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImage((p) => (p === 0 ? allImages.length - 1 : p - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-red-600 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentImage((p) => (p === allImages.length - 1 ? 0 : p + 1))}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-red-600 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute top-5 right-5 px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold tracking-widest">
                {currentImage + 1} / {allImages.length}
              </div>
              <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === currentImage ? 'bg-red-600 w-4 h-1.5' : 'bg-white/50 w-1.5 h-1.5 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`h-12 w-16 flex-shrink-0 overflow-hidden border-2 transition-all ${
                      i === currentImage ? 'border-red-600' : 'border-white/20 hover:border-white'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content panel */}
        <div className="md:w-7/12 p-8 md:p-12 overflow-y-auto flex flex-col">
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-widest">
                <Bus className="w-3 h-3" />
                Transport
              </span>
              {transport.cityName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-widest">
                  <MapPin className="w-3 h-3" />
                  {transport.cityName}
                </span>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 leading-tight mb-6">
              {transport.name}
            </h2>

            <div className="flex items-center gap-6 py-4 border-y border-stone-100">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Fare</span>
                <span className="text-xl font-bold text-red-600">
                  {transport.priceProxim} <span className="text-xs text-stone-400">MAD</span>
                </span>
              </div>
              <div className="w-px h-10 bg-stone-100" />
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">City</span>
                <span className="text-sm font-semibold text-stone-800">{transport.cityName || 'Morocco'}</span>
              </div>
              <div className="w-px h-10 bg-stone-100" />
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Capacity</span>
                <span className="text-sm font-semibold text-stone-800">{transport.capacity ?? '—'} seats</span>
              </div>
            </div>
          </div>

          <div className="mb-8 flex-1">
            <p className="text-stone-600 font-medium text-base leading-relaxed italic border-l-2 border-red-600 pl-5 mb-6">
              {transport.description || 'Official premium fleet unit for Morocco 2030 World Cup. Connecting fans between stadiums, fan zones, and city centers with comfort and speed.'}
            </p>
            {transport.trajetName && (
              <div className="flex items-center gap-3 px-5 py-4 bg-amber-50 border border-amber-100 mt-4">
                <Route className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest block mb-0.5">Assigned Route</span>
                  <span className="text-sm font-semibold text-stone-800">{transport.trajetName}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-stone-100 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-red-600" />
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                Morocco 2030 Mobility
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onPrev}
                disabled={!hasPrev}
                className="w-9 h-9 border border-stone-200 text-stone-500 flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onNext}
                disabled={!hasNext}
                className="w-9 h-9 border border-stone-200 text-stone-500 flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const TransportPage = () => {
  const [transports, setTransports] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityId, setCityId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [selectedTransport, setSelectedTransport] = useState(null);

  // Fetch cities once
  useEffect(() => {
    fetch(`${API_BASE}/acceuil/CityHosts/all`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        const list = Array.isArray(data) ? data
          : Array.isArray(data?.data) ? data.data
          : [];
        setCities(list);
      })
      .catch(() => setCities([]));
  }, []);

  // Fetch transports on filter change
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        let url = `${API_BASE}/transports`;
        if (search.trim()) {
          url = `${API_BASE}/transports/search?name=${encodeURIComponent(search)}`;
        } else if (cityId) {
          url = `${API_BASE}/transports/city/${cityId}`;
        } else if (routeId) {
          url = `${API_BASE}/transports/route/${routeId}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        const list = Array.isArray(data) ? data
          : Array.isArray(data?.data) ? data.data
          : Array.isArray(data?.transports) ? data.transports
          : [];
        if (!cancelled) setTransports(list);
      } catch (err) {
        console.error('Transport Error:', err);
        if (!cancelled) setTransports([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const timer = setTimeout(load, search ? 400 : 0);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [search, cityId, routeId]);

  const isFiltering = search !== '' || cityId !== '' || routeId !== '';

  const handleReset = () => {
    setSearch('');
    setCityId('');
    setRouteId('');
  };

  const selectedIndex = selectedTransport
    ? transports.findIndex((t) => t.id === selectedTransport.id)
    : -1;

  const handlePrev = useCallback(() => {
    if (selectedIndex > 0) setSelectedTransport(transports[selectedIndex - 1]);
  }, [selectedIndex, transports]);

  const handleNext = useCallback(() => {
    if (selectedIndex < transports.length - 1) setSelectedTransport(transports[selectedIndex + 1]);
  }, [selectedIndex, transports]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-stone-50 flex flex-col">
        {!loading && transports.length > 0 && (
          <HeroSection transports={transports} onSelect={setSelectedTransport} />
        )}

        <TransportFilters
          search={search}
          onSearchChange={setSearch}
          cityId={cityId}
          onCityChange={setCityId}
          routeId={routeId}
          onRouteChange={setRouteId}
          cities={cities}
          onReset={handleReset}
          isFiltering={isFiltering}
          total={transports.length}
        />

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-6 pt-10 pb-24">
            {/* Section header */}
            <div className="flex items-end justify-between mb-10 border-b border-stone-200 pb-6">
              <div>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-[0.4em] mb-1 block">
                  Mobility & Connections
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                  {isFiltering ? `Results (${transports.length})` : 'Official Transport Services'}
                </h2>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-stone-300 uppercase tracking-widest">
                <Bus className="w-3.5 h-3.5" />
                {transports.length} units
              </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-4 animate-pulse">
                    <div className="aspect-[4/3] w-full bg-stone-200" />
                    <div className="h-3 w-24 bg-stone-200" />
                    <div className="h-5 w-full bg-stone-200" />
                    <div className="h-4 w-3/4 bg-stone-200" />
                  </div>
                ))
              ) : transports.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <Bus className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-400 font-semibold text-sm uppercase tracking-widest">
                    No transport matches your criteria
                  </p>
                  {isFiltering && (
                    <button
                      onClick={handleReset}
                      className="mt-6 px-6 py-2 border-2 border-stone-200 text-sm font-bold text-stone-600 hover:border-red-600 hover:text-red-600 transition-all"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              ) : (
                transports.map((transport) => (
                  <TransportCard
                    key={transport.id}
                    transport={transport}
                    onSelect={setSelectedTransport}
                  />
                ))
              )}
            </div>
          </div>
        </main>

        {selectedTransport && (
          <TransportModal
            transport={selectedTransport}
            onClose={() => setSelectedTransport(null)}
            onPrev={handlePrev}
            onNext={handleNext}
            hasPrev={selectedIndex > 0}
            hasNext={selectedIndex < transports.length - 1}
          />
        )}
      </div>

      <Footer />
    </>
  );
};

export default TransportPage;