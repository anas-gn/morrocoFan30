import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AttractionDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [attraction, setAttraction] = useState(null);
  const [loading, setLoading] = useState(true);

  // États pour la modale "Add to Itinerary"
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [itineraries, setItineraries] = useState([]);
  const [loadingItineraries, setLoadingItineraries] = useState(false);
  const [notification, setNotification] = useState(null);

  // TODO: remplacer par l'ID du supporter connecté
  const supporterId = 1;

  // Récupérer les détails de l'attraction
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`http://localhost:3309/api/attractions/${id}`)
      .then(res => res.json())
      .then(data => {
        setAttraction(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur:', err);
        setLoading(false);
      });
  }, [id]);

  // Charger les itinéraires du supporter quand on ouvre la modale
  const openItineraryModal = () => {
    setShowItineraryModal(true);
    setLoadingItineraries(true);
    fetch(`http://localhost:3309/api/itineraries/supporter/${supporterId}`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setItineraries(list);
        setLoadingItineraries(false);
      })
      .catch(() => setLoadingItineraries(false));
  };

  // Ajouter l'attraction à un itinéraire
  const addToItinerary = (itineraryId) => {
    fetch(`http://localhost:3309/api/itineraries/${itineraryId}/add-attraction/${id}`, {
      method: 'POST'
    })
      .then(res => res.json())
      .then(success => {
        setShowItineraryModal(false);
        if (success) {
          showNotif('success', 'Attraction added to itinerary!');
        } else {
          showNotif('error', 'Already in this itinerary.');
        }
      })
      .catch(() => showNotif('error', 'Server error.'));
  };

  const showNotif = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  const getTypeIcon = (type) => {
    const icons = {
      Museum: 'museum', Monument: 'account_balance', Park: 'park',
      Beach: 'beach_access', Market: 'shopping_bag', Religious: 'temple_buddhist',
      Historical: 'history_edu', Nature: 'nature', Entertainment: 'celebration'
    };
    return icons[type] || 'place';
  };

  const openInMaps = () => {
    if (attraction?.latitude && attraction?.longitude) {
      window.open(`https://www.google.com/maps?q=${attraction.latitude},${attraction.longitude}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <img src="/images/logo.png" alt="Loading" className="w-20 h-20 mb-4" />
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-stone-700">Attraction not found</h2>
        <button onClick={() => router.push('/attractions')}
          className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all">
          Back to Attractions
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{attraction.name} - Tourist Attraction | MoroccoFan2030</title>
        <meta name="description" content={attraction.description || `Visit ${attraction.name} in Morocco`} />
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
          notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          <span className="material-icons text-sm">
            {notification.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {notification.message}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0 image-overlay">
          <img
            src={attraction.imageUrl || '/images/attraction-placeholder.jpg'}
            alt={attraction.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-10 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-6 pb-12">
            <button
              onClick={() => router.push('/attractions')}
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
            >
              <span className="material-icons text-sm">arrow_back</span>
              <span className="text-sm font-medium">Back to Attractions</span>
            </button>

            <div className="flex items-end justify-between">
              <div>
                {attraction.type && (
                  <div className="mb-3">
                    <span className="px-4 py-1.5 bg-emerald-500/90 backdrop-blur-md border border-emerald-400/30 rounded-full text-white text-sm font-bold flex items-center gap-2 w-fit">
                      <span className="material-icons text-sm">{getTypeIcon(attraction.type)}</span>
                      {attraction.type}
                    </span>
                  </div>
                )}
                <h1 className="text-6xl md:text-7xl font-bold text-white mb-3 serif-font">
                  {attraction.name}
                </h1>
                {attraction.address && (
                  <div className="flex items-center gap-3 text-white/90 text-lg">
                    <span className="material-icons">location_on</span>
                    <span className="font-medium">{attraction.address}</span>
                  </div>
                )}
              </div>

              <div className="hidden md:flex gap-6">
                {attraction.priceProxim !== undefined && (
                  <div className="text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-4">
                    <div className="text-3xl font-bold text-white mb-1">
                      {attraction.priceProxim === 0 ? 'FREE' : `${attraction.priceProxim}`}
                    </div>
                    <div className="text-xs text-white/80 uppercase tracking-wider">
                      {attraction.priceProxim > 0 ? 'MAD' : 'Entry'}
                    </div>
                  </div>
                )}
                {attraction.houreOfOpening && attraction.houreOfClosing && (
                  <div className="text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-4">
                    <div className="text-lg font-bold text-white mb-1">{formatTime(attraction.houreOfOpening)}</div>
                    <div className="text-xs text-white/80 uppercase tracking-wider mb-1">to</div>
                    <div className="text-lg font-bold text-white">{formatTime(attraction.houreOfClosing)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 bg-gradient-to-br from-stone-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">

              {/* Description */}
              <div className="bg-white rounded-2xl border border-stone-200 p-8">
                <h2 className="text-3xl font-bold text-stone-900 mb-4 serif-font flex items-center gap-3">
                  <span className="material-icons text-emerald-500">info</span>
                  About this place
                </h2>
                <p className="text-lg text-stone-600 leading-relaxed">
                  {attraction.description || `Discover ${attraction.name}, a magnificent attraction in Morocco.`}
                </p>
              </div>

              {/* Google Maps embed */}
              {attraction.latitude && attraction.longitude && (
                <div className="bg-white rounded-2xl border border-stone-200 p-8">
                  <h2 className="text-3xl font-bold text-stone-900 mb-4 serif-font flex items-center gap-3">
                    <span className="material-icons text-emerald-500">map</span>
                    Location
                  </h2>

                  {/* Carte Google Maps embarquée via iframe OpenStreetMap (pas besoin de clé API) */}
                  <div className="rounded-xl overflow-hidden border border-stone-200 mb-4" style={{ height: '350px' }}>
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${attraction.longitude - 0.01}%2C${attraction.latitude - 0.01}%2C${attraction.longitude + 0.01}%2C${attraction.latitude + 0.01}&layer=mapnik&marker=${attraction.latitude}%2C${attraction.longitude}`}
                      style={{ border: 0 }}
                      allowFullScreen
                    />
                  </div>

                  <button
                    onClick={openInMaps}
                    className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-icons">directions</span>
                    Open in Google Maps
                  </button>
                </div>
              )}

              {/* Practical Information */}
              <div className="bg-white rounded-2xl border border-stone-200 p-8">
                <h2 className="text-3xl font-bold text-stone-900 mb-6 serif-font flex items-center gap-3">
                  <span className="material-icons text-emerald-500">event_available</span>
                  Practical Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {attraction.houreOfOpening && attraction.houreOfClosing && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="material-icons text-emerald-600">schedule</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 mb-1">Opening Hours</h3>
                        <p className="text-stone-600">{formatTime(attraction.houreOfOpening)} - {formatTime(attraction.houreOfClosing)}</p>
                        <p className="text-xs text-stone-500 mt-1">Daily</p>
                      </div>
                    </div>
                  )}
                  {attraction.priceProxim !== undefined && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="material-icons text-amber-600">payments</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 mb-1">Entrance Fee</h3>
                        <p className="text-2xl font-bold text-amber-600">
                          {attraction.priceProxim === 0 ? 'FREE' : `${attraction.priceProxim} MAD`}
                        </p>
                        <p className="text-xs text-stone-500 mt-1">Approximate price</p>
                      </div>
                    </div>
                  )}
                  {attraction.address && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="material-icons text-blue-600">place</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 mb-1">Address</h3>
                        <p className="text-stone-600">{attraction.address}</p>
                      </div>
                    </div>
                  )}
                  {attraction.type && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="material-icons text-purple-600">{getTypeIcon(attraction.type)}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 mb-1">Category</h3>
                        <p className="text-stone-600">{attraction.type}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              {/* ── Plan Your Visit Card ── */}
              <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden sticky top-24 shadow-sm">

                {/* Header */}
                <div className="px-6 py-5 border-b border-stone-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <span className="material-icons text-[#006233] text-sm">explore</span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900 uppercase tracking-wider">Plan Your Visit</h3>
                </div>

                <div className="p-6 space-y-4">

                  {/* Stats rapides */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-[#006233] mb-0.5">
                        {attraction.priceProxim === 0 ? 'FREE' : `${attraction.priceProxim}`}
                      </div>
                      <div className="text-stone-400 text-xs uppercase tracking-wider">
                        {attraction.priceProxim > 0 ? 'MAD' : 'Entry'}
                      </div>
                    </div>
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
                      <div className="text-xs font-bold text-[#006233] mb-0.5">
                        {attraction.houreOfOpening && attraction.houreOfClosing
                          ? `${attraction.houreOfOpening?.substring(0,5)} – ${attraction.houreOfClosing?.substring(0,5)}`
                          : 'Open'}
                      </div>
                      <div className="text-stone-400 text-xs uppercase tracking-wider">Hours</div>
                    </div>
                  </div>

                  {/* Type badge */}
                  {attraction.type && (
                    <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5">
                      <span className="material-icons text-[#006233] text-sm">
                        {attraction.type === 'Market' ? 'shopping_bag' : 'place'}
                      </span>
                      <span className="text-stone-500 text-xs uppercase tracking-wider">Category</span>
                      <span className="ml-auto text-stone-900 font-bold text-sm">{attraction.type}</span>
                    </div>
                  )}

                  {/* Adresse */}
                  {attraction.address && (
                    <div className="flex items-start gap-2 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
                      <span className="material-icons text-[#C1272D] text-sm mt-0.5">location_on</span>
                      <p className="text-stone-600 text-xs leading-relaxed">{attraction.address}</p>
                    </div>
                  )}

                  {/* Séparateur */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-stone-100"></div>
                    <span className="text-stone-300 text-xs">✦</span>
                    <div className="flex-1 h-px bg-stone-100"></div>
                  </div>

                  {/* Bouton Add to Itinerary */}
                  <button
                    onClick={openItineraryModal}
                    className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-[#006233] to-[#004d28] text-white hover:shadow-lg hover:shadow-emerald-500/20"
                  >
                    <span className="material-icons text-sm">bookmark_add</span>
                    Add to My Itinerary
                  </button>

                  {/* Get Directions */}
                  {attraction.latitude && attraction.longitude && (
                    <button
                      onClick={openInMaps}
                      className="w-full py-3 rounded-xl font-medium text-sm border-2 border-stone-200 text-stone-700 hover:border-[#006233] hover:text-[#006233] transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-icons text-sm">near_me</span>
                      Get Directions
                    </button>
                  )}

                </div>
              </div>

              {/* ── Visitor Tips Card ── */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-icons text-amber-600 text-3xl">lightbulb</span>
                  <h3 className="text-xl font-bold text-stone-900">Visitor Tips</h3>
                </div>
                <ul className="space-y-3 text-sm text-stone-700">
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-amber-500 text-sm mt-0.5">check_circle</span>
                    <span>Arrive early to avoid crowds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-amber-500 text-sm mt-0.5">check_circle</span>
                    <span>Bring comfortable walking shoes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-amber-500 text-sm mt-0.5">check_circle</span>
                    <span>Don't forget your camera</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-amber-500 text-sm mt-0.5">check_circle</span>
                    <span>Respect local customs and traditions</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Modale : Choisir un itinéraire */}
      {showItineraryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white serif-font">Add to Itinerary</h2>
                <p className="text-white/70 text-xs mt-0.5">Choose which itinerary to add this attraction to</p>
              </div>
              <button
                onClick={() => setShowItineraryModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <span className="material-icons text-sm">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {loadingItineraries ? (
                <div className="text-center py-8">
                  <span className="material-icons text-stone-300 text-4xl animate-spin">autorenew</span>
                  <p className="text-stone-500 mt-2 text-sm">Loading itineraries...</p>
                </div>
              ) : itineraries.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-icons text-stone-300 text-4xl">map</span>
                  <p className="text-stone-600 font-medium mt-2">No itineraries yet</p>
                  <p className="text-stone-400 text-sm mb-4">Create one first!</p>
                  <button
                    onClick={() => { setShowItineraryModal(false); router.push('/itineraries'); }}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all"
                  >
                    Go to My Itineraries
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {itineraries.map(it => (
                    <button
                      key={it.id}
                      onClick={() => addToItinerary(it.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-stone-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                        <span className="material-icons text-white text-sm">map</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-stone-900 group-hover:text-emerald-700 transition-colors serif-font">
                          {it.title}
                        </div>
                        {it.dateToGo && (
                          <div className="text-xs text-stone-500 mt-0.5">{it.dateToGo}</div>
                        )}
                      </div>
                      <span className="material-icons text-stone-300 group-hover:text-emerald-500 transition-colors">
                        add_circle
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex justify-end">
              <button
                onClick={() => setShowItineraryModal(false)}
                className="px-5 py-2 bg-stone-200 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
