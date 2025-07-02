import db from '../config/db.js';

export const getComprasStats = async (req, res) => {
    try {
        const [totalResult] = await db.query(
            'SELECT COALESCE(SUM(total_compra), 0) as total FROM compras WHERE MONTH(fecha_compra) = MONTH(CURRENT_DATE())'
        );

        const [ultimasCompras] = await db.query(
            `SELECT c.id_compra, c.total_compra, p.nombre as proveedor, c.fecha_compra
                FROM compras c 
                JOIN proveedores p ON c.id_proveedor = p.id_proveedor 
                ORDER BY c.fecha_compra DESC LIMIT 5`
        );

        res.json({
            total: totalResult[0].total,
            ultimasCompras
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de compras:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas de compras' });
    }
};

export const getVentasStats = async (req, res) => {
    try {
        const [totalResult] = await db.query(
            'SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE MONTH(fecha_venta) = MONTH(CURRENT_DATE())'
        );

        const [ultimasVentas] = await db.query(
            `SELECT v.id_venta, v.total, c.ciudad, c.nombre as cliente 
                FROM ventas v 
                JOIN clientes c ON v.id_cliente = c.id_cliente 
                ORDER BY v.fecha_venta DESC LIMIT 5`
        );

        res.json({
            total: totalResult[0].total,
            ultimasVentas
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de ventas:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas de ventas' });
    }
};

export const getRepuestosBajoStock = async (req, res) => {
    try {
        const [repuestos] = await db.query(
            `SELECT s.id_repuesto, r.descripcion, r.codigo, s.id_ubicacion, s.stock_actual, u.nombre as ubicacion
                FROM stock_por_ubicacion s
                JOIN repuestos r ON s.id_repuesto = r.id_repuesto
                JOIN ubicaciones u ON s.id_ubicacion = u.id_ubicacion
                WHERE s.stock_actual <= 10 
                ORDER BY s.stock_actual ASC 
                LIMIT 10`
        );

        res.json(repuestos);
    } catch (error) {
        console.error('Error al obtener repuestos con bajo stock:', error);
        res.status(500).json({ message: 'Error al obtener repuestos con bajo stock' });
    }
};

