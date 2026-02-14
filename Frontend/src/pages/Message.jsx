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
  const [isWelcomeSent, setIsWelcomeSent] = useState(false);
  const [newMessageNotification, setNewMessageNotification] = useState(false);

  // ✅ FIX: lastMessageId and currentUser in refs → no dependency in polling useEffect
  const lastMessageIdRef = useRef(null);
  const currentUserRef = useRef(currentUser);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const shouldScrollRef = useRef(false);

  // ✅ FIX: scroll only the container, not the whole page
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
        if (!res.ok) throw new Error('Erreur récupération supporter');
        const data = await res.json();
        if (data.country) setSelectedCountry(data.country);
        setCurrentUser({ id: Number(userId), name: data.name || 'Guest Fan' });
      } catch (err) {
        console.error(err);
        setSelectedCountry('Morocco');
      }
    };
    fetchSupporter();
  }, [userId]);

  const fetchTeamImage = async (country) => {
    if (!country || teamImages[country]) return;
    try {
      const res = await fetch(`http://localhost:3309/api/teams/getAll`);
      if (!res.ok) throw new Error('Erreur récupération équipes');
      const teams = await res.json();
      const team = teams.find(t => t.country === country);
      if (team?.imageUrl) setTeamImages(prev => ({ ...prev, [country]: team.imageUrl }));
    } catch (err) { console.error(err); }
  };

  // Initial load — ✅ only depends on selectedCountry, NOT teamImages
  useEffect(() => {
    if (!selectedCountry) return;
    setIsLoading(true);
    setIsWelcomeSent(false);
    fetch(`http://localhost:3309/api/messages/community/${selectedCountry}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
          if (data.length > 0) lastMessageIdRef.current = data[data.length - 1].id;
        }
        setIsLoading(false);
        setTimeout(() => scrollToBottom(true), 100);
      })
      .catch(err => { console.error(err); setIsLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry]);

  // Polling — ✅ started ONCE per country, reads values via refs (no dependency churn)
  useEffect(() => {
    if (!selectedCountry) return;
    // wait until initial load is done before starting
    if (isLoading) return;

    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    pollingIntervalRef.current = setInterval(() => {
      fetch(`http://localhost:3309/api/messages/community/${selectedCountry}`)
        .then(res => res.json())
        .then(data => {
          if (!Array.isArray(data) || data.length === 0) return;
          const curLastId = lastMessageIdRef.current;
          const curUserId = currentUserRef.current.id;
          const newMessages = curLastId
            ? data.filter(msg => msg.id > curLastId && msg.supporterId !== curUserId)
            : [];
          if (newMessages.length > 0) {
            setMessages(prev => {
              const filtered = prev.filter(m => !m.isWelcome);
              const merged = [...filtered, ...newMessages];
              const unique = merged.filter((msg, i, self) => i === self.findIndex(m => m.id === msg.id));
              return unique.sort((a, b) => new Date(a.dateOfSend) - new Date(b.dateOfSend));
            });
            lastMessageIdRef.current = data[data.length - 1].id;
            setNewMessageNotification(true);
            setTimeout(() => setNewMessageNotification(false), 3000);
          }
        })
        .catch(err => console.error('Polling error:', err));
    }, 2000);

    return () => { if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current); };
  // ✅ only re-run when country changes or loading finishes — NOT on every message
  }, [selectedCountry, isLoading]);

  useEffect(() => { if (selectedCountry) fetchTeamImage(selectedCountry); }, [selectedCountry]);
  useEffect(() => {
    messages.forEach(msg => { if (msg.country && !teamImages[msg.country]) fetchTeamImage(msg.country); });
  }, [messages]);

  // ✅ FIX: only scroll when WE sent (shouldScrollRef is true)
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
        lastMessageIdRef.current = newMessage.id; // ✅ ref, not state → no re-render
        setInputMessage('');
        setSelectedImage(null);
        setImagePreview(null);
      }
    } catch (error) { console.error(error); }
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
      Afghanistan: 'AF', Albania: 'AL', Algeria: 'DZ', Argentina: 'AR',
      Australia: 'AU', Austria: 'AT', Belgium: 'BE', Brazil: 'BR',
      Canada: 'CA', Chile: 'CL', China: 'CN', Colombia: 'CO',
      Croatia: 'HR', Denmark: 'DK', Egypt: 'EG', England: 'GB',
      France: 'FR', Germany: 'DE', Ghana: 'GH', Greece: 'GR',
      India: 'IN', Iran: 'IR', Italy: 'IT', Japan: 'JP',
      Kenya: 'KE', Malaysia: 'MY', Mexico: 'MX', Morocco: 'MA',
      Netherlands: 'NL', Nigeria: 'NG', Norway: 'NO', Pakistan: 'PK',
      Portugal: 'PT', Qatar: 'QA', Romania: 'RO', Russia: 'RU',
      Senegal: 'SN', Serbia: 'RS', Spain: 'ES', Sweden: 'SE',
      Switzerland: 'CH', Tunisia: 'TN', Turkey: 'TR', UAE: 'AE',
      Ukraine: 'UA', Uruguay: 'UY', USA: 'US',
    };
    const iso = isoMap[countryName];
    if (!iso) return '🌍';
    try {
      return iso.toUpperCase().replace(/./g, char =>
        String.fromCodePoint(127397 + char.charCodeAt(0))
      );
    } catch { return '🌍'; }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
        <img src="/images/logo.png" alt="Loading" className="w-20 h-20 mb-4 animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Community Hub | MoroccoFan2030</title>
        <meta name="description" content="Join the conversation. The voice of the 2030 World Cup fans." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        body {
          font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        h1, h2, h3, h4, .serif-font {
          font-family: 'Amiri', Georgia, serif;
          letter-spacing: -0.01em;
        }
        .decorative-font { font-family: 'Aref Ruqaa', cursive; }

        .bg-pattern {
          background-color: #fafaf9;
          background-image: radial-gradient(#e7e5e4 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .bg-dots {
          background-color: #ffffff;
          background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
        }

        /* Scrollbar – chat container only */
        .chat-scrollbar::-webkit-scrollbar { width: 6px; }
        .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .chat-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

        /* Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes decorative-line {
          0%   { transform: translateX(-100%); opacity: 0; }
          50%  { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }

        .animate-fade-in-up   { animation: fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        .animate-slide-in-right { animation: slideInRight 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
        .animate-slide-in-left  { animation: slideInLeft 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
        .animate-scale-in       { animation: scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }

        .typing-dot { animation: typing-dot 1.4s infinite; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        .message-bubble { transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
        .message-bubble:hover { transform: translateY(-1px); }

        /* ✅ FIX: removed focus-within transform that caused page scroll */
        .send-btn { transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
        .send-btn:active:not(:disabled) { transform: scale(0.95); }
        .send-btn:hover:not(:disabled)  { transform: translateY(-1px); }

        .glow-red   { box-shadow: 0 0 20px rgba(193,39,45,0.25); }
        .glow-green { box-shadow: 0 0 20px rgba(0,98,51,0.25); }

        /* Decorative lines (same as matches page) */
        @keyframes line-sweep {
          0%   { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
        .decorative-line-red,
        .decorative-line-yellow,
        .decorative-line-green {
          animation: line-sweep 8s linear infinite;
          overflow: hidden;
        }
        .decorative-line-red    { animation-delay: 0s; }
        .decorative-line-yellow { animation-delay: 2s; }
        .decorative-line-green  { animation-delay: 4s; }
      `}</style>

      <Navbar />

      {/* ── Hero ──────────────────────────────────────── */}
      <header className="relative w-full pt-32 pb-16 overflow-hidden border-b-2 border-stone-200">
        <div className="absolute inset-0 z-0">
          {teamImages[selectedCountry] && (
            <img src={teamImages[selectedCountry]} alt="Background" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/60" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-stone-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-lg animate-slide-in-left">
                <span className="material-icons text-base">forum</span>
                Fan Community
              </div>
              <h1 className="text-5xl md:text-7xl font-normal tracking-tight text-white mb-4 leading-tight animate-slide-in-left delay-100">
                Connect with{' '}
                <span className="serif-font italic text-[#C1272D] font-medium">Fans</span>
              </h1>
              <p className="text-white/90 text-base md:text-lg leading-relaxed animate-slide-in-left delay-200">
                Join the conversation with supporters from around the world.
              </p>
            </div>

            {selectedCountry && (
              <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-full shadow-lg animate-scale-in delay-300">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                </span>
                <div className="text-white">
                  <div className="text-xs font-bold uppercase tracking-wider">Live in</div>
                  <div className="text-sm font-bold">{selectedCountry}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────── */}
      <main className="relative py-12 bg-stone-50 min-h-screen overflow-hidden">

        {/* Decorative lines – same pattern as matches page */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="decorative-line-red absolute top-40 -left-40 w-[500px] h-0.5 bg-gradient-to-r from-transparent via-[#C1272D]/20 to-transparent" />
          <div className="decorative-line-red absolute top-[600px] right-20 w-[400px] h-0.5 bg-gradient-to-l from-transparent via-[#C1272D]/15 to-transparent" style={{animationDelay:'2s'}} />
          <div className="decorative-line-yellow absolute top-[300px] right-10 w-[450px] h-0.5 bg-gradient-to-r from-amber-400/20 to-transparent" />
          <div className="decorative-line-yellow absolute top-[800px] left-10 w-[380px] h-0.5 bg-gradient-to-r from-transparent via-amber-500/15 to-transparent" style={{animationDelay:'3s'}} />
          <div className="decorative-line-green absolute top-[200px] left-32 w-[420px] h-0.5 bg-gradient-to-r from-[#006233]/20 via-transparent to-transparent" />
          <div className="decorative-line-green absolute top-[900px] right-32 w-[480px] h-0.5 bg-gradient-to-l from-transparent via-[#006233]/15 to-transparent" style={{animationDelay:'1s'}} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">

          {/* Chat card */}
          <div className="bg-white ring-2 ring-stone-200 shadow-[0_8px_40px_rgb(0,0,0,0.08)] rounded-3xl overflow-hidden animate-fade-in-up">

            {/* ── Chat Header ───────────────────────────── */}
            <div className="h-20 border-b-2 border-stone-100 bg-gradient-to-r from-white to-stone-50 flex items-center justify-between px-6 sm:px-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-stone-50 to-stone-100 border-2 border-stone-200 overflow-hidden flex items-center justify-center text-2xl shadow-md">
                    {teamImages[selectedCountry]
                      ? <img src={teamImages[selectedCountry]} alt={selectedCountry} className="w-full h-full object-cover" />
                      : getFlagEmoji(selectedCountry)
                    }
                  </div>
                  {newMessageNotification && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#C1272D] to-[#a01e23] rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                      <span className="text-white text-[10px] font-bold">!</span>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900 leading-tight tracking-tight serif-font">
                    {selectedCountry || 'Select Country'}
                  </h2>
                  <span className="text-xs text-stone-500 font-semibold tracking-wide uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Official Channel
                    {newMessageNotification && (
                      <span className="px-2 py-0.5 bg-[#C1272D] text-white rounded-full text-[10px] font-bold animate-pulse">New</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-gradient-to-br from-stone-200 to-stone-300 shadow-sm hover:scale-110 transition-transform cursor-pointer" />
                  ))}
                </div>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all">
                  <span className="material-icons">more_vert</span>
                </button>
              </div>
            </div>

            {/* ── Messages Area ─────────────────────────── */}
            {/* ✅ FIX: ref is on THIS div (the scrollable container) */}
            <div
              ref={messagesContainerRef}
              className="h-[480px] overflow-y-auto bg-dots chat-scrollbar p-6 sm:p-8 space-y-5"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in-up">
                  <div className="w-20 h-20 bg-gradient-to-br from-stone-100 to-stone-200 rounded-3xl flex items-center justify-center text-stone-400 mb-5 shadow-md">
                    <span className="material-icons text-4xl">chat_bubble_outline</span>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-1 serif-font">Quiet in here</h3>
                  <p className="text-sm text-stone-500 font-medium">Start the chant for {selectedCountry}!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.supporterId === currentUser.id;
                  const isWelcome = msg.isWelcome;
                  const prevMsg = messages[idx - 1];
                  const isSequence = prevMsg && String(prevMsg.supporterId) === String(msg.supporterId);

                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group ${isMe ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}
                      style={{ animationDelay: `${Math.min(idx * 0.04, 0.5)}s` }}
                    >
                      <div className={`flex max-w-[85%] sm:max-w-[70%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>

                        {/* Avatar */}
                        {!isMe && (
                          <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center text-sm font-bold border-2 shadow-sm transition-all ${
                            isWelcome
                              ? 'bg-gradient-to-br from-[#C1272D] to-[#a01e23] text-white border-[#C1272D]'
                              : 'border-stone-200 bg-gradient-to-br from-white to-stone-50 text-stone-700'
                          } ${isSequence ? 'opacity-0' : 'hover:scale-110'}`}>
                            {isWelcome
                              ? <span className="material-icons text-base">emoji_events</span>
                              : (msg.name ? msg.name.charAt(0).toUpperCase() : '?')
                            }
                          </div>
                        )}

                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}>
                          {!isMe && !isSequence && (
                            <span className={`text-xs font-bold ml-1 tracking-tight ${isWelcome ? 'text-[#C1272D]' : 'text-stone-500'}`}>
                              {msg.name}
                            </span>
                          )}

                          {/* Bubble */}
                          <div className={`message-bubble overflow-hidden shadow-md relative
                            ${msg.imageUrl ? 'p-0' : 'px-4 py-3'}
                            ${isMe
                              ? 'bg-gradient-to-br from-[#C1272D] to-[#a01e23] text-white rounded-[1.4rem] rounded-tr-sm glow-red'
                              : isWelcome
                                ? 'bg-gradient-to-br from-green-50 to-white border-2 border-[#006233] text-stone-800 rounded-[1.4rem] rounded-tl-sm'
                                : 'bg-white border-2 border-stone-200 text-stone-800 rounded-[1.4rem] rounded-tl-sm hover:border-stone-300'
                            }`}
                          >
                            {msg.imageUrl && (
                              <div className="relative">
                                <img src={msg.imageUrl} alt="Shared" className="max-w-[280px] max-h-[280px] object-cover rounded-[1.4rem]" />
                                {msg.content && msg.content !== 'Sent an image' && (
                                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent rounded-b-[1.4rem]">
                                    <p className="text-white text-sm font-medium">{msg.content}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            {!msg.imageUrl && (
                              <span className="text-sm leading-relaxed font-medium">{msg.content}</span>
                            )}
                          </div>

                          {/* Timestamp on hover */}
                          <span className="text-[11px] text-stone-400 px-1 opacity-0 group-hover:opacity-100 transition-opacity select-none font-semibold tracking-wide">
                            {msg.dateOfSend ? new Date(msg.dateOfSend).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Input Area ────────────────────────────── */}
            <div className="p-5 sm:p-6 bg-white border-t-2 border-stone-100">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">

                {/* Image preview */}
                {imagePreview && (
                  <div className="mb-3 relative inline-block animate-scale-in">
                    <div className="relative rounded-xl overflow-hidden border-2 border-[#C1272D] shadow-md">
                      <img src={imagePreview} alt="Preview" className="max-w-[160px] max-h-[160px] object-cover" />
                      <button type="button" onClick={removeImage}
                        className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all">
                        <span className="material-icons text-sm">close</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Input row */}
                <div className="relative flex items-center gap-2 bg-stone-50 p-2 rounded-2xl ring-2 ring-stone-200 transition-colors focus-within:ring-[#C1272D]/40 focus-within:bg-white">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:bg-white hover:text-[#C1272D] transition-all flex-shrink-0 hover:scale-110 active:scale-95">
                    <span className="material-icons text-xl">add_photo_alternate</span>
                  </button>

                  <button type="button"
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:bg-white hover:text-stone-600 transition-all flex-shrink-0 hover:scale-110 active:scale-95">
                    <span className="material-icons text-xl">sentiment_satisfied_alt</span>
                  </button>

                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Message ${selectedCountry}...`}
                    className="flex-1 bg-transparent border-none text-sm text-stone-900 placeholder:text-stone-400 focus:ring-0 focus:outline-none py-2.5 px-2 font-medium"
                  />

                  <button
                    type="submit"
                    disabled={isSending || (!inputMessage.trim() && !selectedImage)}
                    className={`send-btn h-10 px-5 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-md
                      ${(!inputMessage.trim() && !selectedImage)
                        ? 'bg-stone-100 text-stone-400 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white hover:shadow-xl hover:shadow-red-500/20 glow-red'
                      }`}
                  >
                    {isSending
                      ? <span className="material-icons animate-spin text-base">refresh</span>
                      : <><span>Send</span><span className="material-icons text-base">send</span></>
                    }
                  </button>
                </div>
              </form>

              <div className="text-center mt-4">
                <p className="text-xs text-stone-400 decorative-font">
                  Be respectful • كن محترماً • Soyez respectueux
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}