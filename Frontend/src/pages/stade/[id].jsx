import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

export default function StadeDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [stade, setStade]               = useState(null);
  const [images, setImages]             = useState([]);
  const [matches, setMatches]           = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab]       = useState('upcoming');
  const [showGallery, setShowGallery]   = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      try {
        const [sR, iR, mR, uR] = await Promise.all([
          fetch(`http://localhost:3309/api/stade/stade/${id}`),
          fetch(`http://localhost:3309/api/stade/images/stade/${id}`),
          fetch(`http://localhost:3309/api/stade/stade/matches/${id}`),
          fetch(`http://localhost:3309/api/stade/stade/${id}/upcomingMatches`),
        ]);
        setStade(await sR.json());
        const iData = await iR.json(); setImages(Array.isArray(iData) ? iData : []);
        const mData = await mR.json(); setMatches(Array.isArray(mData) ? mData : []);
        const uData = await uR.json(); setUpcomingMatches(Array.isArray(uData) ? uData : []);
        setLoading(false);
      } catch (e) { console.error(e); setLoading(false); }
    };
    fetchAll();
  }, [id]);

  const STATUS = {
    scheduled: { label: 'Programmé', dotCls: 'bg-stone-400',            borderCls: 'border-stone-200',    textCls: 'text-stone-400' },
    live:      { label: 'En direct', dotCls: 'bg-[#C1272D] animate-pulse', borderCls: 'border-[#C1272D]/30', textCls: 'text-[#C1272D]' },
    finished:  { label: 'Terminé',   dotCls: 'bg-stone-300',            borderCls: 'border-stone-200',    textCls: 'text-stone-400' },
    postponed: { label: 'Reporté',   dotCls: 'bg-amber-400',            borderCls: 'border-amber-200',    textCls: 'text-amber-600' },
  };
  const getStatus = (s) => STATUS[s] || STATUS.scheduled;

