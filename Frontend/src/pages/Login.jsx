"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const API_BASE   = 'https://anas-gana1-fandb-backend.hf.space/api/auth';
const TEAMS_API  = 'https://anas-gana1-fandb-backend.hf.space/api/teams/teams/all';

export default function Login() {
  const router = useRouter();
  const [mode,    setMode]    = useState('login');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [form,    setForm]    = useState({ name:'', age:'', email:'', password:'', phone:'', country:'' });
  const [teams,   setTeams]   = useState([]);

  /* redirect if already logged in */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = localStorage.getItem('userType');
    if (t === 'SUPPORTER')   { router.replace('/Acceuil');   return; }
    if (t === 'RESPONSABLE') { router.replace('/Dashboard'); return; }
    fetch(TEAMS_API).then(r => r.ok ? r.json() : []).then(setTeams).catch(() => {});
  }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const tryLogin = async (slug, body) => {
    const res = await fetch(`${API_BASE}/${slug}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { ok: res.ok, data: await res.json() };
  };

  const saveSession = d => {
    localStorage.setItem('token',     d.token);
    localStorage.setItem('userType',  d.type);
    localStorage.setItem('userId',    d.id);
    localStorage.setItem('supporterId', d.id);
    localStorage.setItem('userName',  d.name);
    localStorage.setItem('userEmail', d.email);
    window.dispatchEvent(new Event('userLoggedIn'));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'login') {
        const body = { email: form.email, password: form.password };

        /* 1) try supporter */
        let result = await tryLogin('supporter', body);

        /* 2) if fail → try responsable */
        if (!result.ok) result = await tryLogin('responsable', body);

        if (!result.ok) {
          setError(result.data?.error || 'Email ou mot de passe incorrect');
          return;
        }

        const d = result.data;
        saveSession(d);
        setSuccess(`Bienvenue, ${d.name} !`);

        /* ── redirect based on type ── */
        const dest = d.type === 'SUPPORTER' ? '/Acceuil' : '/Dashboard';
        setTimeout(() => router.push(dest), 800);

      } else {
        /* register → supporter only */
        const body = {
          name:     form.name,
          age:      form.age ? Number(form.age) : undefined,
          email:    form.email,
          password: form.password,
          phone:    form.phone,
          country:  form.country,
        };
        const res  = await fetch(`${API_BASE}/supporter/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const d = await res.json();
        if (!res.ok) { setError(d.error || "Une erreur s'est produite"); return; }
        saveSession(d);
        setSuccess(`Bienvenue, ${d.name} !`);
        setTimeout(() => router.push('/Acceuil'), 800);
      }
    } catch {
      setError('Impossible de joindre le serveur');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = m => { setMode(m); setError(''); setSuccess(''); };

  /* ═══ RENDER ═══ */
  return (
    <>
      <Head>
        <title>{mode === 'login' ? 'Connexion' : 'Inscription'} · MoroccoFan2030</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=Amiri:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased}
        @keyframes spin   {to{transform:rotate(360deg)}}
        @keyframes fadeUp {from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow   {0%,100%{text-shadow:0 0 28px rgba(193,39,45,.55),0 0 56px rgba(193,39,45,.22)}50%{text-shadow:0 0 52px rgba(193,39,45,.9),0 0 96px rgba(193,39,45,.38)}}
        .fu{animation:fadeUp .6s ease-out both}
        .d1{animation-delay:.08s}.d2{animation-delay:.16s}.d3{animation-delay:.24s}
        .glow{animation:glow 3.5s ease-in-out infinite}
      `}</style>

      <div style={{ minHeight:'100vh', display:'flex' }}>

        {/* ── LEFT hero panel ── */}
        <div style={{ width:'44%', position:'relative', overflow:'hidden', padding:'52px 48px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          {/* bg photo */}
          <div style={{ position:'absolute', inset:0, backgroundImage:"url('https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=1400&auto=format&fit=crop')", backgroundSize:'cover', backgroundPosition:'center' }}/>
          {/* overlay */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(145deg,rgba(45,10,14,.96) 0%,rgba(26,6,8,.88) 60%,rgba(0,98,51,.2) 100%)' }}/>
          {/* pattern */}
          <div style={{ position:'absolute', inset:0, opacity:.04, backgroundImage:"repeating-linear-gradient(45deg,#C1272D 0,#C1272D 1px,transparent 0,transparent 50%)", backgroundSize:'18px 18px' }}/>
          {/* glows */}
          <div style={{ position:'absolute', top:-60, left:-60, width:340, height:340, borderRadius:'50%', background:'#C1272D', filter:'blur(130px)', opacity:.25 }}/>
          <div style={{ position:'absolute', bottom:0, right:-40, width:260, height:260, borderRadius:'50%', background:'#006233', filter:'blur(110px)', opacity:.18 }}/>

          {/* logo */}
          <div className="fu" style={{ position:'relative', zIndex:2, display:'flex', alignItems:'center', gap:14 }}>
            <img src="/images/logo.png" alt="Logo" style={{ width:42, height:42, objectFit:'contain' }} />
            <div>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:15, color:'#fff' }}>MoroccoFan2030</div>
              <div style={{ fontFamily:'Amiri,serif', color:'rgba(255,255,255,.4)', fontSize:13 }}>المغرب ٢٠٣٠</div>
            </div>
          </div>

          {/* headline */}
          <div className="fu d1" style={{ position:'relative', zIndex:2 }}>
            <div style={{ width:44, height:3, borderRadius:3, background:'linear-gradient(to right,#C1272D,#006233)', marginBottom:22 }}/>
            <h1 className="glow" style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(32px,4vw,52px)', lineHeight:1.1, color:'#fff', fontWeight:800, letterSpacing:'-.02em', marginBottom:16 }}>
              L&apos;aventure<br />commence{' '}
              <span style={{ color:'#C1272D', fontFamily:'Amiri,serif', fontStyle:'italic' }}>ici.</span>
            </h1>
            <p style={{ color:'rgba(255,255,255,.5)', fontSize:13, lineHeight:1.9, maxWidth:290 }}>
              Rejoignez des milliers de fans et vivez la Coupe du Monde 2030 au cœur du Maroc.
            </p>
            <div style={{ display:'flex', gap:8, marginTop:18, flexWrap:'wrap' }}>
              {[['64 Matches','#C1272D'],['6 Stades','#006233'],['32 Équipes','#b45309']].map(([t,c])=>(
                <span key={t} style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:99, fontSize:10, fontWeight:700, fontFamily:'Syne,sans-serif', letterSpacing:'.06em', textTransform:'uppercase', background:`${c}22`, color:c, border:`1px solid ${c}44` }}>{t}</span>
              ))}
            </div>
          </div>

          {/* stats */}
          <div className="fu d2" style={{ position:'relative', zIndex:2, display:'flex', gap:32 }}>
            {[['32','Équipes'],['6','Stades'],['64','Matches']].map(([n,l])=>(
              <div key={l}>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:38, fontWeight:800, color:'#fff', lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.38)', textTransform:'uppercase', letterSpacing:'.1em', marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT form panel ── */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'#fafaf9', padding:'40px 24px', backgroundImage:'radial-gradient(#e5e7eb 1px,transparent 1px)', backgroundSize:'22px 22px' }}>
          <div className="fu d1" style={{ width:'100%', maxWidth:420 }}>

            {/* tabs */}
            <div style={{ display:'flex', gap:4, padding:5, background:'#f3f4f6', borderRadius:14, border:'1px solid #e5e7eb', marginBottom:30 }}>
              {[['login','Connexion'],['register','Inscription']].map(([m,l])=>(
                <button key={m} onClick={()=>switchMode(m)}
                        style={{ flex:1, padding:'10px', borderRadius:11, fontWeight:700, fontSize:12, fontFamily:'Syne,sans-serif', letterSpacing:'.02em', border:'none', cursor:'pointer', transition:'all .18s',
                                 background: mode===m ? 'linear-gradient(135deg,#1a0608,#2d0a0e)' : 'transparent',
                                 color: mode===m ? '#fff' : '#9ca3af' }}>
                  {l}
                </button>
              ))}
            </div>

            {/* title */}
            <div style={{ marginBottom:26 }}>
              <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:30, color:'#1c1917', fontWeight:800, lineHeight:1.1, marginBottom:6, letterSpacing:'-.01em' }}>
                {mode==='login' ? 'Bon retour !' : 'Créer un compte'}
              </h2>
              <p style={{ color:'#a8a29e', fontSize:13 }}>
                {mode==='login' ? 'Connectez-vous à votre compte MoroccoFan2030' : 'Rejoignez la communauté MoroccoFan2030'}
              </p>
            </div>

            {/* alerts */}
            {error&&(
              <div style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 13px', borderRadius:10, marginBottom:18, background:'rgba(193,39,45,.06)', color:'#C1272D', border:'1px solid rgba(193,39,45,.2)', fontSize:13, fontWeight:500 }}>
                <span className="material-icons" style={{ fontSize:16, flexShrink:0 }}>error_outline</span>{error}
              </div>
            )}
            {success&&(
              <div style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 13px', borderRadius:10, marginBottom:18, background:'rgba(0,98,51,.07)', color:'#006233', border:'1px solid rgba(0,98,51,.2)', fontSize:13, fontWeight:500 }}>
                <span className="material-icons" style={{ fontSize:16, flexShrink:0 }}>check_circle_outline</span>{success}
              </div>
            )}

            {/* form */}
            <form onSubmit={handleSubmit}>
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

                {mode==='register'&&(<>
                  <Field label="Nom complet"    name="name"  type="text"   icon="badge"       value={form.name}  onChange={handleChange} required />
                  <div style={{ display:'flex', gap:12 }}>
                    <Field label="Âge"       name="age"   type="number" icon="cake"        value={form.age}   onChange={handleChange} />
                    <Field label="Téléphone" name="phone" type="tel"    icon="phone"       value={form.phone} onChange={handleChange} />
                  </div>
                  <SelectField label="Pays / Équipe" name="country" icon="public" value={form.country} onChange={handleChange} options={teams} required />
                </>)}

                <Field label="Adresse email" name="email"    type="email"    icon="alternate_email" value={form.email}    onChange={handleChange} required />
                <Field label="Mot de passe"  name="password" type="password" icon="lock_outline"    value={form.password} onChange={handleChange} required />

                <button type="submit" disabled={loading}
                        style={{ marginTop:4, width:'100%', padding:'13px', borderRadius:12, border:'none', fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:800, letterSpacing:'.03em', cursor:loading?'not-allowed':'pointer', transition:'all .18s',
                                 background: loading ? '#e7e5e4' : 'linear-gradient(135deg,#C1272D,#a01e23)',
                                 color: loading ? '#a8a29e' : '#fff',
                                 boxShadow: loading ? 'none' : '0 6px 20px rgba(193,39,45,.28)' }}>
                  {loading
                    ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                        <div style={{ width:15, height:15, border:'2px solid #a8a29e', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
                        Chargement…
                      </span>
                    : mode==='login'
                      ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>Se connecter <span className="material-icons" style={{ fontSize:17 }}>arrow_forward</span></span>
                      : <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>Créer un compte <span className="material-icons" style={{ fontSize:17 }}>how_to_reg</span></span>
                  }
                </button>
              </div>
            </form>

            <p style={{ marginTop:22, textAlign:'center', fontSize:13, color:'#78716c' }}>
              {mode==='login' ? "Pas encore de compte ?" : 'Déjà un compte ?'}{' '}
              <button onClick={()=>switchMode(mode==='login'?'register':'login')}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'#C1272D', fontWeight:700, fontFamily:'Syne,sans-serif', fontSize:13 }}>
                {mode==='login' ? "S'inscrire" : 'Se connecter'}
              </button>
            </p>

            <p style={{ marginTop:18, textAlign:'center', fontSize:11, color:'#d6d3d1' }}>
              © 2030 MoroccoFan2030 · <span style={{ fontFamily:'Amiri,serif', color:'rgba(0,98,51,.6)', fontStyle:'italic' }}>المغرب 2030</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Input field ── */
function Field({ label, name, type, icon, value, onChange, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ flex:1, minWidth:0 }}>
      <label style={{ display:'block', fontSize:10, fontWeight:700, color:focused?'#C1272D':'#a8a29e', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:7, fontFamily:'Syne,sans-serif', transition:'color .2s' }}>
        {label}
      </label>
      <div style={{ display:'flex', alignItems:'center', gap:9, borderBottom:`2px solid ${focused?'#C1272D':'#e5e7eb'}`, paddingBottom:9, transition:'border-color .2s' }}>
        <span className="material-icons" style={{ fontSize:17, color:focused?'#C1272D':'#d1d5db', transition:'color .2s', flexShrink:0 }}>{icon}</span>
        <input name={name} type={type} value={value} onChange={onChange} required={required}
               onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
               style={{ flex:1, border:'none', outline:'none', background:'transparent', color:'#1c1917', fontFamily:'Inter,sans-serif', fontSize:14, padding:0 }}
               placeholder={type==='email'?'votre@email.com':type==='password'?'••••••••':''}/>
      </div>
    </div>
  );
}

/* ── Country/Team select ── */
function SelectField({ label, name, icon, value, onChange, options, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ flex:1, minWidth:0 }}>
      <label style={{ display:'block', fontSize:10, fontWeight:700, color:focused?'#C1272D':'#a8a29e', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:7, fontFamily:'Syne,sans-serif', transition:'color .2s' }}>
        {label}
      </label>
      <div style={{ display:'flex', alignItems:'center', gap:9, borderBottom:`2px solid ${focused?'#C1272D':'#e5e7eb'}`, paddingBottom:9, transition:'border-color .2s' }}>
        <span className="material-icons" style={{ fontSize:17, color:focused?'#C1272D':'#d1d5db', transition:'color .2s', flexShrink:0 }}>{icon}</span>
        <select name={name} value={value} onChange={onChange} required={required}
                onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
                style={{ flex:1, border:'none', outline:'none', background:'transparent', color:value?'#1c1917':'#9ca3af', fontFamily:'Inter,sans-serif', fontSize:14, padding:0, cursor:'pointer' }}>
          <option value="" disabled>Choisir votre pays / équipe</option>
          {options.map(t => <option key={t.id} value={t.country}>{t.country}</option>)}
        </select>
      </div>
    </div>
  );
}