import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Itineraries() {
  const router = useRouter();

  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItineraries, setFilteredItineraries] = useState([]);

  // TODO: remplacer par l'ID du supporter connecté (via session/auth)
  const supporterId = 1;

  // Récupérer les itinéraires du supporter
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3309/api/itineraries/supporter/${supporterId}`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.content || data.itineraries || [];
        setItineraries(list);
        setFilteredItineraries(list);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur:', err);
        setLoading(false);
      });
  }, [supporterId]);

  // Filtre par recherche
  useEffect(() => {
    let filtered = [...itineraries];
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(it =>
        it.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredItineraries(filtered);
  }, [searchQuery, itineraries]);

  const navigateToDetail = (id) => {
    router.push(`/itineraries/${id}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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
        <title>My Itineraries | MoroccoFan2030</title>
        <meta name="description" content="Manage your travel itineraries for the 2030 World Cup" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        .bg-pattern {
          background-color: #fafaf9;
          background-image: radial-gradient(#e7e5e4 1px, transparent 1px);
          background-size: 24px 24px;
        }
        body { font-family: 'Cairo', sans-serif; }
        h1, h2, h3, h4, .serif-font { font-family: 'Amiri', serif; }
        .decorative-font { font-family: 'Aref Ruqaa', serif; }
        .glass {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .bg-morocco-red { background: linear-gradient(135deg, #C1272D 0%, #a01e23 100%); }
        .bg-morocco-green { background: linear-gradient(135deg, #006233 0%, #004d28 100%); }
        .image-overlay { position: relative; overflow: hidden; }
        .image-overlay::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%);
        }
      `}</style>

      <Navbar />

      {/* Hero Section */}
      <header className="relative pt-32 pb-12 border-b border-stone-200 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/cities-bg.jpg" alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/65"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="px-4 py-1.5 bg-white border border-stone-200 rounded-full flex items-center gap-2 shadow-sm">
              <span className="material-icons text-[#006233] text-sm">map</span>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">My Itineraries</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 serif-font">
                My Travel Plans
              </h1>
              <p className="text-lg text-white/80 max-w-xl">
                Organize your World Cup 2030 adventure — plan your visits, add attractions and make unforgettable memories.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-center">
                <div className="text-3xl font-bold text-white">{itineraries.length}</div>
                <div className="text-xs text-white/70 uppercase tracking-wider mt-1">Itineraries</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters Bar */}
      <section className="sticky top-0 z-30 glass border-b border-stone-200 bg-pattern">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">search</span>
              <input
                type="text"
                placeholder="Search itineraries..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-[#006233] focus:ring-2 focus:ring-[#006233]/10 transition-all"
              />
            </div>

            {/* Create new Itinerary button */}
            <button
              onClick={() => router.push('/itineraries/create')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#006233] to-[#004d28] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/20 transition-all text-sm"
            >
              <span className="material-icons text-sm">add</span>
              New Itinerary
            </button>
          </div>
        </div>
      </section>

      {/* Itineraries Grid */}
      <section className="py-12 bg-gradient-to-br from-stone-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          {filteredItineraries.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-stone-400 text-4xl">map</span>
              </div>
              <h3 className="text-xl font-medium text-stone-700 mb-2">No itineraries found</h3>
              <p className="text-stone-500 mb-6">Start planning your World Cup adventure!</p>
              <button
                onClick={() => router.push('/itineraries/create')}
                className="px-6 py-3 bg-gradient-to-r from-[#006233] to-[#004d28] text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Create My First Itinerary
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItineraries.map((it) => (
                <div
                  key={it.id}
                  onClick={() => navigateToDetail(it.id)}
                  className="bg-white rounded-2xl border-2 border-stone-200 hover:border-[#006233] hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden group cursor-pointer"
                >
                  {/* Header Card */}
                  <div className="bg-gradient-to-br from-[#006233] to-[#004d28] p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-icons text-white/60 text-sm">map</span>
                        <span className="text-white/60 text-xs uppercase tracking-wider font-bold">Itinerary</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white serif-font line-clamp-2">
                        {it.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {it.description && (
                      <p className="text-sm text-stone-600 mb-4 line-clamp-3">
                        {it.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      {it.dateToGo && (
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <span className="material-icons text-[#006233]" style={{ fontSize: '16px' }}>event</span>
                          <span className="font-medium">{formatDate(it.dateToGo)}</span>
                        </div>
                      )}
                    </div>

                    <button className="w-full px-4 py-2 bg-gradient-to-r from-[#006233] to-[#004d28] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/20 transition-all group-hover:shadow-lg">
                      <span className="flex items-center justify-center gap-2">
                        View Itinerary
                        <span className="material-icons text-sm">arrow_forward</span>
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
