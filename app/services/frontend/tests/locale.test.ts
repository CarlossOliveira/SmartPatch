import { describe, expect, it } from 'vitest';
import { detectLocale, localeFromPath, pathOf } from '../src/utils/locale';
import { buildDetectScript } from '../src/utils/seo';

describe('detectLocale', () => {
  it('reduz variantes regionais à língua base', () => {
    expect(detectLocale(['pt-BR'])).toBe('pt');
    expect(detectLocale(['zh-Hans-CN'])).toBe('zh');
    expect(detectLocale(['ES-mx'])).toBe('es');
  });

  it('salta línguas não suportadas', () => {
    expect(detectLocale(['de-DE', 'fr-CA', 'en'])).toBe('fr');
  });

  it('usa inglês quando nada corresponde', () => {
    expect(detectLocale(['de', 'ja'])).toBe('en');
    expect(detectLocale([])).toBe('en');
  });
});

describe('localeFromPath', () => {
  it('lê o primeiro segmento', () => {
    expect(localeFromPath('/ru/')).toBe('ru');
    expect(localeFromPath('/zh')).toBe('zh');
  });

  it('devolve null fora das línguas suportadas', () => {
    expect(localeFromPath('/')).toBeNull();
    expect(localeFromPath('/assets/x.js')).toBeNull();
  });

  it('gera caminhos com barra final', () => {
    expect(pathOf('en')).toBe('/en/');
  });
});

/** Corre o script da página "/" com um browser falso e devolve o destino do redirecionamento. */
function redirectFor(languages: string[], saved: string | null): string {
  let target = '';
  const run = new Function('navigator', 'localStorage', 'location', buildDetectScript());
  run(
    { languages, language: languages[0] },
    { getItem: () => saved },
    { replace: (url: string) => (target = url) },
  );
  return target;
}

describe('script de deteção da raiz', () => {
  it('segue a língua do browser', () => {
    expect(redirectFor(['ru-RU'], null)).toBe('/ru/');
    expect(redirectFor(['zh-CN'], null)).toBe('/zh/');
  });

  it('dá prioridade à língua guardada pelo seletor', () => {
    expect(redirectFor(['ru-RU'], 'fr')).toBe('/fr/');
  });

  it('ignora uma língua guardada que já não existe', () => {
    expect(redirectFor(['es'], 'xx')).toBe('/es/');
  });

  it('usa inglês sem correspondência', () => {
    expect(redirectFor(['ja'], null)).toBe('/en/');
  });
});
