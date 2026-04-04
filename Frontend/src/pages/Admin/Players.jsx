"use client";
import { useState, useEffect, useRef } from "react";

const BASE_PLAYERS = "https://anas-gana1-fandb-backend.hf.space/api/players";
const BASE_TEAMS = "https://anas-gana1-fandb-backend.hf.space/api/teams";

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
  name: "", height: "", weight: "", goals: "", age: "",
  teamId: "", teamName: "", imgUrl: "",
};

function TeamSelect({ teams, value, onChange, placeholder = "Rechercher une équipe…" }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { if (!value) setQuery(""); }, [value]);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = teams.filter(t =>
    !query.trim() ||
    t.name?.toLowerCase().includes(query.toLowerCase()) ||
    t.country?.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = team => {
    setQuery(team.name);
    setOpen(false);
    onChange({ id: team.id, name: team.name });
  };

  const handleInputChange = e => {
    setQuery(e.target.value);
    if (!e.target.value) onChange({ id: "", name: "" });
    setOpen(true);
  };

  const handleClear = () => {
    setQuery("");
    onChange({ id: "", name: "" });
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
          fontSize: 15, color: "rgba(255,255,255,.28)", pointerEvents: "none",
          fontFamily: "Material Icons"
        }}>search</span>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          style={{
            width: "100%", background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.09)", borderRadius: 9,
            color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 13,
            padding: "8px 12px 8px 34px", outline: "none",
            transition: "border-color .2s",
          }}
          onFocusCapture={e => { e.target.style.borderColor = "rgba(193,39,45,.4)"; }}
          onBlurCapture={e => { e.target.style.borderColor = "rgba(255,255,255,.09)"; }}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,.1)", border: "none", borderRadius: "50%",
              width: 20, height: 20, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,.6)",
              padding: 0,
            }}
          >
            <span style={{ fontFamily: "Material Icons", fontSize: 13, lineHeight: 1 }}>close</span>
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#07030a", border: "1px solid rgba(255,255,255,.09)",
          borderRadius: 9, maxHeight: 200, overflowY: "auto",
          zIndex: 300, boxShadow: "0 16px 40px rgba(0,0,0,.6)",
        }}>
          {filtered.map(team => (
            <div
              key={team.id}
              onMouseDown={() => handleSelect(team)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", cursor: "pointer",
                transition: "background .15s",
                borderBottom: "1px solid rgba(255,255,255,.04)",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(193,39,45,.12)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {team.imageUrl
                ? <img src={team.imageUrl} alt={team.name} style={{ width: 26, height: 26, borderRadius: 6, objectFit: "cover" }} />
                : <div style={{ width: 26, height: 26, borderRadius: 6, background: hue(team.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>{initials(team.name)}</div>
              }
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif" }}>{team.name}</div>
                {team.country && <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>{team.country}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && query && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#07030a", border: "1px solid rgba(255,255,255,.09)",
          borderRadius: 9, padding: "14px 12px", zIndex: 300,
          textAlign: "center", fontSize: 12, color: "rgba(255,255,255,.3)",
          fontFamily: "'Syne', sans-serif",
        }}>
          Aucune équipe trouvée
        </div>
      )}
    </div>
  );
}

export default function PlayersRespo() {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD);
  const [savingAdd, setSavingAdd] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingPlayer, setDeletingPlayer] = useState(false);

  const [updateTarget, setUpdateTarget] = useState(null);
  const [updateForm, setUpdateForm] = useState(EMPTY_ADD);
  const [savingUpdate, setSavingUpdate] = useState(false);

  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [teams, setTeams] = useState([]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadPlayers = () => {
    setLoading(true);
    // FIX: was "/players/all" — correct endpoint is "/all"
    fetch(`${BASE_PLAYERS}/players/all`)
      .then(r => r.json())
      .then(d => { setPlayers(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const loadTeams = () => {
    fetch(`${BASE_TEAMS}/getAll`)
      .then(r => r.json())
      .then(d => { setTeams(Array.isArray(d) ? d : []); })
      .catch(() => { });
  };

  useEffect(() => { loadPlayers(); loadTeams(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFilteredPlayers(players); return; }
    const q = search.toLowerCase();
    setFilteredPlayers(players.filter(p =>
      p.name?.toLowerCase().includes(q) || p.team?.toLowerCase().includes(q)
    ));
  }, [search, players]);

  const submitAdd = async () => {
    if (!addForm.name || !addForm.teamId) {
      showToast("error", "Nom et équipe sont requis."); return;
    }
    setSavingAdd(true);
    try {
      const body = {
        name: addForm.name,
        height: addForm.height ? parseFloat(addForm.height) : 0,
        weight: addForm.weight ? parseFloat(addForm.weight) : 0,
        goals: addForm.goals ? parseInt(addForm.goals) : 0,
        age: addForm.age ? parseInt(addForm.age) : 0,
        teamId: parseInt(addForm.teamId),
        urlImage: addForm.imgUrl || null,
      };

      // FIX: was "/add" — correct endpoint is "/players/add"
      const res = await fetch(`${BASE_PLAYERS}/players/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await res.text();

      if (res.ok) {
        showToast("success", "Joueur ajouté avec succès !");
        setShowAdd(false); setAddForm(EMPTY_ADD); loadPlayers();
      } else {
        showToast("error", `Échec: ${text}`);
      }
    } catch (err) {
      showToast("error", "Erreur réseau.");
    }
    setSavingAdd(false);
  };

  const openUpdate = (e, player) => {
    e.stopPropagation();
    setUpdateTarget(player);
    setUpdateForm({
      name: player.name || "", height: player.height || "",
      weight: player.weight || "", goals: player.goals || "",
      age: player.age || "", teamId: player.teamId || "",
      teamName: player.team || "", imgUrl: player.urlImage || "",
    });
  };

  const submitUpdate = async () => {
    if (!updateForm.name || !updateForm.teamId) {
      showToast("error", "Nom et équipe sont requis."); return;
    }
    setSavingUpdate(true);
    try {
      const body = {
        name: updateForm.name,
        height: updateForm.height ? parseFloat(updateForm.height) : 0,
        weight: updateForm.weight ? parseFloat(updateForm.weight) : 0,
        goals: updateForm.goals ? parseInt(updateForm.goals) : 0,
        age: updateForm.age ? parseInt(updateForm.age) : 0,
        // FIX: controller uses pp.getTeam() (Teams object), but PATCH endpoint
        // is more flexible. Using PATCH /{id} instead of PUT /update/{id}
        // to avoid needing a full Teams object on the client.
        teamID: parseInt(updateForm.teamId),
        imgUrl: updateForm.imgUrl || null,
      };

      // FIX: PUT /update/{id} expects a Players entity with a Teams object,
      // which is hard to construct client-side. Use PATCH /{id} instead,
      // then do a separate transfer call if the team changed.
      const res = await fetch(`${BASE_PLAYERS}/update/${updateTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        // If team changed, call the transfer endpoint
        if (parseInt(updateForm.teamId) !== updateTarget.teamId) {
          await fetch(`${BASE_PLAYERS}/${updateTarget.id}/transfer/${updateForm.teamId}`, {
            method: "PUT",
          });
        }
        showToast("success", "Joueur mis à jour !"); setUpdateTarget(null); loadPlayers();
      } else showToast("error", "Échec de la modification.");
    } catch { showToast("error", "Erreur réseau."); }
    setSavingUpdate(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingPlayer(true);
    try {
      // FIX: was DELETE /{id} — correct endpoint is DELETE /players/{id}
      const res = await fetch(`${BASE_PLAYERS}/players/${deleteTarget.id}`, { method: "DELETE" });
      // Controller returns boolean (true/false as text), not 204
      const text = await res.text();
      if (res.ok && text === "true") {
        showToast("success", "Joueur supprimé !");
        setPlayers(p => p.filter(t => t.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        showToast("error", "Joueur introuvable.");
        setDeleteTarget(null);
      }
    } catch { showToast("error", "Erreur réseau."); }
    setDeletingPlayer(false);
  };

  const openPlayer = async player => {
    setSelected(player); setDetail(null); setLoadingDetail(true);
    try {
      // FIX: was "/{id}" — correct endpoint is "/players/{id}"
      const d = await sf(`${BASE_PLAYERS}/players/${player.id}`);
      setDetail(d);
    } catch { showToast("error", "Impossible de charger les détails."); }
    setLoadingDetail(false);
  };

  const totalGoals = players.reduce((s, p) => s + (p.goals || 0), 0);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }
        html, body { height: 100%; width: 100%; overflow: hidden; margin: 0; padding: 0 }
        body {
          font-family: 'Inter', sans-serif;
          background: #07030a;
          color: #fff;
          -webkit-font-smoothing: antialiased;
        }

        ::-webkit-scrollbar { width: 4px; height: 4px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: rgba(193,39,45,.3); border-radius: 2px }

        @keyframes fadeUp    { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } }
        @keyframes spin      { to   { transform:rotate(360deg) } }
        @keyframes scaleIn   { from { opacity:0; transform:scale(.96) } to { opacity:1; transform:scale(1) } }
        @keyframes slideUp   { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:none } }
        @keyframes slideUpFull { from { opacity:0; transform:translateY(100%) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulseRed  { 0%,100% { box-shadow: 0 0 0 0 rgba(193,39,45,.4) } 50% { box-shadow: 0 0 0 8px rgba(193,39,45,0) } }

        .tr-spin { animation: spin 1s linear infinite }
        .tr-up   { animation: fadeUp .4s cubic-bezier(.22,.68,0,1.2) both }

        .layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          margin: 0;
          padding: 0;
        }

        .topbar {
          flex-shrink: 0;
          padding: 16px 20px 0;
          background: #07030a;
          border-bottom: 1px solid rgba(255,255,255,.06);
          backdrop-filter: blur(20px);
          position: relative;
          z-index: 5;
          width: 100%;
        }

        .topbar-row1 {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
          flex-wrap: wrap;
          width: 100%;
        }
        .topbar-brand { display: flex; align-items: center; gap: 12px; }
        .brand-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(193,39,45,.15); border: 1px solid rgba(193,39,45,.3);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .brand-icon .material-icons { font-size: 18px; color: #C1272D; }
        .brand-label { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; color: #fff; line-height: 1; }
        .brand-sub { font-size: 11px; color: rgba(255,255,255,.3); margin-top: 1px; font-weight: 400; }

        .topbar-actions { display: flex; gap: 8px; flex-shrink: 0; }

        .topbar-row2 {
          display: flex; align-items: center; gap: 10px;
          padding-bottom: 12px; flex-wrap: wrap; width: 100%;
        }

        .stat-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 99px;
          border: 1px solid rgba(255,255,255,.08); background: rgba(255,255,255,.03);
          font-family: 'Syne', sans-serif; font-size: 11px; color: rgba(255,255,255,.5);
        }
        .stat-pill strong { color: #fff; font-size: 12px; }
        .stat-dot { width: 6px; height: 6px; border-radius: 50%; }

        .search-wrap { position: relative; flex: 1; min-width: 200px; width: 100%; }
        .search-wrap .mi { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 15px; color: rgba(255,255,255,.28); pointer-events: none; font-family: 'Material Icons'; }
        .search-input {
          width: 100%; background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.09); border-radius: 9px;
          color: #fff; font-family: 'Inter', sans-serif; font-size: 13px;
          padding: 8px 12px 8px 34px; outline: none; transition: border-color .2s;
        }
        .search-input:focus { border-color: rgba(193,39,45,.4); }
        .search-input::placeholder { color: rgba(255,255,255,.22); }

        .content { flex: 1; overflow-y: auto; padding: 16px 20px; width: 100%; }

        .tbl-wrap {
          background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px; overflow: hidden; width: 100%;
        }
        .tbl-head {
          display: grid;
          grid-template-columns: 44px 1.6fr 1fr 70px 80px 80px 80px 110px;
          gap: 8px; padding: 10px 18px;
          border-bottom: 1px solid rgba(255,255,255,.06);
          font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700;
          color: rgba(255,255,255,.28); text-transform: uppercase; letter-spacing: .08em;
          background: rgba(255,255,255,.025);
        }
        .tbl-row {
          display: grid;
          grid-template-columns: 44px 1.6fr 1fr 70px 80px 80px 80px 110px;
          gap: 8px; padding: 13px 18px;
          border-bottom: 1px solid rgba(255,255,255,.04);
          align-items: center; cursor: pointer; transition: background .15s;
          animation: fadeUp .4s ease both; width: 100%;
        }
        .tbl-row:hover { background: rgba(255,255,255,.03); }
        .tbl-row:last-child { border-bottom: none; }

        .cards { display: none; flex-direction: column; gap: 10px; width: 100%; }
        .card {
          background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px; padding: 14px; cursor: pointer; transition: all .18s;
          animation: fadeUp .35s ease both; position: relative; overflow: hidden; width: 100%;
        }
        .card:hover { background: rgba(255,255,255,.05); border-color: rgba(193,39,45,.2); }
        .card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; width: 100%; }
        .card-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
        .card-actions { display: flex; gap: 8px; width: 100%; }

        .avatar { width: 34px; height: 34px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
        .avatar-ph {
          width: 34px; height: 34px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 11px; color: #fff; flex-shrink: 0;
        }

        .badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 9px; border-radius: 99px; font-size: 10px; font-weight: 700;
          border: 1px solid; font-family: 'Syne', sans-serif; letter-spacing: .06em;
        }

        .btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: 10px; border: none;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px;
          cursor: pointer; transition: all .18s; outline: none;
          text-transform: uppercase; letter-spacing: .06em;
        }
        .btn:disabled { opacity: .45; cursor: not-allowed; transform: none !important; }
        .btn-primary { background: #C1272D; color: #fff; box-shadow: 0 4px 14px rgba(193,39,45,.3); }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(193,39,45,.4); }
        .btn-ghost { background: rgba(255,255,255,.05); color: rgba(255,255,255,.7); border: 1px solid rgba(255,255,255,.1); }
        .btn-ghost:hover { background: rgba(255,255,255,.1); }
        .btn-blue { background: rgba(96,165,250,.1); color: #60a5fa; border: 1px solid rgba(96,165,250,.22); }
        .btn-blue:hover:not(:disabled) { background: rgba(96,165,250,.2); }
        .btn-danger { background: rgba(239,68,68,.15); color: #ef4444; border: 1px solid rgba(239,68,68,.3); }
        .btn-danger:hover:not(:disabled) { background: rgba(239,68,68,.28); }

        .ibtn {
          width: 28px; height: 28px; border-radius: 7px;
          border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.05);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all .18s; color: rgba(255,255,255,.4); flex-shrink: 0;
        }
        .ibtn:hover { border-color: #C1272D; color: #C1272D; background: rgba(193,39,45,.1); }
        .ibtn-edit { border-color: rgba(96,165,250,.2); background: rgba(96,165,250,.06); color: rgba(96,165,250,.5); }
        .ibtn-edit:hover { border-color: #60a5fa; color: #60a5fa; background: rgba(96,165,250,.15); }
        .ibtn-del { border-color: rgba(239,68,68,.2); background: rgba(239,68,68,.06); color: rgba(239,68,68,.5); }
        .ibtn-del:hover { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,.1); }
        .ibtn .material-icons { font-size: 15px; }

        .row-actions { display: flex; align-items: center; gap: 6px; justify-content: center; }

        .empty { display: flex; flex-direction: column; align-items: center; padding: 60px 0; gap: 12px; width: 100%; }
        .empty .material-icons { font-size: 44px; color: rgba(255,255,255,.08); }
        .empty span:last-child { font-family: 'Syne', sans-serif; color: rgba(255,255,255,.22); font-size: 13px; }

        .overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.78);
          backdrop-filter: blur(6px); z-index: 200;
          display: flex; align-items: center; justify-content: center;
          padding: 20px; width: 100vw; height: 100vh;
        }

        .modal-lg {
          background: linear-gradient(160deg, #170818 0%, #0c030f 100%);
          border: 1px solid rgba(255,255,255,.1); border-radius: 20px;
          width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto;
          animation: scaleIn .22s ease both;
        }
        .modal-sm {
          background: linear-gradient(160deg, #170818 0%, #0c030f 100%);
          border: 1px solid rgba(255,255,255,.1); border-radius: 20px;
          width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto;
          padding: 28px; animation: slideUp .24s ease both;
        }
        .modal-sm::-webkit-scrollbar { width: 4px; }
        .modal-sm::-webkit-scrollbar-thumb { background: rgba(193,39,45,.3); border-radius: 2px; }
        .modal-head {
          padding: 22px 24px 0; position: sticky; top: 0; z-index: 10;
          background: linear-gradient(160deg,#170818,#0c030f);
          border-bottom: 1px solid rgba(255,255,255,.06); width: 100%;
        }
        .modal-body { padding: 22px 24px 26px; width: 100%; }
        .modal-title-row {
          display: flex; align-items: center; justify-content: space-between;
          padding-bottom: 16px; gap: 12px; width: 100%;
        }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 14px; width: 100%; }
        .field { margin-bottom: 14px; width: 100%; }
        .field label {
          display: block; font-size: 10px; font-weight: 700; color: rgba(255,255,255,.35);
          text-transform: uppercase; letter-spacing: .08em; margin-bottom: 6px;
          font-family: 'Syne', sans-serif;
        }
        .field input, .field select {
          width: 100%; background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1); border-radius: 9px;
          color: #fff; font-family: 'Inter', sans-serif; font-size: 13px;
          padding: 10px 13px; outline: none; transition: border-color .18s;
          appearance: none; -webkit-appearance: none;
        }
        .field input:focus, .field select:focus { border-color: rgba(193,39,45,.5); }
        .field input::placeholder { color: rgba(255,255,255,.22); }

        .info-card {
          background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06);
          border-radius: 11px; padding: 13px 15px; width: 100%;
        }
        .info-label { font-family: 'Syne', sans-serif; font-size: 9px; font-weight: 700; color: rgba(255,255,255,.27); text-transform: uppercase; letter-spacing: .1em; margin-bottom: 5px; }
        .info-value { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; letter-spacing: .04em; color: #fff; }

        .section-h {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 13px;
          color: rgba(255,255,255,.5); margin-bottom: 12px;
          display: flex; align-items: center; gap: 8px; width: 100%;
        }
        .section-h::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,.06); }

        .toast {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          padding: 11px 20px; border-radius: 10px; font-size: 13px;
          font-family: 'Syne', sans-serif; font-weight: 700;
          display: flex; align-items: center; gap: 9px; z-index: 400;
          box-shadow: 0 12px 32px rgba(0,0,0,.5); white-space: nowrap;
          animation: slideUp .3s ease both;
        }
        .toast .material-icons { font-size: 18px; }

        .modal-divider { height: 1px; background: rgba(255,255,255,.06); margin: 18px 0; width: 100%; }

        @media (max-width: 768px) {
          .topbar { padding: 14px 16px 0; }
          .content { padding: 14px 16px 80px; }
          .tbl-wrap { display: none; }
          .cards { display: flex; }
          .overlay { padding: 0; align-items: flex-end; }
          .modal-lg, .modal-sm { max-width: 100%; border-radius: 20px 20px 0 0; max-height: 92vh; animation: slideUpFull .3s ease both; }
          .modal-sm { padding: 20px 16px; }
          .modal-head { padding: 16px 16px 0; }
          .modal-body { padding: 16px; }
          .form-grid { grid-template-columns: 1fr; }
          .toast { bottom: 72px; }
          .topbar-row1 { margin-bottom: 12px; }
          .topbar-actions .btn { font-size: 11px; padding: 8px 12px; }
        }
        @media (min-width: 769px) {
          .cards { display: none; }
        }
      `}</style>

      <div className="layout">
        <div className="topbar">
          <div className="topbar-row1">
            <div className="topbar-brand">
              <div className="brand-icon">
                <span className="material-icons">sports_soccer</span>
              </div>
              <div>
                <div className="brand-label">Gestion des Joueurs</div>
                <div className="brand-sub">MoroccoFan 2030 · Administration</div>
              </div>
            </div>
            <div className="topbar-actions">
              <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                <span className="material-icons" style={{ fontSize: 15 }}>add</span>
                Ajouter
              </button>
              <button className="btn btn-ghost" onClick={loadPlayers}>
                <span className="material-icons" style={{ fontSize: 15 }}>refresh</span>
                <span className="hide-xs">Actualiser</span>
              </button>
            </div>
          </div>

          <div className="topbar-row2">
            <div className="stat-pill">
              <div className="stat-dot" style={{ background: "#C1272D", animation: "pulseRed 2s infinite" }} />
              <strong>{players.length}</strong> joueurs
            </div>
            <div className="stat-pill">
              <div className="stat-dot" style={{ background: "#06d6a0" }} />
              <strong>{totalGoals}</strong> buts
            </div>
            <div className="search-wrap">
              <span className="mi material-icons">search</span>
              <input
                className="search-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher joueur ou équipe…"
              />
            </div>
          </div>
        </div>

        <div className="content">
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, gap: 14, width: "100%" }}>
              <div className="tr-spin" style={{ width: 36, height: 36, border: "3px solid #C1272D", borderTopColor: "transparent", borderRadius: "50%" }} />
              <span style={{ fontFamily: "'Inter',sans-serif", color: "rgba(255,255,255,.35)", fontSize: 14 }}>Chargement des joueurs…</span>
            </div>
          ) : (
            <>
              <div className="tbl-wrap">
                <div className="tbl-head">
                  <div></div>
                  <div>Joueur</div>
                  <div>Équipe</div>
                  <div>Âge</div>
                  <div>Taille</div>
                  <div>Poids</div>
                  <div>Buts</div>
                  <div style={{ textAlign: "center" }}>Actions</div>
                </div>

                {filteredPlayers.length === 0 && (
                  <div className="empty">
                    <span className="material-icons">sports_soccer</span>
                    <span className="empty-text">Aucun joueur trouvé</span>
                  </div>
                )}

                {filteredPlayers.map((player, i) => (
                  <div
                    key={player.id || i}
                    className="tbl-row"
                    style={{ animationDelay: `${i * 0.03}s` }}
                    onClick={() => openPlayer(player)}
                  >
                    <div>
                      {player.urlImage
                        ? <img src={player.urlImage} alt={player.name} className="avatar" />
                        : <div className="avatar-ph" style={{ background: hue(player.name) }}>{initials(player.name)}</div>
                      }
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>{player.name || "—"}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>#{player.id}</div>
                    </div>
                    {/* FIX: DTO field is "team" (set from team.getName()), not "teamName" */}
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)", fontFamily: "'Syne',sans-serif", fontWeight: 500 }}>{player.team || "—"}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)", fontFamily: "'Syne',sans-serif" }}>{player.age || "—"}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)", fontFamily: "'Syne',sans-serif" }}>{player.height ? `${player.height}m` : "—"}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)", fontFamily: "'Syne',sans-serif" }}>{player.weight ? `${player.weight}kg` : "—"}</div>
                    <div>
                      <span style={{
                        fontFamily: "'Syne',sans-serif", fontSize: 18,
                        color: player.goals ? "#C1272D" : "rgba(255,255,255,.25)",
                        letterSpacing: ".04em",
                      }}>
                        {player.goals || "0"}
                      </span>
                    </div>
                    <div className="row-actions" style={{ justifyContent: "center" }} onClick={e => e.stopPropagation()}>
                      <div className="ibtn" title="Détails" onClick={() => openPlayer(player)}>
                        <span className="material-icons">visibility</span>
                      </div>
                      <div className="ibtn ibtn-edit" title="Modifier" onClick={e => openUpdate(e, player)}>
                        <span className="material-icons">edit</span>
                      </div>
                      <div className="ibtn ibtn-del" title="Supprimer" onClick={() => setDeleteTarget(player)}>
                        <span className="material-icons">delete</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cards">
                {filteredPlayers.length === 0 && (
                  <div className="empty">
                    <span className="material-icons">sports_soccer</span>
                    <span className="empty-text">Aucun joueur trouvé</span>
                  </div>
                )}
                {filteredPlayers.map((player, i) => (
                  <div key={player.id || i} className="card" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => openPlayer(player)}>
                    <div className="card-top">
                      {player.urlImage
                        ? <img src={player.urlImage} alt={player.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                        : <div style={{ width: 44, height: 44, borderRadius: 10, background: hue(player.name), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: "#fff", flexShrink: 0 }}>{initials(player.name)}</div>
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player.name || "—"}</div>
                        {/* FIX: use player.team (correct DTO field) */}
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>{player.team || "—"}</div>
                      </div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, color: player.goals ? "#C1272D" : "rgba(255,255,255,.15)", letterSpacing: ".04em", flexShrink: 0 }}>
                        {player.goals || "0"}
                      </div>
                    </div>
                    <div className="card-meta">
                      <span className="badge" style={{ background: "rgba(74,222,128,.08)", color: "#4ade80", borderColor: "rgba(74,222,128,.2)" }}>
                        {player.age || "—"} ans
                      </span>
                      {player.height && (
                        <span className="badge" style={{ background: "rgba(96,165,250,.08)", color: "#60a5fa", borderColor: "rgba(96,165,250,.2)" }}>
                          {player.height}m
                        </span>
                      )}
                      {player.weight && (
                        <span className="badge" style={{ background: "rgba(233,196,106,.08)", color: "#e9c46a", borderColor: "rgba(233,196,106,.2)" }}>
                          {player.weight}kg
                        </span>
                      )}
                    </div>
                    <div className="card-actions" onClick={e => e.stopPropagation()}>
                      <div
                        className="ibtn"
                        style={{ flex: 1, width: "auto", borderRadius: 9, gap: 6, paddingInline: 10, fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em" }}
                        onClick={() => openPlayer(player)}
                      >
                        <span className="material-icons" style={{ fontSize: 14 }}>visibility</span>
                        <span>Détails</span>
                      </div>
                      <div className="ibtn ibtn-edit" onClick={e => openUpdate(e, player)}><span className="material-icons" style={{ fontSize: 14 }}>edit</span></div>
                      <div className="ibtn ibtn-del" onClick={() => setDeleteTarget(player)}><span className="material-icons" style={{ fontSize: 14 }}>delete</span></div>
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
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) { setShowAdd(false); setAddForm(EMPTY_ADD); } }}>
          <div className="modal-sm">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, color: "#fff", lineHeight: 1 }}>Ajouter un joueur</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", marginTop: 5 }}>Remplissez les informations du nouveau joueur</div>
              </div>
              <div className="ibtn" onClick={() => { setShowAdd(false); setAddForm(EMPTY_ADD); }}>
                <span className="material-icons">close</span>
              </div>
            </div>

            <div className="section-h">Identité</div>
            <div className="form-grid">
              <div className="field">
                <label>Nom *</label>
                <input type="text" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Achraf Hakimi" />
              </div>
              <div className="field">
                <label>Équipe *</label>
                <TeamSelect
                  teams={teams}
                  value={addForm.teamName}
                  onChange={({ id, name }) => setAddForm(f => ({ ...f, teamId: id, teamName: name }))}
                />
              </div>
            </div>

            <div className="modal-divider" />
            <div className="section-h">Statistiques</div>
            <div className="form-grid">
              <div className="field">
                <label>Âge</label>
                <input type="number" min="0" value={addForm.age} onChange={e => setAddForm(f => ({ ...f, age: e.target.value }))} placeholder="25" />
              </div>
              <div className="field">
                <label>Buts</label>
                <input type="number" min="0" value={addForm.goals} onChange={e => setAddForm(f => ({ ...f, goals: e.target.value }))} placeholder="0" />
              </div>
              <div className="field">
                <label>Taille (m)</label>
                <input type="number" step="0.01" value={addForm.height} onChange={e => setAddForm(f => ({ ...f, height: e.target.value }))} placeholder="1.82" />
              </div>
              <div className="field">
                <label>Poids (kg)</label>
                <input type="number" step="0.1" value={addForm.weight} onChange={e => setAddForm(f => ({ ...f, weight: e.target.value }))} placeholder="78" />
              </div>
            </div>

            <div className="modal-divider" />
            <div className="section-h">Média</div>
            <div className="field">
              <label>URL de l'image</label>
              <input type="text" value={addForm.imgUrl} onChange={e => setAddForm(f => ({ ...f, imgUrl: e.target.value }))} placeholder="https://…" />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button className="btn btn-ghost" onClick={() => { setShowAdd(false); setAddForm(EMPTY_ADD); }}>Annuler</button>
              <button className="btn btn-primary" onClick={submitAdd} disabled={savingAdd}>
                {savingAdd
                  ? <><div className="tr-spin" style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%" }} />Enregistrement…</>
                  : <><span className="material-icons" style={{ fontSize: 15 }}>add</span>Créer le joueur</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: UPDATE ═══ */}
      {updateTarget && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setUpdateTarget(null); }}>
          <div className="modal-sm">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, color: "#fff", lineHeight: 1 }}>Modifier le joueur</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", marginTop: 5 }}>{updateTarget.name} · #{updateTarget.id}</div>
              </div>
              <div className="ibtn" onClick={() => setUpdateTarget(null)}>
                <span className="material-icons">close</span>
              </div>
            </div>

            <div className="section-h">Identité</div>
            <div className="form-grid">
              <div className="field">
                <label>Nom *</label>
                <input type="text" value={updateForm.name} onChange={e => setUpdateForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Achraf Hakimi" />
              </div>
              <div className="field">
                <label>Équipe *</label>
                <TeamSelect
                  teams={teams}
                  value={updateForm.teamName}
                  onChange={({ id, name }) => setUpdateForm(f => ({ ...f, teamId: id, teamName: name }))}
                />
              </div>
            </div>

            <div className="modal-divider" />
            <div className="section-h">Statistiques</div>
            <div className="form-grid">
              <div className="field">
                <label>Âge</label>
                <input type="number" min="0" value={updateForm.age} onChange={e => setUpdateForm(f => ({ ...f, age: e.target.value }))} placeholder="25" />
              </div>
              <div className="field">
                <label>Buts</label>
                <input type="number" min="0" value={updateForm.goals} onChange={e => setUpdateForm(f => ({ ...f, goals: e.target.value }))} placeholder="0" />
              </div>
              <div className="field">
                <label>Taille (m)</label>
                <input type="number" step="0.01" value={updateForm.height} onChange={e => setUpdateForm(f => ({ ...f, height: e.target.value }))} placeholder="1.82" />
              </div>
              <div className="field">
                <label>Poids (kg)</label>
                <input type="number" step="0.1" value={updateForm.weight} onChange={e => setUpdateForm(f => ({ ...f, weight: e.target.value }))} placeholder="78" />
              </div>
            </div>

            <div className="modal-divider" />
            <div className="section-h">Média</div>
            <div className="field">
              <label>URL de l'image</label>
              <input type="text" value={updateForm.imgUrl} onChange={e => setUpdateForm(f => ({ ...f, imgUrl: e.target.value }))} placeholder="https://…" />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button className="btn btn-ghost" onClick={() => setUpdateTarget(null)}>Annuler</button>
              <button className="btn btn-blue" onClick={submitUpdate} disabled={savingUpdate}>
                {savingUpdate
                  ? <><div className="tr-spin" style={{ width: 13, height: 13, border: "2px solid rgba(96,165,250,.4)", borderTopColor: "#60a5fa", borderRadius: "50%" }} />Mise à jour…</>
                  : <><span className="material-icons" style={{ fontSize: 15 }}>save</span>Enregistrer</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: DELETE ═══ */}
      {deleteTarget && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="modal-sm" style={{ maxWidth: 400 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.25)",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
            }}>
              <span className="material-icons" style={{ fontSize: 26, color: "#ef4444" }}>delete_forever</span>
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: "#fff", marginBottom: 8 }}>Supprimer ce joueur ?</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 16, lineHeight: 1.6 }}>
              Cette action est permanente et irréversible.
            </div>
            <div style={{
              background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
              borderLeft: "3px solid #ef4444", borderRadius: 10, padding: "12px 14px", marginBottom: 24,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>{deleteTarget.name}</div>
                {/* FIX: use deleteTarget.team (correct DTO field) */}
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{deleteTarget.team || "—"} · #{deleteTarget.id}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button className="btn btn-danger" onClick={confirmDelete} disabled={deletingPlayer}>
                {deletingPlayer
                  ? <><div className="tr-spin" style={{ width: 13, height: 13, border: "2px solid rgba(239,68,68,.4)", borderTopColor: "#ef4444", borderRadius: "50%" }} />Suppression…</>
                  : <><span className="material-icons" style={{ fontSize: 15 }}>delete</span>Supprimer</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: DETAIL ═══ */}
      {selected && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="modal-lg">
            <div className="modal-head">
              <div className="modal-title-row">
                <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                  {selected.urlImage
                    ? <img src={selected.urlImage} alt={selected.name} style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
                    : <div style={{ width: 48, height: 48, borderRadius: 12, background: hue(selected.name), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: "#fff", flexShrink: 0 }}>{initials(selected.name)}</div>
                  }
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: ".06em", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.name}</div>
                    {/* FIX: use selected.team (correct DTO field) */}
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 3 }}>{selected.team || "—"} · #{selected.id}</div>
                  </div>
                </div>
                <div className="ibtn" style={{ flexShrink: 0 }} onClick={() => setSelected(null)}>
                  <span className="material-icons">close</span>
                </div>
              </div>
            </div>

            <div className="modal-body">
              {loadingDetail ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 0", color: "rgba(255,255,255,.3)", fontSize: 13 }}>
                  <div className="tr-spin" style={{ width: 16, height: 16, border: "2px solid #C1272D", borderTopColor: "transparent", borderRadius: "50%" }} />
                  Chargement des détails…
                </div>
              ) : (
                <>
                  <div className="section-h">Informations générales</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 10 }}>
                    {[
                      { label: "Équipe", value: detail?.team || selected.team || "—" },
                      { label: "Âge", value: `${detail?.age || selected.age || "—"} ans` },
                      { label: "Taille", value: `${detail?.height || selected.height || "—"} m` },
                      { label: "Poids", value: `${detail?.weight || selected.weight || "—"} kg` },
                      { label: "Buts", value: detail?.goals ?? selected.goals ?? "0" },
                    ].map(({ label, value }) => (
                      <div key={label} className="info-card">
                        <div className="info-label">{label}</div>
                        <div className="info-value">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 22, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button className="btn btn-blue" style={{ fontSize: 11 }} onClick={e => { openUpdate(e, selected); setSelected(null); }}>
                      <span className="material-icons" style={{ fontSize: 14 }}>edit</span>Modifier
                    </button>
                    <button className="btn btn-danger" style={{ fontSize: 11 }} onClick={() => { setDeleteTarget(selected); setSelected(null); }}>
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
        <div className="toast" style={{
          background: toast.type === "success" ? "rgba(74,222,128,.95)" : "rgba(193,39,45,.95)",
          color: "#fff",
        }}>
          <span className="material-icons">{toast.type === "success" ? "check_circle" : "cancel"}</span>
          {toast.msg}
        </div>
      )}
    </>
  );
}