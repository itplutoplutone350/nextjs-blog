import styles from '../../styles/Home.module.css';
import Link from 'next/link';

//esempio di unixdata = 1695188948769211503;
const unixdata = Date.now();
console.log (unixdata);

export function convertUnixToDate(unixTimestamp) {
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
export default function FirstPost({ children, href }) {
  // children è una prop speciale ovvero  è il figlio del tag FirstPost
  const formattedDate = new Date().toLocaleDateString();
  const gotolink = href? href : "../index";
    
  return ( 
    <div>
      
      <p  className={styles.description} >Today date:  {formattedDate}</p> 

      <h5 className={styles.container}  >
      <Link className={styles.cardred} href={gotolink}>{children}</Link>
      <Link className={styles.cardred} href="https://test.near.org/embed/plutoplutone347.testnet/widget/MsgManager-1">Go to NEAR BOS Message editor</Link>
      </h5>
    </div>
  );
}

export function LikeButton({ children, onClick }) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };
  return (
    <button  className={styles.green-button}    onClick={handleClick}>
      {children}
    </button>
  );
}


export function MessageForm( { children, onInputChange, onBtnClick2 }) {
// Define form component to add message.. 
// gestione dell'evento e che contiene la stringa in form input cambiata da utente
const handleInputChange = (e) => {
  if (onInputChange) {
    onInputChange(e);
  }
};

const handleBtnClick2 = () => {
  if (onBtnClick2) {
    onBtnClick2();
  }
};
return (
  <>
    <div className={styles.card}  >
      <label>Message handler</label>
      
    <textarea
    placeholder={children}
    onChange={handleInputChange}
    rows={4} // Questo imposta il numero di righe
    cols={30} // numero colonne
    />
    <br></br>      
    <button  onClick={handleBtnClick2}>
        Save Message
    </button>
    </div>
  </>
);
}
