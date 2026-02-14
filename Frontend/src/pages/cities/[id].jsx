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
    console.error(`[safeFetch] Erreur — ${url}`, err);
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

        // ✅ City info — AcceuilController a le CORS configuré.
        // CityHostController (/api/cities/{id}) n'a pas @CrossOrigin → bloque en browser.
        // On fetch toutes les villes et on filtre par id.
        const allCities = await safeFetch(`${API}/acceuil/CityHosts/all`);
        const cityData  = Array.isArray(allCities)
          ? allCities.find(c => c.id === cityId) ?? null
          : null;
        setCity(cityData);

        // ✅ Attractions — AttractionController fonctionne correctement
        const attrData = await safeFetch(`${API}/attractions/city/${id}`);
        setAttractions(Array.isArray(attrData) ? attrData : []);

        // ✅ Hotels — HotelController a @CrossOrigin(origins="*") → filtre par cityHostId
        const allHotels = await safeFetch(`${API}/hotels/all`);
        const cityHotels = Array.isArray(allHotels)
          ? allHotels.filter(h => h.cityHostId === cityId)
          : [];
        setHotels(cityHotels);

        // ✅ Stades — AcceuilController fonctionne → filtre par cityId
        const allStades  = await safeFetch(`${API}/acceuil/stade/all`);
        const cityStades = Array.isArray(allStades)
          ? allStades.filter(s => s.cityId === cityId)
          : [];
        setStadiums(cityStades);

        // ✅ Matches — MatchesController fonctionne pour chaque stade
        if (cityStades.length > 0) {
          const mResults = await Promise.all(
            cityStades.map(st => safeFetch(`${API}/matches/matches/stade/${st.id}`))
          );
          setMatches(mResults.flat().filter(Boolean));
        }

        // ℹ️ Images — nécessite CorsConfig.java côté Spring Boot pour fonctionner
        // Sans ça, la galerie sera vide (pas d'erreur bloquante)
        const imgs = await safeFetch(`${API}/cities/images/city/${id}`);
        setImages(Array.isArray(imgs) ? imgs : []);

      } catch (err) {
        console.error('Erreur chargement ville:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const getStatus = (s) => ({
    'LIVE':     { label: 'En Direct', cls: 'bg-red-500/10 text-red-600 border-red-200' },
    'started':  { label: 'En Direct', cls: 'bg-red-500/10 text-red-600 border-red-200' },
    'commence': { label: 'En Direct', cls: 'bg-red-500/10 text-red-600 border-red-200' },
    'termine':  { label: 'Terminé',   cls: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
    'Finished': { label: 'Terminé',   cls: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
    'upcoming': { label: 'À Venir',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  }[s] || { label: 'Prévu', cls: 'bg-zinc-50 text-zinc-500 border-zinc-200' });

  const isLive = (s) => ['LIVE', 'started', 'commence'].includes(s);

  const TABS = [
    { key: 'overview',    label: 'Aperçu',      icon: 'solar:widget-linear',               badge: null              },
    { key: 'hotels',      label: 'Séjour',       icon: 'solar:bed-linear',                  badge: hotels.length     },
    { key: 'attractions', label: 'À Découvrir',  icon: 'solar:map-point-school-linear',     badge: attractions.length},
    { key: 'stadiums',    label: 'Stades',       icon: 'solar:structure-linear',            badge: stadiums.length   },
    { key: 'matches',     label: 'Matchs',       icon: 'solar:calendar-linear',             badge: matches.length    },
    { key: 'gallery',     label: 'Galerie',      icon: 'solar:gallery-minimalistic-linear', badge: images.length     },
  ];

  /* ── Loading ── */
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
      <img src="/images/logo.png" alt="" className="w-20 h-20 animate-pulse mb-4" />
    </div>
  );

  if (!city) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
      <h2 className="text-2xl font-bold text-zinc-700 mb-4">Ville non trouvée</h2>
      <button onClick={() => router.push('/cities')}
        className="px-6 py-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-700 transition">
        Retour aux villes
      </button>
    </div>
  );

  /* ── Render ── */
  return (
    <>
      <Head>
        <title>{city.name} — Ville Hôte | MoroccoFan2030</title>
        <meta name="description" content={city.description || `Découvrez ${city.name}`} />
        <link rel="icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,400&display=swap" rel="stylesheet" />
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js" />
         <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
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
      `}</style>

      <Navbar />

      {/* ══ HERO ══ */}
      <header className="relative min-h-[72vh] flex flex-col justify-end overflow-hidden bg-zinc-900 pt-24">
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
            <span className="text-sm font-medium">Retour aux villes</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
            <div>
              <div className="flex items-center gap-3 mb-5 fade-up d1">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold uppercase tracking-wider text-white/90">
                  Ville Hôte
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

            <div className="grid grid-cols-2 gap-3 fade-up d4">
              {[
                { icon:'solar:bed-linear',                val: hotels.length,      label:'Hébergements', color:'bg-amber-400/10 text-amber-300'   },
                { icon:'solar:map-point-school-linear',   val: attractions.length, label:'Attractions',  color:'bg-emerald-400/10 text-emerald-300'},
                { icon:'solar:structure-linear',          val: stadiums.length,    label:'Stades',       color:'bg-rose-400/10 text-rose-300'     },
                { icon:'solar:calendar-linear',           val: matches.length,     label:'Matchs',       color:'bg-blue-400/10 text-blue-300'     },
              ].map((s, i) => (
                <div key={i} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                    <iconify-icon icon={s.icon} class="text-xl" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-0.5">{s.val}</div>
                  <div className="text-xs text-white/50 font-medium">{s.label}</div>
                </div>
              ))}
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
                À propos de {city.name}
              </h2>
              <p className="text-zinc-600 text-lg leading-relaxed font-light">
                {city.description || `${city.name} est l'une des magnifiques villes hôtes de la Coupe du Monde 2030. Découvrez sa culture, ses infrastructures et son hospitalité chaleureuse.`}
              </p>
              <div className="mt-8 pt-8 border-t border-zinc-200 grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { l:'Région', v: city.region  || '—'              },
                  { l:'Pays',   v: city.country  || '—'             },
                  { l:'Matchs', v: `${matches.length} prévus`       },
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
                { icon:'solar:bed-linear',                val: hotels.length,      label:'Hôtels',      ring:'ring-amber-100',   bg:'bg-amber-50',   ic:'text-amber-500',   tab:'hotels'      },
                { icon:'solar:map-point-school-linear',   val: attractions.length, label:'Attractions', ring:'ring-emerald-100', bg:'bg-emerald-50', ic:'text-emerald-500', tab:'attractions' },
                { icon:'solar:structure-linear',          val: stadiums.length,    label:'Stades',      ring:'ring-rose-100',    bg:'bg-rose-50',    ic:'text-rose-500',    tab:'stadiums'    },
                { icon:'solar:calendar-linear',           val: matches.length,     label:'Matchs',      ring:'ring-blue-100',    bg:'bg-blue-50',    ic:'text-blue-500',    tab:'matches'     },
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

            <div onClick={() => setActiveTab('stadiums')}
              className="md:col-span-6 bg-zinc-950 text-white rounded-[28px] p-8 cursor-pointer group overflow-hidden relative card-lift">
              <div className="relative z-10 flex flex-col justify-between min-h-[160px]">
                <div className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-zinc-900 transition-all">
                  <iconify-icon icon="solar:arrow-right-up-linear" class="text-xl" />
                </div>
                <div>
                  <h4 className="text-2xl font-semibold mb-1.5">Explorer les stades</h4>
                  <p className="text-zinc-400 text-sm font-light">Infrastructures de classe mondiale pour la Coupe du Monde 2030</p>
                </div>
              </div>
              <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-zinc-800/40 rounded-full blur-3xl" />
            </div>

            <div onClick={() => setActiveTab('matches')}
              className="md:col-span-6 bg-white border border-zinc-200 rounded-[28px] p-8 cursor-pointer group card-lift hover:border-zinc-300">
              <div className="flex justify-between items-start mb-6">
                <div className="w-11 h-11 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <iconify-icon icon="solar:calendar-mark-linear" class="text-xl text-zinc-900" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-zinc-100 text-zinc-500 rounded-lg">Agenda</span>
              </div>
              <h4 className="text-2xl font-semibold text-zinc-900 mb-1.5">Programme des matchs</h4>
              <p className="text-zinc-500 text-sm font-light">Calendrier complet des rencontres prévues à {city.name}</p>
            </div>
          </div>
        )}

        {/* ── HOTELS ── */}
        {activeTab === 'hotels' && (
          <div className="fade-up">
            <SectionHeader title={`Séjour à ${city.name}`} subtitle="Hébergements sélectionnés pour votre confort" />
            {hotels.length === 0
              ? <EmptyState icon="solar:bed-linear" msg="Aucun hébergement disponible" />
              : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotels.map((h, i) => (
                    <div key={h.id}
                      className="bg-white rounded-2xl border border-zinc-200 overflow-hidden card-lift group fade-up"
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
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 hover:text-zinc-600 transition mt-1">
                              <iconify-icon icon="solar:link-linear" />
                              Réserver maintenant
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
            <SectionHeader title={`À Découvrir à ${city.name}`} subtitle="Sites culturels, naturels et touristiques" />
            {attractions.length === 0
              ? <EmptyState icon="solar:map-point-school-linear" msg="Aucune attraction disponible" />
              : <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {attractions.map((a, i) => (
                    <div key={a.id}
                      className="bg-white border border-zinc-200 rounded-2xl overflow-hidden card-lift group fade-up md:flex"
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
                              className="inline-flex items-center gap-1.5 font-semibold text-zinc-900 hover:text-zinc-600 transition mt-1">
                              <iconify-icon icon="solar:map-linear" />
                              Voir sur la carte
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

        {/* ── STADIUMS ── */}
        {activeTab === 'stadiums' && (
  <div className="fade-up">
    <SectionHeader title={`Stades de ${city.name}`} subtitle="Infrastructures sportives de classe mondiale" />
    {stadiums.length === 0
      ? <EmptyState icon="solar:structure-linear" msg="Aucun stade disponible" />
      : <div className="space-y-6">
          {stadiums.map((st, i) => (
            <div
              key={st.id}
              onClick={() => router.push(`/stade/${st.id}`)}
              className="bg-zinc-950 text-white rounded-[28px] overflow-hidden group card-lift fade-up cursor-pointer"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest font-semibold mb-4">
                    <iconify-icon icon="solar:structure-linear" />
                    Infrastructure — {city.name}
                  </div>
                  <h3 className="font-serif text-3xl lg:text-4xl font-bold mb-4 text-white">{st.name}</h3>
                  {st.description && (
                    <p className="text-zinc-400 font-light leading-relaxed mb-8 max-w-md">{st.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-6 border-t border-zinc-800 pt-6">
                    {st.capacity && (
                      <div>
                        <div className="text-zinc-500 text-[11px] uppercase tracking-widest font-semibold mb-1">Capacité</div>
                        <div className="text-3xl font-mono text-white">{Number(st.capacity).toLocaleString()}</div>
                      </div>
                    )}
                    {st.dateOfConstruction && (
                      <div>
                        <div className="text-zinc-500 text-[11px] uppercase tracking-widest font-semibold mb-1">Construction</div>
                        <div className="text-3xl font-mono text-white">{new Date(st.dateOfConstruction).getFullYear()}</div>
                      </div>
                    )}
                  </div>
                  {st.adresse && (
                    <p className="mt-5 flex items-start gap-2 text-sm text-zinc-500">
                      <iconify-icon icon="solar:map-point-linear" class="mt-0.5 flex-shrink-0" />
                      {st.adresse}
                    </p>
                  )}
                  {/* Bouton "Voir le stade" — stopPropagation pour éviter double navigation */}
                  <button
                    onClick={e => { e.stopPropagation(); router.push(`/stade/${st.id}`); }}
                    className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-zinc-900 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition w-max group-hover:bg-[#C1272D] group-hover:text-white"
                  >
                    <iconify-icon icon="solar:arrow-right-up-linear" class="text-lg" />
                    Voir le stade
                  </button>
                  
                </div>
                <div className="relative h-64 lg:h-auto overflow-hidden">
                  <img
                    src={st.imageUrl || '/images/stadium-placeholder.jpg'}
                    alt={st.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-700"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-zinc-950" />
                  {/* Indicateur de navigation au hover */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-2">
                    <iconify-icon icon="solar:arrow-right-up-linear" class="text-white text-lg" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
    }
  </div>
)}
        {/* ── MATCHES ── */}
        {activeTab === 'matches' && (
          <div className="fade-up">
            <SectionHeader title={`Matchs à ${city.name}`} subtitle="Calendrier des rencontres dans cette ville" />
            {matches.length === 0
              ? <EmptyState icon="solar:calendar-linear" msg="Aucun match programmé" />
              : <div className="max-w-3xl mx-auto space-y-4">
                  {[...matches]
                    .sort((a, b) => new Date(a.dateOfMatch) - new Date(b.dateOfMatch))
                    .map((m, i) => {
                      const status = getStatus(m.statut);
                      const live   = isLive(m.statut);
                      const team1  = m.matchTeams?.[0];
                      const team2  = m.matchTeams?.[1];
                      const date   = new Date(m.dateOfMatch);
                      return (
                        <div key={m.id}
                          onClick={() => router.push(`/matches/${m.id}`)}
                          className="bg-white border border-zinc-100 hover:border-zinc-300 hover:shadow-md rounded-2xl p-6 cursor-pointer transition group fade-up"
                          style={{ animationDelay: `${i * 0.05}s` }}>
                          <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-shrink-0 text-center md:text-left md:border-r border-zinc-100 md:pr-6">
                              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                                {date.toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })}
                              </div>
                              <div className="text-2xl font-bold text-zinc-900">
                                {date.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}
                              </div>
                              <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[10px] font-bold border ${status.cls}`}>
                                {live && <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot" />}
                                {status.label}
                              </div>
                            </div>

                            <div className="flex-1 flex items-center justify-between gap-4">
                              <TeamBlock team={team1} align="right" />
                              <div className="text-center px-3">
                                {m.statut !== 'upcoming' ? (
                                  <div className={`text-2xl font-bold tracking-tight ${live ? 'text-red-600' : 'text-zinc-900'}`}>
                                    {team1?.goals ?? 0} – {team2?.goals ?? 0}
                                  </div>
                                ) : (
                                  <div className="text-xl font-light text-zinc-300">VS</div>
                                )}
                                <div className="text-[10px] text-zinc-400 font-medium mt-1">{m.type}</div>
                              </div>
                              <TeamBlock team={team2} align="left" />
                            </div>

                            {m.stadeName && (
                              <div className="hidden md:flex flex-shrink-0 flex-col items-end text-sm">
                                <div className="text-zinc-500 font-medium">{m.stadeName}</div>
                                <iconify-icon icon="solar:arrow-right-linear"
                                  class="text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all text-lg mt-1" />
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
            <SectionHeader title={`Galerie de ${city.name}`} subtitle="Découvrez la ville en images" />
            {images.length === 0
              ? <EmptyState icon="solar:gallery-minimalistic-linear" msg="Aucune image disponible" />
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

function TeamBlock({ team, align }) {
  return (
    <div className={`flex flex-col items-center gap-2 flex-1 ${align === 'right' ? 'md:items-end' : 'md:items-start'}`}>
      <img
        src={team?.imageUrl || '/images/team-placeholder.png'}
        alt={team?.teamName}
        className="w-14 h-14 rounded-full object-cover border-2 border-zinc-100"
        onError={e => { e.target.style.display = 'none'; }}
      />
      <span className="font-semibold text-zinc-900 text-sm text-center">{team?.teamName || 'TBD'}</span>
    </div>
  );
}