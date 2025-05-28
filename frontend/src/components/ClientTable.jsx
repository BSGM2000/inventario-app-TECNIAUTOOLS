import React from "react";
import styles from "../styles/Table.module.css";

const ClientTable = ({ clientes, onEdit, onDelete }) => {
  return (
    <div className={styles.tableContainer}>
      <h2 className={styles.tableTitle}>Lista de Clientes</h2>
      <table className={styles.Table}>
        <thead className={styles.tableHead}>
          <tr>
            <th className={styles.tableHeaderCell}>Codigo Cliente</th>
            <th className={styles.tableHeaderCell}>Nombre</th>
            <th className={styles.tableHeaderCell}>Documento Cliente</th>
            <th className={styles.tableHeaderCell}>Ciudad</th>
            <th className={styles.tableHeaderCell}>Dirección</th>
            <th className={styles.tableHeaderCell}>Teléfono</th>
            <th className={styles.tableHeaderCell}>Correo</th>
            <th className={styles.tableHeaderCell}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id_cliente} className={styles.tableRow}>
              <td className={styles.tableCell} data-label="Codigo Cliente">{c.codigo_cliente}</td>
              <td className={styles.tableCell} data-label="Nombre">{c.nombre}</td>
              <td className={styles.tableCell} data-label="Documento">{c.documento_cliente}</td>
              <td className={styles.tableCell} data-label="Ciudad">{c.ciudad}</td>
              <td className={styles.tableCell} data-label="Dirección">{c.direccion}</td>
              <td className={styles.tableCell} data-label="Teléfono">{c.telefono}</td>
              <td className={styles.tableCell} data-label="Correo">{c.correo}</td>
              <td className={styles.actionsCell} data-label="Acciones">
                <button
                  onClick={() => onEdit(c)}
                  className={styles.editButton}
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(c.id_cliente)}
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

export default ClientTable;