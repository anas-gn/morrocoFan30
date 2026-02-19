import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Globe,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Calendar,
  User,
  ImageIcon,
  BookOpen,
} from 'lucide-react';

const API_BASE = 'http://localhost:3309/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(dateStr));
};

const getImageUrl = (culture) =>
  culture.imageUrl || `https://picsum.photos/seed/${culture.id}/800/600`;

const getAllImages = (culture) => {
  const main = getImageUrl(culture);
  const extras = Array.isArray(culture.images) ? culture.images.filter(i => i !== main) : [];
  return [main, ...extras];
};

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection({ cultures, onSelect }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const featured = cultures.slice(0, 3);

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
            src={getImageUrl(item)}
            className="w-full h-full object-cover brightness-[0.3]"
            alt={item.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute inset-0 flex items-end">
            <div className="w-full max-w-7xl mx-auto px-6 pb-20 lg:pb-24">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                  {item.team?.name && (
                    <span className="px-3 py-1 bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest">
                      {item.team.name}
                    </span>
                  )}
                  {item.team?.country && (
                    <span className="text-white/50 text-xs font-medium tracking-wide flex items-center gap-1.5">
                      <Globe className="w-3 h-3" />
                      {item.team.country}
                    </span>
                  )}
                  {item.dateOfCreation && (
                    <span className="text-white/50 text-xs font-medium tracking-wide flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.dateOfCreation)}
                    </span>
                  )}
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight tracking-tight mb-4">
                  {item.title || 'Untitled'}
                </h2>
                <p className="text-white/60 text-base md:text-lg max-w-2xl line-clamp-2 leading-relaxed mb-6">
                  {item.description || ''}
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onSelect(item)}
                    className="group inline-flex items-center gap-3 px-7 py-3.5 bg-white text-stone-900 font-semibold text-sm hover:bg-emerald-700 hover:text-white transition-all duration-300"
                  >
                    Explore culture
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                  {item.author && (
                    <span className="text-white/50 text-sm flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      {item.author}
                    </span>
                  )}
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
                  i === activeIndex ? 'bg-emerald-500 w-10' : 'bg-white/25 w-4 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={goPrev}
              className="w-11 h-11 border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goNext}
              className="w-11 h-11 border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all"
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

function CultureFilters({ search, onSearchChange, teamId, onTeamChange, teams, isFiltering, total }) {
  return (
    <div className="sticky top-16 z-40 w-full px-6 py-4">
      <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl p-3 rounded-[2.5rem] border border-stone-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search cultures, authors..."
            className="w-full pl-14 pr-6 py-4 bg-stone-50 rounded-3xl outline-none focus:ring-2 focus:ring-emerald-700/20 transition-all font-medium text-stone-700"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <select
          className="px-6 py-4 bg-stone-50 rounded-3xl outline-none min-w-[200px] font-bold text-stone-700 cursor-pointer"
          value={teamId}
          onChange={(e) => onTeamChange(e.target.value)}
        >
          <option value="">All Teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
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

// ─── Culture Card ─────────────────────────────────────────────────────────────

function CultureCard({ culture, onSelect }) {
  return (
    <article
      className="group cursor-pointer flex flex-col"
      onClick={() => onSelect(culture)}
    >
      <div className="relative aspect-[4/3] overflow-hidden mb-5 bg-stone-100">
        <img
          src={getImageUrl(culture)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt={culture.title}
        />
        <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-300" />

        {culture.team?.name && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-stone-800 text-[10px] font-bold uppercase tracking-widest">
              {culture.team.name}
            </span>
          </div>
        )}

        {culture.team?.country && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-emerald-700 text-white text-xs font-bold">
              {culture.team.country}
            </span>
          </div>
        )}

        <div className="absolute bottom-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <ArrowUpRight className="w-4 h-4 text-stone-900" />
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          {culture.author && (
            <>
              <User className="w-3 h-3 text-emerald-700" />
              {culture.author}
            </>
          )}
          {culture.author && culture.team?.name && (
            <span className="w-1 h-1 bg-stone-300 rounded-full" />
          )}
          {culture.team?.name && <span>{culture.team.name}</span>}
        </div>
        <h3 className="text-lg font-serif font-bold text-stone-900 leading-snug mb-3 group-hover:text-emerald-700 transition-colors duration-200 line-clamp-2">
          {culture.title || 'Untitled'}
        </h3>
        <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed mb-4">
          {culture.description || ''}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-stone-700 group-hover:text-emerald-700 transition-colors duration-200">
            Explore
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          {culture.dateOfCreation && (
            <span className="text-xs text-stone-400 font-medium">
              {formatDate(culture.dateOfCreation)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Culture Modal ────────────────────────────────────────────────────────────

function CultureModal({ culture, onClose, onPrev, onNext, hasPrev, hasNext }) {
  const [currentImage, setCurrentImage] = useState(0);
  const allImages = getAllImages(culture);

  useEffect(() => {
    setCurrentImage(0);
  }, [culture.id]);

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
          className="absolute top-5 right-5 z-[110] w-10 h-10 bg-stone-100 text-stone-700 flex items-center justify-center hover:bg-emerald-700 hover:text-white transition-all"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image panel */}
        <div className="md:w-5/12 h-72 md:h-auto bg-stone-100 relative flex-shrink-0">
          <img
            src={allImages[currentImage]}
            className="w-full h-full object-cover transition-opacity duration-300"
            alt={culture.title}
          />

          {culture.team?.country && (
            <div className="absolute top-5 left-5">
              <span className="px-4 py-2 bg-emerald-700 text-white text-sm font-bold">
                {culture.team.country}
              </span>
            </div>
          )}

          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImage((p) => (p === 0 ? allImages.length - 1 : p - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-emerald-700 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentImage((p) => (p === allImages.length - 1 ? 0 : p + 1))}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-emerald-700 transition-all"
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
                      i === currentImage ? 'bg-emerald-500 w-4 h-1.5' : 'bg-white/50 w-1.5 h-1.5 hover:bg-white/80'
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
                      i === currentImage ? 'border-emerald-500' : 'border-white/20 hover:border-white'
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
                <Globe className="w-3 h-3" />
                Culture
              </span>
              {culture.team?.name && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-widest">
                  {culture.team.name}
                </span>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 leading-tight mb-6">
              {culture.title || 'Untitled'}
            </h2>

            <div className="flex items-center gap-6 py-4 border-y border-stone-100">
              {culture.author && (
                <>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Author</span>
                    <span className="text-sm font-semibold text-stone-800">{culture.author}</span>
                  </div>
                  <div className="w-px h-10 bg-stone-100" />
                </>
              )}
              {culture.team?.name && (
                <>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Team</span>
                    <span className="text-sm font-semibold text-stone-800">{culture.team.name}</span>
                  </div>
                  <div className="w-px h-10 bg-stone-100" />
                </>
              )}
              {culture.team?.country && (
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Country</span>
                  <span className="text-sm font-semibold text-stone-800">{culture.team.country}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8 flex-1">
            {culture.description && (
              <p className="text-stone-600 font-medium text-base leading-relaxed italic border-l-2 border-emerald-700 pl-5 mb-6">
                {culture.description}
              </p>
            )}
            {culture.detail && (
              <p className="text-stone-600 text-sm leading-relaxed">
                {culture.detail}
              </p>
            )}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 text-xs text-stone-400 font-medium mt-4">
                <ImageIcon className="w-4 h-4" />
                {allImages.length} photos available
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-stone-100 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-emerald-700" />
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                Morocco 2030 Cultures
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onPrev}
                disabled={!hasPrev}
                className="w-9 h-9 border border-stone-200 text-stone-500 flex items-center justify-center hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onNext}
                disabled={!hasNext}
                className="w-9 h-9 border border-stone-200 text-stone-500 flex items-center justify-center hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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

const CulturePage = () => {
  const [cultures, setCultures] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [teamId, setTeamId] = useState('');
  const [selectedCulture, setSelectedCulture] = useState(null);

  // Fetch all cultures
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/cultures`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setCultures(Array.isArray(data) ? data : []))
      .catch(() => setCultures([]))
      .finally(() => setLoading(false));
  }, []);

  // Fetch teams
  useEffect(() => {
    fetch(`${API_BASE}/teams/teams/all`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setTeams(Array.isArray(data) ? data : []))
      .catch(() => setTeams([]));
  }, []);

  // Fallback: extract teams from cultures if API empty
  useEffect(() => {
    if (teams.length === 0 && cultures.length > 0) {
      const extracted = cultures
        .filter((c) => c.team)
        .map((c) => c.team)
        .filter((t, idx, arr) => arr.findIndex(x => x.id === t.id) === idx);
      if (extracted.length > 0) setTeams(extracted);
    }
  }, [cultures, teams]);

  const isFiltering = search !== '' || teamId !== '';

  const filteredCultures = cultures.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.author?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = teamId === '' || c.team?.id === parseInt(teamId);
    return matchesSearch && matchesTeam;
  });

  const displayedCultures = isFiltering ? filteredCultures : cultures;

  const selectedIndex = selectedCulture
    ? displayedCultures.findIndex((c) => c.id === selectedCulture.id)
    : -1;

  const handlePrev = useCallback(() => {
    if (selectedIndex > 0) setSelectedCulture(displayedCultures[selectedIndex - 1]);
  }, [selectedIndex, displayedCultures]);

  const handleNext = useCallback(() => {
    if (selectedIndex < displayedCultures.length - 1) setSelectedCulture(displayedCultures[selectedIndex + 1]);
  }, [selectedIndex, displayedCultures]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-stone-50 flex flex-col">
        {/* Hero always visible */}
        {!loading && cultures.length > 0 && (
          <HeroSection cultures={cultures} onSelect={setSelectedCulture} />
        )}

        <CultureFilters
          search={search}
          onSearchChange={setSearch}
          teamId={teamId}
          onTeamChange={setTeamId}
          teams={teams}
          isFiltering={isFiltering}
          total={filteredCultures.length}
        />

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-6 pt-10 pb-24">
            {/* Section header — always visible */}
            <div className="flex items-end justify-between mb-10 border-b border-stone-200 pb-6">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.4em] mb-1 block">
                  Heritage & Identity
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                  {isFiltering ? `Results (${filteredCultures.length})` : 'World Cultures'}
                </h2>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-stone-300 uppercase tracking-widest">
                <BookOpen className="w-3.5 h-3.5" />
                {cultures.length} cultures
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
              ) : displayedCultures.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <Globe className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-400 font-semibold text-sm uppercase tracking-widest">
                    No cultures match your criteria
                  </p>
                </div>
              ) : (
                displayedCultures.map((culture) => (
                  <CultureCard key={culture.id} culture={culture} onSelect={setSelectedCulture} />
                ))
              )}
            </div>
          </div>
        </main>

        {selectedCulture && (
          <CultureModal
            culture={selectedCulture}
            onClose={() => setSelectedCulture(null)}
            onPrev={handlePrev}
            onNext={handleNext}
            hasPrev={selectedIndex > 0}
            hasNext={selectedIndex < displayedCultures.length - 1}
          />
        )}
      </div>

      <Footer />
    </>
  );
};

export default CulturePage;