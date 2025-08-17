export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { prompt } = req.body;

    // Vérifier que le prompt existe
    if (!prompt) {
      return res.status(400).json({ error: "Prompt manquant" });
    }

    // Appel à Hugging Face
    const response = await fetch(
      "https://api-inference.huggingface.co/models/prompthero/openjourney",
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`, // ⚡ ICI on utilise bien la variable Vercel
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur Hugging Face:", errorText);
      return res.status(500).json({ error: "Échec de la génération IA" });
    }

    // Hugging Face renvoie une image en base64
    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");

    res.status(200).json({ image: `data:image/png;base64,${base64Image}` });
  } catch (error) {
    console.error("Erreur API:", error);
    res.status(500).json({ error: "Erreur génération IA" });
  }
}
