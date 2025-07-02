// controllers/clientsController.js
import db from '../config/db.js';

// GET /api/clientes
export const getAllClients = async (req, res) => {
  try {
    const sql = `
      SELECT
        id_cliente,
        codigo_cliente,
        nombre,
        documento_cliente,
        ciudad,
        direccion,
        telefono,
        correo
      FROM clientes
    `;
    const [results] = await db.query(sql);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return res.status(500).json({ error: error.message });
  }
};
export const getClientById = async (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM clientes WHERE id_cliente = ?';
    try {
      const [results] = await db.query(sql, [id]);
      res.json(results[0]);
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      return res.status(500).json({ error: error.message });
    }
  };
// POST /api/clientes
export const createClient = async (req, res) => {
  const { codigo_cliente, nombre, documento_cliente, ciudad, direccion, telefono, correo } = req.body;

  // Validación básica (nombre y documento_cliente son obligatorios)
  if (!nombre || !documento_cliente) {
    return res.status(400).json({ message: 'Nombre y documento son obligatorios' });
  }

  const sql = `
    INSERT INTO clientes (codigo_cliente, nombre, documento_cliente, ciudad, direccion, telefono, correo)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [codigo_cliente, nombre, documento_cliente, ciudad || null, direccion || null, telefono || null, correo || null];

  try {
    const [result] = await db.query(sql, values);
    res.status(201).json({
      message: 'Cliente creado correctamente',
      id_cliente: result.insertId, // Obtener el ID generado automáticamente
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return res.status(500).json({ error: error.message });
  }
};

// PUT /api/clientes/:id
export const updateClient = async (req, res) => {
  const { id } = req.params;
  const { nombre, codigo_cliente, documento_cliente, ciudad, direccion, telefono, correo } = req.body;

  const sql = `
    UPDATE clientes SET
      nombre = ?,
      codigo_cliente = ?,
      documento_cliente = ?,
      ciudad = ?,
      direccion = ?,
      telefono = ?,
      correo = ?
    WHERE id_cliente = ?
  `;
  const values = [nombre, codigo_cliente, documento_cliente, ciudad || null, direccion || null, telefono || null, correo || null, id];

  try {
    const [result] = await db.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    return res.status(500).json({ error: error.message });
  }
};

// DELETE /api/clientes/:id
export const deleteClient = async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM clientes WHERE id_cliente = ?';

  try {
    const [result] = await db.query(sql, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    return res.status(500).json({ error: error.message });
  }
};