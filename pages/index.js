import { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { translations } from '../lib/translations';

function getLastName(fullName) {
  if (!fullName) return 'MP';
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1];
}

function isGoverningParty(party) {
  if (!party) return false;
  return /liberal/i.test(party);
}

function buildSubject(riding, t) {
  return t.emailSubject(riding);
}

function buildEmailBody(mpName, party, riding, personalNote, t) {
  const lastName = getLastName(mpName);
  const personalLine = personalNote && personalNote.trim()
    ? `\n${personalNote.trim()}\n`
    : '';
  const governing = isGoverningParty(party);

  return `${t.emailGreeting(lastName)}

${t.emailOpening}
${personalLine}
${t.emailIncidents}

${t.emailLegal}

${governing ? t.emailActionGov : t.emailActionOpp}

${t.emailDemand1}
${t.emailDemand2}
${t.emailDemand3}
${t.emailDemand4}

${governing ? t.emailClosingGov : t.emailClosingOpp}

${t.emailWelcome}

${t.emailSincerely}
${t.emailNamePlaceholder}
${t.emailRidingLine(riding)}`;
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

const toggleBtnStyle = (active) => ({
  background: 'none',
  border: 'none',
  color: active ? '#ffffff' : 'rgba(255,255,255,0.45)',
  fontWeight: active ? '700' : '400',
  fontSize: '0.85rem',
  cursor: 'pointer',
  padding: '0.25rem 0.4rem',
  letterSpacing: '0.06em',
});

export default function Home() {
  const [lang, setLang] = useState('en');
  const t = translations[lang];

  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mp, setMp] = useState(null);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [personalNote, setPersonalNote] = useState('');
  const [emailCount, setEmailCount] = useState(null);

  useEffect(() => {
    fetch('/api/count').then((r) => r.json()).then((d) => {
      if (typeof d.count === 'number') setEmailCount(d.count);
    }).catch(() => {});
  }, []);

  // Rebuild email when language changes and an MP is already loaded
  useEffect(() => {
    if (mp) {
      setMessage(buildEmailBody(mp.name, mp.party, mp.riding, personalNote, translations[lang]));
    }
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!code) { setError(translations[lang].errorEmpty); return; }
    if (!/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(code)) { setError(translations[lang].errorInvalid); return; }

    setLoading(true);
    setError('');
    setMp(null);
    setMessage('');

    try {
      const res = await fetch(`/api/mp?postalCode=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || translations[lang].errorFallback); return; }
      setMp(data);
      setMessage(buildEmailBody(data.name, data.party, data.riding, personalNote, translations[lang]));
    } catch {
      setError(translations[lang].errorNetwork);
    } finally {
      setLoading(false);
    }
  }, [postalCode, lang, personalNote]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = (e) => { if (e.key === 'Enter') lookupMP(); };

  const handlePersonalNoteChange = (e) => {
    setPersonalNote(e.target.value);
    if (mp) setMessage(buildEmailBody(mp.name, mp.party, mp.riding, e.target.value, t));
  };

  const buildMailtoLink = () => {
    if (!mp?.email) return '#';
    const subject = encodeURIComponent(buildSubject(mp.riding, t));
    const body = encodeURIComponent(message);
    return `mailto:${encodeURIComponent(mp.email)}?subject=${subject}&body=${body}`;
  };

  const handleSendClick = () => {
    fetch('/api/count', { method: 'POST' }).then((r) => r.json()).then((d) => {
      if (typeof d.count === 'number') setEmailCount(d.count);
    }).catch(() => {});
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
    ? mp.name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <>
      <Head>
        <title>{t.pageTitle}</title>
        <meta name="description" content={t.pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/`} />
        <meta property="og:title" content={t.ogTitle} />
        <meta property="og:description" content={t.ogDescription} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/flags.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.ogTitle} />
        <meta name="twitter:description" content={t.ogDescription} />
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/flags.jpg`} />
        <meta name="theme-color" content="#1e5428" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="page-wrapper">

        {/* ── Hero with flag photo background ─────────────────── */}
        <header className="hero">
          <div className="hero-overlay" aria-hidden="true" />

          {/* Language toggle */}
          <div style={{ position: 'absolute', top: '1rem', right: '1.25rem', zIndex: 2 }}>
            <button onClick={() => setLang('en')} aria-pressed={lang === 'en'} style={toggleBtnStyle(lang === 'en')}>EN</button>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>|</span>
            <button onClick={() => setLang('fr')} aria-pressed={lang === 'fr'} style={toggleBtnStyle(lang === 'fr')}>FR</button>
          </div>

          <div className="hero-content">
            <div className="hero-badge">{t.heroBadge}</div>
            <h1>
              {t.heroHeadingPre}<span className="accent-red">{t.heroHeadingAccent}</span>
            </h1>
            <p className="hero-subtitle">{t.heroSubtitle}</p>
          </div>
        </header>

        {/* ── Our 3 Demands ─────────────────────────────────────── */}
        <section className="demands-section" aria-label="Our four demands">
          <div className="demands-inner">
            <p className="demands-eyebrow">{t.demandsEyebrow}</p>
            <h2 className="demands-title">{t.demandsTitle}</h2>

            <ul className="demands-list" role="list">
              <li className="demand-item">
                <span className="demand-number" aria-hidden="true">1</span>
                <span className="demand-text">{t.demand1}</span>
              </li>
              <li className="demand-item">
                <span className="demand-number" aria-hidden="true">2</span>
                <span className="demand-text">
                  {t.demand2}
                  <span className="sema-expand">
                    {t.demand2Expand}
                    <a href={t.link4} target="_blank" rel="noopener noreferrer">
                      {t.demand2ExpandLink}
                    </a>.
                  </span>
                </span>
              </li>
              <li className="demand-item">
                <span className="demand-number" aria-hidden="true">3</span>
                <span className="demand-text">{t.demand3}</span>
              </li>
              <li className="demand-item">
                <span className="demand-number" aria-hidden="true">4</span>
                <span className="demand-text">{t.demand4}</span>
              </li>
            </ul>

            <p className="demands-scroll-hint">
              {t.scrollHint}<strong>{t.scrollHintStrong}</strong>{t.scrollHintSuffix}{' '}
              <IconArrow size={14} />
            </p>
            {emailCount >= 25 && (
              <p className="email-counter">{t.emailCounter(emailCount)}</p>
            )}
          </div>
        </section>

        {/* ── Urgency bar ───────────────────────────────────────── */}
        <div className="urgency-bar" role="note">
          <p>
            <strong>{t.urgencyLabel}</strong>{' '}
            {t.urgencyText1}
            <a className="cite" href={t.link1} target="_blank" rel="noopener noreferrer" aria-label={`Source: ${t.srcCBC}`}>[1]</a>.
            {t.urgencyText2}
            <a className="cite" href={t.link2} target="_blank" rel="noopener noreferrer" aria-label={`Source: ${t.srcCP24}`}>[2]</a>.
            {t.urgencyText3}
            <a className="cite" href={t.link3} target="_blank" rel="noopener noreferrer" aria-label={`Source: ${t.srcGlobe}`}>[3]</a>.
            {t.urgencyText4}
            <a className="cite" href={t.link5} target="_blank" rel="noopener noreferrer" aria-label={`Source: ${t.srcPS}`}>[4]</a>.
            {t.urgencyText5}
          </p>
        </div>
        <div className="sources-bar">
          <p>
            [1]&nbsp;<a href={t.link1} target="_blank" rel="noopener noreferrer">{t.srcCBC}</a>
            &nbsp;&nbsp;[2]&nbsp;<a href={t.link2} target="_blank" rel="noopener noreferrer">{t.srcCP24}</a>
            &nbsp;&nbsp;[3]&nbsp;<a href={t.link3} target="_blank" rel="noopener noreferrer">{t.srcGlobe}</a>
            &nbsp;&nbsp;[4]&nbsp;<a href={t.link5} target="_blank" rel="noopener noreferrer">{t.srcPS}</a>
            &nbsp;&nbsp;[5]&nbsp;<a href={t.link4} target="_blank" rel="noopener noreferrer">{t.srcSEMA}</a>
          </p>
        </div>

        {/* ── Main ──────────────────────────────────────────────── */}
        <main className="main" id="main-content">

          {/* Step 1 — Postal code lookup */}
          <div className="card">
            <h2 className="card-title">
              <span className="step-badge" aria-hidden="true">1</span>
              {t.step1Title}
            </h2>

            <div className="input-group">
              <div className="input-wrapper">
                <label className="field-label" htmlFor="postal-code">{t.postalLabel}</label>
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
                  aria-label={t.postalAriaLabel}
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
                  <><span className="spinner" aria-hidden="true" />{t.btnLookupBusy}</>
                ) : (
                  <><IconSearch />{t.btnLookupIdle}</>
                )}
              </button>
            </div>

            {error && (
              <div className="alert alert-error" id="postal-error" role="alert" style={{ marginTop: '1rem' }}>
                <IconAlert /><span>{error}</span>
              </div>
            )}

            <div className="personal-note-wrapper">
              <label className="personal-note-label" htmlFor="personal-note">
                {t.personalNoteLabel}{' '}
                <span className="personal-note-hint">{t.personalNoteHint}</span>
              </label>
              <input
                id="personal-note"
                type="text"
                className="personal-note-input"
                value={personalNote}
                onChange={handlePersonalNoteChange}
                placeholder={t.personalNotePlaceholder}
              />
            </div>
          </div>

          {/* Step 2 — MP info */}
          {mp && (
            <div className="card" role="region" aria-label="Your MP's information">
              <h2 className="card-title">
                <span className="step-badge" aria-hidden="true">2</span>
                {t.step2Title}
              </h2>

              <div className="mp-info">
                <div className="mp-avatar" aria-hidden="true">{mpInitials}</div>
                <div className="mp-details">
                  <div className="mp-name">{mp.name}</div>
                  <div className="mp-riding">{mp.riding}</div>
                  {mp.party && <div className="mp-party">{mp.party}</div>}
                  {mp.email ? (
                    <div className="mp-email">
                      <IconMail size={14} /><span>{mp.email}</span>
                    </div>
                  ) : (
                    <div className="alert alert-error" style={{ marginTop: '0.6rem' }} role="alert">
                      <IconAlert size={16} />
                      <span>
                        {t.noEmailPre}
                        <a href="https://www.ourcommons.ca/members/en" target="_blank" rel="noopener noreferrer">ourcommons.ca</a>
                        {t.noEmailPost}
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
                {t.step3Title}
              </h2>

              <div className="subject-row">
                <span className="subject-label">{t.subjectLabel}</span>
                <span className="subject-text">{buildSubject(mp.riding, t)}</span>
              </div>

              <label className="message-label" htmlFor="message-body">
                {t.messageLabel}
                <span className="message-hint">{t.messageHint}</span>
              </label>
              <textarea
                id="message-body"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-label={t.messageAriaLabel}
                spellCheck
              />

              <button type="button" className="copy-btn" onClick={handleCopy} aria-live="polite">
                {copied ? t.copyCopied : t.copyIdle}
              </button>

              <div className="divider" role="separator" />

              {mp.email ? (
                <a href={buildMailtoLink()} className="btn btn-cta" role="button" aria-label={`Open email client to send message to ${mp.name}`} onClick={handleSendClick}>
                  <IconMail size={22} />
                  {t.btnSendTo} {mp.name}
                </a>
              ) : (
                <a href="https://www.ourcommons.ca/members/en" className="btn btn-cta" target="_blank" rel="noopener noreferrer" role="button">
                  <IconExternalLink size={20} />
                  {t.btnFindContact}
                </a>
              )}

              <p style={{ marginTop: '0.85rem', fontSize: '0.82rem', color: 'var(--gray-400)', textAlign: 'center' }}>
                {t.mailtoHint}
              </p>
            </div>
          )}

        </main>

        {/* ── Footer ───────────────────────────────────────── */}
        <footer className="footer">
          <p>
            {t.footerData}
            <a href="https://represent.opennorth.ca/" target="_blank" rel="noopener noreferrer">Represent.ca</a>
            {t.footerDataSuffix}
            <Link href="/privacy">{t.footerPrivacyLink}</Link>.
          </p>
          <p style={{ marginTop: '0.4rem' }}>{t.footerBuilt}</p>
          <p className="footer-credit">
            {t.footerInspiredPre}
            <a href="https://www.instagram.com/salar_gholami_saliwan/p/DVwdmdBETG5/" target="_blank" rel="noopener noreferrer">
              {t.footerInspiredName}
            </a>
            {t.footerInspiredPost}
          </p>
          <p style={{ marginTop: '0.4rem' }}>
            {t.footerContact}
            <a href="mailto:baaham.ca@gmail.com">baaham.ca@gmail.com</a>
          </p>
        </footer>
      </div>
    </>
  );
}
