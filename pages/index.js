// pages/index.js
import { useMemo, useState } from "react";

/* ----------------------- Données & utilitaires ----------------------- */

// Tableau des tailles de kits (en mm)
const KIT_SIZES = {
  XS: { pouce: 14, index: 10, majeur: 11, annulaire: 10, auriculaire: 7 },
  S:  { pouce: 15, index: 11, majeur: 11, annulaire: 11, auriculaire: 8 },
  M:  { pouce: 16, index: 12, majeur: 13, annulaire: 12, auriculaire: 9 },
  L:  { pouce: 17, index: 13, majeur: 14, annulaire: 13, auriculaire: 10 },
  XL: { pouce: 18, index: 14, majeur: 15, annulaire: 14, auriculaire: 11 },
};

// Préréglages “idées en 1 clic”
const PRESETS = [
  {
    label: "Doux & poétique",
    shape: "amande",
    length: "moyenne",
    colors: "bleu pastel, nude rosé",
    motifs: "petites fleurs blanches, paillettes très fines",
    vibe: "léger, romantique, lumineux",
  },
  {
    label: "Glam rock",
    shape: "coffin court",
    length: "courte",
    colors: "noir mat, chrome argent",
    motifs: "french inversée fine, accents métalliques",
    vibe: "audacieux, soirée, edgy",
  },
  {
    label: "Minimal chic",
    shape: "ovale court",
    length: "courte",
    colors: "nude beige, blanc",
    motifs: "french fine, demi-lune",
    vibe: "propre, bureau, quotidien",
  },
  {
    label: "Mariée lumineuse",
    shape: "amande",
    length: "longue",
    colors: "lilas très pâle, blanc nacré",
    motifs: "micro paillettes, strass discrets",
    vibe: "élégant, photo-friendly",
  },
  {
    label: "Pastel romantique",
    shape: "amande",
    length: "moyenne",
    colors: "rose poudré, lilas, ivoire",
    motifs: "dégradé soft, fleur",
    vibe: "printemps, doux",
  },
  {
    label: "Classique nude",
    shape: "ovale",
    length: "moyenne",
    colors: "nude rosé, blanc doux",
    motifs: "french",
    vibe: "sobre, intemporel",
  },
];

// Construit le prompt IA à partir du state
function buildPrompt(state) {
  const parts = [
    "Photo réaliste d'un nuancier de press-on nails présenté sur une planche en bois clair, lumière douce studio, focus sur les tips, style e-commerce.",
    `Forme: ${state.shape || "amande"} • Longueur: ${state.length || "moyenne"} •`,
    `Couleurs: ${state.colors || "nude, blanc"} •`,
    `Motifs/déco: ${state.motifs || "french fine"} •`,
    "Pas de logos/licences; rendu propre; arrière-plan doux; prise de vue verticale.",
  ];

  if (state.vibe) parts.push(`Ambiance: ${state.vibe}`);
  return parts.join(" ");
}

/* ---------------------------- Composant UI ---------------------------- */

