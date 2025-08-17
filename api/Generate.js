// pages/api/generate.js
export default async function handler(req, res) {
  console.log("[/api/generate] call", req.method);

  // Petit ping de test: ouvre /api/generate dans ton navigateur
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "ping",
      hasToken: !!process.env.HF_TOKEN,
      model: process.env.HF_MODEL || "black-forest-labs/FLUX.1-dev",
      note: "POST /api/generate avec { prompt } pour générer."
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { prompt } = req.body || {};
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt manquant" });
    }

    const token = process.env.HF_TOKEN;
    const model = process.env.HF_MODEL || "black-forest-labs/FLUX.1-dev";

    if (!token) {
      console.error("HF_TOKEN manquant dans les variables d'env");
      return res.status(500).json({ error: "HF_TOKEN non configuré côté serveur" });
    }

    const url = `https://api-inference.huggingface.co/models/${model}`;
    console.log("[HF] POST", url);

    const hfRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "*/*"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    console.log("[HF] status", hfRes.status, hfRes.statusText);
    const ct = hfRes.headers.get("content-type") || "";

    if (!hfRes.ok) {
      const errText = await hfRes.text();
      console.error("[HF] error body:", errText?.slice(0, 800));
      return res
        .status(hfRes.status)
        .json({ error: `HF ${hfRes.status} ${hfRes.statusText}`, details: errText });
    }

    // Certains modèles renvoient du binaire (image)
    if (ct.includes("image/") || ct.includes("octet-stream")) {
      const buf = Buffer.from(await hfRes.arrayBuffer());
      const b64 = `data:image/png;base64,${buf.toString("base64")}`;
      return res.status(200).json({ image: b64 });
    }

    // D'autres renvoient du JSON (rare pour les modèles d'image)
    const data = await hfRes.json().catch(async () => {
      const txt = await hfRes.text();
      console.warn("[HF] JSON parse fail, raw:", txt?.slice(0, 800));
      return { raw: txt };
    });

    console.log("[HF] json keys:", Object.keys(data || {}));
    return res.status(200).json({ data });
  } catch (e) {
    console.error("[/api/generate] server error:", e);
    return res.status(500).json({ error: e.message || "Erreur serveur inconnue" });
  }
}
