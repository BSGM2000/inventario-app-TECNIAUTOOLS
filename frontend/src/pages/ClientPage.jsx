import React, { useEffect, useState } from "react";
import axios from "axios";
import ClientForm from "../components/ClientForm";
import ClientTable from "../components/ClientTable";

const ClientPage = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteEnEdicion, setClienteEnEdicion] = useState(null);

  // Cargar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      const res = await axios.get("http://localhost:3000/api/clientes");
      setClientes(res.data);
    };
    fetchClientes();
  }, []);

  // Guardar/Actualizar cliente
  const handleSave = async (clientData) => {
    if (clienteEnEdicion) {
      await axios.put(
        `http://localhost:3000/api/clientes/${clienteEnEdicion.id_cliente}`,
        clientData
      );
    } else {
      await axios.post("http://localhost:3000/api/clientes", clientData);
    }
    setClienteEnEdicion(null);
    const res = await axios.get("http://localhost:3000/api/clientes");
    setClientes(res.data);
  };

  // Eliminar cliente
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este cliente?")) return;
    await axios.delete(`http://localhost:3000/api/clientes/${id}`);
    const res = await axios.get("http://localhost:3000/api/clientes");
    setClientes(res.data);
  };

  return (
    <div>
      <ClientForm
        initialData={clienteEnEdicion}
        onSave={handleSave}
      />
      <ClientTable
        clientes={clientes}
        onEdit={setClienteEnEdicion}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ClientPage;