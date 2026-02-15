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

export default function Itineraries() {
  const router = useRouter();

  const [itineraries, setItineraries]       = useState([]);
  const [loading, setLoading]               = useState(true);
  const [creating, setCreating]             = useState(false);
  const [notification, setNotification]     = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [supporterId, setSupporterId]       = useState(null);
  const [hoveredId, setHoveredId]           = useState(null);

  const [form, setForm] = useState({ title: '', description: '', dateToGo: '' });

  /* ── Supporter ID ── */
  useEffect(() => {
    const storedId = localStorage.getItem('supporterId');
    if (!storedId) { router.push('/login'); return; }
    setSupporterId(parseInt(storedId));
  }, []);

  useEffect(() => { if (supporterId) fetchItineraries(); }, [supporterId]);

  const fetchItineraries = async () => {
    setLoading(true);
    const data = await safeFetch(`http://localhost:3309/api/itineraries/supporter/${supporterId}`);
    setItineraries(Array.isArray(data) ? data : data?.content || []);
    setLoading(false);
  };

  const showNotif = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = async () => {
    if (!form.title.trim()) { showNotif('error', 'Please enter a title.'); return; }
    setCreating(true);
    try {
      const res = await fetch(`${API}/itineraries/add/${supporterId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const responseText = await res.text();
      let result;
      try { result = JSON.parse(responseText); } catch { result = responseText; }

      if (res.ok && typeof result === 'object' && result.id) {
        showNotif('success', 'Itinerary created successfully!');
        setForm({ title: '', description: '', dateToGo: '' });
        setShowCreateForm(false);
        await fetchItineraries();
      } else {
        showNotif('error', typeof result === 'string' ? result : 'Could not create itinerary.');
      }
    } catch (err) {
      showNotif('error', 'Server error: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  /* ── Loading ── */
  if (loading || !supporterId) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
      <img src="/images/logo.png" alt="" className="w-20 h-20 animate-pulse mb-3" />
    </div>
  );

  return (
    <>
      <Head>
        <title>My Itineraries | MoroccoFan2030</title>
        <meta name="description" content="Plan your World Cup 2030 trip" />
        <link rel="icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
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

        .itin-card { transition: transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s ease; }
        .itin-card:hover { transform: translateY(-6px); box-shadow: 0 32px 64px rgba(0,0,0,.12); }

        .img-zoom img { transition: transform .8s cubic-bezier(.16,1,.3,1); }
        .img-zoom:hover img { transform: scale(1.08); }

        .tag-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 999px;
          font-size: 10px; font-weight: 700;
          letter-spacing: .06em; text-transform: uppercase;
        }

        .hero-clip { clip-path: polygon(0 0, 100% 0, 100% 88%, 0 100%); }

        input:focus, select:focus, textarea:focus { outline: none; }

        .no-scroll::-webkit-scrollbar { display: none; }
        .no-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <Navbar />

      {/* ── TOAST ── */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium slide-up ${
          notification.type === 'success' ? 'bg-zinc-900' : 'bg-[#C1272D]'
        }`}>
          <iconify-icon
            icon={notification.type === 'success' ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
            class="text-xl"
          />
          {notification.message}
        </div>
      )}

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <header
        className="relative hero-clip bg-zinc-950 overflow-hidden grain"
        style={{ minHeight: '78vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
      >
        {/* BG */}
        <div className="absolute inset-0">
          <img
            src="/images/itin.webp"
            alt=""
            className="w-full h-full object-cover opacity-30"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(10,10,10,.92) 0%, rgba(30,30,30,.65) 50%, rgba(10,10,10,.8) 100%)' }}
          />
        </div>

        {/* Decorative "2030" */}
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

            {/* Left: Title */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-8 slide-up">
                <span className="w-8 h-px bg-[#C1272D]" />
                <span className="tag-pill bg-[#C1272D]/15 text-[#e05555] border border-[#C1272D]/30">
                  World Cup 2030
                </span>
              </div>

              <h1
                className="serif font-light text-white mb-6 slide-up d1"
                style={{ fontSize: 'clamp(52px, 8vw, 96px)', lineHeight: 1.0 }}
              >
                My Travel<br />
                <em className="font-light" style={{ color: '#e8d5b0' }}>Itineraries</em>
              </h1>

              <p
                className="text-white/50 font-light leading-relaxed slide-up d2"
                style={{ fontSize: '17px', maxWidth: '500px' }}
              >
                Plan your perfect World Cup 2030 adventure across Morocco's stunning host cities.
              </p>
            </div>

            {/* Right: Stats */}
            <div className="lg:col-span-5 slide-up d3">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { val: itineraries.length, label: 'Itineraries', accent: '#e05555' },
                  { val: '2030',             label: 'World Cup',   accent: '#d4a847' },
                  { val: '6',                label: 'Host Cities', accent: '#4caf7d' },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl p-5 backdrop-blur-sm text-center">
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

      {/* ══ MAIN ══════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-6 py-14">

        {itineraries.length === 0 ? (

          /* ── EMPTY STATE ── */
          <div className="slide-up">
            {!showCreateForm ? (

              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-5">
                  <iconify-icon icon="solar:map-linear" class="text-zinc-300 text-4xl" />
                </div>

                <h3 className="serif text-4xl font-light text-zinc-700 mb-3">
                  Create Your First Itinerary
                </h3>
                <p
                  className="text-zinc-400 font-light leading-relaxed mb-8"
                  style={{ fontSize: '17px', maxWidth: '420px' }}
                >
                  Start planning your World Cup 2030 journey across Morocco's host cities.
                </p>

                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-8 py-3.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all hover:shadow-lg"
                >
                  <iconify-icon icon="solar:add-circle-linear" class="text-base" />
                  New Itinerary
                </button>

                {/* Tips */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-2xl text-left">
                  {[
                    { icon: 'solar:verified-check-linear', title: 'One per account',  desc: 'Focus on your perfect trip'    },
                    { icon: 'solar:map-point-wave-linear', title: 'Add attractions',  desc: 'Build your dream itinerary'    },
                    { icon: 'solar:calendar-mark-linear',  title: 'Set travel dates', desc: 'Plan ahead for 2030'           },
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-3 p-5 bg-white rounded-2xl border border-zinc-100">
                      <div className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center flex-shrink-0">
                        <iconify-icon icon={tip.icon} class="text-zinc-400 text-base" />
                      </div>
                      <div>
                        <div className="font-medium text-zinc-900 text-sm">{tip.title}</div>
                        <div className="text-xs text-zinc-400 mt-0.5 font-light">{tip.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            ) : (

              /* ── CREATE FORM ── */
              <div className="max-w-xl mx-auto">
                <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-xl">

                  {/* Header */}
                  <div
                    className="relative overflow-hidden grain px-8 py-10"
                    style={{ background: 'linear-gradient(135deg, rgba(10,10,10,.96) 0%, rgba(30,30,30,.92) 100%)' }}
                  >
                    <div className="flex items-start justify-between relative z-10">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="w-6 h-px bg-[#C1272D]" />
                          <span className="tag-pill bg-[#C1272D]/15 text-[#e05555] border border-[#C1272D]/30">
                            New Itinerary
                          </span>
                        </div>
                        <h2 className="serif font-light text-white" style={{ fontSize: '40px', lineHeight: 1.1 }}>
                          Plan Your<br />
                          <em style={{ color: '#e8d5b0' }}>Adventure</em>
                        </h2>
                      </div>
                      <button
                        onClick={() => setShowCreateForm(false)}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                      >
                        <iconify-icon icon="solar:close-linear" class="text-lg" />
                      </button>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="p-8 space-y-5">

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. My Morocco World Cup Adventure"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                        Description
                      </label>
                      <textarea
                        placeholder="Describe your trip plans, goals, and what you want to experience..."
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                        Travel Date
                      </label>
                      <input
                        type="date"
                        value={form.dateToGo}
                        onChange={e => setForm({ ...form, dateToGo: e.target.value })}
                        min="2030-01-01"
                        max="2030-12-31"
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:border-zinc-400 transition-all"
                      />
                    </div>

                    <button
                      onClick={handleCreate}
                      disabled={creating}
                      className="w-full py-3.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                    >
                      {creating ? (
                        <>
                          <iconify-icon icon="solar:refresh-linear" class="text-base animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <iconify-icon icon="solar:add-circle-linear" class="text-base" />
                          Create Itinerary
                        </>
                      )}
                    </button>

                  </div>
                </div>
              </div>
            )}
          </div>

        ) : (

          /* ── EXISTING ITINERARIES ── */
          <>
            {/* Section heading */}
            <div className="flex items-end justify-between mb-10 slide-up">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-6 h-px bg-[#C1272D]" />
                  <span className="tag-pill bg-[#C1272D]/10 text-[#e05555] border border-[#C1272D]/20">
                    Travel Planning
                  </span>
                </div>
                <h2
                  className="serif font-light text-zinc-900"
                  style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.1 }}
                >
                  Your Itineraries
                </h2>
                <p className="text-zinc-400 font-light mt-2">Manage your World Cup 2030 travel plans</p>
              </div>

              <span className="text-xs text-zinc-400 font-medium hidden md:block">
                {itineraries.length} itinerary{itineraries.length !== 1 ? 'ies' : ''}
              </span>
            </div>

            {/* Grid — same layout as Cities */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {itineraries.map((itinerary, i) => (
                <article
                  key={itinerary.id}
                  onClick={() => router.push(`/itineraries/${itinerary.id}`)}
                  onMouseEnter={() => setHoveredId(itinerary.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="itin-card bg-white rounded-3xl overflow-hidden cursor-pointer border border-zinc-100 slide-up"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  {/* Visual area (replacing city photo) */}
                  <div className="relative h-52 overflow-hidden">
                    {/* Dark gradient background with dot pattern */}
                    <div
                      className="w-full h-full"
                      style={{ background: 'linear-gradient(135deg, #111827 0%, #1e293b 50%, #0f172a 100%)' }}
                    />
                    <div className="absolute inset-0 opacity-[0.07]">
                      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id={`dots-${itinerary.id}`} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                            <circle cx="12" cy="12" r="1" fill="white" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#dots-${itinerary.id})`} />
                      </svg>
                    </div>
                    {/* Red accent line */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C1272D] via-[#e05555] to-transparent" />

                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, rgba(0,0,0,0) 55%)' }}
                    />

                    {/* Tag top-left */}
                    <div className="absolute top-4 left-4">
                      <span className="tag-pill bg-black/40 text-white border border-white/15 backdrop-blur-sm">
                        Itinerary
                      </span>
                    </div>

                    {/* Date + arrow bottom */}
                    <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                      {itinerary.dateToGo ? (
                        <div className="text-white/75 text-xs font-medium flex items-center gap-1.5">
                          <iconify-icon icon="solar:calendar-linear" />
                          {formatDate(itinerary.dateToGo)}
                        </div>
                      ) : (
                        <div className="text-white/30 text-xs font-light italic">No date set</div>
                      )}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                          ${hoveredId === itinerary.id ? 'bg-white text-zinc-900 scale-110' : 'bg-white/20 text-white'}`}
                      >
                        <iconify-icon icon="solar:arrow-right-up-linear" class="text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <h2 className="serif text-3xl font-light text-zinc-900 mb-2 leading-none">
                      {itinerary.title}
                    </h2>

                    {itinerary.description && (
                      <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2 mb-5 font-light">
                        {itinerary.description}
                      </p>
                    )}

                    {/* Stats bar — same pattern as city card */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-zinc-100">
                      {[
                        { icon: 'solar:map-point-linear',  val: '—',    label: 'Stops',   color: 'text-rose-400'    },
                        { icon: 'solar:calendar-linear',   val: itinerary.dateToGo ? new Date(itinerary.dateToGo).getFullYear() : '—', label: 'Year', color: 'text-amber-500' },
                        { icon: 'solar:global-linear',     val: '🇲🇦',  label: 'Morocco', color: 'text-emerald-500' },
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
              ))}
            </div>

            {/* Info notice */}
            <div className="mt-12 p-5 bg-white rounded-2xl border border-zinc-100 flex items-start gap-4 slide-up">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                <iconify-icon icon="solar:lightbulb-linear" class="text-amber-500 text-base" />
              </div>
              <div>
                <div className="font-medium text-zinc-900 text-sm mb-0.5">Itinerary Limit</div>
                <div className="text-xs text-zinc-400 font-light leading-relaxed">
                  You can have one itinerary per account. Click on your itinerary above to add attractions,
                  update details, and plan your perfect World Cup 2030 experience across Morocco.
                </div>
              </div>
            </div>
          </>
        )}

      </main>

      <Footer />
    </>
  );
}