// ButtonC1.tsx
import { type FC } from 'react';
import { NavLink } from 'react-router-dom';
import './ButtonsC1Styles.css';

interface ButtonC1Props {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  to?: string; 
}

const ButtonC1: FC<ButtonC1Props> = ({ text, onClick, disabled = false, to }) => {
  const buttonContent = (
    <>
      <span className="button-text">{text}</span>
      <span className="button-glare"></span>
    </>
  );

  if (to) {
    return (
      <NavLink
        to={to}
        className={`ButtonsC1 ${disabled ? 'disabled' : ''}`}
        aria-label={text}
        style={{ pointerEvents: disabled ? 'none' : 'auto' }}
      >
        {buttonContent}
      </NavLink>
    );
  }

  return (
    <button
      className={`ButtonsC1 ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={text}
    >
      {buttonContent}
    </button>
  );
};

export default ButtonC1;