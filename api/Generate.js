// pages/api/generate.js (démo sans IA)
export default async function handler(req, res) {
  // petite liste d'images de démonstration libres (unsplash)
  const demo = [
    "https://images.unsplash.com/photo-1541080477408-659cf03d4d92?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1604654894693-7d829b6a48bf?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1598532213001-5f662b1cf24d?q=80&w=1200&auto=format&fit=crop",
  ];

  try {
    // Choisir une image au hasard
    const url = demo[Math.floor(Math.random() * demo.length)];

    // Télécharger l'image côté serveur et la renvoyer telle quelle
    const r = await fetch(url);
    if (!r.ok) {
      return res.status(502).json({ ok: false, error: "Fetch demo image failed" });
    }

    const arrBuf = await r.arrayBuffer();
    const buf = Buffer.from(arrBuf);

    res.setHeader("Content-Type", r.headers.get("content-type") || "image/jpeg");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(buf);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
