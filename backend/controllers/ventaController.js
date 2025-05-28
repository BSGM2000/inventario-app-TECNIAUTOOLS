import db from "../config/db.js";

// GET /api/ventas
export const getAllVentas = async (req, res) => {
    try {
        const sql = `
        SELECT
            v.id_venta,
            v.fecha_venta,
            v.metodo_pago,
            v.total,
            c.nombre AS cliente,
            GROUP_CONCAT(dv.cantidad, ' x ', r.nombre SEPARATOR '; ') AS detalles
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
                dv.cantidad,
                dv.precio_unitario,
                dv.subtotal,
                r.codigo,
                r.descripcion,
                r.nombre as nombre_repuesto
            FROM detalle_venta dv
            LEFT JOIN repuestos r ON dv.id_repuesto = r.id_repuesto
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
        // Verificar stock de cada repuesto
        const checkStockSql = `
            SELECT id_repuesto, stock_actual 
            FROM repuestos 
            WHERE id_repuesto IN (?)
        `;
        const repuestosIds = detalles.map(detalle => detalle.id_repuesto);
        const [repuestosStock] = await connection.query(checkStockSql, [repuestosIds]);

        // Crear mapa de stock actual para cada repuesto
        const stockMap = new Map();
        repuestosStock.forEach(repuesto => {
            stockMap.set(repuesto.id_repuesto, repuesto.stock_actual);
        });

        // Verificar si hay suficiente stock para cada detalle
        const detallesSinStock = detalles.filter(detalle => {
            const stockActual = stockMap.get(detalle.id_repuesto) || 0;
            return stockActual < detalle.cantidad;
        });

        if (detallesSinStock.length > 0) {
            const repuestosSinStockQuery = `
                SELECT r.id_repuesto, r.nombre, r.stock_actual 
                FROM repuestos r 
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
            totalVenta += subtotal;
            detalle.subtotal = subtotal;
        });

        await connection.beginTransaction();

        // Insertar venta principal
        const ventaSql = `
            INSERT INTO ventas (fecha_venta, id_cliente, total, metodo_pago)
            VALUES (?, ?, ?, ?)
        `;
        const [ventaResult] = await connection.query(ventaSql, [fecha_venta, id_cliente, totalVenta, metodo_pago]);
        const id_venta = ventaResult.insertId;

        // Insertar detalles de la venta
        const detallesVentaSql = `
            INSERT INTO detalle_venta 
            (id_venta, id_repuesto, cantidad, precio_unitario, subtotal)
            VALUES (?, ?, ?, ?, ?)
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
                detalle.cantidad,
                detalle.precio_unitario,
                detalle.subtotal,
            ]);

            // Actualizar stock del repuesto
            await connection.query(
                'UPDATE repuestos SET stock_actual = stock_actual - ? WHERE id_repuesto = ?',
                [detalle.cantidad, detalle.id_repuesto]
            );
        }

        await connection.commit();
        res.status(201).json({ 
            message: 'Venta creada correctamente', 
            id_venta,
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
    const { id_cliente, fecha_venta, metodo_pago, detalles } = req.body;
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Obtener los detalles actuales de la venta
        const [detallesActuales] = await connection.query(
            'SELECT id_repuesto, cantidad FROM detalle_venta WHERE id_venta = ?',
            [id]
        );

        // 2. Devolver las cantidades al stock
        for (const detalle of detallesActuales) {
            await connection.query(
                'UPDATE repuestos SET stock_actual = stock_actual + ? WHERE id_repuesto = ?',
                [detalle.cantidad, detalle.id_repuesto]
            );
        }

        // 3. Eliminar los detalles actuales
        await connection.query('DELETE FROM detalle_venta WHERE id_venta = ?', [id]);
        // En el controlador, antes de actualizar la venta
        for (const detalle of detalles) {
            // Verificar stock disponible
            const [repuesto] = await connection.query(
                'SELECT stock_actual FROM repuestos WHERE id_repuesto = ?',
                [detalle.id_repuesto]
            );

            if (repuesto.length === 0) {
                throw new Error(`El repuesto con ID ${detalle.id_repuesto} no existe`);
            }

            if (repuesto[0].stock_actual < detalle.cantidad) {
                throw new Error(`Stock insuficiente para el repuesto con ID ${detalle.id_repuesto}`);
            }
        }
        // 4. Actualizar la venta principal
        await connection.query(
            'UPDATE ventas SET id_cliente = ?, fecha_venta = ?, metodo_pago = ? WHERE id_venta = ?',
            [id_cliente, fecha_venta, metodo_pago, id]
        );

        // 5. Insertar los nuevos detalles y actualizar el stock
        let totalVenta = 0;
        
        for (const detalle of detalles) {
            // Insertar el detalle
            await connection.query(
                `INSERT INTO detalle_venta 
                (id_venta, id_repuesto, cantidad, precio_unitario, subtotal) 
                VALUES (?, ?, ?, ?, ?)`,
                [
                    id,
                    detalle.id_repuesto,
                    detalle.cantidad,
                    detalle.precio_unitario,
                    detalle.subtotal
                ]
            );

            // Actualizar el stock
            await connection.query(
                'UPDATE repuestos SET stock_actual = stock_actual - ? WHERE id_repuesto = ?',
                [detalle.cantidad, detalle.id_repuesto]
            );

            totalVenta += parseFloat(detalle.subtotal);
        }

        // 6. Actualizar el total de la venta
        await connection.query(
            'UPDATE ventas SET total = ? WHERE id_venta = ?',
            [totalVenta, id]
        );

        await connection.commit();
        res.json({ message: 'Venta actualizada correctamente' });

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
            SELECT id_repuesto, cantidad 
            FROM detalle_venta 
            WHERE id_venta = ?
        `;
        const [detalles] = await connection.query(getDetallesSql, [id]);

        // Restaurar el stock de los repuestos
        const restaurarStockSql = `
            UPDATE repuestos 
            SET stock_actual = stock_actual + ? 
            WHERE id_repuesto = ?
        `;
        for (const detalle of detalles) {
            await connection.query(restaurarStockSql, [detalle.cantidad, detalle.id_repuesto]);
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
        res.json({ message: 'Venta eliminada correctamente' });

    } catch (error) {
        await connection.rollback();
        console.error('Error al eliminar la venta:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};
