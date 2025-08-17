export default function Home() {
  // état minimal dans le navigateur
  const state = { images: [] };

  const PLACEHOLDERS = [
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1604654894693-7d829b6a48bf?q=80&w=1200&auto=format&fit=crop",
  ];
  const WOOD = "https://images.unsplash.com/photo-1541080477408-659cf03d4d92?q=80&w=1600&auto=format&fit=crop";

  const generate = async () => {
    state.images = PLACEHOLDERS;
    render();
  };

  const render = () => {
    const root = document.getElementById("root");
    root.innerHTML = `
      <div style="max-width:900px;margin:24px auto;padding:16px">
        <h1 style="font-size:24px;font-weight:600">Configurateur Press-On</h1>
        <button onclick="(${generate.toString()})()"
          style="margin-top:10px;background:#000;color:#fff;border:none;border-radius:12px;padding:10px 14px">
          Générer des visuels (démo)
        </button>
        <div style="margin-top:16px;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden">
          <img src="${WOOD}" style="width:100%;height:300px;object-fit:cover"/>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px">
            ${
              state.images.length
                ? state.images.map((src)=>`<img src="${src}" style="width:100%;height:120px;object-fit:cover;border-radius:12px"/>`).join("")
                : "<div style='grid-column:1/-1;color:#6b7280'>Aucun visuel encore. Clique sur le bouton ci-dessus.</div>"
            }
          </div>
        </div>
      </div>
    `;
  };

  setTimeout(render, 0);
  return <div id="root" />;
}