if (loading) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
      <img
        src="/images/logo.png"
        alt="Loading"
        className="w-20 h-20 mb-4 animate-pulse"
      />
      </div>
  );
}
  if (!stade) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
      <p className="text-stone-500 mb-4">Stade introuvable</p>
      <button onClick={() => router.push('/Stades')}
        className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium">
        Retour aux stades
      </button>
    </div>
  );

  const displayMatches = activeTab === 'upcoming' ? upcomingMatches : matches;
  const mapQ = encodeURIComponent(`${stade.adresse || stade.name}, ${stade.cityName || ''}, Maroc`);

  return (
    <>
     <Head>
        <title>{stade.name} | MoroccoFan2030</title>
        <meta name="description" content={`${stade.name} - ${stade.description}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        body  { font-family:'Outfit',sans-serif; background:#FAFAF9; color:#1C1917; }
        .serif{ font-family:'Playfair Display',serif; }
        ::selection { background:#C1272D; color:#fff; }

        .glass-dark {
          background: rgba(28,25,23,.76);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,.08);
        }
        .hide-scroll::-webkit-scrollbar { display:none; }
        .hide-scroll { -ms-overflow-style:none; scrollbar-width:none; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fu  { animation: fadeUp .55s ease-out both; }
        .d1  { animation-delay:.08s; }
        .d2  { animation-delay:.16s; }
        .d3  { animation-delay:.26s; }
        .d4  { animation-delay:.36s; }
      `}</style>

      <Navbar />

      <main className="pt-24 pb-24 max-w-7xl mx-auto px-6">

        {/* ─── HEADER ─────────────────────────── */}
        <header className="mb-8 fu">

          {/* Title row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-xs font-semibold uppercase tracking-wider">
                  <span className="material-icons text-sm">location_on</span>
                  {stade.cityName}
                </span>
                {stade.capacity >= 80000 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
                    <span className="material-icons text-sm">verified</span>
                    FIFA Premier
                  </span>
                )}
              </div>

              <h1 className="serif text-5xl md:text-[4.5rem] text-stone-900 leading-[1.05] tracking-tight">
                {stade.name.includes(' ')
                  ? <>{stade.name.split(' ').slice(0, -1).join(' ')}<br /><span className="text-stone-400 italic">{stade.name.split(' ').slice(-1)[0]}</span></>
                  : stade.name
                }
              </h1>
            </div>

            <div className="flex gap-2 shrink-0">
              <button className="h-10 px-5 rounded-full border border-stone-200 bg-white text-stone-600 text-sm font-medium hover:border-stone-400 transition-all flex items-center gap-2">
                <span className="material-icons text-base">share</span>
                Partager
              </button>
              <a href={`https://www.google.com/maps/search/?api=1&query=${mapQ}`}
                target="_blank" rel="noopener noreferrer"
                className="h-10 px-6 rounded-full bg-[#C1272D] text-white text-sm font-semibold hover:bg-[#a01f25] shadow-lg shadow-red-600/20 transition-all flex items-center gap-2">
                <span className="material-icons text-base">directions</span>
                Itinéraire
              </a>
            </div>
          </div>

          {/* Hero */}
          <div className="relative h-[480px] w-full rounded-[2rem] overflow-hidden group border border-stone-200 shadow-xl shadow-stone-200/50">
           {stade.videoUrl ? (
  <video
    src={stade.videoUrl}
    autoPlay
    muted
    loop
    playsInline
    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
  />
) : (
  <img
    src="/images/terrain1.webp"
    alt={stade.name}
    className="absolute inset-0 w-full h-full object-cover"
  />
)}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />

            {/* Floating stats */}
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
              <div className="flex gap-3 overflow-x-auto hide-scroll pb-1">
                {[
                  { icon:'event_seat',    val: stade.capacity ? stade.capacity.toLocaleString() : '—', lbl:'Capacité' },
                  ...(stade.dateOfConstruction ? [{ icon:'calendar_today', val: String(new Date(stade.dateOfConstruction).getFullYear()), lbl:'Construit' }] : []),
                  { icon:'sports_soccer', val: String(matches.length), lbl:'Matches' },
                ].map(s => (
                  <div key={s.lbl} className="glass-dark px-5 py-3 rounded-2xl flex items-center gap-4 min-w-[145px]">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="material-icons text-white text-xl">{s.icon}</span>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white leading-none mb-1">{s.val}</div>
                      <div className="text-[10px] text-white/55 uppercase tracking-widest">{s.lbl}</div>
                    </div>
                  </div>
                ))}
              </div>
              {images.length > 0 && (
                <button onClick={() => setShowGallery(true)}
                  className="glass-dark px-5 py-3 rounded-full text-white text-sm font-medium hover:bg-white hover:text-stone-900 transition-all flex items-center gap-2 whitespace-nowrap">
                  <span className="material-icons text-base">photo_library</span>
                  Galerie ({images.length})
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ─── TABS ───────────────────────────── */}
        <div className="sticky top-20 z-40 mb-10 fu d1">
          <div className="inline-flex p-1.5 rounded-2xl bg-white border border-stone-200 shadow-sm">
            {[
              { href:'#overview', icon:'info',          label:'Aperçu',       active:true },
              { href:'#matches',  icon:'sports_soccer', label:`Matches (${matches.length})`, active:false },
              { href:'#location', icon:'map',           label:'Localisation', active:false },
            ].map(t => (
              <a key={t.href} href={t.href}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  t.active
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                }`}>
                <span className="material-icons text-base">{t.icon}</span>
                {t.label}
              </a>
            ))}
          </div>
        </div>

        {/* ─── 8 + 4 LAYOUT ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ═══ LEFT (8) ══════════════════════ */}
          <div className="lg:col-span-8 space-y-16">

            {/* Overview */}
            <section id="overview" className="scroll-mt-32 fu d2">
              <h2 className="serif text-2xl text-stone-900 mb-4">À propos du stade</h2>
              <p className="text-stone-500 text-lg leading-relaxed">
                {stade.description || 'Aucune description disponible pour ce stade.'}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {[
                  { icon:'ac_unit',     label:'Climatisation' },
                  { icon:'wifi',        label:'WiFi 5G' },
                  { icon:'accessible',  label:'Accessibilité' },
                  { icon:'star_border', label:'Loges VIP' },
                ].map(a => (
                  <div key={a.label} className="p-4 rounded-2xl bg-white border border-stone-100 shadow-sm flex flex-col items-center text-center gap-2 hover:border-stone-300 transition-colors">
                    <span className="material-icons text-2xl text-stone-400">{a.icon}</span>
                    <span className="text-xs font-medium text-stone-600">{a.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Matches */}
            <section id="matches" className="scroll-mt-32 fu d3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="serif text-2xl text-stone-900">Matches</h2>
                <div className="flex gap-1 p-1 bg-stone-100 rounded-xl">
                  {[
                    { key:'upcoming', label:`À venir (${upcomingMatches.length})` },
                    { key:'all',      label:`Tous (${matches.length})` },
                  ].map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeTab === t.key
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {displayMatches.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                    <span className="material-icons text-4xl text-stone-300 block mb-3">sports_soccer</span>
                    <p className="text-stone-400 text-sm">
                      {activeTab === 'upcoming' ? 'Aucun match à venir' : 'Aucun match trouvé'}
                    </p>
                  </div>
                ) : displayMatches.map((match) => {
                  const st    = getStatus(match.statut);
                  const live  = match.statut === 'live';
                  const team1 = match.matchTeams?.[0];
                  const team2 = match.matchTeams?.[1];
                  return (
                    <div key={match.id}
                      onClick={() => router.push(`/match/${match.id}`)}
                      className={`bg-white rounded-2xl border ${st.borderCls} p-1 relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer`}>

                      {/* Live pill */}
                      {live && (
                        <div className="absolute top-0 right-0 px-3 py-1 bg-[#C1272D] text-white text-[10px] font-bold uppercase tracking-wider rounded-bl-xl z-10 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          En direct
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row items-center p-4 gap-5">
                        {/* Date */}
                        <div className="flex md:flex-col items-center gap-3 md:gap-0 min-w-[80px] text-center">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${st.textCls}`}>
                            {live ? "Aujourd'hui"
                              : new Date(match.dateOfMatch).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}
                          </span>
                          <span className="text-xl font-semibold text-stone-900">
                            {new Date(match.dateOfMatch).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
                          </span>
                        </div>

                        {/* Teams */}
                        <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-stone-100 md:pl-5 pt-4 md:pt-0">
                          {team1 ? (
                            <div className="flex items-center justify-between">
                              {/* T1 */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center">
                                  {team1.imageUrl ? (
  <img
    src={team1.imageUrl}
    alt={team1.teamName}
    className="w-full h-full object-cover rounded-full"
  />
) : (
  <span className="text-xs font-bold text-stone-500">
    {team1.teamName?.slice(0,3).toUpperCase()}
  </span>
)}
                                </div>
                                <span className="font-semibold text-stone-900 text-sm">{team1.teamName}</span>
                              </div>

                              {/* Score */}
                              <div className="px-3 py-1.5 bg-stone-100 rounded-lg">
                                {team1.goals != null
                                  ? <span className="text-stone-900 text-sm font-bold font-mono">{team1.goals} – {team2?.goals ?? 0}</span>
                                  : <span className="text-stone-300 text-xs font-semibold">VS</span>
                                }
                              </div>

                              {/* T2 */}
                              <div className="flex items-center gap-3 flex-row-reverse md:flex-row">
                                <span className="font-semibold text-stone-900 text-sm text-right">{team2?.teamName || 'TBD'}</span>
                                <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center">
                                  {team2.imageUrl ? (
  <img
    src={team2.imageUrl}
    alt={team2.teamName}
    className="w-full h-full object-cover rounded-full"
  />
) : (
  <span className="text-xs font-bold text-stone-500">
    {team1.teamName?.slice(0,3).toUpperCase()}
  </span>
)}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-stone-400 text-sm text-center">Équipes à confirmer</p>
                          )}

                          {(match.type || match.referee) && (
                            <div className="flex items-center gap-3 mt-2">
                              {match.type && <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">{match.type}</span>}
                              {match.referee && <>
                                <span className="text-stone-200">·</span>
                                <span className="text-[10px] text-stone-400 flex items-center gap-1">
                                  <span className="material-icons text-xs">sports</span>{match.referee}
                                </span>
                              </>}
                            </div>
                          )}
                        </div>

                        {/* Arrow */}
                        <div className="hidden md:flex shrink-0">
                          <div className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-white group-hover:border-stone-900 transition-all">
                            <span className="material-icons text-base">arrow_forward</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeTab === 'upcoming' && matches.length > upcomingMatches.length && (
                <div className="mt-5 text-center">
                  <button onClick={() => setActiveTab('all')}
                    className="text-sm font-medium text-[#C1272D] hover:underline inline-flex items-center gap-1">
                    Voir tous les {matches.length} matches
                    <span className="material-icons text-base">arrow_forward</span>
                  </button>
                </div>
              )}
            </section>

            {/* Gallery grid */}
            {images.length > 0 && (
              <section className="fu d4">
                <h2 className="serif text-2xl text-stone-900 mb-6">Visuels</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{height:380}}>
                  <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer border border-stone-200"
                    onClick={() => setSelectedImage(images[0]?.imageUrl)}>
                    <img src={images[0]?.imageUrl} alt="g1"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => { e.target.src='https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=800'; }} />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="material-icons text-white text-4xl drop-shadow-lg">zoom_out_map</span>
                    </div>
                  </div>
                  {images.slice(1,3).map((img,i) => (
                    <div key={i} className="relative rounded-2xl overflow-hidden group cursor-pointer border border-stone-200"
                      onClick={() => setSelectedImage(img.imageUrl)}>
                      <img src={img.imageUrl} alt={`g${i+2}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => { e.target.src='https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400'; }} />
                    </div>
                  ))}
                  {images[3] && (
                    <div className="col-span-2 relative rounded-2xl overflow-hidden group cursor-pointer border border-stone-200"
                      onClick={() => setSelectedImage(images[3].imageUrl)}>
                      <img src={images[3].imageUrl} alt="g4"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => { e.target.src='https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800'; }} />
                      {images.length > 4 && (
                        <div onClick={(e) => { e.stopPropagation(); setShowGallery(true); }}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer">
                          <span className="text-white text-2xl font-semibold">+{images.length - 4}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

          </div>

          {/* ═══ RIGHT SIDEBAR (4) ═════════════ */}
          <div className="lg:col-span-4 space-y-6">

            {/* Spec card — sticky */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm sticky top-32">
              <h3 className="font-semibold text-stone-900 mb-6 flex items-center gap-2 text-sm">
                <span className="material-icons text-base text-[#C1272D]">description</span>
                Spécifications
              </h3>

              <ul>
                {[
                  { icon:'location_on',   label:'Adresse',      value: stade.adresse || 'N/A' },
                  { icon:'location_city', label:'Ville',        value: stade.cityName || 'N/A' },
                  { icon:'public',        label:'Pays',         value: stade.country || 'Maroc' },
                  { icon:'event_seat',    label:'Capacité',     value: stade.capacity ? stade.capacity.toLocaleString()+' places' : 'N/A' },
                  ...(stade.responsable ? [{ icon:'person', label:'Responsable', value:stade.responsable }] : []),
                ].map((row, i, arr) => (
                  <li key={row.label}>
                    <div className="flex items-center justify-between text-sm py-3.5">
                      <div className="flex items-center gap-3 text-stone-500">
                        <span className="material-icons text-base text-stone-400">{row.icon}</span>
                        {row.label}
                      </div>
                      <span className="font-medium text-stone-900 text-right max-w-[55%] truncate">{row.value}</span>
                    </div>
                    {i < arr.length - 1 && <div className="h-px bg-stone-100" />}
                  </li>
                ))}
              </ul>

              {/* Map */}
              <div id="location" className="mt-6 rounded-2xl overflow-hidden border border-stone-200 scroll-mt-32">
                <iframe
                  title={`Carte ${stade.name}`}
                  src={`https://maps.google.com/maps?q=${mapQ}&output=embed&z=15`}
                  className="w-full h-44 border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a href={`https://www.google.com/maps/search/?api=1&query=${mapQ}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 bg-stone-50 border-t border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors">
                  <span className="material-icons text-sm text-[#C1272D]">open_in_new</span>
                  Ouvrir dans Google Maps
                </a>
              </div>
            </div>

            {/* City card */}
            <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-3xl p-6 border border-stone-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Ville hôte</span>
                <span className="material-icons text-stone-400">place</span>
              </div>
              <div className="text-3xl font-semibold text-stone-900 tracking-tight mb-1">{stade.cityName}</div>
              <div className="text-sm text-stone-500">{stade.country || 'Maroc'} · Coupe du Monde 2030</div>
              {stade.dateOfConstruction && (
                <div className="mt-4 flex items-center gap-2 text-xs text-stone-400 font-medium">
                  <span className="material-icons text-sm">construction</span>
                  Construit en {new Date(stade.dateOfConstruction).getFullYear()}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />

      {/* ─── LIGHTBOX ──────────────────────────── */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          style={{backdropFilter:'blur(12px)'}}
          onClick={() => setSelectedImage(null)}>
          <button onClick={() => setSelectedImage(null)}
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <span className="material-icons text-white">close</span>
          </button>
          <img src={selectedImage} alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* ─── GALLERY MODAL ─────────────────────── */}
      {showGallery && (
        <div className="fixed inset-0 z-[60] bg-black/85 flex flex-col"
          style={{backdropFilter:'blur(8px)'}}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h3 className="text-white font-semibold text-sm">Galerie — {stade.name}</h3>
            <button onClick={() => setShowGallery(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
              <span className="material-icons text-white">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
              {images.map((img, i) => (
                <div key={i}
                  onClick={() => { setShowGallery(false); setSelectedImage(img.imageUrl); }}
                  className="aspect-video rounded-xl overflow-hidden cursor-pointer group">
                  <img src={img.imageUrl} alt={`${stade.name} ${i+1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.target.src='https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400'; }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}