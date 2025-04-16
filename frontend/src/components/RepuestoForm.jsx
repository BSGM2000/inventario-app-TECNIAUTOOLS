// src/components/RepuestoForm.jsx
import { useRef, useState, useEffect } from "react";
import axios from "axios";

const RepuestoForm = ({ onRepuestoCreado, repuestoEnEdicion }) => {
  const fileInputRef = useRef();
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock_actual: "",
    ubicacion: "",
    id_categoria: "",
    id_proveedor: "",
    imagen: null,
  });

  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  // 1. Cargar categorías y proveedores al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, provRes] = await Promise.all([
          axios.get("http://localhost:3000/api/categorias"),
          axios.get("http://localhost:3000/api/proveedores"),
        ]);
        setCategorias(catRes.data);
        setProveedores(provRes.data);
      } catch (error) {
        console.error("Error cargando categorías o proveedores:", error);
      }
    };
    fetchData();
  }, []);

  // 2. Precargar el formulario si viene un repuesto a editar
  useEffect(() => {
    if (repuestoEnEdicion) {
      setForm({
        nombre: repuestoEnEdicion.nombre,
        descripcion: repuestoEnEdicion.descripcion,
        precio: repuestoEnEdicion.precio,
        stock_actual: repuestoEnEdicion.stock_actual,
        ubicacion: repuestoEnEdicion.ubicacion,
        id_categoria: repuestoEnEdicion.id_categoria,
        id_proveedor: repuestoEnEdicion.id_proveedor,
      });
    }
  }, [repuestoEnEdicion]);


  //HandleChange para archivos 
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setForm({
      ...form,
      [name]: type === "file" ? files[0] : value,
    });
    };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("nombre", form.nombre);
      formData.append("descripcion", form.descripcion);
      formData.append("precio", isNaN(parseFloat(form.precio)) ? 0 : parseFloat(form.precio));
      formData.append("stock_actual", isNaN(parseInt(form.stock_actual)) ? 0 : parseInt(form.stock_actual));
      formData.append("ubicacion", form.ubicacion);
      formData.append("id_categoria", form.id_categoria);
      formData.append("id_proveedor", form.id_proveedor);

      // Agregar la imagen si existe
      if (fileInputRef.current && fileInputRef.current.files.length > 0) {
      formData.append("imagen", fileInputRef.current.files[0]);
      }
      
      console.log("FormData antes de enviar:", Array.from(formData.entries()));

      if (repuestoEnEdicion) {
        // 3a. Si estamos editando, usar PUT
        await axios.put(
          `http://localhost:3000/api/repuestos/${repuestoEnEdicion.id_repuesto}`,
          formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // 3b. Si es nuevo, usar POST
        await axios.post("http://localhost:3000/api/repuestos", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // Limpiar formulario
      setForm({
        nombre: "",
        descripcion: "",
        precio: "",
        stock_actual: "",
        ubicacion: "",
        id_categoria: "",
        id_proveedor: "",
        imagen: null,
      });
      fileInputRef.current.value = null;

      // Notificar al padre (App.jsx) para recargar lista y limpiar edición
      onRepuestoCreado();
    } catch (error) {
      console.error("Error al guardar repuesto:", error);
      alert("Error al guardar repuesto. Verifique la consola para más detalles.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-lg font-bold mb-4">
        {repuestoEnEdicion ? "Editar Repuesto" : "Agregar Repuesto"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Campos habituales */}
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
        <input
          type="file"
          name="imagen"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => setForm({ ...form, imagen: e.target.files[0] })}
          className="border p-2 rounded" 
        />
        {/* Select Categoría */}
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

        {/* Select Proveedor */}
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
        className={`mt-4 px-4 py-2 rounded text-white ${
          repuestoEnEdicion ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {repuestoEnEdicion ? "Actualizar" : "Guardar"}
      </button>
    </form>
  );
};

export default RepuestoForm;
