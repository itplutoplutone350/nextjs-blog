

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
