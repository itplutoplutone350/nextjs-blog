import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Link from 'next/link';
import FirstPost from './posts/first-post';
import {LikeButton} from './posts/first-post';
import {MessageForm} from './posts/first-post';
import { useEffect, useState } from 'react';

import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import * as nearAPI from "near-api-js";

let lastmsg = 0;


/*
//dedicated to message
// also with deposit and gas fee parameters
const onBtnClick2 = () => {
  if (!state.newmessage) {
    return;
  }
  deposit = parseInt(props.Ndeposit) > 10000000 ? props.Ndeposit : "10000001";
  Near.call(
    messagelist,
    "add_message",
    {
      text: state.newmessage,
    },
    "300000000000000",
    deposit
  );
};


const onInputChange = ({ target }) => {
  // target destrutturazione evento passato da tag input (form) da cui estrapola la proprietà che è un oggetto target, input viene da component greetingForm.
  // con la string target.value costruisco oggetto {greeting : target.value} che ha la stessa struttura della view del contratto
  //State.update ({greeting : target.value})

  // a seguire aggiornamento dello stato relativo ai messaggi
  State.update({
    newmessage: target.value,
    index: messageview,
  });
};
*/


export default function Home() {
// definizione degli stati a livello global di questo componente
const [message, setMessage] = useState({ text:"vuoto",
 sender: "me", data: "1/2/3", premium: false, likes: 0});
const [walletConnected, setWalletConnection] = useState(null);

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
       
       setMessage(msglist[lastmsg-1]); // Memorizza ultimo messaggio inserito in lista contratto
       //calcola il tempo passato da inserimento ultimo messaggio a ora che la pagina viene mostrata
       unixdata = Date.now();
       difftime = unixdata - (message.data /1000000);
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
        alert('Thanks for your 🌏Message🌏! Eventually You will be redirected to MyNear wallet to approve the transaction')
        
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
        await contract.add_message(
          {
              text: message.text, // indice del messaggio a cui incrementare i like è postData.dato
          },
        );
        // eseguito solo in caso non sia necessaria redirezione a wallet
        // text è già quello inserito ma dopo chiamata a contratto ritorna altre proprietà tra cui data
        lastmsg++;
        const msglist = await contract.get_messages({ from_index: "0",
          limit: lastmsg, }); 
        setMessage(msglist[lastmsg-1]);
        unixdata = Date.now();
        difftime = unixdata - (msglist[lastmsg-1].data /1000000);
        //alert('diff ',difftime); 
        }
        else {alert('😔 Sorry you need to enter your message again, You first have to sign in, You will be redirected to MyNear wallet'); 

        await walletConnected.requestSignIn(  { contractId: 'msglst5.plutoplutone347.testnet' } );
        
        }
      
      };


      const gestisciInputChangeAddMessage = (e) => {
      setMessage({ text: e.target.value,
      sender: "changedmessage", data: "4/5/6", premium: false, likes: 1});
      };

  // definisco url del link al messaggio postato
  const linktomsg = "https://messagetotheworld.vercel.app/posts/" + (lastmsg-1).toString(); 
  return (
      
      <div className={styles.container}>
        <Head>
          <title>Message to the world</title>
          
          <meta property="og:title" content="This is a Message to the World"></meta>
          <meta property="og:description" content="Your message stored forever on NEAR blockchain"></meta>
          <meta property="og:url" content="https://messagetotheworld.vercel.app"></meta>
          <meta property="og:image" content="https://robertop2.altervista.org/cryptoworldimage.jpg"></meta>

          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main> 
          <h1 className={styles.title}>Add your new Message To The World</h1>
    
          <MessageForm onInputChange={gestisciInputChangeAddMessage} onBtnClick2={gestisciBtnClickAddMessage}> add new message here </MessageForm>

            {
              // in base al diff time da ultimo agg messaggio decidi se mostrare il link al messaggio
              // difftime viene calcolato all'inizio della renderizzazione lato client e poi tutte le volte che si fa save di un messaggio
              // se son passati meno di 3 minuti da ultimo post messaggio allora mostra link perchè potrebbe esser stato salvato da user da poco
              (difftime < 180000) ?
              <FirstPost href={linktomsg}> 🌎 Go to Message link 🌍 </FirstPost>
              :
              <p>Waiting for a new message</p>         
            }
          <p id="msg"  className={styles.cardgreen} >🌍 Last message: 🌎 <br></br> {message.text}</p> 
      
          <LikeButton onClick={() => alert('Thanks for your like')}>LIKE it</LikeButton>
          <br></br>
          <p> --------- </p> 
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
