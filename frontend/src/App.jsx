
import { useState, useEffect } from "react";
import axios from "axios";
import RepuestoForm from "./components/RepuestoForm";
import RepuestosTable from "./components/RepuestosTable";

function App() {
  const [repuestos, setRepuestos] = useState([]);
  const [repuestoEnEdicion, setRepuestoEnEdicion] = useState(null);

  const fetchRepuestos = async () => {
    const res = await axios.get("http://localhost:3000/api/repuestos");
    setRepuestos(res.data);
  };

  useEffect(() => {
    fetchRepuestos();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este repuesto?")) return;
    await axios.delete(`http://localhost:3000/api/repuestos/${id}`);
    fetchRepuestos();
  };

  const handleEdit = (repuesto) => {
    setRepuestoEnEdicion(repuesto);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaved = () => {
    setRepuestoEnEdicion(null);
    fetchRepuestos();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Sistema de Inventario</h1>

      <RepuestoForm
        onRepuestoCreado={handleSaved}
        repuestoEnEdicion={repuestoEnEdicion}
      />

      <RepuestosTable
        repuestos={repuestos}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default App;