export default function Home() {
  // état principal du configurateur
  const [shape, setShape] = useState("amande");
  const [length, setLength] = useState("moyenne");
  const [colors, setColors] = useState("");
  const [motifs, setMotifs] = useState("");
  const [vibe, setVibe] = useState("");

  // tailles
  const [knowSize, setKnowSize] = useState(true); // true = kit prêt-à-porter, false = sur-mesure
  const [kitSize, setKitSize] = useState("XS");
  const [customLeft, setCustomLeft] = useState({ pouce: "", index: "", majeur: "", annulaire: "", auriculaire: "" });
  const [customRight, setCustomRight] = useState({ pouce: "", index: "", majeur: "", annulaire: "", auriculaire: "" });

  // notes & images
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // prompt calculé
  const stateForPrompt = useMemo(
    () => ({ shape, length, colors, motifs, vibe }),
    [shape, length, colors, motifs, vibe]
  );
  const prompt = useMemo(() => buildPrompt(stateForPrompt), [stateForPrompt]);

  // applique un preset
  function applyPreset(p) {
    setShape(p.shape || "");
    setLength(p.length || "");
    setColors(p.colors || "");
    setMotifs(p.motifs || "");
    setVibe(p.vibe || "");
  }

  // appel API → /api/generate (côté serveur)
  async function handleGenerate() {
    setLoading(true);
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          // tu peux ajuster ces paramètres si tu veux
          width: 768,
          height: 1024,
          guidance: 3,
          num_inference_steps: 4,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Erreur API");
      setImages((prev) => [data.image, ...prev]);
    } catch (e) {
      alert("Génération échouée : " + e.message);
    } finally {
      setLoading(false);
    }
  }

  // rendu d’un mini “chip” préréglage
  function PresetChip({ p }) {
    return (
      <button
        onClick={() => applyPreset(p)}
        style={styles.presetChip}
      >
        <div style={{ fontWeight: 700 }}>{p.label}</div>
        <div style={styles.presetSub}>{p.shape} • {p.length}</div>
        <div style={styles.presetSub}>{p.colors}</div>
      </button>
    );
  }

  // rendu du tableau de taille pour le kit
  function KitTable({ sizeKey }) {
    const s = KIT_SIZES[sizeKey];
    if (!s) return null;
    return (
      <div style={styles.kitTable}>
        <div style={styles.kitRow}><b>Pouce</b><span>{s.pouce} mm</span></div>
        <div style={styles.kitRow}><b>Index</b><span>{s.index} mm</span></div>
        <div style={styles.kitRow}><b>Majeur</b><span>{s.majeur} mm</span></div>
        <div style={styles.kitRow}><b>Annulaire</b><span>{s.annulaire} mm</span></div>
        <div style={styles.kitRow}><b>Auriculaire</b><span>{s.auriculaire} mm</span></div>
      </div>
    );
  }

  function renderCustomInputs(hand, values, setValues) {
    return (
      <div style={{ marginTop: 6 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{hand}</div>
        <div style={styles.customGrid}>
          {["pouce","index","majeur","annulaire","auriculaire"].map((k) => (
            <label key={k} style={styles.customCell}>
              <span style={styles.customLabel}>{k}</span>
              <input
                inputMode="numeric"
                placeholder="mm"
                value={values[k]}
                onChange={(e) => setValues({ ...values, [k]: e.target.value })}
                style={styles.input}
              />
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Bandeau titre */}
      <header style={styles.header}>
        <div style={styles.brand}>État d’Ongles</div>
        <div style={styles.subtitle}>Crée ton kit <i>Press-On</i> personnalisé</div>
      </header>

      {/* Carte principale */}
      <div style={styles.card}>
        <section style={{ marginBottom: 18 }}>
          <div style={styles.sectionTitle}>Préréglages (idées en 1 clic)</div>
          <div style={styles.presetWrap}>
            {PRESETS.map((p) => <PresetChip key={p.label} p={p} />)}
          </div>
        </section>

        {/* Choix stylistiques */}
        <section style={styles.formRow}>
          <div style={styles.label}>Forme</div>
          <input value={shape} onChange={(e) => setShape(e.target.value)} style={styles.input} />
        </section>
        <section style={styles.formRow}>
          <div style={styles.label}>Longueur</div>
          <input value={length} onChange={(e) => setLength(e.target.value)} style={styles.input} />
        </section>
        <section style={styles.formRow}>
          <div style={styles.label}>Couleurs</div>
          <input value={colors} onChange={(e) => setColors(e.target.value)} placeholder="ex: nude rosé, blanc doux" style={styles.input} />
        </section>
        <section style={styles.formRow}>
          <div style={styles.label}>Motifs / déco</div>
          <input value={motifs} onChange={(e) => setMotifs(e.target.value)} placeholder="ex: french fine, fleur..." style={styles.input} />
        </section>
        <section style={styles.formRow}>
          <div style={styles.label}>Ambiance (facultatif)</div>
          <input value={vibe} onChange={(e) => setVibe(e.target.value)} placeholder="ex: romantique, lumineux..." style={styles.input} />
        </section>

        {/* Prompt aperçu */}
        <section style={{ marginTop: 18 }}>
          <div style={styles.sectionTitle}>Prompt généré (aperçu)</div>
          <textarea value={prompt} readOnly rows={5} style={styles.textarea} />
        </section>

        {/* Tailles */}
        <section style={{ marginTop: 18 }}>
          <div style={styles.sectionTitle}>Tailles du kit</div>

          <label style={styles.radioLine}>
            <input
              type="radio"
              checked={knowSize}
              onChange={() => setKnowSize(true)}
              style={styles.radio}
            />
            <span>Je connais ma taille (kit prêt à porter)</span>
          </label>

          <label style={styles.radioLine}>
            <input
              type="radio"
              checked={!knowSize}
              onChange={() => setKnowSize(false)}
              style={styles.radio}
            />
            <span>Je ne connais pas / 100% sur-mesure</span>
          </label>

          {knowSize ? (
            <>
              <div style={styles.sizeRow}>
                {["XS","S","M","L","XL"].map((k) => (
                  <button
                    key={k}
                    onClick={() => setKitSize(k)}
                    style={{
                      ...styles.sizeBtn,
                      ...(kitSize === k ? styles.sizeBtnActive : {}),
                    }}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <KitTable sizeKey={kitSize} />
              <div style={styles.hint}>
                <b>Astuce mesure :</b> mesure la largeur au point le plus large de l’ongle (en mm).
                Entre deux tailles, choisis la plus petite pour une meilleure tenue.
                XS et XL disponibles sur commande.
              </div>
            </>
          ) : (
            <>
              {renderCustomInputs("Main gauche", customLeft, setCustomLeft)}
              {renderCustomInputs("Main droite", customRight, setCustomRight)}
              <div style={styles.hint}>
                <b>Comment mesurer ?</b> colle un morceau de scotch sur l’ongle, trace les bords,
                colle sur une règle et lis la largeur en mm. Prends la valeur la plus large.
              </div>
            </>
          )}
        </section>

        {/* Notes */}
        <section style={{ marginTop: 18 }}>
          <div style={styles.sectionTitle}>Notes / précisions</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Habitudes, longueur max, allergies, etc."
            rows={4}
            style={styles.textarea}
          />
        </section>

        {/* Actions */}
        <section style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={handleGenerate} disabled={loading} style={styles.primaryBtn}>
            {loading ? "Génération en cours..." : "Générer un visuel IA"}
          </button>
          {/* Tu peux remettre ici tes boutons “PDF” et “Envoyer par e-mail” si besoin */}
        </section>
      </div>

      {/* Galerie */}
      {images.length > 0 && (
        <div style={{ ...styles.card, marginTop: 16 }}>
          <div style={styles.sectionTitle}>Aperçus générés</div>
          <div style={styles.gallery}>
            {images.map((src, i) => (
              <img key={i} src={src} alt={`gen-${i}`} style={styles.galleryImg} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Styles ------------------------------- */

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #FFF6F8 0%, #F9F6FF 60%, #F5FBFF 100%)", // doux & mobile-friendly
    padding: "16px 12px 80px",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
    color: "#2a2a2a",
  },
  header: { margin: "4px auto 12px", maxWidth: 820 },
  brand: {
    fontWeight: 800,
    fontSize: 20,
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: 800,
    lineHeight: 1.1,
  },
  card: {
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(6px)",
    border: "1px solid #f0e9f0",
    borderRadius: 18,
    padding: 14,
    maxWidth: 820,
    margin: "0 auto",
    boxShadow: "0 6px 24px rgba(60, 30, 100, 0.08)",
  },
  sectionTitle: { fontWeight: 800, marginBottom: 8 },
  presetWrap: { display: "grid", gap: 8, gridTemplateColumns: "repeat(2, 1fr)" },
  presetChip: {
    textAlign: "left",
    padding: 10,
    borderRadius: 14,
    border: "1px solid #eee3ef",
    background: "#fff",
  },
  presetSub: { opacity: 0.7, fontSize: 12, marginTop: 2 },
  formRow: { marginTop: 10 },
  label: { fontSize: 13, opacity: 0.7, marginBottom: 4 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e8dfea",
    background: "#fff",
    outline: "none",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e8dfea",
    background: "#fff",
    outline: "none",
  },
  radioLine: { display: "flex", alignItems: "center", gap: 8, margin: "6px 0" },
  radio: { width: 18, height: 18 },
  sizeRow: { display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" },
  sizeBtn: {
    padding: "10px 16px",
    borderRadius: 16,
    border: "1px solid #e6d7ea",
    background: "#fff",
    fontWeight: 700,
  },
  sizeBtnActive: { background: "#f4e6f0" },
  kitTable: {
    marginTop: 10,
    border: "1px solid #efe4f0",
    borderRadius: 14,
    overflow: "hidden",
  },
  kitRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 12px",
    borderTop: "1px solid #f4ecf4",
  },
  hint: { marginTop: 8, fontSize: 13, opacity: 0.8 },
  customGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 8,
  },
  customCell: { display: "flex", flexDirection: "column", gap: 4 },
  customLabel: { fontSize: 12, opacity: 0.7 },
  primaryBtn: {
    padding: "12px 16px",
    borderRadius: 14,
    background: "#e7b2c2",
    color: "#222",
    border: "1px solid #e1a9bb",
    fontWeight: 800,
  },
  gallery: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 8,
    marginTop: 10,
  },
  galleryImg: {
    width: "100%",
    borderRadius: 14,
    border: "1px solid #f0e6f1",
    display: "block",
  },
};
