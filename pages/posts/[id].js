
import { useEffect, useState } from 'react';

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
  for (let i = 1; i <= 10; i++) {
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
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // codice eseguito su client dopo rendering server
      //connect to near netw
      const { connect } = nearAPI;
      // creates keyStore using private key in local storage
      const { keyStores } = nearAPI;
      const { Contract } = nearAPI;
      const myKeyStore = new keyStores.BrowserLocalStorageKeyStore();
        
      const connectionConfig = {
        networkId: "testnet",
        keyStore: myKeyStore, // first create a key store 
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://wallet.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://explorer.testnet.near.org",
      };
      const nearConnection = await connect(connectionConfig);

      //create account to use for the contract
      const account = await nearConnection.account("plutoplutone347.testnet");

      const contract = new Contract(
        account,
        "msglst5.plutoplutone347.testnet",
        {
          viewMethods: ["get_messages"],
        }
      );

      const response = await contract.get_messages({});
      setMessage(response[postData.dato].text); // Memorizza il valore in message
    };

    fetchData();
  }, []);

  return (
    <div>
      <p>This is dinamic data from the URL {postData.dato}...</p>
      <iframe src={`https://test.near.org/embed/plutoplutone347.testnet/widget/MsgToTheWorld-0?index=${postData.dato}`} height="200"></iframe>
      <p id="msg">Your Message: {message}</p> 
    </div>
  );
}
