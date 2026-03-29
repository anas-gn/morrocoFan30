"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const BASE = process.env.NEXT_PUBLIC_API_URL || "https://anas-gana1-fandb-backend.hf.space/api";

const sf = async (url, opts = {}) => {
  try {
    const r = await fetch(url, opts);
    if (!r.ok) throw new Error(`${r.status}`);
    const t = await r.text();
    try { return JSON.parse(t); } catch { return t; }
  } catch (e) {
    console.error("Fetch error:", e);
    throw e;
  }
};

/* ── helpers ── */
const initials = n => n ? n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
const hue = n => {
  const c = ["#C1272D","#006233","#b45309","#0369a1","#7c3aed","#0f766e"];
  let h = 0; for (const x of (n||"")) h = (h*31+x.charCodeAt(0))%c.length; return c[h];
};

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" });
};

const formatDateTime = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" });
};

const truncate = (s, len=60) => s?.length > len ? s.slice(0, len) + "…" : s || "—";

const EMPTY_ADD = { title: "", description: "", detail: "", author: "", teamId: "", imageUrl: "", additionalImages: [] };

export default function NewsRespo() {
  const router = useRouter();

  const [news, setNews] = useState([]);
  const [teams, setTeams] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({});

  /* ── add news modal ── */
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD);
  const [savingAdd, setSavingAdd] = useState(false);

  /* ── delete confirm modal ── */
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingNews, setDeletingNews] = useState(false);

  /* ── detail modal ── */
  const [selected, setSelected] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [editForm, setEditForm] = useState(EMPTY_ADD);

  const showToast = (type, msg) => { 
    setToast({type,msg}); 
    setTimeout(()=>setToast(null),3500); 
  };

  /* ── calculate stats ── */
  const calculateStats = (newsData, teamsData) => {
    const totalNews = newsData.length;
    const teamStats = {};
    const dateStats = {};
    
    teamsData.forEach(t => {
      teamStats[t.id] = { name: t.name, count: 0 };
    });

    newsData.forEach(n => {
      if (n.teamId && teamStats[n.teamId]) {
        teamStats[n.teamId].count++;
      }
      const date = new Date(n.dateOfCreation).toLocaleDateString("fr-FR");
      dateStats[date] = (dateStats[date] || 0) + 1;
    });

    setStats({
      total: totalNews,
      byTeam: teamStats,
      byDate: dateStats,
      lastCreated: newsData.length > 0 ? newsData[0] : null
    });
  };

  /* ── load ── */
  const loadNews = () => {
    setLoading(true);
    Promise.all([
      sf(`${BASE}/news`),
      sf(`${BASE}/teams/getAll`)
    ])
      .then(([newsData, teamsData]) => {
        setNews(Array.isArray(newsData) ? newsData : []);
        setTeams(Array.isArray(teamsData) ? teamsData : []);
        calculateStats(newsData || [], teamsData || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(" Failed to load news:", err);
        showToast("error", "Erreur chargement données");
        setLoading(false);
      });
  };

  useEffect(() => { loadNews(); }, []);

  /* auth guard */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("userType");
    if (!t) router.push("/Login");
    else if (t === "SUPPORTER") router.push("/Acceuil");
  }, []);

  /* ── filter ── */
  useEffect(() => {
    let f = [...news];
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.author?.toLowerCase().includes(q) ||
        n.description?.toLowerCase().includes(q)
      );
    }
    if (filterTeam !== "") f = f.filter(n => String(n.teamId) === filterTeam);
    setFilteredNews(f);
  }, [search, filterTeam, news]);

  /* ── ADD NEWS ── */
  const submitAdd = async () => {
    if (!addForm.title || !addForm.author || !addForm.teamId) {
      showToast("error","Titre, auteur et équipe sont requis."); 
      return;
    }
    setSavingAdd(true);
    try {
      const body = {
        title: addForm.title,
        description: addForm.description,
        detail: addForm.detail,
        author: addForm.author,
        teamId: parseInt(addForm.teamId),
        imageUrl: addForm.imageUrl || "https://via.placeholder.com/600x400?text=News",
        additionalImages: addForm.additionalImages || []
      };
      const res = await sf(`${BASE}/news`, {
        method:"POST", 
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(body),
      });
      if (res?.success || res?.data) {
        showToast("success","Article ajouté !");
        setShowAdd(false);
        setAddForm(EMPTY_ADD);
        loadNews();
      } else {
        showToast("error", res?.message || "Échec ajout article.");
      }
    } catch (e) { 
      console.error(" Add error:", e);
      showToast("error","Erreur réseau."); 
    }
    setSavingAdd(false);
  };

  /* ── DELETE NEWS ── */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingNews(true);
    try {
      const res = await sf(`${BASE}/news/${deleteTarget.id}`, { method:"DELETE" });
      if (res?.success || res?.message) {
        showToast("success","Article supprimé !");
        setNews(p => p.filter(n => n.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        showToast("error", res?.message || "Échec suppression.");
      }
    } catch (e) { 
      console.error(" Delete error:", e);
      showToast("error","Erreur réseau."); 
    }
    setDeletingNews(false);
  };

  /* ── OPEN DETAIL MODAL ── */
  const openNews = async n => {
    setSelected(n);
    setEditForm({
      title: n.title || "",
      description: n.description || "",
      detail: n.detail || "",
      author: n.author || "",
      teamId: n.teamId ? String(n.teamId) : "",
      imageUrl: n.imageUrl || "",
      additionalImages: n.additionalImages || n.images || []
    });
    setLoadingDetail(false);
  };

  /* ── UPDATE NEWS ── */
  const submitUpdate = async () => {
    if (!editForm.title || !editForm.author || !editForm.teamId) {
      showToast("error","Titre, auteur et équipe sont requis.");
      return;
    }
    setSavingUpdate(true);
    try {
      const body = {
        title: editForm.title,
        description: editForm.description,
        detail: editForm.detail,
        author: editForm.author,
        teamId: parseInt(editForm.teamId),
        imageUrl: editForm.imageUrl || selected.imageUrl
      };
      const res = await sf(`${BASE}/news/${selected.id}`, {
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(body),
      });
      if (res?.success || res?.data) {
        showToast("success","Article mis à jour !");
        const updated = res?.data ? res.data : { ...selected, ...body, teamId: parseInt(body.teamId) };
        setSelected(updated);
        setNews(p => p.map(n => n.id === selected.id ? updated : n));
      } else {
        showToast("error", res?.message || "Échec mise à jour.");
      }
    } catch (e) {
      console.error(" Update error:", e);
      showToast("error","Erreur réseau.");
    }
    setSavingUpdate(false);
  };

  const getTeamCount = (teamId) => news.filter(n => n.teamId === teamId).length;
  const totalCount = stats.total || 0;

  return (
    <>
      <Head>
        <title>News · MoroccoFan2030</title>
        <link rel="icon" href="/images/logo.png"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&family=Amiri:ital,wght@0,400;1,400&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
      </Head>

      <style jsx global>{`
        *,*::before,*::after{box-sizing:border-box}
        html,body{margin:0;padding:0;height:100%}
        body{font-family:'Inter',sans-serif;background:#07030a;color:#fff;-webkit-font-smoothing:antialiased;overflow:hidden}

        @keyframes fadeUp  {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes spin    {to{transform:rotate(360deg)}}
        @keyframes pulse   {0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes scaleIn {from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
        @keyframes slideUp {from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}

        .nr-spin  {animation:spin  1s linear infinite}
        .nr-pulse {animation:pulse 1.4s ease infinite}
        .nr-up    {animation:fadeUp .4s cubic-bezier(.22,.68,0,1.2) both}

        .main-wrap{
          width:100%;height:100vh;overflow:hidden;
          display:flex;flex-direction:column;
          transition:margin-left .28s cubic-bezier(.4,0,.2,1);
        }
        @media(max-width:900px){.main-wrap{margin-left:66px}}

        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(193,39,45,.3);border-radius:2px}

        .nr-header{
          padding:18px 24px;
          background:#07030a;
          border-bottom:1px solid rgba(255,255,255,.06);
          flex-shrink:0;
        }
        .nr-title-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
        .nr-stats{display:flex;gap:16px;margin-bottom:14px;flex-wrap:wrap;}
        .nr-stat{display:flex;align-items:center;gap:6px;}
        .nr-stat-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}

        .nr-toolbar{display:flex;align-items:center;gap:8px;padding-bottom:0;flex-wrap:wrap;}
        .nr-search-wrap{position:relative;flex:1;min-width:180px;}
        .nr-search-wrap .mi{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:15px;color:rgba(255,255,255,.28);pointer-events:none;}
        .nr-search{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:9px;color:#fff;font-family:'Inter',sans-serif;font-size:13px;padding:8px 12px 8px 34px;outline:none;transition:border-color .2s;}
        .nr-search:focus{border-color:rgba(193,39,45,.4);}
        .nr-search::placeholder{color:rgba(255,255,255,.22);}

        .nr-filter-btn{padding:7px 13px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(255,255,255,.5);font-family:'Syne',sans-serif;font-size:11px;font-weight:700;cursor:pointer;transition:all .18s;white-space:nowrap;}
        .nr-filter-btn:hover{background:rgba(255,255,255,.08);color:#fff;}
        .nr-filter-btn.active{background:rgba(193,39,45,.2);border-color:rgba(193,39,45,.4);color:#f87171;}

        .nr-content{flex:1;overflow-y:auto;padding:20px 24px;}

        .nr-table{width:100%;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:14px;overflow:hidden;}
        .nr-thead{display:grid;grid-template-columns:1.2fr 1fr 150px 120px 80px;gap:8px;padding:10px 18px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Syne',sans-serif;font-size:10px;font-weight:700;color:rgba(255,255,255,.28);text-transform:uppercase;letter-spacing:.08em;}
        .nr-row{display:grid;grid-template-columns:1.2fr 1fr 150px 120px 80px;gap:8px;padding:13px 18px;border-bottom:1px solid rgba(255,255,255,.04);align-items:center;cursor:pointer;transition:background .15s;}
        .nr-row:hover{background:rgba(255,255,255,.03);}
        .nr-row:last-child{border-bottom:none;}

        .title-cell{font-family:'Syne',sans-serif;font-weight:700;font-size:12px;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .author-cell{font-size:11px;color:rgba(255,255,255,.4);}
        .category-badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border:1px solid;font-family:'Syne',sans-serif;background:rgba(193,39,45,.1);color:#f87171;border-color:rgba(193,39,45,.3);}
        .date-cell{font-size:11px;color:rgba(255,255,255,.3);}

        .row-actions{display:flex;align-items:center;gap:6px;}
        .settings-btn{width:28px;height:28px;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;color:rgba(255,255,255,.4);}
        .settings-btn:hover{border-color:#C1272D;color:#C1272D;background:rgba(193,39,45,.1);}
        .delete-btn{width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,.2);background:rgba(239,68,68,.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;color:rgba(239,68,68,.5);}
        .delete-btn:hover{border-color:#ef4444;color:#ef4444;background:rgba(239,68,68,.15);}

        .empty{display:flex;flex-direction:column;align-items:center;padding:60px 0;gap:12px;}
        .empty .material-icons{font-size:44px;color:rgba(255,255,255,.08);}
        .empty span:last-child{font-family:'Syne',sans-serif;color:rgba(255,255,255,.22);font-size:13px;}

        .nr-overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}

        .nr-modal{background:linear-gradient(160deg,#170818 0%,#0c030f 100%);border:1px solid rgba(255,255,255,.1);border-radius:20px;width:100%;max-width:680px;max-height:90vh;overflow-y:auto;animation:scaleIn .22s ease both;}
        .nr-modal::-webkit-scrollbar{width:4px;}
        .nr-modal::-webkit-scrollbar-thumb{background:rgba(193,39,45,.3);border-radius:2px;}
        .nr-modal-head{padding:22px 24px;border-bottom:1px solid rgba(255,255,255,.06);}
        .nr-modal-body{padding:20px 24px 24px;}

        .sm-modal{background:linear-gradient(160deg,#170818 0%,#0c030f 100%);border:1px solid rgba(255,255,255,.1);border-radius:20px;width:100%;max-width:520px;animation:slideUp .25s ease both;padding:28px;}

        .db-field{margin-bottom:13px;}
        .db-field label{display:block;font-size:10px;font-weight:700;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;font-family:'Syne',sans-serif;}
        .db-field input,.db-field select,.db-field textarea{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:9px;color:#fff;font-family:'Inter',sans-serif;font-size:13px;padding:10px 13px;outline:none;transition:border-color .18s;appearance:none;-webkit-appearance:none;}
        .db-field input:focus,.db-field select:focus,.db-field textarea:focus{border-color:rgba(193,39,45,.5);}
        .db-field input::placeholder,.db-field textarea::placeholder{color:rgba(255,255,255,.22);}
        .db-field select option{background:#1c0a1e;color:#fff;}

        .btn-p{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:#C1272D;color:#fff;border:none;border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s;}
        .btn-p:hover{background:#a01f24;transform:translateY(-1px);}
        .btn-p:disabled{opacity:.5;cursor:not-allowed;transform:none;}
        .btn-s{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.1);border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s;}
        .btn-s:hover{background:rgba(255,255,255,.1);}
        .btn-danger{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:rgba(239,68,68,.15);color:#ef4444;border:1px solid rgba(239,68,68,.3);border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s;}
        .btn-danger:hover{background:rgba(239,68,68,.28);}
        .btn-danger:disabled{opacity:.5;cursor:not-allowed;}
        .ibtn{width:28px;height:28px;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;color:rgba(255,255,255,.4);}
        .ibtn:hover{border-color:#C1272D;color:#C1272D;background:rgba(193,39,45,.1);}

        .toast{position:fixed;bottom:20px;right:20px;padding:12px 18px;border-radius:9px;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;z-index:300;animation:slideUp .25s ease both;display:flex;align-items:center;gap:8px;}
        .toast.success{background:rgba(74,222,128,.15);color:#4ade80;border:1px solid rgba(74,222,128,.3);}
        .toast.error{background:rgba(239,68,68,.15);color:#ef4444;border:1px solid rgba(239,68,68,.3);}

        @media(max-width:640px){
          .nr-thead,.nr-row{grid-template-columns:1.5fr 100px 80px;}
          .nr-thead div:nth-child(2),.nr-row div:nth-child(2){display:none;}
          .nr-thead div:nth-child(4),.nr-row div:nth-child(4){display:none;}
        }
      `}</style>

      {/* ══ MAIN ══ */}
      <div className="main-wrap">

        {/* ═══ HEADER ═══ */}
        <div className="nr-header">
          <div className="nr-title-row">
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,borderRadius:10,background:"rgba(193,39,45,.15)",border:"1px solid rgba(193,39,45,.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span className="material-icons" style={{fontSize:18,color:"#C1272D"}}>newspaper</span>
              </div>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#fff"}}>Gestion des Articles</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:1}}>{news.length} articles • {teams.length} équipes</div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{display:"flex",gap:8}}>
              <button className="btn-p" style={{padding:"7px 14px",fontSize:11}} onClick={()=>setShowAdd(true)}>
                <span className="material-icons" style={{fontSize:14}}>add</span>Ajouter un article
              </button>
              <button className="btn-s" style={{padding:"7px 14px",fontSize:11}} onClick={loadNews}>
                <span className="material-icons" style={{fontSize:14}}>refresh</span>Actualiser
              </button>
            </div>
          </div>

          {/* stats */}
          <div className="nr-stats">
            <div className="nr-stat">
              <div className="nr-stat-dot" style={{background:"#C1272D"}}/>
              <span style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:"rgba(255,255,255,.6)"}}>{totalCount} Total</span>
            </div>
            {teams.length > 0 && teams.slice(0, 4).map(team=>(
              <div key={team.id} className="nr-stat">
                <div className="nr-stat-dot" style={{background:hue(team.name)}}/>
                <span style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:"rgba(255,255,255,.6)"}}>
                  {getTeamCount(team.id)} {truncate(team.name, 12)}
                </span>
              </div>
            ))}
          </div>

          {/* toolbar */}
          <div className="nr-toolbar">
            <div className="nr-search-wrap">
              <span className="material-icons mi">search</span>
              <input className="nr-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher titre, auteur…"/>
            </div>
            <button className={`nr-filter-btn${filterTeam===""?" active":""}`} onClick={()=>setFilterTeam("")}>
              TOUTES
            </button>
            {teams.map(team=>(
              <button key={team.id} className={`nr-filter-btn${filterTeam===String(team.id)?" active":""}`} onClick={()=>setFilterTeam(String(team.id))}>
                {truncate(team.name, 14)}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ TABLE ═══ */}
        <div className="nr-content">
          {loading ? (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:320,gap:14}}>
              <div className="nr-spin" style={{width:34,height:34,border:"3px solid #C1272D",borderTopColor:"transparent",borderRadius:"50%"}}/>
              <span style={{fontFamily:"'Syne',sans-serif",color:"rgba(255,255,255,.4)",fontSize:14}}>Chargement des articles…</span>
            </div>
          ) : (
            <div className="nr-table">
              <div className="nr-thead">
                <div>Titre</div>
                <div>Équipe</div>
                <div>Auteur</div>
                <div>Date</div>
                <div style={{textAlign:"center"}}>Actions</div>
              </div>

              {filteredNews.length === 0 && (
                <div className="empty">
                  <span className="material-icons">newspaper</span>
                  <span>Aucun article trouvé</span>
                </div>
              )}

              {filteredNews.map((n, i) => {
                const teamName = teams.find(t => t.id === n.teamId)?.name || "—";
                return (
                  <div key={n.id||i} className="nr-row nr-up" style={{animationDelay:`${i*.03}s`}} onClick={()=>openNews(n)}>
                    <div className="title-cell" title={n.title}>{truncate(n.title, 50)}</div>
                    <div className="author-cell">{teamName}</div>
                    <div className="author-cell">{n.author||"—"}</div>
                    <div className="date-cell">{formatDate(n.dateOfCreation)}</div>
                    <div className="row-actions" style={{justifyContent:"center"}} onClick={e=>e.stopPropagation()}>
                      <div className="settings-btn" title="Éditer" onClick={()=>openNews(n)}>
                        <span className="material-icons" style={{fontSize:14}}>edit</span>
                      </div>
                      <div className="delete-btn" title="Supprimer" onClick={()=>setDeleteTarget(n)}>
                        <span className="material-icons" style={{fontSize:14}}>delete</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════ MODAL: ADD NEWS ═══════════════════ */}
      {showAdd && (
        <div className="nr-overlay" onClick={e=>{if(e.target===e.currentTarget){setShowAdd(false);setAddForm(EMPTY_ADD);}}}>
          <div className="sm-modal">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:"#fff"}}>Ajouter un article</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>Créer un nouvel article de news</div>
              </div>
              <button className="ibtn" onClick={()=>{setShowAdd(false);setAddForm(EMPTY_ADD);}}>
                <span className="material-icons" style={{fontSize:17}}>close</span>
              </button>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr",gap:"0 14px"}}>
              <div className="db-field">
                <label>Titre *</label>
                <input type="text" value={addForm.title} onChange={e=>setAddForm(f=>({...f,title:e.target.value}))} placeholder="Titre de l'article"/>
              </div>

              <div className="db-field">
                <label>Équipe *</label>
                <select value={addForm.teamId} onChange={e=>setAddForm(f=>({...f,teamId:e.target.value}))}>
                  <option value="">Sélectionner une équipe</option>
                  {teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="db-field">
                <label>Auteur *</label>
                <input type="text" value={addForm.author} onChange={e=>setAddForm(f=>({...f,author:e.target.value}))} placeholder="Nom de l'auteur"/>
              </div>

              <div className="db-field">
                <label>Description courte</label>
                <textarea value={addForm.description} onChange={e=>setAddForm(f=>({...f,description:e.target.value}))} placeholder="Résumé court de l'article" style={{minHeight:"60px",resize:"vertical"}}/>
              </div>

              <div className="db-field">
                <label>Contenu détaillé</label>
                <textarea value={addForm.detail} onChange={e=>setAddForm(f=>({...f,detail:e.target.value}))} placeholder="Contenu complet de l'article" style={{minHeight:"100px",resize:"vertical"}}/>
              </div>

              <div className="db-field">
                <label>URL Image principale (optionnel)</label>
                <input type="text" value={addForm.imageUrl} onChange={e=>setAddForm(f=>({...f,imageUrl:e.target.value}))} placeholder="https://example.com/image.jpg"/>
              </div>
            </div>

            <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:6}}>
              <button className="btn-s" onClick={()=>{setShowAdd(false);setAddForm(EMPTY_ADD);}}>Annuler</button>
              <button className="btn-p" onClick={submitAdd} disabled={savingAdd}>
                {savingAdd
                  ? <><div className="nr-spin" style={{width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%"}}/>Enregistrement…</>
                  : <><span className="material-icons" style={{fontSize:14}}>add</span>Créer l'article</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ MODAL: DELETE CONFIRM ═══════════════════ */}
      {deleteTarget && (
        <div className="nr-overlay" onClick={e=>{if(e.target===e.currentTarget)setDeleteTarget(null);}}>
          <div className="sm-modal" style={{maxWidth:420}}>
            <div style={{width:52,height:52,borderRadius:14,background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.25)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
              <span className="material-icons" style={{fontSize:26,color:"#ef4444"}}>delete_forever</span>
            </div>

            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#fff",marginBottom:8}}>
              Supprimer cet article ?
            </div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.4)",marginBottom:6,lineHeight:1.6}}>
              Vous êtes sur le point de supprimer l'article
            </div>
            <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:"12px 14px",marginBottom:22,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#ef4444",flexShrink:0}}/>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,color:"#fff"}}>
                  {deleteTarget.title||"—"}
                </div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>
                  {deleteTarget.author||"—"} · #{deleteTarget.id}
                </div>
              </div>
            </div>

            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button className="btn-s" onClick={()=>setDeleteTarget(null)}>Annuler</button>
              <button className="btn-danger" onClick={confirmDelete} disabled={deletingNews}>
                {deletingNews
                  ? <><div className="nr-spin" style={{width:13,height:13,border:"2px solid rgba(239,68,68,.4)",borderTopColor:"#ef4444",borderRadius:"50%"}}/>Suppression…</>
                  : <><span className="material-icons" style={{fontSize:14}}>delete</span>Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ MODAL: EDIT NEWS ═══════════════════ */}
      {selected && (
        <div className="nr-overlay" onClick={e=>{if(e.target===e.currentTarget)setSelected(null);}}>
          <div className="nr-modal">
            <div className="nr-modal-head">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#fff"}}>
                    Éditer l'article
                  </div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:3}}>
                    Article #{selected.id}
                  </div>
                </div>
                <button className="ibtn" onClick={()=>setSelected(null)}>
                  <span className="material-icons" style={{fontSize:17}}>close</span>
                </button>
              </div>
            </div>

            <div className="nr-modal-body">
              <div className="db-field">
                <label>Titre</label>
                <input type="text" value={editForm.title} onChange={e=>setEditForm(f=>({...f,title:e.target.value}))}/>
              </div>

              <div className="db-field">
                <label>Auteur</label>
                <input type="text" value={editForm.author} onChange={e=>setEditForm(f=>({...f,author:e.target.value}))}/>
              </div>

              <div className="db-field">
                <label>Description</label>
                <textarea value={editForm.description} onChange={e=>setEditForm(f=>({...f,description:e.target.value}))} style={{minHeight:"80px",resize:"vertical"}}/>
              </div>

              <div className="db-field">
                <label>Équipe *</label>
                <select value={editForm.teamId} onChange={e=>setEditForm(f=>({...f,teamId:e.target.value}))}>
                  <option value="">Sélectionner une équipe</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="db-field">
                <label>URL Image</label>
                <input type="text" value={editForm.imageUrl} onChange={e=>setEditForm(f=>({...f,imageUrl:e.target.value}))}/>
              </div>

              <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}>
                <button className="btn-s" onClick={()=>setSelected(null)}>Annuler</button>
                <button className="btn-p" onClick={submitUpdate} disabled={savingUpdate}>
                  {savingUpdate
                    ? <><div className="nr-spin" style={{width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%"}}/>Mise à jour…</>
                    : <><span className="material-icons" style={{fontSize:14}}>save</span>Enregistrer</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ TOAST ═══════════════════ */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          <span className="material-icons" style={{fontSize:14}}>
            {toast.type==="success"?"check_circle":"error"}
          </span>
          {toast.msg}
        </div>
      )}
    </>
  );
}
