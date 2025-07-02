// controllers/movimientosController.js
import db from '../config/db.js';

// GET /api/movimientos
export const getAllMovimientos = async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT 
        m.*,
        r.descripcion as descripcion_repuesto,
        r.codigo as codigo_repuesto,
        uo.nombre as nombre_ubicacion_origen,
        ud.nombre as nombre_ubicacion_destino,
        u.nombre as nombre_usuario,
        CASE 
          WHEN m.tipo_movimiento = 'COMPRA' THEN c.numero_factura
          WHEN m.tipo_movimiento = 'VENTA' THEN v.numero_factura
          ELSE NULL
        END as numero_documento
      FROM movimientos_inventario m
      LEFT JOIN repuestos r ON m.id_repuesto = r.id_repuesto
      LEFT JOIN ubicaciones uo ON m.ubicacion_origen = uo.id_ubicacion
      LEFT JOIN ubicaciones ud ON m.ubicacion_destino = ud.id_ubicacion
      LEFT JOIN usuarios u ON m.usuario_id = u.id_usuario
      LEFT JOIN compras c ON (m.tipo_movimiento = 'COMPRA' AND m.id_documento = c.id_compra)
      LEFT JOIN ventas v ON (m.tipo_movimiento = 'VENTA' AND m.id_documento = v.id_venta)
      ORDER BY m.fecha_movimiento DESC`
    );
    res.json(results);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/movimientos/traslado
export const realizarTraslado = async (req, res) => {
  const { id_repuesto, ubicacion_origen, ubicacion_destino, cantidad } = req.body;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Verificar stock disponible
    const [stockOrigen] = await connection.query(
      'SELECT stock_actual FROM stock_por_ubicacion WHERE id_repuesto = ? AND id_ubicacion = ?',
      [id_repuesto, ubicacion_origen]
    );

    if (!stockOrigen.length || stockOrigen[0].stock_actual < cantidad) {
      throw new Error('Stock insuficiente en ubicación origen');
    }

    // Reducir stock en origen
    await connection.query(
      'UPDATE stock_por_ubicacion SET stock_actual = stock_actual - ? WHERE id_repuesto = ? AND id_ubicacion = ?',
      [cantidad, id_repuesto, ubicacion_origen]
    );

    // Aumentar stock en destino
    await connection.query(
      'INSERT INTO stock_por_ubicacion (id_repuesto, id_ubicacion, stock_actual) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE stock_actual = stock_actual + ?',
      [id_repuesto, ubicacion_destino, cantidad, cantidad]
    );

    // Registrar movimiento
    await connection.query(
      'INSERT INTO movimientos_inventario (id_repuesto, ubicacion_origen, ubicacion_destino, cantidad, tipo_movimiento, id_documento, fecha_movimiento, usuario_id, observaciones) VALUES (?, ?, ?, ?, "TRASLADO", NULL, NOW(), ?, "Traslado de stock entre ubicaciones")',
      [id_repuesto, ubicacion_origen, ubicacion_destino, cantidad, req.userId]
    );

    await connection.commit();
    res.json({ message: 'Traslado realizado con éxito' });

  } catch (error) {
    await connection.rollback();
    console.error('Error en el traslado:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// POST /api/movimientos/ajuste
export const realizarAjuste = async (req, res) => {
  const { id_repuesto, id_ubicacion, cantidad, tipo_ajuste, motivo } = req.body;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Verificar stock actual
    const [stockActual] = await connection.query(
      'SELECT stock_actual FROM stock_por_ubicacion WHERE id_repuesto = ? AND id_ubicacion = ?',
      [id_repuesto, id_ubicacion]
    );

    let stockFinal = 0;
    if (stockActual.length > 0) {
      stockFinal = tipo_ajuste === 'incremento' 
        ? stockActual[0].stock_actual + cantidad
        : stockActual[0].stock_actual - cantidad;

      if (stockFinal < 0) {
        throw new Error('El ajuste resultaría en stock negativo');
      }

      // Actualizar stock
      await connection.query(
        'UPDATE stock_por_ubicacion SET stock_actual = ? WHERE id_repuesto = ? AND id_ubicacion = ?',
        [stockFinal, id_repuesto, id_ubicacion]
      );
    } else {
      if (tipo_ajuste === 'decremento') {
        throw new Error('No hay stock para realizar el ajuste');
      }
      // Crear nuevo registro de stock
      await connection.query(
        'INSERT INTO stock_por_ubicacion (id_repuesto, id_ubicacion, stock_actual) VALUES (?, ?, ?)',
        [id_repuesto, id_ubicacion, cantidad]
      );
      stockFinal = cantidad;
    }

    // Registrar movimiento
    await connection.query(
      'INSERT INTO movimientos_inventario (id_repuesto, ubicacion_origen, ubicacion_destino, cantidad, tipo_movimiento, id_documento, fecha_movimiento, usuario_id, observaciones) VALUES (?, ?, ?, ?, "AJUSTE", NULL, NOW(), ?, ?)',
      [id_repuesto, id_ubicacion, id_ubicacion, cantidad, req.userId, motivo]
    );

    await connection.commit();
    res.json({ 
      message: 'Ajuste realizado con éxito',
      stock_final: stockFinal
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error en el ajuste:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};