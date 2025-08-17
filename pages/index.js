import { useState } from "react";

export default function Home() {
  const [images, setImages] = useState([]);

  const WOOD =
    "https://images.unsplash.com/photo-1541080477408-659cf03d4d92?q=80&w=1600&auto=format&fit=crop";
  const PLACEHOLDERS = [
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1604654894693-7d829b6a48bf?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1616394584738-24b919c8d6cb?q=80&w=1200&auto=format&fit=crop",
  ];

  function generate() {
    setImages(PLACEHOLDERS);
  }

  return (
    <div style={{ maxWidth: 1000, margin: "24px auto", padding: 16, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Configurateur Press-On</h1>
      <p style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>
        Prototype – clique pour voir le nuancier.
      </p>

      <button
        onClick={generate}
        style={{
          marginTop: 12,
          background: "black",
          color: "white",
          border: "none",
          borderRadius: 12,
          padding: "10px 14px",
          fontWeight: 600,
        }}
      >
        Générer des visuels (démo)
      </button>

      <div
        style={{
          marginTop: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 18,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <img src={WOOD} alt="planche bois" style={{ width: "100%", height: 360, objectFit: "cover" }} />
        <div style={{ padding: 12, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {images.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", color: "white", textShadow: "0 1px 2px rgba(0,0,0,.5)" }}>
              Aucun visuel pour l’instant. Clique sur le bouton ci-dessus.
            </div>
          ) : (
            images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`échantillon ${i + 1}`}
                style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 12 }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
