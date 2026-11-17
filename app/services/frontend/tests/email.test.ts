import { describe, expect, it } from 'vitest';
import { KNOWN_TLDS } from '../src/defaults/tlds';
import { hasKnownTld } from '../src/utils/email';

describe('hasKnownTld', () => {
  it.each(['ana@exemplo.pt', 'a@b.com', 'x@sub.dominio.co.uk', 'A@EXEMPLO.COM', 'a@exemplo.xn--p1ai', ' ana@exemplo.pt '])(
    'aceita %s',
    (email) => {
      expect(hasKnownTld(email)).toBe(true);
    },
  );

  it.each(['a@b.zzz', 'a@b.invalid', 'a@localhost', 'a@b', 'a@.com', 'a@b..com', 'sem-arroba.com', 'a b@x.com', '', '@x.com'])(
    'recusa "%s"',
    (email) => {
      expect(hasKnownTld(email)).toBe(false);
    },
  );
});

describe('KNOWN_TLDS', () => {
  it('traz a lista completa da IANA', () => {
    expect(KNOWN_TLDS.size).toBe(1436);
  });

  it('inclui os domínios de países das línguas do site', () => {
    for (const tld of ['pt', 'br', 'es', 'fr', 'ru', 'cn', 'com', 'org', 'net']) {
      expect(KNOWN_TLDS.has(tld)).toBe(true);
    }
  });
});
