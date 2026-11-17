import { useEffect, useId, useRef } from 'react';
import { CONTACT_EMAIL } from '../../../defaults/contact';
import { AGE_VALUES, CURRENT_VALUES, TRAVEL_VALUES } from '../../../defaults/reservation';
import { useI18n } from '../../../hooks/useI18n';
import type { CtaPlace } from '../../../types';
import { hasKnownTld } from '../../../utils/email';
import { useLeadForm } from '../hooks/useLeadForm';
import './PreReserveDialog.css';

interface PreReserveDialogProps {
  open: boolean;
  place: CtaPlace;
  onClose: () => void;
}

interface SelectFieldProps {
  label: string;
  name: string;
  values: string[];
  labels: string[];
}

/** O valor enviado à equipa é sempre o português; o rótulo vem da língua da página. */
function SelectField({ label, name, values, labels }: SelectFieldProps) {
  return (
    <label>
      {label}
      <select name={name} defaultValue="">
        {values.map((value, index) => (
          <option key={value} value={value}>
            {labels[index]}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PreReserveDialog({ open, place, onClose }: PreReserveDialogProps) {
  const { t } = useI18n();
  const text = t.dialog;
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { status, handleInput, handleSubmit, handleClosed } = useLeadForm(open, place);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  let message = '';
  if (status === 'sent') {
    message = text.sent;
  }
  if (status === 'error') {
    message = text.failed;
  }

  return (
    // O clique no fundo fecha o diálogo; o teclado fecha com Esc, tratado pelo próprio <dialog>.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={() => {
        handleClosed();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="dlg">
        <button className="close" type="button" aria-label={text.close} onClick={onClose}>
          ×
        </button>
        <h2 id={titleId}>{text.title}</h2>
        <p>{text.intro}</p>
        <form hidden={status === 'sent'} onInput={handleInput} onSubmit={handleSubmit}>
          <label>
            {text.email}
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={text.emailPlaceholder}
              onInput={(event) => {
                // O browser bloqueia o envio enquanto houver uma mensagem de validade. É só conveniência:
                // quem desligar o JavaScript contorna-a, e o FormSubmit não valida o domínio.
                const input = event.currentTarget;
                const valid = input.value === '' || hasKnownTld(input.value);
                input.setCustomValidity(valid ? '' : text.emailInvalid);
              }}
            />
          </label>
          <label>
            {text.name}
            <input name="nome" autoComplete="name" placeholder={text.namePlaceholder} />
          </label>
          <SelectField label={text.age} name="idade" values={AGE_VALUES} labels={text.ageOptions} />
          <SelectField label={text.travel} name="viagens" values={TRAVEL_VALUES} labels={text.travelOptions} />
          <SelectField label={text.current} name="atual" values={CURRENT_VALUES} labels={text.currentOptions} />
          <button className="btn" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? text.sending : text.submit}
          </button>
        </form>
        <p className="form-msg" role="status" aria-live="polite" hidden={message === ''}>
          {message}
        </p>
        <p className="alt">
          {text.alt} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </div>
    </dialog>
  );
}
