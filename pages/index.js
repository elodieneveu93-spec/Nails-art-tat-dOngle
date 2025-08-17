export default function Home() {
  // --- mini state manager (sans dépendances)
  const state = {
    shape: "",
    length: "",
    colors: "",
    motifs: "",
    vibe: "",
    knowSizes: false,
    sizesLeft: ["", "", "", "", ""],
    sizesRight: ["", "", "", "", ""],
    notes: "",
    images: [],
    loading: false,
  };

  // Préréglages
  const PRESETS = [
    { label: "Doux & poétique", shape: "amande", length: "moyenne", colors: "bleu pastel, nude rosé", motifs: "petites fleurs blanches, paillettes très fines", vibe: "léger, romantique, lumineux" },
    { label: "Glam rock", shape: "coffin court", length: "courte", colors: "noir mat, chrome argent", motifs: "french inversée fine, accents métalliques", vibe: "audacieux, soirée, edgy" },
    { label: "Minimal chic", shape: "ovale court", length: "courte", colors: "nude beige, blanc", motifs: "french fine, demi-lune", vibe: "propre, bureau, quotidien" },
    { label: "Mariée lumineuse", shape: "amande", length: "longue", colors: "lilas très pâle, blanc nacré", motifs: "babyboomer, nacres subtiles", vibe: "élégant, photo-ready, intemporel" },
    { label: "Pastel romantique", shape: "amande", length: "moyenne", colors: "rose poudré, lilas, ivoire", motifs: "micro-fleurs, traits fins dorés", vibe: "printanier, féminin, délicat" },
    { label: "Classique nude", shape: "ovale", length: "moyenne", colors: "nude rosé, blanc doux", motifs: "french subtile", vibe: "sobre, épuré, chic" },
  ];

  // placeholders nuancier
  const WOOD = "https://images.unsplash.com/photo-1541080477408-659cf03d4d92?q=80&w=1600&auto=format&fit=crop";
  const PLACEHOLDERS = [
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1604654894693-7d829b6a48bf?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1616394584738-24b919c8d6cb?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620331311521-48f3e3a05d0a?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541534401786-2077eed87a72?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1559599078-1e35d1f5b6dc?q=80&w=1200&auto=format&fit=crop",
  ];

  // helpers
  const el = (sel) => document.querySelector(sel);
  const set = () => {
    // synchronise les inputs -> state
    state.shape = el("#shape").value;
    state.length = el("#length").value;
    state.colors = el("#colors").value;
    state.motifs = el("#motifs").value;
    state.vibe = el("#vibe").value;
    state.knowSizes = el("#knowSizes").checked;
    ["Pouce","Index","Majeur","Annulaire","Auriculaire"].forEach((_,i)=>{
      state.sizesLeft[i] = (el(`#L${i}`) || {}).value || "";
      state.sizesRight[i] = (el(`#R${i}`) || {}).value || "";
    });
    state.notes = el("#notes").value;
  };

  const applyPreset = (p) => {
    el("#shape").value = p.shape;
    el("#length").value = p.length;
    el("#colors").value = p.colors;
    el("#motifs").value = p.motifs;
    el("#vibe").value = p.vibe;
  };

  const buildPrompt = () => {
    set();
    const parts = [
      state.shape && `Forme: ${state.shape}`,
      state.length && `Longueur: ${state.length}`,
      state.colors && `Couleurs: ${state.colors}`,
      state.motifs && `Motifs/déco: ${state.motifs}`,
      state.vibe && `Ambiance/style: ${state.vibe}`,
    ].filter(Boolean).join(" • ");
    return [
      "Génère une photo réaliste d'un nuancier de press-on nails présenté sur une planche en bois clair, lumière douce studio, focus sur les tips, style e-commerce.",
      parts,
      "Pas de logos/licences, rendu propre, fond minimal, alignement régulier des échantillons."
    ].join("\n");
  };

  const generate = async () => {
    set();
    state.loading = true; render();
    // démo : on affiche les placeholders
    await new Promise(r=>setTimeout(r,800));
    state.images = PLACEHOLDERS.slice(0,8);
    state.loading = false; render();
    el("#prompt").value = buildPrompt();
  };

  const downloadBrief = () => {
    set();
    const lines = [];
    lines.push("Brief – Kit Press-On personnalisé");
    lines.push("");
    lines.push(`Forme: ${state.shape || "—"}`);
    lines.push(`Longueur: ${state.length || "—"}`);
    lines.push(`Couleurs: ${state.colors || "—"}`);
    lines.push(`Motifs/déco: ${state.motifs || "—"}`);
    lines.push(`Ambiance/style: ${state.vibe || "—"}`);
    lines.push("");
    lines.push("Tailles (Gauche → Droite)");
    ["Pouce","Index","Majeur","Annulaire","Auriculaire"].forEach((f,i)=>{
      lines.push(`${f}: G ${state.sizesLeft[i] || "—"} | D ${state.sizesRight[i] || "—"}`);
    });
    if (state.notes) {
      lines.push(""); lines.push("Notes :"); lines.push(state.notes);
    }
    lines.push(""); lines.push("Prompt :"); lines.push(buildPrompt());

    const blob = new Blob([lines.join("\n")], {type:"text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "brief-press-on.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // rendu basique (pas de framework CSS)
  const render = () => {
    const root = document.getElementById("root");
    root.innerHTML = `
      <div style="max-width:1100px;margin:24px auto;padding:16px;">
        <h1 style="font-size:24px;font-weight:600;margin-bottom:8px">Crée ton kit <i>Press-On</i> personnalisé</h1>
        <div style="color:#6b7280;font-size:12px;margin-bottom:16px">Prototype sans installation (mobile friendly)</div>

        <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:16px">
          <div>
            <div>
              <div style="font-size:13px;font-weight:600;margin:8px 0">Préréglages (idées en 1 clic)</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                ${PRESETS.map(p => `
                  <button style="border:1px solid #e5e7eb;border-radius:14px;padding:8px;text-align:left;font-size:12px"
                          onclick='(${applyPreset.toString()})(${JSON.stringify(p)})'>
                    <div style="font-weight:600">${p.label}</div>
                    <div style="color:#6b7280">${p.shape} • ${p.colors}</div>
                  </button>
                `).join("")}
              </div>
            </div>

            <div style="margin-top:12px">
              <label style="font-size:12px;font-weight:600">Forme</label>
              <input id="shape" placeholder="amande, coffin, ovale..." style="width:100%;border:1px solid #e5e7eb;border-radius:14px;padding:8px;margin-top:4px"/>
            </div>
            <div>
              <label style="font-size:12px;font-weight:600">Longueur</label>
              <input id="length" placeholder="courte, moyenne, longue" style="width:100%;border:1px solid #e5e7eb;border-radius:14px;padding:8px;margin-top:4px"/>
            </div>
            <div>
              <label style="font-size:12px;font-weight:600">Couleurs</label>
              <input id="colors" placeholder="bleu pastel, nude rosé, noir mat..." style="width:100%;border:1px solid #e5e7eb;border-radius:14px;padding:8px;margin-top:4px"/>
            </div>
            <div>
              <label style="font-size:12px;font-weight:600">Motifs / décorations</label>
              <input id="motifs" placeholder="fleurs fines, chrome, paillettes, french..." style="width:100%;border:1px solid #e5e7eb;border-radius:14px;padding:8px;margin-top:4px"/>
            </div>
            <div>
              <label style="font-size:12px;font-weight:600">Ambiance / style</label>
              <input id="vibe" placeholder="doux et poétique, glam rock, minimal chic..." style="width:100%;border:1px solid #e5e7eb;border-radius:14px;padding:8px;margin-top:4px"/>
            </div>

            <button onclick='(${generate.toString()})()'
              style="margin-top:10px;width:100%;background:#000;color:#fff;border:none;border-radius:14px;padding:10px;font-weight:600">
              Générer des visuels
            </button>

            <div style="margin-top:12px">
              <div style="font-size:12px;font-weight:600">Prompt généré (aperçu)</div>
              <textarea id="prompt" readonly style="width:100%;height:100px;border:1px solid #e5e7eb;border-radius:14px;padding:8px;margin-top:4px;font-size:12px"></textarea>
            </div>

            <div style="margin-top:12px">
              <div style="font-size:13px;font-weight:600">Tailles des ongles</div>
              <label style="display:flex;align-items:center;gap:6px;font-size:12px;margin-top:6px">
                <input id="knowSizes" type="checkbox" onchange="(${set.toString()})()"/> Je connais mes tailles (0–10)
              </label>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
                <div style="border:1px solid #e5e7eb;border-radius:14px;padding:8px">
                  <div style="font-size:12px;font-weight:600;margin-bottom:6px">Main gauche</div>
                  ${["Pouce","Index","Majeur","Annulaire","Auriculaire"].map((f,i)=>`
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                      <span style="font-size:12px;width:80px">${f}</span>
                      <input id="L${i}" placeholder="0-10" style="width:70px;border:1px solid #e5e7eb;border-radius:10px;padding:6px;font-size:12px"/>
                    </div>
                  `).join("")}
                </div>
                <div style="border:1px solid #e5e7eb;border-radius:14px;padding:8px">
                  <div style="font-size:12px;font-weight:600;margin-bottom:6px">Main droite</div>
                  ${["Pouce","Index","Majeur","Annulaire","Auriculaire"].map((f,i)=>`
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                      <span style="font-size:12px;width:80px">${f}</span>
                      <input id="R${i}" placeholder="0-10" style="width:70px;border:1px solid #e5e7eb;border-radius:10px;padding:6px;font-size:12px"/>
                    </div>
                  `).join("")}
                </div>
              </div>

              <div style="margin-top:8px">
                <label style="font-size:12px;font-weight:600">Notes / précisions</label>
                <textarea id="notes" placeholder="Ex : je tape beaucoup au clavier ; je préfère court ; allergie à la colle…"
                  style="width:100%;height:70px;border:1px solid #e5e7eb;border-radius:14px;padding:8px;margin-top:4px;font-size:12px"></textarea>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
                <button onclick='(${downloadBrief.toString()})()' style="border:1px solid #e5e7eb;border-radius:14px;padding:10px">
                  Télécharger le brief (.txt)
                </button>
                <button onclick="(${set.toString()})(); alert('Fonction commande à brancher 👍');"
                  style="background:#059669;color:#fff;border:none;border-radius:14px;padding:10px">
                  Demander un devis / Commander
                </button>
              </div>
            </div>
          </div>

          <div>
            <div style="border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;position:relative">
              <img src="${WOOD}" alt="planche bois" style="width:100%;height:360px;object-fit:cover;filter:brightness(0.9)"/>
              <div style="position:absolute;inset:0;padding:12px;display:flex;flex-direction:column">
                <div style="display:flex;justify-content:space-between;color:white;text-shadow:0 1px 2px rgba(0,0,0,.4);font-size:12px">
                  <div style="font-weight:600">Nuancier – idées générées</div>
                  <div>${state.loading ? "Génération..." : (state.images.length ? state.images.length+" échantillons" : "en attente")}</div>
                </div>
                <div style="margin-top:8px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;place-items:center">
                  ${
                    state.loading
                      ? `<div style='grid-column:1/-1;color:white'>Création des visuels…</div>`
                      : (state.images.length === 0
                        ? `<div style='grid-column:1/-1;color:white'>Aucun visuel pour l'instant. Lance une génération ou choisis un préréglage.</div>`
                        : state.images.map((src,idx)=>`
                            <div style="position:relative;width:90px;height:110px;display:flex;align-items:center;justify-content:center">
                              <div style="position:absolute;inset:0;background:rgba(255,255,255,0.7);border-radius:14px 14px 46px 46px;box-shadow:0 6px 12px rgba(0,0,0,.15)"></div>
                              <img src="${src}" alt="échantillon ${idx+1}" style="position:relative;width:76px;height:96px;object-fit:cover;border-radius:12px 12px 40px 40px"/>
                            </div>
                          `).join("")
                        )
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <p style="font-size:12px;color:#6b7280;margin-top:16px">Prototype : idées sur nuancier bois. En production, les visuels seraient générés par une IA et joints au brief.</p>
      </div>
      <style>
        @media (max-width: 900px) {
          .grid { grid-template-columns: 1fr !important; }
        }
      </style>
    `;
  };

  // initial render
  setTimeout(render, 0);
  return <div id="root" />;
}
