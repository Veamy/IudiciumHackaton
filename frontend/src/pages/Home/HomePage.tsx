import React from "react";
import './HomeStyle.css';
import { useTranslation } from 'react-i18next';
import ButtonC1 from "../../components/Buttons/ButtonC1/ButtonC1";
import ButtonC2 from "../../components/Buttons/ButtonC2/ButtonC2";
import { ROUTES } from "../../ROUTES";

const HomePage = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="MainBlock">
        <p className="text-block">{t('HomePage.hz')}</p>
        <div className="buttons-block">
        <ButtonC2 text={t('HomePage.guide-button-text')} />
        <ButtonC1 
            text={t('HomePage.analyze-button-text')} 
            to={ROUTES.INFO}/>
        </div>
      </div>

    </>
  );
};

export default HomePage;
