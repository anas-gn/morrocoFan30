import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

const API = 'http://localhost:3309/api';

export default function Profile() {
  const router = useRouter();

  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');
  const [form, setForm]       = useState({});
  const [activeTab, setActiveTab] = useState('general');
  const [teamImage, setTeamImage] = useState('/images/matches.jpg');

  const userId   = typeof window !== 'undefined' ? localStorage.getItem('userId')   : null;
  const userType = typeof window !== 'undefined' ? localStorage.getItem('userType') : null;
 const handleLogout = async () => {
    const token = localStorage.getItem("token");

    try {
      await fetch("http://localhost:3309/api/auth/logout", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (_) { /* ignore */ }

    localStorage.clear();
    setIsLoggedIn(false);
    router.push("/Login");
  };
   const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    if (!userId || !userType) { router.push('/login'); return; }
    const endpoint = userType === 'SUPPORTER'
      ? `${API}/supporters/${userId}`
      : `${API}/responsables/${userId}`;
    fetch(endpoint)
      .then(r => r.json())
      .then(d => { 
        setUser(d); 
        setForm(d); 
        // Fetch team image based on user's country
        if (d.country) {
          fetch(`${API}/teams/teams/all`)
            .then(res => res.json())
            .then(teams => {
              const team = teams.find(t => t.country === d.country);
              if (team && team.imageUrl) {
                setTeamImage(team.imageUrl);
              }
            })
            .catch(() => {});
        }
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setSaveMsg(''); setSaveErr('');
    try {
      const endpoint = userType === 'SUPPORTER'
        ? `${API}/supporters/${userId}`
        : `${API}/responsables/update/${userId}`;
      const res  = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setSaveErr('Failed to save changes.'); return; }
      setUser(data);
      localStorage.setItem('userName', data.name);
      
      // Update team image if country changed
      if (data.country && data.country !== user.country) {
        fetch(`${API}/teams/teams/all`)
          .then(res => res.json())
          .then(teams => {
            const team = teams.find(t => t.country === data.country);
            if (team && team.imageUrl) {
              setTeamImage(team.imageUrl);
            }
          })
          .catch(() => {});
      }
      
      setSaveMsg('Profile updated successfully.');
      setEditing(false);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch { setSaveErr('Unable to reach the server.'); }
    finally { setSaving(false); }
  };

  const cancelEdit = () => {
    setEditing(false);
    setForm(user);
    setSaveErr('');
  };

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-stone-50">
      <img src="/images/logo.png" alt="Loading" className="w-16 h-16 animate-pulse" />
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
      <p className="text-red-600 font-semibold mb-4">Unable to load profile.</p>
      <button onClick={() => router.push('/login')} className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-semibold">Back to Sign In</button>
    </div>
  );

  return (
    <>
      <Head>
        <title>My Profile · MoroccoFan2030</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        :root { --font-primary:'Cairo',sans-serif; --font-ui:'Inter',sans-serif; }
        body  { font-family:var(--font-ui); background:#FAFAFA; color:#171717; -webkit-font-smoothing:antialiased; }
        h1,h2,h3,.brand-font { font-family:var(--font-primary); }
        .serif-font { font-family:'Amiri',serif; }

        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#e5e5e5; border-radius:3px; }

        @keyframes fadeIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fade-in { animation:fadeIn 0.5s ease-out forwards; }

        .input-reading {
          background:#fafaf9;
          border-color:transparent;
        }
        .input-editing {
          background:#ffffff;
          border-color:#e7e5e4;
        }
        .input-editing:focus-within {
          border-color:#171717;
          box-shadow:0 0 0 1px #171717;
        }

        input:disabled {
          background:transparent;
          color:#57534e;
          cursor:default;
        }
      `}</style>

      <Navbar />

      {/* ══════ HERO — dark image header, team.imageUrl as background ══════ */}
      <header className="relative w-full pt-28 pb-0 overflow-hidden">
        {/* Background = team's imageUrl based on user's country */}
        <div className="absolute inset-0 z-0">
          <img
            src={teamImage}
            alt="Team background"
            className="w-full h-full object-cover object-center"
            onError={e => { e.target.src = '/images/matches.jpg'; }}
          />
          {/* Strong dark overlay so text stays readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/85" />
          {/* Subtle Moroccan pattern */}
          <div className="absolute inset-0 opacity-[0.05]"
               style={{ backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'140px' }} />
        </div>

        {/* Header content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end gap-6 border-b border-white/10 pb-8">

            {/* Avatar + name */}
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-full border-2 border-white/20 shadow-2xl overflow-hidden bg-stone-800 flex items-center justify-center">
                  {user.imageUrl
                    ? <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                    : <span className="text-3xl font-black text-white brand-font">{initials}</span>
                  }
                </div>
                <div className="absolute bottom-0.5 right-0.5 w-6 h-6 bg-emerald-500 border-[3px] border-black rounded-full flex items-center justify-center">
                  <span className="material-icons text-white" style={{fontSize:'12px'}}>check</span>
                </div>
              </div>

              <div className="pb-1">
                <h1 className="text-3xl font-semibold text-white tracking-tight leading-none mb-2 brand-font">
                  {user.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-white/80">
                    <span className="material-icons" style={{fontSize:'13px'}}>
                      {userType === 'SUPPORTER' ? 'sports_soccer' : 'stadium'}
                    </span>
                    {userType === 'SUPPORTER' ? 'Fan Account' : 'Manager Account'}
                  </span>
                  {user.country && (
                    <span className="flex items-center gap-1.5">
                      <span className="material-icons" style={{fontSize:'14px'}}>location_on</span>
                      {user.country}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 md:ml-auto self-start md:self-end mb-1">
              {userType === 'SUPPORTER' && (
                <div className="px-5 py-2.5 rounded-xl border border-white/15 bg-white/10 backdrop-blur flex flex-col items-center min-w-[90px]">
                  <span className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">Points</span>
                  <span className="text-2xl font-bold text-[#C1272D] brand-font">{(user.totalPoints ?? 0).toLocaleString()}</span>
                </div>
              )}
              <div className="px-5 py-2.5 rounded-xl border border-white/15 bg-white/10 backdrop-blur flex flex-col items-center min-w-[70px]">
                <span className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">Age</span>
                <span className="text-2xl font-bold text-white brand-font">{user.age ?? '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade into page bg */}
        <div className="relative z-10 h-10 bg-gradient-to-b from-transparent to-[#FAFAFA]" />
      </header>

      {/* ══════ MAIN — sidebar + form (HTML design) ══════ */}
      <main className="flex-grow px-4 sm:px-6 pb-16">
        <div className="max-w-5xl mx-auto fade-in">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ── Sidebar ── */}
            <aside className="lg:col-span-4 space-y-4">

              {/* Nav */}
              <nav className="flex flex-col gap-1">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'general' ? 'text-stone-900 bg-stone-100' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <span className="material-icons text-base">person</span>
                  General Info
                </button>

                <button
                  onClick={() => router.push('/predictions')}
                  className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-icons text-base">sports_soccer</span>
                    My Predictions
                  </div>
                  <span className="material-icons text-sm opacity-0 group-hover:opacity-100 transition-opacity text-stone-400">arrow_forward</span>
                </button>

                <button
                  onClick={() => router.push('/favorites')}
                  className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-icons text-base">favorite</span>
                    Favorites
                  </div>
                  <span className="material-icons text-sm opacity-0 group-hover:opacity-100 transition-opacity text-stone-400">arrow_forward</span>
                </button>
              </nav>

              {/* Info summary card */}
              <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-3 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">Account Info</p>
                {[
                  { icon:'alternate_email', val: user.email },
                  { icon:'phone', val: user.phone || 'No phone' },
                  { icon:'public', val: user.country || 'No country' },
                ].map(({ icon, val }) => (
                  <div key={icon} className="flex items-center gap-2.5 text-sm text-stone-600">
                    <span className="material-icons text-stone-400" style={{fontSize:'16px'}}>{icon}</span>
                    <span className="truncate">{val}</span>
                  </div>
                ))}
              </div>
            </aside>

            {/* ── Main form ── */}
            <div className="lg:col-span-8 space-y-6">

              <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-stone-200 overflow-hidden">

                {/* Card header */}
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/30">
                  <div>
                    <h2 className="text-base font-semibold text-stone-900">Personal Information</h2>
                    <p className="text-xs text-stone-500 mt-0.5">Manage your personal details</p>
                  </div>

                  {!editing ? (
                    <button
                      onClick={() => { setEditing(true); setSaveMsg(''); setSaveErr(''); }}
                      className="text-xs font-medium bg-white border border-stone-200 hover:border-stone-300 text-stone-700 px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-2 hover:shadow active:scale-95"
                    >
                      <span className="material-icons text-stone-400" style={{fontSize:'15px'}}>edit</span>
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={cancelEdit}
                        className="text-xs font-medium text-stone-500 hover:text-stone-800 px-3 py-1.5 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="text-xs font-medium bg-stone-900 text-white px-4 py-1.5 rounded-lg shadow-sm hover:bg-stone-800 transition-all flex items-center gap-2 disabled:opacity-60"
                      >
                        <span className="material-icons" style={{fontSize:'14px'}}>
                          {saving ? 'hourglass_empty' : 'save'}
                        </span>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                {saveMsg && (
                  <div className="mx-6 mt-5 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium rounded-lg flex items-center gap-2">
                    <span className="material-icons text-base">check_circle</span>
                    {saveMsg}
                  </div>
                )}
                {saveErr && (
                  <div className="mx-6 mt-5 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-lg flex items-center gap-2">
                    <span className="material-icons text-base">error_outline</span>
                    {saveErr}
                  </div>
                )}

                {/* Fields */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label:'Full Name',     name:'name',    type:'text',   icon:'person' },
                    { label:'Email Address', name:'email',   type:'email',  icon:'mail_outline' },
                    { label:'Phone Number',  name:'phone',   type:'tel',    icon:'phone' },
                    { label:'Country',       name:'country', type:'text',   icon:'public' },
                    { label:'Age',           name:'age',     type:'number', icon:'cake' },
                    ...(userType === 'RESPONSABLE'
                      ? [{ label:'Image URL', name:'imageUrl', type:'url', icon:'image', full:true }]
                      : []),
                  ].map(({ label, name, type, icon, full }) => (
                    <div key={name} className={full ? 'col-span-2' : 'col-span-2 md:col-span-1'}>
                      <label className="block text-xs font-medium text-stone-500 mb-1.5 ml-1">{label}</label>
                      <div className={`relative flex items-center rounded-lg border overflow-hidden transition-all ${
                        editing ? 'bg-white border-stone-200 focus-within:border-stone-900 focus-within:shadow-[0_0_0_1px_#171717]' : 'bg-stone-50 border-transparent'
                      }`}>
                        <div className="pl-3 text-stone-400 flex items-center pointer-events-none flex-shrink-0">
                          <span className="material-icons" style={{fontSize:'18px'}}>{icon}</span>
                        </div>
                        <input
                          name={name}
                          type={type}
                          value={form[name] ?? ''}
                          onChange={handleChange}
                          disabled={!editing}
                          className="w-full py-2.5 pl-2 pr-3 bg-transparent text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sign out */}
              <div className="pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between p-5 rounded-xl border border-red-100 bg-red-50/40">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">Sign out</p>
                    <p className="text-xs text-stone-500 mt-0.5">End your current session securely.</p>
                  </div>
                   <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-all group">
              <svg className="w-5 h-5 text-stone-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium text-red-600">Sign Out</span>
            </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}