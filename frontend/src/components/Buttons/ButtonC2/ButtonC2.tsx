import { type FC } from 'react';
import './ButtonC2Style.css';

interface ButtonC2Props {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
}

const ButtonC2: FC<ButtonC2Props> = ({ text, onClick, disabled = false }) => {
  return (
    <button
      className={`ButtonsC2 ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={text}
    >
      <span className="button-text">{text}</span>
      <span className="button-glare"></span>
    </button>
  );
};

export default ButtonC2;