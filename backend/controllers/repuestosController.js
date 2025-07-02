// controllers/repuestosController.js
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import db from '../config/db.js';

// GET /api/repuestos/stock-por-ubicacion/:idRepuesto/:idUbicacion
export const getStockPorUbicacion = async (req, res) => {
  const { idRepuesto, idUbicacion } = req.params;

  try {
    const [result] = await db.query(
      'SELECT stock_actual FROM stock_por_ubicacion WHERE id_repuesto = ? AND id_ubicacion = ?',
      [idRepuesto, idUbicacion]
    );

    if (result.length === 0) {
      return res.json({ stock_actual: 0 });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error al obtener stock por ubicación:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET  /api/repuestos
export const getAllRepuestos = async (req, res) => {
  try {
    const sql = `
      SELECT
        R.id_repuesto,
        R.codigo,
        R.descripcion,
        R.precio,
        C.nombre AS categoria,
        P.empresa AS proveedor,
        CONCAT('[', GROUP_CONCAT(
          JSON_OBJECT(
            'id_ubicacion', U.id_ubicacion,
            'nombre_ubicacion', U.nombre,
            'stock_actual', SPU.stock_actual
          )
        ), ']') as stocks
      FROM repuestos R
      LEFT JOIN categorias C ON R.id_categoria = C.id_categoria
      LEFT JOIN proveedores P ON R.id_proveedor = P.id_proveedor
      LEFT JOIN stock_por_ubicacion SPU ON R.id_repuesto = SPU.id_repuesto
      LEFT JOIN ubicaciones U ON SPU.id_ubicacion = U.id_ubicacion
      GROUP BY R.id_repuesto
    `;
    const [results] = await db.query(sql);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener repuestos:', error);
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/repuestos
export const createRepuesto = async (req, res) => {
  try {
    const {
      codigo,
      descripcion,
      precio,
      id_categoria,
      id_proveedor,
    } = req.body;

    let stocks;
    try {
      stocks = JSON.parse(req.body.stocks);
    } catch (error) {
      return res.status(400).json({ error: 'El campo stocks debe ser un array JSON válido' });
    }

    // Validar que stocks sea un array
    if (!Array.isArray(stocks)) {
      return res.status(400).json({ error: 'El campo stocks debe ser un array' });
    }

    // Validar que cada stock tenga id_ubicacion y stock_actual
    for (const stock of stocks) {
      if (!stock.id_ubicacion || stock.stock_actual === undefined) {
        return res.status(400).json({ 
          error: 'Cada stock debe tener id_ubicacion y stock_actual',
          stock_invalido: stock
        });
      }
    }

    // Iniciar transacción
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Insertar repuesto
      const [result] = await connection.query(
        'INSERT INTO repuestos (codigo, descripcion, precio, id_categoria, id_proveedor) VALUES (?, ?, ?, ?, ?)',
        [codigo, descripcion, precio, id_categoria, id_proveedor]
      );

      const repuestoId = result.insertId;

      // Insertar stock por ubicación
      const stockValues = stocks.map(stock => [repuestoId, stock.id_ubicacion, stock.stock_actual]);
      await connection.query(
        'INSERT INTO stock_por_ubicacion (id_repuesto, id_ubicacion, stock_actual) VALUES ?',
        [stockValues]
      );

      await connection.commit();
      res.status(201).json({
        message: "Repuesto creado",
        id_repuesto: repuestoId,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error al crear repuesto:', error);
    return res.status(500).json({ error: error.message });
  }
};

// PUT  /api/repuestos/:id
export const updateRepuesto = async (req, res) => {
  const { id } = req.params;
  const {
    codigo,
    descripcion,
    precio,
    id_categoria,
    id_proveedor,
  } = req.body;


  try {
    // Validar y parsear el array de stocks
    let stocks;
    try {
      stocks = JSON.parse(req.body.stocks);
    } catch (error) {
      return res.status(400).json({ error: 'El campo stocks debe ser un array JSON válido' });
    }

    // Validar que stocks sea un array
    if (!Array.isArray(stocks)) {
      return res.status(400).json({ error: 'El campo stocks debe ser un array' });
    }

    // Validar que cada stock tenga id_ubicacion y stock_actual
    for (const stock of stocks) {
      if (!stock.id_ubicacion || stock.stock_actual === undefined) {
        return res.status(400).json({
          error: 'Cada stock debe tener id_ubicacion y stock_actual',
          stock_invalido: stock
        });
      }
    }


    // Iniciar transacción
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Actualizar el repuesto en la base de datos
      let sql = `
        UPDATE repuestos SET
          codigo = ?,
          descripcion = ?,
          precio = ?,
          id_categoria = ?, id_proveedor = ?
      `;

      const values = [
        codigo,
        descripcion,
        precio,
        id_categoria,
        id_proveedor,
      ];


      sql += ` WHERE id_repuesto = ?`;
      values.push(id);

      await connection.query(sql, values);

      // Eliminar stocks anteriores
      await connection.query('DELETE FROM stock_por_ubicacion WHERE id_repuesto = ?', [id]);

      // Insertar nuevos stocks
      const stockValues = stocks.map(stock => [id, stock.id_ubicacion, stock.stock_actual]);
      await connection.query(
        'INSERT INTO stock_por_ubicacion (id_repuesto, id_ubicacion, stock_actual) VALUES ?',
        [stockValues]
      );

      await connection.commit();
      res.json({ message: 'Repuesto actualizado correctamente' });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error al actualizar repuesto:', error);
    res.status(500).json({ error: 'Error al actualizar el repuesto' });
  }
};

// DELETE /api/repuestos/:id
export const deleteRepuesto = async (req, res) => {
  const { id } = req.params;

  // Iniciar transacción
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // Primero eliminar los registros relacionados en stock_por_ubicacion
    await connection.query('DELETE FROM stock_por_ubicacion WHERE id_repuesto = ?', [id]);

    // Luego eliminar el repuesto
    const [result] = await connection.query('DELETE FROM repuestos WHERE id_repuesto = ?', [id]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: 'Repuesto no encontrado' });
    }

    await connection.commit();
    connection.release();
    res.json({ message: 'Repuesto eliminado correctamente' });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error al eliminar repuesto:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const actualizarStockRepuesto = async (req, res) => {
  const { id } = req.params;
  const { cantidad, operacion, id_ubicacion } = req.body;
  const repuestoId = parseInt(id);
  const cantidadInt = parseInt(cantidad);

  if (isNaN(repuestoId) || isNaN(cantidadInt) || !id_ubicacion || 
      (!operacion || (operacion !== 'incrementar' && operacion !== 'decrementar'))) {
    return res.status(400).json({ message: 'Datos de actualización inválidos.' });
  }

  let sql = '';
  if (operacion === 'incrementar') {
    sql = 'UPDATE stock_por_ubicacion SET stock_actual = stock_actual + ? WHERE id_repuesto = ? AND id_ubicacion = ?';
  } else if (operacion === 'decrementar') {
    sql = 'UPDATE stock_por_ubicacion SET stock_actual = stock_actual - ? WHERE id_repuesto = ? AND id_ubicacion = ?';
  }

  try {
    const [results] = await db.query(sql, [cantidadInt, repuestoId, id_ubicacion]);

    if (results.affectedRows > 0) {
      const [stockActualizado] = await db.query(
        `SELECT R.*, SPU.stock_actual, U.nombre as ubicacion
          FROM repuestos R
          JOIN stock_por_ubicacion SPU ON R.id_repuesto = SPU.id_repuesto
          JOIN ubicaciones U ON SPU.id_ubicacion = U.id_ubicacion
          WHERE R.id_repuesto = ? AND SPU.id_ubicacion = ?`,
        [repuestoId, id_ubicacion]
      );
      res.status(200).json(stockActualizado[0] || { message: 'Stock actualizado.' });
    } else {
      res.status(404).json({ message: 'Repuesto no encontrado o no se realizaron cambios.' });
    }
  } catch (error) {
    console.error('Error al actualizar el stock del repuesto:', error);
    return res.status(500).json({ message: 'Error al actualizar el stock del repuesto.' });
  }
};

export const precioCompraSinIva = async (req, res) => {
  const { id_repuesto } = req.params;

  try {
      // Primero intentamos obtener el último precio de compra
      const [rows] = await db.query(
          `SELECT d.precio_compra_sin_iva
            FROM detalles_compra d
            JOIN compras c ON d.id_compra = c.id_compra
            WHERE d.id_repuesto = ?
            ORDER BY c.fecha_compra DESC, c.id_compra DESC
            LIMIT 1`,
          [id_repuesto]
      );

      if (rows.length > 0) {
          res.json({ precio_compra_sin_iva: rows[0].precio_compra_sin_iva });
      } else {
          // Si no hay historial de compras, obtenemos el precio inicial del repuesto
          const [repuesto] = await db.query(
              'SELECT precio FROM repuestos WHERE id_repuesto = ?',
              [id_repuesto]
          );

          if (repuesto.length > 0) {
              res.json({ precio_compra_sin_iva: repuesto[0].precio });
          } else {
              res.status(404).json({ message: 'Repuesto no encontrado.' });
          }
      }
  } catch (error) {
      console.error('Error al obtener precio de compra:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
export const trasladarStock = async (req, res) => {
  const {
    id_repuesto,
    ubicacion_origen,
    ubicacion_destino,
    cantidad
  } = req.body;

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
      'INSERT INTO movimientos_inventario (id_repuesto, ubicacion_origen, ubicacion_destino, cantidad, tipo_movimiento, fecha_movimiento, usuario_id) VALUES (?, ?, ?, ?, "TRASLADO", NOW(), ?)',
      [id_repuesto, ubicacion_origen, ubicacion_destino, cantidad, req.usuario.id]
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
