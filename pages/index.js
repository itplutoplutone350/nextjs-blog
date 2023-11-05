import styles from '../styles/Home.module.css';

import Head from 'next/head';
import Script from 'next/script'
import Link from 'next/link';


import FirstPost from './posts/first-post';
import {LikeButton} from './posts/first-post';
import {MessageForm} from './posts/first-post';
import {DropdownMenu} from './posts/first-post';
import {DropdownMenuMsg} from './posts/first-post';
import { useEffect, useState } from 'react';

import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import * as nearAPI from "near-api-js";

let lastmsg = 1;

export default function Home() {
// definizione degli stati a livello global di questo componente
const [message, setMessage] = useState({ text:"vuoto", sender: "sendereiniziale", data: "1/2/3", premium: false, likes: 0});
const [walletConnected, setWalletConnection] = useState(null);
const [messagelst, setMessagelst] = useState([{}]);
const [msgselected, setMessagesel] = useState(0);
                                          
  
// opziomi di message add e relativo stato inizializzato con la prima delle opzioni
const msgaddoptions = ["Base - free", "Premium - 0.5 Near"];
const [addmessagemode, setAddMode] = useState(msgaddoptions[0]);

// stato con user loggato
const [userlogged, setUserlogged] = useState("No User Signed in");

// variabili di controllo del tempo intercorso dall inserimento ultimo messaggio
//esempio di unixdata = 1695188948769211503 ritornata da contratto messaggio;
let unixdata = Date.now();
let difftime = unixdata - (message.data /1000000);

  // funzione react eseguita lato client quindi dopo pre-rendering lato server 
  useEffect(() => {
    const fetchData = async () => {
      // codice eseguito su client dopo rendering server
      //connect to near netw
      const { connect } = nearAPI;
      // creates keyStore using private key in local storage
      const { keyStores } = nearAPI;
      const { Contract } = nearAPI;
      const { WalletConnection } = nearAPI;
  
      const myKeyStore = new keyStores.BrowserLocalStorageKeyStore();
        
      const connectionConfig = {
        networkId: "testnet",
        keyStore: myKeyStore, // first create a key store 
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://testnet.mynearwallet.com",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://explorer.testnet.near.org",
      };
      const nearConnection = await connect(connectionConfig);
      
      //Load account to use for the contract
      const account = await nearConnection.account("msg2.plutoplutone347.testnet");

      const contract = new Contract(
        account,
        "msglst5.plutoplutone347.testnet",
        {
          viewMethods: ["get_messages","total_messages"],
        }
      );
      lastmsg = await contract.total_messages({});
      
      const msglist = await contract.get_messages({ from_index: "0",
      limit: lastmsg, });
      
       // create wallet connection
       const walletConnection = new WalletConnection(nearConnection, 'Message-To-The-World' );
       
        setWalletConnection(walletConnection); // memorizza walletconnection in status  walletConnected

        setMessage(msglist[ lastmsg-1  ]); // Memorizza messaggio 0 default choice  inserito in lista contratto
        
        // la lista in stato per menù tendina choice message      
        setMessagelst(msglist);
      
       //calcola il tempo passato da inserimento ultimo messaggio a ora che la pagina viene mostrata
       unixdata = Date.now();
       difftime = unixdata - (message.data /1000000);
       
    // Aspetta 1 secondi prima di eseguire il check user signedin
    setTimeout(function() {
    // Il codice da eseguire dopo l'attesa di 1 secondi
    (walletConnection.isSignedIn())? 
         setUserlogged(walletConnection.getAccountId())
              :
         setUserlogged("No User Signed in");
     }, 1000); // 1000 millisecondi

      
        // abilita sotto per fare signout all'inizio del display frontend
       //walletConnection.signOut();
    };
     
    
    // richiama la funzione fetchdata e quindi esegue connessioni a near
    fetchData();
  }, []);


  
      // definisce costante con codice funzione da passare a oggetto MessageForm evento onBtnClick2
      const gestisciBtnClickAddMessage = async () => {
        
        // walletConnected è status variable 
        if (walletConnected.isSignedIn()) {
        // user is signed in
        alert('Thanks for your 🌏Message🌏! You could be redirected to MyNear wallet to approve the transaction')
        
        const walletaccount = await   walletConnected.account();
        console.log("walletaccount che incrementa like ",walletaccount);
        const { Contract } = nearAPI;
        const contract = new Contract(
          walletaccount,
          "msglst5.plutoplutone347.testnet",
          {
          changeMethods: ["add_message","increaselikes"],
          viewMethods: ["get_messages","total_messages"],
          }
        );
        // a seconda della modalità scelta da menu tendina faccio messagge add con deposito o senza
        if (addmessagemode === msgaddoptions[0]){
        await contract.add_message(
          {
              text: message.text, // indice del messaggio a cui incrementare i like è postData.dato
          },
        );
        }
        else
        {
         
         const deposit = "500000000000000000000000";
         await contract.add_message(
          {
              text: message.text, // indice del messaggio a cui incrementare i like è postData.dato
          },
         "300000000000000",
              deposit            
        ); 
        };
        // eseguito solo in caso non sia necessaria redirezione a wallet
        // text è già quello inserito ma dopo chiamata a contratto ritorna altre proprietà tra cui data
        lastmsg++;
        const msglist = await contract.get_messages({ from_index: "0", limit: lastmsg, }); 
        setMessage(msglist[lastmsg-1]);
        unixdata = Date.now();
        difftime = unixdata - parseInt((msglist[lastmsg-1].data /1000000));
        //alert(unixdata); 
        }
        else {
        alert('😔 Sorry you need to enter your message again, You first have to sign in, You will be redirected to MyNear wallet'); 

        await walletConnected.requestSignIn(  { contractId: 'msglst5.plutoplutone347.testnet' } );
         
        (walletConnected.isSignedIn())? 
         setUserlogged(walletConnected.getAccountId())
              :
         setUserlogged("No User Signed in");
          
        }
      
      };

      const  gestisciInputChangeAddMessage = async (e) => {
      if (walletConnected.isSignedIn()) {
        
        //permette aggiornamento del test anche direttamente nel rendering del messaggio
        setMessage({ text: e.target.value,
        sender: userlogged  , data: "4/5/6", 
        premium: addmessagemode === msgaddoptions[0] ? false : true  , 
        likes: 1});     
      }
      else
     {
       alert('😔 Sorry You first have to sign in, You will be redirected to MyNear wallet'); 

       await walletConnected.requestSignIn(  { contractId: 'msglst5.plutoplutone347.testnet' } );
      };
    }

    
    // <DropdownMenu  options={msgaddoptions}  selectedOption={addmessagemode} onOptionChange={gestisciInputChangeOption}> Message add options </DropdownMenu>
    // costante funzione usata da evento di componente DropdownMenu  menu tendina
    const gestisciInputChangeOption = (selectedvalue) => {
    // semplicemente aggiorna lo stato addmessagemode del menu con l opzione scelta e questo stato viene usato come paramentro selectedOption di DropdownMenu
    console.log(selectedvalue);
    (selectedvalue === msgaddoptions[1])? alert("You have selected PREMIUM message, your new message will be highlighted!") : alert("You selected the base option");
    setAddMode(selectedvalue);
     };


    // opzione di scelta messaggio eventualm da modificarw
   const gestisciMenuonMsgOptionChange = (selectedValue) => {
   const selectedmessage = messagelst[selectedValue];
   setMessagesel(selectedValue);
   //setMessage(selectedmessage);
   
   };
  
  // definisco url del link al messaggio postato
  const linktomsglast = "https://messagetotheworld.vercel.app/posts/" + (lastmsg-1).toString(); 
  let linktomsg  =  "https://messagetotheworld.vercel.app/posts/" + msgselected;
  return (
      
      <div className={styles.container}>
        <Head>
          <title>Message to the world</title>
          
          <meta property="og:title" content="This Message to the World editor"></meta>
          <meta property="og:description" content="Your message stored forever on NEAR blockchain"></meta>
          <meta property="og:url" content="https://messagetotheworld.vercel.app"></meta>
          <meta property="og:image" content="https://robertop2.altervista.org/cryptoworldimage.jpg"></meta>
          
     <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8956396660152170"
     crossorigin="anonymous"></Script>
       
        </Head>
       
        <main> 
          <h1 className={styles.title}>Add your new Message To The World</h1>
    
          <MessageForm onInputChange={gestisciInputChangeAddMessage} onBtnClick2={gestisciBtnClickAddMessage}> .. Add new message here </MessageForm>
          
          <DropdownMenu  options={msgaddoptions}  selectedOption={addmessagemode} onOptionChange={gestisciInputChangeOption}> Message add options </DropdownMenu>
            {
              // in base al diff time da ultimo agg messaggio decidi se mostrare il link al messaggio
              // difftime viene calcolato all'inizio della renderizzazione lato client e poi tutte le volte che si fa save di un messaggio
              // se son passati meno di 3 minuti da ultimo post messaggio allora mostra link perchè potrebbe esser stato salvato da user da poco
              (difftime < 180000 && message.sender === userlogged) ?
              <FirstPost href={linktomsglast}> 🌎 Go to Message link 🌍 </FirstPost>
              :
              <p></p>
            }
                
          
          <LikeButton onClick= 
            { async () => 
             {
              if (!walletConnected.isSignedIn()) 
               {
                 alert(' You will be redirected to MyNear wallet to login'); 
                 await walletConnected.requestSignIn(  { contractId: 'msglst5.plutoplutone347.testnet' } );
               };    
             }
            }  > User: <b>{userlogged}</b>  </LikeButton>
          <br></br>

         {
          message.sender === userlogged ? (
          !message.premium ? (
      
          <p  className={styles.cardgreen}>
          🌍 Message preview: 🌎 <br></br> {message.text}
          </p>
      
          ) : (
      
          <p  className={styles.cardpremiumlink}>
          🌍 Message preview: 🌎 <br></br> <b>{message.text}</b>
         </p>        
         )
           
         ) : (
    
         <p className={styles.cardblue}>
         ... Watiting for Your next message <br></br>
         </p>
        )
         
       }

        <DropdownMenuMsg options={messagelst} selectedOption={msgselected} onOptionChange={gestisciMenuonMsgOptionChange} userid={userlogged}>
          Link to Your Message : 
        </DropdownMenuMsg>
  
         
          <br></br>
          <br></br>
          <p> --- This App has been build with Next.js ---</p>  
          <br></br> 
      
          <h1 className={styles.description}>
            Welcome to <a href="https://nextjs.org">Next.js!</a>
          </h1>


          <div className={styles.grid}>
            <a href="https://nextjs.org/docs" className={styles.card}>
              <h3>Documentation &rarr;</h3>
              <p>Find in-depth information about Next.js features and API.</p>
            </a>

            <a href="https://nextjs.org/learn" className={styles.card}>
              <h3>Learn &rarr;</h3>
              <p>Learn about Next.js in an interactive course with quizzes!</p>
            </a>

            <a
              href="https://github.com/vercel/next.js/tree/canary/examples"
              className={styles.card}
            >
              <h3>Examples &rarr;</h3>
              <p>Discover and deploy boilerplate example Next.js projects.</p>
            </a>

            <a
              href="https://vercel.com/import?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
              className={styles.card}
            >
              <h3>Deploy &rarr;</h3>
              <p>
                Instantly deploy your Next.js site to a public URL with Vercel.
              </p>
            </a>
          </div>
        </main>

        <footer>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by{' '}
            <img src="/vercel.svg" alt="Vercel" className={styles.logo} />
          </a>
        </footer>

        <style jsx>{`
          main {
            padding: 5rem 0;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          footer {
            width: 100%;
            height: 100px;
            border-top: 1px solid #eaeaea;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          footer img {
            margin-left: 0.5rem;
          }
          footer a {
            display: flex;
            justify-content: center;
            align-items: center;
            text-decoration: none;
            color: inherit;
          }
          code {
            background: #fafafa;
            border-radius: 5px;
            padding: 0.75rem;
            font-size: 1.1rem;
            font-family:
              Menlo,
              Monaco,
              Lucida Console,
              Liberation Mono,
              DejaVu Sans Mono,
              Bitstream Vera Sans Mono,
              Courier New,
              monospace;
          }
        `}</style>

        <style jsx global>{`
          html,
          body {
            padding: 0;
            margin: 0;
            font-family:
              -apple-system,
              BlinkMacSystemFont,
              Segoe UI,
              Roboto,
              Oxygen,
              Ubuntu,
              Cantarell,
              Fira Sans,
              Droid Sans,
              Helvetica Neue,
              sans-serif;
          }
          * {
            box-sizing: border-box;
          }
        `}</style>
      </div>
    );
  }
