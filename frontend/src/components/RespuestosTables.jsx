import { useEffect, useState } from "react";
import axios from "axios";

const RepuestosTable = () => {
  const [repuestos, setRepuestos] = useState([]);

  const fetchRepuestos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/repuestos");
      setRepuestos(response.data);
    } catch (error) {
      console.error("Error al obtener los repuestos:", error);
    }
  };

  useEffect(() => {
    fetchRepuestos();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lista de Repuestos</h2>
      <table className="w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Descripción</th>
            <th className="border px-4 py-2">Precio</th>
            <th className="border px-4 py-2">Stock</th>
            <th className="border px-4 py-2">Ubicación</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {repuestos.map((r) => (
            <tr key={r.id_repuesto}>
              <td className="border px-4 py-2">{r.nombre}</td>
              <td className="border px-4 py-2">{r.descripcion}</td>
              <td className="border px-4 py-2">${r.precio.toLocaleString()}</td>
              <td className="border px-4 py-2">{r.stock_actual}</td>
              <td className="border px-4 py-2">{r.ubicacion}</td>
              <td className="border px-4 py-2">
                <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Editar</button>
                <button className="bg-red-500 text-white px-2 py-1 rounded">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RepuestosTable;
