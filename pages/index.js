import { useState, useCallback } from 'react';
import Head from 'next/head';

const EMAIL_SUBJECT =
  'Constituent Safety Concern: IRGC-Linked Violence in Our Community';

function buildEmailBody(mpName) {
  const greeting = mpName ? `Dear ${mpName},` : 'Dear [MP Name],';
  return `${greeting}

I am writing as your constituent and as a Canadian of Iranian heritage.

On March 10, 2026, shots were fired at the U.S. Consulate in Toronto. Days earlier, a boxing club in Richmond Hill owned by a prominent Iranian-Canadian dissident was struck by 17 rounds of gunfire. Jewish institutions in Toronto have faced similar attacks. These incidents point to a pattern of foreign-backed intimidation that security experts and community members believe is linked to networks operating on behalf of Iran's Islamic Revolutionary Guard Corps.

Canada has the tools to respond. Parliament listed the IRGC as a terrorist entity under the Criminal Code in June 2024. Just last month, the government sanctioned seven more individuals for IRGC-linked transnational repression activities targeting dissidents on Canadian soil. Canada also joined international partners in condemning Iranian state threat activity in North America. The policy framework exists. What is needed now is enforcement.

Canada has demonstrated it knows how to act with resolve. When Russia launched its illegal war on Ukraine, Canada was the first country to amend the Special Economic Measures Act to allow asset seizure and forfeiture of sanctioned persons' property. The same legal architecture exists to pursue IRGC-linked assets and networks operating here.

I am asking you to press the government on three specific actions:

1. Direct the RCMP and CSIS to investigate the Toronto shootings as potential IRGC-linked transnational repression and prosecute those responsible
2. Apply existing SEMA powers to identify and freeze assets connected to sanctioned IRGC networks operating in Canada
3. Engage transparently with Iranian-Canadian communities about the threat and what federal agencies are doing to address it

We are not asking for new laws. We are asking Canada to use the ones it already has. Political violence has no place in this country, and Canadians of Iranian heritage deserve the same protection as every other community.

I would welcome the chance to speak with you or your office directly.

Sincerely,
[Your Name]
[Your Address and Riding]`;
}

function normalizePostalCode(raw) {
  return raw.replace(/\s+/g, '').toUpperCase();
}

function formatPostalCode(raw) {
  const clean = normalizePostalCode(raw);
  if (clean.length >= 4) {
    return clean.slice(0, 3) + ' ' + clean.slice(3);
  }
  return clean;
}

