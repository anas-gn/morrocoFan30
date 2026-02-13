import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Community() {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const [selectedCountry, setSelectedCountry] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState({ id: userId ? Number(userId) : 1, name: 'Guest Fan' });
  const [teamImages, setTeamImages] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isWelcomeSent, setIsWelcomeSent] = useState(false);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [newMessageNotification, setNewMessageNotification] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    const fetchSupporter = async () => {
      if (!userId) return;

      try {
        const res = await fetch(`http://localhost:3309/api/supporters/${userId}`);
        if (!res.ok) throw new Error("Erreur récupération supporter");

        const data = await res.json();
        if (data.country) {
          setSelectedCountry(data.country);
        }
        setCurrentUser({ id: Number(userId), name: data.name || 'Guest Fan' });
      } catch (err) {
        console.error(err);
        setSelectedCountry("Morocco");
      }
    };

    fetchSupporter();
  }, [userId]);

  const fetchTeamImage = async (country) => {
    if (!country || teamImages[country]) return;

    try {
      const res = await fetch(`http://localhost:3309/api/teams/getAll`);
      if (!res.ok) throw new Error("Erreur récupération équipes");

      const teams = await res.json();
      const team = teams.find(t => t.country === country);

      if (team && team.imageUrl) {
        setTeamImages(prev => ({ ...prev, [country]: team.imageUrl }));
      }
    } catch ( err ) {
      console.error(err);
    }
  };

  // Initial load of messages
  useEffect(() => {
    if (!selectedCountry) return;

    setIsLoading(true);

    fetch(`http://localhost:3309/api/messages/community/${selectedCountry}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
          
          // Set last message ID for polling
          if (data.length > 0) {
            setLastMessageId(data[data.length - 1].id);
          }
          
          // Send welcome message with team image if not already sent
          if (!isWelcomeSent && teamImages[selectedCountry]) {
            const welcomeMessage = {
              id: 'welcome-' + Date.now(),
              content: `Welcome to ${selectedCountry} fans community! 🎉`,
              imageUrl: teamImages[selectedCountry],
              supporterId: 0,
              name: 'System',
              dateOfSend: new Date().toISOString(),
              isWelcome: true
            };
            setMessages(prev => [welcomeMessage, ...prev]);
            setIsWelcomeSent(true);
          }
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [selectedCountry, teamImages]);

  // Real-time polling for new messages
  useEffect(() => {
    if (!selectedCountry || isLoading) return;

    // Clear existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Poll for new messages every 2 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetch(`http://localhost:3309/api/messages/community/${selectedCountry}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            // Check if there are new messages
            const newMessages = lastMessageId 
              ? data.filter(msg => msg.id > lastMessageId && msg.supporterId !== currentUser.id)
              : [];

            if (newMessages.length > 0) {
              console.log('New messages detected:', newMessages.length);
              
              // Add new messages
              setMessages(prev => {
                // Remove welcome message if it exists
                const filteredPrev = prev.filter(m => !m.isWelcome);
                // Merge and remove duplicates
                const merged = [...filteredPrev, ...newMessages];
                const unique = merged.filter((msg, index, self) => 
                  index === self.findIndex(m => m.id === msg.id)
                );
                return unique.sort((a, b) => new Date(a.dateOfSend) - new Date(b.dateOfSend));
              });
              
              // Update last message ID
              setLastMessageId(data[data.length - 1].id);
              
              // Show notification
              setNewMessageNotification(true);
              setTimeout(() => setNewMessageNotification(false), 3000);
              
              // Play sound (optional)
              try {
                const audio = new Audio('/notification.mp3');
                audio.volume = 0.3;
                audio.play().catch(() => {});
              } catch (e) {
                // Ignore audio errors
              }
            }
          }
        })
        .catch(err => console.error('Polling error:', err));
    }, 2000); // Poll every 2 seconds

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedCountry, lastMessageId, currentUser.id, isLoading]);

  useEffect(() => {
    if (selectedCountry) {
      fetchTeamImage(selectedCountry);
    }
  }, [selectedCountry]);

  useEffect(() => {
    messages.forEach(msg => {
      if (msg.country && !teamImages[msg.country]) {
        fetchTeamImage(msg.country);
      }
    });
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if ((!inputMessage.trim() && !selectedImage) || !selectedCountry) return;

    setIsSending(true);

    const params = new URLSearchParams();
    params.append('content', inputMessage || 'Sent an image');
    params.append('country', selectedCountry);
    params.append('supporterId', currentUser.id.toString());
    
    if (selectedImage) {
      params.append('imageUrl', imagePreview);
    }

    try {
      const response = await fetch('http://localhost:3309/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });

      if (response.ok) {
        const newMessage = await response.json();
        if (selectedImage) {
          newMessage.imageUrl = imagePreview;
        }
        setMessages(prev => [...prev, newMessage]);
        setLastMessageId(newMessage.id); // Update last message ID
        setInputMessage('');
        setSelectedImage(null);
        setImagePreview(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFlagEmoji = (countryName) => {
    if (!countryName) return "🌍";
    try {
      const isoMap = {
        Afghanistan: "AF", Albania: "AL", Algeria: "DZ", Andorra: "AD",
        Angola: "AO", Argentina: "AR", Armenia: "AM", Australia: "AU",
        Austria: "AT", Azerbaijan: "AZ", Bahrain: "BH", Bangladesh: "BD",
        Belgium: "BE", Brazil: "BR", Bulgaria: "BG", Canada: "CA",
        Chile: "CL", China: "CN", Colombia: "CO", Croatia: "HR",
        Denmark: "DK", Egypt: "EG", England: "GB", Finland: "FI",
        France: "FR", Germany: "DE", Ghana: "GH", Greece: "GR",
        India: "IN", Indonesia: "ID", Iran: "IR", Iraq: "IQ",
        Ireland: "IE", Italy: "IT", Japan: "JP", Jordan: "JO",
        Kenya: "KE", Kuwait: "KW", Lebanon: "LB", Libya: "LY",
        Malaysia: "MY", Mexico: "MX", Morocco: "MA", Netherlands: "NL",
        Nigeria: "NG", Norway: "NO", Pakistan: "PK", Palestine: "PS",
        Paraguay: "PY", Peru: "PE", Poland: "PL", Portugal: "PT",
        Qatar: "QA", Romania: "RO", Russia: "RU", SaudiArabia: "SA",
        Senegal: "SN", Serbia: "RS", SouthAfrica: "ZA", SouthKorea: "KR",
        Spain: "ES", Sweden: "SE", Switzerland: "CH", Tunisia: "TN",
        Turkey: "TR", UAE: "AE", Ukraine: "UA", Uruguay: "UY",
        USA: "US", UnitedStates: "US"
      };

      const iso = isoMap[countryName];
      if (!iso) return "🌍";

      return iso.toUpperCase().replace(/./g, char =>
        String.fromCodePoint(127397 + char.charCodeAt(0))
      );
    } catch {
      return "🌍";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
        <img
          src="/images/logo.png"
          alt="Loading"
          className="w-20 h-20 mb-4 animate-pulse"
        />
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
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </Head>

      <style jsx global>{`
        /* Fonts */
        body { 
          font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        h1, h2, h3, h4, .serif-font { 
          font-family: 'Amiri', Georgia, serif;
          letter-spacing: -0.01em;
        }
        .decorative-font { 
          font-family: 'Aref Ruqaa', cursive;
        }

        /* Background */
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

        /* Scrollbar */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Custom Scrollbar for Messages */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(193, 39, 45, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(193, 39, 45, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(193, 39, 45, 0);
          }
        }

        @keyframes typing-dot {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }

        /* Animation Classes */
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fade-in-down {
          animation: fadeInDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }

        /* Delays */
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }

        /* Message Bubble Hover Effect */
        .message-bubble {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .message-bubble:hover {
          transform: translateY(-1px);
        }

        /* Input Focus Effect */
        .input-wrapper {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .input-wrapper:focus-within {
          transform: translateY(-2px);
        }

        /* Send Button Effect */
        .send-button {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .send-button:active:not(:disabled) {
          transform: scale(0.95);
        }

        .send-button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        /* Typing Indicator */
        .typing-dot {
          animation: typing-dot 1.4s infinite;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        /* Gradient Text */
        .gradient-text {
          background: linear-gradient(135deg, #C1272D 0%, #006233 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Glow Effect */
        .glow-red {
          box-shadow: 0 0 20px rgba(193, 39, 45, 0.3);
        }

        .glow-green {
          box-shadow: 0 0 20px rgba(0, 98, 51, 0.3);
        }
      `}</style>

      <Navbar />

      {/* Hero Section */}
      <header className="relative w-full pt-32 pb-16 overflow-hidden border-b-2 border-stone-200">
        <div className="absolute inset-0 z-0">
          <img
            src={teamImages[selectedCountry]}
            alt="Community Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-stone-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-lg animate-slide-in-left">
                <span className="material-icons text-base">forum</span>
                Fan Community
              </div>
              <h1 className="text-5xl md:text-7xl font-normal tracking-tight text-white mb-4 leading-tight animate-slide-in-left delay-100">
                Connect with <span className="serif-font italic text-[#C1272D] font-medium">Fans</span>
              </h1>
              <p className="text-white/90 text-base md:text-lg leading-relaxed animate-slide-in-left delay-200">
                Join the conversation with supporters from around the world.
              </p>
            </div>

            {/* Live Badge */}
            {selectedCountry && (
              <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-full shadow-lg animate-scale-in delay-300">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
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

      {/* Main Content */}
      <main className="relative py-12 bg-stone-50 min-h-screen overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#C1272D]/5 rounded-full blur-[120px] animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute bottom-0 right-10 w-80 h-80 bg-[#006233]/5 rounded-full blur-[100px] animate-pulse" style={{animationDuration: '5s'}}></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Chat Container */}
          <div className="bg-white ring-2 ring-stone-200 shadow-[0_8px_40px_rgb(0,0,0,0.08)] rounded-3xl overflow-hidden animate-fade-in-up">
            {/* Chat Header */}
            <div className="h-24 border-b-2 border-stone-100 bg-gradient-to-r from-white to-stone-50 flex items-center justify-between px-8">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-50 to-stone-100 border-2 border-stone-200 flex items-center justify-center text-3xl shadow-lg animate-pulse-ring">
                    {teamImages[selectedCountry] ? (
                      <img
                        src={teamImages[selectedCountry]}
                        alt={`${selectedCountry} team`}
                        className="w-full h-full rounded-2xl object-cover"
                      />
                    ) : (
                      getFlagEmoji(selectedCountry)
                    )}
                  </div>
                  {/* New Message Indicator */}
                  {newMessageNotification && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#C1272D] to-[#a01e23] rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-stone-900 leading-tight tracking-tight serif-font">
                    {selectedCountry || 'Select Country'}
                  </h2>
                  <span className="text-xs text-stone-500 font-semibold tracking-wide uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Official Channel
                    {newMessageNotification && (
                      <span className="ml-2 px-2 py-0.5 bg-[#C1272D] text-white rounded-full text-[10px] font-bold animate-pulse">
                        New
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex -space-x-3">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-stone-200 to-stone-300 shadow-md hover:scale-110 transition-transform cursor-pointer"
                    />
                  ))}
                </div>
                <button className="w-12 h-12 flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all hover:scale-110">
                  <span className="material-icons">more_vert</span>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="h-[500px] overflow-y-auto bg-dots custom-scrollbar p-8 space-y-6">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-full border-4 border-stone-200 border-t-[#C1272D] animate-spin mb-4"></div>
                  <p className="text-sm font-bold text-stone-600 uppercase tracking-widest animate-pulse">Connecting...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in-up">
                  <div className="w-24 h-24 bg-gradient-to-br from-stone-100 to-stone-200 rounded-3xl flex items-center justify-center text-stone-400 mb-6 shadow-lg">
                    <span className="material-icons text-5xl">chat_bubble_outline</span>
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 mb-2 serif-font">Quiet in here</h3>
                  <p className="text-base text-stone-500 font-medium">Start the chant for {selectedCountry}!</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => {
                    const isMe = msg.supporterId === currentUser.id;
                    const isWelcome = msg.isWelcome;
                    const prevMsg = messages[idx - 1];
                    const isSequence = prevMsg && String(prevMsg.supporterId) === String(msg.supporterId);

                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group ${isMe ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}
                        style={{animationDelay: `${idx * 0.05}s`}}
                      >
                        <div className={`flex max-w-[85%] sm:max-w-[70%] gap-4 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isMe && (
                            <div className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center text-sm font-bold border-2 shadow-md transition-all ${
                              isWelcome 
                                ? 'bg-gradient-to-br from-[#C1272D] to-[#a01e23] text-white border-[#C1272D]' 
                                : 'border-stone-200 bg-gradient-to-br from-white to-stone-50 text-stone-700'
                            } ${isSequence ? 'opacity-0' : 'hover:scale-110'}`}>
                              {isWelcome ? (
                                <span className="material-icons">emoji_events</span>
                              ) : (
                                msg.name ? msg.name.charAt(0).toUpperCase() : '?'
                              )}
                            </div>
                          )}

                          <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}>
                            {!isMe && !isSequence && (
                              <span className={`text-xs font-bold ml-1 tracking-tight ${
                                isWelcome ? 'text-[#C1272D]' : 'text-stone-500'
                              }`}>
                                {msg.name}
                              </span>
                            )}

                            <div
                              className={`message-bubble overflow-hidden shadow-lg transition-all relative
                              ${msg.imageUrl ? 'p-0' : 'px-5 py-3.5'}
                              ${isMe
                                ? 'bg-gradient-to-br from-[#C1272D] to-[#a01e23] text-white rounded-[1.5rem] rounded-tr-md glow-red'
                                : isWelcome
                                ? 'bg-gradient-to-br from-green-50 to-white border-2 border-[#006233] text-stone-800 rounded-[1.5rem] rounded-tl-md'
                                : 'bg-white border-2 border-stone-200 text-stone-800 rounded-[1.5rem] rounded-tl-md hover:border-stone-300'
                              }`}
                            >
                              {msg.imageUrl && (
                                <div className="relative">
                                  <img 
                                    src={msg.imageUrl} 
                                    alt="Shared image" 
                                    className="max-w-[300px] max-h-[300px] object-cover rounded-[1.5rem]"
                                  />
                                  {msg.content && msg.content !== 'Sent an image' && (
                                    <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-[1.5rem]`}>
                                      <p className="text-white text-sm font-medium">{msg.content}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                              {!msg.imageUrl && (
                                <span className="text-base leading-relaxed font-medium">{msg.content}</span>
                              )}
                            </div>

                            <span className={`text-[11px] text-stone-400 px-2 opacity-0 group-hover:opacity-100 transition-opacity select-none font-semibold tracking-wide`}>
                              {msg.dateOfSend ? new Date(msg.dateOfSend).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start animate-fade-in-up">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center border-2 border-stone-200">
                          <span className="material-icons text-stone-500">person</span>
                        </div>
                        <div className="bg-white border-2 border-stone-200 rounded-2xl px-6 py-4 flex gap-2">
                          <div className="w-2.5 h-2.5 bg-stone-400 rounded-full typing-dot"></div>
                          <div className="w-2.5 h-2.5 bg-stone-400 rounded-full typing-dot"></div>
                          <div className="w-2.5 h-2.5 bg-stone-400 rounded-full typing-dot"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-6 sm:p-8 bg-gradient-to-t from-white via-white/95 to-transparent border-t-2 border-stone-100">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-4 relative inline-block animate-scale-in">
                    <div className="relative rounded-2xl overflow-hidden border-2 border-[#C1272D] shadow-lg">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-w-[200px] max-h-[200px] object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                      >
                        <span className="material-icons text-sm">close</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="input-wrapper relative flex items-center gap-3 bg-white p-2.5 rounded-2xl ring-2 ring-stone-200 shadow-xl transition-all focus-within:ring-[#C1272D]/40 focus-within:shadow-2xl focus-within:glow-red">
                  {/* Image Upload Button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-12 h-12 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-50 hover:text-[#C1272D] transition-all flex-shrink-0 hover:scale-110 active:scale-95"
                    title="Upload image"
                  >
                    <span className="material-icons text-xl">add_photo_alternate</span>
                  </button>

                  {/* Emoji Button */}
                  <button 
                    type="button" 
                    className="w-12 h-12 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-all flex-shrink-0 hover:scale-110 active:scale-95"
                  >
                    <span className="material-icons text-xl">sentiment_satisfied_alt</span>
                  </button>

                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value);
                      setIsTyping(e.target.value.length > 0);
                    }}
                    onBlur={() => setIsTyping(false)}
                    placeholder={`Message ${selectedCountry}...`}
                    className="flex-1 bg-transparent border-none text-base text-stone-900 placeholder:text-stone-400 focus:ring-0 focus:outline-none py-3 px-2 font-medium"
                  />

                  <button
                    type="submit"
                    disabled={isSending || (!inputMessage.trim() && !selectedImage)}
                    className={`
                      send-button h-12 px-7 rounded-xl font-bold text-sm tracking-wider uppercase transition-all flex items-center gap-2.5 shadow-lg
                      ${(!inputMessage.trim() && !selectedImage)
                        ? 'bg-stone-100 text-stone-400 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-[#C1272D] to-[#a01e23] text-white hover:shadow-2xl hover:shadow-red-500/30 glow-red'
                      }
                    `}
                  >
                    {isSending ? (
                      <span className="material-icons animate-spin">refresh</span>
                    ) : (
                      <>
                        <span>Send</span>
                        <span className="material-icons text-lg">send</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
              <div className="text-center mt-5">
                <p className="text-xs text-stone-400 decorative-font font-medium">
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