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

export default function CityDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [city, setCity]               = useState(null);
  const [hotels, setHotels]           = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [stadiums, setStadiums]       = useState([]);
  const [matches, setMatches]         = useState([]);
  const [images, setImages]           = useState([]);
  const [activeTab, setActiveTab]     = useState('overview');
  const [loading, setLoading]         = useState(true);
  const [lightbox, setLightbox]       = useState(null);

  useEffect(() => {
    if (!id) return;
    const cityId = parseInt(id);
    (async () => {
      setLoading(true);
      try {
        const allCities = await safeFetch(`${API}/acceuil/CityHosts/all`);
        const cityData  = Array.isArray(allCities)
          ? allCities.find(c => c.id === cityId) ?? null
          : null;
        setCity(cityData);

        const attrData = await safeFetch(`${API}/attractions/city/${id}`);
        setAttractions(Array.isArray(attrData) ? attrData : []);

        const allHotels = await safeFetch(`${API}/hotels/all`);
        const cityHotels = Array.isArray(allHotels)
          ? allHotels.filter(h => h.cityHostId === cityId)
          : [];
        setHotels(cityHotels);

        const allStades  = await safeFetch(`${API}/acceuil/stade/all`);
        const cityStades = Array.isArray(allStades)
          ? allStades.filter(s => s.cityId === cityId)
          : [];
        setStadiums(cityStades);

        if (cityStades.length > 0) {
          const mResults = await Promise.all(
            cityStades.map(st => safeFetch(`${API}/matches/matches/stade/${st.id}`))
          );
          setMatches(mResults.flat().filter(Boolean));
        }

        const imgs = await safeFetch(`${API}/cities/images/city/${id}`);
        setImages(Array.isArray(imgs) ? imgs : []);

      } catch (err) {
        console.error('Error loading city:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const getStatus = (s) => ({
    'LIVE':     { label: 'Live', cls: 'bg-red-500/10 text-red-600 border-red-200' },
    'started':  { label: 'Live', cls: 'bg-red-500/10 text-red-600 border-red-200' },
    'commence': { label: 'Live', cls: 'bg-red-500/10 text-red-600 border-red-200' },
    'termine':  { label: 'Finished',   cls: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
    'Finished': { label: 'Finished',   cls: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
    'upcoming': { label: 'Upcoming',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  }[s] || { label: 'Scheduled', cls: 'bg-zinc-50 text-zinc-500 border-zinc-200' });

  const isLive = (s) => ['LIVE', 'started', 'commence'].includes(s);

  const TABS = [
    { key: 'overview',    label: 'Overview',      icon: 'solar:widget-linear',               badge: null              },
    { key: 'hotels',      label: 'Stay',          icon: 'solar:bed-linear',                  badge: hotels.length     },
    { key: 'attractions', label: 'Discover',      icon: 'solar:map-point-school-linear',     badge: attractions.length},
    { key: 'stadiums',    label: 'Stadiums',      icon: 'solar:structure-linear',            badge: stadiums.length   },
    { key: 'matches',     label: 'Matches',       icon: 'solar:calendar-linear',             badge: matches.length    },
    { key: 'gallery',     label: 'Gallery',       icon: 'solar:gallery-minimalistic-linear', badge: images.length     },
  ];

  /* ── Loading ── */
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
      <img src="/images/logo.png" alt="" className="w-20 h-20 animate-pulse mb-4" />
    </div>
  );

  if (!city) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
      <h2 className="text-2xl font-bold text-zinc-700 mb-4">City not found</h2>
      <button onClick={() => router.push('/cities')}
        className="px-6 py-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-700 transition " >
        Back to cities
      </button>
    </div>
  );

  /* ── Render ── */
  return (
    <>
      <Head>
        <title>{city.name} — Host City | MoroccoFan2030</title>
        <meta name="description" content={city.description || `Discover ${city.name}`} />
        <link rel="icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        body { font-family: 'Outfit', sans-serif; background: #fafafa; color: #18181b; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .no-scroll::-webkit-scrollbar { display: none; }
        .no-scroll { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both; }
        .d1 { animation-delay:.08s } .d2 { animation-delay:.16s }
        .d3 { animation-delay:.24s } .d4 { animation-delay:.32s }

        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.4} }
        .live-dot { animation: pulse-dot 1.4s ease-in-out infinite; }

        .card-lift { transition: transform .25s ease, box-shadow .25s ease; }
        .card-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,.08); }
        
        .stadium-card-bg {
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        
        .stadium-card-overlay {
          background: linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.4) 100%);
        }
        
        @media (max-width: 1024px) {
          .stadium-card-overlay {
            background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 60%);
          }
        }

        /* Overview card backgrounds */
        .overview-card-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .overview-card-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: inherit;
          filter: blur(20px);
          opacity: 0.3;
        }
      `}</style>

      <Navbar />

      {/* ══ HERO ══ */}
      <header className="relative min-h-[80vh] flex flex-col justify-end overflow-hidden bg-zinc-900 pt-24">
        <div className="absolute inset-0">
          {city.imageUrl
            ? <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover opacity-45" />
            : <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950" />
          }
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/60 to-zinc-900/20" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto w-full px-6 pb-14">
          <button onClick={() => router.push('/cities')}
            className="group flex items-center gap-2 mb-10 text-white/70 hover:text-white transition fade-up">
            <span className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 transition">
              <iconify-icon icon="solar:arrow-left-linear" class="text-lg" />
            </span>
            <span className="text-sm font-medium">Back to cities</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
            <div>
              <div className="flex items-center gap-3 mb-5 fade-up d1">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold uppercase tracking-wider text-white/90">
                  Host City
                </span>
                {city.region && (
                  <span className="flex items-center gap-1.5 text-white/60 text-sm">
                    <iconify-icon icon="solar:map-point-linear" />
                    {city.region}
                  </span>
                )}
              </div>

              <h1 className="font-serif text-7xl lg:text-9xl font-bold text-white leading-none mb-4 fade-up d2">
                {city.name}
              </h1>

              <div className="flex items-center gap-2 text-white/60 text-lg fade-up d3">
                <iconify-icon icon="solar:globe-linear" class="text-xl" />
                <span className="font-light">{city.country}</span>
              </div>
            </div>

            <div className="fade-up d4">
              <div className="flex items-end justify-end gap-8">
                {[
                  { val: hotels.length,      label:'HOTELS',      color:'text-red-500'     },
                  { val: attractions.length, label:'ATTRACTIONS', color:'text-amber-500'   },
                  { val: stadiums.length,    label:'STADIUMS',    color:'text-emerald-500' },
                ].map((s, i) => (
                  <div key={i} className="text-right">
                    <div className={`text-6xl lg:text-7xl font-bold ${s.color} mb-1`}>
                      {s.val}
                    </div>
                    <div className="text-xs text-white/50 font-bold uppercase tracking-widest">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ══ STICKY TABS ══ */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-zinc-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6">
          <nav className="flex items-center gap-1 overflow-x-auto no-scroll py-3">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                  ${activeTab === tab.key
                    ? 'bg-zinc-900 text-white shadow-md'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}>
                <iconify-icon icon={tab.icon} class="text-base" />
                {tab.label}
                {tab.badge !== null && tab.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                    ${activeTab === tab.key ? 'bg-white text-zinc-900' : 'bg-zinc-200 text-zinc-600'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <main className="max-w-[1400px] mx-auto px-6 py-12 min-h-[60vh]">

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 fade-up">
            <div className="md:col-span-8 bg-zinc-50 border border-zinc-100 rounded-[28px] p-8 lg:p-12">
              <h2 className="font-serif text-3xl font-semibold text-zinc-900 mb-5">
                About {city.name}
              </h2>
              <p className="text-zinc-600 text-lg leading-relaxed font-light">
                {city.description || `${city.name} is one of the magnificent host cities for the 2030 World Cup. Discover its culture, infrastructure, and warm hospitality.`}
              </p>
              <div className="mt-8 pt-8 border-t border-zinc-200 grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { l:'Region', v: city.region  || '—'              },
                  { l:'Country',   v: city.country  || '—'          },
                  { l:'Matches', v: `${matches.length} scheduled`   },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-1">{s.l}</div>
                    <div className="text-xl font-semibold text-zinc-900">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-4 grid grid-cols-2 gap-4">
              {[
                { icon:'solar:bed-linear',                val: hotels.length,      label:'Hotels',      ring:'ring-amber-100',   bg:'bg-amber-50',   ic:'text-amber-500',   tab:'hotels'      },
                { icon:'solar:map-point-school-linear',   val: attractions.length, label:'Attractions', ring:'ring-emerald-100', bg:'bg-emerald-50', ic:'text-emerald-500', tab:'attractions' },
                { icon:'solar:structure-linear',          val: stadiums.length,    label:'Stadiums',    ring:'ring-rose-100',    bg:'bg-rose-50',    ic:'text-rose-500',    tab:'stadiums'    },
                { icon:'solar:calendar-linear',           val: matches.length,     label:'Matches',     ring:'ring-blue-100',    bg:'bg-blue-50',    ic:'text-blue-500',    tab:'matches'     },
              ].map((s, i) => (
                <div key={i}
                  className={`bg-white border border-zinc-200 rounded-2xl p-5 hover:ring-2 ${s.ring} transition group card-lift cursor-pointer`}
                  onClick={() => setActiveTab(s.tab)}>
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <iconify-icon icon={s.icon} class={`text-xl ${s.ic}`} />
                  </div>
                  <div className="text-2xl font-bold text-zinc-900 tracking-tight">{s.val}</div>
                  <div className="text-xs text-zinc-500 font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Explore Stadiums Card with Background */}
            <div onClick={() => setActiveTab('stadiums')}
              className="md:col-span-6 text-white rounded-[28px] p-8 cursor-pointer group overflow-hidden relative card-lift"
              style={{ minHeight: '200px' }}>
              {/* Background Image */}
              {stadiums[0]?.imageUrl && (
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${stadiums[0].imageUrl})` }}
                />
              )}
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/90 via-zinc-900/85 to-zinc-800/80" />
              
              <div className="relative z-10 flex flex-col justify-between min-h-[160px]">
                <div className="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-zinc-900 transition-all">
                  <iconify-icon icon="solar:arrow-right-up-linear" class="text-xl" />
                </div>
                <div>
                  <h4 className="text-2xl font-semibold mb-1.5">Explore stadiums</h4>
                  <p className="text-white/70 text-sm font-light">World-class infrastructure for the 2030 World Cup</p>
                </div>
              </div>
              <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-white/5 rounded-full blur-3xl" />
            </div>

            {/* Match Schedule Card with Background */}
            <div onClick={() => setActiveTab('matches')}
              className="md:col-span-6 bg-white border border-zinc-200 rounded-[28px] p-8 cursor-pointer group card-lift hover:border-zinc-300 hover:shadow-lg overflow-hidden relative"
              style={{ minHeight: '200px' }}>
              {/* Subtle Football/Soccer Pattern Background */}
              <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="soccer-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                      <circle cx="40" cy="40" r="25" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M 40 15 L 40 20 M 40 60 L 40 65 M 15 40 L 20 40 M 60 40 L 65 40" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M 25 25 L 29 29 M 51 51 L 55 55 M 55 25 L 51 29 M 29 51 L 25 55" stroke="currentColor" strokeWidth="1.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#soccer-pattern)" className="text-zinc-900"/>
                </svg>
              </div>
              
              {/* Optional: Add a gradient overlay from corner */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-11 h-11 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all">
                    <iconify-icon icon="solar:calendar-mark-linear" class="text-xl text-zinc-900 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-zinc-100 text-zinc-500 rounded-lg group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">Schedule</span>
                </div>
                <h4 className="text-2xl font-semibold text-zinc-900 mb-1.5 group-hover:text-emerald-900 transition-colors">Match schedule</h4>
                <p className="text-zinc-500 text-sm font-light">Complete calendar of matches scheduled in {city.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── HOTELS ── */}
        {activeTab === 'hotels' && (
          <div className="fade-up">
            <SectionHeader title={`Stay in ${city.name}`} subtitle="Selected accommodations for your comfort" />
            {hotels.length === 0
              ? <EmptyState icon="solar:bed-linear" msg="No accommodations available" />
              : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotels.map((h, i) => (
                    <div key={h.id}
                      onClick={() => router.push(`/hotel/${h.id}`)}
                      className="bg-white rounded-2xl border border-zinc-200 overflow-hidden card-lift group fade-up cursor-pointer"
                      style={{ animationDelay: `${i * 0.07}s` }}>
                      <div className="relative h-52 bg-zinc-100 overflow-hidden">
                        <img
                          src={h.imageUrl || '/images/hotel-placeholder.jpg'}
                          alt={h.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-zinc-900 mb-2">{h.name}</h3>
                        {h.address && (
                          <p className="flex items-start gap-1.5 text-sm text-zinc-500 mb-3">
                            <iconify-icon icon="solar:map-point-linear" class="mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{h.address}</span>
                          </p>
                        )}
                        {h.description && <p className="text-sm text-zinc-500 mb-4 line-clamp-2 font-light">{h.description}</p>}
                        <div className="pt-4 border-t border-zinc-100 space-y-2">
                          {h.phone && (
                            <div className="flex items-center gap-2 text-sm text-zinc-600">
                              <iconify-icon icon="solar:phone-linear" />
                              <span>{h.phone}</span>
                            </div>
                          )}
                          {h.email && (
                            <div className="flex items-center gap-2 text-sm text-zinc-600">
                              <iconify-icon icon="solar:letter-linear" />
                              <span className="truncate">{h.email}</span>
                            </div>
                          )}
                          {h.urlReservation && (
                            <a href={h.urlReservation} target="_blank" rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 hover:text-zinc-600 transition mt-1">
                              <iconify-icon icon="solar:link-linear" />
                              Book now
                              <iconify-icon icon="solar:arrow-right-up-linear" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}

        {/* ── ATTRACTIONS ── */}
        {activeTab === 'attractions' && (
          <div className="fade-up">
            <SectionHeader title={`Discover ${city.name}`} subtitle="Cultural, natural, and tourist sites" />
            {attractions.length === 0
              ? <EmptyState icon="solar:map-point-school-linear" msg="No attractions available" />
              : <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {attractions.map((a, i) => (
                    <div key={a.id}
                      onClick={() => router.push(`/attractions/${a.id}`)}
                      className="bg-white border border-zinc-200 rounded-2xl overflow-hidden card-lift group fade-up md:flex cursor-pointer"
                      style={{ animationDelay: `${i * 0.07}s` }}>
                      <div className="relative md:w-[42%] h-56 md:h-auto bg-zinc-100 flex-shrink-0 overflow-hidden">
                        <img
                          src={a.imageUrl || '/images/attraction-placeholder.jpg'}
                          alt={a.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                        {a.type && (
                          <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-white/90 backdrop-blur rounded-full text-zinc-700">
                            {a.type}
                          </span>
                        )}
                      </div>
                      <div className="p-6 flex flex-col justify-between">
                        <div>
                          <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-2">{a.name}</h3>
                          {a.description && <p className="text-sm text-zinc-500 font-light line-clamp-3 mb-4">{a.description}</p>}
                        </div>
                        <div className="space-y-2 text-sm text-zinc-600">
                          {a.address && (
                            <div className="flex items-start gap-2">
                              <iconify-icon icon="solar:map-point-linear" class="mt-0.5 flex-shrink-0 text-zinc-400" />
                              {a.address}
                            </div>
                          )}
                          {a.houreOfOpening && a.houreOfClosing && (
                            <div className="flex items-center gap-2">
                              <iconify-icon icon="solar:clock-circle-linear" class="text-zinc-400" />
                              {a.houreOfOpening} — {a.houreOfClosing}
                            </div>
                          )}
                          {a.priceProxim > 0 && (
                            <div className="flex items-center gap-2">
                              <iconify-icon icon="solar:wallet-linear" class="text-zinc-400" />
                              <span className="font-semibold text-zinc-800">{Number(a.priceProxim).toFixed(0)} MAD</span>
                            </div>
                          )}
                          {a.latitude && a.longitude && (
                            <a href={`https://www.google.com/maps?q=${a.latitude},${a.longitude}`}
                              target="_blank" rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 font-semibold text-zinc-900 hover:text-zinc-600 transition mt-1">
                              <iconify-icon icon="solar:map-linear" />
                              View on map
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}

        {/* ── STADIUMS ── WITH BACKGROUND IMAGES */}
        {activeTab === 'stadiums' && (
          <div className="fade-up">
            <SectionHeader title={`${city.name} Stadiums`} subtitle="World-class sports infrastructure" />
            {stadiums.length === 0
              ? <EmptyState icon="solar:structure-linear" msg="No stadiums available" />
              : <div className="space-y-6">
                  {stadiums.map((st, i) => (
                    <div
                      key={st.id}
                      onClick={() => router.push(`/stade/${st.id}`)}
                      className="rounded-[28px] overflow-hidden group card-lift fade-up cursor-pointer relative"
                      style={{ 
                        animationDelay: `${i * 0.1}s`,
                        minHeight: '400px'
                      }}
                    >
                      {/* Background Image */}
                      <div 
                        className="absolute inset-0 stadium-card-bg"
                        style={{
                          backgroundImage: `url(${st.imageUrl || '/images/stadium-placeholder.jpg'})`
                        }}
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 stadium-card-overlay" />
                      
                      {/* Content */}
                      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
                        <div className="p-8 lg:p-12 flex flex-col justify-center">
                          <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-widest font-semibold mb-4">
                            <iconify-icon icon="solar:structure-linear" />
                            Infrastructure — {city.name}
                          </div>
                          
                          <h3 className="font-serif text-3xl lg:text-5xl font-bold mb-4 text-white leading-tight">
                            {st.name}
                          </h3>
                          
                          {st.description && (
                            <p className="text-white/80 font-light leading-relaxed mb-8 max-w-md text-lg">
                              {st.description}
                            </p>
                          )}
                          
                          <div className="grid grid-cols-2 gap-6 border-t border-white/20 pt-6 mb-6">
                            {st.capacity && (
                              <div>
                                <div className="text-white/60 text-[11px] uppercase tracking-widest font-semibold mb-2">Capacity</div>
                                <div className="text-4xl font-bold text-white">{Number(st.capacity).toLocaleString()}</div>
                              </div>
                            )}
                            {st.dateOfConstruction && (
                              <div>
                                <div className="text-white/60 text-[11px] uppercase tracking-widest font-semibold mb-2">Built</div>
                                <div className="text-4xl font-bold text-white">{new Date(st.dateOfConstruction).getFullYear()}</div>
                              </div>
                            )}
                          </div>
                          
                          {st.adresse && (
                            <p className="flex items-start gap-2 text-sm text-white/70 mb-6">
                              <iconify-icon icon="solar:map-point-linear" class="mt-0.5 flex-shrink-0" />
                              {st.adresse}
                            </p>
                          )}
                          
                          <button
                            onClick={e => { e.stopPropagation(); router.push(`/stade/${st.id}`); }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-zinc-900 rounded-xl text-sm font-semibold hover:bg-zinc-100 transition w-max group-hover:scale-105"
                          >
                            <iconify-icon icon="solar:arrow-right-up-linear" class="text-lg" />
                            View stadium
                          </button>
                        </div>
                        
                        {/* Right side - Let background show through */}
                        <div className="hidden lg:flex items-center justify-center p-8">
                          <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                            <iconify-icon icon="solar:arrow-right-up-linear" class="text-white text-3xl" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}

        {/* ── MATCHES ── MOBILE-OPTIMIZED STRUCTURE */}
        {activeTab === 'matches' && (
          <div className="fade-up">
            <SectionHeader title={`Matches in ${city.name}`} subtitle="Complete schedule of matches in this city" />
            {matches.length === 0
              ? <EmptyState icon="solar:calendar-linear" msg="No matches scheduled" />
              : <div className="max-w-4xl mx-auto space-y-3">
                  {[...matches]
                    .sort((a, b) => new Date(a.dateOfMatch) - new Date(b.dateOfMatch))
                    .map((m, i) => {
                      const status = getStatus(m.statut);
                      const live   = isLive(m.statut);
                      const team1  = m.matchTeams?.[0];
                      const team2  = m.matchTeams?.[1];
                      const date   = new Date(m.dateOfMatch);
                      
                      return (
                        <div 
                          key={m.id}
                          onClick={() => router.push(`/match/${m.id}`)}
                          className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl overflow-hidden cursor-pointer transition group fade-up hover:shadow-lg"
                          style={{ animationDelay: `${i * 0.05}s` }}
                        >
                          {/* Match Header - Optimized for mobile */}
                          <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-semibold text-zinc-700">
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <span className="text-zinc-300">•</span>
                              <span className="font-bold text-zinc-900">
                                {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold border ${status.cls}`}>
                              {live && <span className="w-1 h-1 rounded-full bg-red-500 live-dot" />}
                              {status.label}
                            </div>
                          </div>
                          
                          {/* Match Content - Mobile Layout */}
                          <div className="p-4">
                            {/* Desktop Layout */}
                            <div className="hidden md:flex items-center justify-between gap-6">
                              {/* Team 1 */}
                              <div className="flex items-center gap-3 flex-1">
                                <img
                                  src={team1?.imageUrl || '/images/team-placeholder.png'}
                                  alt={team1?.teamName}
                                  className="w-14 h-14 rounded-full object-cover border-2 border-zinc-100 flex-shrink-0"
                                  onError={e => { e.target.style.display = 'none'; }}
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-zinc-900 text-base truncate">
                                    {team1?.teamName || 'TBD'}
                                  </div>
                                  {team1?.country && (
                                    <div className="text-xs text-zinc-500">{team1.country}</div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Score/VS */}
                              <div className="flex flex-col items-center justify-center px-4">
                                {m.statut !== 'upcoming' ? (
                                  <>
                                    <div className={`text-3xl font-bold tracking-tight ${live ? 'text-red-600' : 'text-zinc-900'}`}>
                                      {team1?.goals ?? 0} – {team2?.goals ?? 0}
                                    </div>
                                    {live && (
                                      <div className="text-xs text-red-600 font-semibold mt-1 uppercase">Live</div>
                                    )}
                                  </>
                                ) : (
                                  <div className="text-2xl font-light text-zinc-300">VS</div>
                                )}
                                {m.type && (
                                  <div className="text-[9px] text-zinc-400 font-medium mt-1.5 uppercase tracking-wider">
                                    {m.type}
                                  </div>
                                )}
                              </div>
                              
                              {/* Team 2 */}
                              <div className="flex items-center gap-3 flex-1 flex-row-reverse">
                                <img
                                  src={team2?.imageUrl || '/images/team-placeholder.png'}
                                  alt={team2?.teamName}
                                  className="w-14 h-14 rounded-full object-cover border-2 border-zinc-100 flex-shrink-0"
                                  onError={e => { e.target.style.display = 'none'; }}
                                />
                                <div className="min-w-0 text-right">
                                  <div className="font-bold text-zinc-900 text-base truncate">
                                    {team2?.teamName || 'TBD'}
                                  </div>
                                  {team2?.country && (
                                    <div className="text-xs text-zinc-500">{team2.country}</div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Mobile Layout - Vertical Stack */}
                            <div className="md:hidden space-y-3">
                              {/* Teams Container */}
                              <div className="flex items-center justify-between">
                                {/* Team 1 - Left */}
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <img
                                    src={team1?.imageUrl || '/images/team-placeholder.png'}
                                    alt={team1?.teamName}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-zinc-100 flex-shrink-0"
                                    onError={e => { e.target.style.display = 'none'; }}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="font-bold text-zinc-900 text-sm truncate">
                                      {team1?.teamName || 'TBD'}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Score - Center */}
                                <div className="flex flex-col items-center justify-center px-3 flex-shrink-0">
                                  {m.statut !== 'upcoming' ? (
                                    <div className={`text-xl font-bold ${live ? 'text-red-600' : 'text-zinc-900'}`}>
                                      {team1?.goals ?? 0} – {team2?.goals ?? 0}
                                    </div>
                                  ) : (
                                    <div className="text-lg font-light text-zinc-300">VS</div>
                                  )}
                                </div>
                                
                                {/* Team 2 - Right */}
                                <div className="flex items-center gap-2 flex-1 min-w-0 flex-row-reverse">
                                  <img
                                    src={team2?.imageUrl || '/images/team-placeholder.png'}
                                    alt={team2?.teamName}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-zinc-100 flex-shrink-0"
                                    onError={e => { e.target.style.display = 'none'; }}
                                  />
                                  <div className="min-w-0 flex-1 text-right">
                                    <div className="font-bold text-zinc-900 text-sm truncate">
                                      {team2?.teamName || 'TBD'}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Match Type - Mobile */}
                              {m.type && (
                                <div className="text-center">
                                  <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider px-2 py-1 bg-zinc-50 rounded-full">
                                    {m.type}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Stadium Info - Same for both */}
                            {m.stadeName && (
                              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-zinc-600 min-w-0">
                                  <iconify-icon icon="solar:structure-linear" class="text-zinc-400 flex-shrink-0" />
                                  <span className="font-medium truncate">{m.stadeName}</span>
                                </div>
                                <iconify-icon 
                                  icon="solar:arrow-right-linear"
                                  class="text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all text-lg flex-shrink-0" 
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
            }
          </div>
        )}

        {/* ── GALLERY ── */}
        {activeTab === 'gallery' && (
          <div className="fade-up">
            <SectionHeader title={`${city.name} Gallery`} subtitle="Discover the city in images" />
            {images.length === 0
              ? <EmptyState icon="solar:gallery-minimalistic-linear" msg="No images available" />
              : <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img, i) => (
                      <div key={img.id}
                        onClick={() => setLightbox(img.imageUrl)}
                        className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group card-lift fade-up"
                        style={{ animationDelay: `${i * 0.04}s` }}>
                        <img src={img.imageUrl} alt={`${city.name} ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                          <iconify-icon icon="solar:eye-linear" class="text-white text-3xl opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {lightbox && (
                    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
                      onClick={() => setLightbox(null)}>
                      <button
                        className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition"
                        onClick={() => setLightbox(null)}>
                        <iconify-icon icon="solar:close-circle-linear" class="text-2xl" />
                      </button>
                      <img src={lightbox} alt="Full view"
                        className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
                        onClick={e => e.stopPropagation()} />
                    </div>
                  )}
                </>
            }
          </div>
        )}

      </main>

      <Footer />
    </>
  );
}

/* ── Sub-components ── */
function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h2 className="font-serif text-4xl font-semibold text-zinc-900 mb-2">{title}</h2>
      <p className="text-zinc-500 text-lg font-light">{subtitle}</p>
    </div>
  );
}

function EmptyState({ icon, msg }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-zinc-50 rounded-2xl border border-zinc-100">
      <div className="w-20 h-20 bg-white border border-zinc-200 rounded-full flex items-center justify-center mb-4">
        <iconify-icon icon={icon} class="text-zinc-300 text-4xl" />
      </div>
      <p className="text-zinc-500 font-medium">{msg}</p>
    </div>
  );
}