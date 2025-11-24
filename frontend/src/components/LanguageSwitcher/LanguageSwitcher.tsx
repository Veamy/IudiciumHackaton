import { useTranslation } from 'react-i18next';
import './LanguageSwitcherStyle.css';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: 'eng' | 'ukr') => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="LanguageSwitcher">
      <button
        onClick={() => changeLanguage('eng')}
        className={i18n.resolvedLanguage === 'eng' ? 'font-bold' : ''}
      >
        ENG
      </button>
      <button
        onClick={() => changeLanguage('ukr')}
        className={i18n.resolvedLanguage === 'ukr' ? 'font-bold' : ''}
      >
        УКР
      </button>
    </div>
  );
};

export default LanguageSwitcher;