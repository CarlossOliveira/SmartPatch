import { useEffect, useMemo, useState } from 'react';
import { BottleStage } from '../components/BottleStage';
import { Compare } from '../components/Compare';
import { Facts } from '../components/Facts';
import { Faq } from '../components/Faq';
import { FinalCta } from '../components/FinalCta';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { PageLoader } from '../components/PageLoader';
import { PreReserveDialog } from '../components/PreReserveDialog';
import { Problem } from '../components/Problem';
import { ScrollProgress } from '../components/ScrollProgress';
import { MESSAGES } from '../defaults/messages';
import { I18nContext } from '../hooks/useI18n';
import { trackEvent } from '../services/analytics';
import type { CtaPlace, Locale } from '../types';
import './global.css';

/** Tempo máximo do ecrã de carregamento. Evita ficar preso se o modelo 3D demorar demais. */
const LOADER_TIMEOUT_MS = 6000;

interface AppProps {
  locale: Locale;
}

interface ReserveState {
  open: boolean;
  place: CtaPlace;
}

/**
 * Junta as secções. Guarda o estado do diálogo de pré-reserva e se a página já está pronta,
 * isto é, hidratada e com o modelo 3D a funcionar (ou a falhar).
 */
export function App({ locale }: AppProps) {
  const [reserve, setReserve] = useState<ReserveState>({ open: false, place: 'hero' });
  const [ready, setReady] = useState(false);
  const i18n = useMemo(() => ({ locale, t: MESSAGES[locale] }), [locale]);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), LOADER_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  function openReserve(place: CtaPlace): void {
    trackEvent('cta-clicked', { local: place });
    setReserve({ open: true, place });
  }

  return (
    <I18nContext.Provider value={i18n}>
      <PageLoader visible={!ready} />
      <a className="skip" href="#main">
        {i18n.t.a11y.skip}
      </a>
      <ScrollProgress />
      <Header switcher={<LanguageSwitcher />} onReserve={() => openReserve('top')} />
      <main id="main">
        <Hero stage={<BottleStage onSettled={() => setReady(true)} />} onReserve={() => openReserve('hero')} />
        <Facts />
        <Problem />
        <HowItWorks />
        <Compare onReserve={() => openReserve('comparar')} />
        <Faq />
        <FinalCta onReserve={() => openReserve('pre-reserva')} />
      </main>
      <Footer />
      <PreReserveDialog
        open={reserve.open}
        place={reserve.place}
        onClose={() => setReserve({ ...reserve, open: false })}
      />
    </I18nContext.Provider>
  );
}
