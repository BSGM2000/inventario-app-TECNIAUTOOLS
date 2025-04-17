import React, { useState } from "react";

const ClientForm = ({ initialData, onSave }) => {
  const [client, setClient] = useState({
    id: initialData?.id || "",
    nombre: initialData?.nombre || "",
    contacto: initialData?.contacto || "",
    direccion: initialData?.direccion || "",
    otros_datos: initialData?.otros_datos || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(client);
    setClient({ id: "",nombre: "", contacto: "", direccion: "", otros_datos: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">
        {initialData ? "Editar Cliente" : "Nuevo Cliente"}
      </h3>
      <div className="mb-4">
        <label className="block mb-1">ID</label>
        <input
          type="text"
          value={client.id}
          onChange={(e) => setClient({ ...client, id: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>
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