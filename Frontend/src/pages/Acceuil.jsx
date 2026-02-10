import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function Acceuil() {
  // États pour stocker les données
  const [cities, setCities] = useState([]);
  const [stades, setStades] = useState([]);
  const [groups, setGroups] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [cultures, setCultures] = useState([]);
  const [teams, setTeams] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);

  // États pour gérer le chargement et les erreurs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs pour les sliders
  const citiesScrollRef = useRef(null);
  const newsScrollRef = useRef(null);

  // Récupérer les villes
  useEffect(() => {
    fetch('http://localhost:3309/api/acceuil/CityHosts/all')
      .then((res) => res.json())
      .then((data) => {
        setCities(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Récupérer les stades
  useEffect(() => {
    fetch('http://localhost:3309/api/acceuil/stade/all')
      .then((res) => res.json())
      .then((data) => setStades(data))
      .catch((err) => console.error('Erreur:', err));
  }, []);

  // Récupérer les groupes
  useEffect(() => {
    fetch('http://localhost:3309/api/acceuil/accueil/groupes')
      .then((res) => res.json())
      .then((data) => setGroups(data))
      .catch((err) => console.error('Erreur:', err));
  }, []);

  // Récupérer les événements à venir
  useEffect(() => {
    fetch('http://localhost:3309/api/acceuil/evants/upcaming')
      .then((res) => res.json())
      .then((data) => setUpcomingEvents(data))
      .catch((err) => console.error('Erreur:', err));
  }, []);

  // Récupérer les dernières actualités
  useEffect(() => {
    fetch('http://localhost:3309/api/acceuil/news/lastest')
      .then((res) => res.json())
      .then((data) => setLatestNews(data))
      .catch((err) => console.error('Erreur:', err));
  }, []);

  // Récupérer les cultures
  useEffect(() => {
    fetch('http://localhost:3309/api/acceuil/culture/foryou')
      .then((res) => res.json())
      .then((data) => setCultures(data))
      .catch((err) => console.error('Erreur:', err));
  }, []);

  // Récupérer quelques équipes
  useEffect(() => {
    fetch('http://localhost:3309/api/acceuil/teams/some')
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((err) => console.error('Erreur:', err));
  }, []);

  // Récupérer les matchs à venir - FILTRER SEULEMENT LES MATCHS FUTURS
  useEffect(() => {
    fetch('http://localhost:3309/api/acceuil/matches/upcoming')
      .then((res) => res.json())
      .then((data) => {
        // Filtrer pour garder seulement les matchs dont la date est dans le futur
        const now = new Date();
        const futureMatches = data.filter(match => {
          const matchDate = new Date(match.dateOfMatch);
          return matchDate > now;
        });
        setUpcomingMatches(futureMatches);
      })
      .catch((err) => console.error('Erreur:', err));
  }, []);

  // Fonction countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const firstMatch = new Date('2030-06-11T18:00:00Z').getTime();
      const now = new Date().getTime();
      const distance = firstMatch - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const daysEl = document.getElementById('days');
      const hoursEl = document.getElementById('hours');
      const minutesEl = document.getElementById('minutes');
      const secondsEl = document.getElementById('seconds');

      if (daysEl) daysEl.textContent = String(days).padStart(3, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
      if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');

      if (distance < 0) {
        const countdownEl = document.getElementById('countdown');
        if (countdownEl) {
          countdownEl.innerHTML = '<span class="text-2xl font-bold text-white">The Match Has Begun!</span>';
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fonctions de navigation pour les sliders
  const scrollCities = (direction) => {
    if (citiesScrollRef.current) {
      const scrollAmount = 360; // largeur d'une carte + gap
      const newScrollPosition = citiesScrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      citiesScrollRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollNews = (direction) => {
    if (newsScrollRef.current) {
      const scrollAmount = 400;
      const newScrollPosition = newsScrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      newsScrollRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  // Affichage du chargement ou des erreurs
 if (loading) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <img
        src="/images/logo.png"
        alt="Loading"
        className="w-20 h-20 mb-4"
      />
    </div>
  );
}
  if (error) return <p className="text-center py-10 text-red-500">Erreur: {error}</p>;

  return (
    <>
      <Head>
        <title>MoroccoFan2030 | The Kingdom Roars</title>
        <meta name="description" content="MoroccoFan2030 - Football World Cup 2030 in Morocco" />
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

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .glass {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        body { font-family: 'Cairo', sans-serif; letter-spacing: 0.01em; }
        h1, h2, h3, h4, .serif-font { font-family: 'Amiri', serif; letter-spacing: 0.02em; }
        .decorative-font { font-family: 'Aref Ruqaa', serif; }

        .bg-morocco-red { background: linear-gradient(135deg, #C1272D 0%, #a01e23 100%); }
        .bg-morocco-green { background: linear-gradient(135deg, #006233 0%, #004d28 100%); }

        @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glow { 0%, 100% { text-shadow: 0 0 30px rgba(193, 39, 45, 0.5), 0 0 60px rgba(193, 39, 45, 0.3); } 50% { text-shadow: 0 0 40px rgba(193, 39, 45, 0.8), 0 0 80px rgba(193, 39, 45, 0.4); } }
        @keyframes float { 0%, 100% { transform: translateY(0) translateX(0); } 25% { transform: translateY(-30px) translateX(20px); } 50% { transform: translateY(-60px) translateX(-20px); } 75% { transform: translateY(-30px) translateX(20px); } }
        @keyframes scroll-dot { 0%, 100% { transform: translateY(0); opacity: 0; } 50% { transform: translateY(12px); opacity: 1; } }

        .animate-fade-in-down { animation: fade-in-down 0.8s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; opacity: 0; animation-fill-mode: forwards; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-scroll-dot { animation: scroll-dot 2s ease-in-out infinite; }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative">
              <img src="/images/logo.png" alt="MoroccoFan2030 Logo" className="w-10 h-10 object-cover transition-all" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-stone-900 text-sm">
                Morocco<span className="text-[#C1272D]">2030</span>
              </span>
              <span className="text-xs text-[#006233] decorative-font" style={{marginTop: '-2px'}}>المغرب</span>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-1">
            <a href="#cities" className="group px-4 py-2 hover:bg-green-50 rounded-lg transition-all">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-stone-700 group-hover:text-[#006233] transition-colors">Cities</span>
                <span className="text-xs text-[#006233] decorative-font opacity-70">المدن</span>
              </div>
            </a>
            <a href="/Matches" className="group px-4 py-2 hover:bg-red-50 rounded-lg transition-all">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-stone-700 group-hover:text-[#C1272D] transition-colors">Matches</span>
                <span className="text-xs text-[#C1272D] decorative-font opacity-70">المباريات</span>
              </div>
            </a>
            <a href="#culture" className="group px-4 py-2 hover:bg-green-50 rounded-lg transition-all">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-stone-700 group-hover:text-[#006233] transition-colors">Culture</span>
                <span className="text-xs text-[#006233] decorative-font opacity-70">الثقافة</span>
              </div>
            </a>
            <a href="#groups" className="group px-4 py-2 hover:bg-red-50 rounded-lg transition-all">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-stone-700 group-hover:text-[#C1272D] transition-colors">Groups</span>
                <span className="text-xs text-[#C1272D] decorative-font opacity-70">المجموعات</span>
              </div>
            </a>
             <a href="#news" onClick={(e) => handleNavClick(e, 'news')} className="group px-4 py-2 hover:bg-amber-50 rounded-lg transition-all">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-stone-700 group-hover:text-amber-600 transition-colors">News</span>
                <span className="text-xs text-amber-600 decorative-font opacity-70">الأخبار</span>
              </div>
            </a>
            <a href="#" className="group px-4 py-2 hover:bg-purple-50 rounded-lg transition-all">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-stone-700 group-hover:text-purple-600 transition-colors">Prediction</span>
                <span className="text-xs text-purple-600 decorative-font opacity-70">التوقعات</span>
              </div>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a href="#" className="relative overflow-hidden bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white px-5 py-2.5 rounded-lg font-bold tracking-wide hover:shadow-xl hover:shadow-red-500/40 transition-all flex items-center gap-2 group">
              <span className="relative z-10">Tickets</span>
              <span className="text-xs decorative-font opacity-90 relative z-10">التذاكر</span>
              <div className="absolute inset-0 bg-[#006233] transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section with Countdown */}
      <header className="relative w-full pt-32 pb-20 md:pt-48 md:pb-24 overflow-hidden border-b border-stone-200">
        <div className="absolute inset-0 w-full h-full z-0">
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="/videos/maroc.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#C1272D]/20 via-transparent to-[#006233]/20 animate-pulse" style={{animationDuration: '4s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="mb-8 animate-fade-in-down">
              <div className="inline-flex flex-col items-center gap-2 px-6 py-4 rounded-2xl backdrop-blur-md border border-[#006233]/30 shadow-2xl">
                <span className="text-xs font-bold text-green-200 uppercase tracking-widest decorative-font">First Match Begins In</span>
                <div className="flex items-center gap-3" id="countdown">
                  <div className="flex flex-col items-center">
                    <span className="text-3xl md:text-4xl font-bold text-white" id="days">000</span>
                    <span className="text-xs text-green-200 mt-1">Days</span>
                  </div>
                  <span className="text-3xl text-white/50">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl md:text-4xl font-bold text-white" id="hours">00</span>
                    <span className="text-xs text-green-200 mt-1">Hours</span>
                  </div>
                  <span className="text-3xl text-white/50">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl md:text-4xl font-bold text-white" id="minutes">00</span>
                    <span className="text-xs text-green-200 mt-1">Min</span>
                  </div>
                  <span className="text-3xl text-white/50">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl md:text-4xl font-bold text-white" id="seconds">00</span>
                    <span className="text-xs text-green-200 mt-1">Sec</span>
                  </div>
                </div>
                <span className="text-xs text-green-200 decorative-font mt-1">حتى المباراة الأولى</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-white mb-6 leading-[0.95] drop-shadow-2xl animate-fade-in-up">
              Football returns to the <br />
              <span className="decorative-font italic text-[#C1272D] font-bold drop-shadow-2xl animate-glow" style={{textShadow: '0 0 30px rgba(193, 39, 45, 0.5)'}}>
                Kingdom of Light.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-lg animate-fade-in" style={{animationDelay: '0.2s'}}>
              Six cities, one heartbeat. Join us for a historic World Cup across two continents, uniting civilizations through the beautiful game.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in" style={{animationDelay: '0.4s'}}>
              <button className="group px-8 py-4 bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white rounded-xl font-medium hover:shadow-2xl hover:shadow-red-500/50 hover:scale-105 transition-all duration-300 shadow-xl shadow-[#C1272D]/30 flex items-center justify-center gap-2 backdrop-blur-sm">
                <span className="material-icons group-hover:rotate-12 transition-transform duration-300">calendar_today</span>
                <span>View Schedule</span>
              </button>
              <button className="group px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-medium hover:bg-white/20 hover:border-white/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-xl">
                <span>Discover Cities</span>
                <span className="material-icons group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
          <div className="absolute w-2 h-2 bg-white/30 rounded-full animate-float" style={{top: '20%', left: '10%', animationDelay: '0s', animationDuration: '8s'}}></div>
          <div className="absolute w-3 h-3 bg-[#C1272D]/30 rounded-full animate-float" style={{top: '60%', left: '80%', animationDelay: '2s', animationDuration: '10s'}}></div>
          <div className="absolute w-2 h-2 bg-[#006233]/30 rounded-full animate-float" style={{top: '40%', left: '70%', animationDelay: '4s', animationDuration: '12s'}}></div>
          <div className="absolute w-3 h-3 bg-white/20 rounded-full animate-float" style={{top: '80%', left: '30%', animationDelay: '1s', animationDuration: '9s'}}></div>
        </div>
      </header>

      {/* Participating Teams Slider */}
      <section className="py-12 bg-gradient-to-r from-stone-50 to-white border-b border-stone-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Participating Nations</h3>
        </div>
        <div className="relative w-full">
          <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-stone-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

          <div className="flex overflow-x-auto gap-12 px-6 pb-4 items-center no-scrollbar">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center gap-3 shrink-0 opacity-50 hover:opacity-100 transition-opacity cursor-default group">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center overflow-hidden group-hover:shadow-md group-hover:shadow-red-500/20 transition-all">
                  <img 
                    src={team.imageUrl}
                    alt={team.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm font-semibold tracking-wide text-stone-900">{team.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Matches - AFFICHER SEULEMENT LES MATCHS FUTURS */}
      <section id="matches" className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-medium text-stone-900 tracking-tight">Upcoming Fixtures</h2>
              <p className="text-stone-500 mt-2">Key qualification and friendly matches.</p>
            </div>
            <a href="#" className="text-sm font-medium text-[#C1272D] flex items-center gap-1 hover:gap-2 transition-all group">
              View Full Calendar <span className="material-icons text-sm group-hover:text-[#006233]">arrow_forward</span>
            </a>
          </div>

          {upcomingMatches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stone-500">No upcoming matches at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {upcomingMatches.slice(0, 3).map((match) => (
                <div key={match.id} className="col-span-1 bg-gradient-to-br from-[#C1272D] to-[#a01e23] text-white rounded-2xl p-6 relative overflow-hidden group shadow-2xl shadow-red-500/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#006233]/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start mb-6">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-medium uppercase tracking-wider">Next Match</span>
                      <span className="material-icons text-white/60 hover:text-white cursor-pointer">notifications</span>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                      <div className="text-center">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-2 shadow-lg mx-auto overflow-hidden">
                          <img 
                            src={match.matchTeams && match.matchTeams[0] ? match.matchTeams[0].imageUrl : ''}
                            alt={match.matchTeams && match.matchTeams[0] ? match.matchTeams[0].teamName : 'Team 1'}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = `https://via.placeholder.com/56x56/C1272D/FFFFFF?text=${match.matchTeams && match.matchTeams[0] ? match.matchTeams[0].teamName.substring(0, 2) : 'T1'}`; }}
                          />
                        </div>
                        <span className="text-sm font-medium">{match.matchTeams && match.matchTeams[0] ? match.matchTeams[0].teamName : 'Team 1'}</span>
                      </div>
                      <div className="text-center px-4">
                        <span className="text-3xl font-light text-white/70">vs</span>
                        <div className="text-xs text-white/70 mt-1 uppercase tracking-widest">
                          {new Date(match.dateOfMatch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur border border-white/20 rounded-full flex items-center justify-center mb-2 mx-auto overflow-hidden">
                          <img 
                            src={match.matchTeams && match.matchTeams[1] ? match.matchTeams[1].imageUrl : ''}
                            alt={match.matchTeams && match.matchTeams[1] ? match.matchTeams[1].teamName : 'Team 2'}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = `https://via.placeholder.com/56x56/006233/FFFFFF?text=${match.matchTeams && match.matchTeams[1] ? match.matchTeams[1].teamName.substring(0, 2) : 'T2'}`; }}
                          />
                        </div>
                        <span className="text-sm font-medium">{match.matchTeams && match.matchTeams[1] ? match.matchTeams[1].teamName : 'Team 2'}</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/20">
                      <div className="flex items-center gap-2 text-xs text-white/90">
                        <span className="material-icons text-white/60">location_on</span>
                        <span>{match.stadeName || 'Stadium TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/90 mt-1">
                        <span className="material-icons text-white/60">calendar_today</span>
                        <span>{new Date(match.dateOfMatch).toLocaleDateString()} • {match.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Groups Section */}
      <section id="groups" className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-medium text-stone-900 tracking-tight">Tournament Groups</h2>
            <p className="text-stone-500 mt-2">Projected standings and live updates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {groups.map((group, groupIndex) => (
              <div key={group.id} className={`bg-gradient-to-br ${groupIndex % 2 === 0 ? 'from-red-50 to-white border-red-100' : 'from-green-50 to-white border-green-100'} rounded-2xl border-2 p-6 hover:shadow-xl ${groupIndex % 2 === 0 ? 'hover:shadow-red-500/10' : 'hover:shadow-green-500/10'} transition-all duration-300`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`font-bold ${groupIndex % 2 === 0 ? 'text-[#C1272D]' : 'text-[#006233]'} text-lg`}>{group.name}</h3>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`text-stone-400 text-xs border-b ${groupIndex % 2 === 0 ? 'border-red-100' : 'border-green-100'}`}>
                      <th className="font-medium text-left pb-2 w-8">#</th>
                      <th className="font-medium text-left pb-2">Team</th>
                      <th className="font-medium text-right pb-2">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="text-stone-600">
                    {group.groupTeams && group.groupTeams.map((team, index) => (
                      <tr key={team.id} className={`border-b border-stone-50 ${index === 0 ? `bg-gradient-to-r ${groupIndex % 2 === 0 ? 'from-[#C1272D]/10' : 'from-[#006233]/10'} to-transparent` : ''}`}>
                        <td className={`py-3 ${index === 0 ? `font-medium ${groupIndex % 2 === 0 ? 'text-[#C1272D]' : 'text-[#006233]'}` : ''}`}>{index + 1}</td>
                        <td className={`py-3 ${index === 0 ? 'font-semibold text-stone-900' : ''} flex items-center gap-2`}>
                          <div className="w-5 h-5 rounded-full overflow-hidden border border-stone-200 flex-shrink-0">
                            <img 
                              src={team.teamImageUrl}
                              alt={team.teamName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {team.teamName}
                        </td>
                        <td className={`py-3 text-right ${index === 0 ? `font-bold ${groupIndex % 2 === 0 ? 'text-[#C1272D]' : 'text-[#006233]'}` : ''}`}>
                          {team.wins * 3 + team.draws}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Host Cities Section - AVEC FLECHES FONCTIONNELLES */}
      <section className="bg-gradient-to-br from-green-900 via-[#004d28] to-green-950 border-green-950 border-b pt-16 pb-16 relative overflow-hidden" id="cities">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize: '200px'}}></div>
        
        <div className="flex max-w-7xl mr-auto mb-8 ml-auto pr-6 pl-6 items-end justify-between relative z-10">
          <div>
            <h2 className="text-3xl font-medium text-white tracking-tight">Host Cities</h2>
            <p className="text-green-200 mt-2">Explore the six venues across the Kingdom.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => scrollCities('left')}
              className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/50 transition-all cursor-pointer"
            >
              <span className="material-icons">arrow_back</span>
            </button>
            <button 
              onClick={() => scrollCities('right')}
              className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/50 transition-all cursor-pointer"
            >
              <span className="material-icons">arrow_forward</span>
            </button>
          </div>
        </div>

        <div 
          ref={citiesScrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 px-6 max-w-[100vw] no-scrollbar relative z-10"
        >
          {cities.map((city) => (
            <div key={city.id} className="min-w-[280px] md:min-w-[340px] snap-center group cursor-pointer">
              <div className="relative h-[400px] rounded-2xl overflow-hidden mb-4 ring-2 ring-white/20 group-hover:ring-white/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                <img
                  src={city.imageUrl}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-6 left-6 z-20 text-white">
                  <span className="text-xs font-bold uppercase tracking-wider mb-1 block text-amber-300">Host City</span>
                  <h3 className="text-3xl font-serif mb-1">{city.name}</h3>
                  <p className="text-sm opacity-80 flex items-center gap-1">
                    <span className="material-icons text-white/60 text-base">location_on</span>
                    {city.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest News Section - AVEC FLECHES FONCTIONNELLES ET TITRES CORRIGES */}
      <section className="border-y bg-white border-stone-100 pt-20 pb-20" id="news">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-medium text-stone-900 tracking-tight">Latest News</h2>
              <p className="text-stone-500 mt-2">Stay updated with the latest from Morocco 2030</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => scrollNews('left')}
                className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 text-stone-500 hover:text-[#006233] hover:border-[#006233] transition-all cursor-pointer"
              >
                <span className="material-icons">arrow_back</span>
              </button>
              <button 
                onClick={() => scrollNews('right')}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white flex items-center justify-center hover:shadow-lg hover:shadow-red-500/30 transition-all cursor-pointer"
              >
                <span className="material-icons">arrow_forward</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Large Featured News - Left */}
            {latestNews && latestNews.length > 0 && latestNews[0] && (
              <article className="md:col-span-2 group cursor-pointer">
                <div className="relative h-[400px] rounded-2xl overflow-hidden mb-4 ring-2 ring-transparent group-hover:ring-[#C1272D]/20 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                  <img 
                    src={latestNews[0].imageUrl || "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2070&auto=format&fit=crop"} 
                    alt={latestNews[0].title || 'News'} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1 bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                      {latestNews[0].category || 'NEWS'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 text-xs text-stone-400 mb-2">
                    <span>{new Date(latestNews[0].dateOfCreation).toLocaleDateString()}</span>
                    <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                    <span>4 min read</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-medium text-stone-900 mb-2 group-hover:text-[#C1272D] transition-colors serif-font">
                    {latestNews[0].title || 'Latest News Update'}
                  </h3>
                  <p className="text-stone-500 leading-relaxed">{latestNews[0].description || 'Read the latest updates about Morocco 2030'}</p>
                </div>
              </article>
            )}

            {/* Side News List - Right */}
            <div className="flex flex-col gap-6">
              {latestNews && latestNews.slice(1, 4).map((news, index) => (
                <article key={news.id || index} className="group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0 ring-2 ring-transparent group-hover:ring-stone-200 transition-all">
                      <img 
                        src={news.imageUrl || "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=800&auto=format&fit=crop"} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        alt={news.title || 'News'} 
                      />
                    </div>
                    <div className="flex-1">
                      <span className={`text-xs font-bold uppercase tracking-wider mb-1 block ${index === 0 ? 'text-[#006233]' : index === 1 ? 'text-amber-600' : 'text-[#C1272D]'}`}>
                        {news.category || (index === 0 ? 'TEAM NEWS' : index === 1 ? 'TOURISM' : 'FIFA')}
                      </span>
                      <h4 className="text-base font-medium text-stone-900 mb-1 group-hover:text-[#C1272D] transition-colors leading-tight">
                        {news.title || 'News Update'}
                      </h4>
                      <p className="text-xs text-stone-400">{new Date(news.dateOfCreation).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {index < 2 && <div className="w-full h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent mt-6"></div>}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cultural Pulse Section - TITRES CORRIGES */}
      <section id="culture" className="py-24 bg-gradient-to-br from-[#C1272D] via-[#a01e23] to-[#8b1820] text-stone-200 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize: '200px'}}></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-medium text-white tracking-tight mb-2">Cultural Pulse</h2>
              <p className="text-red-100">Experience the sights, sounds, and tastes of the Maghreb.</p>
            </div>
            <button className="text-amber-300 hover:text-white transition-colors font-medium flex items-center gap-2 mt-4 md:mt-0 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20">
              Discover More
              <span className="material-icons text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Featured Culture Card - Left (2/3 width) */}
            {cultures && cultures.length > 0 && cultures[0] && (
              <div className="md:col-span-2 relative h-[500px] rounded-3xl overflow-hidden group cursor-pointer ring-2 ring-white/20 hover:ring-white/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10"></div>
                <img
                  src={cultures[0].imageUrl || "https://images.unsplash.com/photo-1535069502363-2207185df19f?q=80&w=2070&auto=format&fit=crop"}
                  alt={cultures[0].title || 'Culture'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-8 left-8 z-20 max-w-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold uppercase rounded-full shadow-lg">
                      {cultures[0].category || 'CULTURE'}
                    </span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-serif text-white mb-3 leading-tight">
                    {cultures[0].title || 'Discover Moroccan Culture'}
                  </h3>
                  <p className="text-stone-200 leading-relaxed">
                    {cultures[0].description || 'Experience the rich cultural heritage of Morocco'}
                  </p>
                </div>
              </div>
            )}

            {/* Stacked Smaller Culture Cards - Right (1/3 width) */}
            <div className="flex flex-col gap-6 h-[500px]">
              {cultures && cultures.length > 1 && cultures[1] && (
                <div className="flex-1 relative rounded-3xl overflow-hidden group cursor-pointer ring-2 ring-white/20 hover:ring-white/40 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                  <img 
                    src={cultures[1].imageUrl || "https://images.unsplash.com/photo-1590418606746-0188b23364f9?q=80&w=800&auto=format&fit=crop"} 
                    alt={cultures[1].title || 'Culture'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute bottom-6 left-6 z-20">
                    <span className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-1 block">
                      {cultures[1].category || 'HERITAGE'}
                    </span>
                    <h4 className="text-xl font-medium text-white leading-tight">
                      {cultures[1].title || 'Moroccan Heritage'}
                    </h4>
                  </div>
                </div>
              )}

              {cultures && cultures.length > 2 && cultures[2] && (
                <div className="flex-1 relative rounded-3xl overflow-hidden group cursor-pointer ring-2 ring-white/20 hover:ring-white/40 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                  <img 
                    src={cultures[2].imageUrl || "https://images.unsplash.com/photo-1512553353614-82a737009659?q=80&w=800&auto=format&fit=crop"} 
                    alt={cultures[2].title || 'Culture'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute bottom-6 left-6 z-20">
                    <span className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-1 block">
                      {cultures[2].category || 'ARCHITECTURE'}
                    </span>
                    <h4 className="text-xl font-medium text-white leading-tight">
                      {cultures[2].title || 'Moroccan Architecture'}
                    </h4>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-24 bg-gradient-to-br from-stone-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize: '200px'}}></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4 serif-font">Events & Festivities</h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Experience Morocco 2030 beyond the stadiums - fanzones, festivals, and celebrations across the Kingdom
            </p>
            <p className="text-sm text-[#006233] decorative-font mt-2">الفعاليات والاحتفالات</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="group bg-white rounded-2xl overflow-hidden border-2 border-stone-200 hover:border-[#C1272D] hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 cursor-pointer">
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                  <img
                    src={event.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop"}
                    alt={event.name || 'Event'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1 bg-[#C1272D] text-white rounded-full text-xs font-bold uppercase">Event</span>
                  </div>
                  <div className="absolute bottom-4 left-4 z-20">
                    <h3 className="text-2xl font-bold text-white serif-font">{event.name || 'Event'}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-stone-500 mb-3">
                    <span className="material-icons" style={{fontSize: '16px'}}>calendar_today</span>
                    <span>{new Date(event.dateOfEvent).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-500 mb-4">
                    <span className="material-icons" style={{fontSize: '16px'}}>location_on</span>
                    <span>{event.cityName || 'Location TBD'}</span>
                  </div>
                  <p className="text-stone-600 mb-4">{event.description || 'Join us for this exciting event'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#1a1412] via-[#2d1e1a] to-[#1a1412] text-stone-300 pt-20 pb-10 relative overflow-hidden border-t-4 border-[#C1272D]">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize: '200px'}}></div>
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#C1272D]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-[#006233]/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <a href="#" className="flex items-center gap-2 mb-6 text-white group">
                <img 
                  src="images/logo.png" 
                  alt="MoroccoFan2030 Logo" 
                  className="w-12 h-12 object-contain"
                />
                <span className="font-bold tracking-tight uppercase">MoroccoFan2030</span>
              </a>
              <p className="text-sm leading-relaxed mb-6 text-stone-400">
                Celebrating the spirit of football in the heart of the Maghreb. United by passion, defined by heritage.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-9 h-9 rounded-full border-2 border-stone-700 flex items-center justify-center hover:border-[#C1272D] hover:bg-[#C1272D]/10 hover:text-[#C1272D] transition-all">
                  <span className="material-icons text-sm">photo_camera</span>
                </a>
                <a href="#" className="w-9 h-9 rounded-full border-2 border-stone-700 flex items-center justify-center hover:border-[#006233] hover:bg-[#006233]/10 hover:text-[#006233] transition-all">
                  <span className="material-icons text-sm">chat</span>
                </a>
                <a href="#" className="w-9 h-9 rounded-full border-2 border-stone-700 flex items-center justify-center hover:border-amber-500 hover:bg-amber-500/10 hover:text-amber-500 transition-all">
                  <span className="material-icons text-sm">thumb_up</span>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#C1272D] rounded"></span>
                Tournament
              </h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-stone-400 hover:text-[#C1272D] hover:translate-x-1 inline-block transition-all">Match Schedule</a></li>
                <li><a href="#" className="text-stone-400 hover:text-[#006233] hover:translate-x-1 inline-block transition-all">Venues</a></li>
                <li><a href="#" className="text-stone-400 hover:text-[#C1272D] hover:translate-x-1 inline-block transition-all">Teams</a></li>
                <li><a href="#" className="text-stone-400 hover:text-[#006233] hover:translate-x-1 inline-block transition-all">Ticketing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#006233] rounded"></span>
                Explore Morocco
              </h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-stone-400 hover:text-[#006233] hover:translate-x-1 inline-block transition-all">Travel Guide</a></li>
                <li><a href="#" className="text-stone-400 hover:text-[#C1272D] hover:translate-x-1 inline-block transition-all">Culture & Heritage</a></li>
                <li><a href="#" className="text-stone-400 hover:text-[#006233] hover:translate-x-1 inline-block transition-all">Gastronomy</a></li>
                <li><a href="#" className="text-stone-400 hover:text-amber-500 hover:translate-x-1 inline-block transition-all">Accommodations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-amber-500 rounded"></span>
                Legal
              </h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-stone-400 hover:text-stone-200 hover:translate-x-1 inline-block transition-all">Privacy Policy</a></li>
                <li><a href="#" className="text-stone-400 hover:text-stone-200 hover:translate-x-1 inline-block transition-all">Terms of Service</a></li>
                <li><a href="#" className="text-stone-400 hover:text-stone-200 hover:translate-x-1 inline-block transition-all">Cookie Settings</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-700/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-400">
            <p className="flex items-center gap-2">
              <span>© 2024 MoroccoFan2030. Unofficial Fan Concept.</span>
              <span className="hidden md:inline">•</span>
              <span className="decorative-font text-[#006233]">المغرب 2030</span>
            </p>
            <div className="flex items-center gap-2">
              <span>Designed with</span>
              <span className="material-icons text-[#C1272D] animate-pulse" style={{fontSize: '14px'}}>favorite</span>
              <span>in</span>
              <span className="font-bold text-white">Morocco</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}