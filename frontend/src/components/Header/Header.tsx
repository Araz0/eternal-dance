import { Link } from "react-router-dom";
import styles from "./styles.module.css";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  console.log(isMenuOpen);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <h1>
        <Link to="/" onClick={closeMenu}>
          The Eternal Dance
        </Link>
      </h1>

      {/* Desktop Navigation (visible on larger screens) */}
      <nav className={styles.desktopNav}>
        <ul>
          <li>
            <Link to="/team">Team</Link>
          </li>
          <li>
            <Link to="/gallery">Gallery</Link>
          </li>
        </ul>
      </nav>

      {/* Burger Menu Button (visible on mobile) */}
      <button
        className={styles.burgerButton}
        onClick={toggleMenu}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        <span>{isMenuOpen ? "Close" : "Menu"}</span>
      </button>

      {/* Mobile Navigation Overlay (visible when menu is open) */}
      <nav
        className={`${styles.mobileNavOverlay} ${
          isMenuOpen ? styles.mobileNavOverlayOpen : ""
        }`}
      >
        <ul>
          <li>
            <Link to="/" onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/team" onClick={closeMenu}>
              Team
            </Link>
          </li>
          <li>
            <Link to="/gallery" onClick={closeMenu}>
              Gallery
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
