import Head from 'next/head';
import Link from 'next/link';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — Contact Your MP</title>
        <meta name="description" content="Privacy policy for the Contact Your MP civic tool." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="page-wrapper">
        <header className="hero" style={{ padding: '2.5rem 1.5rem 2rem' }}>
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-content">
            <Link href="/" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', textDecoration: 'none' }}>
              ← Back to home
            </Link>
            <h1 style={{ marginTop: '0.75rem' }}>Privacy Policy</h1>
          </div>
        </header>

        <main className="prose-page">
          <p className="prose-updated">Last updated: March 2026</p>

          <p>
            This tool is a free civic resource built to help Canadian residents contact
            their federal Member of Parliament. It is designed to collect no personal data.
          </p>

          <h2>What this tool does not do</h2>
          <ul>
            <li>No personal data is stored or transmitted by this site.</li>
            <li>No cookies are used. No analytics. No tracking of any kind.</li>
            <li>
              The optional personal note field populates only in your own email client
              when you click &ldquo;Open in Email Client.&rdquo; It is never sent to
              or stored by this site.
            </li>
          </ul>

          <h2>How it works</h2>
          <p>
            When you enter your postal code and click &ldquo;Find My MP&rdquo;, your
            postal code is forwarded in real time to the publicly available{' '}
            <a href="https://represent.opennorth.ca/" target="_blank" rel="noopener noreferrer">
              Represent.ca API
            </a>{' '}
            (Open North), which returns your MP&rsquo;s name, riding, and email address.
            This information is displayed in your browser and nothing is retained by
            this site.
          </p>
          <p>
            When you click &ldquo;Open in Email Client&rdquo;, your browser opens a{' '}
            <code>mailto:</code> link. The email is composed and sent entirely through
            your own email application. No data passes through our servers at this step.
          </p>

          <h2>Hosting</h2>
          <p>
            This tool is hosted on Netlify, which may capture standard server access
            logs (IP addresses, request timestamps) as part of normal hosting operations.
            See{' '}
            <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer">
              Netlify&rsquo;s Privacy Policy
            </a>{' '}
            for details.
          </p>

          <h2>Contact</h2>
          <p>
            Questions or concerns:{' '}
            <a href="mailto:baaham.ca@gmail.com">baaham.ca@gmail.com</a>
          </p>

          <p style={{ marginTop: '2rem' }}>
            <Link href="/">← Return to the tool</Link>
          </p>
        </main>

        <footer className="footer">
          <p>
            This tool does not store any personal data.{' '}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </footer>
      </div>
    </>
  );
}
