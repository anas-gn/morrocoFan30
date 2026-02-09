import { useState, useEffect } from 'react';
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
    fetch('http://localhost:3309/api/acceuil/culture/forYou')
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

  // Récupérer les matchs à venir
  useEffect(() => {
    fetch('http://localhost:3309/api/acceuil/matches/upcoming')
      .then((res) => res.json())
      .then((data) => setUpcomingMatches(data))
      .catch((err) => console.error('Erreur:', err));
  }, []);

  // Affichage du chargement ou des erreurs
  if (loading) return <p className="text-center py-10">Chargement des données...</p>;
  if (error) return <p className="text-center py-10 text-red-500">Erreur: {error}</p>;

  return (
    <>
      <Head>
        <title>MoroccoFan2030 | The Kingdom Roars</title>
        <meta name="description" content="MoroccoFan2030 - Football World Cup 2030 in Morocco" />
      </Head>

      {/* Hero Section */}
      <header className="relative w-full pt-32 pb-20 md:pt-48 md:pb-24 overflow-hidden border-b border-stone-200">
        <div className="absolute inset-0 w-full h-full z-0">
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="https://cdn.pixabay.com/video/2023/04/26/159454-821961916_large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#C1272D]/20 via-transparent to-[#006233]/20 animate-pulse" style={{ animationDuration: '4s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-white mb-6 leading-[0.95] drop-shadow-2xl animate-fade-in-up">
              Football returns to the <br />
              <span className="decorative-font italic text-[#C1272D] font-bold drop-shadow-2xl animate-glow" style={{ textShadow: '0 0 30px rgba(193, 39, 45, 0.5)' }}>
                Kingdom of Light.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Six cities, one heartbeat. Join us for a historic World Cup across two continents, uniting civilizations through the beautiful game.
            </p>
          </div>
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
              <div key={team.id} className="flex items-center gap-3 shrink-0 opacity-50 hover:opacity-100 transition-opacity cursor-default grayscale hover:grayscale-0 group">
                <span className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-700 group-hover:shadow-md group-hover:shadow-red-500/20 transition-all">
                  {team.name.substring(0, 2)}
                </span>
                <span className="text-sm font-semibold tracking-wide text-stone-900">{team.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Matches Section */}
      <section id="matches" className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-medium text-stone-900 tracking-tight">Upcoming Fixtures</h2>
              <p className="text-stone-500 mt-2">Key qualification and friendly matches.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {upcomingMatches.slice(0, 3).map((match) => (
              <div key={match.id} className="col-span-1 bg-gradient-to-br from-[#C1272D] to-[#a01e23] text-white rounded-2xl p-6 relative overflow-hidden group shadow-2xl shadow-red-500/20">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-medium uppercase tracking-wider">Next Match</span>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <div className="text-center">
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-xl font-bold text-[#C1272D] mb-2 shadow-lg mx-auto">
                        {match.matchTeams && match.matchTeams[0] ? match.matchTeams[0].teamName.substring(0, 2) : 'MA'}
                      </div>
                      <span className="text-sm font-medium">{match.matchTeams && match.matchTeams[0] ? match.matchTeams[0].teamName : 'Morocco'}</span>
                    </div>
                    <div className="text-center px-4">
                      <span className="text-3xl font-light text-white/70">vs</span>
                      <div className="text-xs text-white/70 mt-1 uppercase tracking-wider">
                        {new Date(match.dateOfMatch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-14 h-14 bg-white/10 backdrop-blur border border-white/20 rounded-full flex items-center justify-center text-xl font-bold text-white mb-2 mx-auto">
                        {match.matchTeams && match.matchTeams[1] ? match.matchTeams[1].teamName.substring(0, 2) : 'ES'}
                      </div>
                      <span className="text-sm font-medium">{match.matchTeams && match.matchTeams[1] ? match.matchTeams[1].teamName : 'Spain'}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/20">
                    <div className="flex items-center gap-2 text-xs text-white/90">
                      <span className="material-icons text-white/60">location_on</span>
                      <span>{match.stadeName || 'Grand Stade de Casablanca'}</span>
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
            {groups.map((group) => (
              <div key={group.id} className="bg-gradient-to-br from-red-50 to-white rounded-2xl border-2 border-red-100 p-6 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-[#C1272D] text-lg">Group {group.name}</h3>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-stone-400 text-xs border-b border-red-100">
                      <th className="font-medium text-left pb-2 w-8">#</th>
                      <th className="font-medium text-left pb-2">Team</th>
                      <th className="font-medium text-right pb-2">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="text-stone-600">
                    {group.groupTeams && group.groupTeams.map((team, index) => (
                      <tr key={team.id} className="border-b border-stone-50">
                        <td className="py-3">{index + 1}</td>
                        <td className="py-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#C1272D]"></span>
                          {team.teamName}
                        </td>
                        <td className="py-3 text-right">{team.wins * 3 + team.draws}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Host Cities Section */}
      <section className="bg-gradient-to-br from-green-900 via-[#004d28] to-green-950 border-green-950 border-b pt-16 pb-16 relative overflow-hidden" id="cities">
        <div className="flex max-w-7xl mr-auto mb-8 ml-auto pr-6 pl-6 items-end justify-between relative z-10">
          <div>
            <h2 className="text-2xl font-medium text-white tracking-tight">Host Cities</h2>
            <p className="text-green-200 mt-1 text-sm">Explore the six venues across the Kingdom.</p>
          </div>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 px-6 max-w-[100vw] no-scrollbar relative z-10">
          {cities.map((city) => (
            <div key={city.id} className="min-w-[280px] md:min-w-[340px] snap-center group cursor-pointer">
              <div className="relative h-[400px] rounded-2xl overflow-hidden mb-4 ring-2 ring-white/20 group-hover:ring-white/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                <img
                  src="https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=1000&auto=format&fit=crop"
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-6 left-6 z-20 text-white">
                  <span className="text-xs font-bold uppercase tracking-wider mb-1 block text-amber-300">Final Venue</span>
                  <h3 className="text-3xl font-serif">{city.name}</h3>
                  <p className="text-sm opacity-80 mt-1 flex items-center gap-1">
                    <span className="material-icons text-white/60">location_on</span>
                    {city.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest News Section */}
      <section className="border-y bg-white border-stone-100 pt-20 pb-20" id="news">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl font-medium text-stone-900 tracking-tight">Latest News</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestNews.slice(0, 3).map((news) => (
              <article key={news.id} className="group cursor-pointer">
                <div className="relative h-[200px] rounded-2xl overflow-hidden mb-4 ring-2 ring-transparent group-hover:ring-[#C1272D]/20 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                  <img
                    src={news.imageUrl || "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2070&auto=format&fit=crop"}
                    alt={news.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3 text-xs text-stone-400 mb-2">
                    <span>{new Date(news.dateOfCreation).toLocaleDateString()}</span>
                    <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                    <span>4 min read</span>
                  </div>
                  <h3 className="text-xl font-medium text-stone-900 mb-2 group-hover:text-[#C1272D] transition-colors serif-font">
                    {news.title}
                  </h3>
                  <p className="text-stone-500 line-clamp-2">{news.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Pulse Section */}
      <section id="culture" className="py-24 bg-gradient-to-br from-[#C1272D] via-[#a01e23] to-[#8b1820] text-stone-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-serif text-white tracking-tight mb-2">The Cultural Pulse</h2>
              <p className="text-red-100">Experience the sights, sounds, and tastes of the Maghreb.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cultures.slice(0, 3).map((culture) => (
              <div key={culture.id} className="relative h-[300px] rounded-3xl overflow-hidden group cursor-pointer ring-2 ring-white/20 hover:ring-white/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                <img
                  src={culture.imageUrl || "https://images.unsplash.com/photo-1535069502363-2207185df19f?q=80&w=2070&auto=format&fit=crop"}
                  alt={culture.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-8 left-8 z-20 max-w-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold uppercase rounded-full shadow-lg">
                      {culture.title.split(' ')[0]}
                    </span>
                  </div>
                  <h3 className="text-2xl font-serif text-white mb-3">{culture.title}</h3>
                  <p className="text-stone-200 line-clamp-2">{culture.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-24 bg-gradient-to-br from-stone-50 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4 serif-font">Events & Festivities</h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Experience Morocco 2030 beyond the stadiums - fanzones, festivals, and celebrations across the Kingdom
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="group bg-white rounded-2xl overflow-hidden border-2 border-stone-200 hover:border-[#C1272D] hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 cursor-pointer">
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                  <img
                    src={event.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop"}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1 bg-[#C1272D] text-white rounded-full text-xs font-bold uppercase">Event</span>
                  </div>
                  <div className="absolute bottom-4 left-4 z-20">
                    <h3 className="text-2xl font-bold text-white serif-font">{event.name}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-stone-500 mb-3">
                    <span className="material-icons text-stone-400" style={{ fontSize: '16px' }}>calendar_today</span>
                    <span>{new Date(event.dateOfEvent).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-500 mb-4">
                    <span className="material-icons text-stone-400" style={{ fontSize: '16px' }}>location_on</span>
                    <span>{event.cityName}</span>
                  </div>
                  <p className="text-stone-600 mb-4">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
