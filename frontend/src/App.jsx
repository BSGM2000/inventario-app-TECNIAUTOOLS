import {
  Route,
  Routes,
  Navigate,
  useNavigate, // Correcto: useNavigate se usa dentro del componente
} from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./components/Login";
import NavBar from "./components/NavBar";
import RepuestoForm from "./components/RepuestoForm";
import RepuestosTable from "./components/RepuestosTable";
import SearchBar from "./components/SearchBar";
import PrivateRoute from "./components/PrivateRoute";
import ClientPage from "./pages/ClientPage";


function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState("");
  const [repuestos, setRepuestos] = useState([]);
  const [repuestoEnEdicion, setRepuestoEnEdicion] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLoginSuccess = (token) => {
    setIsAuthenticated(true);
    setToken(token);
    localStorage.setItem("token", token); // Guardar token en localStorage
    navigate("/repuestos"); // Redirigir a la página de repuestos
  };
  
  // Función para manejar la búsqueda
  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  //Cargar repuestos
  const fetchRepuestos = async () => {
    const res = await axios.get("http://localhost:3000/api/repuestos", {
      headers: {
        Authorization: `Bearer ${token}`, // Incluir el token en los encabezados
      },
    });
    setRepuestos(res.data);
  };
  // Filtrar repuestos según la búsqueda
  const filteredRepuestos = repuestos.filter((r) =>
    r.nombre.toLowerCase().includes(searchQuery) ||
    r.descripcion.toLowerCase().includes(searchQuery) ||
    r.categoria.toLowerCase().includes(searchQuery) ||
    r.proveedor.toLowerCase().includes(searchQuery)
  );

  //Cargar repuestos al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setIsAuthenticated(true);
      setToken(storedToken);
    }
    fetchRepuestos(); // Cargar los repuestos
  }, []);
  //Confirmacion de eliminación
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este repuesto?")) return;
    await axios.delete(`http://localhost:3000/api/repuestos/${id}`);
    fetchRepuestos();
  };
  //Edición de repuestos
  const handleEdit = (repuesto) => {
    setRepuestoEnEdicion(repuesto);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  //Guardar repuestos
  const handleSaved = () => {
    setRepuestoEnEdicion(null);
    fetchRepuestos();
  };
  //Cerrar sesión 
  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken("");
    localStorage.removeItem("token"); // Eliminar token de localStorage
    navigate("/login"); // Redirigir a la página de inicio de sesión
  };

  return (
      <div >
        {isAuthenticated && <NavBar onLogout={handleLogout} />}
        
        <div className="p-4 mt-20">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/repuestos" replace />}
            />
            
            {/* Rutas protegidas */}
            <Route
              path="/repuestos"
              element={
                <PrivateRoute>
                  <>
                    <br />
                    <br />

                    <RepuestoForm
                      onRepuestoCreado={handleSaved}
                      repuestoEnEdicion={repuestoEnEdicion}
                    />
                    <SearchBar onSearch={handleSearch} />
                    <RepuestosTable
                      repuestos={filteredRepuestos}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/clientes"
              element={
                <PrivateRoute>
                  <ClientPage />
                </PrivateRoute>
              }
            />
            
            {/* Ruta pública */}
            <Route
              path="/login"
              element={<Login onLoginSuccess={handleLoginSuccess} />}
            />
          </Routes>
        </div>
      </div>
    
  );
}

export default App;

