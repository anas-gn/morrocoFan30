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

  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    if (!selectedCountry) return;

    setIsLoading(true);

    fetch(`http://localhost:3309/api/messages/community/${selectedCountry}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [selectedCountry]);

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

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !selectedCountry) return;

    setIsSending(true);

    const params = new URLSearchParams();
    params.append('content', inputMessage);
    params.append('country', selectedCountry);
    params.append('supporterId', currentUser.id.toString());

    try {
      const response = await fetch('http://localhost:3309/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
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

  const getCountryCode = (countryName) => {
    if (!countryName) return "WW";

    const codeMap = {
      Afghanistan: "AF", Albania: "AL", Algeria: "DZ", Andorra: "AD",
      Angola: "AO", Argentina: "AR", Armenia: "AM", Australia: "AU",
      Austria: "AT", Azerbaijan: "AZ", Bahrain: "BH", Bangladesh: "BD",
      Belgium: "BE", Brazil: "BR", Bulgaria: "BG", Canada: "CA",
      Chile: "CL", China: "CN", Colombia: "CO", Croatia: "HR",
      Denmark: "DK", Egypt: "EG", England: "EN", Finland: "FI",
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

    return codeMap[countryName] || countryName.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <Head>
        <title>Community Hub | MoroccoFan2030</title>
        <meta name="description" content="Join the conversation. The voice of the 2030 World Cup fans." />
      </Head>

      <style jsx global>{`
        .bg-dots {
          background-color: #ffffff;
          background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        body { font-family: 'Cairo', sans-serif; }
        h1, h2, h3, h4, .serif-font { font-family: 'Amiri', serif; }
        .decorative-font { font-family: 'Aref Ruqaa', serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-enter { animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
      `}</style>

      <Navbar />

      <main className="min-h-screen bg-[#fafaf9] pt-24 pb-8 relative isolate">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-stone-100 to-transparent -z-10 pointer-events-none"></div>
        <div className="fixed top-1/4 left-10 w-96 h-96 bg-[#C1272D]/5 rounded-full blur-[120px] -z-10"></div>
        <div className="fixed bottom-0 right-10 w-80 h-80 bg-[#006233]/5 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-8rem)] flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-end gap-4 animate-enter">
            <div>
              <h1 className="text-3xl md:text-4xl font-medium text-stone-900 leading-none serif-font tracking-tight mb-2">
                Fan <span className="text-[#C1272D]">Community</span>
              </h1>
              <p className="text-stone-500 text-sm max-w-md leading-relaxed">
                Connect with the pulse of the tournament.
              </p>
            </div>
            {selectedCountry && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-stone-200 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wide">Live in {selectedCountry}</span>
              </div>
            )}
          </div>

          <div className="flex-1 bg-white ring-1 ring-stone-900/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden flex flex-col relative animate-enter" style={{animationDelay: '0.1s'}}>
            <div className="h-16 border-b border-stone-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-20 sticky top-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-2xl shadow-sm">
                  {teamImages[selectedCountry] ? (
                    <img
                      src={teamImages[selectedCountry]}
                      alt={`${selectedCountry} team`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getFlagEmoji(selectedCountry)
                  )}
                </div>
                <div className="flex flex-col">
                  <h2 className="text-sm font-bold text-stone-900 leading-tight">
                    {selectedCountry || 'Select Country'}
                  </h2>
                  <span className="text-[10px] text-stone-400 font-medium tracking-wide uppercase">Official Channel</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <div className="hidden sm:flex -space-x-2 mr-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-stone-200" />
                  ))}
                </div>
                <button className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-all">
                  <iconify-icon icon="solar:menu-dots-bold" width="18"></iconify-icon>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-dots relative p-4 sm:p-6 space-y-6">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                  <iconify-icon icon="solar:loading-double-linear" width="40" class="animate-spin text-[#C1272D] mb-3"></iconify-icon>
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-widest">Connecting...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-300 mb-4">
                    <iconify-icon icon="solar:chat-line-linear" width="32"></iconify-icon>
                  </div>
                  <h3 className="text-stone-900 font-semibold mb-1">Quiet in here</h3>
                  <p className="text-sm text-stone-500">Start the chant for {selectedCountry}!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.supporterId === currentUser.id;
                  const prevMsg = messages[idx - 1];
                  const isSequence = prevMsg && String(prevMsg.supporterId) === String(msg.supporterId);

                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-enter group`}
                      style={{animationDelay: '0s'}}
                    >
                      <div className={`flex max-w-[85%] sm:max-w-[70%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isMe && (
                          <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold border border-stone-100 shadow-sm ${isSequence ? 'opacity-0' : 'bg-white text-stone-600'}`}>
                            {msg.name ? msg.name.charAt(0) : '?'}
                          </div>
                        )}

                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {!isMe && !isSequence && (
                            <span className="text-[10px] font-semibold text-stone-400 mb-1 ml-1">
                              {msg.name}
                            </span>
                          )}

                          <div
                            className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all relative group-hover:shadow-md
                            ${isMe
                              ? 'bg-[#C1272D] text-white rounded-[1.25rem] rounded-tr-sm'
                              : 'bg-white border border-stone-200/60 text-stone-700 rounded-[1.25rem] rounded-tl-sm'
                            }`}
                          >
                            {msg.content}
                          </div>

                          <span className={`text-[9px] text-stone-300 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity select-none`}>
                            {msg.dateOfSend ? new Date(msg.dateOfSend).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            <div className="p-4 sm:p-5 bg-gradient-to-t from-white via-white to-transparent z-20">
              <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 max-w-3xl mx-auto bg-white p-1.5 rounded-full ring-1 ring-stone-200 shadow-lg shadow-stone-200/50 transition-shadow focus-within:ring-[#C1272D]/30 focus-within:shadow-xl">
                <button type="button" className="w-10 h-10 flex items-center justify-center rounded-full text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-colors flex-shrink-0">
                  <iconify-icon icon="solar:smile-circle-linear" width="22"></iconify-icon>
                </button>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Message ${selectedCountry}...`}
                  className="flex-1 bg-transparent border-none text-sm text-stone-800 placeholder:text-stone-400 focus:ring-0 focus:outline-none py-2 px-1"
                />

                <button
                  type="submit"
                  disabled={isSending || !inputMessage.trim()}
                  className={`
                    h-10 px-5 rounded-full font-medium text-xs tracking-wide uppercase transition-all flex items-center gap-2
                    ${!inputMessage.trim()
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      : 'bg-[#C1272D] text-white hover:bg-[#a01e23] hover:shadow-lg hover:shadow-red-500/20 active:scale-95'
                    }
                  `}
                >
                  {isSending ? (
                    <iconify-icon icon="solar:loading-linear" width="18" class="animate-spin"></iconify-icon>
                  ) : (
                    <>
                      <span>Send</span>
                      <iconify-icon icon="solar:plain-linear" width="16" class="-mr-1"></iconify-icon>
                    </>
                  )}
                </button>
              </form>
              <div className="text-center mt-3">
                <p className="text-[10px] text-stone-400 decorative-font">Be respectful • كن محترماً • Soyez respectueux</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
