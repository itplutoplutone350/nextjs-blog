

export async function getStaticProps({ params }) {
  const 
  return {
    props: {
      params.id,
    },
  };
}


export default function Post(props) {
  return <p>{props}...</p>;
}
