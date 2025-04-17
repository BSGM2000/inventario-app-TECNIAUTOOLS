import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import RepuestosTable from "../components/RepuestosTable";

const RepuestoList = () => {
  const [repuestos, setRepuestos] = useState([]); // Datos originales
  const [filteredRepuestos, setFilteredRepuestos] = useState([]); // Datos filtrados

  // Cargar datos (reemplaza con tu API)
  useEffect(() => {
    fetch("/api/repuestos")
      .then((res) => res.json())
      .then((data) => {
        setRepuestos(data);
        setFilteredRepuestos(data);
      });
  }, []);

  // Lógica de búsqueda
  const handleSearch = (query) => {
    const filtered = repuestos.filter((r) =>
      r.nombre.toLowerCase().includes(query.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(query.toLowerCase()) ||
      r.categoria.toLowerCase().includes(query.toLowerCase()) ||
      r.proveedor.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredRepuestos(filtered);
  };

  return (
    <div className="p-4">
      {/* SearchBar */}
      <SearchBar onSearch={handleSearch} />
      
      {/* RepuestosTable recibe los datos filtrados */}
      <RepuestosTable
        repuestos={filteredRepuestos}
        onEdit={(repuesto) => console.log("Editar:", repuesto)}
        onDelete={(id) => console.log("Eliminar:", id)}
      />
    </div>
  );
};

export default RepuestoList;