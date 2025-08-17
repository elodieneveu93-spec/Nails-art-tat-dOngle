// pages/index.js
import { useState, useMemo, useRef } from "react";

// --- visuels de secours (demo gratuite)
const WOOD =
  "https://images.unsplash.com/photo-1541080477408-659cf03d4d92?q=80&w=1600&auto=format&fit=crop";
const PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1604654894693-7d829b6a48bf?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1604654894916-7f7b39fbf1f1?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1604654894647-9f88fec8a0e2?q=80&w=1200&auto=format&fit=crop",
];

// --- tableaux tailles (mm) pour kits prêts à porter
const READY_SIZES = {
  XS: { L: [0,0,0,0,0], R: [0,0,0,0,0] }, // optionnel si tu veux autoriser XS
  S:  { L: [15,11,11,11, 8], R: [15,11,11,11, 8] },
  M:  { L: [16,12,13,12, 9], R: [16,12,13,12, 9] },
  L:  { L: [17,13,14,13,10], R: [17,13,14,13,10] },
  XL: { L: [18,14,15,14,11], R: [18,14,15,14,11] },
};

// --- préréglages (petites cartes d'idées)
const PRESETS = [
  { label: "Doux & poétique", shape: "amande", length: "moyenne", colors: "bleu pastel, nude rosé", motifs: "petites fleurs blanches, paillettes très fines", vibe: "léger, romantique, lumineux" },
  { label: "Glam rock", shape: "coffin court", length: "courte", colors: "noir mat, chrome argent", motifs: "french inversée fine, accents métalliques", vibe: "audacieux, soirée, edgy" },
  { label: "Minimal chic", shape: "ovale court", length: "courte", colors: "nude beige, blanc", motifs: "french fine, demi-lune", vibe: "propre, bureau, quotidien" },
  { label: "Mariée lumineuse", shape: "amande", length: "longue", colors: "lilas très pâle, blanc nacré", motifs: "délicates paillettes, micro perles", vibe: "élégant, photo-ready" },
  { label: "Pastel romantique", shape: "amande", length: "moyenne", colors: "rose poudré, lilas, ivoire", motifs: "dégradé doux, fleurs", vibe: "printemps, tendre" },
  { label: "Classique nude", shape: "ovale", length: "moyenne", colors: "nude rosé, blanc doux", motifs: "french subtile", vibe: "sobre, intemporel" },
];

