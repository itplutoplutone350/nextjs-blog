export async function getStaticPaths() {
  const paths =  [
     {
       params: {
         id: '20'
       }
     },
     {
       params: {
         id: '12'
       }
     }
   ];
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  console.log(params);
  return {
    props: {
      id: params.id,
    },
  };
}


export default function Post(props) {
  return <p>{props}...</p>;
}
