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
const modal = setupModal(selector, {
  contractId: "msglst5.plutoplutone347.testnet",
});

// renderizzazione javascript del wallet selector
modal.show();
};


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
  const [message, setMessage] = useState({ text:"vuoto",
        sender: "me", data: "1/2/3", premium: false, likes: 0});

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
      const account = await nearConnection.account("plutoplutone347.testnet");

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
      
      
      setMessage(msglist[postData.dato]); // Memorizza il valore in message
      
      // create wallet connection
      const walletConnection = new WalletConnection(nearConnection, 'Message-To-The-World' );
      if(!walletConnection.isSignedIn())   walletConnection.requestSignIn(  { contractId: 'msglst5.plutoplutone347.testnet' } );
    };
     const walletConnection = new WalletConnection(nearConnection);
    //const walletAccountObj = walletConnection.account();
     
    fetchData();
  }, []);

  return (
   <div className={styles.container}>
   <Head>
        <title className={styles.title} >Message to the world</title>
        
        <meta property="og:title" content="This is a Message to the World"></meta>
        <meta property="og:description" content="Your message stored forever on NEAR blockchain"></meta>
        <meta property="og:url" content="https://messagetotheworld.vercel.app"></meta>
        <meta property="og:image" content="https://robertop2.altervista.org/cryptoworldimage.jpg"></meta>
    </Head> 
      <p  className={styles.description} >This your Message To The World <b>{postData.dato}</b></p>
      
      <p id="msg"  className={styles.card} >{message.text}</p> 
      <p className={styles.card} > Message was written: {convertUnixToDate(message.data)}</p>
    
       <LikeButton onClick={
       () => { 
              // const walletConnection = new WalletConnection(nearConnection);
              // walletConnection.isSignedIn()
              if (false) {
              // user is signed in
              alert('Thanks for your like, you are signed in')
              }
              else alert('Thanks for your like but you are not signed in')
             }
      }>Add a LIKE ( {message.likes - 100} )</LikeButton>
      <FirstPost> Today is: </FirstPost>     
    </div>
  );
}
