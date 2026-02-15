import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const API = 'http://localhost:3309/api';

async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) { console.warn(`[safeFetch] HTTP ${res.status} — ${url}`); return null; }
    const text = await res.text();
    if (!text || text === 'null') return null;
    return JSON.parse(text);
  } catch (err) {
    console.error(`[safeFetch] Error — ${url}`, err);
    return null;
  }
}

export default function ItineraryDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [itinerary, setItinerary]               = useState(null);
  const [itineraryAttractions, setItineraryAttractions] = useState([]);
  const [allAttractions, setAllAttractions]     = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [showAddModal, setShowAddModal]         = useState(false);
  const [searchAdd, setSearchAdd]               = useState('');
  const [filterType, setFilterType]             = useState('all');
  const [notification, setNotification]         = useState(null);
  const [editingDate, setEditingDate]           = useState(false);
  const [newDate, setNewDate]                   = useState('');

  const fetchItinerary = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [itData, attData] = await Promise.all([
        safeFetch(`${API}/itineraries/${id}`),
        safeFetch(`${API}/itineraries/${id}/attractions`)
      ]);
      setItinerary(itData);
      setItineraryAttractions(Array.isArray(attData) ? attData : attData?.content || attData?.attractions || []);
    } catch (err) {
      console.error('Error fetching itinerary:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAttractions = async () => {
    try {
      const citiesData = await safeFetch(`${API}/acceuil/CityHosts/all`);
      if (!Array.isArray(citiesData)) return;
      const all = [];
      for (const city of citiesData) {
        const cityAttractions = await safeFetch(`${API}/attractions/city/${city.id}`);
        if (Array.isArray(cityAttractions))
          cityAttractions.forEach(attr => all.push({ ...attr, cityName: city.name }));
      }
      setAllAttractions(all);
    } catch (err) {
      console.error('Error loading attractions:', err);
    }
  };

  useEffect(() => { fetchItinerary(); }, [id]);
  useEffect(() => { if (showAddModal && allAttractions.length === 0) fetchAllAttractions(); }, [showAddModal]);

  const updateDate = async () => {
    if (!newDate) return;
    try {
      const res = await fetch(`${API}/itineraries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...itinerary, dateToGo: newDate })
      });
      if (res.ok) { setItinerary({ ...itinerary, dateToGo: newDate }); setEditingDate(false); showNotif('success', 'Date updated!'); }
      else showNotif('error', 'Could not update date.');
    } catch { showNotif('error', 'Could not update date.'); }
  };

  const addAttraction = async (attractionId) => {
    try {
      const res = await fetch(`${API}/itineraries/${id}/add-attraction/${attractionId}`, { method: 'POST' });
      const success = await res.json();
      if (success === true) { showNotif('success', 'Attraction added!'); await fetchItinerary(); }
      else showNotif('error', 'Already in itinerary.');
    } catch { showNotif('error', 'Server error.'); }
  };

  const removeAttraction = async (attractionId) => {
    try {
      const res = await fetch(`${API}/itineraries/${id}/remove-attraction/${attractionId}`, { method: 'DELETE' });
      const success = await res.json();
      if (success === true) { showNotif('success', 'Attraction removed.'); await fetchItinerary(); }
      else showNotif('error', 'Could not remove attraction.');
    } catch { showNotif('error', 'Server error.'); }
  };

  const showNotif = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };
  const formatTime = (time) => time ? time.substring(0, 5) : '';

  const getTypeIcon = (type) => ({
    Museum: 'solar:book-linear', Monument: 'solar:structures-linear',
    Park: 'solar:leaf-linear', Beach: 'solar:waves-linear',
    Market: 'solar:bag-linear', Religious: 'solar:moon-stars-linear',
    Historical: 'solar:history-linear', Nature: 'solar:nature-linear',
    Entertainment: 'solar:music-note-linear'
  }[type] || 'solar:map-point-linear');

  const attractionIds = itineraryAttractions.map(a => a.id);
  const filteredForAdd = allAttractions.filter(a => {
    const notIn = !attractionIds.includes(a.id);
    const matchSearch = !searchAdd.trim() || a.name?.toLowerCase().includes(searchAdd.toLowerCase()) || a.cityName?.toLowerCase().includes(searchAdd.toLowerCase());
    const matchType = filterType === 'all' || a.type === filterType;
    return notIn && matchSearch && matchType;
  });
  const uniqueTypes = ['all', ...new Set(allAttractions.map(a => a.type).filter(Boolean))];

  /* ── Loading ── */
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f7f5]">
      <img src="/images/logo.png" alt="" className="w-20 h-20 animate-pulse mb-3" />
    </div>
  );

  if (!itinerary) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f7f5]">
      <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-5">
        <iconify-icon icon="solar:map-linear" class="text-zinc-300 text-4xl" />
      </div>
      <h3 className="serif text-3xl font-light text-zinc-700 mb-3">Itinerary not found</h3>
      <p className="text-zinc-400 font-light mb-6">This itinerary doesn't exist or has been removed.</p>
      <button onClick={() => router.push('/itineraries')}
        className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all">
        <iconify-icon icon="solar:arrow-left-linear" class="text-base" />
        Back to Itineraries
      </button>
    </div>
    
  );

  return (
    <>
      <Head>
        <title>{itinerary.title} | MoroccoFan2030</title>
        <link rel="icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        body { font-family: 'DM Sans', sans-serif; background: #f8f7f5; color: #1a1a1a; }
        .serif { font-family: 'Cormorant Garamond', serif; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-up { animation: slideUp .6s cubic-bezier(.16,1,.3,1) both; }
        .d1 { animation-delay:.05s } .d2 { animation-delay:.12s }
        .d3 { animation-delay:.19s } .d4 { animation-delay:.26s }

        .grain::after {
          content: '';
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 2;
        }

        .hero-clip { clip-path: polygon(0 0, 100% 0, 100% 88%, 0 100%); }

        .tag-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 999px;
          font-size: 10px; font-weight: 700;
          letter-spacing: .06em; text-transform: uppercase;
        }

        .attr-card { transition: transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s ease; }
        .attr-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,.08); }

        .img-zoom { overflow: hidden; }
        .img-zoom img { transition: transform .7s cubic-bezier(.16,1,.3,1); }
        .img-zoom:hover img { transform: scale(1.08); }

        input:focus, textarea:focus { outline: none; border-color: #71717a !important; }

        .no-scroll::-webkit-scrollbar { display: none; }
        .no-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <Navbar />

      {/* ── TOAST ── */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium slide-up ${
          notification.type === 'success' ? 'bg-zinc-900' : 'bg-[#C1272D]'
        }`}>
          <iconify-icon icon={notification.type === 'success' ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} class="text-xl" />
          {notification.message}
        </div>
      )}

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <header
        className="relative hero-clip bg-zinc-950 overflow-hidden grain"
        style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
      >
        <div className="absolute inset-0">
          <img src="/images/itin.webp" alt="" className="w-full h-full object-cover opacity-25"
            onError={e => { e.target.style.display = 'none'; }} />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(10,10,10,.93) 0%, rgba(30,30,30,.68) 50%, rgba(10,10,10,.82) 100%)' }} />
        </div>

        {/* Decorative vertical text */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-3 z-10">
          <div className="w-px h-16 bg-white/10" />
          <span className="serif text-white/8 font-light"
            style={{ fontSize: '80px', lineHeight: 1, writingMode: 'vertical-rl' }}>
            {itinerary.dateToGo ? new Date(itinerary.dateToGo).getFullYear() : '2030'}
          </span>
          <div className="w-px h-16 bg-white/10" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 pt-36">

          {/* Back button */}
          <button onClick={() => router.push('/itineraries')}
            className="group flex items-center gap-2 mb-10 text-white/60 hover:text-white transition slide-up">
            <span className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 transition">
              <iconify-icon icon="solar:arrow-left-linear" class="text-base" />
            </span>
            <span className="text-sm font-light">Back to Itineraries</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">

            {/* Left: title */}
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-6 slide-up d1">
                <span className="w-8 h-px bg-[#C1272D]" />
                <span className="tag-pill bg-[#C1272D]/15 text-[#e05555] border border-[#C1272D]/30">
                  Travel Itinerary
                </span>
              </div>

              <h1 className="serif font-light text-white mb-5 slide-up d2"
                style={{ fontSize: 'clamp(44px, 7vw, 84px)', lineHeight: 1.0 }}>
                {itinerary.title}
              </h1>

              {itinerary.dateToGo && (
                <div className="flex items-center gap-2 text-white/50 font-light slide-up d3"
                  style={{ fontSize: '16px' }}>
                  <iconify-icon icon="solar:calendar-linear" />
                  {formatDate(itinerary.dateToGo)}
                </div>
              )}
            </div>

            {/* Right: stat bubble */}
            <div className="lg:col-span-4 slide-up d3">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { val: itineraryAttractions.length, label: 'Attractions', accent: '#e05555' },
                  { val: '🇲🇦', label: 'Morocco', accent: '#4caf7d' },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl p-5 backdrop-blur-sm text-center">
                    <div className="serif font-light mb-1"
                      style={{ fontSize: '48px', lineHeight: 1, color: s.accent }}>
                      {s.val}
                    </div>
                    <div className="text-white/40 text-xs font-medium uppercase tracking-widest">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ══ MAIN ══════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── LEFT: Attractions ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Section heading */}
            <div className="flex items-end justify-between slide-up">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-5 h-px bg-[#C1272D]" />
                  <span className="tag-pill bg-[#C1272D]/10 text-[#e05555] border border-[#C1272D]/20">
                    Stops
                  </span>
                </div>
                <h2 className="serif font-light text-zinc-900"
                  style={{ fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.1 }}>
                  My Attractions
                  <span className="text-zinc-400 font-light text-2xl ml-3">({itineraryAttractions.length})</span>
                </h2>
              </div>

              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all hover:shadow-lg">
                <iconify-icon icon="solar:add-circle-linear" class="text-base" />
                Add Attraction
              </button>
            </div>

            {/* Empty state */}
            {itineraryAttractions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-zinc-100 text-center slide-up">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                  <iconify-icon icon="solar:map-point-add-linear" class="text-zinc-300 text-3xl" />
                </div>
                <h3 className="serif text-2xl font-light text-zinc-700 mb-2">No attractions yet</h3>
                <p className="text-zinc-400 text-sm font-light mb-6 max-w-xs">
                  Start building your itinerary by adding amazing places to visit.
                </p>
                <button onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all">
                  <iconify-icon icon="solar:add-circle-linear" class="text-base" />
                  Browse Attractions
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {itineraryAttractions.map((attraction, index) => (
                  <div key={attraction.id}
                    className="attr-card bg-white rounded-2xl border border-zinc-100 overflow-hidden slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="flex items-center gap-5 p-5">

                      {/* Step number */}
                      <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold">
                        {index + 1}
                      </div>

                      {/* Image */}
                      <div className="img-zoom w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-zinc-100">
                        <img src={attraction.imageUrl || '/images/attraction-placeholder.jpg'}
                          alt={attraction.name} className="w-full h-full object-cover"
                          onError={e => { e.target.src = '/images/attraction-placeholder.jpg'; }} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="serif text-xl font-light text-zinc-900 mb-1 line-clamp-1">
                          {attraction.name}
                        </h3>

                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {attraction.type && (
                            <span className="tag-pill bg-zinc-100 text-zinc-500 border border-zinc-200">
                              <iconify-icon icon={getTypeIcon(attraction.type)} />
                              {attraction.type}
                            </span>
                          )}
                          {attraction.address && (
                            <span className="flex items-center gap-1 text-xs text-zinc-400 font-light">
                              <iconify-icon icon="solar:map-point-linear" />
                              <span className="line-clamp-1">{attraction.address}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          {attraction.houreOfOpening && attraction.houreOfClosing && (
                            <span className="flex items-center gap-1 text-xs text-zinc-400 font-light">
                              <iconify-icon icon="solar:clock-circle-linear" />
                              {formatTime(attraction.houreOfOpening)} – {formatTime(attraction.houreOfClosing)}
                            </span>
                          )}
                          <button onClick={() => router.push(`/attractions/${attraction.id}`)}
                            className="text-xs text-zinc-900 font-medium flex items-center gap-1 hover:text-zinc-600 transition">
                            View details
                            <iconify-icon icon="solar:arrow-right-up-linear" class="text-xs" />
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      {attraction.priceProxim !== undefined && (
                        <div className="text-right flex-shrink-0 hidden sm:block">
                          <div className="text-xl font-semibold text-zinc-900">
                            {attraction.priceProxim === 0 ? 'FREE' : attraction.priceProxim}
                          </div>
                          {attraction.priceProxim > 0 && (
                            <div className="text-xs text-zinc-400">MAD</div>
                          )}
                        </div>
                      )}

                      {/* Remove */}
                      <button onClick={() => removeAttraction(attraction.id)}
                        className="flex-shrink-0 w-9 h-9 rounded-xl border border-zinc-200 text-zinc-400 flex items-center justify-center hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-700 transition-all">
                        <iconify-icon icon="solar:trash-bin-minimalistic-linear" class="text-base" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <div className="space-y-6">

            {/* Trip Details card */}
            <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden sticky top-24 slide-up">

              {/* Card top accent */}
              <div className="h-1 bg-gradient-to-r from-[#C1272D] via-[#e05555] to-transparent" />

              <div className="p-6 space-y-5">
                <div className="flex items-center gap-3 mb-1">
                  <span className="w-5 h-px bg-[#C1272D]" />
                  <span className="tag-pill bg-[#C1272D]/10 text-[#e05555] border border-[#C1272D]/20">
                    Trip Details
                  </span>
                </div>
                <h3 className="serif text-2xl font-light text-zinc-900">Summary</h3>

                {/* Attractions count */}
                <div className="flex items-center justify-between py-3.5 border-b border-zinc-100">
                  <div className="flex items-center gap-2.5 text-zinc-500 text-sm">
                    <iconify-icon icon="solar:map-point-linear" class="text-base text-zinc-400" />
                    Attractions
                  </div>
                  <span className="font-semibold text-zinc-900">{itineraryAttractions.length}</span>
                </div>

                {/* Date — editable */}
                <div className="py-2 border-b border-zinc-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5 text-zinc-500 text-sm">
                      <iconify-icon icon="solar:calendar-linear" class="text-base text-zinc-400" />
                      Travel Date
                    </div>
                    <button
                      onClick={() => { setEditingDate(!editingDate); setNewDate(itinerary.dateToGo || ''); }}
                      className="text-xs text-zinc-400 hover:text-zinc-700 flex items-center gap-1 font-medium transition">
                      <iconify-icon icon={editingDate ? 'solar:close-circle-linear' : 'solar:pen-linear'} />
                      {editingDate ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  {editingDate ? (
                    <div className="space-y-2 mt-2">
                      <input type="date" value={newDate}
                        onChange={e => setNewDate(e.target.value)}
                        className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:border-zinc-400 transition-all" />
                      <button onClick={updateDate}
                        className="w-full py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all">
                        Save Date
                      </button>
                    </div>
                  ) : (
                    <div className="font-medium text-zinc-900 text-sm mt-0.5">
                      {itinerary.dateToGo ? formatDate(itinerary.dateToGo) : (
                        <span className="text-zinc-400 font-light italic">Not set</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                {itinerary.description && (
                  <p className="text-zinc-500 text-sm font-light leading-relaxed pb-2 border-b border-zinc-100">
                    {itinerary.description}
                  </p>
                )}

                {/* CTA */}
                <button onClick={() => setShowAddModal(true)}
                  className="w-full py-3.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 hover:shadow-lg">
                  <iconify-icon icon="solar:add-circle-linear" class="text-base" />
                  Add Attraction
                </button>
              </div>
            </div>

            {/* Info notice */}
            <div className="p-5 bg-white rounded-2xl border border-zinc-100 flex items-start gap-3 slide-up d2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                <iconify-icon icon="solar:lightbulb-linear" class="text-amber-500 text-base" />
              </div>
              <div>
                <div className="font-medium text-zinc-900 text-sm mb-0.5">One Itinerary Rule</div>
                <div className="text-xs text-zinc-400 font-light leading-relaxed">
                  Only one itinerary per account. Add as many attractions as you want to plan the perfect trip.
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ══ ADD ATTRACTION MODAL ══════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-zinc-100">

            {/* Modal header — same dark style as create form */}
            <div className="relative overflow-hidden grain flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(10,10,10,.97) 0%, rgba(30,30,30,.93) 100%)' }}>
              <div className="relative z-10 px-8 py-7 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-6 h-px bg-[#C1272D]" />
                    <span className="tag-pill bg-[#C1272D]/15 text-[#e05555] border border-[#C1272D]/30">
                      Browse
                    </span>
                  </div>
                  <h2 className="serif font-light text-white" style={{ fontSize: '32px', lineHeight: 1.1 }}>
                    Add Attractions
                  </h2>
                  <p className="text-white/40 text-xs font-light mt-1">Select places to add to your itinerary</p>
                </div>
                <button
                  onClick={() => { setShowAddModal(false); setSearchAdd(''); setFilterType('all'); }}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
                  <iconify-icon icon="solar:close-linear" class="text-lg" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="px-7 py-4 border-b border-zinc-100 flex-shrink-0 space-y-3">
              <div className="relative">
                <iconify-icon icon="solar:magnifer-linear" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-base" />
                <input type="text"
                  placeholder="Search by name or city…"
                  value={searchAdd}
                  onChange={e => setSearchAdd(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 transition-all" />
              </div>

              <div className="flex gap-2 flex-wrap">
                {uniqueTypes.map(type => (
                  <button key={type} onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all capitalize ${
                      filterType === type ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700'
                    }`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Attractions list */}
            <div className="flex-1 overflow-y-auto no-scroll px-7 py-4 space-y-3">
              {filteredForAdd.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center mb-3">
                    <iconify-icon icon="solar:magnifer-zoom-out-linear" class="text-zinc-300 text-2xl" />
                  </div>
                  <p className="text-zinc-500 font-light">No attractions found</p>
                  <p className="text-zinc-400 text-xs mt-1 font-light">
                    {allAttractions.length === 0 ? 'Loading…' : 'Try adjusting your search'}
                  </p>
                </div>
              ) : (
                filteredForAdd.map(attraction => (
                  <div key={attraction.id}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 transition-all group">

                    <div className="img-zoom w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-100">
                      <img src={attraction.imageUrl || '/images/attraction-placeholder.jpg'}
                        alt={attraction.name} className="w-full h-full object-cover"
                        onError={e => { e.target.src = '/images/attraction-placeholder.jpg'; }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="serif text-lg font-light text-zinc-900 line-clamp-1">{attraction.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {attraction.type && (
                          <span className="tag-pill bg-zinc-100 text-zinc-500">
                            <iconify-icon icon={getTypeIcon(attraction.type)} />
                            {attraction.type}
                          </span>
                        )}
                        {attraction.cityName && (
                          <span className="text-xs text-zinc-400 flex items-center gap-1 font-light">
                            <iconify-icon icon="solar:map-point-linear" />
                            {attraction.cityName}
                          </span>
                        )}
                      </div>
                      {attraction.priceProxim !== undefined && (
                        <div className="text-xs font-semibold text-zinc-700 mt-1">
                          {attraction.priceProxim === 0 ? 'FREE' : `${attraction.priceProxim} MAD`}
                        </div>
                      )}
                    </div>

                    <button onClick={() => addAttraction(attraction.id)}
                      className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-medium hover:bg-zinc-800 transition-all">
                      <iconify-icon icon="solar:add-circle-linear" class="text-sm" />
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Modal footer */}
            <div className="px-7 py-4 border-t border-zinc-100 flex-shrink-0 flex items-center justify-between bg-zinc-50/80">
              <span className="text-xs text-zinc-400 font-light">
                <strong className="text-zinc-700 font-medium">{itineraryAttractions.length}</strong> attractions in itinerary
              </span>
              <button
                onClick={() => { setShowAddModal(false); setSearchAdd(''); setFilterType('all'); }}
                className="px-5 py-2 bg-zinc-200 text-zinc-700 rounded-xl text-xs font-medium hover:bg-zinc-300 transition-all">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}