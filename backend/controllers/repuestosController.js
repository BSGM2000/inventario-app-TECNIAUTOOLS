// controllers/repuestosController.js
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import db from '../config/db.js';

// GET  /api/repuestos
export const getAllRepuestos = async (req, res) => {
  try {
    const sql = `
      SELECT
        R.id_repuesto,
        R.nombre,
        R.codigo,
        R.descripcion,
        R.stock_actual,
        R.ubicacion,
        R.imagen_url,
        C.nombre AS categoria,
        P.empresa AS proveedor
      FROM repuestos R
      LEFT JOIN categorias C
        ON R.id_categoria = C.id_categoria
      LEFT JOIN proveedores P
        ON R.id_proveedor = P.id_proveedor
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
  let imageUrl = null;
  try {
    // Procesar la imagen si existe
    if (req.file) {
      const inputPath = req.file.path;
      const outputName = `resized-${req.file.filename}`;
      const outputPath = path.join('uploads', outputName);

      await sharp(inputPath)
        .resize(250, 250, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 80 })
        .toFile(outputPath);

      fs.unlinkSync(inputPath);
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${outputName}`;
    }

    const {
      nombre,
      codigo,
      descripcion,
      stock_actual,
      id_categoria,
      id_proveedor,
      ubicacion,
    } = req.body;

    const sql = `
      INSERT INTO repuestos
        (nombre, codigo, descripcion, stock_actual, id_categoria, id_proveedor, ubicacion, imagen_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      nombre,
      codigo,
      descripcion,
      stock_actual,
      id_categoria,
      id_proveedor,
      ubicacion,
      imageUrl,
    ];

    const [result] = await db.query(sql, values);
    res.status(201).json({
      message: "Repuesto creado",
      id_repuesto: result.insertId,
      imagen_url: imageUrl,
    });
  } catch (error) {
    console.error('Error al crear repuesto:', error);
    return res.status(500).json({ error: error.message });
  }
};

// PUT  /api/repuestos/:id
export const updateRepuesto = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    codigo,
    descripcion,
    stock_actual,
    id_categoria,
    id_proveedor,
    ubicacion,
  } = req.body;

  let imageUrl = null;

  try {
    // Obtener la imagen anterior
    const sqlGetImage = 'SELECT imagen_url FROM repuestos WHERE id_repuesto = ?';
    const [imageResults] = await db.query(sqlGetImage, [id]);
    const oldImageUrl = imageResults[0]?.imagen_url;

    if (req.file) {
      // Procesar la nueva imagen
      const inputPath = req.file.path;
      const outputName = `resized-${req.file.filename}`;
      const outputPath = path.join('uploads', outputName);

      await sharp(inputPath)
        .resize({ width: 250,
          height: 250,
          fit:'cover',
          withoutEnlargement: true,
          position: 'center' })
        .jpeg({ quality: 80 })
        .toFile(outputPath);

      fs.unlinkSync(inputPath);
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${outputName}`;

      // Eliminar la imagen anterior si existe
      if (oldImageUrl) {
        const oldImagePath = path.join('uploads', path.basename(oldImageUrl));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Actualizar el repuesto en la base de datos
    let sql = `
      UPDATE repuestos SET
        nombre = ?, codigo = ?, descripcion = ?, stock_actual = ?,
        id_categoria = ?, id_proveedor = ?, ubicacion = ?
    `;

    const values = [
      nombre,
      codigo,
      descripcion,
      stock_actual,
      id_categoria,
      id_proveedor,
      ubicacion,
    ];

    if (imageUrl) {
      sql += `, imagen_url = ?`;
      values.push(imageUrl);
    }

    sql += ` WHERE id_repuesto = ?`;
    values.push(id);

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Repuesto no encontrado' });
    }
    res.json({ message: 'Repuesto actualizado correctamente' });

  } catch (error) {
    console.error('Error al actualizar repuesto:', error);
    res.status(500).json({ error: 'Error al actualizar el repuesto' });
  }
};

// DELETE /api/repuestos/:id
export const deleteRepuesto = async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM repuestos WHERE id_repuesto = ?';

  try {
    const [result] = await db.query(sql, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Repuesto no encontrado' });
    }
    res.json({ message: 'Repuesto eliminado' });
  } catch (error) {
    console.error('Error al eliminar repuesto:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const actualizarStockRepuesto = async (req, res) => {
  const { id } = req.params;
  const { cantidad, operacion } = req.body;
  const repuestoId = parseInt(id);
  const cantidadInt = parseInt(cantidad);

  if (isNaN(repuestoId) || isNaN(cantidadInt) || (!operacion || (operacion !== 'incrementar' && operacion !== 'decrementar'))) {
    return res.status(400).json({ message: 'Datos de actualización inválidos.' });
  }

  let sql = '';
  if (operacion === 'incrementar') {
    sql = 'UPDATE repuestos SET stock_actual = stock_actual + ? WHERE id_repuesto = ?';
  } else if (operacion === 'decrementar') {
    sql = 'UPDATE repuestos SET stock_actual = stock_actual - ? WHERE id_repuesto = ?';
  }

  try {
    const [results] = await db.query(sql, [cantidadInt, repuestoId]);

    if (results.affectedRows > 0) {
      const [repuestoActualizado] = await db.query('SELECT * FROM repuestos WHERE id_repuesto = ?', [repuestoId]);
      res.status(200).json(repuestoActualizado[0] || { message: 'Stock actualizado.' });
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
          res.status(404).json({ message: 'Precio de compra no encontrado para este repuesto.' });
      }
  } catch (error) {
      console.error('Error al obtener precio de compra:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
  }
};