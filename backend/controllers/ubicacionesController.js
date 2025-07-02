// controllers/ubicacionesController.js
import db from '../config/db.js';

// GET /api/ubicaciones
export const getAllUbicaciones = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM ubicaciones');
    res.json(results);
  } catch (error) {
    console.error('Error al obtener ubicaciones:', error);
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/ubicaciones
export const createUbicacion = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const [result] = await db.query(
      'INSERT INTO ubicaciones (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion]
    );
    res.status(201).json({
      id_ubicacion: result.insertId,
      nombre,
      descripcion
    });
  } catch (error) {
    console.error('Error al crear ubicación:', error);
    return res.status(500).json({ error: error.message });
  }
};

// PUT /api/ubicaciones/:id
export const updateUbicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    await db.query(
      'UPDATE ubicaciones SET nombre = ?, descripcion = ? WHERE id_ubicacion = ?',
      [nombre, descripcion, id]
    );
    res.json({ message: 'Ubicación actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar ubicación:', error);
    return res.status(500).json({ error: error.message });
  }
};

// DELETE /api/ubicaciones/:id
export const deleteUbicacion = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM ubicaciones WHERE id_ubicacion = ?', [id]);
    res.json({ message: 'Ubicación eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar ubicación:', error);
    return res.status(500).json({ error: error.message });
  }
};