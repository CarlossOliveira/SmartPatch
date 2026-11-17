import { FORM_ENDPOINT } from '../defaults/contact';
import type { LeadFields, Locale } from '../types';
import { buildLeadPayload } from '../utils/leadPayload';

/**
 * Envia a pré-reserva para o FormSubmit.
 * @throws Error quando o servidor responde com erro.
 */
export async function sendLead(lead: LeadFields, locale: Locale, autoresponse: string): Promise<void> {
  const response = await fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(buildLeadPayload(lead, new Date(), locale, autoresponse)),
  });
  if (!response.ok) {
    throw new Error(`FormSubmit respondeu ${response.status}`);
  }
}
