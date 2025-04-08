import RepuestoForm from "./components/RepuestoForm";
import RepuestosTables from "./components/RespuestosTables";
import { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [repuestos, setRepuestos] = useState([]);

  const fetchRepuestos = async () => {
    const res = await axios.get("http://localhost:3000/api/repuestos");
    setRepuestos(res.data);
  };

  useEffect(() => {
    fetchRepuestos();
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestión de Repuestos</h1>
      <RepuestoForm onRepuestoCreado={fetchRepuestos} />
      <RepuestosTables repuestos={repuestos} />
    </div>
  );
};

export default App;
