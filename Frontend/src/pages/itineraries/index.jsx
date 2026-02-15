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

export default function Itineraries() {
  const router = useRouter();

  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [supporterId, setSupporterId] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    dateToGo: ''
  });

  /* ── Get supporter ID from localStorage ────────────────────────── */
  useEffect(() => {
    // Récupérer l'ID du supporter depuis localStorage
    const storedSupporterId = localStorage.getItem('supporterId');
    
    if (!storedSupporterId) {
      console.error('No supporter ID found in localStorage');
      // Rediriger vers la page de connexion si pas connecté
      router.push('/login');
      return;
    }
    
    const id = parseInt(storedSupporterId);
    console.log('✅ Supporter ID from localStorage:', id);
    setSupporterId(id);
  }, []);

  /* ── Fetch itineraries ─────────────────────────────────────────── */
  useEffect(() => {
    if (supporterId) {
      console.log('=== FETCHING ITINERARIES ===');
      console.log('Supporter ID:', supporterId);
      fetchItineraries();
    }
  }, [supporterId]);

  const fetchItineraries = async () => {
    setLoading(true);
    const url = `${API}/itineraries/supporter/${supporterId}`;
    console.log('Fetching URL:', url);
    
    const data = await safeFetch(url);
    console.log('Raw data received:', data);
    
    const list = Array.isArray(data) ? data : data?.content || [];
    console.log('Processed list:', list);
    
    setItineraries(list);
    setLoading(false);
  };

  /* ── Toast notification ────────────────────────────────────────── */
  const showNotif = (type, message) => {
    console.log(`[Notification] ${type}:`, message);
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  /* ── Create itinerary ──────────────────────────────────────────── */
  const handleCreate = async () => {
    console.log('=== CREATING ITINERARY ===');
    
    if (!form.title.trim()) {
      showNotif('error', 'Please enter a title.');
      return;
    }

    console.log('Form data:', form);
    setCreating(true);
    
    try {
      const url = `${API}/itineraries/add/${supporterId}`;
      console.log('POST URL:', url);
      console.log('POST Body:', JSON.stringify(form));
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      console.log('Response status:', res.status);
      const responseText = await res.text();
      console.log('Response text:', responseText);
      
      // Essayer de parser la réponse
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Parsed response:', result);
      } catch (e) {
        // Si c'est un message d'erreur texte
        console.log('Response is text, not JSON');
        result = responseText;
      }
      
      if (res.ok && typeof result === 'object' && result.id) {
        // Succès - on a reçu un ItineraryDTO
        console.log('✅ Itinerary created successfully:', result);
        showNotif('success', 'Itinerary created successfully!');
        setForm({ title: '', description: '', dateToGo: '' });
        setShowCreateForm(false);
        await fetchItineraries();
      } else {
        // Erreur
        console.log('❌ Error creating itinerary:', result);
        showNotif('error', typeof result === 'string' ? result : 'Could not create itinerary.');
      }
    } catch (err) {
      console.error('❌ Exception:', err);
      showNotif('error', 'Server error: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  /* ── Format date ────────────────────────────────────────────────── */
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  /* ── Loading state ──────────────────────────────────────────────── */
  if (loading || !supporterId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
        <div className="w-16 h-16 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
        <p className="mt-4 text-zinc-500 font-medium">Loading your itineraries...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Itineraries | MoroccoFan2030</title>
        <meta name="description" content="Plan your World Cup 2030 trip" />
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; background: #fafaf9; }
        .font-serif { font-family: 'Playfair Display', serif; }
        
        @keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fade-up 0.6s ease-out; }
        .d1 { animation-delay: 0.1s; }
        .d2 { animation-delay: 0.2s; }
        .d3 { animation-delay: 0.3s; }
        .d4 { animation-delay: 0.4s; }
        
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
      <header className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/cities-bg.jpg" alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-900/60 to-zinc-950/80" />
        </div>
        
        <div className="relative max-w-[1400px] mx-auto px-6">
          <div className="fade-up d1">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold uppercase tracking-wider text-white/90 mb-6">
              <iconify-icon icon="solar:map-linear" />
              Travel Planning
            </span>
          </div>
          
          <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-5 fade-up d2">
            My Itineraries
          </h1>
          
          <p className="text-xl text-white/70 max-w-2xl font-light fade-up d3">
            Plan your perfect World Cup 2030 adventure across Morocco's host cities.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-16 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-6">

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 fade-up">
            <div className="bg-white rounded-3xl border border-zinc-100 p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <iconify-icon icon="solar:map-linear" class="text-2xl text-emerald-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-zinc-900">{itineraries.length}</div>
                <div className="text-sm text-zinc-500 font-medium">Active Itineraries</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-zinc-100 p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <iconify-icon icon="solar:calendar-linear" class="text-2xl text-amber-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-zinc-900">2030</div>
                <div className="text-sm text-zinc-500 font-medium">World Cup Year</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-zinc-100 p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                <iconify-icon icon="solar:map-point-linear" class="text-2xl text-rose-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-zinc-900">6</div>
                <div className="text-sm text-zinc-500 font-medium">Host Cities</div>
              </div>
            </div>
          </div>

          {/* Itineraries List or Create Form */}
          {itineraries.length === 0 ? (
            /* ── NO ITINERARY YET ── */
            <div className="max-w-3xl mx-auto fade-up d2">
              
              {!showCreateForm ? (
                /* Empty State */
                <div className="bg-white rounded-3xl border-2 border-dashed border-zinc-200 p-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-6">
                    <iconify-icon icon="solar:map-bold" class="text-4xl text-white" />
                  </div>
                  
                  <h2 className="font-serif text-3xl font-bold text-zinc-900 mb-3">
                    Create Your First Itinerary
                  </h2>
                  
                  <p className="text-zinc-500 text-lg mb-8 max-w-md mx-auto">
                    Start planning your World Cup 2030 journey across Morocco's stunning host cities.
                  </p>
                  
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-semibold hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl"
                  >
                    <iconify-icon icon="solar:add-circle-linear" class="text-xl" />
                    Create Itinerary
                  </button>

                  {/* Tips */}
                  <div className="mt-12 pt-8 border-t border-zinc-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                      {[
                        { icon: 'solar:shield-check-linear', title: 'One per account', desc: 'Focus on your perfect trip' },
                        { icon: 'solar:map-point-school-linear', title: 'Add attractions', desc: 'Build your dream itinerary' },
                        { icon: 'solar:calendar-mark-linear', title: 'Set travel dates', desc: 'Plan ahead for 2030' }
                      ].map((tip, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <iconify-icon icon={tip.icon} class="text-emerald-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 text-sm">{tip.title}</div>
                            <div className="text-xs text-zinc-500 mt-0.5">{tip.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Create Form */
                <div className="bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden">
                  
                  {/* Header */}
                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 px-8 py-10">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="font-serif text-3xl font-bold text-white">New Itinerary</h2>
                      <button
                        onClick={() => setShowCreateForm(false)}
                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                      >
                        <iconify-icon icon="solar:close-linear" class="text-xl" />
                      </button>
                    </div>
                    <p className="text-white/60 text-sm">Fill in the details below to create your itinerary</p>
                  </div>

                  {/* Form */}
                  <div className="p-8 space-y-6">
                    
                    {/* Title */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700 mb-2">
                        <iconify-icon icon="solar:text-linear" />
                        Itinerary Title *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. My Morocco World Cup Adventure"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-zinc-200 rounded-2xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-all"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700 mb-2">
                        <iconify-icon icon="solar:notes-linear" />
                        Description
                      </label>
                      <textarea
                        placeholder="Describe your trip plans, goals, and what you want to experience..."
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-zinc-200 rounded-2xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-all resize-none"
                      />
                    </div>

                    {/* Date */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700 mb-2">
                        <iconify-icon icon="solar:calendar-linear" />
                        Travel Date
                      </label>
                      <input
                        type="date"
                        value={form.dateToGo}
                        onChange={e => setForm({ ...form, dateToGo: e.target.value })}
                        min="2030-01-01"
                        max="2030-12-31"
                        className="w-full px-4 py-3 border-2 border-zinc-200 rounded-2xl text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      onClick={handleCreate}
                      disabled={creating}
                      className="w-full px-6 py-4 bg-zinc-900 text-white rounded-2xl font-semibold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {creating ? (
                        <>
                          <iconify-icon icon="solar:restart-linear" class="text-xl animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <iconify-icon icon="solar:add-circle-linear" class="text-xl" />
                          Create Itinerary
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

          ) : (
            /* ── EXISTING ITINERARIES ── */
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-8 fade-up">
                <div>
                  <h2 className="font-serif text-4xl font-bold text-zinc-900 mb-2">Your Itineraries</h2>
                  <p className="text-zinc-500">Manage your World Cup 2030 travel plans</p>
                </div>
              </div>

              {/* Itineraries Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {itineraries.map((itinerary, index) => (
                  <div
                    key={itinerary.id}
                    onClick={() => router.push(`/itineraries/${itinerary.id}`)}
                    className="group bg-white rounded-3xl border border-zinc-200 hover:border-zinc-300 hover:shadow-2xl transition-all cursor-pointer overflow-hidden fade-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    
                    {/* Header with gradient */}
                    <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <iconify-icon icon="solar:map-linear" class="text-white/60" />
                          <span className="text-white/60 text-xs uppercase tracking-wider font-semibold">Itinerary</span>
                        </div>
                        
                        <h3 className="font-serif text-3xl font-bold text-white mb-3 line-clamp-2">
                          {itinerary.title}
                        </h3>
                        
                        {itinerary.dateToGo && (
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <iconify-icon icon="solar:calendar-linear" />
                            <span className="font-medium">{formatDate(itinerary.dateToGo)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-8">
                      {itinerary.description && (
                        <p className="text-zinc-600 mb-6 line-clamp-3 leading-relaxed">
                          {itinerary.description}
                        </p>
                      )}

                      {/* CTA */}
                      <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
                        <span className="text-sm text-zinc-500 font-medium">
                          Click to view details
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 flex items-center justify-center transition-all">
                          <iconify-icon icon="solar:arrow-right-linear" class="text-zinc-600 group-hover:text-white transition-all text-lg" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info Card */}
              <div className="bg-amber-50 border-2 border-amber-100 rounded-3xl p-8 fade-up">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <iconify-icon icon="solar:lightbulb-linear" class="text-2xl text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 mb-2">Itinerary Limit</h3>
                    <p className="text-zinc-700 text-sm leading-relaxed">
                      You can have one itinerary per account. Click on your itinerary above to add attractions, 
                      update details, and plan your perfect World Cup 2030 experience across Morocco.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      <Footer />
    </>
  );
}