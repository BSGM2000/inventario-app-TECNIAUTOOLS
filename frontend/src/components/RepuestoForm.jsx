import { useState, useEffect } from "react";
import axios from "axios";

const RepuestoForm = ({ onRepuestoCreado }) => {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock_actual: "",
    ubicacion: "",
    id_categoria: "",
    id_proveedor: "",
  });

  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
    try {
      const [catRes, provRes] = await Promise.all([
        axios.get("http://localhost:3000/api/categorias"),
        axios.get("http://localhost:3000/api/proveedores"),
      ]);
      setCategorias(catRes.data);
      setProveedores(provRes.data);
    } catch (error){
      console.error("Error cargando categorías o proveedores:", error)
    }
  };
  fetchData();  
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:3000/api/repuestos", {
        ...form,
        precio: parseFloat(form.precio),
        stock_actual: parseInt(form.stock_actual),
      });

      setForm({
        nombre: "",
        descripcion: "",
        precio: "",
        stock_actual: "",
        ubicacion: "",
        id_categoria: "",
        id_proveedor: "",
      });

      if (onRepuestoCreado) onRepuestoCreado();
    } catch (error) {
      console.error("Error al crear repuesto:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-lg font-bold mb-4">Agregar Repuesto</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="precio"
          placeholder="Precio"
          value={form.precio}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="stock_actual"
          placeholder="Stock actual"
          value={form.stock_actual}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="ubicacion"
          placeholder="Ubicación"
          value={form.ubicacion}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <select
          name="id_categoria"
          value={form.id_categoria}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        >
          <option value="">Seleccione Categoría</option>
          {categorias.map((cat) => (
            <option key={cat.id_categoria} value={cat.id_categoria}>
              {cat.nombre}
            </option>
          ))}
        </select>
        <select
          name="id_proveedor"
          value={form.id_proveedor}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        >
          <option value="">Seleccione Proveedor</option>
          {proveedores.map((prov) => (
            <option key={prov.id_proveedor} value={prov.id_proveedor}>
              {prov.nombre}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
      >
        Guardar
      </button>
    </form>
  );
};

export default RepuestoForm;
