import { useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const EMAIL_SUBJECT =
  'Constituent Safety Concern: IRGC-Linked Violence in Our Community';

function buildEmailBody(mpName, personalNote) {
  const greeting = mpName ? `Dear ${mpName},` : 'Dear [MP Name],';
  const personalParagraph = personalNote && personalNote.trim()
    ? `\n${personalNote.trim()}\n`
    : '';
  return `${greeting}

I am a constituent writing to raise an urgent safety concern.
${personalParagraph}
On March 10, 2026, shots were fired at the U.S. Consulate in Toronto. Days earlier, a boxing club in Richmond Hill owned by a prominent Iranian-Canadian dissident was hit by 17 rounds of gunfire. Jewish institutions in Toronto have faced similar attacks. These are not isolated incidents. Security officials have described a pattern of foreign-backed intimidation tied to networks operating on behalf of Iran's Islamic Revolutionary Guard Corps.

Canada already has the tools to act. The IRGC was listed as a terrorist entity under the Criminal Code in June 2024. The government has sanctioned individuals for IRGC-linked activities targeting dissidents here. Canada joined international partners in condemning Iranian state threat activity in North America. The legal tools are in place. What is needed now is action.

Canada has moved quickly before. When Russia invaded Ukraine, Canada was the first country to amend the Special Economic Measures Act to allow asset seizure and forfeiture. The same authority exists here and should be used.

I am asking you to push the government on three things:

1. Direct the RCMP and CSIS to investigate the Toronto shootings as potential IRGC-linked transnational repression and prosecute those responsible.
2. Use existing powers under the Special Economic Measures Act (SEMA) to identify and freeze assets tied to sanctioned IRGC networks operating in Canada.
3. Engage directly and openly with Iranian-Canadian communities about the threat and what is being done to address it.

We are not asking for new legislation. We are asking Canada to use the laws it already has. No community in this country should be living under the threat of foreign political violence, and Canadians of Iranian heritage deserve the same protection as everyone else.

I would be glad to speak with you or your office about this.

Sincerely,
[Your Name]
[Your Address and Riding]`;
}

function normalizePostalCode(raw) {
  return raw.replace(/\s+/g, '').toUpperCase();
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

function IconExternalLink({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function IconArrow({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12l7 7 7-7" />
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
  const [personalNote, setPersonalNote] = useState('');

  const handlePostalCodeChange = (e) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, '');
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
      setMessage(buildEmailBody(data.name, personalNote));
    } catch {
      setError('Network error - please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [postalCode]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') lookupMP();
  };

  // Rebuild email whenever personal note changes (after MP is loaded)
  const handlePersonalNoteChange = (e) => {
    setPersonalNote(e.target.value);
    if (mp) setMessage(buildEmailBody(mp.name, e.target.value));
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
        <title>Contact Your MP | Canadian-Iranians for Safety &amp; Accountability</title>
        <meta
          name="description"
          content="Find your Canadian federal MP and send them a message urging action on IRGC-linked violence in Canada. Enter your postal code to get started."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Contact Your MP | Canadian-Iranians for Safety & Accountability" />
        <meta
          property="og:description"
          content="Send your MP a message urging Canada to use the tools it already has to address IRGC-linked violence in our communities."
        />
        <meta property="og:image" content="/flags.jpg" />
        <meta name="theme-color" content="#1e5428" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="page-wrapper">

        {/* ── Hero with flag photo background ─────────────────── */}
        <header className="hero">
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-content">
            <div className="hero-badge">Canadian-Iranian Community Action</div>
            <h1>
              Contact Your <span className="accent-red">MP</span>
            </h1>
            <p className="hero-subtitle">
              Urge your federal Member of Parliament to use Canada&rsquo;s existing laws
              to address IRGC-linked violence targeting our communities.
            </p>
          </div>
        </header>

        {/* ── Our 3 Demands ─────────────────────────────────────── */}
        <section className="demands-section" aria-label="Our three demands">
          <div className="demands-inner">
            <p className="demands-eyebrow">Our position</p>
            <h2 className="demands-title">
              We are asking Canada to use the laws it already has.
            </h2>

            <ul className="demands-list" role="list">
              <li className="demand-item">
                <span className="demand-number" aria-hidden="true">1</span>
                <span className="demand-text">
                  Direct the RCMP and CSIS to investigate the Toronto shootings as
                  potential IRGC-linked transnational repression and prosecute those
                  responsible.
                </span>
              </li>
              <li className="demand-item">
                <span className="demand-number" aria-hidden="true">2</span>
                <span className="demand-text">
                  Use existing powers under the{' '}
                  <abbr className="sema-note" title="Special Economic Measures Act — Canada's sanctions law, used to freeze assets of designated persons">
                    Special Economic Measures Act (SEMA)
                  </abbr>
                  {' '}to identify and freeze assets tied to sanctioned IRGC networks operating in Canada.
                  <span className="sema-expand">
                    SEMA allows Canada to freeze assets and impose economic restrictions on designated individuals
                    and entities. It was already used against Russia after 2022.{' '}
                    <a href="https://laws-lois.justice.gc.ca/eng/acts/S-14.5/" target="_blank" rel="noopener noreferrer">
                      Read the Act
                    </a>.
                  </span>
                </span>
              </li>
              <li className="demand-item">
                <span className="demand-number" aria-hidden="true">3</span>
                <span className="demand-text">
                  Engage transparently with Iranian-Canadian communities about the
                  threat and what federal agencies are doing to address it.
                </span>
              </li>
            </ul>

            <p className="demands-scroll-hint">
              If you agree, <strong>scroll down and send your MP a message.</strong>{' '}
              It only takes two minutes.{' '}
              <IconArrow size={14} />
            </p>
          </div>
        </section>

        {/* ── Why write to your MP ──────────────────────────────── */}
        <section className="why-section" aria-label="Why contacting your MP matters">
          <div className="why-inner">
            <p className="why-title">
              Why does writing to your MP actually matter?
            </p>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">10×</div>
                <div className="stat-desc">
                  A personal constituent letter carries roughly 10&times; the weight
                  of a petition signature with most MPs.
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-number">~95%</div>
                <div className="stat-desc">
                  Of MPs who receive constituent mail on an issue raise it in
                  caucus, committee, or the House.
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-number">Your ride</div>
                <div className="stat-desc">
                  MPs are required by law to represent every constituent regardless
                  of party or how you voted.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Urgency bar ───────────────────────────────────────── */}
        <div className="urgency-bar" role="note">
          <p>
            <strong>Why now:</strong>{' '}
            Shots were fired at the U.S. Consulate in Toronto on March&nbsp;10
            <a className="cite" href="https://www.cbc.ca/news/canada/toronto" target="_blank" rel="noopener noreferrer" aria-label="Source: CBC News">[1]</a>.
            {' '}Days before, a Richmond Hill boxing club owned by an Iranian-Canadian dissident was hit
            by 17 rounds of gunfire
            <a className="cite" href="https://globalnews.ca/news/tag/iran/" target="_blank" rel="noopener noreferrer" aria-label="Source: Global News">[2]</a>.
            {' '}The IRGC has been a listed terrorist entity in Canada since June 2024
            <a className="cite" href="https://www.publicsafety.gc.ca/cnt/ntnl-scrt/cntr-trrrsm/lstd-ntts/crrnt-lstd-ntts-en.aspx" target="_blank" rel="noopener noreferrer" aria-label="Source: Public Safety Canada">[3]</a>.
            {' '}Canada has the laws. We need enforcement.
          </p>
        </div>
        <div className="sources-bar">
          <p>
            [1]&nbsp;<a href="https://www.cbc.ca/news/canada/toronto" target="_blank" rel="noopener noreferrer">CBC News</a>
            &nbsp;&nbsp;[2]&nbsp;<a href="https://globalnews.ca/news/tag/iran/" target="_blank" rel="noopener noreferrer">Global News</a>
            &nbsp;&nbsp;[3]&nbsp;<a href="https://www.publicsafety.gc.ca/cnt/ntnl-scrt/cntr-trrrsm/lstd-ntts/crrnt-lstd-ntts-en.aspx" target="_blank" rel="noopener noreferrer">Public Safety Canada</a>
            &nbsp;&nbsp;[4]&nbsp;<a href="https://laws-lois.justice.gc.ca/eng/acts/S-14.5/" target="_blank" rel="noopener noreferrer">Special Economic Measures Act</a>
          </p>
        </div>

        {/* ── Main ──────────────────────────────────────────────── */}
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

            {error && (
              <div className="alert alert-error" id="postal-error" role="alert" style={{ marginTop: '1rem' }}>
                <IconAlert />
                <span>{error}</span>
              </div>
            )}

            <div className="personal-note-wrapper">
              <label className="personal-note-label" htmlFor="personal-note">
                Add a personal sentence <span className="personal-note-hint">(optional — makes your email much more effective)</span>
              </label>
              <textarea
                id="personal-note"
                className="personal-note-input"
                rows={2}
                value={personalNote}
                onChange={handlePersonalNoteChange}
                placeholder="e.g. I grew up in Richmond Hill and this community is my home."
              />
            </div>
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
                <span className="message-hint">(edit if you like)</span>
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
                  Send to {mp.name}
                </a>
              ) : (
                <a
                  href="https://www.ourcommons.ca/members/en"
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
            (Open North). This tool does not store any personal data.{' '}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
          <p style={{ marginTop: '0.4rem' }}>
            Built by Canadian-Iranians for Canadian-Iranians. Use your voice. Use the law.
          </p>
          <p className="footer-credit">
            Inspired by{' '}
            <a href="https://www.instagram.com/salargholami/" target="_blank" rel="noopener noreferrer">
              Salar Gholami&rsquo;s
            </a>{' '}
            call to action on Instagram.
          </p>
        </footer>
      </div>
    </>
  );
}
