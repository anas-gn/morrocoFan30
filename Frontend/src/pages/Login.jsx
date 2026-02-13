import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const API_BASE = 'http://localhost:3309/api/auth';

export default function Login() {
  const router = useRouter();

  // 'login' | 'register'
  const [mode, setMode] = useState('login');
  // 'SUPPORTER' | 'RESPONSABLE'
  const [role, setRole] = useState('SUPPORTER');

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  /* ── form fields ── */
  const [form, setForm] = useState({
    name: '', age: '', email: '', password: '',
    phone: '', country: '', imageUrl: '',
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const roleSlug = role.toLowerCase(); // 'supporter' | 'responsable'
    const endpoint = mode === 'login'
      ? `${API_BASE}/${roleSlug}/login`
      : `${API_BASE}/${roleSlug}/register`;

    const body = mode === 'login'
      ? { email: form.email, password: form.password }
      : {
          name:     form.name,
          age:      form.age ? Number(form.age) : undefined,
          email:    form.email,
          password: form.password,
          phone:    form.phone,
          country:  form.country,
          ...(role === 'RESPONSABLE' && { imageUrl: form.imageUrl }),
        };

    try {
      const res  = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue');
        return;
      }

      /* save to localStorage */
      localStorage.setItem('token',    data.token);
      localStorage.setItem('userType', data.type);
      localStorage.setItem('userId',   data.id);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userEmail',data.email);

      setSuccess(`Bienvenue, ${data.name} !`);

      setTimeout(() => {
        if (data.type === 'SUPPORTER') router.push('/Acceuil');
        else                           router.push('/Dashboard');
      }, 800);

    } catch {
      setError('Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  /* ── helpers ── */
  const switchMode = (m) => { setMode(m); setError(''); setSuccess(''); };

  return (
    <>
      <Head>
        <title>
          {mode === 'login' ? 'Connexion' : 'Inscription'} · MoroccoFan2030
        </title>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="min-h-screen flex font-[DM_Sans]">

        {/* ─── LEFT PANEL ─── */}
        <div
          className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-14"
          style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a0a08 60%, #2b1010 100%)' }}
        >
          {/* Moroccan pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "url('https://www.transparenttextures.com/patterns/moroccan-flower.png')",
              backgroundSize: '160px',
            }}
          />

          {/* Red glow */}
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-[120px] opacity-30"
               style={{ background: '#C1272D' }} />
          <div className="absolute bottom-10 right-0 w-72 h-72 rounded-full blur-[100px] opacity-20"
               style={{ background: '#006233' }} />

          {/* Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                   style={{ background: '#C1272D' }}>
                <span className="text-white font-black text-lg">M</span>
              </div>
              <span className="text-white font-bold text-xl tracking-wide">MoroccoFan2030</span>
            </div>
            <p className="text-stone-500 text-sm font-light" style={{ fontFamily: 'serif' }}>
              المغرب ٢٠٣٠
            </p>
          </div>

          {/* Center text */}
          <div className="relative z-10">
            <div className="w-16 h-1 rounded mb-8" style={{ background: '#C1272D' }} />
            <h1
              className="text-5xl leading-tight text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900 }}
            >
              L'aventure<br />
              commence<br />
              <span style={{ color: '#C1272D' }}>ici.</span>
            </h1>
            <p className="text-stone-400 text-base leading-relaxed max-w-xs">
              Rejoignez des milliers de supporters et vivez la Coupe du Monde 2030 au cœur du Maroc.
            </p>
          </div>

          {/* Stats */}
          <div className="relative z-10 flex gap-10">
            {[['32', 'Équipes'], ['6', 'Stades'], ['64', 'Matchs']].map(([n, l]) => (
              <div key={l}>
                <p className="text-3xl font-black text-white"
                   style={{ fontFamily: 'Playfair Display, serif' }}>{n}</p>
                <p className="text-stone-500 text-xs uppercase tracking-widest">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div className="flex-1 flex items-center justify-center bg-stone-50 px-6 py-12">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                   style={{ background: '#C1272D' }}>
                <span className="text-white font-black">M</span>
              </div>
              <span className="font-bold tracking-wide text-stone-900">MoroccoFan2030</span>
            </div>

            {/* Mode tabs */}
            <div className="flex bg-stone-200 rounded-2xl p-1 mb-8 gap-1">
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300"
                  style={mode === m
                    ? { background: '#C1272D', color: '#fff', boxShadow: '0 4px 14px rgba(193,39,45,0.35)' }
                    : { color: '#78716c' }
                  }
                >
                  {m === 'login' ? 'Connexion' : 'Inscription'}
                </button>
              ))}
            </div>

            {/* Role selector */}
            <div className="flex gap-3 mb-8">
              {['SUPPORTER', 'RESPONSABLE'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className="flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200"
                  style={role === r
                    ? { borderColor: '#006233', background: '#006233', color: '#fff' }
                    : { borderColor: '#e7e5e4', background: '#fff', color: '#78716c' }
                  }
                >
                  {r === 'SUPPORTER' ? '⚽ Supporter' : '🏟️ Responsable'}
                </button>
              ))}
            </div>

            {/* Title */}
            <div className="mb-8">
              <h2
                className="text-3xl text-stone-900 mb-1"
                style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}
              >
                {mode === 'login' ? 'Bon retour !' : 'Créer un compte'}
              </h2>
              <p className="text-stone-500 text-sm">
                {mode === 'login'
                  ? `Connectez-vous en tant que ${role.toLowerCase()}`
                  : `Inscrivez-vous en tant que ${role.toLowerCase()}`}
              </p>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                   style={{ background: '#fef2f2', color: '#C1272D', border: '1px solid #fecaca' }}>
                <span>⚠</span> {error}
              </div>
            )}
            {success && (
              <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                   style={{ background: '#f0fdf4', color: '#006233', border: '1px solid #bbf7d0' }}>
                <span>✓</span> {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Register-only fields */}
              {mode === 'register' && (
                <>
                  <Field label="Nom complet" name="name" type="text"
                         value={form.name} onChange={handleChange} required />
                  <div className="flex gap-3">
                    <Field label="Âge" name="age" type="number"
                           value={form.age} onChange={handleChange} />
                    <Field label="Téléphone" name="phone" type="tel"
                           value={form.phone} onChange={handleChange} />
                  </div>
                  <Field label="Pays" name="country" type="text"
                         value={form.country} onChange={handleChange} />
                  {role === 'RESPONSABLE' && (
                    <Field label="URL Image (optionnel)" name="imageUrl" type="url"
                           value={form.imageUrl} onChange={handleChange} />
                  )}
                </>
              )}

              {/* Common fields */}
              <Field label="Adresse email" name="email" type="email"
                     value={form.email} onChange={handleChange} required />
              <Field label="Mot de passe" name="password" type="password"
                     value={form.password} onChange={handleChange} required />

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl text-white font-semibold text-base mt-2 transition-all duration-200"
                style={{
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #C1272D, #9b1c20)',
                  boxShadow: loading ? 'none' : '0 6px 20px rgba(193,39,45,0.4)',
                  transform: loading ? 'none' : undefined,
                }}
              >
                {loading
                  ? 'Chargement...'
                  : mode === 'login'
                    ? 'Se connecter →'
                    : "S'inscrire →"}
              </button>
            </form>

            {/* Switch mode link */}
            <p className="mt-6 text-center text-sm text-stone-500">
              {mode === 'login' ? "Pas encore de compte ?" : 'Déjà inscrit ?'}{' '}
              <button
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="font-semibold hover:underline"
                style={{ color: '#C1272D' }}
              >
                {mode === 'login' ? "S'inscrire" : 'Se connecter'}
              </button>
            </p>

            <p className="mt-8 text-center text-xs text-stone-400">
              © 2030 MoroccoFan2030 · Concept non-officiel
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Reusable Input Field ─── */
function Field({ label, name, type, value, onChange, required }) {
  return (
    <div className="flex-1">
      <label className="block text-xs font-medium text-stone-600 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 bg-white text-stone-900 text-sm outline-none transition-all duration-200"
        style={{ fontFamily: 'DM Sans, sans-serif' }}
        onFocus={(e) => e.target.style.borderColor = '#C1272D'}
        onBlur={(e)  => e.target.style.borderColor = '#e7e5e4'}
      />
    </div>
  );
}