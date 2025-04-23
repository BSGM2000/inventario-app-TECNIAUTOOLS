import React, { useState } from "react";

const VentaForm = ({ initialData, clientes, onSave }) => {
  // Estado inicial para la venta
  const [venta, setVenta] = useState({
    id_venta: initialData?.id_venta || "",
    fecha_venta: initialData?.fecha_venta || new Date().toISOString().split("T")[0], // Cambiado a fecha_venta
    metodo_pago: initialData?.metodo_pago || "",
    total: initialData?.total || 0,
    id_cliente: initialData?.id_cliente || "",
    detalles: initialData?.detalles || []
  });

  // Estados adicionales para detalles y total
  const [detalles, setDetalles] = useState(initialData?.detalles || []);
  const [total, setTotal] = useState(0);

  // Agregar un nuevo detalle
  const handleAddDetalle = () => {
    setDetalles([...detalles, { id_repuesto: "", cantidad: 0, precio_unitario: 0, subtotal: 0 }]);
  };

  // Eliminar un detalle
  const handleRemoveDetalle = (index) => {
    const nuevosDetalles = detalles.filter((_, i) => i !== index);

    // Recalcular el total después de eliminar un detalle
    const nuevoTotal = nuevosDetalles.reduce((acc, detalle) => acc + detalle.subtotal, 0);

    setDetalles(nuevosDetalles);
    setTotal(nuevoTotal);
  };

  // Actualizar un detalle
  const handleUpdateDetalle = (index, field, value) => {
    const nuevosDetalles = [...detalles];

    // Validar que los valores sean números
    if (field === "id_repuesto" || field === "cantidad" || field === "precio_unitario") {
      if (isNaN(value) || value === "") {
        return alert(`El campo ${field} debe ser un número válido.`);
      }
    }

    nuevosDetalles[index][field] = value;

    // Calcular el subtotal automáticamente
    if (field === "cantidad" || field === "precio_unitario") {
      nuevosDetalles[index].subtotal =
        nuevosDetalles[index].cantidad * nuevosDetalles[index].precio_unitario;
    }

    // Calcular el total sumando todos los subtotales
    const nuevoTotal = nuevosDetalles.reduce((acc, detalle) => acc + detalle.subtotal, 0);

    setDetalles(nuevosDetalles);
    setTotal(nuevoTotal); // Actualizar el total
  };

  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar campos obligatorios
    if (!venta.fecha_venta || !venta.metodo_pago || !venta.id_cliente || detalles.length === 0) {
      return alert("Todos los campos y al menos un detalle son obligatorios.");
    }

    // Actualizar el total en el estado de la venta
    const ventaActualizada = { ...venta, total, detalles };

    onSave(ventaActualizada);

    // Reiniciar el formulario
    setVenta({
      fecha_venta: new Date().toISOString().split("T")[0],
      metodo_pago: "",
      total: 0,
      id_cliente: "",
      detalles: []
    });
    setDetalles([]);
    setTotal(0); // Reiniciar el total
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">{initialData ? "Editar Venta" : "Nueva Venta"}</h3>

      {/* Fecha de la venta */}
      <div className="mb-4">
        <label className="block mb-1">Fecha:</label>
        <input
          type="date"
          value={venta.fecha_venta}
          onChange={(e) => setVenta({ ...venta, fecha_venta: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      {/* Cliente */}
      <div className="mb-4">
        <label className="block mb-1">Cliente:</label>
        <select
          value={venta.id_cliente}
          onChange={(e) => setVenta({ ...venta, id_cliente: parseInt(e.target.value) })}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Selecciona un cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id_cliente} value={cliente.id_cliente}>
              {cliente.nombre} - {cliente.contacto}
            </option>
          ))}
        </select>
      </div>

      {/* Método de pago */}
      <div className="mb-4">
        <label className="block mb-1">Método de Pago:</label>
        <select
          value={venta.metodo_pago}
          onChange={(e) => setVenta({ ...venta, metodo_pago: e.target.value })}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Selecciona un método de pago</option>
          <option value="De contado">De contado</option>
          <option value="A crédito">A crédito</option>
        </select>
      </div>

      {/* Detalles de la venta */}
      <div className="mb-4">
        <label className="block mb-1">Detalles de la Venta:</label>
        {detalles.map((detalle, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="number"
              placeholder="ID Repuesto"
              value={detalle.id_repuesto}
              onChange={(e) =>
                handleUpdateDetalle(index, "id_repuesto", parseInt(e.target.value))
              }
              className="p-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Cantidad"
              value={detalle.cantidad}
              onChange={(e) =>
                handleUpdateDetalle(index, "cantidad", parseInt(e.target.value))
              }
              className="p-2 border rounded"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Precio Unitario"
              value={detalle.precio_unitario}
              onChange={(e) =>
                handleUpdateDetalle(index, "precio_unitario", parseFloat(e.target.value))
              }
              className="p-2 border rounded"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Subtotal"
              value={detalle.subtotal}
              readOnly
              className="p-2 border rounded bg-gray-100"
            />
            <button
              type="button"
              onClick={() => handleRemoveDetalle(index)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Eliminar
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddDetalle}
          className="bg-green-500 text-white px-4 py-2 rounded mt-2"
        >
          Agregar Detalle
        </button>
      </div>

      {/* Total */}
      <div className="mb-4">
        <label className="block mb-1">Total:</label>
        <input
          type="number"
          step="0.01"
          value={total}
          readOnly
          className="w-full p-2 border rounded bg-gray-100"
        />
      </div>

      {/* Botón de guardar */}
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {initialData ? "Actualizar" : "Guardar"}
      </button>
    </form>
  );
};

export default VentaForm;