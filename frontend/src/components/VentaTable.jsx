import React from "react";

const VentaTable = ({ ventas, onEdit, onDelete }) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-2">Lista de Ventas</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">ID Venta</th>
            <th className="p-2">ID Cliente</th>
            <th className="p-2">Fecha Venta</th>
            <th className="p-2">Método de Pago</th>
            <th className="p-2">Total</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.id_venta} className="border">
              <td className="p-2">{venta.id_venta}</td>
              <td className="p-2">{venta.id_cliente}</td>
              <td className="p-2">{venta.fecha_venta.split("T")[0]}</td>
              <td className="p-2">{venta.metodo_pago}</td>
              <td className="p-2">${venta.total.toFixed(2)}</td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => onEdit(venta)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(venta.id_venta)}
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

export default VentaTable;