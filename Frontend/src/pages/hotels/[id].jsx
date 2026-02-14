import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function HotelDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`http://localhost:3309/api/hotels/${id}`)
      .then(res => res.json())
      .then(data => {
        setHotel(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <img src="/images/logo.png" alt="Loading" className="w-20 h-20 mb-4" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-stone-700">Hotel not found</h2>
        <button
          onClick={() => router.push('/hotels')}
          className="mt-4 px-6 py-2 bg-[#C1272D] text-white rounded-lg hover:bg-[#a01e23] transition-all"
        >
          Back to Hotels
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{hotel.name} - Hotel | MoroccoFan2030</title>
        <meta name="description" content={hotel.description || `Stay at ${hotel.name} in Morocco`} />
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

      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0 image-overlay">
          <img
            src={hotel.imageUrl || '/images/hotel-placeholder.jpg'}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-10 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-6 pb-12">
            {/* Back Button */}
            <button
              onClick={() => router.push('/hotels')}
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
            >
              <span className="material-icons text-sm">arrow_back</span>
              <span className="text-sm font-medium">Back to Hotels</span>
            </button>

            {/* Hotel Info */}
            <div className="flex items-end justify-between">
              <div>
                <div className="mb-3">
                  <span className="px-4 py-1.5 bg-[#C1272D]/90 backdrop-blur-md border border-red-400/30 rounded-full text-white text-sm font-bold flex items-center gap-2 w-fit">
                    <span className="material-icons text-sm">hotel</span>
                    Hotel
                    {hotel.cityName && <span>· {hotel.cityName}</span>}
                  </span>
                </div>
                <h1 className="text-6xl md:text-7xl font-bold text-white mb-3 serif-font">
                  {hotel.name}
                </h1>
                {hotel.address && (
                  <div className="flex items-center gap-3 text-white/90 text-lg">
                    <span className="material-icons">location_on</span>
                    <span className="font-medium">{hotel.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gradient-to-br from-stone-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Description + Info */}
            <div className="lg:col-span-2 space-y-6">

              {/* Description */}
              {hotel.description && (
                <div className="bg-white rounded-2xl border border-stone-200 p-8">
                  <h2 className="text-3xl font-bold text-stone-900 mb-4 serif-font flex items-center gap-3">
                    <span className="material-icons text-[#C1272D]">hotel</span>
                    About this Hotel
                  </h2>
                  <p className="text-stone-600 leading-relaxed text-base">
                    {hotel.description}
                  </p>
                </div>
              )}

              {/* Practical Information */}
              <div className="bg-white rounded-2xl border border-stone-200 p-8">
                <h2 className="text-3xl font-bold text-stone-900 mb-6 serif-font flex items-center gap-3">
                  <span className="material-icons text-[#C1272D]">event_available</span>
                  Contact & Location
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Address */}
                  {hotel.address && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="material-icons text-blue-600">place</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 mb-1">Address</h3>
                        <p className="text-stone-600">{hotel.address}</p>
                      </div>
                    </div>
                  )}

                  {/* City */}
                  {hotel.cityName && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="material-icons text-[#C1272D]">location_city</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 mb-1">City</h3>
                        <p className="text-stone-600">{hotel.cityName}</p>
                        <button
                          onClick={() => router.push(`/cities/${hotel.cityHostId}`)}
                          className="text-xs text-[#C1272D] hover:underline mt-1 flex items-center gap-1"
                        >
                          <span className="material-icons" style={{ fontSize: '12px' }}>open_in_new</span>
                          Explore city
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {hotel.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="material-icons text-emerald-600">phone</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 mb-1">Phone</h3>
                        <a href={`tel:${hotel.phone}`} className="text-stone-600 hover:text-[#C1272D] transition-colors">
                          {hotel.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {hotel.email && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="material-icons text-amber-600">email</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 mb-1">Email</h3>
                        <a href={`mailto:${hotel.email}`} className="text-stone-600 hover:text-[#C1272D] transition-colors break-all">
                          {hotel.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions Card */}
              <div className="bg-gradient-to-br from-[#C1272D] to-[#a01e23] rounded-2xl p-8 text-white sticky top-24">
                <h3 className="text-2xl font-bold mb-6 serif-font">Book Your Stay</h3>

                <div className="space-y-4">
                  {/* Book Now */}
                  {hotel.urlReservation ? (
                    <a
                      href={hotel.urlReservation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-6 py-3 bg-white text-[#C1272D] rounded-xl font-bold hover:bg-stone-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <span className="material-icons">open_in_new</span>
                      Book Now
                    </a>
                  ) : (
                    <div className="w-full px-6 py-3 bg-white/20 border border-white/30 text-white/70 rounded-xl font-medium flex items-center justify-center gap-2 text-sm">
                      <span className="material-icons text-sm">info</span>
                      No booking link available
                    </div>
                  )}

                  {/* Call */}
                  {hotel.phone && (
                    <a
                      href={`tel:${hotel.phone}`}
                      className="w-full px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-xl font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-icons">phone</span>
                      Call Hotel
                    </a>
                  )}

                  {/* Email */}
                  {hotel.email && (
                    <a
                      href={`mailto:${hotel.email}`}
                      className="w-full px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-xl font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-icons">email</span>
                      Send Email
                    </a>
                  )}
                </div>

                {/* Quick Info Summary */}
                <div className="mt-8 pt-8 border-t border-white/20 space-y-3">
                  {hotel.cityName && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">City</span>
                      <span className="font-bold text-sm">{hotel.cityName}</span>
                    </div>
                  )}
                  {hotel.address && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-white/80 text-sm flex-shrink-0">Address</span>
                      <span className="font-medium text-xs text-right line-clamp-2">{hotel.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tips Card */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-icons text-amber-600 text-3xl">lightbulb</span>
                  <h3 className="text-xl font-bold text-stone-900">Booking Tips</h3>
                </div>
                <ul className="space-y-3 text-sm text-stone-700">
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-amber-500 text-sm mt-0.5">check_circle</span>
                    <span>Book early — World Cup period fills up fast!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-amber-500 text-sm mt-0.5">check_circle</span>
                    <span>Check refund and cancellation policies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-amber-500 text-sm mt-0.5">check_circle</span>
                    <span>Ask about proximity to stadiums and attractions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-amber-500 text-sm mt-0.5">check_circle</span>
                    <span>Confirm breakfast and transport options</span>
                  </li>
                </ul>
              </div>

              {/* Back to city */}
              {hotel.cityHostId && (
                <button
                  onClick={() => router.push(`/cities/${hotel.cityHostId}`)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium transition-all text-sm"
                >
                  <span className="material-icons text-sm">location_city</span>
                  Explore {hotel.cityName || 'the city'}
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
