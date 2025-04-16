// controllers/repuestosController.js
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import db from '../config/db.js';

// GET  /api/repuestos
export const getAllRepuestos = (req, res) => {
  const sql = 'SELECT * FROM Repuestos';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener repuestos:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// POST /api/repuestos
export const createRepuesto = async (req, res) => {
  try{
    //Procesar la imagen si existe
    let imageUrl = null;
    if(req.file){
      const inputPath = req.file.path;
      const outputName = `resized-${req.file.filename}`;
      const outputPath = path.join('uploads', outputName);

      //redimensionar la imagen
      await sharp(inputPath)
        .resize({width: 800})
        .jpeg({quality: 80})
        .toFile(outputPath);
      //Eliminar la imagen original
      fs.unlinkSync(inputPath);

      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${outputName}`;
  }

  const {
    nombre,
    descripcion,
    precio,
    stock_actual,
    id_categoria,
    id_proveedor,
    ubicacion,
  } = req.body;

  const sql = `
    INSERT INTO Repuestos
      (nombre, descripcion, precio, stock_actual, id_categoria, id_proveedor, ubicacion, imagen_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    nombre,
    descripcion,
    precio,
    stock_actual,
    id_categoria,
    id_proveedor,
    ubicacion,
    imageUrl,
  ];
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
      message: "Repuesto creado",
      id_repuesto: result.insertId,
      imagen_url: imageUrl,
    });
  });
}catch (error) {
    console.error('Error al crear repuesto:', error);
    return res.status(500).json({ error: 'Error al procesar la imagen' });
  }
}
// PUT  /api/repuestos/:id
export const updateRepuesto = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    descripcion,
    precio,
    stock_actual,
    id_categoria,
    id_proveedor,
    ubicacion,
  } = req.body;

  let imageUrl = null;

  try {
    // Obtener la imagen anterior
    const sqlGetImage = 'SELECT imagen_url FROM Repuestos WHERE id_repuesto = ?';
    db.query(sqlGetImage, [id], async (err, results) => {
      if (err) {
        console.error('Error al obtener la imagen anterior:', err);
        return res.status(500).json({ error: 'Error al obtener la imagen anterior' });
      }

      const oldImageUrl = results[0]?.imagen_url;
      if (req.file) {
        // Procesar la nueva imagen
        const inputPath = req.file.path;
        const outputName = `resized-${req.file.filename}`;
        const outputPath = path.join('uploads', outputName);

        await sharp(inputPath)
          .resize({ width: 250,
            height: 250,
            fit:'inside',
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
        UPDATE Repuestos SET
          nombre = ?, descripcion = ?, precio = ?, stock_actual = ?,
          id_categoria = ?, id_proveedor = ?, ubicacion = ?
      `;

      const values = [
        nombre,
        descripcion,
        precio,
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

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error('Error al actualizar repuesto:', err);
          return res.status(500).json({ error: 'Error al actualizar el repuesto' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Repuesto no encontrado' });
        }
        res.json({ message: 'Repuesto actualizado correctamente' });
      });
    });
  } catch (error) {
    console.error('Error inesperado:', error);
    res.status(500).json({ error: 'Error inesperado en el servidor' });
  }
};

// DELETE /api/repuestos/:id
export const deleteRepuesto = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM Repuestos WHERE id_repuesto = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar repuesto:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Repuesto no encontrado' });
    }
    res.json({ message: 'Repuesto eliminado' });
  });
};
