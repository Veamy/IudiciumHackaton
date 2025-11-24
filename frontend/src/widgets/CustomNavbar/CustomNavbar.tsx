import { type FC, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LanguageSwitcher } from '../../components/LanguageSwitcher/LanguageSwitcher';
import './CustomNavbar.css';

const CustomNavbar: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(prev => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="custom-navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-brand" onClick={closeMenu}>
          Iudicium
        </NavLink>
        <nav className="navbar-menu desktop">
          <div className="language-switcher-wrapper">
            <LanguageSwitcher />
          </div>
        </nav>
        <button
          className={`navbar-toggler ${isOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav className={`navbar-menu mobile ${isOpen ? 'open' : ''}`}>
          <div className="language-switcher-wrapper">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default CustomNavbar;