// src/components/CompraForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styles from '../styles/Form.module.css';
import axios from 'axios';
// Función para formatear números con separadores de miles
const formatNumber = (number) => {
    return new Intl.NumberFormat('es-CO').format(Number(number).toFixed(2));
};
const CompraForm = ({ initialData, onSave, onClose }) => {
    const [proveedores, setProveedores] = useState([]);
    const [repuestos, setRepuestos] = useState([]);
    const [detallesCompra, setDetallesCompra] = useState([{ 
        id_repuesto: '', 
        cantidad: '', 
        precio_compra_sin_iva: '', 
        iva: '0.00', 
        precio_compra_con_iva: '0.00' 
    }]);
    const [fechaCompra, setFechaCompra] = useState('');
    const [numeroFactura, setNumeroFactura] = useState('');
    const [idProveedor, setIdProveedor] = useState('');
    const [errorsModal, setErrorsModal] = useState({});
    const [totalSinIva, setTotalSinIva] = useState(0);
    const [totalIva, setTotalIva] = useState(0);
    const [totalConIva, setTotalConIva] = useState(0);
    const token = localStorage.getItem("token");

    // Función para calcular los totales basados en los detalles actuales
    const calcularTotales = useCallback((detalles) => {
        let subtotal = 0;
        let ivaTotal = 0;

        detalles.forEach(detalle => {
            const cantidad = parseFloat(detalle.cantidad) || 0;
            const precioSinIva = parseFloat(detalle.precio_compra_sin_iva) || 0;
            const iva = parseFloat(detalle.iva) || 0;
            
            // Calcular el subtotal y el IVA con precisión
            const detalleSubtotal = Math.round((cantidad * precioSinIva) * 100) / 100;
            const detalleIva = Math.round((cantidad * iva) * 100) / 100;
            
            subtotal += detalleSubtotal;
            ivaTotal += detalleIva;
        });

        // Redondear a 2 decimales para evitar errores de punto flotante
        subtotal = Math.round(subtotal * 100) / 100;
        ivaTotal = Math.round(ivaTotal * 100) / 100;
        const total = Math.round((subtotal + ivaTotal) * 100) / 100;

        return {
            subtotal,
            ivaTotal,
            total
        };
    }, []);

    // Cargar datos iniciales
    useEffect(() => {
        // Cargar proveedores
        axios.get('http://localhost:3000/api/proveedores', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setProveedores(response.data))
        .catch(error => console.error('Error al cargar proveedores:', error));

        // Cargar repuestos
        axios.get('http://localhost:3000/api/repuestos', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setRepuestos(response.data))
        .catch(error => console.error('Error al cargar repuestos:', error));

        // Precargar datos si se está editando una compra
        if (initialData) {
            setIdProveedor(initialData.id_proveedor || '');

            // Formatear la fecha al formato 'yyyy-MM-dd'
            if (initialData.fecha_compra) {
                const fecha = new Date(initialData.fecha_compra);
                const year = fecha.getFullYear();
                const month = String(fecha.getMonth() + 1).padStart(2, '0');
                const day = String(fecha.getDate()).padStart(2, '0');
                setFechaCompra(`${year}-${month}-${day}`);
            } else {
                setFechaCompra('');
            }

            setNumeroFactura(initialData.numero_factura || '');
            setDetallesCompra(initialData.detalles || [{ 
                id_repuesto: '', 
                cantidad: '', 
                precio_compra_sin_iva: '', 
                iva: '0.00', 
                precio_compra_con_iva: '0.00' 
            }]);
        } else {
            setIdProveedor('');
            setFechaCompra('');
            setNumeroFactura('');
            setDetallesCompra([{ 
                id_repuesto: '', 
                cantidad: '', 
                precio_compra_sin_iva: '', 
                iva: '0.00', 
                precio_compra_con_iva: '0.00' 
            }]);
        }
    }, [initialData, token]);

    // Actualizar totales cuando cambian los detalles
    useEffect(() => {
        const { subtotal, ivaTotal, total } = calcularTotales(detallesCompra);
        setTotalSinIva(subtotal);
        setTotalIva(ivaTotal);
        setTotalConIva(total);
    }, [detallesCompra, calcularTotales]);

    // Función auxiliar para verificar repuestos duplicados
    const verificarRepuestosDuplicados = (detalles) => {
        const repuestosSeleccionados = detalles.map(detalle => detalle.id_repuesto);
        return repuestosSeleccionados.some((id, index) => 
            repuestosSeleccionados.indexOf(id) !== index && id !== ''
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'idProveedor') setIdProveedor(value);
        if (name === 'fechaCompra') setFechaCompra(value);
        if (name === 'numeroFactura') setNumeroFactura(value);
    };

    const handleDetalleChange = (index, event) => {
        const { name, value } = event.target;
        const newDetalles = [...detallesCompra];
        const currentDetalle = { ...newDetalles[index] };

        // Validar que los valores numéricos sean positivos
        if (['cantidad', 'precio_compra_sin_iva'].includes(name)) {
            // Solo permitir números y un punto decimal
            if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
                return;
            }
        }

        // Actualizar el valor modificado
        currentDetalle[name] = value;

        // Si se modifica el precio sin IVA, recalcular IVA y precio con IVA
        if (name === 'cantidad') {
            const cantidad = parseFloat(value) || 0;
            const precioSinIva = parseFloat(currentDetalle.precio_compra_sin_iva) || 0;
            const iva = precioSinIva * 0.19; // Calcular IVA basado en el precio sin IVA
            
            currentDetalle.cantidad = cantidad;
            currentDetalle.iva = Math.round(iva * 100) / 100; // Redondear a 2 decimales
            currentDetalle.precio_compra_con_iva = Math.round((precioSinIva + iva) * cantidad * 100) / 100;
        } 
        else if (name === 'precio_compra_sin_iva') {
            const precioSinIva = parseFloat(value) || 0;
            const cantidad = parseFloat(currentDetalle.cantidad) || 1;
            const iva = precioSinIva * 0.19; // 19% de IVA
            
            currentDetalle.precio_compra_sin_iva = precioSinIva;
            currentDetalle.iva = Math.round(iva * 100) / 100; // Redondear a 2 decimales
            currentDetalle.precio_compra_con_iva = Math.round((precioSinIva + iva) * cantidad * 100) / 100;
        }
        else if (name === 'id_repuesto' && value) {
            currentDetalle.id_repuesto = value;
            // Si cambia el repuesto, buscar su información
            const repuestoSeleccionado = repuestos.find(r => r.id_repuesto === value);
            if (repuestoSeleccionado) {
                currentDetalle.codigo_repuesto = repuestoSeleccionado.codigo;
                currentDetalle.descripcion_repuesto = repuestoSeleccionado.descripcion;
            }
        }

        newDetalles[index] = currentDetalle;

        // Validar repuestos duplicados
        if (name === 'id_repuesto') {
            const tieneDuplicados = verificarRepuestosDuplicados(newDetalles);
            if (tieneDuplicados) {
                setErrorsModal(prev => ({
                    ...prev,
                    [`id_repuesto-${index}`]: 'Este repuesto ya está seleccionado en otro detalle'
                }));
                return;
            } else {
                setErrorsModal(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[`id_repuesto-${index}`];
                    return newErrors;
                });
            }
        }

        setDetallesCompra(newDetalles);
    };

    const agregarDetalle = () => {
        setDetallesCompra([...detallesCompra, { 
            id_repuesto: '', 
            cantidad: '', 
            precio_compra_sin_iva: '',
            iva: '0.00',
            precio_compra_con_iva: '0.00' 
        }]);
    };

    const eliminarDetalle = (index) => {
        const newDetalles = [...detallesCompra];
        newDetalles.splice(index, 1);
        setDetallesCompra(newDetalles);

        // Limpiar cualquier error asociado con este detalle
        setErrorsModal(prev => {
            const newErrors = { ...prev };
            delete newErrors[`id_repuesto-${index}`];
            delete newErrors[`cantidad-${index}`];
            delete newErrors[`precio_compra_sin_iva-${index}`];
            return newErrors;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Verificar si hay repuestos duplicados
        const tieneDuplicados = verificarRepuestosDuplicados(detallesCompra);
        if (tieneDuplicados) {
            setErrorsModal(prev => ({
                ...prev,
                detallesCompra: 'No se puede seleccionar el mismo repuesto más de una vez'
            }));
            return;
        }

        // Validar que todos los campos requeridos estén completos
        const detallesValidos = detallesCompra.every((detalle, idx) => {
            const esValido = detalle.id_repuesto && 
                          detalle.cantidad > 0 && 
                          detalle.precio_compra_sin_iva > 0;
            
            if (!esValido) {
                setErrorsModal(prev => ({
                    ...prev,
                    [`detalle-${idx}`]: 'Complete todos los campos del repuesto'
                }));
            }
            return esValido;
        });

        if (!detallesValidos || !idProveedor || !fechaCompra) {
            if (!idProveedor) {
                setErrorsModal(prev => ({ ...prev, idProveedor: 'Seleccione un proveedor' }));
            }
            if (!fechaCompra) {
                setErrorsModal(prev => ({ ...prev, fechaCompra: 'Ingrese una fecha de compra' }));
            }
            return;
        }

        // Recalcular totales antes de enviar para asegurar precisión
        const { subtotal, ivaTotal, total } = calcularTotales(detallesCompra);
        
        // Preparar los datos para enviar
        const compraData = {
            id_proveedor: idProveedor,
            fecha_compra: fechaCompra,
            numero_factura: numeroFactura,
            total_sin_iva: subtotal,
            total_iva: ivaTotal,
            total_compra: total,
            detalles: detallesCompra.map(detalle => ({
                id_repuesto: detalle.id_repuesto,
                cantidad: parseFloat(detalle.cantidad),
                precio_compra_sin_iva: parseFloat(detalle.precio_compra_sin_iva),
                iva: parseFloat(detalle.iva),
                precio_compra_con_iva: parseFloat(detalle.precio_compra_con_iva)
            }))
        };
        onSave(compraData);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.formGroup}>
                <label htmlFor="proveedor" className={styles.label}>Proveedor:</label>
                <select
                    id="proveedor"
                    name="idProveedor"
                    value={idProveedor}
                    onChange={handleInputChange}
                    className={styles.selectField}
                    required
                >
                    <option value="">Seleccione un proveedor</option>
                    {proveedores.map(proveedor => (
                        <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                            {proveedor.nombre} ({proveedor.empresa})
                        </option>
                    ))}
                </select>
                {errorsModal.idProveedor && <span className={styles.error}>{errorsModal.idProveedor}</span>}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="fechaCompra" className={styles.label}>Fecha de Compra:</label>
                <input
                    type="date"
                    id="fechaCompra"
                    name="fechaCompra"
                    value={fechaCompra}
                    onChange={handleInputChange}
                    className={styles.inputField}
                    required
                />
                {errorsModal.fechaCompra && <span className={styles.error}>{errorsModal.fechaCompra}</span>}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="numeroFactura" className={styles.label}>Número de Factura:</label>
                <input
                    type="text"
                    id="numeroFactura"
                    name="numeroFactura"
                    value={numeroFactura}
                    onChange={handleInputChange}
                    className={styles.inputField}
                    placeholder="Opcional"
                />
            </div>

            <h3>Detalles de la Compra</h3>
            {detallesCompra.map((detalle, index) => (
                <div key={index} className={styles.detalleContainer}>
                    <div className={styles.formGroup}>
                        <label htmlFor={`repuesto-${index}`} className={styles.label}>Repuesto:</label>
                        <select
                            id={`repuesto-${index}`}
                            name="id_repuesto"
                            value={detalle.id_repuesto}
                            onChange={(e) => handleDetalleChange(index, e)}
                            className={styles.selectField}
                            required
                        >
                            <option value="">Seleccione un repuesto</option>
                            {repuestos.map(repuesto => (
                                <option key={repuesto.id_repuesto} value={repuesto.id_repuesto}>
                                    {repuesto.nombre}
                                </option>
                            ))}
                        </select>
                        {errorsModal[`id_repuesto-${index}`] && (
                            <span className={styles.error}>{errorsModal[`id_repuesto-${index}`]}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor={`cantidad-${index}`} className={styles.label}>Cantidad:</label>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            id={`cantidad-${index}`}
                            name="cantidad"
                            value={detalle.cantidad}
                            onChange={(e) => handleDetalleChange(index, e)}
                            className={styles.inputField}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor={`precio-${index}`} className={styles.label}>Precio sin IVA:</label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            id={`precio-${index}`}
                            name="precio_compra_sin_iva"
                            value={detalle.precio_compra_sin_iva}
                            onChange={(e) => handleDetalleChange(index, e)}
                            className={styles.inputField}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor={`iva-${index}`} className={styles.label}>IVA (19%):</label>
                        <input
                            type="number"
                            id={`iva-${index}`}
                            name="iva"
                            value={detalle.iva}
                            className={styles.inputField}
                            disabled
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor={`total-${index}`} className={styles.label}>Total con IVA:</label>
                        <input
                            type="number"
                            id={`total-${index}`}
                            name="precio_compra_con_iva"
                            value={detalle.precio_compra_con_iva}
                            className={styles.inputField}
                            disabled
                        />
                    </div>

                    {detallesCompra.length > 1 && (
                        <button 
                            type="button" 
                            onClick={() => eliminarDetalle(index)} 
                            className={styles.deleteButton}
                        >
                            Eliminar
                        </button>
                    )}
                </div>
            ))}

            <div className={styles.buttonGroup}>
                <button 
                    type="button" 
                    onClick={agregarDetalle} 
                    className={styles.submitButton}
                >
                    Agregar Repuesto
                </button>
            </div>

            <div className={styles.totalContainer}>
                <div className={styles.totalRow}>
                    <span>Subtotal (sin IVA):</span>
                    <span>${totalSinIva}</span>
                </div>
                <div className={styles.totalRow}>
                    <span>IVA (19%):</span>
                    <span>${totalIva}</span>
                </div>
                <div className={`${styles.totalRow} ${styles.totalFinal}`}>
                    <strong>Total (con IVA):</strong>
                    <strong>${totalConIva}</strong>
                </div>
            </div>

            <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                    {initialData ? 'Actualizar Compra' : 'Guardar Compra'}
                </button>
                <button 
                    type="button" 
                    onClick={onClose} 
                    className={styles.deleteButton}
                >
                    Cancelar
                </button>
            </div>

            {errorsModal.submit && (
                <div className={styles.errorMessage}>
                    {errorsModal.submit}
                </div>
            )}
        </form>
    );
};

export default CompraForm;