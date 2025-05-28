import { Link } from "react-router-dom";
import styles from "../styles/NavBar.module.css";

const NavBar = ({ onLogout }) => {
  return (
    <nav className={styles.navBar}>
      {/* Logo e información */}
      <div className={styles.logoContainer}>
        <h1 className={styles.logo}>Inventario TecniAutools</h1>
      </div>

      {/* Enlaces de navegación */}
      
      <div className={styles.navLinks}>
        <Link
          to="/usuarios"
          className={styles.navLink}
        >
          Usuarios
        </Link>
        <Link
          to="/repuestos"
          className={styles.navLink}
        >
          Repuestos
        </Link>
        <Link
          to="/clientes"
          className={styles.navLink}
        >
          Clientes
        </Link>
        <Link
          to="/proveedores"
          className={styles.navLink}
        >
          Proveedores
        </Link>
        <Link
          to="/compras"
          className={styles.navLink}
        >
          Compras
        </Link>
        <Link
          to="/ventas"
          className={styles.navLink}
        >
          Ventas
        </Link>
        
        <button
          onClick={onLogout}
          className={styles.logoutButton}
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default NavBar;