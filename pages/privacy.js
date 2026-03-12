import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { translations } from '../lib/translations';

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

export default function Privacy() {
  const [lang, setLang] = useState('en');
  const t = translations[lang];

  return (
    <>
      <Head>
        <title>{t.privacyPageTitle}</title>
        <meta name="description" content={t.privacyMetaDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="page-wrapper">
        <header className="hero" style={{ padding: '2.5rem 1.5rem 2rem' }}>
          <div className="hero-overlay" aria-hidden="true" />

          {/* Language toggle */}
          <div style={{ position: 'absolute', top: '1rem', right: '1.25rem', zIndex: 2 }}>
            <button onClick={() => setLang('en')} aria-pressed={lang === 'en'} style={toggleBtnStyle(lang === 'en')}>EN</button>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>|</span>
            <button onClick={() => setLang('fr')} aria-pressed={lang === 'fr'} style={toggleBtnStyle(lang === 'fr')}>FR</button>
          </div>

          <div className="hero-content">
            <Link href="/" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', textDecoration: 'none' }}>
              {t.privacyBackLink}
            </Link>
            <h1 style={{ marginTop: '0.75rem' }}>{t.privacyHeading}</h1>
          </div>
        </header>

        <main className="prose-page">
          <p className="prose-updated">{t.privacyUpdated}</p>

          <p>{t.privacyIntro}</p>

          <h2>{t.privacyH2WhatNot}</h2>
          <ul>
            <li>{t.privacyLi1}</li>
            <li>{t.privacyLi2}</li>
            <li>{t.privacyLi3}</li>
          </ul>

          <h2>{t.privacyH2How}</h2>
          <p>
            {t.privacyHowP1pre}
            <a href="https://represent.opennorth.ca/" target="_blank" rel="noopener noreferrer">Represent.ca API</a>
            {t.privacyHowP1post}
          </p>
          <p>
            {t.privacyHowP2pre}<code>{t.privacyHowP2code}</code>{t.privacyHowP2post}
          </p>

          <h2>{t.privacyH2Hosting}</h2>
          <p>
            {t.privacyHostingPre}
            <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer">{t.privacyHostingLink}</a>
            {t.privacyHostingPost}
          </p>

          <h2>{t.privacyH2Contact}</h2>
          <p>
            {t.privacyContactPre}
            <a href="mailto:baaham.ca@gmail.com">baaham.ca@gmail.com</a>
          </p>

          <p style={{ marginTop: '2rem' }}>
            <Link href="/">{t.privacyReturnLink}</Link>
          </p>
        </main>

        <footer className="footer">
          <p>
            {t.privacyFooterText}
            <Link href="/privacy">{t.footerPrivacyLink}</Link>.
          </p>
        </footer>
      </div>
    </>
  );
}
