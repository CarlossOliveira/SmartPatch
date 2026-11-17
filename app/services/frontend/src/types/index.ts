export type Locale = 'pt' | 'en' | 'es' | 'fr' | 'ru' | 'zh';

export interface LocaleInfo {
  code: Locale;
  /** Nome na própria língua, mostrado no seletor. */
  label: string;
  /** Texto curto do seletor. */
  short: string;
  /** Valor do atributo lang do HTML. */
  htmlLang: string;
  /** Valor do hreflang nos links alternativos. */
  hreflang: string;
  ogLocale: string;
}

export type LedLevel = 'ok' | 'warn' | 'bad';

export type HowTabId = 'protege' | 'avisa' | 'lembra';

export interface TitledText {
  title: string;
  text: string;
}

export interface HowTabText {
  label: string;
  hint: string;
  title: string;
  text: string;
}

export interface FaqText {
  question: string;
  answer: string;
}

/** Todos os textos visíveis de uma língua. A ordem das listas é igual em todas as línguas. */
export interface Messages {
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    twitterTitle: string;
    twitterDescription: string;
    orgDescription: string;
  };
  a11y: { skip: string; logo: string; menu: string; mainNav: string; languages: string; loading: string };
  /** problema, como, comparar, faq */
  nav: string[];
  reserveShort: string;
  hero: { eyebrow: string; title: string; titleEm: string; lede: string; cta: string; ghost: string; fine: string };
  stage: {
    canvasLabel: string;
    svgLabel: string;
    tempLabel: string;
    daysLabel: string;
    hint: string;
    dialTemp: string;
    dialDays: string;
    daysSuffix: string;
    led: Record<LedLevel, string>;
  };
  facts: { value: string; label: string }[];
  problem: { eyebrow: string; title: string; text: string; items: TitledText[] };
  how: {
    eyebrow: string;
    titleBefore: string;
    titleEm: string;
    titleAfter: string;
    tablist: string;
    /** protege, avisa, lembra */
    tabs: HowTabText[];
    layers: string[];
    pills: string[];
  };
  compare: {
    eyebrow: string;
    title: string;
    cta: string;
    table: string;
    topic: string;
    other: string;
    ours: string;
    no: string;
    yes: string;
    rows: string[];
  };
  faq: { eyebrow: string; title: string; items: FaqText[] };
  final: { title: string; text: string; cta: string };
  footer: { project: string };
  dialog: {
    title: string;
    intro: string;
    close: string;
    email: string;
    emailPlaceholder: string;
    emailInvalid: string;
    name: string;
    namePlaceholder: string;
    age: string;
    travel: string;
    current: string;
    ageOptions: string[];
    travelOptions: string[];
    currentOptions: string[];
    submit: string;
    sending: string;
    sent: string;
    failed: string;
    alt: string;
    autoresponse: string;
  };
}

export interface LeadFields {
  email: string;
  nome: string;
  idade: string;
  viagens: string;
  atual: string;
}

export type CtaPlace = 'top' | 'hero' | 'comparar' | 'pre-reserva';

export type AnalyticsData = Record<string, string | number | boolean>;
