import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

export default function StadeDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [stade, setStade] = useState(null);
  const [images, setImages] = useState([]);
  const [matches, setMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'all'

  // Récupérer les données du stade
  useEffect(() => {
    if (!id) return;

    const fetchStadeData = async () => {
      try {
        // Récupérer les infos du stade
        const stadeRes = await fetch(`http://localhost:3309/api/stade/stade/${id}`);
        const stadeData = await stadeRes.json();
        setStade(stadeData);
        
        // Récupérer les images
        const imagesRes = await fetch(`http://localhost:3309/api/stade/images/stade/${id}`);
        const imagesData = await imagesRes.json();
        setImages(Array.isArray(imagesData) ? imagesData : []);
        
        // Récupérer tous les matches
        const matchesRes = await fetch(`http://localhost:3309/api/stade/stade/matches/${id}`);
        const matchesData = await matchesRes.json();
        setMatches(Array.isArray(matchesData) ? matchesData : []);
        
        // Récupérer les matches à venir
        const upcomingRes = await fetch(`http://localhost:3309/api/stade/stade/${id}/upcomingMatches`);
        const upcomingData = await upcomingRes.json();
        setUpcomingMatches(Array.isArray(upcomingData) ? upcomingData : []);
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setLoading(false);
      }
    };

    fetchStadeData();
  }, [id]);

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir le statut du match
  const getMatchStatus = (status) => {
    const statusMap = {
      'scheduled': { text: 'À venir', color: 'bg-blue-500' },
      'live': { text: 'En direct', color: 'bg-red-500 animate-pulse' },
      'finished': { text: 'Terminé', color: 'bg-stone-400' },
      'postponed': { text: 'Reporté', color: 'bg-amber-500' }
    };
    return statusMap[status] || { text: status, color: 'bg-stone-400' };
  };

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

  if (!stade) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
        <p className="text-xl text-stone-600">Stade non trouvé</p>
        <button 
          onClick={() => router.push('/Stades')}
          className="mt-4 px-6 py-2 bg-[#C1272D] text-white rounded-lg hover:bg-[#A01F25] transition-colors"
        >
          Retour aux stades
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{stade.name} | MoroccoFan2030</title>
        <meta name="description" content={stade.description} />
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

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }

        /* Image Lightbox */
        .lightbox {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
      `}</style>
      
      <Navbar />

      {/* Hero Header avec image du stade */}
      <header className="relative w-full pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={stade.imageUrl || '/images/terrain1.webp'}
            alt={stade.name}
            className="w-full h-full object-cover"
            onError={(e) => { 
              e.target.src = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Breadcrumb */}
          <button 
            onClick={() => router.push('/Stades')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors group"
          >
            <span className="material-icons text-xl">arrow_back</span>
            <span className="text-sm font-medium">Retour aux stades</span>
          </button>

          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-6">
              <span className="material-icons text-base">stadium</span>
              {stade.cityName}
            </div>

            {/* Titre principal */}
            <h1 className="text-5xl md:text-7xl font-normal tracking-tight text-white mb-6 leading-tight serif-font">
              {stade.name}
            </h1>

            {/* Description */}
            {stade.description && (
              <p className="text-white/90 text-lg leading-relaxed mb-8 max-w-3xl">
                {stade.description}
              </p>
            )}

            {/* Stats rapides */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3">
                <div className="w-12 h-12 rounded-full bg-[#C1272D] flex items-center justify-center">
                  <span className="material-icons text-white">event_seat</span>
                </div>
                <div>
                  <div className="text-xs text-white/60 uppercase tracking-wider">Capacité</div>
                  <div className="text-2xl font-bold text-white">
                    {stade.capacity ? stade.capacity.toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>

              {stade.dateOfConstruction && (
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
                    <span className="material-icons text-white">calendar_today</span>
                  </div>
                  <div>
                    <div className="text-xs text-white/60 uppercase tracking-wider">Construit en</div>
                    <div className="text-2xl font-bold text-white">
                      {new Date(stade.dateOfConstruction).getFullYear()}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3">
                <div className="w-12 h-12 rounded-full bg-[#006233] flex items-center justify-center">
                  <span className="material-icons text-white">sports_soccer</span>
                </div>
                <div>
                  <div className="text-xs text-white/60 uppercase tracking-wider">Matches</div>
                  <div className="text-2xl font-bold text-white">
                    {matches.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-stone-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Informations détaillées */}
          <section className="mb-16 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Carte d'informations */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
                <h2 className="text-2xl font-serif text-stone-900 mb-6 flex items-center gap-3">
                  <span className="material-icons text-[#C1272D]">info</span>
                  Informations
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 pb-4 border-b border-stone-100">
                    <span className="material-icons text-stone-400 mt-1">location_on</span>
                    <div>
                      <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Adresse</div>
                      <div className="text-stone-900 font-medium">{stade.adresse || 'Non spécifiée'}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 pb-4 border-b border-stone-100">
                    <span className="material-icons text-stone-400 mt-1">location_city</span>
                    <div>
                      <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Ville</div>
                      <div className="text-stone-900 font-medium">{stade.cityName}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 pb-4 border-b border-stone-100">
                    <span className="material-icons text-stone-400 mt-1">public</span>
                    <div>
                      <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Pays</div>
                      <div className="text-stone-900 font-medium">{stade.country || 'Maroc'}</div>
                    </div>
                  </div>

                  {stade.responsable && (
                    <div className="flex items-start gap-4">
                      <span className="material-icons text-stone-400 mt-1">person</span>
                      <div>
                        <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Responsable</div>
                        <div className="text-stone-900 font-medium">{stade.responsable}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Vidéo ou image principale */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
                {stade.videoUrl ? (
                  <div className="aspect-video">
                    <iframe
                      src={stade.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="aspect-video relative">
                    <img
                      src={stade.imageUrl || '/images/terrain1.webp'}
                      alt={stade.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { 
                        e.target.src = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Galerie d'images */}
          {images.length > 0 && (
            <section className="mb-16 animate-fade-in-up delay-100">
              <h2 className="text-3xl font-serif text-stone-900 mb-8 flex items-center gap-3">
                <span className="material-icons text-[#C1272D] text-3xl">photo_library</span>
                Galerie
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    onClick={() => setSelectedImage(image.imageUrl)}
                    className="aspect-video rounded-xl overflow-hidden cursor-pointer group relative bg-stone-200"
                  >
                    <img
                      src={image.imageUrl}
                      alt={`${stade.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { 
                        e.target.src = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400&auto=format&fit=crop";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <span className="material-icons text-white opacity-0 group-hover:opacity-100 transition-opacity text-4xl">
                        zoom_in
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Matches */}
          <section className="animate-fade-in-up delay-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-serif text-stone-900 flex items-center gap-3">
                <span className="material-icons text-[#C1272D] text-3xl">sports_soccer</span>
                Matches
              </h2>

              {/* Tabs */}
              <div className="flex gap-2 bg-stone-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'upcoming'
                      ? 'bg-white text-[#C1272D] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  À venir ({upcomingMatches.length})
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'all'
                      ? 'bg-white text-[#C1272D] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Tous ({matches.length})
                </button>
              </div>
            </div>

            {/* Liste des matches */}
            <div className="space-y-4">
              {(activeTab === 'upcoming' ? upcomingMatches : matches).length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-stone-100">
                  <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-icons text-4xl text-stone-400">sports_soccer</span>
                  </div>
                  <h3 className="text-xl font-medium text-stone-700 mb-2">
                    Aucun match {activeTab === 'upcoming' ? 'à venir' : 'trouvé'}
                  </h3>
                  <p className="text-stone-500">
                    {activeTab === 'upcoming' 
                      ? 'Les prochains matches seront bientôt annoncés' 
                      : 'Aucun match programmé pour ce stade'}
                  </p>
                </div>
              ) : (
                (activeTab === 'upcoming' ? upcomingMatches : matches).map((match, index) => {
                  const status = getMatchStatus(match.statut);
                  const team1 = match.matchTeams?.[0];
                  const team2 = match.matchTeams?.[1];

                  return (
                    <div
                      key={match.id}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => router.push(`/match/${match.id}`)}
                      style={{animationDelay: `${index * 0.05}s`}}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        {/* Date et Type */}
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[80px]">
                            <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                              {new Date(match.dateOfMatch).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </div>
                            <div className="text-lg font-bold text-stone-900">
                              {new Date(match.dateOfMatch).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>

                          <div className="h-12 w-px bg-stone-200"></div>

                          <div>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white ${status.color} mb-2`}>
                              {status.text === 'En direct' && (
                                <span className="w-2 h-2 bg-white rounded-full"></span>
                              )}
                              {status.text}
                            </div>
                            <div className="text-xs text-stone-500 font-medium uppercase tracking-wide">
                              {match.type}
                            </div>
                          </div>
                        </div>

                        {/* Teams */}
                        <div className="flex-1 flex items-center justify-center gap-6">
                          {team1 && (
                            <>
                              <div className="text-right flex-1">
                                <div className="text-lg font-bold text-stone-900 mb-1">
                                  {team1.teamName}
                                </div>
                                {team1.goals !== null && team1.goals !== undefined && (
                                  <div className="text-2xl font-bold text-[#C1272D]">
                                    {team1.goals}
                                  </div>
                                )}
                              </div>

                              <div className="text-2xl font-bold text-stone-300">vs</div>

                              <div className="text-left flex-1">
                                <div className="text-lg font-bold text-stone-900 mb-1">
                                  {team2?.teamName || 'TBD'}
                                </div>
                                {team2?.goals !== null && team2?.goals !== undefined && (
                                  <div className="text-2xl font-bold text-[#C1272D]">
                                    {team2.goals}
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Referee */}
                        {match.referee && (
                          <div className="flex items-center gap-2 text-sm text-stone-500">
                            <span className="material-icons text-base">sports</span>
                            <span>{match.referee}</span>
                          </div>
                        )}

                        {/* Arrow */}
                        <span className="material-icons text-stone-300 group-hover:text-[#C1272D] transition-colors">
                          arrow_forward
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Lightbox pour les images */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 lightbox p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <span className="material-icons text-white text-2xl">close</span>
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </>
  );
}