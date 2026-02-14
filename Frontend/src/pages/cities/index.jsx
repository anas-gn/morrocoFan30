import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

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

export default function Cities() {
  const router = useRouter();

  const [cities, setCities]         = useState([]);
  const [filteredCities, setFiltered] = useState([]);
  const [counts, setCounts]         = useState({});
  const [selectedRegion, setRegion] = useState('all');
  const [searchQuery, setSearch]    = useState('');
  const [viewMode, setViewMode]     = useState('grid');
  const [loading, setLoading]       = useState(true);
  const [globalStats, setGlobalStats] = useState({ cities: 0, hotels: 0, stades: 0 });
  const [hoveredCity, setHovered]   = useState(null);

  /* ── Fetch ──────────────────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      setLoading(true);

      // ✅ Utiliser AcceuilController qui a le CORS correctement configuré
      // /api/acceuil/CityHosts/all → retourne List<CityHostDTO> (avec imageUrl)
      const cityList = await safeFetch(`${API}/acceuil/CityHosts/all`);
      if (!Array.isArray(cityList)) { setLoading(false); return; }
      setCities(cityList);
      setFiltered(cityList);

      // ✅ Hotels via HotelController (@CrossOrigin présent) → filtre par cityHostId
      const allHotels = await safeFetch(`${API}/hotels/all`) ?? [];

      // ✅ Stades via AcceuilController → filtre par cityId
      const allStades = await safeFetch(`${API}/acceuil/stade/all`) ?? [];

      // ✅ Attractions via AttractionController par ville
      const attrResults = await Promise.all(
        cityList.map(c => safeFetch(`${API}/attractions/city/${c.id}`))
      );

      // Construire la map des counts par cityId
      const countsMap = {};
      cityList.forEach((c, i) => {
        countsMap[c.id] = {
          hotels:      allHotels.filter(h => h.cityHostId === c.id).length,
          stades:      allStades.filter(s => s.cityId    === c.id).length,
          attractions: Array.isArray(attrResults[i]) ? attrResults[i].length : 0,
        };
      });
      setCounts(countsMap);

      setGlobalStats({
        cities: cityList.length,
        hotels: allHotels.length,
        stades: allStades.length,
      });

      setLoading(false);
    })();
  }, []);

  /* ── Filtres ────────────────────────────────────────────────────── */
  useEffect(() => {
    let f = [...cities];
    if (selectedRegion !== 'all')
      f = f.filter(c => c.region === selectedRegion);
    if (searchQuery.trim())
      f = f.filter(c =>
        [c.name, c.country, c.description].some(v =>
          v?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    setFiltered(f);
  }, [selectedRegion, searchQuery, cities]);

  const regions = ['all', ...new Set(cities.map(c => c.region).filter(Boolean))];

  /* ── Loading ────────────────────────────────────────────────────── */
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
      <img src="/images/logo.png" alt="" className="w-20 h-20 animate-pulse mb-3" />
    </div>
  );

  /* ── Page ───────────────────────────────────────────────────────── */
  return (
    <>
      <Head>
        <title>Villes Hôtes | MoroccoFan2030</title>
        <meta name="description" content="Explorez les 6 villes hôtes de la Coupe du Monde 2030" />
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
        .d1 { animation-delay: .05s } .d2 { animation-delay: .12s }
        .d3 { animation-delay: .19s } .d4 { animation-delay: .26s }

        .grain::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 2;
        }

        .city-card { transition: transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s ease; }
        .city-card:hover { transform: translateY(-6px); box-shadow: 0 32px 64px rgba(0,0,0,.12); }

        .img-zoom img { transition: transform .8s cubic-bezier(.16,1,.3,1); }
        .img-zoom:hover img { transform: scale(1.08); }

        .tag-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 999px;
          font-size: 10px; font-weight: 700;
          letter-spacing: .06em; text-transform: uppercase;
        }

        .hero-clip { clip-path: polygon(0 0, 100% 0, 100% 88%, 0 100%); }

        input:focus, select:focus { outline: none; }

        .no-scroll::-webkit-scrollbar { display: none; }
        .no-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <header
        className="relative hero-clip bg-zinc-950 overflow-hidden grain"
        style={{ minHeight: '78vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
      >
        {/* BG image */}
        <div className="absolute inset-0">
          <img
            src="/images/cities.png"
            alt=""
            className="w-full h-full object-cover opacity-30"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(10,10,10,.92) 0%, rgba(30,30,30,.65) 50%, rgba(10,10,10,.8) 100%)' }}
          />
        </div>

        {/* Decorative number */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-3 z-10">
          <div className="w-px h-24 bg-white/10" />
          <span
            className="serif text-white/10 font-light"
            style={{ fontSize: '120px', lineHeight: 1, writingMode: 'vertical-rl' }}
          >
            2030
          </span>
          <div className="w-px h-24 bg-white/10" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-24 pt-40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">

            {/* Left: Titre */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-8 slide-up">
                <span className="w-8 h-px bg-[#C1272D]" />
                <span className="tag-pill bg-[#C1272D]/15 text-[#e05555] border border-[#C1272D]/30">
                  Coupe du Monde 2030
                </span>
              </div>

              <h1
                className="serif font-light text-white mb-6 slide-up d1"
                style={{ fontSize: 'clamp(52px, 8vw, 96px)', lineHeight: 1.0 }}
              >
                Les Villes<br />
                <em className="font-light" style={{ color: '#e8d5b0' }}>Hôtes du Maroc</em>
              </h1>

              <p
                className="text-white/50 font-light leading-relaxed slide-up d2"
                style={{ fontSize: '17px', maxWidth: '500px' }}
              >
                Six métropoles d'exception accueilleront les meilleures équipes du monde.
                Stades monumentaux, culture riche, hospitalité légendaire.
              </p>
            </div>

            {/* Right: Stats */}
            <div className="lg:col-span-5 slide-up d3">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { val: globalStats.cities, label: 'Villes',  accent: '#e05555' },
                  { val: globalStats.hotels, label: 'Hôtels',  accent: '#d4a847' },
                  { val: globalStats.stades, label: 'Stades',  accent: '#4caf7d' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm text-center">
                    <div
                      className="serif font-light mb-1"
                      style={{ fontSize: '52px', lineHeight: 1, color: s.accent }}
                    >
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

      {/* ══ FILTERS ═══════════════════════════════════════════════════ */}
      <div className="sticky top-16 z-40 bg-[#f8f7f5]/95 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-wrap items-center gap-3">

          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une ville…"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:border-zinc-400 transition"
            />
          </div>

          {/* Region pills — extraites dynamiquement des données réelles */}
          <div className="flex items-center gap-2 flex-wrap">
            {regions.map(r => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all
                  ${selectedRegion === r
                    ? 'bg-zinc-900 text-white shadow-md'
                    : 'bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-800'
                  }`}
              >
                {r === 'all' ? 'Toutes' : r}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Compteur */}
          <span className="text-xs text-zinc-400 font-medium hidden md:block">
            {filteredCities.length} ville{filteredCities.length !== 1 ? 's' : ''}
          </span>

          {/* View toggle */}
          <div className="flex items-center bg-zinc-100 rounded-xl p-1 gap-1">
            {[
              { mode: 'grid', icon: 'solar:grid-bold' },
              { mode: 'list', icon: 'solar:list-bold' },
            ].map(({ mode, icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all
                  ${viewMode === mode ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-700'}`}
              >
                <iconify-icon icon={icon} class="text-base" />
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* ══ CITIES ════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-6 py-14">

        {filteredCities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-5">
              <iconify-icon icon="solar:city-linear" class="text-zinc-300 text-4xl" />
            </div>
            <h3 className="serif text-3xl font-light text-zinc-700 mb-2">Aucune ville trouvée</h3>
            <p className="text-zinc-400 text-sm">Essayez de modifier votre recherche ou vos filtres</p>
          </div>

        ) : viewMode === 'grid' ? (

          /* ── GRID VIEW ─────────────────────────────────────────────── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredCities.map((city, i) => {
              const c = counts[city.id] ?? { hotels: 0, stades: 0, attractions: 0 };
              return (
                <article
                  key={city.id}
                  onClick={() => router.push(`/cities/${city.id}`)}
                  onMouseEnter={() => setHovered(city.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="city-card bg-white rounded-3xl overflow-hidden cursor-pointer border border-zinc-100 slide-up"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  {/* Image */}
                  <div className="img-zoom relative h-60 bg-zinc-200 overflow-hidden">
                    {city.imageUrl ? (
                      <img
                        src={city.imageUrl}
                        alt={city.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#d4d4d8'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-200">
                        <iconify-icon icon="solar:city-linear" class="text-zinc-400 text-5xl" />
                      </div>
                    )}
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,.65) 0%, rgba(0,0,0,0) 55%)' }}
                    />

                    {/* Region pill */}
                    {city.region && (
                      <div className="absolute top-4 left-4">
                        <span className="tag-pill bg-black/30 text-white border border-white/20 backdrop-blur-sm">
                          {city.region}
                        </span>
                      </div>
                    )}

                    {/* Country + arrow */}
                    <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                      <div className="text-white/80 text-xs font-medium flex items-center gap-1.5">
                        <iconify-icon icon="solar:map-point-linear" />
                        {city.country}
                      </div>
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                          ${hoveredCity === city.id ? 'bg-white text-zinc-900 scale-110' : 'bg-white/20 text-white'}`}
                      >
                        <iconify-icon icon="solar:arrow-right-up-linear" class="text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <h2 className="serif text-3xl font-light text-zinc-900 mb-2 leading-none">
                      {city.name}
                    </h2>

                    {city.description && (
                      <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2 mb-5 font-light">
                        {city.description}
                      </p>
                    )}

                    {/* Stats bar */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-zinc-100">
                      {[
                        { icon: 'solar:bed-linear',                val: c.hotels,      label: 'Hôtels',      color: 'text-amber-500'  },
                        { icon: 'solar:map-point-school-linear',   val: c.attractions, label: 'Attractions', color: 'text-emerald-500'},
                        { icon: 'solar:structure-linear',          val: c.stades,      label: 'Stades',      color: 'text-rose-500'   },
                      ].map((s, j) => (
                        <div key={j} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-zinc-50">
                          <iconify-icon icon={s.icon} class={`text-lg ${s.color}`} />
                          <span className="text-base font-semibold text-zinc-800">{s.val}</span>
                          <span className="text-[10px] text-zinc-400 font-medium">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

        ) : (

          /* ── LIST VIEW ─────────────────────────────────────────────── */
          <div className="space-y-3">
            {filteredCities.map((city, i) => {
              const c = counts[city.id] ?? { hotels: 0, stades: 0, attractions: 0 };
              return (
                <div
                  key={city.id}
                  onClick={() => router.push(`/cities/${city.id}`)}
                  className="group bg-white border border-zinc-100 rounded-2xl p-5 flex items-center gap-6 cursor-pointer hover:border-zinc-300 hover:shadow-lg transition-all slide-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Image */}
                  <div className="img-zoom w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-zinc-100">
                    {city.imageUrl ? (
                      <img
                        src={city.imageUrl}
                        alt={city.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-200">
                        <iconify-icon icon="solar:city-linear" class="text-zinc-400 text-2xl" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-1.5">
                      <h2 className="serif text-2xl font-light text-zinc-900 leading-none">{city.name}</h2>
                      {city.region && (
                        <span className="tag-pill bg-zinc-100 text-zinc-500 mt-1 flex-shrink-0">{city.region}</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mb-2 flex items-center gap-1">
                      <iconify-icon icon="solar:map-point-linear" />
                      {city.country}
                    </p>
                    {city.description && (
                      <p className="text-sm text-zinc-500 font-light line-clamp-1">{city.description}</p>
                    )}
                  </div>

                  {/* Counts */}
                  <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                    {[
                      { icon: 'solar:bed-linear',                val: c.hotels,      label: 'Hôtels',  color: 'text-amber-500'  },
                      { icon: 'solar:map-point-school-linear',   val: c.attractions, label: 'Sites',   color: 'text-emerald-500'},
                      { icon: 'solar:structure-linear',          val: c.stades,      label: 'Stades',  color: 'text-rose-500'   },
                    ].map((s, j) => (
                      <div key={j} className="flex flex-col items-center gap-0.5 text-center">
                        <iconify-icon icon={s.icon} class={`text-xl ${s.color}`} />
                        <span className="text-base font-semibold text-zinc-800">{s.val}</span>
                        <span className="text-[10px] text-zinc-400">{s.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Arrow */}
                  <iconify-icon
                    icon="solar:arrow-right-linear"
                    class="text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all text-xl flex-shrink-0"
                  />
                </div>
              );
            })}
          </div>

        )}
      </main>

      <Footer />
    </>
  );
}