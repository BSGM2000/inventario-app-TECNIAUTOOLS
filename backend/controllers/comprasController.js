    // controllers/comprasController.js
import db from '../config/db.js';

// GET /api/compras
export const getAllCompras = async (req, res) => {
    try {
        const sql = `
        SELECT
            c.id_compra,
            c.fecha_compra,
            c.numero_factura,
            c.total_compra,
            p.empresa AS proveedor,
            GROUP_CONCAT(dc.cantidad, ' x ', r.nombre SEPARATOR '; ') AS detalles
        FROM compras c
        INNER JOIN proveedores p ON c.id_proveedor = p.id_proveedor
        LEFT JOIN detalles_compra dc ON c.id_compra = dc.id_compra
        LEFT JOIN repuestos r ON dc.id_repuesto = r.id_repuesto
        GROUP BY c.id_compra
        ORDER BY c.fecha_compra DESC
        `;
        const [results] = await db.query(sql);
        res.json(results);
    } catch (error) {
        console.error('Error al obtener compras:', error);
        return res.status(500).json({ error: error.message });
    }
};

// GET /api/compras/:id
export const getCompraById = async (req, res) => {
    const { id } = req.params;
    try {
        const compraSql = `
        SELECT
            c.id_compra,
            c.fecha_compra,
            c.numero_factura,
            c.total_compra,
            c.id_proveedor,
            p.empresa AS proveedor
        FROM compras c
        INNER JOIN proveedores p ON c.id_proveedor = p.id_proveedor
        WHERE c.id_compra = ?
        `;
        const [compra] = await db.query(compraSql, [id]);

        if (compra.length === 0) {
            return res.status(404).json({ message: 'Compra no encontrada' });
        }

        const detallesSql = `
        SELECT
            dc.cantidad,
            dc.precio_compra_sin_iva,
            dc.iva,
            dc.precio_compra_con_iva,
            r.id_repuesto,
            r.nombre
        FROM detalles_compra dc
        INNER JOIN repuestos r ON dc.id_repuesto = r.id_repuesto
        WHERE dc.id_compra = ?
        `;
        const [detalles] = await db.query(detallesSql, [id]);

        res.json({ ...compra[0], detalles });
    } catch (error) {
        console.error('Error al obtener compra:', error);
        return res.status(500).json({ error: error.message });
    }
};

