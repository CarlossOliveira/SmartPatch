import { useRef } from 'react';
import { Reveal } from '../../../primitives/Reveal';
import type { FaqText } from '../../../types';
import { useSlide } from '../hooks/useSlide';

interface FaqItemProps {
  entry: FaqText;
  open: boolean;
  onToggle: () => void;
}

export function FaqItem({ entry, open, onToggle }: FaqItemProps) {
  const ref = useRef<HTMLDetailsElement>(null);
  useSlide(ref, open);

  return (
    <Reveal className="faq-item">
      <details ref={ref}>
        <summary
          onClick={(event) => {
            event.preventDefault();
            onToggle();
          }}
        >
          {entry.question}
        </summary>
        <p>{entry.answer}</p>
      </details>
    </Reveal>
  );
}
