import { describe, expect, it } from 'vitest';
import { buildLeadPayload } from '../src/utils/leadPayload';
import { scrollRatio } from '../src/utils/scrollRatio';

const lead = { email: ' ana@exemplo.pt ', nome: '', idade: '20 a 35 anos', viagens: '', atual: 'Bolsa térmica com gelo' };

describe('buildLeadPayload', () => {
  const payload = buildLeadPayload(lead, new Date('2026-11-17T10:00:00Z'), 'fr', 'Merci !');

  it('apara o e-mail e usa-o no assunto', () => {
    expect(payload.email).toBe('ana@exemplo.pt');
    expect(payload._subject).toContain('ana@exemplo.pt');
  });

  it('troca campos vazios por "não indicado"', () => {
    expect(payload.Nome).toBe('não indicado');
    expect(payload.Viagens_Mais_1h_Calor).toBe('não indicado');
  });

  it('regista a língua e envia a resposta automática na língua do visitante', () => {
    expect(payload.Idioma).toBe('fr');
    expect(payload._autoresponse).toBe('Merci !');
  });
});

describe('scrollRatio', () => {
  it('devolve 0 quando a página cabe no ecrã', () => {
    expect(scrollRatio(0, 500, 500)).toBe(0);
  });

  it('devolve 0,5 a meio do percurso', () => {
    expect(scrollRatio(250, 1000, 500)).toBe(0.5);
  });

  it('nunca passa de 1', () => {
    expect(scrollRatio(9999, 1000, 500)).toBe(1);
  });
});
