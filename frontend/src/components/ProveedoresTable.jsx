import React from "react";
import styles from "../styles/Table.module.css"; // Asegúrate de que la ruta sea correcta

const ProviderTable = ({ proveedores, onEdit, onDelete }) => {
  return (
    <div className={styles.tableContainer}>
      <h2 className={styles.tableTitle}>Lista de Proveedores</h2>
      <table className={styles.Table}>
        <thead className={styles.tableHead}>
          <tr>
            <th scope="col" className={styles.tableHeaderCell}>Empresa</th>
            <th scope="col" className={styles.tableHeaderCell}>Nombre Asesor</th>
            <th scope="col" className={styles.tableHeaderCell}>Contacto Asesor</th>
            <th scope="col" className={styles.tableHeaderCell}>Dirección Empresa</th>
            <th className={styles.tableHeaderCell}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((proveedor) => (
            <tr key={proveedor.id_proveedor}>
              <td className={styles.tableCell} data-label="Empresa">{proveedor.empresa}</td>
              <td className={styles.tableCell} data-label="Nombre Asesor">{proveedor.nombre}</td>
              <td className={styles.tableCell} data-label="Contacto Asesor">{proveedor.contacto}</td>
              <td className={styles.tableCell} data-label="Dirección Empresa">{proveedor.direccion}</td>
              <td className={styles.actionsCell}>
                <button
                  onClick={() => onEdit(proveedor)}
                  className={styles.editButton}
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(proveedor.id_proveedor)}
                  className={styles.deleteButton}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {proveedores.length === 0 && <div>No hay proveedores registrados.</div>}
    </div>
  );
};

export default ProviderTable;