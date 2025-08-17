import { useState } from "react";

export default function Home() {
  const [color, setColor] = useState("");
  const [shape, setShape] = useState("");
  const [motif, setMotif] = useState("");
  const [sizes, setSizes] = useState({
    pouce: "",
    index: "",
    majeur: "",
    annulaire: "",
    auriculaire: ""
  });
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---- Génération IA ----
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const prompt = `Ongles press-on, couleur ${color}, forme ${shape}, motif ${motif}, style élégant, fond bois clair.`;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (res.ok) {
        setImage(data.image);
      } else {
        alert("Erreur: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("La génération a échoué.");
    }
    setLoading(false);
  };

  // ---- Envoi de commande ----
  const handleOrder = async () => {
    const orderData = {
      color,
      shape,
      motif,
      sizes,
      notes,
      image,
    };

    try {
      const res = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Commande envoyée avec succès !");
      } else {
        alert("Erreur : " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Impossible d’envoyer la commande.");
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px", background: "#fdfaf6" }}>
      <h1 style={{ textAlign: "center", color: "#a2786a" }}>État d’Ongles - Configurateur</h1>

      {/* Choix des options */}
      <div style={{ marginBottom: "15px" }}>
        <label>🎨 Couleur : </label>
        <input value={color} onChange={(e) => setColor(e.target.value)} />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>💅 Forme : </label>
        <input value={shape} onChange={(e) => setShape(e.target.value)} />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>✨ Motif : </label>
        <input value={motif} onChange={(e) => setMotif(e.target.value)} />
      </div>

      {/* Tableau tailles */}
      <h3>📏 Tailles (mm)</h3>
      {Object.keys(sizes).map((finger) => (
        <div key={finger} style={{ marginBottom: "8px" }}>
          <label>{finger} : </label>
          <input
            type="number"
            value={sizes[finger]}
            onChange={(e) => setSizes({ ...sizes, [finger]: e.target.value })}
          /> mm
        </div>
      ))}

      <div style={{ marginBottom: "15px" }}>
        <label>📝 Notes / précisions : </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          style={{ width: "100%" }}
        />
      </div>

      {/* Bouton génération IA */}
      <button
        onClick={handleGenerate}
        style={{ background: "#a2786a", color: "white", padding: "10px", marginRight: "10px" }}
      >
        {loading ? "⏳ Génération..." : "⚡ Générer un aperçu"}
      </button>

      {/* Résultat image */}
      {image && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <h3>Résultat :</h3>
          <img src={image} alt="Génération IA" style={{ maxWidth: "100%", borderRadius: "10px" }} />
        </div>
      )}

      {/* Bouton commande */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          onClick={handleOrder}
          style={{ background: "#4CAF50", color: "white", padding: "10px" }}
        >
          📩 Envoyer ma commande
        </button>
      </div>
    </div>
  );
         }
