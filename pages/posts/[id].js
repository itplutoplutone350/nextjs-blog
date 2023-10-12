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


//postData è destrutturazione di props
export default function IlMioPost({ postData }) {
  const msg = "https://test.near.org/embed/plutoplutone347.testnet/widget/MsgToTheWorld-0?index="+{postData.dato};
  return (
    <div>
    <p>This is dinamic data from the url {postData.dato}...</p>;
    <iframe  src={msg} height="200"></iframe>
    </div>
  )
}
