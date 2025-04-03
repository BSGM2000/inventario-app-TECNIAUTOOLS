import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-2xl font-bold text-white">📦 InventarioApp</h1>

        {/* Botón para móviles */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden text-white text-2xl"
        >
          ☰
        </button>

        {/* Menú de navegación */}
        <ul className={`md:flex space-x-8 md:static absolute top-16 left-0 w-full bg-blue-600 md:w-auto transition-all duration-300 ease-in-out ${
          isOpen ? "block" : "hidden md:flex"
        }`}>
          <li className="md:inline-block">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `block px-6 py-3 md:px-4 md:py-2 rounded-lg transition duration-300 ${
                  isActive ? "bg-yellow-400 text-black" : "text-white hover:bg-blue-700"
                }`
              }
            >
              📊 Dashboard
            </NavLink>
          </li>
          <li className="md:inline-block">
            <NavLink 
              to="/productos" 
              className={({ isActive }) => 
                `block px-6 py-3 md:px-4 md:py-2 rounded-lg transition duration-300 ${
                  isActive ? "bg-yellow-400 text-black" : "text-white hover:bg-blue-700"
                }`
              }
            >
              📋 Productos
            </NavLink>
          </li>
          <li className="md:inline-block">
            <NavLink 
              to="/usuarios" 
              className={({ isActive }) => 
                `block px-6 py-3 md:px-4 md:py-2 rounded-lg transition duration-300 ${
                  isActive ? "bg-yellow-400 text-black" : "text-white hover:bg-blue-700"
                }`
              }
            >
              👥 Usuarios
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}
