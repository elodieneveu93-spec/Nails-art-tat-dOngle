import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";

export default function Home() {
  // --- Champs libres (brief)
  const [shape, setShape] = useState("");
  const [length, setLength] = useState("");
  const [colors, setColors] = useState("");
  const [motifs, setMotifs] = useState("");
  const [vibe, setVibe] = useState("");

  // --- Tailles et notes
  const [knowSizes, setKnowSizes] = useState(false);
  const [sizesLeft, setSizesLeft] = useState(["", "", "", "", ""]);
  const [sizesRight, setSizesRight] = useState(["", "", "", "", ""]);
  const [notes, setNotes] = useState("");

  // --- Rendu / génération
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Préréglages (idées)
  const PRESETS = [
    {
      label: "Doux & poétique",
      shape: "amande",
      length: "moyenne",
      colors: "bleu pastel, nude rosé",
      motifs: "petites fleurs blanches, paillettes très fines",
      vibe: "léger, romantique, lumineux",
    },
    {
      label: "Glam rock",
      shape: "coffin court",
      length: "courte",
      colors: "noir mat, chrome argent",
      motifs: "french inversée fine, accents métalliques",
      vibe: "audacieux, soirée, edgy",
    },
    {
      label: "Minimal chic",
      shape: "ovale court",
      length: "courte",
      colors: "nude beige, blanc",
      motifs: "french fine, demi-lune",
      vibe: "propre, bureau, quotidien",
    },
    {
      label: "Mariée lumineuse",
      shape: "amande",
      length: "longue",
      colors: "lilas très pâle, blanc nacré",
      motifs: "babyboomer, nacres subtiles",
      vibe: "élégant, photo-ready, intemporel",
    },
    {
      label: "Pastel romantique",
      shape: "amande",
      length: "moyenne",
      colors: "rose poudré, lilas, ivoire",
      motifs: "micro-fleurs, traits fins dorés",
      vibe: "printanier, féminin, délicat",
    },
    {
      label: "Classique nude",
      shape: "ovale",
      length: "moyenne",
      colors: "nude rosé, blanc doux",
      motifs: "french subtile",
      vibe: "sobre, épuré, chic",
    },
  ];

  // --- Visuel de fond (bois) + placeholders (démo)
  const WOOD =
    "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1600&auto=format&fit=crop";
  const PLACEHOLDERS = useMemo(
    () => [
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1604654894693-7d829b6a48bf?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-154051861
