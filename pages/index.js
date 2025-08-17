<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Configurateur Press-On</title>
  <style>
    body {
      margin: 0;
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(180deg, #fde2e4, #fff1f2, #fdfdfd);
      color: #333;
      text-align: center;
      padding: 20px;
    }

    header {
      font-size: 1.8rem;
      font-weight: bold;
      color: #b66d87;
      margin-bottom: 20px;
    }

    h1 {
      font-size: 1.4rem;
      margin-bottom: 10px;
    }

    .preset-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 20px 0;
    }

    .preset {
      background: white;
      border-radius: 12px;
      padding: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      font-size: 0.9rem;
      line-height: 1.2;
      cursor: pointer;
    }

    .preset:hover {
      background: #f9e0eb;
    }

    form {
      margin-top: 20px;
      background: white;
      padding: 15px;
      border-radius: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      text-align: left;
    }

    form label {
      font-weight: bold;
      font-size: 0.9rem;
      display: block;
      margin-top: 10px;
      color: #555;
    }

    form input, form select {
      width: 100%;
      padding: 8px;
      margin-top: 5px;
      border-radius: 8px;
      border: 1px solid #ccc;
      font-size: 0.9rem;
    }

    button {
      margin-top: 15px;
      padding: 10px 15px;
      background: #b66d87;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
    }

    button:hover {
      background: #9d5d73;
    }
  </style>
</head>
<body>
  <header>✨ État d’Ongles ✨</header>

  <h1>Crée ton kit <i>Press-On</i> personnalisé</h1>

  <section>
    <h3>Préréglages (idées en 1 clic)</h3>
    <div class="preset-container">
      <div class="preset">🌸 Doux & poétique<br>amande • bleu pastel, nude rosé</div>
      <div class="preset">🖤 Glam rock<br>coffin court • noir mat, argent</div>
      <div class="preset">🤍 Mariée lumineuse<br>amande • lilas pâle, blanc nacré</div>
      <div class="preset">💅 Classique nude<br>ovale • nude beige, blanc doux</div>
    </div>
  </section>

  <form>
    <label for="forme">Forme</label>
    <select id="forme">
      <option value="amande">Amande</option>
      <option value="coffin">Coffin</option>
      <option value="ovale">Ovale</option>
    </select>

    <label for="longueur">Longueur</label>
    <select id="longueur">
      <option value="courte">Courte</option>
      <option value="moyenne">Moyenne</option>
      <option value="longue">Longue</option>
    </select>

    <label for="taille">Taille (doigts)</label>
    <input type="text" id="taille" placeholder="Ex: pouce 16mm, index 14mm...">

    <button type="submit">Envoyer ma demande</button>
  </form>
</body>
</html>
