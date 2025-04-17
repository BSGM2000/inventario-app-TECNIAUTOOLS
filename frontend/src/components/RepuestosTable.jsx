// src/components/RepuestosTable.jsx
import React from "react";

const RepuestosTable = ({ repuestos, onEdit, onDelete }) => {
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
            <th className="border px-4 py-2">Categoria</th>
            <th className="border px-4 py-2">Proveedor</th>
            <th className="border px-4 py-2">Ubicación</th>
            <th className="border p-0 w-[80px]">Imagen</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {repuestos.map((r) => (
            <tr key={r.id_repuesto}>
              <td className="border px-4 py-2 text-center">{r.nombre}</td>
              <td className="border px-4 py-2 text-center ">{r.descripcion}</td>
              <td className="border px-4 py-2 text-center">${r.precio.toLocaleString()}</td>
              <td className="border px-4 py-2 text-center">{r.stock_actual}</td>
              <td className="border px-4 py-2 text-center">{r.categoria}</td>
              <td className="border px-4 py-2 text-center">{r.proveedor}</td>   
              <td className="border px-4 py-2 text-center">{r.ubicacion}</td>
              <td className="border p-0 w-[150px]">
                <div className="w-full h-full flex items-center justify-center">
                  {r.imagen_url ? (
                    <img
                      src={r.imagen_url}
                      alt={r.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 italic text-xs">
                      Sin imagen
                    </span>
                  )}
                </div>
              </td>
              <td className="border px-4 py-2 text-center">
                <button
                  onClick={() => onEdit(r)}
                  className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(r.id_repuesto)}
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

export default RepuestosTable;
