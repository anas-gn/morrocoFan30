import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function HotelDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [hotel, setHotel]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`http://localhost:3309/api/hotels/${id}`)
      .then(res => res.json())
      .then(data => { setHotel(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ width:40, height:40, border:'3px solid #C1272D', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!hotel) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#fafaf9' }}>
      <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:'#1c1917', marginBottom:16 }}>Hotel not found</div>
      <button onClick={() => router.push('/cities')} style={{ padding:'10px 24px', background:'#C1272D', color:'#fff', border:'none', borderRadius:12, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, cursor:'pointer' }}>Back to City</button>
    </div>
  );

  return (
    <>
      <Head>
        <title>{hotel.name} | MoroccoFan2030</title>
        <meta name="description" content={hotel.description || `Stay at ${hotel.name} in Morocco`} />
        <link rel="icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
         <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing:border-box;  }
        body { font-family:'Inter',sans-serif; background:#fff; color:#1c1917; -webkit-font-smoothing:antialiased; }
        @keyframes spin   { to { transform:rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation:fadeUp .55s cubic-bezier(.16,1,.3,1) both; }
        .d1{animation-delay:.08s} .d2{animation-delay:.16s} .d3{animation-delay:.24s} .d4{animation-delay:.32s}
      `}</style>

      <Navbar />

      {/* HERO */}
      <header style={{ position:'relative', height:'100vh', overflow:'hidden', background:'#1c1917' }}>
        <div style={{ position:'absolute', inset:0 }}>
          <img src={hotel.imageUrl || '/images/hotel-placeholder.jpg'} alt={hotel.name}
            style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.4 }}
            onError={e=>e.target.style.opacity=0} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(28,25,23,.98) 0%,rgba(28,25,23,.5) 55%,rgba(28,25,23,.1) 100%)' }} />
          <div style={{ position:'absolute', inset:0, opacity:.04, backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'160px', pointerEvents:'none' }} />
        </div>

        {/* Top accent bar */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(to right,#C1272D,#006233)', zIndex:5 }} />

        <div style={{ position:'absolute', inset:0, zIndex:10, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
          <div style={{ maxWidth:1100, margin:'0 auto', width:'100%', padding:'0 24px 48px' }}>
            {/* Back */}
            <button onClick={() => router.push('/cities')} className="fu"
              style={{ display:'inline-flex', alignItems:'center', gap:8, color:'rgba(255,255,255,.55)', background:'none', border:'none', cursor:'pointer', marginBottom:158, fontFamily:'Inter,sans-serif', fontSize:14, fontWeight:500, transition:'color .2s' }}
              onMouseEnter={e=>e.currentTarget.style.color='#fff'}
              onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.55)'}>
              <div style={{ width:36, height:36, borderRadius:'50%', border:'1px solid rgba(255,255,255,.18)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span className="material-icons" style={{ fontSize:18 }}>arrow_back</span>
              </div>
              Back to City
            </button>

            {/* Badge */}
            <div className="fu d1" style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:10, marginBottom:86 }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 14px', borderRadius:999, background:'rgba(193,39,45,.85)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'#fff', fontFamily:'Syne,sans-serif' }}>
                <span className="material-icons" style={{ fontSize:13 }}>hotel</span>
                Hotel {hotel.cityName && `· ${hotel.cityName}`}
              </span>
            </div>

            {/* Title */}
            <h1 className="fu d2" style={{ fontFamily:'Amiri,serif', fontSize:'clamp(52px,9vw,96px)', fontWeight:700, color:'#fff', lineHeight:.95, marginBottom:34 }}>
              {hotel.name}
            </h1>

            {hotel.address && (
              <div className="fu d3" style={{ display:'flex', alignItems:'center', gap:8, color:'rgba(255,255,255,.5)', fontSize:16 }}>
                <span className="material-icons" style={{ fontSize:18 }}>location_on</span>
                {hotel.address}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main style={{ maxWidth:1100, margin:'0 auto', padding:'44px 24px 96px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:32, alignItems:'start' }}>

          {/* Left */}
          <div style={{ display:'flex', flexDirection:'column', gap:28 }}>

            {/* About */}
            {hotel.description && (
              <section className="fu">
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                  <div style={{ width:3, height:22, background:'linear-gradient(to bottom,#C1272D,#006233)', borderRadius:2 }} />
                  <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'#1c1917' }}>About this Hotel</h2>
                </div>
                <p style={{ color:'#78716c', lineHeight:1.88, fontSize:16 }}>{hotel.description}</p>
              </section>
            )}

            {/* Contact & Location */}
            <section className="fu d1">
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                <div style={{ width:3, height:22, background:'linear-gradient(to bottom,#C1272D,#006233)', borderRadius:2 }} />
                <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'#1c1917' }}>Contact & Location</h2>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 }}>
                {[
                  hotel.address  && { icon:'place',         color:'#3b82f6', bg:'rgba(59,130,246,.1)',  label:'Address', val:hotel.address,   href:null },
                  hotel.cityName && { icon:'location_city', color:'#C1272D', bg:'rgba(193,39,45,.1)',  label:'City',    val:hotel.cityName, href:hotel.cityHostId?`/cities/${hotel.cityHostId}`:null, hrefLabel:'Explore city' },
                  hotel.phone    && { icon:'phone',         color:'#16a34a', bg:'rgba(22,163,74,.1)',   label:'Phone',   val:hotel.phone,    href:`tel:${hotel.phone}` },
                  hotel.email    && { icon:'email',         color:'#f0a500', bg:'rgba(240,165,0,.1)',   label:'Email',   val:hotel.email,    href:`mailto:${hotel.email}` },
                ].filter(Boolean).map((row,i) => (
                  <div key={i} style={{ background:'#fafaf9', border:'1px solid #e7e5e4', borderRadius:18, padding:'20px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                      <div style={{ width:38, height:38, borderRadius:12, background:row.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span className="material-icons" style={{ fontSize:20, color:row.color }}>{row.icon}</span>
                      </div>
                      <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'#a8a29e', fontFamily:'Syne,sans-serif' }}>{row.label}</span>
                    </div>
                    {row.href ? (
                      <a href={row.href} style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#1c1917', textDecoration:'none', display:'block', lineHeight:1.4, wordBreak:'break-all' }}
                        onMouseEnter={e=>e.currentTarget.style.color='#C1272D'}
                        onMouseLeave={e=>e.currentTarget.style.color='#1c1917'}>
                        {row.val}
                      </a>
                    ) : (
                      <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#1c1917', lineHeight:1.4 }}>{row.val}</div>
                    )}
                    {row.hrefLabel && row.href && (
                      <a href={row.href} style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, color:'#C1272D', textDecoration:'none', marginTop:6, fontFamily:'Syne,sans-serif', fontWeight:700 }}>
                        <span className="material-icons" style={{ fontSize:12 }}>open_in_new</span>
                        {row.hrefLabel}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Booking Tips */}
            <section className="fu d2" style={{ background:'linear-gradient(135deg,rgba(240,165,0,.06),rgba(240,165,0,.02))', border:'1px solid rgba(240,165,0,.2)', borderRadius:20, padding:'24px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <span className="material-icons" style={{ fontSize:22, color:'#f0a500' }}>lightbulb</span>
                <span style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:800, color:'#1c1917' }}>Booking Tips</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  'Book early — World Cup period fills up fast!',
                  'Check refund and cancellation policies',
                  'Ask about proximity to stadiums and attractions',
                  'Confirm breakfast and transport options',
                ].map((tip,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:13, color:'#78716c' }}>
                    <span className="material-icons" style={{ fontSize:15, color:'#f0a500', marginTop:1, flexShrink:0 }}>check_circle</span>
                    {tip}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right sidebar */}
          <div style={{ position:'sticky', top:80, display:'flex', flexDirection:'column', gap:14 }}>

            {/* Book Your Stay card */}
            <div className="fu d2" style={{ background:'linear-gradient(135deg,#2d0a0e,#1a0608)', borderRadius:22, overflow:'hidden', border:'1px solid rgba(193,39,45,.2)', position:'relative' }}>
              <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%', background:'rgba(193,39,45,.15)', filter:'blur(40px)', pointerEvents:'none' }} />
              <div style={{ position:'relative', zIndex:1, padding:'24px' }}>
                <div style={{ fontFamily:'Amiri,serif', fontSize:26, fontWeight:700, color:'#fff', marginBottom:20 }}>Book Your Stay</div>

                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {hotel.urlReservation ? (
                    <a href={hotel.urlReservation} target="_blank" rel="noopener noreferrer"
                      style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, height:46, background:'#fff', color:'#C1272D', borderRadius:12, fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:14, textDecoration:'none', transition:'all .2s', boxShadow:'0 4px 16px rgba(0,0,0,.12)' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#fafaf9'}
                      onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                      <span className="material-icons" style={{ fontSize:18 }}>open_in_new</span>
                      Book Now
                    </a>
                  ) : (
                    <div style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, height:46, background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.4)', borderRadius:12, fontFamily:'Syne,sans-serif', fontSize:13, border:'1px solid rgba(255,255,255,.1)' }}>
                      <span className="material-icons" style={{ fontSize:16 }}>info</span>
                      No booking link available
                    </div>
                  )}

                  {hotel.phone && (
                    <a href={`tel:${hotel.phone}`}
                      style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, height:44, background:'rgba(255,255,255,.07)', color:'rgba(255,255,255,.85)', borderRadius:12, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, textDecoration:'none', border:'1px solid rgba(255,255,255,.12)', transition:'background .2s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.14)'}
                      onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.07)'}>
                      <span className="material-icons" style={{ fontSize:17 }}>phone</span>
                      Call Hotel
                    </a>
                  )}

                  {hotel.email && (
                    <a href={`mailto:${hotel.email}`}
                      style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, height:44, background:'rgba(255,255,255,.07)', color:'rgba(255,255,255,.85)', borderRadius:12, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, textDecoration:'none', border:'1px solid rgba(255,255,255,.12)', transition:'background .2s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.14)'}
                      onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.07)'}>
                      <span className="material-icons" style={{ fontSize:17 }}>email</span>
                      Send Email
                    </a>
                  )}
                </div>

                {/* Quick summary */}
                <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid rgba(255,255,255,.1)', display:'flex', flexDirection:'column', gap:10 }}>
                  {[
                    hotel.cityName && { label:'City',    val:hotel.cityName  },
                    hotel.address  && { label:'Address', val:hotel.address, small:true },
                  ].filter(Boolean).map((row,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                      <span style={{ fontSize:12, color:'rgba(255,255,255,.45)', fontFamily:'Inter,sans-serif', flexShrink:0 }}>{row.label}</span>
                      <span style={{ fontSize:row.small?11:13, fontWeight:700, color:'rgba(255,255,255,.85)', fontFamily:'Syne,sans-serif', textAlign:'right', lineHeight:1.4 }}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Back to city */}
            {hotel.cityHostId && (
              <button onClick={() => router.push(`/cities/${hotel.cityHostId}`)} className="fu d3"
                style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px 20px', background:'#fafaf9', color:'#57534e', border:'1px solid #e7e5e4', borderRadius:16, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, cursor:'pointer', transition:'all .2s' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='#C1272D'; e.currentTarget.style.color='#C1272D'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e7e5e4'; e.currentTarget.style.color='#57534e'; }}>
                <span className="material-icons" style={{ fontSize:18 }}>location_city</span>
                Explore {hotel.cityName || 'the city'}
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}