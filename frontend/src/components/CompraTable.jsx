// src/components/CompraTable.jsx
import React from 'react';
import styles from '../styles/Table.module.css'; // Asegúrate de crear este archivo CSS

const CompraTable = ({ compras, onEdit, onDelete }) => {
    return (
        <div className={styles.tableContainer}>
        <h2 className={styles.tableTitle}>Lista de Compras</h2>
        <table className={styles.Table}>
            <thead className={styles.tableHead}>
            <tr>
                <th className={styles.tableHeaderCell}>ID</th>
                <th className={styles.tableHeaderCell}>Fecha</th>
                <th className={styles.tableHeaderCell}>Factura</th>
                <th className={styles.tableHeaderCell}>Proveedor</th>
                <th className={styles.tableHeaderCell}>Total</th>
                <th className={styles.tableHeaderCell}>Detalles</th>
                <th className={styles.tableHeaderCell}>Acciones</th>
            </tr>
            </thead>
            <tbody>
            {compras.map(compra => (
                <tr key={compra.id_compra} className={styles.tableRow}>
                <td className={styles.tableCell} data-label="ID">{compra.id_compra}</td>
                <td className={styles.tableCell} data-label="Fecha">{new Date(compra.fecha_compra).toLocaleDateString()}</td>
                <td className={styles.tableCell} data-label="Factura">{compra.numero_factura}</td>
                <td className={styles.tableCell} data-label="Proveedor">{compra.proveedor}</td>
                <td> <strong>{compra.total_compra !== undefined && compra.total_compra !== null ? `$${Number(compra.total_compra).toLocaleString()}` : '-'}</strong></td>
                <td className={styles.tableCell} data-label="Detalles">
                    {compra.detalles ? (
                        typeof compra.detalles === 'string' ? (
                            compra.detalles.split('; ').map((detalle, index) => (
                                <div key={index} className={styles.detalleItem}>
                                    <span className={styles.label}>{detalle}</span>
                                </div>
                            ))
                        ) : (
                            compra.detalles.map((detalle, index) => (
                                <div key={index} className={styles.detalleItem}>
                                    <span className={styles.tableCell}>{detalle.nombre_repuesto}</span>
                                    <span className={styles.tableCell}>(x{detalle.cantidad_compra})</span>
                                    <span className={styles.tableCell}>{detalle.id_ubicacion}</span>

                                </div>
                            ))
                        )
                    ) : (
                        <span className={styles.tableCell}>Sin detalles</span>
                    )}
                </td>
                <td className={styles.actionsCell} data-label="Acciones">
                    <button onClick={() => onEdit(compra)} className={styles.editButton}>Editar</button>
                    <button onClick={() => onDelete(compra.id_compra)} className={styles.deleteButton}>Eliminar</button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
};

export default CompraTable;