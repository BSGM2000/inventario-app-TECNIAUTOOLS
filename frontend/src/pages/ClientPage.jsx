import React, { useEffect, useState } from "react";
import axios from "axios";
import ClientForm from "../components/ClientForm";
import ClientTable from "../components/ClientTable";
import SearchBar from "../components/SearchBar"; // Importar el componente

const ClientPage = () => {
  const [clientes, setClientes] = useState([]); // Todos los clientes
  const [clienteEnEdicion, setClienteEnEdicion] = useState(null);
  const [filteredClientes, setFilteredClientes] = useState([]); // Clientes filtrados

  // Cargar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/clientes");
        setClientes(res.data);
        setFilteredClientes(res.data); // Inicialmente, mostrar todos los clientes
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        alert("Ocurrió un error al cargar los clientes.");
      }
    };
    fetchClientes();
  }, []);

  // Manejar la búsqueda
  const handleSearch = (query) => {
    if (!query) {
      // Si el campo de búsqueda está vacío, mostrar todos los clientes
      setFilteredClientes(clientes);
      return;
    }

    // Filtrar clientes por nombre, contacto, dirección u otros datos
    const filtered = clientes.filter((cliente) =>
      cliente.nombre.toLowerCase().includes(query.toLowerCase()) ||
      cliente.contacto.toLowerCase().includes(query.toLowerCase()) ||
      (cliente.direccion && cliente.direccion.toLowerCase().includes(query.toLowerCase())) ||
      (cliente.otros_datos && cliente.otros_datos.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredClientes(filtered);
  };

  // Guardar/Actualizar cliente
  const handleSave = async (clientData) => {
    try {
      if (clienteEnEdicion) {
        // Actualizar cliente existente
        await axios.put(
          `http://localhost:3000/api/clientes/${clienteEnEdicion.id_cliente}`,
          clientData
        );
        setClientes((prevClientes) =>
          prevClientes.map((c) =>
            c.id_cliente === clienteEnEdicion.id_cliente ? { ...c, ...clientData } : c
          )
        );
      } else {
        // Crear nuevo cliente
        const res = await axios.post("http://localhost:3000/api/clientes", clientData);
        setClientes((prevClientes) => [...prevClientes, res.data]);
      }
      setClienteEnEdicion(null);
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      alert("Ocurrió un error al guardar el cliente.");
    }
  };

  // Eliminar cliente
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este cliente?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/clientes/${id}`);
      setClientes((prevClientes) =>
        prevClientes.filter((c) => c.id_cliente !== id)
      );
      setFilteredClientes((prevFiltered) =>
        prevFiltered.filter((c) => c.id_cliente !== id)
      );
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      alert("Ocurrió un error al eliminar el cliente.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Clientes</h1>

      

      {/* Formulario */}
      <ClientForm
        initialData={clienteEnEdicion}
        onSave={handleSave}
      />
      <br />
      <h2>Buscador de clientes</h2>
      {/* Barra de búsqueda */}
      <SearchBar onSearch={handleSearch} />

      {/* Tabla de clientes (mostrar solo los filtrados) */}
      <ClientTable
        clientes={filteredClientes}
        onEdit={setClienteEnEdicion}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ClientPage;