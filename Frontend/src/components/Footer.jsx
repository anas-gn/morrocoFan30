import Head from 'next/head';

export default function Footer() {
  const LINKS = {
    Tournament: [
      { href: "/Matches", label: "Match Schedule", color: "#C1272D" },
      { href: "/Stades",  label: "Venues",          color: "#006233" },
      { href: "/Teams",   label: "Teams",            color: "#C1272D" },
      { href: "#",        label: "Ticketing",        color: "#006233" },
    ],
    Explore: [
      { href: "/cities",      label: "Host Cities",      color: "#006233" },
      { href: "/itineraries", label: "Travel Planner",   color: "#C1272D" },
      { href: "#",            label: "Culture & Heritage",color: "#006233" },
      { href: "#",            label: "Accommodations",   color: "#b45309" },
    ],
    Legal: [
      { href: "#", label: "Privacy Policy",  color: "#a8a29e" },
      { href: "#", label: "Terms of Service",color: "#a8a29e" },
      { href: "#", label: "Cookie Settings", color: "#a8a29e" },
    ],
  };

  const SECTION_COLORS = {
    Tournament: "#C1272D",
    Explore:    "#006233",
    Legal:      "#b45309",
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=Amiri:ital,wght@0,400;1,400&display=swap');
        @keyframes pulseFav { 0%,100%{opacity:1} 50%{opacity:.4} }
        .footer-fav { animation: pulseFav 2s ease-in-out infinite; }
      `}</style>

      <footer style={{ background:'linear-gradient(135deg,#2d0a0e 0%,#1a0608 55%,#2d0a0e 100%)', color:'rgba(255,255,255,.55)', position:'relative', overflow:'hidden', paddingTop:80, paddingBottom:40 }}>

        {/* Moroccan flower pattern — same as hero sections */}
        <div style={{ position:'absolute', inset:0, opacity:.08, pointerEvents:'none', backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'200px' }} />

        {/* Glows — same as hero */}
        <div style={{ position:'absolute', top:40, left:40, width:280, height:280, borderRadius:'50%', background:'rgba(193,39,45,.1)', filter:'blur(60px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:40, right:40, width:280, height:280, borderRadius:'50%', background:'rgba(0,98,51,.08)', filter:'blur(60px)', pointerEvents:'none' }} />

        {/* Red→green accent stripe at top — same as match-card */}

        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', position:'relative', zIndex:10 }}>

          {/* ── MAIN GRID ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr', gap:40, marginBottom:60 }}
            className="grid-cols-1 md:grid-cols-4">

            {/* Brand column */}
            <div>
              {/* Logo + wordmark */}
              <a href="/Acceuil" style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:20, textDecoration:'none' }}>
                <img src="/images/logo.png" alt="MoroccoFan2030" style={{ width:44, height:44, objectFit:'cover' }} />
                <div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:15, color:'#fff', letterSpacing:'-.01em', lineHeight:1.2 }}>
                    Morocco<span style={{ color:'#C1272D' }}>2030</span>
                  </div>
                  <div style={{ fontFamily:'Amiri,serif', fontStyle:'italic', fontSize:12, color:'rgba(0,98,51,.8)', lineHeight:1.4 }}>المغرب</div>
                </div>
              </a>

              <p style={{ fontSize:13, lineHeight:1.75, color:'rgba(255,255,255,.4)', marginBottom:24, fontWeight:300 }}>
                Celebrating the spirit of football in the heart of the Maghreb. United by passion, defined by heritage.
              </p>

              {/* Social icons — pill style */}
              <div style={{ display:'flex', gap:8 }}>
                {[
                  { icon:'photo_camera', color:'rgba(193,39,45,.7)'  },
                  { icon:'chat',         color:'rgba(0,98,51,.7)'    },
                  { icon:'thumb_up',     color:'rgba(180,83,9,.7)'   },
                ].map(({ icon, color }) => (
                  <a key={icon} href="#"
                    style={{ width:36, height:36, borderRadius:'50%', border:'1px solid rgba(255,255,255,.12)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.4)', transition:'all .2s', textDecoration:'none' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor=color; e.currentTarget.style.background=color.replace('.7)','.12)'); e.currentTarget.style.color=color; }}
                    onMouseOut={e  => { e.currentTarget.style.borderColor='rgba(255,255,255,.12)'; e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,.4)'; }}>
                    <span className="material-icons" style={{ fontSize:16 }}>{icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(LINKS).map(([section, links]) => (
              <div key={section}>
                {/* Section label — same dark-top strip pill style */}
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
                  <div style={{ width:3, height:16, borderRadius:99, background:SECTION_COLORS[section] }} />
                  <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:11, color:'#fff', textTransform:'uppercase', letterSpacing:'.08em' }}>
                    {section === 'Explore' ? 'Explore Morocco' : section}
                  </span>
                </div>

                <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:12 }}>
                  {links.map(({ href, label, color }) => (
                    <li key={label}>
                      <a href={href}
                        style={{ fontFamily:'Inter,sans-serif', fontSize:13, color:'rgba(255,255,255,.45)', textDecoration:'none', fontWeight:400, display:'inline-flex', alignItems:'center', gap:6, transition:'color .18s, transform .18s', transform:'translateX(0)' }}
                        onMouseOver={e => { e.currentTarget.style.color=color; e.currentTarget.style.transform='translateX(4px)'; }}
                        onMouseOut={e  => { e.currentTarget.style.color='rgba(255,255,255,.45)'; e.currentTarget.style.transform='translateX(0)'; }}>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ── DIVIDER — same red→green gradient as match-card accent ── */}
          <div style={{ height:1, background:'linear-gradient(to right,rgba(193,39,45,.35),rgba(0,98,51,.2),transparent)', marginBottom:28 }} />

          {/* ── BOTTOM BAR ── */}
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <span style={{ fontFamily:'Inter,sans-serif', fontSize:12, color:'rgba(255,255,255,.35)' }}>
                © 2024 MoroccoFan2030. Unofficial Fan Concept.
              </span>
              <span style={{ color:'rgba(255,255,255,.15)', fontSize:12 }}>•</span>
              {/* Pill badge — same pill-green style */}
              <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:99, fontSize:10, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', background:'rgba(0,98,51,.15)', color:'rgba(0,98,51,.8)', border:'1px solid rgba(0,98,51,.3)', fontFamily:'Syne,sans-serif' }}>
                🇲🇦 المغرب 2030
              </span>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'Inter,sans-serif', fontSize:12, color:'rgba(255,255,255,.35)' }}>
              <span>Designed with</span>
              <span className="material-icons footer-fav" style={{ fontSize:14, color:'#C1272D' }}>favorite</span>
              <span>in</span>
              <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, color:'#fff', fontSize:12 }}>Morocco</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}