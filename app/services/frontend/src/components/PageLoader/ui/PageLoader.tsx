import { useI18n } from '../../../hooks/useI18n';
import './PageLoader.css';

interface PageLoaderProps {
  /** Verdadeiro enquanto a página ainda não está toda pronta. */
  visible: boolean;
}

/** Ecrã de carregamento simples. Já vem no HTML pré-renderizado, por isso aparece antes do JavaScript. */
export function PageLoader({ visible }: PageLoaderProps) {
  const { t } = useI18n();

  return (
    <div className={visible ? 'page-loader' : 'page-loader done'} role="status" aria-label={t.a11y.loading}>
      <div className="loader-brand" aria-hidden="true">
        <i className="loader-mark" />
        <span className="loader-name">SmartPatch</span>
        <span className="spinner" />
      </div>
    </div>
  );
}
