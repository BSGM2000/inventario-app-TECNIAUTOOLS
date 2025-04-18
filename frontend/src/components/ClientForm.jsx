import React, { useState, useEffect } from "react";

const ClientForm = ({ initialData, onSave }) => {
  const [client, setClient] = useState({
    id_cliente: initialData?.id_cliente || "",
    nombre: initialData?.nombre || "",
    contacto: initialData?.contacto || "",
    direccion: initialData?.direccion || "",
    otros_datos: initialData?.otros_datos || "",
  });

  // Actualizar el estado si initialData cambia
  useEffect(() => {
    if (initialData) {
      setClient({
        id_cliente: initialData.id_cliente || "",
        nombre: initialData.nombre || "",
        contacto: initialData.contacto || "",
        direccion: initialData.direccion || "",
        otros_datos: initialData.otros_datos || "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(client);
    setClient({
      id_cliente: "",
      nombre: "",
      contacto: "",
      direccion: "",
      otros_datos: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">
        {initialData ? "Editar Cliente" : "Nuevo Cliente"}
      </h3>

      {/* Campo ID (solo para edición) */}
      {initialData && (
        <div className="mb-4">
          <label className="block mb-1">ID Cliente</label>
          <input
            type="text"
            value={client.id_cliente}
            onChange={(e) => setClient({ ...client, id_cliente: e.target.value })}
            className="w-full p-2 border rounded"
            disabled // ← Deshabilitar edición del ID
          />
        </div>
      )}

      <div className="mb-4">
        <label className="block mb-1">Nombre:</label>
        <input
          type="text"
          value={client.nombre}
          onChange={(e) => setClient({ ...client, nombre: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Contacto:</label>
        <input
          type="text"
          value={client.contacto}
          onChange={(e) => setClient({ ...client, contacto: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Dirección:</label>
        <textarea
          value={client.direccion}
          onChange={(e) => setClient({ ...client, direccion: e.target.value })}
          className="w-full p-2 border rounded"
          rows="2"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Otros Datos:</label>
        <textarea
          value={client.otros_datos}
          onChange={(e) => setClient({ ...client, otros_datos: e.target.value })}
          className="w-full p-2 border rounded"
          rows="2"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {initialData ? "Actualizar" : "Guardar"}
      </button>
    </form>
  );
};

export default ClientForm;