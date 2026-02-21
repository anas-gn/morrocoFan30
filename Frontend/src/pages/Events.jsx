import React, { useState, useEffect, useCallback } from 'react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  MapPin,
  Calendar,
  Ticket,
  ImageIcon,
  CalendarDays,
} from 'lucide-react';

const API_BASE = 'https://anas-gana1-fandb-backend.hf.space/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return 'Date to be confirmed';
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr));
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(dateStr));
};

// ─── Filters ──────────────────────────────────────────────────────────────────

function EventFilters({ search, onSearchChange, cityId, onCityChange, cities, isFiltering, total, onEnter }) {
  return (
    <div className="sticky top-16 z-40 w-full px-6 py-4">
      <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl p-3 rounded-[2.5rem] border border-stone-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search for festivals, fan zones..."
            className="w-full pl-14 pr-6 py-4 bg-stone-50 rounded-3xl outline-none focus:ring-2 focus:ring-red-600/20 transition-all font-medium text-stone-700"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
          />
        </div>

        <select
          className="px-6 py-4 bg-stone-50 rounded-3xl outline-none min-w-[200px] font-bold text-stone-700 cursor-pointer"
          value={cityId}
          onChange={(e) => onCityChange(e.target.value)}
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {isFiltering && (
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-2">
            {total} result{total !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventCard({ event, onSelect }) {
  return (
    <article
      className="group cursor-pointer flex flex-col"
      onClick={() => onSelect(event)}
    >
      <div className="relative aspect-[4/3] overflow-hidden mb-5 bg-stone-100">
        <img
          src={event.imageUrl || `https://picsum.photos/seed/${event.id}/800/600`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt={event.name}
        />
        <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-300" />

        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-stone-800 text-[10px] font-bold uppercase tracking-widest">
            {event.cityName}
          </span>
        </div>

        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold">
            {event.priceProxim} MAD
          </span>
        </div>

        <div className="absolute bottom-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <ArrowUpRight className="w-4 h-4 text-stone-900" />
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <MapPin className="w-3 h-3 text-red-600" />
          {event.cityName || 'Morocco'}
          {event.dateOfEvent && (
            <>
              <span className="w-1 h-1 bg-stone-300 rounded-full" />
              <Calendar className="w-3 h-3" />
              {formatDateShort(event.dateOfEvent)}
            </>
          )}
        </div>
        <h3 className="text-lg font-serif font-bold text-stone-900 leading-snug mb-3 group-hover:text-red-600 transition-colors duration-200">
          {event.name}
        </h3>
        <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed mb-4">
          {event.description || 'Discover a unique experience combining Moroccan culture and global football passion.'}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-stone-700 group-hover:text-red-600 transition-colors duration-200">
            Discover
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-red-600">
            {event.priceProxim} MAD
          </span>
        </div>
      </div>
    </article>
  );
}

// ─── Event Modal ──────────────────────────────────────────────────────────────

function EventModal({ event, onClose, onPrev, onNext, hasPrev, hasNext }) {
  const [currentImage, setCurrentImage] = useState(0);

  const allImages = [
    event.imageUrl || `https://picsum.photos/seed/${event.id}/800/600`,
    `https://picsum.photos/seed/${event.id}-1/800/600`,
    `https://picsum.photos/seed/${event.id}-2/800/600`,
    `https://picsum.photos/seed/${event.id}-3/800/600`,
  ];

  useEffect(() => {
    setCurrentImage(0);
  }, [event.id]);

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
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 md:right-8 z-[110] w-12 h-12 bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <div className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">
        <button
          className="absolute top-5 right-5 z-[110] w-10 h-10 bg-stone-100 text-stone-700 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image panel */}
        <div className="md:w-5/12 h-72 md:h-auto bg-stone-100 relative flex-shrink-0">
          <img
            src={allImages[currentImage]}
            className="w-full h-full object-cover transition-opacity duration-300"
            alt={event.name}
          />
          <div className="absolute top-5 left-5">
            <span className="px-4 py-2 bg-red-600 text-white text-sm font-bold">
              {event.priceProxim} MAD
            </span>
          </div>

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
        </div>

        {/* Content panel */}
        <div className="md:w-7/12 p-8 md:p-12 overflow-y-auto flex flex-col">
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-widest">
                <CalendarDays className="w-3 h-3" />
                Official Event
              </span>
              {event.cityName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-widest">
                  <MapPin className="w-3 h-3" />
                  {event.cityName}
                </span>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 leading-tight mb-6">
              {event.name}
            </h2>

            <div className="flex items-center gap-6 py-4 border-y border-stone-100">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Price</span>
                <span className="text-xl font-bold text-red-600">
                  {event.priceProxim} <span className="text-xs text-stone-400">MAD</span>
                </span>
              </div>
              <div className="w-px h-10 bg-stone-100" />
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">City</span>
                <span className="text-sm font-semibold text-stone-800">{event.cityName || 'Morocco'}</span>
              </div>
              {event.dateOfEvent && (
                <>
                  <div className="w-px h-10 bg-stone-100" />
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Date</span>
                    <span className="text-sm font-semibold text-stone-800">{formatDateShort(event.dateOfEvent)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mb-8 flex-1">
            {event.dateOfEvent && (
              <div className="flex items-center gap-3 px-5 py-4 bg-stone-50 border border-stone-100 mb-6">
                <Calendar className="w-4 h-4 text-red-600 flex-shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-0.5">Schedule</span>
                  <span className="text-sm font-semibold text-stone-800">{formatDate(event.dateOfEvent)}</span>
                </div>
              </div>
            )}
            <p className="text-stone-600 font-medium text-base leading-relaxed italic border-l-2 border-red-600 pl-5">
              {event.description || 'Discover a unique experience combining Moroccan culture and global football passion.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-400 font-medium mt-4">
              <ImageIcon className="w-4 h-4" />
              {allImages.length} photos available
            </div>
          </div>

          <div className="pt-6 border-t border-stone-100 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-red-600" />
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                Morocco 2030 Events
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

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [cityId, setCityId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/events?`;
      if (cityId) url += `cityId=${cityId}&`;
      if (search) url += `search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load events');
      setEvents(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await fetch(`${API_BASE}/acceuil/CityHosts/all`);
      if (res.ok) setCities(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchEvents();
    fetchCities();
  }, [cityId]);

  const isFiltering = search !== '' || cityId !== '';

  const scrollToEvents = () => {
    document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const selectedIndex = selectedEvent
    ? events.findIndex((e) => e.id === selectedEvent.id)
    : -1;

  const handlePrev = useCallback(() => {
    if (selectedIndex > 0) setSelectedEvent(events[selectedIndex - 1]);
  }, [selectedIndex, events]);

  const handleNext = useCallback(() => {
    if (selectedIndex < events.length - 1) setSelectedEvent(events[selectedIndex + 1]);
  }, [selectedIndex, events]);

  return (
    <>
      <Navbar />

      {/* ── ORIGINAL HEADER — untouched ── */}
      <header className="relative w-full h-[50vh] overflow-hidden flex items-center mt-20">
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="/images/event-poster.jpg"
        >
          <source src="/videos/Event.mp4" type="video/mp4" />
          Your browser does not support video playback.
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="relative z-10 w-full px-6">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight leading-[1.1]">
                Celebrate the{' '}
                <span className="block mt-2 text-[#C1272D] italic font-serif">
                  Magic of Morocco
                </span>
              </h1>
              <p className="text-white/90 text-base sm:text-lg md:text-xl leading-relaxed mb-6 max-w-2xl">
                Cultural festivals, fan zones and exclusive galas.
                Don't miss the World Cup 2030 atmosphere.
              </p>
              <button
                onClick={scrollToEvents}
                className="group px-8 md:px-10 py-3 md:py-4 bg-[#C1272D] text-white font-bold rounded-full uppercase text-xs md:text-sm tracking-widest shadow-2xl hover:bg-[#A01F24] transition-all duration-300 hover:shadow-[0_0_30px_rgba(193,39,45,0.5)] hover:scale-105 active:scale-100"
              >
                Discover Events
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce hidden md:block">
          <svg className="w-6 h-6 text-white/70" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </header>

      {/* ── NEW STYLE BODY ── */}
      <div id="events-section" className="min-h-screen bg-stone-50 flex flex-col scroll-mt-0">
        <EventFilters
          search={search}
          onSearchChange={setSearch}
          cityId={cityId}
          onCityChange={setCityId}
          cities={cities}
          isFiltering={isFiltering}
          total={events.length}
          onEnter={fetchEvents}
        />

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-6 pt-10 pb-24">
            {/* Section header — always visible */}
            <div className="flex items-end justify-between mb-10 border-b border-stone-200 pb-6">
              <div>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-[0.4em] mb-1 block">
                  World Cup 2030
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                  {isFiltering ? `Results (${events.length})` : 'Official Events'}
                </h2>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-stone-300 uppercase tracking-widest">
                <Ticket className="w-3.5 h-3.5" />
                {events.length} events
              </div>
            </div>

            {/* Cards */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-4 animate-pulse">
                    <div className="aspect-[4/3] w-full bg-stone-200" />
                    <div className="h-3 w-24 bg-stone-200" />
                    <div className="h-5 w-full bg-stone-200" />
                    <div className="h-4 w-3/4 bg-stone-200" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="py-20 text-center">
                <p className="text-red-500 font-semibold">{error}</p>
              </div>
            ) : events.length === 0 ? (
              <div className="py-20 text-center">
                <CalendarDays className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-400 font-semibold text-sm uppercase tracking-widest">
                  No events match your criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} onSelect={setSelectedEvent} />
                ))}
              </div>
            )}
          </div>
        </main>

        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onPrev={handlePrev}
            onNext={handleNext}
            hasPrev={selectedIndex > 0}
            hasNext={selectedIndex < events.length - 1}
          />
        )}
      </div>

      <Footer />
    </>
  );
};

export default EventsPage;