import React, { useState, useEffect, useCallback } from 'react';
import styles from '../styles/Form.module.css';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
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

const VentaForm = ({ initialData, onSave, onClose }) => {
    const token = localStorage.getItem("token");
    const [clientes, setClientes] = useState([]);
    const [repuestos, setRepuestos] = useState([]);
    const [detallesVenta, setDetallesVenta] = useState([{ 
        id_ubicacion: '',
        id_repuesto: '', 
        cantidad: '', 
        precio_unitario: '', 
        precio_compra: null,
        porcentaje_utilidad: 0.10, // Valor por defecto 10%
        subtotal: 0,
        error: null,
        iva: '0.00',
        precio_unitario_con_iva: '0.00',
        total_con_iva: 0,
        total: 0
    }]);
    const [fechaVenta, setFechaVenta] = useState('');
    const [numeroFactura, setNumeroFactura] = useState(initialData?.numero_factura || '');
    const [metodoPago, setMetodoPago] = useState('');
    const [idCliente, setIdCliente] = useState('');
    const [totalSinIva, setTotalSinIva] = useState(0);
    const [totalIva, setTotalIva] = useState(0);
    const [totalConIva, setTotalConIva] = useState(0);
    const [totalVenta, setTotalVenta] = useState(0);
    const [errorsModal, setErrorsModal] = useState({});
    const [porcentajesUtilidad, setPorcentajesUtilidad] = useState({}); // 0.10 para 10%, 0.20 para 20%, etc.
    const porcentajes = [
        { value: '0.10', label: '10%' },
        { value: '0.20', label: '20%' },
        { value: '0.30', label: '30%' }
    ];
    const [ubicacionesOptions, setUbicacionesOptions] = useState([]);
    const [repuestosOptions, setRepuestosOptions] = useState([]);
    const [clientesOptions, setClientesOptions] = useState([]);
    
    const animatedComponents = makeAnimated();
    
    // Cargar datos iniciales
    useEffect(() => {
        const cargarDatosIniciales = async () => {
            try {
                const [clientesRes, repuestosRes, ubicacionesRes ] = await Promise.all([
                    api.get('/clientes'),
                    api.get('/repuestos'),
                    api.get('/ubicaciones')
                ]);
                
                setClientes(clientesRes.data);
                setRepuestos(repuestosRes.data);
                setUbicacionesOptions(ubicacionesRes.data);

                //Transformar los clientes al formato react-select;
                const clientesOptions = clientesRes.data.map(cliente => {
                    return {    
                        value: cliente.id_cliente,
                        label: `${cliente.nombre} (${cliente.ciudad})`,
                        ciudad: cliente.ciudad
                    }
                });
                setClientesOptions(clientesOptions);

                //Transformar los repuestos al formato react-select;
                const options = repuestosRes.data.map(repuesto => {
                    return {    
                    value: repuesto.id_repuesto,
                    label: `${repuesto.codigo} - (${repuesto.descripcion})`,
                    precio_venta: repuesto.precio_venta,
                    stock: repuesto.stock_actual
                    }
                });
                setRepuestosOptions(options);   
                const ubicacionesOptions = ubicacionesRes.data.map(ubicacion => {
                    return {
                        value: ubicacion.id_ubicacion,
                        label: `${ubicacion.nombre}`
                    }
                });
                setUbicacionesOptions(ubicacionesOptions);

                if (initialData) {
                    try {
                        // Cargar datos básicos de la venta
                        setIdCliente(initialData.id_cliente);
                        setFechaVenta(initialData.fecha_venta.split('T')[0]);
                        setMetodoPago(initialData.metodo_pago || 'efectivo');
                        setNumeroFactura(initialData.numero_factura || '');
        
                        // Cargar detalles de la venta
                        if (initialData.detalles && initialData.detalles.length > 0) {
                            const detallesConPrecios = await Promise.all(
                                initialData.detalles.map(async (detalle) => {
                                    // Obtener el precio de compra si no está incluido
                                    const precioCompra = detalle.precio_compra || 
                                        await obtenerPrecioCompra(detalle.id_repuesto);
        
                                    return {
                                        ...detalle,
                                        id_ubicacion: detalle.id_ubicacion,
                                        id_repuesto: detalle.id_repuesto.toString(),
                                        cantidad: detalle.cantidad.toString(),
                                        precio_compra: parseFloat(precioCompra),
                                        porcentaje_utilidad: detalle.porcentaje_utilidad || 0.10, // Asegurar valor por defecto
                                        precio_unitario: parseFloat(detalle.precio_unitario),
                                        iva: parseFloat(detalle.iva || 0),
                                        precio_unitario_con_iva: parseFloat(detalle.precio_unitario_con_iva),
                                        subtotal: parseFloat(detalle.subtotal),
                                        total_con_iva: parseFloat(detalle.total_con_iva),
                                        error: null
                                    };
                                })
                            );
                            const detallesConIvaCalculado = detallesConPrecios.map(detalle => {
                                if (detalle.precio_unitario && detalle.cantidad) {
                                    const cantidad = parseFloat(detalle.cantidad);
                                    const precioUnitario = parseFloat(detalle.precio_unitario);
                                    const iva = parseFloat(precioUnitario * 0.19);
                                    const subtotal = parseFloat(cantidad * precioUnitario);
                                    const totalIva = parseFloat(cantidad * iva);
                                    
                                    return {
                                        ...detalle,
                                        iva: parseFloat(iva * cantidad).toFixed(2),
                                        subtotal: parseFloat(subtotal.toFixed(2)),
                                        precio_unitario_con_iva: parseFloat(precioUnitario + iva).toFixed(2),
                                        total_con_iva: parseFloat(subtotal + totalIva).toFixed(2)
                                    };
                                }
                                return detalle;
                            });
        
                            setDetallesVenta(detallesConIvaCalculado);
        
                            // Configurar porcentajes de utilidad
                            const nuevosPorcentajes = {};
                            detallesConPrecios.forEach((detalle, index) => {
                                const porcentaje = (detalle.porcentaje_utilidad).toString();
                                nuevosPorcentajes[index] = {
                                    '0.10': porcentaje === '0.10',
                                    '0.20': porcentaje === '0.20',
                                    '0.30': porcentaje === '0.30'
                                };
                            });
                            setPorcentajesUtilidad(nuevosPorcentajes);
                        }
                    } catch (error) {
                        console.error('Error al cargar datos iniciales:', error);
                    }
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
            }
        };
        
        cargarDatosIniciales();
    }, [token, initialData]);
    //Cargar el ultimo numero de factura
    useEffect(() => {
        const cargarUltimoNumeroFactura = async () => {
            console.log('Solicitando último número de factura...');
            console.log('Token a enviar:', token);
            try {
                const response = await api.get('/ventas/ultimo-numero');
                
                console.log('Respuesta del servidor (ultimo-numero):', response.data);
                
                if (response.data && response.data.success) {
                    const ultimoNumero = parseInt(response.data.ultimoNumero) || 0;
                    const nuevoNumero = String(ultimoNumero + 1).padStart(6, '0');
                    console.log('Número de factura generado:', nuevoNumero);
                    setNumeroFactura(nuevoNumero);
                } else {
                    console.warn('La respuesta del servidor no fue exitosa:', response.data);
                    setNumeroFactura('000001');
                }
            } catch (error) {
                console.error('Error en la solicitud:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    config: {
                        url: error.config?.url,
                        method: error.config?.method,
                        headers: error.config?.headers
                    }
                });
                setNumeroFactura('000001');
            }
        };
    
        if (!initialData) { // Solo cargar si es una nueva venta
            console.log('Cargando último número de factura para nueva venta...');
            cargarUltimoNumeroFactura();
        } else if (initialData.numero_factura) {
            console.log('Usando número de factura existente:', initialData.numero_factura);
            setNumeroFactura(initialData.numero_factura);
        } else {
            // Si es una nueva venta pero por alguna razón no se cargó el número, intentar cargarlo
            console.log('Intentando cargar número de factura...');
            cargarUltimoNumeroFactura();
        }
    }, [token, initialData]);
    
    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const date = new Date(fecha);
        return date.toISOString().split('T')[0];
    };

    const obtenerPrecioCompra = async (idRepuesto) => {
        if (!idRepuesto){
            return null;
        }
        try {
            const response = await api.get(`/repuestos/precio-compra/${idRepuesto}`);
            
            return parseFloat(response.data.precio_compra_sin_iva) || 0;
        } catch (error) {
            console.error('Error al obtener precio de compra:', error);
            return 'Error al obtener precio de compra';
        }
    };

    const calcularPrecioVenta = (precioCompra, porcentaje) => {
        if (!precioCompra) return '';
        const utilidad = parseFloat(precioCompra) * parseFloat(porcentaje);
        return (parseFloat(precioCompra) + utilidad).toFixed(2);
      };
    const calcularTotales = useCallback((detalles) => {
        let subtotal = 0;
        let ivaTotal = 0;
        let total = 0;

        detalles.forEach(detalle => {
            subtotal += parseFloat(detalle.subtotal) || 0;
            ivaTotal += parseFloat(detalle.iva) || 0;
            total += parseFloat(detalle.total_con_iva) || 0;
        });

        // Redondear a 2 decimales
        subtotal = Math.round(subtotal * 100) / 100;
        ivaTotal = Math.round(ivaTotal * 100) / 100;
        total = Math.round(total * 100) / 100;

        return {
            subtotal,
            ivaTotal,
            total
        };
    }, []);

    useEffect(() => {
        const { subtotal, ivaTotal, total } = calcularTotales(detallesVenta);
        setTotalSinIva(subtotal);
        setTotalIva(ivaTotal);
        setTotalConIva(total);
        setTotalVenta(total);
    }, [detallesVenta, calcularTotales]);

    const handleRepuestoChange = async (selectedOption, actionMeta) => {
        const { action } = actionMeta;
        console.log('handleRepuestoChange - selectedOption:', selectedOption);
        console.log('handleRepuestoChange - actionMeta:', actionMeta);
        
        // Extraer el índice del name del select
        let index = 0; // Valor por defecto
        if (actionMeta && actionMeta.name) {
            const match = actionMeta.name.match(/repuesto-(\d+)/);
            if (match && match[1]) {
                index = parseInt(match[1], 10);
            }
        }

        // Validar que se haya seleccionado una ubicación
        const ubicacionSeleccionada = detallesVenta[index].id_ubicacion;
        if (!ubicacionSeleccionada && selectedOption) {
            const newDetalles = [...detallesVenta];
            newDetalles[index] = {
                ...newDetalles[index],
                error: 'Debe seleccionar una ubicación antes de elegir un repuesto'
            };
            setDetallesVenta(newDetalles);
            return;
        }
        
        console.log('handleRepuestoChange - index:', index);
       if (actionMeta.action === 'select-option' && selectedOption) {
        try {
            console.log('ID del repuesto seleccionado:', selectedOption.value);
            const newDetalles = [...detallesVenta];
            const porcentajeActual = newDetalles[index]?.porcentaje_utilidad || 0;
            // Obtener el stock disponible para la ubicación específica
            const response = await api.get(`/repuestos/stock-por-ubicacion/${selectedOption.value}/${ubicacionSeleccionada}`);
            const stockDisponible = response.data.stock_actual || 0;
            const cantidadSolicitada = parseFloat(newDetalles[index]?.cantidad) || 0;
            console.log('Stock disponible en ubicación:', stockDisponible);
            console.log('Cantidad solicitada:', cantidadSolicitada);
            
            // Validar stock
            let error = null;
            if (cantidadSolicitada > stockDisponible) {
                error = `Stock insuficiente en la ubicación seleccionada. Disponible: ${stockDisponible}`;
            }
            
            newDetalles[index] = {
                ...newDetalles[index],
                id_repuesto: selectedOption.value,
                error: error, 
                stock_disponible: stockDisponible,
            };
            
            const precioCompra =  await obtenerPrecioCompra(selectedOption.value);
            
            newDetalles[index] = {
                ...newDetalles[index],
                precio_compra: precioCompra,
                subtotal: 0,
                iva: '0.00',
                precio_unitario_con_iva: '0.00',
                total_con_iva: 0
            };
            
            // Si hay un porcentaje de utilidad seleccionado, calcular el precio de venta
            if (porcentajeActual > 0 && precioCompra) {
                const precioVenta = calcularPrecioVenta(precioCompra,porcentajeActual);
                const iva = precioVenta * 0.19;
                const precioUnitarioConIva = parseFloat(precioVenta) + parseFloat(iva);
                const cantidad = parseFloat(newDetalles[index].cantidad) || 0;
                const subtotal = cantidad * parseFloat(precioVenta);
                const totalIva = cantidad * parseFloat(iva);

                newDetalles[index] = {
                    ...newDetalles[index],
                    precio_unitario: precioVenta,
                    iva: iva.toFixed(2),
                    precio_unitario_con_iva: precioUnitarioConIva.toFixed(2),
                    subtotal: subtotal.toFixed(2),
                    total_con_iva: (subtotal + totalIva).toFixed(2)
                };

            } 
            setDetallesVenta(newDetalles);
        } catch (error) {
            console.error('Error al cargar el precio de compra:', error);
            // Manejar el error, quizás mostrar un mensaje al usuario
            const newDetalles = [...detallesVenta];
            newDetalles[index] = {
                ...newDetalles[index],
                error: 'Error al cargar el precio de compra'
            };
            setDetallesVenta(newDetalles);
        }
        } else if (actionMeta.action === 'clear') {
            // Manejar cuando se limpia la selección
            const newDetalles = [...detallesVenta];
            newDetalles[index] = {
                ...newDetalles[index],
                id_repuesto: '',
                precio_compra: null,
                precio_unitario: '',
                iva: '0.00',
                precio_unitario_con_iva: '0.00',
                subtotal: 0,
                total_con_iva: 0,
                error: null
            };
            setDetallesVenta(newDetalles);
        }
    };

    const getSelectedValue = (idRepuesto) => {
        if (!idRepuesto) {
            return null;
        }
        // Asegurarse de comparar strings
        return repuestosOptions.find(option => 
            option.value.toString() === idRepuesto.toString()
        ) || null;
    };
    const getSelectedValueCliente = (idCliente) => {
        if (!idCliente) {
            return null;
        }
        // Asegurarse de comparar strings
        return clientesOptions.find(option => 
            option.value.toString() === idCliente.toString()
        ) || null;
    };
    const getSelectedValueUbicacion = (idUbicacion) => {
        if (!idUbicacion) {
            return null;
        }
        // Asegurarse de comparar strings
        return ubicacionesOptions.find(option =>
            option.value.toString() === idUbicacion.toString()
        ) || null;
    }
    const handleIdClienteChange = (selectedOption) => {
        setIdCliente(selectedOption ? selectedOption.value : '');
    };
    const handleUbicacionChange = (selectedOption, index) => {
        const newDetalles = [...detallesVenta];
        newDetalles[index] = {
            ...newDetalles[index],
            id_ubicacion: selectedOption ? selectedOption.value : ''
        };
        setDetallesVenta(newDetalles);
    }
    const handleCantidadChange = (index, event) => {
        const newDetalles = [...detallesVenta];
        const cantidad = parseFloat(event.target.value) || 0;
        const detalle = newDetalles[index];

        // Validar stock
        let error = null;
        if (detalle.stock_disponible !== undefined && cantidad > detalle.stock_disponible) {
            error = `Stock insuficiente. Disponible: ${detalle.stock_disponible}`;
        }

        newDetalles[index] = {
            ...newDetalles[index],
            cantidad: cantidad,
            error: error
        };
        
        if (detalle.precio_unitario) {
            const precioUnitario = parseFloat(detalle.precio_unitario);
            const iva = precioUnitario * 0.19;
            const subtotal = cantidad * precioUnitario;
            const totalIva = cantidad * iva;
            
            newDetalles[index].subtotal = subtotal.toFixed(2);
            newDetalles[index].iva = (iva * cantidad).toFixed(2);
            newDetalles[index].total_con_iva = (subtotal + totalIva).toFixed(2);
        }
        setDetallesVenta(newDetalles);
    };
    const handlePorcentajeUtilidadChange = (index, value) => {
        // Update the checkboxes state
        setPorcentajesUtilidad(prev => {
            const newPorcentajes = { ...prev };
            newPorcentajes[index] = {
                '0.10': value === '0.10',
                '0.20': value === '0.20',
                '0.30': value === '0.30'
            };
            return newPorcentajes;
        });
    
    
        const newDetalles = [...detallesVenta];
        const detalleActual = newDetalles[index];
        const porcentaje = parseFloat(value);
        
        if (detalleActual.precio_compra) {
            const precioVenta = calcularPrecioVenta(detalleActual.precio_compra, porcentaje);
            const iva = precioVenta * 0.19;
            const precioUnitarioConIva = parseFloat(precioVenta) + parseFloat(iva);
            const cantidad = parseFloat(detalleActual.cantidad) || 0;
            const subtotal = cantidad * parseFloat(precioVenta);
            const totalIva = cantidad * parseFloat(iva);
    
            newDetalles[index] = {
                ...detalleActual,
                porcentaje_utilidad: porcentaje,
                precio_unitario: precioVenta,
                iva: iva.toFixed(2),
                precio_unitario_con_iva: precioUnitarioConIva.toFixed(2),
                subtotal: subtotal.toFixed(2),
                total_con_iva: (subtotal + totalIva).toFixed(2)
            };
    
            setDetallesVenta(newDetalles);
            calcularTotales(newDetalles);
        }
    };
    const agregarDetalle = () => {
        setDetallesVenta([
            ...detallesVenta, 
            {
                id_ubicacion: '',
                id_repuesto: '', 
                cantidad: '', 
                precio_unitario: '', 
                subtotal: 0,
                precio_compra: null,
                porcentaje_utilidad: 0.10,
                precio_unitario_con_iva: 0,
                iva: 0,
                error: null,
                total_con_iva: 0,
                stock_disponible: 0
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

        // Validar que cada detalle tenga una ubicación seleccionada
        detallesVenta.forEach((detalle, index) => {
            if (!detalle.id_ubicacion) {
                nuevosErrores[`ubicacion-${index}`] = 'La ubicación es obligatoria.';
                esValido = false;
            }
        });

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
    const validarStockAntesDeGuardar = async () => {
        const errores = {};
        let tieneErrores = false;

        for (let index = 0; index < detallesVenta.length; index++) {
            const detalle = detallesVenta[index];
            if (detalle.id_repuesto && detalle.id_ubicacion) {
                try {
                    // Obtener el stock disponible para la ubicación específica
                    const response = await api.get(`/repuestos/stock-por-ubicacion/${detalle.id_repuesto}/${detalle.id_ubicacion}`);
                    const stockDisponible = parseFloat(response.data.stock_actual) || 0;
                    
                    const cantidad = parseFloat(detalle.cantidad) || 0;
                    if (cantidad > stockDisponible) {
                        const repuesto = repuestos.find(r => r.id_repuesto === detalle.id_repuesto);
                        errores[`stock-${index}`] = `Stock insuficiente para ${repuesto?.nombre || 'el repuesto'} en la ubicación seleccionada. Disponible: ${stockDisponible}`;
                        tieneErrores = true;
                    }
                } catch (error) {
                    console.error('Error al verificar stock por ubicación:', error);
                    errores[`stock-${index}`] = 'Error al verificar el stock disponible';
                    tieneErrores = true;
                }
            }
        }

        setErrorsModal(prev => ({
            ...prev,
            ...errores
        }));

        return !tieneErrores;
    };
    // Agrega esta función dentro del componente VentaForm, antes del return
    const generarPDF = (ventaData) => {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString('es-CO');
    const fechaFormateada = fecha.split('/').reverse().join('');
    const hora = new Date().toLocaleTimeString();
    const numFactura = ventaData?.numero_factura || 'S/N';
    
    // Título
    doc.setFontSize(18);
    doc.text('ORDEN DE COMPRA', 105, 15, { align: 'center' });
    
    // Información de la empresa
    doc.setFontSize(10);
    doc.text(`Fecha: ${fecha} ${hora}`, 14, 40);
    doc.text(`No. Orden: ${numFactura}`, 14, 45);

    
    // Información del cliente
    const cliente = clientes.find(c => c.id_cliente === idCliente) || {};
    doc.text('Cliente:', 14, 55);
    doc.text(`Nombre: ${cliente.nombre || 'Cliente no especificado'}`, 20, 60);
    doc.text(`Documento: ${cliente.documento_cliente || 'N/A'}`, 20, 65);
    doc.text(`Ciudad: ${cliente.ciudad || 'N/A'}`, 20, 70);
    doc.text(`Dirección: ${cliente.direccion || 'N/A'}`, 20, 75);
    doc.text(`Teléfono: ${cliente.telefono || 'N/A'}`, 20, 80);
    
    // Tabla de productos
    const headers = [['Código', 'Descripción', 'Cant.', 'V. Unitario', 'V. Unitario con IVA', 'Subtotal', 'Total con IVA']];
    const data = detallesVenta.map(detalle => {
      const repuesto = repuestos.find(r => r.id_repuesto === detalle.id_repuesto) || {};
      return [
        detalle.codigo = repuesto.codigo || '',
        detalle.descripcion = repuesto.descripcion || '',
        detalle.cantidad,
        `$${parseFloat(detalle.precio_unitario).toFixed(2)}`,
        `$${detalle.precio_unitario_con_iva}`,
        `$${detalle.subtotal}`,
        `$${detalle.total_con_iva}`
      ];
    });
    
    // Agregar tabla
    autoTable(doc, {
      head: headers,
      body: data,
      startY: 90,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Totales
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: $${formatNumber(totalSinIva.toFixed(2))}`, 160, finalY);
    doc.text(`IVA (19%): $${formatNumber(totalIva.toFixed(2))}`, 160, finalY + 5);
    doc.text(`Total: $${formatNumber(totalVenta.toFixed(2))}`, 160, finalY + 10);
    
    // Método de pago
    doc.text(`Método de pago: ${metodoPago}`, 14, finalY + 20);
    
    // Pie de página
    doc.setFontSize(8);
    doc.text('¡Gracias por su compra!', 105, 280, { align: 'center' });
    doc.text('TECNIAUTOOLS - Soluciones automotrices', 105, 285, { align: 'center' });
    
    // Guardar el PDF
    const nombreArchivo = `FACT_${numFactura}_${fechaFormateada}.pdf`;
    doc.save(nombreArchivo);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validarFormulario()) return;
        const stockValido = await validarStockAntesDeGuardar();
        if (!stockValido) return;

        const ventaData = {
            id_cliente: parseInt(idCliente),
            numero_factura: numeroFactura,
            fecha_venta: fechaVenta,
            metodo_pago: metodoPago,
            detalles: detallesVenta.map(detalle => ({
                id_ubicacion: parseInt(detalle.id_ubicacion),
                id_repuesto: parseInt(detalle.id_repuesto),
                cantidad: parseInt(detalle.cantidad),
                precio_unitario: parseFloat(detalle.precio_unitario),
                porcentaje_utilidad: detalle.porcentaje_utilidad,
                precio_unitario_con_iva: parseFloat(detalle.precio_unitario_con_iva),
                subtotal: parseFloat(detalle.subtotal),
                iva: parseFloat(detalle.iva),
                total_con_iva: parseFloat(detalle.total_con_iva),
                
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
                <Select
                    id="idCliente"
                    name="idCliente"
                    value={getSelectedValueCliente(idCliente)}
                    onChange={handleIdClienteChange}
                    options={clientesOptions}
                    placeholder="Buscar cliente..."
                    noOptionsMessage={() => "No se encontraron clientes"}
                    isSearchable
                    className="basic-single"
                    classNamePrefix="select"
                    loadingMessage={() => "Buscando..."}
                    isLoading={clientesOptions.length === 0}
                    filterOption={(option, inputValue) => 
                        option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
                        option.ciudad?.toLowerCase().includes(inputValue.toLowerCase())
                    }
                    isClearable
                    required
                />
                {errorsModal.idCliente && (
                    <p className={styles.errorModal}>{errorsModal.idCliente}</p>
                )}
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Número de Factura</label>
                <input
                    type="text"
                    value={numeroFactura}
                    readOnly
                    className={styles.inputField}
                    placeholder="Se asignará automáticamente"
                    
                />
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
                    <option value="Efectivo">Efectivo</option>
                    <option value="Crédito">Crédito</option>
                    <option value="Transferencia">Transferencia</option>
                </select>
                {errorsModal.metodoPago && (
                    <p className={styles.errorModal}>{errorsModal.metodoPago}</p>
                )}
            </div>

            <h3>Detalles de la Venta:</h3>
            {detallesVenta.map((detalle, index) => (
                <div key={index} className={styles.detalleContainer}>
                    <div className={styles.formGroup}>
                        <label htmlFor={`idUbicacion-${index}`} className={styles.label}>
                            Ubicacion:
                        </label>
                            <Select
                                id={`idUbicacion-${index}`}
                                name={`idUbicacion-${index}`}
                                components={animatedComponents}
                                value={getSelectedValueUbicacion(detalle.id_ubicacion)}
                                onChange={(selectedOption) => handleUbicacionChange(selectedOption, index)}
                                options={ubicacionesOptions}
                                placeholder="Buscar ubicacion..."
                                noOptionsMessage={() => "No se encontraron ubicaciones"}
                                isSearchable
                                className="basic-multi-select"
                                classNamePrefix="select"
                                loadingMessage={() => "Buscando..."}
                                isLoading={ubicacionesOptions.length === 0}
                                filterOption={(option, inputValue) =>
                                    option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
                                    option.codigo?.toLowerCase().includes(inputValue.toLowerCase())
                                }
                                isClearable
                                required
                            />
                        {errorsModal[`ubicacion-${index}`] && (
                            <p className={styles.errorModal}>{errorsModal[`ubicacion-${index}`]}</p>
                        )}
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor={`repuesto-${index}`} className={styles.label}>
                            Repuesto:
                        </label>
                        <Select
                            id={`idRepuesto-${index}`}
                            name={`repuesto-${index}`}
                            components={animatedComponents}
                            value={getSelectedValue(detalle.id_repuesto)}
                            onChange={(selectedOption, actionMeta) => handleRepuestoChange(selectedOption, actionMeta)}
                            options={repuestosOptions}
                            placeholder="Buscar repuesto..."
                            noOptionsMessage={() => "No se encontraron coincidencias"}
                            isSearchable
                            className="basic-multi-select"
                            classNamePrefix="select"
                            loadingMessage={() => "Buscando..."}
                            isLoading={repuestosOptions.length === 0}
                            filterOption={(option, inputValue) => 
                                option.label.toLowerCase().includes(inputValue.toLowerCase())
                            }
                            isClearable
                            required
                        />

                        {detalle.precio_compra !== null && (
                            <p className={styles.precioCompra}>
                                Precio de compra (sin IVA): ${parseFloat(detalle.precio_compra).toFixed(2)}
                            </p>
                        )}
                        {errorsModal[`repuesto-${index}`] && (
                            <p className={styles.errorModal}>{errorsModal[`repuesto-${index}`]}</p>
                        )}
                    </div>
                    <div className={styles.checkboxGroup}>
                        <label htmlFor="porcentajeUtilidad" className={styles.checkboxLabel}>
                            Porcentaje de Utilidad:
                        </label>
                        {['0.10', '0.20', '0.30'].map(porcentaje => (
                            <label key={porcentaje}>
                                <input
                                    type="checkbox"
                                    name="porcentajeUtilidad"
                                    value={porcentaje}
                                    checked={porcentajesUtilidad[index]?.[porcentaje] || false}
                                    onChange={() => handlePorcentajeUtilidadChange(index, porcentaje)}
                                    className={styles.checkboxInput}
                                />
                                {`${parseFloat(porcentaje) * 100}%`}
                            </label>
                        ))}
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
                            type="text"
                            step="0.01"
                            id={`precioUnitario-${index}`}
                            name="precio_unitario"
                            value={formatNumber(detalle.precio_unitario)}
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
                            value={formatNumber(detalle.subtotal)}
                            className={styles.inputField}
                            readOnly
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor={`iva-${index}`} className={styles.label}>IVA (19%):</label>
                        <input
                            type="text"
                            id={`iva-${index}`}
                            name="iva"
                            value={formatNumber(detalle.iva)}
                            className={styles.inputField}
                            disabled
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor={`total-${index}`} className={styles.label}>Precio Unitario con IVA:</label>
                        <input
                            type="text"
                            id={`total-${index}`}
                            name="precio_unitario_con_iva"
                            value={formatNumber(detalle.precio_unitario_con_iva)}
                            className={styles.inputField}
                            disabled
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor={`total-${index}`} className={styles.label}>Total con IVA:</label>
                        <input
                            type="text"
                            id={`total-${index}`}
                            name="total_con_iva"
                            value={formatNumber(detalle.total_con_iva)}
                            className={styles.inputField}
                            disabled
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
                <div className={styles.totalRow}>
                    <span>Subtotal (sin IVA):</span>
                    <span>{formatNumber(totalSinIva)}</span>
                </div>
                <div className={styles.totalRow}>
                    <span>IVA (19%):</span>
                    <span>{formatNumber(totalIva)}</span>
                </div>
                <div className={`${styles.totalRow} ${styles.totalFinal}`}>
                    <strong>Total (con IVA):</strong>
                    <strong>{formatNumber(totalConIva)}</strong>
                </div>
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