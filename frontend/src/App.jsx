import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useIdle } from "./hooks/useIdle";
import Login from "./components/Login";
import NavBar from "./components/NavBar";
import RepuestoPage from "./pages/RepuestoPage";
import PrivateRoute from "./components/PrivateRoute";
import ClientPage from "./pages/ClientPage";
import ProveedoresPage from "./pages/ProveedoresPage";
import CompraPage from "./pages/CompraPage";
import VentaPage from "./pages/VentaPage";
import RegistroUsuarios from "./components/RegistroUsuarios";
import MovimientosPage from "./pages/MovimientosPage";
import DashboardPage from "./pages/DashboardPage";
import "./styles/App.css";

function App() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState("");

    const handleLoginSuccess = (token) => {
        setIsAuthenticated(true);
        setToken(token);
        localStorage.setItem("token", token);
        navigate("/dashboard");
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setToken("");
        localStorage.removeItem("token");
        navigate("/login");
    };

    // Usar el hook de inactividad
    const { isIdle } = useIdle(handleLogout);

    // Verificar token al cargar la aplicación
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setIsAuthenticated(true);
            setToken(storedToken);
        }
    }, []);

    return (
        <div className="App">
            {isAuthenticated && <NavBar onLogout={handleLogout} />}
            <div className="p-4 mt-20" style={{ marginTop: '80px' }}>
                <Routes>
                    <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute
                                isAuthenticated={isAuthenticated}
                                onLogout={handleLogout}
                            >
                                <DashboardPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/repuestos"
                        element={
                            <PrivateRoute
                                isAuthenticated={isAuthenticated}
                                onLogout={handleLogout}
                            >
                                <RepuestoPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/usuarios"
                        element={
                            <PrivateRoute
                                isAuthenticated={isAuthenticated}
                                onLogout={handleLogout}
                            >
                                <RegistroUsuarios />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/clientes"
                        element={
                            <PrivateRoute
                                isAuthenticated={isAuthenticated}
                                onLogout={handleLogout}
                            >
                                <ClientPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/proveedores"
                        element={
                            <PrivateRoute
                                isAuthenticated={isAuthenticated}
                                onLogout={handleLogout}
                            >
                                <ProveedoresPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/compras"
                        element={
                            <PrivateRoute
                                isAuthenticated={isAuthenticated}
                                onLogout={handleLogout}
                            >
                                <CompraPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/ventas"
                        element={
                            <PrivateRoute
                                isAuthenticated={isAuthenticated}
                                onLogout={handleLogout}
                            >
                                <VentaPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/movimientos"
                        element={
                            <PrivateRoute
                                isAuthenticated={isAuthenticated}
                                onLogout={handleLogout}
                            >
                                <MovimientosPage />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/repuestos" replace />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
