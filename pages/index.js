import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";

export default function Home() {
  // --- Branding
  const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "Etat d'Ongle";
  const LOGO =
    process.env.NEXT_PUBLIC_LOGO_URL ||
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/OOjs_UI_icon_heart.svg/240px-OOjs_UI_icon_heart.svg.png";
  const COLORS = {
    primary: "#E6B7C8", // rose poudré
    primaryDark: "#D39DB2",
    bg: "#0b0b0c",
    text: "#ffffff",
    muted: "#9ca3af",
    card: "#151518",
    border: "#27272a",
  };

  // --- Champs client
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");

  // --- Brief
  const [shape, setShape] = useState("");
  const [length, setLength] = useState("");
  const [colors, setColors] = useState("");
  const [motifs, setMotifs] = useState("");
  const [vibe, setVibe] = useState("");

  // --- Tailles & notes
  const [knowSizes, setKnowSizes] = useState(false);
  const [sizesLeft, setSizesLeft] = useState(["", "", "", "", ""]);
  const [sizesRight, setSizesRight] = useState(["", "", "", "", ""]);
  const [notes, setNotes] = useState("");

  // --- Rendu
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState([]); // index sélectionnés
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");

  const PRESETS = [
    { label: "Doux & poétique", shape: "amande", length: "moyenne", colors: "bleu pastel, nude rosé", motifs: "petites fleurs blanches, paillettes très fines", vibe: "léger, romantique, lumineux" },
    { label: "Glam rock", shape: "coffin court", length: "courte", colors: "noir mat, chrome argent", motifs: "french inversée fine, accents métalliques", vibe: "audacieux, soirée, edgy" },
    { label: "Minimal chic", shape: "ovale court", length: "courte", colors: "nude beige, blanc", motifs: "french fine, demi-lune", vibe: "propre, bureau, quotidien" },
    { label: "Mariée lumineuse", shape: "amande", length: "longue", colors: "lilas très pâle, blanc nacré", motifs: "babyboomer, nacres subtiles", vibe: "élégant, photo-ready, intemporel" },
    { label: "Pastel romantique", shape: "amande", length: "moyenne", colors: "rose poudré, lilas, ivoire", motifs: "micro-fleurs, traits fins dorés", vibe: "printanier, féminin, délicat" },
    { label: "Classique nude", shape: "ovale", length: "moyenne", colors: "nude rosé, blanc doux", motifs: "french subtile", vibe: "sobre, épuré, chic" },
  ];

  const WOOD = "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1600&auto=format&fit=crop";
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

  function applyPreset(p) {
    setShape(p.shape); setLength(p.length); setColors(p.colors); setMotifs(p.motifs); setVibe(p.vibe);
  }

  function buildPrompt() {
    const parts = [
      shape && `Forme: ${shape}`,
      length && `Longueur: ${length}`,
      colors && `Couleurs: ${colors}`,
      motifs && `Motifs/déco: ${motifs}`,
      vibe && `Ambiance/style: ${vibe}`,
    ].filter(Boolean).join(" • ");
    const base = "Génère une photo réaliste d'un nuancier de press-on nails présenté sur une planche en bois clair, lumière douce studio, focus sur les tips, style e-commerce.";
    const constraints = "Pas de logos/licences, rendu propre, fond minimal, alignement régulier des échantillons.";
    const full = `${base}\n${parts}\n${constraints}`;
    setPrompt(full);
    return full;
  }

  async function generate() {
    setLoading(true);
    setImages([]); setSelected([]);
    buildPrompt();
    await new Promise((r) => setTimeout(r, 600));
    setImages(PLACEHOLDERS);
    setLoading(false);
  }

  function toggleSelect(i) {
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
  }

  function exportPDF() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40; let y = margin;

    doc.setFont("helvetica", "bold"); doc.setFontSize(18);
    doc.text(`${BRAND} – Brief Press-On`, margin, y); y += 24;

    doc.setFontSize(12); doc.setFont("helvetica", "normal");
    doc.text(`Client(e) : ${name || "—"} | Email : ${email || "—"} | Tel : ${phone || "—"} | IG : ${instagram || "—"}`, margin, y); y += 18;

    [
      `Forme: ${shape || "—"}`,
      `Longueur: ${length || "—"}`,
      `Couleurs: ${colors || "—"}`,
      `Motifs/déco: ${motifs || "—"}`,
      `Ambiance/style: ${vibe || "—"}`
    ].forEach((l)=>{ doc.text(l, margin, y); y += 16; });

    y += 8; doc.setFont("helvetica","bold"); doc.text("Prompt généré", margin, y); y += 14;
    doc.setFont("helvetica","normal");
    const promptSplit = doc.splitTextToSize(prompt || buildPrompt(), 515);
    doc.text(promptSplit, margin, y); y += promptSplit.length * 14 + 10;

    doc.setFont("helvetica","bold"); doc.text("Tailles (G → D)", margin, y); y += 16;
    const fingers = ["Pouce", "Index", "Majeur", "Annulaire", "Auriculaire"];
    fingers.forEach((f,i)=>{ doc.setFont("helvetica","normal"); doc.text(`${f}: ${sizesLeft[i]||"—"} | ${sizesRight[i]||"—"}`, margin, y); y += 14; });

    if (notes) { y += 10; doc.setFont("helvetica","bold"); doc.text("Notes", margin, y); y += 14;
      doc.setFont("helvetica","normal"); const n = doc.splitTextToSize(notes, 515); doc.text(n, margin, y); y += n.length*14+6;
    }

    const chosen = selected.map((i)=>images[i]);
    if (chosen.length) {
      y += 8; doc.setFont("helvetica","bold"); doc.text("Visuels choisis", margin, y); y += 14;
      const thumbW=110, thumbH=80, gap=10; let x = margin;
      for (let i=0;i<chosen.length;i++){ doc.rect(x,y,thumbW,thumbH); doc.text(`Image ${i+1}`, x+8, y+16); x+=thumbW+gap;
        if (x+thumbW > doc.internal.pageSize.getWidth()-margin){ x=margin; y+=thumbH+gap; } }
    }
    doc.save("brief-press-on.pdf");
  }

  async function sendEmail() {
    try {
      if (!email || !name) {
        setToast("Renseigne au minimum ton nom et ton e-mail."); return;
      }
      setSending(true);
      const chosen = selected.map((i)=>images[i]);
      const payload = {
        brand: BRAND,
        customer: { name, email, phone, instagram },
        brief: { shape, length, colors, motifs, vibe, sizesLeft, sizesRight, notes },
        prompt,
        images: chosen.length ? chosen : images.slice(0,3),
      };
      const res = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (j.ok) setToast("✅ Envoyé ! Je te réponds très vite.");
      else setToast("❌ Envoi impossible. Vérifie plus tard.");
    } catch (e) {
      setToast("❌ Erreur réseau.");
    } finally {
      setSending(false);
      setTimeout(()=>setToast(""), 4000);
    }
  }

  // --- UI helpers
  const input = (value, onChange, placeholder, type="text") => (
    <input
      type={type}
      value={value}
      onChange={(e)=>onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width:"100%", background: COLORS.card, color: COLORS.text,
        border:`1px solid ${COLORS.border}`, borderRadius:14, padding:10, marginTop:6
      }}
    />
  );

  return (
    <div style={{ background: COLORS.bg, color: COLORS.text, minHeight:"100vh" }}>
      {/* Header brandé */}
      <header style={{ maxWidth:1100, margin:"0 auto", padding:"16px 16px 0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <img src={LOGO} alt="logo" style={{ width:28, height:28, borderRadius:6 }} />
          <div style={{ fontWeight:800, letterSpacing:.3 }}>{BRAND}</div>
        </div>
      </header>

      <main style={{ maxWidth:1100, margin:"0 auto", padding:16 }}>
        <h1 style={{ fontSize:28, fontWeight:800, lineHeight:1.2 }}>
          Crée ton kit <i style={{ color: COLORS.primary }}>Press-On</i><br/> personnalisé
        </h1>
        <div style={{ color: COLORS.muted, fontSize:12, marginBottom:10 }}>Prototype</div>

        <div style={{ display:"grid", gap:16, gridTemplateColumns:"1fr 1.2fr" }}>
          {/* Colonne gauche */}
          <div>
            {/* Form cliente */}
            <div style={{ border:`1px solid ${COLORS.border}`, borderRadius:16, padding:12, marginBottom:12 }}>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:6 }}>Tes informations</div>
              {input(name, setName, "Nom / Prénom")}
              {input(email, setEmail, "Email", "email")}
              {input(phone, setPhone, "Téléphone")}
              {input(instagram, setInstagram, "Instagram (optionnel)")}
            </div>

            {/* Presets */}
            <div style={{ fontSize:13, fontWeight:700, margin:"8px 0" }}>Préréglages (idées en 1 clic)</div>
            <div style={{ display:"grid", gap:8, gridTemplateColumns:"1fr 1fr" }}>
              {PRESETS.map((p)=>(
                <button key={p.label} onClick={()=>applyPreset(p)}
                  style={{ background:COLORS.card, color:COLORS.text, border:`1px solid ${COLORS.border}`,
                    borderRadius:14, padding:10, textAlign:"left", fontSize:12 }}>
                  <div style={{ fontWeight:700 }}>{p.label}</div>
                  <div style={{ color:COLORS.muted }}>{p.shape} • {p.colors}</div>
                </button>
              ))}
            </div>

            {/* Brief */}
            <div style={{ marginTop:10 }}>
              <label style={{ fontSize:12, fontWeight:700 }}>Forme</label>
              {input(shape, setShape, "amande, coffin, ovale…")}
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:700 }}>Longueur</label>
              {input(length, setLength, "courte, moyenne, longue")}
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:700 }}>Couleurs</label>
              {input(colors, setColors, "rose poudré, lilas, nude rosé…")}
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:700 }}>Motifs / déco</label>
              {input(motifs, setMotifs, "french fine, chrome, fleurs…")}
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:700 }}>Ambiance / style</label>
              {input(vibe, setVibe, "doux & poétique, minimal chic…")}
            </div>

            <button onClick={generate} disabled={loading}
              style={{ marginTop:10, width:"100%", background:COLORS.primary, color:"#1b1b1c",
                border:"none", borderRadius:14, padding:12, fontWeight:800 }}>
              {loading ? "Génération..." : "Générer des visuels"}
            </button>

            <div style={{ marginTop:12 }}>
              <div style={{ fontSize:12, fontWeight:700 }}>Prompt généré (aperçu)</div>
              <textarea readOnly value={prompt}
                style={{ width:"100%", height:100, background:COLORS.card, color:COLORS.text,
                  border:`1px solid ${COLORS.border}`, borderRadius:14, padding:8, marginTop:4, fontSize:12 }}/>
            </div>

            {/* Tailles */}
            <div style={{ marginTop:12 }}>
              <div style={{ fontSize:13, fontWeight:700 }}>Tailles des ongles</div>
              <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, marginTop:6 }}>
                <input type="checkbox" checked={knowSizes} onChange={(e)=>setKnowSizes(e.target.checked)} /> Je connais mes tailles (0–10)
              </label>

              {knowSizes ? (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:8 }}>
                  <SizesCard title="Main gauche" values={sizesLeft} onChange={setSizesLeft} COLORS={COLORS}/>
                  <SizesCard title="Main droite" values={sizesRight} onChange={setSizesRight} COLORS={COLORS}/>
                </div>
              ) : (
                <p style={{ fontSize:12, color: COLORS.muted, marginTop:6 }}>
                  Si tu ne connais pas tes tailles, je t’enverrai un guide de prise de mesures ou un kit de sizing.
                </p>
              )}

              <div style={{ marginTop:8 }}>
                <label style={{ fontSize:12, fontWeight:700 }}>Notes / précisions</label>
                <textarea value={notes} onChange={(e)=>setNotes(e.target.value)}
                  placeholder="Habitudes, longueur max, allergies, etc."
                  style={{ width:"100%", height:70, background:COLORS.card, color:COLORS.text,
                    border:`1px solid ${COLORS.border}`, borderRadius:14, padding:8, marginTop:4, fontSize:12 }}/>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:10 }}>
                <button onClick={exportPDF}
                  style={{ background:COLORS.card, color:COLORS.text, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:12 }}>
                  Exporter le brief en PDF
                </button>
                <button onClick={sendEmail} disabled={sending}
                  style={{ background:COLORS.primaryDark, color:"#1b1b1c", border:"none", borderRadius:14, padding:12, fontWeight:800 }}>
                  {sending ? "Envoi..." : "Envoyer par e-mail"}
                </button>
              </div>
              {!!toast && <div style={{ marginTop:8, fontSize:12 }}>{toast}</div>}
            </div>
          </div>

          {/* Colonne droite : nuancier bois + sélection */}
          <div>
            <div style={{ border:`1px solid ${COLORS.border}`, borderRadius:18, overflow:"hidden", position:"relative" }}>
              <img src={WOOD} alt="planche bois" style={{ width:"100%", height:360, objectFit:"cover", filter:"brightness(.92)" }}/>
              <div style={{
                position:"absolute", inset:0, padding:12, display:"grid",
                gridTemplateColumns:"repeat(4, 1fr)", gap:10, alignContent:"start"
              }}>
                {!images.length ? (
                  <div style={{ gridColumn:"1 / -1", color:"white", textShadow:"0 1px 2px rgba(0,0,0,.5)" }}>
                    {loading ? "Génération..." : "Aucun visuel encore. Clique sur le bouton."}
                  </div>
                ) : (
                  images.map((src, i) => {
                    const isSel = selected.includes(i);
                    return (
                      <div key={i} onClick={()=>toggleSelect(i)}
                        style={{
                          position:"relative", cursor:"pointer",
                          outline: isSel ? `3px solid ${COLORS.primary}` : "none",
                          borderRadius:12, overflow:"hidden"
                        }}>
                        <img src={src} alt={`échantillon ${i+1}`} style={{ width:"100%", height:110, objectFit:"cover" }}/>
                        {isSel && (
                          <div style={{
                            position:"absolute", top:6, right:6, background:COLORS.primary, color:"#1b1b1c",
                            fontSize:11, fontWeight:800, padding:"4px 6px", borderRadius:999
                          }}>Choisi</div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            {images.length ? (
              <div style={{ marginTop:8, fontSize:12, color:COLORS.muted }}>
                Sélectionnés : <b>{selected.length}</b> – (tap pour sélectionner/désélectionner)
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

function SizesCard({ title, values, onChange, COLORS }) {
  const fingers = ["Pouce","Index","Majeur","Annulaire","Auriculaire"];
  const setVal = (i, v) => { const c=[...values]; c[i]=v; onChange(c); };
  return (
    <div style={{ border:`1px solid ${COLORS.border}`, borderRadius:14, padding:8 }}>
      <div style={{ fontSize:12, fontWeight:700, marginBottom:6 }}>{title}</div>
      {fingers.map((f,i)=>(
        <div key={f} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <span style={{ fontSize:12, width:80 }}>{f}</span>
          <input value={values[i]} onChange={(e)=>setVal(i, e.target.value)} placeholder="0–10"
            style={{ width:70, background:COLORS.card, color:"#fff", border:`1px solid ${COLORS.border}`,
              borderRadius:10, padding:6, fontSize:12 }}/>
        </div>
      ))}
    </div>
  );
      }
