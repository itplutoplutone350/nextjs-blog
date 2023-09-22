
import Link from 'next/link';

const unixdata = 1695188948769211503;

function convertUnixToDate(unixTimestamp) {
    const date = new Date(unixTimestamp / 1000000); // Moltiplica per 1000 poiché JavaScript utilizza i millisecondi
  
    const day = date.getDate(); // Ottieni il giorno (1-31)
    const month = date.getMonth() + 1; // Ottieni il mese (0-11), aggiungi 1 per ottenere il mese corretto (1-12)
    const year = date.getFullYear(); // Ottieni l'anno (ad esempio: 2023)
  
    return `${day}/${month}/${year}`;
  }
  
  // Utilizza la funzione per convertire il timestamp Unix in una stringa data
const formattedDate = convertUnixToDate(unixdata);


export default function FirstPost() {
    return ( 
    <div>
        <h1>First Post</h1>
        <p> data odierna: {formattedDate}</p>
        <h2>
        <Link href="/">Back to home</Link>
        </h2>
    </div>
    );
  }
  