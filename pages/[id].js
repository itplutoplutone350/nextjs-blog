

export async function getStaticProps({ params }) {
  console.log(params);
  return {
    props: {
      params.id,
    },
  };
}


export default function Post(props) {
  return <p>{props}...</p>;
}
