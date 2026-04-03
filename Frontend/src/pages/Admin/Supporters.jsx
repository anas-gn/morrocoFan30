"use client";
import { useState, useEffect } from "react";
import Head from "next/head";

const BASE = "https://anas-gana1-fandb-backend.hf.space/api/supporters";

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
  name: "", age: "", email: "", phone: "", country: "",
};

export default function SupporterRespo() {
  const [supporters, setSupporters] = useState([]);
  const [filteredSupporters, setFilteredSupporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD);
  const [savingAdd, setSavingAdd] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingSupporter, setDeletingSupporter] = useState(false);

  const [updateTarget, setUpdateTarget] = useState(null);
  const [updateForm, setUpdateForm] = useState(EMPTY_ADD);
  const [savingUpdate, setSavingUpdate] = useState(false);

  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadSupporters = () => {
    setLoading(true);
    fetch(`${BASE}/all?page=0&size=100&sortBy=id`)
      .then(r => r.json())
      .then(d => {
        setSupporters(Array.isArray(d.content) ? d.content : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadSupporters(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFilteredSupporters(supporters); return; }
    const q = search.toLowerCase();
    setFilteredSupporters(
      supporters.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.country?.toLowerCase().includes(q)
      )
    );
  }, [search, supporters]);

  const submitAdd = async () => {
    if (!addForm.name || !addForm.email || !addForm.country) {
      showToast("error", "Nom, email et pays sont requis."); return;
    }
    setSavingAdd(true);
    try {
      const body = {
        name: addForm.name,
        age: addForm.age ? parseInt(addForm.age) : 0,
        email: addForm.email,
        phone: addForm.phone || null,
        country: addForm.country,
      };
      const res = await fetch(`${BASE}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        showToast("success", "Supporter ajouté avec succès !");
        setShowAdd(false); setAddForm(EMPTY_ADD); loadSupporters();
      } else showToast("error", "Échec de l'ajout.");
    } catch { showToast("error", "Erreur réseau."); }
    setSavingAdd(false);
  };

  const openUpdate = (e, supporter) => {
    e.stopPropagation();
    setUpdateTarget(supporter);
    setUpdateForm({
      name: supporter.name || "",
      age: supporter.age || "",
      email: supporter.email || "",
      phone: supporter.phone || "",
      country: supporter.country || "",
    });
  };

  const submitUpdate = async () => {
    if (!updateForm.name || !updateForm.email || !updateForm.country) {
      showToast("error", "Nom, email et pays sont requis."); return;
    }
    setSavingUpdate(true);
    try {
      const body = {
        name: updateForm.name,
        age: updateForm.age ? parseInt(updateForm.age) : 0,
        email: updateForm.email,
        phone: updateForm.phone || null,
        country: updateForm.country,
      };
      const res = await fetch(`${BASE}/${updateTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        showToast("success", "Supporter mis à jour !");
        setUpdateTarget(null);
        loadSupporters();
      } else showToast("error", "Échec de la modification.");
    } catch { showToast("error", "Erreur réseau."); }
    setSavingUpdate(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingSupporter(true);
    try {
      const res = await fetch(`${BASE}/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("success", "Supporter supprimé !");
        setSupporters(s => s.filter(t => t.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else showToast("error", "Échec suppression.");
    } catch { showToast("error", "Erreur réseau."); }
    setDeletingSupporter(false);
  };

  const openSupporter = async supporter => {
    setSelected(supporter);
    setDetail(null);
    setLoadingDetail(true);
    try {
      const d = await sf(`${BASE}/${supporter.id}`);
      setDetail(d);
    } catch { showToast("error", "Impossible de charger les détails."); }
    setLoadingDetail(false);
  };

  return (
    <>
      <Head>
        <title>Supporters · MoroccoFan2030</title>
        <link rel="icon" href="/images/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
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
        .tr-thead { display: grid; grid-template-columns: 44px 1fr 1fr 1fr 1fr 100px; gap: 8px; padding: 10px 18px; border-bottom: 1px solid rgba(255,255,255,.06); font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; color: rgba(255,255,255,.28); text-transform: uppercase; letter-spacing: .08em }
        .tr-row { display: grid; grid-template-columns: 44px 1fr 1fr 1fr 1fr 100px; gap: 8px; padding: 13px 18px; border-bottom: 1px solid rgba(255,255,255,.04); align-items: center; cursor: pointer; transition: background .15s }
        .tr-row:hover { background: rgba(255,255,255,.03) }
        .tr-row:last-child { border-bottom: none }

        /* ── MOBILE CARDS ── */
        .supporter-cards { display: none; flex-direction: column; gap: 10px }
        .supporter-card {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px; padding: 14px;
          cursor: pointer; transition: all .18s;
          animation: fadeUp .35s ease both;
        }
        .supporter-card:hover { background: rgba(255,255,255,.05); border-color: rgba(193,39,45,.2) }
        .supporter-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 10px }
        .supporter-card-info { flex: 1; min-width: 0 }
        .supporter-card-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px }
        .supporter-card-actions { display: flex; gap: 8px }

        /* shared */
        .supporter-logo { width: 34px; height: 34px; border-radius: 8px; object-fit: cover; flex-shrink: 0 }
        .supporter-logo-placeholder { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 11px; color: #fff; flex-shrink: 0 }
        .supporter-name-cell { display: flex; flex-direction: column }

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
          .supporter-cards { display: flex }

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
          .supporter-cards { display: none }
        }
      `}</style>

      <div className="main-wrap">
        <div className="tr-header">
          <div className="tr-title-row">
            <div className="tr-title-left">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(193,39,45,.15)", border: "1px solid rgba(193,39,45,.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="material-icons" style={{ fontSize: 18, color: "#C1272D" }}>people</span>
              </div>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>Gestion des Supporters</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 1 }}>{supporters.length} supporters chargés</div>
              </div>
            </div>
            <div className="tr-title-actions">
              <button className="btn-p" style={{ padding: "7px 14px", fontSize: 11 }} onClick={() => setShowAdd(true)}>
                <span className="material-icons" style={{ fontSize: 14 }}>add</span>Ajouter
              </button>
              <button className="btn-s" style={{ padding: "7px 14px", fontSize: 11 }} onClick={loadSupporters}>
                <span className="material-icons" style={{ fontSize: 14 }}>refresh</span>Actualiser
              </button>
            </div>
          </div>

          <div className="tr-stats">
            {[
              { label: `${supporters.length} Total`, dot: "rgba(255,255,255,.4)" },
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
              <input className="tr-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher supporter, email, pays…" />
            </div>
          </div>
        </div>

        <div className="tr-content">
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 280, gap: 14 }}>
              <div className="tr-spin" style={{ width: 34, height: 34, border: "3px solid #C1272D", borderTopColor: "transparent", borderRadius: "50%" }} />
              <span style={{ fontFamily: "'Syne',sans-serif", color: "rgba(255,255,255,.4)", fontSize: 14 }}>Chargement des supporters…</span>
            </div>
          ) : (
            <>
              <div className="tr-table">
                <div className="tr-thead">
                  <div></div>
                  <div>Nom</div>
                  <div>Email</div>
                  <div>Âge</div>
                  <div>Pays</div>
                  <div style={{ textAlign: "center" }}>Actions</div>
                </div>
                {filteredSupporters.length === 0 && (
                  <div className="empty"><span className="material-icons">people</span><span>Aucun supporter trouvé</span></div>
                )}
                {filteredSupporters.map((supporter, i) => (
                  <div key={supporter.id || i} className="tr-row tr-up" style={{ animationDelay: `${i * 0.03}s` }} onClick={() => openSupporter(supporter)}>
                    <div>
                      <div className="supporter-logo-placeholder" style={{ background: hue(supporter.name) }}>{initials(supporter.name)}</div>
                    </div>
                    <div className="supporter-name-cell">
                      <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>{supporter.name || "—"}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", fontFamily: "'Syne',sans-serif", fontWeight: 600 }}>{supporter.email || "—"}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", fontFamily: "'Syne',sans-serif", fontWeight: 600 }}>{supporter.age || "—"}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", fontFamily: "'Syne',sans-serif", fontWeight: 600 }}>{supporter.country || "—"}</div>
                    <div className="row-actions" style={{ justifyContent: "center" }} onClick={e => e.stopPropagation()}>
                      <div className="settings-btn" title="Détails" onClick={() => openSupporter(supporter)}><span className="material-icons" style={{ fontSize: 14 }}>visibility</span></div>
                      <div className="edit-btn" title="Modifier" onClick={e => openUpdate(e, supporter)}><span className="material-icons" style={{ fontSize: 14 }}>edit</span></div>
                      <div className="delete-btn" title="Supprimer" onClick={() => setDeleteTarget(supporter)}><span className="material-icons" style={{ fontSize: 14 }}>delete</span></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="supporter-cards">
                {filteredSupporters.length === 0 && (
                  <div className="empty"><span className="material-icons">people</span><span>Aucun supporter trouvé</span></div>
                )}
                {filteredSupporters.map((supporter, i) => (
                  <div key={supporter.id || i} className="supporter-card" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => openSupporter(supporter)}>
                    <div className="supporter-card-top">
                      <div className="supporter-logo-placeholder" style={{ width: 42, height: 42, borderRadius: 10, background: hue(supporter.name), fontSize: 14 }}>{initials(supporter.name)}</div>
                      <div className="supporter-card-info">
                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: "#fff", marginBottom: 2 }}>{supporter.name || "—"}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{supporter.email || "—"}</div>
                      </div>
                    </div>
                    <div className="supporter-card-meta">
                      <span className="badge" style={{ background: "rgba(74,222,128,.08)", color: "#4ade80", borderColor: "rgba(74,222,128,.2)" }}>{supporter.age || "—"} ans</span>
                      <span className="badge" style={{ background: "rgba(96,165,250,.08)", color: "#60a5fa", borderColor: "rgba(96,165,250,.2)" }}>{supporter.country || "—"}</span>
                    </div>
                    <div className="supporter-card-actions" onClick={e => e.stopPropagation()}>
                      <div className="settings-btn" style={{ flex: 1, width: "auto", borderRadius: 9, gap: 6, padding: "0 10px", fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700 }} onClick={() => openSupporter(supporter)}>
                        <span className="material-icons" style={{ fontSize: 14 }}>visibility</span>
                        <span style={{ fontSize: 11 }}>Détails</span>
                      </div>
                      <div className="edit-btn" title="Modifier" onClick={e => openUpdate(e, supporter)}><span className="material-icons" style={{ fontSize: 14 }}>edit</span></div>
                      <div className="delete-btn" title="Supprimer" onClick={() => setDeleteTarget(supporter)}><span className="material-icons" style={{ fontSize: 14 }}>delete</span></div>
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
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, color: "#fff" }}>Ajouter un supporter</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>Remplissez les informations du nouveau supporter</div>
              </div>
              <button className="ibtn" onClick={() => { setShowAdd(false); setAddForm(EMPTY_ADD); }}>
                <span className="material-icons" style={{ fontSize: 17 }}>close</span>
              </button>
            </div>

            <div className="sm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
              <div className="db-field">
                <label>Nom *</label>
                <input type="text" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Jean Dupont" />
              </div>
              <div className="db-field">
                <label>Email *</label>
                <input type="email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} placeholder="jeandupont@example.com" />
              </div>
              <div className="db-field">
                <label>Âge</label>
                <input type="number" min="0" value={addForm.age} onChange={e => setAddForm(f => ({ ...f, age: e.target.value }))} placeholder="25" />
              </div>
              <div className="db-field">
                <label>Téléphone</label>
                <input type="tel" value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} placeholder="+33 6 12 34 56 78" />
              </div>
              <div className="db-field" style={{ gridColumn: "1/-1" }}>
                <label>Pays *</label>
                <input type="text" value={addForm.country} onChange={e => setAddForm(f => ({ ...f, country: e.target.value }))} placeholder="France" />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
              <button className="btn-s" onClick={() => { setShowAdd(false); setAddForm(EMPTY_ADD); }}>Annuler</button>
              <button className="btn-p" onClick={submitAdd} disabled={savingAdd}>
                {savingAdd
                  ? <><div className="tr-spin" style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%" }} />Enregistrement…</>
                  : <><span className="material-icons" style={{ fontSize: 14 }}>add</span>Créer le supporter</>}
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
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, color: "#fff", lineHeight: 1 }}>Modifier le supporter</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{updateTarget.name} · #{updateTarget.id}</div>
              </div>
              <button className="ibtn" onClick={() => setUpdateTarget(null)}><span className="material-icons" style={{ fontSize: 17 }}>close</span></button>
            </div>

            <div className="sm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
              <div className="db-field"><label>Nom *</label><input type="text" value={updateForm.name} onChange={e => setUpdateForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Jean Dupont" /></div>
              <div className="db-field"><label>Email *</label><input type="email" value={updateForm.email} onChange={e => setUpdateForm(f => ({ ...f, email: e.target.value }))} placeholder="jeandupont@example.com" /></div>
              <div className="db-field"><label>Âge</label><input type="number" min="0" value={updateForm.age} onChange={e => setUpdateForm(f => ({ ...f, age: e.target.value }))} placeholder="25" /></div>
              <div className="db-field"><label>Téléphone</label><input type="tel" value={updateForm.phone} onChange={e => setUpdateForm(f => ({ ...f, phone: e.target.value }))} placeholder="+33 6 12 34 56 78" /></div>
              <div className="db-field" style={{ gridColumn: "1/-1" }}><label>Pays *</label><input type="text" value={updateForm.country} onChange={e => setUpdateForm(f => ({ ...f, country: e.target.value }))} placeholder="France" /></div>
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
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: "#fff", marginBottom: 8 }}>Supprimer ce supporter ?</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 6, lineHeight: 1.6 }}>Cette action est irréversible.</div>
            <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "12px 14px", marginBottom: 22, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>{deleteTarget.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{deleteTarget.email || "—"} · #{deleteTarget.id}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn-s" onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button className="btn-danger" onClick={confirmDelete} disabled={deletingSupporter}>
                {deletingSupporter
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
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: hue(selected.name), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: "#fff", flexShrink: 0 }}>{initials(selected.name)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {selected.email || "—"} · #{selected.id}{selected.country ? ` · ${selected.country}` : ""}
                    </div>
                  </div>
                </div>
                <button className="ibtn" style={{ flexShrink: 0, marginLeft: 8 }} onClick={() => setSelected(null)}><span className="material-icons" style={{ fontSize: 17 }}>close</span></button>
              </div>
            </div>

            <div className="tr-modal-body">
              {loadingDetail ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0", color: "rgba(255,255,255,.35)", fontSize: 13 }}>
                  <div className="tr-spin" style={{ width: 16, height: 16, border: "2px solid #C1272D", borderTopColor: "transparent", borderRadius: "50%" }} />
                  Chargement des détails…
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                    {[
                      { label: "Email", value: detail?.email || selected.email || "—" },
                      { label: "Âge", value: `${detail?.age || selected.age || "—"} ans` },
                      { label: "Téléphone", value: detail?.phone || selected.phone || "—" },
                      { label: "Pays", value: detail?.country || selected.country || "—" },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 10, padding: "11px 13px" }}>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 4 }}>{label}</div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
                    <button className="btn-blue" style={{ fontSize: 11 }} onClick={e => { openUpdate(e, selected); setSelected(null); }}>
                      <span className="material-icons" style={{ fontSize: 14 }}>edit</span>Modifier
                    </button>
                    <button className="btn-danger" style={{ fontSize: 11 }} onClick={() => { setDeleteTarget(selected); setSelected(null); }}>
                      <span className="material-icons" style={{ fontSize: 14 }}>delete</span>Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TOAST ═══ */}
      {toast && (
        <div className="tr-toast" style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: toast.type === "success" ? "rgba(74,222,128,.95)" : "rgba(193,39,45,.95)",
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