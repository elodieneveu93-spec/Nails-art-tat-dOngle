// pages/index.js
import { useState, useMemo } from "react";

/* -------------------------------------------------------
   Données utiles
--------------------------------------------------------*/

// Ta marque en haut
const BRAND = "État d’Ongles";

// Valeurs XS–XL (en mm) issues de ton tableau
const KIT_SIZES = {
  XS: { pouce: 14, index: 10, majeur: 11, annulaire: 10, auriculaire: 7 },
  S:  { pouce: 15, index: 11, majeur: 11, annulaire: 11, auriculaire: 8 },
  M:  { pouce: 16, index: 12, majeur: 13, annulaire: 12, auriculaire: 9 },
  L:  { pouce: 17, index: 13, majeur: 14, annulaire: 13, auriculaire: 10 },
  XL: { pouce: 18, index: 14, majeur: 15, annulaire: 14, auriculaire: 11 },
};

const FINGERS = ["pouce", "index", "majeur", "annulaire", "auriculaire"];

/* -------------------------------------------------------
   Page
--------------------------------------------------------*/

export default function Home() {
  // ---- État principal
  const [shape, setShape] = useState("ovale");
  const [length, setLength] = useState("courte");
  const [colors, setColors] = useState("bleu roi, jaune");
  const [motifs, setMotifs] = useState("fleur");
  const [vibe, setVibe] = useState("propre, e-commerce");

  // Tailles : mode “je connais ma taille” ou “sur-mesure”
  const [knowSizes, setKnowSizes] = useState(true);
  const [kitSizeChoice, setKitSizeChoice] = useState("XS");
  const [customLeft, setCustomLeft] = useState({ pouce: "", index: "", majeur: "", annulaire: "", auriculaire: "" });
  const [customRight, setCustomRight] = useState({ pouce: "", index: "", majeur: "", annulaire: "", auriculaire: "" });

  // Notes libres
  const [notes, setNotes] = useState("");

  // Images générées (démo)
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---- Texte “prompt” affiché pour transparence
  const prompt = useMemo(() => {
    return [
      `Photo réaliste d'un nuancier de press-on nails sur planche bois clair, lumière douce studio, focus sur les tips, style e-commerce.`,
      `Forme: ${cap(shape)} • Longueur: ${cap(length)} •`,
      `Couleurs: ${colors} • Motifs/déco: ${cap(motifs)} • Ambiance: ${vibe}.`,
      `Pas de logos/licences; rendu propre.`
    ].join(" ");
  }, [shape, length, colors, motifs, vibe]);

  /* -------------------------------------------------------
     Actions
  --------------------------------------------------------*/

  // Démo : appelle /api/generate et reçoit 3 images
  async function handleGenerate() {
    try {
      setLoading(true);
      const out = [];
      for (let i = 0; i < 3; i++) {
        const r = await fetch("/api/generate", { method: "POST" });
        if (!r.ok) throw new Error("L’API /api/generate a échoué.");
        const blob = await r.blob(); // image binaire
        out.push(URL.createObjectURL(blob)); // URL locale pour <img>
      }
      setImages(out);
    } catch (e) {
      alert("Génération échouée : " + e.message);
    } finally {
      setLoading(false);
    }
  }

  // Prépare un mailto avec toutes les infos
  function handleEmail() {
    const subject = encodeURIComponent(`Brief Press-On – ${BRAND}`);
    const bodyLines = [];

    bodyLines.push(`💅 ${BRAND} — Brief du kit`);
    bodyLines.push("");
    bodyLines.push(`Forme: ${shape}`);
    bodyLines.push(`Longueur: ${length}`);
    bodyLines.push(`Couleurs: ${colors}`);
    bodyLines.push(`Motifs/déco: ${motifs}`);
    bodyLines.push(`Ambiance: ${vibe}`);
    bodyLines.push("");

    if (knowSizes) {
      bodyLines.push(`Tailles du kit prêt-à-porter: ${kitSizeChoice}`);
      const k = KIT_SIZES[kitSizeChoice];
      bodyLines.push(`(mm) Pouce:${k.pouce}, Index:${k.index}, Majeur:${k.majeur}, Annulaire:${k.annulaire}, Auriculaire:${k.auriculaire}`);
    } else {
      bodyLines.push("Tailles sur-mesure (mm) :");
      bodyLines.push(`Main gauche → Pouce:${customLeft.pouce}, Index:${customLeft.index}, Majeur:${customLeft.majeur}, Annulaire:${customLeft.annulaire}, Auriculaire:${customLeft.auriculaire}`);
      bodyLines.push(`Main droite → Pouce:${customRight.pouce}, Index:${customRight.index}, Majeur:${customRight.majeur}, Annulaire:${customRight.annulaire}, Auriculaire:${customRight.auriculaire}`);
    }

    if (notes.trim()) {
      bodyLines.push("");
      bodyLines.push("Notes / précisions :");
      bodyLines.push(notes.trim());
    }

    bodyLines.push("");
    bodyLines.push("Aperçu prompt :");
    bodyLines.push(prompt);
    bodyLines.push("");
    bodyLines.push("(Les visuels de démo sont visibles sur la page ; ils ne peuvent pas être joints via e-mail automatiquement.)");

    const body = encodeURIComponent(bodyLines.join("\n"));
    // 👉 change l’adresse e-mail ci-dessous !
    window.location.href = `mailto:bonjour@etatdongles.fr?subject=${subject}&body=${body}`;
  }

  /* -------------------------------------------------------
     Rendu
  --------------------------------------------------------*/

  return (
    <div style={s.page}>
      {/* Bandeau marque */}
      <header style={s.header}>
        <div style={s.brand}>{BRAND}</div>
        <div style={s.tagline}>Crée ton kit <em>Press-On</em> personnalisé</div>
      </header>

      <main style={s.main}>

        {/* SECTION STYLES */}
        <section style={s.card}>
          <h2 style={s.h2}>Style & couleurs</h2>

          <div style={s.row}>
            <label style={s.label}>Forme</label>
            <select value={shape} onChange={e=>setShape(e.target.value)} style={s.input}>
              <option value="ovale">ovale</option>
              <option value="amande">amande</option>
              <option value="coffin court">coffin court</option>
              <option value="stiletto">stiletto</option>
            </select>
          </div>

          <div style={s.row}>
            <label style={s.label}>Longueur</label>
            <select value={length} onChange={e=>setLength(e.target.value)} style={s.input}>
              <option value="courte">courte</option>
              <option value="moyenne">moyenne</option>
              <option value="longue">longue</option>
            </select>
          </div>

          <div style={s.row}>
            <label style={s.label}>Couleurs (libre)</label>
            <input value={colors} onChange={e=>setColors(e.target.value)} placeholder="ex: nude rosé, lilas pâle, blanc nacré" style={s.input}/>
          </div>

          <div style={s.row}>
            <label style={s.label}>Motifs / déco</label>
            <input value={motifs} onChange={e=>setMotifs(e.target.value)} placeholder="ex: french fine, fleurs, paillettes fines" style={s.input}/>
          </div>

          <div style={s.row}>
            <label style={s.label}>Ambiance / vibe</label>
            <input value={vibe} onChange={e=>setVibe(e.target.value)} placeholder="ex: propre, e-commerce, lumineux" style={s.input}/>
          </div>
        </section>

        {/* SECTION PROMPT */}
        <section style={s.card}>
          <h2 style={s.h2}>Prompt généré (aperçu)</h2>
          <textarea value={prompt} readOnly rows={5} style={s.textarea}/>
        </section>

        {/* SECTION TAILLES */}
        <section style={s.card}>
          <h2 style={s.h2}>Tailles du kit</h2>

          <div style={{...s.row, alignItems:"center", gap:12}}>
            <label style={s.radio}>
              <input
                type="radio"
                checked={knowSizes}
                onChange={()=>setKnowSizes(true)}
              />
              <span>Je connais ma taille (kit prêt à porter)</span>
            </label>
          </div>

          <div style={{...s.row, alignItems:"center", gap:12}}>
            <label style={s.radio}>
              <input
                type="radio"
                checked={!knowSizes}
                onChange={()=>setKnowSizes(false)}
              />
              <span>Je ne connais pas / 100% sur-mesure</span>
            </label>
          </div>

          {knowSizes ? (
            <>
              <div style={s.kitRow}>
                {["XS","S","M","L","XL"].map(k => (
                  <button
                    key={k}
                    onClick={()=>setKitSizeChoice(k)}
                    style={{...s.kitBtn, ...(kitSizeChoice===k?s.kitBtnActive:{})}}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <div style={s.hintBox}>
                <b>Astuce mesure</b> : mesure la largeur au point le plus large de l’ongle (en mm). Entre deux tailles, choisis la plus
                petite pour une meilleure tenue. XS et XL disponibles sur commande.
              </div>

              {/* tableau lecture seule des tailles */}
              <div style={s.sizeTable}>
                {FINGERS.map((f,i)=>(
                  <div key={f} style={s.sizeRow}>
                    <div style={s.sizeCellLeft}>{cap(f)}</div>
                    <div style={s.sizeCellRight}>{KIT_SIZES[kitSizeChoice][f]} mm</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={s.hintBox}>
                <b>Comment mesurer ?</b> Place un ruban millimétré (ou papier + règle) sur la partie la plus large de l’ongle, note la
                largeur en mm. Fais chaque doigt pour les deux mains.
              </div>

              <div style={s.flexCols}>
                <div style={s.flexCol}>
                  <h4 style={s.h4}>Main gauche</h4>
                  {FINGERS.map((f)=>(
                    <div style={s.row} key={"L"+f}>
                      <label style={s.label}>{cap(f)}</label>
                      <input
                        style={s.input}
                        inputMode="numeric"
                        placeholder="mm"
                        value={customLeft[f]}
                        onChange={e=>setCustomLeft({...customLeft, [f]: e.target.value})}
                      />
                    </div>
                  ))}
                </div>

                <div style={s.flexCol}>
                  <h4 style={s.h4}>Main droite</h4>
                  {FINGERS.map((f)=>(
                    <div style={s.row} key={"R"+f}>
                      <label style={s.label}>{cap(f)}</label>
                      <input
                        style={s.input}
                        inputMode="numeric"
                        placeholder="mm"
                        value={customRight[f]}
                        onChange={e=>setCustomRight({...customRight, [f]: e.target.value})}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        {/* NOTES + ACTIONS */}
        <section style={s.card}>
          <h2 style={s.h2}>Notes / précisions</h2>
          <textarea
            style={s.textarea}
            placeholder="Habitudes, longueur max, allergies, etc."
            rows={5}
            value={notes}
            onChange={e=>setNotes(e.target.value)}
          />

          <div style={s.actions}>
            <button onClick={handleGenerate} disabled={loading} style={s.primary}>
              {loading ? "Je prépare des visuels…" : "Générer des visuels (démo)"}
            </button>
            <button onClick={handleEmail} style={s.secondary}>Envoyer par e-mail</button>
          </div>
        </section>

        {/* GALERIE */}
        {images.length > 0 && (
          <section style={s.card}>
            <h2 style={s.h2}>Visuels de démo</h2>
            <div style={s.gallery}>
              {images.map((src, i)=>(
                <img key={i} src={src} alt={`demo-${i}`} style={s.img}/>
              ))}
            </div>
          </section>
        )}

        <footer style={s.footer}>
          Prototype — pas d’IA en temps réel (images de démonstration).
        </footer>
      </main>
    </div>
  );
}

/* -------------------------------------------------------
   Helpers & styles
--------------------------------------------------------*/

function cap(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const softBg = "#fff7fa";      // rose poudré très léger
const softCard = "rgba(255,255,255,0.85)";
const softText = "#3a2e2f";     // brun doux
const accent = "#d88aa1";       // vieux rose
const accentDark = "#c1738d";
const border = "#edd7de";

const s = {
  page: {
    minHeight: "100vh",
    background: `linear-gradient(180deg, ${softBg}, #ffffff)`,
    color: softText,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  header: {
    padding: "20px 16px 8px",
    textAlign: "center",
  },
  brand: {
    fontWeight: 800,
    fontSize: 22,
    letterSpacing: 0.3,
  },
  tagline: {
    opacity: 0.8,
    marginTop: 6,
  },
  main: {
    maxWidth: 560,
    margin: "0 auto",
    padding: 16,
  },
  card: {
    background: softCard,
    border: `1px solid ${border}`,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
    backdropFilter: "blur(4px)",
  },
  h2: { margin: "0 0 10px 0", fontSize: 18 },
  h4: { margin: "4px 0 8px 0", fontSize: 14, opacity: 0.8 },
  row: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  label: { width: 110, fontSize: 14, opacity: 0.9 },
  input: {
    flex: 1,
    border: `1px solid ${border}`,
    borderRadius: 10,
    padding: "10px 12px",
    background: "#fff",
    fontSize: 14,
  },
  textarea: {
    width: "100%",
    border: `1px solid ${border}`,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    background: "#fff",
  },
  radio: { display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
  kitRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, marginBottom: 8 },
  kitBtn: {
    background: "#fff",
    border: `1px solid ${border}`,
    borderRadius: 12,
    padding: "10px 16px",
    fontWeight: 700,
  },
  kitBtnActive: {
    background: accent,
    color: "#fff",
    borderColor: accent,
  },
  hintBox: {
    fontSize: 13,
    background: "#fff",
    padding: 10,
    borderRadius: 10,
    border: `1px dashed ${border}`,
    marginTop: 4,
    marginBottom: 10,
  },
  sizeTable: {
    border: `1px solid ${border}`,
    borderRadius: 12,
    overflow: "hidden",
  },
  sizeRow: {
    display: "flex",
    borderTop: `1px solid ${border}`,
  },
  sizeCellLeft: { flex: 1, padding: 10, background: "#fff", fontWeight: 600 },
  sizeCellRight: { width: 120, padding: 10, textAlign: "right", background: "#fff" },
  flexCols: { display: "flex", gap: 12, flexWrap: "wrap" },
  flexCol: { flex: 1, minWidth: 240 },
  actions: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 },
  primary: {
    background: accent,
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "12px 16px",
    fontWeight: 700,
  },
  secondary: {
    background: "#fff",
    color: softText,
    border: `1px solid ${border}`,
    borderRadius: 14,
    padding: "12px 16px",
    fontWeight: 700,
  },
  gallery: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  },
  img: {
    width: "100%",
    height: 120,
    objectFit: "cover",
    borderRadius: 12,
    border: `1px solid ${border}`,
    background: "#fff",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 24,
  },
};
