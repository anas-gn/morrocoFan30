import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const API = 'http://localhost:3309/api';

async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[safeFetch] HTTP ${res.status} — ${url}`);
      return null;
    }
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

  const [itinerary, setItinerary] = useState(null);
  const [itineraryAttractions, setItineraryAttractions] = useState([]);
  const [allAttractions, setAllAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchAdd, setSearchAdd] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [notification, setNotification] = useState(null);
  const [editingDate, setEditingDate] = useState(false);
  const [newDate, setNewDate] = useState('');

  /* ── Fetch itinerary and attractions ────────────────────────────── */
  const fetchItinerary = async () => {
    if (!id) return;
    setLoading(true);

    try {
      const [itData, attData] = await Promise.all([
        safeFetch(`${API}/itineraries/${id}`),
        safeFetch(`${API}/itineraries/${id}/attractions`)
      ]);

      setItinerary(itData);
      const attractions = Array.isArray(attData) ? attData : attData?.content || attData?.attractions || [];
      setItineraryAttractions(attractions);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching itinerary:', err);
      setLoading(false);
    }
  };

  /* ── Fetch all available attractions ────────────────────────────── */
  const fetchAllAttractions = async () => {
    try {
      const citiesData = await safeFetch(`${API}/acceuil/CityHosts/all`);
      if (!Array.isArray(citiesData)) return;

      const all = [];
      for (const city of citiesData) {
        const cityAttractions = await safeFetch(`${API}/attractions/city/${city.id}`);
        if (Array.isArray(cityAttractions)) {
          cityAttractions.forEach(attr => all.push({ ...attr, cityName: city.name }));
        }
      }
      setAllAttractions(all);
    } catch (err) {
      console.error('Error loading attractions:', err);
    }
  };

  useEffect(() => {
    fetchItinerary();
  }, [id]);

  useEffect(() => {
    if (showAddModal && allAttractions.length === 0) {
      fetchAllAttractions();
    }
  }, [showAddModal]);

  /* ── Update itinerary date ──────────────────────────────────────── */
  const updateDate = async () => {
    if (!newDate) return;
    
    try {
      const res = await fetch(`${API}/itineraries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...itinerary, dateToGo: newDate })
      });

      if (res.ok) {
        setItinerary({ ...itinerary, dateToGo: newDate });
        setEditingDate(false);
        showNotif('success', 'Date updated successfully!');
      } else {
        showNotif('error', 'Could not update date.');
      }
    } catch (err) {
      showNotif('error', 'Could not update date.');
    }
  };

  /* ── Add attraction ──────────────────────────────────────────────── */
  const addAttraction = async (attractionId) => {
    try {
      const res = await fetch(`${API}/itineraries/${id}/add-attraction/${attractionId}`, {
        method: 'POST'
      });
      
      const success = await res.json();

      if (success === true) {
        showNotif('success', 'Attraction added to itinerary!');
        await fetchItinerary();
      } else {
        showNotif('error', 'Attraction already in itinerary.');
      }
    } catch (err) {
      showNotif('error', 'Server error.');
    }
  };

  /* ── Remove attraction ───────────────────────────────────────────── */
  const removeAttraction = async (attractionId) => {
    try {
      const res = await fetch(`${API}/itineraries/${id}/remove-attraction/${attractionId}`, {
        method: 'DELETE'
      });
      
      const success = await res.json();

      if (success === true) {
        showNotif('success', 'Attraction removed.');
        await fetchItinerary();
      } else {
        showNotif('error', 'Could not remove attraction.');
      }
    } catch (err) {
      showNotif('error', 'Server error.');
    }
  };

  /* ── Toast notification ──────────────────────────────────────────── */
  const showNotif = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  /* ── Utilities ────────────────────────────────────────────────────── */
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { 
      day: '2-digit', month: 'long', year: 'numeric' 
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  const getTypeIcon = (type) => {
    const icons = {
      Museum: 'solar:book-linear',
      Monument: 'solar:structures-linear',
      Park: 'solar:leaf-linear',
      Beach: 'solar:waves-linear',
      Market: 'solar:bag-linear',
      Religious: 'solar:moon-stars-linear',
      Historical: 'solar:history-linear',
      Nature: 'solar:nature-linear',
      Entertainment: 'solar:music-note-linear'
    };
    return icons[type] || 'solar:map-point-linear';
  };

  /* ── Filter attractions for add modal ────────────────────────────── */
  const attractionIds = itineraryAttractions.map(a => a.id);
  const filteredForAdd = allAttractions.filter(a => {
    const notInItinerary = !attractionIds.includes(a.id);
    const matchSearch = searchAdd.trim() === '' ||
      a.name?.toLowerCase().includes(searchAdd.toLowerCase()) ||
      a.cityName?.toLowerCase().includes(searchAdd.toLowerCase());
    const matchType = filterType === 'all' || a.type === filterType;
    return notInItinerary && matchSearch && matchType;
  });

  const uniqueTypes = ['all', ...new Set(allAttractions.map(a => a.type).filter(Boolean))];

  /* ── Loading state ────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
        <div className="w-16 h-16 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
        <p className="mt-4 text-zinc-500 font-medium">Loading itinerary...</p>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
        <iconify-icon icon="solar:map-linear" class="text-6xl text-zinc-300 mb-4" />
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Itinerary not found</h2>
        <p className="text-zinc-500 mb-6">This itinerary doesn't exist or has been removed.</p>
        <button
          onClick={() => router.push('/itineraries')}
          className="px-6 py-3 bg-zinc-900 text-white rounded-2xl font-semibold hover:bg-zinc-800 transition-all"
        >
          Back to Itineraries
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{itinerary.title} | MoroccoFan2030</title>
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; background: #fafaf9; }
        .font-serif { font-family: 'Playfair Display', serif; }
        
        @keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fade-up 0.6s ease-out; }
        .slide-up { animation: fade-up 0.6s ease-out; }
        
        .img-zoom { overflow: hidden; }
        .img-zoom img { transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
        .img-zoom:hover img { transform: scale(1.08); }
      `}</style>

      <Navbar />

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-medium fade-up ${
          notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          <iconify-icon icon={notification.type === 'success' ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} class="text-xl" />
          {notification.message}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/cities-bg.jpg" alt={itinerary.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-900/60 to-zinc-950/90" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6">
          <button
            onClick={() => router.push('/itineraries')}
            className="group flex items-center gap-2 mb-8 text-white/70 hover:text-white transition fade-up"
          >
            <span className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 transition">
              <iconify-icon icon="solar:arrow-left-linear" class="text-lg" />
            </span>
            <span className="text-sm font-medium">Back to Itineraries</span>
          </button>

          <div className="flex items-end justify-between">
            <div className="fade-up">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-1.5 rounded-full bg-emerald-600/90 border border-emerald-400/30 text-xs font-semibold uppercase tracking-wider text-white">
                  <iconify-icon icon="solar:map-linear" class="inline-block mr-1" />
                  Travel Itinerary
                </span>
              </div>

              <h1 className="font-serif text-6xl md:text-7xl font-bold text-white mb-4">
                {itinerary.title}
              </h1>

              {itinerary.dateToGo && (
                <div className="flex items-center gap-3 text-white/90 text-lg">
                  <iconify-icon icon="solar:calendar-linear" class="text-xl" />
                  <span className="font-medium">{formatDate(itinerary.dateToGo)}</span>
                </div>
              )}
            </div>

            <div className="hidden md:block fade-up">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl px-8 py-6 text-center">
                <div className="text-5xl font-bold text-white mb-1">{itineraryAttractions.length}</div>
                <div className="text-xs text-white/70 uppercase tracking-wider font-semibold">Attractions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Attractions List */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between fade-up">
                <h2 className="font-serif text-4xl font-bold text-zinc-900 flex items-center gap-3">
                  <iconify-icon icon="solar:map-point-linear" class="text-emerald-600" />
                  My Attractions
                  <span className="text-xl font-normal text-zinc-400">({itineraryAttractions.length})</span>
                </h2>
                
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-semibold hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl"
                >
                  <iconify-icon icon="solar:add-circle-linear" />
                  Add Attraction
                </button>
              </div>

              {/* Attractions */}
              {itineraryAttractions.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-zinc-200 p-16 text-center fade-up">
                  <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                    <iconify-icon icon="solar:map-point-add-linear" class="text-3xl text-zinc-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 mb-2">No attractions yet</h3>
                  <p className="text-zinc-500 mb-6">Start building your itinerary by adding amazing places!</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-semibold hover:bg-zinc-800 transition-all"
                  >
                    <iconify-icon icon="solar:add-circle-linear" />
                    Browse Attractions
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {itineraryAttractions.map((attraction, index) => (
                    <div
                      key={attraction.id}
                      className="group bg-white rounded-3xl border border-zinc-200 hover:border-zinc-300 hover:shadow-xl transition-all p-6 slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-6">
                        
                        {/* Step Number */}
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0 text-white font-bold shadow-lg">
                          {index + 1}
                        </div>

                        {/* Image */}
                        <div className="relative w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 img-zoom">
                          <img
                            src={attraction.imageUrl || '/images/attraction-placeholder.jpg'}
                            alt={attraction.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/images/attraction-placeholder.jpg';
                            }}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0 pr-4">
                              <h3 className="font-serif text-2xl font-bold text-zinc-900 mb-2 line-clamp-1">
                                {attraction.name}
                              </h3>
                              
                              <div className="flex items-center gap-3 flex-wrap">
                                {attraction.type && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                                    <iconify-icon icon={getTypeIcon(attraction.type)} />
                                    {attraction.type}
                                  </span>
                                )}
                                {attraction.address && (
                                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                                    <iconify-icon icon="solar:map-point-linear" />
                                    <span className="line-clamp-1">{attraction.address}</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {attraction.priceProxim !== undefined && (
                              <div className="text-right flex-shrink-0">
                                <div className="text-2xl font-bold text-emerald-600">
                                  {attraction.priceProxim === 0 ? 'FREE' : `${attraction.priceProxim}`}
                                </div>
                                {attraction.priceProxim > 0 && (
                                  <div className="text-xs text-zinc-500">MAD</div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 mt-3">
                            {attraction.houreOfOpening && attraction.houreOfClosing && (
                              <span className="flex items-center gap-1.5 text-sm text-zinc-600">
                                <iconify-icon icon="solar:clock-circle-linear" />
                                {formatTime(attraction.houreOfOpening)} - {formatTime(attraction.houreOfClosing)}
                              </span>
                            )}

                            <button
                              onClick={() => router.push(`/attractions/${attraction.id}`)}
                              className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                            >
                              View details
                              <iconify-icon icon="solar:arrow-right-up-linear" />
                            </button>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeAttraction(attraction.id)}
                          className="flex-shrink-0 w-11 h-11 rounded-2xl border-2 border-red-100 text-red-400 flex items-center justify-center hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all"
                          title="Remove from itinerary"
                        >
                          <iconify-icon icon="solar:trash-bin-minimalistic-linear" class="text-xl" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-lg overflow-hidden sticky top-24 fade-up">

                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <iconify-icon icon="solar:map-linear" class="text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-zinc-900 text-lg">Trip Details</h3>
                </div>

                <div className="p-6 space-y-4">

                  {/* Attractions count */}
                  <div className="flex items-center justify-between bg-zinc-50 rounded-2xl px-5 py-4 border border-zinc-100">
                    <div className="flex items-center gap-3">
                      <iconify-icon icon="solar:map-point-linear" class="text-emerald-600 text-xl" />
                      <span className="text-sm font-medium text-zinc-700">Attractions</span>
                    </div>
                    <span className="font-bold text-zinc-900 text-lg">{itineraryAttractions.length}</span>
                  </div>

                  {/* Date — editable */}
                  <div className="bg-zinc-50 rounded-2xl px-5 py-4 border border-zinc-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <iconify-icon icon="solar:calendar-linear" class="text-emerald-600 text-xl" />
                        <span className="text-sm font-medium text-zinc-700">Travel Date</span>
                      </div>
                      <button
                        onClick={() => { 
                          setEditingDate(!editingDate); 
                          setNewDate(itinerary.dateToGo || ''); 
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                      >
                        <iconify-icon icon={editingDate ? 'solar:close-circle-linear' : 'solar:pen-linear'} />
                        {editingDate ? 'Cancel' : 'Edit'}
                      </button>
                    </div>
                    
                    {editingDate ? (
                      <div className="mt-3 space-y-3">
                        <input
                          type="date"
                          value={newDate}
                          onChange={e => setNewDate(e.target.value)}
                          className="w-full px-4 py-2.5 border-2 border-emerald-600 rounded-xl text-sm text-zinc-900 focus:outline-none"
                        />
                        <button
                          onClick={updateDate}
                          className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all"
                        >
                          Save Date
                        </button>
                      </div>
                    ) : (
                      <div className="font-bold text-zinc-900 mt-1">
                        {itinerary.dateToGo ? formatDate(itinerary.dateToGo) : 'Not set'}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {itinerary.description && (
                    <div className="pt-4">
                      <p className="text-zinc-600 text-sm leading-relaxed">{itinerary.description}</p>
                    </div>
                  )}

                  {/* Separator */}
                  <div className="h-px bg-zinc-100 my-2" />

                  {/* Add Attraction Button */}
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full py-3.5 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <iconify-icon icon="solar:add-circle-linear" class="text-lg" />
                    Add Attraction
                  </button>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add Attraction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 px-8 py-6 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="font-serif text-3xl font-bold text-white">Add Attractions</h2>
                <p className="text-white/60 text-sm mt-1">Select places to add to your itinerary</p>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setSearchAdd(''); setFilterType('all'); }}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <iconify-icon icon="solar:close-linear" class="text-xl" />
              </button>
            </div>

            {/* Filters */}
            <div className="px-8 py-5 border-b border-zinc-100 flex-shrink-0 space-y-4">
              
              {/* Search */}
              <div className="relative">
                <iconify-icon icon="solar:magnifer-linear" class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search attractions by name or city..."
                  value={searchAdd}
                  onChange={e => setSearchAdd(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-zinc-200 rounded-2xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
                />
              </div>

              {/* Type filter */}
              <div className="flex gap-2 flex-wrap">
                {uniqueTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${
                      filterType === type
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Attractions List */}
            <div className="flex-1 overflow-y-auto px-8 py-5 space-y-3">
              {filteredForAdd.length === 0 ? (
                <div className="text-center py-16">
                  <iconify-icon icon="solar:magnifer-zoom-out-linear" class="text-6xl text-zinc-300 mb-4" />
                  <p className="text-zinc-500 text-lg">No attractions found</p>
                  <p className="text-zinc-400 text-sm mt-1">
                    {allAttractions.length === 0 ? 'Loading attractions...' : 'Try adjusting your search or filters'}
                  </p>
                </div>
              ) : (
                filteredForAdd.map(attraction => (
                  <div
                    key={attraction.id}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all group"
                  >
                    
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 img-zoom">
                      <img
                        src={attraction.imageUrl || '/images/attraction-placeholder.jpg'}
                        alt={attraction.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/images/attraction-placeholder.jpg';
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-zinc-900 text-lg line-clamp-1">{attraction.name}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {attraction.type && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full font-semibold">
                            <iconify-icon icon={getTypeIcon(attraction.type)} />
                            {attraction.type}
                          </span>
                        )}
                        {attraction.cityName && (
                          <span className="text-xs text-zinc-500 flex items-center gap-1">
                            <iconify-icon icon="solar:map-point-linear" />
                            {attraction.cityName}
                          </span>
                        )}
                      </div>
                      {attraction.priceProxim !== undefined && (
                        <div className="text-sm font-bold text-emerald-600 mt-1">
                          {attraction.priceProxim === 0 ? 'FREE' : `${attraction.priceProxim} MAD`}
                        </div>
                      )}
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={() => addAttraction(attraction.id)}
                      className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg"
                    >
                      <iconify-icon icon="solar:add-circle-linear" />
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-zinc-100 flex-shrink-0 flex items-center justify-between bg-zinc-50">
              <span className="text-sm text-zinc-500">
                <strong className="text-zinc-900">{itineraryAttractions.length}</strong> attractions in itinerary
              </span>
              <button
                onClick={() => { setShowAddModal(false); setSearchAdd(''); setFilterType('all'); }}
                className="px-6 py-2.5 bg-zinc-200 text-zinc-700 rounded-xl text-sm font-semibold hover:bg-zinc-300 transition-all"
              >
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