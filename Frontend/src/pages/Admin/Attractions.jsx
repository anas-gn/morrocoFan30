"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const BASE = "https://anas-gana1-fandb-backend.hf.space/api";

const sf = async (url, opts) => {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(r.status);
  const t = await r.text();
  try { return JSON.parse(t); } catch { return t; }
};

const initials = n => n ? n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
const hue = n => {
  const c = ["#C1272D","#006233","#b45309","#0369a1","#7c3aed","#0f766e"];
  let h = 0; for (const x of (n||"")) h = (h*31+x.charCodeAt(0))%c.length; return c[h];
};

const ATTRACTION_TYPES = ["Monument","Musée","Parc","Plage","Mosquée","Médina","Marché","Stade","Zoo","Autre"];

const EMPTY_FORM = {
  name:"", country:"", type:"Monument", priceProxim:"",
  description:"", address:"", houreOfOpening:"", houreOfClosing:"",
  imageUrl:"", latitude:"", longitude:""
};

export default function AttractionsAdmin() {
  const router = useRouter();
  const [attractions, setAttractions] = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [cities, setCities]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filterType, setFilterType]   = useState("ALL");
  const [toast, setToast]             = useState(null);

  const [showAdd, setShowAdd]   = useState(false);
  const [addCityId, setAddCityId] = useState("");
  const [addForm, setAddForm]   = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm]     = useState(EMPTY_FORM);
  const [editSaving, setEditSaving] = useState(false);

  const [detailAtt, setDetailAtt]       = useState(null);
  const [detailImages, setDetailImages] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailTab, setDetailTab]       = useState("info");

  const showToast = (type, msg) => { setToast({type,msg}); setTimeout(()=>setToast(null),3500); };

  const loadAllAttractions = async () => {
    setLoading(true);
    try {
      const allCities = await sf(`${BASE}/cities/all`);
      setCities(Array.isArray(allCities)?allCities:[]);
      const promises = (Array.isArray(allCities)?allCities:[]).map(c =>
        sf(`${BASE}/attractions/city/${c.id}`).catch(()=>[])
      );
      const results = await Promise.all(promises);
      const all = results.flat().filter(Boolean);
      setAttractions(all);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { loadAllAttractions(); }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("userType");
    if (!t) router.push("/Login");
    else if (t === "SUPPORTER") router.push("/Acceuil");
  }, []);

  useEffect(() => {
    let f = [...attractions];
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(a =>
        a.name?.toLowerCase().includes(q) ||
        a.address?.toLowerCase().includes(q) ||
        a.type?.toLowerCase().includes(q)
      );
    }
    if (filterType !== "ALL") f = f.filter(a => a.type === filterType);
    setFiltered(f);
  }, [search, filterType, attractions]);

  const submitAdd = async () => {
    if (!addForm.name || !addCityId) { showToast("error","Nom et ville sont requis."); return; }
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/attractions/add/${addCityId}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          ...addForm,
          latitude: addForm.latitude ? parseFloat(addForm.latitude) : null,
          longitude: addForm.longitude ? parseFloat(addForm.longitude) : null,
        }),
      });
      if (res.ok) {
        showToast("success","Attraction ajoutée !");
        setShowAdd(false); setAddForm(EMPTY_FORM); setAddCityId(""); loadAllAttractions();
      } else showToast("error","Échec ajout.");
    } catch { showToast("error","Erreur réseau."); }
    setSaving(false);
  };

  const submitEdit = async () => {
    if (!editForm.name) { showToast("error","Le nom est requis."); return; }
    setEditSaving(true);
    try {
      const res = await fetch(`${BASE}/attractions/update/${editTarget.id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          ...editForm,
          latitude: editForm.latitude ? parseFloat(editForm.latitude) : null,
          longitude: editForm.longitude ? parseFloat(editForm.longitude) : null,
        }),
      });
      if (res.ok) {
        showToast("success","Attraction mise à jour !");
        setEditTarget(null); loadAllAttractions();
      } else showToast("error","Échec mise à jour.");
    } catch { showToast("error","Erreur réseau."); }
    setEditSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BASE}/attractions/delete/${deleteTarget.id}`, { method:"DELETE" });
      if (res.ok) {
        showToast("success","Attraction supprimée !");
        setAttractions(p => p.filter(a => a.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else showToast("error","Échec suppression.");
    } catch { showToast("error","Erreur réseau."); }
    setDeleting(false);
  };

  const openDetail = async att => {
    setDetailAtt(att);
    setDetailTab("info");
    setLoadingDetail(true);
    try {
      const imgs = await sf(`${BASE}/attractions/images/attraction/${att.id}`).catch(()=>[]);
      setDetailImages(Array.isArray(imgs)?imgs:[]);
    } catch(_) {}
    setLoadingDetail(false);
  };

  const openEdit = (att, e) => {
    e && e.stopPropagation();
    setEditTarget(att);
    setEditForm({
      name:att.name||"", country:att.country||"", type:att.type||"Monument",
      priceProxim:att.priceProxim||"", description:att.description||"",
      address:att.address||"", houreOfOpening:att.houreOfOpening||"",
      houreOfClosing:att.houreOfClosing||"", imageUrl:att.imageUrl||"",
      latitude:att.latitude||"", longitude:att.longitude||"",
    });
  };

  const usedTypes = [...new Set(attractions.map(a=>a.type).filter(Boolean))];

  return (
    <>
      <Head>
        <title>Attractions · MoroccoFan2030</title>
        <link rel="icon" href="/images/logo.png"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
      </Head>

      <style jsx global>{`
        *,*::before,*::after{box-sizing:border-box}
        html,body{margin:0;padding:0;height:100%}
        body{font-family:'Inter',sans-serif;background:#07030a;color:#fff;-webkit-font-smoothing:antialiased;overflow:hidden}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
        .at-spin{animation:spin 1s linear infinite}
        .at-up{animation:fadeUp .4s cubic-bezier(.22,.68,0,1.2) both}
        .main-wrap{width:100%;height:100vh;overflow:hidden;display:flex;flex-direction:column;}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(193,39,45,.3);border-radius:2px}
        .at-header{padding:18px 24px 0;background:#07030a;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0;}
        .at-title-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
        .at-stats{display:flex;gap:16px;margin-bottom:14px;flex-wrap:wrap;}
        .at-stat{display:flex;align-items:center;gap:6px;}
        .at-toolbar{display:flex;align-items:center;gap:8px;padding-bottom:14px;flex-wrap:wrap;}
        .at-search-wrap{position:relative;flex:1;min-width:180px;}
        .at-search-wrap .mi{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:15px;color:rgba(255,255,255,.28);pointer-events:none;}
        .at-search{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:9px;color:#fff;font-family:'Inter',sans-serif;font-size:13px;padding:8px 12px 8px 34px;outline:none;transition:border-color .2s;}
        .at-search:focus{border-color:rgba(193,39,45,.4);}
        .at-search::placeholder{color:rgba(255,255,255,.22);}
        .at-filter-btn{padding:7px 13px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(255,255,255,.5);font-family:'Syne',sans-serif;font-size:11px;font-weight:700;cursor:pointer;transition:all .18s;white-space:nowrap;}
        .at-filter-btn:hover{background:rgba(255,255,255,.08);color:#fff;}
        .at-filter-btn.active{background:rgba(193,39,45,.2);border-color:rgba(193,39,45,.4);color:#f87171;}
        .at-content{flex:1;overflow-y:auto;padding:20px 24px;}
        .at-table{width:100%;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:14px;overflow:hidden;}
        .at-thead{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 80px;gap:8px;padding:10px 18px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Syne',sans-serif;font-size:10px;font-weight:700;color:rgba(255,255,255,.28);text-transform:uppercase;letter-spacing:.08em;}
        .at-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 80px;gap:8px;padding:13px 18px;border-bottom:1px solid rgba(255,255,255,.04);align-items:center;cursor:pointer;transition:background .15s;}
        .at-row:hover{background:rgba(255,255,255,.03);}
        .at-row:last-child{border-bottom:none;}
        .att-cell{display:flex;align-items:center;gap:9px;}
        .att-logo{width:32px;height:32px;border-radius:8px;object-fit:cover;flex-shrink:0;}
        .att-logo-ph{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:11px;color:#fff;flex-shrink:0;}
        .att-name{font-family:'Syne',sans-serif;font-weight:700;font-size:13px;color:#fff;}
        .cell-text{font-size:12px;color:rgba(255,255,255,.5);}
        .type-badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.06em;font-family:'Syne',sans-serif;background:rgba(193,39,45,.12);color:#f87171;border:1px solid rgba(193,39,45,.25);}
        .row-actions{display:flex;align-items:center;gap:6px;}
        .settings-btn{width:28px;height:28px;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;color:rgba(255,255,255,.4);}
        .settings-btn:hover{border-color:#C1272D;color:#C1272D;background:rgba(193,39,45,.1);}
        .delete-btn{width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,.2);background:rgba(239,68,68,.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;color:rgba(239,68,68,.5);}
        .delete-btn:hover{border-color:#ef4444;color:#ef4444;background:rgba(239,68,68,.15);}
        .empty{display:flex;flex-direction:column;align-items:center;padding:60px 0;gap:12px;}
        .empty .material-icons{font-size:44px;color:rgba(255,255,255,.08);}
        .empty span:last-child{font-family:'Syne',sans-serif;color:rgba(255,255,255,.22);font-size:13px;}
        .at-overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
        .at-modal{background:linear-gradient(160deg,#170818 0%,#0c030f 100%);border:1px solid rgba(255,255,255,.1);border-radius:20px;width:100%;max-width:700px;max-height:90vh;overflow-y:auto;animation:scaleIn .22s ease both;}
        .at-modal::-webkit-scrollbar{width:4px;}
        .at-modal-head{padding:22px 24px 0;position:sticky;top:0;z-index:10;background:linear-gradient(160deg,#170818,#0c030f);border-bottom:1px solid rgba(255,255,255,.06);}
        .at-modal-body{padding:20px 24px 24px;}
        .at-tabs{display:flex;gap:0;border-bottom:1px solid rgba(255,255,255,.07);margin-bottom:18px;}
        .at-tab{padding:10px 16px;font-family:'Syne',sans-serif;font-weight:700;font-size:11px;color:rgba(255,255,255,.4);cursor:pointer;text-transform:uppercase;letter-spacing:.07em;border-bottom:2px solid transparent;transition:all .18s;display:flex;align-items:center;gap:6px;}
        .at-tab:hover{color:rgba(255,255,255,.7);}
        .at-tab.active{color:#C1272D;border-bottom-color:#C1272D;}
        .at-tab .mi{font-size:14px;}
        .sm-modal{background:linear-gradient(160deg,#170818 0%,#0c030f 100%);border:1px solid rgba(255,255,255,.1);border-radius:20px;width:100%;max-width:580px;max-height:90vh;overflow-y:auto;animation:slideUp .25s ease both;padding:28px;}
        .sm-modal::-webkit-scrollbar{width:4px;}
        .db-field{margin-bottom:13px;}
        .db-field label{display:block;font-size:10px;font-weight:700;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;font-family:'Syne',sans-serif;}
        .db-field input,.db-field select,.db-field textarea{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:9px;color:#fff;font-family:'Inter',sans-serif;font-size:13px;padding:10px 13px;outline:none;transition:border-color .18s;appearance:none;-webkit-appearance:none;}
        .db-field input:focus,.db-field select:focus,.db-field textarea:focus{border-color:rgba(193,39,45,.5);}
        .db-field input::placeholder,.db-field textarea::placeholder{color:rgba(255,255,255,.22);}
        .db-field select option{background:#1c0a1e;color:#fff;}
        .db-field textarea{resize:vertical;min-height:72px;}
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
        .img-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;}
        .img-card{border-radius:10px;overflow:hidden;aspect-ratio:4/3;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);}
        .img-card img{width:100%;height:100%;object-fit:cover;}
        .info-row{display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.05);}
        .info-row:last-child{border-bottom:none;}
        .info-label{font-family:'Syne',sans-serif;font-weight:700;font-size:11px;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.06em;}
        .info-val{font-family:'Inter',sans-serif;font-size:13px;color:#fff;text-align:right;max-width:60%;}
      `}</style>

      <div className="main-wrap">
        <div className="at-header">
          <div className="at-title-row">
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,borderRadius:10,background:"rgba(193,39,45,.15)",border:"1px solid rgba(193,39,45,.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span className="material-icons" style={{fontSize:18,color:"#C1272D"}}>attractions</span>
              </div>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#fff"}}>Gestion des Attractions</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:1}}>{attractions.length} attractions chargées</div>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn-p" style={{padding:"7px 14px",fontSize:11}} onClick={()=>setShowAdd(true)}>
                <span className="material-icons" style={{fontSize:14}}>add</span>Ajouter une attraction
              </button>
              <button className="btn-s" style={{padding:"7px 14px",fontSize:11}} onClick={loadAllAttractions}>
                <span className="material-icons" style={{fontSize:14}}>refresh</span>Actualiser
              </button>
            </div>
          </div>

          <div className="at-stats">
            {[
              {label:`${attractions.length} Total`, dot:"rgba(255,255,255,.4)"},
              ...usedTypes.slice(0,4).map(t=>({label:`${attractions.filter(a=>a.type===t).length} ${t}`, dot:"#C1272D"})),
            ].map(({label,dot})=>(
              <div key={label} className="at-stat">
                <div style={{width:6,height:6,borderRadius:"50%",background:dot,flexShrink:0}}/>
                <span style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:"rgba(255,255,255,.6)"}}>{label}</span>
              </div>
            ))}
          </div>

          <div className="at-toolbar">
            <div className="at-search-wrap">
              <span className="material-icons mi">search</span>
              <input className="at-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher attraction, type, adresse…"/>
            </div>
            <button className={`at-filter-btn${filterType==="ALL"?" active":""}`} onClick={()=>setFilterType("ALL")}>Tous</button>
            {usedTypes.map(t=>(
              <button key={t} className={`at-filter-btn${filterType===t?" active":""}`} onClick={()=>setFilterType(t)}>{t}</button>
            ))}
          </div>
        </div>

        <div className="at-content">
          {loading ? (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:320,gap:14}}>
              <div className="at-spin" style={{width:34,height:34,border:"3px solid #C1272D",borderTopColor:"transparent",borderRadius:"50%"}}/>
              <span style={{fontFamily:"'Syne',sans-serif",color:"rgba(255,255,255,.4)",fontSize:14}}>Chargement des attractions…</span>
            </div>
          ) : (
            <div className="at-table">
              <div className="at-thead">
                <div>Attraction</div>
                <div>Type</div>
                <div>Prix</div>
                <div>Horaires</div>
                <div>Adresse</div>
                <div style={{textAlign:"center"}}>Actions</div>
              </div>
              {filtered.length === 0 && (
                <div className="empty">
                  <span className="material-icons">attractions</span>
                  <span>Aucune attraction trouvée</span>
                </div>
              )}
              {filtered.map((att, i) => (
                <div key={att.id||i} className="at-row at-up" style={{animationDelay:`${i*.03}s`}} onClick={()=>openDetail(att)}>
                  <div className="att-cell">
                    {att.imageUrl
                      ?<img src={att.imageUrl} alt={att.name} className="att-logo"/>
                      :<div className="att-logo-ph" style={{background:hue(att.name)}}>{initials(att.name)}</div>}
                    <span className="att-name">{att.name||"—"}</span>
                  </div>
                  <div><span className="type-badge">{att.type||"—"}</span></div>
                  <div className="cell-text">{att.priceProxim||"—"}</div>
                  <div className="cell-text" style={{fontSize:11}}>
                    {att.houreOfOpening||"?"} – {att.houreOfClosing||"?"}
                  </div>
                  <div className="cell-text" style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {att.address||"—"}
                  </div>
                  <div className="row-actions" style={{justifyContent:"center"}} onClick={e=>e.stopPropagation()}>
                    <div className="settings-btn" title="Modifier" onClick={e=>openEdit(att,e)}>
                      <span className="material-icons" style={{fontSize:14}}>edit</span>
                    </div>
                    <div className="delete-btn" title="Supprimer" onClick={()=>setDeleteTarget(att)}>
                      <span className="material-icons" style={{fontSize:14}}>delete</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <div className="at-overlay" onClick={e=>{if(e.target===e.currentTarget){setShowAdd(false);setAddForm(EMPTY_FORM);setAddCityId("");}}}>
          <div className="sm-modal">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:"#fff"}}>Ajouter une attraction</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>Remplissez les informations</div>
              </div>
              <button className="ibtn" onClick={()=>{setShowAdd(false);setAddForm(EMPTY_FORM);setAddCityId("");}}>
                <span className="material-icons" style={{fontSize:17}}>close</span>
              </button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
              <div className="db-field" style={{gridColumn:"1/-1"}}>
                <label>Ville hôte *</label>
                <select value={addCityId} onChange={e=>setAddCityId(e.target.value)}>
                  <option value="">— Sélectionner la ville —</option>
                  {cities.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="db-field">
                <label>Nom *</label>
                <input type="text" value={addForm.name} onChange={e=>setAddForm(f=>({...f,name:e.target.value}))} placeholder="Ex: Mosquée Hassan II"/>
              </div>
              <div className="db-field">
                <label>Pays</label>
                <input type="text" value={addForm.country} onChange={e=>setAddForm(f=>({...f,country:e.target.value}))} placeholder="Ex: Maroc"/>
              </div>
              <div className="db-field">
                <label>Type</label>
                <select value={addForm.type} onChange={e=>setAddForm(f=>({...f,type:e.target.value}))}>
                  {ATTRACTION_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="db-field">
                <label>Prix approximatif</label>
                <input type="text" value={addForm.priceProxim} onChange={e=>setAddForm(f=>({...f,priceProxim:e.target.value}))} placeholder="Ex: 120 MAD"/>
              </div>
              <div className="db-field">
                <label>Heure ouverture</label>
                <input type="text" value={addForm.houreOfOpening} onChange={e=>setAddForm(f=>({...f,houreOfOpening:e.target.value}))} placeholder="Ex: 09:00"/>
              </div>
              <div className="db-field">
                <label>Heure fermeture</label>
                <input type="text" value={addForm.houreOfClosing} onChange={e=>setAddForm(f=>({...f,houreOfClosing:e.target.value}))} placeholder="Ex: 18:00"/>
              </div>
              <div className="db-field">
                <label>Latitude</label>
                <input type="number" value={addForm.latitude} onChange={e=>setAddForm(f=>({...f,latitude:e.target.value}))} placeholder="33.5731"/>
              </div>
              <div className="db-field">
                <label>Longitude</label>
                <input type="number" value={addForm.longitude} onChange={e=>setAddForm(f=>({...f,longitude:e.target.value}))} placeholder="-7.5898"/>
              </div>
              <div className="db-field" style={{gridColumn:"1/-1"}}>
                <label>Adresse</label>
                <input type="text" value={addForm.address} onChange={e=>setAddForm(f=>({...f,address:e.target.value}))} placeholder="Adresse complète"/>
              </div>
              <div className="db-field" style={{gridColumn:"1/-1"}}>
                <label>Image URL</label>
                <input type="text" value={addForm.imageUrl} onChange={e=>setAddForm(f=>({...f,imageUrl:e.target.value}))} placeholder="https://…"/>
              </div>
              <div className="db-field" style={{gridColumn:"1/-1"}}>
                <label>Description</label>
                <textarea value={addForm.description} onChange={e=>setAddForm(f=>({...f,description:e.target.value}))} placeholder="Description de l'attraction…"/>
              </div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:6}}>
              <button className="btn-s" onClick={()=>{setShowAdd(false);setAddForm(EMPTY_FORM);setAddCityId("");}}>Annuler</button>
              <button className="btn-p" onClick={submitAdd} disabled={saving}>
                {saving
                  ?<><div className="at-spin" style={{width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%"}}/>Enregistrement…</>
                  :<><span className="material-icons" style={{fontSize:14}}>add</span>Créer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editTarget && (
        <div className="at-overlay" onClick={e=>{if(e.target===e.currentTarget)setEditTarget(null);}}>
          <div className="sm-modal">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:"#fff"}}>Modifier l'attraction</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>{editTarget.name} · #{editTarget.id}</div>
              </div>
              <button className="ibtn" onClick={()=>setEditTarget(null)}>
                <span className="material-icons" style={{fontSize:17}}>close</span>
              </button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
              <div className="db-field">
                <label>Nom</label>
                <input type="text" value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))}/>
              </div>
              <div className="db-field">
                <label>Pays</label>
                <input type="text" value={editForm.country} onChange={e=>setEditForm(f=>({...f,country:e.target.value}))}/>
              </div>
              <div className="db-field">
                <label>Type</label>
                <select value={editForm.type} onChange={e=>setEditForm(f=>({...f,type:e.target.value}))}>
                  {ATTRACTION_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="db-field">
                <label>Prix approximatif</label>
                <input type="text" value={editForm.priceProxim} onChange={e=>setEditForm(f=>({...f,priceProxim:e.target.value}))}/>
              </div>
              <div className="db-field">
                <label>Heure ouverture</label>
                <input type="text" value={editForm.houreOfOpening} onChange={e=>setEditForm(f=>({...f,houreOfOpening:e.target.value}))}/>
              </div>
              <div className="db-field">
                <label>Heure fermeture</label>
                <input type="text" value={editForm.houreOfClosing} onChange={e=>setEditForm(f=>({...f,houreOfClosing:e.target.value}))}/>
              </div>
              <div className="db-field">
                <label>Latitude</label>
                <input type="number" value={editForm.latitude} onChange={e=>setEditForm(f=>({...f,latitude:e.target.value}))}/>
              </div>
              <div className="db-field">
                <label>Longitude</label>
                <input type="number" value={editForm.longitude} onChange={e=>setEditForm(f=>({...f,longitude:e.target.value}))}/>
              </div>
              <div className="db-field" style={{gridColumn:"1/-1"}}>
                <label>Adresse</label>
                <input type="text" value={editForm.address} onChange={e=>setEditForm(f=>({...f,address:e.target.value}))}/>
              </div>
              <div className="db-field" style={{gridColumn:"1/-1"}}>
                <label>Image URL</label>
                <input type="text" value={editForm.imageUrl} onChange={e=>setEditForm(f=>({...f,imageUrl:e.target.value}))}/>
              </div>
              <div className="db-field" style={{gridColumn:"1/-1"}}>
                <label>Description</label>
                <textarea value={editForm.description} onChange={e=>setEditForm(f=>({...f,description:e.target.value}))}/>
              </div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:6}}>
              <button className="btn-s" onClick={()=>setEditTarget(null)}>Annuler</button>
              <button className="btn-p" onClick={submitEdit} disabled={editSaving}>
                {editSaving
                  ?<><div className="at-spin" style={{width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%"}}/>Enregistrement…</>
                  :<><span className="material-icons" style={{fontSize:14}}>save</span>Enregistrer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteTarget && (
        <div className="at-overlay" onClick={e=>{if(e.target===e.currentTarget)setDeleteTarget(null);}}>
          <div className="sm-modal" style={{maxWidth:420}}>
            <div style={{width:52,height:52,borderRadius:14,background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.25)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
              <span className="material-icons" style={{fontSize:26,color:"#ef4444"}}>delete_forever</span>
            </div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#fff",marginBottom:8}}>Supprimer cette attraction ?</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.4)",marginBottom:6,lineHeight:1.6}}>Cette action est irréversible.</div>
            <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:"12px 14px",marginBottom:22,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#ef4444",flexShrink:0}}/>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,color:"#fff"}}>{deleteTarget.name}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>{deleteTarget.type||"—"} · #{deleteTarget.id}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button className="btn-s" onClick={()=>setDeleteTarget(null)}>Annuler</button>
              <button className="btn-danger" onClick={confirmDelete} disabled={deleting}>
                {deleting
                  ?<><div className="at-spin" style={{width:13,height:13,border:"2px solid rgba(239,68,68,.4)",borderTopColor:"#ef4444",borderRadius:"50%"}}/>Suppression…</>
                  :<><span className="material-icons" style={{fontSize:14}}>delete</span>Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailAtt && (
        <div className="at-overlay" onClick={e=>{if(e.target===e.currentTarget)setDetailAtt(null);}}>
          <div className="at-modal">
            <div className="at-modal-head">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  {detailAtt.imageUrl
                    ?<img src={detailAtt.imageUrl} style={{width:42,height:42,borderRadius:10,objectFit:"cover"}}/>
                    :<div style={{width:42,height:42,borderRadius:10,background:hue(detailAtt.name),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14,color:"#fff"}}>{initials(detailAtt.name)}</div>}
                  <div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#fff"}}>{detailAtt.name}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:3}}>{detailAtt.type||"—"} · #{detailAtt.id}</div>
                  </div>
                </div>
                <button className="ibtn" onClick={()=>setDetailAtt(null)}>
                  <span className="material-icons" style={{fontSize:17}}>close</span>
                </button>
              </div>
              <div className="at-tabs">
                {[{id:"info",icon:"info",label:"Infos"},{id:"images",icon:"image",label:"Images"}].map(({id,icon,label})=>(
                  <div key={id} className={`at-tab${detailTab===id?" active":""}`} onClick={()=>setDetailTab(id)}>
                    <span className="material-icons mi">{icon}</span>{label}
                  </div>
                ))}
              </div>
            </div>
            <div className="at-modal-body">
              {detailTab==="info" && (
                <div>
                  {[
                    {label:"Nom",val:detailAtt.name},
                    {label:"Type",val:detailAtt.type},
                    {label:"Pays",val:detailAtt.country},
                    {label:"Prix",val:detailAtt.priceProxim},
                    {label:"Adresse",val:detailAtt.address},
                    {label:"Ouverture",val:detailAtt.houreOfOpening},
                    {label:"Fermeture",val:detailAtt.houreOfClosing},
                    {label:"Latitude",val:detailAtt.latitude},
                    {label:"Longitude",val:detailAtt.longitude},
                    {label:"Description",val:detailAtt.description},
                  ].map(({label,val})=>(
                    <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                      <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".06em"}}>{label}</span>
                      <span style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#fff",textAlign:"right",maxWidth:"60%"}}>{val||"—"}</span>
                    </div>
                  ))}
                  <div style={{display:"flex",gap:10,marginTop:18}}>
                    <button className="btn-p" onClick={()=>{setDetailAtt(null);openEdit(detailAtt,null);}}>
                      <span className="material-icons" style={{fontSize:14}}>edit</span>Modifier
                    </button>
                    <button className="btn-danger" onClick={()=>{setDetailAtt(null);setDeleteTarget(detailAtt);}}>
                      <span className="material-icons" style={{fontSize:14}}>delete</span>Supprimer
                    </button>
                  </div>
                </div>
              )}
              {detailTab==="images" && (
                <div>
                  {loadingDetail
                    ?<div style={{fontSize:12,color:"rgba(255,255,255,.3)",padding:"20px 0"}}>Chargement images…</div>
                    :detailImages.length===0
                      ?<div className="empty"><span className="material-icons">image</span><span>Aucune image</span></div>
                      :<div className="img-grid">
                        {detailImages.map((img,i)=>(
                          <div key={img.id||i} className="img-card">
                            <img src={img.imageUrl} alt={`img-${i}`} onError={e=>{e.target.style.display="none";}}/>
                          </div>
                        ))}
                      </div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:toast.type==="success"?"rgba(22,163,74,.95)":"rgba(193,39,45,.95)",color:"#fff",padding:"11px 20px",borderRadius:10,fontSize:13,fontFamily:"'Syne',sans-serif",fontWeight:700,display:"flex",alignItems:"center",gap:9,zIndex:400,boxShadow:"0 8px 28px rgba(0,0,0,.5)",whiteSpace:"nowrap"}}>
          <span className="material-icons" style={{fontSize:17}}>{toast.type==="success"?"check_circle":"cancel"}</span>
          {toast.msg}
        </div>
      )}
    </>
  );
}
