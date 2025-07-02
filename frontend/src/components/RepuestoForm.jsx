// src/components/RepuestoForm.jsx
import { useState, useEffect } from "react";
import styles from "../styles/Form.module.css";
import api from "../config/axios";
import Select from 'react-select';

const RepuestoForm = ({ repuestoEnEdicionModal, handleSaveModal, onClose }) => {
  const [form, setForm] = useState({
    codigo: "",
    descripcion: "",
    precio: "",
    id_categoria: "",
    id_proveedor: "",
    stocks: []
  });

  const [categorias, setCategorias] = useState([]);
  const [categoriasOptions, setCategoriasOptions] = useState([]);
  const [idCategoria, setIdCategoria] = useState('');
  const [proveedores, setProveedores] = useState([]);
  const [proveedoresOptions, setProveedoresOptions] = useState([]);
  const [idProveedor, setIdProveedor] = useState('');
  const [ubicaciones, setUbicaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token");

  // Cargar categorías, proveedores y ubicaciones al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [catRes, provRes, ubiRes] = await Promise.all([
          api.get("/categorias"),
          api.get("/proveedores"),
          api.get("/ubicaciones")
        ]);
        setCategorias(catRes.data);
        setProveedores(provRes.data);
        setUbicaciones(ubiRes.data);
        //Options del Select de categorias
        const categoriasOptions = catRes.data.map(cat =>({
          value: cat.id_categoria,
          label: cat.nombre
        }));
        setCategoriasOptions(categoriasOptions);
        ////Options del Select de proveedores
        const proveedoresOptions = provRes.data.map(prov => ({
          value: prov.id_proveedor,
          label: `${prov.nombre} (${prov.empresa || ""})`
        }));
        setProveedoresOptions(proveedoresOptions);
        
        // Si hay un repuesto en edición, precargar después de cargar las listas
        if (repuestoEnEdicionModal) {
          const stocks = JSON.parse(repuestoEnEdicionModal.stocks || '[]');
          setForm({
            codigo: repuestoEnEdicionModal.codigo || "",
            descripcion: repuestoEnEdicionModal.descripcion || "",
            id_categoria: repuestoEnEdicionModal.id_categoria || "",
            id_proveedor: repuestoEnEdicionModal.id_proveedor || "",
            stocks: stocks
          });
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [repuestoEnEdicionModal, token]);

  const getSelectedValueCategoria = (idCategoria) =>{
    if (!idCategoria) {
      return null;
    }
    // Asegurarse de comparar strings
    return categoriasOptions.find(option => 
        option.value.toString() === idCategoria.toString()
    ) || null;
  };
  const handleIdCategoriaChange = (selectedOption) => {
    setIdCategoria(selectedOption ? selectedOption.value : '');
  };

  const getSelectedValueProveedor = (idProveedor) => {
    if (!idProveedor) {
        return null;
    }
    // Asegurarse de comparar strings
    return proveedoresOptions.find(option => 
        option.value.toString() === idProveedor.toString()
    ) || null;
  };
  const handleIdProveedorChange = (selectedOption) => {
    setIdProveedor(selectedOption ? selectedOption.value : '');
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setForm({
      ...form,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleStockChange = (ubicacionId, value) => {
    const stockValue = value === "" ? 0 : parseInt(value);
    setForm(prev => {
      const newStocks = [...prev.stocks];
      const stockIndex = newStocks.findIndex(s => s.id_ubicacion === ubicacionId);
      
      if (stockIndex >= 0) {
        newStocks[stockIndex] = { ...newStocks[stockIndex], stock_actual: stockValue };
      } else {
        newStocks.push({ id_ubicacion: ubicacionId, stock_actual: stockValue });
      }
      
      return { ...prev, stocks: newStocks };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("codigo", form.codigo);
    formData.append("descripcion", form.descripcion);
    formData.append("precio", form.precio);
    formData.append("id_categoria", idCategoria);
    formData.append("id_proveedor", idProveedor);
    formData.append("stocks", JSON.stringify(form.stocks));

    handleSaveModal(formData);

    setForm({
      codigo: "",
      descripcion: "",
      precio: "",
      id_categoria: "",
      id_proveedor: "",
      stocks: []
    });
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
          <label htmlFor="precioRepuesto" className={styles.label}>Precio:</label>
          <input 
            type="number" 
            id="precioRepuesto" 
            name="precio" 
            value={form.precio} 
            onChange={handleChange} 
            required 
            className={styles.inputField} 
            autoComplete="off"
          />
        </div>

        {/* Stock por ubicación */}
        {ubicaciones.map((ubicacion) => (
          <div key={ubicacion.id_ubicacion} className={styles.formGroup}>
            <label htmlFor={`stock-${ubicacion.id_ubicacion}`} className={styles.label}>
              Stock en {ubicacion.nombre}:
            </label>
            <input 
              type="number" 
              id={`stock-${ubicacion.id_ubicacion}`}
              value={form.stocks.find(s => s.id_ubicacion === ubicacion.id_ubicacion)?.stock_actual || ''}
              onChange={(e) => handleStockChange(ubicacion.id_ubicacion, e.target.value)}
              className={styles.inputField}
              min="0"
              autoComplete="off"
            />
          </div>
        ))}

        <div className={styles.formGroup}>
          <label htmlFor="categoriaRepuesto" className={styles.label}>Categoría:</label>
          <Select 
            id="idCategoria"
            name="idCategoria"
            value={getSelectedValueCategoria(idCategoria)}
            onChange={handleIdCategoriaChange}
            options={categoriasOptions}
            placeholder="Buscar categoría..."
            noOptionsMessage={() => "No se encontraron categorías"}
            isSearchable
            className="basic-single"
            classNamePrefix="select"
            loadingMessage={() => "Buscando..."}
            isLoading={categoriasOptions.length === 0}
            filterOption={(option, inputValue) => 
                option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
                option.ciudad?.toLowerCase().includes(inputValue.toLowerCase())
            }
            isClearable
            required
          />
          
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="proveedorRepuesto" className={styles.label}>Proveedor:</label>
          <Select 
            id="idProveedor"
            name="idProveedor"
            value={getSelectedValueProveedor(idProveedor)}
            onChange={handleIdProveedorChange}
            options={proveedoresOptions}
            placeholder="Buscar proveedor..."
            noOptionsMessage={() => "No se encontraron proveedores"}
            isSearchable
            className="basic-single"
            classNamePrefix="select"
            loadingMessage={() => "Buscando..."}
            isLoading={proveedoresOptions.length === 0}
            filterOption={(option, inputValue) => 
                option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
                option.ciudad?.toLowerCase().includes(inputValue.toLowerCase())
            }
            isClearable
            required
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
