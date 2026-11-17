import { describe, expect, it } from 'vitest';
import { LOCALES } from '../src/defaults/locales';
import { MESSAGES } from '../src/defaults/messages';
import { AGE_VALUES, CURRENT_VALUES, TRAVEL_VALUES } from '../src/defaults/reservation';
import { HOW_TAB_IDS, NAV_SECTION_IDS } from '../src/defaults/site';

/** Percorre o objeto e devolve o caminho de cada texto vazio. */
function emptyPaths(value: unknown, path: string): string[] {
  if (typeof value === 'string') {
    if (value.trim() === '') {
      return [path];
    }
    return [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => emptyPaths(item, `${path}[${index}]`));
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, item]) => emptyPaths(item, `${path}.${key}`));
  }
  return [];
}

describe.each(LOCALES.map((item) => item.code))('mensagens %s', (code) => {
  const messages = MESSAGES[code];
  const reference = MESSAGES.pt;

  it('não tem textos vazios', () => {
    expect(emptyPaths(messages, code)).toEqual([]);
  });

  it('tem as mesmas listas que o português', () => {
    expect(messages.nav).toHaveLength(NAV_SECTION_IDS.length);
    expect(messages.how.tabs).toHaveLength(HOW_TAB_IDS.length);
    expect(messages.facts).toHaveLength(reference.facts.length);
    expect(messages.problem.items).toHaveLength(reference.problem.items.length);
    expect(messages.faq.items).toHaveLength(reference.faq.items.length);
    expect(messages.compare.rows).toHaveLength(reference.compare.rows.length);
    expect(messages.how.layers).toHaveLength(3);
    expect(messages.how.pills).toHaveLength(3);
  });

  it('tem um rótulo por valor das listas do formulário', () => {
    expect(messages.dialog.ageOptions).toHaveLength(AGE_VALUES.length);
    expect(messages.dialog.travelOptions).toHaveLength(TRAVEL_VALUES.length);
    expect(messages.dialog.currentOptions).toHaveLength(CURRENT_VALUES.length);
  });

  it('mantém o título abaixo de 70 caracteres e a descrição abaixo de 200', () => {
    expect(messages.meta.title.length).toBeLessThanOrEqual(70);
    expect(messages.meta.description.length).toBeLessThanOrEqual(200);
  });
});
