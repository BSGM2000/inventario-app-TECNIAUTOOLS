// src/components/CompraTable.jsx
import React from 'react';
import styles from '../styles/Table.module.css'; // Asegúrate de crear este archivo CSS

const VentaTable = ({ ventas, onEdit, onDelete }) => {
    return (
        <div className={styles.tableContainer}>
        <h2 className={styles.tableTitle}>Lista de Ventas</h2>
        <table className={styles.Table}>
            <thead className={styles.tableHead}>
            <tr>
                <th className={styles.tableHeaderCell}>ID</th>
                <th className={styles.tableHeaderCell}>Fecha</th>
                <th className={styles.tableHeaderCell}>Método de Pago</th>
                <th className={styles.tableHeaderCell}>Cliente</th>
                <th className={styles.tableHeaderCell}>Total</th>
                <th className={styles.tableHeaderCell}>Detalles</th>
                <th className={styles.tableHeaderCell}>Acciones</th>
            </tr>
            </thead>
            <tbody>
            {ventas.map(venta => (
                <tr key={venta.id_venta} className={styles.tableRow}>
                <td className={styles.tableCell} data-label="ID">{venta.id_venta}</td>
                <td className={styles.tableCell} data-label="Fecha">{new Date(venta.fecha_venta).toLocaleDateString()}</td>
                <td className={styles.tableCell} data-label="Método de Pago">{venta.metodo_pago}</td>
                <td className={styles.tableCell} data-label="Cliente">{venta.cliente}</td>
                <td><strong>{venta.total !== undefined && venta.total !== null ? `$${Number(venta.total).toLocaleString()}` : '-'}</strong></td>
                <td className={styles.tableCell} data-label="Detalles">
                                    {venta.detalles ? (
                                        typeof venta.detalles === 'string' ? (
                                            venta.detalles.split('; ').map((detalle, index) => (
                                                <div key={index} className={styles.detalleItem}>
                                                    <span className={styles.tableLabel}>{detalle}</span>
                                                </div>
                                            ))
                                        ) : (
                                            venta.detalles.map((detalle, index) => (
                                                <div key={index} className={styles.detalleItem}>
                                                    <span className={styles.tableLabel}>{detalle.nombre_repuesto}</span>
                                                    <span className={styles.tableLabel}>(x{detalle.cantidad_venta})</span>
                                                </div>
                                            ))
                                        )
                                    ) : (
                                        <span className={styles.tableLabel}>Sin detalles</span>
                                    )}
                                </td>
                <td className={styles.actionsCell} data-label="Acciones">
                    <button onClick={() => onEdit(venta)} className={styles.editButton}>Editar</button>
                    <button onClick={() => onDelete(venta.id_venta)} className={styles.deleteButton}>Eliminar</button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
};

export default VentaTable;