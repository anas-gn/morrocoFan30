import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

const API = 'https://anas-gana1-fandb-backend.hf.space/api';

export default function Profile() {
  const router = useRouter();

  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState('');
  const [saveErr, setSaveErr]   = useState('');
  const [form, setForm]         = useState({});
  const [activeTab, setActiveTab] = useState('general');
  const [teamImage, setTeamImage] = useState('/images/matches.jpg');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const userId   = typeof window !== 'undefined' ? localStorage.getItem('userId')   : null;
  const userType = typeof window !== 'undefined' ? localStorage.getItem('userType') : null;

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API}/auth/logout`, { method:'POST', headers:{ Authorization:`Bearer ${token}` } });
    } catch (_) {}
    localStorage.clear();
    setIsLoggedIn(false);
    router.push('/Login');
  };

  useEffect(() => {
    if (!userId || !userType) { router.push('/login'); return; }
    const endpoint = userType === 'SUPPORTER' ? `${API}/supporters/${userId}` : `${API}/responsables/${userId}`;
    fetch(endpoint)
      .then(r => r.json())
      .then(d => {
        setUser(d); setForm(d);
        if (d.country) {
          fetch(`${API}/teams/teams/all`).then(r => r.json())
            .then(teams => {
              const t = teams.find(t => t.country === d.country);
              if (t?.imageUrl) setTeamImage(t.imageUrl);
            }).catch(() => {});
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setSaveMsg(''); setSaveErr('');
    try {
      const endpoint = userType === 'SUPPORTER' ? `${API}/supporters/${userId}` : `${API}/responsables/update/${userId}`;
      const res  = await fetch(endpoint, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setSaveErr('Failed to save changes.'); return; }
      setUser(data);
      localStorage.setItem('userName', data.name);
      if (data.country && data.country !== user.country) {
        fetch(`${API}/teams/teams/all`).then(r => r.json()).then(teams => {
          const t = teams.find(t => t.country === data.country);
          if (t?.imageUrl) setTeamImage(t.imageUrl);
        }).catch(() => {});
      }
      setSaveMsg('Profile updated successfully.');
      setEditing(false);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch { setSaveErr('Unable to reach the server.'); }
    finally { setSaving(false); }
  };

  const cancelEdit = () => { setEditing(false); setForm(user); setSaveErr(''); };
  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : '?';

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div style={{ width:48, height:48, border:'3px solid #C1272D', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <p style={{ color:'#C1272D', fontWeight:600, marginBottom:16 }}>Unable to load profile.</p>
      <button onClick={() => router.push('/login')}
              style={{ padding:'10px 24px', background:'#1c1917', color:'#fff', borderRadius:12, fontSize:13, fontWeight:600, border:'none', cursor:'pointer' }}>
        Back to Sign In
      </button>
    </div>
  );

  return (
    <>
      <Head>
        <title>My Profile · MoroccoFan2030</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=Amiri:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #fff; color: #1c1917; -webkit-font-smoothing: antialiased; }
        .syne  { font-family: 'Syne', sans-serif; }
        .serif { font-family: 'Amiri', serif; }

        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:.3} }

        .fu { animation: fadeUp .5s ease-out forwards; opacity:0; }
        .fi { animation: fadeIn .4s ease-out forwards; opacity:0; }
        .d1 { animation-delay:.08s; } .d2 { animation-delay:.16s; }
        .d3 { animation-delay:.24s; } .d4 { animation-delay:.32s; }

        /* Pills */
        .pill       { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;border:1px solid; }
        .pill-red   { background:rgba(193,39,45,.08);  color:#C1272D; border-color:rgba(193,39,45,.25); }
        .pill-green { background:rgba(0,98,51,.10);    color:#006233; border-color:rgba(0,98,51,.30);   }
        .pill-gray  { background:rgba(0,0,0,.04);      color:#78716c; border-color:rgba(0,0,0,.10);     }
        .pill-dark  { background:rgba(28,25,23,.08);   color:#1c1917; border-color:rgba(28,25,23,.15);  }

        /* Stat cards */
        .stat-card { background:#fff; border:1px solid #e7e5e4; border-radius:16px; padding:20px 16px; text-align:center; transition:border-color .2s,box-shadow .2s; }
        .stat-card:hover { border-color:#C1272D; box-shadow:0 4px 20px rgba(193,39,45,.08); }
        .stat-val { font-size:30px; font-weight:800; line-height:1; font-family:'Syne',sans-serif; }
        .stat-lbl { font-size:11px; color:#a8a29e; text-transform:uppercase; letter-spacing:.08em; margin-top:6px; font-weight:500; }

        /* Nav item */
        .nav-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; font-size:13px; font-weight:500; color:#78716c; transition:all .18s; cursor:pointer; border:none; background:none; width:100%; text-align:left; }
        .nav-item:hover { background:#f5f5f4; color:#1c1917; }
        .nav-item.active { background:#f5f5f4; color:#1c1917; font-weight:600; }
        .nav-item .nav-arrow { margin-left:auto; font-size:16px; opacity:0; transition:opacity .18s; }
        .nav-item:hover .nav-arrow { opacity:1; }

        /* Form input */
        .field-wrap { position:relative; display:flex; align-items:center; border-radius:12px; border:1px solid; overflow:hidden; transition:all .2s; }
        .field-wrap.read  { border-color:transparent; background:#fafaf9; }
        .field-wrap.edit  { border-color:#e7e5e4; background:#fff; }
        .field-wrap.edit:focus-within { border-color:#1c1917; box-shadow:0 0 0 2px rgba(28,25,23,.06); }
        .field-input { width:100%; padding:10px 12px 10px 0; background:transparent; font-size:13px; font-family:'Inter',sans-serif; color:#1c1917; outline:none; border:none; }
        .field-input:disabled { color:#57534e; cursor:default; }
        .field-icon { padding:0 10px; color:#a8a29e; flex-shrink:0; }

        /* Info card row */
        .info-row { display:flex; align-items:center; gap:10px; font-size:13px; color:#57534e; padding:8px 0; border-bottom:1px solid #f5f5f4; }
        .info-row:last-child { border-bottom:none; }

        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#e7e5e4; border-radius:3px; }
      `}</style>

      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <header className="relative overflow-hidden" style={{ paddingTop:80 }}>
        {/* Team image as background */}
        <div className="absolute inset-0">
          <img src={teamImage} alt="Team background" className="w-full h-full object-cover object-center"
               onError={e => { e.target.src = '/images/matches.jpg'; }} />
          <div className="absolute inset-0" style={{ background:'linear-gradient(135deg,rgba(45,10,14,.92) 0%,rgba(26,6,8,.85) 55%,rgba(0,98,51,.22) 100%)' }} />
          <div className="absolute inset-0 opacity-[.05] pointer-events-none"
               style={{ backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'140px' }} />
        </div>
        <div className="absolute top-16 left-8 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background:'rgba(193,39,45,.12)' }} />
        <div className="absolute bottom-0 right-8 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background:'rgba(0,98,51,.12)' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 pb-16">
          <div className="flex flex-col md:flex-row md:items-end gap-8">

            {/* Avatar + name */}
            <div className="fu flex items-center gap-6">
              {/* Avatar */}
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:88, height:88, borderRadius:'50%', border:'3px solid rgba(255,255,255,.25)', overflow:'hidden', background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 32px rgba(0,0,0,.4)' }}>
                  {user.imageUrl
                    ? <img src={user.imageUrl} alt={user.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span className="syne" style={{ fontSize:28, fontWeight:800, color:'#fff' }}>{initials}</span>
                  }
                </div>
                {/* Online dot */}
                <div style={{ position:'absolute', bottom:2, right:2, width:20, height:20, borderRadius:'50%', background:'#3dba7a', border:'3px solid rgba(26,6,8,.9)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span className="material-icons" style={{ fontSize:10, color:'#fff' }}>check</span>
                </div>
              </div>

              <div>
                <div className="fu d1 flex flex-wrap items-center gap-2 mb-2">
                  <span className="pill pill-dark" style={{ background:'rgba(255,255,255,.12)', borderColor:'rgba(255,255,255,.2)', color:'rgba(255,255,255,.8)', fontSize:10 }}>
                    <span className="material-icons" style={{ fontSize:11 }}>{userType === 'SUPPORTER' ? 'sports_soccer' : 'stadium'}</span>
                    {userType === 'SUPPORTER' ? 'Fan Account' : 'Manager Account'}
                  </span>
                  {user.country && (
                    <span className="pill" style={{ background:'rgba(255,255,255,.1)', borderColor:'rgba(255,255,255,.15)', color:'rgba(255,255,255,.7)', fontSize:10 }}>
                      <span className="material-icons" style={{ fontSize:11 }}>location_on</span>
                      {user.country}
                    </span>
                  )}
                </div>
                <h1 className="syne" style={{ fontSize:'clamp(26px,5vw,42px)', fontWeight:800, color:'#fff', lineHeight:1, letterSpacing:'-.02em' }}>
                  {user.name}
                </h1>
                <div style={{ fontSize:13, color:'rgba(255,255,255,.5)', marginTop:6 }}>{user.email}</div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="fu d2 flex gap-3 md:ml-auto">
              {userType === 'SUPPORTER' && (
                <div style={{ padding:'14px 20px', borderRadius:14, border:'1px solid rgba(255,255,255,.15)', background:'rgba(255,255,255,.08)', backdropFilter:'blur(8px)', textAlign:'center', minWidth:90 }}>
                  <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,.45)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:4 }}>Points</div>
                  <div className="syne" style={{ fontSize:28, fontWeight:800, color:'#C1272D', lineHeight:1 }}>{(user.totalPoints ?? 0).toLocaleString()}</div>
                </div>
              )}
              <div style={{ padding:'14px 20px', borderRadius:14, border:'1px solid rgba(255,255,255,.15)', background:'rgba(255,255,255,.08)', backdropFilter:'blur(8px)', textAlign:'center', minWidth:80 }}>
                <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,.45)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:4 }}>Age</div>
                <div className="syne" style={{ fontSize:28, fontWeight:800, color:'#fff', lineHeight:1 }}>{user.age ?? '—'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fade to white */}
        <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
             style={{ background:'linear-gradient(to bottom,transparent,#fff)' }} />
      </header>

      {/* ══ STAT CARDS ════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-2 mb-8">
        <div className="fu d2" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:12,marginTop:50 }}>
          {[
            { v: user.totalPoints ?? 0, l:'Points',     c:'#C1272D' },
            { v: user.age ?? '—',       l:'Age',        c:'#1c1917' },
            { v: user.country || '—',   l:'Country',    c:'#006233', small:true },
            { v: userType === 'SUPPORTER' ? 'Fan' : 'Manager', l:'Role', c:'#b45309', small:true },
          ].map(({ v, l, c, small }) => (
            <div key={l} className="stat-card fu d3">
              <div className="stat-val" style={{ color:c, fontSize: small ? 18 : 30 }}>{v}</div>
              <div className="stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ MAIN CONTENT ══════════════════════════════════════════════════ */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="fu d3" style={{ display:'grid', gridTemplateColumns:'1fr', gap:20 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:20 }} className="lg:grid-cols-12">
            <div style={{ display:'contents' }}>

              {/* ── Sidebar ── */}
              <aside style={{ gridColumn:'span 4' }} className="lg:col-span-4 space-y-4">

                {/* Navigation */}
                <div style={{ background:'#fff', border:'1px solid #e7e5e4', borderRadius:16, padding:12, boxShadow:'0 2px 12px -4px rgba(0,0,0,.05)' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'.08em', padding:'4px 8px 10px' }}>Navigation</div>
                  {[
                    { icon:'person',        label:'General Info',    action:() => setActiveTab('general'), tab:'general' },
                    { icon:'sports_soccer', label:'My Predictions',  action:() => router.push('/Prediction') },
                    { icon:'favorite',      label:'Favorites',       action:() => router.push('/Favorite') },
                    { icon:'calendar_today',label:'Itineraries',     action:() => router.push('/itineraries') },
                    { icon:'directions',label:'Trajet',     action:() => router.push('/Routes') },
                  ].map(({ icon, label, action, tab }) => (
                    <button key={label} onClick={action}
                            className={`nav-item ${tab && activeTab === tab ? 'active' : ''}`}>
                      <span className="material-icons" style={{ fontSize:18, color: tab && activeTab === tab ? '#C1272D' : '#a8a29e' }}>{icon}</span>
                      {label}
                      <span className="material-icons nav-arrow" style={{ color:'#a8a29e' }}>chevron_right</span>
                    </button>
                  ))}
                </div>

                {/* Account info summary */}
                <div style={{ background:'#fff', border:'1px solid #e7e5e4', borderRadius:16, padding:'16px 20px', boxShadow:'0 2px 12px -4px rgba(0,0,0,.05)' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 }}>Account Info</div>
                  {[
                    { icon:'alternate_email', val: user.email || '—' },
                    { icon:'phone',           val: user.phone || 'No phone' },
                    { icon:'public',          val: user.country || 'No country' },
                  ].map(({ icon, val }) => (
                    <div key={icon} className="info-row">
                      <span className="material-icons" style={{ fontSize:16, color:'#a8a29e', flexShrink:0 }}>{icon}</span>
                      <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </aside>

              {/* ── Main form ── */}
              <div style={{ gridColumn:'span 8' }} className="lg:col-span-8 space-y-6">

                <div style={{ background:'#fff', border:'1px solid #e7e5e4', borderRadius:18, overflow:'hidden', boxShadow:'0 2px 12px -4px rgba(0,0,0,.05)' }}>

                  {/* Card header — dark stripe like match cards */}
                  <div style={{ background:'linear-gradient(to right,#2d0a0e,#1a0608)', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                      <div className="syne" style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Personal Information</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,.45)', marginTop:2 }}>Manage your personal details</div>
                    </div>

                    {!editing ? (
                      <button onClick={() => { setEditing(true); setSaveMsg(''); setSaveErr(''); }}
                              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:99, border:'1px solid rgba(255,255,255,.2)', background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.85)', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .2s' }}>
                        <span className="material-icons" style={{ fontSize:14 }}>edit</span>
                        Edit Profile
                      </button>
                    ) : (
                      <div style={{ display:'flex', gap:8 }}>
                        <button onClick={cancelEdit}
                                style={{ padding:'7px 14px', borderRadius:99, border:'1px solid rgba(255,255,255,.15)', background:'transparent', color:'rgba(255,255,255,.6)', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                          Cancel
                        </button>
                        <button onClick={handleSave} disabled={saving}
                                style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:99, border:'none', background:'#C1272D', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', opacity: saving ? .7 : 1 }}>
                          <span className="material-icons" style={{ fontSize:14 }}>{saving ? 'hourglass_empty' : 'save'}</span>
                          {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Notifications */}
                  {saveMsg && (
                    <div style={{ margin:'16px 24px 0', padding:'10px 14px', background:'rgba(61,186,122,.1)', border:'1px solid rgba(61,186,122,.25)', borderRadius:12, display:'flex', alignItems:'center', gap:8, fontSize:12, fontWeight:500, color:'#006233' }}>
                      <span className="material-icons" style={{ fontSize:16 }}>check_circle</span>
                      {saveMsg}
                    </div>
                  )}
                  {saveErr && (
                    <div style={{ margin:'16px 24px 0', padding:'10px 14px', background:'rgba(193,39,45,.08)', border:'1px solid rgba(193,39,45,.2)', borderRadius:12, display:'flex', alignItems:'center', gap:8, fontSize:12, fontWeight:500, color:'#C1272D' }}>
                      <span className="material-icons" style={{ fontSize:16 }}>error_outline</span>
                      {saveErr}
                    </div>
                  )}

                  {/* Fields */}
                  <div style={{ padding:24, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                    {[
                      { label:'Full Name',     name:'name',    type:'text',   icon:'person',        full:false },
                      { label:'Email Address', name:'email',   type:'email',  icon:'mail_outline',  full:false },
                      { label:'Phone Number',  name:'phone',   type:'tel',    icon:'phone',         full:false },
                      { label:'Country',       name:'country', type:'text',   icon:'public',        full:false },
                      { label:'Age',           name:'age',     type:'number', icon:'cake',          full:false },
                      ...(userType === 'RESPONSABLE' ? [{ label:'Image URL', name:'imageUrl', type:'url', icon:'image', full:true }] : []),
                    ].map(({ label, name, type, icon, full }) => (
                      <div key={name} style={{ gridColumn: full ? 'span 2' : 'span 1' }}>
                        <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>{label}</label>
                        <div className={`field-wrap ${editing ? 'edit' : 'read'}`}>
                          <span className="material-icons field-icon" style={{ fontSize:17 }}>{icon}</span>
                          <input
                            name={name} type={type}
                            value={form[name] ?? ''}
                            onChange={handleChange}
                            disabled={!editing}
                            className="field-input"
                            placeholder={editing ? `Enter ${label.toLowerCase()}…` : '—'}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sign out zone */}
                <div style={{ padding:20, border:'1px solid rgba(193,39,45,.2)', borderRadius:16, background:'rgba(193,39,45,.03)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:'#1c1917', marginBottom:3 }}>Sign out</div>
                    <div style={{ fontSize:12, color:'#a8a29e' }}>End your current session securely.</div>
                  </div>
                  <button onClick={handleLogout}
                          style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'9px 18px', borderRadius:99, border:'1px solid rgba(193,39,45,.3)', background:'#fff', color:'#C1272D', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all .2s', flexShrink:0 }}
                          onMouseEnter={e => { e.currentTarget.style.background='#C1272D'; e.currentTarget.style.color='#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.color='#C1272D'; }}>
                    <span className="material-icons" style={{ fontSize:16 }}>logout</span>
                    Sign Out
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Grid fix for sidebar */}
      <style jsx>{`
        @media (min-width: 1024px) {
          .lg\\:col-span-4 { grid-column: span 4; }
          .lg\\:col-span-8 { grid-column: span 8; }
          .lg\\:grid-cols-12 { grid-template-columns: repeat(12, 1fr); }
        }
      `}</style>

      <Footer />
    </>
  );
}