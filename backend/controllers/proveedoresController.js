// controllers/proveedoresController.js
import db from '../config/db.js';

// Obtener todos los proveedores
export const getAllProveedores = async (req, res) => {
  try {
    const sql = `
      SELECT
        id_proveedor,
        empresa,
        nombre,
        contacto,
        direccion
      FROM proveedores
    `;
    const [results] = await db.query(sql);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/proveedores
export const createProveedor = async (req, res) => {
  const { empresa, nombre, contacto, direccion } = req.body;

  // Validación básica (empresa y nombre son obligatorios)
  if (!empresa || !nombre) {
    return res.status(400).json({ message: 'Empresa y nombre son obligatorios' });
  }

  const sql = `
    INSERT INTO proveedores (empresa, nombre, contacto, direccion)
    VALUES (?, ?, ?, ?)
  `;
  const values = [empresa, nombre, contacto || null, direccion || null];

  try {
    const [result] = await db.query(sql, values);
    res.status(201).json({
      message: 'Proveedor creado correctamente',
      id_proveedor: result.insertId,
    });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    return res.status(500).json({ error: error.message });
  }
};

// PUT /api/proveedores/:id
export const updateProveedor = async (req, res) => {
  const { id } = req.params;
  const { empresa, nombre, contacto, direccion } = req.body;

  const sql = `
    UPDATE proveedores SET
      empresa = ?,
      nombre = ?,
      contacto = ?,
      direccion = ?
    WHERE id_proveedor = ?
  `;
  const values = [empresa, nombre, contacto || null, direccion || null, id];

  try {
    const [result] = await db.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    res.json({ message: 'Proveedor actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    return res.status(500).json({ error: error.message });
  }
};

// DELETE /api/proveedores/:id
export const deleteProveedor = async (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM proveedores WHERE id_proveedor = ?
  `;

  try {
    const [result] = await db.query(sql, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    res.json({ message: 'Proveedor eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    return res.status(500).json({ error: error.message });
  }
};