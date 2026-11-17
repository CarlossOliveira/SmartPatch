import { CONTACT_EMAIL } from '../../../defaults/contact';
import { useI18n } from '../../../hooks/useI18n';
import './Footer.css';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer>
      <div className="wrap">
        {/* O ano é o do build no HTML pré-renderizado e o do browser depois; pode diferir à viragem do ano. */}
        <span suppressHydrationWarning>
          © {new Date().getFullYear()} {t.footer.project}
        </span>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </div>
    </footer>
  );
}
