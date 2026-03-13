import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="09381e82-0cdc-4a50-aea8-2d29142c49d3" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
