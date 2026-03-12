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
            This Privacy Policy explains how the <strong>Contact Your MP</strong> tool
            (the &ldquo;Tool&rdquo;) handles information when you use it. This Tool is a
            free civic resource built to help Canadian residents contact their federal
            Member of Parliament. We have designed it from the ground up to collect as
            little data as possible.
          </p>

          <h2>1. Information We Do Not Collect</h2>
          <p>We do not collect, store, or transmit:</p>
          <ul>
            <li>Your name, email address, or any personal identifiers</li>
            <li>Your postal code (it is used only to query a third-party API in real time and is not logged)</li>
            <li>The contents of any message you draft or send</li>
            <li>IP addresses beyond what your hosting provider&rsquo;s standard access logs may capture</li>
            <li>Cookies or any local tracking data</li>
          </ul>

          <h2>2. How the Tool Works</h2>
          <p>
            When you enter your postal code and click &ldquo;Find My MP&rdquo;, your postal
            code is sent to our server-side API route, which immediately forwards it to the
            publicly available{' '}
            <a href="https://represent.opennorth.ca/" target="_blank" rel="noopener noreferrer">
              Represent.ca API
            </a>{' '}
            operated by Open North. The API returns your MP&rsquo;s name, riding, and email
            address. This information is displayed to you in your browser and is never stored
            on our servers.
          </p>
          <p>
            When you click &ldquo;Open in Email Client&rdquo;, your browser opens a{' '}
            <code>mailto:</code> link pre-filled with the subject and message body. No data
            is sent to our servers at this step — the email is composed and sent entirely
            through your own email application.
          </p>

          <h2>3. Third-Party Services</h2>
          <ul>
            <li>
              <strong>Represent.ca (Open North)</strong> — We query this public API to look
              up MP contact information. Please review{' '}
              <a href="https://represent.opennorth.ca/" target="_blank" rel="noopener noreferrer">
                Open North&rsquo;s policies
              </a>{' '}
              for information about how they handle API requests.
            </li>
            <li>
              <strong>Netlify</strong> — This Tool is hosted on Netlify, which may collect
              standard server access logs (IP addresses, request timestamps) as part of
              normal hosting operations. Please refer to{' '}
              <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer">
                Netlify&rsquo;s Privacy Policy
              </a>{' '}
              for details.
            </li>
          </ul>

          <h2>4. Cookies and Tracking</h2>
          <p>
            This Tool does not use cookies, analytics trackers, advertising pixels, or any
            other client-side tracking technology. No user profiling of any kind takes place.
          </p>

          <h2>5. Children&rsquo;s Privacy</h2>
          <p>
            This Tool is intended for use by Canadian residents who are eligible to contact
            their elected representatives. We do not knowingly collect any information from
            children under the age of 13.
          </p>

          <h2>6. Links to External Sites</h2>
          <p>
            This Tool contains links to external websites (e.g. ourcommons.ca, Open North).
            We are not responsible for the privacy practices or content of those sites.
          </p>

          <h2>7. Changes to This Policy</h2>
          <p>
            If we make material changes to this Privacy Policy, we will update the
            &ldquo;Last updated&rdquo; date at the top of this page. Continued use of the
            Tool after any changes constitutes acceptance of the revised policy.
          </p>

          <h2>8. Contact</h2>
          <p>
            This Tool is maintained by community volunteers. If you have questions or
            concerns about this Privacy Policy, please open an issue on our public repository
            or reach out via the contact information listed there.
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
