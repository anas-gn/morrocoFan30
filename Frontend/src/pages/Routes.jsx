"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const API = "https://anas-gana1-fandb-backend.hf.space/api";

export default function RoutesPage() {
  const [routes, setRoutes]           = useState([]);
  const [cities, setCities]           = useState([]);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [filtering, setFiltering]     = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  // filters
  const [fromCity, setFromCity]   = useState("");
  const [toCity, setToCity]       = useState("");
  const [minPrice, setMinPrice]   = useState("");
  const [maxPrice, setMaxPrice]   = useState("");
  const [sortBy, setSortBy]       = useState("price-asc");
  const [activeView, setActiveView] = useState("all"); // "all" | "cheapest" | "popular"

  /* ─── initial load ─── */
  useEffect(() => {
    Promise.all([
      fetch(`${API}/routes/all`).then(r => r.json()),
      fetch(`${API}/acceuil/CityHosts/all`).then(r => r.json()),
      fetch(`${API}/routes/statistics`).then(r => r.json()),
    ]).then(([r, c, s]) => {
      setRoutes(Array.isArray(r) ? r : []);
      setCities(Array.isArray(c) ? c : []);
      setStats(s && typeof s === "object" ? s : null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  /* ─── switch views ─── */
  const switchView = async (view) => {
    setActiveView(view);
    setFiltering(true);
    try {
      let url = `${API}/routes/all`;
      if (view === "cheapest") url = `${API}/routes/cheapestAll?limit=10`;
      if (view === "popular")  url = `${API}/routes/popular?limit=10`;
      const data = await fetch(url).then(r => r.json());
      setRoutes(Array.isArray(data) ? data : []);
    } catch (_) {}
    setFiltering(false);
  };

  /* ─── filter ─── */
  const applyFilter = async () => {
    setFiltering(true);
    setActiveView("all");
    try {
      const p = new URLSearchParams();
      if (fromCity) p.set("fromCityId", fromCity);
      if (toCity)   p.set("toCityId",   toCity);
      if (minPrice) p.set("minPrice",   minPrice);
      if (maxPrice) p.set("maxPrice",   maxPrice);
      const data = await fetch(`${API}/routes/filter?${p}`).then(r => r.json());
      setRoutes(Array.isArray(data) ? data : []);
    } catch (_) {}
    setFiltering(false);
  };

  const resetFilter = async () => {
    setFromCity(""); setToCity(""); setMinPrice(""); setMaxPrice("");
    setActiveView("all");
    setFiltering(true);
    const data = await fetch(`${API}/routes/all`).then(r => r.json()).catch(() => []);
    setRoutes(Array.isArray(data) ? data : []);
    setFiltering(false);
  };

  /* ─── open route detail ─── */
  const openRoute = async (id) => {
    setSelectedRoute({ _loading: true });
    try {
      const data = await fetch(`${API}/routes/${id}`).then(r => r.json());
      setSelectedRoute(data);
    } catch (_) { setSelectedRoute(null); }
  };

  /* ─── sorted client-side ─── */
  const sorted = [...routes].sort((a, b) => {
    if (sortBy === "price-asc")  return (a.priceProxim || 0) - (b.priceProxim || 0);
    if (sortBy === "price-desc") return (b.priceProxim || 0) - (a.priceProxim || 0);
    if (sortBy === "name-asc")   return (a.name || "").localeCompare(b.name || "");
    if (sortBy === "name-desc")  return (b.name || "").localeCompare(a.name || "");
    return 0;
  });

  /* ─── transport icon guess ─── */
  const tIcon = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("train") || n.includes("oncf") || n.includes("rail")) return "train";
    if (n.includes("bus")   || n.includes("ctm")  || n.includes("coach"))return "directions_bus";
    if (n.includes("taxi")  || n.includes("car")  || n.includes("voiture"))return "local_taxi";
    if (n.includes("flight")|| n.includes("air")  || n.includes("avion")) return "flight";
    if (n.includes("boat")  || n.includes("ferry"))                        return "directions_boat";
    return "commute";
  };

  /* ─── Loading ─── */
  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#090204" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <img src="/images/logo.png" alt="" style={{ width:60, height:60, opacity:.7, animation:"s 1.2s linear infinite" }} />
        <style>{`@keyframes s{to{transform:rotate(360deg)}}`}</style>
        <span style={{ fontFamily:"Syne,sans-serif", fontSize:12, color:"rgba(255,255,255,.3)", letterSpacing:".1em", textTransform:"uppercase" }}>Loading routes…</span>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Routes | MoroccoFan2030</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Inter:wght@300;400;500;600;700&family=Amiri:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        .rp *, .rp *::before, .rp *::after { box-sizing:border-box; }
        .rp {
          font-family:'Inter',sans-serif;
          background:#090204; color:#fff; min-height:100vh;
        }

        /* Animations */
        @keyframes rp-up   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
        @keyframes rp-fade { from{opacity:0} to{opacity:1} }
        @keyframes rp-spin { to{transform:rotate(360deg)} }
        .rp .au  { animation:rp-up  .55s cubic-bezier(.22,.68,0,1.2) both; }
        .rp .af  { animation:rp-fade .35s ease both; }
        .rp .d1{animation-delay:.04s} .rp .d2{animation-delay:.10s}
        .rp .d3{animation-delay:.16s} .rp .d4{animation-delay:.22s}
        .rp .d5{animation-delay:.28s} .rp .d6{animation-delay:.34s}
        .rp .spin{ animation:rp-spin 1s linear infinite; }

        /* ── Stat chip ── */
        .rp .stat-chip {
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.07);
          border-radius:14px; padding:16px 20px;
          display:flex; flex-direction:column; gap:5px;
          transition:border-color .2s;
        }
        .rp .stat-chip:hover { border-color:rgba(193,39,45,.25); }

        /* ── Filter bar ── */
        .rp .fbar {
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.07);
          border-radius:16px; padding:22px 24px;
          margin-bottom:28px;
        }
        .rp .fbar select, .rp .fbar input {
          width:100%;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.09);
          border-radius:10px; color:#fff;
          font-family:'Syne',sans-serif; font-size:12px; font-weight:600;
          padding:10px 14px; outline:none;
          transition:border-color .18s;
          appearance:none; -webkit-appearance:none;
        }
        .rp .fbar select:focus, .rp .fbar input:focus { border-color:rgba(193,39,45,.55); }
        .rp .fbar select option { background:#1a060a; color:#fff; }
        .rp .fbar input::placeholder { color:rgba(255,255,255,.25); }
        .rp .fbar input::-webkit-inner-spin-button { -webkit-appearance:none; }

        /* ── Tab pill ── */
        .rp .tab {
          display:inline-flex; align-items:center; gap:7px;
          padding:9px 18px; border-radius:10px;
          font-family:'Syne',sans-serif; font-size:11px; font-weight:700;
          text-transform:uppercase; letter-spacing:.05em;
          border:none; cursor:pointer; transition:all .18s;
        }
        .rp .tab-on {
          background:linear-gradient(135deg,#C1272D,#a01e23);
          color:#fff; box-shadow:0 4px 16px rgba(193,39,45,.3);
        }
        .rp .tab-off {
          background:rgba(255,255,255,.06); color:rgba(255,255,255,.5);
          border:1px solid rgba(255,255,255,.08);
        }
        .rp .tab-off:hover { background:rgba(255,255,255,.1); color:#fff; }

        /* ── Route card ── */
        .rp .rc {
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.07);
          border-radius:16px; overflow:hidden;
          transition:all .22s; cursor:pointer;
        }
        .rp .rc:hover {
          border-color:rgba(193,39,45,.4);
          box-shadow:0 12px 40px rgba(193,39,45,.12);
          transform:translateY(-2px);
        }

        /* ── City badge ── */
        .rp .city-badge {
          display:flex; flex-direction:column; align-items:center; gap:5px;
          min-width:90px;
        }
        .rp .city-dot {
          width:40px; height:40px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0;
        }

        /* ── Arrow ── */
        .rp .arrow-wrap {
          flex:1; display:flex; flex-direction:column; align-items:center; gap:5px; min-width:60px;
        }
        .rp .arrow-line {
          width:100%; height:1px;
          background:linear-gradient(to right,rgba(0,98,51,.5),rgba(193,39,45,.5));
          position:relative;
        }
        .rp .arrow-line::after {
          content:""; position:absolute; right:-1px; top:50%;
          transform:translateY(-50%);
          border-left:7px solid rgba(193,39,45,.6);
          border-top:4px solid transparent;
          border-bottom:4px solid transparent;
        }

        /* ── Price badge ── */
        .rp .price-badge {
          display:flex; align-items:baseline; gap:3px;
        }

        /* ── Tag ── */
        .rp .tag {
          display:inline-flex; align-items:center; gap:4px;
          padding:3px 9px; border-radius:999px;
          font-family:'Syne',sans-serif; font-size:9px; font-weight:700;
          text-transform:uppercase; letter-spacing:.07em;
        }
        .rp .t-red  { background:rgba(193,39,45,.14);  border:1px solid rgba(193,39,45,.28); color:#e85d65; }
        .rp .t-grn  { background:rgba(0,98,51,.14);    border:1px solid rgba(0,98,51,.28);   color:#3dba7a; }
        .rp .t-gld  { background:rgba(240,165,0,.12);  border:1px solid rgba(240,165,0,.25); color:#f0a500; }
        .rp .t-pur  { background:rgba(124,58,237,.14); border:1px solid rgba(124,58,237,.28);color:#a78bfa; }

        /* ── Buttons ── */
        .rp .btn-red {
          display:inline-flex; align-items:center; gap:6px;
          padding:10px 20px; border-radius:10px;
          background:linear-gradient(135deg,#C1272D,#a01e23); color:#fff;
          font-family:'Syne',sans-serif; font-size:12px; font-weight:700;
          text-transform:uppercase; letter-spacing:.05em;
          border:none; cursor:pointer; transition:all .2s;
          box-shadow:0 4px 14px rgba(193,39,45,.25);
          white-space:nowrap;
        }
        .rp .btn-red:hover { transform:translateY(-1px); box-shadow:0 8px 22px rgba(193,39,45,.4); }
        .rp .btn-red:disabled { opacity:.5; cursor:not-allowed; transform:none; }
        .rp .btn-ghost {
          display:inline-flex; align-items:center; gap:6px;
          padding:10px 16px; border-radius:10px;
          background:rgba(255,255,255,.06); color:rgba(255,255,255,.55);
          font-family:'Syne',sans-serif; font-size:12px; font-weight:700;
          text-transform:uppercase; letter-spacing:.05em;
          border:1px solid rgba(255,255,255,.09); cursor:pointer; transition:all .2s;
          white-space:nowrap;
        }
        .rp .btn-ghost:hover { background:rgba(255,255,255,.1); color:#fff; }

        /* ── Modal ── */
        .rp .modal-bg {
          position:fixed; inset:0; z-index:9990;
          background:rgba(0,0,0,.78);
          backdrop-filter:blur(7px);
          display:flex; align-items:center; justify-content:center;
          padding:16px;
          animation:rp-fade .2s ease;
        }
        .rp .modal {
          background:rgba(18,4,6,.98);
          border:1px solid rgba(193,39,45,.22);
          border-radius:20px;
          width:100%; max-width:640px;
          max-height:90vh; overflow-y:auto;
          box-shadow:0 32px 80px rgba(0,0,0,.7);
          animation:rp-up .22s cubic-bezier(.22,.68,0,1.2);
        }
        .rp .modal::-webkit-scrollbar { width:4px; }
        .rp .modal::-webkit-scrollbar-thumb { background:rgba(193,39,45,.3); border-radius:99px; }

        /* ── Transport item ── */
        .rp .ti {
          display:flex; align-items:flex-start; gap:14px;
          padding:16px 20px;
          border-bottom:1px solid rgba(255,255,255,.05);
          transition:background .15s;
        }
        .rp .ti:last-child { border-bottom:none; }
        .rp .ti:hover { background:rgba(255,255,255,.03); }

        /* Responsive */
        @media(max-width:860px){
          .rp .fgrid { grid-template-columns:1fr 1fr!important; }
          .rp .fgrid .fspan { grid-column:span 2; }
        }
        @media(max-width:560px){
          .rp .fgrid { grid-template-columns:1fr!important; }
          .rp .fgrid .fspan { grid-column:span 1; }
          .rp .stats-grid { grid-template-columns:1fr 1fr!important; }
          .rp .rc-inner { flex-direction:column!important; align-items:flex-start!important; gap:16px!important; }
          .rp .rc-right { align-items:flex-start!important; }
        }
      `}</style>

      <Navbar />

      <div className="rp">

        {/* ══════════ HERO HEADER ══════════ */}
        <div style={{ paddingTop:88, background:"linear-gradient(to bottom,rgba(40,8,12,.9),#090204)", borderBottom:"1px solid rgba(255,255,255,.05)", position:"relative", overflow:"hidden" }}>
          {/* bg glows */}
          <div style={{ position:"absolute", top:-100, right:-60, width:500, height:500, background:"radial-gradient(circle,rgba(193,39,45,.18),transparent 70%)", filter:"blur(90px)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-80, left:-80, width:400, height:400, background:"radial-gradient(circle,rgba(0,98,51,.12),transparent 70%)", filter:"blur(80px)", pointerEvents:"none" }} />
          {/* zellige pattern overlay */}
          <div style={{ position:"absolute", inset:0, opacity:.025, backgroundImage:"repeating-linear-gradient(45deg,#C1272D 0,#C1272D 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,#006233 0,#006233 1px,transparent 0,transparent 50%)", backgroundSize:"20px 20px", pointerEvents:"none" }} />

          <div style={{ maxWidth:1200, margin:"0 auto", padding:"48px 24px 44px", position:"relative", zIndex:2 }}>

            {/* breadcrumb */}
            <div className="au" style={{ display:"flex", alignItems:"center", gap:6, marginBottom:20, fontSize:10, fontFamily:"Syne,sans-serif", color:"rgba(255,255,255,.3)", textTransform:"uppercase", letterSpacing:".1em" }}>
              <Link href="/Profil" style={{ color:"rgba(255,255,255,.3)", textDecoration:"none" }}>Profil</Link>
              <span className="material-icons" style={{ fontSize:12 }}>chevron_right</span>
              <span style={{ color:"#C1272D" }}>Routes</span>
            </div>

            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:24, flexWrap:"wrap",marginTop:95 }}>
              <div>
                <h1 className="au d1" style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:"clamp(28px,4.5vw,52px)", color:"#fff", lineHeight:1.05, margin:0 }}>
                  Travel <span style={{ color:"#C1272D" }}>Routes</span>
                </h1>
                <p className="au d2" style={{ fontFamily:"Inter,sans-serif", fontSize:14, color:"rgba(255,255,255,.45)", maxWidth:500, lineHeight:1.7, margin:"10px 0 0" }}>
                  Discover the best travel options between Morocco&apos;s World Cup host cities — by train, bus, or taxi.
                </p>
              </div>

              {/* Decorative arabic text */}
              <div className="au d3" style={{ fontFamily:"Amiri,serif", fontStyle:"italic", fontSize:28, color:"rgba(0,98,51,.35)", lineHeight:1.2, textAlign:"right" }}>
                المسالك<br/>والطرق
              </div>
            </div>

            {/* ── STATS ROW ── */}
            {stats && (
              <div className="au d3 stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginTop:32 }}>
                {[
                  { label:"Total Routes",  value:stats.totalRoutes ?? "—",                              icon:"route",          color:"rgba(255,255,255,.75)" },
                  { label:"From",          value:stats.minPrice     != null ? `${Math.round(stats.minPrice)} MAD`    : "—", icon:"arrow_downward", color:"#3dba7a" },
                  { label:"Average",       value:stats.averagePrice != null ? `${Math.round(stats.averagePrice)} MAD`: "—", icon:"payments",       color:"#f0a500" },
                  { label:"Up To",         value:stats.maxPrice     != null ? `${Math.round(stats.maxPrice)} MAD`    : "—", icon:"arrow_upward",   color:"#C1272D" },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className="stat-chip">
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span className="material-icons" style={{ fontSize:13, color, opacity:.8 }}>{icon}</span>
                      <span style={{ fontSize:9, fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(255,255,255,.3)", textTransform:"uppercase", letterSpacing:".08em" }}>{label}</span>
                    </div>
                    <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:22, color, lineHeight:1 }}>{value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── VIEW TABS ── */}
            <div className="au d4" style={{ display:"flex", gap:8, marginTop:28, paddingTop:24, borderTop:"1px solid rgba(255,255,255,.06)", flexWrap:"wrap" }}>
              {[
                { id:"all",      label:"All Routes", icon:"route" },
                { id:"cheapest", label:"Best Deals",  icon:"local_offer" },
                { id:"popular",  label:"Popular",     icon:"trending_up" },
              ].map(({ id, label, icon }) => (
                <button key={id} className={`tab ${activeView === id ? "tab-on" : "tab-off"}`} onClick={() => switchView(id)}>
                  <span className="material-icons" style={{ fontSize:14 }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════ CONTENT ══════════ */}
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 24px 80px" }}>

          {/* ── FILTER BAR ── */}
          <div className="fbar au d2">
            <div style={{ fontSize:10, fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(255,255,255,.35)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:14, display:"flex", alignItems:"center", gap:7 }}>
              <span className="material-icons" style={{ fontSize:14, color:"#C1272D" }}>tune</span>
              Filter Routes
            </div>
            <div className="fgrid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 110px 110px auto auto", gap:12, alignItems:"end" }}>

              {/* From */}
              <div>
                <label style={{ display:"block", fontSize:9, fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(255,255,255,.3)", textTransform:"uppercase", letterSpacing:".09em", marginBottom:6 }}>
                  Departure City
                </label>
                <div style={{ position:"relative" }}>
                  <select value={fromCity} onChange={e => setFromCity(e.target.value)}>
                    <option value="">All cities</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <span className="material-icons" style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", fontSize:14, color:"rgba(255,255,255,.25)", pointerEvents:"none" }}>expand_more</span>
                </div>
              </div>

              {/* To */}
              <div>
                <label style={{ display:"block", fontSize:9, fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(255,255,255,.3)", textTransform:"uppercase", letterSpacing:".09em", marginBottom:6 }}>
                  Arrival City
                </label>
                <div style={{ position:"relative" }}>
                  <select value={toCity} onChange={e => setToCity(e.target.value)}>
                    <option value="">All cities</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <span className="material-icons" style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", fontSize:14, color:"rgba(255,255,255,.25)", pointerEvents:"none" }}>expand_more</span>
                </div>
              </div>

              {/* Min */}
              <div>
                <label style={{ display:"block", fontSize:9, fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(255,255,255,.3)", textTransform:"uppercase", letterSpacing:".09em", marginBottom:6 }}>Min MAD</label>
                <input type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} min="0" />
              </div>

              {/* Max */}
              <div>
                <label style={{ display:"block", fontSize:9, fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(255,255,255,.3)", textTransform:"uppercase", letterSpacing:".09em", marginBottom:6 }}>Max MAD</label>
                <input type="number" placeholder="∞" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} min="0" />
              </div>

              <button className="btn-red" onClick={applyFilter} disabled={filtering} style={{ height:40 }}>
                <span className={`material-icons${filtering ? " spin" : ""}`} style={{ fontSize:15 }}>
                  {filtering ? "refresh" : "search"}
                </span>
                Search
              </button>

              <button className="btn-ghost" onClick={resetFilter} style={{ height:40 }} title="Reset">
                <span className="material-icons" style={{ fontSize:15 }}>refresh</span>
              </button>
            </div>
          </div>

          {/* ── RESULTS HEADER ── */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:3, height:24, background:"linear-gradient(to bottom,#C1272D,#006233)", borderRadius:2 }} />
              <span style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:18, color:"#fff" }}>
                {filtering ? "…" : `${sorted.length} Route${sorted.length !== 1 ? "s" : ""}`}
              </span>
              {activeView !== "all" && (
                <span className="tag t-gld">{activeView}</span>
              )}
            </div>

            {/* Sort */}
            <div style={{ position:"relative" }}>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.09)", borderRadius:10, color:"#fff", fontFamily:"Syne,sans-serif", fontSize:11, fontWeight:700, padding:"9px 34px 9px 14px", outline:"none", appearance:"none", WebkitAppearance:"none", cursor:"pointer" }}>
                <option value="price-asc">Price ↑ Low first</option>
                <option value="price-desc">Price ↓ High first</option>
                <option value="name-asc">Name A → Z</option>
                <option value="name-desc">Name Z → A</option>
              </select>
              <span className="material-icons" style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", fontSize:14, color:"rgba(255,255,255,.35)", pointerEvents:"none" }}>unfold_more</span>
            </div>
          </div>

          {/* ══════════ ROUTE CARDS ══════════ */}
          {filtering ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"80px 0", flexDirection:"column", gap:14 }}>
              <span className="material-icons spin" style={{ fontSize:38, color:"rgba(255,255,255,.15)" }}>refresh</span>
              <span style={{ fontFamily:"Inter,sans-serif", fontSize:13, color:"rgba(255,255,255,.3)" }}>Searching…</span>
            </div>
          ) : sorted.length === 0 ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 0", gap:16, textAlign:"center" }}>
              <div style={{ width:88, height:88, borderRadius:"50%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span className="material-icons" style={{ fontSize:40, color:"rgba(255,255,255,.13)" }}>route</span>
              </div>
              <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:18, color:"rgba(255,255,255,.35)" }}>No routes found</div>
              <div style={{ fontFamily:"Inter,sans-serif", fontSize:13, color:"rgba(255,255,255,.25)", maxWidth:320 }}>Try adjusting your filters or browse all available routes</div>
              <button className="btn-ghost" onClick={resetFilter}>
                <span className="material-icons" style={{ fontSize:15 }}>refresh</span> Reset Filters
              </button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {sorted.map((route, i) => (
                <div key={route.id} className={`rc au d${Math.min(i + 1, 6)}`} onClick={() => openRoute(route.id)}>
                  <div className="rc-inner" style={{ padding:"22px 26px", display:"flex", alignItems:"center", gap:24 }}>

                    {/* ── Route visual: From → To ── */}
                    <div style={{ flex:2, minWidth:260, display:"flex", alignItems:"center", gap:12 }}>

                      {/* From city */}
                      <div className="city-badge">
                        <div className="city-dot" style={{ background:"rgba(0,98,51,.14)", border:"1.5px solid rgba(0,98,51,.3)" }}>
                          <span className="material-icons" style={{ fontSize:18, color:"#3dba7a" }}>trip_origin</span>
                        </div>
                        <span style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:11, color:"#fff", textAlign:"center", lineHeight:1.25, maxWidth:90 }}>
                          {route.cityHostFromName || "—"}
                        </span>
                      </div>

                      {/* Arrow + transport label */}
                      <div className="arrow-wrap">
                        <div className="arrow-line" />
                        {route.cheapestTransport && (
                          <span style={{ fontSize:9, fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(255,255,255,.3)", textTransform:"uppercase", letterSpacing:".06em", whiteSpace:"nowrap" }}>
                            {route.cheapestTransport.name}
                          </span>
                        )}
                      </div>

                      {/* To city */}
                      <div className="city-badge">
                        <div className="city-dot" style={{ background:"rgba(193,39,45,.14)", border:"1.5px solid rgba(193,39,45,.3)" }}>
                          <span className="material-icons" style={{ fontSize:18, color:"#C1272D" }}>place</span>
                        </div>
                        <span style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:11, color:"#fff", textAlign:"center", lineHeight:1.25, maxWidth:90 }}>
                          {route.cityHostToName || "—"}
                        </span>
                      </div>
                    </div>

                    {/* ── Route name + description ── */}
                    <div style={{ flex:2, minWidth:160 }}>
                      <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:14, color:"#fff", marginBottom:5, lineHeight:1.2 }}>
                        {route.name || "Route"}
                      </div>
                      {route.description && (
                        <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:"rgba(255,255,255,.38)", lineHeight:1.65, margin:0, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                          {route.description}
                        </p>
                      )}
                    </div>

                    {/* ── Price + CTA ── */}
                    <div className="rc-right" style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:10, flexShrink:0 }}>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:9, fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(255,255,255,.28)", textTransform:"uppercase", letterSpacing:".09em", marginBottom:2 }}>Starting from</div>
                        <div className="price-badge">
                          <span style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:28, color:"#f0a500", lineHeight:1 }}>
                            {route.priceProxim != null ? Math.round(route.priceProxim) : "—"}
                          </span>
                          <span style={{ fontFamily:"Syne,sans-serif", fontWeight:600, fontSize:12, color:"rgba(240,165,0,.6)" }}>MAD</span>
                        </div>
                      </div>

                      <div style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 14px", background:"rgba(193,39,45,.1)", border:"1px solid rgba(193,39,45,.2)", borderRadius:9, transition:"background .18s" }}
                        onMouseEnter={e => e.currentTarget.style.background="rgba(193,39,45,.2)"}
                        onMouseLeave={e => e.currentTarget.style.background="rgba(193,39,45,.1)"}>
                        <span style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:11, color:"#e85d65" }}>View Transports</span>
                        <span className="material-icons" style={{ fontSize:13, color:"#e85d65" }}>arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>

      {/* ══════════ ROUTE DETAIL MODAL ══════════ */}
      {selectedRoute && (
        <div
          onClick={e => e.target === e.currentTarget && setSelectedRoute(null)}
          style={{
            position:"fixed", inset:0, zIndex:99999,
            background:"rgba(0,0,0,.82)",
            backdropFilter:"blur(8px)",
            WebkitBackdropFilter:"blur(8px)",
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:16,
            animation:"rp-fade .2s ease",
          }}>
          <div style={{
            background:"#120406",
            border:"1px solid rgba(193,39,45,.28)",
            borderRadius:20,
            width:"100%", maxWidth:640,
            maxHeight:"90vh", overflowY:"auto",
            boxShadow:"0 32px 80px rgba(0,0,0,.85)",
            animation:"rp-up .22s cubic-bezier(.22,.68,0,1.2)",
            fontFamily:"'Inter',sans-serif",
            color:"#fff",
          }}>

            {selectedRoute._loading ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"72px 0", flexDirection:"column", gap:14 }}>
                <span className="material-icons spin" style={{ fontSize:36, color:"rgba(255,255,255,.2)" }}>route</span>
                <span style={{ fontFamily:"Syne,sans-serif", fontSize:13, color:"rgba(255,255,255,.3)" }}>Loading route…</span>
              </div>
            ) : (
              <>
                {/* ── Modal header ── */}
                <div style={{ padding:"20px 24px 18px", borderBottom:"1px solid rgba(255,255,255,.07)", position:"sticky", top:0, background:"#120406", zIndex:5, borderRadius:"20px 20px 0 0" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                    <div>
                      <div style={{ fontSize:9, fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(193,39,45,.8)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:6 }}>Route Detail</div>
                      <h2 style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:20, color:"#fff", lineHeight:1.1, margin:0 }}>
                        {selectedRoute.name || "Route"}
                      </h2>
                    </div>
                    <button onClick={() => setSelectedRoute(null)}
                      style={{ width:34, height:34, borderRadius:"50%", background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.1)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"rgba(255,255,255,.5)", flexShrink:0 }}>
                      <span className="material-icons" style={{ fontSize:18 }}>close</span>
                    </button>
                  </div>
                </div>

                {/* ── Route path ── */}
                <div style={{ padding:"20px 24px", borderBottom:"1px solid rgba(255,255,255,.07)" }}>
                  <div style={{ display:"flex", alignItems:"stretch", gap:12 }}>

                    {/* From */}
                    <div style={{ flex:1, background:"rgba(0,98,51,.07)", border:"1px solid rgba(0,98,51,.18)", borderRadius:13, padding:"14px 16px" }}>
                      <div style={{ fontSize:9, fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(0,98,51,.8)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:6 }}>Departure</div>
                      <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:15, color:"#fff", display:"flex", alignItems:"center", gap:7 }}>
                        <span className="material-icons" style={{ fontSize:16, color:"#3dba7a" }}>trip_origin</span>
                        {selectedRoute.cityHostFromName || "—"}
                      </div>
                    </div>

                    {/* Mid arrow + price */}
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, flexShrink:0, padding:"0 4px" }}>
                      <span className="material-icons" style={{ fontSize:22, color:"rgba(193,39,45,.5)" }}>east</span>
                      <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:18, color:"#f0a500" }}>
                        {selectedRoute.priceProxim != null ? Math.round(selectedRoute.priceProxim) : "—"}
                        <span style={{ fontSize:10, color:"rgba(240,165,0,.6)", fontWeight:600, marginLeft:3 }}>MAD</span>
                      </div>
                    </div>

                    {/* To */}
                    <div style={{ flex:1, background:"rgba(193,39,45,.07)", border:"1px solid rgba(193,39,45,.18)", borderRadius:13, padding:"14px 16px" }}>
                      <div style={{ fontSize:9, fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(193,39,45,.8)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:6 }}>Arrival</div>
                      <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:15, color:"#fff", display:"flex", alignItems:"center", gap:7 }}>
                        <span className="material-icons" style={{ fontSize:16, color:"#C1272D" }}>place</span>
                        {selectedRoute.cityHostToName || "—"}
                      </div>
                    </div>
                  </div>

                  {selectedRoute.description && (
                    <p style={{ fontFamily:"Inter,sans-serif", fontSize:13, color:"rgba(255,255,255,.45)", lineHeight:1.75, margin:"16px 0 0" }}>
                      {selectedRoute.description}
                    </p>
                  )}
                </div>

                {/* ── Transport list ── */}
                <div>
                  <div style={{ padding:"16px 24px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span className="material-icons" style={{ fontSize:16, color:"#C1272D" }}>commute</span>
                      <span style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:14, color:"#fff" }}>
                        Transport Options
                      </span>
                    </div>
                    {selectedRoute.transports?.length > 0 && (
                      <span style={{ fontSize:10, fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(255,255,255,.3)" }}>
                        {selectedRoute.transports.length} available
                      </span>
                    )}
                  </div>

                  {!selectedRoute.transports || selectedRoute.transports.length === 0 ? (
                    <div style={{ padding:"36px 24px", textAlign:"center" }}>
                      <span className="material-icons" style={{ fontSize:34, color:"rgba(255,255,255,.1)", display:"block", margin:"0 auto 10px" }}>commute</span>
                      <div style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:13, color:"rgba(255,255,255,.25)" }}>No transports listed for this route</div>
                    </div>
                  ) : (
                    selectedRoute.transports.map((t, i) => (
                      <div key={t.id} style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,.05)", transition:"background .15s" }}
                        onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,.03)"}
                        onMouseLeave={e => e.currentTarget.style.background="transparent"}>

                        {/* Icon circle */}
                        <div style={{ width:46, height:46, borderRadius:13, background:"rgba(193,39,45,.1)", border:"1px solid rgba(193,39,45,.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <span className="material-icons" style={{ fontSize:22, color:"#C1272D" }}>{tIcon(t.name)}</span>
                        </div>

                        {/* Info */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:5 }}>
                            <span style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:14, color:"#fff" }}>{t.name}</span>
                            {i === 0 && (
                              <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:999, background:"rgba(0,98,51,.14)", border:"1px solid rgba(0,98,51,.28)", color:"#3dba7a", fontFamily:"Syne,sans-serif", fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:".07em" }}>
                                🏆 Best price
                              </span>
                            )}
                            {t.capacity > 0 && (
                              <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:999, background:"rgba(124,58,237,.14)", border:"1px solid rgba(124,58,237,.28)", color:"#a78bfa", fontFamily:"Syne,sans-serif", fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:".07em" }}>
                                <span className="material-icons" style={{ fontSize:10 }}>people</span>
                                {t.capacity}
                              </span>
                            )}
                          </div>

                          {t.description && (
                            <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:"rgba(255,255,255,.38)", lineHeight:1.65, margin:"0 0 7px" }}>
                              {t.description}
                            </p>
                          )}

                          {t.cityName && (
                            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                              <span className="material-icons" style={{ fontSize:11, color:"rgba(255,255,255,.22)" }}>location_on</span>
                              <span style={{ fontFamily:"Inter,sans-serif", fontSize:11, color:"rgba(255,255,255,.28)" }}>{t.cityName}</span>
                            </div>
                          )}

                          {/* Images */}
                          {t.images?.length > 0 && (
                            <div style={{ display:"flex", gap:6, marginTop:9, flexWrap:"wrap" }}>
                              {t.images.slice(0, 4).map((img, idx) => (
                                <div key={idx} style={{ width:60, height:44, borderRadius:8, overflow:"hidden", border:"1px solid rgba(255,255,255,.08)", flexShrink:0 }}>
                                  <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => e.target.style.display="none"} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        <div style={{ textAlign:"right", flexShrink:0 }}>
                          <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:22, color:"#f0a500", lineHeight:1 }}>
                            {t.priceProxim != null ? Math.round(t.priceProxim) : "—"}
                          </div>
                          <div style={{ fontSize:10, fontFamily:"Syne,sans-serif", fontWeight:600, color:"rgba(240,165,0,.55)", marginTop:2 }}>MAD</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* ── Modal footer ── */}
                <div style={{ padding:"14px 24px 16px", borderTop:"1px solid rgba(255,255,255,.06)", display:"flex", justifyContent:"flex-end", gap:10 }}>
                  <button
                    onClick={() => setSelectedRoute(null)}
                    style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"10px 16px", borderRadius:10, background:"rgba(255,255,255,.06)", color:"rgba(255,255,255,.55)", fontFamily:"Syne,sans-serif", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:".05em", border:"1px solid rgba(255,255,255,.09)", cursor:"pointer", transition:"all .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,.1)"; e.currentTarget.style.color="#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.06)"; e.currentTarget.style.color="rgba(255,255,255,.55)"; }}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}