import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

export default function Favorites() {
  const router = useRouter();

  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [supporterId, setSupporterId] = useState(null);
  const [teamDetails, setTeamDetails] = useState({});
  const [matchDetails, setMatchDetails] = useState({});

  // Get current supporter ID from localStorage or session
  useEffect(() => {
    const id = localStorage.getItem('supporterId') || 1; // fallback to 1 for demo
    setSupporterId(parseInt(id));
  }, []);

  // Fetch all favorites for the supporter
  useEffect(() => {
    if (!supporterId) return;

    setLoading(true);
    fetch(`http://localhost:3309/api/favorites/${supporterId}`)
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setFavorites(arr);
        setLoading(false);

        // Fetch details for each favorite
        arr.forEach(fav => {
          if (fav.type === 'Team') {
            fetch(`http://localhost:3309/api/teams/teams/${fav.ownerId}`)
              .then(r => r.json())
              .then(d => setTeamDetails(prev => ({ ...prev, [fav.ownerId]: d }))
              ).catch(() => {});
          } else if (fav.type === 'Match') {
            fetch(`http://localhost:3309/api/matches/${fav.ownerId}`)
              .then(r => r.json())
              .then(d => setMatchDetails(prev => ({ ...prev, [fav.ownerId]: d }))
              ).catch(() => {});
          }
        });
      })
      .catch(() => {
        setFavorites([]);
        setLoading(false);
      });
  }, [supporterId]);

  const removeFavorite = (fav) => {
    setRemovingId(fav.id);
    fetch(`http://localhost:3309/api/favorites/remove?supporterId=${supporterId}&ownerId=${fav.ownerId}&type=${fav.type}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (res.ok || res.status === 204) {
          setFavorites(prev => prev.filter(f => f.id !== fav.id));
        }
      })
      .catch(() => {})
      .finally(() => setRemovingId(null));
  };

  const filteredFavorites = favorites.filter(fav => {
    if (activeTab === 'all') return true;
    return fav.type.toLowerCase() === activeTab.toLowerCase();
  });

  const teamCount = favorites.filter(f => f.type === 'Team').length;
  const matchCount = favorites.filter(f => f.type === 'Match').length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <Head>
        <title>My Favorites | MoroccoFan2030</title>
        <meta name="description" content="Your favorite teams and matches" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        body { font-family: 'Cairo', sans-serif; background: #fafaf9; }
        h1, h2, h3, .serif-font { font-family: 'Amiri', serif; }
        .decorative-font { font-family: 'Aref Ruqaa', serif; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulseRed {
          0%, 100% { box-shadow: 0 0 0 0 rgba(193,39,45,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(193,39,45,0); }
        }
        @keyframes removeCard {
          to { opacity: 0; transform: scale(0.9) translateY(10px); }
        }
        @keyframes floatLine {
          0%, 100% { transform: translateY(0) rotate(-15deg); }
          50% { transform: translateY(-20px) rotate(-15deg); }
        }
        @keyframes shimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }

        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-slide-in-left { animation: slideInLeft 0.7s ease-out forwards; }
        .animate-slide-in-right { animation: slideInRight 0.7s ease-out forwards; }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }

        .card-hover {
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }

        .removing {
          animation: removeCard 0.35s ease-out forwards;
        }

        .skeleton {
          background: linear-gradient(90deg, #e7e5e4 25%, #f5f5f4 50%, #e7e5e4 75%);
          background-size: 600px 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }

        .tab-active {
          background: #C1272D;
          color: white;
          box-shadow: 0 4px 12px rgba(193,39,45,0.25);
        }

        .heart-btn {
          transition: all 0.2s ease;
        }
        .heart-btn:hover {
          transform: scale(1.15);
        }
        .heart-btn:active {
          transform: scale(0.9);
        }

        .decorative-line {
          animation: floatLine 8s ease-in-out infinite;
        }

        .bg-zellige {
          background-color: #fafaf9;
          background-image: radial-gradient(#e7e5e4 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <Navbar />

      {/* Header */}
      <header className="relative w-full pt-32 pb-16 overflow-hidden border-b border-stone-200">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-[#1a0a0b] to-stone-900"></div>
          {/* Moroccan geometric pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C1272D' fill-opacity='0.8'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          {/* Decorative lines */}
          <div className="decorative-line absolute top-1/2 -left-20 w-[500px] h-px bg-gradient-to-r from-transparent via-[#C1272D]/30 to-transparent"></div>
          <div className="decorative-line absolute top-1/3 right-10 w-[400px] h-px bg-gradient-to-l from-transparent via-amber-500/20 to-transparent" style={{animationDelay:'3s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest mb-6 animate-slide-in-left">
                <svg className="w-4 h-4 text-[#C1272D]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                My Collection
              </div>
              <h1 className="text-5xl md:text-7xl font-normal tracking-tight text-white mb-4 leading-tight animate-slide-in-left delay-100">
                My <span className="serif-font italic text-[#C1272D] font-medium">Favorites</span>
              </h1>
              <p className="text-white/70 text-base md:text-lg leading-relaxed animate-slide-in-left delay-200">
                Your handpicked teams and matches — all in one place.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-12 animate-slide-in-right delay-300">
              <div className="text-center">
                <div className="text-5xl font-bold text-[#C1272D] mb-1">{favorites.length}</div>
                <div className="text-xs font-bold text-white/60 uppercase tracking-widest">Total</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-amber-400 mb-1">{teamCount}</div>
                <div className="text-xs font-bold text-white/60 uppercase tracking-widest">Teams</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-emerald-400 mb-1">{matchCount}</div>
                <div className="text-xs font-bold text-white/60 uppercase tracking-widest">Matches</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Bar */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            {[
              { key: 'all', label: `All (${favorites.length})` },
              { key: 'Team', label: `Teams (${teamCount})` },
              { key: 'Match', label: `Matches (${matchCount})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all ${
                  activeTab === tab.key ? 'tab-active' : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative py-12 bg-zellige min-h-screen overflow-hidden">
        {/* Decorative lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="decorative-line absolute top-40 -left-40 w-[500px] h-px bg-gradient-to-r from-transparent via-[#C1272D]/15 to-transparent"></div>
          <div className="decorative-line absolute top-[500px] right-20 w-[400px] h-px bg-gradient-to-l from-transparent via-amber-400/15 to-transparent" style={{animationDelay:'4s'}}></div>
          <div className="decorative-line absolute top-[800px] left-20 w-[450px] h-px bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent" style={{animationDelay:'2s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 animate-fade-in-up" style={{animationDelay:`${i*0.05}s`}}>
                  <div className="skeleton w-20 h-20 rounded-full mx-auto mb-4"></div>
                  <div className="skeleton h-5 w-3/4 mx-auto mb-2"></div>
                  <div className="skeleton h-3 w-1/2 mx-auto mb-6"></div>
                  <div className="skeleton h-10 w-full rounded-xl"></div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredFavorites.length === 0 && (
            <div className="text-center py-24 animate-fade-in-up">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-12 h-12 text-stone-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-serif text-stone-700 mb-2">No favorites yet</h3>
              <p className="text-stone-400 mb-8">Start adding your favorite teams and matches to see them here.</p>
              <button
                onClick={() => router.push('/Teams')}
                className="px-6 py-3 bg-[#C1272D] text-white rounded-xl text-sm font-semibold hover:bg-[#a01f24] transition-colors inline-flex items-center gap-2 shadow-lg shadow-red-500/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeWidth="2"/>
                </svg>
                Browse Teams
              </button>
            </div>
          )}

          {/* Favorites Grid */}
          {!loading && filteredFavorites.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredFavorites.map((fav, index) => {
                const isTeam = fav.type === 'Team';
                const isMatch = fav.type === 'Match';
                const team = isTeam ? teamDetails[fav.ownerId] : null;
                const match = isMatch ? matchDetails[fav.ownerId] : null;
                const isRemoving = removingId === fav.id;

                return (
                  <div
                    key={fav.id}
                    className={`group bg-white rounded-2xl border border-stone-200 overflow-hidden relative card-hover animate-fade-in-up ${isRemoving ? 'removing' : ''}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Type Badge */}
                    <div className={`absolute top-4 left-4 z-10 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      isTeam
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {fav.type}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFavorite(fav)}
                      disabled={isRemoving}
                      className="heart-btn absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border border-stone-100 hover:border-[#C1272D] hover:bg-red-50 disabled:opacity-50"
                      title="Remove from favorites"
                    >
                      {isRemoving ? (
                        <svg className="w-4 h-4 text-stone-400 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-[#C1272D]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      )}
                    </button>

                    {/* Team Card Content */}
                    {isTeam && (
                      <div
                        className="cursor-pointer"
                        onClick={() => router.push(`/Team?id=${fav.ownerId}`)}
                      >
                        {/* Top gradient bar */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-[#C1272D] via-amber-400 to-[#006233]"></div>

                        <div className="p-6 pt-10 flex flex-col items-center text-center">
                          {team ? (
                            <>
                              <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-stone-100 mb-4">
                                <img
                                  src={team.imageUrl}
                                  alt={team.name}
                                  className="w-full h-full object-cover"
                                  onError={e => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-200 to-stone-300 text-stone-600 font-bold text-lg">${(team.name||'?').substring(0,2).toUpperCase()}</div>`;
                                  }}
                                />
                              </div>
                              <h3 className="text-lg font-serif text-stone-900 mb-1">{team.name}</h3>
                              <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">{team.country}</p>
                              {team.coach && (
                                <p className="text-xs text-stone-500 mt-1">
                                  <span className="text-stone-400">Coach:</span> <span className="font-medium">{team.coach}</span>
                                </p>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="skeleton w-20 h-20 rounded-full mx-auto mb-4"></div>
                              <div className="skeleton h-5 w-3/4 mx-auto mb-2"></div>
                              <div className="skeleton h-3 w-1/2 mx-auto"></div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Match Card Content */}
                    {isMatch && (
                      <div
                        className="cursor-pointer"
                        onClick={() => router.push(`/Match?id=${fav.ownerId}`)}
                      >
                        {/* Top gradient bar */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>

                        <div className="p-6 pt-10">
                          {match ? (
                            <>
                              {/* Teams vs */}
                              <div className="flex items-center justify-between gap-2 mb-4">
                                <div className="flex-1 text-center">
                                  <div className="w-12 h-12 rounded-full bg-stone-100 mx-auto mb-2 overflow-hidden">
                                    {match.homeTeam?.imageUrl ? (
                                      <img src={match.homeTeam.imageUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-stone-500 text-xs font-bold">
                                        {(match.homeTeam?.name || '?').substring(0,3).toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-xs font-semibold text-stone-800 truncate">{match.homeTeam?.name || 'TBD'}</p>
                                </div>

                                <div className="text-center px-2">
                                  <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">VS</div>
                                  {match.score && (
                                    <div className="text-xl font-bold text-stone-800 mt-1">{match.score}</div>
                                  )}
                                </div>

                                <div className="flex-1 text-center">
                                  <div className="w-12 h-12 rounded-full bg-stone-100 mx-auto mb-2 overflow-hidden">
                                    {match.awayTeam?.imageUrl ? (
                                      <img src={match.awayTeam.imageUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-stone-500 text-xs font-bold">
                                        {(match.awayTeam?.name || '?').substring(0,3).toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-xs font-semibold text-stone-800 truncate">{match.awayTeam?.name || 'TBD'}</p>
                                </div>
                              </div>

                              {/* Match Info */}
                              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-3 border-t border-stone-100">
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
                                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
                                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
                                  </svg>
                                  {match.date ? formatDate(match.date) : 'Date TBD'}
                                </span>
                                {match.stadium && (
                                  <span className="flex items-center gap-1 truncate max-w-[100px]">
                                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeWidth="2"/>
                                      <circle cx="12" cy="10" r="3" strokeWidth="2"/>
                                    </svg>
                                    {match.stadium}
                                  </span>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-between gap-3 mb-4">
                                <div className="skeleton w-12 h-12 rounded-full"></div>
                                <div className="skeleton h-4 w-8"></div>
                                <div className="skeleton w-12 h-12 rounded-full"></div>
                              </div>
                              <div className="skeleton h-3 w-full mb-2"></div>
                              <div className="skeleton h-3 w-2/3"></div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer with date added */}
                    <div className="px-6 pb-4 flex items-center justify-between">
                      <span className="text-[10px] text-stone-300 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeWidth="2"/>
                        </svg>
                        Added {formatDate(fav.dateOfAdd)}
                      </span>
                      <div className="w-7 h-7 rounded-full border border-stone-100 flex items-center justify-center text-stone-300 group-hover:bg-[#C1272D] group-hover:border-[#C1272D] group-hover:text-white transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}