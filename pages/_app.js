import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {process.env.NEXT_PUBLIC_UMAMI_ID && (
          <script
            async
            src="https://analytics.umami.is/script.js"
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_ID}
          />
        )}
      </Head>
      <Component {...pageProps} />
    </>
  );
}
