"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const BASE = "http://localhost:7860/api/teams";

const sf = async (url, opts) => {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(r.status);
  const t = await r.text();
  try { return JSON.parse(t); } catch { return t; }
};

const initials = n =>
  n ? n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";

const hue = n => {
  const c = ["#C1272D", "#006233", "#b45309", "#0369a1", "#7c3aed", "#0f766e"];
  let h = 0;
  for (const x of (n || "")) h = (h * 31 + x.charCodeAt(0)) % c.length;
  return c[h];
};

const EMPTY_ADD = {
  country: "", name: "", imageUrl: "", coach: "",
  participation: "", description: "",
  players: [], cultures: [],
};
const EMPTY_UPDATE = {
  country: "", name: "", imageUrl: "",
  coach: "", participation: "", description: "",
};
const EMPTY_PLAYER = { imgUrl: "", name: "", height: "", weight: "", goals: "", age: "" };
const EMPTY_CULTURE = { title: "", description: "", imageUrl: "" };

export default function TeamsRespo() {
  const router = useRouter();

  const [teams,         setTeams]         = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [toast,         setToast]         = useState(null);

  const [showAdd,   setShowAdd]   = useState(false);
  const [addForm,   setAddForm]   = useState(EMPTY_ADD);
  const [savingAdd, setSavingAdd] = useState(false);

  const [addPlayerForm,  setAddPlayerForm]  = useState(EMPTY_PLAYER);
  const [addCultureForm, setAddCultureForm] = useState(EMPTY_CULTURE);
  const [showAddPlayer,  setShowAddPlayer]  = useState(false);
  const [showAddCulture, setShowAddCulture] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(false);

  const [updateTarget, setUpdateTarget] = useState(null);
  const [updateForm,   setUpdateForm]   = useState(EMPTY_UPDATE);
  const [savingUpdate, setSavingUpdate] = useState(false);

  const [selected,      setSelected]      = useState(null);
  const [detail,        setDetail]        = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [modalTab,      setModalTab]      = useState("info");

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadTeams = () => {
    setLoading(true);
    fetch(`${BASE}/getAll`)
      .then(r => r.json())
      .then(d => { setTeams(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadTeams(); }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("userType");
    if (!t) router.push("/Login");
    else if (t === "SUPPORTER") router.push("/Acceuil");
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFilteredTeams(teams); return; }
    const q = search.toLowerCase();
    setFilteredTeams(
      teams.filter(t =>
        t.name?.toLowerCase().includes(q) ||
        t.country?.toLowerCase().includes(q) ||
        t.coach?.toLowerCase().includes(q)
      )
    );
  }, [search, teams]);

  const pushPlayer = () => {
    if (!addPlayerForm.name) { showToast("error", "Nom du joueur requis."); return; }
    setAddForm(f => ({ ...f, players: [...f.players, { ...addPlayerForm }] }));
    setAddPlayerForm(EMPTY_PLAYER);
    setShowAddPlayer(false);
  };

  const pushCulture = () => {
    if (!addCultureForm.title) { showToast("error", "Titre de la culture requis."); return; }
    setAddForm(f => ({ ...f, cultures: [...f.cultures, { ...addCultureForm }] }));
    setAddCultureForm(EMPTY_CULTURE);
    setShowAddCulture(false);
  };

  const removeAddPlayer  = i => setAddForm(f => ({ ...f, players:  f.players.filter((_,idx)=>idx!==i) }));
  const removeAddCulture = i => setAddForm(f => ({ ...f, cultures: f.cultures.filter((_,idx)=>idx!==i) }));

  const submitAdd = async () => {
    if (!addForm.name || !addForm.country) { showToast("error", "Nom et pays sont requis."); return; }
    setSavingAdd(true);
    try {
      const body = {
        country: addForm.country, name: addForm.name,
        imageUrl: addForm.imageUrl || null, coach: addForm.coach || null,
        participation: addForm.participation ? parseInt(addForm.participation) : 0,
        description: addForm.description || null,
        players: addForm.players.map(p => ({
          imgUrl: p.imgUrl || null, name: p.name,
          height: p.height ? parseFloat(p.height) : 0,
          weight: p.weight ? parseFloat(p.weight) : 0,
          goals:  p.goals  ? parseInt(p.goals)    : 0,
          age:    p.age    ? parseInt(p.age)       : 0,
        })),
        cultures: addForm.cultures.map(c => ({
          title: c.title, description: c.description || null, imageUrl: c.imageUrl || null,
        })),
      };
      const res = await fetch(`${BASE}/add`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        showToast("success", "Équipe ajoutée !");
        setShowAdd(false); setAddForm(EMPTY_ADD); loadTeams();
      } else showToast("error", "Échec ajout équipe.");
    } catch { showToast("error", "Erreur réseau."); }
    setSavingAdd(false);
  };

  const openUpdate = (e, team) => {
    e.stopPropagation();
    setUpdateTarget(team);
    setUpdateForm({
      country: team.country || "", name: team.name || "",
      imageUrl: team.imageUrl || "", coach: team.coach || "",
      participation: team.participation ?? "", description: team.description || "",
    });
  };

  const submitUpdate = async () => {
    if (!updateForm.name || !updateForm.country) { showToast("error", "Nom et pays sont requis."); return; }
    setSavingUpdate(true);
    try {
      const body = {
        country: updateForm.country, name: updateForm.name,
        imageUrl: updateForm.imageUrl || null, coach: updateForm.coach || null,
        participation: updateForm.participation ? parseInt(updateForm.participation) : 0,
        description: updateForm.description || null,
      };
      const res = await fetch(`${BASE}/update/${updateTarget.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        showToast("success", "Équipe mise à jour !"); setUpdateTarget(null); loadTeams();
      } else showToast("error", "Échec modification.");
    } catch { showToast("error", "Erreur réseau."); }
    setSavingUpdate(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingTeam(true);
    try {
      const res = await fetch(`${BASE}/delete/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("success", "Équipe supprimée !");
        setTeams(p => p.filter(t => t.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else showToast("error", "Échec suppression.");
    } catch { showToast("error", "Erreur réseau."); }
    setDeletingTeam(false);
  };

  const openTeam = async team => {
    setSelected(team); setModalTab("info"); setDetail(null); setLoadingDetail(true);
    try { const d = await sf(`${BASE}/getOne/${team.id}`); setDetail(d); }
    catch { showToast("error", "Impossible de charger les détails."); }
    setLoadingDetail(false);
  };

  return (
    <>
      <Head>
        <title>Équipes · MoroccoFan2030</title>
        <link rel="icon" href="/images/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&family=Amiri:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        *,*::before,*::after { box-sizing: border-box }
        html, body { margin: 0; padding: 0; height: 100% }
        body { font-family: 'Inter', sans-serif; background: #07030a; color: #fff; -webkit-font-smoothing: antialiased; overflow: hidden }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } }
        @keyframes spin    { to { transform:rotate(360deg) } }
        @keyframes scaleIn { from { opacity:0; transform:scale(.96) } to { opacity:1; transform:scale(1) } }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:none } }
        @keyframes slideUpFull { from { opacity:0; transform:translateY(100%) } to { opacity:1; transform:translateY(0) } }

        .tr-spin  { animation: spin 1s linear infinite }
        .tr-up    { animation: fadeUp .4s cubic-bezier(.22,.68,0,1.2) both }

        .main-wrap {
          width: 100%; height: 100vh; overflow: hidden;
          display: flex; flex-direction: column;
        }

        ::-webkit-scrollbar { width: 4px; height: 4px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: rgba(193,39,45,.3); border-radius: 2px }

        /* ── HEADER ── */
        .tr-header {
          padding: 16px 20px 0;
          background: #07030a;
          border-bottom: 1px solid rgba(255,255,255,.06);
          flex-shrink: 0;
        }
        .tr-title-row {
          display: flex; align-items: center;
          justify-content: space-between; gap: 12px;
          flex-wrap: wrap; margin-bottom: 14px;
        }
        .tr-title-left { display: flex; align-items: center; gap: 12px; min-width: 0 }
        .tr-title-actions { display: flex; gap: 8px; flex-shrink: 0 }
        .tr-stats { display: flex; gap: 14px; margin-bottom: 12px; flex-wrap: wrap }
        .tr-stat { display: flex; align-items: center; gap: 6px }
        .tr-stat-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0 }
        .tr-toolbar { display: flex; align-items: center; gap: 8px; padding-bottom: 12px; flex-wrap: wrap }
        .tr-search-wrap { position: relative; flex: 1; min-width: 160px }
        .tr-search-wrap .mi { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 15px; color: rgba(255,255,255,.28); pointer-events: none }
        .tr-search { width: 100%; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.09); border-radius: 9px; color: #fff; font-family: 'Inter', sans-serif; font-size: 13px; padding: 8px 12px 8px 34px; outline: none; transition: border-color .2s }
        .tr-search:focus { border-color: rgba(193,39,45,.4) }
        .tr-search::placeholder { color: rgba(255,255,255,.22) }

        /* ── CONTENT ── */
        .tr-content { flex: 1; overflow-y: auto; padding: 16px 20px }

        /* ── DESKTOP TABLE ── */
        .tr-table { width: 100%; background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.07); border-radius: 14px; overflow: hidden }
        .tr-thead { display: grid; grid-template-columns: 44px 1fr 130px 70px 130px 90px 80px; gap: 8px; padding: 10px 18px; border-bottom: 1px solid rgba(255,255,255,.06); font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; color: rgba(255,255,255,.28); text-transform: uppercase; letter-spacing: .08em }
        .tr-row { display: grid; grid-template-columns: 44px 1fr 130px 70px 130px 90px 80px; gap: 8px; padding: 13px 18px; border-bottom: 1px solid rgba(255,255,255,.04); align-items: center; cursor: pointer; transition: background .15s }
        .tr-row:hover { background: rgba(255,255,255,.03) }
        .tr-row:last-child { border-bottom: none }

        /* ── MOBILE CARDS ── */
        .team-cards { display: none; flex-direction: column; gap: 10px }
        .team-card {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px; padding: 14px;
          cursor: pointer; transition: all .18s;
          animation: fadeUp .35s ease both;
        }
        .team-card:hover { background: rgba(255,255,255,.05); border-color: rgba(193,39,45,.2) }
        .team-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 10px }
        .team-card-info { flex: 1; min-width: 0 }
        .team-card-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px }
        .team-card-actions { display: flex; gap: 8px }

        /* shared */
        .team-logo { width: 34px; height: 34px; border-radius: 8px; object-fit: cover; flex-shrink: 0 }
        .team-logo-placeholder { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 11px; color: #fff; flex-shrink: 0 }
        .team-name-cell { display: flex; flex-direction: column }

        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 99px; font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; border: 1px solid; font-family: 'Syne', sans-serif }

        .row-actions { display: flex; align-items: center; gap: 6px }
        .settings-btn { width: 28px; height: 28px; border-radius: 7px; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.04); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .18s; color: rgba(255,255,255,.4) }
        .settings-btn:hover { border-color: #C1272D; color: #C1272D; background: rgba(193,39,45,.1) }
        .edit-btn { width: 28px; height: 28px; border-radius: 7px; border: 1px solid rgba(96,165,250,.2); background: rgba(96,165,250,.06); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .18s; color: rgba(96,165,250,.5) }
        .edit-btn:hover { border-color: #60a5fa; color: #60a5fa; background: rgba(96,165,250,.15) }
        .delete-btn { width: 28px; height: 28px; border-radius: 7px; border: 1px solid rgba(239,68,68,.2); background: rgba(239,68,68,.06); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .18s; color: rgba(239,68,68,.5) }
        .delete-btn:hover { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,.15) }

        .empty { display: flex; flex-direction: column; align-items: center; padding: 60px 0; gap: 12px }
        .empty .material-icons { font-size: 44px; color: rgba(255,255,255,.08) }
        .empty span:last-child { font-family: 'Syne', sans-serif; color: rgba(255,255,255,.22); font-size: 13px }

        /* ── OVERLAYS ── */
        .tr-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.78); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px }

        /* detail modal */
        .tr-modal { background: linear-gradient(160deg,#170818 0%,#0c030f 100%); border: 1px solid rgba(255,255,255,.1); border-radius: 20px; width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto; animation: scaleIn .22s ease both }
        .tr-modal::-webkit-scrollbar { width: 4px }
        .tr-modal::-webkit-scrollbar-thumb { background: rgba(193,39,45,.3); border-radius: 2px }
        .tr-modal-head { padding: 22px 24px 0; position: sticky; top: 0; z-index: 10; background: linear-gradient(160deg,#170818,#0c030f); border-bottom: 1px solid rgba(255,255,255,.06) }
        .tr-modal-body { padding: 20px 24px 24px }

        .tr-tabs { display: flex; gap: 0; border-bottom: 1px solid rgba(255,255,255,.07); margin-bottom: 18px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none }
        .tr-tabs::-webkit-scrollbar { display: none }
        .tr-tab { padding: 10px 14px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 11px; color: rgba(255,255,255,.4); cursor: pointer; text-transform: uppercase; letter-spacing: .07em; border-bottom: 2px solid transparent; transition: all .18s; display: flex; align-items: center; gap: 5px; white-space: nowrap; flex-shrink: 0 }
        .tr-tab:hover { color: rgba(255,255,255,.7) }
        .tr-tab.active { color: #C1272D; border-bottom-color: #C1272D }
        .tr-tab .mi { font-size: 14px }

        /* small modals */
        .sm-modal { background: linear-gradient(160deg,#170818 0%,#0c030f 100%); border: 1px solid rgba(255,255,255,.1); border-radius: 20px; width: 100%; max-width: 560px; animation: slideUp .25s ease both; padding: 28px; max-height: 90vh; overflow-y: auto }
        .sm-modal::-webkit-scrollbar { width: 4px }
        .sm-modal::-webkit-scrollbar-thumb { background: rgba(193,39,45,.3); border-radius: 2px }

        /* form */
        .db-field { margin-bottom: 13px }
        .db-field label { display: block; font-size: 10px; font-weight: 700; color: rgba(255,255,255,.35); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 6px; font-family: 'Syne', sans-serif }
        .db-field input, .db-field select, .db-field textarea { width: 100%; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 9px; color: #fff; font-family: 'Inter', sans-serif; font-size: 13px; padding: 10px 13px; outline: none; transition: border-color .18s; appearance: none; -webkit-appearance: none; resize: vertical }
        .db-field input:focus, .db-field select:focus, .db-field textarea:focus { border-color: rgba(193,39,45,.5) }
        .db-field input::placeholder, .db-field textarea::placeholder { color: rgba(255,255,255,.22) }
        .db-field select option { background: #1c0a1e; color: #fff }

        /* buttons */
        .btn-p { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px; background: #C1272D; color: #fff; border: none; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; cursor: pointer; transition: all .18s }
        .btn-p:hover { background: #a01f24; transform: translateY(-1px) }
        .btn-p:disabled { opacity: .5; cursor: not-allowed; transform: none }
        .btn-s { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px; background: rgba(255,255,255,.06); color: rgba(255,255,255,.7); border: 1px solid rgba(255,255,255,.1); border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; cursor: pointer; transition: all .18s }
        .btn-s:hover { background: rgba(255,255,255,.1) }
        .btn-blue { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px; background: rgba(96,165,250,.1); color: #60a5fa; border: 1px solid rgba(96,165,250,.22); border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; cursor: pointer; transition: all .18s }
        .btn-blue:hover { background: rgba(96,165,250,.2) }
        .btn-blue:disabled { opacity: .5; cursor: not-allowed }
        .btn-g { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px; background: rgba(74,222,128,.1); color: #4ade80; border: 1px solid rgba(74,222,128,.22); border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; cursor: pointer; transition: all .18s }
        .btn-g:hover { background: rgba(74,222,128,.2) }
        .btn-danger { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px; background: rgba(239,68,68,.15); color: #ef4444; border: 1px solid rgba(239,68,68,.3); border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; cursor: pointer; transition: all .18s }
        .btn-danger:hover { background: rgba(239,68,68,.28) }
        .btn-danger:disabled { opacity: .5; cursor: not-allowed }
        .ibtn { width: 28px; height: 28px; border-radius: 7px; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.05); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .18s; color: rgba(255,255,255,.4) }
        .ibtn:hover { border-color: #C1272D; color: #C1272D; background: rgba(193,39,45,.1) }
        .ibtn.del:hover { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,.1) }

        .list-item { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,.04) }
        .list-item:last-child { border-bottom: none }
        .section-header { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 13px; color: #fff; margin-bottom: 10px; padding: 8px 12px; background: rgba(255,255,255,.04); border-radius: 8px; border-left: 3px solid #C1272D; display: flex; align-items: center; justify-content: space-between }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          body { overflow: hidden }

          .tr-header { padding: 14px 16px 0 }

          .tr-title-row { margin-bottom: 10px }
          .tr-title-actions { width: 100%; justify-content: stretch }
          .tr-title-actions .btn-p,
          .tr-title-actions .btn-s { flex: 1; justify-content: center; font-size: 11px; padding: 8px 10px }

          .tr-content { padding: 12px 16px 80px }

          /* hide desktop table, show cards */
          .tr-table { display: none }
          .team-cards { display: flex }

          /* full-screen modals on mobile */
          .tr-overlay { padding: 0; align-items: flex-end }

          .tr-modal {
            max-width: 100%; max-height: 92vh;
            border-radius: 20px 20px 0 0;
            animation: slideUpFull .3s ease both;
          }
          .tr-modal-head { padding: 16px 16px 0 }
          .tr-modal-body { padding: 16px 16px 24px }

          .sm-modal {
            max-width: 100%; max-height: 92vh;
            border-radius: 20px 20px 0 0;
            padding: 20px 16px;
            animation: slideUpFull .3s ease both;
          }

          .sm-form-grid { grid-template-columns: 1fr !important }

          .tr-tab { padding: 9px 11px; font-size: 10px }

          /* toast above bottom nav */
          .tr-toast { bottom: 74px !important }

          .tr-stat { gap: 5px }
        }

        @media (min-width: 769px) {
          .team-cards { display: none }
        }
      `}</style>

      <div className="main-wrap">

        {/* ═══ HEADER ═══ */}
        <div className="tr-header">
          <div className="tr-title-row">
            <div className="tr-title-left">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(193,39,45,.15)", border: "1px solid rgba(193,39,45,.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="material-icons" style={{ fontSize: 18, color: "#C1272D" }}>emoji_events</span>
              </div>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>Gestion des Équipes</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 1 }}>{teams.length} équipes chargées</div>
              </div>
            </div>
            <div className="tr-title-actions">
              <button className="btn-p" style={{ padding: "7px 14px", fontSize: 11 }} onClick={() => setShowAdd(true)}>
                <span className="material-icons" style={{ fontSize: 14 }}>add</span>Ajouter
              </button>
              <button className="btn-s" style={{ padding: "7px 14px", fontSize: 11 }} onClick={loadTeams}>
                <span className="material-icons" style={{ fontSize: 14 }}>refresh</span>Actualiser
              </button>
            </div>
          </div>

          <div className="tr-stats">
            {[
              { label: `${teams.length} Total`, dot: "rgba(255,255,255,.4)" },
              { label: `${teams.reduce((s,t)=>s+(t.newsCount||0),0)} Articles`, dot: "#60a5fa" },
              { label: `${teams.filter(t=>(t.participation||0)>0).length} Participants`, dot: "#4ade80" },
            ].map(({ label, dot }) => (
              <div key={label} className="tr-stat">
                <div className="tr-stat-dot" style={{ background: dot }} />
                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.6)" }}>{label}</span>
              </div>
            ))}
          </div>

          <div className="tr-toolbar">
            <div className="tr-search-wrap">
              <span className="material-icons mi">search</span>
              <input className="tr-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher équipe, pays, coach…" />
            </div>
          </div>
        </div>

        {/* ═══ CONTENT ═══ */}
        <div className="tr-content">
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 280, gap: 14 }}>
              <div className="tr-spin" style={{ width: 34, height: 34, border: "3px solid #C1272D", borderTopColor: "transparent", borderRadius: "50%" }} />
              <span style={{ fontFamily: "'Syne',sans-serif", color: "rgba(255,255,255,.4)", fontSize: 14 }}>Chargement des équipes…</span>
            </div>
          ) : (
            <>
              {/* ── DESKTOP TABLE ── */}
              <div className="tr-table">
                <div className="tr-thead">
                  <div></div><div>Équipe</div><div>Pays</div>
                  <div>Éditions</div><div>Coach</div>
                  <div style={{ textAlign: "center" }}>Actualités</div>
                  <div style={{ textAlign: "center" }}>Actions</div>
                </div>
                {filteredTeams.length === 0 && (
                  <div className="empty"><span className="material-icons">emoji_events</span><span>Aucune équipe trouvée</span></div>
                )}
                {filteredTeams.map((team, i) => (
                  <div key={team.id || i} className="tr-row tr-up" style={{ animationDelay: `${i * 0.03}s` }} onClick={() => openTeam(team)}>
                    <div>
                      {team.imageUrl
                        ? <img src={team.imageUrl} alt={team.name} className="team-logo" />
                        : <div className="team-logo-placeholder" style={{ background: hue(team.name) }}>{initials(team.name)}</div>}
                    </div>
                    <div className="team-name-cell">
                      <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>{team.name || "—"}</span>
                      {team.description && (
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{team.description}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", fontFamily: "'Syne',sans-serif", fontWeight: 600 }}>{team.country || "—"}</div>
                    <div><span className="badge" style={{ background: "rgba(74,222,128,.08)", color: "#4ade80", borderColor: "rgba(74,222,128,.2)" }}>{team.participation ?? 0}×</span></div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{team.coach || "—"}</div>
                    <div style={{ textAlign: "center" }}>
                      <span className="badge" style={{ background: "rgba(96,165,250,.08)", color: "#60a5fa", borderColor: "rgba(96,165,250,.2)" }}>
                        <span className="material-icons" style={{ fontSize: 10 }}>article</span>{team.newsCount ?? 0}
                      </span>
                    </div>
                    <div className="row-actions" style={{ justifyContent: "center" }} onClick={e => e.stopPropagation()}>
                      <div className="settings-btn" title="Détails" onClick={() => openTeam(team)}><span className="material-icons" style={{ fontSize: 14 }}>visibility</span></div>
                      <div className="edit-btn" title="Modifier" onClick={e => openUpdate(e, team)}><span className="material-icons" style={{ fontSize: 14 }}>edit</span></div>
                      <div className="delete-btn" title="Supprimer" onClick={() => setDeleteTarget(team)}><span className="material-icons" style={{ fontSize: 14 }}>delete</span></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── MOBILE CARDS ── */}
              <div className="team-cards">
                {filteredTeams.length === 0 && (
                  <div className="empty"><span className="material-icons">emoji_events</span><span>Aucune équipe trouvée</span></div>
                )}
                {filteredTeams.map((team, i) => (
                  <div key={team.id || i} className="team-card" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => openTeam(team)}>
                    <div className="team-card-top">
                      {team.imageUrl
                        ? <img src={team.imageUrl} alt={team.name} style={{ width: 42, height: 42, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                        : <div style={{ width: 42, height: 42, borderRadius: 10, background: hue(team.name), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color: "#fff", flexShrink: 0 }}>{initials(team.name)}</div>}
                      <div className="team-card-info">
                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: "#fff", marginBottom: 2 }}>{team.name || "—"}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{team.country || "—"}{team.coach ? ` · ${team.coach}` : ""}</div>
                      </div>
                    </div>
                    <div className="team-card-meta">
                      <span className="badge" style={{ background: "rgba(74,222,128,.08)", color: "#4ade80", borderColor: "rgba(74,222,128,.2)" }}>{team.participation ?? 0} éditions</span>
                      <span className="badge" style={{ background: "rgba(96,165,250,.08)", color: "#60a5fa", borderColor: "rgba(96,165,250,.2)" }}>
                        <span className="material-icons" style={{ fontSize: 10 }}>article</span>{team.newsCount ?? 0} actus
                      </span>
                    </div>
                    {team.description && (
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginBottom: 10, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {team.description}
                      </div>
                    )}
                    <div className="team-card-actions" onClick={e => e.stopPropagation()}>
                      <div className="settings-btn" style={{ flex: 1, width: "auto", borderRadius: 9, gap: 6, padding: "0 10px", fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700 }} onClick={() => openTeam(team)}>
                        <span className="material-icons" style={{ fontSize: 14 }}>visibility</span>
                        <span style={{ fontSize: 11 }}>Détails</span>
                      </div>
                      <div className="edit-btn" title="Modifier" onClick={e => openUpdate(e, team)}><span className="material-icons" style={{ fontSize: 14 }}>edit</span></div>
                      <div className="delete-btn" title="Supprimer" onClick={() => setDeleteTarget(team)}><span className="material-icons" style={{ fontSize: 14 }}>delete</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══ MODAL: ADD ═══ */}
      {showAdd && (
        <div className="tr-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowAdd(false); setAddForm(EMPTY_ADD); } }}>
          <div className="sm-modal">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, color: "#fff" }}>Ajouter une équipe</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>Remplissez les informations de la nouvelle équipe</div>
              </div>
              <button className="ibtn" onClick={() => { setShowAdd(false); setAddForm(EMPTY_ADD); }}>
                <span className="material-icons" style={{ fontSize: 17 }}>close</span>
              </button>
            </div>

            <div className="sm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
              <div className="db-field">
                <label>Nom *</label>
                <input type="text" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Maroc" />
              </div>
              <div className="db-field">
                <label>Pays *</label>
                <input type="text" value={addForm.country} onChange={e => setAddForm(f => ({ ...f, country: e.target.value }))} placeholder="Ex: Maroc" />
              </div>
              <div className="db-field">
                <label>Coach</label>
                <input type="text" value={addForm.coach} onChange={e => setAddForm(f => ({ ...f, coach: e.target.value }))} placeholder="Nom du coach" />
              </div>
              <div className="db-field">
                <label>Participations</label>
                <input type="number" min="0" value={addForm.participation} onChange={e => setAddForm(f => ({ ...f, participation: e.target.value }))} placeholder="Nb éditions" />
              </div>
              <div className="db-field" style={{ gridColumn: "1/-1" }}>
                <label>URL de l'image</label>
                <input type="text" value={addForm.imageUrl} onChange={e => setAddForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" />
              </div>
              <div className="db-field" style={{ gridColumn: "1/-1" }}>
                <label>Description</label>
                <textarea rows={3} value={addForm.description} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} placeholder="Courte description…" />
              </div>
            </div>

            {/* Players */}
            <div style={{ marginBottom: 16 }}>
              <div className="section-header">
                <span>Joueurs ({addForm.players.length})</span>
                <button className="btn-g" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setShowAddPlayer(p => !p)}>
                  <span className="material-icons" style={{ fontSize: 13 }}>{showAddPlayer ? "close" : "person_add"}</span>
                  {showAddPlayer ? "Annuler" : "Ajouter"}
                </button>
              </div>
              {showAddPlayer && (
                <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: 14, marginBottom: 10 }}>
                  <div className="sm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
                    <div className="db-field" style={{ gridColumn: "1/-1" }}>
                      <label>Nom *</label>
                      <input type="text" value={addPlayerForm.name} onChange={e => setAddPlayerForm(f => ({ ...f, name: e.target.value }))} placeholder="Nom du joueur" />
                    </div>
                    <div className="db-field"><label>Âge</label><input type="number" min="0" value={addPlayerForm.age} onChange={e => setAddPlayerForm(f => ({ ...f, age: e.target.value }))} placeholder="25" /></div>
                    <div className="db-field"><label>Buts</label><input type="number" min="0" value={addPlayerForm.goals} onChange={e => setAddPlayerForm(f => ({ ...f, goals: e.target.value }))} placeholder="3" /></div>
                    <div className="db-field"><label>Taille (m)</label><input type="number" step="0.01" value={addPlayerForm.height} onChange={e => setAddPlayerForm(f => ({ ...f, height: e.target.value }))} placeholder="1.82" /></div>
                    <div className="db-field"><label>Poids (kg)</label><input type="number" step="0.1" value={addPlayerForm.weight} onChange={e => setAddPlayerForm(f => ({ ...f, weight: e.target.value }))} placeholder="78" /></div>
                    <div className="db-field" style={{ gridColumn: "1/-1" }}>
                      <label>URL Photo</label>
                      <input type="text" value={addPlayerForm.imgUrl} onChange={e => setAddPlayerForm(f => ({ ...f, imgUrl: e.target.value }))} placeholder="https://…" />
                    </div>
                  </div>
                  <button className="btn-g" style={{ width: "100%", justifyContent: "center" }} onClick={pushPlayer}>
                    <span className="material-icons" style={{ fontSize: 13 }}>add</span>Confirmer le joueur
                  </button>
                </div>
              )}
              {addForm.players.map((p, i) => (
                <div key={i} className="list-item">
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: hue(p.name), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 10, color: "#fff", flexShrink: 0 }}>{initials(p.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, color: "#fff" }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>{p.age ? `${p.age} ans` : ""}{p.goals ? ` · ⚽ ${p.goals}` : ""}</div>
                  </div>
                  <button className="ibtn del" onClick={() => removeAddPlayer(i)}><span className="material-icons" style={{ fontSize: 13 }}>delete</span></button>
                </div>
              ))}
            </div>

            {/* Cultures */}
            <div style={{ marginBottom: 16 }}>
              <div className="section-header">
                <span>Cultures ({addForm.cultures.length})</span>
                <button className="btn-p" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setShowAddCulture(p => !p)}>
                  <span className="material-icons" style={{ fontSize: 13 }}>{showAddCulture ? "close" : "add"}</span>
                  {showAddCulture ? "Annuler" : "Ajouter"}
                </button>
              </div>
              {showAddCulture && (
                <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: 14, marginBottom: 10 }}>
                  <div className="db-field"><label>Titre *</label><input type="text" value={addCultureForm.title} onChange={e => setAddCultureForm(f => ({ ...f, title: e.target.value }))} placeholder="Titre" /></div>
                  <div className="db-field"><label>Description</label><textarea rows={2} value={addCultureForm.description} onChange={e => setAddCultureForm(f => ({ ...f, description: e.target.value }))} placeholder="Description…" /></div>
                  <div className="db-field"><label>URL Image</label><input type="text" value={addCultureForm.imageUrl} onChange={e => setAddCultureForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" /></div>
                  <button className="btn-p" style={{ width: "100%", justifyContent: "center" }} onClick={pushCulture}><span className="material-icons" style={{ fontSize: 13 }}>add</span>Confirmer</button>
                </div>
              )}
              {addForm.cultures.map((c, i) => (
                <div key={i} className="list-item">
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: hue(c.title), display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="material-icons" style={{ fontSize: 14, color: "#fff" }}>flag</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, color: "#fff" }}>{c.title}</div>
                    {c.description && <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>{c.description.slice(0, 60)}{c.description.length > 60 ? "…" : ""}</div>}
                  </div>
                  <button className="ibtn del" onClick={() => removeAddCulture(i)}><span className="material-icons" style={{ fontSize: 13 }}>delete</span></button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
              <button className="btn-s" onClick={() => { setShowAdd(false); setAddForm(EMPTY_ADD); }}>Annuler</button>
              <button className="btn-p" onClick={submitAdd} disabled={savingAdd}>
                {savingAdd
                  ? <><div className="tr-spin" style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%" }} />Enregistrement…</>
                  : <><span className="material-icons" style={{ fontSize: 14 }}>add</span>Créer l'équipe</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: UPDATE ═══ */}
      {updateTarget && (
        <div className="tr-overlay" onClick={e => { if (e.target === e.currentTarget) setUpdateTarget(null); }}>
          <div className="sm-modal">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, color: "#fff" }}>Modifier l'équipe</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{updateTarget.name} · #{updateTarget.id}</div>
              </div>
              <button className="ibtn" onClick={() => setUpdateTarget(null)}><span className="material-icons" style={{ fontSize: 17 }}>close</span></button>
            </div>

            <div className="sm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
              <div className="db-field"><label>Nom *</label><input type="text" value={updateForm.name} onChange={e => setUpdateForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Maroc" /></div>
              <div className="db-field"><label>Pays *</label><input type="text" value={updateForm.country} onChange={e => setUpdateForm(f => ({ ...f, country: e.target.value }))} placeholder="Ex: Maroc" /></div>
              <div className="db-field"><label>Coach</label><input type="text" value={updateForm.coach} onChange={e => setUpdateForm(f => ({ ...f, coach: e.target.value }))} placeholder="Nom du coach" /></div>
              <div className="db-field"><label>Participations</label><input type="number" min="0" value={updateForm.participation} onChange={e => setUpdateForm(f => ({ ...f, participation: e.target.value }))} placeholder="Nb éditions" /></div>
              <div className="db-field" style={{ gridColumn: "1/-1" }}><label>URL de l'image</label><input type="text" value={updateForm.imageUrl} onChange={e => setUpdateForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" /></div>
              <div className="db-field" style={{ gridColumn: "1/-1" }}><label>Description</label><textarea rows={3} value={updateForm.description} onChange={e => setUpdateForm(f => ({ ...f, description: e.target.value }))} placeholder="Courte description…" /></div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
              <button className="btn-s" onClick={() => setUpdateTarget(null)}>Annuler</button>
              <button className="btn-blue" onClick={submitUpdate} disabled={savingUpdate}>
                {savingUpdate
                  ? <><div className="tr-spin" style={{ width: 13, height: 13, border: "2px solid rgba(96,165,250,.4)", borderTopColor: "#60a5fa", borderRadius: "50%" }} />Mise à jour…</>
                  : <><span className="material-icons" style={{ fontSize: 14 }}>save</span>Enregistrer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: DELETE ═══ */}
      {deleteTarget && (
        <div className="tr-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="sm-modal" style={{ maxWidth: 420 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <span className="material-icons" style={{ fontSize: 26, color: "#ef4444" }}>delete_forever</span>
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: "#fff", marginBottom: 8 }}>Supprimer cette équipe ?</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 6, lineHeight: 1.6 }}>Cette action est irréversible. Tous les joueurs, cultures et actualités liés seront également supprimés.</div>
            <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "12px 14px", marginBottom: 22, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>{deleteTarget.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{deleteTarget.country || "—"} · #{deleteTarget.id}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn-s" onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button className="btn-danger" onClick={confirmDelete} disabled={deletingTeam}>
                {deletingTeam
                  ? <><div className="tr-spin" style={{ width: 13, height: 13, border: "2px solid rgba(239,68,68,.4)", borderTopColor: "#ef4444", borderRadius: "50%" }} />Suppression…</>
                  : <><span className="material-icons" style={{ fontSize: 14 }}>delete</span>Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: DETAIL ═══ */}
      {selected && (
        <div className="tr-overlay" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="tr-modal">
            <div className="tr-modal-head">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  {selected.imageUrl
                    ? <img src={selected.imageUrl} alt={selected.name} style={{ width: 42, height: 42, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                    : <div style={{ width: 42, height: 42, borderRadius: 10, background: hue(selected.name), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: "#fff", flexShrink: 0 }}>{initials(selected.name)}</div>}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {selected.country || "—"} · #{selected.id}{selected.coach ? ` · ${selected.coach}` : ""}
                    </div>
                  </div>
                </div>
                <button className="ibtn" style={{ flexShrink: 0, marginLeft: 8 }} onClick={() => setSelected(null)}><span className="material-icons" style={{ fontSize: 17 }}>close</span></button>
              </div>
              <div className="tr-tabs">
                {[
                  { id: "info",     icon: "info",          label: "Infos"    },
                  { id: "players",  icon: "people",        label: "Joueurs"  },
                  { id: "cultures", icon: "flag",          label: "Cultures" },
                  { id: "news",     icon: "article",       label: "Actus"    },
                  { id: "matches",  icon: "sports_soccer", label: "Matchs"   },
                ].map(({ id, icon, label }) => (
                  <div key={id} className={`tr-tab${modalTab === id ? " active" : ""}`} onClick={() => setModalTab(id)}>
                    <span className="material-icons mi">{icon}</span>{label}
                  </div>
                ))}
              </div>
            </div>

            <div className="tr-modal-body">
              {loadingDetail && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0", color: "rgba(255,255,255,.35)", fontSize: 13 }}>
                  <div className="tr-spin" style={{ width: 16, height: 16, border: "2px solid #C1272D", borderTopColor: "transparent", borderRadius: "50%" }} />
                  Chargement des détails…
                </div>
              )}

              {!loadingDetail && modalTab === "info" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                    {[
                      { label: "Pays",          value: detail?.country        || selected.country        || "—" },
                      { label: "Coach",         value: detail?.coach          || selected.coach          || "—" },
                      { label: "Participations",value: `${detail?.participation ?? selected.participation ?? 0} éd.` },
                      { label: "Actualités",    value: `${detail?.news?.length ?? selected.newsCount ?? 0} article(s)` },
                      { label: "Joueurs",       value: `${detail?.players?.length ?? 0} joueur(s)` },
                      { label: "Cultures",      value: `${detail?.cultures?.length ?? 0} entrée(s)` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 10, padding: "11px 13px" }}>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 4 }}>{label}</div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  {(detail?.description || selected.description) && (
                    <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 10, padding: 14 }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 6 }}>Description</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", lineHeight: 1.7 }}>{detail?.description || selected.description}</div>
                    </div>
                  )}
                </div>
              )}

              {!loadingDetail && modalTab === "players" && (
                <div>
                  {!detail?.players || detail.players.length === 0
                    ? <div className="empty"><span className="material-icons">people</span><span>Aucun joueur enregistré</span></div>
                    : detail.players.map((p, i) => (
                      <div key={p.id || i} className="list-item">
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: hue(p.name), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 11, color: "#fff", flexShrink: 0, overflow: "hidden" }}>
                          {p.imgUrl ? <img src={p.imgUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials(p.name)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 2 }}>
                            {p.age ? `${p.age} ans` : ""}{p.height ? ` · ${p.height}m` : ""}{p.weight ? ` · ${p.weight}kg` : ""}
                          </div>
                        </div>
                        {p.goals > 0 && <span className="badge" style={{ background: "rgba(74,222,128,.08)", color: "#4ade80", borderColor: "rgba(74,222,128,.2)" }}>⚽ {p.goals}</span>}
                      </div>
                    ))}
                </div>
              )}

              {!loadingDetail && modalTab === "cultures" && (
                <div>
                  {!detail?.cultures || detail.cultures.length === 0
                    ? <div className="empty"><span className="material-icons">flag</span><span>Aucune culture enregistrée</span></div>
                    : detail.cultures.map((c, i) => (
                      <div key={c.id || i} className="list-item" style={{ alignItems: "flex-start" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: hue(c.title) }}>
                          {c.imageUrl
                            ? <img src={c.imageUrl} alt={c.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="material-icons" style={{ fontSize: 18, color: "#fff" }}>flag</span></div>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>{c.title}</div>
                          {c.description && <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 3, lineHeight: 1.5 }}>{c.description}</div>}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {!loadingDetail && modalTab === "news" && (
                <div>
                  {!detail?.news || detail.news.length === 0
                    ? <div className="empty"><span className="material-icons">article</span><span>Aucune actualité</span></div>
                    : detail.news.map((n, i) => (
                      <div key={n.id || i} className="list-item" style={{ alignItems: "flex-start" }}>
                        <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: hue(n.title) }}>
                          {n.imageUrl
                            ? <img src={n.imageUrl} alt={n.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="material-icons" style={{ fontSize: 18, color: "#fff" }}>article</span></div>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>{n.title}</div>
                          {n.description && <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 2 }}>{n.description.slice(0,80)}{n.description.length > 80 ? "…" : ""}</div>}
                          {n.dateOfCreation && <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)", marginTop: 4 }}>{new Date(n.dateOfCreation).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}</div>}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {!loadingDetail && modalTab === "matches" && (
                <div>
                  {!detail?.matches || detail.matches.length === 0
                    ? <div className="empty"><span className="material-icons">sports_soccer</span><span>Aucun match enregistré</span></div>
                    : detail.matches.map((m, i) => {
                      const won = m.goals > m.opponentGoals, draw = m.goals === m.opponentGoals;
                      const result = won
                        ? { label: "V", bg: "rgba(74,222,128,.1)", color: "#4ade80", border: "rgba(74,222,128,.25)" }
                        : draw
                          ? { label: "N", bg: "rgba(251,191,36,.1)", color: "#fbbf24", border: "rgba(251,191,36,.25)" }
                          : { label: "D", bg: "rgba(239,68,68,.1)", color: "#ef4444", border: "rgba(239,68,68,.25)" };
                      return (
                        <div key={m.id || i} className="list-item">
                          <span className="badge" style={{ background: result.bg, color: result.color, borderColor: result.border, minWidth: 30, justifyContent: "center" }}>{result.label}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, color: "#fff" }}>
                              vs {m.opponentName || "—"}<span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, color: "#C1272D", marginLeft: 10 }}>{m.goals} — {m.opponentGoals}</span>
                            </div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 2 }}>
                              {m.type || "—"}{m.dateOfMatch ? ` · ${new Date(m.dateOfMatch).toLocaleDateString("fr-FR")}` : ""}
                            </div>
                          </div>
                          <span className="badge" style={{
                            background:   m.status === "FINISHED" ? "rgba(0,98,51,.15)"   : m.status === "LIVE" ? "rgba(193,39,45,.18)"  : "rgba(255,255,255,.06)",
                            color:        m.status === "FINISHED" ? "#4ade80"              : m.status === "LIVE" ? "#f87171"               : "rgba(255,255,255,.4)",
                            borderColor:  m.status === "FINISHED" ? "rgba(0,98,51,.35)"   : m.status === "LIVE" ? "rgba(193,39,45,.4)"    : "rgba(255,255,255,.12)",
                          }}>{m.status || "—"}</span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TOAST ═══ */}
      {toast && (
        <div className="tr-toast" style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: toast.type === "success" ? "rgba(22,163,74,.95)" : "rgba(193,39,45,.95)",
          color: "#fff", padding: "11px 20px", borderRadius: 10, fontSize: 13,
          fontFamily: "'Syne',sans-serif", fontWeight: 700,
          display: "flex", alignItems: "center", gap: 9,
          zIndex: 400, boxShadow: "0 8px 28px rgba(0,0,0,.5)", whiteSpace: "nowrap",
        }}>
          <span className="material-icons" style={{ fontSize: 17 }}>{toast.type === "success" ? "check_circle" : "cancel"}</span>
          {toast.msg}
        </div>
      )}
    </>
  );
}