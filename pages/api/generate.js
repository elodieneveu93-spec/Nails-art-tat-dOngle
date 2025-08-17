// pages/api/generate.js
export const config = {
  api: { bodyParser: true },
};

const HF_MODEL = process.env.HF_MODEL || "stabilityai/sdxl-turbo";
const HF_TOKEN = process.env.HF_TOKEN;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }
  if (!HF_TOKEN) {
    return res.status(500).json({ error: "HF_TOKEN manquant dans Vercel > Settings > Env" });
  }

  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt manquant" });
    }

    // Appel Hugging Face Inference API (modèles non-gated)
    const hfResp = await fetch(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          Accept: "image/png",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          options: { wait_for_model: true }, // charge le modèle si “à froid”
        }),
      }
    );

    // Si HF renvoie du JSON d’erreur, on le surface
    const ct = hfResp.headers.get("content-type") || "";
    if (!hfResp.ok) {
      let msg = `HTTP ${hfResp.status}`;
      if (ct.includes("application/json")) {
        const j = await hfResp.json().catch(() => ({}));
        if (j && (j.error || j.message)) msg += ` - ${j.error || j.message}`;
      } else {
        const t = await hfResp.text().catch(() => "");
        if (t) msg += ` - ${t}`;
      }
      console.error("HF error:", msg);
      return res.status(502).json({ error: `Erreur génération HF: ${msg}` });
    }

    // Réponse binaire -> base64 data URL
    const buffer = Buffer.from(await hfResp.arrayBuffer());
    const base64 = buffer.toString("base64");
    return res.status(200).json({
      image: `data:image/png;base64,${base64}`,
      model: HF_MODEL,
    });
  } catch (e) {
    console.error("Generate crash:", e);
    return res.status(500).json({ error: "Erreur génération côté serveur" });
  }
}
