import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Groups() {
  const router = useRouter();
  const [groups, setGroups]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [viewMode, setViewMode] = useState('groups'); // groups | standings | knockout
  const [activeGroup, setActiveGroup] = useState(null);

  useEffect(() => {
    fetch('https://anas-gana1-fandb-backend.hf.space/api/groups/getAll')
      .then(r => r.json())
      .then(d => { setGroups(d.groups || d || []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  // Stats derived from groups
  const totalTeams  = groups.reduce((acc, g) => acc + (g.groupTeams?.length || 0), 0);
  const totalGroups = groups.length;
  const qualified   = groups.reduce((acc, g) => acc + Math.min(g.groupTeams?.length || 0, 2), 0);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#fff' }}>
      <div style={{ width: 48, height: 48, border: '3px solid #C1272D', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '100px 24px', color: '#C1272D' }}>
      <Navbar />
      <p style={{ marginTop: 80, fontSize: 18 }}>Failed to load groups: {error}</p>
    </div>
  );

  const ACCENT_COLORS = ['#C1272D', '#006233', '#b45309', '#1e40af', '#7c3aed', '#0e7490', '#be185d', '#15803d'];

  return (
    <>
      <Head>
        <title>Tournament Groups | MoroccoFan2030</title>
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

        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes shimmer{ from{transform:translateX(-100%)} to{transform:translateX(100%)} }

        .fu { animation: fadeUp .5s ease-out forwards; opacity: 0; }
        .fi { animation: fadeIn .4s ease-out forwards; opacity: 0; }
        .d1 { animation-delay:.08s; } .d2 { animation-delay:.16s; }
        .d3 { animation-delay:.24s; } .d4 { animation-delay:.32s; }
        .d5 { animation-delay:.40s; } .d6 { animation-delay:.48s; }

        .pill { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;border:1px solid; }
        .pill-host    { background:rgba(193,39,45,.08);  color:#C1272D; border-color:rgba(193,39,45,.25); }
        .pill-gold    { background:rgba(240,165,0,.1);   color:#b45309; border-color:rgba(240,165,0,.3);  }
        .pill-green   { background:rgba(0,98,51,.1);     color:#006233; border-color:rgba(0,98,51,.3);    }
        .pill-default { background:rgba(0,0,0,.04);      color:#a8a29e; border-color:rgba(0,0,0,.08);     }

        .nosb::-webkit-scrollbar { display:none; }
        .nosb { -ms-overflow-style:none; scrollbar-width:none; }

        .stat-card { background:#fff; border:1px solid #e7e5e4; border-radius:16px; padding:20px 16px; text-align:center; transition:border-color .2s, box-shadow .2s; }
        .stat-card:hover { border-color:#C1272D; box-shadow:0 4px 20px rgba(193,39,45,.08); }
        .stat-val { font-size:36px; font-weight:800; line-height:1; font-family:'Syne',sans-serif; }
        .stat-lbl { font-size:11px; color:#a8a29e; text-transform:uppercase; letter-spacing:.08em; margin-top:6px; font-weight:500; }

        /* Group cards */
        .group-card {
          background:#fff;
          border:1px solid #e7e5e4;
          border-radius:16px;
          overflow:hidden;
          transition:border-color .2s, transform .2s, box-shadow .2s;
          border-left:3px solid transparent;
        }
        .group-card:hover {
          transform:translateY(-3px);
          box-shadow:0 12px 32px rgba(193,39,45,.1);
        }

        /* Team row hover */
        .team-row { transition:background .15s; cursor:pointer; }
        .team-row:hover { background:#fafaf9; }

        /* Standings table */
        .standings-card {
          background:#fff;
          border:1px solid #e7e5e4;
          border-radius:16px;
          overflow:hidden;
          transition:border-color .2s, box-shadow .2s;
        }
        .standings-card:hover { border-color:rgba(193,39,45,.2); box-shadow:0 8px 24px rgba(193,39,45,.06); }

        /* View toggle active */
        .view-active { background:linear-gradient(to right,#2d0a0e,#1a0608)!important; color:#fff!important; border-color:transparent!important; }

        /* Bracket */
        .bracket-match { background:#fff; border:1px solid #e7e5e4; border-radius:12px; overflow:hidden; transition:border-color .2s, box-shadow .2s; }
        .bracket-match:hover { border-color:#C1272D; box-shadow:0 4px 16px rgba(193,39,45,.1); }

        /* Qualified indicator */
        .qualified-bar { width:3px; height:100%; background:linear-gradient(to bottom,#006233,#3dba7a); border-radius:2px; flex-shrink:0; }

        /* Points badge */
        .pts-badge { display:inline-flex;align-items:center;justify-content:center;min-width:32px;height:28px;padding:0 8px;border-radius:8px;font-family:'Syne',sans-serif;font-weight:800;font-size:14px; }

        @media(max-width:640px){
          .stat-val { font-size:28px; }
          .groups-grid { grid-template-columns:1fr!important; }
        }
      `}</style>

      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <header className="relative overflow-hidden" style={{ paddingTop: 80, minHeight: 460 }}>
        <div className="absolute inset-0">
          <img src="/images/celeb.jpeg" alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}
               onError={e => e.target.style.display='none'} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(45,10,14,.92) 0%,rgba(26,6,8,.85) 55%,rgba(0,98,51,.25) 100%)' }} />
          <div className="absolute inset-0 opacity-[.07] pointer-events-none"
               style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/moroccan-flower.png')", backgroundSize:'180px' }} />
        </div>

        {/* Glows */}
        <div className="absolute top-16 left-8 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background:'rgba(193,39,45,.14)' }} />
        <div className="absolute bottom-0 right-8 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background:'rgba(0,98,51,.14)' }} />

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          {/* Badge */}
          <div className="fu mb-8">
            <span className="pill pill-host" style={{ fontSize:11, padding:'5px 14px' }}>
              <span className="material-icons" style={{ fontSize:12 }}>emoji_events</span>
              Group Stage
            </span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            {/* Title */}
            <div className="fu d1">
              <h1 className="syne" style={{ fontSize:'clamp(40px,7vw,76px)', fontWeight:800, lineHeight:1, letterSpacing:'-.02em', color:'#fff', marginBottom:12 }}>
                Tournament<br />
                <span style={{ color:'#C1272D' }} className="serif italic">Groups</span>
              </h1>
              <p style={{ fontSize:15, color:'rgba(255,255,255,.6)', maxWidth:440, lineHeight:1.7 }}>
                Follow the journey from group stage to glory across {totalGroups} groups battling for the ultimate prize.
              </p>
            </div>

            {/* Stats */}
            <div className="fu d2 flex gap-8 md:gap-12">
              {[
                { v: totalGroups, l:'Groups',  c:'#C1272D' },
                { v: totalTeams,  l:'Teams',   c:'#f0a500' },
                { v: qualified,   l:'Advance', c:'#3dba7a' },
              ].map(({ v, l, c }) => (
                <div key={l} style={{ textAlign:'center' }}>
                  <div className="syne" style={{ fontSize:44, fontWeight:800, color:c, lineHeight:1 }}>{v}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.45)', textTransform:'uppercase', letterSpacing:'.1em', marginTop:4, fontWeight:600 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
             style={{ background:'linear-gradient(to bottom,transparent,#fff)' }} />
      </header>

      {/* ══ STAT CARDS ════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 mb-6">
        <div className="fu d2" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12, marginTop:50 }}>
          {[
            { v: totalGroups,                                                           l:'Groups',    c:'#C1272D' },
            { v: totalTeams,                                                            l:'Teams',     c:'#78716c' },
            { v: qualified,                                                             l:'Qualify',   c:'#006233' },
            { v: groups.reduce((a,g)=>a+(g.groupTeams?.filter(t=>t.wins>0).length||0),0), l:'Won Match',c:'#b45309' },
          ].map(({ v, l, c }) => (
            <div key={l} className="stat-card fu d3">
              <div className="stat-val" style={{ color:c }}>{v}</div>
              <div className="stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ VIEW TOGGLE (sticky) ══════════════════════════════════════════ */}
      <div className="sticky z-40 bg-white border-b border-stone-100 shadow-sm" style={{ top:80 }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id:'groups',    icon:'view_module',  label:'Groups'    },
              { id:'standings', icon:'leaderboard',  label:'Standings' },
              { id:'knockout',  icon:'account_tree', label:'Knockout'  },
            ].map(({ id, icon, label }) => (
              <button key={id} onClick={() => setViewMode(id)}
                      className={`flex items-center gap-2 px-4 py-2 border-2 rounded-xl text-xs font-semibold transition-all ${viewMode === id ? 'view-active' : 'bg-white border-stone-200 text-stone-700'}`}
                      style={{ fontFamily:'Syne,sans-serif' }}>
                <span className="material-icons" style={{ fontSize:14 }}>{icon}</span>
                {label}
              </button>
            ))}

            <div style={{ flex:1 }} />

            {/* Points legend */}
            <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:11, color:'#a8a29e' }}>
              <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:'#f0a500', display:'inline-block' }} />W=3
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:'#78716c', display:'inline-block' }} />D=1
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:'#e7e5e4', display:'inline-block' }} />L=0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MAIN CONTENT ══════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10" style={{ minHeight:'60vh' }}>

        {/* ── GROUPS VIEW ── */}
        {viewMode === 'groups' && (
          <div className="groups-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
            {groups.map((group, gi) => {
              const accent = ACCENT_COLORS[gi % ACCENT_COLORS.length];
              const sorted = [...(group.groupTeams || [])].sort((a,b) => (b.wins*3+b.draws) - (a.wins*3+a.draws));
              return (
                <div key={group.id} className={`group-card fu`} style={{ animationDelay:`${gi*.06}s`, borderLeftColor: accent }}>
                  {/* Card header — dark like match cards */}
                  <div style={{ background:'linear-gradient(to right,#2d0a0e,#1a0608)', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:11, color:'rgba(255,255,255,.35)', letterSpacing:'.1em', textTransform:'uppercase' }}>Group</span>
                      <div style={{ width:28, height:28, borderRadius:8, background:accent, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:13, color:'#fff' }}>{String.fromCharCode(65+gi)}</span>
                      </div>
                      <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'#fff' }}></span>
                    </div>
                   
                  </div>

                  {/* Table */}
                  <div style={{ padding:'16px' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom:'1px solid #f5f5f4' }}>
                          {['#','Team','P','W','D','L','Pts'].map((h, hi) => (
                            <th key={h} style={{ fontFamily:'Syne,sans-serif', fontSize:9, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'#a8a29e', padding:'0 4px 8px', textAlign: hi===1?'left':'center', width: hi===0?20:hi===1?'auto':28 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sorted.map((team, ti) => {
                          const pts = team.wins*3 + team.draws;
                          const mp  = team.wins + team.draws + (team.losses || team.loses || 0);
                          const isQ = ti < 2;
                          return (
                            <tr key={team.id} className="team-row" onClick={() => router.push(`/Team?id=${team.teamID || team.teamId}`)}>
                              <td style={{ padding:'9px 4px', textAlign:'center' }}>
                                <div style={{ width:20, height:20, borderRadius:6, background: ti===0?'linear-gradient(135deg,#f0a500,#b45309)': ti===1?'linear-gradient(135deg,#006233,#3dba7a)': '#f5f5f4', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                  <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:10, color: ti<2?'#fff':'#a8a29e' }}>{ti+1}</span>
                                </div>
                              </td>
                              <td style={{ padding:'9px 4px' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                                  {isQ && <div style={{ width:2, height:24, background:'linear-gradient(to bottom,#006233,#3dba7a)', borderRadius:2, flexShrink:0 }} />}
                                  <div style={{ width:28, height:28, borderRadius:'50%', overflow:'hidden', border:'1.5px solid #e7e5e4', flexShrink:0, background:'#fafaf9' }}>
                                    <img src={team.teamImageUrl} alt={team.teamName} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                                         onError={e => e.target.style.display='none'} />
                                  </div>
                                  <span style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight: ti===0?600:400, color: ti===0?'#1c1917':'#57534e', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:80 }}>{team.teamName}</span>
                                </div>
                              </td>
                              <td style={{ padding:'9px 4px', textAlign:'center', fontFamily:'Syne,sans-serif', fontSize:11, color:'#78716c' }}>{mp}</td>
                              <td style={{ padding:'9px 4px', textAlign:'center', fontFamily:'Syne,sans-serif', fontSize:11, fontWeight:700, color:'#006233' }}>{team.wins}</td>
                              <td style={{ padding:'9px 4px', textAlign:'center', fontFamily:'Syne,sans-serif', fontSize:11, color:'#b45309' }}>{team.draws}</td>
                              <td style={{ padding:'9px 4px', textAlign:'center', fontFamily:'Syne,sans-serif', fontSize:11, color:'#C1272D' }}>{team.losses || team.loses || 0}</td>
                              <td style={{ padding:'9px 4px', textAlign:'center' }}>
                                <span className="pts-badge" style={{ background: ti===0?'linear-gradient(135deg,#f0a500,#b45309)': ti===1?'linear-gradient(135deg,#006233,#3dba7a)': '#f5f5f4', color: ti<2?'#fff':'#78716c' }}>{pts}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Qualification note */}
                    <div style={{ marginTop:12, paddingTop:10, borderTop:'1px solid #f5f5f4', display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:'linear-gradient(135deg,#006233,#3dba7a)' }} />
                      <span style={{ fontSize:10, color:'#a8a29e', fontFamily:'Inter,sans-serif' }}>Top 2 advance to Round of 16</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── STANDINGS VIEW ── */}
        {viewMode === 'standings' && (
          <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
            {groups.map((group, gi) => {
              const accent = ACCENT_COLORS[gi % ACCENT_COLORS.length];
              const sorted = [...(group.groupTeams || [])].sort((a,b) => {
                const ptsA = a.wins*3+a.draws, ptsB = b.wins*3+b.draws;
                if (ptsB !== ptsA) return ptsB - ptsA;
                const gdA = (a.goalsScored||0)-(a.goalsConceded||0), gdB = (b.goalsScored||0)-(b.goalsConceded||0);
                return gdB - gdA;
              });
              return (
                <div key={group.id} className={`standings-card fu`} style={{ animationDelay:`${gi*.07}s` }}>
                  {/* Header */}
                  <div style={{ background:'linear-gradient(to right,#2d0a0e,#1a0608)', padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderLeft:`4px solid ${accent}` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:36, height:36, borderRadius:10, background:accent, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16, color:'#fff' }}>{String.fromCharCode(65+gi)}</span>
                      </div>
                      <div>
                        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16, color:'#fff' }}>{group.name}</div>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,.35)', letterSpacing:'.08em', textTransform:'uppercase' }}>Group Stage Standings</div>
                      </div>
                    </div>
                   
                  </div>

                  {/* Table */}
                  <div style={{ padding:'0', overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', minWidth:560 }}>
                      <thead>
                        <tr style={{ borderBottom:'2px solid #f5f5f4' }}>
                          {['POS','Team','MP','W','D','L','GF','GA','GD','PTS'].map((h,hi) => (
                            <th key={h} style={{ fontFamily:'Syne,sans-serif', fontSize:9, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'#a8a29e', padding:'12px 10px', textAlign: hi===1?'left':'center', whiteSpace:'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sorted.map((team, ti) => {
                          const pts = team.wins*3 + team.draws;
                          const mp  = team.wins + team.draws + (team.losses || team.loses || 0);
                          const gf  = team.goalsScored   || 0;
                          const ga  = team.goalsConceded || 0;
                          const gd  = gf - ga;
                          const isQ = ti < 2;
                          return (
                            <tr key={team.id} className="team-row" onClick={() => router.push(`/Team?id=${team.teamID || team.teamId}`)}
                                style={{ borderBottom:'1px solid #f5f5f4', background: isQ ? 'rgba(0,98,51,.02)' : '' }}>
                              <td style={{ padding:'14px 10px', textAlign:'center' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:6, justifyContent:'center' }}>
                                  {isQ && <div style={{ width:3, height:32, background:`linear-gradient(to bottom,${accent},${accent}88)`, borderRadius:2 }} />}
                                  <div style={{ width:26, height:26, borderRadius:8, background: ti===0?'linear-gradient(135deg,#f0a500,#b45309)': ti===1?`linear-gradient(135deg,${accent},${accent}99)`: '#f5f5f4', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                    <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:11, color: ti<2?'#fff':'#a8a29e' }}>{ti+1}</span>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding:'14px 10px' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                  <div style={{ width:36, height:36, borderRadius:'50%', overflow:'hidden', border:'2px solid #e7e5e4', flexShrink:0, background:'#fafaf9' }}>
                                    <img src={team.teamImageUrl} alt={team.teamName} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                                         onError={e => e.target.style.display='none'} />
                                  </div>
                                  <div>
                                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight: isQ?700:400, fontSize:13, color:'#1c1917' }}>{team.teamName}</div>
                                    {isQ && <div style={{ fontSize:9, color:'#006233', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:3, marginTop:1 }}>
                                      <span className="material-icons" style={{ fontSize:10 }}>check_circle</span>On track
                                    </div>}
                                  </div>
                                </div>
                              </td>
                              {[mp, team.wins, team.draws, team.losses||team.loses||0, gf, ga].map((val,vi) => (
                                <td key={vi} style={{ padding:'14px 10px', textAlign:'center', fontFamily:'Syne,sans-serif', fontSize:12, fontWeight: [1,2,3].includes(vi)?700:400, color: vi===1?'#006233': vi===2?'#b45309': vi===3?'#C1272D': '#78716c' }}>{val}</td>
                              ))}
                              <td style={{ padding:'14px 10px', textAlign:'center' }}>
                                <span style={{ fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, color: gd>0?'#006233': gd<0?'#C1272D':'#78716c' }}>{gd>0?'+':''}{gd}</span>
                              </td>
                              <td style={{ padding:'14px 10px', textAlign:'center' }}>
                                <span className="pts-badge" style={{ background: ti===0?'linear-gradient(135deg,#f0a500,#b45309)': ti===1?`linear-gradient(135deg,${accent},${accent}99)`: '#f5f5f4', color: ti<2?'#fff':'#78716c', fontSize:15 }}>{pts}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── KNOCKOUT VIEW ── */}
        {viewMode === 'knockout' && (
          <div>
            {/* Header info */}
            <div style={{ background:'#fff', border:'1px solid #e7e5e4', borderRadius:16, padding:'20px 24px', marginBottom:32, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:3, height:24, background:'linear-gradient(to bottom,#C1272D,#006233)', borderRadius:2 }} />
                <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, color:'#1c1917' }}>Road to the Final</span>
              </div>
              <span className="pill pill-gold">
                <span className="material-icons" style={{ fontSize:11 }}>emoji_events</span>
                World Cup 2030
              </span>
            </div>

            {/* Bracket */}
            <div style={{ overflowX:'auto' }}>
              <div style={{ minWidth:1100, padding:'0 8px' }}>
                {/* Round labels */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 140px 1fr 1fr 1fr', gap:12, marginBottom:12 }}>
                  {['Round of 16','Quarter-Finals','Semi-Finals','Final','Semi-Finals','Quarter-Finals','Round of 16'].map((label,i) => (
                    <div key={i} style={{ textAlign:'center', fontFamily:'Syne,sans-serif', fontSize:9, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color: label==='Final'?'#f0a500': label.includes('Semi')?'#C1272D': '#a8a29e' }}>{label}</div>
                  ))}
                </div>

                {/* Bracket grid */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 140px 1fr 1fr 1fr', gap:12, alignItems:'center' }}>
                  {/* R16 Left */}
                  <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    {[1,2,3,4].map(n => (
                      <div key={n} className="bracket-match">
                        <div style={{ background:'linear-gradient(to right,#2d0a0e,#1a0608)', height:3 }} />
                        <div style={{ padding:'10px 12px' }}>
                          {['TBD','TBD'].map((t,ti) => (
                            <div key={ti} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 0', borderBottom: ti===0?'1px solid #f5f5f4':'' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                                <div style={{ width:22, height:22, borderRadius:'50%', background:'#f5f5f4', border:'1.5px solid #e7e5e4' }} />
                                <span style={{ fontSize:11, color:'#a8a29e', fontFamily:'Syne,sans-serif' }}>{t}</span>
                              </div>
                              <span style={{ fontSize:11, color:'#d6d3d1', fontFamily:'Syne,sans-serif', fontWeight:700 }}>-</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* QF Left */}
                  <div style={{ display:'flex', flexDirection:'column', gap:16, paddingTop:72, paddingBottom:72 }}>
                    {[1,2].map(n => (
                      <div key={n} className="bracket-match" style={{ border:'1px solid rgba(240,165,0,.3)' }}>
                        <div style={{ background:'linear-gradient(to right,#f0a500,#b45309)', height:3 }} />
                        <div style={{ padding:'10px 12px' }}>
                          {[`Winner R${n*2-1}`,`Winner R${n*2}`].map((t,ti) => (
                            <div key={ti} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 0', borderBottom: ti===0?'1px solid #f5f5f4':'' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                                <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(240,165,0,.1)', border:'1.5px solid rgba(240,165,0,.3)' }} />
                                <span style={{ fontSize:11, color:'#b45309', fontFamily:'Syne,sans-serif', fontWeight:600 }}>{t}</span>
                              </div>
                              <span style={{ fontSize:11, color:'#d6d3d1', fontFamily:'Syne,sans-serif', fontWeight:700 }}>-</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* SF Left */}
                  <div style={{ display:'flex', flexDirection:'column', gap:16, paddingTop:200, paddingBottom:200 }}>
                    <div className="bracket-match" style={{ border:'1px solid rgba(193,39,45,.3)' }}>
                      <div style={{ background:'linear-gradient(to right,#C1272D,#a01e23)', height:3 }} />
                      <div style={{ padding:'10px 12px' }}>
                        {['Winner QF1','Winner QF2'].map((t,ti) => (
                          <div key={ti} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 0', borderBottom: ti===0?'1px solid #f5f5f4':'' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                              <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(193,39,45,.1)', border:'1.5px solid rgba(193,39,45,.3)' }} />
                              <span style={{ fontSize:11, color:'#C1272D', fontFamily:'Syne,sans-serif', fontWeight:600 }}>{t}</span>
                            </div>
                            <span style={{ fontSize:11, color:'#d6d3d1', fontFamily:'Syne,sans-serif', fontWeight:700 }}>-</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Final Center */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ background:'linear-gradient(135deg,#1a1209,#2d1e00)', border:'2px solid rgba(240,165,0,.5)', borderRadius:16, padding:'20px 14px', textAlign:'center', boxShadow:'0 0 40px rgba(240,165,0,.15)', minWidth:120 }}>
                      <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:10, color:'#f0a500', letterSpacing:'.12em', textTransform:'uppercase', marginBottom:12 }}>🏆 Final</div>
                      {['SF Winner 1','SF Winner 2'].map((t,ti) => (
                        <div key={ti} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom: ti===0?'1px solid rgba(255,255,255,.08):':'' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <div style={{ width:24, height:24, borderRadius:'50%', background:'rgba(240,165,0,.2)', border:'1.5px solid rgba(240,165,0,.4)' }} />
                            <span style={{ fontSize:10, color:'rgba(255,255,255,.6)', fontFamily:'Syne,sans-serif' }}>{t}</span>
                          </div>
                          <span style={{ fontSize:11, color:'rgba(255,255,255,.2)', fontFamily:'Syne,sans-serif', fontWeight:700 }}>-</span>
                        </div>
                      ))}
                      <div style={{ marginTop:12, paddingTop:10, borderTop:'1px solid rgba(240,165,0,.2)' }}>
                        <span style={{ fontFamily:'Syne,sans-serif', fontSize:9, fontWeight:700, color:'#f0a500', letterSpacing:'.1em', textTransform:'uppercase' }}>Champions 2030</span>
                      </div>
                    </div>
                  </div>

                  {/* SF Right */}
                  <div style={{ display:'flex', flexDirection:'column', gap:16, paddingTop:200, paddingBottom:200 }}>
                    <div className="bracket-match" style={{ border:'1px solid rgba(193,39,45,.3)' }}>
                      <div style={{ background:'linear-gradient(to right,#a01e23,#C1272D)', height:3 }} />
                      <div style={{ padding:'10px 12px' }}>
                        {['Winner QF3','Winner QF4'].map((t,ti) => (
                          <div key={ti} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 0', borderBottom: ti===0?'1px solid #f5f5f4':'' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                              <span style={{ fontSize:11, color:'#d6d3d1', fontFamily:'Syne,sans-serif', fontWeight:700 }}>-</span>
                              <span style={{ fontSize:11, color:'#C1272D', fontFamily:'Syne,sans-serif', fontWeight:600 }}>{t}</span>
                              <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(193,39,45,.1)', border:'1.5px solid rgba(193,39,45,.3)' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* QF Right */}
                  <div style={{ display:'flex', flexDirection:'column', gap:16, paddingTop:72, paddingBottom:72 }}>
                    {[3,4].map(n => (
                      <div key={n} className="bracket-match" style={{ border:'1px solid rgba(240,165,0,.3)' }}>
                        <div style={{ background:'linear-gradient(to right,#b45309,#f0a500)', height:3 }} />
                        <div style={{ padding:'10px 12px' }}>
                          {[`Winner R${(n-2)*2+5}`,`Winner R${(n-2)*2+6}`].map((t,ti) => (
                            <div key={ti} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 0', borderBottom: ti===0?'1px solid #f5f5f4':'' }}>
                              <span style={{ fontSize:11, color:'#d6d3d1', fontFamily:'Syne,sans-serif', fontWeight:700 }}>-</span>
                              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                                <span style={{ fontSize:11, color:'#b45309', fontFamily:'Syne,sans-serif', fontWeight:600 }}>{t}</span>
                                <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(240,165,0,.1)', border:'1.5px solid rgba(240,165,0,.3)' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* R16 Right */}
                  <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    {[5,6,7,8].map(n => (
                      <div key={n} className="bracket-match">
                        <div style={{ background:'linear-gradient(to right,#1a0608,#2d0a0e)', height:3 }} />
                        <div style={{ padding:'10px 12px' }}>
                          {['TBD','TBD'].map((t,ti) => (
                            <div key={ti} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 0', borderBottom: ti===0?'1px solid #f5f5f4':'' }}>
                              <span style={{ fontSize:11, color:'#d6d3d1', fontFamily:'Syne,sans-serif', fontWeight:700 }}>-</span>
                              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                                <span style={{ fontSize:11, color:'#a8a29e', fontFamily:'Syne,sans-serif' }}>{t}</span>
                                <div style={{ width:22, height:22, borderRadius:'50%', background:'#f5f5f4', border:'1.5px solid #e7e5e4' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stage counts */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginTop:40 }}>
                  {[
                    { v:16, l:'Round of 16', c:'#78716c', bg:'#f5f5f4' },
                    { v:8,  l:'Quarter-Finals', c:'#b45309', bg:'rgba(240,165,0,.08)' },
                    { v:4,  l:'Semi-Finals',    c:'#C1272D', bg:'rgba(193,39,45,.05)' },
                    { v:1,  l:'Champion',       c:'#f0a500', bg:'rgba(240,165,0,.1)', icon:'emoji_events' },
                  ].map(({ v, l, c, bg, icon }) => (
                    <div key={l} style={{ background:bg, border:`1px solid ${c}22`, borderRadius:12, padding:'16px', textAlign:'center' }}>
                      <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:c, display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                        {icon && <span className="material-icons" style={{ fontSize:22, color:c }}>{icon}</span>}
                        {v}
                      </div>
                      <div style={{ fontSize:11, color:c, textTransform:'uppercase', letterSpacing:'.08em', marginTop:4, fontWeight:600 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}