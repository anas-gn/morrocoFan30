import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const API = 'https://anas-gana1-fandb-backend.hf.space/api';

async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text === 'null') return null;
    return JSON.parse(text);
  } catch { return null; }
}

export default function FoodDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [food, setFood]           = useState(null);
  const [images, setImages]       = useState([]);
  const [related, setRelated]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [lightbox, setLightbox]   = useState(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [activeImg, setActiveImg] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const data = await safeFetch(`${API}/foods/${id}`);
      if (data) {
        setFood(data);
        setActiveImg(data.imageUrl);

        // Extra images
        const imgs = await safeFetch(`${API}/foods/${id}/images`);
        const imgList = Array.isArray(imgs) ? imgs : [];
        setImages(imgList);
        if (data.imageUrl && !imgList.includes(data.imageUrl)) {
          setImages([data.imageUrl, ...imgList]);
        } else {
          setImages(imgList.length ? imgList : (data.imageUrl ? [data.imageUrl] : []));
        }

        // Related foods from same city
        if (data.cityId) {
          const cityFoods = await safeFetch(`${API}/foods/city/${data.cityId}`);
          if (Array.isArray(cityFoods)) {
            setRelated(cityFoods.filter(f => f.id !== parseInt(id)).slice(0, 6));
          }
        }
      }
      setLoading(false);
    })();
  }, [id]);

  const allImages = images.length > 0 ? images : (food?.imageUrl ? [food.imageUrl] : []);

  const openLightbox = (idx) => {
    setLightboxIdx(idx);
    setLightbox(allImages[idx]);
  };
  const prevLb = () => {
    const idx = (lightboxIdx - 1 + allImages.length) % allImages.length;
    setLightboxIdx(idx);
    setLightbox(allImages[idx]);
  };
  const nextLb = () => {
    const idx = (lightboxIdx + 1) % allImages.length;
    setLightboxIdx(idx);
    setLightbox(allImages[idx]);
  };

  /* ── Loading ── */
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#fdf6ed' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 44, height: 44, border: '3px solid #c2410c', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: '#92400e', letterSpacing: '.08em' }}>Loading dish…</span>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!food) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#fdf6ed' }}>
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, color: '#1c1410', marginBottom: 16 }}>Dish not found</div>
      <button onClick={() => router.back()}
        style={{ padding: '10px 28px', background: '#c2410c', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
        Go back
      </button>
    </div>
  );

  return (
    <>
      <Head>
        <title>{food.name} — {food.cityName || 'Moroccan Cuisine'} | MoroccoFan2030</title>
        <meta name="description" content={food.description || `Discover ${food.name}, a culinary specialty`} />
        <link rel="icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Syne:wght@400;600;700;800&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        body { background: #fdf6ed; color: #1c1410; -webkit-font-smoothing: antialiased; }
        ::selection { background: #c2410c; color: #fff; }

        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: scale(1); } }

        .fu  { animation: fadeUp .65s cubic-bezier(.16,1,.3,1) both; }
        .fi  { animation: fadeIn .5s ease both; }
        .d1  { animation-delay: .07s; }
        .d2  { animation-delay: .15s; }
        .d3  { animation-delay: .23s; }
        .d4  { animation-delay: .31s; }
        .d5  { animation-delay: .39s; }

        .no-scroll::-webkit-scrollbar { display: none; }
        .no-scroll { -ms-overflow-style: none; scrollbar-width: none; }

        /* Thumb */
        .thumb { border: 2px solid transparent; border-radius: 10px; overflow: hidden; cursor: pointer; transition: border-color .2s, transform .2s; aspect-ratio: 1; }
        .thumb:hover { transform: scale(1.04); }
        .thumb.active { border-color: #c2410c; }
        .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

        /* Related card */
        .rel-card { background: #fff; border: 1px solid #e8ddd1; border-radius: 18px; overflow: hidden; cursor: pointer; transition: border-color .2s, transform .3s, box-shadow .3s; }
        .rel-card:hover { border-color: #c2410c; transform: translateY(-4px); box-shadow: 0 18px 44px rgba(194,65,12,.1); }
        .rel-card img { transition: transform .7s cubic-bezier(.16,1,.3,1); }
        .rel-card:hover img { transform: scale(1.07); }

        /* Info row */
        .info-row { display: flex; align-items: flex-start; gap: 10px; padding: 14px 0; border-bottom: 1px solid #f0e6d8; }
        .info-row:last-child { border-bottom: none; }

        /* Lightbox overlay */
        .lb-overlay { position: fixed; inset: 0; z-index: 500; background: rgba(15,10,5,.93); display: flex; align-items: center; justify-content: center; animation: fadeIn .25s ease; }

        @media (max-width: 900px) {
          .main-grid { grid-template-columns: 1fr !important; }
          .gallery-thumbs { grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)) !important; }
        }
      `}</style>

      <Navbar />

      {/* ══ BREADCRUMB BAR ══ */}
      <div style={{ background: '#f5ebe0', borderBottom: '1px solid #e8ddd1', padding: '12px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#a07850', fontFamily: 'Syne, sans-serif', fontWeight: 600, flexWrap: 'wrap' }}>
          <span style={{ cursor: 'pointer', transition: 'color .2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#c2410c'}
            onMouseLeave={e => e.currentTarget.style.color = '#a07850'}
            onClick={() => router.push('/')}>Home</span>
          <span className="material-icons" style={{ fontSize: 14, opacity: .5 }}>chevron_right</span>
          {food.cityName && (
            <>
              <span style={{ cursor: 'pointer', transition: 'color .2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#c2410c'}
                onMouseLeave={e => e.currentTarget.style.color = '#a07850'}
                onClick={() => router.push(`/city/${food.cityId}`)}>
                {food.cityName}
              </span>
              <span className="material-icons" style={{ fontSize: 14, opacity: .5 }}>chevron_right</span>
            </>
          )}
          <span style={{ color: '#c2410c' }}>Food</span>
          <span className="material-icons" style={{ fontSize: 14, opacity: .5 }}>chevron_right</span>
          <span style={{ color: '#1c1410', fontWeight: 700 }}>{food.name}</span>
        </div>
      </div>

      {/* ══ MAIN ══════════════════════════════════════════════════════════ */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Back button */}
        <button onClick={() => router.back()}
          className="fu"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#a07850', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 70, fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, padding: 0, transition: 'color .2s',marginTop:22 }}
          onMouseEnter={e => e.currentTarget.style.color = '#c2410c'}
          onMouseLeave={e => e.currentTarget.style.color = '#a07850'}>
          <span className="material-icons" style={{ fontSize: 18 }}>arrow_back</span>
          Back
        </button>

        {/* ── MAIN GRID: image left / info right ── */}
        <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 48, alignItems: 'start', marginBottom: 72 }}>

          {/* LEFT: Image gallery */}
          <div className="fu d1">

            {/* Main image */}
            <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', aspectRatio: '4/3', background: '#f0e6d8', marginBottom: 12, cursor: allImages.length > 0 ? 'zoom-in' : 'default', boxShadow: '0 24px 72px rgba(0,0,0,.14)' }}
              onClick={() => allImages.length > 0 && openLightbox(allImages.indexOf(activeImg) >= 0 ? allImages.indexOf(activeImg) : 0)}>
              {activeImg
                ? <img src={activeImg} alt={food.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity .35s' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f5ebe0,#e8ddd1)' }}>
                    <span className="material-icons" style={{ fontSize: 80, color: '#d4b896' }}>restaurant</span>
                  </div>}

              {/* Category badge */}
              {food.category && (
                <div style={{ position: 'absolute', top: 18, left: 18, padding: '5px 14px', background: 'rgba(194,65,12,.9)', backdropFilter: 'blur(8px)', borderRadius: 99, fontFamily: 'Syne, sans-serif', fontSize: 10, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#fff' }}>
                  {food.category}
                </div>
              )}

              {/* Zoom hint */}
              {allImages.length > 0 && (
                <div style={{ position: 'absolute', bottom: 18, right: 18, width: 38, height: 38, borderRadius: '50%', background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: .8 }}>
                  <span className="material-icons" style={{ fontSize: 18, color: '#fff' }}>zoom_in</span>
                </div>
              )}

              {/* Gradient overlay bottom */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.25) 0%, transparent 50%)', pointerEvents: 'none' }} />
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="gallery-thumbs" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                {allImages.map((img, i) => (
                  <div key={i}
                    className={`thumb ${activeImg === img ? 'active' : ''}`}
                    onClick={() => { setActiveImg(img); }}>
                    <img src={img} alt={`${food.name} ${i + 1}`} onError={e => e.target.style.display = 'none'} />
                  </div>
                ))}
              </div>
            )}

            {/* Image count pill */}
            {allImages.length > 1 && (
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#a07850', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                <span className="material-icons" style={{ fontSize: 15 }}>photo_library</span>
                {allImages.length} photos — click to enlarge
              </div>
            )}
          </div>

          {/* RIGHT: Info panel */}
          <div className="fu d2" style={{ position: 'sticky', top: 24 }}>

            {/* Top accent */}

            {/* Category + city */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {food.category && (
                <span style={{ padding: '3px 12px', background: 'rgba(194,65,12,.1)', border: '1px solid rgba(194,65,12,.25)', borderRadius: 99, fontFamily: 'Syne, sans-serif', fontSize: 10, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#c2410c' }}>
                  {food.category}
                </span>
              )}
              {food.cityName && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 12px', background: '#f5ebe0', border: '1px solid #e8ddd1', borderRadius: 99, fontFamily: 'Syne, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#a07850', cursor: 'pointer', transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#c2410c'; e.currentTarget.style.color = '#c2410c'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8ddd1'; e.currentTarget.style.color = '#a07850'; }}
                  onClick={() => router.push(`/city/${food.cityId}`)}>
                  <span className="material-icons" style={{ fontSize: 12 }}>place</span>
                  {food.cityName}
                </span>
              )}
            </div>

            {/* Dish name */}
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px, 5vw, 54px)', fontWeight: 700, color: '#1c1410', lineHeight: 1.05, marginBottom: 6 }}>
              {food.name}
            </h1>
            {/* Arabic decorative line */}
            <p style={{ fontFamily: 'Amiri, serif', fontSize: 18, color: '#c2410c', opacity: .7, marginBottom: 24, fontStyle: 'italic' }}>
              الطبخ المغربي
            </p>

            {/* Price */}
            {food.priceProxim != null && (
              <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, background: 'linear-gradient(135deg,#1c1410,#3d2b1f)', borderRadius: 16, padding: '14px 22px', marginBottom: 28 }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: 'rgba(255,255,255,.5)', marginBottom: 2 }}>Approx. price</span>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 38, fontWeight: 700, color: '#f59e0b', lineHeight: 1, marginLeft: 8 }}>
                  {food.priceProxim === 0 ? 'Free' : `${food.priceProxim}`}
                </span>
                {food.priceProxim > 0 && (
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>MAD</span>
                )}
              </div>
            )}

            {/* Description */}
            {food.description && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 3, height: 16, background: '#c2410c', borderRadius: 2 }} />
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: '#a07850' }}>About this dish</span>
                </div>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, lineHeight: 1.85, color: '#5c3d25' }}>
                  {food.description}
                </p>
              </div>
            )}

            {/* Info rows */}
            <div style={{ background: '#fff', border: '1px solid #e8ddd1', borderRadius: 18, padding: '4px 20px', marginBottom: 24 }}>
              {[
                food.category    && { icon: 'category',     label: 'Category',    val: food.category                        },
                food.cityName    && { icon: 'location_city', label: 'City',        val: food.cityName                        },
                food.priceProxim != null && {
                  icon: 'payments', label: 'Approx. price',
                  val: food.priceProxim === 0 ? 'Free' : `${food.priceProxim} MAD`
                },
              ].filter(Boolean).map((row, i) => (
                <div key={i} className="info-row">
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(194,65,12,.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-icons" style={{ fontSize: 18, color: '#c2410c' }}>{row.icon}</span>
                  </div>
                  <div style={{ flex: 1, paddingTop: 2 }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#b89880', marginBottom: 2 }}>{row.label}</div>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontWeight: 600, color: '#1c1410' }}>{row.val}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA: explore city */}
            {food.cityName && food.cityId && (
              <button onClick={() => router.push(`/city/${food.cityId}`)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 0', background: 'linear-gradient(135deg,#c2410c,#ea580c)', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, cursor: 'pointer', transition: 'all .25s', letterSpacing: '.02em', boxShadow: '0 8px 28px rgba(194,65,12,.3)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(194,65,12,.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(194,65,12,.3)'; }}>
                <span className="material-icons" style={{ fontSize: 18 }}>explore</span>
                Explore {food.cityName}
                <span className="material-icons" style={{ fontSize: 18 }}>north_east</span>
              </button>
            )}
          </div>
        </div>

        {/* ══ RELATED FOODS FROM SAME CITY ══ */}
        {related.length > 0 && (
          <section className="fu d4">
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 3, height: 22, background: 'linear-gradient(to bottom,#c2410c,#f59e0b)', borderRadius: 2 }} />
                  <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 700, color: '#1c1410', lineHeight: 1.1 }}>
                    More from {food.cityName}
                  </h2>
                </div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 12, color: '#a07850', marginLeft: 13 }}>Other local culinary specialties</p>
              </div>
              {food.cityId && (
                <button onClick={() => router.push(`/city/${food.cityId}`)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', border: '1px solid #e8ddd1', background: '#fff', borderRadius: 99, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, color: '#5c3d25', cursor: 'pointer', transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#c2410c'; e.currentTarget.style.color = '#c2410c'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8ddd1'; e.currentTarget.style.color = '#5c3d25'; }}>
                  <span className="material-icons" style={{ fontSize: 15 }}>location_city</span>
                  See all in {food.cityName}
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
              {related.map((item, i) => (
                <div key={item.id}
                  className="rel-card fu"
                  style={{ animationDelay: `${.4 + i * .07}s` }}
                  onClick={() => router.push(`/Food?id=${item.id}`)}>
                  <div style={{ height: 180, position: 'relative', background: '#f5ebe0', overflow: 'hidden' }}>
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display = 'none'} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-icons" style={{ fontSize: 44, color: '#d4b896' }}>restaurant</span>
                        </div>}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.5),transparent)' }} />
                    {item.category && (
                      <div style={{ position: 'absolute', top: 10, left: 10, padding: '3px 10px', background: 'rgba(194,65,12,.85)', borderRadius: 99, fontFamily: 'Syne, sans-serif', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#fff' }}>
                        {item.category}
                      </div>
                    )}
                    {item.priceProxim != null && (
                      <div style={{ position: 'absolute', bottom: 10, right: 10, padding: '3px 10px', background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(6px)', borderRadius: 99, fontFamily: 'Syne, sans-serif', fontSize: 11, fontWeight: 800, color: '#f59e0b' }}>
                        {item.priceProxim === 0 ? 'Free' : `${item.priceProxim} MAD`}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 700, color: '#1c1410', marginBottom: 6, lineHeight: 1.2 }}>{item.name}</div>
                    {item.description && (
                      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 14, color: '#7c5c3e', lineHeight: 1.65, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {item.description}
                      </p>
                    )}
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Syne, sans-serif', fontSize: 11, fontWeight: 700, color: '#c2410c' }}>
                      View dish <span className="material-icons" style={{ fontSize: 14 }}>arrow_forward</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ══ LIGHTBOX ══════════════════════════════════════════════════════ */}
      {lightbox && (
        <div className="lb-overlay" onClick={() => setLightbox(null)}>
          {/* Close */}
          <button onClick={() => setLightbox(null)}
            style={{ position: 'absolute', top: 20, right: 20, width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background .2s', zIndex: 10 }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}>
            <span className="material-icons">close</span>
          </button>

          {/* Counter */}
          <div style={{ position: 'absolute', top: 26, left: '50%', transform: 'translateX(-50%)', fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.55)', letterSpacing: '.1em', zIndex: 10 }}>
            {lightboxIdx + 1} / {allImages.length}
          </div>

          {/* Prev */}
          {allImages.length > 1 && (
            <button onClick={e => { e.stopPropagation(); prevLb(); }}
              style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.18)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background .2s', zIndex: 10 }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}>
              <span className="material-icons">chevron_left</span>
            </button>
          )}

          {/* Image */}
          <img src={lightbox} alt={food.name}
            style={{ maxWidth: 'calc(100% - 120px)', maxHeight: '88vh', borderRadius: 16, boxShadow: '0 40px 100px rgba(0,0,0,.7)', animation: 'scaleIn .3s ease', objectFit: 'contain' }}
            onClick={e => e.stopPropagation()} />

          {/* Next */}
          {allImages.length > 1 && (
            <button onClick={e => { e.stopPropagation(); nextLb(); }}
              style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.18)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background .2s', zIndex: 10 }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}>
              <span className="material-icons">chevron_right</span>
            </button>
          )}

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}
              onClick={e => e.stopPropagation()}>
              {allImages.map((img, i) => (
                <div key={i}
                  onClick={() => { setLightboxIdx(i); setLightbox(img); }}
                  style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${i === lightboxIdx ? '#f59e0b' : 'rgba(255,255,255,.25)'}`, transition: 'border-color .2s, transform .2s', transform: i === lightboxIdx ? 'scale(1.1)' : 'scale(1)', flexShrink: 0 }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Footer />
    </>
  );
}