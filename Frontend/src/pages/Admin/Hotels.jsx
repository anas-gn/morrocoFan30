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

const EMPTY_FORM = {
  name:"", address:"", description:"", email:"", phone:"",
  imageUrl:"", urlReservation:"", cityHostId:0
};

export default function HotelsAdmin() {
  const router = useRouter();
  const [hotels, setHotels]     = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [cities, setCities]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [toast, setToast]       = useState(null);

  const [showAdd, setShowAdd]   = useState(false);
  const [addForm, setAddForm]   = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm]     = useState(EMPTY_FORM);
  const [editSaving, setEditSaving] = useState(false);

  const [detailHotel, setDetailHotel] = useState(null);
  const [detailTab, setDetailTab]     = useState("info");

  const showToast = (type, msg) => { setToast({type,msg}); setTimeout(()=>setToast(null),3500); };

  const loadHotels = () => {
    setLoading(true);
    fetch(`${BASE}/hotels/all`)
      .then(r => r.json())
      .then(d => { setHotels(Array.isArray(d)?d:[]); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const loadCities = () => {
    fetch(`${BASE}/cities/all`)
      .then(r => r.json())
      .then(d => setCities(Array.isArray(d)?d:[]))
      .catch(()=>{});
  };

  useEffect(() => { loadHotels(); loadCities(); }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("userType");
    if (!t) router.push("/Login");
    else if (t === "SUPPORTER") router.push("/Acceuil");
  }, []);

  useEffect(() => {
    let f = [...hotels];
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(h =>
        h.name?.toLowerCase().includes(q) ||
        h.address?.toLowerCase().includes(q) ||
        h.cityName?.toLowerCase().includes(q) ||
        h.email?.toLowerCase().includes(q)
      );
    }
    setFiltered(f);
  }, [search, hotels]);

  const submitAdd = async () => {
    if (!addForm.name) { showToast("error","Le nom est requis."); return; }
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/hotels/creat`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({...addForm, cityHostId: addForm.cityHostId ? parseInt(addForm.cityHostId) : 0}),
      });
      if (res.ok) {
        showToast("success","Hôtel ajouté !");
        setShowAdd(false); setAddForm(EMPTY_FORM); loadHotels();
      } else showToast("error","Échec ajout.");
    } catch { showToast("error","Erreur réseau."); }
    setSaving(false);
  };

  const submitEdit = async () => {
    if (!editForm.name) { showToast("error","Le nom est requis."); return; }
    setEditSaving(true);
    try {
      const res = await fetch(`${BASE}/hotels/update/${editTarget.id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({...editForm, cityHostId: editForm.cityHostId ? parseInt(editForm.cityHostId) : 0}),
      });
      if (res.ok) {
        showToast("success","Hôtel mis à jour !");
        setEditTarget(null); loadHotels();
      } else showToast("error","Échec mise à jour.");
    } catch { showToast("error","Erreur réseau."); }
    setEditSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BASE}/hotels/delete/${deleteTarget.id}`, { method:"DELETE" });
      if (res.ok) {
        showToast("success","Hôtel supprimé !");
        setHotels(p => p.filter(h => h.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else showToast("error","Échec suppression.");
    } catch { showToast("error","Erreur réseau."); }
    setDeleting(false);
  };

  const openEdit = (hotel, e) => {
    e && e.stopPropagation();
    setEditTarget(hotel);
    setEditForm({
      name:hotel.name||"", address:hotel.address||"", description:hotel.description||"",
      email:hotel.email||"", phone:hotel.phone||"", imageUrl:hotel.imageUrl||"",
      urlReservation:hotel.urlReservation||"", cityHostId:hotel.cityHostId||0,
    });
  };

  const cityCount = (id) => hotels.filter(h=>h.cityHostId===id).length;

  return (
    <>
      <Head>
        <title>Hôtels · MoroccoFan2030</title>
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
        .ht-spin{animation:spin 1s linear infinite}
        .ht-up{animation:fadeUp .4s cubic-bezier(.22,.68,0,1.2) both}
        .main-wrap{width:100%;height:100vh;overflow:hidden;display:flex;flex-direction:column;}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(193,39,45,.3);border-radius:2px}
        .ht-header{padding:18px 24px 0;background:#07030a;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0;}
        .ht-title-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
        .ht-stats{display:flex;gap:16px;margin-bottom:14px;flex-wrap:wrap;}
        .ht-stat{display:flex;align-items:center;gap:6px;}
        .ht-toolbar{display:flex;align-items:center;gap:8px;padding-bottom:14px;flex-wrap:wrap;}
        .ht-search-wrap{position:relative;flex:1;min-width:180px;}
        .ht-search-wrap .mi{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:15px;color:rgba(255,255,255,.28);pointer-events:none;}
        .ht-search{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:9px;color:#fff;font-family:'Inter',sans-serif;font-size:13px;padding:8px 12px 8px 34px;outline:none;transition:border-color .2s;}
        .ht-search:focus{border-color:rgba(193,39,45,.4);}
        .ht-search::placeholder{color:rgba(255,255,255,.22);}
        .ht-content{flex:1;overflow-y:auto;padding:20px 24px;}
        .ht-table{width:100%;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:14px;overflow:hidden;}
        .ht-thead{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 80px;gap:8px;padding:10px 18px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Syne',sans-serif;font-size:10px;font-weight:700;color:rgba(255,255,255,.28);text-transform:uppercase;letter-spacing:.08em;}
        .ht-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 80px;gap:8px;padding:13px 18px;border-bottom:1px solid rgba(255,255,255,.04);align-items:center;cursor:pointer;transition:background .15s;}
        .ht-row:hover{background:rgba(255,255,255,.03);}
        .ht-row:last-child{border-bottom:none;}
        .hotel-cell{display:flex;align-items:center;gap:9px;}
        .hotel-logo{width:32px;height:32px;border-radius:8px;object-fit:cover;flex-shrink:0;}
        .hotel-logo-ph{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:11px;color:#fff;flex-shrink:0;}
        .hotel-name{font-family:'Syne',sans-serif;font-weight:700;font-size:13px;color:#fff;}
        .cell-text{font-size:12px;color:rgba(255,255,255,.5);}
        .city-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.06em;font-family:'Syne',sans-serif;background:rgba(0,98,51,.15);color:#4ade80;border:1px solid rgba(0,98,51,.3);}
        .row-actions{display:flex;align-items:center;gap:6px;}
        .settings-btn{width:28px;height:28px;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;color:rgba(255,255,255,.4);}
        .settings-btn:hover{border-color:#C1272D;color:#C1272D;background:rgba(193,39,45,.1);}
        .delete-btn{width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,.2);background:rgba(239,68,68,.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;color:rgba(239,68,68,.5);}
        .delete-btn:hover{border-color:#ef4444;color:#ef4444;background:rgba(239,68,68,.15);}
        .view-btn{width:28px;height:28px;border-radius:7px;border:1px solid rgba(99,102,241,.2);background:rgba(99,102,241,.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;color:rgba(99,102,241,.5);}
        .view-btn:hover{border-color:#818cf8;color:#818cf8;background:rgba(99,102,241,.15);}
        .empty{display:flex;flex-direction:column;align-items:center;padding:60px 0;gap:12px;}
        .empty .material-icons{font-size:44px;color:rgba(255,255,255,.08);}
        .empty span:last-child{font-family:'Syne',sans-serif;color:rgba(255,255,255,.22);font-size:13px;}
        .ht-overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
        .ht-modal{background:linear-gradient(160deg,#170818 0%,#0c030f 100%);border:1px solid rgba(255,255,255,.1);border-radius:20px;width:100%;max-width:700px;max-height:90vh;overflow-y:auto;animation:scaleIn .22s ease both;}
        .ht-modal::-webkit-scrollbar{width:4px;}
        .ht-modal-head{padding:22px 24px 0;position:sticky;top:0;z-index:10;background:linear-gradient(160deg,#170818,#0c030f);border-bottom:1px solid rgba(255,255,255,.06);}
        .ht-modal-body{padding:20px 24px 24px;}
        .ht-tabs{display:flex;gap:0;border-bottom:1px solid rgba(255,255,255,.07);margin-bottom:18px;}
        .ht-tab{padding:10px 16px;font-family:'Syne',sans-serif;font-weight:700;font-size:11px;color:rgba(255,255,255,.4);cursor:pointer;text-transform:uppercase;letter-spacing:.07em;border-bottom:2px solid transparent;transition:all .18s;display:flex;align-items:center;gap:6px;}
        .ht-tab:hover{color:rgba(255,255,255,.7);}
        .ht-tab.active{color:#C1272D;border-bottom-color:#C1272D;}
        .ht-tab .mi{font-size:14px;}
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
        .contact-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:16px;margin-bottom:16px;}
        .contact-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);}
        .contact-row:last-child{border-bottom:none;}
        .resv-link{display:inline-flex;align-items:center;gap:7px;padding:10px 16px;background:rgba(99,102,241,.12);color:#818cf8;border:1px solid rgba(99,102,241,.25);border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;text-decoration:none;transition:all .18s;}
        .resv-link:hover{background:rgba(99,102,241,.22);}
      `}</style>

      <div className="main-wrap">
        <div className="ht-header">
          <div className="ht-title-row">
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,borderRadius:10,background:"rgba(193,39,45,.15)",border:"1px solid rgba(193,39,45,.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span className="material-icons" style={{fontSize:18,color:"#C1272D"}}>hotel</span>
              </div>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#fff"}}>Gestion des Hôtels</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:1}}>{hotels.length} hôtels chargés</div>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn-p" style={{padding:"7px 14px",fontSize:11}} onClick={()=>setShowAdd(true)}>
                <span className="material-icons" style={{fontSize:14}}>add</span>Ajouter un hôtel
              </button>
              <button className="btn-s" style={{padding:"7px 14px",fontSize:11}} onClick={loadHotels}>
                <span className="material-icons" style={{fontSize:14}}>refresh</span>Actualiser
              </button>
            </div>
          </div>

          <div className="ht-stats">
            {[
              {label:`${hotels.length} Total`, dot:"rgba(255,255,255,.4)"},
              {label:`${cities.length} Villes`, dot:"#4ade80"},
              {label:`${hotels.filter(h=>h.urlReservation).length} Réservables`, dot:"#818cf8"},
            ].map(({label,dot})=>(
              <div key={label} className="ht-stat">
                <div style={{width:6,height:6,borderRadius:"50%",background:dot,flexShrink:0}}/>
                <span style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:"rgba(255,255,255,.6)"}}>{label}</span>
              </div>
            ))}
          </div>

          <div className="ht-toolbar">
            <div className="ht-search-wrap">
              <span className="material-icons mi">search</span>
              <input className="ht-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher hôtel, ville, email…"/>
            </div>
          </div>
        </div>

        <div className="ht-content">
          {loading ? (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:320,gap:14}}>
              <div className="ht-spin" style={{width:34,height:34,border:"3px solid #C1272D",borderTopColor:"transparent",borderRadius:"50%"}}/>
              <span style={{fontFamily:"'Syne',sans-serif",color:"rgba(255,255,255,.4)",fontSize:14}}>Chargement des hôtels…</span>
            </div>
          ) : (
            <div className="ht-table">
              <div className="ht-thead">
                <div>Hôtel</div>
                <div>Ville</div>
                <div>Téléphone</div>
                <div>Email</div>
                <div>Adresse</div>
                <div style={{textAlign:"center"}}>Actions</div>
              </div>
              {filtered.length === 0 && (
                <div className="empty">
                  <span className="material-icons">hotel</span>
                  <span>Aucun hôtel trouvé</span>
                </div>
              )}
              {filtered.map((hotel, i) => (
                <div key={hotel.id||i} className="ht-row ht-up" style={{animationDelay:`${i*.03}s`}} onClick={()=>setDetailHotel(hotel)}>
                  <div className="hotel-cell">
                    {hotel.imageUrl
                      ?<img src={hotel.imageUrl} alt={hotel.name} className="hotel-logo"/>
                      :<div className="hotel-logo-ph" style={{background:hue(hotel.name)}}>{initials(hotel.name)}</div>}
                    <span className="hotel-name">{hotel.name||"—"}</span>
                  </div>
                  <div>
                    {hotel.cityName
                      ?<span className="city-badge"><span className="material-icons" style={{fontSize:10}}>location_on</span>{hotel.cityName}</span>
                      :<span className="cell-text">—</span>}
                  </div>
                  <div className="cell-text">{hotel.phone||"—"}</div>
                  <div className="cell-text" style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{hotel.email||"—"}</div>
                  <div className="cell-text" style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{hotel.address||"—"}</div>
                  <div className="row-actions" style={{justifyContent:"center"}} onClick={e=>e.stopPropagation()}>
                    <div className="settings-btn" title="Modifier" onClick={e=>openEdit(hotel,e)}>
                      <span className="material-icons" style={{fontSize:14}}>edit</span>
                    </div>
                    <div className="delete-btn" title="Supprimer" onClick={()=>setDeleteTarget(hotel)}>
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
        <div className="ht-overlay" onClick={e=>{if(e.target===e.currentTarget){setShowAdd(false);setAddForm(EMPTY_FORM);}}}>
          <div className="sm-modal">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:"#fff"}}>Ajouter un hôtel</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>Remplissez les informations</div>
              </div>
              <button className="ibtn" onClick={()=>{setShowAdd(false);setAddForm(EMPTY_FORM);}}>
                <span className="material-icons" style={{fontSize:17}}>close</span>
              </button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
              <div className="db-field" style={{gridColumn:"1/-1"}}>
                <label>Nom *</label>
                <input type="text" value={addForm.name} onChange={e=>setAddForm(f=>({...f,name:e.target.value}))} placeholder="Ex: Hotel Fassia"/>
              </div>
              <div className="db-field" style={{gridColumn:"1/-1"}}>
                <label>Ville hôte</label>
                <select value={addForm.cityHostId} onChange={e=>setAddForm(f=>({...f,cityHostId:e.target.value}))}>
                  <option value={0}>— Sélectionner la ville —</option>
                  {cities.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="db-field">
                <label>Téléphone</label>
                <input type="text" value={addForm.phone} onChange={e=>setAddForm(f=>({...f,phone:e.target.value}))} placeholder="+212 …"/>
              </div>
              <div className="db-field">
                <label>Email</label>
                <input type="email" value={addForm.email} onChange={e=>setAddForm(f=>({...f,email:e.target.value}))} placeholder="contact@hotel.ma"/>
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
                <label>URL de réservation</label>
                <input type="text" value={addForm.urlReservation} onChange={e=>setAddForm(f=>({...f,urlReservation:e.target.value}))} placeholder="https://booking.com/…"/>
              </div>
              <div className="db-field" style={{gridColumn:"1/-1"}}>
                <label>Description</label>
                <textarea value={addForm.description} onChange={e=>setAddForm(f=>({...f,description:e.target.value}))} placeholder="Description de l'hôtel…"/>
              </div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:6}}>
              <button className="btn-s" onClick={()=>{setShowAdd(false);setAddForm(EMPTY_FORM);}}>Annuler</button>
              <button className="btn-p" onClick={submitAdd} disabled={saving}>
                {saving
                  ?<><div className="ht-spin" style={{width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%"}}/>Enregistrement…</>
                  :<><span className="material-icons" style={{fontSize:14}}>add</span>Créer l'hôtel</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editTarget && (
        <div className="ht-overlay" onClick={e=>{if(e.target===e.currentTarget)setEditTarget(null);}}>
          <div className="sm-modal">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:"#fff"}}>Modifier l'hôtel</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>{editTarget.name} · #{editTarget.id}</div>
              </div>
              <button className="ibtn" onClick={()=>setEditTarget(null)}>
                <span className="material-icons" style={{fontSize:17}}>close</span>
              </button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
              <div className="db-field" style={{gridColumn:"1/-1"}}>
                <label>Nom</label>
                <input type="text" value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))}/>
              </div>
              <div className="db-field" style={{gridColumn:"1/-1"}}>
                <label>Ville hôte</label>
                <select value={editForm.cityHostId} onChange={e=>setEditForm(f=>({...f,cityHostId:e.target.value}))}>
                  <option value={0}>— Sélectionner la ville —</option>
                  {cities.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="db-field">
                <label>Téléphone</label>
                <input type="text" value={editForm.phone} onChange={e=>setEditForm(f=>({...f,phone:e.target.value}))}/>
              </div>
              <div className="db-field">
                <label>Email</label>
                <input type="email" value={editForm.email} onChange={e=>setEditForm(f=>({...f,email:e.target.value}))}/>
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
                <label>URL de réservation</label>
                <input type="text" value={editForm.urlReservation} onChange={e=>setEditForm(f=>({...f,urlReservation:e.target.value}))}/>
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
                  ?<><div className="ht-spin" style={{width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%"}}/>Enregistrement…</>
                  :<><span className="material-icons" style={{fontSize:14}}>save</span>Enregistrer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteTarget && (
        <div className="ht-overlay" onClick={e=>{if(e.target===e.currentTarget)setDeleteTarget(null);}}>
          <div className="sm-modal" style={{maxWidth:420}}>
            <div style={{width:52,height:52,borderRadius:14,background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.25)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
              <span className="material-icons" style={{fontSize:26,color:"#ef4444"}}>delete_forever</span>
            </div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#fff",marginBottom:8}}>Supprimer cet hôtel ?</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.4)",marginBottom:6,lineHeight:1.6}}>Cette action est irréversible.</div>
            <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:"12px 14px",marginBottom:22,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#ef4444",flexShrink:0}}/>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,color:"#fff"}}>{deleteTarget.name}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>{deleteTarget.cityName||"—"} · #{deleteTarget.id}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button className="btn-s" onClick={()=>setDeleteTarget(null)}>Annuler</button>
              <button className="btn-danger" onClick={confirmDelete} disabled={deleting}>
                {deleting
                  ?<><div className="ht-spin" style={{width:13,height:13,border:"2px solid rgba(239,68,68,.4)",borderTopColor:"#ef4444",borderRadius:"50%"}}/>Suppression…</>
                  :<><span className="material-icons" style={{fontSize:14}}>delete</span>Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailHotel && (
        <div className="ht-overlay" onClick={e=>{if(e.target===e.currentTarget)setDetailHotel(null);}}>
          <div className="ht-modal">
            <div className="ht-modal-head">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  {detailHotel.imageUrl
                    ?<img src={detailHotel.imageUrl} style={{width:48,height:48,borderRadius:12,objectFit:"cover"}}/>
                    :<div style={{width:48,height:48,borderRadius:12,background:hue(detailHotel.name),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#fff"}}>{initials(detailHotel.name)}</div>}
                  <div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#fff"}}>{detailHotel.name}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:3}}>
                      {detailHotel.cityName||"—"} · #{detailHotel.id}
                    </div>
                  </div>
                </div>
                <button className="ibtn" onClick={()=>setDetailHotel(null)}>
                  <span className="material-icons" style={{fontSize:17}}>close</span>
                </button>
              </div>
              <div className="ht-tabs">
                {[{id:"info",icon:"info",label:"Infos"},{id:"contact",icon:"contact_phone",label:"Contact"}].map(({id,icon,label})=>(
                  <div key={id} className={`ht-tab${detailTab===id?" active":""}`} onClick={()=>setDetailTab(id)}>
                    <span className="material-icons mi">{icon}</span>{label}
                  </div>
                ))}
              </div>
            </div>
            <div className="ht-modal-body">
              {detailTab==="info" && (
                <div>
                  {detailHotel.imageUrl && (
                    <div style={{marginBottom:16,borderRadius:12,overflow:"hidden",maxHeight:200}}>
                      <img src={detailHotel.imageUrl} style={{width:"100%",height:200,objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                    </div>
                  )}
                  {[
                    {label:"Nom",val:detailHotel.name},
                    {label:"Ville",val:detailHotel.cityName},
                    {label:"Adresse",val:detailHotel.address},
                    {label:"Description",val:detailHotel.description},
                  ].map(({label,val})=>(
                    <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                      <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".06em"}}>{label}</span>
                      <span style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#fff",textAlign:"right",maxWidth:"60%"}}>{val||"—"}</span>
                    </div>
                  ))}
                  {detailHotel.urlReservation && (
                    <div style={{marginTop:16}}>
                      <a className="resv-link" href={detailHotel.urlReservation} target="_blank" rel="noopener noreferrer">
                        <span className="material-icons" style={{fontSize:14}}>open_in_new</span>Réserver en ligne
                      </a>
                    </div>
                  )}
                  <div style={{display:"flex",gap:10,marginTop:18}}>
                    <button className="btn-p" onClick={()=>{setDetailHotel(null);openEdit(detailHotel,null);}}>
                      <span className="material-icons" style={{fontSize:14}}>edit</span>Modifier
                    </button>
                    <button className="btn-danger" onClick={()=>{setDetailHotel(null);setDeleteTarget(detailHotel);}}>
                      <span className="material-icons" style={{fontSize:14}}>delete</span>Supprimer
                    </button>
                  </div>
                </div>
              )}
              {detailTab==="contact" && (
                <div>
                  <div className="contact-card">
                    {[
                      {icon:"phone",label:"Téléphone",val:detailHotel.phone},
                      {icon:"email",label:"Email",val:detailHotel.email},
                      {icon:"language",label:"Réservation",val:detailHotel.urlReservation},
                    ].map(({icon,label,val})=>(
                      <div key={label} className="contact-row">
                        <div style={{width:32,height:32,borderRadius:8,background:"rgba(193,39,45,.1)",border:"1px solid rgba(193,39,45,.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <span className="material-icons" style={{fontSize:15,color:"#C1272D"}}>{icon}</span>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:10,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:2}}>{label}</div>
                          <div style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#fff"}}>{val||"—"}</div>
                        </div>
                        {val && (
                          <a href={icon==="email"?`mailto:${val}`:icon==="phone"?`tel:${val}`:val}
                             target={icon==="language"?"_blank":undefined}
                             rel="noopener noreferrer"
                             style={{textDecoration:"none"}}>
                            <div className="ibtn">
                              <span className="material-icons" style={{fontSize:13}}>open_in_new</span>
                            </div>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
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