// Icon components (inline SVG to avoid any icon library dependency)
function IconMail({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconSearch({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function IconAlert({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconUser({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconExternalLink({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export default function Home() {
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mp, setMp] = useState(null);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handlePostalCodeChange = (e) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, '');
    // Auto-insert space after 3rd character for usability
    const stripped = raw.replace(/\s/g, '');
    if (stripped.length > 3) {
      setPostalCode(stripped.slice(0, 3) + ' ' + stripped.slice(3, 6));
    } else {
      setPostalCode(stripped);
    }
  };

  const lookupMP = useCallback(async () => {
    const code = normalizePostalCode(postalCode);
    if (!code) {
      setError('Please enter your postal code.');
      return;
    }
    if (!/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(code)) {
      setError('Please enter a valid 6-character Canadian postal code (e.g. M5V 3L9).');
      return;
    }

    setLoading(true);
    setError('');
    setMp(null);
    setMessage('');

    try {
      const res = await fetch(`/api/mp?postalCode=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setMp(data);
      setMessage(buildEmailBody(data.name));
    } catch {
      setError('Network error — please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [postalCode]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') lookupMP();
  };

  const buildMailtoLink = () => {
    if (!mp?.email) return '#';
    const subject = encodeURIComponent(EMAIL_SUBJECT);
    const body = encodeURIComponent(message);
    return `mailto:${encodeURIComponent(mp.email)}?subject=${subject}&body=${body}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be blocked in some browsers — fail silently
    }
  };

  const mpInitials = mp?.name
    ? mp.name
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <>
      <Head>
        <title>Contact Your MP — Canadian-Iranians for Safety &amp; Accountability</title>
        <meta
          name="description"
          content="Find your Canadian federal MP and send them a message urging action on IRGC-linked violence in Canada. Enter your postal code to get started."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Contact Your MP — Canadian-Iranians for Safety & Accountability" />
        <meta
          property="og:description"
          content="Send your MP a message urging Canada to use the tools it already has to address IRGC-linked violence in our communities."
        />
        <meta name="theme-color" content="#0d2545" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="page-wrapper">
        {/* ── Hero ─────────────────────────────────────────── */}
        <header className="hero">
          <div className="hero-badge">Canadian-Iranian Community Action</div>
          <h1>
            Contact Your <span>MP</span>
          </h1>
          <p className="hero-subtitle">
            Urge your federal Member of Parliament to use Canada&rsquo;s existing laws
            to address IRGC-linked violence targeting our communities.
          </p>
        </header>

        {/* ── Urgency bar ───────────────────────────────────── */}
        <div className="urgency-bar" role="note">
          <p>
            <strong>Why now:</strong> Shots were fired at the U.S. Consulate in Toronto on March&nbsp;10.
            A Richmond Hill boxing club owned by an Iranian-Canadian dissident was hit by 17 rounds of
            gunfire days before. Canada has the laws. We need enforcement.
          </p>
        </div>

        {/* ── Main ──────────────────────────────────────────── */}
        <main className="main" id="main-content">

          {/* Step 1 — Postal code lookup */}
          <div className="card">
            <h2 className="card-title">
              <span className="step-badge" aria-hidden="true">1</span>
              Find your MP by postal code
            </h2>

            <div className="input-group">
              <div className="input-wrapper">
                <label className="field-label" htmlFor="postal-code">
                  Your Canadian postal code
                </label>
                <input
                  id="postal-code"
                  type="text"
                  value={postalCode}
                  onChange={handlePostalCodeChange}
                  onKeyDown={handleKeyDown}
                  placeholder="M5V 3L9"
                  maxLength={7}
                  autoComplete="postal-code"
                  inputMode="text"
                  aria-label="Enter your Canadian postal code"
                  aria-describedby={error ? 'postal-error' : undefined}
                />
              </div>

              <div style={{ paddingTop: '1.45rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={lookupMP}
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      Looking up…
                    </>
                  ) : (
                    <>
                      <IconSearch />
                      Find My MP
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-error" id="postal-error" role="alert" style={{ marginTop: '1rem' }}>
                <IconAlert />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Step 2 — MP info (shown after successful lookup) */}
          {mp && (
            <div className="card" role="region" aria-label="Your MP's information">
              <h2 className="card-title">
                <span className="step-badge" aria-hidden="true">2</span>
                Your Member of Parliament
              </h2>

              <div className="mp-info">
                <div className="mp-avatar" aria-hidden="true">{mpInitials}</div>
                <div className="mp-details">
                  <div className="mp-name">{mp.name}</div>
                  <div className="mp-riding">{mp.riding}</div>
                  {mp.party && <div className="mp-party">{mp.party}</div>}
                  {mp.email ? (
                    <div className="mp-email">
                      <IconMail size={14} />
                      <span>{mp.email}</span>
                    </div>
                  ) : (
                    <div className="alert alert-error" style={{ marginTop: '0.6rem' }} role="alert">
                      <IconAlert size={16} />
                      <span>
                        No email address found. Visit{' '}
                        <a href="https://www.ourcommons.ca/members/en" target="_blank" rel="noopener noreferrer">
                          ourcommons.ca
                        </a>{' '}
                        to contact your MP directly.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Message editor */}
          {mp && (
            <div className="card" role="region" aria-label="Draft message to your MP">
              <h2 className="card-title">
                <span className="step-badge" aria-hidden="true">3</span>
                Review and send your message
              </h2>

              {/* Subject line display */}
              <div className="subject-row">
                <span className="subject-label">Subject</span>
                <span className="subject-text">{EMAIL_SUBJECT}</span>
              </div>

              {/* Editable message */}
              <label className="message-label" htmlFor="message-body">
                Your message
                <span className="message-hint">— edit if you&rsquo;d like</span>
              </label>
              <textarea
                id="message-body"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-label="Editable message to your MP"
                spellCheck
              />

              <button
                type="button"
                className="copy-btn"
                onClick={handleCopy}
                aria-live="polite"
              >
                {copied ? '✓ Copied to clipboard' : 'Copy message text'}
              </button>

              <div className="divider" role="separator" />

              {/* CTA */}
              {mp.email ? (
                <a
                  href={buildMailtoLink()}
                  className="btn btn-cta"
                  role="button"
                  aria-label={`Open email client to send message to ${mp.name}`}
                >
                  <IconMail size={22} />
                  Open in Email Client — Send to {mp.name}
                </a>
              ) : (
                <a
                  href={`https://www.ourcommons.ca/members/en`}
                  className="btn btn-cta"
                  target="_blank"
                  rel="noopener noreferrer"
                  role="button"
                >
                  <IconExternalLink size={20} />
                  Find contact info on ourcommons.ca
                </a>
              )}

              <p style={{ marginTop: '0.85rem', fontSize: '0.82rem', color: 'var(--gray-400)', textAlign: 'center' }}>
                Clicking the button opens your default email app with the subject and message pre-filled.
                You can edit before sending.
              </p>
            </div>
          )}

        </main>

        {/* ── Footer ───────────────────────────────────────── */}
        <footer className="footer">
          <p>
            MP data provided by{' '}
            <a href="https://represent.opennorth.ca/" target="_blank" rel="noopener noreferrer">
              Represent.ca
            </a>{' '}
            (Open North). This tool does not store any personal data.
          </p>
          <p style={{ marginTop: '0.4rem' }}>
            Built by Canadian-Iranians for Canadian-Iranians. &nbsp;|&nbsp; Use your voice. Use the law.
          </p>
        </footer>
      </div>

      <style jsx global>{`
        /* Scoped overrides — anything not in globals.css */
        .urgency-bar strong {
          color: var(--gold-400);
        }
      `}</style>
    </>
  );
}
