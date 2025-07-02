import React from "react";
import styles from "../styles/Table.module.css";
import { formatNumber } from '../config/formatNumber';

const RepuestosTable = ({ filteredRepuestos, onEdit, onDelete}) => {
  return (
    <div className={styles.tableContainer}>
      <h2 className={styles.tableTitle}>Lista de Repuestos</h2>
      <table className={styles.Table}>
        <thead className={styles.tableHead}>
          <tr>
            <th className={styles.tableHeaderCell}>Código</th>
            <th className={styles.tableHeaderCell}>Descripción</th>
            <th className={styles.tableHeaderCell}>Precio</th>
            <th className={styles.tableHeaderCell}>Stock por Ubicación</th>
            <th className={styles.tableHeaderCell}>Total</th>
            <th className={styles.tableHeaderCell}>Categoría</th>
            <th className={styles.tableHeaderCell}>Proveedor</th>
            <th className={styles.tableHeaderCell}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredRepuestos.map((r) => (
            <tr key={r.id_repuesto} className={styles.tableRow}>
              <td className={styles.tableCell} data-label="Código">{r.codigo || 'Sin código'}</td>
              <td className={styles.tableCell} data-label="Descripción">{r.descripcion || 'Sin descripción'}</td>
              <td className={styles.tableCell} data-label="Precio"><strong>${formatNumber(r.precio) || 'Sin precio'}</strong></td>
              <td className={styles.tableCell} data-label="Stock por Ubicación">
                {r.stocks && r.stocks.length > 0 ? (
                  <ul className={styles.stockList}>
                    {JSON.parse(r.stocks).map(stock => (
                      <li key={stock.id_ubicacion}>
                        {stock.nombre_ubicacion}: {stock.stock_actual}
                      </li>
                    ))}
                  </ul>
                ) : (
                  'Sin stock'
                )}
              </td>
              <td className={styles.tableCell} data-label="Total">{r.stocks && r.stocks.length > 0 ? (
                  <strong>${formatNumber(JSON.parse(r.stocks).reduce((total, stock) => total + stock.stock_actual * r.precio, 0))}</strong>
                ) : (
                  'Sin stock'
                )}
                
              </td>
              <td className={styles.tableCell} data-label="Categoría">{r.categoria}</td>
              <td className={styles.tableCell} data-label="Proveedor">{r.proveedor}</td>
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
