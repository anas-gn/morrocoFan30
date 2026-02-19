import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Newspaper,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Calendar,
  User,
  ImageIcon,
} from 'lucide-react';

const API_BASE = 'http://localhost:3309/api/news';
const TEAMS_API = 'http://localhost:3309/api/teams/teams/all';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(dateStr));
};

const getImageUrl = (news) => {
  if (news.images && Array.isArray(news.images) && news.images.length > 0) return news.images[0];
  return news.image || news.imageUrl || news.thumbnail || null;
};

const getAllImages = (news) => {
  const main = getImageUrl(news);
  const extras = Array.isArray(news.images) ? news.images : [];
  return main ? [main, ...extras.filter(i => i !== main)] : extras;
};

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection({ newsList, onSelect }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const featured = newsList.slice(0, 3);

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
      {featured.map((item, idx) => {
        const imageUrl = getImageUrl(item);
        return (
          <div
            key={item.id || idx}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              idx === activeIndex ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
            }`}
          >
            {imageUrl && (
              <img
                src={imageUrl}
                className="w-full h-full object-cover brightness-[0.3]"
                alt={item.title}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute inset-0 flex items-end">
              <div className="w-full max-w-7xl mx-auto px-6 pb-20 lg:pb-24">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-3 mb-4">
                    {item.teamName && (
                      <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest">
                        {item.teamName}
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
                      className="group inline-flex items-center gap-3 px-7 py-3.5 bg-white text-stone-900 font-semibold text-sm hover:bg-red-600 hover:text-white transition-all duration-300"
                    >
                      Read article
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
        );
      })}

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

function NewsFilters({ search, onSearchChange, teamId, onTeamChange, teams, isFiltering, total }) {
  return (
    <div className="sticky top-16 z-40 w-full px-6 py-4">
      <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl p-3 rounded-[2.5rem] border border-stone-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search articles or authors..."
            className="w-full pl-14 pr-6 py-4 bg-stone-50 rounded-3xl outline-none focus:ring-2 focus:ring-red-600/20 transition-all font-medium text-stone-700"
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

// ─── News Card ────────────────────────────────────────────────────────────────

function NewsCard({ news, onSelect }) {
  const imageUrl = getImageUrl(news);

  return (
    <article
      className="group cursor-pointer flex flex-col"
      onClick={() => onSelect(news)}
    >
      <div className="relative aspect-[4/3] overflow-hidden mb-5 bg-stone-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt={news.title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-200">
            <ImageIcon className="w-10 h-10 text-stone-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-300" />

        {news.teamName && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-stone-800 text-[10px] font-bold uppercase tracking-widest">
              {news.teamName}
            </span>
          </div>
        )}

        {news.dateOfCreation && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold">
              {formatDate(news.dateOfCreation)}
            </span>
          </div>
        )}

        <div className="absolute bottom-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <ArrowUpRight className="w-4 h-4 text-stone-900" />
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          {news.author && (
            <>
              <User className="w-3 h-3 text-red-600" />
              {news.author}
              <span className="w-1 h-1 bg-stone-300 rounded-full" />
            </>
          )}
          {news.teamName && <span>{news.teamName}</span>}
        </div>
        <h3 className="text-lg font-serif font-bold text-stone-900 leading-snug mb-3 group-hover:text-red-600 transition-colors duration-200 line-clamp-2">
          {news.title || 'Untitled'}
        </h3>
        <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed mb-4">
          {news.description || ''}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-stone-700 group-hover:text-red-600 transition-colors duration-200">
            Read more
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          {news.dateOfCreation && (
            <span className="text-xs text-stone-400 font-medium">
              {formatDate(news.dateOfCreation)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── News Modal ───────────────────────────────────────────────────────────────

function NewsModal({ news, onClose, onPrev, onNext, hasPrev, hasNext }) {
  const [currentImage, setCurrentImage] = useState(0);
  const allImages = getAllImages(news);

  useEffect(() => {
    setCurrentImage(0);
  }, [news.id]);

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
          {allImages.length > 0 ? (
            <img
              src={allImages[currentImage]}
              className="w-full h-full object-cover transition-opacity duration-300"
              alt={news.title}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-200">
              <ImageIcon className="w-12 h-12 text-stone-400" />
            </div>
          )}

          {news.dateOfCreation && (
            <div className="absolute top-5 left-5">
              <span className="px-4 py-2 bg-red-600 text-white text-sm font-bold">
                {formatDate(news.dateOfCreation)}
              </span>
            </div>
          )}

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
                <Newspaper className="w-3 h-3" />
                Article
              </span>
              {news.teamName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-widest">
                  {news.teamName}
                </span>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 leading-tight mb-6">
              {news.title || 'Untitled'}
            </h2>

            <div className="flex items-center gap-6 py-4 border-y border-stone-100">
              {news.author && (
                <>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Author</span>
                    <span className="text-sm font-semibold text-stone-800">{news.author}</span>
                  </div>
                  <div className="w-px h-10 bg-stone-100" />
                </>
              )}
              {news.dateOfCreation && (
                <>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Date</span>
                    <span className="text-sm font-semibold text-stone-800">{formatDate(news.dateOfCreation)}</span>
                  </div>
                  <div className="w-px h-10 bg-stone-100" />
                </>
              )}
              {news.teamName && (
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Team</span>
                  <span className="text-sm font-semibold text-stone-800">{news.teamName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8 flex-1">
            {news.description && (
              <p className="text-stone-600 font-medium text-base leading-relaxed italic border-l-2 border-red-600 pl-5 mb-6">
                {news.description}
              </p>
            )}
            {news.detail && (
              <p className="text-stone-600 text-sm leading-relaxed">
                {news.detail}
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
              <div className="w-1 h-4 bg-red-600" />
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                Morocco 2030 News
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

const NewsPage = () => {
  const [newsList, setNewsList] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [teamId, setTeamId] = useState('');
  const [selectedNews, setSelectedNews] = useState(null);

  // Fetch teams
  useEffect(() => {
    fetch(TEAMS_API)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setTeams(Array.isArray(data) ? data : []))
      .catch(() => setTeams([]));
  }, []);

  // Fetch news
  useEffect(() => {
    setLoading(true);
    fetch(API_BASE)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setNewsList(Array.isArray(data) ? data : []))
      .catch(() => setNewsList([]))
      .finally(() => setLoading(false));
  }, []);

  // Fallback: extract teams from news if API returned empty
  useEffect(() => {
    if (teams.length === 0 && newsList.length > 0) {
      const extracted = Array.from(new Set(newsList.map(n => n.teamId)))
        .map(id => {
          const item = newsList.find(n => n.teamId === id);
          return { id, name: item?.teamName };
        })
        .filter(t => t.id && t.name);
      if (extracted.length > 0) setTeams(extracted);
    }
  }, [newsList, teams]);

  const isFiltering = search !== '' || teamId !== '';

  const filteredNews = newsList.filter((n) => {
    const matchesSearch =
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.author?.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = teamId === '' || n.teamId === parseInt(teamId);
    return matchesSearch && matchesTeam;
  });

  const displayedNews = isFiltering ? filteredNews : newsList;

  const selectedIndex = selectedNews
    ? displayedNews.findIndex((n) => n.id === selectedNews.id)
    : -1;

  const handlePrev = useCallback(() => {
    if (selectedIndex > 0) setSelectedNews(displayedNews[selectedIndex - 1]);
  }, [selectedIndex, displayedNews]);

  const handleNext = useCallback(() => {
    if (selectedIndex < displayedNews.length - 1) setSelectedNews(displayedNews[selectedIndex + 1]);
  }, [selectedIndex, displayedNews]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-stone-50 flex flex-col">
        {/* Hero always visible */}
        {!loading && newsList.length > 0 && (
          <HeroSection newsList={newsList} onSelect={setSelectedNews} />
        )}

        <NewsFilters
          search={search}
          onSearchChange={setSearch}
          teamId={teamId}
          onTeamChange={setTeamId}
          teams={teams}
          isFiltering={isFiltering}
          total={filteredNews.length}
        />

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-6 pt-10 pb-24">
            {/* Section header — always visible */}
            <div className="flex items-end justify-between mb-10 border-b border-stone-200 pb-6">
              <div>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-[0.4em] mb-1 block">
                  Latest Updates
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                  {isFiltering ? `Results (${filteredNews.length})` : 'News Feed'}
                </h2>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-stone-300 uppercase tracking-widest">
                <Newspaper className="w-3.5 h-3.5" />
                {newsList.length} articles
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
              ) : displayedNews.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <Newspaper className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-400 font-semibold text-sm uppercase tracking-widest">
                    No articles match your criteria
                  </p>
                </div>
              ) : (
                displayedNews.map((news, idx) => (
                  <NewsCard key={news.id || idx} news={news} onSelect={setSelectedNews} />
                ))
              )}
            </div>
          </div>
        </main>

        {selectedNews && (
          <NewsModal
            news={selectedNews}
            onClose={() => setSelectedNews(null)}
            onPrev={handlePrev}
            onNext={handleNext}
            hasPrev={selectedIndex > 0}
            hasNext={selectedIndex < displayedNews.length - 1}
          />
        )}
      </div>

      <Footer />
    </>
  );
};

export default NewsPage;