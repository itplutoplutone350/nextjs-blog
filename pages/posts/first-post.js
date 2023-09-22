
import Link from 'next/link';

//esempio di unixdata = 1695188948769211503;
const unixdata = Date.now();
console.log (unixdata);

function convertUnixToDate(unixTimestamp) {
    const date = new Date(unixTimestamp / 1000000); // Moltiplica per 1000 poiché JavaScript utilizza i millisecondi
  
    const day = date.getDate(); // Ottieni il giorno (1-31)
    const month = date.getMonth() + 1; // Ottieni il mese (0-11), aggiungi 1 per ottenere il mese corretto (1-12)
    const year = date.getFullYear(); // Ottieni l'anno (ad esempio: 2023)
  
    return `${day}/${month}/${year}`;
  }
  
  // Utilizza la funzione per convertire il timestamp Unix in una stringa data
const formattedDate = convertUnixToDate(unixdata);

// nota che quì children è obj destructurazione dell'ogeetto passato che è la props
// ovvero si potrebbe fare  FirstPost(props) e poi dentro usare {props.children}
export default function FirstPost({ children }) {
  // children è una prop spciale ovvero  è il figlio del tag FirstPost
  const formattedDate = new Date().toLocaleDateString();

  return ( 
    <div>
      <h1>First Post</h1>
      <p>  </p>
      <p>{children}  {formattedDate}</p> 
      <h2>
        <Link href="/">Back to home</Link>
      </h2>
    </div>
  );
}