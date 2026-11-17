import type { ReactNode } from 'react';
import { CONTACT_EMAIL, MAILTO_SUBJECT } from '../defaults/contact';
import { buildMailto } from '../utils/mailto';

interface CtaLinkProps {
  className?: string;
  onClick: () => void;
  children: ReactNode;
}

/** Abre o diálogo de pré-reserva. O href mailto só serve sem JavaScript. */
export function CtaLink({ className, onClick, children }: CtaLinkProps) {
  return (
    <a
      className={className ? `btn ${className}` : 'btn'}
      href={buildMailto(CONTACT_EMAIL, MAILTO_SUBJECT)}
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
    >
      {children}
    </a>
  );
}
