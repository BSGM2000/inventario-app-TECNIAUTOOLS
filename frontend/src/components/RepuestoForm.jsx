// src/components/RepuestoForm.jsx
import { useRef, useState, useEffect } from "react";
import styles from "../styles/Form.module.css"; // Asegúrate de que la ruta sea correcta
import axios from "axios";

const RepuestoForm = ({ repuestoEnEdicionModal, handleSaveModal, onClose }) => {
  const fileInputRef = useRef();
  const [form, setForm] = useState({
    nombre: "",
    codigo: "",
    descripcion: "",
    stock_actual: "",
    ubicacion: "",
    id_categoria: "",
    id_proveedor: "",
    imagen: null,
  });

  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token");

  // 1. Cargar categorías y proveedores al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [catRes, provRes] = await Promise.all([
          axios.get("http://localhost:3000/api/categorias", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:3000/api/proveedores", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setCategorias(catRes.data);
        setProveedores(provRes.data);
        
        // Si hay un repuesto en edición, precargar después de cargar las listas
        if (repuestoEnEdicionModal) {
          setForm({
            nombre: repuestoEnEdicionModal.nombre,
            codigo: repuestoEnEdicionModal.codigo || "",
            descripcion: repuestoEnEdicionModal.descripcion || "",
            stock_actual: repuestoEnEdicionModal.stock_actual || "",
            ubicacion: repuestoEnEdicionModal.ubicacion || "",
            id_categoria: repuestoEnEdicionModal.id_categoria || "",
            id_proveedor: repuestoEnEdicionModal.id_proveedor || "",
            imagen: null,
          });
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [repuestoEnEdicionModal, token]); // Agregar token como dependencia

  // 2. Precargar el formulario al cambiar el repuesto en edición
  useEffect(() => {
    if (repuestoEnEdicionModal) {
      // Solo precargar si ya tenemos las listas cargadas
      if (categorias.length > 0 && proveedores.length > 0) {
        setForm({
          nombre: repuestoEnEdicionModal.nombre,
          codigo: repuestoEnEdicionModal.codigo || "",
          descripcion: repuestoEnEdicionModal.descripcion || "",
          stock_actual: repuestoEnEdicionModal.stock_actual || "",
          ubicacion: repuestoEnEdicionModal.ubicacion || "",
          id_categoria: repuestoEnEdicionModal.id_categoria || "",
          id_proveedor: repuestoEnEdicionModal.id_proveedor || "",
          imagen: null,
        });
      }
    } else {
      setForm({
        nombre: "",
        codigo: "",
        descripcion: "",
        stock_actual: "",
        ubicacion: "",
        id_categoria: "",
        id_proveedor: "",
        imagen: null,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  }, [repuestoEnEdicionModal, categorias, proveedores]);

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
    const formData = new FormData();
    formData.append("nombre", form.nombre);
    formData.append("codigo", form.codigo);
    formData.append("descripcion", form.descripcion);
    formData.append("stock_actual", isNaN(parseInt(form.stock_actual)) ? 0 : parseInt(form.stock_actual));
    formData.append("ubicacion", form.ubicacion);
    formData.append("id_categoria", form.id_categoria);
    formData.append("id_proveedor", form.id_proveedor);

    // Agregar la imagen si se selecciona una nueva
    if (fileInputRef.current && fileInputRef.current.files.length > 0) {
      formData.append("imagen", fileInputRef.current.files[0]);
    }

    console.log("FormData antes de enviar:", Array.from(formData.entries()));

    // Llamar a la función de guardar que viene del padre
    handleSaveModal(formData);

    // Limpiar el formulario después de guardar (el padre se encargará de cerrar el modal)
    setForm({
      nombre: "",
      codigo: "",
      descripcion: "",
      stock_actual: "",
      ubicacion: "",
      id_categoria: "",
      id_proveedor: "",
      imagen: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      {isLoading && (
        <div className={styles.loading}>
          <p>Cargando datos...</p>
        </div>
      )}
      <h2 className={styles.formTitle}>
        {repuestoEnEdicionModal ? "Editar Repuesto" : "Agregar Repuesto"}
      </h2>

      <div className={styles.gridContainer}>
        {/* Campos del formulario (Nombre, Código, etc.) */}
        <div className={styles.formGroup}>
          <label htmlFor="nombreRepuesto" className={styles.label}>Nombre:</label>
          <input 
            type="text" 
            id="nombreRepuesto" 
            name="nombre" 
            value={form.nombre} 
            onChange={handleChange} 
            required 
            className={styles.inputField} 
            autoComplete="off"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="codigoRepuesto" className={styles.label}>Código:</label>
          <input 
            type="text" 
            id="codigoRepuesto" 
            name="codigo" 
            value={form.codigo} 
            onChange={handleChange} 
            required 
            className={styles.inputField} 
            autoComplete="off"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="descripcionRepuesto" className={styles.label}>Descripción:</label>
          <input 
            type="text" 
            id="descripcionRepuesto" 
            name="descripcion" 
            value={form.descripcion} 
            onChange={handleChange} 
            required 
            className={styles.inputField} 
            autoComplete="off"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="stockActualRepuesto" className={styles.label}>Stock actual:</label>
          <input 
            type="number" 
            id="stockActualRepuesto" 
            name="stock_actual" 
            value={form.stock_actual} 
            onChange={handleChange} 
            required 
            className={styles.inputField} 
            min="0"
            autoComplete="off"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="ubicacionRepuesto" className={styles.label}>Ubicación:</label>
          <select 
            id="ubicacionRepuesto" 
            name="ubicacion" 
            value={form.ubicacion} 
            onChange={handleChange} 
            required 
            className={styles.selectField}
          >
            <option value="">Seleccione Ubicación</option>
            <option value="Bodega">Bodega A</option>
            <option value="Camión">Camión</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="categoriaRepuesto" className={styles.label}>Categoría:</label>
          <select 
            id="categoriaRepuesto" 
            name="id_categoria" 
            value={form.id_categoria} 
            onChange={handleChange} 
            required 
            className={styles.selectField}
          >
            <option value="">Seleccione Categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id_categoria} value={String(cat.id_categoria)}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="proveedorRepuesto" className={styles.label}>Proveedor:</label>
          <select 
            id="proveedorRepuesto" 
            name="id_proveedor" 
            value={form.id_proveedor} 
            onChange={handleChange} 
            required 
            className={styles.selectField}
          >
            <option value="">Seleccione Proveedor</option>
            {proveedores.map((prov) => (
              <option key={prov.id_proveedor} value={String(prov.id_proveedor)}>
                {prov.empresa} ({prov.nombre})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="imagenRepuesto" className={styles.label}>Imagen:</label>
          <input 
            type="file" 
            id="imagenRepuesto" 
            name="imagen" 
            ref={fileInputRef} 
            onChange={handleChange} 
            accept="image/*"
            className={styles.inputField}
          />
        </div>
      </div>

      <button
        type="submit"
        className={`${styles.submitButton} ${
          repuestoEnEdicionModal ? styles.submitButtonEdit : styles.submitButtonCreate
        }`}
      >
        {repuestoEnEdicionModal ? "Actualizar" : "Guardar"}
      </button>
      <button type="button" onClick={onClose} className={styles.deleteButton}>Cancelar</button>
    </form>
  );
};

export default RepuestoForm;
