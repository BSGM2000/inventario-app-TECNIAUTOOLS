import db from "../config/db.js";

// GET /api/ventas
export const getAllVentas = async (req, res) => {
    try {
        const sql = `
        SELECT
            v.id_venta,
            v.numero_factura,
            v.fecha_venta,
            v.metodo_pago,
            v.total,
            c.nombre AS cliente,
            GROUP_CONCAT(dv.cantidad, ' x ', r.codigo SEPARATOR '; ') AS detalles
        FROM ventas v
        INNER JOIN clientes c ON v.id_cliente = c.id_cliente
        LEFT JOIN detalle_venta dv ON v.id_venta = dv.id_venta
        LEFT JOIN repuestos r ON dv.id_repuesto = r.id_repuesto
        GROUP BY v.id_venta
        ORDER BY v.fecha_venta DESC
        `;
        const [results] = await db.query(sql);
        res.json(results);
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        return res.status(500).json({ error: error.message });
    }
};
//GET /api/ventas/:id
export const getVentaById = async (req, res) => {
    const { id } = req.params;
    let connection;
    
    try {
        // Obtener la venta principal con el nombre del cliente
        const ventaSql = `
            SELECT 
                v.id_venta,
                v.numero_factura,
                v.fecha_venta,
                v.metodo_pago,
                v.total,
                v.id_cliente,
                c.nombre as cliente_nombre,
                c.ciudad
            FROM ventas v
            LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
            WHERE v.id_venta = ?
        `;
        
        connection = await db.getConnection();
        const [venta] = await connection.query(ventaSql, [id]);
        
        if (!venta[0]) {
            if (connection) await connection.release();
            return res.status(404).json({ 
                error: 'Venta no encontrada',
                message: 'No se encontró ninguna venta con el ID especificado'
            });
        }

        // Obtener los detalles de la venta con precio de compra
        const detallesSql = `
            SELECT 
                dv.id_detalle,
                dv.id_repuesto,
                dv.id_ubicacion,
                dv.cantidad,
                dv.precio_unitario,
                dv.precio_unitario_con_iva,
                dv.subtotal,
                dv.total_con_iva,
                dv.porcentaje_utilidad,
                r.codigo,
                r.descripcion,
                s.stock_actual
            FROM detalle_venta dv
            LEFT JOIN repuestos r ON dv.id_repuesto = r.id_repuesto
            LEFT JOIN stock_por_ubicacion s ON s.id_repuesto = dv.id_repuesto AND s.id_ubicacion = dv.id_ubicacion
            WHERE dv.id_venta = ?
        `;
        const [detalles] = await connection.query(detallesSql, [id]);

        // Asegurarse de liberar la conexión
        if (connection) await connection.release();

        res.json({
            ...venta[0],
            detalles
        });

    } catch (error) {
        console.error('Error al obtener venta:', error);
        // Asegurarse de liberar la conexión en caso de error
        if (connection) await connection.release();
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudo obtener la información de la venta'
        });
    }
};
// POST /api/ventas
export const createVenta = async (req, res) => {
    const { id_cliente, fecha_venta, metodo_pago, detalles } = req.body;

    // Validación de campos requeridos
    if (!id_cliente || !fecha_venta || !metodo_pago || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({ 
            message: 'Cliente, fecha, método de pago y al menos un detalle son obligatorios' 
        });
    }

    // Validar que cada detalle tenga los campos necesarios
    const detallesInvalidos = detalles.some(detalle => 
        !detalle.id_repuesto || !detalle.cantidad || !detalle.precio_unitario
    );
    if (detallesInvalidos) {
        return res.status(400).json({ 
            message: 'Cada detalle debe tener id_repuesto, cantidad y precio_unitario' 
        });
    }

    const connection = await db.getConnection();
    try {
        // Obtener el último número de factura
        const [ultimoNumeroResult] = await connection.query(
            'SELECT MAX(CAST(numero_factura AS UNSIGNED)) as ultimoNumero FROM ventas'
        );
        const ultimoNumero = ultimoNumeroResult[0].ultimoNumero || 0;
        const nuevoNumeroFactura = String(parseInt(ultimoNumero) + 1).padStart(6, '0');
        // Verificar stock de cada repuesto por ubicación
        const checkStockSql = `
            SELECT id_repuesto, id_ubicacion, stock_actual 
            FROM stock_por_ubicacion 
            WHERE (id_repuesto, id_ubicacion) IN (?)
        `;
        const repuestosUbicaciones = detalles.map(detalle => [detalle.id_repuesto, detalle.id_ubicacion]);
        const [repuestosStock] = await connection.query(checkStockSql, [repuestosUbicaciones]);

        // Crear mapa de stock actual para cada repuesto por ubicación
        const stockMap = new Map();
        repuestosStock.forEach(repuesto => {
            stockMap.set(`${repuesto.id_repuesto}-${repuesto.id_ubicacion}`, repuesto.stock_actual);
        });

        // Verificar si hay suficiente stock para cada detalle
        const detallesSinStock = detalles.filter(detalle => {
            const stockKey = `${detalle.id_repuesto}-${detalle.id_ubicacion}`;
            const stockActual = stockMap.get(stockKey) || 0;
            return stockActual < detalle.cantidad;
        });

        if (detallesSinStock.length > 0) {
            const repuestosSinStockQuery = `
                SELECT r.id_repuesto, r.codigo, s.stock_actual 
                FROM repuestos r 
                LEFT JOIN stock_por_ubicacion s ON r.id_repuesto = s.id_repuesto AND s.id_ubicacion = ?
                WHERE r.id_repuesto IN (?)
            `;
            const [repuestosSinStockData] = await connection.query(repuestosSinStockQuery, [
                detallesSinStock.map(detalle => detalle.id_repuesto)
            ]);

            const detallesMensaje = repuestosSinStockData
                .filter(repuesto => repuesto) // Filter out any null/undefined
                .map(repuesto => {
                    const detalle = detallesSinStock.find(d => d && d.id_repuesto === repuesto.id_repuesto);
                    if (!detalle) return null;
                    return `Repuesto: ${repuesto.nombre} - Stock disponible: ${repuesto.stock_actual}, Cantidad solicitada: ${detalle.cantidad || 'No especificada'}`;
                })
                .filter(Boolean) // Remove any null entries
                .join('\n');

            return res.status(400).json({ 
                message: 'No se puede completar la venta debido a falta de stock:',
                detalles: detallesMensaje || 'No se pudo obtener información detallada del error de stock'
            });
        }

        // Calcular el total de la venta
        let totalVenta = 0;
        detalles.forEach(detalle => {
            const subtotal = detalle.cantidad * detalle.precio_unitario;
            detalle.subtotal = subtotal;
            totalVenta += parseFloat(detalle.total_con_iva) || 0;
        });

        await connection.beginTransaction();

        // Insertar venta principal
        const ventaSql = `
            INSERT INTO ventas (numero_factura, fecha_venta, id_cliente, total, metodo_pago)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [ventaResult] = await connection.query(ventaSql, [nuevoNumeroFactura, fecha_venta, id_cliente, totalVenta, metodo_pago]);
        const id_venta = ventaResult.insertId;

        // Insertar detalles de la venta    
        const detallesVentaSql = `  
            INSERT INTO detalle_venta 
            (id_venta, id_repuesto, id_ubicacion, cantidad, precio_unitario, precio_unitario_con_iva, subtotal, total_con_iva, porcentaje_utilidad)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        for (const detalle of detalles) {
            // Obtener el precio de compra si no se proporcionó
            let precioCompra = detalle.precio_compra;
            let idDetalleCompra = detalle.id_detalle_compra || null;
            
            if (!precioCompra && idDetalleCompra) {
                const [precioCompraResult] = await connection.query(
                    'SELECT precio_compra_sin_iva FROM detalles_compra WHERE id_detalle_compra = ?',
                    [idDetalleCompra]
                );
                if (precioCompraResult.length > 0) {
                    precioCompra = precioCompraResult[0].precio_compra_sin_iva;
                }
            }

            await connection.query(detallesVentaSql, [
                id_venta,
                detalle.id_repuesto,
                detalle.id_ubicacion,
                detalle.cantidad,
                detalle.precio_unitario,
                detalle.precio_unitario_con_iva,
                detalle.subtotal,
                detalle.total_con_iva,
                detalle.porcentaje_utilidad || 0
            ]);

            // Actualizar stock del repuesto por ubicación
            await connection.query(
                'UPDATE stock_por_ubicacion SET stock_actual = stock_actual - ? WHERE id_repuesto = ? AND id_ubicacion = ?',
                [detalle.cantidad, detalle.id_repuesto, detalle.id_ubicacion]
            );
        }

        await connection.commit();
        res.status(201).json({ 
            message: 'Venta creada correctamente', 
            id_venta,
            numero_factura: nuevoNumeroFactura,
            total: totalVenta
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error al crear la venta:', error);
        res.status(500).json({ 
            error: error.message,
            message: 'Error al crear la venta'
        });
    } finally {
        connection.release();
    }
};


// PUT /api/ventas/:id
export const updateVenta = async (req, res) => {
    const { id } = req.params;
    const { id_cliente, numero_factura, fecha_venta, metodo_pago, detalles } = req.body;
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Obtener los detalles actuales de la venta
        const [detallesActuales] = await connection.query(
            'SELECT id_repuesto, id_ubicacion, cantidad FROM detalle_venta WHERE id_venta = ?',
            [id]
        );

        // 2. Devolver las cantidades al stock por ubicación
        for (const detalle of detallesActuales) {
            await connection.query(
                'UPDATE stock_por_ubicacion SET stock_actual = stock_actual + ? WHERE id_repuesto = ? AND id_ubicacion = ?',
                [detalle.cantidad, detalle.id_repuesto, detalle.id_ubicacion]
            );
        }

        // 3. Eliminar los detalles actuales
        await connection.query('DELETE FROM detalle_venta WHERE id_venta = ?', [id]);
        // En el controlador, antes de actualizar la venta
        for (const detalle of detalles) {
            // Verificar stock disponible por ubicación
            const [repuesto] = await connection.query(
                'SELECT stock_actual FROM stock_por_ubicacion WHERE id_repuesto = ? AND id_ubicacion = ?',
                [detalle.id_repuesto, detalle.id_ubicacion]
            );

            if (repuesto.length === 0) {
                throw new Error(`No hay stock registrado para el repuesto ID ${detalle.id_repuesto} en la ubicación ${detalle.id_ubicacion}`);
            }

            if (repuesto[0].stock_actual < detalle.cantidad) {
                throw new Error(`Stock insuficiente para el repuesto ID ${detalle.id_repuesto} en la ubicación ${detalle.id_ubicacion}`);
            }
        }
        // 4. Actualizar la venta principal
        await connection.query(
            'UPDATE ventas SET id_cliente = ?, numero_factura = ?, fecha_venta = ?, metodo_pago = ? WHERE id_venta = ?',
            [id_cliente, numero_factura, fecha_venta, metodo_pago, id]
        );

        // 5. Insertar los nuevos detalles y actualizar el stock
       let totalVenta = 0;
        
        for (const detalle of detalles) {
            // Insertar el detalle
            await connection.query(
                `INSERT INTO detalle_venta 
                (id_venta, id_repuesto, id_ubicacion, cantidad, precio_unitario, porcentaje_utilidad, precio_unitario_con_iva, subtotal, total_con_iva) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    detalle.id_repuesto,
                    detalle.id_ubicacion,
                    detalle.cantidad,
                    detalle.precio_unitario,
                    detalle.porcentaje_utilidad,
                    detalle.precio_unitario_con_iva,
                    detalle.subtotal,
                    detalle.total_con_iva
                ]
            );

            // Actualizar el stock por ubicación
            await connection.query(
                'UPDATE stock_por_ubicacion SET stock_actual = stock_actual - ? WHERE id_repuesto = ? AND id_ubicacion = ?',
                [detalle.cantidad, detalle.id_repuesto, detalle.id_ubicacion]
            );

            totalVenta += parseFloat(detalle.total_con_iva) || 0;
        }

        // 6. Actualizar el total de la venta
        await connection.query(
            'UPDATE ventas SET total = ? WHERE id_venta = ?',
            [totalVenta, id]
        );

        await connection.commit();
        const [ventaActualizada] = await connection.query(
            'SELECT numero_factura FROM ventas WHERE id_venta = ?',
            [id]
        );
        res.json({ 
            message: 'Venta actualizada correctamente',
            numero_factura: ventaActualizada[0].numero_factura,
            id_venta: id
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error al actualizar venta:', error);
        res.status(500).json({ 
            message: 'Error al actualizar la venta',
            error: error.message 
        });
    } finally {
        if (connection) await connection.release();
    }
};

export const deleteVenta = async (req, res) => {
    const { id } = req.params;
    
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Obtener los detalles de la venta para restaurar el stock
        const getDetallesSql = `
            SELECT id_repuesto, id_ubicacion, cantidad 
            FROM detalle_venta 
            WHERE id_venta = ?
        `;
        const [detalles] = await connection.query(getDetallesSql, [id]);

        // Restaurar el stock de los repuestos por ubicación
        const restaurarStockSql = `
            UPDATE stock_por_ubicacion 
            SET stock_actual = stock_actual + ? 
            WHERE id_repuesto = ? AND id_ubicacion = ?
        `;
        for (const detalle of detalles) {
            await connection.query(restaurarStockSql, [detalle.cantidad, detalle.id_repuesto, detalle.id_ubicacion]);
        }

        // Eliminar los detalles de la venta
        const deleteDetallesSql = `
            DELETE FROM detalle_venta 
            WHERE id_venta = ?
        `;
        await connection.query(deleteDetallesSql, [id]);

        // Eliminar la venta principal
        const deleteVentaSql = `
            DELETE FROM ventas 
            WHERE id_venta = ?
        `;
        await connection.query(deleteVentaSql, [id]);

        await connection.commit();
        res.json({ message: 'Venta eliminada correctamente', id_venta: id });

    } catch (error) {
        await connection.rollback();
        console.error('Error al eliminar la venta:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};
export const obtenerUltimoNumeroFactura = async (req, res) => {
    try {
        // Primero verificamos si hay ventas en la base de datos
        const [countResult] = await db.query('SELECT COUNT(*) as total FROM ventas');
        const totalVentas = countResult[0].total;
        
        let ultimoNumero = 0;
        
        if (totalVentas > 0) {
            // Si hay ventas, obtenemos el máximo número de factura
            const [result] = await db.query(
                'SELECT MAX(CAST(numero_factura AS UNSIGNED)) as ultimoNumero FROM ventas WHERE numero_factura REGEXP \'^[0-9]+$\''
            );
            ultimoNumero = result[0]?.ultimoNumero || 0;
        }
        
        console.log('Total de ventas:', totalVentas, 'Último número de factura:', ultimoNumero);
        
        res.json({ 
            success: true,
            ultimoNumero: ultimoNumero 
        });
    } catch (error) {
        console.error('Error al obtener último número de factura:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al obtener el último número de factura',
            error: error.message 
        });
    }
};
