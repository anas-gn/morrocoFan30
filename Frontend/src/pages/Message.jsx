import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Community() {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const [selectedCountry, setSelectedCountry] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState({ id: userId ? Number(userId) : 1, name: 'Guest Fan' });
  const [teamImages, setTeamImages] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newMessageNotification, setNewMessageNotification] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  const lastMessageIdRef = useRef(null);
  const currentUserRef = useRef(currentUser);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const shouldScrollRef = useRef(false);

  const scrollToBottom = (force = false) => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (force || shouldScrollRef.current) {
      container.scrollTop = container.scrollHeight;
      shouldScrollRef.current = false;
    }
  };

  useEffect(() => {
    const fetchSupporter = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`http://localhost:3309/api/supporters/${userId}`);
        if (!res.ok) throw new Error('error');
        const data = await res.json();
        if (data.country) setSelectedCountry(data.country);
        setCurrentUser({ id: Number(userId), name: data.name || 'Guest Fan' });
      } catch {
        setSelectedCountry('Morocco');
      }
    };
    fetchSupporter();
  }, [userId]);

  const fetchTeamImage = async (country) => {
    if (!country || teamImages[country]) return;
    try {
      const res = await fetch(`http://localhost:3309/api/teams/getAll`);
      if (!res.ok) return;
      const teams = await res.json();
      const team = teams.find(t => t.country === country);
      if (team?.imageUrl) setTeamImages(prev => ({ ...prev, [country]: team.imageUrl }));
    } catch {}
  };

  useEffect(() => {
    if (!selectedCountry) return;
    setIsLoading(true);
    fetch(`http://localhost:3309/api/messages/community/${selectedCountry}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
          setMessageCount(data.length);
          if (data.length > 0) lastMessageIdRef.current = data[data.length - 1].id;
        }
        setIsLoading(false);
        setTimeout(() => scrollToBottom(true), 100);
      })
      .catch(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedCountry || isLoading) return;
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    pollingIntervalRef.current = setInterval(() => {
      fetch(`http://localhost:3309/api/messages/community/${selectedCountry}`)
        .then(r => r.json())
        .then(data => {
          if (!Array.isArray(data) || data.length === 0) return;
          const curLastId = lastMessageIdRef.current;
          const curUserId = currentUserRef.current.id;
          const newMessages = curLastId
            ? data.filter(msg => msg.id > curLastId && msg.supporterId !== curUserId)
            : [];
          if (newMessages.length > 0) {
            setMessages(prev => {
              const merged = [...prev.filter(m => !m.isWelcome), ...newMessages];
              const unique = merged.filter((m, i, s) => i === s.findIndex(x => x.id === m.id));
              return unique.sort((a, b) => new Date(a.dateOfSend) - new Date(b.dateOfSend));
            });
            setMessageCount(data.length);
            lastMessageIdRef.current = data[data.length - 1].id;
            setNewMessageNotification(true);
            setTimeout(() => setNewMessageNotification(false), 3000);
          }
        })
        .catch(() => {});
    }, 2000);
    return () => { if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current); };
  }, [selectedCountry, isLoading]);

  useEffect(() => { if (selectedCountry) fetchTeamImage(selectedCountry); }, [selectedCountry]);
  useEffect(() => {
    messages.forEach(msg => { if (msg.country && !teamImages[msg.country]) fetchTeamImage(msg.country); });
  }, [messages]);
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputMessage.trim() && !selectedImage) || !selectedCountry) return;
    setIsSending(true);
    const params = new URLSearchParams();
    params.append('content', inputMessage || 'Sent an image');
    params.append('country', selectedCountry);
    params.append('supporterId', currentUser.id.toString());
    if (selectedImage) params.append('imageUrl', imagePreview);
    try {
      const response = await fetch('http://localhost:3309/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });
      if (response.ok) {
        const newMessage = await response.json();
        if (selectedImage) newMessage.imageUrl = imagePreview;
        shouldScrollRef.current = true;
        setMessages(prev => [...prev, newMessage]);
        setMessageCount(c => c + 1);
        lastMessageIdRef.current = newMessage.id;
        setInputMessage('');
        setSelectedImage(null);
        setImagePreview(null);
      }
    } catch {}
    finally { setIsSending(false); }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getFlagEmoji = (countryName) => {
    if (!countryName) return '🌍';
    const isoMap = {
      Afghanistan:'AF',Albania:'AL',Algeria:'DZ',Argentina:'AR',Australia:'AU',
      Austria:'AT',Belgium:'BE',Brazil:'BR',Canada:'CA',Chile:'CL',China:'CN',
      Colombia:'CO',Croatia:'HR',Denmark:'DK',Egypt:'EG',England:'GB',France:'FR',
      Germany:'DE',Ghana:'GH',Greece:'GR',India:'IN',Iran:'IR',Italy:'IT',Japan:'JP',
      Kenya:'KE',Malaysia:'MY',Mexico:'MX',Morocco:'MA',Netherlands:'NL',Nigeria:'NG',
      Norway:'NO',Pakistan:'PK',Portugal:'PT',Qatar:'QA',Romania:'RO',Russia:'RU',
      Senegal:'SN',Serbia:'RS',Spain:'ES',Sweden:'SE',Switzerland:'CH',Tunisia:'TN',
      Turkey:'TR',UAE:'AE',Ukraine:'UA',Uruguay:'UY',USA:'US',
    };
    const iso = isoMap[countryName];
    if (!iso) return '🌍';
    try { return iso.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0))); }
    catch { return '🌍'; }
  };

  const myMessages = messages.filter(m => m.supporterId === currentUser.id).length;
  const otherMessages = messages.filter(m => m.supporterId !== currentUser.id && !m.isWelcome).length;

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div style={{ width: 48, height: 48, border: '3px solid #C1272D', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <Head>
        <title>Community Hub | MoroccoFan2030</title>
        <meta name="description" content="Join the conversation. The voice of the 2030 World Cup fans." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=Cairo:wght@400;600;700&family=Amiri:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #fff; color: #1c1917; }
        .syne  { font-family: 'Syne', sans-serif; }
        .serif { font-family: 'Amiri', serif; }
        .cairo { font-family: 'Cairo', sans-serif; }

        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes pglow   { 0%,100%{box-shadow:0 0 0 0 rgba(193,39,45,.5)} 50%{box-shadow:0 0 0 8px rgba(193,39,45,0)} }
        @keyframes slideR  { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideL  { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:scale(1)} }

        .fu   { animation: fadeUp .5s ease-out forwards; opacity: 0; }
        .fi   { animation: fadeIn .4s ease-out forwards; opacity: 0; }
        .d1   { animation-delay: .08s; }
        .d2   { animation-delay: .16s; }
        .d3   { animation-delay: .24s; }
        .d4   { animation-delay: .32s; }

        /* Pills */
        .pill { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;border:1px solid; }
        .pill-live    { background:rgba(239,68,68,.1);   color:#dc2626; border-color:rgba(239,68,68,.3); }
        .pill-host    { background:rgba(193,39,45,.08);  color:#C1272D; border-color:rgba(193,39,45,.25); }
        .pill-green   { background:rgba(0,98,51,.1);     color:#006233; border-color:rgba(0,98,51,.3); }
        .pill-gold    { background:rgba(240,165,0,.1);   color:#b45309; border-color:rgba(240,165,0,.3); }
        .pill-default { background:rgba(0,0,0,.04);      color:#a8a29e; border-color:rgba(0,0,0,.08); }
        .live-dot     { width:6px;height:6px;border-radius:50%;background:#dc2626;display:inline-block;animation:blink 1.2s ease-in-out infinite; }
        .pulse-glow   { animation: pglow 2s infinite; }

        /* Stat card */
        .stat-card { background:#fff; border:1px solid #e7e5e4; border-radius:16px; padding:20px 16px; text-align:center; transition:border-color .2s,box-shadow .2s; }
        .stat-card:hover { border-color:#C1272D; box-shadow:0 4px 20px rgba(193,39,45,.08); }
        .stat-val { font-size:36px; font-weight:800; line-height:1; font-family:'Syne',sans-serif; }
        .stat-lbl { font-size:11px; color:#a8a29e; text-transform:uppercase; letter-spacing:.08em; margin-top:6px; font-weight:500; }

        /* Chat container scrollbar */
        .chat-scroll::-webkit-scrollbar { width: 5px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background:#e7e5e4; border-radius:10px; }
        .chat-scroll::-webkit-scrollbar-thumb:hover { background:#d1d5db; }

        /* Message bubbles */
        .bubble-me    { background:linear-gradient(135deg,#2d0a0e,#C1272D); color:#fff; border-radius:18px 18px 4px 18px; animation:slideR .3s ease-out both; }
        .bubble-other { background:#fff; border:1.5px solid #e7e5e4; color:#1c1917; border-radius:18px 18px 18px 4px; animation:slideL .3s ease-out both; }
        .bubble-other:hover { border-color:#C1272D; }
        .bubble-welcome { background:linear-gradient(135deg,rgba(0,98,51,.07),rgba(0,98,51,.03)); border:1.5px solid rgba(0,98,51,.25); color:#1c1917; border-radius:12px; }

        .msg-row { display:flex; align-items:flex-end; gap:10px; margin-bottom:12px; }
        .msg-row.me { flex-direction:row-reverse; }

        /* Input area */
        .input-wrap { background:#f9f7f7; border:1.5px solid #e7e5e4; border-radius:16px; display:flex; align-items:center; gap:6px; padding:6px 6px 6px 12px; transition:border-color .2s; }
        .input-wrap:focus-within { border-color:#C1272D; background:#fff; }

        .send-btn { display:flex; align-items:center; gap:6px; padding:10px 20px; border-radius:12px; font-family:'Syne',sans-serif; font-weight:700; font-size:12px; letter-spacing:.06em; text-transform:uppercase; transition:all .2s; border:none; cursor:pointer; }
        .send-btn:disabled { background:#f5f5f4; color:#a8a29e; cursor:not-allowed; }
        .send-btn:not(:disabled) { background:linear-gradient(to right,#2d0a0e,#1a0608); color:#fff; box-shadow:0 4px 16px rgba(193,39,45,.25); }
        .send-btn:not(:disabled):hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(193,39,45,.35); }
        .send-btn:not(:disabled):active { transform:scale(.97); }

        /* Chat card */
        .chat-card { background:#fff; border:1px solid #e7e5e4; border-radius:20px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,.06); }

        /* Avatar */
        .avatar { width:36px; height:36px; border-radius:10px; border:1.5px solid #e7e5e4; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; background:#f9f7f7; color:#57534e; flex-shrink:0; font-family:'Syne',sans-serif; transition:transform .2s; }
        .avatar:hover { transform:scale(1.08); }
        .avatar-me { background:linear-gradient(135deg,#2d0a0e,#C1272D); color:#fff; border-color:transparent; }

        @media(max-width:640px) {
          .stat-val { font-size:26px; }
          .stats-grid { grid-template-columns: repeat(2,1fr)!important; }
        }
      `}</style>

      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <header className="relative overflow-hidden" style={{ paddingTop: 80, minHeight: 420 }}>
        {/* BG */}
        <div className="absolute inset-0">
          {teamImages[selectedCountry]
            ? <img src={teamImages[selectedCountry]} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full" style={{ background: '#1a0608' }} />
          }
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(45,10,14,.93) 0%,rgba(26,6,8,.87) 55%,rgba(0,98,51,.22) 100%)' }} />
          {/* Moroccan pattern overlay */}
          <div className="absolute inset-0 opacity-[.06] pointer-events-none"
            style={{ backgroundImage:"url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'180px' }} />
        </div>

        {/* Glows */}
        <div className="absolute top-16 left-8 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background:'rgba(193,39,45,.13)' }} />
        <div className="absolute bottom-0 right-8 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background:'rgba(0,98,51,.12)' }} />

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          {/* Badge */}
          <div className="fu mb-8">
            <span className="pill pill-host" style={{ fontSize:11, padding:'5px 14px' }}>
              <span className="material-icons" style={{ fontSize:12 }}>forum</span>
              Fan Community
            </span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            {/* Title */}
            <div className="fu d1">
              <h1 className="syne" style={{ fontSize:'clamp(38px,7vw,72px)', fontWeight:800, lineHeight:1, letterSpacing:'-.02em', color:'#fff', marginBottom:12 }}>
                Fan<br />
                <span style={{ color:'#C1272D' }} className="serif italic">Community</span>
              </h1>
              <p style={{ fontSize:15, color:'rgba(255,255,255,.6)', maxWidth:420, lineHeight:1.7 }}>
                Join the conversation with supporters from around the world. Live, loud, and passionate.
              </p>
            </div>

            {/* Live stats — same style as matches hero numbers */}
            <div className="fu d2 flex gap-8 md:gap-12">
              {[
                { v: messageCount,    l:'Messages',  c:'#C1272D' },
                { v: myMessages,      l:'From You',  c:'#f0a500' },
                { v: otherMessages,   l:'From Fans', c:'#3dba7a' },
              ].map(({ v, l, c }) => (
                <div key={l} style={{ textAlign:'center' }}>
                  <div className="syne" style={{ fontSize:44, fontWeight:800, color:c, lineHeight:1 }}>{v}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.45)', textTransform:'uppercase', letterSpacing:'.1em', marginTop:4, fontWeight:600 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fade to white */}
        <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{ background:'linear-gradient(to bottom, transparent, #fff)' }} />
      </header>

      {/* ══ STAT CARDS ════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6" style={{ marginTop: 40, marginBottom: 32 }}>
        <div className="stats-grid fu d2" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12 }}>
          {[
            { v: messageCount,                                                     l:'Total Messages',  c:'#C1272D' },
            { v: myMessages,                                                       l:'My Messages',     c:'#b45309' },
            { v: otherMessages,                                                    l:'Other Fans',      c:'#006233' },
            { v: selectedCountry ? 1 : 0,                                          l:'Channels Live',   c:'#3dba7a' },
          ].map(({ v, l, c }) => (
            <div key={l} className="stat-card">
              <div className="stat-val" style={{ color:c }}>{v}</div>
              <div className="stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CHAT SECTION ══════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        <div className="chat-card fu d3">

          {/* ── Chat Header — same dark gradient as match card tops ── */}
          <div style={{ background:'linear-gradient(to right,#2d0a0e,#1a0608)', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              {/* Country avatar */}
              <div style={{ width:52, height:52, borderRadius:14, overflow:'hidden', border:'2px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
                {teamImages[selectedCountry]
                  ? <img src={teamImages[selectedCountry]} alt={selectedCountry} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : getFlagEmoji(selectedCountry)
                }
              </div>
              <div>
                <div className="syne" style={{ fontSize:18, fontWeight:800, color:'#fff', lineHeight:1.2 }}>
                  {selectedCountry || 'Select a Country'}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                  <span className="pill pill-green" style={{ background:'rgba(0,98,51,.25)', borderColor:'rgba(0,98,51,.5)', color:'#3dba7a' }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#3dba7a', display:'inline-block', animation:'blink 1.2s ease-in-out infinite' }} />
                    Live Channel
                  </span>
                  {newMessageNotification && (
                    <span className="pill pill-live pulse-glow">
                      <span className="live-dot" />New Message
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right side info */}
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ textAlign:'right', display:'none' }} className="hidden sm:block">
                <div className="syne" style={{ fontSize:22, fontWeight:800, color:'#C1272D', lineHeight:1 }}>{messageCount}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.08em', marginTop:2 }}>Messages</div>
              </div>
              <div style={{ width:1, height:40, background:'rgba(255,255,255,.1)' }} className="hidden sm:block" />
              <button style={{ width:40, height:40, borderRadius:10, background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.5)', cursor:'pointer', transition:'all .2s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.12)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.07)'}>
                <span className="material-icons" style={{ fontSize:18 }}>more_vert</span>
              </button>
            </div>
          </div>

          {/* ── Accent stripe — same as calendar card top stripe ── */}
          <div style={{ height:3, background:'linear-gradient(to right,#C1272D,#006233)' }} />

          {/* ── Messages Area ─────────────────────────────────────── */}
          <div
            ref={messagesContainerRef}
            className="chat-scroll"
            style={{ height:520, overflowY:'auto', background:'#fafaf9', backgroundImage:'radial-gradient(#e7e5e4 1px, transparent 1px)', backgroundSize:'22px 22px', padding:'24px 28px', display:'flex', flexDirection:'column', gap:2 }}
          >
            {messages.length === 0 ? (
              <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center' }}>
                <div style={{ width:72, height:72, borderRadius:20, background:'#f5f5f4', border:'1px solid #e7e5e4', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, boxShadow:'0 4px 16px rgba(0,0,0,.05)' }}>
                  <span className="material-icons" style={{ fontSize:32, color:'#d1d5db' }}>chat_bubble_outline</span>
                </div>
                <div className="syne" style={{ fontSize:18, fontWeight:700, color:'#57534e', marginBottom:8 }}>Quiet in here</div>
                <div style={{ fontSize:13, color:'#a8a29e' }}>Be the first to chant for {selectedCountry}!</div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe      = msg.supporterId === currentUser.id;
                const isWelcome = msg.isWelcome;
                const prevMsg   = messages[idx - 1];
                const isSeq     = prevMsg && String(prevMsg.supporterId) === String(msg.supporterId);

                return (
                  <div
                    key={msg.id || idx}
                    className={`msg-row${isMe ? ' me' : ''}`}
                    style={{ animationDelay:`${Math.min(idx * 0.035, 0.5)}s` }}
                  >
                    {/* Avatar */}
                    {!isSeq ? (
                      <div className={`avatar${isMe ? ' avatar-me' : ''}`}
                        title={isMe ? currentUser.name : msg.name}>
                        {isWelcome
                          ? <span className="material-icons" style={{ fontSize:16, color:'#006233' }}>emoji_events</span>
                          : (msg.name ? msg.name.charAt(0).toUpperCase() : '?')
                        }
                      </div>
                    ) : (
                      <div style={{ width:36, flexShrink:0 }} />
                    )}

                    {/* Bubble + meta */}
                    <div style={{ display:'flex', flexDirection:'column', gap:3, maxWidth:'70%', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      {!isMe && !isSeq && (
                        <div style={{ fontSize:11, fontWeight:700, color: isWelcome ? '#006233' : '#78716c', marginLeft:2, fontFamily:'Syne, sans-serif', letterSpacing:'.02em' }}>
                          {isWelcome ? '🏆 Official' : msg.name}
                        </div>
                      )}

                      {isWelcome ? (
                        <div className="bubble-welcome" style={{ padding:'12px 16px', maxWidth:'100%' }}>
                          <span style={{ fontSize:13, lineHeight:1.6 }}>{msg.content}</span>
                        </div>
                      ) : msg.imageUrl ? (
                        <div style={{ borderRadius:14, overflow:'hidden', border:'1.5px solid #e7e5e4', position:'relative', boxShadow:'0 4px 16px rgba(0,0,0,.08)' }}>
                          <img src={msg.imageUrl} alt="Shared" style={{ maxWidth:260, maxHeight:260, objectFit:'cover', display:'block' }} />
                          {msg.content && msg.content !== 'Sent an image' && (
                            <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'10px 12px', background:'linear-gradient(to top,rgba(0,0,0,.75),transparent)', borderRadius:'0 0 12px 12px' }}>
                              <span style={{ fontSize:12, color:'#fff', fontWeight:500 }}>{msg.content}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={isMe ? 'bubble-me' : 'bubble-other'} style={{ padding:'10px 16px', boxShadow:'0 2px 10px rgba(0,0,0,.06)' }}>
                          <span style={{ fontSize:14, lineHeight:1.5, fontWeight:450 }}>{msg.content}</span>
                        </div>
                      )}

                      {/* Timestamp */}
                      <div style={{ fontSize:10, color:'#a8a29e', fontWeight:600, letterSpacing:'.03em', opacity:0, transition:'opacity .2s' }}
                        onMouseOver={e=>e.currentTarget.style.opacity=1}
                        onMouseOut={e=>e.currentTarget.style.opacity=0}>
                        {msg.dateOfSend ? new Date(msg.dateOfSend).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : ''}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Input Area ────────────────────────────────────────── */}
          <div style={{ padding:'20px 24px', background:'#fff', borderTop:'1px solid #f5f5f4' }}>

            {/* Image preview */}
            {imagePreview && (
              <div style={{ marginBottom:12, display:'inline-block', position:'relative', animation:'scaleIn .25s ease-out both' }}>
                <div style={{ borderRadius:12, overflow:'hidden', border:'2px solid #C1272D', boxShadow:'0 4px 16px rgba(193,39,45,.2)' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth:140, maxHeight:140, objectFit:'cover', display:'block' }} />
                  <button type="button" onClick={removeImage}
                    style={{ position:'absolute', top:6, right:6, width:26, height:26, borderRadius:'50%', background:'rgba(0,0,0,.65)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff' }}>
                    <span className="material-icons" style={{ fontSize:14 }}>close</span>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage}>
              <div className="input-wrap">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

                {/* Photo button */}
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  style={{ width:38, height:38, borderRadius:10, background:'transparent', border:'none', display:'flex', alignItems:'center', justifyContent:'center', color:'#a8a29e', cursor:'pointer', transition:'all .2s', flexShrink:0 }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(193,39,45,.07)';e.currentTarget.style.color='#C1272D';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#a8a29e';}}>
                  <span className="material-icons" style={{ fontSize:20 }}>add_photo_alternate</span>
                </button>

                {/* Emoji button */}
                <button type="button"
                  style={{ width:38, height:38, borderRadius:10, background:'transparent', border:'none', display:'flex', alignItems:'center', justifyContent:'center', color:'#a8a29e', cursor:'pointer', transition:'all .2s', flexShrink:0 }}
                  onMouseEnter={e=>{e.currentTarget.style.background='#f5f5f4';e.currentTarget.style.color='#57534e';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#a8a29e';}}>
                  <span className="material-icons" style={{ fontSize:20 }}>sentiment_satisfied_alt</span>
                </button>

                {/* Divider */}
                <div style={{ width:1, height:24, background:'#e7e5e4', flexShrink:0 }} />

                {/* Text input */}
                <input
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder={`Message ${selectedCountry} fans...`}
                  style={{ flex:1, border:'none', background:'transparent', outline:'none', fontSize:14, color:'#1c1917', fontFamily:'Inter,sans-serif', padding:'8px 4px' }}
                />

                {/* Send */}
                <button type="submit" disabled={isSending || (!inputMessage.trim() && !selectedImage)} className="send-btn">
                  {isSending
                    ? <span className="material-icons" style={{ fontSize:16, animation:'spin .8s linear infinite' }}>refresh</span>
                    : <>
                        <span>Send</span>
                        <span className="material-icons" style={{ fontSize:16 }}>send</span>
                      </>
                  }
                </button>
              </div>
            </form>

            {/* Footer note */}
            <div style={{ marginTop:14, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#a8a29e' }}>
                <span className="material-icons" style={{ fontSize:13, color:'#C1272D' }}>verified_user</span>
                Respectful conversation only
              </div>
              <div style={{ fontSize:11, color:'#c7c3c0', fontFamily:'serif', fontStyle:'italic' }}>
                كن محترماً • Soyez respectueux
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}