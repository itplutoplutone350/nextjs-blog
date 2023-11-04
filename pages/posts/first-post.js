import styles from '../../styles/Home.module.css';
import Link from 'next/link';

//esempio di unixdata = 1695188948769211503;
// attenzione che dipende da orario locale impostato su client
const unixdata = Date.now();
console.log (unixdata);

// converte unix time in date
export function convertUnixToDate(unixTimestamp) {
    const date = new Date(unixTimestamp / 1000000); // Moltiplica per 1000 poiché JavaScript utilizza i millisecondi
  
    const day = date.getDate(); // Ottieni il giorno (1-31)
    const month = date.getMonth() + 1; // Ottieni il mese (0-11), aggiungi 1 per ottenere il mese corretto (1-12)
    const year = date.getFullYear(); // Ottieni l'anno (ad esempio: 2023)
  
    return `${day}/${month}/${year}`;
  }
  
// Utilizza la funzione per convertire il timestamp Unix in una stringa data
// funzioma solo con unix time dei contratti
//const formattedDate = convertUnixToDate(unixdata);

// nota che quì children è obj destructurazione dell'oggetto passato che è la props
// ovvero si potrebbe fare  FirstPost(props) e poi dentro usare {props.children}
export default function FirstPost({ children, href }) {
  // children è una prop speciale ovvero  è il figlio del tag FirstPost
  const formattedDate = new Date().toLocaleDateString();
  // funzione che definisce il link 
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
    <button  className={styles.greenbutton}    onClick={handleClick}>
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
    <div className={styles.cardblue}  >
      <label>Message handler</label>
      <br></br>
      <textarea
      placeholder={children}
      onChange={handleInputChange}
      rows={7} // Questo imposta il numero di righe
      cols={33} // numero colonne
      />
      <br></br>      
      
      <button   className={styles.bluebutton}  onClick={handleBtnClick2}>
        Save Message
      </button>
    </div>
  </>
);
}

export function DropdownMenu({ children, options, selectedOption, onOptionChange }) {
  const handleOptionChange = (e) => {
    const selectedValue = e.target.value;
    if (onOptionChange) {
      onOptionChange(selectedValue);
    }
  };
  console.log(selectedOption);
  return (
    <div className={styles.dropdown}>
      <label>{children}</label>
      <select value={selectedOption} onChange={handleOptionChange}>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export function DropdownMenuMsg({ children, options = [{}], selectedOption, onOptionChange, userid }) {
  const handleOptionChange = (e) => {
    const selectedValue = e.target.value;
    if (onOptionChange) {
      onOptionChange(selectedValue);
    }
  };
  console.log(selectedOption);

  let lastMatchingIndex = -1; // Inizializza la variabile con un valore predefinito

  const selectelement = options.map((option, index) => {
    if (option.sender === userid) {
      lastMatchingIndex = index; // Aggiorna l'indice se la condizione è soddisfatta
      return (
        <option key={index} value={index}>
          {index}
        </option>
      );
    } else {
      return <></>;
    }
  });
    
  let lastmsg = " ";
  if (selectedOption == 0) {   
      selectedOption =  lastMatchingIndex 
      
     // lastmsg = "Last message: " + options[lastMatchingIndex].text;
      
  };
    
  return (
    <span className={styles.dropdown}>

      <p> {options[lastMatchingIndex].sender } </p>
      
      <label>{children}</label>
      <select value={selectedOption} onChange={handleOptionChange}>
        {selectelement}
      </select>
      
    </span>
  );
}

