// src/components/CompraTable.jsx
import React from 'react';
import styles from '../styles/Table.module.css'; // Asegúrate de crear este archivo CSS
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import api  from '../config/axios';
const formatNumber = (number) => {
    if (number === null || number === undefined) return '0.00';
    const num = typeof number === 'string' ? parseFloat(number) : number;
    return isNaN(num) ? '0.00' : num.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const VentaTable = ({ ventas, onEdit, onDelete }) => {
    // Función para generar el PDF
    const generarPDF = async (ventaId) => {
        try {
            // Obtener los datos completos de la venta
            const response = await api.get(`/ventas/${ventaId}`);
            const venta = response.data;
            console.log('Datos de la venta:', venta);
             // Obtener los datos del cliente
            const clienteResponse = await api.get(`/clientes/${venta.id_cliente}`); // Asegúrate de usar el nombre correcto del campo que contiene el ID del cliente
            const cliente = clienteResponse.data;
            console.log('Datos del cliente:', cliente);

            // Crear un nuevo documento PDF
            const doc = new jsPDF();
            
            // Configuración del documento
            doc.setFontSize(16);
            doc.setTextColor(40, 167, 69)
            doc.text('ORDEN DE COMPRA', 105, 15, { align: 'center' });
            doc.setTextColor(0, 0, 0)
            

            // Información del cliente
            doc.setFontSize(10);
            doc.text('Cliente: ' + cliente.nombre, 15, 60);
            doc.text('Documento: ' + (cliente.documento_cliente  || 'No especificado'), 15, 65)
            doc.text('Ciudad: ' + cliente.ciudad, 15, 70);

            // Información de la orden
            doc.text('Orden #: ' + venta.numero_factura, 150, 60);
            doc.text('Fecha: ' + new Date(venta.fecha_venta).toLocaleDateString(), 150, 65);
            doc.text('Método de pago: ' + venta.metodo_pago, 150, 70);

            // Tabla de productos
            const headers = [['Código', 'Descripción', 'Cant.', 'V. Unitario', 'Total']];
            const data = venta.detalles.map(detalle => [
                detalle.codigo || 'N/A',
                detalle.descripcion,
                detalle.cantidad,
                `$${formatNumber(parseFloat(detalle.precio_unitario).toFixed(2))}`,
                `$${formatNumber(parseFloat(detalle.precio_unitario) * (detalle.cantidad).toFixed(2))}`,
                
            ]);

            // Añadir la tabla al documento
            autoTable(doc, {
                head: headers,
                body: data,
                startY: 90,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [40, 167, 69] }
                });

            // Totales
            const finalY = doc.lastAutoTable.finalY + 10;
            const subtotal = venta.detalles.map(detalle => detalle.subtotal);
            const totalIva = parseFloat(subtotal) * 0.19;
            const totalConIva = parseFloat(subtotal) + parseFloat(totalIva);
            
            doc.setFontSize(10);
            doc.text('Subtotal: $' + formatNumber(subtotal) , 150, finalY);
            doc.text('IVA (19%): $' + formatNumber(totalIva.toFixed(2)), 150, finalY + 5);
            doc.text('Total: $' + formatNumber(totalConIva.toFixed(2)), 150, finalY + 15);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40, 167, 69);
            doc.text('¡GRACIAS POR SU COMPRA!', 105, finalY + 30, { align: 'center' });

            // Guardar el PDF
            doc.save(`factura-${venta.numero_factura}.pdf`);

        } catch (error) {
            console.error('Error al generar el PDF:', error);
            alert('Error al generar el PDF de la factura');
        }
    };
    return (
        <div className={styles.tableContainer}>
        <h2 className={styles.tableTitle}>Lista de Ventas</h2>
        <table className={styles.Table}>
            <thead className={styles.tableHead}>
            <tr>
                <th className={styles.tableHeaderCell}>ID</th>
                <th className={styles.tableHeaderCell}>Número de Factura</th>
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
                <td className={styles.tableCell} data-label="Número de Factura">{venta.numero_factura}</td>
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
                    <button onClick={() => generarPDF(venta.id_venta)} className={styles.deleteButton}>Generar PDF</button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
};

export default VentaTable;