import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const API_BASE  = 'http://localhost:3309/api/news';
const TEAMS_API = 'http://localhost:3309/api/teams/teams/all';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d) => {
  if (!d) return '';
  return new Intl.DateTimeFormat('en-US', { day:'numeric', month:'short', year:'numeric' }).format(new Date(d));
};
const getImageUrl = (n) => {
  if (n.images && Array.isArray(n.images) && n.images.length > 0) return n.images[0];
  return n.image || n.imageUrl || n.thumbnail || null;
};
const getAllImages = (n) => {
  const main   = getImageUrl(n);
  const extras = Array.isArray(n.images) ? n.images : [];
  return main ? [main, ...extras.filter(i => i !== main)] : extras;
};

// ─── Hero Carousel ────────────────────────────────────────────────────────────
function HeroSection({ newsList, onSelect }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const featured = newsList.slice(0, 3);

  const goNext = useCallback(() => setActiveIndex(p => (p === featured.length - 1 ? 0 : p + 1)), [featured.length]);
  const goPrev = useCallback(() => setActiveIndex(p => (p === 0 ? featured.length - 1 : p - 1)), [featured.length]);

  useEffect(() => {
    if (!featured.length) return;
    const iv = setInterval(goNext, 6000);
    return () => clearInterval(iv);
  }, [featured.length, goNext]);

  if (!featured.length) return null;

  return (
    <section style={{ position:'relative', width:'100%', height:'100vh', minHeight:520, overflow:'hidden', background:'#1c1917' }}>
      {/* Moroccan pattern overlay */}
      <div style={{ position:'absolute', inset:0, opacity:.04, backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'160px', zIndex:1, pointerEvents:'none' }} />

      {featured.map((item, idx) => {
        const img = getImageUrl(item);
        return (
          <div key={item.id||idx} style={{ position:'absolute', inset:0, transition:'opacity 1s ease, transform 1s ease', opacity:idx===activeIndex?1:0, transform:idx===activeIndex?'scale(1)':'scale(1.05)', zIndex:idx===activeIndex?2:1 }}>
            {img && <img src={img} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(.28)' }} />}
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.85) 0%,rgba(0,0,0,.3) 55%,transparent 100%)' }} />

            {/* Content */}
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'flex-end', zIndex:3 }}>
              <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px 80px', width:'100%' }}>
                <div style={{ maxWidth:760 }}>
                  {/* Badges */}
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                    {item.teamName && (
                      <span style={{ padding:'4px 12px', background:'#C1272D', color:'#fff', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', fontFamily:'Syne,sans-serif' }}>
                        {item.teamName}
                      </span>
                    )}
                    {item.dateOfCreation && (
                      <span style={{ display:'flex', alignItems:'center', gap:6, color:'rgba(255,255,255,.45)', fontSize:12, fontWeight:600 }}>
                        <span className="material-icons" style={{ fontSize:13 }}>calendar_today</span>
                        {formatDate(item.dateOfCreation)}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 style={{ fontFamily:'Amiri,serif', fontSize:'clamp(28px,5vw,58px)', fontWeight:700, color:'#fff', lineHeight:1.05, letterSpacing:'-.01em', marginBottom:14 }}>
                    {item.title||'Untitled'}
                  </h2>

                  {/* Description */}
                  <p style={{ color:'rgba(255,255,255,.55)', fontSize:15, lineHeight:1.75, marginBottom:24, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                    {item.description||''}
                  </p>

                  {/* CTA */}
                  <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                    <button
                      onClick={() => onSelect(item)}
                      style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 24px', background:'#fff', color:'#1c1917', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:13, border:'none', cursor:'pointer', transition:'all .2s' }}
                      onMouseEnter={e=>{ e.currentTarget.style.background='#C1272D'; e.currentTarget.style.color='#fff'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='#fff'; e.currentTarget.style.color='#1c1917'; }}>
                      Read article
                      <span className="material-icons" style={{ fontSize:16 }}>north_east</span>
                    </button>
                    {item.author && (
                      <span style={{ color:'rgba(255,255,255,.4)', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                        <span className="material-icons" style={{ fontSize:13 }}>person</span>
                        {item.author}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Controls bar */}
      <div style={{ position:'absolute', bottom:24, left:0, right:0, zIndex:10 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:20 }}>
          {/* Dots */}
          <div style={{ display:'flex', gap:6 }}>
            {featured.map((_,i) => (
              <button key={i} onClick={() => setActiveIndex(i)}
                      style={{ height:3, borderRadius:2, transition:'all .45s', background:i===activeIndex?'#C1272D':'rgba(255,255,255,.25)', width:i===activeIndex?32:14, border:'none', cursor:'pointer', padding:0 }} />
            ))}
          </div>
          {/* Arrow buttons */}
          <div style={{ display:'flex', gap:6 }}>
            {[{icon:'chevron_left',fn:goPrev},{icon:'chevron_right',fn:goNext}].map(({icon,fn}) => (
              <button key={icon} onClick={fn}
                      style={{ width:42, height:42, border:'1px solid rgba(255,255,255,.2)', background:'transparent', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all .2s' }}
                      onMouseEnter={e=>{ e.currentTarget.style.background='#fff'; e.currentTarget.style.color='#1c1917'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#fff'; }}>
                <span className="material-icons" style={{ fontSize:22 }}>{icon}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Filters ──────────────────────────────────────────────────────────────────
function NewsFilters({ search, onSearchChange, teamId, onTeamChange, teams, isFiltering, total }) {
  return (
    <div style={{ position:'sticky', top:64, zIndex:40, padding:'12px 24px' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', background:'rgba(255,255,255,.92)', backdropFilter:'blur(16px)', border:'1px solid #e7e5e4', borderRadius:999, padding:'10px 10px 10px 18px', display:'flex', flexWrap:'wrap', gap:10, alignItems:'center', boxShadow:'0 4px 24px rgba(0,0,0,.06)' }}>
        {/* Search */}
        <div style={{ flex:1, minWidth:240, position:'relative' }}>
          <span className="material-icons" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:18, color:'#a8a29e' }}>search</span>
          <input
            type="text"
            placeholder="Search articles or authors…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            style={{ width:'100%', paddingLeft:44, paddingRight:16, paddingTop:12, paddingBottom:12, background:'#fafaf9', border:'1px solid #f0efed', borderRadius:999, outline:'none', fontFamily:'Inter,sans-serif', fontSize:14, fontWeight:500, color:'#1c1917', transition:'border-color .2s' }}
            onFocus={e=>e.target.style.borderColor='#C1272D'}
            onBlur={e=>e.target.style.borderColor='#f0efed'}
          />
        </div>

        {/* Team select */}
        <select
          value={teamId}
          onChange={e => onTeamChange(e.target.value)}
          style={{ padding:'12px 20px', background:'#fafaf9', border:'1px solid #f0efed', borderRadius:999, outline:'none', fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'#1c1917', cursor:'pointer', minWidth:160 }}>
          <option value="">All Teams</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        {/* Result count */}
        {isFiltering && (
          <span style={{ fontSize:10, fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'.1em', fontFamily:'Syne,sans-serif', paddingRight:8 }}>
            {total} result{total!==1?'s':''}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── News Card ────────────────────────────────────────────────────────────────
function NewsCard({ news, onSelect }) {
  const img = getImageUrl(news);
  const [hovered, setHovered] = useState(false);

  return (
    <article
      onClick={() => onSelect(news)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor:'pointer', display:'flex', flexDirection:'column', transition:'transform .3s' }}>

      {/* Image */}
      <div style={{ position:'relative', aspectRatio:'4/3', overflow:'hidden', marginBottom:18, background:'#f5f5f4', borderRadius:4 }}>
        {img ? (
          <img src={img} alt={news.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .65s cubic-bezier(.16,1,.3,1)', transform:hovered?'scale(1.06)':'scale(1)' }} />
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#e7e5e4' }}>
            <span className="material-icons" style={{ fontSize:36, color:'#a8a29e' }}>image</span>
          </div>
        )}
        <div style={{ position:'absolute', inset:0, background:'rgba(28,25,23,.1)', transition:'background .3s', ...(hovered?{background:'rgba(28,25,23,0)'}:{}) }} />

        {/* Team badge */}
        {news.teamName && (
          <div style={{ position:'absolute', top:14, left:14 }}>
            <span style={{ padding:'3px 10px', background:'rgba(255,255,255,.95)', backdropFilter:'blur(8px)', color:'#1c1917', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', fontFamily:'Syne,sans-serif' }}>
              {news.teamName}
            </span>
          </div>
        )}

        {/* Date badge */}
        {news.dateOfCreation && (
          <div style={{ position:'absolute', top:14, right:14 }}>
            <span style={{ padding:'4px 10px', background:'#C1272D', color:'#fff', fontSize:10, fontWeight:700, fontFamily:'Syne,sans-serif' }}>
              {formatDate(news.dateOfCreation)}
            </span>
          </div>
        )}

        {/* Arrow on hover */}
        <div style={{ position:'absolute', bottom:14, right:14, width:36, height:36, background:'rgba(255,255,255,.92)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .3s', opacity:hovered?1:0, transform:hovered?'translateY(0)':'translateY(8px)' }}>
          <span className="material-icons" style={{ fontSize:18, color:'#1c1917' }}>north_east</span>
        </div>
      </div>

      {/* Text */}
      <div style={{ display:'flex', flexDirection:'column', flex:1 }}>
        {/* Meta */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#a8a29e', fontFamily:'Syne,sans-serif' }}>
          {news.author && (
            <>
              <span className="material-icons" style={{ fontSize:12, color:'#C1272D' }}>person</span>
              {news.author}
              <span style={{ width:3, height:3, borderRadius:'50%', background:'#d6d3d1', display:'inline-block' }} />
            </>
          )}
          {news.teamName && <span>{news.teamName}</span>}
        </div>

        {/* Title */}
        <h3 style={{ fontFamily:'Amiri,serif', fontSize:18, fontWeight:700, color:hovered?'#C1272D':'#1c1917', lineHeight:1.3, marginBottom:10, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', transition:'color .2s' }}>
          {news.title||'Untitled'}
        </h3>

        {/* Description */}
        <p style={{ fontSize:13, color:'#78716c', lineHeight:1.75, marginBottom:16, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
          {news.description||''}
        </p>

        {/* Footer */}
        <div style={{ marginTop:'auto', display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1px solid #f5f5f4', paddingTop:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.09em', color:hovered?'#C1272D':'#1c1917', fontFamily:'Syne,sans-serif', transition:'color .2s' }}>
            Read more <span className="material-icons" style={{ fontSize:14 }}>north_east</span>
          </div>
          {news.dateOfCreation && (
            <span style={{ fontSize:11, color:'#a8a29e', fontWeight:500 }}>{formatDate(news.dateOfCreation)}</span>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── News Modal ───────────────────────────────────────────────────────────────
function NewsModal({ news, onClose, onPrev, onNext, hasPrev, hasNext }) {
  const [currentImage, setCurrentImage] = useState(0);
  const allImages = getAllImages(news);

  useEffect(() => { setCurrentImage(0); }, [news.id]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft')  onPrev?.();
      if (e.key === 'ArrowRight') onNext?.();
    };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [onClose, onPrev, onNext]);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(28,25,23,.88)', backdropFilter:'blur(6px)' }} />

      {/* Prev article */}
      {hasPrev && (
        <button onClick={e=>{ e.stopPropagation(); onPrev(); }}
                style={{ position:'absolute', left:16, zIndex:210, width:48, height:48, border:'1px solid rgba(255,255,255,.18)', background:'rgba(255,255,255,.08)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', backdropFilter:'blur(8px)', transition:'all .2s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background='#fff'; e.currentTarget.style.color='#1c1917'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,.08)'; e.currentTarget.style.color='#fff'; }}>
          <span className="material-icons" style={{ fontSize:24 }}>chevron_left</span>
        </button>
      )}
      {hasNext && (
        <button onClick={e=>{ e.stopPropagation(); onNext(); }}
                style={{ position:'absolute', right:16, zIndex:210, width:48, height:48, border:'1px solid rgba(255,255,255,.18)', background:'rgba(255,255,255,.08)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', backdropFilter:'blur(8px)', transition:'all .2s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background='#fff'; e.currentTarget.style.color='#1c1917'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,.08)'; e.currentTarget.style.color='#fff'; }}>
          <span className="material-icons" style={{ fontSize:24 }}>chevron_right</span>
        </button>
      )}

      {/* Card */}
      <div style={{ position:'relative', background:'#fff', width:'100%', maxWidth:960, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', zIndex:205, boxShadow:'0 40px 100px rgba(0,0,0,.4)' }}>
        {/* Top accent */}
        <div style={{ height:3, background:'linear-gradient(to right,#C1272D,#006233)', flexShrink:0 }} />

        {/* Close */}
        <button onClick={onClose}
                style={{ position:'absolute', top:16, right:16, zIndex:220, width:38, height:38, background:'#f5f5f4', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all .2s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background='#C1272D'; e.currentTarget.querySelector('span').style.color='#fff'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='#f5f5f4'; e.currentTarget.querySelector('span').style.color='#1c1917'; }}>
          <span className="material-icons" style={{ fontSize:20, color:'#1c1917', transition:'color .2s' }}>close</span>
        </button>

        <div style={{ display:'flex', flex:1, overflow:'hidden', flexDirection:'row' }}>

          {/* Image panel */}
          <div style={{ width:'42%', flexShrink:0, background:'#f5f5f4', position:'relative', display:'flex', flexDirection:'column' }}>
            <div style={{ flex:1, position:'relative', overflow:'hidden', minHeight:280 }}>
              {allImages.length > 0 ? (
                <img src={allImages[currentImage]} alt={news.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'opacity .3s' }} />
              ) : (
                <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#e7e5e4' }}>
                  <span className="material-icons" style={{ fontSize:48, color:'#a8a29e' }}>image</span>
                </div>
              )}

              {/* Date */}
              {news.dateOfCreation && (
                <div style={{ position:'absolute', top:16, left:16 }}>
                  <span style={{ padding:'5px 12px', background:'#C1272D', color:'#fff', fontSize:11, fontWeight:700, fontFamily:'Syne,sans-serif' }}>{formatDate(news.dateOfCreation)}</span>
                </div>
              )}

              {/* Image nav arrows */}
              {allImages.length > 1 && (
                <>
                  <button onClick={()=>setCurrentImage(p=>p===0?allImages.length-1:p-1)}
                          style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', width:36, height:36, background:'rgba(0,0,0,.45)', backdropFilter:'blur(6px)', border:'none', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'background .2s' }}
                          onMouseEnter={e=>e.currentTarget.style.background='#C1272D'}
                          onMouseLeave={e=>e.currentTarget.style.background='rgba(0,0,0,.45)'}>
                    <span className="material-icons" style={{ fontSize:20 }}>chevron_left</span>
                  </button>
                  <button onClick={()=>setCurrentImage(p=>p===allImages.length-1?0:p+1)}
                          style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', width:36, height:36, background:'rgba(0,0,0,.45)', backdropFilter:'blur(6px)', border:'none', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'background .2s' }}
                          onMouseEnter={e=>e.currentTarget.style.background='#C1272D'}
                          onMouseLeave={e=>e.currentTarget.style.background='rgba(0,0,0,.45)'}>
                    <span className="material-icons" style={{ fontSize:20 }}>chevron_right</span>
                  </button>
                  {/* Counter */}
                  <div style={{ position:'absolute', top:16, right:16, padding:'3px 10px', background:'rgba(0,0,0,.5)', backdropFilter:'blur(6px)', color:'#fff', fontSize:10, fontWeight:700, fontFamily:'Syne,sans-serif' }}>
                    {currentImage+1} / {allImages.length}
                  </div>
                  {/* Dots */}
                  <div style={{ position:'absolute', bottom:60, left:0, right:0, display:'flex', justifyContent:'center', gap:6 }}>
                    {allImages.map((_,i) => (
                      <button key={i} onClick={()=>setCurrentImage(i)}
                              style={{ height:4, borderRadius:2, border:'none', cursor:'pointer', transition:'all .3s', background:i===currentImage?'#C1272D':'rgba(255,255,255,.5)', width:i===currentImage?20:8 }} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div style={{ padding:'10px 10px', display:'flex', gap:6, overflowX:'auto', background:'#fafaf9', borderTop:'1px solid #e7e5e4', flexShrink:0 }}>
                {allImages.map((img,i) => (
                  <button key={i} onClick={()=>setCurrentImage(i)}
                          style={{ width:56, height:44, flexShrink:0, overflow:'hidden', border:'2px solid', borderColor:i===currentImage?'#C1272D':'transparent', padding:0, cursor:'pointer', transition:'border-color .2s', background:'none' }}>
                    <img src={img} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content panel */}
          <div style={{ flex:1, padding:'32px 36px', overflowY:'auto', display:'flex', flexDirection:'column' }}>
            {/* Badges */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', background:'#fafaf9', border:'1px solid #e7e5e4', color:'#57534e', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', fontFamily:'Syne,sans-serif' }}>
                <span className="material-icons" style={{ fontSize:12 }}>newspaper</span>Article
              </span>
              {news.teamName && (
                <span style={{ padding:'4px 12px', background:'#fafaf9', border:'1px solid #e7e5e4', color:'#57534e', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', fontFamily:'Syne,sans-serif' }}>
                  {news.teamName}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 style={{ fontFamily:'Amiri,serif', fontSize:'clamp(20px,2.5vw,30px)', fontWeight:700, color:'#1c1917', lineHeight:1.2, marginBottom:20 }}>
              {news.title||'Untitled'}
            </h2>

            {/* Meta bar */}
            <div style={{ display:'flex', alignItems:'center', gap:20, padding:'14px 0', borderTop:'1px solid #f5f5f4', borderBottom:'1px solid #f5f5f4', marginBottom:24, flexWrap:'wrap' }}>
              {[
                news.author   ? { label:'Author', value:news.author }          : null,
                news.dateOfCreation ? { label:'Date', value:formatDate(news.dateOfCreation) } : null,
                news.teamName ? { label:'Team',   value:news.teamName }         : null,
              ].filter(Boolean).map((item, i, arr) => (
                <React.Fragment key={item.label}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'#a8a29e', fontFamily:'Syne,sans-serif', marginBottom:3 }}>{item.label}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#1c1917', fontFamily:'Syne,sans-serif' }}>{item.value}</div>
                  </div>
                  {i < arr.length-1 && <div style={{ width:1, height:36, background:'#f0efed' }} />}
                </React.Fragment>
              ))}
            </div>

            {/* Description / body */}
            <div style={{ flex:1 }}>
              {news.description && (
                <p style={{ fontSize:15, color:'#57534e', fontWeight:500, lineHeight:1.8, fontStyle:'italic', borderLeft:'3px solid #C1272D', paddingLeft:18, marginBottom:20 }}>
                  {news.description}
                </p>
              )}
              {news.detail && (
                <p style={{ fontSize:13, color:'#78716c', lineHeight:1.85 }}>
                  {news.detail}
                </p>
              )}
              {allImages.length > 1 && (
                <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#a8a29e', fontWeight:600, marginTop:16 }}>
                  <span className="material-icons" style={{ fontSize:15 }}>photo_library</span>
                  {allImages.length} photos available
                </div>
              )}
            </div>

            {/* Footer nav */}
            <div style={{ paddingTop:20, borderTop:'1px solid #f5f5f4', display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:3, height:18, background:'#C1272D', borderRadius:2 }} />
                <span style={{ fontSize:10, fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'.1em', fontFamily:'Syne,sans-serif' }}>Morocco 2030 News</span>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {[{fn:onPrev,ok:hasPrev,icon:'chevron_left'},{fn:onNext,ok:hasNext,icon:'chevron_right'}].map(({fn,ok,icon}) => (
                  <button key={icon} onClick={fn} disabled={!ok}
                          style={{ width:36, height:36, border:'1px solid #e7e5e4', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:ok?'pointer':'not-allowed', opacity:ok?1:.35, transition:'all .2s' }}
                          onMouseEnter={e=>{ if(ok){ e.currentTarget.style.background='#C1272D'; e.currentTarget.style.borderColor='#C1272D'; e.currentTarget.querySelector('span').style.color='#fff'; }}}
                          onMouseLeave={e=>{ e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor='#e7e5e4'; e.currentTarget.querySelector('span').style.color='#57534e'; }}>
                    <span className="material-icons" style={{ fontSize:18, color:'#57534e', transition:'color .2s' }}>{icon}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ aspectRatio:'4/3', background:'#f0efed', borderRadius:4, animation:'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height:10, width:80, background:'#f0efed', borderRadius:4, animation:'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height:18, background:'#f0efed', borderRadius:4, animation:'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height:14, width:'75%', background:'#f0efed', borderRadius:4, animation:'pulse 1.5s ease-in-out infinite' }} />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const NewsPage = () => {
  const [newsList, setNewsList]       = useState([]);
  const [teams, setTeams]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [teamId, setTeamId]           = useState('');
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    fetch(TEAMS_API).then(r=>r.ok?r.json():[]).then(d=>setTeams(Array.isArray(d)?d:[])).catch(()=>setTeams([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(API_BASE).then(r=>r.ok?r.json():[]).then(d=>setNewsList(Array.isArray(d)?d:[])).catch(()=>setNewsList([])).finally(()=>setLoading(false));
  }, []);

  // Fallback teams extraction
  useEffect(() => {
    if (teams.length===0 && newsList.length>0) {
      const extracted = Array.from(new Set(newsList.map(n=>n.teamId))).map(id=>{
        const item = newsList.find(n=>n.teamId===id);
        return { id, name:item?.teamName };
      }).filter(t=>t.id&&t.name);
      if (extracted.length>0) setTeams(extracted);
    }
  }, [newsList, teams]);

  const isFiltering = search!==''||teamId!=='';

  const filteredNews = newsList.filter(n => {
    const matchSearch = n.title?.toLowerCase().includes(search.toLowerCase()) || n.author?.toLowerCase().includes(search.toLowerCase());
    const matchTeam   = teamId==='' || n.teamId===parseInt(teamId);
    return matchSearch && matchTeam;
  });

  const displayedNews   = isFiltering ? filteredNews : newsList;
  const selectedIndex   = selectedNews ? displayedNews.findIndex(n=>n.id===selectedNews.id) : -1;
  const handlePrev      = useCallback(()=>{ if(selectedIndex>0) setSelectedNews(displayedNews[selectedIndex-1]); }, [selectedIndex, displayedNews]);
  const handleNext      = useCallback(()=>{ if(selectedIndex<displayedNews.length-1) setSelectedNews(displayedNews[selectedIndex+1]); }, [selectedIndex, displayedNews]);

  return (
    <>
      <Head />
      <Navbar />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        @keyframes pulse { 0%,100%{opacity:.55} 50%{opacity:1} }
        body { font-family:'Inter',sans-serif; }
      `}</style>

      <div style={{ minHeight:'100vh', background:'#fafaf9', display:'flex', flexDirection:'column' }}>

        {/* Hero */}
        {!loading && newsList.length > 0 && (
          <HeroSection newsList={newsList} onSelect={setSelectedNews} />
        )}

        {/* Filters */}
        <NewsFilters search={search} onSearchChange={setSearch} teamId={teamId} onTeamChange={setTeamId} teams={teams} isFiltering={isFiltering} total={filteredNews.length} />

        {/* Main content */}
        <main style={{ flex:1 }}>
          <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 24px 96px' }}>

            {/* Section header */}
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:36, borderBottom:'1px solid #e7e5e4', paddingBottom:20 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'#C1272D', textTransform:'uppercase', letterSpacing:'.12em', fontFamily:'Syne,sans-serif', marginBottom:6 }}>Latest Updates</div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(22px,3vw,30px)', fontWeight:800, color:'#1c1917', lineHeight:1.1 }}>
                  {isFiltering ? `Results (${filteredNews.length})` : 'News Feed'}
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:10, fontWeight:700, color:'#d6d3d1', textTransform:'uppercase', letterSpacing:'.1em', fontFamily:'Syne,sans-serif' }}>
                <span className="material-icons" style={{ fontSize:14 }}>newspaper</span>
                {newsList.length} articles
              </div>
            </div>

            {/* Cards grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'40px 32px' }}>
              {loading ? (
                Array.from({length:6}).map((_,i) => <SkeletonCard key={i} />)
              ) : displayedNews.length===0 ? (
                <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'64px 0' }}>
                  <span className="material-icons" style={{ fontSize:48, color:'#d6d3d1', display:'block', marginBottom:12 }}>newspaper</span>
                  <p style={{ fontSize:13, fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'.12em', fontFamily:'Syne,sans-serif' }}>No articles match your criteria</p>
                </div>
              ) : (
                displayedNews.map((news,i) => <NewsCard key={news.id||i} news={news} onSelect={setSelectedNews} />)
              )}
            </div>
          </div>
        </main>

        {/* Modal */}
        {selectedNews && (
          <NewsModal
            news={selectedNews}
            onClose={() => setSelectedNews(null)}
            onPrev={handlePrev}
            onNext={handleNext}
            hasPrev={selectedIndex>0}
            hasNext={selectedIndex<displayedNews.length-1}
          />
        )}
      </div>

      <Footer />
    </>
  );
};

// tiny Head shim so file works standalone
function Head() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    document.head.appendChild(link);
  }, []);
  return null;
}

export default NewsPage;