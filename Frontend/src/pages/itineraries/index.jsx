import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Itineraries() {
  const router = useRouter();

  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [notification, setNotification] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    dateToGo: ''
  });

  // TODO: remplacer par l'ID du supporter connecté
  const supporterId = 1;

  // Vérifier si le supporter a déjà un itinéraire
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3309/api/itineraries/supporter/${supporterId}`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.content || [];
        if (list.length > 0) {
          setItinerary(list[0]); // un seul itinéraire par supporter
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur:', err);
        setLoading(false);
      });
  }, [supporterId]);

  const showNotif = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = () => {
    if (!form.title.trim()) {
      showNotif('error', 'Please enter a title.');
      return;
    }
    setCreating(true);
    fetch(`http://localhost:3309/api/itineraries/add/${supporterId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(success => {
        if (success) {
          showNotif('success', 'Itinerary created!');
          return fetch(`http://localhost:3309/api/itineraries/supporter/${supporterId}`)
            .then(r => r.json())
            .then(data => {
              const list = Array.isArray(data) ? data : data.content || [];
              if (list.length > 0) setItinerary(list[0]);
              setCreating(false);
            });
        } else {
          showNotif('error', 'Could not create itinerary.');
          setCreating(false);
        }
      })
      .catch(() => {
        showNotif('error', 'Server error.');
        setCreating(false);
      });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <img src="/images/logo.png" alt="Loading" className="w-20 h-20 mb-4" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Itinerary | MoroccoFan2030</title>
        <meta name="description" content="Plan your World Cup 2030 trip" />
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

      {/* Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium ${
          notification.type === 'success' ? 'bg-[#006233]' : 'bg-[#C1272D]'
        }`}>
          <span className="material-icons text-sm">
            {notification.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {notification.message}
        </div>
      )}

      {/* Hero */}
      <header className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/cities-bg.jpg" alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/65"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="px-4 py-1.5 bg-white border border-stone-200 rounded-full flex items-center gap-2 shadow-sm">
              <span className="material-icons text-[#006233] text-sm">map</span>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">My Itinerary</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 serif-font">
            {itinerary ? itinerary.title : 'Plan Your Trip'}
          </h1>
          <p className="text-lg text-white/80 max-w-xl">
            {itinerary
              ? 'Manage your World Cup 2030 adventure — add and explore attractions across Morocco.'
              : 'Create your personal itinerary to organize your World Cup 2030 adventure.'}
          </p>
        </div>
      </header>

      <section className="py-16 bg-gradient-to-br from-stone-50 to-white min-h-screen">
        <div className="max-w-3xl mx-auto px-6">

          {itinerary ? (
            /* ── A déjà un itinéraire ── */
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border-2 border-[#006233] shadow-xl overflow-hidden">
                {/* Card header */}
                <div className="bg-gradient-to-br from-[#006233] to-[#004d28] p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-icons text-white/60 text-sm">map</span>
                      <span className="text-white/60 text-xs uppercase tracking-wider font-bold">My Itinerary</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white serif-font mb-2">{itinerary.title}</h2>
                    {itinerary.dateToGo && (
                      <div className="flex items-center gap-2 text-white/80 text-sm">
                        <span className="material-icons text-sm">event</span>
                        <span>{formatDate(itinerary.dateToGo)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-8">
                  {itinerary.description && (
                    <p className="text-stone-600 mb-6 leading-relaxed">{itinerary.description}</p>
                  )}
                  <button
                    onClick={() => router.push(`/itineraries/${itinerary.id}`)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-[#006233] to-[#004d28] text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
                  >
                    <span className="material-icons">place</span>
                    View & Manage My Attractions
                    <span className="material-icons">arrow_forward</span>
                  </button>
                </div>
              </div>


            </div>

          ) : (
            /* ── Pas encore d'itinéraire → formulaire ── */
            <div className="space-y-6">
              {/* Intro */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#006233] to-[#004d28] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="material-icons text-white text-4xl">map</span>
                </div>
                <h2 className="text-3xl font-bold text-stone-900 serif-font mb-2">Create Your Itinerary</h2>
                <p className="text-stone-500">Plan your perfect World Cup 2030 adventure in Morocco</p>
              </div>

              {/* Form */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-lg p-8 space-y-6">

                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    <span className="flex items-center gap-2">
                      <span className="material-icons text-[#006233] text-sm">title</span>
                      Itinerary Title *
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. My World Cup 2030 Adventure"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl text-stone-700 placeholder-stone-400 focus:outline-none focus:border-[#006233] focus:ring-2 focus:ring-[#006233]/10 transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    <span className="flex items-center gap-2">
                      <span className="material-icons text-[#006233] text-sm">notes</span>
                      Description
                    </span>
                  </label>
                  <textarea
                    placeholder="Describe your trip plans..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl text-stone-700 placeholder-stone-400 focus:outline-none focus:border-[#006233] focus:ring-2 focus:ring-[#006233]/10 transition-all resize-none"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    <span className="flex items-center gap-2">
                      <span className="material-icons text-[#006233] text-sm">event</span>
                      Date of Travel
                    </span>
                  </label>
                  <input
                    type="date"
                    value={form.dateToGo}
                    onChange={e => setForm({ ...form, dateToGo: e.target.value })}
                    min="2030-01-01"
                    max="2030-12-31"
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:border-[#006233] focus:ring-2 focus:ring-[#006233]/10 transition-all"
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="w-full px-6 py-4 bg-gradient-to-r from-[#006233] to-[#004d28] text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <>
                      <span className="material-icons animate-spin text-sm">autorenew</span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="material-icons">add_circle</span>
                      Create My Itinerary
                    </>
                  )}
                </button>
              </div>

              {/* Tips */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-icons text-amber-600">lightbulb</span>
                  <h3 className="font-bold text-stone-900">Good to know</h3>
                </div>
                <ul className="space-y-2 text-sm text-stone-700">
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-amber-500 text-sm mt-0.5">check_circle</span>
                    <span>You can only have one itinerary per account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-amber-500 text-sm mt-0.5">check_circle</span>
                    <span>Add unlimited attractions to your itinerary</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-amber-500 text-sm mt-0.5">check_circle</span>
                    <span>Browse cities and attractions to build your plan</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

        </div>
      </section>

      <Footer />
    </>
  );
}
