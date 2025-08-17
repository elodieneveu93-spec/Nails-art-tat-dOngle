// pages/index.js
import { useState, Fragment } from "react";
import { jsPDF } from "jspdf";

/** ========= Thème / Marque ========= */
const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "État d’Ongles";
const COLORS = {
  primary: "#EEC4D2",
  primaryDark: "#D9A7B9",
  bg1: "#FFF7FA",
  bg2: "#FEFDFE",
  text: "#1F2937",
  muted: "#6B7280",
  card: "#FFFFFF",
  border: "#E5E7EB",
};

/** ========= Idées (préréglages) ========= */
const PRESETS = [
  { label: "Doux & poétique", shape: "amande", length: "moyenne", colors: "bleu pastel, nude rosé", motifs: "petites fleurs blanches, paillettes très fines", vibe: "léger, romantique, lumineux" },
  { label: "Glam rock", shape: "coffin court", length: "courte", colors: "noir mat, chrome argent", motifs: "french inversée fine, accents métalliques", vibe: "audacieux, soirée, edgy" },
  { label: "Minimal chic", shape: "ovale court", length: "courte", colors: "nude beige, blanc", motifs: "french fine, demi-lune", vibe: "propre, bureau, quotidien" },
  { label: "Mariée lumineuse", shape: "amande", length: "longue", colors: "lilas très pâle, blanc nacré", motifs: "babyboomer, nacres subtiles", vibe: "élégant, intemporel" },
  { label: "Pastel romantique", shape: "amande", length: "moyenne", colors: "rose poudré, lilas, ivoire", motifs: "micro-fleurs, traits fins dorés", vibe: "printanier, féminin, délicat" },
  { label: "Classique nude", shape: "ovale", length: "moyenne", colors: "nude rosé, blanc doux", motifs: "french subtile", vibe: "sobre, épuré, chic" },
];

/** ========= Images de démo (fallback gratuit) ========= */
const WOOD = "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1600&auto=format&fit=crop";
const PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1604654894693-7d829b6a48bf?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1616394584738-24b919c8d6cb?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1620331311521-48f3e3a05d0a?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=1200&auto=format&fit=crop",
];

/** ========= Tailles kits (mm) ========= */
const SIZE_PRESETS = {
  XS: { left:[14,10,11,10,7], right:[14,10,11,10,7] },
  S:  { left:[15,11,11,11,8], right:[15,11,11,11,8] },
  M:  { left:[16,12,13,12,9], right:[16,12,13,12,9] },
  L:  { left:[17,13,14,13,10], right:[17,13,14,13,10] },
  XL: { left:[18,14,15,14,11], right:[18,14,15,14,11] },
};
const FINGERS = ["Pouce","Index","Majeur","Annulaire","Auriculaire"];

