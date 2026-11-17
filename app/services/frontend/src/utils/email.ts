import { KNOWN_TLDS } from '../defaults/tlds';

const EMAIL_SHAPE = /^[^\s@]+@([^\s@]+)$/;

/**
 * Verdadeiro se o e-mail tem a forma utilizador@domínio e o último segmento é um TLD registado na IANA.
 * Barra os endereços inventados (a@b.zzz, a@localhost) que enchem as listas de spam.
 * ponytail: só aceita TLDs na forma ASCII ou xn--. Não verifica se o domínio nem a caixa existem.
 */
export function hasKnownTld(email: string): boolean {
  const match = EMAIL_SHAPE.exec(email.trim());
  const domain = match?.[1];
  if (!domain) {
    return false;
  }
  const labels = domain.toLowerCase().split('.');
  if (labels.length < 2 || labels.includes('')) {
    return false;
  }
  return KNOWN_TLDS.has(labels[labels.length - 1] ?? '');
}
