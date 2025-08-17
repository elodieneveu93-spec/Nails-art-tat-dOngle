// pages/api/generate.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    prompt,
    width = 768,
    height = 1024,
    guidance = 3,              // influence du prompt (2–6 conseillé)
    num_inference_steps = 4,   // + rapide / coût réduit (tu peux monter à 8–12 si besoin)
    seed,                      // optionnel : pour des résultats répétables
  } = req.body || {};

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Le prompt est requis." });
  }

  if (!process.env.HF_TOKEN) {
    return res.status(500).json({
      error:
        "HF_TOKEN manquant dans les variables d’environnement Vercel.",
    });
  }

  const MODEL_ID = "black-forest-labs/FLUX.1-dev"; // gratuit (usage non commercial)

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            width,
            height,
            guidance_scale: guidance,
            num_inference_steps,
            ...(seed ? { seed } : {}),
          },
          options: {
            // démarre le modèle s’il “dort” et attends le résultat
            wait_for_model: true,
          },
        }),
      }
    );

    if (!response.ok) {
      // Lis le message d’erreur renvoyé par l’API pour t’aider au debug
      const details = await response.text();
      return res.status(response.status).json({
        error: `Erreur HuggingFace (${response.status})`,
        details: details?.slice(0, 500),
      });
    }

    // L’API renvoie directement l’image binaire -> on convertit en base64
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    return res.status(200).json({ image: dataUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Erreur serveur" });
  }
}
