// pages/api/generate.js
// Route serveur Next.js : reçoit { prompt, num } et renvoie des data:URL d'images.
// Nécessite la variable d'environnement HUGGINGFACE_TOKEN sur Vercel.

export const config = {
  api: { bodyParser: { sizeLimit: "1mb" } },
};

// Modèle IA : FLUX.1-dev (bon rendu, dispo via Inference Providers)
const HF_MODEL = "black-forest-labs/FLUX.1-dev";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { prompt, num = 3 } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ ok: false, error: "Missing prompt" });
    }

    const token = process.env.HUGGINGFACE_TOKEN;
    if (!token) {
      return res.status(500).json({ ok: false, error: "Missing HUGGINGFACE_TOKEN" });
    }

    // Safety: limite à 6 images max par requête (coût)
    const count = Math.max(1, Math.min(Number(num) || 3, 6));

    const images = [];
    for (let i = 0; i < count; i++) {
      const r = await fetch(
        `https://api-inference.huggingface.co/models/${HF_MODEL}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          // Le champ attendu est "inputs"
          body: JSON.stringify({
            inputs: prompt,
            // Option utile : force l’attente si le modèle “réveille”
            options: { wait_for_model: true },
          }),
        }
      );

      if (!r.ok) {
        // Lis le texte pour diagnostiquer (quota, permissions, etc.)
        const text = await r.text();
        console.error("HF error", r.status, text);
        return res.status(200).json({
          ok: false,
          error: "HF API error",
          status: r.status,
        });
      }

      // La réponse est une image binaire (PNG/JPEG)
      const buf = Buffer.from(await r.arrayBuffer());
      const base64 = buf.toString("base64");

      // La plupart des modèles renvoient du PNG
      images.push(`data:image/png;base64,${base64}`);
    }

    return res.status(200).json({ ok: true, images });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ ok: false, error: "Unexpected server error" });
  }
}
