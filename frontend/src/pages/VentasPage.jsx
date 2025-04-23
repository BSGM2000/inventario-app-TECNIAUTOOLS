import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import VentaForm from "../components/VentaForm";
import VentaTable from "../components/VentaTable";
import SearchBar from "../components/SearchBar";

const VentasPage = () => {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]); // Lista de clientes para el dropdown
  const [filteredVentas, setFilteredVentas] = useState([]);
  const [ventaEnEdicion, setVentaEnEdicion] = useState(null);
  const navigate = useNavigate();

  // Cargar ventas y clientes
  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No hay token disponible. Redirigiendo al login...");
          navigate("/login");
          return;
        }

        const res = await axios.get("http://localhost:3000/api/ventas", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVentas(res.data);
        setFilteredVentas(res.data);
      } catch (error) {
        console.error("Error al cargar ventas:", error);
        alert("Ocurrió un error al cargar las ventas.");
      }
    };

    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No hay token disponible. Redirigiendo al login...");
          navigate("/login");
          return;
        }

        const res = await axios.get("http://localhost:3000/api/clientes", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClientes(res.data);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        alert("Ocurrió un error al cargar los clientes.");
      }
    };

    fetchVentas();
    fetchClientes();
  }, [navigate]);

  // Guardar/Actualizar venta
  const handleSave = async (ventaData) => {
    try {
      console.log("Datos enviados al backend:", ventaData); // Agrega esto para depurar

      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No hay token disponible. Redirigiendo al login...");
        navigate("/login");
        return;
      }

      if (ventaEnEdicion) {
        await axios.put(`http://localhost:3000/api/ventas/${ventaEnEdicion.id_venta}`, ventaData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        const res = await axios.post("http://localhost:3000/api/ventas", ventaData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVentas((prevVentas) => [...prevVentas, res.data]);
      }
      setVentaEnEdicion(null);
    } catch (error) {
      console.error("Error al guardar venta:", error.response ? error.response.data : error.message);
      alert("Ocurrió un error al guardar la venta.");
    }
  };

  // Eliminar venta
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta venta?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No hay token disponible. Redirigiendo al login...");
        navigate("/login");
        return;
      }

      await axios.delete(`http://localhost:3000/api/ventas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVentas((prevVentas) => prevVentas.filter((v) => v.id_venta !== id));
      setFilteredVentas((prevFiltered) => prevFiltered.filter((v) => v.id_venta !== id));
    } catch (error) {
      console.error("Error al eliminar venta:", error);
      alert("Ocurrió un error al eliminar la venta.");
    }
  };

  // Manejar la búsqueda
  const handleSearch = (query) => {
    if (!query) {
      setFilteredVentas(ventas);
      return;
    }

    const filtered = ventas.filter((venta) =>
      venta.nombre_cliente.toLowerCase().includes(query.toLowerCase()) ||
      venta.metodo_pago.toLowerCase().includes(query.toLowerCase()) ||
      venta.total.toString().includes(query)
    );
    setFilteredVentas(filtered);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Ventas</h1>

      {/* Barra de búsqueda */}
      <SearchBar onSearch={handleSearch} />

      {/* Formulario */}
      <VentaForm
        initialData={ventaEnEdicion}
        clientes={clientes} // Pasar la lista de clientes al formulario
        onSave={handleSave}
      />

      {/* Tabla de ventas */}
      <VentaTable
        ventas={filteredVentas}
        onEdit={setVentaEnEdicion}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default VentasPage;