// POST /api/compras
export const createCompra = async (req, res) => {
    const { id_proveedor, fecha_compra, numero_factura, detalles } = req.body;

    if (!id_proveedor || !fecha_compra || !numero_factura || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({ message: 'Proveedor, fecha, número de factura y al menos un detalle son obligatorios' });
    }

    const totalCompra = parseFloat(req.body.total_compra) || 0;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const compraSql = `
        INSERT INTO compras (id_proveedor, fecha_compra, numero_factura, total_compra)
        VALUES (?, ?, ?, ?)
        `;
        
        const [compraResult] = await connection.query(
            compraSql, 
            [id_proveedor, fecha_compra, numero_factura, totalCompra]
        );
        const id_compra = compraResult.insertId;

        const detallesCompraSql = `
        INSERT INTO detalles_compra (id_compra, id_repuesto, cantidad, precio_compra_sin_iva, iva, precio_compra_con_iva)
        VALUES ?
        `;
        const detallesValues = detalles.map(detalle => [id_compra, detalle.id_repuesto, detalle.cantidad, detalle.precio_compra_sin_iva, detalle.iva, detalle.precio_compra_con_iva]);
        await connection.query(detallesCompraSql, [detallesValues]);

        const actualizarStockSql = `
        UPDATE repuestos
        SET stock_actual = stock_actual + ?
        WHERE id_repuesto = ?
        `;
        for (const detalle of detalles) {
            await connection.query(actualizarStockSql, [detalle.cantidad, detalle.id_repuesto]);
        }

        await connection.commit();
        res.status(201).json({ message: 'Compra creada correctamente', id_compra });

    } catch (error) {
        await connection.rollback();
        console.error('Error al crear la compra:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

// PUT /api/compras/:id
export const updateCompra = async (req, res) => {
    const { id } = req.params;
    const { id_proveedor, fecha_compra, numero_factura, detalles } = req.body;

    if (!id_proveedor || !fecha_compra || !numero_factura || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({ message: 'Proveedor, fecha, número de factura y al menos un detalle son obligatorios' });
    }

    const totalCompra = parseFloat(req.body.total_compra) || 0;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const actualizarCompraSql = `
        UPDATE compras
        SET id_proveedor = ?,
            fecha_compra = ?,
            numero_factura = ?,
            total_compra = ?,
            fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_compra = ?
        `;
        await connection.query(actualizarCompraSql, [id_proveedor, fecha_compra, numero_factura, totalCompra, id]);

        // Obtener los detalles originales de la compra
        const obtenerDetallesOriginalesSql = `
        SELECT id_repuesto, cantidad
        FROM detalles_compra
        WHERE id_compra = ?
        `;

        const [detallesOriginales] = await connection.query(obtenerDetallesOriginalesSql, [id]);
        console.log('Detalles Originales:', detallesOriginales);
        const originalesMap = new Map(detallesOriginales.map(detalle => [detalle.id_repuesto, detalle.cantidad]));
        console.log('Detalles Nuevos (req.body):', detalles);

        // Actualizar stock (Lógica Simplificada)
        const actualizarStockSql = `
        UPDATE repuestos
        SET stock_actual = stock_actual + ?
        WHERE id_repuesto = ?
        `;

        const verificarStockSql = `
        SELECT stock_actual FROM repuestos WHERE id_repuesto = ?
        `;

        // Crear un mapa para rastrear las cantidades procesadas
        const cantidadesProcesadas = new Map();

        // Procesar los detalles y actualizar el stock en una sola pasada
        for (const detalle of detalles) {
            const idRepuesto = detalle.id_repuesto;
            const cantidadNueva = detalle.cantidad;
            const cantidadOriginal = originalesMap.get(idRepuesto);

            // Calcular la diferencia entre la cantidad nueva y la original
            const cantidadAActualizar = cantidadOriginal === undefined 
                ? cantidadNueva // Si es nuevo repuesto, usar cantidad nueva
                : cantidadNueva - cantidadOriginal; // Si ya existía, calcular diferencia

            if (cantidadAActualizar !== 0) {
                // Verificar si ya se procesó esta cantidad para este repuesto
                if (!cantidadesProcesadas.has(idRepuesto) || cantidadesProcesadas.get(idRepuesto) !== cantidadNueva) {
                    // Verificar stock actual antes de actualizar
                    const [stockActual] = await connection.query(verificarStockSql, [idRepuesto]);
                    const nuevoStock = stockActual[0].stock_actual + cantidadAActualizar;

                    // Solo actualizar si el nuevo stock no sería negativo
                    if (nuevoStock >= 0) {
                        await connection.query(actualizarStockSql, [cantidadAActualizar, idRepuesto]);
                    }
                    // Registrar la cantidad procesada
                    cantidadesProcesadas.set(idRepuesto, cantidadNueva);
                }
            }
            
            // Eliminar del mapa de originales para rastrear los que se eliminaron
            originalesMap.delete(idRepuesto);
        }

        // Los repuestos que quedan en originalesMap fueron eliminados de la compra
        for (const [idRepuestoEliminado, cantidadEliminada] of originalesMap) {
            // Verificar si ya se procesó esta cantidad para este repuesto
            if (!cantidadesProcesadas.has(idRepuestoEliminado)) {
                // Verificar stock actual antes de eliminar
                const [stockActual] = await connection.query(verificarStockSql, [idRepuestoEliminado]);
                const nuevoStock = stockActual[0].stock_actual - cantidadEliminada;

                // Solo actualizar si el nuevo stock no sería negativo
                if (nuevoStock >= 0) {
                    await connection.query(actualizarStockSql, [-cantidadEliminada, idRepuestoEliminado]);
                }
            }
        }

        // Eliminar los detalles antiguos e insertar los nuevos
        await connection.query(`DELETE FROM detalles_compra WHERE id_compra = ?`, [id]);
        const insertarDetallesSql = `
        INSERT INTO detalles_compra (id_compra, id_repuesto, cantidad, precio_compra_sin_iva, iva, precio_compra_con_iva)
        VALUES ?
        `;
        const detallesValues = detalles.map(detalle => [id, detalle.id_repuesto, detalle.cantidad, detalle.precio_compra_sin_iva, detalle.iva, detalle.precio_compra_con_iva]);
        await connection.query(insertarDetallesSql, [detallesValues]);

        await connection.commit();
        res.json({ message: 'Compra actualizada exitosamente', id_compra: id });

    } catch (error) {
        await connection.rollback();
        console.error('Error al actualizar la compra:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

// DELETE /api/compras/:id
export const deleteCompra = async (req, res) => {
    const { id } = req.params;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Obtener los detalles de la compra para revertir el stock
        const obtenerDetallesSql = `
        SELECT id_repuesto, cantidad
        FROM detalles_compra
        WHERE id_compra = ?
        `;
        const [detalles] = await connection.query(obtenerDetallesSql, [id]);

        // Revertir el stock de los repuestos
        const revertirStockSql = `
        UPDATE repuestos
        SET stock_actual = stock_actual - ?
        WHERE id_repuesto = ?
        `;
        for (const detalle of detalles) {
            await connection.query(revertirStockSql, [detalle.cantidad, detalle.id_repuesto]);
        }

        // Eliminar los detalles de la compra
        const eliminarDetallesSql = `
        DELETE FROM detalles_compra
        WHERE id_compra = ?
        `;
        await connection.query(eliminarDetallesSql, [id]);

        // Eliminar la compra
        const eliminarCompraSql = `
        DELETE FROM compras
        WHERE id_compra = ?
        `;
        const [compraResult] = await connection.query(eliminarCompraSql, [id]);

        await connection.commit();

        if (compraResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Compra no encontrada' });
        }

        res.json({ message: 'Compra eliminada exitosamente' });

    } catch (error) {
        await connection.rollback();
        console.error('Error al eliminar la compra:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};