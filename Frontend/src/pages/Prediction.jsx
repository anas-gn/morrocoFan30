"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Head from "next/head";
import Link from "next/link";

export default function Predictions() {
  const [myPredictions, setMyPredictions] = useState([]);
  const [myStats, setMyStats]             = useState(null);
  const [leaderboard, setLeaderboard]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState("predictions"); // "predictions" | "leaderboard"

  const supporterId = typeof window !== "undefined" ? parseInt(localStorage.getItem("supporterId") || "0") : 0;
  const userName    = typeof window !== "undefined" ? localStorage.getItem("userName") || "Fan" : "Fan";

  useEffect(() => {
    if (!supporterId) { setLoading(false); return; }

    Promise.all([
      fetch(`http://localhost:3309/api/predictions/supporter/${supporterId}`).then(r => r.json()),
      fetch(`http://localhost:3309/api/predictions/supporter/${supporterId}/stats`).then(r => r.json()),
      fetch(`http://localhost:3309/api/predictions/leaderboard`).then(r => r.json()),
    ])
      .then(([preds, stats, board]) => {
        setMyPredictions(Array.isArray(preds) ? preds : []);
        setMyStats(stats);
        setLeaderboard(Array.isArray(board) ? board : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [supporterId]);

  // ── helpers ──────────────────────────────────────────────
  const statusStyle = (s) => {
    if (!s) return { bg:"rgba(255,255,255,.07)", color:"rgba(255,255,255,.5)", label:"Pending" };
    const lower = s.toLowerCase();
    if (lower === "correct")   return { bg:"rgba(0,200,120,.15)", color:"#3dba7a", label:" Correct" };
    if (lower === "incorrect") return { bg:"rgba(193,39,45,.15)",  color:"#e85d65", label:" Wrong" };
    return { bg:"rgba(240,165,0,.12)", color:"#f0a500", label:"⏳ Pending" };
  };

  const matchStatusBadge = (s) => {
    if (!s) return { color:"rgba(255,255,255,.4)", label:"—" };
    const l = s.toLowerCase();
    if (l === "finished"|| "termine") return { color:"#a8a29e", label:"Finished" };
    if (l === "direct")   return { color:"#3dba7a", label:"🔴 Live" };
    return { color:"#f0a500", label:"Upcoming" };
  };

  const myRank = leaderboard.findIndex(s => s.id === supporterId) + 1;

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#0e0406" }}>
      <img src="/images/logo.png" alt="" style={{ width:64, height:64, opacity:.7, animation:"spin 1.2s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <Head>
        <title>My Predictions | MoroccoFan2030</title>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Inter:wght@300;400;500;600;700&family=Amiri:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        .pp *, .pp *::before, .pp *::after { box-sizing:border-box; }
        .pp { font-family:'Inter',sans-serif; background:#0e0406; color:#fff; min-height:100vh; }

        /* Animations */
        @keyframes pp-up   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes pp-fade { from{opacity:0} to{opacity:1} }
        .pp .au  { animation:pp-up .55s cubic-bezier(.22,.68,0,1.2) both; }
        .pp .af  { animation:pp-fade .4s ease both; }
        .pp .d1{animation-delay:.04s}.pp .d2{animation-delay:.1s}.pp .d3{animation-delay:.16s}.pp .d4{animation-delay:.22s}.pp .d5{animation-delay:.28s}

        /* Tabs */
        .pp .tab-btn {
          display:inline-flex;align-items:center;gap:8px;
          padding:10px 22px;border-radius:10px;border:none;
          font-family:'Syne',sans-serif;font-size:13px;font-weight:700;
          text-transform:uppercase;letter-spacing:.05em;
          cursor:pointer;transition:all .2s;
        }
        .pp .tab-active {
          background:linear-gradient(135deg,#C1272D,#a01e23);
          color:#fff;box-shadow:0 6px 20px rgba(193,39,45,.3);
        }
        .pp .tab-inactive {
          background:rgba(255,255,255,.06);color:rgba(255,255,255,.5);
          border:1px solid rgba(255,255,255,.08);
        }
        .pp .tab-inactive:hover { background:rgba(255,255,255,.1);color:rgba(255,255,255,.8); }

        /* Cards */
        .pp .pred-card {
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.07);
          border-radius:14px;padding:20px 22px;
          transition:border-color .2s,background .2s;
        }
        .pp .pred-card:hover {
          border-color:rgba(193,39,45,.3);
          background:rgba(255,255,255,.06);
        }

        /* Leaderboard row */
        .pp .lb-row {
          display:grid;
          grid-template-columns:50px 1fr 90px 90px;
          align-items:center;gap:12px;
          padding:14px 20px;
          border-bottom:1px solid rgba(255,255,255,.05);
          transition:background .15s;
          cursor:default;
        }
        .pp .lb-row:last-child { border-bottom:none; }
        .pp .lb-row:hover { background:rgba(255,255,255,.04); }
        .pp .lb-me {
          background:rgba(193,39,45,.08)!important;
          border-left:3px solid #C1272D;
        }

        /* Stat cards */
        .pp .stat-card {
          background:rgba(255,255,255,.05);
          border:1px solid rgba(255,255,255,.07);
          border-radius:14px;padding:20px;
          display:flex;flex-direction:column;gap:6px;
          transition:border-color .2s;
        }
        .pp .stat-card:hover { border-color:rgba(193,39,45,.25); }

        /* Medal colors */
        .pp .gold   { color:#f0a500; }
        .pp .silver { color:#a8b2bf; }
        .pp .bronze { color:#cd7f32; }

        /* Empty state */
        .pp .empty {
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:72px 24px;gap:12px;text-align:center;
        }

        /* Responsive */
        @media(max-width:640px){
          .pp .lb-row { grid-template-columns:42px 1fr 70px; }
          .pp .lb-acc { display:none!important; }
          .pp .stats-grid { grid-template-columns:1fr 1fr!important; }
        }
        @media(max-width:480px){
          .pp .lb-row { grid-template-columns:36px 1fr 60px; padding:12px 14px; }
        }
      `}</style>

      <Navbar />

      <div className="pp">
        {/* ══ PAGE HEADER ══ */}
        <div style={{ paddingTop:96, paddingBottom:0, background:"linear-gradient(to bottom,rgba(45,10,14,.9),#0e0406)", borderBottom:"1px solid rgba(255,255,255,.06)", position:"relative", overflow:"hidden" }}>
          {/* bg glow */}
          <div style={{ position:"absolute", top:-120, left:-120, width:500, height:500, background:"radial-gradient(circle,rgba(193,39,45,.2),transparent 70%)", filter:"blur(80px)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", top:0, right:-80, width:360, height:360, background:"radial-gradient(circle,rgba(0,98,51,.15),transparent 70%)", filter:"blur(80px)", pointerEvents:"none" }} />

          <div style={{ maxWidth:1200, margin:"0 auto", padding:"48px 24px 40px", position:"relative", zIndex:2 }}>
            {/* breadcrumb */}
            <div className="au" style={{ display:"flex", alignItems:"center", gap:6, marginBottom:20, fontSize:11, fontFamily:"Syne,sans-serif", color:"rgba(255,255,255,.35)", textTransform:"uppercase", letterSpacing:".1em" }}>
              <Link href="/Profil" style={{ color:"rgba(255,255,255,.3)", textDecoration:"none" }}>Profil</Link>
             <span className="material-icons" style={{ fontSize:12, color:"rgba(255,255,255,.25)" }}>chevron_right</span>
              <span style={{ color:"#C1272D" }}>Predictions</span>
            </div>

            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:24 }}>
              <div>
                <h1 className="au d1" style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:"clamp(26px,4vw,42px)", color:"#fff", lineHeight:1.1, marginBottom:8 }}>
                  My <span style={{ color:"#C1272D" }}>Predictions</span>
                </h1>
                <p className="au d2" style={{ fontFamily:"Inter,sans-serif", fontSize:14, color:"rgba(255,255,255,.5)", maxWidth:480 }}>
                  Track your match predictions and see how you rank against other fans.
                </p>
              </div>

              {/* Rank badge */}
              {myRank > 0 && (
                <div className="au d3" style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:16, padding:"16px 24px", textAlign:"center", flexShrink:0 }}>
                  <div style={{ fontSize:11, fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Your Rank</div>
                  <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:38, color: myRank===1?"#f0a500":myRank===2?"#a8b2bf":myRank===3?"#cd7f32":"#fff", lineHeight:1 }}>
                    #{myRank}
                  </div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,.35)", fontFamily:"Inter,sans-serif", marginTop:4 }}>of {leaderboard.length} fans</div>
                </div>
              )}
            </div>

            {/* ── STATS ROW ── */}
            {myStats && (
              <div className="stats-grid au d3" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginTop:32 }}>
                {[
                  { label:"Total Points",  value:myStats.totalPoints,       icon:"star",        color:"#f0a500" },
                  { label:"Predictions",   value:myStats.totalPredictions,   icon:"sports_soccer",color:"rgba(255,255,255,.7)" },
                  { label:"Correct",       value:myStats.correctPredictions, icon:"check_circle", color:"#3dba7a" },
                  { label:"Accuracy",      value:`${myStats.accuracy.toFixed(0)}%`, icon:"percent", color:"#C1272D" },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className="stat-card">
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:11, fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(255,255,255,.35)", textTransform:"uppercase", letterSpacing:".08em" }}>{label}</span>
                      <span className="material-icons" style={{ fontSize:16, color, opacity:.7 }}>{icon}</span>
                    </div>
                    <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:28, color, lineHeight:1, marginTop:4 }}>{value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── TABS ── */}
            <div className="au d4" style={{ display:"flex", gap:8, marginTop:95, borderTop:"1px solid rgba(255,255,255,.06)", paddingTop:24 }}>
              <button className={`tab-btn ${activeTab==="predictions"?"tab-active":"tab-inactive"}`} onClick={() => setActiveTab("predictions")}>
                <span className="material-icons" style={{ fontSize:16 }}>sports_soccer</span>
                My Predictions
              </button>
              <button className={`tab-btn ${activeTab==="leaderboard"?"tab-active":"tab-inactive"}`} onClick={() => setActiveTab("leaderboard")}>
                <span className="material-icons" style={{ fontSize:16 }}>leaderboard</span>
                Leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* ══ CONTENT ══ */}
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"36px 24px 72px" }}>

          {/* ── MY PREDICTIONS TAB ── */}
          {activeTab === "predictions" && (
            <div>
              {myPredictions.length === 0 ? (
                <div className="empty af">
                  <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,.05)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}>
                    <span className="material-icons" style={{ fontSize:36, color:"rgba(255,255,255,.2)" }}>sports_soccer</span>
                  </div>
                  <div style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:18, color:"rgba(255,255,255,.6)" }}>No predictions yet</div>
                  <div style={{ fontFamily:"Inter,sans-serif", fontSize:14, color:"rgba(255,255,255,.35)", maxWidth:320 }}>
                    Head to the Matches page and make your first prediction to earn points!
                  </div>
                  <a href="/Matches" style={{ display:"inline-flex", alignItems:"center", gap:8, marginTop:8, padding:"10px 22px", background:"linear-gradient(135deg,#C1272D,#a01e23)", color:"#fff", borderRadius:10, fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:13, textDecoration:"none" }}>
                    <span className="material-icons" style={{ fontSize:16 }}>arrow_forward</span>View Matches
                  </a>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {myPredictions.map((pred, i) => {
                    const ss  = statusStyle(pred.status);
                    const mbs = matchStatusBadge(pred.matchStatus);
                    return (
                      <div key={pred.id} className={`pred-card au d${Math.min(i+1,5)}`}>
                        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>

                          {/* Left: teams */}
                          <div style={{ display:"flex", alignItems:"center", gap:14, flex:1, minWidth:220 }}>
                            {/* Match teams */}
                            <div style={{ display:"flex", flexDirection:"column", gap:4, minWidth:0 }}>
                              <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:14, color:"#fff", lineHeight:1.2 }}>
                                {pred.team1Name || "Team A"} <span style={{ color:"rgba(255,255,255,.25)", fontWeight:400, fontSize:12, margin:"0 4px" }}>vs</span> {pred.team2Name || "Team B"}
                              </div>
                              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                <span className="material-icons" style={{ fontSize:12, color:"rgba(255,255,255,.3)" }}>calendar_today</span>
                                <span style={{ fontFamily:"Inter,sans-serif", fontSize:11, color:"rgba(255,255,255,.35)" }}>
                                  {new Date(pred.dateOfPrediction).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
                                </span>
                                <span style={{ width:3, height:3, borderRadius:"50%", background:"rgba(255,255,255,.15)" }} />
                                <span style={{ fontFamily:"Syne,sans-serif", fontSize:10, fontWeight:700, color:mbs.color, textTransform:"uppercase", letterSpacing:".06em" }}>{mbs.label}</span>
                              </div>
                            </div>
                          </div>

                          {/* Middle: prediction */}
                          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, flexShrink:0 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, padding:"7px 14px" }}>
                              <span className="material-icons" style={{ fontSize:14, color:"#C1272D" }}>sports_soccer</span>
                              <span style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:13, color:"#fff" }}>
                                {pred.predictedWinnerName || "Unknown"}
                              </span>
                            </div>
                          </div>

                          {/* Right: status + points */}
                          <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
                            {/* Status badge */}
                            <div style={{ padding:"6px 14px", borderRadius:8, background:ss.bg, fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:12, color:ss.color, whiteSpace:"nowrap" }}>
                              {ss.label}
                            </div>

                            {/* Points */}
                            <div style={{ textAlign:"center", minWidth:52 }}>
                              <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:22, color: pred.points > 0 ? "#f0a500" : "rgba(255,255,255,.3)", lineHeight:1 }}>
                                {pred.points > 0 ? `+${pred.points}` : "—"}
                              </div>
                              <div style={{ fontSize:9, fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(255,255,255,.25)", textTransform:"uppercase", letterSpacing:".08em", marginTop:2 }}>pts</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── LEADERBOARD TAB ── */}
          {activeTab === "leaderboard" && (
            <div className="af">
              {leaderboard.length === 0 ? (
                <div className="empty">
                  <span className="material-icons" style={{ fontSize:48, color:"rgba(255,255,255,.15)" }}>leaderboard</span>
                  <div style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:18, color:"rgba(255,255,255,.4)" }}>No rankings yet</div>
                </div>
              ) : (
                <div>
                  {/* Header */}
                  <div style={{ display:"grid", gridTemplateColumns:"50px 1fr 90px 90px", gap:12, padding:"10px 20px", marginBottom:4 }}>
                    {["Rank", "Fan", "Points", "Accuracy"].map((h, i) => (
                      <div key={h} className="lb-acc" style={{ fontFamily:"Syne,sans-serif", fontSize:9, fontWeight:700, color:"rgba(255,255,255,.3)", textTransform:"uppercase", letterSpacing:".1em", textAlign:i>=2?"right":"left", display: i===3 ? undefined : "block" }}>
                        {h}
                      </div>
                    ))}
                  </div>

                  {/* Rows */}
                  <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, overflow:"hidden" }}>
                    {leaderboard.map((supporter, idx) => {
                      const rank   = idx + 1;
                      const isMe   = supporter.id === supporterId;
                      const medal  = rank===1?"gold":rank===2?"silver":rank===3?"bronze":null;

                      return (
                        <div key={supporter.id} className={`lb-row${isMe?" lb-me":""}`}>

                          {/* Rank */}
                          <div style={{ textAlign:"center" }}>
                            {medal ? (
                              <span className={`material-icons ${medal}`} style={{ fontSize:20 }}>
                                {rank===1?"emoji_events":rank===2?"military_tech":"workspace_premium"}
                              </span>
                            ) : (
                              <span style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:13, color:"rgba(255,255,255,.4)" }}>#{rank}</span>
                            )}
                          </div>

                          {/* Name */}
                          <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                            {/* Avatar */}
                            <div style={{ width:36, height:36, borderRadius:"50%", background: isMe?"#C1272D":"rgba(255,255,255,.1)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:13, color:"#fff", flexShrink:0, border: isMe?"2px solid rgba(193,39,45,.5)":"2px solid rgba(255,255,255,.08)" }}>
                              {(supporter.name||"?").slice(0,1).toUpperCase()}
                            </div>
                            <div style={{ minWidth:0 }}>
                              <div style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:13, color: isMe?"#fff":"rgba(255,255,255,.8)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                {supporter.name}{isMe && <span style={{ marginLeft:8, fontSize:9, fontFamily:"Syne,sans-serif", fontWeight:800, padding:"2px 7px", background:"rgba(193,39,45,.3)", border:"1px solid rgba(193,39,45,.4)", borderRadius:999, color:"#e85d65", textTransform:"uppercase", letterSpacing:".08em", verticalAlign:"middle" }}>You</span>}
                              </div>
                              <div style={{ fontSize:11, color:"rgba(255,255,255,.3)", fontFamily:"Inter,sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{supporter.email}</div>
                            </div>
                          </div>

                          {/* Points */}
                          <div style={{ textAlign:"right" }}>
                            <span style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:16, color: rank<=3?"#f0a500":"#fff" }}>
                              {supporter.totalPoints}
                            </span>
                            <span style={{ fontSize:10, color:"rgba(255,255,255,.3)", fontFamily:"Syne,sans-serif", marginLeft:4 }}>pts</span>
                          </div>

                          {/* Accuracy placeholder */}
                          <div className="lb-acc" style={{ textAlign:"right" }}>
                            <span style={{ fontFamily:"Inter,sans-serif", fontSize:13, color:"rgba(255,255,255,.45)" }}>—</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Your position callout (if not in top view) */}
                  {myRank > 0 && (
                    <div style={{ marginTop:20, padding:"14px 20px", background:"rgba(193,39,45,.07)", border:"1px solid rgba(193,39,45,.2)", borderRadius:12, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                      <span className="material-icons" style={{ fontSize:20, color:"#C1272D", flexShrink:0 }}>person_pin</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:13, color:"#fff" }}>You are ranked #{myRank} out of {leaderboard.length} fans</div>
                        <div style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:"rgba(255,255,255,.4)", marginTop:2 }}>
                          Keep predicting to climb the leaderboard!
                        </div>
                      </div>
                      {myStats && (
                        <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:22, color:"#f0a500", flexShrink:0 }}>
                          {myStats.totalPoints} <span style={{ fontSize:11, color:"rgba(255,255,255,.4)", fontWeight:400 }}>pts</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}