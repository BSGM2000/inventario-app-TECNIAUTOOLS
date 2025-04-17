import React from "react";

const ClientTable = ({ clientes, onEdit, onDelete }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lista de Clientes</h2>
      <table className="w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Contacto</th>
            <th className="border px-4 py-2">Dirección</th>
            <th className="border px-4 py-2">Otros Datos</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id_cliente} className="hover:bg-gray-50">
              <td className="border px-4 py-2 text-center">{c.id_cliente}</td>
              <td className="border px-4 py-2">{c.nombre}</td>
              <td className="border px-4 py-2">{c.contacto}</td>
              <td className="border px-4 py-2">{c.direccion}</td>
              <td className="border px-4 py-2">{c.otros_datos}</td>
              <td className="border px-4 py-2 text-center">
                <button
                  onClick={() => onEdit(c)}
                  className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(c.id_cliente)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientTable;