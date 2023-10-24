import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import { useEffect, useState } from 'react';
import FirstPost from './first-post';
import {LikeButton} from './first-post';
import {convertUnixToDate} from  './first-post';


import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import * as nearAPI from "near-api-js";

// per ora non chiamata
async function walletSelect() {
// esegui wallet selector solo dopo
// che window esiste in browser
// questo perchè viene usato il localstorage
if (typeof window !== 'undefined') {
  // Perform localStorage action
 // My NEAR Wallet for Wallet Selector can be setup without any params or it can take few optional params, see options below.
const myNearWallet = setupMyNearWallet({
  walletUrl: "https://testnet.mynearwallet.com",
  iconUrl: "https://robertop2.altervista.org/Mynearwallet.ico" // optional
});  
  const selector = await setupWalletSelector({
  network: "testnet",
  modules: [myNearWallet],
});

//scegli mynearwallet e connetti al contrattp
const modal = await setupModal(selector, {
  contractId: "msglst5.plutoplutone347.testnet",
});

// renderizzazione javascript del wallet selector
modal.show();

};
}

// funzione di generazione array paths
// Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'pre-rendering'
  //     }
  //   }
  // ]
function generatePathsArray() {
  const paths = [];
  for (let i = 1; i <= 1000; i++) {
    const obj = {
      params: {
        id: i.toString(),
      },
    };
    paths.push(obj);
  }

  return paths;
}


// Return a list of possible value for id
// nota deve chiamarsi id perchè è il nome di questo file dinamico
export async function getStaticPaths() {
  //paths è array di tutti gli id
  const paths =  generatePathsArray();
    
  return {
    paths,
    fallback: false,
  };
}

// Fetch necessary data for the blog post using params.id
// params è oggetto passato da destrutturazione oggetto paths
// creato da getStaticPath
export async function getStaticProps({ params }) {
  //e quì interviene nextjs ..
  const postData = { dato: params.id};
  return {
    props: {
      postData,
    },
  };
}

export default function IlMioPost({ postData }) {
  // definizione di due stati per fornire variabili message e walletConnected al rendering 
  const [message, setMessage] = useState({ text:"vuoto",
        sender: "me", data: "1/2/3", premium: false, likes: 0});
  const [walletConnected, setWalletConnection] = useState(null);
  
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
    
      //Load account to use for thecontract to do first view
      const account = await nearConnection.account("msg2.plutoplutone347.testnet");

      const contract = new Contract(
        account,
        "msglst5.plutoplutone347.testnet",
        {
          viewMethods: ["get_messages","total_messages"],
        }
      );
      const lastmsg = await contract.total_messages({});
      const msglist = await contract.get_messages({ from_index: "0",
      limit: lastmsg, });
      
       // create wallet connection
       const walletConnection = new WalletConnection(nearConnection, 'Message-To-The-World' );
       
       setWalletConnection(walletConnection); // memorizza walletconnection in status  walletConnected per poi usarlo nella finzione di like
       
       setMessage(msglist[postData.dato]); // Memorizza il messaggio letto all'indice ricavato da props postData.dato in status message per poi usarlo nel rendering
            
    };
     
    
    // richiama la funzione fetchdata e quindi esegue connessioni a near
    fetchData();
  }, []);

  // esegui funzione di wallet selectior e relativo rendering
  //walletSelect();

  // rendering
  return (
   <div className={styles.container}>
   <Head>
        <title className={styles.title} >Message to the world</title>
        
        <meta property="og:title" content="This is a Message to the World"></meta>
        <meta property="og:description" content="Your message stored forever on NEAR blockchain"></meta>
        <meta property="og:url" content="https://messagetotheworld.vercel.app"></meta>
        <meta property="og:image" content="https://robertop2.altervista.org/cryptoworldimage.jpg"></meta>
    </Head> 
      <h1 className={styles.title}>Message To The World</h1>
      <p  className={styles.description} >This your Message number:  <b>{postData.dato}</b></p>
      
      <p id="msg"  className={styles.cardgreen} >{message.text}</p> 
      <p> Message was written: {convertUnixToDate(message.data)}</p>
    
       <LikeButton onClick={
       async () => { 
              // walletConnected è status variable 
              if (walletConnected.isSignedIn()) {
              // user is signed in
              alert('Thanks for your like! You will be redirected to MyNear wallet to approve like transaction')
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
              const msgindex = parseInt(postData.dato, 10);
              await contract.increaselikes(
                {
                index: msgindex, // indice del messaggio a cui incrementare i like è postData.dato
                },
              );
              // se non c è redirezione da wallet aggiorna la lista di messaggi fino al mio messaggio
                const msglist = await contract.get_messages({ from_index: "0",
                limit: msgindex+1, });
              // aggiorna quindi lo stato con il messaggio e il numero like incrementato
                setMessage(msglist[msgindex]);
              }
              else {
              // not logged in
              alert('Thanks! but You have to signed in first, you will be redirected to MyNear wallet to sign in'); 
              await walletConnected.requestSignIn(  { contractId: 'msglst5.plutoplutone347.testnet' } );
                  
              }
              
           }    
      }>Add your LIKE ( {message.likes - 100} )</LikeButton>
      
      <FirstPost href="../index"> 🌏 Add a new Message To The World 🌏 </FirstPost>     
      
  </div>
  );
}
