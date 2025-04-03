import { useState } from "react";

export default function Productos() {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [marca, setMarca] = useState("");
  const [stock, setStock] = useState("");
  const [productos, setProductos] = useState([{id: 1, nombre: "Motor", precio: 200, marca: "Gauss", stock: 100}]);
  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [mensaje, setMensaje] = useState("");

  // ✅ AGREGAR PRODUCTO
  const agregarProducto = () => {
    if (!nombre || !precio) {
      setMensaje("⚠️ Nombre y precio son obligatorios.");
      return;
    }

    const nuevoProducto = {
      id: Date.now(),
      nombre,
      precio: parseFloat(precio),
      stock: parseFloat(stock),
      marca,
    };

    setProductos([nuevoProducto, ...productos]); // Agregar arriba (orden descendente)
    setNombre("");
    setPrecio("");
    setMarca("");
    setStock("");
    setMensaje("✅ Producto agregado correctamente.");
    setTimeout(() => setMensaje(""), 2000);
  };

  // ✅ SELECCIONAR PRODUCTO PARA EDITAR
  const seleccionarProducto = (producto) => {
    setNombre(producto.nombre);
    setPrecio(producto.precio);
    setStock(producto.stock);
    setMarca(producto.marca);
    setEditando(true);
    setIdEditando(producto.id);
  };

  // ✅ ACTUALIZAR PRODUCTO
  const actualizarProducto = () => {
    if (!nombre || !precio) {
      setMensaje("⚠️ Nombre y precio son obligatorios.");
      return;
    }

    setProductos(
      productos.map((prod) =>
        prod.id === idEditando ? { ...prod, nombre,marca, stock: parseFloat(stock) , precio: parseFloat(precio) } : prod
      )
    );

    setEditando(false);
    setIdEditando(null);
    setNombre("");
    setPrecio("");
    setStock("");
    setMarca("");
    setMensaje("✅ Producto actualizado correctamente.");
    setTimeout(() => setMensaje(""), 2000);
  };

  // ✅ ELIMINAR PRODUCTO
  const eliminarProducto = (id) => {
    setProductos(productos.filter((producto) => producto.id !== id));
    setMensaje("🗑️ Producto eliminado.");
    setTimeout(() => setMensaje(""), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📦 Gestión de Productos</h1>

      {/* ✅ Mensaje de éxito/error */}
      {mensaje && <p className="bg-yellow-200 text-gray-800 px-4 py-2 rounded-md mb-4">{mensaje}</p>}

      {/* ✅ Formulario */}
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg mb-6">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre del producto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Precio"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
           <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
           <input
            type="text"
            placeholder="Marca del producto"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {editando ? (
            <button
              onClick={actualizarProducto}
              className="w-full bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition duration-300"
            >
              ✏️ Actualizar
            </button>
          ) : (
            <button
              onClick={agregarProducto}
              className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition duration-300"
            >
              ➕ Agregar
            </button>
          )}
        </div>
      </div>

      {/* ✅ Tabla de productos */}
      <div className="overflow-x-auto w-full max-w-2xl">
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-3 px-6 text-left">ID</th>
              <th className="py-3 px-6 text-left">Nombre</th>
              <th className="py-3 px-6 text-left">Marca</th>
              <th className="py-3 px-6 text-left">Precio</th>
              <th className="py-3 px-6 text-center">Stock</th>
              <th className="py-3 px-6 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id} className="border-b hover:bg-gray-100">
                <td className="py-3 px-6 text-green-600 font-semibold">{producto.id}</td>
                <td className="py-3 px-6">{producto.nombre}</td>
                <td className="py-3 px-6">{producto.marca}</td>
                <td className="py-3 px-6 text-green-600 font-semibold">${producto.precio}</td>
                <td className="py-3 px-6 text-green-600 font-semibold">{producto.stock}</td>
                <td className="py-3 px-6 flex justify-center gap-3">
                  <button
                    onClick={() => seleccionarProducto(producto)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition duration-300"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => eliminarProducto(producto.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition duration-300"
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr>
                <td colSpan="3" className="py-4 text-center text-gray-500">
                  ❌ No hay productos aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
