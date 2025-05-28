import React, { useState, useEffect } from "react";
import styles from "../styles/Form.module.css"; // Asegúrate de que la ruta sea correcta

const ProviderForm = ({ initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    empresa: "",
    nombre: "",
    contacto: "",
    direccion: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ empresa: "", nombre: "", contacto: "", direccion: "" });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>{initialData ? "Editar Proveedor" : "Nuevo Proveedor"}</h2>
      <div className={styles.formGroup}>
        <label htmlFor="empresa" className={styles.label}>Empresa:</label>
        <input
          type="text"
          id="empresa"
          name="empresa"
          value={formData.empresa}
          onChange={handleChange}
          className={styles.inputField}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="nombre" className={styles.label}>Nombre Asesor:</label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className={styles.inputField}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="contacto" className={styles.label}>Contacto Asesor:</label>
        <input
          type="text"
          id="contacto"
          name="contacto"
          value={formData.contacto}
          onChange={handleChange}
          className={styles.inputField}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="direccion" className={styles.label}>Dirección Empresa:</label>
        <input
          type="text"
          id="direccion"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          className={styles.inputField}
        />
      </div>
      <button
        type="submit"
        className={styles.submitButton}
      >
        {initialData ? "Actualizar" : "Guardar"}
      </button>
      <button type="button" onClick={onClose} className={styles.deleteButton}>Cancelar</button>
    </form>
  );
};

export default ProviderForm;