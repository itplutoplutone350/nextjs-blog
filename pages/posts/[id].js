
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



export async function getStaticPaths() {
  const paths =  generatePathsArray();
    
  return {
    paths,
    fallback: false,
  };
}


export async function getStaticProps({ params }) {
  //console.log(params);
  return {
    props: {
      id: params.id,
    },
  };
}



export default function Post() {
  return <p>...</p>;
}