export default function Home() {
  // --- état principal
  const [shape, setShape] = useState("amande");
  const [length, setLength] = useState("moyenne");
  const [colors, setColors] = useState("bleu roi et jaune");
  const [motifs, setMotifs] = useState("fleur");
  const [vibe, setVibe] = useState("");

  const [premium, setPremium] = useState(true); // coche = IA, décoche = démo

  // tailles des kits
  const [knowSizes, setKnowSizes] = useState(true);     // true = prêt-à-porter
  const [kitSize, setKitSize] = useState("M");          // XS,S,M,L,XL
  const [sizesLeft, setSizesLeft]   = useState(["","","","",""]);
  const [sizesRight, setSizesRight] = useState(["","","","",""]);

  const [notes, setNotes] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const printableRef = useRef(null);

  // quand on choisit une taille “kit”, on affiche les mesures qui correspondent
  const shownKitMeasures = useMemo(() => {
    const m = READY_SIZES[kitSize];
    if (!m) return null;
    return m;
  }, [kitSize]);

  // si l’utilisateur choisit "je connais ma taille", on remplit les champs pour info (en lecture)
  const isCustom = !knowSizes;

  // --- fabrique le texte prompt pour l’IA
  function buildPrompt() {
    const base =
      `Photo réaliste d'un nuancier de press-on nails présenté sur une planche en bois clair, ` +
      `lumière douce studio, focus sur les tips, style e-commerce.`;
    const style =
      `Forme: ${shape} • Longueur: ${length} • ` +
      `Couleurs: ${colors} • Motifs/déco: ${motifs}` +
      (vibe ? ` • Ambiance: ${vibe}` : "");
    const safe = `Pas de logos/licences; rendu propre, net.`;

    return `${base}\n${style}\n${safe}`;
  }

  // --- génération IA (ou placeholders si premium décoché / erreur)
  async function generate() {
    setLoading(true);
    setImages([]);
    try {
      const p = buildPrompt();
      if (!premium) {
        setImages(PLACEHOLDERS);
        setToast("Mode démo — images d’inspiration");
      } else {
        const r = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: p, num: 4 }),
        });
        const j = await r.json();
        if (j.ok) {
          setImages(j.images);
          setToast("Images générées via IA ✔︎");
        } else {
          setImages(PLACEHOLDERS);
          setToast("IA indisponible — démo affichée");
        }
      }
    } catch (e) {
      setImages(PLACEHOLDERS);
      setToast("Erreur — démo affichée");
    } finally {
      setLoading(false);
      setTimeout(() => setToast(""), 3500);
    }
  }

  // --- e-mail : ouvre le client mail avec toutes les infos + 1ère image en lien
  function sendEmail() {
    const subject = encodeURIComponent("Brief Press-On – État d’Ongles");
    const p = buildPrompt();
    const kit =
      knowSizes
        ? `Kit prêt-à-porter : ${kitSize}\n` +
          (shownKitMeasures
            ? `Tailles (mm) — Gauche [Pouce,Index,Majeur,Annulaire,Auriculaire] : ${shownKitMeasures.L.join(", ")}\n` +
              `Droite [Pouce,Index,Majeur,Annulaire,Auriculaire] : ${shownKitMeasures.R.join(", ")}\n`
            : "")
        : `100% sur-mesure (mm) :\n` +
          `Gauche [${sizesLeft.join(", ")}]\nDroite [${sizesRight.join(", ")}]\n`;

    const body =
      encodeURIComponent(
        `Bonjour,\n\nVoici mon brief :\n\n` +
        `${p}\n\n` +
        `Tailles du kit :\n${kit}\n` +
        (notes ? `Notes/précisions :\n${notes}\n\n` : "\n") +
        (images[0] ? `Aperçu visuel : (copiez-collez dans le navigateur si besoin)\n${images[0]}\n\n` : "") +
        `— Envoyé depuis le simulateur État d’Ongles`
      );

    window.location.href = `mailto:etatdongles@example.com?subject=${subject}&body=${body}`;
  }

  // --- export "PDF" (impression) : ouvre la boîte d’impression du contenu
  function exportPrint() {
    if (!printableRef.current) return;
    const html = printableRef.current.innerHTML;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>Brief État d’Ongles</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body{ font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; 
                  padding: 24px; line-height:1.45; color:#222; }
            h1{ font-size:20px; margin:0 0 12px; }
            h2{ font-size:16px; margin:16px 0 6px; }
            .card{ border:1px solid #eee; border-radius:12px; padding:16px; margin-top:10px; }
            .row{ display:flex; gap:8px; }
            .pill{ padding:6px 10px; border-radius:999px; background:#f3e7eb; }
            img{ max-width:100%; border-radius:12px; margin-top:8px; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
  }

  // --- helpers UI
  const bg = "#0d0d0f";
  const card = "#16161a";
  const soft = "#f5e2e7"; // rose poudré
  const textSoft = "#6b7280";

  function Pill({ children, active, onClick }) {
    return (
      <button
        onClick={onClick}
        style={{
          padding: "10px 14px",
          borderRadius: 14,
          border: `1px solid ${active ? "#e5b8c7" : "#2a2a2f"}`,
          background: active ? "#f0d2db" : "#1b1b20",
          color: active ? "#251a1e" : "#d8d8df",
          fontWeight: 600,
        }}
      >
        {children}
      </button>
    );
  }

  // --- rendu
  return (
    <div style={{ background: bg, minHeight: "100vh", color: "#fff", padding: 16 }}>
      {/* header */}
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, margin: "8px 0 6px", fontWeight: 800 }}>
          État d’Ongles — configurateur Press-On
        </h1>
        <p style={{ color: textSoft, marginBottom: 18 }}>Prototype mobile-first</p>

        {/* grille principale */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 16,
          }}
        >
          {/* Colonne gauche : préréglages + formulaire */}
          <div style={{ background: card, borderRadius: 16, padding: 16 }}>
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>Préréglages (idées en 1 clic)</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setShape(p.shape);
                    setLength(p.length);
                    setColors(p.colors);
                    setMotifs(p.motifs);
                    setVibe(p.vibe);
                  }}
                  style={{
                    textAlign: "left",
                    background: "#1b1b20",
                    border: "1px solid #2a2a2f",
                    borderRadius: 14,
                    padding: 12,
                    color: "#e7e7ee",
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>{p.label}</div>
                  <div style={{ color: textSoft, fontSize: 13 }}>
                    {p.shape} • {p.length}
                    <br /> {p.colors}
                  </div>
                </button>
              ))}
            </div>

            {/* champs style */}
            <div style={{ display: "grid", gap: 12 }}>
              <Field label="Forme">
                <input value={shape} onChange={(e) => setShape(e.target.value)} style={inputStyle()} />
              </Field>
              <Field label="Longueur">
                <input value={length} onChange={(e) => setLength(e.target.value)} style={inputStyle()} />
              </Field>
              <Field label="Couleurs">
                <input value={colors} onChange={(e) => setColors(e.target.value)} style={inputStyle()} />
              </Field>
              <Field label="Motifs / déco">
                <input value={motifs} onChange={(e) => setMotifs(e.target.value)} style={inputStyle()} />
              </Field>
              <Field label="Ambiance (optionnel)">
                <input value={vibe} onChange={(e) => setVibe(e.target.value)} style={inputStyle()} />
              </Field>
            </div>

            {/* prompt aperçu */}
            <div style={{ marginTop: 14 }}>
              <h3 style={{ marginBottom: 6, fontSize: 16, color: soft }}>Prompt généré (aperçu)</h3>
              <textarea
                value={buildPrompt()}
                readOnly
                rows={5}
                style={{
                  width: "100%",
                  background: "#121216",
                  color: "#eaeaf0",
                  border: "1px solid #2a2a2f",
                  borderRadius: 12,
                  padding: 12,
                }}
              />
            </div>
          </div>

          {/* Colonne droite : visuels + actions */}
          <div style={{ background: card, borderRadius: 16, padding: 16 }}>
            {/* bandeau bois */}
            <div
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.55)), url(${WOOD})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: 14,
                padding: 16,
                minHeight: 120,
                display: "flex",
                alignItems: "end",
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 20 }}>Galerie</div>
                <div style={{ color: textSoft, fontSize: 13 }}>
                  {premium ? "IA active (FLUX.1-dev)" : "Mode démo (images d’inspiration)"}
                </div>
              </div>
            </div>

            {/* boutons actions */}
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button onClick={generate} disabled={loading}
                style={btnPrimary(loading ? "Génération…" : "Générer des visuels")}>
                {loading ? "Génération…" : "Générer des visuels"}
              </button>
              <label style={toggleWrap()}>
                <input type="checkbox" checked={premium} onChange={(e)=>setPremium(e.target.checked)} />
                <span style={{ marginLeft: 8 }}>Qualité premium (IA)</span>
              </label>
            </div>

            {/* images */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
              {(images.length ? images : PLACEHOLDERS).map((src, i) => (
                <div key={i}
                  style={{ background: "#111", borderRadius: 12, overflow: "hidden", border: "1px solid #2a2a2f" }}>
                  <img src={src} alt={`visuel-${i}`} style={{ width: "100%", display: "block" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Tailles du kit */}
          <div style={{ background: card, borderRadius: 16, padding: 16 }}>
            <h2 style={{ fontSize: 18, marginBottom: 10 }}>Tailles du kit</h2>

            <div style={{ display: "grid", gap: 10 }}>
              <label style={radioRow()}>
                <input
                  type="radio"
                  checked={knowSizes}
                  onChange={() => setKnowSizes(true)}
                />
                <span>Je connais ma taille (kit prêt à porter)</span>
              </label>
              <label style={radioRow()}>
                <input
                  type="radio"
                  checked={!knowSizes}
                  onChange={() => setKnowSizes(false)}
                />
                <span>Je ne connais pas / 100% sur-mesure</span>
              </label>
            </div>

            {/* prêt-à-porter */}
            {knowSizes && (
              <>
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {["XS", "S", "M", "L", "XL"].map(s => (
                    <Pill key={s} active={kitSize === s} onClick={() => setKitSize(s)}>{s}</Pill>
                  ))}
                </div>

                {shownKitMeasures && kitSize !== "XS" && (
                  <div style={{ marginTop: 10, color: textSoft, fontSize: 14 }}>
                    <div style={{ marginBottom: 6, color: "#fff" }}>Tailles du kit {kitSize} (mm)</div>
                    <table style={table()}>
                      <thead>
                        <tr>
                          <th> </th><th>Pouce</th><th>Index</th><th>Majeur</th><th>Annulaire</th><th>Auriculaire</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Gauche</td>
                          {shownKitMeasures.L.map((v, i)=>(<td key={i}>{v}</td>))}
                        </tr>
                        <tr>
                          <td>Droite</td>
                          {shownKitMeasures.R.map((v, i)=>(<td key={i}>{v}</td>))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <p style={{ marginTop: 8, color: textSoft }}>
                  <b>Astuce mesure :</b> mesure la largeur au point le plus large de l’ongle (en mm).
                  Entre deux tailles, choisis la plus petite pour une meilleure tenue. XS et XL dispo sur commande.
                </p>
              </>
            )}

            {/* sur-mesure */}
            {!knowSizes && (
              <div style={{ marginTop: 12 }}>
                <div style={{ color: textSoft, marginBottom: 6 }}>
                  Renseigne les largeurs (en mm) de chaque doigt — main gauche et main droite.
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  <RowSizes
                    title="Main gauche: [Pouce, Index, Majeur, Annulaire, Auriculaire]"
                    values={sizesLeft}
                    onChange={(arr)=>setSizesLeft(arr)}
                  />
                  <RowSizes
                    title="Main droite: [Pouce, Index, Majeur, Annulaire, Auriculaire]"
                    values={sizesRight}
                    onChange={(arr)=>setSizesRight(arr)}
                  />
                </div>
                <small style={{ color: textSoft }}>
                  Astuce : place un ruban adhésif sur l’ongle, marque les bords, colle sur une règle et lis la largeur en mm.
                </small>
              </div>
            )}
          </div>

          {/* Notes + actions finales */}
          <div style={{ background: card, borderRadius: 16, padding: 16 }}>
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>Notes / précisions</h2>
            <textarea
              value={notes}
              onChange={(e)=>setNotes(e.target.value)}
              rows={4}
              placeholder="Habitudes, longueur max, allergies, etc."
              style={{ width: "100%", background: "#121216", color: "#eaeaf0",
                       border: "1px solid #2a2a2f", borderRadius: 12, padding: 12 }}
            />

            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button onClick={exportPrint} style={btnGhost()}>Exporter (imprimer / PDF)</button>
              <button onClick={sendEmail} style={btnPrimary()}>Envoyer par e-mail</button>
            </div>
          </div>

          {/* zone imprimable */}
          <div ref={printableRef} style={{ display: "none" }}>
            <h1>Brief État d’Ongles</h1>
            <div className="card">
              <h2>Style</h2>
              <div className="row">
                <span className="pill">Forme : {shape}</span>
                <span className="pill">Longueur : {length}</span>
                <span className="pill">Couleurs : {colors}</span>
                <span className="pill">Motifs : {motifs}</span>
              </div>
              {vibe ? <div className="pill">Ambiance : {vibe}</div> : null}
              <h2>Prompt</h2>
              <div className="card">{buildPrompt()}</div>
              <h2>Tailles</h2>
              {knowSizes ? (
                <div>
                  <div>Kit prêt-à-porter : {kitSize}</div>
                  {shownKitMeasures && kitSize !== "XS" && (
                    <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", marginTop: 8 }}>
                      <thead><tr><th></th><th>Pouce</th><th>Index</th><th>Majeur</th><th>Annulaire</th><th>Auriculaire</th></tr></thead>
                      <tbody>
                        <tr><td>Gauche</td>{shownKitMeasures.L.map((v,i)=>(<td key={i}>{v}</td>))}</tr>
                        <tr><td>Droite</td>{shownKitMeasures.R.map((v,i)=>(<td key={i}>{v}</td>))}</tr>
                      </tbody>
                    </table>
                  )}
                </div>
              ) : (
                <div>
                  <div>100% sur-mesure</div>
                  <div>Gauche : {sizesLeft.join(", ")}</div>
                  <div>Droite : {sizesRight.join(", ")}</div>
                </div>
              )}
              {notes ? (<><h2>Notes</h2><div className="card">{notes}</div></>) : null}
              {(images[0] || PLACEHOLDERS[0]) ? (
                <>
                  <h2>Aperçu</h2>
                  <img src={images[0] || PLACEHOLDERS[0]} alt="visuel" />
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* toast */}
        {toast && (
          <div style={{
            position: "fixed", left: 12, right: 12, bottom: 16, zIndex: 50,
            background: "#1b1b20", border: "1px solid #2a2a2f", color:"#e8e8ef",
            padding: "10px 12px", borderRadius: 12, textAlign: "center"
          }}>{toast}</div>
        )}
      </div>
    </div>
  );

  // --- petits composants/styles
  function Field({ label, children }) {
    return (
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, color: soft }}>{label}</span>
        {children}
      </label>
    );
  }
  function inputStyle() {
    return {
      width: "100%",
      background: "#121216",
      color: "#eaeaf0",
      border: "1px solid #2a2a2f",
      borderRadius: 12,
      padding: "10px 12px",
    };
  }
  function btnPrimary(text) {
    return {
      background: "#e9bacb",
      color: "#26161c",
      border: "none",
      borderRadius: 12,
      padding: "10px 14px",
      fontWeight: 800,
    };
  }
  function btnGhost() {
    return {
      background: "#1b1b20",
      color: "#e8e8ef",
      border: "1px solid #2a2a2f",
      borderRadius: 12,
      padding: "10px 14px",
      fontWeight: 700,
    };
  }
  function radioRow() {
    return { display: "flex", alignItems: "center", gap: 10, color: "#e7e7ee" };
  }
  function toggleWrap() {
    return { display: "flex", alignItems: "center", gap: 8, color: "#e7e7ee" };
  }
  function table() {
    return {
      width: "100%",
      borderCollapse: "collapse",
      background: "#111",
      borderRadius: 10,
      overflow: "hidden",
      border: "1px solid #2a2a2f",
    };
  }
}

function RowSizes({ title, values, onChange }) {
  function setIdx(i, v) {
    const a = [...values];
    a[i] = v.replace(/[^\d]/g, ""); // garde seulement chiffres
    onChange(a);
  }
  const labels = ["Pouce","Index","Majeur","Annulaire","Auriculaire"];
  return (
    <div>
      <div style={{ marginBottom: 6, color: "#f5e2e7" }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
        {values.map((v, i)=>(
          <input key={i} inputMode="numeric" value={v} onChange={(e)=>setIdx(i,e.target.value)}
            placeholder={labels[i]} style={{
              width: "100%", background: "#121216", color: "#eaeaf0",
              border: "1px solid #2a2a2f", borderRadius: 12, padding: "10px 12px", textAlign:"center"
            }}/>
        ))}
      </div>
    </div>
  );
    }
