import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CityDetail() {
  const router = useRouter();
  const { id } = router.query;

  // États pour les données
  const [city, setCity] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  
  // États pour l'interface
  const [activeTab, setActiveTab] = useState('overview'); // overview, hotels, attractions, stadiums
  const [loading, setLoading] = useState(true);

  // Récupérer les informations de la ville
  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    fetch(`http://localhost:3309/api/cities/${id}`)
      .then(res => res.json())
      .then(data => {
        setCity(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur:', err);
        setLoading(false);
      });
  }, [id]);

  // Récupérer les hôtels
  useEffect(() => {
    if (!id) return;
    
    fetch(`http://localhost:3309/api/cities/${id}/hotels`)
      .then(res => res.json())
      .then(data => setHotels(data || []))
      .catch(err => console.error('Erreur hotels:', err));
  }, [id]);

  // Récupérer les attractions
  useEffect(() => {
    if (!id) return;
    
    fetch(`http://localhost:3309/api/cities/${id}/attractions`)
      .then(res => res.json())
      .then(data => setAttractions(data || []))
      .catch(err => console.error('Erreur attractions:', err));
  }, [id]);

  // Récupérer les stades
  useEffect(() => {
    if (!id) return;
    
    fetch(`http://localhost:3309/api/cities/${id}/stades`)
      .then(res => res.json())
      .then(data => setStadiums(data || []))
      .catch(err => console.error('Erreur stadiums:', err));
  }, [id]);

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

  if (!city) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-stone-700">City not found</h2>
        <button 
          onClick={() => router.push('/cities')}
          className="mt-4 px-6 py-2 bg-[#C1272D] text-white rounded-lg"
        >
          Back to Cities
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{city.name} - Host City | MoroccoFan2030</title>
        <meta name="description" content={city.description || `Discover ${city.name}, host city of the 2030 World Cup`} />
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

        .image-overlay {
          position: relative;
          overflow: hidden;
        }
        .image-overlay::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%);
        }

        .tab-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, #C1272D, #006233);
          transition: all 0.3s ease;
        }
      `}</style>

      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0 image-overlay">
          <img
            src={city.imageUrl || '/images/city-placeholder.jpg'}
            alt={city.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute inset-0 z-10 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-6 pb-12">
            {/* Back Button */}
            <button
              onClick={() => router.push('/cities')}
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
            >
              <span className="material-icons text-sm">arrow_back</span>
              <span className="text-sm font-medium">Back to Cities</span>
            </button>

            {/* City Info */}
            <div className="flex items-end justify-between">
              <div>
                {city.region && (
                  <div className="mb-3">
                    <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-sm font-bold">
                      {city.region} Region
                    </span>
                  </div>
                )}
                <h1 className="text-6xl md:text-7xl font-bold text-white mb-3 serif-font">
                  {city.name}
                </h1>
                <div className="flex items-center gap-3 text-white/90 text-lg">
                  <span className="material-icons">location_on</span>
                  <span className="font-medium">{city.country}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="hidden md:flex gap-6">
                <div className="text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-4">
                  <div className="text-3xl font-bold text-white mb-1">{hotels.length}</div>
                  <div className="text-xs text-white/80 uppercase tracking-wider">Hotels</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-4">
                  <div className="text-3xl font-bold text-white mb-1">{attractions.length}</div>
                  <div className="text-xs text-white/80 uppercase tracking-wider">Attractions</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-4">
                  <div className="text-3xl font-bold text-white mb-1">{stadiums.length}</div>
                  <div className="text-xs text-white/80 uppercase tracking-wider">Stadiums</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="sticky top-20 bg-white border-b border-stone-200 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-4 font-medium transition-all ${
                activeTab === 'overview'
                  ? 'text-[#C1272D]'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-icons text-sm">info</span>
                Overview
              </span>
            </button>

            <button
              onClick={() => setActiveTab('hotels')}
              className={`px-4 py-4 font-medium transition-all ${
                activeTab === 'hotels'
                  ? 'text-[#C1272D]'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-icons text-sm">hotel</span>
                Hotels
                <span className="px-2 py-0.5 bg-stone-100 rounded-full text-xs">
                  {hotels.length}
                </span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('attractions')}
              className={`px-4 py-4 font-medium transition-all ${
                activeTab === 'attractions'
                  ? 'text-[#C1272D]'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-icons text-sm">place</span>
                Attractions
                <span className="px-2 py-0.5 bg-stone-100 rounded-full text-xs">
                  {attractions.length}
                </span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('stadiums')}
              className={`px-4 py-4 font-medium transition-all ${
                activeTab === 'stadiums'
                  ? 'text-[#C1272D]'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-icons text-sm">stadium</span>
                Stadiums
                <span className="px-2 py-0.5 bg-stone-100 rounded-full text-xs">
                  {stadiums.length}
                </span>
              </span>
            </button>

            {/* Indicator */}
            <div
              className="tab-indicator"
              style={{
                width: activeTab === 'overview' ? '110px' : activeTab === 'hotels' ? '100px' : activeTab === 'attractions' ? '130px' : '120px',
                transform: `translateX(${
                  activeTab === 'overview' ? '0px' : 
                  activeTab === 'hotels' ? '142px' : 
                  activeTab === 'attractions' ? '274px' : '438px'
                })`
              }}
            />
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 bg-gradient-to-br from-stone-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Description */}
              <div className="bg-white rounded-2xl border border-stone-200 p-8">
                <h2 className="text-3xl font-bold text-stone-900 mb-4 serif-font">
                  About {city.name}
                </h2>
                <p className="text-lg text-stone-600 leading-relaxed">
                  {city.description || `${city.name} is one of the magnificent host cities for the 2030 FIFA World Cup. Discover its rich culture, modern infrastructure, and warm hospitality.`}
                </p>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border-2 border-amber-200 p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                      <span className="material-icons text-white">hotel</span>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-stone-900">{hotels.length}</div>
                      <div className="text-sm text-stone-500">Hotels Available</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('hotels')}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                  >
                    View all hotels
                    <span className="material-icons text-sm">arrow_forward</span>
                  </button>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-200 p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                      <span className="material-icons text-white">place</span>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-stone-900">{attractions.length}</div>
                      <div className="text-sm text-stone-500">Tourist Sites</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('attractions')}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                  >
                    Explore attractions
                    <span className="material-icons text-sm">arrow_forward</span>
                  </button>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl border-2 border-red-200 p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#C1272D] rounded-xl flex items-center justify-center">
                      <span className="material-icons text-white">stadium</span>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-stone-900">{stadiums.length}</div>
                      <div className="text-sm text-stone-500">World-Class Stadiums</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('stadiums')}
                    className="text-sm text-[#C1272D] hover:text-[#a01e23] font-medium flex items-center gap-1"
                  >
                    View stadiums
                    <span className="material-icons text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hotels Tab */}
          {activeTab === 'hotels' && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-stone-900 mb-2 serif-font">
                  Hotels in {city.name}
                </h2>
                <p className="text-stone-600">
                  Find the perfect accommodation for your stay
                </p>
              </div>

              {hotels.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
                  <span className="material-icons text-stone-300 text-6xl mb-4">hotel</span>
                  <h3 className="text-xl font-medium text-stone-700 mb-2">No hotels available yet</h3>
                  <p className="text-stone-500">Hotels will be added soon</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      className="bg-white rounded-2xl border border-stone-200 hover:border-amber-500 hover:shadow-xl transition-all overflow-hidden group cursor-pointer"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={hotel.imageUrl || '/images/hotel-placeholder.jpg'}
                          alt={hotel.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-stone-900 mb-2">
                          {hotel.name}
                        </h3>
                        
                        {hotel.address && (
                          <div className="flex items-start gap-2 text-sm text-stone-500 mb-3">
                            <span className="material-icons text-xs mt-0.5">location_on</span>
                            <span>{hotel.address}</span>
                          </div>
                        )}

                        {hotel.description && (
                          <p className="text-sm text-stone-600 mb-4 line-clamp-2">
                            {hotel.description}
                          </p>
                        )}

                        <div className="pt-4 border-t border-stone-100 space-y-2">
                          {hotel.phone && (
                            <div className="flex items-center gap-2 text-sm text-stone-600">
                              <span className="material-icons text-xs">phone</span>
                              <span>{hotel.phone}</span>
                            </div>
                          )}
                          {hotel.email && (
                            <div className="flex items-center gap-2 text-sm text-stone-600">
                              <span className="material-icons text-xs">email</span>
                              <span>{hotel.email}</span>
                            </div>
                          )}
                          {hotel.urlReservation && (
                            <a 
                              href={hotel.urlReservation}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-[#C1272D] hover:text-[#a01e23] font-medium"
                            >
                              <span className="material-icons text-xs">link</span>
                              Book Now
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Attractions Tab */}
          {activeTab === 'attractions' && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-stone-900 mb-2 serif-font">
                  Things to Do in {city.name}
                </h2>
                <p className="text-stone-600">
                  Discover the best attractions and experiences
                </p>
              </div>

              {attractions.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
                  <span className="material-icons text-stone-300 text-6xl mb-4">place</span>
                  <h3 className="text-xl font-medium text-stone-700 mb-2">No attractions available yet</h3>
                  <p className="text-stone-500">Attractions will be added soon</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {attractions.map((attraction) => (
                    <div
                      key={attraction.id}
                      className="bg-white rounded-2xl border border-stone-200 hover:border-emerald-500 hover:shadow-xl transition-all overflow-hidden group cursor-pointer"
                    >
                      <div className="md:flex">
                        <div className="relative md:w-1/3 h-48 md:h-auto overflow-hidden">
                          <img
                            src={attraction.imageUrl || '/images/attraction-placeholder.jpg'}
                            alt={attraction.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        <div className="md:w-2/3 p-6">
                          <h3 className="text-xl font-bold text-stone-900 mb-2">
                            {attraction.name}
                          </h3>

                          {attraction.type && (
                            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-3">
                              {attraction.type}
                            </span>
                          )}

                          {attraction.description && (
                            <p className="text-sm text-stone-600 mb-4 line-clamp-3">
                              {attraction.description}
                            </p>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {attraction.address && (
                              <div className="flex items-center gap-2 text-stone-500">
                                <span className="material-icons text-xs">location_on</span>
                                <span>{attraction.address}</span>
                              </div>
                            )}
                            
                            {attraction.priceProxim > 0 && (
                              <div className="flex items-center gap-2 text-stone-500">
                                <span className="material-icons text-xs">attach_money</span>
                                <span>~${attraction.priceProxim.toFixed(2)}</span>
                              </div>
                            )}

                            {attraction.houreOfOpening && attraction.houreOfClosing && (
                              <div className="flex items-center gap-2 text-stone-500">
                                <span className="material-icons text-xs">schedule</span>
                                <span>{attraction.houreOfOpening} - {attraction.houreOfClosing}</span>
                              </div>
                            )}

                            {attraction.latitude && attraction.longitude && (
                              <div className="flex items-center gap-2 text-emerald-600 font-medium cursor-pointer hover:text-emerald-700">
                                <span className="material-icons text-xs">map</span>
                                <span>View on Map</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stadiums Tab */}
          {activeTab === 'stadiums' && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-stone-900 mb-2 serif-font">
                  Stadiums in {city.name}
                </h2>
                <p className="text-stone-600">
                  World-class venues hosting the 2030 World Cup
                </p>
              </div>

              {stadiums.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
                  <span className="material-icons text-stone-300 text-6xl mb-4">stadium</span>
                  <h3 className="text-xl font-medium text-stone-700 mb-2">No stadiums available yet</h3>
                  <p className="text-stone-500">Stadiums will be added soon</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {stadiums.map((stadium) => (
                    <div
                      key={stadium.id}
                      className="bg-white rounded-2xl border-2 border-stone-200 hover:border-[#C1272D] hover:shadow-2xl transition-all overflow-hidden group cursor-pointer"
                    >
                      <div className="md:flex">
                        <div className="relative md:w-2/5 h-64 overflow-hidden">
                          <img
                            src={stadium.imageUrl || '/images/stadium-placeholder.jpg'}
                            alt={stadium.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        <div className="md:w-3/5 p-8">
                          <h3 className="text-2xl font-bold text-stone-900 mb-3 serif-font">
                            {stadium.name}
                          </h3>

                          {stadium.description && (
                            <p className="text-stone-600 mb-4">
                              {stadium.description}
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {stadium.capacity && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                  <span className="material-icons text-[#C1272D] text-sm">people</span>
                                </div>
                                <div>
                                  <div className="text-sm text-stone-500">Capacity</div>
                                  <div className="text-lg font-bold text-stone-900">
                                    {stadium.capacity.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            )}

                            {stadium.dateOfConstruction && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                  <span className="material-icons text-emerald-600 text-sm">event</span>
                                </div>
                                <div>
                                  <div className="text-sm text-stone-500">Built</div>
                                  <div className="text-lg font-bold text-stone-900">
                                    {new Date(stadium.dateOfConstruction).getFullYear()}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {stadium.adresse && (
                            <div className="pt-4 border-t border-stone-100">
                              <div className="flex items-center gap-2 text-sm text-stone-500 mb-2">
                                <span className="material-icons text-xs">location_on</span>
                                <span>{stadium.adresse}</span>
                              </div>
                            </div>
                          )}

                          {stadium.videoUrl && (
                            <div className="pt-3">
                              <a 
                                href={stadium.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-[#C1272D] hover:text-[#a01e23] font-medium"
                              >
                                <span className="material-icons text-sm">play_circle</span>
                                Watch Video Tour
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      <Footer />
    </>
  );
}
