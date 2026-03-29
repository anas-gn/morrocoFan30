"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const BASE_GROUPS = "https://anas-gana1-fandb-backend.hf.space/api/groups";
const BASE_TEAMS  = "https://anas-gana1-fandb-backend.hf.space/api/teams";

const sf = async (url, opts) => {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(r.status);
  const t = await r.text();
  try { return JSON.parse(t); } catch { return t; }
};

const initials = n => n ? n.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "?";
const hue = n => {
  const c = ["#C1272D","#006233","#b45309","#0369a1","#7c3aed","#0f766e"];
  let h = 0;
  for (const x of (n||"")) h = (h*31+x.charCodeAt(0)) % c.length;
  return c[h];
};
const pts = gt => (gt.wins||0)*3 + (gt.draws||0);
const gd  = gt => (gt.goalsScored||0) - (gt.goalsConceded||0);

const EMPTY_GT = { teamID:"", wins:"", draws:"", loses:"", goalsScored:"", goalsConceded:"" };

export default function GroupsRespo() {
  const router = useRouter();

  const [groups,         setGroups]         = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [toast,          setToast]          = useState(null);
  const [allTeams,       setAllTeams]       = useState([]);

  const [showAdd,   setShowAdd]   = useState(false);
  const [addName,   setAddName]   = useState("");
  const [addRows,   setAddRows]   = useState([]);
  const [addGTForm, setAddGTForm] = useState(EMPTY_GT);
  const [showAddGT, setShowAddGT] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);

  const [updateTarget, setUpdateTarget] = useState(null);
  const [updName,      setUpdName]      = useState("");
  const [updRows,      setUpdRows]      = useState([]);
  const [updGTForm,    setUpdGTForm]    = useState(EMPTY_GT);
  const [showUpdGT,    setShowUpdGT]    = useState(false);
  const [savingUpd,    setSavingUpd]    = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingGrp,  setDeletingGrp]  = useState(false);

  const [selected,      setSelected]      = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

  const loadGroups = () => {
    setLoading(true);
    fetch(`${BASE_GROUPS}/getAll`)
      .then(r => r.json())
      .then(d => { setGroups(Array.isArray(d)?d:[]); setLoading(false); })
      .catch(() => setLoading(false));
  };
  const loadTeams = () => {
    fetch(`${BASE_TEAMS}/getAll`).then(r=>r.json()).then(d=>setAllTeams(Array.isArray(d)?d:[])).catch(()=>{});
  };

  useEffect(() => { loadGroups(); loadTeams(); }, []);
  useEffect(() => {
    if (typeof window==="undefined") return;
    const t = localStorage.getItem("userType");
    if (!t) router.push("/Login");
    else if (t==="SUPPORTER") router.push("/Acceuil");
  }, []);
  useEffect(() => {
    if (!search.trim()) { setFilteredGroups(groups); return; }
    const q = search.toLowerCase();
    setFilteredGroups(groups.filter(g =>
      g.name?.toLowerCase().includes(q) ||
      g.groupTeams?.some(gt => gt.teamName?.toLowerCase().includes(q) || gt.teamCountry?.toLowerCase().includes(q))
    ));
  }, [search, groups]);

  const pushAddRow = () => {
    if (!addGTForm.teamID) { showToast("error","Sélectionnez une équipe."); return; }
    if (addRows.some(r=>String(r.teamID)===String(addGTForm.teamID))) { showToast("error","Équipe déjà ajoutée."); return; }
    setAddRows(r=>[...r,{...addGTForm}]); setAddGTForm(EMPTY_GT); setShowAddGT(false);
  };
  const removeAddRow = i => setAddRows(r=>r.filter((_,idx)=>idx!==i));

  const submitAdd = async () => {
    if (!addName.trim()) { showToast("error","Nom du groupe requis."); return; }
    setSavingAdd(true);
    try {
      const body = {
        name: addName.trim(),
        groupTeams: addRows.map(r=>({
          teamID: parseInt(r.teamID), wins: parseInt(r.wins)||0, draws: parseInt(r.draws)||0,
          loses: parseInt(r.loses)||0, goalsScored: parseInt(r.goalsScored)||0, goalsConceded: parseInt(r.goalsConceded)||0,
        })),
      };
      const res = await fetch(`${BASE_GROUPS}/add`,{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      if (res.ok) { showToast("success","Groupe créé !"); setShowAdd(false); setAddName(""); setAddRows([]); loadGroups(); }
      else showToast("error","Échec création groupe.");
    } catch { showToast("error","Erreur réseau."); }
    setSavingAdd(false);
  };

  const openUpdate = async (e, group) => {
    e.stopPropagation();
    try {
      const freshGroup = await sf(`${BASE_GROUPS}/getOne/${group.id}`);
      setUpdateTarget(freshGroup); setUpdName(freshGroup.name||"");
      setUpdRows((freshGroup.groupTeams||[]).map(gt=>({
        teamID: String(gt.teamID), wins: String(gt.wins??0), draws: String(gt.draws??0),
        loses: String(gt.loses??0), goalsScored: String(gt.goalsScored??0), goalsConceded: String(gt.goalsConceded??0),
        _teamName: gt.teamName, _teamImageUrl: gt.teamImageUrl,
      })));
    } catch { showToast("error","Impossible de charger le groupe."); }
    setUpdGTForm(EMPTY_GT); setShowUpdGT(false);
  };

  const pushUpdRow = () => {
    if (!updGTForm.teamID) { showToast("error","Sélectionnez une équipe."); return; }
    if (updRows.some(r=>String(r.teamID)===String(updGTForm.teamID))) { showToast("error","Équipe déjà ajoutée."); return; }
    const team = allTeams.find(t=>String(t.id)===String(updGTForm.teamID));
    setUpdRows(r=>[...r,{...updGTForm,_teamName:team?.name,_teamImageUrl:team?.imageUrl}]);
    setUpdGTForm(EMPTY_GT); setShowUpdGT(false);
  };
  const removeUpdRow = i => setUpdRows(r=>r.filter((_,idx)=>idx!==i));

  const submitUpdate = async () => {
    if (!updName.trim()) { showToast("error","Nom du groupe requis."); return; }
    setSavingUpd(true);
    try {
      const body = {
        name: updName.trim(),
        groupTeams: updRows.map(r=>({
          teamID: parseInt(r.teamID), wins: parseInt(r.wins)||0, draws: parseInt(r.draws)||0,
          loses: parseInt(r.loses)||0, goalsScored: parseInt(r.goalsScored)||0, goalsConceded: parseInt(r.goalsConceded)||0,
        })),
      };
      const res = await fetch(`${BASE_GROUPS}/update/${updateTarget.id}`,{ method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      if (res.ok) { showToast("success","Groupe mis à jour !"); setUpdateTarget(null); loadGroups(); }
      else { const text = await res.text(); console.error("Update:",res.status,text); showToast("error",`Échec modification (${res.status}).`); loadGroups(); }
    } catch { showToast("error","Erreur réseau."); }
    setSavingUpd(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingGrp(true);
    try {
      const res = await fetch(`${BASE_GROUPS}/delete/${deleteTarget.id}`,{method:"DELETE"});
      if (res.ok) { showToast("success","Groupe supprimé !"); setGroups(p=>p.filter(g=>g.id!==deleteTarget.id)); setDeleteTarget(null); }
      else showToast("error","Échec suppression.");
    } catch { showToast("error","Erreur réseau."); }
    setDeletingGrp(false);
  };

  const openGroup = async group => {
    setSelected(null); setLoadingDetail(true);
    try { const d = await sf(`${BASE_GROUPS}/getOne/${group.id}`); setSelected(d); }
    catch { showToast("error","Impossible de charger le groupe."); }
    setLoadingDetail(false);
  };

  const teamName = id => allTeams.find(t=>String(t.id)===String(id))?.name || `#${id}`;
  const teamImg  = id => allTeams.find(t=>String(t.id)===String(id))?.imageUrl || null;
  const totalTeams = groups.reduce((s,g)=>s+(g.groupTeams?.length||0),0);

  /* reusable inline GT form */
  const GTRowForm = ({ form, setForm, onConfirm, usedTeamIDs=[], btnLabel="Confirmer" }) => (
    <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, padding:14, marginBottom:10 }}>
      <div className="gt-grid">
        <div className="db-field" style={{ gridColumn:"1/-1" }}>
          <label>Équipe *</label>
          <select value={form.teamID} onChange={e=>setForm(f=>({...f,teamID:e.target.value}))}>
            <option value="">— Sélectionner —</option>
            {allTeams.filter(t=>!usedTeamIDs.includes(String(t.id))||String(t.id)===String(form.teamID))
              .map(t=><option key={t.id} value={t.id}>{t.name} ({t.country})</option>)}
          </select>
        </div>
        {[
          {key:"wins",label:"Victoires"},{key:"draws",label:"Nuls"},{key:"loses",label:"Défaites"},
          {key:"goalsScored",label:"Buts+"},{key:"goalsConceded",label:"Buts-"},
        ].map(({key,label})=>(
          <div key={key} className="db-field">
            <label>{label}</label>
            <input type="number" min="0" value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder="0" />
          </div>
        ))}
      </div>
      <button className="btn-g" style={{width:"100%",justifyContent:"center",marginTop:4}} onClick={onConfirm}>
        <span className="material-icons" style={{fontSize:13}}>add</span>{btnLabel}
      </button>
    </div>
  );

  /* ─── render ─── */
  return (
    <>
      <Head>
        <title>Groupes · MoroccoFan2030</title>
        <link rel="icon" href="/images/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&family=Amiri:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        *,*::before,*::after{box-sizing:border-box}
        html,body{margin:0;padding:0;height:100%}
        body{font-family:'Inter',sans-serif;background:#07030a;color:#fff;-webkit-font-smoothing:antialiased;overflow:hidden}

        @keyframes fadeUp  {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes spin    {to{transform:rotate(360deg)}}
        @keyframes scaleIn {from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
        @keyframes slideUp {from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
        @keyframes slideUpFull {from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}

        .gr-spin {animation:spin 1s linear infinite}
        .gr-up   {animation:fadeUp .4s cubic-bezier(.22,.68,0,1.2) both}

        .main-wrap{height:100vh;overflow:hidden;width:100%;display:flex;flex-direction:column;}

        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(193,39,45,.3);border-radius:2px}

        /* ── HEADER ── */
        .gr-header{padding:16px 20px 0;background:#07030a;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0;}
        .gr-title-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:12px;flex-wrap:wrap;}
        .gr-title-left{display:flex;align-items:center;gap:12px;min-width:0;}
        .gr-title-actions{display:flex;gap:8px;flex-shrink:0;}
        .gr-stats{display:flex;gap:16px;margin-bottom:12px;flex-wrap:wrap;}
        .gr-stat{display:flex;align-items:center;gap:6px;}
        .gr-stat-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
        .gr-toolbar{display:flex;align-items:center;gap:8px;padding-bottom:12px;flex-wrap:wrap;}
        .gr-search-wrap{position:relative;flex:1;min-width:160px;}
        .gr-search-wrap .mi{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:15px;color:rgba(255,255,255,.28);pointer-events:none;}
        .gr-search{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:9px;color:#fff;font-family:'Inter',sans-serif;font-size:13px;padding:8px 12px 8px 34px;outline:none;transition:border-color .2s;}
        .gr-search:focus{border-color:rgba(193,39,45,.4);}
        .gr-search::placeholder{color:rgba(255,255,255,.22);}

        /* ── CONTENT ── */
        .gr-content{flex:1;overflow-y:auto;padding:16px 20px;}

        /* ── CARDS GRID ── */
        .gr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;}

        .gr-card{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:14px;overflow:hidden;cursor:pointer;transition:border-color .18s,background .18s;}
        .gr-card:hover{background:rgba(255,255,255,.04);border-color:rgba(193,39,45,.25);}
        .gr-card-head{padding:13px 15px 11px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.05);}
        .gr-card-title{font-family:'Syne',sans-serif;font-weight:800;font-size:14px;color:#fff;display:flex;align-items:center;gap:7px;min-width:0;}
        .gr-card-actions{display:flex;gap:6px;flex-shrink:0;}

        /* mini standings */
        .st-head{display:grid;grid-template-columns:1fr 26px 26px 26px 26px 26px 34px;gap:3px;padding:6px 13px;font-family:'Syne',sans-serif;font-size:9px;font-weight:700;color:rgba(255,255,255,.28);text-transform:uppercase;letter-spacing:.07em;}
        .st-row{display:grid;grid-template-columns:1fr 26px 26px 26px 26px 26px 34px;gap:3px;padding:7px 13px;border-top:1px solid rgba(255,255,255,.04);align-items:center;}
        .st-row:hover{background:rgba(255,255,255,.025);}
        .st-cell{font-family:'Syne',sans-serif;font-weight:700;font-size:11px;color:rgba(255,255,255,.6);text-align:center;}
        .st-pts{font-family:'Syne',sans-serif;font-weight:900;font-size:13px;color:#C1272D;text-align:center;}
        .st-team{display:flex;align-items:center;gap:6px;min-width:0;}
        .st-logo{width:20px;height:20px;border-radius:5px;object-fit:cover;flex-shrink:0;}
        .st-logo-ph{width:20px;height:20px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:7px;color:#fff;flex-shrink:0;}

        /* detail standings */
        .det-head{display:grid;grid-template-columns:28px 1fr 36px 36px 36px 36px 50px 50px 50px;gap:4px;padding:8px 16px;font-family:'Syne',sans-serif;font-size:9px;font-weight:700;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid rgba(255,255,255,.05);}
        .det-row{display:grid;grid-template-columns:28px 1fr 36px 36px 36px 36px 50px 50px 50px;gap:4px;padding:10px 16px;border-top:1px solid rgba(255,255,255,.04);align-items:center;}

        /* GT form grid */
        .gt-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 12px;}

        .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border:1px solid;font-family:'Syne',sans-serif;}

        .settings-btn{width:28px;height:28px;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;color:rgba(255,255,255,.4);}
        .settings-btn:hover{border-color:#C1272D;color:#C1272D;background:rgba(193,39,45,.1);}
        .edit-btn{width:28px;height:28px;border-radius:7px;border:1px solid rgba(96,165,250,.2);background:rgba(96,165,250,.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;color:rgba(96,165,250,.5);}
        .edit-btn:hover{border-color:#60a5fa;color:#60a5fa;background:rgba(96,165,250,.15);}
        .delete-btn{width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,.2);background:rgba(239,68,68,.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;color:rgba(239,68,68,.5);}
        .delete-btn:hover{border-color:#ef4444;color:#ef4444;background:rgba(239,68,68,.15);}

        .empty{display:flex;flex-direction:column;align-items:center;padding:60px 0;gap:12px;}
        .empty .material-icons{font-size:44px;color:rgba(255,255,255,.08);}
        .empty span:last-child{font-family:'Syne',sans-serif;color:rgba(255,255,255,.22);font-size:13px;}

        /* overlays */
        .gr-overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}

        .gr-modal{background:linear-gradient(160deg,#170818 0%,#0c030f 100%);border:1px solid rgba(255,255,255,.1);border-radius:20px;width:100%;max-width:660px;max-height:90vh;overflow-y:auto;animation:scaleIn .22s ease both;}
        .gr-modal::-webkit-scrollbar{width:4px;}
        .gr-modal::-webkit-scrollbar-thumb{background:rgba(193,39,45,.3);border-radius:2px;}
        .gr-modal-head{padding:20px 22px 14px;position:sticky;top:0;z-index:10;background:linear-gradient(160deg,#170818,#0c030f);border-bottom:1px solid rgba(255,255,255,.06);}
        .gr-modal-body{padding:18px 22px 24px;}

        .sm-modal{background:linear-gradient(160deg,#170818 0%,#0c030f 100%);border:1px solid rgba(255,255,255,.1);border-radius:20px;width:100%;max-width:520px;animation:slideUp .25s ease both;padding:26px;max-height:90vh;overflow-y:auto;}
        .sm-modal::-webkit-scrollbar{width:4px;}
        .sm-modal::-webkit-scrollbar-thumb{background:rgba(193,39,45,.3);border-radius:2px;}

        .db-field{margin-bottom:13px;}
        .db-field label{display:block;font-size:10px;font-weight:700;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;font-family:'Syne',sans-serif;}
        .db-field input,.db-field select{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:9px;color:#fff;font-family:'Inter',sans-serif;font-size:13px;padding:10px 13px;outline:none;transition:border-color .18s;appearance:none;-webkit-appearance:none;}
        .db-field input:focus,.db-field select:focus{border-color:rgba(193,39,45,.5);}
        .db-field input::placeholder{color:rgba(255,255,255,.22);}
        .db-field select option{background:#1c0a1e;color:#fff;}

        .btn-p{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:#C1272D;color:#fff;border:none;border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s;}
        .btn-p:hover{background:#a01f24;transform:translateY(-1px);}
        .btn-p:disabled{opacity:.5;cursor:not-allowed;transform:none;}
        .btn-s{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.1);border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s;}
        .btn-s:hover{background:rgba(255,255,255,.1);}
        .btn-blue{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:rgba(96,165,250,.1);color:#60a5fa;border:1px solid rgba(96,165,250,.22);border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s;}
        .btn-blue:hover{background:rgba(96,165,250,.2);}
        .btn-blue:disabled{opacity:.5;cursor:not-allowed;}
        .btn-g{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:rgba(74,222,128,.1);color:#4ade80;border:1px solid rgba(74,222,128,.22);border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s;}
        .btn-g:hover{background:rgba(74,222,128,.2);}
        .btn-danger{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:rgba(239,68,68,.15);color:#ef4444;border:1px solid rgba(239,68,68,.3);border-radius:10px;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s;}
        .btn-danger:hover{background:rgba(239,68,68,.28);}
        .btn-danger:disabled{opacity:.5;cursor:not-allowed;}
        .ibtn{width:28px;height:28px;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;color:rgba(255,255,255,.4);}
        .ibtn:hover{border-color:#C1272D;color:#C1272D;background:rgba(193,39,45,.1);}
        .ibtn.del:hover{border-color:#ef4444;color:#ef4444;background:rgba(239,68,68,.1);}
        .section-header{font-family:'Syne',sans-serif;font-weight:800;font-size:13px;color:#fff;margin-bottom:10px;padding:8px 12px;background:rgba(255,255,255,.04);border-radius:8px;border-left:3px solid #C1272D;display:flex;align-items:center;justify-content:space-between;}
        .list-item{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.04);}
        .list-item:last-child{border-bottom:none;}

        /* ════════ RESPONSIVE ════════ */
        @media(max-width:768px){
          body { overflow: hidden }

          .gr-header { padding: 14px 16px 0 }
          .gr-title-row { margin-bottom: 10px }
          .gr-title-actions { width: 100% }
          .gr-title-actions .btn-p,
          .gr-title-actions .btn-s { flex: 1; justify-content: center; padding: 8px 10px; font-size: 11px }

          .gr-content { padding: 12px 16px 80px }

          /* 1-col grid on mobile */
          .gr-grid { grid-template-columns: 1fr }

          /* mini standings: collapse some cols */
          .st-head { grid-template-columns: 1fr 24px 24px 24px 32px !important }
          .st-row  { grid-template-columns: 1fr 24px 24px 24px 32px !important }
          .st-hide  { display: none }

          /* bottom sheet modals */
          .gr-overlay { padding: 0; align-items: flex-end }
          .gr-modal {
            max-width: 100%; max-height: 92vh;
            border-radius: 20px 20px 0 0;
            animation: slideUpFull .3s ease both;
          }
          .gr-modal-head { padding: 16px 16px 14px }
          .gr-modal-body { padding: 14px 16px 24px }

          .sm-modal {
            max-width: 100%; max-height: 92vh;
            border-radius: 20px 20px 0 0;
            padding: 20px 16px;
            animation: slideUpFull .3s ease both;
          }

          /* GT form: 1 col */
          .gt-grid { grid-template-columns: 1fr !important }

          /* detail standings: simplified */
          .det-head { grid-template-columns: 24px 1fr 30px 30px 30px 40px !important }
          .det-row  { grid-template-columns: 24px 1fr 30px 30px 30px 40px !important }
          .det-hide { display: none }

          /* toast above bottom nav */
          .gr-toast { bottom: 74px !important }
        }
      `}</style>

      <div className="main-wrap">

        {/* ═══ HEADER ═══ */}
        <div className="gr-header">
          <div className="gr-title-row">
            <div className="gr-title-left">
              <div style={{width:36,height:36,borderRadius:10,background:"rgba(193,39,45,.15)",border:"1px solid rgba(193,39,45,.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span className="material-icons" style={{fontSize:18,color:"#C1272D"}}>table_chart</span>
              </div>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#fff"}}>Gestion des Groupes</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:1}}>{groups.length} groupes chargés</div>
              </div>
            </div>
            <div className="gr-title-actions">
              <button className="btn-p" style={{padding:"7px 14px",fontSize:11}} onClick={()=>{setShowAdd(true);setAddName("");setAddRows([]);setShowAddGT(false);}}>
                <span className="material-icons" style={{fontSize:14}}>add</span>Ajouter
              </button>
              <button className="btn-s" style={{padding:"7px 14px",fontSize:11}} onClick={loadGroups}>
                <span className="material-icons" style={{fontSize:14}}>refresh</span>Actualiser
              </button>
            </div>
          </div>

          <div className="gr-stats">
            {[
              {label:`${groups.length} Groupes`,     dot:"rgba(255,255,255,.4)"},
              {label:`${totalTeams} Équipes inscrites`,dot:"#4ade80"},
            ].map(({label,dot})=>(
              <div key={label} className="gr-stat">
                <div className="gr-stat-dot" style={{background:dot}}/>
                <span style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:"rgba(255,255,255,.6)"}}>{label}</span>
              </div>
            ))}
          </div>

          <div className="gr-toolbar">
            <div className="gr-search-wrap">
              <span className="material-icons mi">search</span>
              <input className="gr-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher groupe, équipe, pays…"/>
            </div>
          </div>
        </div>

        {/* ═══ CARDS ═══ */}
        <div className="gr-content">
          {loading ? (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,gap:14}}>
              <div className="gr-spin" style={{width:34,height:34,border:"3px solid #C1272D",borderTopColor:"transparent",borderRadius:"50%"}}/>
              <span style={{fontFamily:"'Syne',sans-serif",color:"rgba(255,255,255,.4)",fontSize:14}}>Chargement des groupes…</span>
            </div>
          ) : filteredGroups.length===0 ? (
            <div className="empty"><span className="material-icons">table_chart</span><span>Aucun groupe trouvé</span></div>
          ) : (
            <div className="gr-grid">
              {filteredGroups.map((group,i)=>{
                const sorted = [...(group.groupTeams||[])].sort((a,b)=>pts(b)-pts(a)||gd(b)-gd(a));
                return (
                  <div key={group.id||i} className="gr-card gr-up" style={{animationDelay:`${i*.04}s`}} onClick={()=>openGroup(group)}>

                    <div className="gr-card-head">
                      <div className="gr-card-title">
                        <div style={{width:26,height:26,borderRadius:7,background:"rgba(193,39,45,.15)",border:"1px solid rgba(193,39,45,.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <span className="material-icons" style={{fontSize:14,color:"#C1272D"}}>table_chart</span>
                        </div>
                        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Groupe {group.name}</span>
                        <span className="badge" style={{background:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.5)",borderColor:"rgba(255,255,255,.1)",flexShrink:0}}>
                          {sorted.length} éq.
                        </span>
                      </div>
                      <div className="gr-card-actions" onClick={e=>e.stopPropagation()}>
                        <div className="edit-btn" title="Modifier" onClick={e=>openUpdate(e,group)}>
                          <span className="material-icons" style={{fontSize:14}}>edit</span>
                        </div>
                        <div className="delete-btn" title="Supprimer" onClick={()=>setDeleteTarget(group)}>
                          <span className="material-icons" style={{fontSize:14}}>delete</span>
                        </div>
                      </div>
                    </div>

                    {sorted.length===0 ? (
                      <div style={{padding:"16px",textAlign:"center",fontSize:12,color:"rgba(255,255,255,.25)",fontFamily:"'Syne',sans-serif"}}>Aucune équipe</div>
                    ) : (
                      <>
                        {/* mini table — responsive via CSS */}
                        <div className="st-head">
                          <div>Équipe</div>
                          <div style={{textAlign:"center"}} className="st-hide">J</div>
                          <div style={{textAlign:"center"}}>V</div>
                          <div style={{textAlign:"center"}}>N</div>
                          <div style={{textAlign:"center"}}>D</div>
                          <div style={{textAlign:"center"}} className="st-hide">DB</div>
                          <div style={{textAlign:"center"}}>Pts</div>
                        </div>
                        {sorted.map((gt,ri)=>{
                          const played=(gt.wins||0)+(gt.draws||0)+(gt.loses||0);
                          const diff=gd(gt);
                          return (
                            <div key={gt.id||ri} className="st-row">
                              <div className="st-team">
                                {ri<2&&<div style={{width:3,height:18,borderRadius:2,background:ri===0?"#C1272D":"#006233",flexShrink:0}}/>}
                                {gt.teamImageUrl
                                  ?<img src={gt.teamImageUrl} alt={gt.teamName} className="st-logo"/>
                                  :<div className="st-logo-ph" style={{background:hue(gt.teamName)}}>{initials(gt.teamName)}</div>}
                                <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                  {gt.teamName||"—"}
                                </span>
                              </div>
                              <div className="st-cell st-hide">{played}</div>
                              <div className="st-cell">{gt.wins||0}</div>
                              <div className="st-cell">{gt.draws||0}</div>
                              <div className="st-cell">{gt.loses||0}</div>
                              <div className="st-cell st-hide" style={{color:diff>0?"#4ade80":diff<0?"#f87171":"rgba(255,255,255,.6)"}}>
                                {diff>0?`+${diff}`:diff}
                              </div>
                              <div className="st-pts">{pts(gt)}</div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══ MODAL: ADD ═══ */}
      {showAdd && (
        <div className="gr-overlay" onClick={e=>{if(e.target===e.currentTarget)setShowAdd(false);}}>
          <div className="sm-modal">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:"#fff"}}>Ajouter un groupe</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>Créez un groupe et ajoutez des équipes</div>
              </div>
              <button className="ibtn" onClick={()=>setShowAdd(false)}><span className="material-icons" style={{fontSize:17}}>close</span></button>
            </div>

            <div className="db-field">
              <label>Nom du groupe *</label>
              <input type="text" value={addName} onChange={e=>setAddName(e.target.value)} placeholder="Ex: A, B, C…"/>
            </div>

            <div style={{marginBottom:16}}>
              <div className="section-header">
                <span>Équipes ({addRows.length})</span>
                <button className="btn-g" style={{padding:"4px 10px",fontSize:11}} onClick={()=>setShowAddGT(p=>!p)}>
                  <span className="material-icons" style={{fontSize:13}}>{showAddGT?"close":"add"}</span>
                  {showAddGT?"Annuler":"Ajouter"}
                </button>
              </div>
              {showAddGT && <GTRowForm form={addGTForm} setForm={setAddGTForm} onConfirm={pushAddRow} usedTeamIDs={addRows.map(r=>String(r.teamID))} btnLabel="Ajouter l'équipe"/>}
              {addRows.map((r,i)=>(
                <div key={i} className="list-item">
                  <div style={{width:28,height:28,borderRadius:6,overflow:"hidden",flexShrink:0}}>
                    {teamImg(r.teamID)
                      ?<img src={teamImg(r.teamID)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      :<div style={{width:"100%",height:"100%",background:hue(teamName(r.teamID)),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:9,color:"#fff"}}>{initials(teamName(r.teamID))}</div>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"#fff"}}>{teamName(r.teamID)}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{r.wins||0}V · {r.draws||0}N · {r.loses||0}D · {r.goalsScored||0}:{r.goalsConceded||0}</div>
                  </div>
                  <span style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:13,color:"#C1272D",marginRight:8}}>{(parseInt(r.wins)||0)*3+(parseInt(r.draws)||0)} pts</span>
                  <button className="ibtn del" onClick={()=>removeAddRow(i)}><span className="material-icons" style={{fontSize:13}}>delete</span></button>
                </div>
              ))}
            </div>

            <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:6}}>
              <button className="btn-s" onClick={()=>setShowAdd(false)}>Annuler</button>
              <button className="btn-p" onClick={submitAdd} disabled={savingAdd}>
                {savingAdd
                  ?<><div className="gr-spin" style={{width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%"}}/>Enregistrement…</>
                  :<><span className="material-icons" style={{fontSize:14}}>add</span>Créer le groupe</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: UPDATE ═══ */}
      {updateTarget && (
        <div className="gr-overlay" onClick={e=>{if(e.target===e.currentTarget)setUpdateTarget(null);}}>
          <div className="sm-modal">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:"#fff"}}>Modifier le groupe</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>Groupe {updateTarget.name} · #{updateTarget.id}</div>
              </div>
              <button className="ibtn" onClick={()=>setUpdateTarget(null)}><span className="material-icons" style={{fontSize:17}}>close</span></button>
            </div>

            <div className="db-field">
              <label>Nom du groupe *</label>
              <input type="text" value={updName} onChange={e=>setUpdName(e.target.value)} placeholder="Ex: A, B, C…"/>
            </div>

            <div style={{marginBottom:16}}>
              <div className="section-header">
                <span>Équipes ({updRows.length})</span>
                <button className="btn-g" style={{padding:"4px 10px",fontSize:11}} onClick={()=>setShowUpdGT(p=>!p)}>
                  <span className="material-icons" style={{fontSize:13}}>{showUpdGT?"close":"add"}</span>
                  {showUpdGT?"Annuler":"Ajouter"}
                </button>
              </div>
              {showUpdGT && <GTRowForm form={updGTForm} setForm={setUpdGTForm} onConfirm={pushUpdRow} usedTeamIDs={updRows.map(r=>String(r.teamID))} btnLabel="Ajouter l'équipe"/>}
              {updRows.map((r,i)=>(
                <div key={i} className="list-item">
                  <div style={{width:28,height:28,borderRadius:6,overflow:"hidden",flexShrink:0}}>
                    {(r._teamImageUrl||teamImg(r.teamID))
                      ?<img src={r._teamImageUrl||teamImg(r.teamID)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      :<div style={{width:"100%",height:"100%",background:hue(r._teamName||teamName(r.teamID)),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:9,color:"#fff"}}>{initials(r._teamName||teamName(r.teamID))}</div>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"#fff"}}>{r._teamName||teamName(r.teamID)}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{r.wins||0}V · {r.draws||0}N · {r.loses||0}D · {r.goalsScored||0}:{r.goalsConceded||0}</div>
                  </div>
                  <span style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:13,color:"#C1272D",marginRight:8}}>{(parseInt(r.wins)||0)*3+(parseInt(r.draws)||0)} pts</span>
                  <button className="ibtn del" onClick={()=>removeUpdRow(i)}><span className="material-icons" style={{fontSize:13}}>delete</span></button>
                </div>
              ))}
            </div>

            <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:6}}>
              <button className="btn-s" onClick={()=>setUpdateTarget(null)}>Annuler</button>
              <button className="btn-blue" onClick={submitUpdate} disabled={savingUpd}>
                {savingUpd
                  ?<><div className="gr-spin" style={{width:13,height:13,border:"2px solid rgba(96,165,250,.4)",borderTopColor:"#60a5fa",borderRadius:"50%"}}/>Mise à jour…</>
                  :<><span className="material-icons" style={{fontSize:14}}>save</span>Enregistrer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: DELETE ═══ */}
      {deleteTarget && (
        <div className="gr-overlay" onClick={e=>{if(e.target===e.currentTarget)setDeleteTarget(null);}}>
          <div className="sm-modal" style={{maxWidth:400}}>
            <div style={{width:52,height:52,borderRadius:14,background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.25)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
              <span className="material-icons" style={{fontSize:26,color:"#ef4444"}}>delete_forever</span>
            </div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#fff",marginBottom:8}}>Supprimer ce groupe ?</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.4)",marginBottom:6,lineHeight:1.6}}>
              Toutes les statistiques des équipes dans ce groupe seront également supprimées.
            </div>
            <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:"12px 14px",marginBottom:22,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#ef4444",flexShrink:0}}/>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,color:"#fff"}}>Groupe {deleteTarget.name}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>{deleteTarget.groupTeams?.length||0} équipe(s) · #{deleteTarget.id}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button className="btn-s" onClick={()=>setDeleteTarget(null)}>Annuler</button>
              <button className="btn-danger" onClick={confirmDelete} disabled={deletingGrp}>
                {deletingGrp
                  ?<><div className="gr-spin" style={{width:13,height:13,border:"2px solid rgba(239,68,68,.4)",borderTopColor:"#ef4444",borderRadius:"50%"}}/>Suppression…</>
                  :<><span className="material-icons" style={{fontSize:14}}>delete</span>Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: DETAIL ═══ */}
      {(loadingDetail||selected) && (
        <div className="gr-overlay" onClick={e=>{if(e.target===e.currentTarget)setSelected(null);}}>
          <div className="gr-modal">
            <div className="gr-modal-head">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:11,minWidth:0}}>
                  <div style={{width:36,height:36,borderRadius:10,background:"rgba(193,39,45,.15)",border:"1px solid rgba(193,39,45,.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span className="material-icons" style={{fontSize:18,color:"#C1272D"}}>table_chart</span>
                  </div>
                  <div style={{minWidth:0}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {selected?`Groupe ${selected.name}`:"Chargement…"}
                    </div>
                    {selected&&<div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:3}}>{selected.groupTeams?.length||0} équipe(s) · #{selected.id}</div>}
                  </div>
                </div>
                <button className="ibtn" style={{flexShrink:0,marginLeft:8}} onClick={()=>setSelected(null)}>
                  <span className="material-icons" style={{fontSize:17}}>close</span>
                </button>
              </div>
            </div>

            <div className="gr-modal-body">
              {loadingDetail&&!selected&&(
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"20px 0",color:"rgba(255,255,255,.35)",fontSize:13}}>
                  <div className="gr-spin" style={{width:16,height:16,border:"2px solid #C1272D",borderTopColor:"transparent",borderRadius:"50%"}}/>
                  Chargement du classement…
                </div>
              )}

              {selected&&(()=>{
                const sorted=[...(selected.groupTeams||[])].sort((a,b)=>pts(b)-pts(a)||gd(b)-gd(a));
                return sorted.length===0?(
                  <div className="empty"><span className="material-icons">people</span><span>Aucune équipe dans ce groupe</span></div>
                ):(
                  <>
                    {/* scrollable wrapper for detail table */}
                    <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:18}}>
                      <div style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,overflow:"hidden",minWidth:400}}>
                        {/* header */}
                        <div className="det-head">
                          <div>#</div>
                          <div>Équipe</div>
                          <div style={{textAlign:"center"}}>J</div>
                          <div style={{textAlign:"center"}}>V</div>
                          <div style={{textAlign:"center"}}>N</div>
                          <div style={{textAlign:"center"}}>D</div>
                          <div style={{textAlign:"center"}} className="det-hide">B+</div>
                          <div style={{textAlign:"center"}} className="det-hide">DB</div>
                          <div style={{textAlign:"center"}}>Pts</div>
                        </div>
                        {sorted.map((gt,ri)=>{
                          const played=(gt.wins||0)+(gt.draws||0)+(gt.loses||0);
                          const diff=gd(gt);
                          const isTop2=ri<2;
                          return (
                            <div key={gt.id||ri} className="det-row" style={{background:isTop2?"rgba(193,39,45,.04)":"transparent"}}>
                              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:12,color:isTop2?"#C1272D":"rgba(255,255,255,.3)"}}>{ri+1}</div>
                              <div style={{display:"flex",alignItems:"center",gap:7,minWidth:0}}>
                                {isTop2&&<div style={{width:3,height:20,borderRadius:2,background:ri===0?"#C1272D":"#006233",flexShrink:0}}/>}
                                {gt.teamImageUrl
                                  ?<img src={gt.teamImageUrl} alt={gt.teamName} style={{width:24,height:24,borderRadius:6,objectFit:"cover",flexShrink:0}}/>
                                  :<div style={{width:24,height:24,borderRadius:6,background:hue(gt.teamName),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:8,color:"#fff",flexShrink:0}}>{initials(gt.teamName)}</div>}
                                <div style={{minWidth:0}}>
                                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{gt.teamName||"—"}</div>
                                  {gt.teamCountry&&<div style={{fontSize:10,color:"rgba(255,255,255,.35)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{gt.teamCountry}</div>}
                                </div>
                              </div>
                              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,color:"rgba(255,255,255,.55)",textAlign:"center"}}>{played}</div>
                              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,color:"rgba(255,255,255,.55)",textAlign:"center"}}>{gt.wins||0}</div>
                              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,color:"rgba(255,255,255,.55)",textAlign:"center"}}>{gt.draws||0}</div>
                              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,color:"rgba(255,255,255,.55)",textAlign:"center"}}>{gt.loses||0}</div>
                              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,color:"rgba(255,255,255,.55)",textAlign:"center"}} className="det-hide">{gt.goalsScored||0}:{gt.goalsConceded||0}</div>
                              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,color:diff>0?"#4ade80":diff<0?"#f87171":"rgba(255,255,255,.55)",textAlign:"center"}} className="det-hide">{diff>0?`+${diff}`:diff}</div>
                              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:15,color:"#C1272D",textAlign:"center"}}>{pts(gt)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* legend */}
                    <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                      {[
                        {color:"#C1272D",label:"1er — Qualifié directement"},
                        {color:"#006233",label:"2ème — Qualifié"},
                      ].map(({color,label})=>(
                        <div key={label} style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{width:3,height:14,borderRadius:2,background:color}}/>
                          <span style={{fontSize:11,color:"rgba(255,255,255,.4)",fontFamily:"'Syne',sans-serif"}}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TOAST ═══ */}
      {toast && (
        <div className="gr-toast" style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:toast.type==="success"?"rgba(22,163,74,.95)":"rgba(193,39,45,.95)",color:"#fff",padding:"11px 20px",borderRadius:10,fontSize:13,fontFamily:"'Syne',sans-serif",fontWeight:700,display:"flex",alignItems:"center",gap:9,zIndex:400,boxShadow:"0 8px 28px rgba(0,0,0,.5)",whiteSpace:"nowrap"}}>
          <span className="material-icons" style={{fontSize:17}}>{toast.type==="success"?"check_circle":"cancel"}</span>
          {toast.msg}
        </div>
      )}
    </>
  );
}
