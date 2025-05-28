import React, { useState, useEffect } from "react";
import styles from "../styles/Form.module.css"; // Importa los estilos

const ClientForm = ({ initialData, onSave, onClientSaved, onClose }) => {
  const [client, setClient] = useState({
    codigo_cliente: initialData?.codigo_cliente || "",
    nombre: initialData?.nombre || "",
    documento_cliente: initialData?.documento_cliente || "",
    ciudad: initialData?.ciudad || "",
    direccion: initialData?.direccion || "",
    telefono: initialData?.telefono || "",
    correo: initialData?.correo || "",
  });

  useEffect(() => {
    if (initialData) {
      setClient({
        codigo_cliente: initialData.codigo_cliente || "",
        nombre: initialData.nombre || "",
        documento_cliente: initialData.documento_cliente || "",
        ciudad: initialData.ciudad || "",
        direccion: initialData.direccion || "",
        telefono: initialData.telefono || "",
        correo: initialData.correo || "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(client);
    setClient({
      codigo_cliente: "",
      nombre: "",
      documento_cliente: "",
      ciudad: "",
      direccion: "",
      telefono: "",
      correo: "",
    });
    if (onClientSaved) {
      onClientSaved();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClient({ ...client, [name]: value });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h3 className={styles.formTitle}>
        {initialData ? "Editar Cliente" : "Nuevo Cliente"}
      </h3>

      <div className={`${styles.gridForm}`}>
        {/* Campo ID (solo para edición) */}
        {initialData && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Código Cliente</label>
            <input
              type="text"
              value={client.codigo_cliente}
              name="codigo_cliente"
              onChange={handleInputChange}
              className={styles.inputField}
              disabled
            />
          </div>
        )}
        <div className={styles.formGroup}>
          <label className={styles.label}>CÓDIGO CLIENTE</label>
          <input
            type="text"
            value={client.codigo_cliente}
            name="codigo_cliente"
            onChange={handleInputChange}
            className={styles.inputField}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Nombre:</label>
          <input
            type="text"
            value={client.nombre}
            name="nombre"
            onChange={handleInputChange}
            className={styles.inputField}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Documento Cliente</label>
          <input
            type="text"
            value={client.documento_cliente}
            name="documento_cliente"
            onChange={handleInputChange}
            className={styles.inputField}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ciudad:</label>
          <input
            type="text"
            value={client.ciudad}
            name="ciudad"
            onChange={handleInputChange}
            className={styles.inputField}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Dirección:</label>
          <input
            type="text"
            value={client.direccion}
            name="direccion"
            onChange={handleInputChange}
            className={styles.inputField}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Teléfono:</label>
          <input
            type="text"
            value={client.telefono}
            name="telefono"
            onChange={handleInputChange}
            className={styles.inputField}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Correo:</label>
          <input
            type="text"
            value={client.correo}
            name="correo"
            onChange={handleInputChange}
            className={styles.inputField}
          />
        </div>
      </div>

      <button type="submit" className={styles.submitButton}>
        {initialData ? "Actualizar" : "Guardar"}
      </button>
      <button type="button" onClick={onClose} className={styles.deleteButton}>Cancelar</button>
    </form>
  );
};

export default ClientForm;