import { createContext, useContext } from 'react';
import type { Locale, Messages } from '../types';

export interface I18n {
  locale: Locale;
  t: Messages;
}

export const I18nContext = createContext<I18n | null>(null);

/** Devolve a língua da página e os seus textos. Só funciona dentro do I18nContext.Provider. */
export function useI18n(): I18n {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error('useI18n precisa do I18nContext.Provider');
  }
  return value;
}
