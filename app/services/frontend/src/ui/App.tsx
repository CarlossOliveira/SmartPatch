import { useMemo, useState } from 'react';
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
import { PreReserveDialog } from '../components/PreReserveDialog';
import { Problem } from '../components/Problem';
import { ScrollProgress } from '../components/ScrollProgress';
import { MESSAGES } from '../defaults/messages';
import { I18nContext } from '../hooks/useI18n';
import { trackEvent } from '../services/analytics';
import type { CtaPlace, Locale } from '../types';
import './global.css';

interface AppProps {
  locale: Locale;
}

interface ReserveState {
  open: boolean;
  place: CtaPlace;
}

/** Junta as secções. Guarda só o estado do diálogo de pré-reserva e de onde foi aberto. */
export function App({ locale }: AppProps) {
  const [reserve, setReserve] = useState<ReserveState>({ open: false, place: 'hero' });
  const i18n = useMemo(() => ({ locale, t: MESSAGES[locale] }), [locale]);

  function openReserve(place: CtaPlace): void {
    trackEvent('cta_click', { local: place });
    setReserve({ open: true, place });
  }

  return (
    <I18nContext.Provider value={i18n}>
      <a className="skip" href="#main">
        {i18n.t.a11y.skip}
      </a>
      <ScrollProgress />
      <Header switcher={<LanguageSwitcher />} onReserve={() => openReserve('top')} />
      <main id="main">
        <Hero stage={<BottleStage />} onReserve={() => openReserve('hero')} />
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
