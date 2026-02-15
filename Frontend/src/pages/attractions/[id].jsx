import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AttractionDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [attraction, setAttraction]     = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [itineraries, setItineraries]   = useState([]);
  const [loadingItins, setLoadingItins] = useState(false);
  const [toast, setToast]               = useState(null);

  const supporterId = 1; // TODO: replace with real session

  /* ── Fetch attraction ─────────────────────────────────────────── */
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`http://localhost:3309/api/attractions/${id}`)
      .then(r => r.json())
      .then(d => { setAttraction(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  /* ── Open modal ──────────────────────────────────────────────── */
  const openModal = () => {
    setShowModal(true);
    setLoadingItins(true);
    fetch(`http://localhost:3309/api/itineraries/supporter/${supporterId}`)
      .then(r => r.json())
      .then(d => { setItineraries(Array.isArray(d) ? d : []); setLoadingItins(false); })
      .catch(() => setLoadingItins(false));
  };

  /* ── Add to itinerary ─────────────────────────────────────────── */
  const addToItinerary = (itId, itTitle) => {
    fetch(`http://localhost:3309/api/itineraries/${itId}/add-attraction/${id}`, { method: 'POST' })
      .then(r => r.json())
      .then(ok => {
        setShowModal(false);
        showToast(ok ? 'success' : 'error',
          ok ? `Added to "${itTitle}"` : 'Already in this itinerary.');
      })
      .catch(() => showToast('error', 'Server error.'));
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fmt  = t => t ? t.substring(0, 5) : '';
  const maps = () => attraction?.latitude && attraction?.longitude &&
    window.open(`https://www.google.com/maps?q=${attraction.latitude},${attraction.longitude}`, '_blank');

  /* ── Is open now ──────────────────────────────────────────────── */
  const isOpenNow = (() => {
    if (!attraction?.houreOfOpening || !attraction?.houreOfClosing) return null;
    const now = new Date();
    const [oh, om] = attraction.houreOfOpening.split(':').map(Number);
    const [ch, cm] = attraction.houreOfClosing.split(':').map(Number);
    const mins = now.getHours() * 60 + now.getMinutes();
    return mins >= oh * 60 + om && mins <= ch * 60 + cm;
  })();

  /* ── Loading / not found ──────────────────────────────────────── */
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
      <img src="/images/logo.png" alt="" className="w-20 h-20 animate-pulse mb-4" />
    </div>
  );

  if (!attraction) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
      <h2 className="text-2xl font-bold text-zinc-700 mb-4">Attraction not found</h2>
      <button onClick={() => router.back()}
        className="px-6 py-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-700 transition">
        Go back
      </button>
    </div>
  );

  return (
    <>
      <Head>
        <title>{attraction.name} | MoroccoFan2030</title>
        <meta name="description" content={attraction.description || `Visit ${attraction.name}`} />
        <link rel="icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        body       { font-family: 'Outfit', sans-serif; background: #fafafa; color: #18181b; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .no-scroll::-webkit-scrollbar { display: none; }
        .no-scroll  { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both; }
        .d1 { animation-delay:.08s } .d2 { animation-delay:.16s }
        .d3 { animation-delay:.24s } .d4 { animation-delay:.32s }

        @keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        .slide-up { animation: slideUp .3s cubic-bezier(.16,1,.3,1) both; }
        .fade-in  { animation: fadeIn  .2s ease both; }

        .card-lift { transition: transform .25s ease, box-shadow .25s ease; }
        .card-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,.08); }

        .img-zoom img { transition: transform .7s cubic-bezier(.16,1,.3,1); }
        .img-zoom:hover img { transform: scale(1.05); }
      `}</style>

      <Navbar />

      {/* ── Toast ───────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[110] flex items-center gap-3 px-4 py-3 rounded-xl
          shadow-[0_8px_30px_rgba(0,0,0,0.1)] border slide-up text-sm font-medium
          ${toast.type === 'success'
            ? 'bg-white border-zinc-200 text-zinc-700'
            : 'bg-white border-red-100 text-zinc-700'}`}>
          <iconify-icon
            icon={toast.type === 'success' ? 'solar:check-circle-linear' : 'solar:close-circle-linear'}
            class={`text-xl ${toast.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}
          />
          {toast.msg}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <header className="relative min-h-[75vh] flex flex-col justify-end overflow-hidden bg-zinc-900 pt-24">
        <div className="absolute inset-0">
          {attraction.imageUrl
            ? <img src={attraction.imageUrl} alt={attraction.name} className="w-full h-full object-cover opacity-45" />
            : <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950" />
          }
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/60 to-zinc-900/20" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto w-full px-6 pb-14">

          {/* Back */}
          <button onClick={() => router.back()}
            className="group flex items-center gap-2 mb-10 text-white/70 hover:text-white transition fade-up">
            <span className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 transition">
              <iconify-icon icon="solar:arrow-left-linear" class="text-lg" />
            </span>
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-5 fade-up d1">
                {attraction.type && (
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold uppercase tracking-wider text-white/90">
                    {attraction.type}
                  </span>
                )}
                {isOpenNow !== null && (
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border
                    ${isOpenNow
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/15 border-red-500/30 text-red-300'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOpenNow ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {isOpenNow ? 'Open Now' : 'Closed'}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-serif text-6xl lg:text-8xl font-bold text-white leading-none mb-4 fade-up d2">
                {attraction.name}
              </h1>

              {/* Address */}
              {attraction.address && (
                <div className="flex items-center gap-2 text-white/60 text-lg fade-up d3">
                  <iconify-icon icon="solar:map-point-linear" class="text-xl" />
                  <span className="font-light">{attraction.address}</span>
                </div>
              )}
            </div>

            {/* Hero stats */}
            <div className="fade-up d4">
              <div className="flex items-end justify-end gap-8">
                {attraction.priceProxim !== undefined && (
                  <div className="text-right">
                    <div className="text-6xl lg:text-7xl font-bold text-amber-500 mb-1">
                      {attraction.priceProxim === 0 ? 'FREE' : attraction.priceProxim}
                    </div>
                    <div className="text-xs text-white/50 font-bold uppercase tracking-widest">
                      {attraction.priceProxim > 0 ? 'MAD' : 'ENTRY'}
                    </div>
                  </div>
                )}
                {attraction.houreOfOpening && attraction.houreOfClosing && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400 mb-0.5">
                      {fmt(attraction.houreOfOpening)}
                    </div>
                    <div className="text-xs text-white/40 font-bold uppercase tracking-widest mb-1.5">to</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {fmt(attraction.houreOfClosing)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          STICKY ACTION BAR
      ══════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-zinc-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center gap-3">
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition shadow-sm active:scale-[0.98]"
          >
            <iconify-icon icon="solar:add-circle-linear" class="text-base" />
            Add to Itinerary
          </button>

          {attraction.latitude && attraction.longitude && (
            <button
              onClick={maps}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-zinc-200 text-zinc-600 text-sm font-medium hover:border-zinc-900 hover:text-zinc-900 transition active:scale-[0.98]"
            >
              <iconify-icon icon="solar:map-arrow-up-linear" class="text-base" />
              Get Directions
            </button>
          )}

          <div className="flex-1" />

          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-500 text-sm hover:bg-zinc-100 transition">
            <iconify-icon icon="solar:share-linear" class="text-base" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          CONTENT
      ══════════════════════════════════════════════════════════════ */}
      <main className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── Left: description + map ──────────────────────────────── */}
          <div className="lg:col-span-8 space-y-10">

            {/* About */}
            <section className="fade-up">
              <h3 className="font-serif text-3xl font-semibold text-zinc-900 mb-5">About</h3>
              <p className="text-zinc-600 leading-relaxed text-lg font-light">
                {attraction.description ||
                  `Discover ${attraction.name}, a remarkable attraction offering unique cultural experiences and lasting memories.`}
              </p>
            </section>

            {/* Info grid */}
            <section className="fade-up d1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Fee */}
                {attraction.priceProxim !== undefined && (
                  <div className="bg-zinc-50 border border-zinc-100 rounded-[20px] p-6">
                    <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center mb-4">
                      <iconify-icon icon="solar:wallet-money-linear" class="text-xl text-zinc-500" />
                    </div>
                    <div className="text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-1">Entry Fee</div>
                    <div className="text-2xl font-bold text-zinc-900">
                      {attraction.priceProxim === 0 ? 'Free' : `${attraction.priceProxim} MAD`}
                    </div>
                  </div>
                )}

                {/* Hours */}
                {attraction.houreOfOpening && attraction.houreOfClosing && (
                  <div className="bg-zinc-50 border border-zinc-100 rounded-[20px] p-6">
                    <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center mb-4">
                      <iconify-icon icon="solar:clock-circle-linear" class="text-xl text-zinc-500" />
                    </div>
                    <div className="text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-1">Hours</div>
                    <div className="text-2xl font-bold text-zinc-900">
                      {fmt(attraction.houreOfOpening)} – {fmt(attraction.houreOfClosing)}
                    </div>
                    {isOpenNow !== null && (
                      <div className={`text-xs font-semibold mt-1 ${isOpenNow ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isOpenNow ? '● Open Now' : '● Closed'}
                      </div>
                    )}
                  </div>
                )}

                {/* Category */}
                {attraction.type && (
                  <div className="bg-zinc-50 border border-zinc-100 rounded-[20px] p-6">
                    <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center mb-4">
                      <iconify-icon icon="solar:tag-linear" class="text-xl text-zinc-500" />
                    </div>
                    <div className="text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-1">Category</div>
                    <div className="text-2xl font-bold text-zinc-900 capitalize">{attraction.type}</div>
                  </div>
                )}
              </div>
            </section>

            {/* Map */}
            {attraction.latitude && attraction.longitude && (
              <section className="fade-up d2 pt-4 border-t border-zinc-100">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-serif text-3xl font-semibold text-zinc-900">Location</h3>
                  <button onClick={maps}
                    className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition">
                    Open in Maps
                    <iconify-icon icon="solar:arrow-right-up-linear" class="text-base" />
                  </button>
                </div>

                <div className="rounded-[20px] overflow-hidden border border-zinc-200 bg-zinc-50" style={{ height: '380px' }}>
                  <iframe
                    width="100%" height="100%"
                    frameBorder="0" scrolling="no"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${attraction.longitude-0.01}%2C${attraction.latitude-0.01}%2C${attraction.longitude+0.01}%2C${attraction.latitude+0.01}&layer=mapnik&marker=${attraction.latitude}%2C${attraction.longitude}`}
                    style={{ border: 0 }}
                    allowFullScreen
                  />
                </div>

                {/* Coordinates strip */}
                <div className="mt-3 flex items-center justify-between px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-400 font-mono">
                  <span>LAT: {attraction.latitude}</span>
                  <span>LNG: {attraction.longitude}</span>
                </div>
              </section>
            )}
          </div>

          {/* ── Right: sticky info card ──────────────────────────────── */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 space-y-4">

              {/* Info Card */}
              <div className="bg-white rounded-[28px] border border-zinc-200 overflow-hidden shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] fade-up d2">
                <div className="p-6">
                  <h3 className="text-base font-semibold text-zinc-900 mb-6 flex items-center gap-2">
                    <iconify-icon icon="solar:info-circle-linear" class="text-xl text-zinc-400" />
                    Visitor Information
                  </h3>

                  <div className="divide-y divide-dashed divide-zinc-200">

                    {attraction.priceProxim !== undefined && (
                      <div className="flex items-center justify-between py-4 first:pt-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                            <iconify-icon icon="solar:wallet-money-linear" class="text-base text-zinc-500" />
                          </div>
                          <span className="text-sm font-medium text-zinc-600">Entry Fee</span>
                        </div>
                        <span className="text-sm font-semibold text-zinc-900">
                          {attraction.priceProxim === 0 ? 'Free' : `${attraction.priceProxim} MAD`}
                        </span>
                      </div>
                    )}

                    {attraction.houreOfOpening && attraction.houreOfClosing && (
                      <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                            <iconify-icon icon="solar:clock-circle-linear" class="text-base text-zinc-500" />
                          </div>
                          <span className="text-sm font-medium text-zinc-600">Hours</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-sm font-semibold text-zinc-900">
                            {fmt(attraction.houreOfOpening)} – {fmt(attraction.houreOfClosing)}
                          </span>
                          {isOpenNow !== null && (
                            <span className={`block text-xs font-semibold mt-0.5 ${isOpenNow ? 'text-emerald-600' : 'text-red-500'}`}>
                              {isOpenNow ? 'Open Now' : 'Closed'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {attraction.type && (
                      <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                            <iconify-icon icon="solar:tag-linear" class="text-base text-zinc-500" />
                          </div>
                          <span className="text-sm font-medium text-zinc-600">Category</span>
                        </div>
                        <span className="text-sm font-semibold text-zinc-900 capitalize">{attraction.type}</span>
                      </div>
                    )}

                    {attraction.address && (
                      <div className="flex items-start justify-between py-4 last:pb-0 gap-4">
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                            <iconify-icon icon="solar:map-point-linear" class="text-base text-zinc-500" />
                          </div>
                          <span className="text-sm font-medium text-zinc-600">Address</span>
                        </div>
                        <span className="text-sm font-semibold text-zinc-900 text-right leading-snug">
                          {attraction.address}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA buttons */}
                  <div className="mt-6 pt-5 border-t border-zinc-100 grid gap-3">
                    <button
                      onClick={openModal}
                      className="w-full flex items-center justify-center gap-2 h-11 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-700 transition shadow-sm active:scale-[0.98]"
                    >
                      <iconify-icon icon="solar:add-circle-linear" class="text-base" />
                      Add to Itinerary
                    </button>
                    {attraction.latitude && attraction.longitude && (
                      <button
                        onClick={maps}
                        className="w-full flex items-center justify-center gap-2 h-11 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-50 transition active:scale-[0.98]"
                      >
                        <iconify-icon icon="solar:map-arrow-up-linear" class="text-base" />
                        Get Directions
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tips card */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-[28px] p-6 fade-up d3">
                <h3 className="text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                  <iconify-icon icon="solar:lightbulb-bolt-linear" class="text-xl text-amber-500" />
                  Visitor Tips
                </h3>
                <ul className="space-y-3">
                  {[
                    { icon: 'solar:clock-circle-linear',          text: 'Arrive early to avoid crowds'          },
                    { icon: 'solar:walking-round-linear',         text: 'Wear comfortable walking shoes'        },
                    { icon: 'solar:camera-linear',                text: "Don't forget your camera"              },
                    { icon: 'solar:hand-heart-linear',            text: 'Respect local customs & traditions'    },
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-600">
                      <iconify-icon icon={t.icon} class="text-zinc-400 text-base mt-0.5 shrink-0" />
                      {t.text}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />

      {/* ══════════════════════════════════════════════════════════════
          ITINERARY MODAL
      ══════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            onClick={() => setShowModal(false)}
            className="fade-in absolute inset-0 bg-zinc-900/20 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal */}
          <div className="slide-up relative bg-white w-full max-w-md rounded-[28px] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.12)] border border-zinc-200 overflow-hidden">

            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-100 flex items-start justify-between">
              <div>
                <h3 className="font-serif text-xl font-semibold text-zinc-900">Add to Itinerary</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Select a plan to save this attraction</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition"
              >
                <iconify-icon icon="solar:close-circle-linear" class="text-xl" />
              </button>
            </div>

            {/* Body */}
            <div className="p-2 max-h-[340px] overflow-y-auto no-scroll bg-zinc-50/50">
              {loadingItins ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-10 h-10 border-[3px] border-zinc-900 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-zinc-400 font-medium">Loading itineraries…</p>
                </div>
              ) : itineraries.length === 0 ? (
                <div className="text-center py-10 px-6">
                  <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <iconify-icon icon="solar:map-linear" class="text-3xl text-zinc-300" />
                  </div>
                  <p className="text-zinc-900 font-semibold mb-1">No itineraries yet</p>
                  <p className="text-xs text-zinc-400 mb-5">Create your first plan to start organising your trip.</p>
                  <button
                    onClick={() => { setShowModal(false); router.push('/itineraries'); }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-700 transition"
                  >
                    <iconify-icon icon="solar:add-circle-linear" class="text-base" />
                    Create Itinerary
                  </button>
                </div>
              ) : (
                itineraries.map(it => (
                  <button
                    key={it.id}
                    onClick={() => addToItinerary(it.id, it.title)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200 transition-all group text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-colors shrink-0">
                      <iconify-icon icon="solar:calendar-linear" class="text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-zinc-900 truncate">{it.title}</h4>
                      {it.dateToGo && (
                        <span className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                          <iconify-icon icon="solar:calendar-linear" class="text-[11px]" />
                          {it.dateToGo}
                        </span>
                      )}
                    </div>
                    <iconify-icon
                      icon="solar:add-circle-linear"
                      class="text-xl text-zinc-300 group-hover:text-zinc-900 transition-colors shrink-0"
                    />
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-zinc-100 bg-white flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-sm font-medium hover:bg-zinc-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}