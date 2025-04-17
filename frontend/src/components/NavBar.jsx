import { Link } from "react-router-dom";

const NavBar = ({ onLogout }) => {
  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center fixed top-0 w-full z-10">
      {/* Logo e información */}
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold">Inventario TecniAutools</h1>
      </div>

      {/* Enlaces de navegación */}
      <div className="flex space-x-4">
        <Link
          to="/repuestos"
          className="hover:bg-blue-700 px-3 py-2 rounded transition-colors"
        >
          Repuestos
        </Link>
        <Link
          to="/clientes"
          className="hover:bg-blue-700 px-3 py-2 rounded transition-colors"
        >
          Clientes
        </Link>
        <button
          onClick={onLogout}
          className="bg-red-500 px-3 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default NavBar;