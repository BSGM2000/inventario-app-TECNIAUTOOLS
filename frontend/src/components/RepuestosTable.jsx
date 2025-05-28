import React from "react";
import styles from "../styles/Table.module.css";

const RepuestosTable = ({ filteredRepuestos, onEdit, onDelete}) => {
 

  return (
    <div className={styles.tableContainer}>
      <h2 className={styles.tableTitle}>Lista de Repuestos</h2>
      <table className={styles.Table}>
        <thead className={styles.tableHead}>
          <tr>
            <th className={styles.tableHeaderCell}>Nombre</th>
            <th className={styles.tableHeaderCell}>Código</th>
            <th className={styles.tableHeaderCell}>Descripción</th>
            <th className={styles.tableHeaderCell}>Stock</th>
            <th className={styles.tableHeaderCell}>Categoría</th>
            <th className={styles.tableHeaderCell}>Proveedor</th>
            <th className={styles.tableHeaderCell}>Ubicación</th>
            <th className={styles.tableHeaderCell}>Imagen</th>
            <th className={styles.tableHeaderCell}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredRepuestos.map((r) => (
            <tr key={r.id_repuesto} className={styles.tableRow}>
              <td className={styles.tableCell} data-label="Nombre">{r.nombre || 'Sin nombre'}</td>
              <td className={styles.tableCell} data-label="Código">{r.codigo || 'Sin código'}</td>
              <td className={styles.tableCell} data-label="Descripción">{r.descripcion || 'Sin descripción'}</td>
              <td className={styles.tableCell} data-label="Stock">{r.stock_actual !== undefined ? r.stock_actual : '-'}</td>
              <td className={styles.tableCell} data-label="Categoría">{r.categoria}</td>
              <td className={styles.tableCell} data-label="Proveedor">{r.proveedor}</td>
              <td className={styles.tableCell} data-label="Ubicación">{r.ubicacion || 'Sin ubicación'}</td>
              <td className={`${styles.tableCell} ${styles.imageContainer}`} data-label="Imagen">
                {r.imagen_url ? (
                  <img
                    src={r.imagen_url}
                    alt={r.nombre}
                    className={styles.repuestoImage}
                  />
                ) : (
                  <span className={styles.noImageText}>Sin imagen</span>
                )}
              </td>
              <td className={styles.actionsCell} data-label="Acciones">
                <button
                  onClick={() => onEdit(r)}
                  className={styles.editButton}
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(r.id_repuesto)}
                  className={styles.deleteButton}
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
