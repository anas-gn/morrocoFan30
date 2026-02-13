import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const API_BASE = 'http://localhost:3309/api/auth';
const TEAMS_API = 'http://localhost:3309/api/teams/teams/all';

export default function Login() {
  const router  = useRouter();
  const [mode, setMode]       = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm]       = useState({ name:'', age:'', email:'', password:'', phone:'', country:'' });
  const [teams, setTeams]     = useState([]);

  // Récupérer les équipes participantes
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch(TEAMS_API);
        if (res.ok) {
          const data = await res.json();
          setTeams(data);
        }
      } catch (err) {
        console.error('Failed to fetch teams:', err);
      }
    };
    fetchTeams();
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const tryLogin = async (slug, body) => {
    const res = await fetch(`${API_BASE}/${slug}/login`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body),
    });
    return { ok: res.ok, data: await res.json() };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'login') {
        const body = { email: form.email, password: form.password };
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
        const body = {
          name: form.name, age: form.age ? Number(form.age) : undefined,
          email: form.email, password: form.password, phone: form.phone, country: form.country,
        };
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
        {/* Cairo for body, Playfair Display for headings */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Aref+Ruqaa:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Cairo', sans-serif; }

        /* heading font */
        .heading-font    { font-family:'Playfair Display', serif; }
        .decorative-font { font-family:'Aref Ruqaa', serif; }

        @keyframes fade-in-up {
          from { opacity:0; transform:translateY(26px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes glow {
          0%,100% { text-shadow:0 0 28px rgba(193,39,45,0.55),0 0 56px rgba(193,39,45,0.22); }
          50%     { text-shadow:0 0 52px rgba(193,39,45,0.9),0 0 96px rgba(193,39,45,0.38); }
        }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }

        .animate-fade-in-up { animation:fade-in-up 0.75s ease-out both; }
        .animate-glow       { animation:glow 3.5s ease-in-out infinite; }

        .btn-submit {
          width:100%; padding:15px; border-radius:14px; border:none;
          font-family:'Cairo',sans-serif; font-size:16px; font-weight:700;
          letter-spacing:0.04em; cursor:pointer;
          transition:transform 0.15s, box-shadow 0.15s;
        }
        .btn-submit:not(:disabled):hover  { transform:translateY(-2px); }
        .btn-submit:not(:disabled):active { transform:translateY(0); }
      `}</style>

      <div style={{ minHeight:'100vh', display:'flex' }}>

        {/* ══════ LEFT — Morocco photo ══════ */}
        <div
          className="hidden lg:flex"
          style={{
            width:'46%', flexDirection:'column', justifyContent:'space-between',
            position:'relative', overflow:'hidden', padding:'52px 50px',
          }}
        >
          {/* Photo */}
          <div style={{
            position:'absolute', inset:0,
            backgroundImage:"url('https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=1400&auto=format&fit=crop')",
            backgroundSize:'cover', backgroundPosition:'center',
          }} />
          {/* Dark overlay */}
          <div style={{
            position:'absolute', inset:0,
            background:'linear-gradient(155deg,rgba(8,4,4,0.90) 0%,rgba(18,6,5,0.82) 50%,rgba(34,12,10,0.76) 100%)',
          }} />
          {/* Zellige pattern */}
          <div style={{
            position:'absolute', inset:0, opacity:0.055,
            backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')",
            backgroundSize:'160px',
          }} />
          {/* Ambient glows only (no moving balls) */}
          <div style={{ position:'absolute', top:'-60px', left:'-60px', width:'360px', height:'360px', borderRadius:'50%', background:'#C1272D', filter:'blur(140px)', opacity:0.26 }} />
          <div style={{ position:'absolute', bottom:'0', right:'-40px', width:'280px', height:'280px', borderRadius:'50%', background:'#006233', filter:'blur(120px)', opacity:0.16 }} />

          {/* Logo */}
          <div style={{ position:'relative', zIndex:10, display:'flex', alignItems:'center', gap:'14px' }}>
            <img src="/images/logo.png" alt="Logo" style={{ width:'46px', height:'46px', objectFit:'contain' }} />
            <div>
              <div style={{ color:'#fff', fontWeight:800, fontSize:'17px', letterSpacing:'0.05em', fontFamily:'Cairo,sans-serif' }}>
                MoroccoFan2030
              </div>
              <div className="decorative-font" style={{ color:'#9ca3af', fontSize:'13px' }}>المغرب ٢٠٣٠</div>
            </div>
          </div>

          {/* Headline */}
          <div style={{ position:'relative', zIndex:10 }}>
            <div style={{ width:'48px', height:'4px', borderRadius:'4px', background:'#C1272D', marginBottom:'26px' }} />
            <h1 className="heading-font animate-glow" style={{
              fontSize:'52px', lineHeight:1.18, color:'#fff', fontWeight:900, marginBottom:'20px',
            }}>
              The adventure<br />starts<br />
              <span style={{ color:'#C1272D', fontStyle:'italic' }}>here.</span>
            </h1>
            <p style={{ color:'#d6d3d1', fontSize:'15px', lineHeight:1.85, maxWidth:'300px', fontFamily:'Cairo,sans-serif' }}>
              Join thousands of fans and experience the 2030 World Cup at the heart of Morocco.
            </p>
          </div>

          {/* Stats */}
          <div style={{ position:'relative', zIndex:10, display:'flex', gap:'38px' }}>
            {[['32','Teams'],['6','Stadiums'],['64','Matches']].map(([n,l])=>(
              <div key={l}>
                <div className="heading-font" style={{ fontSize:'42px', fontWeight:700, color:'#fff', lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:'10px', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.14em', marginTop:'5px', fontFamily:'Cairo,sans-serif' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════ RIGHT — form ══════ */}
        <div style={{
          flex:1, display:'flex', alignItems:'center', justifyContent:'center',
          background:'#fafaf9', padding:'40px 24px',
          backgroundImage:'radial-gradient(#e7e5e4 1px, transparent 1px)',
          backgroundSize:'24px 24px',
        }}>
          <div className="animate-fade-in-up" style={{ width:'100%', maxWidth:'420px' }}>

            <div style={{ padding:'38px 36px' }}>

              {/* Title */}
              <div style={{ marginBottom:'34px' }}>
                <h2 className="heading-font" style={{
                  fontSize:'36px', color:'#1c1917', fontWeight:900,
                  lineHeight:1.12, marginBottom:'8px',
                }}>
                  {mode === 'login' ? 'Welcome back!' : 'Create account'}
                </h2>
                <p style={{
                  color:'#a8a29e', fontSize:'14px', fontFamily:'Cairo,sans-serif', fontWeight:400,
                }}>
                  {mode === 'login'
                    ? 'Sign in to your MoroccoFan2030 account'
                    : 'Join the MoroccoFan2030 community'}
                </p>
              </div>

              {/* Alerts */}
              {error && (
                <div style={{
                  display:'flex', alignItems:'center', gap:'10px',
                  padding:'12px 16px', borderRadius:'12px', marginBottom:'24px',
                  background:'#fef2f2', color:'#C1272D', border:'1px solid #fecaca',
                  fontSize:'13px', fontWeight:500, fontFamily:'Cairo,sans-serif',
                }}>
                  <span className="material-icons" style={{fontSize:'18px',flexShrink:0}}>error_outline</span>
                  {error}
                </div>
              )}
              {success && (
                <div style={{
                  display:'flex', alignItems:'center', gap:'10px',
                  padding:'12px 16px', borderRadius:'12px', marginBottom:'24px',
                  background:'#f0fdf4', color:'#006233', border:'1px solid #bbf7d0',
                  fontSize:'13px', fontWeight:500, fontFamily:'Cairo,sans-serif',
                }}>
                  <span className="material-icons" style={{fontSize:'18px',flexShrink:0}}>check_circle_outline</span>
                  {success}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>

                  {/* Register-only fields */}
                  {mode === 'register' && (
                    <>
                      <Field label="Full Name"   name="name"    type="text"     icon="badge"           value={form.name}    onChange={handleChange} required />
                      <div style={{ display:'flex', gap:'16px' }}>
                        <Field label="Age"       name="age"     type="number"   icon="cake"            value={form.age}     onChange={handleChange} />
                        <Field label="Phone"     name="phone"   type="tel"      icon="phone"           value={form.phone}   onChange={handleChange} />
                      </div>
                      <SelectField 
                        label="Country (Team)" 
                        name="country" 
                        icon="public" 
                        value={form.country} 
                        onChange={handleChange} 
                        options={teams}
                        required 
                      />
                    </>
                  )}

                  {/* Always shown */}
                  <Field label="Email Address" name="email"    type="email"    icon="alternate_email"  value={form.email}    onChange={handleChange} required />
                  <Field label="Password"      name="password" type="password" icon="lock_outline"     value={form.password} onChange={handleChange} required />

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-submit"
                    style={{
                      marginTop:'6px',
                      background: loading ? '#d6d3d1' : 'linear-gradient(135deg,#C1272D 0%,#a01e23 100%)',
                      color: loading ? '#9ca3af' : '#fff',
                      boxShadow: loading ? 'none' : '0 8px 24px rgba(193,39,45,0.36)',
                    }}
                  >
                    {loading ? (
                      <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                        <span className="material-icons" style={{fontSize:'18px',animation:'spin 1s linear infinite'}}>autorenew</span>
                        Loading...
                      </span>
                    ) : mode === 'login' ? (
                      <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                        Sign In <span className="material-icons" style={{fontSize:'18px'}}>arrow_forward</span>
                      </span>
                    ) : (
                      <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                        Create Account <span className="material-icons" style={{fontSize:'18px'}}>how_to_reg</span>
                      </span>
                    )}
                  </button>
                </div>
              </form>

              {/* Switch link */}
              <p style={{ marginTop:'28px', textAlign:'center', fontSize:'14px', color:'#78716c', fontFamily:'Cairo,sans-serif' }}>
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  style={{
                    background:'none', border:'none', cursor:'pointer',
                    color:'#C1272D', fontWeight:700, fontFamily:'Cairo,sans-serif', fontSize:'14px',
                  }}
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            <p style={{ marginTop:'16px', textAlign:'center', fontSize:'12px', color:'#a8a29e', fontFamily:'Cairo,sans-serif' }}>
              © 2030 MoroccoFan2030 ·{' '}
              <span className="decorative-font" style={{color:'#006233'}}>المغرب 2030</span>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}

/* ── Borderless input — bottom line only ── */
function Field({ label, name, type, icon, value, onChange, required }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ flex:1, minWidth:0 }}>
      <label style={{
        display:'block', fontSize:'11px', fontWeight:700,
        color: focused ? '#C1272D' : '#a8a29e',
        textTransform:'uppercase', letterSpacing:'0.11em', marginBottom:'9px',
        fontFamily:'Cairo,sans-serif',
        transition:'color 0.2s',
      }}>
        {label}
      </label>
      <div style={{
        display:'flex', alignItems:'center', gap:'10px',
        borderBottom:`2px solid ${focused ? '#C1272D' : '#e7e5e4'}`,
        paddingBottom:'10px',
        transition:'border-color 0.2s',
      }}>
        <span className="material-icons" style={{
          fontSize:'20px',
          color: focused ? '#C1272D' : '#d6d3d1',
          transition:'color 0.2s', flexShrink:0,
        }}>{icon}</span>
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={
            type === 'email'    ? 'your@email.com'  :
            type === 'password' ? '••••••••'        :
            name === 'country'  ? 'e.g. Morocco'    : ''
          }
          style={{
            flex:1, border:'none', outline:'none', background:'transparent',
            color:'#1c1917', fontFamily:'Cairo,sans-serif', fontSize:'15px', padding:0,
          }}
        />
      </div>
    </div>
  );
}

/* ── Select field for country selection ── */
function SelectField({ label, name, icon, value, onChange, options, required }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ flex:1, minWidth:0 }}>
      <label style={{
        display:'block', fontSize:'11px', fontWeight:700,
        color: focused ? '#C1272D' : '#a8a29e',
        textTransform:'uppercase', letterSpacing:'0.11em', marginBottom:'9px',
        fontFamily:'Cairo,sans-serif',
        transition:'color 0.2s',
      }}>
        {label}
      </label>
      <div style={{
        display:'flex', alignItems:'center', gap:'10px',
        borderBottom:`2px solid ${focused ? '#C1272D' : '#e7e5e4'}`,
        paddingBottom:'10px',
        transition:'border-color 0.2s',
      }}>
        <span className="material-icons" style={{
          fontSize:'20px',
          color: focused ? '#C1272D' : '#d6d3d1',
          transition:'color 0.2s', flexShrink:0,
        }}>{icon}</span>
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex:1, border:'none', outline:'none', background:'transparent',
            color: value ? '#1c1917' : '#a8a29e',
            fontFamily:'Cairo,sans-serif', fontSize:'15px', padding:0,
            cursor:'pointer',
          }}
        >
          <option value="" disabled>Select your country/team</option>
          {options.map((team) => (
            <option key={team.id} value={team.country}>
              {team.country}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}