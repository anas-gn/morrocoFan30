import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const API_BASE = 'https://anas-gana1-fandb-backend.hf.space/api/auth';
const TEAMS_API = 'https://anas-gana1-fandb-backend.hf.space/api/teams/teams/all';

export default function Login() {
  const router = useRouter();
  const [mode, setMode]       = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm]       = useState({ name:'', age:'', email:'', password:'', phone:'', country:'' });
  const [teams, setTeams]     = useState([]);

  useEffect(() => {
    fetch(TEAMS_API).then(r => r.ok ? r.json() : []).then(setTeams).catch(() => {});
  }, []);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const tryLogin = async (slug, body) => {
    const res = await fetch(`${API_BASE}/${slug}/login`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body),
    });
    return { ok:res.ok, data:await res.json() };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'login') {
        const body = { email:form.email, password:form.password };
        let result = await tryLogin('supporter', body);
        if (!result.ok) result = await tryLogin('responsable', body);
        if (!result.ok) { setError(result.data.error || 'Incorrect email or password'); return; }
        const d = result.data;
        localStorage.setItem('token', d.token);   localStorage.setItem('userType', d.type);
        localStorage.setItem('userId', d.id);     localStorage.setItem('supporterId', d.id);
        localStorage.setItem('userName', d.name); localStorage.setItem('userEmail', d.email);
        window.dispatchEvent(new Event('userLoggedIn'));
        setSuccess(`Welcome back, ${d.name}!`);
        setTimeout(() => { if (d.type === 'SUPPORTER') router.push('/Acceuil'); else router.push('/Dashboard'); }, 800);
      } else {
        const body = { name:form.name, age:form.age?Number(form.age):undefined, email:form.email, password:form.password, phone:form.phone, country:form.country };
        const res = await fetch(`${API_BASE}/supporter/register`, {
          method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body),
        });
        const d = await res.json();
        if (!res.ok) { setError(d.error || 'An error occurred'); return; }
        localStorage.setItem('token', d.token);   localStorage.setItem('userType', d.type);
        localStorage.setItem('userId', d.id);     localStorage.setItem('supporterId', d.id);
        localStorage.setItem('userName', d.name); localStorage.setItem('userEmail', d.email);
        window.dispatchEvent(new Event('userLoggedIn'));
        setSuccess(`Welcome, ${d.name}!`);
        setTimeout(() => router.push('/Acceuil'), 800);
      }
    } catch { setError('Unable to reach the server'); }
    finally { setLoading(false); }
  };

  const switchMode = (m) => { setMode(m); setError(''); setSuccess(''); };

  return (
    <>
      <Head>
        <title>{mode === 'login' ? 'Sign In' : 'Sign Up'} · MoroccoFan2030</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=Amiri:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        .syne  { font-family: 'Syne', sans-serif; }
        .serif { font-family: 'Amiri', serif; }

        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes glow    { 0%,100%{ text-shadow:0 0 28px rgba(193,39,45,.55),0 0 56px rgba(193,39,45,.22); } 50%{ text-shadow:0 0 52px rgba(193,39,45,.9),0 0 96px rgba(193,39,45,.38); } }

        .fu      { animation: fadeUp .65s ease-out both; }
        .d1      { animation-delay: .08s; }
        .d2      { animation-delay: .16s; }
        .animate-glow { animation: glow 3.5s ease-in-out infinite; }

        /* Pills */
        .pill { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;border:1px solid; }
        .pill-red   { background:rgba(193,39,45,.12); color:#C1272D; border-color:rgba(193,39,45,.3); }
        .pill-green { background:rgba(0,98,51,.15);   color:#3dba7a; border-color:rgba(0,98,51,.3);   }
      `}</style>

      <div style={{ minHeight:'100vh', display:'flex' }}>

        {/* ══ LEFT PANEL — dark hero ══════════════════════════════════════ */}
        <div className="hidden lg:flex" style={{ width:'46%', flexDirection:'column', justifyContent:'space-between', position:'relative', overflow:'hidden', padding:'52px 50px' }}>
          {/* Background photo */}
          <div style={{ position:'absolute', inset:0, backgroundImage:"url('https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=1400&auto=format&fit=crop')", backgroundSize:'cover', backgroundPosition:'center' }} />
          {/* Dark overlay */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(45,10,14,.95) 0%,rgba(26,6,8,.88) 55%,rgba(0,98,51,.25) 100%)' }} />
          {/* Moroccan pattern */}
          <div style={{ position:'absolute', inset:0, opacity:.055, backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'160px' }} />
          {/* Glows */}
          <div style={{ position:'absolute', top:-60, left:-60, width:360, height:360, borderRadius:'50%', background:'#C1272D', filter:'blur(140px)', opacity:.26 }} />
          <div style={{ position:'absolute', bottom:0, right:-40, width:280, height:280, borderRadius:'50%', background:'#006233', filter:'blur(120px)', opacity:.18 }} />

          {/* Logo */}
          <div style={{ position:'relative', zIndex:10, display:'flex', alignItems:'center', gap:14 }}>
            <img src="/images/logo.png" alt="Logo" style={{ width:44, height:44, objectFit:'contain' }} />
            <div>
              <div className="syne" style={{ color:'#fff', fontWeight:800, fontSize:16, letterSpacing:'.05em' }}>MoroccoFan2030</div>
              <div style={{ fontFamily:'Amiri,serif', color:'rgba(255,255,255,.45)', fontSize:13 }}>المغرب ٢٠٣٠</div>
            </div>
          </div>

          {/* Headline */}
          <div style={{ position:'relative', zIndex:10 }}>
            <div style={{ width:48, height:4, borderRadius:4, background:'linear-gradient(to right,#C1272D,#006233)', marginBottom:28 }} />
            <h1 className="syne animate-glow" style={{ fontSize:54, lineHeight:1.1, color:'#fff', fontWeight:800, marginBottom:20, letterSpacing:'-.02em' }}>
              The adventure<br />starts{' '}
              <span style={{ color:'#C1272D' }} className="serif italic">here.</span>
            </h1>
            <p style={{ color:'rgba(255,255,255,.55)', fontSize:14, lineHeight:1.9, maxWidth:300 }}>
              Join thousands of fans and experience the 2030 World Cup at the heart of Morocco.
            </p>

            {/* Pill badges */}
            <div style={{ display:'flex', gap:8, marginTop:20 }}>
              <span className="pill pill-red"> 64 Matches</span>
              <span className="pill pill-green"> 6 Stades</span>
            </div>
          </div>

          {/* Stats */}
          <div style={{ position:'relative', zIndex:10, display:'flex', gap:36 }}>
            {[['32','Teams'],['6','Stadiums'],['64','Matches']].map(([n,l]) => (
              <div key={l}>
                <div className="syne" style={{ fontSize:40, fontWeight:800, color:'#fff', lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.12em', marginTop:5, fontWeight:600 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ RIGHT PANEL — form ══════════════════════════════════════════ */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'#fafaf9', padding:'40px 24px',
                      backgroundImage:'radial-gradient(#e7e5e4 1px,transparent 1px)', backgroundSize:'24px 24px' }}>
          <div className="fu" style={{ width:'100%', maxWidth:420 }}>

            {/* Mode toggle tabs */}
            <div style={{ display:'flex', gap:4, padding:6, background:'#f5f5f4', borderRadius:16, border:'1px solid #e7e5e4', marginBottom:32 }}>
              {[['login','Sign In'],['register','Sign Up']].map(([m,label]) => (
                <button key={m} onClick={() => switchMode(m)}
                        style={{ flex:1, padding:'10px', borderRadius:12, fontWeight:700, fontSize:13,
                                 fontFamily:'Syne,sans-serif', letterSpacing:'.02em', border:'none', cursor:'pointer', transition:'all .18s',
                                 background: mode===m ? 'linear-gradient(to right,#2d0a0e,#1a0608)' : 'transparent',
                                 color: mode===m ? '#fff' : '#78716c' }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Title */}
            <div className="fu d1" style={{ marginBottom:28 }}>
              <h2 className="syne" style={{ fontSize:32, color:'#1c1917', fontWeight:800, lineHeight:1.1, marginBottom:6, letterSpacing:'-.01em' }}>
                {mode==='login' ? 'Welcome back!' : 'Create account'}
              </h2>
              <p style={{ color:'#a8a29e', fontSize:13, fontWeight:400 }}>
                {mode==='login' ? 'Sign in to your MoroccoFan2030 account' : 'Join the MoroccoFan2030 community'}
              </p>
            </div>

            {/* Alerts */}
            {error && (
              <div className="fu" style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:12, marginBottom:20,
                                           background:'rgba(193,39,45,.06)', color:'#C1272D', border:'1px solid rgba(193,39,45,.2)', fontSize:13, fontWeight:500 }}>
                <span className="material-icons" style={{ fontSize:17, flexShrink:0 }}>error_outline</span>
                {error}
              </div>
            )}
            {success && (
              <div className="fu" style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:12, marginBottom:20,
                                           background:'rgba(0,98,51,.07)', color:'#006233', border:'1px solid rgba(0,98,51,.2)', fontSize:13, fontWeight:500 }}>
                <span className="material-icons" style={{ fontSize:17, flexShrink:0 }}>check_circle_outline</span>
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="fu d2">
              <div style={{ display:'flex', flexDirection:'column', gap:22 }}>

                {mode==='register' && (<>
                  <Field label="Full Name" name="name"  type="text"   icon="badge" value={form.name}  onChange={handleChange} required />
                  <div style={{ display:'flex', gap:14 }}>
                    <Field label="Age"   name="age"   type="number" icon="cake"  value={form.age}   onChange={handleChange} />
                    <Field label="Phone" name="phone" type="tel"    icon="phone" value={form.phone}  onChange={handleChange} />
                  </div>
                  <SelectField label="Country / Team" name="country" icon="public" value={form.country} onChange={handleChange} options={teams} required />
                </>)}

                <Field label="Email Address" name="email"    type="email"    icon="alternate_email" value={form.email}    onChange={handleChange} required />
                <Field label="Password"      name="password" type="password" icon="lock_outline"    value={form.password} onChange={handleChange} required />

                {/* Submit */}
                <button type="submit" disabled={loading}
                        style={{ marginTop:6, width:'100%', padding:'14px', borderRadius:14, border:'none', fontFamily:'Syne,sans-serif',
                                 fontSize:15, fontWeight:800, letterSpacing:'.03em', cursor:loading?'not-allowed':'pointer', transition:'all .18s',
                                 background: loading ? '#e7e5e4' : 'linear-gradient(135deg,#C1272D,#a01e23)',
                                 color: loading ? '#a8a29e' : '#fff',
                                 boxShadow: loading ? 'none' : '0 8px 24px rgba(193,39,45,.32)' }}
                        onMouseEnter={e => { if(!loading) e.currentTarget.style.transform='translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; }}>
                  {loading ? (
                    <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      <div style={{ width:16, height:16, border:'2px solid #a8a29e', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
                      Loading…
                    </span>
                  ) : mode==='login' ? (
                    <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      Sign In <span className="material-icons" style={{ fontSize:18 }}>arrow_forward</span>
                    </span>
                  ) : (
                    <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      Create Account <span className="material-icons" style={{ fontSize:18 }}>how_to_reg</span>
                    </span>
                  )}
                </button>
              </div>
            </form>

            {/* Switch link */}
            <p style={{ marginTop:24, textAlign:'center', fontSize:13, color:'#78716c' }}>
              {mode==='login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button onClick={() => switchMode(mode==='login'?'register':'login')}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'#C1272D', fontWeight:700, fontFamily:'Syne,sans-serif', fontSize:13 }}>
                {mode==='login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>

            {/* Footer */}
            <p style={{ marginTop:20, textAlign:'center', fontSize:11, color:'#d6d3d1' }}>
              © 2030 MoroccoFan2030 ·{' '}
              <span style={{ fontFamily:'Amiri,serif', color:'rgba(0,98,51,.6)', fontStyle:'italic' }}>المغرب 2030</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Field — bottom line style ─────────────────────────────────────── */
function Field({ label, name, type, icon, value, onChange, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ flex:1, minWidth:0 }}>
      <label style={{ display:'block', fontSize:10, fontWeight:700, color:focused?'#C1272D':'#a8a29e',
                      textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, fontFamily:'Syne,sans-serif', transition:'color .2s' }}>
        {label}
      </label>
      <div style={{ display:'flex', alignItems:'center', gap:10, borderBottom:`2px solid ${focused?'#C1272D':'#e7e5e4'}`, paddingBottom:10, transition:'border-color .2s' }}>
        <span className="material-icons" style={{ fontSize:18, color:focused?'#C1272D':'#d6d3d1', transition:'color .2s', flexShrink:0 }}>{icon}</span>
        <input name={name} type={type} value={value} onChange={onChange} required={required}
               onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
               placeholder={type==='email'?'your@email.com':type==='password'?'••••••••':''}
               style={{ flex:1, border:'none', outline:'none', background:'transparent', color:'#1c1917', fontFamily:'Inter,sans-serif', fontSize:14, padding:0 }} />
      </div>
    </div>
  );
}

/* ── SelectField — country/team dropdown ──────────────────────────── */
function SelectField({ label, name, icon, value, onChange, options, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ flex:1, minWidth:0 }}>
      <label style={{ display:'block', fontSize:10, fontWeight:700, color:focused?'#C1272D':'#a8a29e',
                      textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, fontFamily:'Syne,sans-serif', transition:'color .2s' }}>
        {label}
      </label>
      <div style={{ display:'flex', alignItems:'center', gap:10, borderBottom:`2px solid ${focused?'#C1272D':'#e7e5e4'}`, paddingBottom:10, transition:'border-color .2s' }}>
        <span className="material-icons" style={{ fontSize:18, color:focused?'#C1272D':'#d6d3d1', transition:'color .2s', flexShrink:0 }}>{icon}</span>
        <select name={name} value={value} onChange={onChange} required={required}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                style={{ flex:1, border:'none', outline:'none', background:'transparent', color:value?'#1c1917':'#a8a29e', fontFamily:'Inter,sans-serif', fontSize:14, padding:0, cursor:'pointer' }}>
          <option value="" disabled>Select your country / team</option>
          {options.map(t => <option key={t.id} value={t.country}>{t.country}</option>)}
        </select>
      </div>
    </div>
  );
}