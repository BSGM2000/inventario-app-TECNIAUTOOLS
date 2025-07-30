import { Link } from "react-router-dom";
import styles from "../styles/Navbar.module.css";
import { useState } from "react";

const NavBar = ({ onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    
    // Si el menú se está abriendo, evitar el scroll en el body y aplicar desenfoque al contenido principal
    if (!menuOpen) {
      document.body.style.overflow = 'hidden';
      // Aplicar desenfoque al contenido principal (excepto la barra de navegación)
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.style.filter = 'blur(3px)';
        mainContent.style.transition = 'filter 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
      }
    } else {
      document.body.style.overflow = 'auto';
      // Quitar desenfoque del contenido principal
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.style.filter = 'none';
      }
    }
  };
  
  // Cerrar el menú cuando se hace clic en un enlace
  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = 'auto';
    
    // Quitar desenfoque del contenido principal
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.style.filter = 'none';
    }
  };

  return (
    <nav className={styles.navBar}>
      {/* Logo e información */}
      <div className={styles.logoContainer}>
        <h1 className={styles.logo}>Inventario TecniAutools</h1>
      </div>

      {/* Botón de hamburguesa para móviles */}
      <button 
        className={styles.menuToggle} 
        onClick={toggleMenu}
        aria-label="Abrir menú"
      >
        <span className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}></span>
      </button>

      {/* Overlay para cuando el menú está abierto */}
      <div 
        className={`${styles.menuOverlay} ${menuOpen ? styles.menuOverlayOpen : ''}`} 
        onClick={toggleMenu}
      ></div>

      {/* Enlaces de navegación */}
      <div className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
        <Link
          to="/dashboard"
          className={styles.navLink}
          onClick={closeMenu}
        >
          Dashboard
        </Link>
        <Link
          to="/usuarios"
          className={styles.navLink}
          onClick={closeMenu}
        >
          Usuarios
        </Link>
        <Link
          to="/repuestos"
          className={styles.navLink}
          onClick={closeMenu}
        >
          Repuestos
        </Link>
        <Link
          to="/clientes"
          className={styles.navLink}
          onClick={closeMenu}
        >
          Clientes
        </Link>
        <Link
          to="/proveedores"
          className={styles.navLink}
          onClick={closeMenu}
        >
          Proveedores
        </Link>
        <Link
          to="/compras"
          className={styles.navLink}
          onClick={closeMenu}
        >
          Compras
        </Link>
        <Link
          to="/ventas"
          className={styles.navLink}
          onClick={closeMenu}
        >
          Ventas
        </Link>
        <Link
          to="/movimientos"
          className={styles.navLink}
          onClick={closeMenu}
        >
          Movimientos
        </Link>
        
        <button
          onClick={() => {
            closeMenu();
            onLogout();
          }}
          className={styles.logoutButton}
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};


export default NavBar;