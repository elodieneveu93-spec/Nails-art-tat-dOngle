import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";

export default function Home() {
  // --- Champs libres (brief)
  const [shape, setShape] = useState("");
  const [length, setLength] = useState("");
  const [colors, setColors] = useState("");
  const [motifs, setMotifs] = useState("");
  const [vibe, setVibe] = useState("");

  // --- Tailles et notes
  const [knowSizes, setKnowSizes] = useState(false);
  const [sizesLeft, setSizesLeft] = useState(["", "", "", "", ""]);
  const [sizesRight, setSizesRight] = useState(["", "", "", "", ""]);
  const [notes, setNotes] = useState("");

  // --- Rendu / génération
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Préréglages (idées)
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
      motifs: "babyboomer, nacres subtiles",
      vibe: "élégant, photo-ready, intemporel",
    },
    {
      label: "Pastel romantique",
      shape: "amande",
      length: "moyenne",
      colors: "rose poudré, lilas, ivoire",
      motifs: "micro-fleurs, traits fins dorés",
      vibe: "printanier, féminin, délicat",
    },
    {
      label: "Classique nude",
      shape: "ovale",
      length: "moyenne",
      colors: "nude rosé, blanc doux",
      motifs: "french subtile",
      vibe: "sobre, épuré, chic",
    },
  ];

  // --- Visuel de fond (bois) + placeholders (démo)
  const WOOD =
    "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1600&auto=format&fit=crop";
  const PLACEHOLDERS = useMemo(
    () => [
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1604654894693-7d829b6a48bf?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1616394584738-24b919c8d6cb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620331311521-48f3e3a05d0a?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541534401786-2077eed87a72?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559599078-1e35d1f5b6dc?q=80&w=1200&auto=format&fit=crop",
    ],
    []
  );

  // --- Actions
  function applyPreset(p) {
    setShape(p.shape);
    setLength(p.length);
    setColors(p.colors);
    setMotifs(p.motifs);
    setVibe(p.vibe);
  }

  function buildPrompt() {
    const parts = [
      shape && `Forme: ${shape}`,
      length && `Longueur: ${length}`,
      colors && `Couleurs: ${colors}`,
      motifs && `Motifs/déco: ${motifs}`,
      vibe && `Ambiance/style: ${vibe}`,
    ]
      .filter(Boolean)
      .join(" • ");

    const base =
      "Génère une photo réaliste d'un nuancier de press-on nails présenté sur une planche en bois clair, lumière douce studio, focus sur les tips, style e-commerce.";
    const constraints =
      "Pas de logos/licences, rendu propre, fond minimal, alignement régulier des échantillons.";

    const full = `${base}\n${parts}\n${constraints}`;
    setPrompt(full);
    return full;
  }

  async function generate() {
    setLoading(true);
    setImages([]);
    buildPrompt();
    // démo : on attend un peu puis on affiche des images exemples
    await new Promise((r) => setTimeout(r, 600));
    setImages(PLACEHOLDERS);
    setLoading(false);
  }

  function exportPDF() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Brief – Kit Press-On personnalisé", margin, y);
    y += 22;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    [
      `Forme: ${shape || "—"}`,
      `Longueur: ${length || "—"}`,
      `Couleurs: ${colors || "—"}`,
      `Motifs/déco: ${motifs || "—"}`,
      `Ambiance/style: ${vibe || "—"}`,
    ].forEach((l) => {
      doc.text(l, margin, y);
      y += 16;
    });

    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Prompt généré", margin, y);
    y += 14;

    doc.setFont("helvetica", "normal");
    const promptSplit = doc.splitTextToSize(prompt || buildPrompt(), 515);
    doc.text(promptSplit, margin, y);
    y += promptSplit.length * 14 + 10;

    doc.setFont("helvetica", "bold");
    doc.text("Tailles (gauche → droite)", margin, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    const fingers = ["Pouce", "Index", "Majeur", "Annulaire", "Auriculaire"];
    fingers.forEach((f, i) => {
      doc.text(
        `${f}: G ${sizesLeft[i] || "—"} | D ${sizesRight[i] || "—"}`,
        margin,
        y
      );
      y += 14;
    });

    if (notes) {
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Notes", margin, y);
      y += 14;

      doc.setFont("helvetica", "normal");
      const notesSplit = doc.splitTextToSize(notes, 515);
      doc.text(notesSplit, margin, y);
      y += notesSplit.length * 14 + 6;
    }

    if (images.length) {
      y += 8;
      doc.setFont("helvetica", "bold");
      doc.text("Visuels (miniatures)", margin, y);
      y += 14;

      // on dessine des cadres avec légende (pas d’embed cross-domain)
      const thumbW = 110;
      const thumbH = 80;
      const gap = 10;
      let x = margin;
      for (let i = 0; i < images.length; i++) {
        doc.rect(x, y, thumbW, thumbH);
        doc.text(`Image ${i + 1}`, x + 8, y + 16);
        x += thumbW + gap;
        if (x + thumbW > doc.internal.pageSize.getWidth() - margin) {
          x = margin;
          y += thumbH + gap;
        }
      }
    }

    doc.save("brief-press-on.pdf");
  }

  // --- Petit composant d’input pour les tailles
  const sizeInput = (val, onChange) => (
    <input
      value={val}
      onChange={(e) => onChange(e.target.value)}
      placeholder="0–10"
      style={{
        width: 70,
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: 6,
        fontSize: 12,
      }}
    />
  );

  // --- UI
  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: 16, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>
        Crée ton kit <i>Press-On</i> personnalisé
      </h1>
      <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 8 }}>Prototype</div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1.2fr" }}>
        {/* Colonne gauche : brief + formulaires */}
        <div>
          {/* Préréglages */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, margin: "8px 0" }}>Préréglages (idées en 1 clic)</div>
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    padding: 8,
                    textAlign: "left",
                    fontSize: 12,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{p.label}</div>
                  <div style={{ color: "#6b7280" }}>{p.shape} • {p.colors}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Champs */}
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 700 }}>Forme</label>
            <input
              value={shape}
              onChange={(e) => setShape(e.target.value)}
              placeholder="amande, coffin, ovale…"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 14, padding: 8, marginTop: 4 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700 }}>Longueur</label>
            <input
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="courte, moyenne, longue"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 14, padding: 8, marginTop: 4 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700 }}>Couleurs</label>
            <input
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              placeholder="bleu pastel, nude rosé, noir mat…"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 14, padding: 8, marginTop: 4 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700 }}>Motifs / déco</label>
            <input
              value={motifs}
              onChange={(e) => setMotifs(e.target.value)}
              placeholder="fleurs fines, chrome, paillettes, french…"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 14, padding: 8, marginTop: 4 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700 }}>Ambiance / style</label>
            <input
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder="doux et poétique, glam rock, minimal chic…"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 14, padding: 8, marginTop: 4 }}
            />
          </div>

          {/* Générer */}
          <button
            onClick={generate}
            disabled={loading}
            style={{
              marginTop: 10,
              width: "100%",
              background: "#000",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: 10,
              fontWeight: 700,
            }}
          >
            {loading ? "Génération..." : "Générer des visuels"}
          </button>

          {/* Prompt */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Prompt généré (aperçu)</div>
            <textarea
              readOnly
              value={prompt}
              style={{
                width: "100%",
                height: 100,
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 8,
                marginTop: 4,
                fontSize: 12,
              }}
            />
          </div>

          {/* Tailles */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Tailles des ongles</div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, marginTop: 6 }}>
              <input
                type="checkbox"
                checked={knowSizes}
                onChange={(e) => setKnowSizes(e.target.checked)}
              />{" "}
              Je connais mes tailles (0–10)
            </label>

            {knowSizes ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Main gauche</div>
                  {["Pouce", "Index", "Majeur", "Annulaire", "Auriculaire"].map((f, i) => (
                    <div
                      key={f}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}
                    >
                      <span style={{ fontSize: 12, width: 80 }}>{f}</span>
                      {sizeInput(sizesLeft[i], (v) => {
                        const c = [...sizesLeft];
                        c[i] = v;
                        setSizesLeft(c);
                      })}
                    </div>
                  ))}
                </div>
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Main droite</div>
                  {["Pouce", "Index", "Majeur", "Annulaire", "Auriculaire"].map((f, i) => (
                    <div
                      key={f}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}
                    >
                      <span style={{ fontSize: 12, width: 80 }}>{f}</span>
                      {sizeInput(sizesRight[i], (v) => {
                        const c = [...sizesRight];
                        c[i] = v;
                        setSizesRight(c);
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                Si tu ne connais pas tes tailles, je t’enverrai un guide de prise de mesures ou un kit de sizing.
              </p>
            )}

            {/* Notes + actions */}
            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700 }}>Notes / précisions</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex : je tape beaucoup au clavier ; je préfère court ; allergie à la colle…"
                style={{
                  width: "100%",
                  height: 70,
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 8,
                  marginTop: 4,
                  fontSize: 12,
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
              <button onClick={exportPDF} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 10 }}>
                Exporter le brief en PDF
              </button>
              <button
                onClick={() => alert("Fonction commande à brancher")}
                style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 14, padding: 10 }}
              >
                Demander un devis / Commander
              </button>
            </div>
          </div>
        </div>

        {/* Colonne droite : nuancier sur bois */}
        <div>
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <img
              src={WOOD}
              alt="planche bois"
              style={{ width: "100%", height: 360, objectFit: "cover", filter: "brightness(.92)" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                padding: 12,
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
                alignContent: "start",
              }}
            >
              {!images.length ? (
                <div style={{ gridColumn: "1 / -1", color: "white", textShadow: "0 1px 2px rgba(0,0,0,.5)" }}>
                  {loading ? "Génération..." : "Aucun visuel encore. Clique sur le bouton."}
                </div>
              ) : (
                images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`échantillon ${i + 1}`}
                    style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 12 }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
