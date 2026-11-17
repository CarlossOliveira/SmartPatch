import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useI18n } from '../../../hooks/useI18n';
import { sendLead } from '../../../services/leadClient';
import { trackEvent } from '../../../services/analytics';
import type { CtaPlace, LeadFields } from '../../../types';

export type LeadStatus = 'idle' | 'sending' | 'sent' | 'error';

function textOf(data: FormData, name: string): string {
  const value = data.get(name);
  if (typeof value === 'string') {
    return value;
  }
  return '';
}

/**
 * Estado e métricas do formulário de pré-reserva.
 * As métricas formam o funil: aberto, iniciado, campos, enviado, erro e fechado sem enviar.
 * Nenhum evento leva dados pessoais.
 */
export function useLeadForm(open: boolean, place: CtaPlace) {
  const { locale, t } = useI18n();
  const [status, setStatus] = useState<LeadStatus>('idle');
  const started = useRef(false);
  const sent = useRef(false);
  const fieldsSeen = useRef(new Set<string>());

  useEffect(() => {
    if (open) {
      trackEvent('form_aberto', { local: place });
    }
  }, [open, place]);

  function handleInput(event: FormEvent<HTMLFormElement>): void {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement)) {
      return;
    }
    if (!started.current) {
      started.current = true;
      trackEvent('form_iniciado', { local: place });
    }
    if (!fieldsSeen.current.has(field.name)) {
      fieldsSeen.current.add(field.name);
      trackEvent('form_campo', { campo: field.name });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const lead: LeadFields = {
      email: textOf(data, 'email'),
      nome: textOf(data, 'nome'),
      idade: textOf(data, 'idade'),
      viagens: textOf(data, 'viagens'),
      atual: textOf(data, 'atual'),
    };
    setStatus('sending');
    try {
      await sendLead(lead, locale, t.dialog.autoresponse);
      sent.current = true;
      trackEvent('form_enviado', { local: place });
      form.reset();
      setStatus('sent');
    } catch {
      trackEvent('form_erro');
      setStatus('error');
    }
  }

  function handleClosed(): void {
    if (!sent.current) {
      trackEvent('form_fechado_sem_enviar', { preencheu: started.current });
    }
    started.current = false;
    sent.current = false;
    fieldsSeen.current.clear();
    setStatus('idle');
  }

  return { status, handleInput, handleSubmit, handleClosed };
}
