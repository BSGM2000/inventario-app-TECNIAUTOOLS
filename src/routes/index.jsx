import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Productos from "../pages/Productos";
import Usuarios from "../pages/Usuarios";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/productos" element={<Productos />} />
      <Route path="/usuarios" element={<Usuarios />} />
      <Route path="*" element={<NotFound />} /> {/* Página 404 */}
    </Routes>
  );
}
