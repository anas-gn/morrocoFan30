import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message }
  const [editingDate, setEditingDate] = useState(false);
  const [newDate, setNewDate] = useState('');

  // Mettre à jour la date de l'itinéraire
  const updateDate = () => {
    if (!newDate) return;
    fetch(`http://localhost:3309/api/itineraries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...itinerary, dateToGo: newDate })
    })
      .then(() => {
        setItinerary({ ...itinerary, dateToGo: newDate });
        setEditingDate(false);
        showNotif('success', 'Date updated!');
      })
      .catch(() => showNotif('error', 'Could not update date.'));
  };

  // Charger l'itinéraire et ses attractions
  const fetchItinerary = () => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      fetch(`http://localhost:3309/api/itineraries/${id}`).then(r => r.json()),
      fetch(`http://localhost:3309/api/itineraries/${id}/attractions`).then(r => r.json())
    ])
      .then(([itData, attData]) => {
        setItinerary(itData);
        // Sécuriser : l'API peut renvoyer null, objet, ou tableau
        const attractions = Array.isArray(attData) ? attData : attData?.content || attData?.attractions || [];
        setItineraryAttractions(attractions);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur:', err);
        setLoading(false);
      });
  };

  // Charger toutes les attractions disponibles (via les villes)
  const fetchAllAttractions = () => {
    fetch('http://localhost:3309/api/cities/all')
      .then(res => res.json())
      .then(async (citiesData) => {
        const all = [];
        for (const city of citiesData) {
          try {
            const res = await fetch(`http://localhost:3309/api/cities/${city.id}/attractions`);
            const cityAttractions = await res.json();
            cityAttractions.forEach(attr => all.push({ ...attr, cityName: city.name }));
          } catch (e) {
            console.error(e);
          }
        }
        setAllAttractions(all);
      })
      .catch(err => console.error('Erreur attractions:', err));
  };

  useEffect(() => {
    fetchItinerary();
  }, [id]);

  useEffect(() => {
    if (showAddModal && allAttractions.length === 0) {
      fetchAllAttractions();
    }
  }, [showAddModal]);

  const showNotif = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Ajouter une attraction à l'itinéraire
  const addAttraction = (attractionId) => {
    fetch(`http://localhost:3309/api/itineraries/${id}/add-attraction/${attractionId}`, {
      method: 'POST'
    })
      .then(res => res.json())
      .then(success => {
        if (success) {
          showNotif('success', 'Attraction added to itinerary!');
          fetchItinerary();
        } else {
          showNotif('error', 'Could not add attraction.');
        }
      })
      .catch(() => showNotif('error', 'Server error.'));
  };

  // Retirer une attraction de l'itinéraire
  const removeAttraction = (attractionId) => {
    fetch(`http://localhost:3309/api/itineraries/${id}/remove-attraction/${attractionId}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(success => {
        if (success) {
          showNotif('success', 'Attraction removed.');
          fetchItinerary();
        } else {
          showNotif('error', 'Could not remove attraction.');
        }
      })
      .catch(() => showNotif('error', 'Server error.'));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  const getTypeIcon = (type) => {
    const icons = {
      Museum: 'museum',
      Monument: 'account_balance',
      Park: 'park',
      Beach: 'beach_access',
      Market: 'shopping_bag',
      Religious: 'temple_buddhist',
      Historical: 'history_edu',
      Nature: 'nature',
      Entertainment: 'celebration'
    };
    return icons[type] || 'place';
  };

  const attractionIds = itineraryAttractions.map(a => a.id);

  // Attractions filtrées pour la modale d'ajout
  const filteredForAdd = allAttractions.filter(a => {
    const notInItinerary = !attractionIds.includes(a.id);
    const matchSearch = searchAdd.trim() === '' ||
      a.name?.toLowerCase().includes(searchAdd.toLowerCase()) ||
      a.cityName?.toLowerCase().includes(searchAdd.toLowerCase());
    const matchType = filterType === 'all' || a.type === filterType;
    return notInItinerary && matchSearch && matchType;
  });

  const uniqueTypes = ['all', ...new Set(allAttractions.map(a => a.type).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <img src="/images/logo.png" alt="Loading" className="w-20 h-20 mb-4" />
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-stone-700">Itinerary not found</h2>
        <button
          onClick={() => router.push('/itineraries')}
          className="mt-4 px-6 py-2 bg-[#006233] text-white rounded-lg hover:bg-[#004d28] transition-all"
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        body { font-family: 'Cairo', sans-serif; }
        h1, h2, h3, h4, .serif-font { font-family: 'Amiri', serif; }
        .decorative-font { font-family: 'Aref Ruqaa', serif; }
        .bg-morocco-red { background: linear-gradient(135deg, #C1272D 0%, #a01e23 100%); }
        .bg-morocco-green { background: linear-gradient(135deg, #006233 0%, #004d28 100%); }
        .image-overlay { position: relative; overflow: hidden; }
        .image-overlay::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%);
        }
      `}</style>

      <Navbar />

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all ${
          notification.type === 'success' ? 'bg-[#006233]' : 'bg-[#C1272D]'
        }`}>
          <span className="material-icons text-sm">
            {notification.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {notification.message}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0 image-overlay">
          <img
            src="/images/cities-bg.jpg"
            alt={itinerary.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-10 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-6 pb-12">
            <button
              onClick={() => router.push('/itineraries')}
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
            >
              <span className="material-icons text-sm">arrow_back</span>
              <span className="text-sm font-medium">Back to Itineraries</span>
            </button>
            <div className="flex items-end justify-between">
              <div>
                <div className="mb-3">
                  <span className="px-4 py-1.5 bg-[#006233]/90 backdrop-blur-md border border-emerald-400/30 rounded-full text-white text-sm font-bold flex items-center gap-2 w-fit">
                    <span className="material-icons text-sm">map</span>
                    Travel Itinerary
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 serif-font">
                  {itinerary.title}
                </h1>
                {itinerary.dateToGo && (
                  <div className="flex items-center gap-3 text-white/90 text-lg">
                    <span className="material-icons">event</span>
                    <span className="font-medium">{formatDate(itinerary.dateToGo)}</span>
                  </div>
                )}
              </div>
              <div className="hidden md:flex gap-4">
                <div className="text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-4">
                  <div className="text-3xl font-bold text-white">{itineraryAttractions.length}</div>
                  <div className="text-xs text-white/80 uppercase tracking-wider">Attractions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gradient-to-br from-stone-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Attractions List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-stone-900 serif-font flex items-center gap-3">
                  <span className="material-icons text-[#006233]">place</span>
                  My Attractions
                  <span className="text-lg font-normal text-stone-500">({itineraryAttractions.length})</span>
                </h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#006233] to-[#004d28] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/20 transition-all text-sm"
                >
                  <span className="material-icons text-sm">add</span>
                  Add Attraction
                </button>
              </div>

              {/* Attractions */}
              {itineraryAttractions.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-stone-200 p-12 text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-icons text-stone-400 text-3xl">add_location_alt</span>
                  </div>
                  <h3 className="text-xl font-medium text-stone-700 mb-2">No attractions yet</h3>
                  <p className="text-stone-500 mb-4">Add amazing places to visit during the World Cup!</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-5 py-2 bg-gradient-to-r from-[#006233] to-[#004d28] text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm"
                  >
                    Browse Attractions
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {itineraryAttractions.map((attraction, index) => (
                    <div
                      key={attraction.id}
                      className="bg-white rounded-xl border border-stone-200 hover:border-[#006233] hover:shadow-lg transition-all p-4 group"
                    >
                      <div className="flex items-center gap-4">
                        {/* Step Number */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#006233] to-[#004d28] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                          {index + 1}
                        </div>

                        {/* Image */}
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={attraction.imageUrl || '/images/attraction-placeholder.jpg'}
                            alt={attraction.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <h3 className="text-lg font-bold text-stone-900 serif-font line-clamp-1">
                                {attraction.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                {attraction.type && (
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                                    {attraction.type}
                                  </span>
                                )}
                                {attraction.address && (
                                  <div className="flex items-center gap-1 text-xs text-stone-500">
                                    <span className="material-icons" style={{ fontSize: '12px' }}>location_on</span>
                                    <span className="line-clamp-1">{attraction.address}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {attraction.priceProxim !== undefined && (
                              <div className="text-right ml-4">
                                <div className="text-lg font-bold text-emerald-600">
                                  {attraction.priceProxim === 0 ? 'FREE' : `${attraction.priceProxim}`}
                                </div>
                                {attraction.priceProxim > 0 && (
                                  <div className="text-xs text-stone-500">MAD</div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 mt-2">
                            {attraction.houreOfOpening && attraction.houreOfClosing && (
                              <div className="flex items-center gap-1 text-xs text-stone-500">
                                <span className="material-icons text-[#006233]" style={{ fontSize: '14px' }}>schedule</span>
                                <span>{formatTime(attraction.houreOfOpening)} - {formatTime(attraction.houreOfClosing)}</span>
                              </div>
                            )}

                            {/* View detail link */}
                            <button
                              onClick={() => router.push(`/attractions/${attraction.id}`)}
                              className="text-xs text-[#006233] hover:underline flex items-center gap-1"
                            >
                              <span className="material-icons" style={{ fontSize: '12px' }}>open_in_new</span>
                              View details
                            </button>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeAttraction(attraction.id)}
                          className="flex-shrink-0 w-9 h-9 rounded-lg border-2 border-red-100 text-red-400 flex items-center justify-center hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all"
                          title="Remove from itinerary"
                        >
                          <span className="material-icons text-sm">delete_outline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-6">
              {/* Sidebar Card */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden sticky top-24">

                {/* Header */}
                <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <span className="material-icons text-[#006233] text-sm">map</span>
                  </div>
                  <h3 className="font-bold text-stone-900">Trip Details</h3>
                </div>

                <div className="p-6 space-y-4">

                  {/* Attractions count */}
                  <div className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-3 border border-stone-200">
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-[#006233] text-sm">place</span>
                      <span className="text-sm text-stone-600">Attractions</span>
                    </div>
                    <span className="font-bold text-stone-900">{itineraryAttractions.length} planned</span>
                  </div>

                  {/* Date — modifiable */}
                  <div className="bg-stone-50 rounded-xl px-4 py-3 border border-stone-200">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-[#006233] text-sm">event</span>
                        <span className="text-sm text-stone-600">Travel Date</span>
                      </div>
                      <button
                        onClick={() => { setEditingDate(!editingDate); setNewDate(itinerary.dateToGo || ''); }}
                        className="text-xs text-[#006233] hover:underline font-medium flex items-center gap-1"
                      >
                        <span className="material-icons" style={{fontSize:'14px'}}>edit</span>
                        {editingDate ? 'Cancel' : 'Edit'}
                      </button>
                    </div>
                    {editingDate ? (
                      <div className="mt-2 space-y-2">
                        <input
                          type="date"
                          value={newDate}
                          onChange={e => setNewDate(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-[#006233] rounded-lg text-sm text-stone-700 focus:outline-none"
                        />
                        <button
                          onClick={updateDate}
                          className="w-full py-2 bg-[#006233] text-white rounded-lg text-sm font-bold hover:bg-[#004d28] transition-all"
                        >
                          Save Date
                        </button>
                      </div>
                    ) : (
                      <div className="font-bold text-stone-900 text-sm mt-1">
                        {itinerary.dateToGo ? formatDate(itinerary.dateToGo) : 'Not set'}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {itinerary.description && (
                    <p className="text-stone-500 text-sm leading-relaxed px-1">{itinerary.description}</p>
                  )}

                  {/* Séparateur */}
                  <div className="h-px bg-stone-100"></div>

                  {/* Add Attraction */}
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full py-3 bg-gradient-to-r from-[#006233] to-[#004d28] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <span className="material-icons text-sm">add_circle</span>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#006233] to-[#004d28] px-6 py-5 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white serif-font">Add Attraction</h2>
                <p className="text-white/70 text-xs mt-0.5">Select attractions to add to your itinerary</p>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setSearchAdd(''); setFilterType('all'); }}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <span className="material-icons text-sm">close</span>
              </button>
            </div>

            {/* Filters */}
            <div className="px-6 py-4 border-b border-stone-100 flex-shrink-0 space-y-3">
              {/* Search */}
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">search</span>
                <input
                  type="text"
                  placeholder="Search attractions..."
                  value={searchAdd}
                  onChange={e => setSearchAdd(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-[#006233] focus:ring-2 focus:ring-[#006233]/10"
                />
              </div>

              {/* Type filter */}
              <div className="flex gap-2 flex-wrap">
                {uniqueTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
                      filterType === type
                        ? 'bg-[#006233] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Attractions List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {filteredForAdd.length === 0 ? (
                <div className="text-center py-10">
                  <span className="material-icons text-stone-300 text-4xl">search_off</span>
                  <p className="text-stone-500 mt-2 text-sm">No attractions found</p>
                </div>
              ) : (
                filteredForAdd.map(attraction => (
                  <div
                    key={attraction.id}
                    className="flex items-center gap-4 p-3 rounded-xl border border-stone-200 hover:border-[#006233] hover:bg-emerald-50/50 transition-all group"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={attraction.imageUrl || '/images/attraction-placeholder.jpg'}
                        alt={attraction.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-stone-900 text-sm line-clamp-1 serif-font">{attraction.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        {attraction.type && (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                            {attraction.type}
                          </span>
                        )}
                        {attraction.cityName && (
                          <span className="text-xs text-stone-500">{attraction.cityName}</span>
                        )}
                      </div>
                      {attraction.priceProxim !== undefined && (
                        <div className="text-xs font-bold text-emerald-600 mt-0.5">
                          {attraction.priceProxim === 0 ? 'FREE' : `${attraction.priceProxim} MAD`}
                        </div>
                      )}
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={() => addAttraction(attraction.id)}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#006233] to-[#004d28] text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all"
                    >
                      <span className="material-icons text-sm">add</span>
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-stone-100 flex-shrink-0 flex items-center justify-between bg-stone-50">
              <span className="text-xs text-stone-500">{itineraryAttractions.length} attractions in itinerary</span>
              <button
                onClick={() => { setShowAddModal(false); setSearchAdd(''); setFilterType('all'); }}
                className="px-5 py-2 bg-stone-200 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-300 transition-all"
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