/** ========= Composant principal ========= */
export default function Home() {
  // Identité cliente
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");

  // Brief style
  const [shape, setShape] = useState("");
  const [length, setLength] = useState("");
  const [colors, setColors] = useState("");
  const [motifs, setMotifs] = useState("");
  const [vibe, setVibe] = useState("");

  // Génération
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState([]); // index des images choisies
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  // Tailles
  const [sizeMode, setSizeMode] = useState("preset"); // "preset" | "custom"
  const [kitSize, setKitSize] = useState("M");
  const [sizesLeft, setSizesLeft] = useState(["","","","",""]);
  const [sizesRight, setSizesRight] = useState(["","","","",""]);
  const [notes, setNotes] = useState("");

  /** Appliquer un préréglage */
  function applyPreset(p){
    setShape(p.shape);
    setLength(p.length);
    setColors(p.colors);
    setMotifs(p.motifs);
    setVibe(p.vibe);
  }

  /** Construire le prompt IA */
  function buildPrompt(){
    const bits = [
      shape && `Forme: ${shape}`,
      length && `Longueur: ${length}`,
      colors && `Couleurs: ${colors}`,
      motifs && `Motifs/déco: ${motifs}`,
      vibe && `Ambiance/style: ${vibe}`,
    ].filter(Boolean).join(" • ");

    const base = "Photo réaliste d'un nuancier de press-on nails présenté sur une planche en bois clair, lumière douce studio, focus sur les tips, style e-commerce.";
    const constraints = "Pas de logos/licences; rendu propre; fond minimal; alignement régulier; couleurs fidèles.";

    const full = `${base}\n${bits}\n${constraints}`;
    setPrompt(full);
    return full;
  }

  /** Générer les visuels (appelle notre API serveur → Hugging Face + cache) */
  async function generate(){
    setLoading(true); setImages([]); setSelected([]);
    const p = buildPrompt();

    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ prompt: p, num: 6, premium })
      });
      const j = await r.json();

      if (j.ok) {
        setImages(j.images);
        if (j.cached) setToast("Images servies depuis le cache (0€) ✔︎");
      } else {
        // premium OFF, quota, ou erreur côté modèle → on affiche des démos
        setToast("Génération premium indisponible. J’affiche des visuels démo.");
        setImages(PLACEHOLDERS);
      }
    } catch {
      setToast("Erreur réseau. Visuels démo affichés.");
      setImages(PLACEHOLDERS);
    } finally {
      setLoading(false);
      setTimeout(()=>setToast(""), 4000);
    }
  }

  /** Sélection d’un visuel */
  function toggleSelect(i){
    setSelected(prev => prev.includes(i) ? prev.filter(x=>x!==i) : [...prev, i]);
  }

  /** Récup tailles actuelles (preset ou sur-mesure) */
  function getCurrentSizes(){
    if (sizeMode==="preset" && SIZE_PRESETS[kitSize]){
      return { sizesLeft: SIZE_PRESETS[kitSize].left, sizesRight: SIZE_PRESETS[kitSize].right, label: kitSize };
    }
    return { sizesLeft: sizesLeft.map(v=>v||"-"), sizesRight: sizesRight.map(v=>v||"-"), label: "Sur mesure" };
    }

  /** Export PDF (brief complet) */
  function exportPDF(){
    const s = getCurrentSizes();
    const doc = new jsPDF({ unit:"pt", format:"a4" });
    const m=40; let y=m;

    doc.setFont("helvetica","bold");
    doc.setFontSize(18);
    doc.text(`${BRAND} – Brief Press-On`, m, y); y+=24;

    doc.setFont("helvetica","normal");
    doc.setFontSize(12);
    doc.text(`Client(e) : ${name||"—"} | Email : ${email||"—"} | Tel : ${phone||"—"} | IG : ${instagram||"—"}`, m, y); y+=18;

    [
      `Forme: ${shape||"—"}`,
      `Longueur: ${length||"—"}`,
      `Couleurs: ${colors||"—"}`,
      `Motifs/déco: ${motifs||"—"}`,
      `Ambiance/style: ${vibe||"—"}`,
    ].forEach(line => { doc.text(line,m,y); y+=16; });

    y+=8; doc.setFont("helvetica","bold"); doc.text("Prompt généré", m, y); y+=14;
    doc.setFont("helvetica","normal");
    const pr = doc.splitTextToSize(prompt||buildPrompt(), 515);
    doc.text(pr, m, y); y += pr.length*14 + 10;

    doc.setFont("helvetica","bold"); doc.text(`Tailles (${s.label})`, m, y); y+=16;
    FINGERS.forEach((f,i)=>{
      doc.setFont("helvetica","normal");
      doc.text(`${f}: G ${s.sizesLeft[i]} mm | D ${s.sizesRight[i]} mm`, m, y);
      y+=14;
    });

    if (notes){
      y+=10; doc.setFont("helvetica","bold"); doc.text("Notes", m, y); y+=14;
      doc.setFont("helvetica","normal");
      const n = doc.splitTextToSize(notes, 515);
      doc.text(n, m, y); y += n.length*14 + 6;
    }

    const chosen = selected.map(i=>images[i]);
    if (chosen.length){
      y+=8; doc.setFont("helvetica","bold"); doc.text("Visuels choisis", m, y); y+=14;
      const w=110,h=80,g=10; let x=m;
      for (let i=0;i<chosen.length;i++){
        doc.rect(x,y,w,h);
        doc.text(`Image ${i+1}`, x+8, y+16);
        x += w+g;
        if (x+w>doc.internal.pageSize.getWidth()-m){ x=m; y+=h+g; }
      }
    }

    doc.save("brief-press-on.pdf");
  }

  /** Envoyer par e-mail (ouvre le client mail avec toutes les infos) */
  function sendEmail(){
    if (!email || !name) { setToast("Renseigne ton nom et ton e-mail."); return; }
    const s = getCurrentSizes();
    const chosen = selected.map(i=>images[i]);
    const pics = (chosen.length? chosen : images.slice(0,3)).join("\n");

    const subject = encodeURIComponent(`Commande Press-On – ${name}`);
    const body = encodeURIComponent(
`Marque: ${BRAND}

Client(e)
- Nom: ${name}
- Email: ${email}
- Tel: ${phone||"—"}
- Instagram: ${instagram||"—"}

Brief
- Forme: ${shape||"—"}
- Longueur: ${length||"—"}
- Couleurs: ${colors||"—"}
- Motifs/déco: ${motifs||"—"}
- Ambiance/style: ${vibe||"—"}

Tailles (${s.label})
Gauche (mm): ${FINGERS.map((f,i)=>`${f} ${s.sizesLeft[i]}`).join(" | ")}
Droite (mm): ${FINGERS.map((f,i)=>`${f} ${s.sizesRight[i]}`).join(" | ")}

Notes:
${notes||"—"}

Prompt IA:
${prompt||buildPrompt()}

Visuels (URLs):
${pics}
`
    );

    // Mets ici ton mail pro :
    const shopEmail = "contact@exemple.com";
    window.location.href = `mailto:${shopEmail}?subject=${subject}&body=${body}`;
  }

  /** Petits helpers d’UI */
  const input=(v,s,ph,t="text")=>(
    <input
      type={t} value={v} onChange={e=>s(e.target.value)} placeholder={ph}
      style={{
        width:"100%", background:COLORS.card, color:COLORS.text,
        border:`1px solid ${COLORS.border}`, borderRadius:14, padding:12, marginTop:6, fontSize:14
      }}
    />
  );

  return (
    <div style={{minHeight:"100vh", background:`linear-gradient(180deg, ${COLORS.bg1}, ${COLORS.bg2})`, color:COLORS.text}}>
      <header style={{maxWidth:960, margin:"0 auto", padding:"16px 16px 0"}}>
        <div style={{display:"flex", justifyContent:"center"}}>
          <div style={{fontWeight:900, letterSpacing:.3, fontSize:20, color:"#8C4A5E"}}>✨ {BRAND} ✨</div>
        </div>
      </header>

      <main style={{maxWidth:960, margin:"0 auto", padding:16}}>
        <h1 style={{fontSize:26, fontWeight:800, lineHeight:1.25, textAlign:"center"}}>
          Crée ton kit <i style={{color:"#9C5D73"}}>Press-On</i> personnalisé
        </h1>
        <div style={{color:COLORS.muted, fontSize:12, textAlign:"center", marginBottom:14}}>Prototype • optimisé mobile</div>

        <div style={{display:"grid", gap:16, gridTemplateColumns:"1fr"}}>
          {/* Colonne gauche */}
          <div>
            <Card><CardTitle>Tes informations</CardTitle>
              {input(name,setName,"Nom / Prénom")}
              {input(email,setEmail,"Email","email")}
              {input(phone,setPhone,"Téléphone")}
              {input(instagram,setInstagram,"Instagram (optionnel)")}
            </Card>

            <Card><CardTitle>Préréglages (idées en 1 clic)</CardTitle>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
                {PRESETS.map(p=>(
                  <button key={p.label} onClick={()=>applyPreset(p)}
                    style={{
                      background:COLORS.card, color:COLORS.text,
                      border:`1px solid ${COLORS.border}`, borderRadius:14,
                      padding:10, textAlign:"left", fontSize:13
                    }}>
                    <div style={{fontWeight:700}}>{p.label}</div>
                    <div style={{color:COLORS.muted}}>{p.shape} • {p.colors}</div>
                  </button>
                ))}
              </div>
            </Card>

            <Card><CardTitle>Ton style</CardTitle>
              <Label>Forme</Label>{input(shape,setShape,"amande, coffin, ovale…")}
              <Label>Longueur</Label>{input(length,setLength,"courte, moyenne, longue")}
              <Label>Couleurs</Label>{input(colors,setColors,"rose poudré, lilas, nude rosé…")}
              <Label>Motifs / déco</Label>{input(motifs,setMotifs,"french fine, chrome, fleurs…")}
              <Label>Ambiance / style</Label>{input(vibe,setVibe,"doux & poétique, minimal chic…")}

              <Button onClick={generate} filled>{loading ? "Génération…" : "Générer des visuels"}</Button>
              <label style={{display:"flex", alignItems:"center", gap:8, marginTop:8, fontSize:12}}>
                <input type="checkbox" checked={premium} onChange={e=>setPremium(e.target.checked)} />
                Qualité <b>premium</b> (IA serveur + cache ; peut coûter quelques centimes)
              </label>

              <div style={{marginTop:10}}>
                <Label>Prompt généré (aperçu)</Label>
                <textarea readOnly value={prompt}
                  style={{
                    width:"100%", height:100, background:COLORS.card, color:COLORS.text,
                    border:`1px solid ${COLORS.border}`, borderRadius:14, padding:10, marginTop:6, fontSize:12
                  }}
                />
              </div>
            </Card>

            <Card><CardTitle>Tailles du kit</CardTitle>
              <div style={{display:"grid", gap:8}}>
                <label style={{display:"flex", gap:8, alignItems:"center", fontSize:13}}>
                  <input type="radio" name="sizeMode" checked={sizeMode==="preset"} onChange={()=>setSizeMode("preset")} />
                  Je connais ma taille (kit prêt à porter)
                </label>
                <label style={{display:"flex", gap:8, alignItems:"center", fontSize:13}}>
                  <input type="radio" name="sizeMode" checked={sizeMode==="custom"} onChange={()=>setSizeMode("custom")} />
                  Je ne connais pas / 100% sur-mesure
                </label>
              </div>

              {sizeMode==="preset" && (
                <>
                  <div style={{display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8, marginTop:10}}>
                    {["XS","S","M","L","XL"].map(t=>(
                      <label key={t}
                        style={{
                          border:`1px solid ${COLORS.border}`, borderRadius:12, padding:"10px 8px",
                          textAlign:"center", cursor:"pointer",
                          background:kitSize===t?COLORS.primary:COLORS.card,
                          color:kitSize===t?"#1b1b1c":COLORS.text, fontWeight:700, fontSize:13
                        }}>
                        <input type="radio" name="kitSize" checked={kitSize===t} onChange={()=>setKitSize(t)} style={{display:"none"}} />
                        {t}
                      </label>
                    ))}
                  </div>

                  <div style={{marginTop:10, border:`1px solid ${COLORS.border}`, borderRadius:12, padding:10, background:COLORS.card}}>
                    <div style={{fontSize:12, fontWeight:800, marginBottom:8}}>
                      Détails du kit <span style={{color:"#9C5D73"}}>{kitSize}</span> (mm)
                    </div>
                    <div style={{display:"grid", gridTemplateColumns:"auto 1fr 1fr", gap:8, fontSize:12}}>
                      <div style={{fontWeight:700}}></div>
                      <div style={{fontWeight:700, textAlign:"center"}}>Main gauche</div>
                      <div style={{fontWeight:700, textAlign:"center"}}>Main droite</div>
                      {FINGERS.map((f,i)=>(
                        <Fragment key={f}>
                          <div style={{color:COLORS.muted}}>{f}</div>
                          <div style={{textAlign:"center", padding:"6px 8px", border:`1px solid ${COLORS.border}`, borderRadius:10}}>
                            {SIZE_PRESETS[kitSize].left[i]} mm
                          </div>
                          <div style={{textAlign:"center", padding:"6px 8px", border:`1px solid ${COLORS.border}`, borderRadius:10}}>
                            {SIZE_PRESETS[kitSize].right[i]} mm
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {sizeMode==="custom" && (
                <div style={{marginTop:10, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
                  <SizesCard title="Main gauche (mm)" values={sizesLeft} onChange={setSizesLeft} />
                  <SizesCard title="Main droite (mm)" values={sizesRight} onChange={setSizesRight} />
                </div>
              )}

              <p style={{marginTop:10, fontSize:12, color:COLORS.muted}}>
                <b>Astuce mesure :</b> mesure la largeur au point le plus large de l’ongle (en mm).
                Entre deux tailles, choisis la plus petite pour une meilleure tenue. XS et XL dispo sur commande.
              </p>

              <Label>Notes / précisions</Label>
              <textarea
                value={notes} onChange={e=>setNotes(e.target.value)}
                placeholder="Habitudes, longueur max, allergies, etc."
                style={{
                  width:"100%", height:70, background:COLORS.card, color:COLORS.text,
                  border:`1px solid ${COLORS.border}`, borderRadius:14, padding:10, marginTop:6, fontSize:13
                }}
              />

              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:12}}>
                <Button onClick={exportPDF}>Exporter le brief en PDF</Button>
                <Button onClick={sendEmail} filled>Envoyer par e-mail</Button>
              </div>
              {!!toast && <div style={{marginTop:8, fontSize:12}}>{toast}</div>}
            </Card>
          </div>

          {/* Colonne droite : rendu visuel */}
          <div>
            <div style={{
              border:`1px solid ${COLORS.border}`, borderRadius:18, overflow:"hidden",
              position:"relative", background:COLORS.card
            }}>
              <img src={WOOD} alt="planche bois"
                   style={{width:"100%", height:360, objectFit:"cover", filter:"brightness(.98)"}} />
              <div style={{
                position:"absolute", inset:0, padding:12,
                display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, alignContent:"start"
              }}>
                {!images.length ? (
                  <div style={{gridColumn:"1/-1", color:COLORS.text}}>
                    {loading ? "Génération…" : "Aucun visuel encore. Clique sur Générer."}
                  </div>
                ) : (
                  images.map((src,i)=>{
                    const isSel = selected.includes(i);
                    return (
                      <div key={i} onClick={()=>toggleSelect(i)}
                        style={{
                          position:"relative", cursor:"pointer",
                          outline: isSel ? `3px solid ${COLORS.primaryDark}` : "none",
                          borderRadius:12, overflow:"hidden", background:"#0001"
                        }}>
                        <img src={src} alt={`échantillon ${i+1}`}
                             style={{width:"100%", height:110, objectFit:"cover"}} />
                        {isSel && (
                          <div style={{
                            position:"absolute", top:6, right:6,
                            background:COLORS.primaryDark, color:"#1b1b1c",
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
              <div style={{marginTop:8, fontSize:12, color:COLORS.muted}}>
                Sélectionnés : <b>{selected.length}</b>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

/** ========= Petits composants UI ========= */
function Card({children}) {
  return (
    <div style={{
      background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:16,
      padding:12, marginBottom:12, boxShadow:"0 2px 8px rgba(0,0,0,0.03)"
    }}>
      {children}
    </div>
  );
}
function CardTitle({children}) {
  return <div style={{fontSize:14, fontWeight:800, marginBottom:8}}>{children}</div>;
}
function Label({children}) { return <label style={{fontSize:12, fontWeight:700, marginTop:10, display:"block"}}>{children}</label>; }
function Button({children, onClick, filled}) {
  return (
    <button onClick={onClick}
      style={{
        width:"100%", padding:12, borderRadius:14, cursor:"pointer",
        border: filled ? "none" : `1px solid ${COLORS.border}`,
        background: filled ? COLORS.primaryDark : COLORS.card,
        color: filled ? "#1b1b1c" : COLORS.text,
        fontWeight: 800
      }}>
      {children}
    </button>
  );
}
function SizesCard({title, values, onChange}) {
  const setVal = (i, v) => { const copy=[...values]; copy[i]=v; onChange(copy); };
  return (
    <div style={{border:`1px solid ${COLORS.border}`, borderRadius:12, padding:10}}>
      <div style={{fontSize:12, fontWeight:800, marginBottom:6}}>{title}</div>
      {FINGERS.map((f,i)=>(
        <div key={f} style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6}}>
          <span style={{fontSize:12, width:90}}>{f}</span>
          <input value={values[i]} onChange={e=>setVal(i,e.target.value)} placeholder="mm" inputMode="numeric"
            style={{
              width:80, background:COLORS.card, color:COLORS.text,
              border:`1px solid ${COLORS.border}`, borderRadius:10, padding:8, fontSize:12
            }}/>
        </div>
      ))}
    </div>
  );
}
