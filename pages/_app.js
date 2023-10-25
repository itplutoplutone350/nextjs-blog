import '../styles/globals.css';


import { AppProps } from 'next/app';

export default function ({ Component, pageProps }) {
  return <Component {pageProps} />;
}
