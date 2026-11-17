import { NOT_SPECIFIED } from '../defaults/reservation';
import type { LeadFields, Locale } from '../types';

function valueOrDefault(value: string): string {
  const trimmed = value.trim();
  if (trimmed === '') {
    return NOT_SPECIFIED;
  }
  return trimmed;
}

/**
 * Monta o corpo JSON que o FormSubmit transforma num email em tabela.
 * Os campos para a equipa ficam em português. A resposta automática vai na língua do visitante.
 */
export function buildLeadPayload(
  lead: LeadFields,
  now: Date,
  locale: Locale,
  autoresponse: string,
): Record<string, string> {
  const email = valueOrDefault(lead.email);
  return {
    _subject: `Nova pré-reserva SmartPatch: ${email}`,
    _template: 'table',
    _captcha: 'false',
    _replyto: email,
    _autoresponse: autoresponse,
    email,
    Nome: valueOrDefault(lead.nome),
    Faixa_Etaria: valueOrDefault(lead.idade),
    Viagens_Mais_1h_Calor: valueOrDefault(lead.viagens),
    Alternativa_Atual: valueOrDefault(lead.atual),
    Idioma: locale,
    Data_Hora: now.toLocaleString('pt-PT'),
  };
}
