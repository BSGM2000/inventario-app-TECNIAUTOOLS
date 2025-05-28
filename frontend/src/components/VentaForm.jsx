import React, { useState, useEffect, useCallback } from 'react';
import styles from '../styles/Form.module.css';
import axios from 'axios';

const VentaForm = ({ initialData, onSave, onClose }) => {
    const token = localStorage.getItem("token");
    const [clientes, setClientes] = useState([]);
    const [repuestos, setRepuestos] = useState([]);
    const [detallesVenta, setDetallesVenta] = useState([{ 
        id_repuesto: '', 
        cantidad: '', 
        precio_unitario: '', 
        subtotal: 0,
        precio_compra: null,
        porcentaje_utilidad: 0,
        error: null
    }]);
    const [fechaVenta, setFechaVenta] = useState('');
    const [metodoPago, setMetodoPago] = useState('');
    const [idCliente, setIdCliente] = useState('');
    const [totalVenta, setTotalVenta] = useState(0);
    const [errorsModal, setErrorsModal] = useState({});
    const [porcentajeUtilidad, setPorcentajeUtilidad] = useState(0); // 0.10 para 10%, 0.20 para 20%, etc.

    // Cargar datos iniciales
    useEffect(() => {
        const cargarDatosIniciales = async () => {
            try {
                const [clientesRes, repuestosRes] = await Promise.all([
                    axios.get('http://localhost:3000/api/clientes', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:3000/api/repuestos', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
                
                setClientes(clientesRes.data);
                setRepuestos(repuestosRes.data);

                if (initialData) {
                    // Cargar datos de edición
                    setIdCliente(initialData.id_cliente || '');
                    setFechaVenta(formatearFecha(initialData.fecha_venta));
                    setMetodoPago(initialData.metodo_pago || '');
                    
                    const detallesConPrecio = await Promise.all(
                        initialData.detalles.map(async detalle => {
                            const precioCompra = await obtenerPrecioCompra(detalle.id_repuesto);
                            return {
                                ...detalle,
                                precio_compra: precioCompra,
                                error: null
                            };
                        })
                    );
                    
                    setDetallesVenta(detallesConPrecio);
                    setTotalVenta(initialData.total || 0);
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
            }
        };

        cargarDatosIniciales();
    }, [token, initialData]);

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const date = new Date(fecha);
        return date.toISOString().split('T')[0];
    };

    const obtenerPrecioCompra = async (idRepuesto) => {
        if (!idRepuesto) return null;
        try {
            const response = await axios.get(
                `http://localhost:3000/api/repuestos/precio-compra/${idRepuesto}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data.precio_compra_sin_iva;
        } catch (error) {
            console.error('Error al obtener precio de compra:', error);
            return null;
        }
    };

    const actualizarSubtotal = useCallback((detalles) => {
        return detalles.map(detalle => {
            const cantidad = parseFloat(detalle.cantidad) || 0;
            const precio = parseFloat(detalle.precio_unitario) || 0;
            return {
                ...detalle,
                subtotal: cantidad * precio
            };
        });
    }, []);

    const validarPrecioVenta = useCallback((detalle) => {
        if (!detalle.precio_compra || !detalle.precio_unitario) {
            return { ...detalle, error: null };
        }
        
        const precioVenta = parseFloat(detalle.precio_unitario);
        const precioCompra = parseFloat(detalle.precio_compra);
        
        return {
            ...detalle,
            error: precioVenta <= precioCompra 
                ? 'El precio de venta debe ser mayor que el precio de compra sin IVA.' 
                : null
        };
    }, []);

    const calcularPrecioVenta = (precioCompra, porcentaje) => {
        if (!precioCompra) return '';
        const utilidad = parseFloat(precioCompra) * parseFloat(porcentaje);
        return (parseFloat(precioCompra) + utilidad).toFixed(2);
      };
    
    const handleRepuestoChange = async (index, event) => {
        const idRepuesto = event.target.value;
        const newDetalles = [...detallesVenta];
        const precioCompra = idRepuesto ? await obtenerPrecioCompra(idRepuesto) : null;
        const porcentajeActual = newDetalles[index].porcentaje_utilidad || 0;
    
        
        newDetalles[index] = {
            ...newDetalles[index],
            id_repuesto: idRepuesto,
            precio_compra: precioCompra,
            error: null
        };
        
        // Si hay un porcentaje de utilidad seleccionado, calcular el precio de venta
        if (porcentajeActual > 0 && precioCompra) {
            newDetalles[index].precio_unitario = calcularPrecioVenta(precioCompra, porcentajeActual);
            // Recalcular subtotal
            const cantidad = parseFloat(newDetalles[index].cantidad) || 0;
            newDetalles[index].subtotal = cantidad * parseFloat(newDetalles[index].precio_unitario);
        }
        
        setDetallesVenta(newDetalles);
    };

    const handleCantidadChange = (index, event) => {
        const newDetalles = [...detallesVenta];
        newDetalles[index] = {
            ...newDetalles[index],
            cantidad: event.target.value
        };
        
        // Actualizar subtotales
        const detallesActualizados = actualizarSubtotal(newDetalles);
        setDetallesVenta(detallesActualizados);
        
        // Actualizar total
        const nuevoTotal = detallesActualizados.reduce((sum, detalle) => sum + (parseFloat(detalle.subtotal) || 0), 0);
        setTotalVenta(nuevoTotal);
    };
    const handlePorcentajeUtilidadChange = (index, e) => {
        const nuevoPorcentaje = parseFloat(e.target.value);
        const newDetalles = [...detallesVenta];
        
        newDetalles[index] = {
            ...newDetalles[index],
            porcentaje_utilidad: nuevoPorcentaje
        };
    
        // Si hay un precio de compra, recalcular el precio de venta
        if (newDetalles[index].precio_compra && nuevoPorcentaje > 0) {
            const nuevoPrecio = calcularPrecioVenta(newDetalles[index].precio_compra, nuevoPorcentaje);
            newDetalles[index].precio_unitario = nuevoPrecio;
            
            // Recalcular subtotal
            const cantidad = parseFloat(newDetalles[index].cantidad) || 0;
            newDetalles[index].subtotal = cantidad * parseFloat(nuevoPrecio);
        }
        
        setDetallesVenta(newDetalles);
    };
    const agregarDetalle = () => {
        setDetallesVenta([
            ...detallesVenta, 
            { 
                id_repuesto: '', 
                cantidad: '', 
                precio_unitario: '', 
                subtotal: 0,
                precio_compra: null,
                porcentaje_utilidad: 0,
                error: null
            }
        ]);
    };

    const eliminarDetalle = (index) => {
        const newDetalles = detallesVenta.filter((_, i) => i !== index);
        setDetallesVenta(newDetalles);
        
        // Actualizar total
        const nuevoTotal = newDetalles.reduce((sum, detalle) => sum + (parseFloat(detalle.subtotal) || 0), 0);
        setTotalVenta(nuevoTotal);
    };

    const validarFormulario = () => {
        const nuevosErrores = {};
        let esValido = true;

        if (!idCliente) {
            nuevosErrores.idCliente = 'El cliente es obligatorio.';
            esValido = false;
        }

        if (!fechaVenta) {
            nuevosErrores.fechaVenta = 'La fecha de venta es obligatoria.';
            esValido = false;
        }

        if (!metodoPago) {
            nuevosErrores.metodoPago = 'El método de pago es obligatorio.';
            esValido = false;
        }

        // Validar detalles
        const tieneErrores = detallesVenta.some((detalle, index) => {
            if (!detalle.id_repuesto) {
                nuevosErrores[`repuesto-${index}`] = 'El repuesto es obligatorio.';
                return true;
            }
            if (!detalle.cantidad || parseFloat(detalle.cantidad) <= 0) {
                nuevosErrores[`cantidad-${index}`] = 'La cantidad debe ser mayor a 0.';
                return true;
            }
            if (!detalle.precio_unitario || parseFloat(detalle.precio_unitario) <= 0) {
                nuevosErrores[`precio-${index}`] = 'El precio unitario debe ser mayor a 0.';
                return true;
            }
            if (detalle.error) {
                nuevosErrores[`precio-${index}`] = detalle.error;
                return true;
            }
            return false;
        });

        setErrorsModal(nuevosErrores);
        return esValido && !tieneErrores;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validarFormulario()) return;

        const ventaData = {
            id_cliente: parseInt(idCliente),
            fecha_venta: fechaVenta,
            metodo_pago: metodoPago,
            detalles: detallesVenta.map(detalle => ({
                id_repuesto: parseInt(detalle.id_repuesto),
                cantidad: parseInt(detalle.cantidad),
                precio_unitario: parseFloat(detalle.precio_unitario),
                subtotal: parseFloat(detalle.subtotal)
            })),
            total: totalVenta
        };

        onSave(ventaData);
    };

    // Renderizado del formulario
    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <h2 className={styles.formTitle}>
                {initialData ? 'Editar Venta' : 'Crear Nueva Venta'}
            </h2>

            {/* Campos del formulario */}
            <div className={styles.formGroup}>
                <label htmlFor="idCliente" className={styles.label}>Cliente:</label>
                <select
                    id="idCliente"
                    name="idCliente"
                    value={idCliente}
                    onChange={(e) => setIdCliente(e.target.value)}
                    className={styles.selectField}
                    required
                >
                    <option value="">Seleccione un Cliente</option>
                    {clientes.map(cliente => (
                        <option key={cliente.id_cliente} value={cliente.id_cliente}>
                            {cliente.nombre} {cliente.apellido} ({cliente.ciudad})
                        </option>
                    ))}
                </select>
                {errorsModal.idCliente && (
                    <p className={styles.errorModal}>{errorsModal.idCliente}</p>
                )}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="fechaVenta" className={styles.label}>Fecha de Venta:</label>
                <input
                    type="date"
                    id="fechaVenta"
                    name="fechaVenta"
                    value={fechaVenta}
                    onChange={(e) => setFechaVenta(e.target.value)}
                    className={styles.inputField}
                    required
                />
                {errorsModal.fechaVenta && (
                    <p className={styles.errorModal}>{errorsModal.fechaVenta}</p>
                )}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="metodoPago" className={styles.label}>Método de Pago:</label>
                <select
                    id="metodoPago"
                    name="metodoPago"
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className={styles.selectField}
                    required
                >
                    <option value="">Seleccione un Método de Pago</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="crédito">Crédito</option>
                    <option value="transferencia">Transferencia</option>
                </select>
                {errorsModal.metodoPago && (
                    <p className={styles.errorModal}>{errorsModal.metodoPago}</p>
                )}
            </div>

            <h3>Detalles de la Venta:</h3>
            {detallesVenta.map((detalle, index) => (
                <div key={index} className={styles.detalleContainer}>
                    <div className={styles.formGroup}>
                        <label htmlFor={`idRepuesto-${index}`} className={styles.label}>
                            Repuesto:
                        </label>
                        <select
                            id={`idRepuesto-${index}`}
                            name="id_repuesto"
                            value={detalle.id_repuesto}
                            onChange={(e) => handleRepuestoChange(index, e)}
                            className={styles.selectField}
                            required
                        >
                            <option value="">Seleccione un repuesto</option>
                            {repuestos.map(repuesto => (
                                <option key={repuesto.id_repuesto} value={repuesto.id_repuesto}>
                                    {repuesto.nombre} ({repuesto.codigo})
                                </option>
                            ))}
                        </select>
                        {detalle.precio_compra !== null && (
                            <p className={styles.precioCompra}>
                                Precio de compra (sin IVA): ${parseFloat(detalle.precio_compra).toFixed(2)}
                            </p>
                        )}
                        {errorsModal[`repuesto-${index}`] && (
                            <p className={styles.errorModal}>{errorsModal[`repuesto-${index}`]}</p>
                        )}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="porcentajeUtilidad" className={styles.label}>
                            Porcentaje de Utilidad:
                        </label>
                        <select
                            id="porcentajeUtilidad"
                            value={porcentajeUtilidad}
                            onChange={(e) => handlePorcentajeUtilidadChange(index, e)}
                            className={styles.selectField}
                        >
                            <option value="0">Seleccione un porcentaje</option>
                            <option value="0.10">10%</option>
                            <option value="0.20">20%</option>
                            <option value="0.30">30%</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor={`cantidad-${index}`} className={styles.label}>
                            Cantidad:
                        </label>
                        <input
                            type="number"
                            min="1"
                            id={`cantidad-${index}`}
                            name="cantidad"
                            value={detalle.cantidad}
                            onChange={(e) => handleCantidadChange(index, e)}
                            className={styles.inputField}
                            required
                        />
                        {errorsModal[`cantidad-${index}`] && (
                            <p className={styles.errorModal}>{errorsModal[`cantidad-${index}`]}</p>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor={`precioUnitario-${index}`} className={styles.label}>
                            Precio Unitario:
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            id={`precioUnitario-${index}`}
                            name="precio_unitario"
                            value={detalle.precio_unitario}
                            readOnly
                            className={styles.inputField}
                        />
                        {detalle.error && (
                            <p className={styles.errorPrecio}>{detalle.error}</p>
                        )}
                        {errorsModal[`precio-${index}`] && !detalle.error && (
                            <p className={styles.errorPrecio}>{errorsModal[`precio-${index}`]}</p>
                        )}
                        {detalle.precio_compra && (
                            <p className={styles.precioInfo}>
                                Precio compra: ${parseFloat(detalle.precio_compra).toFixed(2)}
                            </p>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor={`subtotal-${index}`} className={styles.label}>
                            Subtotal:
                        </label>
                        <input
                            type="text"
                            id={`subtotal-${index}`}
                            value={`$${parseFloat(detalle.subtotal || 0).toFixed(2)}`}
                            className={styles.inputField}
                            readOnly
                        />
                    </div>

                    {detallesVenta.length > 1 && (
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
                <strong>Total de la Venta:</strong> ${totalVenta.toFixed(2)}
            </div>

            <div className={styles.buttonGroup}>
                <button type="submit" className={styles.submitButton}>
                    {initialData ? 'Actualizar Venta' : 'Crear Venta'}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className={styles.deleteButton}
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
};

export default VentaForm;