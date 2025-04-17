import db from '../config/db.js';

// GET /api/clientes
export const getAllClients = (req, res) => {
  const sql = `
    SELECT 
      id_cliente,
      nombre,
      contacto,
      direccion,
      otros_datos
    FROM clientes
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener clientes:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// POST /api/clientes
export const createClient = (req, res) => {
  const { nombre, contacto, direccion, otros_datos } = req.body;

  // Validación básica
  if (!nombre || !contacto) {
    return res.status(400).json({ message: 'Nombre y contacto son obligatorios' });
  }

  const sql = `
    INSERT INTO clientes
      (nombre, contacto, direccion, otros_datos)
    VALUES (?, ?, ?, ?)
  `;
  const values = [nombre, contacto, direccion || null, otros_datos || null];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error al crear cliente:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: 'Cliente creado',
      id_cliente: result.insertId,
    });
  });
};

// PUT /api/clientes/:id
export const updateClient = (req, res) => {
  const { id } = req.params;
  const { nombre, contacto, direccion, otros_datos } = req.body;

  let sql = `
    UPDATE clientes SET
      nombre = ?,
      contacto = ?,
      direccion = ?,
      otros_datos = ?
    WHERE id_cliente = ?
  `;
  const values = [nombre, contacto, direccion || null, otros_datos || null, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error al actualizar cliente:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente actualizado correctamente' });
  });
};

// DELETE /api/clientes/:id
export const deleteClient = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM clientes WHERE id_cliente = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar cliente:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente eliminado correctamente' });
  });
};