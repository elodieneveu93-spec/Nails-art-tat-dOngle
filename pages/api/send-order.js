export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const order = req.body;

    if (!order) {
      return res.status(400).json({ error: "Données de commande manquantes" });
    }

    // Ici tu pourrais envoyer par email ou sauvegarder en DB
    console.log("📦 Nouvelle commande reçue :", order);

    res.status(200).json({ message: "Commande enregistrée avec succès" });

  } catch (err) {
    console.error("Erreur enregistrement commande:", err);
    res.status(500).json({ error: "Impossible d’enregistrer la commande" });
  }
}
