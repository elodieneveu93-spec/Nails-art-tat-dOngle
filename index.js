export default function Home() {
  return (
    <div style={{fontFamily:'sans-serif', padding:'2rem'}}>
      <h1>Configurateur Press-On Nails 💅</h1>
      <p>Choisissez votre couleur, forme et motifs pour créer votre kit personnalisé.</p>
      <form>
        <label>Couleur: <input type='text' name='color' /></label><br/>
        <label>Forme: <input type='text' name='shape' /></label><br/>
        <label>Motifs: <input type='text' name='pattern' /></label><br/>
        <label>Taille: <input type='text' name='size' /></label><br/>
        <button type='submit'>Générer mon kit</button>
      </form>
    </div>
  )
}
